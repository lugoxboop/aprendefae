/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · ¿SE LEE ENTERO EL TÍTULO DEL TEMA A 320 Y 375 PX?
 *
 *   node scripts/t4/medir-titulo.mjs <url-del-dist-servido> [carpeta-de-capturas]
 *
 * Como manda herramientas.md («La revisión a 320 px, y cómo se hace de
 * verdad»): el sitio construido con claves de mentira, `dist` servido en
 * local, y Playwright con viewport fijo. Antes de medir se lee
 * `window.innerWidth`: si no es el ancho pedido, la medida no vale y sale en
 * rojo.
 *
 *   VITE_SUPABASE_URL=https://ejemplo.supabase.co \
 *   VITE_SUPABASE_ANON_KEY=clave-de-mentira \
 *   VITE_GOOGLE_CLIENT_ID=000.apps.googleusercontent.com npx vite build
 *   cd dist && python3 -m http.server 8099
 *   node scripts/t4/medir-titulo.mjs http://127.0.0.1:8099
 *
 * En la vista de T4, en Aprender y en Hacer, comprueba que el h1:
 *   · tiene el texto completo del tema
 *   · no se corta: sin elipsis (text-overflow) y sin desborde (scrollWidth
 *     hasta clientWidth), y cada línea suya queda dentro del h1 (un Range)
 *   · no se sale de la página ni la página tiene barra horizontal
 *
 * Fuente del navegador: PLAYWRIGHT_MODULE (por defecto el de la máquina,
 * /opt/npm-tools/node_modules/playwright-core) y CHROMIUM_PATH (por defecto
 * /opt/pw-browsers/chromium). Sale con código 1 si algo falla.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const MODULO = process.env.PLAYWRIGHT_MODULE ?? ["/opt/npm-tools/node_modules/playwright-core", "/opt/node-tools/node_modules/playwright"].find(existsSync);
const { chromium } = require(MODULO);
const CHROMIUM = process.env.CHROMIUM_PATH ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const BASE = process.argv[2];
if (!BASE) { console.error("uso: node scripts/t4/medir-titulo.mjs <url-del-dist-servido> [carpeta]"); process.exit(2); }
const CAPTURAS = process.argv[3] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });

const TITULO = "Efectivo, caja menor y bancos";
const fallos = [];
const filas = [];
const navegador = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});

for (const ancho of [320, 375]) {
  for (const modo of ["aprender", "hacer"]) {
    const pg = await navegador.newPage({ viewport: { width: ancho, height: 820 }, deviceScaleFactor: 2 });
    await pg.goto(`${BASE}/#/efectivo-caja-menor-bancos/${modo}`);
    await pg.waitForSelector("h1", { timeout: 60000 });
    await pg.evaluate(() => document.fonts.ready);
    const marca = `${ancho} px · ${modo}`;
    /* La trampa de la extensión: se comprueba el ancho de verdad antes de mirar nada. */
    const real = await pg.evaluate(() => window.innerWidth);
    if (real !== ancho) { fallos.push(`${marca}: window.innerWidth es ${real}, no ${ancho}: la medida no vale`); await pg.close(); continue; }
    const m = await pg.evaluate((titulo) => {
      const h1 = [...document.querySelectorAll("h1")].find((x) => x.textContent.trim() === titulo);
      if (!h1) return { falta: [...document.querySelectorAll("h1")].map((x) => x.textContent) };
      const e = getComputedStyle(h1);
      const r = h1.getBoundingClientRect();
      const rango = document.createRange(); rango.selectNodeContents(h1);
      const lineas = [...rango.getClientRects()].filter((x) => x.width > 1);
      const fuera = lineas.filter((x) => x.right > r.right + 0.5 || x.left < r.left - 0.5).length;
      return {
        ancho: Math.round(r.width * 100) / 100,
        alto: Math.round(r.height * 100) / 100,
        lineas: new Set(lineas.map((x) => Math.round(x.top))).size,
        elipsis: e.textOverflow === "ellipsis" && h1.scrollWidth > h1.clientWidth + 0.5,
        desborde: h1.scrollWidth > h1.clientWidth + 0.5,
        fuera,
        derecha: Math.round(r.right * 100) / 100,
        pagina: document.documentElement.scrollWidth,
        fuente: document.fonts.check('700 17px "Sora"'),
      };
    }, TITULO);
    if (m.falta) { fallos.push(`${marca}: no está el h1 «${TITULO}» (hay: ${m.falta.join(" | ")})`); await pg.close(); continue; }
    filas.push(`${marca} · h1 ${m.ancho}×${m.alto} px · ${m.lineas} línea(s) · borde derecho ${m.derecha} · página ${m.pagina} · Sora ${m.fuente ? "cargada" : "NO cargada"}`);
    if (m.elipsis || m.desborde) fallos.push(`${marca}: el título se corta (scrollWidth > clientWidth${m.elipsis ? ", con elipsis" : ""})`);
    if (m.fuera) fallos.push(`${marca}: ${m.fuera} línea(s) del título se salen del h1`);
    if (m.derecha > ancho + 0.5) fallos.push(`${marca}: el h1 se sale de la página (${m.derecha} px)`);
    if (m.pagina > ancho) fallos.push(`${marca}: la página mide ${m.pagina} px de ancho`);
    if (CAPTURAS) await pg.screenshot({ path: resolve(CAPTURAS, `titulo-${ancho}-${modo}.png`), clip: { x: 0, y: 0, width: ancho, height: 160 } });
    await pg.close();
  }
}

await navegador.close();
console.log(filas.join("\n"));
console.log(fallos.length ? `\n${fallos.length} FALLAN:\n${fallos.join("\n")}` : `\nEl título «${TITULO}» se lee entero a 320 y 375 px, en Aprender y en Hacer.`);
process.exit(fallos.length ? 1 : 0);
