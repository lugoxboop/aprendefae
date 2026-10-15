import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · PIEZA 2 — «La factura completa» (Célula C). Los datos y sus textos.
 *
 *   · cada texto de los datos está, letra por letra, en la v2 aprobada, y
 *     cada texto visible de la v2 está en los datos
 *   · las tablas (las dos fichas, los dos asientos y el lado a lado) son las
 *     de la v2, fila por fila
 *   · las sumas de los asientos se calculan de sus líneas, cuadran, y solo se
 *     muestran en el acierto
 *   · los totales que aparecen al ubicar bien una línea son los del asiento
 *   · ninguna cifra prohibida de otra cadena se cuela; no entra al catálogo
 *   · lote 2: las pistas (de cada pregunta y de cada línea) y la tercera
 *     opción de P2 son, letra por letra, las de Near
 *
 * La mecánica y la figura llegan con el paquete de Watari: cuando estén, las
 * pruebas de pantalla y de ancho se agregan aquí y en scripts/t7/.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const A = await import("../../data/contabilidadT7_1_ap2.js");

const RAIZ = new URL("../../../", import.meta.url);
const PAQUETE = readFileSync(new URL("orquestador/conocimiento/paquetes/t7-1-pieza2-v2.md", RAIZ), "utf8");
const CONTENIDO = PAQUETE.slice(PAQUETE.indexOf("## Contenido por pantalla y estado"), PAQUETE.indexOf("## Erratas C7"));
/* Lote 2 de la revisión de calidad (Near): las pistas del primer error y el anexo de la tercera opción. */
const LOTE2_PISTAS = readFileSync(new URL("orquestador/conocimiento/paquetes/lote2-pistas-v1.md", RAIZ), "utf8");
const LOTE2_ANEXO = readFileSync(new URL("orquestador/conocimiento/paquetes/lote2-anexo-v1.md", RAIZ), "utf8");
const P = A.PIEZA_LA_FACTURA_COMPLETA;
const pantalla = (id) => P.pantallas.find((x) => x.id === id);
const fichaComoTexto = (f) => `${f.dato}: ${f.texto}`;

/* Todo lo que el estudiante puede leer en la pieza, salvo las tablas, que se comparan aparte. */
function textosVisibles() {
  const t = [P.titulo];
  for (const p of P.pantallas) {
    for (const k of ["objetivo", "enunciado", "lineaResuelta", "consigna", "pregunta", "siguiente", "boton", "pie"]) if (p[k]) t.push(p[k]);
    if (p.parrafos) t.push(...p.parrafos);
    if (p.calculos) t.push(...p.calculos);
    for (const o of p.opciones ?? []) { t.push(o.texto); if (o.devolucion) t.push(o.devolucion); }
    if (p.pista) t.push(p.pista);
    for (const l of p.lineas ?? []) { t.push(l.texto, l.devolucion); if (l.pista) t.push(l.pista); }
    if (p.error) t.push(p.error.boton, p.error.pie);
    if (p.acierto) t.push(...p.acierto.textos, p.acierto.boton, p.acierto.pie);
    if (p.tipo === "eleccion" || p.tipo === "lados") t.push(A.BOTON.confirmar);
  }
  return t;
}

/*
 * Los «…» de primer nivel del contenido de la v2 que el estudiante ve. Se
 * dejan fuera las notas para el equipo: todo lo que va entre paréntesis
 * (referencias de página con citas del libro, como «(p. 212: «…»)», y
 * explicaciones de los pies, como «(dice «Ingresos por ventas», …)») y las
 * etiquetas de los errores («Si elige «…»:»). Ningún texto visible de la v2
 * lleva paréntesis; si alguno los trajera, la prueba 1 lo diría.
 */
function citasVisibles(md) {
  const sinRefs = md
    .replace(/\([^()]*\)/g, "")
    .replace(/Si elige «[^»]*»:/g, "Si elige:");
  const citas = [];
  let nivel = 0;
  let actual = "";
  for (const c of sinRefs) {
    if (c === "«") { if (nivel > 0) actual += c; nivel++; continue; }
    if (c === "»") { nivel--; if (nivel > 0) actual += c; else { citas.push(actual); actual = ""; } continue; }
    if (nivel > 0) actual += c;
  }
  assert.equal(nivel, 0, "las comillas del paquete no cierran");
  return citas;
}

/* Las filas de una tabla markdown que empiezan después de una línea dada. */
function tablaDespuesDe(md, marca) {
  const desde = md.indexOf(marca);
  assert.ok(desde >= 0, `no está «${marca}» en la v2`);
  const lineas = md.slice(desde).split("\n");
  const inicio = lineas.findIndex((l) => l.startsWith("|"));
  const filas = [];
  for (const l of lineas.slice(inicio)) {
    if (!l.startsWith("|")) break;
    filas.push(l.slice(1, -1).split("|").map((c) => c.trim()));
  }
  return filas.filter((f) => !f.every((c) => /^-*$/.test(c)));
}

