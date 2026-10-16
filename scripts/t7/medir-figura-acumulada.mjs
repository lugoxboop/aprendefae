/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE LA FIGURA ACUMULADA? (lote 5 de L) · a 320 y 375 px, en Chromium.
 *
 *   node scripts/t7/medir-figura-acumulada.mjs [carpeta-de-capturas] [--fuentes carpeta]
 *
 * Las siete piezas de la figura que crece y se queda (T7-1 H3, H4 y H6, T7-2
 * H5, T7-3 H2 y H4, T5 N4), en su vista del sitio (banco
 * scripts/t7/harness-figura). Juega cada tanda con las respuestas buenas y,
 * en dos estados, comprueba y mide:
 *
 *   AL FINAL, antes de responder el último ítem (la figura con todo lo de
 *   antes): los píxeles desde el tope de la tarjeta hasta la primera opción
 *   del ítem, y cuánto de eso es la figura (lo que empuja).
 *
 *   EL ESTADO MÁS ALTO, con el último ítem cerrado (todas las filas):
 *     · nada se sale (página sin barra horizontal, ningún texto fuera de su
 *       caja ni de la pantalla), y los renglones no tocan su cifra
 *     · al bajar hasta el final, la figura se queda pegada arriba, no pasa
 *       del 40 % del alto de la ventana, y el botón de seguir se ve y se
 *       puede tocar (no queda debajo de la figura)
 *     · al dar el foco a la primera opción de un ítem con la figura pegada,
 *       la opción queda a la vista, debajo de la figura
 *
 * Sale con 1 si algo falla. Playwright de la máquina (o PLAYWRIGHT_MODULE);
 * Chromium en CHROMIUM_PATH. Con --fuentes, sirve Inter y Sora desde esa
 * carpeta (fuentes.css y los woff2), porque Google Fonts no se alcanza.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const args = process.argv.slice(2);
const FUENTES = args.includes("--fuentes") ? args[args.indexOf("--fuentes") + 1] : null;
const CAPTURAS = args.find((a, k) => !a.startsWith("--") && args[k - 1] !== "--fuentes") ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const PANTALLAS = [[320, 640], [375, 667]];

const { ITEMS_H3 } = await import("../../src/data/contabilidadT7_1_h3.js");
const { PARTE2_H4 } = await import("../../src/data/contabilidadT7_1_h4.js");
const { CASILLAS_H4 } = await import("../../src/contabilidad/t7H4.js");
const { ITEMS_H6 } = await import("../../src/data/contabilidadT7_1_h6.js");
const { ITEMS_H5 } = await import("../../src/data/contabilidadT7_2_h5.js");
const { ITEMS_H2 } = await import("../../src/data/contabilidadT7_3_h2.js");
const { ITEMS_H4 } = await import("../../src/data/contabilidadT7_3_h4.js");
const { ITEMS_N4 } = await import("../../src/data/contabilidadT5_n4.js");

/* Cada pieza: su id y sus ítems (la tabla de H4 de T7-1 se juega aparte). */
const PIEZAS = [
  { id: "t7-1-cuanto-vale-lo-que-sobro", items: ITEMS_H3.map((x) => ({ ...x, tipo: "eleccion" })) },
  { id: "t7-1-cierra-el-mes", tablaH4: true },
  { id: "t7-1-devolucion-dos-libros", items: ITEMS_H6 },
  { id: "t7-2-flete-y-devolucion", items: ITEMS_H5 },
  { id: "t7-3-cadena-de-descuentos", items: ITEMS_H2.map((x) => ({ ...x, tipo: "eleccion" })) },
  { id: "t7-3-pago-a-tiempo", items: ITEMS_H4 },
  { id: "t5-el-interes-del-periodo", items: ITEMS_N4 },
];

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-figura/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

async function contexto(ancho, alto) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 2 });
  if (FUENTES) {
    const css = readFileSync(resolve(FUENTES, "fuentes.css"), "utf8");
    await ctx.route("**/*", (route) => {
      const u = route.request().url();
      if (u.startsWith("http://127.0.0.1")) return route.continue();
      if (u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
      if (u.startsWith("https://fonts.gstatic.com/")) {
        try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(FUENTES, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return route.abort(); }
      }
      return route.abort();
    });
  }
  return ctx;
}

