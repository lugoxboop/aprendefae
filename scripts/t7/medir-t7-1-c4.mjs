/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABEN LAS PIEZAS C4 DE T7-1 A 375 Y 320? (A7, H1, H3, H5, H7; motor
 * decisionC4.jsx)
 *
 *   node scripts/t7/medir-t7-1-c4.mjs [carpeta-de-capturas] [piezas…]
 *
 * Chromium de verdad, con la vista de T7-1 del banco (scripts/t7/harness) y
 * Inter y Sora servidas desde /tmp/claude-0/fuentes (Google Fonts está
 * cortado). Juega cada pieza entera: en cada ítem mide antes de responder,
 * con la consecuencia, con el veredicto y con el porqué abierto; en Aprender,
 * dos errores y el acierto; en Hacer, se alternan error y acierto. En cada
 * estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni de la pantalla
 *   · que todo botón de la pieza mida al menos 44 px de alto
 *   · que ninguna letra visible baje de 12 px
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *
 * Sale con código 1 si algo falla.
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
const PIEZAS = process.argv.length > 3 ? process.argv.slice(3) : ["a7", "h1", "h3", "h5", "h7"];
const ANCHOS = [375, 320];
/* Las cifras correctas de Near, para la condición 4 de Mello. */
const { CIFRAS_H3 } = await import("../../src/data/contabilidadT7_1_h3.js");
const { CIFRAS_H5 } = await import("../../src/data/contabilidadT7_1_h5.js");
const CORRECTAS = {
  peps: CIFRAS_H3.peps, ueps: CIFRAS_H3.ueps, "costo-promedio": CIFRAS_H3.promedio, "final-promedio": CIFRAS_H3.finalPromedio,
  "retencion-flete": CIFRAS_H5.retencionFlete, "pago-transportadora": CIFRAS_H5.pagoTransportadora, "debe-proveedor": CIFRAS_H5.debeProveedor,
};
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes/";

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness/index.html`;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const css = readFileSync(FUENTES + "fuentes.css", "utf8");
const fallos = [];
const filas = [];

async function contexto(ancho) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith("http://127.0.0.1")) return route.continue();
    if (u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
    if (u.startsWith("https://fonts.gstatic.com/")) {
      try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(FUENTES + u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_")) }); } catch { return route.abort(); }
    }
    return route.abort();
  });
  return ctx;
}

function medir(sel) {
  /* Lo de la pieza: el motor ([data-pieza]), el caso de Near y la portada, la lectura y el resumen de A7. El Marco y el Cierre son compartidos. */
  const raices = [...document.querySelectorAll("[data-pieza], [data-caso], [data-portada], [data-lectura]")];
  const problemas = [];
  const visibles = raices.flatMap((r) => [r, ...r.querySelectorAll("*")]).filter((el) => !el.matches("style, script") && el.getClientRects().length);
  for (const el of visibles.filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))) {
    const r = el.getBoundingClientRect();
    const e = getComputedStyle(el);
    if (!r.width || (e.position === "absolute" && el.clientWidth <= 1)) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (e.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > window.innerWidth + 0.5 || r.left < -0.5) problemas.push(`${nombre}: se sale de la pantalla`);
    if (parseFloat(e.fontSize) < 12) problemas.push(`${nombre}: letra de ${e.fontSize}`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  /* El alto de caja (offsetHeight): la animación de la consecuencia escala el botón un instante, y eso no es su alto. */
  const botones = visibles.filter((b) => b.matches("button, input")).map((b) => [b, { height: b.offsetHeight }]);
  for (const [b, r] of botones) if (r.height < 44 - 0.01) problemas.push(`el botón «${b.textContent.trim().slice(0, 30) || b.getAttribute("aria-label")}» mide ${r.height.toFixed(1)} px de alto`);
  const fig = document.querySelector("[data-figura]")?.getBoundingClientRect();
  return {
    problemas,
    botonMasBajo: botones.length ? Math.round(Math.min(...botones.map(([, r]) => r.height)) * 10) / 10 : null,
    figuraAncho: fig ? Math.round(fig.width) : null,
    alto: Math.round(document.documentElement.scrollHeight),
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}

for (const clave of PIEZAS) {
  for (const ancho of ANCHOS) {
    const ctx = await contexto(ancho);
    const pg = await ctx.newPage();
    const aprender = clave === "a7";
    await pg.goto(aprender ? BASE : `${BASE}#${clave}`);
    const SEL = aprender ? '[data-pieza="t7-1-a7-control-interno"]' : "[data-pieza]";
    await pg.waitForSelector(SEL);
    let n = 0;
    const estado = async (nombre) => {
      await pg.evaluate(() => document.fonts.ready);
      const m = await pg.evaluate(medir, SEL);
      filas.push({ pieza: clave, ancho, estado: nombre, botonMasBajo: m.botonMasBajo, figura: m.figuraAncho });
      for (const p of m.problemas) fallos.push(`${clave} · ${ancho} px · ${nombre} · ${p}`);
      if (!m.fuentes) fallos.push(`${clave} · ${ancho} px · ${nombre} · no cargaron Inter o Sora`);
      if (CAPTURAS) {
        const el = await pg.$(SEL);
        if (aprender) await el.scrollIntoViewIfNeeded();
        await pg.screenshot({ path: resolve(CAPTURAS, `${clave}-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`), fullPage: !aprender });
      }
    };
    const raiz = async () => pg.$(SEL);
    let k = 0;
    for (;;) {
      const r = await raiz();
      const item = await r.getAttribute("data-item");
      await estado(`${item}-antes`);
      const ops = await r.$$("[data-op]");
      const casilla = await r.$(".c4-casilla input");
      /* Condición 4 de Mello (C4-1): la cifra correcta escrita, sin «Comprobar», no muestra nada que califique. */
      if (casilla && CORRECTAS[item] != null) {
        await casilla.fill(String(CORRECTAS[item]));
        await pg.waitForTimeout(450);
        const delata = await pg.evaluate((s) => {
          const f = document.querySelector(`${s} [data-figura]`);
          return { html: /c4-cuadra|c4-falla| mal\b|data-queda|data-cuadra/.test(f.innerHTML.replace(/<style>[\s\S]*?<\/style>/g, "")), mensaje: Boolean(document.querySelector(`${s} [data-mensaje], ${s} [data-falla]`)) };
        }, SEL);
        if (delata.html || delata.mensaje) fallos.push(`${clave} · ${ancho} px · ${item} · la cifra correcta escrita califica antes de «Comprobar»`);
        await estado(`${item}-escrita-correcta`);
        await casilla.fill("");
      }
      const intentos = aprender ? [1, 2, 0] : [k % 2];
      for (const [t, cual] of intentos.entries()) {
        if (casilla) {
          await casilla.fill(cual === 0 ? "1" : "999999");
          await pg.click(`${SEL} [data-accion="comprobar"]`);
        } else {
          const o = ops[Math.min(cual, ops.length - 1)];
          if (aprender && t === 2) {
            /* El acierto: la que el motor marcó en blanco tras el 2.º error. */
            await pg.click(`${SEL} [data-op].pista`);
          } else await o.click();
        }
        await estado(`${item}-consecuencia-${t + 1}`);
        await pg.waitForSelector(`${SEL} [data-mensaje]`);
        await estado(`${item}-veredicto-${t + 1}`);
        if (aprender && t < 2 && (await r.$("[data-mensaje][data-mensaje='acierto']"))) break;
      }
      const porque = await r.$(".c4-porque");
      if (porque) { await porque.click(); await estado(`${item}-porque`); }
      const seguir = await r.$(aprender ? ".c4-seguir" : "[data-responder] button");
      if (!seguir) break;
      const texto = (await seguir.textContent()).trim();
      await seguir.click();
      k += 1;
      if (aprender && !(await (await raiz()).$('.c4-seguir[aria-disabled="true"]'))) { await estado("resumen"); break; }
      if (!aprender && /resumen/i.test(texto)) { await pg.waitForSelector("[data-resumen]"); await estado("cierre"); break; }
      if (k > 20) break;
    }
    await ctx.close();
  }
}

await navegador.close();
await servidor.close();
const resumen = {};
for (const f of filas) {
  const c = (resumen[`${f.pieza} ${f.ancho}`] ??= { estados: 0, botonMasBajo: Infinity, figura: f.figura });
  c.estados += 1;
  if (f.botonMasBajo != null) c.botonMasBajo = Math.min(c.botonMasBajo, f.botonMasBajo);
}
console.table(resumen);
if (fallos.length) { console.log(fallos.join("\n")); process.exit(1); }
console.log(`Sin problemas: ${filas.length} estados.`);
