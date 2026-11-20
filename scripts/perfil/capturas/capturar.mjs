import { createServer } from "vite";
import { createRequire } from "node:module";
import { resolve } from "node:path";
/*
 * node scripts/perfil/capturas/capturar.mjs <carpeta-salida> [prefijo]
 * Captura «Tu perfil» a 320, 375 y escritorio con datos fingidos: 9 medallas
 * ganadas, resumen de semestre, 4 ánimos y un ranking de diez.
 */
const RAIZ = resolve(import.meta.dirname, "../../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const out = process.argv[2];
const pre = process.argv[3] ?? "";
import { fingir } from "./plugin.mjs";
const s = await createServer({ root: RAIZ, logLevel: "error", plugins: [fingir], server: { port: 0, host: "127.0.0.1" } });
await s.listen();
const base = `http://127.0.0.1:${s.httpServer.address().port}/scripts/perfil/capturas/index.html`;
const nav = await chromium.launch();
const casos = [
  ["movil320", 320, 700, "?especie=gato&paleta=gris&apodo=Isabella_Martínez&mascota=Bigotes"],
  ["movil375", 375, 812, "?especie=zorro&puestos=gafas"],
  ["escritorio", 1280, 900, "?especie=zorro&puestos=gafas"],
];
for (const [nombre, w, h, qs] of casos) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const pg = await ctx.newPage();
  pg.on("pageerror", (e) => console.log("ERROR", e.message));
  await pg.goto(base + qs);
  await pg.waitForSelector("[data-apodo]", { timeout: 120000 });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(2000);
  await pg.screenshot({ path: `${out}/${pre}${nombre}.png`, fullPage: true });
  await pg.screenshot({ path: `${out}/${pre}${nombre}-pantalla.png` });
  const ancho = await pg.evaluate(() => document.documentElement.scrollWidth);
  console.log(nombre, "scrollWidth", ancho, "viewport", w);
  await ctx.close();
}
await nav.close(); await s.close();
