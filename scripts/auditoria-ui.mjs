/*
 * ═══════════════════════════════════════════════════════════════════════════
 * AUDITORÍA DE INTERFAZ, MEDIDA SOBRE EL SITIO PUBLICADO
 *
 * POR QUÉ ESTA Y NO LAS QUE YA HAY
 *
 * El repo tiene tres sondas y cada una mira una cosa en unas pocas pantallas:
 * piso-de-12 el tamaño de letra, contraste el color, blanco-de-toque el área
 * de los botones. Para saber cómo está el sitio ENTERO hacía falta recorrerlo
 * una vez y medirlo todo en la misma pasada, porque abrir el navegador y
 * esperar a que pinte cada pantalla es lo que cuesta: medir cinco cosas en vez
 * de una, una vez dentro, es gratis.
 *
 * QUÉ MIDE, Y POR QUÉ CADA COSA
 *
 *   1. LETRA POR DEBAJO DE 12 PX. La regla del kit. Se mide el tamaño
 *      CALCULADO del elemento que tiene el texto, no el que diga su archivo:
 *      un tamaño heredado, en em o en una hoja de CSS no aparece en ningún
 *      `fontSize:`.
 *
 *   2. CONTRASTE POR DEBAJO DE 4,5:1 (3:1 si la letra es grande). El umbral
 *      de la WCAG para texto. El fondo se busca subiendo por los ancestros
 *      hasta encontrar uno que no sea transparente, que es lo que ve el ojo.
 *
 *   3. BLANCOS DE TOQUE POR DEBAJO DE 44 PX. Lo que cabe bajo un pulgar. Se
 *      mide la caja real del control, no su padding declarado.
 *
 *   4. DESBORDE HORIZONTAL. Si el documento es más ancho que la ventana, hay
 *      una barra de scroll lateral y algo se sale. Se nombra el elemento más
 *      ancho, que casi siempre es el culpable.
 *
 *   5. CONTROLES SIN NOMBRE. Un botón cuyo contenido es solo un icono y no
 *      tiene aria-label no existe para un lector de pantalla.
 *
 * LO QUE NO MIDE, para que nadie lo suponga: si la pantalla se entiende, si el
 * orden tiene sentido o si el texto está bien escrito. Eso no lo dice una
 * sonda; hay que recorrer el sitio y mirarlo.
 *
 * CÓMO SE CORRE
 *
 *   VITE_SUPABASE_URL=https://falso.supabase.co VITE_SUPABASE_ANON_KEY=sonda npm run build
 *   node scripts/auditoria-ui.mjs                        320 y 375
 *   node scripts/auditoria-ui.mjs --ancho 320,375,1280
 *   node scripts/auditoria-ui.mjs --antes guion.js       finge una sesión
 *   node scripts/auditoria-ui.mjs --solo contabilidad    una ruta
 *   node scripts/auditoria-ui.mjs --json informe.json    el detalle completo
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(RAIZ, "dist");
const args = process.argv.slice(2);
const opcion = (n, d = null) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const anchos = opcion("--ancho", "320,375").split(",").map((a) => parseInt(a, 10));
const antes = opcion("--antes", null);
const solo = opcion("--solo", null);
const salidaJson = opcion("--json", null);
const PUERTO = Number(process.env.PUERTO ?? 8131);

/* Las pantallas del estudiante, en el orden en que las encuentra. */
const RUTAS = [
  ["portada", "/"],
  ["contabilidad", "/#/contabilidad"],
  ["T1 introducción", "/#/introduccion-contabilidad"],
  ["T2 cuentas, debe y haber", "/#/cuentas-debe-haber"],
  ["T3 ingresos y gastos", "/#/ingresos-gastos-y-caja"],
  ["T4 efectivo y caja menor", "/#/efectivo-caja-menor-bancos"],
  ["repaso diario contabilidad", "/#/repaso-diario-contabilidad"],
  ["macroeconomía", "/#/macroeconomia"],
  ["pensamiento sistémico", "/#/pensamiento-sistemico"],
  ["modelo iceberg", "/#/modelo-iceberg"],
  ["política fiscal", "/#/politica-fiscal"],
  ["política monetaria", "/#/politica-monetaria"],
  ["repaso diario", "/#/repaso-diario"],
  ["perfil", "/#/perfil"],
  ["tienda", "/#/tienda"],
].filter(([n]) => !solo || n.toLowerCase().includes(solo.toLowerCase()));

