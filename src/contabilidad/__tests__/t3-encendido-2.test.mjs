import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PIEZAS_SECUENCIA_T3 } from "../../components/mecanicas/libros/tema3/secuencia/index.js";
import * as T from "../../data/t3SecuenciasTextos.js";
import * as T26 from "../../data/t3SecuenciasTextosP2P6.js";
import { ENCENDIDA } from "../../data/banderasT3.js";
import { inflesz } from "../../herramientas/inflesz.js";
import { ubicacionDeActividad } from "../../data/subjects.js";
import { ITEMS_T3, EN_UNA_FRASE_P2_P6, itemEnUnaFrase } from "../../repaso/contabilidad/t3.js";
import { SUBTEMA_FIJO_T3, SUBTEMA_APRENDER_T3 } from "../../data/subtemasContabilidadT3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · LAS CONDICIONES DE ENCENDIDO QUE FALTABAN (Takamura, lotes 18 y 19).
 *
 *   1. Las Acacias con los textos v6 (P5-7, P5-8 y P5-9 dejan de estar pendientes).
 *   2. D11 de ubicar: la razón del lote 16, en las seis piezas.
 *   3. La utilidad de la lectura de P2 tapada de P2-2 a P2-6; en P2-1, $0.
 *   4. El bloque tapado (E8) con contorno punteado de 1 px.
 *   5. P1-7, umbral vigilado en la sonda de cabecera (se prueba abajo que está).
 *   6. Las «En una frase» de P2-8 y P6-10 para el Repaso Diario.
 *
 * Los textos se cotejan contra los paquetes, no contra una copia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const paquete = (n) => readFileSync(new URL(`orquestador/conocimiento/paquetes/${n}`, RAIZ), "utf8");
const V6 = paquete("e3-t3-secuencias-textos-v6.md");
const V2_P2P6 = paquete("e3-t3-p2-y-p6-v2.md");

const pieza = (id) => PIEZAS_SECUENCIA_T3.find((p) => p.id === id);
const pantalla = (pz, id) => pz.pantallas.find((s) => s.id === id);
const pintar = (pz, id, estado) => {
  const s = pantalla(pz, id);
  return renderToStaticMarkup(createElement(s.Figura, { estado: estado ?? s.estadoInicial ?? null, setEstado: () => {}, paso: 0, primeraVez: false, reducido: true }));
};
const P5 = pieza("t3-a5-cerrar-el-periodo");
const P2 = pieza(T26.PIEZA_P2.id);
const textos = (zona) => zona.map((z) => z.texto ?? z.pie ?? "").filter(Boolean);
const medida = (s, nombre) => s.medir.find((m) => m.nombre === nombre).estado;

test("★ la bandera sigue apagada", () => {
  assert.equal(ENCENDIDA, false);
});

/* ═══════════ 1 · LAS ACACIAS ═══════════ */

test("★ 1 · los textos de Las Acacias son los de la v6, literales", () => {
  const A = T.TEXTOS_ACACIAS;
  for (const t of [A.consignaIngresos, A.consignaGastos, A.pregunta, A.acierto, A.pie]) assert.ok(V6.includes(t), t);
  for (const [cuenta, t] of Object.entries(T.ERRORES_ACACIAS)) {
    assert.ok(V6.includes(t), t);
    assert.ok(T.LAS_ACACIAS.siguen.some((c) => c.cuenta === cuenta), `${cuenta} es de las que no se vacían`);
  }
  assert.deepEqual(Object.keys(T.ERRORES_ACACIAS).sort(), T.LAS_ACACIAS.siguen.map((c) => c.cuenta).sort(), "un porqué por cada cuenta que no se vacía");
});

