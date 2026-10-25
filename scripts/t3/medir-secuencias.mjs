/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 · LAS SECUENCIAS DE APRENDER, MEDIDAS EN CHROMIUM (Célula E, Ippo).
 *
 * Paquete e3-t3-secuencias-aprender-v3.md, §5. Arranca su propio Vite sobre
 * scripts/t3/harness-secuencias y mide a 320×568 y 375×667:
 *
 *   C6       la marca de 10 px sobre la pista compacta, a 320: tamaño pintado,
 *            contraste contra el fondo, hueco de la marca vacía y si el
 *            cuadrado y el círculo se separan en los píxeles de la esquina.
 *            Lee los píxeles de la captura, no el CSS.
 *   ENCAJE   cada pantalla de las cuatro piezas, en cada estado que declara
 *            (`pantalla.medir`: sin responder, la pista de cada opción, dos
 *            errores, acierto, los pasos): que el modelo + la fila de control
 *            midan 150/200, el desborde de la zona del apoyo por encima de las
 *            3 líneas (66 px), letra ≥ 12, toque ≥ 44 en la fila de control,
 *            ninguna palabra partida en un botón, y que no haya barra
 *            horizontal. Cada estado se pone escribiendo lo guardado de la
 *            secuencia en sessionStorage antes de cargar: así se mide el
 *            estado real que pinta la página, no uno calculado.
 *   TARJETA  las cuatro citas en la tarjeta de cita (Itagaki, lote 12): el
 *            alto del texto con su relleno contra la reserva (150 / 200). ⛔ Si
 *            la de la p. 139 pasa de 150 a 320, se para y se avisa.
 *   CONTROL  la secuencia de T4 y el índice de Pensamiento Estratégico, para
 *            confirmar que el contenedor compartido no cambió.
 *
 *   node scripts/t3/medir-secuencias.mjs [--c6] [--capturas <carpeta>] [--json <archivo>]
 *
 * Las fuentes de Google no se alcanzan desde la caja de medida: si existe
 * FUENTES_NPM (una carpeta con @fontsource/sora e @fontsource/inter), la
 * sonda sirve Sora e Inter desde ahí. Sin ellas lo dice, porque mide con la
 * letra de respaldo y la cifra no vale.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const SOLO_C6 = process.argv.includes("--c6");
const CAPTURAS = arg("--capturas");
const JSON_SALIDA = arg("--json");
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const ANCHOS = [320, 375];
const ALTOS = { 320: 568, 375: 667 };
const FUENTES_NPM = process.env.FUENTES_NPM ?? null;

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t3/harness-secuencias/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

/* ═══════════ LAS FUENTES ═══════════ */
function cssFuentes() {
  if (!FUENTES_NPM) return null;
  const caras = [];
  for (const [familia, carpeta, pesos] of [["Sora", "sora", [300, 400, 600, 700, 800]], ["Inter", "inter", [400, 500, 600, 700]]]) {
    for (const p of pesos) {
      const f = join(FUENTES_NPM, "node_modules/@fontsource", carpeta, "files", `${carpeta}-latin-${p}-normal.woff2`);
      if (existsSync(f)) caras.push(`@font-face{font-family:"${familia}";font-weight:${p};font-style:normal;font-display:block;src:url("https://fonts.gstatic.com/local/${carpeta}-${p}.woff2") format("woff2");}`);
    }
  }
  return caras.join("\n");
}
const CSS_FUENTES = cssFuentes();

