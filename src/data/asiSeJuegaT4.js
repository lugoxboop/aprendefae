import { H1, PASOS_H1, EJEMPLO_H1, ALT_H1, HABER } from "./contabilidadT4H1.js";
import { H2, PASOS_H2, EJEMPLO_H2, ALT_H2 } from "./contabilidadT4H2.js";
import { H3, PASOS_H3, EJEMPLO_H3, ALT_H3, BOTON_H3 } from "./contabilidadT4H3.js";
import { H4, PASOS_H4, EJEMPLO_H4, ALT_H4, BOTON_H4, CUADRA } from "./contabilidadT4H4.js";
import { H5, PASOS_H5, EJEMPLO_H5, ALT_H5, BOTON_H5 } from "./contabilidadT4H5.js";
import { H6, PASOS_H6, EJEMPLO_H6, ALT_H6 } from "./contabilidadT4H6.js";

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
 *
 * t4-el-arqueo-de-rosa (H4): un mes cualquiera que cuadra (construido, no
 * es ninguna de las seis rondas). La mano responde «Cuadra», sigue (no hay
 * pregunta de la diferencia) y en la pregunta del cheque toca «$420.000».
 *
 * t4-al-empleado-o-al-gasto (H5): el caso sin empresa del paquete (fondo
 * 300.000; construido, no es ninguno de los cuatro). La mano pone Gastos
 * generales al debe con 251.000, Cuentas por cobrar – empleados al debe con
 * 4.000 y Bancos al haber con 255.000, y confirma. Escribe cada cifra tecla
 * por tecla en el campo de su fila del constructor compartido.
 *
 * t4-quien-se-entero-primero (H6): el cheque de la luz (construido, no es
 * ninguna de las ocho partidas). La mano TOCA «Todavía no lo tiene el
 * banco»: los destinos son de un toque (Hanayama H6 v1 §1), aunque el
 * paquete diga «arrastra».
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

const ASI_ARQUEO = {
  actividadId: H4.id,
  titulo: H4.nombre,
  consigna: H4.consigna.join(" "),
  pasos: PASOS_H4,
  alt: ALT_H4,
  demo: { items: [EJEMPLO_H4] },
  guion: {
    duracion: 9000,
    toques: [
      { ms: 2200, en: `[data-opcion="${CUADRA}"] button` },
      { ms: 4000, texto: BOTON_H4.siguientePregunta },
      { ms: 6000, en: '[data-opcion="cheque"] button' },
    ],
  },
  cuadros: { gesto: 2 },
};

const [L1, L2, L3] = EJEMPLO_H5.asiento;
const ASI_EMPLEADO_O_GASTO = {
  actividadId: H5.id,
  titulo: H5.nombre,
  consigna: H5.consigna.join(" "),
  pasos: PASOS_H5,
  alt: ALT_H5,
  demo: { items: [EJEMPLO_H5] },
  guion: {
    duracion: 15000,
    toques: [
      { ms: 1500, texto: L1.cuenta },
      { ms: 2400, en: '[data-fila-asiento="0"] > div:nth-child(2) > button:first-child' },
      { ms: 3200, en: '[data-fila-asiento="0"] input', escribe: String(L1.valor) },
      { ms: 5000, texto: L2.cuenta },
      { ms: 5900, en: '[data-fila-asiento="1"] > div:nth-child(2) > button:first-child' },
      { ms: 6700, en: '[data-fila-asiento="1"] input', escribe: String(L2.valor) },
      { ms: 8200, texto: L3.cuenta },
      { ms: 9100, en: '[data-fila-asiento="2"] > div:nth-child(2) > button:last-child' },
      { ms: 9900, en: '[data-fila-asiento="2"] input', escribe: String(L3.valor) },
      { ms: 12000, texto: BOTON_H5.confirmar },
    ],
  },
  cuadros: { gesto: 2 },
};

const ASI_QUIEN_PRIMERO = {
  actividadId: H6.id,
  titulo: H6.nombre,
  consigna: H6.consigna.join(" "),
  pasos: PASOS_H6,
  alt: ALT_H6,
  demo: { items: [EJEMPLO_H6] },
  guion: {
    duracion: 6500,
    toques: [
      { ms: 2200, en: `[data-opcion="${EJEMPLO_H6.respuesta}"] button` },
    ],
  },
  cuadros: { gesto: 1 },
};

export const ASI_SE_JUEGA_T4 = {
  [ASI_ENTRA_O_SALE.actividadId]: ASI_ENTRA_O_SALE,
  [ASI_CONTROL.actividadId]: ASI_CONTROL,
  [ASI_CAJA_MENOR.actividadId]: ASI_CAJA_MENOR,
  [ASI_ARQUEO.actividadId]: ASI_ARQUEO,
  [ASI_EMPLEADO_O_GASTO.actividadId]: ASI_EMPLEADO_O_GASTO,
  [ASI_QUIEN_PRIMERO.actividadId]: ASI_QUIEN_PRIMERO,
};
