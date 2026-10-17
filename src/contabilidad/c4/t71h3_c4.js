import { ITEMS_H3, METODOS_H3, CAPAS_H3, CIFRAS_H3 } from "../../data/contabilidadT7_1_h3.js";
import { pesosC4 as $, opcionesDeNear } from "./t71Comun.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-1 H3 «¿Cuánto vale lo que sobró?» (Hacer · D4 + D9). Objeto propio:
 * la bodega por capas (Watari, sección t71-h3). La cifra escrita dice qué 10
 * cajas quedan y a qué precio, y si con ese método podían quedar; el costo
 * unitario se multiplica por las 80 y se compara con lo que costaron; en el
 * ítem 5, las tres barras del inventario final.
 *
 * Los ítems son los de Near (contabilidadT7_1_h3.js, v1 con la corrección 2):
 * pregunta, encabezado del método, acierto y cada distractor con su línea.
 * Los ítems 1 a 4 se escriben (cifra); el 5 se toca (los tres métodos).
 * Las cifras de la figura salen de los datos (CAPAS_H3, CIFRAS_H3).
 * Rótulos y textos de consecuencia: [W] pendiente de Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = CIFRAS_H3;
const [INICIO, COMPRA] = CAPAS_H3;
const nombreMetodo = (v) => METODOS_H3.find((m) => m.valor === v)?.texto ?? v;

export const ITEMS_C4_H3 = ITEMS_H3.map((it) => (it.opcionesTexto
  ? {
    id: it.id, subtema: it.subtema, texto: it.encabezado, pregunta: it.pregunta,
    opciones: [{ id: it.correcta, t: nombreMetodo(it.correcta), correcta: true }, ...it.distractores.map((d) => ({ id: d.valor, t: nombreMetodo(d.valor), msg: d.retro }))],
    bien: it.acierto,
  }
  : { id: it.id, tipo: "cifra", subtema: it.subtema, texto: it.encabezado, pregunta: it.pregunta, opciones: opcionesDeNear(it), bien: it.acierto }));

/* Con qué método se valora cada ítem de capas. */
const METODO = { peps: "peps", ueps: "ueps", "final-promedio": "promedio" };

/* [W] pendiente de Near. */
export const W_H3 = {
  titulo: (met) => `${met} · quedan ${C.quedan} de ${C.disponibles} cajas`,
  orden: { peps: "Salen primero las del inicio.", ueps: "Salen primero las compradas.", promedio: `Todas salen a ${$(C.promedio)}.` },
  metodo: { peps: "PEPS", ueps: "UEPS", promedio: "promedio" },
  estantes: { inicio: "Inicio", compra: "Compradas", prom: "Promedio" },
  quedan: (u, total) => `Quedan ${C.quedan} × ${$(u)} = ${$(total)}`,
  ninguna: (u) => `Ninguna caja cuesta ${$(u)}.`,
  yaSalieron: (met) => `Con ${met}, esas cajas ya salieron.`,
  sonLasQueQuedan: "Esas son las que quedan.",
  promedioTitulo: `Las ${C.disponibles} cajas al mismo costo`,
  promedioPor: (u, total) => `${C.disponibles} × ${u == null ? "$?" : $(u)} = ${total == null ? "$?" : $(total)}`,
  costaron: `Lo que costaron las ${C.disponibles}: ${$(C.costoTotal)}`,
  cuadraCosto: "Cuadra con lo que costaron.",
  difCosto: (x) => `${x > 0 ? "Sobran" : "Faltan"} ${$(Math.abs(x))} frente a lo que costaron.`,
  /* La línea de la cifra que se escribe, sin calificar (Mello C4-1); la forma de «Tu cifra» de H5 (Watari). */
  tuCifra: (x) => `Tu cifra: ${$(x)}`,
  barrasTitulo: `Inventario final de las ${C.quedan} cajas`,
  otroMasAlto: "Hay otro método que deja un inventario final más alto.",
};

/* Las tres barras del ítem 5: el inventario final de cada método. */
const FINAL = { peps: C.peps, ueps: C.ueps, promedio: C.finalPromedio };

function barras(item, e) {
  const max = Math.max(...Object.values(FINAL));
  const estado = {
    forma: "barras", titulo: W_H3.barrasTitulo, eleccion: e ?? null,
    barras: item.opciones.map((o) => ({ id: o.id, nombre: o.t, valor: e ? FINAL[o.id] : null, escala: e ? FINAL[o.id] / max : 0 })),
  };
  const o = item.opciones.find((x) => x.id === e);
  return o && !o.correcta ? { ...estado, falla: W_H3.otroMasAlto } : estado;
}

function promedio(x) {
  const tot = x == null ? null : x * C.disponibles;
  const estado = { forma: "promedio", titulo: W_H3.promedioTitulo, cajas: C.disponibles / 10, linea: W_H3.promedioPor(x, tot), costaron: W_H3.costaron, escrito: x };
  if (x == null) return estado;
  return tot === C.costoTotal ? { ...estado, cuadra: W_H3.cuadraCosto } : { ...estado, falla: W_H3.difCosto(tot - C.costoTotal) };
}

function capas(item, x) {
  const met = METODO[item.id];
  const u = x == null ? null : x / C.quedan;
  let capa = u === INICIO.costo ? "inicio" : u === COMPRA.costo ? "compra" : u === C.promedio ? "prom" : null;
  /* En PEPS y UEPS no hay cajas a $14.750; en el promedio, todas lo están. */
  if ((capa === "prom") !== (met === "promedio")) capa = null;
  const debe = met === "peps" ? "compra" : met === "ueps" ? "inicio" : "prom";
  const estantes = met === "promedio"
    ? [{ id: "prom", rotulo: W_H3.estantes.prom, precio: C.promedio, bloques: C.disponibles / 10 }]
    : [{ id: "inicio", rotulo: W_H3.estantes.inicio, precio: INICIO.costo, bloques: INICIO.cajas / 10 },
      { id: "compra", rotulo: W_H3.estantes.compra, precio: COMPRA.costo, bloques: COMPRA.cajas / 10 }];
  const estado = {
    forma: "capas", titulo: W_H3.titulo(W_H3.metodo[met]), orden: W_H3.orden[met], estantes,
    queda: x == null ? null : { capa, linea: W_H3.quedan(u, x), mal: capa !== debe },
  };
  if (x == null) return estado;
  if (!capa) return { ...estado, falla: W_H3.ninguna(u) };
  if (capa !== debe) return { ...estado, falla: W_H3.yaSalieron(W_H3.metodo[met]) };
  return { ...estado, cuadra: W_H3.sonLasQueQuedan };
}

/* Mientras se escribe (Mello C4-1): la cifra solo en su renglón; ni capa, ni total, ni calificación. */
export function escribiendoH3(item, x) {
  if (item.id === "costo-promedio") return { ...promedio(null), linea: W_H3.promedioPor(x, null) };
  return { ...capas(item, null), queda: { capa: null, linea: W_H3.tuCifra(x), mal: false, neutro: true } };
}

export const CONSECUENCIA_C4 = {
  id: "t71-h3",
  objeto: "La bodega por capas",
  modo: "hacer",
  /* D8 (Mello, v4 §1): el motor baraja las opciones una vez al montar, con utils/barajar.js. */
  barajar: true,
  items: ITEMS_C4_H3,
  consecuencia(item, e) {
    if (item.id === "mas-alto") return barras(item, e);
    if (item.id === "costo-promedio") return promedio(e ?? null);
    return capas(item, e ?? null);
  },
};
