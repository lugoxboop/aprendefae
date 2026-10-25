/*
 * Textos del lote 4 de Katsumi en el panel (feat/conta-d4-panel-textos): dos
 * capturas reducidas (JPEG a 1×) a 375×667, el resumen del curso normal y la
 * vista de un estudiante, y la comprobación de que B3 sigue a la vista (P1)
 * y de que ningún elemento tocable mide menos de 44 × 44 (P9; condición de
 * Shibukawa en #525).
 *
 *   node scripts/t4/panel-docente/capturas-textos.mjs [http://localhost:8099]
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirPanel, chromium, hayFuentes, RAIZ } from "./pagina.mjs";

const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const DIR = join(RAIZ, "orquestador/revisiones/panel-docente");
if (!hayFuentes()) { console.error("faltan las fuentes"); process.exit(2); }
/* Los tocables visibles de menos de 44 px de ancho o de alto, en toda la vista. */
const chicos = () => [...document.querySelectorAll([".pd1", ".pd1-barra"].flatMap((r) => ["button", "a[href]", "input", "select", "[role=button]", "[tabindex='0']"].map((x) => `${r} ${x}`)).join(", "))]
  .map((el) => {
    const r = el.getBoundingClientRect();
    /* La zona de toque que agranda global.css con un ::after (el logo de la barra: 26 × 26 dibujado, 44 × 44 de toque). */
    const d = getComputedStyle(el, "::after");
    const extra = d.content !== "none" && d.position === "absolute" ? [parseFloat(d.width) || 0, parseFloat(d.height) || 0] : [0, 0];
    return { el: (el.getAttribute("aria-label") ?? el.textContent).trim().slice(0, 40), w: Math.round(Math.max(r.width, extra[0])), h: Math.round(Math.max(r.height, extra[1])), visible: r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden" };
  })
  .filter((x) => x.visible && (x.w < 43.5 || x.h < 43.5));
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
R.tocablesBajo44 = await page.evaluate(chicos);
await page.screenshot({ path: join(DIR, "capturas-v1", "normal-375x667-textos.jpg"), type: "jpeg", quality: 60 });
await page.click("[data-atencion]");
await page.waitForSelector("[data-vista=estudiante]");
await page.waitForTimeout(500);
await page.waitForFunction(() => !/Cargando…/.test(document.querySelector("[data-vista=estudiante]").textContent));
R.estudiante = await page.evaluate(() => {
  const fp = [...document.querySelectorAll("[data-vista=estudiante] p")].find((p) => p.textContent.trim() === "FP ESTE CICLO")?.nextElementSibling;
  return { rotulo: document.querySelector("[data-rotulo-estudiante]")?.textContent, nombre: document.querySelector("#pd1-est")?.textContent, alerta: [...document.querySelectorAll("[data-vista=estudiante] p")].find((p) => /^(Urgente|Atención|Informativa) · /.test(p.textContent))?.textContent, colorFpCiclo: fp ? getComputedStyle(fp).color : null };
});
R.estudiante.tocablesBajo44 = await page.evaluate(chicos);
await page.screenshot({ path: join(DIR, "capturas-v1", "vista-estudiante-375x667-textos.jpg"), type: "jpeg", quality: 60 });
R.errores = errores;
await ctx.close(); await nav.close();
writeFileSync(join(DIR, "capturas-textos.json"), JSON.stringify(R, null, 2) + "\n");
console.log(JSON.stringify(R));
process.exit(R.tocablesBajo44.length + R.estudiante.tocablesBajo44.length === 0 ? 0 : 1);
