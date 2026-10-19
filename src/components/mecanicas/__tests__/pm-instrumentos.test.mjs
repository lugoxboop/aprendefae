import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS TRES INSTRUMENTOS DE POLÍTICA MONETARIA (Célula A).
 *
 *   la-tasa-que-muerde   tasa de intervención
 *   repo-o-definitiva    OMA con TES
 *   el-freno-del-encaje  encaje bancario
 *
 * LO QUE ESTAS PRUEBAS DEFIENDEN, Y POR QUÉ CADA UNA:
 *
 *   · D4 · dos decisiones de TIPO distinto sobre el mismo caso. La misma
 *     pregunta sobre otro caso no cuenta como decisión distinta, así que se
 *     exige que cada caso traiga una clasificación y una consecuencia.
 *   · D4 · cada opción deja la figura en un estado distinto, PAREJA POR
 *     PAREJA. Se mide en el DOM —estilos, atributos y posiciones—, nunca por
 *     el texto: un resaltado no cambia letras, y comparar texto da falsos
 *     negativos. Si dos opciones se vieran igual, para el estudiante serían
 *     la misma.
 *   · PH8-2 · la figura no contesta la pregunta antes de que el estudiante
 *     responda: con la clasificación sin responder, la ficha de la tasa y la
 *     línea del encaje no están puestas.
 *   · D6 · un mensaje de error por confusión, y ninguno que sirva para otra
 *     opción: todos distintos dentro de la actividad.
 *   · El piso de letra del kit: 12 px para lo que el estudiante lee.
 *
 * LO QUE NO DEMUESTRAN: que el contenido sea correcto en economía. Eso lo
 * juzga una persona. Y las cifras son construidas a propósito (registro en
 * orquestador/conocimiento/registro-cifras-construidas-pm-instrumentos.md).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.Element.prototype.scrollIntoView = () => {};
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator,
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

const D = await import("../../../data/pmInstrumentos.js");
const M = await import("../maquinas/instrumentosPM.jsx");

const PIEZAS = [
  { ficha: D.TASA, casos: D.CASOS_TASA, Juego: M.LaTasaQueMuerde, figura: "tasa" },
  { ficha: D.REPO, casos: D.CASOS_REPO, Juego: M.RepoODefinitiva, figura: "mesa" },
  { ficha: D.ENCAJE, casos: D.CASOS_ENCAJE, Juego: M.ElFrenoDelEncaje, figura: "tanque" },
];

function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const tocar = (el) => act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
const opciones = (caja) => [...caja.querySelectorAll(".fae-jg-opcion")];

/*
 * LA HUELLA DE LA FIGURA: cómo SE VE, no qué dice. Recorre la figura y de cada
 * elemento toma sus atributos `data-*` de estado y las propiedades de estilo
 * que mueven algo (posición, tamaño, color, borde, opacidad). El texto se
 * queda fuera a propósito.
 */
function huellaFigura(caja) {
  const figura = caja.querySelector("[data-figura]");
  assert.ok(figura, "la pantalla no pintó figura");
  const partes = [];
  for (const el of [figura, ...figura.querySelectorAll("*")]) {
    const datos = Object.entries(el.dataset).map(([k, v]) => `${k}=${v}`).sort().join(",");
    const e = el.style;
    const visual = ["left", "right", "top", "bottom", "width", "height", "background", "backgroundColor", "border", "borderTop", "opacity", "transform"]
      .map((p) => `${p}:${e[p] ?? ""}`).join(";");
    partes.push(`${el.tagName}|${datos}|${visual}`);
  }
  return partes.join("\n");
}

/* ─────────────────── el banco: la forma de cada caso ─────────────────── */

