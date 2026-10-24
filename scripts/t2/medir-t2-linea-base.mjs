/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LÍNEA BASE DE T2 «LAS CUENTAS, EL DEBE Y EL HABER» (issue #471, punto 1).
 *
 * Las cuatro sondas del repo (contraste, blanco-de-toque, ficha-tapa,
 * piso-de-12) miden el TEMA de golpe: suman Aprender entero en una cifra y en
 * Hacer apenas pisan el camino. Para una línea base POR PIEZA hace falta
 * llegar a cada pieza, a cada juego y a cada etapa del desafío —las etapas
 * solo se abren terminando la anterior— y medir allí.
 *
 * NO REESCRIBE LA LÓGICA DE MEDIDA: lee el texto de cada sonda y ejecuta SU
 * función de medida. Solo le hace tres retoques textuales, comprobados (si un
 * ancla no aparece exactamente una vez, el script se niega a medir):
 *   · la raíz: en vez de todo el documento, el alcance de la pieza
 *     (section[data-pieza] en Aprender; el contenedor de la vista en Hacer);
 *   · un contador de elementos medidos, para que un cero vacío no pase por
 *     verde;
 *   · nada más.
 *
 * Sesión FINGIDA con la receta de ficha-tapa.mjs (localStorage
 * «aprendefae-auth» + /auth/v1/user, profiles y registrar_fp respondidos
 * aquí; el resto de *.supabase.co, «[]»). Fuentes Inter y Sora servidas
 * desde /tmp/claude-0/fuentes (FUENTES=… para otra carpeta).
 *
 * Cómo se corre (paquete construido con Supabase falso y servido en 8099):
 *   VITE_SUPABASE_URL=https://x.supabase.co VITE_SUPABASE_ANON_KEY=x npx vite build
 *   (cd dist && python3 -m http.server 8099 --bind 127.0.0.1 &)
 *   node scripts/t2/medir-t2-linea-base.mjs [320 375] [--json=salida.json] [--solo=cu-a1]
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const REPO = resolve(import.meta.dirname, "../..");
const BASE = `http://127.0.0.1:${process.env.PUERTO ?? 8099}/`;
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes";
const ANCHOS = process.argv.slice(2).filter((a) => /^\d+$/.test(a)).map(Number);
if (!ANCHOS.length) ANCHOS.push(320, 375);
const JSON_SALIDA = (process.argv.find((a) => a.startsWith("--json=")) || "").slice(7) || null;
const SOLO = (process.argv.find((a) => a.startsWith("--solo=")) || "").slice(7) || null;

/* ─────────────── la lógica de cada sonda, leída de su archivo ─────────────── */
const leer = (n) => readFileSync(resolve(REPO, "scripts", n), "utf8");
const cambiarUnaVez = (texto, viejo, nuevo, quien) => {
  const n = texto.split(viejo).length - 1;
  if (n !== 1) throw new Error(`${quien}: el ancla «${viejo.slice(0, 50)}» aparece ${n} veces (esperaba 1). La sonda cambió: revisa este script.`);
  return texto.replace(viejo, nuevo);
};
const RAIZ = "(window.__alcance || document.body)";

/* contraste.mjs: el cuerpo de MEDIR es un literal de plantilla; se evalúa igual que lo evaluaría la sonda. */
let MEDIR_CONTRASTE = eval("`" + leer("contraste.mjs").match(/const MEDIR = `([\s\S]*?)`;\n/)[1] + "`");
MEDIR_CONTRASTE = cambiarUnaVez(MEDIR_CONTRASTE, `document.querySelectorAll("body *")`, `${RAIZ}.querySelectorAll("*")`, "contraste");
MEDIR_CONTRASTE = cambiarUnaVez(MEDIR_CONTRASTE, "const malos = [];", "const malos = []; let __n = 0;", "contraste");
MEDIR_CONTRASTE = cambiarUnaVez(MEDIR_CONTRASTE, "const fondo = fondoDe(el);", "__n++; const fondo = fondoDe(el);", "contraste");
MEDIR_CONTRASTE = cambiarUnaVez(MEDIR_CONTRASTE, "return { malos, sinMedir };", "return { malos, sinMedir, medidos: __n };", "contraste");

/* ficha-tapa.mjs: MIRA, igual. */
let MIRA_FICHA = eval("`" + leer("ficha-tapa.mjs").match(/const MIRA = `([\s\S]*?)`;\n/)[1] + "`");
MIRA_FICHA = cambiarUnaVez(MIRA_FICHA, `document.querySelectorAll("h1,h2,h3,p,span,button,a")`, `${RAIZ}.querySelectorAll("h1,h2,h3,p,span,button,a")`, "ficha-tapa");
MIRA_FICHA = cambiarUnaVez(MIRA_FICHA, "const tapados = [];", "const tapados = []; let __n = 0;", "ficha-tapa");
MIRA_FICHA = cambiarUnaVez(MIRA_FICHA, "if (r.width < 2 || r.height < 2) continue;", "if (r.width < 2 || r.height < 2) continue; __n++;", "ficha-tapa");
MIRA_FICHA = cambiarUnaVez(MIRA_FICHA, "return { ficha:", "return { medidos: __n, ficha:", "ficha-tapa");

/* piso-de-12.mjs: la función medirPantalla, entera. */
const pisoTxt = leer("piso-de-12.mjs");
let MEDIR_PISO = pisoTxt.slice(pisoTxt.indexOf("function medirPantalla(piso) {"));
MEDIR_PISO = MEDIR_PISO.slice(0, MEDIR_PISO.indexOf("\n}\n") + 2);
MEDIR_PISO = cambiarUnaVez(MEDIR_PISO, `document.querySelectorAll("body *")`, `${RAIZ}.querySelectorAll("*")`, "piso-de-12");
MEDIR_PISO = cambiarUnaVez(MEDIR_PISO, "let cejillas = 0;", "let cejillas = 0; let __n = 0;", "piso-de-12");
MEDIR_PISO = cambiarUnaVez(MEDIR_PISO, "const px = parseFloat(estilo.fontSize);", "const px = parseFloat(estilo.fontSize); __n++;", "piso-de-12");
MEDIR_PISO = cambiarUnaVez(MEDIR_PISO, "return { desbordes:", "return { medidos: __n, desbordes:", "piso-de-12");
const PISO = Number(pisoTxt.match(/const PISO = ([\d.]+);/)[1]);

/* blanco-de-toque.mjs: la función que recibe MIN, desde «(MIN) => {» hasta «}, MINIMO);». */
const blancoTxt = leer("blanco-de-toque.mjs");
const iniB = blancoTxt.indexOf("(MIN) => {", blancoTxt.indexOf("const informe = await pagina.evaluate("));
let MEDIR_BLANCO = blancoTxt.slice(iniB, blancoTxt.indexOf("}, MINIMO);", iniB) + 1);
MEDIR_BLANCO = cambiarUnaVez(MEDIR_BLANCO, `document.querySelectorAll("button:not([disabled]), [role=button]")`, `${RAIZ}.querySelectorAll("button:not([disabled]), [role=button]")`, "blanco-de-toque");
const MINIMO = Number(blancoTxt.match(/const MINIMO = (\d+);/)[1]);

/* ─────────────── sesión fingida (receta de ficha-tapa.mjs) y fuentes ─────────────── */
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const exp = Math.floor(Date.now() / 1000) + 3600;
const USUARIO = { id: "00000000-0000-0000-0000-000000000001", aud: "authenticated", role: "authenticated", email: "p@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const SESION = { access_token: b64({ alg: "HS256", typ: "JWT" }) + "." + b64({ sub: USUARIO.id, exp, role: "authenticated", aud: "authenticated" }) + ".f", token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USUARIO };
const PERFIL = { user_id: USUARIO.id, nickname: process.env.APODO ?? "Mateo Lugo Duque", full_name: "Mateo Lugo Duque", fp_total: 987654 };
const CSS_FUENTES = existsSync(`${FUENTES}/fuentes.css`) ? readFileSync(`${FUENTES}/fuentes.css`, "utf8") : null;

async function nuevaPagina(navegador, ancho, errores) {
  const p = await navegador.newPage({ viewport: { width: ancho, height: 760 } });
  p.on("pageerror", (e) => errores.push(String(e).slice(0, 90)));
  await p.addInitScript((s2) => { try { localStorage.setItem("aprendefae-auth", s2); } catch (e) {} }, JSON.stringify(SESION));
  /* Barajar con semilla: el mismo orden de ítems en los dos anchos. */
  await p.addInitScript(() => {
    let a = 20261023;
    Math.random = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  });
  await p.route("**/*", (route) => {
    const u = route.request().url();
    if (CSS_FUENTES && u.startsWith("https://fonts.googleapis.com/")) return route.fulfill({ status: 200, contentType: "text/css", body: CSS_FUENTES });
    if (CSS_FUENTES && u.startsWith("https://fonts.gstatic.com/")) {
      const local = `${FUENTES}/${new URL(u).pathname.slice(1).replaceAll("/", "_")}`;
      if (existsSync(local)) return route.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(local) });
      return route.fulfill({ status: 404, body: "" });
    }
    if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USUARIO) });
    if (u.includes("/rest/v1/rpc/registrar_fp")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ fp_awarded: 0, repeat_index: 0 }) });
    if (u.includes("/rest/v1/profiles")) {
      const objeto = (route.request().headers()["accept"] || "").includes("vnd.pgrst.object");
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(objeto ? PERFIL : [PERFIL]) });
    }
    if (/supabase\.co/.test(u)) return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    return route.continue();
  });
  return p;
}

