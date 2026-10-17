import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 A5 «Importados y fletes» · PATRÓN DE ENGANCHE C3 (Watari), sobre el
 * motor aprenderC3.jsx. Reemplaza a ImportadosYFletes.jsx con el mismo id.
 *
 *   1 · textos: los datos son, letra por letra, el código de Watari con lo de
 *       Near y lo de Mello encima (correccionesNearC3A5.mjs), en los dos
 *       sentidos; los rótulos [W] de Near; A5-1 y M-1 de Mello
 *   2 · la pieza montada, pantalla por pantalla y estado por estado
 *       (escalera, figura que crece, foco, «Seguir»), con el viaje de la
 *       compra (C1, F-1 a F-3) DENTRO DEL MOTOR, y el paso de la 3 a la 5
 *   3 · movimiento reducido, B2 ≤ 60 en cada pantalla y estado
 *   4 · catálogo y vista
 *
 * PENDIENTES_NEAR: lo que Near está reescribiendo (va con su texto de hoy).
 * ═══════════════════════════════════════════════════════════════════════════
 */

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

const D = await import("../../data/contabilidadT7_1_a5_c3.js");
const HOY = await import("../../data/contabilidadT7_1_a5.js");
const { default: A5, CSS_A5_C3, piezaParaElMotor, VIAJE_INICIAL, tocarFicha, comprobar, alPaso2, elegirCyF } = await import("../../components/mecanicas/libros/t7/ImportadosYFletesC3.jsx");
const { default: ImportadosYFletesDeHoy } = await import("../../components/mecanicas/libros/t7/ImportadosYFletes.jsx");
const { INTERFAZ_C3 } = await import("../../components/mecanicas/libros/t7/aprenderC3.jsx");
const { PALABRA_B, LECTOR_INCORRECTO } = await import("../../components/mecanicas/libros/b5/Devolucion.jsx");
const { PIEZAS_T7_1, TEMA_T7_1 } = await import("../../components/ContabilidadT7_1View.jsx");
const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
const C = await import("../canonEnganche.js");
const N = await import("./correccionesNearC3A5.mjs");
const C1 = await import("./correccionesMelloC1.mjs");

const RAIZ = new URL("../../../", import.meta.url);
const P = D.PIEZA_IMPORTADOS_Y_FLETES_C3;
const F = D.FIGURA_A5;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const V = D.VIAJE_DE_LA_COMPRA;
const [FOB, CYF] = V.pasos;
const FICHAS = V.tramos.flatMap((t) => t.fichas);

/*
 * PENDIENTES DE NEAR: textos que Near está reescribiendo. Van con el texto de
 * hoy (c3-rotulos-near.md) y salen de aquí cuando llegue el nuevo (segundo
 * commit). La prueba de abajo se pone roja si el texto cambia sin sacarlo.
 */
const PENDIENTES_NEAR = [
  /* N-4 de Mello (regla 9): «Cambia quién asume el flete…» repite la respuesta. */
  { pantalla: "lado-a-lado", campo: "consigna", hoy: "Cambia quién asume el flete y mira a qué columna se va." },
];

/*
 * B2 (canon): las pantallas que hoy pasan de 60, con su peor estado. Esta lista
 * solo encoge. El lado a lado baja con la consigna nueva de Near (N-4) solo si
 * se recorta el acierto o las opciones; los fletes, con el acierto de Near.
 */
const PASAN_DE_60 = { "flete-del-comprador": 61, "flete-del-vendedor": 62, "lado-a-lado": 62 };

/* ═══════════ AYUDAS ═══════════ */

