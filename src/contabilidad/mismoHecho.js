import {
  IGUALES, CAJA_SENUELO, CONTRARIO, LADOS_CAMBIADOS, DEL_PAR, ERRORES_ACT3, UI, lineaDeCasilla, PARES_ACT3,
} from "../data/contabilidadTema3Act3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 3 — LA LÓGICA, SIN PANTALLA.
 *
 * PUNTAJE, TODO O NADA. El par vale solo si las 4 casillas están bien; con 3
 * de 4 vale 0. Pero la explicación va casilla por casilla: cada una dice si
 * está bien o qué iba.
 *
 * QUÉ ERROR SE MUESTRA, EN ESTE ORDEN (Levi):
 *   1. A    los dos asientos quedaron iguales
 *   2. D    se eligió «Caja»
 *   3. C    se eligió la cuenta del tipo de ajuste contrario
 *   4. B    las cuentas son las correctas, pero una empresa tiene los lados cambiados
 *   5. par  cualquier otro caso (por ejemplo, una cuenta de la otra empresa)
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const LADOS = ["debe", "haber"];

/* Las cinco cuentas de la hoja de una empresa, en orden alfabético fijo. */
export function hojaDe(empresa) {
  return [empresa.debe, empresa.haber, ...empresa.senuelos].sort((a, b) => a.localeCompare(b, "es"));
}

/* Las casillas en orden de lectura: libro 1 Debe, libro 1 Haber, libro 2 Debe, libro 2 Haber. */
export const ORDEN_DE_LECTURA = [[0, "debe"], [0, "haber"], [1, "debe"], [1, "haber"]];

/** ¿Están las 4 casillas llenas? `elecciones` = [{ debe, haber }, { debe, haber }]. */
export const completo = (elecciones) => ORDEN_DE_LECTURA.every(([e, l]) => Boolean(elecciones[e]?.[l]));

/** El caso de error de un par ya evaluado como incorrecto. */
export function casoDeError(par, elecciones) {
  const [a, b] = elecciones;
  if (a.debe === b.debe && a.haber === b.haber) return IGUALES;
  const elegidas = elecciones.flatMap((x) => [x.debe, x.haber]);
  if (elegidas.includes("Caja")) return CAJA_SENUELO;
  const contrario = par.empresas.some((emp, k) => emp.senueloPropio && emp.senueloPropio !== "Caja"
    && (elecciones[k].debe === emp.senueloPropio || elecciones[k].haber === emp.senueloPropio));
  if (contrario) return CONTRARIO;
  const cambiada = par.empresas.some((emp, k) => elecciones[k].debe === emp.haber && elecciones[k].haber === emp.debe);
  if (cambiada) return LADOS_CAMBIADOS;
  return DEL_PAR;
}

/**
 * Evalúa un par. Devuelve:
 *   ok        las 4 bien
 *   caso      null si ok; si no, A, D, C, B o «par»
 *   casillas  las 4, en orden de lectura, con lo elegido, lo correcto y si está bien
 *   lineas    «{Empresa} · {Debe/Haber}: va {cuenta}.» de cada casilla equivocada
 *   textos    el texto del caso y después el acierto (con error), o solo el acierto
 */
export function evaluarPar(par, elecciones) {
  const casillas = ORDEN_DE_LECTURA.map(([e, lado]) => {
    const emp = par.empresas[e];
    const elegida = elecciones[e][lado];
    return { empresa: e, lado, elegida, correcta: emp[lado], ok: elegida === emp[lado] };
  });
  const ok = casillas.every((c) => c.ok);
  const caso = ok ? null : casoDeError(par, elecciones);
  const lineas = casillas.filter((c) => !c.ok).map((c) => lineaDeCasilla(par.empresas[c.empresa].nombre, c.lado === "debe" ? UI.debe : UI.haber, c.correcta));
  const textoCaso = caso === null ? null : caso === DEL_PAR ? par.errorPar : ERRORES_ACT3[caso];
  const textos = [textoCaso, par.acierto].filter(Boolean);
  return { ok, caso, casillas, lineas, textos, malas: casillas.filter((c) => !c.ok).length };
}

/** Porcentaje: pares bien a la primera sobre el total, sin redondear por el camino. */
export function puntuarAct3(respuestas, total) {
  if (!total) return 0;
  return (respuestas.filter((x) => x.ok).length / total) * 100;
}

/** El hecho de un par, por su id (para el panel del docente). */
export function hechoDePar(id) {
  return PARES_ACT3.find((p) => p.id === id)?.hecho ?? null;
}

/** El nombre accesible de una casilla, según su estado (Xeno; nombre de error corregido por Levi). */
export function nombreAccesible({ empresa, lado, cuenta, monto, error = null }) {
  const L = lado === "debe" ? UI.debe : UI.haber;
  if (error) return `${empresa}, ${L}: elegiste ${error.elegida}. ${UI.revisa}. ${UI.va}: ${error.correcta}.`;
  return cuenta ? `${empresa}, ${L}: ${cuenta}. ${monto}` : `${empresa}, ${L}: vacía. ${monto}`;
}
