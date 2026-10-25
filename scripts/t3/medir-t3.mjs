/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T3 «INGRESOS, GASTOS Y CAJA» · LA LÍNEA BASE, MEDIDA EN CHROMIUM (Célula E,
 * issue #469).
 *
 * Recorre las 4 piezas de Aprender y los 7 juegos de Hacer de T3 a 320×568 y
 * 375×667, montados con la vista del tema tal cual (scripts/t3/harness-t3).
 * En cada estado alcanzado mide:
 *
 *   · BARRA   que la página no tenga barra horizontal;
 *   · SALE    que ningún texto se salga de su caja (el rectángulo de su texto
 *             propio, por fuera del de su elemento o de la ventana);
 *   · LETRA   que ningún texto propio visible baje de 12 px (las «cejillas»,
 *             rótulos cortos en mayúsculas, se cuentan y se marcan aparte,
 *             como en scripts/piso-de-12.mjs);
 *   · TOQUE   que cada control reciba el toque en los cuatro puntos medios
 *             del cuadro de 44 px centrado sobre él (el método de
 *             scripts/blanco-de-toque.mjs: mide la zona que escucha, no el
 *             dibujo). Lo que está dentro de un <figure> es ilustración y no
 *             cuenta, y se dice cuántos se saltaron.
 *
 * LOS ESTADOS. Las piezas de T3 tienen mecánicas distintas (fichas, pestañas,
 * reglas, cajones, asientos), así que la sonda no las juega «bien»: las
 * EXPLORA. En cada paso toca un control que todavía no tocó (por su nombre y
 * sus data-*), espera 0,9 s y, si la pantalla cambió, la mide. Hace dos
 * pasadas por pieza y ancho —una toma el primer control nuevo, otra el
 * último—, para que salgan fallos y aciertos. Un campo de número vacío se
 * llena con 1000. No toca «Volver», «Jugar otra vez» ni «Reiniciar».
 * Lo que la exploración no alcanza no se mide, y la tabla dice cuántos
 * estados midió cada pieza: un cero no es un «pasa».
 *
 *   node scripts/t3/medir-t3.mjs [carpeta-de-capturas]
 *   SOLO_A3=1 node scripts/t3/medir-t3.mjs     (solo el alto de las casillas y
 *                                             de la hoja de la act. 3, a 320)
 *
 * Imprime la tabla de la línea base en Markdown y el detalle de cada
 * hallazgo. Sale con 1 si algo no cumple (es la línea base: hoy puede salir
 * con 1 y eso es información, no un error de la sonda). Arranca su propio
 * Vite y lo cierra.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ACT1_T3 } from "../../src/data/contabilidadTema3Act1.js";
import { ACT2_T3 } from "../../src/data/contabilidadTema3Act2.js";
import { ACT3_T3 } from "../../src/data/contabilidadTema3Act3.js";
import { ACT4_T3 } from "../../src/data/contabilidadTema3Act4.js";
import { ACT5_T3 } from "../../src/data/contabilidadTema3Act5.js";
import { ACT6_T3 } from "../../src/data/contabilidadTema3Act6.js";
import { ACT7_T3 } from "../../src/data/contabilidadTema3Act7.js";
import { ACT_GASTO_O_PAGO } from "../../src/data/contabilidadTema3GastoOPago.js";
import { ACT_RESULTADO_CAJA } from "../../src/data/contabilidadTema3ResultadoCaja.js";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });
const FUENTES = "/tmp/claude-0/fuentes/";
const ANCHOS = [320, 375];
const ALTOS = { 320: 568, 375: 667 };
const PISO = 11.95; /* 11,95 y no 12: un 12 px calculado puede llegar como 11,999 */
const TOQUE = 44;
const PASOS = Number(process.env.PASOS ?? 40);
const ESPERA = 900;

/* Las 4 piezas de Aprender (por su posición en la vista) y los 7 juegos de Hacer. */
const PIEZAS = [
  ...[0, 1, 2, 3].map((k) => ({ id: `aprender-${k + 1}`, nombre: `Aprender · pieza ${k + 1}`, hash: "aprender", k })),
  ...[ACT1_T3, ACT_GASTO_O_PAGO, ACT2_T3, ACT3_T3, ACT4_T3, ACT5_T3, ACT6_T3, ACT_RESULTADO_CAJA, ACT7_T3].map((a) => ({ id: a.id, nombre: `Hacer · ${a.nombre}`, hash: `hacer:${a.id}` })),
];

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const BASE = `http://127.0.0.1:${servidor.httpServer.address().port}/scripts/t3/harness-t3/index.html`;
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

