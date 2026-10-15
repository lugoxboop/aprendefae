/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE T4 · H1 «¿ENTRA O SALE DE CAJA?» A 375 Y 320, Y NO DELATA NADA?
 *
 *   node scripts/t4/medir-t4-h1.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T4 en modo Hacer con H1 abierto (banco
 * scripts/t4/harness-t4, #h1). Salta el «Así se juega» y juega los ocho
 * hechos: en cada uno, antes de tocar, mira el DOM y después falla o acierta
 * (alterna) y mide. En cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal y ningún texto se salga
 *   · que cada destino y cada botón midan al menos 44 px de alto
 *   · que ningún destino se parta en dos líneas antes de responder
 *   · PH8-2: antes de tocar, el DOM no trae ni la devolución ni la página
 *   · con movimiento reducido, nada de la actividad tiene animación en curso
 *
 * Sale con código 1 si algo falla. Necesita Playwright.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const ANCHOS = [375, 320];
const H1 = "[data-t4-h1]";

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t4/harness-t4/index.html#h1`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

function medir({ antes }) {
  const zona = document.querySelector("[data-t4-h1]");
  const marco = zona.closest("section") ?? zona.parentElement;
  const caja = marco.getBoundingClientRect();
  const problemas = [];
  for (const el of [...marco.querySelectorAll("*")].filter((e) => !e.matches("style, script") && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    if (el.closest('[style*="clip: rect"]')) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del marco`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  const botones = [...marco.querySelectorAll("[data-opcion] button"), ...[...document.querySelectorAll("button")].filter((b) => /Siguiente hecho|Ver mi resumen/.test(b.textContent))];
  for (const b of botones) {
    const h = b.getBoundingClientRect().height;
    if (h < 44) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  if (antes) {
    /* El rótulo del destino: su nodo de texto, no el botón entero (el marcador va a otra altura). */
    for (const b of marco.querySelectorAll("[data-opcion] button")) {
      const texto = [...b.querySelectorAll("*"), b].flatMap((e) => [...e.childNodes]).find((n) => n.nodeType === 3 && n.textContent.trim());
      const rango = document.createRange(); rango.selectNodeContents(texto);
      const lineas = new Set([...rango.getClientRects()].filter((x) => x.width > 1).map((x) => Math.round(x.top))).size;
      if (lineas !== 1) problemas.push(`el destino «${b.textContent.trim()}» ocupa ${lineas} líneas`);
    }
    /* PH8-2: con textContent y outerHTML, que ven también lo escondido por CSS. */
    const dom = zona.textContent + zona.outerHTML;
    if (zona.querySelector("[data-panel], [data-pagina], [data-texto-retro]")) problemas.push("antes de responder ya hay devolución en el DOM");
    if (/Basado en el libro|Correcto\.|Así es\./.test(dom)) problemas.push("antes de responder el DOM trae una página o un acierto");
  }
  const animado = [...zona.querySelectorAll("*")].filter((el) => el.getAnimations().some((a) => a.playState === "running")).length;
  return { problemas, ancho: Math.round(caja.width * 10) / 10, alto: Math.round(zona.getBoundingClientRect().height), animado };
}

for (const reducido of [false, true]) {
  for (const ancho of ANCHOS) {
    const pg = await navegador.newPage({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2, reducedMotion: reducido ? "reduce" : "no-preference" });
    await pg.goto(URL_BANCO);
    /* El «Así se juega» sale la primera vez: «Siguiente» lo cierra. */
    const asj = await pg.waitForSelector('[data-asj-control], [data-t4-h1]', { timeout: 120000 });
    const saltar = await pg.$$("button");
    for (const b of saltar) if ((await b.textContent())?.trim() === "Siguiente") { await b.click(); break; }
    await pg.waitForSelector(H1);
    let n = 0;
    const estado = async (nombre, antes) => {
      await pg.evaluate(() => document.fonts.ready);
      if (reducido) await pg.waitForTimeout(50);
      const m = await pg.evaluate(medir, { antes });
      const marca = `${reducido ? "reducido · " : ""}${ancho} px · ${nombre}`;
      if (reducido) { if (m.animado) fallos.push(`${marca} · ${m.animado} animaciones en curso`); return; }
      filas.push({ ancho, estado: nombre, marco: m.ancho, alto: m.alto });
      for (const p of m.problemas) fallos.push(`${marca} · ${p}`);
      if (CAPTURAS) await (await pg.$(H1)).evaluateHandle((x) => x.closest("section") ?? x.parentElement).then((m) => m.asElement().screenshot({ path: resolve(CAPTURAS, `t4-h1-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) }));
    };
    for (let k = 0; k < 8; k++) {
      const id = await pg.getAttribute("[data-tarjeta-hecho]", "data-tarjeta-hecho");
      await estado(`${id}-colocando`, true);
      /* Siempre «Debe de Caja»: acierta en tres hechos y falla en cinco, así se miden los dos paneles. */
      await pg.click('[data-opcion="debe"] button');
      const panel = await pg.getAttribute("[data-panel]", "data-panel");
      await estado(`${id}-${panel}`, false);
      for (const b of await pg.$$("button")) { const t = (await b.textContent())?.trim(); if (t === "Siguiente hecho" || t === "Ver mi resumen") { await b.click(); break; } }
    }
    await pg.waitForSelector("[data-resumen]");
    await pg.close();
  }
}

await navegador.close();
await servidor.close();
console.log("ancho | estado | marco | alto");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.marco} | ${f.alto}`);
console.log(fallos.length ? `\n${fallos.length} FALLAN:\n${fallos.join("\n")}` : `\nTodo cabe en los ${filas.length} estados, nada se delata antes de responder, y con movimiento reducido nada se anima.`);
process.exit(fallos.length ? 1 : 0);
