import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 5 — «Cómo se calcula la provisión» (Célula B). LOS DATOS.
 *
 * La guía de Mai todavía no llega: estas pruebas vigilan el contenido. Las de
 * pantalla (el rótulo fijo visible en las capas 2 y 3, lo resaltado, las
 * cajas) llegan con los componentes.
 *
 *   · todo texto es literal del paquete (paquetes/b5-t6-aprender5.md) y de
 *     la versión que manda de Futaba, con el pie del término 1 de Sakuta
 *   · el rótulo «Escenario simulado · no es la tabla del libro»
 *   · los cuatro tipos de pie no se mezclan: ningún pie con «Libro» en un
 *     texto con una cifra del ejemplo; «Libro, p. 201» solo en la nota del
 *     término 4; un porcentaje aplicado lleva el pie del porcentaje
 *   · ninguna cifra de El Torito (pp. 200-203, la de la tabla de la p. 201
 *     incluida) entra en la pieza
 *   · las cuentas cuadran, y cada cifra de los textos sale del escenario
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = await import("../../data/contabilidadT6Pieza5.js");
const TORITO = await import("../../data/contabilidadT6Pieza3.js");
const TORITO_MESA = await import("../../data/contabilidadT6Act2.js");
const { pesos } = await import("../../data/contabilidad.js");

const FUENTE = readFileSync(new URL("../../../orquestador/conocimiento/paquetes/b5-t6-aprender5.md", import.meta.url), "utf8");
const FUTABA = FUENTE.slice(FUENTE.indexOf("## (1) Futaba"));
const E = D.ESCENARIO_T6_A5;
const N = D.PIEZA_COMO_SE_CALCULA.nombres;