/* ═══════════ 1 · LOS TEXTOS CONTRA LA v2 ═══════════ */

test("★★★ cada texto de los datos está, letra por letra, en la v2 aprobada (o, si es del lote 2, en su paquete)", () => {
  const faltan = textosVisibles().filter((t) => !PAQUETE.includes(t) && !LOTE2_PISTAS.includes(t) && !LOTE2_ANEXO.includes(t));
  assert.deepEqual(faltan, [], "estos textos no están en la v2 (ni en el lote 2) tal cual");
  /* La prueba 2 quita los paréntesis del paquete: ningún texto visible puede llevarlos. */
  assert.deepEqual(textosVisibles().filter((t) => /[()]/.test(t)), []);
  assert.ok(PAQUETE.includes(`- Título: ${P.titulo}`));
});

test("★★★ cada texto visible de la v2 está en los datos: no falta ninguno", () => {
  const datos = new Set(textosVisibles());
  const citas = citasVisibles(CONTENIDO);
  assert.ok(citas.length >= 50, `se leyeron solo ${citas.length} textos de la v2`);
  const faltan = citas.filter((c) => !datos.has(c));
  assert.deepEqual(faltan, [], "estos textos de la v2 no están en los datos");
});

test("★★ nada interno de la v2 en los textos, y sin el verbo «contar»", () => {
  const todo = textosVisibles().join("\n");
  for (const interno of ["interno", "construcción", "(nuevo)", "(cambia)", "igual que la v1", "(p. ", "(pp. ", "Mello", "Near", "corrección"]) {
    assert.ok(!todo.includes(interno), `se colaría «${interno}»`);
  }
  assert.doesNotMatch(todo, /(?<!\p{L})cont(ar|ó|amos|aron|aste)(?!\p{L})/iu);
});

/* ═══════════ LOTE 2 · LAS PISTAS Y EL ANEXO DE NEAR ═══════════ */

/* Las pistas del lote 2 de una pieza, por pantalla («id») o por línea («id · línea»). */
function pistasDeNear(pieza) {
  const desde = LOTE2_PISTAS.indexOf(`### ${pieza} `);
  assert.ok(desde >= 0, `la pieza ${pieza} no está en el lote 2`);
  const hasta = LOTE2_PISTAS.indexOf("\n### ", desde);
  return Object.fromEntries(LOTE2_PISTAS.slice(desde, hasta < 0 ? undefined : hasta).split("\n").filter((l) => /^\| P\d/.test(l)).map((l) => {
    const c = l.slice(1, -1).split("|").map((x) => x.trim());
    const [, id, linea] = c[0].match(/`([^`]+)`(?: · (\S+))?/);
    return [linea && linea !== "²" ? `${id} · ${linea}` : id, c[2].match(/^«(.+)»$/)[1]];
  }));
}

/* Las pistas que llevan los datos de una pieza, con las mismas claves. */
function pistasDeLosDatos(pieza) {
  const out = {};
  for (const p of pieza.pantallas) {
    if (p.opciones) out[p.id] = p.pista;
    for (const l of p.lineas ?? []) out[`${p.id} · ${l.id}`] = l.pista ?? p.pista;
  }
  return out;
}

/* Las filas del anexo del lote 2 de una pieza: su pantalla, las opciones que tenía (✓ = correcta), la tercera y su devolución. */
function filasDelAnexo(pieza) {
  return LOTE2_ANEXO.split("\n").filter((l) => l.startsWith(`| ${pieza} |`)).map((l) => {
    const c = l.slice(1, -1).split("|").map((x) => x.trim());
    return {
      pantalla: c[1].match(/`([^`]+)`/)[1],
      opciones: c[2].split(" · ").map((x) => ({ texto: x.replace(/ ✓$/, ""), correcta: x.endsWith(" ✓") })),
      tercera: c[3].match(/^\*\*(.+)\*\*$/)[1],
      devolucion: c[4].match(/^«(.+)»$/)[1],
    };
  });
}

/* Una pregunta del anexo: tres opciones; las dos de antes siguen (el anexo las nombra en corto) y la tercera es la suya. */
function comprobarAnexo(p, f) {
  assert.equal(p.opciones.length, 3, f.pantalla);
  const nueva = p.opciones.find((o) => o.texto === f.tercera);
  assert.ok(nueva, `${f.pantalla}: falta la tercera opción del anexo`);
  assert.deepEqual({ correcta: nueva.correcta, devolucion: nueva.devolucion }, { correcta: false, devolucion: f.devolucion }, f.pantalla);
  const viejas = p.opciones.filter((o) => o !== nueva);
  assert.equal(viejas.length, f.opciones.length, f.pantalla);
  for (const corta of f.opciones) {
    const o = viejas.filter((x) => corta.texto.split(", ").every((trozo) => x.texto.includes(trozo)));
    assert.equal(o.length, 1, `${f.pantalla}: «${corta.texto}»`);
    assert.equal(o[0].correcta, corta.correcta, `${f.pantalla}: «${corta.texto}»`);
  }
}

