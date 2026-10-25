/*
 * T4 · las capturas que pidió la auditoría de Shibukawa del #488, sobre el banco de T4 (puerto 5291).
 *
 *   node scripts/t4/slides/capturas-auditoria.mjs <carpeta>
 *
 *   (b)  A1 p5 a 320×568, con «Escenario simulado.» en la banda
 *   A8   a 375×667, antes de la acción y 300 ms después: A0 p1, A1 p3, A2 p2, A3 p2, A4 p1 y A5 p2
 *   C2   a 320×568, A1 p4 tras el segundo error, con el porqué en la banda
 *
 * Va a cada pantalla escribiendo la posición en lo guardado de la pestaña (la clave de la página).
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const pw = createRequire(import.meta.url)("playwright");
const DIR = process.argv[2] ?? "capturas";
const URL_ = "http://localhost:5291/scripts/t4/harness-t4/";
mkdirSync(DIR, { recursive: true });

const navegador = await pw.chromium.launch();
async function ir(w, h, p, s) {
  const pagina = await navegador.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await pagina.addInitScript(() => { try { if (!sessionStorage.getItem("cap")) { sessionStorage.clear(); sessionStorage.setItem("cap", "1"); } localStorage.setItem("aprendefae-t4-caso", "1"); } catch {} });
  await pagina.goto(URL_);
  await pagina.waitForSelector("[data-secuencia] [data-pantalla]");
  await pagina.evaluate(([p, s]) => {
    const k = `fae-secuencia:${document.querySelector("[data-secuencia]").dataset.secuencia}`;
    const g = JSON.parse(sessionStorage.getItem(k)); g.p = p; g.s = s; sessionStorage.setItem(k, JSON.stringify(g));
  }, [p, s]);
  await pagina.reload();
  await pagina.waitForSelector(`[data-secuencia] [data-pantalla="${s + 1}"]`);
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(1200);
  return pagina;
}
const foto = (pagina, nombre) => pagina.screenshot({ path: `${DIR}/${nombre}.png` });

/* (b) */
{ const pg = await ir(320, 568, 1, 4); await foto(pg, "b-a1-p5-320"); await pg.close(); }

/* A8: antes y 300 ms después de la acción, a 375. */
const A8 = [
  ["a0-p1", 0, 0, (pg) => pg.click("[data-fila=mercancia] [data-seg=antes]")],
  ["a1-p3", 1, 2, (pg) => pg.click("[data-pantalla] [data-accion]")],
  ["a2-p2", 2, 1, (pg) => pg.click("[data-pantalla] [data-opcion] >> nth=0")],
  ["a3-p2", 3, 1, async (pg) => { await pg.focus("input[data-accion=mover]"); for (let i = 0; i < 4; i++) await pg.keyboard.press("ArrowRight"); }],
  ["a4-p1", 4, 0, (pg) => pg.click("[data-pantalla] .t4s-ctl:has-text('477.800')")],
  ["a5-p2", 5, 1, (pg) => pg.click("[data-pantalla] .t4s-ctl >> nth=0")],
];
for (const [nombre, p, s, accion] of A8) {
  const pg = await ir(375, 667, p, s);
  await foto(pg, `a8-${nombre}-375-antes`);
  await accion(pg);
  await pg.waitForTimeout(300);
  await foto(pg, `a8-${nombre}-375-300ms`);
  await pg.close();
}

/* A5 p5 (Katsumi, #488): la contrapartida entre tres cuentas, tras el primer error, a 320. */
{
  const pg = await ir(320, 568, 5, 4);
  await foto(pg, "a5-p5-320-antes");
  await pg.click("[data-pantalla] [data-contrapartidas] .t4s-ctl >> nth=0");
  await pg.waitForTimeout(300);
  await foto(pg, "a5-p5-320-toque");
  await pg.close();
}

/* C2: A1 p4, dos errores en la primera tarjeta (el cheque recibido va al debe). */
{
  const pg = await ir(320, 568, 1, 3);
  await pg.click("[data-pantalla] [data-destino=haber]");
  await pg.waitForTimeout(300);
  await pg.click("[data-pantalla] [data-bandeja]");
  await pg.waitForTimeout(600);
  await foto(pg, "c2-a1-p4-320-segundo-error");
  await pg.close();
}
await navegador.close();
