#!/usr/bin/env node
/**
 * canon.mjs — el buscador del canon.
 *
 * POR QUÉ EXISTE
 * El canon pesa unos 63.000 tokens. Abrir `kit.md` entero para ver qué dice
 * D4 cuesta 13.000; esta búsqueda cuesta unas decenas. Y lo que un agente
 * mete en su contexto no se paga una vez: se vuelve a leer en cada turno que
 * siga. Por eso la regla es buscar primero y abrir el archivo solo cuando se
 * vaya a editar.
 *
 * USO
 *   node scripts/canon.mjs "D4"                 busca D4 en el canon
 *   node scripts/canon.mjs "encaje" -c 6        con 6 líneas de contexto
 *   node scripts/canon.mjs "migraciones" -f nocturno   solo en ese archivo
 *   node scripts/canon.mjs --mapa               qué archivos hay y de qué tratan
 *   node scripts/canon.mjs "320" -n 40          hasta 40 coincidencias
 *   node scripts/canon.mjs "r5-3" --todo        incluye paquetes, fichas y registros
 *
 * Acentos y mayúsculas dan igual: "auditoria" encuentra "auditoría".
 *
 * NÚCLEO Y MATERIAL
 * Por defecto busca en el NÚCLEO: las reglas que gobiernan el trabajo (el Kit,
 * el enganche, el mapa de choques, los prompts maestros, el vocabulario, los
 * traspasos y el estado). El MATERIAL de trabajo —los 176 paquetes, las fichas,
 * los registros de cifras y las revisiones— solo entra con `--todo`, porque
 * buscar ahí devuelve el ejemplo de una pieza concreta cuando lo que se
 * pregunta es la regla general.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const CARPETAS = ["orquestador/conocimiento", "orquestador/traspasos", "orquestador/estado"];
const TOPE_LINEA = 220; // una línea larguísima no se lleva el ahorro por delante

/* Material de trabajo: ejemplos y registros, no reglas. Fuera salvo --todo. */
const MATERIAL = /^orquestador\/conocimiento\/(paquetes|fichas|revisiones|mapas)\//;
const esMaterial = (f) => MATERIAL.test(f) || /registro-cifras/.test(f);

/* Quita acentos y baja a minúscula: en español, buscar sin acentos es lo normal. */
const plano = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/* Un término corto como "D4" o "T7" cae dentro de cualquier URL o id y devuelve
 * basura: la primera prueba de esto sacó la fila de un general porque el enlace
 * de su chat llevaba "d7" dentro. Para términos cortos exigimos palabra
 * completa; para los largos basta que esté contenido. */
function hacerCoincidencia(termino) {
  const aguja = plano(termino);
  if (aguja.length <= 4 && /^[a-z0-9.-]+$/.test(aguja)) {
    const re = new RegExp(`(^|[^a-z0-9])${aguja.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`);
    return (linea) => re.test(plano(linea));
  }
  return (linea) => plano(linea).includes(aguja);
}

function archivos(dir) {
  const salida = [];
  let entradas;
  try {
    entradas = readdirSync(join(RAIZ, dir));
  } catch {
    return salida;
  }
  for (const e of entradas) {
    const rel = join(dir, e);
    const abs = join(RAIZ, rel);
    if (statSync(abs).isDirectory()) salida.push(...archivos(rel));
    else if (/\.(md|json)$/.test(e)) salida.push(rel);
  }
  return salida;
}

const TODOS = CARPETAS.flatMap(archivos).sort();
const INCLUYE_MATERIAL = process.argv.includes("--todo");
const AMBITO = TODOS.filter((f) => INCLUYE_MATERIAL || !esMaterial(f));

const pesoTok = (f) => Math.round(readFileSync(join(RAIZ, f), "utf8").length / 3.5);

/* De qué trata un archivo: su description de frontmatter, o su primer título.
 * Sin esto el mapa enseña "id: celulas", que no le dice nada a nadie. */
