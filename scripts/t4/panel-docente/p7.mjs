/*
 * ⛔ P7 de la Vara 1: las cifras no cambian.
 *
 * Abre el panel VIEJO (build de main) y el NUEVO (build de la rama) con el
 * mismo curso falso y saca cada cifra: las de la cabecera y el periodo, cada
 * tema, cada alerta, cada destacado, cada estudiante (su fila y su detalle,
 * con el historial) y cada actividad (tarjetas, bandas, quién es quién y
 * diagnóstico por pregunta). Después exige que cada cifra del viejo esté en
 * el nuevo con el mismo valor. Una sola diferencia es FALLA (código 1). Si no
 * pudo medir, código 2.
 *
 *   node scripts/t4/panel-docente/p7.mjs http://localhost:8098 http://localhost:8099 [salida.json]
 *
 * El nombre del nivel de una alerta cambia a propósito (URGENTE → RIESGO ALTO,
 * Ukyo §4); se compara el nivel, no su rótulo.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { abrirPanel, chromium, hayFuentes, RAIZ } from "./pagina.mjs";

const [VIEJO = "http://localhost:8098", NUEVO = "http://localhost:8099"] = process.argv.slice(2);
const SALIDA = process.argv[4] ?? join(RAIZ, "orquestador/revisiones/panel-docente/p7-medidas.json");
const ESCENARIO = process.env.P7_ESCENARIO ?? "normal";
if (!hayFuentes()) { console.error("faltan las fuentes: bash scripts/t4/sonda-enganche/fuentes.sh"); process.exit(2); }

/* ───────────── Extractores, en la página (sirven a los dos paneles: los componentes de dentro son los mismos) ───────────── */
const EXTRACTORES = `
window.__p7 = {
  t: (s) => (s ?? "").replace(/\\s+/g, " ").trim(),
  pRot: (root, rot) => [...root.querySelectorAll("p")].find((p) => p.textContent.trim() === rot) ?? null,
  siguiente: (p) => p?.nextElementSibling ? __p7.t(p.nextElementSibling.textContent) : null,
  detalle(root) {
    const o = {};
    for (const r of ["FP TOTAL", "FP ESTE CICLO", "ACIERTO EVALUATIVAS", "POSICIÓN"]) o[r] = __p7.siguiente(__p7.pRot(root, r));
    const h = __p7.pRot(root, "HISTORIAL POR ACTIVIDAD");
    const filas = h?.nextElementSibling?.children ?? [];
    o.historial = [...filas].map((f) => [...f.children].map((x) => __p7.t(x.textContent)).join(" | "));
    return o;
  },
  rendimiento(root) {
    const o = {};
    for (const r of ["LA TERMINARON", "ACIERTO MEDIO", "TIEMPO MEDIO", "FP MEDIO"]) {
      const p = __p7.pRot(root, r);
      o[r] = p ? __p7.siguiente(p) : null;
      if (p && r === "LA TERMINARON") o["LA TERMINARON · pie"] = __p7.t(p.nextElementSibling?.nextElementSibling?.textContent);
    }
    for (const b of ["Alto", "Medio", "Bajo"]) {
      const nom = [...root.querySelectorAll("span")].find((s) => s.textContent.trim() === b && s.closest("div,span[data-banda]"));
      let x = nom, m = null;
      for (let i = 0; x && i < 5 && !m; i++, x = x.parentElement) m = x.textContent.match(/(\\d+) estudiantes?/);
      o["banda " + b] = m ? m[1] : null;
    }
    const q = __p7.pRot(root, "QUIÉN ES QUIÉN");
    o.quien = q ? [...q.parentElement.querySelectorAll(":scope > div > div")].map((f) => __p7.t(f.textContent).replace(/ (alto|medio|bajo) /, " ")) : [];
    const d = __p7.pRot(root, "DIAGNÓSTICO POR PREGUNTA");
    const lista = d ? [...d.parentElement.querySelectorAll(":scope > div > div")].filter((f) => /fallaron/.test(f.textContent)) : [];
    o.items = lista.map((f) => __p7.t(f.textContent));
    return o;
  },
  alertas(root) {
    const NIV = { "URGENTE": "alto", "RIESGO ALTO": "alto", "ATENCIÓN": "medio", "RIESGO MEDIO": "medio", "INFORMATIVO": "bajo", "RIESGO BAJO": "bajo" };
    const h = [...root.querySelectorAll("h2")].find((x) => x.textContent.trim() === "ALERTAS");
    const sec = h?.closest("section");
    if (!sec) return null;
    return [...sec.querySelectorAll(":scope > div > div")].map((a) => {
      const ps = a.querySelectorAll("p");
      return NIV[__p7.t(ps[0]?.textContent)] + " · " + __p7.t(ps[1]?.textContent) + " · " + __p7.t(ps[2]?.textContent);
    });
  },
  destacados(root) {
    const h = [...root.querySelectorAll("h2")].find((x) => x.textContent.trim() === "DESTACADOS");
    const sec = h?.closest("section");
    if (!sec) return null;
    return [...sec.querySelectorAll(":scope > div:not(:first-of-type) > div, :scope > div[style*=grid] > div")].map((c) => __p7.t(c.textContent));
  },
};`;