async function contexto(ancho, escala = 2) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: ALTOS[ancho] ?? 800 }, deviceScaleFactor: escala });
  if (CSS_FUENTES) {
    await ctx.route("https://fonts.googleapis.com/**", (r) => r.fulfill({ status: 200, contentType: "text/css", body: CSS_FUENTES }));
    await ctx.route("https://fonts.gstatic.com/local/**", (r) => {
      const [, carpeta, peso] = r.request().url().match(/local\/([a-z]+)-(\d+)\.woff2/);
      const f = join(FUENTES_NPM, "node_modules/@fontsource", carpeta, "files", `${carpeta}-latin-${peso}-normal.woff2`);
      return r.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(f) });
    });
  } else {
    await ctx.route("https://fonts.googleapis.com/**", (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  }
  return ctx;
}

async function abrir(ctx, hash, { guardado = null, buscar = "" } = {}) {
  const pg = await ctx.newPage();
  const errores = [];
  pg.on("pageerror", (e) => errores.push(String(e)));
  if (guardado) {
    await pg.addInitScript(([k, v]) => { try { sessionStorage.setItem(k, v); } catch { /* sin almacenamiento */ } }, guardado);
  }
  await pg.goto(`${BASE}${buscar}#${hash}`, { waitUntil: "networkidle" });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(450);
  return { pg, errores };
}

/* ═══════════ C6 ═══════════ */
const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

async function medirC6() {
  const filas = [];
  for (const escala of [1, 2]) {
    const ctx = await contexto(320, escala);
    const { pg, errores } = await abrir(ctx, "c6");
    const marcas = await pg.$$eval("[data-marca-compacta]", (els) => els.map((el) => {
      const r = el.getBoundingClientRect();
      return { tipo: el.dataset.marcaCompacta, actual: el.closest("[data-c6-pista]").dataset.c6Pista, x: r.x, y: r.y, w: r.width, h: r.height };
    }));
    const png = await pg.screenshot({ type: "png" });
    if (CAPTURAS && escala === 2) {
      const c6 = await pg.$("[data-c6]");
      await c6.screenshot({ path: join(CAPTURAS, "c6-pista-compacta-320-x2.png") });
    }
    /* Los píxeles de cada marca, leídos de la captura. */
    const px = await pg.evaluate(async ([b64, marcas, escala]) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const cv = document.createElement("canvas");
      cv.width = img.width; cv.height = img.height;
      const cx = cv.getContext("2d");
      cx.drawImage(img, 0, 0);
      const at = (x, y) => Array.from(cx.getImageData(Math.round(x * escala), Math.round(y * escala), 1, 1).data).slice(0, 3);
      return marcas.map((m) => {
        /* Cuadro pintado: los píxeles que no son fondo dentro de un margen de 3 px. */
        let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
        const fondo = at(m.x - 3, m.y - 3);
        const lejos = (c) => Math.abs(c[0] - fondo[0]) + Math.abs(c[1] - fondo[1]) + Math.abs(c[2] - fondo[2]) > 60;
        for (let yy = (m.y - 3) * escala; yy <= (m.y + m.h + 3) * escala; yy += 1) {
          for (let xx = (m.x - 3) * escala; xx <= (m.x + m.w + 3) * escala; xx += 1) {
            const c = Array.from(cx.getImageData(xx, yy, 1, 1).data).slice(0, 3);
            /* El carril (2 px, en la mitad) no cuenta como marca: se salta su franja fuera del cuadro. */
            const enCarril = yy >= (m.y + 4) * escala && yy < (m.y + 6) * escala && (xx < m.x * escala || xx >= (m.x + m.w) * escala);
            if (lejos(c) && !enCarril) { minX = Math.min(minX, xx); maxX = Math.max(maxX, xx); minY = Math.min(minY, yy); maxY = Math.max(maxY, yy); }
          }
        }
        return {
          pintadoAncho: (maxX - minX + 1) / escala,
          pintadoAlto: (maxY - minY + 1) / escala,
          fondo,
          centro: at(m.x + m.w / 2, m.y + m.h / 2 - 0.01),
          borde: at(m.x + 1, m.y + m.h / 2 + 2),
          esquina: at(m.x + 0.5, m.y + 0.5),
        };
      });
    }, [png.toString("base64"), marcas, escala]);
    marcas.forEach((m, k) => filas.push({ escala, ...m, ...px[k] }));
    if (errores.length) console.error("C6: errores en la página", errores);
    await ctx.close();
  }
  /* Juicio: lo que hace que dos marcas se distingan, medido. */
  const veredictos = filas.map((f) => {
    const color = f.tipo.endsWith("llena") ? f.centro : f.borde;
    const cFondo = contraste(color, f.fondo);
    const hueco = f.tipo.endsWith("vacia") ? contraste(f.centro, f.fondo) < 1.3 : contraste(f.centro, f.fondo) >= 3;
    const esquina = contraste(f.esquina, f.fondo);
    /*
     * La forma se compara con su pareja del mismo relleno y color: la esquina
     * del círculo tiene que pesar menos de la mitad que la del cuadrado (a 1×
     * el borde suavizado del círculo no deja la esquina en el fondo puro).
     */
    const pareja = filas.find((g) => g.escala === f.escala && g.actual === f.actual && g.tipo === f.tipo.replace(f.tipo.startsWith("cuadrado") ? "cuadrado" : "circulo", f.tipo.startsWith("cuadrado") ? "circulo" : "cuadrado"));
    const eCuadrado = f.tipo.startsWith("cuadrado") ? esquina : contraste(pareja.esquina, pareja.fondo);
    const eCirculo = f.tipo.startsWith("circulo") ? esquina : contraste(pareja.esquina, pareja.fondo);
    const forma = (eCirculo - 1) < 0.5 * (eCuadrado - 1);
    return { ...f, contrasteFondo: Number(cFondo.toFixed(2)), contrasteEsquina: Number(esquina.toFixed(2)), rellenoSeLee: hueco, formaSeLee: forma, tamañoOk: Math.abs(f.pintadoAncho - 10) <= 1 && Math.abs(f.pintadoAlto - 10) <= 1 };
  });
  const pasa = veredictos.every((v) => v.contrasteFondo >= 3 && v.rellenoSeLee && v.formaSeLee && v.tamañoOk);
  return { pasa, veredictos };
}

