import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  LINEAS, FUERA_DEL_ESTADO, OPERACIONALES, SUBTEMAS,
  BANDEJAS, COMUNICADOS, ERROR_BANDEJA, errorDeComunicado,
  MEDIDAS_LINEA, REGLAS_ERROR_LINEA, errorDeLinea,
  PERSONAS, MEDIDAS_INCIDENCIA, PATRONES_GIRA, PATRONES_SOPORTA, errorGira, errorSoporta,
  ESCENARIOS, TEXTO_CIERRE,
} from "../../data/nova.js";
import {
  ETAPAS, PUNTOS_POR_ETAPA, TOTAL_PUNTOS, DIFICULTAD, ACTIVIDAD_NOVA,
  puntuarDesafio, pctDeItems, pctDeDecisiones, ITEMS_POR_ETAPA,
} from "../puntuacion.js";
import { VALORES_INICIALES, calcularEstado, cascadaDe, EFECTOS, TARIFA_INICIAL, TARIFA_SUBIDA, aplicarEfecto } from "../estado.js";
import { SUBJECTS, HACER } from "../../data/subjects.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL COMITÉ DE NOVA — el contenido y la cuenta, sin montar la interfaz.
 *
 * Lo que de verdad defiende este archivo es la Etapa 3: seis medidas × dos
 * preguntas × cinco opciones son sesenta combinaciones, y basta con que UNA se
 * quede sin texto para que un estudiante se quede mirando un hueco justo
 * después de equivocarse. Se enumeran las sesenta, una por una.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ids = (xs) => xs.map((x) => x.id);

/* ─────────────────────────────── la cuenta ─────────────────────────────── */

test("la regla del Kit: experto × 4 etapas = 360, repartidos 20/25/25/30", () => {
  assert.equal(DIFICULTAD, "experto");
  assert.equal(TOTAL_PUNTOS, 360);
  assert.equal(ETAPAS.length, 4);
  assert.deepEqual(ETAPAS.map((e) => e.peso), [0.2, 0.25, 0.25, 0.3]);
  /* Los pesos suman uno: si no, el desafío no valdría sus 360. */
  assert.equal(ETAPAS.reduce((s, e) => s + e.peso, 0), 1);
  assert.deepEqual(PUNTOS_POR_ETAPA.map((e) => e.puntos), [72, 90, 90, 108]);
  assert.equal(PUNTOS_POR_ETAPA.reduce((s, e) => s + e.puntos, 0), 360);
});

test("puntuarDesafio: las cuatro al 100 dan 360 y 100 %, y una sin jugar no suma", () => {
  assert.equal(puntuarDesafio([100, 100, 100, 100]).puntos, 360);
  assert.equal(puntuarDesafio([100, 100, 100, 100]).pct, 100);
  assert.equal(puntuarDesafio([null, null, null, null]).puntos, 0);
  /* Solo la primera: 20 % del total, ni un punto más. */
  assert.equal(puntuarDesafio([100, null, null, null]).puntos, 72);
  /* La cuarta pesa más que la primera, que es todo el sentido del reparto. */
  assert.ok(puntuarDesafio([null, null, null, 100]).puntos > puntuarDesafio([100, null, null, null]).puntos);
});

test("un porcentaje fuera de rango no rompe la cuenta", () => {
  assert.equal(puntuarDesafio([300, 0, 0, 0]).puntos, 72);
  assert.equal(puntuarDesafio([-50, 0, 0, 0]).puntos, 0);
});

test("ocho ítems valen 12,5 % cada uno, y las tres decisiones pesan lo mismo", () => {
  assert.equal(ITEMS_POR_ETAPA, 8);
  assert.equal(pctDeItems(8), 100);
  assert.equal(pctDeItems(1), 13);       // 12,5 redondeado
  assert.equal(pctDeItems(4), 50);
  assert.equal(pctDeItems(0), 0);
  assert.equal(pctDeDecisiones([100, 100, 100]), 100);
  assert.equal(pctDeDecisiones([100, 0, 0]), 33);
  assert.equal(pctDeDecisiones([0, 100, 0]), 33, "ninguna decisión pesa más que otra");
  assert.equal(pctDeDecisiones([100, 50, 25]), 58);
});

/* ────────────────────────── el estado de resultados ────────────────────────── */

