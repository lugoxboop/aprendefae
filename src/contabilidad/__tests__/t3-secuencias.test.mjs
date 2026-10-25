import { test } from "node:test";
import assert from "node:assert/strict";

import { faltasDePieza, palabras, MAX_PALABRAS_PANTALLA, MAX_PASOS, HAZ_INICIAL } from "../../components/secuencia/secuencia.js";
import { PIEZAS_SECUENCIA_T3 } from "../../components/mecanicas/libros/tema3/secuencia/index.js";
import { zonaHecho, frases } from "../../components/mecanicas/libros/tema3/secuencia/p1.jsx";
import { elegir, zonaHaz, HAZ_T3 } from "../../components/mecanicas/libros/tema3/secuencia/base.jsx";
import { separar, SEPARAR_INICIAL, zonaSeparar } from "../../components/mecanicas/libros/tema3/secuencia/p5.jsx";
import * as T from "../../data/t3SecuenciasTextos.js";
import { secuenciaT3Activa, ENCENDIDA } from "../../data/banderasT3.js";
import { SAN_CALIXTO, PREGUNTA_FINAL, OPCIONES_FINAL } from "../../data/contabilidadTema3.js";
import { CIERRE_P4, PREGUNTA_FINAL_P4, OPCIONES_FINAL_P4 } from "../../data/contabilidadTema3Pieza4.js";
import { PIEZA_CERRAR_EL_PERIODO, PREGUNTA_FINAL_CIERRE, OPCIONES_FINAL_CIERRE } from "../../data/contabilidadTema3Cierre.js";
import { PREGUNTA_FINAL_P3, OPCIONES_FINAL_P3 } from "../../data/contabilidadTema3Pieza3.js";
import { ITEMS_T3 } from "../../repaso/contabilidad/t3.js";
import { POOL_CONTABILIDAD } from "../../repaso/contabilidad/index.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · LAS CUATRO PIEZAS DE APRENDER EN SecuenciaAprender (paquete
 * e3-t3-secuencias-aprender-v3.md) y sus «En una frase» en el Repaso.
 *
 * La segunda fuente es la tabla de correspondencia (§4), copiada aquí a mano:
 * si alguien cambia un titular en el archivo de datos, esto lo ve.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TITULARES_DEL_PAQUETE = [
  [
    "Dos líneas que no siempre se mueven juntas", "Los socios ponen plata: ¿qué línea se mueve?", "Un servicio cobrado el mismo día",
    "Una factura que todavía no se cobra", "Una máquina usada que aún no se paga", "Cada marca tiene su nombre",
    "Compra mercancía y la paga de contado", "Vende un computador a su mismo valor", "Cuatro cosas distintas: ingreso, cobro, gasto y pago",
  ],
  [
    "Cuando el gasto va adelante de la plata", "Cinco días con una máquina alquilada", "El gasto ya pasó, ¿y la caja?",
    "Llega el cierre del mes", "El ajuste de San Calixto", "El mismo hecho, del otro lado", "El ajuste de San Miguel",
    "Un hecho, dos empresas, dos asientos",
  ],
  [
    "Cuando la plata va adelante del gasto", "Pagar tres meses de arriendo por anticipado", "Pagó, pero ¿ya usó el local?",
    "¿Qué es lo que pagó por anticipado?", "El cierre de junio", "El asiento de junio", "Lo que queda en el bloque",
    "Arriendos de la Costa recibió la plata", "El asiento de Arriendos de la Costa", "Un pago, dos empresas, mes a mes",
  ],
  [
    "Las cuentas de San Calixto al final de enero", "¿Qué cuentas se vacían al cerrar?", "Primero se ajusta, después se cierra",
    "Los ingresos pasan a Ganancias y pérdidas", "Ahora pasan los gastos", "Lo que queda en Ganancias y pérdidas",
    "Otra empresa, otro mes: Las Acacias", "Las Acacias: ahora pasan sus gastos", "Cuando los gastos ganan, queda pérdida",
    "Febrero empieza limpio",
  ],
];

const textoDe = (zona) => zona.filter((z) => z.texto).map((z) => z.texto).join(" ");

/* Las cuatro piezas de #572. P2 y P6 (#578) se prueban en t3-secuencias-p2-p6.test.mjs. */
const PUBLICADAS = ["t3-a1-vender-no-es-cobrar", "t3-a3-lo-que-ya-paso", "t3-a4-lo-que-ya-se-pago", "t3-a5-cerrar-el-periodo"];
const CUATRO = PUBLICADAS.map((id) => PIEZAS_SECUENCIA_T3.find((p) => p.id === id));

