/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO DE T7-2 · A5 «FLETES Y DEVOLUCIONES EN PERMANENTE» (LA
 * FUSIÓN CON A6) A 375 Y 320?
 *
 *   FUENTES_DIR=/tmp/claude-0/fuentes node scripts/t7/medir-t7-2-a5.mjs [carpeta-de-capturas]
 *
 * Como medir-t7-1-a7.mjs: Chromium de verdad, la vista de T7-2 montada tal
 * cual con la hoja de estilos del sitio (banco scripts/t7/harness-t7-2). Juega
 * A5 entera —en P1, P2, P3 y P5 falla con cada opción equivocada y acierta;
 * en P4 pone la línea de Inventario de mercancías en el lado equivocado y
 * después acierta; en cada acierto abre el «¿Por qué?» y el «Ver…» que
 * traiga— y en cada uno de sus 25 estados comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que se hayan medido Inter y, donde hay pregunta, Sora: no la fuente
 *     de reserva
 *   · que cada opción, cada lado y cada botón midan al menos 44 px de alto
 *   · en P3, que la X de una línea equivocada quede dentro del panel
 *   · en los asientos, que cada monto quepa en su celda sin partirse y que
 *     el ● de los montos que no se muestran quede en su columna
 *   · que las figuras de la fusión (renglones, la cuenta y las fichas,
 *     provisionales para Watari) no se salgan de su caja
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
const A2 = '[data-pieza="t7-2-a5-fletes"]';

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-t7-2/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];

/* Google Fonts no siempre se alcanza: con FUENTES_DIR (fuentes.css y los .woff2), se sirven desde el disco (como medir-t7-3-a6.mjs). */
async function servirFuentes(ctx) {
  const dir = process.env.FUENTES_DIR;
  if (!dir) return;
  const { readFileSync } = await import("node:fs");
  const css = readFileSync(resolve(dir, "fuentes.css"), "utf8");
  await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => {
    const u = route.request().url();
    if (u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
    try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(dir, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return route.abort(); }
  });
}
const filas = [];

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script, .t7bp-sr"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  for (const b of pieza.querySelectorAll("button")) {
    /* El «¿Por qué?» va en línea con el texto: su área de toque de 44 px es su ::before (plegable.jsx). */
    const h = Math.max(b.getBoundingClientRect().height, b.matches("[data-por-que]") ? parseFloat(getComputedStyle(b, "::before").height) || 0 : 0);
    if (h < 44) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  /* El número de cada ítem de la lista es un ::marker: se mide su borde izquierdo con el relleno de la lista. */
  const ol = pieza.querySelector("ol[data-lista]");
  if (ol) {
    /* Los números se ven: la hoja global del sitio quita el estilo de lista y la lista tiene que devolverlo. */
    for (const li of ol.querySelectorAll("li")) {
      const e = getComputedStyle(li);
      if (e.display !== "list-item" || e.listStyleType !== "decimal") problemas.push(`el ítem «${li.textContent.slice(0, 30)}» no lleva su número (${e.display}, ${e.listStyleType})`);
    }
    const izq = ol.getBoundingClientRect().left;
    if (izq < caja.left) problemas.push("la lista numerada empieza fuera del panel");
  }
  for (const celda of pieza.querySelectorAll("[data-asiento] [role=cell]")) {
    const r = celda.getBoundingClientRect();
    const rango = document.createRange();
    /* Del monto que no se muestra se mide el ●: lo demás es solo para el lector de pantalla. */
    rango.selectNodeContents(celda.querySelector("[data-oculto] [aria-hidden]") ?? celda);
    const t = rango.getBoundingClientRect();
    if (t.width && (t.right > r.right + 0.5 || t.left < r.left - 0.5)) problemas.push(`el monto «${celda.textContent}» no cabe en su celda`);
    if (t.width && t.height > 26) problemas.push(`el monto «${celda.textContent}» se parte en dos líneas`);
  }
  for (const fig of pieza.querySelectorAll("[data-figura-t72]")) {
    const c = fig.getBoundingClientRect();
    for (const x of fig.querySelectorAll("[data-renglon] > span, p, li")) {
      const r = x.getBoundingClientRect();
      if (r.left < c.left - 0.5 || r.right > c.right + 0.5) problemas.push(`«${x.textContent.slice(0, 30)}» se sale de su figura`);
    }
  }
  for (const x of pieza.querySelectorAll("[data-marca]")) {
    const r = x.getBoundingClientRect();
    if (r.left < caja.left - 0.5 || r.top < caja.top - 0.5) problemas.push("la X de una línea equivocada se sale del panel");
  }
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    /* Sora 600 solo se pide cuando hay una pregunta en pantalla (P5): la vista de T7-2 tiene una sola pieza. */
    fuentes: document.fonts.check("15px Inter") && (!pieza.querySelector("[data-pregunta]") || document.fonts.check("600 15px Sora")),
  };
}

