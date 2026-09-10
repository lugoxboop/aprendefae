import { supabase } from "../lib/supabase.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PARTIDA EN CURSO DEL PROYECTO DEL ARCA
 *
 * El Arca es la actividad más larga del sitio y la que más jugó el piloto, y
 * recargar a mitad de ella lo perdía todo. Esto la guarda en el servidor
 * (partida_en_curso, migración 0028) y la devuelve.
 *
 * ═══════════ SE GUARDA EL RESULTADO, NO LA POSICIÓN ═══════════
 *
 * Se guarda al TERMINAR cada etapa, con su porcentaje ya sellado y su detalle.
 * Recargar a mitad de la 3 devuelve al principio de la 3 con la 1 y la 2
 * selladas; recargar tras fallar la 2 devuelve con esa falla intacta. Recargar
 * deja de ser una estrategia porque deja de ser una ventaja. No se guarda NADA
 * de dentro de una etapa: ni la respuesta a medias, ni el reloj.
 *
 * ═══════════ SOLO EL ARCA, Y ES UNA DECISIÓN ═══════════
 *
 * Las actividades con reloj no guardan partida: guardarlas le daría un reloj
 * nuevo a quien recarga. No es un olvido, y el servidor lo hace cumplir —solo
 * el Arca tiene `guarda_progreso` en el catálogo—, así que este módulo tampoco
 * acepta otra actividad.
 *
 * ═══════════ LA DURACIÓN ES TIEMPO JUGADO ═══════════
 *
 * `jugadoMs` suma solo el tiempo dentro de las etapas selladas. Con reloj de
 * pared, una pausa para cenar se convertía en "tardó cuatro horas" y
 * envenenaba la media del panel docente. El tiempo de una etapa que se perdió
 * al recargar no cuenta: se vuelve a jugar y se vuelve a medir.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACTIVIDAD_ARCA = "proyecto-arca";
export const VERSION_ESTADO = 1;
export const ETAPAS_ARCA = 4;

/* ────────────────────────────── lo que se guarda ────────────────────────────── */

/**
 * El estado que viaja al servidor. Solo lo sellado: resultados, detalle por
 * etapa y tiempo jugado.
 */
export function estadoParaGuardar({ resultados, detallePorEtapa, jugadoMs }) {
  return {
    version: VERSION_ESTADO,
    resultados: Array.from({ length: ETAPAS_ARCA }, (_, i) => {
      const r = resultados?.[i];
      return typeof r === "number" && Number.isFinite(r) ? r : null;
    }),
    detalle: Array.from({ length: ETAPAS_ARCA }, (_, i) =>
      Array.isArray(detallePorEtapa?.[i]) ? detallePorEtapa[i] : null,
    ),
    jugadoMs: Math.max(0, Math.round(Number(jugadoMs) || 0)),
  };
}

/* ───────────────────────────── lo que se retoma ───────────────────────────── */

/**
 * Valida un estado que llega de la red y dice por dónde se retoma.
 *
 * Devuelve null —y entonces no se ofrece continuar— si el estado no tiene
 * sentido: otra versión, resultados fuera de rango, o etapas selladas con
 * huecos. Las etapas se juegan en orden, así que lo único válido es un
 * PREFIJO de resultados seguido de nulos: [80, 40, null, null], nunca
 * [80, null, 70, null].
 *
 * `siguiente` es la primera etapa sin sellar (0..3), o 4 si ya estaban las
 * cuatro —entonces se retoma en el balance, que es donde se registra—.
 *
 * EL DETALLE DE LAS ETAPAS SIN SELLAR SE DESCARTA. Es lo que hace que rehacer
 * la etapa reabierta REEMPLACE sus filas en vez de sumarlas a unas viejas: al
 * retomar, esa posición empieza vacía.
 */
export function estadoRetomable(estado) {
  if (!estado || typeof estado !== "object" || estado.version !== VERSION_ESTADO) return null;
  const { resultados, detalle, jugadoMs } = estado;
  if (!Array.isArray(resultados) || resultados.length !== ETAPAS_ARCA) return null;

  let yaHuboNulo = false;
  for (const r of resultados) {
    if (r === null) {
      yaHuboNulo = true;
      continue;
    }
    if (typeof r !== "number" || !Number.isFinite(r) || r < 0 || r > 100) return null;
    if (yaHuboNulo) return null;
  }

  const selladas = resultados.filter((r) => r !== null).length;
  if (selladas === 0) return null;

  return {
    resultados: [...resultados],
    detalle: Array.from({ length: ETAPAS_ARCA }, (_, i) =>
      i < selladas && Array.isArray(detalle?.[i]) ? detalle[i] : null,
    ),
    jugadoMs: Number.isFinite(jugadoMs) && jugadoMs > 0 ? jugadoMs : 0,
    siguiente: selladas,
  };
}

