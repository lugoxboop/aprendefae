/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO DE T5 · N6 «LO QUE EL EJEMPLO NO TRAE» A 375 Y 320?
 *
 *   CHROMIUM_PATH=/opt/pw-browsers/chromium FUENTES_DIR=/tmp/claude-0/fuentes \
 *     node scripts/t5/medir-t5-n6.mjs [carpeta-de-capturas]
 *
 * Como medir-t7-3-a1.mjs: Chromium de verdad, la vista de T5 montada tal cual
 * con la hoja de estilos del sitio (banco scripts/t5/harness-t5). Juega N6
 * entera tres veces, para pasar por todos los estados de cada pregunta: el
 * 1.er error con cada opción equivocada, el 2.º error con cada una (la
 * pregunta se cierra) y el acierto. En cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada opción y cada botón midan al menos 44 px de alto
 *   · que ninguna letra mida menos de 12 px
 *   · que las cifras de las cuentas T quepan en su lado
 *
 * Los estados se miden con las animaciones ya terminadas (la factura que se
 * pliega, la ficha que rebota). Sale con código 1 si algo falla. Necesita
 * Playwright (no es dependencia del repo): el de la máquina, o el de
 * PLAYWRIGHT_MODULE.
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
const N6 = '[data-pieza="t5-a2-lo-que-el-ejemplo-no-trae"]';

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t5/harness-t5/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];

/* Google Fonts no se alcanza desde la máquina que mide: con FUENTES_DIR se sirven desde el disco. Lo demás de fuera se corta. */
async function servirFuentes(ctx) {
  const dir = process.env.FUENTES_DIR;
  const css = dir ? readFileSync(resolve(dir, "fuentes.css"), "utf8") : null;
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith("http://127.0.0.1")) return route.continue();
    if (dir && u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
    if (dir && u.startsWith("https://fonts.gstatic.com/")) {
      try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(dir, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return route.abort(); }
    }
    return route.abort();
  });
}

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
    /* El rótulo del marco compartido (Panel, `section > header`) no es de la pieza. */
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 12 && !el.closest("section > header")) problemas.push(`${nombre}: letra de ${fs} px`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  for (const b of pieza.querySelectorAll("button")) {
    const h = b.getBoundingClientRect().height;
    if (h < 44) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  /* Cada cifra de una cuenta T, dentro de su lado. */
  for (const m of pieza.querySelectorAll("[data-mov]")) {
    const lado = m.closest("[data-lado-t]").getBoundingClientRect();
    const v = m.getBoundingClientRect();
    if (v.right > lado.right + 0.5 || v.left < lado.left - 0.5) problemas.push(`la cifra «${m.textContent}» se sale de su lado`);
  }
  const fig = pieza.querySelector("[data-figura]").getBoundingClientRect();
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    figura: Math.round(fig.height),
    /* La figura es lo primero: su borde de arriba, contado desde el del panel (B1 pide que empiece en los primeros 280 px). */
    figuraDesde: Math.round(fig.top - caja.top),
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 15px Sora"),
  };
}

const CORRECTA = { "la-compra": "costo", "el-limite": "no", "el-dividendo": "dividendos" };
const MALAS = { "la-compra": ["precio", "gastos"], "el-limite": ["si-inversion", "si-cuida"], "el-dividendo": ["inversiones", "intereses"] };
const filas = [];

for (const ancho of ANCHOS) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await servirFuentes(ctx);
  let n = 0;
  /* Tres vueltas: la 0 falla con la primera equivocada y acierta; la 1 falla con la segunda y cierra con la primera; la 2, al revés. */
  for (const vuelta of [0, 1, 2]) {
    const pg = await ctx.newPage();
    await pg.goto(URL_BANCO);
    await pg.waitForSelector(N6);
    await pg.evaluate(() => document.fonts.ready);
    const estado = async (nombre) => {
      await pg.waitForTimeout(800);
      const m = await pg.evaluate(medir, N6);
      filas.push({ ancho, estado: nombre, ...m });
      for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
      if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
      if (m.figuraDesde > 280) fallos.push(`${ancho} px · ${nombre} · la figura empieza a ${m.figuraDesde} px`);
      if (CAPTURAS) {
        const panel = await (await pg.$(N6)).evaluateHandle((x) => x.closest("section"));
        await panel.asElement().screenshot({ path: resolve(CAPTURAS, `t5-n6-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
      }
    };
    const clic = (sel) => pg.click(`${N6} ${sel}`);
    for (let paso = 0; paso < 6; paso++) {
      const id = await pg.getAttribute(N6, "data-pantalla");
      if (!CORRECTA[id]) {
        if (vuelta === 0) await estado(id);
        const b = await pg.$(`${N6} [data-boton]`);
        if (!b) break;
        await b.click();
        continue;
      }
      const [m1, m2] = vuelta === 1 ? [...MALAS[id]].reverse() : MALAS[id];
      if (vuelta === 0) await estado(`${id}-colocando`);
      await clic(`[data-opcion="${m1}"]`); await clic('[data-boton="confirmar"]');
      if (vuelta !== 2) await estado(`${id}-1er-error-${m1}`);
      await clic('[data-boton="probar-otra"]');
      if (vuelta === 0) {
        await clic(`[data-opcion="${CORRECTA[id]}"]`); await clic('[data-boton="confirmar"]');
        await estado(`${id}-acierto`);
      } else {
        await clic(`[data-opcion="${m2}"]`); await clic('[data-boton="confirmar"]');
        await estado(`${id}-2o-error-${m2}`);
      }
      await clic('[data-boton="seguir"]');
    }
    await pg.close();
  }
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | alto pieza | alto figura | figura desde");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.alto} | ${f.figura} | ${f.figuraDesde}`);
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
/* 2 lecturas + 3 preguntas × (colocando, 2 primeros errores, 2 segundos errores, acierto) */
if (estados !== 2 + 3 * 6) fallos.push(`se recorrieron ${estados} estados y son ${2 + 3 * 6}`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto se sale a 375 ni a 320 px, y los botones miden 44 px o más.");
