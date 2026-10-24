/*
 * Condición (e) de Shibukawa en #498: con el motivo de B2 en dos renglones, el
 * «51 %» y «Acierto medio» de B3 siguen a la vista sin bajar a 375×667 (P1).
 * Mide y deja dos capturas reducidas (JPEG a 1×) en capturas-v1/.
 *
 *   node scripts/t4/panel-docente/verificacion-498e.mjs [http://localhost:8099]
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirPanel, chromium, hayFuentes, RAIZ } from "./pagina.mjs";

const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const DIR = join(RAIZ, "orquestador/revisiones/panel-docente");
if (!hayFuentes()) { console.error("faltan las fuentes"); process.exit(2); }
const nav = await chromium.launch();
const R = {};
let falla = false;
for (const escenario of ["normal", "grande"]) {
  const { ctx, page, errores } = await abrirPanel(nav, { url: URL_BASE, escenario, ancho: 375, alto: 667 });
  await page.waitForSelector("[data-cifra=peor-pct]", { timeout: 30000 });
  await page.waitForTimeout(400);
  R[`${escenario}-375x667`] = await page.evaluate(() => {
    const V = innerHeight;
    const caja = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), aLaVista: r.top >= 0 && r.bottom <= V }; };
    const rot = [...document.querySelectorAll("[data-bloque=b3] span")].find((s) => s.textContent.trim() === "Acierto medio");
    return { V, pct: caja(document.querySelector("[data-cifra=peor-pct]")), aciertoMedio: caja(rot), filasB2: document.querySelectorAll("[data-bloque=b2] [data-atencion]").length, verLos: document.querySelector("[data-ver-atencion]")?.textContent };
  });
  R[`${escenario}-375x667`].errores = errores;
  if (!(R[`${escenario}-375x667`].pct?.aLaVista && R[`${escenario}-375x667`].aciertoMedio?.aLaVista)) falla = true;
  await page.screenshot({ path: join(DIR, "capturas-v1", `${escenario}-375x667-498e.jpg`), type: "jpeg", quality: 60 });
  await ctx.close();
}
await nav.close();
writeFileSync(join(DIR, "verificacion-498e.json"), JSON.stringify(R, null, 2) + "\n");
console.log(JSON.stringify(R));
process.exit(falla ? 1 : 0);
