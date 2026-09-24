import { test } from "node:test";
import assert from "node:assert/strict";

import {
  inclinacionDe, gradosDe, nivelada, GRADOS_MAXIMOS, GRADOS_MINIMOS,
} from "../balanza.js";
import { CUADRA_O_NO, balanceDelAsiento } from "../../data/contabilidadActividades.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA BALANZA.
 *
 * Lo que defienden estas pruebas: que el ángulo diga la verdad. Una balanza
 * que se ve recta cuando el asiento no cuadra enseña exactamente lo contrario
 * de lo que el capítulo quiere enseñar, y no falla ninguna prueba de las otras
 * —el número del descuadre puede estar perfecto mientras el dibujo miente—.
 * ═══════════════════════════════════════════════════════════════════════════
 */

test("★ un asiento que cuadra deja la balanza recta, valga lo que valga", () => {
  for (const total of [1, 250, 10000, 1500000]) {
    assert.equal(inclinacionDe(total, total), 0, `con ${total}`);
    assert.equal(gradosDe(inclinacionDe(total, total)), 0, `con ${total}`);
    assert.ok(nivelada(inclinacionDe(total, total)), `con ${total}`);
  }
});

test("★ el lado que pesa más es el que baja", () => {
  assert.ok(inclinacionDe(1000, 400) > 0, "pesa el debe: inclinación positiva");
  assert.ok(inclinacionDe(400, 1000) < 0, "pesa el haber: inclinación negativa");
  assert.equal(gradosDe(inclinacionDe(1000, 0)), GRADOS_MAXIMOS, "un lado vacío la tuerce del todo");
  assert.equal(gradosDe(inclinacionDe(0, 1000)), -GRADOS_MAXIMOS);
});

test("★ el ángulo es PROPORCIONAL, no absoluto", () => {
  /*
   * La razón de que exista este archivo. Cincuenta pesos de descuadre en un
   * asiento de doscientos cincuenta es enorme; los mismos cincuenta en uno de
   * un millón y medio es una mota. Si el ángulo saliera de los pesos, el
   * primero se vería recto y el segundo se saldría de la pantalla.
   */
  const pequeño = inclinacionDe(250, 200);
  const grande = inclinacionDe(1500000, 1499950);
  assert.ok(pequeño > grande * 100, "el descuadre grande en proporción tiene que inclinar mucho más");
  assert.ok(Math.abs(gradosDe(pequeño)) <= GRADOS_MAXIMOS, "y aun así nunca se pasa del tope");
});

test("★ un descuadre diminuto SE VE: nunca se confunde con estar recta", () => {
  /*
   * Sin piso, un peso de diferencia en un asiento grande daría una décima de
   * grado —indistinguible de recta— y el estudiante leería «cuadra» en una
   * balanza que no cuadra. Esa es la mentira que este piso impide.
   */
  const casi = inclinacionDe(1500000, 1499999);
  assert.notEqual(casi, 0, "un peso de diferencia no es cuadrar");
  assert.ok(!nivelada(casi), "se ve torcida");
  assert.ok(Math.abs(gradosDe(casi)) >= GRADOS_MINIMOS, `solo se inclinó ${gradosDe(casi)}°`);
});

test("el giro nunca se pasa del tope, pida lo que pida", () => {
  for (const inclinacion of [2, -2, 1e6, -1e6]) {
    assert.ok(Math.abs(gradosDe(inclinacion)) <= GRADOS_MAXIMOS, `con ${inclinacion}`);
  }
  assert.equal(gradosDe(2), GRADOS_MAXIMOS);
  assert.equal(gradosDe(-2), -GRADOS_MAXIMOS);
});

test("★ un asiento sin empezar no está cuadrado: está sin empezar", () => {
  /*
   * Las actividades que CONSTRUYEN un asiento arrancan con los dos lados en
   * cero. Numéricamente eso «cuadra», y dibujarlo recto le diría al estudiante
   * que ya terminó antes de poner nada. Por eso pueden pedir que el vacío
   * incline.
   */
  assert.equal(inclinacionDe(0, 0), 0, "por defecto, vacío es recto");
  assert.equal(inclinacionDe(0, 0, { vacia: -1 }), -1, "quien construye pide que incline");
  assert.equal(Math.abs(gradosDe(inclinacionDe(0, 0, { vacia: -1 }))), GRADOS_MAXIMOS);
});

test("valores raros no rompen el giro", () => {
  assert.equal(gradosDe(null), 0);
  assert.equal(gradosDe(undefined), 0);
  assert.equal(gradosDe(0), 0);
});

test("★ los diez asientos de ¿Cuadra o No Cuadra? inclinan según su veredicto", () => {
  /*
   * La prueba que ata la balanza al contenido real: los cinco que cuadran
   * tienen que verse rectos y los cinco que no, torcidos. Si alguna vez el
   * dibujo y el veredicto se separaran, el estudiante vería una balanza que
   * contradice a la devolución escrita.
   */
  let rectas = 0;
  for (const a of CUADRA_O_NO.asientos) {
    const b = balanceDelAsiento(a);
    const i = inclinacionDe(b.debe, b.haber);
    assert.equal(nivelada(i), b.cuadra, `${a.id}: la balanza contradice al veredicto`);
    if (b.cuadra) rectas += 1;
  }
  assert.equal(rectas, 5, "cinco cuadran y cinco no");
});
