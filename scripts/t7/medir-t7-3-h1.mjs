/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE H1 DE T7-3 «DESCUENTO EN LA FACTURA» A 375 Y 320?
 *
 *   node scripts/t7/medir-t7-3-h1.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad: la vista de T7-3 en el modo Hacer, con H1 abierto y la
 * hoja de estilos del sitio (banco scripts/t7/harness-t7-3). Juega la tanda
 * entera —error en los ítems 2 y 4 y una línea mal en el asiento— y mide cada
 * ítem antes y después de responder (o de comprobar), y el cierre.
 * En cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni de la pantalla
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada opción y cada botón de Debe o Haber mida al menos 44 px de
 *     alto (objetivo táctil)
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const ANCHOS = [375, 320];
const { ITEMS_H1 } = await import("../../src/data/contabilidadT7_3_h1.js");

const FALLA = new Set(["iva", "ingresos-por-ventas", "asiento:anticipo"]);

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-t7-3/index.html#h1`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

function medir() {
  const raiz = document.getElementById("root");
  const problemas = [];
  const conTexto = [...raiz.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script"))
    /* Lo que solo oye el lector de pantalla («menos», «igual a») mide 1 px a propósito. */
    .filter((el) => !el.closest(".sr"))
    .filter((el) => { const e = getComputedStyle(el); return !(e.position === "absolute" && el.clientWidth <= 1); })
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > window.innerWidth + 0.5 || r.left < -0.5) problemas.push(`${nombre}: se sale de la pantalla`);
  }
  /* Patrón T7-3: en cada renglón, el rótulo no toca su cifra (salvo la cifra que baja a su propia línea). */
  for (const f of document.querySelectorAll("[data-renglon]")) {
    const rot = f.querySelector(".rg-rot").getBoundingClientRect();
    const v = f.querySelector(".rg-v").getBoundingClientRect();
    if (v.top < rot.bottom - 1 && rot.right > v.left - 4) problemas.push(`el renglón «${f.querySelector(".rg-rot").textContent}» toca su cifra`);
    if (v.right > f.getBoundingClientRect().right + 0.5) problemas.push(`la cifra «${f.querySelector(".rg-v").textContent}» se sale de su renglón`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  const toques = [...document.querySelectorAll("[data-opcion] button, [data-linea] button")].map((b) => b.getBoundingClientRect());
  for (const [k, r] of toques.entries()) if (r.height < 44) problemas.push(`el botón ${k + 1} mide ${r.height.toFixed(1)} px de alto`);
  const h1 = document.querySelector("[data-t7-3-h1]");
  return {
    problemas,
    actividad: h1 ? Math.round(h1.getBoundingClientRect().width * 10) / 10 : null,
    alto: Math.round(document.documentElement.scrollHeight),
    botonMasBajo: toques.length ? Math.round(Math.min(...toques.map((r) => r.height)) * 10) / 10 : null,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}

for (const ancho of ANCHOS) {
  const pg = await navegador.newPage({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector("[data-t7-3-h1]");
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `t7-3-h1-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`), fullPage: true });
  };
  for (const it of ITEMS_H1) {
    await estado(`${it.id}-antes`);
    if (it.tipo === "eleccion") {
      const v = FALLA.has(it.id) ? it.distractores[0].valor : it.correcta;
      await pg.click(`[data-opcion="${v}"] button`);
      await estado(`${it.id}-${FALLA.has(it.id) ? "error" : "acierto"}`);
    } else {
      for (const l of it.lineas) {
        const mal = FALLA.has(`${it.id}:${l.id}`);
        const lado = (l.lado === "debe") !== mal ? "Debe" : "Haber";
        await pg.click(`[data-linea="${l.id}"] button:text-is("${lado}")`);
      }
      await pg.click('button:text-is("Comprobar")');
      await estado(`${it.id}-comprobado`);
    }
    await pg.click("[data-t7-3-h1] ~ div button");
  }
  await estado("cierre");
  await pg.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | ancho de la actividad | alto de la página | botón más bajo");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.actividad ?? "—"} | ${f.alto} | ${f.botonMasBajo ?? "—"}`);
const estados = filas.length / ANCHOS.length;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
if (estados !== 11) fallos.push(`se recorrieron ${estados} estados y son 11`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: H1 de T7-3 cabe a 375 y a 320 px.");
