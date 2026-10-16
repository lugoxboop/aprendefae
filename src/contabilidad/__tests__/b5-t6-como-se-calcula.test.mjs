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
/*
 * Las cifras nuevas de Futaba (sección (5) del paquete): solo cambian los
 * montos. Lo que en (1) dice la cifra vieja se compara con la nueva. La
 * capa 4 lleva su propio cambio: allí $200.000, $20.000, $10.000 y $30.000
 * son otras cifras que en los grupos.
 */
const CAMBIO = {
  "$1.000.000": "$1.300.000", "$400.000": "$460.000", "$200.000": "$340.000", "$10.000": "$17.000", "$300.000": "$360.000",
  "$30.000": "$36.000", "$100.000": "$140.000", "$15.000": "$21.000", "$55.000": "$74.000", "$945.000": "$1.226.000",
};
const CAMBIO_CAPA_4 = { "$200.000": "$380.000", "$20.000": "$38.000", "$10.000": "$19.000", "$30.000": "$57.000" };
const conCifrasNuevas = (t, mapa) => t.replace(/\$\d{1,3}(?:\.\d{3})*/g, (m) => mapa[m] ?? m);
const I4 = FUTABA.indexOf("Capa 4 · En una frase");
const FUTABA_NUEVA = conCifrasNuevas(FUTABA.slice(0, I4), CAMBIO) + conCifrasNuevas(FUTABA.slice(I4), CAMBIO_CAPA_4);
const ENTREGA_2 = FUENTE.slice(FUENTE.indexOf("Futaba · entrega 2"));
const CIFRAS_NUEVAS = FUENTE.slice(FUENTE.indexOf("## (5) Futaba"));
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
  /* Lote C1-14: la caja ya no dice el grupo ni su monto, sino la deuda suelta. */
  ...D.GRUPOS_T6_A5.map((g) => ({ donde: `caja ${g.id}`, texto: `${g.deuda} ${g.revela}`, pie: g.pie })),
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
  /* La nota del 4 y su pie, corregidos por C7-6 del lote C2 · C1 · C7 (la de antes sigue guardada en la tabla de Futaba). */
  assert.ok(FUTABA.includes(`4 · Nota ✎\t—\t`), "la guarda: la nota del 4 en la tabla de Futaba");
  assert.ok(FUENTE.includes(`| C7-6 | T6 A5 · nota del término 4 | ${N[3].delLibro} | Corregida |`), "la nota del 4, literal de C7-6");
  assert.ok(FUENTE.includes(`Pie de C7-6: «${N[3].pieDelLibro}».`), "su pie, literal de C7-6");
  assert.equal(N[3].pieDelLibro, D.PIE_DECRETO_DIAN_Y_LIBRO);
  assert.equal(N[3].rotuloDelLibro, "Nota");
  assert.deepEqual([N[1].delLibro, N[2].delLibro], [undefined, undefined]);
});

test("★★★ el cambio de cifras es la tabla de Futaba (sección (5)), y la devolución correcta de la capa 4 es la que ella dicta", () => {
  for (const [antes, ahora] of [...Object.entries(CAMBIO), ...Object.entries(CAMBIO_CAPA_4)]) {
    const linea = CIFRAS_NUEVAS.split("\n").find((l) => l.includes(antes) && l.includes(ahora) && l.indexOf(antes) < l.lastIndexOf(ahora));
    assert.ok(linea, `${antes} → ${ahora} no está en la tabla de Futaba`);
  }
  assert.ok(CIFRAS_NUEVAS.includes("La devolución correcta de la capa 4 pasa a decir: «El 10 % de $380.000 es $38.000.»"));
  assert.ok(D.OPCIONES_FINAL_T6_A5[0].feedback.endsWith("El 10 % de $380.000 es $38.000."));
  /* Las cuentas de su comprobación. */
  for (const l of ["460.000 + 340.000 + 360.000 + 140.000 = 1.300.000.", "17.000 + 36.000 + 21.000 = 74.000.", "1.300.000 − 74.000 = 1.226.000."]) assert.ok(CIFRAS_NUEVAS.includes(l), l);
});

