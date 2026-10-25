/*
 * ¿CABE LA BANDA DE DECORACIÓN EN LAS TABLAS DE POSICIONES? (Hanayama, 24-oct-2026)
 *   BANDA=1 node scripts/decoracion/medir-tablas-hanayama.mjs > medidas.json
 * Monta RankingFP y LigaBoard tal cual en harness-ranking (Chromium; Inter y Sora de
 * .sonda-fuentes) a 320×568 y 375×667, en cada estado y materia, con los ánimos
 * forzados en las filas ajenas (sustituto de social/animo.js). Con BANDA=1 inserta,
 * tras la cabecera de cada tabla, la banda de vida-visual-v1 §7: 56 px por debajo de
 * 375 y 72 desde 375, con 14 px debajo. Saca por tabla, en coordenadas de la página:
 * su caja, la cabecera, la banda, el alto del título, la fila «tú» (caja del apodo y
 * ancho real de su texto) y cuántos apodos salen cortados.
 *
 * Nota de Yujiro: el banco (scripts/decoracion/harness-ranking/) solo existe en la copia
 * de Hanayama. Quien construya la decoración monta el suyo con los casos de CASOS.
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const FUENTES = resolve(RAIZ, "scripts/t4/sonda-enganche/.sonda-fuentes");
const hayFuentes = existsSync(`${FUENTES}/fontsource-inter-5.3.0`);
const sustituto = { name: "animos-de-mentira", enforce: "pre", load(id) { if (id.endsWith("/src/social/animo.js")) return "export async function estadoDeAnimos(a){return Object.fromEntries((a??[]).map((n,i)=>[n,{recibidos:i%3===0?12:i,yaLeDi:i%2===0}]));}\nexport async function darAnimo(){return {ok:true};}\nexport async function animosRecibidos(){return [];}"; } };
const servidor = await createServer({ root: RAIZ, logLevel: "error", plugins: [sustituto], server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/decoracion/harness-ranking/index.html`;
const nav = await chromium.launch();
const ruta = (pg) => pg.route("**/*", (route) => {
  const u = route.request().url();
  if (hayFuentes && u.includes("/__f/")) { const [fam, w] = u.split("/__f/")[1].split("/"); const base = fam === "Sora" ? `${FUENTES}/fontsource-sora-5.3.0/package/files/sora-latin-` : `${FUENTES}/fontsource-inter-5.3.0/package/files/inter-latin-`; return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(`${base}${w.split(".")[0]}-normal.woff2`) }); }
  if (hayFuentes && u.includes("fonts.googleapis.com")) { let css = ""; for (const [fam, ws] of [["Sora", [300, 400, 600, 700, 800]], ["Inter", [400, 500, 600, 700]]]) for (const w of ws) css += `@font-face{font-family:'${fam}';font-weight:${w};src:url(/__f/${fam}/${w}.woff2) format('woff2');}\n`; return route.fulfill({ status: 200, contentType: "text/css", body: css }); }
  return route.continue();
});
const BANDA = Boolean(process.env.BANDA);
const medir = () => {
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top + scrollY), Math.round(b.width), Math.round(b.height)]; };
  return [...document.querySelectorAll("[data-columna] > *")].map((T) => {
    const liga = T.tagName === "SECTION";
    const cab = liga ? T.querySelector("header") : T.children[0];
    const apodos = [...T.querySelectorAll("span")].filter((s) => getComputedStyle(s).textOverflow === "ellipsis");
    const tu = apodos.find((s) => /tú/.test(s.textContent) || s.querySelector("span"));
    const g = document.createRange(); if (tu) g.selectNodeContents(tu);
    return { tabla: liga ? "liga" : "ranking", caja: r(T), cabecera: r(cab), titulo: r(T.querySelector("h3")), banda: r(T.querySelector("[data-banda]")),
      tu: tu ? { caja: r(tu), texto: Math.round(g.getBoundingClientRect().width) } : null,
      cortados: apodos.filter((s) => s.scrollWidth > s.clientWidth + 1).length, apodos: apodos.length, desbordeX: document.documentElement.scrollWidth > innerWidth };
  });
};
const CASOS = [
  ...["sin-sesion", "n0", "n1", "n3", "n10", "n10-fuera"].flatMap((e) => ["conta", "macro", "est", "general"].map((m) => `r:${e}:${m}`)),
  ...["sin-sesion", "vacia", "sin-niveles", "normal", "ascenso", "ascenso2", "reparto", "elite"].map((e) => `l:${e}:est`),
  "p:n10:est", "p:n3:est",
];
const out = [];
for (const [w, hh] of [[320, 568], [375, 667]]) {
  const ctx = await nav.newContext({ viewport: { width: w, height: hh }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage(); await ruta(pg);
  for (const c of CASOS) {
    await pg.goto(`${BANCO}#${c}`); await pg.reload(); await pg.waitForSelector("[data-columna] > *", { timeout: 120000 }); await pg.waitForTimeout(600);
    await pg.evaluate(() => document.fonts.ready);
    if (BANDA) await pg.evaluate(() => { for (const T of document.querySelectorAll("[data-columna] > *")) { const cab = T.tagName === "SECTION" ? T.querySelector("header") : T.children[0]; const b = document.createElement("div"); b.dataset.banda = ""; b.style.cssText = `height:${innerWidth < 375 ? 56 : 72}px;margin-bottom:14px`; cab.after(b); } });
    out.push({ ancho: w, alto: hh, caso: c, tablas: await pg.evaluate(medir) });
  }
  await ctx.close();
}
console.log(JSON.stringify(out));
await nav.close(); await servidor.close();
