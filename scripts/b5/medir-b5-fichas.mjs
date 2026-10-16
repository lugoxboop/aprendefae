/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS TRES DE FICHAS CON EL ESTANTE DE CAJONES, EN CHROMIUM (hoja 3 de Mai)
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/b5/medir-b5-fichas.mjs
 *
 * En b5-t5-a1 y b5-t6-a1 (b5-t6-a7 se retiró en el lote 4), a 320×568 y 375×667, con y sin
 * movimiento reducido, juega la tanda entera y en cada ficha comprueba:
 *
 * LOTE 6a (hoja de fusiones de Mai, §2): b5-t5-a1 y b5-t6-a1 son fichas a un
 * nivel, y sus tres cajones son las opciones. En ellas mide lo que pide la
 * hoja: el alto del estante (84), los renglones de cada nombre, y del
 * contador al estante con la ficha más alta, con la devolución abierta y
 * resuelta hasta «Siguiente ficha». Comprueba que el cajón ✕ no se puede
 * volver a tocar y que ✓ y ✕ llevan su ícono. b5-t6-a7, la del estante de dos
 * niveles, se retiró en el lote 4.
 *
 *   · sin barra horizontal; ningún nombre de cajón fuera de su cajón;
 *   · el alto del estante (la réplica de Mai: 96,78);
 *   · el juego, del contador al botón, con el panel abierto: cuánto mide y si
 *     cabe en la ventana (menos 8 arriba y abajo);
 *   · al colocar, que haya vuelo (una copia que viaja) y, con movimiento
 *     reducido, que no lo haya; y que la lámina entre a su cajón correcto;
 *   · en escala de grises (filter: grayscale), que la lámina que llegó tras
 *     el segundo fallo se distinga de la acertada por la forma: contorno
 *     punteado y sin relleno, frente a la llena (Shoko).
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
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/b5/harness-fichas/index.html`;
/* Con la barra de desplazamiento a la vista: el ancho del sitio en el Chromium de escritorio (navegador.mjs). */
const navegador = await abrirNavegador();
const fallos = [];
const informe = [];

function medir() {
  const problemas = [];
  if (document.documentElement.scrollWidth > innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} en ${innerWidth}`);
  for (const c of document.querySelectorAll("[data-cajon], [data-tapa]")) {
    const caja = c.getBoundingClientRect();
    const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const rg = document.createRange(); rg.selectNodeContents(w.currentNode);
      for (const r of rg.getClientRects()) if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`«${w.currentNode.textContent}» se sale de su cajón`);
    }
    if (c.scrollWidth > c.clientWidth + 0.5) problemas.push(`«${c.textContent.slice(0, 20)}» se corta`);
  }
  const estante = document.querySelector("[data-estante]").getBoundingClientRect();
  const pulsos = document.querySelector("[data-estante]").previousElementSibling.getBoundingClientRect();
  const boton = document.querySelector("[data-boton-colocar] button, [data-boton-avanzar] button").getBoundingClientRect();
  return { problemas, estante: estante.height, juego: boton.bottom - pulsos.top, lineas: [...document.querySelectorAll("[data-cajon] > span:first-child, [data-tapa]")].map((s) => `${s.textContent} ${Math.round(s.getBoundingClientRect().height / 15)}`) };
}

/* ═══════════ LOTE 6a: LAS FICHAS A UN NIVEL ═══════════ */

