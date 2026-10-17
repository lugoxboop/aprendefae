/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CONTRASTE DEL TEXTO, MEDIDO EN LA PÁGINA.
 *
 * La regla (WCAG AA, la que usa el prompt maestro de diseño): el texto normal
 * necesita 4,5:1 contra su fondo; el grande —24 px, o 18,66 px en negrita—
 * se conforma con 3:1.
 *
 * POR QUÉ NO SIRVE MIRAR EL CÓDIGO: casi todo el texto atenuado de la
 * plataforma se escribe como `rgba(248,249,250,0.45)`, y ese 0,45 no dice
 * nada por sí solo. Lo que se ve depende del fondo que tenga DEBAJO —una
 * tarjeta sobre otra tarjeta sobre el fondo de la materia—, y de si ese fondo
 * es a su vez semitransparente. El número que importa no está escrito en
 * ningún sitio: hay que componerlo.
 *
 * LO QUE HACE: por cada elemento con texto propio visible, compone el fondo
 * real subiendo por los padres hasta encontrar opacidad 1, mezcla las capas
 * en orden, y calcula la razón de contraste.
 *
 * LO QUE NO HACE, dicho de frente: no cuenta los controles deshabilitados
 * —WCAG los exime y verlos apagados es la señal—, no mira texto sobre imágenes ni sobre
 * degradados —se queda con el color plano más cercano—, y solo recorre las
 * rutas que se le pasan. Una conclusión aquí nombra lo que miró (kit.md).
 *
 * CÓMO SE CORRE (hace falta el paquete construido y servido):
 *
 *   node scripts/contraste.mjs "Introducción a la contabilidad"
 * ═══════════════════════════════════════════════════════════════════════════
 */
import pkg from "/opt/npm-tools/node_modules/playwright-core/index.js";
const { chromium } = pkg;

const TEMA = process.argv[2] ?? "Introducción a la contabilidad";
const ANCHO = Number((process.argv[3] && !process.argv[3].startsWith("--")) ? process.argv[3] : 320);
const RAIZ = `http://127.0.0.1:${process.env.PUERTO ?? 8099}/`;

const MEDIR = `(() => {
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const razon = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const nums = (c) => (c.match(/[\\d.]+/g) || []).map(Number);
  /* Mezcla una capa con alfa sobre lo que ya hay debajo. */
  const sobre = (capa, base) => capa.slice(0, 3).map((v, i) => Math.round(v * capa[3] + base[i] * (1 - capa[3])));
  /* El fondo real: sube por los padres mezclando cada capa hasta llegar a opaco. */
  const fondoDe = (el) => {
    const capas = [];
    for (let n = el; n; n = n.parentElement) {
      const c = nums(getComputedStyle(n).backgroundColor);
      if (c.length < 3) continue;
      const a = c.length === 4 ? c[3] : 1;
      if (a === 0) continue;
      capas.push([c[0], c[1], c[2], a]);
      if (a === 1) break;
    }
    if (capas.length === 0) return [14, 27, 46];
    let base = capas[capas.length - 1].slice(0, 3);
    for (let i = capas.length - 2; i >= 0; i--) base = sobre(capas[i], base);
    return base;
  };
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    /* El texto recortado solo para lector de pantalla no se ve. */
    if (r.width <= 1.5 && r.height <= 1.5) return false;
    return true;
  };
  const malos = [];
  const sinMedir = [];
  for (const el of document.querySelectorAll("body *")) {
    const propio = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").trim();
    if (!propio) continue;
    if (!visible(el)) continue;
    /*
     * Un control inactivo no pide contraste (WCAG 1.4.3 exime a lo
     * deshabilitado): el «Siguiente» que todavía no se puede pulsar se ve
     * apagado A PROPÓSITO, y contarlo aquí sería perseguir un acierto.
     */
    if (el.closest("[disabled], [aria-disabled='true']")) continue;
    const s = getComputedStyle(el);
    const texto = nums(s.color);
    if (texto.length < 3) continue;
    const alfa = texto.length === 4 ? texto[3] : 1;
    /*
     * Texto totalmente transparente: NO es un fallo de contraste, es que no
     * se puede medir desde aquí. Casi siempre el color viene de un recorte
     * (background-clip: text) o el elemento está a mitad de una entrada.
     * Medirlo daría 1:1 para todo, que es ruido con pinta de hallazgo: la
     * primera versión marcó así 46 textos de T6 y los iba a mandar a la
     * Célula B como defectos.
     */
    if (alfa === 0) { sinMedir.push(propio.slice(0, 34)); continue; }
    const fondo = fondoDe(el);
    /* Un texto semitransparente se mezcla con su propio fondo antes de medirse. */
    const color = alfa < 1 ? sobre([texto[0], texto[1], texto[2], alfa], fondo) : texto.slice(0, 3);
    const px = parseFloat(s.fontSize);
    const peso = Number(s.fontWeight) || 400;
    const grande = px >= 24 || (px >= 18.66 && peso >= 700);
    const piso = grande ? 3 : 4.5;
    const r = razon(color, fondo);
    if (r < piso) malos.push({ r: Math.round(r * 100) / 100, piso, px, peso, texto: propio.slice(0, 34), etiqueta: el.tagName.toLowerCase(), color: s.color, fondo: "rgb(" + fondo.join(",") + ")", donde: (() => { for (let n = el; n; n = n.parentElement) { const a = [...n.attributes].find((x) => x.name.startsWith("data-")); if (a) return n.tagName.toLowerCase() + "[" + a.name + "=" + a.value.slice(0, 24) + "]"; } return "sin data-"; })() });
  }
  return { malos, sinMedir };
})()`;

