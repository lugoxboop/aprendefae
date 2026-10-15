/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CAPA 3 DE LAS SIETE DE APRENDER · DECIDIR ANTES DE REVELAR, EN CHROMIUM
 * (hoja 6 de Mai)
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/b5/medir-b5-capa3.mjs
 *
 * A 320×568 y 375×667, con y sin movimiento reducido, en cada pieza: abre cada
 * caja, mide la caja abierta, decide con el error de devolución más larga y
 * mide la caja decidida y el tramo de las opciones al final de la devolución.
 * Comprueba (§9 de la hoja):
 *   1 · el nombre no cambia de alto al abrir (el chevrón gira, no se va);
 *   2 · la correcta no cambia de alto al marcarse;
 *   3 · en fila, ninguna opción se parte (un renglón);
 *   4 · el tramo de las opciones al final de la devolución cabe en 496 (568 − 56 de cabecera);
 *   · y que la página no tenga barra horizontal.
 * Al final, la capa 3 entera con todo bien y con todo con error.
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del repo).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const PIEZAS = (process.env.PIEZAS ?? "t5a1,t5a2,t6a1,t6a2,t6a3,t6a4,t6a5").split(",");
const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/b5/harness-capa3/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const informe = [];
const r2 = (x) => Math.round(x * 100) / 100;

/* En la página: medidas de una caja. */
const medirCaja = (id) => {
  const capa = document.querySelector('[data-capa="3"]');
  const zona = capa.querySelector(`[data-hecho="${id}"]`);
  const titulo = zona.querySelector("button[aria-expanded] > span, button[aria-expanded] > span > span");
  const opciones = [...zona.querySelectorAll("[data-opcion]")];
  const grupo = zona.querySelector("[role='group']");
  const dev = zona.querySelector("[data-devolucion]");
  const linea = (b) => Number.parseFloat(getComputedStyle(b).lineHeight);
  return {
    alto: zona.getBoundingClientRect().height,
    titulo: titulo?.getBoundingClientRect().height ?? 0,
    forma: grupo?.dataset.opciones ?? null,
    renglones: opciones.map((b) => {
      const cs = getComputedStyle(b);
      const interior = b.getBoundingClientRect().height - Number.parseFloat(cs.paddingTop) - Number.parseFloat(cs.paddingBottom) - Number.parseFloat(cs.borderTopWidth) - Number.parseFloat(cs.borderBottomWidth);
      return Math.round(b.scrollHeight > 0 ? Math.max(1, Math.round((b.querySelector("*") ? interior : interior) / linea(b))) : 0);
    }),
    altos: Object.fromEntries(opciones.map((b) => [b.dataset.opcion, b.getBoundingClientRect().height])),
    tramo: grupo && dev ? dev.getBoundingClientRect().bottom - grupo.getBoundingClientRect().top : null,
    horizontal: document.documentElement.scrollWidth > window.innerWidth + 0.5,
  };
};

async function recorrer(pieza, ancho, alto, reducido, conError) {
  const p = await navegador.newPage({ viewport: { width: ancho, height: alto }, reducedMotion: reducido ? "reduce" : "no-preference" });
  await p.goto(`${BASE}#${pieza}`);
  await p.waitForSelector('[data-capa="3"] [data-hecho]');
  await p.evaluate(() => document.fonts.ready);
  const filas = [];
  for (let vuelta = 0; vuelta < 12; vuelta++) {
    /* La siguiente caja sin decidir (en T6 · A3 aparece al decidir la anterior). */
    const id = await p.evaluate(() => [...document.querySelectorAll('[data-capa="3"] [data-hecho]')].find((z) => !z.querySelector("[aria-pressed='true']"))?.dataset.hecho ?? null);
    if (!id) break;
    const cerrada = await p.evaluate(medirCaja, id);
    await p.click(`[data-capa="3"] [data-hecho="${id}"] button[aria-expanded]`);
    await p.waitForTimeout(reducido ? 20 : 320);
    const abierta = await p.evaluate(medirCaja, id);
    /* Con error: la opción de devolución más larga; si no, la correcta (la que no tacha nada). */
    const opcion = await p.evaluate(({ id, conError }) => {
      const zona = document.querySelector(`[data-capa="3"] [data-hecho="${id}"]`);
      const ids = [...zona.querySelectorAll("[data-opcion]")].map((b) => b.dataset.opcion);
      return { ids, conError };
    }, { id, conError });
    let elegida = null;
    if (conError) {
      /* Prueba cada opción en una copia de la página para hallar la devolución más larga sería caro: se elige por el dato. */
      elegida = await p.evaluate((id) => window.__masLarga?.[id] ?? null, id);
    }
    const ids = opcion.ids;
    const correcta = await p.evaluate((id) => window.__correcta?.[id] ?? null, id);
    elegida = elegida ?? (conError ? ids.find((x) => x !== correcta) : correcta);
    await p.click(`[data-capa="3"] [data-hecho="${id}"] [data-opcion="${elegida}"]`);
    await p.waitForTimeout(reducido ? 20 : 320);
    const decidida = await p.evaluate(medirCaja, id);
    const tag = `${pieza} · ${ancho}${reducido ? " · reducido" : ""} · ${id}`;
    if (Math.abs(abierta.titulo - cerrada.titulo) > 0.5) fallos.push(`${tag}: el nombre cambia de alto al abrir (${r2(cerrada.titulo)} → ${r2(abierta.titulo)})`);
    if (Math.abs(decidida.altos[correcta] - abierta.altos[correcta]) > 0.5) fallos.push(`${tag}: la correcta cambia de alto (${r2(abierta.altos[correcta])} → ${r2(decidida.altos[correcta])})`);
    if (abierta.forma === "fila" && abierta.renglones.some((n) => n > 1)) fallos.push(`${tag}: una opción de la fila se parte (${abierta.renglones.join(" · ")} renglones)`);
    if (decidida.tramo !== null && decidida.tramo > 496) fallos.push(`${tag}: de las opciones al final de la devolución, ${r2(decidida.tramo)} > 496`);
    if (abierta.horizontal || decidida.horizontal) fallos.push(`${tag}: barra horizontal`);
    filas.push({ id, abierta: abierta.alto, decidida: decidida.alto, tramo: decidida.tramo, forma: abierta.forma, renglones: Math.max(...abierta.renglones) });
  }
  const capa = await p.evaluate(() => document.querySelector('[data-capa="3"]').getBoundingClientRect().height);
  await p.close();
  return { filas, capa };
}

