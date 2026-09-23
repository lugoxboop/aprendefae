import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DEBE, HABER, COLOR_LADO,
  ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, COSTO, REALES, TRANSITORIAS,
  CRECE_POR, decrecePor, saldoNormalDe, efectoDe, ladoDe,
  CUENTAS, tipoDeCuenta,
  LAVADO_DE_AUTOS, CALEJA,
  mayorizar, saldoDe, mayorConSaldos,
  UBICACION_ESF, estadoDeSituacion, pesos,
} from "../contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL NÚCLEO NUMÉRICO DE CONTABILIDAD.
 *
 * Estas cifras las va a estudiar alguien para un parcial, así que no basta con
 * que el código corra: tienen que COINCIDIR CON EL LIBRO. Aquí se comprueban
 * contra las páginas 96 a 101, una por una.
 *
 * Y se comprueba la propiedad que las sostiene a todas: la partida doble. Un
 * asiento que no cuadre, un mayor que no salga de sus asientos o un estado que
 * no cierre son errores que en pantalla se ven bien y solo se notan cuando un
 * estudiante los copia en un examen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const sumar = (lista) => lista.reduce((s, [, v]) => s + v, 0);
const todasLasTransacciones = [...LAVADO_DE_AUTOS.transacciones, ...CALEJA.transacciones];

/* ─────────────────────────── las dos reglas ─────────────────────────── */

test("las dos familias: Activos/Gastos/Costos por el debe, Pasivos/Patrimonio/Ingresos por el haber", () => {
  assert.equal(CRECE_POR[ACTIVO], DEBE);
  assert.equal(CRECE_POR[GASTO], DEBE);
  assert.equal(CRECE_POR[COSTO], DEBE);
  assert.equal(CRECE_POR[PASIVO], HABER);
  assert.equal(CRECE_POR[PATRIMONIO], HABER);
  assert.equal(CRECE_POR[INGRESO], HABER);
  /* Los seis tipos están, ninguno se quedó sin regla. */
  assert.equal(Object.keys(CRECE_POR).length, 6);
});

test("decrecer es siempre el lado contrario, y el saldo normal es el del crecimiento", () => {
  for (const tipo of Object.keys(CRECE_POR)) {
    assert.notEqual(decrecePor(tipo), CRECE_POR[tipo], `${tipo}: crece y decrece por el mismo lado`);
    assert.equal(saldoNormalDe(tipo), CRECE_POR[tipo]);
  }
});

test("el mismo lado hace cosas distintas según el tipo: eso es todo el capítulo", () => {
  /* Un débito suma en un activo y resta en un pasivo. */
  assert.equal(efectoDe(ACTIVO, DEBE), "aumenta");
  assert.equal(efectoDe(PASIVO, DEBE), "disminuye");
  assert.equal(efectoDe(INGRESO, DEBE), "disminuye");
  assert.equal(efectoDe(INGRESO, HABER), "aumenta");
  /* Y las doce combinaciones del cuadro de dinámicas están completas. */
  let combinaciones = 0;
  for (const tipo of Object.keys(CRECE_POR)) {
    for (const lado of [DEBE, HABER]) {
      assert.ok(["aumenta", "disminuye"].includes(efectoDe(tipo, lado)));
      combinaciones += 1;
    }
  }
  assert.equal(combinaciones, 12, "seis tipos por dos lados");
});

test("ladoDe es la vuelta de efectoDe: lo que sube va por donde crece", () => {
  for (const tipo of Object.keys(CRECE_POR)) {
    assert.equal(efectoDe(tipo, ladoDe(tipo, true)), "aumenta", tipo);
    assert.equal(efectoDe(tipo, ladoDe(tipo, false)), "disminuye", tipo);
  }
});

test("reales y transitorias: tres y tres, sin solaparse", () => {
  assert.deepEqual(REALES, [ACTIVO, PASIVO, PATRIMONIO]);
  assert.deepEqual(TRANSITORIAS, [INGRESO, GASTO, COSTO]);
  assert.equal(new Set([...REALES, ...TRANSITORIAS]).size, 6);
});

test("teal el debe, ámbar el haber, y coral en ninguno", () => {
  assert.equal(COLOR_LADO[DEBE], "#2A9D8F");
  assert.equal(COLOR_LADO[HABER], "#E9C46A");
  for (const c of Object.values(COLOR_LADO)) {
    assert.notEqual(c.toUpperCase(), "#E76F51", "coral significa error, no un lado");
  }
});

/* ──────────────────────── la partida doble ──────────────────────── */

