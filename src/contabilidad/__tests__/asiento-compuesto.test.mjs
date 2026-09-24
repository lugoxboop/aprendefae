import { test } from "node:test";
import assert from "node:assert/strict";

import {
  transaccionDe, paletaDe, evaluar, UNIVERSO, CUANTAS_EN_PALETA, MAXIMO_FILAS,
} from "../../components/mecanicas/libros/ElAsientoCompuesto.jsx";
import { filaVacia } from "../../components/mecanicas/libros/ConstructorAsiento.jsx";
import { ASIENTO_COMPUESTO } from "../../data/contabilidadActividades.js";
import { DEBE, HABER, pesos } from "../../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-10 · EL ASIENTO COMPUESTO.
 *
 * El puntaje ya no es «cuántas acertó»: es una mezcla ponderada de cuentas,
 * lados y cifras. Lo que se enumera aquí son las formas de perder cada uno de
 * los tres pesos por separado, porque son independientes y un error de
 * ponderación no se nota jugando —da un número plausible y equivocado—.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const tal_cual = (xs) => [...xs];

const lineasDe = (asiento) => [
  ...asiento.debe.map(([cuenta, valor]) => ({ cuenta, lado: DEBE, valor })),
  ...asiento.haber.map(([cuenta, valor]) => ({ cuenta, lado: HABER, valor })),
];

const ITEMS = ASIENTO_COMPUESTO.items.map((item) => ({ item, transaccion: transaccionDe(item) }));

const filasDe = (lineas) => lineas.map((l) => ({
  ...filaVacia(), cuenta: l.cuenta, lado: l.lado, valor: String(l.valor),
}));

const perfecta = (transaccion) => filasDe(lineasDe(transaccion.asiento));

const cerca = (a, b, donde) =>
  assert.ok(Math.abs(a - b) < 1e-9, `${donde}: ${a} no es ${b}`);

/* ─────────────────────── los datos de la actividad ─────────────────────── */

test("las cinco transacciones existen y TODAS son compuestas", () => {
  assert.equal(ITEMS.length, 5);
  for (const { item, transaccion } of ITEMS) {
    assert.ok(transaccion, `${item.id}: no existe`);
    assert.ok(lineasDe(transaccion.asiento).length > 2, `${item.id}: solo toca dos cuentas`);
  }
});

test("★ el tope de filas sale de los datos y son cuatro", () => {
  /* El cuatro va escrito: comparar contra la constante sería circular. */
  assert.equal(MAXIMO_FILAS, 4);
  for (const { item, transaccion } of ITEMS) {
    assert.ok(lineasDe(transaccion.asiento).length <= MAXIMO_FILAS,
      `${item.id}: no cabe en el tope de filas`);
  }
});

test("★ la paleta ofrece las cuentas correctas y son ocho sin repetir", () => {
  assert.equal(CUANTAS_EN_PALETA, 8);
  for (const { item, transaccion } of ITEMS) {
    const paleta = paletaDe(transaccion, tal_cual);
    assert.equal(paleta.length, 8, item.id);
    assert.equal(new Set(paleta).size, paleta.length, `${item.id}: repetidas`);
    for (const l of lineasDe(transaccion.asiento)) {
      assert.ok(paleta.includes(l.cuenta), `${item.id}: falta «${l.cuenta}»`);
    }
    /* Y quedan señuelos de verdad: sin ellos se acierta por descarte. */
    const senuelos = paleta.filter((c) => !lineasDe(transaccion.asiento).some((l) => l.cuenta === c));
    assert.ok(senuelos.length >= 4, `${item.id}: solo ${senuelos.length} señuelos`);
  }
});

test("los señuelos son cuentas del capítulo, no traídas de fuera", () => {
  const delCapitulo = new Set(ITEMS.flatMap(({ transaccion }) =>
    lineasDe(transaccion.asiento).map((l) => l.cuenta)));
  /* El universo junta estas con las de Arma el Asiento; comprobamos que no hay nada más. */
  assert.ok(UNIVERSO.length >= CUANTAS_EN_PALETA, "no hay cuentas para llenar una paleta");
  for (const { transaccion } of ITEMS) {
    for (const l of lineasDe(transaccion.asiento)) assert.ok(delCapitulo.has(l.cuenta));
  }
});

