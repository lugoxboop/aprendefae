/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE Y SE VE r5-1 «REPASO CRUZADO» v2 A 320 Y 375? (Célula E)
 *
 *   node scripts/e5/medir-r5-1.mjs [carpeta-de-capturas]
 *
 * Como manda orquestador/conocimiento/herramientas.md: build con claves de
 * mentira, dist servido en local y Chromium con el viewport fijo (320 × 568 y
 * 375 × 667), con window.innerWidth comprobado antes de medir. Abre
 * #/repaso-capitulo-5/r5-1 y juega la tanda entera fallando a propósito (el
 * camino más largo: la elegida y luego la correcta). En cada pantalla, antes,
 * durante y después de responder:
 *
 *   · sin desbordamiento horizontal: la página y cada texto en su caja
 *   · ningún texto de lectura bajo 12 px (las marcas de interfaz en
 *     mayúsculas, como «PREGUNTA 2 DE 6», pueden ir a 10,5: E6)
 *   · cada botón de al menos 44 px de alto
 *   · B1: la figura o la interacción empieza en los primeros 280 px de la
 *     tarjeta, con 40 palabras o menos antes
 *   · E2: en el momento en que algo se mueve, eso está en la ventana
 *     (pantallas 1, 2, 3, 5 y 6 al responder; el contador fijo de la 4
 *     mientras se clasifica), muestreado cada 50 ms
 *   · que se midió con Inter y Sora, no con la fuente de reserva
 *
 * y anota los altos que el paquete deja para medir. Capturas de cada pantalla
 * antes, durante y después. Sale con código 1 si algo falla. Necesita
 * Playwright (no es dependencia del repo): el de la máquina, o el de
 * PLAYWRIGHT_MODULE; Chromium en CHROMIUM_PATH o /opt/pw-browsers/chromium.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const VENTANAS = [[320, 568], [375, 667]];
const CONTENIDO = { 375: 343, 320: 288 };

/* ═══════════ EL BUILD, CON CLAVES DE MENTIRA, SERVIDO EN LOCAL ═══════════ */

const DIST = mkdtempSync(join(tmpdir(), "r5-1-dist-"));
const build = spawnSync("npx", ["vite", "build", "--outDir", DIST, "--emptyOutDir"], {
  cwd: RAIZ, encoding: "utf8",
  env: {
    ...process.env,
    VITE_SUPABASE_URL: "https://ejemplo.supabase.co",
    VITE_SUPABASE_ANON_KEY: "clave-de-mentira",
    VITE_GOOGLE_CLIENT_ID: "000.apps.googleusercontent.com",
  },
});
if (build.status !== 0) { console.error(build.stdout, build.stderr); process.exit(1); }

const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".woff": "font/woff", ".json": "application/json", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };
const servidor = createServer((req, res) => {
  let ruta = join(DIST, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!ruta.startsWith(DIST) || !existsSync(ruta) || statSync(ruta).isDirectory()) ruta = join(DIST, "index.html");
  res.writeHead(200, { "content-type": TIPOS[extname(ruta)] ?? "application/octet-stream" });
  res.end(readFileSync(ruta));
});
await new Promise((ok) => servidor.listen(0, "127.0.0.1", ok));
const URL_R5_1 = `http://127.0.0.1:${servidor.address().port}/#/repaso-capitulo-5/r5-1`;

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const fallos = [];
const notas = [];

/* ═══════════ LO QUE SE MIDE EN CADA ESTADO ═══════════ */

/* Las marcas de interfaz que pueden ir a 10,5 en mayúsculas (E6). */
const MARCAS = ["PREGUNTA", "PISTA", "POR TEMA", "EN LA FIGURA", "HACER"];

