import { ACT2_T3, EJEMPLO_PANADERIA, PASOS_ACT2, ALT_TUTORIAL_ACT2 } from "./contabilidadTema3Act2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» DEL TEMA 3 DE CONTABILIDAD.
 *
 * El componente de siempre, sin cambios: recuadro, pastilla EJEMPLO,
 * «Siguiente» libre desde el inicio. El ejemplo es la panadería de Levi,
 * fuera del banco, y no lleva pie de página.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ASI_CUANDO_SE_CAUSA = {
  actividadId: ACT2_T3.id,
  titulo: ACT2_T3.nombre,
  consigna: ACT2_T3.consigna,
  pasos: PASOS_ACT2,
  /* El componente antepone «Ejemplo: »; así se lee el alternativo de Levi, textual. */
  alt: ALT_TUTORIAL_ACT2.replace(/^Ejemplo: /, ""),
  demo: { items: [EJEMPLO_PANADERIA] },
  guion: {
    duracion: 7000,
    toques: [{ ms: 2500, en: '[data-marca="entrega"]' }],
  },
  cuadros: { gesto: 1 },
};

export const ASI_SE_JUEGA_TEMA3 = Object.fromEntries([ASI_CUANDO_SE_CAUSA].map((a) => [a.actividadId, a]));
