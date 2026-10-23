/*
 * Inventario del panel docente: mide cada bloque y toma las capturas.
 *
 * Sobre el build servido (dist en el 8099) con Supabase falso y sesión fingida.
 * No escribe en ninguna base: todo lo que pide el panel a fake.supabase.test lo
 * contesta este script con un curso inventado y determinista (28 estudiantes de
 * Contabilidad, 2 de ellos cuentas de prueba).
 *
 *   VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build
 *   npx vite preview --port 8099 --strictPort &
 *   node scripts/t4/panel-docente/inventario.mjs [salida.json]
 *
 * Usa las fuentes de la sonda (bash scripts/t4/sonda-enganche/fuentes.sh): sin
 * Sora e Inter de producción los altos no valen, y entonces sale con código 2.
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, "../../..");
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright")); }

const URL_BASE = process.env.PANEL_URL ?? "http://localhost:8099";
const SALIDA = process.argv[2] ?? join(RAIZ, "orquestador/revisiones/panel-docente/medidas.json");
const CAPTURAS = join(RAIZ, "orquestador/revisiones/panel-docente/capturas");
const FUENTES = process.env.SONDA_FUENTES ?? join(RAIZ, "scripts/t4/sonda-enganche/.sonda-fuentes");
const ACTIVIDAD = "t4-entra-o-sale-de-caja";

if (!existsSync(`${FUENTES}/fontsource-inter-5.3.0/package/files/inter-latin-400-normal.woff2`)) {
  console.error(`faltan las fuentes en ${FUENTES}: corre scripts/t4/sonda-enganche/fuentes.sh`);
  process.exit(2);
}

/* ───────────── El curso inventado ───────────── */

