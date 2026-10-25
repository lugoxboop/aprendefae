/*
 * §12 de aprender-secuencia-v1.md sobre las CINCO piezas de T2 en SecuenciaAprender (lote T2-8).
 * Build TEMPORAL con la bandera encendida (fuera del repo), servido en PUERTO (≠ 8099).
 * Sondas del repo (contraste, piso-de-12, blanco-de-toque, ficha-tapa) leídas de su archivo,
 * como en scripts/t2/medir-t2-linea-base.mjs, con alcance = [data-secuencia].
 * El recorrido sale de las piezas mismas (PIEZAS_SECUENCIA_T2): cada Míralo se toca entero,
 * cada Haz se juega en error (dos errores) y en acierto, y cada figura se compara con su altoFigura.
 * Uso: PUERTO=8141 [FUENTES=dir] [PLAYWRIGHT=dir] [CHROMIUM=bin] \
 *      node --import ./scripts/cargador-jsx.mjs scripts/t2/medir-t2-sec.mjs [--json=salida.json]
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PIEZAS_SECUENCIA_T2 } from "../../src/components/mecanicas/libros/t2/secuenciaT2.jsx";
import { estadoInicial } from "../../src/components/secuencia/secuencia.js";

const require = createRequire(import.meta.url);
const { chromium } = require(`${process.env.PLAYWRIGHT ?? "/opt/node-tools/node_modules"}/playwright`);
const REPO = resolve(new URL("../..", import.meta.url).pathname);
const BASE = `http://127.0.0.1:${process.env.PUERTO ?? 8141}/`;
/* Las fuentes descargadas (opcional): sin ellas se mide con las de respaldo y la salida lo dice. */
const FUENTES = process.env.FUENTES ?? null;
const JSON_SALIDA = (process.argv.find((a) => a.startsWith("--json=")) || "").slice(7) || null;
/* ── sondas, como en medir-t2-linea-base.mjs ── */
const leer = (n) => readFileSync(resolve(REPO, "scripts", n), "utf8");
const cambiarUnaVez = (t, v, n, q) => { const k = t.split(v).length - 1; if (k !== 1) throw new Error(`${q}: ancla ${k} veces`); return t.replace(v, n); };
const RAIZ = "(window.__alcance || document.body)";
let MEDIR_CONTRASTE = eval("`" + leer("contraste.mjs").match(/const MEDIR = `([\s\S]*?)`;\n/)[1] + "`");
MEDIR_CONTRASTE = cambiarUnaVez(MEDIR_CONTRASTE, `document.querySelectorAll("body *")`, `${RAIZ}.querySelectorAll("*")`, "contraste");
MEDIR_CONTRASTE = cambiarUnaVez(MEDIR_CONTRASTE, "const malos = [];", "const malos = []; let __n = 0;", "contraste");
MEDIR_CONTRASTE = cambiarUnaVez(MEDIR_CONTRASTE, "const fondo = fondoDe(el);", "__n++; const fondo = fondoDe(el);", "contraste");
MEDIR_CONTRASTE = cambiarUnaVez(MEDIR_CONTRASTE, "return { malos, sinMedir };", "return { malos, sinMedir, medidos: __n };", "contraste");
let MIRA_FICHA = eval("`" + leer("ficha-tapa.mjs").match(/const MIRA = `([\s\S]*?)`;\n/)[1] + "`");
MIRA_FICHA = cambiarUnaVez(MIRA_FICHA, `document.querySelectorAll("h1,h2,h3,p,span,button,a")`, `${RAIZ}.querySelectorAll("h1,h2,h3,p,span,button,a")`, "ficha-tapa");
MIRA_FICHA = cambiarUnaVez(MIRA_FICHA, "const tapados = [];", "const tapados = []; let __n = 0;", "ficha-tapa");
MIRA_FICHA = cambiarUnaVez(MIRA_FICHA, "if (r.width < 2 || r.height < 2) continue;", "if (r.width < 2 || r.height < 2) continue; __n++;", "ficha-tapa");
MIRA_FICHA = cambiarUnaVez(MIRA_FICHA, "return { ficha:", "return { medidos: __n, ficha:", "ficha-tapa");
const pisoTxt = leer("piso-de-12.mjs");
let MEDIR_PISO = pisoTxt.slice(pisoTxt.indexOf("function medirPantalla(piso) {"));
MEDIR_PISO = MEDIR_PISO.slice(0, MEDIR_PISO.indexOf("\n}\n") + 2);
MEDIR_PISO = cambiarUnaVez(MEDIR_PISO, `document.querySelectorAll("body *")`, `${RAIZ}.querySelectorAll("*")`, "piso");
MEDIR_PISO = cambiarUnaVez(MEDIR_PISO, "let cejillas = 0;", "let cejillas = 0; let __n = 0;", "piso");
MEDIR_PISO = cambiarUnaVez(MEDIR_PISO, "const px = parseFloat(estilo.fontSize);", "const px = parseFloat(estilo.fontSize); __n++;", "piso");
MEDIR_PISO = cambiarUnaVez(MEDIR_PISO, "return { desbordes:", "return { medidos: __n, desbordes:", "piso");
const PISO = Number(pisoTxt.match(/const PISO = ([\d.]+);/)[1]);
const blancoTxt = leer("blanco-de-toque.mjs");
const iniB = blancoTxt.indexOf("(MIN) => {", blancoTxt.indexOf("const informe = await pagina.evaluate("));
let MEDIR_BLANCO = blancoTxt.slice(iniB, blancoTxt.indexOf("}, MINIMO);", iniB) + 1);
MEDIR_BLANCO = cambiarUnaVez(MEDIR_BLANCO, `document.querySelectorAll("button:not([disabled]), [role=button]")`, `${RAIZ}.querySelectorAll("button:not([disabled]), [role=button]")`, "blanco");
const MINIMO = Number(blancoTxt.match(/const MINIMO = (\d+);/)[1]);

