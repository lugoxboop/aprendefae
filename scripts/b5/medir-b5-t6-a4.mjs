/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a4 «¿QUÉ SE DEBITA?» · EL ASIENTO MÍNIMO, EN CHROMIUM (hoja 4 de Mai)
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/b5/medir-b5-t6-a4.mjs
 *
 * A 320×568 y 375×667, con y sin movimiento reducido, juega los diez hechos
 * (elige una opción distinta en cada uno, para pasar por los tres casos) y
 * comprueba:
 *
 *   · sin barra horizontal; ningún nombre fuera de su ranura;
 *   · el alto reservado del asiento no cambia al elegir: las opciones no se
 *     mueven;
 *   · el juego, del contador al final de las opciones, cabe en la ventana;
 *   · con movimiento reducido, el asiento final de una vez, sin animación.
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { resolve } from "node:path";
import { abrirNavegador } from "./navegador.mjs";

const RAIZ = resolve(import.meta.dirname, "../..");
const { OPCIONES_T6_ACT4 } = await import("../../src/data/contabilidadT6Act4.js");

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/b5/harness-a4/index.html`;
/* Con la barra de desplazamiento a la vista: el ancho del sitio en el Chromium de escritorio (navegador.mjs). */
const navegador = await abrirNavegador();
const fallos = [];
const informe = [];

function medir() {
  const problemas = [];
  if (document.documentElement.scrollWidth > innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} en ${innerWidth}`);
  for (const r of document.querySelectorAll("[data-ranura]")) {
    const caja = r.getBoundingClientRect();
    for (const p of r.querySelectorAll("[data-cuenta]")) {
      const rg = document.createRange(); rg.selectNodeContents(p);
      for (const x of rg.getClientRects()) if (x.left < caja.left - 0.5 || x.right > caja.right + 0.5) problemas.push(`«${p.textContent}» se sale de su ranura`);
    }
  }
  const asiento = document.querySelector("[data-asiento-minimo]").getBoundingClientRect();
  const opciones = [...document.querySelectorAll("[data-opcion]")].map((o) => o.closest("button").getBoundingClientRect());
  const pulsos = document.querySelector("[data-hecho]").previousElementSibling.getBoundingClientRect();
  const lineas = [...document.querySelectorAll("[data-ranura='debe'] [aria-hidden='true']")].map((p) => `${p.textContent.split(" ")[0]} ${Math.round(p.getBoundingClientRect().height / 16)}`);
  return {
    /* En la página, no en la ventana: al elegir, la página puede bajar lo justo para mostrar la devolución (a 320, 2 px). */
    problemas, asiento: asiento.height, primera: opciones[0].top + scrollY, juego: opciones.at(-1).bottom - pulsos.top, lineas,
    animaciones: [...document.querySelectorAll("[data-ranura] [data-cuenta]")].map((p) => getComputedStyle(p).animationName),
    cuentas: [...document.querySelectorAll("[data-ranura]")].map((r) => r.querySelector("[data-cuenta]")?.textContent ?? "—"),
  };
}

for (const reducido of [false, true]) {
  for (const [ancho, alto] of [[320, 568], [375, 667]]) {
    const p = await navegador.newPage({ viewport: { width: ancho, height: alto }, reducedMotion: reducido ? "reduce" : "no-preference" });
    await p.goto(URL);
    await p.waitForSelector("[data-asiento-minimo]");
    await p.evaluate(() => document.fonts.ready);
    const tag = `${ancho}×${alto}${reducido ? " · reducido" : ""}`;
    let mayor = 0, reservado = 0, lineas = [];
    for (let k = 0; k < 10; k++) {
      const antes = await p.evaluate(medir);
      await p.click(`[data-opcion="${OPCIONES_T6_ACT4[k % 4].id}"]`);
      const enseguida = await p.evaluate(medir);
      await p.waitForTimeout(reducido ? 50 : 900);
      const despues = await p.evaluate(medir);
      mayor = Math.max(mayor, antes.juego, despues.juego); reservado = antes.asiento; lineas = antes.lineas;
      for (const x of [...antes.problemas, ...despues.problemas]) fallos.push(`${tag} · hecho ${k + 1}: ${x}`);
      if (Math.abs(despues.asiento - antes.asiento) > 0.5 || Math.abs(despues.primera - antes.primera) > 0.5) fallos.push(`${tag} · hecho ${k + 1}: el asiento cambió de alto (${antes.asiento} → ${despues.asiento}) o las opciones se movieron (${antes.primera} → ${despues.primera})`);
      if (reducido && (enseguida.animaciones.some((a) => a !== "none") || JSON.stringify(enseguida.cuentas) !== JSON.stringify(despues.cuentas))) fallos.push(`${tag} · hecho ${k + 1}: con movimiento reducido no fue de una vez`);
      await p.getByRole("button", { name: /^(Siguiente|Ver resultado)$/ }).click();
      if (k === 9) break;
      await p.waitForSelector("[data-asiento-minimo]");
    }
    informe.push(`${tag}: asiento reservado ${reservado.toFixed(2)} · juego, del contador al final de las opciones, el mayor ${mayor.toFixed(2)} (${mayor <= alto - 16 ? "cabe" : "NO cabe"} en ${alto - 16})${reducido ? "" : ` · líneas en la ranura: ${lineas.join(" · ")}`}`);
    await p.close();
  }
}

await navegador.close();
await servidor.close();
console.log(informe.join("\n"));
if (fallos.length) { console.error(`\nFALLA:\n${fallos.slice(0, 30).join("\n")}`); process.exit(1); }
console.log("\nTodo en orden.");
