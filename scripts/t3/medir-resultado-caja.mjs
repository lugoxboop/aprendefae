/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «DEL RESULTADO A LA CAJA» (t3-del-resultado-a-la-caja) · LO QUE IPPO MIDE
 * ANTES DE DAR POR BUENO (paquete e3-t3-del-resultado-a-la-caja-v4, §10), EN
 * CHROMIUM, A 320×568 Y 375×667.
 *
 * Monta la vista del Tema 3 tal cual (scripts/t3/harness-t3,
 * #hacer:t3-del-resultado-a-la-caja), con Inter y Sora de @fontsource 5.3.0,
 * y en las dos versiones (A y B, fijadas por el número de intentos guardado)
 * juega cuatro partidas: bien, mal con punteado, mal con la caja negativa
 * (A7) y la que cuadra con errores (A6; en B, con tres fichas mal). Mide:
 *
 *   · VENTANA    la regla de T3: en cada paso (también el 1 tras «Así se
 *                juega», al devolver una ficha desde la lista y con
 *                «Comprobar»), la ranura de decisión entera en la ventana.
 *   · CORTE      §10, PARADA: que «No mueve la caja» no quede con palabras
 *                cortadas (cada palabra en un solo renglón y dentro del botón).
 *   · TRAMO      que en el puente el tramo menor mida 4 px o más.
 *   · ALTOS      encabezado, ficha del caso, ranura, tarjeta, renglones y puente.
 *   · LEYENDA    Kamogawa, #557: «Punteado: …» solo si hay punteado; en caja
 *                negativa, «Con tus respuestas, la caja daba −$X»; si
 *                cuadra con errores, ninguna.
 *   · TENUE      Kamogawa, #557: la ficha que no mueve la caja y el
 *                estudiante sumó o restó, en su renglón tenue, con su alto.
 *   · BARRA, SALE, LETRA (≥ 12 px), TOQUE (≥ 44 × 44) y CONTRASTE (texto
 *                ≥ 4,5:1, contorno de los botones en reposo ≥ 3:1).
 *
 *   node scripts/t3/medir-resultado-caja.mjs [carpeta-de-capturas]
 *
 * Con carpeta, guarda las capturas a media escala (deviceScaleFactor 1) de
 * vacío, a mitad, bien, mal (punteado), mal con caja negativa, mal que cuadra
 * con errores y resumen, en A y B y en los dos anchos; y el puente solo, con
 * el renglón tenue, de la partida «mal» (resultado-caja-<v>-<ancho>-tenue). Sale con 1 si algo no cumple.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CASO_A, CASO_B, SUMA, RESTA, NO_MUEVE, LEYENDA_PUNTEADO, LEYENDA_NEGATIVA, TU_RESPUESTA, signoDe } from "../../src/data/contabilidadTema3ResultadoCaja.js";
import { cajaDe, pesos, conSigno } from "../../src/contabilidad/resultadoCaja.js";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const FUENTES = "/tmp/claude-0/fuentes/";
const ANCHOS = [320, 375];
const ALTOS = { 320: 568, 375: 667 };
const ID = "t3-del-resultado-a-la-caja";
const CASOS = { A: CASO_A, B: CASO_B };

/* Las partidas: qué ficha va mal y adónde. */
const PARTIDAS = {
  A: {
    bien: {},
    mal: { "t3rc-a2": SUMA },
    negativa: { "t3rc-a1": NO_MUEVE },
    cuadra: { "t3rc-a2": SUMA, "t3rc-a4": RESTA },
  },
  B: {
    bien: {},
    mal: { "t3rc-b3": SUMA, "t3rc-b6": SUMA },
    negativa: { "t3rc-b1": RESTA },
    /* La única que cuadra con tres mal (con cuatro hay otra). */
    cuadra: { "t3rc-b1": NO_MUEVE, "t3rc-b3": SUMA, "t3rc-b4": SUMA },
  },
};

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t3/harness-t3/index.html#hacer:${ID}`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const compartidos = new Set();
const filas = [];
const enVentana = [];
const cortes = [];
const fuentesReales = existsSync(`${FUENTES}fuentes.css`);

