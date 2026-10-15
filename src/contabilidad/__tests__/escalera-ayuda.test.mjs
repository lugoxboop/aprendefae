import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 2 · LA ESCALERA DE AYUDA EN LAS PREGUNTAS DE APRENDER (T7 y T5, Célula C).
 *
 *   · primer error: la pista; segundo: la respuesta con su porqué; sin
 *     pista, como hoy (la devolución de la opción tocada)
 *   · las once piezas de Aprender con preguntas de opción la usan
 *   · ninguna pista nombra la respuesta
 *   · TODO (deuda): toda pregunta tiene pista —llega con las pistas de Near—
 *   · la opción correcta no aparece en las 2 pantallas anteriores, salvo como
 *     dato del enunciado; lo publicado que hoy lo viola queda listado como
 *     deuda conocida, y la lista no puede crecer ni quedar vieja
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, localStorage: w.localStorage,
  HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node, SVGElement: w.SVGElement,
  Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const E = await import("../../components/mecanicas/libros/t7/escaleraAyuda.js");
const { default: ControlInterno } = await import("../../components/mecanicas/libros/t7/ControlInterno.jsx");

const RAIZ = new URL("../../../", import.meta.url);
const DATOS = new URL("src/data/", RAIZ);
const T7 = new URL("src/components/mecanicas/libros/t7/", RAIZ);

/* Las piezas de Aprender de la célula: todo módulo de datos de T7 o de T5 de la célula que exporta un objeto con `pantallas`. */
const PIEZAS = [];
for (const f of readdirSync(DATOS).filter((x) => /^contabilidadT7_.*\.js$|^contabilidadT5_n\d+\.js$/.test(x))) {
  for (const v of Object.values(await import(new URL(f, DATOS).href))) if (v && Array.isArray(v.pantallas) && v.id) PIEZAS.push(v);
}
const PREGUNTAS = PIEZAS.flatMap((p) => p.pantallas.map((s, k) => ({ pieza: p, pantalla: s, k }))).filter((x) => Array.isArray(x.pantalla.opciones) && x.pantalla.opciones.some((o) => o.correcta));
const norm = (s) => String(s).toLowerCase().replace(/[«»"“”]/g, "").replace(/[.:;]\s*$/, "").trim();

/* ═══════════ 1 · LA REGLA ═══════════ */

const P = {
  id: "p", tipo: "eleccion", parrafos: [], pregunta: "¿Cuál?",
  opciones: [
    { id: "a", texto: "La buena.", correcta: true },
    { id: "b", texto: "La mala.", correcta: false, devolucion: "No es esa: mira el libro." },
    { id: "c", texto: "La otra mala.", correcta: false, devolucion: "Tampoco." },
  ],
  pie: null, error: { pie: null }, acierto: { texto: "Así es. Porque el libro lo dice.", pie: null },
};

test("★★★ sin pista, como hoy: cada error muestra la devolución de la opción tocada", () => {
  assert.deepEqual(E.textosDelError(P, P.opciones[1], 1), ["No es esa: mira el libro."]);
  assert.deepEqual(E.textosDelError(P, P.opciones[2], 2), ["Tampoco."]);
});

test("★★★ con pista: el primer error da la pista; el segundo, la respuesta con su porqué", () => {
  const con = { ...P, pista: "Piensa en lo que pide el libro." };
  assert.deepEqual(E.textosDelError(con, con.opciones[1], 1), ["Piensa en lo que pide el libro."]);
  assert.deepEqual(E.textosDelError(con, con.opciones[2], 2), ["La respuesta es «La buena».", "Porque el libro lo dice."]);
  assert.deepEqual(E.textosDelError(con, con.opciones[1], 3), ["La respuesta es «La buena».", "Porque el libro lo dice."]);
  assert.equal(E.sinAsiEs("Así es: $1.000 × 2 = $2.000."), "$1.000 × 2 = $2.000.");
});

/* ═══════════ 2 · MONTADA ═══════════ */

const montar = async (el) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(el); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};
const tocar = async (el) => { assert.ok(el); await act(async () => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); }); };
const error = (caja) => [...caja.querySelectorAll('[data-mensaje="error"] [data-texto]')].map((p) => p.textContent);

test("★★★ montada (ControlInterno): pista al primer error, respuesta y porqué al segundo, y sin pista como hoy", async () => {
  for (const [pantalla, esperado] of [
    [{ ...P, pista: "Piensa en lo que pide el libro." }, [["Piensa en lo que pide el libro."], ["La respuesta es «La buena».", "Porque el libro lo dice."]]],
    [P, [["No es esa: mira el libro."], ["Tampoco."]]],
  ]) {
    const m = await montar(h(ControlInterno, { pieza: { id: "x", titulo: "X", pantallas: [pantalla] }, rotulo: "R" }));
    try {
      for (const [k, op] of ["b", "c"].entries()) {
        await tocar(m.caja.querySelector(`[data-opcion="${op}"]`));
        await tocar(m.caja.querySelector('[data-boton="confirmar"]'));
        assert.deepEqual(error(m.caja), esperado[k], `error ${k + 1}`);
        await tocar(m.caja.querySelector('[data-boton="probar-otra"]'));
      }
    } finally {
      m.desmontar();
    }
  }
});

