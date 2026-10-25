/*
 * T4 · medida de los slides de Aprender (#488), sobre el banco de T4.
 *
 *   npx vite --config scripts/t4/sonda-enganche/vite-sonda.config.mjs --port 5291 --strictPort
 *   node scripts/t4/slides/medir-slides.mjs [--url=http://localhost:5291/scripts/t4/harness-t4/] [--anchos=320x568,375x667] [--caso=1] [--capturas=dir]
 *
 * Recorre TODAS las pantallas de todas las piezas con «Siguiente». En un Haz
 * toca controles hasta que «Siguiente» se libera (C2: dos errores resuelven
 * una tarjeta), así que mide el estado de antes y el de después. Por
 * pantalla devuelve, en px medidos:
 *   modelo   lo que ocupa el contenido del modelo (tope 206), el peor de antes y después
 *   banda    el alto de la banda (mínimo 66)
 *   lineas   renglones del titular y de la banda visible (alto / 22)
 *   palabras titular + banda visible de antes
 *   fondo    dónde acaba «Siguiente» respecto del alto de la ventana
 *   tope     B1: dónde empieza el modelo desde el tope de la tarjeta (≤ 280 a 320)
 *   bajoNav  px de la banda bajo la navegación, en la ventana (E2; el peor momento de la pantalla)
 *   ms       en un Haz: del clic a la palabra de la devolución, primer error y acierto (A7, < 500)
 * Y una vez: la cabecera de la vista (hasta el Panel) y el bloque de navegación.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require("/opt/node-tools/node_modules/playwright"); }

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const URL_ = arg("url", "http://localhost:5291/scripts/t4/harness-t4/");
const ANCHOS = arg("anchos", "320x568,375x667").split(",").map((s) => s.split("x").map(Number));
const CASO = arg("caso", "1");
const CAPTURAS = arg("capturas", null);
/* --pieza=t4-a2-el-fondo-fijo: empieza en esa pieza (posición guardada en la pestaña) y para al acabarla. */
const PIEZA = arg("pieza", null);
/* --orden=inv: en un Haz toca primero el último control libre (para medir también el acierto donde la correcta va al final). */
const ORDEN = arg("orden", "directo");

