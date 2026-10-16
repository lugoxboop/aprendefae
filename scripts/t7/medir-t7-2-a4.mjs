/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE T7-2 · A4 «LAS CAPAS QUE LA VENTA CORTA» A 320, 375 Y 1280?
 *
 *   node scripts/t7/medir-t7-2-a4.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T7-2 montada tal cual con la hoja de
 * estilos del sitio (banco scripts/t7/harness-t7-2). Juega A4 entera, como
 * la v6 del Patrón de enganche C midió su prototipo: el deslizador un paso
 * adelante, a saltos y hacia atrás; cada error, la escalera y el acierto de
 * las cuatro preguntas; el selector de método; la mezcla del promedio; la
 * pantalla del cierre (C1) con su retro y su acierto. En cada
 * estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que ningún número de capa choque con su sello («No es esta»)
 *   · que cada botón de la pieza y el deslizador midan 44 px de alto o más
 *     (las capas, 48)
 *   · que ningún texto visible de la pieza baje de 12 px
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · B1 a 320 (pantallas de capas): la figura empieza en los primeros 280 px
 *     de la tarjeta, con 40 palabras o menos antes
 *
 * Con movimiento, espera a que acaben las animaciones antes de medir; y otra
 * vuelta a 320 con movimiento reducido. Sale con código 1 si algo falla.
 *
 * Google Fonts no se alcanza desde aquí: Inter y Sora se sirven desde disco
 * (FUENTES, por defecto /tmp/claude-0/fuentes, con su fuentes.css) con
 * `route`. Necesita Playwright (no es dependencia del repo): el de la máquina,
 * o el de PLAYWRIGHT_MODULE; Chromium en CHROMIUM_PATH.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CHROMIUM = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes/";
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const VUELTAS = [{ ancho: 320, reducido: false }, { ancho: 375, reducido: false }, { ancho: 1280, reducido: false }, { ancho: 320, reducido: true }];
const A4 = '[data-pieza="t7-2-a4-san-calixto"]';
const ANIMACION_MS = 1300; // la capa agotada: 0,75 s de espera y 0,45 s de salida; la mezcla: 0,65 s y 0,45 s

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}`;
const URL_BANCO = `${BASE}/scripts/t7/harness-t7-2/index.html`;
const navegador = await chromium.launch({ executablePath: CHROMIUM });
const css = readFileSync(resolve(FUENTES, "fuentes.css"), "utf8");
const fallos = [];
const filas = [];

async function contexto(ancho, reducido) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2, reducedMotion: reducido ? "reduce" : "no-preference" });
  await ctx.route("**/*", (ruta) => {
    const u = ruta.request().url();
    if (u.startsWith(BASE)) return ruta.continue();
    if (u.startsWith("https://fonts.googleapis.com/")) return ruta.fulfill({ status: 200, contentType: "text/css", body: css });
    if (u.startsWith("https://fonts.gstatic.com/")) {
      try { return ruta.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(FUENTES, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return ruta.abort(); }
    }
    return ruta.abort();
  });
  return ctx;
}

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const visible = (el) => { const r = el.getBoundingClientRect(); const e = getComputedStyle(el); return r.width > 0 && r.height > 0 && e.visibility !== "hidden" && Number(e.opacity) > 0; };
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script, .t7bp-sr"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  let letraMinima = Infinity;
  for (const el of conTexto) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
    if (pieza.contains(el)) {
      const px = parseFloat(getComputedStyle(el).fontSize);
      letraMinima = Math.min(letraMinima, px);
      if (px < 12) problemas.push(`${nombre}: letra de ${px} px`);
    }
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  let botonMinimo = Infinity;
  for (const b of pieza.querySelectorAll("button, input[type=range]")) {
    if (!visible(b) || b.closest(".ea4-capa.agotada")) continue;
    const h = b.getBoundingClientRect().height;
    botonMinimo = Math.min(botonMinimo, h);
    if (h < 44) problemas.push(`«${(b.textContent || b.getAttribute("aria-label")).trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  /* Ningún número de capa choca con su sello. */
  for (const c of pieza.querySelectorAll(".ea4-capa")) {
    const s = c.querySelector(".ea4-sello");
    if (!s || !s.textContent) continue;
    const a = c.querySelector(".ea4-num").getBoundingClientRect(), b = s.getBoundingClientRect();
    if (a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom) problemas.push(`el número de la capa ${c.dataset.capa} choca con su sello`);
  }
  /* B1: la figura desde el tope de la tarjeta, y las palabras antes. */
  const fig = pieza.querySelector("[data-figura]");
  const palabras = (t) => t.split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
  const b1 = fig ? { px: Math.round(fig.getBoundingClientRect().top - caja.top), antes: palabras([...pieza.querySelectorAll(".ea4-marca, .ea4-txt")].map((x) => x.textContent).join(" ")) } : null;
  return {
    problemas, b1, letraMinima, botonMinimo: Math.round(botonMinimo * 10) / 10,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    pantalla: pieza.dataset.pantalla,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 13px Sora"),
  };
}

