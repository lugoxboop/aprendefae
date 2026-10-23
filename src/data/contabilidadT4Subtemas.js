/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LOS SUBTEMAS DE LOS HACER, PARA EL REPASO DIARIO DE CONTABILIDAD
 * (Célula D). Lo adelanta la célula antes del issue de Erwin; src/repaso/ no
 * se toca: este archivo es lo que Erwin enchufa.
 *
 * Las dos formas de src/repaso/subtemas.js:
 *
 *   [fijo]   el ítem tiene un subtema propio que no sale de su respuesta (los
 *            saldos de H7 y H8)
 *   [regla]  el subtema sale de un dato del banco: el campo `subtema` del
 *            hecho, la operación, la ronda o la partida (H1, H3, H4, H7), o el
 *            tipo de partida y la etapa (H8)
 *
 * ═══════════ NO HAY NI UNA COPIA DE CONTENIDO AQUÍ ═══════════
 *
 * Igual que items.js: los nombres son los de SUBTEMAS_H1, _H3, _H4, _H7 y _H8,
 * que ya viven en los datos de cada pieza, y los ítems se leen de sus bancos.
 * No hizo falta proponer ningún nombre nuevo: cada ítem del banco ya tenía su
 * subtema en esos vocabularios. Si Katsumi corrige un nombre allá, aquí sale
 * corregido.
 *
 * ═══════════ LA CLAVE ═══════════
 *
 *   clave = `${actividad}:${itemId}`
 *
 * con `itemId` EXACTAMENTE el que la pieza manda a fp_detalle (t.anotar en
 * src/components/t4/), la misma clave de historial del Repaso.
 *
 * ═══════════ LOS RETIRADOS ═══════════
 *
 *   · con banco, marcados `retirado: true`: los ocho hechos de H1 de antes del
 *     rediseño (h1-1…h1-8, ITEMS_H1_ANTERIORES) y las dos rondas de H4 que
 *     salieron en el corte (h4-3, h4-5). Sus filas siguen en fp_detalle y el
 *     panel docente las nombra; el Repaso no las saca, porque su partida ya
 *     no existe
 *   · sin banco: H2, H5 y H6 (retiro blando, 0208). Sus datos ya no están en
 *     el cliente, así que no tienen ítems que etiquetar; se listan aparte
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { H1_ID, ITEMS_H1, ITEMS_H1_ANTERIORES, SUBTEMAS_H1 } from "./contabilidadT4H1.js";
import { H3_ID, SERIES_H3, SUBTEMAS_H3 } from "./contabilidadT4H3.js";
import { H4_ID, RONDAS_H4, SUBTEMAS_H4, ARQUEO, DIFERENCIA, CHEQUE, itemH4 } from "./contabilidadT4H4.js";
import { H7_ID, SERIES_H7, SUBTEMAS_H7 } from "./contabilidadT4H7.js";
import { H8_ID, SERIES_H8, SUBTEMAS_H8 } from "./contabilidadT4H8.js";

/* El vocabulario de cada pieza: ningún subtema de T4 sale de fuera de estas listas (salvo el de las rondas retiradas de H4). */
export const VOCABULARIO_T4 = {
  [H1_ID]: SUBTEMAS_H1,
  [H3_ID]: SUBTEMAS_H3,
  [H4_ID]: Object.values(SUBTEMAS_H4),
  [H7_ID]: Object.values(SUBTEMAS_H7),
  [H8_ID]: SUBTEMAS_H8,
};

/* [fijo] — por `actividad:item`. */
export const SUBTEMA_FIJO_T4 = {
  [`${H7_ID}:saldo-banco`]: SUBTEMAS_H7.saldos,
  [`${H7_ID}:saldo-libros`]: SUBTEMAS_H7.saldos,
  [`${H8_ID}:saldo-mayor`]: SUBTEMAS_H8[3],
};

/* [regla] — H8: la etapa 1 es «Qué se asienta» para las nueve partidas; el asiento de la etapa 2, por el tipo de nota. */
export const SUBTEMA_REGLA_H8 = { partida: SUBTEMAS_H8[0], nc: SUBTEMAS_H8[1], nd: SUBTEMAS_H8[2] };

