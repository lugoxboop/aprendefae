import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A4 «Bancos y notas del banco» (Célula D) · REDISEÑO DE ENGANCHE.
 *
 *   · cada texto es el del paquete vigente (d4-t4-a4-v4-rediseno.md, los
 *     textos de Katsumi aprobados por Yujiro), letra por letra, en su lugar
 *   · Bancos y las dos libretas de Hanayama: consignar y girar, el extracto,
 *     los siete movimientos (con el acierto, su nombre entra al mayor; con el
 *     error, ✗ en el botón, nada se escribe y «Incorrecto.» para el lector;
 *     con los siete, «Sube» y «Baja» desaparecen: corte de Yujiro), quién
 *     tiene el cheque (su renglón no existe antes del acierto: PH8-2) y las
 *     seis causas
 *   · el tope del mayor de P2 es el mismo en los siete movimientos (la
 *     tarjeta reserva su alto); los términos, «Nota débito» y «Nota crédito»
 *   · lo común (t4-aprender-rd.mjs): «Seguir» tras el acierto, PH8-2, B4,
 *     ningún error que nombre la respuesta y Aprender sin FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const R = await import("./t4-aprender-rd.mjs");
const { q, abrir, jugar, seguir, tocar, esperar, pruebasComunes, seccionDe, renglones, textoDe, datos } = { ...R, datos: (await import("./t4-rediseno-canon.mjs")).datos };
const A = await import("../../data/contabilidadT4A4.js");
const T = await import("../../data/contabilidadT4.js");
const { visible } = await import("./t4-dom.mjs");

const P = A.PIEZA_BANCOS_Y_NOTAS;
const { PAQ } = pruebasComunes({
  P,
  canon: "d4-t4-a4-v4-rediseno.md",
  datos: "src/data/contabilidadT4A4.js",
  piezas: ["src/data/contabilidadT4A4.js", "src/components/t4/A4BancosYNotas.jsx", "src/components/t4/aprender.jsx", "src/components/t4/tablero.jsx"],
  noNombra: { "quien-lo-tiene": ["empresa", "Empresa"] },
  antesDe: "t4-a3-el-arqueo",
  preguntas: ["sube-o-baja", "quien-lo-tiene"],
});

const renglonesLibreta = (m) => [...m.caja.querySelectorAll("[data-renglon]")].map((r) => [...r.children].map((c) => visible(c)));
const lineasMayor = (m, lado) => [...m.caja.querySelectorAll(`[data-columna="${lado}"] [data-linea]`)].map((x) => [...x.querySelectorAll("span")].map((s) => s.textContent).join(" / "));

/* ═══════════ LOS DATOS CONTRA EL PAQUETE ═══════════ */

test("★★★ los siete movimientos (pp. 186-187): tarjeta, lado y nombre en el mayor, los del paquete y en su orden", () => {
  const s = seccionDe(PAQ, "Los siete movimientos (P2)");
  const r = renglones(s);
  const d = datos(s);
  assert.equal(A.MOVIMIENTOS_A4.length, 7);
  A.MOVIMIENTOS_A4.forEach((m, i) => {
    assert.equal(m.texto, textoDe(r, `Movimiento ${i + 1} · tarjeta`), `${i + 1}`);
    assert.equal(m.va, d[`Movimiento ${i + 1} · va a`], `${i + 1}`);
    assert.equal(m.mayor.join(" / "), textoDe(r, `Movimiento ${i + 1} · en el mayor`), `${i + 1}`);
  });
});

test("★★★ las seis causas (p. 188): libreta, rótulo en renglones fijos y efecto, los del paquete", () => {
  const s = seccionDe(PAQ, "Las seis causas (P4)");
  const r = renglones(s);
  const d = datos(s);
  A.CAUSAS_A4.forEach((c, i) => {
    const x = c.emp ?? c.ban;
    assert.equal(c.emp ? "La empresa" : "El banco", d[`Causa ${i + 1} · libreta`]);
    assert.ok(!(c.emp && c.ban), `causa ${i + 1} en las dos libretas`);
    assert.equal(x.t.join(" / "), textoDe(r, `Causa ${i + 1} · rótulo`));
    assert.equal(x.e, textoDe(r, `Causa ${i + 1} · efecto`));
  });
});