/* ─────────────────────────── el puntaje ─────────────────────────── */

test("★ la respuesta perfecta vale uno, en las cinco", () => {
  for (const { item, transaccion } of ITEMS) {
    const r = evaluar(item, transaccion, perfecta(transaccion));
    cerca(r.puntaje, 1, item.id);
    assert.ok(r.perfecto, item.id);
    assert.ok(r.cuadra, item.id);
    assert.ok(r.texto.startsWith("✅"), `${item.id}: el acierto no se ve como acierto`);
    assert.ok(!/\{[a-zA-Z]+\}/.test(r.texto), `${item.id}: hueco sin rellenar — ${r.texto}`);
    /* El acierto dice el total de verdad de ESA transacción, dos veces. */
    const total = transaccion.asiento.debe.reduce((s, [, v]) => s + v, 0);
    assert.equal(r.texto.split(pesos(total)).length - 1, 2, `${item.id}: no dice el total dos veces`);
  }
});

test("★ los tres pesos se pierden por separado: cuentas, lados y cifras", () => {
  /*
   * La prueba que sostiene la ponderación de la ficha. Si los tres se mezclaran
   * —o si un peso se aplicara al otro— el puntaje seguiría dando un número
   * plausible y nadie lo notaría jugando.
   */
  const { peso } = ASIENTO_COMPUESTO;
  assert.deepEqual(peso, { cuentas: 0.5, lados: 0.25, cifras: 0.25 });

  const { item, transaccion } = ITEMS.find((x) => x.item.id === "cu10-02");
  const real = lineasDe(transaccion.asiento);

  /* Cuentas y lados bien, todas las cifras mal: se pierde solo el peso de cifras. */
  const sinCifras = filasDe(real.map((l) => ({ ...l, valor: l.valor + 1 })));
  cerca(evaluar(item, transaccion, sinCifras).puntaje, peso.cuentas + peso.lados, "solo cifras mal");

  /* Cuentas bien y todos los lados al revés: se pierden lados y cifras. */
  const alReves = filasDe(real.map((l) => ({ ...l, lado: l.lado === DEBE ? HABER : DEBE })));
  cerca(evaluar(item, transaccion, alReves).puntaje, peso.cuentas, "lados al revés");

  /* Ninguna cuenta de las buenas: cero. */
  const otras = filasDe([
    { cuenta: "Maquinaria", lado: DEBE, valor: 1 },
    { cuenta: "Local comercial", lado: HABER, valor: 1 },
  ]);
  cerca(evaluar(item, transaccion, otras).puntaje, 0, "ninguna cuenta buena");
});

test("★ acertar las cuentas vale más que acertar los lados y las cifras juntos", () => {
  /* Es la decisión pedagógica de la ficha, y una prueba la sostiene. */
  const { peso } = ASIENTO_COMPUESTO;
  assert.ok(peso.cuentas > peso.lados + peso.cifras - 1e-9);
  assert.equal(peso.cuentas + peso.lados + peso.cifras, 1);
});

test("una cuenta puesta del lado correcto pero con otra cifra no cuenta como cifra", () => {
  const { item, transaccion } = ITEMS.find((x) => x.item.id === "cu10-03");
  const real = lineasDe(transaccion.asiento);
  const unaCifraMal = filasDe(real.map((l, k) => (k === 0 ? { ...l, valor: l.valor + 5 } : l)));
  const r = evaluar(item, transaccion, unaCifraMal);
  assert.ok(!r.perfecto);
  cerca(r.puntaje, ASIENTO_COMPUESTO.peso.cuentas + ASIENTO_COMPUESTO.peso.lados
    + ASIENTO_COMPUESTO.peso.cifras * ((real.length - 1) / real.length), "una cifra mal");
});

/* ─────────────────────── las explicaciones ─────────────────────── */

