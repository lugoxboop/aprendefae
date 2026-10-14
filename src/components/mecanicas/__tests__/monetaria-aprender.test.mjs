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
 *   · el CDT va en M2/M3 y nunca en M1, y meterlo en M1 se marca ❌;
 *   · la exploración sigue las tres reglas: comprar TES sube la base, bajar el
 *     encaje sube la multiplicación, bajar la tasa sube el crédito pedido;
 *   · el Banco compra TES, no los emite (los emite el gobierno: QUIEN_DECIDE);
 *   · cifras solo de DATOS_VERIFICADOS o rotuladas «Escenario simulado»;
 *   · Aprender no paga; los dos juegos tienen su fila en la 0091.
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

test("¿En qué talla va?: el CDT va en M2/M3 y nunca en M1; meterlo en M1 es ❌", () => {
  const j = AG.EN_QUE_TALLA_VA;
  assert.deepEqual(j.categorias.map((c) => c.id), ["base", "m1", "m2m3"]);
  const cdts = j.items.filter((it) => /\bCDT\b/.test(it.texto));
  assert.ok(cdts.length >= 1, "el banco no tiene ningún CDT");
  for (const it of cdts) {
    assert.equal(it.respuesta, "m2m3", `${it.id}: un CDT es M2/M3`);
    assert.match(j.retro(it, "m1"), /^❌/, `${it.id}: meter el CDT en M1 tiene que marcarse ❌`);
    assert.match(j.retro(it, "m2m3"), /^✅/);
  }
  /* Ningún ítem de M1 es un CDT, y cada ítem tiene una respuesta que existe. */
  for (const it of j.items) assert.ok(j.categorias.some((c) => c.id === it.respuesta), `${it.id}: respuesta sin categoría`);
});

test("¿Qué tocó el Banco?: cada decisión pega en su punto de la escalera", () => {
  const j = AG.QUE_TOCO_EL_BANCO;
  assert.deepEqual(j.categorias.map((c) => c.id), ["base", "multiplicacion", "credito"]);
  const de = (re) => j.items.filter((it) => re.test(it.texto));
  for (const it of de(/\bTES\b/)) assert.equal(it.respuesta, "base", `${it.id}: los TES mueven la base`);
  for (const it of de(/encaje/i)) assert.equal(it.respuesta, "multiplicacion", `${it.id}: el encaje mueve la multiplicación`);
  for (const it of de(/\btasa\b/i)) assert.equal(it.respuesta, "credito", `${it.id}: la tasa mueve el crédito pedido`);
  for (const id of ["base", "multiplicacion", "credito"]) assert.ok(j.items.some((it) => it.respuesta === id), `ningún ítem pega en «${id}»`);
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
  assert.doesNotMatch(texto, /Banco(?: de la República)?\s+(?:\w+\s+){0,3}emit\w*\s+(?:\w+\s+){0,3}TES/i, "un texto dice que el Banco emite TES");
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

test("las tallas: Aprender no paga; los dos juegos tienen su fila en la 0091, sin correr y repetible", () => {
  const sql = readdirSync("supabase/migrations").map((f) => readFileSync(`supabase/migrations/${f}`, "utf8")).join("\n");
  assert.ok(!sql.includes(`'${AG.APRENDER_TALLAS.id}'`), "la pieza de Aprender no puede tener fila");
  const m91 = readFileSync("supabase/migrations/0091_monetaria_agregados.sql", "utf8");
  assert.match(m91, /\('en-que-talla-va',\s*'macroeconomia',\s*'politica-monetaria',\s*'evaluativa',\s*'facil',\s*10,\s*1\)/);
  assert.match(m91, /\('que-toco-el-banco',\s*'macroeconomia',\s*'politica-monetaria',\s*'evaluativa',\s*'medio',\s*25,\s*1\)/);
  assert.match(m91, /on conflict \(activity_id\) do update set/);
  const sentencias = m91.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  assert.doesNotMatch(sentencias, /\b(alter|delete|drop|truncate)\b/i);
  assert.equal(AG.EN_QUE_TALLA_VA.id, "en-que-talla-va");
  assert.equal(AG.QUE_TOCO_EL_BANCO.id, "que-toco-el-banco");
});
