/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CAPTURAS Y MEDIDAS DEL PANEL DE CUENTA (la sidebar de la izquierda).
 *
 * Abre el sitio construido con Supabase falso y una sesión fingida —el mismo
 * truco que scripts/t4/panel-docente/pagina.mjs—, con un perfil de estudiante
 * de verdad (FP, Cristales, racha), y fotografía:
 *
 *   portada      cerrada y con el panel abierto
 *   un tema      con título en la cabecera (Contabilidad), cerrado y abierto
 *
 * a 1280, 375 y 320 px. Además MIDE lo que puede salir mal y no se ve en una
 * captura: que haya barra horizontal, que el botón de cuenta pise el título o
 * el botón de volver, y que el panel quede dentro de la pantalla.
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8099) &
 *   node scripts/cuenta/capturas-sidebar.mjs http://localhost:8099 carpeta-de-capturas
 * ═══════════════════════════════════════════════════════════════════════════
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
mkdirSync(SALIDA, { recursive: true });
const FUENTES = join(RAIZ, "scripts/t4/sonda-enganche/.sonda-fuentes");
if (!existsSync(FUENTES)) console.warn("⚠ Sin fuentes (bash scripts/t4/sonda-enganche/fuentes.sh): la letra es la de respaldo.");

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000002", aud: "authenticated", role: "authenticated", email: "estudiante@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const hoy = new Date().toISOString().slice(0, 10);
const PERFIL = {
  user_id: USER.id, id: USER.id, nickname: "Mateo", full_name: "Mateo de prueba",
  points: 988, cristales_balance: 75, streak: 6, last_activity_day: hoy,
  mascota_especie: "perro",
};
function sesion() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated" })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };
}

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
  await page.emulateMedia({ reducedMotion: video ? "no-preference" : "reduce" });
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

/* Lo que una captura no dice: choques y desbordes, en números. */
function medir() {
  const r = (el) => el?.getBoundingClientRect();
  const pisa = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  const atajo = document.querySelector(".fae-atajo-pastilla");
  const visible = atajo && getComputedStyle(atajo).display !== "none";
  /* La cuenta y, si se ve, el atajo docente: lo que flota arriba a la izquierda. */
  const c = document.querySelector(".fae-cuenta-boton").getBoundingClientRect();
  const a = visible ? atajo.getBoundingClientRect() : null;
  const cuenta = a ? { left: c.left, top: Math.min(c.top, a.top), right: a.right, bottom: Math.max(c.bottom, a.bottom) } : c;
  const h1 = r(document.querySelector("h1"));
  const volver = r([...document.querySelectorAll("button")].find((b) => /volver/i.test(b.getAttribute("aria-label") ?? b.textContent)));
  const panel = r(document.querySelector("[data-panel-cuenta]"));
  const logo = r(document.querySelector(".fae-logo-boton"));
  return {
    anchoCuenta: Math.round(cuenta.right - cuenta.left),
    cuentaPisaLogo: !!pisa(cuenta, logo),
    barraHorizontal: document.documentElement.scrollWidth > innerWidth + 1,
    cuentaPisaTitulo: !!pisa(cuenta, h1),
    cuentaPisaVolver: !!pisa(cuenta, volver),
    panel: panel ? { izquierda: Math.round(panel.left), ancho: Math.round(panel.width), dentro: panel.left >= 0 && panel.right <= innerWidth + 0.5 } : null,
  };
}

const VISTAS = [
  { nombre: "portada", ruta: "" },
  { nombre: "tema", ruta: "#/introduccion-contabilidad" },
  { nombre: "perfil", ruta: "#/perfil" },
  { nombre: "tienda", ruta: "#/tienda" },
];
const ANCHOS = [[1280, 800], [1024, 768], [768, 1024], [375, 667], [320, 568]];

const nav = await chromium.launch();

/* --video: graba abrir y cerrar el panel a 375 y 1280, para ver la animación. */
if (process.argv.includes("--video")) {
  for (const [ancho, alto] of [[375, 667], [1280, 800]]) {
    const dir = join(SALIDA, `video-${ancho}`);
    const { ctx, page } = await abrir(nav, ancho, alto, "", false, dir);
    await page.waitForTimeout(600);
    await page.click(".fae-cuenta-boton");
    await page.waitForTimeout(1300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(900);
    await ctx.close();
  }
  await nav.close();
  process.exit(0);
}

for (const docente of [false, true]) {
  for (const v of VISTAS) {
    for (const [ancho, alto] of ANCHOS) {
      const { ctx, page } = await abrir(nav, ancho, alto, v.ruta, docente);
      if (docente) await page.waitForSelector(".fae-atajo-pastilla", { timeout: 5000 }).catch(() => {});
      const pre = docente ? "docente-" : "";
      await page.screenshot({ path: join(SALIDA, `${pre}${v.nombre}-${ancho}-cerrado.png`) });
      const cerrado = await page.evaluate(medir);
      await page.click(".fae-cuenta-boton");
      await page.waitForTimeout(500);
      await page.screenshot({ path: join(SALIDA, `${pre}${v.nombre}-${ancho}-abierto.png`) });
      const abierto = await page.evaluate(medir);
      console.log(JSON.stringify({ docente, vista: v.nombre, ancho, ...cerrado, panel: abierto.panel, barraAbierto: abierto.barraHorizontal }));
      await ctx.close();
    }
  }
}
await nav.close();
