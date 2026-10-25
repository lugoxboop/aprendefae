/*
 * Mide el RankingFP a 320×568 y 375×667 en Chromium, con Inter y Sora de
 * verdad (#556). Uso:
 *   FUENTES=<carpeta con @fontsource/inter y @fontsource/sora> node scripts/ranking/medir.mjs
 * Sin FUENTES mide con las de respaldo del sistema y lo dice.
 *
 * Qué devuelve por ancho: el ancho más chico de un apodo (0 era el fallo), si
 * algún apodo se corta o se sale, el alto mínimo de los botones de ánimo y de
 * las pestañas, y si algo desborda en horizontal.
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

/* Los ánimos sin red: la mitad ya dados, cifras de 1 y 2 dígitos. */
const animos = { name: "animos-de-mentira", enforce: "pre", load(id) {
  if (id.endsWith("/src/social/animo.js")) return "export async function estadoDeAnimos(a){return Object.fromEntries((a??[]).map((n,i)=>[n,{recibidos:i%3===0?12:i,yaLeDi:i%2===0}]));}\nexport async function darAnimo(){return {ok:true};}\nexport async function animosRecibidos(){return [];}";
} };
const servidor = await createServer({ root: RAIZ, logLevel: "error", plugins: [animos], server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/ranking/banco/index.html`;

const nav = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const salida = [];
for (const [ancho, alto] of [[320, 568], [375, 667]]) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  await pg.route("**/*", (route) => {
    const u = route.request().url();
    if (u.includes("fonts.googleapis.com")) {
      if (!hayFuentes) return route.fulfill({ status: 200, contentType: "text/css", body: "" });
      let css = "";
      for (const [fam, ws] of [["Sora", [400, 600, 700]], ["Inter", [400, 600, 700]]]) for (const w of ws) css += `@font-face{font-family:'${fam}';font-weight:${w};src:url(/__f/${fam.toLowerCase()}/${w}.woff2) format('woff2');}\n`;
      return route.fulfill({ status: 200, contentType: "text/css", body: css });
    }
    if (u.includes("/__f/")) {
      const [fam, w] = u.split("/__f/")[1].split("/");
      return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(`${FUENTES}/node_modules/@fontsource/${fam}/files/${fam}-latin-${w.split(".")[0]}-normal.woff2`) });
    }
    return route.continue();
  });
  await pg.goto(BANCO);
  await pg.waitForSelector("[data-fila-ranking]", { timeout: 120000 });
  await pg.waitForSelector("[data-boton-animo]", { timeout: 30000 });
  await pg.evaluate(() => document.fonts.ready);
  salida.push({ ancho, alto, fuentes: hayFuentes ? "Inter y Sora de producción" : "respaldo del sistema", ...(await pg.evaluate(() => {
    const caja = (e) => e.getBoundingClientRect();
    const apodos = [...document.querySelectorAll("[data-apodo]")];
    const botones = [...document.querySelectorAll("[data-boton-animo]")];
    const pestanas = [...document.querySelectorAll('[aria-label="Periodo del ranking"] button')];
    const grupo = document.querySelector('[aria-label="Periodo del ranking"]');
    const tarjeta = grupo.parentElement;
    return {
      filas: apodos.length,
      apodoMasAngosto: Math.round(Math.min(...apodos.map((a) => caja(a).width))),
      apodosCortadosOSalidos: apodos.filter((a) => a.scrollWidth > a.clientWidth + 1 || caja(a).right > caja(a.closest("[data-fila-ranking]")).right + 0.5).length,
      apodosEnVariasLineas: apodos.filter((a) => caja(a).height > 26).map((a) => a.textContent),
      botonesAnimo: botones.length,
      altoMinBotonAnimo: Math.round(Math.min(...botones.map((b) => caja(b).height))),
      altoMinPestana: Math.round(Math.min(...pestanas.map((b) => caja(b).height))),
      pestanasPartidas: pestanas.filter((b) => caja(b).height > 46).map((b) => b.textContent),
      pestanasSeSalen: Math.round(caja(grupo).right - (caja(tarjeta).right - parseFloat(getComputedStyle(tarjeta).paddingRight))),
      desbordeHorizontal: document.documentElement.scrollWidth > innerWidth,
    };
  })) });
  await ctx.close();
}
console.log(JSON.stringify(salida, null, 2));
await nav.close();
await servidor.close();
