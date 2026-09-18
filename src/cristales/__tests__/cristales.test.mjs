import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import {
  PRECIO_NIVEL, NIVELES_COMPRABLES, CRISTALES_RACHA, ACTIVIDADES_POR_PREMIO, CRISTALES_POR_ACTIVIDADES,
  CRISTALES_PODIO, CRISTALES_PODIO_RESTO, cristalesDePuesto, PODIO_PROPORCION, PODIO_MINIMO, tamanoPodio,
  FUENTES, saldoDe, nivelesDesbloqueados, estaDesbloqueado, precioDe, faltanPara, estadoDeNivel,
} from "../cristales.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS CRISTALES: las cifras, las dos fronteras con SQL y la invariante del FP.
 *
 * Las cifras se comprueban contra los números escritos a mano aquí Y contra las
 * migraciones, que es el otro sitio donde viven. Dos fuentes que no se pueden
 * compartir —SQL no lee JavaScript— se separan en la primera edición si nadie
 * mira; esto mira.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MIGRACIONES = new URL("../../../supabase/migrations/", import.meta.url);
const migracion = (nombre) => readFileSync(new URL(nombre, MIGRACIONES), "utf8");

test("los precios son 60, 150 y 300, y el nivel I no se compra", () => {
  assert.deepEqual(PRECIO_NIVEL, { 2: 60, 3: 150, 4: 300 });
  assert.deepEqual(NIVELES_COMPRABLES, [2, 3, 4]);
  assert.equal(precioDe(1), 0, "el I es gratis: no tiene precio que enseñar");
  assert.equal(precioDe(9), 0);
});

test("los precios del cliente son los de la 0035, uno por uno", () => {
  const sql = migracion("0035_avatares_y_cristales.sql");
  for (const [nivel, precio] of Object.entries(PRECIO_NIVEL)) {
    assert.ok(new RegExp(`when ${nivel} then ${precio}\\b`).test(sql), `la 0035 debe cobrar ${precio} por el nivel ${nivel}`);
  }
  assert.ok(/when 1 then/.test(sql) === false, "el nivel I no puede tener precio en la base");
});

test("los hitos de racha son 5 / 10 / 20 / 50, y los mismos que paga la 0035", () => {
  assert.deepEqual(CRISTALES_RACHA, { 3: 5, 7: 10, 14: 20, 30: 50 });
  const sql = migracion("0035_avatares_y_cristales.sql");
  for (const [dias, cuanto] of Object.entries(CRISTALES_RACHA)) {
    assert.ok(new RegExp(`when ${dias}\\s+then ${cuanto}\\b`).test(sql), `la 0035 debe pagar ${cuanto} en el día ${dias}`);
  }
  /* Y son los mismos días que el bono de FP de la 0007: un hito es un hito. */
  const racha = migracion("0007_racha.sql");
  for (const dias of Object.keys(CRISTALES_RACHA)) {
    assert.ok(new RegExp(`when ${dias}\\s+then`).test(racha), `el día ${dias} debe ser hito también en FP`);
  }
});

test("el contador paga 20 cada 5 actividades distintas, igual que la 0035", () => {
  assert.equal(ACTIVIDADES_POR_PREMIO, 5);
  assert.equal(CRISTALES_POR_ACTIVIDADES, 20);
  const sql = migracion("0035_avatares_y_cristales.sql");
  assert.ok(sql.includes("'actividades-' || v_k, 20,"), "la 0035 debe pagar 20 por tramo");
  assert.ok(sql.includes("v_k := 5;") && sql.includes("v_k := v_k + 5;"), "y el tramo debe ser de 5");
  /* Las dos reglas del contador, escritas en la migración. */
  assert.ok(sql.includes("count(distinct h.activity_id)"), "cuenta ids únicos: las repeticiones no suman");
  assert.ok(sql.includes("h.activity_id not like 'racha-%'"), "y las filas de bono no son actividades");
});

test("el podio paga 15 / 10 / 7 y 5 del cuarto en adelante, igual que la 0036", () => {
  assert.deepEqual(CRISTALES_PODIO, { 1: 15, 2: 10, 3: 7 });
  assert.equal(CRISTALES_PODIO_RESTO, 5);
  assert.deepEqual([1, 2, 3, 4, 5, 12].map(cristalesDePuesto), [15, 10, 7, 5, 5, 5]);
  assert.equal(cristalesDePuesto(0), 0);
  assert.equal(cristalesDePuesto(null), 0);

  const sql = migracion("0036_cierre_semanal_y_podio.sql");
  assert.ok(sql.includes("when p_posicion = 1 then 15"));
  assert.ok(sql.includes("when p_posicion = 2 then 10"));
  assert.ok(sql.includes("when p_posicion = 3 then 7"));
  assert.ok(sql.includes("else 5"));
});

