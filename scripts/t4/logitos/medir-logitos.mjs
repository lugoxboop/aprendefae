/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS IDENTIFICADORES DE CONTABILIDAD, A LA VISTA (Ukyo,
 * prompts/logitos-temas-conta-v1.md, §5). Mide y deja capturas reducidas:
 *
 *   1. los nueve de Contabilidad en fila, a 32 px y en gris (trazo y acento
 *      en #8A97A8): `logitos-fila-32-gris.png`, y la misma fila a 64 px en
 *      color, de referencia
 *   2. el índice de Contabilidad a 320 y 375, con la tarjeta real
 *      (`logitos-indice-320.png`, `logitos-indice-375.png`): lado del
 *      identificador y desbordes
 *   3. el contraste del trazo (#CBDCF2 en reposo, #F8F9FA con hover) y del
 *      acento contra el fondo real de la tarjeta, con la fórmula de
 *      scripts/contraste.mjs (WCAG; lo que no es texto pide 3:1)
 *   4. el movimiento: en hover, un solo elemento cambia su transform; con
 *      movimiento reducido, ninguno
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build
 *   npx vite preview --port 8099 --strictPort &
 *   node --import ./scripts/cargador-jsx.mjs scripts/t4/logitos/medir-logitos.mjs
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ICONO_POR_TEMA } from "../../../src/data/identificadoresDeTema.js";
import { SUBJECTS } from "../../../src/data/subjects.js";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright"); }
const { chromium } = pw;
const URL_BASE = process.argv[2] ?? "http://localhost:8099";
/* Sora e Inter de producción, las de la sonda (bash scripts/t4/sonda-enganche/fuentes.sh): sin ellas no se mide. */
const FUENTES = process.env.SONDA_FUENTES ?? join(RAIZ, "scripts/t4/sonda-enganche/.sonda-fuentes");
if (!existsSync(`${FUENTES}/fontsource-inter-5.3.0/package/files/inter-latin-400-normal.woff2`)) { console.error("faltan las fuentes"); process.exit(2); }
async function abrir(nav, { ancho, reducido = false }) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 1, reducedMotion: reducido ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(String(e)));
  await page.route("**/*", (route) => {
    const u = route.request().url();
    if (u.includes("/__f/")) {
      const [fam, w] = u.split("/__f/")[1].split("/");
      const base = fam === "Sora" ? "fontsource-sora-5.3.0/package/files/sora-latin-" : "fontsource-inter-5.3.0/package/files/inter-latin-";
      return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(`${FUENTES}/${base}${w.split(".")[0]}-normal.woff2`) });
    }
    if (u.includes("fonts.googleapis.com")) {
      let css = "";
      for (const [fam, ws] of [["Sora", [300, 400, 600, 700, 800]], ["Inter", [400, 500, 600, 700]]]) for (const w of ws) css += `@font-face{font-family:'${fam}';font-weight:${w};src:url(/__f/${fam}/${w}.woff2) format('woff2');}\n`;
      return route.fulfill({ status: 200, contentType: "text/css", body: css });
    }
    if (u.startsWith(URL_BASE)) return route.continue();
    return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await page.goto(`${URL_BASE}/#/contabilidad`);
  return { ctx, page, errores };
}
const DIR = join(RAIZ, "orquestador/revisiones/logitos");
mkdirSync(DIR, { recursive: true });
const R = {};

const temas = SUBJECTS.contabilidad.topics.map((t) => ({ id: t.id, titulo: t.title, C: ICONO_POR_TEMA[`contabilidad/${t.id}`] }));
const fila = (lado, gris) => `<!doctype html><html><body style="margin:0;background:#16233A;padding:16px;display:flex;gap:16px;${gris ? "color:#8A97A8;--fae-acento:#8A97A8;" : "color:#CBDCF2;--fae-acento:#E9C46A;"}">${temas.map((t) => `<div title="${t.titulo}" style="width:${lado}px;height:${lado}px">${renderToStaticMarkup(h(t.C, { size: lado }))}</div>`).join("")}</body></html>`;

const nav = await chromium.launch();

