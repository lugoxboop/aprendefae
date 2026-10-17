import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 A2 «LA FACTURA COMPLETA» · PATRÓN DE ENGANCHE C3 SOBRE EL MOTOR C3
 * (LaFacturaCompletaC3.jsx + contabilidadT7_1_a2_c3.js).
 *
 *   · datos ↔ código de referencia de Watari corregido por Mello
 *     (correccionesMelloC3A2.mjs), letra por letra y en los dos sentidos
 *   · datos ↔ textos de Near en main (contabilidadT7_1_ap2.js), sin copiarlos
 *   · rótulos [W] ↔ los de Near (correccionesNearC3A2.mjs, «## A2»)
 *   · la factura, estado por estado, contra la referencia corregida
 *   · A2-1 y A2-2 reproducidos (§4 de Mello), la escalera en cada pregunta,
 *     el foco, movimiento reducido, B2 por pantalla, catálogo y vista
 *
 * PENDIENTES_NEAR: las pantallas que Near estaba reescribiendo (§5 de
 * Mello). Ya llegaron (c3-mello-near.md): la lista queda vacía y B2 ≤ 60 se
 * exige en todas, también con los estados del canon. Solo encoge.
 * ═══════════════════════════════════════════════════════════════════════════
 */
const PENDIENTES_NEAR = {};

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
let REDUCIDO = false;
w.matchMedia = (q) => ({ matches: REDUCIDO && /prefers-reduced-motion: reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia, NodeFilter: w.NodeFilter,
})) Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const RAIZ = new URL("../../../", import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), "utf8");

const MC = await import("./correccionesMelloC3A2.mjs");
const NR = await import("./correccionesNearC3A2.mjs");
const D = await import("../../data/contabilidadT7_1_a2_c3.js");
const MAIN = await import("../../data/contabilidadT7_1_ap2.js");
const MOTOR = await import("../../components/mecanicas/libros/t7/aprenderC3.jsx");
const { default: Factura, CSS_A2, PIEZA_A2 } = await import("../../components/mecanicas/libros/t7/LaFacturaCompletaC3.jsx");
const { default: Vieja } = await import("../../components/mecanicas/libros/t7/LaFacturaCompleta.jsx");
const C = await import("../canonEnganche.js");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");

const P = D.PIEZA_A2_C3;
const pant = (id, pieza = P) => pieza.pantallas.find((x) => x.id === id);
const MP = Object.fromEntries(MAIN.PIEZA_LA_FACTURA_COMPLETA.pantallas.map((x) => [x.id, x]));

/* ═══════════ LA REFERENCIA: el código de Watari, corregido, ejecutado ═══════════ */

const EXPONER = "window.C3A2.PANTALLAS = PANTALLAS;";
assert.equal(MC.A2_JS.split(EXPONER).length, 2, "la C3 cambió: no está la línea que expone PANTALLAS");
const conNear = (js) => NR.PARES_A2.reduce((t, [viejo, nuevo]) => { assert.equal(t.split(viejo).length, 2, `«${viejo}» no está una sola vez`); return t.replace(viejo, () => nuevo); }, js);
function ejecutar(js) {
  const window = {};
  new Function("window", "C3", js.replace(EXPONER, `${EXPONER} window.C3A2.REF = { factura, roles };`))(window, {});
  return window.C3A2;
}
const CRUDA = ejecutar(MC.A2_JS);
const REF = ejecutar(conNear(MC.referenciaCorregida()));
const refP = (id) => REF.PANTALLAS.find((x) => x.id === id);
const fragmento = (html) => { const t = document.createElement("template"); t.innerHTML = html; return t.content; };
const refFactura = (id, s) => fragmento(REF.REF.factura({ s: { fig: {}, resuelto: {}, intento: null, pista: false, ...s }, pastilla: () => "", reducido: () => true }, refP(id)));

/* ═══════════ MONTAR Y JUGAR ═══════════ */