/* ═══════════ ENCAJE ═══════════ */
async function piezasDeSecuencia() {
  const mod = await servidor.ssrLoadModule("/src/components/mecanicas/libros/tema3/secuencia/index.js");
  return mod;
}

/* En la página: lo que mide una pantalla. */
function medirPantalla() {
  const raiz = document.querySelector("[data-secuencia-t3]");
  const fig = raiz?.querySelector(".t3s");
  if (!fig) return { falta: "sin figura" };
  const caja = (el) => (el ? el.getBoundingClientRect() : null);
  const modelo = caja(fig.querySelector("[data-modelo]"));
  const control = caja(fig.querySelector("[data-control]"));
  const zona = fig.querySelector("[data-zona]");
  const textos = [...zona.querySelectorAll("p")];
  const altoZona = textos.length ? textos[textos.length - 1].getBoundingClientRect().bottom - textos[0].getBoundingClientRect().top : 0;
  const lineasApoyo = textos.filter((p) => p.classList.contains("t3s-t")).reduce((s, p) => s + Math.round(p.getBoundingClientRect().height / 22), 0);
  /* Letra: todo texto propio visible del contenedor. */
  const chicas = [];
  for (const el of raiz.querySelectorAll("*")) {
    const propio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!propio) continue;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none") continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (el.closest(".t3s-sr") || (s.position === "absolute" && r.width <= 1)) continue;
    if (parseFloat(s.fontSize) < 11.95) chicas.push(`${el.textContent.trim().slice(0, 30)} (${s.fontSize})`);
  }
  /* Toque y palabras partidas en la fila de control y en los destinos del modelo. */
  const chicos = [];
  const partidas = [];
  for (const b of fig.querySelectorAll("button")) {
    const s = getComputedStyle(b);
    if (s.visibility === "hidden") continue;
    const r = b.getBoundingClientRect();
    if (r.width < 43.5 || r.height < 43.5) chicos.push(`${b.textContent.trim() || b.getAttribute("aria-label")} ${r.width.toFixed(1)}×${r.height.toFixed(1)}`);
    /* Una palabra partida: algún rango de una sola palabra ocupa dos renglones. */
    const t = [...b.childNodes].find((n) => n.nodeType === 3);
    if (t) {
      const rx = document.createRange();
      const re = /\S+/g; let m;
      while ((m = re.exec(t.textContent))) {
        rx.setStart(t, m.index); rx.setEnd(t, m.index + m[0].length);
        if (rx.getClientRects().length > 1) partidas.push(`${m[0]} en «${t.textContent}»`);
      }
    }
    if (b.scrollWidth > b.clientWidth + 1) partidas.push(`desborda: «${b.textContent.trim()}» (${b.scrollWidth} px de texto en ${b.clientWidth} px de botón)`);
  }
  const nav = document.querySelector("[data-navegacion]")?.getBoundingClientRect();
  return {
    modeloAlto: modelo?.height ?? null,
    figuraFija: control && modelo ? control.bottom - modelo.top : null,
    anchoFigura: modelo?.width ?? null,
    zonaAlto: Math.round(altoZona),
    lineasApoyo,
    desborde: Math.max(0, Math.round(altoZona) - 66),
    chicas,
    chicos,
    partidas,
    barra: document.documentElement.scrollWidth > innerWidth + 0.5,
    fondoPagina: Math.round(document.documentElement.scrollHeight),
    navTop: nav ? Math.round(nav.top) : null,
  };
}

