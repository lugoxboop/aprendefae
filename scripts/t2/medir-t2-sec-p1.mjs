/*
 * §12 de aprender-secuencia-v1.md sobre T2·P1 en SecuenciaAprender (lote T2-7).
 * Build TEMPORAL con la bandera encendida, servido en PUERTO (≠ 8099).
 * Sondas del repo (contraste, piso-de-12, blanco-de-toque, ficha-tapa) leídas de su archivo,
 * como en scripts/t2/medir-t2-linea-base.mjs, con alcance = [data-secuencia].
 * Uso: PUERTO=8137 node medir-t2-sec-p1.mjs [--json=salida.json]
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const REPO = resolve(new URL("../..", import.meta.url).pathname);
const BASE = `http://127.0.0.1:${process.env.PUERTO ?? 8137}/`;
const FUENTES = process.env.FUENTES ?? "/tmp/claude-0/fuentes";
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
const CSS_FUENTES = existsSync(`${FUENTES}/fuentes.css`) ? readFileSync(`${FUENTES}/fuentes.css`, "utf8") : null;

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

/* ── §12: geometría de la secuencia en el estado actual, ventana ancho×alto ── */
const GEOM = () => {
  const raiz = document.querySelector("[data-secuencia]");
  const panel = raiz.parentElement;
  const r = (el) => el ? el.getBoundingClientRect() : null;
  const y0 = window.scrollY;
  const pr = r(panel), h2 = document.querySelector(".fae-sec-titular"), fig = document.querySelector(".fae-sec-figura");
  const viva = fig?.querySelector(".fae-sec-figura-viva > *:not(style)") || fig?.querySelector(".fae-sec-figura-viva");
  const nav = document.querySelector("[data-navegacion]");
  const razon = document.querySelector("[data-razon]");
  const apoyo = document.querySelector("[data-apoyo]");
  const ficha = (() => { const f = document.querySelector("[data-cuenta-compacta], [aria-label^='Tu cuenta'], .fae-cuenta-compacta"); return f ? (f.closest("div[style*='fixed']") || f) : null; })();
  const fr = r(ficha);
  const cruce = (a, b) => (a && b) ? Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) : 0;
  const lh = parseFloat(getComputedStyle(h2).lineHeight);
  const contenidoFig = viva ? Math.max(...[...viva.querySelectorAll("*")].map((e) => e.getBoundingClientRect().bottom), viva.getBoundingClientRect().bottom) - r(fig).top : 0;
  return {
    pantalla: Number(document.querySelector("[data-pantalla]").dataset.pantalla), tipo: document.querySelector("[data-pantalla]").dataset.tipo,
    cabecera: Math.round(pr.top + y0),
    figuraDesdePanel: Math.round(r(fig).top - pr.top),
    titularLineas: Math.round(r(h2).height / lh), titularAlto: Math.round(r(h2).height),
    figuraHueco: Math.round(r(fig).height), figuraContenido: Math.round(contenidoFig),
    figuraSobreApoyo: apoyo ? Math.max(0, Math.round(r(fig).top + contenidoFig - r(apoyo).top)) : (razon ? Math.max(0, Math.round(r(fig).top + contenidoFig - r(razon).top)) : 0),
    bloqueFijo: getComputedStyle(nav).position === "fixed", bloqueAlto: Math.round(r(nav).height),
    finRazon: Math.round(r(razon).bottom + y0), paginaAlto: document.documentElement.scrollHeight, ventana: innerHeight,
    ficha: fr ? { top: Math.round(fr.top), bottom: Math.round(fr.bottom), left: Math.round(fr.left), right: Math.round(fr.right), visible: getComputedStyle(ficha).visibility !== "hidden" && Number(getComputedStyle(ficha).opacity) > 0.05 } : null,
    fichaSobreSiguiente: Math.round(cruce(fr, r(document.querySelector("[data-siguiente]")))),
    fichaSobreTitular: Math.round(cruce(fr, r(h2))),
    siguiente: { top: Math.round(r(document.querySelector("[data-siguiente]")).top), aria: document.querySelector("[data-siguiente]").getAttribute("aria-disabled"), texto: document.querySelector("[data-siguiente]").textContent },
    mensaje: document.querySelector("[data-mensaje]")?.dataset.mensaje ?? null,
    palabras: [h2, apoyo, razon].filter(Boolean).map((e) => e.innerText.trim()).join(" ").split(/\s+/).filter(Boolean).length,
  };
};

