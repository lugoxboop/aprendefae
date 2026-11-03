import test from "node:test";
import assert from "node:assert/strict";
import {
  TRAZOS, NOMBRES_TRAZO, MAX_TRAZOS, MIN_TRAZOS, MAX_PUNTOS_CURVA,
  LIENZO_ANCHO, LIENZO_ALTO_MIN, LIENZO_ALTO_MAX, instruccionesDeLienzo,
} from "../lienzo.js";
import { limpiarEscena, amarrarPasos, limpiarId, piezasDe } from "../escena.js";
import { FIGURAS } from "../../../../src/components/mecanicas/maquinas/EscenaGenerada.jsx";

/*
 * El lienzo existe para que no haya tema que Fermi no pueda dibujar. Lo que
 * estas pruebas cuidan es que esa libertad no se convierta en lo otro: un
 * trazo fuera del papel, una figura que no se puede mirar, o —lo importante—
 * algo que se ejecute. Del modelo salen datos; aquí se comprueba que solo
 * salgan datos.
 */

const PLANO = {
  arquetipo: "lienzo",
  alto: 250,
  trazos: [
    { tipo: "eje", id: "ejex", hacia: "derecha", x: 48, y: 206, largo: 276, etiqueta: "Producción" },
    { tipo: "eje", id: "ejey", hacia: "arriba", x: 48, y: 206, largo: 176, etiqueta: "Nivel de precios" },
    { tipo: "curva", id: "da", puntos: [[66, 54], [170, 128], [308, 192]], etiqueta: "DA" },
    { tipo: "punto", id: "eq", x: 196, y: 104, etiqueta: "Equilibrio", donde: "derecha" },
  ],
};

test("el navegador sabe dibujar el lienzo", () => {
  assert.ok(FIGURAS.lienzo, "falta la figura «lienzo» en el dibujante");
});

test("el encargo explica todos los trazos y da un ejemplo con medidas", () => {
  const t = instruccionesDeLienzo();
  for (const [nombre, trazo] of Object.entries(TRAZOS)) {
    assert.ok(t.includes(nombre), `falta ${nombre}`);
    assert.ok(t.includes(trazo.forma), `falta la forma de ${nombre}`);
  }
  /* Sin el ejemplo, el modelo pone la «y» al revés: en pantalla crece hacia
     abajo y en un plano económico el precio sube hacia arriba. */
  assert.match(t, /y.{0,20}crece hacia ABAJO/i);
  assert.ok(t.includes('"arquetipo":"lienzo", "alto":240'), "falta el ejemplo entero");
});

test("un plano entero pasa con sus trazos", () => {
  const e = limpiarEscena(PLANO);
  assert.equal(e.arquetipo, "lienzo");
  assert.equal(e.alto, 250);
  assert.equal(e.trazos.length, 4);
});

/* ═══════════ NADA SALE DEL PAPEL ═══════════ */

test("lo que se sale del papel se mete dentro, no se dibuja a medias", () => {
  const e = limpiarEscena({
    arquetipo: "lienzo", alto: 200,
    trazos: [
      { tipo: "caja", id: "a", x: -80, y: -40, ancho: 900, alto: 900, etiqueta: "Fuera" },
      { tipo: "curva", id: "b", puntos: [[-50, -50], [9999, 9999]] },
    ],
  });
  const caja = e.trazos.find((t) => t.id === "a");
  assert.ok(caja.x >= 0 && caja.y >= 0);
  assert.ok(caja.x + caja.ancho <= LIENZO_ANCHO);
  assert.ok(caja.y + caja.alto <= 200);
  for (const [x, y] of e.trazos.find((t) => t.id === "b").puntos) {
    assert.ok(x >= 0 && x <= LIENZO_ANCHO, `x fuera: ${x}`);
    assert.ok(y >= 0 && y <= 200, `y fuera: ${y}`);
  }
});

test("el alto se queda entre los topes, y sin alto hay uno por defecto", () => {
  assert.equal(limpiarEscena({ ...PLANO, alto: 9000 }).alto, LIENZO_ALTO_MAX);
  assert.equal(limpiarEscena({ ...PLANO, alto: 10 }).alto, LIENZO_ALTO_MIN);
  assert.ok(limpiarEscena({ ...PLANO, alto: undefined }).alto >= LIENZO_ALTO_MIN);
});

test("un eje no se dibuja más largo que el papel que le queda", () => {
  const e = limpiarEscena({
    arquetipo: "lienzo", alto: 200,
    trazos: [
      { tipo: "eje", id: "x", hacia: "derecha", x: 300, y: 180, largo: 900, etiqueta: "X" },
      { tipo: "punto", id: "p", x: 50, y: 50 },
    ],
  });
  const eje = e.trazos.find((t) => t.id === "x");
  assert.ok(eje.x + eje.largo <= LIENZO_ANCHO, `el eje llega a ${eje.x + eje.largo}`);
});

/* ═══════════ SOLO DATOS, NUNCA CÓDIGO ═══════════ */

test("un tipo de trazo que no existe no se pinta: no hay forma de colar uno nuevo", () => {
  const e = limpiarEscena({
    arquetipo: "lienzo", alto: 200,
    trazos: [
      { tipo: "script", id: "malo", src: "https://ajeno.example/x.js" },
      { tipo: "html", id: "malo2", html: "<img onerror=alert(1)>" },
      { tipo: "curva", id: "buena", puntos: [[10, 10], [100, 100]] },
      { tipo: "punto", id: "p", x: 50, y: 50 },
    ],
  });
  assert.equal(e.trazos.length, 2);
  assert.ok(e.trazos.every((t) => NOMBRES_TRAZO.includes(t.tipo)));
});

