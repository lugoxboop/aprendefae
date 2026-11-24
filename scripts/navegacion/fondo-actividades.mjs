/*
 * El fondo de las actividades de Macro 2026: ¿hay malla, y se sigue leyendo
 * lo que queda encima de ella?
 *
 * Esconde el contenido, toma el fondo solo y busca su píxel MÁS CLARO en toda
 * la pantalla: como las manchas se mueven, cualquier texto que esté fuera de
 * una tarjeta puede acabar encima de ese píxel. Con él calcula el peor
 * contraste del texto secundario (INK_2) y del principal (INK). WCAG pide
 * 4,5:1 para texto normal.
 *
 *   node scripts/navegacion/fondo-actividades.mjs http://localhost:8100 [vista ...]
 */
import { chromium, abrir } from "./base.mjs";
const [U, ...solo] = process.argv.slice(2);
const VISTAS = solo.length ? solo : ["demanda-agregada/aprender", "demanda-agregada/hacer", "demanda-agregada/hacer/da26-h4-empresario", "politica-economica/hacer", "politica-fiscal/hacer", "politica-monetaria/hacer", "politica-cambiaria/hacer"];
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const { INK, INK_2 } = await import("../../src/macro2026/comun/colores-da.js");
const nav = await chromium.launch(); let peor = 99;
for (const [w, h] of [[1280, 800], [375, 667], [320, 640]]) for (const v of VISTAS) {
  /* Sin «reducir movimiento»: con él la malla no se mueve y no se vería el peor instante. */
  const { ctx, page } = await abrir(nav, U, w, h, `#/${v}`);
  const hayMalla = await page.locator("[data-malla-animada]").count();
  await page.addStyleTag({ content: "[data-fondo-actividad], .fae-cuenta-boton, [class*=asistente], button { visibility: hidden !important; }" });
  let max = 0, min = 1;
  /* Recorre el ciclo entero (las manchas duran 31–38 s) en saltos de 2 s,
     adelantando el reloj de las animaciones en vez de esperar. */
  for (let t = 0; t <= 40000; t += 2000) {
    await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), t);
    const png = await page.screenshot();
    const r = await page.evaluate(async (b64) => {
      const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
      const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
      const x = c.getContext("2d"); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, img.width, img.height).data;
      let claro = [0, 0, 0], oscuro = [255, 255, 255], sc = -1, so = 999;
      for (let i = 0; i < d.length; i += 4 * 97) { const s = d[i] + d[i + 1] + d[i + 2]; if (s > sc) { sc = s; claro = [d[i], d[i + 1], d[i + 2]]; } if (s < so) { so = s; oscuro = [d[i], d[i + 1], d[i + 2]]; } }
      return { claro, oscuro };
    }, png.toString("base64"));
    max = Math.max(max, lum(r.claro)); min = Math.min(min, lum(r.oscuro));
  }
  const c2 = (lum(hex(INK_2)) + 0.05) / (max + 0.05), c1 = (lum(hex(INK)) + 0.05) / (max + 0.05);
  peor = Math.min(peor, c2);
  console.log(`${w}\t${v}\tmalla=${hayMalla ? "sí" : "NO"}\tvariación=${(max - min).toFixed(3)}\tINK_2 peor=${c2.toFixed(2)}:1\tINK peor=${c1.toFixed(2)}:1`);
  await ctx.close();
}
await nav.close();
console.log(peor >= 4.5 ? `PASA: el peor contraste es ${peor.toFixed(2)}:1` : `FALLA: ${peor.toFixed(2)}:1 < 4,5:1`);
process.exit(peor >= 4.5 ? 0 : 1);
