/*
 * Vara 1 del panel docente (orquestador/revisiones/panel-docente/aceptacion.md),
 * medida sobre el build servido con el curso falso. No decide el veredicto
 * (eso es de Shibukawa): mide y deja las cifras y las capturas.
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build
 *   npx vite preview --port 8099 --strictPort &
 *   node scripts/t4/panel-docente/vara1.mjs [http://localhost:8099] [salida.json]
 *
 * Capturas en orquestador/revisiones/panel-docente/capturas-v1/. Código 2 si
 * no pudo medir (sin fuentes, o el panel no pintó).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirPanel, chromium, hayFuentes, RAIZ } from "./pagina.mjs";
import { RPC_QUE_ESCRIBEN } from "./curso-falso.mjs";

const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const SALIDA = process.argv[3] ?? join(RAIZ, "orquestador/revisiones/panel-docente/vara1-medidas.json");
const CAPTURAS = join(RAIZ, "orquestador/revisiones/panel-docente/capturas-v1");
if (!hayFuentes()) { console.error("faltan las fuentes: bash scripts/t4/sonda-enganche/fuentes.sh"); process.exit(2); }
mkdirSync(CAPTURAS, { recursive: true });

const TAMANOS = [[375, 667], [1366, 768]];
const listo = async (page) => {
  await page.waitForSelector("[data-bloque=b1], [data-error-carga]", { timeout: 30000 });
  await page.waitForFunction(() => !document.querySelector("[data-bloque=b3][aria-busy]"), null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(400);
};

/* Lo que se mide en la página: la primera pantalla tal como la ve el docente. */
function medirPrimeraPantalla() {
  const V = innerHeight;
  const rect = (el) => el.getBoundingClientRect();
  const entero = (el) => { const r = rect(el); return r.height > 0 && r.top >= 0 && r.bottom <= V + 0.5; };
  const asoma = (el) => { const r = rect(el); return r.height > 0 && r.bottom > 0 && r.top < V; };
  const visibleCss = (el) => { const s = getComputedStyle(el); return s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0.05; };

  /* P1 */
  const avance = document.querySelector("[data-cifra=avance]");
  const filasAt = [...document.querySelectorAll("[data-bloque=b2] [data-atencion]")];
  const nadie = document.querySelector("[data-bloque=b2] [data-nadie]");
  const peor = document.querySelector("[data-bloque=b3] [data-peor], [data-bloque=b3] [data-sin-datos]");
  const P1 = {
    avance: avance ? { texto: avance.textContent, entera: entero(avance) } : null,
    atencion: filasAt.length ? filasAt.map((f) => ({ texto: f.innerText.replace(/\s+/g, " ").trim(), entera: entero(f) })) : nadie ? [{ texto: nadie.textContent, entera: entero(nadie) }] : [],
    peor: peor ? { texto: peor.innerText.replace(/\s+/g, " ").trim(), entera: entero(peor), tarjetaEntera: entero(document.querySelector("[data-bloque=b3]")) } : null,
  };
  /* P2: orden de los bloques en el DOM y si hay una lista de estudiantes en la primera pantalla. */
  const bloques = [...document.querySelectorAll("[data-bloque]")].filter((b) => visibleCss(b));
  const P2 = { ordenDom: bloques.map((b) => b.dataset.bloque), listaEnPrimeraPantalla: [...document.querySelectorAll("[data-vista=estudiantes], [data-estudiante]")].some(asoma) };
  /* P4: bloques (tarjetas o secciones) que asoman en la primera pantalla. */
  const P4 = { bloques: bloques.filter(asoma).map((b) => b.dataset.bloque), enlacesDeVista: [...document.querySelectorAll("[data-ir]")].filter(asoma).map((b) => b.dataset.ir) };
  /* P5: cada número visible en la primera pantalla, con su texto. */
  const numeros = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const el = n.parentElement;
    if (!el || !n.textContent.trim() || !visibleCss(el) || el.closest("[aria-hidden=true], figcaption, style, script")) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    const r = rg.getBoundingClientRect();
    if (!(r.height > 0 && r.bottom > 0 && r.top < V)) continue;
    for (const m of n.textContent.matchAll(/\d+(?:[.,]\d+)*\s?%?/g)) numeros.push({ cifra: m[0].trim(), en: n.textContent.trim().slice(0, 60) });
  }
  /* P6: los colores con rol (texto, fondo, borde, relleno) en la primera pantalla. */
  const colores = new Map();
  const anota = (c, rol, el) => { if (!c || c === "rgba(0, 0, 0, 0)" || c === "transparent") return; const k = `${rol}:${c}`; colores.set(k, (colores.get(k) ?? 0) + 1); };
  for (const el of document.querySelectorAll("body *")) {
    if (!visibleCss(el) || !asoma(el)) continue;
    const s = getComputedStyle(el);
    if (el.childNodes.length && [...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim())) anota(s.color, "texto", el);
    anota(s.backgroundColor, "fondo", el);
    if (parseFloat(s.borderTopWidth) > 0) anota(s.borderTopColor, "borde", el);
    if (el.tagName === "path" || el.tagName === "circle") anota(s.fill, "relleno", el);
  }
  return { V, P1, P2, P4, P5: numeros, P6: [...colores.entries()].map(([k, n]) => ({ k, n })), total: document.documentElement.scrollHeight };
}

