import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 7 · LA CAPA 2 DE T6 · A3 CON EL TANQUE (P2 de Mai, decisiones de Sakuta).
 *
 * Vigila:
 *   · el estado por paso, calculado desde los 19 pasos de antes: vale con los
 *     15 pasos de hoy y con los 13 de la hoja (los gestos van con su paso de antes);
 *   · los cuatro gestos: «Siguiente» con aria-disabled y aria-describedby
 *     hasta hacerlo, la pista visible, «Reproducir» que se pausa, y lo hecho
 *     que se conserva al volver;
 *   · el arrastre nunca es la única forma: toque o Enter en la ficha, botón en
 *     la barra, Enter o flecha arriba en el asa (role="slider");
 *   · lo que se ve: el nivel del tanque en su escala, las filas de la T (la
 *     nueva, con borde de 2 px #F8F9FA), la parte de la barra, los rótulos;
 *   · el lector: el nombre literal del tanque y la fecha oculta de cada fila;
 *   · color por rol: ámbar el HABER, teal el DEBE (el faltante, neutro desde el lote 27), nunca coral; cifras en la
 *     pila monoespaciada.
 * El arrastre real con el ratón se mide en Chromium (scripts/b5/medir-b5-tanque.mjs).
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
const { default: LaProvision, estadoTanque, PARADA_TANQUE } = await import("../../components/mecanicas/libros/tema6/LaProvision.jsx");
const { escalaTanque, saldoLector } = await import("../../components/mecanicas/libros/tema6/TanqueProvision.jsx");
const { FAE } = await import("../../theme.js");

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const click = async (el) => { assert.ok(el, "no hay nada que tocar"); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const tecla = async (el, key) => { await act(async () => { el.dispatchEvent(new w.KeyboardEvent("keydown", { key, bubbles: true })); }); };
const rgb = (hex) => `rgb(${[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ")})`;
const sig = (caja) => caja.querySelector("[data-siguiente]");
const contador = (caja) => caja.querySelector("[data-paso-de]").textContent;
const T = D.TANQUE_T6_A3;
const PASOS = 15;
const CIERRE = 16;

/* Hace el gesto pendiente por la vía sin arrastre. */
const gesto = async (caja) => {
  const g = sig(caja).dataset.gestoPendiente;
  if (g === "gasto" || g === "pablo") await click(caja.querySelector('[data-ficha][data-activa="si"]'));
  else if (g === "barra") await click(caja.querySelector("button[data-barra]"));
  else if (g === "asa") await tecla(caja.querySelector("[data-asa]"), "Enter");
  return g ?? null;
};
const siguiente = async (caja) => {
  await gesto(caja);
  await click(sig(caja));
  if (caja.querySelector("[data-parada]")) {
    await click(caja.querySelector(`[data-parada] [data-opcion="${D.PARADA_T6_A3.correcta}"]`));
    await click(sig(caja));
  }
};
const irA = async (caja, n) => {
  for (let k = 0; k < 40 && Number(contador(caja).match(/^Paso (\d+)/)?.[1] ?? CIERRE) < n; k++) await siguiente(caja);
  assert.equal(contador(caja), `Paso ${n} de ${PASOS}`, `llegar al paso ${n}`);
};

/* ═══════════ EL ESTADO POR PASO ═══════════ */

/* Lo que se espera en cada paso de antes (con su gesto hecho), según la tabla §5 de Mai. */
const ESPERADO = {
  1: { nivel: 0, parte: null, filas: [false, false, false], rotulo: null },
  2: { nivel: 0, parte: "rayada", filas: [false, false, false], rotulo: null },
  4: { nivel: 148800, parte: "rayada", filas: [true, false, false], rotulo: "provision" },
  5: { nivel: 148800, parte: "rayada", filas: [true, false, false], rotulo: "provision" },
  6: { nivel: 148800, parte: "restada", filas: [true, false, false], rotulo: "provision" },
  7: { nivel: 148800, parte: "restada", filas: [true, false, false], rotulo: "provision", valorNeto: true },
  8: { nivel: 148800, parte: "restada", filas: [true, false, false], rotulo: "provision", fichaPablo: true },
  9: { nivel: -31200, parte: "restada", filas: [true, true, false], rotulo: "faltante" },
  13: { nivel: -31200, filas: [true, true, false], rotulo: "faltante", analisis: null },
  15: { nivel: -31200, analisis: "cifra", segmentos: null },
  16: { nivel: -31200, analisis: "solo", segmentos: "discontinuos" },
  18: { nivel: 153400, filas: [true, true, true], rotulo: "analisis", segmentos: "continuos", fichaGasto2: true },
  19: { nivel: 153400, analisis: "solo", segmentos: null, rotulo: "analisis" },
  20: { nivel: 153400, segmentos: null },
};

test("★★★ el estado sale de los 19 pasos de antes: el de cada paso juntado es el del último de su grupo, con sus gestos hechos", () => {
  const todos = new Set(Object.keys(E.GESTOS_T6_A3).map(Number));
  const grupos = D.FUSION_T6_A3.grupos;
  for (let n = 1; n <= CIERRE; n++) {
    const viejo = n <= PASOS ? grupos[n - 1].at(-1) : 20;
    const e = estadoTanque(n, todos);
    assert.equal(e.viejo, viejo);
    const x = ESPERADO[viejo];
    if (!x) continue;
    assert.equal(e.nivel, x.nivel, `paso ${n} (de antes ${viejo}): nivel`);
    if ("parte" in x) assert.equal(e.parte, x.parte, `paso ${n}: parte`);
    if (x.filas) assert.deepEqual([e.filas.haber1, e.filas.debe1, e.filas.haber2], x.filas, `paso ${n}: filas`);
    if ("rotulo" in x) assert.equal(e.rotuloSaldo, x.rotulo, `paso ${n}: rótulo`);
    if ("analisis" in x) assert.equal(e.analisis, x.analisis, `paso ${n}: análisis`);
    if ("segmentos" in x) assert.equal(e.segmentos, x.segmentos, `paso ${n}: segmentos`);
    if (x.valorNeto) assert.equal(e.valorNeto, true);
    if (x.fichaPablo) assert.equal(e.fichaPablo, true);
    if (x.fichaGasto2) assert.equal(e.fichaGasto2, true);
    assert.equal(e.gesto, null, "con todo hecho, ningún gesto espera");
  }
});

test("★★★ los cuatro gestos van con su paso de antes (gasto 4, barra 6, deuda 9, nivel 18); sin hacer, el modelo no avanza y lo resaltado es el origen y el destino", () => {
  assert.deepEqual(E.GESTOS_T6_A3, { 4: "gasto", 6: "barra", 9: "pablo", 18: "asa" });
  const grupos = D.FUSION_T6_A3.grupos;
  const nuevo = (p) => grupos.findIndex((g) => g.includes(p)) + 1;
  const casos = [
    [4, "gasto", { nivel: 0, filas: [false, false, false] }, ["fichaGasto1", "tanque"]],
    [6, "barra", { parte: "rayada" }, ["barra", "ranura"]],
    [9, "pablo", { nivel: 148800, filas: [true, false, false] }, ["fichaPablo", "tanque"]],
    [18, "asa", { nivel: -31200, filas: [true, true, false] }, ["tanque", "ranura"]],
  ];
  for (const [p, g, x, res] of casos) {
    const hechos = new Set(Object.keys(E.GESTOS_T6_A3).map(Number).filter((q) => q < p));
    const e = estadoTanque(nuevo(p), hechos);
    assert.equal(e.gesto, g, `paso de antes ${p}`);
    assert.equal(e.pasoGesto, p);
    if ("nivel" in x) assert.equal(e.nivel, x.nivel);
    if (x.filas) assert.deepEqual([e.filas.haber1, e.filas.debe1, e.filas.haber2], x.filas);
    if (x.parte) assert.equal(e.parte, x.parte);
    assert.deepEqual(e.resaltados, res, `${g}: origen y destino`);
    const hecho = estadoTanque(nuevo(p), new Set([...hechos, p]));
    assert.equal(hecho.gesto, null, `${g}: hecho`);
  }
});

test("★★ con los 13 pasos de la hoja (1 + 2 y 9 + 10 juntos) el estado es el mismo: los gestos no dependen de la cuenta", () => {
  const trece = [[1, 2], [3, 4], [5], [6], [7], [8], [9, 10], [11], [12, 13], [14, 15], [16], [17, 18], [19]];
  const { estado } = E.crearEstadoTanque(trece);
  assert.equal(estado(7).gesto, "pablo", "el paso 7 de la hoja lleva la deuda");
  assert.equal(estado(12).gesto, "asa", "el 12, el nivel");
  assert.equal(estado(2).gesto, "gasto");
  assert.equal(estado(4).gesto, "barra");
  const todos = new Set([4, 6, 9, 18]);
  assert.equal(estado(7, todos).nivel, -31200);
  assert.equal(estado(13, todos).rotuloSaldo, "analisis");
});

test("★★★ la parada: después del paso de la deuda (antes del 11 de antes), con el gasto y la fila del castigo resaltados y la etiqueta sobre la bandeja del gasto", () => {
  assert.equal(PARADA_TANQUE.antes, D.FUSION_T6_A3.grupos.findIndex((g) => g.includes(11)) + 1);
  assert.equal(PARADA_TANQUE.antes, 10);
  assert.deepEqual(PARADA_TANQUE.resaltados, ["fichaGasto1", "filaDebe1"]);
  assert.equal(PARADA_TANQUE.etiquetaEn, "bandejaGasto");
  assert.equal(PARADA_TANQUE.pregunta, D.PARADA_T6_A3.pregunta, "los textos, los de Futaba");
  assert.deepEqual(PARADA_TANQUE.opciones, D.PARADA_T6_A3.opciones);
});

/* ═══════════ EN PANTALLA ═══════════ */

test("★★★ paso 1, vacío: tanque con «0» y su nombre literal; T con DEBE y HABER sin filas (reservadas y calladas); nada que arrastrar todavía", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  assert.equal(contador(caja), `Paso 1 de ${PASOS}`);
  const dibujo = caja.querySelector("[data-dibujo-tanque]");
  assert.equal(dibujo.getAttribute("role"), "img");
  assert.equal(dibujo.getAttribute("aria-label"), `${T.nombreTanque}: ${T.pesosCero}`);
  assert.ok([...dibujo.querySelectorAll("span")].some((s) => s.textContent === T.cero), "el «0»");
  const filas = [...caja.querySelectorAll("[data-fila-t]")];
  assert.equal(filas.length, 3);
  for (const f of filas) {
    assert.equal(f.style.visibility, "hidden", `${f.dataset.filaT}: reservada`);
    assert.equal(f.getAttribute("aria-hidden"), "true", `${f.dataset.filaT}: callada`);
    assert.ok(f.hasAttribute("inert"));
  }
  assert.deepEqual([...caja.querySelectorAll("[data-columna] > p")].map((p) => p.textContent), [D.CUENTA_T_T6_A3.debe, D.CUENTA_T_T6_A3.haber]);
  assert.ok(!caja.querySelector('[data-ficha][data-activa="si"]'), "en el paso 1 nada se arrastra");
  assert.equal(sig(caja).hasAttribute("aria-disabled"), false);
  desmontar();
});

test("★★★ el gesto del gasto: «Siguiente» con aria-disabled y aria-describedby al texto, la pista en el tanque; un toque coloca la ficha y el tanque se llena hasta $148.800", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  await irA(caja, 3);
  assert.equal(sig(caja).dataset.gestoPendiente, "gasto");
  assert.equal(sig(caja).getAttribute("aria-disabled"), "true");
  assert.equal(sig(caja).disabled, false, "sigue enfocable");
  const texto = caja.querySelector("[data-texto-paso]");
  assert.equal(sig(caja).getAttribute("aria-describedby"), texto.id, "dice por qué: el texto del paso");
  /* Tocar «Siguiente» no hace nada. */
  await click(sig(caja));
  assert.equal(contador(caja), `Paso 3 de ${PASOS}`);
  /* La pista de soltar, dentro del tanque, con su contorno discontinuo. */
  assert.ok(caja.querySelector("[data-pista-soltar]").textContent.includes(T.sueltaAqui));
  assert.equal(caja.querySelector("[data-contorno-tanque]").dataset.contornoTanque, "destino");
  assert.match(caja.querySelector("[data-contorno-tanque]").style.border, /2px dashed/);
  /* La ficha: un botón con su nombre. */
  const ficha = caja.querySelector('[data-ficha="fichaGasto1"]');
  assert.equal(ficha.tagName, "BUTTON");
  assert.equal(ficha.getAttribute("aria-label"), `${D.ESCENA_T6_A3.momentos[0].fecha}, ${D.ESCENA_T6_A3.provision1}`);
  assert.equal(ficha.style.minHeight, "44px");
  await click(ficha);
  assert.equal(sig(caja).hasAttribute("aria-disabled"), false, "hecho: «Siguiente» activo");
  assert.ok(!caja.querySelector("[data-pista-soltar]"));
  assert.equal(caja.querySelector("[data-dibujo-tanque]").getAttribute("aria-label"), `${T.nombreTanque}: $148.800`);
  assert.equal(caja.querySelector("[data-tanque]").dataset.nivel, "148800");
  const fila = caja.querySelector('[data-fila-t="filaHaber1"]');
  assert.equal(fila.style.visibility, "", "la fila del HABER llega");
  assert.equal(fila.style.border, `2px solid ${rgb(FAE.text)}`, "la fila nueva, con borde de 2 px #F8F9FA");
  assert.equal(caja.querySelector("[data-rotulo-saldo]").textContent, `${T.quedaEn}${D.ESCENA_T6_A3.provision1}`);
  desmontar();
});

