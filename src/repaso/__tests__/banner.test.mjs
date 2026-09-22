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
const { default: BannerRepaso, SUBTITULO_REPASO, copiaBloqueo } = await import("../../components/repaso/BannerRepaso.jsx");
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

    /*
     * TOCARLO YA NO NAVEGA. Antes llevaba a una pantalla intermedia con las
     * tres puertas y un botón; ahora se expande donde está. Si alguien volviera
     * a enganchar una navegación aquí, esta afirmación lo caza.
     */
    const cabecera = banner.querySelector(".fae-repaso__cabecera") ?? banner;
    act(() => { cabecera.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    assert.deepEqual(m.abiertos, [], "tocar el banner no cambia de pantalla");
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