async function contexto(ancho) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: ALTOS[ancho] }, deviceScaleFactor: 1 });
  if (fuentesReales) {
    const css = readFileSync(`${FUENTES}fuentes.css`, "utf8");
    await ctx.route("https://fonts.googleapis.com/**", (r) => r.fulfill({ status: 200, contentType: "text/css", body: css }));
    await ctx.route("https://fonts.gstatic.com/**", (r) => {
      const f = r.request().url().replace("https://fonts.gstatic.com/", "").replace(/\//g, "_");
      try { return r.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(FUENTES + f) }); } catch { return r.abort(); }
    });
  }
  return ctx;
}

/* En la página: todo lo que se mide de un estado. */
function medir() {
  const raiz = document.querySelector("[data-resultado-caja]");
  const panel = raiz.closest("section") ?? raiz;
  const caja = (sel) => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect() : null; };
  const p = panel.getBoundingClientRect();
  const r = { barra: document.documentElement.scrollWidth > window.innerWidth + 1, sale: [], letra: [], toque: [], contraste: [] };
  const ficha = caja("[data-ficha-caso]");
  const ranura = caja("[data-ranura]");
  const tarjeta = caja("[data-tarjeta]");
  const puente = caja("[data-puente]");
  r.encabezado = ficha ? ficha.top - 16 - p.top : null;
  r.ficha = ficha?.height ?? null;
  r.ranura = ranura ? [ranura.top - p.top, ranura.bottom - p.top] : null;
  r.tarjeta = tarjeta?.height ?? null;
  r.util = raiz.getBoundingClientRect().width;
  const t = document.querySelector("[data-tarjeta]");
  if (t) { const s = getComputedStyle(t); r.dentro = tarjeta.width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight) - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth); }
  r.botones = [...document.querySelectorAll("[data-tarjeta] [data-eleccion]")].map((b) => { const c = b.getBoundingClientRect(); return `${c.width.toFixed(1)}×${c.height.toFixed(0)}`; });
  r.renglones = [...document.querySelectorAll("[data-renglon-lista]")].map((x) => Math.round(x.getBoundingClientRect().height));
  r.puente = puente?.height ?? null;
  r.tramos = [...document.querySelectorAll("[data-puente] [data-tramo]")].map((x) => x.getBoundingClientRect().width);
  r.pista = document.querySelector("[data-puente] [data-pista]")?.getBoundingClientRect().width ?? null;
  r.punteado = document.querySelector("[data-puente] [data-punteado]")?.getBoundingClientRect().width ?? null;
  r.cifraSuya = document.querySelector("[data-puente] [data-cifra-suya]")?.textContent ?? null;
  r.devolucion = [...document.querySelectorAll("[data-parrafo-devolucion]")].map((p) => p.textContent.replace(/^(Correcto|Incorrecto)\. /, ""));
  r.leyendas = [...document.querySelectorAll("[data-puente] [data-leyenda]")].map((x) => ({ tipo: x.dataset.leyenda, texto: x.textContent, alto: x.getBoundingClientRect().height }));
  r.tenues = [...document.querySelectorAll("[data-puente] [data-renglon-tenue]")].map((x) => {
    const [nombre, cifra] = x.querySelectorAll("span");
    const monto = x.querySelector("[data-monto-tenue]").getClientRects();
    return { nombre: nombre.textContent, cifra: cifra.textContent, alto: x.getBoundingClientRect().height, lineasNombre: Math.round(nombre.getBoundingClientRect().height / 16), lineasCifra: Math.round(cifra.getBoundingClientRect().height / 16), cifraEnUnRenglon: monto.length === 1 };
  });
  const nombreLineas = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); return new Set([...rg.getClientRects()].map((q) => Math.round(q.top))).size; };
  const nombre1 = document.querySelector("[data-tarjeta] [data-nombre]");
  r.lineasNombre = nombre1 ? nombreLineas(nombre1) : null;

  /* Colores: el fondo efectivo de un elemento, compuesto hasta el primero opaco. */
  const rgba = (s) => { const v = s.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0]; return [v[0], v[1], v[2], v[3] ?? 1]; };
  const sobre = (a, b) => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
  const fondoDe = (el) => {
    const capas = [];
    for (let x = el; x; x = x.parentElement) {
      const c = rgba(getComputedStyle(x).backgroundColor);
      if (c[3] > 0) capas.push(c);
      if (c[3] >= 1) break;
    }
    let base = [14, 27, 46, 1];
    for (const c of capas.reverse()) base = sobre(c, base);
    return base;
  };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((u, v) => v - u); return (x + 0.05) / (y + 0.05); };

  const nombre = (el) => `${el.tagName.toLowerCase()}${[...el.attributes].filter((a) => a.name.startsWith("data-")).map((a) => `[${a.name}]`).slice(0, 2).join("")} «${(el.textContent || "").trim().slice(0, 24)}»`;
  const visible = (el) => {
    for (let x = el; x && x !== document.body; x = x.parentElement) {
      const s = getComputedStyle(x);
      if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
      if ((s.position === "absolute" || s.position === "fixed") && (s.clip !== "auto" || (s.clipPath && s.clipPath !== "none"))) return false;
    }
    return true;
  };
  let minimo = Infinity;
  for (const el of raiz.querySelectorAll("*")) {
    const propios = [...el.childNodes].filter((x) => x.nodeType === 3 && x.textContent.trim().length > 0);
    if (!propios.length || !visible(el)) continue;
    const c = el.getBoundingClientRect();
    if (!c.width || !c.height) continue;
    const s = getComputedStyle(el);
    if (parseFloat(s.fontSize) < 11.95) {
      /* «?» de BotonComoSeJuega y «RESULTADO» del Cierre: compartidos, iguales en todas las Hacer de T3. Se informan aparte. */
      const compartido = el.closest("[data-como-se-juega]") || el.closest(".fae-cz-entrar");
      (compartido ? (r.compartido ??= []) : r.letra).push(`${s.fontSize} ${nombre(el)}`);
    }
    for (const t of propios) {
      const rango = document.createRange();
      rango.selectNodeContents(t);
      for (const q of rango.getClientRects()) {
        if (!q.width) continue;
        const exceso = Math.max(q.right - c.right, c.left - q.left, q.bottom - c.bottom - 2);
        if (exceso > 1.5 || q.right > window.innerWidth + 0.5) { r.sale.push(`${nombre(el)} · ${exceso.toFixed(1)} px`); break; }
      }
    }
    const k = contraste(rgba(s.color), fondoDe(el));
    minimo = Math.min(minimo, k);
    if (el.closest("[data-renglon-tenue]")) r.contrasteTenue = Math.min(r.contrasteTenue ?? Infinity, Math.round(k * 100) / 100);
    if (k < 4.5) r.contraste.push(`${k.toFixed(2)}:1 ${nombre(el)}`);
  }
  r.contrasteMinTexto = Math.round(minimo * 100) / 100;

  /* El contorno en reposo de un botón contra el fondo de la tarjeta (no es texto: 3:1). */
  const reposo = [...document.querySelectorAll('[data-eleccion][aria-pressed="false"]')][0];
  if (reposo) {
    const borde = rgba(getComputedStyle(reposo).borderTopColor);
    const fondo = fondoDe(reposo.parentElement);
    r.contrasteContorno = Math.round(contraste(sobre(borde, fondo), fondo) * 100) / 100;
  }
  for (const b of raiz.querySelectorAll("button")) {
    const c = b.getBoundingClientRect();
    if (!c.width) continue;
    const extra = b.hasAttribute("data-como-se-juega") ? 4 : 0;
    if (c.width + extra < 44 || c.height + extra < 44) r.toque.push(`${c.width.toFixed(0)}×${c.height.toFixed(0)} ${nombre(b)}`);
  }
  return r;
}