let semilla = 42;
const azar = () => ((semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648);
const NOMBRES = [
  "Valentina Rojas", "Santiago Gómez", "Isabella Martínez", "Mateo Castro", "Sofía Herrera",
  "Samuel Pardo", "Mariana López", "Nicolás Vargas", "Gabriela Díaz", "Tomás Ruiz",
  "Daniela Moreno", "Juan Pablo Ortiz", "Camila Suárez", "Alejandro Ríos", "Laura Jiménez",
  "Sebastián Torres", "Paula Ramírez", "David Cárdenas", "Natalia Mejía", "Andrés Salazar",
  "Juliana Peña", "Felipe Acosta", "María José Cruz", "Emilio Rincón", "Sara Velandia",
  "Martín Quintero", "Prueba Docente", "Prueba QA",
];
const ACTIVIDADES = [
  "t1-desde-donde-preguntan", "t1-que-entro-y-que-salio", "cu-izquierda-o-derecha", "cu-de-que-familia",
  "t3-ingreso-o-cobro", "t3-cuando-se-causa", "t4-entra-o-sale-de-caja", "t4-se-mueve-la-caja-menor",
];
const AHORA = Date.now();
const haceDias = (d) => new Date(AHORA - d * 86400000).toISOString();

const ESTUDIANTES = NOMBRES.map((nombre, i) => {
  const prueba = nombre.startsWith("Prueba");
  const inactivo = i % 7 === 3 ? 9 + Math.floor(azar() * 12) : Math.floor(azar() * 5);
  const nAct = 2 + Math.floor(azar() * (ACTIVIDADES.length - 1));
  const pctEval = i % 5 === 1 ? 40 + azar() * 18 : 62 + azar() * 36;
  const nEval = 1 + Math.floor(azar() * 6);
  const fpCiclo = inactivo > 7 ? 0 : Math.floor(azar() * 180);
  return {
    user_id: `00000000-0000-0000-0000-${String(100 + i).padStart(12, "0")}`,
    nickname: nombre.split(" ")[0].toLowerCase() + (i + 1),
    full_name: prueba ? null : nombre,
    en_mi_grupo: !prueba && i < 22,
    fp_total: fpCiclo + 200 + Math.floor(azar() * 900),
    fp_ciclo: fpCiclo,
    ultima_actividad: haceDias(inactivo),
    dias_inactivo: inactivo,
    primera_actividad: haceDias(40),
    actividades: ACTIVIDADES.slice(0, nAct),
    n_registros: nAct + Math.floor(azar() * 8),
    pct_evaluativa: pctEval,
    n_evaluativas: nEval,
    pct_exploratoria: 88 + azar() * 12,
    n_exploratorias: 2 + Math.floor(azar() * 9),
    duracion_media_ms: i % 9 === 4 ? 60000 : 120000 + azar() * 240000,
    pct_evaluativa_14d: inactivo > 7 ? null : pctEval,
    n_evaluativas_14d: inactivo > 7 ? 0 : nEval,
    dias_activos_14d: inactivo > 7 ? 0 : 1 + Math.floor(azar() * 6),
    es_prueba: prueba,
  };
});

const RESUMEN = [{
  desde: haceDias(3), estudiantes_total: 26, estudiantes_activos: 19, fp_nuevos: 1840,
  estudiantes_movidos: 4, actividades_nuevas: ["t4-entra-o-sale-de-caja", "t3-cuando-se-causa"],
}];
const HISTORIAL = ACTIVIDADES.slice(0, 6).map((a, k) => ({
  activity_id: a, modality: k % 2 ? "evaluativa" : "exploratoria", difficulty: "media",
  intentos: 1 + (k % 3), mejor_pct: 55 + k * 7, mejor_fp: 40 + k * 10, fp_total: 90 + k * 20,
  primer_intento: haceDias(30 - k * 4), ultimo_intento: haceDias(20 - k * 3),
}));
const ACT = [{
  activity_id: ACTIVIDAD, modality: "evaluativa", difficulty: "media", completaron: 21, en_grupo: 17,
  grupo_total: 22, intentos: 34, pct_medio: 71.4, distribucion_visible: true, banda_alta: 6,
  banda_media: 7, banda_baja: 4, duracion_media_ms: 214000, fp_medio: 88, intentos_con_detalle: 34,
  detalle_desde: haceDias(25),
}];
const ITEMS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
  const fallos = [3, 11, 5, 14, 2, 8, 6, 4][n - 1];
  return {
    item_id: `h1-${n}`, veces: 34, fallos, pct_fallo: (fallos / 34) * 100,
    respuesta_top: fallos > 7 ? "Haber de Caja" : null, respuesta_top_veces: fallos > 7 ? fallos - 3 : null,
  };
});
const GRUPO_ACT = ESTUDIANTES.filter((e) => e.en_mi_grupo).slice(0, 17).map((e, k) => ({
  user_id: e.user_id, nickname: e.nickname, full_name: e.full_name, es_prueba: e.es_prueba,
  mejor_pct: 35 + ((k * 37) % 65), fp_total: 40 + k * 6, intentos: 1 + (k % 3), ultimo: haceDias(k % 9),
})).sort((a, b) => a.mejor_pct - b.mejor_pct);

const RPC = {
  es_docente: true,
  materias_docente: ["contabilidad", "macroeconomia"],
  panel_estudiantes: ESTUDIANTES,
  panel_resumen: RESUMEN,
  panel_historial: HISTORIAL,
  panel_actividad: ACT,
  panel_items: ITEMS,
  panel_grupo_actividad: GRUPO_ACT,
  grupo_marcar: null,
};

/* ───────────── La sesión fingida (igual que la sonda) ───────────── */

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const exp = Math.floor(AHORA / 1000) + 3600;
const USER = { id: "00000000-0000-0000-0000-000000000001", aud: "authenticated", role: "authenticated", email: "docente@s.test", app_metadata: {}, user_metadata: {}, created_at: "2026-10-01T00:00:00Z" };
const SES = { access_token: `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: USER.id, exp, role: "authenticated", aud: "authenticated", email: USER.email })}.f`, token_type: "bearer", expires_in: 3600, expires_at: exp, refresh_token: "r", user: USER };

