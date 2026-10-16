/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE T7-2 · A1 «LA CUENTA QUE SÍ SE MUEVE» (C2, renovada) A 320, 375 Y 1280?
 *
 *   FUENTES_DIR=/carpeta/con/fuentes.css CHROMIUM_PATH=… \
 *     node scripts/t7/medir-t7-2-a1.mjs [carpeta-de-capturas]
 *
 * Como medir-t7-1-ap1.mjs: Chromium de verdad, la vista de T7-2 montada tal
 * cual con la hoja del sitio (banco scripts/t7/harness-t7-2). Juega A1 entera
 * —en los lados, la pista, la devolución y el acierto; en las pantallas 3 y
 * 4, la pista, la devolución, el acierto y el porqué abierto— y en cada
 * estado comprueba:
 *
 *   · la página no tiene barra horizontal
 *   · ningún elemento con texto se sale de su caja ni del panel de la pieza
 *     (el renglón más largo, «Le devuelve mercancía al proveedor», dentro de
 *     su lado)
 *   · la letra medida es Inter y Sora, y ninguna de la pieza baja de 12 px
 *   · cada botón de la pieza (también los lados, mientras son botones) mide
 *     44 px de alto o más
 *   · B1: a 320, la figura empieza en los primeros 280 px de la tarjeta
 *
 * Sale con código 1 si algo falla, y escribe una tabla con las medidas.
 * Necesita Playwright (no es dependencia del repo): el de PLAYWRIGHT_MODULE o
 * /opt/node-tools/node_modules/playwright.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });

const ANCHOS = [320, 375, 1280];
const A = '[data-pieza="t7-2-a1-la-cuenta-que-si-se-mueve"]';

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-t7-2/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

/* Las fuentes de Google desde disco, si hay carpeta: la letra medida es la real. */
const FUENTES = process.env.FUENTES_DIR ?? null;
async function nuevaPagina(opciones) {
  const pagina = await navegador.newPage(opciones);
  if (FUENTES && existsSync(`${FUENTES}/fuentes.css`)) {
    const css = readFileSync(`${FUENTES}/fuentes.css`, "utf8");
    await pagina.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (ruta) => {
      const u = ruta.request().url();
      if (u.includes("googleapis")) return ruta.fulfill({ status: 200, contentType: "text/css", body: css });
      const f = `${FUENTES}/${u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_")}`;
      return existsSync(f) ? ruta.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(f) }) : ruta.abort();
    });
  }
  return pagina;
}

const fallos = [];
const filas = [];

/* Lo que se mide en cada estado. Corre dentro de la página. */
function medir(sel) {
  const raiz = document.querySelector(sel);
  const panel = raiz.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...raiz.querySelectorAll("*")]
    .filter((el) => !el.closest("[hidden], .t7cs-solo-lector") && !el.matches("style, script") && el.getBoundingClientRect().height > 0) /* lo del lector de pantalla mide 1 px a propósito */
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  let minLetra = Infinity;
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    const e = getComputedStyle(el);
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    minLetra = Math.min(minLetra, parseFloat(e.fontSize));
    if (e.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: el texto mide ${el.scrollWidth} px y la caja ${el.clientWidth} px`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
  }
  /* Cada lado de la cuenta: sus renglones dentro. */
  for (const lado of raiz.querySelectorAll(".t7cs-lado")) {
    const l = lado.getBoundingClientRect();
    for (const x of lado.querySelectorAll(".t7cs-renglon, .t7cs-pastilla")) {
      const r = x.getBoundingClientRect();
      if (r.height && (r.right > l.right + 0.5 || r.left < l.left - 0.5)) problemas.push(`«${x.textContent.trim().slice(0, 30)}» se sale de su lado`);
    }
  }
  if (minLetra < 12) problemas.push(`letra de ${minLetra} px`);
  const botones = [...raiz.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().height > 0);
  let minBoton = Infinity;
  for (const b of botones) {
    const alto = b.getBoundingClientRect().height;
    minBoton = Math.min(minBoton, alto);
    if (alto < 43.5) problemas.push(`«${(b.textContent || b.className).trim().slice(0, 30)}» mide ${alto.toFixed(1)} px de alto`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px de ancho en ${window.innerWidth}`);
  const fig = raiz.querySelector("[data-figura]").getBoundingClientRect();
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    figuraDesdeTope: Math.round(fig.top - caja.top),
    alto: Math.round(caja.height),
    minLetra, minBoton: Math.round(minBoton * 10) / 10, botones: botones.length,
    fuentes: { inter: document.fonts.check("14px Inter"), sora: document.fonts.check("700 14px Sora"), txt: getComputedStyle(raiz.querySelector(".t7cs-txt")).fontFamily.split(",")[0] },
  };
}

