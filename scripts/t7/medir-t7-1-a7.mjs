/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE A7 «EL VIAJE DE UNA CAJA» A 320, 375 Y 1280? ¿VIAJA LA CAJA COMO EN
 * LA V6?
 *
 *   node scripts/t7/medir-t7-1-a7.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T7-1 montada tal cual con la hoja de estilos
 * del sitio (banco scripts/t7/harness). Juega A7 entera —soltar la caja, y en
 * cada caso un error en una rama, otro en la línea (la escalera) y el
 * acierto— y en cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal y ningún texto se salga de su
 *     caja ni del panel
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada botón mida 44 px de alto o más (las estaciones de la línea,
 *     52; las ramas, 48, como en la v6)
 *   · que ningún texto de la pieza baje de 12 px
 *   · B1 a 320: la figura empieza en los primeros 280 px de la tarjeta, con
 *     40 palabras o menos antes (canonEnganche.js); y B2, 60 o menos. En
 *     MODO INFORME, como canon-enganche.test.mjs: se imprime y no falla
 *
 * Y, a 320, lo que la v6 midió del viaje: la hoja del informe vuela 0 veces
 * en el caso 1 (con dos errores, el acierto y 6 s más) y 1 vez en los
 * primeros 5 s del caso 2; en el caso 3 la caja queda centrada en Bodega. Una
 * vuelta más a 320 con movimiento reducido: la caja no viaja y la hoja no
 * vuela.
 *
 * Google Fonts no se alcanza desde aquí: si existe /tmp/claude-0/fuentes, las
 * fuentes se sirven desde disco (la letra es la real).
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE; Chromium en
 * CHROMIUM_PATH si no es el de Playwright.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const FUENTES = "/tmp/claude-0/fuentes/";
const A7 = '[data-pieza="t7-1-a7-control-interno"]';
const VUELTAS = [
  { ancho: 320, reducido: false, viaje: true },
  { ancho: 375, reducido: false },
  { ancho: 1280, reducido: false },
  { ancho: 320, reducido: true, viaje: true },
];

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const informe = [];
const filas = [];

async function contexto(ancho, reducido) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2, reducedMotion: reducido ? "reduce" : "no-preference" });
  if (existsSync(`${FUENTES}fuentes.css`)) {
    const css = readFileSync(`${FUENTES}fuentes.css`, "utf8");
    await ctx.route("https://fonts.googleapis.com/**", (r) => r.fulfill({ status: 200, contentType: "text/css", body: css }));
    await ctx.route("https://fonts.gstatic.com/**", (r) => {
      const f = r.request().url().replace("https://fonts.gstatic.com/", "").replace(/\//g, "_");
      try { return r.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(FUENTES + f) }); } catch { return r.abort(); }
    });
  }
  return ctx;
}

