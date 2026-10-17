import { test } from "node:test";
import assert from "node:assert/strict";
import { con, reducir, tocar, dormir, h } from "./t5-cuatro-comun.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · P1 «Del efectivo» y P2 «Tres momentos», capa 3 · D8 (Mello, auditoría
 * de #447): las opciones de cada caja se barajan una vez por intento, con la
 * barajar de #442 (utils/barajar.js), por la prop opcional `mezclar` de
 * DosPaquetes y DosVentas. Dentro del intento no cambian (tampoco tras un
 * error: la escalera da otro intento); el siguiente trae otro orden. Sin
 * `mezclar`, el orden de los datos (la huella de main de recorridoCajas la
 * cuida t5-p1-c4.test.mjs).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D1 = await import("../../data/contabilidadT5Pieza1.js");
const D2 = await import("../../data/contabilidadT5Pieza2.js");
const { DosPaquetesC4, DosVentasC4 } = await import("../../components/mecanicas/libros/tema5/capa3C4T5.jsx");
const DosPaquetes = (await import("../../components/mecanicas/libros/tema5/DosPaquetes.jsx")).default;
const DosVentas = (await import("../../components/mecanicas/libros/tema5/DosVentas.jsx")).default;
const { useState } = await import("react");

/* Un padre que se vuelve a pintar a pedido (como la capa que lo contiene): el sorteo no debe repetirse. */
function ConPadre({ Pieza, mezclar }) {
  const [k, setK] = useState(0);
  return h("div", null, h("button", { type: "button", "data-forzar": k, onClick: () => setK((x) => x + 1) }, "otra vez"), h(Pieza, { mezclar, k }));
}

const PIEZAS = [
  { nombre: "P1", C4: DosPaquetesC4, Base: DosPaquetes, cajas: D1.PAQUETES.map((p) => ({ id: p.id, correcta: p.correcta })), opciones: D1.OPCIONES_CAPA_3.map((o) => o.id) },
  { nombre: "P2", C4: DosVentasC4, Base: DosVentas, cajas: D2.VENTAS_T5_A2.map((v) => ({ id: v.id, correcta: v.correcta })), opciones: D2.OPCIONES_CAPA_3_T5_A2.map((o) => o.id) },
];

const zona = (caja, id) => caja.querySelector(`[data-hecho="${id}"]`);
const abrir = async (caja, id) => { const b = zona(caja, id).querySelector("button[aria-expanded]"); if (b?.getAttribute("aria-expanded") === "false") await tocar(b); };
const orden = (caja, id) => [...zona(caja, id).querySelectorAll("[data-opcion]")].map((x) => x.dataset.opcion);
const abrirTodas = async (caja, P) => { for (const c of P.cajas) await abrir(caja, c.id); };

for (const P of PIEZAS) {
  test(`★★★ ${P.nombre} · con \`mezclar\`, cada caja sale en el orden sorteado y no cambia en el intento (tampoco tras un error ni si el padre se repinta)`, async () => {
    reducir(true);
    let n = 0;
    const rotar = (xs) => { n += 1; const k = n % xs.length; return [...xs.slice(k), ...xs.slice(0, k)]; };
    await con(h(ConPadre, { Pieza: P.C4, mezclar: rotar }), async (caja) => {
      await abrirTodas(caja, P);
      assert.equal(n, P.cajas.length, "un sorteo por caja, una sola vez");
      const vistos = Object.fromEntries(P.cajas.map((c) => [c.id, orden(caja, c.id)]));
      P.cajas.forEach((c, k) => {
        const r = (k + 1) % P.opciones.length;
        assert.deepEqual(vistos[c.id], [...P.opciones.slice(r), ...P.opciones.slice(0, r)], `${c.id}: el orden del sorteo`);
      });
      /* Un error en la primera caja: la escalera deja otro intento; las opciones siguen donde estaban. */
      const c0 = P.cajas[0];
      await tocar(zona(caja, c0.id).querySelector(`[data-opcion="${P.opciones.find((o) => o !== c0.correcta)}"] button`) ?? zona(caja, c0.id).querySelector(`[data-opcion="${P.opciones.find((o) => o !== c0.correcta)}"]`));
      await dormir(50);
      await tocar(caja.querySelector("[data-forzar]"));
      for (const c of P.cajas) assert.deepEqual(orden(caja, c.id), vistos[c.id], `${c.id}: cambió dentro del intento`);
      assert.equal(n, P.cajas.length, "no se vuelve a sortear");
    });
  });

  test(`★★★ ${P.nombre} · la capa 3 real baraja: otro intento, otro orden (con las mismas opciones)`, async () => {
    reducir(true);
    const vistos = new Set();
    for (let i = 0; i < 30 && vistos.size < 2; i++) {
      await con(h(P.C4), async (caja) => {
        await abrirTodas(caja, P);
        for (const c of P.cajas) assert.deepEqual([...orden(caja, c.id)].sort(), [...P.opciones].sort());
        vistos.add(P.cajas.map((c) => orden(caja, c.id).join("|")).join("·"));
      });
    }
    assert.ok(vistos.size > 1, `${P.nombre}: treinta intentos con el mismo orden`);
  });

  test(`★★★ ${P.nombre} · sin \`mezclar\` (como lo monta la Célula B), el orden de los datos`, async () => {
    reducir(true);
    await con(h(P.Base), async (caja) => {
      await abrirTodas(caja, P);
      for (const c of P.cajas) assert.deepEqual(orden(caja, c.id), P.opciones);
    });
  });
}