if (!existsSync(DIST)) {
  console.error("No hay dist/. Corre el build primero: la sonda mide lo que se publica.");
  process.exit(1);
}

const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json" };
const servidor = createServer(async (req, res) => {
  const limpia = decodeURIComponent((req.url || "/").split("?")[0]);
  let f = join(DIST, limpia === "/" ? "index.html" : limpia.replace(/^\/+/, ""));
  if (!existsSync(f) || limpia.endsWith("/")) f = join(DIST, "index.html");
  try {
    res.writeHead(200, { "content-type": TIPOS[extname(f)] || "application/octet-stream" });
    res.end(await readFile(f));
  } catch { res.writeHead(404).end("no"); }
});
await new Promise((ok) => servidor.listen(PUERTO, ok));

const { createRequire } = await import("node:module");
const requerir = createRequire(import.meta.url);
let chromium;
for (const donde of ["playwright", "/opt/npm-tools/node_modules/playwright"]) {
  try { ({ chromium } = requerir(donde)); break; } catch { /* el siguiente */ }
}
if (!chromium) { console.error("No encuentro playwright."); process.exit(1); }

/* Lo que corre DENTRO de la página. Todo en una función para pasarla entera. */
const MEDIR = () => {
  const PISO_PX = 12;
  const TOQUE_PX = 44;

  /*
   * EL FONDO HAY QUE COMPONERLO, NO BUSCARLO.
   *
   * La primera versión de esto tomaba el primer background-color que no fuera
   * «transparent» y lo daba por bueno. En este sitio casi todas las
   * superficies son blanco al 5 % sobre el navy: rgba(248,249,250,0.055). Con
   * el texto también en #F8F9FA, la cuenta salía 1:1 y la sonda denunciaba
   * como ilegible media pantalla que se lee perfectamente. 88 hallazgos, casi
   * todos falsos.
   *
   * Lo correcto es apilar las capas translúcidas y componerlas sobre la
   * primera opaca, que es lo que hace el navegador y lo que ve el ojo.
   */
  const partes = (c) => {
    const m = (c || "").match(/[\d.]+/g);
    if (!m) return null;
    return { r: +m[0], g: +m[1], b: +m[2], a: m.length > 3 ? +m[3] : 1 };
  };
  const sobre = (arriba, abajo) => ({
    r: arriba.r * arriba.a + abajo.r * (1 - arriba.a),
    g: arriba.g * arriba.a + abajo.g * (1 - arriba.a),
    b: arriba.b * arriba.a + abajo.b * (1 - arriba.a),
    a: 1,
  });
  const lum = (c) => {
    const p = typeof c === "string" ? partes(c) : c;
    if (!p) return null;
    const [r, g, b] = [p.r, p.g, p.b].map((v) => {
      const x = v / 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const fondoDe = (el) => {
    const capas = [];
    let suelo = null;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const p = partes(getComputedStyle(n).backgroundColor);
      if (!p || p.a === 0) continue;
      if (p.a >= 0.999) { suelo = p; break; }
      capas.push(p);
    }
    if (!suelo) suelo = partes(getComputedStyle(document.documentElement).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    if (suelo.a < 0.999) suelo = { r: 255, g: 255, b: 255, a: 1 };
    /* De la más profunda a la más cercana al texto. */
    let fondo = suelo;
    for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    return fondo;
  };
  /* Dentro de un SVG el color del texto es `fill`, no `color`. */
  const tintaDe = (el, s) => {
    const dentroSvg = el.ownerSVGElement || el.tagName.toLowerCase() === "svg";
    const crudo = dentroSvg ? (s.fill && s.fill !== "none" ? s.fill : s.color) : s.color;
    return partes(crudo);
  };
  const razon = (tinta, fondo) => {
    if (!tinta || !fondo) return null;
    /* Un texto translúcido se compone sobre su propio fondo antes de medirlo. */
    const t = tinta.a < 0.999 ? sobre(tinta, fondo) : tinta;
    const la = lum(t), lb = lum(fondo);
    if (la === null || lb === null) return null;
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };
  const donde = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cl = typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    const datos = [...el.attributes].filter((a) => a.name.startsWith("data-") && a.value).slice(0, 1).map((a) => `[${a.name}]`).join("");
    return `${el.tagName.toLowerCase()}${id}${cl}${datos}`;
  };
  const recorta = (t) => (t || "").replace(/\s+/g, " ").trim().slice(0, 48);

  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  /* Un elemento con texto PROPIO: si solo envuelve a otros, el texto no es suyo. */
  const textoPropio = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);

  const letra = [], color = [], toque = [], sinNombre = [];
  const vistos = new Set();

  for (const el of document.querySelectorAll("body *")) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el);

    if (textoPropio(el)) {
      const px = parseFloat(s.fontSize);
      const texto = recorta(el.textContent);
      const clave = `${donde(el)}|${texto}`;
      if (px < PISO_PX && !vistos.has("l" + clave)) {
        vistos.add("l" + clave);
        letra.push({ px: Math.round(px * 10) / 10, donde: donde(el), texto });
      }
      /* Grande = 18,66px en negrita o 24px normal, que es donde la WCAG baja el listón. */
      const grande = px >= 24 || (px >= 18.66 && Number(s.fontWeight) >= 700);
      const r = razon(tintaDe(el, s), fondoDe(el));
      const minimo = grande ? 3 : 4.5;
      if (r !== null && r < minimo && !vistos.has("c" + clave)) {
        vistos.add("c" + clave);
        color.push({ razon: Math.round(r * 100) / 100, minimo, px: Math.round(px * 10) / 10, donde: donde(el), texto });
      }
    }

    /*
     * Un enlace DENTRO de un párrafo no cuenta: la propia norma (WCAG 2.5.8)
     * exime los objetivos en línea dentro de un bloque de texto, porque
     * agrandarlos a 44 px rompería el renglón y empujaría las palabras de al
     * lado. Sin esta excepción la sonda pide arreglar «más en la política de
     * privacidad» en mitad de una frase, que es justo lo que no hay que hacer.
     */
    const enLinea = el.tagName === "A" && el.closest("p, li") && getComputedStyle(el).display.startsWith("inline");
    const esControl = !enLinea && el.matches("button, a[href], input, select, textarea, [role=button], [tabindex]:not([tabindex='-1'])");
    if (esControl) {
      const r = el.getBoundingClientRect();
      /*
       * EL ÁREA DE TOQUE NO ES SIEMPRE LA CAJA DEL ELEMENTO.
       *
       * Este sitio ya agranda varios controles pequeños con un ::after
       * absoluto de max(100%, 44px) —el logo mide 26 px y responde en 44—, y
       * getBoundingClientRect no ve un pseudo-elemento. La primera versión de
       * esta sonda los denunciaba todos, y arreglar lo que ya estaba bien es
       * peor que no medir: mueve el dibujo y no gana nada.
       */
      const extra = (cual) => {
        const ps = getComputedStyle(el, cual);
        if (!ps || ps.content === "none" || ps.position === "static") return { w: 0, h: 0 };
        return { w: parseFloat(ps.width) || 0, h: parseFloat(ps.height) || 0 };
      };
      const a1 = extra("::after"), a2 = extra("::before");
      const anchoReal = Math.max(r.width, a1.w, a2.w);
      const altoReal = Math.max(r.height, a1.h, a2.h);
      const chico = altoReal < TOQUE_PX - 0.5 || anchoReal < TOQUE_PX - 0.5;
      const clave = `${donde(el)}|${recorta(el.textContent)}`;
      if (chico && !vistos.has("t" + clave)) {
        vistos.add("t" + clave);
        toque.push({
          alto: Math.round(altoReal), ancho: Math.round(anchoReal),
          dibujo: `${Math.round(r.width)}x${Math.round(r.height)}`,
          donde: donde(el), texto: recorta(el.textContent),
        });
      }
      const nombre = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || el.getAttribute("alt") || "").trim();
      if (!nombre && !vistos.has("n" + clave)) {
        vistos.add("n" + clave);
        sinNombre.push({ donde: donde(el) });
      }
    }
  }

  /* El desborde: el documento más ancho que la ventana, y quién lo empuja. */
  const anchoDoc = document.documentElement.scrollWidth;
  const anchoVentana = document.documentElement.clientWidth;
  let culpable = null;
  if (anchoDoc > anchoVentana + 1) {
    let peor = 0;
    for (const el of document.querySelectorAll("body *")) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > anchoVentana + 1 && r.right > peor) { peor = r.right; culpable = { donde: donde(el), derecha: Math.round(r.right), texto: recorta(el.textContent) }; }
    }
  }

  return { letra, color, toque, sinNombre, desborde: anchoDoc > anchoVentana + 1 ? { anchoDoc, anchoVentana, culpable } : null };
};

