import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A5 «San Calixto» (Célula D) · REDISEÑO DE ENGANCHE.
 *
 *   · cada texto es el del paquete vigente (d4-t4-a5-v3-rediseno.md, los
 *     textos de Katsumi aprobados por Yujiro), letra por letra, en su lugar
 *   · el par que el estudiante iguala: cada partida a «Más» o a «Menos»; con
 *     el acierto la cifra entra en su sección y el saldo de ese lado cambia;
 *     con el error, «✗ No va aquí» en la sección, nada se escribe y
 *     «Incorrecto.» para el lector. Los dos saldos terminan en 4.612.600 y el
 *     «=» no aparece antes; el tope de «Más» y «Menos» no cambia
 *   · el cheque sin cobrar no se asienta; los cinco asientos, uno a la vez,
 *     con la línea que dice de qué nota es; el mayor llega a 4.612.600
 *   · lo común (t4-aprender-rd.mjs): «Seguir» tras el acierto, PH8-2, B4,
 *     ningún error que nombre la respuesta y Aprender sin FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const R = await import("./t4-aprender-rd.mjs");
const { q, abrir, jugar, seguir, tocar, esperar, pruebasComunes, seccionDe, renglones, textoDe, movimientoReducido } = R;
const { datos } = await import("./t4-rediseno-canon.mjs");
const A = await import("../../data/contabilidadT4A5.js");
const { visible, h, montar } = await import("./t4-dom.mjs");
const { PantallasT4 } = await import("../../components/ContabilidadT4View.jsx");

const P = A.PIEZA_SAN_CALIXTO;
const { PAQ } = pruebasComunes({
  P,
  canon: "d4-t4-a5-v3-rediseno.md",
  datos: "src/data/contabilidadT4A5.js",
  piezas: ["src/data/contabilidadT4A5.js", "src/components/t4/A5SanCalixto.jsx", "src/components/t4/aprender.jsx", "src/components/t4/tablero.jsx"],
  noNombra: { "que-se-asienta": ["No se asienta", "no se asienta"] },
  antesDe: "t4-a4-bancos-y-notas",
  preguntas: ["lado-del-banco", "lado-de-la-empresa", "que-se-asienta"],
});

const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const par = (m) => [...m.caja.querySelectorAll("[data-lado-par]")].map((x) => x.lastElementChild.textContent);
const igual = (m) => q(m, ".t4pr-igual").style.visibility === "visible";
const lineas = (m, s) => [...m.caja.querySelectorAll(`[data-destino="${s}"] [data-linea]`)].map((x) => x.textContent);

/* ═══════════ LAS CIFRAS Y LOS DATOS ═══════════ */

test("★★★ las cifras se calculan (pp. 189-191): la diferencia 1.937.500; los dos lados y el mayor llegan a 4.612.600", () => {
  assert.deepEqual([A.EXTRACTO, A.LIBROS], [2_435_600, 4_373_100]);
  assert.equal(A.DIFERENCIA_INICIAL, 1_937_500);
  assert.equal(A.CONCILIADO_BANCO, 4_612_600);
  assert.equal(A.CONCILIADO_LIBROS, 4_612_600);
  assert.equal(A.SALDO_MAYOR, 4_612_600);
  /* Saldos de cada paso (Katsumi, «Cifras»): el «=» no puede salir antes de la quinta partida en ningún lado. */
  const pasos = (ini, xs) => xs.map((_, i) => A.saldoTrasA5(ini, xs, i + 1));
  assert.deepEqual(pasos(A.EXTRACTO, A.PARTIDAS_BANCO), [2_279_600, 5_037_600, 4_834_600, 4_737_600, 4_612_600]);
  assert.deepEqual(pasos(A.LIBROS, A.PARTIDAS_EMPRESA), [5_018_100, 4_974_600, 5_316_600, 5_080_600, 4_612_600]);
});

