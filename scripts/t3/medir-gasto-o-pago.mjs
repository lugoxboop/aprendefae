/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «¿GASTO O PAGO?» (t3-gasto-o-pago) · LO QUE IPPO MIDE ANTES DE DAR POR BUENO
 * (paquete e3-t3-gasto-o-pago-v3, §9), EN CHROMIUM, A 320×568 Y 375×667.
 *
 * Monta la vista del Tema 3 tal cual (scripts/t3/harness-t3, #hacer:t3-gasto-o-pago),
 * salta «Así se juega» y, en las dos versiones (A y B, fijadas por el número
 * de intentos guardado), juega una partida entera: el primer hecho se toca
 * MAL (en la casilla que da dos errores y dos barras punteadas) y los demás
 * bien. En cada estado mide:
 *
 *   · ALTOS      el encabezado de Hacer (de la parte de arriba del Panel al
 *                pie de «Hecho n de 6»), la ficha y la matriz. El encabezado
 *                es compartido y mide 167: Kamogawa decidió en #506 que puede
 *                quedar fuera de la vista, así que solo se informa.
 *   · VENTANA    la regla que manda desde entonces: en cada hecho (también
 *                el 1 tras «Así se juega»), con la vista subida a la ficha,
 *                ficha + matriz + contadores caben juntos en la ventana.
 *   · ANCHOS     contenedor útil, matriz por dentro, casillas y contadores.
 *   · BARRA      que la página no tenga barra horizontal.
 *   · SALE       que ningún texto propio se salga de su caja.
 *   · LETRA      que ningún texto visible del juego baje de 12 px.
 *   · TOQUE      que cada control mida 44 × 44 o más.
 *   · CONTRASTE  cada texto contra su fondo real (compuesto hasta un fondo
 *                opaco), ≥ 4,5:1, y los contornos de las casillas en reposo
 *                ≥ 3:1, con la fórmula de scripts/contraste.mjs (WCAG 2.x).
 *   · BARRA MÍN  lo que mide en px el aporte del monto menor (E11: ≥ 4 px).
 *
 *   node scripts/t3/medir-gasto-o-pago.mjs [carpeta-de-capturas]
 *
 * Con carpeta, guarda las capturas a media escala (deviceScaleFactor 1) de
 * los estados vacío, bien, mal (con la barra punteada) y resumen, de la
 * pieza entera, en las dos versiones y los dos anchos. Sale con 1 si algo no
 * cumple. Arranca su propio Vite y lo cierra.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BANCO_A, BANCO_B, TIPOS, tipoDe } from "../../src/data/contabilidadTema3GastoOPago.js";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const FUENTES = "/tmp/claude-0/fuentes/";
const ANCHOS = [320, 375];
const ALTOS = { 320: 568, 375: 667 };
const POR_ID = Object.fromEntries([...BANCO_A, ...BANCO_B].map((h) => [h.id, h]));

