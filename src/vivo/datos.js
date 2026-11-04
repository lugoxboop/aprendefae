import { supabase } from "../lib/supabase.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CLASE EN VIVO — EL LADO DEL SITIO DE LA 0159 (encargo de Mateo, 4-nov).
 *
 * Todo lo que importa (quién acertó, cuántos puntos, cuándo se cierra una
 * pregunta) lo decide la base. Aquí solo se llama a sus funciones y se avisa a
 * los demás celulares de que algo cambió.
 *
 * ═══════════ EL AVISO Y EL RESPALDO ═══════════
 *
 * El profesor, cada vez que mueve la clase, difunde «cambió» por un canal de
 * Supabase con el id de la sala. Cada celular, al oírlo, vuelve a pedir el
 * estado. Ese aviso no lleva datos: si alguien lo inventara, lo único que
 * conseguiría es que los celulares preguntaran una vez más. Si el aviso no
 * llega (el wifi del salón), cada celular pregunta solo cada pocos segundos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Cada cuánto pregunta un celular si no oyó el aviso, según el momento. */
export const RESPALDO_MS = { pregunta: 2500, otro: 4000 };

/** Las letras de las opciones: el color ayuda, la letra es la que manda. */
export const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** Se quita todo lo que no sea cifra y se deja en 6. */
export const limpiarCodigo = (texto) => String(texto ?? "").replace(/\D/g, "").slice(0, 6);

/** Traduce el error de la base a algo que un estudiante entienda. */
export function mensajeDeError(error) {
  const m = String(error?.message ?? error ?? "");
  if (/clase abierta con ese código/i.test(m)) return "No hay ninguna clase abierta con ese código. Revísalo en el tablero.";
  if (/Sin sesión/i.test(m)) return "Necesitas iniciar sesión para entrar.";
  if (/No estás en esta sala/i.test(m)) return "Ya no estás en esta clase. Vuelve a entrar con el código.";
  if (/Solo un docente/i.test(m)) return "Solo una cuenta de docente puede abrir una clase en vivo.";
  return "No se pudo conectar con la clase. Inténtalo otra vez.";
}

async function rpc(nombre, args, cliente = supabase) {
  if (!cliente) return { error: new Error("Sin conexión con el servidor") };
  const { data, error } = await cliente.rpc(nombre, args);
  return error ? { error } : { data };
}

export const crearSala = ({ materia, tema, titulo, duracion, preguntas }, c) =>
  rpc("vivo_crear", { p_materia: materia, p_tema: tema, p_titulo: titulo, p_duracion: duracion, p_preguntas: preguntas }, c);
export const unirse = (codigo, c) => rpc("vivo_unirse", { p_codigo: limpiarCodigo(codigo) }, c);
export const leerEstado = (sala, c) => rpc("vivo_estado", { p_sala: sala }, c);
export const responder = (sala, indice, opcion, c) => rpc("vivo_responder", { p_sala: sala, p_indice: indice, p_opcion: opcion }, c);
export const avanzar = (sala, accion, c) => rpc("vivo_avanzar", { p_sala: sala, p_accion: accion }, c);
export const leerConteo = (sala, c) => rpc("vivo_conteo", { p_sala: sala }, c);
export const leerPodio = (sala, limite = 5, c) => rpc("vivo_podio", { p_sala: sala, p_limite: limite }, c);
export const leerAsistencia = (sala, c) => rpc("vivo_asistencia", { p_sala: sala }, c);

/**
 * El canal de avisos de una sala. Devuelve { avisar, cerrar }.
 * `alOir` se llama cada vez que alguien difunde un cambio.
 */
export function canalDeSala(salaId, alOir, cliente = supabase) {
  if (!cliente?.channel || !salaId) return { avisar: () => {}, cerrar: () => {} };
  const canal = cliente.channel(`vivo-${salaId}`, { config: { broadcast: { self: false } } });
  if (alOir) canal.on("broadcast", { event: "cambio" }, () => alOir());
  canal.subscribe();
  return {
    avisar: () => { try { canal.send({ type: "broadcast", event: "cambio", payload: {} }); } catch { /* el respaldo lo cubre */ } },
    cerrar: () => { try { cliente.removeChannel(canal); } catch { /* nada que cerrar */ } },
  };
}

/**
 * Cuántos milisegundos le quedan a la pregunta, con el reloj del servidor.
 * `desfase` = hora del servidor menos hora del celular, medida al leer el estado.
 */
export function restanteMs(estado, desfase, ahora = Date.now()) {
  if (!estado?.inicio || estado.estado !== "pregunta") return 0;
  const fin = Date.parse(estado.inicio) + estado.duracion_s * 1000;
  return Math.max(0, fin - (ahora + desfase));
}

/** El desfase entre el reloj del servidor y el del celular, a partir de un estado. */
export const desfaseDe = (estado, ahora = Date.now()) => (estado?.ahora ? Date.parse(estado.ahora) - ahora : 0);