test("★★★ la barra: botón solo en su paso, con su nombre; al tocarla, la parte pasa a provisión restada (ámbar al 38 % y borde izquierdo ámbar de 2 px)", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  assert.ok(!caja.querySelector("button[data-barra]"), "antes, no es un botón");
  await irA(caja, 5);
  assert.equal(sig(caja).dataset.gestoPendiente, "barra");
  const barra = caja.querySelector("button[data-barra]");
  assert.equal(barra.getAttribute("aria-label"), T.nombreBarra);
  assert.ok(caja.querySelector('[data-pista="barra"]').textContent.includes(T.tocaBarra));
  assert.equal(caja.querySelector("[data-parte]").dataset.parte, "rayada");
  assert.equal(caja.querySelector("[data-rotulo-parte]").textContent, `${T.noLaVa}${D.ESCENA_T6_A3.provision1}`);
  await click(barra);
  const parte = caja.querySelector("[data-parte]");
  assert.equal(parte.dataset.parte, "restada");
  assert.equal(parte.style.background, "rgba(233, 196, 106, 0.38)");
  assert.equal(parte.style.borderLeft, `2px solid ${rgb(FAE.ambar)}`);
  assert.equal(parte.style.flex, "0 0 24%", "el 24 % del largo, a la derecha");
  assert.equal(caja.querySelector("[data-rotulo-parte]").textContent, `${T.provisionMenos}${D.ESCENA_T6_A3.provision1}`);
  assert.ok(!caja.querySelector("button[data-barra]"), "hecho: deja de ser un botón");
  desmontar();
});