async function contexto(ancho) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: ALTOS[ancho] }, deviceScaleFactor: 2 });
  if (existsSync(`${FUENTES}fuentes.css`)) {
    const css = readFileSync(`${FUENTES}fuentes.css`, "utf8");
    await ctx.route("https://fonts.googleapis.com/**", (r) => r.fulfill({ status: 200, contentType: "text/css", body: css }));
    await ctx.route("https://fonts.gstatic.com/**", (r) => {
      const f = r.request().url().replace("https://fonts.gstatic.com/", "").replace(/\//g, "_");
      try { return r.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(FUENTES + f) }); } catch { return r.abort(); }
    });
  }
  return ctx;
}

/*
 * En la página: el ámbito de la pieza. En Aprender, el bloque de la pieza k
 * (el padre del rótulo «PIEZA k DE N»); en Hacer, toda la vista.
 */
function ambito(k) {
  if (k === null || k === undefined) return document.getElementById("root");
  const rotulos = [...document.querySelectorAll("p")].filter((p) => /^PIEZA \d+ DE \d+$/.test(p.textContent.trim()));
  return rotulos[k]?.parentElement ?? null;
}

/* En la página: los controles del ámbito que se pueden tocar ahora, con una clave estable. */
function controles([k, fuente]) {
  const raiz = (0, eval)(`(${fuente})`)(k);
  if (!raiz) return [];
  const NO = /volver|otra vez|reiniciar|reintentar/i;
  return [...raiz.querySelectorAll('button:not([disabled]), [role="button"]:not([aria-disabled="true"]), input:not([disabled]), select:not([disabled])')]
    .filter((el) => {
      const c = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return c.width > 0 && c.height > 0 && s.visibility !== "hidden" && s.pointerEvents !== "none" && !NO.test(el.getAttribute("aria-label") || el.textContent || "");
    })
    .map((el, i) => {
      const datos = [...el.attributes].filter((a) => a.name.startsWith("data-") || a.name === "aria-label").map((a) => `${a.name}=${a.value}`).join(" ");
      return { i, clave: `${el.tagName}|${(el.textContent || "").trim().slice(0, 40)}|${datos}|${el.type || ""}` };
    });
}