/* §10, PARADA: «No mueve la caja» sin palabras cortadas. Cada palabra en un solo renglón y dentro del botón. */
function corte() {
  const b = document.querySelector('[data-tarjeta] [data-eleccion="no"]');
  if (!b) return null;
  const cb = b.getBoundingClientRect();
  const s = getComputedStyle(b);
  const izq = cb.left + parseFloat(s.borderLeftWidth);
  const der = cb.right - parseFloat(s.borderRightWidth);
  const texto = b.firstChild;
  const palabras = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(texto.textContent))) {
    const rg = document.createRange();
    rg.setStart(texto, m.index); rg.setEnd(texto, m.index + m[0].length);
    const rects = [...rg.getClientRects()].filter((q) => q.width > 0);
    const q = rg.getBoundingClientRect();
    palabras.push({ palabra: m[0], trozos: rects.length, dentro: q.left >= izq - 0.5 && q.right <= der + 0.5 && q.top >= cb.top - 0.5 && q.bottom <= cb.bottom + 0.5, ancho: q.width, top: Math.round(q.top) });
  }
  const lineas = [...new Set(palabras.map((x) => x.top))].map((top) => palabras.filter((x) => x.top === top).map((x) => x.palabra).join(" "));
  return { boton: `${cb.width.toFixed(1)}×${cb.height.toFixed(1)}`, interior: (der - izq - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)).toFixed(1), lineas, cortada: palabras.filter((x) => x.trozos !== 1 || !x.dentro).map((x) => x.palabra), desborda: b.scrollWidth > b.clientWidth + 0.5 || b.scrollHeight > b.clientHeight + 0.5 };
}

