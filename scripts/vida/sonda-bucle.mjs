/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CUÁNTO CUESTA UNA DECORACIÓN EN BUCLE.
 *
 * La regla del canon es «nada nuevo en bucle». `prompts/vida-visual-v1.md`
 * pide una excepción acotada —hasta 3 elementos en la banda del leaderboard—
 * y esta sonda es la que la paga: mide, no estima.
 *
 * QUÉ MIDE: los milisegundos de hilo principal que se acumulan en 4 segundos,
 * leídos del reloj de `Performance.getMetrics` (TaskDuration y
 * RecalcStyleDuration) antes y después, con la CPU frenada por CDP.
 *
 * POR QUÉ NO MIRA LOS FPS: en Chromium sin pantalla el rAF va a 60 pase lo
 * que pase; los cuadros no distinguen una técnica de otra y los milisegundos
 * de hilo principal sí.
 *
 * PEOR CASO A PROPÓSITO: se compone por software. Un teléfono real con GPU
 * mueve `transform` y `opacity` fuera del hilo principal y pagará menos. Si
 * una decoración pasa aquí, pasa en cualquier parte; al revés no vale.
 *
 * CÓMO SE CORRE:
 *   node scripts/vida/sonda-bucle.mjs          # CPU ×6
 *   node scripts/vida/sonda-bucle.mjs 10       # CPU ×10
 *
 * El arnés (`arnes.html`) trae las candidatas: `css`/`env` (transform),
 * `blur`, `shadow`, `canvas` y `pausa`. Para medir una pieza REAL construida
 * —que es lo que pide la parada de medición de vida-visual-v1 §11.6— se
 * cambia la URL por la de la página servida y se dejan los mismos tiempos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import pkg from "/opt/npm-tools/node_modules/playwright-core/index.js";
const { chromium } = pkg;

const CASOS = [
  ["base", 0], ["env", 3], ["pausa", 10], ["env", 10],
  ["blur", 3], ["shadow", 3], ["env3", 6], ["env", 6], ["canvas", 6],
];
const FRENO = Number(process.argv[2] || 6);
const DUR = 4000;
const ARNES = new URL("./arnes.html", import.meta.url).href;

const navegador = await chromium.launch();
const ctx = await navegador.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 2 });
const filas = [];

for (const [modo, n] of CASOS) {
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Performance.enable");
  await p.goto(`${ARNES}?modo=${modo}&n=${n}`);
  await p.waitForTimeout(500);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: FRENO });

  const reloj = async () =>
    Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  const antes = await reloj();
  await p.evaluate((d) => window.__medir(d), DUR);
  const despues = await reloj();
  const ms = (k) => +(((despues[k] || 0) - (antes[k] || 0)) * 1000).toFixed(0);

  filas.push({ caso: `${modo}×${n}`, hilo_ms: ms("TaskDuration"), estilo_ms: ms("RecalcStyleDuration") });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await p.close();
}

await navegador.close();
console.log(`CPU ×${FRENO}, 320×640, dPR 2, ${DUR / 1000} s por caso — ms acumulados de hilo principal`);
console.table(filas);

const base = filas[0].hilo_ms;
const tres = filas[1].hilo_ms;
const sobrecoste = Math.round(((tres - base) / DUR) * 100);
console.log(`\n3 elementos en bucle: +${tres - base} ms sobre la línea base = ${sobrecoste}% del hilo principal.`);
console.log(sobrecoste > 15 ? "Por encima del 15%: bajar a 2 elementos (vida-visual-v1 §11.6)." : "Dentro del presupuesto.");