/* Lo que se sale, como en los medir-t7-*: textos fuera de su caja o de la pantalla, renglones que tocan su cifra. */
function seSale() {
  const raiz = document.getElementById("root");
  const problemas = [];
  const conTexto = [...raiz.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script") && !el.closest(".sr"))
    .filter((el) => { const e = getComputedStyle(el); return !(e.position === "absolute" && el.clientWidth <= 1); })
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > window.innerWidth + 0.5 || r.left < -0.5) problemas.push(`${nombre}: se sale de la pantalla`);
  }
  for (const f of document.querySelectorAll("[data-figura-acumulada] [data-renglon]")) {
    const rot = f.querySelector(".rg-rot").getBoundingClientRect();
    const v = f.querySelector(".rg-v").getBoundingClientRect();
    if (v.top < rot.bottom - 1 && rot.right > v.left - 4) problemas.push(`el renglón «${f.querySelector(".rg-rot").textContent}» toca su cifra`);
    if (v.right > f.getBoundingClientRect().right + 0.5) problemas.push(`la cifra «${f.querySelector(".rg-v").textContent}» se sale de su renglón`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  const toques = [...document.querySelectorAll("section button")].filter((b) => b.getBoundingClientRect().height > 0 && !b.closest("header") && !b.matches("[data-por-que]"));
  /* «¿Por qué?» (plegable.jsx, compartido) es un enlace dentro del texto: no entra en esta cuenta. */
  for (const b of toques) if (b.getBoundingClientRect().height < 44 - 0.5) problemas.push(`el botón «${b.textContent.trim().slice(0, 30)}» mide ${b.getBoundingClientRect().height.toFixed(1)} px`);
  return problemas;
}

const PRIMERA = "[data-opcion] button, [data-campo-cifra], [data-linea-cuenta] button, [data-linea] button";

/* Antes del último ítem: de la tarjeta a la primera opción, y lo que mide la figura. */
function alFinal(sel) {
  const tarjeta = document.querySelector("section");
  const op = document.querySelector(sel);
  const fig = document.querySelector("[data-figura-acumulada]");
  const t = tarjeta.getBoundingClientRect().top;
  return {
    opcion: op ? Math.round(op.getBoundingClientRect().top - t) : null,
    figura: fig ? Math.round(fig.getBoundingClientRect().height + parseFloat(getComputedStyle(fig).marginBottom)) : 0,
  };
}

async function jugarItem(pg, it, siguiente) {
  if (it.tipo === "eleccion") {
    await pg.click(`[data-opcion="${it.correcta}"] button`);
  } else if (it.tipo === "cifra") {
    await pg.fill(`[data-campo-cifra="${it.id}"]`, String(it.correcta));
    await pg.click('button:text-is("Comprobar")');
  } else {
    for (const l of it.lineas) {
      await pg.click(`[data-linea-cuenta="${l.id}"] [data-ficha-cuenta="${l.cuenta}"]`);
      await pg.click(`[data-linea-cuenta="${l.id}"] button:text-is("${l.lado === "debe" ? "Debe" : "Haber"}")`);
    }
    await pg.click('button:text-is("Comprobar")');
  }
  if (siguiente) await pg.click('button:text-is("Siguiente ítem")');
}

async function medirPieza(pz, ancho, alto) {
  const ctx = await contexto(ancho, alto);
  const pg = await ctx.newPage();
  const nombre = `${pz.id} · ${ancho}`;
  try {
    await pg.goto(`${BASE}#${pz.id}`);
    await pg.waitForSelector("section [data-contador-intento]", { timeout: 30000 });
    await pg.evaluate(() => document.fonts.ready);
    let final;
    if (pz.tablaH4) {
      for (const c of CASILLAS_H4) { await pg.click(`[data-ficha-cifra="${c.valor}"]`); await pg.click(`[data-casilla="${c.id}"]`); }
      await pg.click('button:text-is("Confirmar")');
      await pg.click('button:text-is("Siguiente ítem")');
      final = await pg.evaluate(alFinal, "[data-linea] button");
      for (const l of PARTE2_H4.lineas) await pg.click(`[data-linea="${l.id}"] button:text-is("${l.lado === "debe" ? "Debe" : "Haber"}")`);
      await pg.click('button:text-is("Comprobar")');
    } else {
      for (const [k, it] of pz.items.entries()) {
        if (k === pz.items.length - 1) final = await pg.evaluate(alFinal, PRIMERA);
        await jugarItem(pg, it, k < pz.items.length - 1);
      }
    }
    await pg.waitForTimeout(250);
    const problemas = await pg.evaluate(seSale);
    const enFlujo = await pg.evaluate(() => Math.round(document.querySelector("[data-figura-acumulada]").getBoundingClientRect().height));
    if (CAPTURAS) {
      await pg.evaluate(() => window.scrollTo(0, 0));
      await pg.waitForTimeout(250);
      await pg.screenshot({ path: resolve(CAPTURAS, `${pz.id}-${ancho}-entera.png`), fullPage: true });
    }
    /* Abajo del todo: la figura pegada y el botón de seguir, tocable. */
    await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await pg.waitForTimeout(250);
    const abajo = await pg.evaluate(() => {
      const caja = document.querySelector("[data-figura-acumulada] .t7fa-caja");
      const r = caja.getBoundingClientRect();
      const boton = [...document.querySelectorAll("section button")].find((b) => /Ver mi resumen/.test(b.textContent));
      const rb = boton.getBoundingClientRect();
      const encima = document.elementFromPoint(rb.left + rb.width / 2, rb.top + rb.height / 2);
      return { pegada: caja.dataset.pegada, alto: Math.round(r.height), bajo: Math.round(r.bottom), boton: Math.round(rb.top), tocable: boton.contains(encima) };
    });
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `${pz.id}-${ancho}-pegada.png`) });
    if (abajo.pegada !== "si" && enFlujo + 200 < alto) {
      /* Si la página entera cabe, no hace falta pegarla. */
    } else if (abajo.pegada !== "si") problemas.push("abajo del todo, la figura no está pegada");
    if (abajo.pegada === "si" && abajo.alto > Math.floor(alto * 0.4) + 1) problemas.push(`pegada mide ${abajo.alto} px, más del 40 % de ${alto}`);
    if (!abajo.tocable) problemas.push("el botón «Ver mi resumen» queda tapado");
    filas.push({ pieza: pz.id, ancho, ...final, enFlujo, pegada: abajo.pegada, altoPegada: abajo.alto });
    for (const p of problemas) fallos.push(`${nombre} · ${p}`);
  } catch (e) {
    fallos.push(`${nombre} · no se pudo jugar: ${e.message.split("\n")[0]}`);
  } finally {
    await ctx.close();
  }
}

