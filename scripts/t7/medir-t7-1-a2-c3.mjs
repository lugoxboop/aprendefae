/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE T7-1 A2 «LA FACTURA COMPLETA» (PATRÓN C3) A 320, 375 Y 1280?
 *
 *   node scripts/t7/medir-t7-1-a2-c3.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T7-1 montada tal cual con la hoja de estilos
 * del sitio (banco scripts/t7/harness). Juega A2 entera —en cada pregunta, el
 * 1.er error, el 2.º y el acierto; en cada asiento, la escalera de la primera
 * línea— y en cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal y ningún texto se salga de su
 *     caja ni del panel
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada botón mida 44 px de alto o más
 *   · que ningún texto de la pieza baje de 12 px
 *   · B1 y B2 a 320 (canonEnganche.js), en MODO INFORME: se imprime y no falla
 *
 * Una vuelta más a 320 con movimiento reducido. Y, al cruzar, que la ficha
 * del IVA quede en la columna del haber (transform).
 *
 * Google Fonts no se alcanza desde aquí: si existe /tmp/claude-0/fuentes, las
 * fuentes se sirven desde disco. Sale con código 1 si algo falla.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const FUENTES = "/tmp/claude-0/fuentes/";
const A2 = '[data-pieza="t7-1-a2-la-factura-completa"]';
const VUELTAS = [
  { ancho: 320, reducido: false },
  { ancho: 375, reducido: false },
  { ancho: 1280, reducido: false },
  { ancho: 320, reducido: true },
];

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}`;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const fallos = [];
const informe = [];
const filas = [];

async function contexto(ancho, reducido) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2, reducedMotion: reducido ? "reduce" : "no-preference" });
  if (existsSync(`${FUENTES}fuentes.css`)) {
    const css = readFileSync(`${FUENTES}fuentes.css`, "utf8");
    await ctx.route("https://fonts.googleapis.com/**", (r) => r.fulfill({ status: 200, contentType: "text/css", body: css }));
    await ctx.route("https://fonts.gstatic.com/**", (r) => {
      const f = r.request().url().replace("https://fonts.gstatic.com/", "").replace(/\//g, "_");
      try { return r.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(FUENTES + f) }); } catch { return r.abort(); }
    });
  }
  return ctx;
}

async function medir(pg) {
  return pg.evaluate(async (sel) => {
    const C = await import("/src/contabilidad/canonEnganche.js");
    const pieza = document.querySelector(sel);
    const panel = pieza.closest("section");
    const caja = panel.getBoundingClientRect();
    const problemas = [];
    for (const el of panel.querySelectorAll("*")) {
      if (el.matches("style, script") || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue; /* lo solo para el lector de pantalla */
      const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
      const cs = getComputedStyle(el);
      if (cs.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
      if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
      if (pieza.contains(el) && parseFloat(cs.fontSize) < 12) problemas.push(`${nombre}: letra de ${cs.fontSize}`);
    }
    if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
    let bajo = 99;
    for (const b of pieza.querySelectorAll("button")) {
      if (b.hidden || !b.getBoundingClientRect().width) continue;
      const h = b.getBoundingClientRect().height;
      bajo = Math.min(bajo, h);
      if (h < 44 - 0.01) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
    }
    const m = C.medirTarjeta(panel, window);
    const fig = pieza.querySelector("[data-figura]");
    return {
      problemas, bajo: Math.round(bajo * 10) / 10,
      panel: Math.round(caja.width * 10) / 10,
      alto: Math.round(pieza.getBoundingClientRect().height),
      b1px: Math.round(fig.getBoundingClientRect().top - caja.top),
      antes: m.antes, texto: m.texto, figura: m.figura,
      fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 15px Sora"),
    };
  }, A2);
}

for (const { ancho, reducido } of VUELTAS) {
  const ctx = await contexto(ancho, reducido);
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/scripts/t7/harness/index.html`);
  await pg.waitForSelector(A2);
  await pg.evaluate(() => document.fonts.ready);
  const vuelta = `${ancho}${reducido ? "-reducido" : ""}`;
  let n = 0;
  const estado = async (nombre) => {
    await pg.waitForTimeout(reducido ? 50 : 650);
    const m = await medir(pg);
    filas.push({ vuelta, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${vuelta} · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${vuelta} · ${nombre} · no cargaron Inter o Sora`);
    if (ancho === 320 && !reducido) {
      if (m.b1px > 280) informe.push(`${vuelta} · ${nombre} · B1: la figura empieza a ${m.b1px} px`);
      if (m.antes > 40) informe.push(`${vuelta} · ${nombre} · B1: ${m.antes} palabras antes de la figura`);
      if (m.texto > 60) informe.push(`${vuelta} · ${nombre} · B2: ${m.texto} palabras`);
    }
    if (CAPTURAS) {
      const panel = await (await pg.$(A2)).evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `a2-${vuelta}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const clic = (s) => pg.click(`${A2} ${s}`);
  const seguir = () => clic(".c3-seguir");
  await pg.locator(A2).scrollIntoViewIfNeeded();
  await estado("1-portada");
  await seguir();
  await estado("2-al-llegar");
  await clic('[data-accion="iva"]');
  await estado("2-iva");
  await clic('[data-accion="ret"]');
  await estado("2-retencion");
  await seguir();
  await estado("3-al-llegar");
  await clic('[data-elige="con-iva"]');
  await estado("3-error-1");
  await clic('[data-elige="solo-iva"]');
  await estado("3-error-2");
  await clic('[data-elige="sin-iva"]');
  await estado("3-acierto");
  for (const [p, lineas] of [["4", ["debe", "haber", "haber"]], ["5", ["haber", "debe", "haber", "debe"]]]) {
    await seguir();
    await estado(`${p}-al-llegar`);
    const otro = lineas[0] === "debe" ? "haber" : "debe";
    await clic(`.c3-lado[data-lado="${otro}"]`);
    await estado(`${p}-error-1`);
    await clic(`.c3-lado[data-lado="${otro}"]`);
    await estado(`${p}-error-2`);
    for (const l of lineas) await clic(`.c3-lado[data-lado="${l}"]`);
    await estado(`${p}-acierto`);
    await clic('[data-boton="por-que"]');
    await estado(`${p}-porque`);
  }
  await seguir();
  await estado("6-al-llegar");
  await clic('[data-rol="venta"]');
  await estado("6-venta");
  const cruzo = await pg.evaluate((sel) => {
    const iva = document.querySelector(`${sel} [data-ficha="iva"]`).getBoundingClientRect();
    const c = document.querySelector(`${sel} .c3-cruce`).getBoundingClientRect();
    return iva.left > c.left + c.width / 2 - 1;
  }, A2);
  if (!cruzo) fallos.push(`${vuelta} · 6 · la ficha del IVA no cruzó al haber`);
  await clic('[data-op="siempre-se-resta"]');
  await estado("6-error-1");
  await clic('[data-op="tarifa-distinta"]');
  await estado("6-error-2");
  await clic('[data-op="quien-la-debe"]');
  await estado("6-acierto");
  await seguir();
  await estado("7-resumen");
  await ctx.close();
}

await navegador.close();
await servidor.close();

console.log("vuelta | estado | panel | alto pieza | B1 px | palabras antes | B2 | figura | botón más bajo");
for (const f of filas) console.log(`${f.vuelta} | ${f.estado} | ${f.panel} | ${f.alto} | ${f.b1px} | ${f.antes} | ${f.texto} | ${f.figura} | ${f.bajo}`);
console.log(`\n${filas.length} medidas.`);
console.log(`\nInforme B1/B2 a 320 (no falla): ${informe.length ? "" : "todo cumple"}`);
for (const f of informe) console.log(`  · ${f}`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: nada se sale a 320, 375 ni 1280; botones de 44 px o más; letra de 12 px o más; el IVA cruza.");
