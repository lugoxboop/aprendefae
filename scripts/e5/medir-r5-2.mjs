/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE r5-2 «EL TORO NEGRO» A 375 Y 320? (Célula E)
 *
 *   node scripts/e5/medir-r5-2.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, con la hoja de estilos del sitio (banco
 * scripts/e5/harness-r5) y prefers-reduced-motion, para medir los cortes en
 * su estado final. Juega la partida entera con un camino de cada clase:
 * a0 con la coma (el total de 9 dígitos, 228.340.000, y filas llenas y
 * vacías), P1 bien, P2 con las dos cuentas mal, P3 con el valor mal, P4 con
 * 0, P5 al revés y P6 bien. Mide cada estado y la hoja de cuentas abierta:
 *
 *   · que la página no tenga barra horizontal y ningún texto se salga
 *   · que se hayan medido Inter y Sora
 *   · que cada botón de toque mida al menos 44 px de alto
 *   · lo que pide el paquete (§7 y decisión 4): «Castigo Cía. Negra» en su
 *     columna, «SALDO CRÉDITO», «CRÉDITO» en el selector, la hoja de cuentas
 *     sin scroll interno y por debajo del 70 %, y la fila de 31 DIC de la
 *     pantalla final (si no cabe, cede el medidor, nunca el texto)
 *   · lo que pide el delta a0 (§5): la fila de 112 + 8 + 136 a 320, el
 *     campo con 9 dígitos, «Era 2.283.400» y las marcas de la cabecera
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

const T = await import("../../src/data/repasoCap5ToroNegroTextos.js");
const { PREGUNTAS_R5_2: P, GASTO, PROVISION, CLIENTES, CAJA, INGRESOS } = T;

/* Las respuestas que se juegan: una de cada camino. */
const JUGADA = {
  a0: { filas: { "1-30": "2499000", "31-60": "204000" }, valor: "228340000" },
  p1: { debe: GASTO, haber: PROVISION, valor: "2283400" },
  p2: { debe: CAJA, haber: INGRESOS, valor: "950000" },
  p3: { debe: PROVISION, haber: CLIENTES, valor: "1333400" },
  p4: { valor: "0" },
  p5: { debe: PROVISION, haber: CLIENTES, valor: "950000" },
  p6: { debe: CAJA, haber: CLIENTES, valor: "950000" },
};

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/e5/harness-r5/index.html#r5-2`;
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
  /* Los campos de valor: su texto no se sale. */
  for (const c of document.querySelectorAll("[data-campo-valor]")) if (c.scrollWidth > c.clientWidth + 0.5) problemas.push(`el campo «${c.value}» se desborda`);
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  /* El botón de reinicio del Cierre compartido no es de esta célula: no se mide aquí (reportado). */
  const toques = [...document.querySelectorAll("[data-r5-2] button")].filter((b) => !b.closest(".fae-cz-entrar")).filter((b) => b.getBoundingClientRect().width).map((b) => [b.textContent.trim().slice(0, 24), b.getBoundingClientRect()]);
  for (const [t, r] of toques) if (r.height < 44) problemas.push(`el botón «${t}» mide ${r.height.toFixed(1)} px de alto`);

  /* La columna de un movimiento: el concepto no se sale de su columna útil. */
  for (const m of document.querySelectorAll("[data-movimiento]")) {
    const col = m.closest("[data-columna]").getBoundingClientRect();
    const c = m.firstElementChild.getBoundingClientRect();
    if (c.right > col.right - 8 + 0.5) problemas.push(`el concepto «${m.firstElementChild.textContent}» se sale de su columna`);
  }
  const negra = [...document.querySelectorAll("[data-movimiento='castigo-negra'] span")][0];
  /* a0: cada fila y el total, con su campo de 136 px a la derecha; la columna izquierda no se sale. */
  let a0 = null;
  const filasA0 = [...document.querySelectorAll("[data-fila-grupo], [data-fila-total]")];
  if (filasA0.length) {
    const izq = [];
    for (const f of filasA0) {
      const campoA0 = f.querySelector("input").getBoundingClientRect();
      const fila = f.getBoundingClientRect();
      if (Math.abs(campoA0.width - 136) > 0.5) problemas.push(`un campo de a0 mide ${campoA0.width} y son 136`);
      if (campoA0.right > fila.right + 0.5) problemas.push("un campo de a0 se sale de su fila");
      const col = f.firstElementChild.getBoundingClientRect();
      izq.push(Math.round(col.width));
    }
    a0 = `columna izq. ${Math.min(...izq)} px + 8 + 136`;
  }
  const final31 = document.querySelector("[data-fila-etapa='dic']");
  let fila31 = null;
  if (final31) {
    const rot = final31.querySelector("[data-rotulo-saldo]").getBoundingClientRect();
    const med = final31.querySelector("[data-medidor]").getBoundingClientRect();
    const caja = final31.getBoundingClientRect();
    fila31 = `rótulo ${Math.round(rot.width)} + medidor ${Math.round(med.width)} en ${Math.round(caja.width - 32)}`;
    if (med.right > caja.right - 16 + 0.5) problemas.push("el medidor de 31 DIC se sale de su fila");
  }
  const act = document.querySelector("[data-r5-2]");
  return {
    problemas,
    actividad: act ? Math.round(act.getBoundingClientRect().width * 10) / 10 : null,
    alto: Math.round(document.documentElement.scrollHeight),
    negra: negra ? `${Math.round(negra.getBoundingClientRect().height)} px de alto` : null,
    fila31: fila31 ?? a0,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}

