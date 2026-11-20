/*
 * Sonda de los emotes del lobby (0173), con la base de verdad (ver puente.mjs).
 *   PGHOST=/var/tmp PGPORT=5444 PGUSER=postgres node scripts/entreno/emotes.mjs http://localhost:8100 <carpeta>
 * Mide: la bandeja abre y se cierra con Escape, mi emote se ve al instante, el
 * de otro jugador llega por la base, y nada se desborda a 320, 375 y 1280.
 */
import { mkdirSync } from "node:fs";
import { chromium, MATEO, KEVIN, q, psql, rpc, abrir } from "./puente.mjs";
const OUT = process.argv[3] ?? "capturas-emotes"; mkdirSync(OUT, { recursive: true });
const res = []; const ok = (n, c) => res.push(`${c ? "✓" : "✗"} ${n}`);
const preg = [{ enunciado: "x", opciones: [{ id: "a", texto: "A" }, { id: "b", texto: "B" }], correcta: "a" }];
const nav = await chromium.launch();
for (const [w, h, et] of [[375, 812, "375"], [1280, 860, "1280"], [320, 640, "320"]]) {
  psql(`update public.entreno_salas set estado = 'cerrada' where estado <> 'cerrada'`);
  const demos = psql(`select string_agg(id::text, ',' order by orden) from public.amigos_demo where dueno = ${q(MATEO)} and orden in (1, 3, 4)`).out.split(",");
  const e = rpc(MATEO, "entreno_crear", { p_nombre: "", p_materia: "contabilidad", p_tema: "cuentas-debe-haber", p_tema_titulo: "Las cuentas, el debe y el haber", p_duracion: 30, p_preguntas: preg, p_invitar: [KEVIN], p_demos: demos }).data;
  rpc(KEVIN, "entreno_entrar", { p_sala: e.sala_id }); rpc(KEVIN, "entreno_listo", { p_sala: e.sala_id, p_listo: true });
  const { ctx, page } = await abrir(nav, w, h, `#/salas/s-${e.sala_id}`);
  await page.waitForSelector("[data-sal-fase=lobby]", { timeout: 8000 });
  await page.waitForTimeout(1200);
  await page.click("[data-sal-emotes]"); await page.waitForTimeout(400);
  ok(`${et} la bandeja abre con 12 emotes`, (await page.$$("[data-sal-hacer-emote]")).length === 12);
  const d1 = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(`${et} bandeja sin desborde (${d1}px)`, d1 <= 0);
  const caja = await page.$eval("[data-sal-bandeja]", (b) => { const r = b.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(innerWidth - r.right) }; });
  ok(`${et} bandeja dentro de la pantalla (izq ${caja.l}px, der ${caja.r}px)`, caja.l >= 0 && caja.r >= 0);
  await page.screenshot({ path: `${OUT}/emotes-bandeja-${et}.png` });
  await page.keyboard.press("Escape"); await page.waitForTimeout(200);
  ok(`${et} Escape la cierra`, !(await page.$("[data-sal-bandeja]")));
  await page.click("[data-sal-emotes]"); await page.waitForTimeout(250);
  rpc(KEVIN, "entreno_emote", { p_sala: e.sala_id, p_emote: "karaoke" });
  await page.click('[data-sal-hacer-emote="baila"]');
  await page.waitForTimeout(2300);
  const mio = await page.$('[data-sal-jugador="Lugox173"] [data-sal-emote="baila"]');
  const suyo = await page.$('[data-sal-jugador="kevin.r"] [data-sal-emote="karaoke"]');
  ok(`${et} mi emote se ve y el de kevin llega por la base`, Boolean(mio && suyo));
  const d2 = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(`${et} lobby con emotes sin desborde (${d2}px)`, d2 <= 0);
  await page.screenshot({ path: `${OUT}/emotes-lobby-${et}.png` });
  ok(`${et} sin errores de página`, page.errores.length === 0);
  await ctx.close();
}
await nav.close();
console.log(res.join("\n"));
