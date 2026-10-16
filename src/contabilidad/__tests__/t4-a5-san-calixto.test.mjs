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
  noNombra: { "que-se-asienta": ["No se asienta", "no se asienta"], "dos-saldos": ["ninguno", "Ninguno"] },
  antesDe: "t4-a4-bancos-y-notas",
  preguntas: ["dos-saldos", "lado-del-banco", "lado-de-la-empresa", "que-se-asienta", "los-asientos"],
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
    ["Opción · sí", F.chips.si], ["Opción · no", F.chips.no], ["Asentar", F.asentar], ["Mayor", F.mayor], ["Saldo", F.saldo],
    ["Al pie del par (P0)", F.difieren("1.937.500")], ["Opción · el banco", F.opcionesSaldo.banco], ["Opción · la empresa", F.opcionesSaldo.empresa], ["Opción · ninguno", F.opcionesSaldo.ninguno],
    ["Tercer lugar del par", `${F.verdadero} ?`], ["Tercer lugar del par, para el lector", F.verdaderoLector], ["Contador de las notas", F.contadorNota("n", 5)]]) {
    assert.equal(v, textoDe(r, lugar), lugar);
  }
  assert.equal(P.pantallas.at(-1).siguiente, undefined, "A5 es la última pieza de Aprender del tema: sin «Siguiente»");
  for (const x of [...A.PARTIDAS_BANCO, ...A.PARTIDAS_EMPRESA]) assert.doesNotMatch(x.texto, /\bN\.?º|\bnúmero\b|\d{3,}/, `${x.id}: los cheques van sin número (E3)`);
});

/* ═══════════ LA FIGURA, PANTALLA POR PANTALLA ═══════════ */

test("★★★ P0 dos-saldos (lote B, §2.1 y §5.3): abre con el par, con «difieren en 1.937.500» al pie y sin «=»; el caso debajo; la pregunta del saldo verdadero, con reintento; con el acierto, el par abre «saldo verdadero: ?»", async () => {
  const p = P.pantallas[0];
  const m = await abrir(P, "dos-saldos");
  try {
    assert.deepEqual(par(m), ["2.435.600", "4.373.100"]);
    assert.equal(igual(m), false);
    assert.equal(q(m, "[data-pie-par]").textContent, "difieren en 1.937.500");
    assert.equal(q(m, "[data-verdadero]"), null, "el tercer lugar antes del acierto");
    assert.equal(q(m, "[data-caso]").textContent, p.caso);
    assert.equal(q(m, "[data-rotulo-pregunta]").textContent, p.rotuloPregunta);
    for (const o of ["banco", "empresa"]) {
      tocar(q(m, `[data-opcion="${o}"]`));
      await esperar(0);
      assert.equal(q(m, "[data-devolucion]").textContent, `Incorrecto. ${p.errores[o]}`);
      assert.equal(q(m, "[data-verdadero]"), null, `${o}: el tercer lugar en el error`);
    }
    tocar(q(m, '[data-opcion="ninguno"]'));
    await esperar(0);
    assert.equal(q(m, "[data-verdadero]").dataset.verdadero, "?");
    assert.equal(visible(q(m, "[data-verdadero]")), "saldo verdadero: ?");
    assert.equal(q(m, "[data-verdadero] .t4f-sr").textContent, A.FIGURA_A5.verdaderoLector);
  } finally { m.desmontar(); }
});

