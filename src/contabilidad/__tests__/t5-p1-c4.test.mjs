import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { con, reducir, montar, tocar, dormir, h, recorridoCajas } from "./t5-cuatro-comun.mjs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · P1 «Del efectivo de sobra al activo financiero» · CAPA 3 · C4
 * («toda decisión se pinta», Célula C): «Los dos cajones».
 *
 *   1. La consecuencia, pura (contabilidad/c4/t5P1_c4.js): los textos [W]
 *      de Watari letra por letra y la regla C4.
 *   2. La capa 3 (tema5/capa3C4T5.jsx → DosPaquetes → CajasQueRevelan con
 *      `c4`): cada opción mete el paquete, con su razón, en el cajón que dice,
 *      en el acto; la marca, la pista o el texto de Near, 380 ms después (sin
 *      espera con movimiento reducido); la ✕ con lo que implica, con el
 *      veredicto. Lo mal decidido se queda en su cajón equivocado.
 *   3. La vista le pasa esta capa 3 a CuatroCapas (CuatroCapas no cambia).
 *   4. Sin `c4`, CajasQueRevelan pinta exactamente lo de main (P1, P2 y
 *      T6 A1 de la Célula B): la huella del recorrido es la tomada en main.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const D = await import("../../data/contabilidadT5Pieza1.js");
const C4 = await import("../c4/t5P1_c4.js");
const { reglaC4 } = await import("./consecuencia-c.test.mjs");
const { DosPaquetesC4, EXPLORACION_C4_T5, C4_P1 } = await import("../../components/mecanicas/libros/tema5/capa3C4T5.jsx");

/* [W] pendiente de Near: el chip y la falla, tal cual los escribió Watari. */
const CHIP = {
  a: { si: "Paquete A · cumple las dos condiciones", "no-facil": "Paquete A · no se vende fácil", "no-intencion": "Paquete A · no hay intención de venderlo" },
  b: { si: "Paquete B · cumple las dos condiciones", "no-facil": "Paquete B · no se vende fácil", "no-intencion": "Paquete B · no hay intención de venderlo" },
};
const FALLA = {
  a: { "no-facil": "Así, Paquete A quedaría en «No temporal» por una razón que su descripción no sostiene.", "no-intencion": "Así, Paquete A quedaría en «No temporal» por una razón que su descripción no sostiene." },
  b: { si: "Así, Paquete B quedaría en «Temporal» por una razón que su descripción no sostiene.", "no-intencion": "Así, Paquete B quedaría en «No temporal» por una razón que su descripción no sostiene." },
};
const CAJON = { si: "temporal", "no-facil": "no-temporal", "no-intencion": "no-temporal" };

test("★★★ [W] la consecuencia de cada paquete y cada opción, letra por letra", () => {
  for (const p of D.PAQUETES) {
    for (const o of D.OPCIONES_CAPA_3) {
      const e = C4.consecuenciaP1(p.id, o.id);
      assert.equal(e.cajon, CAJON[o.id]);
      assert.equal(e.chip, CHIP[p.id][o.id]);
      assert.equal(e.falla, o.id === p.correcta ? undefined : FALLA[p.id][o.id], `${p.id} · ${o.id}`);
    }
  }
  const P = C4.CONSECUENCIA_C4;
  assert.equal(P.id, "t5-p1");
  assert.equal(P.objeto, "Los dos cajones");
  assert.equal(P.modo, "aprender");
  assert.deepEqual(reglaC4([P]), { c1: [], c2: [], c3: [], c4: [] });
  assert.ok(P.items.every((it) => (it.tipo ?? "eleccion") === "eleccion"), "ninguna cifra que escribir (C4-1 no aplica)");
});

const zona = (caja, id) => caja.querySelector(`[data-hecho="${id}"]`);
const abrir = (caja, id) => tocar(zona(caja, id).querySelector("button[aria-expanded]"));
const opcion = (caja, id, o) => zona(caja, id).querySelector(`[data-opcion="${o}"]`);
const figura = (caja) => caja.querySelector('[data-figura-c4="t5-p1"]');
const chipEn = (caja) => {
  const c = figura(caja).querySelector("[data-chip]");
  return c ? { cajon: c.closest("[data-cajon]").dataset.cajon, texto: c.textContent } : null;
};
const revela = (caja, id) => caja.querySelector(`[data-revela="${id}"]`).textContent;

