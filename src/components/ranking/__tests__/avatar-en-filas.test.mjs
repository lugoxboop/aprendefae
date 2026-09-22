import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL AVATAR EN LAS FILAS DEL RANKING (36 px) Y DE LA LIGA (24 px).
 *
 * Se montan los dos tableros A LA VEZ, en la misma página, con listas largas:
 * el ranking con empates en el top —rank() deja entrar a todos los empatados,
 * así que una tabla de "top 10" puede traer treinta filas— y la liga con un
 * podio grande. Es el peor caso real de muchos avatares en una sola pantalla, y
 * es donde un id de degradado repetido pintaría a todos con el color del primero.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
w.innerWidth = 375;
w.innerHeight = 812;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const { AuthContext } = await import("../../../auth/AuthProvider.jsx");
const { default: RankingFP } = await import("../RankingFP.jsx");
const { default: LigaBoard } = await import("../../ligas/LigaBoard.jsx");
const { FORMAS, PALETAS } = await import("../../../avatar/generador.js");

/* Una combinación distinta por estudiante, recorriendo formas, paletas y niveles. */
const combinacion = (i) => ({
  avatar_shape: FORMAS[i % FORMAS.length],
  avatar_palette: PALETAS[Math.floor(i / FORMAS.length) % PALETAS.length],
  avatar_level: (i % 4) + 1,
});

/* 30 filas en el top: los empates de rank() hacen que posicion <= 10 traiga a muchos. */
const FILAS_RANKING = Array.from({ length: 30 }, (_, i) => ({
  posicion: Math.min(10, 1 + Math.floor(i / 3)),
  nickname: `est_${String(i + 1).padStart(2, "0")}`,
  fp: 900 - Math.floor(i / 3) * 40,
  es_tuyo: i === 7,
  ...combinacion(i),
}));

/* La liga: un podio de 12 (empates en el borde) y tu fila fuera de él. */
const FILAS_LIGA = [
  ...Array.from({ length: 12 }, (_, i) => ({
    liga: 1, total_ligas: 1, tam_liga: 40, corte_podio: 6,
    posicion: 1 + Math.floor(i / 2), nickname: `liga_${i + 1}`, fp: 300 - i * 10,
    es_tuyo: false, en_podio: true, ...combinacion(i + 3),
  })),
  { liga: 1, total_ligas: 1, tam_liga: 40, corte_podio: 6, posicion: 23, nickname: "yo", fp: 40, es_tuyo: true, en_podio: false, ...combinacion(2) },
];

const pedir = async () => ({ data: FILAS_RANKING, error: null });
const cargarTablero = async () => ({ filas: FILAS_LIGA, error: null });
const cargarContexto = async () => ({ contexto: { totalNiveles: 1, ligaAnterior: null, nivelesAnterior: null, transicion: null, activosReparto: null }, error: null });

async function montarPantalla() {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => {
    raiz.render(
      React.createElement(AuthContext.Provider, { value: { session: { user: { id: "u" } }, perfil: { nickname: "yo" }, pedirCuenta: () => true } },
        React.createElement("div", null,
          React.createElement(LigaBoard, { subjectId: "pensamiento-estrategico", cargarTablero, cargarContexto }),
          React.createElement(RankingFP, { subjectId: "pensamiento-estrategico", titulo: "Ranking de la materia", pedir }),
          React.createElement(RankingFP, { titulo: "Ranking general", pedir }),
        )),
    );
  });
  for (let k = 0; k < 5; k++) await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}

test("cada fila del ranking lleva el avatar de ESE estudiante, a 36 px", async () => {
  const m = await montarPantalla();
  try {
    const rankings = [...m.caja.querySelectorAll("h3")].filter((h) => /Ranking/.test(h.textContent)).map((h) => h.closest("div").parentElement);
    assert.equal(rankings.length, 2);
    const avatares = [...rankings[0].querySelectorAll("svg[data-avatar]")];
    assert.equal(avatares.length, 30, "una por fila, las treinta");
    avatares.forEach((svg, i) => {
      const c = combinacion(i);
      assert.equal(svg.dataset.avatar, `${c.avatar_shape}-${c.avatar_palette}-${c.avatar_level}`, `fila ${i + 1}`);
      assert.equal(svg.getAttribute("width"), "36");
    });
  } finally { m.desmontar(); }
});

