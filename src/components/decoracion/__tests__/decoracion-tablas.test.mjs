import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA BANDA DE DECORACIÓN DE LAS TABLAS DE POSICIONES (zonas-hanayama.md v3;
 * vida-visual-v1 §5 y §7).
 *
 *   ★ sin `decoracion`, RankingFP y LigaBoard pintan exactamente lo de antes
 *     (el mismo HTML con y sin la prop, quitada la banda)
 *   ★ las piezas son las de Hanayama, letra por letra contra piezas/*.svg
 *   ★ cada banda: ≤ 3 piezas, aria-hidden, sin will-change, solo transform
 *   ★ una sola banda en bucle y una sola Fae en el índice de Estratégico
 *   ★ las poses de Fae por estado (§2) y la pausa (IntersectionObserver y
 *     visibilitychange)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
/* Un IntersectionObserver que la prueba dispara a mano. */
const observados = [];
class IO { constructor(cb) { this.cb = cb; } observe(el) { observados.push({ el, cb: this.cb }); } disconnect() {} }
w.IntersectionObserver = IO;
Object.defineProperty(w.navigator, "hardwareConcurrency", { value: 8, configurable: true });
Object.defineProperty(w.navigator, "deviceMemory", { value: 8, configurable: true });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, IntersectionObserver: IO,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;
const { AuthContext } = await import("../../../auth/AuthProvider.jsx");
const { default: RankingFP } = await import("../../ranking/RankingFP.jsx");
const { default: LigaBoard } = await import("../../ligas/LigaBoard.jsx");
const { default: BandaDecoracion, CSS_BANDA } = await import("../BandaDecoracion.jsx");
const { PIEZAS, FAE_POSES } = await import("../piezas.jsx");
const { estadoRanking, estadoLiga } = await import("../poses.js");
const { PIEZAS_POR_TABLA, decoracionDe } = await import("../../../data/decoracionTablas.js");

const fila = (posicion, nickname, es_tuyo = false) => ({ posicion, nickname, fp: 1000 - posicion, es_tuyo, avatar_shape: null, avatar_palette: null, avatar_level: 1 });
const FILAS = Array.from({ length: 10 }, (_, i) => fila(i + 1, `est_${i + 1}`, i === 5));
const pedir = async () => ({ data: FILAS, error: null });
const FILAS_LIGA = [{ liga: 1, total_ligas: 1, tam_liga: 17, corte_podio: 3, posicion: 1, nickname: "a", fp: 90, es_tuyo: true }];
const cargarTablero = async () => ({ filas: FILAS_LIGA, error: null });
const cargarContexto = async () => ({ contexto: { totalNiveles: 1, ligaAnterior: null, nivelesAnterior: null, transicion: null, activosReparto: null }, error: null });

async function montar(arbol, session = { user: { id: "u" } }) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(h(AuthContext.Provider, { value: { session, perfil: { nickname: "yo" }, pedirCuenta: () => true } }, arbol));
  });
  for (let k = 0; k < 5; k++) await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

