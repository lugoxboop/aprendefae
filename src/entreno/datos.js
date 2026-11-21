import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS SALAS DE ENTRENAMIENTO — EL LADO DEL SITIO DE LA 0172 (pedido de Mateo,
 * 20-nov). Lobby con mascotas y partida de preguntas entre amigos.
 *
 * Igual que la Clase en vivo: todo lo que importa (quién acertó, cuántos
 * puntos, cuándo se cierra) lo decide la base. Aquí solo se llama a sus
 * funciones y se avisa por un canal a los demás celulares de que algo cambió.
 * El aviso no lleva datos; si no llega, cada celular pregunta solo.
 *
 * La partida avanza sola: cada celular pide «resultados» al acabarse el tiempo
 * (o al responder el último) y «siguiente» a los 7 s. La base decide si toca.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const RESPALDO_MS = { lobby: 2000, final: 2000, pregunta: 1500, otro: 2500 };
export const PAUSA_RESULTADOS_MS = 7000;
export const MAX_JUGADORES = 12;

export const limpiarCodigo = (texto) => String(texto ?? "").replace(/\D/g, "").slice(0, 6);

export function mensajeSala(error) {
  const m = String(error?.message ?? error ?? "");
  if (/sala abierta con ese código|^codigo$/i.test(m)) return "No hay ninguna sala abierta con ese código.";
  if (/ya empezó/i.test(m)) return "Esa partida ya empezó. Pide que te esperen en la próxima.";
  if (/llena/i.test(m)) return "La sala está llena (máximo 12).";
  if (/Sin sesión/i.test(m)) return "Necesitas iniciar sesión para entrar.";
  if (/No estás en esta sala|No tienes invitación/i.test(m)) return "Ya no estás en esa sala.";
  if (/Hace falta al menos otro/i.test(m)) return "Hace falta al menos otro jugador para empezar.";
  if (/Demasiados/i.test(m)) return "Muchos intentos seguidos. Espera unos minutos.";
  return "No se pudo conectar con la sala. Inténtalo otra vez.";
}

async function rpc(nombre, args, cliente = supabase) {
  if (!cliente) return { error: new Error("Sin conexión con el servidor") };
  const { data, error } = await cliente.rpc(nombre, args);
  return error ? { error } : { data };
}

export const crearSala = ({ nombre, materia, tema, temaTitulo, duracion, preguntas, invitar = [], demos = [] }, c) =>
  rpc("entreno_crear", { p_nombre: nombre, p_materia: materia, p_tema: tema, p_tema_titulo: temaTitulo, p_duracion: duracion,
    p_preguntas: preguntas, p_invitar: invitar, p_demos: demos }, c);
export const invitar = (sala, invitarIds = [], demos = [], c) => rpc("entreno_invitar", { p_sala: sala, p_invitar: invitarIds, p_demos: demos }, c);
export const entrar = (sala, c) => rpc("entreno_entrar", { p_sala: sala }, c);
export async function unirse(codigo, c) {
  const r = await rpc("entreno_unirse", { p_codigo: limpiarCodigo(codigo) }, c);
  if (r.data?.error === "codigo") return { error: new Error("codigo") };
  return r;
}
export const rechazar = (sala, c) => rpc("entreno_rechazar", { p_sala: sala }, c);
/*
 * Los emotes (0173): los doce festejos que ya bailan las mascotas
 * (FESTEJOS de mascota/marionetas.js). Se ven 5 s en todos los celulares.
 */
