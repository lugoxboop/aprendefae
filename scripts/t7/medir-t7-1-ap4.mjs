/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO Y CADA CIFRA DE AP4 «EL CIERRE EN PERIÓDICO» A 375 Y 320?
 *
 *   node scripts/t7/medir-t7-1-ap4.mjs [carpeta-de-capturas]
 *
 * El RECORTE del lote 1 (ocho pantallas). Chromium de verdad, la vista de
 * T7-1 montada tal cual con la hoja de estilos del sitio. Juega AP4 entera:
 * apuesta (antes y después de elegir), la ficha con las operaciones plegadas
 * y abiertas, el cierre (colocando, lleno, error, otros asientos abiertos,
 * acierto), P4 y P6 con cada opción equivocada y el acierto, cada utilidad
 * de P5 abierta, y el resumen. En cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún texto se salga de su caja (scrollWidth) ni del panel
 *   · que se hayan medido Inter y Sora, no la fuente de reserva
 *   · que cada cifra quepa en su celda o su casilla, sin el relleno
 *   · que cada botón a la vista mida 44 px de alto o más (salvo el «¿Por
 *     qué?», que va en línea con su área de toque por fuera)
 *   · en P6, que la tabla de los tres métodos esté apilada (patrón v3.2)
 *
 * Google Fonts no se alcanza desde la máquina de medida: si existe la carpeta
 * de FUENTES (por omisión /tmp/claude-0/fuentes, con su fuentes.css), Inter y
 * Sora se sirven desde ahí. Sale con código 1 si algo falla. Necesita
 * Playwright (no es dependencia del repo): el de la máquina, o el de
 * PLAYWRIGHT_MODULE; Chromium en CHROMIUM_PATH.
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
const ANCHOS = [375, 320];
const AP4 = '[data-pieza="t7-1-a4-el-cierre-en-periodico"]';
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes/";

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t7/harness/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const filas = [];

async function pagina(opciones) {
  const ctx = await navegador.newContext(opciones);
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
  return ctx.newPage();
}

function medir(sel) {
  const pieza = document.querySelector(sel);
  const panel = pieza.closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...panel.querySelectorAll("*")]
    .filter((el) => !el.closest(".t7a4-sr") && !el.matches("style, script"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (getComputedStyle(el).display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > caja.right + 0.5 || r.left < caja.left - 0.5) problemas.push(`${nombre}: se sale del panel`);
  }
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);

  /* Cada cifra, dentro del área útil de su celda o su casilla. */
  let holgura = Infinity;
  const celdas = [...pieza.querySelectorAll(".t7a4-as-r .t7a4-g2 > [role=cell], .t7a4-er-dato, .t7a4-cas")].filter((c) => c.textContent.trim());
  for (const c of celdas) {
    const t = [...c.childNodes].find((x) => x.nodeType === 3 ? x.textContent.trim() : !x.matches(".t7a4-marca") && x.textContent.trim());
    if (!t) continue;
    const e = getComputedStyle(c), cr = c.getBoundingClientRect();
    let util = cr.width - parseFloat(e.paddingLeft) - parseFloat(e.paddingRight) - parseFloat(e.borderLeftWidth) - parseFloat(e.borderRightWidth);
    /* En P6 el span se ajusta a su texto: lo que cuenta es su celda, menos el nombre del método y el hueco. */
    if (c.matches(".t7a4-er-dato")) {
      const celda = c.parentElement, ce = getComputedStyle(celda), cap = celda.querySelector(".t7a4-er-cap");
      const capAncho = cap && getComputedStyle(cap).display !== "none" ? cap.getBoundingClientRect().width + parseFloat(ce.columnGap || 0) : 0;
      util = celda.getBoundingClientRect().width - capAncho - parseFloat(e.paddingLeft) - parseFloat(e.paddingRight);
    }
    const rg = document.createRange(); rg.selectNodeContents(t); const ancho = rg.getBoundingClientRect().width;
    holgura = Math.min(holgura, util - ancho);
    if (ancho > util + 0.5) problemas.push(`«${t.textContent.trim()}»: la cifra mide ${ancho.toFixed(1)} px y caben ${util.toFixed(1)}`);
  }
  /* Cada botón a la vista, 44 px de alto o más. */
  let botonMasBajo = Infinity;
  for (const b of pieza.querySelectorAll("button:not([data-por-que])")) {
    const r = b.getBoundingClientRect();
    if (!r.width) continue;
    botonMasBajo = Math.min(botonMasBajo, r.height);
    if (r.height < 43.99) problemas.push(`botón «${b.textContent.trim().slice(0, 30)}»: mide ${r.height.toFixed(1)} px de alto`);
  }
  /* P6: apilada en los dos teléfonos. */
  const head = pieza.querySelector(".t7a4-er-head");
  const apilada = head ? getComputedStyle(head).display === "none" : null;
  if (head && !apilada) problemas.push("la tabla de los tres métodos no está apilada");
  return {
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    alto: Math.round(pieza.getBoundingClientRect().height),
    holgura: Number.isFinite(holgura) ? Math.round(holgura * 10) / 10 : null,
    boton: Number.isFinite(botonMasBajo) ? Math.round(botonMasBajo * 10) / 10 : null,
    apilada,
    fuentes: document.fonts.check("15px Inter") && document.fonts.check("600 13px Sora"),
  };
}

