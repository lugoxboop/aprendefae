import { test } from "node:test";
import assert from "node:assert/strict";

import {
  transaccionDe, paletaDe, evaluar, UNIVERSO, CUANTAS_EN_PALETA, ACIERTO,
} from "../../components/mecanicas/libros/ArmaElAsiento.jsx";
import { asientoDe, filaVacia } from "../../components/mecanicas/libros/ConstructorAsiento.jsx";
import { ARMA_EL_ASIENTO } from "../../data/contabilidadActividades.js";
import { DEBE, HABER } from "../../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CU-6 · ARMA EL ASIENTO.
 *
 * Aquí el estudiante no elige entre respuestas: construye una. El espacio de
 * respuestas posibles es enorme —seis cuentas, dos ranuras, dos lados— así que
 * lo que se enumera son las CLASES de respuesta, que son cinco y contables:
 * perfecta, lados al revés, una cuenta ajena, la confusión Caja/Bancos, y las
 * dos transacciones con explicación propia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Sin barajar: en las pruebas el orden tiene que ser el mismo cada vez. */
const tal_cual = (xs) => [...xs];

const ladosDe = (transaccion) => new Map([
  ...transaccion.asiento.debe.map(([c]) => [c, DEBE]),
  ...transaccion.asiento.haber.map(([c]) => [c, HABER]),
]);

const filasDe = (pares) => pares.map(([cuenta, lado]) => ({ ...filaVacia(), cuenta, lado }));

const respuestaPerfecta = (transaccion) => filasDe([...ladosDe(transaccion)]);

const alReves = (transaccion) =>
  filasDe([...ladosDe(transaccion)].map(([c, l]) => [c, l === DEBE ? HABER : DEBE]));

const ITEMS = ARMA_EL_ASIENTO.items.map((item) => ({ item, transaccion: transaccionDe(item) }));

const sinHuecos = (texto, donde) => {
  assert.ok(typeof texto === "string" && texto.length > 3, `${donde}: sin texto`);
  assert.ok(!/\{[a-zA-Z]+\}/.test(texto), `${donde}: quedó un hueco sin rellenar — ${texto}`);
  assert.ok(texto.startsWith("✅") || texto.startsWith("❌"), `${donde}: ni acierto ni error — ${texto}`);
};

/* ─────────────────────────── la paleta ─────────────────────────── */

test("el universo de señuelos son cuentas de este mismo banco, no traídas de fuera", () => {
  assert.ok(UNIVERSO.length >= 6, "no hay cuentas suficientes para llenar una paleta");
  const delBanco = new Set(ITEMS.flatMap(({ transaccion }) =>
    [...transaccion.asiento.debe, ...transaccion.asiento.haber].map(([c]) => c)));
  for (const c of UNIVERSO) assert.ok(delBanco.has(c), `«${c}» no se mueve en ninguna transacción del banco`);
});

test("★ toda paleta ofrece las dos cuentas correctas, y son seis sin repetir", () => {
  /*
   * El seis va escrito. Comparar contra CUANTAS_EN_PALETA sería medir la
   * constante contra sí misma: bajarla a cuatro pasaría en verde y el
   * estudiante se quedaría con dos señuelos donde la ficha pide margen.
   */
  assert.equal(CUANTAS_EN_PALETA, 6);
  for (const { item, transaccion } of ITEMS) {
    const paleta = paletaDe(transaccion, tal_cual);
    assert.equal(paleta.length, 6, item.id);
    assert.equal(new Set(paleta).size, paleta.length, `${item.id}: cuentas repetidas en la paleta`);
    for (const [cuenta] of ladosDe(transaccion)) {
      assert.ok(paleta.includes(cuenta), `${item.id}: falta la cuenta correcta «${cuenta}»`);
    }
  }
});

test("★ donde se mueve Caja o Bancos, la paleta ofrece las dos", () => {
  /*
   * Sin esto, la explicación que Gen escribió para esa confusión no la puede
   * leer nadie: el error sería imposible de cometer.
   */
  let comprobadas = 0;
  for (const { item, transaccion } of ITEMS) {
    const cuentas = [...ladosDe(transaccion).keys()];
    if (!cuentas.includes("Caja") && !cuentas.includes("Bancos")) continue;
    const paleta = paletaDe(transaccion, tal_cual);
    assert.ok(paleta.includes("Caja"), `${item.id}: falta Caja`);
    assert.ok(paleta.includes("Bancos"), `${item.id}: falta Bancos`);
    comprobadas += 1;
  }
  assert.ok(comprobadas >= 5, `solo ${comprobadas} transacciones mueven Caja o Bancos`);
});

