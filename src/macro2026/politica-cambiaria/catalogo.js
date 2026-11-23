/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · T5 POLÍTICA CAMBIARIA — EL CATÁLOGO DE LAS 13 PIEZAS
 *
 * En el orden del camino (§1 de la especificación de Gen). Tema nuevo en la
 * plataforma, después de Política monetaria. Se publica al terminar (lote 6):
 * las 13 van en PUBLICADAS_T5, y las Hacer llevan su fila en
 * supabase/migrations/0274_pc26_t5_politica_cambiaria.sql. Ninguna va por
 * etapas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MATERIA = "macroeconomia";
export const TEMA = "politica-cambiaria";

const A = "aprender";
const H = "hacer";
const hacer = (dificultad, fpBase, { etapas = 1, modalidad = "evaluativa" } = {}) => ({
  tipo: H, modalidad, dificultad, fpBase, ...(etapas > 1 ? { etapas } : {}),
});

export const PIEZAS_T5 = [
  { id: "pc26-a1-balanza", tipo: A, nombre: "La balanza del dólar", subtemas: ["pc-contexto", "pc-aprecia-deprecia"] },
  { id: "pc26-h1-quien-aprecia", tipo: H, nombre: "¿Quién se apreció?", subtemas: ["pc-aprecia-deprecia"], clasificacion: hacer("facil", 10) },
  { id: "pc26-a2-subasta", tipo: A, nombre: "La subasta de dólares", subtemas: ["pc-mercado"] },
  { id: "pc26-h2-empuja-curva", tipo: H, nombre: "Empuja la curva", subtemas: ["pc-mercado", "pc-flujos-capital", "pc-objetivos-instrumentos"], clasificacion: hacer("medio", 25) },
  { id: "pc26-a3-nominal-real", tipo: A, nombre: "Nominal no es real", subtemas: ["pc-nominal-real", "pc-itcr"] },
  { id: "pc26-a4-banano", tipo: A, nombre: "La tonelada de banano", subtemas: ["pc-itcr"] },
  { id: "pc26-h3-aguja", tipo: H, nombre: "La aguja del real", subtemas: ["pc-itcr", "pc-nominal-real"], clasificacion: hacer("dificil", 50) },
  { id: "pc26-h4-a-quien-sirve", tipo: H, nombre: "¿A quién le sirve?", subtemas: ["pc-impactos", "pc-nominal-real"], clasificacion: hacer("medio", 25) },
  { id: "pc26-a5-tuberias", tipo: A, nombre: "Dos tuberías", subtemas: ["pc-balanza-pagos"] },
  { id: "pc26-a6-imanes", tipo: A, nombre: "Imanes de capital", subtemas: ["pc-flujos-capital"] },
  { id: "pc26-h5-donde-ahorro", tipo: H, nombre: "¿Aquí o afuera?", subtemas: ["pc-flujos-capital"], clasificacion: hacer("dificil", 50) },
  { id: "pc26-a7-correa", tipo: A, nombre: "La correa del dólar", subtemas: ["pc-objetivos-instrumentos", "pc-regimenes"] },
  { id: "pc26-h6-correa", tipo: H, nombre: "Cada hecho a su correa", subtemas: ["pc-regimenes"], clasificacion: hacer("medio", 25) },
];

export const HACER_T5 = PIEZAS_T5.filter((p) => p.tipo === H);
export const piezaT5 = (id) => PIEZAS_T5.find((p) => p.id === id) ?? null;

/* El interruptor de publicación, uno por pieza. Lote 6: las 13. */
export const PUBLICADAS_T5 = Object.freeze(PIEZAS_T5.map((p) => p.id));
export const estaPublicadaT5 = (id) => PUBLICADAS_T5.includes(id);
export const piezasPublicadasT5 = () => PIEZAS_T5.filter((p) => estaPublicadaT5(p.id));
