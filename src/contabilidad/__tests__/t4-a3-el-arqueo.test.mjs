import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A3 «El arqueo» (Célula D) · REDISEÑO DE ENGANCHE.
 *
 *   · cada texto es el del paquete vigente (d4-t4-a3-v4-rediseno.md, los
 *     textos de Katsumi aprobados por Yujiro), letra por letra, en su lugar
 *   · la regla del fondo de H4 (Regla.jsx, la misma pieza): contar, mover la
 *     plata de la caja (la aguja corre y debajo se lee qué hay), decidir qué
 *     muestra el arqueo (la aguja solo con el acierto), el cheque (la aguja
 *     «caja + tu cheque» solo cae en la marca con el correcto), la cuenta de
 *     la diferencia (en el error no se escribe nada) y los dos caminos
 *   · las cifras se calculan; 480.200 y 471.400 son construidas
 *   · lo común (t4-aprender-rd.mjs): «Seguir» tras el acierto, PH8-2, B4,
 *     ningún error que nombre la respuesta y Aprender sin FP
 * ═══════════════════════════════════════════════════════════════════════════
 */

const R = await import("./t4-aprender-rd.mjs");
const { q, abrir, jugar, tocar, esperar, pruebasComunes, leer, seccionDe, renglones, textoDe } = R;
const A = await import("../../data/contabilidadT4A3.js");
const A2 = await import("../../data/contabilidadT4A2.js");
const { w, act, visible } = await import("./t4-dom.mjs");
const { xDe } = await import("../../components/t4/Regla.jsx");

const P = A.PIEZA_EL_ARQUEO;
const { PAQ } = pruebasComunes({
  P,
  canon: "d4-t4-a3-v4-rediseno.md",
  datos: "src/data/contabilidadT4A3.js",
  piezas: ["src/data/contabilidadT4A3.js", "src/components/t4/A3ElArqueo.jsx", "src/components/t4/Regla.jsx", "src/components/t4/aprender.jsx", "src/components/t4/tablero.jsx"],
  noNombra: {
    "el-sobrante": ["sobrante", "Sobra"],
    "el-cheque": ["476.000", "476000"],
    "el-faltante": ["484.800", "484800"],
    /* «lado» habla de la cuenta buena a propósito (Katsumi, «Para Baki» 11): aquí se mira que ninguno nombre la cuenta ni el lado. */
    "el-asiento": ["Ingresos no operacionales", "haber"],
    "camino-1": ["Cuentas por cobrar – empleados", "debe"],
  },
  antesDe: "t4-a2-el-fondo-fijo",
  preguntas: ["el-sobrante", "el-cheque", "el-asiento", "el-faltante", "camino-1"],
});

