import { createServer } from "vite";
import { createRequire } from "node:module";
import { resolve, join } from "node:path";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
/*
 * VIDEO DEL MOMENTO DE RACHA (regla p, evidencia visual).
 *   node scripts/racha/capturas/grabar.mjs <carpeta> [--especie=zorro] [--anchos=320,375] [--alto=568,667] [--query="nombre=Kiko"]
 * Graba la secuencia real a cada ancho (racha-<especie>-<ancho>.mp4, con ffmpeg) y saca
 * fotos fijas cada 250 ms (cuadros/<ancho>-<ms>.png) para revisar cuadro a
 * cuadro. El último tramo toca «Continuar» para ver también la salida.
 */
const RAIZ = resolve(import.meta.dirname, "../../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const arg = (n, d) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3) ?? d;
const SALIDA = resolve(process.argv[2] ?? "video-racha");
const ESPECIE = arg("especie", "zorro");
const ANCHOS = arg("anchos", "320,375").split(",").map(Number);
const ALTOS = arg("alto", "568,667").split(",").map(Number);
const EXTRA = arg("query", "");
mkdirSync(join(SALIDA, "cuadros"), { recursive: true });

const s = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await s.listen();
const base = `http://127.0.0.1:${s.httpServer.address().port}/scripts/racha/capturas/index.html?especie=${ESPECIE}&${EXTRA}`;
const nav = await chromium.launch();
for (const [k, ancho] of ANCHOS.entries()) {
  const alto = ALTOS[k] ?? ALTOS[0];
  const tmp = join(SALIDA, `tmp-${ancho}`);
  const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, recordVideo: { dir: tmp, size: { width: ancho, height: alto } } });
  const pg = await ctx.newPage();
  const tVideo = Date.now();
  /* Primero se calienta la caché (fuentes, piezas de la mascota) y luego se recarga: el video empieza con todo listo. */
  await pg.goto(base); await pg.waitForLoadState("networkidle");
  await pg.reload(); await pg.waitForSelector("[data-momento-racha]");
  const t0 = Date.now();
  const recorte = Math.max(0, (t0 - tVideo) / 1000 - 0.05);
  for (let ms = 0; ms <= 5000; ms += 250) {
    const falta = t0 + ms - Date.now();
    if (falta > 0) await pg.waitForTimeout(falta);
    await pg.screenshot({ path: join(SALIDA, "cuadros", `${ancho}-${String(ms).padStart(4, "0")}.png`) });
  }
  await pg.waitForTimeout(1500);
  await pg.click("[data-continuar]");
  await pg.waitForTimeout(700);
  await ctx.close();
  const v = readdirSync(tmp).find((f) => f.endsWith(".webm"));
  /* Se recorta el calentamiento: el video arranca justo con la secuencia. */
  const final = join(SALIDA, `racha-${ESPECIE}-${ancho}.mp4`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", recorte.toFixed(2), "-i", join(tmp, v), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", final]);
  rmSync(tmp, { recursive: true });
}
await nav.close(); await s.close();
console.log("listo:", SALIDA);
