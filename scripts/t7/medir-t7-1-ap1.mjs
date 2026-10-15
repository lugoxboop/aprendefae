/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ¿CABE CADA TEXTO DE «LA CUENTA QUE NO SE MUEVE» A 375 Y A 320 PX?
 *
 *   node scripts/t7/medir-t7-1-ap1.mjs [carpeta-de-capturas]
 *
 * jsdom no calcula diseño, así que esto no puede vivir en `npm test`: se mide
 * en Chromium de verdad, con la vista del tema montada tal cual y la hoja de
 * estilos del sitio (Inter y Sora). Recorre las cuatro pantallas del recorte
 * del lote 1 y sus diez estados —en cada pregunta falla con cada opción
 * equivocada y después acierta— a 375 y a 320 px, y en cada estado comprueba:
 *
 *   · que la página no tenga barra horizontal
 *   · que ningún elemento con texto se salga de su caja (scrollWidth)
 *   · que ningún elemento con texto se salga del panel de la pieza
 *   · que las fuentes que se midieron sean Inter y Sora, y no la de reserva
 *   · que cada botón de la pieza mida 44 px de alto o más
 *
 * Y en la figura de Watari («Dos columnas del periodo»):
 *
 *   · que la portada no la tenga y los otros nueve estados sí
 *   · «DEBE» y el monto: con 121 px de línea o menos el monto baja (a 320),
 *     con más va en la misma línea (a 375), y nunca se tocan. El corte es el
 *     de Mello (121 px); la sonda lo prueba a 119 y 123 px de línea
 *   · que «Conteo físico», mientras está pendiente desde la primera pregunta
 *     hasta el colocando del conteo, ocupe la fila entera, centrado, y no
 *     quede bajo una columna
 *   · que las rayas de los dos encabezados queden a la misma altura aunque
 *     «Inventario de mercancías» ocupe dos líneas (v3.1)
 *   · que las dos columnas midan lo mismo y no cambien de ancho entre estados
 *   · que ningún borde de la figura sea punteado ni discontinuo
 *   · que el fundido sea de 120 ms y desaparezca con movimiento reducido
 *
 * Sale con código 1 si algo falla, y escribe una tabla con las medidas.
 * Necesita Playwright (no es dependencia del repo): toma el que haya
 * instalado en la máquina, o el de PLAYWRIGHT_MODULE. Si Google Fonts no
 * responde, FUENTES_DIR (una carpeta con fuentes.css y los .woff2) las sirve
 * desde disco.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "vite";
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "../..");
const require = createRequire(import.meta.url);
const rutaPlaywright = process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright";
const { chromium } = require(rutaPlaywright);
const CAPTURAS = process.argv[2] ?? null;
if (CAPTURAS) mkdirSync(CAPTURAS, { recursive: true });

const ANCHOS = [375, 320];

const servidor = await createServer({ root: RAIZ, logLevel: "error", server: { port: 0, host: "127.0.0.1" } });
await servidor.listen();
const { port } = servidor.httpServer.address();
const URL_BANCO = `http://127.0.0.1:${port}/scripts/t7/harness/index.html`;

const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

/* Las fuentes de Google desde disco, si hay carpeta: la letra medida es la real. */
const FUENTES = process.env.FUENTES_DIR ?? null;
async function nuevaPagina(opciones) {
  const pagina = await navegador.newPage(opciones);
  if (FUENTES && existsSync(`${FUENTES}/fuentes.css`)) {
    const css = readFileSync(`${FUENTES}/fuentes.css`, "utf8");
    await pagina.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (ruta) => {
      const u = ruta.request().url();
      if (u.includes("googleapis")) return ruta.fulfill({ status: 200, contentType: "text/css", body: css });
      const f = `${FUENTES}/${u.replace("https://fonts.gstatic.com/", "").replace(/\//g, "_")}`;
      return existsSync(f) ? ruta.fulfill({ status: 200, contentType: "font/woff2", body: readFileSync(f) }) : ruta.abort();
    });
  }
  return pagina;
}
const fallos = [];
const columnas = {};
const filas = [];

