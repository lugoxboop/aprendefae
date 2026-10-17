/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE A5 «IMPORTADOS Y FLETES» (PATRÓN C3, motor aprenderC3.jsx) A 375 Y 320?
 *
 *   node scripts/t7/medir-t7-1-a5.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T7-1 montada tal cual con la hoja de estilos
 * del sitio. Juega A5 entera —en cada pregunta falla con cada opción
 * equivocada y acierta; «Pasar a pesos»; el viaje de la compra (C1) en sus
 * dos pasos; Santa Martha y La Popa en el lado a lado— y en cada estado,
 * con las animaciones ya terminadas, comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada botón visible de la pieza mida 44 px de alto o más, y que
 *     ningún texto visible baje de 12 px (la cejilla del motor, aparte, como
 *     en el patrón de Watari)
 *   · en el lado a lado, que la ficha del flete quede dentro de su columna
 *   · con movimiento reducido, que nada de la pieza tenga animaciones
 *
 * Sale con código 1 si algo falla. Playwright de la máquina (o
 * PLAYWRIGHT_MODULE); Chromium en CHROMIUM_PATH; Inter y Sora servidas desde
 * disco (FUENTES, por defecto /tmp/claude-0/fuentes) con `route`.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const ANCHOS = [375, 320];
const A5 = '[data-pieza="t7-1-a5-importados-y-fletes"]';

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}`;
const URL_BANCO = `${BASE}/scripts/t7/harness/index.html`;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes/";
const css = readFileSync(resolve(FUENTES, "fuentes.css"), "utf8");
async function pagina(opciones) {
  const ctx = await navegador.newContext(opciones);
  await ctx.route("**/*", (ruta) => {
    const u = ruta.request().url();
    if (u.startsWith(BASE)) return ruta.continue();
    if (u.startsWith("https://fonts.googleapis.com/")) return ruta.fulfill({ status: 200, contentType: "text/css", body: css });
    if (u.startsWith("https://fonts.gstatic.com/")) {
      try { return ruta.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(FUENTES, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return ruta.abort(); }
    }
    return ruta.abort();
  });
  return ctx.newPage();
}
const fallos = [];
const filas = [];

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  /* Lo que es solo para el lector de pantalla (1 px, recortado) no se mide. */
  const soloLector = (el) => { for (let e = el; e && e !== panel; e = e.parentElement) { const c = getComputedStyle(e); if (c.position === "absolute" && (c.width === "1px" || /rect\(0/.test(c.clip))) return true; } return false; };
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script") && !soloLector(el))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; };
  for (const el of conTexto) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  let botonMinimo = Infinity, letraMinima = Infinity;
  for (const b of pieza.querySelectorAll("button")) {
    if (!visible(b)) continue;
    const h = b.getBoundingClientRect().height;
    botonMinimo = Math.min(botonMinimo, h);
    if (h < 44) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  for (const el of conTexto) {
    if (!pieza.contains(el) || !visible(el) || el.matches(".c3-cejilla")) continue;
    const px = parseFloat(getComputedStyle(el).fontSize);
    letraMinima = Math.min(letraMinima, px);
    if (px < 12) problemas.push(`${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 30)}»: letra de ${px} px`);
  }
  /* Lado a lado: la ficha del flete dentro de su columna (la cruza con transform). */
  const tile = pieza.querySelector(".c3-cruce .c3-tile");
  if (tile) {
    const c = pieza.querySelector(".c3-cruce").getBoundingClientRect(), t = tile.getBoundingClientRect();
    if (t.right > c.right + 0.5 || t.left < c.left - 0.5) problemas.push(`la ficha del flete se sale del cruce (${t.left.toFixed(1)}–${t.right.toFixed(1)} en ${c.left.toFixed(1)}–${c.right.toFixed(1)})`);
  }
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 13px Sora"),
    botonMinimo: Math.round(botonMinimo * 10) / 10,
    letraMinima,
  };
}

const correctas = { importados: "aranceles", "flete-del-comprador": "compras-fletes", "flete-del-vendedor": "gasto-de-venta", "lado-a-lado": "quien-lo-asume" };
const quieto = () => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => null)));

for (const ancho of ANCHOS) {
  const pg = await pagina({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(A5);
  await pg.evaluate(() => document.fonts.ready);
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    await pg.evaluate(quieto);
    const m = await pg.evaluate(medir, A5);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) {
      const el = await pg.$(A5);
      const panel = await el.evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `a5-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const en = (sel) => `${A5} ${sel}`;
  const clic = (sel) => pg.click(en(sel));
  const seguir = () => pg.click(`${A5} > .c3-seguir`);
  const pantalla = () => pg.getAttribute(A5, "data-pantalla");

  for (let vuelta = 0; vuelta < 8; vuelta++) {
    const id = await pantalla();
    await estado(`${id}`);
    if (id === "la-regla-del-costo") { await clic('[data-accion="pesos"]'); await estado(`${id}-en-pesos`); }
    if (id === "fob-cif-cyf") {
      for (const f of ["puerto", "flete", "seguro", "bodega"]) await clic(`[data-ficha="${f}"]`);
      await clic('[data-boton="comprobar"]');
      await estado(`${id}-fob-retro`);
      await clic('[data-ficha="puerto"]'); await clic('[data-boton="comprobar"]');
      await estado(`${id}-fob-acierto`);
      await clic('[data-boton="seguir-paso"]');
      await estado(`${id}-cyf`);
      await clic('[data-op="medias"]');
      await estado(`${id}-cyf-error-medias`);
      await clic('[data-op="comprador"]');
      await estado(`${id}-cyf-acierto`);
    }
    if (id === "lado-a-lado") { await clic('[data-asume="vendedor"]'); await estado(`${id}-la-popa`); }
    if (correctas[id]) {
      const malas = await pg.$$eval(en("[data-op]"), (bs, c) => bs.map((b) => b.dataset.op).filter((o) => o !== c), correctas[id]);
      for (const mala of malas) { await clic(`[data-op="${mala}"]`); await estado(`${id}-error-${mala}`); }
      await clic(`[data-op="${correctas[id]}"]`);
      await estado(`${id}-acierto`);
    }
    if (id === "resumen") break;
    await seguir();
  }
  await pg.close();
}

