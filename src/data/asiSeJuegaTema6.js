import { T6_ACT2, REGLAS_T6_ACT2, PROVISION_2007_T6_ACT2, ALT_TUTORIAL_T6_ACT2, GASTO, PROVISION } from "./contabilidadT6Act2.js";
import { T6_ACT3, REGLAS_T6_ACT3, CASTIGO_T6_ACT3, ALT_TUTORIAL_T6_ACT3, CLIENTES } from "./contabilidadT6Act3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» DEL TEMA 6 DE CONTABILIDAD (Célula B).
 *
 * El componente de siempre, sin cambios, como el cierre de T5. El tutorial
 * de cada mesa es su ejemplo resuelto, fuera de las partes y sin diario: la
 * mano arma el asiento, lo confirma y queda la explicación de Futaba en
 * cuatro líneas.
 *   · b5-t6-a2: la provisión del 31 de diciembre de 2007 (p. 202).
 *   · b5-t6-a3: el castigo de marzo (p. 204), punto de partida de los casos.
 *
 * El texto alternativo es el de Futaba sin «Ejemplo resuelto.», porque el
 * componente compartido ya antepone «Ejemplo:».
 * ═══════════════════════════════════════════════════════════════════════════
 */

const guion = (debe, haber, cifra) => ({
  duracion: 12000,
  toques: [
    { ms: 1500, en: `[data-sacar="${debe}:debe"]` },
    { ms: 2700, en: `[data-campo-cifra="${debe}"]`, escribe: cifra },
    { ms: 4800, en: `[data-sacar="${haber}:haber"]` },
    { ms: 6000, en: `[data-campo-cifra="${haber}"]`, escribe: cifra },
    { ms: 8100, en: '[data-confirmar-parte="1"]' },
  ],
});

const ASI_PROVISION = {
  actividadId: T6_ACT2.id,
  titulo: T6_ACT2.nombre,
  consigna: T6_ACT2.consigna,
  pasos: REGLAS_T6_ACT2,
  alt: ALT_TUTORIAL_T6_ACT2.replace(/^Ejemplo resuelto\. /, ""),
  demo: { items: [PROVISION_2007_T6_ACT2] },
  guion: guion(GASTO, PROVISION, "148800"),
  cuadros: { gesto: 4 },
};

const ASI_DEUDA_QUE_VUELVE = {
  actividadId: T6_ACT3.id,
  titulo: T6_ACT3.nombre,
  consigna: T6_ACT3.consigna,
  pasos: REGLAS_T6_ACT3,
  alt: ALT_TUTORIAL_T6_ACT3.replace(/^Ejemplo resuelto\. /, ""),
  demo: { items: [CASTIGO_T6_ACT3] },
  guion: guion(PROVISION, CLIENTES, "180000"),
  cuadros: { gesto: 4 },
};

export const ASI_SE_JUEGA_TEMA6 = {
  [ASI_PROVISION.actividadId]: ASI_PROVISION,
  [ASI_DEUDA_QUE_VUELVE.actividadId]: ASI_DEUDA_QUE_VUELVE,
};
