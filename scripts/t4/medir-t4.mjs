/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE T4 · A0-A5 Y H1 A 320 Y 375? (rediseño de enganche, Célula D)
 *
 *   node scripts/t4/medir-t4.mjs [carpeta-de-capturas]
 *
 * Chromium de verdad, la vista de T4 montada tal cual con la hoja de estilos
 * del sitio (banco scripts/t4/harness-t4). Sustituye a los medidores de las
 * figuras de antes (medir-t4.mjs y medir-t4-h1.mjs), que medían la raya del
 * año y la lista de radios.
 *
 *   · Aprender (A0-A5): cada pantalla al llegar y, con el plan de la sonda
 *     (sonda-enganche/enganche_planes.json), después de cada gesto: errores y
 *     aciertos
 *   · H1: «Así se juega», y la partida entera, un hecho bien y otro mal (el
 *     error, antes y después de que la plata llegue a su sitio), y el cierre
 *
 * En cada estado comprueba:
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del contenido
 *     de la tarjeta
 *   · que ningún renglón `nowrap` se parta (Range.getClientRects)
 *   · que cada control del carril (botones, la pista, los destinos) mida al
 *     menos 44 px de alto. Los compartidos que no llegan se informan aparte:
 *     no son del carril
 *   · que estén cargadas Inter y Sora
 * Y con movimiento reducido, que «Pasar el año» salte al mes 12 sin animar.
 *
 * Las fuentes: si existe sonda-enganche/.sonda-fuentes (fuentes.sh), las sirve
 * de ahí, como la sonda; si no, las pide a Google Fonts.
 *
 * Sale con código 1 si algo falla. Necesita Playwright (no es dependencia del
 * repo): el de la máquina, o el de PLAYWRIGHT_MODULE.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const ANCHOS = [320, 375];
const PLANES = JSON.parse(readFileSync(resolve(RAIZ, "scripts/t4/sonda-enganche/enganche_planes.json"), "utf8"));
const FUENTES = process.env.SONDA_FUENTES ?? resolve(RAIZ, "scripts/t4/sonda-enganche/.sonda-fuentes");
const hayFuentes = existsSync(`${FUENTES}/fontsource-inter-5.3.0`) && existsSync(`${FUENTES}/fontsource-sora-5.3.0`);

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t4/harness-t4/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const compartidos = new Set();
const filas = [];

async function pagina(ancho, reducido = false) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 800 }, deviceScaleFactor: 2, reducedMotion: reducido ? "reduce" : "no-preference" });
  const pg = await ctx.newPage();
  if (hayFuentes) {
    await pg.route("**/*", (route) => {
      const u = route.request().url();
      if (u.includes("/__f/")) {
        const [fam, w] = u.split("/__f/")[1].split("/");
        const base = fam === "Sora" ? `${FUENTES}/fontsource-sora-5.3.0/package/files/sora-latin-` : `${FUENTES}/fontsource-inter-5.3.0/package/files/inter-latin-`;
        return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(`${base}${w.split(".")[0]}-normal.woff2`) });
      }
      if (u.includes("fonts.googleapis.com")) {
        let css = "";
        for (const [fam, ws] of [["Sora", [300, 400, 600, 700, 800]], ["Inter", [400, 500, 600, 700]]]) for (const w of ws) css += `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(/__f/${fam}/${w}.woff2) format('woff2');}\n`;
        return route.fulfill({ status: 200, contentType: "text/css", body: css });
      }
      return route.continue();
    });
  }
  return { ctx, pg };
}