test("★★★ P1 y P2 llevan el tercer lugar del par: «?» hasta el «=»; con el «=» de la empresa, 4.612.600", async () => {
  const b = await abrir(P, "lado-del-banco");
  try {
    assert.equal(q(b, "[data-verdadero]").dataset.verdadero, "?");
    await jugar(b, P, "lado-del-banco");
    assert.equal(q(b, "[data-verdadero]").dataset.verdadero, "?", "el banco solo no da el saldo verdadero");
  } finally { b.desmontar(); }
  const e = await abrir(P, "lado-de-la-empresa");
  try {
    assert.equal(q(e, "[data-verdadero]").dataset.verdadero, "?");
    await jugar(e, P, "lado-de-la-empresa");
    assert.equal(igual(e), true);
    assert.equal(q(e, "[data-verdadero]").dataset.verdadero, "4612600");
  } finally { e.desmontar(); }
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
        assert.match(visible(s), /No va aquí$/);
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

test("★★★ P3: el cheque de Lorena Guerra no se asienta; «Se asienta» da «✗ No va aquí» y su texto, y se reintenta", async () => {
  const m = await abrir(P, "que-se-asienta");
  try {
    assert.equal(visible(q(m, "[data-tarjeta-partida]")), "Cheque a Lorena Guerra, sin cobrar156.000");
    tocar(q(m, '[data-opcion="si"]'));
    await esperar(0);
    assert.equal(visible(q(m, '[data-opcion="si"]')), "Se asienta");
    assert.equal(visible(q(m, "[data-linea-marcas]")), "No va aquí");
    tocar(q(m, '[data-opcion="no"]'));
    await esperar(0);
    assert.equal(visible(q(m, '[data-opcion="no"]')), "No se asienta");
    assert.equal(visible(q(m, "[data-linea-marcas]")), "Correcto");
  } finally { m.desmontar(); }
});

test("★★★ P4 los-asientos (lote B, §5.5): una nota a la vez; se decide de qué lado va Bancos con un toque; el error marca «No va aquí» y no escribe; el acierto escribe el monto en Bancos y en la contrapartida, y a los 1,4 s llega la siguiente; la contrapartida no se toca", async () => {
  const p = P.pantallas.find((x) => x.id === "los-asientos");
  const m = await abrir(P, "los-asientos");
  try {
    for (const [i, a] of A.ASIENTOS_A5.entries()) {
      const lado = a.debe === "bancos" ? "debe" : "haber";
      const otro = lado === "debe" ? "haber" : "debe";
      const contra = a.debe === "bancos" ? a.haber : a.debe;
      assert.equal(visible(q(m, "[data-tarjeta-nota]")), `${a.linea}Nota ${i + 1} de 5${fmt(a.monto)}`);
      assert.deepEqual([...m.caja.querySelectorAll("[data-cuenta]")].map((c) => c.dataset.cuenta), ["bancos", contra]);
      assert.ok(m.caja.querySelectorAll(`[data-cuenta="${contra}"] button`).length === 2 && [...m.caja.querySelectorAll(`[data-cuenta="${contra}"] button`)].every((b) => b.disabled), "la contrapartida se puede tocar");
      tocar(q(m, `[data-destino="bancos:${otro}"]`));
      await esperar(0);
      assert.equal(q(m, `[data-destino="bancos:${otro}"]`).dataset.marca, "mal");
      assert.equal(q(m, "[data-devolucion]").textContent, `Incorrecto. ${p.error}`);
      assert.equal(q(m, `[data-destino="${contra}:${lado}"]`).textContent.trim(), "", "el error escribió en la contrapartida");
      tocar(q(m, `[data-destino="bancos:${lado}"]`));
      await esperar(0);
      assert.equal(q(m, `[data-destino="bancos:${lado}"]`).dataset.marca, "bien");
      assert.match(q(m, `[data-destino="bancos:${lado}"]`).textContent, new RegExp(fmt(a.monto).replace(/\./g, "\\.")));
      assert.match(q(m, `[data-destino="${contra}:${otro}"]`).textContent, new RegExp(fmt(a.monto).replace(/\./g, "\\.")));
      assert.equal(q(m, "[data-mensaje]"), null);
      if (i < A.ASIENTOS_A5.length - 1) {
        assert.equal(seguir(m), null);
        await esperar(A.ESPERA_NOTA_MS + 100);
      }
    }
    assert.ok(seguir(m), "tras la quinta nota no aparece «Seguir»");
  } finally { m.desmontar(); }
});

test("★★★ P5: «Asentar las cinco notas»: 645.000 y 342.000 al debe, 43.500, 236.000 y 468.000 al haber, y el saldo llega a 4.612.600 (con movimiento reducido, de una vez)", async () => {
  const m = await abrir(P, "el-mayor");
  try {
    assert.equal(q(m, "[data-par-final]"), null, "el par igualado antes de asentar");
    assert.ok(!q(m, "[data-cierre][data-visible]"), "la frase de cierre antes de asentar");
    assert.equal(q(m, "[data-saldo-mayor]").style.visibility, "hidden");
    tocar(q(m, "[data-accion=asentar]"));
    await esperar(0);
    const col = (l) => [...m.caja.querySelectorAll(`[data-columna="${l}"] [data-linea]`)].map((x) => x.textContent);
    assert.deepEqual(col("debe"), ["Saldo4.373.100", "645.000", "342.000"]);
    assert.deepEqual(col("haber"), ["43.500", "236.000", "468.000"]);
    assert.equal(q(m, "[data-saldo-mayor]").dataset.saldoMayor, "4.612.600");
    /* Lote B, capa 4: bajo el mayor, el par igualado con «=», y la frase de cierre. */
    const final = q(m, "[data-par-final]");
    assert.ok(final, "no aparece el par igualado");
    assert.deepEqual([...final.querySelectorAll("[data-lado-par]")].map((x) => x.lastElementChild.textContent), ["4.612.600", "4.612.600"]);
    assert.equal(final.querySelector(".t4pr-igual").style.visibility, "visible");
    assert.equal(visible(q(m, "[data-cierre][data-visible] > [aria-live]")), P.pantallas.at(-1).cierre);
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
