/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a6 «PROVISIÓN POR EDADES» · LOS CAJONES DEL TIEMPO, EN CHROMIUM
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/b5/medir-b5-t6-a6.mjs
 *
 * A 320×568 y 375×667, con y sin movimiento reducido, juega las ocho
 * casillas (en las impares falla, en las pares acierta) y en cada estado
 * comprueba (hoja 2 de Mai):
 *
 *   · sin barra horizontal; ninguna línea de texto fuera de su caja;
 *   · las cifras, en una línea;
 *   · al abrir cada casilla (desde la 2), la casilla, el rótulo y el renglón
 *     encendido juntos en la ventana (el sitio no tiene cabecera fija);
 *   · la deuda espera encima del eje, sin tocarlo y en el mismo sitio (Shoko);
 *     al responder queda del todo dentro de su cajón: «6 meses», dentro de
 *     «Más de 3 hasta 6 meses», sin tocar la marca de 6 (Shoko);
 *   · la porción de cada barra mide su porcentaje del largo;
 *   · entre dos rótulos del eje en la misma línea, 8 px como mínimo; si no
 *     caben, el del medio va escalonado en una segunda línea (Sakuta);
 *   · con movimiento reducido, la deuda cae sin trayecto y la cifra entra sin
 *     animación (la hoja de estilos del sitio deja las transiciones en 0,01 ms).
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
const { PARTES_T6_ACT6 } = await import("../../src/data/contabilidadT6Act6.js");
const CASILLAS = PARTES_T6_ACT6.flatMap((p) => p.casillas);
const clave = (o) => String(o.valor ?? o.texto);

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/b5/harness-a6/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const informe = [];

