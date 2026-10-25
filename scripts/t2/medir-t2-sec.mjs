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

/* ── el recorrido, sacado de las piezas ── */
const etiqueta = (d) => String(d).replace("|", ", ");
/* Lo que se toca en cada pantalla, según su tipo y el modo. Cada paso: [nombre del estado, [controles…]]. */
/* `orden`: el de las fichas barajadas que guardó la pantalla (P2·7, lote T2-10), o el de la lista. */
function guion(pt, modo, orden = pt.fichas ? [...pt.fichas.keys()] : null) {
  if (pt.tipo === "haz" && pt.prediccion) return [["elegido", ["@ultimo"]]];
  if (pt.tipo === "haz" && pt.fichas) {
    const buenas = orden.map((i) => etiqueta(pt.buenoDe(i)));
    return modo === "error"
      ? [["error1", [etiqueta(pt.malaDe(orden[0]))]], ["error2", [etiqueta(pt.malaDe(orden[0]))]], ["resto", buenas.slice(1)]]
      : [["acierto", buenas]];
  }
  if (pt.tipo === "haz") {
    const mala = pt.opciones.find((o) => o !== pt.buena);
    return modo === "error" ? [["error1", [mala]], ["error2", [mala]]] : [["acierto", [pt.buena]]];
  }
  if (pt.tipo === "miralo") return [["tocado", ["@todos"]]];
  return [];
}

async function recorrido(nav, ancho, alto, acc, filas, errores, modo) {
  const p = await nuevaPagina(nav, ancho, alto, errores);
  await p.goto(`${BASE}#/cuentas-debe-haber/aprender`, { waitUntil: "networkidle" });
  await p.waitForSelector("[data-secuencia]", { timeout: 10000 });
  await p.waitForTimeout(700);
  const estado = async (nombre) => {
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(250);
    const arriba = await p.evaluate(GEOM);
    arriba.pieza = await p.evaluate(() => document.querySelector("[data-secuencia]").dataset.pieza);
    arriba.dentroFigura = await p.evaluate(() => document.querySelectorAll("figure [data-mensaje]").length);
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(300);
    const abajo = await p.evaluate(GEOM);
    filas.push({ ancho, alto, modo, nombre, arriba, abajo });
    await medirSondas(p, ancho, alto, acc);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150);
  };
  const clicReal = async (loc, quien) => {
    try { await loc.click({ timeout: 2500 }); }
    catch (e) {
      filas.push({ ancho, alto, modo, nombre: `TAPADO «${quien}»`, tapado: (String(e).match(/- (<[^\n]{0,90}) (?:from [^\n]*)?(?:subtree )?intercepts pointer events/) || [])[1] ?? String(e).slice(0, 90) });
      await loc.evaluate((b) => b.click());
    }
    await p.waitForTimeout(450);
  };
  /* Un control de la figura por su nombre accesible (con o sin la palabra de la marca) o su texto. */
  const tocar = async (nombre) => {
    const i = await p.evaluate((n) => [...document.querySelectorAll("figure button")].findIndex((b) => {
      const a = b.getAttribute("aria-label");
      return a ? [n, `${n}, no va aquí`, `${n}, correcto`].includes(a) : b.textContent.trim() === n;
    }), nombre);
    if (i < 0) { filas.push({ ancho, alto, modo, nombre: `NO ENCONTRÉ «${nombre}»`, tapado: "—" }); return; }
    await clicReal(p.locator("figure button").nth(i), nombre);
  };
  const siguiente = async () => { await clicReal(p.locator("[data-siguiente]"), "Siguiente"); await p.waitForTimeout(250); };
  for (const [n, pieza] of PIEZAS_SECUENCIA_T2.entries()) {
    for (const [k, pt] of pieza.pantallas.entries()) {
      const rotulo = `P${n + 1}·${k}`;
      await estado(`${rotulo} ${pt.tipo} antes`);
      const orden = pt.fichas ? await p.evaluate((c) => JSON.parse(sessionStorage.getItem("fae-secuencia:cuentas-debe-haber") || "{}").estados?.[c]?.orden ?? null, `${pieza.id}/${pt.id}`) : null;
      for (const [nombre, controles] of guion(pt, modo, orden ?? undefined)) {
        for (const c of controles) {
          if (c === "@ultimo") await clicReal(p.locator("figure button:not([disabled])").last(), "última opción");
          else if (c === "@todos") {
            /* Los controles pueden irse al tocarlos («Ver el mayor»): se cuentan de nuevo cada vez. */
            for (let j = 0; j < await p.locator("figure button").count(); j++) {
              const b = p.locator("figure button").nth(j);
              if (await b.isEnabled({ timeout: 1000 }).catch(() => false)) await clicReal(b, `control ${j + 1}`);
            }
          } else await tocar(c);
        }
        await p.waitForTimeout(400);
        await estado(`${rotulo} ${nombre}`);
      }
      for (let j = 0; j < (pt.pasos | 0); j++) { await siguiente(); await estado(`${rotulo} paso ${j + 1}`); }
      if (k < pieza.pantallas.length - 1 || n < PIEZAS_SECUENCIA_T2.length - 1) await siguiente();
    }
  }
  if (modo === "error") {
    const lit = await p.locator("[data-siguiente]").textContent();
    await siguiente(); await p.waitForTimeout(800);
    filas.push({ ancho, alto, modo, nombre: "Ir a Hacer", final: { literal: lit, hash: await p.evaluate(() => location.hash), nodos: await p.locator("[data-nodo]").count() } });
  } else {
    await p.reload({ waitUntil: "networkidle" }); await p.waitForSelector("[data-secuencia]"); await p.waitForTimeout(500);
    filas.push({ ancho, alto, modo, nombre: "recarga al final", recarga: await p.evaluate(() => ({ pieza: document.querySelector("[data-secuencia]").dataset.pieza, pantalla: document.querySelector("[data-pantalla]").dataset.pantalla, siguiente: document.querySelector("[data-siguiente]").textContent })) });
  }
  await p.close();
}

