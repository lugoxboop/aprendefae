/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MANEJADOR DEL SIMULADOR CON IA (orden de Mateo, 26-nov).
 *
 * Misma tubería que «asistente» (sesión → clave → cuerpo → cupo → modelo), con
 * tres diferencias:
 *   1. El prompt de sistema NO llega del sitio: el sitio solo dice qué
 *      escenario abrió (p. ej. «pe26-a2-fiebre») y el servidor elige el prompt.
 *      Los escenarios salen de escenarios/motor.js, uno por Aprender.
 *      Un estudiante no puede reescribir a la compañera.
 *   2. El modelo responde JSON con esquema (structured outputs), y aun así se
 *      comprueba aquí: un expediente que nombra su propio virus o trae un id
 *      inventado se pide otra vez (una sola).
 *   3. Cupo propio (simulador_consumir, migración 0276): una partida gasta
 *      varias llamadas y no debe dejar al estudiante sin su mascota tutora.
 *
 * JavaScript plano, como asistente/manejador.js: lo cargan Deno y Node.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { ESCENARIOS as T1 } from "./escenarios/demanda-agregada.js";
import { ESCENARIOS as T2 } from "./escenarios/politica-economica.js";
import { ESCENARIOS as T3 } from "./escenarios/politica-fiscal.js";
import { ESCENARIOS as T4 } from "./escenarios/politica-monetaria.js";
import { ESCENARIOS as T5 } from "./escenarios/politica-cambiaria.js";
import { ESCENARIOS as GP } from "./escenarios/gestion-proyectos.js";

/* Un escenario por Aprender de Macro (id de la pieza → escenario del motor), más «gp26-acta» de Gestión de Proyectos. */
export const ESCENARIOS = Object.fromEntries([...T1, ...T2, ...T3, ...T4, ...T5, ...GP].map((e) => [e.ID, e]));

/* Una partida son unas 6 a 10 llamadas (3 expedientes, 3 diagnósticos y
 * preguntas). 40 alcanza para cuatro partidas al día. Se cambia con el
 * secreto SIMULADOR_LIMITE_DIARIO, sin desplegar. */
export const LIMITE_PROVISIONAL = 40;
/* El mismo modelo que eligió Mateo para el asistente (30-oct). */
export const MODELO_POR_DEFECTO = "claude-sonnet-5-5";
export const MAX_TOKENS = 2500;
export const MAX_TURNOS = 6;

export const MOTIVOS = {
  sinSesion: "Inicia sesión para entrar a la oficina.",
  limite: "Por hoy ya usaste todas las consultas del simulador. Vuelve mañana.",
  peticion: "La petición no llegó completa.",
  escenario: "Este simulador no existe.",
  sinClave: "El simulador no está configurado en el servidor.",
  modelo: "La compañera no pudo responder ahora. Inténtalo otra vez.",
};

export function leerLimite(env) {
  const crudo = env?.SIMULADOR_LIMITE_DIARIO;
  if (crudo === undefined || crudo === null || String(crudo).trim() === "") return { limite: LIMITE_PROVISIONAL, fuente: "provisional" };
  const n = Number(crudo);
  if (!Number.isInteger(n) || n < 0) return { limite: LIMITE_PROVISIONAL, fuente: "provisional-por-valor-invalido" };
  return { limite: n, fuente: "secreto" };
}

export function hayCabeceraDeSesion(peticion) {
  return /^Bearer\s+\S+/i.test(peticion?.headers?.get?.("Authorization") ?? "");
}

const responder = (estado, cuerpo, cabeceras = {}) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { "Content-Type": "application/json; charset=utf-8", ...cabeceras } });

