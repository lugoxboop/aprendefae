/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE A6 «DEVOLUCIONES EN PERIÓDICO» (MOTOR C3) A 320, 375 Y 1280?
 *
 *   node scripts/t7/medir-t7-1-a6.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T7-1 montada tal cual con la hoja de estilos
 * del sitio (banco scripts/t7/harness). Juega A6 entera —en cada pregunta los
 * dos errores y el acierto; en el primer libro, los dos errores de la primera
 * línea— y en cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal y ningún texto se salga de su
 *     caja ni del panel
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada botón mida 44 px de alto o más, y que ningún texto de la pieza
 *     baje de 12 px
 *   · en los dos libros, con subgrid, que cada línea y su fantasma queden en
 *     la misma fila (la misma altura arriba)
 *   · B1 y B2 a 320, en MODO INFORME (se imprime y no falla)
 *
 * Una vuelta más a 320 con movimiento reducido, y otra a 320 «sin subgrid»: la
 * condición del @supports se cambia en la página por una que ningún navegador
 * cumple (como Safari < 16). Ahí las filas no se emparejan, pero nada debe
 * salirse.
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
const A6 = '[data-pieza="t7-1-a6-devoluciones-en-periodico"]';
const VUELTAS = [
  { ancho: 320 },
  { ancho: 375 },
  { ancho: 1280 },
  { ancho: 320, reducido: true },
  { ancho: 320, sinSubgrid: true },
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
      /* Lo que solo oye el lector de pantalla («Incorrecto.», en una caja de 1 px) no se mide. */
      if (!r.width || !C.seVe(el, window)) continue;
      const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
      const cs = getComputedStyle(el);
      if (cs.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
      if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
      if (pieza.contains(el) && parseFloat(cs.fontSize) < 12) problemas.push(`${nombre}: letra de ${cs.fontSize}`);
    }
    /* Las fichas de los cruces van desplazadas (transform), pero dentro del panel. */
    for (const t of pieza.querySelectorAll(".c3-tile:not(.oculta)")) {
      const r = t.getBoundingClientRect();
      if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`ficha «${t.textContent.slice(0, 30)}» se sale del panel`);
    }
    if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
    const altos = [];
    for (const b of pieza.querySelectorAll("button")) {
      if (b.hidden || !b.getBoundingClientRect().width) continue;
      const h = b.getBoundingClientRect().height;
      if (h < 44 - 0.01) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
      altos.push(Math.round(h * 10) / 10);
    }
    /* Las filas pareadas: la i-ésima fila de cada lado, a la misma altura. */
    const lados = [...pieza.querySelectorAll(".c3-lado")].map((l) => [...l.querySelectorAll(".c3-ren")].map((r) => Math.round(r.getBoundingClientRect().top)));
    const pareadas = lados.length === 2 && lados[0].length ? lados[0].every((y, i) => y === lados[1][i]) : null;
    const m = C.medirTarjeta(panel, window);
    const ceja = pieza.querySelector(".c3-cejilla");
    const fig = pieza.querySelector("[data-figura]");
    return {
      problemas, altos: Math.min(...altos), pareadas, subgrid: CSS.supports("grid-template-rows", "subgrid"),
      panel: Math.round(caja.width * 10) / 10,
      b1px: Math.round(fig.getBoundingClientRect().top - caja.top),
      antes: m.antes, texto: m.texto - C.contarPalabras(ceja.textContent),
      fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 15px Sora"),
    };
  }, A6);
}

