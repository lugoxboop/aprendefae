/*
 * CAPTURAS DE LA PANTALLA DE AMIGOS (rediseño estilo juego, 20-nov). Mismo
 * montaje que scripts/tienda/capturas-tienda.mjs: Supabase falso y sesión
 * fingida, con amigos, solicitudes y retos de mentira servidos por las RPC.
 * Fotografía #/amigos a varios anchos y MIDE desborde horizontal, nombres
 * cortados y cuántas tarjetas de amigo caben en la primera pantalla.
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8099) &
 *   node scripts/amigos/capturas-amigos.mjs http://localhost:8099 carpeta [--vacio] [--ficha] [--buscar]
 *
 *   --vacio   sin amigos ni retos (lo que ve quien recién entra)
 *   --ficha   abre la ficha del primer amigo
 *   --buscar  escribe en el buscador para ver las sugerencias
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const URL_BASE = process.argv[2] ?? "http://localhost:8099";
const SALIDA = process.argv[3] ?? "capturas";
const VACIO = process.argv.includes("--vacio");
const FICHA = process.argv.includes("--ficha");
const BUSCAR = process.argv.includes("--buscar");
mkdirSync(SALIDA, { recursive: true });

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000002", aud: "authenticated", role: "authenticated", email: "estudiante@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const hoy = new Date().toISOString().slice(0, 10);
const PERFIL = {
  user_id: USER.id, id: USER.id, nickname: "Mateo", full_name: "Mateo de prueba",
  points: 988, cristales_balance: 75, streak: 6, last_activity_day: hoy,
  mascota_especie: "zorro", mascota_nombre: "Chispa", mascota_paleta: "natural", mascota_ojos: "natural",
  mascota_accesorios: ["gafas", "gorra", "bufanda"], mascota_puestos: ["gafas_sol", "bufanda"],
};
const t = (n, apodo, especie, paleta, puestos, extra = {}) => ({
  amistad_id: `a${n}`, user_id: `u${n}`, apodo, mascota_especie: especie, mascota_nombre: extra.nombre ?? null,
  mascota_paleta: paleta, mascota_ojos: "natural", mascota_puestos: puestos, racha: extra.racha ?? 0, estudio_hoy: Boolean(extra.hoy),
});
const AMIGOS = {
  amigos: [
    t(1, "Valentina Florez", "gato", "gris", ["corona", "capa"], { nombre: "Misu", racha: 12, hoy: true }),
    t(2, "Alexxx", "perro", "natural", ["gorra", "gafas_sol"], { nombre: "Toby", racha: 3 }),
    t(3, "Sofi_23", "conejo", "arena", ["mago", "medalla"], { nombre: "Copito", hoy: true, racha: 5 }),
    t(4, "Juanpa", "hamster", "canela", ["audifonos"], { nombre: "Nacho" }),
    t(5, "Camila Rodríguez Montoya", "huron", "chocolate", ["vaquero", "corbatin"], { nombre: "Rayo", racha: 1 }),
  ],
  recibidas: [t(6, "Dani.M", "zorro", "jengibre", ["pirata", "parche"], { nombre: "Fuego" })],
  enviadas: [t(7, "Lucía", "gato", "negro", ["birrete"]), t(8, "Tomás", "perro", "chocolate", [])],
};
const otro = (a) => ({ apodo: a.apodo, user_id: a.user_id, mascota_especie: a.mascota_especie, mascota_nombre: a.mascota_nombre, mascota_paleta: a.mascota_paleta, mascota_ojos: "natural", mascota_puestos: a.mascota_puestos });
const manana = new Date(Date.now() + 26 * 3600e3).toISOString();
const RETOS = {
  activos: [
    { id: "r1", meta: 6, bono: 20, vence: manana, avance_mio: 2, avance_otro: 1, otro: otro(AMIGOS.amigos[0]) },
    { id: "r2", meta: 6, bono: 20, vence: manana, avance_mio: 3, avance_otro: 3, otro: otro(AMIGOS.amigos[2]) },
  ],
  invitaciones: [{ id: "r3", meta: 6, bono: 20, otro: otro(AMIGOS.amigos[1]) }],
  enviadas: [],
};
const SUGERENCIAS = [
  { user_id: "s1", apodo: "Valeria", mascota_especie: "conejo", mascota_paleta: "gris", mascota_puestos: ["gorro"] },
  { user_id: "s2", apodo: "Valen_10", mascota_especie: "perro", mascota_paleta: "negro", mascota_puestos: ["casco"] },
  { user_id: "s3", apodo: "Valentino", mascota_especie: "hamster", mascota_paleta: "natural", mascota_puestos: [] },
];

function sesion() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated" })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };
}
const json = (route, body) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

async function abrir(nav, ancho, alto) {
  const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.route("**/*", async (route) => {
    const req = route.request();
    const u = req.url();
    if (u.includes("fake.supabase.test")) {
      if (u.includes("/auth/v1/user")) return json(route, USER);
      if (u.includes("/rpc/es_docente")) return json(route, false);
      if (u.includes("/rpc/amigos_estado")) return json(route, VACIO ? { amigos: [], recibidas: [], enviadas: [] } : AMIGOS);
      if (u.includes("/rpc/retos_estado")) return json(route, VACIO ? { activos: [], invitaciones: [], enviadas: [] } : RETOS);
      if (u.includes("/rpc/amigos_buscar")) return json(route, SUGERENCIAS);
      if (u.includes("/rest/v1/rpc/")) return json(route, []);
      if (u.includes("/rest/v1/profiles")) {
        const obj = (req.headers().accept ?? "").includes("vnd.pgrst.object");
        return json(route, obj ? PERFIL : [PERFIL]);
      }
      return json(route, []);
    }
    if (u.includes("fonts.googleapis.com")) return route.fulfill({ status: 200, contentType: "text/css", body: "" });
    if (u.startsWith(URL_BASE)) return route.continue();
    return route.abort();
  });
  await page.addInitScript((s) => { try { localStorage.setItem("aprendefae-auth", s); } catch { /* */ } }, JSON.stringify(sesion()));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${URL_BASE}/#/amigos`);
  const sel = VACIO ? "[data-agregar-amigo]" : "[data-amigo]";
  if (!(await page.waitForSelector(sel, { timeout: 15000 }).catch(() => null))) {
    await page.reload();
    await page.waitForSelector(sel, { timeout: 20000 });
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  return { ctx, page };
}