/* ─────────────── una medida: las cuatro sondas sobre el estado actual ─────────────── */
function nuevoAcumulado() {
  return {
    estados: 0, fuentesOk: true,
    contraste: { medidos: 0, hallazgos: new Map(), sinMedir: new Set() },
    piso: { medidos: 0, hallazgos: new Set(), cejillas: new Set(), desbordes: new Set(), scrollH: false },
    blanco: { medidos: 0, pequenos: new Map(), tapados: new Map(), fuera: 0, ilustraciones: 0, solapes: new Set() },
    ficha: { medidos: 0, conFicha: 0, sinFicha: 0, tapados: new Set(), glifos: new Set() },
  };
}

async function medirEstado(p, ancho, alcanceSel, acc) {
  acc.estados++;
  await p.evaluate(() => document.fonts.ready);
  const fijar = (sel) => p.evaluate((s) => { window.__alcance = s ? document.querySelector(s) : null; return Boolean(window.__alcance); }, sel);
  if (alcanceSel && !(await fijar(alcanceSel))) throw new Error(`no encontré el alcance ${alcanceSel}`);
  acc.fuentesOk &&= await p.evaluate(() => document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"));
  const yInicial = await p.evaluate(() => window.scrollY);

  /* 1 · contraste y piso de 12, con la ventana de las sondas (1400 de alto). */
  await p.setViewportSize({ width: ancho, height: 1400 });
  await p.waitForTimeout(150);
  const c = await p.evaluate(MEDIR_CONTRASTE);
  acc.contraste.medidos += c.medidos;
  for (const m of c.malos) acc.contraste.hallazgos.set(`${m.r}|${m.px}|${m.texto}`, m);
  for (const t of c.sinMedir) acc.contraste.sinMedir.add(t);
  const pz = await p.evaluate(`(${MEDIR_PISO})(${PISO})`);
  acc.piso.medidos += pz.medidos;
  for (const l of pz.chicas) { acc.piso.hallazgos.add(l); if (l.endsWith("cejilla?")) acc.piso.cejillas.add(l); }
  for (const d of pz.desbordes) acc.piso.desbordes.add(d);
  acc.piso.scrollH ||= pz.scrollH;

  /* 2 · ficha de FP: ventana de 760 como la sonda; en la cima de la página (la ficha se va al pasar de 48 px de scroll) y arriba y abajo del alcance. */
  await p.setViewportSize({ width: ancho, height: 760 });
  await p.waitForTimeout(150);
  for (const donde of ["cima", "arriba", "abajo"]) {
    await p.evaluate((d) => {
      const el = window.__alcance;
      if (d === "cima") { window.scrollTo(0, 0); return; }
      if (!el) { window.scrollTo(0, d === "arriba" ? 0 : document.documentElement.scrollHeight); return; }
      const r = el.getBoundingClientRect();
      const y = window.scrollY + (d === "arriba" ? r.top : r.bottom - window.innerHeight);
      window.scrollTo(0, Math.max(0, y));
    }, donde);
    await p.waitForTimeout(220);
    const f = await p.evaluate(MIRA_FICHA);
    if (f.sinFicha) { acc.ficha.sinFicha++; continue; }
    acc.ficha.conFicha++;
    acc.ficha.medidos += f.medidos;
    for (const t of f.tapados) (t.decorativo ? acc.ficha.glifos : acc.ficha.tapados).add(`${t.tocable ? "CONTROL" : "texto"} «${t.texto}»`);
  }

  /* 3 · blanco de toque: ventana tan alta como la página (dos pasadas, como la sonda). */
  await p.evaluate(() => window.scrollTo(0, 0));
  let alto = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let k = 0; k < 3; k++) {
    await p.setViewportSize({ width: ancho, height: Math.min(Math.max(alto + 200, 820), 16000) });
    await p.waitForTimeout(250);
    const nuevo = await p.evaluate(() => document.documentElement.scrollHeight);
    if (nuevo <= alto) break;
    alto = nuevo;
  }
  const b = await p.evaluate(`(${MEDIR_BLANCO})(${MINIMO})`);
  acc.blanco.medidos += b.medidos.length;
  acc.blanco.fuera = Math.max(acc.blanco.fuera, b.fueraDePantalla);
  acc.blanco.ilustraciones = Math.max(acc.blanco.ilustraciones, b.ilustraciones);
  for (const m of b.medidos) {
    if (!m.causa) continue;
    const clave = `«${m.nombre}» ${m.dibujo} — ${m.causa}`;
    if (m.causa.startsWith("pequeño")) acc.blanco.pequenos.set(clave, m);
    if (m.causa.includes("tapado")) acc.blanco.tapados.set(clave, m);
  }
  for (const s of b.solapes) acc.blanco.solapes.add(s);

  /* De vuelta a como estaba, para seguir jugando. */
  await p.setViewportSize({ width: ancho, height: 760 });
  await p.evaluate((y) => window.scrollTo(0, y), yInicial);
  await p.waitForTimeout(120);
}