test("★★★ la deuda de Pablo Moncayo: su ficha en la ranura; al colocarla, el tanque rompe el cero (le faltan $31.200), DEBE $180.000 con su fecha oculta para el lector", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  await irA(caja, 7);
  assert.equal(caja.querySelector('[data-ficha="fichaPablo"]').tagName, "DIV", "en el paso 7 aparece, quieta");
  await siguiente(caja);
  assert.equal(sig(caja).dataset.gestoPendiente, "pablo");
  const ficha = caja.querySelector('[data-ficha="fichaPablo"]');
  assert.equal(ficha.getAttribute("aria-label"), `${T.pablo}, ${D.ESCENA_T6_A3.castigo}`);
  await click(ficha);
  assert.ok(!caja.querySelector('[data-ficha="fichaPablo"]'), "entró al tanque");
  assert.equal(caja.querySelector("[data-tanque]").dataset.nivel, "-31200");
  assert.equal(caja.querySelector("[data-dibujo-tanque]").getAttribute("aria-label"), `${T.nombreTanque}: ${T.leFaltanLector} ${T.faltante}`);
  assert.equal(caja.querySelector("[data-rotulo-saldo]").textContent, `${T.leFaltan}${T.faltante}`);
  const fila = caja.querySelector('[data-fila-t="filaDebe1"]');
  assert.equal(fila.textContent, `${D.ESCENA_T6_A3.castigo}, ${D.ESCENA_T6_A3.momentos[1].fecha}`);
  assert.equal(fila.querySelector("span + span").style.position, "absolute", "la fecha, solo para el lector");
  desmontar();
});