test("★ sin error de concepto que señalar, el que no cuadra recibe la aritmética con sus totales", () => {
  const { item, transaccion } = ITEMS.find((x) => x.item.id === "cu10-02");
  const real = lineasDe(transaccion.asiento);
  const descuadrado = filasDe(real.map((l, k) => (k === 0 ? { ...l, valor: l.valor + 100 } : l)));
  const r = evaluar(item, transaccion, descuadrado);
  assert.ok(!r.cuadra);
  assert.match(r.texto, /^❌ No cuadra/);
  assert.ok(r.texto.includes(pesos(r.totalDebe)), "no dice el total del debe");
  assert.ok(r.texto.includes(pesos(r.totalHaber)), "no dice el total del haber");
  assert.ok(!/\{[a-zA-Z]+\}/.test(r.texto), r.texto);
});

test("★ la hipoteca al debe recibe SU explicación, aunque eso descuadre el asiento", () => {
  /*
   * El caso que fija el orden de las explicaciones. Poner un pasivo que nace en
   * el debe descuadra el asiento por fuerza, así que si la aritmética fuera
   * primero, esta explicación no la leería nadie nunca: el estudiante se iría a
   * revisar sumas cuando lo que tiene mal es dónde nace un pasivo.
   */
  const { item, transaccion } = ITEMS.find((x) => x.item.id === "cu10-01");
  const real = lineasDe(transaccion.asiento);
  const filas = filasDe(real.map((l) => (l.cuenta === "Hipoteca por pagar" ? { ...l, lado: DEBE } : l)));
  const r = evaluar(item, transaccion, filas);
  assert.ok(!r.cuadra, "si cuadrara, esta prueba no probaría el orden");
  assert.equal(r.texto, ASIENTO_COMPUESTO.erroresPorCaso["cu10-01"].hipotecaAlDebe);
});

test("★ unir edificio y terreno recibe SU explicación, aunque el asiento cuadre", () => {
  const { item, transaccion } = ITEMS.find((x) => x.item.id === "cu10-01");
  const real = lineasDe(transaccion.asiento);
  const debe = real.filter((l) => l.lado === DEBE);
  const total = debe.reduce((s, l) => s + l.valor, 0);
  /* Todo el valor en una sola cuenta del debe: cuadra, y está mal. */
  const filas = filasDe([
    { ...debe[0], valor: total },
    ...real.filter((l) => l.lado === HABER),
  ]);
  const r = evaluar(item, transaccion, filas);
  assert.ok(r.cuadra, "la prueba no vale si el asiento no cuadra");
  assert.equal(r.texto, ASIENTO_COMPUESTO.erroresPorCaso["cu10-01"].unioEdificioYTerreno);
});

test("★ separar edificio y terreno con el reparto cambiado también lo recibe", () => {
  /*
   * El caso fino: las dos cuentas del debe están puestas, cada una por
   * separado, del lado bueno, y el asiento cuadra — pero con los valores
   * intercambiados. El enunciado da el valor del terreno a propósito, así que
   * eso sigue siendo unir las dos en la cabeza aunque se escriban en dos filas.
   */
  const { item, transaccion } = ITEMS.find((x) => x.item.id === "cu10-01");
  const real = lineasDe(transaccion.asiento);
  const debe = real.filter((l) => l.lado === DEBE);
  assert.equal(debe.length, 2);
  assert.notEqual(debe[0].valor, debe[1].valor, "si fueran iguales, intercambiarlas no cambiaría nada");
  const filas = filasDe([
    { ...debe[0], valor: debe[1].valor },
    { ...debe[1], valor: debe[0].valor },
    ...real.filter((l) => l.lado === HABER),
  ]);
  const r = evaluar(item, transaccion, filas);
  assert.ok(r.cuadra, "la prueba no vale si el asiento no cuadra");
  assert.equal(r.texto, ASIENTO_COMPUESTO.erroresPorCaso["cu10-01"].unioEdificioYTerreno);
});

