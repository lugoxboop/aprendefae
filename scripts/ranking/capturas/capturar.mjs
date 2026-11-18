import { createServer } from "vite";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const RAIZ = resolve(import.meta.dirname, "../../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const pref = process.argv[2], out = process.argv[3];
const animos = { name: "animos", enforce: "pre", load(id) {
  if (id.endsWith("/src/social/animo.js")) return "export async function estadoDeAnimos(a){return Object.fromEntries((a??[]).map((n,i)=>[n,{recibidos:[16,10,4,13,5,8,2,7,3,1][i%10],yaLeDi:i%3===1}]));}\nexport async function darAnimo(){return 'nuevo';}\nexport async function animosRecibidos(){return [];}";
} };
const s = await createServer({ root: RAIZ, logLevel: "error", plugins: [animos], server: { port: 0, host: "127.0.0.1" } });
await s.listen();
const base = `http://127.0.0.1:${s.httpServer.address().port}/scripts/ranking/capturas/index.html`;
const nav = await chromium.launch();
for (const [nombre, w, h, qs] of [["movil", 375, 812, ""], ["movil320", 320, 700, ""], ["escritorio", 1280, 900, ""], ["movil-tu-en-podio", 375, 812, "?tu=2"]]) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const pg = await ctx.newPage();
  await pg.goto(base + qs);
  await pg.waitForSelector("[data-fila-ranking]", { timeout: 120000 });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(1200);
  await pg.screenshot({ path: `${out}/${pref}-${nombre}.png`, fullPage: true });
  const ancho = await pg.evaluate(() => document.documentElement.scrollWidth);
  console.log(nombre, "scrollWidth", ancho, "viewport", w);
  await ctx.close();
}
await nav.close(); await s.close();
