import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { ROTULOS_A6, A6JS, A6CSS, FILAS_NEAR_A6, FILAS_LEIDAS, NEAR_N5_A6 } from "./correccionesNearC3A6.mjs";

/* Lote V: las opciones salen barajadas; se comparan por id (pares [id, texto]), sin perder la pareja id ↔ texto. */
const porId = (pares) => [...pares].sort((a, b) => String(a[0]).localeCompare(String(b[0])));


/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A6 «Devoluciones en periódico», en el motor C3 (Célula C).
 *
 * La fuente es el a6.js de la «Pieza 3» del Patrón de enganche C3 de Watari
 * (patron-enganche-c3-v1.html, CODIGO.a6): sus pantallas se ejecutan aquí y
 * se comparan enteras con las de los datos, en los dos sentidos, con encima
 * solo lo que dicen M-1 de Mello, los rótulos [W] de Near
 * (correccionesNearC3A6.mjs) y los textos con que Near cerró el §5 de Mello
 * (c3-mello-near.md: «dos-cuentas-propias» y las opciones del lado a lado).
 *
 *   · textos: Watari ↔ datos, campo por campo; los de main que Watari conserva,
 *     letra por letra contra contabilidadT7_1_a6.js; los de la figura, en su
 *     a6.js o en la tabla de Near; ningún rótulo reemplazado queda
 *   · la pieza montada, pantalla por pantalla y estado por estado: la escena,
 *     la miniatura que no califica, la barra pelada, la tajada con A6-1 (la
 *     barra del IVA entera hasta el acierto), los dos libros con sus
 *     fantasmas, el cruce del lado a lado y el resumen; la escalera C2 en cada
 *     pregunta y en cada línea; el foco; movimiento reducido
 *   · C1: «El libro da la razón…» llega con el «¿Por qué?» del acierto
 *   · B2 (≤ 60 palabras visibles) en cada pantalla, salvo las de
 *     PENDIENTES_NEAR, que siguen pasándose (si dejan de pasarse, se sacan)
 *   · catálogo (cero FP, mismo id, misma posición) y vista
 *
 * El ancho a 320, 375 y 1280 lo mide scripts/t7/medir-t7-1-a6.mjs en Chromium.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let REDUCIDO = false;
w.matchMedia = (q) => ({ matches: REDUCIDO && /prefers-reduced-motion: reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const A = await import("../../data/contabilidadT7_1_a6_c3.js");
const MAIN = await import("../../data/contabilidadT7_1_a6.js");
const COMP = await import("../../components/mecanicas/libros/t7/DevolucionesEnPeriodicoC3.jsx");
const MOTOR = await import("../../components/mecanicas/libros/t7/aprenderC3.jsx");
const Devoluciones = COMP.default;
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const CANON = await import("../canonEnganche.js");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const PAQ = "orquestador/conocimiento/paquetes/";
const HTML = leer(`${PAQ}patron-enganche-c3-v1.html`);
const INI = HTML.indexOf('<section class="sec" id="a6">');
const SECCION = HTML.slice(INI, HTML.indexOf("</section>", INI));
const MELLO = leer(`${PAQ}auditoria-mello-patron-c3.md`);
const FUENTE = leer("src/components/mecanicas/libros/t7/DevolucionesEnPeriodicoC3.jsx");
const FUENTE_DATOS = leer("src/data/contabilidadT7_1_a6_c3.js");

/*
 * Las pantallas que todavía pasan de 60 con los textos de Near: B2 no se exige
 * en ellas. Esta lista solo encoge.
 *   · dos-cuentas-propias: con los textos de c3-mello-near.md, 58 con el
 *     acierto y 59 con el 2.º error, pero 65 con el 1.er error: la pista de
 *     main (15 palabras), que Near deja igual, no entró en su conteo.
 */
const PENDIENTES_NEAR = new Set(["dos-cuentas-propias"]);

const P = A.PIEZA_DEVOLUCIONES_C3;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const pMain = (id) => MAIN.PIEZA_DEVOLUCIONES.pantallas.find((x) => x.id === id);
const N = ROTULOS_A6;

/* ═══════════ EL a6.js DE WATARI, EJECUTADO ═══════════ */

const deWatari = () => new Function("window", `${A6JS}\nreturn window.C3A6.PANTALLAS;`)({});
const conFunciones = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === "function" ? `fn:${String(v)}` : v)));

/* Lo de Watari con lo que cambia encima: M-1, los rótulos de Near y el §5 de Mello cerrado por Near. */
const N5 = NEAR_N5_A6;
const conOpciones = (p, correcta, otras) => p.opciones.forEach((o, i) => { o.t = i === 0 ? correcta : otras[i - 1]; });
function esperadas() {
  const R = deWatari();
  const dos = R.find((x) => x.id === "dos-cuentas-propias");
  assert.ok(dos.texto.endsWith(` ${N.consignaP3.watari}`), "la consigna de P3 ya no cierra el texto de Watari");
  dos.texto = N5.dosCuentas.texto;
  dos.consigna = N.consignaP3.near;
  dos.pregunta = N5.dosCuentas.pregunta;
  dos.bien = N5.dosCuentas.bien;
  assert.deepEqual(dos.opciones.map((o) => o.id), ["saber-cuanto", "no-cambia", "no-se-tocan"]);
  conOpciones(dos, N5.dosCuentas.correcta, N5.dosCuentas.otras);
  dos.opciones[1].devolucion = N5.dosCuentas.noCambia;
  dos.opciones[2].devolucion = N5.dosCuentas.noSeTocan;
  const lado = R.find((x) => x.id === "lado-a-lado");
  assert.ok(lado.texto.startsWith(`${N.consignaP8.watari} `), "la consigna de P8 ya no abre el texto de Watari");
  lado.pregunta = lado.texto.slice(N.consignaP8.watari.length + 1);
  lado.consigna = N.consignaP8.near;
  delete lado.texto;
  assert.deepEqual(lado.opciones.map((o) => o.id), ["al-reves", "en-el-debe", "ingresos"]);
  conOpciones(lado, N5.ladoALado.correcta, N5.ladoALado.otras);
  /* Para el recorrido de canonEnganche.js: qué tocar antes de que salga la pregunta (lo mismo que abre `antes`). */
  dos.pasosAntes = ['[data-accion="modo"][data-v="aparte"]'];
  lado.pasosAntes = ['[data-accion="fecha"][data-v="j1"]'];
  return R;
}

