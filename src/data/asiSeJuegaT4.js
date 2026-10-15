import { H1, PASOS_H1, EJEMPLO_H1, ALT_H1, HABER } from "./contabilidadT4H1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» DE T4 DE CONTABILIDAD (Célula D).
 *
 * El componente de siempre, sin cambios, con el patrón de asiSeJuegaTema5.js:
 * título y consigna de la actividad, los tres pasos de Katsumi, un ejemplo
 * fuera del banco, su texto alternativo y el guion de la mano.
 * Textos: d4-t4-asi-se-juega-v1.md.
 *
 * t4-entra-o-sale-de-caja (H1, rediseño de enganche): un solo hecho, las
 * llantas pagadas con billetes de la caja (construido, no está en el banco;
 * Katsumi). La mano TOCA el haber del cajón a los 2,2 s: el 60.000 sale hacia
 * el pago y «En la caja» baja de 400.000 a 340.000 (Hanayama, H1 rediseño §5).
 * En modo demo la mecánica no dibuja su Encabezado ni sus Pulsos: la consigna
 * sale una sola vez, la de esta pantalla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ASI_ENTRA_O_SALE = {
  actividadId: H1.id,
  titulo: H1.nombre,
  consigna: H1.consigna,
  pasos: PASOS_H1,
  alt: ALT_H1,
  demo: { items: [EJEMPLO_H1] },
  guion: {
    duracion: 6500,
    toques: [
      { ms: 2200, en: `[data-destino="${HABER}"]` },
    ],
  },
  cuadros: { gesto: 1 },
};

export const ASI_SE_JUEGA_T4 = {
  [ASI_ENTRA_O_SALE.actividadId]: ASI_ENTRA_O_SALE,
};
