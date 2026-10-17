import { H6_ID, ITEMS_H6, CIFRAS_H6, TARIFAS_H6 } from "../../data/contabilidadT7_1_h6.js";
import { pesosC4 as $, pctC4 } from "./t71Comun.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-1 H6 «La devolución en los dos libros» — la consecuencia, pura (D9).
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, sección
 * «t71-h6»; f71.js). La pinta FiguraNotaCredito en DevolucionDosLibros.jsx,
 * debajo de la pregunta; la figura acumulada del lote 5 no cambia.
 *
 * Objeto propio: la nota crédito de El Nogal. Cada cifra entra a su renglón
 * (IVA que se reversa, retención que se reversa, lo que baja la deuda) y la
 * nota dice qué parte de lo devuelto es. Los renglones ya resueltos se quedan
 * con su cifra; los que faltan, en $?.
 *
 * Correcciones de Mello (auditoria-mello-patron-c4.md):
 *   · C4-1  la cifra que se escribe solo se muestra en su renglón; nada que
 *           califique antes de «Comprobar» (escribiendoH6)
 *   · C4-3  el distractor de toda la compra no dice «128 % de lo devuelto»:
 *           dice la frase de Mello; ningún porcentaje mayor que lo devuelto
 *
 * Los asientos de los dos libros siguen como en main («Arma la línea»): propio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = CIFRAS_H6;

/* [W] pendiente de Near: rótulos de la nota y textos de la consecuencia de Watari (f71.js). */
export const TEXTOS_C4_H6 = {
  titulo: "Nota crédito · El Nogal a La Garza",
  devuelta: "Mercancía devuelta",
  renglones: { "iva-reversa": "+ IVA que se reversa", "retencion-reversa": "− Retención que se reversa", "baja-deuda": "= Baja la deuda" },
  parte: (x) => `${pctC4((100 * x) / C.devolucion, 1)} % de lo devuelto`,
  esTarifa: (p) => `Es el ${pctC4(p)} % de lo devuelto.`,
  otraTarifa: (x, p) => `Es el ${pctC4((100 * x) / C.devolucion, 1)} % de lo devuelto, y la tarifa es ${pctC4(p)} %.`,
  cuadra: "Cuadra con la nota.",
  frenteNota: (x) => `${x > C.baja ? "Sobran" : "Faltan"} ${$(Math.abs(x - C.baja))} frente a la nota.`,
  /* Mello C4-3, literal de la auditoría ([W] pendiente de Near). */
  ivaDeLaCompra: "Ese es el IVA de toda la compra; se reversa solo el de lo devuelto.",
  /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: «la misma idea para la retención» (Mello C4-3), pendiente de Near. */
  retencionDeLaCompra: "Esa es la retención de toda la compra; se reversa solo la de lo devuelto.",
};
const T = TEXTOS_C4_H6;
const TARIFA = { "iva-reversa": TARIFAS_H6.iva, "retencion-reversa": TARIFAS_H6.retencion };
const DE_LA_COMPRA = { "iva-reversa": [C.iva, T.ivaDeLaCompra], "retencion-reversa": [C.retencion, T.retencionDeLaCompra] };
export const RENGLONES_H6 = ["iva-reversa", "retencion-reversa", "baja-deuda"];

const opcionDe = (it, v) => ({ id: String(v), v, t: $(v), correcta: v === it.correcta, msg: it.distractores.find((d) => d.valor === v)?.retro ?? null });

export const ITEMS_C4_H6 = ITEMS_H6.map((it) => (it.tipo === "asiento"
  ? { id: it.id, tipo: "propio", subtema: it.subtema, pregunta: it.pregunta, opciones: [] }
  : { id: it.id, tipo: it.tipo, subtema: it.subtema, pregunta: it.pregunta, opciones: [it.correcta, ...it.distractores.map((d) => d.valor)].map((v) => opcionDe(it, v)), bien: it.acierto }));

/* Los renglones: los de antes, con su cifra correcta; el del ítem, con la elegida (o $?); los de después, en $?. */
function renglones(item, x) {
  const k = RENGLONES_H6.indexOf(item.id);
  return RENGLONES_H6.map((id, j) => {
    const v = j < k ? ITEMS_H6.find((i) => i.id === id).correcta : j === k ? x : null;
    const conParte = id !== "baja-deuda" && v != null && v <= C.devolucion;
    return { id, rotulo: T.renglones[id], valor: v, parte: conParte ? T.parte(v) : null, activa: j === k && v != null };
  });
}

export function consecuenciaH6(item, eleccion) {
  const x = eleccion == null || eleccion === "" ? null : Number(eleccion);
  const e = { titulo: T.titulo, devuelta: C.devolucion, renglones: renglones(item, x) };
  if (x == null) return e;
  if (item.id === "baja-deuda") return x === C.baja ? { ...e, cuadra: T.cuadra } : { ...e, falla: T.frenteNota(x) };
  const p = TARIFA[item.id];
  if (x === item.opciones.find((o) => o.correcta).v) return { ...e, cuadra: T.esTarifa(p) };
  const [compra, frase] = DE_LA_COMPRA[item.id];
  if (x !== compra) return { ...e, falla: T.otraTarifa(x, p) };
  /* C4-3: lo de toda la compra no se mide como parte de lo devuelto («128 %», «28 %»): solo la frase de Mello. */
  return { ...e, renglones: e.renglones.map((r) => (r.id === item.id ? { ...r, parte: null } : r)), falla: frase };
}

/* C4-1: mientras se escribe, la cifra solo en su renglón; sin parte, sin activa, sin calificar. */
export function escribiendoH6(item, x) {
  const e = consecuenciaH6(item, null);
  return { ...e, renglones: e.renglones.map((r) => (r.id === item.id ? { ...r, valor: x } : r)) };
}

export const CONSECUENCIA_C4 = {
  id: H6_ID,
  objeto: "La nota crédito de El Nogal",
  modo: "hacer",
  items: ITEMS_C4_H6,
  consecuencia: consecuenciaH6,
};
