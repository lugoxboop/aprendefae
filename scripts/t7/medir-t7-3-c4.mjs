/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE T7-3 EN EL PATRÓN C4 A 375 Y 320? (A1 a A7 y H7, Célula C)
 *
 *   FUENTES_DIR=/tmp/claude-0/fuentes node scripts/t7/medir-t7-3-c4.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T7-3 montada tal cual (banco
 * scripts/t7/harness-t7-3). Juega cada pieza de Aprender entera —en cada
 * pregunta, cada mala (la consecuencia, antes del veredicto, y el veredicto)
 * y después la buena con su «¿Por qué?»— y H7 (#h7) ítem por ítem, una mala
 * y una buena por turnos. En cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que cada botón mida al menos 44 px de alto
 *   · que ningún texto visible baje de 12 px
 *   · que en cada renglón el rótulo no toque su cifra
 *
 * Sale con código 1 si algo falla.
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
const ITEMS = {};
for (const f of ["a1", "a2", "a3", "a4", "a5", "a6", "a7"]) {
  const { CONSECUENCIA_C4 } = await import(resolve(RAIZ, `src/contabilidad/c4/t73${f}_c4.js`));
  ITEMS[CONSECUENCIA_C4.id] = CONSECUENCIA_C4.items;
}
const PIEZAS = ["t7-3-descuento-comercial", "t7-3-descuentos-en-cadena", "t7-3-descuento-condicionado", "t7-3-descuento-en-dos-libros", "t7-3-sobrantes-y-faltantes", "t7-3-provision-inventarios", "t7-3-nic2-costo"];

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-t7-3/index.html`;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const fallos = [];
const filas = [];

async function servirFuentes(ctx) {
  const dir = process.env.FUENTES_DIR ?? "/tmp/claude-0/fuentes";
  const css = readFileSync(resolve(dir, "fuentes.css"), "utf8");
  await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (route) => {
    const u = route.request().url();
    if (u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
    try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(dir, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return route.abort(); }
  });
}

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const seVe = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 1 && r.height > 1 && s.visibility !== "hidden" && s.display !== "none"; };
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script") && !el.closest(".sr, [data-lector], [hidden]"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    if (!seVe(el)) continue;
    const r = el.getBoundingClientRect();
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5 && getComputedStyle(el).overflow !== "hidden") problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
    const fs = parseFloat(getComputedStyle(el).fontSize);
    /* La letra, solo en lo de la pieza: el rótulo del marco (section > header) y el «RESULTADO» del cierre (corazon/juego.jsx, 11 px) son compartidos. */
    if (fs < 12 && pieza.contains(el) && !el.closest("section > header") && el.textContent.trim() !== "RESULTADO") problemas.push(`${nombre}: letra de ${fs} px`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  for (const b of pieza.querySelectorAll("button")) {
    if (!seVe(b)) continue;
    const h = Math.max(b.getBoundingClientRect().height, b.matches("[data-por-que]") ? parseFloat(getComputedStyle(b, "::before").height) || 0 : 0);
    if (h < 44 - 0.01) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  for (const f of pieza.querySelectorAll("[data-renglon]")) {
    const rot = f.querySelector(".rg-rot").getBoundingClientRect();
    const v = f.querySelector(".rg-v").getBoundingClientRect();
    if (!v.width) continue;
    if (v.top < rot.bottom - 1 && rot.right > v.left - 4) problemas.push(`el renglón «${f.querySelector(".rg-rot").textContent}» toca su cifra`);
  }
  /* La regla del C4: ninguna marca encima de otra. */
  const marcas = [...pieza.querySelectorAll("[data-regla] > *")].map((x) => x.getBoundingClientRect());
  for (let i = 0; i < marcas.length; i++) for (let j = i + 1; j < marcas.length; j++) {
    const a = marcas[i], b = marcas[j];
    if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) problemas.push("dos marcas de la línea se tapan");
  }
  return { problemas, panel: Math.round(caja.width), alto: Math.round(pieza.getBoundingClientRect().height) };
}

async function medirEstado(pg, sel, nombre, ancho, n) {
  await pg.evaluate(() => document.fonts.ready);
  const m = await pg.evaluate(medir, sel);
  filas.push({ ancho, estado: nombre, ...m });
  for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
  if (CAPTURAS) {
    const panel = await (await pg.$(sel)).evaluateHandle((x) => x.closest("section"));
    await panel.asElement().screenshot({ path: resolve(CAPTURAS, `${ancho}-${String(n).padStart(3, "0")}-${nombre}.png`) });
  }
}

const espera = (pg) => pg.waitForTimeout(450);

for (const ancho of ANCHOS) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await servirFuentes(ctx);
  let n = 0;

  /* ═══ Aprender: las siete piezas ═══ */
  const pg = await ctx.newPage();
  await pg.goto(URL_BANCO);
  for (const id of PIEZAS) {
    const R = `[data-pieza-t73="${id}"]`;
    await pg.waitForSelector(R);
    const en = (s) => `${R} ${s}`;
    for (let vuelta = 0; vuelta < 30; vuelta++) {
      const item = await pg.$(en("[data-item]"));
      if (!item) {
        const p = await pg.getAttribute(R, "data-pantalla");
        await medirEstado(pg, R, `${id}-${p}`, ancho, ++n);
        const b = await pg.$(en('[data-boton="empezar"], [data-boton="seguir"]'));
        if (!b) break;
        await b.click();
        continue;
      }
      const it = await item.getAttribute("data-item");
      await medirEstado(pg, R, `${id}-${it}-llega`, ancho, ++n);
      /* Las malas primero (cada una: su consecuencia y su veredicto), y la buena al final. */
      const I = ITEMS[id].find((x) => x.id === it);
      const buena = String(I.opciones.find((o) => o.correcta).id);
      for (const o of I.opciones.filter((x) => !x.correcta).map((x) => String(x.id))) {
        await pg.click(en(`[data-op="${o}"]`));
        if (I.tipo !== "propio") await medirEstado(pg, R, `${id}-${it}-toca-${o}`, ancho, ++n);
        await espera(pg);
        await medirEstado(pg, R, `${id}-${it}-veredicto-${o}`, ancho, ++n);
      }
      await pg.click(en(`[data-op="${buena}"]`));
      await espera(pg);
      if (!(await pg.$(en('[data-mensaje="acierto"]')))) { fallos.push(`${ancho} px · ${id} · ${it}: la buena no acierta`); break; }
      await medirEstado(pg, R, `${id}-${it}-acierto`, ancho, ++n);
      const porque = await pg.$(en(".c4-porque"));
      if (porque) { await porque.click(); await medirEstado(pg, R, `${id}-${it}-porque`, ancho, ++n); }
      await pg.click(en(".c4-seguir"));
    }
  }
  await pg.close();

  /* ═══ Hacer: H7 ═══ */
  const h = await ctx.newPage();
  await h.goto(`${URL_BANCO}#h7`);
  const H = "[data-t7-3-h7]";
  await h.waitForSelector(H);
  for (let k = 0; k < 6; k++) {
    await medirEstado(h, H, `h7-${k + 1}-llega`, ancho, ++n);
    const ops = await h.$$eval(`${H} [data-op]`, (bs) => bs.map((b) => b.dataset.op));
    await h.click(`${H} [data-op="${ops[k % ops.length]}"]`);
    await medirEstado(h, H, `h7-${k + 1}-toca`, ancho, ++n);
    await espera(h);
    await medirEstado(h, H, `h7-${k + 1}-veredicto`, ancho, ++n);
    await h.click(`${H} [data-responder] button`);
  }
  await medirEstado(h, H, "h7-cierre", ancho, ++n);
  await h.close();
  await ctx.close();
}

await navegador.close();
await servidor.close();

console.log(`${filas.length} medidas (${new Set(filas.map((f) => f.estado)).size} estados × ${ANCHOS.length} anchos).`);
const altos = filas.filter((f) => f.ancho === 320).map((f) => f.alto);
console.log(`a 320: panel ${filas.find((f) => f.ancho === 320)?.panel} px; pieza de ${Math.min(...altos)} a ${Math.max(...altos)} px de alto`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of [...new Set(fallos)]) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: nada se sale a 375 ni a 320 px; botones de 44 px; letra de 12 px o más.");
