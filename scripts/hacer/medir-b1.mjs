/*
 * B1 del encabezado de Hacer (#542): a 320 y 375 px, cuánto mide el
 * encabezado (rótulo, título, objetivo, consigna, «¿Cómo se juega?») y a qué
 * altura de la tarjeta empieza la primera interacción. B1 pide ≤ 280 px.
 *   FUENTES=<carpeta con @fontsource/inter y sora> node scripts/hacer/medir-b1.mjs
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const FUENTES = process.env.FUENTES;
const hayFuentes = Boolean(FUENTES) && existsSync(`${FUENTES}/node_modules/@fontsource/inter`);

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/hacer/banco/index.html`;
const nav = await chromium.launch();

async function pagina(ancho) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: 740 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  await pg.route("**/*", (route) => {
    const u = route.request().url();
    if (u.includes("fonts.googleapis.com")) {
      if (!hayFuentes) return route.fulfill({ status: 200, contentType: "text/css", body: "" });
      let css = "";
      for (const fam of ["Sora", "Inter"]) for (const w of [400, 600, 700]) css += `@font-face{font-family:'${fam}';font-weight:${w};src:url(/__f/${fam.toLowerCase()}/${w}.woff2) format('woff2');}\n`;
      return route.fulfill({ status: 200, contentType: "text/css", body: css });
    }
    const f = u.match(/\/__f\/(\w+)\/(\d+)\.woff2$/);
    if (f) return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(`${FUENTES}/node_modules/@fontsource/${f[1]}/files/${f[1]}-latin-${f[2]}-normal.woff2`) });
    return route.continue();
  });
  const errores = [];
  pg.on("pageerror", (e) => errores.push(String(e).slice(0, 160)));
  return { pg, ctx, errores };
}

const { pg: p0, ctx: c0 } = await pagina(320);
await p0.goto(BANCO);
await p0.waitForFunction(() => window.__PIEZAS);
const piezas = await p0.evaluate(() => window.__PIEZAS);
await c0.close();

const filas = [];
for (const ancho of [320, 375]) {
  for (const pieza of piezas) {
    const { pg, ctx, errores } = await pagina(ancho);
    await pg.goto(`${BANCO}?pieza=${encodeURIComponent(pieza)}`);
    await pg.waitForTimeout(900);
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(() => {
      const tarjeta = document.querySelector("[data-columna] section");
      if (!tarjeta) return null;
      const top = tarjeta.getBoundingClientRect().top;
      const alto = (el) => (el ? Math.round(el.getBoundingClientRect().height) : 0);
      const cab = tarjeta.querySelector(":scope > header");
      const enc = tarjeta.querySelector("[data-encabezado]");
      const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.opacity !== "0"; };
      const interactivos = [...tarjeta.querySelectorAll("button, [role=button], input, select, [draggable=true], [tabindex='0']")]
        .filter((el) => !el.closest("[data-como-se-juega]") && !el.matches("[data-como-se-juega]") && visible(el));
      const primera = interactivos.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
      /* La figura: el primer svg de verdad (más de 40 px de alto) o lo marcado como figura. */
      const figuras = [...tarjeta.querySelectorAll("svg, canvas, [data-figura]")]
        .filter((el) => !el.closest("[data-encabezado], header") && visible(el) && el.getBoundingClientRect().height > 40)
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      const fig = figuras[0];
      return {
        figura: fig ? Math.round(fig.getBoundingClientRect().top - top) : null,
        cabecera: alto(cab), encabezado: alto(enc),
        finEncabezado: enc ? Math.round(enc.getBoundingClientRect().bottom - top) : null,
        interaccion: primera ? Math.round(primera.getBoundingClientRect().top - top) : null,
        cual: primera ? (primera.textContent || primera.getAttribute("aria-label") || primera.tagName).trim().slice(0, 28) : null,
      };
    });
    filas.push({ ancho, pieza, ...(m ?? { error: "sin tarjeta" }), errores: errores.length ? errores[0] : "" });
    await ctx.close();
  }
}
console.log(hayFuentes ? "Fuentes: Inter y Sora de producción" : "Fuentes: respaldo del sistema (sin FUENTES)");
for (const f of filas) f.B1 = Math.min(f.figura ?? Infinity, f.interaccion ?? Infinity) <= 280 ? "sí" : "NO";
console.table(filas);
await nav.close();
await servidor.close();