export const EMOTES = [
  { id: "baila", emoji: "💃", nombre: "Bailar" },
  { id: "saluda", emoji: "👋", nombre: "Saludar" },
  { id: "celebra", emoji: "🤸", nombre: "Voltereta" },
  { id: "saltitos", emoji: "⭐", nombre: "Saltitos" },
  { id: "colita", emoji: "💖", nombre: "Colita" },
  { id: "canta", emoji: "🎵", nombre: "Cantar" },
  { id: "karaoke", emoji: "🎤", nombre: "Karaoke" },
  { id: "campeon", emoji: "🏆", nombre: "Campeón" },
  { id: "graduado", emoji: "🎓", nombre: "Birrete" },
  { id: "fiesta", emoji: "🥳", nombre: "Fiesta" },
  { id: "globo", emoji: "🎈", nombre: "Globo" },
  { id: "porra", emoji: "📣", nombre: "Porra" },
];
export const EMOTE_MS = 5000;
export const emojiDe = (id) => EMOTES.find((e) => e.id === id)?.emoji ?? "";
export const hacerEmote = (sala, emote, c) => rpc("entreno_emote", { p_sala: sala, p_emote: emote }, c);

/** Mezcla mi emote local (se ve al instante, sin esperar a la base) con lo que dice la base. */
export function conEmoteLocal(jugadores = [], local, ahora = Date.now()) {
  if (!local || ahora > local.hasta) return jugadores;
  return jugadores.map((j) => (j.soy_yo ? { ...j, emote: local.emote, emote_en: local.desde } : j));
}

export const marcarListo = (sala, listo, c) => rpc("entreno_listo", { p_sala: sala, p_listo: listo }, c);
export const salir = (sala, c) => rpc("entreno_salir", { p_sala: sala }, c);
export const cambiarActividad = (sala, { materia, tema, temaTitulo, duracion, preguntas }, c) =>
  rpc("entreno_actividad", { p_sala: sala, p_materia: materia, p_tema: tema, p_tema_titulo: temaTitulo, p_duracion: duracion, p_preguntas: preguntas }, c);
export const responder = (sala, indice, opcion, c) => rpc("entreno_responder", { p_sala: sala, p_indice: indice, p_opcion: opcion }, c);
export const avanzar = (sala, accion, c) => rpc("entreno_avanzar", { p_sala: sala, p_accion: accion }, c);
export const leerEstado = (sala, c) => rpc("entreno_estado", { p_sala: sala }, c);
export const misSalas = (c) => rpc("entreno_mis_salas", {}, c);
export const amigosParaInvitar = (c) => rpc("amigos_inicio", {}, c);

export function canalDeSala(salaId, alOir, cliente = supabase) {
  if (!cliente?.channel || !salaId) return { avisar: () => {}, cerrar: () => {} };
  const canal = cliente.channel(`entreno-${salaId}`, { config: { broadcast: { self: false } } });
  if (alOir) canal.on("broadcast", { event: "cambio" }, () => alOir());
  canal.subscribe();
  return {
    avisar: () => { try { canal.send({ type: "broadcast", event: "cambio", payload: {} }); } catch { /* el respaldo lo cubre */ } },
    cerrar: () => { try { cliente.removeChannel(canal); } catch { /* nada que cerrar */ } },
  };
}

export const desfaseDe = (estado, ahora = Date.now()) => (estado?.ahora ? Date.parse(estado.ahora) - ahora : 0);

/** Milisegundos que faltan para que abra la pregunta (la cuenta atrás). */
export function faltaParaAbrir(estado, desfase, ahora = Date.now()) {
  if (!estado?.inicio || estado.estado !== "pregunta") return 0;
  return Math.max(0, Date.parse(estado.inicio) - (ahora + desfase));
}

/** Milisegundos que le quedan a la pregunta abierta. */
export function restanteMs(estado, desfase, ahora = Date.now()) {
  if (!estado?.inicio || estado.estado !== "pregunta") return 0;
  const fin = Date.parse(estado.inicio) + estado.duracion_s * 1000;
  return Math.max(0, Math.min(estado.duracion_s * 1000, fin - (ahora + desfase)));
}

/** Milisegundos que faltan para que cualquiera pueda pasar a la siguiente. */
export function faltaSiguiente(estado, desfase, ahora = Date.now()) {
  if (!estado?.fase_desde || estado.estado !== "resultados") return 0;
  return Math.max(0, Date.parse(estado.fase_desde) + PAUSA_RESULTADOS_MS - (ahora + desfase));
}