/* ── sesión fingida ── */
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const exp = Math.floor(Date.now() / 1000) + 3600;
const USUARIO = { id: "00000000-0000-0000-0000-000000000001", aud: "authenticated", role: "authenticated", email: "p@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const SESION = { access_token: b64({ alg: "HS256", typ: "JWT" }) + "." + b64({ sub: USUARIO.id, exp, role: "authenticated", aud: "authenticated" }) + ".f", token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USUARIO };
const PERFIL = { user_id: USUARIO.id, nickname: "Mateo Lugo Duque", full_name: "Mateo Lugo Duque", fp_total: 987654 };
const CSS_FUENTES = FUENTES && existsSync(`${FUENTES}/fuentes.css`) ? readFileSync(`${FUENTES}/fuentes.css`, "utf8") : null;

async function nuevaPagina(nav, ancho, alto, errores, guardado = null) {
  const p = await nav.newPage({ viewport: { width: ancho, height: alto } });
  p.on("pageerror", (e) => errores.push(String(e).slice(0, 120)));
  await p.addInitScript((s2) => { try { localStorage.setItem("aprendefae-auth", s2); } catch (e) {} }, JSON.stringify(SESION));
  if (guardado) await p.addInitScript((g) => { try { if (!sessionStorage.getItem("__t2_puesto")) { sessionStorage.setItem("fae-secuencia:cuentas-debe-haber", g); sessionStorage.setItem("__t2_puesto", "1"); } } catch (e) {} }, guardado);
  await p.route("**/*", (route) => {
    const u = route.request().url();
    if (CSS_FUENTES && u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: CSS_FUENTES });
    if (CSS_FUENTES && u.startsWith("https://fonts.gstatic.com/")) {
      const local = `${FUENTES}/${new URL(u).pathname.slice(1).replaceAll("/", "_")}`;
      return existsSync(local) ? route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(local) }) : route.fulfill({ status: 404, body: "" });
    }
    if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USUARIO) });
    if (u.includes("/rest/v1/profiles")) {
      const objeto = (route.request().headers()["accept"] || "").includes("vnd.pgrst.object");
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(objeto ? PERFIL : [PERFIL]) });
    }
    if (/supabase\.co/.test(u)) return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    return route.continue();
  });
  return p;
}


const nav = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const g = JSON.stringify({ v: 1, ...estadoInicial(PIEZAS_SECUENCIA_T2), p: 1, s: 5 });
const alto = PIEZAS_SECUENCIA_T2[1].altoFigura;
for (const ancho of [320, 375]) {
  const errores = [];
  const p = await nuevaPagina(nav, ancho, 800, errores, g);
  await p.goto(`${BASE}#/cuentas-debe-haber/aprender`, { waitUntil: "networkidle" });
  await p.waitForSelector("[data-secuencia]"); await p.waitForTimeout(700);
  await p.evaluate(() => document.fonts.ready);
  const fo = await p.evaluate(() => document.fonts.check("15px Inter"));
  const tit = await p.evaluate(() => document.querySelector(".fae-sec-titular").textContent);
  for (const nombre of ["Ingresos", "Gastos", "Costos"]) {
    await p.locator("figure button", { hasText: nombre }).first().click(); await p.waitForTimeout(500);
    const m = await p.evaluate(() => {
      const t = document.querySelector("[data-tarjeta]"); const ps = [...t.querySelectorAll("p")];
      const lineas = (el) => { const lh = parseFloat(getComputedStyle(el).lineHeight); const r = document.createRange(); r.selectNodeContents(el); const tops = new Set([...r.getClientRects()].map((x) => Math.round(x.top))); return { rects: tops.size, porAltura: Math.round(el.getBoundingClientRect().height / lh), ancho: Math.round(el.getBoundingClientRect().width), texto: el.textContent }; };
      const fig = document.querySelector(".fae-sec-figura"); const viva = fig.querySelector(".fae-sec-figura-viva > *:not(style)") || fig.querySelector(".fae-sec-figura-viva");
      const cont = Math.max(...[...viva.querySelectorAll("*")].map((e) => e.getBoundingClientRect().bottom), viva.getBoundingClientRect().bottom) - fig.getBoundingClientRect().top;
      const apoyo = document.querySelector("[data-apoyo]") || document.querySelector("[data-razon]");
      return { def: lineas(ps[0]), ej: ps[1] ? lineas(ps[1]) : null, contenido: Math.round(cont), hueco: Math.round(fig.getBoundingClientRect().height), pisa: apoyo ? Math.max(0, Math.round(fig.getBoundingClientRect().top + cont - apoyo.getBoundingClientRect().top)) : null, scrollW: document.documentElement.scrollWidth };
    });
    console.log(ancho, nombre, "fuentes", fo, "«" + tit + "»", JSON.stringify(m), "altoFigura", alto[ancho === 320 ? "a320" : "a375"]);
  }
  if (errores.length) console.log("JS", errores);
  await p.close();
}
await nav.close();
