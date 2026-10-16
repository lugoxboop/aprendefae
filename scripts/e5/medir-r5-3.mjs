/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE r5-3 «MARZO EN COMERCIALIZADORA MATE» A 375 Y 320? (Célula E)
 *
 *   node scripts/e5/medir-r5-3.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, con la hoja de estilos del sitio (banco
 * scripts/e5/harness-r5). Juega la partida entera: los ocho asientos bien,
 * salvo el 6 (el peor caso del paquete: cuatro renglones, dos de dos
 * líneas), que se arma con un valor equivocado para ver su ERA ESTE. Mide
 * cada asiento (sin entrada desde el lote de textos) lleno y revisado, la hoja de cuentas con la marca
 * «EN EL HABER», la hoja «Datos de marzo» y el final. En cada estado:
 *
 *   · sin barra horizontal y sin textos que se salgan de su caja
 *   · Inter y Sora cargadas; cada botón de toque de 44 px de alto o más
 *   · lo que pide el paquete (§7 y delta v2 §6): «61.987.500» en el campo y
 *     en el renglón, «Retención en la fuente por pagar» en el haber, el
 *     renglón del dato de otra operación del asiento 5 (248 de 256), la hoja
 *     de 12 cuentas con scroll interno bajo su tope del 85 %, la hoja «Datos
 *     de marzo» con scroll interno, y el renglón final de cada operación
 *   · «El mes en dos cuentas» después de cada asiento: anima solo cuando entra
 *     entero en la ventana, y mientras anima sigue entero en ella (E2)
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const ANCHOS = [375, 320];
const ALTO = { 375: 667, 320: 568 };
const CONTENIDO = { 375: 343, 320: 288 };
const { ASIENTOS_MATE } = await import("../../src/data/repasoCap5MateTextos.js");

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/e5/harness-r5/index.html#r5-3`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

function medir() {
  const raiz = document.getElementById("root");
  const problemas = [];
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
  }
  for (const c of document.querySelectorAll("input")) if (c.scrollWidth > c.clientWidth + 0.5) problemas.push(`el campo «${c.value}» se desborda`);
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  /* El reinicio del Cierre compartido no es de esta célula (reportado): no se mide aquí. */
  const toques = [...document.querySelectorAll("button")].filter((b) => b.getBoundingClientRect().width && !b.closest(".fae-cz-entrar") && b.closest("[data-r5-3], [role=dialog]"));
  for (const b of toques) { const r = b.getBoundingClientRect(); if (r.height < 44) problemas.push(`el botón «${b.textContent.trim().slice(0, 24)}» mide ${r.height.toFixed(1)} px de alto`); }
  const otra = document.querySelector("[data-otra-operacion]");
  const act = document.querySelector("[data-r5-3]");
  return {
    problemas,
    actividad: act ? Math.round(act.getBoundingClientRect().width * 10) / 10 : null,
    alto: Math.round(document.documentElement.scrollHeight),
    nota: otra ? `otra operación ${Math.round(otra.firstElementChild.scrollWidth)} de ${Math.round(otra.getBoundingClientRect().width)}` : null,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}
function medirHoja(sel) {
  const h = document.querySelector(sel);
  return { alto: Math.round(h.getBoundingClientRect().height), tope: Math.round(window.innerHeight * 0.85), scroll: h.scrollHeight > h.clientHeight + 0.5 };
}

