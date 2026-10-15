import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 3 · «ARMA LA LÍNEA» CON LOS DISTRACTORES DE NEAR (Célula C).
 *
 * El paquete es orquestador/conocimiento/paquetes/lote3-distractores-v1.md.
 * Esta prueba lo lee y exige, en los 8 Hacer calcados publicados:
 *
 *   · cada línea de asiento de la tabla de Near lleva sus dos distractores,
 *     { cuenta, retro }, letra por letra y en su orden; y ninguna línea de
 *     esos asientos se queda sin ellos
 *   · ninguna retroalimentación nombra la cuenta correcta de su línea
 *   · los ítems de «¿cuánto es X?» que Near pasa a casilla son de tipo
 *     "cifra"; los que se quedan en elección, no
 *   · los tres ítems que L mandó quitar ya no están: T7-1 H6 ítems 4 y 6
 *     (la cuenta de la devolución en cada libro) y T7-3 H1 ítem 4 (por qué
 *     valor va Ingresos por ventas)
 *
 * N5 (t5-gano-o-perdio) no está en main: está en #164, congelado. Su tabla
 * se lee, pero no se exige aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RAIZ = new URL("../../../", import.meta.url);
const MD = readFileSync(new URL("orquestador/conocimiento/paquetes/lote3-distractores-v1.md", RAIZ), "utf8");
const datos = async (f, k) => (await import(new URL(`src/data/${f}.js`, RAIZ).href))[k];

const HACER = {
  "t7-1-arma-la-factura": await datos("contabilidadT7_1_h2", "ITEMS_H2"),
  "t7-1-devolucion-dos-libros": await datos("contabilidadT7_1_h6", "ITEMS_H6"),
  "t7-2-dos-asientos": await datos("contabilidadT7_2_h2", "ITEMS_H2"),
  "t7-2-flete-y-devolucion": await datos("contabilidadT7_2_h5", "ITEMS_H5"),
  "t7-3-descuento-en-factura": await datos("contabilidadT7_3_h1", "ITEMS_H1"),
  "t7-3-pago-a-tiempo": await datos("contabilidadT7_3_h4", "ITEMS_H4"),
  "t7-3-ajuste-por-conteo": await datos("contabilidadT7_3_h5", "ITEMS_H5"),
  "t5-el-interes-del-periodo": await datos("contabilidadT5_n4", "ITEMS_N4"),
};