/* ═══════════ MONTAR ═══════════ */

async function montar(pieza = P, props = {}) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(Devoluciones, { pieza, rotulo: "R", ...props })); });
  const q = (s) => caja.querySelector(s);
  const qa = (s) => [...caja.querySelectorAll(s)];
  const clic = async (el) => { assert.ok(el, "no está lo que se iba a tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  return {
    caja, q, qa, clic,
    seguir: () => clic(q(".c3-seguir")),
    accion: (a, v) => clic(q(`[data-accion="${a}"]${v ? `[data-v="${v}"]` : ""}`)),
    op: (id) => clic(q(`[data-op="${id}"]`) ?? q(`[data-elige="${id}"]`)),
    lado: (l) => clic(q(`.c3-lado[data-lado="${l}"]`)),
    msg: () => q("[data-c3-msg]").textContent,
    id: () => q("[data-pieza]").dataset.pantalla,
    desmontar: () => { act(() => raiz.unmount()); caja.remove(); },
  };
}
const desde = (id) => ({ ...P, pantallas: P.pantallas.slice(P.pantallas.findIndex((x) => x.id === id)) });
const enFoco = (el, msg) => assert.ok(el && document.activeElement === el, `${msg}: el foco está en ${document.activeElement?.tagName}.${document.activeElement?.className}`);
const bloqueado = (m, si = true) => assert.equal(m.q(".c3-seguir").getAttribute("aria-disabled"), String(si));
/* Lo que el estudiante ve: los nodos de texto cuyo elemento se ve. */
const visible = (m) => {
  const andar = document.createTreeWalker(m.caja, w.NodeFilter.SHOW_TEXT);
  let t = "";
  for (let n = andar.nextNode(); n; n = andar.nextNode()) if (n.parentElement && !n.parentElement.closest("style") && CANON.seVe(n.parentElement, w)) t += `${n.textContent} `;
  return t;
};
const sinIbaAqui = (m) => assert.doesNotMatch(m.caja.textContent, /Iba aquí/);
const ficha = (m, key) => m.q(`[data-ficha="${key}"]`);
const texto = (el) => el?.textContent;

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ las pantallas son, campo por campo y letra por letra, las del a6.js de Watari con M-1, los rótulos de Near y el §5 de Mello cerrado por Near", () => {
  assert.deepStrictEqual(conFunciones(A.PANTALLAS), conFunciones(esperadas()));
  assert.equal(P.pantallas, A.PANTALLAS);
  assert.deepEqual(P.pantallas.map((p) => p.id), ["portada", "que-es-una-devolucion", "dos-cuentas-propias", "el-caso", "cuanto-se-reversa", "libro-del-comprador", "libro-del-vendedor", "lado-a-lado", "resumen"]);
  /* Las líneas de los dos libros son las de Watari, una por una. */
  const R = deWatari();
  assert.deepStrictEqual(A.COMPRADOR, R.find((x) => x.id === "libro-del-comprador").lineas);
  assert.deepStrictEqual(A.VENDEDOR, R.find((x) => x.id === "libro-del-vendedor").lineas);
});

test("★★★ M-1: la consigna va aparte del texto y de la pregunta en las dos pantallas con «antes»", () => {
  for (const id of ["dos-cuentas-propias", "lado-a-lado"]) {
    const p = pantalla(id);
    assert.equal(typeof p.antes, "function", id);
    assert.ok(p.consigna && p.pregunta, id);
    assert.ok(!(p.texto ?? "").includes(p.consigna) && !(p.texto ?? "").includes(p.pregunta), id);
  }
  assert.match(MELLO, /La pieza separa `consigna` de `texto`, y el motor pinta la consigna mientras `!P\.antes\(s\)`\./);
});

test("★★★ «dos-cuentas-propias» y el lado a lado con los textos de Near (c3-mello-near.md); C1: la razón del libro, de main, en el «¿Por qué?»", () => {
  const p = pantalla("dos-cuentas-propias");
  const m = pMain("dos-cuentas-propias");
  const d = N5.dosCuentas;
  assert.equal(p.texto, d.texto);
  assert.equal(p.pregunta, d.pregunta);
  assert.deepEqual(p.opciones.map((o) => [o.id, o.t, o.devolucion ?? null, Boolean(o.correcta)]), [
    ["saber-cuanto", d.correcta, null, true], ["no-cambia", d.otras[0], d.noCambia, false], ["no-se-tocan", d.otras[1], d.noSeTocan, false]]);
  assert.equal(p.bien, d.bien);
  /* Lo que no cambia: la razón del libro (párrafos 2.º a 4.º de main), la pista y el pie. */
  assert.equal(p.porque, m.parrafos.slice(1).join(" "));
  assert.ok(p.porque.startsWith("El libro da la razón: "));
  assert.equal(p.pista, m.pista);
  assert.equal(p.pie, m.pie);
  /* N-2 de Mello: entre opciones, como mucho una palabra de diferencia. */
  const pal = (t) => t.split(/\s+/).length;
  for (const id of ["dos-cuentas-propias", "lado-a-lado"]) {
    const n = pantalla(id).opciones.map((o) => pal(o.t));
    assert.ok(Math.max(...n) - Math.min(...n) <= 1, `${id}: ${n}`);
  }
  const l = pantalla("lado-a-lado");
  const ml = pMain("lado-a-lado");
  assert.deepEqual(l.opciones.map((o) => o.t), [N5.ladoALado.correcta, ...N5.ladoALado.otras]);
  assert.deepEqual(l.opciones.map((o) => o.devolucion ?? null), ml.opciones.map((o) => o.devolucion ?? null), "las devoluciones de main del lado a lado no cambian");
  assert.equal(l.pista, ml.pista);
  assert.equal(l.bien, ml.acierto.texto);
});