const fondo = (sel) => `(() => { const e = [...document.querySelectorAll(${JSON.stringify(sel)})].at(-1); return e ? e.getBoundingClientRect().bottom : null; })()`;
for (const juego of ["#t5a1", "#t6a1"]) {
  for (const reducido of [false, true]) {
    for (const [ancho, alto] of [[320, 568], [375, 667]]) {
      const p = await navegador.newPage({ viewport: { width: ancho, height: alto }, reducedMotion: reducido ? "reduce" : "no-preference" });
      await p.goto(`${BASE}${juego}`);
      await p.waitForSelector("[data-estante]");
      await p.evaluate(() => document.fonts.ready);
      const tag = `${juego} · ${ancho}×${alto}${reducido ? " · reducido" : ""}`;
      const m = { alEstante: 0, conDevolucion: 0, resuelta: 0, estante: 0, nombres: null };
      for (let k = 0; ; k++) {
        const base = await p.evaluate(() => {
          const top = document.querySelector("[data-contador]").getBoundingClientRect().top;
          const est = document.querySelector("[data-estante]").getBoundingClientRect();
          return {
            top, alEstante: est.bottom - top, estante: est.height, ancho: document.documentElement.scrollWidth - innerWidth,
            nombres: [...document.querySelectorAll("[data-nombre-cajon]")].map((n) => `${n.textContent} ${Math.round(n.getBoundingClientRect().height / 15)}`),
          };
        });
        m.alEstante = Math.max(m.alEstante, base.alEstante); m.estante = base.estante; m.nombres = base.nombres;
        if (base.ancho > 0) fallos.push(`${tag} · ficha ${k + 1}: desplazamiento horizontal de ${base.ancho}`);
        const antes = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll("[data-cajon]")].map((c) => [c.dataset.cajon, Number(c.dataset.cuantas)])));
        /* Toca los cajones en orden hasta colocarla: el primer fallo deja la devolución abierta y el ✕. */
        let vuelo = false;
        for (let intento = 0; intento < 2; intento++) {
          const libre = await p.$("[data-cajon]:not([disabled])");
          if (!libre || await p.$("[data-boton-avanzar]")) break;
          const clave = await libre.getAttribute("data-cajon");
          await libre.click();
          vuelo = vuelo || await p.evaluate(() => [...document.body.children].some((e) => e.style.position === "fixed" && e.getAttribute("aria-hidden") === "true"));
          await p.waitForTimeout(reducido ? 50 : 760);
          const tras = await p.evaluate((clave) => {
            const c = document.querySelector(`[data-cajon="${clave}"]`);
            return { marca: c.dataset.marca, deshabilitado: c.disabled, iconos: [...c.querySelectorAll("svg[data-icono]")].map((x) => x.dataset.icono) };
          }, clave);
          if (tras.marca === "tachada" && (!tras.deshabilitado || !tras.iconos.includes("tache"))) fallos.push(`${tag} · ficha ${k + 1}: el ✕ se puede volver a tocar o no lleva su ícono`);
          if (tras.marca === "correcta" && !tras.iconos.includes("visto")) fallos.push(`${tag} · ficha ${k + 1}: el ✓ no lleva su ícono`);
          m.conDevolucion = Math.max(m.conDevolucion, await p.evaluate(fondo('[role="status"]')) - base.top);
        }
        m.resuelta = Math.max(m.resuelta, await p.evaluate(fondo("[data-boton-avanzar] button")) - base.top);
        const despues = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll("[data-cajon]")].map((c) => [c.dataset.cajon, Number(c.dataset.cuantas)])));
        const sumo = Object.keys(despues).filter((c) => despues[c] !== antes[c]);
        if (sumo.length !== 1 || despues[sumo[0]] !== antes[sumo[0]] + 1) fallos.push(`${tag} · ficha ${k + 1}: el estante no sumó una lámina (${JSON.stringify(despues)})`);
        if (reducido && vuelo) fallos.push(`${tag} · ficha ${k + 1}: con movimiento reducido hubo vuelo`);
        if (!reducido && !vuelo) fallos.push(`${tag} · ficha ${k + 1}: sin vuelo`);
        const siguiente = await p.$("[data-boton-avanzar] button");
        if (/resultado/.test(await siguiente.textContent())) break;
        await siguiente.click();
      }
      if (Math.abs(m.estante - 84) > 0.5) fallos.push(`${tag}: el estante mide ${m.estante.toFixed(2)} y la hoja pide 84`);
      if (ancho === 320 && !reducido && process.env.CAPTURAS) await p.locator("[data-estante]").screenshot({ path: `${process.env.CAPTURAS}/estante-un-nivel-${juego.slice(1)}.png` });
      informe.push(`${tag}: estante ${m.estante.toFixed(2)} · del contador al estante, con la ficha más alta, ${m.alEstante.toFixed(2)} · con la devolución ${m.conDevolucion.toFixed(2)} · resuelta, hasta «Siguiente ficha», ${m.resuelta.toFixed(2)} (${m.resuelta <= alto ? "cabe" : "NO cabe"} en ${alto})${!reducido ? ` · renglones: ${m.nombres.join(" · ")}` : ""}`);
      await p.close();
    }
  }
}

/* ═══════════ EL ESTANTE DE DOS NIVELES (hoja 3): sin juego desde que b5-t6-a7 se retiró (0076) ═══════════ */