/* La regla de ventana de T3: la ranura de decisión entera en la ventana. */
function ventana() {
  const q = document.querySelector("[data-ranura]").getBoundingClientRect();
  return { arriba: q.top, abajo: q.bottom, alto: innerHeight, paso: document.querySelector("[data-paso]")?.textContent ?? "Comprobar" };
}
const revisarVentana = (etq, v) => {
  enVentana.push(`| ${etq} | ${v.paso} | ${v.arriba.toFixed(1)} | ${v.abajo.toFixed(1)} | ${(v.abajo - v.arriba).toFixed(1)} | ${v.alto} |`);
  if (v.arriba < -0.5 || v.abajo > v.alto + 0.5) fallos.push(`${etq} · ${v.paso}: la ranura NO cabe en la ventana (de ${v.arriba.toFixed(1)} a ${v.abajo.toFixed(1)}, ventana ${v.alto})`);
};

async function abrir(ancho, version, { tutorial = false, reducir = false } = {}) {
  const ctx = await contexto(ancho);
  const pagina = await ctx.newPage();
  await pagina.addInitScript(([v, id, tut]) => {
    localStorage.setItem(`fae:r5:intentos:${id}`, v === "B" ? "1" : "0");
    if (!tut) localStorage.setItem(`fae-asi-se-juega:v1:${id}:anonimo`, "visto");
  }, [version, ID, tutorial]);
  await pagina.emulateMedia({ reducedMotion: reducir ? "reduce" : "no-preference" });
  await pagina.goto(URL_BASE);
  await pagina.waitForSelector("[data-resultado-caja]", { state: "attached" });
  await pagina.evaluate(() => document.fonts.ready);
  return { ctx, pagina };
}