/* ─────────────────────── las clases de respuesta ─────────────────────── */

test("★ la respuesta perfecta vale las cuatro decisiones, en las doce", () => {
  /*
   * El cuatro y el ✅ van escritos, no tomados de las constantes: medir una
   * constante contra sí misma daría verde aunque el acierto dejara de verse
   * como acierto o las decisiones por ítem cambiaran sin querer.
   */
  assert.equal(ARMA_EL_ASIENTO.decisionesPorItem, 4);
  assert.ok(ACIERTO.startsWith("✅"), "el acierto no se ve como acierto");
  for (const { item, transaccion } of ITEMS) {
    const r = evaluar(item, transaccion, respuestaPerfecta(transaccion));
    assert.equal(r.aciertos, 4, item.id);
    assert.ok(r.perfecto, item.id);
    sinHuecos(r.texto, `${item.id} · perfecta`);
    assert.equal(r.texto, ACIERTO, item.id);
  }
});

test("★ NINGUNA clase de error se queda sin devolución, en las doce", () => {
  let caminos = 0;
  for (const { item, transaccion } of ITEMS) {
    const lados = ladosDe(transaccion);
    const paleta = paletaDe(transaccion, tal_cual);
    const ajenas = paleta.filter((c) => !lados.has(c));
    assert.ok(ajenas.length > 0, `${item.id}: la paleta no ofrece ni una cuenta equivocada`);

    const respuestas = [
      ["lados al revés", alReves(transaccion)],
      ["los dos al debe", filasDe([...lados].map(([c]) => [c, DEBE]))],
      ["los dos al haber", filasDe([...lados].map(([c]) => [c, HABER]))],
      /* Una correcta y una ajena, en los dos órdenes de lado. */
      ...ajenas.map((ajena) => [
        `cuenta ajena «${ajena}»`,
        filasDe([[[...lados][0][0], [...lados][0][1]], [ajena, HABER]]),
      ]),
    ];

    for (const [que, filas] of respuestas) {
      const r = evaluar(item, transaccion, filas);
      sinHuecos(r.texto, `${item.id} · ${que}`);
      assert.ok(!r.perfecto, `${item.id} · ${que}: se dio por perfecta`);
      assert.ok(r.aciertos < ARMA_EL_ASIENTO.decisionesPorItem, `${item.id} · ${que}: puntuó como perfecta`);
      caminos += 1;
    }
  }
  assert.ok(caminos >= 60, `solo se probaron ${caminos} caminos`);
});

test("★ las dos transacciones con explicación propia la reciben siempre", () => {
  /*
   * Son las dos donde el error típico es de concepto y no de descuido, y Gen
   * escribió el concepto. Mandan sobre cualquier otra explicación.
   */
  const casos = [
    ["ene-26", ARMA_EL_ASIENTO.errores.consignar, /Consignar no es un ingreso ni un gasto/],
    ["cal-6", ARMA_EL_ASIENTO.errores.devolucionAportes, /Devolver un aporte disminuye el patrimonio/],
  ];
  for (const [id, esperado, forma] of casos) {
    const encontrado = ITEMS.find(({ transaccion }) => transaccion.id === id);
    assert.ok(encontrado, `${id}: no está en el banco de CU-6`);
    assert.match(esperado, forma);
    const r = evaluar(encontrado.item, encontrado.transaccion, alReves(encontrado.transaccion));
    assert.equal(r.texto, esperado, id);
  }
});

test("★ confundir Caja con Bancos recibe SU explicación, no la genérica", () => {
  /* ene-18: se cancela con cheque — es Bancos, y Caja es la trampa. */
  const { item, transaccion } = ITEMS.find((x) => x.transaccion.id === "ene-18");
  const lados = ladosDe(transaccion);
  assert.ok(lados.has("Bancos") && !lados.has("Caja"), "ene-18 dejó de ser el caso de la trampa");
  const filas = filasDe([["Cuentas por pagar", DEBE], ["Caja", HABER]]);
  const r = evaluar(item, transaccion, filas);
  assert.equal(r.texto, ARMA_EL_ASIENTO.errores.cajaPorBancos);
});

