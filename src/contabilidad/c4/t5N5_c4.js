import { ITEMS_N5, CIFRAS_N5, ACCIONES_N5, PRECIO_N5, VENTA1_N5, VENTA2_N5, RESULTADOS_N5 } from "../../data/contabilidadT5_n5.js";
import { pesos } from "../../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T5 N5 «¿Ganó o perdió?» — la consecuencia, pura (D9).
 * Patrón de enganche C4 de Watari (patron-enganche-c4-v1.html, #t5-n5).
 *
 * Objeto propio: las 900 acciones de Acacia, una barra. La cifra escrita dice
 * cuántas acciones son a ese precio (la barra crece hasta ellas); en las dos
 * de «¿Ganó o perdió?», la barra marca las vendidas y la línea dice lo que se
 * eligió y escribió. La fila «Recibe … · le costaron …» sale al cerrar el
 * ítem, nunca antes (E8 de Mello: en el ítem 7 serían las cifras que se
 * piden calcular).
 *
 * Como en main (y no como en el prototipo, que solo pedía el monto): esas
 * dos se califican con resultado y monto juntos. Aquí, su `eleccion` es
 * «resultado|valor» (la forma del `detalle`, respuestaN5) o { resultado,
 * valor } desde la pieza; un distractor de Near sin resultado es «valor».
 * Los asientos no entran (tipo "propio"): siguen con «Arma la línea».
 *
 * [W] pendiente de Near: el título de la barra, «? acciones», «acciones ×»,
 * «Las 550», «Recibe … · le costaron …» y las frases de `falla` y `cuadra`
 * son de Watari (codigo-f5, t5-n5), sin revisar por Near.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const C = CIFRAS_N5;
const num = (n) => (Number.isInteger(n) ? n.toLocaleString("es-CO") : n.toLocaleString("es-CO", { maximumFractionDigits: 1 }));
const RESULTADO = Object.fromEntries(RESULTADOS_N5.map((r) => [r.valor, r.texto]));

/* Las de la barra: a qué precio se cuentan las acciones de la cifra escrita. */
export const PRECIO_DE_N5 = { "lo-que-recibe": VENTA1_N5.precio, "lo-que-costaron": PRECIO_N5 };
export const VENTA_DE_N5 = {
  "gano-o-perdio-1": { vendidas: VENTA1_N5.acciones, recibe: C.recibe1, costo: C.costo1 },
  "gano-o-perdio-2": { vendidas: ACCIONES_N5 - VENTA1_N5.acciones, recibe: C.recibe2, costo: C.costo2 },
};

/* [W] pendiente de Near · los rótulos y las frases de la barra. */
export const TEXTOS_N5_C4 = {
  titulo: `${ACCIONES_N5} acciones · compradas a ${pesos(PRECIO_N5)}`,
  sinCifra: "? acciones",
  acciones: (n, precio) => `${num(n)} acciones × ${pesos(precio)}`,
  las: (n) => `Las ${n}`,
  fila: (recibe, costo) => `Recibe ${pesos(recibe)} · le costaron ${pesos(costo)}`,
  cuadraAcciones: "Son las 550 que vendió.",
  fallaAcciones: (n) => `Así son ${num(n)}, no las 550 que vendió.`,
  /* Mello C4-3: la falla del distractor $2.970.000 de lo-que-costaron nombra el error real. [W] pendiente de Near. */
  fallaPrecioDeVenta: "Así cada acción habría costado $5.400: es el precio de venta, no el de compra.",
  /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: una cifra cualquiera que no da acciones enteras (Mello: ninguna figura muestra unidades fraccionarias). */
  fallaNoEnteras: (precio) => `Así no salen acciones enteras a ${pesos(precio)}.`,
  cuadraDiferencia: (gano) => (gano ? "Ganó esa diferencia." : "Perdió esa diferencia."),
  /* Sin montos negativos (Mello, C4-3): si perdió, la resta va al revés. [W] pendiente de Near (adaptada). */
  fallaDiferencia: (x, r) => (r < 0
    ? `${pesos(x)} no es eso: lo que costó menos lo que recibe da ${pesos(-r)}.`
    : `${pesos(x)} no es eso: lo que recibe menos lo que costó da ${pesos(r)}.`),
  /* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: el prototipo no califica el resultado; esta es la falla del monto bien con el resultado al revés. */
  fallaResultado: (x, res) => `Así, ${pesos(x)} quedarían como ${res === "gano" ? "ganancia" : "pérdida"}.`,
};

/* «perdio|165000», «2970000» o { resultado, valor } → { resultado, valor }. */
export function partesN5(eleccion) {
  if (eleccion == null) return { resultado: null, valor: null };
  if (typeof eleccion === "object") return { resultado: eleccion.resultado ?? null, valor: eleccion.valor ?? null };
  const [a, b] = String(eleccion).split("|");
  return b === undefined ? { resultado: null, valor: Number(a) } : { resultado: a, valor: Number(b) };
}

const itemC4 = (it) => {
  if (it.tipo === "asiento") return { id: it.id, tipo: "propio", opciones: [] };
  if (!it.resultado) {
    return { id: it.id, tipo: "cifra", pregunta: it.pregunta, pista: it.pista, bien: it.acierto,
      opciones: [{ id: String(it.correcta), t: pesos(it.correcta), v: it.correcta, correcta: true }, ...it.distractores.map((d) => ({ id: String(d.valor), t: pesos(d.valor), v: d.valor, msg: d.retro }))] };
  }
  const id = (r, v) => (r ? `${r}|${v}` : String(v));
  const t = (r, v) => (r ? `${RESULTADO[r]} ${pesos(v)}` : pesos(v));
  return { id: it.id, tipo: "eleccion", resultado: it.resultado, pregunta: it.pregunta, pista: it.pista, bien: it.acierto,
    opciones: [{ id: id(it.resultado, it.correcta), t: t(it.resultado, it.correcta), correcta: true }, ...it.distractores.map((d) => ({ id: id(d.resultado, d.valor), t: t(d.resultado, d.valor), msg: d.retro }))] };
};

export const CONSECUENCIA_C4 = {
  id: "t5-n5",
  objeto: "Las 900 acciones de Acacia",
  modo: "hacer",
  items: ITEMS_N5.map(itemC4),
  consecuencia(item, eleccion) {
    const T = TEXTOS_N5_C4;
    const { resultado, valor: x } = partesN5(eleccion);
    const precio = PRECIO_DE_N5[item.id];
    if (precio) {
      const base = { titulo: T.titulo, total: ACCIONES_N5 };
      if (x == null) return { ...base, acciones: null, linea: T.sinCifra };
      const n = x / precio;
      const bien = item.opciones.find((o) => o.correcta).v;
      /* Mello C4-3: el precio de venta en lo-que-costaron; y ninguna figura muestra acciones partidas. */
      if (item.id === "lo-que-costaron" && x === C.recibe1) return { ...base, valor: x, acciones: VENTA1_N5.acciones, linea: T.acciones(VENTA1_N5.acciones, VENTA1_N5.precio), falla: T.fallaPrecioDeVenta };
      if (!Number.isInteger(n)) return { ...base, valor: x, acciones: null, linea: T.sinCifra, falla: T.fallaNoEnteras(precio) };
      const estado = { ...base, valor: x, acciones: Math.min(ACCIONES_N5, Math.max(0, n)), linea: T.acciones(n, precio) };
      return x === bien ? { ...estado, cuadra: T.cuadraAcciones } : { ...estado, falla: T.fallaAcciones(n) };
    }
    const venta = VENTA_DE_N5[item.id];
    const r = venta.recibe - venta.costo;
    const estado = { titulo: T.titulo, total: ACCIONES_N5, acciones: venta.vendidas, linea: T.las(venta.vendidas), fila: T.fila(venta.recibe, venta.costo), resultado, valor: x,
      eleccion: x == null ? null : resultado ? `${RESULTADO[resultado]} ${pesos(x)}` : pesos(x) };
    if (x == null) return estado;
    /* `delata`: la falla dice la diferencia buena; con la escalera, sale al cerrar el ítem (E8). */
    if (x !== Math.abs(r)) return { ...estado, falla: T.fallaDiferencia(x, r), delata: true };
    if (resultado !== item.resultado) return resultado ? { ...estado, falla: T.fallaResultado(x, resultado) } : estado;
    return { ...estado, cuadra: T.cuadraDiferencia(r > 0) };
  },
};