const navegador = await chromium.launch();
const abrir = async (url) => {
  const a = await abrirPanel(navegador, { url, escenario: ESCENARIO, ancho: 1366, alto: 900 });
  await a.page.addScriptTag({ content: EXTRACTORES }).catch(() => {});
  return a;
};
const asegurar = (page) => page.evaluate(EXTRACTORES);
const esperarCarga = async (page) => { await page.waitForLoadState("networkidle").catch(() => {}); await page.waitForTimeout(250); };

/* ───────────── El viejo ───────────── */
async function viejo() {
  const { ctx, page } = await abrir(VIEJO);
  await page.waitForSelector("section.fae-cr-entrar", { timeout: 30000 });
  await esperarCarga(page); await asegurar(page);
  const o = {};
  Object.assign(o, await page.evaluate(() => {
    const r = {};
    const cab = document.querySelector("section.fae-cr-entrar");
    const p = (rot) => __p7.pRot(cab, rot);
    r["activos"] = __p7.siguiente(p("ACTIVOS ESTE CICLO"));
    r["activos · de"] = (__p7.t(p("ACTIVOS ESTE CICLO")?.nextElementSibling?.nextElementSibling?.textContent).match(/\d+/) ?? [null])[0];
    r["alertas pendientes"] = __p7.siguiente(p("ALERTAS PENDIENTES"));
    const chips = __p7.t(p("ALERTAS PENDIENTES")?.nextElementSibling?.nextElementSibling?.textContent);
    for (const [k, re] of [["alertas urgentes", /(\d+) urgentes/], ["alertas atención", /(\d+) atención/], ["alertas informativas", /(\d+) informativas/]]) r[k] = (chips.match(re) ?? [])[1] ?? null;
    const d = p("DESDE TU ÚLTIMA VISITA")?.parentElement;
    r["fp nuevos"] = d ? (__p7.t(d.textContent).match(/(\d+)\s*FP nuevos/) ?? [])[1] ?? null : null;
    r["activos movidos"] = d ? (__p7.t(d.textContent).match(/\+(\d+) activos/) ?? [])[1] ?? null : null;
    const kpi = (rot) => { const x = [...document.querySelectorAll("p")].find((e) => e.textContent.trim() === rot); return x ? [__p7.siguiente(x), __p7.t(x.nextElementSibling?.nextElementSibling?.textContent)] : [null, null]; };
    const [ev, evn] = kpi("ACIERTO EVALUATIVAS");
    r["acierto evaluativas"] = ev; r["acierto evaluativas · n"] = (evn.match(/^(\d+) estudiantes/) ?? [])[1] ?? (/Nadie/.test(evn) ? "0" : null);
    r["acierto exploratorias"] = kpi("ACIERTO EXPLORATORIAS")[0];
    r["en riesgo"] = kpi("EN RIESGO")[0];
    const h = [...document.querySelectorAll("h2")].find((x) => x.textContent.trim() === "AVANCE POR TEMA");
    for (const f of h.closest("section").querySelectorAll(":scope > div > div")) {
      const ps = f.querySelectorAll("p");
      r["tema · " + __p7.t(ps[0].textContent)] = __p7.t(ps[ps.length - 1].textContent);
    }
    r.alertas = __p7.alertas(document);
    return r;
  }));
  /* Destacados enteros: «Ver los N restantes». */
  const mas = await page.$("text=/^Ver los \\d+ restantes$/");
  if (mas) await mas.click();
  o.destacados = await page.evaluate(() => __p7.destacados(document));
  /* Cada estudiante: su fila y su detalle. */
  const filas = await page.$$eval("button[aria-expanded]", (bs) => bs.filter((b) => b.closest("section")?.querySelector("h2")?.textContent.startsWith("ESTUDIANTES ACTIVOS")).length);
  o.estudiantes = {};
  for (let i = 0; i < filas; i++) {
    const b = (await page.$$("section:has(h2:text-matches('^ESTUDIANTES ACTIVOS')) button[aria-expanded]"))[i];
    await b.click();
    await page.waitForFunction(() => { const x = document.querySelector("button[aria-expanded=true]")?.closest("div[style*='border-radius']"); return x && !/Cargando…/.test(x.textContent); }, null, { timeout: 15000 });
    await page.waitForTimeout(250);
    const e = await page.evaluate(() => {
      const b = document.querySelector("button[aria-expanded=true]");
      const fila = b.closest("div[style*='border-radius']");
      const celdas = [...b.children].map((x) => __p7.t(x.textContent));
      const nombre = __p7.t(b.children[1].firstElementChild.textContent);
      const val = (rot) => { const c = celdas.find((x) => x.startsWith(rot)); return c ? c.slice(rot.length).trim() : null; };
      const ev = val("EVALUATIVA");
      return { nombre, o: { "fp ciclo": val("FP CICLO"), "fp total": val("FP TOTAL"), "evaluativa": ev?.replace(/\s*\(\d+\)$/, "") ?? null, "evaluativas hechas": (ev?.match(/\((\d+)\)/) ?? [])[1] ?? null, "última vez": val("ÚLTIMA VEZ"), ...__p7.detalle(fila) } };
    });
    o.estudiantes[e.nombre] = e.o;
    await b.click();
  }
  /* Cada actividad, con el selector. */
  o.actividades = {};
  const opciones = await page.$$eval("#rendimiento-por-actividad select option", (xs) => xs.map((x) => ({ v: x.value, n: x.textContent })));
  for (const op of opciones) {
    await page.selectOption("#rendimiento-por-actividad select", op.v);
    await esperarCarga(page);
    o.actividades[op.v] = await page.evaluate(() => __p7.rendimiento(document.getElementById("rendimiento-por-actividad")));
  }
  await ctx.close();
  return o;
}