/* Las filas de Near: a qué Hacer y asiento van, la línea correcta (cuenta y lado) y el distractor. */
function filasDeNear() {
  const filas = [];
  let piezas = [];
  for (const l of MD.split("\n")) {
    if (l.startsWith("### ")) {
      piezas = [...l.matchAll(/`(t\d-[^`]+)`/g)].map((m) => m[1]);
      /* La venta en periódico: «T7-1 H2 · `asiento-venta` (La Ceiba) y T7-3 H1 · `asiento` (Guadua)». */
      if (l.includes("Venta en periódico")) piezas = ["t7-1-arma-la-factura", "t7-3-descuento-en-factura"];
      continue;
    }
    const m = l.match(/^\| `([^`]+)` \| (.+?) · ([DH]) · [^|]+ \| (.+?) \| «(.+)» \| [\d,]+ \|$/);
    if (!m) continue;
    const asientos = m[1].includes("(") ? [...m[1].matchAll(/([\w-]+) \(/g)].map((x) => x[1]) : [m[1]];
    piezas.forEach((pieza, k) => filas.push({ pieza, asiento: asientos[Math.min(k, asientos.length - 1)], cuenta: m[2], lado: m[3] === "D" ? "debe" : "haber", distractor: m[4], retro: m[5] }));
  }
  return filas;
}

const FILAS = filasDeNear();
const PUBLICADAS = FILAS.filter((f) => HACER[f.pieza]);

test("★★★ el paquete: 44 líneas con 2 distractores cada una (48 con la venta repetida), 88 textos", () => {
  const unicas = new Set(FILAS.map((f) => `${f.retro}|${f.cuenta}|${f.distractor}|${f.asiento}`));
  assert.equal(FILAS.length, 96, "88 filas y las 8 de la venta, que valen para dos piezas");
  const lineas = new Set(FILAS.map((f) => `${f.pieza}·${f.asiento}·${f.cuenta}·${f.lado}`));
  assert.equal(lineas.size, 48);
  assert.equal(FILAS.filter((f) => f.pieza !== "t7-3-descuento-en-factura").length, 88);
  assert.ok(unicas.size >= 88);
});

test("★★★ cada línea de los asientos publicados lleva los dos distractores de Near, letra por letra", () => {
  const faltan = [];
  for (const [pieza, items] of Object.entries(HACER)) {
    for (const it of items.filter((x) => x.tipo === "asiento")) {
      for (const l of it.lineas) {
        const deNear = PUBLICADAS.filter((f) => f.pieza === pieza && f.asiento === it.id && f.cuenta === l.cuenta && f.lado === l.lado).map((f) => ({ cuenta: f.distractor, retro: f.retro }));
        if (!deNear.length) { faltan.push(`${pieza} · ${it.id} · ${l.cuenta}: sin fila en el paquete`); continue; }
        try { assert.deepEqual(l.distractores, deNear); } catch { faltan.push(`${pieza} · ${it.id} · ${l.cuenta}`); }
      }
    }
  }
  assert.deepEqual(faltan, []);
  /* Y cada fila publicada del paquete casa con una línea de los datos. */
  const sinLinea = PUBLICADAS.filter((f) => !HACER[f.pieza].some((it) => it.id === f.asiento && it.lineas?.some((l) => l.cuenta === f.cuenta && l.lado === f.lado)));
  assert.deepEqual(sinLinea.map((f) => `${f.pieza} · ${f.asiento} · ${f.cuenta}`), []);
});

test("★★★ ninguna retroalimentación de distractor nombra la cuenta correcta de su línea", () => {
  for (const items of Object.values(HACER)) for (const it of items.filter((x) => x.tipo === "asiento")) for (const l of it.lineas)
    for (const d of l.distractores ?? []) assert.ok(!d.retro.includes(l.cuenta), `${it.id} · ${l.cuenta}: «${d.retro}»`);
});

/* Lo que Near pasa a casilla (por número de ítem de main antes del lote 3, y su id). */
const A_CASILLA = {
  "t7-1-arma-la-factura": ["iva-compra", "retencion-compra", "debe-proveedor", "debe-cliente"],
  "t7-1-devolucion-dos-libros": ["baja-deuda"],
  "t7-2-dos-asientos": ["debe-cliente"],
  "t7-2-flete-y-devolucion": ["pago-a-la-transportadora", "baja-con-el-proveedor"],
  "t7-3-descuento-en-factura": ["valor-a-facturar", "iva", "debe-el-cliente"],
  "t7-3-pago-a-tiempo": ["lo-facturado", "el-descuento", "el-pago"],
  "t7-3-ajuste-por-conteo": ["el-sobrante", "el-faltante"],
  "t5-el-interes-del-periodo": ["primer-trimestre", "segundo-trimestre"],
};

test("★★★ los ítems de «¿cuánto es X?» van con casilla de cifra; los de concepto se quedan en elección", () => {
  for (const [pieza, ids] of Object.entries(A_CASILLA)) {
    const items = HACER[pieza];
    assert.deepEqual(items.filter((x) => x.tipo === "cifra").map((x) => x.id), ids, pieza);
    /* Una casilla no puede pedir más de 7 dígitos (Near). */
    for (const it of items.filter((x) => x.tipo === "cifra")) assert.ok(String(it.correcta).length <= 7, `${pieza} · ${it.id}`);
  }
  assert.ok(MD.includes("la más alta es $6.300.000 (T7-2 H2, ítem 1)"));
});

test("★★★ los tres ítems que repetía la mesa ya no están (decisión de L)", () => {
  const ids = (p) => HACER[p].map((x) => x.id);
  assert.ok(!ids("t7-1-devolucion-dos-libros").includes("cuenta-comprador"));
  assert.ok(!ids("t7-1-devolucion-dos-libros").includes("cuenta-vendedor"));
  assert.ok(!ids("t7-3-descuento-en-factura").includes("ingresos-por-ventas"));
  assert.ok(MD.includes("**T7-1 H6, ítems 4 y 6**") && MD.includes("**T7-3 H1, ítem 4**"));
});

test("★★ N5 está en el paquete y espera a #164 (congelado): sus 12 filas se leen", () => {
  assert.equal(FILAS.filter((f) => f.pieza === "t5-gano-o-perdio").length, 12);
});
