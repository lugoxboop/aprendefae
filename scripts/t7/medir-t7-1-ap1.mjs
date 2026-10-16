/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE «LA CUENTA QUE NO SE MUEVE» (v6, renovada) A 320, 375 Y 1280 PX?
 *
 *   FUENTES_DIR=/carpeta/con/fuentes.css CHROMIUM_PATH=… \
 *     node scripts/t7/medir-t7-1-ap1.mjs [carpeta-de-capturas]
 *
 * jsdom no calcula diseño, así que esto no puede vivir en `npm test`: se mide
 * en Chromium de verdad, con la vista del tema montada tal cual (el banco
 * scripts/t7/harness) y la hoja del sitio (Inter y Sora). Recorre las seis
 * pantallas de la pieza y sus estados (la venta, la compra con sus dos
 * errores y el acierto, el conteo, la cuenta y el valor del cierre con sus
 * dos errores, el cierre, y el resumen de vuelta al día 1), y en cada estado:
 *
 *   · la página no tiene barra horizontal
 *   · ningún elemento con texto se sale de su caja ni del panel de la pieza
 *   · la letra medida es Inter y Sora, no la de reserva, y ninguna baja de 12 px
 *   · cada botón de la pieza (también las cuentas del libro) y el deslizador
 *     miden 44 px de alto o más
 *   · B1 (enganche.md): a 320, la figura empieza en los primeros 280 px de la
 *     tarjeta
 *
 * Sale con código 1 si algo falla, y escribe una tabla con las medidas.
 * Necesita Playwright (no es dependencia del repo): el de PLAYWRIGHT_MODULE o
 * /opt/node-tools/node_modules/playwright.
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

const ANCHOS = [320, 375, 1280];

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const { port } = servidor.httpServer.address();
const URL_BANCO = `http://127.0.0.1:${port}/scripts/t7/harness/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

/* Las fuentes de Google desde disco, si hay carpeta: la letra medida es la real. */
const FUENTES = process.env.FUENTES_DIR ?? null;
async function nuevaPagina(opciones) {
  const pagina = await navegador.newPage(opciones);
  if (FUENTES && existsSync(`${FUENTES}/fuentes.css`)) {
    const css = readFileSync(`${FUENTES}/fuentes.css`, "utf8");
    await pagina.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (ruta) => {
      const u = ruta.request().url();
      if (u.includes("googleapis")) return ruta.fulfill({ status: 200, contentType: "text/css", body: css });
      const f = `${FUENTES}/${u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_")}`;
      return existsSync(f) ? ruta.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(f) }) : ruta.abort();
    });
  }
  return pagina;
}

const fallos = [];
const filas = [];

/* Lo que se mide en cada estado. Corre dentro de la página. */
function medir() {
  const raiz = document.querySelector('[data-pieza="t7-1-a1-la-cuenta-que-no-se-mueve"]');
  const panel = raiz.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...raiz.querySelectorAll("*"), ...panel.querySelectorAll(":scope > header *")]
    .filter((el) => !el.closest("[hidden]") && !el.matches("style, script"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  let minLetra = Infinity;
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    const e = getComputedStyle(el);
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    /* El rótulo del marco (Panel, compartido: 10,5 px) no es de la pieza; se le anota a Erwin. */
    if (raiz.contains(el)) minLetra = Math.min(minLetra, parseFloat(e.fontSize));
    if (e.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: el texto mide ${el.scrollWidth} px y la caja ${el.clientWidth} px`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
  }
  /* DEBE y HABER son ::before. */
  for (const col of raiz.querySelectorAll(".t7a1-col")) minLetra = Math.min(minLetra, parseFloat(getComputedStyle(col, "::before").fontSize));
  if (minLetra < 12) problemas.push(`letra de ${minLetra} px`);
  const botones = [...raiz.querySelectorAll("button, input[type=range]")].filter((b) => b.getBoundingClientRect().height > 0);
  let minBoton = Infinity;
  for (const b of botones) {
    const alto = b.getBoundingClientRect().height;
    minBoton = Math.min(minBoton, alto);
    if (alto < 43.5) problemas.push(`«${(b.textContent || b.className).trim().slice(0, 30)}» mide ${alto.toFixed(1)} px de alto`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px de ancho en ${window.innerWidth}`);
  const fig = raiz.querySelector("[data-figura]").getBoundingClientRect();
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    contenido: Math.round(raiz.getBoundingClientRect().width * 10) / 10,
    figuraDesdeTope: Math.round(fig.top - caja.top),
    alto: Math.round(caja.height),
    minLetra, minBoton: Math.round(minBoton * 10) / 10, botones: botones.length,
    fuentes: { inter: document.fonts.check("14px Inter"), sora: document.fonts.check("700 14px Sora"), txt: getComputedStyle(raiz.querySelector(".t7a1-txt")).fontFamily.split(",")[0] },
  };
}