/* Movimiento reducido: nada de la pieza se anima (camión, capas, rebote, asiento, ficha que cruza). */
{
  const pg = await pagina({ viewport: { width: 320, height: 900 }, reducedMotion: "reduce" });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(A5);
  const animadas = () => pg.$eval(A5, (p) => p.getAnimations({ subtree: true }).length);
  const vistos = [];
  for (let vuelta = 0; vuelta < 8; vuelta++) {
    const id = await pg.getAttribute(A5, "data-pantalla");
    if (id === "la-regla-del-costo") await pg.click(`${A5} [data-accion="pesos"]`);
    if (id === "fob-cif-cyf") {
      for (const f of ["flete", "seguro", "bodega"]) await pg.click(`${A5} [data-ficha="${f}"]`);
      await pg.click(`${A5} [data-boton="comprobar"]`); await pg.click(`${A5} [data-boton="seguir-paso"]`); await pg.click(`${A5} [data-op="comprador"]`);
    }
    if (id === "lado-a-lado") await pg.click(`${A5} [data-asume="vendedor"]`);
    if (correctas[id]) { const mala = await pg.$$eval(`${A5} [data-op]`, (bs, c) => bs.map((b) => b.dataset.op).find((o) => o !== c), correctas[id]); await pg.click(`${A5} [data-op="${mala}"]`); await pg.click(`${A5} [data-op="${correctas[id]}"]`); }
    const a = await animadas();
    vistos.push(`${id}: ${a}`);
    if (a) fallos.push(`movimiento reducido · ${id}: ${a} animación(es)`);
    if (id === "resumen") break;
    await pg.click(`${A5} > .c3-seguir`);
  }
  console.log(`Movimiento reducido, animaciones por pantalla: ${vistos.join(" · ")}`);
  await pg.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | alto pieza | botón mín. | letra mín.");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.alto} | ${f.botonMinimo} | ${f.letraMinima}`);
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
/* 8 pantallas + en pesos + 5 del viaje + La Popa + 4 × (2 errores y el acierto). */
if (estados !== 27) fallos.push(`se recorrieron ${estados} estados y son 27`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto ni ninguna cifra se sale a 375 ni a 320 px; botones de 44 px.");
