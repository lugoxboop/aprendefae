/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · APRENDER — las tres piezas de cuatro capas.
 *
 *   · cada pieza pinta sus cuatro capas, en orden;
 *   · la capa 2 avanza paso a paso con el texto literal de la ficha, y cada
 *     paso resalta lo que dice y apaga el resto;
 *   · la capa 4 no califica: la respuesta de referencia sale solo a pedido;
 *   · la exploración de los instrumentos sigue las reglas que enseña la pieza;
 *   · ni coral (no hay errores aquí) ni cifras que no sean las verificadas;
 *   · y nada de Aprender paga FP: no está en el catálogo del servidor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

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

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;

const { default: CuatroCapas } = await import("../maquinas/CuatroCapas.jsx");
const S = await import("../maquinas/salaDeMaquinas.jsx");
const D = await import("../../../data/politicaMonetaria.js");
const F = await import("../../../data/pmFabricaDelDinero.js");
const FD = await import("../maquinas/fabricaDelDinero.jsx");
const { SUBJECTS, APRENDER, actividadesDeTipo } = await import("../../../data/subjects.js");

const PIEZAS = [
  [D.APRENDER_QUIEN_MANDA, S.EscenaQuienManda, () => React.createElement(S.ExploraVolante)],
  [D.APRENDER_INSTRUMENTOS, S.EscenaInstrumentos, S.ExploraInstrumentos],
  [D.APRENDER_TRANSMISIONES, S.EscenaTransmisiones, () => React.createElement(S.ExploraVolante, { conReloj: true })],
  /* La cuarta, de la Célula B: escena y exploración en fabricaDelDinero.jsx. */
  [F.APRENDER_FABRICA, FD.EscenaFabrica, FD.ExploraFabrica],
];

function montar(el) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(el));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const click = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const boton = (caja, texto) => [...caja.querySelectorAll("button")].find((b) => b.textContent.trim() === texto);

for (const [pieza, Escena, Exploracion] of PIEZAS) {
  test(`${pieza.id}: cuatro capas, pasos literales con su resaltado, y la referencia solo a pedido`, () => {
    const m = montar(React.createElement(CuatroCapas, { pieza, Escena, Exploracion }));
    try {
      assert.deepEqual([...m.caja.querySelectorAll("[data-capa]")].map((c) => c.getAttribute("data-capa")), ["1", "2", "3", "4"]);
      for (const n of pieza.nombres) assert.ok(m.caja.textContent.includes(n.definicion), `capa 1: ${n.termino}`);

      const capa2 = m.caja.querySelector('[data-capa="2"]');
      pieza.pasos.forEach((paso, k) => {
        assert.equal(capa2.querySelector("[data-texto-paso]").textContent, paso.texto, `paso ${k + 1}, literal`);
        const partes = [...capa2.querySelectorAll("svg [data-parte]")];
        for (const id of paso.resaltar) {
          const p = partes.find((x) => x.getAttribute("data-parte") === id);
          assert.ok(p, `paso ${k + 1}: la escena tiene la parte «${id}»`);
          assert.ok(!p.getAttribute("class").includes("fae-sm-apagada"), `paso ${k + 1}: «${id}» resaltada`);
        }
        assert.ok(partes.some((x) => x.getAttribute("class").includes("fae-sm-apagada")), `paso ${k + 1}: algo queda apagado`);
        if (k < pieza.pasos.length - 1) click(boton(capa2, "Siguiente"));
      });
      assert.ok(boton(capa2, "Siguiente").disabled, "no hay paso de más");

      assert.equal(m.caja.querySelector("[data-respuesta]"), null, "la referencia no sale sola");
      assert.ok(m.caja.textContent.includes(pieza.pregunta));
      click(boton(m.caja, "Ver la respuesta de referencia"));
      assert.equal(m.caja.querySelector("[data-respuesta]").textContent, pieza.respuesta);

      const html = m.caja.innerHTML;
      assert.ok(!/E76F51|231,\s*111,\s*81/i.test(html), "ni coral: aquí no hay errores");
      /* Las únicas cifras con % son las del bloque verificado. */
      /* Sin los <style>: los porcentajes de los keyframes no son cifras económicas. */
      const copia = m.caja.cloneNode(true);
      copia.querySelectorAll("style").forEach((s) => s.remove());
      const cifras = [...copia.textContent.matchAll(/\d+(?:,\d+)?\s?%/g)].map((x) => x[0].replace(/\s/g, ""));
      const validas = new Set(["12,0%", "10,25%", "2%", "4%", "3%"]);
      assert.deepEqual(cifras.filter((c) => !validas.has(c)), [], "cifra fuera del bloque verificado");
    } finally {
      m.desmontar();
    }
  });
}

