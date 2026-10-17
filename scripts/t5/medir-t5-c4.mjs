/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · ¿CABEN N1, N3, N4, N5 Y N7 DE T5 CON «TODA DECISIÓN SE PINTA»?
 *
 *   node scripts/t5/medir-t5-c4.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T5 en el modo Hacer (banco
 * scripts/t5/harness-t5, #n1 … #n7), a 375 y 320, CON movimiento (la espera
 * de 380 ms del patrón C4). En cada ítem con objeto C4 mide dos estados: la
 * consecuencia de una opción mala recién tocada (antes del veredicto) y el
 * veredicto; en N1 y N3, todos los ítems; en N4, N5 y N7, los ítems de
 * elección y de cifra hasta el primer asiento (los asientos no cambian con
 * C4: los miden medir-t5-n5/n7.mjs). Comprueba:
 *
 *   · que la página no tenga barra horizontal ni texto fuera de su caja
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada botón de la pieza mida al menos 44 px de alto
 *   · que ningún texto de la pieza tenga letra de menos de 12 px
 *   · y anota a cuántos px del tope de la pieza empieza el objeto C4
 *
 * Fuentes desde FUENTES (por omisión /tmp/claude-0/fuentes). Sale con código
 * 1 si algo falla.
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
const ANCHOS = [375, 320];
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes/";

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t5/harness-t5/index.html`;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const fallos = [];
const filas = [];
const condicion4 = [];

async function contexto(ancho) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  if (existsSync(resolve(FUENTES, "fuentes.css"))) {
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

function medir(marca) {
  const raiz = document.getElementById("root");
  const problemas = [];
  const pieza = document.querySelector(`[data-${marca}]`);
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
    if (pieza?.contains(el) && !el.closest("[data-cejilla]") && parseFloat(getComputedStyle(el).fontSize) < 12) problemas.push(`${nombre}: letra de ${getComputedStyle(el).fontSize}`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  const caja = pieza?.closest("section") ?? pieza;
  const toques = [...(caja?.querySelectorAll("button") ?? [])].filter((b) => !b.matches("[data-por-que]")).map((b) => [b.textContent.trim().slice(0, 30), b.getBoundingClientRect()]).filter(([, r]) => r.width);
  for (const [t, r] of toques) if (r.height < 44) problemas.push(`el botón «${t}» mide ${r.height.toFixed(1)} px de alto`);
  const obj = document.querySelector("[data-objeto-n1], [data-titulo-hoja], [data-cobros-n4], [data-acciones-n5], [data-entra-n7]");
  return {
    problemas,
    botones: toques.length,
    botonMasBajo: toques.length ? Math.round(Math.min(...toques.map(([, r]) => r.height)) * 10) / 10 : null,
    objeto: obj && caja ? Math.round(obj.getBoundingClientRect().top - caja.getBoundingClientRect().top) : null,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}

const PIEZAS = {
  /* N1: los nueve ítems; la mala es la primera opción que no es la buena. */
  n1: { marca: "pieza", items: 9, async jugar(pg, k, estado) {
    const ops = await pg.$$eval("[data-op]", (bs) => bs.map((b) => b.dataset.op));
    const malo = ops[k % 2 === 0 ? ops.length - 1 : 0];
    await pg.click(`[data-op="${malo.replace(/"/g, '\\"')}"]`); await estado("consecuencia");
    await pg.waitForTimeout(450); await estado("veredicto");
  } },
  n3: { marca: "t5-n3", items: 5, async jugar(pg, k, estado) {
    const ops = await pg.$$eval("[data-opcion] button:not([disabled])", (bs) => bs.map((b) => b.closest("[data-opcion]").dataset.opcion));
    await pg.click(`[data-opcion="${ops[3]}"] button`); await estado("consecuencia");
    await pg.waitForTimeout(450); await estado("pista");
    const resto = await pg.$$eval("[data-opcion] button:not([disabled])", (bs) => bs.map((b) => b.closest("[data-opcion]").dataset.opcion));
    await pg.click(`[data-opcion="${resto[0]}"] button`); await pg.waitForTimeout(450); await estado("segundo");
    if (!(await pg.$('button:text-is("Siguiente ítem"), button:text-is("Siguiente caso"), button:text-is("Ver mi resumen")'))) {
      const otra = await pg.$$eval("[data-opcion] button:not([disabled])", (bs) => bs.map((b) => b.closest("[data-opcion]").dataset.opcion));
      await pg.click(`[data-opcion="${otra[0]}"] button`); await pg.waitForTimeout(450);
    }
  } },
  n4: { marca: "t5-n4", items: 2, async jugar(pg, k, estado) {
    if (k === 0) { await pg.click('[data-opcion="Cada mes"] button'); await estado("consecuencia"); await pg.waitForTimeout(450); await estado("veredicto"); return; }
    await pg.fill('[data-campo-cifra="primer-trimestre"]', "1728000"); await estado("escribe");
    await pg.click('button:text-is("Comprobar")'); await pg.waitForTimeout(450); await estado("veredicto");
  } },
  n5: { marca: "t5-n5", items: 3, async jugar(pg, k, estado) {
    const id = ["lo-que-recibe", "lo-que-costaron", "gano-o-perdio-1"][k];
    /* Condición 4 de Mello: la cifra correcta escrita, sin «Comprobar», no muestra nada. */
    if (k === 0) {
      await pg.fill(`[data-campo-cifra="${id}"]`, "2970000"); await pg.waitForTimeout(450); await estado("buena-escrita");
      const nada = await pg.evaluate(() => {
        const f = document.querySelector("[data-acciones-n5]").outerHTML;
        return { califica: /c4-cuadra|c4-falla| mal|data-barra/.test(f), mensaje: document.querySelector("[data-retro]")?.textContent ?? "", escrita: document.querySelector("[data-acciones-n5] [data-borrador]")?.textContent ?? null };
      });
      condicion4.push({ ancho: pg.viewportSize().width, ...nada });
      if (nada.califica || nada.mensaje.trim()) fallos.push(`n5 · condición 4: la cifra buena escrita muestra algo antes de comprobar (${JSON.stringify(nada)})`);
    }
    if (k === 2) await pg.click('[data-resultado="perdio"]');
    await pg.fill(`[data-campo-cifra="${id}"]`, k === 2 ? "165000" : "4860000"); await estado("escribe");
    await pg.click('button:text-is("Comprobar")'); await pg.waitForTimeout(450); await estado("pista");
    if (k === 2) await pg.click('[data-resultado="gano"]');
    await pg.fill(`[data-campo-cifra="${id}"]`, "1"); await pg.click('button:text-is("Comprobar")'); await pg.waitForTimeout(450); await estado("respuesta");
  } },
  n7: { marca: "t5-n7", items: 1, async jugar(pg, k, estado) {
    await pg.fill('[data-campo-cifra="costo-de-la-compra"]', "2150000"); await estado("escribe");
    await pg.click('button:text-is("Comprobar")'); await pg.waitForTimeout(450); await estado("pista");
    await pg.fill('[data-campo-cifra="costo-de-la-compra"]', "2000000"); await pg.click('button:text-is("Comprobar")'); await pg.waitForTimeout(450); await estado("respuesta");
  } },
};

