/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE T7-2 · A3 «EL KÁRDEX» (el kárdex que crece, Patrón de enganche C2)
 * A 375, A 320 Y A 1280?
 *
 *   node scripts/t7/medir-t7-2-a3.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T7-2 montada tal cual con la hoja de
 * estilos del sitio (banco scripts/t7/harness-t7-2). Juega A3 entera —en
 * PEPS, UEPS, promedio y lado a lado falla con cada ficha o método
 * equivocado y acierta; mueve la fecha un paso, a saltos y hacia atrás;
 * abre el «¿Por qué?»— y en cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que ningún texto visible de la pieza mida menos de 12 px
 *   · que cada botón y el deslizador midan al menos 44 px de alto
 *   · que cada cifra del kárdex quepa en su celda sin partirse
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *
 * Google Fonts está cortado: si existe /tmp/claude-0/fuentes, las fuentes se
 * sirven de ahí (FUENTES=otra/carpeta para cambiarla). Sale con código 1 si
 * algo falla. Necesita Playwright (no es dependencia del repo): el de la
 * máquina, o el de PLAYWRIGHT_MODULE; Chromium de CHROMIUM_PATH.
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
const ANCHOS = [375, 320, 1280];
const A3 = '[data-pieza="t7-2-a3-el-kardex"]';
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes/";

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-t7-2/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

async function contexto(ancho) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  if (!existsSync(resolve(FUENTES, "fuentes.css"))) return ctx;
  const css = readFileSync(resolve(FUENTES, "fuentes.css"), "utf8");
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith("http://127.0.0.1")) return route.continue();
    if (u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
    if (u.startsWith("https://fonts.gstatic.com/")) {
      try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(FUENTES, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return route.abort(); }
    }
    return route.abort();
  });
  return ctx;
}

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest("[hidden]"); };
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script, .ekx-solo-lector") && !el.closest(".ekx-vuelo"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
    .filter(visible);
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
    const px = parseFloat(getComputedStyle(el).fontSize);
    /* El rótulo del marco (PIEZA n DE N, 10,5 px) es de la vista compartida, no de la pieza. */
    if (px < 12 && pieza.contains(el)) problemas.push(`${nombre}: letra de ${px} px`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  for (const b of [...pieza.querySelectorAll("button, input[type=range]")].filter(visible)) {
    const h = b.getBoundingClientRect().height;
    if (h < 44) problemas.push(`«${(b.textContent || b.getAttribute("aria-label")).trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  for (const celda of pieza.querySelectorAll(".ekx-cu, .ekx-tot, .ekx-l-v")) {
    if (!visible(celda)) continue;
    const r = celda.getBoundingClientRect();
    const rango = document.createRange();
    rango.selectNodeContents(celda);
    const t = rango.getBoundingClientRect();
    if (t.width && (t.right > r.right + 0.5 || t.left < r.left - 0.5)) problemas.push(`la cifra «${celda.textContent}» no cabe en su celda`);
    if (t.height > 26) problemas.push(`la cifra «${celda.textContent}» se parte en dos líneas`);
  }
  const fig = pieza.querySelector("[data-figura]").getBoundingClientRect();
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    figura: Math.round(fig.top - caja.top),
    alto: Math.round(pieza.getBoundingClientRect().height),
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 14px Sora"),
  };
}

const MALAS = { peps: ["como-ueps", "solo-5"], ueps: ["del-5", "inicio-y-14"], promedio: ["2250", "2140"], "lado-a-lado": ["ueps", "promedio"] };
const BIEN = { peps: "inicio-y-5", ueps: "del-14", promedio: "2195", "lado-a-lado": "peps" };

for (const ancho of ANCHOS) {
  const ctx = await contexto(ancho);
  const pg = await ctx.newPage();
  pg.on("pageerror", (e) => fallos.push(`${ancho} px · error en la página: ${e.message}`));
  pg.on("console", (m) => { if (m.type() === "error") fallos.push(`${ancho} px · consola: ${m.text().slice(0, 200)}`); });
  pg.on("crash", () => console.error(`${ancho} px · la página se cayó`));
  await pg.emulateMedia({ reducedMotion: "reduce" });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(A3);
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, A3);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) {
      const panel = await (await pg.$(A3)).evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `t7-2-a3-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const en = (sel) => `${A3} ${sel}`;
  const clic = (sel) => pg.click(en(sel));
  const fecha = (i) => pg.$eval(en(".ekx-rango"), (r, v) => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    set.call(r, String(v));
    r.dispatchEvent(new Event("input", { bubbles: true }));
  }, i);
  const seguir = () => clic(".ekx-seguir");

  await estado("portada");
  await seguir();
  await estado("los-datos");
  await fecha(1);
  await estado("los-datos-5-jul");
  await seguir();
  for (const id of ["peps", "ueps", "promedio", "lado-a-lado"]) {
    await estado(`${id}-llega`);
    const sel = id === "lado-a-lado" ? (x) => `[data-metodo-lado="${x}"]` : (x) => `[data-ficha="${x}"]`;
    for (const [k, mala] of MALAS[id].entries()) {
      await clic(sel(mala));
      await estado(`${id}-error-${k + 1}`);
    }
    await clic(sel(BIEN[id]));
    await estado(`${id}-acierto`);
    if (id === "peps") {
      await fecha(3);
      await estado("peps-14-jul-sigue");
      await fecha(4);
      await estado("peps-20-jul");
      await fecha(0);
      await estado("peps-1-jul");
    }
    if (id === "promedio") {
      await clic('[data-boton="por-que"]');
      await estado("promedio-por-que");
    }
    await seguir();
  }
  await estado("resumen");
  await fecha(2);
  await estado("resumen-9-jul");
  await ctx.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | figura desde el tope | alto pieza");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.figura} | ${f.alto}`);
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
if (estados !== 25) fallos.push(`se recorrieron ${estados} estados y son 25`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: nada se sale a 375, 320 ni 1280 px; botones de 44 px; letra de 12 px o más.");
