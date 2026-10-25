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
 *   PREVIAS  (P2 y P6, #578) la cabecera real de la vista hasta el Panel y
 *            hasta la figura, y el ancho de las cifras más largas en Inter
 *            tabular, con la comprobación de que Inter está cargada.
 *
 *   P2-7, P6-7 y P6-9 (delta v3, #586): lo que ocupa de verdad lo que va en
 *            la figura (la rejilla de P2-7; la lista unida, con la marca en
 *            P6-9), contra la reserva de 150/200. ⛔ Si P6-9 pasa de 150, para.
 *
 *   node scripts/t3/medir-secuencias.mjs [--c6 | --previas] [--solo <expresión>] [--capturas <carpeta>] [--json <archivo>]
 *
 * --solo mide solo las pantallas cuyo «pieza/pantalla» casa con la expresión
 * (y se salta C6, las tarjetas, las previas y el control).
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
/* --solo <regex>: solo las pantallas cuyo «pieza/pantalla» casa (para repetir rápido una parte). */
const SOLO = arg("--solo") ? new RegExp(arg("--solo")) : null;

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
  /*
   * El alto de la zona se cuenta desde donde empieza su reserva (12 px bajo la
   * fila de control) hasta el fondo de lo último que tenga, sea <p> o no: así
   * cuenta la pastilla, que ahora va en la zona (condición 5 de #572), y no se
   * puede esconder nada subiéndolo con un margen negativo.
   */
  const hijos = [...zona.children];
  const altoZona = hijos.length && control ? hijos[hijos.length - 1].getBoundingClientRect().bottom - (control.bottom + 12) : 0;
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
    /* El contenido de un botón que pasa de su alto (un rótulo de dos renglones que se parte en tres) también es un corte. */
    const dentro = [...b.querySelectorAll("*")].map((x) => x.getBoundingClientRect()).filter((x) => x.width && x.height);
    if (dentro.some((x) => x.bottom > r.bottom + 0.5 || x.top < r.top - 0.5 || x.right > r.right + 0.5)) partidas.push(`se sale del botón: «${b.textContent.trim()}»`);
    for (const x of b.querySelectorAll("span")) {
      if ([...x.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && getComputedStyle(x).whiteSpace === "nowrap" && x.scrollWidth > b.clientWidth + 1) partidas.push(`renglón más ancho que el botón: «${x.textContent.trim()}»`);
    }
  }
  const nav = document.querySelector("[data-navegacion]")?.getBoundingClientRect();
  /* Lo que va en la figura entera (P6-7 y P6-9) o la rejilla del modelo (P2-7): de lo alto del modelo a su borde de abajo. */
  const ocupaEl = fig.querySelector("[data-figura-entera] > *, [data-rejilla-p2-7]");
  const ocupa = ocupaEl && modelo ? Math.round((ocupaEl.getBoundingClientRect().bottom - modelo.top) * 10) / 10 : null;
  const marcaEl = fig.querySelector("[data-marca-escenario]");
  const listaEl = fig.querySelector("[data-lista-unida]");
  const opcionesAlto = [...fig.querySelectorAll(".t3s2-op, [data-rejilla-p2-7] button")].map((b) => Math.round(b.getBoundingClientRect().height * 10) / 10);
  const filaLectura = fig.querySelector("[data-fila-lectura]");
  const lecturaVisible = Boolean(filaLectura?.querySelector("[data-lectura]")?.textContent.trim());
  const puente = fig.querySelector("[data-puente]");
  const lineaDatos = fig.querySelector("[data-linea-datos]");
  /*
   * P2 y P6 (#578): la pastilla no toca nada del modelo (condición 5 de #572),
   * la razón no se ve mientras se ve la pista (Itagaki, lote 15) y el ancho
   * natural de cada renglón rótulo · cifra contra el ancho del modelo.
   */
  const pastillaP2 = fig.querySelector("[data-pastilla], .t3s-pastilla");
  let pastillaTapa = null;
  if (pastillaP2) {
    const p = pastillaP2.getBoundingClientRect();
    pastillaTapa = 0;
    for (const el of fig.querySelectorAll("[data-modelo] *")) {
      if (el === pastillaP2 || pastillaP2.contains(el) || el.contains(pastillaP2)) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(el).visibility === "hidden") continue;
      if (r.left < p.right && r.right > p.left && r.top < p.bottom && r.bottom > p.top) pastillaTapa += 1;
    }
  }
  const razonEl = document.querySelector("[data-razon]");
  const conPista = Boolean(fig.querySelector('[data-texto="pista"]'));
  const razonVisible = Boolean(razonEl && razonEl.textContent.trim() && getComputedStyle(razonEl).visibility !== "hidden");
  const renglones = [...fig.querySelectorAll("[data-renglon], .t3s2-fila")].map((f) => {
    const hijos = [...f.children];
    const natural = hijos.reduce((s, h) => { const r = document.createRange(); r.selectNodeContents(h); return s + r.getBoundingClientRect().width; }, 0) + 8 * Math.max(0, hijos.length - 1);
    return { texto: f.textContent, natural: Math.round(natural), caja: Math.round(f.getBoundingClientRect().width) };
  });
  /*
   * Condición 5 de #572: la pastilla nunca se monta sobre el modelo. Se cruza
   * su caja con la de cada cosa pintada del modelo: cada palabra (por rango de
   * texto, no por el elemento entero) y cada elemento sin texto que tenga
   * borde o fondo (marcas, fichas, casillas, carriles).
   */
  const pastilla = fig.querySelector(".t3s-pastilla");
  const sobreModelo = [];
  if (pastilla) {
    const p = pastilla.getBoundingClientRect();
    const cruza = (r) => r.width > 0 && r.height > 0 && r.left < p.right - 0.5 && r.right > p.left + 0.5 && r.top < p.bottom - 0.5 && r.bottom > p.top + 0.5;
    const mod = fig.querySelector("[data-modelo]");
    const recorrer = document.createTreeWalker(mod, NodeFilter.SHOW_TEXT);
    for (let n = recorrer.nextNode(); n; n = recorrer.nextNode()) {
      if (pastilla.contains(n) || !n.textContent.trim()) continue;
      const s = getComputedStyle(n.parentElement);
      if (s.visibility === "hidden") continue;
      const rx = document.createRange();
      const re = /\S+/g; let m;
      while ((m = re.exec(n.textContent))) {
        rx.setStart(n, m.index); rx.setEnd(n, m.index + m[0].length);
        if ([...rx.getClientRects()].some(cruza)) sobreModelo.push(`«${m[0]}»`);
      }
    }
    for (const el of mod.querySelectorAll("*")) {
      if (pastilla.contains(el) || el === pastilla) continue;
      const s = getComputedStyle(el);
      if (s.visibility === "hidden" || s.display === "none") continue;
      const pinta = (s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== "transparent") || parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderLeftWidth) > 0
        || getComputedStyle(el, "::before").content !== "none";
      if (!pinta || el.children.length) continue;
      /* El carril se pinta con ::before en su mitad (2 px): se mide esa franja, no la caja de 12. */
      const r = el.getBoundingClientRect();
      const caja = el.matches("[data-carril]") ? { left: r.left, right: r.right, top: r.top + 5, bottom: r.top + 7, width: r.width, height: 2 } : r;
      if (cruza(caja)) sobreModelo.push(el.getAttribute("data-marca-compacta") ?? el.getAttribute("data-ficha-cuenta") ?? el.getAttribute("data-casilla") ?? (el.matches("[data-carril]") ? "carril" : el.tagName.toLowerCase()));
    }
  }
  /* Y cuando va en la fila de control (al acertar), que no pise ningún botón ni campo. */
  const sobreControl = [];
  if (pastilla) {
    const p = pastilla.getBoundingClientRect();
    for (const b of fig.querySelectorAll("[data-control] button, [data-control] input")) {
      if (getComputedStyle(b).visibility === "hidden") continue;
      const r = b.getBoundingClientRect();
      if (r.left < p.right - 0.5 && r.right > p.left + 0.5 && r.top < p.bottom - 0.5 && r.bottom > p.top + 0.5) sobreControl.push(b.textContent.trim() || b.getAttribute("aria-label"));
    }
  }
  /* Condición 1: lo que dicen los contadores de P1. Condición 4: el monto dado del asiento. */
  const cifras = [...fig.querySelectorAll("[data-modelo] [data-cifras]")].map((c) => c.textContent.trim());
  const monto = fig.querySelector("[data-monto-dado]");
  const montoVisible = monto ? (() => {
    const r = monto.getBoundingClientRect();
    const s = getComputedStyle(monto);
    const encima = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return s.visibility !== "hidden" && r.width > 0 && (encima === monto || monto.contains(encima)) ? monto.textContent : `tapado por ${encima?.className || encima?.tagName}`;
  })() : null;
  /* La cabecera: del borde de arriba de la página a la figura. */
  const figura = raiz.querySelector(".fae-sec-figura")?.getBoundingClientRect();
  return {
    ocupa,
    marca: marcaEl ? Math.round(marcaEl.getBoundingClientRect().height * 10) / 10 : null,
    lista: listaEl ? Math.round(listaEl.getBoundingClientRect().height * 10) / 10 : null,
    opcionesAlto,
    filaLectura: filaLectura ? { alto: Math.round(filaLectura.getBoundingClientRect().height * 10) / 10, lectura: lecturaVisible, texto: filaLectura.querySelector("[data-lectura]")?.textContent ?? "", puente: puente ? getComputedStyle(puente).visibility === "visible" : null, puenteTexto: puente?.textContent ?? "" } : null,
    lineaDatos: lineaDatos ? lineaDatos.textContent : null,
    pastillaTapa,
    razonConPista: conPista && razonVisible,
    renglonMax: renglones.reduce((m, r) => (r.natural > (m?.natural ?? 0) ? r : m), null),
    pastilla: pastilla ? pastilla.textContent : null,
    pastillaEn: pastilla ? (pastilla.closest("[data-control]") ? "control" : "zona") : null,
    sobreModelo,
    sobreControl,
    cifras,
    montoVisible,
    cabecera: figura ? Math.round(figura.top + scrollY) : null,
    navFija: document.querySelector("[data-navegacion]")?.style.position === "fixed",
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
  /* P2-7, P6-7 y P6-9 (#586, delta v3): sin responder, pista y acierto. */
  "t3-a2-el-mes-de-san-calixto/separan/sin-responder": "p2-7-separan-sin-responder",
  "t3-a2-el-mes-de-san-calixto/separan/pista": "p2-7-separan-pista",
  "t3-a2-el-mes-de-san-calixto/separan/acierto": "p2-7-separan-acierto",
  "t3-a6-lo-que-deja-el-periodo/por-pagar/sin-responder": "p6-7-por-pagar-sin-responder",
  "t3-a6-lo-que-deja-el-periodo/por-pagar/pista-caja": "p6-7-por-pagar-pista",
  "t3-a6-lo-que-deja-el-periodo/por-pagar/acierto": "p6-7-por-pagar-acierto",
  "t3-a6-lo-que-deja-el-periodo/acacias/sin-responder": "p6-9-acacias-sin-responder",
  "t3-a6-lo-que-deja-el-periodo/acacias/pista-utilidad": "p6-9-acacias-pista",
  "t3-a6-lo-que-deja-el-periodo/acacias/acierto": "p6-9-acacias-acierto",
  /* P2 y P6 (#578): una pantalla de cada tipo, más P2-2 con la razón y con la pista. */
  "t3-a2-el-mes-de-san-calixto/apertura/apertura": "p2-1-apertura",
  "t3-a2-el-mes-de-san-calixto/cobrados/sin-responder": "p2-2-haz-razon",
  "t3-a2-el-mes-de-san-calixto/cobrados/pista": "p2-2-haz-pista",
  "t3-a2-el-mes-de-san-calixto/haber/factura-jcc": "p2-3-miralo",
  "t3-a2-el-mes-de-san-calixto/asiento/sin-responder": "p2-4-asiento-monto",
  "t3-a2-el-mes-de-san-calixto/gastos/sin-responder": "p2-5-haz-botones",
  "t3-a2-el-mes-de-san-calixto/utilidad/acierto": "p2-6-haz-campo",
  "t3-a2-el-mes-de-san-calixto/cierre/paso-2": "p2-8-cierre",
  "t3-a6-lo-que-deja-el-periodo/apertura/paso-1-objetivo": "p6-1-apertura",
  "t3-a6-lo-que-deja-el-periodo/separar/pista": "p6-2-haz-ubicar",
  "t3-a6-lo-que-deja-el-periodo/antes/sin-responder": "p6-3-haz-pila",
  "t3-a6-lo-que-deja-el-periodo/impuesto/acierto": "p6-4-haz-pila-destapada",
  "t3-a6-lo-que-deja-el-periodo/estado/tramo-2": "p6-5-miralo",
  "t3-a6-lo-que-deja-el-periodo/reparte/paso-2": "p6-6-asiento-monto",
  "t3-a6-lo-que-deja-el-periodo/a-su-estado/acierto": "p6-8-haz-zonas",
  "t3-a6-lo-que-deja-el-periodo/cierre/paso-2": "p6-10-cierre",
};