/*
 * Las capturas que pide el paquete (§5), a media escala (CSS de una pantalla
 * a 2×): una por tipo de cada pieza, P3-7, P5-2 con la lista abierta y P5-4.
 */
const CAPTURAS_DE = {
  "t3-a1-vender-no-es-cobrar/apertura/paso-2": "p1-1-apertura",
  "t3-a1-vender-no-es-cobrar/aporte/sin-responder": "p1-2-haz-sin-responder",
  "t3-a1-vender-no-es-cobrar/aporte/pista-resultados": "p1-2-haz-pista",
  "t3-a1-vender-no-es-cobrar/aporte/acierto": "p1-2-haz-acierto",
  "t3-a1-vender-no-es-cobrar/nombres/todas": "p1-6-haz-nombres",
  "t3-a1-vender-no-es-cobrar/cierre/cierre": "p1-9-cierre",
  "t3-a3-lo-que-ya-paso/apertura/apertura": "p3-1-apertura",
  "t3-a3-lo-que-ya-paso/dias/acierto": "p3-2-haz-acierto",
  "t3-a3-lo-que-ya-paso/corte/acierto": "p3-4-haz-corte",
  "t3-a3-lo-que-ya-paso/ajuste-san-calixto/acierto": "p3-5-asiento-acierto",
  "t3-a3-lo-que-ya-paso/ajuste-san-miguel/casilla-activa": "p3-7-asiento-casilla-activa",
  "t3-a3-lo-que-ya-paso/ajuste-san-miguel/al-reves-pista": "p3-7-asiento-pista",
  "t3-a4-lo-que-ya-se-pago/asiento-junio/acierto": "p4-6-asiento-junio-con-pie",
  "t3-a4-lo-que-ya-se-pago/asiento-costa/centro-mas-largo": "p4-9-asiento-centro-mas-largo",
  "t3-a3-lo-que-ya-paso/cierre/cierre": "p3-8-cierre",
  "t3-a4-lo-que-ya-se-pago/apertura/apertura": "p4-1-apertura",
  "t3-a4-lo-que-ya-se-pago/predecir/sin-responder": "p4-2-haz-opc-predice",
  "t3-a4-lo-que-ya-se-pago/queda/sin-responder": "p4-7-haz-bloque-tapado",
  "t3-a4-lo-que-ya-se-pago/costa/acierto": "p4-8-haz-costa",
  "t3-a4-lo-que-ya-se-pago/cierre/parte-2": "p4-10-cierre-parte-2",
  "t3-a5-cerrar-el-periodo/apertura/paso-2-desde-ya": "p5-1-apertura-desde-ya",
  "t3-a5-cerrar-el-periodo/separar/lista-no-se-vacian": "p5-2-lista-abierta",
  "t3-a5-cerrar-el-periodo/separar/pista": "p5-2-pista",
  "t3-a5-cerrar-el-periodo/ingresos/acierto": "p5-4-ingresos-acierto",
  "t3-a5-cerrar-el-periodo/saldo/acierto": "p5-6-saldo",
  "t3-a5-cerrar-el-periodo/cierre/cierre": "p5-10-cierre",
};

