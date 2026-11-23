/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · T2 POLÍTICA ECONÓMICA — EL CATÁLOGO DE LAS 10 PIEZAS
 *
 * En el orden del camino (§1 de la especificación de Gen). Igual que T1: NO
 * está en src/data/subjects.js, y nada se ve hasta que Mateo apruebe cada
 * pieza. Se publica por partes: el id aprobado se anota en PUBLICADAS_T2. Una
 * Aprender no lleva fila en actividad_catalogo ni FP, así que se publica sola;
 * una Hacer necesita además su fila (supabase/macro2026-pendientes/0271_*.sql
 * → supabase/migrations). La prueba t2-textos-y-bancos.test.mjs ata las copias.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MATERIA = "macroeconomia";
export const TEMA = "politica-economica";

const A = "aprender";
const H = "hacer";
const hacer = (dificultad, fpBase, { etapas = 1, modalidad = "evaluativa" } = {}) => ({
  tipo: H, modalidad, dificultad, fpBase, ...(etapas > 1 ? { etapas } : {}),
});

export const PIEZAS_T2 = [
  { id: "pe26-a1-mecanico", tipo: A, nombre: "¿Mecánico o te arreglas solo?", subtemas: ["pe-autorregulacion", "pe-problemas"] },
  { id: "pe26-a2-fiebre", tipo: A, nombre: "La economía con fiebre", subtemas: ["pe-problemas"] },
  { id: "pe26-a3-problema-resuelto", tipo: A, nombre: "El problema, resuelto", subtemas: ["pe-objetivos"] },
  { id: "pe26-h3-cables", tipo: H, nombre: "Conecta los cables", subtemas: ["pe-ramas", "pe-da-ramas"], clasificacion: hacer("medio", 25) },
  { id: "pe26-a4-perillas", tipo: A, nombre: "Las perillas de la demanda", subtemas: ["pe-ramas", "pe-da-ramas"] },
  { id: "pe26-a5-escalera", tipo: A, nombre: "La escalera de la política", subtemas: ["pe-ambitos"] },
  { id: "pe26-h1-seis-cajones", tipo: H, nombre: "Seis peldaños", subtemas: ["pe-ambitos"], clasificacion: hacer("medio", 25) },
  { id: "pe26-h2-grupo-logico", tipo: H, nombre: "Arma el grupo lógico", subtemas: ["pe-ambitos", "pe-taller"], clasificacion: hacer("dificil", 50, { etapas: 3 }) },
  { id: "pe26-h4-expediente", tipo: H, nombre: "El peldaño que no encaja", subtemas: ["pe-ambitos", "pe-taller"], clasificacion: hacer("dificil", 50) },
  { id: "pe26-h5-dos-fiebres", tipo: H, nombre: "Un paciente, dos fiebres", subtemas: ["pe-da-ramas", "pe-objetivos", "pe-ramas"], clasificacion: hacer("medio", 25, { modalidad: "exploratoria" }) },
];

export const HACER_T2 = PIEZAS_T2.filter((p) => p.tipo === H);
export const piezaT2 = (id) => PIEZAS_T2.find((p) => p.id === id) ?? null;

/* El interruptor de publicación, uno por pieza. */
export const PUBLICADAS_T2 = Object.freeze([
  /* Lote 2 (23-nov-2026): las cinco Aprender. */
  "pe26-a1-mecanico",
  "pe26-a2-fiebre",
  "pe26-a3-problema-resuelto",
  "pe26-a4-perillas",
  "pe26-a5-escalera",
  /* Lote 3 (23-nov-2026): las cinco Hacer, con su fila en la 0271. */
  "pe26-h3-cables",
  "pe26-h1-seis-cajones",
  "pe26-h2-grupo-logico",
  "pe26-h4-expediente",
  "pe26-h5-dos-fiebres",
]);
export const estaPublicadaT2 = (id) => PUBLICADAS_T2.includes(id);
export const piezasPublicadasT2 = () => PIEZAS_T2.filter((p) => estaPublicadaT2(p.id));