/* Lo que se mide en cada estado. Corre dentro de la página. */
function medir() {
  const panel = document.querySelector("[data-pieza]").closest("section");
  const caja = panel.getBoundingClientRect();
  const problemas = [];
  const conTexto = [...document.querySelectorAll("h1, [data-pieza] *, section > header *")]
    /* Lo plegado tras «¿Por qué?» está oculto (hidden) y no ocupa sitio: no se mide. */
    .filter((el) => !el.closest(".t7fg-sr") && !el.closest("[hidden]") && !el.matches("style, script"))
    .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  for (const el of conTexto) {
    const r = el.getBoundingClientRect();
    const estilo = getComputedStyle(el);
    const nombre = `${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 40)}»`;
    if (estilo.display !== "inline" && el.scrollWidth > el.clientWidth + 0.5) {
      problemas.push(`${nombre}: el texto mide ${el.scrollWidth} px y la caja ${el.clientWidth} px`);
    }
    if (el.closest("[data-pieza], section > header") && (r.right > caja.right + 0.5 || r.left < caja.left - 0.5)) {
      problemas.push(`${nombre}: se sale del panel (${r.left.toFixed(1)}–${r.right.toFixed(1)} contra ${caja.left.toFixed(1)}–${caja.right.toFixed(1)})`);
    }
  }
  for (const b of document.querySelectorAll("[data-pieza] button:not([data-por-que])")) {
    const alto = b.getBoundingClientRect().height;
    if (alto < 43.5) problemas.push(`botón «${b.textContent.trim().slice(0, 30)}» mide ${alto.toFixed(1)} px de alto`);
  }
  const raiz = document.documentElement;
  if (raiz.scrollWidth > window.innerWidth) problemas.push(`la página mide ${raiz.scrollWidth} px de ancho en una ventana de ${window.innerWidth}`);
  const fuente = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).fontFamily.split(",")[0].replace(/"/g, "").trim() : null;
  };
  const linea = document.querySelector("[data-linea]");
  const anchoUtil = (el) => {
    const e = getComputedStyle(el);
    return el.clientWidth - parseFloat(e.paddingLeft) - parseFloat(e.paddingRight);
  };
  const lineaSpans = linea ? [...linea.children].map((s) => s.getBoundingClientRect()) : [];
  const fig = document.querySelector("[data-figura]");
  let figura = null;
  if (fig) {
    for (const el of fig.querySelectorAll("*")) {
      const e = getComputedStyle(el);
      for (const lado of ["Top", "Right", "Bottom", "Left"]) {
        if (/dashed|dotted/.test(e[`border${lado}Style`])) problemas.push(`figura: borde ${e[`border${lado}Style`]} en ${el.className || el.tagName}`);
      }
    }
    const cols = [...fig.querySelectorAll(".t7fg-col")].map((c) => Math.round(c.getBoundingClientRect().width * 10) / 10);
    const mov = fig.querySelector(".t7fg-mov");
    let compra = null;
    if (mov) {
      const debe = mov.querySelector(".t7fg-debe").getBoundingClientRect();
      const monto = mov.querySelector(".t7fg-monto").getBoundingClientRect();
      const lin = mov.querySelector(".t7fg-lin");
      const se_tocan = !(debe.right <= monto.left || monto.right <= debe.left || debe.bottom <= monto.top || monto.bottom <= debe.top);
      if (se_tocan) problemas.push(`figura: «DEBE» y el monto se tocan`);
      compra = {
        linea: Math.round(lin.getBoundingClientRect().width * 10) / 10,
        contenedor: Math.round(anchoUtil(mov) * 10) / 10,
        debeMasMonto: Math.round((debe.width + 8 + monto.width) * 100) / 100,
        montoAbajo: monto.top >= debe.bottom - 0.5,
      };
    }
    const pend = fig.querySelector("[data-fg=cierre-pendiente]");
    const colInv = fig.querySelector("[data-fg=col-inventario]").getBoundingClientRect();
    const pendiente = pend ? {
      ancho: Math.round(pend.getBoundingClientRect().width * 10) / 10,
      columna: Math.round(colInv.width * 10) / 10,
    } : null;
    const rayas = [...fig.querySelectorAll(".t7fg-col")].map((c) => c.getBoundingClientRect().bottom);
    if (fig.querySelector(".t7fg-col:not(.t7fg-col-vacia)") && fig.querySelectorAll(".t7fg-col:not(.t7fg-col-vacia)").length === 2 && Math.abs(rayas[0] - rayas[1]) > 0.5) {
      problemas.push(`figura: las rayas de los encabezados no están a la misma altura (${rayas.map((r) => r.toFixed(1)).join(" / ")})`);
    }
    if (pend && getComputedStyle(pend).textAlign !== "center") problemas.push("figura: «Conteo físico» pendiente no va centrado");
    if (pendiente && pendiente.ancho <= pendiente.columna + 0.5) problemas.push(`figura: «Conteo físico» pendiente mide ${pendiente.ancho} px y cabe bajo la columna de ${pendiente.columna}`);
    const nueva = fig.querySelector(".t7fg-nueva");
    figura = {
      clave: fig.dataset.figura,
      pendiente,
      alto: Math.round(fig.getBoundingClientRect().height),
      cols,
      compra,
      fundido: nueva ? { que: nueva.dataset.fg, nombre: getComputedStyle(nueva).animationName, dura: getComputedStyle(nueva).animationDuration } : null,
    };
  }
  return {
    figura,
    problemas,
    panel: Math.round(caja.width * 10) / 10,
    textos: conTexto.length,
    fuentes: {
      inter: document.fonts.check("14px Inter"),
      sora: document.fonts.check("700 14px Sora"),
      parrafo: fuente("[data-texto]"),
      titulo: fuente("section > header h3"),
    },
    linea: linea ? {
      util: Math.round(anchoUtil(linea) * 10) / 10,
      contenido: Math.round((Math.max(...lineaSpans.map((r) => r.right)) - Math.min(...lineaSpans.map((r) => r.left))) * 10) / 10,
      renglones: new Set(lineaSpans.map((r) => Math.round(r.top))).size,
    } : null,
  };
}