function medirEstado(marcas) {
  const raiz = document.querySelector("[data-r5-1]");
  const problemas = [];
  if (document.documentElement.scrollWidth > window.innerWidth) problemas.push(`la página mide ${document.documentElement.scrollWidth} px en ${window.innerWidth}`);
  const conTexto = [...raiz.querySelectorAll("*")]
    .filter((el) => !el.matches("style, script") && !el.closest("[aria-hidden='true']"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  let minima = Infinity;
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    const e = getComputedStyle(el);
    if (e.opacity === "0" || e.visibility === "hidden") continue;
    /* El texto solo para lector de pantalla (1 × 1 px, recortado) no se mide. */
    if (e.position === "absolute" && r.width <= 1) continue;
    const texto = el.textContent.trim();
    const nombre = `${el.tagName.toLowerCase()} «${texto.slice(0, 40)}»`;
    if (e.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) problemas.push(`${nombre}: mide ${el.scrollWidth} px en una caja de ${el.clientWidth}`);
    if (r.right > window.innerWidth + 0.5 || r.left < -0.5) problemas.push(`${nombre}: se sale de la pantalla`);
    const px = parseFloat(e.fontSize);
    const esMarca = e.textTransform === "uppercase" && marcas.some((m) => texto.startsWith(m));
    if (!esMarca) minima = Math.min(minima, px);
    if (px < 12 && !esMarca) problemas.push(`${nombre}: letra de ${px} px`);
    if (esMarca && px < 10.5) problemas.push(`${nombre}: marca de ${px} px`);
  }
  for (const b of raiz.querySelectorAll("button")) {
    const r = b.getBoundingClientRect();
    if (!r.width || getComputedStyle(b).opacity === "0") continue;
    if (b.closest("[data-r5-1][data-cierre]")) continue;
    if (r.height < 44 - 0.5) problemas.push(`el botón «${b.textContent.trim().slice(0, 30)}» mide ${r.height.toFixed(1)} px de alto`);
  }
  const fuentes = document.fonts.check("16px Inter") && document.fonts.check("700 16px Sora");
  return { problemas, minima: minima === Infinity ? null : minima, fuentes, ancho: raiz.getBoundingClientRect().width };
}

/* B1: dónde empieza la figura o la interacción, y cuántas palabras van antes. */
function medirB1() {
  const tarjeta = document.querySelector("[data-r5-1]").getBoundingClientRect();
  const interaccion = document.querySelector("[data-interaccion]").getBoundingClientRect();
  const antes = document.querySelector("[data-enunciado]").textContent.trim().split(/\s+/).length;
  return { empieza: Math.round(interaccion.top - tarjeta.top), palabras: antes };
}

/*
 * Muestrea los selectores cada 50 ms durante `ms`: lo que se está moviendo,
 * ¿está entero en la ventana? Una figura cuenta solo mientras anima
 * (data-fase="animando"); quieta, preparándose, no se mueve.
 */
async function enVentana(pagina, selectores, ms, etiqueta, problemas) {
  const t0 = Date.now();
  let muestras = 0;
  while (Date.now() - t0 < ms) {
    const fuera = await pagina.evaluate((sels) => sels.flatMap((s) => [...document.querySelectorAll(s)].map((el) => {
      const r = el.getBoundingClientRect();
      if (!r.height) return null;
      const fig = el.matches("[data-caja-figura]") ? el.querySelector("[data-figura]") : null;
      if (fig && fig.dataset.fase !== "animando") return null;
      return r.top < -0.5 || r.bottom > window.innerHeight + 0.5 ? `${s} en ${Math.round(r.top)}-${Math.round(r.bottom)} (ventana ${window.innerHeight})` : null;
    })).filter(Boolean), selectores);
    muestras++;
    for (const f of fuera) problemas.add(`${etiqueta}: ${f}`);
    await pagina.waitForTimeout(50);
  }
  return muestras;
}

/* ═══════════ LA TANDA, A CADA ANCHO ═══════════ */

for (const [ancho, alto] of VENTANAS) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto } });
  await pagina.goto(URL_R5_1);
  await pagina.waitForSelector("[data-r5-1]");
  await pagina.evaluate(() => document.fonts.ready);
  const iw = await pagina.evaluate(() => window.innerWidth);
  if (iw !== ancho) { fallos.push(`${ancho}: window.innerWidth da ${iw}`); continue; }
  const captura = async (nombre) => { if (CAPTURAS) await pagina.screenshot({ path: `${CAPTURAS}/${ancho}-${nombre}.png` }); };
  const medir = async (nombre) => {
    const m = await pagina.evaluate(medirEstado, MARCAS);
    for (const p of m.problemas) fallos.push(`${ancho} · ${nombre}: ${p}`);
    if (!m.fuentes) fallos.push(`${ancho} · ${nombre}: no se midió con Inter y Sora`);
    if (Math.abs(m.ancho - CONTENIDO[ancho]) > 0.5) fallos.push(`${ancho} · ${nombre}: el contenido mide ${m.ancho} px, no ${CONTENIDO[ancho]}`);
    return m;
  };
  const b1 = async (id) => {
    const r = await pagina.evaluate(medirB1);
    notas.push(`${ancho} · ${id}: la interacción empieza en ${r.empieza} px de la tarjeta, con ${r.palabras} palabras antes`);
    if (ancho === 320 && (r.empieza > 280 || r.palabras > 40)) fallos.push(`${ancho} · ${id}: B1 — empieza en ${r.empieza} px con ${r.palabras} palabras antes`);
  };
  const siguiente = async () => { await pagina.click("[data-siguiente]"); await pagina.waitForTimeout(400); };

  /* Pantallas 1, 2 y 6: la opción se vuelve título; se falla para ver la correcta. */
  const titulo = async (id, mala) => {
    await b1(id);
    await medir(`${id} antes`);
    await captura(`${id}-1-antes`);
    const alto0 = await pagina.evaluate((m) => document.querySelector(`[data-opcion="${m}"]`).getBoundingClientRect().height, mala);
    await pagina.click(`[data-opcion="${mala}"] button`);
    const problemas = new Set();
    /* Recoger + trasladar (500 ms); luego la figura se mueve: tiene que estar en la ventana. */
    await pagina.waitForTimeout(560);
    await captura(`${id}-2-durante`);
    await enVentana(pagina, ["[data-caja-figura]"], 3200, `${id} durante`, problemas);
    for (const p of problemas) fallos.push(`${ancho} · ${p}`);
    const pos = await pagina.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const filas = [...document.querySelectorAll("[data-opcion]")].map((f) => f.getBoundingClientRect());
      return { elegida: [Math.round(filas[0].top), Math.round(filas[0].bottom)], correcta: filas[1] ? [Math.round(filas[1].top), Math.round(filas[1].bottom)] : null, figura: [Math.round(r("[data-caja-figura]").top), Math.round(r("[data-caja-figura]").bottom)] };
    });
    notas.push(`${ancho} · ${id}: opción de ${Math.round(alto0)} px; tras fallar, elegida ${pos.elegida.join("-")}, correcta ${pos.correcta?.join("-")}, figura ${pos.figura.join("-")} (ventana ${alto})`);
    await medir(`${id} después`);
    await captura(`${id}-3-despues`);
  };

  await titulo("p1", "c3-a");
  await siguiente();
  await titulo("p2", "c5-d");
  await siguiente();

  /* Pantalla 3: la lata nueva antes de tiempo, las cuatro, la tabla. */
  {
    await b1("p3");
    await medir("p3 antes");
    await captura("p3-1-antes");
    await pagina.click('[data-lata="segunda-0"]');
    await pagina.waitForTimeout(350);
    await medir("p3 mensaje");
    const problemas = new Set();
    for (const k of [0, 1, 2, 3]) {
      await pagina.click(`[data-lata="primera-${k}"]`);
      await enVentana(pagina, ["[data-en-bandeja]", "[data-barras]"], 420, `p3 lata ${k + 1}`, problemas);
      if (k === 1) await captura("p3-2-durante");
    }
    await enVentana(pagina, ["[data-barras]", "[data-marca-ueps]"], 400, "p3 marcas de UEPS", problemas);
    for (const p of problemas) fallos.push(`${ancho} · ${p}`);
    const barras = await pagina.evaluate(() => Math.round(document.querySelector("[data-barras]").getBoundingClientRect().top));
    notas.push(`${ancho} · p3: tras la cuarta, las barras quedan en ${barras} px (pedido: 56 + 16 = 72)`);
    await medir("p3 tabla");
    await captura("p3-3-tabla");
    await pagina.click('[data-opcion="c6-a"] button');
    await pagina.waitForTimeout(300);
    await medir("p3 después");
    await captura("p3-4-despues");
    await siguiente();
  }

  /* Pantalla 4: el contador fijo mientras se clasifica. */
  {
    await b1("p4");
    await medir("p4 antes");
    await captura("p4-1-antes");
    const pon = { ventas: "suma", "devoluciones-ventas": "fuera", "inventario-inicial": "suma", compras: "suma", "devoluciones-compras": "resta", "inventario-final": "fuera" };
    const problemas = new Set();
    for (const [f, b] of Object.entries(pon)) {
      await pagina.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "center" }), `[data-ficha="${f}"] [data-boton="${b}"]`);
      await pagina.click(`[data-ficha="${f}"] [data-boton="${b}"]`);
      await enVentana(pagina, ["[data-contador]"], 250, `p4 contador tras ${f}`, problemas);
      const tapa = await pagina.evaluate((sel) => {
        const c = document.querySelector("[data-contador]").getBoundingClientRect();
        const b = document.querySelector(sel).getBoundingClientRect();
        return b.bottom > c.top + 0.5 && b.top < c.bottom - 0.5;
      }, `[data-ficha="${f}"] [data-boton="${b}"]`);
      if (tapa) problemas.add(`p4: el contador tapa el botón que se acaba de tocar (${f})`);
      if (f === "compras") await captura("p4-2-durante");
    }
    for (const p of problemas) fallos.push(`${ancho} · ${p}`);
    const fijo = await pagina.evaluate(() => document.querySelector("[data-contador]").dataset.fijo);
    notas.push(`${ancho} · p4: con la última ficha puesta, el contador está ${fijo === "si" ? "fijo abajo" : "en el flujo"}`);
    await pagina.click("[data-revisar]");
    await pagina.waitForTimeout(300);
    await medir("p4 después");
    await captura("p4-3-despues");
    await siguiente();
  }

  /* Pantalla 5: los tres lotes, la salida, las opciones. */
  {
    await b1("p5");
    await medir("p5 antes");
    await captura("p5-1-antes");
    const problemas = new Set();
    for (const k of [3, 1, 2]) {
      await pagina.click(`[data-lote="${k}"]`);
      await enVentana(pagina, ["[data-estante-comun]", '[data-rotulo-lotes="costo"]', '[data-rotulo-lotes="unidades"]'], 450, `p5 lote ${k}`, problemas);
      if (k === 1) await captura("p5-2-durante");
    }
    await enVentana(pagina, ["[data-estante-comun]"], 800, "p5 salida", problemas);
    await pagina.waitForSelector("[data-opciones-lotes]");
    await pagina.waitForTimeout(400);
    for (const p of problemas) fallos.push(`${ancho} · ${p}`);
    const costo = await pagina.evaluate(() => Math.round(document.querySelector('[data-rotulo-lotes="costo"]').getBoundingClientRect().top));
    notas.push(`${ancho} · p5: tras la salida, «Costo total» queda en ${costo} px (pedido: 72)`);
    await medir("p5 opciones");
    await captura("p5-3-opciones");
    await pagina.click('[data-opcion="c9-c"] button');
    await pagina.waitForTimeout(300);
    await medir("p5 después");
    await captura("p5-4-despues");
    await siguiente();
  }

  await titulo("p6", "c10-b");
  await siguiente();
  await pagina.waitForTimeout(500);
  await captura("final");
  await pagina.close();
}

await navegador.close();
servidor.close();
rmSync(DIST, { recursive: true, force: true });

for (const n of notas) console.log(`· ${n}`);
if (fallos.length) {
  console.log(`\n✗ ${fallos.length} fallos:`);
  for (const f of fallos) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log("\n✓ r5-1 v2 cabe y se ve a 320 y a 375");