test("★★★ manda Futaba: los 11 pasos y el cierre, cada uno con su pie", () => {
  const filas = new Map();
  for (const l of FUTABA_NUEVA.slice(FUTABA_NUEVA.indexOf("Capa 2 ·"), FUTABA_NUEVA.indexOf("Comprobación:")).split("\n")) {
    const c = l.split("\t");
    if (c.length === 5 && /^\d+/.test(c[0])) filas.set(Number.parseInt(c[0], 10), { texto: c[1], pie: c[2] });
  }
  assert.equal(filas.size, 11, "la guarda: los 11 pasos");
  D.PASOS_T6_A5.forEach((p, k) => assert.deepEqual(p, filas.get(k + 1), `paso ${k + 1}`));
  assert.ok(FUTABA_NUEVA.includes(`Cierre\t${D.CIERRE_T6_A5.texto}\t${D.CIERRE_T6_A5.pie}\t`), "el cierre y su pie");
});

test("★★★ manda Futaba: las cuatro cajas (la deuda suelta de C1-14, con su grupo y su pie de antes), lo que revelan, el final y la capa 4", () => {
  /* El grupo de cada caja (la fila del tablero) y su pie siguen siendo los de Futaba. */
  for (const g of D.GRUPOS_T6_A5) {
    const fila = FUTABA_NUEVA.split("\n").find((l) => l.startsWith(`${g.nombre} · ${g.monto}\t`));
    assert.ok(fila, `${g.id}: su grupo en la tabla de Futaba`);
    assert.equal(fila.split("\t")[2], g.pie, `${g.id}: el pie de antes`);
  }
  /* Lo nuevo, literal de la tabla C1-14: la deuda, sus opciones, la correcta y lo que revela. */
  const C1_14 = FUENTE.slice(FUENTE.indexOf("### C1-14 · T6 A5 · capa 3"));
  for (const g of D.GRUPOS_T6_A5) {
    const opciones = g.opciones.map((o) => o.texto).join(" · ");
    const correcta = g.opciones.find((o) => o.id === g.correcta).texto;
    assert.ok(C1_14.includes(`| ${g.deuda} | ${opciones} | ${correcta} | ${g.revela} |`), g.id);
  }
  assert.ok(FUTABA_NUEVA.includes(`Cuando tocó las cuatro\t${D.FINAL_CAPA_3_T6_A5.texto}\t${D.FINAL_CAPA_3_T6_A5.pie}\t`));
  assert.ok(C1_14.includes(`Consigna: «${D.CONSIGNA_CAPA_3_T6_A5}»`), "la consigna de C1-14");
  assert.ok(FUTABA_NUEVA.includes(`Pregunta: ${D.PREGUNTA_FINAL_T6_A5} (70)`));
  for (const o of D.OPCIONES_FINAL_T6_A5) {
    const marca = o.correcta ? "✓" : "✗";
    assert.ok(FUTABA_NUEVA.includes(`${o.texto}\t${marca}\t${o.feedback}\t`) || FUTABA_NUEVA.includes(`${o.texto}\t${marca}\t✎ ${o.feedback}\t`), o.id);
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
  /* El de la nota del término 4 nombra también el concepto de la DIAN (C7-6). */
  { nombre: "decreto", es: (p) => p === "Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21" || p === "Fuente: Decreto 1625 de 2016, art. 1.2.1.18.21, y DIAN, Concepto 534 de 2026 · Libro, p. 201" },
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
  const dosFuentes = conPie().filter((x) => / · Libro, p\. 201$/.test(x.pie)).map((x) => x.donde);
  assert.deepEqual(dosFuentes, ["nota de «Una referencia colombiana»"]);
  assert.equal(N[3].pieDelLibro, D.PIE_DECRETO_DIAN_Y_LIBRO);
  assert.ok(!tieneCifraDelEjemplo(N[3].delLibro), "la nota de dos fuentes no trae cifras del ejemplo");
  /* Control: la regla atrapa un pie «Libro» puesto en un texto con cifra. */
  assert.ok(/Libro/.test(D.PIE_DECRETO_DIAN_Y_LIBRO) && tieneCifraDelEjemplo(D.PASOS_T6_A5[4].texto));
});

test("★★★ un porcentaje aplicado en el ejemplo («Al N %» o, en las cajas de C1-14, «le toca el N %») lleva el pie del porcentaje, y ese pie solo va ahí", () => {
  assert.equal(/\bAl \d+ %|\ble toca el \d+ %/.test("Más de un año: es el 15 %, el más alto."), false, "control: decir el porcentaje sin aplicarlo no cuenta");
  for (const x of conPie()) {
    const aplica = /\bAl \d+ %|\ble toca el \d+ %/.test(x.texto);
    assert.equal(x.pie === D.PIE_PORCENTAJE, aplica, `${x.donde}: «${x.pie}»`);
  }
});

/* ═══════════ NINGUNA CIFRA DE EL TORITO ═══════════ */

/* La lista negra: cada monto de El Torito en nuestras piezas de la provisión (pp. 200-203, tabla de la p. 201 incluida). */
/* $0 no es una cifra del libro: es «nada» (la opción «Queda en $0» de T6 · A3, entrega 2, y el grupo 1 de A5). */
const LISTA_NEGRA = [...new Set([...textosDe(TORITO), ...textosDe(TORITO_MESA)].flatMap(cifras))].filter((c) => c !== 0);

test("★★★ ninguna cifra de El Torito ni de la tabla de la p. 201 entra en la pieza", () => {
  for (const c of [2655000, 148800, 2506200, 180000, 31200, 153400, 184600]) assert.ok(LISTA_NEGRA.includes(c), `la lista negra no tiene ${pesos(c)}`);
  const usadas = new Set(textosDe(D).flatMap(cifras));
  const choques = [...usadas].filter((c) => LISTA_NEGRA.includes(c)).map(pesos);
  assert.deepEqual(choques, []);
  /* Ni sus nombres. */
  for (const t of textosDe(D)) assert.doesNotMatch(t, /Torito|Pablo Moncayo|Currambero/, t.slice(0, 40));
});

/* ═══════════ EL CRUCE DE CIFRAS (Sakuta) ═══════════ */

test("★★★ el registro: las cifras de los textos y del escenario son exactamente las cifras construidas registradas", () => {
  const enTextos = new Set(textosDe(D).flatMap(cifras));
  const enEscenario = new Set([E.total, E.provision, E.neto, ...E.grupos.flatMap((g) => [g.monto, provisionDe(g)]), E.pregunta.monto, E.pregunta.provision, (E.pregunta.monto * 5) / 100, (E.pregunta.monto * 15) / 100]);
  const registro = D.CIFRAS_CONSTRUIDAS_T6_A5;
  assert.deepEqual([...registro].sort((a, b) => a - b), registro, "el registro va ordenado");
  assert.deepEqual([...enTextos].sort((a, b) => a - b), registro, "una cifra en los textos que no está en el registro, o al revés");
  for (const c of enEscenario) assert.ok(registro.includes(c), `${pesos(c)} del escenario no está registrada`);
});

/*
 * La lista negra: toda cifra del libro que ya está en nuestros datos (T5 y T6:
 * El Torito, Dajema, Santa Pacha, Comercializadora Santa Pacha…), en los
 * textos y en los asientos. Se arma sola desde los módulos de datos.
 */
const MODULOS_DEL_LIBRO = [
  "contabilidadT5Act1.js", "contabilidadT5Act2.js", "contabilidadT5Pieza1.js", "contabilidadT5Pieza2.js",
  "contabilidadT6Act1.js", "contabilidadT6Act2.js", "contabilidadT6Act3.js",
  "contabilidadT6Pieza1.js", "contabilidadT6Pieza2.js", "contabilidadT6Pieza3.js", "contabilidadT6Pieza4.js",
];
const valoresDe = (mod) => {
  const out = [];
  const r = (v, k) => {
    if (typeof v === "number" && (k === "valor" || k === "monto")) out.push(v);
    else if (Array.isArray(v)) v.forEach((x) => r(x, k));
    else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) r(x, kk);
  };
  for (const [k, v] of Object.entries(mod)) r(v, k);
  return out;
};
/*
 * Las cifras del libro que no están en nuestros datos y que Futaba encontró
 * al cruzar el capítulo (pp. 176-275, OCR y, a ojo, las tablas de las pp. 201
 * y 269): las que hicieron cambiar el primer juego y las demás que nombró.
 */
