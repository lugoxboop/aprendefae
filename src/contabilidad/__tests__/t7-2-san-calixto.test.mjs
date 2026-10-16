import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMello } from "./correccionesMello.mjs";
import * as M from "./correccionesMelloA4.mjs";
import * as C1 from "./correccionesMelloC1.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A4 «Las capas que la venta corta» (Célula C · Patrón de enganche C,
 * pieza 4, v6 de Watari, con A4-N1 de Mello). Reemplaza a «San Calixto en
 * permanente» con el mismo id.
 *
 * La fuente es la v6 (patron-enganche-c-v6.html): su tabla «Pantalla por
 * pantalla» y su código de referencia (`a4.js`), que esta prueba saca del
 * HTML y EJECUTA en un JSDOM aparte. Con eso:
 *
 *   · cada texto de los datos es, letra por letra, el de la v6 (las 7
 *     pantallas, sus mensajes, la escalera y los rótulos), y al revés
 *   · los 30 estados de la pila (10 fechas × 3 métodos) son los de la v6, y
 *     cuadran con los tres kárdex de la pieza de hoy (KARDEX_A4, pp. 239-241),
 *     que a su vez salen del libro
 *   · la pieza montada se juega a la par con la v6, acción por acción
 *     (deslizador un paso adelante, saltos y atrás; cada error, la escalera y
 *     el acierto; el selector; la mezcla del promedio con temporizadores
 *     falsos), con y sin movimiento reducido, y en cada estado lo que se ve
 *     es lo de la v6 con A4-N1 encima (correccionesMelloA4.mjs)
 *   · F1 de Mello, como la midió: al saltar o volver, 0 capas «vendidas», 0
 *     cortes y 0 capas que caen
 *   · la pantalla del cierre, entre la 6 y el resumen, rehecha por C1 (Near,
 *     t7-2-a4-el-cierre-c1.md, con PASA de Mello; correccionesMelloC1.mjs):
 *     sus textos, letra por letra, en los dos sentidos; «Comprobar» con cada
 *     selección posible; la escalera; la figura que pasa a la lista del
 *     permanente y se queda; el foco; B1 y B2; la línea nueva del resumen
 *   · foco: al responder, al mensaje; al seguir, al texto
 *   · fuera del catálogo de FP; en T7-2 después de A3, con el nombre de la v6
 * ═══════════════════════════════════════════════════════════════════════════
 */

