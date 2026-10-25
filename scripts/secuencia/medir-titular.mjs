/*
 * El ancho útil del titular de SecuenciaAprender a 320 y 375 px (#564, Ukyo):
 * con ese número la tabla de #513 da el tope de caracteres de dos renglones.
 *   FUENTES=<carpeta con @fontsource/inter y sora> node scripts/secuencia/medir-titular.mjs
 * Mide el content-box del <h2> (sin padding) y, de paso, cuántos renglones
 * ocupa cada titular real de la pieza.
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const FUENTES = process.env.FUENTES;
const hayFuentes = Boolean(FUENTES) && existsSync(`${FUENTES}/node_modules/@fontsource/sora`);

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/secuencia/banco/index.html`;
const nav = await chromium.launch();
console.log(hayFuentes ? "Fuentes: Inter y Sora de producción" : "Fuentes: respaldo del sistema (sin FUENTES)");
for (const ancho of [320, 375]) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: 740 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
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
  await pg.goto(BANCO);
  await pg.waitForSelector(".fae-sec-titular");
  await pg.evaluate(() => document.fonts.ready);
  const filas = [];
  for (let k = 0; k < 12; k++) {
    const m = await pg.evaluate(() => {
      const h = document.querySelector(".fae-sec-titular");
      const s = getComputedStyle(h);
      const util = h.getBoundingClientRect().width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
      return { util: Math.round(util * 10) / 10, renglones: Math.round(h.getBoundingClientRect().height / parseFloat(s.lineHeight)), largo: h.textContent.length, texto: h.textContent.slice(0, 40) };
    });
    filas.push(m);
    const sig = await pg.$("[data-sec-avanzar], .fae-sec-nav:last-of-type");
    const antes = await pg.evaluate(() => document.querySelector(".fae-sec-titular")?.textContent);
    if (!sig || await sig.isDisabled()) break;
    await sig.click().catch(() => {});
    await pg.waitForTimeout(150);
    if (antes === await pg.evaluate(() => document.querySelector(".fae-sec-titular")?.textContent)) break;
  }
  console.log(`\n${ancho} px — ancho útil del titular: ${[...new Set(filas.map((f) => f.util))].join(", ")} px`);
  console.table(filas);
  await ctx.close();
}
await nav.close();
await servidor.close();