test("★★★ los rótulos de la figura son los del paquete; los términos son exactamente «Nota débito» y «Nota crédito», con «del banco» solo fuera de la libreta del banco", () => {
  const r = renglones(seccionDe(PAQ, "Rótulos de la figura"));
  const F = A.FIGURA_A4;
  for (const [lugar, v] of [["Libreta de la empresa", F.empresa], ["Libreta del banco", F.banco], ["Subtítulo de la empresa (P5)", F.subEmpresa], ["Subtítulo del banco (P5)", F.subBanco],
    ["Donde una libreta no lo tiene", F.noSabe.join(" / ")], ["Consignar", F.consignar], ["Girar", F.girar], ["Extracto", F.extracto], ["Sube", F.sube], ["Baja", F.baja], ["Mayor", F.mayor],
    ["Opción · empresa", F.chips.empresa], ["Opción · banco", F.chips.banco], ["Opción · los dos", F.chips["los-dos"]]]) {
    assert.equal(v, textoDe(r, lugar), lugar);
  }
  assert.equal(A.RENGLONES_EXTRACTO.map((x) => [x.ban.t.join(" "), x.ban.e].join(" · ")).join(" | "), [textoDe(r, "Renglón del extracto 1"), textoDe(r, "Renglón del extracto 2")].join(" | "));
  assert.equal([A.RENGLON_CHEQUE_30.emp.t.join(" "), A.RENGLON_CHEQUE_30.emp.e].join(" · "), textoDe(r, "Renglón del cheque del 30 (P3)"));
  const [e, b] = A.RENGLONES_CONCILIACION;
  assert.equal(`${e.emp.t.join(" / ")} · ${e.emp.e}`, textoDe(r, "Renglón de la empresa (P5)"));
  assert.equal(`${b.ban.t.join(" ")} · ${b.ban.e}`, textoDe(r, "Renglón del banco (P5)"));
  for (const x of [...A.RENGLONES_EXTRACTO, ...A.CAUSAS_A4].map((c) => c.ban).filter(Boolean)) assert.ok(!x.t.join(" ").includes("del banco"), "«del banco» dentro de la libreta del banco");
  assert.deepEqual(A.MOVIMIENTOS_A4.filter((m) => /Nota/.test(m.mayor[0])).map((m) => m.mayor), [["Nota débito", "del banco"], ["Nota crédito", "del banco"]]);
  assert.deepEqual([A.CONSIGNACION, A.CHEQUE_PROVEEDOR], [876_000, 398_200]);
});

/* ═══════════ LA FIGURA, PANTALLA POR PANTALLA ═══════════ */

test("★★★ P0: «Consignar» sube Bancos por el debe (876.000); «Girar un cheque» la baja por el haber (398.200)", async () => {
  const m = await abrir(P, "sube-y-baja");
  try {
    const t = (l) => q(m, `[data-destino="bancos:${l}"]`).textContent.trim();
    assert.deepEqual([t("debe"), t("haber")], ["", ""]);
    tocar(q(m, "[data-accion=consignar]"));
    await esperar(0);
    assert.equal(t("debe"), "876.000");
    tocar(q(m, "[data-accion=girar]"));
    await esperar(0);
    assert.equal(t("haber"), "398.200");
  } finally { m.desmontar(); }
});

test("★★★ P1: las libretas vacías; «Llega el extracto»: la nota débito (resta) y la nota crédito (suma) en la del banco, y la empresa «todavía no lo sabe»", async () => {
  const m = await abrir(P, "las-notas");
  try {
    assert.deepEqual(renglonesLibreta(m), []);
    assert.equal(m.caja.querySelectorAll("[data-renglon-vacio]").length, 2);
    tocar(q(m, "[data-accion=extracto]"));
    await esperar(0);
    assert.deepEqual(renglonesLibreta(m), [["todavía nolo sabe", "Nota débitoresta"], ["todavía nolo sabe", "Nota créditosuma"]]);
    assert.equal(m.caja.querySelectorAll("[data-renglon-vacio]").length, 0);
  } finally { m.desmontar(); }
});

