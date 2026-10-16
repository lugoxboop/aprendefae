import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FIGURA ACUMULADA (Célula C · lote 5 de L): el patrón.
 *
 *   · una fila sale cerrada al cerrarse su ítem, nunca antes (E8), y se queda
 *     en los ítems siguientes hasta el cierre
 *   · con movimiento reducido, igual: la misma fila en el mismo momento, sin
 *     fundido
 *   · se pega arriba cuando su sitio sube, sin pasar del 40 % de la ventana,
 *     y lo que recibe el foco debajo de ella se asoma
 *   · las siete piezas la usan (un solo patrón), y los rótulos que no traían
 *     sus datos van marcados para que Near los escriba
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let reducido = false;
w.matchMedia = (q) => ({ matches: reducido && /reduce/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent, FocusEvent: w.FocusEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const F = await import("../figuraAcumulada.js");
const { default: FiguraAcumulada, posicionPegada, CSS_FIGURA_ACUMULADA } = await import("../../components/mecanicas/libros/t7/FiguraAcumulada.jsx");
const { firma } = await import("./figuraAcumuladaPrueba.mjs");
const { DEBE, HABER } = await import("../../data/contabilidad.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const espera = () => act(async () => { await new Promise((r) => setTimeout(r, 5)); });

/* Una figura de juguete: una fila por ítem, un asiento con el 3 y un bloque que se va (hasta). */
const JUGUETE = [
  { tipo: "renglones", desde: 1, titulo: "Cuenta", filas: [{ desde: 1, rot: "Uno", v: 1000 }, { desde: 2, op: "=", rot: "Dos", v: 2000, res: true, }, { desde: 2, rot: "Uno", v: 1, fuerteDesde: 3 }] },
  { tipo: "asiento", desde: 3, titulo: "Libro", lineas: [{ cuenta: "Caja", lado: DEBE, valor: 5 }, { cuenta: "Ventas", lado: HABER, valor: 5 }], totales: true },
];

function montar(props) {
  const caja = document.createElement("div");
  const tarjeta = document.createElement("section");
  tarjeta.appendChild(caja);
  document.body.appendChild(tarjeta);
  const raiz = createRoot(caja);
  const pintar = (p) => act(async () => { raiz.render(h(FiguraAcumulada, p)); });
  return { caja, tarjeta, pintar, desmontar: () => { act(() => raiz.unmount()); tarjeta.remove(); }, inicio: pintar(props) };
}

/* ═══════════ LA LÓGICA ═══════════ */

test("★★★ visiblesDeFigura: cada fila sale al cerrarse su ítem, nunca antes, y se queda", () => {
  const vista = (c, l) => F.visiblesDeFigura(JUGUETE, c, l).map((b) => (b.tipo === "renglones" ? b.filas.map((f) => `${f.v}${f.fuerte ? "*" : ""}${f.nuevo ? "+" : ""}`).join(" ") : `${b.tipo}${b.nuevo ? "+" : ""}`));
  /* Antes de cerrar el ítem 1: nada. Al cerrarlo: su fila, que entra (el bloque entero es nuevo). */
  assert.deepEqual(vista(0, false), []);
  assert.deepEqual(vista(1, true), ["1000"]);
  assert.deepEqual(F.visiblesDeFigura(JUGUETE, 1, true)[0].nuevo, true);
  /* Ítem 2 en pantalla, sin cerrar: la fila del 1 sigue, la del 2 no está. */
  assert.deepEqual(vista(1, false), ["1000"]);
  assert.deepEqual(vista(2, true), ["1000 2000+ 1+"]);
  assert.deepEqual(vista(2, false), ["1000 2000 1"]);
  /* El ítem 3 cierra el asiento y pone en negrita una fila de antes. */
  assert.deepEqual(vista(3, true), ["1000 2000 1*+", "asiento+"]);
  assert.deepEqual(vista(3, false), ["1000 2000 1*", "asiento"]);
  /* Con `hasta` (la franja de plazos de T7-3 H4): no se va al responder, sí en el ítem siguiente. */
  const conHasta = [{ tipo: "plazos", desde: 1, hasta: 2 }];
  assert.equal(F.visiblesDeFigura(conHasta, 2, true).length, 1);
  assert.equal(F.visiblesDeFigura(conHasta, 2, false).length, 0);
  assert.equal(F.cerradosDe(3, true), 4);
  assert.equal(F.cerradosDe(3, false), 3);
});

test("★★★ unaSolaCuenta: las cuentas de T7-3 H4 en una sola, cada parte con su título y su ítem", () => {
  const una = F.FIGURA_T7_3_H4.filter((b) => b.tipo === "renglones");
  assert.equal(una.length, 1, "una sola cuenta");
  assert.deepEqual(una[0].filas.filter((f) => f.tit).map((f) => [f.tit, f.desde]), [["Factura de Totumo", 1], ["El descuento condicionado", 3], ["El pago del 23 de octubre", 4]]);
  assert.deepEqual(F.FIGURA_T7_3_H4.map((b) => b.tipo), ["renglones", "plazos"]);
});

/* ═══════════ MONTADA ═══════════ */

async function recorrido() {
  const m = montar({ figura: JUGUETE, cerrados: 0, listo: false });
  await m.inicio;
  const pasos = [];
  try {
    pasos.push(firma(m.caja));
    assert.equal(m.caja.querySelector("[data-figura-acumulada]"), null, "sin nada cerrado no ocupa sitio");
    await m.pintar({ figura: JUGUETE, cerrados: 1, listo: true });
    pasos.push(firma(m.caja));
    /* Lo que entra con el ítem que se acaba de cerrar lleva el fundido. */
    assert.ok(m.caja.querySelector("figure[data-renglones]").classList.contains("rg-nuevo"));
    await m.pintar({ figura: JUGUETE, cerrados: 1, listo: false });
    pasos.push(firma(m.caja));
    assert.ok(!m.caja.querySelector("figure[data-renglones]").classList.contains("rg-nuevo"), "en el ítem siguiente ya no entra");
    await m.pintar({ figura: JUGUETE, cerrados: 2, listo: true });
    pasos.push(firma(m.caja));
    await m.pintar({ figura: JUGUETE, cerrados: 3, listo: true });
    pasos.push(firma(m.caja));
    assert.ok(m.caja.querySelector("[data-asiento-figura] [data-asiento]"), "el asiento con sus líneas");
    assert.equal(m.caja.querySelector("[data-asiento-figura] figcaption").textContent, "Libro");
    await m.pintar({ figura: JUGUETE, cerrados: 3, listo: false });
    pasos.push(firma(m.caja));
    /* Se lee como tabla, con el signo en palabras. */
    assert.equal(m.caja.querySelector("figure[data-renglones]").getAttribute("role"), "table");
    assert.equal(m.caja.querySelector(".rg-res .sr").textContent, "igual a ");
  } finally {
    m.desmontar();
  }
  return pasos;
}

const ESPERADO = [
  [],
  ["Cuenta: 1.000"],
  ["Cuenta: 1.000"],
  ["Cuenta: 1.000 2.000 1"],
  ["Cuenta: 1.000 2.000 1*", "asiento Libro: 2 líneas"],
  ["Cuenta: 1.000 2.000 1*", "asiento Libro: 2 líneas"],
];

test("★★★ montada: la fila sale cerrada al cerrar su ítem, nunca antes, y se queda", async () => {
  assert.deepEqual(await recorrido(), ESPERADO);
});

test("★★★ con movimiento reducido, igual: la misma fila en el mismo momento; el fundido se apaga por CSS", async () => {
  reducido = true;
  try {
    assert.deepEqual(await recorrido(), ESPERADO);
  } finally {
    reducido = false;
  }
  assert.match(CSS_FIGURA_ACUMULADA, /@media \(prefers-reduced-motion: reduce\) \{ \.t7fa-entra, \.t7fa \.rg-nuevo \{ animation: none !important; \} \}/);
  /* Ni teal ni ámbar en la figura: solo los rótulos DEBE y HABER (piezas.jsx) llevan su color. */
  const fuente = leer("src/components/mecanicas/libros/t7/FiguraAcumulada.jsx");
  assert.doesNotMatch(fuente, /FAE\.(teal|ambar)|#2A9D8F|#E9C46A|42,\s*157,\s*143|233,\s*196,\s*106/i);
});

/* ═══════════ SE QUEDA ARRIBA ═══════════ */

test("★★★ posicionPegada: se pega cuando su sitio sube, no pasa del 40 % de la ventana y sube con la tarjeta", () => {
  const sitio = (top) => ({ top, left: 16, width: 288 });
  /* Su sitio a la vista: en su sitio. */
  assert.equal(posicionPegada({ sitio: sitio(120), fin: 2000, alto: 300, tope: 0, ventana: 640 }), null);
  /* Su sitio subió: pegada en el tope, con el alto de la ventana como techo (40 % de 640 = 256). */
  assert.deepEqual(posicionPegada({ sitio: sitio(-50), fin: 2000, alto: 600, tope: 0, ventana: 640 }), { top: 0, left: 16, width: 288, max: 256 });
  /* Baja: mide lo suyo y el relleno. */
  assert.deepEqual(posicionPegada({ sitio: sitio(-50), fin: 2000, alto: 100, tope: 56, ventana: 640 }), { top: 56, left: 16, width: 288, max: 116 });
  /* Al acabarse la tarjeta, sube con ella; cuando ya pasó, se suelta. */
  assert.equal(posicionPegada({ sitio: sitio(-500), fin: 200, alto: 600, tope: 0, ventana: 640 }).top, 200 - 256);
  assert.equal(posicionPegada({ sitio: sitio(-900), fin: -10, alto: 600, tope: 0, ventana: 640 }), null);
});

test("★★★ montada: pegada arriba al bajar, y lo que recibe el foco debajo de ella se asoma", async () => {
  const caja0 = { top: 0, left: 16, width: 288, height: 0, bottom: 0, right: 304 };
  const rect = (el, r) => { el.getBoundingClientRect = () => ({ ...caja0, ...r }); };
  const m = montar({ figura: JUGUETE, cerrados: 3, listo: false });
  await m.inicio;
  const desplazado = [];
  const scrollBy = w.scrollBy;
  w.scrollBy = (o) => desplazado.push(o.top);
  try {
    const hueco = m.caja.querySelector("[data-figura-acumulada]");
    const caja = hueco.querySelector(".t7fa-caja");
    const contenido = hueco.querySelector("[data-figura-contenido]");
    assert.equal(caja.dataset.pegada, "no");
    /* Se baja la página: el sitio de la figura queda 100 px por encima del tope; la tarjeta sigue. */
    rect(hueco, { top: -100, height: 400, bottom: 300 });
    rect(contenido, { top: -100, height: 400, bottom: 300 });
    rect(m.tarjeta, { top: -300, height: 3000, bottom: 2700 });
    Object.defineProperty(w, "innerHeight", { value: 640, configurable: true });
    await act(async () => { w.dispatchEvent(new w.Event("scroll")); });
    await espera();
    assert.equal(caja.dataset.pegada, "si");
    assert.equal(caja.style.position, "fixed");
    assert.equal(caja.style.maxHeight, "256px");
    /* El hueco guarda el alto de la figura: la página no salta. */
    assert.equal(hueco.style.height, "400px");
    /* Un botón de la tarjeta recibe el foco detrás de la figura pegada (que acaba en 256): la página sube lo justo. */
    rect(caja, { top: 0, height: 256, bottom: 256 });
    const boton = document.createElement("button");
    m.tarjeta.appendChild(boton);
    rect(boton, { top: 100, height: 48, bottom: 148 });
    await act(async () => { boton.focus(); });
    assert.deepEqual(desplazado, [100 - (256 + 8)]);
    /* Si ya se ve debajo de la figura, no se mueve nada. */
    const otro = document.createElement("button");
    m.tarjeta.appendChild(otro);
    rect(otro, { top: 400, height: 48, bottom: 448 });
    await act(async () => { otro.focus(); });
    assert.equal(desplazado.length, 1);
    /* Vuelve a su sitio cuando su sitio vuelve a la vista. */
    rect(hueco, { top: 80, height: 400, bottom: 480 });
    await act(async () => { w.dispatchEvent(new w.Event("scroll")); });
    await espera();
    assert.equal(caja.dataset.pegada, "no");
    assert.equal(hueco.style.height, "");
  } finally {
    w.scrollBy = scrollBy;
    m.desmontar();
  }
});

/* ═══════════ UN SOLO PATRÓN ═══════════ */

const PIEZAS = {
  "src/components/mecanicas/libros/t7/CuantoValeLoQueSobro.jsx": "FIGURA_T7_1_H3",
  "src/components/mecanicas/libros/t7/CierraElMes.jsx": "FIGURA_T7_1_H4",
  "src/components/mecanicas/libros/t7/DevolucionDosLibros.jsx": "FIGURA_T7_1_H6",
  "src/components/mecanicas/libros/t7/FleteYDevolucion.jsx": "FIGURA_T7_2_H5",
  "src/components/mecanicas/libros/t7/CadenaDeDescuentos.jsx": "FIGURA_T7_3_H2",
  "src/components/mecanicas/libros/t7/PagoATiempo.jsx": "FIGURA_T7_3_H4",
  "src/components/mecanicas/libros/t5/ElInteresDelPeriodo.jsx": "FIGURA_T5_N4",
};

test("★★★ un solo patrón: las siete piezas pintan su figura con FiguraAcumulada, arriba del contador", () => {
  for (const [archivo, figura] of Object.entries(PIEZAS)) {
    const fuente = leer(archivo);
    assert.match(fuente, /import FiguraAcumulada from "(\.\/|\.\.\/t7\/)FiguraAcumulada\.jsx";/, archivo);
    assert.match(fuente, new RegExp(`<FiguraAcumulada figura=\\{${figura}\\}`), archivo);
    assert.doesNotMatch(fuente, /<FigurasHacer/, `${archivo}: nada de la figura de antes`);
    /* En las de T7, va antes del contador (en N4, PreguntasConAsientoT5 la pone ahí con config.Figura). */
    if (archivo.includes("/t7/")) assert.ok(fuente.indexOf("<FiguraAcumulada") < fuente.indexOf("<ContadorConIntento>"), archivo);
  }
  assert.match(leer("src/components/mecanicas/libros/t5/ElInteresDelPeriodo.jsx"), /Figura: FiguraN4/);
});

test("★★★ los rótulos que no traían los datos van marcados PENDIENTE_DE_REVISION, y nada más es inventado", () => {
  const fuente = leer("src/contabilidad/figuraAcumulada.js");
  /* Cada rótulo escrito a mano (una cadena en `rot:`) está en el comentario de su marca, justo encima. */
  const lineas = fuente.split("\n");
  const escritos = [];
  for (const [k, l] of lineas.entries()) {
    const m = l.match(/rot: "([^"]+)"/);
    if (!m) continue;
    escritos.push(m[1]);
    const marca = lineas.slice(0, k).reverse().find((x) => x.includes("[ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION"));
    assert.ok(marca && marca.includes(`«${m[1]}»`), `«${m[1]}» sin su marca`);
  }
  assert.deepEqual(escritos, [
    "Costo unitario promedio",
    "IVA que se reversa", "Retención que se reversa", "Baja la deuda",
    "Cuenta del flete", "Pago a la transportadora", "Cuenta del flete", "Va al haber", "Baja la deuda con el proveedor",
    "Cobra el interés", "Interés del primer trimestre", "Base del segundo trimestre", "Interés del segundo trimestre",
  ]);
  /* Ningún título escrito a mano: los títulos salen de los datos. */
  assert.doesNotMatch(fuente, /titulo: "/);
});
