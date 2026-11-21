/*
 * EL EDITOR DE LA MASCOTA («Mi avatar», #/perfil/avatar), en fotos (21-nov).
 * Mismo montaje que tienda-por-especie.mjs: Supabase falso y sesión fingida.
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8099) &
 *   node scripts/mascota/capturas-editor.mjs http://localhost:8099 carpeta [--prefijo=despues] [--pestanas]
 *
 * Saca el editor a 1280 y a 375 con un perro vestido; con --pestanas, además
 * una foto por pestaña (Raza, Ojos, Cuerpo, Accesorios) y la rejilla de las
 * siete especies.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const SALIDA = process.argv[3] ?? "capturas";
const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const PREFIJO = arg("prefijo") ?? "editor";
const ESPECIE = arg("especie") ?? "perro";
mkdirSync(SALIDA, { recursive: true });

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000002", aud: "authenticated", role: "authenticated", email: "estudiante@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const hoy = new Date().toISOString().slice(0, 10);
const perfil = (especie, extra = {}) => ({
  user_id: USER.id, id: USER.id, nickname: "Mateo", full_name: "Mateo de prueba",
  points: 988, cristales_balance: 75, streak: 6, last_activity_day: hoy,
  mascota_especie: especie, mascota_nombre: "Chispa", mascota_paleta: null, mascota_ojos: null,
  mascota_accesorios: ["gorra", "gafas", "bufanda", "corona", "capa", "collar"], mascota_puestos: ["bufanda"],
  ...extra,
});
function sesion() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated" })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };
}

async function abrir(nav, PERFIL, ancho, alto = 900) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.route("**/*", async (route) => {
    const req = route.request();
    const u = req.url();
    if (u.includes("fake.supabase.test")) {
      if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER) });
      if (u.includes("/rest/v1/rpc/es_docente")) return route.fulfill({ status: 200, contentType: "application/json", body: "false" });
      /* Las funciones de la mascota devuelven la fila con el cambio aplicado. */
      const rpc = u.match(/\/rest\/v1\/rpc\/(mascota_\w+)/)?.[1];
      if (rpc) {
        const p = JSON.parse(req.postData() || "{}");
        if (rpc === "mascota_personalizar") PERFIL.mascota_paleta = p.p_paleta === "natural" ? null : p.p_paleta;
        if (rpc === "mascota_ojos_elegir") PERFIL.mascota_ojos = p.p_ojos === "natural" ? null : p.p_ojos;
        if (rpc === "mascota_ajustar") PERFIL.mascota_ajustes = { complexion: p.p_complexion, cabeza: p.p_cabeza };
        if (rpc === "mascota_elegir") PERFIL.mascota_especie = p.p_especie;
        if (rpc === "mascota_accesorio_equipar") {
          const s = new Set(PERFIL.mascota_puestos);
          if (p.p_poner) s.add(p.p_clave); else s.delete(p.p_clave);
          PERFIL.mascota_puestos = [...s];
        }
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(PERFIL) });
      }
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
  await page.goto(`${URL_BASE}/#/perfil/avatar`);
  if (!(await page.waitForSelector("svg.mta", { timeout: 15000 }).catch(() => null))) {
    await page.reload();
    await page.waitForSelector("svg.mta", { timeout: 20000 }).catch(() => null);
  }
  await page.waitForTimeout(1200);
  return { ctx, page };
}

const nav = await chromium.launch();
for (const ancho of [1280, 375]) {
  const { ctx, page } = await abrir(nav, perfil(ESPECIE), ancho);
  await page.screenshot({ path: join(SALIDA, `${PREFIJO}-${ancho}.png`), fullPage: true });
  console.log("foto", `${PREFIJO}-${ancho}.png`);
  if (process.argv.includes("--pestanas")) {
    for (const p of ["raza", "ojos", "cuerpo", "accesorios"]) {
      const b = await page.$(`[data-pestana="${p}"]`);
      if (!b) continue;
      await b.click();
      await page.waitForTimeout(500);
      /* Un cambio en cada pestaña, para que la foto muestre que se aplica. */
      if (p === "raza") await page.click("[data-color]:nth-of-type(4)").catch(() => {});
      if (p === "ojos") await page.click('[data-ojos="azul"]').catch(() => {});
      if (p === "cuerpo") await page.click('[data-ajuste="complexion"] [data-valor="2"]').catch(() => {});
      if (p === "accesorios") await page.click('[data-accesorio="gorra"]').catch(() => {});
      await page.waitForTimeout(900);
      await page.screenshot({ path: join(SALIDA, `${PREFIJO}-${ancho}-${p}.png`), fullPage: ancho < 600 });
      console.log("foto", `${PREFIJO}-${ancho}-${p}.png`);
    }
  }
  await ctx.close();
}
await nav.close();
