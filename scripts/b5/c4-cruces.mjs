/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · LOS CRUCES DE B CON T3 Y T4 (Célula B, lote 5). SOLO MIDE.
 *
 *   node --import ./scripts/cargador-jsx.mjs scripts/b5/c4-cruces.mjs > cruces.json
 *
 * Junta todo el texto que ve el estudiante en las piezas de B (T5 y T6: sus
 * Aprender y sus Hacer, de los módulos de datos de main, igual que
 * b5-recorrido-t5-t6.mjs) y lo compara con el de T3 y T4:
 *   · T3, de sus módulos de datos (src/data/contabilidadTema3*.js y su «Así
 *     se juega»);
 *   · T4, de sus módulos de datos (A0, A1, H1) y de los paquetes de la Célula
 *     D (orquestador/conocimiento/paquetes/d4-t4-*.md), porque casi todo T4
 *     todavía no está en el código.
 * Nada se copia a mano: cada texto sale de los módulos o de los paquetes.
 *
 * Tres señales, para que una persona decida qué es «el mismo ejemplo»:
 *   1. frases compartidas: 5 palabras seguidas iguales (sin tildes ni signos);
 *   2. cifras compartidas: el mismo monto de 4 dígitos o más;
 *   3. conceptos: un ejemplo o una decisión de B, buscado por sus palabras
 *      clave en T3 y en T4 (la lista CONCEPTOS, abajo).
 * Sale un JSON con las tres; el informe es orquestador/conocimiento/revisiones/b5-c4-cruces.md.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "../..");
const DATOS = join(RAIZ, "src/data");
const PAQUETES = join(RAIZ, "orquestador/conocimiento/paquetes");

/* Todos los textos de un módulo: cada cadena de sus exportaciones, recorridas a fondo. */
async function textosDeModulo(archivo) {
  const m = await import(join(DATOS, archivo));
  const salida = [];
  const vistos = new Set();
  const ir = (x, ruta) => {
    if (typeof x === "string") { if (/[a-záéíóúñ]{3}/i.test(x) && x.split(/\s+/).length >= 3) salida.push({ ruta, texto: x }); return; }
    if (typeof x === "function" || x === null || typeof x !== "object" || vistos.has(x)) return;
    vistos.add(x);
    for (const [k, v] of Object.entries(x)) ir(v, `${ruta}.${k}`);
  };
  for (const [k, v] of Object.entries(m)) ir(v, k);
  return salida.map((t) => ({ ...t, fuente: archivo }));
}

