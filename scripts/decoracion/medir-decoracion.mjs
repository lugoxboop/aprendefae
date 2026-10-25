/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA DECORACIÓN DE LAS TABLAS, MEDIDA EN EL NAVEGADOR (vida-visual-v1 §7 y §11).
 *
 *   node scripts/decoracion/medir-decoracion.mjs [carpeta-de-capturas]
 *
 * Sirve el banco scripts/decoracion/harness-ranking/ con Vite, con dos
 * sustitutos: los ánimos (como el medidor de Hanayama) y src/lib/supabase.js,
 * que responde las funciones de las tablas con window.__RPC. Así se montan
 * también las pantallas reales del índice de cada materia, con su fondo.
 *
 *   1. elementos en bucle a la vez en la página (tope 3, §11.4)
 *   2. lo que se anima: solo transform; will-change en auto
 *   3. pausa fuera de pantalla y con la pestaña oculta
 *   4. pose quieta con movimiento reducido y en gama baja
 *   5. la parada de CPU (§11.6): el índice de Estratégico con y sin banda, a
 *      CPU ×6 y ×10, 320×640 y dPR 2, 4 s, tres pasadas; tope +15 % a ×6
 *   6. capturas a 320 y 375 de los índices de las tres materias y del ranking
 *      del perfil, con la banda a la vista
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require("/opt/node-tools/node_modules/playwright"); }
const CAPTURAS = process.argv[2] ?? null;
const FUENTES = resolve(RAIZ, "scripts/t4/sonda-enganche/.sonda-fuentes");
const hayFuentes = existsSync(`${FUENTES}/fontsource-inter-5.3.0`);

const ANIMOS = "export async function estadoDeAnimos(a){return Object.fromEntries((a??[]).map((n,i)=>[n,{recibidos:i%3===0?12:i,yaLeDi:i%2===0}]));}\nexport async function darAnimo(){return {ok:true};}\nexport async function animosRecibidos(){return [];}";
const SUPABASE = `
export const GOOGLE_CLIENT_ID = "";
export const supabaseConfigurado = true;
const resp = { data: [], error: null };
const cadena = new Proxy(function () {}, { get: (_, k) => (k === "then" ? (r) => r(resp) : cadena), apply: () => cadena });
export const supabase = {
  rpc: async (n) => ({ data: (globalThis.__RPC ?? {})[n] ?? [], error: null }),
  from: () => cadena,
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  },
  channel: () => ({ on() { return this; }, subscribe() { return this; } }),
  removeChannel() {},
};`;
const sustitutos = { name: "sustitutos", enforce: "pre", load(id) {
  if (id.endsWith("/src/social/animo.js")) return ANIMOS;
  if (id.endsWith("/src/lib/supabase.js")) return SUPABASE;
  return null;
} };
const servidor = await createServer({ root: RAIZ, logLevel: "error", plugins: [sustitutos], server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/decoracion/harness-ranking/index.html`;

const ruta = (pg) => pg.route("**/*", (route) => {
  const u = route.request().url();
  if (hayFuentes && u.includes("/__f/")) { const [fam, w] = u.split("/__f/")[1].split("/"); const base = fam === "Sora" ? `${FUENTES}/fontsource-sora-5.3.0/package/files/sora-latin-` : `${FUENTES}/fontsource-inter-5.3.0/package/files/inter-latin-`; return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(`${base}${w.split(".")[0]}-normal.woff2`) }); }
  if (hayFuentes && u.includes("fonts.googleapis.com")) { let css = ""; for (const [fam, ws] of [["Sora", [300, 400, 600, 700, 800]], ["Inter", [400, 500, 600, 700]]]) for (const w of ws) css += `@font-face{font-family:'${fam}';font-weight:${w};src:url(/__f/${fam}/${w}.woff2) format('woff2');}\n`; return route.fulfill({ status: 200, contentType: "text/css", body: css }); }
  return route.continue();
});

const nav = await pw.chromium.launch();
async function abrir({ caso, banda = true, w = 320, h = 568, dpr = 1, reducido = false, gamaBaja = false }) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, reducedMotion: reducido ? "reduce" : "no-preference" });
  if (gamaBaja) await ctx.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2 }));
  else await ctx.addInitScript(() => { Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 }); Object.defineProperty(navigator, "deviceMemory", { get: () => 8 }); });
  const pg = await ctx.newPage();
  await ruta(pg);
  await pg.goto(`${BANCO}${banda ? "?banda=1" : ""}#${caso}`);
  await pg.waitForSelector(banda ? "[data-banda]" : "[data-columna] > *, h3", { timeout: 120000 });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(500);
  return { ctx, pg };
}

/* Lo que corre ahora mismo en las piezas de la página. */
const estadoPiezas = (pg) => pg.evaluate(() => {
  const piezas = [...document.querySelectorAll("[data-banda] [data-pieza]")];
  const anims = piezas.flatMap((p) => p.getAnimations());
  const props = new Set(anims.flatMap((a) => a.effect.getKeyframes().flatMap((k) => Object.keys(k).filter((x) => !["offset", "computedOffset", "easing", "composite"].includes(x)))));
  const enVista = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  return {
    bandas: document.querySelectorAll("[data-banda]").length,
    bandasEnBucle: document.querySelectorAll("[data-banda][data-bucle]").length,
    enBucle: document.querySelectorAll("[data-banda][data-bucle] [data-pieza]").length,
    enBucleALaVista: [...document.querySelectorAll("[data-banda][data-bucle] [data-pieza]")].filter(enVista).length,
    corriendo: anims.filter((a) => a.playState === "running").length,
    pausadas: anims.filter((a) => a.playState === "paused").length,
    animaciones: anims.length,
    propiedades: [...props],
    willChange: [...new Set(piezas.map((p) => getComputedStyle(p).willChange))],
    fae: document.querySelectorAll("[data-fae]").length,
  };
});

const salida = { bucle: {}, pausa: {}, quieta: {}, cpu: {}, capturas: [] };

/* 1 y 2: en cada pantalla real y en el índice de Estratégico del banco, a 320 y 375. */
for (const [w, h] of [[320, 568], [375, 667]]) {
  for (const caso of ["v:n10:conta", "v:n10:macro", "v:n10:est", "p:n10:est", "r:n10:general"]) {
    const { ctx, pg } = await abrir({ caso, w, h });
    await pg.evaluate(() => document.querySelector("[data-banda]").scrollIntoView({ block: "center" }));
    await pg.waitForTimeout(400);
    salida.bucle[`${w} ${caso}`] = await estadoPiezas(pg);
    if (CAPTURAS && caso !== "p:n10:est") {
      mkdirSync(CAPTURAS, { recursive: true });
      const nombre = `${caso.split(":")[2]}-${caso[0] === "r" ? "perfil" : "indice"}-${w}`;
      await pg.screenshot({ path: `${CAPTURAS}/${nombre}.png` });
      salida.capturas.push(nombre);
    }
    await ctx.close();
  }
}

/* 3: la pausa. Fuera de pantalla, de vuelta, con la pestaña oculta y visible otra vez. */
{
  const { ctx, pg } = await abrir({ caso: "r:n10:conta", w: 320, h: 568 });
  const ver = async () => (await estadoPiezas(pg));
  salida.pausa.alMontar = await ver();
  await pg.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await pg.waitForTimeout(400);
  salida.pausa.fueraDePantalla = await ver();
  await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(400);
  salida.pausa.deVuelta = await ver();
  await pg.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); }); await pg.waitForTimeout(200);
  salida.pausa.pestanaOculta = await ver();
  await pg.evaluate(() => { Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); }); await pg.waitForTimeout(200);
  salida.pausa.pestanaVisible = await ver();
  await ctx.close();
}