function primeraLineaUtil(txt) {
  let lineas = txt.split("\n");
  if (lineas[0]?.trim() === "---") {
    const cierre = lineas.slice(1).findIndex((l) => l.trim() === "---");
    const frente = lineas.slice(1, cierre + 1);
    const desc = frente.find((l) => /^description:/.test(l));
    if (desc) return desc.replace(/^description:\s*/, "").trim();
    lineas = lineas.slice(cierre + 2);
  }
  const l = lineas.find(
    (x) => x.trim() && !x.startsWith("/*") && !x.startsWith(" *") && !x.startsWith("---"),
  );
  return (l || "").replace(/^#+\s*/, "").replace(/^>\s*/, "").trim();
}

/* --mapa: el índice. El núcleo archivo por archivo; el material solo contado. */
function mapa() {
  const nucleo = TODOS.filter((f) => !esMaterial(f));
  const material = TODOS.filter(esMaterial);
  console.log(`CANON — NÚCLEO (${nucleo.length} archivos)\n`);
  let total = 0;
  for (const f of nucleo) {
    const txt = readFileSync(join(RAIZ, f), "utf8");
    const tok = Math.round(txt.length / 3.5);
    total += tok;
    const titulo = primeraLineaUtil(txt);
    console.log(`${String(tok).padStart(6)} tok  ${f}\n              ${titulo.slice(0, 88)}`);
  }
  const tokMaterial = material.reduce((s, f) => s + pesoTok(f), 0);
  console.log(`\n${total} tokens de núcleo.`);
  console.log(
    `MATERIAL: ${material.length} archivos más (paquetes, fichas, registros, revisiones), ` +
      `${tokMaterial} tokens. Se busca ahí con --todo.`,
  );
  console.log("\nBusca en vez de abrir: abrir el Kit entero cuesta lo que 400 búsquedas.");
}

/* La búsqueda. Devuelve archivo:línea más contexto, y corta en el tope. */
function buscar(termino, { contexto, tope, filtro }) {
  const coincide = hacerCoincidencia(termino);
  let hallazgos = 0;
  let archivosConAlgo = 0;

  for (const f of AMBITO) {
    if (filtro && !plano(f).includes(plano(filtro))) continue;
    const lineas = readFileSync(join(RAIZ, f), "utf8").split("\n");
    const golpes = [];
    for (let i = 0; i < lineas.length; i++) if (coincide(lineas[i])) golpes.push(i);
    if (!golpes.length) continue;

    /* Une los golpes cercanos en un solo bloque, para no repetir contexto. */
    const bloques = [];
    for (const g of golpes) {
      const ult = bloques[bloques.length - 1];
      if (ult && g - ult.fin <= contexto * 2) ult.fin = g;
      else bloques.push({ ini: g, fin: g });
    }

    archivosConAlgo++;
    console.log(`\n── ${f}`);
    for (const b of bloques) {
      if (hallazgos >= tope) {
        console.log(`   … cortado en ${tope} coincidencias. Usa -n para subir el tope.`);
        return { hallazgos, archivosConAlgo };
      }
      const desde = Math.max(0, b.ini - contexto);
      const hasta = Math.min(lineas.length - 1, b.fin + contexto);
      for (let i = desde; i <= hasta; i++) {
        const esGolpe = coincide(lineas[i]);
        const marca = esGolpe ? "›" : " ";
        console.log(`${marca}${String(i + 1).padStart(5)}  ${lineas[i].slice(0, TOPE_LINEA)}`);
      }
      hallazgos++;
    }
  }
  return { hallazgos, archivosConAlgo };
}

/* ── argumentos ── */
const args = process.argv.slice(2);
if (!args.length || args[0] === "--ayuda" || args[0] === "-h") {
  console.log(readFileSync(new URL(import.meta.url).pathname, "utf8").split("*/")[0]);
  process.exit(0);
}
if (args[0] === "--mapa") {
  mapa();
  process.exit(0);
}

const leerOpcion = (banderas, pordefecto) => {
  for (const b of banderas) {
    const i = args.indexOf(b);
    if (i !== -1 && args[i + 1]) return args[i + 1];
  }
  return pordefecto;
};
const contexto = parseInt(leerOpcion(["-c", "--contexto"], "2"), 10);
const tope = parseInt(leerOpcion(["-n", "--tope"], "20"), 10);
const filtro = leerOpcion(["-f", "--archivo"], null);
const termino = args.filter(
  (a, i) =>
    !a.startsWith("-") &&
    !["-c", "--contexto", "-n", "--tope", "-f", "--archivo"].includes(args[i - 1]),
)[0];

if (!termino) {
  console.error("Falta qué buscar. Ejemplo: node scripts/canon.mjs \"D4\"");
  process.exit(1);
}

const { hallazgos, archivosConAlgo } = buscar(termino, { contexto, tope, filtro });
if (!hallazgos) {
  console.log(
    `Sin coincidencias de "${termino}" en el ${INCLUYE_MATERIAL ? "canon" : "núcleo del canon"}.\n` +
      (INCLUYE_MATERIAL
        ? `Prueba otra palabra, o "node scripts/canon.mjs --mapa" para ver qué hay.`
        : `Prueba con --todo (incluye paquetes, fichas y registros) u otra palabra.`),
  );
  process.exit(2);
}
console.log(
  `\n${hallazgos} bloque(s) en ${archivosConAlgo} archivo(s)` +
    (INCLUYE_MATERIAL ? " (núcleo y material)." : ". Con --todo busca también en el material."),
);