test("LOS 15 ASIENTOS CUADRAN: total del debe contra total del haber", () => {
  for (const t of todasLasTransacciones) {
    const d = sumar(t.asiento.debe);
    const h = sumar(t.asiento.haber);
    assert.equal(d, h, `${t.id}: debe ${d} contra haber ${h}`);
    assert.ok(d > 0, `${t.id}: un asiento de cero no es un asiento`);
  }
  assert.equal(todasLasTransacciones.length, 15, "nueve de Lavado de Autos y seis de Caleja");
});

test("toda cuenta nombrada en un asiento está en el catálogo, con su tipo", () => {
  for (const t of todasLasTransacciones) {
    for (const [cuenta] of [...t.asiento.debe, ...t.asiento.haber]) {
      assert.ok(tipoDeCuenta(cuenta), `${t.id}: «${cuenta}» no está en el catálogo`);
    }
  }
  /* Y ningún tipo del catálogo se inventó uno nuevo. */
  for (const [nombre, tipo] of Object.entries(CUENTAS)) {
    assert.ok(tipo in CRECE_POR, `${nombre} tiene un tipo desconocido: ${tipo}`);
  }
});

test("CORRECCIÓN 3: la hipoteca y las obligaciones financieras son cuentas DISTINTAS", () => {
  /*
   * El libro llega a nombrar la hipoteca «Obligaciones financieras (Hipoteca)»
   * en un punto. En todo este material se llama «Hipoteca por pagar», y
   * «Obligaciones financieras» a secas es otra cosa: el préstamo bancario de
   * Caleja. Mezclarlas junta dos casos que no tienen nada que ver.
   */
  assert.equal(tipoDeCuenta("Hipoteca por pagar"), PASIVO);
  assert.equal(tipoDeCuenta("Obligaciones financieras"), PASIVO);

  const enLavado = new Set(LAVADO_DE_AUTOS.transacciones.flatMap((t) =>
    [...t.asiento.debe, ...t.asiento.haber].map(([c]) => c)));
  const enCaleja = new Set(CALEJA.transacciones.flatMap((t) =>
    [...t.asiento.debe, ...t.asiento.haber].map(([c]) => c)));

  assert.ok(enLavado.has("Hipoteca por pagar"), "Lavado de Autos usa la hipoteca");
  assert.ok(!enLavado.has("Obligaciones financieras"), "Lavado de Autos NO usa obligaciones financieras");
  assert.ok(enCaleja.has("Obligaciones financieras"), "Caleja usa obligaciones financieras");
  assert.ok(!enCaleja.has("Hipoteca por pagar"), "Caleja NO tiene hipoteca");
});

test("CORRECCIÓN 2: el corte del balance es de enero, no de diciembre", () => {
  assert.equal(LAVADO_DE_AUTOS.corte, "A 31 de enero de 20X1");
  assert.ok(!/diciembre/i.test(LAVADO_DE_AUTOS.corte));
  /* Y de hecho las nueve transacciones son de enero. */
  for (const t of LAVADO_DE_AUTOS.transacciones) {
    assert.match(t.fecha, /^Ene /, `${t.id} no es de enero`);
  }
});

/* ──────────────────────── el mayor, contra el libro ──────────────────────── */

test("el mayor SALE de los asientos: no hay una segunda copia que se pueda separar", () => {
  const mayor = mayorizar(LAVADO_DE_AUTOS.transacciones);
  /* Cada valor del mayor viene de un asiento, y ninguno se pierde por el camino. */
  const enAsientos = LAVADO_DE_AUTOS.transacciones.flatMap((t) => [
    ...t.asiento.debe.map(([c, v]) => `${c}|D|${v}`),
    ...t.asiento.haber.map(([c, v]) => `${c}|H|${v}`),
  ]).sort();
  const enMayor = mayor.flatMap((c) => [
    ...c.debitos.map((m) => `${c.cuenta}|D|${m.valor}`),
    ...c.creditos.map((m) => `${c.cuenta}|H|${m.valor}`),
  ]).sort();
  assert.deepEqual(enMayor, enAsientos, "el mayor y el diario no contienen lo mismo");
});