test("★ las cuatro piezas publicadas, 9 + 8 + 10 + 10 = 37 pantallas, en su orden y con sus ids", () => {
  assert.ok(CUATRO.every(Boolean));
  const orden = PIEZAS_SECUENCIA_T3.map((p) => p.id).filter((id) => PUBLICADAS.includes(id));
  assert.deepEqual(orden, PUBLICADAS, "P2 y P6 se insertan sin reordenar las publicadas");
  assert.deepEqual(CUATRO.map((p) => p.pantallas.length), [9, 8, 10, 10]);
});

test("★ los titulares son los de la tabla de correspondencia (§4), en su orden", () => {
  CUATRO.forEach((p, k) => assert.deepEqual(p.pantallas.map((s) => s.titular), TITULARES_DEL_PAQUETE[k], p.id));
});

test("★ la forma: cero faltas, ya con la razón de «Siguiente» (D11, textos v5 §2)", () => {
  for (const p of CUATRO) assert.deepEqual(faltasDePieza(p), [], p.id);
});

test("★ D11: cada Haz lleva la razón de su tipo de decisión (v5 §2, columna «Cuándo se ve»), literal", () => {
  assert.deepEqual(T.RAZONES_HAZ_T3, {
    eleccion: "Cuando respondas, se abre «Siguiente».",
    asiento: "Cuando pongas las dos cuentas, se abre «Siguiente».",
    ubicar: "Quedan fichas por ubicar.",
    cifra: "Cuando escribas la cifra, se abre «Siguiente».",
    corte: "Cuando pongas el corte, se abre «Siguiente».",
    ordenar: "Cuando ordenes los dos pasos, se abre «Siguiente».",
  });
  assert.equal(T.RAZON_HAZ_T3, T.RAZONES_HAZ_T3.eleccion);
  const R = T.RAZONES_HAZ_T3;
  const tipo = {
    "t3-a1-vender-no-es-cobrar/nombres": R.ubicar,
    "t3-a3-lo-que-ya-paso/corte": R.corte, "t3-a4-lo-que-ya-se-pago/corte": R.corte,
    "t3-a3-lo-que-ya-paso/ajuste-san-calixto": R.asiento, "t3-a3-lo-que-ya-paso/ajuste-san-miguel": R.asiento,
    "t3-a4-lo-que-ya-se-pago/asiento-junio": R.asiento, "t3-a4-lo-que-ya-se-pago/asiento-costa": R.asiento,
    "t3-a5-cerrar-el-periodo/separar": R.ubicar, "t3-a5-cerrar-el-periodo/ordenar": R.ordenar,
    "t3-a5-cerrar-el-periodo/ingresos": R.ubicar, "t3-a5-cerrar-el-periodo/gastos": R.ubicar,
    "t3-a5-cerrar-el-periodo/saldo": R.cifra,
    "t3-a5-cerrar-el-periodo/acacias-ingresos": R.ubicar, "t3-a5-cerrar-el-periodo/acacias-gastos": R.ubicar,
  };
  for (const p of CUATRO) {
    for (const s of p.pantallas.filter((x) => x.tipo === "haz")) {
      assert.equal(s.razon, tipo[`${p.id}/${s.id}`] ?? R.eleccion, `${p.id}/${s.id}`);
    }
  }
});

test("★ D1: cada estado visible lleva 60 palabras o menos (titular + zona), y ningún paso pasa de 5", () => {
  for (const p of PIEZAS_SECUENCIA_T3) {
    for (const s of p.pantallas) {
      assert.ok((s.pasos ?? 0) <= MAX_PASOS, `${p.id}/${s.id}`);
      for (const m of s.medir ?? []) {
        const zona = s.zonaDe?.(m.estado ?? s.estadoInicial ?? null, m.paso ?? 0) ?? [];
        const n = palabras(s.titular) + palabras(textoDe(zona));
        assert.ok(n <= MAX_PALABRAS_PANTALLA, `${p.id}/${s.id} · ${m.nombre}: ${n} palabras`);
      }
    }
  }
});

test("★ las pistas tienen 20 palabras o menos y ninguna está vacía", () => {
  for (const grupo of Object.values(T.PISTAS)) for (const p of Object.values(grupo)) assert.ok(p && palabras(p) <= 20, p);
});

