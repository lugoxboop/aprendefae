/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LOS SLIDES DE APRENDER SOBRE SecuenciaAprender (#488).
 *
 * Lo que vale para las seis piezas, en los dos casos (D8):
 *   ★ la forma: faltasDePieza (secuencia.js) sin más faltas que las dos que
 *     el diseño de T4 toma a propósito (Hanayama §4; lote 4 de Katsumi):
 *     la pantalla 1 es un Haz y no una Apertura, y A4 no tiene Cierre
 *   ★ el texto es literal: cada texto de pantalla está, letra por letra, en
 *     el hilo de Katsumi, en un paquete aprobado de T4 o en los datos ya
 *     aprobados de A0-A5 (rótulos de las figuras)
 *   ★ cada pantalla declara `antes` (lo que la banda dice antes de responder)
 *   ★ B2: titular y banda de antes, 60 palabras como mucho por pantalla
 *   ★ se recorre entera: cada Haz se resuelve (C2: dos errores bastan), la
 *     banda da su devolución, y el último cierre lleva a «Volver al tema»
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { h, montar, tocar, act, movimientoReducido } from "./t4-dom.mjs";
import { leer, PAQUETES } from "./t4-paquete.mjs";

const { SLIDES_T4, TEMA_T4 } = await import("../../components/ContabilidadT4View.jsx");
const { faltasDePieza, palabras } = await import("../../components/secuencia/secuencia.js");
const { default: SecuenciaAprender } = await import("../../components/secuencia/SecuenciaAprender.jsx");

/* Las faltas que T4 toma a propósito (ver arriba). Cualquier otra pone la prueba en rojo. */
const ADMITIDAS = new Set(["la primera pantalla tiene que ser la apertura"]);
const SIN_CIERRE = { "t4-a4-bancos-y-notas": ["la última pantalla tiene que ser el cierre", "va exactamente un cierre"] };

const CORPUS = [
  leer("orquestador/revisiones/t4-slides/hilo-katsumi.md"),
  leer("orquestador/revisiones/t4-slides/diseno-hanayama.md"),
  ...readdirSync(new URL(`../../../${PAQUETES}`, import.meta.url)).filter((f) => f.startsWith("d4-t4-")).map((f) => leer(PAQUETES + f)),
  /* Los datos de las piezas de antes (A0-A5), ya aprobados: rótulos y glosas de las figuras. Los de los slides, no. */
  ...readdirSync(new URL("../../data/", import.meta.url)).filter((f) => /^contabilidadT4(A\d|)\.js$/.test(f)).map((f) => leer(`src/data/${f}`)),
].join("\n").replace(/\s+/g, " ");

/* La plantilla de un texto: las cifras y las personas de los dos casos, cambiadas por marcas. */
const PERSONAS = /\b(Rosa Primorosa|Rosa)\b/g;
const plantilla = (t) => t.replace(/\s+/g, " ").replace(/\$?\d[\d.,]*/g, "#").replace(PERSONAS, "@");
const CORPUS_PLANTILLA = plantilla(CORPUS);

/* Todos los textos de una pieza: los strings de `textos`, en hondo (ids y cifras aparte). */
function textosDe(x, fuera = []) {
  if (typeof x === "string") { if (/\s/.test(x.trim()) || /[.?:]$/.test(x)) fuera.push(x); return fuera; }
  if (Array.isArray(x)) { x.forEach((y) => textosDe(y, fuera)); return fuera; }
  if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) if (!["id", "correcta", "deuda"].includes(k)) textosDe(v, fuera);
  return fuera;
}

for (const caso of [1, 2]) {
  const piezas = SLIDES_T4.map((s) => s.crear(caso));

  test(`★ caso ${caso}: la forma de cada pieza cumple faltasDePieza, salvo lo que T4 toma a propósito`, () => {
    assert.ok(piezas.length >= 1);
    for (const pz of piezas) {
      const admitidas = new Set([...ADMITIDAS, ...(SIN_CIERRE[pz.id] ?? [])]);
      assert.deepEqual(faltasDePieza(pz).filter((f) => !admitidas.has(f)), [], pz.id);
      assert.equal(pz.pantallas[0].tipo, "haz", `${pz.id}: la decisión va en la pantalla 1`);
    }
  });

  test(`★ caso ${caso}: cada texto de pantalla está letra por letra en el hilo o en un paquete aprobado`, () => {
    for (const pz of piezas) {
      const sueltos = [...new Set([...pz.pantallas.map((p) => p.titular), ...textosDe(pz.textos)])]
        .filter((t) => !CORPUS.includes(t.replace(/\s+/g, " ")))
        /* Caso B: el lote 4 se escribe con la plantilla del caso 1 y las cifras y la persona del caso B (Katsumi). */
        .filter((t) => caso === 1 || !CORPUS_PLANTILLA.includes(plantilla(t)));
      assert.deepEqual(sueltos, [], `${pz.id}: textos que no están en la fuente`);
    }
  });

  test(`★ caso ${caso}: B2, titular y banda de antes suman 60 palabras como mucho`, () => {
    for (const pz of piezas) {
      for (const p of pz.pantallas) {
        const n = palabras(p.titular) + (p.antes ?? []).reduce((s, t) => s + palabras(t), 0);
        assert.ok(n <= 60, `${pz.id}/${p.id}: ${n} palabras`);
      }
    }
  });

  test(`★ caso ${caso}: se recorre entera; cada Haz se resuelve y la banda da la devolución`, () => {
    /* Con movimiento reducido el cambio de pantalla es inmediato (sin los 120 ms de salida). */
    const antes = movimientoReducido(true);
    let final = 0;
    const m = montar(h("div", { className: "t4-sec" }, h(SecuenciaAprender, { temaId: `${TEMA_T4}/prueba${caso}`, piezas, final: "tema", onFinal: () => { final += 1; } })));
    const sig = () => m.caja.querySelector("button[data-siguiente]");
    const visto = [];
    for (let vuelta = 0; vuelta < 80 && !final; vuelta++) {
      const raiz = m.caja.querySelector("[data-secuencia]");
      const pt = raiz.querySelector("[data-pantalla]");
      const donde = `${raiz.dataset.pieza}/${pt.dataset.pantalla}`;
      visto.push(donde);
      assert.ok(pt.querySelector("[data-modelo]"), `${donde}: sin modelo`);
      assert.ok(pt.querySelector("[data-banda]"), `${donde}: sin banda`);
      for (let k = 0; k < 30 && sig().dataset.siguiente === "espera"; k++) {
        const c = [...pt.querySelectorAll(".t4s-ctl")].find((b) => b.getAttribute("aria-disabled") !== "true" && !b.dataset.ver);
        assert.ok(c, `${donde}: el Haz espera y no queda ningún control que tocar`);
        tocar(c);
        assert.ok(pt.querySelector("[data-capa-viva] [data-mensaje]"), `${donde}: tocar no dio devolución en la banda`);
      }
      assert.notEqual(sig().dataset.siguiente, "espera", `${donde}: no se resolvió`);
      tocar(sig());
    }
    m.desmontar();
    movimientoReducido(antes);
    assert.equal(final, 1, `no llegó al final: ${visto.join(" · ")}`);
    assert.equal(visto.length, piezas.reduce((s, p) => s + p.pantallas.length, 0));
  });
}