const resumen = (nombre, grupo, acc, notas, errores) => ({
  pieza: nombre, grupo, estados: acc.estados, fuentesOk: acc.fuentesOk, notas, errores: [...new Set(errores)],
  contraste: { malos: acc.contraste.hallazgos.size, medidos: acc.contraste.medidos, sinMedir: acc.contraste.sinMedir.size,
    detalle: [...acc.contraste.hallazgos.values()].sort((a, b) => a.r - b.r).map((m) => `${m.r}:1 (pide ${m.piso}) ${m.px}px «${m.texto}»`) },
  piso: { bajo12: acc.piso.hallazgos.size, cejillas: acc.piso.cejillas.size, medidos: acc.piso.medidos, desbordes: acc.piso.desbordes.size, scrollH: acc.piso.scrollH,
    detalle: [...acc.piso.hallazgos] },
  blanco: { pequenos: acc.blanco.pequenos.size, tapados: acc.blanco.tapados.size, medidos: acc.blanco.medidos, fuera: acc.blanco.fuera, solapes: acc.blanco.solapes.size,
    detalle: [...acc.blanco.pequenos.keys(), ...[...acc.blanco.tapados.keys()].filter((k) => !acc.blanco.pequenos.has(k))] },
  ficha: { tapados: acc.ficha.tapados.size, glifos: acc.ficha.glifos.size, conFicha: acc.ficha.conFicha, sinFicha: acc.ficha.sinFicha, medidos: acc.ficha.medidos,
    detalle: [...acc.ficha.tapados] },
});