const LIBRO_FUERA_DE_DATOS = {
  "p. 201, tabla de El Torito": [200000, 100000],
  "p. 269, ejercicio D-3 (El Toro Negro), datos": [1000000, 400000],
  "ejercicio D-3, la provisión que da": [2283400],
  "pp. 219-221, 241, 255, 270-274 (inventarios, compras, precios)": [300000, 10000, 30000, 15000, 20000, 945000, 200000, 100000],
};

test("★★★ la lista negra: ninguna cifra construida coincide con una cifra del libro (nuestros datos, el banco digitado de El Toro Negro y las que nombró Futaba)", async () => {
  const negra = new Set();
  for (const f of MODULOS_DEL_LIBRO) {
    const mod = await import(`../../data/${f}`);
    for (const c of [...textosDe(mod).flatMap(cifras), ...valoresDe(mod)]) negra.add(c);
  }
  negra.delete(0); // $0 no es una cifra del libro: es «nada»
  /* La guarda: la lista negra trae cifras de cada historia del libro. */
  for (const c of [2655000, 148800, 312500, 1350000, 1725000, 468750, 180000]) assert.ok(negra.has(c), `la lista negra no tiene ${pesos(c)}`);
  /* El banco digitado de la Célula E (El Toro Negro, D-3): todas sus cifras. */
  const toro = await import("../../data/repasoCap5ToroNegro.js");
  const numeros = (v) => (typeof v === "number" ? (v >= 1000 ? [v] : []) : typeof v === "string" ? cifras(v)
    : Array.isArray(v) ? v.flatMap(numeros) : v && typeof v === "object" ? Object.values(v).flatMap(numeros) : []);
  const delBanco = Object.values(toro).flatMap(numeros);
  for (const c of [1000000, 400000, 2283400]) assert.ok(delBanco.includes(c), `el banco digitado no trae ${pesos(c)}`);
  for (const c of [...delBanco, ...Object.values(LIBRO_FUERA_DE_DATOS).flat()]) negra.add(c);
  const choques = D.CIFRAS_CONSTRUIDAS_T6_A5.filter((c) => negra.has(c));
  assert.deepEqual(choques.map(pesos), []);
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
  /* Las de la capa 4: la deuda, lo que da al 10 % y los dos distractores (el 5 % y el 15 %). */
  const capa4 = [E.pregunta.monto, E.pregunta.provision, (E.pregunta.monto * 5) / 100, (E.pregunta.monto * 15) / 100];
  /* Las de la parada de la capa 2 (hoja 7): lo que da el grupo 2 al 5 % y sus dos distractores, con un cero de menos y uno de más. */
  const g2 = provisionDe(E.grupos[1]);
  const parada = [g2, g2 / 10, g2 * 10];
  const validas = new Set([E.total, E.provision, E.neto, 0, ...E.grupos.flatMap((g) => [g.monto, provisionDe(g)]), ...capa4, ...parada]);
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
  /* La capa 3: cada caja con el monto de su grupo y lo que da (C1-14: el grupo 1 dice que no se provisiona); el final, la suma. */
  D.GRUPOS_T6_A5.forEach((c, k) => {
    const g = E.grupos[k];
    assert.equal(c.id, g.id);
    assert.equal(c.monto, pesos(g.monto));
    if (g.porcentaje) {
      assert.equal(cifras(c.revela).at(-1), provisionDe(g), `${c.id}: lo que da su grupo`);
      assert.deepEqual(porcentajes(c.revela), [g.porcentaje]);
    } else {
      assert.deepEqual(cifras(c.revela), [], `${c.id}: sin cifras`);
      assert.match(c.revela, /no se provisiona\.$/);
    }
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
  for (const f of readdirSync(dir)) assert.ok(!readFileSync(new URL(f, dir), "utf8").includes(D.PIEZA_COMO_SE_CALCULA.id), `${f} trae la pieza`); /* el id entero: «b5-t6-a5» a secas es el Hacer 5 (0075) */
});
