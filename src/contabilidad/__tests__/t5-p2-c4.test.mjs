import { test } from "node:test";
import assert from "node:assert/strict";
import { con, reducir, montar, tocar, dormir, h } from "./t5-cuatro-comun.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · P2 «Tres momentos» · CAPA 3 · C4 («toda decisión se pinta», Célula
 * C): «Las ventas y su diferencia».
 *
 *   1. La consecuencia, pura (contabilidad/c4/t5P2_c4.js): las cifras de las
 *      cajas de main, sin montos negativos; los textos [W] de Watari letra
 *      por letra; la regla C4.
 *   2. La capa 3 (tema5/capa3C4T5.jsx → DosVentas → CajasQueRevelan con
 *      `c4`): dentro de la caja, bajo sus opciones, la venta, Inversiones –
 *      títulos por el costo y la diferencia por título en la zona que dice la
 *      opción, en el acto; la marca, la pista o el texto de Near, 380 ms
 *      después; ✓ o ✕ con lo que implica, con el veredicto.
 *   (La huella de CajasQueRevelan sin `c4`, que incluye a DosVentas, está en
 *   t5-p1-c4.test.mjs.)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = await import("../../data/contabilidadT5Pieza2.js");
const C4 = await import("../c4/t5P2_c4.js");
const { reglaC4 } = await import("./consecuencia-c.test.mjs");
const { DosVentasC4, EXPLORACION_C4_T5 } = await import("../../components/mecanicas/libros/tema5/capa3C4T5.jsx");

/* [W] pendiente de Near: lo que Watari escribió para cada venta y cada opción. */
const ESPERADO = {
  "venta-a": {
    linea: "Venta A · recibe $690, costó $650", sale: "Inversiones – títulos sale por $650 cada uno.", chip: "$40 por título",
    nota: { ganancia: ["cuadra", "La diferencia queda donde corresponde."], perdida: ["falla", "Así los $40 de cada título van a pérdida."], "ni-una": ["falla", "Así los $40 de cada título no van a ninguna cuenta."] },
  },
  "venta-b": {
    linea: "Venta B · recibe $1.060, costó $1.150", sale: "Inversiones – títulos sale por $1.150 cada uno.", chip: "$90 por título",
    nota: { ganancia: ["falla", "Así los $90 de cada título van a ganancia."], perdida: ["cuadra", "La diferencia queda donde corresponde."], "ni-una": ["falla", "Así los $90 de cada título no van a ninguna cuenta."] },
  },
};

test("★★★ [W] la consecuencia: las cifras de las cajas, la diferencia sin signo y cada nota, letra por letra", () => {
  assert.deepEqual(C4.FIGURA_P2_C4.zonas, { ganancia: "Ganancia", perdida: "Pérdida", "ni-una": "Ni ganancia ni pérdida" });
  for (const v of D.VENTAS_T5_A2) {
    for (const o of D.OPCIONES_CAPA_3_T5_A2) {
      const e = C4.consecuenciaP2(v.id, o.id);
      assert.ok(e.diferencia > 0 && Number.isInteger(e.diferencia), "sin montos negativos ni fracciones");
      assert.equal(e.zona, o.id);
      const [clase, texto] = ESPERADO[v.id].nota[o.id];
      assert.equal(e[clase], texto, `${v.id} · ${o.id}`);
      assert.equal(clase === "falla", o.id !== v.correcta);
    }
  }
  const P = C4.CONSECUENCIA_C4;
  assert.equal(P.id, "t5-p2");
  assert.equal(P.objeto, "Las ventas y su diferencia");
  assert.deepEqual(reglaC4([P]), { c1: [], c2: [], c3: [], c4: [] });
  assert.ok(P.items.every((it) => (it.tipo ?? "eleccion") === "eleccion"), "ninguna cifra que escribir (C4-1 no aplica)");
});

