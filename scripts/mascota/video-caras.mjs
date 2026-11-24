/*
 * VIDEO DE LAS CARAS (23-nov). Graba, por especie, todas las caras y
 * movimientos de la marioneta (los 5 ánimos y los 12 festejos) a 320 y 375 px,
 * con el mismo svgMarioneta y la misma hoja de estilo de la app. Sirve para la
 * regla de evidencia visual: ver en movimiento si una cara se monta sobre otra
 * (dos narices, dos bocas) o si una capa salta al cambiar de ánimo.
 *
 *   node scripts/mascota/video-caras.mjs carpeta [--especie=hamster,zorro] [--seg=6]
 *
 * Saca <especie>-<ancho>.webm y, de cada uno, una foto fija en grande de las
 * caras (<especie>-caras.png) para revisar cuadro por cuadro.
 */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, existsSync, readdirSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { svgMarioneta, MOVIMIENTOS } from "../../src/mascota/marionetas.js";
import { ESTILO_MARIONETA } from "../../src/mascota/marioneta-estilo.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SALIDA = process.argv[2] ?? "video-caras";
const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const ESPECIES = arg("especie")?.split(",") ?? ["hamster", "zorro", "gato", "perro", "conejo", "huron", "panda"];
const SEG = Number(arg("seg") ?? 6);
mkdirSync(SALIDA, { recursive: true });

const celda = (esp, animo, t) => {
  const r = svgMarioneta(esp, { uid: `${esp}-${animo}` });
  return `<figure><svg class="mta mta-${animo}" viewBox="${r.viewBox}" width="${t}" height="${t}">${r.inner}</svg><figcaption>${animo}</figcaption></figure>`;
};
const pagina = (esp, t) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>${ESTILO_MARIONETA}
body{margin:0;background:#1d2a44;font-family:sans-serif;color:#dfe7f5}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(${t}px,1fr));gap:4px;padding:4px}
figure{margin:0;background:#2a3a5c;border-radius:10px;text-align:center}
figcaption{font-size:11px;padding-bottom:3px}</style></head>
<body><main>${MOVIMIENTOS.map((a) => celda(esp, a, t)).join("")}</main></body></html>`;

const nav = await chromium.launch();
async function abrir(ctx, html) {
  const page = await ctx.newPage();
  await page.route("http://caras.test/**", (route) => {
    const p = new URL(route.request().url()).pathname;
    if (p === "/") return route.fulfill({ status: 200, contentType: "text/html", body: html });
    const f = join(RAIZ, "public", decodeURIComponent(p));
    if (!existsSync(f)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ status: 200, contentType: "image/webp", body: readFileSync(f) });
  });
  await page.goto("http://caras.test/");
  await page.waitForLoadState("networkidle");
  return page;
}

for (const esp of ESPECIES) {
  for (const ancho of [320, 375]) {
    const dir = join(SALIDA, `tmp-${esp}-${ancho}`);
    const ctx = await nav.newContext({ viewport: { width: ancho, height: 1000 }, recordVideo: { dir, size: { width: ancho, height: 1000 } } });
    const page = await abrir(ctx, pagina(esp, Math.floor((ancho - 16) / 3)));
    await page.waitForTimeout(SEG * 1000);
    await ctx.close();
    const v = readdirSync(dir).find((f) => f.endsWith(".webm"));
    renameSync(join(dir, v), join(SALIDA, `${esp}-${ancho}.webm`));
    console.log("video", `${esp}-${ancho}.webm`);
  }
  const ctx = await nav.newContext({ viewport: { width: 1300, height: 800 } });
  const page = await abrir(ctx, pagina(esp, 250));
  await page.screenshot({ path: join(SALIDA, `${esp}-caras.png`), fullPage: true });
  await ctx.close();
}
await nav.close();