const rpcsPedidas = new Set();
async function rutas(page) {
  await page.route("**/*", async (route) => {
    const u = route.request().url();
    if (u.includes("fake.supabase.test")) {
      const m = u.match(/\/rest\/v1\/rpc\/([a-z_]+)/);
      if (m) {
        rpcsPedidas.add(m[1]);
        const cuerpo = m[1] in RPC ? RPC[m[1]] : [];
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
      }
      if (u.includes("/auth/v1/user")) return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(USER) });
      if (u.includes("/rest/v1/profiles")) {
        const perf = { user_id: USER.id, nickname: "docente", full_name: "Docente de prueba" };
        const obj = (route.request().headers().accept ?? "").includes("vnd.pgrst.object");
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(obj ? perf : [perf]) });
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
    if (u.startsWith(URL_BASE)) return route.continue();
    return route.abort();
  });
  await page.addInitScript((s) => {
    try { localStorage.setItem("aprendefae-auth", s); } catch { /* sin almacenamiento */ }
  }, JSON.stringify(SES));
}

/* ───────────── La medición, en la página ───────────── */

function medirEnPagina() {
  const abs = (el) => { const r = el.getBoundingClientRect(); return { y: Math.round(r.top + scrollY), alto: Math.round(r.height) }; };
  const palabras = (el) => (el.innerText || "").trim().split(/\s+/).filter(Boolean).length;
  const secPorTitulo = (re) => {
    const h = [...document.querySelectorAll("h2")].find((x) => re.test(x.textContent.trim()));
    return h ? h.closest("section") : null;
  };
  const marco = document.querySelector("h1")?.closest("div[style*='max-width']");
  const bloques = [];
  const anota = (id, nombre, el, extra = {}) => { if (el) bloques.push({ id, nombre, ...abs(el), palabras: palabras(el), ...extra }); };

  const barra = marco?.firstElementChild;
  anota("barra", "Barra superior (logo, volver, «Panel docente»)", barra);
  const filaTitulo = document.querySelector("h1")?.parentElement;
  anota("titulo", "Título de la materia + «Exportar informe»", filaTitulo);
  const selector = [...(marco?.children ?? [])].find((d) => d !== barra && d !== filaTitulo && d.tagName === "DIV" && d.querySelectorAll("button").length > 1 && !d.querySelector("h1, h2, section"));
  anota("materias", "Selector de materia (pastillas)", selector);
  const cohorte = [...(marco?.children ?? [])].find((p) => p.tagName === "P");
  anota("cohorte", "Frase de cohorte (grupo / cuentas de prueba)", cohorte);
  const cabecera = document.querySelector("section.fae-cr-entrar");
  anota("cabecera", "Cabecera resumen (activos, alertas pendientes, desde tu última visita)", cabecera, { tarjetas: cabecera?.querySelectorAll(":scope > div > div").length });
  const alertas = secPorTitulo(/^ALERTAS$/);
  anota("alertas", "Alertas (una tarjeta por alerta) + «Qué no está midiendo»", alertas, { tarjetas: alertas ? alertas.querySelectorAll(":scope > div > div").length : 0, altoUna: alertas?.querySelector(":scope > div > div") ? abs(alertas.querySelector(":scope > div > div")).alto : null, altoNoMide: alertas?.querySelector("details") ? abs(alertas.querySelector("details")).alto : null });
  const destacados = secPorTitulo(/^DESTACADOS$/);
  anota("destacados", "Destacados (tope de 3 + «Ver los N restantes»)", destacados);
  anota("periodo", "Resumen del periodo (3 KPI)", secPorTitulo(/^RESUMEN DEL PERIODO$/));
  anota("temas", "Avance por tema (una barra por tema)", secPorTitulo(/^AVANCE POR TEMA$/), { filas: secPorTitulo(/^AVANCE POR TEMA$/)?.querySelectorAll(":scope > div > div").length, altoUna: secPorTitulo(/^AVANCE POR TEMA$/)?.querySelector(":scope > div > div") ? abs(secPorTitulo(/^AVANCE POR TEMA$/).querySelector(":scope > div > div")).alto : null });
  const rend = document.getElementById("rendimiento-por-actividad");
  anota("rendimiento", "Rendimiento por actividad (selector + vista)", rend);
  const lista = secPorTitulo(/^ESTUDIANTES ACTIVOS/);
  anota("estudiantes", "Estudiantes activos (buscador, «Solo mi grupo», filas)", lista, { filas: lista ? lista.querySelectorAll("button[aria-expanded]").length : 0 });
  const fila = lista?.querySelector("button[aria-expanded]")?.closest("div[style*='border-radius']");
  anota("fila", "Una fila de estudiante, cerrada", fila);

  /* Las partes de la vista de rendimiento, por sus rótulos. */
  const partes = [];
  if (rend) {
    for (const r of ["LA TERMINARON", "DISTRIBUCIÓN POR BANDAS", "DIAGNÓSTICO POR PREGUNTA", "QUIÉN ES QUIÉN"]) {
      const p = [...rend.querySelectorAll("p")].find((x) => x.textContent.trim() === r);
      if (p) partes.push({ rotulo: r, y: abs(p).y });
    }
  }
  const pliegue = innerHeight;
  const total = document.documentElement.scrollHeight;
  const vistoDeEntrada = bloques.filter((b) => b.y < pliegue && !["fila"].includes(b.id)).map((b) => b.id);
  return { ancho: innerWidth, alto: innerHeight, total, pliegue, vistoDeEntrada, bloques, partesRendimiento: partes };
}

