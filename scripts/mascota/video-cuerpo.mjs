/*
 * EL CUERPO A MEDIDA EN MOVIMIENTO (25-nov): video del editor de la mascota
 * («Mi avatar», pestaña Cuerpo) a 320 y 375 px, recorriendo la complexión
 * (Flaquito … Gordito), la cabeza (Pequeña … Cabezón) y las poses (Quieta,
 * Feliz, Saluda, Baila). Mismo montaje que capturas-editor.mjs: Supabase falso.
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8099) &
 *   node scripts/mascota/video-cuerpo.mjs http://localhost:8099 carpeta [--prefijo=antes] [--especie=perro] [--puestos=bufanda,audifonos]
 *
 * Deja <prefijo>-<especie>-<ancho>.webm. Cada paso dura 2 s, con un rótulo
 * arriba que dice qué se está mirando.
 */
import { createRequire } from "node:module";
import { mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const SALIDA = process.argv[3] ?? "capturas";
const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const PREFIJO = arg("prefijo") ?? "cuerpo";
const ESPECIE = arg("especie") ?? "perro";
const PUESTOS = (arg("puestos") ?? "bufanda,audifonos").split(",").filter(Boolean);
const ANCHOS = (arg("anchos") ?? "320,375").split(",").map(Number);
mkdirSync(SALIDA, { recursive: true });

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000002", aud: "authenticated", role: "authenticated", email: "estudiante@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const hoy = new Date().toISOString().slice(0, 10);
const PERFIL = {
  user_id: USER.id, id: USER.id, nickname: "Mateo", full_name: "Mateo de prueba",
  points: 988, cristales_balance: 75, streak: 6, last_activity_day: hoy,
  mascota_especie: ESPECIE, mascota_nombre: "Chispa", mascota_paleta: null, mascota_ojos: null,
  mascota_accesorios: ["gorra", "gafas", "bufanda", "audifonos", "corona", "capa", "collar"], mascota_puestos: PUESTOS,
};
function sesion() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated" })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };
}

const PASOS = [
  ["pose", "baila", "Baila · Normal"],
  ["complexion", "2", "Baila · Gordito"],
  ["complexion", "1", "Baila · Rellenito"],
  ["complexion", "-1", "Baila · Delgado"],
  ["complexion", "-2", "Baila · Flaquito"],
  ["complexion", "2", "Baila · Gordito"],
  ["cabeza", "2", "Baila · Gordito + Cabezón"],
  ["cabeza", "-2", "Baila · Gordito + Cabeza pequeña"],
  ["pose", "tranquila", "Quieta · Gordito + Cabeza pequeña"],
  ["complexion", "-2", "Quieta · Flaquito + Cabeza pequeña"],
  ["cabeza", "2", "Quieta · Flaquito + Cabezón"],
  ["pose", "feliz", "Feliz · Flaquito + Cabezón"],
  ["complexion", "2", "Feliz · Gordito + Cabezón"],
  ["pose", "saluda", "Saluda · Gordito + Cabezón"],
  ["complexion", "-2", "Saluda · Flaquito + Cabezón"],
];

const nav = await chromium.launch();
for (const ancho of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: 640 }, deviceScaleFactor: 1, recordVideo: { dir: SALIDA, size: { width: ancho, height: 640 } } });
  const page = await ctx.newPage();
  const perfil = structuredClone(PERFIL);
  await page.route("**/*", async (route) => {
    const req = route.request();
    const u = req.url();
    if (u.includes("fake.supabase.test")) {
      if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER) });
      if (u.includes("/rest/v1/rpc/es_docente")) return route.fulfill({ status: 200, contentType: "application/json", body: "false" });
      const rpc = u.match(/\/rest\/v1\/rpc\/(mascota_\w+)/)?.[1];
      if (rpc) {
        const p = JSON.parse(req.postData() || "{}");
        if (rpc === "mascota_ajustar") { perfil.mascota_complexion = p.p_complexion; perfil.mascota_cabeza = p.p_cabeza; }
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(perfil) });
      }
      if (u.includes("/rest/v1/profiles")) {
        const obj = (req.headers().accept ?? "").includes("vnd.pgrst.object");
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(obj ? perfil : [perfil]) });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    }
    if (u.includes("fonts.googleapis.com")) return route.fulfill({ status: 200, contentType: "text/css", body: "" });
    if (u.startsWith(URL_BASE)) return route.continue();
    return route.abort();
  });
  await page.addInitScript((s) => { try { localStorage.setItem("aprendefae-auth", s); } catch { /* */ } }, JSON.stringify(sesion()));
  await page.goto(`${URL_BASE}/#/perfil/avatar`);
  await page.waitForSelector("svg.mta", { timeout: 20000 });
  await page.click('[data-pestana="cuerpo"]');
  await page.waitForTimeout(600);
  /* El escenario arriba y quieto: los clics van por JS, sin desplazar la página. */
  await page.evaluate(() => {
    const e = document.querySelector("[data-escenario]");
    if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 34);
  });
  await page.evaluate(() => {
    const r = document.createElement("div");
    r.id = "rotulo";
    r.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:99;background:#000c;color:#fff;font:600 14px system-ui;padding:6px 10px;text-align:center";
    document.body.append(r);
  });
  for (const [campo, valor, rotulo] of PASOS) {
    await page.evaluate(([c, v, r]) => {
      const sel = c === "pose" ? `[data-pose="${v}"]` : `[data-ajuste="${c}"] [data-valor="${v}"]`;
      document.querySelector(sel)?.click();
      document.getElementById("rotulo").textContent = r;
    }, [campo, valor, rotulo]);
    await page.waitForTimeout(2000);
  }
  const video = page.video();
  await ctx.close();
  const destino = join(SALIDA, `${PREFIJO}-${ESPECIE}-${ancho}.webm`);
  renameSync(await video.path(), destino);
  console.log("video", destino);
}
await nav.close();