test("★★★ lo que Watari conserva de main va letra por letra: pistas, preguntas, opciones, devoluciones, aciertos, líneas, pies y resumen", () => {
  /* Lo que Near reescribió para el §5 de Mello se mira en la prueba de arriba. */
  const DE_NEAR = new Set(["dos-cuentas-propias"]);
  for (const p of P.pantallas) {
    const m = pMain(p.id);
    assert.ok(m, p.id);
    assert.equal(p.pie, m.pie, `${p.id}: pie`);
    if (m.pista) assert.equal(p.pista, m.pista, `${p.id}: pista`);
    if (m.opciones && !DE_NEAR.has(p.id)) {
      const t = p.id !== "lado-a-lado";
      assert.deepEqual(p.opciones.map((o) => [o.id, t ? o.t : null, o.devolucion ?? null, Boolean(o.correcta)]), m.opciones.map((o) => [o.id, t ? o.texto : null, o.devolucion ?? null, o.correcta]), p.id);
      assert.equal(p.pregunta ?? p.texto, m.pregunta, `${p.id}: pregunta`);
    }
    if (m.acierto && !DE_NEAR.has(p.id)) assert.equal(p.bien, m.acierto.texto, `${p.id}: acierto`);
    if (m.lineas) assert.deepEqual(p.lineas.map(({ id, cuenta, monto, lado, pista, devolucion }) => ({ id, cuenta, monto, lado, pista, devolucion })), m.lineas.map(({ id, cuenta, monto, lado, pista, devolucion }) => ({ id, cuenta, monto, lado, pista, devolucion })), p.id);
  }
  assert.equal(pantalla("portada").texto, pMain("portada").objetivo);
  assert.deepEqual(pantalla("resumen").lista, pMain("resumen").parrafos);
  assert.equal(pantalla("resumen").siguiente, pMain("resumen").siguiente);
  assert.deepEqual(A.CALCULOS, pMain("cuanto-se-reversa").acierto.calculos);
  for (const c of A.CALCULOS) assert.ok(A6JS.includes(c), c);
});

test("★★★ cada fantasma es la línea del 1 de junio que reversa: misma cuenta y monto que en main, al lado contrario", () => {
  const [comp, vend] = pMain("el-caso").asientos;
  for (const [lineas, original] of [[A.COMPRADOR, comp.lineas], [A.VENDEDOR, vend.lineas]]) {
    assert.equal(lineas.length, original.length);
    for (const l of lineas) {
      const o = original.find((x) => x.cuenta === l.fantasma.cuenta && x.monto === l.fantasma.monto);
      assert.ok(o, `${l.id}: su fantasma no está en el 1 de junio de main`);
      assert.notEqual(o.lado, l.lado, `${l.id}: el fantasma va al lado contrario`);
      assert.equal(l.fantasma.fecha, A.J1);
    }
  }
  /* Las cifras se calculan y son las de main y las de Watari. */
  assert.deepEqual(A.CIFRAS, MAIN.CIFRAS);
  assert.ok(A6JS.includes("compra: 15200000, ivaCompra: 2432000, retCompra: 532000, totalCompra: 17100000, devuelto: 2400000, ivaDev: 384000, retDev: 84000, totalDev: 2700000"));
});

test("★★★ los rótulos [W]: los de Near, letra por letra; los demás de la figura, en el a6.js de Watari; ningún rótulo reemplazado queda", () => {
  assert.deepEqual(FILAS_LEIDAS, FILAS_NEAR_A6, "el ayudante lee todas las filas de A6 de Near");
  const F = A.FIGURA;
  const DE_NEAR = {
    "escena.devolver": "devolver", "estado.directo": "directo", "estado.aparte": "aparte", "estado.titulo": "tituloEstado", "estado.neto": "neto",
    "barra.comprada": "comprada", "barra.devuelta": "devuelta", "barra.queda": "queda", "barra.pelar": "pelar",
    "libros.comprador": "libroComprador", "libros.vendedor": "libroVendedor",
    "espejo.j1": "j1", "espejo.j5": "j5", "espejo.comprador": "comprador", "espejo.vendedor": "vendedor",
  };
  for (const [grupo, textos] of Object.entries(F)) {
    for (const [k, t] of Object.entries(textos)) {
      const clave = `${grupo}.${k}`;
      if (DE_NEAR[clave]) assert.equal(t, N[DE_NEAR[clave]].near, clave);
      else assert.ok(A6JS.includes(t), `${clave}: «${t}» no está en el a6.js de Watari`);
    }
  }
  assert.equal(pantalla("dos-cuentas-propias").consigna, N.consignaP3.near);
  assert.equal(pantalla("lado-a-lado").consigna, N.consignaP8.near);
  assert.equal(F.estado.neto, "Ventas, menos devoluciones");
  /* Ningún rótulo de Watari que Near cambió sigue entre comillas en los datos ni en el componente. */
  const todo = FUENTE_DATOS + FUENTE;
  for (const r of Object.values(N)) {
    /* «1 de junio» sigue siendo dato (la fecha de la barra y de cada fantasma): el selector se mira arriba. */
    if (r.watari === r.near || r === N.j1) continue;
    const re = new RegExp(`["'\`]${r.watari.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'\`]`);
    assert.doesNotMatch(todo, re, `queda «${r.watari}»`);
  }
  assert.doesNotMatch(JSON.stringify(P) + JSON.stringify(F), /Ventas netas|Restar directo|Cuenta aparte|resultados · vendedor|anotarla\.|mira cada línea\./);
});