/* Los textos de un paquete en Markdown: cada línea con letras, sin el marcado. */
function textosDePaquete(archivo) {
  return readFileSync(join(PAQUETES, archivo), "utf8").split("\n")
    .map((l, i) => ({ ruta: `línea ${i + 1}`, texto: l.replace(/[*_`#>|]/g, " ").replace(/\s+/g, " ").trim() }))
    .filter((t) => t.texto.split(" ").length >= 4)
    .map((t) => ({ ...t, fuente: `paquetes/${archivo}` }));
}

const B_MODULOS = ["contabilidadT5Pieza1.js", "contabilidadT5Pieza2.js", "contabilidadT5Act1.js", "contabilidadT5Act2.js",
  ...[1, 2, 3, 4, 5].map((n) => `contabilidadT6Pieza${n}.js`), ...[1, 2, 3, 4, 5, 6].map((n) => `contabilidadT6Act${n}.js`)];
const T3_MODULOS = readdirSync(DATOS).filter((f) => /^contabilidadTema3.*\.js$/.test(f) || f === "asiSeJuegaTema3.js");
const T4_MODULOS = readdirSync(DATOS).filter((f) => /^contabilidadT4.*\.js$/.test(f) || f === "asiSeJuegaT4.js");
const T4_PAQUETES = readdirSync(PAQUETES).filter((f) => /^d4-t4-.*\.md$/.test(f));

const B = (await Promise.all(B_MODULOS.map(textosDeModulo))).flat();
const T3 = (await Promise.all(T3_MODULOS.map(textosDeModulo))).flat();
const T4 = [...(await Promise.all(T4_MODULOS.map(textosDeModulo))).flat(), ...T4_PAQUETES.flatMap(textosDePaquete)];

const plano = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9$.\s]/g, " ").replace(/\s+/g, " ").trim();
const palabras = (s) => plano(s).split(" ").filter((w) => w && !/^[.$]+$/.test(w));
const tejas = (s, n = 5) => { const w = palabras(s); const r = new Set(); for (let i = 0; i + n <= w.length; i++) r.add(w.slice(i, i + n).join(" ")); return r; };
/* Las frases de 5 palabras que no dicen nada de un ejemplo (rótulos de interfaz, fórmulas del libro). */
const VACIAS = /^(basado en el libro|contabilidad financiera|en el debe y|el debe y el haber)/;
const cifras = (s) => new Set([...s.matchAll(/\$?\s?(\d{1,3}(?:\.\d{3})+|\d{4,})/g)].map((m) => m[1].replace(/\./g, "")).filter((n) => Number(n) >= 1000 && !/^(19|20)\d\d$/.test(n)));

function cruces(otro) {
  const indice = new Map();
  for (const t of otro) for (const s of tejas(t.texto)) { if (VACIAS.test(s)) continue; if (!indice.has(s)) indice.set(s, []); indice.get(s).push(t); }
  const frases = [];
  for (const b of B) {
    const comunes = [...tejas(b.texto)].filter((s) => indice.has(s));
    if (comunes.length) frases.push({ b: `${b.fuente} · ${b.ruta}`, textoB: b.texto.slice(0, 200), comunes: comunes.slice(0, 4), en: [...new Set(comunes.flatMap((s) => indice.get(s).map((t) => `${t.fuente} · ${t.ruta}`)))].slice(0, 4) });
  }
  const montos = new Map();
  for (const t of otro) for (const c of cifras(t.texto)) { if (!montos.has(c)) montos.set(c, []); montos.get(c).push(`${t.fuente} · ${t.ruta}`); }
  const cifrasComunes = [];
  for (const b of B) for (const c of cifras(b.texto)) if (montos.has(c)) cifrasComunes.push({ cifra: c, b: `${b.fuente} · ${b.ruta}`, en: [...new Set(montos.get(c))].slice(0, 3) });
  return { frases, cifras: cifrasComunes };
}

/* Los ejemplos y las decisiones de B, por sus palabras clave (sin tildes). */
const CONCEPTOS = {
  "cheque devuelto": /cheque devuelto|cheque.{0,40}devuel/,
  "nota débito": /nota debito/,
  "nota crédito": /nota credito/,
  "consignación": /consign/,
  "venta a crédito / a plazos": /(vend|venta).{0,40}(a credito|a plazos|fiad)/,
  "cobro a un cliente (Caja contra Clientes)": /(cobr|pag).{0,60}client|client.{0,60}(pag|cobr)/,
  "devolución de mercancía": /devoluci/,
  "descuento por pronto pago": /descuento.{0,30}(pronto pago|por pagar)|pronto pago/,
  "préstamo a un socio o trabajador": /(prest|plata).{0,60}(socio|trabajador|emplead)/,
  "anticipo": /anticip/,
  "intereses (ingreso)": /interes/,
  "CDT / título / inversión": /\bcdt\b|titulo|inversion/,
  "dividendos": /dividend/,
  "provisión / incobrable / castigo": /provision|incobrable|castig/,
  "valor neto / saldo": /valor neto/,
  "gasto (cuándo se reconoce)": /gasto.{0,40}(periodo|se reconoce|se causa)/,
  "ajuste al cierre (31 de diciembre)": /31 de diciembre|al cierre/,
};
function conceptos() {
  const enDonde = (lista, rx) => lista.filter((t) => rx.test(plano(t.texto))).map((t) => ({ donde: `${t.fuente} · ${t.ruta}`, texto: t.texto.slice(0, 180) }));
  return Object.fromEntries(Object.entries(CONCEPTOS).map(([k, rx]) => [k, { B: enDonde(B, rx).length, T3: enDonde(T3, rx), T4: enDonde(T4, rx), ejemploB: enDonde(B, rx).slice(0, 3) }]));
}

console.log(JSON.stringify({
  corpus: { B: B.length, T3: T3.length, T4: T4.length, modulosB: B_MODULOS, modulosT3: T3_MODULOS, modulosT4: T4_MODULOS, paquetesT4: T4_PAQUETES },
  T3: cruces(T3), T4: cruces(T4), conceptos: conceptos(),
}, null, 1));