/*
 * El botón de avanzar no se llama igual en todas las piezas: «Siguiente» en
 * las de T1 a T3, «Seguir» en las de T4. Con uno solo, la sonda medía la
 * primera pantalla de T4 y se iba: un cero que parecía un aprobado.
 */
const AVANCE = 'button:visible:has-text("Siguiente"), button:visible:has-text("Seguir")';

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await b.newPage({ viewport: { width: ANCHO, height: 1400 } });
await p.goto(RAIZ, { waitUntil: "networkidle" });
for (const paso of ["Contabilidad", TEMA]) {
  await p.locator(`button:visible:has-text("${paso}")`).first().click({ timeout: 9000 });
  await p.waitForTimeout(650);
}
/*
 * La puerta de Aprender no se llama igual en todas las tarjetas: unas dicen
 * «El material que explica» y otras «Aprender N actividades». La sonda
 * prueba las dos antes de rendirse; con una sola se quedaba fuera de T4 y
 * devolvía un cero que parecía un aprobado.
 */
/*
 * `--hacer` mide el camino de Hacer en vez de Aprender. Lo añado porque dije
 * «Contabilidad entera sin fallos de contraste» midiendo solo Aprender, y eso
 * es escribir «pasa» en vez de «pasan estas»: la mitad de cada tema son los
 * juegos, y de esos no había dato.
 */
const HACER = process.argv.includes("--hacer") || process.argv.includes("--partidas");
const PARTIDAS = process.argv.includes("--partidas");
const entro = await (async () => {
  for (const rotulo of HACER ? ["Los juegos que dan FP", "Hacer"] : ["El material que explica", "Aprender"]) {
    const puerta = p.locator(`button:visible:has-text("${rotulo}")`);
    if ((await puerta.count()) === 0) continue;
    await puerta.first().click({ timeout: 9000 }).catch(() => {});
    await p.waitForTimeout(700);
    /*
     * Haber entrado se comprueba distinto en cada mitad: en Aprender hay un
     * botón de avanzar; en Hacer se cae en el camino, que no tiene ninguno y
     * sí tiene los nodos de las actividades.
     */
    const dentro = HACER
      ? (await p.locator("[data-nodo], .fae-ch-estrecho").count()) > 0
      : (await p.locator(AVANCE).count()) > 0;
    if (dentro) return rotulo;
  }
  return null;
})();
if (!entro) {
  console.log(`NO MEDIDO: no encontré la puerta de Aprender en «${TEMA}».`);
  await b.close();
  process.exit(2);
}