test("las cifras del caso cuadran: las dos utilidades son restas, no datos", () => {
  const e = calcularEstado();
  assert.equal(e.ventas, 10000);
  assert.equal(e.costos, 5800);
  assert.equal(e.admin, 2000);
  assert.equal(e.operacional, 2200, "10.000 − 5.800 − 2.000");
  assert.equal(e.financieros, 0);
  assert.equal(e.impuestos, 660);
  assert.equal(e.neta, 1540, "2.200 − 0 − 660");
  /* Y los 660 son exactamente el 30 % de la utilidad operacional. */
  assert.equal(e.impuestos, Math.round(e.operacional * TARIFA_INICIAL));
});

test("gastos financieros arranca en cero y apagada: es la única que duerme", () => {
  const dormidas = LINEAS.filter((l) => l.dormida);
  assert.deepEqual(ids(dormidas), ["financieros"]);
  assert.equal(VALORES_INICIALES.financieros, 0);
  /* Y la única medida del banco que la mueve es la del costo del crédito. */
  const laDespiertan = MEDIDAS_LINEA.filter((m) => m.linea === "financieros");
  assert.equal(laDespiertan.length, 1);
  assert.equal(laDespiertan[0].id, "l08");
});

test("empleados e inversión NO son líneas del estado", () => {
  const enElEstado = new Set(ids(LINEAS));
  for (const d of FUERA_DEL_ESTADO) assert.ok(!enElEstado.has(d.id), `${d.id} no va dentro del estado`);
  assert.deepEqual(ids(FUERA_DEL_ESTADO), ["empleados", "inversion"]);
  assert.equal(FUERA_DEL_ESTADO.find((d) => d.id === "empleados").valor, 180);
  assert.equal(FUERA_DEL_ESTADO.find((d) => d.id === "inversion").valor, 800);
});

test("la cascada va de la causa al resultado, y la utilidad neta no arrastra a nadie", () => {
  assert.deepEqual(cascadaDe("ventas"), ["operacional", "neta"]);
  assert.deepEqual(cascadaDe("costos"), ["operacional", "neta"]);
  assert.deepEqual(cascadaDe("admin"), ["operacional", "neta"]);
  assert.deepEqual(cascadaDe("impuestos"), ["neta"]);
  assert.deepEqual(cascadaDe("financieros"), ["neta"]);
  assert.deepEqual(cascadaDe("operacional"), ["neta"]);
  assert.deepEqual(cascadaDe("neta"), [], "el resultado no mueve nada: es el final");
});

test("el único valor deducible del banco sale del propio texto de Gen", () => {
  /* La tarifa 30 % → 35 % la fija el escenario A de la Etapa 4. */
  assert.equal(TARIFA_SUBIDA, 0.35);
  assert.match(ESCENARIOS.find((e) => e.id === "a").caso, /del 30% al 35%/);
  assert.equal(EFECTOS.l01.valor, 770, "35 % de 2.200");
  assert.equal(EFECTOS.l01.valor, Math.round(2200 * TARIFA_SUBIDA));

  const despues = aplicarEfecto(calcularEstado(), "l01");
  assert.equal(despues.impuestos, 770);
  assert.equal(despues.operacional, 2200, "la operación no cambia: es el contenido de la medida");
  assert.equal(despues.neta, 1430, "2.200 − 770");
});

test("las otras once medidas declaran dirección, NO una cifra inventada", () => {
  const conCifra = Object.entries(EFECTOS).filter(([, e]) => typeof e.valor === "number");
  assert.deepEqual(conCifra.map(([id]) => id), ["l01"], "solo la deducible");
  for (const [id, efecto] of Object.entries(EFECTOS)) {
    assert.ok(["sube", "baja"].includes(efecto.direccion), `${id} sin dirección`);
    assert.ok(ids(LINEAS).includes(efecto.linea), `${id} apunta a una línea que no existe`);
  }
  /* Y sin cifra, aplicar el efecto deja el estado intacto en vez de adivinar. */
  assert.deepEqual(aplicarEfecto(calcularEstado(), "l03"), calcularEstado());
});

/* ───────────────────────────────── ETAPA 1 ───────────────────────────────── */

test("el banco son 14 comunicados con id único y tres bandejas", () => {
  assert.equal(COMUNICADOS.length, 14);
  assert.equal(new Set(ids(COMUNICADOS)).size, 14);
  assert.deepEqual(ids(BANDEJAS), ["cobra", "gasta", "presta"]);
  /* Cinco cobra, cinco gasta, cuatro pide prestado: ninguna bandeja queda vacía. */
  for (const b of ids(BANDEJAS)) {
    assert.ok(COMUNICADOS.filter((c) => c.bandeja === b).length >= 4, `${b} tiene muy pocos`);
  }
  assert.ok(COMUNICADOS.length >= ITEMS_POR_ETAPA, "no se pueden sortear ocho de menos de ocho");
});

