import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1 EN SECUENCIA (lote 6) · LO QUE SE PUEDE PERDER SIN QUE NADA SE ROMPA A LA VISTA.
 *
 * La forma de cada pieza (faltasDePieza de Erwin), la R10 de la predicción
 * (la vía sin nodos), las paradas con su C2 (pista al 1.er error, el estado
 * correcto al 2.º) y que lo publicado siga detrás de la bandera.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = (q) => ({ matches: /reduce/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador, sessionStorage: w.sessionStorage,
  requestAnimationFrame: (f) => setTimeout(f, 0), cancelAnimationFrame: (h) => clearTimeout(h),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;
const S = await import("../../../../../secuencia/secuencia.js");
const { default: SecuenciaAprender } = await import("../../../../../secuencia/SecuenciaAprender.jsx");
const { PIEZAS_T1_SECUENCIA, secuenciaActiva } = await import("../piezasT1.js");
const { PIEZA_RECORRIDO } = await import("../piezaRecorrido.jsx");
const { PIEZA_OCHO_LEEN } = await import("../piezaOchoLeen.jsx");
const { A1_SEC, OCHO_SEC } = await import("../../../../../../data/contabilidadT1Secuencia.js");
const { ID, USUARIOS } = await import("../../../../../../data/contabilidadIntro.js");

const h = React.createElement;
function montar(Figura, props = {}) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  let estado = props.estado ?? null;
  const pintar = () => act(() => raiz.render(h(Figura, {
    estado, paso: props.paso ?? 0, primeraVez: true, reducido: true,
    setEstado: (v) => { estado = typeof v === "function" ? v(estado) : v; pintar(); },
  })));
  pintar();
  return { caja, get estado() { return estado; }, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const pantalla = (pieza, id) => pieza.pantallas.find((p) => p.id === id);

test("★★★ las dos piezas cumplen la forma de la secuencia", () => {
  for (const p of PIEZAS_T1_SECUENCIA) assert.deepEqual(S.faltasDePieza(p), [], p.id);
});

test("★★ cu0-a1 conserva su id publicado y tiene diez pantallas; la pieza nueva, cuatro", () => {
  assert.equal(PIEZA_RECORRIDO.id, ID);
  assert.equal(PIEZA_RECORRIDO.pantallas.length, 10);
  assert.equal(PIEZA_OCHO_LEEN.pantallas.length, 4);
  assert.notEqual(PIEZA_OCHO_LEEN.id, ID);
});

test("★★ titulares de dos renglones como tope: 48 caracteres o menos (Mai §1.1)", () => {
  for (const p of PIEZAS_T1_SECUENCIA) for (const pt of p.pantallas) assert.ok(pt.titular.length <= 48, `${p.id}/${pt.id}: ${pt.titular.length}`);
});

test("★★★ R10: la predicción no trae los nodos; entran como respuesta", () => {
  const m = montar(pantalla(PIEZA_RECORRIDO, "prediccion").Figura);
  try {
    assert.equal(m.caja.querySelectorAll("[data-nodo]").length, 0, "los nodos contestan la predicción");
    assert.equal(m.caja.querySelector("[data-respuesta-prediccion]"), null);
    tocar(m.caja.querySelector('[data-prediccion="Tres"]'));
    assert.equal(m.caja.querySelectorAll("[data-nodo]").length, 5);
    assert.equal(m.caja.querySelector("[data-respuesta-prediccion]").textContent, A1_SEC.pantallas.prediccion.respuesta);
  } finally { m.desmontar(); }
});

test("★★ los siete verbos: se cuentan al tocarlos y «registrar» se dice anotar", () => {
  const m = montar(pantalla(PIEZA_RECORRIDO, "verbos").Figura);
  try {
    assert.equal(m.caja.querySelectorAll("[data-verbo]").length, 7);
    tocar(m.caja.querySelector('[data-verbo="registrar"]'));
    assert.match(m.caja.querySelector("[data-cuenta-verbos]").textContent, /^1 de 7 · registrar es anotar$/);
  } finally { m.desmontar(); }
});

test("★★ Míralo: la ficha se transforma al tocarla, y el riel enciende su estación", () => {
  const m = montar(pantalla(PIEZA_RECORRIDO, "papel").Figura);
  try {
    assert.ok(m.caja.querySelector('[data-forma="hecho"]'));
    assert.equal(m.caja.querySelector("[data-riel]").dataset.encendidos, "1");
    tocar(m.caja.querySelector("[data-tocar-ficha]"));
    assert.ok(m.caja.querySelector('[data-forma="factura"]'));
    assert.equal(m.caja.querySelector("[data-riel]").dataset.encendidos, "2");
  } finally { m.desmontar(); }
});

test("★★★ el balance de la estación 4 (lote G): el de después de la 2.ª transacción, cuatro renglones, «Efectivo», el computador resaltado, sin pie y cuadrando", () => {
  const m = montar(pantalla(PIEZA_RECORRIDO, "informe").Figura, { estado: { tocada: true } });
  try {
    const lineas = [...m.caja.querySelectorAll("[data-linea]")].map((l) => [l.dataset.linea, l.lastChild.textContent.replace(/\D/g, "")]);
    assert.deepEqual(lineas, [["Efectivo", "300000"], ["Equipo de computación", "25000"], ["Cuentas por pagar", "25000"], ["Aportes sociales", "300000"]]);
    assert.equal(m.caja.querySelector('[data-marcada="si"]').dataset.linea, "Equipo de computación");
    assert.equal(m.caja.querySelector("[data-pie-balance]"), null, "con las cuatro cuentas no hay pie");
    const totales = [...m.caja.querySelectorAll("[data-total]")].map((t) => t.lastChild.textContent.replace(/\D/g, ""));
    assert.deepEqual(totales, ["325000", "325000"]);
  } finally { m.desmontar(); }
});

test("★★★ parada (C2): 1.er error, fantasma y pista; 2.º error, se enciende la correcta y queda resuelta", () => {
  const pt = pantalla(PIEZA_RECORRIDO, "parada-papel");
  const m = montar(pt.Figura);
  try {
    assert.equal(pt.resuelta(m.estado), false);
    tocar(m.caja.querySelector('[data-parada="guarda"]'));
    assert.equal(m.caja.querySelector('[data-parada="guarda"]').dataset.estado, "fantasma");
    assert.equal(m.caja.querySelector('[data-mensaje="error"]').textContent.includes("Piensa para qué sirve"), true);
    assert.equal(pt.resuelta(m.estado), false, "un error ya libera");
    tocar(m.caja.querySelector('[data-parada="estado"]'));
    assert.equal(m.caja.querySelector('[data-parada="anota"]').dataset.estado, "acierto");
    assert.equal(pt.resuelta(m.estado), true);
  } finally { m.desmontar(); }
});

test("★★ la parada de quién decide: «Los jefes» en la fila (Mai §2), y el acierto libera en el acto", () => {
  const pt = pantalla(PIEZA_RECORRIDO, "parada-quien");
  const m = montar(pt.Figura);
  try {
    assert.equal(m.caja.querySelector('[data-parada="administradores"]').textContent, "Los jefes");
    tocar(m.caja.querySelector('[data-parada="administradores"]'));
    assert.equal(pt.resuelta(m.estado), true);
    assert.equal(m.caja.querySelector("[data-riel]").dataset.encendidos, "5");
  } finally { m.desmontar(); }
});

test("★★ el cierre: la vuelta se enciende con el paso, no antes", () => {
  const Fig = pantalla(PIEZA_RECORRIDO, "cierre").Figura;
  const a = montar(Fig, { paso: 0 });
  const b = montar(Fig, { paso: 1 });
  try {
    assert.equal(a.caja.querySelector("[data-riel]").dataset.vuelta, "tenue");
    assert.equal(b.caja.querySelector("[data-riel]").dataset.vuelta, "solida");
    assert.ok(b.caja.querySelector("[data-pie-libro]").textContent.includes("p. 6"));
  } finally { a.desmontar(); b.desmontar(); }
});

test("★★★ Ocho leen lo mismo: dos pasos de cuatro, mezclados, sin rótulos de adentro y afuera, y cada uno una vez", () => {
  const p1 = OCHO_SEC.pantallas.paso1.personas, p2 = OCHO_SEC.pantallas.paso2.personas;
  assert.deepEqual([...p1, ...p2].sort(), USUARIOS.map((u) => u.id).sort());
  for (const paso of [p1, p2]) {
    const tipos = new Set(paso.map((id) => USUARIOS.find((u) => u.id === id).tipo));
    assert.equal(tipos.size, 2, "un paso coincide con una zona: le da la respuesta a t1-1");
  }
  const m = montar(pantalla(PIEZA_OCHO_LEEN, "paso-2").Figura);
  try {
    assert.doesNotMatch(m.caja.textContent, /interno|externo|adentro|afuera/i);
    tocar(m.caja.querySelector('[data-persona="administradores"]'));
    assert.ok(m.caja.querySelector('[data-pregunta-de="administradores"]').textContent.includes(USUARIOS.find((u) => u.id === "administradores").pregunta));
  } finally { m.desmontar(); }
});

test("★★ la bandera: sin ?aprender=secuencia, el estudiante sigue viendo las cuatro capas", () => {
  assert.equal(secuenciaActiva(""), false);
  assert.equal(secuenciaActiva("?aprender=otra"), false);
  assert.equal(secuenciaActiva("?aprender=secuencia"), true);
});

test("★★ la secuencia monta las piezas y dice «Pieza 1 de N»", () => {
  sessionStorage.clear();
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(h(SecuenciaAprender, { temaId: "introduccion-contabilidad", piezas: PIEZAS_T1_SECUENCIA, final: "tema" })));
  try {
    assert.equal(caja.querySelector("[data-contador-pieza]").textContent, `Pieza 1 de ${PIEZAS_T1_SECUENCIA.length}`);
    assert.equal(caja.querySelector("h2").textContent, A1_SEC.pantallas.prediccion.titular);
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

/* ═══════════ LA CAPA 4: FRANJA DE 44 Y LAS CUATRO FRASES EN FLUJO (Mai §4; Shoko, #559) ═══════════ */
const FIG = await import("../figurasT1.jsx");

function capa4SinRecorte(Figura, ficha, nombre) {
  const m = montar(Figura);
  try {
    const raiz = m.caja.querySelector("[data-capa4]");
    assert.ok(raiz, `${nombre}: la figura no lleva data-capa4`);
    assert.match(m.caja.querySelector("style").textContent + [...m.caja.querySelectorAll("style")].map((s) => s.textContent).join(""), /:has\(\[data-capa4\]\)\s*\{\s*height:\s*auto !important/);
    assert.equal(m.caja.querySelector("[data-franja]").style.height, "44px");
    assert.equal(m.caja.querySelectorAll("[data-frase]").length, ficha.opciones.length);
    for (const el of m.caja.querySelectorAll("[data-capa4], [data-capa4] *")) {
      assert.ok(!/auto|scroll|hidden/.test(el.style.overflowY || "") || el.hasAttribute("data-franja"), `${nombre}: algo recorta o desplaza dentro de la figura`);
    }
    assert.deepEqual(FIG.sinDevolucion(ficha), [], `${nombre}: opciones sin devolución en la ficha`);
    /* C2: 1.er error, la devolución de lo tocado; 2.º, la correcta encendida. */
    const malas = ficha.opciones.filter((o) => !o.correcta);
    tocar(m.caja.querySelector(`[data-frase="${malas[0].id}"]`));
    assert.ok(m.caja.querySelector('[data-mensaje="error"]').textContent.includes(malas[0].devolucion.texto));
    tocar(m.caja.querySelector(`[data-frase="${malas[1].id}"]`));
    assert.equal(m.caja.querySelector(`[data-frase="${ficha.opciones.find((o) => o.correcta).id}"]`).dataset.estado, "acierto");
  } finally { m.desmontar(); }
}

test("★★★ capa 4 de «Ocho leen lo mismo»: franja de 44, cuatro frases enteras, nada se desplaza dentro de la figura", async () => {
  const { FICHA_FRASE_OCHO } = await import("../piezaOchoLeen.jsx");
  capa4SinRecorte(pantalla(PIEZA_OCHO_LEEN, "frase").Figura, FICHA_FRASE_OCHO, "ocho");
});

test("★★★ lote G: el balance sale del mayor cortado en dos transacciones, cuadra, y las seis siguen dando el de siempre", async () => {
  const D = await import("../../../../../../data/contabilidadT1Secuencia.js");
  const { BALANCE } = await import("../../../../../../contabilidad/recorridoDeUnHecho.js");
  const b = D.balanceDelHecho();
  assert.equal(D.TRANSACCIONES_DEL_BALANCE_A1, 2);
  assert.equal(b.activos, 325000);
  assert.equal(b.pasivosMasPatrimonio, 325000);
  assert.equal(b.cuadra, true);
  assert.equal(b.cuentas.reduce((t, c) => t + (c.seccion === "activo" ? c.valor : 0), 0), b.activos);
  assert.equal(BALANCE.activos, 415000, "las actividades que usan las seis transacciones no cambian");
  assert.equal(D.A1_SEC.pantallas.prediccion.respuesta, "Del hecho a la decisión hay cinco pasos, y anotar es el tercero.");
  assert.equal(D.A1_SEC.pantallas.verbos.apoyo, "Toca lo que el sistema permite hacer con los hechos. Son siete verbos; registrar es anotar.");
  assert.equal(D.A1_SEC.pantallas.informe.apoyo, "La nota se juntó con las demás en un informe. Tu computador ya es una de sus líneas.");
});

/* ═══════════ cu0-a2 · LA ECUACIÓN CONTABLE ═══════════ */
const { PIEZA_ECUACION, FICHA_FRASE_A2 } = await import("../piezaEcuacion.jsx");
const { A2_SEC } = await import("../../../../../../data/contabilidadT1Secuencia.js");
const { ID_P2 } = await import("../../../../../../data/contabilidadPiezas234.js");

test("★★★ cu0-a2: id publicado, diez pantallas, forma de la secuencia", () => {
  assert.equal(PIEZA_ECUACION.id, ID_P2);
  assert.equal(PIEZA_ECUACION.pantallas.length, 10);
  assert.deepEqual(S.faltasDePieza(PIEZA_ECUACION), []);
  assert.ok(PIEZAS_T1_SECUENCIA.includes(PIEZA_ECUACION));
});

test("★★★ cu0-a2 · R10: la torre de la predicción va sin tramos; el corte entra como respuesta", () => {
  const m = montar(pantalla(PIEZA_ECUACION, "prediccion").Figura);
  try {
    assert.equal(m.caja.querySelectorAll("[data-tramo]").length, 0, "el corte de tramos contesta la predicción");
    assert.equal(m.caja.querySelectorAll("[data-torre] [data-bloque]").length, 3);
    tocar(m.caja.querySelector('[data-prediccion="Solo otros"]'));
    assert.equal(m.caja.querySelectorAll("[data-tramo]").length, 2);
    assert.ok(m.caja.querySelector("[data-respuesta-prediccion]").textContent.startsWith("Una parte la pusieron otros"));
  } finally { m.desmontar(); }
});

test("★★ cu0-a2 · «Van al revés» en las paradas 6 y 7 (Mai, medidas §2)", () => {
  for (const id of ["parada", "casos"]) {
    const m = montar(pantalla(PIEZA_ECUACION, id).Figura);
    try {
      const textos = [...m.caja.querySelectorAll("[data-parada]")].map((b) => b.textContent);
      assert.ok(textos.includes("Van al revés"), id);
      assert.ok(!textos.some((t) => /Uno sube/.test(t)), id);
      for (const t of textos) assert.ok(t.length <= 20, `${id}: «${t}»`);
    } finally { m.desmontar(); }
  }
});

test("★★★ cu0-a2 · parada (C2): pista al 1.er error; al 2.º se enciende «Crecen los dos» y el bloque entra en la torre", () => {
  const pt = pantalla(PIEZA_ECUACION, "parada");
  const m = montar(pt.Figura);
  try {
    assert.ok(m.caja.querySelector('[data-bloque="espera"]'));
    tocar(m.caja.querySelector('[data-parada="no-cambia"]'));
    assert.ok(m.caja.querySelector('[data-mensaje="error"]').textContent.includes("¿Lo nuevo hace la torre más alta o más baja?"));
    assert.equal(pt.resuelta(m.estado), false);
    tocar(m.caja.querySelector('[data-parada="uno-baja"]'));
    assert.equal(m.caja.querySelector('[data-parada="crecen"]').dataset.estado, "acierto");
    assert.equal(pt.resuelta(m.estado), true);
    assert.equal(m.caja.querySelector('[data-bloque="espera"]'), null);
  } finally { m.desmontar(); }
});

test("★★★ cu0-a2 · los cuatro casos: un hecho por paso, un ítem saltado vuelve antes, y solo con los cuatro queda resuelta", () => {
  const pt = pantalla(PIEZA_ECUACION, "casos");
  assert.equal(pt.pasos, 3);
  const a = montar(pt.Figura, { paso: 1 });
  try {
    assert.equal(a.caja.querySelector("[data-hecho]").dataset.hecho, "cal-3", "el caso a sin responder vuelve antes que el b");
    tocar(a.caja.querySelector('[data-parada="crecen"]'));
    assert.equal(a.caja.querySelector("[data-hecho]").dataset.hecho, "cal-5", "resuelto el saltado, vuelve el del paso");
    assert.equal(pt.resuelta(a.estado), false);
  } finally { a.desmontar(); }
  let estado = null;
  for (const [k, id] of [[0, "crecen"], [1, "crecen"], [2, "bajan"], [3, "bajan"]]) {
    const m = montar(pt.Figura, { paso: k, estado });
    try {
      tocar(m.caja.querySelector(`[data-parada="${id}"]`)); estado = m.estado;
      if (k === 0) assert.equal(m.caja.querySelector("[data-caso]").textContent, "Aumento en activo y en pasivo", "al responder aparece el nombre del caso");
    } finally { m.desmontar(); }
  }
  assert.equal(pt.resuelta(estado), true);
  const f = montar(pt.Figura, { paso: 3, estado });
  try { assert.ok(f.caja.querySelector("[data-al-final]").textContent.includes("suben o bajan juntos")); } finally { f.desmontar(); }
});

test("★★★ cu0-a2 · la capa 4: franja de 44 y las cuatro frases en flujo, todas con su devolución", () => {
  capa4SinRecorte(pantalla(PIEZA_ECUACION, "frase").Figura, FICHA_FRASE_A2, "cu0-a2");
});