test("los campos de más no sobreviven: solo se guarda lo que el dibujante lee", () => {
  const e = limpiarEscena({
    arquetipo: "lienzo", alto: 200,
    trazos: [
      { tipo: "punto", id: "p", x: 50, y: 50, onClick: "alert(1)", dangerouslySetInnerHTML: { __html: "<b>x</b>" }, style: "x" },
      { tipo: "curva", id: "c", puntos: [[10, 10], [90, 90]] },
    ],
  });
  const punto = e.trazos.find((t) => t.id === "p");
  assert.deepEqual(Object.keys(punto).sort(), ["donde", "id", "tipo", "x", "y"]);
});

/* ═══════════ LO QUE NO SE PUEDE MIRAR ═══════════ */

test("un lienzo de puro escenario no es una figura", () => {
  assert.equal(limpiarEscena({
    arquetipo: "lienzo", alto: 200,
    trazos: [
      { tipo: "eje", id: "x", hacia: "derecha", x: 20, y: 180, largo: 200, etiqueta: "X" },
      { tipo: "texto", id: "t", x: 180, y: 40, texto: "Un título" },
    ],
  }), null, "ejes y texto sueltos no cuentan nada");
});

test("menos de dos trazos no es un dibujo, y de más se recortan", () => {
  assert.equal(limpiarEscena({ arquetipo: "lienzo", trazos: [{ tipo: "punto", id: "a", x: 1, y: 1 }] }), null);
  const muchos = limpiarEscena({
    arquetipo: "lienzo", alto: 300,
    trazos: Array.from({ length: 40 }, (_, i) => ({ tipo: "punto", id: `p${i}`, x: i * 5, y: 50 })),
  });
  assert.equal(muchos.trazos.length, MAX_TRAZOS);
  assert.ok(MAX_TRAZOS > MIN_TRAZOS);
});

test("una curva con un solo punto se cae, y de doce en adelante se recorta", () => {
  const e = limpiarEscena({
    arquetipo: "lienzo", alto: 200,
    trazos: [
      { tipo: "curva", id: "mala", puntos: [[10, 10]] },
      { tipo: "curva", id: "larga", puntos: Array.from({ length: 30 }, (_, i) => [i * 5, 100]) },
      { tipo: "punto", id: "p", x: 50, y: 50 },
    ],
  });
  assert.ok(!e.trazos.some((t) => t.id === "mala"));
  assert.equal(e.trazos.find((t) => t.id === "larga").puntos.length, MAX_PUNTOS_CURVA);
});

test("dos trazos con el mismo id: se queda el primero, o los pasos no sabrían a cuál encienden", () => {
  const e = limpiarEscena({
    arquetipo: "lienzo", alto: 200,
    trazos: [
      { tipo: "punto", id: "eq", x: 10, y: 10 },
      { tipo: "punto", id: "eq", x: 99, y: 99 },
      { tipo: "curva", id: "c", puntos: [[1, 1], [50, 50]] },
    ],
  });
  assert.equal(e.trazos.filter((t) => t.id === "eq").length, 1);
  assert.equal(e.trazos.find((t) => t.id === "eq").x, 10);
});

/* ═══════════ EL ESCENARIO NO PIDE SU PASO ═══════════ */

test("los ejes y las guías no necesitan paso propio; las curvas y los puntos sí", () => {
  const e = limpiarEscena(PLANO);
  const { obligatorias } = piezasDe(e);
  assert.deepEqual(obligatorias.map((t) => t.id).sort(), ["da", "eq"]);

  /* Sin encender los ejes: pasa, porque son el escenario. */
  assert.ok(amarrarPasos([
    { texto: "Esta es la curva.", resaltar: ["da"] },
    { texto: "Aquí se cruzan.", resaltar: ["eq"] },
    { texto: "Y por eso cae.", resaltar: ["da"] },
  ], e));

  /* Sin encender la curva: no pasa, porque es el argumento. */
  assert.equal(amarrarPasos([
    { texto: "Uno", resaltar: ["ejex"] },
    { texto: "Dos", resaltar: ["ejey"] },
    { texto: "Tres", resaltar: ["eq"] },
  ], e), null);
});

test("un paso que enciende un id que no existe se cae, como en las otras figuras", () => {
  const e = limpiarEscena(PLANO);
  assert.equal(amarrarPasos([
    { texto: "Uno", resaltar: ["fantasma"] },
    { texto: "Dos", resaltar: ["da"] },
    { texto: "Tres", resaltar: ["eq"] },
  ], e), null, "quedan dos pasos buenos: menos de tres no es una capa 2");
});

test("el id se limpia igual que en el resto: sin tildes ni espacios", () => {
  assert.equal(limpiarId("Demanda Agregada"), "demandaagregada");
  const e = limpiarEscena({
    arquetipo: "lienzo", alto: 200,
    trazos: [
      { tipo: "punto", id: "Equilibrio Inicial", x: 10, y: 10 },
      { tipo: "curva", id: "c", puntos: [[1, 1], [50, 50]] },
    ],
  });
  assert.ok(e.trazos.some((t) => t.id === limpiarId("Equilibrio Inicial")));
});