/* En la página: toca el control i de la lista (o llena el campo). */
function tocar([k, fuente, i]) {
  const raiz = (0, eval)(`(${fuente})`)(k);
  const NO = /volver|otra vez|reiniciar|reintentar/i;
  const lista = [...raiz.querySelectorAll('button:not([disabled]), [role="button"]:not([aria-disabled="true"]), input:not([disabled]), select:not([disabled])')]
    .filter((el) => {
      const c = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return c.width > 0 && c.height > 0 && s.visibility !== "hidden" && s.pointerEvents !== "none" && !NO.test(el.getAttribute("aria-label") || el.textContent || "");
    });
  const el = lista[i];
  if (!el) return false;
  el.scrollIntoView({ block: "center" });
  if (el.tagName === "INPUT" && el.type !== "checkbox" && el.type !== "radio" && el.type !== "button") {
    const fijar = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    fijar.call(el, el.value ? "" : "1000");
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  if (el.tagName === "SELECT") {
    el.selectedIndex = Math.min(1, el.options.length - 1);
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  el.click();
  return true;
}

/* En la página: lo que mide un estado, dentro del ámbito (la barra horizontal, en toda la página). */
async function medir([k, fuente, piso, minimo]) {
  const raiz = (0, eval)(`(${fuente})`)(k);
  const ancho = window.innerWidth;
  const r = { barra: document.documentElement.scrollWidth > ancho + 1, sale: [], letra: [], cejillas: 0, toque: [], ilustraciones: 0, controles: 0, firma: "" };
  if (!raiz) return { ...r, vacio: true };
  const nombre = (el) => {
    const clase = (el.className && el.className.baseVal === undefined ? el.className : "").toString().split(" ")[0];
    const datos = [...el.attributes].filter((a) => a.name.startsWith("data-")).map((a) => a.name).slice(0, 2).join(",");
    return `${el.tagName.toLowerCase()}${clase ? "." + clase : ""}${datos ? "[" + datos + "]" : ""} «${(el.textContent || "").trim().slice(0, 26)}»`;
  };
  /*
   * Visible para el ojo: ni oculto, ni transparente, ni «solo para el lector
   * de pantalla» (recortado a 1 px con clip o clip-path: ese texto no se lee
   * con la vista y medirlo daría rojos falsos).
   */
  const visible = (el) => {
    for (let x = el; x && x !== document.body; x = x.parentElement) {
      const s = getComputedStyle(x);
      if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
      if ((s.position === "absolute" || s.position === "fixed") && (s.clip !== "auto" || (s.clipPath && s.clipPath !== "none"))) return false;
      const c = x.getBoundingClientRect();
      if (c.width <= 1 || c.height <= 1) return false;
    }
    return true;
  };
  for (const el of raiz.querySelectorAll("*")) {
    const propios = [...el.childNodes].filter((x) => x.nodeType === 3 && x.textContent.trim().length > 1);
    if (!propios.length) continue;
    const caja = el.getBoundingClientRect();
    if (!caja.width || !caja.height || !visible(el)) continue;
    /* LETRA */
    const s = getComputedStyle(el);
    const px = parseFloat(s.fontSize);
    if (px < piso) {
      const propio = propios.map((x) => x.textContent).join("").trim();
      const cejilla = (s.textTransform === "uppercase" || (/\p{L}/u.test(propio) && propio === propio.toUpperCase())) && propio.length <= 48;
      r.letra.push(`${px}px ${nombre(el)}${cejilla ? " · cejilla?" : ""}`);
      if (cejilla) r.cejillas++;
    }
    /* SALE: el texto propio, fuera de su elemento (si este recorta o no) o de la ventana. */
    for (const t of propios) {
      const rango = document.createRange();
      rango.selectNodeContents(t);
      for (const q of rango.getClientRects()) {
        if (!q.width) continue;
        const exceso = Math.max(q.right - caja.right, caja.left - q.left);
        const fueraVentana = q.right > ancho + 0.5 || q.left < -0.5;
        if (exceso > 1.5 || fueraVentana) { r.sale.push(`${nombre(el)} · ${fueraVentana ? "fuera de la ventana" : `${exceso.toFixed(1)} px fuera de su caja`}`); break; }
      }
    }
  }
  /* TOQUE: cada control, centrado en la ventana, contesta en los 4 puntos medios del cuadro de 44. */
  const ctrls = [...raiz.querySelectorAll('button:not([disabled]), [role="button"], a[href], input:not([disabled]), select:not([disabled])')]
    .filter((el) => { const c = el.getBoundingClientRect(); return c.width > 0 && c.height > 0 && visible(el); });
  const scrollAntes = window.scrollY;
  const rr = minimo / 2 - 1;
  for (const el of ctrls) {
    if (el.closest("figure")) { r.ilustraciones++; continue; }
    r.controles++;
    el.scrollIntoView({ block: "center", inline: "center" });
    const c = el.getBoundingClientRect();
    const cx = c.left + c.width / 2;
    const cy = c.top + c.height / 2;
    const puntos = [[cx, cy - rr], [cx, cy + rr], [cx - rr, cy], [cx + rr, cy]];
    let buenos = 0;
    let quien = null;
    for (const [x, y] of puntos) {
      const en = document.elementFromPoint(x, y);
      if (en && (en === el || el.contains(en))) buenos++;
      else if (en && !quien) quien = nombre(en);
    }
    if (buenos < 4) r.toque.push(`${Math.round(c.width)}×${Math.round(c.height)} ${nombre(el)}${quien ? " · recibe: " + quien : ""}`);
  }
  window.scrollTo(0, scrollAntes);
  /* La firma del estado: para no medir dos veces la misma pantalla. */
  r.firma = `${raiz.innerText.length}|${raiz.querySelectorAll("*").length}|${raiz.innerText.slice(0, 200)}|${raiz.innerText.slice(-200)}`;
  return r;
}

/* evaluate no ve el módulo: el ámbito viaja como fuente y la página lo arma. */
const AMBITO = ambito.toString();

/*
 * EL CONTROL POSITIVO, antes de medir nada: en una página del banco se planta
 * un defecto conocido de cada clase (texto a 10 px, una palabra que se sale
 * de una caja de 40 px, un botón de 30×30, una barra horizontal). Si la sonda
 * no ve los cuatro, no informa: un medidor que no ve el defecto plantado da
 * verdes falsos.
 */
{
  const ctx = await contexto(320);
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}#aprender`);
  await pg.waitForTimeout(1200);
  await pg.evaluate(() => {
    const raiz = document.getElementById("root");
    const d = document.createElement("div");
    d.innerHTML = '<p style="font-size:10px">Texto plantado a diez</p><div style="width:40px;white-space:nowrap;font-size:14px">Palabraquenocabe</div><button style="width:30px;height:30px">x</button><div style="width:600px;height:4px"></div>';
    raiz.prepend(d);
  });
  const m = await pg.evaluate(medir, [null, AMBITO, PISO, TOQUE]);
  const ve = { letra: m.letra.some((x) => x.includes("Texto plantado")), sale: m.sale.some((x) => x.includes("Palabraquenocabe")), toque: m.toque.some((x) => x.startsWith("30×30")), barra: m.barra };
  await ctx.close();
  if (!Object.values(ve).every(Boolean)) {
    console.error(`LA SONDA NO VE LO PLANTADO: ${JSON.stringify(ve)}. No se informa nada.`);
    process.exit(2);
  }
  process.stderr.write("control positivo: ve la letra, el texto fuera, el toque y la barra plantados\n");
}

const resultados = [];
const detalle = [];
let ok = true;

/* SOLO_A3=1 mide solo el encargo 3 (las casillas y la hoja de la act. 3), sin la línea base. */
for (const ancho of process.env.SOLO_A3 ? [] : ANCHOS) {
  const ctx = await contexto(ancho);
  for (const p of PIEZAS) {
    const k = p.k ?? null;
    const res = { pieza: p, ancho, estados: 0, barra: 0, sale: new Set(), letra: new Set(), cejillas: new Set(), toque: new Set(), controles: 0, ilustraciones: 0, errores: [] };
    for (const orden of ["primero", "último"]) {
      const pg = await ctx.newPage();
      pg.on("pageerror", (e) => res.errores.push(String(e).slice(0, 90)));
      await pg.goto(`${BASE}#${p.hash}`);
      await pg.waitForTimeout(1200);
      const vistas = new Set();
      const tocados = new Set();
      const registrar = async (n) => {
        const m = await pg.evaluate(medir, [k, AMBITO, PISO, TOQUE]);
        if (m.vacio || vistas.has(m.firma)) return false;
        vistas.add(m.firma);
        res.estados++;
        if (m.barra) res.barra++;
        m.sale.forEach((x) => res.sale.add(x));
        m.letra.forEach((x) => (x.endsWith("cejilla?") ? res.cejillas : res.letra).add(x));
        m.toque.forEach((x) => res.toque.add(x));
        res.controles = Math.max(res.controles, m.controles);
        res.ilustraciones = Math.max(res.ilustraciones, m.ilustraciones);
        if (CAPTURAS) await pg.screenshot({ path: `${CAPTURAS}/${p.id}-${ancho}-${orden === "primero" ? "a" : "b"}${String(n).padStart(2, "0")}.png` });
        return true;
      };
      await registrar(0);
      for (let paso = 1; paso <= PASOS; paso++) {
        const lista = await pg.evaluate(controles, [k, AMBITO]);
        const nuevos = lista.filter((x) => !tocados.has(x.clave));
        if (!nuevos.length) break;
        const elegido = orden === "primero" ? nuevos[0] : nuevos[nuevos.length - 1];
        tocados.add(elegido.clave);
        await pg.evaluate(tocar, [k, AMBITO, elegido.i]);
        await pg.waitForTimeout(ESPERA);
        await registrar(paso);
      }
      await pg.close();
    }
    const cumple = res.estados > 0 && !res.barra && !res.sale.size && !res.letra.size && !res.toque.size && !res.errores.length;
    if (!cumple) ok = false;
    resultados.push({ ...res, cumple });
    process.stderr.write(`${ancho} ${p.id}: ${res.estados} estados${cumple ? "" : " · NO CUMPLE"}\n`);
  }
  await ctx.close();
}

/*
 * ENCARGO 3 (#469, §7 de e3-t3-itagaki-lenguaje-hacer-v1): a 320, el alto de
 * las casillas de la act. 3 y de su hoja «Elige la cuenta», y, para
 * comparar, la hoja de r5 (HojaRenglon, scripts/e5/harness-r5). El objeto 1
 * se iguala a la act. 3 si se aparta en más de 4 px de 44.
 */
/* Lo de dentro de un <figure> es el ejemplo de «Así se juega»: no cuenta. */
const alto = (sel) => [...document.querySelectorAll(sel)].filter((e) => !e.closest("figure")).map((e) => Math.round(e.getBoundingClientRect().height * 10) / 10);
const medidasA3 = {};
{
  const ctx = await contexto(320);
  const pg = await ctx.newPage();
  await pg.goto(`${BASE}#hacer:${ACT3_T3.id}`);
  await pg.waitForTimeout(1200);
  /* «Así se juega» primero: se sale por su botón hasta que aparezcan las casillas. */
  for (let k = 0; k < 8 && (await pg.locator("[data-asj-siguiente]").count()); k++) {
    const b = pg.locator('button:visible:has-text("Siguiente"), button:visible:has-text("Jugar"), button:visible:has-text("Empezar")');
    if (!(await b.count())) break;
    await b.first().click();
    await pg.waitForTimeout(700);
  }
  medidasA3.casillas = await pg.evaluate(alto, "[data-casilla]");
  await pg.locator("[data-casilla]:not(figure [data-casilla])").first().click();
  await pg.waitForTimeout(900);
  medidasA3.hoja = await pg.evaluate(alto, "[data-hoja]");
  medidasA3.opcionesHoja = [...new Set(await pg.evaluate(alto, "[data-hoja] [data-opcion]"))];
  medidasA3.botonesHoja = await pg.evaluate(() => [...document.querySelectorAll("[data-hoja] button:not([data-opcion])")].map((b) => `${(b.textContent || "").trim().slice(0, 20)} ${Math.round(b.getBoundingClientRect().height)}`));
  await ctx.close();
}
const medidasR5 = {};
{
  const ctx = await contexto(320);
  const pg = await ctx.newPage();
  await pg.goto(`${BASE.replace("/scripts/t3/harness-t3/", "/scripts/e5/harness-r5/")}#r5-3`);
  await pg.waitForTimeout(1500);
  const anadir = pg.locator('[data-anadir="debe"]');
  if (await anadir.count()) {
    await anadir.first().click();
    await pg.waitForTimeout(900);
    medidasR5.hoja = await pg.evaluate(alto, "[data-hoja-renglon]");
    medidasR5.filas = [...new Set(await pg.evaluate(alto, "[data-hoja-renglon] [data-cuenta]"))];
    medidasR5.cabecera = await pg.evaluate(() => [...document.querySelectorAll("[data-hoja-renglon] [data-cancelar]")].map((b) => Math.round(b.getBoundingClientRect().height)));
  }
  await ctx.close();
}

await navegador.close();
await servidor.close();

/* La tabla de la línea base (Markdown) y el detalle. */
const si = (n) => (n ? `✗ ${n}` : "✓");
console.log("| Pieza | Ancho | Estados | Barra | Texto fuera | Letra < 12 | Cejillas < 12 | Toque < 44 | Errores |");
console.log("|---|---|---|---|---|---|---|---|---|");
for (const r of resultados) {
  console.log(`| ${r.pieza.nombre} | ${r.ancho} | ${r.estados} | ${si(r.barra)} | ${si(r.sale.size)} | ${si(r.letra.size)} | ${r.cejillas.size ? r.cejillas.size + " (prueba del dedo)" : "—"} | ${si(r.toque.size)} | ${si(r.errores.length)} |`);
}
console.log("\n<details><summary>Detalle de los hallazgos</summary>\n");
for (const r of resultados) {
  const items = [
    ...[...r.sale].map((x) => `texto fuera: ${x}`),
    ...[...r.letra].map((x) => `letra: ${x}`),
    ...[...r.cejillas].map((x) => `cejilla: ${x}`),
    ...[...r.toque].map((x) => `toque: ${x}`),
    ...[...new Set(r.errores)].map((x) => `error: ${x}`),
  ];
  if (!items.length && !r.ilustraciones) continue;
  console.log(`**${r.pieza.nombre} · ${r.ancho}** (controles medidos: ${r.controles}; ilustraciones saltadas: ${r.ilustraciones})`);
  for (const x of items) console.log(`- ${x}`);
  console.log("");
}
console.log("</details>");
console.log("\n**Act. 3 a 320 (encargo 3)**");
console.log(`- casillas: ${medidasA3.casillas?.join(", ") || "no se alcanzaron"} px`);
console.log(`- hoja «Elige la cuenta»: ${medidasA3.hoja?.join(", ") || "no se abrió"} px de alto; opciones de ${medidasA3.opcionesHoja?.join(", ")} px; otros botones: ${medidasA3.botonesHoja?.join(" · ") || "—"}`);
console.log(`- hoja de r5-3 (HojaRenglon): ${medidasR5.hoja?.join(", ") || "no se abrió"} px de alto; filas de ${medidasR5.filas?.join(", ")} px; «Cancelar» ${medidasR5.cabecera?.join(", ")} px`);
if (process.env.SOLO_A3) {
  console.log("\nSOLO_A3: se midió solo el encargo 3; la línea base no se corrió y no hay veredicto.");
  process.exit(0);
}
console.log(ok ? "\nPASA: T3 cumple a 320 y a 375 en todos los estados medidos." : "\nNO CUMPLE: ver la tabla (es la línea base).");
process.exit(ok ? 0 : 1);
