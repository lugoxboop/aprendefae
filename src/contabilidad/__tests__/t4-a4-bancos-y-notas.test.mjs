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
  noNombra: { "la-conciliacion": ["Nota débito", "nota débito"] },
  antesDe: "t4-a3-el-arqueo",
  preguntas: ["sube-o-baja", "seis-causas", "la-conciliacion"],
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
  const s = seccionDe(PAQ, "Las seis causas (P3)");
  const r = renglones(s);
  const d = datos(s);
  A.CAUSAS_A4.forEach((c, i) => {
    const x = c.emp ?? c.ban;
    assert.equal(c.tarjeta, textoDe(r, `Causa ${i + 1} · tarjeta`), `causa ${i + 1}`);
    assert.equal(c.emp ? "La empresa" : "El banco", d[`Causa ${i + 1} · libreta`]);
    assert.ok(!(c.emp && c.ban), `causa ${i + 1} en las dos libretas`);
    assert.equal(x.t.join(" / "), textoDe(r, `Causa ${i + 1} · rótulo`));
    assert.equal(x.e, textoDe(r, `Causa ${i + 1} · efecto`));
  });
});

test("★★★ los rótulos de la figura son los del paquete; los términos son exactamente «Nota débito» y «Nota crédito», con «del banco» solo fuera de la libreta del banco", () => {
  const r = renglones(seccionDe(PAQ, "Rótulos de la figura"));
  const F = A.FIGURA_A4;
  for (const [lugar, v] of [["Libreta de la empresa", F.empresa], ["Libreta del banco", F.banco],
    ["Donde una libreta no lo tiene", F.noSabe.join(" / ")], ["Consignar", F.consignar], ["Girar", F.girar], ["Extracto", F.extracto], ["Pestaña de la libreta del banco (P1, aparece con «Llega el extracto»; D9 de Hanayama)", F.pestanaExtracto], ["Sube", F.sube], ["Baja", F.baja], ["Mayor", F.mayor],
    ["Contador de las causas", F.contadorCausa("n", 6)], ["Con el acierto de la conciliación", `Nota débito · ${F.porAnotar}`],
    ["Para el lector, cada libreta", [0, 1, "{n}"].map((n, i) => F.anotadas("La empresa", n).replace(/^La empresa: /, i ? "" : "La empresa: ")).join(" / ")],
    ["Para el lector, el renglón del cheque (P4)", F.renglonLector["cheque-sin-cobrar"]], ["Para el lector, el renglón de la nota (P4)", F.renglonLector["nota-debito"]]]) {
    assert.equal(v, textoDe(r, lugar), lugar);
  }
  assert.equal(A.RENGLONES_EXTRACTO.map((x) => [x.ban.t.join(" "), x.ban.e].join(" · ")).join(" | "), [textoDe(r, "Renglón del extracto 1"), textoDe(r, "Renglón del extracto 2")].join(" | "));
  const [e, b] = A.RENGLONES_CONCILIACION;
  assert.equal(`${e.emp.t.join(" / ")} · ${e.emp.e}`, textoDe(r, "Renglón de la empresa (P4)"));
  assert.equal(`${b.ban.t.join(" ")} · ${b.ban.e}`, textoDe(r, "Renglón del banco (P4)"));
  for (const x of [...A.RENGLONES_EXTRACTO, ...A.CAUSAS_A4].map((c) => c.ban).filter(Boolean)) assert.ok(!x.t.join(" ").includes("del banco"), "«del banco» dentro de la libreta del banco");
  assert.deepEqual(A.MOVIMIENTOS_A4.filter((m) => /Nota/.test(m.mayor[0])).map((m) => m.mayor), [["Nota débito", "del banco"], ["Nota crédito", "del banco"]]);
  assert.deepEqual([A.CONSIGNACION, A.CHEQUE_PROVEEDOR], [876_000, 398_200]);
});

/* ═══════════ LA FIGURA, PANTALLA POR PANTALLA ═══════════ */

