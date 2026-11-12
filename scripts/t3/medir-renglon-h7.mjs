/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · H7 «EL CIERRE COMPLETO»: CUÁNTAS LÍNEAS OCUPA CADA NOMBRE REAL DEL
 * ESTANTE EN EL RENGLÓN REDISEÑADO, ANTES DE CONSTRUIRLO
 * (orquestador/revisiones/volumen/e-volumen-forma-v1-delta.md §2).
 *
 * Pinta cada nombre del estante de los dos casos publicados (San Calixto y
 * La Servicial S.A.) con las fuentes de producción, en Inter 14/20 peso 600,
 * en la caja que da el delta (107 px a 320, 162 a 375: el mismo renglón con
 * 55 px más de ancho útil), en la que dejaba la página real con el relleno
 * de 6 a los lados (85 y 140: el estante mide 236 y 291 por dentro de su
 * sección, no 258 y 313) y en la construida (106 y 161: sin ese relleno y
 * con los botones en 56 · 4 · 62; ver ElCierreCompleto.jsx).
 * Dice también si alguna palabra no cabe y se sale de la caja. Debajo, su saldo, como sale hoy (Sora 12/16, cifras
 * tabulares). Devuelve las líneas del nombre, el alto de la zona del nombre
 * y el alto del renglón con la regla del delta, máx(zona + 8, 56), y suma
 * el estante: renglones + 6 de aire entre ellos.
 *
 *   bash scripts/t4/sonda-enganche/fuentes.sh   # una vez
 *   node scripts/t3/medir-renglon-h7.mjs
 *
 * ⛔ Si un nombre pasa de 3 líneas a 320, la salida lo dice: hay que parar.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "../t4/panel-docente/pagina.mjs";
import { CASOS_ACT7 } from "../../src/data/contabilidadTema3Act7.js";
import { estanteDe, saldoDe } from "../../src/contabilidad/elCierreCompleto.js";
import { pesos } from "../../src/data/contabilidad.js";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "../..");
const FUENTES = process.env.SONDA_FUENTES ?? join(RAIZ, "scripts/t4/sonda-enganche/.sonda-fuentes");
const fuente = (fam, peso) => readFileSync(`${FUENTES}/fontsource-${fam}-5.3.0/package/files/${fam}-latin-${peso}-normal.woff2`).toString("base64");
const css = `
@font-face { font-family: Inter; font-weight: 600; src: url(data:font/woff2;base64,${fuente("inter", 600)}) format("woff2"); }
@font-face { font-family: Sora; font-weight: 400; src: url(data:font/woff2;base64,${fuente("sora", 400)}) format("woff2"); }
body { margin: 0; background: #0E1B2E; }
.zona { display: flex; flex-direction: column; box-sizing: border-box; }
.nombre { font-family: Inter, sans-serif; font-size: 14px; line-height: 20px; font-weight: 600; }
.saldo { font-family: Sora, sans-serif; font-size: 12px; line-height: 16px; font-variant-numeric: tabular-nums; }
`;

/* [ventana, ancho del nombre, de dónde sale] */
const ANCHOS = [[320, 107, "delta"], [320, 85, "página con relleno 6"], [320, 106, "construido"], [375, 162, "delta"], [375, 140, "página con relleno 6"], [375, 161, "construido"]];
const casos = CASOS_ACT7.map((c) => ({ empresa: c.empresa, cuentas: estanteDe(c).map((n) => ({ n, saldo: saldoDe(c, n) })) }));

const nav = await chromium.launch();
const page = await nav.newPage();
await page.setContent(`<style>${css}</style><div id="raiz"></div>`);
const filas = await page.evaluate(async ({ casos, ANCHOS, saldos }) => {
  await document.fonts.load("600 14px Inter");
  await document.fonts.load("400 12px Sora");
  const raiz = document.getElementById("raiz");
  const out = [];
  for (const c of casos) {
    for (const [ancho, w, fuente] of ANCHOS) {
      for (const [k, x] of c.cuentas.entries()) {
        const z = document.createElement("span");
        z.className = "zona"; z.style.width = `${w}px`;
        const n = document.createElement("span"); n.className = "nombre"; n.textContent = x.n; z.append(n);
        if (x.saldo !== null) { const s = document.createElement("span"); s.className = "saldo"; s.textContent = saldos[c.empresa][k]; z.append(s); }
        raiz.append(z);
        const hn = n.getBoundingClientRect().height;
        out.push({ empresa: c.empresa, ancho, w, fuente, nombre: x.n, lineas: Math.round(hn / 20), sale: Math.round((n.scrollWidth - w) * 10) / 10, zona: Math.round(z.getBoundingClientRect().height * 10) / 10, conSaldo: x.saldo !== null });
        z.remove();
      }
    }
  }
  return out;
}, { casos, ANCHOS, saldos: Object.fromEntries(casos.map((c) => [c.empresa, c.cuentas.map((x) => (x.saldo === null ? null : pesos(x.saldo)))])) });
await nav.close();

const renglonDe = (zona) => Math.max(zona + 8, 56);
console.log("| caso | ventana | caja del nombre | nombre | se sale (px) | líneas del nombre | zona del nombre (con saldo) | renglón máx(zona + 8, 56) | renglón sin el saldo |");
console.log("|---|---|---|---|---|---|---|---|---|");
for (const f of filas) console.log(`| ${f.empresa} | ${f.ancho} | ${f.w} (${f.fuente}) | ${f.nombre} | ${f.sale > 0 ? `**${f.sale}**` : "—"} | ${f.lineas} | ${f.zona} | ${renglonDe(f.zona)} | ${Math.max(f.lineas * 20 + 8, 56)} |`);
console.log("");
let parar = false;
for (const c of casos) {
  for (const [ancho, w, fuente] of ANCHOS) {
    const fs = filas.filter((f) => f.empresa === c.empresa && f.w === w);
    const reparto = [1, 2, 3, 4].map((l) => fs.filter((f) => f.lineas === l).length);
    const alto = fs.reduce((s, f) => s + renglonDe(f.zona), 0) + 6 * (fs.length - 1);
    const sinSaldo = fs.reduce((s, f) => s + Math.max(f.lineas * 20 + 8, 56), 0) + 6 * (fs.length - 1);
    console.log(`- ${c.empresa} a ${ancho}, nombre en ${w} (${fuente}): ${fs.length} renglones; reparto 1/2/3 líneas = ${reparto.slice(0, 3).join("/")}${reparto[3] ? `, **${reparto[3]} con 4 o más**` : ""}; estante ${alto} px (sin el saldo, ${sinSaldo})`);
    const salen = fs.filter((f) => f.sale > 0).map((f) => `${f.nombre} (${f.sale})`);
    if (salen.length) console.log(`  · **se salen de la caja:** ${salen.join(", ")}`);
    if (ancho === 320 && fs.some((f) => f.lineas > 3)) parar = true;
  }
}
console.log(parar ? "\n⛔ HAY NOMBRES DE MÁS DE 3 LÍNEAS A 320: PARAR Y AVISAR." : "\n✓ Ningún nombre pasa de 3 líneas a 320.");
