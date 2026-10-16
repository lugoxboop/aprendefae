import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 3 — «La provisión, de un año al siguiente» (Célula B).
 *
 * Vigila lo que se ve:
 *   · todo texto de los datos es literal del paquete guardado
 *     (paquetes/b5-t6-aprender3.md); cada rótulo de la escena y de la T es
 *     fragmento literal; ningún componente escribe texto propio
 *   · la capa 2: el texto, el pie y lo resaltado de los 19 pasos y del cierre
 *     (la tabla de Futaba); tres momentos, y el pasado conserva su asiento
 *     (la pieza vuelve atrás en los pasos 11 y 12); la fecha del paso 14 se
 *     resalta sin moverse; el bloque del estado de situación con el neto; la
 *     anotación de Clientes con «A nombre de Pablo Moncayo» y «$180.000»
 *     (v1b); la reserva de alto; las duraciones
 *   · la capa 3: la T se llena en orden; el saldo en contra bajo DEBE, en
 *     recuadro; el normal bajo HABER, bajo un filete; el final, con los tres
 *   · la capa 4: UnaFrase con una sola correcta y sus devoluciones
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: q.includes("reduce"), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.Element.prototype.scrollIntoView = () => {};
w.scrollBy = () => {};
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

const D = await import("../../data/contabilidadT6Pieza3.js");
const E = await import("../t6Pieza3.js");
const { default: LaProvision } = await import("../../components/mecanicas/libros/tema6/LaProvision.jsx");
const { decidir } = await import("./b5-capa3.mjs");
const { default: CuentaT } = await import("../../components/mecanicas/libros/tema6/CuentaT.jsx");
const { ESCENAS_TEMA6 } = await import("../../components/mecanicas/libros/tema6/escenasTema6.jsx");
const { PIEZAS } = await import("../../components/ContabilidadTema6View.jsx");
const { SUBJECTS, APRENDER, actividadesDeTipo } = await import("../../data/subjects.js");
const { FAE } = await import("../../theme.js");
const { COLOR } = await import("../../data/contabilidadTema3.js");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;

const textosDeDatos = () => {
  const out = [];
  const recoger = (v, k) => {
    if (typeof v === "string") { if (!["id", "lado", "correcta", "resaltados"].includes(k)) out.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => recoger(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk);
  };
  for (const [k, v] of Object.entries(D)) recoger(v, k);
  return out;
};
const FUENTE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-aprender3.md", import.meta.url), "utf8");
const FUTABA = FUENTE.slice(FUENTE.indexOf("## (1) Futaba"), FUENTE.indexOf("## (2) Mai"));
const viva = (caja) => caja.querySelector("[data-escena-viva]");
const de = (caja, id) => viva(caja).querySelector(`[data-elemento="${id}"]`);
/* Lo que todavía no llega se ve en silueta (hoja 5 de Mai): a la vista, atenuado y marcado con --b5-silueta. */
const enSilueta = (n) => n.style.visibility === "visible" && Boolean(n.style.getPropertyValue("--b5-silueta"));
/* Un paso adelante; la parada entre el 9 y el 10 (hoja 7) se cruza eligiendo la correcta: no es un paso. */
const siguiente = async (caja) => {
  await tocar(caja.querySelector("[data-siguiente]"));
  if (caja.querySelector("[data-parada]")) {
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${D.PARADA_T6_A3.correcta}"]`));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
};
/*
 * Los pasos juntados (hoja 7 de Mai): 15 pasos que muestran los estados de los 19 de antes. `viejo(n)` es el paso
 * de antes cuyo estado muestra el paso n; `nuevoDe(p)`, el paso nuevo que contiene el paso p de antes.
 */
const J = E.T6_A3_JUNTO;
const nuevoDe = (p) => (p > 19 ? J.CIERRE : D.FUSION_T6_A3.grupos.findIndex((g) => g.includes(p)) + 1);
/* Hasta el paso nuevo que contiene el paso `p` de antes. */
const irA = async (caja, p) => { for (let n = 1; n < nuevoDe(p); n++) await siguiente(caja); };
const colorVisto = (n) => {
  while (n && (!n.style.color || n.style.color === "inherit")) n = n.parentElement;
  return n?.style.color;
};
const PASOS = 15;
const CIERRE = 16;

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del paquete guardado (paquetes/b5-t6-aprender3.md)", () => {
  const textos = textosDeDatos();
  assert.ok(textos.length > 80, `solo ${textos.length} textos`);
  assert.deepEqual(textos.filter((t) => !FUENTE.includes(t)), []);
});