/** La tabla de la partida: por puntos, luego aciertos, luego apodo. Con puesto (empates comparten). */
export function tabla(jugadores = []) {
  const orden = [...jugadores].sort((a, b) => (b.puntos - a.puntos) || (b.aciertos - a.aciertos) || String(a.apodo).localeCompare(String(b.apodo)));
  let puesto = 0, previo = null;
  return orden.map((j, k) => {
    if (!previo || previo.puntos !== j.puntos || previo.aciertos !== j.aciertos) puesto = k + 1;
    previo = j;
    return { ...j, puesto };
  });
}

/** «Duelo»: una sala de dos (contando a los invitados que aún no entran). */
export const esDuelo = (estado) => (estado?.jugadores?.length ?? 0) + (estado?.invitados?.length ?? 0) <= 2;

/*
 * El estado de una sala, al día: lo pide al entrar, lo vuelve a pedir cuando
 * alguien avisa por el canal, y de respaldo cada pocos segundos.
 */
export function useSalaEntreno(salaId, { cliente = supabase, inicial = null } = {}) {
  const [estado, setEstado] = useState(inicial);
  const [error, setError] = useState(null);
  const desfase = useRef(desfaseDe(inicial));
  const canal = useRef(null);
  const vivo = useRef(true);
  const ultimaHora = useRef(inicial?.ahora ? Date.parse(inicial.ahora) : 0);
  const enCurso = useRef(null);

  const aplicar = useCallback((e) => {
    if (!e) return;
    const hora = e.ahora ? Date.parse(e.ahora) : 0;
    if (hora && hora < ultimaHora.current) return;
    if (hora) ultimaHora.current = hora;
    desfase.current = desfaseDe(e);
    setEstado(e);
    setError(null);
  }, []);

  const refrescar = useCallback(async () => {
    if (!salaId) return null;
    if (enCurso.current) return enCurso.current;
    enCurso.current = (async () => {
      const { data, error: e } = await leerEstado(salaId, cliente);
      if (!vivo.current) return null;
      if (e) { setError(e); return null; }
      aplicar(data);
      return data;
    })();
    try { return await enCurso.current; } finally { enCurso.current = null; }
  }, [salaId, cliente, aplicar]);

  useEffect(() => {
    vivo.current = true;
    if (!salaId) return undefined;
    canal.current = canalDeSala(salaId, refrescar, cliente);
    if (!inicial) refrescar();
    return () => { vivo.current = false; canal.current?.cerrar(); canal.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaId, cliente]);

  const fase = estado?.estado;
  useEffect(() => {
    if (!salaId || !fase || fase === "cerrada") return undefined;
    const t = setInterval(refrescar, RESPALDO_MS[fase] ?? RESPALDO_MS.otro);
    return () => clearInterval(t);
  }, [salaId, fase, refrescar]);

  /* Hace algo en la base, aplica lo que devuelve y avisa a los demás. */
  const hacer = useCallback(async (promesa) => {
    const r = await promesa;
    if (r?.data?.sala_id) aplicar(r.data);
    if (!r?.error) canal.current?.avisar();
    return r;
  }, [aplicar]);

  return { estado, error, refrescar, aplicar, hacer, desfase };
}

/** Un reloj que repinta cada `cada` ms mientras `activo`. */
export function useReloj(activo, cada = 200) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!activo) return undefined;
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), cada);
    return () => clearInterval(t);
  }, [activo, cada]);
  return activo ? Math.max(ahora, Date.now()) : ahora;
}

/** Las invitaciones que me esperan y la sala donde estoy (para Amigos y la portada). */
export function useMisSalas(activo = true) {
  const [datos, setDatos] = useState({ invitaciones: [], actual: null });
  const recargar = useCallback(async () => {
    if (!activo) return;
    const { data } = await misSalas();
    if (data) setDatos({ invitaciones: Array.isArray(data.invitaciones) ? data.invitaciones : [], actual: data.actual ?? null });
  }, [activo]);
  useEffect(() => { recargar(); }, [recargar]);
  return { ...datos, recargar };
}