/* ───────────────────────────── lo que se registra ───────────────────────────── */

/**
 * Las filas de detalle de la partida entera, para registrar_fp.
 *
 * El prefijo `etN:` distingue las etapas —y es lo que hace exacta la
 * sustitución al retomar—; la numeración `orden` corre seguida sobre las
 * cuatro. Como el detalle se guarda por índice de etapa, una etapa rehecha
 * aparece UNA vez: la última. El servidor además lo garantiza por su cuenta.
 */
export function filasDelDesafio(detallePorEtapa) {
  let n = 0;
  return (detallePorEtapa ?? []).flatMap((etapa, i) =>
    (etapa ?? []).map((f) => ({ ...f, item: `et${i + 1}:${f.item}`, orden: ++n })),
  );
}

/* ─────────────────────────────── cuándo se guardó ─────────────────────────────── */

/** "hace 12 minutos". Decir CUÁNDO importa: continuar algo de hace tres días sorprende si no. */
export function haceCuanto(ms) {
  if (!Number.isFinite(ms) || ms < 60_000) return "hace un momento";
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `hace ${min} minuto${min === 1 ? "" : "s"}`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} hora${h === 1 ? "" : "s"}`;
  const d = Math.floor(h / 24);
  return `hace ${d} día${d === 1 ? "" : "s"}`;
}

/* ─────────────────────────────────── la red ─────────────────────────────────── */

async function conSesion() {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data?.session;
}

/**
 * La partida guardada, lista para retomar, o null. Sin sesión no hay partida:
 * se guarda en el servidor, y quien juega sin cuenta sigue como antes.
 */
export async function leerPartida() {
  if (!(await conSesion())) return null;
  const { data, error } = await supabase.rpc("partida_leer", { p_activity_id: ACTIVIDAD_ARCA });
  if (error) {
    console.error("[aprendeFAE] No se pudo leer la partida del Arca:", error.message);
    return null;
  }
  const fila = Array.isArray(data) ? data[0] : data;
  if (!fila) return null;
  const estado = estadoRetomable(fila.estado);
  if (!estado) return null;
  return { ...estado, iniciadaEn: fila.iniciada_en, actualizadoEn: fila.actualizado_en };
}

/**
 * Guarda el estado. `iniciadaEn` null = partida nueva; con valor, continúa la
 * que el servidor identificó así en su primer guardado.
 *
 * Devuelve { ok, iniciadaEn } o { ok: false, motivo }. `motivo: "cerrada"` es
 * el servidor diciendo que esa partida ya no existe —se registró, o se empezó
 * de nuevo en otra pestaña—, y entonces NO se reintenta: es lo que impide que
 * un guardado tardío resucite una partida ya pagada.
 */
export async function guardarPartida(estado, iniciadaEn = null) {
  if (!(await conSesion())) return { ok: false, motivo: "sin-sesion" };
  const { data, error } = await supabase.rpc("partida_guardar", {
    p_activity_id: ACTIVIDAD_ARCA,
    p_estado: estado,
    p_iniciada_en: iniciadaEn,
  });
  if (error) {
    if (error.code === "55000") return { ok: false, motivo: "cerrada" };
    if (error.code === "42501") return { ok: false, motivo: "sin-sesion" };
    console.error("[aprendeFAE] No se pudo guardar la partida del Arca:", error.message);
    return { ok: false, motivo: "error" };
  }
  return { ok: true, iniciadaEn: data };
}

/** "Empezar de nuevo". El registro al terminar la borra solo, en el servidor. */
export async function borrarPartida() {
  if (!(await conSesion())) return;
  const { error } = await supabase.rpc("partida_borrar", { p_activity_id: ACTIVIDAD_ARCA });
  if (error) console.error("[aprendeFAE] No se pudo borrar la partida del Arca:", error.message);
}
