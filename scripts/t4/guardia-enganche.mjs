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
 * La P0 no tiene parada propia: con la línea de objetivo (D2) su figura queda
 * entre 110 y 130 px a 320, y Yujiro dejó su parada en la de B1, ≤ 280 (16
 * oct 2026; antes, en el lote B, era 84 ± 22).
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
 * Y E2 de los Hacer (decisión de Yujiro sobre la parada de medición del bloque
 * P2 de Hanayama, con la revisión de hanayama-p2-lote-b.md §6): en las mismas
 * dos ventanas, cada tarjeta de cada Hacer se juega bien y mal con la clave de
 * la sonda (enganche_clave.mjs, con el gesto del estudiante: cada control
 * pegado al borde de abajo antes de tocarlo), y con la vista quieta y lo que
 * iba ya escrito, la pastilla tocada más alta queda con su tope dentro de la
 * ventana y el pie de la devolución también: las dos A LA VEZ.
 *
 * Y los SOLAPES (Shibukawa, auditoría del #308; Yujiro): en las mismas dos
 * ventanas, al llegar, tras cada veredicto y al final de cada pantalla de
 * Aprender, y tras cada tarjeta de cada Hacer, ninguna pastilla
 * (`.t4r-marca`) ni título (el de la pieza y los nombres del cajón y de la
 * bandeja) queda tapado por otro elemento, cruzado por un borde o una raya
 * ajena, ni cortado por un contenedor que recorta.
 *
 * Sale con código 1 si algo falla. Necesita Playwright.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
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
  for (const [k, paso] of (plan ?? []).entries()) {
    /* El control del paso tiene que estar: si no llega, se nombra la pantalla y el paso, en vez de caerse. */
    const objetivo = paso.click ?? paso.arrastra;
    if (objetivo && !(await pg.waitForSelector(`${sel} ${objetivo}`, { state: "visible", timeout: 8000 }).catch(() => null))) {
      const id = await pg.getAttribute(sel, "data-pantalla").catch(() => "?");
      fallos.push(`plan · ${sel} · ${id} · paso ${k + 1}: no aparece ${objetivo}`);
      return false;
    }
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

/*
 * En la página: lo que tapa, cruza o corta una pastilla o un título dentro de
 * `sel`. Tapado: en un punto de su caja, lo de más arriba es otro elemento
 * (ni ella, ni algo suyo, ni algo que la contiene). Cruzado: un borde visible
 * de otro elemento, o una raya (un elemento de 3 px o menos con fondo), pasa
 * por dentro de su caja. Cortado: un contenedor con overflow que recorta no
 * la contiene entera.
 */
export const SOLAPABLES = '.t4r-marca, .t4cv-nombre, .t4cv-caja2-n, .t4cv-band > span:first-child, [data-titulo-pieza], .t4r-titulo';
function solapes({ sel, objetivos }) {
  const raiz = document.querySelector(sel);
  if (!raiz) return [];
  const salida = [];
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 1 && r.height > 1 && cs.visibility !== "hidden" && cs.opacity !== "0"; };
  const nombre = (el) => (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40) || el.className;
  const opaco = (c) => c && c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c);
  const blancos = [...raiz.querySelectorAll(objetivos)].filter(visible);
  const todos = [...raiz.querySelectorAll("*")].filter(visible);
  for (const t of blancos) {
    t.scrollIntoView({ block: "center", behavior: "instant" });
    const r = t.getBoundingClientRect();
    const dentro = { l: r.left + 1.5, r: r.right - 1.5, t: r.top + 1.5, b: r.bottom - 1.5 };
    /* Tapado */
    const puntos = [[(r.left + r.right) / 2, (r.top + r.bottom) / 2], [dentro.l + 1, dentro.t + 1], [dentro.r - 1, dentro.t + 1], [dentro.l + 1, dentro.b - 1], [dentro.r - 1, dentro.b - 1]];
    for (const [x, y] of puntos) {
      const e = document.elementFromPoint(x, y);
      if (e && e !== t && !t.contains(e) && !e.contains(t)) { salida.push(`«${nombre(t)}» queda tapado por «${nombre(e)}»`); break; }
    }
    /* Cruzado */
    for (const e of todos) {
      if (e === t || t.contains(e) || e.contains(t)) continue;
      const q = e.getBoundingClientRect();
      if (q.right < r.left || q.left > r.right || q.bottom < r.top || q.top > r.bottom) continue;
      const cs = getComputedStyle(e);
      const rayas = [];
      const lado = (w, c) => parseFloat(w) > 0 && cs.borderStyle !== "none" && opaco(c);
      if (lado(cs.borderTopWidth, cs.borderTopColor)) rayas.push({ y: q.top, x0: q.left, x1: q.right });
      if (lado(cs.borderBottomWidth, cs.borderBottomColor)) rayas.push({ y: q.bottom, x0: q.left, x1: q.right });
      if (lado(cs.borderLeftWidth, cs.borderLeftColor)) rayas.push({ x: q.left, y0: q.top, y1: q.bottom });
      if (lado(cs.borderRightWidth, cs.borderRightColor)) rayas.push({ x: q.right, y0: q.top, y1: q.bottom });
      if (opaco(cs.backgroundColor) && (q.height <= 3 || q.width <= 3)) rayas.push(q.height <= 3 ? { y: (q.top + q.bottom) / 2, x0: q.left, x1: q.right } : { x: (q.left + q.right) / 2, y0: q.top, y1: q.bottom });
      const cruza = rayas.some((k) => (k.y != null
        ? k.y > dentro.t && k.y < dentro.b && Math.min(k.x1, dentro.r) - Math.max(k.x0, dentro.l) > 2
        : k.x > dentro.l && k.x < dentro.r && Math.min(k.y1, dentro.b) - Math.max(k.y0, dentro.t) > 2));
      if (cruza) { salida.push(`«${nombre(t)}» queda cruzado por un borde de «${nombre(e)}»`); break; }
    }
    /* Cortado */
    for (let a = t.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflowX === "visible" && cs.overflowY === "visible") continue;
      const q = a.getBoundingClientRect();
      if (r.left < q.left - 0.5 || r.right > q.right + 0.5 || r.top < q.top - 0.5 || r.bottom > q.bottom + 0.5) { salida.push(`«${nombre(t)}» queda cortado por «${nombre(a)}»`); break; }
    }
  }
  return [...new Set(salida)];
}
const filasS = [];
async function mirarSolapes(pg, sel, lugar) {
  const s = await pg.evaluate(solapes, { sel, objetivos: SOLAPABLES });
  filasS.push(`${lugar}: ${s.length ? s.join("; ") : "sin solapes"}`);
  for (const x of s) fallos.push(`SOLAPE · ${lugar}: ${x}`);
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
      await mirarSolapes(pg, sel, `${ventana.width}×${ventana.height} · ${pz} · ${id} · al llegar`);
      await jugarPlan(pg, sel, PLANES[pz][id], async (paso) => {
        await mirarSolapes(pg, sel, `${ventana.width}×${ventana.height} · ${pz} · ${id} · ${paso.mide}`);
        const d = await pg.evaluate(devolucion, sel);
        const lugar = `E2 · ${ventana.width}×${ventana.height} · ${pz} · ${id} · ${paso.mide}`;
        if (!d) { fallos.push(`${lugar}: no hay devolución`); return; }
        filasE2.push(`${lugar}: devolución de ${d.top} a ${d.bottom} px (ventana ${d.alto})`);
        if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `e2-${ventana.width}x${ventana.height}-${pz}-${id}-${paso.mide.replace(/[^\p{L}\p{N}]+/gu, "-")}.png`) });
        if (d.top < -0.5 || d.bottom > d.alto + 0.5) fallos.push(`${lugar}: la devolución va de ${d.top} a ${d.bottom} px y la ventana mide ${d.alto}`);
      });
      await pg.waitForTimeout(400);
      await mirarSolapes(pg, sel, `${ventana.width}×${ventana.height} · ${pz} · ${id} · al final`);
      const b = await pg.$(`${sel} [data-boton="seguir"]`);
      if (!b) break;
      await b.click();
    }
  }
  await pg.close();
}
filas.push(...filasE2);