const navegador = await pw.chromium.launch();
const salida = {};
for (const [w, h] of ANCHOS) {
  const pagina = await navegador.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  /* Se empieza limpio UNA vez por página: las recargas de --pieza tienen que conservar la posición. */
  await pagina.addInitScript((c) => {
    try {
      if (!sessionStorage.getItem("medir-slides")) { sessionStorage.clear(); sessionStorage.setItem("medir-slides", "1"); }
      localStorage.setItem("aprendefae-t4-caso", c);
    } catch {}
  }, CASO);
  await pagina.goto(URL_);
  await pagina.waitForSelector("[data-secuencia] [data-pantalla]");
  await pagina.evaluate(() => document.fonts.ready);
  if (PIEZA) {
    const p = await pagina.evaluate((id) => {
      /* La clave de ESTA página (tema/casos): con otras pestañas abiertas puede haber más de una. */
      const k = `fae-secuencia:${document.querySelector("[data-secuencia]").dataset.secuencia}`;
      const g = JSON.parse(sessionStorage.getItem(k));
      const ids = [...new Set(Object.keys(g.estados).map((x) => x.split("/")[0]))];
      g.p = ids.indexOf(id); g.s = 0;
      sessionStorage.setItem(k, JSON.stringify(g));
      return g.p;
    }, PIEZA);
    if (p < 0) throw new Error(`la pieza ${PIEZA} no está en la vista`);
    await pagina.reload();
    await pagina.waitForSelector(`[data-secuencia][data-pieza="${PIEZA}"]`);
    await pagina.evaluate(() => document.fonts.ready);
  }
  const fijo = await pagina.evaluate(() => {
    const raiz = document.querySelector("[data-secuencia]");
    const panel = raiz.parentElement;
    const nav = raiz.querySelector("[data-navegacion]").getBoundingClientRect();
    return { cabecera: Math.round(panel.getBoundingClientRect().top + window.scrollY), navegacion: Math.round(nav.height) };
  });
  const filas = [];
  for (let vuelta = 0; vuelta < 80; vuelta++) {
    const medir = () => pagina.evaluate(() => {
      const raiz = document.querySelector("[data-secuencia]");
      const pt = raiz.querySelector("[data-pantalla]");
      const modelo = pt.querySelector("[data-modelo]");
      let alto = 0;
      if (modelo) {
        const top = modelo.getBoundingClientRect().top;
        for (const el of modelo.querySelectorAll("*")) {
          const r = el.getBoundingClientRect();
          if (r.height > 0 && getComputedStyle(el).visibility !== "hidden") alto = Math.max(alto, r.bottom - top);
        }
      }
      const banda = pt.querySelector("[data-banda]");
      const viva = pt.querySelector("[data-capa-viva]");
      const tit = pt.querySelector("h2");
      const sig = raiz.querySelector("button[data-siguiente]").getBoundingClientRect();
      const texto = (tit?.textContent ?? "") + " " + (viva?.querySelector("[data-antes]")?.innerText ?? "");
      return {
        /* B1: dónde empieza la figura, desde el tope de la tarjeta (la <section> del Panel); ≤ 280 a 320. */
        tope: modelo ? Math.round(modelo.getBoundingClientRect().top - (raiz.closest("section") ?? raiz).getBoundingClientRect().top) : null,
        pieza: raiz.dataset.pieza, n: Number(pt.dataset.pantalla), tipo: pt.dataset.tipo,
        modelo: Math.round(alto), banda: banda ? Math.round(banda.getBoundingClientRect().height) : null,
        lineasTitular: tit ? Math.round(tit.getBoundingClientRect().height / 22) : 0,
        lineasBanda: viva ? Math.round(viva.getBoundingClientRect().height / 22) : 0,
        palabras: texto.trim().split(/\s+/).filter(Boolean).length,
        fondo: Math.round(sig.bottom + window.scrollY),
        espera: raiz.querySelector("button[data-siguiente]").getAttribute("data-siguiente"),
        /* Lo que hay que desplazar para ver la pantalla entera. */
        desplaza: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
        /* E2 (Shibukawa): px de la banda bajo la navegación, EN LA VENTANA tal como queda (con el ajuste de comun.jsx). */
        bajoNav: banda ? Math.max(0, Math.round(banda.getBoundingClientRect().bottom - (window.innerHeight - raiz.querySelector("[data-navegacion]").getBoundingClientRect().height))) : 0,
      };
    });
    const antes = await medir();
    if (CAPTURAS && antes.n === 1) {
      mkdirSync(CAPTURAS, { recursive: true });
      await pagina.screenshot({ path: `${CAPTURAS}/${antes.pieza}-p1-${w}.png` });
    }
    let despues = antes;
    let bajoNav = antes.bajoNav;
    /* A7 (D6): ms del clic a la palabra de la devolución ([data-palabra]) en el primer error y en el acierto. */
    const ms = { error: null, acierto: null };
    for (let k = 0; k < 24 && despues.espera === "espera"; k++) {
      const r = await pagina.evaluate((inv) => {
        const pt = document.querySelector("[data-secuencia] [data-pantalla]");
        const cs = [...pt.querySelectorAll(".t4s-ctl")].filter((b) => b.getAttribute("aria-disabled") !== "true" && !b.dataset.ver);
        const c = inv ? cs[cs.length - 1] : cs[0];
        if (!c) return null;
        const viva = pt.querySelector("[data-capa-viva]");
        const antes = viva?.innerHTML;
        const t0 = performance.now();
        c.click();
        return new Promise((fin) => {
          const mira = () => {
            const m = viva?.querySelector("[data-mensaje]");
            const p = m?.querySelector("[data-palabra]");
            if (p && viva.innerHTML !== antes && p.getBoundingClientRect().height > 0) fin({ ms: performance.now() - t0, tipo: m.dataset.mensaje });
            else if (performance.now() - t0 > 2000) fin({ ms: null, tipo: null });
            else requestAnimationFrame(mira);
          };
          requestAnimationFrame(mira);
        });
      }, ORDEN === "inv");
      const ok = Boolean(r);
      if (r?.tipo === "error" && ms.error == null) ms.error = Math.round(r.ms);
      if (r?.tipo === "acierto" && ms.acierto == null) ms.acierto = Math.round(r.ms);
      /* Un Haz de dos tarjetas: la segunda llega tarde (A1 p4, 1,4 s). Se espera una vez antes de rendirse. */
      if (!ok) { if (k > 0 && !(await pagina.evaluate(() => window.__esperoUna))) { await pagina.evaluate(() => { window.__esperoUna = true; }); await pagina.waitForTimeout(1600); continue; } break; }
      await pagina.evaluate(() => { window.__esperoUna = false; });
      await pagina.waitForTimeout(150);
      despues = await medir();
      bajoNav = Math.max(bajoNav, despues.bajoNav);
    }
    await pagina.waitForTimeout(3200);
    despues = await medir();
    bajoNav = Math.max(bajoNav, despues.bajoNav);
    filas.push({ ...antes, bajoNav, ms: antes.espera === "espera" ? ms : undefined, modelo: Math.max(antes.modelo, despues.modelo), lineasBandaDespues: despues.lineasBanda, espera: despues.espera });
    if (despues.espera === "final" || despues.espera === "espera" || (PIEZA && despues.espera === "pieza")) break;
    await pagina.click("[data-secuencia] button[data-siguiente]");
    /* La pantalla asentada: entrada (≤ 600 ms) y, al cambiar de pieza, el desplazamiento del contenedor. */
    await pagina.waitForTimeout(900);
  }
  salida[`${w}x${h}`] = { ...fijo, pantallas: filas };
  await pagina.close();
}
await navegador.close();
console.log(JSON.stringify(salida, null, 1));
