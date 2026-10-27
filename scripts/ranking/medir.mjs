/*
 * Mide el RankingFP a 320×568 y 375×667 en Chromium, con Inter y Sora de
 * verdad (#556). Uso:
 *   FUENTES=<carpeta con @fontsource/inter y @fontsource/sora> node scripts/ranking/medir.mjs
 * Sin FUENTES mide con las de respaldo del sistema y lo dice.
 *
 * Qué devuelve por ancho: el ancho más chico de un apodo (0 era el fallo), si
 * algún apodo se corta o se sale, el alto mínimo de los botones de ánimo y de
 * las pestañas, y si algo desborda en horizontal.
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const FUENTES = process.env.FUENTES;
const hayFuentes = Boolean(FUENTES) && existsSync(`${FUENTES}/node_modules/@fontsource/inter`);

/* Los ánimos sin red: la mitad ya dados, cifras de 1 y 2 dígitos. */
const animos = { name: "animos-de-mentira", enforce: "pre", load(id) {
  if (id.endsWith("/src/social/animo.js")) return "export async function estadoDeAnimos(a){return Object.fromEntries((a??[]).map((n,i)=>[n,{recibidos:i%3===0?12:i,yaLeDi:i%2===0}]));}\nexport async function darAnimo(){return {ok:true};}\nexport async function animosRecibidos(){return [];}";
} };
const servidor = await createServer({ root: RAIZ, logLevel: "error", plugins: [animos], server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BANCO = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/ranking/banco/index.html`;

const nav = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const salida = [];
for (const [ancho, alto] of [[320, 568], [375, 667]]) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  await pg.route("**/*", (route) => {
    const u = route.request().url();
    if (u.includes("fonts.googleapis.com")) {
      if (!hayFuentes) return route.fulfill({ status: 200, contentType: "text/css", body: "" });
      let css = "";
      for (const [fam, ws] of [["Sora", [400, 600, 700]], ["Inter", [400, 600, 700]]]) for (const w of ws) css += `@font-face{font-family:'${fam}';font-weight:${w};src:url(/__f/${fam.toLowerCase()}/${w}.woff2) format('woff2');}\n`;
      return route.fulfill({ status: 200, contentType: "text/css", body: css });
    }
    if (u.includes("/__f/")) {
      const [fam, w] = u.split("/__f/")[1].split("/");
      return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(`${FUENTES}/node_modules/@fontsource/${fam}/files/${fam}-latin-${w.split(".")[0]}-normal.woff2`) });
    }
    return route.continue();
  });
  await pg.goto(BANCO);
  await pg.waitForSelector("[data-fila-ranking]", { timeout: 120000 });
  await pg.waitForSelector("[data-boton-animo]", { timeout: 30000 });
  await pg.waitForSelector("[data-fila-liga]", { timeout: 30000 }).catch(() => {});
  await pg.evaluate(() => document.fonts.ready);
  salida.push({ ancho, alto, fuentes: hayFuentes ? "Inter y Sora de producción" : "respaldo del sistema", ...(await pg.evaluate(() => {
    const caja = (e) => e.getBoundingClientRect();
    const apodos = [...document.querySelectorAll("[data-fila-ranking] [data-apodo]")];
    const botones = [...document.querySelectorAll("[data-boton-animo]")];
    const pestanas = [...document.querySelectorAll('[aria-label="Periodo del ranking"] button')];
    const grupo = document.querySelector('[aria-label="Periodo del ranking"]');
    const tarjeta = grupo.parentElement;
    return {
      filas: apodos.length,
      apodoMasAngosto: Math.round(Math.min(...apodos.map((a) => caja(a).width))),
      apodosCortadosOSalidos: apodos.filter((a) => a.scrollWidth > a.clientWidth + 1 || caja(a).right > caja(a.closest("[data-fila-ranking]")).right + 0.5).length,
      apodosEnVariasLineas: apodos.filter((a) => caja(a).height > 26).map((a) => a.textContent),
      botonesAnimo: botones.length,
      altoMinBotonAnimo: Math.round(Math.min(...botones.map((b) => caja(b).height))),
      altoMinPestana: Math.round(Math.min(...pestanas.map((b) => caja(b).height))),
      pestanasPartidas: pestanas.filter((b) => caja(b).height > 46).map((b) => b.textContent),
      pestanasSeSalen: Math.round(caja(grupo).right - (caja(tarjeta).right - parseFloat(getComputedStyle(tarjeta).paddingRight))),
      desbordeHorizontal: document.documentElement.scrollWidth > innerWidth,
      liga: (() => {
        const filas = [...document.querySelectorAll("[data-fila-liga]")];
        const ap = filas.map((f) => f.querySelector("[data-apodo]") ?? f.querySelector("span[style*='ellipsis']")).filter(Boolean);
        return {
          filasPodio: filas.length,
          apodoMasAngosto: ap.length ? Math.round(Math.min(...ap.map((a) => caja(a).width))) : null,
          apodosCortadosOSalidos: ap.filter((a) => a.scrollWidth > a.clientWidth + 1 || caja(a).right > caja(a.closest("[data-fila-liga]")).right + 0.5).length,
        };
      })(),
      /*
       * El contraste de cada texto de las dos tablas (Levi en #573: «opaco no
       * es legible»). Se compone el fondo real subiendo por los padres hasta
       * uno opaco, se mezcla el color del texto con su alfa y se calcula la
       * razón WCAG. Por tabla: la mínima y cada color distinto con la suya.
       */
      contraste: (() => {
        const rgba = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r, g, b, a }; };
        const sobre = (arriba, abajo) => ({ r: arriba.r * arriba.a + abajo.r * (1 - arriba.a), g: arriba.g * arriba.a + abajo.g * (1 - arriba.a), b: arriba.b * arriba.a + abajo.b * (1 - arriba.a), a: 1 });
        const fondoDe = (el) => {
          const capas = [];
          for (let x = el; x; x = x.parentElement) { const c = rgba(getComputedStyle(x).backgroundColor); if (c && c.a > 0) { capas.push(c); if (c.a >= 1) break; } }
          let f = { r: 14, g: 27, b: 46, a: 1 };
          for (const c of capas.reverse()) f = sobre(c, f);
          return f;
        };
        const lum = ({ r, g, b }) => { const l = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * l(r) + 0.7152 * l(g) + 0.0722 * l(b); };
        const razon = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
        return [...document.querySelectorAll("[data-columna] > *")].map((tabla, k) => {
          const textos = [...tabla.querySelectorAll("*")].filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && el.getBoundingClientRect().width > 0);
          const vistos = {};
          for (const el of textos) {
            const s = getComputedStyle(el);
            const fondo = fondoDe(el);
            const r = Math.round(razon(sobre(rgba(s.color), fondo), fondo) * 100) / 100;
            const clave = `${s.color} · ${s.fontSize}`;
            vistos[clave] = Math.min(vistos[clave] ?? Infinity, r);
          }
          return { tabla: k === 0 ? "ranking" : "liga", textos: textos.length, minima: Math.min(...Object.values(vistos)), porColor: vistos };
        });
      })(),
      /* El fondo de cada tabla (#571): tiene que ser opaco. */
      fondoTablas: [...document.querySelectorAll("[data-columna] > *")].map((t) => getComputedStyle(t).backgroundColor).filter((c) => c !== "rgba(0, 0, 0, 0)"),
    };
  })) });
  await ctx.close();
}
console.log(JSON.stringify(salida, null, 2));
await nav.close();
await servidor.close();