/* La casilla que da DOS errores (gasto y plata a la vez): la opuesta en las dos preguntas. */
const opuesta = (tipo) => tipoDe(!TIPOS[tipo].gasto, !TIPOS[tipo].salida);

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const URL_BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t3/harness-t3/index.html#hacer:t3-gasto-o-pago`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const fallos = [];
const compartidos = new Set();
const filas = [];
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
  const panel = document.querySelector("[data-gasto-o-pago]").closest("section");
  const caja = (sel) => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect() : null; };
  const p = panel.getBoundingClientRect();
  const r = { barra: document.documentElement.scrollWidth > window.innerWidth + 1, sale: [], letra: [], toque: [], contraste: [] };
  const prog = caja("[data-progreso]");
  const ficha = caja("[data-ficha]");
  const matriz = caja("[data-matriz]");
  const juego = caja("[data-gasto-o-pago]");
  r.encabezado = prog ? prog.bottom - p.top : null;
  r.ficha = ficha ? ficha.height : null;
  r.matrizAlto = matriz.height;
  r.matrizFin = matriz.bottom - p.top;
  r.matrizArranque = matriz.top - p.top;
  r.util = juego.width;
  const m = document.querySelector("[data-matriz]");
  const sm = getComputedStyle(m);
  r.matrizDentro = matriz.width - parseFloat(sm.paddingLeft) - parseFloat(sm.paddingRight) - parseFloat(sm.borderLeftWidth) - parseFloat(sm.borderRightWidth);
  r.casillas = [...document.querySelectorAll("[data-casilla]")].map((b) => { const c = b.getBoundingClientRect(); return [Math.round(c.width * 10) / 10, Math.round(c.height * 10) / 10]; });
  r.contadores = [...document.querySelectorAll("[data-contador]")].map((b) => Math.round(b.getBoundingClientRect().width * 10) / 10);

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
  for (const el of document.querySelector("[data-gasto-o-pago]").querySelectorAll("*")) {
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
    if (k < 4.5) r.contraste.push(`${k.toFixed(2)}:1 ${nombre(el)}`);
  }
  r.contrasteMinTexto = Math.round(minimo * 100) / 100;
  /* La pastilla de cada casilla, dentro de la casilla sin su contorno (el SALE de arriba no la ve: su texto cabe en su span). */
  for (const v of document.querySelectorAll("[data-casilla] [data-veredicto]")) {
    const b = v.closest("[data-casilla]");
    const cb = b.getBoundingClientRect();
    const borde = parseFloat(getComputedStyle(b).borderLeftWidth);
    const q = v.getBoundingClientRect();
    const exceso = Math.max(cb.left + borde - q.left, q.right - (cb.right - borde));
    r.pastillas = [...(r.pastillas ?? []), Math.round((cb.width - 2 * borde - q.width) * 10) / 10];
    if (exceso > 0.01) r.sale.push(`pastilla «${v.textContent}» ${exceso.toFixed(1)} px fuera de su casilla`);
  }
  /* El contorno en reposo de una casilla contra el fondo de la matriz (no es texto: 3:1). */
  const reposo = [...document.querySelectorAll('[data-casilla][data-estado="reposo"]')][0];
  if (reposo) {
    const borde = rgba(getComputedStyle(reposo).borderTopColor);
    const fondo = fondoDe(reposo.parentElement);
    r.contrasteContorno = Math.round(contraste(sobre(borde, fondo), fondo) * 100) / 100;
  }
  for (const b of document.querySelectorAll("[data-gasto-o-pago] button")) {
    const c = b.getBoundingClientRect();
    /* El botón «¿Cómo se juega?» dibuja 40 y escucha 44 con su ::after (global.css, medido por la Célula D). */
    const extra = b.hasAttribute("data-como-se-juega") ? 4 : 0;
    if (c.width + extra < 44 || c.height + extra < 44) r.toque.push(`${c.width.toFixed(0)}×${c.height.toFixed(0)} ${nombre(b)}`);
  }
  /* E11: los px de la barra que mueve el monto menor. */
  const pista = document.querySelector("[data-contador] [data-barra]")?.parentElement.getBoundingClientRect().width ?? 0;
  r.pista = pista;
  return r;
}

/*
 * La regla de Kamogawa (#506, 24-oct) que reemplaza el presupuesto de 512:
 * en cada hecho, la ficha, la matriz y los contadores caben JUNTOS en la
 * ventana (sin barra del navegador), con la vista subida a la ficha.
 */
function ventana() {
  const f = document.querySelector("[data-ficha]").getBoundingClientRect();
  const m = document.querySelector("[data-matriz]").getBoundingClientRect();
  return { arriba: f.top, abajo: m.bottom, bloque: m.bottom - f.top, alto: innerHeight };
}
const enVentana = [];
const revisarVentana = (etq, v) => {
  enVentana.push(`| ${etq} | ${v.arriba.toFixed(1)} | ${v.abajo.toFixed(1)} | ${v.bloque.toFixed(1)} | ${v.alto} |`);
  if (v.arriba < -0.5 || v.abajo > v.alto + 0.5) fallos.push(`${etq}: ficha + matriz NO caben en la ventana (de ${v.arriba.toFixed(1)} a ${v.abajo.toFixed(1)}, ventana ${v.alto})`);
};

