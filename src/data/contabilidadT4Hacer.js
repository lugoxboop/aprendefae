/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LO COMÚN DE LOS HACER REDISEÑADOS: H3, H4, H7 y H8 (Célula D).
 *
 * Textos: Katsumi (celula-d/katsumi-texto-hacer.md, aprobado por Yujiro el
 * 15 oct 2026). Copias en el canon: orquestador/conocimiento/paquetes/
 * d4-t4-h3-v2-rediseno.md, -h4-, -h7- y -h8-.
 *
 *   · las marcas de un campo de cifra (H7 fase 2 y H8 etapa 3): «No va aquí»
 *     no sirve para una cifra escrita (corte de Yujiro). Son «✓ Correcto»
 *     (`bien`) y «✗ Cifra errada» (`cifra-mal`), en MARCA de contabilidadT4.js
 *   · ESPERA_ERROR_MS: en el error, lo que iba se escribe a los 0,7 s
 *     (Hanayama, H3/H4/H7/H8 rediseño §1), como en H1
 *   · ESPERA_SALDOS_MS: en la fase 2 de H7, el par se queda 1,2 s con lo
 *     escrito antes de pasar a los saldos verdaderos (Hanayama, H7 §1)
 *   · formatos: las cifras con el formato del libro (miles con punto, sin
 *     «$»), y con signo menos tipográfico «−» cuando son negativas (Katsumi,
 *     decisión 5: la línea «diría» de H3)
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MARCA_CIFRA_BIEN = "bien";
export const MARCA_CIFRA_MAL = "cifra-mal";

export const ESPERA_ERROR_MS = 700;
export const ESPERA_SALDOS_MS = 1200;

/* 300.000; −300.000 (signo menos, U+2212, no guion). */
export const cifra = (n) => {
  const v = Math.round(n);
  const s = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return v < 0 ? `−${s}` : s;
};
/* $300.000 */
export const pesos = (n) => `$${cifra(n)}`;

/* Lee lo que se escribe en un campo de cifra: «2.551.700», «2551700», «$ 2.551.700». Vacío → null. */
export const leerCifra = (t) => { const d = String(t ?? "").replace(/\D/g, ""); return d ? Number(d) : null; };
/* Lo que se ve en el campo mientras se escribe: solo dígitos, con el punto de miles. */
export const escribirCifra = (t) => String(t ?? "").replace(/\D/g, "").replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/* Debe y haber, como en H1. */
export const DEBE = "debe";
export const HABER = "haber";
