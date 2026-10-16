import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A2 «El fondo fijo» (Célula D) · REDISEÑO DE ENGANCHE.
 *
 *   · cada texto es el del paquete vigente (d4-t4-a2-v3-rediseno.md, los
 *     textos de Katsumi aprobados por Yujiro), letra por letra, en su lugar
 *   · el sobre y el libro de Hanayama, manejados: pagar y reponer («Suman» no
 *     se mueve), abrir con el cheque, pagar los ocho gastos (los billetes,
 *     «sin contar»: 21.900 no aparece antes de P3), decidir cuánto queda,
 *     reponer, decidir el asiento del reembolso y subir o bajar el fondo
 *   · P5: Caja menor dice 500.000 antes y después del reembolso; en el error
 *     no se escribe nada, solo se marca la mitad que falla (con palabra), y el
 *     texto sale de esa mitad
 *   · lo común (t4-aprender-rd.mjs): «Seguir» tras el acierto, PH8-2, B4,
 *     ningún error que nombre la respuesta y Aprender sin FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const R = await import("./t4-aprender-rd.mjs");
const { q, abrir, jugar, seguir, tocar, esperar, pruebasComunes, leer, seccionDe, renglones, textoDe } = R;
const A = await import("../../data/contabilidadT4A2.js");
const { visible } = await import("./t4-dom.mjs");

const P = A.PIEZA_EL_FONDO_FIJO;
const { PAQ } = pruebasComunes({
  P,
  canon: "d4-t4-a2-v3-rediseno.md",
  datos: "src/data/contabilidadT4A2.js",
  piezas: ["src/data/contabilidadT4A2.js", "src/components/t4/A2ElFondoFijo.jsx", "src/components/t4/aprender.jsx", "src/components/t4/tablero.jsx"],
  noNombra: { "cuanto-queda": ["21.900", "21900"], "y-caja-menor": ["Gastos generales", "Bancos"] },
  antesDe: "t4-a1-la-caja",
  preguntas: ["cuanto-queda", "y-caja-menor"],
});

const sobre = (m) => Object.fromEntries([...m.caja.querySelectorAll("[data-fila-sobre]")].map((f) => [f.dataset.filaSobre, f.style.visibility === "hidden" ? null : f.lastElementChild.textContent]));
const total = (m, k) => q(m, `[data-destino="${k}"]`)?.textContent.replace(/\s/g, "") ?? null;

/* ═══════════ LAS CIFRAS Y LOS RÓTULOS ═══════════ */

test("★★★ las cifras se calculan: los ocho gastos de la p. 184 suman 478.100 y queda 21.900; el fondo es 500.000; P6 va de 400.000 a 600.000 (supuesto, «Cifras construidas»)", () => {
  assert.equal(A.FONDO, 500_000);
  assert.equal(A.GASTOS_MAYO.length, 8);
  assert.equal(A.GASTADO, 478_100);
  assert.equal(A.QUEDA, 21_900);
  assert.deepEqual([A.FONDO_MIN, A.FONDO_MAX, A.PASO_FONDO], [400_000, 600_000, 100_000]);
  assert.match(P.pantallas.find((p) => p.id === "subir-bajar").pie, /Cifras construidas/);
  const gastos = seccionDe(PAQ, "Los gastos de mayo (p. 184)");
  A.GASTOS_MAYO.forEach((g, i) => assert.match(gastos, new RegExp(`- Gasto ${i + 1}: ${g.gasto} · ${String(g.valor).replace(/\B(?=(\d{3})+(?!\d))/g, "\\.")}`)));
});