async function partida(ancho, version) {
  const ctx = await contexto(ancho);
  const pagina = await ctx.newPage();
  /* Versión: A con 0 intentos guardados, B con 1. «Así se juega» ya visto. */
  await pagina.addInitScript((v) => {
    localStorage.setItem("fae:r5:intentos:t3-gasto-o-pago", v === "B" ? "1" : "0");
    localStorage.setItem("fae-asi-se-juega:v1:t3-gasto-o-pago:anonimo", "visto");
  }, version);
  await pagina.emulateMedia({ reducedMotion: "no-preference" });
  await pagina.goto(URL_BASE);
  await pagina.waitForSelector("[data-gasto-o-pago]");
  await pagina.evaluate(() => document.fonts.ready);
  const etq = `${ancho} · ${version}`;
  const nota = (estado, r) => {
    const linea = `| ${ancho} | ${version} | ${estado} | ${r.encabezado?.toFixed(1) ?? "—"} | ${r.ficha?.toFixed(1) ?? "—"} | ${r.matrizArranque.toFixed(1)} | ${r.matrizAlto.toFixed(1)} | ${r.matrizFin.toFixed(1)} | ${r.util.toFixed(0)} / ${r.matrizDentro.toFixed(0)} | ${r.casillas[0].join(" × ")} | ${r.contadores.join(" · ")} | ${r.contrasteMinTexto} | ${r.contrasteContorno ?? "—"} |`;
    filas.push(linea + (r.pastillas ? ` holgura de la pastilla: ${r.pastillas.join(" · ")} px |` : ""));
    if (r.barra) fallos.push(`${etq} · ${estado}: barra horizontal`);
    for (const x of r.sale) fallos.push(`${etq} · ${estado}: SALE ${x}`);
    for (const x of r.letra) fallos.push(`${etq} · ${estado}: LETRA ${x}`);
    for (const x of r.compartido ?? []) compartidos.add(`LETRA ${x} (compartido)`);
    for (const x of r.toque) fallos.push(`${etq} · ${estado}: TOQUE ${x}`);
    for (const x of r.contraste) fallos.push(`${etq} · ${estado}: CONTRASTE ${x}`);
    if (r.contrasteContorno !== undefined && r.contrasteContorno < 3) fallos.push(`${etq} · ${estado}: contorno en reposo ${r.contrasteContorno}:1`);
    /* El encabezado (167 px, compartido) ya no cuenta para el presupuesto: decidió Kamogawa en #506 que puede quedar fuera de la vista. Se informa en la tabla. */
    return r;
  };
  const captura = async (estado) => {
    if (!CAPTURAS) return;
    const panel = pagina.locator("[data-gasto-o-pago]").locator("xpath=ancestor::section[1]");
    await panel.screenshot({ path: `${CAPTURAS}/gasto-o-pago-${version}-${ancho}-${estado}.png`, animations: "disabled" });
  };

  nota("vacío", await pagina.evaluate(medir));
  await captura("vacio");
  let pista = 0;
  let menor = Infinity;
  for (let k = 0; k < 6; k++) {
    await pagina.waitForTimeout(700);
    revisarVentana(`${etq} · hecho ${k + 1}`, await pagina.evaluate(ventana));
    const id = await pagina.getAttribute("[data-ficha]", "data-ficha");
    const h = POR_ID[id];
    menor = Math.min(menor, h.monto);
    if (k === 0) {
      await pagina.click(`[data-casilla="${opuesta(h.tipo)}"]`);
      await pagina.waitForTimeout(1500);
      const r = nota(`mal (${h.tipo} tocado en ${opuesta(h.tipo)})`, await pagina.evaluate(medir));
      pista = r.pista;
      const punteadas = await pagina.locator("[data-punteada]").count();
      if (punteadas < 1) fallos.push(`${etq}: el error no dejó barra punteada`);
      await captura("mal");
    } else {
      await pagina.click(`[data-casilla="${h.tipo}"]`);
      await pagina.waitForTimeout(800);
      if (k === 1) { nota(`bien (${h.tipo})`, await pagina.evaluate(medir)); await captura("bien"); }
    }
    await pagina.click("[data-siguiente]");
    await pagina.waitForTimeout(150);
  }
  await pagina.waitForSelector('[data-estado-partida="resumen"]');
  await pagina.waitForTimeout(600);
  nota("resumen", await pagina.evaluate(medir));
  await captura("resumen");
  const escala = (version === "A" ? BANCO_A : BANCO_B).reduce((s, x) => s + x.monto, 0);
  const menorBanco = Math.min(...(version === "A" ? BANCO_A : BANCO_B).map((x) => x.monto));
  const px = (menorBanco / escala) * pista;
  filas.push(`|  |  | E11 · barra del monto menor (${menorBanco.toLocaleString("es-CO")}) sobre una pista de ${pista.toFixed(1)} px: **${px.toFixed(1)} px** |`);
  if (px < 4) fallos.push(`${etq}: el monto menor mueve ${px.toFixed(1)} px (< 4, E11)`);
  await ctx.close();
}