test("★★★ lote 2 · pistas: cada pregunta y cada línea de Debe o Haber lleva la suya, letra por letra la de Near", () => {
  assert.deepEqual(pistasDeLosDatos(P), pistasDeNear(A.AP2_ID));
});

test("★★★ lote 2 · anexo: P2 pasa de dos a tres opciones; las dos de la v2 siguen y la tercera es, letra por letra, la del anexo", () => {
  const filas = filasDelAnexo(A.AP2_ID);
  assert.deepEqual(filas.map((f) => f.pantalla), ["base-de-la-retencion"]);
  for (const f of filas) comprobarAnexo(pantalla(f.pantalla), f);
  /* Las dos de antes, con su devolución de la v2. */
  for (const o of pantalla("base-de-la-retencion").opciones.filter((x) => x.texto !== filas[0].tercera && !x.correcta)) assert.ok(PAQUETE.includes(`«${o.devolucion}»`), o.devolucion);
  /* La otra pregunta ya tenía tres: no la toca el anexo. */
  assert.equal(pantalla("lado-a-lado").opciones.length, 3);
});

/* ═══════════ 2 · LAS TABLAS ═══════════ */

test("★★★ las dos fichas son las de la v2, fila por fila", () => {
  const compra = tablaDespuesDe(CONTENIDO, "Ficha:\n").slice(1);
  assert.deepEqual(pantalla("base-de-la-retencion").ficha.map((f) => [f.dato, f.texto]), compra);
  const venta = tablaDespuesDe(CONTENIDO, "Ficha [igual que la v1]:").slice(1);
  assert.deepEqual(pantalla("la-venta").ficha.map((f) => [f.dato, f.texto]), venta);
});

test("★★★ los dos asientos son los de la v2, con sus sumas en la última fila", () => {
  for (const [id, marca] of [["lados-de-la-compra", "| 16 de abril | Debe | Haber |"], ["la-venta", "| 20 de abril | Debe | Haber |"]]) {
    const a = pantalla(id).acierto.asiento;
    const tabla = tablaDespuesDe(CONTENIDO, marca);
    const esperado = [
      [a.fecha, ...a.columnas],
      ...a.lineas.map((l) => [l.cuenta, l.lado === A.DEBE ? l.cifra : "", l.lado === A.HABER ? l.cifra : ""]),
      [a.rotuloSumas, a.sumas.debe, a.sumas.haber],
    ];
    assert.deepEqual(esperado, tabla, id);
  }
});

test("★★ la tabla lado a lado es la de la v2", () => {
  const t = pantalla("lado-a-lado").tabla;
  const tabla = tablaDespuesDe(CONTENIDO, "Tabla que se ve:");
  assert.deepEqual([t.columnas, ...t.filas], tabla);
});

/* ═══════════ 3 · LAS CIFRAS SE CALCULAN ═══════════ */

const numero = (s) => Number(s.replace(/[$.]/g, ""));

test("★★★ las sumas salen de las líneas, cuadran, y solo se muestran en el acierto", () => {
  for (const id of ["lados-de-la-compra", "la-venta"]) {
    const a = pantalla(id).acierto.asiento;
    const suma = (lado) => a.lineas.filter((l) => l.lado === lado).reduce((t, l) => t + l.monto, 0);
    assert.equal(numero(a.sumas.debe), suma(A.DEBE), id);
    assert.equal(numero(a.sumas.haber), suma(A.HABER), id);
    assert.equal(a.sumas.debe, a.sumas.haber, `${id}: el asiento no cuadra`);
    /* L: «las sumas del asiento no se muestran hasta el acierto». */
    assert.equal(a.mostrarSumasEn, "acierto");
    /* Y el colocando no trae ninguna suma escrita en sus textos. */
    const p = pantalla(id);
    const colocando = [p.enunciado, p.consigna, ...(p.calculos ?? []), ...p.lineas.map((l) => l.texto)].filter(Boolean).join(" ");
    assert.ok(!colocando.includes(a.sumas.debe), `${id}: la suma ${a.sumas.debe} se ve antes del acierto`);
  }
  assert.deepEqual(pantalla("lados-de-la-compra").acierto.asiento.sumas, { debe: "5.800.000", haber: "5.800.000" });
  assert.deepEqual(pantalla("la-venta").acierto.asiento.sumas, { debe: "2.320.000", haber: "2.320.000" });
});