test("★ D3: la pista reemplaza al apoyo, se retira en el intento siguiente; dos errores, el porqué", () => {
  const z = (e) => zonaHaz(e, { antes: [{ texto: "A" }], despues: [{ texto: "D" }], pista: "P", porque: (x) => `por ${x}` });
  assert.deepEqual(textoDe(z(HAZ_T3)), "A");
  const uno = elegir(HAZ_T3, "x", "ok");
  assert.equal(textoDe(z(uno)), "P");
  assert.equal(textoDe(z(elegir(uno, "ok", "ok"))), "D", "el acierto retira la pista y deja el apoyo de después");
  assert.equal(textoDe(z(elegir(uno, "y", "ok"))), "por y", "con dos errores: el porqué en lugar del apoyo");
  assert.deepEqual(elegir(elegir(elegir(uno, "y", "ok"), "ok", "ok"), "x", "ok").intentos, 2, "resuelto no se califica otra vez");
  assert.deepEqual(Object.keys(HAZ_INICIAL).every((k) => k in HAZ_T3), true);
});

test("★ el texto aprobado no se reescribe: las partes unidas son el original", () => {
  for (const h of SAN_CALIXTO.hechos) {
    const { antes, despues } = zonaHecho(h);
    const partes = [...antes, ...despues].filter((x) => x.texto && x.texto !== h.titulo).map((x) => x.texto);
    assert.ok(partes.join(" ") === h.texto || partes[partes.length - 1] === h.texto, h.id);
  }
  assert.equal(frases(CIERRE_P4).join(" "), CIERRE_P4);
  /* P5-4: la primera oración de la cita publicada de la p. 123, completa (Miyata, opción a). */
  const cerrar = PIEZA_CERRAR_EL_PERIODO.nombres.find((n) => n.termino === "Cerrar").delLibro;
  const oracion = T.CITA_P5_123.match(/^«(.+)»/)[1];
  assert.ok(cerrar.startsWith(`«${oracion} `), "la oración no es la del libro publicado");
  assert.match(T.CITA_P5_123, /\(p\. 123\)$/);
});

test("★ antes de responder no se ve la respuesta: en P1 el apoyo de antes no dice qué línea se mueve", () => {
  for (const h of SAN_CALIXTO.hechos) {
    const antes = textoDe(zonaHecho(h).antes);
    assert.doesNotMatch(antes, /se mueve|quieta|no hubo ningún ingreso|no ha salido plata|no ha entrado plata/, h.id);
  }
});

test("★ P5-2: cinco pasos de Miyata; la pista manda sobre la lista; dos errores dejan la cuenta en su sitio", () => {
  assert.deepEqual(T.PASOS_P5_2.map((p) => p.cuenta), ["Ingresos por servicios", "Gasto alquiler", "Alquiler por pagar", "Caja", "Aportes sociales"]);
  let e = separar(SEPARAR_INICIAL, "no-vacia");
  assert.equal(textoDe(zonaSeparar({ ...e, viendo: "vacia" })), T.PISTAS.p5.separar);
  e = separar(e, "no-vacia");
  assert.equal(e.k, 1);
  assert.match(textoDe(zonaSeparar(e)), /Ingresos por servicios cuenta lo que se vendió/);
  const fin = T.PASOS_P5_2.slice(1).reduce((x, p) => separar(x, p.respuesta), e);
  assert.equal(fin.k, 5);
  /* Condición 2 de #572: la lista nombra solo las 6 que ya estaban puestas, nunca las 5 en juego. */
  for (const zona of ["vacia", "no-vacia"]) {
    for (const e2 of [SEPARAR_INICIAL, e, fin]) {
      assert.equal(textoDe(zonaSeparar({ ...e2, ultimo: null, viendo: zona })), T.YA_PUESTAS_P5_2[zona].join(", "), zona);
    }
  }
  assert.equal(T.YA_PUESTAS_P5_2.vacia.length + T.YA_PUESTAS_P5_2["no-vacia"].length, 6);
  const lista = textoDe(zonaSeparar({ ...fin, viendo: "no-vacia" })) + textoDe(zonaSeparar({ ...fin, viendo: "vacia" }));
  for (const p of T.PASOS_P5_2) assert.ok(!lista.includes(p.cuenta), `${p.cuenta} está en juego y sale en la lista`);
});