/* ───────────── El nuevo ───────────── */
async function nuevo() {
  const { ctx, page } = await abrir(NUEVO);
  await page.waitForSelector("[data-bloque=b1]", { timeout: 30000 });
  await esperarCarga(page); await asegurar(page);
  const o = {};
  await page.click("[data-bloque=b1] button[aria-expanded]");
  Object.assign(o, await page.evaluate(() => {
    const r = {};
    const act = __p7.t(document.querySelector("[data-cifra=activos]").textContent).match(/(\d+) de (\d+) activos? esta semana/);
    r["activos"] = act?.[1] ?? null; r["activos · de"] = act?.[2] ?? null;
    const d = __p7.t(document.querySelector("[data-cifra=desde-tu-visita]")?.textContent);
    r["fp nuevos"] = (d.match(/(\d+) FP nuevos/) ?? [])[1] ?? null;
    r["activos movidos"] = (d.match(/\+(\d+) activos/) ?? [])[1] ?? null;
    const ev = __p7.t(document.querySelector("[data-cifra=acierto-evaluativas]").textContent);
    r["acierto evaluativas"] = (ev.match(/: (—|\d+%)/) ?? [])[1] ?? null;
    r["acierto evaluativas · n"] = (ev.match(/· (\d+) estudiantes?/) ?? [])[1] ?? (/nadie/.test(ev) ? "0" : null);
    for (const f of document.querySelectorAll("[data-tema]")) r["tema · " + __p7.t(f.querySelector("p").textContent)] = __p7.t(f.querySelector("[data-cifra-tema]").textContent);
    return r;
  }));
  await page.click("[data-bloque=b1] button[aria-expanded]");
  await page.click("[data-ver-atencion]");
  await page.waitForSelector("[data-vista=atencion]");
  const mas = await page.$("text=/^Ver los \\d+ restantes$/");
  if (mas) await mas.click();
  Object.assign(o, await page.evaluate(() => {
    const r = {};
    r.alertas = __p7.alertas(document);
    const n = (niv) => r.alertas.filter((a) => a.startsWith(niv + " ·")).length;
    r["alertas urgentes"] = String(n("alto")); r["alertas atención"] = String(n("medio")); r["alertas informativas"] = String(n("bajo"));
    r["alertas pendientes"] = String(r.alertas.length);
    r["acierto exploratorias"] = __p7.t(document.querySelector("[data-cifra=acierto-exploratorias]").textContent);
    r["en riesgo"] = __p7.t(document.querySelector("[data-cifra=en-riesgo]").textContent);
    r.destacados = __p7.destacados(document);
    return r;
  }));
  await page.click("[data-volver]");
  /* Cada estudiante: «Mis estudiantes» → su detalle. */
  await page.click("[data-ir=estudiantes]");
  await page.waitForSelector("[data-vista=estudiantes]");
  for (let k = 0; k < 10 && await page.$("[data-ver-mas]"); k++) await page.click("[data-ver-mas]");
  const ids = await page.$$eval("[data-estudiante]", (xs) => xs.map((x) => ({ id: x.dataset.estudiante, ultima: x.querySelector("[data-cifra=ultima-vez]").textContent.trim() })));
  o.estudiantes = {};
  for (const { id, ultima } of ids) {
    await page.click(`[data-estudiante="${id}"]`);
    await page.waitForSelector("[data-vista=estudiante]");
    await page.waitForFunction(() => !/Cargando…/.test(document.querySelector("[data-vista=estudiante]").textContent), null, { timeout: 15000 });
    await page.waitForTimeout(150);
    const e = await page.evaluate(() => {
      const v = document.querySelector("[data-vista=estudiante]");
      const d = __p7.detalle(v);
      return { nombre: __p7.t(v.querySelector("h2").textContent), o: { "fp ciclo": d["FP ESTE CICLO"], "fp total": d["FP TOTAL"], "evaluativa": d["ACIERTO EVALUATIVAS"], "evaluativas hechas": __p7.t(v.querySelector("[data-cifra=n-evaluativas]").textContent), ...d } };
    });
    e.o["última vez"] = ultima;
    o.estudiantes[e.nombre] = e.o;
    await page.click("[data-volver]");
    await page.waitForSelector("[data-vista=estudiantes]");
    for (let k = 0; k < 10 && await page.$("[data-ver-mas]"); k++) await page.click("[data-ver-mas]");
  }
  await page.click("[data-volver]");
  /* Cada actividad: «Actividades» → la actividad → «Más». */
  await page.click("[data-ir=actividades]");
  await page.waitForSelector("[data-fila-actividad]");
  const acts = await page.$$eval("[data-fila-actividad]", (xs) => xs.map((x) => x.dataset.filaActividad));
  o.actividades = {};
  for (const id of acts) {
    await page.click(`[data-fila-actividad="${id}"]`);
    await page.waitForSelector("[data-vista=actividad]");
    await esperarCarga(page);
    if (await page.$("[data-mas-cifras]")) await page.click("[data-mas-cifras]");
    o.actividades[id] = await page.evaluate(() => __p7.rendimiento(document.querySelector("[data-vista=actividad]")));
    await page.click("[data-volver]");
    await page.waitForSelector("[data-fila-actividad]");
  }
  await ctx.close();
  return o;
}

