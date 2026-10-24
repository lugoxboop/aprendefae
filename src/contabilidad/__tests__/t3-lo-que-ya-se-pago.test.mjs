import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · PIEZA 4 — «Lo que ya se pagó y no ha pasado» (paquete de Levi).
 *
 *   · contadores y saldo del bloque en cada uno de los 10 pasos
 *   · capa 3: junio $10.000 y gastos $5.000; julio $5.000 y $10.000; agosto
 *     $0 y $15.000, en cualquier orden de toques
 *   · los nombres de cuenta del asiento y del bloque son idénticos
 *   · el texto de Gen con sus correcciones; nunca «adelantado»
 *   · el valor final de contadores y saldo queda escrito siempre
 *   · «Pieza n de N» cuenta las piezas publicadas
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let reducido = true;
w.matchMedia = (q) => ({ matches: q.includes("reduce") ? reducido : false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame, cancelAnimationFrame: w.cancelAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const P4 = await import("../../data/contabilidadTema3Pieza4.js");
const L = await import("../loQueYaSePago.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: LoQueYaSePago, asientoEnTexto } = await import("../../components/mecanicas/libros/tema3/LoQueYaSePago.jsx");
const { default: CadaMes } = await import("../../components/mecanicas/libros/tema3/CadaMes.jsx");
const { ESCENAS_TEMA3 } = await import("../../components/mecanicas/libros/tema3/escenasTema3.jsx");
const { PIEZAS } = await import("../../components/ContabilidadTema3View.jsx");
const { default: UnaFrase } = await import("../../components/mecanicas/libros/intro/UnaFrase.jsx");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
/* En tramos cortos: dentro de un solo act largo, React no pinta hasta el final. */
const dormir = async (ms) => {
  for (let t = 0; t < ms; t += 100) await act(async () => { await new Promise((r) => setTimeout(r, Math.min(100, ms - t))); });
};
const montos = (caja) => ["ingreso", "gasto", "entrada", "salida"].map((t) => caja.querySelector(`[data-contador="${t}"] [data-monto]`)?.textContent ?? null);
const saldo = (caja) => caja.querySelector("[data-saldo]")?.textContent ?? null;

/* ═══════════ LOS DIEZ PASOS (Xeno, P2 §5) ═══════════ */

/* Ingresos · Gastos · Entró · Salió, y el saldo del bloque (null = sin bloque). */
const TABLA = {
  1: [[0, 0, 0, 0], null],
  2: [[0, 0, 0, 15000], null],
  3: [[0, 0, 0, 15000], null],
  4: [[0, 0, 0, 15000], 15000],
  5: [[0, 5000, 0, 15000], 10000],
  6: [[0, 5000, 0, 15000], 10000],
  7: [[0, 5000, 0, 15000], 10000],
  8: [[0, 0, 15000, 0], 15000],
  9: [[5000, 0, 15000, 0], 10000],
};

test("★★★ contadores y saldo del bloque en cada uno de los 10 pasos", () => {
  for (const [p, [cuentas, s]] of Object.entries(TABLA)) {
    const e = L.estadoPasoP4(Number(p));
    const c = e.contadores;
    assert.deepEqual([c.ingreso, c.gasto, c.entrada, c.salida], cuentas, `paso ${p}`);
    assert.equal(e.bloque?.saldo ?? null, s, `paso ${p}: saldo`);
  }
  const e10 = L.estadoPasoP4(10);
  assert.equal(e10.modo, "espejo");
  assert.equal(e10.bloque, null, "en el espejo no hay bloque");
  /* El saldo sale de las fichas: $15.000 menos $5.000 por mes cerrado. */
  for (let p = 4; p <= 9; p++) {
    const b = L.estadoPasoP4(p).bloque;
    assert.equal(b.saldo, 15000 - 5000 * b.consumidas);
  }
});

test("★★★ cada paso: modo, empresa, cortes, «Diferido», resaltado y pistas", () => {
  const e = (p) => L.estadoPasoP4(p);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => e(p).modo),
    ["lineas", "lineas", "lineas", "lineas", "lineas", "asiento", "lineas", "lineas", "asiento", "espejo"]);
  assert.equal(e(1).calendario.meses, false);
  assert.equal(e(2).calendario.meses, true);
  assert.deepEqual(e(4).calendario.cortes, ["porVenir", "porVenir", "porVenir"]);
  assert.deepEqual(e(5).calendario.cortes, ["activo", "porVenir", "porVenir"]);
  assert.deepEqual(e(8).calendario.cortes, ["porVenir", "porVenir", "porVenir"]);
  assert.equal(e(3).calendario.diferido, true);
  assert.equal(e(4).calendario.diferido, false);
  assert.equal(e(7).bloque.resaltado, true);
  assert.equal(e(6).bloque.resaltado, false);
  assert.deepEqual(e(2).pistas, { resultados: "quieta", caja: "activa" });
  assert.deepEqual(e(5).pistas, { resultados: "activa", caja: "quieta" });
  assert.equal(e(7).empresa.nombre, "San Calixto");
  assert.equal(e(8).empresa.nombre, "Arriendos de la Costa");
  assert.equal(e(8).recienCambiada, true);
  assert.equal(e(8).bloque.etiqueta, "Por cumplir");
  assert.equal(e(4).bloque.etiqueta, "Por gastar");
  /* La marca del cierre lleva el monto a la izquierda: si no, cruzaría el corte. */
  assert.equal(e(5).marcas.find((m) => m.tipo === "gasto").montoIzquierda, true);
  assert.equal(e(9).marcas.find((m) => m.tipo === "ingreso").montoIzquierda, true);
});

/* ═══════════ LA CAPA 3 ═══════════ */

const MESES_ESPERADOS = { Junio: [10000, 5000], Julio: [5000, 10000], Agosto: [0, 15000] };

test("★★★ capa 3: junio $10.000 y $5.000; julio $5.000 y $10.000; agosto $0 y $15.000", () => {
  for (const [mes, [s, g]] of Object.entries(MESES_ESPERADOS)) {
    const e = L.estadoCapa3P4(mes);
    assert.equal(e.bloque.saldo, s, mes);
    assert.equal(e.contadores.gasto, g, mes);
    assert.equal(e.contadores.salida, 15000, mes);
    assert.equal(e.marcas.filter((m) => m.tipo === "gasto").length, MESES_ESPERADOS[mes] && P4.MESES.indexOf(mes) + 1);
  }
  const inicial = L.estadoCapa3P4(null);
  assert.equal(inicial.bloque.saldo, 15000, "sin mes, es el estado del paso 4");
  assert.equal(inicial.contadores.gasto, 0);
  assert.deepEqual(L.estadoCapa3P4("Julio").calendario.cortes, ["pasado", "activo", "porVenir"]);
});

test("★★★ capa 3 montada: el resultado es el mismo en cualquier orden de toques", async () => {
  reducido = true;
  const ordenes = [
    ["Junio", "Julio", "Agosto"], ["Agosto", "Junio"], ["Julio", "Agosto", "Julio"], ["Agosto", "Julio", "Junio", "Agosto"],
  ];
  for (const orden of ordenes) {
    const m = await montar(h(CadaMes));
    try {
      assert.equal(saldo(m.caja), "$15.000");
      for (const mes of orden) {
        await tocar(m.caja.querySelector(`[data-boton-mes="${mes}"]`));
        const [s, g] = MESES_ESPERADOS[mes];
        assert.equal(saldo(m.caja), `$${s.toLocaleString("es-CO").replace(/,/g, ".")}`.replace("$0", "$0"), `${orden.join("→")} en ${mes}`);
        assert.equal(montos(m.caja)[1], g === 0 ? "$0" : `$${String(g).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`);
        assert.equal(m.caja.querySelector(`[data-boton-mes="${mes}"]`).getAttribute("aria-pressed"), "true");
        assert.equal(m.caja.querySelectorAll('[data-estado-ficha="consumida"]').length, P4.MESES.indexOf(mes) + 1);
      }
      const ultimo = orden.at(-1);
      assert.equal(m.caja.querySelector("[data-anuncio-p4]").textContent,
        `${ultimo}. Arriendos pagados por anticipado: $${String(MESES_ESPERADOS[ultimo][0]).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}.`);
    } finally { m.desmontar(); }
  }
});

/* ═══════════ LAS CUENTAS (Levi) Y EL TEXTO (Gen) ═══════════ */

test("★★★ los nombres de cuenta del asiento y del bloque son idénticos", () => {
  assert.deepEqual(P4.SAN_CALIXTO_P4.asiento, { debe: { cuenta: "Gasto arriendos", monto: 5000 }, haber: { cuenta: "Arriendos pagados por anticipado", monto: 5000 } });
  assert.deepEqual(P4.ARRIENDOS_DE_LA_COSTA.asiento, { debe: { cuenta: "Arriendos recibidos por anticipado", monto: 5000 }, haber: { cuenta: "Ingresos por arriendos", monto: 5000 } });
  assert.equal(P4.SAN_CALIXTO_P4.bloque.cuenta, P4.SAN_CALIXTO_P4.asiento.haber.cuenta);
  assert.equal(P4.ARRIENDOS_DE_LA_COSTA.bloque.cuenta, P4.ARRIENDOS_DE_LA_COSTA.asiento.debe.cuenta);
  assert.equal(L.estadoPasoP4(6).asiento.haber.cuenta, L.estadoPasoP4(6).bloque.cuenta);
  assert.equal(L.estadoPasoP4(9).asiento.debe.cuenta, L.estadoPasoP4(9).bloque.cuenta);
});

test("★★★ el texto de Gen con sus correcciones: cierre nuevo, «por anticipado», pregunta y capa 1", () => {
  const p = P4.PIEZA_LO_QUE_YA_SE_PAGO;
  assert.equal(p.objetivo, "Reconoce y anota lo que se pagó o se recibió por anticipado, mes a mes.");
  assert.deepEqual(p.nombres.map((n) => n.termino), ["Diferido", "Pagado por anticipado", "Recibido por anticipado", "Desde ya"]);
  assert.equal(p.nombres[1].definicion, "Lo que la empresa pagó por anticipado es algo que todavía tiene. Lo va gastando con el tiempo.");
  assert.equal(p.nombres[2].definicion, "Lo que la empresa recibió por anticipado es algo que todavía debe. Lo va cumpliendo con el tiempo.");
  assert.match(p.nombres[2].delLibro, /en la medida que va pasando el tiempo, se van convirtiendo en gastos» \(pp\. 142-143\).*\(p\. 145\)/);
  assert.equal(p.nombres[3].definicion, "En la pieza anterior la plata iba atrás. Aquí va adelante.");
  assert.equal(P4.SEGMENTOS_P4.length, 9);
  assert.equal(L.estadoPasoP4(4).textos[0], "Esos $15.000 son algo que la empresa tiene: tres meses de local pagados por anticipado.");
  assert.equal(L.estadoPasoP4(10).textos[0], "Un solo pago, dos empresas. Para San Calixto es un gasto que se va causando mes a mes; para Arriendos de la Costa, un ingreso que se va causando igual.");
  assert.equal(P4.PREGUNTA_FINAL_P4, "Elige la frase que mejor dice qué es un pago por anticipado.");
  for (let k = 1; k <= 10; k++) assert.equal(Boolean(L.estadoPasoP4(k).alternativo), [4, 5, 7].includes(k), `paso ${k}`);
  assert.equal(L.estadoPasoP4(4).alternativo, "Ejemplo: aparece un bloque de $15.000. Son tres meses de local pagados por anticipado.");
  assert.equal(ESCENAS_TEMA3["t3-a4-lo-que-ya-se-pago"].Capa4().type, UnaFrase);
});

test("★★★ «adelantado» no aparece en ningún archivo de la pieza", () => {
  const archivos = [
    "../../data/contabilidadTema3Pieza4.js", "../loQueYaSePago.js",
    "../../components/mecanicas/libros/tema3/LoQueYaSePago.jsx", "../../components/mecanicas/libros/tema3/CadaMes.jsx",
    "../../components/mecanicas/libros/tema3/BloqueAnticipo.jsx",
  ];
  for (const a of archivos) assert.doesNotMatch(readFileSync(new URL(a, import.meta.url), "utf8"), /adelantad/i, a);
});

/* ═══════════ LA CAPA 2, MONTADA ═══════════ */

test("★★★ capa 2: los diez pasos con sus contadores, su saldo, los asientos y el espejo", async () => {
  reducido = true;
  const m = await montar(h(LoQueYaSePago));
  try {
    for (let p = 1; p <= 10; p++) {
      assert.equal(m.caja.querySelector("[data-paso-de]").textContent, `Paso ${p} de 10`);
      if (p < 10) {
        const [cuentas, s] = TABLA[p];
        assert.deepEqual(montos(m.caja), cuentas.map((n) => (n ? `$${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : "$0")), `paso ${p}`);
        assert.equal(saldo(m.caja), s === null ? null : `$${String(s).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`, `paso ${p}: saldo`);
        for (const el of m.caja.querySelectorAll("[data-monto], [data-saldo]")) assert.equal(el.textContent, el.getAttribute("data-final"));
      }
      if (p === 6 || p === 9) {
        const e = L.estadoPasoP4(p);
        assert.deepEqual([...m.caja.querySelectorAll("[data-asiento] [data-cuenta]")].map((x) => x.textContent), [e.asiento.debe.cuenta, e.asiento.haber.cuenta]);
        assert.equal(m.caja.querySelector('[role="group"][aria-label="Asiento"]').textContent, asientoEnTexto(e.asiento));
        assert.equal(m.caja.querySelector("[data-cuenta-bloque]").textContent, e.bloque.cuenta);
      }
      if (p === 10) {
        assert.equal(m.caja.querySelector("[data-modo]").getAttribute("data-modo"), "espejo");
        assert.deepEqual([...m.caja.querySelectorAll("[data-espejo-empresa] [data-cuenta]")].map((x) => x.textContent),
          ["Gasto arriendos", "Arriendos pagados por anticipado", "Arriendos recibidos por anticipado", "Ingresos por arriendos"]);
        assert.equal(m.caja.querySelector("[data-reproducir]").textContent, "Ver de nuevo");
      }
      const grupo = m.caja.querySelector('[role="group"][aria-describedby]');
      if ([4, 5, 7].includes(p)) assert.equal(document.getElementById(grupo.getAttribute("aria-describedby")).textContent, P4.ALTERNATIVOS_P4[p]);
      assert.equal(m.caja.querySelector("[data-texto-paso]").textContent, L.estadoPasoP4(p).textos[0]);
      if (p < 10) await tocar(m.caja.querySelector("[data-siguiente]"));
    }
  } finally { m.desmontar(); }
});

test("★★★ con animación, el valor final de los contadores y del saldo queda escrito", async () => {
  reducido = false;
  const m = await montar(h(LoQueYaSePago));
  try {
    for (let p = 1; p < 5; p++) await tocar(m.caja.querySelector("[data-siguiente]"));
    await dormir(1800);
    assert.deepEqual(montos(m.caja), ["$0", "$5.000", "$0", "$15.000"]);
    assert.equal(saldo(m.caja), "$10.000");
  } finally { m.desmontar(); reducido = true; }
});

test("★★ la capa 3 con animación termina en el valor de su mes", async () => {
  reducido = false;
  const m = await montar(h(CadaMes));
  try {
    await tocar(m.caja.querySelector('[data-boton-mes="Agosto"]'));
    await dormir(1800);
    assert.equal(saldo(m.caja), "$0");
    assert.equal(montos(m.caja)[1], "$15.000");
    await tocar(m.caja.querySelector('[data-boton-mes="Junio"]'));
    await dormir(1800);
    assert.equal(saldo(m.caja), "$10.000");
    assert.equal(montos(m.caja)[1], "$5.000");
  } finally { m.desmontar(); reducido = true; }
});

/* ═══════════ EN APRENDER ═══════════ */

test("★★★ va después de la pieza 3, deja libre el lugar de la 2, y el contador cuenta las publicadas", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "ingresos-gastos-y-caja");
  assert.deepEqual(tema.actividades.filter((a) => a.clasificacion.tipo === APRENDER).map((a) => a.id),
    ["t3-a1-vender-no-es-cobrar", "t3-a3-lo-que-ya-paso", "t3-a4-lo-que-ya-se-pago", "t3-a5-cerrar-el-periodo"]);
  /* «Cerrar el periodo» se sumó al final (Levi): la pieza 4 sigue siendo la tercera. */
  assert.deepEqual(PIEZAS.map((x) => x.numero).slice(0, 3), [1, 3, 4]);
  const vista = readFileSync(new URL("../../components/ContabilidadTema3View.jsx", import.meta.url), "utf8");
  assert.match(vista, /PIEZA \{k \+ 1\} DE \{PUBLICADAS\}/);
});

/* ═══════════ COLORES ═══════════ */

test("★★★ sin coral; verde azulado y ámbar solo en el asiento; #B8C4D4 nunca es color de texto", async () => {
  const leer = (a) => readFileSync(new URL(a, import.meta.url), "utf8");
  const TEAL_AMBAR_CORAL = /#2a9d8f|#52c4b0|#e9c46a|#e76f51|FAE\.(teal|ambar|coral)|COLOR_LADO|TONO_ROTULO/i;
  for (const a of [
    "../../data/contabilidadTema3Pieza4.js", "../loQueYaSePago.js",
    "../../components/mecanicas/libros/tema3/LoQueYaSePago.jsx", "../../components/mecanicas/libros/tema3/CadaMes.jsx",
    "../../components/mecanicas/libros/tema3/BloqueAnticipo.jsx", "../../components/mecanicas/libros/tema3/DosLineas.jsx",
  ]) assert.doesNotMatch(leer(a), TEAL_AMBAR_CORAL, a);

  reducido = true;
  for (const [C, boton] of [[LoQueYaSePago, "[data-siguiente]"], [CadaMes, "[data-boton-mes]"]]) {
    const m = await montar(h(C));
    try {
      for (let k = 0; k < 10; k++) {
        for (const el of m.caja.querySelectorAll("*")) {
          const tieneTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (tieneTexto) assert.notEqual(el.style.color.replace(/\s/g, ""), "rgb(184,196,212)", `«${el.textContent}» en #B8C4D4`);
        }
        const bs = [...m.caja.querySelectorAll(boton)];
        const b = bs[k % bs.length];
        if (b && !b.disabled) await tocar(b);
      }
    } finally { m.desmontar(); }
  }
});