for (const ancho of ANCHOS) {
  const pagina = await nuevaPagina({ viewport: { width: ancho, height: 800 }, deviceScaleFactor: 2 });
  await pagina.goto(URL_BANCO);
  await pagina.waitForSelector("[data-pieza]");
  await pagina.evaluate(() => document.fonts.ready);

  const estado = async (nombre) => {
    await pagina.evaluate(() => document.fonts.ready);
    const m = await pagina.evaluate(medir);
    filas.push({ ancho, estado: nombre, ...m });
    for (const p of m.problemas) fallos.push(`${ancho} px · ${nombre} · ${p}`);
    const mal = (t) => fallos.push(`${ancho} px · ${nombre} · ${t}`);
    if (nombre === "portada") { if (m.figura) mal("la portada tiene figura"); }
    else if (!m.figura) mal("falta la figura");
    if (m.figura) {
      const enFila = ["F3", "F4c", "F4ei", "F4eg", "F4a", "F5c"].includes(m.figura.clave);
      if (enFila !== Boolean(m.figura.pendiente)) mal(`«Conteo físico» ${m.figura.pendiente ? "ocupa la fila" : "no ocupa la fila"} en ${m.figura.clave}`);
      const [a, b] = m.figura.cols;
      if (Math.abs(a - b) > 0.5) mal(`las columnas miden distinto: ${a} y ${b}`);
      columnas[ancho] ??= a;
      if (Math.abs(columnas[ancho] - a) > 0.5) mal(`la columna cambió de ancho: ${columnas[ancho]} → ${a}`);
      const c = m.figura.compra;
      if (c) {
        if (c.montoAbajo !== (c.contenedor <= 121)) mal(`con ${c.contenedor} px de línea el monto ${c.montoAbajo ? "baja" : "no baja"}`);
        if (c.montoAbajo !== (ancho === 320)) mal(`a ${ancho} px el monto ${c.montoAbajo ? "baja" : "no baja"}`);
      }
      const esperado = { F4a: "compra", F5a: "conteo" }[m.figura.clave] ?? null;
      const f = m.figura.fundido;
      if ((f?.que ?? null) !== esperado) mal(`fundido en ${f?.que ?? "nada"} y debía ser en ${esperado ?? "nada"}`);
      if (f && (f.nombre !== "t7fg-aparece" || f.dura !== "0.12s")) mal(`fundido ${f.nombre} de ${f.dura}`);
    }
    if (!m.fuentes.inter || !m.fuentes.sora) fallos.push(`${ancho} px · ${nombre} · no cargaron Inter o Sora: se habría medido la fuente de reserva`);
    if (CAPTURAS) await pagina.screenshot({ path: resolve(CAPTURAS, `${ancho}-${String(filas.filter((f) => f.ancho === ancho).length).padStart(2, "0")}-${nombre}.png`), fullPage: true });
  };
  const clic = (sel) => pagina.click(sel);
  const pantalla = () => pagina.getAttribute("[data-pieza]", "data-pantalla");

  for (let vuelta = 0; vuelta < 4; vuelta++) {
    const id = await pantalla();
    const pregunta = await pagina.$("[data-pregunta]");
    if (!pregunta) {
      await estado(id);
      const b = await pagina.$("[data-boton]");
      if (!b) break;
      await b.click();
      continue;
    }
    await estado(`${id}-colocando`);
    const correcta = id === "pregunta-compra" ? "compras" : "inventario";
    const malas = await pagina.$$eval("[data-opcion]", (bs, c) => bs.map((b) => b.dataset.opcion).filter((o) => o !== c), correcta);
    for (const mala of malas) {
      await clic(`[data-opcion="${mala}"]`);
      await clic('[data-boton="confirmar"]');
      await estado(`${id}-error-${mala}`);
      await clic('[data-boton="probar-otra"]');
    }
    await clic(`[data-opcion="${correcta}"]`);
    await clic('[data-boton="confirmar"]');
    await estado(`${id}-acierto`);
    await clic('[data-boton="seguir"]');
  }
  await pagina.close();
}