test("el podio es proporcional: round(n × 0,28) con mínimo 2, y la 0036 dice lo mismo", () => {
  assert.equal(PODIO_PROPORCION, 0.28);
  assert.equal(PODIO_MINIMO, 2);
  /* Los tres ejemplos del diseño. */
  assert.equal(tamanoPodio(7), 2);
  assert.equal(tamanoPodio(17), 5);
  assert.equal(tamanoPodio(25), 7);
  /* Y el suelo: en grupos chicos nunca baja de 2. */
  assert.deepEqual([1, 2, 3, 5, 7].map(tamanoPodio), [2, 2, 2, 2, 2]);
  assert.equal(tamanoPodio(10), 3);
  assert.equal(tamanoPodio(30), 8);
  assert.equal(tamanoPodio(0), 0);

  for (let n = 1; n <= 60; n++) {
    assert.equal(tamanoPodio(n), Math.max(2, Math.round(n * 0.28)), `liga de ${n}`);
    assert.ok(tamanoPodio(n) <= n || n < 2, `el podio no puede ser mayor que la liga (n = ${n})`);
  }

  const sql = migracion("0036_cierre_semanal_y_podio.sql");
  assert.ok(sql.includes("greatest(2, round(p_tam * 0.28))::integer"), "la 0036 debe usar la misma fórmula");
});

test("el podio de Cristales NO es la zona de ascenso de las ligas", () => {
  /*
   * La zona de ascenso es el 15% con mínimo 1 (ligas_cupo, 0026) y decide quién
   * SUBE de nivel. El podio que paga es el 28% con mínimo 2. Son dos cortes
   * distintos a propósito, y por eso viven en dos funciones con nombres
   * distintos: el día que uno cambie, el otro no se mueve solo.
   */
  const cupo = (n) => Math.max(1, Math.round(n * 0.15));
  assert.notEqual(tamanoPodio(17), cupo(17));
  assert.notEqual(tamanoPodio(7), cupo(7));
  const sql = migracion("0036_cierre_semanal_y_podio.sql");
  assert.ok(sql.includes("liga_podio_tamano"), "la del pago");
  assert.ok(!/create or replace function public\.ligas_(cupo|zona)/.test(sql), "la del ascenso NO se toca aquí");
});

/* ─────────────────── la tabla de la Tienda ─────────────────── */

test("la tabla de cómo ganar trae las seis filas de la v1, y NINGUNA de medallas", () => {
  assert.deepEqual(FUENTES.map((f) => f.id), ["racha-3", "racha-7", "racha-14", "racha-30", "actividades", "podio"]);
  assert.deepEqual(FUENTES.slice(0, 4).map((f) => f.cuanto), [5, 10, 20, 50]);
  assert.equal(FUENTES.find((f) => f.id === "actividades").cuanto, 20);
  /*
   * Las medallas quedaron fuera de esta tanda: no existe hoy ningún momento en
   * el servidor en que se otorgue una, así que no hay dónde enganchar el pago.
   * Ofrecerla en la tabla sería prometer Cristales que no llegan.
   */
  assert.ok(!FUENTES.some((f) => /medalla/i.test(`${f.id} ${f.que}`)), "ninguna fila puede hablar de medallas");
});

test("y tampoco quedó un gancho a medias de medallas en las migraciones nuevas", () => {
  for (const nombre of ["0035_avatares_y_cristales.sql", "0036_cierre_semanal_y_podio.sql"]) {
    const sql = migracion(nombre);
    assert.ok(!/cristales_por_medalla|medalla_otorgada/.test(sql), `${nombre} no debe traer media fuente de medallas`);
  }
});

/* ─────────────────── saldo, niveles y estados ─────────────────── */

test("el saldo se lee entero y nunca negativo, aunque llegue basura", () => {
  assert.equal(saldoDe({ cristales_balance: 130 }), 130);
  assert.equal(saldoDe({ cristales_balance: null }), 0);
  assert.equal(saldoDe({}), 0);
  assert.equal(saldoDe(null), 0);
  assert.equal(saldoDe({ cristales_balance: -5 }), 0);
});

