/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS TRES DE FICHAS CON EL ESTANTE DE CAJONES, EN CHROMIUM (hoja 3 de Mai)
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/b5/medir-b5-fichas.mjs
 *
 * En b5-t5-a1, b5-t6-a1 y b5-t6-a7, a 320×568 y 375×667, con y sin
 * movimiento reducido, juega la tanda entera y en cada ficha comprueba:
 *
 *   · sin barra horizontal; ningún nombre de cajón fuera de su cajón;
 *   · el alto del estante (la réplica de Mai: 96,78);
 *   · el juego, del contador al botón, con el panel abierto: cuánto mide y si
 *     cabe en la ventana (menos 8 arriba y abajo);
 *   · al colocar, que haya vuelo (una copia que viaja) y, con movimiento
 *     reducido, que no lo haya; y que la lámina entre a su cajón correcto;
 *   · en escala de grises (filter: grayscale), que la lámina que llegó tras
 *     el segundo fallo se distinga de la acertada por la forma: contorno
 *     punteado y sin relleno, frente a la llena (Shoko).
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

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/b5/harness-fichas/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const informe = [];

function medir() {
  const problemas = [];
  if (document.documentElement.scrollWidth > innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} en ${innerWidth}`);
  for (const c of document.querySelectorAll("[data-cajon], [data-tapa]")) {
    const caja = c.getBoundingClientRect();
    const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const rg = document.createRange(); rg.selectNodeContents(w.currentNode);
      for (const r of rg.getClientRects()) if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`«${w.currentNode.textContent}» se sale de su cajón`);
    }
    if (c.scrollWidth > c.clientWidth + 0.5) problemas.push(`«${c.textContent.slice(0, 20)}» se corta`);
  }
  const estante = document.querySelector("[data-estante]").getBoundingClientRect();
  const pulsos = document.querySelector("[data-estante]").previousElementSibling.getBoundingClientRect();
  const boton = document.querySelector("[data-boton-colocar] button, [data-boton-avanzar] button").getBoundingClientRect();
  return { problemas, estante: estante.height, juego: boton.bottom - pulsos.top, lineas: [...document.querySelectorAll("[data-cajon] > span:first-child, [data-tapa]")].map((s) => `${s.textContent} ${Math.round(s.getBoundingClientRect().height / 15)}`) };
}

for (const juego of ["#t5a1", "#t6a1", "#t6a7"]) {
  for (const reducido of [false, true]) {
    for (const [ancho, alto] of [[320, 568], [375, 667]]) {
      const p = await navegador.newPage({ viewport: { width: ancho, height: alto }, reducedMotion: reducido ? "reduce" : "no-preference" });
      await p.goto(`${BASE}${juego}`);
      await p.waitForSelector("[data-estante]");
      await p.evaluate(() => document.fonts.ready);
      const tag = `${juego} · ${ancho}×${alto}${reducido ? " · reducido" : ""}`;
      let mayor = 0, alturaEstante = 0, lineas = [];
      for (let k = 0; ; k++) {
        /* Abre el panel (la pestaña que abre va al final) y elige su primera opción: el juego en su alto mayor. */
        const pestanas = await p.$$("[data-nivel1]");
        await pestanas[pestanas.length - 1].click();
        await p.click("[data-nivel2]");
        const m = await p.evaluate(medir);
        mayor = Math.max(mayor, m.juego); alturaEstante = m.estante; lineas = m.lineas;
        for (const x of m.problemas) fallos.push(`${tag} · ficha ${k + 1}: ${x}`);
        const antes = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll("[data-cajon]")].map((c) => [c.dataset.cajon, Number(c.dataset.cuantas)])));
        /* Coloca dos veces (si el primero falla, el segundo deja la ficha). */
        let vuelo = false;
        for (let intento = 0; intento < 2; intento++) {
          const colocar = await p.$("[data-boton-colocar] button");
          if (!colocar) break;
          await colocar.click();
          vuelo = vuelo || await p.evaluate(() => [...document.body.children].some((e) => e.style.position === "fixed" && e.getAttribute("aria-hidden") === "true"));
          await p.waitForTimeout(reducido ? 50 : 760);
        }
        const despues = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll("[data-cajon]")].map((c) => [c.dataset.cajon, Number(c.dataset.cuantas)])));
        const sumo = Object.keys(despues).filter((c) => despues[c] !== antes[c]);
        if (sumo.length !== 1 || despues[sumo[0]] !== antes[sumo[0]] + 1) fallos.push(`${tag} · ficha ${k + 1}: el estante no sumó una lámina (${JSON.stringify(despues)})`);
        if (reducido && vuelo) fallos.push(`${tag} · ficha ${k + 1}: con movimiento reducido hubo vuelo`);
        if (!reducido && !vuelo) fallos.push(`${tag} · ficha ${k + 1}: sin vuelo`);
        const siguiente = await p.$("[data-boton-avanzar] button");
        const texto = await siguiente.textContent();
        if (/resultado/.test(texto)) break;
        await siguiente.click();
      }
      /* Al final de la tanda, en gris: cada lámina por su forma. */
      await p.addStyleTag({ content: "html { filter: grayscale(1); }" });
      const formas = await p.evaluate(() => [...document.querySelectorAll("[data-lamina]")].map((l) => {
        const cs = getComputedStyle(l);
        return { tipo: l.dataset.lamina, borde: cs.borderTopStyle, relleno: cs.backgroundColor };
      }));
      const segundas = formas.filter((f) => f.tipo === "segundo");
      if (segundas.some((f) => f.borde !== "dashed" || f.relleno !== "rgba(0, 0, 0, 0)")) fallos.push(`${tag}: una lámina tras el segundo fallo no es punteada y vacía`);
      if (formas.filter((f) => f.tipo === "bien").some((f) => f.borde === "dashed" || f.relleno === "rgba(0, 0, 0, 0)")) fallos.push(`${tag}: una lámina acertada no es llena`);
      if (ancho === 320 && !reducido && process.env.CAPTURAS) await p.locator("[data-estante]").screenshot({ path: `${process.env.CAPTURAS}/estante-${juego.slice(1)}.png` });
      informe.push(`${tag}: láminas ${formas.length - segundas.length} llenas y ${segundas.length} punteadas · estante ${alturaEstante.toFixed(2)} · juego con el panel abierto, el mayor ${mayor.toFixed(2)} (${mayor <= alto - 16 ? "cabe" : "NO cabe"} en ${alto - 16})${ancho === 320 && !reducido ? ` · líneas: ${lineas.join(" · ")}` : ""}`);
      await p.close();
    }
  }
}

await navegador.close();
await servidor.close();
console.log(informe.join("\n"));
if (fallos.length) { console.error(`\nFALLA:\n${fallos.slice(0, 30).join("\n")}`); process.exit(1); }
console.log("\nTodo en orden.");