/* ─────────────── recorridos ─────────────── */
const pausa = (p, ms = 500) => p.waitForTimeout(ms);
const huella = (p) => p.evaluate(() => (window.__alcance || document.body).innerText.length + ":" + document.querySelectorAll("button:not([disabled])").length + ":" + (window.__alcance || document.body).innerText.slice(0, 400));

/* Aprender: las cinco piezas viven en la misma página, cada una en su section[data-pieza]. */
async function medirAprender(navegador, ancho, pieza) {
  const errores = [];
  const p = await nuevaPagina(navegador, ancho, errores);
  const acc = nuevoAcumulado();
  const notas = [];
  try {
    await p.goto(`${BASE}#/cuentas-debe-haber/aprender`, { waitUntil: "networkidle" });
    const sel = `section[data-pieza="${pieza}"]`;
    await p.waitForSelector(sel, { timeout: 10000 });
    await medirEstado(p, ancho, sel, acc);
    /* Capa 1 paginada y capa 2: cada «Siguiente»/«Continuar» de la pieza hasta el final. */
    let pasos = 0;
    for (let k = 0; k < 30; k++) {
      const sig = p.locator(`${sel} button:visible:not([disabled])`).filter({ hasText: /^(Siguiente|Continuar)$/ });
      if (!(await sig.count())) break;
      const antes = await huella(p);
      await sig.first().click({ timeout: 5000 });
      await pausa(p, 450);
      if ((await huella(p)) === antes) break;
      pasos++;
      await medirEstado(p, ancho, sel, acc);
    }
    notas.push(`${pasos} avance(s) Siguiente/Continuar`);
    /* Capas 3 y 4: hasta seis toques en lo primero que siga abierto, y se mide tras cada uno. */
    let toques = 0;
    for (const capa of ["3", "4"]) {
      const tocados = new Set();
      for (let k = 0; k < 6; k++) {
        const cand = await p.evaluate(({ s, capa, ya }) => {
          const raiz = document.querySelector(`${s} [data-capa="${capa}"]`);
          if (!raiz) return null;
          raiz.querySelectorAll("input:not([disabled])").forEach(() => {});
          const bs = [...raiz.querySelectorAll("button:not([disabled])")].filter((b) => {
            const r = b.getBoundingClientRect();
            return r.width > 4 && r.height > 4 && !/anterior|volver|reiniciar|empezar de nuevo/i.test(b.innerText || b.getAttribute("aria-label") || "");
          });
          const i = bs.findIndex((b, j) => !ya.includes((b.innerText || b.getAttribute("aria-label") || "") + "#" + j));
          if (i < 0) return null;
          const b = bs[i]; b.setAttribute("data-t2-tocar", "1");
          return (b.innerText || b.getAttribute("aria-label") || "") + "#" + i;
        }, { s: sel, capa, ya: [...tocados] });
        if (!cand) break;
        tocados.add(cand);
        const inputs = p.locator(`${sel} [data-capa="${capa}"] input:visible:not([disabled])`);
        for (let j = 0; j < (await inputs.count()); j++) if (!(await inputs.nth(j).inputValue())) await inputs.nth(j).fill("1000").catch(() => {});
        await p.locator("[data-t2-tocar]").first().click({ timeout: 4000 }).catch(() => {});
        await p.evaluate(() => document.querySelectorAll("[data-t2-tocar]").forEach((e) => e.removeAttribute("data-t2-tocar")));
        await pausa(p, 450);
        toques++;
        await medirEstado(p, ancho, sel, acc);
      }
    }
    notas.push(`${toques} toque(s) en capas 3-4`);
  } catch (e) {
    notas.push(`CORTADO: ${String(e).slice(0, 120)}`);
  }
  await p.close();
  return resumen(pieza, "Aprender", acc, notas, errores);
}

