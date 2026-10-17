import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 A2 · LOS RÓTULOS [W] DE NEAR PARA EL PATRÓN C3 (Célula C). No es una
 * prueba: lo importa t7-1-a2-la-factura-completa-c3.test.mjs.
 *
 * Fuente: orquestador/conocimiento/paquetes/c3-rotulos-near.md, que queda
 * como llegó. Un archivo por pieza (A5 y A6 tendrán el suyo): `seccion(nombre)`
 * lee cualquier «## …» del paquete por su nombre, y este ayudante solo usa
 * «## A2».
 *
 * Cada rótulo sale de la tabla de Near, fila por fila: la fila se busca por
 * el rótulo de Watari (primera columna) y los textos de Near son los «…» de
 * la segunda. Si una fila falta o trae otro número de textos, falla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAQUETES = new URL("../../../orquestador/conocimiento/paquetes/", import.meta.url);
const falla = (m) => { throw new Error(m); };

export const NEAR = readFileSync(new URL("c3-rotulos-near.md", PAQUETES), "utf8");

/** Una sección «## <nombre>…» del paquete, hasta la siguiente «## ». */
export function seccion(nombre, md = NEAR) {
  const ini = md.indexOf(`\n## ${nombre}`);
  if (ini < 0) falla(`no está la sección «## ${nombre}»`);
  const fin = md.indexOf("\n## ", ini + 4);
  return md.slice(ini + 1, fin < 0 ? undefined : fin);
}

export const A2 = seccion("A2");
if (!A2.startsWith("## A2 · La factura completa")) falla("la sección A2 cambió de nombre");

const comillas = (t) => [...t.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
/** Los textos de Near de la fila cuyo rótulo de Watari es `watari` (n: cuántos debe traer). */
export function fila(watari, n, md = A2) {
  const filas = md.split("\n").filter((l) => l.startsWith("| ") && l.split("|")[1].includes(watari));
  if (filas.length !== 1) falla(`«${watari}»: ${filas.length} filas en la tabla de Near`);
  const textos = comillas(filas[0].split("|")[2]);
  if (textos.length !== n) falla(`«${watari}»: Near trae ${textos.length} textos, no ${n}`);
  return textos;
}

const [sumarIva] = fila("Botón «Sumar el IVA»", 1);
const [descontarRetencion] = fila("Botón «Descontar la retención»", 1);
const [facturaCompra, facturaVenta] = fila("«Factura · La Reventa compra»", 2);
const [debeCompra, debeVenta] = fila("«Queda debiendo»", 2);
const [dian] = fila("«Dirección de Impuestos»", 1);
const [asientoCompra, asientoVenta] = fila("Asientos", 2);
const [compra, venta] = fila("Selector", 2);
const [consignaLadoALado] = fila("Consigna (P6)", 1);

/* Quién es quién en cada fila doble: Near lo dice con «Compra:» y «Venta…:». */
for (const [watari, a, b] of [["«Factura · La Reventa compra»", "Compra:", "Venta (P5):"], ["«Queda debiendo»", "Compra:", "Venta:"]]) {
  const celda = A2.split("\n").find((l) => l.startsWith("| ") && l.split("|")[1].includes(watari)).split("|")[2];
  if (!(celda.indexOf(a) >= 0 && celda.indexOf(a) < celda.indexOf(b))) falla(`«${watari}»: no está claro cuál es la compra y cuál la venta`);
}

export const ROTULOS_NEAR_A2 = {
  sumarIva, descontarRetencion, facturaCompra, facturaVenta, debeCompra, debeVenta, dian,
  asientoCompra, asientoVenta, compra, venta, consignaLadoALado,
};

/* Lo de Watari que Near cambia: [lo de Watari en su código, lo de Near]. Para corregir el código de referencia. */
export const PARES_A2 = [
  ["<span>Factura · La Reventa compra</span>", `<span>${facturaCompra}</span>`],
  ["<span>Queda debiendo</span>", `<span>${debeCompra}</span>`],
  ["<span>Dirección de Impuestos</span>", `<span>${dian}</span>`],
  ["Factura de la venta · ", `${facturaVenta} · `],
];

/* ═══════════ EL §5 DE MELLO, RESUELTO POR NEAR (c3-mello-near.md) ═══════════ */

/*
 * Los textos que Near reescribe para A2: la portada (N-3) y el lado a lado
 * (N-1 y N-2). Cada uno sale de la tabla «Campo | Nuevo» de su sección, por
 * el nombre exacto del campo; si un campo falta o se repite, falla.
 */
export const NEAR_5 = readFileSync(new URL("c3-mello-near.md", PAQUETES), "utf8");
export const N3_A2 = seccion("N-3 · A2, portada", NEAR_5);
export const LADO_A_LADO_A2 = seccion("A2 · lado a lado", NEAR_5);

/** Los «…» de las filas cuyo campo (primera columna) es exactamente `campo`, en orden. */
export function campo(nombre, md) {
  const filas = md.split("\n").filter((l) => l.startsWith("| ") && l.split("|")[1].trim() === nombre);
  if (!filas.length) falla(`«${nombre}»: no está en la tabla de Near`);
  return filas.map((l) => { const t = comillas(l.split("|")[2]); if (t.length !== 1) falla(`«${nombre}»: ${t.length} textos en una fila`); return t[0]; });
}
const uno = (nombre, md) => { const t = campo(nombre, md); if (t.length !== 1) falla(`«${nombre}»: ${t.length} filas`); return t[0]; };

const malas = campo("Opción", LADO_A_LADO_A2);
if (malas.length !== 2) falla(`el lado a lado trae ${malas.length} opciones malas, no 2`);
export const TEXTOS_NEAR_A2 = {
  portada: uno("Portada", N3_A2),
  pregunta: uno("Pregunta", LADO_A_LADO_A2),
  /* En el orden de main: la correcta, «siempre se resta» y «la tarifa es distinta». */
  opciones: [uno("Opción correcta", LADO_A_LADO_A2), ...malas],
  pista: uno("Pista", LADO_A_LADO_A2),
  acierto: uno("Acierto", LADO_A_LADO_A2),
};
/* Near deja las devoluciones de main. */
if (!LADO_A_LADO_A2.includes("Las dos devoluciones de main no cambian.")) falla("Near ya no dice que las devoluciones de main no cambian");
