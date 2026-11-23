/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · T3 POLÍTICA FISCAL — EL CATÁLOGO DE LAS 11 PIEZAS
 *
 * En el orden del camino (§1 de la especificación de Gen). Igual que T1 y T2:
 * nada se ve hasta que Mateo apruebe cada pieza, y el id aprobado se anota en
 * PUBLICADAS_T3. Una Hacer necesita además su fila
 * (supabase/macro2026-pendientes/0272_*.sql → supabase/migrations).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MATERIA = "macroeconomia";
export const TEMA = "politica-fiscal";

const A = "aprender";
const H = "hacer";
const hacer = (dificultad, fpBase, { etapas = 1, modalidad = "evaluativa" } = {}) => ({
  tipo: H, modalidad, dificultad, fpBase, ...(etapas > 1 ? { etapas } : {}),
});

export const PIEZAS_T3 = [
  { id: "pf26-a1-lupa", tipo: A, nombre: "La lupa de seis caras", subtemas: ["pe-marco-analisis", "pf-naturaleza"] },
  { id: "pf26-a2-buzones", tipo: A, nombre: "Tres buzones", subtemas: ["pf-instrumentos"] },
  { id: "pf26-h1-moneda", tipo: H, nombre: "Echa la moneda", subtemas: ["pf-instrumentos", "pf-tributacion-casos"], clasificacion: hacer("facil", 10) },
  { id: "pf26-a3-cajeros", tipo: A, nombre: "Dos cajeros", subtemas: ["pf-impuestos"] },
  { id: "pf26-h2-cajero", tipo: H, nombre: "¿Qué cajero te cobra?", subtemas: ["pf-impuestos"], clasificacion: hacer("facil", 10) },
  { id: "pf26-h3-factura", tipo: H, nombre: "La factura con lupa", subtemas: ["pf-tributacion-casos", "pf-impuestos"], clasificacion: hacer("medio", 25, { etapas: 3 }) },
  { id: "pf26-a4-tanque", tipo: A, nombre: "El tanque del Estado", subtemas: ["pf-instrumentos", "pf-gasto-casos", "pf-deuda-casos"] },
  { id: "pf26-h5-montanas", tipo: H, nombre: "Las dos montañas", subtemas: ["pf-deuda-casos", "pf-impactos"], clasificacion: hacer("medio", 25) },
  { id: "pf26-a5-balanza", tipo: A, nombre: "La balanza fiscal", subtemas: ["pf-medidas", "pf-en-da", "pf-impactos"] },
  { id: "pf26-h4-expande", tipo: H, nombre: "¿Expande o contrae?", subtemas: ["pf-medidas", "pf-en-da"], clasificacion: hacer("medio", 25) },
  { id: "pf26-h6-memo", tipo: H, nombre: "El memo de la gerencia", subtemas: ["pf-impactos", "pf-preparcial", "pf-medidas"], clasificacion: hacer("dificil", 50) },
];

export const HACER_T3 = PIEZAS_T3.filter((p) => p.tipo === H);
export const piezaT3 = (id) => PIEZAS_T3.find((p) => p.id === id) ?? null;

/* El interruptor de publicación, uno por pieza. Vacío hasta que Mateo apruebe. */
export const PUBLICADAS_T3 = Object.freeze([]);
export const estaPublicadaT3 = (id) => PUBLICADAS_T3.includes(id);
export const piezasPublicadasT3 = () => PIEZAS_T3.filter((p) => estaPublicadaT3(p.id));