async function abrirCamino(p) {
  await p.goto(`${BASE}#/cuentas-debe-haber/hacer`, { waitUntil: "networkidle" });
  await p.waitForSelector("[data-nodo]", { timeout: 10000 });
}
/* El nodo abre una tarjeta con «Empezar»; el juego se monta al tocarlo. */
async function abrirNodo(p, id) {
  await p.locator(`[data-nodo="${id}"]:visible`).first().click({ timeout: 8000 });
  await pausa(p, 600);
  const empezar = p.locator("button:visible").filter({ hasText: /^Empezar$/ });
  if (await empezar.count()) { await empezar.first().click({ timeout: 5000 }); return true; }
  return false;
}
const ALCANCE_VISTA = "#t2-vista";
const marcarVista = (p) => p.evaluate(() => {
  document.querySelectorAll("#t2-vista").forEach((e) => e.removeAttribute("id"));
  const h = document.querySelector("h2") || document.querySelector("h1");
  if (h) h.parentElement.id = "t2-vista";
  return Boolean(h);
});

async function medirCamino(navegador, ancho) {
  const errores = [];
  const p = await nuevaPagina(navegador, ancho, errores);
  const acc = nuevoAcumulado();
  const notas = [];
  try {
    await abrirCamino(p);
    await marcarVista(p);
    notas.push(`${await p.locator("[data-nodo]").count()} nodos en el camino`);
    await medirEstado(p, ancho, ALCANCE_VISTA, acc);
  } catch (e) { notas.push(`CORTADO: ${String(e).slice(0, 120)}`); }
  await p.close();
  return resumen("camino de Hacer", "Contexto", acc, notas, errores);
}