async function medirEncaje() {
  const { PIEZAS_SECUENCIA_T3, TEMA_SECUENCIA_T3 } = await piezasDeSecuencia();
  const filas = [];
  const claves = [];
  for (const pz of PIEZAS_SECUENCIA_T3) for (const pt of pz.pantallas) claves.push(`${pz.id}/${pt.id}`);
  for (const ancho of ANCHOS) {
    const ctx = await contexto(ancho, 2);
    for (let p = 0; p < PIEZAS_SECUENCIA_T3.length; p += 1) {
      const pieza = PIEZAS_SECUENCIA_T3[p];
      for (let s = 0; s < pieza.pantallas.length; s += 1) {
        const pt = pieza.pantallas[s];
        for (const m of pt.medir ?? [{ nombre: "base", estado: pt.estadoInicial ?? null }]) {
          const estados = Object.fromEntries(claves.map((k) => [k, null]));
          for (const pz of PIEZAS_SECUENCIA_T3) for (const x of pz.pantallas) estados[`${pz.id}/${x.id}`] = x.estadoInicial ?? null;
          estados[`${pieza.id}/${pt.id}`] = m.estado ?? pt.estadoInicial ?? null;
          const guardado = { v: 1, p, s, pasos: m.paso ? { [`${pieza.id}/${pt.id}`]: m.paso } : {}, estados, resueltas: [] };
          const { pg, errores } = await abrir(ctx, "secuencia", { guardado: [`fae-secuencia:${TEMA_SECUENCIA_T3}`, JSON.stringify(guardado)], buscar: "?t3=secuencia" });
          const r = await pg.evaluate(medirPantalla);
          const titular = await pg.$eval("[data-secuencia-t3] h2", (h) => ({ texto: h.textContent, alto: h.getBoundingClientRect().height })).catch(() => null);
          filas.push({ ancho, pieza: pieza.id, n: s + 1, pantalla: pt.id, tipo: pt.tipo, estado: m.nombre, titularLineas: titular ? Math.round(titular.alto / 22) : null, errores, ...r });
          const captura = CAPTURAS_DE[`${pieza.id}/${pt.id}/${m.nombre}`];
          if (CAPTURAS && captura) await pg.screenshot({ path: join(CAPTURAS, `${captura}-${ancho}.png`), scale: "css", fullPage: true });
          await pg.close();
        }
      }
    }
    await ctx.close();
  }
  return filas;
}

/* ═══════════ LA TARJETA DE CITA ═══════════ */
async function medirTarjetas() {
  const out = [];
  for (const ancho of ANCHOS) {
    const ctx = await contexto(ancho, 2);
    const { pg, errores } = await abrir(ctx, "tarjetas");
    const filas = await pg.$$eval("[data-tarjeta]", (els) => els.map((el) => {
      const t = el.querySelector("[data-tarjeta-cita]");
      const p = el.querySelector("[data-cita-texto]");
      const s = getComputedStyle(t);
      const alto = p.getBoundingClientRect().height + parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
      return { id: el.dataset.tarjeta, reserva: t.getBoundingClientRect().height, ancho: t.getBoundingClientRect().width, util: p.getBoundingClientRect().width, lineas: Math.round(p.getBoundingClientRect().height / 20), alto: Math.round(alto), cabe: alto <= t.getBoundingClientRect().height + 0.5 };
    }));
    if (CAPTURAS) await pg.screenshot({ path: join(CAPTURAS, `tarjetas-de-cita-${ancho}.png`), scale: "css", fullPage: true });
    out.push(...filas.map((f) => ({ ancho, ...f, errores: errores.length })));
    await ctx.close();
  }
  return out;
}