let reducir = false;
const matchMedia = (q) => ({ matches: reducir && /reduce/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = matchMedia;
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadT7_2_a4_capas.js");
const A = await import("../../data/contabilidadT7_2_a4.js");
const C = await import("../t7_2Capas.js");
const K = await import("../t7_2Kardex.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: LasCapas, CSS_A4, MEZCLA_MS, comprobarCierre, listaDelPermanente } = await import("../../components/mecanicas/libros/t7/LasCapasQueLaVentaCorta.jsx");
const { PIEZAS_T7_2, TEMA_T7_2 } = await import("../../components/ContabilidadT7_2View.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const P = D.PIEZA_LAS_CAPAS;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const CAPAS = P.pantallas.filter((x) => x.tipo === "capas");
const contar = (t) => t.split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;

/* ═══════════ LA v6, EJECUTADA ═══════════ */

const v6dom = new JSDOM("<!doctype html><html><body></body></html>", { runScripts: "outside-only", virtualConsole: new VirtualConsole() });
const v6 = v6dom.window;
v6.matchMedia = matchMedia;
/* Sus temporizadores pasan por los de Node, para que `mock.timers` los mueva a la vez que los de la pieza. */
v6.setTimeout = (f, ms) => globalThis.setTimeout(f, ms);
v6.clearTimeout = (t) => globalThis.clearTimeout(t);
v6.eval(M.A4JS);
const V6 = v6.EngancheA4;
/* La v6 tiene 7 pantallas; la pieza, 8: la del cierre de hoy va en la 7 (índice 6). */
const enLaV6 = (k) => (k < 6 ? k : k === 7 ? 6 : null);
/* Los objetos de la v6 son de otro reino: se copian antes de comparar. */
const copia = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));

/* ═══════════ 1 · TEXTOS, LETRA POR LETRA CONTRA LA v6 ═══════════ */

test("★★★ el título es el de la v6 y el código que se ejecuta es el publicado como referencia", () => {
  assert.equal(M.TITULO_V6, "Las capas que la venta corta");
  assert.equal(P.titulo, M.TITULO_V6);
  assert.equal(D.TITULO_A4, M.TITULO_V6);
  /* El código en línea que juega la página es, letra por letra, el de «a4.js · la pieza» (como lo verificó Mello). */
  assert.ok(M.V6_HTML.includes(M.A4JS));
  assert.equal(P.pantallas.length, 8);
  assert.equal(V6.PANTALLAS.length, 7);
});

test("★★★ cada pantalla de capas es la de la v6, campo por campo (textos, botones, opciones, mensajes, escalera, fechas, rango), y nada más", () => {
  for (const [k, p] of P.pantallas.entries()) {
    const j = enLaV6(k);
    if (j === null) { assert.equal(p.id, "el-cierre"); continue; }
    const q = V6.PANTALLAS[j];
    const et = `${p.id} ↔ ${q.id}`;
    assert.equal(p.tipo, "capas", et);
    for (const campo of ["texto", "boton", "metodo", "idx", "gate"]) assert.equal(p[campo], q[campo], `${et} · ${campo}`);
    assert.equal(Boolean(p.selector), Boolean(q.selector), et);
    for (const campo of ["rango", "opciones", "tocar", "elegir"]) assert.deepEqual(p[campo], copia(q[campo]), `${et} · ${campo}`);
    /* «listo» es una función en la v6: se compara con cada visto posible. */
    for (let visto = 0; visto <= 9; visto++) {
      const v = q.listo ? q.listo({ visto }) : undefined;
      assert.equal(p.listo === undefined ? undefined : visto >= p.listo, v, `${et} · listo con visto ${visto}`);
    }
    /* Y al revés: los mismos campos (salvo el tipo, que es de la casa, y el presupuesto, que es de la ficha). */
    const claves = (o) => Object.keys(o).filter((x) => !["id", "tipo", "presupuesto"].includes(x)).sort();
    assert.deepEqual(claves(p), claves(q), et);
    assert.equal(q.presupuesto, 40, et);
  }
});

test("★★★ los textos de pantalla son los de la tabla «Pantalla por pantalla», con sus palabras, y los mensajes caben en 15", () => {
  assert.equal(M.TABLA_V6.length, 7);
  for (const fila of M.TABLA_V6) {
    const p = P.pantallas[fila.pantalla === 7 ? 7 : fila.pantalla - 1];
    assert.equal(p.texto, fila.texto, `pantalla ${fila.pantalla}`);
    assert.equal(contar(p.texto), fila.palabras, `pantalla ${fila.pantalla}: palabras`);
    assert.ok(fila.palabras <= fila.presupuesto && fila.presupuesto === 40);
  }
  /* Los mensajes tienen como mucho 15 palabras («Dónde va texto y cuánto cabe»), y el de A4-N1 también. */
  for (const p of CAPAS) {
    const T = p.tocar ?? p.elegir;
    if (!T) continue;
    for (const t of [T.bien, T.pista, ...Object.values(T.mal)]) assert.ok(contar(t) <= 15, `${p.id}: «${t}» (${contar(t)})`);
  }
  assert.ok(contar(D.SIGUE_HASTA_EL_28) <= 15);
});

test("★★★ A4-N1: el texto es el de Mello, en las dos auditorías", () => {
  assert.equal(D.SIGUE_HASTA_EL_28, M.SIGUE_HASTA_EL_28);
  assert.ok(M.MELLO_V5.includes(`«${D.SIGUE_HASTA_EL_28}»`) && M.MELLO_V6.includes(`«${D.SIGUE_HASTA_EL_28}»`));
});

test("★★★ UEPS lleva siempre «(no válido bajo NIIF)»; los tokens son los del producto; nada de teal ni ámbar", () => {
  assert.equal(D.NOMBRE_METODO.ueps, `Método ${A.UEPS}`);
  assert.equal(D.NOMBRE_METODO.ueps, A.KARDEX_A4.ueps.titulo);
  assert.doesNotMatch(CSS_A4, /2A9D8F|E9C46A|42,\s*157|233,\s*196/i);
  assert.match(CSS_A4, /@media \(prefers-reduced-motion: reduce\) \{ \.ea4 \*, \.ea4 \*::before, \.ea4 \*::after \{ animation: none !important; transition: none !important; \} \}/);
  for (const t of ["#0E1B2E", "#F8F9FA", "#B8C4D4", "#E76F51"]) assert.ok(CSS_A4.includes(t) && M.A4CSS.includes(t), t);
});

/* ═══════════ 2 · LOS 30 ESTADOS DE LA PILA ═══════════ */

test("★★★ los 30 estados (10 fechas × 3 métodos) son los de la v6", () => {
  for (const m of C.METODOS_CAPAS) assert.deepEqual(D.ESTADOS_CAPAS[m], copia(V6.ESTADOS[m]), m);
  /* Los datos son los de la pieza de hoy. */
  assert.deepEqual(D.INICIAL_CAPAS, { f: "1 feb", u: 5200, c: 1300 });
  assert.deepEqual(D.MOVS_CAPAS.map((x) => x.f), A.MOVIMIENTOS_A4.map((x) => x.fecha));
  /* La escala: la existencia más alta del mes, el 4 de febrero. */
  const existencias = D.ESTADOS_CAPAS.peps.map((e) => e.capas.reduce((s, x) => s + x.u, 0));
  assert.equal(D.ESCALA_CAPAS, Math.max(...existencias));
  assert.equal(existencias.indexOf(D.ESCALA_CAPAS), 2);
});

test("★★★ los 30 estados cuadran con los tres kárdex de hoy (KARDEX_A4): capas, salidas y costos unitarios", () => {
  const cu = (c) => Math.round(c * 100) / 100;
  for (const m of C.METODOS_CAPAS) {
    for (const [k, e] of D.ESTADOS_CAPAS[m].entries()) {
      const f = A.KARDEX_A4[m].filas[k];
      assert.equal(f.f, e.mov.f, `${m} ${k}`);
      assert.deepEqual(e.capas.map((x) => [x.u, cu(x.c)]), f.sal.map((x) => [x[0], x[1]]), `${m} ${f.f}: saldo`);
      assert.deepEqual(e.sale.map((x) => [x.u, cu(x.c)]), (f.sa ?? []).map((x) => [x[0], x[1]]), `${m} ${f.f}: salidas`);
    }
  }
});

test("★★★ las cifras se escriben como en la v6: miles con punto, «≈» y dos decimales solo si el costo no es entero", () => {
  const n0 = (v) => Math.round(v).toLocaleString("es-CO");
  const n2 = (v) => v.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  for (const m of C.METODOS_CAPAS) {
    for (const e of D.ESTADOS_CAPAS[m]) {
      for (const x of [...e.capas, ...e.sale]) {
        assert.equal(C.n0(x.u), n0(x.u));
        assert.equal(C.costo(x.c), C.esEntero(x.c) ? `$${n0(x.c)}` : `≈\u00a0$${n2(x.c)}`);
      }
    }
  }
  assert.equal(C.costo(1300), "$1.300");
  assert.equal(C.costo(6262951 / 4700), "≈\u00a0$1.332,54");
  assert.equal(C.movTxt(D.MOVS_CAPAS[2]), "6 feb · Vende 4.500");
  assert.equal(C.movTxt(D.MOVS_CAPAS[4]), "12 feb · Compra 2.500 a $1.350");
});

/* ═══════════ 3 · LOS DATOS DE HOY QUE LA PIEZA USA (pp. 238-241, decisión de Mello) ═══════════ */

const V1 = leer("orquestador/conocimiento/paquetes/t7-2-a4-v1.md");
const CONTENIDO = V1.slice(V1.indexOf("## Contenido"), V1.indexOf("## Erratas"));

test("★★★ los movimientos son los de la v1 de Near", () => {
  const filas = [];
  for (const l of CONTENIDO.slice(CONTENIDO.indexOf("| Fecha | Movimiento |")).split("\n").slice(2)) {
    if (!l.startsWith("| ")) break;
    filas.push(l.split("|").slice(1, 3).map((c) => c.trim()));
  }
  const num = (s) => Number(s.replace(/\./g, ""));
  const movs = filas.slice(1).map(([f, m]) => {
    const c = m.match(/Compra ([\d.]+) a \$([\d.]+)/);
    return c ? { fecha: f, compra: [num(c[1]), num(c[2])] } : { fecha: f, venta: num(m.match(/Vende ([\d.]+)/)[1]) };
  });
  assert.deepEqual(A.MOVIMIENTOS_A4, movs);
  assert.deepEqual(filas[0], ["1 feb", "Tiene 5.200 unidades a $1.300"]);
});

test("★★★ los tres kárdex de hoy salen al recalcularlos del libro; en la pieza nueva no hay totales en pesos ni cifras de X2", () => {
  const METODO = { peps: K.PEPS, ueps: K.UEPS_M, promedio: K.PROMEDIO };
  for (const [metodo, kx] of Object.entries(A.KARDEX_A4)) {
    const calc = K.kardex(A.INICIAL_A4, A.MOVIMIENTOS_A4, METODO[metodo]);
    assert.equal(kx.filas.length, calc.length, metodo);
    for (const [k, c] of calc.entries()) {
      for (const [bloque, cs] of [["en", c.entrada], ["sa", c.salida], ["sal", c.saldo]]) {
        const mostradas = kx.filas[k][bloque] ?? [];
        assert.equal(mostradas.length, (cs ?? []).length, `${metodo} ${c.fecha} ${bloque}`);
        for (const [j, capa] of (cs ?? []).entries()) assert.deepEqual(mostradas[j].slice(0, 2), [capa[0], capa[1]], `${metodo} ${c.fecha} ${bloque}`);
      }
    }
  }
  const todo = JSON.stringify(CAPAS);
  for (const x of A.X2) {
    assert.ok(!todo.includes(K.cifraK(x)), `${K.cifraK(x)} se ve`);
    assert.ok(!new RegExp(`[^\\d]${x}[^\\d]`).test(todo), `${x} está en los datos`);
  }
  /* El único total en pesos: el 2.887.951 del cálculo del libro en el acierto del promedio (C2 de Mello), que no es de X2. */
  assert.deepEqual([...new Set([...todo.matchAll(/\d{1,3}(?:\.\d{3}){2,}/g)].map((x) => x[0]))], ["2.887.951"]);
  assert.ok(!A.X2.includes(2_887_951));
});

/* ═══════════ 4 · LA PIEZA MONTADA, A LA PAR CON LA v6 ═══════════ */

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const clic = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const valorNativo = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
const deslizar = async (input, i) => {
  assert.ok(input, "no está el deslizador");
  await act(async () => { valorNativo.call(input, String(i)); input.dispatchEvent(new w.Event("input", { bubbles: true })); });
};

/* Lo que se ve de una pantalla de capas: el mismo retrato para la v6 y para la pieza. */
function retrato(raiz) {
  const q = (c) => raiz.querySelector(c);
  const clases = (el, lista) => lista.filter((c) => el.classList.contains(c));
  const sel = q(".ea4-selector");
  const rango = q(".ea4-rango");
  const msg = q(".ea4-msg");
  return {
    raiz: clases(raiz, ["dormida", "sin-capas"]),
    txt: q(".ea4-txt").textContent,
    metodo: q(".ea4-metodo").textContent,
    selector: { hidden: sel.hidden, label: sel.getAttribute("aria-label"), botones: [...sel.querySelectorAll("button")].map((b) => [b.dataset.metodo, b.textContent, b.getAttribute("aria-pressed"), b.classList.contains("activo")]) },
    ficha: [q(".ea4-ficha").textContent, q(".ea4-ficha").classList.contains("espera"), q(".ea4-ficha").getAttribute("aria-live")],
    ejes: [...raiz.querySelectorAll(".ea4-eje")].map((e) => [e.textContent, e.getAttribute("aria-hidden")]),
    pila: q(".ea4-pila").getAttribute("aria-label"),
    capas: [...raiz.querySelectorAll(".ea4-capa")].map((b) => {
      const lleno = b.querySelector(".ea4-lleno");
      const corte = b.querySelector(".ea4-corte");
      return {
        id: b.dataset.capa, clases: clases(b, ["llega", "agotada", "mezcla", "blanco", "mal", "pista", "rebota"]), disabled: b.disabled,
        f: b.querySelector(".ea4-f").textContent, num: b.querySelector(".ea4-num").textContent, sello: b.querySelector(".ea4-sello").textContent,
        w: lleno.style.getPropertyValue("--w"), w0: lleno.style.getPropertyValue("--w0"), corte: corte ? [corte.style.left, corte.style.width] : null,
      };
    }),
    sale: [q(".ea4-sale").textContent, [...q(".ea4-sale").querySelectorAll("span")].map((s) => s.textContent)],
    rango: { min: rango.min, max: rango.max, value: rango.value, step: rango.step, disabled: rango.disabled, label: rango.getAttribute("aria-label"), valuetext: rango.getAttribute("aria-valuetext") },
    marcas: [...q(".ea4-marcas").querySelectorAll("i")].map((i) => i.style.left),
    ops: [...raiz.querySelectorAll(".ea4-op")].map((b) => ({ id: b.dataset.op, t: b.querySelector("span").textContent, clases: clases(b, ["mal", "pista"]), disabled: b.disabled, em: [...b.querySelectorAll("em")].map((e) => e.textContent) })),
    msg: { texto: msg.textContent, tipo: clases(msg, ["mal", "bien", "pista"]).join(" "), role: msg.getAttribute("role") },
    seguir: [q(".ea4-seguir").textContent, q(".ea4-seguir").disabled],
  };
}

/*
 * El par: la v6 en su JSDOM y la pieza en el suyo, con las mismas acciones.
 * Lo que se espera de la pieza es el retrato de la v6 con A4-N1 encima: al
 * mover el deslizador con la pregunta resuelta, el mensaje es el de
 * `mensajeTrasMover`, y se queda así hasta que otra acción cambie el de la v6.
 */
async function par() {
  const r6 = v6.document.createElement("div");
  v6.document.body.appendChild(r6);
  const inst = V6(r6);
  const m = await montar(h(LasCapas, { pieza: P, rotulo: "PIEZA 4 DE 6" }));
  let nuevo = null; // el mensaje según A4-N1, mientras siga vigente
  let k = 0; // la pantalla de la pieza
  const nuestra = () => m.caja.querySelector("[data-capas]");
  const en6 = (sel) => r6.querySelector(sel).dispatchEvent(new v6.MouseEvent("click", { bubbles: true }));
  return {
    m, r6, nuestra,
    async capa(id) { nuevo = null; en6(`.ea4-capa[data-capa="${id}"]`); await clic(nuestra().querySelector(`.ea4-capa[data-capa="${id}"]`)); },
    async op(id) { nuevo = null; en6(`.ea4-op[data-op="${id}"]`); await clic(nuestra().querySelector(`.ea4-op[data-op="${id}"]`)); },
    async metodo(id) { en6(`.ea4-selector [data-metodo="${id}"]`); await clic(nuestra().querySelector(`.ea4-selector [data-metodo="${id}"]`)); },
    async mover(i) {
      const r = r6.querySelector(".ea4-rango");
      r.value = String(i);
      r.dispatchEvent(new v6.Event("input", { bubbles: true }));
      await deslizar(nuestra().querySelector(".ea4-rango"), i);
      const base = { texto: inst.s.msg, tipo: inst.s.msg ? inst.s.tipo : "" };
      const despues = M.mensajeTrasMover({ pantallaV6: inst.s.p + 1, resuelta: Boolean(inst.s.resuelto[V6.PANTALLAS[inst.s.p].id]), visto: inst.s.visto, mensajeV6: base });
      nuevo = despues === base ? null : despues;
    },
    async seguir() {
      nuevo = null;
      const salgoDe = P.pantallas[k].id;
      await clic(nuestra().querySelector(".ea4-seguir"));
      k += 1;
      /* De la 6 la pieza va al cierre, que la v6 no tiene: la v6 espera ahí. */
      if (salgoDe !== "mismo-final") en6(".ea4-seguir");
    },
    async salirDelCierre() { await clic(m.caja.querySelector('[data-boton="seguir"]')); k += 1; en6(".ea4-seguir"); },
    comparar(etiqueta) {
      const de6 = retrato(r6);
      /* Lote de dialecto C (R7): el pulgar pasa de 22 a 44 px y las marcas del día se centran en él: calc(22px + (100% - 44px) * f) en vez de la v6 (11px, 22px). */
      de6.marcas = de6.marcas.map((m) => { const x = /^calc\(11px \+ ([\d.]+) \* \(100% - 22px\)\)$/.exec(m); assert.ok(x, `marca de la v6 inesperada: ${m}`); return `calc(22px + ${x[1]} * (100% - 44px))`; });
      const nos = retrato(nuestra());
      if (nuevo) de6.msg = { ...de6.msg, texto: nuevo.texto, tipo: nuevo.tipo };
      assert.deepEqual(nos, de6, etiqueta);
      /* El rótulo: la v6 cuenta 7; la pieza, 8 (con el cierre). */
      assert.equal(nuestra().querySelector(".ea4-marca").textContent, `Pantalla ${k + 1} de 8`, etiqueta);
      assert.equal(r6.querySelector(".ea4-marca").textContent, `Pantalla ${enLaV6(k) + 1} de 7`, etiqueta);
      return nos;
    },
    fin() { m.desmontar(); r6.remove(); },
  };
}

/* Lo justo para llegar a la pantalla k (índice) de la pieza: lo que cada pantalla pide antes de «Seguir». */
async function hastaLaPantalla(x, k) {
  const pasos = [
    async () => {},
    async () => { await x.mover(2); },
    async () => { await x.capa("1 feb"); await x.mover(9); },
    async () => { await x.capa("4 feb"); await x.mover(9); },
  ];
  for (let i = 0; i < k; i++) { await pasos[i](); await x.seguir(); }
}

/* F1 de Mello: sin animar, nada que no ocurrió en ese paso. */
function sinAnimar(f, etiqueta) {
  assert.deepEqual(f.capas.filter((c) => c.clases.some((x) => ["llega", "agotada", "mezcla"].includes(x))).map((c) => c.id), [], `${etiqueta}: capas que llegan, caen o se funden`);
  assert.deepEqual(f.capas.filter((c) => c.corte).map((c) => c.id), [], `${etiqueta}: cortes`);
  assert.deepEqual(f.capas.filter((c) => c.num.includes("vendidas")).map((c) => c.id), [], `${etiqueta}: capas «vendidas»`);
}

/* El recorrido entero, igual con y sin movimiento reducido. Devuelve los retratos por etiqueta. */
async function jugar(reducido) {
  reducir = reducido;
  mock.timers.enable({ apis: ["setTimeout"] });
  const x = await par();
  const fotos = {};
  const foto = (e) => { fotos[e] = x.comparar(e); return fotos[e]; };
  const fundir = () => act(async () => { mock.timers.tick(MEZCLA_MS); });
  const activo = () => w.document.activeElement;
  try {
    /* 1 · portada: la pila espera atenuada, nada se mueve. */
    foto("p1");
    await x.seguir();
    assert.ok(activo() === x.nuestra().querySelector(".ea4-txt"), "al seguir, el foco va al texto");

    /* 2 · llegan las capas: un paso, otro, atrás y a saltos. */
    foto("p2");
    await x.mover(1); foto("p2 · 2 feb (paso)");
    await x.mover(2); foto("p2 · 4 feb (paso)");
    await x.mover(0); sinAnimar(foto("p2 · 1 feb (atrás)"), "atrás");
    await x.mover(2); sinAnimar(foto("p2 · 4 feb (salto)"), "salto");
    await x.seguir();

    /* 3 · PEPS: dos errores (el 2.º da la respuesta), un tercero, y el acierto. */
    foto("p3");
    await x.capa("2 feb"); foto("p3 · error 1");
    assert.ok(activo() === x.nuestra().querySelector(".ea4-msg"), "al responder, el foco va al mensaje");
    await x.capa("4 feb"); foto("p3 · error 2");
    await x.capa("2 feb"); foto("p3 · error 3");
    await x.capa("1 feb"); foto("p3 · acierto");
    assert.ok(activo() === x.nuestra().querySelector(".ea4-msg"), "el foco no está donde debe");
    await x.mover(4); foto("p3 · 8 feb (paso)");
    await x.mover(9); sinAnimar(foto("p3 · 28 feb (salto)"), "salto del 8 al 28");
    await x.mover(5); sinAnimar(foto("p3 · 12 feb (atrás)"), "del 28 al 12");
    await x.mover(4); sinAnimar(foto("p3 · 8 feb (atrás)"), "del 12 al 8");
    await x.seguir();

    /* 4 · UEPS. */
    foto("p4");
    await x.capa("1 feb"); foto("p4 · error 1 (1 feb)");
    await x.capa("2 feb"); foto("p4 · error 2 (2 feb)");
    await x.capa("4 feb"); foto("p4 · acierto");
    await x.mover(4); foto("p4 · 8 feb (paso)");
    await x.mover(3); foto("p4 · 6 feb (atrás)");
    await x.mover(9); foto("p4 · 28 feb (salto)");
    await x.seguir();

    /* 5 · el promedio: la compra llega aparte y se funde. */
    foto("p5");
    await x.op("igual"); foto("p5 · error 1");
    await x.op("baja"); foto("p5 · error 2");
    await x.op("sube"); foto("p5 · acierto");
    await fundir(); foto("p5 · acierto, ya fundida");
    await x.mover(6); foto("p5 · 16 feb (paso)");
    await x.mover(5); sinAnimar(foto("p5 · 12 feb (atrás)"), "promedio, atrás");
    await x.mover(0); sinAnimar(foto("p5 · 1 feb (atrás)"), "promedio, del 12 al 1");
    await x.mover(1); foto("p5 · 2 feb (paso)");
    await fundir(); foto("p5 · 2 feb, ya fundida");
    await x.mover(9); foto("p5 · 28 feb (salto)");
    await x.seguir();

    /* 6 · el mismo final: el selector no califica; las opciones sí. */
    foto("p6");
    await x.metodo("ueps"); foto("p6 · selector UEPS");
    await x.metodo("promedio"); foto("p6 · selector promedio");
    await x.mover(8); foto("p6 · 25 feb (atrás)");
    await x.mover(9); foto("p6 · 28 feb (paso)");
    await x.op("ueps"); foto("p6 · error 1");
    await x.op("promedio"); foto("p6 · error 2");
    await x.metodo("peps"); foto("p6 · selector PEPS");
    await x.op("peps"); foto("p6 · acierto");
    await x.mover(7); foto("p6 · 20 feb");
    await x.metodo("ueps"); foto("p6 · selector UEPS, resuelta");
    await x.seguir();

    /* 7 · el cierre (C1, se prueba aparte); la v6 no lo tiene. */
    assert.equal(x.m.caja.querySelector("[data-pieza]").dataset.pantalla, "el-cierre");
    assert.equal(x.m.caja.querySelector(".ea4-marca").textContent, "Pantalla 7 de 8");
    assert.ok(activo() === x.m.caja.querySelector("[data-cierre-c1] .ea4-txt"), "al llegar al cierre, el foco va a su texto");
    for (const f of pantalla("el-cierre").filas.filter((y) => y.sobra)) await clic(x.m.caja.querySelector(`[data-fila="${f.id}"]`));
    await clic(x.m.caja.querySelector('[data-boton="comprobar"]'));
    await x.salirDelCierre();

    /* 8 · el resumen: selector y fecha libres. */
    foto("p8");
    await x.metodo("promedio"); foto("p8 · selector promedio");
    await x.mover(4); foto("p8 · 8 feb");
    await x.mover(5); foto("p8 · 12 feb (paso)");
    await fundir(); foto("p8 · 12 feb, ya fundida");
  } finally {
    x.fin();
    mock.timers.reset();
    reducir = false;
  }
  return fotos;
}

test("★★★ jugada entera, estado por estado, es la v6 con A4-N1 encima (con movimiento)", async () => {
  const f = await jugar(false);
  assert.equal(Object.keys(f).length, 49);
  /* La portada: la pila atenuada, sin nada que mover. */
  assert.deepEqual(f.p1.raiz, ["dormida"]);
  assert.equal(f.p1.rango.disabled, true);
  assert.deepEqual(f.p1.seguir, ["Empezar", false]);
  /* Lo que la figura muestra en cada momento, según las procedencias medidas de la v6. */
  assert.deepEqual(f.p2.seguir, ["Seguir", true]);
  assert.deepEqual(f["p2 · 2 feb (paso)"].capas.map((c) => [c.id, c.clases]), [["1 feb", []], ["2 feb", ["llega"]]]);
  assert.deepEqual(f["p2 · 4 feb (paso)"].seguir, ["Seguir", false]);
  assert.deepEqual(f.p3.ficha, ["6 feb · Vende 4.500", true, "polite"]);
  assert.equal(f.p3.rango.disabled, true);
  assert.deepEqual(f.p3.capas.map((c) => c.id), ["1 feb", "2 feb", "4 feb"]);
  assert.ok(f.p3.capas.every((c) => c.clases.includes("blanco") && !c.disabled));
  assert.equal(f["p3 · error 1"].msg.texto, "No es esta: con PEPS sale primero la capa más antigua.");
  assert.equal(f["p3 · error 1"].msg.tipo, "mal");
  assert.deepEqual(f["p3 · error 1"].capas.find((c) => c.id === "2 feb").clases, ["blanco", "mal", "rebota"]);
  assert.equal(f["p3 · error 1"].capas.find((c) => c.id === "2 feb").sello, "No es esta");
  assert.equal(f["p3 · error 2"].msg.texto, pantalla("peps").tocar.pista);
  assert.equal(f["p3 · error 2"].msg.tipo, "pista");
  assert.deepEqual(f["p3 · error 2"].capas.find((c) => c.id === "1 feb").clases, ["blanco", "pista"]);
  /* El acierto: la venta corta la capa de abajo, rayado; lo que sale, debajo de la pila. */
  assert.deepEqual(f["p3 · acierto"].msg, { texto: pantalla("peps").tocar.bien, tipo: "bien", role: "status" });
  assert.equal(f["p3 · acierto"].capas.find((c) => c.id === "1 feb").num, "700 × $1.300");
  assert.ok(f["p3 · acierto"].capas.find((c) => c.id === "1 feb").corte);
  assert.equal(f["p3 · acierto"].sale[0], "Salen 4.500 × $1.300");
  assert.deepEqual(f["p3 · acierto"].seguir, ["Seguir", true]);
  /* El paso al 8: la del 1 y la del 2 se agotan («0 · … vendidas»), la del 4 se corta. */
  assert.deepEqual(f["p3 · 8 feb (paso)"].capas.map((c) => [c.id, c.num, c.clases]), [["1 feb", "0 · 700 vendidas", ["agotada"]], ["2 feb", "0 · 4.000 vendidas", ["agotada"]], ["4 feb", "2.200 × $1.325", []]]);
  /* A4-N1: con el 28 sin ver, «Sigue hasta el 28 de febrero.»; visto el 28, vacío. */
  assert.deepEqual(f["p3 · 8 feb (paso)"].msg, { texto: "Sigue hasta el 28 de febrero.", tipo: "", role: "status" });
  assert.equal(f["p3 · 28 feb (salto)"].msg.texto, "");
  assert.equal(f["p3 · 12 feb (atrás)"].msg.texto, "");
  assert.deepEqual(f["p3 · 28 feb (salto)"].seguir, ["Seguir", false]);
  assert.equal(f["p3 · 28 feb (salto)"].sale[0], "Salen 400 × $1.350 y 2.400 × $1.380");
  /* UEPS: la del 2 de febrero, al primer error, da el de Mello. */
  assert.equal(f["p4 · error 1 (1 feb)"].msg.texto, "Esa es la de PEPS. Con UEPS sale primero la última que entró.");
  assert.equal(f["p4 · error 2 (2 feb)"].msg.texto, pantalla("ueps").tocar.pista);
  assert.equal(f["p4 · acierto"].sale[0], "Salen 3.000 × $1.325 y 1.500 × $1.320");
  assert.equal(f["p4 · 6 feb (atrás)"].msg.texto, "Sigue hasta el 28 de febrero.");
  assert.equal(f["p4 · 28 feb (salto)"].msg.texto, "");
  /* El promedio: la compra llega aparte y se funde; sin ejes, «Todo». */
  assert.deepEqual(f["p5 · acierto"].capas.map((c) => [c.id, c.f, c.num, c.clases]), [["prom", "Todo", "2.200 × ≈\u00a0$1.312,70", []], ["12 feb", "12 feb", "2.500 × $1.350", ["llega"]]]);
  assert.deepEqual(f["p5 · acierto, ya fundida"].capas.map((c) => [c.id, c.f, c.num, c.clases]), [["prom", "Todo", "4.700 × ≈\u00a0$1.332,54", ["mezcla"]]]);
  assert.deepEqual(f.p5.ejes.map((e) => e[0]), ["", ""]);
  assert.deepEqual(f.p5.raiz, ["sin-capas"]);
  assert.deepEqual(f["p5 · acierto"].ops.find((o) => o.id === "sube").em, ["✓"]);
  assert.deepEqual(f["p5 · error 1"].ops.find((o) => o.id === "igual").em, ["No es este"]);
  assert.deepEqual(f["p5 · error 2"].ops.find((o) => o.id === "sube").clases, ["pista"]);
  assert.deepEqual(f["p5 · 1 feb (atrás)"].capas.map((c) => c.num), ["5.200 × $1.300"]);
  /* El selector no califica: ningún mensaje. */
  assert.equal(f["p6 · selector UEPS"].msg.texto, "");
  assert.equal(f["p6 · selector promedio"].msg.texto, "");
  assert.equal(f["p6 · error 2"].msg.texto, pantalla("mismo-final").elegir.pista);
  assert.deepEqual(f["p6 · acierto"].msg, { texto: pantalla("mismo-final").elegir.bien, tipo: "bien", role: "status" });
  assert.equal(f["p6 · 20 feb"].msg.texto, "", "A4-N1: en la pantalla 6 queda vacío");
  assert.deepEqual(f["p6 · acierto"].capas.map((c) => c.num), ["1.100 × $1.380"]);
  assert.deepEqual(f.p8.seguir, ["Siguiente pieza", false]);
});

test("★★★ jugada entera con movimiento reducido: la misma v6, sin una sola animación, y la pila en su estado final", async () => {
  const f = await jugar(true);
  for (const [e, x] of Object.entries(f)) {
    sinAnimar(x, e);
    assert.deepEqual(x.capas.filter((c) => c.clases.includes("rebota")).map((c) => c.id), [], `${e}: rebote`);
  }
  /* El acierto del promedio ya es el estado final, sin esperar. */
  assert.deepEqual(f["p5 · acierto"].capas.map((c) => c.num), ["4.700 × ≈\u00a0$1.332,54"]);
  assert.equal(f["p3 · 8 feb (paso)"].msg.texto, "Sigue hasta el 28 de febrero.");
});

test("★★★ A4-N1 frente a la v6 sola: la v6 deja el acierto pegado a otra fecha; la pieza, no", async () => {
  const x = await par();
  try {
    await hastaLaPantalla(x, 2);
    await x.capa("1 feb");
    await x.mover(9);
    assert.equal(x.r6.querySelector(".ea4-msg").textContent, pantalla("peps").tocar.bien);
    assert.equal(x.nuestra().querySelector(".ea4-msg").textContent, "");
    assert.equal(x.nuestra().querySelector(".ea4-ficha").textContent, "28 feb · Vende 2.800");
    x.comparar("28 feb con A4-N1");
  } finally {
    x.fin();
  }
});

test("★★ la mezcla del promedio se cancela si la fecha cambia antes de fundirse", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const x = await par();
  try {
    await hastaLaPantalla(x, 4);
    await x.op("sube");
    await x.mover(4);
    await act(async () => { mock.timers.tick(MEZCLA_MS); });
    sinAnimar(x.comparar("promedio: atrás antes de fundirse"), "atrás antes de fundirse");
  } finally {
    x.fin();
    mock.timers.reset();
  }
});

/* ═══════════ 5 · LA PANTALLA DEL CIERRE, REHECHA POR C1 (Near, con PASA de Mello) ═══════════ */

const EC = pantalla("el-cierre");
const NO_TEXTO = new Set(["id", "tipo", "sobra", "despuesDe"]);
const cadenas = (v, k = null, out = []) => {
  if (k && NO_TEXTO.has(k)) return out;
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => cadenas(x, null, out));
  else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) cadenas(x, kk, out);
  return out;
};