async function medirSondas(p, ancho, altoBase, acc) {
  acc.estados++;
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { window.__alcance = document.querySelector("[data-secuencia]"); });
  acc.fuentesOk &&= await p.evaluate(() => document.fonts.check("15px Inter") && document.fonts.check("700 14px Sora"));
  const y = await p.evaluate(() => window.scrollY);
  await p.setViewportSize({ width: ancho, height: 1400 }); await p.waitForTimeout(150);
  const c = await p.evaluate(MEDIR_CONTRASTE);
  acc.contraste.medidos += c.medidos; for (const m of c.malos) acc.contraste.malos.add(`${m.r}:1 ${m.px}px «${m.texto}»`);
  const pz = await p.evaluate(`(${MEDIR_PISO})(${PISO})`);
  acc.piso.medidos += pz.medidos; for (const l of pz.chicas) acc.piso.chicas.add(l); for (const d of pz.desbordes) acc.piso.desbordes.add(d); acc.piso.scrollH ||= pz.scrollH;
  let alto = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.setViewportSize({ width: ancho, height: Math.min(Math.max(alto + 200, 820), 16000) }); await p.waitForTimeout(250);
  await p.evaluate(() => window.scrollTo(0, 0));
  const b = await p.evaluate(`(${MEDIR_BLANCO})(${MINIMO})`);
  acc.blanco.medidos += b.medidos.length;
  for (const m of b.medidos) if (m.causa) acc.blanco.malos.add(`«${m.nombre}» ${m.dibujo} — ${m.causa}`);
  acc.blanco.ilustraciones = Math.max(acc.blanco.ilustraciones, b.ilustraciones);
  /* ficha-tapa: en la ventana de §12, arriba y abajo */
  await p.setViewportSize({ width: ancho, height: altoBase }); await p.waitForTimeout(150);
  for (const donde of ["cima", "abajo"]) {
    await p.evaluate((d) => window.scrollTo(0, d === "cima" ? 0 : document.documentElement.scrollHeight), donde);
    await p.waitForTimeout(250);
    const f = await p.evaluate(MIRA_FICHA);
    if (f.sinFicha) { acc.ficha.sin++; continue; }
    acc.ficha.con++; acc.ficha.medidos += f.medidos;
    for (const t of f.tapados) acc.ficha.tapados.add(`${t.tocable ? "CONTROL" : "texto"} «${t.texto}»`);
  }
  await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(120);
}

const nuevoAcc = () => ({ estados: 0, fuentesOk: true, contraste: { medidos: 0, malos: new Set() }, piso: { medidos: 0, chicas: new Set(), desbordes: new Set(), scrollH: false }, blanco: { medidos: 0, malos: new Set(), ilustraciones: 0 }, ficha: { con: 0, sin: 0, medidos: 0, tapados: new Set() } });

const PANTALLAS = ["objetivo", "de-que-lado", "que-es-una-cuenta", "debe-y-haber", "movimientos", "el-saldo", "debe-no-es-subir", "cierre"];
const PIEZA = "cu-a1-anatomia-de-una-cuenta";
const HAZ0 = { intentos: 0, ok: false, ultimo: null };
const guardadoEn = (s, extra = {}) => JSON.stringify({ v: 1, p: 0, s, pasos: {}, resueltas: [], estados: {
  [`${PIEZA}/objetivo`]: null, [`${PIEZA}/de-que-lado`]: { lado: null }, [`${PIEZA}/que-es-una-cuenta`]: { vistas: [] }, [`${PIEZA}/debe-y-haber`]: { vistos: [] },
  [`${PIEZA}/movimientos`]: { sumado: false }, [`${PIEZA}/el-saldo`]: HAZ0, [`${PIEZA}/debe-no-es-subir`]: HAZ0, [`${PIEZA}/cierre`]: null, ...extra } });

