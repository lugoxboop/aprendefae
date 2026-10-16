import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";
import { conCorreccionesDeMello } from "./correccionesMello.mjs";
import { enunciadoConFa2, PERIODICO_MELLO, LIBERA_VENTA_MELLO, LIMITE_PALABRAS_FA2, AUDITORIA } from "./correccionesMelloC2Factura.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H2 «Arma la factura» (Célula C) · Hacer · «la factura que se arma».
 *
 * Contra tres fuentes, sin copiar textos a mano:
 *   · NEAR (t7-1-h2-v1.md, su corrección 1 y el lote 3): cada texto y cada
 *     cifra de los datos, letra por letra
 *   · la C2 DE WATARI (patron-enganche-c2-v1.html, sección «factura» y su
 *     código): los mismos ítems que los datos, los rótulos [W] y la forma
 *   · MELLO (auditoria-mello-patron-c2.md §3, por correccionesMelloC2Factura):
 *     Fa-1 (el IVA y la retención de la venta, «—» hasta responder el ítem 5)
 *     y Fa-2 (en el ítem 1, a la vista solo la frase del periódico y las
 *     tarifas; ≤ 60 palabras antes de la primera decisión); condición 4 (la
 *     casilla es el mismo nodo de la primera tecla a «Comprobar»)
 *
 * La evaluación es la de antes: seis ítems, doce unidades, un intento por
 * unidad, sin arrastre; detalle, etiquetas del panel, catálogo, vista y
 * migración, iguales.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let movimientoReducido = false;