test("MAYOR COMPLETO (p. 100): las 11 cuentas con los saldos impresos del libro", () => {
  const mayor = mayorConSaldos(LAVADO_DE_AUTOS.transacciones);
  assert.equal(mayor.length, 11);
  const porCuenta = Object.fromEntries(mayor.map((c) => [c.cuenta, c]));

  /* Las cifras son las del libro, tecleadas aquí a propósito para contrastar. */
  const DEL_LIBRO = {
    "Bancos": [1850, DEBE],
    "Acciones": [6000, HABER],
    "Construcciones y edificaciones": [6000, DEBE],
    "Terrenos": [4000, DEBE],
    "Hipoteca por pagar": [7600, HABER],
    "Flota y equipo de transporte": [4800, DEBE],
    "Letras por pagar": [4000, HABER],
    "Equipo de computación": [2000, DEBE],
    "Cuentas por pagar": [3750, HABER],
    "Muebles y enseres": [2500, DEBE],
    "Caja": [200, DEBE],
  };
  assert.deepEqual(Object.keys(DEL_LIBRO).sort(), mayor.map((c) => c.cuenta).sort());
  for (const [cuenta, [saldo, lado]] of Object.entries(DEL_LIBRO)) {
    assert.equal(porCuenta[cuenta].saldo, saldo, `${cuenta}: saldo`);
    assert.equal(porCuenta[cuenta].lado, lado, `${cuenta}: lado`);
  }
});

test("el saldo es una resta y va del lado que pesó más; nunca es negativo", () => {
  assert.deepEqual(
    saldoDe({ debitos: [{ valor: 50 }], creditos: [{ valor: 30 }] }),
    { debito: 50, credito: 30, saldo: 20, lado: DEBE },
  );
  assert.deepEqual(
    saldoDe({ debitos: [{ valor: 30 }], creditos: [{ valor: 50 }] }),
    { debito: 30, credito: 50, saldo: 20, lado: HABER },
  );
  /* Empatados: saldo cero y SIN lado. Decir «debe» por descuido enseñaría algo falso. */
  assert.deepEqual(
    saldoDe({ debitos: [{ valor: 40 }], creditos: [{ valor: 40 }] }),
    { debito: 40, credito: 40, saldo: 0, lado: null },
  );
  for (const c of mayorConSaldos(LAVADO_DE_AUTOS.transacciones)) {
    assert.ok(c.saldo >= 0, `${c.cuenta}: el saldo no lleva signo, lo dice el lado`);
  }
});

/* ═══════════════ EL SET A TRUNCADO — el punto delicado ═══════════════ */

/*
 * CU-11 Set A usa SOLO cinco asientos (ene-02 a ene-12). Sus saldos NO son los
 * del mayor completo, y eso es deliberado.
 *
 * SI ALGUIEN «CORRIGE» ESTAS CIFRAS PARA QUE COINCIDAN CON LA p. 100, ROMPE LA
 * ACTIVIDAD: estaría calificando como error la respuesta correcta del corte.
 * Por eso la prueba no solo comprueba los diez saldos, sino que EXIGE que las
 * cuatro marcadas sigan siendo distintas del mayor completo.
 */
export const CORTE_SET_A = ["ene-02", "ene-03", "ene-04", "ene-08", "ene-12"];

test("SET A TRUNCADO: 10 cuentas, sin Caja, con los saldos de su propio corte", () => {
  const setA = mayorConSaldos(
    LAVADO_DE_AUTOS.transacciones.filter((t) => CORTE_SET_A.includes(t.id)),
  );
  assert.equal(setA.length, 10);
  assert.ok(!setA.some((c) => c.cuenta === "Caja"), "Caja no entra hasta ene-25, fuera del corte");

  const ESPERADO = {
    "Bancos": [1700, DEBE],
    "Acciones": [5000, HABER],
    "Construcciones y edificaciones": [6000, DEBE],
    "Terrenos": [4000, DEBE],
    "Hipoteca por pagar": [8000, HABER],
    "Flota y equipo de transporte": [4800, DEBE],
    "Letras por pagar": [4000, HABER],
    "Equipo de computación": [2000, DEBE],
    "Cuentas por pagar": [4000, HABER],
    "Muebles y enseres": [2500, DEBE],
  };
  const porCuenta = Object.fromEntries(setA.map((c) => [c.cuenta, c]));
  for (const [cuenta, [saldo, lado]] of Object.entries(ESPERADO)) {
    assert.equal(porCuenta[cuenta].saldo, saldo, `${cuenta}: saldo del Set A`);
    assert.equal(porCuenta[cuenta].lado, lado, `${cuenta}: lado del Set A`);
  }
});