/* Todos los textos de un módulo de datos (los ids y los números no son texto). */
const textosDe = (mod) => {
  const out = [];
  const recoger = (v, k) => {
    if (typeof v === "string") { if (k !== "id") out.push(v); }
    else if (Array.isArray(v)) v.forEach((x) => recoger(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) recoger(x, kk);
  };
  for (const [k, v] of Object.entries(mod)) recoger(v, k);
  return out;
};
/* Cada texto que ve el estudiante con su pie. */
const conPie = () => [
  ...N.map((n) => ({ donde: `término «${n.termino}»`, texto: n.definicion, pie: n.pie })),
  ...N.filter((n) => n.pieDelLibro).map((n) => ({ donde: `nota de «${n.termino}»`, texto: n.delLibro, pie: n.pieDelLibro })),
  ...D.PASOS_T6_A5.map((p, k) => ({ donde: `paso ${k + 1}`, ...p })),
  { donde: "cierre", ...D.CIERRE_T6_A5 },
  ...D.GRUPOS_T6_A5.map((g) => ({ donde: `caja ${g.id}`, texto: `${g.nombre} ${g.monto} ${g.revela}`, pie: g.pie })),
  { donde: "final de la capa 3", ...D.FINAL_CAPA_3_T6_A5 },
];
/* Las cifras en pesos de un texto: «$1.000.000» → 1000000. */
const cifras = (t) => [...t.matchAll(/\$(\d{1,3}(?:\.\d{3})*)/g)].map((m) => Number(m[1].replace(/\./g, "")));
const porcentajes = (t) => [...t.matchAll(/(\d+) %/g)].map((m) => Number(m[1]));
/* Una cifra del ejemplo: un monto en pesos o un porcentaje aplicado. */
const tieneCifraDelEjemplo = (t) => cifras(t).length > 0 || porcentajes(t).length > 0;

/* ═══════════ TEXTOS ═══════════ */

test("★★★ todo texto de los datos es literal del paquete guardado (paquetes/b5-t6-aprender5.md)", () => {
  const textos = textosDe(D);
  assert.ok(textos.length > 40, `solo ${textos.length} textos`);
  assert.deepEqual(textos.filter((t) => !FUENTE.includes(t)), []);
});

test("★★★ manda Futaba: los cuatro términos con su pie (el del término 1, el de Sakuta), la cita del 1 y la nota del 4", () => {
  assert.deepEqual(N.map((x) => x.termino), ["Análisis de vencimiento", "Un porcentaje por grupo", "La provisión", "Una referencia colombiana"]);
  const fila = (x) => FUTABA.split("\n").find((l) => l.split("\t")[1] === x.termino)?.split("\t");
  N.forEach((x, k) => {
    const f = fila(x);
    assert.ok(f, `término «${x.termino}» en la tabla de Futaba`);
    assert.equal(f[2], x.definicion, `texto del término ${k + 1}`);
    /* Sakuta cambió solo el pie del término 1. */
    assert.equal(x.pie, k === 0 ? "Basado en el libro, pp. 200-201" : f[3], `pie del término ${k + 1}`);
  });
  assert.equal(fila(N[0])[3], "Basado en el libro, p. 200", "la guarda: Futaba decía p. 200");
  assert.match(FUENTE, /El pie del término 1 es «Basado en el libro, pp\. 200-201»/);
  /* La cita del 1, con su página; la nota del 4, con su rótulo y su pie de dos fuentes. */
  assert.ok(FUTABA.includes(`1 · Así lo dice el libro\t—\t${N[0].delLibro.replace(/ \(p\. 201\)$/, "")}\t(p. 201)`));
  assert.equal(N[0].rotuloDelLibro, undefined);
  assert.ok(FUTABA.includes(`4 · Nota ✎\t—\t${N[3].delLibro}\t${N[3].pieDelLibro}\t`));
  assert.equal(N[3].rotuloDelLibro, "Nota");
  assert.deepEqual([N[1].delLibro, N[2].delLibro], [undefined, undefined]);
});

test("★★★ manda Futaba: los 11 pasos y el cierre, cada uno con su pie", () => {
  const filas = new Map();
  for (const l of FUTABA.slice(FUTABA.indexOf("Capa 2 ·"), FUTABA.indexOf("Comprobación:")).split("\n")) {
    const c = l.split("\t");
    if (c.length === 5 && /^\d+/.test(c[0])) filas.set(Number.parseInt(c[0], 10), { texto: c[1], pie: c[2] });
  }
  assert.equal(filas.size, 11, "la guarda: los 11 pasos");
  D.PASOS_T6_A5.forEach((p, k) => assert.deepEqual(p, filas.get(k + 1), `paso ${k + 1}`));
  assert.ok(FUTABA.includes(`Cierre\t${D.CIERRE_T6_A5.texto}\t${D.CIERRE_T6_A5.pie}\t`), "el cierre y su pie");
});

test("★★★ manda Futaba: las cuatro cajas (nombre · monto), lo que revelan, el final y la capa 4", () => {
  for (const g of D.GRUPOS_T6_A5) assert.ok(FUTABA.includes(`${g.nombre} · ${g.monto}\t✎ ${g.revela}\t${g.pie}\t`) || FUTABA.includes(`${g.nombre} · ${g.monto}\t${g.revela}\t${g.pie}\t`), g.id);
  assert.ok(FUTABA.includes(`Cuando tocó las cuatro\t${D.FINAL_CAPA_3_T6_A5.texto}\t${D.FINAL_CAPA_3_T6_A5.pie}\t`));
  assert.ok(FUTABA.includes(`Consigna: ${D.CONSIGNA_CAPA_3_T6_A5} (85)`));
  assert.ok(FUTABA.includes(`Pregunta: ${D.PREGUNTA_FINAL_T6_A5} (70)`));
  for (const o of D.OPCIONES_FINAL_T6_A5) {
    const marca = o.correcta ? "✓" : "✗";
    assert.ok(FUTABA.includes(`${o.texto}\t${marca}\t${o.feedback}\t`) || FUTABA.includes(`${o.texto}\t${marca}\t✎ ${o.feedback}\t`), o.id);
  }
  assert.equal(D.OPCIONES_FINAL_T6_A5.filter((o) => o.correcta).length, 1);
});

test("★★★ ninguna marca de trabajo se pinta (✎, las cifras de legibilidad, «nuevo»)", () => {
  for (const t of textosDe(D)) {
    assert.ok(!t.includes("✎"), `«${t.slice(0, 40)}» trae ✎`);
    assert.doesNotMatch(t, /\(\d{2,3}\)$/, `«${t.slice(0, 40)}» trae su cifra de legibilidad`);
  }
});

/* ═══════════ EL ESCENARIO SIMULADO ═══════════ */

test("★★★ el rótulo fijo dice que es un escenario simulado y no la tabla del libro", () => {
  assert.equal(D.ROTULO_SIMULADO_T6_A5, "Escenario simulado · no es la tabla del libro");
  assert.ok(FUTABA.includes(`Rótulo fijo en pantalla durante las capas 2 y 3: «${D.ROTULO_SIMULADO_T6_A5}».`));
});

/* ═══════════ LOS CUATRO TIPOS DE PIE ═══════════ */

const TIPOS = [
  { nombre: "libro", es: (p) => /^Basado en el libro, (p\. \d+|pp\. \d+-\d+)$/.test(p) },
  { nombre: "simulado", es: (p) => p === "Escenario simulado" },
  { nombre: "porcentaje", es: (p) => p === "Fuente del porcentaje: Decreto 1625 de 2016" },
  { nombre: "decreto", es: (p) => p === "Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21" || p === "Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21 · Libro, p. 201" },
];
const tipoDe = (p) => TIPOS.filter((t) => t.es(p)).map((t) => t.nombre);

test("★★★ cada pie es de uno, y solo uno, de los cuatro tipos (y uno mezclado no lo es)", () => {
  assert.deepEqual(tipoDe("Escenario simulado · Libro, p. 201"), [], "control: un pie mezclado no es de ningún tipo");
  assert.deepEqual(tipoDe("Libro, p. 202"), [], "control: el pie «Libro» de otras piezas no es de esta");
  const items = conPie();
  assert.equal(items.length, 4 + 1 + 11 + 1 + 4 + 1);
  for (const x of items) assert.equal(tipoDe(x.pie).length, 1, `${x.donde}: «${x.pie}»`);
});

test("★★★ ningún pie con «Libro» va en un texto con una cifra del ejemplo; «· Libro, p. 201» solo en la nota del término 4", () => {
  const malos = conPie().filter((x) => /Libro/.test(x.pie) && tieneCifraDelEjemplo(x.texto)).map((x) => x.donde);
  assert.deepEqual(malos, []);
  const dosFuentes = conPie().filter((x) => x.pie === D.PIE_DECRETO_Y_LIBRO).map((x) => x.donde);
  assert.deepEqual(dosFuentes, ["nota de «Una referencia colombiana»"]);
  assert.ok(!tieneCifraDelEjemplo(N[3].delLibro), "la nota de dos fuentes no trae cifras del ejemplo");
  /* Control: la regla atrapa un pie «Libro» puesto en un texto con cifra. */
  assert.ok(/Libro/.test(D.PIE_DECRETO_Y_LIBRO) && tieneCifraDelEjemplo(D.PASOS_T6_A5[4].texto));
});

test("★★★ un porcentaje aplicado en el ejemplo («Al N %») lleva el pie del porcentaje, y ese pie solo va ahí", () => {
  for (const x of conPie()) {
    const aplica = /\bAl \d+ %/.test(x.texto);
    assert.equal(x.pie === D.PIE_PORCENTAJE, aplica, `${x.donde}: «${x.pie}»`);
  }
});

/* ═══════════ NINGUNA CIFRA DE EL TORITO ═══════════ */

/* La lista negra: cada monto de El Torito en nuestras piezas de la provisión (pp. 200-203, tabla de la p. 201 incluida). */
const LISTA_NEGRA = [...new Set([...textosDe(TORITO), ...textosDe(TORITO_MESA)].flatMap(cifras))];

test("★★★ ninguna cifra de El Torito ni de la tabla de la p. 201 entra en la pieza", () => {
  for (const c of [2655000, 148800, 2506200, 180000, 31200, 153400, 184600]) assert.ok(LISTA_NEGRA.includes(c), `la lista negra no tiene ${pesos(c)}`);
  const usadas = new Set(textosDe(D).flatMap(cifras));
  const choques = [...usadas].filter((c) => LISTA_NEGRA.includes(c)).map(pesos);
  assert.deepEqual(choques, []);
  /* Ni sus nombres. */
  for (const t of textosDe(D)) assert.doesNotMatch(t, /Torito|Pablo Moncayo|Currambero/, t.slice(0, 40));
});

/* ═══════════ LAS CUENTAS CUADRAN ═══════════ */

const provisionDe = (g) => (g.monto * g.porcentaje) / 100;

test("★★★ las cuentas cuadran: los grupos suman el total, cada provisión es su porcentaje, la suma es la provisión y el neto es la resta", () => {
  assert.equal(E.grupos.reduce((s, g) => s + g.monto, 0), E.total);
  assert.equal(E.grupos.reduce((s, g) => s + provisionDe(g), 0), E.provision);
  assert.equal(E.total - E.provision, E.neto);
  /* Los porcentajes son los del decreto, en el orden del término 4, y crecen con el vencimiento. */
  assert.deepEqual(E.grupos.map((g) => g.porcentaje), [0, 5, 10, 15]);
  assert.deepEqual(porcentajes(N[3].definicion), [5, 10, 15]);
});

test("★★★ cada cifra de los textos sale del escenario (ni una suelta), y cada paso dice las suyas", () => {
  const validas = new Set([E.total, E.provision, E.neto, 0, ...E.grupos.flatMap((g) => [g.monto, provisionDe(g)]), E.pregunta.monto, E.pregunta.provision]);
  for (const t of textosDe(D)) for (const c of cifras(t)) assert.ok(validas.has(c), `${pesos(c)} no sale del escenario: «${t.slice(0, 50)}»`);
  const P = D.PASOS_T6_A5.map((p) => p.texto);
  assert.deepEqual(cifras(P[0]), [E.total]);
  /* Pasos 4 a 7: el monto de cada grupo, su porcentaje y lo que da. */
  E.grupos.forEach((g, k) => {
    const t = P[3 + k];
    assert.equal(cifras(t)[0], g.monto, `paso ${4 + k}: el monto`);
    if (g.porcentaje) {
      assert.deepEqual(porcentajes(t), [g.porcentaje], `paso ${4 + k}: el porcentaje`);
      assert.equal(cifras(t)[1], provisionDe(g), `paso ${4 + k}: lo que da`);
    } else assert.match(t, /no se provisiona nada/);
  });
  assert.deepEqual(cifras(P[7]), [...E.grupos.filter((g) => g.porcentaje).map(provisionDe), E.provision], "paso 8: la suma");
  assert.deepEqual(cifras(P[8]), [E.provision], "paso 9: el gasto");
  assert.deepEqual(cifras(P[10]), [E.total, E.provision, E.neto], "paso 11: el neto");
  /* La capa 3: cada caja con su monto y lo que da; el final, la suma. */
  D.GRUPOS_T6_A5.forEach((c, k) => {
    const g = E.grupos[k];
    assert.equal(c.id, g.id);
    assert.equal(c.monto, pesos(g.monto));
    assert.equal(cifras(c.revela).at(-1), provisionDe(g), `${c.id}: lo que da`);
    if (g.porcentaje) assert.deepEqual(porcentajes(c.revela), [g.porcentaje]);
  });
  assert.deepEqual(cifras(D.FINAL_CAPA_3_T6_A5.texto), [E.provision]);
});

test("★★★ la capa 4 cuadra: ocho meses caen en el grupo del 10 %, y las equivocadas son el 5 %, el 15 % y nada", () => {
  const q = E.pregunta;
  const tramo = (m) => (m <= 3 ? 0 : m <= 6 ? 5 : m <= 12 ? 10 : 15);
  assert.equal(tramo(q.meses), q.porcentaje);
  assert.equal((q.monto * q.porcentaje) / 100, q.provision);
  assert.deepEqual(cifras(D.PREGUNTA_FINAL_T6_A5), [q.monto]);
  const [bien, cinco, quince, nada] = D.OPCIONES_FINAL_T6_A5;
  assert.equal(bien.texto, pesos(q.provision));
  assert.equal(cinco.texto, pesos((q.monto * 5) / 100));
  assert.equal(quince.texto, pesos((q.monto * 15) / 100));
  assert.equal(nada.texto, "Nada");
  assert.deepEqual(porcentajes(bien.feedback), [10, 10]);
  assert.deepEqual(porcentajes(cinco.feedback), [5]);
  assert.deepEqual(porcentajes(quince.feedback), [15]);
});

/* ═══════════ IDS Y CATÁLOGO ═══════════ */

test("★★ identificadores nuevos con b5-, y la pieza no va al catálogo (Aprender no paga)", async () => {
  assert.match(D.PIEZA_COMO_SE_CALCULA.id, /^b5-t6-a5-/);
  for (const o of D.OPCIONES_FINAL_T6_A5) assert.match(o.id, /^b5-t6-a5-/);
  /* En el tema es una pieza de APRENDER, sin dificultad ni FP; ninguna migración la trae al catálogo. */
  const { SUBJECTS, APRENDER } = await import("../../data/subjects.js");
  const a = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-por-cobrar").actividades.find((x) => x.id === D.PIEZA_COMO_SE_CALCULA.id);
  assert.deepEqual(a.clasificacion, { tipo: APRENDER });
  assert.equal(a.nombre, D.PIEZA_COMO_SE_CALCULA.titulo);
  const { readdirSync } = await import("node:fs");
  const dir = new URL("../../../supabase/migrations/", import.meta.url);
  for (const f of readdirSync(dir)) assert.ok(!readFileSync(new URL(f, dir), "utf8").includes("b5-t6-a5"), `${f} trae la pieza`);
});