test("★★★ P0: «Consignar» sube Bancos por el debe (876.000); «Girar un cheque» la baja por el haber (398.200); cada definición aparece con su botón (capa 1)", async () => {
  const m = await abrir(P, "sube-y-baja");
  try {
    const t = (l) => q(m, `[data-destino="bancos:${l}"]`).textContent.trim();
    const vista = (k) => q(m, `[data-con-accion="${k}"]`).hasAttribute("data-visible");
    assert.deepEqual([t("debe"), t("haber")], ["", ""]);
    assert.deepEqual([vista("consignar"), vista("girar")], [false, false]);
    tocar(q(m, "[data-accion=consignar]"));
    await esperar(0);
    assert.equal(t("debe"), "876.000");
    assert.deepEqual([vista("consignar"), vista("girar")], [true, false], "la definición de Bancos no sale con «Consignar», o sale también la de girar");
    tocar(q(m, "[data-accion=girar]"));
    await esperar(0);
    assert.equal(t("haber"), "398.200");
    assert.deepEqual([vista("consignar"), vista("girar")], [true, true]);
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

test("★★★ P2: con el acierto el nombre entra al mayor y llega el siguiente; con el error, «✗ No va aquí» en el botón, nada se escribe y «Incorrecto.» para el lector; con los siete, «Sube» y «Baja» desaparecen", async () => {
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
      assert.equal(visible(b), otro === T.DEBE ? "Sube" : "Baja");
      assert.equal(visible(q(m, "[data-linea-marcas]")), "No va aquí", "la pastilla, en la línea de marcas");
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

test("★★★ P3 seis-causas (lote B, §5.4; D6): cada tarjeta a la libreta que la tiene; con el acierto su rótulo se escribe allí; con el error, «No va aquí» en la libreta tocada, nada se escribe y «Incorrecto.» para el lector; las notas del banco en la empresa, con su mensaje; absorbe a «quien-lo-tiene»", async () => {
  assert.ok(!P.pantallas.some((p) => p.id === "quien-lo-tiene"), "quien-lo-tiene sigue: sería la misma pantalla con otro texto");
  assert.equal(P.pantallas.length, 5);
  assert.equal(A.CAUSAS_A4[0].tarjeta, "Cheque girado el 30, que nadie ha cobrado", "la tarjeta 1 no es el cheque del 30 (el caso de quien-lo-tiene)");
  const m = await abrir(P, "seis-causas");
  const escritas = (lado) => [...m.caja.querySelectorAll(`[data-destino="${lado}"] [data-causa-escrita]`)].map((x) => x.dataset.causaEscrita);
  try {
    for (const [i, c] of A.CAUSAS_A4.entries()) {
      const lado = c.emp ? "empresa" : "banco";
      const otro = lado === "empresa" ? "banco" : "empresa";
      assert.equal(visible(q(m, "[data-tarjeta-causa]")), `${c.tarjeta}Causa ${i + 1} de 6`);
      const antes = [escritas("empresa"), escritas("banco")];
      tocar(q(m, `[data-destino="${otro}"]`));
      await esperar(0);
      assert.equal(q(m, `[data-destino="${otro}"]`).dataset.marca, "mal");
      assert.match(visible(q(m, `[data-destino="${otro}"]`)), /No va aquí$/);
      assert.match(q(m, `[data-destino="${otro}"]`).getAttribute("aria-label"), /: no va aquí$/);
      assert.deepEqual([escritas("empresa"), escritas("banco")], antes, `${c.id}: el error escribió algo`);
      /* D6 (Katsumi): las notas del banco llevadas a la empresa tienen su mensaje (con «Incorrecto.» para el lector, una vez); los demás errores, solo la marca. */
      const conMensaje = otro === "empresa" && P.pantallas[3].errorEmpresa.causas.includes(c.id);
      if (conMensaje) {
        assert.equal(q(m, "[data-mensaje]")?.dataset.mensaje, "error", `${c.id}: sin mensaje`);
        assert.equal(q(m, "[data-mensaje] [data-devolucion]").textContent, `Incorrecto. ${P.pantallas[3].errorEmpresa.texto}`);
        assert.equal(q(m, "[data-lector-error]"), null, `${c.id}: «Incorrecto.» se oye dos veces`);
      } else {
        assert.equal(q(m, "[data-lector-error]").textContent, "Incorrecto.");
        assert.equal(q(m, "[data-mensaje]"), null, `${c.id}: este error no lleva mensaje a la vista`);
      }
      assert.equal(R.seguir(m), null);
      tocar(q(m, `[data-destino="${lado}"]`));
      await esperar(0);
      assert.equal(escritas(lado).at(-1), c.id);
      assert.equal(q(m, "[data-mensaje]"), null, `${c.id}: el mensaje del error sigue tras el acierto`);
      assert.equal(q(m, `[data-destino="${lado}"]`).dataset.marca, "bien");
      assert.equal(q(m, `[data-destino="${otro}"]`).dataset.marca, undefined, "la marca del error se queda en la otra");
    }
    assert.equal(visible(q(m, "[data-tarjeta-causa]")), P.pantallas[3].fin);
    assert.deepEqual(escritas("empresa"), ["cheque-sin-cobrar", "consignacion-sin-abonar", "error-empresa"]);
    assert.deepEqual(escritas("banco"), ["nota-debito", "nota-credito", "error-banco"]);
    assert.match(q(m, '[data-destino="empresa"]').getAttribute("aria-label"), /^La empresa: 3 causas anotadas/);
    assert.ok(R.seguir(m), "tras las seis no aparece «Seguir»");
  } finally { m.desmontar(); }
  assert.equal(A.FIGURA_A4.anotadas("El banco", 0), "El banco: ninguna causa anotada");
  assert.equal(A.FIGURA_A4.anotadas("El banco", 1), "El banco: 1 causa anotada");
});

test("★★★ P3: las libretas reservan cinco renglones y la tarjeta su alto: nada se mueve al escribirse las causas", () => {
  const lineas = (k) => A.CAUSAS_A4.filter((c) => c[k]).reduce((n, c) => n + c[k].t.length, 0);
  assert.ok(Math.max(lineas("emp"), lineas("ban")) <= 5);
  const css = R.leer("src/components/t4/A4BancosYNotas.jsx");
  assert.match(css, /^\.t4a4-lib \{.*grid-template-rows: auto 100px 20px/m);
});

test("★★★ P4 la-conciliacion (lote B, §5.2): los dos renglones son destinos; el cheque da «No va aquí» y su mensaje, con reintento; la nota débito da «Correcto», la empresa pasa a «Nota débito · por anotar» y, sin mensaje, la frase de cierre y «Siguiente»", async () => {
  const p = P.pantallas.at(-1);
  assert.equal(p.id, "la-conciliacion");
  const m = await abrir(P, p.id);
  try {
    assert.equal(visible(q(m, "[data-rotulo-pregunta]")), p.rotuloPregunta);
    assert.doesNotMatch(visible(q(m, "[data-libretas]")), /libro auxiliar|extracto del mes/, "los subtítulos salieron (§5.2)");
    assert.deepEqual(renglonesLibreta(m).map((r) => r[0]), ["Chequesin cobrarrestatodavía nolo sabe", "todavía nolo sabeNota débitoresta"]);
    assert.equal(q(m, '[data-destino="cheque-sin-cobrar"]').getAttribute("aria-label"), A.FIGURA_A4.renglonLector["cheque-sin-cobrar"]);
    assert.ok(!q(m, "[data-cierre][data-visible]"), "la frase de cierre antes del acierto");
    tocar(q(m, '[data-destino="cheque-sin-cobrar"]'));
    await esperar(0);
    assert.equal(q(m, "[data-mensaje]").dataset.mensaje, "error");
    assert.equal(q(m, "[data-devolucion]").textContent, `Incorrecto. ${p.errores["cheque-sin-cobrar"]}`);
    assert.match(visible(q(m, '[data-renglon="cheque-sin-cobrar"]')), /No va aquí$/);
    assert.match(q(m, '[data-destino="cheque-sin-cobrar"]').getAttribute("aria-label"), /: no va aquí$/);
    assert.ok(!q(m, "[data-pieza]").textContent.includes(A.FIGURA_A4.porAnotar), "«por anotar» en el error");
    assert.ok(!q(m, "[data-cierre][data-visible]"));
    tocar(q(m, '[data-destino="nota-debito"]'));
    await esperar(0);
    assert.equal(q(m, "[data-mensaje]"), null, "el acierto no lleva mensaje: la frase es la explicación");
    assert.match(visible(q(m, '[data-renglon="nota-debito"]')), /Nota débitopor anotarNota débitorestaCorrecto$/);
    assert.equal(visible(q(m, "[data-cierre][data-visible] > [aria-live]")), p.cierre);
    assert.equal(visible(q(m, "[data-siguiente][data-visible] > [aria-live]")), p.siguiente);
    assert.equal(R.seguir(m), null, "la última pantalla no lleva «Seguir»");
  } finally { m.desmontar(); }
});

test("★★★ D9 · P1: la libreta del banco lleva la pestaña «Extracto», reservada desde el principio y visible con «Llega el extracto»; ninguna otra pantalla la lleva", async () => {
  const m = await abrir(P, "las-notas");
  try {
    const t = q(m, "[data-pestana]");
    assert.equal(t.textContent, A.FIGURA_A4.pestanaExtracto);
    assert.ok(t.hasAttribute("data-oculta"), "la pestaña se ve antes del extracto");
    assert.equal(t.getAttribute("aria-hidden"), "true");
    tocar(q(m, "[data-accion=extracto]"));
    await esperar(0);
    assert.ok(!q(m, "[data-pestana]").hasAttribute("data-oculta"), "la pestaña no aparece con el extracto");
    assert.equal(q(m, "[data-pestana]").getAttribute("aria-hidden"), null);
    assert.ok(q(m, ".t4lt-pest").nextElementSibling.matches("[data-libretas]"), "la pestaña no va sobre las libretas");
  } finally { m.desmontar(); }
  for (const id of P.pantallas.map((p) => p.id).filter((x) => x !== "las-notas")) {
    const n = await abrir(P, id);
    try { assert.equal(q(n, "[data-pestana]"), null, `${id} lleva la pestaña`); } finally { n.desmontar(); }
  }
});
