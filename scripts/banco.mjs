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
const todas = args.includes("--todas");
/* `--pasos`: en una secuencia de Aprender, recorre pantalla a pantalla con
 * «Siguiente» y mide cada una. Es donde aparece lo que no se ve en la
 * primera: la figura que crece y tapa la navegación. */
const pasos = args.includes("--pasos");
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

if (lista || (!id && !todas)) {
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
    .filter((e) => visible(e) && !e.disabled && getComputedStyle(e).pointerEvents !== "none")
    .map((e) => ({ q: (e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 26), h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) }))
    .filter((t) => t.h < 44);
  /*
   * El filtro lo paga quien mide, no quien arregla (herramientas.md). Fuera:
   *   · lo que está `aria-hidden`, que no es texto que nadie lea;
   *   · lo que no tiene ni una letra ni un dígito —▲ ↑ · — y son glifos, no texto;
   *   · 10,5 px exacto, que es la excepción de cejilla que el canon ya tiene.
   * Sin esto el banco denuncia flechas de 10 px y hace perder la tarde.
   */
  const oculto = (e) => e.closest('[aria-hidden="true"]') !== null;
  const chico = [...raiz.querySelectorAll("*")]
    .filter((e) => e.children.length === 0 && e.textContent.trim() && visible(e) && !oculto(e))
    .filter((e) => /[\p{L}\p{N}]/u.test(e.textContent))
    .map((e) => ({ q: e.textContent.trim().slice(0, 26), px: parseFloat(getComputedStyle(e).fontSize) }))
    .filter((t) => t.px < 12 && t.px !== 10.5);
  /*
   * Ojo con el filtro de hojas: un `span` con un hijo dentro sigue siendo
   * texto, y por mirar solo hojas se me escapó el nombre de actividad cortado
   * del panel docente, que pedía 348 px y tenía 232. Aquí entra todo lo que
   * recorta con «…», tenga hijos o no, salvo lo oculto para lectores.
   */
  const cortados = [...raiz.querySelectorAll("*")]
    .filter((e) => getComputedStyle(e).textOverflow === "ellipsis" && e.scrollWidth > e.clientWidth + 1)
    .filter((e) => e.clientWidth > 2 && !oculto(e))
    .map((e) => `${e.textContent.trim().slice(0, 26)} (pide ${e.scrollWidth}, tiene ${e.clientWidth})`);
  return {
    alto: Math.round(raiz.getBoundingClientRect().height),
    desborde: document.documentElement.scrollWidth > innerWidth,
    toque, chico, cortados,
  };
};

/* `--todas`: todo el catálogo de una pasada, con un solo vite y un solo Chromium. */
if (todas) {
  const [w, h] = ANCHOS[0];
  const ctx = await navegador.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const pg0 = await ctx.newPage();
  await pg0.goto(BANCO, { waitUntil: "networkidle" });
  const catalogo = await pg0.evaluate(() => window.__CATALOGO ?? []);
  await pg0.close();
  console.log(`${catalogo.length} piezas a ${w} px. Solo se imprime lo que tiene algo.\n`);
  let limpias = 0;
  for (const j of catalogo) {
    const pg = await ctx.newPage();
    const fallos = [];
    pg.on("pageerror", (e) => fallos.push(String(e).slice(0, 120)));
    try {
      await pg.goto(`${BANCO}#${encodeURIComponent(j.id)}`, { waitUntil: "networkidle", timeout: 20000 });
      await pg.waitForTimeout(700);
      await pg.evaluate(() => document.fonts.ready);
      const r = await pg.evaluate(medir);
      const avisos = [];
      if (r.alto === 0) avisos.push("NO PINTA NADA");
      if (r.desborde) avisos.push("desborde horizontal");
      for (const t of r.toque) avisos.push(`toque ${t.h}px «${t.q}»`);
      for (const t of r.chico) avisos.push(`texto ${t.px}px «${t.q}»`);
      if (r.cortados.length) avisos.push(`cortados: ${r.cortados.join(", ")}`);
      if (fallos.length) avisos.push(`error: ${fallos[0]}`);
      if (avisos.length) console.log(`${j.id.padEnd(32)} ${String(r.alto).padStart(4)} px · ${avisos.join(" · ")}`);
      else limpias++;
    } catch (e) {
      console.log(`${j.id.padEnd(32)}    — · no se pudo abrir: ${String(e).slice(0, 80)}`);
    }
    await pg.close();
  }
  console.log(`\nSin reproches: ${limpias} de ${catalogo.length}.`);
  await navegador.close(); await servidor.close();
  process.exit(0);
}