test("★★★ los rótulos de la figura son los del paquete", () => {
  const r = renglones(seccionDe(PAQ, "Rótulos de la figura"));
  const F = A.FIGURA_A2;
  for (const [lugar, v] of [["Sobre", F.sobre], ["Libro", F.libro], ["Billetes", F.billetes], ["Soportes", F.soportes], ["Suma", F.suman], ["Suma con una cifra equivocada", F.sumanMal], ["Fondo", F.fondo], ["Sin contar", F.sinContar], ["Pagar", F.pagar], ["Reponer", F.reponer], ["Pagar el siguiente", F.pagarSiguiente("n", 8)], ["Cheque", F.cheque.join(" / ")], ["Bajar", F.bajar], ["Subir", F.subir], ["Comprobar", F.comprobar]]) {
    assert.equal(v, textoDe(r, lugar), lugar);
  }
});

/* ═══════════ LA FIGURA, PANTALLA POR PANTALLA ═══════════ */

test("★★★ P0: pagar baja los billetes y sube los soportes, «Suman» se queda en 500.000; tres pagos como mucho; «Reponer» devuelve los billetes", async () => {
  const m = await abrir(P, "el-fondo");
  try {
    assert.deepEqual(sobre(m), { billetes: "500.000", soportes: null, suman: "500.000" });
    assert.equal(q(m, "[data-accion=reponer]").getAttribute("aria-disabled"), "true");
    for (let n = 1; n <= 3; n++) {
      tocar(q(m, "[data-accion=pagar]"));
      await esperar(0);
      const pagado = A.GASTOS_MAYO.slice(0, n).reduce((s, g) => s + g.valor, 0);
      assert.equal(Number(q(m, '[data-fila-sobre="soportes"]').dataset.valor), pagado);
      assert.equal(q(m, '[data-fila-sobre="suman"]').dataset.valor, String(A.FONDO));
    }
    assert.equal(q(m, "[data-accion=pagar]").getAttribute("aria-disabled"), "true");
    tocar(q(m, "[data-accion=reponer]"));
    await esperar(0);
    assert.equal(q(m, '[data-fila-sobre="soportes"]').style.visibility, "hidden");
    assert.equal(q(m, '[data-fila-sobre="billetes"]').dataset.valor, String(A.FONDO));
  } finally { m.desmontar(); }
});

test("★★★ P1: el cheque abre el fondo: el sobre llega a 500.000 y el libro escribe Caja menor al debe y Bancos al haber; el cheque deja su sitio", async () => {
  const m = await abrir(P, "la-apertura");
  try {
    assert.equal(total(m, "caja-menor:debe"), "");
    tocar(q(m, "[data-cheque]"));
    await esperar(0);
    assert.equal(q(m, '[data-fila-sobre="billetes"]').dataset.valor, String(A.FONDO));
    assert.deepEqual([total(m, "caja-menor:debe"), total(m, "bancos:haber"), total(m, "caja-menor:haber"), total(m, "bancos:debe")], ["500.000", "500.000", "", ""]);
    assert.equal(q(m, "[data-cheque]").style.visibility, "hidden");
  } finally { m.desmontar(); }
});

test("★★★ P2: los ocho gastos de mayo, uno por toque, con su rubro y su cifra; los soportes llegan a 478.100; los billetes «sin contar» y 21.900 no aparece", async () => {
  const m = await abrir(P, "los-gastos");
  try {
    for (const [i, g] of A.GASTOS_MAYO.entries()) {
      assert.equal(visible(q(m, "[data-accion=pagar]")), A.FIGURA_A2.pagarSiguiente(i + 1, 8));
      tocar(q(m, "[data-accion=pagar]"));
      await esperar(0);
      assert.equal(visible(q(m, "[data-gasto]")), `${g.gasto}${String(g.valor).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`);
      assert.ok(!q(m, "[data-pieza]").textContent.includes("21.900"), `21.900 en P2 tras el gasto ${i + 1}`);
    }
    assert.equal(q(m, '[data-fila-sobre="soportes"]').dataset.valor, String(A.GASTADO));
    assert.equal(sobre(m).billetes, "sin contar");
    assert.equal(q(m, "[data-accion=pagar]").getAttribute("aria-disabled"), "true");
  } finally { m.desmontar(); }
});

