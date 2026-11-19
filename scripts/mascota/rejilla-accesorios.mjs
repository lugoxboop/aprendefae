/*
 * REJILLA DE ACCESORIOS × ESPECIES (19-nov). Pinta cada accesorio puesto en
 * cada mascota, tal como lo dibuja svgMarioneta (el mismo código de la tienda
 * y de «Mi avatar»), y fotografía la rejilla. Sirve para auditar a ojo que
 * cada pieza encaje en cada animal. Sin build ni Supabase: las imágenes se
 * sirven desde public/.
 *
 *   node scripts/mascota/rejilla-accesorios.mjs carpeta [--solo=gorro,gorra] [--especie=zorro]
 *
 * Saca una foto por grupo (cabeza, cara, cuello, espalda) en busto o cuerpo
 * según lo que muestra la tienda, más una foto por especie con todo.
 */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { svgMarioneta } from "../../src/mascota/marionetas.js";
import { ESTILO_MARIONETA } from "../../src/mascota/marioneta-estilo.js";
import { ACCESORIOS_MARIONETA } from "../../src/mascota/accesorios-marioneta.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "../..");
const SALIDA = process.argv[2] ?? "rejilla";
const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const SOLO = arg("solo")?.split(",");
const T = Number(arg("t") ?? 150);
const ESPECIES = arg("especie")?.split(",") ?? ["zorro", "gato", "perro", "hamster", "conejo", "huron"];
mkdirSync(SALIDA, { recursive: true });

const GRUPOS = {
  cabeza: ["gorro", "gorra", "pirata", "birrete", "mago", "vaquero", "corona", "casco", "audifonos", "mono"],
  cara: ["gafas", "gafas_sol", "antifaz", "parche", "bigote"],
  cuello: ["bufanda", "collar", "corbatin", "corbata", "traje", "medalla"],
  espalda: ["capa", "jetpack", "alas", "mochila"],
};
const BUSTO = new Set([...GRUPOS.cabeza, ...GRUPOS.cara]);

const mascota = (esp, puestos, busto, t = 150) => {
  const r = svgMarioneta(esp, { uid: `${esp}-${puestos.join("-")}`, busto, puestos });
  return `<svg class="mta mta-quieta" viewBox="${r.viewBox}" width="${t}" height="${Math.round(t * 150 / 140)}" style="overflow:hidden">${r.inner}</svg>`;
};

function pagina(filas, titulo) {
  const cab = `<tr><th></th>${ESPECIES.map((e) => `<th>${e}</th>`).join("")}</tr>`;
  const cuerpo = filas.map(([nombre, celdas]) => `<tr><th>${nombre}</th>${celdas.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>${ESTILO_MARIONETA}
body{margin:0;background:#1d2a44;font-family:sans-serif;color:#dfe7f5}
h1{font-size:18px;margin:10px 14px}
table{border-collapse:separate;border-spacing:6px}
th{font-size:13px;font-weight:600;padding:4px}
td{background:#2a3a5c;border-radius:12px;padding:4px}</style></head>
<body><h1>${titulo}</h1><table>${cab}${cuerpo}</table></body></html>`;
}

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1600, height: 800 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.route("http://rejilla.test/**", (route) => {
  const p = new URL(route.request().url()).pathname;
  const f = join(RAIZ, "public", decodeURIComponent(p));
  if (p === "/") return route.fulfill({ status: 200, contentType: "text/html", body: page._html });
  if (!existsSync(f)) return route.fulfill({ status: 404, body: "" });
  return route.fulfill({ status: 200, contentType: "image/webp", body: readFileSync(f) });
});

async function foto(html, archivo) {
  page._html = html;
  await page.goto("http://rejilla.test/");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: join(SALIDA, archivo), fullPage: true });
  console.log("foto", archivo);
}

for (const [grupo, ids] of Object.entries(GRUPOS)) {
  const lista = ids.filter((id) => ACCESORIOS_MARIONETA[id] && (!SOLO || SOLO.includes(id)));
  if (!lista.length) continue;
  const filas = lista.map((id) => [id, ESPECIES.map((e) => mascota(e, [id], BUSTO.has(id), T))]);
  await foto(pagina(filas, `Accesorios · ${grupo}`), `${grupo}.png`);
}
if (!SOLO || process.argv.includes("--combos")) {
  const combos = [["gorra", "gafas", "bufanda"], ["mago", "bigote", "capa"], ["pirata", "parche", "corbatin"], ["casco", "jetpack"], ["corona", "traje", "medalla"]];
  const filas = combos.map((c) => [c.join("+"), ESPECIES.map((e) => mascota(e, c, false, 150))]);
  await foto(pagina(filas, "Combinaciones (cuerpo entero, como «Mi avatar»)"), "combinaciones.png");
}
/* --por-especie: una hoja por animal con los 25 accesorios (5 × 5), como se ven en la tienda. */
if (process.argv.includes("--por-especie")) {
  const todos = Object.values(GRUPOS).flat().filter((id) => ACCESORIOS_MARIONETA[id]);
  for (const e of ESPECIES) {
    const celdas = todos.map((id) => `<div class="c">${mascota(e, [id], BUSTO.has(id), T)}<b>${id}</b></div>`).join("");
    const html = pagina([], "").replace(/<h1>.*<\/table>/s, `<h1>${e}</h1><div class="g">${celdas}</div>`)
      .replace("</style>", ".g{display:grid;grid-template-columns:repeat(5,auto);gap:6px;padding:0 10px 10px;width:max-content}.c{background:#2a3a5c;border-radius:12px;padding:4px;display:flex;flex-direction:column;align-items:center}.c b{font-size:12px;font-weight:600;padding-bottom:3px}</style>");
    await foto(html, `especie-${e}.png`);
  }
}
await nav.close();
