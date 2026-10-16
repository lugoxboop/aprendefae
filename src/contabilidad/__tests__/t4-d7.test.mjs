import { test } from "node:test";
import assert from "node:assert/strict";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · D7, «NADA GRIS Y MUERTO» (veredicto de Shibukawa sobre el #308).
 *
 * Un botón de acción que se usa una vez (pagar el siguiente gasto, contar la
 * caja, consignar, girar, llega el extracto, asentar) se oculta tras usarse y
 * guarda su sitio, como «Cobrar» en A1 (`t4cv-oculto`). Uno de límite, que
 * vuelve a servir («Reponer», «Pagar» en el tope, «Subir», «Bajar»), puede
 * quedar apagado, pero dice al lado por qué, y su aria-describedby apunta a
 * esa razón visible. «Pasar el año» de A0 no se apaga nunca: con filas sin
 * marcar, avisa.
 *
 * La regla, por lotes: en ningún estado de ninguna pieza de T4 queda a la
 * vista un botón con aria-disabled (o disabled, si es de acción) sin una
 * razón visible en su aria-describedby. Se recorre cada pantalla de A0-A5
 * con el plan de la sonda, y se mira tras cada toque. Con el #308 en ac1986e,
 * sale roja en A2, A3, A4 y A5 (y en A0, por «Pasar el año»).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { w, h, montar, tocar, esperar, movimientoReducido } = await import("./t4-dom.mjs");
const { PIEZAS_T4, PantallasT4 } = await import("../../components/ContabilidadT4View.jsx");
const { PLANES } = await import("./t4-aprender-rd.mjs");

const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const visible = (el, raiz) => {
  for (let x = el; x && x !== raiz.parentElement; x = x.parentElement) {
    const c = w.getComputedStyle(x);
    if (x.hidden || c.display === "none" || c.visibility === "hidden") return false;
  }
  return true;
};

/* Los botones grises y muertos: apagados, a la vista y sin una razón visible que los explique. */
export function muertos(raiz) {
  const d = [];
  for (const b of raiz.querySelectorAll('button[aria-disabled="true"], button[data-accion]:disabled')) {
    if (!visible(b, raiz)) continue;
    const ids = (b.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    const razon = ids.map((id) => raiz.ownerDocument.getElementById(id)).filter((x) => x && visible(x, raiz) && norm(x.textContent));
    if (!razon.length) d.push(`«${norm(b.textContent)}» (${b.dataset.accion ?? "botón"}) queda gris y sin razón visible`);
  }
  return d;
}

for (const { pieza: P } of PIEZAS_T4) {
  test(`★★★ D7 · ${P.titulo}: tras cada toque, ningún botón queda gris y muerto (los de un solo uso se ocultan; los de límite dicen por qué)`, async () => {
    const malas = [];
    const antes = movimientoReducido(true);
    const m = montar(h(PantallasT4, { pieza: P, rotulo: "T4 · APRENDER" }));
    try {
      const raiz = () => m.caja.querySelector("[data-pieza]");
      for (const p of P.pantallas) {
        assert.equal(raiz().dataset.pantalla, p.id);
        malas.push(...muertos(raiz()).map((x) => `${p.id} · al llegar: ${x}`));
        for (const [k, paso] of (PLANES[P.id]?.[p.id] ?? []).entries()) {
          if (paso.arrastra) continue;
          if (paso.click) tocar(raiz().querySelector(paso.click));
          await esperar(paso.click ? 0 : Math.min(paso.espera ?? 0, 2000));
          malas.push(...muertos(raiz()).map((x) => `${p.id} · paso ${k + 1}: ${x}`));
        }
        const seguir = raiz().querySelector('[data-boton="seguir"]');
        if (!seguir) break;
        tocar(seguir);
        await esperar(0);
      }
    } finally { m.desmontar(); movimientoReducido(antes); }
    assert.deepEqual([...new Set(malas)], []);
  });
}

test("★★★ D7 · A0 P3: «Pasar el año» no se apaga; con filas sin marcar avisa, y el aviso se va al marcar la que faltaba", async () => {
  const P = PIEZAS_T4.find((x) => x.pieza.id === "t4-a0-el-activo-corriente").pieza;
  const antes = movimientoReducido(true);
  const m = montar(h(PantallasT4, { pieza: P, rotulo: "T4 · APRENDER" }));
  try {
    const raiz = () => m.caja.querySelector("[data-pieza]");
    for (let i = 0; i < 10 && raiz().dataset.pantalla !== "cual-cruza"; i++) {
      for (const paso of PLANES[P.id]?.[raiz().dataset.pantalla] ?? []) { if (paso.click) tocar(raiz().querySelector(paso.click)); await esperar(paso.click ? 0 : 50); }
      tocar(raiz().querySelector('[data-boton="seguir"]'));
      await esperar(0);
    }
    const pasar = () => raiz().querySelector("[data-accion=pasar]");
    assert.equal(pasar().getAttribute("aria-disabled"), null);
    tocar(raiz().querySelector("[data-fila=mercancia] [data-seg=antes]"));
    tocar(pasar());
    await esperar(0);
    const { FIGURA_ANO } = await import("../../data/contabilidadT4A0.js");
    assert.equal(norm(raiz().querySelector("[data-aviso]").textContent), FIGURA_ANO.aviso);
    assert.equal(raiz().querySelector("[data-mensaje]"), null, "el aviso no es una devolución");
    tocar(raiz().querySelector("[data-fila=deuda] [data-seg=despues]"));
    tocar(raiz().querySelector("[data-fila=edificio] [data-seg=despues]"));
    await esperar(0);
    assert.equal(norm(raiz().querySelector("[data-aviso]").textContent), "", "el aviso sigue tras marcar las tres filas");
  } finally { m.desmontar(); movimientoReducido(antes); }
});

test("★★ el detector da en rojo un botón gris sin razón, y en verde el oculto y el de límite con su razón", () => {
  const caja = document.createElement("div");
  caja.innerHTML = `<style>.t4r-oculto{visibility:hidden}</style>
    <button data-accion="contar" aria-disabled="true">Contar la caja</button>
    <button class="t4r-oculto" data-accion="asentar">Asentar</button>
    <button data-accion="subir" aria-disabled="true" aria-describedby="r1">Subir</button><p id="r1">Tope: 600.000</p>`;
  document.body.appendChild(caja);
  try {
    assert.deepEqual(muertos(caja), ["«Contar la caja» (contar) queda gris y sin razón visible"]);
  } finally { caja.remove(); }
});
