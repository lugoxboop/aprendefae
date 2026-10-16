import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 4 — «Cuando el cliente castigado sí paga» (Célula B).
 *
 * Vigila lo que se ve:
 *   · todo texto de los datos es literal del paquete guardado
 *     (paquetes/b5-t6-aprender4.md); cada rótulo de la escena y del tablero
 *     es fragmento literal; ningún componente escribe texto propio
 *   · la capa 2: el texto, el pie y lo resaltado de los 9 pasos y del cierre
 *     (paso 9 corregido: las dos líneas de Clientes que se compensan); el
 *     castigo se conserva mientras la deuda se revive (el mismo asiento al
 *     revés); las dos etiquetas de grupo, sin resaltar ni atenuar; ninguna
 *     cuenta de ingreso; la reserva de alto; las duraciones
 *   · la capa 3: el tablero (una tabla) se llena por caso, en cualquier
 *     orden; la cifra revivida destacada; el final, con los tres
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

const D = await import("../../data/contabilidadT6Pieza4.js");
const E = await import("../t6Pieza4.js");
const { default: SiPaga } = await import("../../components/mecanicas/libros/tema6/SiPaga.jsx");
const { decidir } = await import("./b5-capa3.mjs");
const { default: TresCasos } = await import("../../components/mecanicas/libros/tema6/TresCasos.jsx");
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
const FUENTE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-aprender4.md", import.meta.url), "utf8");
const FUTABA = FUENTE.slice(FUENTE.indexOf("## (1) Futaba"), FUENTE.indexOf("## (2) Futaba"));
const viva = (caja) => caja.querySelector("[data-escena-viva]");
const de = (caja, id) => viva(caja).querySelector(`[data-elemento="${id}"]`);
/* Lo que todavía no llega se ve en silueta (hoja 5 de Mai): a la vista, atenuado y marcado con --b5-silueta. */
const enSilueta = (n) => n.style.visibility === "visible" && Boolean(n.style.getPropertyValue("--b5-silueta"));
/* Un paso adelante; la parada entre el 4 y el 5 (hoja 7) se cruza eligiendo la correcta: no es un paso. */
const siguiente = async (caja) => {
  await tocar(caja.querySelector("[data-siguiente]"));
  if (caja.querySelector("[data-parada]")) {
    await tocar(caja.querySelector(`[data-parada] [data-opcion="${D.PARADA_T6_A4.correcta}"]`));
    await tocar(caja.querySelector("[data-siguiente]"));
  }
};
const colorVisto = (n) => {
  while (n && (!n.style.color || n.style.color === "inherit")) n = n.parentElement;
  return n?.style.color;
};
const PASOS = 9;
const CIERRE = 10;

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del paquete guardado (paquetes/b5-t6-aprender4.md)", () => {
  const textos = textosDeDatos();
  assert.ok(textos.length > 50, `solo ${textos.length} textos`);
  assert.deepEqual(textos.filter((t) => !FUENTE.includes(t)), []);
});

test("★★★ manda Futaba: los cinco términos (nota en el 2, cita con página en el 5), sin marcas de auditoría, y los 9 pasos y el cierre con su etiqueta", () => {
  const n = D.PIEZA_SI_PAGA.nombres;
  assert.deepEqual(n.map((x) => x.termino), ["Cuenta recuperada", "Revivir la deuda", "Después, el pago", "Abono", "Cuánto se revive"]);
  for (const x of n) assert.ok(FUTABA.includes(`\t${x.termino}\t${x.definicion}\t`), `término «${x.termino}» como en Futaba`);
  assert.equal(n[1].rotuloDelLibro, "Nota");
  assert.match(n[4].delLibro, /^«….*» \(p\. 203\)$/);
  assert.deepEqual([0, 2, 3].map((k) => n[k].delLibro), [undefined, undefined, undefined]);
  assert.ok(!JSON.stringify(D).includes("CONSTRUCCIÓN"), "las marcas de auditoría no se pintan");
  const filas = new Map();
  for (const l of FUTABA.split("\n")) {
    const c = l.split("\t");
    if (c.length >= 4 && /^\d+$/.test(c[0]) && /^(Libro|Basado)/.test(c[2])) filas.set(c[0], { texto: c[1], pie: c[2] });
  }
  assert.equal(filas.size, 9, "la guarda: los 9 pasos");
  D.PASOS_T6_A4.forEach((p, k) => assert.deepEqual(p, filas.get(String(k + 1)), `paso ${k + 1}`));
  assert.ok(FUTABA.includes(`Cierre: «${D.CIERRE_T6_A4.texto}» · ${D.CIERRE_T6_A4.pie} ·`), "el cierre y su etiqueta");
});

