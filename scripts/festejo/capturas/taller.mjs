import { createServer } from "vite";
import { createRequire } from "node:module";
import { resolve } from "node:path";
/*
 * node scripts/festejo/capturas/taller.mjs <salida.png> "<query>" [ms...]
 * Las seis especies grandes, congeladas en los instantes pedidos (una
 * captura por instante: salida-<ms>.png). Para revisar piezas de cerca.
 */
const RAIZ = resolve(import.meta.dirname, "../../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const [salida, qs = "", ...tiempos] = process.argv.slice(2);
const s = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await s.listen();
const base = `http://127.0.0.1:${s.httpServer.address().port}/scripts/festejo/capturas/index.html?vista=taller&`;
const nav = await chromium.launch();
const pg = await (await nav.newContext({ viewport: { width: 960, height: 760 }, deviceScaleFactor: Number(process.env.ESCALA ?? 1) })).newPage();
await pg.goto(base + qs);
await pg.waitForSelector("svg image", { timeout: 120000 });
await pg.waitForTimeout(1500);
for (const t of tiempos.length ? tiempos : ["0"]) {
  await pg.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), Number(t));
  await pg.waitForTimeout(150);
  await pg.screenshot({ path: salida.replace(/\.png$/, `-${t}.png`), fullPage: true });
}
await nav.close(); await s.close();
