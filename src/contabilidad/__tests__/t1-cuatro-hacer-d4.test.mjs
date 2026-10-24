import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SEGUNDA_T1_1, SEGUNDA_T1_2, SEGUNDA_T1_4, SEGUNDA_T1_5,
  USUARIOS_T1_1, EMPRESAS, TRANSACCIONES_CAP2, PARTES,
} from "../../data/contabilidadTema1.js";
import {
  opcionesSegundaT1_1, correctaSegundaT1_1, porqueSegundaT1_1,
  opcionesSegundaT1_2, correctaSegundaT1_2, porqueSegundaT1_2,
  opcionesSegundaT1_4, escenaSegundaT1_4, porqueSegundaT1_4, CORRECTA_SEGUNDA_T1_4,
  opcionesSegundaT1_5, correctaSegundaT1_5, escenaSegundaT1_5,
} from "../tema1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS CUATRO HACER DEL TEMA 1 · QUE SIGAN CUMPLIENDO D4 Y D6.
 *
 * Los cuatro cayeron en la auditoría por D4: una sola pregunta repetida ítem
 * tras ítem. Lo que los sube es una segunda decisión de TIPO distinto sobre el
 * mismo caso, y las dos cosas que la sostienen se pueden perder en un retoque
 * de datos sin que nada se rompa a la vista:
 *
 *   D4 Avanzado — «decisiones distintas producen resultados visibles
 *   distintos». Se guarda comparando las escenas PAREJA POR PAREJA. No vale
 *   «que no sean todas iguales»: eso dejó pasar un caso real en el que las dos
 *   opciones malas devolvían el mismo retrato —y encima el que ya había—, así
 *   que elegir una u otra no movía nada y la prueba decía verde porque la
 *   correcta sí era distinta.
 *
 *   D6 Avanzado — «al menos dos mensajes de error distintos, ligados a errores
 *   conceptualmente distintos». Cada opción mala trae su `msg`, ninguno
 *   repetido dentro de la misma decisión y ninguno genérico.
 *
 * Y la condición del encargo: la segunda decisión NO puntúa. Si algún día
 * entra en `puntuar`, en `fpBase` o en `porPartida`, hay datos de estudiantes
 * detrás y eso es una migración, no un retoque.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const GENERICOS = [/^no va aqu[ií]\.?$/i, /^correcto\.?$/i, /^revisa\b/i, /^casi\b/i];

/* Las malas de una decisión, con su mensaje propio y distinto. */
function d6(opciones, correcta, donde) {
  const malas = opciones.filter((o) => o.id !== correcta);
  assert.equal(opciones.filter((o) => o.id === correcta).length, 1, `${donde}: tiene que haber una sola correcta`);
  assert.ok(malas.length >= 2, `${donde}: con menos de dos errores no hay dos mensajes distintos`);
  for (const o of malas) {
    assert.ok(o.msg && o.msg.trim().length > 20, `${donde}/${o.id}: sin mensaje de error propio`);
    for (const g of GENERICOS) {
      assert.doesNotMatch(o.msg.trim(), g, `${donde}/${o.id}: mensaje genérico, no nombra la confusión`);
    }
    assert.doesNotMatch(o.msg, /\[SENTIDO\]|\[X\]|\[Z\]/, `${donde}/${o.id}: quedó un hueco sin rellenar`);
  }
  const msgs = malas.map((o) => o.msg.trim());
  assert.equal(new Set(msgs).size, msgs.length, `${donde}: dos errores con el mismo mensaje`);
  /* La correcta no lleva mensaje de error: llevaría a leerlo como un fallo. */
  assert.equal(opciones.find((o) => o.id === correcta).msg ?? null, null, `${donde}: la correcta trae msg de error`);
}

