import { H1, PASOS_H1, EJEMPLO_H1, ALT_H1, HABER } from "./contabilidadT4H1.js";
import { H2, PASOS_H2, EJEMPLO_H2, ALT_H2 } from "./contabilidadT4H2.js";
import { H3, PASOS_H3, EJEMPLO_H3, ALT_H3, BOTON_H3 } from "./contabilidadT4H3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» DE T4 DE CONTABILIDAD (Célula D).
 *
 * El componente de siempre, sin cambios, con el patrón de asiSeJuegaTema5.js:
 * título y consigna de la actividad, los tres pasos de Katsumi, un ejemplo
 * fuera del banco, su texto alternativo y el guion de la mano.
 * Textos: d4-t4-asi-se-juega-v1.md.
 *
 * t4-entra-o-sale-de-caja (H1): una sola tarjeta, la de las neveras pagadas
 * con plata de la caja (construida, no está en el banco). La mano TOCA
 * «Haber de Caja» y aparece el acierto: se toca, no se arrastra (Hanayama,
 * H1 v1 §2), aunque el paquete diga «la arrastra».
 *
 * t4-el-control-que-se-saltaron (H2): el caso de la floristería (construido,
 * no está en el banco). La mano toca la opción del control 2 y aparece el
 * acierto (Hanayama, H2 v1 §1).
 *
 * t4-se-mueve-la-caja-menor (H3): la apertura de Papelería Arcoíris
 * (construida, no está en ninguna serie). La mano saca «Caja menor» y la pone
 * al debe, saca «Bancos» y la pone al haber, y toca «Comprobar». Los
 * selectores son los de ConstructorAsiento, sin cambiarlo: la cuenta es un
 * botón de la paleta (por su texto) y el lado, el botón de su fila.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ASI_ENTRA_O_SALE = {
  actividadId: H1.id,
  titulo: H1.nombre,
  consigna: H1.consigna.join(" "),
  pasos: PASOS_H1,
  alt: ALT_H1,
  demo: { items: [EJEMPLO_H1] },
  guion: {
    duracion: 6500,
    toques: [
      { ms: 2200, en: `[data-opcion="${HABER}"] button` },
    ],
  },
  cuadros: { gesto: 1 },
};

const ASI_CONTROL = {
  actividadId: H2.id,
  titulo: H2.nombre,
  consigna: H2.consigna.join(" "),
  pasos: PASOS_H2,
  alt: ALT_H2,
  demo: { items: [EJEMPLO_H2] },
  guion: {
    duracion: 6500,
    toques: [
      { ms: 2200, en: `[data-opcion="${EJEMPLO_H2.correcta}"] button` },
    ],
  },
  cuadros: { gesto: 1 },
};

const ASI_CAJA_MENOR = {
  actividadId: H3.id,
  titulo: H3.nombre,
  consigna: H3.consigna.join(" "),
  pasos: PASOS_H3,
  alt: ALT_H3,
  demo: { items: [EJEMPLO_H3] },
  guion: {
    duracion: 8500,
    toques: [
      { ms: 1500, texto: EJEMPLO_H3.debe },
      { ms: 2600, en: '[data-fila-asiento="0"] > div:last-child > button:first-child' },
      { ms: 3700, texto: EJEMPLO_H3.haber },
      { ms: 4800, en: '[data-fila-asiento="1"] > div:last-child > button:last-child' },
      { ms: 6000, texto: BOTON_H3.comprobar },
    ],
  },
  cuadros: { gesto: 2 },
};

export const ASI_SE_JUEGA_T4 = {
  [ASI_ENTRA_O_SALE.actividadId]: ASI_ENTRA_O_SALE,
  [ASI_CONTROL.actividadId]: ASI_CONTROL,
  [ASI_CAJA_MENOR.actividadId]: ASI_CAJA_MENOR,
};