test("★★★ P2: con el acierto el nombre entra al mayor y llega el siguiente; con el error, ✗ en el botón, nada se escribe y «Incorrecto.» para el lector; con los siete, «Sube» y «Baja» desaparecen", async () => {
  const m = await abrir(P, "sube-o-baja");
  try {
    for (const [i, mv] of A.MOVIMIENTOS_A4.entries()) {
      assert.equal(visible(q(m, "[data-tarjeta-mov]")), `${mv.texto}${i + 1} de 7`);
      const otro = mv.va === T.DEBE ? T.HABER : T.DEBE;
      const antes = [lineasMayor(m, "debe"), lineasMayor(m, "haber")];
      tocar(q(m, `[data-destino="${otro}"]`));
      await esperar(0);
      const b = q(m, `[data-destino="${otro}"]`);
      assert.equal(b.dataset.marca, "mal");
      assert.equal(visible(b), `✗ ${otro === T.DEBE ? "Sube" : "Baja"}`);
      assert.equal(b.getAttribute("aria-label"), `${otro === T.DEBE ? "Sube" : "Baja"}: No va aquí`);
      assert.equal(q(m, "[data-lector-error]").textContent, "Incorrecto.");
      assert.deepEqual([lineasMayor(m, "debe"), lineasMayor(m, "haber")], antes, `${mv.id}: el error escribió en el mayor`);
      assert.equal(q(m, "[data-mensaje]"), null, "P2 no lleva mensaje a la vista");
      assert.equal(seguir(m), null);
      tocar(q(m, `[data-destino="${mv.va}"]`));
      await esperar(0);
      assert.equal(lineasMayor(m, mv.va).at(-1), mv.mayor.join(" / "));
      assert.equal(q(m, "[data-lector-error]"), null);
    }
    assert.equal(visible(q(m, "[data-tarjeta-mov]")), P.pantallas[2].fin);
    assert.equal(q(m, "[data-destino]"), null, "«Sube» y «Baja» siguen con los siete");
    assert.deepEqual(lineasMayor(m, "debe"), ["Consignación", "Nota crédito / del banco", "Cliente consigna", "Cheque anulado"]);
    assert.deepEqual(lineasMayor(m, "haber"), ["Nota débito / del banco", "Cheque girado", "Préstamo"]);
    assert.ok(seguir(m));
  } finally { m.desmontar(); }
});

test("★★★ P2: el mayor reserva cinco renglones y la tarjeta su alto (80 px): el mayor no se mueve de un movimiento a otro", () => {
  assert.equal(A.RESERVA_MAYOR_A4, 5);
  const lineas = (lado) => A.MOVIMIENTOS_A4.filter((x) => x.va === lado).reduce((s, x) => s + x.mayor.length, 0);
  assert.ok(Math.max(lineas(T.DEBE), lineas(T.HABER)) <= A.RESERVA_MAYOR_A4);
  const css = R.leer("src/components/t4/A4BancosYNotas.jsx");
  assert.match(css, /^\.t4a4-c \{.*min-height: 80px/m);
});

test("★★★ P3: el renglón del cheque no existe antes del acierto (PH8-2); con el acierto, «Cheque girado · resta» en la empresa y el banco «todavía no lo sabe»", async () => {
  const m = await abrir(P, "quien-lo-tiene");
  try {
    assert.equal(q(m, "[data-renglon]"), null);
    assert.ok(!q(m, "[data-pieza]").outerHTML.includes("Cheque girado"));
    for (const o of ["banco", "los-dos"]) {
      tocar(q(m, `[data-opcion="${o}"]`));
      await esperar(0);
      assert.equal(q(m, "[data-renglon]"), null, `${o}: el renglón en el error`);
      assert.match(visible(q(m, `[data-opcion="${o}"]`)), /✗Mal$/);
    }
    tocar(q(m, '[data-opcion="empresa"]'));
    await esperar(0);
    assert.deepEqual(renglonesLibreta(m), [["Cheque giradoresta", "todavía nolo sabe"]]);
  } finally { m.desmontar(); }
});

test("★★★ P4: seis botones, una causa a la vez, en la libreta que la tiene; la otra «todavía no lo sabe»", async () => {
  const m = await abrir(P, "seis-causas");
  try {
    assert.equal(m.caja.querySelectorAll("[data-control]").length, 6);
    for (const [i, c] of A.CAUSAS_A4.entries()) {
      tocar(q(m, `[data-control="${i + 1}"]`));
      await esperar(0);
      const x = c.emp ?? c.ban;
      const tinta = `${x.t.join("")}${x.e}`;
      assert.deepEqual(renglonesLibreta(m), [c.emp ? [tinta, "todavía nolo sabe"] : ["todavía nolo sabe", tinta]], `causa ${i + 1}`);
      assert.equal(q(m, `[data-control="${i + 1}"]`).getAttribute("aria-pressed"), "true");
    }
  } finally { m.desmontar(); }
});

test("★★ P5 lleva los subtítulos («libro auxiliar», «extracto del mes»); las demás libretas, no", async () => {
  const m = await abrir(P, "la-conciliacion");
  try {
    assert.match(visible(q(m, "[data-libretas]")), /La empresalibro auxiliar.*El bancoextracto del mes/);
    assert.deepEqual(renglonesLibreta(m), [["Chequesin cobrarresta", "todavía nolo sabe"], ["todavía nolo sabe", "Nota débitoresta"]]);
  } finally { m.desmontar(); }
  const r = await abrir(P, "resumen");
  try { assert.doesNotMatch(visible(q(r, "[data-libretas]")), /libro auxiliar|extracto del mes/); } finally { r.desmontar(); }
});
