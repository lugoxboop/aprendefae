import { H1, PASOS_H1, EJEMPLO_H1, ALT_H1, HABER } from "./contabilidadT4H1.js";
import { H2, PASOS_H2, EJEMPLO_H2, ALT_H2 } from "./contabilidadT4H2.js";

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

export const ASI_SE_JUEGA_T4 = {
  [ASI_ENTRA_O_SALE.actividadId]: ASI_ENTRA_O_SALE,
  [ASI_CONTROL.actividadId]: ASI_CONTROL,
};
