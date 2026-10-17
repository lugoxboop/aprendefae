/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABEN H4 Y H6 DE T7-1 CON EL C4 A 375 Y 320? (las que no montan el
 * motor; mismas comprobaciones que medir-t7-1-c4.mjs)
 *
 *   node scripts/t7/medir-t7-1-c4-fuera.mjs [carpeta-de-capturas] [h4|h6…]
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
const PIEZAS = process.argv.length > 3 ? process.argv.slice(3) : ["h4", "h6"];
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
  const raices = [...document.querySelectorAll(sel)];
  const problemas = [];
  const visibles = raices.flatMap((r) => [r, ...r.querySelectorAll("*")]).filter((el) => !el.matches("style, script") && el.getClientRects().length);
  for (const el of visibles.filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))) {
    const r = el.getBoundingClientRect();
    const e = getComputedStyle(el);
    if (!r.width || (e.position === "absolute" && el.clientWidth <= 1)) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (e.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > window.innerWidth + 0.5 || r.left < -0.5) problemas.push(`${nombre}: se sale de la pantalla`);
    /* La letra, en lo del C4 (las figuras); el resto de la pieza es de main (AsientoEnLineas, compartido, rotula a 10,5 px). */
    if (el.closest("[data-c4-figura]") && parseFloat(e.fontSize) < 12) problemas.push(`${nombre}: letra de ${e.fontSize}`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  /* El alto de caja (offsetHeight): la animación de la consecuencia escala el botón un instante, y eso no es su alto. */
  const botones = visibles.filter((b) => b.matches("button, input")).map((b) => [b, { height: b.offsetHeight }]);
  for (const [b, r] of botones) if (r.height < 44 - 0.01) problemas.push(`el botón «${b.textContent.trim().slice(0, 30) || b.getAttribute("aria-label")}» mide ${r.height.toFixed(1)} px de alto`);
  const fig = document.querySelector("[data-c4-figura]")?.getBoundingClientRect();
  return {
    problemas,
    botonMasBajo: botones.length ? Math.round(Math.min(...botones.map(([, r]) => r.height)) * 10) / 10 : null,
    figuraAncho: fig ? Math.round(fig.width) : null,
    alto: Math.round(document.documentElement.scrollHeight),
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}

const espera = (pg) => pg.waitForTimeout(450);
for (const clave of PIEZAS) {
  for (const ancho of ANCHOS) {
    const ctx = await contexto(ancho);
    const pg = await ctx.newPage();
    await pg.goto(`${BASE}#${clave}`);
    const SEL = `[data-${clave}]`;
    await pg.waitForSelector(SEL);
    let n = 0;
    const estado = async (nombre) => {
      await pg.evaluate(() => document.fonts.ready);
      const m = await pg.evaluate(medir, SEL);
      filas.push({ pieza: clave, ancho, estado: nombre, botonMasBajo: m.botonMasBajo, figura: m.figuraAncho });
      for (const p of m.problemas) fallos.push(`${clave} · ${ancho} px · ${nombre} · ${p}`);
      if (!m.fuentes) fallos.push(`${clave} · ${ancho} px · ${nombre} · no cargaron Inter o Sora`);
      if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `${clave}-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`), fullPage: true });
    };
    const boton = (t) => pg.locator(`${SEL} button`, { hasText: t }).first();
    if (clave === "h4") {
      await estado("apertura");
      for (const casilla of await pg.$$(`${SEL} [data-casilla]`)) {
        await pg.click(`${SEL} [data-ficha-cifra] >> nth=0`);
        await casilla.click();
      }
      await estado("llena");
      await boton("Confirmar").click();
      await estado("consecuencia");
      await espera(pg);
      await estado("veredicto");
      await boton("Siguiente").click();
      for (const l of await pg.$$(`${SEL} [data-linea]`)) await (await l.$$("button"))[0].click();
      await boton("Comprobar").click();
      await estado("cierre-comprobado");
    } else {
      for (let k = 0; k < 5; k++) {
        await estado(`item${k + 1}-antes`);
        const op = await pg.$(`${SEL} [data-opcion] button`);
        const casilla = await pg.$(`${SEL} [data-campo-cifra]`);
        if (op) await op.click();
        else if (casilla) { await casilla.fill("956250"); await estado(`item${k + 1}-escrita`); await boton("Comprobar").click(); }
        else {
          for (const l of await pg.$$(`${SEL} [data-linea-cuenta]`)) { await (await l.$$("[data-ficha-cuenta]"))[0].click(); await (await l.$$("button", { hasText: "Debe" }))[0]; const b = await l.$$("button"); await b[b.length - 2].click(); }
          await boton("Comprobar").click();
        }
        await estado(`item${k + 1}-consecuencia`);
        await espera(pg);
        await estado(`item${k + 1}-veredicto`);
        const sig = await pg.$(`[data-marco] button:has-text("Siguiente"), button:has-text("Siguiente ítem"), button:has-text("Ver mi resumen")`);
        if (!sig) break;
        await sig.click();
      }
    }
    await ctx.close();
  }
}

await navegador.close();
await servidor.close();
console.table(filas.reduce((r, f) => { const c = (r[`${f.pieza} ${f.ancho}`] ??= { estados: 0, botonMasBajo: Infinity, figura: f.figura }); c.estados += 1; if (f.botonMasBajo != null) c.botonMasBajo = Math.min(c.botonMasBajo, f.botonMasBajo); return r; }, {}));
if (fallos.length) { console.log(fallos.join("\n")); process.exit(1); }
console.log(`Sin problemas: ${filas.length} estados.`);
