import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ARISTAS_TOTALES, DIAS_PARA_COMPLETAR, aristasReveladas, aristasNuevas, riqueza,
  VERTICES, ARISTAS, CARAS, carasVisibles, proyectar, semana, mensajeRacha,
} from "../teseracto.js";
import { crearDisparador, ESPERA_TRAS_FP_MS } from "../disparador.js";

/* ─────────────────────────── la fórmula ─────────────────────────── */

test("fórmula: aristas_reveladas(día) = round(día × 32/30), con tope 32", () => {
  for (let d = 0; d <= 120; d++) {
    assert.equal(aristasReveladas(d), Math.min(32, Math.round((d * 32) / 30)), `día ${d}`);
  }
  assert.equal(ARISTAS_TOTALES, 32);
  assert.equal(DIAS_PARA_COMPLETAR, 30);
});

test("los días 8 y 23 revelan 2 aristas; los otros 28 días hasta el 30, una; del 31 en adelante, ninguna", () => {
  const dos = [];
  for (let d = 1; d <= 30; d++) {
    const n = aristasNuevas(d);
    if (n === 2) dos.push(d);
    else assert.equal(n, 1, `día ${d}`);
  }
  assert.deepEqual(dos, [8, 23]);
  assert.equal(aristasReveladas(30), 32);
  for (let d = 31; d <= 90; d++) assert.equal(aristasNuevas(d), 0, `día ${d}`);
});

