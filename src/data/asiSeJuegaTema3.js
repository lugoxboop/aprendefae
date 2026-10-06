import { ACT2_T3, EJEMPLO_PANADERIA, PASOS_ACT2, ALT_TUTORIAL_ACT2 } from "./contabilidadTema3Act2.js";
import { ACT4_T3, EJEMPLO_ACT4, PASOS_ACT4, ALT_TUTORIAL_ACT4 } from "./contabilidadTema3Act4.js";
import { ACT5_T3, EJEMPLO_ACT5, PASOS_ACT5, ALT_TUTORIAL_ACT5 } from "./contabilidadTema3Act5.js";
import { ACT7_T3, EJEMPLO_ACT7, PASOS_ACT7, ALT_TUTORIAL_ACT7 } from "./contabilidadTema3Act7.js";
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

/*
 * Acts. 4 y 5: las panaderías de Gen. La mano pone los dos nombres, (en la 5
 * escribe el valor en cada cuenta), lleva cada ficha a su lado y confirma.
 * Con movimiento reducido, el cuadro del gesto deja las dos cuentas
 * nombradas y el último, el asiento armado y confirmado.
 */
const nombrar = (debe, haber) => [
  { ms: 1500, en: `[data-nombre="${debe}"]` },
  { ms: 2500, en: '[data-destino="nombre:0"]' },
  { ms: 3500, en: `[data-nombre="${haber}"]` },
  { ms: 4500, en: '[data-destino="nombre:1"]' },
];
const aLosLados = (desde) => [
  { ms: desde, en: '[data-ficha-valor="0"]' },
  { ms: desde + 1000, en: '[data-destino="0:debe"]' },
  { ms: desde + 2000, en: '[data-ficha-valor="1"]' },
  { ms: desde + 3000, en: '[data-destino="1:haber"]' },
  { ms: desde + 4200, en: "[data-confirmar]" },
];
const ASI_AJUSTE_ACUMULADO = {
  actividadId: ACT4_T3.id,
  titulo: ACT4_T3.nombre,
  consigna: ACT4_T3.consigna,
  pasos: PASOS_ACT4,
  alt: ALT_TUTORIAL_ACT4.replace(/^Ejemplo: /, ""),
  demo: { items: [EJEMPLO_ACT4] },
  guion: { duracion: 13500, toques: [...nombrar(EJEMPLO_ACT4.debe, EJEMPLO_ACT4.haber), ...aLosLados(5800)] },
  cuadros: { gesto: 4 },
};
const ASI_AJUSTE_DIFERIDO = {
  actividadId: ACT5_T3.id,
  titulo: ACT5_T3.nombre,
  consigna: ACT5_T3.consigna,
  pasos: PASOS_ACT5,
  alt: ALT_TUTORIAL_ACT5.replace(/^Ejemplo: /, ""),
  demo: { items: [EJEMPLO_ACT5] },
  guion: {
    duracion: 17000,
    toques: [
      ...nombrar(EJEMPLO_ACT5.debe, EJEMPLO_ACT5.haber),
      { ms: 5800, en: '[data-campo-valor="0"]', escribe: "600000" },
      { ms: 7300, en: '[data-campo-valor="1"]', escribe: "600000" },
      ...aLosLados(8800),
    ],
  },
  cuadros: { gesto: 4 },
};

/*
 * Act. 7: la panadería de Gen. La mano arma el asiento 1 (ingresos al debe,
 * Ganancias y pérdidas al haber), lo confirma, arma el 2, lo confirma y
 * escribe el saldo. Con movimiento reducido, el cuadro del gesto deja el
 * asiento 1 confirmado y el último, todo resuelto con la resolución de Gen.
 */
const ASI_CIERRE_COMPLETO = {
  actividadId: ACT7_T3.id,
  titulo: ACT7_T3.nombre,
  consigna: ACT7_T3.consigna,
  pasos: PASOS_ACT7,
  alt: ALT_TUTORIAL_ACT7.replace(/^Ejemplo: /, ""),
  demo: { items: [EJEMPLO_ACT7] },
  guion: {
    duracion: 25000,
    toques: [
      { ms: 1500, en: '[data-sacar="Ingresos por ventas:debe"]' },
      { ms: 2700, en: '[data-campo-cifra="1:Ingresos por ventas"]', escribe: "800000" },
      { ms: 4200, en: '[data-sacar="Ganancias y pérdidas:haber"]' },
      { ms: 5400, en: '[data-campo-cifra="1:Ganancias y pérdidas"]', escribe: "800000" },
      { ms: 6900, en: '[data-confirmar-parte="1"]' },
      { ms: 8400, en: '[data-sacar="Ganancias y pérdidas:debe"]' },
      { ms: 9600, en: '[data-campo-cifra="2:Ganancias y pérdidas"]', escribe: "500000" },
      { ms: 11100, en: '[data-sacar="Gasto harina:haber"]' },
      { ms: 12300, en: '[data-campo-cifra="2:Gasto harina"]', escribe: "300000" },
      { ms: 13800, en: '[data-sacar="Gasto salarios:haber"]' },
      { ms: 15000, en: '[data-campo-cifra="2:Gasto salarios"]', escribe: "200000" },
      { ms: 16500, en: '[data-confirmar-parte="2"]' },
      { ms: 18000, en: '[data-campo-cifra="saldo"]', escribe: "300000" },
      { ms: 19500, en: '[data-confirmar-parte="3"]' },
    ],
  },
  cuadros: { gesto: 5 },
};

export const ASI_SE_JUEGA_TEMA3 = Object.fromEntries([ASI_CUANDO_SE_CAUSA, ASI_AJUSTE_ACUMULADO, ASI_AJUSTE_DIFERIDO, ASI_QUE_LE_TOCA, ASI_CIERRE_COMPLETO].map((a) => [a.actividadId, a]));
