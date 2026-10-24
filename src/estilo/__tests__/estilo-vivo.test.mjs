import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

/* ─────────────── un navegador de mentira, ANTES de cargar React ─────────────── */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
const Observador = class { observe() {} unobserve() {} disconnect() {} };
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  ResizeObserver: Observador, IntersectionObserver: Observador,
  requestAnimationFrame: (f) => setTimeout(f, 0), cancelAnimationFrame: (h) => clearTimeout(h),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;
const V = await import("../estiloVivo.js");
const { useEstiloVivo, SoloEstiloVivo, EstilosEntrada, cssEntrada } = await import("../EstiloVivo.jsx");
const { default: FondoMateria } = await import("../../components/shared/FondoMateria.jsx");

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA COMPUERTA DEL ESTILO VIVO.
 *
 * Orden de Mateo (24-oct-2026): lo nuevo entra SOLO en Macroeconomía y
 * Contabilidad. PENSAMIENTO ESTRATÉGICO NO SE TOCA. Estas pruebas no miran si
 * algo se ve bonito: miran que sea imposible, aunque alguien lo intente, que
 * lo nuevo le llegue a Pensamiento Estratégico.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const h = React.createElement;
async function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(elemento); });
  return { caja, fin: () => act(async () => { raiz.unmount(); }) };
}
const Sonda = () => h("span", { "data-sonda": String(useEstiloVivo()) });

test("★ la compuerta se abre en Macro y Contabilidad, y en nada más", () => {
  assert.deepEqual([...V.MATERIAS_ESTILO_VIVO], ["macroeconomia", "contabilidad"]);
  assert.equal(V.estiloVivoPara("macroeconomia"), true);
  assert.equal(V.estiloVivoPara("contabilidad"), true);
  for (const x of ["pensamiento-estrategico", null, undefined, "", "otra-materia", 3]) {
    assert.equal(V.estiloVivoPara(x), false, `se abrió para ${String(x)}`);
  }
});

test("★ Pensamiento Estratégico queda fuera aunque alguien intente meterlo", () => {
  assert.equal(V.MATERIA_BLINDADA, "pensamiento-estrategico");
  assert.throws(() => { V.MATERIAS_ESTILO_VIVO.push("pensamiento-estrategico"); }, "la lista se pudo modificar en vivo");
  /* Y si se escribiera en el archivo, la blindada se comprueba antes que la lista. */
  const fuente = readFileSync(new URL("../estiloVivo.js", import.meta.url), "utf8");
  const cuerpo = fuente.slice(fuente.indexOf("export function estiloVivoPara"));
  assert.ok(cuerpo.indexOf("MATERIA_BLINDADA") < cuerpo.indexOf("MATERIAS_ESTILO_VIVO.includes"),
    "la comprobación de la materia blindada ya no va primero");
});

/*
 * Pensamiento Estratégico se monta con la misma pareja que usa FondoMateria
 * (ProveedorMateria + atributosDeMateria) y no con FondoMateria entero: su
 * fondo de ajedrez carga una imagen que el cargador de pruebas no sabe leer.
 * La prueba de abajo, «la materia solo la ponen…», fija que FondoMateria use
 * exactamente esa pareja.
 */
const { ProveedorMateria, atributosDeMateria } = await import("../EstiloVivo.jsx");
const Pantalla = ({ materiaId, children }) =>
  h(ProveedorMateria, { materiaId }, h("div", atributosDeMateria(materiaId), children));

test("★ montada: la compuerta se abre en Contabilidad y Macro, y queda cerrada en Pensamiento Estratégico", async () => {
  for (const [materia, esperado, Raiz] of [["contabilidad", "true", FondoMateria], ["macroeconomia", "true", FondoMateria], ["pensamiento-estrategico", "false", Pantalla]]) {
    const m = await montar(h(Raiz, { materiaId: materia }, h(Sonda), h(SoloEstiloVivo, null, h("i", { "data-nuevo": "" }))));
    try {
      assert.equal(m.caja.querySelector("[data-sonda]").getAttribute("data-sonda"), esperado, materia);
      assert.equal(Boolean(m.caja.querySelector("[data-estilo-vivo]")), esperado === "true", `${materia}: atributo para CSS`);
      assert.equal(Boolean(m.caja.querySelector("[data-nuevo]")), esperado === "true", `${materia}: SoloEstiloVivo`);
    } finally {
      await m.fin();
    }
  }
  /* Fuera de toda materia (inicio, perfil): cerrada. */
  const m = await montar(h(Sonda));
  assert.equal(m.caja.querySelector("[data-sonda]").getAttribute("data-sonda"), "false");
  await m.fin();
});