/* Hacer: tutorial, primera pantalla y unas jugadas genéricas (no pretende jugar bien: pretende PINTAR). */
const ENVIAR = /^(Comprobar|Confirmar|Responder|Registrar|Siguiente|Continuar|Seguir|Listo|Mayorizar|Ubicarla|Ver el resultado|Calificar|Revisar)/i;
async function medirJuego(navegador, ancho, id) {
  const errores = [];
  const p = await nuevaPagina(navegador, ancho, errores);
  const acc = nuevoAcumulado();
  const notas = [];
  try {
    await abrirCamino(p);
    if (!(await abrirNodo(p, id))) notas.push("sin tarjeta «Empezar»");
    await pausa(p, 1500);
    await marcarVista(p);
    const tutorial = (await p.locator("[data-partida][hidden]").count()) > 0;
    if (tutorial) {
      await medirEstado(p, ancho, ALCANCE_VISTA, acc);
      notas.push("así se juega");
      await p.locator(`button:visible`).filter({ hasText: /^Siguiente$/ }).first().click({ timeout: 6000 });
      await pausa(p, 700);
    } else notas.push("SIN «Así se juega»");
    await medirEstado(p, ancho, ALCANCE_VISTA, acc);
    notas.push("inicio");
    const tocados = new Set();
    let jugadas = 0;
    let retro = false;
    for (let k = 0; k < 12; k++) {
      const inputs = p.locator("[data-partida] input:visible:not([disabled])");
      for (let j = 0; j < (await inputs.count()); j++) if (!(await inputs.nth(j).inputValue())) await inputs.nth(j).fill("1000").catch(() => {});
      const cand = await p.evaluate(({ ya, envio }) => {
        const raiz = document.querySelector("[data-partida]");
        if (!raiz) return null;
        const re = new RegExp(envio.src, envio.flags);
        const bs = [...raiz.querySelectorAll("button:not([disabled]), [role=button]:not([aria-disabled=true])")].filter((b) => {
          const r = b.getBoundingClientRect();
          const t = (b.innerText || b.getAttribute("aria-label") || "").trim();
          return r.width > 4 && r.height > 4 && !/cómo se juega|volver|quitar|anterior|reiniciar|jugar de nuevo|otra vez/i.test(t);
        });
        let b = bs.find((x) => re.test((x.innerText || "").trim()));
        if (!b) b = bs.find((x, j) => !ya.includes((x.innerText || x.getAttribute("aria-label") || "") + "#" + j));
        if (!b) return null;
        b.setAttribute("data-t2-tocar", "1");
        return (b.innerText || b.getAttribute("aria-label") || "") + "#" + bs.indexOf(b);
      }, { ya: [...tocados], envio: { src: ENVIAR.source, flags: ENVIAR.flags } });
      if (!cand) break;
      tocados.add(cand);
      const antes = await huella(p);
      await p.locator("[data-t2-tocar]").first().click({ timeout: 4000 }).catch(() => {});
      await p.evaluate(() => document.querySelectorAll("[data-t2-tocar]").forEach((e) => e.removeAttribute("data-t2-tocar")));
      await pausa(p, 600);
      if ((await huella(p)) === antes) continue;
      jugadas++;
      retro ||= await p.evaluate(() => Boolean(document.querySelector('[data-fallo], [data-estado="correcta"], [data-estado="incorrecta"], [data-resuelta], [data-panel="acierto"]')));
      await marcarVista(p);
      await medirEstado(p, ancho, ALCANCE_VISTA, acc);
    }
    notas.push(`${jugadas} jugada(s) que cambiaron la pantalla`, retro ? "retroalimentación vista" : "SIN retroalimentación alcanzada");
  } catch (e) { notas.push(`CORTADO: ${String(e).slice(0, 120)}`); }
  await p.close();
  return resumen(id, "Hacer", acc, notas, errores);
}

