import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CARA DEL ESTUDIANTE EN LAS FILAS DEL RANKING (36 px) Y DE LA LIGA (24 px).
 *
 * Desde que la mascota es el avatar, cada fila pinta la MASCOTA de ese
 * estudiante: la que eligió, o —en estas filas de prueba, que no traen mascota
 * elegida— la de fábrica, estable por su identidad (mascotaDe). Se montan los
 * dos tableros a la vez, con listas largas, para ver que cada fila lleva su
 * propia cara y a su tamaño.
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
const { mascotaDe, especiePorDefecto } = await import("../../../mascota/mascotas.js");

/* 30 filas en el top: los empates de rank() hacen que posicion <= 10 traiga a muchos. */
const FILAS_RANKING = Array.from({ length: 30 }, (_, i) => ({
  posicion: Math.min(10, 1 + Math.floor(i / 3)),
  nickname: `est_${String(i + 1).padStart(2, "0")}`,
  fp: 900 - Math.floor(i / 3) * 40,
  es_tuyo: i === 7,
}));

/* La liga: un podio de 12 (empates en el borde) y tu fila fuera de él. */
const FILAS_LIGA = [
  ...Array.from({ length: 12 }, (_, i) => ({
    liga: 1, total_ligas: 1, tam_liga: 40, corte_podio: 6,
    posicion: 1 + Math.floor(i / 2), nickname: `liga_${i + 1}`, fp: 300 - i * 10,
    es_tuyo: false, en_podio: true,
  })),
  { liga: 1, total_ligas: 1, tam_liga: 40, corte_podio: 6, posicion: 23, nickname: "yo", fp: 40, es_tuyo: true, en_podio: false },
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

test("cada fila del ranking lleva la mascota de ESE estudiante, a 36 px", async () => {
  const m = await montarPantalla();
  try {
    const rankings = [...m.caja.querySelectorAll("h3")].filter((h) => /Ranking/.test(h.textContent)).map((h) => h.closest("div").parentElement);
    assert.equal(rankings.length, 2);
    const mascotas = [...rankings[0].querySelectorAll("svg[data-mascota]")];
    assert.equal(mascotas.length, 30, "una por fila, las treinta");
    mascotas.forEach((svg, i) => {
      assert.equal(svg.dataset.mascota, mascotaDe(FILAS_RANKING[i]).especie, `fila ${i + 1}`);
      assert.equal(svg.getAttribute("width"), "36");
    });
  } finally { m.desmontar(); }
});

test("el podio de liga lleva las mascotas a 24 px, y tu puesto exacto sigue siendo texto", async () => {
  const m = await montarPantalla();
  try {
    const liga = m.caja.querySelector("section");
    const mascotas = [...liga.querySelectorAll("ol svg[data-mascota]")];
    assert.equal(mascotas.length, 12);
    mascotas.forEach((svg, i) => {
      assert.equal(svg.dataset.mascota, mascotaDe(FILAS_LIGA[i]).especie);
      assert.equal(svg.getAttribute("width"), "24");
    });
    /* La línea de tu puesto exacto sigue siendo texto, fuera del tablero público. */
    assert.match(liga.textContent, /Estás en el puesto #23 de 40/);
  } finally { m.desmontar(); }
});

test("con la pantalla llena hay una mascota por fila: 30 + 30 + 12", async () => {
  const m = await montarPantalla();
  try {
    const mascotas = [...m.caja.querySelectorAll("svg[data-mascota]")];
    assert.equal(mascotas.length, 30 + 30 + 12, "dos rankings de 30 y un podio de 12");
    for (const svg of mascotas) assert.ok(svg.querySelector("circle"), "y cada una lleva dibujo dentro");
  } finally { m.desmontar(); }
});

test("sin las columnas de mascota, la fila pinta la mascota de fábrica y no se rompe", async () => {
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
    assert.equal(caja.querySelector("svg[data-mascota]").dataset.mascota, especiePorDefecto("antes"));
  } finally { act(() => raiz.unmount()); caja.remove(); }
});

test("las filas usan AvatarEstudiante con los tamaños de uso, y no tocan halo ni cuerdas", () => {
  for (const archivo of ["../RankingFP.jsx", "../../ligas/LigaBoard.jsx"]) {
    const fuente = readFileSync(new URL(archivo, import.meta.url), "utf8");
    assert.ok(!/showHalo|chords|UMBRAL_DETALLE|ajustarAlTamano/.test(fuente), `${archivo} no debe tocar halo ni cuerdas`);
    assert.ok(/<AvatarEstudiante perfil=\{\w+\} tamano=\{TAMANOS\.(ranking|liga)\}/.test(fuente), `${archivo} usa los tamaños de uso`);
  }
});
