import { createServer } from "vite";
import { createRequire } from "node:module";
import { resolve } from "node:path";
/*
 * node scripts/festejo/capturas/capturar.mjs <carpeta-salida>
 * Captura la pantalla de resumen con cada festejo y el Repaso Diario hecho,
 * a 320, 375 y escritorio. useRepaso va sustituido: «ya hiciste el de hoy».
 */
const RAIZ = resolve(import.meta.dirname, "../../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const out = process.argv[2];
const repaso = { name: "repaso", enforce: "pre", load(id) {
  if (id.endsWith("/src/repaso/useRepaso.js")) return "export function useRepaso(){return {cargando:false,error:null,datos:null,estado:'hecho-hoy',previa:null,marcarHechoHoy(){}};}";
} };
const s = await createServer({ root: RAIZ, logLevel: "error", plugins: [repaso], server: { port: 0, host: "127.0.0.1" } });
await s.listen();
const base = `http://127.0.0.1:${s.httpServer.address().port}/scripts/festejo/capturas/index.html`;
const nav = await chromium.launch();
const casos = [
  ["resumen-colita-zorro-375", 375, 900, "?festejo=colita&especie=zorro"],
  ["resumen-baila-gato-320", 320, 900, "?festejo=baila&especie=gato&paleta=gris&puestos=gafas"],
  ["resumen-canta-perro-375", 375, 900, "?festejo=canta&especie=perro"],
  ["resumen-saltitos-conejo-375", 375, 900, "?festejo=saltitos&especie=conejo&pct=30"],
  ["resumen-saluda-huron-escritorio", 1280, 900, "?festejo=saluda&especie=huron"],
  ["resumen-celebra-hamster-320", 320, 900, "?festejo=celebra&especie=hamster"],
  ["resumen-karaoke-zorro-320", 320, 900, "?festejo=karaoke&especie=zorro"],
  ["resumen-globo-hamster-320", 320, 900, "?festejo=globo&especie=hamster"],
  ["resumen-campeon-gato-375", 375, 900, "?festejo=campeon&especie=gato&paleta=gris"],
  ["resumen-graduado-conejo-375", 375, 900, "?festejo=graduado&especie=conejo&pct=30"],
  ["resumen-fiesta-perro-320", 320, 900, "?festejo=fiesta&especie=perro&puestos=gafas"],
  ["resumen-porra-huron-375", 375, 900, "?festejo=porra&especie=huron"],
  ["repaso-hecho-375", 375, 812, "?vista=repaso&festejo=baila&especie=perro&paleta=canela"],
  ["repaso-hecho-320", 320, 700, "?vista=repaso&festejo=colita&especie=zorro"],
];
for (const [nombre, w, h, qs] of casos) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const pg = await ctx.newPage();
  await pg.goto(base + qs);
  await pg.waitForSelector("[data-mascota-festejo]", { timeout: 120000 });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(1500);
  await pg.screenshot({ path: `${out}/${nombre}.png`, fullPage: true });
  const ancho = await pg.evaluate(() => document.documentElement.scrollWidth);
  console.log(nombre, "scrollWidth", ancho, "viewport", w);
  await ctx.close();
}
await nav.close(); await s.close();