test("★★★ las partidas, los asientos y los rótulos son los del paquete", () => {
  for (const [titulo, xs] of [["El lado del banco (P1)", A.PARTIDAS_BANCO], ["El lado de la empresa (P2)", A.PARTIDAS_EMPRESA]]) {
    const s = seccionDe(PAQ, titulo);
    const r = renglones(s);
    const d = datos(s);
    xs.forEach((x, i) => {
      assert.equal(x.texto, textoDe(r, `Partida ${i + 1} · tarjeta`), `${titulo} ${i + 1}`);
      assert.equal(`${fmt(x.monto)} · va a: ${x.va === A.MAS ? "Más" : "Menos"}`, d[`Partida ${i + 1} · cifra`], `${titulo} ${i + 1}`);
    });
  }
  const as = renglones(seccionDe(PAQ, "Los cinco asientos (P4)"));
  A.ASIENTOS_A5.forEach((a, i) => assert.equal(a.linea, textoDe(as, `Asiento ${i + 1} · línea`)));
  const r = renglones(seccionDe(PAQ, "Rótulos de la figura"));
  const F = A.FIGURA_A5;
  for (const [lugar, v] of [["Saldo del banco", F.banco], ["Saldo de la empresa", F.empresa], ["Más", F.mas], ["Menos", F.menos], ["Tarjeta final", F.fin],
    ["Opción · sí", F.chips.si], ["Opción · no", F.chips.no], ["Asentar", F.asentar], ["Mayor", F.mayor], ["Saldo", F.saldo]]) {
    assert.equal(v, textoDe(r, lugar), lugar);
  }
  assert.equal(P.pantallas.at(-1).siguiente, undefined, "A5 es la última pieza de Aprender del tema: sin «Siguiente»");
  for (const x of [...A.PARTIDAS_BANCO, ...A.PARTIDAS_EMPRESA]) assert.doesNotMatch(x.texto, /\bN\.?º|\bnúmero\b|\d{3,}/, `${x.id}: los cheques van sin número (E3)`);
});

/* ═══════════ LA FIGURA, PANTALLA POR PANTALLA ═══════════ */

test("★★★ P0: el par con los dos saldos, distintos y sin «=»; P6: iguales, con el «=»", async () => {
  const m = await abrir(P, "dos-saldos");
  try {
    assert.deepEqual(par(m), ["2.435.600", "4.373.100"]);
    assert.equal(igual(m), false);
  } finally { m.desmontar(); }
  const r = await abrir(P, "resumen");
  try {
    assert.deepEqual(par(r), ["4.612.600", "4.612.600"]);
    assert.equal(igual(r), true);
  } finally { r.desmontar(); }
});

test("★★★ P1 y P2: cada partida a su sección; el saldo cambia con cada acierto; el error marca «✗ No va aquí», no escribe nada y avisa al lector; el «=» solo con la quinta de la empresa", async () => {
  for (const [id, xs, lado] of [["lado-del-banco", A.PARTIDAS_BANCO, 0], ["lado-de-la-empresa", A.PARTIDAS_EMPRESA, 1]]) {
    const m = await abrir(P, id);
    try {
      const ini = lado === 0 ? A.EXTRACTO : A.LIBROS;
      for (const [i, x] of xs.entries()) {
        assert.equal(visible(q(m, "[data-tarjeta-partida]")), `${x.texto}${fmt(x.monto)}`);
        const otra = x.va === A.MAS ? A.MENOS : A.MAS;
        const antes = [lineas(m, A.MAS), lineas(m, A.MENOS), par(m)];
        tocar(q(m, `[data-destino="${otra}"]`));
        await esperar(0);
        const s = q(m, `[data-destino="${otra}"]`);
        assert.equal(s.dataset.marca, "mal");
        assert.match(visible(s), /✗No va aquí$/);
        assert.match(s.getAttribute("aria-label"), /: No va aquí$/);
        assert.equal(q(m, "[data-lector-error]").textContent, "Incorrecto.");
        assert.deepEqual([lineas(m, A.MAS), lineas(m, A.MENOS), par(m)], antes, `${id} · ${x.id}: el error escribió algo`);
        assert.equal(seguir(m), null);
        tocar(q(m, `[data-destino="${x.va}"]`));
        await esperar(0);
        assert.equal(lineas(m, x.va).at(-1), fmt(x.monto));
        assert.equal(par(m)[lado], fmt(A.saldoTrasA5(ini, xs, i + 1)));
        assert.equal(igual(m), lado === 1 && i === xs.length - 1, `${id} · ${x.id}: el «=»`);
      }
      assert.equal(visible(q(m, "[data-tarjeta-partida]")), A.FIGURA_A5.fin);
      assert.deepEqual(par(m), lado === 0 ? ["4.612.600", "4.373.100"] : ["4.612.600", "4.612.600"]);
      assert.ok(seguir(m));
    } finally { m.desmontar(); }
  }
});