const rotulos = () => {
  const { momentos, debita, acredita, ...resto } = D.ESCENA_T6_A4;
  return [...momentos.map((m) => m.fecha), ...Object.values(resto), D.TABLERO_T6_A4.revive, D.TABLERO_T6_A4.entran,
    ...D.CASOS_T6_A4.flatMap((c) => [c.letra, c.revive, c.entran])];
};
/* El caso a ya no tiene caja (lote C1-11): sin nombre ni texto que revelar. */
const esFragmento = (r) => {
  const fuentes = [...D.PASOS_T6_A4, D.CIERRE_T6_A4].map((p) => p.texto)
    .concat(D.CASOS_T6_A4.flatMap((c) => [c.nombre, c.revela]).filter(Boolean)).map((t) => t.toLowerCase());
  return fuentes.some((t) => t.includes(r.toLowerCase()));
};

test("★★★ cada rótulo de la escena y del tablero es fragmento literal de un paso o de la capa 3 (y uno inventado no lo es)", () => {
  assert.equal(esFragmento("Ingresos por ventas"), false, "control: un rótulo inventado no pasa (y no hay ingreso)");
  const r = rotulos();
  assert.ok(r.length >= 20, `solo ${r.length} rótulos`);
  assert.deepEqual(r.filter((x) => !esFragmento(x)), []);
  /* El rótulo de la fila del caso a no sale de un paso: es literal del lote C1-11. */
  assert.equal(D.TABLERO_T6_A4.ejemplo, "Ejemplo");
  assert.ok(FUENTE.includes("- Caso a: su fila del tablero ya viene llena, con el rótulo «Ejemplo». Ya no se pregunta."));
});

test("★★★ ningún componente de la pieza escribe texto que lea el estudiante", () => {
  const fuentes = ["SiPaga.jsx", "TresCasos.jsx", "Momentos.jsx", "MaquinaPegada.jsx", "CajasQueRevelan.jsx", "escenasTema6.jsx"]
    .map((f) => readFileSync(new URL(`../../components/mecanicas/libros/tema6/${f}`, import.meta.url), "utf8"));
  for (const t of textosDeDatos()) {
    if (t.length < 12) continue;
    for (const f of fuentes) assert.ok(!f.includes(t), `texto escrito a mano: «${t.slice(0, 50)}»`);
  }
});

test("★★ la pieza va cuarta en el tema: APRENDER, la vista y sus tres capas", () => {
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-por-cobrar");
  const ids = ["b5-t6-a1-lo-que-otros-le-deben", "b5-t6-a2-cuando-un-cliente-no-va-a-pagar", "b5-t6-a3-la-provision-de-un-ano-al-siguiente", D.PIEZA_SI_PAGA.id];
  /* Cuarta: después de ella viene la pieza 5 (T6 · A5). */
  assert.deepEqual(actividadesDeTipo(tema, APRENDER).map((a) => a.id).slice(0, 4), ids);
  assert.deepEqual(PIEZAS.map((p) => p.pieza.id).slice(0, 4), ids);
  assert.deepEqual(Object.keys(ESCENAS_TEMA6).slice(0, 4), ids);
  const { Capa2, Exploracion } = ESCENAS_TEMA6[D.PIEZA_SI_PAGA.id];
  assert.equal(Capa2, SiPaga);
  assert.equal(Exploracion, TresCasos);
});

