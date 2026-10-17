import { PASOS_T5_A2, CIERRE_T5_A2, FUSION_T5_A2 } from "../data/contabilidadT5Pieza2.js";
import { fusionar } from "./fusionar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 2 · CAPA 2 — qué se ve, qué se resalta y qué se atenúa en
 * cada paso (guía de Mai v2 con los 21 pasos de la v2b). El estado sale SOLO
 * del número de paso.
 *
 * Cinco hechos en fila, uno abierto a la vez (v2 §4.1): el del paso actual va
 * abierto, los anteriores plegados y los que aún no llegan no se muestran. En
 * el cierre se pliegan los cinco y nada se atenúa. Dentro del hecho abierto,
 * lo que aún no aparece ocupa su sitio, invisible.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PASOS = PASOS_T5_A2.length; // 21
export const CIERRE = PASOS + 1; // 22

/* Los tramos de la v2 §4.1: en qué pasos va abierto cada hecho. */
export const TRAMOS = [[1, 4], [5, 7], [8, 14], [15, 17], [18, 21]];

/* Cada pieza: en qué hecho vive y desde qué paso se ve (v2 §4.2). */
const PIEZAS = {
  efectivo: [0, 1], titulos: [0, 2], inversiones1: [0, 3], bancos: [0, 3], tasa: [0, 4],
  primerInteres: [1, 5], cuenta1: [1, 6], caja1: [1, 7], ingresos1: [1, 7],
  vendidos: [2, 8], precio1: [2, 9], caja2: [2, 10], sinInteres: [2, 11], costo1: [2, 12], inversiones2: [2, 13], ganancia: [2, 14],
  quedan: [3, 15], cuenta2: [3, 16], caja3: [3, 17], ingresos2: [3, 17],
  precio2: [4, 18], recibe2: [4, 19], costo2: [4, 19], caja4: [4, 20], inversiones3: [4, 20], perdida: [4, 21],
};

/* La columna «Resalta» de Futaba. */
const RESALTADO = {
  1: ["efectivo"], 2: ["titulos"], 3: ["inversiones1", "bancos"], 4: ["tasa"],
  5: ["primerInteres"], 6: ["cuenta1"], 7: ["caja1", "ingresos1"],
  8: ["vendidos"], 9: ["precio1"], 10: ["caja2"], 11: ["sinInteres"], 12: ["costo1"], 13: ["inversiones2"], 14: ["ganancia"],
  15: ["quedan"], 16: ["cuenta2"], 17: ["caja3", "ingresos2"],
  18: ["precio2"], 19: ["recibe2", "costo2"], 20: ["caja4", "inversiones3"], 21: ["perdida"],
  [CIERRE]: [],
};

export const ELEMENTOS = Object.keys(PIEZAS);
export const hechoDe = (id) => PIEZAS[id][0];
export const tramoDe = (paso) => TRAMOS.findIndex(([a, b]) => paso >= a && paso <= b);

export function estadoPasoT5A2(paso) {
  const p = Math.min(CIERRE, Math.max(1, paso));
  const cierre = p === CIERRE;
  const abierto = cierre ? null : tramoDe(p);
  const resaltados = new Set(RESALTADO[p]);
  const hay = resaltados.size > 0;
  return {
    paso: p,
    cierre,
    abierto,
    resaltados: RESALTADO[p],
    /* Los hechos: se muestran los que ya llegaron; plegados, los anteriores al abierto (en el cierre, todos). */
    hechos: TRAMOS.map((_, i) => ({
      mostrado: cierre || i <= abierto,
      plegado: cierre || i < abierto,
      atenuado: hay,
    })),
    elementos: Object.fromEntries(ELEMENTOS.map((id) => {
      const [hecho, desde] = PIEZAS[id];
      const visible = hecho === abierto && p >= desde;
      return [id, { visible, resaltado: resaltados.has(id), atenuado: hay && visible && !resaltados.has(id) }];
    })),
  };
}

export const pasoT5A2 = (paso) => (paso >= CIERRE ? CIERRE_T5_A2 : PASOS_T5_A2[paso - 1]);

/** «Reproducir»: 3 000 ms + 450 ms por palabra, como LoQueYaPaso. */
export const duracionPasoT5A2 = (paso) => 3000 + 450 * pasoT5A2(paso).texto.trim().split(/\s+/).length;

