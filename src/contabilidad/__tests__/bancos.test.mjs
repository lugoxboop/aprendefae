import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BANCOS_CLASIFICACION, COMBINACIONES, slug,
  BANCO_IZQUIERDA_O_DERECHA, BANCO_DE_QUE_FAMILIA, BANCO_CUADRO_DINAMICAS,
  BANCO_DEBITA_O_ACREDITA, BANCO_CORRIENTE_DE_CUENTAS,
} from "../bancos.js";
import { CRECE_POR, efectoDe, tipoDeCuenta, NOMBRE_TIPO, CUENTAS, DEBE, HABER, INGRESO } from "../../data/contabilidad.js";
import { CUADRO_DINAMICAS, DEBITA_O_ACREDITA, DE_QUE_FAMILIA, IZQUIERDA_O_DERECHA } from "../../data/contabilidadActividades.js";
import { escenaDe } from "../../components/mecanicas/libros/PredecirLaBarra.jsx";

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

test("★ CU-1: qué patrón sale lo decide el ENUNCIADO, no el ítem", () => {
  /*
   * Con dos lados, cualquier fallo es «el otro», así que sin esta distinción
   * las dos situaciones recibirían la misma frase — y son dos problemas
   * distintos: uno es no saberse dónde vive la familia y el otro es no haber
   * leído que pedían disminuir.
   */
  const b = BANCO_IZQUIERDA_O_DERECHA;
  let conA = 0;
  let conB = 0;
  for (const item of b.items) {
    const otro = item.categoria === DEBE ? HABER : DEBE;
    const { ok, texto } = b.evaluar(item, otro);
    assert.equal(ok, false, item.id);
    assert.ok(!/\{[a-zA-Z]+\}/.test(texto), `${item.id}: hueco sin rellenar — ${texto}`);
    if (/\baumenta\b/.test(item.enunciado)) {
      assert.match(texto, /^❌ Mire lo que pasó/, `${item.id}: un «aumenta» no recibió el patrón A`);
      conA += 1;
    } else {
      assert.equal(texto, IZQUIERDA_O_DERECHA.errorB, `${item.id}: un «disminuye» no recibió el patrón B`);
      conB += 1;
    }
  }
  assert.ok(conA >= 4 && conB >= 4, `el banco dejó de tener las dos direcciones: ${conA} y ${conB}`);
});

test("★ CU-1: el patrón A nombra la familia de ESA cuenta y su lado natural", () => {
  /*
   * El texto lleva dos huecos y los dos salen de las reglas, no de una tabla:
   * si se rellenaran mal, el estudiante leería que los pasivos viven en el
   * debe y nada fallaría.
   */
  const b = BANCO_IZQUIERDA_O_DERECHA;
  const casos = [
    ["cu1-01", "Los activos", "el debe"],
    ["cu1-05", "Los pasivos", "el haber"],
    ["cu1-09", "Los pasivos", "el haber"],
  ];
  for (const [id, familia, lado] of casos) {
    const item = b.items.find((i) => i.id === id);
    assert.ok(/\baumenta\b/.test(item.enunciado), `${id} dejó de ser un «aumenta»`);
    const otro = item.categoria === DEBE ? HABER : DEBE;
    const { texto } = b.evaluar(item, otro);
    assert.ok(texto.includes(familia), `${id}: no dice «${familia}» — ${texto}`);
    assert.ok(texto.includes(lado), `${id}: no dice «${lado}» — ${texto}`);
  }
});

