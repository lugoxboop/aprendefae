/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO DE T7-3 · A5 «SOBRANTES Y FALTANTES» A 375 Y 320?
 *
 *   node scripts/t7/medir-t7-3-a5.mjs [carpeta-de-capturas]
 *
 * Como medir-t7-3-a1.mjs: Chromium de verdad, la vista de T7-3 montada tal
 * cual con la hoja de estilos del sitio (banco scripts/t7/harness-t7-3). Juega
 * A5 entera —en cada pregunta falla con cada opción equivocada y después
 * acierta— y en cada uno de sus 11 estados comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que se hayan medido Inter y, donde hay pregunta, Sora: no la fuente
 *     de reserva
 *   · que cada opción y cada botón midan al menos 44 px de alto
 *   · que las cifras del asiento y de sus sumas quepan en su columna
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
const A1 = '[data-pieza="t7-3-sobrantes-y-faltantes"]';

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-t7-3/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script"))
    /* Lo que solo oye el lector de pantalla («menos», «igual a») mide 1 px a propósito. */
    .filter((el) => !el.closest(".sr"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
  }
  /* Patrón T7-3: las etiquetas de la franja de plazos no se tocan entre sí ni se salen de la franja. */
  for (const f of document.querySelectorAll("[data-plazos]")) {
    const caja = f.getBoundingClientRect();
    const et = [...f.querySelectorAll(".pz-et, .pz-pago")].map((e) => [e.textContent, e.getBoundingClientRect()]);
    for (const [t, r] of et) if (r.left < caja.left - 0.5 || r.right > caja.right + 0.5) problemas.push(`la etiqueta «${t}» se sale de la franja`);
    for (let i = 0; i < et.length; i++) for (let j = i + 1; j < et.length; j++) {
      const [ta, a] = et[i]; const [tb, b] = et[j];
      if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) problemas.push(`las etiquetas de la franja «${ta}» y «${tb}» se tocan`);
    }
  }
  /* Patrón T7-3: en cada renglón, el rótulo no toca su cifra (salvo la cifra que baja a su propia línea). */
  for (const f of document.querySelectorAll("[data-renglon]")) {
    const rot = f.querySelector(".rg-rot").getBoundingClientRect();
    const v = f.querySelector(".rg-v").getBoundingClientRect();
    if (v.top < rot.bottom - 1 && rot.right > v.left - 4) problemas.push(`el renglón «${f.querySelector(".rg-rot").textContent}» toca su cifra`);
    if (v.right > f.getBoundingClientRect().right + 0.5) problemas.push(`la cifra «${f.querySelector(".rg-v").textContent}» se sale de su renglón`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  for (const b of pieza.querySelectorAll("button")) {
    const h = b.getBoundingClientRect().height;
    if (h < 44) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  /* Las cifras del asiento y de sus sumas: en una línea, dentro de su columna. */
  for (const c of pieza.querySelectorAll("[data-asiento] [role=cell], [data-mov-t]")) {
    if (c.scrollWidth > c.clientWidth + 0.5) problemas.push(`la cifra «${c.textContent}» mide ${c.scrollWidth} px en ${c.clientWidth}`);
  }
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    /* Sora 600 solo se pide cuando hay una pregunta en pantalla: la vista de T7-3 tiene varias piezas, y se mide la que está a la vista. */
    fuentes: document.fonts.check("15px Inter") && (!pieza.querySelector("[data-pregunta]") || document.fonts.check("600 15px Sora")),
  };
}

const correctas = { sobrante: "sobrante", faltante: "haber" };

for (const ancho of ANCHOS) {
  const pg = await navegador.newPage({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(A1);
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, A1);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) {
      const panel = await (await pg.$(A1)).evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `t7-3-a5-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const en = (sel) => `${A1} ${sel}`;
  const clic = (sel) => pg.click(en(sel));
  for (let vuelta = 0; vuelta < 10; vuelta++) {
    const id = await pg.getAttribute(A1, "data-pantalla");
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
if (estados !== 11) fallos.push(`se recorrieron ${estados} estados y son 11`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto se sale a 375 ni a 320 px.");