/* ═══════════ CAPA 2 ═══════════ */

const RESALTADOS = {
  1: ["castiga"], 2: ["provision1"], 3: ["clientes1"], 4: ["vuelve"], 5: ["clientes2"], 6: ["provision2"], 7: ["caja"], 8: ["clientes3"],
  9: ["clientes2", "clientes3"], 10: [],
};

test("★★★ capa 2: el texto, el pie y lo resaltado de los 9 pasos y del cierre (paso 9: las dos líneas de Clientes), sin avisos de React", async () => {
  const avisos = [];
  const antes = console.error;
  console.error = (...a) => avisos.push(a.join(" "));
  try {
    const { caja, desmontar } = await montar(h(SiPaga));
    const res = () => [...caja.querySelectorAll('[data-resaltado="si"]')].map((n) => n.dataset.elemento).sort();
    for (let p = 1; p <= CIERRE; p++) {
      const esperado = p <= PASOS ? D.PASOS_T6_A4[p - 1] : D.CIERRE_T6_A4;
      assert.equal(caja.querySelector("[data-texto-paso]").textContent, esperado.texto, `texto, paso ${p}`);
      assert.equal(caja.querySelector("[data-pie]").textContent, esperado.pie, `pie, paso ${p}`);
      assert.deepEqual(res(), [...RESALTADOS[p]].sort(), `resaltados, paso ${p}`);
      if (p <= PASOS) assert.equal(caja.querySelector("[data-paso-de]").textContent, `Paso ${p} de 9`);
      if (p < CIERRE) await siguiente(caja);
    }
    desmontar();
  } finally {
    console.error = antes;
  }
  assert.deepEqual(avisos, []);
  assert.deepEqual(E.estadoPasoT6A4(9).resaltados, ["clientes2", "clientes3"], "paso 9: la del paso 5 primero");
});

const ABIERTO = (p) => (p <= 3 ? 0 : p <= 9 ? 1 : null);
const ASIENTO = { 0: ["provision1", "clientes1"], 1: ["primero", "clientes2", "provision2", "despues", "caja", "clientes3"] };
const TODAS = { 0: ["castiga", "provision1", "clientes1"], 1: ["vuelve", "primero", "clientes2", "provision2", "despues", "caja", "clientes3"] };

test("★★★ los momentos: la cabecera solo con la fecha; el castigo se conserva mientras la deuda vuelve; en el cierre, los asientos y las dos etiquetas", async () => {
  const { caja, desmontar } = await montar(h(SiPaga));
  const M = D.ESCENA_T6_A4.momentos;
  for (let p = 1; p <= CIERRE; p++) {
    const ms = [...viva(caja).querySelectorAll("[data-momento]:not([data-futuro])")];
    const abierto = ABIERTO(p);
    assert.equal(ms.length, abierto === null ? 2 : abierto + 1, `paso ${p}`);
    ms.forEach((n, i) => {
      const pasado = abierto === null || i < abierto;
      assert.equal(n.dataset.pasado, pasado ? "si" : "no");
      assert.equal(n.querySelector("[data-cabecera]").textContent, M[i].fecha);
      assert.deepEqual([...n.children].slice(1).map((x) => x.dataset.elemento), pasado ? ASIENTO[i] : TODAS[i], `paso ${p}, momento ${i + 1}`);
    });
    if (p < CIERRE) await siguiente(caja);
  }
  desmontar();
});

const APARECE = { castiga: 1, provision1: 2, clientes1: 3, vuelve: 4, primero: 5, clientes2: 5, provision2: 6, despues: 7, caja: 7, clientes3: 8 };

