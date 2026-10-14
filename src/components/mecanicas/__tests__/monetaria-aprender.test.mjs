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

test("la-fabrica-del-dinero: la escalera — la partida no es vuelta; cada vuelta deposita lo prestado en la anterior; el total crece; con más encaje, más corta", () => {
  /* El ejemplo de Juan, como lo cuentan los pasos: partida 100; vueltas 190, 271 y 343,9. */
  const juan = F.escaleraDe(100, 10, 3);
  assert.deepEqual(juan.map((f) => [f.deposita, f.guarda, f.presta, f.total]), [[100, 10, 90, 190], [90, 9, 81, 271], [81, 8.1, 72.9, 343.9]]);
  for (const encaje of [5, 10, 20, 50]) {
    const filas = F.escaleraDe(1000, encaje, 8);
    filas.forEach((f, k) => {
      assert.ok(Math.abs(f.guarda + f.presta - f.deposita) < 1e-6, `vuelta ${f.vuelta}: lo que entra se guarda o se presta`);
      const antes = k > 0 ? filas[k - 1].total : 1000;
      assert.ok(Math.abs(f.total - (antes + f.presta)) < 1e-6, `vuelta ${f.vuelta}: lo prestado vuelve como depósito y se suma`);
      if (k > 0) assert.equal(f.deposita, filas[k - 1].presta, `vuelta ${f.vuelta}: deposita lo prestado en la anterior`);
      assert.ok(f.total > antes, "el total crece");
    });
    assert.ok(filas.at(-1).total < F.techoDe(1000, encaje), "nunca pasa del techo que deduce el estudiante");
  }
  const baja = F.escaleraDe(1000, 10, 6);
  const alta = F.escaleraDe(1000, 20, 6);
  for (let k = 0; k < 6; k++) assert.ok(alta[k].total < baja[k].total, `vuelta ${k + 1}: subir el encaje acorta`);
  /* Los pasos cuentan lo mismo que la regla. */
  const textos = F.APRENDER_FABRICA.pasos.map((p) => p.texto);
  assert.ok(textos.some((t) => t.includes("Vuelta 1: total en depósitos, 190.")));
  assert.ok(textos.some((t) => t.includes("Vuelta 2: total en depósitos, 271.")));
  assert.ok(textos.some((t) => t.includes("en la vuelta 3, el total llega a 343,9.")));
});

const pasoActual = (capa2) => Number(capa2.textContent.match(/Paso (\d+) de/)[1]);
const visibles = (caja, sel, attr) => [...caja.querySelectorAll(sel)].map((n) => n.getAttribute(attr));

test("la-fabrica-del-dinero: cada cifra y cada peldaño aparecen con su paso, y «Anterior» los oculta", () => {
  const m = montar(React.createElement(CuatroCapas, { pieza: F.APRENDER_FABRICA, Escena: FD.EscenaFabrica, Exploracion: FD.ExploraFabrica }));
  try {
    const capa2 = m.caja.querySelector('[data-capa="2"]');
    const total = F.APRENDER_FABRICA.pasos.length;
    for (let k = 1; k <= total; k++) {
      assert.equal(pasoActual(capa2), k);
      const cifras = visibles(capa2, "svg [data-cifra]", "data-cifra").sort();
      assert.deepEqual(cifras, F.CIFRAS_ESCENA.filter((c) => c.paso <= k).map((c) => c.id).sort(), `paso ${k}: cifras`);
      const peldanos = visibles(capa2, "svg [data-peldano]", "data-peldano");
      const esperados = [...F.PELDANOS_ESCENA.filter((p) => p.paso <= k).map((p) => p.id), ...(k >= F.PASO_SIGUE ? ["sigue"] : [])];
      assert.deepEqual(peldanos, esperados, `paso ${k}: peldaños`);
      if (k < total) click(boton(capa2, "Siguiente"));
    }
    /* La escalera completa: 100, 190, 271 y 343,9, con «…». */
    assert.deepEqual([...capa2.querySelectorAll("svg [data-peldano] text")].map((t) => t.textContent), ["100", "190", "271", "343,9"]);
    /* Atrás hasta el paso 13: la vuelta 3 y sus cifras ya no están. */
    for (let k = total; k > 13; k--) click(boton(capa2, "Anterior"));
    assert.equal(pasoActual(capa2), 13);
    assert.ok(!visibles(capa2, "svg [data-peldano]", "data-peldano").includes("vuelta-3"));
    assert.ok(!visibles(capa2, "svg [data-cifra]", "data-cifra").includes("c-sale"));
    assert.ok(visibles(capa2, "svg [data-cifra]", "data-cifra").includes("b-c"));
  } finally {
    m.desmontar();
  }
});