async function medirDetalle(page) {
  const boton = page.locator("section", { hasText: "ESTUDIANTES ACTIVOS" }).locator("button[aria-expanded]").first();
  await boton.scrollIntoViewIfNeeded();
  await boton.click();
  await page.waitForTimeout(700);
  return page.evaluate(() => {
    const b = document.querySelector("button[aria-expanded='true']");
    const fila = b.closest("div[style*='border-radius']");
    const caja = fila.querySelector(".fae-fila-caja");
    const r = fila.getBoundingClientRect();
    return { altoFilaAbierta: Math.round(r.height), altoDetalle: Math.round(caja.getBoundingClientRect().height), y: Math.round(r.top + scrollY) };
  });
}

/* ───────────── Recorrido ───────────── */

mkdirSync(CAPTURAS, { recursive: true });
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM ?? undefined });
const resultado = { fecha: new Date().toISOString(), url: URL_BASE, curso: { estudiantes: ESTUDIANTES.length, prueba: ESTUDIANTES.filter((e) => e.es_prueba).length, enGrupo: ESTUDIANTES.filter((e) => e.en_mi_grupo).length }, medidas: {} };
let fallo = false;

for (const [ancho, alto] of [[375, 667], [1366, 768]]) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(String(e)));
  await rutas(page);
  await page.goto(`${URL_BASE}/#/docente/${ACTIVIDAD}`);
  await page.waitForSelector("#rendimiento-por-actividad", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(300);

  const m = await page.evaluate(medirEnPagina);
  if (!m.bloques.some((b) => b.id === "estudiantes")) { fallo = true; errores.push("el panel no pintó la lista de estudiantes: no se midió"); }
  const sufijo = `${ancho}x${alto}`;
  await page.screenshot({ path: join(CAPTURAS, `01-de-entrada-${sufijo}.png`) });
  await page.screenshot({ path: join(CAPTURAS, `02-panel-completo-${sufijo}.png`), fullPage: true });
  await page.locator("#rendimiento-por-actividad").screenshot({ path: join(CAPTURAS, `03-rendimiento-${sufijo}.png`) });
  m.detalle = await medirDetalle(page);
  const filaAbierta = page.locator("button[aria-expanded='true']").locator("xpath=ancestor::div[contains(@style,'border-radius')][1]");
  await filaAbierta.screenshot({ path: join(CAPTURAS, `04-detalle-estudiante-${sufijo}.png`) });
  m.errores = errores;
  resultado.medidas[sufijo] = m;
  await ctx.close();
}
resultado.rpcsPedidas = [...rpcsPedidas].sort();
await navegador.close();

writeFileSync(SALIDA, JSON.stringify(resultado, null, 2) + "\n");
console.log(JSON.stringify(resultado, null, 2));
process.exit(fallo ? 2 : 0);