test("★★★ en el momento abierto, cada pieza se ve desde su paso; antes ocupa su sitio invisible", async () => {
  const { caja, desmontar } = await montar(h(SiPaga));
  for (let p = 1; p <= PASOS; p++) {
    for (const [id, desde] of Object.entries(APARECE)) {
      if (ABIERTO(desde) !== ABIERTO(p)) continue;
      assert.equal(enSilueta(de(caja, id)), p < desde, `paso ${p}: ${id} ${p < desde ? "en silueta" : "a la vista"}`);
    }
    await siguiente(caja);
  }
  desmontar();
});

const ASIENTOS = {
  provision1: ["Provisión para deudas incobrables", null, "$180.000", "debe"],
  clientes1: ["Cuentas por cobrar – clientes", "A nombre de Pablo Moncayo", "$180.000", "haber"],
  clientes2: ["Cuentas por cobrar – clientes", null, "$180.000", "debe"],
  provision2: ["Provisión para deudas incobrables", null, "$180.000", "haber"],
  caja: ["Caja", null, "$180.000", "debe"],
  clientes3: ["Cuentas por cobrar – clientes", null, "$180.000", "haber"],
};

test("★★★ revivir es el castigo al revés: la Provisión pasa de [se debita] a [se acredita] y Clientes, al contrario; sin ninguna cuenta de ingreso", async () => {
  const { caja, desmontar } = await montar(h(SiPaga));
  for (let p = 1; p < 6; p++) await siguiente(caja);
  for (const [id, [cuenta, linea, monto, lado]] of Object.entries(ASIENTOS)) {
    if (["caja", "clientes3"].includes(id)) continue;
    const n = de(caja, id);
    assert.equal(n.style.visibility, "visible", `paso 6: ${id} a la vista`);
  }
  for (let p = 6; p < CIERRE; p++) {
    assert.ok(!/ingreso/i.test(viva(caja).textContent), `paso ${p}: la escena no dibuja ningún ingreso`);
    await siguiente(caja);
  }
  for (const [id, [cuenta, linea, monto, lado]] of Object.entries(ASIENTOS)) {
    const n = de(caja, id);
    assert.equal(n.firstElementChild.textContent, cuenta, `${id}: la cuenta`);
    assert.equal(n.querySelector("[data-linea]")?.textContent ?? null, linea, `${id}: el cliente`);
    assert.equal(n.querySelector("[data-movimiento]").firstElementChild.textContent, monto);
    const c = n.querySelector("[data-lado]");
    assert.deepEqual([c.dataset.lado, c.textContent], [lado, lado === "debe" ? "se debita" : "se acredita"], id);
    assert.equal(c.style.background, rgb(lado === "debe" ? FAE.teal : FAE.ambar));
  }
  assert.ok(!/ingreso/i.test(viva(caja).textContent), "la escena no dibuja ningún ingreso");
  desmontar();
});

test("★★★ lo que se ve: lo resaltado en claro sobre navy; en el paso 9, las dos líneas de Clientes; las etiquetas nunca se resaltan ni se atenúan", async () => {
  const { caja, desmontar } = await montar(h(SiPaga));
  for (let p = 1; p <= CIERRE; p++) {
    for (const id of RESALTADOS[p]) {
      assert.equal(de(caja, id).style.background, rgb(FAE.navy), `paso ${p}: ${id}`);
      assert.equal(colorVisto(de(caja, id)), rgb(FAE.text));
    }
    for (const id of ["primero", "despues"]) {
      const n = de(caja, id);
      if (!n) continue;
      assert.equal(n.dataset.resaltado, "no");
      assert.equal(n.style.color, rgb(COLOR.apagado), `paso ${p}: la etiqueta ${id}, siempre en secundario`);
      assert.equal(n.style.border, "", "sin caja");
    }
    if (p === 9) assert.equal(colorVisto(de(caja, "caja")), rgb(COLOR.apagado), "control: entre las dos, Caja atenuada");
    if (p < CIERRE) await siguiente(caja);
  }
  desmontar();
});

