/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA BARRA DE ENGANCHE · B1 A 320 PX, EN CHROMIUM (Célula C, T7 y T5).
 *
 *   node scripts/t7/canon-b1.mjs [--estricto] [--json archivo]
 *
 * B1 (orquestador/conocimiento/enganche.md): a 320 px, la figura o la
 * interacción empieza en los primeros 280 px de la tarjeta, y el texto antes
 * de ella no pasa de 40 palabras. Los píxeles piden layout de verdad, así que
 * esto no corre en CI (no hay navegador ahí): las palabras de B1 y todo B2 sí,
 * en src/contabilidad/__tests__/canon-enganche.test.mjs, con la misma medida
 * (src/contabilidad/canonEnganche.js).
 *
 * Mide cada pantalla de las piezas de Aprender de la célula al llegar y la
 * apertura de cada Hacer, sobre el banco scripts/t7/harness-canon. Imprime lo
 * que no cumple. MODO INFORME: sale con 0 salvo con --estricto.
 *
 * Necesita Playwright (no es dependencia del repo): el de la máquina, o el de
 * PLAYWRIGHT_MODULE; Chromium en CHROMIUM_PATH si no es el de Playwright.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const ESTRICTO = process.argv.includes("--estricto");
const JSON_SALIDA = process.argv.includes("--json") ? process.argv[process.argv.indexOf("--json") + 1] : null;
const ANCHO = 320, ALTO = 640, UMBRAL_PX = 280, UMBRAL_PALABRAS = 40;

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-canon/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await navegador.newContext({ viewport: { width: ANCHO, height: ALTO }, deviceScaleFactor: 2 });

async function medir(hash) {
  const p = await ctx.newPage();
  try {
    await p.goto(`${BANCO}#${hash}`);
    await p.waitForFunction(() => window.canon && document.getElementById("root").childElementCount > 0, null, { timeout: 30000 });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    return await p.evaluate(() => window.canon.medir());
  } finally {
    await p.close();
  }
}

const listas = await (async () => {
  const p = await ctx.newPage();
  await p.goto(`${BANCO}#`);
  await p.waitForFunction(() => window.canon, null, { timeout: 60000 });
  const l = await p.evaluate(() => ({ aprender: window.canon.aprender, hacer: window.canon.hacer }));
  await p.close();
  return l;
})();

const filas = [];
for (const [i, pz] of listas.aprender.entries()) {
  for (const [k, pt] of pz.pantallas.entries()) {
    const m = await medir(`a/${i}/${k}`);
    filas.push({ clase: "Aprender", tema: pz.tema, pieza: pz.id, pantalla: pt.id, ...m });
  }
}
for (const [i, hc] of listas.hacer.entries()) {
  const m = await medir(`h/${i}`);
  filas.push({ clase: "Hacer", tema: hc.tema, pieza: hc.id, pantalla: "apertura", ...m });
}
await ctx.close(); await navegador.close(); await servidor.close();

const malas = filas.filter((f) => f.ancho !== ANCHO || !f.conAncla || f.px > UMBRAL_PX || f.antes > UMBRAL_PALABRAS);
const motivo = (f) => [
  f.ancho !== ANCHO && `ancho ${f.ancho}`,
  !f.conAncla ? `sin figura ni interacción (${f.texto} palabras)` : f.px > UMBRAL_PX && `empieza a ${f.px} px`,
  f.conAncla && f.antes > UMBRAL_PALABRAS && `${f.antes} palabras antes`,
].filter(Boolean).join(" · ");
console.log(`B1 a ${ANCHO} px: no cumplen ${malas.length} de ${filas.length} medidas (${filas.filter((f) => f.clase === "Aprender").length} pantallas de Aprender y ${filas.filter((f) => f.clase === "Hacer").length} aperturas de Hacer).`);
for (const f of malas) console.log(`  ${f.clase} · ${f.tema} · ${f.pieza} · ${f.pantalla}: ${motivo(f)}`);
if (JSON_SALIDA) writeFileSync(JSON_SALIDA, JSON.stringify(filas, null, 1));
process.exit(ESTRICTO && malas.length ? 1 : 0);