test("los 14 traen su texto de acierto, y ninguno se quedó sin bandeja", () => {
  for (const c of COMUNICADOS) {
    assert.ok(c.texto?.length > 20, `${c.id} sin enunciado`);
    assert.ok(ids(BANDEJAS).includes(c.bandeja), `${c.id} con bandeja desconocida`);
    assert.ok(c.acierto?.startsWith("✅"), `${c.id} sin retroalimentación de acierto`);
  }
});

test("ETAPA 1 · las 28 equivocaciones posibles tienen texto: 14 medidas × 2 bandejas malas", () => {
  let contadas = 0;
  for (const c of COMUNICADOS) {
    for (const b of ids(BANDEJAS)) {
      if (b === c.bandeja) continue;
      const texto = errorDeComunicado(c, b);
      assert.ok(texto && texto.startsWith("❌"), `sin error: ${c.id} → ${b}`);
      contadas += 1;
    }
  }
  assert.equal(contadas, 28);
  /* Las seis combinaciones de bandejas están escritas, no derivadas de cuatro. */
  assert.equal(Object.keys(ERROR_BANDEJA).length, 6);
});

test("los dos errores propios ganan al patrón, que es para lo que están", () => {
  const deduccion = COMUNICADOS.find((c) => c.id === "c02");
  const bid = COMUNICADOS.find((c) => c.id === "c12");
  assert.match(errorDeComunicado(deduccion, "gasta"), /renunciando a cobrar/);
  assert.notEqual(errorDeComunicado(deduccion, "gasta"), ERROR_BANDEJA["cobra>gasta"]);
  assert.match(errorDeComunicado(bid, "gasta"), /cómo consiguió la plata/);
  assert.notEqual(errorDeComunicado(bid, "gasta"), ERROR_BANDEJA["presta>gasta"]);
});

/* ───────────────────────────────── ETAPA 2 ───────────────────────────────── */

test("el banco son 12 medidas, cada una apuntando a una línea que existe", () => {
  assert.equal(MEDIDAS_LINEA.length, 12);
  assert.equal(new Set(ids(MEDIDAS_LINEA)).size, 12);
  const existen = new Set(ids(LINEAS));
  for (const m of MEDIDAS_LINEA) {
    assert.ok(existen.has(m.linea), `${m.id} apunta a ${m.linea}`);
    assert.ok(m.acierto?.startsWith("✅"), `${m.id} sin acierto`);
  }
});

test("ninguna medida tiene por respuesta una línea que es una resta", () => {
  const derivadas = new Set(ids(LINEAS.filter((l) => l.derivada)));
  assert.deepEqual([...derivadas].sort(), ["neta", "operacional"]);
  for (const m of MEDIDAS_LINEA) {
    assert.ok(!derivadas.has(m.linea), `${m.id} responde una utilidad, que nunca se mueve sola`);
  }
});

/*
 * LA MATRIZ DE LA ETAPA 2, ENTERA Y A LA VISTA.
 *
 * Cuatro líneas pueden ser la respuesta y siete se pueden tocar: 24
 * equivocaciones posibles. La ficha de Gen cubre 14 con sus seis reglas; las
 * otras 10 NO están escritas, y esta prueba las congela con nombre y apellido.
 *
 * Si alguien escribe una de las diez, esta prueba falla y hay que quitarla de
 * la lista: es exactamente lo que queremos que pase. Y si alguien añade una
 * medida cuya línea correcta abre combinaciones nuevas, también falla.
 */
const SIN_ERROR_ESCRITO = [
  "impuestos>ventas", "impuestos>admin", "impuestos>financieros",
  "ventas>costos", "ventas>admin", "ventas>financieros",
  "costos>impuestos", "costos>admin", "costos>financieros",
  "financieros>impuestos",
];

