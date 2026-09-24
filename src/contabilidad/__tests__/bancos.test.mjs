import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BANCOS_CLASIFICACION, COMBINACIONES, slug,
  BANCO_IZQUIERDA_O_DERECHA, BANCO_DE_QUE_FAMILIA, BANCO_CUADRO_DINAMICAS,
  BANCO_DEBITA_O_ACREDITA, BANCO_CORRIENTE_DE_CUENTAS,
} from "../bancos.js";
import { CRECE_POR, efectoDe, tipoDeCuenta, NOMBRE_TIPO, CUENTAS, DEBE, HABER, INGRESO } from "../../data/contabilidad.js";
import { CUADRO_DINAMICAS, DEBITA_O_ACREDITA } from "../../data/contabilidadActividades.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS CINCO BANCOS, CONTRA LO QUE LA MECÁNICA ESPERA DE VERDAD.
 *
 * La prueba que importa es la última de cada bloque: la devolución se
 * comprueba ENUMERANDO todas las combinaciones de ítem × opción equivocada.
 * Una devolución que falta no rompe nada —la pantalla simplemente se queda
 * muda— y por eso no se descubre jugando un par de partidas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Todas las respuestas equivocadas posibles de un banco, ítem por ítem. */
function todosLosErrores(banco) {
  const pares = [];
  for (const item of banco.items) {
    for (const c of banco.categorias) {
      if (c.id !== item.respuesta) pares.push([item, c.id]);
    }
  }
  return pares;
}

test("los cinco bancos traen la forma que PrimeraClasificacion consume", () => {
  assert.equal(BANCOS_CLASIFICACION.length, 5);
  for (const b of BANCOS_CLASIFICACION) {
    assert.ok(b.pregunta?.endsWith("?"), `${b.subtema}: sin rótulo de pregunta`);
    assert.ok(b.porPartida >= 1, `${b.subtema}: sin porPartida`);
    assert.ok(typeof b.retro === "function", `${b.subtema}: sin retro`);
    assert.ok(b.items.length >= b.porPartida,
      `${b.subtema}: sortea ${b.porPartida} de ${b.items.length} — no alcanzan`);
    const ids = b.items.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length, `${b.subtema}: ids repetidos`);
    const categorias = new Set(b.categorias.map((c) => c.id));
    for (const i of b.items) {
      assert.ok(typeof i.texto === "string" && i.texto.length > 0, `${i.id}: sin texto`);
      assert.ok(categorias.has(i.respuesta), `${i.id}: responde «${i.respuesta}», que no es una categoría`);
    }
  }
});

test("★ NINGUNA combinación de ítem y error se queda sin devolución", () => {
  /*
   * Exactamente el agujero que quedó abierto en el Comité de NOVA: había diez
   * combinaciones sin texto y solo se vieron enumerándolas. Aquí son 176.
   */
  let combinaciones = 0;
  for (const b of BANCOS_CLASIFICACION) {
    for (const item of b.items) {
      const bien = b.retro(item, item.respuesta);
      /*
       * El umbral es bajo a propósito: el acierto de CU-9 es «✅ Activo.» y así
       * tiene que ser — es un ejercicio de velocidad y una explicación larga le
       * rompería el ritmo. Lo que sí se exige es que no quede un hueco de
       * plantilla sin rellenar, que es el fallo que de verdad llega a pantalla.
       */
      assert.ok(typeof bien === "string" && bien.length > 5, `${item.id}: acierto sin texto`);
      assert.ok(bien.startsWith("✅"), `${item.id}: el acierto no se ve como acierto`);
      assert.ok(!/\{[a-zA-Z]+\}/.test(bien), `${item.id}: el acierto llegó con un hueco sin rellenar — ${bien}`);
    }
    for (const [item, elegida] of todosLosErrores(b)) {
      const mal = b.retro(item, elegida);
      combinaciones += 1;
      assert.ok(typeof mal === "string" && mal.length > 10,
        `${item.id} respondido «${elegida}»: la pantalla se quedaría muda`);
      assert.ok(mal.startsWith("❌"), `${item.id} respondido «${elegida}»: el error no se ve como error`);
      assert.ok(!/\{[a-zA-Z]+\}/.test(mal), `${item.id} respondido «${elegida}»: quedó un hueco sin rellenar — ${mal}`);
    }
  }
  /* 10×1 + 12×2 + 12×1 + 10×1 + 24×5 = 10 + 24 + 12 + 10 + 120 = 176. */
  assert.equal(combinaciones, 176, "cambió el número de combinaciones; revisa que siga cubierto");
});