/* El foco en una opción con la figura pegada: la opción se asoma debajo de ella. */
async function medirFoco(ancho, alto) {
  const ctx = await contexto(ancho, alto);
  const pg = await ctx.newPage();
  try {
    await pg.goto(`${BASE}#t7-3-cadena-de-descuentos`);
    await pg.waitForSelector("section [data-contador-intento]");
    for (const it of ITEMS_H2.slice(0, 4)) await jugarItem(pg, { ...it, tipo: "eleccion" }, true);
    /* Se baja hasta que la figura se pega y la primera opción queda debajo de ella. */
    await pg.evaluate(() => {
      const fig = document.querySelector("[data-figura-acumulada]");
      window.scrollTo(0, window.scrollY + fig.getBoundingClientRect().bottom - 20);
    });
    await pg.waitForTimeout(200);
    await pg.evaluate(() => document.querySelector("[data-opcion] button").focus());
    await pg.waitForTimeout(200);
    const r = await pg.evaluate(() => {
      const caja = document.querySelector("[data-figura-acumulada] .t7fa-caja");
      const op = document.querySelector("[data-opcion] button").getBoundingClientRect();
      return { pegada: caja.dataset.pegada, bajo: caja.getBoundingClientRect().bottom, op: op.top };
    });
    if (r.pegada === "si" && r.op < r.bajo) fallos.push(`foco · ${ancho} · la opción enfocada queda debajo de la figura (${Math.round(r.op)} < ${Math.round(r.bajo)})`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `foco-t7-3-h2-${ancho}.png`) });
    return r;
  } finally {
    await ctx.close();
  }
}

const focos = [];
for (const [ancho, alto] of PANTALLAS) {
  for (const pz of PIEZAS) await medirPieza(pz, ancho, alto);
  focos.push({ ancho, ...(await medirFoco(ancho, alto)) });
}
await navegador.close();
await servidor.close();

console.log("pieza | ancho | tope→primera opción (último ítem) | de eso, la figura | figura entera en flujo | pegada abajo | alto pegada");
for (const f of filas) console.log(`${f.pieza} | ${f.ancho} | ${f.opcion} | ${f.figura} | ${f.enFlujo} | ${f.pegada} | ${f.altoPegada}`);
for (const f of focos) console.log(`foco ${f.ancho}: pegada ${f.pegada}, bajo de la figura ${Math.round(f.bajo)}, opción ${Math.round(f.op)}`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("\nPASA: la figura acumulada cabe a 320 y 375 px, se queda pegada y el ítem sigue alcanzable.");