test("ETAPA 2 · la matriz de 24 errores: 14 con texto y 10 que Gen no ha escrito", () => {
  const correctas = [...new Set(MEDIDAS_LINEA.map((m) => m.linea))].sort();
  assert.deepEqual(correctas, ["costos", "financieros", "impuestos", "ventas"]);

  const conTexto = [];
  const sinTexto = [];
  for (const correcta of correctas) {
    for (const elegida of ids(LINEAS)) {
      if (elegida === correcta) continue;
      const texto = errorDeLinea(correcta, elegida);
      const clave = `${correcta}>${elegida}`;
      if (texto) {
        assert.ok(texto.startsWith("❌"), `${clave} no es un error`);
        conTexto.push(clave);
      } else {
        sinTexto.push(clave);
      }
    }
  }

  assert.equal(conTexto.length + sinTexto.length, 24, "cuatro respuestas × seis líneas restantes");
  assert.deepEqual(sinTexto.sort(), [...SIN_ERROR_ESCRITO].sort(), "cambió el hueco de la Etapa 2");
  assert.equal(conTexto.length, 14);
});

test("las dos reglas del resultado ganan a las de confusión, pase lo que pase", () => {
  /* Tocar una utilidad siempre da su propia explicación, sea cual sea la buena. */
  for (const correcta of ["ventas", "costos", "impuestos", "financieros"]) {
    assert.match(errorDeLinea(correcta, "neta"), /la utilidad neta es el resultado/i);
    assert.match(errorDeLinea(correcta, "operacional"), /tampoco se mueve sola/i);
  }
  assert.equal(REGLAS_ERROR_LINEA[0].id, "neta");
  assert.equal(REGLAS_ERROR_LINEA[1].id, "operacional");
});

test("la regla de gastos financieros cubre las tres líneas operacionales", () => {
  assert.deepEqual(OPERACIONALES, ["ventas", "costos", "admin"]);
  for (const op of OPERACIONALES) {
    assert.match(errorDeLinea("financieros", op), /no toca la operación/i);
  }
});

/* ───────────────────────────────── ETAPA 3 ───────────────────────────────── */

test("cinco opciones, y «Nadie» está en todas las medidas por regla estructural", () => {
  assert.equal(PERSONAS.length, 5);
  assert.deepEqual(ids(PERSONAS).sort(), ["consumidor", "dueno", "nadie", "nova", "trabajador"]);
  /*
   * No hay ninguna medida que declare su propio juego de opciones: las cinco
   * salen siempre de PERSONAS. Si «Nadie» apareciera solo en M5 y M6 —las dos
   * en que es la respuesta—, su presencia sería la respuesta.
   */
  for (const m of MEDIDAS_INCIDENCIA) {
    assert.ok(!m.opciones, `${m.id} se trajo sus propias opciones`);
  }
  const conNadie = MEDIDAS_INCIDENCIA.filter((m) => m.gira.correcta === "nadie");
  assert.deepEqual(ids(conNadie), ["m5", "m6"]);
});

test("NOVA nunca es la respuesta de la segunda pregunta, en ninguna medida", () => {
  assert.equal(MEDIDAS_INCIDENCIA.length, 6);
  for (const m of MEDIDAS_INCIDENCIA) {
    assert.notEqual(m.soporta.correcta, "nova", `${m.id}: una empresa no tiene bolsillo propio`);
  }
});

test("ETAPA 3 · las 60 combinaciones, una por una: 12 aciertos y 48 errores con texto", () => {
  let aciertos = 0;
  let errores = 0;
  const huecos = [];

  for (const m of MEDIDAS_INCIDENCIA) {
    for (const fase of ["gira", "soporta"]) {
      const bloque = m[fase];
      assert.ok(bloque.acierto?.startsWith("✅"), `${m.id}:${fase} sin acierto`);
      for (const p of PERSONAS) {
        if (p.id === bloque.correcta) {
          aciertos += 1;
          continue;
        }
        const texto = fase === "gira" ? errorGira(m, p.id) : errorSoporta(m, p.id);
        if (!texto || !texto.startsWith("❌")) huecos.push(`${m.id}:${fase}>${p.id}`);
        else errores += 1;
      }
    }
  }

  assert.deepEqual(huecos, [], "combinaciones sin retroalimentación");
  assert.equal(aciertos, 12, "seis medidas × dos preguntas");
  assert.equal(errores, 48, "y cuatro equivocaciones posibles en cada una");
  assert.equal(aciertos + errores, 60);
});

