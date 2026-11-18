/*
 * CAPTURAS DEL CAMINO DE «HACER» CON EL COLOR DE CADA TEMA, 18-nov.
 * Mismo montaje que capturas-tarjetas.mjs (Supabase falso, sesión fingida),
 * con algunas actividades ya hechas para ver los tres estados: hecha,
 * siguiente y pendiente. Fotografía cuatro caminos a 1280, 375 y 320, uno con
 * un nodo en hover, y MIDE desborde horizontal y rótulos fuera de pantalla.
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8099) &
 *   node scripts/temas/capturas-camino.mjs http://localhost:8099 carpeta [--movimiento] [--video]
 */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const SALIDA = process.argv[3] ?? "capturas";
const CON_MOVIMIENTO = process.argv.includes("--movimiento");
mkdirSync(SALIDA, { recursive: true });
const FUENTES = join(RAIZ, "scripts/t4/sonda-enganche/.sonda-fuentes");
if (!existsSync(FUENTES)) console.warn("⚠ Sin fuentes (bash scripts/t4/sonda-enganche/fuentes.sh): la letra es la de respaldo.");

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000002", aud: "authenticated", role: "authenticated", email: "estudiante@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const hoy = new Date().toISOString().slice(0, 10);
const PERFIL = {
  user_id: USER.id, id: USER.id, nickname: "Mateo", full_name: "Mateo de prueba",
  points: Number(process.env.FP ?? 988), cristales_balance: 75, streak: 6, last_activity_day: hoy,
  mascota_especie: "perro",
};
function sesion() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated" })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };
}

/* Algunas hechas por camino: se ven los tres estados a la vez. */
const HECHAS = (process.env.HECHAS ?? "").split(",").filter(Boolean);

async function abrir(nav, ancho, alto, ruta, docente = false, video = null) {
  const ctx = await nav.newContext({
    viewport: { width: ancho, height: alto }, deviceScaleFactor: video ? 1 : 2,
    ...(video ? { recordVideo: { dir: video, size: { width: ancho, height: alto } } } : {}),
  });
  const page = await ctx.newPage();
  await page.route("**/*", async (route) => {
    const req = route.request();
    const u = req.url();
    if (u.includes("fake.supabase.test")) {
      if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER) });
      /* Con --docente, el servidor dice que sí: sale el atajo «Panel docente». */
      if (u.includes("/rest/v1/rpc/es_docente")) return route.fulfill({ status: 200, contentType: "application/json", body: docente ? "true" : "false" });
      if (u.includes("/rest/v1/rpc/actividades_hechas")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(HECHAS.map((activity_id) => ({ activity_id }))) });
      if (u.includes("/rest/v1/rpc/")) return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      if (u.includes("/rest/v1/profiles")) {
        const obj = (req.headers().accept ?? "").includes("vnd.pgrst.object");
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(obj ? PERFIL : [PERFIL]) });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    }
    if (u.includes("/__f/")) {
      const [fam, w] = u.split("/__f/")[1].split("/");
      const base = fam === "Sora" ? "fontsource-sora-5.3.0/package/files/sora-latin-" : "fontsource-inter-5.3.0/package/files/inter-latin-";
      return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(`${FUENTES}/${base}${w.split(".")[0]}-normal.woff2`) });
    }
    if (u.includes("fonts.googleapis.com")) {
      let css = "";
      for (const [fam, ws] of [["Sora", [300, 400, 600, 700, 800]], ["Inter", [400, 500, 600, 700]]]) {
        for (const w of ws) css += `@font-face{font-family:'${fam}';font-weight:${w};src:url(/__f/${fam}/${w}.woff2) format('woff2');}\n`;
      }
      return route.fulfill({ status: 200, contentType: "text/css", body: css });
    }
    if (u.startsWith(URL_BASE)) return route.continue();
    return route.abort();
  });
  await page.addInitScript((s) => { try { localStorage.setItem("aprendefae-auth", s); } catch { /* */ } }, JSON.stringify(sesion()));
  /* Las fotos, quietas; el video, con el movimiento de verdad. */
  await page.emulateMedia({ reducedMotion: video || CON_MOVIMIENTO ? "no-preference" : "reduce" });
  await page.goto(`${URL_BASE}/${ruta}`);
  /* Una recarga si el servidor de prueba tarda: la sonda mide la vista, no la red. */
  if (!(await page.waitForSelector(".fae-cuenta-boton", { timeout: 15000 }).catch(() => null))) {
    await page.reload();
    await page.waitForSelector(".fae-cuenta-boton", { timeout: 20000 });
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  return { ctx, page };
}



function medir() {
  const rotulos = [...document.querySelectorAll(".fae-ch-rotulo")].filter((r) => r.getClientRects().length);
  return {
    barraHorizontal: document.documentElement.scrollWidth > innerWidth + 1,
    nodos: [...document.querySelectorAll("[data-nodo]")].filter((n) => n.getClientRects().length).length,
    rotuloFuera: rotulos.some((r) => { const b = r.getBoundingClientRect(); return b.left < -0.5 || b.right > innerWidth + 0.5; }),
    rotuloMenorDe12: rotulos.some((r) => parseFloat(getComputedStyle(r).fontSize) < 12),
  };
}

const VISTAS = [
  { nombre: "politica-economica", ruta: "#/politica-economica/hacer" },
  { nombre: "debe-haber", ruta: "#/cuentas-debe-haber/hacer" },
  { nombre: "iceberg", ruta: "#/modelo-iceberg/hacer" },
  { nombre: "intro-conta", ruta: "#/introduccion-contabilidad/hacer" },
];
const ANCHOS = [[1280, 900], [375, 812], [320, 640]];
const nav = await chromium.launch();

/* --video: la entrada del camino y el hover de los primeros nodos, con movimiento real. */
if (process.argv.includes("--video")) {
  const dir = join(SALIDA, "video");
  const { ctx, page } = await abrir(nav, 1280, 900, process.env.RUTA ?? "#/cuentas-debe-haber/hacer", false, dir);
  await page.waitForTimeout(2200);
  for (const n of (await page.$$("g[data-nodo]")).slice(0, 4)) { await n.hover(); await page.waitForTimeout(800); }
  await page.mouse.move(5, 5);
  await page.waitForTimeout(600);
  await ctx.close();
  await nav.close();
  process.exit(0);
}

for (const v of VISTAS) {
  for (const [ancho, alto] of ANCHOS) {
    const { ctx, page } = await abrir(nav, ancho, alto, v.ruta);
    await page.waitForSelector("[data-nodo]", { state: "attached", timeout: 15000 });
    await page.waitForTimeout(CON_MOVIMIENTO ? 2000 : 500);
    await page.screenshot({ path: join(SALIDA, `${v.nombre}-${ancho}.png`), fullPage: true });
    const m = await page.evaluate(medir);
    if (ancho === 1280) {
      const visibles = [];
      for (const n of await page.$$("g[data-nodo]")) if (await n.isVisible()) visibles.push(n);
      const n = visibles[visibles.length - 1];
      if (n) {
        await n.scrollIntoViewIfNeeded();
        await n.hover();
        await page.waitForTimeout(CON_MOVIMIENTO ? 700 : 300);
        await page.screenshot({ path: join(SALIDA, `${v.nombre}-${ancho}-hover.png`) });
      }
    }
    console.log(JSON.stringify({ vista: v.nombre, ancho, ...m }));
    await ctx.close();
  }
}
await nav.close();
