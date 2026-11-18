/*
 * Las vistas internas del panel docente (18-nov, rediseño de Mateo): cada una
 * a 375 y 1280, página entera, con el curso normal. Mide además el desborde
 * horizontal y los tocables por debajo de 44 px en cada vista.
 *
 *   node scripts/t4/panel-docente/capturas-vistas.mjs <carpeta> [http://localhost:8099]
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { abrirPanel, chromium, hayFuentes } from "./pagina.mjs";

const DIR = process.argv[2];
const URL_BASE = process.argv[3] ?? "http://localhost:8099";
if (!DIR || !hayFuentes()) { console.error("uso: <carpeta>; y fuentes.sh antes"); process.exit(2); }
mkdirSync(DIR, { recursive: true });

const chicos = () => [...document.querySelectorAll(".pd1 button, .pd1 a[href], .pd1 input, .pd1 select")]
  .map((el) => { const r = el.getBoundingClientRect(); return { t: (el.getAttribute("aria-label") ?? el.textContent).trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height), v: r.width > 0 && r.height > 0 }; })
  .filter((x) => x.v && (x.w < 43.5 || x.h < 43.5));

/* [nombre, cómo se llega desde la portada, qué esperar] */
const VISTAS = [
  ["riesgo", "[data-ir=riesgo]", "[data-vista=riesgo], [data-bloque=riesgo-todo], h2, h1"],
  ["estudiantes", "[data-ir=estudiantes]", "#pd1-estudiantes, [data-vista=estudiantes]"],
  ["estudiante", "[data-atencion]", "[data-vista=estudiante]"],
  ["actividades", "[data-ir=actividades]", "[data-vista=actividades], #pd1-actividades, [data-actividad]"],
  ["esfuerzo", "[data-ir=esfuerzo]", "[data-vista=esfuerzo]"],
  ["clase", "[data-ir=clase]", "[data-vista=clase]"],
  ["atencion", "[data-ver-destacados]", "[data-vista=atencion]"],
  ["fabrica", "[data-ir=fabrica]", "[data-vista=fabrica], [data-fabrica]"],
];

const nav = await chromium.launch();
const R = {};
for (const ancho of [375, 1280]) {
  for (const [nombre, entrar, esperar] of VISTAS) {
    const { ctx, page, errores } = await abrirPanel(nav, { url: URL_BASE, escenario: "normal", ancho, alto: ancho > 800 ? 800 : 667 });
    await page.waitForSelector("[data-ir=clase]", { timeout: 30000 });
    await page.click(entrar);
    await page.waitForSelector(esperar, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(900);
    R[`${nombre}-${ancho}`] = { desborde: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), chicos: await page.evaluate(chicos), errores };
    await page.screenshot({ path: join(DIR, `${nombre}-${ancho}.png`), fullPage: true });
    await ctx.close();
  }
}
await nav.close();
console.log(JSON.stringify(R));
