import {
  MESES, POR_MES, ANTICIPO, SAN_CALIXTO_P4, ARRIENDOS_DE_LA_COSTA, SEGMENTOS_P4, CIERRE_P4, ALTERNATIVOS_P4,
} from "../data/contabilidadTema3Pieza4.js";
import { MARCAS, RESULTADOS, CAJA } from "../data/contabilidadTema3.js";
import { contadores, palabras } from "./dosLineas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PIEZA 4 · «LO QUE YA SE PAGÓ Y NO HA PASADO» — el estado, calculado.
 *
 * La capa 2 es una función del paso (1 a 10) y la capa 3 una función del mes
 * tocado: el mismo mes da siempre lo mismo, en cualquier orden de toques.
 * Los contadores salen de las marcas y el saldo del bloque de las fichas que
 * quedan: $15.000 menos $5.000 por cada mes cerrado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PASOS_P4 = 10;
export const LINEAS = "lineas";
export const ASIENTO = "asiento";
export const ESPEJO = "espejo";

/* Dónde va cada marca en el carril (Xeno): la de caja pegada al 1 de junio;
 * la del cierre, pegada al final de su mes, con el monto a la izquierda. */
const X_ANTICIPO = "6px";
const xCierre = (i) => `calc(${((i + 1) * 100) / MESES.length}% - 12px)`;

const marcaAnticipo = (empresa, actual) => ({
  tipo: empresa.marcaCaja, monto: ANTICIPO, columna: 0, hecho: `${empresa.id}-anticipo`,
  pista: MARCAS[empresa.marcaCaja].pista, actual, x: X_ANTICIPO,
});
const marcaCierre = (empresa, i, actual) => ({
  tipo: empresa.marcaCierre, monto: POR_MES, columna: i, hecho: `${empresa.id}-cierre-${i}`,
  pista: MARCAS[empresa.marcaCierre].pista, actual, x: xCierre(i), montoIzquierda: true,
});

/* El estado de cada corte: los ya cerrados, «pasado»; el último cerrado, «activo»; el resto, «por venir». */
export const estadosDeCortes = (cerrados) => MESES.map((_, i) => (
  i < cerrados - 1 ? "pasado" : i === cerrados - 1 ? "activo" : "porVenir"));

const bloqueDe = (empresa, cerrados, resaltado = false) => ({
  ...empresa.bloque,
  empresa: empresa.id,
  consumidas: cerrados,
  saldo: ANTICIPO - POR_MES * cerrados,
  resaltado,
});

const PISTAS = {
  reposo: { [RESULTADOS]: "reposo", [CAJA]: "reposo" },
  cajaActiva: { [RESULTADOS]: "quieta", [CAJA]: "activa" },
  arribaActiva: { [RESULTADOS]: "activa", [CAJA]: "quieta" },
  quietas: { [RESULTADOS]: "quieta", [CAJA]: "quieta" },
};

/**
 * El paso `paso` (1 a 10):
 *
 *   1   las dos líneas, vacías
 *   2   los tres meses y sus cortes «por venir»; cae la salida de $15.000
 *   3   el contraste: «Diferido» sobre la línea de arriba, que sigue quieta
 *   4   aparece el bloque de San Calixto: $15.000
 *   5   cierre de junio: la ficha de junio se vuelve un gasto de $5.000
 *   6   modo asiento de San Calixto, con el bloque debajo
 *   7   quedan $10.000 en el bloque (saldo resaltado)
 *   8   Arriendos de la Costa: entra la plata y aparece su bloque de $15.000
 *   9   su cierre de junio y su asiento
 *   10  el espejo
 */
export function estadoPasoP4(paso) {
  const p = Math.min(PASOS_P4, Math.max(1, Math.trunc(paso) || 1));
  const empresa = p >= 8 ? ARRIENDOS_DE_LA_COSTA : SAN_CALIXTO_P4;
  const cerrados = (p >= 5 && p <= 7) || p === 9 ? 1 : 0;

  const marcas = [];
  if (p >= 2 && p <= 9) marcas.push(marcaAnticipo(empresa, p === 2 || p === 8));
  for (let i = 0; i < cerrados; i++) marcas.push(marcaCierre(empresa, i, p === 5 || p === 9));

  const pistas = p === 2 || p === 8 ? PISTAS.cajaActiva
    : p === 5 ? PISTAS.arribaActiva
      : p === 3 || p === 4 || p === 7 ? PISTAS.quietas : PISTAS.reposo;

  return {
    paso: p,
    empresa,
    columnas: MESES.length,
    columnaActual: null,
    hecho: null,
    marcas,
    pistas,
    contadores: contadores(marcas),
    resaltados: [],
    calendario: p === 1 ? { tipo: "meses", meses: false, cortes: estadosDeCortes(0), diferido: false }
      : { tipo: "meses", meses: true, cortes: estadosDeCortes(cerrados), diferido: p === 3 },
    bloque: (p >= 4 && p <= 9) ? bloqueDe(empresa, cerrados, p === 7) : null,
    modo: p === 6 || p === 9 ? ASIENTO : p === 10 ? ESPEJO : LINEAS,
    asiento: p === 6 || p === 9 ? empresa.asiento : null,
    /* El nombre resaltado al entrar Arriendos de la Costa, como el reinicio de las piezas 1 y 3. */
    recienCambiada: p === 8,
    /* En el paso 9 la ficha vuela antes de pasar al asiento (Xeno, paso 9). */
    vueloAntesDelAsiento: p === 9,
    textos: [p === PASOS_P4 ? CIERRE_P4 : SEGMENTOS_P4[p - 1]],
    alternativo: ALTERNATIVOS_P4[p] ?? null,
  };
}

/* ═══════════ CAPA 3 ═══════════ */

/**
 * La capa 3, solo San Calixto: el estado sale del mes tocado (0 = ninguno,
 * que es el del paso 4). Con k meses cerrados: k fichas consumidas, saldo
 * $15.000 − k × $5.000, gastos k × $5.000 y k marcas de gasto.
 */
export function estadoCapa3P4(mes = null) {
  const k = mes === null ? 0 : MESES.indexOf(mes) + 1;
  if (mes !== null && k === 0) throw new Error(`«${mes}» no es un mes de la pieza`);
  const empresa = SAN_CALIXTO_P4;
  const marcas = [marcaAnticipo(empresa, false)];
  for (let i = 0; i < k; i++) marcas.push(marcaCierre(empresa, i, i === k - 1));
  return {
    mes,
    empresa,
    columnas: MESES.length,
    columnaActual: null,
    hecho: null,
    marcas,
    pistas: PISTAS.quietas,
    contadores: contadores(marcas),
    resaltados: [],
    calendario: { tipo: "meses", meses: true, cortes: estadosDeCortes(k), diferido: false },
    bloque: bloqueDe(empresa, k),
    modo: LINEAS,
  };
}

/* ═══════════ TIEMPOS ═══════════ */
export const duracionPasoP4 = (estado) => 3000 + 450 * palabras(estado.textos.join(" "));
export const MS_VUELO = 700;
export const ESCALON_VUELO = 150;
export const ESCALON_FICHAS = 120;
