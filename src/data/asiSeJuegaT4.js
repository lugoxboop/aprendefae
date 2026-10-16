import { H1, PASOS_H1, EJEMPLO_H1, ALT_H1, HABER } from "./contabilidadT4H1.js";
import { H3, PASOS_H3, EJEMPLO_H3, ALT_H3, CAJA_MENOR, BANCOS } from "./contabilidadT4H3.js";
import { H4, PASOS_H4, EJEMPLO_H4, ALT_H4, SOBRA } from "./contabilidadT4H4.js";
import { H7, PASOS_H7, EJEMPLO_H7, ALT_H7, LIBROS_MENOS } from "./contabilidadT4H7.js";
import { H8, PASOS_H8, EJEMPLO_H8, ALT_H8, NO_SE_ASIENTA } from "./contabilidadT4H8.js";

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
 *
 * Los Hacer rediseñados (H3, H4, H7 y H8, rediseño de enganche): los textos
 * son de Katsumi (celula-d/katsumi-texto-hacer.md) y, como en H1, en modo demo
 * la mecánica no dibuja su Encabezado ni sus Pulsos.
 *
 * t4-se-mueve-la-caja-menor (H3): la apertura de Papelería Arcoíris
 * (construida, no está en ninguna serie), con el sobre de Julio. La mano pone
 * la ficha en el debe de Caja menor, después en el haber de Bancos, y toca
 * «Comprobar», que en la demo SÍ se dibuja (Katsumi, «Para Baki»).
 *
 * t4-el-arqueo-de-rosa (H4, «El arqueo de caja menor»): una ronda propia,
 * fuera del banco (Iván, un vivero: fondo 320.000, suman 322.700). Solo la
 * pregunta 1: la mano toca «Sobra» y la aguja queda a la derecha del fondo.
 *
 * t4-concilia-la-cuenta (H7): la comisión de $12.000 (construida, sin serie),
 * con un par propio (640.000 y 652.000). La mano TOCA el Menos de los libros.
 *
 * t4-se-asienta-o-no (H8): el cheque de $50.000 que nadie ha cobrado
 * (construido, sin serie). Solo la etapa 1, con una partida que NO se
 * asienta, para no regalar ningún asiento: la mano TOCA «No se asienta».
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

const ASI_CAJA_MENOR = {
  actividadId: H3.id,
  titulo: H3.nombre,
  consigna: H3.consigna,
  pasos: PASOS_H3,
  alt: ALT_H3,
  demo: { items: EJEMPLO_H3 },
  guion: {
    duracion: 8000,
    toques: [
      { ms: 1500, en: `[data-destino="${CAJA_MENOR}:debe"]` },
      { ms: 3000, en: `[data-destino="${BANCOS}:haber"]` },
      { ms: 4500, en: '[data-boton="comprobar"]' },
    ],
  },
  cuadros: { gesto: 2 },
};

const ASI_ARQUEO = {
  actividadId: H4.id,
  titulo: H4.nombre,
  consigna: H4.consigna,
  pasos: PASOS_H4,
  alt: ALT_H4,
  demo: { items: [EJEMPLO_H4] },
  guion: {
    duracion: 6500,
    toques: [
      { ms: 2200, en: `[data-opcion="${SOBRA}"]` },
    ],
  },
  cuadros: { gesto: 1 },
};

const ASI_CONCILIA = {
  actividadId: H7.id,
  titulo: H7.nombre,
  consigna: H7.consigna,
  pasos: PASOS_H7,
  alt: ALT_H7,
  demo: { items: EJEMPLO_H7 },
  guion: {
    duracion: 6500,
    toques: [
      { ms: 2200, en: `[data-destino="${LIBROS_MENOS}"]` },
    ],
  },
  cuadros: { gesto: 1 },
};

const ASI_SE_ASIENTA = {
  actividadId: H8.id,
  titulo: H8.nombre,
  consigna: H8.consigna,
  pasos: PASOS_H8,
  alt: ALT_H8,
  demo: { items: EJEMPLO_H8 },
  guion: {
    duracion: 6500,
    toques: [
      { ms: 2200, en: `[data-destino="${NO_SE_ASIENTA}"]` },
    ],
  },
  cuadros: { gesto: 1 },
};

export const ASI_SE_JUEGA_T4 = {
  [ASI_ENTRA_O_SALE.actividadId]: ASI_ENTRA_O_SALE,
  [ASI_CAJA_MENOR.actividadId]: ASI_CAJA_MENOR,
  [ASI_ARQUEO.actividadId]: ASI_ARQUEO,
  [ASI_CONCILIA.actividadId]: ASI_CONCILIA,
  [ASI_SE_ASIENTA.actividadId]: ASI_SE_ASIENTA,
};
