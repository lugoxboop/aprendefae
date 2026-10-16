/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE EL TÍTULO DEL TEMA EN DOS RENGLONES A 320 PX? (Célula C)
 *
 *   node scripts/t7/medir-titulo-320.mjs
 *
 * Chromium de verdad, cada vista de la célula (T7-1, T7-2, T7-3 y T5) en el
 * banco scripts/t7/harness-titulo, con la regla compartida de la cabecera
 * (AccountControl, #228: dos renglones como mucho, sin «…»). Por título:
 *
 *   · renglones que ocupa (alto del h1 / alto de línea)
 *   · si el tope de dos lo recorta: scrollHeight > clientHeight. Ojo:
 *     scrollWidth > clientWidth no ve el corte de un clamp (aviso de #228)
 *   · los renglones que pediría sin tope
 *
 * Sale con 1 si algún título pasa de dos renglones o queda recortado, o si
 * no se midió con Sora (la letra de reserva da otros renglones). Donde
 * Google Fonts no responde, FUENTES_DIR sirve las fuentes desde disco: una
 * carpeta con fuentes.css y los .woff2, nombrados por su ruta con «_».
 * Necesita Playwright (el de la máquina o PLAYWRIGHT_MODULE).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness-titulo/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await navegador.newContext({ viewport: { width: 320, height: 640 } });
const FUENTES = process.env.FUENTES_DIR;
if (FUENTES) {
  await ctx.route("https://fonts.googleapis.com/**", (r) => r.fulfill({ status: 200, contentType: "text/css", body: readFileSync(`${FUENTES}/fuentes.css`, "utf8") }));
  await ctx.route("https://fonts.gstatic.com/**", (r) => {
    try { return r.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(`${FUENTES}/${r.request().url().replace("https://fonts.gstatic.com/", "").replace(/\//g, "_")}`) }); } catch { return r.abort(); }
  });
}
const malos = [];
for (const hash of ["#t7-1", "#t7-2", "#t7-3", "#t5"]) {
  const p = await ctx.newPage();
  await p.goto(`${BANCO}${hash}`);
  await p.waitForSelector("[data-titulo-tema]", { timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  const m = await p.evaluate(() => {
    const h = document.querySelector("[data-titulo-tema]");
    const cs = getComputedStyle(h);
    const linea = parseFloat(cs.lineHeight);
    const r = { sora: document.fonts.check('700 17px "Sora"') && [...document.fonts].some((f) => f.family.replace(/"/g, "") === "Sora" && f.status === "loaded"), texto: h.textContent.trim(), ancho: innerWidth, clamp: cs.webkitLineClamp, renglones: Math.round(h.getBoundingClientRect().height / linea), recortado: h.scrollHeight > h.clientHeight + 1, puntos: cs.textOverflow };
    h.style.webkitLineClamp = "unset"; h.style.display = "block";
    r.sinTope = Math.round(h.getBoundingClientRect().height / linea);
    return r;
  });
  console.log(`${hash} · Sora ${m.sora ? "sí" : "NO"} · «${m.texto}» · ${m.renglones} renglones (sin tope: ${m.sinTope}) · recortado: ${m.recortado ? "SÍ" : "no"} · clamp ${m.clamp} · ancho ${m.ancho}`);
  if (!m.sora || m.renglones > 2 || m.recortado || m.ancho !== 320 || m.puntos === "ellipsis") malos.push(hash);
  await p.close();
}
await ctx.close(); await navegador.close(); await servidor.close();
if (malos.length) { console.log("NO CABEN:", malos.join(", ")); process.exit(1); }
console.log("Los cuatro títulos caben en dos renglones, enteros.");