async function recorrido(nav, ancho, alto, acc, filas, errores, modo) {
  const p = await nuevaPagina(nav, ancho, alto, errores, modo === "acierto" ? guardadoEn(5, { [`${PIEZA}/de-que-lado`]: { lado: "izq" } }) : null);
  await p.goto(`${BASE}#/cuentas-debe-haber/aprender`, { waitUntil: "networkidle" });
  await p.waitForSelector("[data-secuencia]", { timeout: 10000 });
  await p.waitForTimeout(700);
  const estado = async (nombre) => {
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(250);
    const arriba = await p.evaluate(GEOM);
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(300);
    const abajo = await p.evaluate(GEOM);
    filas.push({ ancho, alto, modo, nombre, arriba, abajo });
    await medirSondas(p, ancho, alto, acc);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150);
  };
  const clicReal = async (loc, quien) => {
    try { await loc.click({ timeout: 2500 }); }
    catch (e) {
      const m = String(e).match(/<([a-z0-9]+)([^>]*)>[^<]*<\/[a-z0-9]+> from[^\n]*intercepts|<([a-z0-9]+)([^>]*)>.{0,60} intercepts/);
      filas.push({ ancho, alto, modo, nombre: `TAPADO «${quien}»`, tapado: (String(e).match(/- (<[^\n]{0,90}) (?:from [^\n]*)?(?:subtree )?intercepts pointer events/) || [])[1] ?? "no se pudo tocar" });
      await loc.evaluate((b) => b.click());
    }
    await p.waitForTimeout(500);
  };
  const toca = (texto) => clicReal(p.locator("figure button").filter({ hasText: texto }).first(), texto);
  const tocaEtiqueta = (et) => clicReal(p.locator(`figure button[aria-label="${et}"]`).first(), et);
  const siguiente = async () => { await clicReal(p.locator("[data-siguiente]"), "Siguiente"); await p.waitForTimeout(250); };
  if (modo === "error") {
    await estado("P1·0 apertura");
    await siguiente(); await estado("P1·1 antes");
    await tocaEtiqueta("Derecha"); await estado("P1·1 elegido");
    await siguiente(); await estado("P1·2 antes");
    await toca("$1.000"); await toca("$150"); await estado("P1·2 tocadas");
    await siguiente(); await estado("P1·3 antes");
    await tocaEtiqueta("Lado izquierdo"); await tocaEtiqueta("Lado derecho"); await estado("P1·3 nombres");
    await siguiente(); await estado("P1·4 antes");
    await toca("Sumar"); await p.waitForTimeout(500); await estado("P1·4 sumado");
    await siguiente(); await estado("P1·5 antes");
    await tocaEtiqueta("En el haber"); await estado("P1·5 error1");
    await tocaEtiqueta("En el haber"); await estado("P1·5 error2");
    await siguiente(); await estado("P1·6 antes");
    await toca("Sube"); await estado("P1·6 error1");
    await toca("Sube"); await estado("P1·6 error2");
    await toca("Documentos por pagar"); await estado("P1·6 selector");
    await siguiente(); await estado("P1·7 antes");
    await siguiente(); await estado("P1·7 paso");
    /* «Ir a Hacer»: onFinal lleva al camino de Hacer de T2 */
    const lit = await p.locator("[data-siguiente]").textContent();
    await siguiente(); await p.waitForTimeout(800);
    filas.push({ ancho, alto, modo, nombre: "Ir a Hacer", final: { literal: lit, hash: await p.evaluate(() => location.hash), nodos: await p.locator("[data-nodo]").count() } });
    /* §12.6 persistencia: volver y recargar a mitad */
  } else {
    await estado("P1·5 antes (acierto)");
    await tocaEtiqueta("En el debe"); await estado("P1·5 acierto");
    await siguiente(); await toca("Baja"); await p.waitForTimeout(500); await estado("P1·6 acierto");
    await p.reload({ waitUntil: "networkidle" }); await p.waitForSelector("[data-secuencia]"); await p.waitForTimeout(500);
    filas.push({ ancho, alto, modo, nombre: "recarga a mitad", recarga: await p.evaluate(() => ({ pantalla: document.querySelector("[data-pantalla]").dataset.pantalla, mensaje: document.querySelector("[data-mensaje]")?.dataset.mensaje ?? null, siguiente: document.querySelector("[data-siguiente]").getAttribute("aria-disabled") })) });
  }
  await p.close();
}

/* §12.4: el titular más largo, inyectado en el h2 real (solo en la medición) */
async function titulares(nav, ancho, alto, errores) {
  const p = await nuevaPagina(nav, ancho, alto, errores);
  await p.goto(`${BASE}#/cuentas-debe-haber/aprender`, { waitUntil: "networkidle" });
  await p.waitForSelector(".fae-sec-titular"); await p.evaluate(() => document.fonts.ready);
  const CANDIDATOS = {
    "objetivo de Near (Watari: titular de la apertura), 81 car.": "Al terminar, sabrás leer una cuenta T: sus dos lados, sus movimientos y su saldo.",
    "¿Muchas cuentas descuadran? (P4·8, el más largo de ≤10 pal. en T2), 27 car.": "¿Muchas cuentas descuadran?",
    "sintético 10 pal./54 car. (supuesto de §3.3)": "Cada movimiento de la cuenta deja huella en su columna",
  };
  const out = {};
  /* §12.2: el bloque pegado solo se fija si la pantalla no cabe; en P1 a 568/667 siempre cabe, así que se fuerza con una ventana baja. */
  for (const bajo of [420, 460]) {
    await p.setViewportSize({ width: ancho, height: bajo }); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(400);
    out[`bloque pegado a ${ancho}×${bajo}`] = await p.evaluate(() => { const n = document.querySelector("[data-navegacion]"); const r = n.getBoundingClientRect(); return { fijo: getComputedStyle(n).position === "fixed", alto: Math.round(r.height), abajo: Math.round(innerHeight - r.bottom) }; });
  }
  await p.setViewportSize({ width: ancho, height: alto }); await p.waitForTimeout(200);
  for (const [k, t] of Object.entries(CANDIDATOS)) {
    out[k] = await p.evaluate((txt) => { const h = document.querySelector(".fae-sec-titular"); h.textContent = txt; const r = h.getBoundingClientRect(); return { car: txt.length, lineas: Math.round(r.height / parseFloat(getComputedStyle(h).lineHeight)), ancho: Math.round(r.width) }; }, t);
  }
  await p.close();
  return out;
}

