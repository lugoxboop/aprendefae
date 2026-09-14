import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { barajar } from "../../utils/barajar.js";
import {
  porcentaje, INSTRUMENTOS, CLASIFICADOR, TARJETAS_POR_PARTIDA, retroClasificador, retroArchivoClasificador,
  DEUDA_VS_SERVICIO, SELLOS, IMPUESTOS_SELLO, retroSello, CANALES, MEDIDAS_FLUJO, retroFlujo,
  OPCIONES_MULTIPLICADOR, puntuarFlujo, OPCIONES_AGUJERO, CASOS_EXPANSIVA, CASILLAS_PRESUPUESTO,
  PIEZAS_PRESUPUESTO, puntuarPresupuesto, BANCO_DEFICIT, BANDEJAS, PAPELES_POR_PARTIDA, MINIMO_NINGUNO,
  sortearPapeles, retroDeficit, retroCaidaDeficit,
} from "../politicaFiscal.js";

/*
 * Los bancos de Política Fiscal, comprobados sin montar ninguna pantalla: que
 * el 100 % sea alcanzable, que los bancos tengan el tamaño y el reparto de la
 * ficha, que las devoluciones empiecen por su emoji y que la distinción
 * deuda/servicio salga donde tiene que salir.
 */

/* ─────────────────────────── la trampa del redondeo ─────────────────────────── */

test("todo bien da exactamente 100 en los siete, sin redondear", () => {
  assert.equal(porcentaje(12, 12), 100);
  assert.equal(porcentaje(8, 8), 100);
  assert.equal(puntuarFlujo(4, true), 100);
  assert.equal(porcentaje(3, 3), 100);
  assert.equal(puntuarPresupuesto({ gasto: {}, financiacion: {} }, 0), 100);
  assert.equal(porcentaje(10, 10), 100);
});

test("un porcentaje por ítem escrito a mano no llegaría al 100: por eso no hay ninguno", () => {
  /* La trampa, medida: la suma de porcentajes redondeados por ítem se queda corta. */
  assert.ok(12 * 8.33 < 100 && 3 * 33.3 < 100, "si esto dejara de ser cierto, el comentario de politicaFiscal.js sobra");
  /* Y la división al final no pierde nada en medio. */
  assert.ok(Math.abs(porcentaje(11, 12) - 91.6667) < 0.001);
  assert.ok(Math.abs(porcentaje(2, 3) - 66.6667) < 0.001);
  assert.equal(puntuarFlujo(3, false), 45);
  assert.equal(puntuarFlujo(0, true), 40);
  assert.equal(puntuarPresupuesto({ gasto: {}, financiacion: {} }, 3), 85);
  assert.equal(puntuarPresupuesto({ gasto: {} }, 20), 0, "el piso es 0");
});

/* ─────────────────────────── los bancos, como la ficha ─────────────────────────── */

test("clasificador: 18 tarjetas, 12 por partida, repartidas 9 / 5 / 4", () => {
  assert.equal(CLASIFICADOR.length, 18);
  assert.equal(TARJETAS_POR_PARTIDA, 12);
  const n = (id) => CLASIFICADOR.filter((t) => t.instrumento === id).length;
  assert.deepEqual([n("tributacion"), n("gasto"), n("deuda")], [9, 5, 4]);
  assert.ok(CLASIFICADOR.every((t) => INSTRUMENTOS.some((x) => x.id === t.instrumento)));
  const siete = CLASIFICADOR.find((t) => t.id === "intereses-bono");
  assert.deepEqual([siete.instrumento, siete.variedad], ["gasto", "Servicio de la deuda"]);
});

test("sellos: ocho impuestos, cada uno con una categoría que existe", () => {
  assert.equal(IMPUESTOS_SELLO.length, 8);
  assert.ok(IMPUESTOS_SELLO.every((x) => SELLOS.some((s) => s.id === x.categoria)));
  assert.equal(IMPUESTOS_SELLO.find((x) => x.id === "timbre").categoria, "indirecto");
});

test("timbre: su respuesta se cambia con un solo campo del dato", () => {
  /* Si el profesor lo pasa a directo, la devolución sigue a la fila, sin tocar código. */
  const fila = { ...IMPUESTOS_SELLO.find((x) => x.id === "timbre"), categoria: "directo" };
  assert.ok(retroSello(fila, "directo").startsWith("✅ Directo"));
  assert.ok(retroSello(fila, "indirecto").startsWith("❌ Es Directo, no Indirecto"));
});

test("flujo de caja: cuatro medidas, tres canales, una respuesta buena en el multiplicador", () => {
  assert.equal(MEDIDAS_FLUJO.length, 4);
  assert.ok(MEDIDAS_FLUJO.every((m) => CANALES.some((c) => c.id === m.canal)));
  assert.equal(OPCIONES_MULTIPLICADOR.filter((o) => o.correcta).map((o) => o.texto).join(), "Más de $1 billón");
  assert.equal(retroFlujo(MEDIDAS_FLUJO[0], "g"), "❌ Esto pasa por Tributación → Consumo, no por Gasto del Gobierno → G directamente.");
});

test("agujero fiscal: cuatro opciones y la buena es la del IVA regresivo", () => {
  assert.equal(OPCIONES_AGUJERO.length, 4);
  assert.deepEqual(OPCIONES_AGUJERO.filter((o) => o.correcta).map((o) => o.id), ["b"]);
});