test("★ las cuentas de los cuatro asientos son las de Miyata (v3 §1): 4 por asiento, el par y dos que no van", () => {
  const casos = [
    [T.CUENTAS_ASIENTO_P3_SANCALIXTO, "Gasto alquiler", "Alquiler por pagar", ["Caja", "Servicios por cobrar"]],
    [T.CUENTAS_ASIENTO_P3_SANMIGUEL, "Servicios por cobrar", "Ingresos por servicios", ["Caja", "Alquiler por pagar"]],
    [T.CUENTAS_ASIENTO_P4_JUNIO, "Gasto arriendos", "Arriendos pagados por anticipado", ["Caja", "Arriendos por pagar"]],
    [T.CUENTAS_ASIENTO_P4_COSTA, "Arriendos recibidos por anticipado", "Ingresos por arriendos", ["Caja", "Arriendos por cobrar"]],
  ];
  for (const [a, debe, haber, noVan] of casos) {
    assert.equal(a.candidatas.length, 4);
    assert.equal(a.candidatas.find((c) => c.lado === "debe").cuenta, debe);
    assert.equal(a.candidatas.find((c) => c.lado === "haber").cuenta, haber);
    assert.deepEqual(a.candidatas.filter((c) => !c.lado).map((c) => c.cuenta), noVan);
    /* Un solo error de «al revés» para el par (regla de los errores, v3). */
    assert.match(a.alReves, /^Va al revés\./);
    for (const c of a.candidatas) assert.ok(c.error, `${c.cuenta} sin error`);
  }
});

test("★ el asiento: la casilla activa recibe la cuenta; al revés, pista y luego el porqué del par", async () => {
  const { ponerCuenta, ASIENTO_INICIAL, asientoResuelto, zonaAsiento, enOrden } = await import("../../components/mecanicas/libros/tema3/secuencia/base.jsx");
  const { candidatas, alReves } = T.CUENTAS_ASIENTO_P3_SANCALIXTO;
  /* El control no delata el par: va en orden alfabético. */
  assert.deepEqual(enOrden(candidatas).map((c) => c.cuenta), ["Alquiler por pagar", "Caja", "Gasto alquiler", "Servicios por cobrar"]);
  const z = (e) => textoDe(zonaAsiento(e, candidatas, { antes: [], despues: [{ texto: "D" }], pista: "P" }));
  let e = ponerCuenta({ ...ASIENTO_INICIAL, activa: "debe" }, candidatas, "Alquiler por pagar");
  assert.equal(z(e), "P");
  e = ponerCuenta(e, candidatas, "Alquiler por pagar");
  assert.equal(z(e), alReves);
  e = ponerCuenta({ ...e, activa: "haber" }, candidatas, "Alquiler por pagar");
  assert.equal(asientoResuelto(candidatas)(e), true);
  assert.equal(z(e), "D");
});

test("★ Las Acacias (v5 §1): sus cuentas y saldos, «Escenario simulado» primero; ⛔ la consigna sigue pendiente", () => {
  const A = T.LAS_ACACIAS;
  const suma = (l) => l.reduce((t, c) => t + c.saldo, 0);
  assert.equal(suma(A.ingresos), 3200000);
  assert.equal(suma(A.gastos), 3300000);
  assert.equal(suma(A.siguen.filter((c) => c.cuenta !== "Aportes sociales")), 1500000, "lo que no se vacía cuadra: 1.600.000 − 100.000");
  assert.deepEqual(A.gastos.map((c) => c.cuenta), ["Gasto salarios", "Gasto servicios públicos", "Gasto mantenimiento", "Gasto papelería", "Gasto materiales e insumos"]);
  assert.equal(T.ESCENARIO_SIMULADO, "Escenario simulado");
  const p5 = CUATRO[3];
  for (const id of ["acacias-ingresos", "acacias-gastos", "perdida"]) {
    const s = p5.pantallas.find((x) => x.id === id);
    for (const m of s.medir) {
      const z = s.zonaDe(m.estado);
      assert.equal(z[0].pie, "Escenario simulado", `${id} · ${m.nombre}: el primer renglón es la marca`);
    }
    /* Se resuelve con sus datos: ya no está armada y esperando. */
    assert.equal(s.resuelta(s.medir.find((m) => m.nombre === "acierto").estado), true, id);
  }
  /* ⛔ No se inventa: la consigna no está en ningún archivo, y queda marcada como pendiente. */
  const pendientes = PIEZAS_SECUENCIA_T3.flatMap((p) => p.pantallas.filter((s) => s.pendiente).map((s) => `${p.id}/${s.id}`));
  assert.deepEqual(pendientes, [
    "t3-a5-cerrar-el-periodo/acacias-ingresos", "t3-a5-cerrar-el-periodo/acacias-gastos", "t3-a5-cerrar-el-periodo/perdida",
  ]);
});

