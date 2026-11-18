/*
 * El panel docente CON curso (el falso de scripts/t4/panel-docente): mide si la
 * cuenta flotante pisa algo de la página —cabecera, título, tarjetas— y deja
 * capturas. Nació del reporte de Mateo del 18-nov: el globo «Panel docente»
 * se quedaba encima de las tarjetas.
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/cuenta/panel-docente-real.mjs http://localhost:8099 carpeta
 */
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { abrirPanel, chromium } from "../t4/panel-docente/pagina.mjs";

const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const SALIDA = process.argv[3] ?? "capturas";
mkdirSync(SALIDA, { recursive: true });
const nav = await chromium.launch();
let choques = 0;
for (const [ancho, alto] of [[1280, 800], [1024, 768], [768, 1024], [375, 667], [320, 568]]) {
  const { ctx, page } = await abrirPanel(nav, { url: URL_BASE, ancho, alto });
  await page.waitForSelector(".fae-cuenta-boton", { timeout: 20000 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const flotan = [...document.querySelectorAll(".fae-cuenta-boton, .fae-atajo-pastilla")].map((e) => e.getBoundingClientRect());
    const pisa = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    /* Todo lo visible de la página que no es el control flotante. */
    const hojas = [...document.querySelectorAll("h1, h2, h3, p, button, a, [data-tarjeta], section")]
      .filter((e) => !e.closest(".fae-cuenta-boton") && !e.closest("[style*='position: fixed']"))
      .map((e) => ({ t: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 30), r: e.getBoundingClientRect() }))
      .filter((x) => x.r.width > 0 && x.r.height > 0);
    const golpes = [];
    for (const f of flotan) for (const h of hojas) if (pisa(f, h.r)) golpes.push(h.t);
    return { flotantes: flotan.length, golpes, barra: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  choques += r.golpes.length;
  console.log(JSON.stringify({ ancho, ...r }));
  await page.screenshot({ path: join(SALIDA, `panel-docente-${ancho}.png`) });
  await ctx.close();
}
await nav.close();
process.exit(choques ? 1 : 0);
