/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LA GUARDIA DE ENGANCHE EN EL NAVEGADOR (B1, la parte de posición).
 *
 *   node scripts/t4/guardia-enganche.mjs [carpeta-de-capturas]
 *
 * La barra nueva de Mateo (celula-d/autodiagnostico-calidad.md), B1: a 320
 * px, la figura o la interacción de cada pantalla EMPIEZA en los primeros
 * 280 px de la tarjeta, y el texto antes de ella no pasa de 40 palabras.
 * jsdom no tiene diseño, así que esto lo mide Chromium. Lo demás (B1 en
 * palabras, B2, B4 y B5) está en src/contabilidad/__tests__/t4-guardia-
 * enganche.test.mjs, que corre en `npm test`.
 *
 * Monta la vista de T4 tal cual (banco scripts/t4/harness-t4), recorre cada
 * pieza de Aprender pantalla por pantalla (en una elección, colocando) y, en
 * cada pantalla con figura, mide el tope de la figura desde el tope de su
 * tarjeta (la <section> del Panel), y cuenta TODAS las palabras visibles antes
 * de ella, con el rótulo y el título de la tarjeta (alineado con el canon y
 * con la sonda de enganche). Una pantalla sin figura no cuenta para
 * B1: B3 (que haya figura y acción) es otra regla.
 *
 * Y los Hacer: el tope de la primera opción (la interacción) desde el tope de
 * su tarjeta, en la partida, con el «Así se juega» cerrado.
 *
 * Y E2 (Shibukawa, #260): en la VENTANA de 320×568 y de 375×667 (no en la
 * captura de página entera), tras cada veredicto que juegan los planes de la
 * sonda (scripts/t4/sonda-enganche/enganche_planes.json), la devolución
 * (`[data-mensaje]`) queda entera entre el borde de arriba y el de abajo.
 * Las pantallas con pregunta no muestran «Seguir» sin el acierto (D7), así
 * que la guardia juega el plan de cada pantalla antes de seguir.
 *
 * Sale con código 1 si algo falla. Necesita Playwright.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });

export const B1_TOPE = 280;
export const B1_PALABRAS = 40;
const ANCHO = 320;
export const E2_VENTANAS = [{ width: 320, height: 568 }, { width: 375, height: 667 }];
const PLANES = JSON.parse(readFileSync(resolve(RAIZ, "scripts/t4/sonda-enganche/enganche_planes.json"), "utf8"));

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t4/harness-t4/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

