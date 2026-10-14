/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO Y CADA CIFRA DE A6 «DEVOLUCIONES EN PERIÓDICO» A 375 Y 320?
 *
 *   node scripts/t7/medir-t7-1-a6.mjs [carpeta-de-capturas]
 *
 * Como medir-t7-1-ap1.mjs: Chromium de verdad, la vista de T7-1 montada tal
 * cual con la hoja de estilos del sitio. Juega A6 entera —en cada pregunta
 * falla con cada opción equivocada y acierta; en cada asiento coloca todo al
 * revés, confirma, corrige y acierta— y en cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto ni ninguna cifra se salga de su caja (scrollWidth)
 *   · que nada con texto se salga del panel de la pieza
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · en la tabla espejo, que las dos columnas midan lo mismo y que cada
 *     cuenta vaya pegada a su rótulo de lado
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
const A6 = '[data-pieza="t7-1-a6-devoluciones-en-periodico"]';

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness/index.html#a6`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.closest(".t7a6-sr, .t7a6-cas-nada") && !el.matches("style, script"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  const cas = pieza.querySelector(".t7a6-cas");
  let casilla = null;
  if (cas) {
    const e = getComputedStyle(cas);
    const util = cas.clientWidth - parseFloat(e.paddingLeft) - parseFloat(e.paddingRight);
    const llenas = [...pieza.querySelectorAll(".t7a6-cas")].filter((c) => c.textContent.trim());
    /* Solo el texto de la cifra: la X del error va aparte, en la esquina. */
    const ancho = Math.max(0, ...llenas.map((c) => {
      const t = [...c.childNodes].find((x) => x.nodeType === 3 && x.textContent.trim());
      if (!t) return 0;
      const rg = document.createRange(); rg.selectNodeContents(t); return rg.getBoundingClientRect().width;
    }));
    casilla = { util: Math.round(util * 10) / 10, cifraMasAncha: Math.round(ancho * 100) / 100, alto: Math.round(cas.getBoundingClientRect().height) };
  }
  const cab = [...pieza.querySelectorAll(".t7a6-esp-cab [role=columnheader]")].filter((c) => c.textContent).map((c) => Math.round(c.getBoundingClientRect().width * 10) / 10);
  if (cab.length === 2 && Math.abs(cab[0] - cab[1]) > 0.5) problemas.push(`espejo: columnas de ${cab[0]} y ${cab[1]} px`);
  /* En cada fila del espejo, el rótulo del lado va arriba de su celda en los dos libros: misma altura. */
  for (const f of pieza.querySelectorAll("[data-fila-espejo]")) {
    const tops = [...f.querySelectorAll(".t7a6-esp-lado")].map((x) => x.getBoundingClientRect().top);
    if (tops.length === 2 && Math.abs(tops[0] - tops[1]) > 0.5) problemas.push(`espejo ${f.dataset.filaEspejo}: los rótulos de lado no están a la misma altura`);
    for (const c of f.querySelectorAll(".t7a6-esp-c")) {
      /* Se mide el texto (Range), no la caja: si la celda se estira, la caja del rótulo crece con ella. */
      const texto = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect(); };
      const lado = texto(c.querySelector(".t7a6-esp-lado"));
      const cuenta = texto(c.lastElementChild);
      if (cuenta.top - lado.bottom > 4.5) problemas.push(`espejo ${f.dataset.filaEspejo}: la cuenta queda separada de su lado (${(cuenta.top - lado.bottom).toFixed(1)} px)`);
    }
  }
  const esp = pieza.querySelector("[data-espejo]");
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 13px Sora"),
    casilla,
    espejo: esp ? { columnas: cab, alto: Math.round(esp.getBoundingClientRect().height) } : null,
  };
}

for (const ancho of ANCHOS) {
  const pg = await navegador.newPage({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(A6);
  await pg.evaluate(() => document.fonts.ready);
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, A6);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) {
      const el = await pg.$(`${A6}`);
      const panel = await el.evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `a6-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const en = (sel) => `${A6} ${sel}`;
  const clic = (sel) => pg.click(en(sel));
  const pantalla = () => pg.getAttribute(A6, "data-pantalla");
  const correctas = { "dos-cuentas-propias": "saber-cuanto", "cuanto-se-reversa": "proporcional", "lado-a-lado": "al-reves" };

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
      const lineas = await pg.$$eval(en("[data-fila]"), (fs) => fs.map((f) => f.dataset.fila));
      const lado = { "libro-del-comprador": { proveedores: "debe", retencion: "debe", iva: "haber", devoluciones: "haber" }, "libro-del-vendedor": { devoluciones: "debe", iva: "debe", anticipo: "haber", clientes: "haber" } }[id];
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
  await pg.waitForSelector(A6);
  for (let i = 0; i < 12 && !(await pg.$(`${A6} [data-lados]`)); i++) {
    const op = await pg.$(`${A6} [data-opcion]`);
    if (op) {
      const c = await pg.$(`${A6} [data-opcion="saber-cuanto"], ${A6} [data-opcion="proporcional"]`);
      await c.click(); await pg.click(`${A6} [data-boton="confirmar"]`); await pg.click(`${A6} [data-boton="seguir"]`);
    } else await pg.click(`${A6} [data-boton]`);
  }
  const t = await pg.$eval(`${A6} .t7a6-cas`, (c) => getComputedStyle(c).transitionDuration);
  console.log(`Movimiento reducido: transición de la casilla = ${t}`);
  if (!/^0s(, 0s)*$/.test(t)) fallos.push(`movimiento reducido: la casilla tiene transición de ${t}`);
  await pg.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | alto pieza | casilla: útil · cifra más ancha · alto | espejo: columnas · alto");
for (const f of filas) {
  const c = f.casilla ? `${f.casilla.util} · ${f.casilla.cifraMasAncha} · ${f.casilla.alto}` : "—";
  const e = f.espejo ? `${f.espejo.columnas.join(" / ")} · ${f.espejo.alto}` : "—";
  console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.alto} | ${c} | ${e}`);
}
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
if (estados !== 24) fallos.push(`se recorrieron ${estados} estados y son 24`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto ni ninguna cifra se sale a 375 ni a 320 px.");