test("★★★ C1 · el cierre es el de la pieza de hoy, en la pantalla 7, y cada texto es, letra por letra, el de Near (PASA de Mello); y al revés, ninguno sobra", () => {
  assert.equal(EC, A.PIEZA_SAN_CALIXTO.pantallas.find((p) => p.id === "el-cierre"));
  assert.equal(P.pantallas.indexOf(EC), 6);
  assert.ok(C1.VEREDICTO_CIERRE);
  assert.equal(EC.tipo, "cierre-que-sobra");
  assert.equal(EC.texto, C1.CIERRE.texto);
  assert.equal(EC.encabezado, C1.CIERRE.encabezado);
  assert.deepEqual(EC.filas.map((f) => f.texto), C1.CIERRE.periodico);
  /* «Para Misa»: la solución, las dos que no sobran con su retro, y la que entra con «nuevo». */
  assert.deepEqual(EC.filas.filter((f) => f.sobra).map((f) => f.id), ["inicial", "final", "compras"]);
  assert.deepEqual(EC.filas.filter((f) => !f.sobra).map((f) => [f.id, f.retro]), [["ventas", C1.CIERRE.retroVentas], ["gastos", C1.CIERRE.retroGastos]]);
  assert.deepEqual(EC.filas.filter((f) => f.sobra).map((f) => f.retro), [undefined, undefined, undefined]);
  assert.deepEqual([EC.entra.id, EC.entra.marca], ["cmv", C1.MARCA_NUEVO]);
  assert.deepEqual(listaDelPermanente(EC).map((f) => f.texto), C1.CIERRE.permanente);
  assert.deepEqual(EC.mensajes, { pista: C1.CIERRE.pista, respuesta: C1.CIERRE.respuesta, acierto: C1.CIERRE.acierto });
  assert.equal(EC.boton, C1.BOTON_COMPROBAR);
  assert.equal(EC.pie, C1.PIE_CIERRE);
  /* Al revés: ningún texto de la pantalla que no esté en el paquete. */
  const esperados = new Set([...Object.values(C1.CIERRE).filter((v) => typeof v === "string" || Array.isArray(v)).flat(), C1.MARCA_NUEVO, C1.BOTON_COMPROBAR, C1.PIE_CIERRE]);
  assert.deepEqual(cadenas(EC).filter((t) => !esperados.has(t)), []);
});

