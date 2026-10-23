/*
 * Abre el panel docente en Chromium con el curso falso, la sesión fingida y
 * las fuentes de producción. Lo comparten vara1.mjs y p7.mjs.
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { curso } from "./curso-falso.mjs";

const AQUI = dirname(fileURLToPath(import.meta.url));
export const RAIZ = resolve(AQUI, "../../..");
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright"); }
export const chromium = pw.chromium;

const FUENTES = process.env.SONDA_FUENTES ?? join(RAIZ, "scripts/t4/sonda-enganche/.sonda-fuentes");
export function hayFuentes() {
  return existsSync(`${FUENTES}/fontsource-inter-5.3.0/package/files/inter-latin-400-normal.woff2`);
}

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000001", aud: "authenticated", role: "authenticated", email: "docente@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
function sesion() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated", email: USER.email })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };
}

/*
 * Devuelve { ctx, page, llamadas, errores }. `llamadas` registra cada RPC con
 * su nombre y su hora (ms desde que se abrió la página), para P8 y para medir
 * B3. `retraso` (ms) simula la latencia de la red en cada RPC.
 */
export async function abrirPanel(navegador, { url, escenario = "normal", ancho = 375, alto = 667, ruta = "#/docente", retraso = 0, falla = null }) {
  const C = curso(escenario);
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const llamadas = [];
  const errores = [];
  const t0 = Date.now();
  page.on("pageerror", (e) => errores.push(String(e)));
  await page.route("**/*", async (route) => {
    const req = route.request();
    const u = req.url();
    if (u.includes("fake.supabase.test")) {
      const m = u.match(/\/rest\/v1\/rpc\/([a-z_]+)/);
      if (m) {
        let cuerpo = {};
        try { cuerpo = req.postDataJSON() ?? {}; } catch { /* sin cuerpo */ }
        llamadas.push({ rpc: m[1], cuerpo, t: Date.now() - t0 });
        if (retraso) await new Promise((r) => setTimeout(r, retraso));
        if (falla && m[1] === falla) return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ code: "XX000", message: "fallo simulado" }) });
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(C.rpc(m[1], cuerpo)) });
      }
      if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER) });
      if (u.includes("/rest/v1/")) {
        const metodo = req.method();
        if (metodo !== "GET" && metodo !== "HEAD") llamadas.push({ rest: u.split("/rest/v1/")[1], metodo, t: Date.now() - t0 });
        const perf = { user_id: USER.id, nickname: "docente", full_name: "Docente de prueba" };
        const obj = (req.headers().accept ?? "").includes("vnd.pgrst.object");
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(u.includes("/profiles") ? (obj ? perf : [perf]) : []) });
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
        for (const w of ws) css += `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(/__f/${fam}/${w}.woff2) format('woff2');}\n`;
      }
      return route.fulfill({ status: 200, contentType: "text/css", body: css });
    }
    if (u.startsWith(url)) return route.continue();
    return route.abort();
  });
  await page.addInitScript((s) => {
    try {
      localStorage.setItem("aprendefae-auth", s);
      /* Que la actividad recordada no dependa de la corrida anterior. */
      for (const k of Object.keys(localStorage)) if (k.startsWith("fae.docente.")) localStorage.removeItem(k);
    } catch { /* sin almacenamiento */ }
  }, JSON.stringify(sesion()));
  /* Movimiento reducido: los números salen puestos y las capturas no pillan la entrada a medias. */
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${url}/${ruta}`);
  return { ctx, page, llamadas, errores, C };
}
