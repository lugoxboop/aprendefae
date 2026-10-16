/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABEN LOS RECORTES DE T7-2 (A1, A2 Y A3) A 375 Y 320?
 *
 *   node scripts/t7/medir-t7-2-recortes.mjs [carpeta-de-capturas]
 *
 * Reemplaza, para estas tres piezas, a medir-t7-2-a1.mjs, -a2.mjs y -a3.mjs,
 * que juegan las pantallas de antes de los recortes. Chromium de verdad, la
 * vista de T7-2 montada tal cual con la hoja de estilos del sitio (banco
 * scripts/t7/harness-t7-2). Juega cada pieza entera, de forma genérica: en
 * cada pregunta falla con cada opción equivocada (pista, luego la respuesta)
 * y acierta; en cada pantalla de lados pone todas las líneas mal dos veces y
 * luego bien; abre cada «¿Por qué?» y cada «Ver…». En cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que cada botón de la pieza mida al menos 44 px de alto (el «¿Por
 *     qué?» va en línea y crece por fuera: se mide su área de toque)
 *   · que ninguna letra de la pieza mida menos de 12 px
 *   · en el kárdex y en la tabla de los tres métodos, que cada cifra quepa
 *     en su celda sin partirse
 *
 * Las fuentes de Google se sirven desde /tmp/claude-0/fuentes (la red está
 * cerrada), como en /tmp/claude-0/medir/comun.mjs. Sale con código 1 si algo
 * falla. Necesita Playwright (no es dependencia del repo).
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
/* A3 salió de aquí con el Patrón de enganche C2 («el kárdex que crece»): la mide medir-t7-2-a3.mjs. */
const PIEZAS = ["t7-2-a1-la-cuenta-que-si-se-mueve", "t7-2-a2-la-venta-en-dos-asientos"];
const FUENTES = "/tmp/claude-0/fuentes/";

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-t7-2/index.html`;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const fallos = [];
const filas = [];

async function contexto(ancho) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  let css = null;
  try { css = readFileSync(FUENTES + "fuentes.css", "utf8"); } catch { /* sin fuentes locales: se mide con la de reserva y se avisa */ }
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith("http://127.0.0.1")) return route.continue();
    if (css && u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
    if (u.startsWith("https://fonts.gstatic.com/")) {
      try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(FUENTES + u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_")) }); } catch { return route.abort(); }
    }
    return route.abort();
  });
  return ctx;
}

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...pieza.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script, .t7bp-sr, .t7b2-sr"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    const cs = getComputedStyle(el);
    if (cs.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
    if (parseFloat(cs.fontSize) < 12) problemas.push(`${nombre}: letra de ${cs.fontSize}`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  for (const b of pieza.querySelectorAll("button")) {
    if (!b.getBoundingClientRect().width) continue;
    /* El «¿Por qué?» va en línea: su área de toque es el ::before de 44 × 44. */
    const h = b.matches("[data-por-que]") ? parseFloat(getComputedStyle(b, "::before").height) : b.getBoundingClientRect().height;
    if (h < 44) problemas.push(`«${(b.textContent || b.getAttribute("aria-label") || "").trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  for (const celda of pieza.querySelectorAll("[data-kardex] [data-capa] > span, [data-kardex] [data-total] > span, [data-metodos] [data-dato-metodo], [data-asiento] [role=cell]")) {
    const r = celda.getBoundingClientRect();
    if (!celda.textContent.trim()) continue;
    const rango = document.createRange();
    /* Del monto que no se muestra se mide su casilla vacía: lo demás es solo para el lector de pantalla. */
    rango.selectNodeContents(celda.querySelector("[data-oculto] [aria-hidden]") ?? celda);
    const t = rango.getBoundingClientRect();
    if (t.width && (t.right > r.right + 0.5 || t.left < r.left - 0.5)) problemas.push(`la cifra «${celda.textContent}» no cabe en su celda`);
    if (t.width && t.height > 26) problemas.push(`la cifra «${celda.textContent}» se parte en dos líneas`);
  }
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    fuentes: document.fonts.check("15px Inter") && (!pieza.querySelector("[data-pregunta], [data-consigna]") || document.fonts.check("600 15px Sora")),
  };
}