async function montar(el = h(Factura, { rotulo: "INVENTARIOS I · APRENDER" })) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  const q = (s) => caja.querySelector(s);
  const clic = async (el2) => { assert.ok(el2, "no está lo que se iba a tocar"); await act(async () => { el2.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  const m = {
    caja, q, clic,
    seguir: () => clic(q(".c3-seguir")),
    op: (id) => clic(q(`[data-op="${id}"]`)),
    accion: (a) => clic(q(`[data-accion="${a}"]`)),
    rol: (r) => clic(q(`[data-rol="${r}"]`)),
    lado: (l) => clic(q(`.c3-lado[data-lado="${l}"]`)),
    msg: () => q("[data-c3-msg]").textContent,
    pantalla: () => q("[data-pieza]").dataset.pantalla,
    ren: (id) => q(`[data-ren="${id}"] b`)?.textContent,
    b2: () => C.medirTarjeta(C.tarjetaDe(caja), w).texto,
    desmontar: () => { act(() => raiz.unmount()); caja.remove(); },
  };
  /* Hasta una pantalla, resolviendo todo bien. */
  m.ir = async (id) => {
    while (m.pantalla() !== id) {
      const p = pant(m.pantalla());
      if (p.id === "dos-impuestos") { await m.accion("iva"); await m.accion("ret"); }
      if (p.id === "base-de-la-retencion") await m.op("sin-iva");
      if (p.tipo === "lados") for (const l of p.lineas) await m.lado(l.lado);
      if (p.id === "lado-a-lado") { await m.rol("venta"); await m.op(p.opciones.find((o) => o.correcta).id); }
      await m.seguir();
    }
  };
  return m;
}
const enFoco = (el, msg) => assert.ok(el && document.activeElement === el, `${msg}: el foco está en ${document.activeElement?.tagName}.${document.activeElement?.className}`);
const bloqueado = (m, si = true) => assert.equal(m.q(".c3-seguir").getAttribute("aria-disabled"), String(si));

/* ═══════════ 1 · LOS DATOS ═══════════ */

/* Lo que una pantalla dice, en la forma del código de Watari (texto y consigna van juntos en el lado a lado: M-1 los separa). */
const forma = (p) => {
  const lineas = p.lineas?.map((l) => ({ cuenta: l.cuenta, monto: l.monto, lado: l.lado, pista: l.pista, devolucion: l.devolucion }));
  const resuelto = p.resuelto && Object.fromEntries(Object.entries(p.resuelto).map(([k, v]) => [p.lineas.find((l) => l.id === k || l.cuenta === k).cuenta, v]));
  return JSON.parse(JSON.stringify({
    id: p.id, tipo: p.tipo, enFigura: p.enFigura, texto: [p.texto, p.consigna, p.pregunta].filter(Boolean).join(" "),
    pista: p.pista, opciones: p.opciones?.map((o) => ({ id: o.id, t: o.t, correcta: o.correcta, devolucion: o.devolucion })),
    bien: p.bien, porque: p.porque, lista: p.lista, siguiente: p.siguiente, boton: p.boton, pie: p.pie, lineas, resuelto,
  }));
};

/* La referencia de Watari con los textos del §5 de Near encima: la portada y, en el lado a lado, pregunta, opciones, pista y acierto. */
const T5 = NR.TEXTOS_NEAR_A2;
const conNear5 = (r) => {
  if (r.id === "portada") return { ...r, texto: T5.portada };
  if (r.id !== "lado-a-lado") return r;
  const consigna = NR.ROTULOS_NEAR_A2.consignaLadoALado;
  assert.ok(r.texto.startsWith(`${consigna} `), "Watari: la consigna abre el texto del lado a lado");
  return { ...r, texto: `${consigna} ${T5.pregunta}`, pista: T5.pista, bien: T5.acierto, opciones: r.opciones.map((o, i) => ({ ...o, t: T5.opciones[i] })) };
};

test("★★★ datos ↔ código de referencia de Watari (corregido) con el §5 de Near: pantalla por pantalla, letra por letra, en los dos sentidos", () => {
  assert.deepEqual(P.pantallas.map((p) => p.id), REF.PANTALLAS.map((p) => p.id));
  for (const [k, p] of P.pantallas.entries()) assert.deepEqual(forma(p), forma(conNear5(REF.PANTALLAS[k])), p.id);
  // Las correcciones de Mello no tocan PANTALLAS: la cruda dice lo mismo.
  assert.deepEqual(REF.PANTALLAS.map(forma), CRUDA.PANTALLAS.map(forma));
  // listo y antes, con el mismo comportamiento.
  const s = (fig) => ({ fig });
  for (const fig of [{}, { iva: true }, { iva: true, ret: true }]) assert.equal(Boolean(pant("dos-impuestos").listo(s(fig))), Boolean(refP("dos-impuestos").listo(s(fig))));
  for (const fig of [{}, { rol: "venta", vioRoles: true }]) assert.equal(Boolean(pant("lado-a-lado").antes(s(fig))), Boolean(refP("lado-a-lado").antes(s(fig))));
});

test("★★★ M-1: el lado a lado separa la consigna (la de Near y Mello) de la pregunta (la de main)", () => {
  const p = pant("lado-a-lado");
  assert.equal(p.texto, "");
  assert.equal(p.consigna, MC.M1_CONSIGNA);
  assert.equal(p.consigna, NR.ROTULOS_NEAR_A2.consignaLadoALado);
  assert.equal(p.pregunta, NR.TEXTOS_NEAR_A2.pregunta);
  assert.equal(`${p.consigna} ${p.pregunta}`, conNear5(refP("lado-a-lado")).texto);
});

test("★★★ datos ↔ main: los textos de Near salen de contabilidadT7_1_ap2.js, sin copias", () => {
  const src = leer("src/data/contabilidadT7_1_a2_c3.js");
  // Ningún texto de Near de main está escrito a mano en los datos nuevos.
  const deMain = [MP.portada.objetivo, ...Object.values(MP).flatMap((x) => [x.pista, x.pregunta, ...(x.opciones ?? []).flatMap((o) => [o.texto, o.devolucion]),
    ...(x.lineas ?? []).flatMap((l) => [l.pista, l.devolucion]), ...(x.acierto?.textos ?? []), ...(x.parrafos ?? []), x.siguiente])].filter((t) => t && t.split(" ").length > 3);
  assert.ok(deMain.length > 30);
  // (Salvo dentro de un recorte [R] de Watari, que es literal de su código: la pregunta de la base va en su texto.)
  const recortes = REF.PANTALLAS.map((r) => r.texto ?? "").filter((r) => !Object.values(MP).some((x) => [x.objetivo, x.consigna].includes(r)));
  for (const t of deMain) if (!recortes.some((r) => r.includes(t))) assert.ok(!src.includes(t), `copiado a mano: «${t.slice(0, 40)}…»`);
  // Y van tal cual en la pieza.
  {
    const id = "base-de-la-retencion";
    assert.equal(pant(id).pista, MP[id].pista);
    assert.deepEqual(pant(id).opciones.map((o) => [o.id, o.t, o.devolucion]), MP[id].opciones.map((o) => [o.id, o.texto, o.devolucion]));
    assert.equal(pant(id).bien, MP[id].acierto.textos[0]);
  }
  // En el lado a lado, de main quedan las devoluciones (Near: «Las dos devoluciones de main no cambian.»), con sus ids y la correcta.
  assert.deepEqual(pant("lado-a-lado").opciones.map((o) => [o.id, Boolean(o.correcta), o.devolucion]), MP["lado-a-lado"].opciones.map((o) => [o.id, o.correcta, o.devolucion]));
  for (const id of ["lados-de-la-compra", "la-venta"]) {
    assert.deepEqual(pant(id).lineas.map((l) => [l.pista, l.devolucion, l.lado]), MP[id].lineas.map((l) => [l.pista, l.devolucion, l.lado]));
    assert.deepEqual(pant(id).lineas.map((l) => `${l.cuenta} · ${l.monto == null ? "$?" : MOTOR.pesos(l.monto)}`), MP[id].lineas.map((l) => l.texto));
    assert.deepEqual(pant(id).lineas.map((l) => `${l.cuenta} · ${MOTOR.pesos(l.monto ?? pant(id).resuelto[l.id])}`), MP[id].lineas.map((l) => l.textoResuelto ?? l.texto));
    assert.equal(pant(id).bien, MP[id].acierto.textos[0]);
    assert.equal(pant(id).porque, MP[id].acierto.textos.slice(1).join(" "));
  }
  assert.equal(pant("lados-de-la-compra").texto, MP["lados-de-la-compra"].consigna);
  assert.deepEqual(pant("resumen").lista, MP.resumen.parrafos);
  assert.equal(pant("resumen").siguiente, MP.resumen.siguiente);
  for (const p of P.pantallas) assert.equal(p.pie, MP[p.id].pie, p.id);
  // Los recortes [R] de Watari: de la frase de main y su pregunta.
  const base = pant("base-de-la-retencion").texto;
  assert.ok(base.startsWith(MP["base-de-la-retencion"].enunciado.split(". La empresa")[0] + "."));
  assert.ok(base.endsWith(MP["base-de-la-retencion"].pregunta));
  assert.equal(P.id, MAIN.AP2_ID);
  assert.equal(P.titulo, MAIN.PIEZA_LA_FACTURA_COMPLETA.titulo);
  assert.equal(P.numero, MAIN.PIEZA_LA_FACTURA_COMPLETA.numero);
});

test("★★★ rótulos [W]: los de Near, letra por letra; los de Watari que Near cambia ya no salen", async () => {
  assert.deepEqual(D.ROTULOS_A2, NR.ROTULOS_NEAR_A2);
  for (const t of Object.values(D.ROTULOS_A2)) assert.ok(NR.A2.includes(`«${t}»`), t);
  // El ayudante falla si Near no trae la fila o trae otro número de textos.
  assert.throws(() => NR.fila("«No existe»", 1), /0 filas/);
  assert.throws(() => NR.fila("«Queda debiendo»", 1), /trae 2 textos/);
  assert.throws(() => NR.seccion("A9"), /no está/);
  // En la pieza jugada, cada rótulo de Near se ve (salvo «El cliente le debe a La Reventa»: la figura de la venta no tiene ese renglón).
  const vistos = new Set();
  const m = await montar();
  const mirar = () => { const t = m.caja.textContent; for (const [k, v] of Object.entries(D.ROTULOS_A2)) if (t.includes(v)) vistos.add(k); for (const x of ["Queda debiendo", "Factura · La Reventa compra", "Factura de la venta"]) assert.ok(!t.includes(x), x); };
  try {
    for (const id of P.pantallas.map((p) => p.id)) {
      await m.ir(id); mirar();
      if (id === "dos-impuestos") { await m.accion("iva"); await m.accion("ret"); mirar(); assert.equal(m.q("[data-dian] span").textContent, NR.ROTULOS_NEAR_A2.dian); }
      if (id === "lado-a-lado") { mirar(); await m.rol("venta"); mirar(); }
    }
    assert.deepEqual([...vistos].sort(), Object.keys(D.ROTULOS_A2).filter((k) => k !== "debeVenta").sort());
  } finally { m.desmontar(); }
});

/* ═══════════ 2 · LA FACTURA, ESTADO POR ESTADO, CONTRA LA REFERENCIA CORREGIDA ═══════════ */

const lectura = (raiz) => {
  const f = raiz.querySelector(".a2-factura");
  return {
    cab: [...f.querySelectorAll(".a2-fcab span")].map((x) => x.textContent),
    barra: [...f.querySelectorAll(".a2-barra i")].map((x) => x.className),
    ren: [...f.querySelectorAll(".a2-ren")].map((x) => [x.className, x.textContent]),
    dian: [f.querySelector(".a2-dian").className.replace(" llega", ""), f.querySelector(".a2-dian").textContent],
    tarifa: f.querySelector(".a2-tarifa").textContent,
    bases: [...f.querySelectorAll("[data-elige]")].map((x) => [x.dataset.elige, x.className, x.querySelector("span").textContent, x.getAttribute("aria-disabled")]),
  };
};

test("★★★ la factura, estado por estado, es la de la referencia corregida (A2-1, con los rótulos de Near)", async () => {
  const m = await montar();
  const igual = (id, s, que) => assert.deepEqual(lectura(m.caja), lectura(refFactura(id, s)), que);
  try {
    igual("portada", {}, "portada: la mercancía sola");
    assert.equal(m.ren("iva"), "—");
    await m.seguir();
    igual("dos-impuestos", {}, "pantalla 2 al llegar");
    bloqueado(m);
    assert.equal(m.q('[data-accion="ret"]').getAttribute("aria-disabled"), "true", "la retención espera al IVA");
    await m.accion("ret");
    igual("dos-impuestos", {}, "la retención no se descuenta antes del IVA");
    await m.accion("iva");
    igual("dos-impuestos", { fig: { iva: true } }, "con el IVA");
    bloqueado(m);
    await m.accion("ret");
    igual("dos-impuestos", { fig: { iva: true, ret: true } }, "con la retención: $? (A2-1)");
    assert.deepEqual([m.ren("retencion"), m.ren("total"), m.q("[data-dian] b").textContent], ["$?", "$?", "$?"]);
    bloqueado(m, false);
    await m.seguir();
    const fig = { iva: true, ret: true };
    igual("base-de-la-retencion", { fig }, "pantalla 3 al llegar");
    await m.op("con-iva");
    igual("base-de-la-retencion", { fig, intento: "con-iva" }, "1.er error");
    await m.op("solo-iva");
    igual("base-de-la-retencion", { fig, intento: "solo-iva", pista: true }, "2.º error");
    await m.op("sin-iva");
    igual("base-de-la-retencion", { fig, resuelto: { "base-de-la-retencion": true } }, "acierto");
    assert.deepEqual([m.ren("retencion"), m.ren("total"), m.q("[data-dian] b").textContent], ["$175.000", "$5.625.000", "$175.000"]);
  } finally { m.desmontar(); }
});

test("★★★ A2-1 (§4 de Mello): en la pantalla 3, el rótulo no dice «sin el IVA» y la retención está en `$?`", async () => {
  assert.ok(MC.PRUEBA_A2_1.includes("«sin el IVA»"));
  const m = await montar();
  try {
    await m.ir("base-de-la-retencion");
    const tarifa = () => m.q("[data-tarifa]").textContent;
    assert.ok(!tarifa().includes("sin el IVA"), tarifa());
    assert.equal(m.ren("retencion"), "$?");
    assert.equal(m.ren("total"), "$?");
    assert.equal(m.q("[data-dian] b").textContent, "$?");
    assert.ok(!m.caja.textContent.includes("175.000") && !m.caja.textContent.includes("5.625.000"));
    // Con los errores, tampoco.
    await m.op("con-iva"); await m.op("solo-iva");
    assert.ok(!tarifa().includes("sin el IVA"));
    assert.equal(m.ren("retencion"), "$?");
    // Con el acierto llegan las cifras, el rótulo completo y la retención cae a la Dirección de Impuestos.
    await m.op("sin-iva");
    assert.equal(tarifa(), `IVA 16 % y retención 3,5 %${MC.SIN_EL_IVA}. Tarifas del libro, no las de hoy.`);
    assert.equal(m.ren("retencion"), "$175.000");
    assert.ok(m.q("[data-dian]").classList.contains("llega"));
    // La referencia sin corregir sí lo delataba (lo que vio Mello).
    const crudaP = CRUDA.PANTALLAS.find((x) => x.id === "base-de-la-retencion");
    const cruda = fragmento(CRUDA.REF.factura({ s: { fig: { iva: true, ret: true }, resuelto: {}, intento: null, pista: false }, pastilla: () => "", reducido: () => true }, crudaP));
    assert.ok(cruda.querySelector(".a2-tarifa").textContent.includes("sin el IVA"));
  } finally { m.desmontar(); }
});

test("★★ pantalla 2: la retención cae a la Dirección de Impuestos con el botón (sin cifra), y no antes", async () => {
  const m = await montar();
  try {
    await m.seguir();
    assert.ok(!m.q("[data-dian]").classList.contains("on"));
    await m.accion("iva");
    assert.ok(!m.q("[data-dian]").classList.contains("llega"));
    await m.accion("ret");
    assert.ok(m.q("[data-dian]").classList.contains("on"));
    assert.ok(m.q("[data-dian]").classList.contains("llega"), MC.A2_1_PANTALLA_2);
    assert.equal(m.q('[data-accion="iva"]').getAttribute("aria-disabled"), "true");
    assert.equal(m.q('[data-accion="ret"]').getAttribute("aria-disabled"), "true");
    assert.equal(m.q(".c3-seguir").getAttribute("aria-disabled"), "false");
  } finally { m.desmontar(); }
});

/* ═══════════ 3 · LA ESCALERA Y EL FOCO ═══════════ */

test("★★★ la base (corchetes en la figura): pista, devolución con la correcta en blanco, acierto; foco al mensaje", async () => {
  const p = pant("base-de-la-retencion");
  const m = await montar();
  try {
    await m.ir(p.id);
    enFoco(m.q(".c3-txt"), "al seguir");
    assert.equal(m.q(".c3-txt").textContent, p.texto);
    assert.equal(m.q(".c3-op"), null, "las opciones son los corchetes de la figura, no una lista aparte");
    assert.deepEqual([...m.caja.querySelectorAll("[data-figura] [data-elige]")].map((b) => b.dataset.elige), ["sin-iva", "solo-iva", "con-iva"]);
    bloqueado(m);
    await m.op("con-iva");
    assert.ok(m.q('[data-elige="con-iva"]').classList.contains("mal"));
    assert.equal(m.q('[data-elige="con-iva"] [data-pastilla]').textContent, "No va aquí");
    assert.match(m.q('[data-elige="con-iva"]').getAttribute("aria-label"), /Incorrecto\.$/);
    assert.ok(m.msg().includes(p.pista));
    assert.ok(!m.msg().includes(p.opciones[1].devolucion));
    assert.equal(m.caja.querySelectorAll(".a2-base.pista").length, 0);
    enFoco(m.q("[data-c3-msg]"), "1.er error");
    bloqueado(m);
    await m.op("solo-iva");
    assert.ok(m.msg().includes(p.opciones.find((o) => o.id === "solo-iva").devolucion));
    assert.ok(!m.msg().includes(p.pista));
    assert.ok(m.q('[data-elige="sin-iva"]').classList.contains("pista"), "la correcta, en blanco");
    assert.ok(!m.caja.textContent.includes("Iba aquí"));
    enFoco(m.q("[data-c3-msg]"), "2.º error");
    await m.op("sin-iva");
    assert.ok(m.q('[data-elige="sin-iva"]').classList.contains("bien"));
    assert.equal(m.q('[data-elige="sin-iva"] [data-pastilla]').textContent, "Correcto");
    assert.equal(m.msg(), `Correcto. ${p.bien}`);
    for (const b of m.caja.querySelectorAll("[data-elige]")) assert.equal(b.getAttribute("aria-disabled"), "true");
    enFoco(m.q("[data-c3-msg]"), "acierto");
    bloqueado(m, false);
  } finally { m.desmontar(); }
});

for (const id of ["lados-de-la-compra", "la-venta"]) {
  test(`★★★ ${id}: cada línea con su escalera, el total en $? hasta el final, el porqué plegado`, async () => {
    const p = pant(id);
    const venta = id === "la-venta";
    const m = await montar();
    try {
      await m.ir(id);
      enFoco(m.q(".c3-txt"), "al seguir");
      assert.equal(m.q(".c3-txt").textContent, p.texto);
      assert.equal(m.q(".c3-t-tit").textContent, venta ? D.ROTULOS_A2.asientoVenta : D.ROTULOS_A2.asientoCompra);
      if (venta) assert.equal(m.q("[data-calc]").textContent, `${D.ROTULOS_A2.facturaVenta} · $2.000.000 + IVA $320.000 − retención $70.000`);
      else assert.equal(m.q("[data-calc]"), null);
      // Compras viene resuelta de AP1 en la compra; en la venta no hay nada antes.
      assert.equal(m.q('[data-ren="compras"]')?.textContent ?? null, venta ? null : `Compras${MOTOR.pesos(MAIN.COMPRAS_RESUELTA.monto)}`);
      for (const [k, l] of p.lineas.entries()) {
        const otro = l.lado === "debe" ? "haber" : "debe";
        assert.equal(m.q(".c3-ficha").dataset.linea, l.id);
        assert.equal(m.q(".c3-ficha").textContent, `${l.cuenta}${l.monto == null ? "$?" : MOTOR.pesos(l.monto)}`);
        bloqueado(m);
        await m.lado(otro);
        assert.ok(m.q(`.c3-lado[data-lado="${otro}"]`).classList.contains("mal"));
        assert.ok(m.msg().includes(l.pista), `${l.id}: pista`);
        enFoco(m.q("[data-c3-msg]"), `${l.id}: 1.er error`);
        await m.lado(otro);
        assert.ok(m.msg().includes(l.devolucion), `${l.id}: devolución`);
        assert.ok(m.q(`.c3-lado[data-lado="${l.lado}"]`).classList.contains("pista"));
        assert.ok(!m.caja.textContent.includes("Iba aquí"));
        await m.lado(l.lado);
        const ultima = k === p.lineas.length - 1;
        const ren = m.q(`.c3-lado[data-lado="${l.lado}"] [data-ren="${l.id}"]`);
        assert.ok(ren, `${l.id} cae en su lado`);
        assert.equal(ren.querySelector("b").textContent, MOTOR.pesos(l.monto ?? (ultima ? p.resuelto[l.id] : NaN)));
        if (!ultima) bloqueado(m);
      }
      assert.equal(m.msg(), `Correcto. ${p.bien}¿Por qué?`);
      bloqueado(m, false);
      const pq = m.q('[data-boton="por-que"]');
      assert.equal(pq.getAttribute("aria-expanded"), "false");
      await m.clic(pq);
      assert.equal(m.q("[data-porque]").textContent, p.porque);
      enFoco(m.q("[data-porque]"), "porqué abierto");
    } finally { m.desmontar(); }
  });
}

test("★★★ lado a lado: consigna hasta ver la venta; las dos fichas cruzan (mismos nodos, A2-2); escalera y acierto", async () => {
  const p = pant("lado-a-lado");
  const m = await montar();
  try {
    await m.ir(p.id);
    enFoco(m.q("[data-consigna]"), "sin texto, el foco va a la consigna");
    assert.equal(m.q("[data-consigna]").textContent, p.consigna);
    assert.equal(m.q("[data-pregunta]"), null);
    assert.equal(m.q(".c3-op"), null);
    bloqueado(m);
    // A2-2: el cruce es el del motor, con sus .c3-tile en borde de reposo.
    assert.ok(m.q(".c3-cruce.a2-cruce"));
    assert.equal(m.caja.querySelectorAll(".c3-tile").length, 2);
    assert.equal(m.caja.querySelectorAll(".a2-tile").length, 0);
    const [iva, ret] = ["iva", "ret"].map((k) => m.q(`[data-ficha="${k}"]`));
    const nombre = (k) => m.q(`[data-ficha="${k}"]`).textContent;
    assert.deepEqual([iva.classList.contains("der"), ret.classList.contains("der")], [false, true], "compra: IVA al debe, retención al haber");
    assert.deepEqual([nombre("iva"), nombre("ret")], ["IVA por pagar$800.000", "Retención en la fuente por pagar$175.000"]);
    assert.equal(m.q('[data-rol="compra"]').getAttribute("aria-pressed"), "true");
    await m.rol("compra");
    assert.equal(m.q("[data-pregunta]"), null, "tocar Compra no saca la pregunta");
    await m.rol("venta");
    assert.equal(m.q('[data-ficha="iva"]'), iva, "el nodo es el mismo: la ficha se desliza");
    assert.equal(m.q('[data-ficha="ret"]'), ret);
    assert.deepEqual([iva.classList.contains("der"), ret.classList.contains("der")], [true, false], "venta: cruzan");
    assert.deepEqual([nombre("iva"), nombre("ret")], ["IVA por pagar$320.000", "Anticipo fiscal$70.000"]);
    assert.equal(m.q('[data-rol="venta"]').getAttribute("aria-pressed"), "true");
    assert.equal(m.q("[data-consigna]").hidden, true);
    assert.equal(m.q("[data-pregunta]").textContent, p.pregunta);
    await m.rol("compra");
    assert.ok(m.q("[data-pregunta]"), "ya vista la venta, la pregunta se queda");
    const [bien, mal1, mal2] = [p.opciones.find((o) => o.correcta), ...p.opciones.filter((o) => !o.correcta)];
    await m.op(mal1.id);
    assert.ok(m.msg().includes(p.pista));
    enFoco(m.q("[data-c3-msg]"), "1.er error");
    await m.op(mal2.id);
    assert.ok(m.msg().includes(mal2.devolucion));
    assert.ok(m.q(`[data-op="${bien.id}"]`).classList.contains("pista"));
    await m.op(bien.id);
    assert.equal(m.msg(), `Correcto. ${p.bien}`);
    bloqueado(m, false);
  } finally { m.desmontar(); }
});

test("★★ resumen y fin: la lista de main, la siguiente y «Siguiente pieza»; la figura del lado a lado se queda", async () => {
  const m = await montar();
  try {
    await m.ir("resumen");
    const p = pant("resumen");
    assert.deepEqual([...m.caja.querySelectorAll(".c3-lista li")].map((l) => l.textContent), [...p.lista, p.siguiente]);
    assert.equal(m.q(".c3-seguir").textContent, MOTOR.INTERFAZ_C3.siguientePieza);
    assert.equal(m.q(".c3-seguir").dataset.boton, "siguiente-pieza");
    assert.equal(m.q(".c3-cejilla").textContent, "Pantalla 7 de 7");
    assert.ok(m.q(".c3-cruce"));
  } finally { m.desmontar(); }
});

test("★★ portada: el objetivo, «Empezar» y la factura dormida; al empezar, el foco va al texto", async () => {
  const m = await montar();
  try {
    assert.equal(m.pantalla(), "portada");
    assert.equal(m.q(".c3-txt").textContent, pant("portada").texto);
    assert.equal(m.q(".c3-seguir").textContent, "Empezar");
    assert.ok(m.q("[data-pieza]").classList.contains("dormida"));
    assert.equal(m.caja.querySelectorAll("[data-figura] button").length, 0);
    await m.seguir();
    enFoco(m.q(".c3-txt"), "al empezar");
    assert.equal(m.q(".c3-cejilla").textContent, "Pantalla 2 de 7");
  } finally { m.desmontar(); }
});

test("★★ movimiento reducido: la retención no cae animada, las líneas no caen y todo queda en su estado final", async () => {
  REDUCIDO = true;
  try {
    const m = await montar();
    try {
      await m.seguir(); await m.accion("iva"); await m.accion("ret");
      assert.ok(m.q("[data-dian]").classList.contains("on"));
      assert.ok(!m.q("[data-dian]").classList.contains("llega"));
      await m.seguir(); await m.op("sin-iva");
      assert.ok(!m.q("[data-dian]").classList.contains("llega"));
      assert.equal(m.ren("retencion"), "$175.000");
      await m.seguir(); await m.lado("debe");
      assert.equal(m.caja.querySelectorAll(".nuevo, .llega").length, 0);
      assert.match(CSS_A2, /@media \(prefers-reduced-motion: reduce\) \{ \.a2 \*, \.a2 \*::before, \.a2 \*::after \{ animation: none !important; transition: none !important; \} \}/);
    } finally { m.desmontar(); }
  } finally { REDUCIDO = false; }
});

/* ═══════════ 4 · B2 POR PANTALLA ═══════════ */

test("★★★ B2: ninguna pantalla pasa de 60 palabras visibles (PENDIENTES_NEAR, vacía)", async (t) => {
  assert.deepEqual(PENDIENTES_NEAR, {});
  const peor = {};
  const anotar = (m) => { const n = m.b2(); peor[m.pantalla()] = Math.max(peor[m.pantalla()] ?? 0, n); };
  for (const p of P.pantallas) {
    const m = await montar();
    try {
      await m.ir(p.id); anotar(m);
      if (p.id === "dos-impuestos") { await m.accion("iva"); anotar(m); await m.accion("ret"); anotar(m); }
      if (p.opciones) {
        if (p.antes) { await m.rol("venta"); anotar(m); }
        const malas = p.opciones.filter((o) => !o.correcta);
        await m.op(malas[0].id); anotar(m); await m.op(malas[1].id); anotar(m);
        await m.op(p.opciones.find((o) => o.correcta).id); anotar(m);
      }
      if (p.lineas) for (const l of p.lineas) { await m.lado(l.lado === "debe" ? "haber" : "debe"); anotar(m); await m.lado(l.lado === "debe" ? "haber" : "debe"); anotar(m); await m.lado(l.lado); anotar(m); }
    } finally { m.desmontar(); }
  }
  for (const [id, n] of Object.entries(peor)) t.diagnostic(`B2 ${id}: ${n}`);
  assert.deepEqual(Object.keys(peor), P.pantallas.map((p) => p.id));
  const pasan = Object.entries(peor).filter(([, n]) => n > C.UMBRAL_B2_PALABRAS).map(([id, n]) => `${id} (${n})`);
  assert.deepEqual(pasan, [], "B2 > 60");
  // N-3: la portada es una sola oración.
  assert.equal(pant("portada").texto.split(/[.!?](\s|$)/).filter((x) => x && x.trim()).length, 1);
});

test("★★★ B2 con los estados del canon (canonEnganche.estadosDePantalla, cada pantalla montada sola): 60 o menos en todas", async (t) => {
  const filas = [];
  for (const [k, p] of P.pantallas.entries()) {
    for (const { estado, pasos } of C.estadosDePantalla(p)) {
      const m = await montar(h(Factura, { pieza: { ...P, pantallas: P.pantallas.slice(k) }, rotulo: "PIEZA 1 DE 1" }));
      try {
        for (const sel of pasos) await m.clic(m.q(sel));
        filas.push([`${p.id} (${estado})`, m.b2()]);
      } finally { m.desmontar(); }
    }
  }
  for (const [e, n] of filas) t.diagnostic(`canon B2 ${e}: ${n}`);
  assert.ok(filas.some(([e]) => e === "lado-a-lado (al acertar)"), "el canon llega al acierto del lado a lado");
  assert.deepEqual(filas.filter(([, n]) => n > C.UMBRAL_B2_PALABRAS), []);
});

test("★★★ §5 de Near: los textos nuevos, letra por letra de c3-mello-near.md, en los dos sentidos", () => {
  const T = D.TEXTOS_A2;
  assert.deepEqual({ ...T, opciones: Object.values(T.opciones) }, NR.TEXTOS_NEAR_A2);
  assert.deepEqual(Object.keys(T.opciones), MP["lado-a-lado"].opciones.map((o) => o.id), "en el orden de main: la correcta primero");
  for (const x of [T.portada, T.pregunta, T.pista, T.acierto, ...Object.values(T.opciones)]) assert.ok(NR.NEAR_5.includes(`«${x}»`), x);
  // Son nuevos de verdad: ninguno es el de main.
  const viejo = MP["lado-a-lado"];
  assert.notEqual(T.portada, MP.portada.objetivo);
  assert.notEqual(T.pregunta, viejo.pregunta);
  assert.notEqual(T.pista, viejo.pista);
  assert.notEqual(T.acierto, viejo.acierto.textos[0]);
  for (const o of viejo.opciones) assert.notEqual(T.opciones[o.id], o.texto);
  // El ayudante falla si Near cambia la tabla.
  assert.throws(() => NR.campo("Campo que no existe", NR.LADO_A_LADO_A2), /no está/);
  assert.throws(() => NR.seccion("A2 · lado a lado", "# nada"), /no está/);
});

/* ═══════════ 5 · CATÁLOGO, VISTA Y CÓDIGO ═══════════ */

test("★★★ catálogo: fuera de FP, mismo id, en T7-1 después de A1; sin migraciones", () => {
  const tema = SUBJECTS.contabilidad.topics.find((x) => x.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === P.id);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const ids = tema.actividades.map((x) => x.id);
  assert.equal(ids.indexOf(P.id), ids.indexOf("t7-1-a1-la-cuenta-que-no-se-mueve") + 1);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(P.id)), []);
  for (const f of ["src/components/mecanicas/libros/t7/LaFacturaCompletaC3.jsx", "src/data/contabilidadT7_1_a2_c3.js"]) {
    assert.doesNotMatch(leer(f), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});

test("★★★ vista: T7-1 pinta la pieza C3 en el lugar de A2; la vieja ya no la pinta nadie", () => {
  const ids = PIEZAS_T7_1.map((x) => x.pieza.id);
  assert.equal(ids.indexOf(P.id), 1);
  assert.equal(ids.indexOf(P.id), ids.indexOf("t7-1-a1-la-cuenta-que-no-se-mueve") + 1);
  const e = PIEZAS_T7_1.find((x) => x.pieza.id === P.id);
  assert.equal(e.Pieza, Factura);
  assert.equal(e.pieza, P);
  assert.ok(!PIEZAS_T7_1.some((x) => x.Pieza === Vieja || x.pieza === MAIN.PIEZA_LA_FACTURA_COMPLETA));
  const vista = leer("src/components/ContabilidadT7_1View.jsx");
  assert.ok(!vista.includes("LaFacturaCompleta.jsx") && !vista.includes("contabilidadT7_1_ap2.js"));
});

test("★★ montada como en la vista: rótulo y título en la cabecera del Panel; el motor C3 y su hoja", async () => {
  const m = await montar(h(Factura, { pieza: P, rotulo: "INVENTARIOS I · APRENDER" }));
  try {
    const s = m.q("section");
    assert.equal(s.querySelector("header h3").textContent, P.titulo);
    assert.equal(s.querySelector("header p").textContent, "INVENTARIOS I · APRENDER");
    assert.ok(m.q(`[data-pieza="${P.id}"][data-pantalla="portada"].c3.a2`));
    assert.ok([...m.caja.querySelectorAll("style")].some((x) => x.textContent.includes(".a2-factura")));
    assert.ok(s.querySelector("style").textContent.includes(".c3-tile"));
    assert.equal(PIEZA_A2.figura.name, "figura");
  } finally { m.desmontar(); }
});

test("★★ el código: sin teal ni ámbar, letra ≥ 12 px, botones de 44 px, nada interno en pantalla, sin «Iba aquí»", async () => {
  const src = leer("src/components/mecanicas/libros/t7/LaFacturaCompletaC3.jsx");
  const sinComentarios = src.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(sinComentarios, /Iba aquí|REVELADA|#3FA69A|#E9C46A|teal|ambar/i);
  for (const [, px] of CSS_A2.matchAll(/(?:font-size:\s*|font: \d+ )(\d+(?:\.\d+)?)px/g)) assert.ok(Number(px) >= 12, `letra de ${px} px`);
  assert.equal([...CSS_A2.matchAll(/(?:font-size:\s*|font: \d+ )(\d+(?:\.\d+)?)px/g)].length, 7, "todas las letras medidas");
  assert.match(CSS_A2, /\.a2-base \{ min-height: 44px;/);
  assert.match(CSS_A2, /\.a2-accion, \.a2-rol \{ min-height: 44px; \}/);
  for (const p of P.pantallas) for (const x of p.opciones ?? []) assert.equal(x.texto, x.t, "texto (main) y t (motor), la misma cadena");
  assert.doesNotMatch(CSS_A2, /\.a2-tile|\.a2-roles|\.a2-cruce \{/, "A2-2: el cruce y el selector son los del motor");
  assert.ok(MC.cssCorregido().includes(".a2-tile { display: grid; gap: 2px; padding: 8px 10px; border: var(--reposo);"), MC.A2_2_BORDE);
  assert.ok(MC.A2_2_CRUCE.includes("C3.cruce"));
  assert.match(sinComentarios, /<C3\.cruce /);
  const m = await montar();
  try {
    const textos = [];
    for (const id of P.pantallas.map((p) => p.id)) { await m.ir(id); const c = m.caja.cloneNode(true); for (const x of c.querySelectorAll("style")) x.remove(); textos.push(c.textContent); }
    for (const x of ["Near", "Mello", "Watari", "[R]", "[W]", "PENDIENTE", "ESCRITO POR CLAUDE", "interno"]) assert.ok(!textos.join(" ").includes(x), x);
  } finally { m.desmontar(); }
});

test("★★ los ayudantes fallan si la fuente cambia", () => {
  assert.throws(() => MC.referenciaCorregida(MC.A2_JS.replace("const esc = 5800000;", "const esc = 5800001;")), /MISA §4/);
  assert.throws(() => MC.referenciaCorregida(MC.A2_JS.replace("<span>Queda debiendo</span>", "<span>Queda</span>")), /A2-1/);
  assert.throws(() => MC.cssCorregido(MC.A2_CSS.replace("border: 2px solid var(--texto); border-radius: 8px; background: #1F2D3D", "border: 1px")), /A2-2/);
  assert.throws(() => MC.deMello("Mello nunca escribió esto"), /0 veces/);
  assert.deepEqual(MC.NO_APLICADAS, {});
});
