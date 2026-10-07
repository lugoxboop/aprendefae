import {
  ARTERIA, PASOS_ARTERIA, EJEMPLO_ARTERIA, ALT_TUTORIAL_ARTERIA,
  DOS_ENTRADAS, PASOS_DOS_ENTRADAS, EJEMPLO_DOS_ENTRADAS, ALT_TUTORIAL_DOS_ENTRADAS,
} from "./monetariaRepaso.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» DE LAS DOS ACTIVIDADES NUEVAS DE POLÍTICA MONETARIA.
 *
 * El componente de siempre, sin cambios. Los ejemplos están fuera del banco
 * y son los aprobados por Levi; la mano lee el hecho y toca una opción. Con
 * movimiento reducido: inicio, el hecho señalado, y la opción tocada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El componente antepone «Ejemplo: »; así se lee el alternativo de Levi, textual. */
const sinPrefijo = (alt) => alt.replace(/^Ejemplo: /, "");

const ASI_ARTERIA = {
  actividadId: ARTERIA.id,
  titulo: ARTERIA.nombre,
  consigna: ARTERIA.consigna,
  pasos: PASOS_ARTERIA,
  alt: sinPrefijo(ALT_TUTORIAL_ARTERIA),
  demo: { items: [EJEMPLO_ARTERIA] },
  guion: {
    duracion: 7000,
    toques: [
      { ms: 1500, en: "[data-hecho]", senala: true },
      { ms: 3500, texto: "Arteria 2 · Inversión (I)" },
    ],
  },
  cuadros: { gesto: 1 },
};

const ASI_DOS_ENTRADAS = {
  actividadId: DOS_ENTRADAS.id,
  titulo: DOS_ENTRADAS.nombre,
  consigna: DOS_ENTRADAS.consigna,
  pasos: PASOS_DOS_ENTRADAS,
  alt: sinPrefijo(ALT_TUTORIAL_DOS_ENTRADAS),
  demo: { items: [EJEMPLO_DOS_ENTRADAS] },
  guion: {
    duracion: 7000,
    toques: [
      { ms: 1500, en: "[data-hecho]", senala: true },
      { ms: 3500, texto: "Van en contra" },
    ],
  },
  cuadros: { gesto: 1 },
};

export const ASI_SE_JUEGA_MONETARIA = {
  [ASI_ARTERIA.actividadId]: ASI_ARTERIA,
  [ASI_DOS_ENTRADAS.actividadId]: ASI_DOS_ENTRADAS,
};
