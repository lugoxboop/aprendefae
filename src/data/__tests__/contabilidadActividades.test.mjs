import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVIDADES, DESAFIO, FP_DEL_TEMA, CUENTAS_DE_CIMIENTOS,
  IZQUIERDA_O_DERECHA, DE_QUE_FAMILIA, CUADRO_DINAMICAS, DEBITA_O_ACREDITA,
} from "../contabilidadActividades.js";
import {
  DEBE, HABER, ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, COSTO,
  CRECE_POR, efectoDe, tipoDeCuenta, TRANSITORIAS,
} from "../contabilidad.js";
import { BASE_POR_DIFICULTAD, TOPE_ETAPAS } from "../../fp/motor.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS DOCE ACTIVIDADES: su ficha y sus bancos.
 *
 * Lo que se vigila aquí es lo que se rompe en silencio: que los FP sumen lo
 * que dice la ficha, que Cimientos respete su rango restringido, y que el
 * cuadro de dinámicas no contradiga a las dos reglas que enseña la pieza de
 * Aprender —porque están escritos en sitios distintos y podrían separarse—.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─────────────────────────── la ficha del tema ─────────────────────────── */

test("son doce actividades, repartidas 2-3-4-3 por bloque", () => {
  assert.equal(ACTIVIDADES.length, 12);
  const porBloque = {};
  for (const a of ACTIVIDADES) porBloque[a.bloque] = (porBloque[a.bloque] ?? 0) + 1;
  assert.deepEqual(porBloque, { "CIMIENTOS": 2, "APLICACIÓN": 3, "ANÁLISIS": 4, "MAESTRÍA": 3 });
});

test("EL TEMA SUMA 565 FP: 2×10 + 3×25 + 4×50 + 3×90", () => {
  const cuenta = {};
  for (const a of ACTIVIDADES) cuenta[a.fpBase] = (cuenta[a.fpBase] ?? 0) + 1;
  assert.deepEqual(cuenta, { 10: 2, 25: 3, 50: 4, 90: 3 });
  assert.equal(FP_DEL_TEMA, 565);
  assert.equal(2 * 10 + 3 * 25 + 4 * 50 + 3 * 90, 565, "la cuenta de la ficha");
});

test("el fpBase de cada actividad es el de su dificultad en el motor, no un número suelto", () => {
  for (const a of ACTIVIDADES) {
    assert.equal(a.fpBase, BASE_POR_DIFICULTAD[a.dificultad],
      `${a.id}: declara ${a.fpBase} y ${a.dificultad} vale ${BASE_POR_DIFICULTAD[a.dificultad]}`);
  }
});

test("los ids y los nombres son únicos, y cada una trae su subtema", () => {
  assert.equal(new Set(ACTIVIDADES.map((a) => a.id)).size, 12, "hay ids repetidos");
  assert.equal(new Set(ACTIVIDADES.map((a) => a.nombre)).size, 12, "hay nombres repetidos");
  for (const a of ACTIVIDADES) {
    assert.ok(a.subtema?.length > 3, `${a.id} no tiene subtema`);
  }
});

test("el desafío está FUERA del camino y vale base × etapas, con tope en cuatro", () => {
  assert.equal(DESAFIO.dificultad, "experto");
  assert.equal(DESAFIO.fpBase, BASE_POR_DIFICULTAD.experto);
  assert.equal(DESAFIO.etapas, 4);
  assert.equal(DESAFIO.fpBase * Math.min(DESAFIO.etapas, TOPE_ETAPAS), 360);
  /* Y no entra en los 565: si entrara, cerrar el tema exigiría hacerlo. */
  assert.ok(!ACTIVIDADES.some((a) => a.id === DESAFIO.id), "el desafío se coló en el camino");
});

test("los cuatro pesos del desafío suman 100 %, en el orden de la ficha", () => {
  assert.deepEqual(DESAFIO.pesos.map((p) => p.peso), [0.3, 0.25, 0.2, 0.25]);
  assert.equal(DESAFIO.pesos.reduce((s, p) => s + p.peso, 0), 1);
  for (const p of DESAFIO.pesos) assert.ok(p.subtema?.length > 3, `la etapa ${p.id} no tiene subtema`);
});