test("★ ninguna devolución le habla al estudiante de OTRA cuenta", () => {
  /*
   * LA PRUEBA QUE NACIÓ DE UN ERROR REAL. Dos explicaciones de CU-9 hablan de
   * una cuenta concreta —«Renta por servicios» y «Servicios públicos»— y
   * estaban guardadas bajo una llave de familia. Resultado: quien fallaba
   * «Gastos por salarios» leía una explicación sobre «Servicios públicos».
   * Daba verde en todo y solo se vio jugándolo.
   *
   * Esto lo generaliza: si un texto cita una cuenta del catálogo entre
   * comillas angulares, tiene que ser la cuenta del ítem que se está
   * respondiendo. Vale para los cinco bancos y para los que vengan.
   */
  const delCatalogo = new Set(Object.keys(CUENTAS));
  for (const b of BANCOS_CLASIFICACION) {
    for (const [item, elegida] of [...todosLosErrores(b), ...b.items.map((i) => [i, i.respuesta])]) {
      const texto = b.retro(item, elegida);
      for (const [, citada] of texto.matchAll(/«([^»]+)»/g)) {
        if (!delCatalogo.has(citada)) continue;
        const suya = item.cuenta ?? item.texto;
        assert.equal(citada, suya,
          `${item.id} («${suya}») respondido «${elegida}»: le habla de «${citada}», que es otra cuenta`);
      }
    }
  }
});

/* ─────────────────────────── CU-1 ─────────────────────────── */

test("CU-1: el enunciado y la respuesta salen del banco de la ficha", () => {
  const b = BANCO_IZQUIERDA_O_DERECHA;
  assert.equal(b.items.length, 10);
  const caja = b.items.find((i) => i.id === "cu1-01");
  assert.equal(caja.texto, "Caja aumenta");
  assert.equal(caja.respuesta, DEBE);
  /* Y cada ítem responde lo que dicen las dos reglas, no lo que diga una tabla. */
  for (const i of b.items) {
    const esperado = i.texto.endsWith("aumenta") ? CRECE_POR[tipoDeCuenta(i.cuenta)] : null;
    if (esperado) assert.equal(i.respuesta, esperado, `${i.id}: contradice CRECE_POR`);
  }
});

/* ─────────────────────────── CU-2 ─────────────────────────── */

test("CU-2: las doce cuentas responden lo que dice el catálogo", () => {
  const b = BANCO_DE_QUE_FAMILIA;
  assert.equal(b.items.length, 12);
  for (const i of b.items) {
    assert.equal(i.respuesta, tipoDeCuenta(i.texto),
      `${i.id}: «${i.texto}» se clasifica distinto que en el catálogo`);
  }
});

test("★ CU-2: la explicación es la de la familia CORRECTA, no la de la elegida", () => {
  /*
   * Las seis confusiones están guardadas bajo «correcta>elegida». Buscarlas al
   * revés devuelve un texto que existe, empieza por ❌ y se lee perfectamente
   * —pero le dice a quien confundió un activo con un pasivo que «aquí lo debe,
   * eso es un pasivo»—. Ninguna de las pruebas de forma lo nota: hay que mirar
   * lo que el texto AFIRMA.
   */
  const b = BANCO_DE_QUE_FAMILIA;
  for (const [item, elegida] of todosLosErrores(b)) {
    const texto = b.retro(item, elegida).toLowerCase();
    assert.ok(texto.includes(NOMBRE_TIPO[item.respuesta].toLowerCase()),
      `${item.id} respondido «${elegida}»: la explicación no nombra la familia correcta — ${texto}`);
  }
});

/* ─────────────────────────── CU-3 ─────────────────────────── */

test("CU-3: doce combinaciones, seis familias por dos lados", () => {
  assert.equal(COMBINACIONES.length, 12);
  assert.equal(new Set(COMBINACIONES.map((c) => c.tipo)).size, 6);
  assert.equal(COMBINACIONES.filter((c) => c.lado === DEBE).length, 6);
  assert.equal(COMBINACIONES.filter((c) => c.lado === HABER).length, 6);
});

test("CU-3 ★ la respuesta se DERIVA de las dos reglas, no se teclea", () => {
  /*
   * Lo que protege esto: que la actividad y la pieza de Aprender enseñen lo
   * mismo. Las dos salen de CRECE_POR, así que no pueden separarse.
   */
  for (const c of COMBINACIONES) {
    assert.equal(c.respuesta, efectoDe(c.tipo, c.lado), `${c.id}`);
    assert.equal(c.respuesta, CRECE_POR[c.tipo] === c.lado ? "aumenta" : "disminuye");
  }
  const ingresoAlDebe = COMBINACIONES.find((c) => c.tipo === INGRESO && c.lado === DEBE);
  assert.equal(ingresoAlDebe.respuesta, "disminuye", "el que más se falla del tema");
});