test("★ condición 1: los contadores de P1 salen de los hechos publicados, acumulados hecho por hecho", async () => {
  const { modeloP1, modeloCierreP1 } = await import("../../components/mecanicas/libros/tema3/secuencia/p1.jsx");
  const { contadores, estadoPaso, PASOS } = await import("../../contabilidad/dosLineas.js");
  const { COMPANIA_CUALQUIERA } = await import("../../data/contabilidadTema3.js");
  for (const emp of [SAN_CALIXTO, COMPANIA_CUALQUIERA]) {
    emp.hechos.forEach((h, i) => {
      const previas = emp.hechos.slice(0, i).flatMap((x) => x.marcas);
      assert.deepEqual(modeloP1(emp, i, false).suma, contadores(previas), `${h.id} antes de responder`);
      assert.deepEqual(modeloP1(emp, i, true).suma, contadores([...previas, ...h.marcas]), `${h.id} al responder`);
    });
  }
  /* Al responder el aporte, «Entró» llega a 15.000 (paquete §2, P1-2). */
  assert.equal(modeloP1(SAN_CALIXTO, 0, true).suma.entrada, 15000);
  /* El Cierre es el paso 6 publicado de San Calixto: 9.000 de ingresos, 2.500 de gastos, 20.000 que entraron. */
  assert.deepEqual(modeloCierreP1().suma, estadoPaso(PASOS).contadores);
  assert.deepEqual(modeloCierreP1().suma, { ingreso: 9000, gasto: 2500, entrada: 20000, salida: 0 });
});

test("★ OPC_PREDICE va en 3 botones, sin «Ninguna» (Kamogawa, lote 12)", () => {
  assert.deepEqual(T.OPC_PREDICE.map((o) => o.texto), ["Ingresos y gastos", "Caja", "Las dos"]);
  assert.ok(!("ninguna" in T.ERRORES_PREDICE));
});

test("★ la bandera: apagada por defecto, se mira con ?t3=secuencia", () => {
  assert.equal(ENCENDIDA, false, "lo publicado sigue siendo lo que ven los estudiantes");
  assert.equal(secuenciaT3Activa(""), false);
  assert.equal(secuenciaT3Activa("?t3=secuencia"), true);
  assert.equal(secuenciaT3Activa("?t3=otra"), false);
});

test("★ Repaso: las 4 «En una frase» con su texto literal, ítems nuevos, sin tocar ningún id", () => {
  const casos = [
    ["t3-a1-vender-no-es-cobrar", PREGUNTA_FINAL, OPCIONES_FINAL, "Ingreso y cobro"],
    ["t3-a3-lo-que-ya-paso", PREGUNTA_FINAL_P3, OPCIONES_FINAL_P3, "Causación"],
    ["t3-a4-lo-que-ya-se-pago", PREGUNTA_FINAL_P4, OPCIONES_FINAL_P4, "Ajuste diferido"],
    ["t3-a5-cerrar-el-periodo", PREGUNTA_FINAL_CIERRE, OPCIONES_FINAL_CIERRE, "Cierre del periodo"],
  ];
  assert.equal(ITEMS_T3.length, 4);
  casos.forEach(([act, pregunta, opciones, subtema], k) => {
    const x = ITEMS_T3[k];
    assert.equal(x.clave, `${act}:en-una-frase`);
    assert.equal(x.materia, "ingresos-gastos-y-caja");
    assert.equal(x.subtema, subtema);
    assert.equal(x.enunciado, pregunta);
    assert.deepEqual(x.opciones, opciones.map((o) => ({ id: o.id, texto: o.texto })));
    assert.equal(x.correcta, opciones.find((o) => o.correcta).id);
    for (const o of opciones) assert.deepEqual(x.devolucion(o.id), [{ tipo: "retro", texto: o.feedback }]);
  });
  /* Ninguna clave del pool se repite y los ítems de T3 están dentro. */
  const claves = POOL_CONTABILIDAD.map((x) => x.clave);
  assert.equal(new Set(claves).size, claves.length);
  for (const x of ITEMS_T3) assert.ok(claves.includes(x.clave));
});