test("★★★ C1 · el cierre: lo que daba la respuesta ya no está; nada antes de tocar dice qué sobra; sin montos (X2)", () => {
  const todo = cadenas(EC).join("\n");
  for (const viejo of [
    "En el permanente, el cierre tiene dos asientos menos. No hay que quitar el inventario inicial ni colocar el final: la cuenta ya está al día.",
    "En su lugar, la cuenta Costo de mercancía vendida se cierra contra Ganancias y pérdidas.",
    "¿Qué asientos del cierre no hacen falta en el permanente?",
    "Los de quitar el inventario inicial y colocar el final.",
    "Ese sí se hace en los dos sistemas.",
  ]) assert.ok(!todo.includes(viejo), viejo);
  assert.equal(EC.parrafos, undefined);
  assert.equal(EC.opciones, undefined);
  /* Pensar, no reconocer: «Compras» (la cuenta) no está en ningún texto de antes de resolver, ni el costo de lo vendido. */
  const antes = [EC.texto, EC.encabezado, EC.mensajes.pista, ...EC.filas.map((f) => f.retro).filter(Boolean)];
  for (const t of antes) {
    assert.doesNotMatch(t, /Compras|Costo de mercancía vendida|inventario inicial|inventario final/, t);
  }
  assert.doesNotMatch(todo.replace(EC.pie, ""), /\d/, "sin cifras (salvo las páginas del pie)");
});

