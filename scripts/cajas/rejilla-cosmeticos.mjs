/*
 * REJILLA DE LOS COSMÉTICOS DE CAJA SOBRE LOS SIETE ANIMALES (28-nov).
 * Pinta cada cosmético de caja sobre cada especie (cuerpo entero, 220 px por
 * celda: a 150 «se ve bien» y no lo está) y fotografía la hoja. Sirve el arte
 * desde un build ya hecho.
 *
 *   npx vite build --outDir /tmp/dist && (cd /tmp/dist && python3 -m http.server 8099) &
 *   node scripts/cajas/rejilla-cosmeticos.mjs http://localhost:8099 /tmp/dist carpeta [rareza]
 */
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { svgMarioneta } from "../../src/mascota/marionetas.js";
import { ESTILO_MARIONETA } from "../../src/mascota/marioneta-estilo.js";
import { COSMETICOS_CAJA, RAREZA } from "../../src/mascota/cosmeticos-caja.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const [URL_BASE = "http://localhost:8099", DIST = "/tmp/dist", SALIDA = "capturas", SOLO] = process.argv.slice(2);
mkdirSync(SALIDA, { recursive: true });
const ESPECIES = ["perro", "gato", "conejo", "zorro", "hamster", "huron", "panda"];
const lista = COSMETICOS_CAJA.filter((c) => !SOLO || c.rareza === SOLO);

let filas = "";
for (const c of lista) {
  filas += `<tr><th style="color:rgb(${RAREZA[c.rareza].rgb})">${c.nombre}<br><small>${RAREZA[c.rareza].nombre}</small></th>`;
  for (const e of ESPECIES) {
    const r = svgMarioneta(e, { puestos: [c.id], uid: `${e}-${c.id}` });
    filas += `<td><svg class="mta mta-tranquila" viewBox="${r.viewBox}" width="200" height="214">${r.inner}</svg></td>`;
  }
  filas += "</tr>";
}
const html = `<!doctype html><meta charset="utf-8"><style>${ESTILO_MARIONETA} body{background:#0E1B2E;color:#F8F9FA;font:13px Inter,sans-serif;margin:10px} td{background:#1D3557;border-radius:10px} th{width:120px;text-align:left}</style><table>${filas}</table>`;
writeFileSync(join(DIST, "rejilla-cosmeticos.html"), html);
const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
await page.goto(`${URL_BASE}/rejilla-cosmeticos.html`);
await page.waitForTimeout(2500);
await page.screenshot({ path: join(SALIDA, `rejilla-${SOLO || "todas"}.png`), fullPage: true });
await nav.close();
console.log("listo", lista.length, "cosméticos ×", ESPECIES.length);