/*
 * [regla] — H4, rondas retiradas. h4-3 y h4-5 eran faltantes en el paquete
 * v1 (d4-t4-h4-v1.md), que no tenía la regla de la empresa: su subtema es el
 * de entonces, «Faltante de caja menor». Sus preguntas eran tres (sin la de
 * la cuenta, que llegó con H5).
 */
const SUBTEMA_H4_V1_FALTANTE = "Faltante de caja menor";
const RONDAS_H4_RETIRADAS = ["h4-3", "h4-5"];
const PREGUNTAS_H4_V1 = [ARQUEO, DIFERENCIA, CHEQUE];

/* Las actividades de T4 que salieron sin banco en el cliente (0208): no tienen ítems. */
export const RETIRADAS_SIN_BANCO_T4 = {
  "t4-el-control-que-se-saltaron": "H2 · salió (era reconocer una lista)",
  "t4-al-empleado-o-al-gasto": "H5 · fundida en H4: sus casos son las rondas h5-*",
  "t4-quien-se-entero-primero": "H6 · fundida en H7: sus tipos son las partidas de H7",
};

const fila = (actividad, itemId, subtema, forma, retirado = false) => ({
  clave: `${actividad}:${itemId}`, actividad, itemId, subtema, forma, retirado,
});

/* Todos los ítems de Hacer de T4, vigentes y retirados con banco, con su subtema. */
export const ITEMS_T4 = [
  /* H1 · [regla]: el `subtema` del hecho. */
  ...ITEMS_H1.map((x) => fila(H1_ID, x.id, x.subtema, "regla")),
  ...ITEMS_H1_ANTERIORES.map((x) => fila(H1_ID, x.id, x.subtema, "regla", true)),
  /* H3 · [regla]: el `subtema` de la operación (apertura, reembolso, aumento, disminución), en las dos series. */
  ...SERIES_H3.flatMap((s) => s.ops).map((x) => fila(H3_ID, x.id, x.subtema, "regla")),
  /* H4 · [regla]: el `subtema` de la ronda (su tipo y, si falta, la regla de la empresa), igual para sus preguntas. */
  ...RONDAS_H4.flatMap((r) => r.preguntas.map((p) => fila(H4_ID, itemH4(r.id, p.id), r.subtema, "regla"))),
  ...RONDAS_H4_RETIRADAS.flatMap((rid) => PREGUNTAS_H4_V1.map((pid) => fila(H4_ID, itemH4(rid, pid), SUBTEMA_H4_V1_FALTANTE, "regla", true))),
  /* H7 · [regla]: el `subtema` de la partida (su tipo), en las dos series; los dos saldos, [fijo]. */
  ...SERIES_H7.flatMap((s) => s.partidas).map((x) => fila(H7_ID, x.id, x.subtema, "regla")),
  fila(H7_ID, "saldo-banco", SUBTEMA_FIJO_T4[`${H7_ID}:saldo-banco`], "fijo"),
  fila(H7_ID, "saldo-libros", SUBTEMA_FIJO_T4[`${H7_ID}:saldo-libros`], "fijo"),
  /* H8 · [regla]: etapa 1 por partida, etapa 2 por el tipo de nota; el saldo del mayor, [fijo]. */
  ...SERIES_H8.flatMap((s) => s.partidas).map((x) => fila(H8_ID, x.id, SUBTEMA_REGLA_H8.partida, "regla")),
  ...SERIES_H8.flatMap((s) => s.notas).map((n) => fila(H8_ID, n.idAsiento, SUBTEMA_REGLA_H8[n.tipo], "regla")),
  fila(H8_ID, "saldo-mayor", SUBTEMA_FIJO_T4[`${H8_ID}:saldo-mayor`], "fijo"),
];

const POR_CLAVE = new Map(ITEMS_T4.map((x) => [x.clave, x]));

/** El subtema de un ítem de T4, o lanza: un subtema vacío no puede pasar en silencio. */
export function subtemaDeItemT4(actividad, itemId) {
  const nombre = POR_CLAVE.get(`${actividad}:${itemId}`)?.subtema;
  if (!nombre) throw new Error(`Sin subtema: ${actividad} · ${itemId}`);
  return nombre;
}

/** Lo que el Repaso puede sacar: los ítems vigentes (sin los retirados). */
export const itemsVigentesT4 = () => ITEMS_T4.filter((x) => !x.retirado);
