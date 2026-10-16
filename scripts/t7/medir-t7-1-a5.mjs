/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO Y CADA CIFRA DE A5 «IMPORTADOS Y FLETES» A 375 Y 320?
 *
 *   node scripts/t7/medir-t7-1-a5.mjs [carpeta-de-capturas]
 *
 * Como medir-t7-1-a6.mjs: Chromium de verdad, la vista de T7-1 montada tal
 * cual con la hoja de estilos del sitio. Juega A5 entera —en cada pregunta
 * falla con cada opción equivocada y acierta— y en cada uno de sus 23 estados
 * comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth)
 *   · que nada con texto se salga del panel de la pieza
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · en la tarjeta de asientos, que cada cifra quepa en su columna, sin el
 *     relleno; y anota la holgura más justa (Watari midió 47,9 y 19,9)
 *   · en el lado a lado, que las dos columnas midan lo mismo y queden una al
 *     lado de la otra
 *   · en P2, que cada ítem de la lista lleve su viñeta
 *   · con movimiento reducido, que la tarjeta llegue sin fundido
 *   · que cada botón de la pieza mida 44 px de alto o más, y que ningún
 *     texto visible baje de 12 px
 *
 * P3 «El viaje de la compra» (C1) se juega en sus dos pasos: la retro de
 * antes de «a bordo» y el acierto de FOB; el error «a medias» y el acierto
 * de C&F, con la tierra atenuada.
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE; Chromium en
 * CHROMIUM_PATH. Google Fonts no se alcanza desde aquí: Inter y Sora se
 * sirven desde disco (FUENTES, por defecto /tmp/claude-0/fuentes, con su
 * fuentes.css) con `route`, como en medir-t7-2-a4.mjs.
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
const ANCHOS = [375, 320];
const A5 = '[data-pieza="t7-1-a5-importados-y-fletes"]';

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}`;
const URL_BANCO = `${BASE}/scripts/t7/harness/index.html`;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes/";
const css = readFileSync(resolve(FUENTES, "fuentes.css"), "utf8");
async function pagina(opciones) {
  const ctx = await navegador.newContext(opciones);
  await ctx.route("**/*", (ruta) => {
    const u = ruta.request().url();
    if (u.startsWith(BASE)) return ruta.continue();
    if (u.startsWith("https://fonts.googleapis.com/")) return ruta.fulfill({ status: 200, contentType: "text/css", body: css });
    if (u.startsWith("https://fonts.gstatic.com/")) {
      try { return ruta.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(FUENTES, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return ruta.abort(); }
    }
    return ruta.abort();
  });
  return ctx.newPage();
}
const fallos = [];
const filas = [];

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.closest(".t7a5-sr") && !el.matches("style, script"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    /* Lo que no se pinta (lo plegado detrás de «¿Por qué?», en un span hidden) no se mide. */
    if (r.width === 0 && r.height === 0) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  /* Botones de 44 px como mínimo y letra de 12 como mínimo, en lo que se ve de la pieza. */
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; };
  let botonMinimo = Infinity, letraMinima = Infinity;
  for (const b of pieza.querySelectorAll("button")) {
    if (!visible(b)) continue;
    const h = b.getBoundingClientRect().height;
    botonMinimo = Math.min(botonMinimo, h);
    if (h < 44) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  for (const el of conTexto) {
    if (!pieza.contains(el) || !visible(el)) continue;
    const px = parseFloat(getComputedStyle(el).fontSize);
    letraMinima = Math.min(letraMinima, px);
    if (px < 12) problemas.push(`${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 30)}»: letra de ${px} px`);
  }

  /* P2: cada ítem de la lista lleva su viñeta. La hoja global del sitio quita el estilo de lista. */
  for (const li of pieza.querySelectorAll("ul[data-lista] li")) {
    const e = getComputedStyle(li);
    if (e.display !== "list-item" || e.listStyleType !== "disc") problemas.push(`el ítem «${li.textContent.slice(0, 30)}» no lleva su viñeta (${e.display}, ${e.listStyleType})`);
  }

  /* Tarjeta: cada cifra dentro del área útil de su celda; la holgura más justa. */
  let tarjeta = null;
  const t = pieza.querySelector("[data-tarjeta]");
  if (t) {
    let holgura = Infinity;
    for (const c of t.querySelectorAll(".t7a5-g2 > [role=cell]")) {
      if (!c.textContent.trim()) continue;
      const e = getComputedStyle(c), cr = c.getBoundingClientRect();
      const util = cr.width - parseFloat(e.paddingLeft) - parseFloat(e.paddingRight);
      const rg = document.createRange(); rg.selectNodeContents(c); const ancho = rg.getBoundingClientRect().width;
      holgura = Math.min(holgura, util - ancho);
      if (ancho > util + 0.5) problemas.push(`tarjeta «${c.textContent}»: la cifra mide ${ancho.toFixed(1)} px y caben ${util.toFixed(1)}`);
    }
    tarjeta = { alto: Math.round(t.getBoundingClientRect().height * 10) / 10, holgura: Math.round(holgura * 10) / 10 };
  }

  /* Lado a lado: dos columnas iguales, una al lado de la otra. */
  let lal = null;
  const tabla = pieza.querySelector("[data-lado-a-lado]");
  if (tabla) {
    const cab = [...tabla.querySelectorAll(".t7a5-lal-h [role=columnheader]:not(.t7a5-sr)")].map((c) => c.getBoundingClientRect());
    const anchos = cab.map((r) => Math.round(r.width * 10) / 10);
    if (anchos.length === 2 && Math.abs(anchos[0] - anchos[1]) > 0.5) problemas.push(`lado a lado: columnas de ${anchos[0]} y ${anchos[1]} px`);
    if (cab.length === 2 && Math.abs(cab[0].top - cab[1].top) > 0.5) problemas.push("lado a lado: las columnas no quedan una al lado de la otra");
    for (const f of tabla.querySelectorAll("[data-fila-lal]")) {
      const tops = [...f.querySelectorAll("[role=cell]")].map((c) => c.getBoundingClientRect().top);
      if (Math.abs(tops[0] - tops[1]) > 0.5) problemas.push(`lado a lado ${f.dataset.filaLal}: las celdas no están a la misma altura`);
    }
    lal = { columnas: anchos, alto: Math.round(tabla.getBoundingClientRect().height * 10) / 10 };
  }
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 13px Sora"),
    tarjeta,
    lal,
    botonMinimo: Math.round(botonMinimo * 10) / 10,
    letraMinima,
  };
}

const correctas = { importados: "aranceles", "flete-del-comprador": "compras-fletes", "flete-del-vendedor": "gasto-de-venta", "lado-a-lado": "quien-lo-asume" };

for (const ancho of ANCHOS) {
  const pg = await pagina({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(A5);
  await pg.evaluate(() => document.fonts.ready);
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, A5);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) {
      const el = await pg.$(A5);
      const panel = await el.evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `a5-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const en = (sel) => `${A5} ${sel}`;
  const clic = (sel) => pg.click(en(sel));
  const pantalla = () => pg.getAttribute(A5, "data-pantalla");

  for (let vuelta = 0; vuelta < 8; vuelta++) {
    const id = await pantalla();
    if (await pg.$(en("[data-viaje]"))) {
      /* P3 (C1): el paso de FOB y el de C&F. */
      await estado(`${id}-fob-colocando`);
      for (const f of ["puerto", "flete", "seguro", "bodega"]) await clic(`[data-ficha="${f}"]`);
      await clic('[data-boton="comprobar"]');
      await estado(`${id}-fob-error-puerto`);
      await clic('[data-ficha="puerto"]'); await clic('[data-boton="comprobar"]');
      await estado(`${id}-fob-acierto`);
      await clic('[data-boton="seguir-paso"]');
      await estado(`${id}-cyf-colocando`);
      await clic('[data-opcion="medias"]'); await clic('[data-boton="confirmar"]');
      await estado(`${id}-cyf-error-medias`);
      await clic('[data-boton="probar-otra"]');
      await clic('[data-opcion="comprador"]'); await clic('[data-boton="confirmar"]');
      await estado(`${id}-cyf-acierto`);
      await clic('[data-boton="seguir"]');
      continue;
    }
    if (await pg.$(en("[data-eleccion]"))) {
      await estado(`${id}-colocando`);
      const malas = await pg.$$eval(en("[data-opcion]"), (bs, c) => bs.map((b) => b.dataset.opcion).filter((o) => o !== c), correctas[id]);
      for (const mala of malas.sort()) {
        await clic(`[data-opcion="${mala}"]`); await clic('[data-boton="confirmar"]');
        await estado(`${id}-error-${mala}`);
        await clic('[data-boton="probar-otra"]');
      }
      await clic(`[data-opcion="${correctas[id]}"]`); await clic('[data-boton="confirmar"]');
      await estado(`${id}-acierto`);
      await clic('[data-boton="seguir"]');
      continue;
    }
    await estado(id);
    const b = await pg.$(en("[data-boton]"));
    if (!b) break;
    await b.click();
  }
  await pg.close();
}