/* P9, P10: en la vista que esté abierta, toda la página (no solo la primera pantalla). */
function medirToqueYLetra() {
  const lum = (c) => { const m = c.match(/[\d.]+/g)?.map(Number); if (!m) return null; const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return { L: 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]), a: m[3] ?? 1 }; };
  const fondoDe = (el) => {
    let capas = [];
    for (let x = el; x; x = x.parentElement) { const b = getComputedStyle(x).backgroundColor; const m = b.match(/[\d.]+/g)?.map(Number); if (m && (m[3] ?? 1) > 0) { capas.push(m); if ((m[3] ?? 1) >= 1) break; } }
    /* Mezcla las capas semitransparentes sobre la primera opaca. */
    let [r, g, b] = capas.length ? capas[capas.length - 1].slice(0, 3) : [14, 27, 46];
    for (let i = capas.length - 2; i >= 0; i--) { const [cr, cg, cb, ca = 1] = capas[i]; r = cr * ca + r * (1 - ca); g = cg * ca + g * (1 - ca); b = cb * ca + b * (1 - ca); }
    return `rgb(${r}, ${g}, ${b})`;
  };
  const contraste = (a, b) => { const x = lum(a), y = lum(b); if (!x || !y) return null; const [hi, lo] = x.L > y.L ? [x.L, y.L] : [y.L, x.L]; return (hi + 0.05) / (lo + 0.05); };
  const panel = document.querySelector(".pd1") ?? document.body;
  const chicos = [];
  for (const el of panel.querySelectorAll("button, a[href], input, select, [role=slider], [tabindex='0']")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === "hidden") continue;
    if (r.width < 44 - 0.5 || r.height < 44 - 0.5) chicos.push({ el: (el.getAttribute("aria-label") ?? el.textContent).trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) });
  }
  let minLetra = Infinity, peorContraste = Infinity;
  const bajos = [];
  const tw = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const el = n.parentElement;
    if (!el || !n.textContent.trim() || el.closest("[aria-hidden=true], style, script, .t4f-sr, [data-esqueleto]")) continue;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || el.getClientRects().length === 0) continue;
    const fs = parseFloat(s.fontSize);
    if (fs < minLetra) minLetra = fs;
    const c = contraste(s.color, fondoDe(el));
    const op = Number(s.opacity);
    if (c !== null && op > 0.9) {
      if (c < peorContraste) peorContraste = c;
      if (c < 4.5) bajos.push({ texto: n.textContent.trim().slice(0, 40), contraste: Math.round(c * 100) / 100, color: s.color });
    }
  }
  return { tocablesChicos: chicos, minLetra, peorContraste: Math.round(peorContraste * 100) / 100, contrasteBajo: bajos.slice(0, 20), nContrasteBajo: bajos.length, scrollHorizontal: document.documentElement.scrollWidth > innerWidth };
}

const navegador = await chromium.launch();
const R = { fecha: new Date().toISOString(), url: URL_BASE, estados: {}, vistas: {}, p3: null, p8: null, b3: null, anchos320: null };
let fallo = false;

/* Los estados (P1-P6, P11) a 375×667 y 1366×768. */
for (const escenario of ["cero", "uno", "normal", "grande"]) {
  for (const [ancho, alto] of TAMANOS) {
    const { ctx, page, errores, llamadas } = await abrirPanel(navegador, { url: URL_BASE, escenario, ancho, alto });
    try {
      await listo(page);
      const m = await page.evaluate(medirPrimeraPantalla);
      const t = await page.evaluate(medirToqueYLetra);
      await page.screenshot({ path: join(CAPTURAS, `${escenario}-${ancho}x${alto}.png`) });
      R.estados[`${escenario}-${ancho}x${alto}`] = { ...m, ...t, errores, msPeor: await page.getAttribute("[data-ms-peor]", "data-ms-peor").catch(() => null), rpcs: llamadas.map((l) => l.rpc ?? `${l.metodo} ${l.rest}`) };
    } catch (e) { fallo = true; R.estados[`${escenario}-${ancho}x${alto}`] = { error: String(e), errores }; }
    await ctx.close();
  }
}

/* Error de carga y cargando (P11). */
for (const [ancho, alto] of TAMANOS) {
  const a = await abrirPanel(navegador, { url: URL_BASE, ancho, alto, falla: "panel_estudiantes" });
  await a.page.waitForSelector("[data-error-carga]", { timeout: 30000 }).catch(() => { fallo = true; });
  await a.page.screenshot({ path: join(CAPTURAS, `error-${ancho}x${alto}.png`) });
  R.estados[`error-${ancho}x${alto}`] = { reintentar: Boolean(await a.page.$("[data-reintentar]")), errores: a.errores };
  await a.ctx.close();
  const b = await abrirPanel(navegador, { url: URL_BASE, ancho, alto, retraso: 4000 });
  await b.page.waitForSelector("[data-cargando]", { timeout: 30000 }).catch(() => {});
  await b.page.screenshot({ path: join(CAPTURAS, `cargando-${ancho}x${alto}.png`) });
  R.estados[`cargando-${ancho}x${alto}`] = { esqueleto: Boolean(await b.page.$("[data-cargando]")) };
  await b.ctx.close();
}

