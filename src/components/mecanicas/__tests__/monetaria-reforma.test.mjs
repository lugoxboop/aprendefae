/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · LA REFORMA DEL APRENDER
 *
 * Tres defectos encontrados leyendo las piezas, y el guardia de cada uno.
 *
 * 1. LA CIFRA ESTABA COPIADA. salaDeMaquinas.jsx pintaba «12,0%» escrito a
 *    mano en el dibujo, y la regla del propio tema —en politicaMonetaria.js—
 *    dice que las únicas cifras reales son las de DATOS_VERIFICADOS y que «se
 *    importan, no se copian». El día que el Banco mueva la tasa, alguien
 *    actualiza el dato y el dibujo sigue diciendo lo de antes. Nada se pone
 *    rojo: el sitio miente en silencio.
 *
 * 2. LA PIEZA 1 MOSTRABA LA MÁQUINA DE LA PIEZA 3. Su capa 3 era
 *    ExploraVolante, que pinta EscenaTransmisiones con sus tres poleas. Un
 *    estudiante que apenas va en «¿Quién Manda Aquí?» jugaba con correas que
 *    nadie le explicó, y las capas 2 y 3 de la MISMA pieza le enseñaban dos
 *    máquinas distintas. Ahora tiene ExploraMargen, sobre su propia escena.
 *
 * 3. LA PRUEBA COPIABA EL CABLEADO. El arreglo anterior no habría puesto roja
 *    ninguna prueba, porque monetaria-aprender.test.mjs tiene su propia lista
 *    de piezas escrita a mano: el día que la vista cambie y la lista no, la
 *    prueba seguiría verde probando una pantalla que ya no existe. La tercera
 *    prueba de aquí lee la vista como texto y compara.
 *
 * Y lo que pidió el profesor para el quiz: que la pieza de las transmisiones
 * llegue hasta el consumo, la inversión y el costo de la deuda —la del hogar
 * y la del Gobierno—, que es donde terminaba el temario y no la pieza.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  HTMLInputElement: w.HTMLInputElement,
  Event: w.Event, MouseEvent: w.MouseEvent, getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const S = await import("../maquinas/salaDeMaquinas.jsx");
const D = await import("../../../data/politicaMonetaria.js");

const FUENTE = readFileSync("src/components/mecanicas/maquinas/salaDeMaquinas.jsx", "utf8");
const VISTA = readFileSync("src/components/PoliticaMonetariaView.jsx", "utf8");

function montar(el) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(el));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const click = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto);
const mover = (input, valor) => act(() => {
  Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(input, String(valor));
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
});

/* ─────────────── 1 · la cifra se lee, nunca se copia ─────────────── */

test("la tasa del dibujo sale de DATOS_VERIFICADOS: ninguna cifra de tasa escrita a mano en la escena", () => {
  /* Autoguardia: si el archivo se moviera o se vaciara, esto no puede pasar en verde. */
  assert.ok(FUENTE.length > 10000, `salaDeMaquinas.jsx tiene ${FUENTE.length} caracteres: ¿se leyó el archivo correcto?`);
  assert.match(FUENTE, /import \{ DATOS_VERIFICADOS \} from "\.\.\/\.\.\/\.\.\/data\/politicaMonetaria\.js"/);

  /*
   * Cualquier porcentaje con decimal escrito a mano en el código. Se permite
   * en comentarios —ahí explican el historial—, no en lo que se pinta.
   */
  const sinComentarios = FUENTE.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const copiadas = sinComentarios.match(/\d+,\d+\s?%/g) ?? [];
  assert.deepEqual(copiadas, [], `cifras de tasa copiadas en el código: ${copiadas.join(", ")}. Van en DATOS_VERIFICADOS y se importan.`);

  /* Y lo que se pinta es exactamente el dato. */
  const m = montar(React.createElement(S.EscenaQuienManda, { resaltar: ["volante"] }));
  try {
    assert.ok(m.caja.textContent.includes(D.DATOS_VERIFICADOS.tasaIntervencion),
      `la escena no pinta ${D.DATOS_VERIFICADOS.tasaIntervencion}`);
  } finally { m.desmontar(); }
});

/* ─────────────── 2 · la pieza 1 tiene su propia máquina ─────────────── */

