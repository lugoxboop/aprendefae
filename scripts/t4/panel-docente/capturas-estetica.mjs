/*
 * Capturas del panel docente con la estética de la barra lateral de la cuenta
 * (18-nov). Inicio a 320, 375 y 1280, página entera, con el curso normal.
 *
 *   node scripts/t4/panel-docente/capturas-estetica.mjs <carpeta> [http://localhost:8099]
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { abrirPanel, chromium, hayFuentes } from "./pagina.mjs";

const DIR = process.argv[2];
const URL_BASE = process.argv[3] ?? "http://localhost:8099";
if (!DIR || !hayFuentes()) { console.error("uso: <carpeta>; y fuentes.sh antes"); process.exit(2); }
mkdirSync(DIR, { recursive: true });
const nav = await chromium.launch();
const R = {};
for (const ancho of [320, 375, 1280]) {
  const { ctx, page, errores } = await abrirPanel(nav, { url: URL_BASE, escenario: "normal", ancho, alto: ancho > 800 ? 800 : 667 });
  await page.waitForSelector("[data-cifra=peor-pct]", { timeout: 30000 });
  await page.waitForTimeout(500);
  R[ancho] = await page.evaluate(() => ({ desborde: document.documentElement.scrollWidth - innerWidth }));
  R[ancho].errores = errores;
  await page.screenshot({ path: join(DIR, `inicio-${ancho}.png`), fullPage: true });
  await ctx.close();
}
await nav.close();
console.log(JSON.stringify(R));