function medirHoja() {
  const h = document.querySelector("[data-hoja]");
  const r = h.getBoundingClientRect();
  return { alto: Math.round(r.height), tope: Math.round(window.innerHeight * 0.7), scrollInterno: h.scrollHeight > h.clientHeight + 0.5 };
}

for (const ancho of ANCHOS) {
  const pg = await navegador.newPage({ viewport: { width: ancho, height: ALTO[ancho] }, deviceScaleFactor: 2 });
  /* D8: con R5_VERSION=B se mide la versión B (el intento 2). */
  if (process.env.R5_VERSION === "B") await pg.addInitScript(() => { for (const n of [1, 2, 3, 4, 5]) localStorage.setItem(`fae:r5:intentos:r5-${n}`, "1"); });
  await pg.emulateMedia({ reducedMotion: "reduce" });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector("[data-r5-2]");
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (m.actividad !== null && Math.abs(m.actividad - CONTENIDO[ancho]) > 0.5) fallos.push(`${ancho} px · ${nombre} · el contenido mide ${m.actividad} y son ${CONTENIDO[ancho]}`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `r5-2-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`), fullPage: true });
  };
  const elegir = async (lado, cuenta, medirLaHoja = false) => {
    await pg.click(`[data-hueco="${lado}"]`);
    await pg.waitForSelector("[data-hoja]");
    if (medirLaHoja) {
      const h = await pg.evaluate(medirHoja);
      filas.push({ ancho, estado: `hoja ${lado}`, alto: h.alto, actividad: null, negra: null, fila31: `hoja ${h.alto} de ${h.tope}` });
      if (h.alto > h.tope) fallos.push(`${ancho} px · la hoja mide ${h.alto} y el tope es ${h.tope}`);
      if (h.scrollInterno) fallos.push(`${ancho} px · la hoja tiene scroll interno`);
      if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `r5-2-${ancho}-${String(++n).padStart(2, "0")}-hoja.png`) });
    }
    await pg.click(`[data-hoja] [data-cuenta="${cuenta}"]`);
  };

  await estado("entrada");
  await pg.click("[data-siguiente]");
  for (const p of P) {
    await estado(`${p.id}-antes`);
    const j = JUGADA[p.id];
    if (p.tipo === "calculo") {
      for (const [id, v] of Object.entries(j.filas)) await pg.fill(`[data-fila-grupo="${id}"] input`, v);
      await pg.fill("[data-fila-total] input", j.valor);
      const visto = await pg.inputValue("[data-fila-total] input");
      if (visto !== "228.340.000") fallos.push(`${ancho} px · a0 · el total dice «${visto}» y son 9 dígitos`);
      await estado(`${p.id}-lleno`);
      await pg.click("[data-revisar]");
      await estado(`${p.id}-revisado`);
      await pg.click("[data-siguiente]");
      continue;
    }
    if (p.tipo === "asiento") {
      await elegir("debe", j.debe, p.id === "p1");
      await elegir("haber", j.haber);
    } else if (j.lado) await pg.click(`[data-tarjeta-saldo="respuesta"] [data-lado="${j.lado}"]`);
    await pg.fill("[data-r5-2] input[data-campo-valor='libre']", j.valor);
    await estado(`${p.id}-lleno`);
    await pg.click("[data-revisar]");
    await estado(`${p.id}-revisado`);
    await pg.click("[data-siguiente]");
    if (["p1", "p4", "p6"].includes(p.id)) {
      await pg.waitForSelector("[data-corte]");
      await estado(`corte-${p.etapa}`);
      await pg.click("[data-siguiente]");
    }
  }
  await pg.waitForSelector("[data-cierre]");
  await estado("final");
  await pg.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | contenido | alto | «Castigo Cía. Negra» | fila 31 DIC / hoja");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.actividad ?? "—"} | ${f.alto} | ${f.negra ?? "—"} | ${f.fila31 ?? "—"}`);
const estados = filas.filter((f) => !f.estado.startsWith("hoja")).length / ANCHOS.length;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos, más la hoja).`);
if (estados !== 26) fallos.push(`se recorrieron ${estados} estados y son 26`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: r5-2 cabe a 375 y a 320 px.");