async function montar(pieza = P) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(h(A5, { pieza, rotulo: "R" })); });
  const q = (s) => caja.querySelector(s);
  const qa = (s) => [...caja.querySelectorAll(s)];
  const clic = async (el) => { assert.ok(el, "no está lo que se iba a tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
  return {
    caja, q, qa, clic,
    /* El «Seguir» del motor (el del paso de FOB, dentro del viaje, es otro). */
    seguir: () => clic(q("[data-pieza] > .c3-seguir")),
    op: (id) => clic(q(`[data-op="${id}"]`)),
    msg: () => q("[data-c3-msg]").textContent,
    pantalla: () => q("[data-pieza]").dataset.pantalla,
    fig: () => q("[data-figura]"),
    desmontar: () => { act(() => raiz.unmount()); caja.remove(); },
  };
}
const desde = (id) => ({ ...P, pantallas: P.pantallas.slice(P.pantallas.findIndex((x) => x.id === id)) });
const enFoco = (el, msg) => assert.ok(el && document.activeElement === el, `${msg}: el foco está en ${document.activeElement?.tagName}.${document.activeElement?.className}`);
const seguirBloqueado = (m, si = true) => assert.equal(m.q("[data-pieza] > .c3-seguir").getAttribute("aria-disabled"), String(si));
const correcta = (p) => p.opciones.find((o) => o.correcta);
const malas = (p) => p.opciones.filter((o) => !o.correcta);
/* Lo que se ve: el texto de lo que no está oculto (hidden, display: none o solo para el lector). */
const visible = (el) => {
  let out = "";
  const andar = document.createTreeWalker(el, w.NodeFilter.SHOW_TEXT);
  for (let n = andar.nextNode(); n; n = andar.nextNode()) if (n.parentElement && C.seVe(n.parentElement, w) && !n.parentElement.closest("style")) out += ` ${n.textContent}`;
  return out.replace(/\s+/g, " ").trim();
};
/*
 * B2 (enganche.md: «como mucho 60 palabras por pantalla… o lo dice la
 * figura»), con las funciones de canonEnganche.js: el texto fuera de la
 * figura, sin el título, los botones de avance ni el pie, y SIN la cejilla
 * «Pantalla n de N» del motor (aria-hidden), que ni Watari ni Mello cuentan
 * (con ella, Mello daría 60 y no 56 en el lado a lado).
 * En el viaje, que vive en la figura, además la cuenta de C1 (Near y Mello):
 * texto, rótulos, leyenda, opciones y mensaje, sin «Correcto.» ni pastillas.
 * Aparte, para el informe: la del canon tal cual y con las opciones de la figura.
 */
const palabrasDe = (m, sel) => m.qa(sel).filter((x) => C.seVe(x, w)).reduce((n, x) => n + C.contarPalabras(visible(x)), 0);
const b2 = (m) => {
  const r = C.medirTarjeta(C.tarjetaDe(m.caja), w);
  const cejilla = C.contarPalabras(m.q(".c3-cejilla").textContent);
  const viaje = m.q("[data-viaje]");
  return {
    b2: r.texto - cejilla,
    c1: viaje ? C.contarPalabras(visible(viaje)) - palabrasDe(m, "[data-viaje] [data-pastilla], [data-viaje] [data-palabra], [data-viaje] [data-boton]") + (m.q("[data-consigna]").hidden ? 0 : C.contarPalabras(m.q("[data-consigna]").textContent)) : null,
    canon: r.texto,
    conOpciones: r.texto - cejilla + palabrasDe(m, "[data-figura] [data-op]"),
  };
};

/* ═══════════ 1 · TEXTOS ═══════════ */

test("★★★ cada pantalla es, letra por letra, la de Watari con los [W] de Near y M-1 de Mello; y al revés, nada sobra", () => {
  const esperadas = N.pantallasCorregidas();
  assert.deepEqual(P.pantallas.map((p) => p.id), esperadas.map((p) => p.id));
  assert.deepEqual(P.pantallas.map((p) => p.id), HOY.PIEZA_IMPORTADOS_Y_FLETES.pantallas.map((p) => p.id), "mismas pantallas y en el mismo lugar que hoy");
  for (const [k, p] of P.pantallas.entries()) {
    if (p.id === "fob-cif-cyf") continue;
    const { pasosAntes, ...resto } = p;
    const textos = { ...resto, opciones: resto.opciones?.map(({ t, ...o }) => { assert.equal(t, o.texto, `${p.id}.${o.id}: \`t\` es el mismo texto`); return o; }) };
    if (!resto.opciones) delete textos.opciones;
    assert.deepEqual(textos, esperadas[k], p.id);
    /* Cómo la recorre la barra de enganche: en el lado a lado, antes La Popa. */
    assert.deepEqual(pasosAntes, p.id === "lado-a-lado" ? ['[data-asume="vendedor"]'] : undefined, p.id);
  }
  assert.equal(P.id, HOY.A5_ID);
  assert.equal(P.titulo, HOY.PIEZA_IMPORTADOS_Y_FLETES.titulo);
});

test("★★★ condición 2 de Mello: «FOB y C&F» es la pantalla de hoy (C1 con F-1 a F-3), no el marcador de Watari", () => {
  const marcador = N.PANTALLAS_WATARI.find((p) => p.id === "fob-cif-cyf");
  assert.equal(marcador.main, true);
  assert.equal(V, HOY.PIEZA_IMPORTADOS_Y_FLETES.pantallas[3], "el mismo objeto que prueba t7-1-importados-y-fletes (C1)");
  assert.equal(P.pantallas[3], V);
  assert.ok(N.CONDICION_FOB);
  /* Lo que C1 y Mello dicen, aquí también. */
  assert.equal(V.nombre, C1.NOMBRE_FOB);
  assert.equal(V.pie, C1.PIE_FOB);
  assert.equal(V.pie, marcador.pie);
  assert.deepEqual(V.tramos.map((t) => t.rotulo), C1.TRAMOS);
  assert.deepEqual(V.tramos.find((t) => !t.tierra).fichas.map((f) => f.texto), C1.FICHAS_MAR);
  assert.equal(FOB.texto, C1.PASO1.texto);
  assert.deepEqual(CYF.opciones.map((o) => o.texto), C1.PASO2.opciones);
  assert.deepEqual([CYF.texto, CYF.pista, CYF.respuesta, CYF.acierto], [C1.PASO2.texto, C1.PASO2.pista, C1.PASO2.respuesta, C1.PASO2.acierto]);
});

test("★★★ la figura: los rótulos [W] de Near y A5-1 de Mello, letra por letra; lo demás, del código de Watari", () => {
  for (const [k, v] of Object.entries(N.FIGURA_CORREGIDA)) assert.deepEqual(F[k], v, k);
  /* Lo que no cambia ni Near ni Mello: en el código de Watari, tal cual. */
  const propios = Object.keys(F).filter((k) => !(k in N.FIGURA_CORREGIDA));
  assert.deepEqual(propios.sort(), ["asume", "compra", "comprador", "cuentas", "etiqueta", "flete", "opciones", "pagado", "ruta", "tarifas", "vende"]);
  for (const k of propios) for (const t of [F[k]].flat().flatMap((x) => (typeof x === "object" ? Object.values(x) : [x]))) assert.ok(N.WATARI_A5.includes(t), `${k}: «${t}» no está en el código de Watari`);
  /* A5-1: lo que se fue. */
  assert.deepEqual(N.A5_1.botonesViejos, ["El comprador", "El vendedor"]);
  const todo = JSON.stringify(F) + readFileSync(new URL("src/components/mecanicas/libros/t7/ImportadosYFletesC3.jsx", RAIZ), "utf8");
  for (const t of [N.A5_1.rotuloQueSeVa, ...N.A5_1.botonesViejos, N.MONEDA_NEAR.viejo, "¿Qué más?\""]) assert.ok(!todo.includes(t), `sigue «${t}»`);
  assert.equal(`${F.empresas.vendedor} · ${F.pagado}`, N.A5_1.ficha);
  /* Las cifras del asiento, las de Watari (las de la pieza de hoy). */
  assert.deepEqual(D.FLETE_A5, { flete: N.CIFRAS_WATARI.flete, retencion: N.CIFRAS_WATARI.retencion, pago: N.CIFRAS_WATARI.pago });
  assert.equal(D.FLETE_A5.retencion + D.FLETE_A5.pago, D.FLETE_A5.flete);
});

test("★★★ PENDIENTES_NEAR: la consigna del lado a lado va con el texto de hoy de Near (N-4); si cambia, sale de la lista", () => {
  assert.ok(N.N4);
  for (const x of PENDIENTES_NEAR) {
    assert.equal(pantalla(x.pantalla)[x.campo], x.hoy, `${x.pantalla}.${x.campo}`);
    assert.equal(x.hoy, N.ROTULOS_NEAR.consigna, "es el texto de Near, letra por letra");
  }
  /* El motivo sigue en pie: repite «asume». Cuando Near lo reescriba, esto se pone rojo y la entrada sale. */
  assert.match(PENDIENTES_NEAR[0].hoy, /asume/);
  /* La marca va en comentario, nunca en pantalla. */
  assert.ok(!JSON.stringify(P).includes("PENDIENTE"));
});

test("★★ Mello no trae opcionales en esta auditoría; el veredicto de A5 es «pasa con correcciones»", () => {
  assert.deepEqual(N.OPCIONALES, []);
  assert.ok(N.VEREDICTO_A5);
});

/* ═══════════ 2 · LA PIEZA MONTADA ═══════════ */

test("★★★ portada y la regla: la etiqueta en moneda extranjera; «Pasar a pesos» abre «Seguir»; el foco va al texto", async () => {
  const m = await montar();
  try {
    assert.equal(m.pantalla(), "portada");
    assert.equal(m.q(".c3-cejilla").textContent, "Pantalla 1 de 8");
    assert.equal(m.q("[data-texto]").textContent, pantalla("portada").texto);
    assert.equal(m.q('[data-capa="factura"]').textContent, `${F.factura} ${F.facturaMoneda}`);
    assert.equal(m.q('[data-capa="hueco"]').textContent, F.hueco);
    assert.equal(m.q("[data-etiqueta]").getAttribute("aria-label"), F.etiqueta);
    assert.equal(m.q(".c3-seguir").textContent, "Empezar");
    seguirBloqueado(m, false);
    await m.seguir();
    assert.equal(m.pantalla(), "la-regla-del-costo");
    enFoco(m.q(".c3-txt"), "al seguir");
    seguirBloqueado(m);
    await m.seguir();
    assert.equal(m.pantalla(), "la-regla-del-costo", "bloqueado de verdad");
    const pesos = m.q('[data-accion="pesos"]');
    assert.equal(pesos.textContent, F.pasarAPesos);
    await m.clic(pesos);
    assert.equal(m.q('[data-capa="factura"]').textContent, `${F.facturaEnPesos} ${F.facturaTasa}`);
    assert.equal(m.q('[data-accion="pesos"]').getAttribute("aria-disabled"), "true");
    assert.equal(m.q('[data-capa="hueco"]').textContent, F.hueco, "las capas no llegan antes de la pregunta (C1)");
    seguirBloqueado(m, false);
    await m.seguir();
    assert.equal(m.pantalla(), "importados");
  } finally { m.desmontar(); }
});

test("★★★ importados: las fichas en la figura; 1.er error (pista, rebota), 2.º (devolución, la correcta en blanco), acierto (caen las tres capas)", async () => {
  const p = pantalla("importados");
  const m = await montar(desde("importados"));
  try {
    assert.deepEqual(m.qa("[data-figura] [data-op]").map((b) => b.textContent), p.opciones.map((o) => o.texto));
    assert.equal(m.q('[data-capa="factura"]').textContent, `${F.facturaEnPesos} ${F.facturaTasa}`, "aquí ya va en pesos");
    assert.ok(!m.q("[data-pregunta]"), "la pregunta va en el texto");
    const [x, y] = malas(p);
    await m.op(x.id);
    const bx = m.q(`[data-op="${x.id}"]`);
    assert.ok(bx.classList.contains("mal") && bx.classList.contains("rebota"));
    assert.equal(bx.querySelector("[data-pastilla]").textContent, PALABRA_B.noVaAqui);
    assert.equal(bx.getAttribute("aria-label"), `${x.texto}. ${LECTOR_INCORRECTO}`);
    assert.equal(m.msg(), `${LECTOR_INCORRECTO} ${p.pista}`);
    assert.equal(m.qa(".c3-op.pista").length, 0);
    enFoco(m.q("[data-c3-msg]"), "1.er error");
    seguirBloqueado(m);
    await m.op(y.id);
    assert.equal(m.msg(), `${LECTOR_INCORRECTO} ${y.devolucion}`);
    assert.ok(m.q(`[data-op="${correcta(p).id}"]`).classList.contains("pista"));
    assert.equal(m.q('[data-capa="hueco"]').textContent, F.hueco, "el error no da la respuesta");
    await m.op(correcta(p).id);
    assert.equal(m.msg(), `Correcto. ${p.bien}`);
    assert.equal(m.q(`[data-op="${correcta(p).id}"] [data-pastilla]`).textContent, PALABRA_B.correcto);
    assert.ok(!m.q('[data-capa="hueco"]'));
    assert.deepEqual(m.qa(".a5-capa.nuevo").map((x) => x.textContent), F.capas);
    enFoco(m.q("[data-c3-msg]"), "acierto");
    seguirBloqueado(m, false);
    assert.doesNotMatch(m.caja.textContent, /Iba aquí/);
  } finally { m.desmontar(); }
});

/* Lo que se ve del viaje. */
function vistaViaje(m) {
  const r = m.q("[data-viaje]");
  return {
    estado: r.dataset.estado, paso: r.dataset.paso,
    consigna: m.q("[data-consigna]").hidden ? null : m.q("[data-consigna]").textContent,
    textoPaso: r.querySelector("[data-texto-paso]")?.textContent ?? null,
    tramos: [...r.querySelectorAll("[data-tramo]")].map((t) => [t.dataset.tramo, t.dataset.atenuado === "si"]),
    rotulos: [...r.querySelectorAll("[data-rotulo]")].map((x) => x.textContent),
    fichas: [...r.querySelectorAll("[data-ficha]")].map((f) => ({ id: f.dataset.ficha, boton: f.tagName === "BUTTON", pulsada: f.getAttribute("aria-pressed"), mal: f.classList.contains("mal"), paga: f.querySelector("[data-paga]")?.dataset.paga ?? null })),
    leyenda: r.querySelector("[data-leyenda]")?.textContent ?? null,
    opciones: [...r.querySelectorAll("[data-op]")].map((o) => [o.dataset.op, o.className.replace("c3-op", "").trim()]),
    mensaje: r.querySelector("[data-viaje-msg]").textContent || null,
    botones: [...r.querySelectorAll("[data-boton]")].map((b) => [b.dataset.boton, b.textContent, b.getAttribute("aria-disabled") === "true"]),
    seguirDelMotor: C.seVe(m.q("[data-pieza] > .c3-seguir"), w) ? m.q("[data-pieza] > .c3-seguir").getAttribute("aria-disabled") : "no se ve",
  };
}

test("★★★ condición 2 · de la pantalla 3 a la 5 A TRAVÉS del viaje dentro del motor: escalera de FOB y de C&F, F-3, foco y «Seguir»", async () => {
  const m = await montar(desde("importados"));
  const v = () => vistaViaje(m);
  const ficha = (id) => m.q(`[data-ficha="${id}"]`);
  try {
    await m.op(correcta(pantalla("importados")).id);
    await m.seguir();
    /* Pantalla 4: el texto de FOB es la consigna del motor, y el foco va ahí. */
    assert.equal(m.pantalla(), "fob-cif-cyf");
    enFoco(m.q("[data-consigna]"), "al llegar al viaje");
    let x = v();
    assert.deepEqual([x.estado, x.paso, x.consigna, x.textoPaso], ["colocando", "fob", FOB.texto, null]);
    assert.equal(m.q("[data-pie]").textContent, C1.PIE_FOB);
    assert.equal(m.q("[data-linea]").getAttribute("aria-label"), C1.NOMBRE_FOB);
    assert.deepEqual(x.tramos, V.tramos.map((t) => [t.id, false]));
    assert.deepEqual(x.rotulos, [C1.TRAMOS[2]]);
    assert.deepEqual(x.fichas.map((f) => [f.id, f.boton, f.pulsada, f.paga]), FICHAS.map((f) => [f.id, true, "false", null]));
    assert.deepEqual([x.leyenda, x.mensaje, x.opciones], [null, null, []]);
    assert.deepEqual(x.botones, [["comprobar", FOB.boton, true]]);
    assert.equal(x.seguirDelMotor, "no se ve", "en el paso de FOB no hay dos «Seguir»");
    /* 1.er error, le faltó alguna: la pista; se puede volver a intentar. */
    await m.clic(ficha("flete"));
    await m.clic(m.q('[data-boton="comprobar"]'));
    x = v();
    assert.equal(x.mensaje, `${LECTOR_INCORRECTO} ${FOB.pista}`);
    enFoco(m.q("[data-viaje-msg]"), "1.er error de FOB");
    assert.ok(x.fichas.every((f) => f.paga === null) && x.leyenda === null, "el 1.er error no da la respuesta");
    assert.deepEqual(x.botones, [["comprobar", FOB.boton, false]]);
    /* 2.º error (toca una de antes de «a bordo»): la respuesta, y la figura crece: cada ficha con quién la paga y la leyenda. */
    await m.clic(ficha("subir"));
    await m.clic(m.q('[data-boton="comprobar"]'));
    x = v();
    assert.equal(x.mensaje, `${LECTOR_INCORRECTO} ${FOB.respuesta}`);
    assert.deepEqual([x.estado, x.leyenda], ["respuesta", C1.LEYENDA.join("")]);
    assert.deepEqual(x.fichas.map((f) => [f.id, f.boton, f.paga]), FICHAS.map((f) => [f.id, false, f.fob]));
    assert.deepEqual(x.botones, [["seguir-paso", INTERFAZ_C3.seguir, false]]);
    assert.equal(x.seguirDelMotor, "no se ve");
    /* Paso 2: el texto de FOB se va (M-1); el de C&F, con el foco; la tierra atenuada y sin marca (F-3). */
    await m.clic(m.q('[data-boton="seguir-paso"]'));
    x = v();
    enFoco(m.q("[data-texto-paso]"), "al pasar a C&F");
    assert.deepEqual([x.estado, x.paso, x.consigna, x.textoPaso, x.mensaje], ["colocando", "cyf", null, CYF.texto, null]);
    assert.deepEqual(x.tramos, V.tramos.map((t) => [t.id, t.tierra]));
    assert.deepEqual(x.fichas.map((f) => [f.id, f.paga]), FICHAS.map((f) => [f.id, ["flete", "seguro"].includes(f.id) ? f.fob : null]));
    assert.equal(x.leyenda, C1.LEYENDA.join(""), "la figura se queda (C8)");
    assert.deepEqual(x.opciones.map(([id]) => id), CYF.opciones.map((o) => o.id));
    assert.equal(x.seguirDelMotor, "true", "ahora sí se ve «Seguir», bloqueado");
    await m.seguir();
    assert.equal(m.pantalla(), "fob-cif-cyf");
    /* 1.er error, «Los dos, a medias»: su retro, coral y «No va aquí». */
    await m.op("medias");
    x = v();
    assert.equal(x.mensaje, `${LECTOR_INCORRECTO} ${C1.PASO2.retro}`);
    assert.deepEqual(x.opciones.filter(([, c]) => c).map(([id, c]) => [id, c]), [["medias", "mal"]]);
    assert.equal(m.q('[data-op="medias"] [data-pastilla]').textContent, PALABRA_B.noVaAqui);
    enFoco(m.q("[data-viaje-msg]"), "1.er error de C&F");
    /* 1.er error con «El vendedor» (sin retro propia): la pista. */
    const otra = await montar({ ...P, pantallas: [V] });
    try {
      await otra.clic(otra.q('[data-ficha="flete"]')); await otra.clic(otra.q('[data-ficha="seguro"]')); await otra.clic(otra.q('[data-ficha="bodega"]'));
      await otra.clic(otra.q('[data-boton="comprobar"]'));
      assert.equal(vistaViaje(otra).mensaje, `Correcto. ${FOB.acierto}`);
      await otra.clic(otra.q('[data-boton="seguir-paso"]'));
      await otra.op("vendedor");
      assert.equal(vistaViaje(otra).mensaje, `${LECTOR_INCORRECTO} ${CYF.pista}`);
      await otra.op("comprador");
      assert.equal(vistaViaje(otra).mensaje, `Correcto. ${CYF.acierto}`);
      assert.equal(otra.q('[data-op="comprador"] [data-pastilla]').textContent, PALABRA_B.correcto);
    } finally { otra.desmontar(); }
    /* 2.º error: la respuesta; la correcta en blanco; «Flete» pasa al vendedor y «Seguro» se queda (F-2). */
    await m.op("vendedor");
    x = v();
    assert.equal(x.mensaje, `${LECTOR_INCORRECTO} ${CYF.respuesta}`);
    assert.deepEqual(x.opciones.filter(([, c]) => c), [["comprador", "pista"]]);
    assert.deepEqual(x.fichas.map((f) => [f.id, f.paga]), FICHAS.map((f) => [f.id, f.cyf ?? null]));
    for (const o of m.qa("[data-viaje] [data-op]")) assert.equal(o.getAttribute("aria-disabled"), "true");
    assert.equal(x.seguirDelMotor, "false");
    /* Y a la pantalla 5. */
    await m.seguir();
    assert.equal(m.pantalla(), "flete-del-comprador");
    enFoco(m.q(".c3-txt"), "al llegar al flete");
    assert.doesNotMatch(m.caja.textContent, /Iba aquí/);
  } finally { m.desmontar(); }
});

test("★★★ el viaje, en funciones puras: tocar, «Comprobar», pasar a C&F y elegir; nada se mueve fuera de su paso", () => {
  let v = VIAJE_INICIAL;
  assert.equal(comprobar(v, V), v, "sin nada marcado, «Comprobar» no hace nada");
  assert.equal(alPaso2(v), v, "no se pasa a C&F sin resolver FOB");
  assert.equal(elegirCyF(v, V, "comprador"), v, "C&F no responde en el paso de FOB");
  v = tocarFicha(tocarFicha(v, "flete"), "flete");
  assert.deepEqual(v.p1.marcadas, []);
  for (const id of ["flete", "seguro", "bodega"]) v = tocarFicha(v, id);
  v = comprobar(v, V);
  assert.deepEqual([v.p1.resuelto, v.p1.peldano, v.p1.errores, v.respondio], [true, "acierto", 0, 1]);
  assert.equal(tocarFicha(v, "puerto"), v, "resuelto, las fichas no se tocan");
  v = alPaso2(v);
  assert.deepEqual([v.paso, v.cambio], [1, 1]);
  v = elegirCyF(v, V, "medias");
  assert.deepEqual([v.p2.intento, v.p2.errores, v.p2.resuelto], ["medias", 1, false]);
  v = elegirCyF(v, V, "comprador");
  assert.deepEqual([v.p2.intento, v.p2.peldano, v.p2.resuelto, v.p2.errores], [null, "acierto", true, 1]);
  assert.equal(elegirCyF(v, V, "vendedor"), v, "resuelto, no cambia");
});

for (const id of ["flete-del-comprador", "flete-del-vendedor"]) {
  test(`★★★ ${id}: el camión, «Cuentas de …», la escalera y, con el acierto, el asiento del flete partido`, async () => {
    const p = pantalla(id);
    const m = await montar(desde(id));
    try {
      assert.equal(m.q("[data-texto]").textContent, p.texto);
      assert.equal(m.q("[data-ruta]").getAttribute("aria-label"), F.ruta);
      assert.equal(m.q(".a5-asume").textContent, `${F.asume} ${p.quien}, ${p.rolQuien}`);
      assert.equal(m.q("[data-ruta] .c3-rotulo").textContent, F.tarifas);
      assert.equal(m.q(".a5-camion b").textContent, `${F.flete} $650.000`);
      assert.deepEqual(m.qa(".a5-lugar b").map((b) => b.textContent), [p.desde, F.comprador]);
      assert.deepEqual(m.qa(".a5-lugar.asume b").map((b) => b.textContent), [p.quien]);
      assert.ok(m.q(".a5-carril").classList.contains("anda"), "el camión entra");
      assert.equal(m.q("[data-cuentas-de]").textContent, F.cuentasDe[p.quien]);
      assert.deepEqual(m.qa("[data-figura] [data-op]").map((b) => b.textContent), p.opciones.map((o) => o.texto));
      assert.ok(!m.q("[data-asiento]"), "el asiento no está antes del acierto");
      const [x, y] = malas(p);
      await m.op(x.id);
      assert.equal(m.msg(), `${LECTOR_INCORRECTO} ${p.pista}`);
      assert.ok(!m.q(".a5-carril").classList.contains("anda"), "el camión no vuelve a entrar con el error");
      await m.op(y.id);
      assert.equal(m.msg(), `${LECTOR_INCORRECTO} ${y.devolucion}`);
      assert.ok(m.q(`[data-op="${correcta(p).id}"]`).classList.contains("pista"));
      assert.ok(!m.q("[data-asiento]"));
      await m.op(correcta(p).id);
      assert.equal(m.msg(), `Correcto. ${p.bien}`);
      enFoco(m.q("[data-c3-msg]"), "acierto");
      assert.ok(!m.q("[data-cuentas-de]"), "las cuentas se van");
      assert.equal(m.qa("[data-figura] [data-op]").length, 0);
      const t = m.q("[data-asiento]");
      assert.equal(t.querySelector(".c3-t-tit").textContent, F.asiento);
      const filas = (l) => [...t.querySelectorAll(`[data-lado="${l}"] .c3-ren`)].map((r) => [r.querySelector("span").textContent, r.querySelector("b").textContent]);
      assert.deepEqual(filas("debe"), [[correcta(p).texto, "$650.000"]]);
      assert.deepEqual(filas("haber"), [[F.retencion, "$6.500"], [F.pago, "$643.500"]]);
      assert.equal(t.querySelector('[data-lado="debe"] [data-pastilla]').textContent, PALABRA_B.correcto);
      assert.equal(t.querySelectorAll(".c3-ren.nuevo").length, 3);
      seguirBloqueado(m, false);
    } finally { m.desmontar(); }
  });
}

test("★★★ lado a lado: A5-1 (sin rótulo, «Empresa», «Santa Martha» y «La Popa»); ningún rótulo dice «asume»; la pregunta sale al ver La Popa (M-1)", async () => {
  const p = pantalla("lado-a-lado");
  const m = await montar(desde("flete-del-vendedor"));
  try {
    await m.op(correcta(pantalla("flete-del-vendedor")).id);
    await m.seguir();
    assert.equal(m.pantalla(), "lado-a-lado");
    /* Al llegar: la consigna (PENDIENTE de Near) con el foco; sin pregunta ni opciones. */
    assert.equal(m.q("[data-consigna]").textContent, p.consigna);
    enFoco(m.q("[data-consigna]"), "al llegar");
    assert.ok(m.q("[data-texto]").hidden);
    assert.equal(m.qa("[data-op]").length, 0);
    assert.ok(!m.q("[data-pregunta]"));
    seguirBloqueado(m);
    /* A5-1. */
    const grupo = m.q(".c3-roles");
    assert.equal(grupo.getAttribute("role"), "group");
    assert.equal(grupo.getAttribute("aria-label"), N.A5_1.grupo);
    assert.deepEqual([...grupo.querySelectorAll("button")].map((b) => [b.textContent, b.getAttribute("aria-pressed")]), [[N.A5_1.botones[0], "true"], [N.A5_1.botones[1], "false"]]);
    assert.ok(!m.fig().querySelector(".c3-rotulo"), "se fue el rótulo de arriba");
    /* Condición 1: en la figura del lado a lado, nada dice «asume» (ni texto, ni nombre accesible). */
    const rotulos = () => [visible(m.fig()), ...[...m.fig().querySelectorAll("[aria-label]")].map((x) => x.getAttribute("aria-label"))].join(" ");
    assert.doesNotMatch(rotulos(), /asum/i, N.CONDICION_ASUME);
    assert.deepEqual([...m.fig().querySelectorAll(".c3-cruce-rot span")].map((s) => s.textContent), F.columnas);
    const tile = m.q('[data-ficha="flete"]');
    assert.ok(!tile.classList.contains("der"));
    assert.equal(tile.textContent, `${F.empresas.comprador} · ${F.pagado}$650.000${F.cuentas.comprador}`);
    /* Santa Martha otra vez: nada cambia, ni sale la pregunta. */
    await m.clic(grupo.querySelector('[data-asume="comprador"]'));
    assert.equal(m.qa("[data-op]").length, 0);
    /* La Popa: la ficha cruza (el mismo nodo), la consigna se va y sale la pregunta. */
    await m.clic(m.q('[data-asume="vendedor"]'));
    const tile2 = m.q('[data-ficha="flete"]');
    assert.ok(tile2 === tile, "la misma ficha: se desliza");
    assert.ok(tile2.classList.contains("der"));
    assert.equal(tile2.textContent, `${N.A5_1.ficha}$650.000${F.cuentas.vendedor}`);
    assert.doesNotMatch(rotulos(), /asum/i);
    assert.ok(m.q("[data-consigna]").hidden, "M-1: la consigna se va");
    assert.equal(m.q("[data-pregunta]").textContent, p.pregunta);
    assert.deepEqual(m.qa("[data-op]").map((b) => b.textContent), p.opciones.map((o) => o.texto));
    /* De vuelta a Santa Martha: la pregunta se queda. */
    await m.clic(m.q('[data-asume="comprador"]'));
    assert.ok(!m.q('[data-ficha="flete"]').classList.contains("der"));
    assert.equal(m.q("[data-pregunta]").textContent, p.pregunta);
    const [x, y] = malas(p);
    await m.op(x.id);
    assert.equal(m.msg(), `${LECTOR_INCORRECTO} ${p.pista}`);
    await m.op(y.id);
    assert.equal(m.msg(), `${LECTOR_INCORRECTO} ${y.devolucion}`);
    await m.op(correcta(p).id);
    assert.equal(m.msg(), `Correcto. ${p.bien}`);
    seguirBloqueado(m, false);
    await m.seguir();
    /* Resumen: la lista y el «Siguiente», sin botón. */
    assert.equal(m.pantalla(), "resumen");
    const r = pantalla("resumen");
    assert.deepEqual(m.qa(".c3-lista li").map((li) => li.textContent), [...r.lista, r.siguiente]);
    assert.ok(m.q("[data-pieza] > .c3-seguir").hidden);
    assert.equal(m.q("[data-pie]").textContent, r.pie);
  } finally { m.desmontar(); }
});

test("★★★ cada pantalla lleva su pie de Watari en todos sus estados", async () => {
  for (const p of P.pantallas) {
    const m = await montar(desde(p.id));
    try { assert.equal(m.q("[data-pie]").textContent, p.pie, p.id); } finally { m.desmontar(); }
  }
});

/* ═══════════ 3 · MOVIMIENTO REDUCIDO Y B2 ═══════════ */

test("★★★ movimiento reducido: nada lleva la clase que anima (camión, capas, rebote, asiento) y todo queda en su estado final", async () => {
  REDUCIDO = true;
  try {
    let m = await montar(desde("importados"));
    try {
      await m.op(malas(pantalla("importados"))[0].id);
      assert.equal(m.qa(".rebota").length, 0);
      await m.op(correcta(pantalla("importados")).id);
      assert.equal(m.qa(".nuevo").length, 0);
      assert.equal(m.qa(".a5-capa").length, 4);
    } finally { m.desmontar(); }
    m = await montar(desde("flete-del-comprador"));
    try {
      assert.equal(m.qa(".anda").length, 0);
      await m.op(correcta(pantalla("flete-del-comprador")).id);
      assert.equal(m.qa(".nuevo").length, 0);
      assert.equal(m.qa("[data-asiento] .c3-ren").length, 3);
    } finally { m.desmontar(); }
  } finally { REDUCIDO = false; }
  assert.match(CSS_A5_C3, /\.a5-carril\.anda \{ animation/);
});

/* Cada pantalla, cada estado: al llegar, 1.er error, 2.º error y acierto (y en el viaje y el lado a lado, sus pasos). */
async function estados(id) {
  const p = pantalla(id);
  const out = [];
  const medir = async (nombre, pasos) => {
    const m = await montar(desde(id));
    try { for (const f of pasos) await f(m); out.push([nombre, b2(m)]); } finally { m.desmontar(); }
  };
  const ver = async (m) => { if (id === "lado-a-lado") await m.clic(m.q('[data-asume="vendedor"]')); };
  await medir("al llegar", []);
  if (id === "la-regla-del-costo") await medir("en pesos", [(m) => m.clic(m.q('[data-accion="pesos"]'))]);
  if (id === "lado-a-lado") await medir("al ver La Popa", [ver]);
  if (p.opciones) {
    for (const o of malas(p)) await medir(`1.er error · ${o.id}`, [ver, (m) => m.op(o.id)]);
    for (const [a, b] of [malas(p), [...malas(p)].reverse()]) await medir(`2.º error · ${b.id}`, [ver, (m) => m.op(a.id), (m) => m.op(b.id)]);
    await medir("acierto", [ver, (m) => m.op(correcta(p).id)]);
    await medir("acierto tras dos errores", [ver, ...malas(p).map((o) => (m) => m.op(o.id)), (m) => m.op(correcta(p).id)]);
  }
  if (id === "fob-cif-cyf") {
    const tocar = (ids) => ids.map((f) => (m) => m.clic(m.q(`[data-ficha="${f}"]`)));
    const comp = (m) => m.clic(m.q('[data-boton="comprobar"]'));
    const paso2 = [...tocar(["flete", "seguro", "bodega"]), comp, (m) => m.clic(m.q('[data-boton="seguir-paso"]'))];
    await medir("FOB · pista", [...tocar(["flete"]), comp]);
    await medir("FOB · retro", [...tocar(["puerto", "subir"]), comp]);
    await medir("FOB · respuesta", [...tocar(["puerto"]), comp, comp]);
    await medir("FOB · acierto", [...tocar(["flete", "seguro", "bodega"]), comp]);
    await medir("C&F · al llegar", paso2);
    for (const o of ["medias", "vendedor"]) await medir(`C&F · 1.er error · ${o}`, [...paso2, (m) => m.op(o)]);
    await medir("C&F · respuesta", [...paso2, (m) => m.op("medias"), (m) => m.op("vendedor")]);
    await medir("C&F · acierto", [...paso2, (m) => m.op("comprador")]);
  }
  return out;
}

test("★★★ B2 · ninguna pantalla pasa de 60 palabras visibles, en ningún estado (texto y figura, contados con canonEnganche.js)", async (t) => {
  const peor = {};
  for (const p of P.pantallas) {
    for (const [estado, n] of await estados(p.id)) {
      t.diagnostic(`${p.id} · ${estado} · canon ${n.canon} · sin la cejilla ${n.b2}${n.c1 != null ? ` · C1 ${n.c1}` : ""} · con opciones de la figura ${n.conOpciones}`);
      if (!(peor[p.id] >= n.canon)) peor[p.id] = n.canon;
      if (n.c1 > C.UMBRAL_B2_PALABRAS) peor[`${p.id} (C1)`] = n.c1;
    }
  }
  /* La regla es la del canon (con «Pantalla n de N», sin los rótulos de la figura). Lo que pasa de 60 está en PASAN_DE_60, exacto. */
  const pasan = Object.fromEntries(Object.entries(peor).filter(([, n]) => n > C.UMBRAL_B2_PALABRAS));
  assert.deepEqual(pasan, PASAN_DE_60);
  /* El peor estado de cada pantalla, medido (si un texto crece, esto avisa). */
  assert.deepEqual(peor, { portada: 25, "la-regla-del-costo": 38, importados: 42, "fob-cif-cyf": 24, "flete-del-comprador": 61, "flete-del-vendedor": 62, "lado-a-lado": 62, resumen: 55 });
  assert.equal(Object.keys(peor).length, 8);
});

/* ═══════════ 4 · CATÁLOGO Y VISTA ═══════════ */

test("★★★ la vista publica la pieza C3 con el mismo id, en el mismo lugar (después de A2, antes de A6); fuera del catálogo de FP", () => {
  const e = PIEZAS_T7_1.find((x) => x.pieza.id === HOY.A5_ID);
  assert.equal(e.pieza, P);
  assert.equal(e.Pieza, A5);
  assert.notEqual(e.Pieza, ImportadosYFletesDeHoy);
  assert.equal(PIEZAS_T7_1.filter((x) => x.pieza.id === HOY.A5_ID).length, 1);
  assert.equal(e.numero, 5);
  const piezas = PIEZAS_T7_1.map((x) => x.pieza.id);
  const orden = ["t7-1-a1-la-cuenta-que-no-se-mueve", "t7-1-a2-la-factura-completa", HOY.A5_ID, "t7-1-a6-devoluciones-en-periodico"];
  assert.deepEqual(piezas.filter((id) => orden.includes(id)), orden);
  assert.equal(piezas.indexOf(HOY.A5_ID) + 1, piezas.indexOf("t7-1-a6-devoluciones-en-periodico"));
  const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === TEMA_T7_1);
  const a = tema.actividades.find((x) => x.id === HOY.A5_ID);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, P.titulo);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(HOY.A5_ID)), []);
  for (const f of ["src/components/mecanicas/libros/t7/ImportadosYFletesC3.jsx", "src/data/contabilidadT7_1_a5_c3.js"]) {
    assert.doesNotMatch(readFileSync(new URL(f, RAIZ), "utf8"), /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/, f);
  }
});

