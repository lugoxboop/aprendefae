/*
 * Condición (a) de Shibukawa en #498: el motivo de B2 y los nombres de
 * actividad enteros (hasta dos renglones, sin recorte), ningún enlace en teal
 * y el título de la barra sin pasar bajo la pastilla de FP. Mide y deja
 * cuatro capturas reducidas (JPEG a 1×) en capturas-v1/.
 *
 *   node scripts/t4/panel-docente/verificacion-498.mjs [http://localhost:8099]
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirPanel, chromium, hayFuentes, RAIZ } from "./pagina.mjs";

const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const DIR = join(RAIZ, "orquestador/revisiones/panel-docente");
if (!hayFuentes()) { console.error("faltan las fuentes"); process.exit(2); }

function medir() {
  const recortado = (el) => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
  const reng = (el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
  const enlaces = [...document.querySelectorAll("[data-ver-atencion], [data-ver-destacados], [data-ver-actividades]")].map((b) => ({ texto: b.textContent.trim(), color: getComputedStyle(b).color, subrayado: getComputedStyle(b).textDecorationLine }));
  const titulo = [...document.querySelectorAll("h2")].find((h) => h.textContent.trim() === "Panel docente");
  const pastilla = [...document.querySelectorAll("button")].find((b) => /FP/.test(b.textContent) && getComputedStyle(b.closest("[style*=fixed]") ?? b).position);
  const rt = titulo?.getBoundingClientRect();
  const rp = pastilla?.getBoundingClientRect();
  return {
    motivos: [...document.querySelectorAll("[data-motivo]")].map((m) => ({ texto: m.textContent, renglones: reng(m), recortado: recortado(m) })),
    nombresActividad: [...document.querySelectorAll("[data-nombre-actividad]")].map((m) => ({ texto: m.textContent, renglones: reng(m), recortado: recortado(m) })),
    enlaces,
    tituloBajoLaPastilla: rt && rp ? rt.right > rp.left && rt.bottom > rp.top && rt.top < rp.bottom : null,
    tituloRecortado: titulo ? titulo.scrollWidth > titulo.clientWidth : null,
  };
}

const nav = await chromium.launch();
const R = {};
for (const [nombre, escenario, ancho, alto, accion] of [
  ["uno-375x667", "uno", 375, 667, null],
  ["normal-1366x768", "normal", 1366, 768, null],
  ["grande-320x568", "grande", 320, 568, null],
  ["vista-actividades-375x667", "normal", 375, 667, "[data-ir=actividades]"],
]) {
  const { ctx, page, errores } = await abrirPanel(nav, { url: URL_BASE, escenario, ancho, alto });
  await page.waitForSelector("[data-bloque=b1]", { timeout: 30000 });
  await page.waitForFunction(() => !document.querySelector("[data-bloque=b3][aria-busy]"), null, { timeout: 30000 }).catch(() => {});
  if (accion) { await page.click(accion); await page.waitForSelector("[data-fila-actividad]"); await page.waitForFunction(() => !document.querySelector("[data-vista=actividades][aria-busy]"), null, { timeout: 30000 }); }
  await page.waitForTimeout(400);
  R[nombre] = { ...(await page.evaluate(medir)), errores };
  await page.screenshot({ path: join(DIR, "capturas-v1", `${nombre}-498.jpg`), type: "jpeg", quality: 60, fullPage: Boolean(accion) });
  await ctx.close();
}
/* Y la barra a 320, 340 y 359: el título nunca bajo la pastilla. */
for (const ancho of [320, 340, 359]) {
  const { ctx, page } = await abrirPanel(nav, { url: URL_BASE, ancho, alto: 640 });
  await page.waitForSelector("[data-bloque=b1]", { timeout: 30000 });
  await page.waitForTimeout(300);
  R[`barra-${ancho}`] = await page.evaluate(medir).then((m) => ({ tituloBajoLaPastilla: m.tituloBajoLaPastilla, tituloRecortado: m.tituloRecortado }));
  await ctx.close();
}
await nav.close();
writeFileSync(join(DIR, "verificacion-498.json"), JSON.stringify(R, null, 2) + "\n");
console.log(JSON.stringify(R, null, 1));
