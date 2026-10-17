/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · ¿CABEN T7-2 A1, H2 Y H5 CON LA CONSECUENCIA A LA VISTA, A 375 Y 320?
 *
 *   node scripts/t7/medir-c4-t7-2.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad (banco scripts/t7/harness-t7-2, la hoja del sitio; Inter
 * y Sora servidas desde /tmp/claude-0/fuentes si están, como en
 * /tmp/claude-0/medir/comun.mjs). Recorre:
 *   · A1: la pantalla 2 entera, cada hecho con el lado equivocado (la
 *     consecuencia en el acto, y luego el veredicto) y con el bueno; luego
 *     las pantallas 3 a 5
 *   · H2 y H5: tres tandas (el primer distractor, la correcta, el segundo
 *     distractor), así cada opción y cada distractor de cifra pinta su
 *     consecuencia; cada uno se mide escribiendo, en la consecuencia (antes
 *     del veredicto) y con el veredicto
 * En cada estado: sin barra horizontal; ningún texto se sale de su caja ni de
 * la pantalla; cada botón de la pieza mide 44 px de alto o más; letra de 12
 * px o más dentro de las figuras C4; Inter y Sora cargadas. Y la condición
 * 4 de la auditoría de Mello del C4 (C4-1): con cada cifra escrita (la
 * correcta y los distractores), antes de «Comprobar», la figura la muestra y
 * no califica nada.
 * Sale con código 1 si algo falla.
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
const ANCHOS = [375, 320];
const FUENTES = "/tmp/claude-0/fuentes/";
const { ITEMS_H2 } = await import("../../src/data/contabilidadT7_2_h2.js");
const { ITEMS_H5 } = await import("../../src/data/contabilidadT7_2_h5.js");
const { HECHOS } = await import("../../src/data/contabilidadT7_2_a1_c2.js");

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-t7-2/index.html`;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const fallos = [];
const filas = [];
const condicion4 = [];

async function contexto(ancho) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  if (existsSync(`${FUENTES}fuentes.css`)) {
    const css = readFileSync(`${FUENTES}fuentes.css`, "utf8");
    await ctx.route("**/*", (route) => {
      const u = route.request().url();
      if (u.startsWith("http://127.0.0.1")) return route.continue();
      if (u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
      if (u.startsWith("https://fonts.gstatic.com/")) {
        try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(FUENTES + u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_")) }); } catch { return route.abort(); }
      }
      return route.abort();
    });
  }
  return ctx;
}

function medir(sel) {
  const raiz = document.querySelector(sel);
  const problemas = [];
  if (!raiz) return { problemas: [`no está ${sel}`], botonMasBajo: null, letraMin: null, fuentes: false };
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
  const botones = [...raiz.querySelectorAll("button, input")].filter((b) => b.getBoundingClientRect().width > 0);
  for (const b of botones) { const h = b.getBoundingClientRect().height; if (h < 44) problemas.push(`«${(b.textContent || b.getAttribute("aria-label") || "").trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`); }
  const enFiguras = [...raiz.querySelectorAll(".c4t72 *, [data-c4-linea], [data-c4-linea] *")].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const letras = enFiguras.map((el) => parseFloat(getComputedStyle(el).fontSize));
  for (const [k, px] of letras.entries()) if (px < 12) problemas.push(`letra de ${px} px: «${enFiguras[k].textContent.trim().slice(0, 30)}»`);
  return {
    problemas,
    botonMasBajo: botones.length ? Math.round(Math.min(...botones.map((b) => b.getBoundingClientRect().height)) * 10) / 10 : null,
    letraMin: letras.length ? Math.min(...letras) : null,
    linea: raiz.querySelector("[data-c4-linea]")?.textContent ?? null,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}

async function recorrer(ancho, pieza, hash, sel, jugar) {
  const ctx = await contexto(ancho);
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}${hash}`);
  await pg.waitForSelector(sel);
  let n = 0;
  const estado = async (nombre, donde = sel) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, donde);
    filas.push({ ancho, pieza, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${pieza} · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${pieza} · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) await (await pg.$(donde)).screenshot({ path: resolve(CAPTURAS, `${pieza}-${ancho}-${String(++n).padStart(3, "0")}-${nombre}.png`) });
  };
  await jugar(pg, estado);
  await ctx.close();
}

const ESPERA = 450;
const A1 = '[data-pieza="t7-2-a1-la-cuenta-que-si-se-mueve"]';

