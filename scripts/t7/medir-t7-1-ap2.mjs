/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO Y CADA CIFRA DE AP2 «LA FACTURA COMPLETA» A 375 Y 320?
 *
 *   node scripts/t7/medir-t7-1-ap2.mjs [carpeta-de-capturas]
 *
 * Como medir-t7-1-ap1.mjs: Chromium de verdad, la vista de T7-1 montada tal
 * cual con la hoja de estilos del sitio. Juega AP2 entera —en cada pregunta
 * falla con cada opción equivocada y acierta; en cada asiento coloca todo al
 * revés, confirma, corrige y acierta— y en cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto ni ninguna cifra se salga de su caja (scrollWidth)
 *   · que cada cifra quepa en el área útil de su casilla
 *   · que nada con texto se salga del panel de la pieza
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · en la tabla lado a lado, que las dos columnas midan lo mismo y que
 *     cada cuenta vaya pegada a su rótulo de lado
 *   · con movimiento reducido, que las casillas cambien sin transición
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
const AP2 = '[data-pieza="t7-1-a2-la-factura-completa"]';

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.closest(".t7a2-sr, .t7a2-cas-nada") && !el.matches("style, script"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  /*
   * Cada cifra, dentro del área útil de su casilla. Va aparte del chequeo de
   * arriba porque la cifra vive en un span sin ancho propio: si no cabe, el
   * span no se desborda, se sale de la casilla.
   */
  for (const c of pieza.querySelectorAll(".t7a2-cas")) {
    const t = [...c.childNodes].find((x) => x.nodeType === 3 ? x.textContent.trim() : !x.matches(".t7a2-marca") && x.textContent.trim());
    if (!t) continue;
    const e = getComputedStyle(c), cr = c.getBoundingClientRect();
    const izq = cr.left + parseFloat(e.borderLeftWidth) + parseFloat(e.paddingLeft);
    const der = cr.right - parseFloat(e.borderRightWidth) - parseFloat(e.paddingRight);
    const rg = document.createRange(); rg.selectNodeContents(t); const tr = rg.getBoundingClientRect();
    if (tr.left < izq - 0.5 || tr.right > der + 0.5) problemas.push(`casilla «${t.textContent.trim()}»: la cifra mide ${tr.width.toFixed(1)} px y caben ${(der - izq).toFixed(1)}`);
  }
  const cas = pieza.querySelector(".t7a2-cas");
  let casilla = null;
  if (cas) {
    const e = getComputedStyle(cas);
    const util = cas.clientWidth - parseFloat(e.paddingLeft) - parseFloat(e.paddingRight);
    const llenas = [...pieza.querySelectorAll(".t7a2-cas")].filter((c) => c.textContent.trim());
    /*
     * Solo el texto de la cifra: la X del error va aparte, en la esquina. En
     * AP2 la cifra colocada va dentro de un span, y la de Compras, suelta.
     */
    const ancho = Math.max(0, ...llenas.map((c) => {
      const t = [...c.childNodes].find((x) => x.nodeType === 3 ? x.textContent.trim() : !x.matches(".t7a2-marca") && x.textContent.trim());
      if (!t) return 0;
      const rg = document.createRange(); rg.selectNodeContents(t); return rg.getBoundingClientRect().width;
    }));
    casilla = { util: Math.round(util * 10) / 10, bordeABorde: Math.round(cas.getBoundingClientRect().width * 10) / 10, cifraMasAncha: Math.round(ancho * 100) / 100, alto: Math.round(cas.getBoundingClientRect().height) };
  }
  const cab = [...pieza.querySelectorAll(".t7a2-lal-h [role=columnheader]:not(.t7a2-sr)")].map((c) => Math.round(c.getBoundingClientRect().width * 10) / 10);
  if (cab.length === 2 && Math.abs(cab[0] - cab[1]) > 0.5) problemas.push(`lado a lado: columnas de ${cab[0]} y ${cab[1]} px`);
  /* En cada fila, el rótulo del lado va arriba de su celda en la compra y en la venta: misma altura. */
  for (const f of pieza.querySelectorAll("[data-fila-lal]")) {
    const tops = [...f.querySelectorAll(".t7a2-lal-lado")].map((x) => x.getBoundingClientRect().top);
    if (tops.length === 2 && Math.abs(tops[0] - tops[1]) > 0.5) problemas.push(`lado a lado ${f.dataset.filaLal}: los rótulos de lado no están a la misma altura`);
    for (const c of f.querySelectorAll(".t7a2-lal-c")) {
      /* Se mide el texto (Range), no la caja: si la celda se estira, la caja del rótulo crece con ella. */
      const texto = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect(); };
      const lado = texto(c.querySelector(".t7a2-lal-lado"));
      const cuenta = texto(c.lastElementChild);
      if (cuenta.top - lado.bottom > 4.5) problemas.push(`lado a lado ${f.dataset.filaLal}: la cuenta queda separada de su lado (${(cuenta.top - lado.bottom).toFixed(1)} px)`);
    }
  }
  const esp = pieza.querySelector("[data-lado-a-lado]");
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 13px Sora"),
    casilla,
    ladoALado: esp ? { columnas: cab, alto: Math.round(esp.getBoundingClientRect().height) } : null,
  };
}

