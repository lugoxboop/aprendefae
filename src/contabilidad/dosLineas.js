import {
  SAN_CALIXTO, RESULTADOS, CAJA, MARCAS, CONTADORES,
  TEXTO_PASO_1, CIERRE, ENLACE_TEMA_1, ALTERNATIVOS,
} from "../data/contabilidadTema3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS DOS LÍNEAS — el estado, calculado. Sin estado a mano.
 *
 * La capa 2 es una función del número de paso (1 a 6): «Anterior» no
 * deshace nada, recalcula. La capa 3 es una función de la empresa, de los
 * hechos ya vistos y del que está seleccionado. Las dos devuelven lo mismo:
 * qué marcas hay en cada columna, cuáles son nuevas, en qué estado está cada
 * pista y cuánto suma cada contador.
 *
 * Los contadores suman cada tipo por separado y nunca netean: restar
 * mostraría la utilidad, que la capa 1 separó a propósito.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PASOS = 6;

/** Cuánto suma cada contador con estas marcas. */
export function contadores(marcas) {
  const total = { ingreso: 0, gasto: 0, entrada: 0, salida: 0 };
  for (const m of marcas) total[m.tipo] += m.monto;
  return total;
}

/* Las marcas de un hecho, con la columna y la pista que les tocan. */
const marcasDe = (hecho, columna, actual) => hecho.marcas.map((m) => ({
  ...m, columna, hecho: hecho.id, pista: MARCAS[m.tipo].pista, actual,
}));

/* Qué pistas mueve un hecho. */
export const pistasQueMueve = (hecho) => new Set(hecho.marcas.map((m) => MARCAS[m.tipo].pista));

/* Reposo, activa o quieta, para las dos pistas, según el hecho actual. */
function estadoPistas(actual) {
  if (!actual) return { [RESULTADOS]: "reposo", [CAJA]: "reposo" };
  const mueve = pistasQueMueve(actual);
  return {
    [RESULTADOS]: mueve.has(RESULTADOS) ? "activa" : "quieta",
    [CAJA]: mueve.has(CAJA) ? "activa" : "quieta",
  };
}

/* ═══════════ CAPA 2 ═══════════ */

/**
 * El estado del paso `paso` (1 a 6) de San Calixto.
 *
 *   1      las dos pistas, vacías y en reposo
 *   2–5    el hecho paso−1 (en orden cronológico), nuevo en blanco; los
 *          anteriores, apagados
 *   6      el cierre: todas las marcas en blanco y los contadores de
 *          ingresos y de entradas resaltados
 */
export function estadoPaso(paso, empresa = SAN_CALIXTO) {
  const p = Math.min(PASOS, Math.max(1, Math.trunc(paso) || 1));
  const n = empresa.hechos.length;
  const vistos = p === 1 ? 0 : p === PASOS ? n : p - 1;
  const actual = p >= 2 && p <= n + 1 ? empresa.hechos[p - 2] : null;
  const marcas = empresa.hechos.slice(0, vistos).flatMap((h, i) =>
    marcasDe(h, i, p === PASOS ? true : h === actual));
  return {
    paso: p,
    empresa,
    columnas: n,
    columnaActual: actual ? empresa.hechos.indexOf(actual) : null,
    hecho: actual,
    numeroHecho: actual ? empresa.hechos.indexOf(actual) + 1 : null,
    marcas,
    pistas: estadoPistas(actual),
    contadores: contadores(marcas),
    resaltados: p === PASOS ? ["ingreso", "entrada"] : [],
    textos: p === 1 ? [TEXTO_PASO_1] : p === PASOS ? [CIERRE, ENLACE_TEMA_1] : [actual.texto],
    alternativo: ALTERNATIVOS[p - 1],
  };
}

/* ═══════════ CAPA 3 ═══════════ */

/**
 * La exploración de una empresa: las marcas de los hechos ya vistos (cada
 * uno en su columna, que sigue el orden de la lista y no el de los toques),
 * el seleccionado en blanco y los demás apagados.
 */
export function estadoExploracion(empresa, vistos = [], seleccionado = null) {
  const visto = new Set(vistos);
  const actual = empresa.hechos.find((h) => h.id === seleccionado) ?? null;
  const marcas = empresa.hechos.flatMap((h, i) => (visto.has(h.id) ? marcasDe(h, i, h === actual) : []));
  return {
    empresa,
    columnas: empresa.hechos.length,
    columnaActual: actual ? empresa.hechos.indexOf(actual) : null,
    hecho: actual,
    marcas,
    pistas: estadoPistas(actual),
    contadores: contadores(marcas),
    resaltados: [],
    textos: actual ? [actual.texto] : [],
    completa: empresa.hechos.every((h) => visto.has(h.id)),
  };
}

/* ═══════════ FORMATO ═══════════ */

/** $15.000 — punto de miles, sin decimales. */
export const pesos = (n) => `$${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

/* Palabras de un texto: el tiempo de un paso en la reproducción automática. */
export const palabras = (texto) => texto.trim().split(/\s+/).filter(Boolean).length;

/** 3 000 ms + 450 ms por palabra del texto del paso (Xeno). */
export const duracionPaso = (estado) => 3000 + 450 * palabras(estado.textos.join(" "));

export { CONTADORES, MARCAS, RESULTADOS, CAJA };
