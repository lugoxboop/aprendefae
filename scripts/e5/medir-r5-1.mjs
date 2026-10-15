/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE r5-1 «REPASO CRUZADO» A 375 Y 320? (Célula E)
 *
 *   node scripts/e5/medir-r5-1.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad: la vista del Repaso del capítulo 5 con r5-1 abierta y
 * la hoja de estilos del sitio (banco scripts/e5/harness-r5). Juega la tanda
 * entera —error en C.5 con la opción d, que pone «Gasto provisiones – cuentas
 * incobrables» en el renglón sangrado del haber, y error en C.9— y mide cada
 * pantalla antes y después de responder, y el cierre. En cada estado:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni de la pantalla
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada opción y «Siguiente» midan al menos 44 px de alto
 *   · el ancho del contenido (343 a 375, 288 a 320, dice el paquete)
 *   · en C.5, el renglón de «Gasto provisiones – cuentas incobrables» dentro
 *     de su opción; en C.9, la fila de 10 cajas (147 px) dentro de su bloque
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
const CONTENIDO = { 375: 343, 320: 288 };
const { PANTALLAS_R5_1 } = await import("../../src/data/repasoCap5Cruzado.js");

const ELIGE = { c5: "c5-d", c9: "c9-b" };
const GASTO = "Gasto provisiones – cuentas incobrables";

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/e5/harness-r5/index.html#r5-1`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

function medir(gasto) {
  const raiz = document.getElementById("root");
  const problemas = [];
  const conTexto = [...raiz.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script"))
    .filter((el) => { const e = getComputedStyle(el); return !(e.position === "absolute" && el.clientWidth <= 1); })
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > window.innerWidth + 0.5 || r.left < -0.5) problemas.push(`${nombre}: se sale de la pantalla`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  const toques = [...document.querySelectorAll("[data-opcion] button, [data-siguiente]")].map((b) => b.getBoundingClientRect());
  for (const [k, r] of toques.entries()) if (r.height < 44) problemas.push(`el botón ${k + 1} mide ${r.height.toFixed(1)} px de alto`);

  /* Lo que el paquete pide medir a 320. */
  let renglonGasto = null;
  for (const op of document.querySelectorAll("[data-opcion]")) {
    for (const rg of op.querySelectorAll("[data-renglon]")) {
      if (rg.textContent !== gasto) continue;
      const a = rg.getBoundingClientRect();
      const b = op.querySelector("button").getBoundingClientRect();
      if (a.right > b.right - 15 + 0.5 || rg.scrollWidth > rg.clientWidth + 0.5) problemas.push(`el renglón «${gasto}» (${rg.dataset.renglon}) se sale de su opción`);
      renglonGasto = Math.max(renglonGasto ?? 0, Math.round(a.width * 10) / 10);
    }
  }
  let cajas = null;
  const diez = document.querySelector('[data-cajas="10"]');
  if (diez) {
    const bloque = document.querySelector('[data-datos="lotes"]');
    const est = getComputedStyle(bloque);
    const util = bloque.clientWidth - parseFloat(est.paddingLeft) - parseFloat(est.paddingRight);
    const fila = [...diez.children].reduce((s, c, k) => s + c.getBoundingClientRect().width + (k ? 3 : 0), 0);
    cajas = `${Math.round(fila)} de ${Math.round(util)}`;
    if (fila > util + 0.5) problemas.push(`la fila de 10 cajas mide ${fila} px en ${util}`);
  }
  const act = document.querySelector("[data-r5-1]");
  return {
    problemas,
    actividad: act ? Math.round(act.getBoundingClientRect().width * 10) / 10 : null,
    alto: Math.round(document.documentElement.scrollHeight),
    botonMasBajo: toques.length ? Math.round(Math.min(...toques.map((r) => r.height)) * 10) / 10 : null,
    renglonGasto,
    cajas,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}

for (const ancho of ANCHOS) {
  const pg = await navegador.newPage({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await pg.emulateMedia({ reducedMotion: "reduce" });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector("[data-r5-1]");
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, GASTO);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (m.actividad !== null && Math.abs(m.actividad - CONTENIDO[ancho]) > 0.5) fallos.push(`${ancho} px · ${nombre} · el contenido mide ${m.actividad} y son ${CONTENIDO[ancho]}`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `r5-1-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`), fullPage: true });
  };
  for (const p of PANTALLAS_R5_1) {
    await estado(`${p.id}-antes`);
    const id = ELIGE[p.id] ?? p.opciones.find((o) => o.correcta).id;
    await pg.click(`[data-opcion="${id}"] button`);
    await estado(`${p.id}-${ELIGE[p.id] ? "error" : "acierto"}`);
    await pg.click("[data-siguiente]");
  }
  await pg.waitForSelector("[data-cierre]");
  await estado("cierre");
  await pg.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | contenido | alto | botón más bajo | renglón «Gasto…» | 10 cajas");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.actividad ?? "—"} | ${f.alto} | ${f.botonMasBajo ?? "—"} | ${f.renglonGasto ?? "—"} | ${f.cajas ?? "—"}`);
const estados = filas.length / ANCHOS.length;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
if (estados !== 13) fallos.push(`se recorrieron ${estados} estados y son 13`);
if (!filas.some((f) => f.ancho === 320 && f.renglonGasto)) fallos.push("no se midió el renglón de «Gasto provisiones – cuentas incobrables» a 320");
if (!filas.some((f) => f.ancho === 320 && f.cajas)) fallos.push("no se midió la fila de 10 cajas a 320");
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: r5-1 cabe a 375 y a 320 px.");
