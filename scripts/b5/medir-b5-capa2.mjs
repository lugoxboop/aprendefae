/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CAPAS 2 LARGAS · LOS PASOS JUNTADOS Y LA PARADA, EN CHROMIUM (hoja 7 de Mai)
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/b5/medir-b5-capa2.mjs
 *
 * A 320×568 y 375×667, con y sin movimiento reducido, en T5 · A2 y T6 · A3,
 * A4 y A5: recorre los pasos con la capa 2 en pantalla (el bloque de control
 * pegado abajo) y comprueba (§5 de la hoja):
 *   2 · el texto reservado y el alto del bloque en los pasos;
 *   3 · en la parada, «Siguiente» no se mueve: el bloque crece hacia arriba
 *       una sola vez, al entrar, y no otra vez al responder; al salir vuelve;
 *   4 · lo resaltado en la parada queda entero sobre el bloque (sin
 *       cabecera fija, como el sitio; se informa también el hueco con 56);
 *   · en cada paso juntado, lo resaltado cabe junto o, si no, lo que llega
 *     queda entero sobre el bloque;
 *   · sin barra horizontal.
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del repo).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { resolve } from "node:path";
import { abrirNavegador } from "./navegador.mjs";

const RAIZ = resolve(import.meta.dirname, "../..");
const PIEZAS = (process.env.PIEZAS ?? "t5a2,t6a3,t6a4,t6a5").split(",");
const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/b5/harness-capa2/index.html`;
/* Con la barra de desplazamiento a la vista: el ancho del sitio en el Chromium de escritorio (navegador.mjs). */
const navegador = await abrirNavegador();
const fallos = [];
const informe = [];
const r2 = (x) => Math.round(x * 100) / 100;

const PARADAS = {
  t5a2: (await import("../../src/data/contabilidadT5Pieza2.js")).PARADA_T5_A2,
  t6a3: (await import("../../src/data/contabilidadT6Pieza3.js")).PARADA_T6_A3,
  t6a4: (await import("../../src/data/contabilidadT6Pieza4.js")).PARADA_T6_A4,
  t6a5: (await import("../../src/data/contabilidadT6Pieza5.js")).PARADA_T6_A5,
};
const FUSIONES = {
  t5a2: (await import("../../src/data/contabilidadT5Pieza2.js")).FUSION_T5_A2,
  t6a3: (await import("../../src/data/contabilidadT6Pieza3.js")).FUSION_T6_A3,
  t6a4: null,
  t6a5: (await import("../../src/data/contabilidadT6Pieza5.js")).FUSION_T6_A5,
};

/* En la página: dónde está todo. */
const medir = () => {
  const capa = document.querySelector('[data-capa="2"]');
  const bloque = capa.querySelector("[data-bloque-control]");
  const sig = capa.querySelector("[data-siguiente]");
  const b = bloque.getBoundingClientRect();
  const textoReservado = capa.querySelector("[data-texto-paso]").parentElement.getBoundingClientRect().height;
  const rects = [...capa.querySelectorAll('[data-escena-viva] [data-resaltado="si"]')].map((n) => n.getBoundingClientRect());
  const union = rects.length ? { top: Math.min(...rects.map((r) => r.top)), bottom: Math.max(...rects.map((r) => r.bottom)) } : null;
  return {
    modo: bloque.dataset.modo, siguiente: sig.getBoundingClientRect().top, bloqueTop: b.top, bloqueAlto: b.height, textoReservado,
    /* Lo que llega en un paso juntado es lo del segundo paso: lo de más abajo en la escena (el momento o el hecho más nuevo). */
    contador: capa.querySelector("[data-paso-de]").textContent, union, llega: rects.length ? rects.reduce((x, r) => (r.bottom > x.bottom ? r : x)) : null,
    modoYScroll: `${bloque.dataset.modo} @${Math.round(window.scrollY)}`,
    horizontal: document.documentElement.scrollWidth > window.innerWidth + 0.5,
  };
};

async function recorrer(pieza, ancho, alto, reducido) {
  const parada = PARADAS[pieza];
  const p = await navegador.newPage({ viewport: { width: ancho, height: alto }, reducedMotion: reducido ? "reduce" : "no-preference" });
  await p.goto(`${BASE}#${pieza}`);
  await p.waitForSelector('[data-capa="2"] [data-siguiente]');
  await p.evaluate(() => document.fonts.ready);
  /* La capa 2 arriba de la pantalla: el bloque queda pegado abajo. */
  await p.evaluate(() => { const c = document.querySelector('[data-capa="2"]'); window.scrollTo(0, c.getBoundingClientRect().top + window.scrollY - 8); });
  const espera = () => p.waitForTimeout(reducido ? 60 : 700);
  await espera();
  const tag = `${pieza} · ${ancho}${reducido ? " · reducido" : ""}`;
  const pasos = [];
  const hasta = parada.antes - 1;
  let n = 1;
  for (; n < hasta; n++) {
    pasos.push(await p.evaluate(medir));
    await p.click('[data-capa="2"] [data-siguiente]');
    await espera();
  }
  const antes = await p.evaluate(medir);
  await p.click('[data-capa="2"] [data-siguiente]');
  await espera();
  const enParada = await p.evaluate(medir);
  const mala = parada.opciones.find((o) => o.id !== parada.correcta).id;
  await p.click(`[data-capa="2"] [data-parada] [data-opcion="${mala}"]`);
  await espera();
  const decidida = await p.evaluate(medir);
  await p.click('[data-capa="2"] [data-siguiente]');
  await espera();
  const despues = await p.evaluate(medir);
  /* El resto de los pasos, para los juntados. */
  for (let k = 0; k < 30 && !(await p.evaluate(() => document.querySelector('[data-capa="2"] [data-siguiente]').disabled)); k++) {
    pasos.push(await p.evaluate(medir));
    await p.click('[data-capa="2"] [data-siguiente]');
    await espera();
  }
  await p.close();

  if (enParada.contador !== `Antes del paso ${parada.antes}`) fallos.push(`${tag}: el contador de la parada dice «${enParada.contador}»`);
  if (antes.modo !== "B-fijo") fallos.push(`${tag}: el bloque no quedó pegado (${antes.modo})`);
  for (const [nombre, m] of [["en la parada", enParada], ["al responder", decidida], ["al salir", despues]]) {
    if (Math.abs(m.siguiente - antes.siguiente) > 0.5) fallos.push(`${tag}: «Siguiente» se mueve ${nombre} (${r2(antes.siguiente)} → ${r2(m.siguiente)}; ${antes.modoYScroll} → ${m.modoYScroll})`);
  }
  if (Math.abs(decidida.bloqueAlto - enParada.bloqueAlto) > 0.5) fallos.push(`${tag}: el bloque crece otra vez al responder (${r2(enParada.bloqueAlto)} → ${r2(decidida.bloqueAlto)})`);
  if (Math.abs(despues.bloqueAlto - antes.bloqueAlto) > 0.5) fallos.push(`${tag}: el bloque no vuelve a su alto al salir (${r2(antes.bloqueAlto)} → ${r2(despues.bloqueAlto)})`);
  if (!enParada.union || enParada.union.top < -0.5 || enParada.union.bottom > enParada.bloqueTop + 0.5) {
    fallos.push(`${tag}: lo resaltado en la parada no queda entero sobre el bloque (${enParada.union ? `${r2(enParada.union.top)}–${r2(enParada.union.bottom)}` : "nada"}, bloque en ${r2(enParada.bloqueTop)})`);
  }
  if ([antes, enParada, decidida, despues, ...pasos].some((m) => m.horizontal)) fallos.push(`${tag}: barra horizontal`);
  /* Los pasos juntados: lo resaltado junto, o lo que llega (lo de más abajo) entero sobre el bloque. */
  for (const m of pasos.filter((x) => x.modo === "B-fijo" && x.union)) {
    const junto = m.union.top >= -0.5 && m.union.bottom <= m.bloqueTop + 0.5;
    const llega = m.llega.top >= -0.5 && m.llega.bottom <= m.bloqueTop + 0.5;
    if (!junto && !llega) fallos.push(`${tag} · ${m.contador}: lo que llega no queda entero sobre el bloque`);
    if (!junto) informe.push(`  ${tag} · ${m.contador}: no cabe junto (${r2(m.union.bottom - m.union.top)}); lo que llega, sí`);
  }
  return {
    textoReservado: antes.textoReservado, bloque: antes.bloqueAlto, bloqueParada: enParada.bloqueAlto, siguiente: antes.siguiente,
    hueco: enParada.bloqueTop, resaltado: enParada.union ? enParada.union.bottom - enParada.union.top : 0,
  };
}

for (const pieza of PIEZAS) {
  const fila = {};
  for (const [ancho, alto] of [[320, 568], [375, 667]]) {
    for (const reducido of [false, true]) {
      const r = await recorrer(pieza, ancho, alto, reducido);
      if (!reducido) fila[ancho] = r;
    }
  }
  const a = fila[320]; const b = fila[375];
  informe.push(`${pieza}: texto reservado ${r2(a.textoReservado)} · ${r2(b.textoReservado)} · bloque ${r2(a.bloque)} · ${r2(b.bloque)}`
    + ` · en la parada ${r2(a.bloqueParada)} · ${r2(b.bloqueParada)} · «Siguiente» a ${r2(a.siguiente)} · ${r2(b.siguiente)} (fijo)`
    + ` · hueco sobre el bloque en la parada a 320 ${r2(a.hueco)} (con cabecera de 56: ${r2(a.hueco - 56)}) · lo resaltado ${r2(a.resaltado)}`);
}

await navegador.close();
await servidor.close();
console.log(informe.join("\n"));
if (fallos.length) { console.error(`\nFALLA:\n${fallos.slice(0, 40).join("\n")}`); process.exit(1); }
console.log("\nTodo en orden.");