test("los patrones A y B se reparten «el dueño» sin pisarse", () => {
  /*
   * Elegir al dueño en la PRIMERA pregunta es una cosa u otra según la medida:
   * si el dueño es la respuesta de la segunda, el estudiante se adelantó (A);
   * si no, confundió la empresa con su dueño (B). Nunca las dos, y nunca
   * ninguna.
   */
  for (const m of MEDIDAS_INCIDENCIA.filter((x) => !x.gira.propios)) {
    const esperado = m.soporta.correcta === "dueno" ? PATRONES_GIRA.A : PATRONES_GIRA.B;
    assert.equal(errorGira(m, "dueno"), esperado, m.id);
  }
  assert.equal(errorGira(MEDIDAS_INCIDENCIA.find((m) => m.id === "m1"), "dueno"), PATRONES_GIRA.B);
  assert.equal(errorGira(MEDIDAS_INCIDENCIA.find((m) => m.id === "m3"), "dueno"), PATRONES_GIRA.A);
});

test("adelantarse a la incidencia económica se caza en las cuatro medidas con patrón", () => {
  for (const m of MEDIDAS_INCIDENCIA.filter((x) => !x.gira.propios)) {
    assert.equal(errorGira(m, m.soporta.correcta), PATRONES_GIRA.A, m.id);
  }
});

test("M5 y M6 no usan los patrones A–D: «Nadie» es su respuesta, no su error", () => {
  for (const id of ["m5", "m6"]) {
    const m = MEDIDAS_INCIDENCIA.find((x) => x.id === id);
    assert.equal(m.gira.correcta, "nadie");
    assert.equal(m.gira.propios, true);
    for (const p of PERSONAS.filter((x) => x.id !== "nadie")) {
      const texto = errorGira(m, p.id);
      assert.ok(texto?.startsWith("❌"), `${id}>${p.id}`);
      assert.ok(!Object.values(PATRONES_GIRA).includes(texto), `${id}>${p.id} cayó en un patrón`);
    }
  }
  /* Y el patrón D diría justo lo contrario de lo que pasa en esas dos. */
  assert.match(PATRONES_GIRA.D, /Aquí sí hay un impuesto/);
});

test("«NOVA» y «Nadie» en la segunda pregunta siempre son patrón, en las seis", () => {
  for (const m of MEDIDAS_INCIDENCIA) {
    assert.equal(errorSoporta(m, "nova"), PATRONES_SOPORTA.E, m.id);
    if (m.soporta.correcta !== "nadie") assert.equal(errorSoporta(m, "nadie"), PATRONES_SOPORTA.F, m.id);
  }
  assert.match(PATRONES_SOPORTA.E, /nunca es la respuesta de esta pregunta/);
});

/* ───────────────────────────────── ETAPA 4 ───────────────────────────────── */

test("dos escenarios, tres decisiones cada uno, y todas las opciones con texto", () => {
  assert.equal(ESCENARIOS.length, 2);
  assert.deepEqual(ids(ESCENARIOS), ["a", "b"]);
  for (const e of ESCENARIOS) {
    assert.equal(e.decisiones.length, 3, `${e.id} no tiene tres decisiones`);
    assert.ok(e.caso.length > 100, `${e.id} sin caso`);
    for (const d of e.decisiones) {
      assert.ok(d.pregunta?.endsWith("?"), `${d.id} no pregunta nada`);
      assert.ok(d.opciones.length >= 3, `${d.id} con muy pocas opciones`);
      for (const o of d.opciones) {
        assert.ok(o.texto?.length > 5, `${d.id}/${o.id} sin texto`);
        assert.ok(o.feedback?.length > 20, `${d.id}/${o.id} sin retroalimentación`);
        assert.ok(o.pct >= 0 && o.pct <= 100, `${d.id}/${o.id} con crédito fuera de rango`);
      }
    }
  }
});

test("cada decisión tiene UNA sola opción de crédito completo", () => {
  for (const e of ESCENARIOS) {
    for (const d of e.decisiones) {
      const plenas = d.opciones.filter((o) => o.pct === 100);
      assert.equal(plenas.length, 1, `${e.id}/${d.id} tiene ${plenas.length} respuestas correctas`);
      assert.ok(plenas[0].feedback.startsWith("✅"), `${e.id}/${d.id}: la buena no lleva ✅`);
    }
  }
});

test("el símbolo dice el crédito: ✅ es 100, 🟡 es parcial y ❌ es cero", () => {
  for (const e of ESCENARIOS) {
    for (const d of e.decisiones) {
      for (const o of d.opciones) {
        const esperado = o.pct === 100 ? "✅" : o.pct > 0 ? "🟡" : "❌";
        assert.ok(o.feedback.startsWith(esperado), `${e.id}/${d.id}/${o.id}: ${o.pct}% con otro símbolo`);
      }
    }
  }
});

