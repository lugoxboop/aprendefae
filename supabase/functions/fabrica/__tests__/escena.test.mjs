import test from "node:test";
import assert from "node:assert/strict";
import {
  ARQUETIPOS, NOMBRES_ARQUETIPO, MAX_ETIQUETA, MAX_PARTES,
  instruccionesDeEscena, limpiarId, limpiarEscena, amarrarPasos,
} from "../escena.js";
import { FIGURAS } from "../../../../src/components/shared/EscenaGenerada.jsx";

/*
 * El contrato de la escena tiene dos extremos que no se tocan: el validador
 * vive en el servidor y el dibujo en el navegador. Si se separan, el modelo
 * genera una figura que nadie sabe pintar y la actividad sale sin capa 2 —
 * que es exactamente el defecto que esta pieza vino a arreglar.
 */

test("el servidor y el navegador conocen las mismas figuras", () => {
  assert.deepEqual(NOMBRES_ARQUETIPO.sort(), Object.keys(FIGURAS).sort());
});

test("cada arquetipo se explica entero en el encargo", () => {
  const texto = instruccionesDeEscena();
  for (const [nombre, a] of Object.entries(ARQUETIPOS)) {
    assert.ok(texto.includes(nombre), `falta ${nombre} en el encargo`);
    assert.ok(texto.includes(a.forma), `falta la forma de ${nombre}`);
  }
});

test("los ids quedan utilizables pase lo que pase", () => {
  assert.equal(limpiarId("Banco Central"), "bancocentral");
  assert.equal(limpiarId("Inflación"), "inflacion");
  assert.equal(limpiarId("  "), "");
  assert.equal(limpiarId(null), "");
  assert.ok(limpiarId("a".repeat(40)).length <= 16);
});

const flujoCrudo = {
  arquetipo: "flujo",
  partes: [
    { id: "banco", etiqueta: "Banco de la República", fila: 0, col: 0 },
    { id: "tasa", etiqueta: "Tasa de interés", fila: 1, col: 0 },
    { id: "gasto", etiqueta: "Gasto de los hogares", fila: 2, col: 0 },
  ],
  enlaces: [{ de: "banco", a: "tasa" }, { de: "tasa", a: "gasto" }],
};

test("una escena buena pasa entera", () => {
  const e = limpiarEscena(flujoCrudo);
  assert.equal(e.arquetipo, "flujo");
  assert.equal(e.partes.length, 3);
  assert.equal(e.enlaces.length, 2);
});

test("se cae lo que no se puede dibujar", () => {
  assert.equal(limpiarEscena(null), null);
  assert.equal(limpiarEscena({ arquetipo: "mandala", partes: [] }), null);
  /* Una sola parte no es una escena. */
  assert.equal(limpiarEscena({ arquetipo: "linea", partes: [{ id: "a", etiqueta: "Uno" }] }), null);
  /* Una balanza con un solo platillo tampoco. */
  assert.equal(
    limpiarEscena({ arquetipo: "balanza", partes: [{ id: "a", etiqueta: "Uno", lado: "izq" }, { id: "b", etiqueta: "Dos", lado: "izq" }] }),
    null,
  );
});

test("los rótulos se recortan a lo que cabe, y las partes se topan", () => {
  const e = limpiarEscena({
    arquetipo: "linea",
    partes: Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, etiqueta: "x".repeat(80) })),
  });
  assert.equal(e.partes.length, MAX_PARTES);
  for (const p of e.partes) assert.ok(p.etiqueta.length <= MAX_ETIQUETA);
});

test("un enlace a una parte que no existe no se dibuja", () => {
  const e = limpiarEscena({ ...flujoCrudo, enlaces: [{ de: "banco", a: "fantasma" }, { de: "banco", a: "banco" }] });
  assert.equal(e.enlaces.length, 0);
});

test("barras sin cifras cae a pila: sin números no hay nada que comparar", () => {
  const e = limpiarEscena({
    arquetipo: "escalones", modo: "barras",
    partes: [{ id: "a", etiqueta: "Uno" }, { id: "b", etiqueta: "Dos", valor: 5 }],
  });
  assert.equal(e.modo, "pila");
});

/* ═══════════ EL AMARRE: ES AQUÍ DONDE SE CAE «PURO TEXTO» ═══════════ */

const escena = limpiarEscena(flujoCrudo);

test("los pasos buenos se quedan con sus ids", () => {
  const pasos = amarrarPasos([
    { texto: "El banco mueve su tasa.", resaltar: ["banco"] },
    { texto: "El crédito se encarece.", resaltar: ["tasa"] },
    { texto: "Las familias gastan menos.", resaltar: ["gasto"] },
  ], escena);
  assert.equal(pasos.length, 3);
  assert.deepEqual(pasos[0].resaltar, ["banco"]);
});

test("un paso que no enciende nada no entra", () => {
  const pasos = amarrarPasos([
    { texto: "Uno", resaltar: ["banco"] },
    { texto: "Dos", resaltar: [] },
    { texto: "Tres", resaltar: ["tasa"] },
    { texto: "Cuatro", resaltar: ["gasto"] },
  ], escena);
  assert.equal(pasos.length, 3);
  assert.ok(!pasos.some((p) => p.texto === "Dos"));
});

test("un paso que enciende tres partes ya no es un foco", () => {
  const pasos = amarrarPasos([
    { texto: "Uno", resaltar: ["banco", "tasa", "gasto"] },
    { texto: "Dos", resaltar: ["tasa"] },
    { texto: "Tres", resaltar: ["gasto"] },
    { texto: "Cuatro", resaltar: ["banco"] },
  ], escena);
  assert.ok(!pasos.some((p) => p.texto === "Uno"));
});

test("una parte que ningún paso enciende tumba la pieza", () => {
  const pasos = amarrarPasos([
    { texto: "Uno", resaltar: ["banco"] },
    { texto: "Dos", resaltar: ["tasa"] },
    { texto: "Tres", resaltar: ["banco"] },
  ], escena);
  assert.equal(pasos, null);
});

test("sin escena no hay pasos que amarrar", () => {
  assert.equal(amarrarPasos([{ texto: "Uno", resaltar: ["banco"] }], null), null);
});

test("menos de tres pasos no es una capa 2", () => {
  assert.equal(amarrarPasos([{ texto: "Uno", resaltar: ["banco"] }], escena), null);
});
