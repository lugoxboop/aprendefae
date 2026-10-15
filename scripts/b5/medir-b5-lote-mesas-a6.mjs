/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 3 DE LA CÉLULA B: LAS MEDIDAS DE LA HOJA DE MAI (A · mesas, B · a6)
 *
 *   node scripts/b5/medir-b5-lote-mesas-a6.mjs              (con la barra de desplazamiento, como el sitio en escritorio)
 *   OCULTAR_BARRA=1 node scripts/b5/medir-b5-lote-mesas-a6.mjs   (sin ella, como un teléfono)
 *
 * Usa Chromium de verdad, con los juegos montados tal cual y la hoja de
 * estilos del sitio (scripts/b5/harness).
 *
 *   A · El estante de las tres mesas (cierre de T5, b5-t6-a2, b5-t6-a3), a
 *       320, 340, 360, 375 y 414:
 *       · A1: una fila baja («abajo») si y solo si su nombre, al lado de los
 *         botones, pasa de 3 renglones. Lo comprueba con una copia del nombre
 *         al ancho que tendría al lado de los botones, no con lo que decidió
 *         el juego;
 *       · A2: los botones de cada fila, en la misma columna (la misma x) y con
 *         el mismo tamaño que los de las demás filas;
 *       · en una fila «abajo», 4 px entre el nombre y sus botones;
 *       · sin desplazamiento horizontal.
 *       Informa el alto del estante y los renglones del nombre más largo.
 *   B · b5-t6-a6, a 320×568 y 375×667, casilla por casilla:
 *       · B1: sin eje desde la casilla 4;
 *       · B2: la fila del total («$1.400.000»), solo desde la casilla 7;
 *       · el alto de cada bloque (nota, tabla, pie, eje, casilla) y el alto
 *         de «casilla, rótulo y fila juntos», con y sin la cabecera de 56.
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { resolve } from "node:path";
import { abrirNavegador } from "./navegador.mjs";

