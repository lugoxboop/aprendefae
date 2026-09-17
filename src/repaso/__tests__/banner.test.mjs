import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * El banner del Repaso Diario: fuera de la rejilla de temas, encima de ella,
 * por materia, con su contenido y con el fondo animado de la portada
 * reutilizado —no copiado—.
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;

const { default: TopicIndexView } = await import("../../components/TopicIndexView.jsx");
const { default: BannerRepaso, SUBTITULO_REPASO, MANCHAS_BANNER } = await import("../../components/repaso/BannerRepaso.jsx");
const { default: MeshGradientBackground, MANCHAS_PORTADA } = await import("../../components/backgrounds/MeshGradientBackground.jsx");
const { SUBJECTS, ACTIVIDADES_TRANSVERSALES } = await import("../../data/subjects.js");
const { FAE } = await import("../../theme.js");
const { AuthProvider } = await import("../../auth/AuthProvider.jsx");

function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

function indice(subjectId) {
  const abiertos = [];
  const materia = SUBJECTS[subjectId];
  const m = montar(React.createElement(AuthProvider, null, React.createElement(TopicIndexView, {
    subjectId, name: materia.name, accent: FAE.coral, hoverBg: "", hoverBorder: "",
    background: null, topics: materia.topics, renderTopicIcon: () => null,
    onOpenTopic: (id, modo) => abiertos.push([id, modo]),
  })));
  return { ...m, abiertos };
}

const REPASO = ACTIVIDADES_TRANSVERSALES.find((a) => a.id === "repaso-diario");

test("Macroeconomía: el banner va encima de la rejilla de temas y fuera de ella", () => {
  const m = indice("macroeconomia");
  try {
    const banners = m.caja.querySelectorAll('[data-banner="repaso-diario"]');
    assert.equal(banners.length, 1);
    const banner = banners[0];
    /* La tarjeta de un tema cualquiera, y su rejilla. */
    const titulo = SUBJECTS.macroeconomia.topics[0].title;
    const tarjeta = [...m.caja.querySelectorAll("button")].find((b) => b !== banner && b.textContent.includes(titulo));
    assert.ok(tarjeta, "hay tarjetas de tema");
    const rejilla = tarjeta.closest('div[style*="grid"]');
    assert.ok(rejilla, "las tarjetas viven en una rejilla");
    assert.ok(!rejilla.contains(banner), "el banner no es una celda de la rejilla");
    assert.ok(banner.compareDocumentPosition(rejilla) & w.Node.DOCUMENT_POSITION_FOLLOWING, "y va antes que ella");
    /* Ninguna tarjeta de tema se llama como el Repaso. */
    assert.equal([...rejilla.querySelectorAll("button")].filter((b) => b.textContent.includes(REPASO.nombre)).length, 0);

    act(() => { banner.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    assert.deepEqual(m.abiertos.at(-1), ["repaso-diario", undefined]);
  } finally {
    m.desmontar();
  }
});

test("es por materia: Pensamiento Estratégico no tiene banner ni hueco para uno", () => {
  const m = indice("pensamiento-estrategico");
  try {
    assert.equal(m.caja.querySelectorAll("[data-banner]").length, 0);
    assert.equal(m.caja.querySelectorAll("[data-encabezado-materia]").length, 0);
  } finally {
    m.desmontar();
  }
});

test("contenido: título, subtítulo exacto, HACER, reloj y llama, miniatura del pasillo y flecha", () => {
  const m = montar(React.createElement(BannerRepaso, { actividad: REPASO, onAbrir: () => {} }));
  try {
    const b = m.caja.querySelector("[data-banner]");
    assert.equal(b.querySelector("h2").textContent, "El Repaso Diario");
    assert.equal(SUBTITULO_REPASO, "Repasa lo que ya viste, mezclado entre todos los temas.");
    assert.equal(b.querySelector("h2 + p").textContent, SUBTITULO_REPASO);
    assert.ok(b.querySelector(".fae-banner-repaso__hacer").textContent.toUpperCase().includes("HACER"), "la etiqueta HACER");
    assert.ok(b.querySelector('[data-icono="reloj"]'), "el reloj con flecha de retorno");
    assert.ok(b.querySelector('[data-icono="llama"] polygon'), "la llama facetada de la racha");
    const previa = b.querySelector('[data-previa="repaso-diario"]');
    assert.ok(previa, "la miniatura del pasillo");
    assert.equal([...previa.querySelectorAll("rect")].filter((r) => r.getAttribute("height") === "32").length, 4, "sus cuatro puertas, sin tocar");
    assert.equal(b.querySelector(".fae-banner-repaso__flecha").textContent, "→");
  } finally {
    m.desmontar();
  }
});

test("fondo: la MISMA malla animada de la portada, dentro de la franja, teal → navy y sin coral", () => {
  const banner = montar(React.createElement(BannerRepaso, { actividad: REPASO, onAbrir: () => {} }));
  const portada = montar(React.createElement(MeshGradientBackground));
  try {
    const malla = banner.caja.querySelector("[data-malla-animada]");
    assert.ok(malla, "el banner usa MallaAnimada");
    assert.equal(malla.style.position, "absolute", "ocupa la franja, no la pantalla");
    const manchas = [...malla.querySelectorAll(".fae-mesh-blob")];
    assert.equal(manchas.length, MANCHAS_BANNER.length);
    assert.ok(manchas.every((x) => x.style.animationName.startsWith("fae-mesh-")), "animadas con los mismos keyframes");
    assert.ok(malla.innerHTML.includes("@keyframes fae-mesh-a"));
    assert.ok(!MANCHAS_BANNER.some((x) => x.color === FAE.coral), "sin coral");
    assert.ok(MANCHAS_BANNER.some((x) => x.color === FAE.teal));

    /* La portada sigue exactamente como estaba: fija, con sus tres manchas. */
    const fondoPortada = portada.caja.querySelector("[data-malla-animada]");
    assert.equal(fondoPortada.style.position, "fixed");
    assert.equal(fondoPortada.querySelectorAll(".fae-mesh-blob").length, MANCHAS_PORTADA.length);
    assert.deepEqual(MANCHAS_PORTADA.map((x) => x.duracion), ["34s", "27s", "31s"]);
  } finally {
    banner.desmontar();
    portada.desmontar();
  }
});
