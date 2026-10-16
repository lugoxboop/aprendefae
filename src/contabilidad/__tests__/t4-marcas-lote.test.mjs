import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · EL LOTE VISUAL DEL PROMPT MAESTRO (bloque P2 de Hanayama, 16 oct).
 *
 * Que T4 se lea como UN solo producto, el de «¿Entra o sale de Caja?»:
 *   · ningún ✓ ni ✗ de texto dentro de una pieza: las marcas y los mensajes
 *     llevan Check y X de lucide (§9)
 *   · ninguna pastilla dice otra cosa que «Correcto», «No va aquí», «Iba aquí»
 *     o «Iba aquí: {valor}» (§10.1), y la de acierto lleva Check y la de error X
 *   · el «Seguir» de Aprender es el secundario neutro de CuatroCapas (#B8C4D4,
 *     texto navy); el avance y «Comprobar» de los Hacer, el Responder teal
 *     (#2A9D8F, texto #06202A). Un botón blanco no pasa
 *
 * Se recorre todo lo que juega la sonda: cada pantalla de A0-A5 con su plan
 * (enganche_planes.json) y cada Hacer con su clave (enganche_clave.mjs), bien
 * y mal, y se mira cada estado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { w, h, montar, tocar, esperar, movimientoReducido } = await import("./t4-dom.mjs");
const { PIEZAS_T4, PantallasT4, SeMueveLaCajaMenor, ElArqueo, ConciliaLaCuenta, SeAsientaONo, EntraOSaleDeCaja } = await import("../../components/ContabilidadT4View.jsx");
const { PLANES } = await import("./t4-aprender-rd.mjs");
const { MARCA } = await import("../../data/contabilidadT4.js");
const { ESPERA_ERROR_MS } = await import("../../data/contabilidadT4Hacer.js");
const H1 = await import("../../data/contabilidadT4H1.js");
const H3 = await import("../../data/contabilidadT4H3.js");
const H4 = await import("../../data/contabilidadT4H4.js");
const H7 = await import("../../data/contabilidadT4H7.js");
const H8 = await import("../../data/contabilidadT4H8.js");

const CLAVE = JSON.parse(execFileSync(process.execPath, [fileURLToPath(new URL("../../../scripts/t4/sonda-enganche/enganche_clave.mjs", import.meta.url))], { encoding: "utf8" }));
const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

/* ═══════════ LO QUE SE MIRA EN CADA ESTADO ═══════════ */

const LITERAL = (t) => t === MARCA.bien || t === MARCA.mal || t === MARCA.era || t.startsWith(`${MARCA.era}: `);
export function defectos(raiz, { aprender }) {
  const d = [];
  /* 1 · ningún glifo de texto */
  const recorrer = (n) => {
    if (n.nodeType === 3) {
      if (/[✓✗✔✘]/u.test(n.textContent)) d.push(`glifo de texto «${norm(n.textContent).slice(0, 40)}»`);
      /* §2: la revelación dice «Iba aquí», no «era» ni «con el cheque correcto» (FALLA de Shibukawa en 35348c3, H4). */
      if (/^\s*era(?![\p{L}])/iu.test(n.textContent) || /^\s*con el cheque correcto/iu.test(n.textContent)) d.push(`rótulo de revelación «${norm(n.textContent).slice(0, 40)}»`);
      return;
    }
    if (n.nodeType === 1 && n.matches("style, script")) return;
    for (const c of n.childNodes) recorrer(c);
  };
  recorrer(raiz);
  /* 2 · cada pastilla: un literal, y su ícono */
  for (const p of raiz.querySelectorAll(".t4r-marca")) {
    const t = norm(p.textContent);
    if (!LITERAL(t)) d.push(`pastilla «${t}»`);
    const m = p.dataset.marca;
    if (m === "bien" && !p.querySelector('svg[data-icono="check"]')) d.push("«Correcto» sin el Check de lucide");
    if (m === "mal" && !p.querySelector('svg[data-icono="x"]')) d.push("«No va aquí» sin la X de lucide");
    if (m === "era" && p.querySelector("svg")) d.push("«Iba aquí» con ícono");
  }
  /* 3 · el mensaje, con su ícono */
  for (const msg of raiz.querySelectorAll("[data-mensaje]")) {
    const ic = msg.dataset.mensaje === "acierto" ? "check" : "x";
    if (!msg.querySelector(`:scope > svg[data-icono="${ic}"]`)) d.push(`mensaje de ${msg.dataset.mensaje} sin su ícono de lucide`);
    if (msg.dataset.mensaje === "error" && w.getComputedStyle(msg).backgroundColor !== "rgba(184, 196, 212, 0.12)") d.push(`mensaje de error con fondo ${w.getComputedStyle(msg).backgroundColor}`);
  }
  /* 3b · la tarjeta, en reposo, con el borde del §4.1: 1 px rgba(248,249,250,.35), igual en los cinco Hacer */
  for (const t of raiz.querySelectorAll(".t4cv-origen[data-tarjeta], .t4h3-op, .t4h4-t, .t4h7-t, .t4h8-t")) {
    const c = w.getComputedStyle(t);
    const borde = `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`;
    if (borde !== "1px solid rgba(248, 249, 250, 0.35)") d.push(`tarjeta ${t.className.split(" ")[0]} con borde ${borde}`);
  }
  /* 4 · los botones */
  const fondo = (b) => w.getComputedStyle(b).backgroundColor;
  if (aprender) {
    for (const b of raiz.querySelectorAll('[data-boton="seguir"]')) {
      if (fondo(b) !== "rgb(184, 196, 212)" || w.getComputedStyle(b).color !== "rgb(29, 53, 87)") d.push(`«Seguir» en ${fondo(b)} / ${w.getComputedStyle(b).color}`);
    }
  }
  for (const env of raiz.querySelectorAll('[data-boton="seguir-hacer"], [data-boton="comprobar"]')) {
    const b = env.matches("button") ? env : env.querySelector("button");
    if (!env.matches("[data-avance-t4]") || !b || fondo(b) !== "rgb(42, 157, 143)" || w.getComputedStyle(b).color !== "rgb(6, 32, 42)") d.push(`«${norm(env.textContent)}» no es el Responder teal (${b ? fondo(b) : "sin botón"})`);
  }
  return [...new Set(d)];
}

/* ═══════════ APRENDER: CADA PANTALLA, CON SU PLAN ═══════════ */

const piezas = PIEZAS_T4.map((x) => x.pieza);
for (const P of piezas) {
  test(`★★★ ${P.titulo}: en cada pantalla y tras cada toque del plan, sin glifos de texto, pastillas con su literal y su ícono, y «Seguir» en el neutro de CuatroCapas`, async () => {
    const malas = [];
    let mirados = 0;
    /* Una sola partida, de la primera pantalla a la última: el plan de cada una (los toques y las esperas) y «Seguir». */
    const antes = movimientoReducido(true);
    const m = montar(h(PantallasT4, { pieza: P, rotulo: "T4 · APRENDER" }));
    try {
      const raiz = () => m.caja.querySelector("[data-pieza]");
      for (const p of P.pantallas) {
        assert.equal(raiz().dataset.pantalla, p.id, `${P.id}: se esperaba la pantalla ${p.id}`);
        malas.push(...defectos(raiz(), { aprender: true }).map((x) => `${p.id} · al llegar: ${x}`));
        mirados++;
        for (const [k, paso] of (PLANES[P.id]?.[p.id] ?? []).entries()) {
          if (paso.arrastra) continue; /* lo que se arrastra lo mide Chromium */
          if (paso.click) {
            const el = raiz().querySelector(paso.click);
            assert.ok(el, `${p.id}: el plan toca ${paso.click} y no está`);
            tocar(el);
          }
          await esperar(paso.click ? 0 : Math.min(paso.espera ?? 0, 2000));
          malas.push(...defectos(raiz(), { aprender: true }).map((x) => `${p.id} · paso ${k + 1}: ${x}`));
          mirados++;
        }
        const seguir = raiz().querySelector('[data-boton="seguir"]');
        if (!seguir) break;
        tocar(seguir);
        await esperar(0);
      }
    } finally { m.desmontar(); movimientoReducido(antes); }
    assert.ok(mirados >= P.pantallas.length, "la prueba no recorrió las pantallas");
    assert.deepEqual(malas, []);
  });
}

/* ═══════════ HACER: CADA TARJETA, BIEN Y MAL, CON LA CLAVE DE LA SONDA ═══════════ */

const Marco = ({ children }) => h("section", null, children);
const HACER = [
  { s: "H1", raiz: "[data-t4-h1]", C: EntraOSaleDeCaja, items: H1.ITEMS_H1 },
  { s: "H3", raiz: "[data-t4-h3]", C: SeMueveLaCajaMenor, items: H3.SERIES_H3[0] },
  { s: "H4", raiz: "[data-t4-h4]", C: ElArqueo, items: H4.PARES_H4.map((par) => H4.RONDAS_H4.find((r) => r.id === par[0])) },
  { s: "H7", raiz: "[data-t4-h7]", C: ConciliaLaCuenta, items: { serie: H7.SERIES_H7[0], partidas: H7.SERIES_H7[0].partidas } },
  { s: "H8", raiz: "[data-t4-h8]", C: SeAsientaONo, items: { serie: H8.SERIES_H8[0], partidas: H8.SERIES_H8[0].partidas } },
];
const selectorDe = (g) => (g.toques ?? [g.destino != null ? `[data-destino="${g.destino}"]` : `[data-opcion="${g.opcion}"]`]);
const escribir = (input, v) => {
  const set = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
  set.call(input, String(v));
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
};

const lineales = new Set();
for (const { s, raiz: R, C, items } of HACER) {
  for (const modo of ["bien", "mal"]) {
    test(`★★★ ${s} (${modo === "bien" ? "acertando" : "fallando"}): en cada tarjeta, sin glifos de texto, pastillas con su literal y su ícono, y el avance y «Comprobar» en el Responder teal`, async () => {
      const K = CLAVE[s];
      const malas = [];
      let mirados = 0;
      const antes = movimientoReducido(true);
      const m = montar(h(C, { Marco, items, onCompletar: () => {} }));
      try {
        for (let vuelta = 0; vuelta < 60; vuelta++) {
          const raiz = m.caja.querySelector(R);
          if (!raiz || raiz.hasAttribute("data-fin")) break;
          const etapa = raiz.dataset.etapa ?? raiz.dataset.fase ?? "";
          malas.push(...defectos(raiz, { aprender: false }).map((x) => `tarjeta ${mirados + 1} al llegar: ${x}`));
          const campos = [...raiz.querySelectorAll("[data-campo] input")];
          if (campos.length) {
            const c = K.saldos[raiz.dataset.serie][modo].campos;
            for (const input of campos) await w.Promise.resolve(tocar(input)), escribir(input, c[input.closest("[data-campo]").dataset.campo]);
            await esperar(0);
            tocar(raiz.querySelector('[data-boton="comprobar"]'));
          } else {
            let carta = norm(raiz.querySelector(K.tarjeta).textContent);
            if (K.subtarjeta) carta = `${carta}::${raiz.querySelector(K.subtarjeta).dataset.tarjetaPregunta}`;
            if (K.porEtapa) carta = `${etapa}::${carta}`;
            const g = K.items[carta]?.[modo];
            assert.ok(g, `${s}: la clave no reconoce «${carta}»`);
            for (const x of selectorDe(g)) { tocar(raiz.querySelector(x)); await esperar(0); }
            if (g.comprobar) tocar(raiz.querySelector('[data-boton="comprobar"]'));
          }
          await esperar(modo === "mal" ? ESPERA_ERROR_MS + 600 : 20);
          const r2 = m.caja.querySelector(R);
          malas.push(...defectos(r2, { aprender: false }).map((x) => `tarjeta ${mirados + 1} tras responder: ${x}`));
          /* Plan B: el tablero lado a lado lleva una línea por mitad marcada, con su pastilla. */
          for (const t of r2.querySelectorAll('[data-tablero][data-apilado="no"]')) {
            lineales.add(s);
            const marcadas = [...t.querySelectorAll(".t4tb-mitad[data-marca]")].map((x) => x.dataset.destino).sort();
            const lineas = [...t.querySelectorAll("[data-marca-de]")].map((x) => x.dataset.marcaDe).sort();
            if (JSON.stringify(marcadas) !== JSON.stringify(lineas)) malas.push(`tarjeta ${mirados + 1}: mitades marcadas ${marcadas} y líneas ${lineas}`);
            for (const x of t.querySelectorAll("[data-marca-de]")) if (!x.querySelector('.t4r-marca[data-marca="era"], .t4r-marca svg[data-icono]')) malas.push(`tarjeta ${mirados + 1}: la línea ${x.dataset.marcaDe} sin pastilla con ícono`);
            if (t.querySelector(".t4tb-mitad .t4r-marca")) malas.push(`tarjeta ${mirados + 1}: el tablero lado a lado trae pastillas dentro de las mitades`);
          }
          mirados++;
          if (campos.length) break;
          const sig = r2.querySelector('[data-boton="seguir-hacer"]');
          if (!sig) break;
          tocar(sig);
          await esperar(0);
        }
      } finally { m.desmontar(); movimientoReducido(antes); }
      assert.ok(mirados >= 4, `${s}: solo ${mirados} tarjetas`);
      /* H4 pregunta 4 y H8 etapa 2 van lado a lado (plan B de la medición en 320×568). */
      assert.equal(lineales.has(s), s === "H4" || s === "H8", `${s}: tablero lado a lado ${lineales.has(s) ? "sí" : "no"}`);
      assert.deepEqual([...new Set(malas)], []);
    });
  }
}

/* ═══════════ EL DETECTOR CAZA LO VIEJO ═══════════ */

test("★★ el detector da en rojo lo de antes: un ✓ de texto, «Bien», un botón blanco y el mensaje de error con tinte coral", () => {
  const caja = document.createElement("div");
  caja.innerHTML = `
    <span class="t4r-marca" data-marca="bien"><span>✓</span><span>Bien</span></span>
    <div data-mensaje="error" style="background: rgba(231, 111, 81, 0.13)"><span>✗</span><p>Error</p></div>
    <div data-boton="seguir-hacer"><button style="background: rgb(248, 249, 250); color: rgb(14, 27, 46)">Siguiente</button></div>`;
  document.body.appendChild(caja);
  try {
    const d = defectos(caja, { aprender: false }).join(" | ");
    for (const x of ["glifo de texto", "pastilla «✓Bien»", "sin el Check de lucide", "mensaje de error sin su ícono", "con fondo rgba(231, 111, 81, 0.13)", "no es el Responder teal"]) assert.ok(d.includes(x), `no cazó: ${x} (${d})`);
  } finally { caja.remove(); }
});