test("es una fórmula, no una lista: el módulo no guarda los 30 valores escritos", () => {
  const fuente = readFileSync(new URL("../teseracto.js", import.meta.url), "utf8");
  assert.ok(!/\[\s*(\d+\s*,\s*){10,}/.test(fuente), "no hay un arreglo largo de números");
  assert.ok(fuente.includes("Math.round((d * ARISTAS_TOTALES) / DIAS_PARA_COMPLETAR)"));
});

test("al completarse la figura se enriquece: 0 antes del día 30, creciente después, tope 1", () => {
  assert.equal(riqueza(29), 0);
  assert.ok(riqueza(30) > 0);
  assert.ok(riqueza(45) > riqueza(30));
  assert.equal(riqueza(200), 1);
});

/* ─────────────────────────── la figura ─────────────────────────── */

test("teseracto: 16 vértices, 32 aristas únicas entre vértices que difieren en una coordenada, 24 caras", () => {
  assert.equal(VERTICES.length, 16);
  assert.equal(ARISTAS.length, 32);
  assert.equal(new Set(ARISTAS.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`)).size, 32);
  for (const [a, b] of ARISTAS) {
    const distintas = VERTICES[a].filter((x, k) => x !== VERTICES[b][k]).length;
    assert.equal(distintas, 1, `${a}-${b}`);
  }
  assert.equal(CARAS.length, 24);
  assert.equal(carasVisibles(32).length, 24);
  assert.equal(carasVisibles(0).length, 0);
});

test("el primer cubo se cierra entero antes de empezar las conexiones: las 12 primeras aristas comparten w", () => {
  assert.deepEqual(ARISTAS[0], [0, 1], "arranca en el vértice 0");
  const w = (v) => VERTICES[v][3];
  const primeras = ARISTAS.slice(0, 12);
  assert.ok(primeras.every(([a, b]) => w(a) === w(b) && w(a) === w(ARISTAS[0][0])), "doce aristas de un mismo cubo");
  assert.ok(ARISTAS.slice(12, 20).every(([a, b]) => w(a) !== w(b)), "luego las ocho que unen los dos cubos");
});

test("cada arista nueva nace de lo ya revelado: todos los prefijos son una figura conexa", () => {
  const vistos = new Set([ARISTAS[0][0]]);
  for (const [a, b] of ARISTAS) {
    assert.ok(vistos.has(a) || vistos.has(b), `${a}-${b} flota suelta`);
    vistos.add(a); vistos.add(b);
  }
});

test("proyección: el cubo de w cercano sale más grande que el lejano (los dos cubos del teseracto)", () => {
  const cerca = proyectar([1, 1, 1, 1], 0, 0);
  const lejos = proyectar([1, 1, 1, -1], 0, 0);
  assert.ok(cerca[0] > lejos[0]);
  assert.ok(Number.isFinite(proyectar([1, 1, 1, 1], 1.3, 2.1)[0]));
});

test("mensaje con el texto de racha", () => {
  assert.equal(mensajeRacha(7, 8), "Pasaste de racha 7 a 8");
});

/* ─────────────────────────── la semana ─────────────────────────── */

test("semana: lunes a domingo; completados, hoy (hueco o hecho) y pendientes", () => {
  /* 2026-09-17 es jueves. */
  const s = semana("2026-09-17", ["2026-09-14", "2026-09-16"]);
  assert.deepEqual(s.map((d) => d.etiqueta), ["L", "Ma", "Mi", "J", "V", "S", "D"]);
  assert.deepEqual(s.map((d) => d.fecha), ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18", "2026-09-19", "2026-09-20"]);
  assert.deepEqual(s.map((d) => d.estado), ["completado", "pendiente", "completado", "hoy", "pendiente", "pendiente", "pendiente"]);
  assert.equal(semana("2026-09-17", ["2026-09-17"])[3].estado, "hoy-hecho");
  /* Un domingo: la semana empieza el lunes anterior, no el siguiente. */
  assert.equal(semana("2026-09-20", [])[0].fecha, "2026-09-14");
  assert.equal(semana("2026-09-20", [])[6].estado, "hoy");
});

/* ─────────────────────────── el disparo ─────────────────────────── */

function montarDisparador(respuesta = { mostrar: true, desde: 4, hasta: 5 }) {
  let oyente = null;
  const pedidos = [];
  const mostrados = [];
  const d = crearDisparador({
    pedir: async () => { pedidos.push(Date.now()); return respuesta; },
    escucharFP: (fn) => { oyente = fn; return () => { oyente = null; }; },
    alMostrar: (m) => mostrados.push(m),
  });
  return { d, pedidos, mostrados, fp: () => oyente?.({ fp: 10 }), escuchando: () => Boolean(oyente) };
}
const vaciar = () => new Promise((r) => setImmediate(r));

test("sin sesión no pregunta nunca, ni al abrir ni tras un FP", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const m = montarDisparador();
    m.d.sesion(false);
    m.fp();
    mock.timers.tick(ESPERA_TRAS_FP_MS + 10);
    await vaciar();
    assert.equal(m.pedidos.length, 0);
    assert.equal(m.mostrados.length, 0);
    m.d.detener();
  } finally {
    mock.timers.reset();
  }
});

test("con sesión pregunta al abrir Y otra vez tras cada FP confirmado — el fallo viejo era no volver a preguntar", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const m = montarDisparador({ mostrar: false });
    m.d.sesion(true);
    await vaciar();
    assert.equal(m.pedidos.length, 1, "al abrir la sesión");
    m.fp();
    mock.timers.tick(ESPERA_TRAS_FP_MS - 1);
    await vaciar();
    assert.equal(m.pedidos.length, 1, "espera a que termine el cierre de la actividad");
    mock.timers.tick(1);
    await vaciar();
    assert.equal(m.pedidos.length, 2, "tras el FP vuelve a preguntar");
    assert.equal(m.mostrados.length, 0, "y si el servidor dice que no, no enseña nada");
    m.d.detener();
    assert.equal(m.escuchando(), false, "al detener deja de escuchar");
  } finally {
    mock.timers.reset();
  }
});

test("enseña solo cuando el servidor dice mostrar, y cerrar sesión cancela lo pendiente", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const m = montarDisparador({ mostrar: true, desde: 7, hasta: 8 });
    m.d.sesion(true);
    await vaciar();
    assert.deepEqual(m.mostrados, [{ mostrar: true, desde: 7, hasta: 8 }]);
    m.fp();
    m.d.sesion(false);
    mock.timers.tick(ESPERA_TRAS_FP_MS + 10);
    await vaciar();
    assert.equal(m.pedidos.length, 1, "la pregunta pendiente murió con la sesión");
    m.d.detener();
  } finally {
    mock.timers.reset();
  }
});
