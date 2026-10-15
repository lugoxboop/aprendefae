/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO DE T4 · A0 A A3 A 375 Y 320, CON SUS FIGURAS?
 *
 *   node scripts/t4/medir-t4.mjs [carpeta-de-capturas]
 *
 * Como medir-t7-3-a1.mjs: Chromium de verdad, la vista de T4 montada tal
 * cual con la hoja de estilos del sitio (banco scripts/t4/harness-t4). Juega
 * A0, A1, A2 y A3 enteras —en cada pregunta falla con cada opción equivocada y
 * después acierta— y en cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que se hayan medido Inter y, donde hay pregunta, Sora
 *   · que cada opción y cada botón midan al menos 44 px de alto
 *   · que cada cifra (435.000), en el asiento y en la figura, quepa en su
 *     caja en UNA línea: su texto no pasa del ancho útil de su caja
 *   · que ningún renglón de las figuras se parta (cada uno, una línea)
 *   · en P4 de A0, que la raya quede a la misma altura en los cuatro estados
 *   · en A2 (el sobre y el libro): que cada fila del sobre y del libro tenga
 *     su nombre y su monto en una línea, con el monto contra el borde
 *     derecho; que el cheque tenga sus dos renglones; que en P6 y en los tres
 *     estados de P7 la figura mida lo mismo y el libro arranque a la misma
 *     altura, oculto o no (no salta al confirmar); y que en P5 la figura mida
 *     lo mismo en colocando y en el error
 *   · en A3 (el mismo sobre): que la figura mida lo mismo en colocando, en
 *     cada error y en el acierto de P3, P4 y P8, y que el sobre (P4) y el
 *     libro (P8) arranquen a la misma altura; que entre P8 y P9 el 6.700
 *     quede a la misma altura
 *   · con movimiento reducido, que nada de la pieza tenga animación ni
 *     transición en curso
 *
 * Imprime, por ancho, el ancho de la cifra y el de su celda. Sale con código
 * 1 si algo falla. Necesita Playwright (no es dependencia del repo): el de la
 * máquina, o el de PLAYWRIGHT_MODULE.
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
/* Cada pieza de T4, con la opción correcta de sus preguntas. */
const PIEZAS = [
  { sel: '[data-pieza="t4-a0-el-activo-corriente"]', nombre: "a0", correctas: { "cual-es-corriente": "mercancia" } },
  { sel: '[data-pieza="t4-a1-la-caja"]', nombre: "a1", correctas: { consignacion: "se-acredita", "control-que-falla": "separar" } },
  { sel: '[data-pieza="t4-a2-el-fondo-fijo"]', nombre: "a2", correctas: { "cuanto-queda": "lo-que-queda", "y-caja-menor": "no-se-mueve" } },
  { sel: '[data-pieza="t4-a3-el-arqueo"]', nombre: "a3", correctas: { "el-sobrante": "sobrante", "el-cheque": "menos", "camino-1": "cxc-empleados" } },
];

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t4/harness-t4/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];
const cifras = [];

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script"))
    /* El texto alternativo de las figuras solo lo oye el lector de pantalla: mide 1 px a propósito. */
    .filter((el) => !el.closest(".t4f-sr"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  for (const b of pieza.querySelectorAll("button")) {
    const h = b.getBoundingClientRect().height;
    if (h < 44) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  /* La cifra: el texto mide lo que ocupa (un Range), la celda lo que tiene; en una sola línea. */
  const medidas = [];
  for (const c of pieza.querySelectorAll("[data-asiento] [data-cifra], [data-tabla] [data-cifra], [data-figura] [data-monto]")) {
    const rango = document.createRange();
    rango.selectNodeContents(c);
    const lineas = rango.getClientRects().length;
    const texto = rango.getBoundingClientRect().width;
    /* La caja de una cifra de la figura es su contenedor (columna, destino o tarjeta); la del asiento, su celda. */
    const caja = c.matches("[data-monto]") ? c.parentElement.closest(".t4cj-col, .t4cj-caja2, .t4cj-lin, .t4sb-lin") : c;
    const estC = getComputedStyle(caja);
    const util = caja.clientWidth - parseFloat(estC.paddingLeft) - parseFloat(estC.paddingRight);
    medidas.push({ cifra: c.textContent, texto: Math.round(texto * 10) / 10, celda: Math.round(util * 10) / 10, lineas });
    if (lineas !== 1) problemas.push(`la cifra «${c.textContent}» ocupa ${lineas} líneas`);
    if (texto > util + 0.5 || c.scrollWidth > c.clientWidth + 0.5) problemas.push(`la cifra «${c.textContent}» mide ${texto.toFixed(1)} px en ${util.toFixed(1)}`);
  }
  /* Cada renglón de las figuras, en una sola línea. */
  for (const r of pieza.querySelectorAll(".t4cj-glosa > span, .t4cj-caja2-n > span, .t4cj-hecho, .t4ry-zrot > span, .t4ry-tarj > span, .t4ry-mar, .t4sb-rot, .t4sb-nom, .t4sb-cheque-n, .t4sb-cheque-s, .t4sb-cta-n, .t4sb-nota, .t4sb-monto, .t4sb-cheque-m, .t4sb-calc, .t4sb-cta2 > span:first-child, .t4sb-cta-n2")) {
    const rango = document.createRange();
    rango.selectNodeContents(r);
    const lineas = new Set([...rango.getClientRects()].map((x) => Math.round(x.top))).size;
    if (lineas > 1) problemas.push(`el renglón «${r.textContent}» de la figura ocupa ${lineas} líneas`);
    if (r.scrollWidth > r.clientWidth + 0.5 && getComputedStyle(r).display !== "inline") problemas.push(`el renglón «${r.textContent}» mide ${r.scrollWidth} px en ${r.clientWidth}`);
  }
  /* El sobre: nombre y monto en la misma línea, y el monto contra el borde derecho de su fila; el libro, dónde arranca. */
  const sobre = pieza.querySelector('[data-figura="sobre"]');
  let holgura = null;
  if (sobre) {
    for (const fila of sobre.querySelectorAll('.t4sb-lin')) {
      if (fila.closest('[data-libro="oculto"]')) continue;
      const [nom, monto] = fila.children;
      const rn = nom.getBoundingClientRect(), rm = monto.getBoundingClientRect(), rf = fila.getBoundingClientRect();
      if (Math.abs(rn.top - rm.top) > 4) problemas.push(`fila «${fila.textContent}» del sobre: el monto bajó de línea`);
      if (Math.abs(rm.right - rf.right) > 0.5) problemas.push(`fila «${fila.textContent}» del sobre: el monto no va contra el borde derecho`);
      const libre = rf.width - rn.width - rm.width - 10;
      holgura = holgura == null ? libre : Math.min(holgura, libre);
    }
    const ch = sobre.querySelector("[data-cheque]");
    if (ch && ch.children.length !== 2) problemas.push("el cheque no tiene dos renglones");
  }
  const raya = pieza.querySelector("[data-raya]");
  const animado = [...pieza.querySelectorAll("*")].filter((el) => el.getAnimations().length > 0).length;
  return {
    problemas,
    medidas,
    raya: raya ? Math.round((raya.getBoundingClientRect().top - pieza.querySelector("[data-figura]").getBoundingClientRect().top) * 100) / 100 : null,
    sobre: sobre ? {
      alto: Math.round(sobre.getBoundingClientRect().height * 100) / 100,
      libro: sobre.querySelector("[data-libro]") ? Math.round((sobre.querySelector("[data-libro]").getBoundingClientRect().top - sobre.getBoundingClientRect().top) * 100) / 100 : null,
      envoltorio: Math.round((sobre.querySelector("[data-sobre]").getBoundingClientRect().top - sobre.getBoundingClientRect().top) * 100) / 100,
      seisSetecientos: (() => { const x = sobre.querySelector('[data-cuenta="cxc-empleados"] [data-monto], [data-cuenta="gastos-faltante"] [data-monto]'); return x ? Math.round((x.getBoundingClientRect().top - sobre.getBoundingClientRect().top) * 100) / 100 : null; })(),
      holgura: holgura == null ? null : Math.round(holgura * 100) / 100,
      estado: sobre.dataset.estado,
    } : null,
    animado,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    fuentes: document.fonts.check("15px Inter") && (!pieza.querySelector("[data-pregunta]") || document.fonts.check("600 15px Sora")),
  };
}

const rayas = {};
const sobres = {};
const sobresA3 = {};

for (const reducido of [false, true]) {
for (const ancho of ANCHOS) {
for (const { sel, nombre: pz, correctas } of PIEZAS) {
  const pg = await navegador.newPage({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2, reducedMotion: reducido ? "reduce" : "no-preference" });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(sel, { timeout: 120000 });
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, sel);
    const marca = `${reducido ? "reducido · " : ""}${ancho} px · ${pz} · ${nombre}`;
    if (reducido) {
      if (m.animado) fallos.push(`${marca} · ${m.animado} elementos con animación en curso`);
      return;
    }
    filas.push({ ancho, estado: `${pz}-${nombre}`, panel: m.panel, alto: m.alto, fuentes: m.fuentes });
    for (const c of m.medidas) cifras.push({ ancho, estado: `${pz}-${nombre}`, ...c });
    for (const p of m.problemas) fallos.push(`${marca} · ${p}`);
    if (!m.fuentes) fallos.push(`${marca} · no cargaron Inter o Sora`);
    if (nombre.startsWith("cual-es-corriente")) (rayas[ancho] ??= []).push([nombre, m.raya]);
    if (m.sobre) ((pz === "a3" ? sobresA3 : sobres)[ancho] ??= []).push([nombre, m.sobre]);
    if (CAPTURAS) {
      const panel = await (await pg.$(sel)).evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `t4-${pz}-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const en = (s) => `${sel} ${s}`;
  const clic = (s) => pg.click(en(s));
  for (let vuelta = 0; vuelta < 12; vuelta++) {
    const id = await pg.getAttribute(sel, "data-pantalla");
    if (await pg.$(en("[data-eleccion]"))) {
      await estado(`${id}-colocando`);
      const malas = await pg.$$eval(en("[data-opcion]"), (bs, c) => bs.map((b) => b.dataset.opcion).filter((o) => o !== c).sort(), correctas[id]);
      for (const mala of malas) {
        await clic(`[data-opcion="${mala}"]`); await clic('[data-boton="confirmar"]');
        await estado(`${id}-error-${mala}`);
        await clic('[data-boton="probar-otra"]');
      }
      await clic(`[data-opcion="${correctas[id]}"]`); await clic('[data-boton="confirmar"]');
      await estado(`${id}-acierto`);
      await clic('[data-boton="seguir"]');
      continue;
    }
    await estado(id);
    const b = await pg.$(en("[data-boton]"));
    if (!b) break;
    await b.click();
  }
  await pg.close();
}
}
}

/* En P4 de A0 la raya no salta: la misma altura en los cuatro estados. */
for (const [ancho, lista] of Object.entries(rayas)) {
  const alturas = new Set(lista.map(([, y]) => y));
  if (lista.length !== 4) fallos.push(`${ancho} px · P4 de A0: se midieron ${lista.length} estados, no 4`);
  if (alturas.size !== 1) fallos.push(`${ancho} px · P4 de A0: la raya cambia de altura (${lista.map(([e, y]) => `${e} ${y}`).join(", ")})`);
}

/*
 * El sobre de A2: P6 y los tres estados de P7 miden lo mismo y el libro
 * arranca en el mismo sitio (Hanayama v1.2: 397,19 y 298,22); P4 y P5
 * colocando y error, también (286,81).
 */
for (const [ancho, lista] of Object.entries(sobres)) {
  const grupo = (prefijos) => lista.filter(([e]) => prefijos.some((p) => e.startsWith(p)));
  const iguales = (nombre, g, clave) => {
    const v = new Set(g.map(([, s]) => s[clave]));
    if (v.size !== 1) fallos.push(`${ancho} px · A2 ${nombre}: ${clave} cambia (${g.map(([e, s]) => `${e} ${s[clave]}`).join(", ")})`);
  };
  const reembolso = grupo(["el-reembolso", "y-caja-menor"]);
  /* P6, y P7 en colocando, en sus dos errores y en el acierto. */
  if (reembolso.length !== 5) fallos.push(`${ancho} px · A2: P6 y P7 dieron ${reembolso.length} estados, no 5`);
  iguales("P6-P7", reembolso, "alto");
  iguales("P6-P7", reembolso, "libro");
  const gastos = grupo(["los-gastos", "cuanto-queda-colocando", "cuanto-queda-error"]);
  if (gastos.length !== 4) fallos.push(`${ancho} px · A2: P4 y P5 sin acierto dieron ${gastos.length} estados, no 4`);
  iguales("P4-P5", gastos, "alto");
}

/* El sobre de A3: en P3, P4 y P8 nada salta al confirmar; entre P8 y P9 el 6.700 no se mueve. */
for (const [ancho, lista] of Object.entries(sobresA3)) {
  const grupo = (p) => lista.filter(([e]) => e.startsWith(p));
  const iguales = (nombre, g, clave, n) => {
    if (g.length !== n) fallos.push(`${ancho} px · A3 ${nombre}: ${g.length} estados, no ${n}`);
    const v = new Set(g.map(([, s]) => s[clave]));
    if (v.size !== 1) fallos.push(`${ancho} px · A3 ${nombre}: ${clave} cambia (${g.map(([e, s]) => `${e} ${s[clave]}`).join(", ")})`);
  };
  iguales("P3", grupo("el-sobrante"), "alto", 4);
  iguales("P4", grupo("el-cheque"), "alto", 4);
  iguales("P4", grupo("el-cheque"), "envoltorio", 4);
  iguales("P8", grupo("camino-1"), "alto", 4);
  iguales("P8", grupo("camino-1"), "libro", 4);
  iguales("P8-P9", [...grupo("camino-1-acierto"), ...grupo("camino-2")], "seisSetecientos", 2);
  iguales("P8-P9", [...grupo("camino-1-acierto"), ...grupo("camino-2")], "alto", 2);
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | alto pieza | fuentes");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.alto} | ${f.fuentes ? "Inter/Sora" : "RESERVA"}`);
console.log("\nancho | estado | cifra | ancho del texto | ancho útil de la celda | líneas");
for (const c of cifras) console.log(`${c.ancho} | ${c.estado} | ${c.cifra} | ${c.texto} | ${c.celda} | ${c.lineas}`);
console.log("\nP4 de A0 · altura de la raya desde el borde de la figura");
for (const [ancho, lista] of Object.entries(rayas)) console.log(`${ancho} | ${lista.map(([e, y]) => `${e.replace("cual-es-corriente-", "")} ${y}`).join(" · ")}`);
console.log("\nA2 · el sobre: estado, alto de la figura, dónde arranca el libro y holgura mínima de fila");
for (const [ancho, lista] of Object.entries(sobres)) for (const [e, s] of lista) console.log(`${ancho} | ${e} | ${s.estado} | ${s.alto} | ${s.libro} | ${s.holgura}`);
console.log("\nA3 · el sobre: estado, alto, dónde arranca el sobre, dónde arranca el libro, el 6.700 y la holgura mínima de fila");
for (const [ancho, lista] of Object.entries(sobresA3)) for (const [e, s] of lista) console.log(`${ancho} | ${e} | ${s.estado} | ${s.alto} | ${s.envoltorio} | ${s.libro} | ${s.seisSetecientos} | ${s.holgura}`);
console.log(fallos.length ? `\n${fallos.length} FALLAN:\n${fallos.join("\n")}` : `\nTodo cabe en los ${filas.length} estados, y con movimiento reducido nada se anima.`);
process.exit(fallos.length ? 1 : 0);
