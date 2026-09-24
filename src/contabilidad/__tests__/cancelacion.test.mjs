import { test } from "node:test";
import assert from "node:assert/strict";

import {
  cancelacion, repartir, totalDe, alturaDe, referenciaDe, ALTO_COLUMNA,
} from "../cancelacion.js";
import { DEBE, HABER, saldoDe, mayorConSaldos, LAVADO_DE_AUTOS, CALEJA } from "../../data/contabilidad.js";
import { CAJA_DEL_CAPITULO } from "../../data/contabilidadActividades.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CANCELACIÓN POR VALOR.
 *
 * La regla que estas pruebas defienden, y la única que importa: SE CANCELA
 * CANTIDAD, NO FICHAS. Un cálculo por pares de unidades da números plausibles
 * —a veces incluso el correcto— y solo se cae cuando los montos son distintos,
 * que es casi siempre. Por eso cada prueba usa montos que lo separan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fichas = (...valores) => valores.map((valor) => ({ valor }));

/* ─────────────────── lo que no puede ser un conteo de fichas ─────────────────── */

test("★ el saldo sale de restar cantidades, no de emparejar fichas", () => {
  /*
   * El caso del capítulo: 1.000 y 500 a la izquierda contra 150 a la derecha.
   * Emparejando ficha con ficha se iría una de cada lado y quedaría 500 o
   * 1.500 según cuál se empareje. Las dos son falsas: el saldo es 1.350.
   */
  const c = cancelacion(fichas(1000, 500), fichas(150));
  assert.equal(c.saldo, 1350);
  assert.equal(c.lado, DEBE);
  assert.equal(c.cancelado, 150);
  /* Y ninguna de las dos respuestas del conteo por pares aparece por ningún lado. */
  assert.notEqual(c.saldo, 500);
  assert.notEqual(c.saldo, 1500);
});

test("★ la ficha grande queda comida A MEDIAS, que es lo que enseña la imagen", () => {
  /*
   * Tres fichas de un lado y una del otro con un monto que no encaja redondo.
   * Un reparto por unidades dejaría fichas enteras o vacías; el reparto por
   * cantidad muerde la que le toca.
   */
  const c = cancelacion(fichas(1000, 500), fichas(150));
  /* De abajo hacia arriba: la de 1.000 recibe los 150 y queda al 15 %. */
  assert.deepEqual(c.debe.map((f) => f.consumido), [0.15, 0]);
  /* La columna menor se va entera. */
  assert.deepEqual(c.haber.map((f) => f.consumido), [1]);
});

test("★ el reparto se come las fichas de abajo hacia arriba, y solo lo que alcanza", () => {
  const r = repartir(fichas(100, 100, 100), 250);
  assert.deepEqual(r.map((f) => f.consumido), [1, 1, 0.5]);
  /* Sin nada que consumir, nada se toca. */
  assert.deepEqual(repartir(fichas(100, 100), 0).map((f) => f.consumido), [0, 0]);
  /* Y de más no se come lo que no hay. */
  assert.deepEqual(repartir(fichas(100), 999).map((f) => f.consumido), [1]);
});

test("una ficha en cero no se cuenta ni rompe la división", () => {
  const r = repartir([{ valor: 0 }, { valor: 200 }], 100);
  assert.deepEqual(r.map((f) => f.consumido), [0, 0.5]);
  assert.equal(totalDe([{ valor: 0 }, { valor: 200 }]), 200);
});

test("★ un consumo negativo no agranda las fichas", () => {
  /*
   * `cancelacion` nunca pide consumir un número negativo, pero `repartir` está
   * exportada y la usa el dibujo. Sin la guarda, un negativo daría un
   * `consumido` negativo y la ficha se dibujaría MÁS ALTA de lo que vale: una
   * cancelación que agranda, que es lo contrario de lo que la palabra dice.
   */
  for (const negativo of [-1, -500, -1e9]) {
    const r = repartir(fichas(100, 200), negativo);
    assert.deepEqual(r.map((f) => f.consumido), [0, 0], `con ${negativo}`);
    for (const f of r) assert.ok(f.consumido >= 0 && f.consumido <= 1, `con ${negativo}`);
  }
});

/* ─────────────────── contra la verdad del capítulo ─────────────────── */

test("★ la cancelación da EXACTAMENTE el mismo saldo que el núcleo del tema", () => {
  /*
   * Es la prueba que impide que el dibujo y la contabilidad se separen: el
   * saldo que se ve cancelar tiene que ser el mismo que calcula `saldoDe`,
   * que es el que usan las actividades y el que compara el libro.
   */
  const cuentas = [
    ...mayorConSaldos(LAVADO_DE_AUTOS.transacciones),
    ...mayorConSaldos(CALEJA.transacciones),
    { ...CAJA_DEL_CAPITULO, ...saldoDe(CAJA_DEL_CAPITULO) },
  ];
  assert.ok(cuentas.length >= 18, "se quedó sin cuentas que comprobar");
  for (const c of cuentas) {
    const esperado = saldoDe(c);
    const vista = cancelacion(c.debitos, c.creditos);
    assert.equal(vista.saldo, esperado.saldo, `${c.cuenta}: saldo`);
    assert.equal(vista.lado, esperado.lado, `${c.cuenta}: lado`);
    assert.equal(vista.totalDebe, esperado.debito, `${c.cuenta}: movimiento débito`);
    assert.equal(vista.totalHaber, esperado.credito, `${c.cuenta}: movimiento crédito`);
  }
});

