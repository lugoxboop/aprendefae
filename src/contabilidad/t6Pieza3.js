import { PASOS_T6_A3, CIERRE_T6_A3, FUSION_T6_A3 } from "../data/contabilidadT6Pieza3.js";
import { fusionar } from "./fusionar.js";
import { crearMomentos } from "./momentos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 3 · CAPA 2 — los tres momentos de la provisión de El Torito
 * (guía de Mai v1 §4 con el anexo v1b). Un momento pasado conserva su
 * cabecera y su asiento: la pieza vuelve atrás en los pasos 11 (el gasto de
 * diciembre) y 12 (las dos cifras de la provisión).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Cada pieza: [momento, desde qué paso, conserva]. */
const PIEZAS = {
  fecha0: [0, 1, true], deben: [0, 1], parte: [0, 2], gasto1: [0, 3, true], provision1: [0, 4, true], utilidad: [0, 5],
  bloque: [0, 6], filaClientes: [0, 6], filaProvision: [0, 6], filaNeto: [0, 7],
  fecha1: [1, 8, true], perdida: [1, 8], provision2: [1, 9, true], clientes2: [1, 10, true], subestimada: [1, 13],
  fecha2: [2, 14, true], analisis: [2, 14], pide: [2, 15], suman: [2, 16], gasto3: [2, 17, true], provision3: [2, 18, true], queda: [2, 19],
};

/* La columna «Resalta» de Futaba, en orden de prioridad. */
const RESALTADO = {
  1: ["deben"], 2: ["parte"], 3: ["gasto1"], 4: ["provision1"], 5: ["utilidad"], 6: ["filaClientes", "filaProvision"], 7: ["filaNeto"],
  8: ["perdida"], 9: ["provision2"], 10: ["clientes2"], 11: ["gasto1"], 12: ["provision1", "provision2"], 13: ["subestimada"],
  14: ["fecha2"], 15: ["pide"], 16: ["suman"], 17: ["gasto3"], 18: ["provision3"], 19: ["queda"],
};

export const T6_A3 = crearMomentos({
  pasos: PASOS_T6_A3,
  cierre: CIERRE_T6_A3,
  tramos: [[1, 7], [8, 13], [14, 19]],
  piezas: PIEZAS,
  resaltado: RESALTADO,
});
export const { PASOS, CIERRE, estadoPaso: estadoPasoT6A3, duracion: duracionPasoT6A3 } = T6_A3;

/* La capa 2 que se ve: los 19 pasos de antes contados en 15 (hoja 7 de Mai, al ancho del sitio). La vuelta atrás del paso 11 de antes cae en el 10. */
export const T6_A3_JUNTO = fusionar({ ...FUSION_T6_A3, estadoPaso: T6_A3.estadoPaso, paso: T6_A3.paso, cierreViejo: T6_A3.CIERRE });

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 7 · LA CAPA 2 CON EL TANQUE (P2 de Mai, 16-oct; decisiones de Sakuta).
 *
 * El estado de la escena se calcula desde los pasos de antes (los 19 de
 * Futaba), así no depende de cómo se junten: cada paso nuevo muestra el
 * estado del último paso de su grupo. Los cuatro gestos van pegados al paso
 * de antes que los nombra (GESTOS): el gasto entra al tanque con el 4 (3 + 4
 * siempre van juntos), la barra se toca en el 6, la deuda de Pablo Moncayo
 * entra con el 9 y el nivel se sube con el 18. Un gesto de un grupo pasado
 * está hecho (no se puede pasar sin hacerlo); el del grupo abierto, si está
 * en `hechos`.
 *
 * Ninguna cifra nueva: los valores son los de los pasos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const VALORES_TANQUE_T6_A3 = { provision: 148800, castigo: 180000, faltante: -31200, analisis: 153400, ajuste: 184600 };
export const GESTOS_T6_A3 = { 4: "gasto", 6: "barra", 9: "pablo", 18: "asa" };