/* ═══════════ CONTROL: T4 y Pensamiento Estratégico ═══════════ */
async function medirControl() {
  const out = [];
  for (const ancho of ANCHOS) {
    const ctx = await contexto(ancho, 2);
    for (const [hash, nombre] of [["t4", "T4 · secuencia (SecuenciaAprender)"], ["pe", "Pensamiento Estratégico · índice"], ["publicada", "T3 · Aprender publicado (CuatroCapas)"]]) {
      const { pg, errores } = await abrir(ctx, hash);
      const r = await pg.evaluate(() => ({
        barra: document.documentElement.scrollWidth > innerWidth + 0.5,
        secuencia: Boolean(document.querySelector("[data-secuencia]")),
        figura: document.querySelector(".fae-sec-figura")?.getBoundingClientRect().height ?? null,
        alto: document.documentElement.scrollHeight,
      }));
      if (CAPTURAS) await pg.screenshot({ path: join(CAPTURAS, `control-${hash}-${ancho}.png`), scale: "css" });
      out.push({ ancho, nombre, errores, ...r });
      await pg.close();
    }
    await ctx.close();
  }
  return out;
}

/* ═══════════ SALIDA ═══════════ */
if (!CSS_FUENTES) console.warn("⚠ Sin FUENTES_NPM: Sora e Inter no se cargan y la medida usa la letra de respaldo.");
const c6 = await medirC6();
console.log(`\n## C6 · marca de 10 px a 320: ${c6.pasa ? "SE DISTINGUE" : "NO SE DISTINGUE"}\n`);
console.log("| escala | pista | marca | pintada | contraste con el fondo | esquina | relleno se lee | forma se lee |");
console.log("|---|---|---|---|---|---|---|---|");
for (const v of c6.veredictos) console.log(`| ${v.escala}× | ${v.actual} | ${v.tipo} | ${v.pintadoAncho}×${v.pintadoAlto} | ${v.contrasteFondo}:1 | ${v.contrasteEsquina}:1 | ${v.rellenoSeLee ? "sí" : "NO"} | ${v.formaSeLee ? "sí" : "NO"} |`);

const tarjetas = await medirTarjetas();
console.log("\n## Tarjeta de cita\n");
console.log("| ancho | cita | ancho útil | líneas | alto con relleno | reserva | cabe |");
console.log("|---|---|---|---|---|---|---|");
for (const t of tarjetas) console.log(`| ${t.ancho} | ${t.id} | ${t.util.toFixed(0)} | ${t.lineas} | ${t.alto} | ${t.reserva} | ${t.cabe ? "sí" : "**NO**"} |`);

let encaje = null;
let control = null;
if (!SOLO_C6) {
  encaje = await medirEncaje();
  control = await medirControl();
  console.log("\n## Encaje\n");
  console.log("| ancho | pieza | n | pantalla | estado | figura fija | líneas apoyo | desborde | titular | letra<12 | toque<44 | palabra partida | barra | errores |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const f of encaje) {
    console.log(`| ${f.ancho} | ${f.pieza.replace(/^t3-a\d-/, "")} | ${f.n} | ${f.pantalla} | ${f.estado} | ${f.figuraFija ?? "—"} | ${f.lineasApoyo ?? "—"} | ${f.desborde ?? "—"} | ${f.titularLineas ?? "—"} | ${f.chicas?.length ?? "—"} | ${f.chicos?.length ? f.chicos.join("; ") : 0} | ${f.partidas?.length ? f.partidas.join("; ") : 0} | ${f.barra ? "SÍ" : "no"} | ${f.errores.length || f.falta || 0} |`);
  }
  console.log("\n## Control\n");
  for (const c of control) console.log(`- ${c.ancho} · ${c.nombre}: barra ${c.barra ? "SÍ" : "no"}, SecuenciaAprender ${c.secuencia ? "sí" : "no"}, figura ${c.figura ?? "—"} px, errores ${c.errores.length}`);
}
if (JSON_SALIDA) writeFileSync(JSON_SALIDA, JSON.stringify({ c6, tarjetas, encaje, control }, null, 2));

await navegador.close();
await servidor.close();