const RAIZ = resolve(import.meta.dirname, "../..");
const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/b5/harness/index.html`;
const navegador = await abrirNavegador();
const fallos = [];
const informe = [`Barra de desplazamiento: ${process.env.OCULTAR_BARRA ? "oculta (teléfono)" : "a la vista (escritorio)"}`];
const r2 = (x) => Math.round(x * 100) / 100;

async function abrir(ancho, alto, hash, espera) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto } });
  await pagina.goto(`${BASE}${hash}`);
  await pagina.waitForSelector(espera);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(150);
  return pagina;
}

/* ═══════════ A · EL ESTANTE DE LAS MESAS ═══════════ */

const MESAS = [["Cierre de T5", "#mesa-t5"], ["b5-t6-a2", "#mesa-t6a2"], ["b5-t6-a3", "#mesa-t6a3"]];
for (const [nombre, hash] of MESAS) {
  for (const ancho of [320, 340, 360, 375, 414]) {
    const p = await abrir(ancho, 900, hash, "[data-estante]");
    const m = await p.evaluate(() => {
      const r2 = (x) => Math.round(x * 100) / 100;
      const estante = document.querySelector("[data-estante]");
      const filas = [...estante.querySelectorAll("[data-en-estante]")].map((f) => {
        const n = f.querySelector("[data-nombre-estante]");
        const [bd, bh] = f.querySelectorAll("[data-sacar]");
        const cs = getComputedStyle(n);
        const renglon = parseFloat(cs.lineHeight);
        /* El nombre al ancho que tendría al lado de los botones: el de la fila menos los botones y los dos huecos de 8. */
        const alLado = f.getBoundingClientRect().width - bd.getBoundingClientRect().width - bh.getBoundingClientRect().width - 16;
        const copia = document.createElement("span");
        copia.textContent = n.textContent;
        Object.assign(copia.style, { position: "absolute", visibility: "hidden", width: `${alLado}px`, font: cs.font, letterSpacing: cs.letterSpacing, lineHeight: cs.lineHeight, display: "block" });
        document.body.appendChild(copia);
        const renglonesAlLado = Math.round(copia.getBoundingClientRect().height / renglon);
        copia.remove();
        const rn = n.getBoundingClientRect(), rd = bd.getBoundingClientRect(), rh = bh.getBoundingClientRect();
        return {
          cuenta: f.dataset.enEstante, forma: f.dataset.forma ?? "al lado",
          renglones: Math.round(rn.height / renglon), renglonesAlLado,
          debe: { x: r2(rd.left), w: r2(rd.width), h: r2(rd.height) }, haber: { x: r2(rh.left), w: r2(rh.width), h: r2(rh.height) },
          hueco: r2(rd.top - rn.bottom), abajo: rd.top >= rn.bottom - 0.5,
        };
      });
      return { alto: r2(estante.getBoundingClientRect().height), filas, desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    const bajan = m.filas.filter((f) => f.abajo);
    const largo = m.filas.reduce((a, f) => (f.renglonesAlLado > a.renglonesAlLado ? f : a));
    informe.push(`A · ${nombre} · ${ancho}: estante ${m.alto} px · bajan ${bajan.length ? bajan.map((f) => `«${f.cuenta}»`).join(", ") : "ninguna"} · nombre más largo «${largo.cuenta}»: ${largo.renglonesAlLado} renglones al lado → ${largo.renglones}`);
    for (const f of m.filas) {
      const debe = f.renglonesAlLado > 3;
      if (debe !== f.abajo) fallos.push(`A1 · ${nombre} · ${ancho}: «${f.cuenta}» tiene ${f.renglonesAlLado} renglones al lado y ${f.abajo ? "bajó" : "no bajó"}`);
      if (f.abajo && Math.abs(f.hueco - 4) > 0.5) fallos.push(`A · ${nombre} · ${ancho}: «${f.cuenta}» abajo, a ${f.hueco} px de su nombre (pide 4)`);
    }
    for (const lado of ["debe", "haber"]) {
      const xs = m.filas.map((f) => f[lado].x), ws = m.filas.map((f) => f[lado].w), hs = m.filas.map((f) => f[lado].h);
      if (Math.max(...xs) - Math.min(...xs) > 0.5) fallos.push(`A2 · ${nombre} · ${ancho}: los botones «${lado}» no van en una columna (x de ${Math.min(...xs)} a ${Math.max(...xs)})`);
      if (Math.max(...ws) - Math.min(...ws) > 0.5 || Math.max(...hs) - Math.min(...hs) > 0.5) fallos.push(`A2 · ${nombre} · ${ancho}: los botones «${lado}» cambian de tamaño`);
      if (Math.min(...hs) < 44) fallos.push(`A · ${nombre} · ${ancho}: botón «${lado}» de ${Math.min(...hs)} de alto`);
    }
    if (m.desborde > 0) fallos.push(`A · ${nombre} · ${ancho}: desplazamiento horizontal de ${m.desborde} px`);
    await p.close();
  }
}

/* ═══════════ B · b5-t6-a6 ═══════════ */

const FILA = { p4: "g2", p5: "g3", p6: "g4", p7: "total", p8: "total" };
for (const [ancho, alto] of [[320, 568], [375, 667]]) {
  const p = await abrir(ancho, alto, "#a6", "[data-hecho]");
  for (let k = 1; k <= 8; k++) {
    if (k > 1) {
      await p.click("[data-opcion]");
      await p.getByRole("button", { name: /^Siguiente$/ }).click();
      await p.waitForTimeout(700);
    }
    const r = await p.evaluate((FILA) => {
      const hecho = document.querySelector("[data-hecho]");
      const id = hecho.dataset.hecho;
      const casilla = hecho.parentElement.getBoundingClientRect();
      const rot = document.querySelector("[data-rotulo-simulado]").getBoundingClientRect();
      const fila = FILA[id] ? document.querySelector(`[data-regla] [data-fila="${FILA[id]}"]`)?.getBoundingClientRect() : null;
      const alto = (sel) => { const e = document.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().height * 100) / 100 : 0; };
      const arriba = Math.min(fila?.top ?? rot.top, rot.top);
      return {
        id, eje: Boolean(document.querySelector("[data-eje]")), total: Boolean(document.querySelector('[data-regla] [data-fila="total"]')),
        bloques: { nota: alto("[data-nota-regla]"), tabla: alto("[data-regla]"), pie: alto("[data-pie-tabla]"), eje: alto("[data-eje]"), total: alto('[data-fila="total"]'), casilla: Math.round(casilla.height * 100) / 100 },
        juntos: Math.round((casilla.bottom - arriba) * 100) / 100,
      };
    }, FILA);
    const cabe = (h) => (r.juntos <= h ? `cabe (sobran ${r2(h - r.juntos)})` : `NO cabe (faltan ${r2(r.juntos - h)})`);
    informe.push(`B · ${ancho}×${alto} · casilla ${k} (${r.id}): casilla, rótulo y fila juntos ${r.juntos} px · sin cabecera ${cabe(alto)} · con 56 ${cabe(alto - 56)} · eje ${r.eje ? "sí" : "no"} · total ${r.total ? "sí" : "no"} · ${JSON.stringify(r.bloques)}`);
    if (k >= 4 && r.eje) fallos.push(`B1 · ${ancho}: el eje sigue en la casilla ${k}`);
    if (k >= 4 && r.total !== k >= 7) fallos.push(`B2 · ${ancho}: en la casilla ${k}, la fila del total ${r.total ? "ya está" : "no está"}`);
    if (k > 1 && r.juntos > alto) fallos.push(`B · ${ancho}×${alto}: en la casilla ${k} no se ve todo junto (${r.juntos} px)`);
  }
  await p.close();
}

await navegador.close();
await servidor.close();
console.log(informe.join("\n"));
if (fallos.length) { console.error(`\nFALLA:\n${fallos.join("\n")}`); process.exit(1); }
console.log("\nTodo en orden.");