/* §12.2: el bloque pegado solo se fija si la pantalla no cabe; se fuerza con una ventana baja. */
async function bloquePegado(nav, ancho, errores) {
  const p = await nuevaPagina(nav, ancho, 460, errores);
  await p.goto(`${BASE}#/cuentas-debe-haber/aprender`, { waitUntil: "networkidle" });
  await p.waitForSelector("[data-navegacion]"); await p.waitForTimeout(400);
  const out = await p.evaluate(() => { const n = document.querySelector("[data-navegacion]"); const r = n.getBoundingClientRect(); return { fijo: getComputedStyle(n).position === "fixed", alto: Math.round(r.height), abajo: Math.round(innerHeight - r.bottom) }; });
  await p.close();
  return out;
}

const nav = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const salida = { anchos: {} };
for (const [ancho, alto] of [[320, 568], [375, 667]]) {
  const errores = []; const acc = nuevoAcc(); const filas = [];
  await recorrido(nav, ancho, alto, acc, filas, errores, "error");
  await recorrido(nav, ancho, alto, acc, filas, errores, "acierto");
  const pegado = await bloquePegado(nav, ancho, errores);
  /* La figura frente a su altoFigura: el contenido más alto de cada pieza, y si pisa el apoyo. */
  const figuras = {};
  for (const pz of PIEZAS_SECUENCIA_T2) {
    const suyas = filas.filter((f) => f.arriba?.pieza === pz.id);
    const peor = suyas.reduce((a, f) => (f.arriba.figuraContenido > (a?.arriba.figuraContenido ?? -1) ? f : a), null);
    figuras[pz.id] = { altoFigura: pz.altoFigura[ancho === 320 ? "a320" : "a375"], hueco: Math.max(...suyas.map((f) => f.arriba.figuraHueco)), contenido: peor?.arriba.figuraContenido, donde: peor?.nombre, pisa: Math.max(...suyas.map((f) => f.arriba.figuraSobreApoyo)), mensajeEnFigura: Math.max(...suyas.map((f) => f.arriba.dentroFigura)) };
  }
  salida.anchos[ancho] = { filas, pegado, figuras, errores: [...new Set(errores)], sondas: {
    estados: acc.estados, fuentesOk: acc.fuentesOk,
    contraste: { malos: [...acc.contraste.malos], medidos: acc.contraste.medidos },
    piso: { chicas: [...acc.piso.chicas], medidos: acc.piso.medidos, desbordes: [...acc.piso.desbordes], scrollH: acc.piso.scrollH },
    blanco: { malos: [...acc.blanco.malos], medidos: acc.blanco.medidos, ilustraciones: acc.blanco.ilustraciones },
    ficha: { tapados: [...acc.ficha.tapados], con: acc.ficha.con, sin: acc.ficha.sin, medidos: acc.ficha.medidos },
  } };
  const s = salida.anchos[ancho].sondas;
  console.log(`\n=== ${ancho}×${alto} · estados ${s.estados} · fuentes ${s.fuentesOk ? "ok" : "NO (respaldo)"} · JS ${salida.anchos[ancho].errores.length}`);
  console.log(`contraste ${s.contraste.malos.length}/${s.contraste.medidos} · <12px ${s.piso.chicas.length}/${s.piso.medidos} desb ${s.piso.desbordes.length}${s.piso.scrollH ? " SCROLL-H" : ""} · toque ${s.blanco.malos.length}/${s.blanco.medidos} (ilustr. saltadas ${s.blanco.ilustraciones}) · ficha tapa ${s.ficha.tapados.length} (con ficha ${s.ficha.con}/${s.ficha.con + s.ficha.sin}, ${s.ficha.medidos} el.)`);
  for (const l of [...s.contraste.malos, ...s.piso.chicas, ...s.piso.desbordes, ...s.blanco.malos, ...s.ficha.tapados]) console.log("   · " + l);
  for (const e of salida.anchos[ancho].errores) console.log("   JS · " + e);
  for (const [id, f] of Object.entries(figuras)) console.log(`figura ${id}: contenido ${f.contenido} / altoFigura ${f.altoFigura} (hueco ${f.hueco}) en «${f.donde}» · pisa el apoyo ${f.pisa} px · <Veredicto> en la figura ${f.mensajeEnFigura}`);
  for (const f of filas) {
    if (f.final) { console.log(`${f.nombre}: «${f.final.literal}» → ${f.final.hash} · ${f.final.nodos} nodos`); continue; }
    if (f.tapado) { console.log(`${f.nombre}: ${f.tapado}`); continue; }
    if (f.recarga) { console.log(`${f.nombre}: ${f.recarga.pieza} pantalla ${f.recarga.pantalla} · «${f.recarga.siguiente}»`); continue; }
    const a = f.arriba, b = f.abajo;
    console.log(`${f.modo.padEnd(7)} ${f.nombre.padEnd(26)} fig ${a.figuraContenido}/${a.figuraHueco} pisa ${a.figuraSobreApoyo} · tit ${a.titularLineas}l · pal ${a.palabras} · bloque ${a.bloqueFijo ? "FIJO" : "flujo"}/${b.bloqueFijo ? "FIJO" : "flujo"} · ficha∩sig ${a.fichaSobreSiguiente}/${b.fichaSobreSiguiente} ∩tit ${a.fichaSobreTitular}/${b.fichaSobreTitular} · sig «${a.siguiente.texto}»${a.siguiente.aria ? " (espera)" : ""}`);
  }
  console.log(`bloque pegado a ${ancho}×460: ${JSON.stringify(pegado)}`);
}
await nav.close();
if (JSON_SALIDA) writeFileSync(JSON_SALIDA, JSON.stringify(salida, null, 1));
