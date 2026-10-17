/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · LA SEGUNDA DECISIÓN DE LAS ACTS. 1 Y 2, MEDIDA EN CHROMIUM.
 *
 * A 320×568 y 375×667, para cada ítem con segunda decisión: al llegar
 * (acertado el grupo o el día), con cada error (a los 0,8 s, ya con «Iba
 * aquí» y la devolución) y con el acierto. En cada estado (Hanayama):
 *   · B1: la primera opción empieza a ≤ 280 px del borde de arriba de la
 *     tarjeta (tope a 320)
 *   · E2: tras el desplazamiento del tramo, la pastilla tocada y el mensaje
 *     caben enteros en la ventana, y el foco también
 *   · que las opciones no cambien de alto ni de sitio (respecto de la
 *     tarjeta) al salir la pastilla
 *   · palabras de la tarjeta, con la regla de canonEnganche.js: solo de
 *     informe, porque B2 es de Aprender y estas piezas son Hacer
 *
 *   node scripts/t3/medir-t3-segunda.mjs [carpeta-de-capturas]
 *
 * Sale con 1 si algo pasa de los topes. Arranca su propio Vite y lo cierra.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { HECHOS_ACT1_T3, SEGUNDA_ACT1_T3, SIN_INGRESO } from "../../src/data/contabilidadTema3Act1.js";
import { ITEMS_ACT2, SEGUNDA_ACT2, HECHO } from "../../src/data/contabilidadTema3Act2.js";
import { UMBRAL_B1_PX } from "../../src/contabilidad/canonEnganche.js";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const FUENTES = "/tmp/claude-0/fuentes/";
const ALTOS = { 320: 568, 375: 667 };

const CASOS = [
  ...HECHOS_ACT1_T3.filter((x) => x.queEs).map((x) => ({
    pieza: "a1", id: x.id, correcta: x.queEs, opciones: SEGUNDA_ACT1_T3.opciones.map((o) => o.id),
    primera: [`[data-grupo="${SIN_INGRESO}"]`, "text=Colocar la ficha"],
  })),
  ...ITEMS_ACT2.filter((x) => x.queda).map((x) => ({
    pieza: "a2", id: x.id, correcta: x.queda, opciones: SEGUNDA_ACT2.opciones.map((o) => o.id),
    primera: [`[data-marca="${x.marcas.find((m) => m.tipo === HECHO).id}"]`],
  })),
];

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const filas = [];
const fallos = [];

async function contexto(ancho) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: ALTOS[ancho] }, deviceScaleFactor: 2 });
  if (existsSync(`${FUENTES}fuentes.css`)) {
    const css = readFileSync(`${FUENTES}fuentes.css`, "utf8");
    await ctx.route("https://fonts.googleapis.com/**", (r) => r.fulfill({ status: 200, contentType: "text/css", body: css }));
    await ctx.route("https://fonts.gstatic.com/**", (r) => {
      const f = r.request().url().replace("https://fonts.gstatic.com/", "").replace(/\//g, "_");
      try { return r.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(FUENTES + f) }); } catch { return r.abort(); }
    });
  }
  return ctx;
}

/* Las medidas del estado actual, en la página. */
const medir = (pg) => pg.evaluate(async () => {
  const C = await import("/src/contabilidad/canonEnganche.js");
  const raiz = document.querySelector("[data-pieza-t3]");
  const tarjeta = C.tarjetaDe(raiz).getBoundingClientRect();
  const ops = [...raiz.querySelectorAll("[data-opcion-segunda]")].map((o) => o.getBoundingClientRect());
  const alto = window.innerHeight;
  const entera = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return r.top >= -0.5 && r.bottom <= alto + 0.5; };
  const pastilla = raiz.querySelector('[data-pastilla="bien"], [data-pastilla="mal"]');
  const mensaje = raiz.querySelector("[data-mensaje-segunda]");
  const foco = document.activeElement && raiz.contains(document.activeElement) ? document.activeElement : null;
  return {
    palabras: C.medirTarjeta(C.tarjetaDe(raiz), window).texto,
    ancho: Math.min(...ops.map((r) => r.width)),
    b1: Math.round((ops[0].top - tarjeta.top) * 10) / 10,
    cajas: ops.map((r) => [Math.round((r.top - tarjeta.top) * 10) / 10, Math.round(r.height * 10) / 10]),
    e2: pastilla ? Boolean(entera(pastilla) && entera(mensaje)) : null,
    foco: foco ? entera(foco) : null,
    quien: foco ? (foco.matches("[data-mensaje-segunda]") ? "mensaje" : foco.tagName === "BUTTON" ? foco.textContent.trim() : foco.tagName) : null,
  };
});

for (const ancho of [320, 375]) {
  const ctx = await contexto(ancho);
  for (const caso of CASOS) {
    const estados = [["al llegar", null], ...caso.opciones.map((o) => [o === caso.correcta ? "acierto" : `error ${o}`, o])];
    let base = null;
    for (const [estado, toque] of estados) {
      const pg = await ctx.newPage();
      await pg.goto(`${BASE}/scripts/t3/harness-segunda/index.html#${caso.pieza}:${caso.id}`);
      await pg.waitForSelector("[data-pieza-t3] section, [data-pieza-t3] [data-contenido], [data-pieza-t3] [data-act2]");
      await pg.evaluate(() => document.fonts.ready);
      for (const s of caso.primera) await pg.click(s);
      await pg.waitForSelector("[data-opcion-segunda]");
      /* 0,7 s para «Iba aquí» y la devolución, y lo que tarde el desplazamiento suave. */
      if (toque) { await pg.click(`[data-opcion-segunda="${toque}"]`); await pg.waitForTimeout(1600); }
      const m = await medir(pg);
      if (!toque) base = m.cajas;
      const quieto = JSON.stringify(m.cajas) === JSON.stringify(base);
      filas.push({ ancho, pieza: caso.pieza, id: caso.id, estado, palabras: m.palabras, ancho_op: Math.round(m.ancho * 10) / 10, b1: m.b1, e2: m.e2, foco: m.quien, quieto });
      const donde = `${ancho} · ${caso.id} · ${estado}`;
      if (ancho === 320 && m.b1 > UMBRAL_B1_PX) fallos.push(`${donde}: B1, la primera opción empieza a ${m.b1} px`);
      if (m.e2 === false) fallos.push(`${donde}: E2, la pastilla tocada o el mensaje no caben enteros en la ventana`);
      if (m.foco === false) fallos.push(`${donde}: el foco quedó fuera de la ventana`);
      if (!quieto) fallos.push(`${donde}: las opciones se movieron al salir la pastilla`);
      if (CAPTURAS) await pg.screenshot({ path: `${CAPTURAS}/${ancho}-${caso.id}-${estado.replace(/\s+/g, "-")}.png`, fullPage: true });
      await pg.close();
    }
  }
  await ctx.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | pieza | ítem | estado | B1 px | E2 | foco | quieto | opción px | palabras (informe)");
const sn = (v) => (v == null ? "—" : v ? "sí" : "NO");
for (const f of filas) console.log(`${f.ancho} | ${f.pieza} | ${f.id} | ${f.estado} | ${f.b1} | ${sn(f.e2)} | ${f.foco ?? "—"} | ${sn(f.quieto)} | ${f.ancho_op} | ${f.palabras}`);
console.log(fallos.length ? `\n${fallos.length} fuera de tope:\n${fallos.join("\n")}` : "\nTodo dentro de los topes.");
process.exit(fallos.length ? 1 : 0);
