/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE H2 «ARMA LA FACTURA» (la factura que se arma, C2) A 375 Y 320?
 *
 *   node scripts/t7/medir-t7-1-h2.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad: la vista de T7-1 en el modo Hacer, con H2 abierto y la
 * hoja de estilos del sitio. Las fuentes de Google se sirven desde disco
 * (FUENTES, por omisión /tmp/claude-0/fuentes) con ctx.route: la letra es la
 * real. Juega la tanda entera —error en los ítems 1 y 3, acierto en el 2 y
 * el 5; en el asiento de la compra, dos líneas con la cuenta mala; en el de
 * la venta, las cuatro con el lado malo— y mide cada estado:
 *
 *   · que la página no tenga barra horizontal y ningún texto se salga
 *   · que todo botón y la casilla midan al menos 44 px de alto
 *   · que ninguna letra visible mida menos de 12 px
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · condición 4 de Mello: al teclear, la casilla es el mismo nodo y no
 *     pierde el foco
 *   · Fa-2: dónde empieza la factura en el ítem 1 (Mello midió 364 px a 320
 *     con el enunciado entero)
 *   · los renglones viajan al entrar a un asiento, y con movimiento reducido no
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes/";
const ANCHOS = [375, 320];
const { ITEMS_H2 } = await import("../../src/data/contabilidadT7_1_h2.js");

const FALLA = new Set(["iva-compra", "debe-proveedor", "asiento-compra:compras", "asiento-compra:proveedores",
  "asiento-venta:clientes", "asiento-venta:anticipo", "asiento-venta:iva", "asiento-venta:ingresos"]);

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness/index.html#h2`;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const fallos = [];
const filas = [];

async function contexto(ancho, reducido = false) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2, reducedMotion: reducido ? "reduce" : "no-preference" });
  let css = null;
  try { css = readFileSync(resolve(FUENTES, "fuentes.css"), "utf8"); } catch { /* sin fuentes en disco: se mide con la de reserva y se avisa */ }
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith("http://127.0.0.1")) return route.continue();
    if (css && u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
    if (u.startsWith("https://fonts.gstatic.com/")) {
      try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(FUENTES, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return route.abort(); }
    }
    return route.abort();
  });
  return ctx;
}