for (const { ancho, reducido } of VUELTAS) {
  const ctx = await contexto(ancho, reducido);
  const pg = await ctx.newPage();
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(A4);
  await pg.evaluate(() => document.fonts.ready);
  const vuelta = `${ancho}${reducido ? "-reducido" : ""}`;
  let n = 0;
  const en = (sel) => `${A4} ${sel}`;
  const esperar = () => pg.waitForTimeout(reducido ? 60 : ANIMACION_MS);
  const estado = async (nombre) => {
    await esperar();
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, A4);
    filas.push({ vuelta, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${vuelta} · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${vuelta} · ${nombre} · no cargaron Inter o Sora`);
    if (ancho === 320 && m.b1 && /^p\d$/.test(nombre) && (m.b1.px > 280 || m.b1.antes > 40)) fallos.push(`${vuelta} · ${nombre} · B1: la figura empieza a ${m.b1.px} px con ${m.b1.antes} palabras antes`);
    if (CAPTURAS) {
      const panel = await (await pg.$(A4)).evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `a4-${vuelta}-${String(++n).padStart(2, "0")}-${nombre.replace(/[^\w-]+/g, "_")}.png`) });
    }
  };
  const clic = (sel) => pg.click(en(sel));
  const mover = (i) => pg.$eval(en(".ea4-rango"), (r, v) => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    set.call(r, String(v));
    r.dispatchEvent(new Event("input", { bubbles: true }));
  }, i);
  const seguir = () => clic(".ea4-seguir");

  await pg.$eval(A4, (x) => x.scrollIntoView());
  await estado("p1"); await seguir();
  await estado("p2"); await mover(1); await estado("p2-2feb"); await mover(2); await estado("p2-4feb"); await mover(0); await estado("p2-atras"); await mover(2); await seguir();
  await estado("p3"); await clic('.ea4-capa[data-capa="2 feb"]'); await estado("p3-error1"); await clic('.ea4-capa[data-capa="4 feb"]'); await estado("p3-error2");
  await clic('.ea4-capa[data-capa="1 feb"]'); await estado("p3-acierto"); await mover(4); await estado("p3-8feb-sigue"); await mover(9); await estado("p3-28feb"); await seguir();
  await estado("p4"); await clic('.ea4-capa[data-capa="1 feb"]'); await estado("p4-error1"); await clic('.ea4-capa[data-capa="2 feb"]'); await estado("p4-error2");
  await clic('.ea4-capa[data-capa="4 feb"]'); await estado("p4-acierto"); await mover(9); await seguir();
  await estado("p5"); await clic('.ea4-op[data-op="igual"]'); await estado("p5-error1"); await clic('.ea4-op[data-op="baja"]'); await estado("p5-error2");
  await clic('.ea4-op[data-op="sube"]'); await estado("p5-acierto"); await mover(6); await estado("p5-16feb-sigue"); await mover(0); await estado("p5-1feb"); await mover(9); await seguir();
  await estado("p6"); await clic('.ea4-selector [data-metodo="ueps"]'); await estado("p6-ueps"); await clic('.ea4-selector [data-metodo="promedio"]'); await estado("p6-promedio");
  await clic('.ea4-op[data-op="ueps"]'); await estado("p6-error1"); await clic('.ea4-op[data-op="promedio"]'); await estado("p6-error2"); await clic('.ea4-op[data-op="peps"]'); await estado("p6-acierto"); await seguir();
  /* La pantalla del cierre (C1): la retro de las dos que no sobran (la de ventas) y el acierto, con la lista del permanente. */
  await estado("p7");
  for (const f of ["ventas", "gastos", "inicial"]) await clic(`[data-fila="${f}"]`);
  await clic('[data-boton="comprobar"]'); await estado("p7-error-ventas-y-gastos");
  for (const f of ["ventas", "gastos", "final", "compras"]) await clic(`[data-fila="${f}"]`);
  await clic('[data-boton="comprobar"]'); await estado("p7-acierto"); await clic('[data-boton="seguir"]');
  await estado("p8"); await clic('.ea4-selector [data-metodo="ueps"]'); await mover(3); await estado("p8-ueps-6feb");
  await ctx.close();
}

await navegador.close();
await servidor.close();

console.log("vuelta | estado | pantalla | panel | alto | B1 (px · palabras) | letra mín. | botón mín.");
for (const f of filas) console.log(`${f.vuelta} | ${f.estado} | ${f.pantalla} | ${f.panel} | ${f.alto} | ${f.b1 ? `${f.b1.px} · ${f.b1.antes}` : "—"} | ${f.letraMinima} | ${f.botonMinimo}`);
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${VUELTAS.length} vueltas).`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: nada se sale, los botones miden 44 o más, la letra no baja de 12 y B1 se cumple a 320.");
