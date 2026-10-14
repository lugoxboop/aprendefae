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
  [D.APRENDER_QUIEN_MANDA, S.EscenaQuienManda, S.ExploraMargen],
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

test("Aprender no paga: las cuatro piezas son APRENDER y no están en el catálogo del servidor", () => {
  const tema = SUBJECTS.macroeconomia.topics.find((t) => t.id === "politica-monetaria");
  const ids = actividadesDeTipo(tema, APRENDER).map((a) => a.id);
  assert.deepEqual(ids, ["quien-manda-aqui", "los-cuatro-instrumentos", "las-tres-transmisiones", "la-fabrica-del-dinero"]);
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
/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «LAS TALLAS DEL DINERO» (encargo de Erwin). Añadido al final, sin cambiar
 * nada de lo de arriba: la Célula B trabaja en el mismo tema.
 *
 *   · la pieza pinta sus cuatro capas: pasos literales con su resaltado sobre
 *     la escalera, y la referencia solo a pedido;
 *   · no queda ningún texto pendiente;
 *   · el CDT va en M2 y nunca en M1, y meterlo en M1 se marca ❌;
 *   · la exploración sigue las tres reglas: comprar TES sube la base, bajar el
 *     encaje sube la multiplicación, bajar la tasa sube el crédito pedido;
 *   · el Banco compra TES, no los emite (los emite el gobierno: QUIEN_DECIDE);
 *   · cifras solo de DATOS_VERIFICADOS o rotuladas «Escenario simulado»;
 *   · la letra de la escena de Watari no baja de 10,5 px en el teléfono de
 *     320 (236 px de escena), ni en su forma ancha;
 *   · cada partida trae todos los ítems, y las categorías van en orden fijo;
 *   · Aprender no paga. La fila de los dos juegos (la 0091) va en el parche de
 *     cableado, con su prueba: sin cablear, el servidor no puede pagar por
 *     juegos que el cliente no ofrece (catalogo.test).
 *
 * OJO: la prueba de arriba «Aprender no paga…» afirma exactamente las tres
 * piezas que hay hoy. Cuando Erwin cablee la nueva en subjects.js, esa línea
 * pasa a incluir "las-tallas-del-dinero" (lo dice el PR).
 * ═══════════════════════════════════════════════════════════════════════════
 */
const AG = await import("../../../data/pmAgregados.js");
const ESC = await import("../maquinas/tallasDelDinero.jsx");

/* Todo el texto de los datos nuevos, recorrido en profundidad. */
function textosDe(x, out = []) {
  if (typeof x === "string") out.push(x);
  else if (typeof x === "function") return out;
  else if (Array.isArray(x)) x.forEach((y) => textosDe(y, out));
  else if (x && typeof x === "object") Object.values(x).forEach((y) => textosDe(y, out));
  return out;
}
const DATOS_NUEVOS = { pieza: AG.APRENDER_TALLAS, juego1: AG.EN_QUE_TALLA_VA, juego2: AG.QUE_TOCO_EL_BANCO };

test("las-tallas-del-dinero: no queda ningún texto pendiente", () => {
  const pendientes = textosDe(DATOS_NUEVOS).filter((t) => t.includes("PENDIENTE"));
  assert.deepEqual(pendientes, [], "hay textos sin escribir");
  assert.ok(AG.APRENDER_TALLAS.nombres.length > 0 && AG.APRENDER_TALLAS.pasos.length > 0, "la pieza no tiene nombres o pasos");
  for (const j of [AG.EN_QUE_TALLA_VA, AG.QUE_TOCO_EL_BANCO]) assert.ok(j.items.length >= j.porPartida, `${j.id}: menos ítems que porPartida`);
});

test("las-tallas-del-dinero: cuatro capas, pasos literales con su resaltado en la escalera, y la referencia solo a pedido", () => {
  const pieza = AG.APRENDER_TALLAS;
  assert.ok(pieza.pasos.length > 0, "la pieza no tiene pasos");
  const m = montar(React.createElement(CuatroCapas, { pieza, Escena: ESC.EscenaTallas, Exploracion: ESC.ExploraTallas }));
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
    assert.equal(m.caja.querySelector("[data-respuesta]"), null, "la referencia no sale sola");
    click(boton(m.caja, "Ver la respuesta de referencia"));
    assert.equal(m.caja.querySelector("[data-respuesta]").textContent, pieza.respuesta);
    assert.ok(!/E76F51|231,\s*111,\s*81/i.test(m.caja.innerHTML), "ni coral: aquí no hay errores");
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
test("¿En qué talla va?: el CDT va en M2 y nunca en M1; meterlo en M1 es ❌", () => {
  const j = AG.EN_QUE_TALLA_VA;
  assert.deepEqual(j.categorias.map((c) => c.id), ["reserva", "m1", "m2", "m3"]);
  const cdts = j.items.filter((it) => /\bCDT\b/.test(it.texto));
  assert.ok(cdts.length >= 1, "el banco no tiene ningún CDT");
  for (const it of cdts) {
    assert.equal(it.respuesta, "m2", `${it.id}: un CDT es M2`);
    assert.match(j.retro(it, "m1"), /^❌/, `${it.id}: meter el CDT en M1 tiene que marcarse ❌`);
    assert.match(j.retro(it, "m2"), /^✅/);
  }
  /* Lo que es del banco y no del público no es M1: va en la reserva. */
  for (const it of j.items.filter((x) => /\bun banco (guarda|tiene depositado)\b/.test(x.texto))) assert.equal(it.respuesta, "reserva", it.id);
  for (const it of j.items) assert.ok(j.categorias.some((c) => c.id === it.respuesta), `${it.id}: respuesta sin categoría`);
  for (const c of j.categorias) assert.ok(j.items.some((it) => it.respuesta === c.id), `ningún ítem va en «${c.id}»`);
});

test("los dos juegos: cada ítem tiene id único y su devolución ✅ al acertar y ❌ al fallar", () => {
  for (const j of [AG.EN_QUE_TALLA_VA, AG.QUE_TOCO_EL_BANCO]) {
    const ids = j.items.map((it) => it.id);
    assert.equal(new Set(ids).size, ids.length, `${j.id}: ids repetidos`);
    assert.ok(j.consigna && j.consigna.length > 0, `${j.id}: sin consigna`);
    for (const it of j.items) {
      assert.match(j.retro(it, it.respuesta), /^✅/, `${j.id}/${it.id}: acierto`);
      for (const c of j.categorias) if (c.id !== it.respuesta) assert.match(j.retro(it, c.id), /^❌/, `${j.id}/${it.id}: fallo en ${c.id}`);
    }
  }
});

test("¿Qué tocó el Banco?: cada decisión pega en su punto de la escalera, y lo que no es del Banco va aparte", () => {
  const j = AG.QUE_TOCO_EL_BANCO;
  assert.deepEqual(j.categorias.map((c) => c.id), ["base", "multiplica", "credito", "no-banco"]);
  const de = (re) => j.items.filter((it) => re.test(it.texto));
  for (const it of de(/\bTES\b/)) assert.equal(it.respuesta, /^El Gobierno\b/.test(it.texto) ? "no-banco" : "base", `${it.id}: los TES que compra o vende el Banco mueven la base; los emite el Gobierno`);
  assert.ok(de(/^El Gobierno emite TES/).length === 1, "falta el ítem que separa emitir de comprar");
  for (const it of de(/encaje/i)) assert.equal(it.respuesta, "multiplica", `${it.id}: el encaje mueve cuánto se multiplica`);
  for (const it of de(/\btasa\b/i)) assert.equal(it.respuesta, "credito", `${it.id}: la tasa mueve el crédito pedido`);
  for (const it of j.items.filter((x) => x.respuesta !== "no-banco")) assert.match(it.texto, /^El Banco de la República\b/, `${it.id}: solo el Banco de la República pega en la escalera`);
  for (const c of j.categorias) assert.ok(j.items.some((it) => it.respuesta === c.id), `ningún ítem pega en «${c.id}»`);
});

test("la exploración de las tallas: cada palanca enciende el punto de la escalera donde pega primero", () => {
  const r = (palanca, v) => ESC.reaccionTallas({ palanca, v });
  assert.deepEqual(ESC.reaccionTallas(null).efecto, {}, "sin palanca no se mueve nada");
  assert.deepEqual([r("tes", "comprar").efecto, r("tes", "comprar").primero], [{ base: 1 }, "base"], "comprar TES: la base crece, y solo la base");
  assert.deepEqual(r("tes", "vender").efecto, { base: -1 });
  assert.deepEqual([r("encaje", "bajar").efecto, r("encaje", "bajar").primero], [{ multiplica: 1 }, "multiplica"], "bajar el encaje: se multiplica más, y solo eso");
  assert.deepEqual(r("encaje", "subir").efecto, { multiplica: -1 });
  assert.deepEqual([r("tasa", "bajar").efecto, r("tasa", "bajar").primero], [{ credito: 1 }, "credito"], "bajar la tasa: se pide más crédito, y solo eso");
  assert.deepEqual(r("tasa", "subir").efecto, { credito: -1 });
  /* Los tres puntos son las tres categorías del Banco en el juego 2. */
  const puntos = AG.QUE_TOCO_EL_BANCO.categorias.map((c) => c.id).filter((id) => id !== "no-banco");
  assert.deepEqual([r("tes", "comprar").primero, r("encaje", "bajar").primero, r("tasa", "bajar").primero], puntos);
  /* Lo que se enciende son partes de la escena. */
  for (const [p, v] of [["tes", "comprar"], ["encaje", "bajar"], ["tasa", "bajar"]]) assert.ok(r(p, v).resaltar.length > 0, p);
  const m = montar(React.createElement(ESC.ExploraTallas));
  try {
    click(boton(m.caja, "Comprar TES"));
    assert.equal(m.caja.querySelector("[data-reaccion]").getAttribute("data-reaccion"), "base");
    assert.match(m.caja.querySelector("[data-reaccion]").textContent, /^Primero se mueve la base\./);
    assert.ok(m.caja.querySelector('[data-efecto="base"]'), "el rótulo del efecto sale junto a la base");
    assert.ok(!/E76F51|231,\s*111,\s*81/i.test(m.caja.innerHTML), "ni coral");
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
test("el Banco compra TES, no los emite: coherente con ¿Quién Decide Esto?", () => {
  assert.equal(D.QUIEN_DECIDE.items.find((x) => x.id === "emite-tes").respuesta, "gobierno");
  const texto = textosDe(DATOS_NUEVOS).join("\n");
  /* «el Banco emite TES» es rojo; «el Banco no emite los TES» es justo lo que la pieza tiene que decir. */
  const EMITE = /Banco(?: de la República)?\s+(?:(?!no\b|nunca\b)\p{L}+\s+){0,3}emit\p{L}*\s+(?:\p{L}+\s+){0,3}TES/iu;
  assert.match("El Banco de la República emite TES.", EMITE, "la regla tiene que poder ponerse roja");
  assert.match("Ahí el Banco también emite los TES.", EMITE);
  assert.doesNotMatch("Ojo: el Banco no emite los TES.", EMITE);
  assert.doesNotMatch(texto, EMITE, "un texto dice que el Banco emite TES");
  assert.match(texto, /compr\w*[^.]{0,40}\bTES\b|\bTES\b[^.]{0,40}compr\w*/i, "ningún texto dice que el Banco compra TES");
});

test("las tallas: cifras solo de DATOS_VERIFICADOS o rotuladas «Escenario simulado»; ningún saldo real", () => {
  const verificadas = new Set(textosDe(AG.DATOS_VERIFICADOS).flatMap((t) => t.match(/\d+(?:,\d+)?%/g) ?? []));
  const sueltas = [];
  const revisar = (x, simulado) => {
    for (const t of textosDe(x)) {
      for (const c of t.match(/\d+(?:,\d+)?\s?%/g) ?? []) if (!verificadas.has(c.replace(/\s/g, ""))) sueltas.push(c);
      if (!simulado && /\$\s?\d|\d[\d.]*\s?(mil|millones|billones)/.test(t)) sueltas.push(t);
    }
  };
  revisar(AG.APRENDER_TALLAS, false);
  for (const j of [AG.EN_QUE_TALLA_VA, AG.QUE_TOCO_EL_BANCO]) for (const it of j.items) revisar(it, it.simulado === true || it.etiqueta === AG.ROTULO_SIMULADO);
  assert.deepEqual(sueltas, [], "cifra sin verificar y sin rótulo de escenario");
});

/* Los textos de la escena, con todos los rótulos de efecto a la vista, y su lienzo. */
function textosDeLaEscena(anchoCaja) {
  const antes = globalThis.ResizeObserver;
  /* Sin ResizeObserver (jsdom) la escena pinta la escalera angosta; con uno de mentira, la ancha. */
  if (anchoCaja) globalThis.ResizeObserver = class { constructor(cb) { this.cb = cb; } observe() { this.cb([{ contentRect: { width: anchoCaja } }]); } disconnect() {} };
  const m = montar(React.createElement(ESC.EscenaTallas, { resaltar: [], efecto: { base: 1, multiplica: 1, credito: 1 } }));
  try {
    const svg = m.caja.querySelector("svg");
    return {
      forma: svg.getAttribute("data-forma"),
      lienzo: Number(svg.getAttribute("viewBox").split(/\s+/)[2]),
      tamanos: [...svg.querySelectorAll("text")].map((t) => parseFloat(t.style.fontSize)),
      partes: [...svg.querySelectorAll("[data-parte]")].map((g) => g.getAttribute("data-parte")),
    };
  } finally {
    m.desmontar();
    globalThis.ResizeObserver = antes;
  }
}

test("la escena de Watari: letra de 10,5 px o más a 236 px de escena (teléfono de 320), y en la forma ancha desde su corte", () => {
  const angosta = textosDeLaEscena(0);
  assert.equal(angosta.forma, "angosta");
  assert.ok(angosta.tamanos.length >= 20, "la escena tiene sus rótulos");
  for (const t of angosta.tamanos) assert.ok((t * 236) / angosta.lienzo >= 10.5, `angosta: un texto de ${t} queda en ${((t * 236) / angosta.lienzo).toFixed(2)} px`);
  const ancha = textosDeLaEscena(ESC.CORTE_ANCHO);
  assert.equal(ancha.forma, "ancha");
  for (const t of ancha.tamanos) assert.ok((t * ESC.CORTE_ANCHO) / ancha.lienzo >= 10.5, `ancha: un texto de ${t} queda en ${((t * ESC.CORTE_ANCHO) / ancha.lienzo).toFixed(2)} px`);
  /* Las dos formas tienen las mismas partes, y son las que nombran los pasos de Near. */
  assert.deepEqual([...new Set(ancha.partes)].sort(), [...new Set(angosta.partes)].sort());
  const deLosPasos = new Set(AG.APRENDER_TALLAS.pasos.flatMap((p) => p.resaltar));
  assert.deepEqual([...deLosPasos].sort(), [...new Set(angosta.partes)].sort(), "ni partes de más ni de menos");
});

test("los dos juegos: cada partida trae todos los ítems (el CDT sale siempre), y no barajan las categorías", () => {
  for (const j of [AG.EN_QUE_TALLA_VA, AG.QUE_TOCO_EL_BANCO]) assert.equal(j.porPartida, j.items.length, j.id);
  const fuente = readFileSync("src/components/mecanicas/maquinas/actividadesAgregados.jsx", "utf8");
  assert.doesNotMatch(fuente, /barajarOpciones/, "las categorías van en orden fijo");
});

test("las tallas: Aprender no paga", () => {
  const sql = readdirSync("supabase/migrations").map((f) => readFileSync(`supabase/migrations/${f}`, "utf8")).join("\n");
  assert.ok(!sql.includes(`'${AG.APRENDER_TALLAS.id}'`), "la pieza de Aprender no puede tener fila");
  assert.equal(AG.EN_QUE_TALLA_VA.id, "en-que-talla-va");
  assert.equal(AG.QUE_TOCO_EL_BANCO.id, "que-toco-el-banco");
});