test("el nivel I está siempre entre los desbloqueados, pase lo que pase", () => {
  assert.deepEqual(nivelesDesbloqueados({ avatar_unlocked_levels: [] }), [1]);
  assert.deepEqual(nivelesDesbloqueados(null), [1]);
  assert.deepEqual(nivelesDesbloqueados({ avatar_unlocked_levels: [4, 2] }), [1, 2, 4], "y salen ordenados");
  assert.deepEqual(nivelesDesbloqueados({ avatar_unlocked_levels: [1, 1, 2] }), [1, 2]);
  assert.deepEqual(nivelesDesbloqueados({ avatar_unlocked_levels: [7, "3"] }), [1, 3], "lo que no es un nivel se cae");
  assert.equal(estaDesbloqueado({ avatar_unlocked_levels: [1, 2] }, 2), true);
  assert.equal(estaDesbloqueado({ avatar_unlocked_levels: [1, 2] }, 3), false);
});

test("cuántos faltan, y en qué estado queda cada nivel", () => {
  const pobre = { cristales_balance: 45, avatar_unlocked_levels: [1] };
  assert.equal(faltanPara(pobre, 2), 15);
  assert.equal(faltanPara(pobre, 3), 105);
  assert.equal(faltanPara(pobre, 4), 255);
  assert.equal(estadoDeNivel(pobre, 2), "falta");

  const justo = { cristales_balance: 60, avatar_unlocked_levels: [1] };
  assert.equal(faltanPara(justo, 2), 0, "con el precio exacto alcanza");
  assert.equal(estadoDeNivel(justo, 2), "alcanzable");

  const comprado = { cristales_balance: 0, avatar_unlocked_levels: [1, 2] };
  assert.equal(faltanPara(comprado, 2), 0);
  assert.equal(estadoDeNivel(comprado, 2), "comprado");
  assert.equal(estadoDeNivel(comprado, 3), "falta");
});

test("comprar un nivel no depende de haber comprado el anterior", () => {
  /* 300 sin haber comprado ni el II ni el III: el IV es alcanzable igual. */
  const rico = { cristales_balance: 300, avatar_unlocked_levels: [1] };
  assert.equal(estadoDeNivel(rico, 4), "alcanzable");
  assert.equal(estadoDeNivel(rico, 2), "alcanzable");
  assert.equal(estadoDeNivel(rico, 3), "alcanzable");
  /* Y el que compró el IV no pierde nada al cambiar de forma o de paleta. */
  const conIV = { cristales_balance: 0, avatar_shape: "cuna", avatar_palette: "brasa", avatar_unlocked_levels: [1, 4] };
  assert.deepEqual(nivelesDesbloqueados({ ...conIV, avatar_shape: "red", avatar_palette: "marea" }), [1, 4]);
});

/* ─────────────────── la invariante del FP ─────────────────── */

test("NINGUNA migración resta FP: todas las escrituras de points son sumas", () => {
  const archivos = readdirSync(MIGRACIONES).filter((f) => f.endsWith(".sql"));
  const escrituras = [];
  for (const nombre of archivos) {
    for (const linea of migracion(nombre).split("\n")) {
      /* Solo el SQL, no los comentarios que hablan de ello. */
      const limpia = linea.replace(/--.*$/, "");
      if (/\bpoints\s*=/.test(limpia)) escrituras.push({ nombre, linea: limpia.trim() });
    }
  }
  assert.ok(escrituras.length >= 7, "si esto baja de golpe, alguien quitó el pago de FP");
  for (const { nombre, linea } of escrituras) {
    assert.ok(/points\s*=\s*points\s*\+/.test(linea), `${nombre} escribe points sin sumar: ${linea}`);
  }
});

test("y no hay conversión entre FP y Cristales en ninguna dirección", () => {
  for (const nombre of ["0035_avatares_y_cristales.sql", "0036_cierre_semanal_y_podio.sql"]) {
    const sql = migracion(nombre);
    /* Nadie escribe el saldo de Cristales leyendo points, ni al revés. */
    assert.ok(!/cristales_balance\s*=[^;]*points/.test(sql), `${nombre}: el saldo no puede salir de los FP`);
    assert.ok(!/points\s*=[^;]*cristales/.test(sql), `${nombre}: los FP no pueden salir de los Cristales`);
  }
  const cliente = readFileSync(new URL("../cristales.js", import.meta.url), "utf8");
  assert.ok(!/points/.test(cliente), "el módulo de Cristales no tiene por qué mirar los FP");
});