/* El corte de 121 px, a los dos lados: con 119 px de línea el monto baja; con 123, no. */
{
  const pagina = await nuevaPagina({ viewport: { width: 420, height: 900 } });
  await pagina.goto(`${URL_BANCO}#sonda`);
  await pagina.waitForSelector("[data-sonda]");
  await pagina.evaluate(() => document.fonts.ready);
  const sondas = await pagina.$$eval("[data-sonda]", (ds) => ds.map((d) => {
    const mov = d.querySelector(".t7fg-mov");
    const e = getComputedStyle(mov);
    const util = mov.clientWidth - parseFloat(e.paddingLeft) - parseFloat(e.paddingRight);
    const debe = mov.querySelector(".t7fg-debe").getBoundingClientRect();
    const monto = mov.querySelector(".t7fg-monto").getBoundingClientRect();
    return { linea: Number(d.dataset.sonda), util, montoAbajo: monto.top >= debe.bottom - 0.5 };
  }));
  for (const sd of sondas) {
    const debeBajar = sd.util <= 121;
    console.log(`Sonda: línea de ${sd.util} px → el monto ${sd.montoAbajo ? "baja" : "va en la misma línea"}`);
    if (Math.abs(sd.util - sd.linea) > 0.5) fallos.push(`sonda: la línea mide ${sd.util} y debía medir ${sd.linea}`);
    if (sd.montoAbajo !== debeBajar) fallos.push(`sonda: con ${sd.util} px de línea el monto ${sd.montoAbajo ? "baja" : "no baja"}`);
  }
  await pagina.close();
}

/* Con movimiento reducido, sin fundido: se juega hasta los dos aciertos y se mira la animación. */
{
  const pagina = await nuevaPagina({ viewport: { width: 375, height: 800 }, reducedMotion: "reduce" });
  await pagina.goto(URL_BANCO);
  await pagina.waitForSelector("[data-pieza]");
  await pagina.click('[data-boton="empezar"]');
  const fundido = () => pagina.$eval(".t7fg-nueva", (el) => ({ que: el.dataset.fg, nombre: getComputedStyle(el).animationName }));
  await pagina.click('[data-opcion="compras"]');
  await pagina.click('[data-boton="confirmar"]');
  const f4 = await fundido();
  await pagina.click('[data-boton="seguir"]');
  await pagina.click('[data-opcion="inventario"]');
  await pagina.click('[data-boton="confirmar"]');
  const f5 = await fundido();
  for (const f of [f4, f5]) {
    if (f.nombre !== "none") fallos.push(`movimiento reducido · ${f.que} tiene la animación ${f.nombre}`);
  }
  console.log(`Movimiento reducido: ${f4.que} → ${f4.nombre}; ${f5.que} → ${f5.nombre}\n`);
  await pagina.close();
}

await navegador.close();
await servidor.close();

console.log("ancho | estado | panel px | textos | fuentes | línea del acierto: útil / contenido / renglones | figura: alto · columnas · línea de la compra (contenedor) · DEBE+8+monto · monto abajo · fundido");
for (const f of filas) {
  const l = f.linea ? `${f.linea.util} / ${f.linea.contenido} / ${f.linea.renglones}` : "—";
  const g = f.figura;
  const fg = g ? `${g.clave} ${g.alto} px · ${g.cols.join(" / ")} · ${g.compra ? `${g.compra.linea} (${g.compra.contenedor}) · ${g.compra.debeMasMonto} · ${g.compra.montoAbajo ? "sí" : "no"}` : "—"} · ${g.fundido ? `${g.fundido.que} ${g.fundido.dura}` : "—"}` : "sin figura";
  console.log(`${f.ancho} | ${f.estado} | ${f.panel} | ${f.textos} | ${f.fuentes.parrafo}/${f.fuentes.titulo} | ${l} | ${fg}`);
}
const estados = new Set(filas.map((f) => f.estado)).size;
console.log(`\n${filas.length} medidas (${estados} estados × ${ANCHOS.length} anchos).`);
if (estados !== 10) fallos.push(`se recorrieron ${estados} estados y son 10`);
if (fallos.length) {
  console.log(`\nFALLA: ${fallos.length} problema(s)`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("PASA: ningún texto se sale a 375 ni a 320 px.");