const correctas = { "el-costo-de-lo-vendido": "vendida", "lado-a-lado": "bajo-y-alta" };
const lado = { inicial: "haber", final: "debe" };

for (const ancho of ANCHOS) {
  const pg = await pagina({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
  await pg.goto(URL_BANCO);
  await pg.waitForSelector(AP4);
  let n = 0;
  const estado = async (nombre) => {
    await pg.evaluate(() => document.fonts.ready);
    const m = await pg.evaluate(medir, AP4);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora`);
    if (CAPTURAS) {
      const panel = await (await pg.$(AP4)).evaluateHandle((x) => x.closest("section"));
      await panel.asElement().screenshot({ path: resolve(CAPTURAS, `ap4-${ancho}-${String(++n).padStart(2, "0")}-${nombre}.png`) });
    }
  };
  const en = (sel) => `${AP4} ${sel}`;
  const clic = (sel) => pg.click(en(sel));
  for (let vuelta = 0; vuelta < 8; vuelta++) {
    const id = await pg.getAttribute(AP4, "data-pantalla");
    if (await pg.$(en("[data-prediccion]"))) {
      await estado(`${id}-eligiendo`);
      await clic('[data-opcion="peps"]');
      await estado(`${id}-apostada`);
      await clic('[data-boton="seguir"]');
      continue;
    }
    if (await pg.$(en("[data-tocar-filas]"))) {
      await estado(`${id}-cerradas`);
      for (const u of await pg.$$eval(en("[data-utilidad]"), (bs) => bs.map((b) => b.dataset.utilidad))) {
        await clic(`[data-utilidad="${u}"]`);
        await estado(`${id}-${u}`);
      }
      await clic('[data-boton="seguir"]');
      continue;
    }
    if (await pg.$(en("[data-eleccion]"))) {
      await estado(`${id}-colocando`);
      const malas = await pg.$$eval(en("[data-opcion]"), (bs, c) => bs.map((b) => b.dataset.opcion).filter((o) => o !== c).sort(), correctas[id]);
      for (const mala of malas) {
        await clic(`[data-opcion="${mala}"]`); await clic('[data-boton="confirmar"]');
        await estado(`${id}-error-${mala}`);
        await clic('[data-boton="probar-otra"]');
      }
      await clic(`[data-opcion="${correctas[id]}"]`); await clic('[data-boton="confirmar"]');
      await estado(`${id}-acierto`);
      await clic('[data-boton="seguir"]');
      continue;
    }
    if (await pg.$(en("[data-lados]"))) {
      await estado(`${id}-colocando`);
      for (const l of Object.keys(lado)) await clic(`[data-linea="${l}"][data-lado="${lado[l] === "debe" ? "haber" : "debe"}"]`);
      await estado(`${id}-colocando-lleno`);
      await clic('[data-boton="confirmar"]');
      await estado(`${id}-error`);
      await clic('[data-plegar="otros"]');
      await estado(`${id}-otros-abiertos`);
      await clic('[data-plegar="otros"]');
      await clic('[data-boton="probar-otra"]');
      for (const l of Object.keys(lado)) await clic(`[data-linea="${l}"][data-lado="${lado[l]}"]`);
      await clic('[data-boton="confirmar"]');
      await estado(`${id}-acierto`);
      await clic('[data-boton="seguir"]');
      continue;
    }
    await estado(id);
    if (await pg.$(en('[data-plegar="operaciones"]'))) {
      await clic('[data-plegar="operaciones"]');
      await estado(`${id}-operaciones`);
    }
    const b = await pg.$(en("[data-boton]"));
    if (!b) break;
    await b.click();
  }
  await pg.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel | alto pieza | holgura más justa de una cifra | botón más bajo | P6 apilada");
for (const f of filas) console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.alto} | ${f.holgura ?? "—"} | ${f.boton ?? "—"} | ${f.apilada ?? "—"}`);
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
/* P0, P1 (2), P2 (2), P3 (5), P4 (4), P5 (4), P6 (4), P7. */
if (estados !== 23) fallos.push(`se recorrieron ${estados} estados y son 23`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto ni ninguna cifra se sale a 375 ni a 320 px, y todo botón mide 44 px o más.");