let V, N;
try { V = await viejo(); N = await nuevo(); } catch (e) { console.error("no pude medir:", e); await navegador.close(); process.exit(2); }
await navegador.close();

/* ───────────── La comparación: cada cifra del viejo, en el nuevo y con el mismo valor ───────────── */
const plano = (o, pre = "") => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? plano(v, `${pre}${k} › `) : [[`${pre}${k}`, Array.isArray(v) ? JSON.stringify([...v].sort()) : v]]));
const pv = new Map(plano(V)), pn = new Map(plano(N));
const diferencias = [];
for (const [k, v] of pv) if (!pn.has(k)) diferencias.push({ cifra: k, viejo: v, nuevo: "(no está)" }); else if (pn.get(k) !== v) diferencias.push({ cifra: k, viejo: v, nuevo: pn.get(k) });
/* Contra el falso verde: una cifra que sale vacía en los dos lados no compara nada. */
const vacias = [...pv].filter(([, v]) => v === null || v === "" || v === "[]").map(([k]) => k);
const R = { escenario: ESCENARIO, comparadas: pv.size, vacias, estudiantes: Object.keys(V.estudiantes).length, actividades: Object.keys(V.actividades).length, diferencias, viejo: V, nuevo: N };
writeFileSync(SALIDA, JSON.stringify(R, null, 2) + "\n");
console.log(`P7 · ${ESCENARIO}: ${pv.size} cifras del viejo (${R.estudiantes} estudiantes, ${R.actividades} actividades); vacías en el viejo: ${vacias.length}; diferencias: ${diferencias.length}`);
for (const d of diferencias.slice(0, 40)) console.log(" ✗", d.cifra, "·", JSON.stringify(d.viejo), "→", JSON.stringify(d.nuevo));
process.exit(diferencias.length ? 1 : 0);