test("★★ el título y la sección: la pieza se llama como en main y el código es el de la «Pieza 3» de Watari", () => {
  assert.equal(P.titulo, "Devoluciones en periódico");
  assert.match(SECCION, /reemplaza DevolucionesEnPeriodico · arregla C1/);
  assert.ok(A6JS.startsWith("/* C3 · T7-1 A6 «Devoluciones en periódico»"));
  assert.ok(A6CSS.includes(".a6 .c3-lado { grid-row: 1 / -1; grid-template-rows: subgrid; }"));
});

/* ═══════════ 2 · LA PIEZA MONTADA ═══════════ */

test("★★★ portada y P2: la mercancía vuelve al vendedor y la nota crédito viaja; los nombres llegan con ella; «Seguir» espera", async () => {
  REDUCIDO = false;
  const m = await montar();
  assert.equal(m.id(), "portada");
  assert.ok(m.q("[data-pieza]").classList.contains("dormida"));
  assert.equal(texto(m.q("[data-texto]")), pantalla("portada").texto);
  assert.equal(texto(m.q('[data-boton="empezar"]')), "Empezar");
  assert.deepEqual(m.qa(".c3-cruce-rot span").map(texto), ["Vendedor", "Comprador"]);
  const merc = ficha(m, "mercancia");
  const nota = ficha(m, "nota");
  assert.ok(merc.classList.contains("der"), "la mercancía, en el lado del comprador");
  assert.equal(texto(merc), "MercancíaEn mal estado");
  assert.ok(nota.classList.contains("oculta") && !nota.classList.contains("der"));
  assert.equal(m.q('[data-accion="devolver"]'), null, "en la portada no hay botón de la escena");
  await m.seguir();
  assert.equal(m.id(), "que-es-una-devolucion");
  enFoco(m.q("[data-texto]"), "al seguir, el foco va al texto");
  bloqueado(m);
  await m.seguir();
  assert.equal(m.id(), "que-es-una-devolucion", "«Seguir» no avanza sin devolver");
  assert.equal(m.q(".a6-nombres").getAttribute("aria-hidden"), "true");
  assert.ok(!m.q(".a6-nombres").classList.contains("on"));
  await m.accion("devolver");
  assert.equal(ficha(m, "mercancia"), merc, "la ficha es el mismo nodo: se desliza");
  assert.equal(ficha(m, "nota"), nota);
  assert.ok(!merc.classList.contains("der"));
  assert.equal(texto(merc), "MercancíaDevuelta");
  assert.ok(nota.classList.contains("der") && !nota.classList.contains("oculta"));
  assert.ok(m.q(".a6-nombres").classList.contains("on"));
  assert.equal(m.q(".a6-nombres").getAttribute("aria-hidden"), null);
  assert.equal(texto(m.q(".a6-nombres")), "Para el vendedor: devolución de ventasPara el comprador: devolución de compras");
  assert.equal(m.q('[data-accion="devolver"]').getAttribute("aria-disabled"), "true");
  bloqueado(m, false);
  m.desmontar();
});

test("★★★ P3: la miniatura no califica; la pregunta sale después de ver «En su propia cuenta»; la razón del libro, solo en el «¿Por qué?»", async () => {
  const m = await montar(desde("dos-cuentas-propias"));
  const p = pantalla("dos-cuentas-propias");
  assert.equal(texto(m.q("[data-texto]")), p.texto);
  assert.equal(texto(m.q("[data-consigna]")), N.consignaP3.near);
  assert.equal(m.q("[data-pregunta]"), null);
  assert.equal(m.qa("[data-op]").length, 0, "0 opciones antes de ver la cuenta aparte");
  assert.doesNotMatch(visible(m), /El libro da la razón|administradores/);
  assert.deepEqual(m.qa('[data-accion="modo"]').map((b) => [texto(b), b.getAttribute("aria-pressed")]), [["Restar de las ventas", "true"], ["En su propia cuenta", "false"]]);
  assert.equal(texto(m.q(".a6-er-tit")), "Estado de resultados · El Tajamar");
  const fila = (f) => texto(m.q(`[data-fila="${f}"]`));
  assert.equal(fila("ingresos"), "Ingresos por ventas$12.800.000");
  assert.equal(fila("devoluciones"), "− Devoluciones de ventas—");
  assert.ok(m.q('[data-fila="devoluciones"]').classList.contains("off"));
  assert.equal(fila("neto"), "Ventas, menos devoluciones$12.800.000");
  bloqueado(m);

  await m.accion("modo", "aparte");
  assert.equal(fila("ingresos"), "Ingresos por ventas$15.200.000");
  assert.equal(fila("devoluciones"), "− Devoluciones de ventas$2.400.000");
  assert.ok(!m.q('[data-fila="devoluciones"]').classList.contains("off"));
  assert.equal(fila("neto"), "Ventas, menos devoluciones$12.800.000");
  assert.equal(m.q("[data-consigna]").hidden, true, "M-1: la consigna se va cuando sale la pregunta");
  assert.equal(texto(m.q("[data-pregunta]")), p.pregunta);
  assert.deepEqual(porId(m.qa("[data-op]").map((b) => [b.dataset.op, texto(b)])), porId(p.opciones.map((o) => [o.id, o.t])));
  /* Volver a «Restar de las ventas» no esconde la pregunta. */
  await m.accion("modo", "directo");
  assert.equal(fila("ingresos"), "Ingresos por ventas$12.800.000");
  assert.equal(m.qa("[data-op]").length, 3);

  /* Escalera C2. */
  await m.op("no-cambia");
  assert.ok(m.q('[data-op="no-cambia"]').classList.contains("mal"));
  assert.equal(texto(m.q('[data-op="no-cambia"] [data-pastilla]')), "No va aquí");
  assert.ok(m.msg().includes(p.pista));
  assert.equal(m.qa(".c3-op.pista").length, 0);
  enFoco(m.q("[data-c3-msg]"), "1.er error");
  bloqueado(m);
  await m.op("no-se-tocan");
  assert.ok(m.msg().includes(p.opciones[2].devolucion));
  assert.ok(!m.msg().includes(p.pista));
  assert.ok(m.q('[data-op="saber-cuanto"]').classList.contains("pista"));
  enFoco(m.q("[data-c3-msg]"), "2.º error");
  sinIbaAqui(m);
  assert.doesNotMatch(visible(m), /El libro da la razón/);
  await m.op("saber-cuanto");
  assert.ok(m.msg().includes(p.bien));
  assert.ok(m.q('[data-op="saber-cuanto"]').classList.contains("bien"));
  assert.doesNotMatch(visible(m), /El libro da la razón/, "la razón, plegada");
  const pq = m.q('[data-boton="por-que"]');
  assert.equal(pq.getAttribute("aria-expanded"), "false");
  await m.clic(pq);
  assert.equal(texto(m.q("[data-porque]")), p.porque);
  enFoco(m.q("[data-porque]"), "al abrir el porqué");
  bloqueado(m, false);
  m.desmontar();
});

