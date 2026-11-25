/*
 * CAPTURAS Y VIDEO DEL ASISTENTE (rediseño «la mascota te ayuda», 25-nov).
 * Mismo montaje que scripts/tienda/capturas-tienda.mjs: Supabase falso y sesión
 * fingida. Abre un tema, toca el botón del asistente, fotografía el panel a
 * varios anchos y MIDE desborde, que el saludo use el nombre de la mascota y
 * que nada se salga de la pantalla. Con --video graba (a 320 y 375) abrir →
 * saludo → tocar una sugerencia → pensando → respuesta → cerrar.
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8099) &
 *   node scripts/bruno/capturas-asistente.mjs http://localhost:8099 carpeta [--video] [--sin-nombre]
 */
import { createRequire } from "node:module";
import { mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const SALIDA = process.argv[3] ?? "capturas";
const VIDEO = process.argv.includes("--video");
const SIN_NOMBRE = process.argv.includes("--sin-nombre");
const TEMA = process.env.TEMA ?? "cuentas-debe-haber";
mkdirSync(SALIDA, { recursive: true });

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000002", aud: "authenticated", role: "authenticated", email: "estudiante@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const hoy = new Date().toISOString().slice(0, 10);
const PERFIL = {
  user_id: USER.id, id: USER.id, nickname: "Mateo", full_name: "Mateo de prueba",
  points: 988, cristales_balance: 75, streak: 6, last_activity_day: hoy,
  mascota_especie: process.env.ESPECIE ?? "zorro", mascota_nombre: SIN_NOMBRE ? null : (process.env.NOMBRE ?? "Chispa"),
  mascota_paleta: "natural", mascota_ojos: "natural",
  mascota_accesorios: ["gafas", "bufanda"], mascota_puestos: ["gafas", "bufanda"],
};
const RESPUESTA = "Fíjate primero en qué le pasa a la empresa: ¿le entra plata o le sale? Cuando una cuenta de activo como Caja aumenta, piensa en cuál de los dos lados registra los aumentos de los activos. Mira la tabla de la pantalla y compara con el ejemplo de arriba. ¿Qué lado crees que le toca a Caja en esta transacción?";
function sesion() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated" })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };
}

async function abrir(nav, ancho, alto, { video = false } = {}) {
  const ctx = await nav.newContext({
    viewport: { width: ancho, height: alto }, deviceScaleFactor: video ? 1 : 2,
    ...(video ? { recordVideo: { dir: join(SALIDA, "tmp-video"), size: { width: ancho, height: alto } } } : {}),
  });
  const page = await ctx.newPage();
  await page.route("**/*", async (route) => {
    const req = route.request();
    const u = req.url();
    if (u.includes("fake.supabase.test")) {
      if (u.includes("/functions/v1/asistente")) {
        await new Promise((r) => setTimeout(r, 1400));
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ respuesta: RESPUESTA, usadas: 3, limite: 25 }) });
      }
      if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER) });
      if (u.includes("/rest/v1/rpc/es_docente")) return route.fulfill({ status: 200, contentType: "application/json", body: "false" });
      if (u.includes("/rest/v1/rpc/")) return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
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
  if (!video) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${URL_BASE}/#/${TEMA}`);
  if (!(await page.waitForSelector("[data-bruno-abrir]", { timeout: 15000 }).catch(() => null))) {
    await page.reload();
    await page.waitForSelector("[data-bruno-abrir]", { timeout: 20000 });
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  return { ctx, page };
}

function medir() {
  const panel = document.querySelector("[data-bruno-panel]");
  const r = panel?.getBoundingClientRect();
  const lista = document.querySelector("[data-bruno-lista]");
  return {
    barraHorizontal: document.documentElement.scrollWidth > innerWidth + 1,
    panelDentro: r ? r.left >= 0 && r.right <= innerWidth + 0.5 && r.top >= 0 && r.bottom <= innerHeight + 0.5 : null,
    saludo: (lista?.querySelector("[data-bruno-turno]")?.textContent ?? "").slice(0, 40),
    titulo: document.querySelector("[data-bruno-panel] h2")?.textContent ?? "",
    mascotaEnCabecera: Boolean(document.querySelector("[data-bruno-panel] header [data-mascota]")),
    textoCortado: [...document.querySelectorAll("[data-bruno-panel] button, [data-bruno-panel] h2, [data-bruno-panel] p")].some((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== "visible"),
  };
}

const nav = await chromium.launch();
const sufijo = SIN_NOMBRE ? "-sin-nombre" : "";
if (!VIDEO) {
  for (const [ancho, alto] of [[1280, 800], [375, 812], [320, 640]]) {
    const { ctx, page } = await abrir(nav, ancho, alto);
    await page.screenshot({ path: join(SALIDA, `boton-${ancho}${sufijo}.png`) });
    await page.click("[data-bruno-abrir]");
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(SALIDA, `abierto-${ancho}${sufijo}.png`) });
    console.log(JSON.stringify({ ancho, ...(await page.evaluate(medir)) }));
    await page.click("[data-bruno-sugerencia]");
    await page.waitForFunction(() => document.querySelectorAll("[data-bruno-turno='bruno']").length >= 2, null, { timeout: 10000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(SALIDA, `conversacion-${ancho}${sufijo}.png`) });
    await ctx.close();
  }
} else {
  for (const [ancho, alto] of [[320, 640], [375, 812]]) {
    const { ctx, page } = await abrir(nav, ancho, alto, { video: true });
    await page.waitForTimeout(600);
    await page.click("[data-bruno-abrir]");
    await page.waitForTimeout(1600);
    await page.click("[data-bruno-sugerencia]");
    await page.waitForFunction(() => document.querySelectorAll("[data-bruno-turno='bruno']").length >= 2, null, { timeout: 10000 });
    await page.waitForTimeout(2600);
    await page.click("[data-bruno-cerrar]");
    await page.waitForTimeout(1200);
    const v = page.video();
    await ctx.close();
    renameSync(await v.path(), join(SALIDA, `asistente-${ancho}${sufijo}.webm`));
  }
}
await nav.close();