/* Las escenas de una decisión, comparadas una contra una. */
function d4(opciones, escenaDe, donde) {
  const retratos = opciones.map((o) => [o.id, JSON.stringify(escenaDe(o.id))]);
  for (const [id, retrato] of retratos) {
    assert.ok(retrato && retrato !== "null" && retrato !== "undefined", `${donde}/${id}: sin escena`);
  }
  for (let i = 0; i < retratos.length; i++) {
    for (let j = i + 1; j < retratos.length; j++) {
      assert.notEqual(
        retratos[i][1], retratos[j][1],
        `${donde}: «${retratos[i][0]}» y «${retratos[j][0]}» dejan la figura idéntica, así que elegir una u otra no se ve`,
      );
    }
  }
}

/* ───────── T1-1 · clasificación (¿pertenece?) + consecuencia (¿qué ve?) ───────── */

test("★★★ T1-1: cada usuario tiene su segunda decisión, con escenas distintas y un mensaje por error", () => {
  assert.ok(USUARIOS_T1_1.length >= 8, `solo ${USUARIOS_T1_1.length} usuarios`);
  for (const u of USUARIOS_T1_1) {
    const donde = `t1-1/${u.id}`;
    const opciones = opcionesSegundaT1_1(u);
    const correcta = correctaSegundaT1_1(u);
    assert.ok(opciones.some((o) => o.id === correcta), `${donde}: la correcta no está entre las opciones`);
    assert.ok(porqueSegundaT1_1(u)?.trim(), `${donde}: sin el por qué del acierto (D6 Medio)`);
    d6(opciones, correcta, donde);
    d4(opciones, (id) => SEGUNDA_T1_1.escena[id], donde);
  }
});

test("★★ T1-1: las tres escenas del anillo también se separan de la apertura", () => {
  /*
   * La apertura enciende la estación 5 y deja las otras cuatro en reposo, sin
   * nada apagado. Si una escena coincidiera con eso, esa elección no se vería.
   */
  const vistas = Object.values(SEGUNDA_T1_1.escena).map((e) => e.anillo);
  assert.deepEqual([...new Set(vistas)].sort(), ["ninguna", "solo-el-informe", "todas"]);
});

/* ───────── T1-2 · clasificación (qué clase) + consecuencia (vender el doble) ───────── */

test("★★★ T1-2: cada empresa tiene su segunda decisión, con escenas distintas y un mensaje por error", () => {
  assert.ok(EMPRESAS.length >= 11, `solo ${EMPRESAS.length} empresas`);
  for (const e of EMPRESAS) {
    const donde = `t1-2/${e.id}`;
    const opciones = opcionesSegundaT1_2(e);
    const correcta = correctaSegundaT1_2(e);
    assert.ok(opciones.some((o) => o.id === correcta), `${donde}: la correcta no está entre las opciones`);
    assert.ok(porqueSegundaT1_2(e)?.trim(), `${donde}: sin el por qué del acierto`);
    d6(opciones, correcta, donde);
    d4(opciones, (id) => SEGUNDA_T1_2.escena[id], donde);
  }
});

test("★★ T1-2: la correcta sale del recuadro de entrada, no de una tabla aparte", () => {
  for (const e of EMPRESAS) {
    const esperada = e.entra === "sin insumo físico" ? "sin-insumo" : "doblar";
    assert.equal(correctaSegundaT1_2(e), esperada, e.id);
  }
});

/* ───────── T1-4 · clasificación (cada parte) + consecuencia (la igualdad) ───────── */

test("★★★ T1-4: cada hecho repinta las tres barras distinto con cada opción", () => {
  for (const t of TRANSACCIONES_CAP2) {
    const donde = `t1-4/${t.id}`;
    const opciones = opcionesSegundaT1_4();
    d6(opciones, CORRECTA_SEGUNDA_T1_4, donde);
    d4(opciones, (id) => escenaSegundaT1_4(t, id), donde);
    assert.ok(porqueSegundaT1_4(t)?.trim(), `${donde}: sin el por qué del acierto`);
    /* La correcta pinta lo que de verdad pasó, y enciende los dos lados. */
    const buena = escenaSegundaT1_4(t, CORRECTA_SEGUNDA_T1_4);
    assert.deepEqual([...buena.resaltar].sort(), PARTES.map((p) => p.id).sort(), `${donde}: la correcta no enciende las tres partes`);
  }
});