test("★★★ la escena reserva el alto: el final de cada momento y el cierre, en la misma celda, invisibles y sin resaltar", async () => {
  const { caja, desmontar } = await montar(h(SiPaga));
  const capas = [...caja.querySelector("[data-escena]").children];
  assert.equal(capas.length, 4);
  const reservas = capas.filter((c) => c.hasAttribute("data-reserva"));
  assert.deepEqual(reservas.map((r) => [...r.querySelectorAll("[data-momento]")].map((n) => n.dataset.pasado).join("")), ["no", "sino", "sisi"]);
  for (const r of reservas) {
    assert.equal(r.style.opacity, "0");
    assert.ok([...r.querySelectorAll("[style]")].every((n) => n.style.background !== rgb(FAE.navy)));
  }
  desmontar();
});

test("★★ «Reproducir»: 3 000 + 450 ms por palabra; la tabla de Mai §3.4 y sus 73,35 s", () => {
  const ms = Array.from({ length: PASOS }, (_, k) => E.duracionPasoT6A4(k + 1));
  assert.deepEqual(ms, [8850, 6600, 8850, 7950, 9300, 7950, 7500, 8400, 7950]);
  assert.equal(ms.reduce((a, b) => a + b, 0), 73350);
});

/* ═══════════ CAPA 3 ═══════════ */

test("★★★ capa 3: el tablero es una tabla; el caso a viene lleno, con el rótulo «Ejemplo» (C1-11); b y c llenan su fila al cerrarse su pregunta, con el valor correcto aunque se falle dos veces, en cualquier orden; la cifra revivida, destacada; el final, con b y c", async () => {
  const { caja, desmontar } = await montar(h(TresCasos));
  assert.equal(caja.querySelector("p").textContent, D.CONSIGNA_CAPA_3_T6_A4);
  const t = caja.querySelector("[data-tablero] table");
  assert.deepEqual([...t.querySelectorAll('th[scope="col"]')].map((x) => x.textContent), ["Se revive", "A Caja entran"]);
  assert.deepEqual([...t.querySelectorAll('th[scope="row"]')].map((x) => x.textContent), ["aEjemplo", "b", "c"]);
  const rotulo = t.querySelector('[data-fila="a"] [data-rotulo-ejemplo]');
  assert.equal(rotulo.textContent, "Ejemplo");
  assert.equal(rotulo.style.fontSize, "12px", "letra mínima");
  const fila = (id) => [...t.querySelectorAll(`[data-fila="${id}"] td div`)].map((d) => d.textContent);
  assert.deepEqual(fila("a"), ["$180.000", "$180.000"], "el ejemplo, lleno desde el principio");
  for (const id of ["b", "c"]) assert.deepEqual(fila(id), ["", ""], "al principio, vacías");
  assert.ok([...t.querySelectorAll('[data-fila="b"] td div, [data-fila="c"] td div')].every((d) => d.style.border.startsWith("1px solid rgba(184, 196, 212, 0.5)")), "vacías con borde atenuado");
  assert.deepEqual([...caja.querySelectorAll("[data-hecho]")].map((n) => n.dataset.hecho), ["b", "c"], "el caso a ya no se pregunta: solo b y c, desde el principio");
  const lectura = (n) => [...n.querySelectorAll("p:not([data-pie])")].map((p) => p.textContent).join("");
  for (const [k, c] of [D.CASOS_T6_A4[2], D.CASOS_T6_A4[1]].entries()) {
    /* Con dos errores a propósito: la fila se llena igual, con el valor correcto (hoja 6, indispensable 5). */
    const [mala1, mala] = D.OPCIONES_CAPA_3_T6_A4.filter((o) => o.id !== c.correcta).map((o) => o.id);
    await decidir(tocar, caja.querySelector(`[data-hecho="${c.id}"]`), mala1);
    assert.equal(lectura(caja.querySelector(`[data-revela="${c.id}"]`)), c.pista, "al primer error, solo la pista");
    assert.deepEqual(fila(c.id), ["", ""], "al primer error, la fila sigue vacía");
    await decidir(tocar, caja.querySelector(`[data-hecho="${c.id}"]`), mala);
    assert.equal(lectura(caja.querySelector(`[data-revela="${c.id}"]`)), (typeof c.falla === "string" ? c.falla : c.falla[mala]) + c.revela);
    assert.equal(caja.querySelector(`[data-revela="${c.id}"] [data-pie]`).textContent, c.pie);
    assert.deepEqual(fila(c.id), [c.revive, c.entran]);
    const [rev, ent] = t.querySelectorAll(`[data-fila="${c.id}"] td div`);
    assert.deepEqual([rev.style.fontSize, rev.style.fontWeight, rev.style.border, rev.style.background], ["15px", "700", `2px solid ${rgb(FAE.node)}`, rgb(FAE.navy)], "la revivida, destacada");
    assert.deepEqual([ent.style.fontSize, ent.style.border, ent.style.background], ["13px", `1px solid ${rgb(COLOR.neutro)}`, "transparent"]);
    for (const d of [rev, ent]) assert.equal(d.style.whiteSpace, "nowrap");
    assert.equal(lectura(caja.querySelector("[data-final]")), k < 1 ? "" : D.FINAL_CAPA_3_T6_A4.texto);
  }
  assert.deepEqual(fila("b")[1], fila("c")[1], "b y c meten la misma plata");
  assert.notDeepEqual(fila("b")[0], fila("c")[0], "y reviven distinto");
  assert.equal(caja.querySelector("[data-final] [data-pie]").textContent, D.FINAL_CAPA_3_T6_A4.pie);
  desmontar();
});