/* La capa 2 que se ve: los 21 pasos de antes contados en 14 (hoja 7 de Mai). */
export const T5_A2_JUNTO = fusionar({ ...FUSION_T5_A2, estadoPaso: estadoPasoT5A2, paso: pasoT5A2, cierreViejo: CIERRE });

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 11 · LA CAPA 2 «LOS TÍTULOS DE SANTA PACHA» (P2 de Mai, 16-oct).
 *
 * Como el tanque de T6 · A3: el estado sale de los 21 pasos de antes y los
 * cinco gestos van pegados al paso de antes que los nombra: el efectivo entra
 * a Inversiones con el 3, la fecha pasa a agosto con el 5, se vende el 75 %
 * con el 9, la fecha pasa a noviembre con el 15 y se vende el resto con el
 * 19. Un gesto de un grupo pasado está hecho; el del grupo abierto, si está
 * en `hechos`. Ninguna cifra nueva: las barras usan las de los pasos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const GESTOS_TITULOS = { 3: "bancos", 5: "agosto", 9: "vende75", 15: "noviembre", 19: "vendeResto" };
/* Las dos ventas, con su escala propia (la mayor de las dos cifras es el 100 %). */
export const VENTAS_TITULOS = { agosto: { costaron: 1500000, recibio: 1725000 }, noviembre: { costaron: 500000, recibio: 468750 } };
export const LOTES = 20;

const RESALTA_TITULOS = {
  1: ["bancos"], 2: ["bancos"], 3: ["inversiones"], 4: ["fechas"], 5: ["fechas"], 6: ["caja"], 7: ["caja"],
  8: ["inversiones"], 9: ["inversiones"], 10: ["caja", "comparacion"], 11: ["caja", "comparacion"], 12: ["comparacion"], 13: ["comparacion"],
  14: ["comparacion"], 15: ["fechas"], 16: ["caja"], 17: ["caja"], 18: ["comparacion"], 19: ["comparacion"], 20: ["caja", "inversiones"],
  21: ["comparacion"], 22: [],
};
const RESALTA_GESTO_TITULOS = { 3: ["bancos", "inversiones"], 5: ["fechas", "caja"], 9: ["inversiones", "caja"], 15: ["fechas", "caja"], 19: ["inversiones", "caja"] };

export function crearEstadoTitulos(grupos) {
  const CIERRE_NUEVO = grupos.length + 1;
  const grupoDe = (n) => (n >= CIERRE_NUEVO ? [22] : grupos[Math.max(1, n) - 1]);
  function estado(n, hechos = new Set()) {
    const grupo = grupoDe(n);
    const viejo = grupo.at(-1);
    const llego = (p) => viejo >= p;
    const hecho = (p) => p < grupo[0] || (grupo.includes(p) && hechos.has(p));
    const pendiente = (p) => grupo.includes(p) && !hechos.has(p);
    const gesto = grupo.find((p) => GESTOS_TITULOS[p]) ?? null;
    const llegaAhora = (p) => grupo.includes(p);
    const filas = [
      { id: "interesAgosto", tipo: "interes", desde: 7 },
      { id: "ventaAgosto", tipo: "venta", desde: 10 },
      { id: "interesNoviembre", tipo: "interes", desde: 17 },
      { id: "ventaNoviembre", tipo: "venta", desde: 20 },
    ].map((f) => ({ ...f, visible: llego(f.desde), nueva: llegaAhora(f.desde) }));
    const comparacion = hecho(19)
      ? { venta: "noviembre", costaron: true, recibio: true, diferencia: llego(21) }
      : llego(10) ? { venta: "agosto", costaron: llego(12), recibio: true, diferencia: llego(14) } : null;
    return {
      paso: n,
      viejo,
      gesto: gesto && pendiente(gesto) ? GESTOS_TITULOS[gesto] : null,
      pasoGesto: gesto,
      resaltados: gesto && pendiente(gesto) ? RESALTA_GESTO_TITULOS[gesto] : RESALTA_TITULOS[viejo],
      elementos: {},
      bancos: !hecho(3),
      lotes: hecho(3),
      vendidos: hecho(19) ? LOTES : hecho(9) ? 15 : 0,
      estadoInversiones: !hecho(3) ? null : hecho(19) ? "sin" : hecho(9) ? "quedan" : "compra",
      hoy: hecho(15) ? 2 : hecho(5) ? 1 : 0,
      filas,
      comparacion,
    };
  }
  return { estado, CIERRE: CIERRE_NUEVO };
}
