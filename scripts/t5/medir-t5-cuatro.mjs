/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABEN LAS CUATRO ÚLTIMAS DE T5 (Act1 C4, Act2 D2, P1 y P2 capa 3 C4)?
 *
 *   node scripts/t5/medir-t5-cuatro.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T5 (banco scripts/t5/harness-t5: #a1 y #a2
 * en el modo Hacer; sin hash, Aprender con P1 y P2), a 375 y 320, CON
 * movimiento (la espera de 380 ms del patrón C4). «Así se juega» se da por
 * visto. Recorre:
 *   · Act1: una mala (consecuencia y veredicto), otra mala (consecuencia y
 *     «Iba aquí»), «Siguiente ficha» y la buena (consecuencia y veredicto);
 *   · Act2: el ejemplo resuelto (con su objetivo) y el primer asiento;
 *   · P1 capa 3: el paquete A con una mala (consecuencia, pista) y la buena;
 *     el B con una mala y la otra mala (devolución);
 *   · P2 capa 3: la venta A con una mala y la buena; la B con la buena.
 * En cada estado: sin barra horizontal ni texto fuera de su caja o de la
 * pantalla; cada botón de la pieza de 44 px de alto o más; ningún texto de la
 * pieza con letra de menos de 12 px; Inter y Sora cargadas. Sale con código 1
 * si algo falla.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const ANCHOS = [375, 320];
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes/";

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t5/harness-t5/index.html`;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const fallos = [];
const filas = [];

async function contexto(ancho) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 800 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => {
    for (const id of ["b5-t5-a1", "b5-t5-a2"]) localStorage.setItem(`fae-asi-se-juega:v1:${id}:anonimo`, "visto");
  });
  if (existsSync(resolve(FUENTES, "fuentes.css"))) {
    const css = readFileSync(resolve(FUENTES, "fuentes.css"), "utf8");
    await ctx.route("**/*", (route) => {
      const u = route.request().url();
      if (u.startsWith("http://127.0.0.1")) return route.continue();
      if (u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
      if (u.startsWith("https://fonts.gstatic.com/")) {
        try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(FUENTES, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return route.abort(); }
      }
      return route.abort();
    });
  }
  return ctx;
}

/* `sel`: lo que es la pieza (sus botones y su letra se miden); el desborde se mide en toda la página. */
function medir(sel) {
  const raiz = document.getElementById("root");
  const pieza = document.querySelector(sel);
  const problemas = [];
  if (!pieza) return { problemas: [`no está ${sel}`], fuentes: false };
  const conTexto = [...raiz.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script"))
    .filter((el) => { const e = getComputedStyle(el); return !(e.position === "absolute" && el.clientWidth <= 1); })
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > window.innerWidth + 0.5 || r.left < -0.5) problemas.push(`${nombre}: se sale de la pantalla`);
    if (pieza.contains(el) && !el.closest("[data-cejilla]") && parseFloat(getComputedStyle(el).fontSize) < 12) problemas.push(`${nombre}: letra de ${getComputedStyle(el).fontSize}`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  const toques = [...pieza.querySelectorAll("button")].map((b) => [b.textContent.trim().slice(0, 30), b.getBoundingClientRect()]).filter(([, r]) => r.width);
  for (const [t, r] of toques) if (r.height < 44) problemas.push(`el botón «${t}» mide ${r.height.toFixed(1)} px de alto`);
  const c4 = [...pieza.querySelectorAll(".t5a1c4, .t5p3c4")];
  return {
    problemas,
    botones: toques.length,
    botonMasBajo: toques.length ? Math.round(Math.min(...toques.map(([, r]) => r.height)) * 10) / 10 : null,
    c4: c4.length,
    letraC4: c4.length ? Math.min(...c4.flatMap((n) => [n, ...n.querySelectorAll("*")]).filter((el) => [...el.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim())).map((el) => parseFloat(getComputedStyle(el).fontSize))) : null,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}

async function recorrer(clave, hash, sel, jugar) {
  for (const ancho of ANCHOS) {
    const ctx = await contexto(ancho);
    const pg = await ctx.newPage();
    await pg.goto(`${BASE}${hash}`);
    await pg.waitForSelector(sel);
    let n = 0;
    const estado = async (nombre, foto = sel) => {
      await pg.evaluate(() => document.fonts.ready);
      await pg.waitForTimeout(60);
      const m = await pg.evaluate(medir, sel);
      const etiqueta = `${clave}-${ancho}-${String(++n).padStart(2, "0")}-${nombre}`;
      filas.push({ pieza: clave, ancho, estado: nombre, c4: m.c4, letraC4: m.letraC4, botones: m.botones, botonMasBajo: m.botonMasBajo, problemas: m.problemas.length });
      for (const p of m.problemas) fallos.push(`${etiqueta} · ${p}`);
      if (!m.fuentes) fallos.push(`${etiqueta} · no cargaron Inter o Sora`);
      if (CAPTURAS) {
        const el = await pg.$(foto);
        await el.scrollIntoViewIfNeeded();
        await el.screenshot({ path: resolve(CAPTURAS, `t5-${etiqueta}.png`) });
      }
    };
    await jugar(pg, estado);
    await ctx.close();
  }
}

const ESPERA = 450;
const clic = (pg, s) => pg.click(s);

/* Act1: el mazo 1 de main empieza con «Acciones de otra empresa» (renta variable) y sigue con «CDT» (fija con interés). */
await recorrer("act1", "#a1", "[data-estante]", async (pg, estado) => {
  const pieza = "[data-ficha]";
  await pg.waitForSelector(pieza);
  const marco = "[data-partida]";
  const est = (nombre) => estado(nombre, marco);
  await est("inicio");
  await clic(pg, '[data-cajon="fija/descuento"]'); await est("mala1-consecuencia");
  await pg.waitForTimeout(ESPERA); await est("mala1-veredicto");
  await clic(pg, '[data-cajon="fija/interes"]'); await est("mala2-consecuencia");
  await pg.waitForTimeout(ESPERA + 900); await est("mala2-iba-aqui");
  await clic(pg, "[data-boton-avanzar] button"); await pg.waitForTimeout(100);
  await clic(pg, '[data-cajon="fija/interes"]'); await est("buena-consecuencia");
  await pg.waitForTimeout(ESPERA + 400); await est("buena-veredicto");
});

/* Act2: el ejemplo resuelto (D2: el objetivo) y el primer asiento. */
await recorrer("act2", "#a2", "[data-cierre-t5]", async (pg, estado) => {
  await estado("ejemplo", "[data-partida]");
  const objetivo = await pg.$eval("[data-objetivo]", (n) => n.textContent);
  if (objetivo !== "Registrar la inversión de Santa Pacha: sus intereses y sus dos ventas.") fallos.push(`act2 · objetivo: «${objetivo}»`);
  await clic(pg, "[data-boton-empezar] button"); await pg.waitForTimeout(100);
  await estado("asiento1", "[data-partida]");
});

/* P1 y P2, capa 3, en la vista de Aprender. */
await recorrer("p1", "", "[data-capa3-t5]", async (pg, estado) => {
  const q = (s) => `[data-capa3-t5] ${s}`;
  await clic(pg, q('[data-hecho="a"] button[aria-expanded]')); await estado("a-abierta");
  await clic(pg, q('[data-hecho="a"] [data-opcion="no-facil"]')); await estado("a-mala-consecuencia");
  await pg.waitForTimeout(ESPERA); await estado("a-mala-pista");
  await clic(pg, q('[data-hecho="a"] [data-opcion="si"]')); await estado("a-buena-consecuencia");
  await pg.waitForTimeout(ESPERA); await estado("a-buena-veredicto");
  await clic(pg, q('[data-hecho="b"] button[aria-expanded]'));
  await clic(pg, q('[data-hecho="b"] [data-opcion="si"]')); await estado("b-mala-consecuencia");
  await pg.waitForTimeout(ESPERA); await estado("b-mala-pista");
  await clic(pg, q('[data-hecho="b"] [data-opcion="no-intencion"]')); await pg.waitForTimeout(ESPERA); await estado("b-segunda-mala-devolucion");
});
await recorrer("p2", "", "[data-capa3-t5-a2]", async (pg, estado) => {
  const q = (s) => `[data-capa3-t5-a2] ${s}`;
  await clic(pg, q('[data-hecho="venta-a"] button[aria-expanded]')); await estado("a-abierta");
  await clic(pg, q('[data-hecho="venta-a"] [data-opcion="ni-una"]')); await estado("a-mala-consecuencia");
  await pg.waitForTimeout(ESPERA); await estado("a-mala-pista");
  await clic(pg, q('[data-hecho="venta-a"] [data-opcion="ganancia"]')); await estado("a-buena-consecuencia");
  await pg.waitForTimeout(ESPERA); await estado("a-buena-veredicto");
  await clic(pg, q('[data-hecho="venta-b"] button[aria-expanded]'));
  await clic(pg, q('[data-hecho="venta-b"] [data-opcion="ganancia"]')); await estado("b-mala-consecuencia");
  await pg.waitForTimeout(ESPERA); await estado("b-mala-pista");
  await clic(pg, q('[data-hecho="venta-b"] [data-opcion="perdida"]')); await pg.waitForTimeout(ESPERA); await estado("b-buena-final");
});

await navegador.close();
await servidor.close();
console.table(filas);
if (fallos.length) { console.error(fallos.join("\n")); process.exit(1); }
console.log("T5 Act1, Act2, P1 y P2 caben a 375 y 320: sin desbordes, botones de 44 px o más, letra de 12 px o más, con Inter y Sora.");
