/*
 * CAPTURAS DE LA TIENDA (rediseño estilo videojuego, 19-nov). Mismo montaje
 * que scripts/portada/capturas-portada.mjs: Supabase falso y sesión fingida.
 * Fotografía #/tienda a varios anchos y MIDE desborde horizontal, cuántos
 * accesorios caben en la primera pantalla y si algún nombre se corta. Con
 * --probar, toca dos accesorios para ver el probador.
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8099) &
 *   node scripts/tienda/capturas-tienda.mjs http://localhost:8099 carpeta [--probar]
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const SALIDA = process.argv[3] ?? "capturas";
const PROBAR = process.argv.includes("--probar");
mkdirSync(SALIDA, { recursive: true });

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000002", aud: "authenticated", role: "authenticated", email: "estudiante@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const hoy = new Date().toISOString().slice(0, 10);
const PERFIL = {
  user_id: USER.id, id: USER.id, nickname: "Mateo", full_name: "Mateo de prueba",
  points: 988, cristales_balance: 75, streak: 6, last_activity_day: hoy,
  mascota_especie: process.env.ESPECIE ?? "zorro", mascota_nombre: "Chispa", mascota_paleta: "natural", mascota_ojos: "natural",
  mascota_accesorios: ["gafas", "gorra", "bufanda"], mascota_puestos: ["gafas", "bufanda"],
};
function sesion() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated" })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };
}

async function abrir(nav, ancho, alto) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.route("**/*", async (route) => {
    const req = route.request();
    const u = req.url();
    if (u.includes("fake.supabase.test")) {
      if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER) });
      if (u.includes("/rest/v1/rpc/es_docente")) return route.fulfill({ status: 200, contentType: "application/json", body: "false" });
      if (u.includes("/rest/v1/rpc/")) return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      if (u.includes("/rest/v1/profiles")) {
        const obj = (req.headers().accept ?? "").includes("vnd.pgrst.object");
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(obj ? PERFIL : [PERFIL]) });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    }
    /* Sin red: la hoja de Google Fonts se sirve vacía (abortarla saca el aviso de «no cargó»). */
    if (u.includes("fonts.googleapis.com")) return route.fulfill({ status: 200, contentType: "text/css", body: "" });
    if (u.startsWith(URL_BASE)) return route.continue();
    if (process.env.DEPURAR) console.log("abortado", u.slice(0, 160));
    return route.abort();
  });
  await page.addInitScript((s) => { try { localStorage.setItem("aprendefae-auth", s); } catch { /* */ } }, JSON.stringify(sesion()));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${URL_BASE}/#/tienda`);
  if (!(await page.waitForSelector("[data-accesorio]", { timeout: 15000 }).catch(() => null))) {
    await page.reload();
    await page.waitForSelector("[data-accesorio]", { timeout: 20000 });
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  return { ctx, page };
}

function medir() {
  const cartas = [...document.querySelectorAll("[data-accesorio]")];
  return {
    barraHorizontal: document.documentElement.scrollWidth > innerWidth + 1,
    accesorios: cartas.length,
    enPrimeraPantalla: cartas.filter((c) => { const r = c.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }).length,
    nombreCortado: cartas.some((c) => { const n = c.querySelector("[data-nombre]"); return n && n.scrollWidth > n.clientWidth + 1; }),
    fueraDePantalla: cartas.some((c) => { const r = c.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth + 0.5; }),
    altoPagina: document.documentElement.scrollHeight,
  };
}

const ANCHOS = [[1440, 900], [1280, 800], [1024, 768], [768, 1024], [375, 812], [320, 640]];
const nav = await chromium.launch();
for (const [ancho, alto] of ANCHOS) {
  const { ctx, page } = await abrir(nav, ancho, alto);
  if (PROBAR) {
    for (const id of ["mago", "capa"]) {
      const b = await page.$(`[data-accesorio="${id}"] [data-probar]`);
      if (b) { await b.click(); await page.waitForTimeout(250); }
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: join(SALIDA, `tienda-${ancho}${PROBAR ? "-probando" : ""}.png`) });
  console.log(JSON.stringify({ ancho, ...(await page.evaluate(medir)) }));
  /* Con --probar, también a media página: el vestidor fijo (escritorio) o la
     barrita de abajo (teléfono) siguen enseñando lo que se prueba. */
  if (PROBAR) {
    await page.evaluate(() => scrollTo(0, 1100));
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(SALIDA, `tienda-${ancho}-probando-desplazada.png`) });
  }
  await ctx.close();
}
await nav.close();