w.matchMedia = (q) => ({ matches: /reduce/.test(q) ? movimientoReducido : false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.requestAnimationFrame = (f) => setTimeout(f, 0);
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, requestAnimationFrame: w.requestAnimationFrame,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const D = await import("../../data/contabilidadT7_1_h2.js");
const L = await import("../t7H2.js");
const { DEBE, HABER, pesos } = await import("../../data/contabilidad.js");
const { SUBJECTS, HACER, APRENDER, actividadesDeTipo, clasificacionDe } = await import("../../data/subjects.js");
const F = await import("../../components/mecanicas/libros/t7/ArmaLaFactura.jsx");
const ArmaLaFactura = F.default;
const { JUEGOS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { etiquetaDeItem, recortar } = await import("../../docente/etiquetasItem.js");
const B5 = await import("../../components/mecanicas/libros/b5/Devolucion.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");
const V1 = leer("orquestador/conocimiento/paquetes/t7-1-h2-v1.md");
const CAMBIOS = leer("orquestador/conocimiento/paquetes/t7-1-h2-cambios.md");
const VISTA = leer("src/components/ContabilidadT7_1View.jsx");
const MIGRACION = leer("supabase/migrations/0092_t7_1_arma_la_factura.sql");
const FUENTE = leer("src/components/mecanicas/libros/t7/ArmaLaFactura.jsx");
const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);

/* La C2 de Watari: la sección «factura» del HTML y su código de referencia, ejecutado aparte. */
const C2 = leer("orquestador/conocimiento/paquetes/patron-enganche-c2-v1.html");
const INICIO_C2 = C2.indexOf('<section class="sec" id="factura">');
const SECCION_C2 = C2.slice(INICIO_C2, C2.indexOf("</section>", INICIO_C2));
const CODIGO_C2 = (() => {
  const ini = C2.indexOf("(function () {", C2.indexOf("/* Patrón de enganche C2 · T7-1 H2 «Arma la factura», renovada"));
  const marca = "  window.C2Factura.ITEMS = ITEMS;\n})();";
  const fin = C2.indexOf(marca, ini);
  assert.ok(ini > 0 && fin > ini, "no encuentro el código de la factura en la C2");
  const cuerpo = C2.slice(ini, fin) + "  window.C2Factura.ITEMS = ITEMS;\n  window.__c2 = { ENUNCIADO, CAMPOS, FACTURAS, RENGLON, ITEMS };\n})();";
  const ventana = {};
  new Function("window", cuerpo)(ventana);
  return ventana.__c2;
})();

/* Near: el enunciado (los párrafos de la sección «Enunciado» de la v1, sin la consigna). */
const ENUNCIADO_NEAR = (() => {
  const s = V1.slice(V1.indexOf("## Enunciado"));
  return s.slice(0, s.indexOf("\n## ", 5)).split("\n").filter((l) => l.startsWith("- «")).map((l) => /^- «(.+?)»/.exec(l)[1]).slice(1);
})();

/* Sin barajar: las líneas y su banco de cuentas en el orden de los datos. */
const EN_ORDEN = L.prepararH2((xs) => [...xs]);

const Marco = ({ children }) => h("div", { "data-marco": true }, children);
const montar = async (props = {}) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const completados = [];
  await act(async () => { raiz.render(h(ArmaLaFactura, { Marco, items: EN_ORDEN, onCompletar: (...a) => completados.push(a), ...props })); });
  return { caja, completados, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => {
  assert.ok(el, "no está el elemento que se quería tocar");
  await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent === texto);
const avance = (caja) => [...caja.querySelectorAll("[data-responder] button")].find((b) => Object.values(D.BOTON_H2).includes(b.textContent));
const casilla = (caja) => caja.querySelector("[data-casilla]");
const contador = (caja) => caja.querySelector("[data-avance]").textContent;
const cifraEn = (caja, fac, rn) => {
  const r = caja.querySelector(`[data-renglon="${fac}-${rn}"]`);
  return r.querySelector("input") ? "casilla" : r.querySelector("[data-cifra]").textContent;
};
const tramo = (caja, fac, t) => Number(caja.querySelector(`[data-barra="${fac}"] [data-tramo="${t}"]`).style.getPropertyValue("--l"));
const pastillas = (el) => [...el.querySelectorAll("[data-pastilla]")].map((p) => `${p.dataset.pastilla}:${p.textContent}`);
const palabras = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const otro = (l) => (l === DEBE ? HABER : DEBE);
const item = (id) => D.ITEMS_H2.find((x) => x.id === id);
/* Mismo nodo. assert.equal con nodos de JSDOM arma un diff de todo el documento y se queda sin memoria: aquí se dice cuál es cuál. */
const nombreDe = (n) => (n ? `<${n.tagName?.toLowerCase()}${n.dataset && Object.keys(n.dataset).length ? " " + Object.keys(n.dataset).map((k) => `data-${k}`).join(" ") : ""}>` : String(n));
const mismo = (a, b, msg = "no es el mismo nodo") => assert.ok(a === b, `${msg}: ${nombreDe(a)} en vez de ${nombreDe(b)}`);
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/* Teclea en la casilla una tecla a la vez, como el teclado del teléfono: cada tecla agrega un dígito al valor que ya tiene. */
async function teclear(caja, texto) {
  const c = casilla(caja);
  assert.ok(c, "no hay casilla");
  await act(async () => { c.focus(); });
  for (const tecla of String(texto)) {
    const ahora = casilla(caja);
    await act(async () => {
      Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(ahora, ahora.value + tecla);
      ahora.dispatchEvent(new w.Event("input", { bubbles: true }));
    });
  }
  return c;
}

/* ═══════════ 1 · TEXTOS Y CIFRAS CONTRA NEAR ═══════════ */

test("★★★ nombre, id, etiqueta, consigna, enunciado y pie son los de la v1, letra por letra", () => {
  assert.equal(D.H2_ID, "t7-1-arma-la-factura");
  assert.ok(V1.includes(`| id | \`${D.H2_ID}\` |`));
  assert.ok(V1.includes(`**T7-1 · H2 «${D.H2.nombre}»`));
  assert.ok(V1.includes(`| Etiqueta del panel docente | «${D.H2.etiqueta}» |`));
  assert.ok(V1.includes(`- «${D.H2.consigna}»`), "consigna");
  assert.equal(ENUNCIADO_NEAR.length, 4);
  assert.deepEqual(D.H2.enunciado, ENUNCIADO_NEAR, "el enunciado son los cuatro párrafos de Near, en su orden");
  assert.ok(V1.includes(`**Pie de todos los ítems:** «${D.H2.pie}»`));
});

test("★★ las fichas de los cinco datos son la tabla de la v1", () => {
  for (const [k, campo] of D.FICHAS_H2.campos.entries()) {
    assert.ok(V1.includes(`| ${campo} | ${D.FICHAS_H2.compra.valores[k]} | ${D.FICHAS_H2.venta.valores[k]} |`), campo);
  }
});

function filasV1() {
  const lineas = V1.slice(V1.indexOf("## Ítems")).split("\n").filter((l) => /^\| \d \|/.test(l));
  return lineas.map((l) => l.slice(1, -1).split(" | ").map((c) => c.trim()));
}
const citas = (celda) => [...celda.matchAll(/«([^»]+)»/g)].map((m) => m[1]);
const cifra = (s) => Number(s.replace(/[$.]/g, ""));

test("★★★ cada ítem es el de la v1, con la corrección 1 aplicada: manda la más nueva", () => {
  const filas = filasV1();
  assert.equal(filas.length, 6);
  assert.equal(D.ITEMS_H2.length, 6);
  for (const [k, it] of D.ITEMS_H2.entries()) {
    const [n, pregunta, correcta, distractores, acierto] = filas[k];
    assert.equal(n, String(k + 1));
    assert.equal(it.pregunta, citas(pregunta)[0], `${it.id}: pregunta`);
    if (it.tipo === "cifra") {
      assert.equal(pesos(it.correcta), correcta, `${it.id}: correcta`);
      assert.equal(it.acierto, citas(acierto)[0], `${it.id}: acierto`);
      const deV1 = [...distractores.matchAll(/(\$[\d.]+): «([^»]+)»/g)].map((m) => ({ valor: cifra(m[1]), retro: m[2] }));
      assert.deepEqual(it.distractores.map((d) => d.valor), deV1.map((d) => d.valor), `${it.id}: distractores`);
      for (const [j, d] of it.distractores.entries()) {
        if (it.id === "iva-compra" && d.valor === 112_000) {
          assert.notEqual(d.retro, deV1[j].retro, "el error de $112.000 sigue con el texto de la v1");
          assert.ok(CAMBIOS.includes(`«${d.retro}»`), "el texto nuevo del error de $112.000 no está en la corrección 1");
          assert.doesNotMatch(d.retro, /\$|\d{3}\.\d{3}/, "el error de $112.000 ya no dice qué cifra es");
        } else {
          assert.equal(d.retro, deV1[j].retro, `${it.id}: retro de ${d.valor}`);
        }
      }
    } else {
      assert.equal(correcta, "—");
      const lineas = [...pregunta.matchAll(/(?:: |· )([^:·]+?) (\$[\d.]+) → (Debe|Haber)/g)].map((m) => ({ cuenta: m[1], valor: cifra(m[2]), lado: m[3] === "Debe" ? DEBE : HABER }));
      assert.deepEqual(it.lineas.map(({ cuenta, valor, lado: l }) => ({ cuenta, valor, lado: l })), lineas, `${it.id}: líneas`);
      assert.deepEqual(it.lineas.map((l) => l.retro), citas(distractores), `${it.id}: mensajes de error`);
      const [s1, s2] = acierto.match(/sumas de ([\d.]+) = ([\d.]+)/).slice(1).map((x) => Number(x.replace(/\./g, "")));
      assert.equal(it.sumas, s1);
      assert.equal(s1, s2);
    }
  }
});

test("★★★ las cifras salen de las tarifas del enunciado, dan las de Near y los asientos cuadran", () => {
  const C = D.CIFRAS_H2;
  assert.deepEqual(
    [C.compra, C.ivaCompra, C.retencionCompra, C.debeProveedor, C.venta, C.ivaVenta, C.retencionVenta, C.debeCliente],
    [3_200_000, 512_000, 112_000, 3_600_000, 4_800_000, 768_000, 168_000, 5_400_000],
  );
  assert.ok(V1.includes("H2 (3.200.000 · 512.000 · 112.000 · 3.600.000 · 4.800.000 · 768.000 · 168.000 · 5.400.000)"));
  const it = Object.fromEntries(D.ITEMS_H2.map((x) => [x.id, x]));
  assert.equal(it["iva-compra"].correcta, C.ivaCompra);
  assert.equal(it["retencion-compra"].correcta, C.retencionCompra);
  assert.equal(it["debe-proveedor"].correcta, C.debeProveedor);
  assert.equal(it["debe-cliente"].correcta, C.debeCliente);
  for (const a of [it["asiento-compra"], it["asiento-venta"]]) {
    const suma = (l) => a.lineas.filter((x) => x.lado === l).reduce((s, x) => s + x.valor, 0);
    assert.equal(suma(DEBE), suma(HABER), `${a.id}: no cuadra`);
    assert.equal(suma(DEBE), a.sumas, `${a.id}: sumas`);
  }
  for (const x of D.ITEMS_H2.filter((y) => y.tipo === "cifra")) assert.ok(!x.distractores.some((d) => d.valor === x.correcta), x.id);
});

/* ═══════════ 2 · LA C2 DE WATARI Y LAS CORRECCIONES DE MELLO ═══════════ */

test("★★★ la C2 trae los mismos ítems, enunciado, fichas y renglones que los datos: la forma cambia, el contenido no", () => {
  const c = CODIGO_C2;
  assert.deepEqual(c.ENUNCIADO, D.H2.enunciado);
  assert.deepEqual(c.CAMPOS, D.FICHAS_H2.campos);
  const de = { compra: { iva: "ivaCompra", ret: "retencionCompra", total: "debeProveedor" }, venta: { iva: "ivaVenta", ret: "retencionVenta", total: "debeCliente" } };
  for (const f of ["compra", "venta"]) {
    assert.deepEqual(c.FACTURAS[f].valores, D.FICHAS_H2[f].valores, f);
    assert.equal(c.FACTURAS[f].fecha, D.FACTURA_H2.fechas[f], `${f}: fecha`);
    assert.equal(`Factura de ${c.FACTURAS[f].titulo.toLowerCase()}`, D.FACTURA_H2.titulos[f], `${f}: título`);
    assert.equal(c.FACTURAS[f].mercancia, D.CIFRAS_H2[f]);
    for (const r of ["iva", "ret", "total"]) assert.equal(c.FACTURAS[f][r], D.CIFRAS_H2[de[f][r]], `${f}·${r}`);
  }
  assert.deepEqual(c.ITEMS.map((x) => x.id), D.ITEMS_H2.map((x) => x.id));
  for (const [k, x] of c.ITEMS.entries()) {
    const it = D.ITEMS_H2[k];
    assert.equal(x.tipo, it.tipo);
    assert.equal(x.pregunta, it.pregunta);
    assert.equal(x.factura, D.DONDE_H2[it.id].factura, `${it.id}: factura`);
    if (x.tipo === "cifra") {
      assert.equal(x.correcta, it.correcta);
      assert.equal(x.acierto, it.acierto);
      assert.deepEqual(x.distractores, it.distractores);
      assert.equal(x.renglon, D.DONDE_H2[it.id].renglon, `${it.id}: renglón`);
    } else {
      assert.equal(x.sumas, it.sumas);
      assert.deepEqual(x.lineas.map(({ renglon, ...l }) => l), it.lineas, `${it.id}: líneas`);
      assert.deepEqual(Object.fromEntries(x.lineas.map((l) => [l.id, l.renglon])), D.DONDE_H2[it.id].lineas, `${it.id}: renglón de cada línea`);
    }
  }
});

test("★★★ los rótulos [W] son los de la C2, letra por letra (y siguen pendientes de Near)", () => {
  assert.deepEqual(CODIGO_C2.RENGLON, D.FACTURA_H2.renglones);
  const ini = SECCION_C2.indexOf('<ul class="limpia pide">');
  const rotulos = citas(SECCION_C2.slice(ini, SECCION_C2.indexOf("</ul>", ini)));
  const R = D.FACTURA_H2;
  assert.deepEqual(rotulos, [
    R.renglones.mercancia, R.renglones.iva, R.renglones.ret, R.renglones.total.compra, R.renglones.total.venta,
    R.titulos.compra, R.titulos.venta, R.asientos.compra, R.asientos.venta, R.sumas, R.verEnunciado, R.ocultarEnunciado,
    R.lineasAlPrimerToque("n"),
  ]);
  assert.ok(D.H2.enunciado[0].startsWith(`El ${R.fechas.compra},`));
  assert.ok(D.H2.enunciado[1].startsWith(`El ${R.fechas.venta},`));
});

test("★★★ Fa-2 de Mello: el enunciado de Near se reparte como pide la auditoría, y la frase del periódico es la de Mello", () => {
  const fa2 = enunciadoConFa2(ENUNCIADO_NEAR);
  assert.deepEqual(D.ENUNCIADO_H2.visible, fa2.visible);
  assert.deepEqual(D.ENUNCIADO_H2.plegadoItem1, fa2.plegado);
  assert.deepEqual(D.ENUNCIADO_H2.plegado, ENUNCIADO_NEAR, "desde el ítem 2, el de Near entero");
  assert.equal(D.PERIODICO_H2, PERIODICO_MELLO);
  assert.ok(!V1.includes(D.PERIODICO_H2), "la frase con sujeto no es de Near: es de Mello (Near debe confirmarla)");
  assert.ok(AUDITORIA.includes(`«${D.PERIODICO_H2}»`));
});

test("★★★ Fa-1 de Mello: el IVA y la retención de la venta, «—» hasta que se responde el ítem 5", () => {
  assert.equal(L.LIBERA_VENTA_H2, LIBERA_VENTA_MELLO);
  assert.equal(LIBERA_VENTA_MELLO, "debe-cliente");
  const previos = ["iva-compra", "retencion-compra", "debe-proveedor", "asiento-compra"];
  const antes = { resuelto: (id) => previos.includes(id), actual: "debe-cliente", escrito: 5_568_000 };
  assert.equal(L.renglonH2("venta", "iva", antes).v, null);
  assert.equal(L.renglonH2("venta", "ret", antes).v, null);
  assert.deepEqual(L.renglonH2("venta", "total", antes), { v: 5_568_000, item: item("debe-cliente"), activo: true });
  assert.equal(L.renglonH2("venta", "mercancia", antes).v, 4_800_000);
  const despues = { ...antes, resuelto: (id) => previos.includes(id) || id === "debe-cliente" };
  assert.equal(L.renglonH2("venta", "iva", despues).v, 768_000);
  assert.equal(L.renglonH2("venta", "ret", despues).v, 168_000);
  assert.equal(L.renglonH2("venta", "total", despues).v, 5_400_000);
});

/* ═══════════ 3 · PUNTAJE, UNIDADES Y LA MISMA EVALUACIÓN ═══════════ */

test("★★★ doce unidades, doce aciertos posibles: cuatro cálculos y ocho líneas", () => {
  const u = L.unidadesH2();
  assert.equal(u.length, 12);
  assert.equal(L.TOTAL_H2, 12);
  assert.equal(new Set(u).size, 12);
  assert.ok(V1.includes("tiene 12 aciertos posibles"));
  assert.equal(L.puntuarH2(12), 100);
  assert.equal(L.puntuarH2(6), 50);
  assert.equal(L.puntuarH2(0), 0);
});

test("★★★ la casilla califica igual que antes (evaluarH2); solo cambia el texto: sin «La respuesta es», la cifra va en «Iba aquí»", () => {
  for (const it of D.ITEMS_H2.filter((x) => x.tipo === "cifra")) {
    for (const v of [it.correcta, ...it.distractores.map((d) => d.valor), 1, it.correcta + 1000]) {
      const viejo = L.evaluarH2(it, v);
      const nuevo = L.devolucionH2(it, v);
      assert.equal(nuevo.ok, viejo.ok, `${it.id} · ${v}`);
      assert.equal(nuevo.correcta, viejo.correcta);
      assert.deepEqual([nuevo.texto], viejo.textos.filter((x) => x !== `Iba aquí: ${pesos(it.correcta)}.`) /* TEXTOS_ARMA.respuesta, ya en el dialecto C */, `${it.id} · ${v}`);
    }
  }
});

/* ═══════════ 4 · LA PIEZA, MONTADA, ÍTEM POR ÍTEM ═══════════ */

/* Lo que cada renglón debe mostrar ANTES de responder el ítem k (0-based), sin arrastre y con Fa-1. */
function esperadoAntes(k) {
  const resuelto = (id) => D.ITEMS_H2.findIndex((x) => x.id === id) < k;
  const out = {};
  for (const f of ["compra", "venta"]) for (const rn of ["mercancia", "iva", "ret", "total"]) {
    const it = D.ITEMS_H2.find((x) => x.tipo === "cifra" && D.DONDE_H2[x.id].factura === f && D.DONDE_H2[x.id].renglon === rn);
    let v;
    if (rn === "mercancia") v = pesos(D.CIFRAS_H2[f]);
    else if (!it) v = resuelto("debe-cliente") ? pesos(D.CIFRAS_H2[rn === "iva" ? "ivaVenta" : "retencionVenta"]) : "—";
    else if (resuelto(it.id)) v = pesos(it.correcta);
    else if (it.id === D.ITEMS_H2[k].id) v = "casilla";
    else v = "—";
    out[`${f}-${rn}`] = v;
  }
  return out;
}
const vistos = (caja) => Object.fromEntries(["compra", "venta"].flatMap((f) => ["mercancia", "iva", "ret", "total"].map((rn) => [`${f}-${rn}`, cifraEn(caja, f, rn)])));

async function jugar(m, falla) {
  const detalle = [];
  for (const [k, it] of EN_ORDEN.entries()) {
    const { caja } = m;
    const donde = D.DONDE_H2[it.id];
    assert.equal(contador(caja), `Ítem ${k + 1} de 6`);
    assert.equal(caja.querySelector("[data-pregunta]").textContent, it.pregunta, `orden: el ítem ${k + 1}`);
    assert.equal(caja.querySelector("[data-pie]").textContent, D.H2.pie);
    assert.equal(caja.querySelectorAll(".fae-c2f-factura.activa").length, 1);
    assert.equal(caja.querySelector(".fae-c2f-factura.activa").dataset.factura, donde.factura, `${it.id}: factura activa`);
    assert.deepEqual(vistos(caja), esperadoAntes(k), `${it.id}: la factura antes de responder`);
    assert.equal(avance(caja), undefined, `${it.id}: avance antes de responder`);
    assert.equal(boton(caja, "Comprobar").disabled, true, `${it.id}: «Comprobar» sin respuesta`);
    assert.equal(caja.querySelector("[data-region-mensaje]").textContent, "", "mensaje antes de responder");
    if (it.tipo === "cifra") {
      assert.equal(caja.querySelector("[data-asiento]"), null);
      const c = casilla(caja);
      assert.equal(c.closest("[data-renglon]").dataset.renglon, `${donde.factura}-${donde.renglon}`, `${it.id}: la casilla vive en su renglón`);
      assert.equal(c.getAttribute("aria-label"), `${it.pregunta} Tu respuesta, en pesos`);
      assert.equal(c.getAttribute("inputmode"), "numeric");
      const v = falla(it.id) ? it.distractores[0].valor : it.correcta;
      await teclear(caja, v);
      mismo(casilla(caja), c, "la casilla se remontó");
      assert.equal(c.value, miles(v));
      assert.equal(boton(caja, "Comprobar").disabled, false);
      await tocar(boton(caja, "Comprobar"));
      const ok = v === it.correcta;
      /* Un intento: la casilla se va y queda la cifra buena (sin arrastre), con su marca. */
      mismo(casilla(caja), null, `${it.id}: la casilla sigue abierta`);
      assert.equal(boton(caja, "Comprobar"), undefined);
      const ren = caja.querySelector(`[data-renglon="${donde.factura}-${donde.renglon}"]`);
      assert.equal(ren.querySelector("[data-cifra]").textContent, pesos(it.correcta));
      assert.ok(ren.classList.contains(ok ? "ok" : "mal"));
      assert.deepEqual(pastillas(ren), ok ? ["correcta:Correcto"] : ["tachada:No va aquí", `revelada:Iba aquí: ${pesos(it.correcta)}`]);
      if (!ok) assert.ok(ren.querySelector('[data-pastilla="revelada"]').classList.contains("fae-b5h-revela"), "«Iba aquí» a los 0,7 s");
      const msg = caja.querySelector("[data-mensaje]");
      assert.equal(msg.dataset.mensaje, ok ? "acierto" : "error");
      const texto = ok ? it.acierto : it.distractores[0].retro;
      assert.equal(msg.querySelector("[data-texto-retro]").textContent, texto);
      assert.equal(msg.textContent, ok ? `Correcto${texto}` : `Incorrecto. Iba aquí: ${pesos(it.correcta)}. ${texto}`);
      mismo(document.activeElement, msg, `${it.id}: el foco va al mensaje`);
      detalle.push({ item: it.id, ok, intentos: 1, respuesta: ok ? null : v, orden: detalle.length + 1 });
      if (it.id === "debe-cliente") {
        assert.equal(cifraEn(caja, "venta", "iva"), "$768.000");
        assert.equal(cifraEn(caja, "venta", "ret"), "$168.000");
      }
    } else {
      mismo(casilla(caja), null);
      const A = caja.querySelector(`[data-asiento="${it.id}"]`);
      assert.equal(A.querySelector("[data-titulo-asiento]").textContent, D.FACTURA_H2.asientos[donde.factura]);
      assert.deepEqual([...A.querySelectorAll("[data-linea]")].map((x) => x.dataset.linea), it.orden, "las líneas en su orden");
      for (const l of it.lineas) {
        const el = A.querySelector(`[data-linea="${l.id}"]`);
        assert.equal(el.querySelector("[data-l-valor]").textContent, pesos(l.valor), "el monto viene dado");
        assert.deepEqual([...el.querySelectorAll("[data-cuenta]")].map((b) => b.dataset.cuenta), l.banco);
        assert.deepEqual([...el.querySelectorAll("[data-lado]")].map((b) => b.textContent), ["Debe", "Haber"]);
        assert.equal(boton(caja, "Comprobar").disabled, true, `${it.id}: «Comprobar» antes de tener todas las líneas`);
        const cuenta = falla(L.idDeLinea(it, l)) ? l.distractores[0].cuenta : l.cuenta;
        await tocar(el.querySelector(`[data-cuenta="${cuenta}"]`));
        /* Antes de comprobar se puede cambiar el lado. */
        await tocar(el.querySelector(`[data-lado="${otro(l.lado)}"]`));
        await tocar(el.querySelector(`[data-lado="${l.lado}"]`));
        assert.equal(el.querySelector(`[data-cuenta="${cuenta}"]`).getAttribute("aria-pressed"), "true");
        assert.equal(el.querySelector(`[data-lado="${l.lado}"]`).getAttribute("aria-pressed"), "true");
        assert.equal(el.querySelector(`[data-lado="${otro(l.lado)}"]`).getAttribute("aria-pressed"), "false");
      }
      assert.equal(A.querySelector("[data-sumas]"), null, `${it.id}: las sumas antes de comprobar`);
      await tocar(boton(caja, "Comprobar"));
      let n = 0;
      for (const l of it.lineas) {
        const id = L.idDeLinea(it, l);
        const ok = !falla(id);
        if (ok) n += 1;
        const el = A.querySelector(`[data-linea="${l.id}"]`);
        for (const b of el.querySelectorAll("button[data-cuenta], button[data-lado]")) assert.equal(b.getAttribute("aria-disabled"), "true");
        assert.deepEqual(pastillas(el.querySelector(".fae-c2f-lcab")), [ok ? "correcta:Correcto" : "tachada:No va aquí"]);
        assert.deepEqual([...el.querySelectorAll("[data-l-retro]")].map((p) => p.textContent), ok ? [] : [l.distractores[0].retro], `${id}: su retroalimentación va bajo su línea`);
        /* «Iba aquí» en la cuenta buena; el lado estaba bien. */
        assert.deepEqual([...el.querySelectorAll('[data-pastilla="revelada"]')].map((p) => p.closest("button").dataset.cuenta), ok ? [] : [l.cuenta]);
        if (!ok) assert.ok(el.querySelector(`[data-cuenta="${l.distractores[0].cuenta}"]`).classList.contains("mal"));
        detalle.push({ item: id, ok, intentos: 1, respuesta: ok ? null : `${l.distractores[0].cuenta}|${l.lado}`, orden: detalle.length + 1 });
      }
      /* Un intento: tocar otra cuenta después no cambia nada. */
      const l0 = it.lineas[0];
      await tocar(A.querySelector(`[data-linea="${l0.id}"] [data-cuenta="${l0.distractores[1].cuenta}"]`));
      assert.equal(A.querySelector(`[data-linea="${l0.id}"] [data-cuenta="${l0.distractores[1].cuenta}"]`).getAttribute("aria-pressed"), "false");
      assert.equal(boton(caja, "Comprobar"), undefined);
      assert.equal(A.querySelector("[data-sumas]").textContent, `Sumas iguales${pesos(it.sumas)}${pesos(it.sumas)}`);
      const msg = caja.querySelector("[data-mensaje]");
      assert.equal(msg.textContent, n === 4 ? `Correcto${n} de 4 líneas al primer toque.` : `${n} de 4 líneas al primer toque.`);
      assert.equal(msg.dataset.mensaje, n === 4 ? "acierto" : "error");
      mismo(document.activeElement, msg, `${it.id}: el foco va al mensaje`);
    }
    assert.equal(contador(caja), `Ítem ${k + 1} de 6`);
    assert.equal(avance(caja).textContent, k === EN_ORDEN.length - 1 ? "Ver mi resumen" : "Siguiente ítem");
    await tocar(avance(caja));
    if (k < EN_ORDEN.length - 1) {
      const sig = EN_ORDEN[k + 1];
      mismo(document.activeElement, sig.tipo === "cifra" ? casilla(caja) : caja.querySelector("[data-pregunta]"), `${sig.id}: el foco al pasar`);
    }
  }
  return detalle;
}

test("★★★ la tanda entera, ítem por ítem: factura, casilla, marcas, mensaje, foco; el porcentaje es aciertos / 12 y el detalle, el del primer intento", async () => {
  const m = await montar();
  try {
    const fallos = new Set(["retencion-compra", "asiento-compra:retencion", "asiento-venta:anticipo", "asiento-venta:ingresos"]);
    const detalle = await jugar(m, (id) => fallos.has(id));
    assert.equal(m.completados.length, 1);
    const [pct, ms, det] = m.completados[0];
    assert.deepEqual(det, detalle);
    assert.equal(det.length, 12);
    assert.deepEqual(det.map((d) => d.item), L.unidadesH2());
    assert.equal(pct, (8 / 12) * 100);
    assert.equal(typeof ms, "number");
    assert.equal(m.caja.querySelector("[data-resumen]").textContent, D.resumenH2(8, 12));
  } finally {
    m.desmontar();
  }
});

test("★★★ sin arrastre y un solo intento: todo mal da 0, todo bien da 100, con los mismos ítems", async () => {
  const todoMal = await montar();
  const todoBien = await montar();
  try {
    const mal = await jugar(todoMal, () => true);
    const bien = await jugar(todoBien, () => false);
    assert.equal(todoMal.completados[0][0], 0);
    assert.equal(todoBien.completados[0][0], 100);
    assert.deepEqual(mal.map((d) => d.item), bien.map((d) => d.item));
  } finally {
    todoMal.desmontar();
    todoBien.desmontar();
  }
});

test("★★★ condición 4 de Mello: la casilla es el MISMO nodo de la primera tecla a «Comprobar» y no pierde el foco", async () => {
  const m = await montar();
  try {
    const c = casilla(m.caja);
    await act(async () => { c.focus(); });
    for (const tecla of "3824000") {
      await act(async () => {
        Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(c, c.value + tecla);
        c.dispatchEvent(new w.Event("input", { bubbles: true }));
      });
      assert.equal(c.isConnected, true, `tras «${tecla}», la casilla salió del documento`);
      mismo(casilla(m.caja), c, `tras «${tecla}», otra casilla`);
      mismo(document.activeElement, c, `tras «${tecla}», la casilla perdió el foco`);
    }
    assert.equal(c.value, "3.824.000");
    await act(async () => {
      Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(c, "");
      c.dispatchEvent(new w.Event("input", { bubbles: true }));
    });
    mismo(casilla(m.caja), c);
    mismo(document.activeElement, c);
    assert.equal(boton(m.caja, "Comprobar").disabled, true, "casilla vacía, «Comprobar» apagado");
  } finally {
    m.desmontar();
  }
});

test("★★★ la barra cambia al teclear: crece con el IVA de la compra y se recorta con la retención", async () => {
  const m = await montar();
  try {
    assert.equal(tramo(m.caja, "compra", "mercancia"), F.anchoDeBarra(3_200_000));
    assert.equal(tramo(m.caja, "compra", "iva"), 0, "sin cifra, la barra del IVA no existe");
    let escrito = "";
    for (const tecla of "512000") {
      await teclear(m.caja, tecla);
      escrito += tecla;
      assert.equal(tramo(m.caja, "compra", "iva"), F.anchoDeBarra(Number(escrito)), `con «${escrito}»`);
    }
    assert.ok(tramo(m.caja, "compra", "iva") > 0.09);
    assert.equal(tramo(m.caja, "venta", "iva"), 0, "la venta no se mueve");
    await tocar(boton(m.caja, "Comprobar"));
    await tocar(avance(m.caja));
    await teclear(m.caja, "112000");
    assert.equal(tramo(m.caja, "compra", "ret"), F.anchoDeBarra(112_000));
    const ret = m.caja.querySelector('[data-barra="compra"] [data-tramo="ret"]');
    assert.equal(Number(ret.style.getPropertyValue("--a")), F.anchoDeBarra(3_200_000 + 512_000 - 112_000));
  } finally {
    m.desmontar();
  }
});

test("★★★ Fa-1, reproducido en la pieza: en el ítem 5, el IVA y la retención de la venta se ven «—» hasta responder", async () => {
  const m = await montar();
  try {
    for (const it of EN_ORDEN.slice(0, 4)) {
      assert.equal(cifraEn(m.caja, "venta", "iva"), "—", `${it.id}: IVA de la venta`);
      assert.equal(cifraEn(m.caja, "venta", "ret"), "—", `${it.id}: retención de la venta`);
      if (it.tipo === "cifra") await teclear(m.caja, it.correcta);
      else for (const l of it.lineas) { await tocar(m.caja.querySelector(`[data-linea="${l.id}"] [data-cuenta="${l.cuenta}"]`)); await tocar(m.caja.querySelector(`[data-linea="${l.id}"] [data-lado="${l.lado}"]`)); }
      await tocar(boton(m.caja, "Comprobar"));
      await tocar(avance(m.caja));
    }
    assert.equal(m.caja.querySelector("[data-pregunta]").textContent, item("debe-cliente").pregunta);
    assert.equal(cifraEn(m.caja, "venta", "iva"), "—");
    assert.equal(cifraEn(m.caja, "venta", "ret"), "—");
    assert.equal(tramo(m.caja, "venta", "iva"), 0);
    assert.equal(tramo(m.caja, "venta", "ret"), 0);
    await teclear(m.caja, 5_568_000);
    assert.equal(cifraEn(m.caja, "venta", "iva"), "—", "escribir el total no revela el IVA");
    assert.equal(cifraEn(m.caja, "venta", "ret"), "—");
    await tocar(boton(m.caja, "Comprobar"));
    assert.equal(cifraEn(m.caja, "venta", "iva"), "$768.000");
    assert.equal(cifraEn(m.caja, "venta", "ret"), "$168.000");
    assert.equal(m.caja.querySelector("[data-texto-retro]").textContent, item("debe-cliente").distractores[1].retro);
  } finally {
    m.desmontar();
  }
});

test("★★★ Fa-2, reproducido en la pieza: en el ítem 1, a la vista la frase del periódico y las tarifas; ≤ 60 palabras antes de la primera decisión", async () => {
  const m = await montar();
  try {
    const visible = m.caja.querySelector("[data-enunciado-visible]");
    assert.deepEqual([...visible.querySelectorAll("p")].map((p) => p.textContent), D.ENUNCIADO_H2.visible);
    const ver = m.caja.querySelector("[data-ver-enunciado]");
    const plegado = m.caja.querySelector("[data-enunciado]");
    assert.equal(ver.textContent, "Ver el enunciado");
    assert.equal(ver.getAttribute("aria-expanded"), "false");
    assert.equal(ver.getAttribute("aria-controls"), plegado.id);
    assert.equal(plegado.hidden, true);
    assert.deepEqual([...plegado.querySelectorAll("p")].map((p) => p.textContent), D.ENUNCIADO_H2.plegadoItem1);
    /* Lo que se lee antes de decidir: consigna, lo visible del enunciado y la pregunta. */
    const antes = palabras(m.caja.querySelector("[data-consigna]").textContent) + palabras(visible.textContent) + palabras(m.caja.querySelector("[data-pregunta]").textContent);
    assert.ok(antes <= LIMITE_PALABRAS_FA2, `${antes} palabras antes de la primera decisión`);
    /* Con el enunciado entero a la vista (la C2 sin Fa-2), no cabría. */
    assert.ok(palabras(D.H2.enunciado.join(" ")) + palabras(item("iva-compra").pregunta) > LIMITE_PALABRAS_FA2);
    for (const p of D.ENUNCIADO_H2.plegadoItem1) assert.ok(!visible.textContent.includes(p));
    /* En el orden de la página, lo visible va antes de la casilla. */
    assert.ok(visible.compareDocumentPosition(casilla(m.caja)) & w.Node.DOCUMENT_POSITION_FOLLOWING);
    await tocar(ver);
    assert.equal(ver.textContent, "Ocultar el enunciado");
    assert.equal(ver.getAttribute("aria-expanded"), "true");
    assert.equal(plegado.hidden, false);
    await tocar(ver);
    assert.equal(plegado.hidden, true);
    assert.equal(ver.textContent, "Ver el enunciado");
    /* Desde el ítem 2: nada a la vista; el de Near entero, plegado. */
    await teclear(m.caja, 512_000);
    await tocar(boton(m.caja, "Comprobar"));
    await tocar(avance(m.caja));
    assert.equal(m.caja.querySelector("[data-enunciado-visible]"), null);
    assert.equal(m.caja.querySelector("[data-enunciado]").hidden, true);
    assert.deepEqual([...m.caja.querySelectorAll("[data-enunciado] p")].map((p) => p.textContent), D.H2.enunciado);
    assert.equal(m.caja.querySelector("[data-ver-enunciado]").textContent, "Ver el enunciado");
  } finally {
    m.desmontar();
  }
});

test("★★ las facturas: título, fecha y los cinco datos de Near en su cabecera; los rótulos [W] en sus renglones", async () => {
  const m = await montar();
  try {
    for (const f of ["compra", "venta"]) {
      const fa = m.caja.querySelector(`[data-factura="${f}"]`);
      assert.equal(fa.querySelector("[data-titulo-factura]").textContent, D.FACTURA_H2.titulos[f]);
      assert.equal(fa.querySelector("[data-fecha]").textContent, D.FACTURA_H2.fechas[f]);
      assert.equal(fa.getAttribute("aria-label"), `${D.FACTURA_H2.titulos[f]}, ${D.FACTURA_H2.fechas[f]}`);
      assert.deepEqual([...fa.querySelectorAll("dt")].map((x) => x.textContent), D.FICHAS_H2.campos);
      assert.deepEqual([...fa.querySelectorAll("dd")].map((x) => x.textContent), D.FICHAS_H2[f].valores);
      assert.deepEqual([...fa.querySelectorAll("[data-rotulo]")].map((x) => x.textContent),
        [D.FACTURA_H2.renglones.mercancia, D.FACTURA_H2.renglones.iva, D.FACTURA_H2.renglones.ret, D.FACTURA_H2.renglones.total[f]]);
    }
  } finally {
    m.desmontar();
  }
});

test("★★ el asiento: cuenta buena y lado malo, sale el texto del lado e «Iba aquí» en el lado; cuenta mala, el de su distractor", async () => {
  const m = await montar();
  try {
    for (const it of EN_ORDEN.slice(0, 3)) {
      await teclear(m.caja, it.correcta);
      await tocar(boton(m.caja, "Comprobar"));
      await tocar(avance(m.caja));
    }
    const it = EN_ORDEN[3];
    const [l1, l2, ...resto] = it.lineas;
    const en = (l, sel) => m.caja.querySelector(`[data-linea="${l.id}"] ${sel}`);
    await tocar(en(l1, `[data-cuenta="${l1.cuenta}"]`));
    await tocar(en(l1, `[data-lado="${otro(l1.lado)}"]`));
    await tocar(en(l2, `[data-cuenta="${l2.distractores[1].cuenta}"]`));
    await tocar(en(l2, `[data-lado="${l2.lado}"]`));
    for (const l of resto) { await tocar(en(l, `[data-cuenta="${l.cuenta}"]`)); await tocar(en(l, `[data-lado="${l.lado}"]`)); }
    await tocar(boton(m.caja, "Comprobar"));
    const bajo = (l) => [...m.caja.querySelectorAll(`[data-linea="${l.id}"] [data-l-retro]`)].map((p) => p.textContent);
    assert.deepEqual(bajo(l1), [l1.retro], "cuenta buena, lado malo: el texto del lado");
    assert.deepEqual(bajo(l2), [l2.distractores[1].retro], "cuenta mala: el texto de ese distractor");
    for (const l of resto) assert.deepEqual(bajo(l), []);
    assert.ok(!en(l1, `[data-cuenta="${l1.cuenta}"]`).classList.contains("mal"));
    assert.ok(en(l1, `[data-lado="${otro(l1.lado)}"]`).classList.contains("mal"));
    const iba = (l) => [...m.caja.querySelectorAll(`[data-linea="${l.id}"] [data-pastilla="revelada"]`)].map((p) => p.closest("button").dataset.cuenta ?? p.closest("button").dataset.lado);
    assert.deepEqual(iba(l1), [l1.cuenta, l1.lado]);
    assert.deepEqual(iba(l2), [l2.cuenta], "el lado estaba bien: sin «Iba aquí» en el lado");
    for (const p of m.caja.querySelectorAll('[data-pastilla="revelada"]')) {
      assert.equal(p.textContent, "Iba aquí");
      assert.ok(p.classList.contains("fae-b5h-revela"));
    }
    assert.equal(m.caja.querySelector("[data-mensaje]").textContent, "2 de 4 líneas al primer toque.");
  } finally {
    m.desmontar();
  }
});

test("★★ «Mira esto»: al entrar a un asiento, los cuatro renglones viajan a sus líneas (400 ms, 90 ms entre uno y otro); con movimiento reducido, no", async () => {
  const llamadas = [];
  const original = w.HTMLElement.prototype.animate;
  w.HTMLElement.prototype.animate = function (marcos, op) {
    llamadas.push({ texto: this.textContent, vuelo: this.dataset.vuelo, op, enLaPagina: this.isConnected });
    return { finished: new Promise(() => {}) };
  };
  try {
    for (const reducido of [false, true]) {
      movimientoReducido = reducido;
      llamadas.length = 0;
      const m = await montar();
      for (const it of EN_ORDEN.slice(0, 3)) {
        await teclear(m.caja, it.correcta);
        await tocar(boton(m.caja, "Comprobar"));
        await tocar(avance(m.caja));
      }
      const it = EN_ORDEN[3];
      if (reducido) {
        assert.deepEqual(llamadas, [], "con movimiento reducido, nada viaja");
        assert.equal(m.caja.querySelectorAll("[data-vuelo]").length, 0);
      } else {
        assert.deepEqual(llamadas.map((x) => x.vuelo), it.orden);
        assert.deepEqual(llamadas.map((x) => x.texto), it.orden.map((id) => pesos(it.lineas.find((l) => l.id === id).valor)));
        assert.deepEqual(llamadas.map((x) => [x.op.duration, x.op.delay]), [[400, 0], [400, 90], [400, 180], [400, 270]]);
        assert.ok(llamadas.every((x) => x.enLaPagina));
        for (const l of it.lineas) assert.equal(m.caja.querySelector(`[data-renglon="compra-${D.DONDE_H2[it.id].lineas[l.id]}"] [data-cifra]`).textContent, pesos(l.valor), l.id);
      }
      m.desmontar();
    }
  } finally {
    movimientoReducido = false;
    if (original) w.HTMLElement.prototype.animate = original; else delete w.HTMLElement.prototype.animate;
  }
});

test("★★ dialecto de Hacer: «Ítem n de 6», «Un intento», «Iba aquí» a los 0,7 s, sin «La respuesta es», sin emoji, teal y ámbar solo en los lados", async () => {
  assert.equal(B5.RETRASO_REVELA_MS, 700);
  assert.match(B5.CSS_B5H, /\.fae-b5h-revela \{ animation: fae-b5h-aparece 150ms [^}]* 700ms both; \}/);
  const m = await montar();
  try {
    assert.equal(m.caja.querySelector("[data-contador-intento] [data-un-intento]").textContent, "Un intento");
    assert.ok(!m.caja.textContent.includes("Tienes un solo intento"));
    assert.ok(m.caja.textContent.includes("Arma las dos facturas de La Ceiba y sus asientos."));
    await jugar(m, () => true);
  } finally {
    m.desmontar();
  }
  const sinComentarios = FUENTE.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
  assert.doesNotMatch(sinComentarios, /La respuesta es|Era: |\bCorrecta\b|\bRevisa\b/);
  assert.doesNotMatch(FUENTE, /[✅❌✔✘✗✓]/u);
  for (const linea of FUENTE.split("\n").filter((l) => /FAE\.teal|FAE\.ambar|#2A9D8F|#3FA69A|#E9C46A/i.test(l.replace(/\/\*[\s\S]*?\*\//g, "")))) {
    assert.match(linea, /\/\* lado \*\//, `teal o ámbar fuera de un lado: ${linea.trim()}`);
  }
  assert.match(F.CSS_C2F, /\.fae-c2f-lado\.debe \{ color: #3FA69A; \}/);
  assert.match(F.CSS_C2F, /\.fae-c2f-lado\.haber \{ color: #E9C46A; \}/);
  assert.match(F.CSS_C2F, /prefers-reduced-motion: reduce/);
});

test("★★ los ítems en el orden de la tabla; las líneas y su banco de cuentas, barajados en cada intento", () => {
  const revolver = (xs) => [...xs].sort(() => Math.random() - 0.5);
  const lineas = new Set();
  const bancos = new Set();
  for (let i = 0; i < 60; i++) {
    const p = L.prepararH2(revolver);
    assert.deepEqual(p.map((x) => x.id), D.ITEMS_H2.map((x) => x.id));
    lineas.add(p[3].orden.join());
    bancos.add(p[5].lineas.map((l) => l.banco.join()).join());
    for (const x of p) {
      if (x.tipo === "cifra") assert.equal(x, D.ITEMS_H2.find((y) => y.id === x.id), "una casilla no se baraja");
      else {
        assert.deepEqual([...x.orden].sort(), x.lineas.map((l) => l.id).sort());
        for (const l of x.lineas) assert.deepEqual([...l.banco].sort(), [l.cuenta, ...l.distractores.map((d) => d.cuenta)].sort());
      }
    }
  }
  assert.ok(lineas.size > 1, "las líneas no se barajan");
  assert.ok(bancos.size > 1, "los bancos no se barajan");
  assert.match(FUENTE, /useTanda\(\(\) => items \?\? prepararH2\(barajar\)\)/);
});

/* ═══════════ 5 · CATÁLOGO, VISTA, MIGRACIÓN, PANEL DOCENTE ═══════════ */

test("★★★ en T7-1, justo después de AP2: evaluativa, medio, 25 FP; las piezas de Aprender siguen sin FP", () => {
  assert.ok(actividadesDeTipo(TEMA, HACER).some((a) => a.id === D.H2_ID));
  const c = clasificacionDe("contabilidad", TEMA_T7_1, D.H2_ID);
  assert.deepEqual(c, { tipo: HACER, modalidad: "evaluativa", dificultad: "medio", fpBase: 25 });
  assert.equal(TEMA.actividades.find((a) => a.id === D.H2_ID).nombre, D.H2.nombre);
  for (const a of TEMA.actividades.filter((x) => x.clasificacion.tipo !== HACER)) assert.deepEqual(a.clasificacion, { tipo: APRENDER }, a.id);
  const ids = TEMA.actividades.map((x) => x.id);
  const antes = ids.includes("t7-1-que-cuenta-se-mueve") ? "t7-1-que-cuenta-se-mueve" : "t7-1-a2-la-factura-completa";
  assert.equal(ids.indexOf(D.H2_ID), ids.indexOf(antes) + 1);
});

test("★★★ la vista abre desde el camino exactamente lo que el catálogo ofrece, y registra con el motor compartido", () => {
  const ofrecidas = actividadesDeTipo(TEMA, HACER).filter((a) => !a.pendiente).map((a) => a.id).sort();
  assert.deepEqual(JUEGOS_T7_1.map((j) => j.id).sort(), ofrecidas);
  assert.equal(JUEGOS_T7_1.find((j) => j.id === D.H2_ID).Mecanica, ArmaLaFactura);
  assert.match(VISTA, /registrarActividadCompletada\(clas, \{\s*materiaId: MATERIA, temaId: TEMA_T7_1, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,/);
  assert.match(VISTA, /onCompletar=\{\(pct, ms, detalle\) => completar\(juego\.id, pct, ms, detalle\)\}/);
  assert.match(leer("src/App.jsx"), /<ContabilidadT7_1View modo=\{modoTema\} nodoInicial=\{ruta\.extra\}/);
});

test("★★★ la 0092: del rango de la célula, un insert aditivo y repetible, con su comprobación y sin correr", () => {
  assert.match(MIGRACION, /insert into public\.actividad_catalogo/);
  assert.match(MIGRACION, /\('t7-1-arma-la-factura',\s*'contabilidad',\s*'inventarios-periodico',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(MIGRACION, /on conflict \(activity_id\) do nothing;/);
  const sentencias = MIGRACION.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|update|delete|drop|truncate)\b/i);
  assert.match(sentencias, /select activity_id[\s\S]*where activity_id = 't7-1-arma-la-factura';/);
  const dir = new URL("supabase/migrations/", RAIZ);
  const conElId = readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(D.H2_ID));
  assert.deepEqual(conElId, ["0092_t7_1_arma_la_factura.sql"]);
  const n = Number(conElId[0].slice(0, 4));
  assert.ok(n >= 90 && n <= 109, `la ${conElId[0]} está fuera del rango 0090-0109`);
});

test("★★★ el panel docente: todo item_id que guarda la partida tiene etiqueta, leída de los datos (recortada a 70, como todas)", async () => {
  const m = await montar();
  try {
    await jugar(m, () => false);
    const ids = m.completados[0][2].map((d) => d.item);
    assert.equal(ids.length, 12);
    for (const id of ids) {
      const etiqueta = etiquetaDeItem(D.H2_ID, id);
      assert.ok(typeof etiqueta === "string" && etiqueta.trim() !== "", `${id}: sin etiqueta en el panel`);
      assert.equal(etiqueta, recortar(L.unidadDeH2(id)), id);
    }
  } finally {
    m.desmontar();
  }
  for (const it of D.ITEMS_H2) {
    if (it.tipo === "cifra") assert.equal(L.unidadDeH2(it.id), it.pregunta);
    else for (const l of it.lineas) assert.equal(L.unidadDeH2(L.idDeLinea(it, l)), `${l.cuenta} ${pesos(l.valor)}`);
  }
  const fuente = leer("src/docente/etiquetasItem.js");
  const bloque = fuente.slice(fuente.indexOf("CONTABILIDAD · T7 «INVENTARIOS»"));
  assert.match(bloque.slice(0, bloque.indexOf("});")), /"t7-1-arma-la-factura": \(id\) => unidadDeH2\(id\),/);
  for (const it of D.ITEMS_H2) assert.ok(!fuente.includes(it.pregunta), `${it.id}: la pregunta está copiada en etiquetasItem.js`);
});

/* ═══════════ 6 · LOTE 3: LOS DISTRACTORES DE NEAR ═══════════ */

const NEAR = conCorreccionesDeMello(leer("orquestador/conocimiento/paquetes/lote3-distractores-v1.md"));

test("★★★ lote 3: los cuatro cálculos van con casilla; los asientos, con banco de cuentas (la correcta y 2 distractores)", () => {
  assert.deepEqual(D.ITEMS_H2.map((x) => x.tipo), ["cifra", "cifra", "cifra", "asiento", "cifra", "asiento"]);
  assert.ok(NEAR.includes("| T7-1 H2 `t7-1-arma-la-factura` | 1 IVA ($512.000) · 2 retención ($112.000) · 3 lo que debe al proveedor ($3.600.000) · 5 lo que debe el cliente ($5.400.000) | — |"));
  for (const it of D.ITEMS_H2.filter((x) => x.tipo === "asiento")) for (const l of it.lineas) {
    assert.equal(l.distractores.length, 2, l.id);
    assert.ok(!l.distractores.some((d) => d.cuenta === l.cuenta), l.id);
    assert.equal(new Set(l.distractores.map((d) => d.cuenta)).size, 2, l.id);
  }
  assert.deepEqual(L.devolucionH2(item("iva-compra"), 1), { ok: false, correcta: 512_000, texto: "El 16 % de $3.200.000 es $512.000." });
  assert.equal(L.devolucionH2(item("debe-cliente"), 5_568_000).texto, "Falta restar la retención de $168.000. El IVA es $768.000 y la retención, $168.000.");
});

test("★★★ lote 3: cada distractor de cuenta es el de Near, letra por letra y en el orden de su tabla", () => {
  const filas = NEAR.split("\n").map((x) => x.match(/^\| `([^`]+)` \| (.+?) · ([DH]) · (\$[\d.]+)(?: · [\d.]+)? \| (.+?) \| «(.+)» \| [\d,]+ \|$/)).filter(Boolean);
  for (const it of D.ITEMS_H2.filter((x) => x.tipo === "asiento")) for (const l of it.lineas) {
    const deNear = filas.filter((m) => m[1].split(" ")[0] === it.id && m[2] === l.cuenta && m[3] === (l.lado === DEBE ? "D" : "H") && m[4] === pesos(l.valor)).map((m) => ({ cuenta: m[5], retro: m[6] }));
    assert.equal(deNear.length, 2, `${it.id} · ${l.id}: sus dos filas en el paquete`);
    assert.deepEqual(l.distractores, deNear, `${it.id} · ${l.id}`);
  }
});