test("SET A: las cuatro cuentas marcadas DEBEN diferir del mayor completo", () => {
  const setA = Object.fromEntries(
    mayorConSaldos(LAVADO_DE_AUTOS.transacciones.filter((t) => CORTE_SET_A.includes(t.id)))
      .map((c) => [c.cuenta, c.saldo]),
  );
  const completo = Object.fromEntries(
    mayorConSaldos(LAVADO_DE_AUTOS.transacciones).map((c) => [c.cuenta, c.saldo]),
  );

  /* Estas cuatro tienen que salir distintas. Si coincidieran, alguien «arregló» el corte. */
  const DEBEN_DIFERIR = {
    "Bancos": [1700, 1850],
    "Acciones": [5000, 6000],
    "Hipoteca por pagar": [8000, 7600],
    "Cuentas por pagar": [4000, 3750],
  };
  for (const [cuenta, [enSetA, enCompleto]] of Object.entries(DEBEN_DIFERIR)) {
    assert.equal(setA[cuenta], enSetA, `${cuenta} en el Set A`);
    assert.equal(completo[cuenta], enCompleto, `${cuenta} en el mayor completo`);
    assert.notEqual(setA[cuenta], completo[cuenta],
      `${cuenta}: el Set A dejó de ser un corte y se igualó al mayor completo`);
  }

  /* Y las otras seis sí coinciden: la diferencia es exactamente la esperada. */
  const IGUALES = ["Construcciones y edificaciones", "Terrenos", "Flota y equipo de transporte",
    "Letras por pagar", "Equipo de computación", "Muebles y enseres"];
  for (const cuenta of IGUALES) {
    assert.equal(setA[cuenta], completo[cuenta], `${cuenta} debería coincidir y no coincide`);
  }
});

test("SET A: su propia ecuación cuadra — 21.000 = 16.000 + 5.000", () => {
  const setA = mayorConSaldos(
    LAVADO_DE_AUTOS.transacciones.filter((t) => CORTE_SET_A.includes(t.id)),
  );
  const por = (tipo) => setA.filter((c) => c.tipo === tipo).reduce((s, c) => s + c.saldo, 0);
  assert.equal(por(ACTIVO), 21000);
  assert.equal(por(PASIVO), 16000);
  assert.equal(por(PATRIMONIO), 5000);
  assert.equal(por(ACTIVO), por(PASIVO) + por(PATRIMONIO), "el corte no cuadra");
});

/* ──────────────── el estado de situación financiera (p. 101) ──────────────── */

test("ESTADO DE SITUACIÓN FINANCIERA: 21.350 = 15.350 + 6.000", () => {
  const esf = estadoDeSituacion(mayorConSaldos(LAVADO_DE_AUTOS.transacciones));
  assert.equal(esf.secciones["activo-corriente"].total, 2050, "Caja 200 + Bancos 1.850");
  assert.equal(esf.secciones["activo-no-corriente"].total, 19300);
  assert.equal(esf.activos, 21350);
  assert.equal(esf.secciones["pasivo-corriente"].total, 7750, "Cuentas por pagar + Letras");
  assert.equal(esf.secciones["pasivo-no-corriente"].total, 7600, "la hipoteca, a cinco años");
  assert.equal(esf.pasivos, 15350);
  assert.equal(esf.patrimonio, 6000);
  assert.equal(esf.pasivosMasPatrimonio, 21350);
  assert.equal(esf.activos, esf.pasivosMasPatrimonio, "el estado no cierra");
});

test("las once cuentas del mayor tienen sitio en el estado: ninguna se queda fuera", () => {
  const mayor = mayorConSaldos(LAVADO_DE_AUTOS.transacciones);
  for (const c of mayor) {
    assert.ok(UBICACION_ESF[c.cuenta], `${c.cuenta} no tiene sección en el estado`);
  }
  /* Y el estado no nombra cuentas que el mayor no tenga. */
  const enMayor = new Set(mayor.map((c) => c.cuenta));
  for (const cuenta of Object.keys(UBICACION_ESF)) {
    assert.ok(enMayor.has(cuenta), `${cuenta} está en el estado pero no en el mayor`);
  }
});

test("lo corriente y lo no corriente están donde el enunciado los pone", () => {
  /* El efectivo es corriente por definición. */
  assert.equal(UBICACION_ESF["Caja"], "activo-corriente");
  assert.equal(UBICACION_ESF["Bancos"], "activo-corriente");
  /* La hipoteca es «a cinco años»: sale del año. */
  assert.equal(UBICACION_ESF["Hipoteca por pagar"], "pasivo-no-corriente");
  /* Las letras del camión se cancelan dentro del año. */
  assert.equal(UBICACION_ESF["Letras por pagar"], "pasivo-corriente");
  /* Las acciones no son deuda. */
  assert.equal(UBICACION_ESF["Acciones"], "patrimonio");
});

/* ──────────────────────────── el formato ──────────────────────────── */

test("las cifras se escriben en pesos colombianos, con punto de miles", () => {
  assert.equal(pesos(200), "$200");
  assert.equal(pesos(1850), "$1.850");
  assert.equal(pesos(21350), "$21.350");
  assert.equal(pesos(1500000), "$1.500.000");
});