const correctas = { "lo-asume-el-comprador": "inventario", "lo-asume-el-vendedor": "gasto", "libro-del-comprador": "inventario", "frente-al-periodico": "no-existe" };
/* P4: las líneas y su lado, y la que se pone mal a propósito. */
const LADOS = { inventario: "debe", costo: "haber" };
const MALAS = ["inventario"];
const otro = (l) => (l === "debe" ? "haber" : "debe");

for (const ancho of ANCHOS) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await servirFuentes(ctx);
  const pg = await ctx.newPage();
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(A2);
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, A2);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) {
      const panel = await (await pg.$(A2)).evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `t7-2-a5-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const en = (sel) => `${A2} ${sel}`;
  const clic = (sel) => pg.click(en(sel));
  /* Lo del acierto: el foco en el mensaje, el «¿Por qué?» abierto y el «Ver…» abierto, si los trae. */
  const abrirLoDelAcierto = async (id) => {
    if (!(await pg.evaluate(() => document.activeElement?.matches("[data-mensaje]")))) fallos.push(`${ancho} px · ${id} · el foco no va al mensaje`);
    if (await pg.$(en("[data-mensaje] [data-por-que]"))) { await clic("[data-mensaje] [data-por-que]"); await estado(`${id}-porque`); }
    if (await pg.$(en("[data-ver] button"))) { await clic("[data-ver] button"); await estado(`${id}-ver`); }
  };
  for (let vuelta = 0; vuelta < 10; vuelta++) {
    const id = await pg.getAttribute(A2, "data-pantalla");
    if (await pg.$(en("[data-lados]"))) {
      await estado(`${id}-colocando`);
      for (const [l, lado] of Object.entries(LADOS)) await clic(`[data-linea="${l}"][data-lado="${MALAS.includes(l) ? otro(lado) : lado}"]`);
      await clic('[data-boton="confirmar"]');
      await estado(`${id}-error`);
      await clic('[data-boton="probar-otra"]');
      for (const l of MALAS) await clic(`[data-linea="${l}"][data-lado="${LADOS[l]}"]`);
      await clic('[data-boton="confirmar"]');
      await estado(`${id}-acierto`);
      await abrirLoDelAcierto(id);
      await clic('[data-boton="seguir"]');
      continue;
    }
    if (await pg.$(en("[data-eleccion]"))) {
      await estado(`${id}-colocando`);
      const malas = await pg.$$eval(en("[data-opcion]"), (bs, c) => bs.map((b) => b.dataset.opcion).filter((o) => o !== c).sort(), correctas[id]);
      for (const mala of malas) {
        await clic(`[data-opcion="${mala}"]`); await clic('[data-boton="confirmar"]');
        await estado(`${id}-error-${mala}`);
        await clic('[data-boton="probar-otra"]');
      }
      await clic(`[data-opcion="${correctas[id]}"]`); await clic('[data-boton="confirmar"]');
      await estado(`${id}-acierto`);
      await abrirLoDelAcierto(id);
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

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | alto pieza");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.alto}`);
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
if (estados !== 25) fallos.push(`se recorrieron ${estados} estados y son 25`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto se sale a 375 ni a 320 px.");
