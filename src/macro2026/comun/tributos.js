/*
 * MACRO 2026 · T3 — LOS TRES TRIBUTOS Y LAS DOS MARCAS (A2, A3, H1, H2, H3)
 *
 * Especificación de Gen (t3 §0). Impuesto, tasa y contribución llevan tres
 * colores fijos, y directo/indirecto una marca de FORMA: lupa o código de
 * barras. El color nunca va solo: cada tributo lleva su nombre escrito. Nunca
 * coral.
 *
 * Los tonos son los tokens Planck de T1 (--accent, --warning, --success). T3
 * no pinta C/I/G/XN junto a un tributo. La prueba t3-textos-y-bancos mide
 * cada tono contra el fondo (≥ 3:1) y contra la tinta oscura de las fichas
 * (≥ 4,5:1).
 */

export const TRIBUTOS = {
  impuesto: { id: "impuesto", nombre: "Impuesto", tono: "#6f86ff", token: "--accent" },
  tasa: { id: "tasa", nombre: "Tasa", tono: "#f2c14e", token: "--warning" },
  contribucion: { id: "contribucion", nombre: "Contribución", tono: "#4fc2b2", token: "--success" },
};
export const ORDEN_TRIBUTOS = ["impuesto", "tasa", "contribucion"];
export const tonoTributo = (id) => TRIBUTOS[id]?.tono ?? "#f4f5f7";

export const MARCAS = {
  directo: { id: "directo", nombre: "Directo", forma: "lupa" },
  indirecto: { id: "indirecto", nombre: "Indirecto", forma: "codigo" },
};