test("★★★ cada caso pide una clasificación y una consecuencia, no la misma pregunta dos veces", () => {
  for (const { ficha, casos } of PIEZAS) {
    assert.equal(casos.length, 3, `${ficha.id}: tres casos`);
    for (const caso of casos) {
      const tipos = caso.decisiones.map((d) => d.tipo);
      assert.deepEqual(tipos, [D.CLASIFICACION, D.CONSECUENCIA], `${ficha.id} · ${caso.id}: los dos tipos, en ese orden`);
      assert.equal(new Set(caso.decisiones.map((d) => d.pregunta)).size, 2, `${ficha.id} · ${caso.id}: dos preguntas distintas`);
      for (const d of caso.decisiones) {
        assert.equal(d.opciones.length, 3, `${ficha.id} · ${caso.id} · ${d.id}: tres opciones`);
        assert.ok(d.opciones.some((o) => o.id === d.respuesta), `${ficha.id} · ${caso.id} · ${d.id}: la respuesta no está entre las opciones`);
        assert.ok(d.etiqueta && d.etiqueta.length <= 45, `${ficha.id} · ${caso.id} · ${d.id}: rótulo del panel docente`);
        for (const o of d.opciones) {
          const esperado = o.id === d.respuesta ? "✅" : "❌";
          assert.ok(o.retro.startsWith(esperado), `${ficha.id} · ${caso.id} · ${o.id}: la devolución no empieza por ${esperado}`);
          /*
           * Toda opción trae con qué mover la figura. Una clasificación de la
           * tasa o del encaje coloca una pieza (`lectura`); la de la mesa elige
           * una operación, y una operación sí tiene estado propio.
           */
          if (d.tipo === D.CONSECUENCIA) assert.ok(o.estado, `${ficha.id} · ${o.id}: sin estado que pintar`);
          else assert.ok(o.lectura || o.estado, `${ficha.id} · ${o.id}: sin nada que mover en la figura`);
        }
      }
    }
  }
});

test("★★★ D6: ningún mensaje de error sirve para dos opciones de la misma actividad", () => {
  for (const { ficha, casos } of PIEZAS) {
    const malos = casos.flatMap((c) => c.decisiones.flatMap((d) => d.opciones.filter((o) => o.id !== d.respuesta).map((o) => o.retro)));
    assert.equal(new Set(malos).size, malos.length, `${ficha.id}: hay devoluciones de error repetidas`);
    /* Y la correcta no se explica con el mismo texto de un error. */
    const buenos = casos.flatMap((c) => c.decisiones.map((d) => d.opciones.find((o) => o.id === d.respuesta).retro));
    assert.equal(new Set([...malos, ...buenos]).size, malos.length + buenos.length, `${ficha.id}: una devolución se repite`);
  }
});

test("★★★ el encaje exigido se recalcula, no se declara", () => {
  assert.equal(D.encajeExigido(4000, 10), 400);
  assert.equal(D.encajeExigido(4000, 8), 320);
  assert.equal(D.encajeExigido(2000, 10), 200);
  assert.equal(D.encajeExigido(1900, 10), 190);
  /* Y el caso de Aurora empieza corto de verdad: 340 no llega a 400. */
  const aurora = D.CASOS_ENCAJE[0].base;
  assert.ok(aurora.reserva < D.encajeExigido(aurora.depositos, aurora.encaje), "Aurora no está corta y el caso dice que sí");
});

/* ─────────────────── la figura, medida en el DOM ─────────────────── */

test("★★★ D4: cada opción deja la figura en un estado distinto, pareja por pareja", () => {
  for (const { ficha, casos, Juego } of PIEZAS) {
    const total = casos.reduce((s, c) => s + c.decisiones.length, 0);
    for (let item = 0; item < total; item++) {
      const huellas = new Map();
      const decision = casos.flatMap((c) => c.decisiones)[item];
      /*
       * Una partida nueva por opción, y la opción se busca POR SU TEXTO: las
       * de consecuencia se barajan al montar, así que el mismo índice no es la
       * misma opción en dos partidas. Buscarla por índice daba un falso rojo.
       */
      for (const o of decision.opciones) {
        const m = montar(React.createElement(Juego, { onCompletar: () => {} }));
        try {
          for (let j = 0; j < item; j++) {
            tocar(opciones(m.caja)[0]);
            const seguir = [...m.caja.querySelectorAll("button")].find((b) => /Siguiente|Ver resultado/.test(b.textContent));
            tocar(seguir);
          }
          const antes = huellaFigura(m.caja);
          const texto = o.nombre;
          const boton = opciones(m.caja).find((b) => b.textContent.trim() === o.nombre);
          assert.ok(boton, `${ficha.id} · ítem ${item + 1}: «${o.nombre}» no está en pantalla`);
          tocar(boton);
          const despues = huellaFigura(m.caja);
          assert.notEqual(despues, antes, `${ficha.id} · ítem ${item + 1} · «${texto}»: la figura no se movió al elegir`);
          const choque = [...huellas.entries()].find(([h]) => h === despues);
          assert.equal(choque, undefined, `${ficha.id} · ítem ${item + 1}: «${texto}» deja la figura igual que «${choque?.[1]}»`);
          huellas.set(despues, texto);
        } finally {
          m.desmontar();
        }
      }
      assert.equal(huellas.size, 3, `${ficha.id} · ítem ${item + 1}: tres estados distintos`);
    }
  }
});