/* Movimiento reducido: el error se ve completo al instante. */
async function reducido(ancho) {
  const ctx = await contexto(ancho);
  const pagina = await ctx.newPage();
  await pagina.addInitScript(() => localStorage.setItem("fae-asi-se-juega:v1:t3-gasto-o-pago:anonimo", "visto"));
  await pagina.emulateMedia({ reducedMotion: "reduce" });
  await pagina.goto(URL_BASE);
  await pagina.waitForSelector("[data-gasto-o-pago]");
  const h = POR_ID[await pagina.getAttribute("[data-ficha]", "data-ficha")];
  await pagina.click(`[data-casilla="${opuesta(h.tipo)}"]`);
  await pagina.waitForTimeout(50);
  const estado = await pagina.getAttribute("[data-gasto-o-pago]", "data-estado-partida");
  const revelada = await pagina.locator('[data-casilla][data-estado="revelada"]').count();
  const punteada = await pagina.locator("[data-punteada]").count();
  filas.push(`|  |  | movimiento reducido a ${ancho}, a los 50 ms del toque: ${estado}, «Iba aquí» ${revelada}, punteadas ${punteada} |`);
  if (estado !== "mal-corregida" || revelada !== 1 || punteada < 1) fallos.push(`${ancho}: con movimiento reducido el error no se ve completo al instante`);
  await ctx.close();
}

/* El hecho 1 después de «Así se juega»: «Siguiente» muestra la partida y la vista sube a la ficha. */
async function trasElTutorial(ancho) {
  const ctx = await contexto(ancho);
  const pagina = await ctx.newPage();
  await pagina.emulateMedia({ reducedMotion: "no-preference" });
  await pagina.goto(URL_BASE);
  await pagina.waitForSelector("[data-asi-se-juega]");
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.locator("[data-asi-se-juega] button", { hasText: /^Siguiente$/ }).first().click();
  await pagina.waitForTimeout(900);
  revisarVentana(`${ancho} · hecho 1 tras «Así se juega»`, await pagina.evaluate(ventana));
  await ctx.close();
}

for (const ancho of ANCHOS) {
  await trasElTutorial(ancho);
  for (const version of ["A", "B"]) await partida(ancho, version);
  await reducido(ancho);
}
await navegador.close();
await servidor.close();

console.log(`fuentes: ${fuentesReales ? "Inter y Sora de @fontsource 5.3.0" : "LAS DEL SISTEMA (no hay /tmp/claude-0/fuentes): las medidas de texto no valen"}`);
console.log("| Ancho | Versión | Estado | Encabezado | Ficha | Matriz empieza | Matriz alto | Matriz termina | Útil / matriz por dentro | Casilla | Contadores | Contraste mín. texto | Contorno reposo |");
console.log("|---|---|---|---|---|---|---|---|---|---|---|---|---|");
console.log(filas.join("\n"));
console.log("\n**En la ventana (regla de Kamogawa, #506):** ficha + matriz + contadores con la vista subida a la ficha.\n");
console.log("| Dónde | Arriba de la ficha | Abajo de la matriz | Bloque | Ventana |");
console.log("|---|---|---|---|---|");
console.log(enVentana.join("\n"));
if (compartidos.size) console.log(`\nCompartido, no de esta pieza (se informa, no falla):\n${[...compartidos].join("\n")}`);
console.log(fallos.length ? `\n${fallos.length} NO CUMPLEN:\n${fallos.join("\n")}` : "\nTodo cumple a 320 y 375 en A y B: sin barra, nada se sale, nada bajo 12 px, toques ≥ 44, texto ≥ 4,5:1, contorno ≥ 3:1, y ficha + matriz + contadores dentro de la ventana en cada hecho.");
process.exit(fallos.length ? 1 : 0);
