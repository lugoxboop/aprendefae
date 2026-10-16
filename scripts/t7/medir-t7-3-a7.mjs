/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO DE T7-3 · A7 «LA NIC 2 DEL LIBRO» (LA FUSIÓN CON A8) A 375
 * Y 320?
 *
 *   FUENTES_DIR=/tmp/claude-0/fuentes node scripts/t7/medir-t7-3-a7.mjs [carpeta-de-capturas]
 *
 * Como medir-t7-3-a6.mjs: Chromium de verdad, la vista de T7-3 montada tal
 * cual con la hoja de estilos del sitio (banco scripts/t7/harness-t7-3). Juega
 * A7 entera —en cada pregunta falla con cada opción equivocada, acierta y
 * abre el «¿Por qué?»; en el resumen abre lo que la norma pide informar— y en
 * cada uno de sus estados comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que se hayan medido Inter y, donde hay pregunta, Sora: no la fuente
 *     de reserva
 *   · que cada opción y cada botón midan al menos 44 px de alto
 *   · que la franja de la NIC 2 sea lo primero de la pieza, en cada estado
 *   · que en cada renglón el rótulo no toque su cifra, y que las dos
 *     columnas del acierto de `el-costo` y las fichas del resumen no se
 *     salgan de su figura (figuras provisionales para Watari)
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
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
const A1 = '[data-pieza="t7-3-nic2-costo"]';

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-t7-3/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];

/*
 * Google Fonts no siempre se alcanza desde la máquina que mide. Con
 * FUENTES_DIR (una carpeta con fuentes.css y los .woff2 de Inter y Sora,
 * bajados de Google), se sirven desde el disco: la letra medida es la real.
 */
async function servirFuentes(ctx) {
  const dir = process.env.FUENTES_DIR;
  if (!dir) return;
  const { readFileSync } = await import("node:fs");
  const css = readFileSync(resolve(dir, "fuentes.css"), "utf8");
  await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => {
    const u = route.request().url();
    if (u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
    try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(dir, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return route.abort(); }
  });
}
const filas = [];

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script"))
    /* Lo que solo oye el lector de pantalla («menos», «igual a») mide 1 px a propósito. */
    .filter((el) => !el.closest(".sr"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  for (const b of pieza.querySelectorAll("button")) {
    /* El «¿Por qué?» va en línea con el texto: su área de toque de 44 px es su ::before (plegable.jsx). */
    const h = Math.max(b.getBoundingClientRect().height, b.matches("[data-por-que]") ? parseFloat(getComputedStyle(b, "::before").height) || 0 : 0);
    if (h < 44) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  /* La franja de la NIC 2: lo primero de la pieza, en cada estado. */
  const franja = pieza.querySelector(".t73pt-nic2[data-aviso]");
  if (!franja || pieza.firstElementChild !== franja) problemas.push("la frase de la NIC 2 no es lo primero de la pieza");
  /* Patrón T7-3: en cada renglón, el rótulo no toca su cifra, y la cifra no se sale. */
  for (const f of pieza.querySelectorAll("[data-renglon]")) {
    const rot = f.querySelector(".rg-rot").getBoundingClientRect();
    const v = f.querySelector(".rg-v").getBoundingClientRect();
    if (v.top < rot.bottom - 1 && rot.right > v.left - 4) problemas.push(`el renglón «${f.querySelector(".rg-rot").textContent}» toca su cifra`);
    if (v.right > f.getBoundingClientRect().right + 0.5) problemas.push(`la cifra «${f.querySelector(".rg-v").textContent}» se sale de su renglón`);
  }
  /* Las figuras de la fusión (provisionales): cada columna y cada ficha, dentro de su figura. */
  for (const fig of pieza.querySelectorAll("[data-columnas], [data-fichas]")) {
    const c = fig.getBoundingClientRect();
    for (const x of fig.querySelectorAll("[data-columna], li, [data-medida] > *")) {
      const r = x.getBoundingClientRect();
      if (r.left < c.left - 0.5 || r.right > c.right + 0.5) problemas.push(`«${x.textContent.slice(0, 30)}» se sale de su figura`);
    }
  }
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    /* Sora 600 solo se pide cuando hay una pregunta en pantalla: la vista de T7-3 tiene varias piezas, y se mide la que está a la vista. */
    fuentes: document.fonts.check("15px Inter") && (!pieza.querySelector("[data-pregunta]") || document.fonts.check("600 15px Sora")),
  };
}

const correctas = { "que-es": "mercancia", "como-se-mide": "vnr", "el-costo": "descuento", formulas: "identificacion", "la-que-falta": "ueps", sistemas: "minoristas", gasto: "marzo" };

for (const ancho of ANCHOS) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await servirFuentes(ctx);
  const pg = await ctx.newPage();
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(A1);
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, A1);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) {
      const panel = await (await pg.$(A1)).evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `t7-3-a7-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const en = (sel) => `${A1} ${sel}`;
  const clic = (sel) => pg.click(en(sel));
  for (let vuelta = 0; vuelta < 10; vuelta++) {
    const id = await pg.getAttribute(A1, "data-pantalla");
    if (await pg.$(en("[data-eleccion]"))) {
      await estado(`${id}-colocando`);
      /* Recortes: una cuenta del asiento que abre su definición (A1, P3). Se mide abierta, una a la vez, y se cierra. */
      const terminos = await pg.$$eval(en("[data-termino]"), (bs) => bs.map((b) => b.dataset.termino));
      for (const t of terminos) {
        await clic(`[data-termino="${t}"]`);
        await estado(`${id}-termino-${t}`);
      }
      if (terminos.length) await clic(`[data-termino="${terminos.at(-1)}"]`);
      const malas = await pg.$$eval(en("[data-opcion]"), (bs, c) => bs.map((b) => b.dataset.opcion).filter((o) => o !== c).sort(), correctas[id]);
      for (const mala of malas) {
        await clic(`[data-opcion="${mala}"]`); await clic('[data-boton="confirmar"]');
        await estado(`${id}-error-${mala}`);
        await clic('[data-boton="probar-otra"]');
      }
      await clic(`[data-opcion="${correctas[id]}"]`); await clic('[data-boton="confirmar"]');
      await estado(`${id}-acierto`);
      /* El foco va al mensaje. */
      if (!(await pg.evaluate(() => document.activeElement?.matches("[data-mensaje]")))) fallos.push(`${ancho} px · ${id} · el foco no va al mensaje`);
      /* Recortes: el «¿Por qué?» del acierto, abierto. */
      if (await pg.$(en("[data-mensaje] [data-por-que]"))) {
        await clic("[data-mensaje] [data-por-que]");
        await estado(`${id}-porque`);
      }
      await clic('[data-boton="seguir"]');
      continue;
    }
    await estado(id);
    /* El resumen: lo que la norma pide informar, abierto. */
    if (await pg.$(en("[data-desplegable] button"))) {
      await clic("[data-desplegable] button");
      await estado(`${id}-informar`);
    }
    const b = await pg.$(en("[data-boton]"));
    if (!b) break;
    await b.click();
  }
  await pg.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | alto pieza");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.alto}`);
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
/* Portada, resumen y lo que se abre en él (3), y en cada una de las 7 preguntas: colocando, 2 errores, acierto y ¿Por qué? (35). */
if (estados !== 38) fallos.push(`se recorrieron ${estados} estados y son 38`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto se sale a 375 ni a 320 px.");