function medir() {
  const cartas = [...document.querySelectorAll("[data-amigo]")];
  const cortados = [...document.querySelectorAll("[data-nombre]")].filter((n) => n.scrollWidth > n.clientWidth + 1).map((n) => n.textContent);
  const fuera = [...document.querySelectorAll("button, [data-amigo], [data-reto]")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.left < -0.5 || r.right > innerWidth + 0.5) && !e.closest(".amg-fila"); }).length;
  const chicos = [...document.querySelectorAll("button")].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 43.5) && !b.closest("[data-sugerencias]"); }).map((b) => b.getAttribute("aria-label") || b.textContent.trim().slice(0, 20));
  return {
    barraHorizontal: document.documentElement.scrollWidth > innerWidth + 1,
    amigos: cartas.length,
    enPrimeraPantalla: cartas.filter((c) => { const r = c.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }).length,
    nombresCortados: cortados,
    fueraDePantalla: fuera,
    botonesBajos44: chicos,
    altoPagina: document.documentElement.scrollHeight,
  };
}

const ANCHOS = process.env.ANCHOS ? process.env.ANCHOS.split(",").map((a) => a.split("x").map(Number)) : [[1440, 900], [1280, 800], [768, 1024], [375, 812], [320, 640]];
const sufijo = VACIO ? "-vacio" : FICHA ? "-ficha" : BUSCAR ? "-buscar" : "";
const nav = await chromium.launch();
for (const [ancho, alto] of ANCHOS) {
  const { ctx, page } = await abrir(nav, ancho, alto);
  if (BUSCAR) {
    await page.fill("input[aria-label='Apodo de tu amigo']", "Val");
    await page.waitForSelector("[data-sugerencia]", { timeout: 5000 }).catch(() => null);
    await page.waitForTimeout(400);
  }
  if (FICHA) {
    await page.click("[data-amigo] .amg-tocar");
    await page.waitForSelector("[data-ficha-amigo]");
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: join(SALIDA, `amigos-${ancho}${sufijo}.png`) });
  if (!FICHA && !BUSCAR) await page.screenshot({ path: join(SALIDA, `amigos-${ancho}${sufijo}-completa.png`), fullPage: true });
  console.log(JSON.stringify({ ancho, ...(await page.evaluate(medir)) }));
  await ctx.close();
}
await nav.close();
