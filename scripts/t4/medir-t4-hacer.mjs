/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABEN LOS HACER DE T4 A 375 Y 320, Y NO DELATAN NADA?
 *
 *   node scripts/t4/medir-t4-hacer.mjs h1|h2|h3|h4|h5|h6 [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T4 en modo Hacer con ese juego abierto
 * (banco scripts/t4/harness-t4, #h1 a #h6). Salta el «Así se juega» y
 * juega todas las tarjetas: en cada una, antes de tocar, mira el DOM; después
 * toca la primera opción (acierta en unas y falla en otras) y mide. En H3 no
 * hay opciones: arma el asiento con el constructor —las dos primeras cuentas
 * de la paleta, la primera al debe y la segunda al haber—, mide armado (aún
 * sin comprobar, y ahí también mira el DOM) y comprueba. Comprueba:
 *
 *   · que la página no tenga barra horizontal y ningún texto se salga
 *   · que cada destino y cada botón midan al menos 44 px de alto
 *   · H1: que ningún destino se parta en dos líneas (son rótulos). En H2 las
 *     opciones son frases y se parten por espacios (Hanayama H2 v1 §2)
 *   · H3: que las pastillas de las cuentas y los botones Debe/Haber midan al
 *     menos 36 px (son los del constructor compartido, Tema 2) y que el
 *     asiento completo quepa sin partir la cifra. La ✕ de cada fila mide
 *     26 px: es del constructor compartido, no se mide aquí y se reporta
 *   · H4: cada ronda tiene dos o tres preguntas; se miden todas. Además, que
 *     el sobre mida lo mismo y la tarjeta de la pregunta arranque a la misma
 *     altura en todas las preguntas de una ronda, antes y después de
 *     responder (Hanayama H4 v1 §2: nada salta)
 *   · H5: arma el asiento correcto con cifras (tres filas) y confirma. Mide
 *     armado y confirmado. Además, que cada nombre de cuenta con raya, en la
 *     paleta y en la fila, ocupe una línea o se parta justo después de «–»
 *     (Hanayama H5 v1 §2)
 *   · H6: cada destino va en dos renglones fijos («Todavía no lo tiene» /
 *     «el banco»): que cada renglón ocupe UNA línea y que los dos queden en
 *     dos alturas distintas (Hanayama H6 v1 §1). Ninguna cifra en la zona
 *   · PH8-2: antes de tocar, el DOM no trae ni la devolución ni la página
 *   · con movimiento reducido, nada de la actividad tiene animación en curso
 *
 * Sale con código 1 si algo falla. Necesita Playwright.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CUAL = process.argv[2];
const JUEGOS = {
  h1: { raiz: "[data-t4-h1]", tarjeta: "[data-tarjeta-hecho]", siguiente: "Siguiente hecho", rotulos: true, total: 8 },
  h2: { raiz: "[data-t4-h2]", tarjeta: "[data-tarjeta-caso]", siguiente: "Siguiente caso", rotulos: false, total: 7 },
  h3: { raiz: "[data-t4-h3]", tarjeta: "[data-tarjeta-operacion]", siguiente: "Siguiente operación", rotulos: false, total: 4, armar: true },
  /* H4: 3 rondas de 2 o 3 preguntas; el bucle sigue mientras haya pregunta. */
  h4: { raiz: "[data-t4-h4]", tarjeta: "[data-tarjeta-pregunta]", siguiente: "Siguiente pregunta", otros: ["Siguiente ronda"], rotulos: false, total: 8, rondas: true },
  h5: { raiz: "[data-t4-h5]", tarjeta: "[data-tarjeta-caso]", siguiente: "Siguiente caso", rotulos: false, total: 2, conCifras: true },
  h6: { raiz: "[data-t4-h6]", tarjeta: "[data-tarjeta-partida]", siguiente: "Siguiente partida", rotulos: false, renglones: true, total: 8 },
};
const J = JUEGOS[CUAL];
if (!J) { console.error("uso: node scripts/t4/medir-t4-hacer.mjs h1|h2|h3|h4|h5|h6 [carpeta]"); process.exit(2); }
const CAPTURAS = process.argv[3] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const ANCHOS = [375, 320];
const H1 = J.raiz;

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t4/harness-t4/index.html#${CUAL}`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];
const h4 = {};

function medir({ antes, raiz, rotulos, renglones, siguiente, otros = [] }) {
  const zona = document.querySelector(raiz);
  const marco = zona.closest("section") ?? zona.parentElement;
  const caja = marco.getBoundingClientRect();
  const problemas = [];
  for (const el of [...marco.querySelectorAll("*")].filter((e) => !e.matches("style, script") && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    /* Lo que solo oye el lector de pantalla mide 1 px a propósito: el SOLO_LECTOR compartido y el texto alternativo de las figuras (.t4f-sr). */
    if (el.closest('[style*="clip: rect"], .t4f-sr')) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del marco`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  const botones = [...marco.querySelectorAll("[data-opcion] button"), ...[...document.querySelectorAll("button")].filter((b) => b.textContent === siguiente || otros.includes(b.textContent) || b.textContent === "Ver mi resumen")];
  for (const b of botones) {
    const h = b.getBoundingClientRect().height;
    if (h < 44) problemas.push(`«${b.textContent.trim().slice(0, 30)}» mide ${h.toFixed(1)} px de alto`);
  }
  if (antes) {
    /* El rótulo del destino: su nodo de texto, no el botón entero (el marcador va a otra altura). */
    for (const b of rotulos ? marco.querySelectorAll("[data-opcion] button") : []) {
      const texto = [...b.querySelectorAll("*"), b].flatMap((e) => [...e.childNodes]).find((n) => n.nodeType === 3 && n.textContent.trim());
      const rango = document.createRange(); rango.selectNodeContents(texto);
      const lineas = new Set([...rango.getClientRects()].filter((x) => x.width > 1).map((x) => Math.round(x.top))).size;
      if (lineas !== 1) problemas.push(`el destino «${b.textContent.trim()}» ocupa ${lineas} líneas`);
    }
    /* H6: cada renglón fijo del destino, en una sola línea, y los dos a alturas distintas. */
    for (const d of renglones ? marco.querySelectorAll("[data-opcion] [data-destino-renglones]") : []) {
      const tops = [...d.children].map((r) => {
        const rango = document.createRange(); rango.selectNodeContents(r);
        const ls = [...new Set([...rango.getClientRects()].filter((x) => x.width > 1).map((x) => Math.round(x.top)))];
        if (ls.length !== 1) problemas.push(`el renglón «${r.textContent}» del destino ocupa ${ls.length} líneas`);
        return ls[0];
      });
      if (tops.length !== 2 || tops[0] === tops[1]) problemas.push(`el destino «${d.textContent}» no va en dos renglones`);
    }
    if (renglones && /\$|\d{1,3}\.\d{3}/.test(zona.textContent)) problemas.push("hay una cifra en la zona del juego");
    /* PH8-2: con textContent y outerHTML, que ven también lo escondido por CSS. */
    const dom = zona.textContent + zona.outerHTML;
    if (zona.querySelector("[data-panel], [data-pagina], [data-texto-retro]")) problemas.push("antes de responder ya hay devolución en el DOM");
    if (/Basado en el libro|Correcto\.|Incorrecto\.|Así es\.|EL ASIENTO COMPLETO/.test(dom)) problemas.push("antes de responder el DOM trae una página, una devolución o el asiento completo");
    if (zona.querySelector("[data-asiento-completo], [data-asiento]")) problemas.push("antes de responder ya hay un asiento completo en el DOM");
  }
  /* H3: lo que se toca del constructor compartido, y la cifra del asiento completo en una línea. */
  /*
   * La ✕ de cada fila (26 px) es del constructor compartido y no se toca
   * aquí: se cuenta aparte y va en el informe para el coordinador.
   */
  for (const b of zona.querySelectorAll("[data-constructor] button")) {
    if (b.textContent.trim() === "✕") continue;
    const h = b.getBoundingClientRect().height;
    if (h && h < 36) problemas.push(`«${b.textContent.trim()}» del constructor mide ${h.toFixed(1)} px de alto`);
  }
  for (const c of zona.querySelectorAll("[data-asiento-completo] [data-asiento] > div > span:last-child")) {
    const rango = document.createRange(); rango.selectNodeContents(c);
    if (new Set([...rango.getClientRects()].map((x) => Math.round(x.top))).size > 1) problemas.push(`la cifra «${c.textContent}» del asiento completo se parte`);
  }
  const animado = [...zona.querySelectorAll("*")].filter((el) => el.getAnimations().some((a) => a.playState === "running")).length;
  /* H5: un nombre con raya, en una línea o partido justo después de «–». */
  for (const b of zona.querySelectorAll("[data-constructor] button, [data-fila-asiento] > div:first-child > span")) {
    const t = b.textContent;
    if (!t.includes("–")) continue;
    const nodo = [...b.childNodes].find((n) => n.nodeType === 3);
    if (!nodo) continue;
    const r = document.createRange(); r.selectNodeContents(nodo);
    const tops = [...new Set([...r.getClientRects()].filter((x) => x.width > 1).map((x) => Math.round(x.top)))];
    if (tops.length > 2) problemas.push(`«${t}» ocupa ${tops.length} líneas`);
    if (tops.length === 2) {
      /* El primer renglón tiene que terminar en la raya. */
      const i = t.indexOf("–");
      const r1 = document.createRange(); r1.setStart(nodo, i); r1.setEnd(nodo, i + 1);
      const r2 = document.createRange(); r2.setStart(nodo, i + 2); r2.setEnd(nodo, i + 3);
      if (Math.round(r1.getBoundingClientRect().top) !== tops[0] || Math.round(r2.getBoundingClientRect().top) !== tops[1]) problemas.push(`«${t}» se parte fuera de la raya`);
    }
  }
  /* H4: el sobre y dónde arranca la pregunta, desde el tope de la zona. */
  const sobre = zona.querySelector("[data-sobre-h4] [data-figura]");
  const preg = zona.querySelector("[data-tarjeta-pregunta]");
  const top = zona.getBoundingClientRect().top;
  const h4 = sobre && preg ? { sobre: Math.round(sobre.getBoundingClientRect().height * 100) / 100, pregunta: Math.round((preg.getBoundingClientRect().top - top) * 100) / 100, ronda: zona.querySelector("[data-enunciado]")?.dataset.enunciado } : null;
  return { problemas, ancho: Math.round(caja.width * 10) / 10, alto: Math.round(zona.getBoundingClientRect().height), animado, h4 };
}

for (const reducido of [false, true]) {
  for (const ancho of ANCHOS) {
    const pg = await navegador.newPage({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2, reducedMotion: reducido ? "reduce" : "no-preference" });
    await pg.goto(URL_BANCO);
    /* El «Así se juega» sale la primera vez: «Siguiente» lo cierra. */
    const asj = await pg.waitForSelector(`[data-asj-control], ${J.raiz}`, { timeout: 120000 });
    const saltar = await pg.$$("button");
    for (const b of saltar) if ((await b.textContent())?.trim() === "Siguiente") { await b.click(); break; }
    await pg.waitForSelector(H1);
    let n = 0;
    const estado = async (nombre, antes) => {
      await pg.evaluate(() => document.fonts.ready);
      if (reducido) await pg.waitForTimeout(50);
      const m = await pg.evaluate(medir, { antes, raiz: J.raiz, rotulos: J.rotulos, renglones: J.renglones ?? false, siguiente: J.siguiente, otros: J.otros ?? [] });
      if (m.h4 && !reducido) ((h4[ancho] ??= {})[m.h4.ronda] ??= []).push([nombre, m.h4]);
      const marca = `${reducido ? "reducido · " : ""}${ancho} px · ${nombre}`;
      if (reducido) { if (m.animado) fallos.push(`${marca} · ${m.animado} animaciones en curso`); return; }
      filas.push({ ancho, estado: nombre, marco: m.ancho, alto: m.alto });
      for (const p of m.problemas) fallos.push(`${marca} · ${p}`);
      if (CAPTURAS) await (await pg.$(H1)).evaluateHandle((x) => x.closest("section") ?? x.parentElement).then((m) => m.asElement().screenshot({ path: resolve(CAPTURAS, `t4-${CUAL}-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) }));
    };
    for (let k = 0; k < J.total; k++) {
      if (J.rondas && await pg.$("[data-resumen]")) break;
      const id = `${J.rondas ? `${await pg.getAttribute("[data-enunciado]", "data-enunciado")}-` : ""}${await pg.getAttribute(J.tarjeta, J.tarjeta.slice(1, -1))}`;
      await estado(`${id}-colocando`, true);
      if (J.conCifras) {
        /* El asiento correcto del caso, tomado de la tarjeta: se arma desde la paleta, fila por fila. */
        const asiento = await pg.evaluate(async (id) => (await import("/src/data/contabilidadT4H5.js")).CASOS_H5.find((c) => c.id === id).asiento, id);
        for (const [k, l] of asiento.entries()) {
          await pg.locator(`${J.raiz} [data-constructor] button`, { hasText: new RegExp(`^${l.cuenta.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) }).first().click();
          await pg.click(`${J.raiz} [data-fila-asiento="${k}"] > div:nth-child(2) > button >> nth=${l.lado === "debe" ? 0 : 1}`);
          await pg.fill(`${J.raiz} [data-fila-asiento="${k}"] input`, String(l.valor));
        }
        await estado(`${id}-armado`, true);
        for (const b of await pg.$$("button")) { if ((await b.textContent())?.trim() === "Confirmar el asiento") { await b.click(); break; } }
      } else if (J.armar) {
        /* Las dos primeras cuentas, la primera al debe y la segunda al haber: acierta en unas y falla en otras. */
        const cuentas = `${J.raiz} [data-constructor] > div > div:last-child > button`;
        await pg.click(`${cuentas} >> nth=0`);
        await pg.click(`${J.raiz} [data-fila-asiento="0"] > div:last-child > button >> nth=0`);
        await pg.click(`${cuentas} >> nth=1`);
        await pg.click(`${J.raiz} [data-fila-asiento="1"] > div:last-child > button >> nth=1`);
        await estado(`${id}-armado`, true);
        for (const b of await pg.$$("button")) { if ((await b.textContent())?.trim() === "Comprobar") { await b.click(); break; } }
      } else {
        /* Siempre la primera opción: acierta en unas y falla en otras, así se miden los dos paneles. */
        await pg.click(`${J.raiz} [data-opcion] button`);
      }
      const panel = await pg.getAttribute("[data-panel]", "data-panel");
      await estado(`${id}-${panel}`, false);
      for (const b of await pg.$$("button")) { const t = (await b.textContent())?.trim(); if (t === J.siguiente || (J.otros ?? []).includes(t) || t === "Ver mi resumen") { await b.click(); break; } }
    }
    await pg.waitForSelector("[data-resumen]");
    await pg.close();
  }
}

/* H4: dentro de cada ronda, el sobre mide lo mismo y la pregunta arranca en el mismo sitio en todos los estados. */
for (const [ancho, rondas] of Object.entries(h4)) for (const [ronda, lista] of Object.entries(rondas)) {
  for (const clave of ["sobre", "pregunta"]) {
    const v = new Set(lista.map(([, x]) => x[clave]));
    if (v.size !== 1) fallos.push(`${ancho} px · ${ronda}: ${clave} cambia (${lista.map(([e, x]) => `${e} ${x[clave]}`).join(", ")})`);
  }
}

await navegador.close();
await servidor.close();
console.log("ancho | estado | marco | alto");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.marco} | ${f.alto}`);
for (const [ancho, rondas] of Object.entries(h4)) for (const [ronda, lista] of Object.entries(rondas)) console.log(`H4 ${ancho} | ${ronda} | sobre ${[...new Set(lista.map(([, x]) => x.sobre))].join("/")} | pregunta a ${[...new Set(lista.map(([, x]) => x.pregunta))].join("/")} | ${lista.length} estados`);
console.log(fallos.length ? `\n${fallos.length} FALLAN:\n${fallos.join("\n")}` : `\nTodo cabe en los ${filas.length} estados, nada se delata antes de responder, y con movimiento reducido nada se anima.`);
process.exit(fallos.length ? 1 : 0);
