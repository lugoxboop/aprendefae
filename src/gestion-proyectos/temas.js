/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · LOS TEMAS, ARMADOS COMO LOS DE MACROECONOMÍA
 *
 * Pedido de Mateo (28-nov-2026): «mira la estructura de Macroeconomía y
 * aplícala». Cada módulo de estructura.js es un TEMA con sus dos mitades:
 *   · Aprender: la lista de piezas (microvideos, simulador) y, para cada
 *     proceso que aún no tiene su lección, una fila «Próximamente» en orden.
 *     Nada se inventa: la fila dice qué proceso de la guía va ahí.
 *   · Hacer: el camino de retos, partido por capítulo de la guía para que
 *     cada camino tenga el tamaño de uno de Macro (6 a 12 nodos).
 *
 * Solo lee catalogo.js, estructura.js y Hacer.jsx: no cambia ids, ni filas
 * del servidor, ni lo publicado.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { AREAS, MODULOS, SUBTEMAS } from "./estructura.js";
import { PIEZAS, estaPublicada } from "./catalogo.js";
import { MICROVIDEOS } from "./microvideos.js";

export const MODULO_IDS = MODULOS.map((m) => m.id);
export const esModulo = (id) => MODULO_IDS.includes(id);
export const moduloDe = (id) => MODULOS.find((m) => m.id === id) ?? null;

/* Los capítulos de la guía, con el nombre que se le muestra al estudiante. */
const NOMBRE_CAPITULO = {
  1: "Introducción",
  2: "El entorno de los proyectos",
  3: "El rol del director del proyecto",
};
for (const a of Object.values(AREAS)) NOMBRE_CAPITULO[a.cap] = a.nombre;
export const nombreCapitulo = (cap) => NOMBRE_CAPITULO[cap] ?? `Capítulo ${cap}`;

/* El capítulo de un subtema: «gp-c3-rol» → 3; «gp-11-2» → 11. */
export function capituloDeSubtema(id) {
  const m = /^gp-c(\d+)-/.exec(id) ?? /^gp-(\d+)-/.exec(id);
  return m ? Number(m[1]) : null;
}

/* El capítulo de una pieza: el del id si lo trae (-c05-), si no el de su primer subtema. */
export function capituloDePieza(pz) {
  const m = /-c(\d\d)-/.exec(pz.id);
  if (m) return Number(m[1]);
  return capituloDeSubtema(pz.subtemas?.[0] ?? "") ?? 0;
}

/*
 * Las Hacer visibles de un módulo agrupadas por capítulo, en el orden de la
 * guía y, dentro de cada uno, en el orden del camino. `visibles` es la lista
 * que ya decide Hacer.jsx (publicadas y con componente).
 */
export function gruposDeHacer(visibles) {
  const porCap = new Map();
  for (const pz of visibles) {
    const cap = capituloDePieza(pz);
    if (!porCap.has(cap)) porCap.set(cap, []);
    porCap.get(cap).push(pz);
  }
  return [...porCap.entries()].sort((a, b) => a[0] - b[0]).map(([cap, piezas]) => ({ cap, nombre: nombreCapitulo(cap), piezas }));
}

/*
 * El simulador «Arma tu acta» (#/gestion-proyectos/acta) es una pieza de
 * Aprender del proceso 4.1, así que vive en el tema Inicio.
 */
export const SIMULADORES = {
  "gp-inicio": [{ id: "gp26-ini-simulador-acta", nombre: "Arma el acta de constitución de tu proyecto", subtemas: ["gp-4-1"], simulador: "acta" }],
};

/*
 * Lo de Aprender de un módulo, en orden:
 *   listas      → las piezas que se abren (microvideo o simulador);
 *   proximas    → un proceso por fila, los que aún no tienen ninguna pieza de
 *                 Aprender, agrupados por capítulo.
 */
export function aprenderDeModulo(moduloId) {
  const mod = moduloDe(moduloId);
  const reales = (PIEZAS[moduloId] ?? [])
    .filter((pz) => pz.tipo === "aprender" && estaPublicada(pz.id) && MICROVIDEOS[pz.id])
    .map((pz) => ({ ...pz, clase: "video", video: MICROVIDEOS[pz.id] }));
  const sims = (SIMULADORES[moduloId] ?? []).map((s) => ({ ...s, clase: "simulador" }));
  const listas = [...reales, ...sims];
  const cubiertos = new Set(listas.flatMap((p) => p.subtemas ?? []));
  const pendientes = (mod?.procesos ?? []).filter((pr) => !cubiertos.has(pr.id));
  const porCap = new Map();
  for (const pr of pendientes) {
    const cap = capituloDeSubtema(pr.id) ?? 0;
    if (!porCap.has(cap)) porCap.set(cap, []);
    porCap.get(cap).push(pr);
  }
  const proximas = [...porCap.entries()].sort((a, b) => a[0] - b[0]).map(([cap, procesos]) => ({ cap, nombre: nombreCapitulo(cap), procesos }));
  return { listas, proximas, totalProximas: pendientes.length };
}

export const subtemaPorId = (id) => SUBTEMAS.find((s) => s.id === id) ?? null;