for (const ancho of ANCHOS) {
  const pagina = await nuevaPagina({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await pagina.goto(URL_BANCO);
  await pagina.waitForSelector("[data-pieza]");
  await pagina.evaluate(() => document.fonts.ready);
  const A = '[data-pieza="t7-1-a1-la-cuenta-que-no-se-mueve"]';
  let n = 0;
  const estado = async (nombre) => {
    await pagina.waitForTimeout(700); /* que terminen las animaciones (320 ms la más larga, 700 el conteo) */
    const m = await pagina.evaluate(medir);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes.inter || !m.fuentes.sora) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (ancho === 320 && m.figuraDesdeTope > 280) fallos.push(`320 px · ${nombre} · B1: la figura empieza a ${m.figuraDesdeTope} px`);
    if (CAPTURAS) {
      const panel = await pagina.$(`${A}`);
      await (await panel.evaluateHandle((el) => el.closest("section"))).asElement().screenshot({ path: resolve(CAPTURAS, `${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const clic = (sel) => pagina.click(`${A} ${sel}`);
  const dia = (d) => pagina.$eval(`${A} .t7a1-rango`, (r, v) => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    set.call(r, String(v)); r.dispatchEvent(new Event("input", { bubbles: true }));
  }, d);

  await estado("p1-portada");
  await clic(".t7a1-seguir");
  await estado("p2-dia-1");
  await dia(9); await pagina.waitForTimeout(100); await estado("p2-venta-del-9");
  await clic(".t7a1-seguir");
  await dia(16); await estado("p3-compra-espera");
  await clic('[data-cuenta="inventario"]'); await estado("p3-error-inventario");
  await clic('[data-cuenta="gastos"]'); await estado("p3-pista");
  await clic('[data-cuenta="compras"]'); await estado("p3-acierto");
  await clic(".t7a1-seguir");
  await dia(3); await estado("p4-dia-3");
  await dia(22); await dia(28); await dia(29); await estado("p4-dia-29");
  await clic(".t7a1-seguir");
  await estado("p5-llega");
  await clic('[data-accion="contar"]'); await estado("p5-contado");
  await clic('[data-cuenta="compras"]'); await estado("p5-cuenta-error");
  await clic('[data-cuenta="gastos"]'); await estado("p5-cuenta-pista");
  await clic('[data-cuenta="inventario"]'); await estado("p5-valor-pregunta");
  await clic('[data-valor="4000000"]'); await estado("p5-valor-error");
  await clic('[data-valor="9000000"]'); await estado("p5-valor-pista");
  await clic('[data-valor="2500000"]'); await estado("p5-cierre");
  await clic(".t7a1-seguir");
  await estado("p6-dia-30");
  await dia(1); await estado("p6-dia-1");
  await pagina.close();
}

/* Movimiento reducido: el estado final, sin animación ni transición en marcha. */
{
  const pagina = await nuevaPagina({ viewport: { width: 375, height: 900 }, reducedMotion: "reduce" });
  await pagina.goto(URL_BANCO);
  await pagina.waitForSelector("[data-pieza]");
  const A = '[data-pieza="t7-1-a1-la-cuenta-que-no-se-mueve"]';
  await pagina.click(`${A} .t7a1-seguir`);
  await pagina.$eval(`${A} .t7a1-rango`, (r) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(r, "9"); r.dispatchEvent(new Event("input", { bubbles: true })); });
  const r = await pagina.$eval(A, (el) => ({
    saliendo: el.querySelectorAll(".t7a1-caja.sale").length,
    vivas: el.querySelectorAll(".t7a1-caja:not(.sale)").length,
    animaciones: [...el.querySelectorAll("*")].filter((x) => getComputedStyle(x).animationName !== "none" || parseFloat(getComputedStyle(x).transitionDuration) > 0).length,
  }));
  console.log(`Movimiento reducido, del 1 al 9: ${r.vivas} cajas, ${r.saliendo} saliendo, ${r.animaciones} elementos con animación o transición`);
  if (r.saliendo || r.vivas !== 5 || r.animaciones) fallos.push(`movimiento reducido: ${JSON.stringify(r)}`);
  await pagina.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | contenido | figura desde el tope | alto | letra mín. | botón mín. (n) | fuente");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.contenido} | ${f.figuraDesdeTope} | ${f.alto} | ${f.minLetra} | ${f.minBoton} (${f.botones}) | ${f.fuentes.txt}`);
console.log(`\n${filas.length} medidas (${new Set(filas.map((f) => f.estado)).size} estados × ${ANCHOS.length} anchos).`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: nada se sale a 320, 375 ni 1280 px; botones y deslizador de 44 px; letra de 12 px o más; B1 a 320.");