test("★★★ C1 · la línea del resumen: la nueva de Near, que Mello acepta; la vieja ya no está", () => {
  const lista = A.PIEZA_SAN_CALIXTO.pantallas.find((p) => p.id === "resumen").lista;
  assert.equal(lista[2], C1.RESUMEN_NUEVO);
  assert.ok(!lista.includes(C1.RESUMEN_VIEJO));
});

/* Todas las selecciones posibles de las cinco filas. */
const SELECCIONES = Array.from({ length: 31 }, (_, n) => EC.filas.filter((_, i) => n + 1 & (1 << i)).map((f) => f.id));

test("★★★ C1 · «Comprobar» con cada selección posible (31): acierto, retro de la primera que no sobra, pista si solo faltó, respuesta en el 2.º", () => {
  const sobran = ["inicial", "final", "compras"];
  for (const m of SELECCIONES) {
    const r1 = comprobarCierre(EC, m, 0);
    const r2 = comprobarCierre(EC, m, 1);
    if (m.length === 3 && sobran.every((x) => m.includes(x))) {
      assert.deepEqual(r1, { resuelta: true, peldano: "acierto", texto: C1.CIERRE.acierto, malas: [] });
      assert.equal(r2.peldano, "acierto");
      continue;
    }
    const noSobran = m.filter((x) => !sobran.includes(x));
    /* Si marcó las dos, la de la primera en la lista (ventas). */
    const retro = noSobran.includes("ventas") ? C1.CIERRE.retroVentas : noSobran.includes("gastos") ? C1.CIERRE.retroGastos : null;
    if (retro) assert.deepEqual(r1, { resuelta: false, peldano: "retro", texto: retro, malas: ["ventas", "gastos"].filter((x) => noSobran.includes(x)) }, m.join());
    else assert.deepEqual(r1, { resuelta: false, peldano: "pista", texto: C1.CIERRE.pista, malas: [] }, m.join());
    assert.deepEqual(r2, { resuelta: true, peldano: "respuesta", texto: C1.CIERRE.respuesta, malas: [] }, m.join());
  }
});

