/*
 * MACRO 2026 · T5 — EL PESO Y EL DÓLAR (especificación de Gen, t5 §0)
 *
 * Dos tonos fijos en las 13 piezas de Política cambiaria, nunca coral, y
 * SIEMPRE con su símbolo ($ y USD) además del color. Son tokens de la misma
 * paleta de T1–T3 que no chocan con el tono de la rama cambiaria (#e9c46a):
 * el peso va con --accent-hover y el dólar con --success. La prueba
 * t5-textos-y-bancos mide cada tono contra el fondo (≥ 3:1) y contra la tinta
 * oscura de las fichas (≥ 4,5:1).
 */

export const MONEDAS = {
  peso: { id: "peso", nombre: "Peso", simbolo: "$", tono: "#8a9cff", token: "--accent-hover" },
  dolar: { id: "dolar", nombre: "Dólar", simbolo: "USD", tono: "#4fc2b2", token: "--success" },
};
export const PESO = MONEDAS.peso.tono;
export const DOLAR = MONEDAS.dolar.tono;