test("★ sin `decoracion`, las dos tablas pintan lo de antes; con ella, lo mismo más la banda", async () => {
  for (const [Tabla, props] of [[RankingFP, { subjectId: "contabilidad", titulo: "Ranking", nota: "Solo esta materia", pedir }], [LigaBoard, { subjectId: "pensamiento-estrategico", cargarTablero, cargarContexto }]]) {
    const sin = await montar(h(Tabla, props));
    const con = await montar(h(Tabla, { ...props, decoracion: decoracionDe(props.subjectId) }));
    try {
      assert.equal(sin.caja.querySelector("[data-banda]"), null, "sin la prop apareció una banda");
      const banda = con.caja.querySelector("[data-banda]");
      assert.ok(banda, "con la prop no apareció la banda");
      banda.remove();
      /* Los ids de useId (degradados de los avatares) dependen del orden de montaje: se comparan sin ellos. */
      const sinIds = (html) => html.replace(/av-[^"#)]*?-/g, "av-ID-");
      assert.equal(sinIds(con.caja.innerHTML), sinIds(sin.caja.innerHTML), "con la banda quitada, la tabla no es la misma");
    } finally { sin.desmontar(); con.desmontar(); }
  }
});

test("★ las piezas son las de Hanayama, letra por letra contra piezas/*.svg", () => {
  const dir = new URL("../../../../orquestador/revisiones/decoracion-ranking/piezas/", import.meta.url);
  for (const pieza of [...Object.values(PIEZAS), ...Object.values(FAE_POSES)]) {
    const svg = readFileSync(new URL(pieza.archivo, dir), "utf8");
    for (const [, attrs] of pieza.elementos) {
      for (const [k, v] of Object.entries(attrs)) assert.ok(svg.includes(`${k}="${v}"`), `${pieza.archivo}: ${k}="${v}" no está en el archivo`);
    }
    assert.match(svg, /stroke="#CBDCF2" stroke-opacity="0.45" stroke-width="1.5"/, `${pieza.archivo}: otra familia de trazo`);
  }
  /* §3: las combinaciones; el sello (9) nunca va en una banda. */
  assert.deepEqual(PIEZAS_POR_TABLA, {
    macroeconomia: ["tetraedro", "flecha", "billete"], contabilidad: ["cubo", "libro", "clip"],
    "pensamiento-estrategico": ["tetraedro", "cubo", "torre"], general: ["flecha", "libro", "torre"],
  });
  assert.ok(!("sello" in PIEZAS));
});

test("★ la banda: ≤ 3 piezas, aria-hidden, un solo juego de keyframes, solo transform, sin will-change", async () => {
  const m = await montar(h(BandaDecoracion, { piezas: ["tetraedro", "cubo", "torre", "libro"], bucle: true, fae: "mira" }));
  try {
    const b = m.caja.querySelector("[data-banda]");
    assert.equal(b.getAttribute("aria-hidden"), "true");
    assert.equal(b.querySelectorAll("[data-pieza]").length, 3);
    assert.equal(b.querySelectorAll("[data-fae]").length, 1);
    assert.ok(b.hasAttribute("data-bucle"));
    assert.equal((CSS_BANDA.match(/@keyframes/g) ?? []).length, 1);
    assert.doesNotMatch(CSS_BANDA, /will-change/);
    const fotogramas = CSS_BANDA.slice(CSS_BANDA.indexOf("@keyframes"), CSS_BANDA.indexOf("}", CSS_BANDA.indexOf("50%")) + 1);
    assert.deepEqual([...new Set([...fotogramas.matchAll(/([a-z-]+):\s/g)].map((x) => x[1]))], ["transform"]);
    assert.match(CSS_BANDA, /overflow: hidden/);
  } finally { m.desmontar(); }
});

test("★ pausa fuera de pantalla (IntersectionObserver) y con la pestaña oculta (visibilitychange)", async () => {
  observados.length = 0;
  const m = await montar(h(BandaDecoracion, { piezas: ["cubo"], bucle: true, fae: null }));
  try {
    const b = m.caja.querySelector("[data-banda]");
    const o = observados.find((x) => x.el === b);
    assert.ok(o, "la banda no se observa");
    await act(async () => o.cb([{ isIntersecting: false }]));
    assert.ok(b.hasAttribute("data-pausa"), "fuera de pantalla no se pausa");
    await act(async () => o.cb([{ isIntersecting: true }]));
    assert.ok(!b.hasAttribute("data-pausa"));
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    await act(async () => document.dispatchEvent(new w.Event("visibilitychange")));
    assert.ok(b.hasAttribute("data-pausa"), "con la pestaña oculta no se pausa");
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    await act(async () => document.dispatchEvent(new w.Event("visibilitychange")));
    assert.ok(!b.hasAttribute("data-pausa"));
  } finally { m.desmontar(); }
});

test("★ con movimiento reducido, pose de reposo quieta (shouldRenderStatic)", async () => {
  const antes = w.matchMedia;
  w.matchMedia = (q) => ({ ...antes(q), matches: q.includes("reduce") });
  globalThis.matchMedia = w.matchMedia;
  const m = await montar(h(BandaDecoracion, { piezas: ["cubo", "libro"], bucle: true, fae: "saluda" }));
  try {
    assert.ok(!m.caja.querySelector("[data-banda]").hasAttribute("data-bucle"));
  } finally { m.desmontar(); w.matchMedia = antes; globalThis.matchMedia = antes; }
});

test("★ índice de Estratégico: una sola banda en bucle y una sola Fae (en la liga)", async () => {
  const sid = "pensamiento-estrategico";
  const m = await montar(h("div", null,
    h(LigaBoard, { subjectId: sid, cargarTablero, cargarContexto, decoracion: decoracionDe(sid) }),
    h(RankingFP, { subjectId: sid, titulo: "R", pedir, decoracion: decoracionDe(sid, { bucle: false, fae: false }) })));
  try {
    const bandas = [...m.caja.querySelectorAll("[data-banda]")];
    assert.equal(bandas.length, 2);
    assert.equal(bandas.filter((b) => b.hasAttribute("data-bucle")).length, 1);
    assert.equal(m.caja.querySelectorAll("[data-fae]").length, 1);
    assert.ok(bandas[0].querySelector("[data-fae]"), "Fae no está en la liga");
    assert.ok(!m.caja.innerHTML.includes("sello"));
  } finally { m.desmontar(); }
});

test("★ las vistas pasan la decoración en las tres materias y en el perfil", () => {
  const indice = readFileSync(new URL("../../TopicIndexView.jsx", import.meta.url), "utf8");
  assert.match(indice, /<LigaBoard subjectId=\{subjectId\} decoracion=\{decoracionDe\(subjectId\)\} \/>/);
  assert.match(indice, /decoracion=\{decoracionDe\(subjectId, \{ bucle: !tieneLigas\(subjectId\), fae: !tieneLigas\(subjectId\) \}\)\}/);
  assert.match(readFileSync(new URL("../../PerfilView.jsx", import.meta.url), "utf8"), /decoracion=\{decoracionDe\("general"\)\}/);
});

test("★ las poses de Fae por estado (§2)", () => {
  assert.deepEqual(estadoRanking({ session: null }), { fae: "saluda", quieta: false });
  assert.deepEqual(estadoRanking({ session: {}, cargando: true, filas: null }), { fae: null, quieta: true });
  assert.deepEqual(estadoRanking({ session: {}, error: "x", filas: null }), { fae: null, quieta: true });
  assert.deepEqual(estadoRanking({ session: {}, filas: [] }), { fae: "mira", quieta: false });
  assert.deepEqual(estadoRanking({ session: {}, filas: [fila(1, "a")] }), { fae: "saluda", quieta: false });
  assert.deepEqual(estadoRanking({ session: {}, filas: [fila(3, "a", true)] }), { fae: "celebra", quieta: false });
  assert.deepEqual(estadoRanking({ session: {}, filas: [fila(127, "a", true)] }), { fae: "mira", quieta: false });
  assert.deepEqual(estadoLiga({ session: null }), { fae: "saluda", quieta: false });
  assert.deepEqual(estadoLiga({ session: {}, filas: [] }), { fae: "saluda", quieta: false });
  assert.deepEqual(estadoLiga({ session: {}, filas: [1], enPodio: true }), { fae: "celebra", quieta: false });
  assert.deepEqual(estadoLiga({ session: {}, filas: [1], enPodio: false }), { fae: "mira", quieta: false });
  assert.deepEqual(estadoLiga({ session: {}, filas: [1], enPodio: true, transicion: "reparto" }), { fae: "mira", quieta: false });
  assert.deepEqual(estadoLiga({ session: {}, cargando: true }), { fae: null, quieta: true });
});