test("★★★ el asa: role=slider «Nivel de la provisión» de −31.200 a 153.400; flecha arriba la lleva a la línea; segmentos continuos, HABER $184.600 y la segunda ficha del gasto", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  await irA(caja, 14);
  assert.equal(sig(caja).dataset.gestoPendiente, "asa");
  const asa = caja.querySelector("[data-asa]");
  assert.equal(asa.getAttribute("role"), "slider");
  assert.equal(asa.getAttribute("aria-label"), T.nombreAsa);
  assert.equal(asa.getAttribute("aria-valuemin"), "-31200");
  assert.equal(asa.getAttribute("aria-valuemax"), "153400");
  assert.equal(asa.getAttribute("aria-valuenow"), "-31200");
  assert.equal(asa.tabIndex, 0);
  assert.equal(asa.style.height, "44px");
  assert.ok(caja.querySelector('[data-pista="asa"]').textContent.includes(T.subeNivel));
  assert.ok([...caja.querySelectorAll("[data-segmento]")].every((s) => s.dataset.trazo === "discontinuos"));
  await tecla(asa, "ArrowDown");
  assert.equal(sig(caja).dataset.gestoPendiente, "asa", "flecha abajo no la sube");
  await tecla(asa, "ArrowUp");
  assert.ok(!caja.querySelector("[data-asa]"));
  assert.equal(caja.querySelector("[data-tanque]").dataset.nivel, "153400");
  assert.ok([...caja.querySelectorAll("[data-segmento]")].every((s) => s.dataset.trazo === "continuos"));
  assert.equal(caja.querySelector('[data-fila-t="filaHaber2"]').style.visibility, "");
  assert.ok(!caja.querySelector('[data-ficha="fichaGasto2"]').closest("[data-futuro]"), "la segunda ficha llega");
  await siguiente(caja);
  assert.equal(caja.querySelectorAll("[data-segmento]").length, 0, "en el último paso se van los segmentos");
  assert.equal(caja.querySelector("[data-rotulo-saldo]").dataset.resaltado, "si", "«Queda en $153.400» resaltado");
  desmontar();
});

