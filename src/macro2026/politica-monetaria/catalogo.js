/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · T4 POLÍTICA MONETARIA — EL CATÁLOGO DE LAS 13 PIEZAS
 *
 * En el orden del camino (§1 de la especificación de Gen). Mateo pidió
 * publicar a medida que se termina (lote 5): las 13 van en PUBLICADAS_T4, y
 * las Hacer llevan su fila en
 * supabase/migrations/0273_pm26_t4_politica_monetaria.sql.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MATERIA = "macroeconomia";
export const TEMA = "politica-monetaria";

const A = "aprender";
const H = "hacer";
const hacer = (dificultad, fpBase, { etapas = 1, modalidad = "evaluativa" } = {}) => ({
  tipo: H, modalidad, dificultad, fpBase, ...(etapas > 1 ? { etapas } : {}),
});

export const PIEZAS_T4 = [
  { id: "pm26-a1-billetera", tipo: A, nombre: "Lo que llevas en la billetera", subtemas: ["pm-apertura", "pm-formas-dinero"] },
  { id: "pm26-a2-ventanilla", tipo: A, nombre: "La ventanilla del BanRep", subtemas: ["pm-creacion-primaria"] },
  { id: "pm26-h1-entra-sale", tipo: H, nombre: "¿Entra o sale dinero?", subtemas: ["pm-preguntas-balance", "pm-creacion-primaria", "pm-creacion-secundaria"], clasificacion: hacer("medio", 25) },
  { id: "pm26-a3-cascada", tipo: A, nombre: "La cascada de vasos", subtemas: ["pm-creacion-secundaria"] },
  { id: "pm26-h2-cascada-meta", tipo: H, nombre: "Ajusta la cascada", subtemas: ["pm-creacion-secundaria", "pm-instrumentos"], clasificacion: hacer("facil", 10, { etapas: 3 }) },
  { id: "pm26-a4-cajas", tipo: A, nombre: "Bóveda y cajas", subtemas: ["pm-agregados"] },
  { id: "pm26-h3-cajas", tipo: H, nombre: "Cada depósito a su caja", subtemas: ["pm-agregados", "pm-formas-dinero"], clasificacion: hacer("medio", 25) },
  { id: "pm26-a5-precio-dinero", tipo: A, nombre: "El precio del dinero", subtemas: ["pm-mercado-dinero"] },
  { id: "pm26-h4-mueve-tasa", tipo: H, nombre: "Mueve la curva, mira la tasa", subtemas: ["pm-mercado-dinero"], clasificacion: hacer("medio", 25) },
  { id: "pm26-a6-palancas", tipo: A, nombre: "Tres palancas", subtemas: ["pm-naturaleza", "pm-instrumentos", "pm-medidas"] },
  { id: "pm26-h6-domino", tipo: H, nombre: "El dominó de la tasa", subtemas: ["pm-impactos", "pm-medidas", "pm-apertura", "pm-instrumentos", "pm-creacion-secundaria"], clasificacion: hacer("medio", 25) },
  { id: "pm26-a7-termostato", tipo: A, nombre: "El termostato", subtemas: ["pm-caso-inflacion-tasa"] },
  { id: "pm26-h5-junta", tipo: H, nombre: "La Junta decide", subtemas: ["pm-medidas", "pm-instrumentos", "pm-caso-inflacion-tasa"], clasificacion: hacer("dificil", 50) },
];

export const HACER_T4 = PIEZAS_T4.filter((p) => p.tipo === H);
export const piezaT4 = (id) => PIEZAS_T4.find((p) => p.id === id) ?? null;

/* El interruptor de publicación, uno por pieza. Lote 5 (23-nov-2026): las 13. */
export const PUBLICADAS_T4 = Object.freeze(PIEZAS_T4.map((p) => p.id));
export const estaPublicadaT4 = (id) => PUBLICADAS_T4.includes(id);
export const piezasPublicadasT4 = () => PIEZAS_T4.filter((p) => estaPublicadaT4(p.id));
