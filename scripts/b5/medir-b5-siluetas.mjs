/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CAPA 2 NO EMPIEZA VACÍA: LAS SILUETAS, EN CHROMIUM (hoja 5 de Mai)
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/b5/medir-b5-siluetas.mjs [raíz-a-comparar]
 *
 * En las siete piezas de Aprender de la célula (T5 · A1 y A2, T6 · A1 a A5),
 * a 320 y 375, con y sin movimiento reducido, recorre los pasos con
 * «Siguiente» y en cada uno mide la distancia de la cima de la escena al
 * botón (el bloque sin pegar: ventana alta). Comprueba:
 *
 *   · que «Siguiente» no se mueva en ningún paso;
 *   · cuántas siluetas hay en el paso 1 y cuánto vacío queda al fondo de la
 *     escena (del último elemento dibujado al fondo de la reserva);
 *   · que una silueta no deje leer texto (color transparente);
 *   · con movimiento reducido, sin transición.
 *
 * Con una segunda raíz (otra copia del repositorio con el mismo banco),
 * compara las distancias: la escena tiene que medir lo mismo que hoy.
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const OTRA = process.argv[2] ? resolve(process.argv[2]) : null;
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const PIEZAS = (process.env.PIEZAS ?? "t5a1,t5a2,t6a1,t6a2,t6a3,t6a4,t6a5").split(",");
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const informe = [];

async function recorrer(raiz, pieza, ancho, reducido) {
  const servidor = await createServer({ root: raiz, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
  await servidor.listen();
  const p = await navegador.newPage({ viewport: { width: ancho, height: 4000 }, reducedMotion: reducido ? "reduce" : "no-preference" });
  await p.goto(`http://127.0.0.1:${servidor.httpServer.address().port}/scripts/b5/harness-siluetas/index.html#${pieza}`);
  await p.waitForTimeout(600);
  await p.evaluate(() => document.fonts.ready);
  const distancias = [];
  let paso1 = null;
  for (let k = 0; k < 40; k++) {
    await p.waitForTimeout(reducido ? 30 : 320);
    const m = await p.evaluate(() => {
      const escena = document.querySelector("[data-escena], [data-capa2-t5] [data-escena-t5], [data-capa2-t5]");
      const boton = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Siguiente");
      const siluetas = [...document.querySelectorAll("[style*='--b5-silueta']")].filter((s) => s.style.display !== "none" && !s.closest("[data-reserva]"));
      const leible = siluetas.some((s) => getComputedStyle(s).color !== "rgba(0, 0, 0, 0)");
      const viva = document.querySelector("[data-escena-viva]")?.getBoundingClientRect();
      const fondo = escena.getBoundingClientRect();
      return {
        distancia: boton ? Math.round((boton.getBoundingClientRect().top - escena.getBoundingClientRect().top) * 100) / 100 : null,
        activo: boton ? !boton.disabled : false,
        siluetas: siluetas.length, leible,
        vacio: viva ? Math.round((fondo.bottom - viva.bottom) * 100) / 100 : null,
        transiciones: siluetas.map((s) => getComputedStyle(s).transitionDuration).filter((d) => Number.parseFloat(d) >= 0.001).length,
      };
    });
    if (k === 0) paso1 = m;
    if (m.leible) fallos.push(`${pieza} ${ancho}: una silueta deja leer su texto (paso ${k + 1})`);
    if (reducido && m.transiciones) fallos.push(`${pieza} ${ancho} reducido: siluetas con transición (paso ${k + 1})`);
    distancias.push(m.distancia);
    if (!m.activo) break;
    await p.click("[data-siguiente]");
  }
  await p.close();
  await servidor.close();
  return { distancias, paso1 };
}

for (const pieza of PIEZAS) {
  for (const ancho of [320, 375]) {
    for (const reducido of [false, true]) {
      const r = await recorrer(RAIZ, pieza, ancho, reducido);
      const distintas = [...new Set(r.distancias)];
      const tag = `${pieza} · ${ancho}${reducido ? " · reducido" : ""}`;
      if (distintas.length !== 1) fallos.push(`${tag}: «Siguiente» se mueve (${distintas.join(" · ")})`);
      let comparado = "";
      if (OTRA && !reducido) {
        const base = await recorrer(OTRA, pieza, ancho, false);
        comparado = ` · hoy ${[...new Set(base.distancias)].join("/")}`;
        if (base.distancias[0] !== r.distancias[0]) fallos.push(`${tag}: la escena cambió de alto (${base.distancias[0]} → ${r.distancias[0]})`);
      }
      if (!reducido) informe.push(`${tag}: «Siguiente» a ${distintas.join("/")}${comparado} · ${r.distancias.length} pasos · paso 1: ${r.paso1.siluetas} siluetas${r.paso1.vacio !== null ? `, vacío al fondo ${r.paso1.vacio}` : ""}`);
    }
  }
}

await navegador.close();
console.log(informe.join("\n"));
if (fallos.length) { console.error(`\nFALLA:\n${fallos.slice(0, 40).join("\n")}`); process.exit(1); }
console.log("\nTodo en orden.");