test("★★★ PH8-2: con la clasificación sin responder, la figura no trae la respuesta puesta", () => {
  /* La tasa y el encaje preguntan DÓNDE va una pieza. Si llegara puesta, la
     figura contestaría. La mesa no: su primera pregunta es qué operación
     hacer, y el estado de hoy no la delata. */
  for (const [Juego, selector] of [[M.LaTasaQueMuerde, '[data-ficha="tasa"]'], [M.ElFrenoDelEncaje, '[data-linea]']]) {
    const m = montar(React.createElement(Juego, { onCompletar: () => {} }));
    try {
      assert.equal(m.caja.querySelector('[data-tipo="clasificacion"]') !== null, true, "el primer ítem es la clasificación");
      assert.equal(m.caja.querySelector(selector), null, `${selector} ya estaba puesto antes de responder`);
      assert.ok(m.caja.querySelector("[data-figura]"), "pero la figura sí se pinta");
      /* Y al elegir, la pieza aparece. */
      tocar(opciones(m.caja)[0]);
      assert.ok(m.caja.querySelector(selector), `${selector} no apareció al elegir`);
    } finally {
      m.desmontar();
    }
  }
});

test("★★★ al fallar, la figura NO queda como al acertar, y la buena queda señalada", () => {
  /*
   * Esto es lo que el estudiante necesita: que elegir mal no se vea igual que
   * elegir bien. Donde la verdad se puede dibujar sin letras, además aparece
   * dónde iba —la ficha fantasma de la tasa, la línea a trazos del encaje, la
   * muesca de la mesa—; donde no, manda la opción revelada y la devolución.
   */
  for (const { ficha, casos, Juego } of PIEZAS) {
    for (const [c, caso] of casos.entries()) {
      for (const [k, decision] of caso.decisiones.entries()) {
        const item = c * caso.decisiones.length + k;
        const huellas = {};
        for (const o of decision.opciones) {
          const m = montar(React.createElement(Juego, { onCompletar: () => {} }));
          try {
            for (let j = 0; j < item; j++) {
              tocar(opciones(m.caja)[0]);
              tocar([...m.caja.querySelectorAll("button")].find((b) => /Siguiente|Ver resultado/.test(b.textContent)));
            }
            tocar(opciones(m.caja).find((b) => b.textContent.trim() === o.nombre));
            huellas[o.id] = huellaFigura(m.caja);
            if (o.id !== decision.respuesta) {
              assert.equal(m.caja.querySelectorAll('[data-estado="revelada"]').length, 1, `${ficha.id} · ${decision.id}: la buena sin señalar`);
            }
          } finally {
            m.desmontar();
          }
        }
        for (const o of decision.opciones) {
          if (o.id === decision.respuesta) continue;
          assert.notEqual(huellas[o.id], huellas[decision.respuesta], `${ficha.id} · ${caso.id} · «${o.nombre}»: se ve igual que acertar`);
        }
      }
    }
  }
});

/* ─────────────────── la partida ─────────────────── */

test("★★★ seis decisiones, el avance no se adelanta, y acertarlas todas registra 100", () => {
  for (const { ficha, casos, Juego } of PIEZAS) {
    const total = casos.reduce((s, c) => s + c.decisiones.length, 0);
    assert.equal(total, 6, `${ficha.id}: seis decisiones`);
    let registro = null;
    const m = montar(React.createElement(Juego, { onCompletar: (pct, ms, detalle) => { registro = { pct, detalle }; } }));
    try {
      for (let i = 0; i < total; i++) {
        const rotulo = m.caja.querySelector("[data-avance]").textContent.trim();
        assert.equal(rotulo, `Decisión ${i + 1} de ${total}`, `${ficha.id}: el rótulo del avance en el ítem ${i + 1}`);
        const id = m.caja.querySelector("[data-decision]").dataset.decision;
        const [caso, decision] = id.split(":");
        const d = casos.find((c) => c.id === caso).decisiones.find((x) => x.id === decision);
        const buena = opciones(m.caja).find((b) => b.textContent.trim() === d.opciones.find((o) => o.id === d.respuesta).nombre);
        assert.ok(buena, `${ficha.id} · ${id}: la opción correcta no está en pantalla`);
        tocar(buena);
        /* El nodo se llena al cerrar, pero el rótulo sigue en el ítem actual. */
        assert.equal(m.caja.querySelector("[data-avance]").textContent.trim(), `Decisión ${i + 1} de ${total}`);
        tocar([...m.caja.querySelectorAll("button")].find((b) => /Siguiente|Ver resultado/.test(b.textContent)));
      }
      assert.equal(registro?.pct, 100, `${ficha.id}: seis aciertos no dieron 100`);
      assert.equal(registro.detalle.length, 6);
      assert.deepEqual([...new Set(registro.detalle.map((x) => x.item))].length, 6, "seis ítems distintos en el detalle");
      assert.ok(m.caja.textContent.includes(ficha.cierre.slice(0, 30)), `${ficha.id}: el cierre no salió`);
    } finally {
      m.desmontar();
    }
  }
});

