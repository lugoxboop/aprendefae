import { T5_ACT2, REGLAS_T5_ACT2, COMPRA_T5_ACT2, ALT_TUTORIAL_T5_ACT2 } from "./contabilidadT5Act2.js";
import { T5_ACT1, REGLAS_T5_ACT1, FICHAS_T5_ACT1, CAJONES_T5_ACT1, FIJA, INTERES } from "./contabilidadT5Act1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» DEL TEMA 5 DE CONTABILIDAD (Célula B).
 *
 * El componente de siempre, sin cambios. b5-t5-a2: la demostración es la
 * compra del 1 de mayo (p. 194), fuera de las cuatro partes. La mano arma el
 * asiento (Inversiones – títulos al debe, Bancos al haber, $2.000.000 cada
 * uno), lo confirma y queda la explicación de Futaba en cuatro líneas.
 *
 * b5-t5-a1 (auditoría integral de Shoko, 15-oct): sus tres reglas
 * aprobadas solo vivían en los datos, porque sin «Así se juega» no hay
 * botón «¿Cómo se juega?». Lleva el patrón de T1-6: «Así se juega» con los
 * pasos y una ficha de demostración. La ficha es una del banco (el CDT), con
 * su acierto aprobado, para no escribir contenido nuevo; abre los dos
 * niveles. El texto alternativo se arma con los rótulos de los botones.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ASI_CIERRE_SANTA_PACHA = {
  actividadId: T5_ACT2.id,
  titulo: T5_ACT2.nombre,
  consigna: T5_ACT2.consigna,
  pasos: REGLAS_T5_ACT2,
  alt: ALT_TUTORIAL_T5_ACT2.replace(/^Ejemplo resuelto\. /, ""),
  demo: { items: [COMPRA_T5_ACT2] },
  guion: {
    duracion: 12000,
    toques: [
      { ms: 1500, en: '[data-sacar="Inversiones – títulos:debe"]' },
      { ms: 2700, en: '[data-campo-cifra="Inversiones – títulos"]', escribe: "2000000" },
      { ms: 4800, en: '[data-sacar="Bancos:haber"]' },
      { ms: 6000, en: '[data-campo-cifra="Bancos"]', escribe: "2000000" },
      { ms: 8100, en: '[data-confirmar-parte="1"]' },
    ],
  },
  cuadros: { gesto: 4 },
};

/* b5-t5-a1: la ficha del CDT, renta fija con interés. Lote 6a: la mano toca su cajón, que la coloca. */
export const DEMO_T5_ACT1 = FICHAS_T5_ACT1.find((f) => f.id === "cdt");
const CAJON_DEMO_T5 = CAJONES_T5_ACT1.find((k) => k.renta === FIJA && k.tipo === INTERES);
const ASI_QUE_RENTA_DA = {
  actividadId: T5_ACT1.id,
  titulo: T5_ACT1.nombre,
  consigna: T5_ACT1.consigna,
  pasos: REGLAS_T5_ACT1,
  /* PARA SHOKO: la misma frase de antes con un solo destino (antes «va en «Renta fija» y, dentro, en «Con interés»»). */
  alt: `la ficha «${DEMO_T5_ACT1.texto}» va en «${CAJON_DEMO_T5.rotulo}».`,
  demo: { items: [DEMO_T5_ACT1] },
  guion: { duracion: 7500, toques: [{ ms: 2500, en: `[data-cajon="${FIJA}/${INTERES}"]` }] },
  cuadros: { gesto: 1 },
};

export const ASI_SE_JUEGA_TEMA5 = {
  [ASI_CIERRE_SANTA_PACHA.actividadId]: ASI_CIERRE_SANTA_PACHA,
  [ASI_QUE_RENTA_DA.actividadId]: ASI_QUE_RENTA_DA,
};
