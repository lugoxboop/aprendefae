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
 *   bajoNav  px de la banda que quedan bajo la navegación fija con la página arriba
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

const navegador = await pw.chromium.launch();
const salida = {};
for (const [w, h] of ANCHOS) {
  const pagina = await navegador.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await pagina.addInitScript((c) => { try { sessionStorage.clear(); localStorage.setItem("aprendefae-t4-caso", c); } catch {} }, CASO);
  await pagina.goto(URL_);
  await pagina.waitForSelector("[data-secuencia] [data-pantalla]");
  await pagina.evaluate(() => document.fonts.ready);
  if (PIEZA) {
    const p = await pagina.evaluate((id) => {
      const k = Object.keys(sessionStorage).find((x) => x.startsWith("fae-secuencia:"));
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
        /* Lo que hay que desplazar para ver la pantalla entera, y si la banda queda bajo la navegación fija con la página arriba. */
        desplaza: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
        bajoNav: banda ? Math.max(0, Math.round(banda.getBoundingClientRect().bottom + window.scrollY - (window.innerHeight - raiz.querySelector("[data-navegacion]").getBoundingClientRect().height))) : 0,
      };
    });
    const antes = await medir();
    if (CAPTURAS && antes.n === 1) {
      mkdirSync(CAPTURAS, { recursive: true });
      await pagina.screenshot({ path: `${CAPTURAS}/${antes.pieza}-p1-${w}.png`, fullPage: true });
    }
    let despues = antes;
    for (let k = 0; k < 24 && despues.espera === "espera"; k++) {
      const ok = await pagina.evaluate(() => {
        const pt = document.querySelector("[data-secuencia] [data-pantalla]");
        const c = [...pt.querySelectorAll(".t4s-ctl")].find((b) => b.getAttribute("aria-disabled") !== "true" && !b.dataset.ver);
        c?.click();
        return Boolean(c);
      });
      if (!ok) break;
      await pagina.waitForTimeout(150);
      despues = await medir();
    }
    await pagina.waitForTimeout(3200);
    despues = await medir();
    filas.push({ ...antes, modelo: Math.max(antes.modelo, despues.modelo), lineasBandaDespues: despues.lineasBanda, espera: despues.espera });
    if (despues.espera === "final" || despues.espera === "espera" || (PIEZA && despues.espera === "pieza")) break;
    await pagina.click("[data-secuencia] button[data-siguiente]");
    await pagina.waitForTimeout(450);
  }
  salida[`${w}x${h}`] = { ...fijo, pantallas: filas };
  await pagina.close();
}
await navegador.close();
console.log(JSON.stringify(salida, null, 1));