/* ─────────────── que nadie la rodee ─────────────── */

const SRC = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const fuentes = [];
(function recorrer(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (f !== "__tests__" && f !== "node_modules") recorrer(p); }
    else if (/\.(jsx?|mjs)$/.test(f)) fuentes.push(p);
  }
})(SRC);
const relativa = (p) => p.slice(SRC.length).replace(/\\/g, "/");

test("★ la materia solo la ponen FondoMateria y TopicIndexView: nadie puede disfrazar una pantalla de otra materia", () => {
  const ponen = fuentes.filter((p) => /<ProveedorMateria\b/.test(readFileSync(p, "utf8"))).map(relativa).sort();
  assert.deepEqual(ponen, ["components/TopicIndexView.jsx", "components/shared/FondoMateria.jsx"]);
  /* Y las dos ponen la materia que reciben, no otra fija. */
  const fondo = readFileSync(join(SRC, "components/shared/FondoMateria.jsx"), "utf8");
  assert.match(fondo, /<ProveedorMateria materiaId=\{materiaId\}>/);
  assert.match(fondo, /\{\.\.\.atributosDeMateria\(materiaId\)\}/);
  const indice = readFileSync(join(SRC, "components/TopicIndexView.jsx"), "utf8");
  assert.match(indice, /<ProveedorMateria materiaId=\{subjectId\}>/);
  assert.match(indice, /\{\.\.\.atributosDeMateria\(subjectId\)\}/);
});

test("★ nadie decide la compuerta por su cuenta: ni el atributo a mano, ni la lista, ni la función pura", () => {
  const fuera = fuentes.filter((p) => !relativa(p).startsWith("estilo/"));
  for (const p of fuera) {
    const t = readFileSync(p, "utf8");
    assert.doesNotMatch(t, /["']data-estilo-vivo["']\s*:|data-estilo-vivo=/, `${relativa(p)} pone el atributo a mano`);
    assert.doesNotMatch(t, /MATERIAS_ESTILO_VIVO|estiloVivoPara|MATERIA_BLINDADA/, `${relativa(p)} lee la compuerta sin pasar por useEstiloVivo`);
  }
});

test("★ las vistas de Pensamiento Estratégico se declaran como tales", () => {
  for (const vista of ["PensamientoSistemicoView.jsx", "PorterView.jsx", "IcebergView.jsx"]) {
    const t = readFileSync(join(SRC, "components", vista), "utf8");
    assert.match(t, /<FondoMateria materiaId="pensamiento-estrategico">/, `${vista} ya no dice su materia`);
  }
});

/* ─────────────── la entrada a la página ─────────────── */

test("★ la entrada está apagada hasta que Ukyo la encienda, y cuando se encienda respeta las reglas de la casa", async () => {
  assert.equal(V.ENTRADA.activa, false, "se encendió: si fue Ukyo, actualiza esta prueba con su especificación");
  const m = await montar(h(FondoMateria, { materiaId: "contabilidad" }, h(EstilosEntrada)));
  assert.equal(m.caja.querySelector("[data-estilos-entrada]"), null, "apagada y aun así pintó su hoja");
  await m.fin();

  const css = cssEntrada({ ...V.ENTRADA, activa: true });
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /\binfinite\b/);
  assert.doesNotMatch(css.replaceAll(V.ENTRADA.curva, ""), /\b(ease|linear|ease-in|ease-out|ease-in-out)\b/);
  const fotogramas = css.match(/@keyframes[^{]+\{([\s\S]*?)\}\s*\}/)[1];
  assert.doesNotMatch(fotogramas, /(width|height|top|left|margin|filter|box-shadow)\s*:/);
  assert.match(css, /\[data-estilo-vivo\] \[data-entrada="1"\]/, "la entrada no va detrás de la compuerta");
});