test("★★★ la línea del análisis: con su cifra solo en el paso 14 + 15 de antes; después, solo «Análisis»", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  await irA(caja, 11);
  assert.ok(!caja.querySelector("[data-linea-analisis]"), "antes del análisis, sin línea");
  await siguiente(caja);
  assert.equal(caja.querySelector("[data-linea-analisis]").dataset.lineaAnalisis, "cifra");
  assert.equal(caja.querySelector("[data-cifra-analisis]").textContent, T.pide);
  await siguiente(caja);
  assert.equal(caja.querySelector("[data-linea-analisis]").dataset.lineaAnalisis, "solo");
  assert.ok(!caja.querySelector("[data-cifra-analisis]"), "sin la cifra");
  assert.match(caja.querySelector("[data-linea-analisis]").style.borderTop, /2px dashed/);
  desmontar();
});

test("★★★ lo hecho se conserva: «Anterior» y de vuelta, el paso ya está hecho", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  await irA(caja, 3);
  await gesto(caja);
  await click(sig(caja));
  await click(caja.querySelector("[data-anterior]"));
  assert.equal(contador(caja), `Paso 3 de ${PASOS}`);
  assert.equal(sig(caja).hasAttribute("aria-disabled"), false, "el gesto sigue hecho");
  assert.equal(caja.querySelector("[data-tanque]").dataset.nivel, "148800");
  /* Y antes del gesto, el modelo vuelve a su estado. */
  await click(caja.querySelector("[data-anterior]"));
  assert.equal(caja.querySelector("[data-tanque]").dataset.nivel, "0");
  desmontar();
});