test("la-fabrica-del-dinero: la escena tiene los 14 ids; ninguna correa une al Gobierno con el Banco de la República; nada en bucle; letra de 13,2 o más", () => {
  const m = montar(React.createElement(CuatroCapas, { pieza: F.APRENDER_FABRICA, Escena: FD.EscenaFabrica, Exploracion: FD.ExploraFabrica }));
  try {
    const capa2 = m.caja.querySelector('[data-capa="2"]');
    const svg = () => capa2.querySelector("svg");
    const ids = [...svg().querySelectorAll("[data-parte]")].map((p) => p.getAttribute("data-parte"));
    assert.deepEqual([...new Set(ids)].sort(), [...F.IDS_ESCENA].sort(), "los 14 ids del encargo, ni uno más");
    assert.equal(svg().querySelectorAll('[data-parte="encaje"] [data-cajita]').length, 3, "el encaje, en las tres cajitas");
    for (const c of svg().querySelectorAll("[data-correa]")) {
      for (const alt of c.getAttribute("data-une").split("|")) {
        const une = alt.trim().split(/\s+/);
        assert.ok(!(une.includes("gobierno") && une.includes("banco-republica")), `la correa ${c.getAttribute("data-correa")} une Gobierno y Banco`);
      }
    }
    /* El paso de «Normalmente…»: se encienden Gobierno–TES y el mercado, por separado; el TES no baja al banco. */
    const k20 = F.APRENDER_FABRICA.pasos.findIndex((p) => p.texto.startsWith("Normalmente"));
    for (let k = 0; k < k20; k++) click(boton(capa2, "Siguiente"));
    assert.deepEqual(visibles(capa2, "svg [data-correa][data-encendida]", "data-correa").sort(), ["gobierno-tes", "mercado"]);
    assert.ok(svg().querySelector('[data-parte="banco-privado"]').getAttribute("class").includes("fae-sm-apagada"));
    /* Ninguna animación en bucle, y ningún texto por debajo de 13,2 unidades. */
    assert.doesNotMatch(svg().outerHTML, /infinite/);
    for (const t of svg().querySelectorAll("text")) assert.ok(parseFloat(t.style.fontSize) >= 13.2, `«${t.textContent}» en ${t.style.fontSize}`);
  } finally {
    m.desmontar();
  }
});

test("la-fabrica-del-dinero: «Escenario simulado» a la vista en la capa 2 (en cada paso) y en la capa 3 (en cada posición)", () => {
  const m = montar(React.createElement(CuatroCapas, { pieza: F.APRENDER_FABRICA, Escena: FD.EscenaFabrica, Exploracion: FD.ExploraFabrica }));
  try {
    const capa2 = m.caja.querySelector('[data-capa="2"]');
    const capa3 = m.caja.querySelector('[data-capa="3"]');
    F.APRENDER_FABRICA.pasos.forEach((_, k) => {
      const rot = capa2.querySelector("svg [data-rotulo-simulado]");
      assert.ok(rot && rot.textContent === F.ROTULO_SIMULADO, `paso ${k + 1}: sin rótulo`);
      assert.equal(rot.closest("[data-parte]"), null, "el rótulo no puede quedar apagado");
      if (k < F.APRENDER_FABRICA.pasos.length - 1) click(boton(capa2, "Siguiente"));
    });
    const leer = () => ({
      rot: capa3.querySelector("[data-rotulo-simulado]")?.textContent,
      encaje: Number(capa3.querySelector("[data-encaje-actual]").getAttribute("data-encaje-actual")),
      texto: capa3.querySelector("[data-texto-posicion]").textContent,
      totales: [...capa3.querySelectorAll("[data-escalera-explora] [data-vuelta]")].map((r) => Number(r.getAttribute("data-total"))),
    });
    const vistas = [];
    let x = leer();
    assert.equal(x.encaje, F.EXPLORA.inicial);
    assert.equal(capa3.querySelector("[data-texto-final]"), null, "el texto final, solo después de mover");
    /* Empieza en 10, el nivel más bajo: «Bajar el encaje» no hace nada ahí. */
    assert.ok(capa3.querySelector("[data-bajar]").disabled, "abajo del todo");
    assert.equal(capa3.querySelector("[data-bajar]").getAttribute("aria-label"), "Bajar el encaje");
    assert.equal(capa3.querySelector("[data-subir]").getAttribute("aria-label"), "Subir el encaje");
    for (;;) {
      x = leer();
      vistas.push(x);
      assert.equal(x.rot, F.ROTULO_SIMULADO, `encaje ${x.encaje}: cifras sin rótulo`);
      if (capa3.querySelector("[data-subir]").disabled) break;
      click(capa3.querySelector("[data-subir]"));
    }
    assert.deepEqual(vistas.map((v) => v.encaje), [10, 20, 50]);
    for (const v of vistas) {
      /* El texto de Futaba dice lo mismo que la escalera que se pinta: el primer préstamo y el total tras dos vueltas. */
      const f = F.escaleraDe(100, v.encaje, 3);
      assert.equal(v.texto, F.EXPLORA.posiciones.find((p) => p.encaje === v.encaje).texto);
      assert.ok(v.texto.includes(`El primer préstamo es de ${FD.cifra(f[0].presta)},`), v.texto);
      assert.ok(v.texto.includes(`tras dos vueltas el total va en ${FD.cifra(f[1].total)}.`), v.texto);
      assert.deepEqual(v.totales, [100, ...f.map((r) => r.total)]);
    }
    for (let k = 1; k < vistas.length; k++) assert.ok(vistas[k].totales.at(-1) < vistas[k - 1].totales.at(-1), "más encaje, escalera más corta");
    assert.equal(capa3.querySelector("[data-texto-final]").textContent, F.EXPLORA.final);
  } finally {
    m.desmontar();
  }
});
