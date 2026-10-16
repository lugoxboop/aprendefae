/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL BANCO DE MEDIDA DE LOS HACER CON ESCALERA (entrega D: T7-1 H7 y T5 N3).
 *
 * Lo usan medir-t7-1-h7.mjs y ../t5/medir-t5-n3.mjs. Chromium de verdad, la
 * vista del tema en modo Hacer con el juego abierto y la hoja de estilos del
 * sitio. Recorre la tanda con un plan por caso —«bien» (acierta de una),
 * «una» (falla y acierta) o «dos» (falla dos veces)— y mide cada estado:
 * antes de responder, tras el primer error, el caso cerrado y el cierre.
 * En cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni de la pantalla
 *   · que el distintivo no se monte sobre el texto del contador
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada botón de la pieza mida al menos 44 px de alto (en el cierre
 *     solo quedan los compartidos, que no se miden aquí)
 *
 * Si existe FUENTES (por omisión /tmp/claude-0/fuentes, con su fuentes.css),
 * Inter y Sora se sirven desde ahí: Google Fonts no se alcanza desde la
 * máquina. Playwright: el de la máquina o PLAYWRIGHT_MODULE; Chromium en
 * CHROMIUM_PATH.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes/";
const ANCHOS = [375, 320];

function medir(marca) {
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
  /* El distintivo no se monta sobre el contador. */
  const distintivo = document.querySelector("[data-primer-intento]")?.getBoundingClientRect();
  const contador = [...document.querySelectorAll("[data-avance] span")].filter((s) => s.textContent.trim()).map((s) => s.getBoundingClientRect());
  for (const c of contador) {
    if (distintivo && c.right > distintivo.left && c.left < distintivo.right && c.bottom > distintivo.top && c.top < distintivo.bottom) problemas.push("el distintivo se monta sobre el contador");
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  /* Los botones de la pieza; en el cierre ya no está la pieza y lo que queda (el cierre y «Volver») es compartido: no se mide aquí. */
  const pieza = document.querySelector(`[data-${marca}]`)?.parentElement ?? null;
  const botones = [...(pieza?.querySelectorAll("button") ?? [])].filter((b) => b.getBoundingClientRect().width && !b.classList.contains("fae-por-que"));
  const altos = botones.map((b) => b.getBoundingClientRect().height);
  for (const [k, a] of altos.entries()) if (a < 44) problemas.push(`el botón «${botones[k].textContent.trim().slice(0, 30)}» mide ${a.toFixed(1)} px de alto`);
  const el = document.querySelector(`[data-${marca}]`);
  return {
    problemas,
    actividad: el ? Math.round(el.getBoundingClientRect().width * 10) / 10 : null,
    alto: Math.round(document.documentElement.scrollHeight),
    botonMasBajo: altos.length ? Math.round(Math.min(...altos) * 10) / 10 : null,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"),
  };
}

/**
 * ruta: la del banco (con su hash); marca: el data- de la pieza; items: los
 * datos de los casos (id, correcta, y las opciones malas en `malas`);
 * plan(k): «bien», «una» o «dos»; siguiente: los textos del botón de avanzar.
 */
export async function medirEscalera({ ruta, marca, items, plan, siguiente, capturas = null, prefijo }) {
  if (capturas) mkdirSync(capturas, { recursive: true });
  const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
  await servidor.listen();
  const url = `http://127.0.0.1:${servidor.httpServer.address().port}/${ruta}`;
  const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const fallos = [];
  const filas = [];
  for (const ancho of ANCHOS) {
    const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
    if (existsSync(resolve(FUENTES, "fuentes.css"))) {
      const css = readFileSync(resolve(FUENTES, "fuentes.css"), "utf8");
      await ctx.route("**/*", (route) => {
        const u = route.request().url();
        if (u.startsWith("http://127.0.0.1")) return route.continue();
        if (u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: css });
        if (u.startsWith("https://fonts.gstatic.com/")) {
          try { return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(resolve(FUENTES, u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_"))) }); } catch { return route.abort(); }
        }
        return route.abort();
      });
    }
    const pg = await ctx.newPage();
    await pg.goto(url);
    await pg.waitForSelector(`[data-${marca}]`);
    let n = 0;
    const estado = async (nombre) => {
      await pg.evaluate(() => document.fonts.ready);
      await pg.waitForTimeout(200);
      const m = await pg.evaluate(medir, marca);
      filas.push({ ancho, estado: nombre, ...m });
      for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
      if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
      if (capturas) await pg.screenshot({ path: resolve(capturas, `${prefijo}-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`), fullPage: true });
    };
    const tocar = (v) => pg.locator(`[data-opcion="${v}"] button`).click();
    for (let k = 0; k < items.length; k++) {
      const id = await pg.getAttribute("[data-item]", "data-item");
      const it = items.find((x) => x.id === id);
      const p = plan(k);
      await estado(`${id}-antes`);
      if (p === "bien") await tocar(it.correcta);
      else {
        await tocar(it.malas[0]);
        await estado(`${id}-primer-error`);
        await tocar(p === "una" ? it.correcta : it.malas[1]);
      }
      await estado(`${id}-${p === "dos" ? "segundo-error" : "acierto"}`);
      await pg.locator("[data-zona-boton] button").filter({ hasText: new RegExp(`^(${siguiente.join("|")})$`) }).click();
    }
    await estado("cierre");
    await ctx.close();
  }
  await navegador.close();
  await servidor.close();

  console.log("ancho | estado | ancho de la actividad | alto de la página | botón más bajo");
  for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.actividad ?? "—"} | ${f.alto} | ${f.botonMasBajo ?? "—"}`);
  console.log(`\n${filas.length} medidas (${filas.length / ANCHOS.length} estados × ${ANCHOS.length} anchos).`);
  return fallos;
}