/* En la página: lo que no cabe, lo que se parte, lo que es chico, y las fuentes. */
function medir({ raiz }) {
  const zona = document.querySelector(raiz);
  const sec = zona.closest("section");
  const cs = getComputedStyle(sec);
  const sr = sec.getBoundingClientRect();
  const r2 = (x) => Math.round(x * 100) / 100;
  const veo = (el) => {
    for (let x = el; x && x !== sec.parentElement; x = x.parentElement) {
      const c = getComputedStyle(x);
      if (c.display === "none" || c.visibility === "hidden" || c.opacity === "0") return false;
      if (c.clip && /rect\(0/.test(c.clip)) return false;
    }
    return true;
  };
  const desborda = [], partidos = [], chicos = [], chicosCompartidos = [], desbordaCompartido = [];
  for (const el of sec.querySelectorAll("*")) {
    if (el.matches("style, script") || !veo(el) || el.closest(".t4f-sr")) continue;
    const c = getComputedStyle(el);
    if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
      const r = el.getBoundingClientRect();
      if (r.width > 1) {
        const nombre = `«${el.textContent.trim().slice(0, 32)}»`;
        /* El Encabezado y «Así se juega» son compartidos: lo suyo se informa, no es del carril. */
        const lista = el.closest("[data-encabezado], [data-asi-se-juega] > :not([data-asj-figura])") ? desbordaCompartido : desborda;
        if (c.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) lista.push(`${nombre} ${el.scrollWidth}>${el.clientWidth}`);
        if (r.right > sr.right - parseFloat(cs.paddingRight) + 0.5 || r.left < sr.left + parseFloat(cs.paddingLeft) - 0.5) lista.push(`${nombre} fuera del contenido [${r2(r.left - sr.left)}, ${r2(r.right - sr.left)}]`);
        if (c.whiteSpace === "nowrap") {
          const tops = new Set();
          for (const n of el.childNodes) {
            if (n.nodeType !== 3 || !n.textContent.trim()) continue;
            const rg = document.createRange(); rg.selectNodeContents(n);
            for (const q of rg.getClientRects()) tops.add(Math.round(q.top));
          }
          if (tops.size > 1) partidos.push(nombre);
        }
      }
    }
    if (el.tagName === "BUTTON" || el.getAttribute("role") === "slider") {
      const h = el.getBoundingClientRect().height;
      if (h > 0 && h < 44) {
        const nombre = `«${(el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 24)}» ${r2(h)} px`;
        /* Del carril: lo que está en la pieza o en la partida, fuera del Encabezado y de «Así se juega», que son compartidos. */
        const carril = el.closest("[data-pieza], [data-t4-h1]") && !el.closest("[data-encabezado], [data-asi-se-juega]");
        (carril ? chicos : chicosCompartidos).push(nombre);
      }
    }
  }
  /* Una pastilla con palabra no puede salirse de la casilla o del destino que marca (no puede cruzar la raya ni el borde). */
  for (const mk of sec.querySelectorAll(".t4r-marca")) {
    if (!veo(mk)) continue;
    const caja = mk.closest("button, [data-destino], [data-seg], [data-bandeja]");
    if (!caja) continue;
    const a = mk.getBoundingClientRect(), b = caja.getBoundingClientRect();
    if (a.left < b.left - 0.5 || a.right > b.right + 0.5 || a.top < b.top - 0.5 || a.bottom > b.bottom + 0.5) desborda.push(`pastilla «${mk.textContent.trim()}» fuera de su casilla [${r2(a.left - b.left)}, ${r2(b.right - a.right)}]`);
  }
  const fuentes = document.fonts.check("15px Inter") && document.fonts.check("600 13px Sora");
  return { sw: document.documentElement.scrollWidth, vw: innerWidth, desborda, desbordaCompartido, partidos, chicos, chicosCompartidos, fuentes, alto: r2(sr.height) };
}

async function revisar(pg, raiz, etiqueta, ancho, foto) {
  await pg.evaluate(() => document.fonts.ready);
  const m = await pg.evaluate(medir, { raiz });
  const mal = [];
  if (m.sw > m.vw) mal.push(`barra horizontal: la página mide ${m.sw} en ${m.vw}`);
  for (const x of m.desborda) mal.push(`desborda ${x}`);
  for (const x of m.partidos) mal.push(`renglón partido ${x}`);
  for (const x of m.chicos) mal.push(`control de menos de 44 px ${x}`);
  if (!m.fuentes) mal.push("Inter o Sora no están cargadas");
  for (const x of m.chicosCompartidos) compartidos.add(`control de menos de 44 px ${x} (${etiqueta.split(" · ")[0]})`);
  for (const x of m.desbordaCompartido) compartidos.add(`desborda ${x} (${etiqueta.split(" · ")[0]})`);
  filas.push(`${ancho} · ${etiqueta}: ${mal.length ? "MAL" : "bien"}`);
  for (const x of mal) fallos.push(`${ancho} · ${etiqueta}: ${x}`);
  if (CAPTURAS && foto) {
    const sec = await (await pg.$(raiz)).evaluateHandle((x) => x.closest("section"));
    await sec.asElement().screenshot({ path: resolve(CAPTURAS, `${foto}-${ancho}.png`) });
  }
}

const nombreArchivo = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();

/* ═══════════ APRENDER ═══════════ */
for (const ancho of ANCHOS) {
  const { ctx, pg } = await pagina(ancho);
  await pg.goto(BANCO);
  await pg.waitForSelector("[data-pieza]", { timeout: 120000 });
  for (const [pid, corto] of [["t4-a0-el-activo-corriente", "a0"], ["t4-a1-la-caja", "a1"], ["t4-a2-el-fondo-fijo", "a2"], ["t4-a3-el-arqueo", "a3"], ["t4-a4-bancos-y-notas", "a4"], ["t4-a5-san-calixto", "a5"]]) {
    const R = `[data-pieza="${pid}"]`;
    for (let k = 0; k < 12; k++) {
      const id = await pg.getAttribute(R, "data-pantalla");
      await pg.waitForTimeout(250);
      await revisar(pg, R, `${corto} · P${k} ${id} · llegar`, ancho, `${corto}-p${k}-${id}-llegar`);
      for (const paso of PLANES[pid]?.[id] ?? []) {
        if (paso.click) await pg.click(`${R} ${paso.click}`);
        if (paso.arrastra) {
          const bx = await (await pg.$(`${R} ${paso.arrastra}`)).boundingBox();
          await pg.mouse.move(bx.x + 2, bx.y + bx.height / 2); await pg.mouse.down();
          await pg.mouse.move(bx.x + 2 + bx.width * paso.hasta, bx.y + bx.height / 2, { steps: 8 }); await pg.mouse.up();
        }
        await pg.waitForTimeout((paso.espera ?? 120) + 260);
        if (paso.mide) await revisar(pg, R, `${corto} · P${k} ${id} · ${paso.mide}`, ancho, `${corto}-p${k}-${id}-${nombreArchivo(paso.mide)}`);
      }
      const b = await pg.$(`${R} [data-boton="seguir"]`);
      if (!b) break;
      await b.click();
    }
  }
  await ctx.close();
}

