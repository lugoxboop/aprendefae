/*
 * LA TIENDA, UNA FOTO POR ESPECIE (19-nov). Mismo montaje que
 * scripts/tienda/capturas-tienda.mjs (Supabase falso, sesión fingida): abre
 * #/tienda con cada mascota y fotografía la rejilla entera de accesorios, y
 * «Mi avatar» (#/perfil) con un conjunto puesto. Para auditar que cada
 * accesorio encaje en cada animal en la pantalla real, no solo en la sonda.
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8099) &
 *   node scripts/mascota/tienda-por-especie.mjs http://localhost:8099 carpeta [--especie=zorro,gato]
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const SALIDA = process.argv[3] ?? "capturas";
const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const ESPECIES = arg("especie")?.split(",") ?? ["zorro", "gato", "perro", "hamster", "conejo", "huron"];
const ANCHO = Number(arg("ancho") ?? 1280);
mkdirSync(SALIDA, { recursive: true });

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000002", aud: "authenticated", role: "authenticated", email: "estudiante@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const hoy = new Date().toISOString().slice(0, 10);
const TODOS = ["gorro", "gorra", "pirata", "birrete", "mago", "vaquero", "corona", "casco", "audifonos", "mono", "gafas", "gafas_sol", "antifaz", "parche", "bigote", "bufanda", "collar", "corbatin", "corbata", "traje", "medalla", "capa", "jetpack", "alas", "mochila"];
const perfil = (especie, puestos) => ({
  user_id: USER.id, id: USER.id, nickname: "Mateo", full_name: "Mateo de prueba",
  points: 988, cristales_balance: 75, streak: 6, last_activity_day: hoy,
  mascota_especie: especie, mascota_nombre: "Chispa", mascota_paleta: "natural", mascota_ojos: "natural",
  mascota_accesorios: TODOS, mascota_puestos: puestos,
});
function sesion() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated" })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };
}

async function abrir(nav, PERFIL, ruta, espera) {
  const ctx = await nav.newContext({ viewport: { width: ANCHO, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.route("**/*", async (route) => {
    const req = route.request();
    const u = req.url();
    if (u.includes("fake.supabase.test")) {
      if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER) });
      if (u.includes("/rest/v1/rpc/es_docente")) return route.fulfill({ status: 200, contentType: "application/json", body: "false" });
      if (u.includes("/rest/v1/profiles")) {
        const obj = (req.headers().accept ?? "").includes("vnd.pgrst.object");
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(obj ? PERFIL : [PERFIL]) });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    }
    if (u.includes("fonts.googleapis.com")) return route.fulfill({ status: 200, contentType: "text/css", body: "" });
    if (u.startsWith(URL_BASE)) return route.continue();
    return route.abort();
  });
  await page.addInitScript((s) => { try { localStorage.setItem("aprendefae-auth", s); } catch { /* */ } }, JSON.stringify(sesion()));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${URL_BASE}/#/${ruta}`);
  if (!(await page.waitForSelector(espera, { timeout: 15000 }).catch(() => null))) {
    await page.reload();
    await page.waitForSelector(espera, { timeout: 20000 }).catch(() => null);
  }
  await page.waitForTimeout(1200);
  return { ctx, page };
}

const nav = await chromium.launch();
for (const esp of ESPECIES) {
  const { ctx, page } = await abrir(nav, perfil(esp, []), "tienda", "[data-accesorio]");
  /* La rejilla entera en una foto: la página completa. */
  await page.screenshot({ path: join(SALIDA, `tienda-${esp}.png`), fullPage: true });
  console.log("foto", `tienda-${esp}.png`);
  await ctx.close();
  /* «Mi avatar» con un conjunto puesto: sombrero, gafas y bufanda. */
  const av = await abrir(nav, perfil(esp, ["vaquero", "gafas_sol", "bufanda"]), "perfil/avatar", "svg.mta");
  await av.page.screenshot({ path: join(SALIDA, `avatar-${esp}.png`) });
  console.log("foto", `avatar-${esp}.png`);
  await av.ctx.close();
}
await nav.close();