test("★ 1 · INFLESZ oficial: todo texto nuevo de 10 palabras o más da 65 o más; la variante corta de Cuentas por cobrar no hace falta", () => {
  const nuevos = [
    ...Object.values(T.TEXTOS_ACACIAS), ...Object.values(T.ERRORES_ACACIAS),
    ...T26.OPCIONES_FINAL_P2.map((o) => o.feedback), ...T26.OPCIONES_FINAL_P6.map((o) => o.feedback),
  ];
  for (const t of nuevos) {
    const r = inflesz(t);
    if (r.aplica) assert.ok(r.cumple, `${r.valor} · ${t}`);
  }
  /* La v6 pide la variante corta solo si el texto largo baja de 65. */
  assert.ok(inflesz(T.ERRORES_ACACIAS["Cuentas por cobrar – clientes"]).valor >= 65);
});

test("★ 1 · P5-7 y P5-8: la consigna antes de responder, la marca siempre primero, el porqué de cada cuenta al segundo error", () => {
  const casos = [["acacias-ingresos", T.TEXTOS_ACACIAS.consignaIngresos], ["acacias-gastos", T.TEXTOS_ACACIAS.consignaGastos]];
  for (const [id, consigna] of casos) {
    const s = pantalla(P5, id);
    assert.equal(s.pendiente, undefined, id);
    for (const m of s.medir) assert.equal(s.zonaDe(m.estado)[0].pie, T.ESCENARIO_SIMULADO, `${id} · ${m.nombre}`);
    assert.deepEqual(textos(s.zonaDe(s.estadoInicial)), [T.ESCENARIO_SIMULADO, consigna]);
    /* Primer error: la pista. Segundo: el porqué de la cuenta que pasó (aquí, Cuentas por cobrar). */
    assert.deepEqual(textos(s.zonaDe(medida(s, "pista"))), [T.ESCENARIO_SIMULADO, T.PISTAS.p5.pasar]);
    assert.deepEqual(textos(s.zonaDe(medida(s, "dos-errores"))), [T.ESCENARIO_SIMULADO, T.ERRORES_ACACIAS["Cuentas por cobrar – clientes"]]);
    assert.equal(s.resuelta(medida(s, "acierto")), true);
  }
});

test("★ 1 · el error NUEVO «pasó un gasto» no entra: en P5-7 el control no ofrece ningún gasto", () => {
  const s = pantalla(P5, "acacias-ingresos");
  /* Se recorre el control entero: cada posición del ‹ cuenta ›, y ninguna es un gasto. */
  const gastos = T.LAS_ACACIAS.gastos.map((c) => c.cuenta);
  const vistas = new Set();
  for (let i = 0; i < 12; i += 1) {
    const html = pintar(P5, "acacias-ingresos", { ...s.estadoInicial, indice: i });
    for (const c of [...T.LAS_ACACIAS.ingresos, ...T.LAS_ACACIAS.siguen, ...T.LAS_ACACIAS.gastos]) if (html.includes(c.cuenta)) vistas.add(c.cuenta);
  }
  assert.ok(T.LAS_ACACIAS.ingresos.every((c) => vistas.has(c.cuenta)), "el control sí recorre los ingresos");
  assert.deepEqual([...vistas].filter((c) => gastos.includes(c)), []);
  assert.ok(!Object.values(T.ERRORES_ACACIAS).some((t) => /pantalla siguiente/.test(t)));
});

test("★ 1 · P5-9: la pregunta con el pie de la p. 123 mientras está abierta; resuelta, el acierto (el pie no cabe a 320)", () => {
  const s = pantalla(P5, "perdida");
  assert.equal(s.pendiente, undefined);
  assert.deepEqual(textos(s.zonaDe(s.estadoInicial)), [T.ESCENARIO_SIMULADO, T.TEXTOS_ACACIAS.pregunta, T.TEXTOS_ACACIAS.pie]);
  assert.deepEqual(textos(s.zonaDe(medida(s, "pista-utilidad"))), [T.ESCENARIO_SIMULADO, T.PISTAS.p5.acacias, T.TEXTOS_ACACIAS.pie]);
  assert.deepEqual(textos(s.zonaDe(medida(s, "acierto"))), [T.ESCENARIO_SIMULADO, T.TEXTOS_ACACIAS.acierto]);
  /* «dos-errores-nada» elige «nada» y luego «utilidad»: sale el porqué de la última. */
  assert.deepEqual(textos(s.zonaDe(medida(s, "dos-errores-nada"))), [T.ESCENARIO_SIMULADO, T.ERRORES_P5_6.utilidad]);
  /* Los errores siguen siendo los de OPC_P5_6, ya publicados (v6 §3 lo confirma). */
  for (const t of Object.values(T.ERRORES_P5_6)) assert.ok(V6.includes(t), t);
});