test("la exploración de los cuatro instrumentos sigue las reglas de la pieza", () => {
  const e = (x) => S.efectosInstrumentos({ tasa: "no", oma: "no", encaje: "no", dolares: "no", ...x });
  assert.deepEqual(e({}), { liquidez: 0, peso: 0 });
  assert.equal(e({ oma: "comprar" }).liquidez, 1, "comprar títulos mete plata");
  assert.equal(e({ oma: "vender" }).liquidez, -1, "vender títulos la quita");
  assert.equal(e({ encaje: "subir" }).liquidez, -1, "subir el encaje deja menos plata para prestar");
  assert.equal(e({ tasa: "subir" }).liquidez, -1, "contractiva: quitar liquidez");
  assert.equal(e({ tasa: "bajar" }).liquidez, 1, "expansiva: meter liquidez");
  assert.equal(e({ dolares: "comprar" }).peso, -1, "comprar dólares debilita el peso");
  assert.equal(e({ dolares: "vender" }).peso, 1, "vender dólares lo fortalece");
  assert.equal(e({ tasa: "subir" }).peso, 1, "una tasa más alta atrae capital: el peso se fortalece");
  assert.equal(e({ dolares: "comprar" }).liquidez, 0, "la intervención cambiaria apunta al tipo de cambio");

  const m = montar(React.createElement(S.ExploraInstrumentos));
  try {
    click(boton(m.caja, "Comprar dólares"));
    assert.match(m.caja.querySelector("[data-efectos]").textContent, /Peso: más débil/);
  } finally {
    m.desmontar();
  }
});

test("Aprender no paga: las tres piezas son APRENDER y no están en el catálogo del servidor", () => {
  const tema = SUBJECTS.macroeconomia.topics.find((t) => t.id === "politica-monetaria");
  const ids = actividadesDeTipo(tema, APRENDER).map((a) => a.id);
  assert.deepEqual(ids, ["quien-manda-aqui", "los-cuatro-instrumentos", "las-tres-transmisiones"]);
  const sql = readdirSync("supabase/migrations").map((f) => readFileSync(`supabase/migrations/${f}`, "utf8")).join("\n");
  for (const id of ids) assert.ok(!sql.includes(`'${id}'`), `${id} no puede tener fila en actividad_catalogo`);
});

/* ═══════════ LA FÁBRICA DEL DINERO · LO QUE SE PUEDE PONER ROJO ═══════════ */

test("la-fabrica-del-dinero: la escalera — cada vuelta deposita lo prestado en la anterior, el total crece, y con más encaje es más corta", () => {
  /* El ejemplo del encargo, literal: 100 → 190 → 271. */
  const juan = F.escaleraDe(100, 10, 3);
  assert.deepEqual(juan.map((f) => [f.deposita, f.guarda, f.presta, f.total]), [[100, 10, 90, 100], [90, 9, 81, 190], [81, 8.1, 72.9, 271]]);
  for (const encaje of [5, 10, 20, 30]) {
    const filas = F.escaleraDe(1000, encaje, 8);
    filas.forEach((f, k) => {
      assert.equal(f.guarda + f.presta, f.deposita, `vuelta ${f.vuelta}: lo que entra se guarda o se presta`);
      if (k > 0) {
        assert.equal(f.deposita, filas[k - 1].presta, `vuelta ${f.vuelta}: deposita lo prestado en la anterior`);
        assert.ok(f.total > filas[k - 1].total, "el total crece");
        assert.ok(f.deposita < filas[k - 1].deposita, "cada peldaño es más bajo que el anterior");
      }
    });
    assert.ok(filas.at(-1).total < F.techoDe(1000, encaje), "nunca pasa del techo que deduce el estudiante");
  }
  /* El freno: con más encaje, la escalera es más corta en CADA vuelta (después de la primera). */
  const baja = F.escaleraDe(1000, 10, 6);
  const alta = F.escaleraDe(1000, 20, 6);
  for (let k = 1; k < 6; k++) assert.ok(alta[k].total < baja[k].total, `vuelta ${k + 1}: subir el encaje acorta`);
});

