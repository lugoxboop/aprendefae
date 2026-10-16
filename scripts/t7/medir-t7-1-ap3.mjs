/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO Y CADA CIFRA DE AP3 «TRES FORMAS DE PONERLE PRECIO A LO
 * QUE QUEDÓ» A 375 Y 320?
 *
 *   node scripts/t7/medir-t7-1-ap3.mjs [carpeta-de-capturas]
 *
 * Como medir-t7-1-a6.mjs: Chromium de verdad, la vista de T7-1 montada tal
 * cual con la hoja de estilos del sitio. Juega AP3 entera —en cada pregunta
 * falla con cada opción equivocada y acierta; en P7 abre cada tarjeta— y
 * en cada uno de sus 31 estados comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada opción y cada botón midan al menos 44 px de alto
 *   · en la tabla de P5 y del resumen, que cada cifra quepa en su renglón
 *   · en P1, la pila al terminar de moverse (y una captura a medio camino)
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
/* Google Fonts no se alcanza desde aquí: si hay copia en disco (FUENTES), se sirve desde ahí. */
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes/";
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const ANCHOS = [375, 320];
const AP3 = '[data-pieza="t7-1-a3-tres-formas"]';

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
async function rutas(ctx) {
  if (!existsSync(`${FUENTES}fuentes.css`)) return;
  const css = readFileSync(`${FUENTES}fuentes.css`, "utf8");
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith("http://127.0.0.1")) return route.continue();
    if (u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
    if (u.startsWith("https://fonts.gstatic.com/")) {
      try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(FUENTES + u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_")) }); } catch { return route.abort(); }
    }
    return route.abort();
  });
}
const fallos = [];
const filas = [];

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
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  for (const b of pieza.querySelectorAll("button")) {
    const h = b.getBoundingClientRect().height;
    if (h < 44) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  /* P5 y P9: cada cifra de la tabla, en un solo renglón y dentro de la tabla. */
  for (const dd of pieza.querySelectorAll("[data-tabla] [data-valor]")) {
    const rg = document.createRange(); rg.selectNodeContents(dd);
    if (rg.getClientRects().length > 1) problemas.push(`«${dd.textContent}» se parte en dos renglones`);
    const t = dd.closest("[data-tabla]").getBoundingClientRect(), d = dd.getBoundingClientRect();
    if (d.right > t.right + 0.5) problemas.push(`«${dd.textContent}» se sale de la tabla`);
  }
  /* P1: la pila, dentro de su figura. */
  for (const u of pieza.querySelectorAll("[data-pila] [data-unidad], [data-pila] [data-queda]")) {
    const f = u.closest("[data-pila]").getBoundingClientRect(), r = u.getBoundingClientRect();
    if (r.right > f.right + 0.5 || r.width < 8) { problemas.push(`una unidad de la pila se sale o mide ${r.width.toFixed(1)} px`); break; }
  }
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 15px Sora"),
  };
}

const correctas = { peps: "compradas", ueps: "inicio", "promedio-ponderado": "ponderado", "lado-a-lado": "reciente", "la-recomendacion": "peps", "la-refutacion": "orden-de-costos" };

for (const ancho of ANCHOS) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await rutas(ctx);
  const pg = await ctx.newPage();
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(AP3);
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, AP3);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) {
      const panel = await (await pg.$(AP3)).evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `ap3-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const en = (sel) => `${AP3} ${sel}`;
  const clic = (sel) => pg.click(en(sel));
  for (let vuelta = 0; vuelta < 12; vuelta++) {
    const id = await pg.getAttribute(AP3, "data-pantalla");
    if (await pg.$(en("[data-eleccion]"))) {
      await estado(`${id}-colocando`);
      const malas = await pg.$$eval(en("[data-opcion]"), (bs, c) => bs.map((b) => b.dataset.opcion).filter((o) => o !== c).sort(), correctas[id]);
      for (const mala of malas) {
        await clic(`[data-opcion="${mala}"]`); await clic('[data-boton="confirmar"]');
        await estado(`${id}-error-${mala}`);
        await clic('[data-boton="probar-otra"]');
      }
      await clic(`[data-opcion="${correctas[id]}"]`); await clic('[data-boton="confirmar"]');
      await estado(`${id}-acierto`);
      await clic('[data-boton="seguir"]');
      continue;
    }
    if (await pg.$(en("[data-tarjetas]"))) {
      await estado(`${id}-cerradas`);
      for (const t of await pg.$$eval(en("[data-abrir]"), (bs) => bs.map((b) => b.dataset.abrir))) {
        await clic(`[data-abrir="${t}"]`);
        await estado(`${id}-abierta-${t}`);
      }
      await clic('[data-boton="seguir"]');
      continue;
    }
    if (id === "el-problema") {
      await pg.waitForTimeout(900);
      if (CAPTURAS) await (await (await pg.$(AP3)).evaluateHandle((x) => x.closest("section"))).asElement().screenshot({ path: resolve(CAPTURAS, `ap3-${ancho}-el-problema-en-movimiento.png`) });
      await pg.waitForTimeout(2200);
    }
    await estado(id);
    const b = await pg.$(en("[data-boton]"));
    if (!b) break;
    await b.click();
  }
  await ctx.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | alto pieza");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.alto}`);
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
if (estados !== 31) fallos.push(`se recorrieron ${estados} estados y son 31`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto ni ninguna cifra se sale a 375 ni a 320 px.");