test("★★★ P3: la cifra elegida va a los billetes y «Suman» da cifra + 478.100; con una equivocada, «Suman (no es el fondo)» y «✗ Mal» en la opción; reintento; con 21.900, 500.000 y «✓ Bien»", async () => {
  const m = await abrir(P, "cuanto-queda");
  try {
    assert.deepEqual(sobre(m), { fondo: "500.000", billetes: "?", soportes: "478.100", suman: "?" });
    for (const [v, suma] of [[A.FONDO, 978_100], [A.GASTADO, 956_200]]) {
      tocar(q(m, `[data-opcion="${v}"]`));
      await esperar(0);
      const fila = q(m, '[data-fila-sobre="suman"]');
      assert.equal(fila.firstElementChild.textContent, A.FIGURA_A2.sumanMal);
      assert.equal(fila.dataset.valor, String(suma));
      assert.equal(visible(q(m, `[data-opcion="${v}"]`)), `${String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}✗Mal`);
      assert.equal(q(m, '[data-opcion="21900"] .t4r-marca'), null, "la correcta se marca en el error");
    }
    tocar(q(m, '[data-opcion="21900"]'));
    await esperar(0);
    assert.equal(q(m, '[data-fila-sobre="suman"]').firstElementChild.textContent, A.FIGURA_A2.suman);
    assert.equal(q(m, '[data-fila-sobre="suman"]').dataset.valor, String(A.FONDO));
    assert.equal(visible(q(m, '[data-opcion="21900"]')), "21.900✓Bien");
    assert.ok([...m.caja.querySelectorAll("[data-opcion]")].every((b) => b.disabled), "las opciones siguen activas tras el acierto");
  } finally { m.desmontar(); }
});

test("★★★ P4: el cheque del reembolso repone: los billetes vuelven a 500.000, los soportes se van y «Suman» no se mueve", async () => {
  const m = await abrir(P, "el-reembolso");
  try {
    assert.deepEqual(sobre(m), { billetes: "21.900", soportes: "478.100", suman: "500.000" });
    tocar(q(m, "[data-cheque]"));
    await esperar(0);
    assert.deepEqual(sobre(m), { billetes: "500.000", soportes: null, suman: "500.000" });
  } finally { m.desmontar(); }
});

