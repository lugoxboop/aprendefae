/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CALIDAD 1 DE LA CÉLULA B: LAS MEDIDAS QUE PIDE LA HOJA DE MAI
 *
 *   node scripts/b5/medir-b5-calidad-1.mjs
 *
 * Usa Chromium de verdad, con los juegos montados tal cual y la hoja de estilos
 * del sitio (scripts/b5/harness):
 *
 *   A · La mesa sin borde (b5-t5-a2, parte 2):
 *       · a 375, ningún texto de la parte queda a menos de 12 px de una línea:
 *         el borde del Panel que la contiene, o la línea de arriba;
 *       · a 320, «1.725.000» cabe en su campo.
 *   B · b5-t6-a6, a 320×568 y 375×667: al pasar a cada casilla se ven juntos
 *       la casilla, el rótulo y la fila que usa. El sitio no tiene cabecera
 *       fija sobre el juego, así que el hueco es la ventana entera.
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/b5/harness/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const informe = [];

async function abrir(ancho, alto, hash) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto } });
  await pagina.goto(`${BASE}${hash}`);
  await pagina.waitForSelector("[data-hecho]");
  await pagina.evaluate(() => document.fonts.ready);
  return pagina;
}

/* ═══════════ A · LA MESA ═══════════ */

for (const ancho of [375, 320]) {
  const p = await abrir(ancho, 900, "#mesa-2");
  /* La parte armada: cada cuenta del asiento, en su lado, con su valor, para medir el estante y la mesa llenos. */
  await p.click('[data-sacar="Caja:debe"]');
  await p.fill('[data-campo-cifra="Caja"]', "1725000");
  const m = await p.evaluate(() => {
    const parte = document.querySelector("[data-parte]");
    const caja = parte.getBoundingClientRect();
    /* La línea más cercana a los lados: el borde del ancestro con borde visible más próximo. */
    let anc = parte.parentElement;
    while (anc && parseFloat(getComputedStyle(anc).borderLeftWidth) === 0) anc = anc.parentElement;
    const marco = anc.getBoundingClientRect();
    const arriba = parte.previousElementSibling?.getBoundingClientRect().bottom ?? caja.top;
    const textos = [];
    const recorrer = (n) => {
      for (const h of n.childNodes) {
        if (h.nodeType === 3 && h.textContent.trim()) {
          /* Solo el texto que no vive en una caja propia con borde (estante, colectores, campos y cuentas en la mesa no cambian). */
          let e = h.parentElement, propia = false;
          while (e && e !== parte) { if (parseFloat(getComputedStyle(e).borderLeftWidth) > 0 || parseFloat(getComputedStyle(e).borderTopWidth) > 0) { propia = true; break; } e = e.parentElement; }
          if (propia) continue;
          /* Lo que solo oye el lector de pantalla (recortado a 1 px) no se ve. */
          if (h.parentElement.getBoundingClientRect().width <= 1) continue;
          const rg = document.createRange(); rg.selectNodeContents(h);
          for (const r of rg.getClientRects()) textos.push({ t: h.textContent.trim().slice(0, 30), izq: r.left - marco.left, der: marco.right - r.right, top: r.top - arriba });
        } else if (h.nodeType === 1) recorrer(h);
      }
    };
    recorrer(parte);
    const campo = document.querySelector('[data-campo-cifra="Caja"]');
    return {
      borde: getComputedStyle(parte).borderTopWidth,
      textos,
      campo: { valor: campo.value, scroll: campo.scrollWidth, cliente: campo.clientWidth },
      minimo: Math.min(...textos.flatMap((x) => [x.izq, x.der])),
    };
  });
  informe.push(`A · ${ancho}: borde de la parte ${m.borde}; texto más cercano a una línea lateral: ${m.minimo.toFixed(2)} px; campo «${m.campo.valor}»: ${m.campo.scroll} en ${m.campo.cliente}`);
  if (m.borde !== "0px") fallos.push(`A · ${ancho}: la parte todavía tiene borde (${m.borde})`);
  if (ancho === 375) for (const x of m.textos) if (x.izq < 12 || x.der < 12) fallos.push(`A · 375: «${x.t}» a ${Math.min(x.izq, x.der).toFixed(2)} px de una línea`);
  if (ancho === 320 && m.campo.scroll > m.campo.cliente) fallos.push(`A · 320: «${m.campo.valor}» no cabe (${m.campo.scroll} en ${m.campo.cliente})`);
  await p.close();
}

/* ═══════════ B · b5-t6-a6 ═══════════ */

const FILA = { p4: "g2", p5: "g3", p6: "g4", p8: "total" };
for (const [ancho, alto] of [[320, 568], [375, 667]]) {
  const p = await abrir(ancho, alto, "#a6");
  for (let k = 1; k <= 8; k++) {
    if (k > 1) {
      /* Responde la casilla anterior (la primera opción) y pasa a esta. */
      await p.click("[data-opcion]");
      await p.getByRole("button", { name: /^Siguiente$/ }).click();
      await p.waitForTimeout(700);
    }
    const r = await p.evaluate((FILA) => {
      const id = document.querySelector("[data-hecho]").dataset.hecho;
      const caja = document.querySelector("[data-hecho]").parentElement.getBoundingClientRect();
      const rot = document.querySelector("[data-rotulo-simulado]").getBoundingClientRect();
      const fila = FILA[id] ? document.querySelector(`[data-regla] [data-fila="${FILA[id]}"]`).getBoundingClientRect() : null;
      const dentro = (x) => x.top >= -0.5 && x.bottom <= innerHeight + 0.5;
      const alto = (sel) => { const e = document.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().height * 100) / 100 : 0; };
      const tramos = { pie: alto("[data-pie-tabla]"), partida: alto("[data-partida]"), registro: alto("[data-registro]"), casilla: Math.round(caja.height * 100) / 100, del_rotulo_al_fondo: Math.round((caja.bottom - rot.top) * 100) / 100 };
      return { tramos, id, casilla: dentro(caja), rotulo: dentro(rot), fila: fila ? dentro(fila) : null, alto: Math.max(caja.bottom, rot.bottom) - Math.min(fila?.top ?? rot.top, rot.top) };
    }, FILA);
    informe.push(`B · ${ancho}×${alto} · casilla ${k} (${r.id}): casilla ${r.casilla ? "✓" : "✗"} · rótulo ${r.rotulo ? "✓" : "✗"} · fila ${r.fila === null ? "—" : r.fila ? "✓" : "✗"} · del primero al último ${r.alto.toFixed(2)} px · ${JSON.stringify(r.tramos)}`);
    /* La casilla 1 se ve al cargar, con la página arriba: allí manda la consigna, y no hay paso de casilla. */
    if (k > 1 && (!r.casilla || !r.rotulo || r.fila === false)) fallos.push(`B · ${ancho}×${alto}: en la casilla ${k} no se ve todo junto`);
  }
  await p.close();
}

await navegador.close();
await servidor.close();
console.log(informe.join("\n"));
if (fallos.length) { console.error(`\nFALLA:\n${fallos.join("\n")}`); process.exit(1); }
console.log("\nTodo en orden.");