/*
 * Las capturas del encendido (condiciones de #572), con --lote encendido:
 * solo lo que cambió. P4-6 con la cabecera real la toma medir-cabecera-real.mjs.
 */
const CAPTURAS_ENCENDIDO = {
  "t3-a1-vender-no-es-cobrar/aporte/sin-responder": "enc-p1-2-contadores-sin-responder",
  "t3-a1-vender-no-es-cobrar/aporte/acierto": "enc-p1-2-contadores-acierto",
  "t3-a1-vender-no-es-cobrar/maquina/acierto": "enc-p1-5-contadores-acierto",
  "t3-a1-vender-no-es-cobrar/cierre/cierre": "enc-p1-9-cierre-contadores",
  "t3-a1-vender-no-es-cobrar/nombres/pista": "enc-p1-6-pastilla-pista",
  "t3-a1-vender-no-es-cobrar/nombres/todas": "enc-p1-6-pastilla-acierto",
  "t3-a3-lo-que-ya-paso/dias/pista-1": "enc-p3-2-pastilla-pista",
  "t3-a3-lo-que-ya-paso/dias/acierto": "enc-p3-2-pastilla-acierto",
  "t3-a3-lo-que-ya-paso/ajuste-san-calixto/sin-responder": "enc-p3-5-asiento-monto-sin-responder",
  "t3-a3-lo-que-ya-paso/ajuste-san-calixto/acierto": "enc-p3-5-asiento-monto-acierto",
  "t3-a5-cerrar-el-periodo/separar/lista-se-vacian": "enc-p5-2-lista-se-vacian",
  "t3-a5-cerrar-el-periodo/separar/lista-no-se-vacian": "enc-p5-2-lista-no-se-vacian",
  "t3-a5-cerrar-el-periodo/acacias-ingresos/sin-responder": "enc-p5-7-acacias-ingresos-sin-responder",
  "t3-a5-cerrar-el-periodo/acacias-ingresos/acierto": "enc-p5-7-acacias-ingresos-acierto",
  "t3-a5-cerrar-el-periodo/acacias-gastos/acierto": "enc-p5-8-acacias-gastos-acierto",
  "t3-a5-cerrar-el-periodo/perdida/acierto": "enc-p5-9-acacias-perdida-acierto",
};
const LOTE = arg("--lote") === "encendido" ? CAPTURAS_ENCENDIDO : CAPTURAS_DE;

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
        if (SOLO && !SOLO.test(`${pieza.id}/${pt.id}`)) continue;
        for (const m of pt.medir ?? [{ nombre: "base", estado: pt.estadoInicial ?? null }]) {
          const estados = Object.fromEntries(claves.map((k) => [k, null]));
          for (const pz of PIEZAS_SECUENCIA_T3) for (const x of pz.pantallas) estados[`${pz.id}/${x.id}`] = x.estadoInicial ?? null;
          estados[`${pieza.id}/${pt.id}`] = m.estado ?? pt.estadoInicial ?? null;
          const guardado = { v: 1, p, s, pasos: m.paso ? { [`${pieza.id}/${pt.id}`]: m.paso } : {}, estados, resueltas: [] };
          const { pg, errores } = await abrir(ctx, "secuencia", { guardado: [`fae-secuencia:${TEMA_SECUENCIA_T3}`, JSON.stringify(guardado)], buscar: "?t3=secuencia" });
          const r = await pg.evaluate(medirPantalla);
          const titular = await pg.$eval("[data-secuencia-t3] h2", (h) => ({ texto: h.textContent, alto: h.getBoundingClientRect().height })).catch(() => null);
          filas.push({ ancho, pieza: pieza.id, n: s + 1, pantalla: pt.id, tipo: pt.tipo, estado: m.nombre, titularLineas: titular ? Math.round(titular.alto / 22) : null, errores, ...r });
          const captura = LOTE[`${pieza.id}/${pt.id}/${m.nombre}`];
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

/* ═══════════ PREVIAS DE P2 Y P6 (#578): la cabecera real y las cifras en Inter tabular ═══════════ */
async function medirPrevias() {
  const out = { cabecera: [], cifras: [] };
  for (const ancho of ANCHOS) {
    const ctx = await contexto(ancho, 2);
    /* La cabecera de la vista: del borde de arriba de la página al Panel de la secuencia, y hasta la figura. */
    const { pg } = await abrir(ctx, "secuencia", { buscar: "?t3=secuencia" });
    const c = await pg.evaluate(() => {
      const raiz = document.querySelector("[data-secuencia]");
      const panel = raiz?.closest("section");
      const fig = document.querySelector(".fae-sec-figura");
      const nav = document.querySelector("[data-navegacion]");
      const y = (el) => (el ? Math.round(el.getBoundingClientRect().top + scrollY) : null);
      const sora = [...document.fonts].some((x) => x.family === "Sora" && String(x.weight) === "700" && x.status === "loaded");
      return { panel: y(panel), raiz: y(raiz), figura: y(fig), navegacion: nav ? Math.round(nav.getBoundingClientRect().height) : null, sora };
    });
    out.cabecera.push({ ancho, ...c });
    await pg.close();
    const { pg: p2 } = await abrir(ctx, "cifras");
    /* Que la letra medida sea Inter de verdad, y no la de respaldo (desconfía del falso verde). */
    out.fuentes = await p2.evaluate(() => ["400 12px Inter", "600 12px Inter", "600 14px Inter"].map((f) => `${f}: ${document.fonts.check(f) && [...document.fonts].some((x) => f.includes(x.family) && String(x.weight) === f.split(" ")[0] && x.status === "loaded") ? "cargada" : "NO"}`));
    out.cifras.push(...(await p2.$$eval("[data-cifra]", (els) => els.map((el) => ({ texto: el.textContent, px: el.dataset.px, peso: el.dataset.peso, ancho: Number(el.getBoundingClientRect().width.toFixed(1)) })))).map((x) => ({ anchoVentana: ancho, ...x })));
    await p2.close();
    await ctx.close();
  }
  return out;
}

/* ═══════════ SALIDA ═══════════ */
if (!CSS_FUENTES) console.warn("⚠ Sin FUENTES_NPM: Sora e Inter no se cargan y la medida usa la letra de respaldo.");
const c6 = SOLO ? null : await medirC6();
if (c6) {
console.log(`\n## C6 · marca de 10 px a 320: ${c6.pasa ? "SE DISTINGUE" : "NO SE DISTINGUE"}\n`);
console.log("| escala | pista | marca | pintada | contraste con el fondo | esquina | relleno se lee | forma se lee |");
console.log("|---|---|---|---|---|---|---|---|");
for (const v of c6.veredictos) console.log(`| ${v.escala}× | ${v.actual} | ${v.tipo} | ${v.pintadoAncho}×${v.pintadoAlto} | ${v.contrasteFondo}:1 | ${v.contrasteEsquina}:1 | ${v.rellenoSeLee ? "sí" : "NO"} | ${v.formaSeLee ? "sí" : "NO"} |`);
}

const tarjetas = SOLO ? [] : await medirTarjetas();
if (!SOLO) console.log("\n## Tarjeta de cita\n");
console.log("| ancho | cita | ancho útil | líneas | alto con relleno | reserva | cabe |");
console.log("|---|---|---|---|---|---|---|");
for (const t of tarjetas) console.log(`| ${t.ancho} | ${t.id} | ${t.util.toFixed(0)} | ${t.lineas} | ${t.alto} | ${t.reserva} | ${t.cabe ? "sí" : "**NO**"} |`);

const previas = SOLO ? null : await medirPrevias();
if (previas) {
console.log("\n## Previas de P2 y P6\n");
console.log(`Fuentes: ${previas.fuentes.join(" · ")}\n`);
for (const c of previas.cabecera) console.log(`- ${c.ancho}: cabecera hasta el Panel ${c.panel} px · hasta la figura ${c.figura} px · bloque de navegación ${c.navegacion} px · Sora 700 ${c.sora ? "cargada" : "NO"}`);
console.log("\n| ventana | cifra | Inter tabular | ancho |\n|---|---|---|---|");
for (const x of previas.cifras.filter((y) => y.anchoVentana === 320)) console.log(`| 320 | ${x.texto} | ${x.px}/${x.peso} | ${x.ancho} |`);
}

let encaje = null;
let control = null;
if (!SOLO_C6 && !process.argv.includes("--previas")) {
  if (SOLO) console.log(`(solo ${SOLO})`);
  encaje = await medirEncaje();
  control = SOLO ? [] : await medirControl();
  console.log("\n## Encaje\n");
  console.log("| ancho | pieza | n | pantalla | estado | figura fija | líneas apoyo | desborde | titular | letra<12 | toque<44 | palabra partida | barra | errores |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const f of encaje) {
    console.log(`| ${f.ancho} | ${f.pieza.replace(/^t3-a\d-/, "")} | ${f.n} | ${f.pantalla} | ${f.estado} | ${f.figuraFija ?? "—"} | ${f.lineasApoyo ?? "—"} | ${f.desborde ?? "—"} | ${f.titularLineas ?? "—"} | ${f.chicas?.length ?? "—"} | ${f.chicos?.length ? f.chicos.join("; ") : 0} | ${f.partidas?.length ? f.partidas.join("; ") : 0} | ${f.barra ? "SÍ" : "no"} | ${f.errores.length || f.falta || 0} |`);
  }
  /* P2 y P6: la pastilla, la razón con la pista y los renglones. */
  const nuevas = encaje.filter((f) => /^t3-a[26]-/.test(f.pieza));
  console.log("\n## P2 y P6: pastilla, razón y renglones\n");
  console.log("| ancho | pieza | n | estado | pastilla tapa | razón con pista | renglón más ancho (natural / caja) |");
  console.log("|---|---|---|---|---|---|---|");
  for (const f of nuevas) console.log(`| ${f.ancho} | ${f.pieza.replace(/^t3-a\d-/, "")} | ${f.n} | ${f.estado} | ${f.pastillaTapa ?? "—"} | ${f.razonConPista ? "**SÍ**" : "no"} | ${f.renglonMax ? `${f.renglonMax.natural} / ${f.renglonMax.caja} «${f.renglonMax.texto}»` : "—"} |`);
  /* P2-7, P6-7 y P6-9 (#586): lo que ocupa la figura, contra la reserva. */
  const delta = encaje.filter((f) => /a2-.*\/separan$|a6-.*\/(por-pagar|acacias)$/.test(`${f.pieza}/${f.pantalla}`));
  if (delta.length) {
    console.log("\n## P2-7, P6-7 y P6-9: lo que ocupa la figura\n");
    console.log("| ancho | pantalla | estado | ocupa / reserva | marca | lista | opciones | fila de control (alto · lectura · puente) | línea de datos | apoyo: líneas · desborde |");
    console.log("|---|---|---|---|---|---|---|---|---|---|");
    for (const f of delta) {
      const fl = f.filaLectura;
      console.log(`| ${f.ancho} | ${f.n} ${f.pantalla} | ${f.estado} | ${f.ocupa ?? "—"} / ${f.figuraFija ?? "—"}${f.ocupa > f.figuraFija ? " **SE PASA**" : ""} | ${f.marca ?? "—"} | ${f.lista ?? "—"} | ${f.opcionesAlto?.join(" · ") || "—"} | ${fl ? `${fl.alto} · ${fl.lectura ? `«${fl.texto}»` : "NO"} · ${fl.puente ? `«${fl.puenteTexto}»` : "vacío"}` : "—"} | ${f.lineaDatos ? `«${f.lineaDatos}»` : "—"} | ${f.lineasApoyo} · ${f.desborde} |`);
    }
  }
  console.log("\n## Pastilla sobre el modelo (condición 5)\n");
  const tapan = encaje.filter((f) => f.sobreModelo?.length);
  console.log(tapan.length ? tapan.map((f) => `- ${f.ancho} · ${f.pieza} · ${f.pantalla} · ${f.estado}: «${f.pastilla}» sobre ${f.sobreModelo.join(", ")}`).join("\n") : `Ninguna: en ${encaje.filter((f) => f.pastilla).length} estados con pastilla, 0 cruces con el modelo.`);
  const pisan = encaje.filter((f) => f.sobreControl?.length);
  console.log(`En la fila de control: ${encaje.filter((f) => f.pastillaEn === "control").length} estados; en la zona: ${encaje.filter((f) => f.pastillaEn === "zona").length}. Sobre un botón o campo: ${pisan.length ? pisan.map((f) => `${f.ancho} ${f.pantalla} ${f.estado} (${f.sobreControl.join(", ")})`).join("; ") : "ninguno"}.`);
  console.log("\n## Contadores de P1 (condición 1)\n");
  for (const f of encaje.filter((x) => x.cifras?.length)) console.log(`- ${f.ancho} · ${f.n} ${f.pantalla} · ${f.estado}: ${f.cifras.join(" | ")}`);
  console.log("\n## Monto del asiento (condición 4)\n");
  for (const f of encaje.filter((x) => x.montoVisible !== null && x.montoVisible !== undefined)) console.log(`- ${f.ancho} · ${f.pantalla} · ${f.estado}: ${f.montoVisible}`);
  console.log("\n## Cabecera (del borde de la página a la figura)\n");
  for (const a of ANCHOS) { const c = [...new Set(encaje.filter((f) => f.ancho === a && f.cabecera).map((f) => f.cabecera))]; console.log(`- ${a}: ${c.join(", ")} px`); }
  console.log("\n## Control\n");
  for (const c of control) console.log(`- ${c.ancho} · ${c.nombre}: barra ${c.barra ? "SÍ" : "no"}, SecuenciaAprender ${c.secuencia ? "sí" : "no"}, figura ${c.figura ?? "—"} px, errores ${c.errores.length}`);
}
if (JSON_SALIDA) writeFileSync(JSON_SALIDA, JSON.stringify({ c6, tarjetas, previas, encaje, control }, null, 2));

await navegador.close();
await servidor.close();