test("★★★ manda Futaba, y encima B2: los seis términos (nota en el 3, cita solo en el 5) y los 19 pasos y el cierre con su etiqueta", () => {
  const n = D.PIEZA_LA_PROVISION.nombres;
  assert.deepEqual(n.map((x) => x.termino), ["Provisión para deudas incobrables", "Al revés de Clientes", "Valor neto", "El gasto", "Castigar contra la provisión", "Subestimada y sobrestimada"]);
  /* B2 (un término por pantalla, 15-oct), guardada al final del paquete: los nuevos, literales; «el de hoy», como en Futaba. */
  const B2 = FUENTE.slice(FUENTE.indexOf("## B2 ·"));
  for (const k of [0, 1, 4]) assert.ok(B2.includes(`**${n[k].termino}** — ${k === 4 ? "Def.: " : ""}${n[k].definicion}`), `término «${n[k].termino}» como en B2`);
  assert.ok(B2.includes(`· Cita: ${n[4].delLibro}`));
  for (const k of [2, 3, 5]) {
    assert.ok(B2.includes(`**${n[k].termino}** — El de hoy`), `«${n[k].termino}»: B2 dice «el de hoy»`);
    assert.ok(FUTABA.includes(`\t${n[k].termino}\t${n[k].definicion}\t`), `término «${n[k].termino}» como en Futaba`);
  }
  assert.equal(n[2].rotuloDelLibro, "Nota");
  assert.match(n[4].delLibro, /^«.*» \(p\. 202\)$/);
  assert.deepEqual([0, 1, 3, 5].map((k) => n[k].delLibro), [undefined, undefined, undefined, undefined]);
  const filas = new Map();
  for (const l of FUTABA.split("\n")) {
    const c = l.split("\t");
    if (c.length >= 4 && /^(\d+|Cierre)$/.test(c[0]) && /^(Libro|Basado)/.test(c[2])) filas.set(c[0], { texto: c[1], pie: c[2] });
  }
  assert.equal(filas.size, 20, "la guarda: 19 pasos y el cierre");
  [...D.PASOS_T6_A3, D.CIERRE_T6_A3].forEach((p, k) => assert.deepEqual(p, filas.get(k < 19 ? String(k + 1) : "Cierre"), `paso ${k + 1}`));
});

/* Los rótulos que pinta la escena y la T (sin las cápsulas ni las palabras publicadas DEBE / HABER). */
const rotulos = () => {
  const { momentos, debita, acredita, ...resto } = D.ESCENA_T6_A3;
  const t = D.MOMENTOS_T6_A3.flatMap((m) => [m.monto, m.saldo.texto]);
  return [...momentos.flatMap((m) => [m.fecha, m.tipo]), ...Object.values(resto), ...t, D.CUENTA_T_T6_A3.nombre];
};
const esFragmento = (r) => {
  const fuentes = [...D.PASOS_T6_A3, D.CIERRE_T6_A3].map((p) => p.texto)
    .concat(D.MOMENTOS_T6_A3.flatMap((m) => [m.nombre, m.revela])).map((t) => t.toLowerCase());
  return fuentes.some((t) => t.includes(r.toLowerCase()));
};

test("★★★ cada rótulo de la escena y de la T es fragmento literal de un paso, del cierre o de la capa 3 (y uno inventado no lo es)", () => {
  assert.equal(esFragmento("La provisión se agotó"), false, "control: un rótulo inventado no pasa");
  const r = rotulos();
  assert.ok(r.length >= 30, `solo ${r.length} rótulos`);
  assert.deepEqual(r.filter((x) => !esFragmento(x)), []);
});