test("el podio de liga lleva los avatares a 24 px, y tu fila privada no pinta avatar ajeno", async () => {
  const m = await montarPantalla();
  try {
    const liga = m.caja.querySelector("section");
    const avatares = [...liga.querySelectorAll("ol svg[data-avatar]")];
    assert.equal(avatares.length, 12);
    avatares.forEach((svg, i) => {
      const c = combinacion(i + 3);
      assert.equal(svg.dataset.avatar, `${c.avatar_shape}-${c.avatar_palette}-${c.avatar_level}`);
      assert.equal(svg.getAttribute("width"), "24");
    });
    /* La línea de tu puesto exacto sigue siendo texto, fuera del tablero público. */
    assert.match(liga.textContent, /Estás en el puesto #23 de 40/);
  } finally { m.desmontar(); }
});

test("a 36 y 24 px ningún avatar lleva halo ni cuerdas, aunque sea nivel IV", async () => {
  const m = await montarPantalla();
  try {
    const niveles4 = [...m.caja.querySelectorAll("svg[data-avatar$='-4']")];
    assert.ok(niveles4.length >= 10, `hay ${niveles4.length} avatares de nivel IV en pantalla`);
    for (const svg of niveles4) {
      assert.equal(svg.querySelector("[data-halo]"), null);
      assert.equal(svg.querySelectorAll("[data-cuerda]").length, 0);
      /* El resto del nivel se queda: el lustre sigue ahí. */
      assert.ok(svg.querySelector("radialGradient"));
    }
  } finally { m.desmontar(); }
});

test("CON LA PANTALLA LLENA —72 avatares— ningún id de degradado se repite y cada uno apunta al suyo", async () => {
  const m = await montarPantalla();
  try {
    const svgs = [...m.caja.querySelectorAll("svg[data-avatar]")];
    assert.equal(svgs.length, 30 + 30 + 12, "dos rankings de 30 y un podio de 12");

    const ids = [...m.caja.querySelectorAll("svg[data-avatar] linearGradient, svg[data-avatar] radialGradient")].map((g) => g.id);
    assert.equal(new Set(ids).size, ids.length, `${ids.length - new Set(ids).size} ids repetidos`);

    for (const svg of svgs) {
      const propios = new Set([...svg.querySelectorAll("linearGradient, radialGradient")].map((g) => g.id));
      const usados = [...svg.querySelectorAll("polygon")]
        .map((el) => el.getAttribute("fill") ?? "")
        .filter((f) => f.startsWith("url(#"))
        .map((f) => f.slice(5, -1));
      for (const id of usados) assert.ok(propios.has(id), `${svg.dataset.avatar}: ${id} no es suyo`);
    }
  } finally { m.desmontar(); }
});

test("sin las columnas nuevas (servidor todavía sin la 0037) la fila pinta el avatar por defecto, no se rompe", async () => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  const viejas = async () => ({ data: [{ posicion: 1, nickname: "antes", fp: 10, es_tuyo: false }], error: null });
  await act(async () => {
    raiz.render(React.createElement(AuthContext.Provider, { value: { session: { user: { id: "u" } }, perfil: null, pedirCuenta: () => true } },
      React.createElement(RankingFP, { pedir: viejas })));
  });
  for (let k = 0; k < 5; k++) await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  try {
    assert.equal(caja.querySelector("svg[data-avatar]").dataset.avatar, "decaedro-marea-1");
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

test("las filas no repiten a mano la regla de los 40 px: la aplica el generador", () => {
  for (const archivo of ["../RankingFP.jsx", "../../ligas/LigaBoard.jsx"]) {
    const fuente = readFileSync(new URL(archivo, import.meta.url), "utf8");
    assert.ok(!/showHalo|chords|UMBRAL_DETALLE|ajustarAlTamano/.test(fuente), `${archivo} no debe tocar halo ni cuerdas`);
    assert.ok(/<Avatar perfil=\{\w+\} tamano=\{TAMANOS\.(ranking|liga)\}/.test(fuente), `${archivo} usa los tamaños de uso`);
  }
});