/* Lo resaltado de cada paso de antes, y el origen y el destino de cada gesto sin hacer (Mai §2: se ven juntos). */
const RESALTA_TANQUE = {
  1: ["barra"], 2: ["barra"], 3: ["filaHaber1", "tanque"], 4: ["filaHaber1", "tanque"], 5: ["fichaGasto1"], 6: ["barra"], 7: ["valorNeto"],
  8: ["fichaPablo"], 9: ["filaDebe1", "tanque"], 10: ["barra"], 11: ["fichaGasto1"], 12: ["tanque"], 13: ["rotuloSaldo"],
  14: ["tanque"], 15: ["tanque"], 16: ["tanque"], 17: ["filaHaber2", "tanque"], 18: ["filaHaber2", "tanque"], 19: ["rotuloSaldo"], 20: [],
};
const RESALTA_GESTO = { 4: ["fichaGasto1", "tanque"], 6: ["barra", "ranura"], 9: ["fichaPablo", "tanque"], 18: ["tanque", "ranura"] };

/** El grupo de pasos de antes que muestra el paso nuevo `n` (el cierre: el paso 20, con todo hecho). */
export function crearEstadoTanque(grupos) {
  const CIERRE = grupos.length + 1;
  const grupoDe = (n) => (n >= CIERRE ? [20] : grupos[Math.max(1, n) - 1]);
  const gestoDe = (n) => grupoDe(n).find((p) => GESTOS_T6_A3[p]) ?? null;
  function estado(n, hechos = new Set()) {
    const grupo = grupoDe(n);
    const viejo = grupo.at(-1);
    const llego = (p) => viejo >= p;
    const hecho = (p) => p < grupo[0] || (grupo.includes(p) && hechos.has(p));
    const pendiente = (p) => grupo.includes(p) && !hechos.has(p);
    const V = VALORES_TANQUE_T6_A3;
    const gesto = gestoDe(n);
    const resaltados = gesto && pendiente(gesto) ? RESALTA_GESTO[gesto] : RESALTA_TANQUE[viejo];
    return {
      paso: n,
      viejo,
      gesto: gesto && pendiente(gesto) ? GESTOS_T6_A3[gesto] : null,
      /* El paso del gesto, para MaquinaPegada (`hechos` se guarda por paso de antes). */
      pasoGesto: gesto,
      resaltados,
      elementos: {},
      /* A · Clientes. */
      parte: !llego(2) ? null : hecho(6) ? "restada" : "rayada",
      valorNeto: llego(7),
      fichaPablo: llego(8) && !hecho(9),
      /* B · el gasto y la T. */
      fichaGasto1: hecho(4) ? "anotada" : pendiente(4) ? "activa" : "quieta",
      fichaGasto2: hecho(18),
      filas: { haber1: hecho(4), debe1: hecho(9), haber2: hecho(18) },
      /* El tanque. */
      nivel: hecho(18) ? V.analisis : hecho(9) ? V.faltante : hecho(4) ? V.provision : 0,
      analisis: !llego(14) ? null : viejo === 15 ? "cifra" : "solo",
      segmentos: llego(16) && !llego(19) ? (hecho(18) ? "continuos" : "discontinuos") : null,
      rotuloSaldo: hecho(18) ? "analisis" : hecho(9) ? "faltante" : hecho(4) ? "provision" : null,
    };
  }
  return { estado, gestoDe, CIERRE };
}

/*
 * LOTE 7 · LA CAPA 3 SOBRE EL TANQUE (§3.3 de Mai, decisión (a) de Sakuta).
 * El nivel al que lleva cada opción del momento 2 y lo que registra cada
 * opción del momento 3 (el relleno sube eso desde el faltante). Son las
 * cifras de los pasos o su cuenta; ninguna se escribe en pantalla.
 *   · «Igual»: se registra lo que pide el análisis, $153.400.
 *   · «Menor»: lo que faltó se resta en vez de sumarse: $153.400 − $31.200.
 */
export const NIVEL_OPCION_T6_A3 = { cero: 0, faltan: -31200, sigue: 148800 };
export const REGISTRO_OPCION_T6_A3 = { mayor: 184600, igual: 153400, menor: 122200 };
/* El saldo que deja cada momento ya decidido (el valor correcto, se acierte o no). */
export const NIVEL_MOMENTO_T6_A3 = [148800, -31200, 153400];