/* Lo que se ve del cierre. */
function vistaCierre(caja) {
  const r = caja.querySelector("[data-cierre-c1]");
  const msg = r.querySelector(".ea4-msg");
  return {
    estado: r.dataset.estado,
    texto: r.querySelector(".ea4-txt").textContent,
    encabezado: r.querySelector("[data-encabezado]").textContent,
    lista: r.querySelector("[data-lista]").dataset.lista,
    filas: [...r.querySelectorAll("[data-fila]")].map((f) => ({
      id: f.dataset.fila, boton: f.tagName === "BUTTON", pulsada: f.getAttribute("aria-pressed"), mal: f.classList.contains("mal"),
      texto: f.querySelector("span:not([aria-hidden]):not(.ea4-c-nuevo)").textContent, nuevo: f.querySelector("[data-marca-nuevo]")?.textContent ?? null,
    })),
    msg: [msg.textContent, msg.dataset.mensaje ?? null, msg.dataset.peldano ?? null, [...msg.classList].filter((c) => c !== "ea4-msg").join(" ")],
    comprobar: r.querySelector('[data-boton="comprobar"]') ? [r.querySelector('[data-boton="comprobar"]').textContent, r.querySelector('[data-boton="comprobar"]').getAttribute("aria-disabled") === "true"] : null,
    seguir: [r.querySelector('[data-boton="seguir"]').textContent, r.querySelector('[data-boton="seguir"]').disabled],
    pie: r.querySelector("[data-pie]").textContent,
  };
}

