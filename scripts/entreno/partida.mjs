/*
 * Sonda de las salas de entrenamiento (0172): juega una partida COMPLETA con
 * la base de verdad (un Postgres local con todas las migraciones), no con
 * respuestas inventadas. Cada llamada rpc/<función> del sitio se ejecuta en
 * ese Postgres como el usuario con sesión; los demás jugadores actúan con
 * psql directo. Los amigos de demostración juegan solos (lo hace la base).
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8100) &
 *   PGHOST=/var/tmp PGPORT=5444 PGUSER=postgres node scripts/entreno/partida.mjs http://localhost:8100 <carpeta>
 *
 * Mide: que ninguna pantalla se desborde a lo ancho (320, 375, 1280), que el
 * lobby muestre a los que entraron y a los invitados, la cuenta atrás, que
 * la pregunta se cierre cuando todos respondieron, y que llegue el podio.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const U = process.argv[2]; const OUT = process.argv[3] ?? "capturas-salas"; mkdirSync(OUT, { recursive: true });

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
export function rpc(uid, fn, args = {}) {
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

const res = []; const ok = (n, c) => res.push(`${c ? "✓" : "✗"} ${n}`);
const desborde = (page) => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
async function foto(page, nombre, et) {
  const d = await desborde(page);
  ok(`${et} ${nombre}: sin desborde (${d}px)`, d <= 0);
  if (d > 0) console.log(nombre, await page.evaluate(() => [...document.querySelectorAll("body *")]
    .filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest(".fae-mesh-blob, .sal-arena, .sal-confeti") && !e.classList.contains("fae-mesh-blob") && ![...e.children].some((c) => c.getBoundingClientRect().right > innerWidth + 1))
    .slice(0, 5).map((e) => `${e.tagName}.${e.className?.baseVal ?? e.className} «${(e.textContent || "").slice(0, 30)}» ${Math.round(e.getBoundingClientRect().right)}`)));
  await page.screenshot({ path: `${OUT}/${nombre}-${et}.png`, fullPage: nombre === "05-crear" });
}

const nav = await chromium.launch();
const ANCHOS = [[375, 812, "375"], [1280, 860, "1280"], [320, 640, "320"]].filter(([, , et]) => !process.env.ANCHOS || process.env.ANCHOS.split(",").includes(et));
for (const [w, h, et] of ANCHOS) {
  /* Cada ancho empieza limpio: se cierran las salas abiertas de todos. */
  psql(`update public.entreno_salas set estado = 'cerrada' where estado <> 'cerrada'`);
  /* Andrea invita a Mateo a su sala: para ver la invitación. */
  const preg = JSON.stringify([{ enunciado: "x", opciones: [{ id: "a", texto: "A" }, { id: "b", texto: "B" }], correcta: "a" }]);
  rpc(ANDREA, "entreno_crear", { p_nombre: "Repaso antes del parcial", p_materia: "contabilidad", p_tema: "introduccion-contabilidad", p_tema_titulo: "Introducción a la contabilidad", p_duracion: 30, p_preguntas: JSON.parse(preg), p_invitar: [MATEO], p_demos: [] });

  /* 1. La portada: el círculo «Jugar en sala» y el aviso de la invitación; la ficha con «Retar a un duelo». */
  let { ctx, page } = await abrir(nav, w, h, "#/");
  ok(`${et} portada: aviso de invitación`, Boolean(await page.$("[data-aviso-sala]")));
  ok(`${et} portada: círculo «Jugar en sala»`, Boolean(await page.$("[data-ir-salas]")));
  await foto(page, "01-portada", et);
  await page.click("[data-amigo-inicio] >> nth=0"); await page.waitForTimeout(700);
  ok(`${et} ficha del amigo: «Retar a un duelo»`, Boolean(await page.$("[data-retar-duelo]")));
  if (et !== "320") await page.screenshot({ path: `${OUT}/02-ficha-duelo-${et}.png` });
  await ctx.close();

  /* 2. Amigos, con la franja de las salas. */
  ({ ctx, page } = await abrir(nav, w, h, "#/amigos"));
  ok(`${et} amigos: franja de salas`, Boolean(await page.$("[data-banner-salas]")));
  await foto(page, "03-amigos", et);
  await ctx.close();

  /* 3. La portada de las salas; 4. crear. */
  ({ ctx, page } = await abrir(nav, w, h, "#/salas"));
  ok(`${et} salas: invitación de andrea`, Boolean(await page.$("[data-sal-invitacion]")));
  await foto(page, "04-salas-inicio", et);
  await page.click("[data-sal-crear]"); await page.waitForTimeout(1500);
  for (const a of ["kevin.r", "sofi_contable", "valen.conta", "laurita.macro"]) await page.click(`[data-sal-invitar="${a}"]`);
  await page.click(`[data-sal-materia="contabilidad"]`);
  await page.waitForTimeout(300);
  const temas = await page.$$("[data-sal-tema]");
  if (temas[1]) await temas[1].click();
  await page.click("text=5 >> nth=0").catch(() => {});
  await foto(page, "05-crear", et);

  /* 5. El lobby. Kevin entra y se pone listo; Sofi sigue «invitada». */
  await page.click("[data-sal-confirmar]"); await page.waitForSelector("[data-sal-fase=lobby]", { timeout: 8000 });
  const sala = await page.evaluate(() => location.hash.split("/s-")[1]);
  rpc(KEVIN, "entreno_entrar", { p_sala: sala }); rpc(KEVIN, "entreno_listo", { p_sala: sala, p_listo: true });
  await page.waitForTimeout(3800);
  const n = await page.$$eval("[data-sal-jugador]", (x) => x.length);
  const inv = await page.$$eval("[data-sal-invitado]", (x) => x.length);
  ok(`${et} lobby: 4 jugadores (Mateo, Kevin, 2 demo) y 1 invitada (${n}/${inv})`, n === 4 && inv === 1);
  await page.waitForTimeout(900);
  await foto(page, "06-lobby", et);

  /* 6. Empezar: cuenta atrás. */
  await page.click("[data-sal-empezar]"); await page.waitForTimeout(1200);
  ok(`${et} cuenta atrás`, Boolean(await page.$("[data-sal-cuenta-atras]")));
  if (et !== "320") await page.screenshot({ path: `${OUT}/07-cuenta-atras-${et}.png` });

  /* 7. Las preguntas: Kevin responde por psql, Mateo toca la primera opción. */
  const total = Number(psql(`select total from public.entreno_salas where id = ${q(sala)}`).out);
  for (let i = 0; i < total; i++) {
    await page.waitForSelector("[data-sal-fase=pregunta] [data-vivo-opcion]", { timeout: 12000 });
    if (i === 0) {
      await page.waitForTimeout(4200); // que los bots alcancen a «responder»
      await foto(page, "08-pregunta", et);
    }
    const opciones = JSON.parse(rpc(KEVIN, "entreno_estado", { p_sala: sala }).data.pregunta ? JSON.stringify(rpc(KEVIN, "entreno_estado", { p_sala: sala }).data.pregunta.opciones) : "[]");
    if (opciones[0]) rpc(KEVIN, "entreno_responder", { p_sala: sala, p_indice: i, p_opcion: opciones[i % opciones.length].id });
    await page.click("[data-vivo-opcion] >> nth=0");
    await page.waitForSelector("[data-sal-fase=resultados]", { timeout: 9000 });
    if (i === 0) {
      ok(`${et} la pregunta se cierra cuando todos respondieron`, true);
      await page.waitForTimeout(900);
      await foto(page, "09-resultados", et);
    }
    await page.click("[data-sal-fase=resultados] >> text=/Siguiente|Ver el podio/");
    await page.waitForTimeout(400);
  }
  await page.waitForSelector("[data-sal-fase=final]", { timeout: 9000 });
  await page.waitForTimeout(1800);
  ok(`${et} el podio`, Boolean(await page.$("[data-sal-podio]")));
  await foto(page, "10-podio", et);
  ok(`${et} sin errores de página (${page.errores.join(" | ")})`, page.errores.length === 0);
  await ctx.close();

  /* 8. El duelo 1 vs 1 contra Kevin. */
  ({ ctx, page } = await abrir(nav, w, h, `#/salas/duelo-${KEVIN}`));
  await page.waitForTimeout(800);
  ok(`${et} duelo: pantalla VS con Kevin`, (await page.textContent("[data-sal-crear-form]"))?.includes("kevin.r"));
  await foto(page, "11-duelo", et);
  await ctx.close();
}
await nav.close();
console.log(res.join("\n"));