for (const ancho of ANCHOS) {
  const pg = await navegador.newPage({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(AP2);
  await pg.evaluate(() => document.fonts.ready);
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, AP2);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) {
      const el = await pg.$(`${AP2}`);
      const panel = await el.evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `ap2-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const en = (sel) => `${AP2} ${sel}`;
  const clic = (sel) => pg.click(en(sel));
  const pantalla = () => pg.getAttribute(AP2, "data-pantalla");
  const correctas = { "base-de-la-retencion": "sin-iva", "lado-a-lado": "quien-la-debe" };

  for (let vuelta = 0; vuelta < 9; vuelta++) {
    const id = await pantalla();
    if (await pg.$(en("[data-eleccion]"))) {
      await estado(`${id}-colocando`);
      const malas = await pg.$$eval(en("[data-opcion]"), (bs, c) => bs.map((b) => b.dataset.opcion).filter((o) => o !== c), correctas[id]);
      for (const mala of malas) {
        await clic(`[data-opcion="${mala}"]`); await clic('[data-boton="confirmar"]');
        await estado(`${id}-error-${mala}`);
        await clic('[data-boton="probar-otra"]');
      }
      await clic(`[data-opcion="${correctas[id]}"]`); await clic('[data-boton="confirmar"]');
      await estado(`${id}-acierto`);
      await clic('[data-boton="seguir"]');
      continue;
    }
    if (await pg.$(en("[data-lados]"))) {
      await estado(`${id}-colocando`);
      const lado = { "lados-de-la-compra": { iva: "debe", retencion: "haber", proveedores: "haber" }, "la-venta": { iva: "haber", anticipo: "debe", ingresos: "haber", clientes: "debe" } }[id];
      /* Las líneas aparecen una por una: se coloca cada una cuando aparece. */
      const lineas = Object.keys(lado);
      for (const l of lineas) await clic(`[data-linea="${l}"][data-lado="${lado[l] === "debe" ? "haber" : "debe"}"]`);
      await estado(`${id}-colocando-lleno`);
      await clic('[data-boton="confirmar"]');
      await estado(`${id}-error`);
      await clic('[data-boton="probar-otra"]');
      for (const l of lineas) await clic(`[data-linea="${l}"][data-lado="${lado[l]}"]`);
      await clic('[data-boton="confirmar"]');
      await estado(`${id}-acierto`);
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

/* Movimiento reducido: las casillas cambian sin transición. */
{
  const pg = await navegador.newPage({ viewport: { width: 375, height: 900 }, reducedMotion: "reduce" });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(AP2);
  for (let i = 0; i < 12 && !(await pg.$(`${AP2} [data-lados]`)); i++) {
    const op = await pg.$(`${AP2} [data-opcion]`);
    if (op) {
      const c = await pg.$(`${AP2} [data-opcion="sin-iva"]`);
      await c.click(); await pg.click(`${AP2} [data-boton="confirmar"]`); await pg.click(`${AP2} [data-boton="seguir"]`);
    } else await pg.click(`${AP2} [data-boton]`);
  }
  const t = await pg.$eval(`${AP2} .t7a2-cas`, (c) => getComputedStyle(c).transitionDuration);
  console.log(`Movimiento reducido: transición de la casilla = ${t}`);
  if (!/^0s(, 0s)*$/.test(t)) fallos.push(`movimiento reducido: la casilla tiene transición de ${t}`);
  await pg.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | alto pieza | casilla: borde a borde (útil) · cifra más ancha · alto | lado a lado: columnas · alto");
for (const f of filas) {
  const c = f.casilla ? `${f.casilla.bordeABorde} (${f.casilla.util} útil) · ${f.casilla.cifraMasAncha} · ${f.casilla.alto}` : "—";
  const e = f.ladoALado ? `${f.ladoALado.columnas.join(" / ")} · ${f.ladoALado.alto}` : "—";
  console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.alto} | ${c} | ${e}`);
}
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
if (estados !== 18) fallos.push(`se recorrieron ${estados} estados y son 18`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto ni ninguna cifra se sale a 375 ni a 320 px.");