test("★ en la devolución de aporte, Bancos por Caja gana a la explicación propia", () => {
  /*
   * El caso que fija el orden de las explicaciones. La sexta de Caleja devuelve
   * el aporte «en efectivo» —o sea Caja— y tiene explicación propia en la
   * ficha. Pero quien responde Bancos no se equivocó sobre el patrimonio: se
   * equivocó entre las dos cuentas de dinero, que es lo que dice el otro texto.
   * Responderle «devolver un aporte disminuye el patrimonio» sería contestar a
   * una pregunta que no hizo.
   */
  const { item, transaccion } = ITEMS.find((x) => x.transaccion.id === "cal-6");
  const lados = ladosDe(transaccion);
  assert.ok(lados.has("Caja"), "cal-6 dejó de mover Caja");
  const conBancos = filasDe([["Aportes sociales", DEBE], ["Bancos", HABER]]);
  assert.equal(evaluar(item, transaccion, conBancos).texto, ARMA_EL_ASIENTO.errores.cajaPorBancos);
  /* Y sin esa confusión de por medio, sí manda la explicación propia. */
  assert.equal(evaluar(item, transaccion, alReves(transaccion)).texto,
    ARMA_EL_ASIENTO.errores.devolucionAportes);
});

test("una cuenta que no se mueve se nombra en la explicación", () => {
  const { item, transaccion } = ITEMS.find((x) => x.transaccion.id === "cal-2");
  const filas = filasDe([["Equipo de computación", DEBE], ["Maquinaria", HABER]]);
  const r = evaluar(item, transaccion, filas);
  assert.match(r.texto, /^❌ Maquinaria no se mueve en esta transacción/);
});

test("★ el puntaje reparte las cuatro decisiones: cuenta y lado de cada una", () => {
  const { item, transaccion } = ITEMS.find((x) => x.transaccion.id === "cal-3");
  const lados = [...ladosDe(transaccion)];
  /* Las dos cuentas bien, los dos lados al revés: dos de cuatro. */
  assert.equal(evaluar(item, transaccion, alReves(transaccion)).aciertos, 2);
  /* Una cuenta bien con su lado, la otra ajena: dos de cuatro. */
  const conAjena = filasDe([[lados[0][0], lados[0][1]], ["Local comercial", HABER]]);
  assert.equal(evaluar(item, transaccion, conAjena).aciertos, 2);
  /* Una cuenta bien pero del lado que no es, y la otra ajena: una de cuatro. */
  const peor = filasDe([[lados[0][0], lados[0][1] === DEBE ? HABER : DEBE], ["Local comercial", HABER]]);
  assert.equal(evaluar(item, transaccion, peor).aciertos, 1);
  /* Nada puesto: cero. */
  assert.equal(evaluar(item, transaccion, [filaVacia(), filaVacia()]).aciertos, 0);
});

/* ─────────────────────── lo que se le pide al banco ─────────────────────── */

test("las doce son asientos simples: una cuenta al debe y una al haber", () => {
  for (const { item, transaccion } of ITEMS) {
    assert.equal(transaccion.asiento.debe.length, 1, `${item.id}: más de una al debe`);
    assert.equal(transaccion.asiento.haber.length, 1, `${item.id}: más de una al haber`);
  }
});

test("el asiento construido sale en la forma que usa el resto del tema", () => {
  const { transaccion } = ITEMS[0];
  const a = asientoDe(respuestaPerfecta(transaccion));
  assert.equal(a.debe.length, 1);
  assert.equal(a.haber.length, 1);
  assert.equal(a.debe[0][0], transaccion.asiento.debe[0][0]);
  /* Sin cifras escritas, los valores van en cero: CU-6 no pregunta cuánto. */
  assert.equal(a.debe[0][1], 0);
});

test("★ una fila sin lado NO entra al asiento por el haber", () => {
  /*
   * Una fila con cuenta y sin lado es una respuesta a medias. Si se colara, el
   * `lado === DEBE` sería falso y acabaría en el haber sin que nadie lo
   * pidiera: una cuenta acreditada que el estudiante nunca acreditó.
   */
  const aMedias = [{ ...filaVacia(), cuenta: "Caja" }, { ...filaVacia(), cuenta: "Bancos", lado: DEBE }];
  const a = asientoDe(aMedias);
  assert.deepEqual(a.haber, [], "la fila sin lado se coló por el haber");
  assert.deepEqual(a.debe, [["Bancos", 0]]);
  /* Y una fila del todo vacía tampoco aporta nada. */
  assert.deepEqual(asientoDe([filaVacia(), filaVacia()]), { debe: [], haber: [] });
});