test("★★★ P4: la parte devuelta se pela de la barra de la compra; «Seguir» espera", async () => {
  const m = await montar(desde("el-caso"));
  assert.equal(texto(m.q("[data-texto]")), pantalla("el-caso").texto);
  const fila = (f) => texto(m.q(`[data-fila="${f}"]`));
  assert.equal(texto(m.q(".a6-cab")), "Dajema compra · El Tajamar vende1 de junio");
  assert.equal(fila("comprada"), "Mercancía comprada$15.200.000");
  assert.equal(fila("devuelta"), "Devuelta · 5 de junio—");
  assert.equal(fila("queda"), "Se queda con Dajema—");
  assert.ok(m.q('[data-fila="queda"]').classList.contains("off"));
  assert.equal(texto(m.q(".c3-rotulo")), A.FIGURA.barra.rotulo);
  assert.ok(!m.q('[data-barra="compra"] .dev').classList.contains("pelada"));
  assert.equal(m.q('[data-barra="compra"] .queda').style.width, `${100 - A.PCT}%`);
  bloqueado(m);
  await m.accion("pelar");
  assert.ok(m.q('[data-barra="compra"] .dev').classList.contains("pelada"));
  assert.equal(fila("devuelta"), "Devuelta · 5 de junio$2.400.000");
  assert.equal(fila("queda"), "Se queda con Dajema$12.800.000");
  assert.equal(m.q('[data-accion="pelar"]').getAttribute("aria-disabled"), "true");
  bloqueado(m, false);
  m.desmontar();
});

test("★★★ P5 (A6-1 de Mello): la barra del IVA va entera hasta el acierto; el corte y los tres cálculos llegan con él", async () => {
  REDUCIDO = false;
  const m = await montar(desde("cuanto-se-reversa"));
  const p = pantalla("cuanto-se-reversa");
  const iva = () => m.qa('[data-barra="iva"] i');
  const entera = (cuando) => {
    assert.equal(iva().length, 1, `${cuando}: la barra del IVA no lleva corte`);
    assert.ok(iva()[0].classList.contains("queda") && iva()[0].classList.contains("entera"), cuando);
    assert.equal(iva()[0].style.width, "100%", cuando);
    assert.equal(m.q('[data-barra="iva"] .dev'), null, cuando);
    assert.equal(m.q("[data-calculos]"), null, `${cuando}: sin cálculos`);
  };
  assert.equal(texto(m.q("[data-texto]")), p.texto);
  assert.equal(m.q("[data-pregunta]"), null, "las opciones van en la figura");
  assert.deepEqual(porId(m.qa("[data-elige]").map((b) => [b.dataset.elige, texto(b)])), porId([["proporcional", "$384.000"], ["todo", "$2.432.000"], ["nada", "$0"]]));
  assert.ok(m.q('[data-barra="mercancia"] .dev.marcada'), "la mercancía sí muestra su tajada");
  entera("al llegar");
  bloqueado(m);
  await m.op("todo");
  assert.ok(m.q('[data-elige="todo"]').classList.contains("mal"));
  assert.equal(texto(m.q('[data-elige="todo"] [data-pastilla]')), "No va aquí");
  assert.match(m.q('[data-elige="todo"]').getAttribute("aria-label"), /Incorrecto\.$/);
  assert.ok(m.msg().includes(p.pista));
  assert.equal(m.qa(".a6-base.pista").length, 0);
  enFoco(m.q("[data-c3-msg]"), "1.er error");
  entera("con el 1.er error");
  await m.op("nada");
  assert.ok(m.msg().includes(p.opciones[2].devolucion));
  assert.ok(m.q('[data-elige="proporcional"]').classList.contains("pista"));
  entera("con el 2.º error");
  sinIbaAqui(m);
  await m.op("proporcional");
  assert.deepEqual(iva().map((i) => i.className), ["queda", "dev marcada"]);
  assert.equal(iva()[1].style.width, `${A.PCT}%`);
  assert.deepEqual(m.qa("[data-calculos] span").map(texto), A.CALCULOS);
  assert.ok(m.q("[data-calculos]").classList.contains("nuevo"));
  assert.ok(m.q('[data-elige="proporcional"]').classList.contains("bien"));
  assert.equal(texto(m.q('[data-elige="proporcional"] [data-pastilla]')), "Correcto");
  for (const b of m.qa("[data-elige]")) assert.equal(b.getAttribute("aria-disabled"), "true");
  assert.ok(m.msg().includes(p.bien));
  enFoco(m.q("[data-c3-msg]"), "acierto");
  bloqueado(m, false);
  m.desmontar();
});