const nav = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const salida = { anchos: {} };
for (const [ancho, alto] of [[320, 568], [375, 667]]) {
  const errores = []; const acc = nuevoAcc(); const filas = [];
  await recorrido(nav, ancho, alto, acc, filas, errores, "error");
  await recorrido(nav, ancho, alto, acc, filas, errores, "acierto");
  const tit = await titulares(nav, ancho, alto, errores);
  salida.anchos[ancho] = { filas, tit, errores: [...new Set(errores)], sondas: {
    estados: acc.estados, fuentesOk: acc.fuentesOk,
    contraste: { malos: [...acc.contraste.malos], medidos: acc.contraste.medidos },
    piso: { chicas: [...acc.piso.chicas], medidos: acc.piso.medidos, desbordes: [...acc.piso.desbordes], scrollH: acc.piso.scrollH },
    blanco: { malos: [...acc.blanco.malos], medidos: acc.blanco.medidos, ilustraciones: acc.blanco.ilustraciones },
    ficha: { tapados: [...acc.ficha.tapados], con: acc.ficha.con, sin: acc.ficha.sin, medidos: acc.ficha.medidos },
  } };
  const s = salida.anchos[ancho].sondas;
  console.log(`\n=== ${ancho}×${alto} · estados ${s.estados} · fuentes ${s.fuentesOk ? "ok" : "NO"} · JS ${salida.anchos[ancho].errores.length}`);
  console.log(`contraste ${s.contraste.malos.length}/${s.contraste.medidos} · <12px ${s.piso.chicas.length}/${s.piso.medidos} desb ${s.piso.desbordes.length}${s.piso.scrollH ? " SCROLL-H" : ""} · toque ${s.blanco.malos.length}/${s.blanco.medidos} (ilustr. saltadas ${s.blanco.ilustraciones}) · ficha tapa ${s.ficha.tapados.length} (con ficha ${s.ficha.con}/${s.ficha.con + s.ficha.sin}, ${s.ficha.medidos} el.)`);
  for (const l of [...s.contraste.malos, ...s.piso.chicas, ...s.piso.desbordes, ...s.blanco.malos, ...s.ficha.tapados]) console.log("   · " + l);
  for (const f of filas) {
    if (f.final) { console.log(`${f.nombre}: «${f.final.literal}» → ${f.final.hash} · ${f.final.nodos} nodos`); continue; }
    if (f.tapado) { console.log(`${f.nombre}: ${f.tapado}`); continue; }
    if (f.recarga) { console.log(`${f.nombre}: pantalla ${f.recarga.pantalla} · mensaje ${f.recarga.mensaje} · siguiente aria-disabled=${f.recarga.siguiente}`); continue; }
    const a = f.arriba, b = f.abajo;
    console.log(`${f.nombre.padEnd(22)} cab ${a.cabecera} · fig@${a.figuraDesdePanel} hueco ${a.figuraHueco} contenido ${a.figuraContenido} pisa ${a.figuraSobreApoyo} · tit ${a.titularLineas}l · pal ${a.palabras} · bloque ${a.bloqueFijo ? "FIJO" : "en flujo"} ${a.bloqueAlto}/${b.bloqueFijo ? "FIJO" : "flujo"} ${b.bloqueAlto} · finRazón ${a.finRazon} pág ${a.paginaAlto} · ficha ${a.ficha ? `${a.ficha.top}-${a.ficha.bottom}×${a.ficha.left}-${a.ficha.right}${a.ficha.visible ? "" : " oculta"}` : "—"} ∩sig ${a.fichaSobreSiguiente}/${b.fichaSobreSiguiente} ∩tit ${a.fichaSobreTitular}/${b.fichaSobreTitular} · sig ${a.siguiente.texto}${a.siguiente.aria ? " (espera)" : ""} @${a.siguiente.top} · msg ${a.mensaje}`);
  }
  for (const [k, v] of Object.entries(tit)) console.log(k.startsWith("bloque") ? `${k}: ${JSON.stringify(v)}` : `titular ${k}: ${v.lineas} líneas en ${v.ancho} px`);
}
await nav.close();
if (JSON_SALIDA) writeFileSync(JSON_SALIDA, JSON.stringify(salida, null, 1));