async function partida(ancho, version, nombre) {
  const caso = CASOS[version];
  const cambios = PARTIDAS[version][nombre];
  const { ctx, pagina } = await abrir(ancho, version);
  const etq = `${ancho} · ${version} · ${nombre}`;
  const nota = (estado, r) => {
    filas.push(`| ${ancho} | ${version} | ${estado} | ${r.encabezado?.toFixed(1) ?? "—"} | ${r.ficha?.toFixed(1) ?? "—"} | ${r.ranura ? r.ranura.map((x) => x.toFixed(1)).join("–") : "—"} | ${r.tarjeta?.toFixed(1) ?? "—"} (${r.lineasNombre ?? "—"} l.) | ${r.util.toFixed(0)} / ${r.dentro?.toFixed(0) ?? "—"} | ${r.botones.join(" · ") || "—"} | ${r.renglones.join(" ") || "—"} | ${r.puente?.toFixed(1) ?? "—"} | ${r.tramos.length ? Math.min(...r.tramos).toFixed(1) : "—"} | ${r.contrasteMinTexto} | ${r.contrasteContorno ?? "—"} |`);
    if (r.barra) fallos.push(`${etq} · ${estado}: barra horizontal`);
    for (const x of r.sale) fallos.push(`${etq} · ${estado}: SALE ${x}`);
    for (const x of r.letra) fallos.push(`${etq} · ${estado}: LETRA ${x}`);
    for (const x of r.compartido ?? []) compartidos.add(`LETRA ${x} (compartido)`);
    for (const x of r.toque) fallos.push(`${etq} · ${estado}: TOQUE ${x}`);
    for (const x of r.contraste) fallos.push(`${etq} · ${estado}: CONTRASTE ${x}`);
    if (r.contrasteContorno !== undefined && r.contrasteContorno < 3) fallos.push(`${etq} · ${estado}: contorno en reposo ${r.contrasteContorno}:1`);
    if (r.tramos.length && Math.min(...r.tramos) < 4) fallos.push(`${etq} · ${estado}: tramo de ${Math.min(...r.tramos).toFixed(1)} px (< 4)`);
    return r;
  };
  const captura = async (estado) => {
    if (!CAPTURAS) return;
    const panel = pagina.locator("[data-resultado-caja]").locator("xpath=ancestor::section[1]");
    await panel.screenshot({ path: `${CAPTURAS}/resultado-caja-${version}-${ancho}-${estado}.png`, animations: "disabled" });
  };
  await pagina.waitForTimeout(900);
  const conCapturas = true;
  if (nombre === "bien") { nota("vacío", await pagina.evaluate(medir)); await captura("vacio"); }
  for (const [k, f] of caso.fichas.entries()) {
    revisarVentana(etq, await pagina.evaluate(ventana));
    if (nombre === "bien") {
      const c = await pagina.evaluate(corte);
      cortes.push(`| ${ancho} | ${version} | ${f.nombre} | ${c.boton} | ${c.interior} | ${c.lineas.join(" / ")} | ${c.cortada.length ? c.cortada.join(", ") : "ninguna"} |`);
      if (c.cortada.length || c.desborda) fallos.push(`PARADA §10 · ${etq} · «No mueve la caja» con palabras cortadas: ${c.cortada.join(", ")}${c.desborda ? " (desborda)" : ""}`);
    }
    await pagina.click(`[data-tarjeta] [data-eleccion="${cambios[f.id] ?? f.va}"]`);
    await pagina.waitForTimeout(320);
    if (nombre === "bien" && k === 1) {
      nota("a mitad", await pagina.evaluate(medir)); await captura("a-mitad");
      /* Devolver la primera ficha desde la lista: la ranura sigue en la ventana. */
      await pagina.locator(`[data-renglon-lista="${caso.fichas[0].id}"] button`).click();
      await pagina.waitForTimeout(500);
      revisarVentana(`${etq} · devuelta desde la lista`, await pagina.evaluate(ventana));
      await pagina.click(`[data-tarjeta] [data-eleccion="${caso.fichas[0].va}"]`);
      await pagina.waitForTimeout(320);
    }
  }
  revisarVentana(etq, await pagina.evaluate(ventana));
  if (nombre === "bien") nota("todas, con «Comprobar»", await pagina.evaluate(medir));
  await pagina.click("[data-comprobar]");
  await pagina.waitForTimeout(400);
  await pagina.locator("[data-puente]").scrollIntoViewIfNeeded();
  await pagina.waitForTimeout(1800);
  const estado = { bien: "bien", mal: "mal (punteado)", negativa: "mal (caja negativa, A7)", cuadra: "mal (cuadra con errores, A6)" }[nombre];
  const r = nota(estado, await pagina.evaluate(medir));
  filas.push(`|  |  | ↳ ${nombre}: pista ${r.pista?.toFixed(1)} px, punteado ${r.punteado === null ? "ninguno" : `${r.punteado.toFixed(1)} px`}, cifra de sus respuestas ${r.cifraSuya ?? "—"}, renglones ${r.renglones.join(" ")} |`);
  if (nombre === "negativa" && r.punteado !== null) fallos.push(`${etq}: A7, hay punteado con la caja negativa`);
  if (nombre === "mal" && r.punteado === null) fallos.push(`${etq}: el error no dejó punteado`);
  /* LEYENDA (Kamogawa, #557). */
  const suya = cajaDe(caso, Object.fromEntries(caso.fichas.map((f) => [f.id, cambios[f.id] ?? f.va])));
  const esperada = nombre === "mal" ? [{ tipo: "punteado", texto: LEYENDA_PUNTEADO }]
    : nombre === "negativa" ? [{ tipo: "negativa", texto: `${LEYENDA_NEGATIVA} ${pesos(suya)}` }] : [];
  const vista = r.leyendas.map(({ tipo, texto }) => ({ tipo, texto }));
  if (JSON.stringify(vista) !== JSON.stringify(esperada)) fallos.push(`${etq}: LEYENDA ${JSON.stringify(vista)}, se esperaba ${JSON.stringify(esperada)}`);
  if (nombre === "cuadra" && (r.punteado !== null || r.cifraSuya !== null)) fallos.push(`${etq}: cuadra con errores y hay punteado o cifra`);
  if (nombre === "negativa" && r.cifraSuya !== pesos(suya)) fallos.push(`${etq}: la cifra negativa es ${r.cifraSuya}, se esperaba ${pesos(suya)}`);
  /* La cifra negativa va pegada a la frase: el monto no se parte (nowrap) y sale en el mismo párrafo. */
  /* TENUE (Kamogawa, #557): una por cada ficha que no mueve y el estudiante movió. */
  const tenuesEsperados = caso.fichas.filter((f) => f.va === NO_MUEVE && signoDe(cambios[f.id])).map((f) => ({ nombre: f.nombre, cifra: `${conSigno(signoDe(cambios[f.id]), f.monto)} ${TU_RESPUESTA}` }));
  const tenuesVistos = r.tenues.map(({ nombre: n, cifra }) => ({ nombre: n, cifra }));
  if (JSON.stringify(tenuesVistos) !== JSON.stringify(tenuesEsperados)) fallos.push(`${etq}: TENUE ${JSON.stringify(tenuesVistos)}, se esperaba ${JSON.stringify(tenuesEsperados)}`);
  for (const x of r.tenues) if (!x.cifraEnUnRenglon) fallos.push(`${etq}: el monto del renglón tenue se parte`);
  filas.push(`|  |  | ↳ leyenda: ${r.leyendas.length ? r.leyendas.map((l) => `«${l.texto}» (${l.alto.toFixed(1)} px)`).join(", ") : "ninguna"}; renglón tenue: ${r.tenues.length ? r.tenues.map((x) => `«${x.nombre} ${x.cifra}» (${x.alto.toFixed(1)} px, nombre en ${x.lineasNombre} l., cifra en ${x.lineasCifra} l.)`).join(", ") + `, contraste ${r.contrasteTenue}:1` : "ninguno"}; devolución: ${r.devolucion?.[0] ?? "—"} |`);
  if (r.tenues.length && !(r.contrasteTenue >= 4.5)) fallos.push(`${etq}: el renglón tenue baja de 4,5:1 (${r.contrasteTenue}:1)`);
  if (conCapturas) {
    await pagina.evaluate(() => scrollTo(0, 0));
    await captura({ bien: "bien", mal: "mal", negativa: "mal-negativa", cuadra: "mal-cuadra" }[nombre]);
    if (CAPTURAS && r.tenues.length) await pagina.locator("[data-puente]").screenshot({ path: `${CAPTURAS}/resultado-caja-${version}-${ancho}-tenue.png`, animations: "disabled" });
  }
  if (nombre === "bien") {
    await pagina.click("[data-siguiente]");
    await pagina.waitForSelector('[data-estado-partida="resumen"]');
    await pagina.waitForTimeout(700);
    nota("resumen", await pagina.evaluate(medir));
    await captura("resumen");
  }
  await ctx.close();
}

