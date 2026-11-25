import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { JSDOM, VirtualConsole } from "jsdom";
import {
  ARISTAS, CARAS, VERTICES, faseDeArista, trazos, aristasReveladas, aristasNuevas, carasVisibles,
} from "../teseracto.js";

/*
 * Las tres correcciones sobre el teseracto ya construido (la 1 se adaptó el
 * 25-nov, cuando la mascota con su llama reemplazó al teseracto en el momento):
 *   1. el trazo se ve —1,5 a 2,5 s por arista— y hay una pausa antes de encoger
 *   2. la tarjeta de la semana no se cierra sola
 *   3. las aristas se revelan en tres fases y cada cara nace con su cuarta arista
 */

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", virtualConsole: new VirtualConsole(), pretendToBeVisual: true });
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
w.innerWidth = 375;
w.innerHeight = 812;

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const act = React.act ?? (await import("react-dom/test-utils")).act;
const { SecuenciaRacha, TIEMPOS, duracionEntrada } = await import("../../components/racha/MomentoRacha.jsx");

const MOMENTO = { mostrar: true, desde: 7, hasta: 8, hoy: "2026-09-17", semana: ["2026-09-14"] };

function montar(momento = MOMENTO) {
  const fin = [];
  const caja = document.createElement("div");
  document.body.appendChild(caja);
  const raiz = createRoot(caja);
  act(() => raiz.render(React.createElement(SecuenciaRacha, { momento, onFin: () => fin.push(1) })));
  const fase = () => caja.querySelector("[data-momento-racha]")?.dataset.momentoRacha ?? null;
  return { caja, fin, fase, desmontar: () => { act(() => raiz.unmount()); caja.remove(); } };
}
const avanzar = (ms) => act(() => { mock.timers.tick(ms); });

/* ─────────────────────────── 1. el ritmo ─────────────────────────── */

/*
 * 25-nov: el momento grande ya no traza aristas (lo protagoniza la mascota con
 * su llama). Lo que se conserva de estas correcciones es el RITMO: que lo
 * importante se alcance a ver antes de que llegue la tarjeta.
 */
test("el número cambia cuando la llama ya creció, y se deja ver antes de la tarjeta", () => {
  assert.ok(TIEMPOS.cambioNumero >= TIEMPOS.crecer + 300, "la llama termina de crecer antes del cambio");
  const visto = duracionEntrada(8) - TIEMPOS.cambioNumero;
  assert.ok(visto >= 1500 && visto <= 2600, `el número nuevo se ve ${visto} ms antes de la tarjeta`);
  assert.equal(duracionEntrada(8), duracionEntrada(23), "ya no depende del día");
});

test("la entrada no se corta antes de tiempo: sigue en entrada hasta el último milisegundo", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  const m = montar();
  try {
    avanzar(duracionEntrada(8) - 1);
    assert.equal(m.fase(), "entrada");
    avanzar(1);
    assert.equal(m.fase(), "semana");
  } finally {
    m.desmontar();
    mock.timers.reset();
  }
});

test("la tarjeta de la semana NO se cierra sola: ni en diez minutos ni en una hora", () => {
  mock.timers.enable({ apis: ["setTimeout", "Date"] });
  const m = montar();
  try {
    avanzar(duracionEntrada(8));
    assert.equal(m.fase(), "semana");
    avanzar(60 * 60 * 1000);
    assert.equal(m.fase(), "semana", "una hora después sigue ahí");
    assert.equal(m.fin.length, 0, "y nadie la cerró");

    /* La cierra el estudiante, con el botón. */
    act(() => { m.caja.querySelector("[data-continuar]").dispatchEvent(new w.MouseEvent("click", { bubbles: true })); });
    assert.equal(m.fase(), "salida");
    avanzar(TIEMPOS.salida);
    assert.equal(m.fin.length, 1);
  } finally {
    m.desmontar();
    mock.timers.reset();
  }
});

