/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PRUEBA DE XENO PARA LOS IDENTIFICADORES DE TEMA (Célula E, P2 de Itagaki).
 *
 * Pone en fila todos los del registro (src/data/identificadoresDeTema.js), a
 * 32 px y en gris (trazo y acento #7A8798, el inactivo de Xeno), a 320 y 375.
 * Mide en Chromium que cada uno ocupe 32 × 32, que la fila quepa sin
 * desbordarse, que cada dibujo pinte y que no haya dos iguales a ese tamaño
 * (se comparan sus píxeles). Con CAPTURAS=dir guarda la fila.
 *
 *   CHROMIUM_PATH=/opt/pw-browsers/chromium node --import ./scripts/cargador-jsx.mjs scripts/e5/medir-identificadores.mjs
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ICONO_POR_TEMA } from "../../src/data/identificadoresDeTema.js";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.env.CAPTURAS ?? null;
const GRIS = "#7A8798";
const temas = Object.keys(ICONO_POR_TEMA);
const fila = temas.map((t) => `<span data-tema="${t}" style="display:inline-flex;width:32px;height:32px">${renderToStaticMarkup(h(ICONO_POR_TEMA[t], { size: 32 }))}</span>`).join("");
const html = `<!doctype html><html><body style="margin:0;background:#1C2939;color:${GRIS};--fae-acento:${GRIS}">
<div data-fila style="margin:16px;display:flex;gap:8px;flex-wrap:nowrap">${fila}</div></body></html>`;

const fallos = [];
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
for (const ancho of [320, 375]) {
  const pg = await navegador.newPage({ viewport: { width: ancho, height: 200 } });
  await pg.setContent(html);
  const m = await pg.evaluate(() => {
    const f = document.querySelector("[data-fila]");
    return {
      desborda: f.scrollWidth > f.clientWidth + 0.5 || document.documentElement.scrollWidth > window.innerWidth,
      cajas: [...f.querySelectorAll("svg")].map((s) => { const r = s.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }),
    };
  });
  if (m.desborda) fallos.push(`${ancho} px · la fila se desborda`);
  m.cajas.forEach(([w, hh], k) => { if (w !== 32 || hh !== 32) fallos.push(`${ancho} px · ${temas[k]} mide ${w} × ${hh}`); });
  /* Píxeles de cada uno: que pinte y que no haya dos iguales. */
  const huellas = [];
  for (const t of temas) {
    const png = await pg.locator(`[data-tema="${t}"]`).screenshot();
    huellas.push(png.toString("base64"));
    if (png.length < 300) fallos.push(`${ancho} px · ${t} no pinta`);
  }
  const repetidos = temas.filter((t, k) => huellas.indexOf(huellas[k]) !== k);
  if (repetidos.length) fallos.push(`${ancho} px · iguales a 32 px: ${repetidos.join(", ")}`);
  if (CAPTURAS) await pg.locator("[data-fila]").screenshot({ path: resolve(CAPTURAS, `identificadores-${ancho}.png`) });
  console.log(`${ancho} px · ${temas.length} identificadores en fila a 32 px, en gris: ${m.desborda ? "se desborda" : "caben"}`);
  await pg.close();
}
await navegador.close();
if (fallos.length) { console.log(`FALLA:\n  · ${fallos.join("\n  · ")}`); process.exit(1); }
console.log("PASA: la fila de identificadores a 32 px y en gris, a 320 y 375.");
