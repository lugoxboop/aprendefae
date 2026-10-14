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
const { SUBJECTS, APRENDER, actividadesDeTipo } = await import("../../../data/subjects.js");

const PIEZAS = [
  [D.APRENDER_QUIEN_MANDA, S.EscenaQuienManda, () => React.createElement(S.ExploraVolante)],
  [D.APRENDER_INSTRUMENTOS, S.EscenaInstrumentos, S.ExploraInstrumentos],
  [D.APRENDER_TRANSMISIONES, S.EscenaTransmisiones, () => React.createElement(S.ExploraVolante, { conReloj: true })],
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
 *   · la letra de la escena no baja de 10,5 px en el teléfono de 320;
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
const ESC = await import("../maquinas/escaleraLiquidez.jsx");

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
  for (const p of pieza.pasos) for (const id of p.resaltar) assert.ok(ESC.PARTES_ESCALERA.includes(id), `«${id}» no es una parte de la escalera`);
  const m = montar(React.createElement(CuatroCapas, { pieza, Escena: ESC.EscenaEscalera, Exploracion: ESC.ExploraTallas }));
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

test("la exploración de las tallas sigue las tres reglas, cada instrumento en su punto", () => {
  const e = (x) => ESC.efectosAgregados({ tes: "no", encaje: "no", tasa: "no", ...x });
  assert.deepEqual(e({}), { base: 0, multiplicacion: 0, credito: 0 });
  assert.deepEqual(e({ tes: "comprar" }), { base: 1, multiplicacion: 0, credito: 0 }, "comprar TES sube la base, y solo la base");
  assert.deepEqual(e({ tes: "vender" }), { base: -1, multiplicacion: 0, credito: 0 });
  assert.deepEqual(e({ encaje: "bajar" }), { base: 0, multiplicacion: 1, credito: 0 }, "bajar el encaje sube la multiplicación, y solo eso");
  assert.deepEqual(e({ encaje: "subir" }), { base: 0, multiplicacion: -1, credito: 0 });
  assert.deepEqual(e({ tasa: "bajar" }), { base: 0, multiplicacion: 0, credito: 1 }, "bajar la tasa sube el crédito pedido, y solo eso");
  assert.deepEqual(e({ tasa: "subir" }), { base: 0, multiplicacion: 0, credito: -1 });
  const m = montar(React.createElement(ESC.ExploraTallas));
  try {
    click(boton(m.caja, "El Banco compra TES"));
    assert.match(m.caja.querySelector("[data-efectos-tallas]").textContent, /Base monetaria: sube\. Multiplicación: sin cambio\. Crédito pedido: sin cambio\./);
  } finally {
    m.desmontar();
  }
});

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

test("la letra de la escena de la escalera no baja de 10,5 px en el teléfono de 320 (236 px de escena)", () => {
  assert.ok((ESC.LETRA_ESCENA * 236) / ESC.ANCHO_ESCENA >= 10.5, "la letra declarada baja de 10,5 px");
  const m = montar(React.createElement(ESC.EscenaEscalera));
  try {
    const svg = m.caja.querySelector("svg");
    assert.equal(svg.getAttribute("viewBox").split(/\s+/)[2], String(ESC.ANCHO_ESCENA));
    const tamanos = [...svg.querySelectorAll("text")].map((t) => parseFloat(t.style.fontSize));
    assert.ok(tamanos.length > 0);
    for (const t of tamanos) assert.ok((t * 236) / ESC.ANCHO_ESCENA >= 10.5, `un texto de ${t} queda en ${((t * 236) / ESC.ANCHO_ESCENA).toFixed(1)} px`);
  } finally {
    m.desmontar();
  }
});

test("las tallas: Aprender no paga", () => {
  const sql = readdirSync("supabase/migrations").map((f) => readFileSync(`supabase/migrations/${f}`, "utf8")).join("\n");
  assert.ok(!sql.includes(`'${AG.APRENDER_TALLAS.id}'`), "la pieza de Aprender no puede tener fila");
  assert.equal(AG.EN_QUE_TALLA_VA.id, "en-que-talla-va");
  assert.equal(AG.QUE_TOCO_EL_BANCO.id, "que-toco-el-banco");
});