/* El paso 1 después de «Así se juega»: «Siguiente» muestra la partida y la vista sube a la ficha del caso. */
async function trasElTutorial(ancho) {
  const { ctx, pagina } = await abrir(ancho, "A", { tutorial: true });
  await pagina.waitForSelector("[data-asi-se-juega]");
  await pagina.waitForTimeout(3500);
  const demo = await pagina.locator("[data-asi-se-juega] [data-parrafo-devolucion]").count();
  filas.push(`|  |  | «Así se juega» a ${ancho}: la demo ${demo ? "puso la ficha en Resta y mostró la resolución" : "NO mostró la resolución"} |`);
  if (!demo) fallos.push(`${ancho}: la demo de «Así se juega» no llegó a la resolución`);
  await pagina.locator("[data-asi-se-juega] button", { hasText: /^Siguiente$/ }).first().click();
  await pagina.waitForTimeout(900);
  revisarVentana(`${ancho} · A · paso 1 tras «Así se juega»`, await pagina.evaluate(ventana));
  await ctx.close();
}

/* Movimiento reducido: el puente aparece entero, con el punteado. */
async function reducido(ancho) {
  const { ctx, pagina } = await abrir(ancho, "A", { reducir: true });
  for (const f of CASO_A.fichas) await pagina.click(`[data-tarjeta] [data-eleccion="${f.id === "t3rc-a2" ? SUMA : f.va}"]`);
  await pagina.click("[data-comprobar]");
  await pagina.waitForTimeout(80);
  const v = await pagina.evaluate(() => {
    const p = document.querySelector("[data-puente]");
    const op = [...p.querySelectorAll("[data-renglon], [data-punteado]")].map((x) => Number(getComputedStyle(x).opacity));
    return { visible: getComputedStyle(p).visibility, opacidad: Math.min(...op), punteado: Boolean(p.querySelector("[data-punteado]")), iba: document.querySelectorAll("[data-iba]").length };
  });
  filas.push(`|  |  | movimiento reducido a ${ancho}, a los 80 ms de «Comprobar»: puente ${v.visible}, opacidad mínima ${v.opacidad}, punteado ${v.punteado ? "sí" : "no"}, «Iba aquí» ${v.iba} |`);
  if (v.visible !== "visible" || v.opacidad < 1 || !v.punteado || v.iba !== 1) fallos.push(`${ancho}: con movimiento reducido el puente no aparece entero`);
  await ctx.close();
}