test("★ lo que queda en pie mide lo que dice el saldo", () => {
  /*
   * La comprobación visual hecha aritmética: sumar lo NO consumido de las dos
   * columnas tiene que dar el saldo. Si el reparto se equivocara, esto se cae
   * aunque el número del saldo salga bien por otro camino.
   */
  for (const c of mayorConSaldos(LAVADO_DE_AUTOS.transacciones)) {
    const v = cancelacion(c.debitos, c.creditos);
    const enPie = [...v.debe, ...v.haber].reduce((s, f) => s + f.valor * (1 - f.consumido), 0);
    assert.ok(Math.abs(enPie - v.saldo) < 1e-6, `${c.cuenta}: en pie ${enPie}, saldo ${v.saldo}`);
  }
});

test("una cuenta con un solo movimiento no cancela nada y su saldo es ese movimiento", () => {
  /*
   * Lo dice el desafío: una cuenta sin movimiento contrario tiene saldo igual
   * a su único movimiento. Aquí el `cancelado` es cero y nada se consume.
   */
  const c = cancelacion(fichas(4000), []);
  assert.equal(c.cancelado, 0);
  assert.equal(c.saldo, 4000);
  assert.equal(c.lado, DEBE);
  assert.deepEqual(c.debe.map((f) => f.consumido), [0]);
});

test("cuando los dos lados empatan no queda nada en pie y el saldo no tiene lado", () => {
  const c = cancelacion(fichas(300, 200), fichas(500));
  assert.equal(c.saldo, 0);
  assert.equal(c.lado, null, "un saldo cero no va a ningún lado");
  assert.deepEqual(c.debe.map((f) => f.consumido), [1, 1]);
  assert.deepEqual(c.haber.map((f) => f.consumido), [1]);
});

test("el saldo puede quedar del haber, y entonces es el debe el que se consume entero", () => {
  const c = cancelacion(fichas(3750), fichas(2000, 2500, 3000));
  assert.equal(c.lado, HABER);
  assert.equal(c.saldo, 3750);
  assert.deepEqual(c.debe.map((f) => f.consumido), [1]);
  /* 3.750 se comen los 2.000 de abajo y 1.750 de los 2.500 siguientes: el 70 %. */
  assert.deepEqual(c.haber.map((f) => f.consumido), [1, 0.7, 0]);
});

/* ─────────────────── la altura, que es lo que se ve ─────────────────── */

test("★ las dos columnas se miden contra la MISMA referencia", () => {
  /*
   * Si cada columna se midiera contra su propio total, las dos llegarían
   * arriba del todo y la diferencia —lo único que hay que ver— desaparecería
   * del dibujo.
   */
  const debe = fichas(1000, 500);
  const haber = fichas(150);
  const ref = referenciaDe(debe, haber);
  assert.equal(ref, 1500, "la referencia es el mayor de los dos totales");
  assert.equal(alturaDe(1500, ref), ALTO_COLUMNA, "la columna mayor llena el alto");
  assert.ok(alturaDe(150, ref) < ALTO_COLUMNA / 5, "la menor se ve claramente más corta");
  /* Y la proporción se conserva: 150 contra 1.500 es la décima parte. */
  assert.ok(Math.abs(alturaDe(150, ref) - ALTO_COLUMNA / 10) < 1e-6);

  /*
   * Y AL REVÉS, que es lo que de verdad lo prueba: cuando la columna mayor es
   * la del haber, la referencia tiene que seguir siendo esa. Midiendo solo el
   * debe, la del haber se saldría por arriba de la caja.
   */
  const pocoDebe = fichas(200);
  const muchoHaber = fichas(3000, 1000);
  assert.equal(referenciaDe(pocoDebe, muchoHaber), 4000, "la referencia ignoró el haber");
  assert.equal(alturaDe(4000, referenciaDe(pocoDebe, muchoHaber)), ALTO_COLUMNA);
  assert.ok(alturaDe(200, referenciaDe(pocoDebe, muchoHaber)) < ALTO_COLUMNA / 10);
});

test("la altura es proporcional al monto y no al número de fichas", () => {
  const ref = 1000;
  /* Una ficha de 800 mide el cuádruple que cuatro fichas de 50 juntas. */
  assert.equal(alturaDe(800, ref), alturaDe(200, ref) * 4);
  /* Y sin referencia no se divide por cero: no se dibuja nada. */
  assert.equal(alturaDe(100, 0), 0);
  assert.equal(referenciaDe([], []), 0);
});