/* El Ciclo Completo: cada etapa se abre terminando la anterior, así que se juega entera. */
async function medirCiclo(navegador, ancho) {
  const errores = [];
  const p = await nuevaPagina(navegador, ancho, errores);
  const filas = [];
  const etapaActual = () => p.evaluate(() => { const m = document.body.innerText.match(/ETAPA (\d) DE 4/); return m ? Number(m[1]) : null; });
  const clicTexto = async (re) => { const b = p.locator("button:visible:not([disabled])").filter({ hasText: re }); if (!(await b.count())) return false; await b.first().click({ timeout: 5000 }); await pausa(p, 350); return true; };
  /* Un ítem de cada etapa: lo mínimo para que «Responder» se encienda (no hace falta acertar). */
  const responderItem = {
    1: async () => {
      await p.evaluate(() => {
        const rot = [...document.querySelectorAll("p")].find((x) => x.textContent.trim() === "LAS CUENTAS");
        [...rot.nextElementSibling.querySelectorAll("button:not([disabled])")].slice(0, 2).forEach((b) => b.setAttribute("data-t2-cuenta", "1"));
      });
      for (let j = 0; j < 2; j++) { await p.locator("[data-t2-cuenta]").first().click(); await p.locator("[data-t2-cuenta]").first().evaluate((e) => e.removeAttribute("data-t2-cuenta")).catch(() => {}); }
      await p.evaluate(() => document.querySelectorAll("[data-t2-cuenta]").forEach((e) => e.removeAttribute("data-t2-cuenta")));
      await p.locator('[data-fila-asiento="0"] button').filter({ hasText: /^Debe$/ }).click();
      await p.locator('[data-fila-asiento="1"] button').filter({ hasText: /^Haber$/ }).click();
      await p.locator('[data-fila-asiento="0"] input').fill("1000");
      await p.locator('[data-fila-asiento="1"] input').fill("1000");
      return clicTexto(/^Registrar el asiento$/);
    },
    2: async () => { await p.locator(".fae-jg-opcion:visible:not([disabled])").first().click(); await clicTexto(/^Debe$/); return clicTexto(/^Mayorizar$/); },
    3: async () => { await p.locator('input[aria-label^="Saldo de"]').fill("1000"); await clicTexto(/^Debe$/); return clicTexto(/^Responder$/); },
    4: async () => { await p.locator(".fae-jg-opcion:visible:not([disabled])").first().click(); return clicTexto(/^Ubicarla$/); },
  };
  const AVANZAR = /^(Siguiente transacción|Siguiente valor|Siguiente cuenta|Pasar al mayor|Pasar a los saldos|Pasar al estado|Cerrar el ciclo)$/;
  try {
    await abrirCamino(p);
    await abrirNodo(p, "ciclo-completo");
    await pausa(p, 900);
    await marcarVista(p);
    const portada = nuevoAcumulado();
    await medirEstado(p, ancho, ALCANCE_VISTA, portada);
    filas.push(resumen("ciclo · portada", "Contexto", portada, ["portada del desafío"], errores));
    if (!(await clicTexto(/^Sentarse al escritorio$/))) throw new Error("no encontré «Sentarse al escritorio»");
    for (let etapa = 1; etapa <= 4; etapa++) {
      const acc = nuevoAcumulado();
      const notas = [];
      if ((await etapaActual()) !== etapa) { filas.push(resumen(`ciclo · etapa ${etapa}`, "Ciclo", acc, [`NO ALCANZADA (pantalla en etapa ${await etapaActual()})`], errores)); break; }
      let items = 0;
      for (let k = 0; k < 40 && (await etapaActual()) === etapa; k++) {
        const medir = k === 0 || k === 1; /* primer ítem antes y después, y el segundo después */
        if (k === 0) { await marcarVista(p); await medirEstado(p, ancho, ALCANCE_VISTA, acc); }
        if (!(await responderItem[etapa]())) throw new Error(`etapa ${etapa}, ítem ${k + 1}: «Responder» no se encendió`);
        if (medir) { await marcarVista(p); await medirEstado(p, ancho, ALCANCE_VISTA, acc); }
        const ultimo = await p.locator("button:visible").filter({ hasText: /^(Pasar al mayor|Pasar a los saldos|Pasar al estado|Cerrar el ciclo)$/ }).count();
        if (ultimo && k > 1) { await marcarVista(p); await medirEstado(p, ancho, ALCANCE_VISTA, acc); }
        items++;
        if (!(await clicTexto(AVANZAR))) throw new Error(`etapa ${etapa}: no encontré el botón de avanzar`);
        await pausa(p, 300);
      }
      notas.push(`${items} ítem(s) jugados; medidos: 1.º antes y después, 2.º después, último después`);
      filas.push(resumen(`ciclo · etapa ${etapa}`, "Ciclo", acc, notas, errores));
    }
    await pausa(p, 1500);
    const cierre = nuevoAcumulado();
    if (/\d+ de \d+ FP/.test(await p.evaluate(() => document.body.innerText))) {
      await marcarVista(p);
      await medirEstado(p, ancho, ALCANCE_VISTA, cierre);
      filas.push(resumen("ciclo · cierre", "Contexto", cierre, ["cierre del desafío"], errores));
    }
  } catch (e) {
    filas.push(resumen("ciclo · (corte)", "Ciclo", nuevoAcumulado(), [`CORTADO: ${String(e).slice(0, 140)}`], errores));
  }
  await p.close();
  return filas;
}