const navegador = await chromium.launch();
const informe = [];
const total = { letra: 0, color: 0, toque: 0, sinNombre: 0, desborde: 0 };

for (const ancho of anchos) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: 820 }, deviceScaleFactor: 1 });
  if (antes) await ctx.addInitScript({ path: resolve(antes) });
  const pag = await ctx.newPage();
  pag.on("pageerror", (e) => informe.push({ ancho, ruta: "(error de página)", error: String(e).slice(0, 160) }));

  for (const [nombre, ruta] of RUTAS) {
    try {
      await pag.goto(`http://127.0.0.1:${PUERTO}${ruta}`, { waitUntil: "load", timeout: 20000 });
      await pag.waitForTimeout(1400);
      const r = await pag.evaluate(MEDIR);
      informe.push({ ancho, ruta: nombre, ...r });
      total.letra += r.letra.length;
      total.color += r.color.length;
      total.toque += r.toque.length;
      total.sinNombre += r.sinNombre.length;
      if (r.desborde) total.desborde += 1;
    } catch (e) {
      informe.push({ ancho, ruta: nombre, fallo: String(e).slice(0, 160) });
    }
  }
  await ctx.close();
}
await navegador.close();
servidor.close();

/* El resumen por pantalla, que es como se lee: una línea por ruta y ancho. */
console.log(`\nAUDITORÍA DE INTERFAZ · ${RUTAS.length} pantallas × ${anchos.join(", ")} px\n`);
for (const f of informe) {
  if (f.fallo) { console.log(`  ${f.ancho}px  ${f.ruta}: no se pudo medir — ${f.fallo}`); continue; }
  if (f.error) { console.log(`  ${f.ancho}px  ${f.ruta}: ${f.error}`); continue; }
  const partes = [];
  if (f.letra.length) partes.push(`letra<12: ${f.letra.length}`);
  if (f.color.length) partes.push(`contraste bajo: ${f.color.length}`);
  if (f.toque.length) partes.push(`toque<44: ${f.toque.length}`);
  if (f.sinNombre.length) partes.push(`sin nombre: ${f.sinNombre.length}`);
  if (f.desborde) partes.push(`DESBORDE ${f.desborde.anchoDoc}>${f.desborde.anchoVentana}`);
  console.log(`  ${String(f.ancho).padStart(4)}px  ${f.ruta.padEnd(30)} ${partes.length ? partes.join(" · ") : "limpio"}`);
}
console.log(`\n  TOTALES: letra ${total.letra} · contraste ${total.color} · toque ${total.toque} · sin nombre ${total.sinNombre} · pantallas con desborde ${total.desborde}\n`);

if (salidaJson) {
  await writeFile(resolve(salidaJson), JSON.stringify(informe, null, 2));
  console.log(`  Detalle completo en ${resolve(salidaJson)}\n`);
}
console.log("  La sonda mide; no juzga si la pantalla se entiende. Eso toca recorrerlo.\n");
