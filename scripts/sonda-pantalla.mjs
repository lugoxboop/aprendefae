#!/usr/bin/env node
/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SONDA DE PANTALLA — una captura real, a los anchos de verdad.
 *
 * POR QUÉ EXISTE. El Kit obliga a comprobar todo a 320 y 375 px, y durante
 * meses eso se hizo a mano o, peor, «a ojo» sobre el código. Un comentario
 * que dice que algo cabe no es una medida. Esta sonda abre `dist` en el
 * Chromium del contenedor, espera a que la aplicación pinte y deja el PNG.
 *
 * NO ES UNA PRUEBA: no dice pasa ni falla. Da la imagen para que la mire
 * quien tiene que decidir —el auditor al final, el diseñador al revisar—.
 *
 * USO
 *   node scripts/sonda-pantalla.mjs                      320 y 375, la portada
 *   node scripts/sonda-pantalla.mjs --ancho 375,1280
 *   node scripts/sonda-pantalla.mjs --ruta "/#/contabilidad"
 *   node scripts/sonda-pantalla.mjs --espera 1200        ms antes de disparar
 *   node scripts/sonda-pantalla.mjs --salida /tmp/fotos
 *   node scripts/sonda-pantalla.mjs --completa            toda la página, no solo lo visible
 *   node scripts/sonda-pantalla.mjs --antes guion.js      código que corre ANTES de que
 *                                                         cargue la aplicación
 *
 * `--antes` es la puerta para fingir sesión o fijar un estado: el archivo se
 * ejecuta en la página antes que nada, así que puede escribir en
 * localStorage. Sin eso, una sonda sobre una vista con sesión mide un cero
 * vacío y lo canta como si fuera la pantalla.
 *
 * REQUIERE `npm run build` antes: mide lo que se publica, no lo que sirve
 * vite en caliente.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, resolve } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const DIST = join(RAIZ, "dist");

const args = process.argv.slice(2);
const opcion = (n, pd) => {
  const i = args.indexOf(n);
  return i !== -1 && args[i + 1] ? args[i + 1] : pd;
};
const anchos = opcion("--ancho", "320,375").split(",").map((a) => parseInt(a, 10));
const ruta = opcion("--ruta", "/");
const espera = parseInt(opcion("--espera", "900"), 10);
const salida = resolve(opcion("--salida", join(RAIZ, "capturas")));
const completa = args.includes("--completa");
const PUERTO = parseInt(opcion("--puerto", "8099"), 10);
const antes = opcion("--antes", null);

if (!existsSync(DIST)) {
  console.error("No hay dist/. Corre `npm run build` primero: la sonda mide lo que se publica.");
  process.exit(1);
}

const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json" };

/* Servidor mínimo con reescritura a index.html: la aplicación enruta en el cliente. */
const servidor = createServer(async (req, res) => {
  const limpia = decodeURIComponent((req.url || "/").split("?")[0]);
  let f = join(DIST, limpia === "/" ? "index.html" : limpia.replace(/^\/+/, ""));
  if (!existsSync(f) || limpia.endsWith("/")) f = join(DIST, "index.html");
  try {
    const cuerpo = await readFile(f);
    res.writeHead(200, { "content-type": TIPOS[extname(f)] || "application/octet-stream" });
    res.end(cuerpo);
  } catch {
    res.writeHead(404).end("no");
  }
});

await new Promise((ok) => servidor.listen(PUERTO, ok));
await mkdir(salida, { recursive: true });

/*
 * Playwright vive en el contenedor, no en node_modules del proyecto: no es una
 * dependencia del sitio y no tiene por qué serlo. Se busca por los dos lados
 * para que la sonda corra igual en una máquina donde sí esté instalada.
 */
const { createRequire } = await import("node:module");
const requerir = createRequire(import.meta.url);
let chromium;
for (const donde of ["playwright", "/opt/npm-tools/node_modules/playwright"]) {
  try {
    ({ chromium } = requerir(donde));
    break;
  } catch {
    /* se prueba el siguiente */
  }
}
if (!chromium) {
  console.error("No encuentro playwright. En el contenedor está en /opt/npm-tools; fuera, `npm i -D playwright`.");
  process.exit(1);
}
const navegador = await chromium.launch();
const nombres = [];

for (const ancho of anchos) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 812 }, deviceScaleFactor: 2 });
  if (antes) await ctx.addInitScript({ path: resolve(antes) });
  const pag = await ctx.newPage();
  const quejas = [];
  pag.on("console", (m) => m.type() === "error" && quejas.push(m.text().slice(0, 160)));
  pag.on("pageerror", (e) => quejas.push(`pageerror: ${String(e).slice(0, 160)}`));
  await pag.goto(`http://127.0.0.1:${PUERTO}${ruta}`, { waitUntil: "networkidle" }).catch(() => {});
  await pag.waitForTimeout(espera);
  const etiqueta = ruta.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "portada";
  const archivo = join(salida, `${etiqueta}-${ancho}.png`);
  await pag.screenshot({ path: archivo, fullPage: completa });
  nombres.push(archivo);
  /*
   * Un error de consola no invalida la captura, pero se dice: una pantalla que
   * se ve bien con la consola roja es el falso verde de siempre.
   */
  console.log(`${ancho} px → ${archivo}${quejas.length ? `\n   ⚠ consola: ${quejas.slice(0, 3).join(" | ")}` : ""}`);
  await ctx.close();
}

await navegador.close();
servidor.close();
console.log(`\n${nombres.length} captura(s). Míralas; la sonda no juzga.`);