/* ─────────────── el catálogo de T2, leído del código ─────────────── */
const { SUBJECTS } = await import(resolve(REPO, "src/data/subjects.js"));
const tema = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-debe-haber");
const APRENDER = tema.actividades.filter((a) => a.clasificacion?.tipo === "aprender").map((a) => a.id);
const HACER = tema.actividades.filter((a) => a.clasificacion?.tipo === "hacer" && !a.clasificacion?.desafio && !a.pendiente).map((a) => a.id);

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium" });
const todo = [];
for (const ancho of ANCHOS) {
  const filas = [];
  if (!SOLO || "camino".includes(SOLO)) filas.push(await medirCamino(navegador, ancho));
  for (const id of APRENDER) if (!SOLO || id.includes(SOLO)) filas.push(await medirAprender(navegador, ancho, id));
  for (const id of HACER) if (!SOLO || id.includes(SOLO)) filas.push(await medirJuego(navegador, ancho, id));
  if (!SOLO || "ciclo".includes(SOLO)) filas.push(...(await medirCiclo(navegador, ancho)));
  for (const f of filas) {
    f.ancho = ancho;
    const c = f.contraste, pz = f.piso, b = f.blanco, fi = f.ficha;
    console.log(`${ancho} | ${f.pieza.padEnd(26)} | est ${String(f.estados).padStart(2)} | contraste ${c.malos}/${c.medidos} | <12px ${pz.bajo12}(cej ${pz.cejillas})/${pz.medidos} desb ${pz.desbordes}${pz.scrollH ? " SCROLL-H" : ""} | toque peq ${b.pequenos} tap ${b.tapados}/${b.medidos} | ficha ${fi.tapados} (con ficha ${fi.conFicha}/${fi.conFicha + fi.sinFicha}, ${fi.medidos} el.) | fuentes ${f.fuentesOk ? "ok" : "NO"} | ${f.notas.join("; ")}${f.errores.length ? " | JS " + f.errores[0] : ""}`);
  }
  todo.push(...filas);
}
await navegador.close();
if (JSON_SALIDA) writeFileSync(JSON_SALIDA, JSON.stringify({ base: BASE, anchos: ANCHOS, aprender: APRENDER, hacer: HACER, filas: todo }, null, 1));