test("★★ «Reproducir» se pausa al llegar a un gesto sin hacer", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const { caja, desmontar } = await montar(h(LaProvision));
    await irA(caja, 2);
    await click(caja.querySelector("[data-reproducir]"));
    await act(async () => { mock.timers.tick(E.T6_A3_JUNTO.duracion(2)); });
    assert.equal(contador(caja), `Paso 3 de ${PASOS}`);
    assert.equal(caja.querySelector("[data-reproducir]").getAttribute("aria-pressed"), "false", "pausado en el gesto");
    await act(async () => { mock.timers.tick(60000); });
    assert.equal(contador(caja), `Paso 3 de ${PASOS}`, "no se lo salta");
    desmontar();
  } finally {
    mock.timers.reset();
  }
});

test("★★★ todo el recorrido: los 15 pasos, la parada y el cierre, sin avisos de React", async () => {
  const avisos = [];
  const antes = console.error;
  console.error = (...a) => avisos.push(a.join(" "));
  try {
    const { caja, desmontar } = await montar(h(LaProvision));
    const vistos = [];
    for (let k = 0; k < 40 && !(sig(caja).disabled && !caja.querySelector("[data-parada]")); k++) {
      vistos.push(contador(caja));
      await siguiente(caja);
    }
    assert.equal(vistos.length, PASOS);
    assert.equal(caja.querySelector("[data-texto-paso]").textContent, D.CIERRE_T6_A3.texto);
    assert.equal(caja.querySelector("[data-tanque]").dataset.nivel, "153400");
    desmontar();
  } finally {
    console.error = antes;
  }
  assert.deepEqual(avisos, []);
});

test("★★★ color por rol y cifras: relleno ámbar, faltante neutro #B8C4D4 (lote 27, Shoko: el teal es solo DEBE), nunca coral; DEBE #3FA69A, HABER ámbar; las cifras de la escena en la pila monoespaciada", async () => {
  const { caja, desmontar } = await montar(h(LaProvision));
  const escena = caja.querySelector("[data-escena-tanque]");
  assert.equal(caja.querySelector("[data-relleno]").style.background, "rgba(233, 196, 106, 0.38)");
  assert.match(caja.querySelector("[data-faltante]").style.backgroundImage, /rgba\(184, ?196, ?212, ?0.55\)/);
  assert.equal(caja.querySelector("[data-borde-faltante]").style.background, rgb("#B8C4D4"));
  assert.deepEqual([...caja.querySelectorAll("[data-columna] > p")].map((p) => p.style.color), [rgb("#3FA69A"), rgb(FAE.ambar)]);
  const html = escena.outerHTML.toLowerCase();
  assert.ok(!html.includes(FAE.coral.toLowerCase()) && !html.includes(rgb(FAE.coral)), "sin coral");
  for (const c of [D.ESCENA_T6_A3.saldoClientes, D.ESCENA_T6_A3.provision1]) {
    const n = [...escena.querySelectorAll("span")].find((s) => s.textContent === c);
    assert.match(n.style.fontFamily, /monospace/, `${c}, monoespaciada`);
  }
  desmontar();
});

test("★★ la escala del tanque: y(v) = 160 · (200.000 − v) / 240.000; el cero en 133,33; 148.800 a 99,2 sobre el cero; −31.200 a 20,8 bajo él; el análisis a 102,27", () => {
  const y = escalaTanque(160);
  const r2 = (x) => Math.round(x * 100) / 100;
  assert.equal(r2(y(0)), 133.33);
  assert.equal(r2(y(0) - y(148800)), 99.2);
  assert.equal(r2(y(-31200) - y(0)), 20.8);
  assert.equal(r2(y(0) - y(153400)), 102.27);
  assert.equal(saldoLector(0, T), T.pesosCero);
  assert.equal(saldoLector(-31200, T), `${T.leFaltanLector} ${T.faltante}`);
});

test("★★ el movimiento: solo transform y opacity, con la curva de Mai; con movimiento reducido, nada se anima", () => {
  const fuente = readFileSync(new URL("../../components/mecanicas/libros/tema6/TanqueProvision.jsx", import.meta.url), "utf8");
  const transiciones = [...fuente.matchAll(/`(transform|opacity|top|height|left)[^`]*`/g)].map((m) => m[1]);
  assert.ok(transiciones.length > 0);
  assert.deepEqual([...new Set(transiciones)].filter((t) => !["transform", "opacity"].includes(t)), []);
  assert.ok(fuente.includes("cubic-bezier(.3,.9,.4,1)"));
});
