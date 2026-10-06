import { ACT2_T3, EJEMPLO_PANADERIA, PASOS_ACT2, ALT_TUTORIAL_ACT2 } from "./contabilidadTema3Act2.js";
import { ACT6_T3, EJEMPLO_PANADERIA_ACT6, PASOS_ACT6, ALT_TUTORIAL_ACT6 } from "./contabilidadTema3Act6.js";

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

/*
 * Act. 6: la panadería de Gen. El componente de siempre solo sabe tocar,
 * señalar y escribir; el corte se lleva a diciembre con tres toques de
 * «Después» (octubre, noviembre, diciembre). Después escribe las dos cifras y
 * comprueba: sale la resolución de Gen. Con movimiento reducido, el cuadro
 * del gesto deja el corte en diciembre y el último, todo resuelto.
 */
const ASI_QUE_LE_TOCA = {
  actividadId: ACT6_T3.id,
  titulo: ACT6_T3.nombre,
  consigna: ACT6_T3.consigna,
  pasos: PASOS_ACT6,
  alt: ALT_TUTORIAL_ACT6.replace(/^Ejemplo: /, ""),
  demo: { items: [EJEMPLO_PANADERIA_ACT6] },
  guion: {
    duracion: 12000,
    toques: [
      { ms: 1500, en: "[data-hecho]", senala: true },
      { ms: 3000, en: '[data-paso-corte="despues"]' },
      { ms: 3700, en: '[data-paso-corte="despues"]' },
      { ms: 4400, en: '[data-paso-corte="despues"]' },
      { ms: 6000, en: '[data-campo="alPeriodo"]', escribe: "300000" },
      { ms: 7800, en: '[data-campo="queda"]', escribe: "600000" },
      { ms: 9600, en: "[data-comprobar]" },
    ],
  },
  cuadros: { gesto: 4 },
};

export const ASI_SE_JUEGA_TEMA3 = Object.fromEntries([ASI_CUANDO_SE_CAUSA, ASI_QUE_LE_TOCA].map((a) => [a.actividadId, a]));