test("saltar sigue siendo otra cosa: un toque la corta en cualquier fase, incluida la entrada", () => {
  for (const [cuando, fase] of [[0, "entrada"], [duracionEntrada(8) + 100, "semana"]]) {
    mock.timers.enable({ apis: ["setTimeout", "Date"] });
    const m = montar();
    try {
      avanzar(cuando);
      assert.equal(m.fase(), fase);
      act(() => { m.caja.querySelector("[data-momento-racha]").dispatchEvent(new w.MouseEvent("pointerdown", { bubbles: true })); });
      assert.equal(m.fase(), "salida", `saltada desde ${fase}`);
      avanzar(TIEMPOS.salida);
      assert.equal(m.fin.length, 1);
    } finally {
      m.desmontar();
      mock.timers.reset();
    }
  }
});

/* ─────────────────────────── 3. fases y caras ─────────────────────────── */

const EXTERIOR = 0, INTERIOR = 1, CONEXION = 2;

test("orden en tres fases: 12 del cubo exterior, 12 del interior y 8 conexiones, en bloques", () => {
  const fases = ARISTAS.map(faseDeArista);
  assert.deepEqual(fases.slice(0, 12), Array(12).fill(EXTERIOR));
  assert.deepEqual(fases.slice(12, 24), Array(12).fill(INTERIOR));
  assert.deepEqual(fases.slice(24), Array(8).fill(CONEXION));
  /* El cubo exterior es el de w = +1: el que la proyección agranda. */
  for (const [a, b] of ARISTAS.slice(0, 12)) {
    assert.equal(VERTICES[a][3], 1);
    assert.equal(VERTICES[b][3], 1);
  }
  for (const [a, b] of ARISTAS.slice(24)) assert.notEqual(VERTICES[a][3], VERTICES[b][3]);
});

test("ningún día enseña una arista interior faltando exterior, ni una conexión faltando interior", () => {
  for (let dia = 0; dia <= 40; dia++) {
    const n = aristasReveladas(dia);
    const fases = ARISTAS.slice(0, n).map(faseDeArista);
    const exteriores = fases.filter((f) => f === EXTERIOR).length;
    const interiores = fases.filter((f) => f === INTERIOR).length;
    const conexiones = fases.filter((f) => f === CONEXION).length;
    if (interiores > 0) assert.equal(exteriores, 12, `día ${dia}: interior con el exterior a medias`);
    if (conexiones > 0) assert.equal(interiores, 12, `día ${dia}: conexión con el interior a medias`);
    assert.equal(exteriores + interiores + conexiones, n);
  }
  /* Los dos días que revelan dos aristas no se saltan el corte de fase. */
  for (const dia of [8, 23]) {
    const nuevas = ARISTAS.slice(aristasReveladas(dia - 1), aristasReveladas(dia));
    assert.equal(nuevas.length, 2, `día ${dia}`);
  }
  assert.equal(aristasReveladas(11), 12, "el día 11 cierra el cubo exterior");
  assert.equal(aristasReveladas(23), 25, "el día 23 abre las conexiones");
});

test("una cara se rellena exactamente cuando se revela su cuarta arista", () => {
  const clave = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const indice = new Map(ARISTAS.map(([a, b], k) => [clave(a, b), k]));

  for (const cara of CARAS) {
    const aristas = cara.map((v, k) => indice.get(clave(v, cara[(k + 1) % 4])));
    const ultima = Math.max(...aristas);
    /* Ni una antes: con la cuarta arista todavía sin revelar, la cara no está. */
    assert.ok(!carasVisibles(ultima).some((c) => c.join() === cara.join()), `cara ${cara}: rellena de más`);
    /* Ni un día después: en cuanto se revela, la cara está. */
    assert.ok(carasVisibles(ultima + 1).some((c) => c.join() === cara.join()), `cara ${cara}: rellena de menos`);
  }

  /* Y el recuento por fases: el cubo exterior cerrado son sus seis caras. */
  assert.equal(carasVisibles(12).length, 6);
  assert.equal(carasVisibles(24).length, 12);
  assert.equal(carasVisibles(32).length, 24);
});
