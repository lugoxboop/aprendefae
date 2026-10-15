import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL NIVEL DE UNA ALERTA SE DICE CON FORMA, NO SOLO CON EL TONO (Xeno).
 *
 * En la fila cerrada de un estudiante, el punto de 8 px en coral / ámbar / teal
 * era lo único visible que decía «urgente», «atención» o «destacado»: la
 * palabra vivía en un `title` (que no sale en el móvil ni con el teclado) y en
 * el aria-label. Coral y teal miden lo mismo en gris (1,07:1), así que
 * «urgente» y «destacado» —los dos extremos opuestos— eran el mismo punto.
 *
 * Se hace la comprobación del blanco y negro como prueba: se le QUITAN todos
 * los estilos al DOM montado y los niveles tienen que seguir siendo distintos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
const w = dom.window;
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
for (const [k, v] of Object.entries({
  window: w, document: w.document, navigator: w.navigator, HTMLElement: w.HTMLElement, Element: w.Element, Node: w.Node,
  SVGElement: w.SVGElement, Event: w.Event, MouseEvent: w.MouseEvent, KeyboardEvent: w.KeyboardEvent,
  getComputedStyle: w.getComputedStyle.bind(w), matchMedia: w.matchMedia,
  requestAnimationFrame: w.requestAnimationFrame.bind(w), cancelAnimationFrame: w.cancelAnimationFrame.bind(w),
})) {
  Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act;
const h = React.createElement;

const { default: MarcaNivel, NIVEL_MARCA } = await import("../../components/docente/MarcaNivel.jsx");
const { default: FilaEstudiante } = await import("../../components/docente/FilaEstudiante.jsx");
const { default: CabeceraResumen } = await import("../../components/docente/CabeceraResumen.jsx");
const { SUBJECTS } = await import("../../data/subjects.js");

const sinEstilo = (el) => el.outerHTML.replace(/ style="[^"]*"/g, "");

const montar = async (elemento) => {
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  await act(async () => { raiz.render(elemento); });
  return { caja, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
};

const SUBJECT_ID = Object.keys(SUBJECTS)[0];

/* Un estudiante sin ninguna alerta; cada caso le cambia lo mínimo para encender la suya. */
const BASE = {
  user_id: "u1", full_name: "Ana Pérez", nickname: "ana", actividades: [],
  n_registros: 3, dias_inactivo: 1, fp_ciclo: 10, fp_total: 50,
  pct_evaluativa: 80, n_evaluativas: 3, pct_exploratoria: 90, n_exploratorias: 3,
  duracion_media_ms: 200000, en_mi_grupo: false, es_prueba: false,
};
const CASOS = {
  urgente: { e: { ...BASE, dias_inactivo: 12 }, destacado: false, palabra: "alerta urgente" },
  atencion: { e: { ...BASE, pct_evaluativa: 40 }, destacado: false, palabra: "alerta de atención" },
  destacado: { e: { ...BASE }, destacado: true, palabra: "destacado" },
  ninguno: { e: { ...BASE }, destacado: false, palabra: null },
};

const montarFila = (caso) => montar(h(FilaEstudiante, {
  e: caso.e, subjectId: SUBJECT_ID, onMarcar() {}, abierta: false, onAlternar() {}, destacado: caso.destacado, posicion: 1,
}));
const indicadorDe = (caja) => caja.querySelector("[data-nivel]");

test("★★★ MarcaNivel: los cinco niveles son cinco marcas distintas SIN estilos", async () => {
  const todas = [];
  for (const nivel of Object.values(NIVEL_MARCA)) {
    const t = await montar(h(MarcaNivel, { nivel }));
    todas.push([nivel, sinEstilo(t.caja.querySelector("svg"))]);
    t.desmontar();
  }
  for (let i = 0; i < todas.length; i += 1) {
    for (let j = i + 1; j < todas.length; j += 1) {
      assert.notEqual(todas[i][1], todas[j][1], `sin estilos, «${todas[i][0]}» y «${todas[j][0]}» son la misma marca`);
    }
  }
});

test("★★★ la fila cerrada: urgente, atención, destacado y sin señal se distinguen SIN estilos", async () => {
  const vistas = {};
  for (const [nombre, caso] of Object.entries(CASOS)) {
    const t = await montarFila(caso);
    try {
      const ind = indicadorDe(t.caja);
      assert.ok(ind, `${nombre}: la fila no tiene indicador`);
      assert.equal(ind.dataset.nivel, nombre, `${nombre}: el indicador dice otra cosa`);
      vistas[nombre] = sinEstilo(ind);
    } finally { t.desmontar(); }
  }
  const nombres = Object.keys(vistas);
  for (let i = 0; i < nombres.length; i += 1) {
    for (let j = i + 1; j < nombres.length; j += 1) {
      assert.notEqual(vistas[nombres[i]], vistas[nombres[j]], `sin estilos, «${nombres[i]}» y «${nombres[j]}» son el mismo indicador`);
    }
  }
});

test("★★★ el par peligroso: «urgente» y «destacado» (coral y teal) no se parecen sin color", async () => {
  const u = await montarFila(CASOS.urgente);
  const d = await montarFila(CASOS.destacado);
  try {
    assert.notEqual(sinEstilo(indicadorDe(u.caja)), sinEstilo(indicadorDe(d.caja)));
    const pathU = indicadorDe(u.caja).querySelector("path")?.getAttribute("d");
    const pathD = indicadorDe(d.caja).querySelector("path")?.getAttribute("d");
    assert.ok(pathU && pathD && pathU !== pathD, "la silueta del urgente y la del destacado tienen que ser distintas");
  } finally { u.desmontar(); d.desmontar(); }
});

test("★★ la palabra del nivel sigue en el aria-label de la fila y en el title del indicador", async () => {
  for (const [nombre, caso] of Object.entries(CASOS)) {
    const t = await montarFila(caso);
    try {
      const boton = t.caja.querySelector("button[aria-expanded]");
      const titulo = indicadorDe(t.caja).parentElement.getAttribute("title");
      if (caso.palabra) {
        assert.ok(boton.getAttribute("aria-label").includes(caso.palabra), `${nombre}: el aria-label perdió su palabra`);
        assert.equal(titulo, caso.palabra, `${nombre}: el title perdió su palabra`);
      } else {
        assert.ok(!/alerta|destacado/.test(boton.getAttribute("aria-label")), "sin señal no debe anunciar nada");
        assert.equal(titulo, null);
      }
    } finally { t.desmontar(); }
  }
});

test("★★ la cabecera: sus tres contadores usan la MISMA silueta que las filas, con su palabra", async () => {
  const alertas = [{ nivel: "urgente" }, { nivel: "atencion" }, { nivel: "atencion" }, { nivel: "info" }];
  const t = await montar(h(CabeceraResumen, {
    cohorte: [BASE], etiquetaCohorte: "en tu grupo", alertas, resumen: null, temaDe: () => null,
  }));
  try {
    const marcas = [...t.caja.querySelectorAll("[data-nivel]")].map((m) => m.dataset.nivel);
    assert.deepEqual(marcas, ["urgente", "atencion", "info"]);
    const contadores = [...t.caja.querySelectorAll("[data-nivel]")].map((m) => m.closest("span[style*='inline-flex']").textContent);
    assert.ok(/urgentes/.test(contadores[0]) && /atención/.test(contadores[1]) && /informativas/.test(contadores[2]),
      "cada contador conserva su palabra");
    const siluetas = new Set([...t.caja.querySelectorAll("[data-nivel] path, [data-nivel] circle")].map((n) => n.getAttribute("d") ?? `c${n.getAttribute("r")}`));
    assert.equal(siluetas.size, 3, "las tres siluetas de la cabecera tienen que ser distintas");
  } finally { t.desmontar(); }
});

test("★★ el detalle de la fila abierta: la alerta lleva su silueta y su palabra", async () => {
  const { default: DetalleEstudiante } = await import("../../components/docente/DetalleEstudiante.jsx");
  for (const [nombre, palabra] of [["urgente", "Urgente"], ["atencion", "Atención"]]) {
    const t = await montar(h(DetalleEstudiante, { e: CASOS[nombre].e, subjectId: SUBJECT_ID, posicion: 1 }));
    try {
      const marca = t.caja.querySelector("[data-nivel]");
      assert.equal(marca?.dataset.nivel, nombre, `${nombre}: el detalle no lleva la marca del nivel`);
      assert.ok(t.caja.textContent.includes(palabra), `${nombre}: el detalle perdió la palabra «${palabra}»`);
    } finally { t.desmontar(); }
  }
});