test("ExploraMargen usa la escena de su propia pieza y lleva la tasa hasta el bolsillo, sin inventar magnitudes", () => {
  const m = montar(React.createElement(S.ExploraMargen));
  try {
    const svg = m.caja.querySelector("svg");
    assert.ok(svg, "la exploración de la pieza 1 tiene que pintar una escena");
    /* Su escena, no la de las transmisiones. */
    assert.ok(m.caja.textContent.includes("Casa de Nariño"), "no es la escena de «¿Quién Manda Aquí?»");
    assert.ok(!/polea|Canal del/i.test(svg.getAttribute("aria-label") ?? ""), "pintó la máquina de la pieza 3");

    const eslabones = m.caja.querySelectorAll("[data-eslabones] li");
    assert.equal(eslabones.length, 4, "la cadena va del volante a Usted en cuatro eslabones");

    const remate = () => m.caja.querySelector("[data-remate-margen]").textContent;
    assert.ok(remate().includes(D.DATOS_VERIFICADOS.tasaIntervencion), "el remate nombra la tasa verificada");
    const quieta = m.caja.querySelector("[data-eslabones]").textContent;

    click(boton(m.caja, "La sube"));
    const movida = m.caja.querySelector("[data-eslabones]").textContent;
    assert.notEqual(movida, quieta, "mover la tasa tiene que cambiar la cadena");
    assert.ok(/no es lo que usted paga/i.test(remate()), "falta el remate del paso 4: la tasa no es la que usted paga");
    assert.ok(/margen/i.test(movida), "la cadena tiene que nombrar el margen del banco");

    /* Ninguna magnitud inventada: solo la cifra verificada puede aparecer. */
    const cifras = (m.caja.textContent.match(/\d+,\d+\s?%/g) ?? []).filter((c) => c !== D.DATOS_VERIFICADOS.tasaIntervencion);
    assert.deepEqual(cifras, [], `magnitudes sin verificar en pantalla: ${cifras.join(", ")}`);
  } finally { m.desmontar(); }
});

/* ─────────────── 3 · la prueba no copia el cableado ─────────────── */

test("la vista cablea la pieza 1 a ExploraMargen: si cambia, esta prueba se pone roja", () => {
  assert.ok(VISTA.includes("APRENDER_QUIEN_MANDA") && VISTA.includes("APRENDER_INSTRUMENTOS") && VISTA.includes("APRENDER_TRANSMISIONES"),
    "¿se leyó PoliticaMonetariaView.jsx? no están las tres piezas");
  assert.match(VISTA, /\{ pieza: APRENDER_QUIEN_MANDA, Escena: EscenaQuienManda, Exploracion: ExploraMargen \}/);
  assert.ok(!/APRENDER_QUIEN_MANDA[^\n]*ExploraVolante/.test(VISTA),
    "la pieza 1 volvió a la máquina de las transmisiones");
});

/* ─────────────── 4 · las transmisiones llegan al bolsillo ─────────────── */

test("las transmisiones muestran consumo, inversión y costo de la deuda, y el sentido se invierte con el volante", () => {
  const m = montar(React.createElement(S.ExploraVolante, { conReloj: true }));
  try {
    const t = () => m.caja.textContent;
    for (const r of ["CONSUMO", "INVERSIÓN", "COSTO DE LA DEUDA"]) {
      assert.ok(t().includes(r), `falta la lectura de ${r}`);
    }
    const rango = m.caja.querySelector('input[type="range"]');
    assert.ok(rango, "la exploración necesita su barra de giro");
    const estado = () => m.caja.querySelector("[data-estado-volante]").textContent;

    mover(rango, -60);
    const soltando = estado();
    assert.match(soltando, /Soltando/);
    assert.match(soltando, /suben el consumo y la inversión/i);
    assert.match(soltando, /baja lo que cuesta la deuda/i);
    assert.match(soltando, /Gobierno/, "el endeudamiento público es parte del énfasis del temario");

    mover(rango, 60);
    const apretando = estado();
    assert.match(apretando, /Apretando/);
    assert.match(apretando, /bajan el consumo y la inversión/i);
    assert.match(apretando, /sube lo que cuesta la deuda/i);
    assert.notEqual(apretando, soltando, "el sentido tiene que invertirse");

    /* El rezago, dicho y sin inventar en qué trimestre llega cada canal. */
    assert.match(apretando, /todavía no se ve completo/i);
    assert.ok(!/trimestre 3|trimestre 4|en el (segundo|tercer) trimestre/i.test(apretando),
      "la ficha no dice en qué trimestre llega cada canal: no se inventa");
  } finally { m.desmontar(); }
});