test("★★★ fallar las seis da 0 y cada fallo deja su respuesta en el detalle", () => {
  for (const { ficha, casos, Juego } of PIEZAS) {
    let registro = null;
    const m = montar(React.createElement(Juego, { onCompletar: (pct, ms, detalle) => { registro = { pct, detalle }; } }));
    try {
      for (let i = 0; i < 6; i++) {
        const id = m.caja.querySelector("[data-decision]").dataset.decision;
        const [caso, decision] = id.split(":");
        const d = casos.find((c) => c.id === caso).decisiones.find((x) => x.id === decision);
        const mala = d.opciones.find((o) => o.id !== d.respuesta);
        tocar(opciones(m.caja).find((b) => b.textContent.trim() === mala.nombre));
        assert.equal(m.caja.querySelector('p[role="status"]').dataset.retro, "mal", `${ficha.id} · ${id}: el veredicto`);
        assert.equal(m.caja.querySelectorAll('[data-estado="revelada"]').length, 1, `${ficha.id} · ${id}: la buena, señalada`);
        tocar([...m.caja.querySelectorAll("button")].find((b) => /Siguiente|Ver resultado/.test(b.textContent)));
      }
      assert.equal(registro?.pct, 0, `${ficha.id}: seis fallos no dieron 0`);
      assert.ok(registro.detalle.every((x) => x.ok === false && typeof x.respuesta === "string"));
    } finally {
      m.desmontar();
    }
  }
});

/* ─────────────────── el kit ─────────────────── */

test("★★ nada de lo que el estudiante lee baja de 12 px, y la regla va al pie", () => {
  const fuente = readFileSync(new URL("../maquinas/instrumentosPM.jsx", import.meta.url), "utf8");
  const tamanos = [...fuente.matchAll(/fontSize: "([\d.]+)px"/g)].map((m) => Number(m[1]));
  assert.ok(tamanos.length > 8, `esperaba medir más tamaños y midió ${tamanos.length}`);
  const bajos = tamanos.filter((t) => t < 12);
  assert.deepEqual(bajos, [], `hay letra por debajo de 12 px: ${bajos.join(", ")}`);
  /* B1 de la barra de enganche: antes de la figura, poco texto. La regla del
     instrumento va después de las opciones, no antes de la figura. */
  assert.ok(fuente.indexOf("data-regla") > fuente.indexOf("<Figura"), "la regla volvió a quedar por encima de la figura");
  for (const { ficha } of PIEZAS) {
    assert.ok(ficha.consigna.split(/\s+/).length <= 20, `${ficha.id}: la consigna pasa de 20 palabras`);
  }
});

test("★★ la mesa no reparte TES ni plata que no salgan de la otra columna", () => {
  /* Las dos columnas suman siempre cuatro: una OMA mueve títulos y plata de un
     lado al otro, no los crea. Si un estado pusiera 5 o −1, la figura mentiría. */
  const estados = D.CASOS_REPO.flatMap((c) => [c.base, ...c.decisiones.flatMap((d) => d.opciones.map((o) => o.estado).filter(Boolean))]);
  for (const e of estados) {
    assert.ok(e.tes >= 0 && e.tes <= 4, `tes fuera de la mesa: ${e.tes}`);
    assert.ok(e.plata >= 0 && e.plata <= 4, `plata fuera de la mesa: ${e.plata}`);
    assert.ok(Math.abs(e.tasaDia ?? 0) <= 2, `la tasa a un día se sale de la escala: ${e.tasaDia}`);
  }
});