const zona = (caja, id) => caja.querySelector(`[data-hecho="${id}"]`);
const opcion = (caja, id, o) => zona(caja, id).querySelector(`[data-opcion="${o}"]`);
const c4 = (caja, id) => caja.querySelector(`[data-c4-venta="${id}"]`);
const revela = (caja, id) => caja.querySelector(`[data-revela="${id}"]`).textContent;

for (const v of D.VENTAS_T5_A2) {
  for (const o of D.OPCIONES_CAPA_3_T5_A2) {
    test(`★★★ ${v.nombre} · «${o.texto}»: la diferencia cae en su zona en el acto; el veredicto, 380 ms después`, async () => {
      reducir(false);
      const E = ESPERADO[v.id];
      await con(h(DosVentasC4), async (caja) => {
        await tocar(zona(caja, v.id).querySelector("button[aria-expanded]"));
        assert.ok(!(c4(caja, v.id)), "abierta y sin tocar: nada");
        await tocar(opcion(caja, v.id, o.id));
        const f = c4(caja, v.id);
        assert.ok(f, "la consecuencia, dentro de la caja");
        assert.equal(f.querySelector("[data-linea-venta]").textContent, E.linea);
        assert.equal(f.querySelector("[data-linea-sale]").textContent, E.sale);
        assert.deepEqual([...f.querySelectorAll("[data-zona]")].map((z) => z.textContent),
          ["ganancia", "perdida", "ni-una"].map((z) => C4.FIGURA_P2_C4.zonas[z] + (z === o.id ? E.chip : "")));
        assert.equal(f.querySelector('[data-activa="si"]').dataset.zona, o.id);
        /* Nada del veredicto todavía. */
        assert.ok(!(f.querySelector("[data-falla], [data-cuadra]")), "sin ✓ ni ✕");
        assert.ok(!(f.querySelector(".mal")), "sin coral");
        assert.equal(opcion(caja, v.id, o.id).dataset.marca, "");
        assert.equal(revela(caja, v.id), "");
        await dormir(450);
        const [clase, texto] = E.nota[o.id];
        assert.equal(f.querySelector(`[data-${clase}]`).textContent, texto);
        if (o.id === v.correcta) {
          assert.equal(revela(caja, v.id), v.revela + v.pie, "el texto de Near, tal cual");
        } else {
          assert.equal(opcion(caja, v.id, o.id).dataset.marca, "tachada");
          assert.equal(caja.querySelector(`[data-revela="${v.id}"] [data-pista]`).textContent, D.PISTA_CAPA_3_T5_A2);
          assert.ok(f.querySelector(".t5p3c4-zona.activa.mal"), "la zona tocada, en coral con su ✕");
        }
      });
    });
  }
}

test("★★★ con movimiento reducido, sin espera; cada caja guarda su consecuencia", async () => {
  reducir(true);
  await con(h(DosVentasC4), async (caja) => {
    for (const v of D.VENTAS_T5_A2) {
      await tocar(zona(caja, v.id).querySelector("button[aria-expanded]"));
      await tocar(opcion(caja, v.id, v.correcta));
      assert.equal(zona(caja, v.id).dataset.decidida, "si");
    }
    assert.equal(c4(caja, "venta-a").querySelector("[data-cuadra]").textContent, "La diferencia queda donde corresponde.");
    assert.equal(c4(caja, "venta-b").querySelector("[data-chip]").textContent, "$90 por título");
    assert.equal(caja.querySelector("[data-final]").textContent, D.FINAL_CAPA_3_T5_A2.texto + D.FINAL_CAPA_3_T5_A2.pie);
    assert.equal(caja.querySelectorAll("input").length, 0);
  });
  reducir(false);
});

test("★★★ la vista pasa esta capa 3 a CuatroCapas", () => {
  assert.equal(EXPLORACION_C4_T5[D.PIEZA_TRES_MOMENTOS.id], DosVentasC4);
});
