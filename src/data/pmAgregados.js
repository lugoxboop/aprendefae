/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA — «LAS TALLAS DEL DINERO» (encargo de Erwin).
 *
 * La pieza que mide el dinero: la escalera de liquidez (base monetaria, M1,
 * M2 y M3), el criterio que la ordena (la liquidez, no el tamaño) y qué mueve
 * cada instrumento (los TES, la base; el encaje, cuánto se multiplica; la
 * tasa, cuánto crédito se pide). Y dos juegos atados a ella.
 *
 * Archivo nuevo a propósito: la Célula B construye otra pieza del mismo tema
 * al mismo tiempo, y politicaMonetaria.js no se toca. El molde es el de ese
 * archivo, sin cambios:
 *   · la pieza de Aprender: { id, titulo, nombres, pasos, pregunta, respuesta }
 *   · los juegos: el banco de QUIEN_DECIDE (categorías, ítems con respuesta,
 *     retro con ✅/❌), que pinta PrimeraClasificacion
 *
 * EL TEXTO es de Near, con el PASA de Mello, que verifica las definiciones
 * contra el Banco de la República. Lo que no venga de ahí va marcado
 * [ESCRITO POR CLAUDE, NO POR LA FICHA], como en politicaMonetaria.js.
 *
 * LAS CIFRAS: las únicas reales son las de DATOS_VERIFICADOS (se importan, no
 * se copian). Cualquier otra va rotulada ROTULO_SIMULADO. Ningún saldo real de
 * M1 ni de M2.
 *
 * COHERENCIA CON LO PUBLICADO: en QUIEN_DECIDE, «Emitir bonos de deuda pública
 * (TES)» es del gobierno. El Banco no emite TES: los compra. La pieza lo dice.
 *
 * ═══════════ ANDAMIAJE ═══════════
 * Mientras llega el texto, cada campo de texto vale PENDIENTE. Una prueba de
 * monetaria-aprender.test.mjs se pone roja si queda alguno: así no se puede
 * abrir el PR con un hueco.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export { DATOS_VERIFICADOS, ROTULO_SIMULADO } from "./politicaMonetaria.js";

export const PENDIENTE = "⟦PENDIENTE: texto de Near con el PASA de Mello⟧";

/* Los tres peldaños que se clasifican en el juego 1 (decisión de L: M2 y M3 juntos). */
export const TALLAS = [
  { id: "base", nombre: PENDIENTE },
  { id: "m1", nombre: PENDIENTE },
  { id: "m2m3", nombre: PENDIENTE },
];

/* Los tres puntos de la escalera donde pega primero cada instrumento (juego 2). */
export const PUNTOS = [
  { id: "base", nombre: PENDIENTE }, // los TES: el Banco los compra y crea pesos nuevos
  { id: "multiplicacion", nombre: PENDIENTE }, // el encaje: cuánto se multiplica la base
  { id: "credito", nombre: PENDIENTE }, // la tasa: cuánto crédito se pide
];

/* ═══════════════════════════ APRENDER (cero FP) ═══════════════════════════ */

export const APRENDER_TALLAS = {
  id: "las-tallas-del-dinero",
  titulo: "Las tallas del dinero",
  nombres: [],
  pasos: [],
  pregunta: PENDIENTE,
  respuesta: PENDIENTE,
};

/* ═══════════════════════════ BLOQUE 1 · CIMIENTOS ═══════════════════════════ */

/* Juego 1 — ¿En qué talla va? Fácil · 10 FP · evaluativa. Castiga el CDT en M1. */
export const EN_QUE_TALLA_VA = {
  id: "en-que-talla-va",
  nombre: "¿En qué talla va?",
  subtema: PENDIENTE,
  porPartida: 6,
  pregunta: PENDIENTE,
  categorias: TALLAS,
  items: [],
  retro: () => PENDIENTE,
};

/* ═══════════════════════════ BLOQUE 2 · APLICACIÓN ═══════════════════════════ */

/* Juego 2 — ¿Qué tocó el Banco? Medio · 25 FP · evaluativa. */
export const QUE_TOCO_EL_BANCO = {
  id: "que-toco-el-banco",
  nombre: "¿Qué tocó el Banco?",
  subtema: PENDIENTE,
  porPartida: 6,
  pregunta: PENDIENTE,
  categorias: PUNTOS,
  items: [],
  retro: () => PENDIENTE,
};