/* ═══════════ E2 DE LOS HACER: LA PASTILLA TOCADA Y LA DEVOLUCIÓN, A LA VEZ ═══════════ */
const CLAVE = JSON.parse(execFileSync(process.execPath, [resolve(RAIZ, "scripts/t4/sonda-enganche/enganche_clave.mjs"), RAIZ], { encoding: "utf8" }));
const SIGLA = { "t4-entra-o-sale-de-caja": "H1", "t4-se-mueve-la-caja-menor": "H3", "t4-el-arqueo-de-rosa": "H4", "t4-concilia-la-cuenta": "H7", "t4-se-asienta-o-no": "H8" };
const ESPERA_REVELA = 700 + 900;
/* En la página: la caja de un elemento contra la ventana. */
const r1 = (x) => Math.round(x * 10) / 10;
const caja = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top * 10) / 10, bottom: Math.round(r.bottom * 10) / 10 }; };
const filasE2H = [];
for (const ventana of E2_VENTANAS) {
  const pg = await navegador.newPage({ viewport: ventana, deviceScaleFactor: 2 });
  await pg.goto(BASE);
  await pg.waitForSelector("[data-pieza]", { timeout: 120000 });
  const harness = await pg.evaluate(async () => (await (await fetch("/scripts/t4/harness-t4/main.jsx")).text()));
  for (const [id, s] of Object.entries(SIGLA)) {
    const K = CLAVE[s];
    const hash = harness.match(new RegExp(`"(#h\\d)": "${id}"`))?.[1];
    if (!K || !hash) { fallos.push(`E2 · ${id}: sin clave o sin #hN en el banco`); continue; }
    const R = `[data-t4-${s.toLowerCase()}]`;
    await pg.goto(`${BASE}${hash}`);
    await pg.reload();
    await pg.waitForSelector("[data-partida]", { state: "attached", timeout: 120000 });
    for (const b of await pg.$$("button")) if ((await b.textContent())?.trim() === "Siguiente") { await b.click(); break; }
    await pg.waitForSelector(R, { timeout: 30000 });
    for (const modo of ["bien", "mal"]) {
    if (modo === "mal") {
      await pg.goto(`${BASE}${hash}`);
      await pg.reload();
      await pg.waitForSelector("[data-partida]", { state: "attached", timeout: 120000 });
      for (const b of await pg.$$("button")) if ((await b.textContent())?.trim() === "Siguiente") { await b.click(); break; }
      await pg.waitForSelector(R, { timeout: 30000 });
    }
    let n = 0;
    for (let vuelta = 0; vuelta < 40; vuelta++) {
      const estado = await pg.evaluate((R) => { const r = document.querySelector(R); return r && !r.hasAttribute("data-fin") ? { e: r.dataset.etapa ?? r.dataset.fase ?? "", serie: r.dataset.serie ?? "", campos: r.querySelectorAll("[data-campo] input").length } : null; }, R);
      if (!estado) break;
      n += 1;
      const tocar = async (sel) => {
        await pg.$eval(`${R} ${sel}`, (el) => el.scrollIntoView({ block: "end", behavior: "instant" }));
        await pg.click(`${R} ${sel}`);
        await pg.waitForTimeout(80);
      };
      if (estado.campos) {
        const c = K.saldos[estado.serie][modo].campos;
        for (const [k, v] of Object.entries(c)) { await pg.$eval(`${R} [data-campo="${k}"] input`, (el) => el.scrollIntoView({ block: "end", behavior: "instant" })); await pg.fill(`${R} [data-campo="${k}"] input`, String(v)); }
        await tocar('[data-boton="comprobar"] button');
      } else {
        let carta = (await pg.textContent(`${R} ${K.tarjeta}`)).replace(/\s+/g, " ").trim();
        if (K.subtarjeta) carta = `${carta}::${await pg.getAttribute(`${R} ${K.subtarjeta}`, "data-tarjeta-pregunta")}`;
        if (K.porEtapa) carta = `${estado.e}::${carta}`;
        const g = K.items[carta]?.[modo];
        if (!g) { fallos.push(`E2 · ${id}: la clave no reconoce «${carta.slice(0, 50)}»`); break; }
        for (const x of g.toques ?? [g.destino != null ? `[data-destino="${g.destino}"]` : `[data-opcion="${g.opcion}"]`]) await tocar(x);
        if (g.comprobar) await tocar('[data-boton="comprobar"] button');
      }
      await pg.waitForTimeout(modo === "mal" ? ESPERA_REVELA : 500);
      let y = -1;
      for (let i = 0; i < 40; i++) { const y2 = await pg.evaluate(() => scrollY); if (y2 === y) break; y = y2; await pg.waitForTimeout(80); }
      const m = await pg.evaluate((R) => {
        const raiz = document.querySelector(R);
        const ms = raiz.querySelectorAll("[data-mensaje]");
        const d = ms[ms.length - 1]?.getBoundingClientRect();
        const ps = [...raiz.querySelectorAll('.t4r-marca[data-marca="bien"], .t4r-marca[data-marca="mal"]')].map((p) => p.getBoundingClientRect().top);
        const r1 = (x) => Math.round(x * 10) / 10;
        const bs = [...raiz.querySelectorAll("[data-avance-t4] button")];
        const b = bs[bs.length - 1]?.getBoundingClientRect();
        const a = document.activeElement;
        const f = a && a !== document.body ? a.getBoundingClientRect() : null;
        const foco = !a || a === document.body ? "nada" : bs.includes(a) ? "boton" : a === ms[ms.length - 1] ? "devolucion" : `${a.tagName.toLowerCase()}${a.dataset.boton ? `[${a.dataset.boton}]` : ""}`;
        return { pie: d ? r1(d.bottom) : null, topeDevolucion: d ? r1(d.top) : null, pastilla: ps.length ? r1(Math.min(...ps)) : null, alto: innerHeight,
          boton: b ? { top: r1(b.top), bottom: r1(b.bottom) } : null, foco, focoCaja: f ? { top: r1(f.top), bottom: r1(f.bottom) } : null };
      }, R);
      const lugar = `E2 · ${ventana.width}×${ventana.height} · ${id} · ${modo === "bien" ? "acierto" : "error"} · tarjeta ${n}${estado.e ? ` (etapa ${estado.e})` : ""}`;
      if (m.pie == null) fallos.push(`${lugar}: no hay devolución`);
      else {
        const tope = m.pastilla ?? m.topeDevolucion;
        if (tope < -0.5) fallos.push(`${lugar}: la pastilla tocada más alta empieza en ${tope} px, fuera de la ventana`);
        if (m.pie > m.alto + 0.5) fallos.push(`${lugar}: el pie de la devolución queda en ${m.pie} px y la ventana mide ${m.alto}`);
        /*
         * El botón de avance (decisión de Yujiro tras la FALLA E2 de Shibukawa en 35348c3): si el tramo de la
         * pastilla al pie del botón cabe en la ventana menos 16 px, el botón queda entero a la vista y con el foco.
         * Si no, el foco está en la devolución y el botón es el siguiente Tab. En todo caso, el foco dentro de la ventana.
         */
        if (!m.boton) fallos.push(`${lugar}: no hay botón de avance`);
        else {
          const cabe = m.boton.bottom - tope <= m.alto - 16 + 0.5;
          if (cabe && (m.boton.bottom > m.alto + 0.5 || m.boton.top < -0.5)) fallos.push(`${lugar}: el tramo hasta el botón cabe (${r1(m.boton.bottom - tope)} px), pero el botón queda en ${m.boton.top}-${m.boton.bottom} con la ventana en ${m.alto}`);
          if (cabe && m.foco !== "boton") fallos.push(`${lugar}: el tramo hasta el botón cabe y el foco está en ${m.foco}, no en el botón`);
          if (!cabe && m.foco !== "devolucion") fallos.push(`${lugar}: el tramo hasta el botón no cabe y el foco está en ${m.foco}, no en la devolución`);
          if (!m.focoCaja || m.focoCaja.top < -0.5 || m.focoCaja.top > m.alto - 8) fallos.push(`${lugar}: el foco (${m.foco}) queda fuera de la ventana (${m.focoCaja ? `${m.focoCaja.top}-${m.focoCaja.bottom}` : "sin caja"}, ventana ${m.alto})`);
          if (!cabe && m.foco === "devolucion") {
            await pg.keyboard.press("Tab");
            const sigue = await pg.evaluate((R) => { const bs = [...document.querySelector(R).querySelectorAll("[data-avance-t4] button")]; return bs.includes(document.activeElement); }, R);
            if (!sigue) fallos.push(`${lugar}: desde la devolución, el siguiente Tab no llega al botón de avance`);
          }
          filasE2H.push(`${lugar}: pastilla desde ${m.pastilla ?? "—"}, devolución hasta ${m.pie}, botón hasta ${m.boton.bottom}, foco en ${m.foco} (ventana ${m.alto})`);
        }
      }
      await mirarSolapes(pg, R, `${ventana.width}×${ventana.height} · ${id} · ${modo === "bien" ? "acierto" : "error"} · tarjeta ${n}`);
      if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `e2h-${ventana.width}x${ventana.height}-${s}-${modo}-${n}.png`) });
      const sig = await pg.$(`${R} [data-boton="seguir-hacer"] button`);
      if (!sig) break;
      await sig.click();
      await pg.waitForTimeout(250);
    }
    }
  }
  await pg.close();
}
filas.push(...filasE2H);
filasE2.push(...filasE2H);

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
console.log(filasS.join("\n"));
console.log(fallos.length ? `\n${fallos.length} FALLAN:\n${fallos.join("\n")}` : `\nB1 se cumple en las ${filas.length - filasE2.length} pantallas medidas a ${ANCHO} px, E2 en los ${filasE2.length} veredictos medidos en la ventana, y no hay solapes en los ${filasS.length} estados mirados.`);
process.exit(fallos.length ? 1 : 0);
