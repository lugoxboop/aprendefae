import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
export const { chromium } = require("playwright");
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const USER = { id: "00000000-0000-0000-0000-000000000002", aud: "authenticated", role: "authenticated", email: "e@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const PERFIL = { user_id: USER.id, id: USER.id, nickname: "Mateo", full_name: "Mateo", points: 988, cristales_balance: 75, streak: 0, mascota_especie: "perro" };
export async function abrir(nav, URL_BASE, w, h, ruta, { docente = true, sesion = true, quieto = false } = {}) {
  const exp = Math.floor(Date.now()/1000)+3600;
  const ses = { access_token: `${b64({alg:"HS256",typ:"JWT"})}.${b64({sub:USER.id,exp,role:"authenticated",aud:"authenticated"})}.f`, token_type:"bearer", expires_in:3600, expires_at:exp, refresh_token:"r", user:USER };
  const ctx = await nav.newContext({ viewport:{width:w,height:h} });
  const page = await ctx.newPage();
  page.errores = []; page.on("pageerror", e => page.errores.push(e.message));
  await page.route("**/*", async (route) => { const req=route.request(), u=req.url();
    if (u.includes("fake.supabase.test")) {
      if (u.includes("/auth/v1/user")) return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(USER)});
      if (u.includes("rpc/es_docente")) return route.fulfill({status:200,contentType:"application/json",body:docente?"true":"false"});
      if (u.includes("/rest/v1/profiles")) { const o=(req.headers().accept??"").includes("vnd.pgrst.object"); return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(o?PERFIL:[PERFIL])}); }
      return route.fulfill({status:200,contentType:"application/json",body:"[]"}); }
    if (u.startsWith(URL_BASE)) return route.continue();
    if (u.includes("fonts.googleapis")) return route.fulfill({status:200,contentType:"text/css",body:""});
    return route.abort(); });
  if (sesion) await page.addInitScript((s)=>{localStorage.setItem("aprendefae-auth",s)}, JSON.stringify(ses));
  if (quieto) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${URL_BASE}/${ruta}`);
  if (sesion) await page.waitForSelector(".fae-cuenta-boton",{timeout:12000}).catch(()=>{}); else await page.waitForTimeout(2500);
  await page.waitForTimeout(1500);
  return { ctx, page };
}
/* Botones visibles cuyo centro está tapado por otra cosa: un toque ahí no llega. */
export function tapados(raiz = null) {
  const out = [];
  const base = raiz ? document.querySelector(raiz) : document;
  for (const el of base.querySelectorAll("button, a[href], [role=button], input, select, summary")) {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    if (r.width < 2 || r.height < 2 || cs.visibility === "hidden" || cs.display === "none" || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    if (el.closest("[aria-hidden=true]") || el.disabled) continue;
    const cx = Math.min(Math.max(r.left + r.width/2, 1), innerWidth-1), cy = Math.min(Math.max(r.top + r.height/2, 1), innerHeight-1);
    const hit = document.elementFromPoint(cx, cy);
    if (!hit || el.contains(hit) || hit.contains(el) && hit === el) continue;
    const nom = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40);
    const tapa = hit.tagName.toLowerCase() + (hit.className && typeof hit.className === "string" ? "." + hit.className.split(" ")[0] : "") + (hit.dataset?.entra !== undefined ? "[data-entra]" : "");
    out.push(`«${nom}» tapado por ${tapa}`);
  }
  return out;
}