test("★★★ P5: Caja menor dice 500.000 antes y después; en el error no se escribe nada y solo se marca la mitad que falla, con «✗ Mal», y su texto; el acierto escribe Gastos generales y Bancos (978.100)", async () => {
  const errores = P.pantallas.find((p) => p.id === "y-caja-menor").errores;
  const casos = [
    [["caja-menor:debe", "bancos:haber"], "debeCajaMenor", ["caja-menor:debe"]],
    [["gastos-generales:debe", "caja-menor:haber"], "haberCajaMenor", ["caja-menor:haber"]],
    [["caja:debe", "bancos:haber"], "debeOtra", ["caja:debe"]],
    [["gastos-generales:debe", "caja:haber"], "haberOtra", ["caja:haber"]],
    [["bancos:debe", "gastos-generales:haber"], "ambas", ["bancos:debe", "gastos-generales:haber"]],
  ];
  for (const [toques, clave, marcadas] of casos) {
    const m = await abrir(P, "y-caja-menor");
    try {
      /* Lo que no se tocó no cambia; lo tocado y bien elegido queda puesto (sin marca); lo mal elegido, con su marca y su total de antes. */
      const mitades = ["caja-menor:debe", "caja-menor:haber", "bancos:debe", "bancos:haber", "gastos-generales:debe", "gastos-generales:haber", "caja:debe", "caja:haber"];
      const antes = Object.fromEntries(mitades.map((k) => [k, total(m, k)]));
      for (const k of toques) tocar(q(m, `[data-destino="${k}"]`));
      tocar(q(m, "[data-boton=comprobar]"));
      await esperar(0);
      assert.equal(q(m, "[data-mensaje]").dataset.mensaje, "error", clave);
      assert.equal(q(m, "[data-devolucion]").textContent, `Incorrecto. ${errores[clave]}`, clave);
      assert.deepEqual([...m.caja.querySelectorAll("[data-destino][data-marca]")].map((b) => b.dataset.destino).sort(), [...marcadas].sort(), clave);
      for (const k of marcadas) assert.match(visible(q(m, `[data-destino="${k}"]`)), /✗Mal$/, k);
      for (const k of mitades) {
        if (marcadas.includes(k)) assert.equal(total(m, k), `${antes[k]}✗Mal`, `${clave} · ${k}`);
        else if (toques.includes(k)) {
          assert.equal(q(m, `[data-destino="${k}"]`).dataset.puesta, "", `${clave} · ${k}: lo bien elegido no queda puesto`);
          assert.equal(total(m, k), "478.100", `${clave} · ${k}`);
        } else assert.equal(total(m, k), antes[k], `${clave} · ${k}: el error escribió algo en el libro`);
      }
      assert.equal(total(m, "caja-menor:debe").replace(/✗Mal$/, ""), "500.000");
    } finally { m.desmontar(); }
  }
  const m = await abrir(P, "y-caja-menor");
  try {
    await jugar(m, P, "y-caja-menor");
    assert.equal(q(m, "[data-mensaje]").dataset.mensaje, "acierto");
    assert.deepEqual([total(m, "caja-menor:debe"), total(m, "gastos-generales:debe"), total(m, "bancos:haber")], ["500.000", "478.100✓Bien", "978.100✓Bien"]);
    assert.equal(q(m, "[data-boton=comprobar]"), null, "«Comprobar» sigue tras el acierto");
  } finally { m.desmontar(); }
});

test("★★★ P6: subir y bajar de a 100.000, entre 400.000 y 600.000; subir mueve Caja menor al debe y Bancos al haber; bajar, Caja al debe y Caja menor al haber", async () => {
  const m = await abrir(P, "subir-bajar");
  try {
    tocar(q(m, "[data-accion=subir]"));
    await esperar(0);
    assert.equal(q(m, '[data-fila-sobre="billetes"]').dataset.valor, "600000");
    assert.deepEqual([total(m, "caja-menor:debe"), total(m, "bancos:haber")], ["600.000", "600.000"]);
    assert.equal(q(m, "[data-accion=subir]").getAttribute("aria-disabled"), "true");
    tocar(q(m, "[data-accion=bajar]"));
    tocar(q(m, "[data-accion=bajar]"));
    await esperar(0);
    assert.equal(q(m, '[data-fila-sobre="billetes"]').dataset.valor, "400000");
    assert.deepEqual([total(m, "caja:debe"), total(m, "caja-menor:haber"), total(m, "caja-menor:debe")], ["100.000", "100.000", "500.000"]);
    assert.equal(q(m, "[data-accion=bajar]").getAttribute("aria-disabled"), "true");
  } finally { m.desmontar(); }
});

test("★★ el lector oye la marca: la mitad mal elegida dice «Mal» en su nombre, y la opción también", async () => {
  const m = await abrir(P, "y-caja-menor");
  try {
    tocar(q(m, '[data-destino="caja-menor:debe"]'));
    tocar(q(m, '[data-destino="bancos:haber"]'));
    tocar(q(m, "[data-boton=comprobar]"));
    assert.equal(q(m, '[data-destino="caja-menor:debe"]').getAttribute("aria-label"), "Caja menor al debe: Mal");
    assert.equal(q(m, '[data-destino="bancos:haber"]').getAttribute("aria-label"), "Bancos al haber");
  } finally { m.desmontar(); }
  assert.equal(seguir, R.seguir);
});