for (const ancho of ANCHOS) {
  const pagina = await nuevaPagina({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await pagina.goto(URL_BANCO);
  await pagina.waitForSelector(A);
  await pagina.evaluate(() => document.fonts.ready);
  let n = 0;
  const estado = async (nombre) => {
    await pagina.waitForTimeout(700); /* que terminen las animaciones (550 ms la más larga) */
    const m = await pagina.evaluate(medir, A);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes.inter || !m.fuentes.sora) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (ancho === 320 && m.figuraDesdeTope > 280) fallos.push(`320 px · ${nombre} · B1: la figura empieza a ${m.figuraDesdeTope} px`);
    if (CAPTURAS) {
      const panel = await pagina.$(A);
      await (await panel.evaluateHandle((el) => el.closest("section"))).asElement().screenshot({ path: resolve(CAPTURAS, `${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const clic = (sel) => pagina.click(`${A} ${sel}`);
  const lado = (l) => clic(`[data-t="inv"] [data-lado="${l}"]`);

  await estado("p1-portada");
  await clic(".t7cs-seguir");
  await estado("p2-llega");
  await lado("haber"); await estado("p2-pista");
  await lado("haber"); await estado("p2-devolucion");
  await lado("debe"); await estado("p2-compra");
  await lado("haber"); await lado("debe");
  await lado("debe"); await estado("p2-proveedor-pista");
  await lado("haber"); await lado("haber"); await estado("p2-acierto");
  await clic(".t7cs-porque"); await estado("p2-porque");
  await clic(".t7cs-seguir");
  await estado("p3-llega");
  await clic('[data-opcion="nunca"]'); await estado("p3-pista");
  await clic('[data-opcion="al-cierre"]'); await estado("p3-devolucion");
  await clic('[data-opcion="cada-venta"]'); await estado("p3-acierto-costo");
  await clic(".t7cs-porque"); await estado("p3-porque");
  await clic(".t7cs-seguir");
  await estado("p4-llega");
  await clic('[data-accion="contar"]'); await estado("p4-contado");
  await clic('[data-opcion="hallar"]'); await estado("p4-pista");
  await clic('[data-opcion="no-hace-falta"]'); await estado("p4-devolucion");
  await clic('[data-opcion="verificar"]'); await estado("p4-acierto");
  await clic(".t7cs-seguir");
  await estado("p5-resumen");
  await pagina.close();
}

/* Movimiento reducido: el estado final, sin animación ni transición en marcha. */
{
  const pagina = await nuevaPagina({ viewport: { width: 375, height: 900 }, reducedMotion: "reduce" });
  await pagina.goto(URL_BANCO);
  await pagina.waitForSelector(A);
  await pagina.click(`${A} .t7cs-seguir`);
  await pagina.click(`${A} [data-t="inv"] [data-lado="debe"]`);
  await pagina.click(`${A} [data-t="inv"] [data-lado="haber"]`);
  const r = await pagina.$eval(A, (el) => ({
    saliendo: el.querySelectorAll(".t7cs-caja.sale").length,
    vivas: el.querySelectorAll(".t7cs-caja:not(.sale)").length,
    animaciones: [...el.querySelectorAll("*")].filter((x) => getComputedStyle(x).animationName !== "none" || parseFloat(getComputedStyle(x).transitionDuration) > 0).length,
  }));
  console.log(`Movimiento reducido, compra y venta: ${r.vivas} cajas, ${r.saliendo} saliendo, ${r.animaciones} elementos con animación o transición`);
  if (r.saliendo || r.vivas !== 6 || r.animaciones) fallos.push(`movimiento reducido: ${JSON.stringify(r)}`);
  await pagina.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | figura desde el tope | alto | letra mín. | botón mín. (n) | fuente");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.figuraDesdeTope} | ${f.alto} | ${f.minLetra} | ${f.minBoton} (${f.botones}) | ${f.fuentes.txt}`);
console.log(`\n${filas.length} medidas (${new Set(filas.map((f) => f.estado)).size} estados × ${ANCHOS.length} anchos).`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: nada se sale a 320, 375 ni 1280 px; botones de 44 px; letra de 12 px o más; B1 a 320.");