for (const ancho of ANCHOS) {
  const pg = await navegador.newPage({ viewport: { width: ancho, height: ALTO[ancho] }, deviceScaleFactor: 2 });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector("[data-r5-3]");
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (m.actividad !== null && Math.abs(m.actividad - CONTENIDO[ancho]) > 0.5) fallos.push(`${ancho} px · ${nombre} · el contenido mide ${m.actividad} y son ${CONTENIDO[ancho]}`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `r5-3-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`), fullPage: true });
  };
  const hoja = async (sel, nombre, conScroll) => {
    const h = await pg.evaluate(medirHoja, sel);
    filas.push({ ancho, estado: nombre, alto: h.alto, actividad: null, nota: `${h.alto} de ${h.tope}${h.scroll ? ", con scroll" : ""}` });
    if (h.alto > h.tope + 0.5) fallos.push(`${ancho} px · ${nombre} · mide ${h.alto} y el tope es ${h.tope}`);
    if (conScroll && !h.scroll) fallos.push(`${ancho} px · ${nombre} · no tiene scroll interno`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `r5-3-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
  };
  /*
   * «El mes en dos cuentas» (e5-mes-en-dos-cuentas, correcciones de Takamura):
   * no fuerza el desplazamiento y anima solo cuando entra entero en la ventana.
   * Se lleva a la vista como lo haría el estudiante y, mientras anima, se
   * muestrea cada 50 ms que esté entero en la ventana (E2).
   */
  const mes = async (id) => {
    /* En el error, el panel llega con «Iba aquí» (0,7 s, §4.2): se espera a que esté. */
    await pg.waitForSelector("[data-mes-en-dos-cuentas]", { state: "attached", timeout: 3000 });
    await pg.waitForTimeout(150);
    const antes = await pg.evaluate(() => {
      const p = document.querySelector("[data-mes-en-dos-cuentas]");
      const r = p.getBoundingClientRect();
      return { fase: p.dataset.fase, entero: r.top >= 0 && r.bottom <= window.innerHeight };
    });
    /* Sin desplazamiento forzado: si no está entero a la vista, espera. */
    if (!antes.entero && antes.fase !== "espera") fallos.push(`${ancho} px · ${id} · el panel del mes empezó fuera de la ventana (fase ${antes.fase})`);
    await pg.evaluate(() => document.querySelector("[data-mes-en-dos-cuentas]").scrollIntoView({ block: "center" }));
    const t0 = Date.now();
    let animando = 0;
    let fase = "";
    while (Date.now() - t0 < 2200) {
      const m = await pg.evaluate(() => {
        const p = document.querySelector("[data-mes-en-dos-cuentas]");
        const r = p.getBoundingClientRect();
        return { fase: p.dataset.fase, fuera: r.top < -0.5 || r.bottom > window.innerHeight + 0.5, alto: Math.round(r.height), arriba: Math.round(r.top) };
      });
      fase = m.fase;
      if (m.fase === "animando") {
        animando++;
        if (m.fuera) { fallos.push(`${ancho} px · ${id} · el panel del mes anima fuera de la ventana (${m.arriba} px, alto ${m.alto})`); break; }
      }
      if (m.fase === "final" && animando) break;
      await pg.waitForTimeout(50);
    }
    const alto = await pg.evaluate(() => Math.round(document.querySelector("[data-mes-en-dos-cuentas]").getBoundingClientRect().height));
    filas.push({ ancho, estado: `${id}-mes`, alto, actividad: null, nota: `${antes.entero ? "ya a la vista" : "fuera de la vista"}, ${antes.fase}; ${animando} muestras animando; termina en ${fase}` });
    if (!animando) fallos.push(`${ancho} px · ${id} · el panel del mes no animó al entrar en la ventana (fase ${fase})`);
    if (fase !== "final") fallos.push(`${ancho} px · ${id} · el panel del mes no terminó (fase ${fase})`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `r5-3-${ancho}-${String(++n).padStart(2, "0")}-${id}-mes.png`) });
  };
  /* Lote de textos (Miyata): r5-3 no tiene entrada; abre en el asiento 1. */
  for (const [k, a] of ASIENTOS_MATE.entries()) {
    await estado(`${a.id}-vacio`);
    if (k === 0) {
      await pg.click("[data-boton-datos]");
      await hoja("[data-hoja-datos]", "hoja-datos", true);
      await pg.click("[data-hoja-datos] [data-cerrar]");
    }
    const renglones = a.correctos[0].map((c) => ({ ...c }));
    if (a.id === "a6") renglones[3] = { ...renglones[3], valor: 14848000 };
    for (const [j, c] of renglones.entries()) {
      await pg.click(`[data-anadir="${c.lado}"]`);
      if (a.id === "a1" && j === 3) await hoja("[data-hoja-renglon]", "hoja-cuentas-con-marca", true);
      await pg.click(`[data-hoja-renglon] [data-cuenta="${c.cuenta}"]`);
      await pg.fill("[data-hoja-renglon] input", String(c.valor));
      await pg.click("[data-hoja-renglon] [data-listo]");
    }
    await estado(`${a.id}-lleno`);
    await pg.click("[data-revisar]");
    /* El panel, antes de la captura de página entera: esa captura agranda la ventana y lo haría «entrar». */
    await mes(a.id);
    await estado(`${a.id}-revisado`);
    await pg.click("[data-siguiente]");
  }
  await pg.waitForSelector("[data-cierre]");
  await estado("final");
  await pg.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | contenido | alto | nota");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.actividad ?? "—"} | ${f.alto} | ${f.nota ?? "—"}`);
const estados = filas.filter((f) => !f.estado.startsWith("hoja") && !f.estado.endsWith("-mes")).length / ANCHOS.length;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos, más las hojas).`);
if (estados !== 25) fallos.push(`se recorrieron ${estados} estados y son 25`); // sin entrada (lote de textos)
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: r5-3 cabe a 375 y a 320 px.");