test("★ CU-1: acertar da el acierto que escribió Gen para ese ítem", () => {
  const b = BANCO_IZQUIERDA_O_DERECHA;
  for (const item of b.items) {
    const r = b.evaluar(item, item.categoria);
    assert.ok(r.ok, item.id);
    assert.equal(r.texto, item.acierto, item.id);
    assert.ok(r.texto.startsWith("✅"), item.id);
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

test("★ CU-2: cada patrón de error sale SOLO donde su texto es verdad", () => {
  /*
   * El patrón A dice «ahí van las cosas que la empresa debe, y esta es algo
   * que tiene»: eso solo es cierto al escribir un ACTIVO entre los pasivos. En
   * cualquier otra dirección afirmaría lo contrario de lo que pasó, que es
   * peor que no decir nada.
   *
   * El patrón B habla de las dos secciones de la derecha, así que vale entre
   * pasivo y patrimonio en las dos direcciones.
   *
   * Y las tres direcciones que ninguno cubre reciben el texto anterior de Gen,
   * que sí nombra la familia correcta. Aquí se comprueban las tres cosas.
   */
  const b = BANCO_DE_QUE_FAMILIA;
  const derecha = new Set(["pasivo", "patrimonio"]);
  let conA = 0;
  let conB = 0;
  for (const [item, elegida] of todosLosErrores(b)) {
    const { texto } = b.evaluar(item, elegida);
    const correcta = item.respuesta;
    if (derecha.has(correcta) && derecha.has(elegida)) {
      assert.equal(texto, DE_QUE_FAMILIA.errorB, `${item.id} → ${elegida}`);
      conB += 1;
    } else if (correcta === "activo" && elegida === "pasivo") {
      assert.equal(texto, DE_QUE_FAMILIA.errorA, `${item.id} → ${elegida}`);
      conA += 1;
    } else {
      /* El respaldo por dirección: ese sí nombra la familia que era. */
      assert.ok(texto.toLowerCase().includes(NOMBRE_TIPO[correcta].toLowerCase()),
        `${item.id} → ${elegida}: no nombra la familia correcta — ${texto}`);
    }
  }
  assert.ok(conA >= 6, `el patrón A no salió en ningún activo: ${conA}`);
  assert.ok(conB >= 4, `el patrón B no salió entre las dos de la derecha: ${conB}`);
});

test("★ CU-2: el patrón A NUNCA sale en la dirección contraria", () => {
  /*
   * La otra mitad de lo mismo, dicha al revés porque es el error que de verdad
   * haría daño: decirle «esta es algo que tiene» a quien acaba de escribir una
   * deuda entre los activos.
   */
  const b = BANCO_DE_QUE_FAMILIA;
  for (const [item, elegida] of todosLosErrores(b)) {
    if (item.respuesta === "activo" && elegida === "pasivo") continue;
    assert.notEqual(b.evaluar(item, elegida).texto, DE_QUE_FAMILIA.errorA,
      `${item.id} → ${elegida}: el patrón A dice lo contrario de lo que pasó`);
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

test("★ CU-3: las doce combinaciones se predicen bien y los dos patrones reparten", () => {
  /*
   * La predicción solo puede fallar de dos maneras, y cada una tiene su texto.
   * Se enumeran las doce combinaciones por las dos predicciones posibles: 24
   * caminos, ninguno mudo, ninguno con un hueco sin rellenar.
   */
  const b = BANCO_CUADRO_DINAMICAS;
  let caminos = 0;
  let conA = 0;
  let conB = 0;
  for (const item of COMBINACIONES) {
    const escena = escenaDe(item);
    /* La escena tiene que coincidir con las dos reglas, no inventarse nada. */
    assert.equal(escena.ladoDelSaldo, CRECE_POR[item.tipo], `${item.id}: el saldo previo no vive donde debe`);
    assert.equal(escena.esperado, efectoDe(item.tipo, item.lado) === "aumenta" ? "sube" : "baja", item.id);

    for (const prediccion of ["sube", "baja"]) {
      const r = b.evaluar(item, prediccion, escena);
      assert.equal(r.ok, prediccion === escena.esperado, item.id);
      assert.ok(r.texto.startsWith(r.ok ? "✅" : "❌"), `${item.id} · ${prediccion}: no se ve como lo que es`);
      assert.ok(!/\{[a-zA-Z]+\}/.test(r.texto), `${item.id} · ${prediccion}: hueco sin rellenar — ${r.texto}`);
      if (!r.ok && escena.esperado === "baja") { assert.equal(r.texto, CUADRO_DINAMICAS.errorA.replace("{lado}", escena.ladoDelSaldo === DEBE ? "el debe" : "el haber")); conA += 1; }
      if (!r.ok && escena.esperado === "sube") { assert.equal(r.texto, CUADRO_DINAMICAS.errorB); conB += 1; }
      caminos += 1;
    }
  }
  assert.equal(caminos, 24, "12 combinaciones × 2 predicciones");
  assert.equal(conA, 6, "seis combinaciones bajan");
  assert.equal(conB, 6, "seis suben");
});

test("★ CU-3: el patrón A dice dónde estaba el saldo, y acierta el lado", () => {
  const b = BANCO_CUADRO_DINAMICAS;
  /* Un activo: su saldo vive en el debe. Un ingreso: en el haber. */
  const activo = COMBINACIONES.find((c) => c.tipo === "activo" && c.lado === HABER);
  const ingreso = COMBINACIONES.find((c) => c.tipo === "ingreso" && c.lado === DEBE);
  assert.ok(b.evaluar(activo, "sube", escenaDe(activo)).texto.includes("en el debe"));
  assert.ok(b.evaluar(ingreso, "sube", escenaDe(ingreso)).texto.includes("en el haber"));
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

test("★ CU-4: el hueco se cerró — los nueve reciben el patrón A con SU cuenta", () => {
  /*
   * Esta prueba era la constancia de un hueco: nueve ítems sin explicación
   * escrita, con un genérico mío de relleno. El rediseño trajo el texto de Gen
   * y el hueco se cerró, así que ahora vigila lo contrario: que cada uno reciba
   * el patrón A, y que el patrón nombre LA CUENTA POR LA QUE SE PREGUNTÓ — es
   * lo que devuelve al estudiante a su pregunta en vez de a la otra mitad.
   */
  const b = BANCO_DEBITA_O_ACREDITA;
  const conPatron = b.items.filter((i) => tipoDeCuenta(i.cuenta) !== INGRESO);
  assert.equal(conPatron.length, 9);
  for (const i of conPatron) {
    const otro = i.categoria === DEBE ? HABER : DEBE;
    const { texto } = b.evaluar(i, otro);
    assert.match(texto, /^❌ Se fijó en la otra mitad del asiento/, i.id);
    assert.ok(texto.includes(i.cuenta), `${i.id}: no nombra «${i.cuenta}» — ${texto}`);
    assert.ok(!/\{[a-zA-Z]+\}/.test(texto), `${i.id}: hueco sin rellenar`);
  }
});

test("★ CU-4: la contrapartida de cada ítem existe y no es la misma cuenta", () => {
  /*
   * La contrapartida es la que se materializa al acertar: es el momento en que
   * la partida doble deja de ser una frase y se ve. Si alguna faltara, ese
   * momento no llegaría y nada más fallaría.
   */
  const b = BANCO_DEBITA_O_ACREDITA;
  for (const i of b.items) {
    assert.ok(i.contrapartida, `${i.id}: sin contrapartida`);
    assert.notEqual(i.contrapartida, i.cuenta, `${i.id}: la contrapartida es la misma cuenta`);
    assert.ok(tipoDeCuenta(i.contrapartida), `${i.id}: «${i.contrapartida}» no está en el catálogo`);
  }
  /* El único caso donde la contrapartida NO es dinero: «a crédito». */
  const aCredito = b.items.find((i) => i.id === "cu4-04");
  assert.equal(aCredito.contrapartida, "Cuentas por cobrar",
    "el caso que enseña que «a crédito» significa que el dinero no llegó todavía");
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