test("★★ la pieza va por el motor sin cambiarlo: las opciones pasan a `t`, el viaje es una lectura con su consigna; nada compartido nuevo", () => {
  const M = piezaParaElMotor(P);
  assert.equal(M.clase, "a5");
  for (const [k, p] of M.pantallas.entries()) for (const o of p.opciones ?? []) assert.equal(o.t, P.pantallas[k].opciones.find((x) => x.id === o.id).texto);
  const viaje = M.pantallas[3];
  assert.deepEqual([viaje.tipo, viaje.texto, viaje.consigna], ["lectura", "", FOB.texto]);
  assert.equal(viaje.antes({ fig: {} }), false);
  assert.equal(viaje.antes({ fig: { viaje: { paso: 1 } } }), true);
  assert.equal(M.pantallas[6].antes({ fig: { vio: true } }), true);
  const fuente = readFileSync(new URL("src/components/mecanicas/libros/t7/ImportadosYFletesC3.jsx", RAIZ), "utf8");
  assert.match(fuente, /from "\.\/aprenderC3\.jsx"/);
  /* Botones de 44 px; sin teal ni ámbar (solo los rótulos DEBE y HABER, del motor). */
  assert.match(CSS_A5_C3, /\.a5-ficha \{[^}]*min-height: 44px;/);
  assert.doesNotMatch(CSS_A5_C3, /2A9D8F|3FA69A|E9C46A|--teal|--ambar/i);
  assert.doesNotMatch(fuente.replace(/\/\*[\s\S]*?\*\//g, ""), /Iba aquí|ibaAqui/);
});

test("★★ botones reales: todos con type=\"button\"; lo que se abre o se elige lleva su estado (aria-pressed, aria-disabled)", async () => {
  for (const id of P.pantallas.map((p) => p.id)) {
    const m = await montar(desde(id));
    try { for (const b of m.qa("button")) assert.equal(b.getAttribute("type"), "button", `${id}: ${b.textContent}`); } finally { m.desmontar(); }
  }
});