test("★★★ ningún componente de la pieza escribe texto que lea el estudiante", () => {
  const fuentes = ["LaProvision.jsx", "CuentaT.jsx", "Momentos.jsx", "MaquinaPegada.jsx", "CajasQueRevelan.jsx", "escenasTema6.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/tema6/${f}`, import.meta.url), "utf8"));
  for (const t of textosDeDatos()) {
    if (t.length < 12) continue;
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano: «${t.slice(0, 50)}»`);
  }
});

test("★★ la pieza va tercera en el tema: APRENDER, la vista y sus tres capas", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-por-cobrar");
  const ids = ["b5-t6-a1-lo-que-otros-le-deben", "b5-t6-a2-cuando-un-cliente-no-va-a-pagar", D.PIEZA_LA_PROVISION.id];
  assert.deepEqual(actividadesDeTipo(tema, APRENDER).map((a) => a.id).slice(0, 3), ids);
  assert.deepEqual(PIEZAS.map((p) => p.pieza.id).slice(0, 3), ids);
  assert.deepEqual(Object.keys(ESCENAS_TEMA6).slice(0, 3), ids);
  const { Capa2, Exploracion } = ESCENAS_TEMA6[D.PIEZA_LA_PROVISION.id];
  assert.equal(Capa2, LaProvision);
  assert.equal(Exploracion, CuentaT);
});

/* ═══════════ CAPA 2 ═══════════ */

/* La columna «Resalta» de Futaba. */
const RESALTADOS = {
  1: ["deben"], 2: ["parte"], 3: ["gasto1"], 4: ["provision1"], 5: ["utilidad"], 6: ["filaClientes", "filaProvision"], 7: ["filaNeto"],
  8: ["perdida"], 9: ["provision2"], 10: ["clientes2"], 11: ["gasto1"], 12: ["provision1", "provision2"], 13: ["subestimada"],
  14: ["fecha2"], 15: ["pide"], 16: ["suman"], 17: ["gasto3"], 18: ["provision3"], 19: ["queda"], 20: [],
};

test("★★★ capa 2: el texto, el pie y lo resaltado de los 15 pasos (los 19 de antes, juntados) y del cierre, sin avisos de React", async () => {
  const avisos = [];
  const antes = console.error;
  console.error = (...a) => avisos.push(a.join(" "));
  try {
    const { caja, desmontar } = await montar(h(LaProvision));
    const res = () => [...caja.querySelectorAll('[data-resaltado="si"]')].map((n) => n.dataset.elemento).sort();
    for (let p = 1; p <= CIERRE; p++) {
      /* El texto: los de antes, seguidos y sin cambiar una palabra; el pie, el nuevo; lo resaltado, la unión. */
      const grupo = p <= PASOS ? D.FUSION_T6_A3.grupos[p - 1] : [20];
      const texto = grupo.map((v) => (v <= 19 ? D.PASOS_T6_A3[v - 1] : D.CIERRE_T6_A3).texto).join(" ");
      assert.equal(caja.querySelector("[data-texto-paso]").textContent, texto, `texto, paso ${p}`);
      assert.equal(caja.querySelector("[data-pie]").textContent, p <= PASOS ? D.FUSION_T6_A3.pies[p - 1] : D.CIERRE_T6_A3.pie, `pie, paso ${p}`);
      assert.deepEqual(res(), [...new Set(grupo.flatMap((v) => RESALTADOS[v]))].sort(), `resaltados, paso ${p}`);
      if (p <= PASOS) assert.equal(caja.querySelector("[data-paso-de]").textContent, `Paso ${p} de 15`);
      if (p < CIERRE) await siguiente(caja);
    }
    desmontar();
  } finally {
    console.error = antes;
  }
  assert.deepEqual(avisos, []);
  assert.deepEqual(E.estadoPasoT6A3(12).resaltados, ["provision1", "provision2"], "paso 12: las dos cifras, la de diciembre primero");
});

const ABIERTO = (p) => (p <= 7 ? 0 : p <= 13 ? 1 : p <= 19 ? 2 : null);
/* Lo que conserva un momento pasado: su asiento. */
const ASIENTO = { 0: ["gasto1", "provision1"], 1: ["provision2", "clientes2"], 2: ["gasto3", "provision3"] };
const TODAS = {
  0: ["deben", "parte", "gasto1", "provision1", "utilidad", "bloque"],
  1: ["perdida", "provision2", "clientes2", "subestimada"],
  2: ["analisis", "pide", "suman", "gasto3", "provision3", "queda"],
};

test("★★★ los momentos: uno abierto con todas sus piezas; los pasados, solo con su cabecera y su asiento; en el cierre, los tres pasados", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  const M = D.ESCENA_T6_A3.momentos;
  for (let n = 1; n <= CIERRE; n++) {
    const p = J.viejo(n);
    const ms = [...viva(caja).querySelectorAll("[data-momento]:not([data-futuro])")];
    const abierto = ABIERTO(p);
    assert.equal(ms.length, abierto === null ? 3 : abierto + 1, `paso ${p}: momentos a la vista`);
    ms.forEach((n, i) => {
      const pasado = abierto === null || i < abierto;
      assert.equal(n.dataset.pasado, pasado ? "si" : "no", `paso ${p}, momento ${i + 1}`);
      assert.equal(n.style.padding, pasado ? "8px 10px" : "8px 10px 10px", "pasado, con el relleno de un hecho plegado");
      assert.equal(n.querySelector("[data-cabecera]").textContent, `${M[i].fecha}${M[i].tipo}`);
      const piezas = [...n.children].slice(1).map((x) => x.dataset.elemento);
      assert.deepEqual(piezas, pasado ? ASIENTO[i] : TODAS[i], `paso ${p}, momento ${i + 1}: sus piezas`);
    });
    if (n < CIERRE) await siguiente(caja);
  }
  desmontar();
});

const APARECE = {
  deben: 1, parte: 2, gasto1: 3, provision1: 4, utilidad: 5, bloque: 6, filaClientes: 6, filaProvision: 6, filaNeto: 7,
  perdida: 8, provision2: 9, clientes2: 10, subestimada: 13,
  analisis: 14, pide: 15, suman: 16, gasto3: 17, provision3: 18, queda: 19,
};
const MOMENTO_DE = (id) => ABIERTO(APARECE[id]);

test("★★★ en el momento abierto, cada pieza se ve desde su paso; antes ocupa su sitio invisible", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  for (let n = 1; n <= PASOS; n++) {
    const p = J.viejo(n);
    for (const [id, desde] of Object.entries(APARECE)) {
      if (MOMENTO_DE(id) !== ABIERTO(p)) continue;
      assert.equal(enSilueta(de(caja, id)), p < desde, `paso ${p}: ${id} ${p < desde ? "en silueta" : "a la vista"}`);
    }
    await siguiente(caja);
  }
  desmontar();
});

/* Los asientos: cuenta, (cliente), monto y cápsula. */
const ASIENTOS = {
  gasto1: ["Gasto provisiones – cuentas incobrables", null, "$148.800", "debe"],
  provision1: ["Provisión para deudas incobrables", null, "$148.800", "haber"],
  provision2: ["Provisión para deudas incobrables", null, "$180.000", "debe"],
  clientes2: ["Cuentas por cobrar – clientes", "A nombre de Pablo Moncayo", "$180.000", "haber"],
  gasto3: ["Gasto provisiones – cuentas incobrables", null, "$184.600", "debe"],
  provision3: ["Provisión para deudas incobrables", null, "$184.600", "haber"],
};

test("★★★ los seis lados de los tres asientos: cuenta, cliente (v1b, en su línea), monto y cápsula sin atenuarse", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  for (let p = 1; p < CIERRE; p++) await siguiente(caja);
  for (const [id, [cuenta, linea, monto, lado]] of Object.entries(ASIENTOS)) {
    const n = de(caja, id);
    assert.equal(n.firstElementChild.textContent, cuenta, `${id}: la cuenta`);
    assert.equal(n.querySelector("[data-linea]")?.textContent ?? null, linea, `${id}: el cliente`);
    assert.equal(n.querySelector("[data-movimiento]").firstElementChild.textContent, monto, `${id}: el monto`);
    const c = n.querySelector("[data-lado]");
    assert.deepEqual([c.dataset.lado, c.textContent], [lado, lado === "debe" ? "se debita" : "se acredita"]);
    assert.equal(c.style.background, rgb(lado === "debe" ? FAE.teal : FAE.ambar));
  }
  desmontar();
});

test("★★★ lo que se ve: lo resaltado en claro sobre navy, también en un momento pasado (los pasos 11 y 12 de antes, hoy 10 y 11); lo demás, atenuado; en el cierre, nada", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  for (let n = 1; n <= CIERRE; n++) {
    const p = J.viejo(n);
    for (const id of J.estadoPaso(n).resaltados) {
      assert.equal(de(caja, id).style.background, rgb(FAE.navy), `paso ${p}: ${id} con relleno navy`);
      assert.equal(colorVisto(de(caja, id)), rgb(FAE.text), `paso ${p}: ${id} en claro`);
    }
    if (p === 11) assert.equal(viva(caja).querySelector('[data-momento="0"]').dataset.pasado, "si", "el gasto del paso 11 es el del momento pasado");
    if (p === 8) assert.equal(colorVisto(de(caja, "gasto1")), rgb(COLOR.apagado), "control: lo no resaltado se atenúa");
    if (n === CIERRE) for (const x of viva(caja).querySelectorAll("[data-elemento]")) assert.equal(colorVisto(x), rgb(FAE.text), `cierre: ${x.dataset.elemento}`);
    if (n < CIERRE) await siguiente(caja);
  }
  desmontar();
});

test("★★★ la fecha del paso 14 de antes (hoy en el 10, con el 15) se resalta con borde nodo y relleno navy, sin moverse (el borde de 2 px siempre está)", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  await irA(caja, 14);
  const f = de(caja, "fecha2");
  assert.equal(f.textContent, "31 de diciembre del año siguiente");
  assert.deepEqual([f.style.borderWidth, f.style.borderColor, f.style.background], ["2px", rgb(FAE.node), rgb(FAE.navy)]);
  await siguiente(caja);
  assert.deepEqual([de(caja, "fecha2").style.borderWidth, de(caja, "fecha2").style.borderColor], ["2px", "transparent"]);
  desmontar();
});

test("★★★ el bloque del estado de situación: Clientes y la provisión que se resta, el neto bajo un filete; valores sin partir; filas resaltables sin moverse", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  await irA(caja, 6);
  const b = de(caja, "bloque");
  assert.equal(b.firstElementChild.textContent, "En el estado de situación financiera");
  const filas = ["filaClientes", "filaProvision", "filaNeto"].map((id) => de(caja, id));
  assert.deepEqual(filas.map((f) => [...f.children].map((x) => x.textContent)),
    [["Cuentas por cobrar – clientes", "$2.655.000"], ["Provisión para deudas incobrables", "− $148.800"], ["El valor neto", "$2.506.200"]]);
  for (const f of filas) {
    assert.equal(f.querySelector("[data-valor]").style.whiteSpace, "nowrap");
    assert.equal(f.style.borderWidth, "2px");
  }
  assert.match(filas[2].parentElement.style.borderTop, /^1px solid /, "el neto, bajo un filete");
  assert.deepEqual(filas.map(enSilueta), [false, false, true], "paso 6: el neto aún no llega, en silueta");
  await siguiente(caja);
  assert.equal(enSilueta(filas[2]), false);
  desmontar();
});

test("★★★ hoja 5: los momentos que no llegan se ven en silueta, en orden, con su fecha y sin los ids de las piezas reales; en el cierre no queda ninguno", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  const M = D.ESCENA_T6_A3.momentos;
  const futuros = () => [...viva(caja).querySelectorAll("[data-momento][data-futuro]")];
  const f = futuros();
  assert.deepEqual(f.map((n) => Number(n.dataset.momento)), M.slice(1).map((_, k) => k + 1), "paso 1: los que siguen, en orden");
  for (const n of f) {
    assert.ok(enSilueta(n), "la cabecera, en silueta");
    assert.equal(n.style.opacity, "0.3");
    assert.equal(n.dataset.siluetaFutura, "cabecera");
    assert.ok([...n.querySelectorAll("[data-elemento]")].every((x) => x.dataset.elemento.startsWith("futuro-")), "sin ids de las piezas reales: llegan después con los suyos");
    assert.equal(n.firstElementChild.firstElementChild.textContent, M[Number(n.dataset.momento)].fecha, "con su fecha");
    const cuerpos = [...n.children].slice(1);
    assert.ok(cuerpos.length > 0 && cuerpos.every((c) => c.dataset.siluetaFutura === "cuerpo"), "y sus piezas, cada una en silueta");
  }
  for (let p = 1; p < CIERRE; p++) await siguiente(caja);
  assert.equal(futuros().length, 0, "en el cierre, todo llegó");
  desmontar();
});

test("★★★ la escena reserva el alto: el final de cada momento y el cierre, en la misma celda, invisibles y sin resaltar", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  const capas = [...caja.querySelector("[data-escena]").children];
  assert.equal(capas.length, 5);
  for (const c of capas) assert.equal(c.style.gridArea, "1 / 1");
  const reservas = capas.filter((c) => c.hasAttribute("data-reserva"));
  assert.deepEqual(reservas.map((r) => [...r.querySelectorAll("[data-momento]")].map((n) => n.dataset.pasado).join("")),
    ["no", "sino", "sisino", "sisisi"]);
  for (const r of reservas) {
    assert.equal(r.style.opacity, "0");
    assert.equal(r.querySelectorAll('[data-resaltado="si"]').length, 0);
    assert.ok([...r.querySelectorAll("[style]")].every((n) => n.style.background !== rgb(FAE.navy)), "nada pintado como resaltado");
    assert.ok([...r.querySelectorAll("[style]")].every((n) => n.style.visibility !== "hidden"));
  }
  desmontar();
});

test("★★ «Reproducir»: 3 000 + 450 ms por palabra; la tabla de Mai §4.4 y sus 149,7 s", () => {
  const ms = Array.from({ length: 19 }, (_, k) => E.duracionPasoT6A3(k + 1));
  assert.deepEqual(ms, [10650, 7500, 7050, 7950, 6150, 10200, 7050, 9750, 6600, 8850, 7950, 7500, 5700, 9300, 6150, 7500, 7050, 7950, 8850]);
  assert.equal(ms.reduce((a, b) => a + b, 0), 149700);
  /* Hoja 7: con los pasos juntados, la fórmula no cambia; cada fusión ahorra los 3 000 ms de un paso (Mai, con sus seis fusiones: de 159,9 s a 141,9 s con el cierre; quedan cuatro: 147,9 s). */
  const juntos = Array.from({ length: PASOS }, (_, k) => J.duracion(k + 1));
  assert.deepEqual(juntos, D.FUSION_T6_A3.grupos.map((g) => g.reduce((t, v) => t + ms[v - 1], 0) - 3000 * (g.length - 1)));
  assert.equal(juntos.reduce((a, b) => a + b, 0) + J.duracion(CIERRE), 147900);
});

/* ═══════════ CAPA 3 ═══════════ */

test("★★★ capa 3: la T se llena en orden al cerrarse cada pregunta (escalera de ayuda: tras la pista, al segundo error), con el valor correcto aunque se falle; el saldo en contra bajo DEBE en recuadro, el normal bajo HABER bajo un filete; el final, con los tres", async () => {
  const { caja, desmontar } = await montar(h(CuentaT));
  const t = caja.querySelector("[data-cuenta-t]");
  assert.equal(caja.querySelector("p").textContent, D.CONSIGNA_CAPA_3_T6_A3);
  assert.equal(t.firstElementChild.textContent, "Provisión para deudas incobrables");
  const columna = (lado) => [...t.querySelectorAll(`[data-columna="${lado}"] [data-movimiento]`)].map((n) => n.textContent);
  const cajas = () => [...caja.querySelectorAll("[data-hecho]")].map((n) => n.dataset.hecho);
  assert.deepEqual(cajas(), ["diciembre-2007"], "al principio, solo la caja de 2007");
  assert.equal(t.querySelector("[data-saldo]"), null);
  assert.deepEqual([...t.querySelectorAll("[data-columna] > p")].map((p) => [p.textContent, p.style.fontSize, p.style.color]),
    [["DEBE", "12px", rgb("#52C4B0")], ["HABER", "12px", rgb("#E9C46A")]], "DEBE y HABER con el estilo de los colectores, a 12 px (letra mínima)");
  const lectura = (n) => [...n.querySelectorAll("p:not([data-pie])")].map((p) => p.textContent).join("");
  const esperado = [
    { debe: [], haber: ["$148.80031 de diciembre de 2007"], saldo: ["normal", "El saldo queda en $148.800"] },
    { debe: ["$180.000Marzo del año siguiente"], haber: ["$148.80031 de diciembre de 2007"], saldo: ["en-contra", "Le faltan $31.200"] },
    { debe: ["$180.000Marzo del año siguiente"], haber: ["$148.80031 de diciembre de 2007", "$184.60031 de diciembre del año siguiente"], saldo: ["normal", "El saldo queda en $153.400"] },
  ];
  for (const [k, m] of D.MOMENTOS_T6_A3.entries()) {
    /* Con dos errores a propósito: la T se llena igual, con el valor correcto (hoja 6, indispensable 5). */
    const [mala1, mala] = m.opciones.filter((o) => o.id !== m.correcta).map((o) => o.id);
    const antes = [columna("debe"), columna("haber")];
    await decidir(tocar, caja.querySelector(`[data-hecho="${m.id}"]`), mala1);
    assert.equal(lectura(caja.querySelector(`[data-revela="${m.id}"]`)), m.pista, "al primer error, solo la pista");
    assert.deepEqual([columna("debe"), columna("haber")], antes, "al primer error, la T no se mueve");
    await decidir(tocar, caja.querySelector(`[data-hecho="${m.id}"]`), mala);
    /* B5 de Futaba: tras dos errores, la devolución de la opción, sin el texto que se revela. */
    assert.equal(lectura(caja.querySelector(`[data-revela="${m.id}"]`)), typeof m.falla === "string" ? m.falla : m.falla[mala]);
    assert.equal(caja.querySelector(`[data-revela="${m.id}"] [data-pie]`).textContent, m.pie);
    assert.deepEqual(columna("debe"), esperado[k].debe, `momento ${k + 1}: DEBE`);
    assert.deepEqual(columna("haber"), esperado[k].haber, `momento ${k + 1}: HABER`);
    const s = t.querySelector("[data-saldo]");
    assert.deepEqual([s.dataset.saldo, s.textContent], esperado[k].saldo);
    if (s.dataset.saldo === "en-contra") {
      assert.deepEqual([s.style.border, s.style.justifySelf], [`2px solid ${rgb(FAE.node)}`, "start"], "recuadro nodo, a la izquierda (bajo DEBE)");
    } else {
      assert.deepEqual([s.style.gridColumn, s.style.borderTop], ["2", `1px solid ${rgb(COLOR.neutro)}`], "bajo HABER, bajo un filete");
    }
    assert.ok(![s.style.color, s.style.border, s.style.background].some((x) => x.includes(rgb(FAE.coral ?? "#E76F51"))), "sin coral");
    assert.deepEqual(cajas(), D.MOMENTOS_T6_A3.slice(0, Math.min(k + 2, 3)).map((x) => x.id), "aparece la caja siguiente");
    assert.equal(lectura(caja.querySelector("[data-final]")), k < 2 ? "" : D.FINAL_CAPA_3_T6_A3.texto);
  }
  assert.equal(caja.querySelector("[data-final] [data-pie]").textContent, D.FINAL_CAPA_3_T6_A3.pie);
  desmontar();
});

/* ═══════════ CAPA 4 ═══════════ */

test("★★★ capa 4: UnaFrase con la pregunta, cuatro opciones, una sola correcta y la devolución de cada una (C1-9 del lote C2 · C1 · C7); su pie debajo", async () => {
  assert.deepEqual(D.OPCIONES_FINAL_T6_A3.filter((o) => o.correcta).map((o) => o.texto), ["Lo que sobró se resta de lo que pide el análisis."]);
  const { Capa4 } = ESCENAS_TEMA6[D.PIEZA_LA_PROVISION.id];
  const { caja, desmontar } = await montar(h(Capa4));
  assert.ok(caja.textContent.startsWith(D.PREGUNTA_FINAL_T6_A3));
  assert.equal([...caja.querySelectorAll("[data-pie]")].at(-1).textContent, "Basado en el libro, p. 203");
  for (const o of D.OPCIONES_FINAL_T6_A3) {
    assert.equal(caja.querySelector(`[data-opcion="${o.id}"]`).textContent, o.texto);
    await tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
    assert.equal(caja.querySelector("[data-devolucion]").textContent, o.feedback);
    assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, o.correcta ? "correcta" : "incorrecta");
    await tocar(caja.querySelector("[data-otra-vez]"));
  }
  desmontar();
});

test("★★ identificadores nuevos con b5-", () => {
  assert.match(D.PIEZA_LA_PROVISION.id, /^b5-t6-a3-/);
  for (const o of D.OPCIONES_FINAL_T6_A3) assert.match(o.id, /^b5-t6-a3-/);
});

/* D12 (Sakuta, #222): lo que está en silueta no lo lee el lector ni se enfoca; lo que llega, ya no lleva esa marca. */
const MUDOS = '[style*="--b5-silueta"], [data-futuro], [data-silueta-futura]';
const callado = (n) => n.closest('[aria-hidden="true"]') !== null;
const marcaPropia = (n) => n.getAttribute("aria-hidden") === "true" && n.hasAttribute("inert");
test("★★★ D12: en el paso 1 ninguna silueta es legible ni enfocable; en el paso 2, lo que llegó pierde la marca", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  const siluetas = [...caja.querySelectorAll(MUDOS)];
  assert.ok(siluetas.length > 0, "hay siluetas en el paso 1");
  for (const n of siluetas) {
    assert.ok(callado(n), "aria-hidden en ella o en un ancestro");
    assert.ok(marcaPropia(n), "y su propia marca: aria-hidden e inert, aunque la escena cambie");
  }
  const vivas = () => [...viva(caja).querySelectorAll("[data-elemento]")];
  const antes = new Set(vivas().filter((n) => enSilueta(n)));
  await siguiente(caja);
  const llegaron = vivas().filter((n) => antes.has(n) && !enSilueta(n));
  assert.ok(llegaron.length > 0, "algo llegó en el paso 2");
  for (const n of llegaron) {
    assert.equal(n.hasAttribute("inert"), false, `${n.dataset.elemento}: sin inert`);
    assert.equal(n.getAttribute("aria-hidden"), null, `${n.dataset.elemento}: sin su aria-hidden`);
    assert.equal(n.closest("[data-b5-mudo]"), null, `${n.dataset.elemento}: ni un ancestro en silueta`);
  }
  for (const n of caja.querySelectorAll(MUDOS)) assert.ok(marcaPropia(n), "lo que sigue en silueta, callado");
  desmontar();
});
