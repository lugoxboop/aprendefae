import { PIEZA_CONTROL_INTERNO } from "../../data/contabilidadT7_1_a7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-1 A7 «El viaje de una caja» (Aprender · D4). Objeto propio: el
 * camino de la caja (Watari, patrón de enganche C4, sección t71-a7).
 *
 * Los textos son los de Near en main (contabilidadT7_1_a7.js, la v1 con la
 * v2, PASA de Mello): las dos pantallas con pregunta, tal cual. Near los está
 * recortando (pasan de 60 palabras): la prueba los lleva en PENDIENTES_NEAR.
 *
 * La consecuencia: el control se pone donde dice la opción y la caja sigue su
 * viaje hasta ahí; se ve hasta dónde llegan las 20 cajas de más (o las 10 que
 * salen sin papel).
 * Todos los rótulos del camino y los textos de consecuencia son de Watari:
 * [W] pendiente de Near (nunca en pantalla esa marca).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = PIEZA_CONTROL_INTERNO.pantallas;
const conPregunta = P.filter((p) => p.opciones);

/* Las pantallas sin pregunta, tal cual, para la vista (portada, «Por qué cuidarlo» y el resumen). */
export const PORTADA_A7 = P.find((p) => p.tipo === "portada");
export const LECTURA_A7 = P.find((p) => p.tipo === "lectura");
export const RESUMEN_A7 = P.find((p) => p.tipo === "resumen");

export const ITEMS_A7 = conPregunta.map((p) => ({
  id: p.id,
  texto: [...p.parrafos, ...(p.lista ?? []), ...(p.despues ?? [])].join(" "),
  parrafos: p.parrafos, lista: p.lista ?? null, despues: p.despues ?? null,
  pregunta: p.pregunta,
  opciones: p.opciones.map((o) => ({ id: o.id, t: o.texto, correcta: Boolean(o.correcta), msg: o.devolucion ?? null })),
  pista: p.pista,
  bien: p.acierto.texto,
  pie: p.pie,
}));

/* [W] pendiente de Near: los rótulos del camino, el control y la consecuencia. */
export const W_A7 = {
  recibir: {
    titulo: "Orden: 80 cajas · Factura: 100 cajas",
    control: "Aquí se compara",
    llegan: "Llegan 100 cajas.",
    devuelven: "Llegan 100. Se devuelven 20 antes de entrar.",
    entranTodas: "Llegan 100 y entran todas.",
    entran: (n) => `Entran ${n}.`,
    registra: (n) => `Registra la compra de ${n} cajas.`,
    cuenta: (n) => `El conteo encuentra ${n}.`,
    cuadra: "Se pagan 80: lo que se pidió.",
    falla: (donde) => `Ya se aceptaron y se pagan 100 cajas. Las 20 de más se notan ${donde}, cuando ya entraron.`,
    alCierre: "al cierre",
    enContabilidad: "en contabilidad",
  },
  seguridad: {
    titulo: "Piden 10 cajas de palabra",
    control: "Aquí se controla",
    listas: "10 cajas listas para salir.",
    menos: "Quedan 10 cajas menos.",
    quedan: "Las 10 cajas se quedan.",
    noSalen: "Sin requisición autorizada, no salen.",
    sinPapel: "Salen sin papel.",
    poliza: "La póliza paga pérdidas; esta entrega no lo es.",
    conteo: "Meses después, faltan 10.",
    cuadra: "Sin requisición, no sale nada.",
    falla: "Las cajas ya salieron: este control llega tarde o no las detiene.",
  },
  pasos: { recibo: "Recibo", bodega: "Bodega", contabilidad: "Contabilidad", cierre: "Cierre", puerta: "Puerta", seguro: "Seguro", conteo: "Conteo" },
  vacio: "—",
};

const paso = (id, rotulo, texto, control = null) => ({ id, rotulo, texto, control });

function recibir(e) {
  const W = W_A7.recibir; const R = W_A7.pasos; const v = W_A7.vacio;
  const pasan = e === "al-recibir" ? 80 : 100;
  const ctl = (id) => (e === id ? W.control : null);
  const pasos = [
    paso("al-recibir", R.recibo, !e ? W.llegan : e === "al-recibir" ? W.devuelven : W.entranTodas, ctl("al-recibir")),
    paso("bodega", R.bodega, e ? W.entran(pasan) : v),
    paso("contabilidad", R.contabilidad, e ? W.registra(pasan) : v, ctl("contabilidad")),
    paso("conteo", R.cierre, e ? W.cuenta(pasan) : v, ctl("conteo")),
  ];
  const estado = { titulo: W.titulo, eleccion: e, pasos };
  if (!e) return estado;
  if (e === "al-recibir") return { ...estado, cuadra: W.cuadra };
  return { ...estado, falla: W.falla(e === "conteo" ? W.alCierre : W.enContabilidad) };
}

function seguridad(e) {
  const W = W_A7.seguridad; const R = W_A7.pasos; const v = W_A7.vacio;
  const sale = Boolean(e) && e !== "requisicion";
  const pasos = [
    paso("bodega", R.bodega, !e ? W.listas : sale ? W.menos : W.quedan),
    paso("requisicion", R.puerta, e === "requisicion" ? W.noSalen : e ? W.sinPapel : v, e === "requisicion" ? W.control : null),
    paso("poliza", R.seguro, e === "poliza" ? W.poliza : v, e === "poliza" ? W.control : null),
    paso("conteos", R.conteo, e === "conteos" ? W.conteo : v, e === "conteos" ? W.control : null),
  ];
  const estado = { titulo: W.titulo, eleccion: e, pasos };
  if (!e) return estado;
  return sale ? { ...estado, falla: W.falla } : { ...estado, cuadra: W.cuadra };
}

export const CONSECUENCIA_C4 = {
  id: "t71-a7",
  objeto: "El camino de la caja",
  modo: "aprender",
  items: ITEMS_A7,
  consecuencia(item, eleccion) {
    return item.id === "al-recibir" ? recibir(eleccion ?? null) : seguridad(eleccion ?? null);
  },
};