test("la-fabrica-del-dinero: la escena tiene los 14 ids y pinta la escalera del ejemplo; la exploración la acorta al subir el encaje", () => {
  const m = montar(React.createElement(FD.EscenaFabrica, { resaltar: [] }));
  try {
    const ids = [...m.caja.querySelectorAll("svg [data-parte]")].map((p) => p.getAttribute("data-parte"));
    assert.deepEqual([...ids].sort(), [...F.IDS_ESCENA].sort(), "los 14 ids del encargo, ni uno más ni uno menos");
    const peldanos = [...m.caja.querySelectorAll('[data-parte="escalera"] [data-peldano]')].map((g) => g.textContent);
    assert.deepEqual(peldanos, ["100", "190", "271"]);
  } finally {
    m.desmontar();
  }
  const x = montar(React.createElement(FD.ExploraFabrica));
  try {
    const ultimo = () => Number(x.caja.querySelector("[data-escalera-explora] [data-vuelta]:last-child").getAttribute("data-total"));
    const totales = [];
    for (const e of F.EXPLORA_ENCAJES) {
      click(x.caja.querySelector(`[data-encaje="${e}"]`));
      assert.equal(x.caja.querySelector(`[data-encaje="${e}"]`).getAttribute("aria-pressed"), "true");
      totales.push(ultimo());
    }
    for (let k = 1; k < totales.length; k++) assert.ok(totales[k] < totales[k - 1], `más encaje, escalera más corta: ${totales}`);
  } finally {
    x.desmontar();
  }
});

test("la-fabrica-del-dinero: cada vez que se ven cifras del ejemplo, «Escenario simulado» está en pantalla", () => {
  const m = montar(React.createElement(CuatroCapas, { pieza: F.APRENDER_FABRICA, Escena: FD.EscenaFabrica, Exploracion: FD.ExploraFabrica }));
  try {
    const capa2 = m.caja.querySelector('[data-capa="2"]');
    const capa3 = m.caja.querySelector('[data-capa="3"]');
    let vistas = 0;
    F.APRENDER_FABRICA.pasos.forEach((_, k) => {
      const escena = capa2.querySelector("svg");
      if (/\d/.test(escena.textContent)) {
        vistas++;
        assert.ok(escena.textContent.includes(F.ROTULO_SIMULADO), `paso ${k + 1}: hay cifras y no está el rótulo`);
        /* El rótulo no se apaga con el resaltado: va fuera de toda parte. */
        const rot = [...escena.querySelectorAll("text")].find((t) => t.textContent === F.ROTULO_SIMULADO);
        assert.equal(rot.closest("[data-parte]"), null, "el rótulo no puede quedar apagado");
      }
      if (k < F.APRENDER_FABRICA.pasos.length - 1) click(boton(capa2, "Siguiente"));
    });
    assert.ok(vistas > 0, "la escena pinta cifras del ejemplo");
    for (const e of F.EXPLORA_ENCAJES) {
      click(capa3.querySelector(`[data-encaje="${e}"]`));
      assert.match(capa3.textContent, /\d/);
      assert.ok(capa3.textContent.toLowerCase().includes(F.ROTULO_SIMULADO.toLowerCase()), `exploración con ${e}: cifras sin rótulo`);
    }
  } finally {
    m.desmontar();
  }
});