/* 4: pose quieta. */
for (const [k, o] of [["movimientoReducido", { reducido: true }], ["gamaBaja", { gamaBaja: true }]]) {
  const { ctx, pg } = await abrir({ caso: "r:n10:conta", w: 320, h: 568, ...o });
  salida.quieta[k] = await estadoPiezas(pg);
  await ctx.close();
}

/* 5: CPU. El índice de Estratégico (las dos tablas) con y sin banda. */
const DUR = 4000;
async function cpu(banda, freno) {
  const { ctx, pg } = await abrir({ caso: "p:n10:est", banda, w: 320, h: 640, dpr: 2 });
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send("Performance.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: freno });
  const reloj = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  const a = await reloj();
  await pg.waitForTimeout(DUR);
  const d = await reloj();
  await ctx.close();
  return { hilo: Math.round((d.TaskDuration - a.TaskDuration) * 1000), estilo: Math.round((d.RecalcStyleDuration - a.RecalcStyleDuration) * 1000) };
}
const mediana = (xs) => [...xs].sort((x, y) => x - y)[Math.floor(xs.length / 2)];
for (const freno of [6, 10]) {
  const sin = []; const con = [];
  for (let k = 0; k < 3; k++) { sin.push(await cpu(false, freno)); con.push(await cpu(true, freno)); }
  const ms = (xs) => xs.map((x) => x.hilo);
  const extra = mediana(ms(con)) - mediana(ms(sin));
  salida.cpu[`x${freno}`] = { sinBanda: ms(sin), conBanda: ms(con), estiloConBanda: con.map((x) => x.estilo), extraMediana: extra, porcentaje: Math.round((extra / DUR) * 1000) / 10 };
}

console.log(JSON.stringify(salida, null, 1));
await nav.close();
await servidor.close();
