/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ABRIR Y MEDIR CUALQUIER PIEZA, POR SU ID.
 *
 *   node scripts/banco.mjs --lista                   qué piezas hay
 *   node scripts/banco.mjs cu-izquierda-o-derecha    la mide a 320 y 375
 *   node scripts/banco.mjs <id> --ancho 320          solo a un ancho
 *   node scripts/banco.mjs <id> --foto               deja la captura en /tmp
 *
 * QUÉ MIDE, que es la lista de lo que más se nos ha roto: el alto de la pieza,
 * si hay desborde horizontal, los controles por debajo de 44 px de toque, el
 * texto por debajo de 12 px, y los textos cortados con «…». No sustituye a la
 * medición de la célula: sirve para abrir una pieza que no es tuya en veinte
 * segundos y ver si hay algo obvio.
 *
 * CUIDADO CON `--foto`: la captura es de página entera, y en una pieza cuya
 * demo se mueve sola el navegador cose la imagen mientras el contenido cambia,
 * así que pueden salir dos estados a la vez y parecer que un botón tapa algo.
 * Me pasó con `t1-la-ecuacion-en-movimiento`: la foto enseñaba «Siguiente»
 * encima de las opciones y las cajas no se tocan (`solapan: []`). **La
 * geometría manda sobre la foto**: antes de denunciar un solape, compáralo con
 * `getBoundingClientRect`.
 *
 * NO PIDE EXPORTAR NADA. Nueve de las trece vistas ya exportan su `JUEGOS`; a
 * las otras cuatro les añade el `export` al vuelo, solo mientras sirve el
 * banco. No toca el repo y no crea una segunda lista de ids.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/npm-tools/node_modules/playwright");

const args = process.argv.slice(2);
const sueltos = args.filter((a, i) => !a.startsWith("--") && !(args[i - 1] === "--ancho"));
const id = sueltos[0] ?? "";
const lista = args.includes("--lista");
const foto = args.includes("--foto");
const iAncho = args.findIndex((a) => a === "--ancho" || a.startsWith("--ancho="));
const unAncho = iAncho < 0 ? NaN : Number(args[iAncho].includes("=") ? args[iAncho].split("=")[1] : args[iAncho + 1]);
const ANCHOS = Number.isNaN(unAncho) ? [[320, 568], [375, 667]] : [[unAncho, 667]];

/* El `export` que les falta a cuatro vistas, puesto solo en memoria. */
const exportarJuegos = {
  name: "exportar-juegos",
  enforce: "pre",
  transform(code, ruta) {
    if (!/src\/components\/[^/]+View\.jsx$/.test(ruta)) return null;
    if (!/^const JUEGOS = \[/m.test(code)) return null;
    return { code: code.replace(/^const JUEGOS = \[/m, "export const JUEGOS = ["), map: null };
  },
};

const servidor = await createServer({
  root: new URL("..", import.meta.url).pathname,
  logLevel: "error",
  plugins: [exportarJuegos],
  server: { port: 0, host: "127.0.0.1" },
});
await servidor.listen();
const BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/banco/index.html`;

const navegador = await chromium.launch();

if (lista || !id) {
  const pg = await (await navegador.newContext({ viewport: { width: 375, height: 667 } })).newPage();
  await pg.goto(BANCO, { waitUntil: "networkidle" });
  const catalogo = await pg.evaluate(() => window.__CATALOGO ?? []);
  console.log(`${catalogo.length} piezas:`);
  for (const j of catalogo) console.log(`  ${j.id.padEnd(34)} ${j.vista}`);
  await navegador.close(); await servidor.close();
  process.exit(0);
}

const medir = () => {
  const raiz = document.querySelector("[data-pieza]") ?? document.body;
  const visible = (e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0;
  const toque = [...raiz.querySelectorAll('button, [role="button"], a[href], input, select')]
    .filter(visible)
    .map((e) => ({ q: (e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 26), h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) }))
    .filter((t) => t.h < 44);
  const chico = [...raiz.querySelectorAll("*")]
    .filter((e) => e.children.length === 0 && e.textContent.trim() && visible(e))
    .map((e) => ({ q: e.textContent.trim().slice(0, 26), px: parseFloat(getComputedStyle(e).fontSize) }))
    .filter((t) => t.px < 12);
  const cortados = [...raiz.querySelectorAll("*")]
    .filter((e) => getComputedStyle(e).textOverflow === "ellipsis" && e.scrollWidth > e.clientWidth + 1)
    .map((e) => e.textContent.trim().slice(0, 26));
  return {
    alto: Math.round(raiz.getBoundingClientRect().height),
    desborde: document.documentElement.scrollWidth > innerWidth,
    toque, chico, cortados,
  };
};

for (const [w, h] of ANCHOS) {
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const fallos = [];
  pg.on("pageerror", (e) => fallos.push(String(e).slice(0, 160)));
  await pg.goto(`${BANCO}#${encodeURIComponent(id)}`, { waitUntil: "networkidle" });
  await pg.waitForTimeout(900);
  await pg.evaluate(() => document.fonts.ready);
  const fuentes = await pg.evaluate(() => document.fonts.check("14px Inter") && document.fonts.check("700 17px Sora"));
  const r = await pg.evaluate(medir);

  console.log(`\n=== ${id} · ${w}×${h} ===  alto ${r.alto} px · desborde horizontal: ${r.desborde ? "SÍ" : "no"} · fuentes de producción: ${fuentes ? "sí" : "NO (la medida de ancho no vale)"}`);
  if (fallos.length) console.log(`  errores de la página: ${fallos.join(" | ")}`);
  if (r.toque.length) { console.log(`  toque por debajo de 44 px (${r.toque.length}):`); for (const t of r.toque) console.log(`    ${String(t.h).padStart(3)} px de alto · ${t.w} de ancho · «${t.q}»`); }
  if (r.chico.length) { console.log(`  texto por debajo de 12 px (${r.chico.length}):`); for (const t of r.chico) console.log(`    ${t.px} px · «${t.q}»`); }
  if (r.cortados.length) console.log(`  cortados con «…» (${r.cortados.length}): ${r.cortados.join(" · ")}`);
  if (!r.toque.length && !r.chico.length && !r.cortados.length && !r.desborde && !fallos.length) console.log("  sin reproches en lo que mide este banco");

  if (foto) { const ruta = `/tmp/banco-${id}-${w}.png`; writeFileSync(ruta, await pg.screenshot({ fullPage: true })); console.log(`  captura: ${ruta}`); }
  await ctx.close();
}

await navegador.close();
await servidor.close();
