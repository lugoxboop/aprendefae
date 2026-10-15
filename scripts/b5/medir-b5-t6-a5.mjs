/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a5 «LA CUENTA DE LA PROVISIÓN» · LA CUENTA QUE SE LLENA, EN CHROMIUM
 *
 *   node scripts/b5/medir-b5-t6-a5.mjs
 *
 * A 320×568 y 375×667, con y sin movimiento reducido, juega las cinco
 * casillas (en las impares falla, en las pares acierta) y en cada estado
 * comprueba (hoja 1 de Mai):
 *
 *   · que la página no tenga barra horizontal y ningún texto se salga de su caja;
 *   · que cada cifra de la cuenta vaya en una línea;
 *   · que, al abrir cada casilla, se vean juntos la casilla y su renglón
 *     encendido (el sitio no tiene cabecera fija sobre el juego);
 *   · que lo que entra sea el valor correcto, también con error;
 *   · con movimiento reducido, que la cifra que entra no se anime.
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const { CASILLAS_T6_ACT5 } = await import("../../src/data/contabilidadT6Act5.js");

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/b5/harness-a5/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const informe = [];
const pesos = (v) => `$${String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

function medir() {
  const problemas = [];
  if (document.documentElement.scrollWidth > innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} en ${innerWidth}`);
  /* Cada línea de texto de la cuenta y de la casilla, dentro de su caja con borde (el bloque, la T o la opción) y de la ventana. */
  const textos = (raiz) => { const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT); const xs = []; while (w.nextNode()) if (w.currentNode.textContent.trim()) xs.push(w.currentNode); return xs; };
  const raices = [...document.querySelectorAll("[data-bloque-estado], [data-cuenta-t], [data-hecho]"), ...[...document.querySelectorAll("[data-opcion]")].map((o) => o.closest("button"))];
  for (const raiz of raices) {
    const caja = raiz.getBoundingClientRect();
    for (const t of textos(raiz)) {
      if (t.parentElement.closest("[data-anuncio]")) continue;
      const rg = document.createRange(); rg.selectNodeContents(t);
      for (const r of rg.getClientRects()) if (r.left < caja.left - 0.5 || r.right > caja.right + 0.5 || r.right > innerWidth) problemas.push(`«${t.textContent.trim().slice(0, 30)}» se sale de su caja`);
      /* Las cifras, en una línea (el saldo puede ir en dos, como en T6 · A3). */
      if (/^\$[\d.]+$|^− \$[\d.]+$/.test(t.textContent.trim()) && rg.getClientRects().length > 1) problemas.push(`«${t.textContent}» se parte`);
    }
  }
  const casilla = document.querySelector("[data-hecho]").parentElement.getBoundingClientRect();
  const activo = document.querySelector("[data-renglon-activo]")?.getBoundingClientRect();
  const dentro = (r) => r.top >= -0.5 && r.bottom <= innerHeight + 0.5;
  const entra = [...document.querySelectorAll("[data-entra]")].map((e) => ({ texto: e.textContent, animacion: getComputedStyle(e).animationName }));
  return {
    problemas,
    juntos: dentro(casilla) && (!activo || dentro(activo)),
    alto: activo ? Math.max(casilla.bottom, activo.bottom) - Math.min(casilla.top, activo.top) : casilla.height,
    anuncio: document.querySelector("[data-anuncio]").textContent,
    entra,
  };
}

for (const reducido of [false, true]) {
  for (const [ancho, alto] of [[320, 568], [375, 667]]) {
    const p = await navegador.newPage({ viewport: { width: ancho, height: alto }, reducedMotion: reducido ? "reduce" : "no-preference" });
    await p.goto(URL);
    await p.waitForSelector("[data-cuenta-que-se-llena]");
    await p.evaluate(() => document.fonts.ready);
    const tag = `${ancho}×${alto}${reducido ? " · reducido" : ""}`;
    for (let k = 0; k < CASILLAS_T6_ACT5.length; k++) {
      const c = CASILLAS_T6_ACT5[k];
      if (k > 0) { await p.getByRole("button", { name: /^Siguiente$/ }).click(); await p.waitForTimeout(600); }
      const abierta = await p.evaluate(medir);
      const correcta = c.opciones.find((o) => o.tipo === null).valor;
      const elegida = k % 2 === 0 ? c.opciones.find((o) => o.tipo).valor : correcta;
      await p.click(`[data-opcion="${elegida}"]`);
      await p.waitForTimeout(reducido ? 50 : 300);
      const respondida = await p.evaluate(medir);
      informe.push(`${tag} · casilla ${k + 1}: casilla y renglón ${abierta.juntos ? "juntos" : "NO juntos"} (${abierta.alto.toFixed(2)} px) · ${k % 2 === 0 ? "falla" : "acierta"} → «${respondida.anuncio}»`);
      for (const x of [...abierta.problemas, ...respondida.problemas]) fallos.push(`${tag} · casilla ${k + 1}: ${x}`);
      /* La casilla 1 abre con la página arriba, sin desplazamiento (manda la consigna); las demás, tras el desplazamiento. */
      if (k > 0 && !abierta.juntos) fallos.push(`${tag} · casilla ${k + 1}: la casilla y su renglón no se ven juntos`);
      if (!respondida.anuncio.includes(pesos(correcta))) fallos.push(`${tag} · casilla ${k + 1}: no entró el valor correcto (${respondida.anuncio})`);
      if (reducido && respondida.entra.some((e) => e.animacion !== "none")) fallos.push(`${tag} · casilla ${k + 1}: con movimiento reducido, la cifra se anima`);
      if (!reducido && !respondida.entra.some((e) => e.animacion === "b5-entra")) fallos.push(`${tag} · casilla ${k + 1}: la cifra entra sin su aparición`);
    }
    await p.close();
  }
}

await navegador.close();
await servidor.close();
console.log(informe.join("\n"));
if (fallos.length) { console.error(`\nFALLA:\n${fallos.join("\n")}`); process.exit(1); }
console.log("\nTodo en orden.");
