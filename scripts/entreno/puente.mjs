/*
 * El puente de las sondas de salas: cada rpc/<funcion> que pide el navegador
 * se ejecuta en un Postgres local (todas las migraciones) como el usuario con
 * sesion. Lo usan partida.mjs y emotes.mjs. Necesita PGHOST/PGPORT/PGUSER.
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
const require = createRequire(import.meta.url);
export const { chromium } = require("playwright");
export const U = process.argv[2];
const MATEO = "00000000-0000-0000-0000-000000000002";
const ANDREA = "00000000-0000-0000-0000-0000000000a1", KEVIN = "00000000-0000-0000-0000-0000000000a2", SOFI = "00000000-0000-0000-0000-0000000000a3";
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

function psql(sql) {
  try { return { out: execFileSync("psql", ["-v", "ON_ERROR_STOP=1", "-At", "-c", sql], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim() }; }
  catch (e) { return { error: String(e.stderr || e.message).replace(/^.*ERROR:\s*/s, "").split("\n")[0] }; }
}
const firmas = new Map();
function firma(fn) {
  if (!firmas.has(fn)) {
    const r = psql(`select coalesce(array_to_json(p.proargnames), '[]'), to_json(string_to_array(oidvectortypes(p.proargtypes), ', ')), p.proretset
                      from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = ${q(fn)} limit 1`);
    if (!r.out) { firmas.set(fn, null); return null; }
    const [nombres, tipos, set] = r.out.split("|");
    firmas.set(fn, { nombres: JSON.parse(nombres), tipos: JSON.parse(tipos), set: set === "t" });
  }
  return firmas.get(fn);
}
/** Llama a public.<fn>(args) como `uid`. Devuelve { data } o { error }. */
function rpc(uid, fn, args = {}) {
  const f = firma(fn);
  if (!f) return { data: null };
  const lit = q(JSON.stringify(args));
  const partes = Object.keys(args).filter((k) => f.nombres.includes(k)).map((k) => {
    const t = f.tipos[f.nombres.indexOf(k)];
    if (t === "jsonb") return `${k} => (${lit}::jsonb -> ${q(k)})`;
    if (t.endsWith("[]")) return `${k} => array(select jsonb_array_elements_text(${lit}::jsonb -> ${q(k)}))::${t}`;
    return `${k} => (${lit}::jsonb ->> ${q(k)})::${t}`;
  });
  const llamada = `public.${fn}(${partes.join(", ")})`;
  const sel = f.set ? `select coalesce(jsonb_agg(t), '[]') from ${llamada} t` : `select to_jsonb(${llamada})`;
  const claims = q(JSON.stringify({ sub: uid, role: "authenticated" }));
  const r = psql(`select set_config('request.jwt.claims', ${claims}, false); set role authenticated; ${sel}`);
  if (r.error) return { error: r.error };
  const lineas = r.out.split("\n");
  return { data: JSON.parse(lineas[lineas.length - 1] || "null") };
}

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: MATEO, aud: "authenticated", role: "authenticated", email: "e@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const perfil = () => JSON.parse(psql(`select to_jsonb(p) from public.profiles p where user_id = ${q(MATEO)}`).out);

async function abrir(nav, w, h, hash) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const ses = { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: MATEO, exp, role: "authenticated", aud: "authenticated" })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 3 : 2 });
  const page = await ctx.newPage(); page.errores = []; page.on("pageerror", (e) => page.errores.push(e.message));
  await page.route("**/*", async (route) => {
    const req = route.request(), u = req.url();
    if (u.includes("fake.supabase.test")) {
      const j = (b, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(b) });
      if (u.includes("/auth/v1/user")) return j(USER);
      const m = u.match(/\/rest\/v1\/rpc\/([a-z_0-9]+)/);
      if (m) {
        const r = rpc(MATEO, m[1], JSON.parse(req.postData() || "{}"));
        return r.error ? j({ message: r.error, code: "P0001" }, 400) : j(r.data);
      }
      if (u.includes("/rest/v1/profiles")) { const o = (req.headers().accept ?? "").includes("vnd.pgrst.object"); const p = perfil(); return j(o ? p : [p]); }
      return j([]);
    }
    if (u.startsWith(U)) return route.continue();
    if (u.includes("fonts.googleapis")) return route.fulfill({ status: 200, contentType: "text/css", body: "" });
    return route.abort();
  });
  await page.addInitScript((s) => { localStorage.setItem("aprendefae-auth", s); }, JSON.stringify(ses));
  await page.goto(`${U}/${hash}`);
  await page.waitForTimeout(2200);
  return { ctx, page };
}


export { MATEO, ANDREA, KEVIN, SOFI, q, psql, rpc, abrir };
