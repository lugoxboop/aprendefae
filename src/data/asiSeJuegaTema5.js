import { T5_ACT2, REGLAS_T5_ACT2, COMPRA_T5_ACT2, ALT_TUTORIAL_T5_ACT2 } from "./contabilidadT5Act2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» DEL TEMA 5 DE CONTABILIDAD (Célula B).
 *
 * El componente de siempre, sin cambios. b5-t5-a2: la demostración es la
 * compra del 1 de mayo (p. 194), fuera de las cuatro partes. La mano arma el
 * asiento (Inversiones – títulos al debe, Bancos al haber, $2.000.000 cada
 * uno), lo confirma y queda la explicación de Futaba en cuatro líneas.
 *
 * b5-t5-a1 sigue sin «Así se juega»: le falta una ficha de demostración
 * fuera del banco, que es contenido.
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

export const ASI_SE_JUEGA_TEMA5 = {
  [ASI_CIERRE_SANTA_PACHA.actividadId]: ASI_CIERRE_SANTA_PACHA,
};
