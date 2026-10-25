/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 FRENTE A UN CAMBIO DE SecuenciaAprender (los PR de Erwin #564, #575, #590).
 *
 *   node scripts/t4/slides/compat-secuencia.mjs --url=http://localhost:5303/scripts/t4/harness-t4/ [--caso=1]
 *
 * Recorre las 36 pantallas de A0-A5 a 320×568, 320×667 y 375×667. En cada
 * pantalla mide «antes» de responder y, en cada Haz, dos caminos desde el
 * mismo punto (se restaura lo guardado en la pestaña entre uno y otro):
 *   acierto   toca las correctas (las que la figura marca con Check tras resolver)
 *   c2        toca las incorrectas hasta resolver cada tarjeta por dos errores
 * En cada estado:
 *   click     si page.click llega a «Siguiente» (prueba de Playwright con
 *             trial: visible, estable y que el clic le llega a él), o expira
 *   palabras  cuántos veredictos («Correcto» / «No va aquí») se VEN a la vez
 *   pisa      px que se montan: la figura sobre la razón, la banda bajo la
 *             navegación (en la ventana) y el modelo de la figura sobre su banda
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require("/opt/node-tools/node_modules/playwright"); }

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=").slice(1).join("=") ?? d;
const URL_ = arg("url", "http://localhost:5291/scripts/t4/harness-t4/");
const CASO = arg("caso", "1");
const TAMANOS = arg("tamanos", "320x568,320x667,375x667").split(",").map((s) => s.split("x").map(Number));

const medir = (pg) => pg.evaluate(() => {
  const raiz = document.querySelector("[data-secuencia]");
  const pt = raiz.querySelector("[data-pantalla]");
  const r = (el) => el?.getBoundingClientRect() ?? null;
  const visible = (el) => el.checkVisibility?.({ visibilityProperty: true, opacityProperty: true }) ?? true;
  const palabras = [...raiz.querySelectorAll("span, b, p")].filter((el) => {
    const propio = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
    return (propio === "Correcto" || propio === "No va aquí" || propio === "Correcto." ) && visible(el) && r(el).height > 0;
  }).length;
  const fig = r(pt.querySelector(".fae-sec-figura"));
  const razon = r(raiz.querySelector("[data-razon]"));
  const nav = r(raiz.querySelector("[data-navegacion]"));
  const banda = r(pt.querySelector("[data-banda]"));
  const modelo = pt.querySelector("[data-modelo]");
  let fondoModelo = 0;
  if (modelo) for (const el of modelo.querySelectorAll("*")) { const b = el.getBoundingClientRect(); if (b.height > 0 && getComputedStyle(el).visibility !== "hidden") fondoModelo = Math.max(fondoModelo, b.bottom); }
  const pisa = (a, b) => (a && b ? Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) : 0);
  return {
    pieza: raiz.dataset.pieza.slice(3, 5), n: Number(pt.dataset.pantalla), tipo: pt.dataset.tipo,
    espera: raiz.querySelector("button[data-siguiente]").getAttribute("data-siguiente"),
    palabras,
    figuraSobreRazon: Math.round(Math.max(0, fig && razon ? fig.bottom - razon.top : 0)),
    bandaBajoNav: Math.round(pisa(banda, { top: nav.top, bottom: Math.min(nav.bottom, innerHeight) })),
    modeloSobreBanda: Math.round(Math.max(0, banda && modelo ? fondoModelo - banda.top : 0)),
    devCascara: raiz.querySelectorAll("[data-devolucion], [data-mensaje-zona]").length,
  };
});

async function llega(pg) {
  try { await pg.locator("[data-secuencia] button[data-siguiente]").click({ trial: true, timeout: 2500 }); return true; } catch { return false; }
}

async function estado(pg, etiqueta) {
  const m = await medir(pg);
  return { ...m, estado: etiqueta, click: await llega(pg) };
}

/* Toca, entre los controles libres, el primero que cumple `quiero`; si la tarjeta siguiente llega tarde, espera una vez. */
async function tocarHasta(pg, quiero) {
  for (let k = 0, esperado = false; k < 30; k++) {
    if ((await medir(pg)).espera !== "espera") return true;
    const ok = await pg.evaluate((q) => {
      const pt = document.querySelector("[data-secuencia] [data-pantalla]");
      const cs = [...pt.querySelectorAll(".t4s-ctl")].map((c, i) => ({ c, i })).filter(({ c }) => c.getAttribute("aria-disabled") !== "true");
      const elegido = cs.find(({ c, i }) => (q.correctas ? q.lista.includes(i) && !c.dataset.ver : !q.lista.includes(i) && c.dataset.ver !== "bien"));
      elegido?.c.click();
      return Boolean(elegido);
    }, quiero);
    if (!ok) { if (esperado) return false; esperado = true; await pg.waitForTimeout(1700); continue; }
    esperado = false;
    await pg.waitForTimeout(160);
  }
  return (await medir(pg)).espera !== "espera";
}

const clave = (pg) => pg.evaluate(() => `fae-secuencia:${document.querySelector("[data-secuencia]").dataset.secuencia}`);
const guardado = async (pg) => pg.evaluate((k) => sessionStorage.getItem(k), await clave(pg));
async function restaurar(pg, g) {
  await pg.evaluate(([k, v]) => sessionStorage.setItem(k, v), [await clave(pg), g]);
  await pg.reload();
  await pg.waitForSelector("[data-secuencia] [data-pantalla]");
  await pg.waitForTimeout(900);
}

const navegador = await pw.chromium.launch();
const salida = {};
for (const [w, h] of TAMANOS) {
  const pg = await navegador.newPage({ viewport: { width: w, height: h } });
  await pg.addInitScript((c) => { try { if (!sessionStorage.getItem("compat")) { sessionStorage.clear(); sessionStorage.setItem("compat", "1"); } localStorage.setItem("aprendefae-t4-caso", c); } catch {} }, CASO);
  await pg.goto(URL_);
  await pg.waitForSelector("[data-secuencia] [data-pantalla]");
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(900);
  const filas = [];
  for (let vuelta = 0; vuelta < 60; vuelta++) {
    filas.push(await estado(pg, "antes"));
    const m0 = await medir(pg);
    if (m0.espera === "espera") {
      const g0 = await guardado(pg);
      /* Aprender cuáles son las correctas: resolver de cualquier modo y leer los Check. */
      await tocarHasta(pg, { correctas: false, lista: [] });
      await pg.waitForTimeout(400);
      const correctas = await pg.evaluate(() => [...document.querySelectorAll("[data-secuencia] [data-pantalla] .t4s-ctl")].map((c, i) => (c.dataset.ver === "bien" ? i : -1)).filter((i) => i >= 0));
      await restaurar(pg, g0);
      await tocarHasta(pg, { correctas: true, lista: correctas });
      await pg.waitForTimeout(500);
      filas.push(await estado(pg, "acierto"));
      await restaurar(pg, g0);
      await tocarHasta(pg, { correctas: false, lista: correctas });
      await pg.waitForTimeout(500);
      filas.push(await estado(pg, "c2"));
    }
    const fin = await medir(pg);
    if (fin.espera === "final" || fin.espera === "espera") break;
    await pg.locator("[data-secuencia] button[data-siguiente]").click({ timeout: 4000 }).catch(() => pg.evaluate(() => document.querySelector("[data-secuencia] button[data-siguiente]").click()));
    await pg.waitForTimeout(900);
  }
  salida[`${w}x${h}`] = filas;
  await pg.close();
}
await navegador.close();
console.log(JSON.stringify(salida));