test("★★★ el total que aparece al ubicar bien la línea es el del asiento, y sale de la cuenta del acierto", () => {
  /* Compra: 5.000.000 + 800.000 − 175.000. Venta: 2.000.000 + 320.000 − 70.000. */
  const casos = [
    ["lados-de-la-compra", "proveedores", "Cuentas por pagar – proveedores", 5000000 + 800000 - 175000],
    ["la-venta", "clientes", "Cuentas por cobrar – clientes", 2000000 + 320000 - 70000],
  ];
  for (const [id, linea, cuenta, total] of casos) {
    const p = pantalla(id);
    const l = p.lineas.find((x) => x.id === linea);
    assert.ok(l.texto.endsWith("· $?"), `${id}: el total se ve antes de ubicar la línea`);
    assert.equal(numero(l.textoResuelto.split("· ")[1]), total);
    assert.equal(p.acierto.asiento.lineas.find((x) => x.cuenta === cuenta).monto, total);
    assert.ok(p.acierto.textos[0].endsWith(`= $${l.textoResuelto.split("· $")[1]}.`), `${id}: el acierto no llega al mismo total`);
  }
  /* Y los lados de las líneas a ubicar son los del asiento. */
  for (const id of ["lados-de-la-compra", "la-venta"]) {
    const p = pantalla(id);
    const ladoEnAsiento = (texto) => p.acierto.asiento.lineas.find((x) => texto.startsWith(x.cuenta)).lado;
    for (const l of p.lineas) assert.equal(l.lado, ladoEnAsiento(l.texto), `${id} · ${l.id}`);
  }
});

test("★★ IVA y retención: 16 % y 3,5 % sobre la mercancía, sin el IVA", () => {
  const iva = (b) => Math.round(b * 0.16);
  const ret = (b) => Math.round(b * 0.035);
  assert.deepEqual(pantalla("base-de-la-retencion").calculos, [`IVA = $5.000.000 × 16 % = $${(iva(5000000)).toLocaleString("es-CO").replace(/,/g, ".")}`]);
  assert.match(pantalla("base-de-la-retencion").acierto.textos[0], new RegExp(`= \\$${"175.000".replace(".", "\\.")}\\.$`));
  assert.equal(ret(5000000), 175000);
  assert.equal(iva(2000000), 320000);
  assert.equal(ret(2000000), 70000);
  /* Las opciones falsas de la pregunta 1: la base con IVA (v2) y el IVA solo (anexo del lote 2). */
  assert.equal(numero(pantalla("base-de-la-retencion").opciones.find((o) => o.id === "con-iva").texto), 5000000 + iva(5000000));
  assert.equal(numero(pantalla("base-de-la-retencion").opciones.find((o) => o.id === "solo-iva").texto), iva(5000000));
  assert.deepEqual(pantalla("base-de-la-retencion").opciones.filter((o) => !o.correcta).map((o) => o.id).sort(), ["con-iva", "solo-iva"]);
});

/* ═══════════ 4 · LISTA DE CONTROL, CATÁLOGO E IDS ═══════════ */

test("★★ ninguna cifra prohibida de X2, X3 o X4 aparece en la pieza", () => {
  const todo = JSON.stringify(P);
  const prohibidas = [
    /* X2 */ "6.760.000", "17.460.000", "24.220.000", "1.518.000", "22.702.000", "11.091.000", "3.660.030", "7.430.970", "45.793.000", "23.091.000",
    /* X3 */ "1.200.000", "262.500", "8.437.500", "643.500", "8.700.000",
    /* X4 */ "2.432.000", "532.000", "17.100.000", "384.000", "2.700.000", "2.784.000",
  ];
  assert.deepEqual(prohibidas.filter((c) => todo.includes(c)), []);
});

test("★★ id con el prefijo t7- y fuera del catálogo de FP", () => {
  assert.equal(A.AP2_ID, "t7-1-a2-la-factura-completa");
  assert.equal(P.id, A.AP2_ID);
  const dir = new URL("supabase/migrations/", RAIZ);
  assert.deepEqual(readdirSync(dir).filter((f) => readFileSync(new URL(f, dir), "utf8").includes(A.AP2_ID)), []);
  const src = readFileSync(new URL("src/data/contabilidadT7_1_ap2.js", RAIZ), "utf8");
  assert.doesNotMatch(src, /from\s+["'][^"']*\/(fp|lib\/supabase)[^"']*["']|registrarActividad(Completada)?\s*\(|\.rpc\s*\(/);
});

test("★ siete pantallas en el orden de la v2; el resumen sin botón", () => {
  assert.deepEqual(P.pantallas.map((p) => p.id), ["portada", "dos-impuestos", "base-de-la-retencion", "lados-de-la-compra", "la-venta", "lado-a-lado", "resumen"]);
  assert.equal(pantalla("resumen").boton, null);
});
