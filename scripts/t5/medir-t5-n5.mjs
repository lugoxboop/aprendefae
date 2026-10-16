/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE N5 DE T5 «¿GANÓ O PERDIÓ?» (v2) A 375 Y 320?
 *
 *   node scripts/t5/medir-t5-n5.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad: la vista de T5 en el modo Hacer, con N5 abierto y la
 * hoja de estilos del sitio (banco scripts/t5/harness-t5). Juega la tanda
 * entera con la escalera —un error reconocido en el ítem 1, dos errores en el
 * 3, dos líneas mal y una bien en el asiento 1— y mide cada estado: la pista,
 * la respuesta, el acierto, la figura que crece y el asiento 1 plegado.
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja ni de la pantalla
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada botón de la pieza mida al menos 44 px de alto
 *
 * Google Fonts no se alcanza desde la máquina de medida: si existe
 * FUENTES (por omisión /tmp/claude-0/fuentes, con fuentes.css y los woff2
 * descargados), se sirven desde ahí. Sale con código 1 si algo falla.
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
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t5/harness-t5/index.html#n5`;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const fallos = [];
const filas = [];

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

function medir() {
  const raiz = document.getElementById("root");
  const problemas = [];
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
  /* El distintivo no pisa el contador (a 320, «Vale el primer intento» lo montaba). */
  for (const c of document.querySelectorAll("[data-contador-intento]")) {
    const d = c.querySelector("[data-un-intento]").getBoundingClientRect();
    for (const el of c.firstElementChild.querySelectorAll("*")) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const r = el.getBoundingClientRect();
      if (r.left < d.right - 0.5 && d.left < r.right - 0.5 && r.top < d.bottom - 0.5 && d.top < r.bottom - 0.5) problemas.push(`el distintivo pisa «${el.textContent.trim()}»`);
    }
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  /* En el cierre ya no hay pieza: su botón es el del cierre compartido (juego.jsx), que no es de la célula. */
  const pieza = document.querySelector("[data-t5-n5]")?.parentElement ?? null;
  /* Los botones de la pieza, menos el «¿Por qué?» del plegado, que va en línea con su área de toque aparte. */
  const toques = [...(pieza?.querySelectorAll("button") ?? [])].filter((b) => !b.matches("[data-por-que]")).map((b) => [b.textContent.trim().slice(0, 30), b.getBoundingClientRect()]).filter(([, r]) => r.width);
  for (const [t, r] of toques) if (r.height < 44) problemas.push(`el botón «${t}» mide ${r.height.toFixed(1)} px de alto`);
  return {
    problemas,
    alto: Math.round(document.documentElement.scrollHeight),
    botones: toques.length,
    botonMasBajo: toques.length ? Math.round(Math.min(...toques.map(([, r]) => r.height)) * 10) / 10 : null,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}

for (const ancho of ANCHOS) {
  const ctx = await contexto(ancho);
  const pg = await ctx.newPage();
  await pg.goto(URL_BANCO);
  await pg.waitForSelector("[data-t5-n5]");
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(200);
    const m = await pg.evaluate(medir);
    filas.push({ ancho, estado: nombre, ...m, problemas: m.problemas.length });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `t5-n5-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`), fullPage: true });
  };
  const escribir = (id, v) => pg.fill(`[data-campo-cifra="${id}"]`, v);
  const comprobar = () => pg.click('button:text-is("Comprobar")');
  const siguiente = () => pg.click('button:text-is("Siguiente ítem"), button:text-is("Ver mi resumen")');
  const armar = async (id, cuenta, lado) => {
    await pg.click(`[data-linea-cuenta="${id}"] [data-ficha-cuenta="${cuenta}"]`);
    await pg.click(`[data-linea-cuenta="${id}"] button:text-is("${lado}")`);
  };

  await estado("01-inicio");
  await escribir("lo-que-recibe", "4860000"); await comprobar(); await estado("02-item1-error-reconocido");
  await escribir("lo-que-recibe", "2970000"); await comprobar(); await estado("03-item1-acierto"); await siguiente();
  await escribir("lo-que-costaron", "2805000"); await comprobar(); await estado("04-item2-acierto"); await siguiente();
  await pg.click('[data-resultado="perdio"]'); await escribir("gano-o-perdio-1", "165000"); await estado("05-item3-antes");
  await comprobar(); await estado("06-item3-error");
  await escribir("gano-o-perdio-1", "1"); await comprobar(); await estado("07-item3-respuesta"); await siguiente();
  await armar("caja", "Inversiones – títulos", "Debe");
  await armar("inversiones", "Inversiones – títulos", "Haber");
  await armar("ganancia", "Ingresos financieros – ganancia en venta de títulos", "Debe");
  await estado("08-asiento1-antes");
  await comprobar(); await estado("09-asiento1-pistas");
  await armar("caja", "Caja", "Debe");
  await armar("ganancia", "Gastos financieros – pérdida en venta de títulos", "Haber");
  await comprobar(); await estado("10-asiento1-respuesta"); await siguiente();
  await pg.click('[data-resultado="perdio"]'); await escribir("gano-o-perdio-2", "245000"); await comprobar(); await estado("11-item7-acierto"); await siguiente();
  await estado("12-asiento2-plegado");
  await armar("caja", "Caja", "Debe");
  await armar("perdida", "Gastos financieros – pérdida en venta de títulos", "Debe");
  await armar("inversiones", "Inversiones – títulos", "Haber");
  await comprobar(); await estado("13-asiento2-desplegado"); await siguiente();
  await estado("14-cierre");
  await ctx.close();
}

await navegador.close();
await servidor.close();
console.table(filas);
if (fallos.length) { console.error(fallos.join("\n")); process.exit(1); }
console.log("N5 cabe a 375 y 320: sin desbordes, botones de 44 px o más, con Inter y Sora.");