/* En la página: el tope de `objetivo` desde el tope de su tarjeta, y las palabras visibles antes de él. */
function medir({ raiz, objetivo }) {
  const zona = document.querySelector(raiz);
  let fig = zona.querySelector(objetivo);
  if (!fig) return null;
  /* Un envoltorio con `display: contents` no tiene caja: se mide lo primero que sí la tiene. */
  while (fig && getComputedStyle(fig).display === "contents") fig = fig.firstElementChild;
  if (!fig) return null;
  /* La tarjeta es la <section> del Panel que contiene la figura (en Hacer, el Marco va DENTRO de la partida). */
  const tarjeta = fig.closest("section");
  const tope = fig.getBoundingClientRect().top - tarjeta.getBoundingClientRect().top;
  const palabras = (t) => (t.match(/[\p{L}\p{N}$][\p{L}\p{N}.,$%’'-]*/gu) ?? []).length;
  let antes = 0;
  const recorrer = (n) => {
    if (n === fig) return true;
    if (n.nodeType === 3) {
      const el = n.parentElement;
      const r = el?.getBoundingClientRect();
      /*
       * Todo lo que se VE antes de la figura cuenta, como en la barra del canon y
       * en la sonda: también el rótulo y el título de la tarjeta, la consigna, el
       * avance y los botones. Solo queda fuera lo que no se ve (oculto o solo
       * para el lector de pantalla).
       */
      const visible = el && r.width > 1 && r.height > 1 && getComputedStyle(el).visibility !== "hidden" && !el.closest('.t4f-sr, [style*="clip"], figcaption');
      if (visible) antes += palabras(n.textContent);
      return false;
    }
    for (const c of n.childNodes) if (recorrer(c)) return true;
    return false;
  };
  recorrer(tarjeta);
  return { tope: Math.round(tope * 100) / 100, antes };
}

/*
 * Juega el plan de la sonda de una pantalla (tocar, arrastrar, esperar). Tras
 * cada paso con veredicto llama a `alVeredicto(paso)`, con la vista ya quieta.
 * Con `alVeredicto`, antes de cada toque el control se deja pegado al borde de
 * abajo de la ventana (el estudiante bajó lo justo para verlo: el peor caso);
 * Playwright, que si no lo centraría, ya no mueve la vista, y lo que la mueva
 * después es la vista misma.
 */
async function jugarPlan(pg, sel, plan, alVeredicto = null) {
  for (const paso of plan ?? []) {
    if (paso.click && alVeredicto) await pg.$eval(`${sel} ${paso.click}`, (el) => el.scrollIntoView({ block: "end", behavior: "instant" }));
    if (paso.click) await pg.click(`${sel} ${paso.click}`);
    if (paso.arrastra) {
      const bx = await (await pg.$(`${sel} ${paso.arrastra}`)).boundingBox();
      const x0 = bx.x + 2, y0 = bx.y + bx.height / 2;
      await pg.mouse.move(x0, y0); await pg.mouse.down(); await pg.mouse.move(x0 + bx.width * paso.hasta, y0, { steps: 8 }); await pg.mouse.up();
    }
    await pg.waitForTimeout(paso.espera ?? 120);
    if (paso.veredicto && alVeredicto) {
      /* Que termine el desplazamiento suave: dos lecturas iguales seguidas. */
      let y = -1;
      for (let i = 0; i < 40; i++) { const y2 = await pg.evaluate(() => scrollY); if (y2 === y) break; y = y2; await pg.waitForTimeout(80); }
      await alVeredicto(paso);
    }
  }
}

/* En la página: la caja de la última devolución de la pieza, contra la ventana. */
function devolucion(sel) {
  const ms = document.querySelectorAll(`${sel} [data-mensaje]`);
  const m = ms[ms.length - 1];
  if (!m) return null;
  const r = m.getBoundingClientRect();
  return { veredicto: m.dataset.mensaje, top: Math.round(r.top * 10) / 10, bottom: Math.round(r.bottom * 10) / 10, alto: innerHeight };
}

/* ═══════════ APRENDER ═══════════ */
{
  const pg = await navegador.newPage({ viewport: { width: ANCHO, height: 900 }, deviceScaleFactor: 2 });
  await pg.goto(BASE);
  await pg.waitForSelector("[data-pieza]", { timeout: 120000 });
  const piezas = await pg.$$eval("[data-pieza]", (xs) => xs.map((x) => x.dataset.pieza));
  for (const pz of piezas) {
    const sel = `[data-pieza="${pz}"]`;
    for (let vuelta = 0; vuelta < 16; vuelta++) {
      await pg.evaluate(() => document.fonts.ready);
      const id = await pg.getAttribute(sel, "data-pantalla");
      const m = await pg.evaluate(medir, { raiz: sel, objetivo: "[data-figura]" });
      if (m) {
        filas.push(`${pz} · ${id} · figura a ${m.tope} px · ${m.antes} palabras antes`);
        if (m.tope > B1_TOPE) fallos.push(`B1 · ${pz} · ${id}: la figura empieza a ${m.tope} px del tope de la tarjeta (máximo ${B1_TOPE})`);
        if (m.antes > B1_PALABRAS) fallos.push(`B1 · ${pz} · ${id}: ${m.antes} palabras antes de la figura (máximo ${B1_PALABRAS})`);
        if (CAPTURAS) await (await pg.$(sel)).evaluateHandle((x) => x.closest("section")).then((h) => h.asElement().screenshot({ path: resolve(CAPTURAS, `b1-${pz}-${String(vuelta).padStart(2, "0")}-${id}.png`) }));
      }
      /* Elección: se acierta para seguir. Lectura: «Seguir». */
      if (await pg.$(`${sel} [data-eleccion]`)) {
        const correcta = await pg.evaluate(async ({ pz, id }) => {
          const m = await import("/src/components/ContabilidadT4View.jsx");
          return m.PIEZAS_T4.find((x) => x.pieza.id === pz).pieza.pantallas.find((p) => p.id === id).opciones.find((o) => o.correcta).id;
        }, { pz, id });
        await pg.click(`${sel} [data-opcion="${correcta}"]`);
        await pg.click(`${sel} [data-boton="confirmar"]`);
      }
      /* Una pantalla con pregunta no muestra «Seguir» sin el acierto (D7): se juega su plan. */
      await jugarPlan(pg, sel, PLANES[pz]?.[id]);
      const b = await pg.$(`${sel} [data-boton="seguir"], ${sel} [data-boton="empezar"]`);
      if (!b) {
        const quedan = await pg.evaluate(async ({ pz, id }) => {
          const m = await import("/src/components/ContabilidadT4View.jsx");
          const ps = m.PIEZAS_T4.find((x) => x.pieza.id === pz).pieza.pantallas;
          return ps.length - 1 - ps.findIndex((p) => p.id === id);
        }, { pz, id });
        if (quedan > 0) fallos.push(`D7 · ${pz} · ${id}: tras jugar el plan no hay «Seguir» y quedan ${quedan} pantallas`);
        break;
      }
      await b.click();
    }
  }
  await pg.close();
}

/* ═══════════ E2: LA DEVOLUCIÓN, ENTERA EN LA VENTANA ═══════════ */
const filasE2 = [];
for (const ventana of E2_VENTANAS) {
  const pg = await navegador.newPage({ viewport: ventana, deviceScaleFactor: 2 });
  await pg.goto(BASE);
  await pg.waitForSelector("[data-pieza]", { timeout: 120000 });
  const piezas = await pg.$$eval("[data-pieza]", (xs) => xs.map((x) => x.dataset.pieza));
  for (const pz of piezas.filter((x) => PLANES[x])) {
    const sel = `[data-pieza="${pz}"]`;
    for (let vuelta = 0; vuelta < 16; vuelta++) {
      await pg.evaluate(() => document.fonts.ready);
      const id = await pg.getAttribute(sel, "data-pantalla");
      await jugarPlan(pg, sel, PLANES[pz][id], async (paso) => {
        const d = await pg.evaluate(devolucion, sel);
        const lugar = `E2 · ${ventana.width}×${ventana.height} · ${pz} · ${id} · ${paso.mide}`;
        if (!d) { fallos.push(`${lugar}: no hay devolución`); return; }
        filasE2.push(`${lugar}: devolución de ${d.top} a ${d.bottom} px (ventana ${d.alto})`);
        if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `e2-${ventana.width}x${ventana.height}-${pz}-${id}-${paso.mide.replace(/[^\p{L}\p{N}]+/gu, "-")}.png`) });
        if (d.top < -0.5 || d.bottom > d.alto + 0.5) fallos.push(`${lugar}: la devolución va de ${d.top} a ${d.bottom} px y la ventana mide ${d.alto}`);
      });
      const b = await pg.$(`${sel} [data-boton="seguir"]`);
      if (!b) break;
      await b.click();
    }
  }
  await pg.close();
}
filas.push(...filasE2);