test("★★★ las once piezas de Aprender con preguntas de opción usan la escalera", () => {
  const usan = readdirSync(T7).filter((f) => f.endsWith(".jsx") && readFileSync(new URL(f, T7), "utf8").includes("textosDelError(pantalla, opcion, fallos)"));
  assert.deepEqual(usan.sort(), [
    "ControlInterno.jsx", "DevolucionesEnPeriodico.jsx", "ElCierreEnPeriodico.jsx", "ImportadosYFletes.jsx", "LaCuentaQueNoSeMueve.jsx",
    "LaCuentaQueSiSeMueve.jsx", "LaFacturaCompleta.jsx", "LaVentaEnDosAsientos.jsx", "PantallasT7_2.jsx", "PantallasT7_3.jsx", "TresFormas.jsx",
  ]);
  /* Y ninguna muestra ya la devolución sola en una pregunta de opción. */
  for (const f of usan) assert.doesNotMatch(readFileSync(new URL(f, T7), "utf8"), /textos=\{\[opcion\.devolucion\]\}/, f);
});

/* ═══════════ 3 · LAS PISTAS ═══════════ */

test("★★★ ninguna pista nombra la respuesta", () => {
  assert.ok(PREGUNTAS.length >= 40, `solo ${PREGUNTAS.length} preguntas`);
  const malas = PREGUNTAS.filter((x) => x.pantalla.pista && norm(x.pantalla.pista).includes(norm(x.pantalla.opciones.find((o) => o.correcta).texto)));
  assert.deepEqual(malas.map((x) => `${x.pieza.id} · ${x.pantalla.id}`), []);
});

test("★★ toda pregunta de Aprender tiene su pista", { todo: "Las pistas las está escribiendo Near; cuando entren, esta prueba pasa a ser obligatoria." }, () => {
  const sin = PREGUNTAS.filter((x) => !x.pantalla.pista).map((x) => `${x.pieza.id} · ${x.pantalla.id}`);
  assert.deepEqual(sin, []);
});

/* ═══════════ 4 · LA RESPUESTA NO SE ADELANTA ═══════════ */

/*
 * Para cada pregunta, el texto de su opción correcta no puede estar en las 2
 * pantallas anteriores. Cuenta todo el texto de esas pantallas salvo lo que es
 * dato o interfaz: el enunciado y la ficha (los datos), las opciones, los
 * pies, las figuras y los botones.
 */
const PERMITIDAS = new Set(["opciones", "pie", "id", "tipo", "boton", "enunciado", "ficha", "datos", "error", "figura", "alt"]);
const textos = (v, clave = null, out = []) => {
  if (clave && PERMITIDAS.has(clave)) return out;
  if (typeof v === "string") out.push([clave, v]);
  else if (Array.isArray(v)) v.forEach((x) => textos(x, clave, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) textos(x, k, out);
  return out;
};
function adelantos() {
  const out = new Set();
  for (const { pieza, pantalla, k } of PREGUNTAS) {
    const c = norm(pantalla.opciones.find((o) => o.correcta).texto);
    for (const d of [1, 2]) {
      const prev = pieza.pantallas[k - d];
      if (!prev) continue;
      for (const [clave] of textos(prev).filter(([, t]) => norm(t).includes(c))) out.add(`${pieza.id} · ${pantalla.id} ← ${prev.id}.${clave}`);
    }
  }
  return [...out].sort();
}

/* Lo publicado que hoy lo viola (medido el 15 de octubre de 2026): deuda conocida, en revisión. Se quita de aquí al corregirse. */
const DEUDA = [
  "t7-1-a1-la-cuenta-que-no-se-mueve · pregunta-conteo ← la-consecuencia.parrafos",
  "t7-1-a1-la-cuenta-que-no-se-mueve · pregunta-conteo ← pregunta-compra.texto",
  "t7-3-descuento-comercial · dos-clases ← portada.objetivo",
  "t7-3-descuento-condicionado · cual-le-toca ← condiciones.lleva",
  "t7-3-descuento-condicionado · cual-le-toca ← condiciones.parrafos",
  "t7-3-descuento-condicionado · cual-le-toca ← ejemplo.lleva",
  "t7-3-descuento-condicionado · sobre-que ← ejemplo.despues",
  "t7-3-descuento-en-dos-libros · cierre ← el-pago.despues",
  "t7-3-descuento-en-dos-libros · cierre ← el-pago.lado",
  "t7-3-descuento-en-dos-libros · cierre ← el-pago.texto",
  "t7-3-descuento-en-dos-libros · cierre ← repaso.lado",
  "t7-3-descuento-en-dos-libros · cierre ← repaso.parrafos",
  "t7-3-descuento-en-dos-libros · el-pago ← repaso.lado",
  "t7-3-descuento-en-dos-libros · el-pago ← repaso.parrafos",
  "t7-3-descuentos-en-cadena · ejemplo ← en-cadena.parrafos",
  "t7-3-provision-inventarios · la-perdida ← ejemplo.cuenta",
  "t7-3-provision-inventarios · la-perdida ← que-es.parrafos",
  "t7-3-sobrantes-y-faltantes · faltante ← sobrante.lado",
  "t7-3-sobrantes-y-faltantes · faltante ← sobrante.parrafos",
];

test("★★★ la opción correcta no se adelanta en las 2 pantallas anteriores (fuera de la deuda conocida)", () => {
  const hoy = adelantos();
  assert.deepEqual(hoy.filter((x) => !DEUDA.includes(x)), [], "adelantos nuevos");
  /* La deuda no puede quedar vieja: lo que ya se corrigió sale de la lista. */
  assert.deepEqual(DEUDA.filter((x) => !hoy.includes(x)), [], "ya corregidos: sácalos de DEUDA");
});
