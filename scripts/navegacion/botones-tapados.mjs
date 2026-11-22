/*
 * Botones TAPADOS: visibles pero con otra cosa encima de su centro, así que un
 * toque ahí no llega. Por pantalla y dentro del menú de cuenta abierto.
 *   node scripts/navegacion/botones-tapados.mjs http://localhost:8100 [rutas,separadas,por,coma]
 */
import { chromium, abrir, tapados } from "./base.mjs";
const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const RUTAS = process.argv[3] ? process.argv[3].split(",") : ["", "#/macroeconomia", "#/contabilidad", "#/pensamiento-estrategico", "#/introduccion-contabilidad", "#/perfil", "#/tienda", "#/amigos", "#/vivo", "#/docente", "#/que-es"];
const nav = await chromium.launch();
for (const [w,h] of [[375,667],[1280,800]]) for (const ruta of RUTAS) {
  const { ctx, page } = await abrir(nav, URL_BASE, w, h, ruta);
  const t = await page.evaluate(tapados);
  /* ¿Hay una forma visible de llegar al inicio (o a la materia) sin el menú? */
  const salida = await page.evaluate(() => [...document.querySelectorAll("button")].filter(b => { const r=b.getBoundingClientRect(); return r.width>0 && r.top < 140 && getComputedStyle(b).visibility!=="hidden"; }).map(b => (b.getAttribute("aria-label")||b.textContent).trim().slice(0,30)));
  const hayCuenta = await page.$(".fae-cuenta-boton"); if (hayCuenta) { await page.click(".fae-cuenta-boton", {timeout:4000}).catch(()=>{}); await page.waitForTimeout(1200); }
  const tp = (await page.$("[data-panel-cuenta]")) ? await page.evaluate(tapados, "[data-panel-cuenta]") : "SIN MENÚ";
  console.log(`${w} ${ruta||"inicio"} | arriba: ${JSON.stringify(salida)} | tapados: ${JSON.stringify(t)} | en menú: ${JSON.stringify(tp)}${page.errores.length? " | ERRORES "+page.errores.join(";"):""}`);
  await ctx.close();
}
await nav.close();