test("CU-3: el enunciado nombra el lado y la familia de la combinación", () => {
  for (const c of COMBINACIONES) {
    assert.match(c.texto, c.lado === DEBE ? /^Un débito/ : /^Un crédito/, `${c.id}`);
    assert.ok(c.texto.endsWith(NOMBRE_TIPO[c.tipo]), `${c.id}: no nombra la familia`);
  }
  /* Y su acierto es el que escribió Gen para esa casilla del cuadro. */
  const gasto = COMBINACIONES.find((c) => c.tipo === "gasto" && c.lado === DEBE);
  assert.equal(BANCO_CUADRO_DINAMICAS.retro(gasto, "aumenta"), CUADRO_DINAMICAS.acierto["gasto>debe"]);
});

/* ─────────────────────────── CU-4 ─────────────────────────── */

test("CU-4: el enunciado lleva pegada la cuenta por la que se pregunta", () => {
  const b = BANCO_DEBITA_O_ACREDITA;
  assert.equal(b.items.length, 10);
  for (const i of b.items) {
    assert.ok(i.texto.includes(i.cuenta),
      `${i.id}: sin la cuenta, «${i.enunciado}» tiene dos respuestas buenas`);
  }
});

test("CU-4: el ítem de los ingresos recibe la explicación de la ficha", () => {
  const b = BANCO_DEBITA_O_ACREDITA;
  const ingreso = b.items.find((i) => tipoDeCuenta(i.cuenta) === INGRESO);
  assert.ok(ingreso, "el ítem de ingresos es el que más se falla; no puede faltar");
  const otro = b.categorias.find((c) => c.id !== ingreso.respuesta).id;
  assert.equal(b.retro(ingreso, otro), DEBITA_O_ACREDITA.errorIngreso);
});

test("CU-4: los otros nueve caen en el genérico — PENDIENTE DE GEN", () => {
  /*
   * Esta prueba NO dice que esté bien: deja constancia de que hay nueve ítems
   * sin explicación escrita, para que se vea cuando Gen las entregue.
   */
  const b = BANCO_DEBITA_O_ACREDITA;
  const sinExplicacion = b.items.filter((i) => tipoDeCuenta(i.cuenta) !== INGRESO);
  assert.equal(sinExplicacion.length, 9);
  for (const i of sinExplicacion) {
    const otro = b.categorias.find((c) => c.id !== i.respuesta).id;
    assert.match(b.retro(i, otro), /^❌ Es (Débito|Crédito), no (Débito|Crédito)\.$/, i.id);
  }
});

/* ─────────────────────────── CU-9 ─────────────────────────── */

test("CU-9: veinticuatro cuentas, y la familia sale del catálogo", () => {
  const b = BANCO_CORRIENTE_DE_CUENTAS;
  assert.equal(b.items.length, 24);
  assert.equal(b.porPartida, 12);
  for (const i of b.items) assert.equal(i.respuesta, tipoDeCuenta(i.cuenta), i.id);
});

test("CU-9: los ids son legibles, para que el panel docente diga algo", () => {
  const b = BANCO_CORRIENTE_DE_CUENTAS;
  assert.ok(b.items.some((i) => i.id === "cu9-equipos-de-oficina"));
  assert.equal(slug("Equipo de computación"), "equipo-de-computacion");
  assert.equal(slug("Inventario de mercancías"), "inventario-de-mercancias");
  for (const i of b.items) assert.match(i.id, /^cu9-[a-z0-9-]+$/, `${i.id}: id con caracteres raros`);
});

test("CU-9: los tres pares confundibles llevan su explicación, no la genérica", () => {
  const b = BANCO_CORRIENTE_DE_CUENTAS;
  const renta = b.items.find((i) => i.cuenta === "Renta por servicios");
  assert.match(b.retro(renta, "activo"), /«Renta por servicios» es lo que la empresa ganó/);
  const publicos = b.items.find((i) => i.cuenta === "Servicios públicos");
  assert.match(b.retro(publicos, "pasivo"), /«Servicios públicos por pagar»/);
  /* Y una que no está reforzada cae en la genérica, ya rellenada. */
  const terreno = b.items.find((i) => i.cuenta === "Terreno");
  assert.equal(b.retro(terreno, "gasto"), "❌ Es Activo, no Gasto.");
});