for (const p of D.PAQUETES) {
  for (const o of D.OPCIONES_CAPA_3) {
    test(`★★★ ${p.nombre} · «${o.texto}»: el paquete entra al cajón en el acto; el veredicto, 380 ms después`, async () => {
      reducir(false);
      await con(h(DosPaquetesC4), async (caja) => {
        assert.ok(figura(caja), "la figura de la capa 3 es la de C4");
        assert.ok(!(chipEn(caja)), "sin tocar, ningún chip");
        await abrir(caja, p.id);
        await tocar(opcion(caja, p.id, o.id));
        /* En el acto: el chip con su razón, en su cajón. */
        assert.deepEqual(chipEn(caja), { cajon: CAJON[o.id], texto: CHIP[p.id][o.id] });
        /* Nada del veredicto todavía. */
        assert.equal(opcion(caja, p.id, o.id).dataset.marca, "", "sin marca");
        assert.equal(revela(caja, p.id), "", "sin pista, devolución ni texto");
        assert.ok(!(figura(caja).querySelector("[data-falla]")), "sin la ✕");
        assert.equal(zona(caja, p.id).dataset.decidida, "no");
        await dormir(200);
        assert.equal(revela(caja, p.id), "", "a los 200 ms, todavía nada");
        await dormir(250);
        const buena = o.id === p.correcta;
        if (buena) {
          assert.equal(zona(caja, p.id).dataset.decidida, "si");
          assert.equal(revela(caja, p.id), p.revela + p.pie, "el texto de Near, tal cual");
          assert.ok(!(figura(caja).querySelector("[data-falla]")));
          /* Lo correcto entra al registro, en el mismo cajón. */
          assert.ok(figura(caja).querySelector(`[data-cajon="${CAJON[o.id]}"] [data-entrada="${p.id}"]`));
        } else {
          assert.equal(opcion(caja, p.id, o.id).dataset.marca, "tachada");
          assert.equal(caja.querySelector(`[data-revela="${p.id}"] [data-pista]`).textContent, p.pista, "la pista de Near, tal cual");
          assert.equal(figura(caja).querySelector("[data-falla]").textContent, FALLA[p.id][o.id]);
          assert.deepEqual(chipEn(caja), { cajon: CAJON[o.id], texto: CHIP[p.id][o.id] }, "lo mal decidido se queda en su cajón");
        }
      });
    });
  }
}

test("★★★ con movimiento reducido, sin espera; dos errores: la devolución de Near, lo correcto al registro y lo malo a la vista", async () => {
  reducir(true);
  const p = D.PAQUETES.find((x) => x.id === "b");
  await con(h(DosPaquetesC4), async (caja) => {
    await abrir(caja, "b");
    await tocar(opcion(caja, "b", "si"));
    assert.equal(opcion(caja, "b", "si").dataset.marca, "tachada", "sin espera");
    assert.equal(figura(caja).querySelector("[data-falla]").textContent, FALLA.b.si);
    await tocar(opcion(caja, "b", "no-intencion"));
    assert.equal(zona(caja, "b").dataset.decidida, "si");
    assert.equal(caja.querySelector('[data-revela="b"] [data-devolucion]').textContent, p.falla["no-intencion"]);
    assert.ok(figura(caja).querySelector('[data-cajon="no-temporal"] [data-entrada="b"]'), "lo correcto, al registro");
    assert.deepEqual(chipEn(caja), { cajon: "no-temporal", texto: CHIP.b["no-intencion"] });
    assert.equal(figura(caja).querySelector("[data-falla]").textContent, FALLA.b["no-intencion"]);
    assert.equal(caja.querySelectorAll("input").length, 0, "ninguna cifra que escribir");
  });
  reducir(false);
});

test("★★★ mientras espera el veredicto, no se toca otra opción", async () => {
  reducir(false);
  await con(h(DosPaquetesC4), async (caja) => {
    await abrir(caja, "a");
    await tocar(opcion(caja, "a", "no-facil"));
    await tocar(opcion(caja, "a", "si"));
    assert.deepEqual(chipEn(caja), { cajon: "no-temporal", texto: CHIP.a["no-facil"] });
    await dormir(450);
    assert.equal(opcion(caja, "a", "si").dataset.marca, "", "el segundo toque no contó");
  });
});

test("★★★ la vista pasa esta capa 3 a CuatroCapas (y CuatroCapas no cambia)", () => {
  assert.equal(EXPLORACION_C4_T5[D.PIEZA_DEL_EFECTIVO.id], DosPaquetesC4);
  assert.equal(C4_P1.espera, 380);
  const vista = readFileSync(new URL("../../components/ContabilidadTema5View.jsx", import.meta.url), "utf8");
  assert.match(vista, /Exploracion=\{EXPLORACION_C4_T5\[pieza\.id\] \?\? Exploracion\}/);
});

/*
 * La huella del recorrido de la capa 3 de P1, P2 y T6 A1 sin C4, tomada con el código de main (efa2501e).
 * Lote 27 (Célula B, D4 de Shoko en T6 A1): la figura de T6 A1 dibuja también, como fantasma, lo que se
 * eligió por error; huella nueva, tomada con ese código. P1 y P2 no cambian.
 */
const HUELLA_MAIN_CAJAS = "de6c4264d3e6217381b8cf6028123eacce2889445a4c75d40dfcd22e926de3f2";
test("★★★ sin la prop `c4`, CajasQueRevelan pinta exactamente lo de main (P1, P2 y T6 A1, paso a paso)", async () => {
  assert.equal(await recorridoCajas(), HUELLA_MAIN_CAJAS);
});