async function jugarA1(pg, estado) {
  const q = (s) => `${A1} ${s}`;
  await estado("portada");
  await pg.click(q(".t7cs-seguir"));
  for (const h of HECHOS) {
    const otro = h.lado === "debe" ? "haber" : "debe";
    await pg.click(q(`[data-t="inv"] [data-lado="${otro}"]`));
    await estado(`${h.id}-${otro}-consecuencia`);
    await pg.waitForTimeout(ESPERA);
    await estado(`${h.id}-${otro}-veredicto`);
    await pg.click(q(`[data-t="inv"] [data-lado="${h.lado}"]`));
    await estado(`${h.id}-${h.lado}-consecuencia`);
    await pg.waitForTimeout(ESPERA);
    await estado(`${h.id}-${h.lado}-veredicto`);
  }
  await pg.click(q(".t7cs-porque"));
  await estado("porque");
  await pg.click(q(".t7cs-seguir"));
  await pg.click(q('[data-opcion="cada-venta"]'));
  await estado("pantalla-3");
  await pg.click(q(".t7cs-seguir"));
  await pg.click(q('[data-accion="contar"]'));
  await pg.click(q('[data-opcion="verificar"]'));
  await estado("pantalla-4");
  await pg.click(q(".t7cs-seguir"));
  await estado("resumen");
}

/* Una tanda de H2 o H5: `cual` 0 = la correcta, 1 y 2 = el distractor 1 o 2 (los asientos, con la línea buena o el primer distractor). */
const jugarHacer = (items, sel) => async (pg, estado) => {
  for (const cual of [1, 0, 2]) {
    if (cual !== 1) { await pg.click('button:text-is("Otra vez")'); await pg.waitForSelector(sel); }
    for (const it of items) {
      const nombre = `${cual}-${it.id}`;
      if (it.tipo === "asiento") {
        for (const l of it.lineas) {
          const cuenta = cual === 1 ? l.distractores[0].cuenta : l.cuenta;
          await pg.click(`[data-linea-cuenta="${l.id}"] [data-ficha-cuenta="${cuenta}"]`);
          await pg.click(`[data-linea-cuenta="${l.id}"] button:text-is("${l.lado === "debe" ? "Debe" : "Haber"}")`);
        }
        await pg.click('button:text-is("Comprobar")');
        await estado(`${nombre}-comprobado`);
      } else {
        const v = cual ? it.distractores[Math.min(cual, it.distractores.length) - 1].valor : it.correcta;
        if (it.tipo === "cifra") {
          await pg.fill(`[data-campo-cifra="${it.id}"]`, String(v));
          await estado(`${nombre}-escrita`);
          /* C4-1 de Mello (condición 4): con la cifra escrita, sin comprobar, la figura no puede calificar. */
          const html = await pg.$eval("[data-c4-figura]", (f) => f.outerHTML);
          for (const x of ["c4-cuadra", "c4-falla", " mal", "c4t72-cuadra", "c4t72-falla", "data-c4-linea", " activa"]) if (html.includes(x)) fallos.push(`${pg.viewportSize().width} px · ${nombre} · «${x}» antes de comprobar`);
          if (!html.includes(`>$${Number(v).toLocaleString("es-CO")}<`)) fallos.push(`${pg.viewportSize().width} px · ${nombre} · la cifra escrita no está en la figura`);
          condicion4.push(`${pg.viewportSize().width} px · ${nombre}`);
          await pg.click('button:text-is("Comprobar")');
        } else {
          await pg.click(`[data-opcion="${v}"] button`);
        }
        await estado(`${nombre}-consecuencia`);
        await pg.waitForTimeout(ESPERA);
        await estado(`${nombre}-veredicto`);
      }
      await pg.click('button:text-is("Siguiente ítem"), button:text-is("Ver mi resumen")');
    }
    await estado(`${cual}-cierre`, "#root");
  }
};

for (const ancho of ANCHOS) {
  await recorrer(ancho, "a1", "", A1, jugarA1);
  await recorrer(ancho, "h2", "#h2", "[data-t7-2-h2]", jugarHacer(ITEMS_H2, "[data-t7-2-h2]"));
  await recorrer(ancho, "h5", "#h5", "[data-t7-2-h5]", jugarHacer(ITEMS_H5, "[data-t7-2-h5]"));
}

await navegador.close();
await servidor.close();

console.log("ancho | pieza | estado | botón más bajo | letra mín. en la figura | línea C4");
for (const f of filas) console.log(`${f.ancho} | ${f.pieza} | ${f.estado} | ${f.botonMasBajo ?? "—"} | ${f.letraMin ?? "—"} | ${f.linea ?? "—"}`);
console.log(`\n${filas.length} medidas.`);
console.log(`C4-1 · cifras escritas sin comprobar, sin calificar: ${condicion4.length} (${condicion4.filter((x) => x.startsWith("320") && /h5|pago|baja/.test(x)).join("; ")})`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: T7-2 A1, H2 y H5 con la C4 caben a 375 y a 320 px.");
