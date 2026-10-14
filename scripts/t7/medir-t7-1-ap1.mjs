/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO DE «LA CUENTA QUE NO SE MUEVE» A 375 Y A 320 PX?
 *
 *   node scripts/t7/medir-t7-1-ap1.mjs [carpeta-de-capturas]
 *
 * jsdom no calcula diseño, así que esto no puede vivir en `npm test`: se mide
 * en Chromium de verdad, con la vista del tema montada tal cual y la hoja de
 * estilos del sitio (Inter y Sora). Recorre las siete pantallas y los once
 * estados —en cada pregunta falla con cada opción equivocada y después
 * acierta— a 375 y a 320 px, y en cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún elemento con texto se salga de su caja (scrollWidth)
 *   · que ningún elemento con texto se salga del panel de la pieza
 *   · que las fuentes que se midieron sean Inter y Sora, y no la de reserva
 *
 * Sale con código 1 si algo falla, y escribe una tabla con las medidas.
 * Necesita Playwright (no es dependencia del repo): toma el que haya
 * instalado en la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const rutaPlaywright = process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright";
const { chromium } = require(rutaPlaywright);
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });

const ANCHOS = [375, 320];

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const { port } = servidor.httpServer.address();
const URL_BANCO = `http://127.0.0.1:${port}/scripts/t7/harness/index.html`;

const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

/* Lo que se mide en cada estado. Corre dentro de la página. */
function medir() {
  const panel = document.querySelector("[data-pieza]").closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...document.querySelectorAll("h1, [data-pieza] *, section > header *")]
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    const estilo = getComputedStyle(el);
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (estilo.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) {
      problemas.push(`${nombre}: el texto mide ${el.scrollWidth} px y la caja ${el.clientWidth} px`);
    }
    if (el.closest("[data-pieza], section > header") && (r.right > caja.right + 0.5 || r.left < caja.left - 0.5)) {
      problemas.push(`${nombre}: se sale del panel (${r.left.toFixed(1)}–${r.right.toFixed(1)} contra ${caja.left.toFixed(1)}–${caja.right.toFixed(1)})`);
    }
  }
  const raiz = document.documentElement;
  if (raiz.scrollWidth > window.innerWidth) problemas.push(`la página mide ${raiz.scrollWidth} px de ancho en una ventana de ${window.innerWidth}`);
  const fuente = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).fontFamily.split(",")[0].replace(/"/g, "").trim() : null;
  };
  const linea = document.querySelector("[data-linea]");
  const anchoUtil = (el) => {
    const e = getComputedStyle(el);
    return el.clientWidth - parseFloat(e.paddingLeft) - parseFloat(e.paddingRight);
  };
  const lineaSpans = linea ? [...linea.children].map((s) => s.getBoundingClientRect()) : [];
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    textos: conTexto.length,
    fuentes: {
      inter: document.fonts.check("14px Inter"),
      sora: document.fonts.check("700 14px Sora"),
      parrafo: fuente("[data-texto]"),
      titulo: fuente("section > header h3"),
    },
    linea: linea ? {
      util: Math.round(anchoUtil(linea) * 10) / 10,
      contenido: Math.round((Math.max(...lineaSpans.map((r) => r.right)) - Math.min(...lineaSpans.map((r) => r.left))) * 10) / 10,
      renglones: new Set(lineaSpans.map((r) => Math.round(r.top))).size,
    } : null,
  };
}

for (const ancho of ANCHOS) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: 800 }, deviceScaleFactor: 2 });
  await pagina.goto(URL_BANCO);
  await pagina.waitForSelector("[data-pieza]");
  await pagina.evaluate(() => document.fonts.ready);

  const estado = async (nombre) => {
    await pagina.evaluate(() => document.fonts.ready);
    const m = await pagina.evaluate(medir);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes.inter || !m.fuentes.sora) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora: se habría medido la fuente de reserva`);
    if (CAPTURAS) await pagina.screenshot({ path: resolve(CAPTURAS, `${ancho}-${String(filas.filter((f) => f.ancho === ancho).length).padStart(2, "0")}-${nombre}.png`), fullPage: true });
  };
  const clic = (sel) => pagina.click(sel);
  const pantalla = () => pagina.getAttribute("[data-pieza]", "data-pantalla");

  for (let vuelta = 0; vuelta < 7; vuelta++) {
    const id = await pantalla();
    const pregunta = await pagina.$("[data-pregunta]");
    if (!pregunta) {
      await estado(id);
      const b = await pagina.$("[data-boton]");
      if (!b) break;
      await b.click();
      continue;
    }
    await estado(`${id}-colocando`);
    const correcta = id === "pregunta-compra" ? "compras" : "inventario";
    const malas = await pagina.$$eval("[data-opcion]", (bs, c) => bs.map((b) => b.dataset.opcion).filter((o) => o !== c), correcta);
    for (const mala of malas) {
      await clic(`[data-opcion="${mala}"]`);
      await clic('[data-boton="confirmar"]');
      await estado(`${id}-error-${mala}`);
      await clic('[data-boton="probar-otra"]');
    }
    await clic(`[data-opcion="${correcta}"]`);
    await clic('[data-boton="confirmar"]');
    await estado(`${id}-acierto`);
    await clic('[data-boton="seguir"]');
  }
  await pagina.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel px | textos | fuente párrafo / título | línea: útil / contenido / renglones");
for (const f of filas) {
  const l = f.linea ? `${f.linea.util} / ${f.linea.contenido} / ${f.linea.renglones}` : "—";
  console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.textos} | ${f.fuentes.parrafo} / ${f.fuentes.titulo} | ${l}`);
}
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
if (estados !== 13) fallos.push(`se recorrieron ${estados} estados y son 13`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto se sale a 375 ni a 320 px.");
