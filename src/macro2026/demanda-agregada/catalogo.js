/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · T1 DEMANDA AGREGADA — EL CATÁLOGO DE LAS 12 PIEZAS
 *
 * En el orden del camino (§1 de la especificación de Gen). NO está en
 * src/data/subjects.js a propósito: nada nuevo se ve hasta que Mateo apruebe
 * (plan.md, 22-nov). Cuando se publique, las seis Hacer entran a
 * `SUBJECTS.macroeconomia.topics[demanda-agregada].actividades` con esta misma
 * `clasificacion`, y su migración (supabase/macro2026-pendientes/) pasa a
 * supabase/migrations en el mismo cambio. La prueba
 * src/macro2026/__tests__/t1-modelo-y-bancos.test.mjs ata las dos copias.
 *
 * SE PUBLICA POR PARTES (Mateo, 22-nov): cada pieza entra sola, apenas está
 * aprobada, anotando su id en PUBLICADAS_T1. Una Aprender no lleva fila en
 * actividad_catalogo ni FP, así que puede publicarse sin ninguna Hacer; una
 * Hacer necesita además su fila de catálogo en supabase/migrations.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const MATERIA = "macroeconomia";
export const TEMA = "demanda-agregada";

/* Las mismas constantes que subjects.js (APRENDER / HACER), sin importarlo. */
const A = "aprender";
const H = "hacer";
const hacer = (dificultad, fpBase, etapas = 1) => ({
  tipo: H, modalidad: "evaluativa", dificultad, fpBase, ...(etapas > 1 ? { etapas } : {}),
});

export const PIEZAS_T1 = [
  { id: "da26-a1-carrito", tipo: A, nombre: "El carrito de la economía", subtemas: ["da-componentes"] },
  { id: "da26-h1-llena-carrito", tipo: H, nombre: "Llena el carrito", subtemas: ["da-componentes", "da-exportaciones-netas"], clasificacion: hacer("facil", 10) },
  { id: "da26-a2-vaso-renta", tipo: A, nombre: "El vaso de la renta", subtemas: ["da-consumo"] },
  { id: "da26-a3-columpio-tasa", tipo: A, nombre: "El columpio de la tasa", subtemas: ["da-inversion"] },
  { id: "da26-a4-no-miran-renta", tipo: A, nombre: "Los que no miran la renta", subtemas: ["da-gasto-publico", "da-exportaciones-netas"] },
  { id: "da26-h4-empresario", tipo: H, nombre: "Lo que oyó el empresario", subtemas: ["da-caso-empresario"], clasificacion: hacer("dificil", 50) },
  { id: "da26-a5-bisagra-ascensor", tipo: A, nombre: "Bisagra y ascensor", subtemas: ["da-grafica", "da-ecuacion-completa"] },
  { id: "da26-h3-gira-o-sube", tipo: H, nombre: "¿Gira o sube?", subtemas: ["da-grafica"], clasificacion: hacer("medio", 25) },
  { id: "da26-a6-eco-multiplicador", tipo: A, nombre: "El eco del multiplicador", subtemas: ["da-multiplicador"] },
  { id: "da26-h2-arma-formula", tipo: H, nombre: "Arma la fórmula", subtemas: ["da-consumo", "da-inversion", "da-multiplicador"], clasificacion: hacer("medio", 25, 3) },
  { id: "da26-h5-libreta", tipo: H, nombre: "La libreta de la analista", subtemas: ["da-multiplicador", "da-grafica", "da-exportaciones-netas", "da-consumo", "da-inversion", "da-gasto-publico"], clasificacion: hacer("dificil", 50) },
  { id: "da26-h6-meta", tipo: H, nombre: "Lleva la economía a la meta", subtemas: ["da-multiplicador", "da-grafica"], clasificacion: hacer("medio", 25, 3) },
];

export const HACER_T1 = PIEZAS_T1.filter((p) => p.tipo === H);

/*
 * El interruptor de publicación, uno por pieza: los ids que Mateo aprobó.
 * Vacío = nada visible para los estudiantes. Publicar las seis Aprender es
 * anotar sus seis ids aquí y declararlas en subjects.js; las Hacer pueden
 * seguir fuera. Las pruebas exigen que lo declarado en subjects.js y en
 * supabase/migrations sea exactamente lo anotado aquí, ni más ni menos.
 */
export const PUBLICADAS_T1 = Object.freeze([
  /* Lote 1 (22-nov-2026): las seis Aprender. Las Hacer siguen sin publicar. */
  "da26-a1-carrito",
  "da26-a2-vaso-renta",
  "da26-a3-columpio-tasa",
  "da26-a4-no-miran-renta",
  "da26-a5-bisagra-ascensor",
  "da26-a6-eco-multiplicador",
]);
export const estaPublicada = (id) => PUBLICADAS_T1.includes(id);
export const piezasPublicadasT1 = () => PIEZAS_T1.filter((p) => estaPublicada(p.id));
export const piezaT1 = (id) => PIEZAS_T1.find((p) => p.id === id) ?? null;
