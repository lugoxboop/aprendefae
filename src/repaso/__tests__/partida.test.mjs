import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * La partida (B7, B8) y dónde vive la entrada: todo lo que se ve.
 * Mismo montaje jsdom que bloques-partidas.
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
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
const act = React.act ?? (await import("react-dom/test-utils")).act;

const { default: PartidaRepaso } = await import("../../components/repaso/PartidaRepaso.jsx");
const { POOL } = await import("../items.js");
const { MENSAJES } = await import("../repaso.js");
const { SUBJECTS, ACTIVIDADES_TRANSVERSALES, ubicacionDeActividad } = await import("../../data/subjects.js");
const { VISTAS, vistaDeTema } = await import("../../ruta.js");

function montar(elemento) {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(elemento));
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const click = (el, que) => {
  assert.ok(el, `no está en pantalla: ${que}`);
  assert.ok(!el.disabled, `está deshabilitado: ${que}`);
  act(() => { el.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
};
const botones = (caja) => [...caja.querySelectorAll("button")];

/* ─────────────────────────── Dónde vive la entrada ─────────────────────────── */

test("el Repaso no está en ningún camino ni bloque: su entrada es del índice de Macroeconomía", () => {
  for (const materia of Object.values(SUBJECTS))
    for (const tema of materia.topics)
      assert.ok(!(tema.actividades ?? []).some((a) => a.id === "repaso-diario"), `${tema.id} lo tiene en su camino`);
  const repaso = ACTIVIDADES_TRANSVERSALES.find((a) => a.id === "repaso-diario");
  assert.equal(repaso.indice, "macroeconomia");
  assert.deepEqual(ubicacionDeActividad("repaso-diario"), { materiaId: "macroeconomia", temaId: "repaso-diario" });
  assert.ok(VISTAS.has("repaso-diario"));
  assert.equal(vistaDeTema("repaso-diario"), "repaso-diario");
  assert.deepEqual(repaso.clasificacion, { tipo: "hacer", modalidad: "evaluativa", dificultad: "medio", fpBase: 60, renovableDiario: true });
});

/* ─────────────────────────────── La partida ─────────────────────────────── */

/* Diez ítems de formas distintas, en un orden fijo. */
const CLAVES = [
  "sala-monitores:hospital", "que-rama-es:" + POOL.find((x) => x.actividad === "que-rama-es").itemId,
  "triage-emergencias:a:b-vs-c", "a-quien-le-pega-la-tasa:sube-a-12:cdt-renovar", "el-rezago:sube-enero:interbancario",
  "diagnostico-en-vivo:brecha", "flujo-de-caja:multiplicador", "se-acerca-o-se-aleja:sube-tasa",
  "electrocardiograma:frag:c-barra", "dilema-banquero-central:dilema",
];
const ITEMS = CLAVES.map((c) => POOL.find((x) => x.clave === c));

function jugar({ historial = new Map(), bien = () => true, alTocar = null }) {
  const fin = [];
  const m = montar(React.createElement(PartidaRepaso, { items: ITEMS, historial, onTerminar: (pct, ms, detalle) => fin.push({ pct, ms, detalle }) }));
  ITEMS.forEach((item, k) => {
    const id = bien(k) ? item.correcta : item.opciones.find((o) => o.id !== item.correcta).id;
    const texto = item.opciones.find((o) => o.id === id).texto;
    const boton = botones(m.caja).find((b) => b.textContent.trim().endsWith(texto) && !b.disabled);
    click(boton, `${item.clave} · ${texto}`);
    alTocar?.(m, item, k, id);
    click(botones(m.caja).find((b) => ["Siguiente", "Ver resultado"].includes(b.textContent.trim())), "avanzar");
  });
  return { ...m, fin };
}

test("6 de 10 → 60 %, diez filas de detalle con la clave entera, un intento cada una", () => {
  const m = jugar({ bien: (k) => k < 6 });
  try {
    assert.equal(m.fin.length, 1);
    const { pct, detalle } = m.fin[0];
    assert.equal(pct, 60);
    /* 60 % de la base de 60 son 36 FP; lo cobra el servidor (repaso_test, paso 3). */
    assert.equal(Math.round(60 * pct / 100), 36);
    assert.deepEqual(detalle.map((f) => f.item), CLAVES);
    assert.ok(detalle.every((f) => f.intentos === 1));
    assert.deepEqual(detalle.map((f) => f.ok), [true, true, true, true, true, true, false, false, false, false]);
    assert.ok(m.caja.textContent.includes("6 de 10."));
  } finally {
    m.desmontar();
  }
});

test("un intento: tras elegir, las opciones quedan bloqueadas y un segundo toque no registra", () => {
  const fin = [];
  const m = montar(React.createElement(PartidaRepaso, { items: ITEMS, historial: new Map(), onTerminar: (pct, ms, detalle) => fin.push({ pct, detalle }) }));
  try {
    for (const item of ITEMS) {
      const texto = (id) => item.opciones.find((o) => o.id === id).texto;
      const boton = (id) => botones(m.caja).find((b) => b.textContent.trim().endsWith(texto(id)));
      const mala = item.opciones.find((o) => o.id !== item.correcta).id;
      /*
       * Dos toques en el MISMO lote de React: el segundo llega antes de que la
       * opción se pinte deshabilitada, que es el toque a destiempo de
       * unicidad-partida. Solo el guardia por clave lo para.
       */
      const [b1, b2] = [boton(item.correcta), boton(mala)];
      act(() => {
        b1.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
        b2.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
      });
      assert.ok(item.opciones.every((o) => boton(o.id).disabled), item.clave);
      click(botones(m.caja).find((b) => ["Siguiente", "Ver resultado"].includes(b.textContent.trim())), "avanzar");
    }
    assert.equal(fin.length, 1);
    assert.equal(fin[0].detalle.length, 10);
    assert.ok(fin[0].detalle.every((f) => f.ok), "cuenta el primer toque, no el segundo");
    assert.equal(fin[0].pct, 100);
  } finally {
    m.desmontar();
  }
});

test("la devolución de origen se ve tal cual, y 🎯 va DESPUÉS solo si estaba fallado y ahora sale bien", () => {
  const historial = new Map([
    ["sala-monitores:hospital", { ultimoEn: "2026-09-01T12:00:00Z", ultimoOk: false, veces: 1 }],
    ["triage-emergencias:a:b-vs-c", { ultimoEn: "2026-09-01T12:00:00Z", ultimoOk: false, veces: 1 }],
    ["el-rezago:sube-enero:interbancario", { ultimoEn: "2026-09-01T12:00:00Z", ultimoOk: true, veces: 1 }],
  ]);
  const vistos = {};
  const m = jugar({
    historial,
    /* El triage se falla: estaba fallado y sigue fallado, no hay 🎯. */
    bien: (k) => k !== 2,
    alTocar: (mm, item, k, id) => {
      const texto = mm.caja.textContent;
      for (const b of item.devolucion(id)) assert.ok(texto.includes(b.tipo === "retro" ? b.texto.slice(2) : b.texto.replace(" · ✗ te equivocaste", "")), `${item.clave}: ${b.texto}`);
      const diana = mm.caja.querySelector("[data-antes-fallada]");
      vistos[item.clave] = Boolean(diana);
      if (diana) {
        assert.equal(diana.textContent, MENSAJES.antesFallada);
        const ultimaDevolucion = [...mm.caja.querySelectorAll("p")].filter((p) => p !== diana).pop();
        assert.ok(ultimaDevolucion.compareDocumentPosition(diana) & w.Node.DOCUMENT_POSITION_FOLLOWING, "la 🎯 va después");
      }
    },
  });
  try {
    assert.equal(vistos["sala-monitores:hospital"], true);
    assert.equal(vistos["triage-emergencias:a:b-vs-c"], false);
    assert.equal(vistos["el-rezago:sube-enero:interbancario"], false);
    assert.equal(Object.values(vistos).filter(Boolean).length, 1);
  } finally {
    m.desmontar();
  }
});