test("expansiva o contractiva: los duelos no contradicen su ranking (sin ciclos)", () => {
  for (const c of CASOS_EXPANSIVA) {
    assert.equal(c.duelos.length, 3, c.id);
    for (const d of c.duelos) {
      assert.ok(d.par.includes(d.gana), `${c.id}:${d.id} gana quien no juega`);
      const [x, y] = d.par;
      const mejor = c.ranking.indexOf(x) < c.ranking.indexOf(y) ? x : y;
      assert.equal(d.gana, mejor, `${c.id}:${d.id} contradice el ranking`);
    }
  }
  assert.deepEqual(CASOS_EXPANSIVA.map((c) => c.ranking.join(">")), ["A>B>C", "B>A>C"]);
});

test("presupuesto: dos correctas (una por casilla) y ocho señuelos, cinco escritos aquí", () => {
  assert.equal(PIEZAS_PRESUPUESTO.length, 10);
  for (const c of CASILLAS_PRESUPUESTO) assert.equal(PIEZAS_PRESUPUESTO.filter((p) => p.papel === c.id).length, 1, c.id);
  const senuelos = PIEZAS_PRESUPUESTO.filter((p) => p.papel === "senuelo");
  assert.equal(senuelos.length, 8);
  assert.equal(senuelos.filter((p) => p.propio).length, 5);
  assert.equal(CASILLAS_PRESUPUESTO.reduce((s, c) => s + c.peso, 0), 100);
});

test("déficit vs deuda: 14 papeles, 4 de «Ninguno», y el primero sin la errata", () => {
  assert.equal(BANCO_DEFICIT.length, 14);
  assert.equal(BANCO_DEFICIT.filter((x) => x.bandeja === "ninguno").length, 4);
  assert.ok(BANCO_DEFICIT.every((x) => BANDEJAS.some((b) => b.id === x.bandeja)));
  assert.equal(BANCO_DEFICIT[0].texto, "El déficit fiscal de este año fue del 6% del PIB.");
  /* Las cuatro de «Ninguno» se explican, no se etiquetan. */
  assert.ok(BANCO_DEFICIT.filter((x) => x.bandeja === "ninguno").every((x) => (x.aclaracion ?? "").length > 60));
});

test("el sorteo de déficit vs deuda: 10 distintos y al menos 2 de «Ninguno», siempre", () => {
  for (let k = 0; k < 800; k++) {
    const t = sortearPapeles(barajar);
    assert.equal(t.length, PAPELES_POR_PARTIDA);
    assert.equal(new Set(t.map((x) => x.id)).size, PAPELES_POR_PARTIDA);
    assert.ok(t.filter((x) => x.bandeja === "ninguno").length >= MINIMO_NINGUNO);
  }
});

/* ─────────────────────── la distinción deuda / servicio de la deuda ─────────────────────── */

test("la distinción deuda/servicio sale en los dos juegos, acierte o falle, y solo ahí", () => {
  const bono = CLASIFICADOR.find((t) => t.id === "intereses-bono");
  const bid = BANCO_DEFICIT.find((x) => x.id === "intereses-bid");
  for (const r of [
    retroClasificador(bono, "gasto"), retroClasificador(bono, "deuda"), retroArchivoClasificador(bono),
    retroDeficit(bid, "gasto"), retroDeficit(bid, "deuda"), retroCaidaDeficit(bid),
  ]) {
    assert.ok(r.includes(DEUDA_VS_SERVICIO), `falta la distinción en: ${r}`);
  }
  /* Y no se cuela en otros ítems, donde sería ruido. */
  const otros = CLASIFICADOR.filter((t) => t.id !== "intereses-bono").map((t) => retroClasificador(t, "deuda"));
  assert.ok(otros.every((r) => !r.includes(DEUDA_VS_SERVICIO)));
  /* La explicación dice las dos cosas, con palabras: contraer es Deuda y pagar intereses es Gasto. */
  assert.match(DEUDA_VS_SERVICIO, /Deuda Pública/);
  assert.match(DEUDA_VS_SERVICIO, /Gasto del Gobierno/);
});

/* ─────────────────────────── las cadenas, revisadas ─────────────────────────── */

test("toda devolución empieza por ✅ o ❌ y termina en punto", () => {
  const todas = [
    ...CLASIFICADOR.flatMap((t) => INSTRUMENTOS.map((x) => retroClasificador(t, x.id))),
    ...CLASIFICADOR.map(retroArchivoClasificador),
    ...IMPUESTOS_SELLO.flatMap((x) => SELLOS.map((s) => retroSello(x, s.id))),
    ...MEDIDAS_FLUJO.flatMap((m) => CANALES.map((c) => retroFlujo(m, c.id))),
    ...OPCIONES_MULTIPLICADOR.map((o) => o.retro),
    ...OPCIONES_AGUJERO.map((o) => o.retro),
    ...PIEZAS_PRESUPUESTO.map((p) => p.retro),
    ...BANCO_DEFICIT.flatMap((x) => BANDEJAS.map((b) => retroDeficit(x, b.id))),
    ...BANCO_DEFICIT.map(retroCaidaDeficit),
  ];
  const malas = todas.filter((r) => !/^(✅|❌) /.test(r) || !/[.]$/.test(r));
  assert.deepEqual(malas, []);
});

test("la errata «défict» no está en ningún banco, ni otras dobles de espacio", () => {
  const fuente = readFileSync(fileURLToPath(new URL("../politicaFiscal.js", import.meta.url)), "utf8");
  /* Solo el texto entre comillas: el comentario puede citar la errata para explicarla. */
  const cadenas = [...fuente.matchAll(/"([^"\n]*)"/g)].map((m) => m[1]);
  assert.deepEqual(cadenas.filter((s) => /défict|deficit /i.test(s) && !/déficit/.test(s)), []);
  assert.deepEqual(cadenas.filter((s) => / {2,}/.test(s)), []);
});