/* ───────── T1-5 · clasificación (cuál no se mueve) + consecuencia (los totales) ───────── */

test("★★★ T1-5: en cada hecho las tres opciones dejan el arrastre en una casilla distinta", () => {
  for (let i = 0; i < TRANSACCIONES_CAP2.length; i++) {
    const donde = `t1-5/hecho-${i + 1}`;
    const opciones = opcionesSegundaT1_5(i);
    const correcta = correctaSegundaT1_5(i);
    assert.deepEqual(opciones.map((o) => o.id), PARTES.map((p) => p.id), `${donde}: las opciones no son las tres partes`);
    d6(opciones, correcta, donde);
    d4(opciones, escenaSegundaT1_5, donde);
  }
  assert.ok(SEGUNDA_T1_5.porque.trim(), "t1-5: sin el por qué del acierto");
});

/* ───────── Lo que no se negocia ───────── */

const PIEZAS = {
  "t1-desde-donde-preguntan": "src/components/mecanicas/libros/tema1/DesdeDondePreguntan.jsx",
  "t1-que-entro-y-que-salio": "src/components/mecanicas/libros/tema1/QueEntroYQueSalio.jsx",
  "t1-que-le-pasa-a-cada-uno": "src/components/mecanicas/libros/tema1/QueLePasaACadaUno.jsx",
  "t1-la-ecuacion-en-movimiento": "src/components/mecanicas/libros/tema1/LaEcuacionEnMovimiento.jsx",
};

test("★★★ las cuatro piezas montan la segunda decisión, y ninguna forkea la `Opcion` compartida", () => {
  for (const [id, ruta] of Object.entries(PIEZAS)) {
    const fuente = readFileSync(ruta, "utf8");
    /*
     * T1-5 con las dos torres (P2 de Mai): «cuál no se mueve» dejó de ser una
     * segunda decisión que no puntúa y pasó a ser la primera de las dos del
     * juego, con su ítem en el registro. Ya no monta el armazón.
     */
    if (id === "t1-la-ecuacion-en-movimiento") assert.match(fuente, /data-parte=\{id\}/, `${id}: no está la decisión de la parte quieta`);
    else assert.match(fuente, /SegundaDecisionT1/, `${id}: no monta la segunda decisión`);
    assert.doesNotMatch(fuente, /function Opcion\b/, `${id}: declaró otra Opcion`);
  }
  const armazon = readFileSync("src/components/mecanicas/libros/tema1/segundaDecision.jsx", "utf8");
  assert.doesNotMatch(armazon, /function Opcion\b/, "el armazón declaró otra Opcion");
  /* Las primitivas de la casa, no unas nuevas. */
  assert.match(armazon, /b5\/SegundaDecision\.jsx/);
  assert.match(armazon, /b5\/Devolucion\.jsx/);
});

test("★★★ la segunda decisión no toca el puntaje: ni fpBase, ni porPartida, ni registrar_fp", () => {
  const armazon = readFileSync("src/components/mecanicas/libros/tema1/segundaDecision.jsx", "utf8");
  const importa = [...armazon.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
  const fp = importa.filter((r) => /\/fp\/|registrarActividad|registrar_fp/.test(r));
  assert.deepEqual(fp, [], `la segunda decisión no puede importar ${fp.join(", ")}`);
  assert.doesNotMatch(armazon, /fpBase|porPartida|puntuar/, "el armazón se metió con el puntaje");
  /* Y en las piezas, la segunda no anota en `respuestas` ni en el detalle. */
  for (const [id, ruta] of Object.entries(PIEZAS)) {
    const fuente = readFileSync(ruta, "utf8");
    const lineas = fuente.split("\n").filter((l) => /onResuelta|onPintar=/.test(l));
    for (const l of lineas) {
      assert.doesNotMatch(l, /setRespuestas|detalle\.current|t\.anotar/, `${id}: la segunda decisión está anotando puntaje`);
    }
  }
});