async function medir(pg) {
  return pg.evaluate(async (sel) => {
    const C = await import("/src/contabilidad/canonEnganche.js");
    const pieza = document.querySelector(sel);
    const panel = pieza.closest("section");
    const caja = panel.getBoundingClientRect();
    const problemas = [];
    for (const el of panel.querySelectorAll("*")) {
      if (el.matches("style, script") || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
      const cs = getComputedStyle(el);
      if (cs.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
      if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
      if (pieza.contains(el) && parseFloat(cs.fontSize) < 12) problemas.push(`${nombre}: letra de ${cs.fontSize}`);
    }
    if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
    const altos = {};
    for (const b of pieza.querySelectorAll("button")) {
      const h = b.getBoundingClientRect().height;
      const min = b.matches(".t7vc-rama") ? 48 : b.matches("[data-est]") ? 52 : 44;
      if (h < min - 0.01) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto (mínimo ${min})`);
      altos[b.dataset.est ?? b.dataset.boton] = Math.round(h * 10) / 10;
    }
    const m = C.medirTarjeta(panel, window);
    const fig = pieza.querySelector("[data-figura]");
    return {
      problemas, altos,
      panel: Math.round(caja.width * 10) / 10,
      alto: Math.round(pieza.getBoundingClientRect().height),
      b1px: Math.round(fig.getBoundingClientRect().top - caja.top),
      antes: m.antes, texto: m.texto, figura: m.figura,
      fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 15px Sora"),
    };
  }, A7);
}

for (const { ancho, reducido, viaje } of VUELTAS) {
  const ctx = await contexto(ancho, reducido);
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/scripts/t7/harness/index.html`);
  await pg.waitForSelector(A7);
  await pg.evaluate(() => document.fonts.ready);
  const nombreVuelta = `${ancho}${reducido ? "-reducido" : ""}`;
  let n = 0;
  const en = (s) => `${A7} ${s}`;
  const estado = async (nombre) => {
    const m = await medir(pg);
    filas.push({ vuelta: nombreVuelta, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${nombreVuelta} · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${nombreVuelta} · ${nombre} · no cargaron Inter o Sora`);
    if (ancho === 320 && !reducido) {
      if (m.b1px > 280) informe.push(`${nombreVuelta} · ${nombre} · B1: la figura empieza a ${m.b1px} px`);
      if (m.antes > 40) informe.push(`${nombreVuelta} · ${nombre} · B1: ${m.antes} palabras antes de la figura`);
      if (m.texto > 60) informe.push(`${nombreVuelta} · ${nombre} · B2: ${m.texto} palabras`);
    }
    if (CAPTURAS) {
      const panel = await (await pg.$(A7)).evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `a7-${nombreVuelta}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const clic = (s) => pg.click(en(s));
  /* La hoja, contada en la página con un observador (data-hoja pasa de no estar a estar). */
  await pg.evaluate((sel) => {
    const c = document.querySelector(`${sel} [data-est="contabilidad"]`);
    window.__hojas = 0;
    new MutationObserver((ms) => { for (const x of ms) if (x.oldValue === null) window.__hojas++; }).observe(c, { attributes: true, attributeOldValue: true, attributeFilter: ["data-hoja"] });
  }, A7);
  const hojas = () => pg.evaluate(() => window.__hojas);
  const yDe = (id) => pg.evaluate(([sel, id]) => {
    const r = document.querySelector(`${sel} .t7vc-ruta`).getBoundingClientRect();
    const c = document.querySelector(`${sel} .t7vc-caja`).getBoundingClientRect();
    const b = document.querySelector(`${sel} [data-est="${id}"] .t7vc-nodo`).getBoundingClientRect();
    return { caja: c.top + c.height / 2 - r.top, nodo: b.top + b.height / 2 - r.top };
  }, [A7, id]);

  await pg.locator(A7).scrollIntoViewIfNeeded();
  await estado("p0");
  await clic('[data-boton="empezar"]');
  await estado("p1-al-llegar");
  await clic('[data-boton="soltar"]');
  if (viaje) await pg.waitForTimeout(reducido ? 300 : 5800);
  await estado("p1-soltada");
  if (viaje) {
    const h = await hojas();
    if (h !== (reducido ? 0 : 1)) fallos.push(`${nombreVuelta} · al soltar la hoja voló ${h} veces`);
    const y = await pg.evaluate((sel) => { const r = document.querySelector(`${sel} .t7vc-ruta`).getBoundingClientRect(); const c = document.querySelector(`${sel} .t7vc-caja`).getBoundingClientRect(); return Math.round(r.bottom - (c.top + c.height / 2)); }, A7);
    if (y !== 18) fallos.push(`${nombreVuelta} · al soltar, la caja termina a ${y} px del fondo de la ruta (18)`);
  }
  await clic('[data-boton="seguir"]');
  /* Caso 1: dos errores (rama y línea), el acierto y, al viajar, 6 s más: la hoja no vuela (A7-1). */
  const antesCaso1 = await hojas();
  await estado("p2-al-llegar");
  await clic('[data-est="contabilidad"]');
  await estado("p2-error-contabilidad");
  await clic('[data-est="bodega"]');
  await estado("p2-pista-bodega");
  await clic('[data-est="recepcion"]');
  if (viaje) await pg.waitForTimeout(reducido ? 300 : 6000);
  await estado("p2-acierto");
  if (viaje) {
    const h = (await hojas()) - antesCaso1;
    if (h !== 0) fallos.push(`${nombreVuelta} · en el caso 1 la hoja voló ${h} veces (A7-1)`);
    const y = await yDe("recepcion");
    if (Math.abs(y.caja - y.nodo) > 1) fallos.push(`${nombreVuelta} · caso 1: la caja no quedó en Recepción (${y.caja} y ${y.nodo})`);
  }
  await clic('[data-boton="seguir"]');
  /* Caso 2: en los primeros 5 s la hoja vuela 1 vez. */
  const antesCaso2 = await hojas();
  if (viaje) {
    await pg.waitForTimeout(5000);
    const h = (await hojas()) - antesCaso2;
    if (h !== (reducido ? 0 : 1)) fallos.push(`${nombreVuelta} · en los primeros 5 s del caso 2 la hoja voló ${h} veces`);
  }
  await estado("p3-al-llegar");
  await clic('[data-est="conteos"]');
  await estado("p3-error-conteos");
  await clic('[data-est="salida"]');
  if (viaje) await pg.waitForTimeout(400);
  await estado("p3-acierto");
  await clic('[data-boton="seguir"]');
  /* Caso 3: la escalera entera y el acierto en una rama; la caja queda centrada en Bodega. */
  await estado("p4-al-llegar");
  await clic('[data-est="recepcion"]');
  await estado("p4-error-recepcion");
  await clic('[data-est="bodega"]');
  await estado("p4-pista-bodega");
  await clic('[data-est="conteos"]');
  if (viaje) await pg.waitForTimeout(reducido ? 300 : 900);
  await estado("p4-acierto");
  if (viaje) {
    const y = await yDe("bodega");
    if (Math.abs(y.caja - y.nodo) > 1) fallos.push(`${nombreVuelta} · caso 3: la caja no quedó centrada en Bodega (${y.caja} y ${y.nodo})`);
  }
  await clic('[data-boton="seguir"]');
  await estado("p5");
  await ctx.close();
}

await navegador.close();
await servidor.close();

console.log("vuelta | estado | panel | alto pieza | B1 px | palabras antes | B2 | figura | altos");
for (const f of filas) console.log(`${f.vuelta} | ${f.estado} | ${f.panel} | ${f.alto} | ${f.b1px} | ${f.antes} | ${f.texto} | ${f.figura} | ${JSON.stringify(f.altos)}`);
console.log(`\n${filas.length} medidas.`);
console.log(`\nInforme B1/B2 a 320 (no falla): ${informe.length ? "" : "todo cumple"}`);
for (const f of informe) console.log(`  · ${f}`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: nada se sale a 320, 375 ni 1280; botones de 44 px o más; letra de 12 px o más; la hoja y la caja, como en la v6.");