const sobre = (m) => Object.fromEntries([...m.caja.querySelectorAll("[data-fila-sobre]")].map((f) => [f.dataset.filaSobre, f.lastElementChild.textContent]));
const aguja = (m, id) => q(m, `[data-aguja="${id}"]`);
const izquierda = (el) => Number(el.style.left.match(/calc\(([\d.]+)%/)[1]);
const total = (m, k) => q(m, `[data-destino="${k}"]`)?.textContent.replace(/\s/g, "") ?? null;

/* ═══════════ LAS CIFRAS Y LOS RÓTULOS ═══════════ */

test("★★★ las cifras se calculan (pp. 182-186): sobrante 2.100 y cheque 476.000; faltante 6.700 y cheque 484.800; distractores 480.200 y 471.400; el control de 14.900 a 28.900", () => {
  assert.equal(A.SUMA_SOBRANTE, 502_100);
  assert.equal(A.SOBRANTE, 2_100);
  assert.equal(A.CHEQUE_SOBRANTE, 476_000);
  assert.equal(A.SUMA_FALTANTE, 493_300);
  assert.equal(A.FALTANTE, 6_700);
  assert.equal(A.CHEQUE_FALTANTE, 484_800);
  assert.deepEqual([A.CHEQUE_CON_DIFERENCIA, A.CHEQUE_SIN_FALTANTE], [480_200, 471_400]);
  assert.equal(A.EFECTIVO_SOBRANTE + A.CHEQUE_SOBRANTE, A2.FONDO);
  assert.equal(A.EFECTIVO_FALTANTE + A.CHEQUE_FALTANTE, A2.FONDO);
  assert.deepEqual([A.CONTROL_A3.min, A.CONTROL_A3.max, A.CONTROL_A3.paso, A.CONTROL_A3.inicio], [14_900, 28_900, 100, 21_900]);
  assert.match(PAQ, /Distractores construidos: 480\.200 y 471\.400/);
});

test("★★★ los rótulos de la figura son los del paquete; la regla conserva los de H4", () => {
  const r = renglones(seccionDe(PAQ, "Rótulos de la figura"));
  const F = A.FIGURA_A3;
  for (const [lugar, v] of [["Soportes", F.soportes], ["Caja", F.caja], ["Sin contar", F.sinContar], ["Contar", F.contar], ["Control (para el lector)", F.control],
    ["Línea de P1 · cuadra", F.zona.cuadra], ["Opción · falta", F.chips.falta], ["Opción · cuadra", F.chips.cuadra], ["Opción · sobra", F.chips.sobra],
    ["Aguja", F.aguja], ["Asiento", F.asiento], ["Interruptor · cobra", F.caminos.cobra], ["Interruptor · asume", F.caminos.asume],
    ["Rótulo del tramo · cobra", F.tramo.cobra], ["Rótulo del tramo · asume", F.tramo.asume], ["Para el lector, el destino", F.vanA("{cuenta}")]]) {
    assert.equal(v, textoDe(r, lugar), lugar);
  }
  assert.equal(`${F.zona.sobra} · cifra`, textoDe(r, "Línea de P1 · sobra"));
  assert.equal(`${F.zona.falta} · cifra`, textoDe(r, "Línea de P1 · falta"));
  const regla = leer("src/components/t4/Regla.jsx");
  for (const t of ["fondo <b>", ">falta<", ">sobra<", "cada marca: 2.000", "suman, fuera de la regla "]) assert.ok(regla.includes(t), t);
});

/* ═══════════ LA FIGURA, PANTALLA POR PANTALLA ═══════════ */

test("★★★ P0: la caja «sin contar» y la regla sin aguja; «Contar la caja»: 21.900 y la aguja «suman» en la marca del fondo", async () => {
  const m = await abrir(P, "contar");
  try {
    assert.deepEqual(sobre(m), { soportes: "478.100", caja: "sin contar" });
    assert.equal(aguja(m, "suman"), null);
    tocar(q(m, "[data-accion=contar]"));
    await esperar(0);
    assert.equal(q(m, '[data-fila-sobre="caja"]').dataset.valor, "21900");
    assert.equal(izquierda(aguja(m, "suman")), 50 - 0);
    assert.match(q(m, '[data-rot="suman"]').textContent, /500\.000/);
  } finally { m.desmontar(); }
});

test("★★★ P1: el control mueve la plata de la caja; la aguja corre, se dibuja el tramo y debajo se lee «Cuadra», «Sobrante de caja menor · …» o «Faltante de caja menor · …»", async () => {
  const m = await abrir(P, "cuando-no-cuadra");
  try {
    const control = q(m, "[data-accion=mover]");
    assert.equal(control.getAttribute("aria-label"), A.FIGURA_A3.control);
    assert.deepEqual([control.min, control.max, control.step], ["14900", "28900", "100"]);
    assert.equal(visible(q(m, "[data-zona]")), "Cuadra");
    assert.equal(q(m, "[data-tramo]"), null);
    const mover = (v) => act(() => {
      w.Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set.call(control, String(v));
      control.dispatchEvent(new w.Event("input", { bubbles: true }));
    });
    mover(24_000);
    await esperar(0);
    assert.equal(visible(q(m, "[data-zona]")), "Sobrante de caja menor · 2.100");
    assert.ok(izquierda(aguja(m, "suman")) > 50);
    assert.ok(q(m, "[data-tramo]"));
    mover(15_200);
    await esperar(0);
    assert.equal(visible(q(m, "[data-zona]")), "Faltante de caja menor · 6.700");
    assert.ok(izquierda(aguja(m, "suman")) < 50);
    /* Las 141 posiciones caben en la regla: ni la aguja ni su rótulo salen por «fuera». */
    for (let v = A.CONTROL_A3.min; v <= A.CONTROL_A3.max; v += A.CONTROL_A3.paso) {
      const d = A2.GASTADO + v - A2.FONDO;
      assert.ok(Math.abs(d) <= 10_000, `${v}: fuera de la regla`);
      assert.ok(xDe(d) > 2 && xDe(d) < 98, `${v}`);
    }
  } finally { m.desmontar(); }
});

test("★★★ P2: la aguja aparece solo con el acierto (antes delataría la respuesta); en el error, «✗ No va aquí» en la elegida y la regla quieta", async () => {
  const m = await abrir(P, "el-sobrante");
  try {
    assert.equal(aguja(m, "suman"), null);
    for (const o of ["falta", "cuadra"]) {
      tocar(q(m, `[data-opcion="${o}"]`));
      await esperar(0);
      assert.equal(aguja(m, "suman"), null, `${o}: la aguja en el error`);
      assert.equal(visible(q(m, "[data-linea-marcas]")), "No va aquí");
    }
    tocar(q(m, '[data-opcion="sobra"]'));
    await esperar(0);
    assert.ok(izquierda(aguja(m, "suman")) > 50, "la aguja no queda a la derecha de la marca");
    assert.match(q(m, '[data-rot="suman"]').textContent, /502\.100/);
  } finally { m.desmontar(); }
});

test("★★★ P3 y P5: la aguja «caja + tu cheque» cae donde dice el cheque elegido; solo el correcto la deja en la marca; las otras, coral y con ✗", async () => {
  for (const [id, caja, opciones, correcta] of [["el-cheque", 24_000, [478_100, 480_200], 476_000], ["el-faltante", 15_200, [478_100, 471_400], 484_800]]) {
    const m = await abrir(P, id);
    try {
      assert.equal(aguja(m, "con-el-cheque"), null);
      for (const o of opciones) {
        tocar(q(m, `[data-opcion="${o}"]`));
        await esperar(0);
        const desv = caja + o - A2.FONDO;
        assert.equal(izquierda(aguja(m, "con-el-cheque")), xDe(desv), `${id} · ${o}`);
        assert.equal(aguja(m, "con-el-cheque").style.background, "rgb(231, 111, 81)", `${id} · ${o}: la aguja no va en coral`);
        assert.ok(q(m, '[data-rot="tu-cheque"] [data-icono="x"]'), "el X de lucide en la etiqueta");
        assert.match(q(m, '[data-rot="tu-cheque"]').textContent, new RegExp(`^(← )?caja \\+ tu cheque ${String(caja + o).replace(/\B(?=(\d{3})+(?!\d))/g, "\\.")}`));
      }
      tocar(q(m, `[data-opcion="${correcta}"]`));
      await esperar(0);
      assert.equal(izquierda(aguja(m, "con-el-cheque")), 50, `${id}: el correcto no deja la aguja en la marca`);
      assert.equal(q(m, '[data-rot="tu-cheque"]').textContent, "caja + tu cheque 500.000");
    } finally { m.desmontar(); }
  }
});

test("★★★ P4 y P7: la diferencia a una cuenta y un lado, con un toque; en el error no se escribe nada, «✗ No va aquí» en lo elegido y el texto de esa cuenta (o del lado); el acierto la escribe", async () => {
  for (const [id, malas, lado, va] of [
    ["el-asiento", ["gastos-generales:debe", "bancos:haber"], "ino-sobrante:debe", "ino-sobrante:haber"],
    ["camino-1", ["gno-faltante:debe", "ino-sobrante:haber"], "cxc-empleados:haber", "cxc-empleados:debe"],
  ]) {
    const p = P.pantallas.find((x) => x.id === id);
    for (const k of [...malas, lado]) {
      const m = await abrir(P, id);
      try {
        const antes = Object.fromEntries(p.cuentas.flatMap((c) => ["debe", "haber"].map((l) => [`${c}:${l}`, total(m, `${c}:${l}`)])));
        /* Una sola ficha: el toque califica en el acto, sin «Comprobar» (P2 de Hanayama, §5.2). */
        tocar(q(m, `[data-destino="${k}"]`));
        await esperar(0);
        assert.equal(q(m, "[data-boton=comprobar]"), null, "P4 y P7 ya no llevan «Comprobar»");
        const [cuenta] = k.split(":");
        assert.equal(q(m, "[data-devolucion]").textContent, `Incorrecto. ${p.errores[cuenta] ?? p.errores.lado}`, `${id} · ${k}`);
        for (const [x, v] of Object.entries(antes)) assert.equal(total(m, x), x === k ? `${v}Novaaquí` : v, `${id} · ${k} · ${x}`);
      } finally { m.desmontar(); }
    }
    const m = await abrir(P, id);
    try {
      await jugar(m, P, id);
      assert.equal(total(m, va), `${String(p.monto).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}Correcto`);
    } finally { m.desmontar(); }
  }
});

test("★★★ dos-caminos (lote B, §5.1 v2): va después de camino-1 y absorbe a camino-2; el interruptor cambia el destino de los mismos 6.700 en la regla y en el asiento, sin tocar el tramo ni la cifra; la frase de cierre sale con el primer cambio y se queda", async () => {
  const ids = P.pantallas.map((p) => p.id);
  assert.equal(ids.indexOf("dos-caminos"), ids.indexOf("camino-1") + 1, "dos-caminos no va justo después de camino-1 (delataría su respuesta)");
  assert.ok(!ids.includes("camino-2"), "camino-2 sigue: sería la misma pantalla con otro texto");
  assert.equal(ids.at(-1), "dos-caminos");
  const m = await abrir(P, "dos-caminos");
  try {
    const foto = () => ({
      cuentas: [...m.caja.querySelectorAll("[data-cuenta]")].map((f) => `${f.dataset.cuenta}:${total(m, `${f.dataset.cuenta}:debe`)}:${total(m, `${f.dataset.cuenta}:haber`)}`),
      tramo: q(m, '[data-tramo="dif"]').getAttribute("style"),
      aguja: q(m, '[data-aguja="suman"]').getAttribute("style"),
      rotulo: q(m, '[data-rot="destino"]').textContent,
      lector: q(m, "[data-lector-destino]").textContent,
    });
    const a = foto();
    assert.deepEqual(a.cuentas, ["cxc-empleados:6.700:"], "al llegar: se le cobra a Rosa (lo decidido en camino-1)");
    assert.equal(a.rotulo, A.FIGURA_A3.tramo.cobra);
    assert.equal(a.lector, "Los 6.700 van a Cuentas por cobrar – empleados, al debe.");
    assert.ok(Number(q(m, '[data-tramo="dif"]').style.left.replace("%", "")) < 50, "el tramo no queda a la izquierda de la marca del fondo");
    assert.equal(q(m, "[data-accion=cobra]").getAttribute("aria-pressed"), "true");
    assert.equal(q(m, "[data-cierre][data-visible]"), null, "la frase de cierre antes del cambio");
    assert.equal(q(m, "[data-cierre] .t4r-fantasma").textContent, P.pantallas.at(-1).cierre, "la frase no reserva su alto");
    tocar(q(m, "[data-accion=asume]"));
    await esperar(0);
    const b = foto();
    assert.deepEqual(b.cuentas, ["gno-faltante:6.700:"]);
    assert.equal(b.rotulo, A.FIGURA_A3.tramo.asume);
    assert.equal(b.lector, "Los 6.700 van a Gastos no operacionales – faltante de caja menor, al debe.");
    assert.deepEqual([b.tramo, b.aguja], [a.tramo, a.aguja], "el tramo o la aguja se movieron");
    assert.equal(q(m, "[data-accion=asume]").getAttribute("aria-pressed"), "true");
    assert.ok(q(m, "[data-cierre][data-visible]"), "la frase de cierre no aparece con el cambio");
    tocar(q(m, "[data-accion=cobra]"));
    await esperar(0);
    assert.deepEqual(foto().cuentas, ["cxc-empleados:6.700:"]);
    assert.ok(q(m, "[data-cierre][data-visible]"), "la frase de cierre se va al volver");
  } finally { m.desmontar(); }
});

test("★★★ camino-1 dice que es representativo (lo que antes decía dos-caminos), sin nombrar la cuenta ni el lado", () => {
  const t = P.pantallas.find((p) => p.id === "camino-1").antes[0];
  assert.match(t, /representativo/);
  assert.doesNotMatch(t, /Cuentas por cobrar|debe|haber/);
});

test("★★ las cuentas del asiento van completas, en renglones fijos (C5, D4-3); «sobrante» y «faltante» nunca a secas en las opciones", () => {
  assert.deepEqual(A.CUENTAS_A3["ino-sobrante"].renglones.join(" "), "Ingresos no operacionales – sobrante de caja menor");
  assert.deepEqual(A.CUENTAS_A3["cxc-empleados"].renglones.join(" "), "Cuentas por cobrar – empleados");
  assert.deepEqual(A.CUENTAS_A3["gno-faltante"].renglones.join(" "), "Gastos no operacionales – faltante de caja menor");
  assert.deepEqual(Object.values(A.FIGURA_A3.chips), ["Falta", "Cuadra", "Sobra"]);
});