for (const [clave, P] of Object.entries(PIEZAS)) {
  for (const ancho of ANCHOS) {
    const ctx = await contexto(ancho);
    const pg = await ctx.newPage();
    await pg.goto(`${BASE}#${clave}`);
    await pg.waitForSelector(`[data-${P.marca}]`);
    let n = 0;
    for (let k = 0; k < P.items; k++) {
      const estado = async (nombre) => {
        await pg.evaluate(() => document.fonts.ready);
        await pg.waitForTimeout(60);
        const m = await pg.evaluate(medir, P.marca);
        const etiqueta = `${clave}-${ancho}-${String(++n).padStart(2, "0")}-item${k + 1}-${nombre}`;
        filas.push({ pieza: clave, ancho, estado: `${k + 1} ${nombre}`, objetoPx: m.objeto, botones: m.botones, botonMasBajo: m.botonMasBajo, problemas: m.problemas.length });
        for (const p of m.problemas) fallos.push(`${etiqueta} · ${p}`);
        if (!m.fuentes) fallos.push(`${etiqueta} · no cargaron Inter o Sora`);
        if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `t5-${etiqueta}.png`), fullPage: true });
      };
      if (k === 0) await estado("inicio");
      await P.jugar(pg, k, estado);
      const sig = await pg.$('button:text-is("Siguiente ítem"), button:text-is("Siguiente caso")');
      if (sig && k < P.items - 1) await sig.click();
    }
    await ctx.close();
  }
}

await navegador.close();
await servidor.close();
console.table(filas);
console.log("Condición 4 (N5, cifra buena escrita sin comprobar):", JSON.stringify(condicion4));
if (fallos.length) { console.error(fallos.join("\n")); process.exit(1); }
console.log("C4 de T5 (N1, N3, N4, N5, N7) cabe a 375 y 320: sin desbordes, botones de 44 px o más, letra de 12 px o más, con Inter y Sora.");