test("el texto de cierre es el del Ciclo Completo, no el de otro desafío", () => {
  /*
   * El encargo traía pegado por error el cierre de El Comité de NOVA y lo
   * corregía a continuación. Esta prueba fija cuál es el bueno.
   */
  assert.match(DESAFIO.cierre, /Nueve transacciones, once cuentas y tres libros/);
  assert.match(DESAFIO.cierre, /\$21\.350 = \$21\.350/);
  assert.ok(!/NOVA/.test(DESAFIO.cierre), "se coló el cierre de otro desafío");
  /* Y no promete trofeo ni depende del puntaje. */
  assert.ok(!/trofeo|medalla|cofre|corona/i.test(DESAFIO.cierre));
  assert.ok(!/\d+\s*(FP|puntos|%)/.test(DESAFIO.cierre));
});

/* ═══════════ CIMIENTOS: el rango restringido, que es una regla ═══════════ */

test("CIMIENTOS no toca ingresos, gastos ni costos: ahí es donde se rompe la memorización", () => {
  /* CU-1 nombra cuentas; CU-2 las nombra en el enunciado. Ninguna es transitoria. */
  for (const i of IZQUIERDA_O_DERECHA.items) {
    assert.ok(!TRANSITORIAS.includes(tipoDeCuenta(i.cuenta)), `CU-1 ${i.id}: ${i.cuenta} es transitoria`);
  }
  for (const i of DE_QUE_FAMILIA.items) {
    assert.ok(!TRANSITORIAS.includes(i.categoria), `CU-2 ${i.id}: ${i.enunciado} es transitoria`);
  }
  /* Y las categorías de CU-2 son solo las tres reales. */
  assert.deepEqual(DE_QUE_FAMILIA.categorias.map((c) => c.id), [ACTIVO, PASIVO, PATRIMONIO]);
});

test("CU-1 usa SOLO las seis cuentas del rango corto", () => {
  assert.equal(CUENTAS_DE_CIMIENTOS.length, 6);
  for (const i of IZQUIERDA_O_DERECHA.items) {
    assert.ok(CUENTAS_DE_CIMIENTOS.includes(i.cuenta), `${i.id}: «${i.cuenta}» está fuera del rango`);
  }
});

/* ═══════════ los bancos: tamaño, unicidad y coherencia con las reglas ═══════════ */

const BANCOS = [
  ["CU-1", IZQUIERDA_O_DERECHA, 10, 6],
  ["CU-2", DE_QUE_FAMILIA, 12, 6],
  ["CU-4", DEBITA_O_ACREDITA, 10, 8],
];

test("cada banco tiene el tamaño de la ficha y se sortea lo que dice", () => {
  for (const [nombre, banco, cuantos, porPartida] of BANCOS) {
    assert.equal(banco.items.length, cuantos, `${nombre}: el banco`);
    assert.equal(banco.porPartida, porPartida, `${nombre}: cuántos se sortean`);
    assert.ok(banco.items.length >= banco.porPartida, `${nombre}: no hay de dónde sortear`);
    assert.equal(new Set(banco.items.map((i) => i.id)).size, banco.items.length, `${nombre}: ids repetidos`);
    assert.ok(banco.subtema?.length > 3, `${nombre}: sin subtema`);
  }
});

test("todo ítem lleva su retroalimentación de acierto, y empieza por ✅", () => {
  for (const [nombre, banco] of BANCOS) {
    for (const i of banco.items) {
      assert.ok(i.acierto?.startsWith("✅"), `${nombre} ${i.id}: sin acierto`);
      assert.ok(i.enunciado?.length > 2, `${nombre} ${i.id}: sin enunciado`);
    }
  }
});

test("toda respuesta correcta es una de las categorías que se ofrecen", () => {
  for (const [nombre, banco] of BANCOS) {
    const validas = new Set(banco.categorias.map((c) => c.id));
    for (const i of banco.items) {
      assert.ok(validas.has(i.categoria), `${nombre} ${i.id}: responde «${i.categoria}», que no se ofrece`);
    }
  }
});

test("CU-1 NO CONTRADICE las dos reglas: cada respuesta sale de CRECE_POR", () => {
  /*
   * El banco dice «Caja aumenta → Debe». Eso tiene que coincidir con lo que
   * dicta la regla para el tipo de Caja. Si alguien tocara una de las dos, la
   * actividad enseñaría lo contrario que la pieza de Aprender.
   */
  for (const i of IZQUIERDA_O_DERECHA.items) {
    const sube = /aumenta$/.test(i.enunciado);
    const esperado = sube ? CRECE_POR[tipoDeCuenta(i.cuenta)]
      : (CRECE_POR[tipoDeCuenta(i.cuenta)] === DEBE ? HABER : DEBE);
    assert.equal(i.categoria, esperado,
      `${i.id}: «${i.enunciado}» responde ${i.categoria} y la regla dice ${esperado}`);
  }
});

