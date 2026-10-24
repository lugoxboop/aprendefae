/*
 * Textos del lote 4 de Katsumi en el panel (feat/conta-d4-panel-textos): dos
 * capturas reducidas (JPEG a 1×) a 375×667, el resumen del curso normal y la
 * vista de un estudiante, y la comprobación de que B3 sigue a la vista (P1).
 *
 *   node scripts/t4/panel-docente/capturas-textos.mjs [http://localhost:8099]
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirPanel, chromium, hayFuentes, RAIZ } from "./pagina.mjs";

const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const DIR = join(RAIZ, "orquestador/revisiones/panel-docente");
if (!hayFuentes()) { console.error("faltan las fuentes"); process.exit(2); }
const nav = await chromium.launch();
const { ctx, page, errores } = await abrirPanel(nav, { url: URL_BASE, escenario: "normal", ancho: 375, alto: 667 });
await page.waitForSelector("[data-cifra=peor-pct]", { timeout: 30000 });
await page.waitForTimeout(400);
const R = await page.evaluate(() => {
  const vista = (el) => { const r = el?.getBoundingClientRect(); return r ? r.top >= 0 && r.bottom <= innerHeight : null; };
  return {
    enlaces: [...document.querySelectorAll("[data-ver-atencion], [data-ver-destacados]")].map((b) => b.textContent.trim()),
    peorPctALaVista: vista(document.querySelector("[data-cifra=peor-pct]")),
  };
});
await page.screenshot({ path: join(DIR, "capturas-v1", "normal-375x667-textos.jpg"), type: "jpeg", quality: 60 });
await page.click("[data-atencion]");
await page.waitForSelector("[data-vista=estudiante]");
await page.waitForTimeout(500);
R.estudiante = await page.evaluate(() => ({ rotulo: document.querySelector("[data-rotulo-estudiante]")?.textContent, nombre: document.querySelector("#pd1-est")?.textContent }));
await page.screenshot({ path: join(DIR, "capturas-v1", "vista-estudiante-375x667-textos.jpg"), type: "jpeg", quality: 60 });
R.errores = errores;
await ctx.close(); await nav.close();
writeFileSync(join(DIR, "capturas-textos.json"), JSON.stringify(R, null, 2) + "\n");
console.log(JSON.stringify(R));