for (const [id, L, titulo] of [["libro-del-comprador", A.COMPRADOR, "Libro de Dajema · 5 de junio"], ["libro-del-vendedor", A.VENDEDOR, "Libro de El Tajamar · 5 de junio"]]) {
  test(`★★★ ${id}: línea por línea, con su escalera; cada línea deja enfrente su fantasma del 1 de junio`, async () => {
    REDUCIDO = false;
    const m = await montar(desde(id));
    assert.equal(texto(m.q("[data-texto]")), pantalla(id).texto);
    assert.equal(texto(m.q(".c3-t-tit")), titulo);
    const otro = (l) => (l === "debe" ? "haber" : "debe");
    for (const [k, l] of L.entries()) {
      assert.equal(m.q(".a6-t").style.getPropertyValue("--n"), String(k + 1), "--n: las filas pareadas");
      assert.equal(m.q(".c3-ficha").dataset.linea, l.id);
      bloqueado(m);
      if (k === 0) {
        await m.lado(otro(l.lado));
        assert.ok(m.msg().includes(l.pista), "1.er error: la pista de la línea");
        assert.ok(!m.q(`.c3-lado[data-lado="${l.lado}"]`).classList.contains("pista"));
        enFoco(m.q("[data-c3-msg]"), "1.er error de la línea");
        await m.lado(otro(l.lado));
        assert.ok(m.msg().includes(l.devolucion), "2.º error: su devolución");
        assert.ok(m.q(`.c3-lado[data-lado="${l.lado}"]`).classList.contains("pista"));
        sinIbaAqui(m);
      }
      await m.lado(l.lado);
      const ren = m.q(`.c3-lado[data-lado="${l.lado}"] [data-ren="${l.id}"]`);
      assert.ok(ren, `${l.id}: cae en su lado`);
      assert.ok(ren.classList.contains("nuevo"));
      const f = m.qa(`.c3-lado[data-lado="${otro(l.lado)}"] .c3-ren.fantasma`).at(-1);
      assert.ok(f.classList.contains("nuevo"), "el fantasma aparece con su línea");
      assert.equal(texto(f), `${l.fantasma.cuenta !== l.cuenta ? l.fantasma.cuenta : ""}${A.pesos(l.fantasma.monto)}1 de junio`, `${l.id}: el fantasma nombra la cuenta solo si cambia`);
    }
    /* Las filas: en cada lado, una por línea (la propia o el fantasma), en el mismo orden. */
    for (const lado of ["debe", "haber"]) assert.equal(m.qa(`.c3-lado[data-lado="${lado}"] .c3-ren`).length, L.length);
    assert.ok(m.msg().includes(pantalla(id).bien));
    assert.equal(m.q(".c3-ficha"), null);
    assert.equal(m.q(".a6-t").style.getPropertyValue("--n"), String(L.length + 1));
    bloqueado(m, false);
    m.desmontar();
  });
}

test("★★★ P8: la pregunta sale después de ver el 1 de junio; las ocho líneas cruzan de lado (los mismos nodos)", async () => {
  const m = await montar(desde("lado-a-lado"));
  const p = pantalla("lado-a-lado");
  assert.equal(m.q("[data-texto]").hidden, true);
  assert.equal(texto(m.q("[data-consigna]")), N.consignaP8.near);
  assert.equal(m.q("[data-pregunta]"), null);
  assert.equal(m.qa("[data-op]").length, 0);
  assert.deepEqual(m.qa('[data-accion="fecha"]').map((b) => [texto(b), b.getAttribute("aria-pressed")]), [["1 de junio · compra", "false"], ["5 de junio · devolución", "true"]]);
  assert.deepEqual(m.qa(".a6-libro").map(texto), ["Dajema · comprador", "El Tajamar · vendedor"]);
  const lineas = [...A.COMPRADOR.map((l) => ["comprador", l]), ...A.VENDEDOR.map((l) => ["vendedor", l])];
  const nodos = lineas.map(([lb, l]) => ficha(m, `${lb}-${l.id}`));
  const ver = (j1) => lineas.forEach(([lb, l], i) => {
    const el = ficha(m, `${lb}-${l.id}`);
    assert.equal(el, nodos[i], "el mismo nodo: la ficha se desliza");
    const lado = j1 ? (l.lado === "debe" ? "haber" : "debe") : l.lado;
    const c = j1 ? l.fantasma : l;
    assert.equal(el.classList.contains("der"), lado === "haber", `${lb}-${l.id}`);
    assert.equal(texto(el), `${c.cuenta}${A.pesos(c.monto)}`);
  });
  ver(false);
  bloqueado(m);
  await m.accion("fecha", "j1");
  ver(true);
  assert.equal(m.qa(".a6-espejo .c3-tile.der").length, 4, "al ver el 1 de junio, 4 de 8 fichas quedan en el haber");
  assert.equal(m.q("[data-consigna]").hidden, true);
  assert.equal(texto(m.q("[data-pregunta]")), p.pregunta);
  await m.accion("fecha", "j5");
  ver(false);
  assert.equal(m.qa("[data-op]").length, 3, "la pregunta se queda");
  await m.op("en-el-debe");
  assert.ok(m.msg().includes(p.pista));
  await m.op("ingresos");
  assert.ok(m.msg().includes(p.opciones[2].devolucion));
  assert.ok(m.q('[data-op="al-reves"]').classList.contains("pista"));
  await m.op("al-reves");
  assert.ok(m.msg().includes(p.bien));
  bloqueado(m, false);
  await m.seguir();
  assert.equal(m.id(), "resumen");
  m.desmontar();
});

test("★★ resumen: la lista y el siguiente, sin botón ni figura", async () => {
  const m = await montar(desde("resumen"));
  assert.deepEqual(m.qa(".c3-lista li").map(texto), [...pantalla("resumen").lista, pantalla("resumen").siguiente]);
  assert.equal(m.q(".c3-seguir").hidden, true);
  assert.equal(m.q("[data-figura]").children.length, 0);
  m.desmontar();
});