test("★★★ P3: el cheque de Lorena Guerra no se asienta; «Se asienta» da ✗ Mal y su texto, y se reintenta", async () => {
  const m = await abrir(P, "que-se-asienta");
  try {
    assert.equal(visible(q(m, "[data-tarjeta-partida]")), "Cheque a Lorena Guerra, sin cobrar156.000");
    tocar(q(m, '[data-opcion="si"]'));
    await esperar(0);
    assert.equal(visible(q(m, '[data-opcion="si"]')), "Se asienta✗Mal");
    tocar(q(m, '[data-opcion="no"]'));
    await esperar(0);
    assert.equal(visible(q(m, '[data-opcion="no"]')), "No se asienta✓Bien");
  } finally { m.desmontar(); }
});

test("★★★ P4: cinco botones; cada uno muestra su asiento (la cifra al debe de una cuenta y al haber de la otra) y la línea de su nota", async () => {
  const m = await abrir(P, "los-asientos");
  try {
    for (const [i, a] of A.ASIENTOS_A5.entries()) {
      tocar(q(m, `[data-control="${i + 1}"]`));
      await esperar(0);
      assert.equal(q(m, "[data-nota-asiento]").textContent, a.linea);
      assert.equal(q(m, `[data-destino="${a.debe}:debe"]`).textContent.trim(), fmt(a.monto));
      assert.equal(q(m, `[data-destino="${a.haber}:haber"]`).textContent.trim(), fmt(a.monto));
      assert.deepEqual([...m.caja.querySelectorAll("[data-cuenta]")].map((c) => c.dataset.cuenta), [a.debe, a.haber]);
    }
  } finally { m.desmontar(); }
});

test("★★★ P5: «Asentar las cinco notas»: 645.000 y 342.000 al debe, 43.500, 236.000 y 468.000 al haber, y el saldo llega a 4.612.600 (con movimiento reducido, de una vez)", async () => {
  const m = await abrir(P, "el-mayor");
  try {
    assert.equal(q(m, "[data-saldo-mayor]").style.visibility, "hidden");
    tocar(q(m, "[data-accion=asentar]"));
    await esperar(0);
    const col = (l) => [...m.caja.querySelectorAll(`[data-columna="${l}"] [data-linea]`)].map((x) => x.textContent);
    assert.deepEqual(col("debe"), ["Saldo4.373.100", "645.000", "342.000"]);
    assert.deepEqual(col("haber"), ["43.500", "236.000", "468.000"]);
    assert.equal(q(m, "[data-saldo-mayor]").dataset.saldoMayor, "4.612.600");
  } finally { m.desmontar(); }
});

test("★★ P5 sin movimiento reducido: las notas entran una cada 350 ms", async () => {
  const antes = movimientoReducido(false);
  const m = montar(h(PantallasT4, { pieza: { ...P, pantallas: [P.pantallas.find((p) => p.id === "el-mayor")] }, rotulo: "T4" }));
  try {
    tocar(m.caja.querySelector("[data-accion=asentar]"));
    await esperar(A.PASO_MAYOR_MS + 50);
    assert.equal(m.caja.querySelectorAll('[data-columna="debe"] [data-linea]').length, 2, "tras 350 ms, la primera nota");
    await esperar(A.PASO_MAYOR_MS * 5);
    assert.equal(m.caja.querySelector("[data-saldo-mayor]").dataset.saldoMayor, "4.612.600");
  } finally { m.desmontar(); movimientoReducido(antes); }
  assert.ok(jugar);
});