/* Movimiento reducido: la tarjeta llega sin fundido. */
{
  const pg = await pagina({ viewport: { width: 375, height: 900 }, reducedMotion: "reduce" });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(A5);
  const orden = ["importados", "fob-cif-cyf", "flete-del-comprador"];
  for (let i = 0; i < 12 && !(await pg.$(`${A5} [data-tarjeta]`)); i++) {
    const id = await pg.getAttribute(A5, "data-pantalla");
    if (id === "fob-cif-cyf") {
      for (const f of ["flete", "seguro", "bodega"]) await pg.click(`${A5} [data-ficha="${f}"]`);
      await pg.click(`${A5} [data-boton="comprobar"]`); await pg.click(`${A5} [data-boton="seguir-paso"]`);
      await pg.click(`${A5} [data-opcion="comprador"]`); await pg.click(`${A5} [data-boton="confirmar"]`); await pg.click(`${A5} [data-boton="seguir"]`);
    } else if (orden.includes(id)) {
      await pg.click(`${A5} [data-opcion="${correctas[id]}"]`); await pg.click(`${A5} [data-boton="confirmar"]`);
      if (!(await pg.$(`${A5} [data-tarjeta]`))) await pg.click(`${A5} [data-boton="seguir"]`);
    } else await pg.click(`${A5} [data-boton]`);
  }
  const a = await pg.$eval(`${A5} [data-tarjeta]`, (t) => getComputedStyle(t).animationName);
  console.log(`Movimiento reducido: animación de la tarjeta = ${a}`);
  if (a !== "none") fallos.push(`movimiento reducido: la tarjeta tiene la animación ${a}`);
  await pg.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | alto pieza | tarjeta: alto · holgura más justa | lado a lado: columnas · alto | botón mín. | letra mín.");
for (const f of filas) {
  const t = f.tarjeta ? `${f.tarjeta.alto} · ${f.tarjeta.holgura}` : "—";
  const l = f.lal ? `${f.lal.columnas.join(" / ")} · ${f.lal.alto}` : "—";
  console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.alto} | ${t} | ${l} | ${f.botonMinimo} | ${f.letraMinima}`);
}
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
/* 23 de Watari, menos los 4 de la P3 vieja, más los 6 de la P3 de C1. */
if (estados !== 25) fallos.push(`se recorrieron ${estados} estados y son 25`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto ni ninguna cifra se sale a 375 ni a 320 px.");