for (const juego of []) {
  for (const reducido of [false, true]) {
    for (const [ancho, alto] of [[320, 568], [375, 667]]) {
      const p = await navegador.newPage({ viewport: { width: ancho, height: alto }, reducedMotion: reducido ? "reduce" : "no-preference" });
      await p.goto(`${BASE}${juego}`);
      await p.waitForSelector("[data-estante]");
      await p.evaluate(() => document.fonts.ready);
      const tag = `${juego} · ${ancho}×${alto}${reducido ? " · reducido" : ""}`;
      let mayor = 0, alturaEstante = 0, lineas = [];
      for (let k = 0; ; k++) {
        /* Abre el panel (la pestaña que abre va al final) y elige su primera opción: el juego en su alto mayor. */
        const pestanas = await p.$$("[data-nivel1]");
        await pestanas[pestanas.length - 1].click();
        await p.click("[data-nivel2]");
        const m = await p.evaluate(medir);
        mayor = Math.max(mayor, m.juego); alturaEstante = m.estante; lineas = m.lineas;
        for (const x of m.problemas) fallos.push(`${tag} · ficha ${k + 1}: ${x}`);
        const antes = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll("[data-cajon]")].map((c) => [c.dataset.cajon, Number(c.dataset.cuantas)])));
        /* Coloca dos veces (si el primero falla, el segundo deja la ficha). */
        let vuelo = false;
        for (let intento = 0; intento < 2; intento++) {
          const colocar = await p.$("[data-boton-colocar] button");
          if (!colocar) break;
          await colocar.click();
          vuelo = vuelo || await p.evaluate(() => [...document.body.children].some((e) => e.style.position === "fixed" && e.getAttribute("aria-hidden") === "true"));
          await p.waitForTimeout(reducido ? 50 : 760);
        }
        const despues = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll("[data-cajon]")].map((c) => [c.dataset.cajon, Number(c.dataset.cuantas)])));
        const sumo = Object.keys(despues).filter((c) => despues[c] !== antes[c]);
        if (sumo.length !== 1 || despues[sumo[0]] !== antes[sumo[0]] + 1) fallos.push(`${tag} · ficha ${k + 1}: el estante no sumó una lámina (${JSON.stringify(despues)})`);
        if (reducido && vuelo) fallos.push(`${tag} · ficha ${k + 1}: con movimiento reducido hubo vuelo`);
        if (!reducido && !vuelo) fallos.push(`${tag} · ficha ${k + 1}: sin vuelo`);
        const siguiente = await p.$("[data-boton-avanzar] button");
        const texto = await siguiente.textContent();
        if (/resultado/.test(texto)) break;
        await siguiente.click();
      }
      /* Al final de la tanda, en gris: cada lámina por su forma. */
      await p.addStyleTag({ content: "html { filter: grayscale(1); }" });
      const formas = await p.evaluate(() => [...document.querySelectorAll("[data-lamina]")].map((l) => {
        const cs = getComputedStyle(l);
        return { tipo: l.dataset.lamina, borde: cs.borderTopStyle, relleno: cs.backgroundColor };
      }));
      const segundas = formas.filter((f) => f.tipo === "segundo");
      if (segundas.some((f) => f.borde !== "dashed" || f.relleno !== "rgba(0, 0, 0, 0)")) fallos.push(`${tag}: una lámina tras el segundo fallo no es punteada y vacía`);
      if (formas.filter((f) => f.tipo === "bien").some((f) => f.borde === "dashed" || f.relleno === "rgba(0, 0, 0, 0)")) fallos.push(`${tag}: una lámina acertada no es llena`);
      if (ancho === 320 && !reducido && process.env.CAPTURAS) await p.locator("[data-estante]").screenshot({ path: `${process.env.CAPTURAS}/estante-${juego.slice(1)}.png` });
      informe.push(`${tag}: láminas ${formas.length - segundas.length} llenas y ${segundas.length} punteadas · estante ${alturaEstante.toFixed(2)} · juego con el panel abierto, el mayor ${mayor.toFixed(2)} (${mayor <= alto - 16 ? "cabe" : "NO cabe"} en ${alto - 16})${ancho === 320 && !reducido ? ` · líneas: ${lineas.join(" · ")}` : ""}`);
      await p.close();
    }
  }
}

await navegador.close();
await servidor.close();
console.log(informe.join("\n"));
if (fallos.length) { console.error(`\nFALLA:\n${fallos.slice(0, 30).join("\n")}`); process.exit(1); }
console.log("\nTodo en orden.");
