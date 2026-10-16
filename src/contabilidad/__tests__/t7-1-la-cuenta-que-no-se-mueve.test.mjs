import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · PIEZA 1 — «La cuenta que no se mueve», RENOVADA (Patrón de
 * enganche C, v6, de Watari; auditorías de Mello).
 *
 * La fuente es la v6 misma (orquestador/conocimiento/paquetes/
 * patron-enganche-c-v6.html): esta prueba saca de ella el código de
 * referencia de la pieza, lo EJECUTA en el mismo DOM y compara:
 *
 *   · los datos ↔ las constantes del código de referencia, en los dos
 *     sentidos (cifras, cuentas, pantallas, preguntas, retros), y los textos
 *     de pantalla ↔ la tabla «Pantalla por pantalla» de la v6
 *   · la pieza montada ↔ la referencia montada, estado por estado, en un
 *     recorrido entero (adelante, saltos, atrás, cada error y la escalera,
 *     los aciertos, el conteo), con lo que se lee en la figura, el libro, los
 *     mensajes y los botones
 *   · lo que la v6 midió («procedencias»): moverse por el mes y el libro en
 *     cada momento clave
 *   · A1-N2 de Mello: si el deslizador va rápido, no quedan cajas de más. La
 *     misma prueba, corrida contra el código de referencia, da el fallo que
 *     Mello midió (8, 11 y 8 cajas)
 *   · movimiento reducido, foco, CSS (tokens, 44 px, 12 px), catálogo y vista
 *
 * JSDOM no anima: los temporizadores son los falsos de node:test
 * (mock.timers), y se avanzan a mano. Que nada se salga a 320 y 375 px lo
 * mide scripts/t7/medir-t7-1-ap1.mjs en Chromium.
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
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
/* Los relojes falsos, antes de React: lo que la pieza programa con setTimeout se avanza con tick. */
mock.timers.enable({ apis: ["setTimeout"] });

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadT7_1.js");
const A1 = await import("../../components/mecanicas/libros/t7/LaCuentaQueNoSeMueve.jsx");
const LaCuentaQueNoSeMueve = A1.default;
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { default: ContabilidadT7_1View, TEMA_T7_1, PIEZAS_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { AuthContext } = await import("../../auth/AuthProvider.jsx");
const { VISTAS, vistaDeTema } = await import("../../ruta.js");
const { contarPalabras } = await import("../canonEnganche.js");

const RAIZ = new URL("../../../", import.meta.url);
const PAQUETES = new URL("orquestador/conocimiento/paquetes/", RAIZ);
const V6 = readFileSync(new URL("patron-enganche-c-v6.html", PAQUETES), "utf8");
const MELLO_V6 = readFileSync(new URL("auditoria-mello-enganche-v6-y-t7-3-aciertos.md", PAQUETES), "utf8");
const P = D.PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE;

/* ═══════════ 0 · LA REFERENCIA: EL CÓDIGO DE LA v6, EJECUTADO ═══════════ */

/* El código que la v6 publica para Misa («a1.js · la pieza») y su hoja («a1.css»): dos cadenas JSON en el script de la página. */
const literal = (nombre) => {
  const m = V6.match(new RegExp(`\\nconst ${nombre} = (".*?");\\n`, "s"));
  assert.ok(m, `la v6 no trae ${nombre}`);
  return JSON.parse(m[1]);
};
const A1JS = literal("A1JS");
const A1CSS = literal("A1CSS");

/* Se ejecuta tal cual; solo se le pide que deje ver sus constantes internas, al lado de PANTALLAS. */
const EXPONER = "window.EngancheA1.PANTALLAS = PANTALLAS;";
assert.equal(A1JS.split(EXPONER).length, 2, "la v6 cambió: no está la línea que expone PANTALLAS");
new Function(A1JS.replace(EXPONER, `${EXPONER} window.EngancheA1.REF = { PRECIO, INICIO, EVENTOS, CIERRE, FINAL, CUENTAS, TOQUE, VALORES, VALOR, PANTALLAS, cajasEn, fecha, $ };`))();
const REF = w.EngancheA1.REF;

/* ═══════════ AYUDAS: MONTAR, MOVER, TOCAR Y LEER ═══════════ */

const montarReact = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

let nRef = 0;
/* La pieza de la casa (pref «t7a1») o la de referencia (pref «ea1»), con las mismas acciones. */
async function montar(cual, props = {}) {
  if (cual === "ref") {
    const raiz = document.createElement("div");
    raiz.id = `ref${++nRef}`;
    document.body.appendChild(raiz);
    w.EngancheA1(raiz);
    return conAcciones({ caja: raiz, pref: "ea1", desmontar: () => raiz.remove() });
  }
  const m = await montarReact(h(LaCuentaQueNoSeMueve, { rotulo: "R", ...props }));
  return conAcciones({ ...m, pref: "t7a1" });
}

const valorNativo = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
function conAcciones(m) {
  const q = (sel) => m.caja.querySelector(sel.replace(/\$/g, m.pref));
  const clic = async (el) => { assert.ok(el, "no está lo que se iba a tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  return {
    ...m, q,
    /* Arrastrar el día: el valor nativo y el evento «input», como el deslizador. */
    dia: async (d) => { const r = q(".$-rango"); await act(async () => { valorNativo.call(r, String(d)); r.dispatchEvent(new w.Event("input", { bubbles: true })); }); },
    seguir: () => clic(q(".$-seguir")),
    cuenta: (id) => clic(q(`[data-cuenta="${id}"]`)),
    contar: () => clic(q('[data-accion="contar"]')),
    valor: (v) => clic(q(`[data-valor="${v}"]`)),
    leer: () => leer(m.caja, m.pref),
  };
}
/* El foco, comparado como sí o no: un assert.equal entre dos nodos de JSDOM, si falla, se queda armando el diff. */
const enFoco = (el, msg = "el foco") => assert.ok(el && document.activeElement === el, `${msg}: está en ${document.activeElement?.tagName}.${document.activeElement?.className}`);
const tick = async (ms) => { await act(async () => { mock.timers.tick(ms); }); };

const limpio = (t) => (t ?? "").replace(/\s+/g, " ").trim();
const clases = (el, lista) => lista.filter((c) => el.classList.contains(c));

/* Todo lo que se ve de la pieza, leído del DOM; el mismo lector para la referencia y para la de la casa. */
function leer(caja, pref) {
  const q = (sel, en = caja) => en.querySelector(sel.replace(/\$/g, pref));
  const qq = (sel, en = caja) => [...en.querySelectorAll(sel.replace(/\$/g, pref))];
  const est = q(".$-estante");
  const cajas = qq(".$-caja", est);
  const vivas = cajas.filter((c) => !c.classList.contains("sale"));
  const movs = (col) => qq(".$-mov", col).map((p) => `${limpio(p.querySelector("span").textContent)} ${limpio(p.querySelector("b").textContent)}`);
  const libro = {};
  for (const t of qq(pref === "ea1" ? ".ea1-t" : ".t7a1-cuenta")) {
    const svg = q(".$-candado", t);
    libro[t.dataset.cuenta] = {
      debe: movs(q('[data-lado="debe"]', t)),
      haber: movs(q('[data-lado="haber"]', t)),
      saldo: q(".$-saldo", t) ? limpio(q(".$-saldo", t).textContent) : null,
      candado: svg ? (svg.classList.contains("abierto") ? "abierto" : "cerrado") : null,
      late: svg ? svg.classList.contains("late") : null,
      clases: clases(t, ["blanco", "mal", "pista", "elegida", "rebota"]),
      sello: limpio(q(".$-sello", t).textContent),
      tachados: qq(".tachado", t).length,
    };
  }
  const tarjeta = q(".$-tarjeta");
  const acc = q(".$-acc");
  const contar = q('[data-accion="contar"]', acc);
  const msg = q(".$-msg");
  const seguir = q(".$-seguir");
  const rango = q(".$-rango");
  return {
    marca: limpio(q(".$-marca").textContent),
    txt: limpio(q(".$-txt").textContent),
    dormida: q(".$-fig").classList.contains("dormida"),
    dia: { rotulo: limpio(q(".$-dia-rot").textContent), valor: Number(rango.value), inactivo: rango.disabled, valuetext: rango.getAttribute("aria-valuetext"), min: rango.min, max: rango.max },
    bodega: {
      vivas: vivas.length,
      saliendo: cajas.length - vivas.length,
      numeros: vivas.map((c) => c.dataset.n ?? "").filter(Boolean).map(Number),
      contadas: vivas.filter((c) => c.classList.contains("contada")).length,
      cuantas: limpio(q(".$-cuantas").textContent),
    },
    libro,
    tarjeta: tarjeta.hidden ? null : limpio([...tarjeta.children].map((x) => x.textContent).join(" | ")),
    acc: {
      contar: contar ? { texto: limpio(contar.textContent), inactivo: contar.disabled } : null,
      pregunta: q(".$-preg", acc) ? limpio(q(".$-preg", acc).textContent) : null,
      ops: qq("[data-valor]", acc).map((b) => ({ texto: limpio(b.textContent), clases: clases(b, ["mal", "pista"]) })),
      bien: q(".$-bien", acc) ? limpio(q(".$-bien", acc).textContent) : null,
    },
    msg: { texto: limpio(msg.textContent), clases: clases(msg, ["mal", "bien", "pista"]) },
    seguir: { texto: limpio(seguir.textContent), inactivo: seguir.disabled },
  };
}

/* ═══════════ 1 · A1-N2 DE MELLO: EL DESLIZADOR RÁPIDO NO DEJA CAJAS DE MÁS ═══════════ */

/*
 * La prueba que pide Mello (auditoría de la v6, sección 1): mover rápido
 * 8→9→8→9, con menos tiempo entre movimientos que la animación de salida
 * (320 ms; aquí 100, como él), y después ir al 30: el estante y el conteo
 * dan 5. En el camino, sus tres medidas: el 9 tras los movimientos rápidos,
 * la vuelta al 1 con tiempo y otra vez el 9 con tiempo.
 */
async function moverRapidoYContar(m) {
  const medidas = {};
  await m.seguir();                                        // pantalla 2: el día va del 1 al 15
  await m.dia(8);
  await m.dia(9); await tick(100);
  await m.dia(8); await tick(100);
  await m.dia(9); await tick(100);
  medidas.rapido = m.leer().bodega.vivas;                  // en pleno movimiento
  await tick(1000);
  medidas.nueve = m.leer().bodega.vivas;
  await m.dia(1); await tick(1000);
  medidas.uno = m.leer().bodega.vivas;
  await m.dia(9); await tick(1000);
  medidas.nueveOtraVez = m.leer().bodega.vivas;
  await m.seguir();                                        // pantalla 3: la compra
  await m.dia(16); await tick(1000);
  await m.cuenta("compras");
  await m.seguir();                                        // pantalla 4: hasta el 29
  await m.dia(22); await tick(1000);
  await m.dia(28); await tick(1000);
  await m.dia(29);
  await m.seguir();                                        // pantalla 5: el día 30
  await m.contar(); await tick(5000);
  const l = m.leer();
  medidas.treinta = l.bodega.vivas;
  medidas.numeradas = l.bodega.numeros;
  medidas.cuantas = l.bodega.cuantas;
  return medidas;
}

test("★★★ A1-N2 (Mello): mover rápido 8→9→8→9 y llegar al 30 deja 5 cajas en el estante y en el conteo", async () => {
  const m = await montar("casa");
  try {
    const r = await moverRapidoYContar(m);
    assert.equal(r.rapido, 5, "el 9, justo después de los movimientos rápidos");
    assert.equal(r.nueve, 5, "el 9, con tiempo");
    assert.equal(r.uno, 8, "de vuelta al 1");
    assert.equal(r.nueveOtraVez, 5, "otra vez el 9");
    assert.equal(r.treinta, 5, "el estante, el 30");
    assert.deepEqual(r.numeradas, [1, 2, 3, 4, 5], "el conteo numera 5 cajas");
    assert.equal(r.cuantas, "Conteo físico: 5 cajas · $500.000 cada una");
  } finally {
    m.desmontar();
  }
});

test("★★★ A1-N2: la misma prueba contra el código de referencia de la v6 da el fallo que midió Mello (8, 11 y 8; el 30 numera 8)", async () => {
  const m = await montar("ref");
  try {
    const r = await moverRapidoYContar(m);
    /* La tabla de Mello: «Del 8 al 9, al 8 y al 9 otra vez, con 100 ms entre movimientos | 8 | 5», «Vuelta al día 1, con tiempo | 11 | 8», «Día 9, con tiempo | 8 | 5». */
    for (const fila of ["| Del 8 al 9, al 8 y al 9 otra vez, con 100 ms entre movimientos | 8 | 5 |", "| Vuelta al día 1, con tiempo | 11 | 8 |", "| Día 9, con tiempo | 8 | 5 |"]) assert.ok(MELLO_V6.includes(fila), fila);
    assert.deepEqual([r.nueve, r.uno, r.nueveOtraVez], [8, 11, 8]);
    assert.equal(r.treinta, 8);
    assert.deepEqual(r.numeradas, [1, 2, 3, 4, 5, 6, 7, 8], "«Contar la bodega» numera los nodos del estante");
    assert.equal(r.cuantas, "Conteo físico: 5 cajas · $500.000 cada una", "mientras el texto dice 5");
  } finally {
    m.desmontar();
  }
});

/* Y, en general, el estante tiene siempre las cajas vivas del día, vaya como vaya el deslizador. */
test("★★★ A1-N2: con 400 movimientos al azar (rápidos y lentos, adelante y atrás), el estante tiene siempre cajasEn(día) cajas vivas, en su orden", async () => {
  const m = await montar("casa", { pieza: { ...P, pantallas: P.pantallas.slice(3) } });   // pantalla 4: el día va del 1 al 29
  let semilla = 7;
  const azar = () => { semilla = (semilla * 1103515245 + 12345) % 2147483648; return semilla / 2147483648; };
  try {
    for (let k = 0; k < 400; k++) {
      const d = 1 + Math.floor(azar() * 29);
      await m.dia(azar() < 0.5 ? d : Math.max(1, Math.min(29, m.leer().dia.valor + (azar() < 0.5 ? -1 : 1))));
      await tick([0, 50, 100, 200, 319, 321, 600][Math.floor(azar() * 7)]);
      const l = m.leer();
      const ids = [...m.caja.querySelectorAll(".t7a1-caja:not(.sale)")].map((c) => c.dataset.caja);
      assert.deepEqual(ids, D.cajasEn(l.dia.valor), `paso ${k}, día ${l.dia.valor}`);
    }
    await tick(1000);
    assert.equal(m.leer().bodega.saliendo, 0, "al final no queda ninguna caja saliendo");
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 2 · LOS DATOS SON LOS DE LA v6, EN LOS DOS SENTIDOS ═══════════ */

test("★★★ las cifras, las cuentas y las preguntas son las del código de referencia, tal cual", () => {
  for (const k of ["PRECIO", "INICIO", "CIERRE", "FINAL"]) assert.equal(D[k], REF[k], k);
  assert.deepEqual(D.EVENTOS, REF.EVENTOS);
  assert.deepEqual(D.CUENTAS, REF.CUENTAS);
  assert.deepEqual(D.TOQUE, REF.TOQUE);
  assert.deepEqual(D.VALORES, REF.VALORES);
  assert.deepEqual(D.VALOR, REF.VALOR);
  for (let d = 1; d <= 30; d++) {
    assert.deepEqual(D.cajasEn(d), REF.cajasEn(d), `cajasEn(${d})`);
    assert.equal(A1.fecha(d), REF.fecha(d), `fecha(${d})`);
  }
  for (const n of [500000, 2500000, 4000000, 5000000, 9000000]) assert.equal(D.pesos(n), REF.$(n));
  /* Los tiempos: la caja sale en 320 ms, el temblor dura 420 y el conteo va de 140 en 140, como en la v6. */
  assert.ok(A1JS.includes(`setTimeout(() => n.remove(), ${A1.TIEMPOS.sale})`));
  assert.ok(A1JS.includes(`pintarLibro(); }, ${A1.TIEMPOS.rebota})`));
  assert.ok(A1JS.includes(`const paso = reducido() ? 0 : ${A1.TIEMPOS.conteo};`));
  assert.deepEqual(A1.TIEMPOS, { sale: 320, rebota: 420, conteo: 140 });
  /* Un solo costo unitario (Mello, punto 7) y las cuentas que cuadran: 8 − 3 + 10 − 6 − 4 = 5. */
  assert.equal(D.INICIO + D.EVENTOS.reduce((s, e) => s + (e.tipo === "compra" ? e.cajas : -e.cajas), 0), D.FINAL);
  assert.equal(D.cajasEn(30).length, D.FINAL);
});

test("★★★ las seis pantallas son las de la v6: id, texto, presupuesto, tramo del día, botón y cuándo se habilita «Seguir»", () => {
  assert.equal(P.pantallas, D.PANTALLAS);
  assert.deepEqual(P.pantallas.map(({ listo, ...r }) => r), REF.PANTALLAS.map(({ listo, ...r }) => r));
  /* La v6 dice cuándo está lista cada pantalla con una función; aquí es un dato. Dan lo mismo en todos los casos. */
  const casos = [];
  for (const visto of [1, 8, 9, 15, 16, 27, 28, 29, 30]) for (const compraAnotada of [false, true]) for (const cierreOk of [false, true]) casos.push({ visto, compraAnotada, cierreOk });
  for (const [k, p] of P.pantallas.entries()) for (const s of casos) assert.equal(A1.estaListo(p, s), REF.PANTALLAS[k].listo(s), `${p.id} ${JSON.stringify(s)}`);
});

/* Los textos de la interfaz y de la figura: cada uno, letra por letra, en el código de la v6 (los que llevan {n}, por trozos). */
const textosDe = (v, out = []) => {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => textosDe(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => textosDe(x, out));
  return out;
};
/* Las cadenas de un código JS: las de comillas y los trozos fijos de las plantillas (con lo que va dentro de ${…}, también). Sin comentarios. */
function cadenasDe(src) {
  const out = [];
  let i = 0;
  const cadena = (q) => { let t = ""; for (i++; src[i] !== q; i++) t += src[i] === "\\" ? src[++i] : src[i]; i++; out.push(t); };
  const plantilla = () => {
    let t = "";
    for (i++; src[i] !== "`"; ) {
      if (src[i] === "\\") { t += src[i + 1]; i += 2; continue; }
      if (src[i] === "$" && src[i + 1] === "{") { out.push(t); t = ""; i += 2; codigo("}"); i++; continue; }
      t += src[i++];
    }
    out.push(t); i++;
  };
  const codigo = (fin) => {
    let llaves = 0;
    while (i < src.length) {
      const c = src[i];
      if (fin && c === fin && llaves === 0) return;
      if (c === "{") llaves++;
      else if (c === "}") llaves--;
      if (c === "/" && src[i + 1] === "/") { while (src[i] !== "\n") i++; continue; }
      if (c === "/" && src[i + 1] === "*") { i = src.indexOf("*/", i) + 2; continue; }
      if (c === "'" || c === '"') { cadena(c); continue; }
      if (c === "`") { plantilla(); continue; }
      i++;
    }
  };
  codigo(null);
  return out;
}
assert.deepEqual(cadenasDe("a('x y'); /* 'no' */ b(`Uno ${f('dos tres')} cuatro`) // 'no'\n"), ["x y", "Uno ", "dos tres", " cuatro"]);

test("★★★ cada texto de la interfaz está, letra por letra, en el código de la v6; y cada texto de la v6 que se ve está en los datos", () => {
  for (const t of textosDe(D.TEXTOS)) {
    for (const trozo of t.split(/\{\w+\}/).filter(Boolean)) assert.ok(A1JS.includes(trozo), `«${trozo}» no está en la v6`);
  }
  /* Al revés: las cadenas de la v6 que son frases (empiezan en mayúscula, ¿ o ✓, llevan un espacio y nada de HTML ni código) están en los datos. */
  const datos = textosDe([D.TEXTOS, D.TOQUE, D.VALOR, D.PANTALLAS, D.CUENTAS]).join("\n");
  const enV6 = cadenasDe(A1JS).filter((t) => /^[A-ZÁÉÍÓÚ¿✓]/.test(t) && /\s/.test(t) && !/[<>=;{}]/.test(t));
  const faltan = enV6.filter((t) => !datos.includes(t));
  assert.deepEqual(faltan, []);
  assert.ok(enV6.length >= 15, `solo ${enV6.length} textos leídos de la v6`);
});

/* La tabla «Pantalla por pantalla» de la v6: el texto de cada pantalla y su cuenta de palabras. */
const SECCION_A1 = V6.slice(V6.indexOf('<section class="sec" id="p1">'), V6.indexOf('<section class="sec" id="p2">'));
test("★★★ la tabla «Pantalla por pantalla» de la v6: los seis textos, letra por letra, y sus palabras dentro de las 40", () => {
  const filas = [...SECCION_A1.matchAll(/<tr><td class='mono'>(\d)<\/td><td>«(.+?)»<br><span class='near'>(\d+) de (\d+) palabras<\/span><\/td>/g)];
  assert.equal(filas.length, 6);
  for (const [, n, texto, palabras, presupuesto] of filas) {
    const p = P.pantallas[Number(n) - 1];
    assert.equal(p.texto, texto, `pantalla ${n}`);
    assert.equal(contarPalabras(p.texto), Number(palabras), `pantalla ${n}: palabras`);
    assert.equal(p.presupuesto, Number(presupuesto));
    assert.ok(Number(palabras) <= p.presupuesto);
  }
});

/* ═══════════ 3 · LA PIEZA, ESTADO POR ESTADO, IGUAL QUE LA REFERENCIA ═══════════ */

/*
 * Un recorrido entero, con todo lo que se puede hacer: adelante un paso,
 * saltos, atrás, pasarse del tramo, cada error de las tres preguntas (y el
 * tercero), la escalera, los aciertos, contar, y el mes otra vez en la
 * pantalla 6. La pieza y la referencia se juegan a la vez; después de cada
 * paso se leen las dos y tienen que decir lo mismo.
 */
const RECORRIDO = [
  ["seguir"],
  ["dia", 20], ["tick", 400], ["dia", 9], ["dia", 5], ["dia", 9], ["tick", 100], ["dia", 8], ["tick", 400], ["dia", 9], ["tick", 400],
  ["seguir"],
  ["dia", 16], ["tick", 400], ["cuenta", "inventario"], ["tick", 200], ["tick", 300], ["cuenta", "inventario"], ["tick", 500], ["cuenta", "gastos"], ["tick", 500],
  ["dia", 15], ["dia", 16], ["tick", 400], ["cuenta", "compras"], ["cuenta", "gastos"], ["dia", 15], ["dia", 16], ["tick", 400],
  ["seguir"],
  ["dia", 3], ["dia", 1], ["dia", 16], ["dia", 22], ["tick", 400], ["dia", 29], ["tick", 400], ["dia", 8], ["dia", 29], ["dia", 30],
  ["seguir"],
  ["cuenta", "inventario"], ["contar"], ["tick", 0], ["tick", 140], ["tick", 140], ["tick", 1000],
  ["cuenta", "compras"], ["tick", 500], ["cuenta", "gastos"], ["tick", 500], ["cuenta", "compras"], ["tick", 500], ["cuenta", "inventario"],
  ["valor", 9000000], ["valor", 4000000], ["valor", 9000000], ["valor", 2500000],
  ["seguir"],
  ["dia", 1], ["dia", 9], ["tick", 400], ["dia", 16], ["dia", 30], ["dia", 29], ["dia", 30],
  ["seguir"],
];

/* El otro primer error de cada pregunta, en un segundo recorrido más corto. */
const RECORRIDO_B = [
  ["seguir"], ["dia", 9], ["seguir"], ["dia", 16], ["cuenta", "gastos"], ["tick", 500], ["cuenta", "compras"], ["seguir"],
  ["dia", 29], ["seguir"], ["contar"], ["tick", 1000], ["cuenta", "gastos"], ["tick", 500], ["cuenta", "inventario"],
  ["valor", 4000000], ["valor", 2500000], ["seguir"], ["dia", 15], ["seguir"],
];

async function jugar(m, [accion, arg]) {
  if (accion === "tick") return tick(arg);
  if (accion === "seguir") return m.seguir();
  return m[accion](arg);
}

async function aLaPar(reducido, recorrido = RECORRIDO) {
  REDUCIDO = reducido;
  const ref = await montar("ref");
  const casa = await montar("casa");
  const vistos = { pantallas: new Set(), mensajes: new Set(), dobles: 0 };
  try {
    const comparar = (paso) => {
      const a = casa.leer();
      const b = ref.leer();
      /*
       * La única diferencia permitida es la corrección A1-N2: si en la
       * referencia una caja que sale tiene una viva con su mismo id (volvió
       * antes de terminar de salir), aquí esa que salía ya no está.
       */
      const vivasRef = new Set([...ref.caja.querySelectorAll(".ea1-caja:not(.sale)")].map((c) => c.dataset.caja));
      const dobles = [...ref.caja.querySelectorAll(".ea1-caja.sale")].filter((c) => vivasRef.has(c.dataset.caja)).length;
      if (dobles) { vistos.dobles += dobles; b.bodega.saliendo -= dobles; }
      assert.deepEqual(a, b, `después de ${paso}`);
      vistos.pantallas.add(a.marca);
      if (a.msg.texto) vistos.mensajes.add(a.msg.texto);
    };
    comparar("montar");
    for (const [k, paso] of recorrido.entries()) {
      await jugar(ref, paso);
      if (paso[0] !== "tick") await jugar(casa, paso);
      comparar(`paso ${k} (${paso.join(" ")})`);
    }
  } finally {
    ref.desmontar(); casa.desmontar(); REDUCIDO = false;
  }
  return vistos;
}

test("★★★ estado por estado, la pieza dice y muestra lo mismo que la referencia de la v6 (dos recorridos, 95 pasos)", async () => {
  const vistos = await aLaPar(false);
  const b = await aLaPar(false, RECORRIDO_B);
  for (const t of b.mensajes) vistos.mensajes.add(t);
  assert.equal(vistos.pantallas.size, 6, [...vistos.pantallas].join(", "));
  assert.equal(vistos.dobles, 3, "el recorrido pasa una vez por el caso de A1-N2 (vuelta al 8 antes de 320 ms)");
  /* El recorrido pasó por todos los mensajes: la venta, la compra, los errores, las pistas y el acierto de la compra. */
  const todos = [D.TEXTOS.venta, "Llegaron 10 cajas.", D.TOQUE.compra.bien, D.TOQUE.compra.pista, ...Object.values(D.TOQUE.compra.mal), D.TOQUE.cierre.pista, ...Object.values(D.TOQUE.cierre.mal), D.VALOR.pista, ...Object.values(D.VALOR.mal)];
  assert.deepEqual(todos.filter((t) => !vistos.mensajes.has(t)), []);
});

test("★★★ con movimiento reducido, también lo mismo que la referencia: sin animación y en el estado final correcto", async () => {
  await aLaPar(true);
  await aLaPar(true, RECORRIDO_B);
});

/* ═══════════ 4 · LO QUE LA v6 MIDIÓ («PROCEDENCIAS») ═══════════ */

/* «Moverse por el mes»: cada movimiento, con su mensaje, sus animaciones y el candado. */
const MOVERSE = (() => {
  const p = SECCION_A1.match(/<p><b>Moverse por el mes<\/b>.*?<\/p>/s)[0];
  return [...p.matchAll(/<b>(Hacia atrás|De un salto|Adelante), del (\d+) al (\d+)<\/b>: (.+?)(?=; <b>|\.<\/p>)/g)].map(([, como, de, a, resto]) => {
    const quieto = resto.match(/^sin mensaje, sin animación, candado quieto \((\d+) cajas\)$/);
    if (quieto) return { como, de: Number(de), a: Number(a), msg: "", salen: 0, llegan: 0, late: false, cajas: Number(quieto[1]) };
    const anima = resto.match(/^«(.+)», (\d+) cajas salen y (\d+) llegan con animación(, el candado late)?$/);
    assert.ok(anima, `no entiendo: ${resto}`);
    return { como, de: Number(de), a: Number(a), msg: anima[1], salen: Number(anima[2]), llegan: Number(anima[3]), late: Boolean(anima[4]), cajas: null };
  });
})();

test("★★★ moverse por el mes (v6, medido): atrás y en saltos, sin mensaje, sin animación y sin latido; un paso adelante, el hecho con su animación", async () => {
  assert.equal(MOVERSE.length, 6);
  for (const cual of ["casa", "ref"]) {
    for (const x of MOVERSE) {
      /* La pantalla donde ese tramo del día se puede mover: la 2 hasta el 15, la 3 el 16, la 4 hasta el 29. */
      const desde = Math.max(x.de, x.a) <= 15 ? 1 : Math.max(x.de, x.a) === 16 ? 2 : 3;
      const m = cual === "casa" ? await montar("casa", { pieza: { ...P, pantallas: P.pantallas.slice(desde) } }) : await montar("ref");
      try {
        if (cual === "ref") for (let k = 0; k < desde; k++) { if (k === 2) { await m.dia(16); await m.cuenta("compras"); } else if (k === 1) await m.dia(9); await m.seguir(); }
        await m.dia(x.de); await tick(1000);
        await m.dia(x.a);
        const l = m.leer();
        const etq = `${cual} · ${x.como}, del ${x.de} al ${x.a}`;
        assert.equal(l.msg.texto, x.msg, etq);
        assert.equal(l.bodega.saliendo, x.salen, `${etq}: salen`);
        assert.equal(m.caja.querySelectorAll(`.${m.pref}-caja.llega`).length >= x.llegan, true, `${etq}: llegan`);
        if (cual === "casa") assert.equal(m.caja.querySelectorAll(".t7a1-caja.llega").length, x.llegan, `${etq}: llegan con animación`);
        assert.equal(l.libro.inventario.late, x.late, `${etq}: el candado`);
        assert.equal(l.bodega.vivas, x.cajas ?? D.cajasEn(x.a).length, `${etq}: cajas`);
      } finally {
        m.desmontar();
      }
    }
  }
});

/* «El libro, leído de la página en cada momento clave». */
const LIBRO_V6 = (() => {
  const p = SECCION_A1.match(/<p>El libro, leído de la página en cada momento clave.*?<\/p>/s)[0];
  return [...p.matchAll(/<b>(Pantalla \d, [^<]+)<\/b>: Compras «(.+?)» · Haber de Inventario «(.+?)» · Debe de Inventario «(.+?)» · bodega «(.+?)» · candado (cerrado|abierto)/g)]
    .map(([, momento, compras, haber, debe, bodega, candado]) => ({ momento, compras, haber, debe, bodega, candado }));
})();
const libroLeido = (l) => ({
  compras: l.libro.compras.debe.join(" + ") || "vacía",
  haber: l.libro.inventario.haber.join(" + ") || "vacío",
  debe: l.libro.inventario.debe.join(" + "),
  bodega: l.bodega.cuantas,
  candado: l.libro.inventario.candado,
});

test("★★★ el libro en cada momento clave (v6, medido): sigue al día del deslizador, el cierre solo el 30 y nada tachado", async () => {
  assert.deepEqual(LIBRO_V6.map((x) => x.momento), ["Pantalla 4, día 3", "Pantalla 4, día 29", "Pantalla 5, tras contar", "Pantalla 5, tras elegir el valor", "Pantalla 6, de vuelta al día 1", "Pantalla 6, día 30"]);
  assert.match(SECCION_A1, /Tachados: 0 en todos\./);
  const m = await montar("casa");
  const leido = {};
  const anotar = (momento) => { const l = m.leer(); leido[momento] = libroLeido(l); for (const c of Object.values(l.libro)) assert.equal(c.tachados, 0); };
  try {
    await m.seguir(); await m.dia(9); await m.seguir();
    await m.dia(16); await m.cuenta("compras"); await m.seguir();
    await m.dia(3); anotar("Pantalla 4, día 3");
    await m.dia(29); anotar("Pantalla 4, día 29");
    await m.seguir(); await m.contar(); await tick(2000); anotar("Pantalla 5, tras contar");
    await m.cuenta("inventario"); await m.valor(2500000); anotar("Pantalla 5, tras elegir el valor");
    await m.seguir(); await m.dia(1); anotar("Pantalla 6, de vuelta al día 1");
    await m.dia(30); anotar("Pantalla 6, día 30");
    for (const { momento, ...esperado } of LIBRO_V6) assert.deepEqual(leido[momento], esperado, momento);
    /* Y el saldo: $4.000.000 todo el mes; $2.500.000 solo con el cierre, el 30 (Mello, punto 1). */
    assert.equal(m.leer().libro.inventario.saldo, "Saldo en el libro: $2.500.000");
    await m.dia(29);
    assert.equal(m.leer().libro.inventario.saldo, "Saldo en el libro: $4.000.000");
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 5 · CADA PANTALLA Y LA ESCALERA, UNA POR UNA ═══════════ */

test("★★★ pantalla 1: la figura espera atenuada, el día no se mueve y «Empezar» lleva el foco al texto de la pantalla 2", async () => {
  const m = await montar("casa");
  try {
    let l = m.leer();
    assert.equal(l.marca, "Pantalla 1 de 6");
    assert.equal(l.txt, D.PANTALLAS[0].texto);
    assert.equal(l.dormida, true);
    assert.equal(l.dia.inactivo, true);
    assert.equal(l.bodega.vivas, 8);
    assert.equal(l.bodega.cuantas, "En la bodega: sin contar");
    assert.deepEqual(l.seguir, { texto: "Empezar", inactivo: false });
    assert.equal(m.q('[data-boton="empezar"]')?.textContent, "Empezar");
    await m.seguir();
    l = m.leer();
    assert.equal(l.marca, "Pantalla 2 de 6");
    assert.equal(l.dormida, false);
    assert.equal(l.dia.inactivo, false);
    enFoco(m.q(".t7a1-txt"));
    assert.deepEqual(l.seguir, { texto: "Seguir", inactivo: true });
  } finally {
    m.desmontar();
  }
});

test("★★★ pantalla 2: el día no pasa del 15; la venta del 9 dice su porqué, saca 3 cajas y el candado late; «Seguir» desde el 9", async () => {
  const m = await montar("casa");
  try {
    await m.seguir();
    await m.dia(8);
    assert.equal(m.leer().seguir.inactivo, true);
    await m.dia(9);
    const l = m.leer();
    assert.equal(l.msg.texto, "Salió mercancía. Se anota lo cobrado, no lo que costó: Inventario de mercancías no cambia.");
    assert.equal(l.bodega.saliendo, 3);
    assert.equal(l.libro.inventario.late, true);
    assert.deepEqual(l.libro.inventario.debe, ["1 abr 4.000.000"]);
    assert.equal(l.libro.inventario.saldo, "Saldo en el libro: $4.000.000");
    assert.equal(l.dia.rotulo, "9 de abril");
    assert.equal(l.dia.valuetext, "9 de abril");
    assert.equal(l.seguir.inactivo, false);
    await tick(TIEMPOS_SALE());
    assert.equal(m.leer().bodega.saliendo, 0, "a los 320 ms ya salieron");
    /* Volver no lo deshace: lo que habilita es haber llegado al 9. */
    await m.dia(2);
    assert.equal(m.leer().seguir.inactivo, false);
    /* Y el día no pasa del 15, el tramo de la pantalla: el deslizador vuelve a su sitio. */
    await m.dia(30);
    assert.equal(m.leer().dia.valor, 15);
    await m.dia(30);
    assert.equal(m.q(".t7a1-rango").value, "15");
  } finally {
    m.desmontar();
  }
});
const TIEMPOS_SALE = () => A1.TIEMPOS.sale;

test("★★★ pantalla 3 (la compra): el 16 llegan 10 cajas y espera la tarjeta; Inventario → «No va aquí» con su porqué; el 2.º error marca Compras en neutro con la respuesta; Compras → ✓", async () => {
  const m = await montar("casa");
  try {
    await m.seguir(); await m.dia(9); await m.seguir();
    let l = m.leer();
    assert.equal(l.txt, D.PANTALLAS[2].texto);
    assert.equal(l.tarjeta, null, "la tarjeta solo el 16");
    assert.ok(Object.values(l.libro).every((c) => !c.clases.includes("blanco")), "y las cuentas no se tocan antes");
    assert.ok([...m.caja.querySelectorAll("[data-cuenta]")].every((b) => b.disabled));
    await m.dia(16);
    l = m.leer();
    assert.equal(l.msg.texto, "Llegaron 10 cajas.");
    assert.equal(m.caja.querySelectorAll(".t7a1-caja.llega").length, 10);
    assert.equal(l.tarjeta, "16 abr · Compra | $5.000.000 | Toca una cuenta");
    assert.ok(Object.values(l.libro).every((c) => c.clases.includes("blanco")));
    /* 1.er error: borde coral, «No va aquí» y el porqué; el foco va al mensaje. */
    await m.cuenta("inventario");
    l = m.leer();
    assert.equal(l.msg.texto, D.TOQUE.compra.mal.inventario);
    assert.deepEqual(l.msg.clases, ["mal"]);
    assert.deepEqual(l.libro.inventario.clases, ["blanco", "mal", "rebota"]);
    assert.equal(l.libro.inventario.sello, "No va aquí");
    enFoco(m.q(".t7a1-msg"));
    await tick(A1.TIEMPOS.rebota);
    assert.deepEqual(m.leer().libro.inventario.clases, ["blanco", "mal"], "el temblor dura 420 ms");
    /* 2.º error: la correcta en borde neutro, el mensaje dice dónde va y por qué, sin ✓. */
    await m.cuenta("gastos");
    l = m.leer();
    assert.equal(l.msg.texto, D.TOQUE.compra.pista);
    assert.deepEqual(l.msg.clases, ["pista"]);
    assert.deepEqual(l.libro.compras.clases, ["blanco", "pista"]);
    assert.deepEqual(l.libro.gastos.clases, ["blanco", "mal", "rebota"]);
    assert.ok(!l.msg.texto.includes("✓"));
    assert.equal(l.seguir.inactivo, true);
    /* El acierto: ✓ y «se aparta de la norma»; la compra entra en Compras y la tarjeta se va. */
    await m.cuenta("compras");
    await tick(A1.TIEMPOS.rebota);
    l = m.leer();
    assert.equal(l.msg.texto, D.TOQUE.compra.bien);
    assert.deepEqual(l.msg.clases, ["bien"]);
    assert.deepEqual(l.libro.compras.debe, ["16 abr 5.000.000"]);
    assert.equal(m.caja.querySelector('[data-cuenta="compras"] .t7a1-mov').classList.contains("nuevo"), true);
    assert.deepEqual(l.libro.inventario.debe, ["1 abr 4.000.000"], "Inventario no se toca");
    assert.equal(l.tarjeta, null);
    assert.ok(Object.values(l.libro).every((c) => c.clases.length === 0));
    assert.equal(l.seguir.inactivo, false);
    /* El libro sigue al día: antes del 16, Compras está vacía. */
    await m.dia(15);
    assert.deepEqual(m.leer().libro.compras.debe, []);
    /* Y una caja cae desde arriba solo en el paso en que llegó: al día siguiente ya no. */
    await m.dia(16); await m.seguir(); await m.dia(17);
    assert.equal(m.caja.querySelectorAll(".t7a1-caja.llega").length, 0);
  } finally {
    m.desmontar();
  }
});

test("★★★ pantalla 5 (el cierre): contar numera las cajas una por una; la cuenta del cierre con su escalera; el valor con la suya; el cierre abre el candado", async () => {
  const m = await montar("casa", { pieza: { ...P, pantallas: P.pantallas.slice(4) } });
  try {
    let l = m.leer();
    assert.equal(l.marca, "Pantalla 5 de 6");
    assert.equal(l.dia.valor, 30);
    assert.equal(l.dia.inactivo, true);
    assert.equal(l.dia.rotulo, "30 de abril · cierre");
    assert.equal(l.bodega.cuantas, "En la bodega: sin contar", "sin contar hasta el conteo");
    assert.deepEqual(l.libro.compras.debe, ["16 abr 5.000.000"]);
    assert.deepEqual(l.acc.contar, { texto: "Contar la bodega", inactivo: false });
    assert.ok(Object.values(l.libro).every((c) => !c.clases.includes("blanco")), "antes de contar no se toca ninguna cuenta");
    await m.contar();
    assert.equal(m.leer().acc.contar.inactivo, true);
    await tick(0);
    assert.deepEqual(m.leer().bodega.numeros, [1]);
    await tick(A1.TIEMPOS.conteo);
    assert.deepEqual(m.leer().bodega.numeros, [1, 2]);
    await tick(A1.TIEMPOS.conteo * 3);
    l = m.leer();
    assert.deepEqual(l.bodega.numeros, [1, 2, 3, 4, 5]);
    assert.equal(l.bodega.contadas, 5);
    /* E8: cajas y costo por caja, nunca el total. */
    assert.equal(l.bodega.cuantas, "Conteo físico: 5 cajas · $500.000 cada una");
    assert.ok(!l.bodega.cuantas.includes("2.500.000"));
    assert.equal(l.acc.contar, null);
    assert.ok(Object.values(l.libro).every((c) => c.clases.includes("blanco")));
    /* La cuenta: 1.er error, 2.º (la pista en Inventario) y el acierto (✓ en el sello, sin mensaje). */
    await m.cuenta("compras");
    assert.equal(m.leer().msg.texto, D.TOQUE.cierre.mal.compras);
    await m.cuenta("gastos");
    l = m.leer();
    assert.equal(l.msg.texto, D.TOQUE.cierre.pista);
    assert.deepEqual(l.libro.inventario.clases, ["blanco", "pista"]);
    await m.cuenta("inventario");
    l = m.leer();
    assert.equal(l.msg.texto, "");
    assert.deepEqual(l.libro.inventario.clases, ["elegida"]);
    assert.equal(l.libro.inventario.sello, "✓");
    assert.equal(l.acc.pregunta, "¿Con qué valor queda Inventario de mercancías?");
    assert.deepEqual(l.acc.ops.map((o) => o.texto), ["$4.000.000", "$2.500.000", "$9.000.000"]);
    enFoco(m.q(".t7a1-preg"), "sin mensaje, el foco va a la pregunta del valor");
    /* El valor: 1.er error con «No es este», 2.º con la pista en $2.500.000. */
    await m.valor(4000000);
    l = m.leer();
    assert.equal(l.msg.texto, D.VALOR.mal[4000000]);
    assert.deepEqual(l.acc.ops[0], { texto: "$4.000.000No es este", clases: ["mal"] });
    await m.valor(9000000);
    l = m.leer();
    assert.equal(l.msg.texto, "Es $2.500.000: el valor de lo que dice el conteo.");
    assert.deepEqual(l.acc.ops.map((o) => o.clases), [[], ["pista"], ["mal"]]);
    assert.equal(l.libro.inventario.candado, "cerrado");
    await m.valor(2500000);
    l = m.leer();
    assert.equal(l.acc.bien, "✓ El conteo puso al día la cuenta: sale el inicial y entra el final.");
    enFoco(m.q(".t7a1-bien"));
    assert.deepEqual(l.libro.inventario.debe, ["1 abr 4.000.000", "30 abr 2.500.000"]);
    assert.deepEqual(l.libro.inventario.haber, ["30 abr 4.000.000"]);
    assert.equal(l.libro.inventario.candado, "abierto");
    assert.equal(l.libro.inventario.saldo, "Saldo en el libro: $2.500.000");
    assert.equal(l.seguir.inactivo, false);
  } finally {
    m.desmontar();
  }
});

test("★★★ pantalla 6: el resumen, el día suelto del 1 al 30 (el libro vuelve con él) y «Siguiente pieza»", async () => {
  const m = await montar("casa", { pieza: { ...P, pantallas: P.pantallas.slice(5) } });
  try {
    let l = m.leer();
    assert.equal(l.marca, "Pantalla 6 de 6");
    assert.equal(l.txt, D.PANTALLAS[5].texto);
    assert.equal(l.dia.valor, 30);
    assert.equal(l.libro.inventario.candado, "abierto");
    assert.equal(l.bodega.cuantas, "Conteo físico: 5 cajas · $500.000 cada una");
    assert.deepEqual(l.seguir, { texto: "Siguiente pieza", inactivo: false });
    assert.ok(m.q('[data-boton="siguiente-pieza"]'));
    await m.dia(1);
    l = m.leer();
    assert.equal(l.libro.inventario.candado, "cerrado");
    assert.equal(l.bodega.cuantas, "En la bodega: sin contar");
    assert.deepEqual(l.bodega.numeros, []);
    assert.equal(l.bodega.vivas, 8);
  } finally {
    m.desmontar();
  }
});

test("★★ cada pantalla se monta sola (como la mide la barra de enganche), en el estado de llegar a ella", async () => {
  const esperado = [
    { dia: 1, compras: [], cuantas: "En la bodega: sin contar", candado: "cerrado" },
    { dia: 1, compras: [], cuantas: "En la bodega: sin contar", candado: "cerrado" },
    { dia: 15, compras: [], cuantas: "En la bodega: sin contar", candado: "cerrado" },
    { dia: 16, compras: ["16 abr 5.000.000"], cuantas: "En la bodega: sin contar", candado: "cerrado" },
    { dia: 30, compras: ["16 abr 5.000.000"], cuantas: "En la bodega: sin contar", candado: "cerrado" },
    { dia: 30, compras: ["16 abr 5.000.000"], cuantas: "Conteo físico: 5 cajas · $500.000 cada una", candado: "abierto" },
  ];
  for (const [k, e] of esperado.entries()) {
    const m = await montar("casa", { pieza: { ...P, pantallas: P.pantallas.slice(k) } });
    try {
      const l = m.leer();
      assert.equal(l.marca, `Pantalla ${k + 1} de 6`);
      assert.deepEqual({ dia: l.dia.valor, compras: l.libro.compras.debe, cuantas: l.bodega.cuantas, candado: l.libro.inventario.candado }, e, P.pantallas[k].id);
      assert.equal(l.bodega.vivas, D.cajasEn(e.dia).length);
    } finally {
      m.desmontar();
    }
  }
});

/* ═══════════ 6 · MOVIMIENTO REDUCIDO ═══════════ */

test("★★★ movimiento reducido: las cajas salen y llegan sin animación, el candado no late y el conteo queda hecho de una vez", async () => {
  REDUCIDO = true;
  const m = await montar("casa");
  try {
    await m.seguir();
    await m.dia(9);
    let l = m.leer();
    assert.equal(l.bodega.saliendo, 0);
    assert.equal(l.bodega.vivas, 5);
    assert.equal(l.libro.inventario.late, false);
    assert.equal(l.msg.texto, D.TEXTOS.venta, "el mensaje sí: es el porqué");
    await m.seguir(); await m.dia(16);
    assert.equal(m.caja.querySelectorAll(".t7a1-caja.llega").length, 0);
    await m.cuenta("compras"); await m.seguir(); await m.dia(29); await m.seguir();
    await m.contar(); await tick(0);
    l = m.leer();
    assert.deepEqual(l.bodega.numeros, [1, 2, 3, 4, 5]);
    assert.equal(l.bodega.cuantas, "Conteo físico: 5 cajas · $500.000 cada una");
  } finally {
    m.desmontar(); REDUCIDO = false;
  }
  /* Y la hoja apaga toda animación y transición. */
  assert.match(A1.CSS_AP1, /@media \(prefers-reduced-motion: reduce\) \{ \.t7a1 \*, \.t7a1 \*::before, \.t7a1 \*::after \{ animation: none !important; transition: none !important; \} \}/);
});

/* ═══════════ 7 · LA HOJA: LA DE LA v6, CON LO QUE PIDE LA CASA ═══════════ */

const reglas = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g)].map((m) => `${m[1].trim()} { ${m[2].replace(/\s+/g, " ").trim()} }`);

test("★★★ la hoja es la de la v6 regla por regla (prefijo t7a1-; la cuenta, t7a1-cuenta), con la letra a 12 px, el fondo del panel y las reglas propias del botón de la cuenta", () => {
  const v6 = reglas(A1CSS.replace(/\.ea1-t(?![\w-])/g, ".t7a1-cuenta").replace(/ea1/g, "t7a1").replace(/10\.5px/g, "12px"));
  const casa = reglas(A1.CSS_AP1);
  assert.deepEqual(v6.filter((r) => !casa.includes(r)), [], "reglas de la v6 que faltan");
  assert.deepEqual(casa.filter((r) => !v6.includes(r)), [
    ".t7a1:focus { outline: none; }",
    ".t7a1 { background: transparent; }",
    ".t7a1-cuenta { display: block; width: 100%; min-height: 44px; margin: 0; background: transparent; color: var(--texto); font: inherit; text-align: left; cursor: default; }",
    ".t7a1-saldo { display: block; }",
  ]);
  /* Lo único que la casa cambia de la v6 en la letra: los dos 10,5 px (la marca de pantalla y DEBE/HABER). */
  assert.equal((A1CSS.match(/10\.5px/g) ?? []).length, 2);
  const tamanos = [...A1.CSS_AP1.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px|\bfont:\s*(?:\d{3}\s+)?(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1] ?? m[2]));
  assert.ok(tamanos.length >= 15);
  assert.deepEqual(tamanos.filter((px) => px < 12), []);
});

test("★★★ colores: teal y ámbar solo en los rótulos DEBE y HABER; coral solo en el error; el acierto, ✓ con borde neutro", () => {
  const css = reglas(A1.CSS_AP1);
  const con = (token) => css.filter((r) => r.split("{")[1].includes(`var(--${token})`)).map((r) => r.split(" {")[0]);
  assert.deepEqual(con("teal"), ['.t7a1-col[data-lado="debe"]::before']);
  assert.deepEqual(con("ambar"), ['.t7a1-col[data-lado="haber"]::before']);
  assert.deepEqual(con("coral"), [".t7a1-cuenta.rebota", ".t7a1-op.mal", ".t7a1-msg.mal", ".t7a1-cuenta.blanco.mal"]);
  assert.ok(css.includes(".t7a1-msg.bien { color: var(--texto); padding: 8px 12px; border: 2px solid var(--neutro); border-radius: 12px; }"));
  const fuente = readFileSync(new URL("src/components/mecanicas/libros/t7/LaCuentaQueNoSeMueve.jsx", RAIZ), "utf8");
  /* Fuera de los tokens no hay teal, ámbar ni coral sueltos. */
  assert.equal((fuente.match(/#2A9D8F|#E9C46A|#E76F51/gi) ?? []).length, 3, "solo en la declaración de los tokens");
});

test("★★★ 44 px: el deslizador, los botones de la pieza y las cuentas (que son botones de verdad)", async () => {
  const css = reglas(A1.CSS_AP1);
  assert.ok(css.some((r) => r.startsWith(".t7a1-rango {") && r.includes("height: 44px")));
  assert.ok(css.some((r) => r.startsWith(".t7a1-op, .t7a1-boton, .t7a1-seguir {") && r.includes("min-height: 44px")));
  assert.ok(css.some((r) => r.startsWith(".t7a1-cuenta {") && r.includes("min-height: 44px")));
  const m = await montar("casa");
  try {
    assert.deepEqual([...m.caja.querySelectorAll("[data-cuenta]")].map((b) => b.tagName), ["BUTTON", "BUTTON", "BUTTON"]);
    const r = m.q(".t7a1-rango");
    assert.equal(r.type, "range");
    assert.equal(m.caja.querySelector(`label[for="${r.id}"]`)?.textContent, "1 de abril");
  } finally {
    m.desmontar();
  }
});

/* ═══════════ 8 · CATÁLOGO, VISTA Y «SIGUIENTE PIEZA» ═══════════ */

test("★★★ la pieza no entra al catálogo de FP: es de Aprender, el id no está en el servidor y no registra nada", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === D.AP1_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.AP1_ID)), []);
  assert.match(readFileSync(new URL("src/components/ContabilidadT7_1View.jsx", RAIZ), "utf8"), /<Pieza pieza=\{pieza\} rotulo=\{rotulo\} \/>/);
  for (const f of ["src/components/mecanicas/libros/t7/LaCuentaQueNoSeMueve.jsx", "src/data/contabilidadT7_1.js"]) {
    const src = readFileSync(new URL(f, RAIZ), "utf8");
    assert.doesNotMatch(src, /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});

test("★★★ mismo id y misma posición: abre el tema en el catálogo y en la vista, con el componente nuevo", () => {
  assert.equal(D.AP1_ID, "t7-1-a1-la-cuenta-que-no-se-mueve");
  assert.equal(P.id, D.AP1_ID);
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  assert.equal(tema.title, "Inventarios I: el sistema periódico");
  assert.equal(tema.actividades[0].id, D.AP1_ID);
  assert.equal(tema.actividades[0].nombre, P.titulo);
  assert.equal(P.titulo, "La cuenta que no se mueve");
  assert.equal(PIEZAS_T7_1[0].pieza, P);
  assert.equal(PIEZAS_T7_1[0].Pieza, LaCuentaQueNoSeMueve);
  assert.ok(VISTAS.has(TEMA_T7_1));
  assert.equal(vistaDeTema(TEMA_T7_1), TEMA_T7_1);
});

test("★★ en la vista del tema: «Pieza 1 de 7», y al final «Siguiente pieza» lleva el foco a la pieza 2", async () => {
  const m = await montarReact(h(AuthContext.Provider, { value: { usuario: null, pedirCuenta: () => {} } }, h(ContabilidadT7_1View, { onBack() {} })));
  try {
    const piezas = [...m.caja.querySelectorAll("[data-pieza]")];
    assert.equal(piezas[0].dataset.pieza, D.AP1_ID);
    const a1 = conAcciones({ caja: piezas[0].closest("section"), pref: "t7a1" });
    await a1.seguir(); await a1.dia(9); await a1.seguir();
    await a1.dia(16); await a1.cuenta("compras"); await a1.seguir();
    await a1.dia(29); await a1.seguir();
    await a1.contar(); await tick(2000);
    await a1.cuenta("inventario"); await a1.valor(2500000); await a1.seguir();
    assert.equal(a1.leer().marca, "Pantalla 6 de 6");
    await a1.seguir();
    enFoco(piezas[1], "el foco va a la pieza 2");
    assert.equal(piezas[1].dataset.pieza, PIEZAS_T7_1[1].pieza.id);
  } finally {
    m.desmontar();
  }
});
