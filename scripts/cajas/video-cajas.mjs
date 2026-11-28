/*
 * VIDEO DE LAS CAJAS SORPRESA (28-nov) — regla de evidencia visual.
 * Graba en la página real (build con Supabase falso y sesión fingida, como
 * scripts/tienda/capturas-tienda.mjs) el recorrido entero a 320 y 375 px:
 * entrar a la tienda → «Cajas sorpresa» → abrir una caja → la ruleta frena →
 * revelación → «Ponérselo» → cerrar → la colección con el premio.
 * La base se finge: caja_abrir devuelve PREMIO (por defecto la Corona de oro).
 * Saca además los cuadros a 10 por segundo para revisarlos uno por uno.
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8099) &
 *   PREMIO=c_corona_oro CAJA=legendaria node scripts/cajas/video-cajas.mjs http://localhost:8099 carpeta
 */
import { createRequire } from "node:module";
import { mkdirSync, renameSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const SALIDA = process.argv[3] ?? "video-cajas";
const PREMIO = process.env.PREMIO ?? "c_corona_oro";
const RAREZA = process.env.RAREZA ?? "legendario";
const CAJA = process.env.CAJA ?? "legendaria";
const ESPECIE = process.env.ESPECIE ?? "zorro";
const REPETIDO = Boolean(process.env.REPETIDO);
const ANCHOS = (process.env.ANCHOS ?? "320,375").split(",").map(Number);
mkdirSync(SALIDA, { recursive: true });

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000002", aud: "authenticated", role: "authenticated", email: "estudiante@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const hoy = new Date().toISOString().slice(0, 10);
const PRECIOS = { normal: 40, rara: 90, legendaria: 180 };
function perfilInicial() {
  return {
    user_id: USER.id, id: USER.id, nickname: "Mateo", full_name: "Mateo de prueba",
    points: 988, cristales_balance: 400, streak: 6, last_activity_day: hoy,
    mascota_especie: ESPECIE, mascota_nombre: "Chispa", mascota_paleta: "natural", mascota_ojos: "natural",
    mascota_accesorios: ["gafas", "bufanda", "c_gorro_menta", "aura_chispas", ...(REPETIDO ? [PREMIO] : [])],
    mascota_puestos: ["bufanda"],
  };
}
function sesion() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated" })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };
}

const nav = await chromium.launch();
for (const ancho of ANCHOS) {
  const alto = ancho === 320 ? 640 : 812;
  let PERFIL = perfilInicial();
  const dir = join(SALIDA, `tmp-${ancho}`);
  rmSync(dir, { recursive: true, force: true });
  const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 2, recordVideo: { dir, size: { width: ancho, height: alto } } });
  const page = await ctx.newPage();
  await page.route("**/*", async (route) => {
    const req = route.request();
    const u = req.url();
    if (u.includes("fake.supabase.test")) {
      if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER) });
      if (u.includes("/rest/v1/rpc/es_docente")) return route.fulfill({ status: 200, contentType: "application/json", body: "false" });
      if (u.includes("/rest/v1/rpc/caja_abrir")) {
        const reembolso = REPETIDO ? 90 : 0;
        PERFIL = {
          ...PERFIL,
          cristales_balance: PERFIL.cristales_balance - PRECIOS[CAJA] + reembolso,
          mascota_accesorios: PERFIL.mascota_accesorios.includes(PREMIO) ? PERFIL.mascota_accesorios : [...PERFIL.mascota_accesorios, PREMIO],
        };
        await new Promise((r) => setTimeout(r, 450));
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ perfil: PERFIL, cosmetico: PREMIO, rareza: RAREZA, repetido: REPETIDO, reembolso }) });
      }
      if (u.includes("/rest/v1/rpc/mascota_accesorio_equipar")) {
        const { p_clave, p_poner } = JSON.parse(req.postData() || "{}");
        PERFIL = { ...PERFIL, mascota_puestos: p_poner ? [...new Set([...PERFIL.mascota_puestos, p_clave])] : PERFIL.mascota_puestos.filter((k) => k !== p_clave) };
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(PERFIL) });
      }
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
  await page.goto(`${URL_BASE}/#/tienda`);
  if (!(await page.waitForSelector("[data-seccion='cajas']", { timeout: 15000 }).catch(() => null))) {
    await page.reload();
    await page.waitForSelector("[data-seccion='cajas']", { timeout: 20000 });
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await page.click("[data-seccion='cajas']");
  await page.waitForTimeout(700);
  const caja = page.locator(`[data-caja='${CAJA}']`);
  await caja.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const medidas = await page.evaluate(() => ({
    barraHorizontal: document.documentElement.scrollWidth > innerWidth + 1,
    cajasFuera: [...document.querySelectorAll("[data-caja]")].some((c) => { const r = c.getBoundingClientRect(); return r.left < 0 || r.right > innerWidth + 0.5; }),
  }));
  await page.click(`[data-abrir-caja='${CAJA}']`);
  /* Mientras gira: dónde queda la marca respecto del premio, cuadro a cuadro. */
  await page.waitForSelector("[data-ruleta]", { timeout: 10000 });
  await page.waitForSelector("[data-revelado]", { timeout: 15000 });
  const bajoMarca = await page.evaluate(() => {
    const v = document.querySelector(".cjs-velo");
    return v ? v.getAttribute("data-apertura") : null;
  });
  await page.waitForTimeout(2600);
  const poner = await page.$("[data-poner-premio]");
  if (poner) { await poner.click(); await page.waitForTimeout(1500); }
  await page.click("[data-cerrar-apertura]");
  await page.waitForTimeout(600);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(1500);
  const final = await page.evaluate((premio) => ({
    puesto: [...document.querySelectorAll("[data-puestos] li")].map((l) => l.textContent.trim()),
    enColeccion: document.querySelector(`[data-cosmetico='${premio}']`)?.getAttribute("data-mio"),
    saldo: document.querySelector("[data-saldo]")?.textContent,
  }), PREMIO);
  console.log(JSON.stringify({ ancho, ...medidas, fase: bajoMarca, ...final }));
  await ctx.close();
  const webm = readdirSync(dir).find((f) => f.endsWith(".webm"));
  const mp4 = join(SALIDA, `cajas-${ancho}${REPETIDO ? "-repetido" : ""}.mp4`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(dir, webm), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "26", "-movflags", "+faststart", mp4]);
  const cuadros = join(SALIDA, `cuadros-${ancho}`);
  rmSync(cuadros, { recursive: true, force: true });
  mkdirSync(cuadros, { recursive: true });
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mp4, "-vf", "fps=10", join(cuadros, "c%04d.png")]);
  rmSync(dir, { recursive: true, force: true });
}
await nav.close();