/* ═══════════ CAPA 4 ═══════════ */

test("★★★ capa 4 nueva (entrega 2, PASA de Shoko): UnaFrase con la pregunta del caso b, cuatro opciones, una sola correcta, la devolución de cada una y su pie", async () => {
  assert.equal(D.PREGUNTA_FINAL_T6_A4, "En el caso b, ¿dónde quedan los $80.000 que faltan?");
  assert.deepEqual(D.OPCIONES_FINAL_T6_A4.filter((o) => o.correcta).map((o) => o.texto), ["En Cuentas por cobrar – clientes, como deuda pendiente."]);
  const { Capa4 } = ESCENAS_TEMA6[D.PIEZA_SI_PAGA.id];
  const { caja, desmontar } = await montar(h(Capa4));
  assert.ok(caja.textContent.startsWith(D.PREGUNTA_FINAL_T6_A4));
  for (const o of D.OPCIONES_FINAL_T6_A4) {
    assert.equal(caja.querySelector(`[data-opcion="${o.id}"]`).textContent, o.texto);
    await tocar(caja.querySelector(`[data-opcion="${o.id}"]`));
    assert.equal(caja.querySelector("[data-devolucion]").textContent, o.feedback);
    assert.equal(caja.querySelector("[data-devolucion]").dataset.devolucion, o.correcta ? "correcta" : "incorrecta");
    await tocar(caja.querySelector("[data-otra-vez]"));
  }
  assert.equal(caja.querySelector("[data-pie]").textContent, "Basado en el libro, p. 205");
  desmontar();
});

test("★★ identificadores nuevos con b5-; los de la capa 4 nueva, con el prefijo de las demás opciones de capa 4 de la pieza y los sufijos de Shoko", () => {
  assert.match(D.PIEZA_SI_PAGA.id, /^b5-t6-a4-/);
  assert.deepEqual(D.OPCIONES_FINAL_T6_A4.map((o) => o.id), ["pendiente", "castigados", "provision", "caja"].map((x) => `b5-t6-a4-${x}`));
});
