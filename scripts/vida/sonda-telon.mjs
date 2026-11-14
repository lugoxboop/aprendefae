/*
 * ═══════════════════════════════════════════════════════════════════════════
 * QUÉ HAY DETRÁS DEL CONTENIDO, MEDIDO.
 *
 * El relieve de `prompts/vida-visual-v1.md` se apoya en que el canto se vea
 * contra lo que tiene detrás. Pero detrás no hay un color plano: hay una
 * escena animada y un velo radial encima, y lo que resulta cambia por materia
 * y por zona de la pantalla. Esta sonda mide ESO: la luminancia real del telón
 * en la banda donde viven el ranking y las tarjetas.
 *
 * POR QUÉ IMPORTA: en el índice de Pensamiento Estratégico la madera clara del
 * ajedrez sube el telón por ENCIMA de la propia superficie de la tarjeta. Un
 * canto pensado solo para el navy de Contabilidad ahí no se ve, y en los
 * puntos más claros se invierte. De ahí sale la regla de la placa.
 *
 * CÓMO SE CORRE (hacen falta dos terminales):
 *   npx vite --port 8123 --strictPort
 *   node scripts/vida/sonda-telon.mjs
 *
 * Con otro puerto: node scripts/vida/sonda-telon.mjs http://localhost:5173
 *
 * LO QUE NO HACE: no mira texto ni componentes; solo el telón. El contraste
 * del texto ya lo mide `scripts/contraste.mjs` sobre la página construida.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import pkg from "/opt/npm-tools/node_modules/playwright-core/index.js";
const { chromium } = pkg;

const BASE = process.argv[2] || "http://localhost:8123";

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const Lhex = (h) => L(...[1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
const razon = (a, b) => +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2);

/* Las cuatro pantallas que importan: los tres índices (ahí viven los
 * leaderboards) y una actividad, donde el velo sube a 0,62. */
const CASOS = [
  ["macroeconomia", 0.10, "índice Macro"],
  ["contabilidad", 0.10, "índice Contabilidad"],
  ["pensamiento-estrategico", 0.34, "índice Estratégico"],
  ["pensamiento-estrategico", 0.62, "actividad Estratégico"],
];

const N1 = "#1D3557", N2 = "#344968";

const navegador = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const ctx = await navegador.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 1 });
const filas = [];

for (const [fondo, alpha, etiqueta] of CASOS) {
  const p = await ctx.newPage();
  const url = `${BASE}/scripts/vida/sonda-fondos.html?fondo=${fondo}&alpha=${alpha}`;
  try {
    await p.goto(url, { waitUntil: "networkidle", timeout: 15000 });
  } catch {
    console.error(`No se pudo abrir ${url}. ¿Está corriendo "npx vite --port 8123 --strictPort"?`);
    process.exit(1);
  }
  await p.waitForTimeout(2500);

  /* El PNG se decodifica en el propio navegador: así la sonda no necesita
   * ninguna librería de imágenes. */
  const datos = "data:image/png;base64," + (await p.screenshot({ type: "png" })).toString("base64");
  const lector = await ctx.newPage();
  const crudos = await lector.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0);
    const y0 = Math.floor(img.height * 0.30);
    const d = g.getImageData(0, y0, img.width, Math.floor(img.height * 0.75) - y0).data;
    const v = []; for (let i = 0; i < d.length; i += 8) v.push([d[i], d[i + 1], d[i + 2]]);
    return v;
  }, datos);
  await lector.close(); await p.close();

  const Ls = crudos.map(([r, g, b]) => L(r, g, b)).sort((a, b) => a - b);
  const q = (f) => Ls[Math.floor(Ls.length * f)];
  filas.push({ caso: etiqueta, velo: alpha, min: +q(0).toFixed(4), p50: +q(0.5).toFixed(4), p95: +q(0.95).toFixed(4), max: +q(0.999).toFixed(4) });
}
await navegador.close();

console.log("Luminancia del telón detrás del contenido · 320×640 · banda 30–75% del alto");
console.table(filas);
console.log(`Referencia: #0E1B2E ${Lhex("#0E1B2E").toFixed(4)} · N1 ${N1} ${Lhex(N1).toFixed(4)} · N2 ${N2} ${Lhex(N2).toFixed(4)}\n`);

for (const f of filas) {
  const placa = f.p95 > Lhex(N2);
  console.log(
    `${f.caso.padEnd(24)} canto N1 contra el telón: p50 ${razon(Lhex(N1), f.p50)}:1 · p95 ${razon(Lhex(N1), f.p95)}:1` +
    `   ${placa ? "⇒ EXIGE PLACA (el telón supera la cara en su p95)" : "⇒ sin placa"}`
  );
}