test("el escenario A premia leer las tres medidas juntas", () => {
  const a = ESCENARIOS.find((e) => e.id === "a");
  const financiar = a.decisiones.find((d) => d.id === "a2");
  const propios = financiar.opciones.find((o) => o.id === "propios");
  const credito = financiar.opciones.find((o) => o.id === "credito");
  const mitad = financiar.opciones.find((o) => o.id === "mitad");
  assert.equal(propios.pct, 100);
  /* Mitad y mitad vale más que todo a crédito: menos plata cara, mismo resultado. */
  assert.ok(mitad.pct > credito.pct, "media jugada cara tiene que valer más que la entera");
});

test("el escenario B: la respuesta correcta es que no se puede saber", () => {
  const b = ESCENARIOS.find((e) => e.id === "b");
  const ventas = b.decisiones.find((d) => d.id === "b1");
  const buena = ventas.opciones.find((o) => o.pct === 100);
  assert.equal(buena.id, "no-se-sabe");
  assert.match(buena.texto, /No se puede saber sin más datos/);
});

/* ─────────────────────────────── el ancla y el cierre ─────────────────────────────── */

test("el ancla vive dentro de los textos, no en un rótulo aparte", () => {
  const todos = [
    ...COMUNICADOS.map((c) => c.acierto),
    ...Object.values(ERROR_BANDEJA),
    ...MEDIDAS_INCIDENCIA.map((m) => m.gira.acierto),
    TEXTO_CIERRE,
  ].join(" ").toLowerCase();
  /* «cobra, gasta o pide prestado» —y su forma en pasado en el cierre—. */
  assert.match(todos, /cobra, gasta o pide prestado/);
  assert.match(TEXTO_CIERRE.toLowerCase(), /cobró, gastó y pidió prestado/);
});

test("el texto de cierre es fijo y no menciona puntaje ni premio", () => {
  assert.ok(!/trofeo|corona|cofre|medalla|felicit/i.test(TEXTO_CIERRE));
  assert.ok(!/\d+\s*(FP|puntos|%)/i.test(TEXTO_CIERRE), "el cierre no depende del resultado");
});

test("las cuatro etapas llevan su subtema etiquetado", () => {
  assert.deepEqual(Object.keys(SUBTEMAS).map(Number), [1, 2, 3, 4]);
  assert.equal(SUBTEMAS[1], "Instrumentos de política fiscal");
  assert.equal(SUBTEMAS[2], "Impacto en estados financieros");
  assert.equal(SUBTEMAS[3], "Incidencia tributaria");
  assert.equal(SUBTEMAS[4], "Integración y decisión empresarial");
});

/* ───────────────────────── el nodo, fuera del camino ───────────────────────── */

test("el nodo está fuera del camino de Política Fiscal y no cuenta para el tema", () => {
  const tema = SUBJECTS.macroeconomia.topics.find((t) => t.id === "politica-fiscal");
  const nodo = tema.actividades.find((a) => a.id === ACTIVIDAD_NOVA);
  assert.ok(nodo, "el desafío no está declarado");
  assert.equal(nodo.nombre, "El Comité de NOVA");
  assert.equal(nodo.clasificacion.desafio, true, "sin esto se volvería la trece y bloquearía el tema");
  assert.equal(nodo.clasificacion.etapas, 4);
  assert.equal(nodo.clasificacion.fpBase, 90);
  assert.equal(nodo.clasificacion.dificultad, "experto");
  assert.equal(nodo.clasificacion.tipo, HACER);
});

test("no colisiona con ninguna otra actividad del sitio", () => {
  const todas = [];
  for (const materia of Object.values(SUBJECTS))
    for (const t of materia.topics)
      for (const a of t.actividades ?? []) todas.push(a.id);
  assert.equal(todas.filter((id) => id === ACTIVIDAD_NOVA).length, 1);
  assert.equal(new Set(todas).size, todas.length, "hay ids repetidos en el catálogo");
});

test("la 0041 mete la fila del desafío con sus cuatro etapas", () => {
  const sql = readFileSync("supabase/migrations/0041_desafio_comite_de_nova.sql", "utf8");
  assert.match(sql, /'comite-nova', 'macroeconomia', 'politica-fiscal', 'evaluativa', 'experto', 90, 4/);
  assert.match(sql, /on conflict \(activity_id\) do update/, "tiene que ser repetible");
  /* No toca nada más: ni funciones, ni tablas, ni filas de estudiantes. */
  assert.ok(!/create or replace function|alter table|drop |update public\.fp_|delete from/i.test(sql));
});