/* 1 · la fila */
{
  const ctx = await nav.newContext({ viewport: { width: 9 * 48 + 48, height: 64 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.setContent(fila(32, true));
  await p.screenshot({ path: join(DIR, "logitos-fila-32-gris.png") });
  await p.setViewportSize({ width: 9 * 80 + 48, height: 96 });
  await p.setContent(fila(64, false));
  await p.screenshot({ path: join(DIR, "logitos-fila-64-color.png") });
  R.fila = temas.map((t) => t.id);
  await ctx.close();
}

/* 2, 3 y 4 · la tarjeta real */
const lum = (c) => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const razon = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100; };
for (const ancho of [320, 375]) {
  const { ctx, page, errores } = await abrir(nav, { ancho });
  await page.waitForSelector(".fae-identificador", { timeout: 30000 });
  await page.waitForTimeout(600);
  const m = await page.evaluate(() => {
    const fondoDe = (el) => {
      const capas = [];
      for (let x = el; x; x = x.parentElement) { const v = getComputedStyle(x).backgroundColor.match(/[\d.]+/g)?.map(Number); if (v && (v[3] ?? 1) > 0) { capas.push(v); if ((v[3] ?? 1) >= 1) break; } }
      let [r, g, b] = capas.length ? capas[capas.length - 1].slice(0, 3) : [14, 27, 46];
      for (let i = capas.length - 2; i >= 0; i--) { const [cr, cg, cb, ca = 1] = capas[i]; r = cr * ca + r * (1 - ca); g = cg * ca + g * (1 - ca); b = cb * ca + b * (1 - ca); }
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    };
    return [...document.querySelectorAll(".fae-identificador")].map((el) => {
      const r = el.getBoundingClientRect();
      const acento = el.querySelector("[stroke='var(--fae-acento)']");
      const tarjeta = el.closest(".fae-card");
      return {
        tema: tarjeta?.querySelector("h2, h3, p")?.textContent.trim().slice(0, 40),
        lado: Math.round(r.width), alto: Math.round(r.height),
        trazo: getComputedStyle(el).color, acento: acento ? getComputedStyle(acento).stroke : null, fondo: fondoDe(el),
        propio: Boolean(el.querySelector("[data-mueve]")),
        desborda: r.right > innerWidth || r.left < 0,
      };
    });
  });
  for (const x of m) { x.contrasteTrazo = razon(x.trazo, x.fondo); x.contrasteHover = razon("rgb(248, 249, 250)", x.fondo); x.contrasteAcento = x.acento ? razon(x.acento, x.fondo) : null; }
  /* 4 · el movimiento en hover: cuántos elementos cambian su transform en la primera tarjeta con identificador propio. */
  const tarjetas = await page.$$(".fae-card:has(.fae-identificador [data-mueve])");
  const mov = [];
  for (const t of tarjetas.slice(0, 4)) {
    const antes = await t.$$eval(".fae-identificador *", (xs) => xs.map((x) => getComputedStyle(x).transform));
    await t.hover(); await page.waitForTimeout(450);
    const despues = await t.$$eval(".fae-identificador *", (xs) => xs.map((x) => getComputedStyle(x).transform));
    mov.push(antes.filter((a, i) => a !== despues[i]).length);
    await page.mouse.move(0, 0);
  }
  await page.screenshot({ path: join(DIR, `logitos-indice-${ancho}.png`), fullPage: true, scale: "css" });
  R[`indice-${ancho}`] = { identificadores: m, elementosQueSeMuevenEnHover: mov, scrollHorizontal: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), errores };
  await ctx.close();
}
/* Con movimiento reducido no se mueve nada. */
{
  const { ctx, page } = await abrir(nav, { ancho: 375, reducido: true });
  await page.waitForSelector(".fae-identificador [data-mueve]");
  const t = await page.$(".fae-card:has(.fae-identificador [data-mueve])");
  const antes = await t.$$eval(".fae-identificador *", (xs) => xs.map((x) => getComputedStyle(x).transform));
  await t.hover(); await page.waitForTimeout(450);
  const despues = await t.$$eval(".fae-identificador *", (xs) => xs.map((x) => getComputedStyle(x).transform));
  R.reducido = { elementosQueSeMueven: antes.filter((a, i) => a !== despues[i]).length };
  await ctx.close();
}
await nav.close();
writeFileSync(join(DIR, "medidas-logitos.json"), JSON.stringify(R, null, 2) + "\n");
console.log(JSON.stringify(R, null, 1));
