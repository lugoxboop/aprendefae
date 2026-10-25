import { createServer } from "vite";
import { createRequire } from "node:module";
const RAIZ = "/home/claude/aprendefae";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/npm-tools/node_modules/playwright");
const sustituto = { name:"animos", enforce:"pre", load(id){ if(id.endsWith("/src/social/animo.js")) return "export async function estadoDeAnimos(a){return Object.fromEntries((a??[]).map((n,i)=>[n,{recibidos:i%3===0?12:i,yaLeDi:i%2===0}]));}\nexport async function darAnimo(){return {ok:true};}\nexport async function animosRecibidos(){return [];}"; } };
const s = await createServer({ root: RAIZ, logLevel:"error", plugins:[sustituto], server:{ port:0, host:"127.0.0.1" } });
await s.listen();
const B = `http://127.0.0.1:${s.httpServer.address().port}/scripts/decoracion/harness-ranking/index.html`;
const nav = await chromium.launch();
for (const w of [320, 375]) {
  const ctx = await nav.newContext({ viewport:{width:w,height:568}, deviceScaleFactor:1 });
  const pg = await ctx.newPage();
  await pg.goto(`${B}?apodos=duros#l:normal:est`); await pg.waitForSelector("[data-columna] > *"); await pg.waitForTimeout(1200);
  const r = await pg.evaluate(() => {
    const col = document.querySelector("[data-columna]");
    const tarjeta = col.children[0];
    const spans = [...tarjeta.querySelectorAll("span")];
    const apodos = spans.filter(sp => /Contador|^Ab|MARIA|^x|Juan|深圳|aaa|Sof|Alejandro|Zoe/.test(sp.textContent) && sp.children.length <= 1 && sp.textContent.length < 60);
    const filas = apodos.map(sp => {
      const cs = getComputedStyle(sp);
      const g = document.createRange(); g.selectNodeContents(sp);
      const b = sp.getBoundingClientRect();
      return { n: sp.textContent.slice(0,22), caja: Math.round(b.width), alto: Math.round(b.height),
               texto: Math.round(g.getBoundingClientRect().width), ellipsis: cs.textOverflow, wrap: cs.whiteSpace,
               cortado: sp.scrollWidth > sp.clientWidth + 1,
               sale: Math.round(b.right) > Math.round(tarjeta.getBoundingClientRect().right),
               overflowWrap: cs.overflowWrap + "/" + cs.wordBreak };
    });
    const botones = [...tarjeta.querySelectorAll("button")].map(b => ({ t: b.textContent.trim().slice(0,12), w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height) }));
    const primero = tarjeta.querySelector("span[aria-hidden='true']");
    return { filas, botones, podio1: primero ? getComputedStyle(primero).color : null,
             desborde: document.documentElement.scrollWidth > innerWidth,
             tarjetaDesborde: tarjeta.scrollWidth > tarjeta.clientWidth + 1 };
  });
  console.log(`\n===== ${w} px =====  desborde página: ${r.desborde} · tarjeta: ${r.tarjetaDesborde} · color 1.º: ${r.podio1}`);
  for (const f of r.filas) console.log(`  caja ${String(f.caja).padStart(3)}×${String(f.alto).padStart(2)} · texto ${String(f.texto).padStart(3)} · ellipsis=${f.ellipsis} wrap=${f.wrap} cortado=${f.cortado}  ${f.n}`);
  console.log("  botones:", r.botones.map(b=>`${b.t}:${b.w}×${b.h}`).join("  "));
  await ctx.close();
}
await nav.close(); await s.close();
