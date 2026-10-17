/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · D8: EL CASO DE CADA PIEZA DE APRENDER (lote nocturno; Yujiro).
 *
 * Cada pieza de A0-A5 tiene dos casos con la misma decisión: el 1 (el de
 * siempre) y el 2 (el caso B de Katsumi, con otras cifras y otros nombres).
 * El sorteo elige el caso PARA TODA LA PIEZA, no pantalla por pantalla,
 * porque las cifras se encadenan (A3 usa las de A2).
 *
 *   · el primer recorrido de una pieza usa siempre el caso 1; el sorteo
 *     aplica al repetirla (cuando ya se terminó una vez en este navegador).
 *     Así la sonda y la guardia, que abren una página nueva, son
 *     deterministas
 *   · `aprendefae-t4-caso` = "1" o "2" en localStorage fuerza el caso (la
 *     sonda lo pone con SONDA_CASO_T4 para medir el B)
 *   · lo que se guarda es una comodidad del navegador: si el almacenamiento
 *     falla, todo sigue con el caso 1
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createContext, useContext } from "react";

export const CLAVE_TERMINADAS = "aprendefae-t4-terminadas";
export const CLAVE_FORZADO = "aprendefae-t4-caso";

/* El caso en curso, para los cuerpos de las pantallas (1 por omisión). */
export const CasoT4 = createContext(1);
export const useCaso = () => useContext(CasoT4);

/* Los datos del caso en curso: `porCaso` es { 1: {...}, 2: {...} }. */
export const useDatosCaso = (porCaso) => porCaso[useCaso()] ?? porCaso[1];

function leer(clave) {
  try { return globalThis.localStorage?.getItem(clave) ?? null; } catch { return null; }
}

function terminadas() {
  try { return new Set(JSON.parse(leer(CLAVE_TERMINADAS) ?? "[]")); } catch { return new Set(); }
}

/* El caso de una pieza al abrirla: el forzado; si no, 1 la primera vez y, si ya se terminó, el sorteo. */
export function casoInicial(id, aleatorio = Math.random) {
  const f = leer(CLAVE_FORZADO);
  if (f === "1" || f === "2") return Number(f);
  return terminadas().has(id) ? (aleatorio() < 0.5 ? 1 : 2) : 1;
}

/* La pieza se terminó (llegó a su última pantalla): la próxima vez, sorteo. */
export function marcarTerminada(id) {
  try {
    const t = terminadas();
    if (t.has(id)) return;
    t.add(id);
    globalThis.localStorage?.setItem(CLAVE_TERMINADAS, JSON.stringify([...t]));
  } catch { /* sin almacenamiento, el caso 1 */ }
}
