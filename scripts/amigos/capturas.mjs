/*
 * La fila de amigos de la portada (0170), en los tres estados y tres anchos.
 * Base de Supabase de mentira: amigos_inicio responde lo que diga el caso.
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build --outDir /tmp/dist
 *   (cd /tmp/dist && python3 -m http.server 8100) &
 *   node scripts/amigos/capturas.mjs http://localhost:8100 <carpeta>
 *
 * Mide: que la página no se desborde a lo ancho, botones tapados (tocando con
 * el movimiento puesto), que «Añadir» pase a «Enviada» y que la ficha abra.
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const U = process.argv[2]; const OUT = process.argv[3] ?? "capturas-amigos"; mkdirSync(OUT, { recursive: true });
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000002", aud: "authenticated", role: "authenticated", email: "e@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const PERFIL = { user_id: USER.id, id: USER.id, nickname: "Lugox173", full_name: "Mateo", points: 1021, cristales_balance: 75, streak: 3, mascota_especie: "zorro", mascota_paleta: "natural", mascota_ojos: "natural", mascota_nombre: "Bruno" };
const T = (apodo, especie, paleta, ojos, nombre, puestos, racha, extra = {}) => ({ apodo, mascota_especie: especie, mascota_paleta: paleta, mascota_ojos: ojos, mascota_nombre: nombre, mascota_puestos: puestos, racha, ...extra });
const DEMO = [
  T("valen.conta","gato","gris","verde","Mishi",["gafas"],12), T("Sebas_FAE","perro","canela","natural","Toby",["gorro"],7),
  T("laurita.macro","conejo","arena","azul","Copito",["mono"],21), T("JuanchoDebe","zorro","jengibre","ambar","Rayo",["bufanda"],4),
  T("caro_haber","hamster","natural","miel","Nube",[],9), T("nico.balance","huron","chocolate","natural","Pancho",["gafas"],2),
  T("majo_liquidez","gato","negro","ambar","Luna",["mono"],15), T("DaniPIB","perro","arena","azul","Max",["bigote"],0),
  T("santi.activo","zorro","natural","verde","Kiwi",[],5), T("isa_cuentas","conejo","chocolate","miel","Galleta",["bufanda"],30),
  T("pipe.IVA","hamster","canela","gris","Bolita",["gorro"],3),
].map((t, i) => ({ ...t, demo: true, demo_id: `d${i}`, user_id: null }));
const SUG = [
  T("andrea_m","gato","canela","azul","Michi",[],6), T("kevin.r","perro","negro","ambar","Rocky",["gorra"],0),
  T("sofi_contable","conejo","natural","verde","Nieve",["mono"],11), T("tomasxd","huron","gris","natural","Chispa",[],1),
  T("manu.econ","zorro","canela","miel","Fuego",["gafas"],3), T("gabi_23","hamster","arena","azul","Maní",[],0),
  T("JuliánPérezGómez","perro","chocolate","natural","Coco",[],2),
].map((t, i) => ({ ...t, user_id: `u${i}`, enviada: false, te_pidio: i === 3 }));
const CASOS0 = { mateo: { amigos: DEMO, total: 11, sugerencias: [] }, nuevo: { amigos: [], total: 0, sugerencias: SUG } };

let CASOS;
async function abrir(nav, w, h, caso, { sesion = true } = {}) {
  CASOS = structuredClone(CASOS0);
  const exp = Math.floor(Date.now()/1000)+3600;
  const ses = { access_token: `${b64({alg:"HS256",typ:"JWT"})}.${b64({sub:USER.id,exp,role:"authenticated",aud:"authenticated"})}.f`, token_type:"bearer", expires_in:3600, expires_at:exp, refresh_token:"r", user:USER };
  const ctx = await nav.newContext({ viewport:{width:w,height:h}, deviceScaleFactor: 2 });
  const page = await ctx.newPage(); page.errores = []; page.on("pageerror", e => page.errores.push(e.message));
  await page.route("**/*", async (route) => { const req=route.request(), u=req.url();
    if (u.includes("fake.supabase.test")) {
      const j = (b) => route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(b)});
      if (u.includes("/auth/v1/user")) return j(USER);
      if (u.includes("rpc/es_docente")) return j(true);
      if (u.includes("rpc/amigos_inicio")) return j(CASOS[caso]);
      if (u.includes("rpc/amistad_solicitar")) { const a = JSON.parse(req.postData() || "{}").p_apodo; CASOS[caso].sugerencias = CASOS[caso].sugerencias.map((x) => x.apodo === a ? { ...x, enviada: true } : x); return j({}); }
      if (u.includes("/rest/v1/profiles")) { const o=(req.headers().accept??"").includes("vnd.pgrst.object"); return j(o?PERFIL:[PERFIL]); }
      return j([]); }
    if (u.startsWith(U)) return route.continue();
    if (u.includes("fonts.googleapis")) return route.fulfill({status:200,contentType:"text/css",body:""});
    return route.abort(); });
  if (sesion) await page.addInitScript((s)=>{localStorage.setItem("aprendefae-auth",s)}, JSON.stringify(ses));
  await page.goto(`${U}/#/`);
  if (sesion) await page.waitForSelector("[data-fila-amigos]",{timeout:12000}).catch(()=>{}); else await page.waitForTimeout(2500);
  await page.waitForTimeout(1600);
  return { ctx, page };
}
const nav = await chromium.launch(); const res = []; const ok = (n, c) => res.push(`${c ? "✓" : "✗"} ${n}`);
for (const [w,h,et] of [[320,640,"320"],[375,740,"375"],[1280,800,"1280"]]) {
  for (const caso of ["mateo","nuevo"]) {
    const { ctx, page } = await abrir(nav, w, h, caso);
    const m = await page.evaluate(() => ({ desborde: document.documentElement.scrollWidth - innerWidth, n: document.querySelectorAll("[data-amigo-inicio]").length, modo: document.querySelector("[data-fila-amigos]")?.dataset.filaAmigos }));
    ok(`${et} ${caso}: modo ${m.modo}, ${m.n} círculos, desborde ${m.desborde}px`, m.desborde <= 0 && m.n > 0);
    await page.screenshot({ path: `${OUT}/${caso}-${et}.png` });
    if (caso === "nuevo") {
      await page.click("[data-sugerencia] .fae-sug-boton >> nth=0"); await page.waitForTimeout(500);
      const t = await page.textContent("[data-sugerencia] .fae-sug-boton >> nth=0");
      ok(`${et} «Añadir» pasa a «Enviada» (${t.trim()})`, /Enviada/.test(t));
    }
    await page.click("[data-amigo-inicio] >> nth=1"); await page.waitForTimeout(700);
    const fic = await page.$("[role=dialog]"); ok(`${et} ${caso}: la ficha abre`, Boolean(fic));
    await page.screenshot({ path: `${OUT}/${caso}-ficha-${et}.png` });
    await page.keyboard.press("Escape"); await page.waitForTimeout(300);
    ok(`${et} ${caso}: Escape cierra`, !(await page.$("[role=dialog]")));
    ok(`${et} ${caso}: sin errores de página`, page.errores.length === 0);
    await ctx.close();
  }
  const { ctx, page } = await abrir(nav, w, h, "mateo", { sesion: false });
  ok(`${et} sin sesión: no hay fila`, !(await page.$("[data-fila-amigos]")));
  await ctx.close();
}
await nav.close(); console.log(res.join("\n"));