for (const { ancho, reducido, sinSubgrid } of VUELTAS) {
  const ctx = await contexto(ancho, reducido);
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}/scripts/t7/harness/index.html#a6`);
  await pg.waitForSelector(A6);
  await pg.evaluate(() => document.fonts.ready);
  const vuelta = `${ancho}${reducido ? "-reducido" : ""}${sinSubgrid ? "-sin-subgrid" : ""}`;
  if (sinSubgrid) {
    /* Como un navegador sin subgrid: la regla del @supports no aplica. */
    await pg.evaluate(() => {
      for (const s of document.querySelectorAll("style")) if (s.textContent.includes("@supports (grid-template-rows: subgrid)")) s.textContent = s.textContent.replace("@supports (grid-template-rows: subgrid)", "@supports (grid-template-rows: no-hay-subgrid)");
    });
  }
  let n = 0;
  const en = (s) => `${A6} ${s}`;
  const estado = async (nombre, { pareadas = false } = {}) => {
    if (!reducido) await pg.waitForTimeout(600);
    const m = await medir(pg);
    filas.push({ vuelta, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${vuelta} · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${vuelta} · ${nombre} · no cargaron Inter o Sora`);
    if (pareadas && !sinSubgrid && m.pareadas !== true) fallos.push(`${vuelta} · ${nombre} · las filas de los dos lados no quedan pareadas`);
    if (ancho === 320 && !reducido && !sinSubgrid) {
      if (m.b1px > 280) informe.push(`${vuelta} · ${nombre} · B1: la figura empieza a ${m.b1px} px`);
      if (m.antes > 40) informe.push(`${vuelta} · ${nombre} · B1: ${m.antes} palabras antes de la figura`);
      if (m.texto > 60) informe.push(`${vuelta} · ${nombre} · B2: ${m.texto} palabras`);
    }
    /* A 1280 la captura del panel entero tumba a Chromium en este contenedor: solo 320 y 375. */
    if (CAPTURAS && ancho <= 375) {
      const panel = await (await pg.$(A6)).evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `a6-${vuelta}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const clic = (s) => pg.click(en(s));
  const seguir = () => clic(".c3-seguir");
  await pg.locator(A6).scrollIntoViewIfNeeded();
  await estado("p1-portada");
  await seguir();
  await estado("p2-al-llegar");
  await clic('[data-accion="devolver"]');
  await estado("p2-devuelta");
  await seguir();
  await estado("p3-al-llegar");
  await clic('[data-accion="modo"][data-v="aparte"]');
  await estado("p3-cuenta-aparte");
  await clic('[data-op="no-se-tocan"]');
  await estado("p3-error-1");
  await clic('[data-op="no-cambia"]');
  await estado("p3-error-2");
  await clic('[data-op="saber-cuanto"]');
  await clic('[data-boton="por-que"]');
  await estado("p3-acierto-porque");
  await seguir();
  await estado("p4-al-llegar");
  await clic('[data-accion="pelar"]');
  await estado("p4-pelada");
  await seguir();
  await estado("p5-al-llegar-barra-entera");
  await clic('[data-elige="todo"]');
  await estado("p5-error-1");
  await clic('[data-elige="nada"]');
  await estado("p5-error-2");
  await clic('[data-elige="proporcional"]');
  await estado("p5-acierto");
  for (const [p, lados] of [["p6", ["debe", "debe", "haber", "haber"]], ["p7", ["debe", "debe", "haber", "haber"]]]) {
    await seguir();
    await estado(`${p}-al-llegar`);
    for (const [i, l] of lados.entries()) {
      if (p === "p6" && i === 0) {
        await clic('.c3-lado[data-lado="haber"]');
        await estado(`${p}-error-1`);
        await clic('.c3-lado[data-lado="haber"]');
        await estado(`${p}-error-2`);
      }
      await clic(`.c3-lado[data-lado="${l}"]`);
      await estado(`${p}-linea-${i + 1}`, { pareadas: true });
    }
  }
  await seguir();
  await estado("p8-al-llegar");
  await clic('[data-accion="fecha"][data-v="j1"]');
  await estado("p8-1-de-junio");
  await clic('[data-op="en-el-debe"]');
  await estado("p8-error-1");
  await clic('[data-op="ingresos"]');
  await estado("p8-error-2");
  await clic('[data-op="al-reves"]');
  await estado("p8-acierto");
  await seguir();
  await estado("p9-resumen");
  await ctx.close();
}

await navegador.close();
await servidor.close();

console.log("vuelta | estado | panel | B1 px | palabras antes | B2 | botón más bajo | filas pareadas | subgrid");
for (const f of filas) console.log(`${f.vuelta} | ${f.estado} | ${f.panel} | ${f.b1px} | ${f.antes} | ${f.texto} | ${f.altos} | ${f.pareadas ?? "—"} | ${f.subgrid}`);
console.log(`\n${filas.length} medidas.`);
console.log(`\nInforme B1/B2 a 320 (no falla): ${informe.length ? "" : "todo cumple"}`);
for (const f of informe) console.log(`  · ${f}`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: nada se sale a 320, 375 ni 1280 (ni sin subgrid); botones de 44 px o más; letra de 12 px o más; con subgrid, las filas de los libros pareadas.");
