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
 *   · «6 meses» apunta a la marca de 6 y cae a su izquierda;
 *   · la porción de cada barra mide su porcentaje del largo;
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
  const deudas = [...document.querySelectorAll("[data-deuda]")].map((d) => ({ id: d.dataset.deuda, centro: eje ? Math.round(((d.getBoundingClientRect().left + d.getBoundingClientRect().width / 2 - eje.left) / eje.width) * 1000) / 10 : null, transicion: getComputedStyle(d).transitionProperty, duracion: getComputedStyle(d).transitionDuration }));
  return {
    problemas, juntos: rs.every(dentro), renglonYRotulo: [rotulo, activo].filter(Boolean).every(dentro), alto: Math.max(...rs.map((r) => r.bottom)) - Math.min(...rs.map((r) => r.top)),
    porciones, deudas, entra: [...document.querySelectorAll("[data-entra]")].map((e) => getComputedStyle(e).animationName),
  };
}

for (const reducido of [false, true]) {
  for (const [ancho, alto] of [[320, 568], [375, 667]]) {
    const p = await navegador.newPage({ viewport: { width: ancho, height: alto }, reducedMotion: reducido ? "reduce" : "no-preference" });
    await p.goto(URL);
    await p.waitForSelector("[data-cajones-del-tiempo]");
    await p.evaluate(() => document.fonts.ready);
    const tag = `${ancho}×${alto}${reducido ? " · reducido" : ""}`;
    for (let k = 0; k < CASILLAS.length; k++) {
      const c = CASILLAS[k];
      if (k > 0) { await p.getByRole("button", { name: /^Siguiente$/ }).click(); await p.waitForTimeout(600); }
      const abierta = await p.evaluate(medir);
      if (c.id === "u2") {
        const d = abierta.deudas.find((x) => x.id === "u2");
        if (Math.abs(d.centro - 44) > 0.6) fallos.push(`${tag}: «6 meses» no apunta a la marca de 6 (${d.centro} %)`);
      }
      const elegida = k % 2 === 0 ? c.opciones.find((o) => o.tipo) : c.opciones.find((o) => o.tipo === null);
      await p.click(`[data-opcion="${clave(elegida)}"]`);
      await p.waitForTimeout(reducido ? 50 : 450);
      const respondida = await p.evaluate(medir);
      informe.push(`${tag} · casilla ${k + 1}: casilla, rótulo y renglón ${abierta.juntos ? "juntos" : "NO juntos"} (${abierta.alto.toFixed(2)} px) · ${k % 2 === 0 ? "falla" : "acierta"}${respondida.porciones.length ? ` · porciones ${respondida.porciones.join(" / ")} %` : ""}`);
      for (const x of [...abierta.problemas, ...respondida.problemas]) fallos.push(`${tag} · casilla ${k + 1}: ${x}`);
      /* Si no cabe todo en la ventana (menos 8 arriba y abajo), el renglón queda arriba con el rótulo (hoja 2 de Mai §3). */
      if (k > 0 && !abierta.juntos && (abierta.alto <= alto - 16 || !abierta.renglonYRotulo)) fallos.push(`${tag} · casilla ${k + 1}: la casilla, el rótulo y el renglón no se ven juntos`);
      if (k > 0 && !abierta.juntos) informe.push(`${tag} · casilla ${k + 1}: no cabe todo (${abierta.alto.toFixed(2)} en ${alto - 16}); a la vista, el renglón y el rótulo`);
      if (c.id === "u2") {
        const d = respondida.deudas.find((x) => x.id === "u2");
        if (!(d.centro < 44)) fallos.push(`${tag}: «6 meses» no cae a la izquierda de la marca (${d.centro} %)`);
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