/* ═══════════ H1 ═══════════ */
const hechos = await (async () => {
  const D = await servidor.ssrLoadModule("/src/data/contabilidadT4H1.js");
  return Object.fromEntries(D.ITEMS_H1.map((it) => [it.texto, it]));
})();
for (const ancho of ANCHOS) {
  const { ctx, pg } = await pagina(ancho);
  await pg.goto(`${BANCO}#h1`);
  await pg.waitForSelector("[data-t4-h1-demo]", { timeout: 120000 });
  await pg.waitForTimeout(3600);
  await revisar(pg, "[data-t4-h1-demo]", "h1 · así se juega · tras el toque", ancho, "h1-asi-se-juega");
  for (const b of await pg.$$("button")) if ((await b.textContent())?.trim() === "Siguiente") { await b.click(); break; }
  await pg.waitForSelector("[data-partida]:not([hidden]) [data-t4-h1]");
  const R = "[data-t4-h1]";
  const volver = await pg.$("[data-volver-camino]");
  const altoVolver = (await volver.boundingBox()).height;
  filas.push(`${ancho} · «Volver al camino»: ${Math.round(altoVolver * 100) / 100} px de alto`);
  if (altoVolver < 44) fallos.push(`${ancho} · «Volver al camino» mide ${altoVolver} px de alto`);
  for (let k = 0; k < 8; k++) {
    await pg.waitForTimeout(300);
    const it = hechos[(await pg.textContent(`${R} [data-hecho]`)).trim()];
    await revisar(pg, R, `h1 · hecho ${k + 1} (${it.id}) · llegar`, ancho, k < 2 ? `h1-h${k + 1}-llegar` : null);
    const bien = k % 2 === 0;
    const elegido = bien ? it.respuesta : ["debe", "haber", "no-se-mueve"].find((d) => d !== it.respuesta);
    await pg.click(`${R} [data-destino="${elegido}"]`);
    if (!bien) {
      await pg.waitForTimeout(250);
      await revisar(pg, R, `h1 · hecho ${k + 1} (${it.id}) · error, antes`, ancho, k < 4 ? `h1-h${k + 1}-error-antes` : null);
      await pg.waitForTimeout(700);
      await revisar(pg, R, `h1 · hecho ${k + 1} (${it.id}) · error, después`, ancho, k < 4 ? `h1-h${k + 1}-error-despues` : null);
    } else {
      await pg.waitForTimeout(700);
      await revisar(pg, R, `h1 · hecho ${k + 1} (${it.id}) · acierto`, ancho, k < 4 ? `h1-h${k + 1}-acierto` : null);
    }
    await pg.click(`${R} [data-boton="seguir-hacer"]`);
  }
  await pg.waitForSelector(`${R}[data-fin]`);
  /* La celebración compartida (RecompensaCierre, 1,5 s en «fácil») tapa el cajón mientras dura: se mide después. */
  await pg.waitForTimeout(2200);
  await revisar(pg, R, "h1 · cierre", ancho, "h1-cierre");
  await ctx.close();
}

/* ═══════════ MOVIMIENTO REDUCIDO ═══════════ */
{
  const { ctx, pg } = await pagina(320, true);
  await pg.goto(BANCO);
  await pg.waitForSelector("[data-pieza]", { timeout: 120000 });
  const R = '[data-pieza="t4-a0-el-activo-corriente"]';
  await pg.click(`${R} [data-accion=pasar]`);
  await pg.waitForTimeout(50);
  const r = await pg.evaluate((sel) => ({ mes: document.querySelector(`${sel} [data-figura]`).dataset.mes, animando: document.getAnimations().filter((a) => document.querySelector(sel).contains(a.effect?.target)).length }), R);
  filas.push(`movimiento reducido · A0 «Pasar el año»: a los 50 ms, mes ${r.mes}, ${r.animando} animaciones`);
  if (r.mes !== "12" || r.animando) fallos.push(`movimiento reducido: mes ${r.mes} y ${r.animando} animaciones a los 50 ms`);
  await ctx.close();
}

await navegador.close();
await servidor.close();
console.log(`fuentes: ${hayFuentes ? "las de .sonda-fuentes (@fontsource 5.3.0)" : "Google Fonts"}`);
console.log(filas.join("\n"));
if (compartidos.size) console.log(`\nCompartido, no del carril (se informa, no falla):\n${[...compartidos].join("\n")}`);
console.log(fallos.length ? `\n${fallos.length} FALLAN:\n${fallos.join("\n")}` : `\nA 320 y 375 px: nada se desborda, ningún renglón se parte y todo control del carril mide 44 px o más (${filas.length} medidas).`);
process.exit(fallos.length ? 1 : 0);