test("★★★ C1 · el cierre montado: al llegar, retro, pista, 2.º error con la figura transformada (y se queda), el foco, y luego el resumen", async () => {
  const k = P.pantallas.indexOf(EC);
  const m = await montar(h(LasCapas, { pieza: { ...P, pantallas: P.pantallas.slice(k) }, rotulo: "R" }));
  const v = () => vistaCierre(m.caja);
  const fila = (id) => m.caja.querySelector(`[data-fila="${id}"]`);
  const comprobar = () => clic(m.caja.querySelector('[data-boton="comprobar"]'));
  const activo = () => w.document.activeElement;
  try {
    let x = v();
    assert.deepEqual([x.estado, x.texto, x.encabezado, x.lista], ["colocando", C1.CIERRE.texto, C1.CIERRE.encabezado, "periodico"]);
    assert.deepEqual(x.filas.map((f) => [f.texto, f.boton, f.pulsada, f.mal, f.nuevo]), C1.CIERRE.periodico.map((t) => [t, true, "false", false, null]));
    assert.deepEqual(x.msg, ["", null, null, ""]);
    assert.deepEqual(x.comprobar, [C1.BOTON_COMPROBAR, true], "sin marcar nada, «Comprobar» espera");
    assert.deepEqual(x.seguir, ["Seguir", true]);
    assert.equal(x.pie, C1.PIE_CIERRE);
    /* «Comprobar» sin nada marcado no cuenta como intento. */
    await comprobar();
    assert.equal(v().msg[0], "");
    /* 1.er error: marcó «Cerrar Gastos…» (y una buena): la retro de gastos, coral solo en esa fila; se puede volver a intentar. */
    await clic(fila("inicial"));
    await clic(fila("gastos"));
    assert.deepEqual(v().filas.filter((f) => f.pulsada === "true").map((f) => f.id), ["inicial", "gastos"]);
    await comprobar();
    x = v();
    assert.deepEqual(x.msg, [C1.CIERRE.retroGastos, "error", "retro", "mal"]);
    assert.ok(activo() === m.caja.querySelector(".ea4-msg"), "al responder, el foco va al mensaje");
    assert.deepEqual(x.filas.filter((f) => f.mal).map((f) => f.id), ["gastos"]);
    assert.deepEqual([x.estado, x.lista, x.comprobar[1], x.seguir[1]], ["error", "periodico", false, true]);
    /* Al quitarla, su marca de error se va. */
    await clic(fila("gastos"));
    assert.deepEqual(v().filas.filter((f) => f.mal), []);
    /* 2.º error (solo le faltan): la respuesta; salen las tres que sobran y entra «Cerrar Costo de mercancía vendida», con «nuevo». */
    await comprobar();
    x = v();
    assert.deepEqual(x.msg, [C1.CIERRE.respuesta, "error", "respuesta", "pista"]);
    assert.ok(activo() === m.caja.querySelector(".ea4-msg"));
    assert.deepEqual([x.estado, x.lista, x.comprobar], ["resuelta", "permanente", null]);
    assert.deepEqual(x.filas.map((f) => [f.texto, f.boton, f.nuevo]), [[C1.CIERRE.permanente[0], false, null], [C1.CIERRE.permanente[1], false, C1.MARCA_NUEVO], [C1.CIERRE.permanente[2], false, null]]);
    assert.ok(m.caja.querySelector('[data-fila="cmv"]').closest("li").classList.contains("ea4-c-entra"));
    assert.equal(x.encabezado, C1.CIERRE.encabezado, "la figura se queda, con su encabezado (C8)");
    assert.deepEqual(x.seguir, ["Seguir", false]);
    /* Ya no se toca nada. */
    assert.equal(m.caja.querySelectorAll("[data-cierre-c1] [data-figura] button").length, 0);
    await clic(m.caja.querySelector('[data-boton="seguir"]'));
    assert.equal(m.caja.querySelector("[data-pieza]").dataset.pantalla, "resumen");
    assert.ok(activo() === m.caja.querySelector(".ea4-txt"), "el foco no está donde debe");
  } finally {
    m.desmontar();
  }
});