/* Las vistas aparte (curso normal), P3 y P8: una sesión completa, contando toques y escrituras. */
for (const [ancho, alto] of TAMANOS) {
  const { ctx, page, llamadas, errores } = await abrirPanel(navegador, { url: URL_BASE, ancho, alto });
  await listo(page);
  const vista = async (nombre, accion) => {
    await accion();
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(CAPTURAS, `vista-${nombre}-${ancho}x${alto}.png`), fullPage: true });
    R.vistas[`${nombre}-${ancho}x${alto}`] = { ...(await page.evaluate(medirToqueYLetra)), alto: await page.evaluate(() => document.documentElement.scrollHeight) };
  };
  await vista("temas", () => page.click("[data-bloque=b1] button[aria-expanded]"));
  await page.click("[data-bloque=b1] button[aria-expanded]");
  await vista("atencion", () => page.click("[data-ver-atencion]"));
  await page.click("[data-volver]");
  await vista("estudiantes", () => page.click("[data-ir=estudiantes]"));
  await vista("estudiante", () => page.click("[data-estudiante]"));
  await page.click("[data-volver]"); await page.click("[data-volver]");
  /* P3: dos toques del resumen al rendimiento de una actividad cualquiera. */
  let toques = 0;
  await page.click("[data-ir=actividades]"); toques++;
  await page.waitForSelector("[data-fila-actividad]");
  await page.waitForFunction(() => !document.querySelector("[data-vista=actividades][aria-busy]"), null, { timeout: 30000 }).catch(() => {});
  await page.screenshot({ path: join(CAPTURAS, `vista-actividades-${ancho}x${alto}.png`), fullPage: true });
  R.vistas[`actividades-${ancho}x${alto}`] = { ...(await page.evaluate(medirToqueYLetra)), filas: await page.$$eval("[data-fila-actividad]", (x) => x.length) };
  await page.click("[data-fila-actividad]"); toques++;
  await page.waitForSelector("[data-vista=actividad]");
  await page.waitForTimeout(700);
  await page.click("[data-mas-cifras]").catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(CAPTURAS, `vista-actividad-${ancho}x${alto}.png`), fullPage: true });
  R.vistas[`actividad-${ancho}x${alto}`] = await page.evaluate(medirToqueYLetra);
  if (ancho === 375) {
    R.p3 = { toques, llega: Boolean(await page.$("[data-vista=actividad]")) };
    const nombres = [...new Set(llamadas.map((l) => l.rpc ?? `${l.metodo} ${l.rest}`))];
    R.p8 = { rpcs: nombres, escrituras: llamadas.filter((l) => RPC_QUE_ESCRIBEN.includes(l.rpc) || l.metodo).map((l) => l.rpc ?? `${l.metodo} ${l.rest}`), errores };
  }
  await ctx.close();
}

/* ⛔ B3: el tiempo de las 6 llamadas tras el primer pintado, con 0 y con 150 ms de red por llamada. */
R.b3 = {};
for (const retraso of [0, 150, 400]) {
  const { ctx, page, llamadas } = await abrirPanel(navegador, { url: URL_BASE, retraso });
  await listo(page);
  const act = llamadas.filter((l) => l.rpc === "panel_actividad");
  R.b3[`red-${retraso}ms`] = { msPeor: Number(await page.getAttribute("[data-ms-peor]", "data-ms-peor")), llamadas: act.length };
  await ctx.close();
}

/* ⛔ 320 px: sin scroll horizontal en el resumen y en las listas, con nombres largos (curso grande). */
R.anchos320 = {};
for (const [nombre, sel] of [["inicio", null], ["estudiantes", "[data-ir=estudiantes]"], ["actividades", "[data-ir=actividades]"], ["atencion", "[data-ver-atencion]"]]) {
  const { ctx, page } = await abrirPanel(navegador, { url: URL_BASE, escenario: "grande", ancho: 320, alto: 568 });
  await listo(page);
  if (sel) { await page.click(sel); await page.waitForTimeout(800); }
  R.anchos320[nombre] = await page.evaluate(() => ({ scrollHorizontal: document.documentElement.scrollWidth > innerWidth, ancho: document.documentElement.scrollWidth }));
  if (nombre === "inicio") await page.screenshot({ path: join(CAPTURAS, `grande-320x568.png`) });
  await ctx.close();
}

await navegador.close();
writeFileSync(SALIDA, JSON.stringify(R, null, 2) + "\n");
console.log(JSON.stringify(R, null, 2));
process.exit(fallo ? 2 : 0);