function medir() {
  /* En el cierre ya no está la pieza: el cierre y la barra de la vista son compartidos; ahí solo se mira el desborde. */
  const pieza = document.querySelector("[data-h2]");
  const raiz = pieza ?? document.getElementById("root");
  const problemas = [];
  const conTexto = [...raiz.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script") && el.getClientRects().length)
    .filter((el) => { const e = getComputedStyle(el); return !(e.position === "absolute" && el.clientWidth <= 1); })
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  let letraMin = Infinity;
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > window.innerWidth + 0.5 || r.left < -0.5) problemas.push(`${nombre}: se sale de la pantalla`);
    const t = parseFloat(getComputedStyle(el).fontSize);
    letraMin = Math.min(letraMin, t);
    if (pieza && t < 12) problemas.push(`${nombre}: letra de ${t} px`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  const toques = [...(pieza ? raiz.querySelectorAll("button, input") : [])].filter((b) => b.getClientRects().length).map((b) => ({ r: b.getBoundingClientRect(), t: b.getAttribute("aria-label") ?? b.textContent.trim().slice(0, 30) }));
  for (const { r, t } of toques) if (r.height < 44) problemas.push(`«${t}» mide ${r.height.toFixed(1)} px de alto`);
  const fac = raiz.querySelector("[data-factura]");
  return {
    problemas,
    actividad: Math.round(raiz.getBoundingClientRect().width * 10) / 10,
    facturaDesdeArriba: fac ? Math.round(fac.getBoundingClientRect().top + window.scrollY) : null,
    facturaDesdeLaPieza: fac ? Math.round(fac.getBoundingClientRect().top - raiz.getBoundingClientRect().top) : null,
    alto: Math.round(document.documentElement.scrollHeight),
    toqueMasBajo: toques.length ? Math.round(Math.min(...toques.map((x) => x.r.height)) * 10) / 10 : null,
    letraMin,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}

for (const ancho of ANCHOS) {
  const ctx = await contexto(ancho);
  const pg = await ctx.newPage();
  await pg.goto(URL_BANCO);
  await pg.waitForSelector("[data-h2]");
  await pg.evaluate(() => document.fonts.ready);
  let n = 0;
  const estado = async (nombre) => {
    await pg.waitForTimeout(900); /* «Iba aquí» llega a los 0,7 s; el vuelo de los renglones dura < 0,7 s */
    const m = await pg.evaluate(medir);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `h2-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`), fullPage: true });
  };
  for (const [k, it] of ITEMS_H2.entries()) {
    const id = await pg.getAttribute("[data-item]", "data-item");
    if (id !== it.id) fallos.push(`${ancho} px · el ítem en pantalla es ${id} y tocaba ${it.id}`);
    await estado(`${it.id}-antes`);
    if (k === 0) {
      await pg.click("[data-ver-enunciado]");
      await estado(`${it.id}-enunciado-abierto`);
      await pg.click("[data-ver-enunciado]");
    }
    if (it.tipo === "cifra") {
      const v = FALLA.has(it.id) ? it.distractores[0].valor : it.correcta;
      await pg.focus("[data-casilla]");
      await pg.evaluate(() => { window.__casilla = document.querySelector("[data-casilla]"); });
      await pg.keyboard.type(String(v), { delay: 15 });
      const igual = await pg.evaluate(() => window.__casilla.isConnected && document.querySelector("[data-casilla]") === window.__casilla && document.activeElement === window.__casilla);
      if (!igual) fallos.push(`${ancho} px · ${it.id} · la casilla cambió de nodo o perdió el foco al teclear`);
      await estado(`${it.id}-escrito`);
      await pg.click("[data-responder] button");
      await estado(`${it.id}-${FALLA.has(it.id) ? "error" : "acierto"}`);
    } else {
      for (const l of it.lineas) {
        const falla = FALLA.has(`${it.id}:${l.id}`);
        const cuenta = falla && it.id === "asiento-compra" ? l.distractores[0].cuenta : l.cuenta;
        const lado = falla && it.id === "asiento-venta" ? (l.lado === "debe" ? "haber" : "debe") : l.lado;
        await pg.click(`[data-linea="${l.id}"] [data-cuenta="${cuenta}"]`);
        await pg.click(`[data-linea="${l.id}"] [data-lado="${lado}"]`);
      }
      await estado(`${it.id}-armado`);
      await pg.click("[data-responder] button");
      await estado(`${it.id}-comprobado`);
    }
    const ultimo = k === ITEMS_H2.length - 1;
    await pg.click("[data-responder] button");
    if (!ultimo && ITEMS_H2[k + 1].tipo === "asiento") {
      const vuelos = await pg.evaluate(() => document.querySelectorAll("[data-vuelo]").length);
      if (vuelos !== 4) fallos.push(`${ancho} px · ${ITEMS_H2[k + 1].id} · viajaron ${vuelos} renglones y son 4`);
    }
  }
  await estado("cierre");
  await ctx.close();

  /* Movimiento reducido: al entrar al asiento de la compra, nada viaja. */
  const ctxR = await contexto(ancho, true);
  const pr = await ctxR.newPage();
  await pr.goto(URL_BANCO);
  await pr.waitForSelector("[data-h2]");
  for (const it of ITEMS_H2.slice(0, 3)) {
    await pr.focus("[data-casilla]");
    await pr.keyboard.type(String(it.correcta));
    await pr.click("[data-responder] button");
    await pr.click("[data-responder] button");
  }
  const vuelosR = await pr.evaluate(() => document.querySelectorAll("[data-vuelo]").length);
  if (vuelosR !== 0) fallos.push(`${ancho} px · movimiento reducido · viajaron ${vuelosR} renglones`);
  if (CAPTURAS) await pr.screenshot({ path: resolve(CAPTURAS, `h2-${ancho}-reducido-asiento.png`), fullPage: true });
  await ctxR.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | pieza | factura desde arriba | factura desde la pieza | alto | toque más bajo | letra mínima");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.actividad} | ${f.facturaDesdeArriba ?? "—"} | ${f.facturaDesdeLaPieza ?? "—"} | ${f.alto} | ${f.toqueMasBajo ?? "—"} | ${f.letraMin}`);
const estados = filas.length / ANCHOS.length;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
if (estados !== 20) fallos.push(`se recorrieron ${estados} estados y son 20`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: H2 cabe a 375 y a 320 px.");