function medir() {
  const problemas = [];
  if (document.documentElement.scrollWidth > innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} en ${innerWidth}`);
  const textos = (raiz) => { const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT); const xs = []; while (w.nextNode()) if (w.currentNode.textContent.trim()) xs.push(w.currentNode); return xs; };
  const raices = [...document.querySelectorAll("[data-regla], [data-eje], [data-hecho]"), ...[...document.querySelectorAll("[data-opcion]")].map((o) => o.closest("button"))];
  for (const raiz of raices) {
    const caja = raiz.getBoundingClientRect();
    for (const t of textos(raiz)) {
      const rg = document.createRange(); rg.selectNodeContents(t);
      for (const r of rg.getClientRects()) if (r.left < caja.left - 0.5 || r.right > caja.right + 0.5 || r.right > innerWidth) problemas.push(`«${t.textContent.trim().slice(0, 30)}» se sale de su caja`);
      if (/^\$[\d.]+$|^\d+ (meses|año)$/.test(t.textContent.trim()) && rg.getClientRects().length > 1) problemas.push(`«${t.textContent}» se parte`);
    }
  }
  const casilla = document.querySelector("[data-hecho]").parentElement.getBoundingClientRect();
  const rotulo = document.querySelector("[data-rotulo-simulado]").getBoundingClientRect();
  const activo = document.querySelector("[data-renglon-activo]")?.getBoundingClientRect();
  const dentro = (r) => r.top >= -0.5 && r.bottom <= innerHeight + 0.5;
  const rs = [casilla, rotulo, activo].filter(Boolean);
  /* Las porciones: su ancho frente al de su barra. */
  const porciones = [...document.querySelectorAll("[data-porcion]")].map((p) => Math.round((p.getBoundingClientRect().width / p.parentElement.clientWidth) * 1000) / 10);
  const eje = document.querySelector("[data-eje]")?.getBoundingClientRect();
  const deudas = [...document.querySelectorAll("[data-deuda]")].map((d) => {
    const r = d.getBoundingClientRect();
    const cajon = d.dataset.enCajon ? document.querySelector(`[data-cajon="${d.dataset.enCajon}"]`).getBoundingClientRect() : null;
    const barra = document.querySelector("[data-cajon]").getBoundingClientRect();
    return {
      id: d.dataset.deuda, izq: Math.round(r.left - eje.left), sobreElEje: r.bottom > barra.top - 0.5,
      dentro: cajon ? r.left >= cajon.left + 0.5 && r.right <= cajon.right - 0.5 : null,
      duracion: getComputedStyle(d).transitionDuration,
    };
  });
  /* Los rótulos del eje: los que comparten línea, a 8 px como mínimo. */
  const marcas = [...document.querySelectorAll("[data-eje] [data-marca]")].map((m) => m.getBoundingClientRect());
  for (let k = 1; k < marcas.length; k++) {
    for (let j = 0; j < k; j++) {
      const mismaLinea = Math.abs(marcas[k].top - marcas[j].top) < 1;
      const hueco = marcas[k].left - marcas[j].right;
      if (mismaLinea && hueco < 8) problemas.push(`rótulos del eje a ${hueco.toFixed(2)} px`);
    }
  }
  const huecoEje = marcas.length > 1 ? Math.min(...marcas.slice(1).map((r, k) => r.left - marcas[k].right)) : null;
  return {
    huecoEje, escalonado: document.querySelector("[data-eje]")?.dataset.escalonado,
    problemas, juntos: rs.every(dentro), renglonYRotulo: [rotulo, activo].filter(Boolean).every(dentro), alto: Math.max(...rs.map((r) => r.bottom)) - Math.min(...rs.map((r) => r.top)),
    porciones, deudas, entra: [...document.querySelectorAll("[data-entra]")].map((e) => getComputedStyle(e).animationName),
  };
}

for (const reducido of [false, true]) {
  /* 300: en el sitio, a 320, la columna es más angosta que en este banco (Sakuta midió 5,5 px entre «3 meses» y «6 meses»); a 300 el banco llega a ese caso y prueba el escalón. */
  for (const [ancho, alto] of [[320, 568], [375, 667], [300, 568]]) {
    const p = await navegador.newPage({ viewport: { width: ancho, height: alto }, reducedMotion: reducido ? "reduce" : "no-preference" });
    await p.goto(URL);
    await p.waitForSelector("[data-cajones-del-tiempo]");
    await p.evaluate(() => document.fonts.ready);
    const tag = `${ancho}×${alto}${reducido ? " · reducido" : ""}`;
    for (let k = 0; k < CASILLAS.length; k++) {
      const c = CASILLAS[k];
      if (k > 0) { await p.getByRole("button", { name: /^Siguiente$/ }).click(); await p.waitForTimeout(600); }
      const abierta = await p.evaluate(medir);
      if (k < 3) {
        const d = abierta.deudas.find((x) => x.id === c.id);
        if (d.izq !== 0 || d.sobreElEje) fallos.push(`${tag} · casilla ${k + 1}: la deuda no espera fuera del eje (izq ${d.izq}, sobre el eje ${d.sobreElEje})`);
      }
      const elegida = k % 2 === 0 ? c.opciones.find((o) => o.tipo) : c.opciones.find((o) => o.tipo === null);
      await p.click(`[data-opcion="${clave(elegida)}"]`);
      await p.waitForTimeout(reducido ? 50 : 450);
      const respondida = await p.evaluate(medir);
      if (k === 0) informe.push(`${tag} · eje: hueco horizontal entre rótulos ${abierta.huecoEje?.toFixed(2)} px · escalonado ${abierta.escalonado}`);
      informe.push(`${tag} · casilla ${k + 1}: casilla, rótulo y renglón ${abierta.juntos ? "juntos" : "NO juntos"} (${abierta.alto.toFixed(2)} px) · ${k % 2 === 0 ? "falla" : "acierta"}${respondida.porciones.length ? ` · porciones ${respondida.porciones.join(" / ")} %` : ""}`);
      for (const x of [...abierta.problemas, ...respondida.problemas]) fallos.push(`${tag} · casilla ${k + 1}: ${x}`);
      /* Si no cabe todo en la ventana (menos 8 arriba y abajo), el renglón queda arriba con el rótulo (hoja 2 de Mai §3). */
      if (k > 0 && !abierta.juntos && (abierta.alto <= alto - 16 || !abierta.renglonYRotulo)) fallos.push(`${tag} · casilla ${k + 1}: la casilla, el rótulo y el renglón no se ven juntos`);
      if (k > 0 && !abierta.juntos) informe.push(`${tag} · casilla ${k + 1}: no cabe todo (${abierta.alto.toFixed(2)} en ${alto - 16}); a la vista, el renglón y el rótulo`);
      if (k < 3) {
        const d = respondida.deudas.find((x) => x.id === c.id);
        if (!d.dentro) fallos.push(`${tag} · casilla ${k + 1}: «${c.id}» no queda del todo dentro de su cajón`);
      }
      if (k >= 3 && respondida.porciones.slice(0, 3).some((x, i) => Math.abs(x - [5, 10, 15][i]) > 0.3)) fallos.push(`${tag} · casilla ${k + 1}: porciones ${respondida.porciones}`);
      if (reducido && (respondida.deudas.some((d) => Number.parseFloat(d.duracion) >= 0.001) || respondida.entra.some((a) => a !== "none"))) fallos.push(`${tag} · casilla ${k + 1}: con movimiento reducido hay animación`);
    }
    await p.close();
  }
}

await navegador.close();
await servidor.close();
console.log(informe.join("\n"));
if (fallos.length) { console.error(`\nFALLA:\n${fallos.join("\n")}`); process.exit(1); }
console.log("\nTodo en orden.");