/* Las correctas y las devoluciones más largas, del dato (el banco no sabe de respuestas). */
const D = {
  t5a1: await import("../../src/data/contabilidadT5Pieza1.js"), t5a2: await import("../../src/data/contabilidadT5Pieza2.js"),
  t6a1: await import("../../src/data/contabilidadT6Pieza1.js"), t6a2: await import("../../src/data/contabilidadT6Pieza2.js"),
  t6a3: await import("../../src/data/contabilidadT6Pieza3.js"), t6a4: await import("../../src/data/contabilidadT6Pieza4.js"),
  t6a5: await import("../../src/data/contabilidadT6Pieza5.js"),
};
const cajasDe = {
  t5a1: (m) => m.PAQUETES, t5a2: (m) => m.VENTAS_T5_A2.map((v) => ({ ...v, falla: m.FALLA_CAPA_3_T5_A2 })), t6a1: (m) => m.HECHOS_T6,
  t6a2: (m) => m.METODOS_T6_A2, t6a3: (m) => m.MOMENTOS_T6_A3, t6a4: (m) => m.CASOS_T6_A4, t6a5: (m) => m.GRUPOS_T6_A5,
};
const opcionesDe = { t5a1: (m) => m.OPCIONES_CAPA_3, t5a2: (m) => m.OPCIONES_CAPA_3_T5_A2, t6a1: (m) => m.OPCIONES_CAPA_3_T6, t6a2: (m) => m.OPCIONES_CAPA_3_T6_A2, t6a4: (m) => m.OPCIONES_CAPA_3_T6_A4 };

for (const pieza of PIEZAS) {
  const cajas = cajasDe[pieza](D[pieza]);
  const correcta = Object.fromEntries(cajas.map((c) => [c.id, c.correcta]));
  const masLarga = Object.fromEntries(cajas.map((c) => {
    const ops = (c.opciones ?? opcionesDe[pieza](D[pieza])).map((o) => o.id).filter((o) => o !== c.correcta);
    const largo = (o) => (typeof c.falla === "string" ? c.falla : c.falla[o]).length;
    return [c.id, ops.sort((a, b) => largo(b) - largo(a))[0]];
  }));
  await navegador.contexts().forEach(() => {});
  const fila = [];
  for (const [ancho, alto] of [[320, 568], [375, 667]]) {
    for (const reducido of [false, true]) {
      const init = `window.__correcta = ${JSON.stringify(correcta)}; window.__masLarga = ${JSON.stringify(masLarga)};`;
      const ctx = await navegador.newContext();
      await ctx.addInitScript(init);
      const viejo = navegador.newPage.bind(navegador);
      navegador.newPage = (o) => ctx.newPage(o).then(async (pg) => { if (o?.viewport) await pg.setViewportSize(o.viewport); if (o?.reducedMotion) await pg.emulateMedia({ reducedMotion: o.reducedMotion }); return pg; });
      const conError = await recorrer(pieza, ancho, alto, reducido, true);
      const bien = reducido ? null : await recorrer(pieza, ancho, alto, reducido, false);
      navegador.newPage = viejo;
      await ctx.close();
      if (!reducido) fila.push({ ancho, conError, bien });
    }
  }
  const [a, b] = fila;
  const max = (r, k) => r2(Math.max(...r.filas.map((f) => f[k] ?? 0)));
  informe.push(`${pieza}: ${a.conError.filas[0].forma}, hasta ${max(a.conError, "renglones")} renglón(es) por opción a 320`
    + ` · abierta máx ${max(a.bien, "abierta")} · ${max(b.bien, "abierta")}`
    + ` · decidida con error máx ${max(a.conError, "decidida")} · ${max(b.conError, "decidida")}`
    + ` · tramo máx ${max(a.conError, "tramo")} · ${max(b.conError, "tramo")}`
    + ` · capa 3 entera a 320, bien ${r2(a.bien.capa)} · con error ${r2(a.conError.capa)}`);
}

await navegador.close();
await servidor.close();
console.log(informe.join("\n"));
if (fallos.length) { console.error(`\nFALLA:\n${fallos.slice(0, 40).join("\n")}`); process.exit(1); }
console.log("\nTodo en orden.");