test("★★★ C1 · el cierre montado: la pista si solo faltó marcar, y el acierto con la figura del permanente", async () => {
  const k = P.pantallas.indexOf(EC);
  const m = await montar(h(LasCapas, { pieza: { ...P, pantallas: P.pantallas.slice(k) }, rotulo: "R" }));
  const fila = (id) => m.caja.querySelector(`[data-fila="${id}"]`);
  const comprobar = () => clic(m.caja.querySelector('[data-boton="comprobar"]'));
  try {
    await clic(fila("final"));
    await comprobar();
    assert.deepEqual(vistaCierre(m.caja).msg, [C1.CIERRE.pista, "error", "pista", "mal"]);
    assert.deepEqual(vistaCierre(m.caja).filas.filter((f) => f.mal), [], "la pista no señala filas");
    /* Completa las tres: el acierto (en el segundo intento; en Aprender no hay puntaje). */
    await clic(fila("inicial"));
    await clic(fila("compras"));
    await comprobar();
    const x = vistaCierre(m.caja);
    assert.deepEqual(x.msg, [`✓ ${C1.CIERRE.acierto}`, "acierto", "acierto", "bien"]);
    assert.deepEqual(x.filas.map((f) => [f.texto, f.nuevo]), C1.CIERRE.permanente.map((t, i) => [t, i === 1 ? C1.MARCA_NUEVO : null]));
    assert.deepEqual([x.estado, x.lista, x.seguir], ["resuelta", "permanente", ["Seguir", false]]);
    /* El ✓ del acierto es forma, no color: el mensaje lleva borde neutro, sin teal ni ámbar. */
    assert.match(CSS_A4, /\.ea4-msg\.bien \{ padding: 8px 12px; border: 2px solid var\(--neutro\);/);
  } finally {
    m.desmontar();
  }
});

test("★★★ C1 · el cierre montado: si marcó las dos que no sobran, la retro de la primera en la lista (ventas), con coral en las dos", async () => {
  const k = P.pantallas.indexOf(EC);
  const m = await montar(h(LasCapas, { pieza: { ...P, pantallas: P.pantallas.slice(k) }, rotulo: "R" }));
  try {
    await clic(m.caja.querySelector('[data-fila="gastos"]'));
    await clic(m.caja.querySelector('[data-fila="ventas"]'));
    await clic(m.caja.querySelector('[data-boton="comprobar"]'));
    const x = vistaCierre(m.caja);
    assert.deepEqual(x.msg, [C1.CIERRE.retroVentas, "error", "retro", "mal"]);
    assert.deepEqual(x.filas.filter((f) => f.mal).map((f) => f.id), ["ventas", "gastos"]);
  } finally {
    m.desmontar();
  }
});

test("★★★ C1 · el cierre: B1 ≤ 40 antes de tocar y B2 ≤ 60 en cada momento, contado como Near (texto, encabezado, filas y mensaje)", () => {
  const n = (t) => contar(Array.isArray(t) ? t.join(" ") : t);
  /* Las palabras de cada campo son las de la tabla de Near. */
  const tabla = C1.CIERRE.palabras;
  assert.equal(n(EC.texto), Number(tabla.Texto));
  assert.equal(n(EC.encabezado), Number(tabla["Encabezado de la figura"]));
  assert.equal(n(EC.filas.map((f) => f.texto)), Number(tabla["Filas que se tocan (periódico)"]));
  assert.equal(n(listaDelPermanente(EC).map((f) => f.texto)), Number(tabla["Figura final (permanente)"]));
  const cab = n(EC.texto) + n(EC.encabezado);
  const llegar = cab + n(EC.filas.map((f) => f.texto));
  const final = cab + n(listaDelPermanente(EC).map((f) => f.texto));
  assert.equal(llegar, 40, "B1: Near cuenta 40");
  const momentos = {
    "primer error": llegar + Math.max(n(EC.mensajes.pista), ...EC.filas.filter((f) => f.retro).map((f) => n(f.retro))),
    "segundo error": final + n(EC.mensajes.respuesta),
    acierto: final + n(EC.mensajes.acierto),
  };
  assert.deepEqual(momentos, { "primer error": 58, "segundo error": 54, acierto: 55 }, "los totales de la tabla «Conteo a la vista» de Near");
});

/* ═══════════ 6 · ACCESIBILIDAD Y LO QUE LA CASA PIDE ═══════════ */

test("★★★ botones reales: capas, selector, opciones y seguir; el selector dice cuál está puesto; deslizador nativo de diez paradas, dentro de la figura", async () => {
  const m = await montar(h(LasCapas, { pieza: { ...P, pantallas: P.pantallas.slice(5) }, rotulo: "R" }));
  try {
    const r = m.caja.querySelector("[data-capas]");
    assert.equal(r.querySelector(".ea4-selector").getAttribute("role"), "group");
    assert.deepEqual([...r.querySelectorAll(".ea4-selector button")].map((b) => b.getAttribute("aria-pressed")), ["true", "false", "false"]);
    const rango = r.querySelector('input[type="range"]');
    assert.deepEqual([rango.min, rango.max, rango.step], ["0", "9", "1"]);
    assert.equal(r.querySelectorAll(".ea4-marcas i").length, 10);
    for (const b of r.querySelectorAll("button")) assert.equal(b.getAttribute("type"), "button");
    assert.equal(r.querySelector(".ea4-msg").getAttribute("role"), "status");
    assert.ok(r.querySelector("[data-figura] .ea4-rango"));
    assert.ok(r.querySelector("[data-figura] .ea4-selector"));
    assert.equal(r.querySelector("[data-figura] .ea4-op"), null, "las opciones calificadas van debajo de la figura (C1)");
  } finally {
    m.desmontar();
  }
});

test("★★ «Siguiente pieza» lleva el foco a la pieza que sigue en la vista", async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h("div", null,
      h("div", null, h(LasCapas, { pieza: { ...P, pantallas: P.pantallas.slice(7) }, rotulo: "R" })),
      h("div", null, h("div", { "data-pieza": "t7-2-a5-fletes", tabIndex: -1 }, "A5"))));
  });
  try {
    await clic(caja.querySelector('[data-boton="siguiente-pieza"]'));
    assert.ok(w.document.activeElement === caja.querySelector('[data-pieza="t7-2-a5-fletes"]'), "el foco no está donde debe");
  } finally {
    act(() => raiz.unmount());
    caja.remove();
  }
});

/* ═══════════ 7 · CATÁLOGO Y VISTA ═══════════ */

test("★★★ fuera del catálogo de FP; en T7-2 después de A3, con el mismo id y el nombre de la v6; la vista la pinta con su componente", () => {
  assert.equal(D.A4_ID, "t7-2-a4-san-calixto");
  assert.equal(P.id, A.A4_ID);
  assert.equal(P.numero, 4);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_2);
  const a = tema.actividades.find((x) => x.id === D.A4_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.filter((x) => x.clasificacion.tipo === APRENDER).map((x) => x.id);
  assert.equal(ids.indexOf(D.A4_ID), ids.indexOf("t7-2-a3-el-kardex") + 1);
  const piezas = PIEZAS_T7_2.map((x) => x.pieza.id);
  assert.equal(piezas.indexOf(D.A4_ID), piezas.indexOf("t7-2-a3-el-kardex") + 1);
  const enVista = PIEZAS_T7_2.find((x) => x.pieza.id === D.A4_ID);
  assert.equal(enVista.pieza, P);
  assert.equal(enVista.Pieza, LasCapas);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.A4_ID)), []);
  for (const f of ["src/data/contabilidadT7_2_a4_capas.js", "src/data/contabilidadT7_2_a4.js", "src/contabilidad/t7_2Capas.js", "src/components/mecanicas/libros/t7/LasCapasQueLaVentaCorta.jsx"]) {
    assert.doesNotMatch(leer(f), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});