/* ═══════════ HACER ═══════════ */
{
  const pg = await navegador.newPage({ viewport: { width: ANCHO, height: 900 }, deviceScaleFactor: 2 });
  const juegos = await (async () => {
    await pg.goto(BASE);
    await pg.waitForSelector("[data-pieza]", { timeout: 120000 });
    return pg.evaluate(async () => (await import("/src/components/ContabilidadT4View.jsx")).JUEGOS_T4.map((j) => j.id));
  })();
  const harness = await pg.evaluate(async () => (await (await fetch("/scripts/t4/harness-t4/main.jsx")).text()));
  for (const id of juegos) {
    const hash = harness.match(new RegExp(`"(#h\\d)": "${id}"`))?.[1];
    if (!hash) { fallos.push(`B1 · ${id}: el banco no tiene un #hN para este juego`); continue; }
    await pg.goto(`${BASE}${hash}`);
    await pg.reload();
    await pg.waitForSelector("[data-partida]", { state: "attached", timeout: 120000 });
    for (const b of await pg.$$("button")) if ((await b.textContent())?.trim() === "Siguiente") { await b.click(); break; }
    /* La interacción: una opción, un constructor, o la figura misma cuando es el tablero (el cajón de H1). */
    await pg.waitForSelector("[data-partida]:not([hidden]) [data-opcion], [data-partida]:not([hidden]) [data-constructor], [data-partida]:not([hidden]) [data-figura]", { timeout: 30000 });
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, { raiz: "[data-partida]", objetivo: "[data-opcion], [data-constructor], [data-figura]" });
    filas.push(`${id} · interacción a ${m.tope} px · ${m.antes} palabras antes`);
    if (m.tope > B1_TOPE) fallos.push(`B1 · ${id}: la interacción empieza a ${m.tope} px del tope de la tarjeta (máximo ${B1_TOPE})`);
    if (m.antes > B1_PALABRAS) fallos.push(`B1 · ${id}: ${m.antes} palabras antes de la interacción (máximo ${B1_PALABRAS})`);
  }
  await pg.close();
}

await navegador.close();
await servidor.close();
console.log(filas.join("\n"));
console.log(fallos.length ? `\n${fallos.length} FALLAN:\n${fallos.join("\n")}` : `\nB1 se cumple en las ${filas.length - filasE2.length} pantallas medidas a ${ANCHO} px, y E2 en los ${filasE2.length} veredictos medidos en la ventana.`);
process.exit(fallos.length ? 1 : 0);
