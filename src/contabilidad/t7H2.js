import { ITEMS_H2 } from "../data/contabilidadT7_1_h2.js";
import { pesos } from "../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H2 «Arma la factura» — la lógica, sin React.
 *
 *   prepararH2(barajar)       los seis ítems en su orden; dentro de cada uno,
 *                             las opciones de un cálculo y las líneas de un
 *                             asiento, barajadas en cada intento
 *   evaluarCalculoH2(ítem, v) el veredicto de un cálculo y su texto: el
 *                             acierto, o la retroalimentación del distractor
 *   evaluarLineaH2(línea, l)  el veredicto de una línea y, si falla, su mensaje
 *   unidadesH2()              las doce unidades que puntúan, con su id para el
 *                             detalle: «iva-compra», «asiento-compra:compras»…
 *   puntuarH2(aciertos)       aciertos / 12 × 100. Es evaluativa: el motor
 *                             escala los 25 FP con este porcentaje
 *   unidadDeH2(id)            el texto de cada unidad, para el panel docente
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const opcionesDe = (item) => [item.correcta, ...item.distractores.map((d) => d.valor)];

export const prepararH2 = (barajar) =>
  ITEMS_H2.map((it) => (it.tipo === "calculo"
    ? { ...it, opciones: barajar(opcionesDe(it)) }
    : { ...it, orden: barajar(it.lineas.map((l) => l.id)) }));

export function evaluarCalculoH2(item, valor) {
  const ok = valor === item.correcta;
  return { ok, correcta: item.correcta, texto: ok ? item.acierto : item.distractores.find((d) => d.valor === valor)?.retro ?? null };
}

export function evaluarLineaH2(linea, lado) {
  const ok = lado === linea.lado;
  return { ok, correcto: linea.lado, texto: ok ? null : linea.retro };
}

export const idDeLinea = (item, linea) => `${item.id}:${linea.id}`;

export const unidadesH2 = () =>
  ITEMS_H2.flatMap((it) => (it.tipo === "calculo" ? [it.id] : it.lineas.map((l) => idDeLinea(it, l))));

export const TOTAL_H2 = unidadesH2().length;

export const puntuarH2 = (aciertos, total = TOTAL_H2) => (total ? (aciertos / total) * 100 : 0);

/* Un cálculo se lee por su pregunta; una línea, por su cuenta y su valor. */
export function unidadDeH2(id) {
  const [itemId, lineaId] = String(id).split(":");
  const it = ITEMS_H2.find((x) => x.id === itemId);
  if (!it) return null;
  if (!lineaId) return it.tipo === "calculo" ? it.pregunta : null;
  const l = it.lineas?.find((x) => x.id === lineaId);
  return l ? `${l.cuenta} ${pesos(l.valor)}` : null;
}