/* ═══════════ 2 · D11 DE UBICAR ═══════════ */

test("★ 2 · D11 de ubicar es la del lote 16 en las seis piezas, y la vieja ya no sale en ninguna", () => {
  const nueva = "Cuando ubiques todas las fichas, se abre «Siguiente».";
  assert.equal(T.RAZONES_HAZ_T3.ubicar, nueva);
  assert.equal(T26.RAZON_P2P6.ubicar, nueva);
  assert.equal(PIEZAS_SECUENCIA_T3.length, 6);
  const razones = PIEZAS_SECUENCIA_T3.flatMap((p) => p.pantallas.map((s) => s.razon).filter(Boolean));
  assert.ok(!razones.includes("Quedan fichas por ubicar."));
  /* Cada pieza que tiene una pantalla de ubicar la muestra con la razón nueva. */
  const conUbicar = PIEZAS_SECUENCIA_T3.filter((p) => p.pantallas.some((s) => s.razon === nueva)).map((p) => p.id);
  assert.ok(conUbicar.length >= 3, conUbicar.join(", "));
});

/* ═══════════ 3 · LA UTILIDAD DE P2 TAPADA ═══════════ */

test("★ 3 · la lectura de P2: utilidad en $0 en P2-1, tapada de P2-2 a P2-6 sin responder, y a la vista al responder la 6", () => {
  const lectura = (html) => html.slice(html.indexOf("data-lectura"), html.indexOf("</div>", html.indexOf("data-lectura")));
  assert.match(lectura(pintar(P2, "apertura")), /Utilidad <b data-monto="true">\$0<\/b>/);
  for (const id of ["cobrados", "haber", "asiento", "gastos", "utilidad"]) {
    const l = lectura(pintar(P2, id));
    assert.match(l, /Utilidad <span class="t3s2-tapa"[^>]*data-tapado/, id);
    assert.doesNotMatch(l, /Utilidad <b/, `${id}: la cifra no está debajo`);
    assert.doesNotMatch(l, /14\.800/, `${id}: no dice los ingresos como si fueran la utilidad`);
  }
  const s = pantalla(P2, "utilidad");
  assert.match(lectura(pintar(P2, "utilidad", medida(s, "acierto"))), /Utilidad <b data-monto="true">\$6\.450<\/b>/);
});

/* ═══════════ 4 · EL BLOQUE TAPADO SE DISTINGUE ═══════════ */