const vistos = new Map();
const sinMedir = new Set();
let pantallas = 0;
/*
 * En Hacer, el camino no es el juego. `--partidas` entra en cada actividad,
 * juega unas cuantas pantallas tocando lo primero que haya y vuelve al
 * camino. No pretende jugar bien: pretende PINTAR las pantallas para poder
 * medirlas. Lo que no se pinta no se mide, y hasta hoy de las partidas no
 * había ni un dato.
 */
if (HACER && PARTIDAS) {
  const nodos = await p.locator("[data-nodo], .fae-ch-estrecho .fae-ch-rotulo").count();
  for (let k = 0; k < Math.min(nodos, 12); k++) {
    const punto = await p.evaluate((i) => {
      const e = [...document.querySelectorAll("[data-nodo], .fae-ch-estrecho .fae-ch-rotulo")][i];
      if (!e) return null;
      const r = e.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return null;
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }, k);
    if (!punto) continue;
    await p.mouse.click(punto.x, punto.y);
    await p.waitForTimeout(900);
    for (let paso = 0; paso < 6; paso++) {
      pantallas++;
      const tanda = await p.evaluate(MEDIR);
      for (const m of tanda.malos) { const clave = `${m.r}|${m.px}|${m.texto}`; if (!vistos.has(clave)) vistos.set(clave, m); }
      for (const t of tanda.sinMedir) sinMedir.add(t);
      /* Tocar lo primero que se pueda: una opción, una ficha, o el avance. */
      const toque = await p.evaluate(() => {
        const cand = [...document.querySelectorAll("[data-opcion], [data-caso], [data-destino], [data-casilla], button")]
          .filter((e) => { const r = e.getBoundingClientRect(); return r.height > 10 && r.width > 10 && !/volver|pausar|cómo se juega/i.test(e.innerText || ""); });
        if (!cand.length) return null;
        const e = cand[0]; const r = e.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      });
      if (!toque) break;
      await p.mouse.click(toque.x, toque.y);
      await p.waitForTimeout(500);
    }
    await p.goBack().catch(() => {});
    await p.waitForTimeout(700);
  }
}
for (let i = 0; i < (HACER ? 1 : 30); i++) {
  pantallas++;
  const tanda = await p.evaluate(MEDIR);
  for (const m of tanda.malos) {
    const clave = `${m.r}|${m.px}|${m.texto}`;
    if (!vistos.has(clave)) vistos.set(clave, m);
  }
  for (const t of tanda.sinMedir) sinMedir.add(t);
  const sig = p.locator(AVANCE);
  if ((await sig.count()) === 0) break;
  await sig.first().click({ timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(340);
}
await b.close();

const malos = [...vistos.values()].sort((a, b2) => a.r - b2.r);
for (const m of malos) {
  console.log(`  ${String(m.r).padStart(5)}:1  (pide ${m.piso})  ${String(m.px).padStart(5)}px/${m.peso}  <${m.etiqueta}>  «${m.texto}»\n          texto ${m.color}  sobre ${m.fondo}  ·  ${m.donde}`);
}
console.log(`\n${malos.length} texto(s) por debajo del contraste que pide su tamaño, en ${pantallas} pantalla(s) de «${TEMA}» a ${ANCHO} px.`);
/*
 * Un cero sobre una pantalla no es un cero: quiere decir que no entré. Lo
 * digo fuerte porque «0 textos ... en 1 pantalla» se lee como éxito, y es
 * justo el error que esta casa tiene escrito con nombre: no medido no es lo
 * mismo que limpio.
 */
if (pantallas <= 1 && !HACER) {
  console.log("NO MEDIDO: solo llegué a 1 pantalla, así que este cero no vale. Mira si el tema abre con otro rótulo.");
  process.exit(2);
}
if (sinMedir.size) {
  console.log(`${sinMedir.size} texto(s) NO MEDIDOS: su color es transparente, así que el color real no sale de aquí.`);
  console.log(`  ${[...sinMedir].slice(0, 6).map((t) => `«${t}»`).join("  ")}`);
}
process.exit(malos.length === 0 ? 0 : 1);