const otro = (l) => (l === "debe" ? "haber" : "debe");
/* Las respuestas, por pantalla (los ids no se repiten con respuestas distintas en estas tres piezas). */
const CORRECTA = { "el-permanente": "cada-venta", "el-conteo-en-el-permanente": "verificar", "la-compra": "inventario", "por-que-dos-asientos": "cada-venta", peps: "inicio-y-5", ueps: "del-14", promedio: "2195", "lado-a-lado": "peps" };
const LADO = { compra: "debe", "devuelven-clientes": "debe", vende: "haber", "devuelve-proveedores": "haber", consumo: "haber", costo: "debe", inventario: "haber" };

for (const ancho of ANCHOS) {
  for (const id of PIEZAS) {
    const ctx = await contexto(ancho);
    const pg = await ctx.newPage();
    const SEL = `[data-pieza="${id}"]`;
    await pg.goto(URL_BANCO);
    await pg.waitForSelector(SEL);
    let n = 0;
    const corto = id.split("-").slice(0, 3).join("-");
    const estado = async (nombre) => {
      await pg.evaluate(() => document.fonts.ready);
      const m = await pg.evaluate(medir, SEL);
      filas.push({ ancho, estado: `${corto} · ${nombre}`, ...m });
      for (const p of m.problemas) fallos.push(`${ancho} px · ${corto} · ${nombre} · ${p}`);
      if (!m.fuentes) fallos.push(`${ancho} px · ${corto} · ${nombre} · no cargaron Inter o Sora`);
      if (CAPTURAS) {
        const panel = await (await pg.$(SEL)).evaluateHandle((x) => x.closest("section"));
        await panel.asElement().screenshot({ path: resolve(CAPTURAS, `${corto}-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
      }
    };
    const en = (sel) => `${SEL} ${sel}`;
    const clic = (sel) => pg.click(en(sel));
    const abrirTodo = async (pantalla) => {
      for (const b of await pg.$$(en("[data-por-que]"))) await b.click();
      for (const b of await pg.$$(en("[data-ver] button[aria-expanded='false']"))) await b.click();
      if (await pg.$(en("[data-plegado], [data-visto]"))) await estado(`${pantalla}-abierto`);
    };
    for (let vuelta = 0; vuelta < 12; vuelta++) {
      const p = await pg.getAttribute(SEL, "data-pantalla");
      if (await pg.$(en("[data-lados]"))) {
        const lineas = await pg.$$eval(en("[data-fila]"), (fs) => fs.map((f) => f.dataset.fila));
        await estado(`${p}-colocando`);
        if (await pg.$(en("[data-ver] button"))) { await clic("[data-ver] button"); await estado(`${p}-ver`); await clic("[data-ver] button"); }
        for (const ronda of [1, 2]) {
          for (const l of lineas) await clic(`[data-linea="${l}"][data-lado="${otro(LADO[l])}"]`);
          await clic('[data-boton="confirmar"]');
          await estado(`${p}-error-${ronda}`);
          await clic('[data-boton="probar-otra"]');
        }
        await clic('[data-boton="confirmar"]');
        await estado(`${p}-acierto`);
        await abrirTodo(p);
        await clic('[data-boton="seguir"]');
        continue;
      }
      if (await pg.$(en("[data-eleccion]"))) {
        await estado(`${p}-colocando`);
        const malas = await pg.$$eval(en("[data-opcion]"), (bs, c) => bs.map((b) => b.dataset.opcion).filter((o) => o !== c).sort(), CORRECTA[p]);
        if (malas.length !== 2) throw new Error(`${id} · ${p}: no encontré la correcta`);
        for (const [k, o] of malas.entries()) {
          await clic(`[data-opcion="${o}"]`); await clic('[data-boton="confirmar"]');
          await estado(`${p}-error-${k + 1}`);
          await clic('[data-boton="probar-otra"]');
        }
        await clic(`[data-opcion="${CORRECTA[p]}"]`); await clic('[data-boton="confirmar"]');
        await estado(`${p}-acierto`);
        await abrirTodo(p);
        await clic('[data-boton="seguir"]');
        continue;
      }
      await estado(p);
      const b = await pg.$(en("[data-boton]"));
      if (!b) break;
      await b.click();
    }
    await ctx.close();
  }
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | alto pieza");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.alto}`);
console.log(`\n${filas.length} medidas (${new Set(filas.map((f) => f.estado)).size} estados × ${ANCHOS.length} anchos).`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto se sale a 375 ni a 320 px; botones de 44; letra de 12 o más.");