if (pasos) {
  for (const [w, h] of ANCHOS) {
    const ctx = await navegador.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    const fallos = [];
    pg.on("pageerror", (e) => fallos.push(String(e).slice(0, 120)));
    await pg.goto(`${BANCO}#${encodeURIComponent(id)}`, { waitUntil: "networkidle" });
    await pg.waitForTimeout(800);
    await pg.evaluate(() => document.fonts.ready);
    console.log(`\n=== ${id} · ${w}×${h} · pantalla a pantalla ===`);
    let n = 0, igual = 0, antes = "";
    while (n < 60) {
      n += 1;
      const r = await pg.evaluate(medir);
      const titular = await pg.evaluate(() => document.querySelector("h2")?.textContent?.trim().slice(0, 40) ?? "");
      const avisos = [];
      if (r.desborde) avisos.push("desborde horizontal");
      for (const t of r.toque) avisos.push(`toque ${t.h}px «${t.q}»`);
      for (const t of r.chico) avisos.push(`texto ${t.px}px «${t.q}»`);
      if (r.cortados.length) avisos.push(`cortados: ${r.cortados.join(", ")}`);
      /* Lo que más duele en una secuencia: que algo quede por debajo del pliegue
       * o encima de la navegación. Se mide contra el alto de la ventana. */
      const nav = await pg.evaluate((alto) => {
        const b = [...document.querySelectorAll("button")].find((x) => /^Siguiente/.test(x.textContent.trim()));
        if (!b) return null;
        const r = b.getBoundingClientRect();
        const tapado = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
        return { y: Math.round(r.top + scrollY), fuera: Math.round(r.top + scrollY + r.height) > alto, tapado: tapado && !b.contains(tapado) && tapado !== b ? (tapado.tagName + "." + (tapado.className || "").toString().slice(0, 20)) : null };
      }, h);
      if (nav?.tapado) avisos.push(`«Siguiente» tapado por ${nav.tapado}`);
      console.log(`  ${String(n).padStart(2)} · ${String(r.alto).padStart(4)} px · «${titular}»${avisos.length ? " · " + avisos.join(" · ") : ""}`);
      if (!nav) break;
      const avanzo = await pg.evaluate(() => {
        const b = [...document.querySelectorAll("button")].find((x) => /^Siguiente/.test(x.textContent.trim()));
        if (!b || b.disabled) return false;
        b.click(); return true;
      });
      if (!avanzo) break;
      await pg.waitForTimeout(700);
      /*
       * Una pantalla de Haz no deja pasar sin respuesta válida, y eso está
       * bien: «Siguiente» se pulsa y no avanza. Si la pantalla no cambia dos
       * veces seguidas, es eso y no un cuelgue. Se dice y se para.
       */
      const ahora = await pg.evaluate(() => (document.querySelector("h2")?.textContent ?? "") + "|" + document.body.scrollHeight);
      igual = ahora === antes ? igual + 1 : 0;
      antes = ahora;
      if (igual >= 1) { console.log(`     ⤷ se detiene aquí: la pantalla pide una respuesta para seguir (es lo esperado en un Haz)`); break; }
    }
    if (fallos.length) console.log(`  errores de la página: ${fallos.join(" | ")}`);
    await ctx.close();
  }
  await navegador.close(); await servidor.close();
  process.exit(0);
}

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