for (const ancho of ANCHOS) {
  await trasElTutorial(ancho);
  for (const version of ["A", "B"]) for (const nombre of Object.keys(PARTIDAS[version])) await partida(ancho, version, nombre);
  await reducido(ancho);
}
await navegador.close();
await servidor.close();

console.log(`fuentes: ${fuentesReales ? "Inter y Sora de @fontsource 5.3.0" : "LAS DEL SISTEMA (no hay /tmp/claude-0/fuentes): las medidas de texto no valen"}`);
console.log("| Ancho | Versión | Estado | Encabezado | Ficha del caso | Ranura (desde el Panel) | Tarjeta | Útil / tarjeta por dentro | Botones | Renglones | Puente | Tramo menor | Contraste mín. texto | Contorno reposo |");
console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
console.log(filas.join("\n"));
console.log("\n**§10, PARADA · «No mueve la caja» en cada tarjeta:**\n");
console.log("| Ancho | Versión | Ficha | Botón | Por dentro | Renglones | Palabras cortadas |");
console.log("|---|---|---|---|---|---|---|");
console.log(cortes.join("\n"));
console.log("\n**La regla de ventana:** la ranura de decisión entera en la ventana, con la vista en la ficha del caso.\n");
console.log("| Partida | Paso | Arriba | Abajo | Alto | Ventana |");
console.log("|---|---|---|---|---|---|");
console.log(enVentana.join("\n"));
if (compartidos.size) console.log(`\nCompartido, no de esta pieza (se informa, no falla):\n${[...compartidos].join("\n")}`);
console.log(fallos.length ? `\n${fallos.length} NO CUMPLEN:\n${fallos.join("\n")}` : "\nTodo cumple a 320 y 375 en A y B: la ranura entera en la ventana en cada paso, «No mueve la caja» sin cortes, tramo menor ≥ 4 px, sin barra, nada se sale, nada bajo 12 px, toques ≥ 44, texto ≥ 4,5:1 y contorno ≥ 3:1.");
process.exit(fallos.length ? 1 : 0);
