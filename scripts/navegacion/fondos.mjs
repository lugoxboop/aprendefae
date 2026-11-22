/*
 * ¿Qué pantallas tienen fondo vivo y cuáles un color plano?
 * Visita cada vista, toma la franja de los márgenes (donde no hay contenido)
 * y mide cuánto varía el color: un fondo plano da casi cero.
 *
 *   node scripts/navegacion/fondos.mjs http://localhost:8100 carpeta-capturas [vista ...]
 */
import { chromium, abrir } from "./base.mjs";
import { mkdirSync } from "node:fs";
const [U, DIR = "capturas-fondos", ...solo] = process.argv.slice(2); mkdirSync(DIR, { recursive: true });
const VISTAS = solo.length ? solo : ["", "macroeconomia", "contabilidad", "pensamiento-estrategico", "pensamiento-sistemico", "modelo-iceberg", "fuerzas-porter", "introduccion-contabilidad", "cuentas-debe-haber", "ingresos-gastos-y-caja", "efectivo-caja-menor-bancos", "activos-financieros", "cuentas-por-cobrar", "inventarios-periodico", "inventarios-permanente", "inventarios-descuentos-nic2", "repaso-capitulo-5", "repaso-diario", "repaso-diario-contabilidad", "que-es", "perfil", "perfil/avatar", "tienda", "amigos", "docente", "vivo", "vivo-profesor"];
const nav = await chromium.launch();
for (const [w, h] of [[1280, 800], [375, 667]]) for (const v of VISTAS) {
  const { ctx, page } = await abrir(nav, U, w, h, v ? `#/${v}` : "", { quieto: true });
  const png = await page.screenshot();
  const nombre = (v || "inicio").replace("/", "-");
  await page.screenshot({ path: `${DIR}/${nombre}-${w}.png` });
  /* Lee los píxeles en el navegador: franjas de 12 px pegadas a cada borde. */
  const r = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
    const x = c.getContext("2d"); x.drawImage(img, 0, 0);
    let min = [255, 255, 255], max = [0, 0, 0], sat = 0, n = 0;
    for (const col of [4, img.width - 6]) for (let y = 80; y < img.height - 10; y += 6) {
      const [R, G, B] = x.getImageData(col, y, 1, 1).data;
      [R, G, B].forEach((v, i) => { min[i] = Math.min(min[i], v); max[i] = Math.max(max[i], v); });
      sat += Math.max(R, G, B) - Math.min(R, G, B); n++;
    }
    return { rango: Math.max(...max.map((m, i) => m - min[i])), sat: Math.round(sat / n) };
  }, png.toString("base64"));
  console.log(`${w}\t${nombre}\trango=${r.rango}\tsat=${r.sat}${page.errores.length ? "\tERR " + page.errores[0].slice(0, 60) : ""}`);
  await ctx.close();
}
await nav.close();