test("★ el asiento correcto MÁS una cuenta de sobra no es perfecto", () => {
  /*
   * Añadir una cuenta que no se mueve, con valor cero, deja las cifras buenas
   * intactas y el asiento cuadrando. Si «perfecto» solo contara las cifras
   * acertadas, esto pasaría por respuesta impecable — y un asiento con una
   * cuenta que no pinta nada no es un asiento correcto.
   */
  const { item, transaccion } = ITEMS.find((x) => x.item.id === "cu10-01");
  const real = lineasDe(transaccion.asiento);
  const deSobra = filasDe([...real, { cuenta: "Maquinaria", lado: DEBE, valor: 0 }]);
  const r = evaluar(item, transaccion, deSobra);
  assert.ok(r.cuadra, "la de sobra va en cero para que siga cuadrando");
  assert.ok(!r.perfecto, "una cuenta que no se mueve no puede colarse en un asiento perfecto");
  assert.ok(r.texto !== ASIENTO_COMPUESTO.acierto, "no puede recibir el texto de acierto");
});

test("★ partir el 50 % en mitades desiguales recibe SU explicación", () => {
  const { item, transaccion } = ITEMS.find((x) => x.item.id === "cu10-04");
  const real = lineasDe(transaccion.asiento);
  const haber = real.filter((l) => l.lado === HABER);
  assert.equal(haber.length, 2);
  /* Se mueven 50.000 de una mitad a la otra: sigue cuadrando. */
  const filas = filasDe([
    ...real.filter((l) => l.lado === DEBE),
    { ...haber[0], valor: haber[0].valor - 50000 },
    { ...haber[1], valor: haber[1].valor + 50000 },
  ]);
  const r = evaluar(item, transaccion, filas);
  assert.ok(r.cuadra);
  assert.equal(r.texto, ASIENTO_COMPUESTO.erroresPorCaso["cu10-04"].mitadMal);
});

test("★ olvidar uno de los dos activos aportados recibe SU explicación", () => {
  const { item, transaccion } = ITEMS.find((x) => x.item.id === "cu10-05");
  const real = lineasDe(transaccion.asiento);
  const debe = real.filter((l) => l.lado === DEBE);
  const haber = real.filter((l) => l.lado === HABER);
  assert.equal(debe.length, 2);
  /* Una sola cuenta al debe, por el total: cuadra y falta un activo. */
  const filas = filasDe([{ ...debe[0], valor: haber[0].valor }, ...haber]);
  const r = evaluar(item, transaccion, filas);
  assert.ok(r.cuadra);
  assert.equal(r.texto, ASIENTO_COMPUESTO.erroresPorCaso["cu10-05"].olvidoUnActivo);
});

test("★ PENDIENTE DE GEN: repartir mal dos cifras del mismo lado se queda sin texto", () => {
  /*
   * Esta prueba NO dice que esté bien. Deja constancia del hueco: en las dos
   * transacciones sin explicación propia, intercambiar las dos cifras del haber
   * da un asiento que cuadra, con todas las cuentas y todos los lados bien, y
   * la ficha no tiene nada escrito para eso. El estudiante ve su fila en coral
   * y el asiento correcto al lado, y ni una palabra.
   *
   * Cuando Gen entregue el texto, esta prueba tiene que fallar: es la señal de
   * que el hueco se tapó.
   */
  const sinTexto = [];
  for (const { item, transaccion } of ITEMS) {
    const real = lineasDe(transaccion.asiento);
    const haber = real.filter((l) => l.lado === HABER);
    if (haber.length !== 2 || haber[0].valor === haber[1].valor) continue;
    const filas = filasDe([
      ...real.filter((l) => l.lado === DEBE),
      { ...haber[0], valor: haber[1].valor },
      { ...haber[1], valor: haber[0].valor },
    ]);
    const r = evaluar(item, transaccion, filas);
    assert.ok(r.cuadra, `${item.id}: la prueba no vale si no cuadra`);
    if (r.texto === null) sinTexto.push(item.id);
  }
  assert.deepEqual(sinTexto, ["cu10-01", "cu10-02", "cu10-03"],
    "cambió el conjunto de transacciones sin explicación para este error");
});

test("el asiento correcto que se enseña es el de la transacción, no uno armado", () => {
  for (const { item, transaccion } of ITEMS) {
    const r = evaluar(item, transaccion, [filaVacia(), filaVacia()]);
    assert.deepEqual(r.real, lineasDe(transaccion.asiento), item.id);
  }
});