test("★★★ la pieza entera, de la portada al resumen; movimiento reducido: nada lleva la clase que anima", async () => {
  REDUCIDO = true;
  const m = await montar();
  const ids = [];
  const mira = () => { ids.push(m.id()); assert.equal(m.qa(".nuevo").length, 0, `${m.id()}: con movimiento reducido no hay .nuevo`); };
  mira(); await m.seguir();
  mira(); await m.accion("devolver"); await m.seguir();
  mira(); await m.accion("modo", "aparte"); await m.op("saber-cuanto"); mira(); await m.seguir();
  mira(); await m.accion("pelar"); await m.seguir();
  mira(); await m.op("proporcional"); mira(); assert.ok(m.q("[data-calculos]")); await m.seguir();
  for (const L of [A.COMPRADOR, A.VENDEDOR]) { mira(); for (const l of L) { await m.lado(l.lado); mira(); } await m.seguir(); }
  mira(); await m.accion("fecha", "j1"); await m.op("al-reves"); mira(); await m.seguir();
  mira();
  assert.deepEqual([...new Set(ids)], P.pantallas.map((p) => p.id));
  assert.match(MOTOR.CSS_C3, /@media \(prefers-reduced-motion: reduce\) \{ \.c3 \*/);
  REDUCIDO = false;
  m.desmontar();
});

/* ═══════════ 3 · B2 ═══════════ */

/* Cada pantalla en todos sus estados: al llegar, tras tocar la figura, cada error y el acierto (porqué plegado). */
/*
 * Se cuenta como Mello (N-1): lo que se lee —texto, consigna, pregunta,
 * opciones con su pastilla y mensaje—, con el medidor de canonEnganche.js. La
 * cejilla «Pantalla n de N» del motor (aria-hidden, 4 palabras) no cuenta; el
 * conteo bruto del medidor sale aparte, en el diagnóstico.
 */
const bruto_ = {};
async function medirB2() {
  const peor = {};
  for (const p of P.pantallas) {
    const m = await montar(desde(p.id));
    const medir = () => {
      const bruto = CANON.medirTarjeta(CANON.tarjetaDe(m.caja), w).texto;
      const cejilla = CANON.contarPalabras(m.q(".c3-cejilla").textContent);
      bruto_[p.id] = Math.max(bruto_[p.id] ?? 0, bruto);
      peor[p.id] = Math.max(peor[p.id] ?? 0, bruto - cejilla);
    };
    medir();
    const accion = { "que-es-una-devolucion": ["devolver"], "dos-cuentas-propias": ["modo", "aparte"], "el-caso": ["pelar"], "lado-a-lado": ["fecha", "j1"] }[p.id];
    if (accion) { await m.accion(...accion); medir(); }
    if (p.opciones) {
      for (const o of p.opciones.filter((x) => !x.correcta)) { await m.op(o.id); medir(); }
      await m.op(p.opciones.find((o) => o.correcta).id); medir();
    }
    for (const l of p.lineas ?? []) {
      const otro = l.lado === "debe" ? "haber" : "debe";
      await m.lado(otro); medir(); await m.lado(otro); medir(); await m.lado(l.lado); medir();
    }
    m.desmontar();
  }
  return peor;
}

test("★★★ B2: ninguna pantalla pasa de 60 palabras visibles, salvo las que Near está reescribiendo (que siguen pasándose)", async (t) => {
  const peor = await medirB2();
  for (const [id, n] of Object.entries(peor)) t.diagnostic(`B2 ${id}: ${n} (bruto, con la cejilla: ${bruto_[id]})`);
  assert.match(leer("src/components/mecanicas/libros/t7/aprenderC3.jsx"), /<p className="c3-cejilla" aria-hidden="true">/, "la cejilla que no se cuenta es la que el lector no lee");
  assert.deepEqual(Object.keys(peor), P.pantallas.map((p) => p.id));
  assert.deepEqual(Object.entries(peor).filter(([id, n]) => n > CANON.UMBRAL_B2_PALABRAS && !PENDIENTES_NEAR.has(id)), []);
  /* Si una pendiente ya cumple, se saca de la lista: que ninguna se quede escondida. */
  assert.deepEqual([...PENDIENTES_NEAR].filter((id) => peor[id] <= CANON.UMBRAL_B2_PALABRAS), []);
});

/* ═══════════ 4 · CÓDIGO, CATÁLOGO Y VISTA ═══════════ */

/* ═══════════ LOTE V · LAS OPCIONES, BARAJADAS ═══════════ */

test("★★★ lote V: las opciones (las dos preguntas y los corchetes de P5) salen barajadas con la función compartida (azar fijado), el mismo conjunto, la correcta no siempre primero, y el orden no cambia al fallar", async () => {
  const { barajadorDe } = await import("../../utils/barajar.js");
  assert.match(leer("src/components/mecanicas/libros/t7/aprenderC3.jsx"), /import \{ barajar \} from "\.\.\/\.\.\/\.\.\/\.\.\/utils\/barajar\.js"/);
  assert.match(FUENTE, /barajar=\{barajar\}/, "la pieza pasa `barajar` al motor");
  const casos = [
    { id: "dos-cuentas-propias", sel: ".c3-op[data-op]", leer: (b) => b.dataset.op, antes: (m) => m.accion("modo", "aparte") },
    { id: "cuanto-se-reversa", sel: "[data-figura] [data-elige]", leer: (b) => b.dataset.elige, antes: async () => {} },
    { id: "lado-a-lado", sel: ".c3-op[data-op]", leer: (b) => b.dataset.op, antes: (m) => m.accion("fecha", "j1") },
  ];
  for (const c of casos) {
    const datos = pantalla(c.id).opciones.map((o) => o.id);
    const buena = pantalla(c.id).opciones.find((o) => o.correcta).id;
    const ordenes = [];
    for (const semilla of ["a", "b", "c", "d", "e", "f"]) {
      const m = await montar(desde(c.id), { barajar: barajadorDe(semilla) });
      try {
        await c.antes(m);
        const enPantalla = () => m.qa(c.sel).map(c.leer);
        const orden = enPantalla();
        assert.deepEqual([...orden].sort(), [...datos].sort(), `${c.id}: el mismo conjunto`);
        const mala = orden.find((x) => x !== buena);
        await m.op(mala);
        assert.ok(m.qa(c.sel).find((b) => c.leer(b) === mala).classList.contains("mal"), `${c.id}: era un error`);
        assert.deepEqual(enPantalla(), orden, `${c.id}: al fallar no se rebaraja`);
        ordenes.push(orden);
      } finally {
        m.desmontar();
      }
    }
    assert.ok(ordenes.some((o) => o.join() !== datos.join()), `${c.id}: en algún caso, distinto del orden de los datos`);
    assert.ok(ordenes.some((o) => o[0] !== buena), `${c.id}: la correcta no queda siempre primero`);
    assert.ok(new Set(ordenes.map((o) => o.join())).size > 1, `${c.id}: el orden depende del azar`);
  }
});

test("★★ el CSS: prefijo propio, subgrid con respaldo (@supports), sin teal ni ámbar, botones de 44 px", () => {
  const css = COMP.CSS_A6;
  for (const regla of css.split("\n").filter((l) => /\{/.test(l) && !/^\s*(@|\/\*|\})/.test(l))) assert.match(regla.trim(), /^\.a6/, regla);
  const i = css.indexOf("@supports (grid-template-rows: subgrid) {");
  assert.ok(i >= 0, "el subgrid va dentro de @supports");
  const fin = css.indexOf("\n}\n", i);
  assert.equal(css.split("subgrid").length - 1, 2, "subgrid solo en la condición y en su regla");
  for (const x of ["grid-template-rows: subgrid;", "repeat(var(--n, 1), auto)"]) assert.ok(css.indexOf(x) > i && css.indexOf(x) < fin, x);
  assert.doesNotMatch(css, /#2A9D8F|#3FA69A|#E9C46A|teal|ambar/i);
  assert.match(css, /\.a6-base \{ min-height: 44px;/);
  assert.match(css, /\.a6-espejo \.c3-tile:not\(\.a6-libro\) \{ min-height: 44px; \}/);
  assert.doesNotMatch(css, /style\*=/, "sin selectores sobre el atributo style (React escribe «--a: 84…»)");
});

test("★★ el motor no cambia: la pieza solo lo importa; nunca «Iba aquí»", () => {
  assert.match(FUENTE, /import AprenderC3, \{ Cruce, AsientoT \} from "\.\/aprenderC3\.jsx";/);
  assert.doesNotMatch(FUENTE, /Iba aquí|ibaAqui/);
});

test("★★ sin la renta del 33 %, sin nada interno y sin «contar» en lo que se ve", () => {
  const textos = JSON.stringify(P) + JSON.stringify(A.FIGURA);
  assert.doesNotMatch(textos, /33 ?%|renta/i);
  for (const interno of ["≈", "Near", "Mello", "Watari", "[W]", "[R]", "PENDIENTE"]) assert.ok(!textos.includes(interno), interno);
  assert.doesNotMatch(textos, /(?<!\p{L})cont(ar|ó|amos|aron|aste)(?!\p{L})/iu);
});

test("★★★ fuera del catálogo de FP; mismo id y misma posición en T7-1; la vista monta la pieza nueva", () => {
  assert.equal(A.A6_ID, MAIN.A6_ID);
  assert.equal(P.id, "t7-1-a6-devoluciones-en-periodico");
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === A.A6_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  assert.deepEqual(tema.actividades.map((x) => x.id), [
    "t7-1-a1-la-cuenta-que-no-se-mueve", "t7-1-a2-la-factura-completa",
    "t7-1-que-cuenta-se-mueve", "t7-1-arma-la-factura",
    "t7-1-a3-tres-formas", "t7-1-cuanto-vale-lo-que-sobro",
    "t7-1-a4-el-cierre-en-periodico", "t7-1-cierra-el-mes",
    "t7-1-a5-importados-y-fletes", "t7-1-costo-o-gasto",
    A.A6_ID, "t7-1-devolucion-dos-libros",
    "t7-1-a7-control-interno", "t7-1-que-control-falta",
  ]);
  assert.deepEqual(PIEZAS_T7_1.map((x) => x.pieza.id), ["t7-1-a1-la-cuenta-que-no-se-mueve", "t7-1-a2-la-factura-completa", "t7-1-a3-tres-formas", "t7-1-a4-el-cierre-en-periodico", "t7-1-a5-importados-y-fletes", A.A6_ID, "t7-1-a7-control-interno"]);
  const e = PIEZAS_T7_1.find((x) => x.pieza.id === A.A6_ID);
  assert.equal(e.Pieza, Devoluciones);
  assert.equal(e.pieza, P);
  assert.equal(e.numero, 6);
  assert.doesNotMatch(leer("src/components/ContabilidadT7_1View.jsx"), /DevolucionesEnPeriodico\.jsx|contabilidadT7_1_a6\.js/, "la vista ya no monta la A6 tabular");
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes("devoluciones-en-periodico")), []);
  for (const f of [FUENTE, FUENTE_DATOS]) assert.doesNotMatch(f, /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});

test("★★ la vista entera monta A6 en el motor C3, en su posición", async () => {
  const { default: Vista } = await import("../../components/ContabilidadT7_1View.jsx");
  const { AuthContext } = await import("../../auth/AuthProvider.jsx");
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta() {} } }, h(Vista, { onBack() {} }))); });
  const piezas = [...caja.querySelectorAll("[data-pieza]")].map((x) => x.dataset.pieza);
  assert.equal(piezas[5], A.A6_ID);
  const a6 = caja.querySelector(`[data-pieza="${A.A6_ID}"]`);
  assert.ok(a6.classList.contains("c3") && a6.classList.contains("a6"));
  assert.equal(a6.dataset.pantalla, "portada");
  act(() => raiz.unmount());
  caja.remove();
});