test("CU-2 NO CONTRADICE el catálogo: la familia de cada cuenta es la suya", () => {
  for (const i of DE_QUE_FAMILIA.items) {
    assert.equal(i.categoria, tipoDeCuenta(i.enunciado),
      `${i.id}: «${i.enunciado}» se clasifica como ${i.categoria} y el catálogo dice ${tipoDeCuenta(i.enunciado)}`);
  }
});

test("CU-3 cubre las DOCE combinaciones y ninguna contradice la regla", () => {
  const claves = Object.keys(CUADRO_DINAMICAS.acierto);
  assert.equal(claves.length, 12, "seis tipos por dos lados");
  for (const tipo of Object.keys(CRECE_POR)) {
    for (const lado of [DEBE, HABER]) {
      const texto = CUADRO_DINAMICAS.acierto[`${tipo}>${lado}`];
      assert.ok(texto, `falta ${tipo}/${lado}`);
      /* El texto tiene que decir lo mismo que la regla. */
      const esperado = efectoDe(tipo, lado);
      assert.match(texto, new RegExp(`^✅ ${esperado[0].toUpperCase()}${esperado.slice(1)}\\.`),
        `${tipo}/${lado}: el texto no dice «${esperado}»`);
    }
  }
});

test("CU-4: la cuenta de cada transacción existe, y su respuesta cuadra con su tipo", () => {
  for (const i of DEBITA_O_ACREDITA.items) {
    assert.ok(tipoDeCuenta(i.cuenta), `${i.id}: «${i.cuenta}» no está en el catálogo`);
  }
  /* El ítem de ingresos se acredita: es el que la ficha señala como el más fallado. */
  const ingreso = DEBITA_O_ACREDITA.items.find((i) => tipoDeCuenta(i.cuenta) === INGRESO);
  assert.ok(ingreso, "CU-4 debería tener un ítem de ingresos");
  assert.equal(ingreso.categoria, HABER);
});

/* ─────────────────────── las retroalimentaciones de error ─────────────────────── */

test("CU-1 explica el error por familia, y cubre las tres que usa", () => {
  const familias = new Set(IZQUIERDA_O_DERECHA.items.map((i) => tipoDeCuenta(i.cuenta)));
  for (const f of familias) {
    assert.ok(IZQUIERDA_O_DERECHA.errorPorTipo[f]?.startsWith("❌"), `sin error para ${f}`);
  }
  assert.deepEqual([...familias].sort(), [ACTIVO, PASIVO, PATRIMONIO].sort());
});

test("CU-2 cubre las SEIS confusiones posibles entre tres familias", () => {
  const tipos = [ACTIVO, PASIVO, PATRIMONIO];
  let cubiertas = 0;
  for (const correcta of tipos) {
    for (const elegida of tipos) {
      if (correcta === elegida) continue;
      const texto = DE_QUE_FAMILIA.errorPorConfusion[`${correcta}>${elegida}`];
      assert.ok(texto?.startsWith("❌"), `sin error para ${correcta}>${elegida}`);
      cubiertas += 1;
    }
  }
  assert.equal(cubiertas, 6);
});

test("CU-3 explica el error para los seis tipos, y señala los ingresos como el peor", () => {
  for (const tipo of Object.keys(CRECE_POR)) {
    assert.ok(CUADRO_DINAMICAS.errorPorTipo[tipo]?.startsWith("❌"), `sin error para ${tipo}`);
  }
  assert.match(CUADRO_DINAMICAS.errorPorTipo[INGRESO], /el que más se falla/);
  /* Gastos y Costos comparten explicación porque comparten regla. */
  assert.equal(CUADRO_DINAMICAS.errorPorTipo[GASTO], CUADRO_DINAMICAS.errorPorTipo[COSTO]);
});

test("coral no aparece en ningún texto: los errores se marcan con ❌, no con color", () => {
  const todos = [
    ...IZQUIERDA_O_DERECHA.items.map((i) => i.acierto),
    ...Object.values(IZQUIERDA_O_DERECHA.errorPorTipo),
    ...DE_QUE_FAMILIA.items.map((i) => i.acierto),
    ...Object.values(DE_QUE_FAMILIA.errorPorConfusion),
    ...Object.values(CUADRO_DINAMICAS.acierto),
    ...Object.values(CUADRO_DINAMICAS.errorPorTipo),
    ...DEBITA_O_ACREDITA.items.map((i) => i.acierto),
  ].join(" ");
  assert.ok(!/E76F51|231,\s*111,\s*81/i.test(todos));
});