test("★ 4 · el bloque tapado lleva el contorno punteado de 1 px de «Del resultado a la caja»", () => {
  const html = pintar(P2, "utilidad");
  assert.match(html, /\.t3s2-tapa \{[^}]*border: 1px dashed #B8C4D4/);
  const caja = readFileSync(new URL("src/components/mecanicas/libros/tema3/ResultadoCaja.jsx", RAIZ), "utf8");
  assert.match(caja, /border: `1px dashed \$\{C\.atenuado\}`/, "el punteado de referencia sigue siendo 1px dashed");
  /* Lo tapan P2 y P6: todas pasan por el mismo bloque. */
  const P6 = pieza(T26.PIEZA_P6.id);
  assert.match(pintar(P6, "apertura"), /class="t3s2-tapa"/);
});

/* ═══════════ 5 · P1-7 VIGILADO ═══════════ */

test("★ 5 · la sonda de cabecera vigila P1-7 inventario «sin responder» a 320 y falla bajo 0", () => {
  const sonda = readFileSync(new URL("scripts/t3/medir-cabecera-real.mjs", RAIZ), "utf8");
  assert.match(sonda, /clave: "t3-a1-vender-no-es-cobrar\/inventario", estado: "sin-responder", minimo: 0/);
  assert.match(sonda, /vigilancia\.includes\(false\) \? 1 : 0/);
  assert.ok(pantalla(pieza("t3-a1-vender-no-es-cobrar"), "inventario").medir.some((m) => m.nombre === "sin-responder"));
});

/* ═══════════ 6 · REPASO: P2-8 Y P6-10 ═══════════ */

test("★ 6 · P2-8 y P6-10: pregunta, opciones y devoluciones literales del paquete, con los subtemas de la v6 §4", () => {
  const [p2, p6] = EN_UNA_FRASE_P2_P6;
  assert.equal(p2.pieza.id, "t3-a2-el-mes-de-san-calixto");
  assert.equal(p6.pieza.id, "t3-a6-lo-que-deja-el-periodo");
  assert.equal(p2.subtema, "Resultado y caja");
  assert.equal(p2.subtema, SUBTEMA_FIJO_T3["t3-del-resultado-a-la-caja"], "el mismo subtema de «Del resultado a la caja»");
  assert.equal(p6.subtema, "Impuesto y utilidad neta");
  assert.deepEqual(SUBTEMA_APRENDER_T3, { [p2.pieza.id]: p2.subtema, [p6.pieza.id]: p6.subtema });
  for (const { pregunta, opciones } of EN_UNA_FRASE_P2_P6) {
    assert.ok(V6.includes(pregunta) && V2_P2P6.includes(pregunta), pregunta);
    assert.equal(opciones.filter((o) => o.correcta).length, 1);
    for (const o of opciones) {
      assert.ok(V2_P2P6.includes(o.texto), o.texto);
      assert.ok(V2_P2P6.includes(o.feedback), o.feedback);
    }
  }
  assert.equal(T26.OPCIONES_FINAL_P2.find((o) => o.correcta).texto, "Vender y consumir");
  assert.equal(T26.OPCIONES_FINAL_P6.find((o) => o.correcta).texto, "Lo que queda a los accionistas después del impuesto");
});

test("★ 6 · son ítems nuevos y entran al pool con P2 y P6 en el catálogo; hoy no lo están, y ningún id existente cambia", () => {
  const antes = ["t3-a1-vender-no-es-cobrar", "t3-a3-lo-que-ya-paso", "t3-a4-lo-que-ya-se-pago", "t3-a5-cerrar-el-periodo"].map((a) => `${a}:en-una-frase`);
  assert.deepEqual(ITEMS_T3.slice(0, 4).map((x) => x.clave), antes);
  const enCatalogo = EN_UNA_FRASE_P2_P6.filter((x) => ubicacionDeActividad(x.pieza.id));
  assert.equal(ITEMS_T3.length, 4 + enCatalogo.length);
  for (const x of EN_UNA_FRASE_P2_P6) {
    if (ubicacionDeActividad(x.pieza.id)) {
      const it = ITEMS_T3.find((i) => i.clave === `${x.pieza.id}:en-una-frase`);
      assert.equal(it.subtema, x.subtema);
      assert.equal(it.enunciado, x.pregunta);
      for (const o of x.opciones) assert.deepEqual(it.devolucion(o.id), [{ tipo: "retro", texto: o.feedback }]);
    } else {
      /* Fuera del catálogo, el pool lo rechaza (itemDeRepaso): por eso espera a la bandera. */
      assert.throws(() => itemEnUnaFrase(x), /fuera del catálogo/i);
    }
  }
});