/** El historial de la charla, alternando y empezando por el estudiante. */
export function sanearHistorial(historial) {
  if (!Array.isArray(historial)) return [];
  const turnos = historial
    .filter((t) => t && (t.rol === "estudiante" || t.rol === "companera") && typeof t.texto === "string" && t.texto.trim())
    .slice(-MAX_TURNOS)
    .map((t) => ({ role: t.rol === "estudiante" ? "user" : "assistant", content: t.texto.trim().slice(0, 900) }));
  while (turnos.length && turnos[0].role !== "user") turnos.shift();
  const juntos = [];
  for (const t of turnos) {
    const u = juntos[juntos.length - 1];
    if (u && u.role === t.role) u.content += "\n" + t.content;
    else juntos.push({ ...t });
  }
  if (juntos.length && juntos[juntos.length - 1].role === "user") juntos.pop();
  return juntos;
}

/** Lo que devolvió el modelo, como objeto; null si no es JSON. */
export function leerJson(texto) {
  if (typeof texto !== "string") return null;
  try { return JSON.parse(texto); } catch { /* sigue */ }
  const m = texto.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

/**
 * @param {Request} peticion
 * @param {object} deps  { env, consumirCupo(limite), llamarModelo({system, messages, modelo, maxTokens, esquema}) → texto, registrar }
 */
export async function manejar(peticion, deps) {
  const { env = {}, consumirCupo, llamarModelo, registrar = () => {} } = deps ?? {};

  if (peticion.method !== "POST") return responder(405, { error: "Método no permitido" }, { Allow: "POST" });
  if (!hayCabeceraDeSesion(peticion)) return responder(401, { error: MOTIVOS.sinSesion });
  if (!env.ANTHROPIC_API_KEY) {
    registrar("error", "ANTHROPIC_API_KEY no está configurada como secreto");
    return responder(503, { error: MOTIVOS.sinClave });
  }

  let cuerpo;
  try { cuerpo = await peticion.json(); } catch { return responder(400, { error: MOTIVOS.peticion }); }

  const escenario = ESCENARIOS[cuerpo?.escenario];
  if (!escenario) return responder(404, { error: MOTIVOS.escenario });

  const turno = escenario.armarTurno(cuerpo);
  if (turno.error) return responder(400, { error: MOTIVOS.peticion, motivo: turno.error });

  /* El cupo se gasta solo con una petición válida. */
  const { limite, fuente } = leerLimite(env);
  let cupo;
  try {
    cupo = await consumirCupo(limite);
  } catch (e) {
    if (e?.code === "42501") return responder(401, { error: MOTIVOS.sinSesion });
    registrar("error", "No se pudo consultar el cupo: " + (e?.message ?? e));
    return responder(503, { error: MOTIVOS.modelo });
  }
  if (!cupo?.permitido) return responder(429, { error: MOTIVOS.limite, usadas: cupo?.usadas ?? limite, limite: cupo?.limite ?? limite });

  const modelo = env.SIMULADOR_MODELO || env.ASISTENTE_MODELO || MODELO_POR_DEFECTO;
  const messages = [
    ...(turno.accion === "pregunta" ? sanearHistorial(cuerpo?.historial) : []),
    { role: "user", content: turno.texto },
  ];

  /* Dos intentos: si el primero no pasa la comprobación, se pide otra vez. */
  let salida = null;
  for (let intento = 0; intento < 2 && !salida; intento += 1) {
    try {
      const texto = await llamarModelo({ system: escenario.SISTEMA, messages, modelo, maxTokens: MAX_TOKENS, esquema: escenario.esquema(turno.accion) });
      salida = escenario.validarSalida(turno.accion, leerJson(texto));
      if (!salida) registrar("aviso", `Salida descartada (${turno.accion}, intento ${intento + 1})`);
    } catch (e) {
      registrar("error", "El modelo falló: " + (e?.message ?? e));
      break;
    }
  }
  if (!salida) return responder(502, { error: MOTIVOS.modelo });

  return responder(200, { ...salida, ...(turno.extra ?? {}), modelo, usadas: cupo.usadas, limite: cupo.limite, limiteFuente: fuente });
}
