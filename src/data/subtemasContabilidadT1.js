/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS SUBTEMAS DE T1 «INTRODUCCIÓN A LA CONTABILIDAD» PARA EL REPASO DIARIO
 * (Célula B, etiquetado de Futaba del 27-oct).
 *
 * Solo los nombres. El cableado está en src/repaso/contabilidad/t1.js, que lee
 * los bancos de las actividades. Mismo formato que src/repaso/subtemas.js:
 * [fijo] un nombre para toda la actividad, o [regla] un mapeo del dato del
 * banco al nombre. Si un dato no tiene nombre, el Repaso no carga (forma.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* t1-desde-donde-preguntan · [regla] por la zona del usuario. */
export const SUBTEMA_POR_ZONA_T1_1 = { dentro: "Usuarios internos", fuera: "Usuarios externos" };

/* t1-que-entro-y-que-salio · [regla] por la clase de la empresa. */
export const SUBTEMA_POR_CLASE_T1_2 = {
  comercial: "Empresa comercial",
  industrial: "Empresa industrial",
  servicios: "Empresa de servicios",
  agropecuaria: "Empresa agropecuaria",
  minera: "Empresa minera",
};

/* t1-quien-pregunta-esto · [fijo]. */
export const SUBTEMA_H2 = "Para qué usa cada uno el informe";

/* t1-donde-se-rompio · [regla] por el punto donde se rompe (`rompe`). */
export const SUBTEMA_POR_PUNTO_T1_8 = {
  2: "Ciclo: queda un papel",
  3: "Ciclo: se anota",
  4: "Ciclo: sale un informe",
  5: "Ciclo: los jefes deciden",
};

/*
 * t1-que-le-pasa-a-cada-uno · [regla] por el caso del libro (CASO_DEL_LIBRO_T1_4).
 * Van juntos de dos en dos porque el caso d tiene un solo hecho (cal-6).
 */
export const SUBTEMA_POR_CASO_T1_4 = {
  a: "Los dos lados suben",
  b: "Los dos lados suben",
  c: "Los dos lados bajan",
  d: "Los dos lados bajan",
};

/* t1-un-dia-o-un-ano · [regla] por la respuesta. */
export const SUBTEMA_POR_RESPUESTA_H1 = {
  foto: "La foto: un día",
  pelicula: "La película: el periodo",
  comparar: "Comparar dos fotos",
};

/*
 * t1-en-cual-estado-aparece · [regla] por el destino (informe-sección).
 * Patrimonio va con pasivo y gastos con ingresos, porque cada uno tiene una
 * sola ficha.
 */
export const SUBTEMA_POR_DESTINO_T1_6 = {
  "primero-activo": "Activo",
  "primero-pasivo": "Pasivo y patrimonio",
  "primero-patrimonio": "Pasivo y patrimonio",
  "segundo-ingresos": "Estado de resultados",
  "segundo-gastos": "Estado de resultados",
};

/* t1-la-articulacion (p1 y p2 del modo inverso) y la frase de cu0-a4 · [fijo]. */
export const SUBTEMA_ARTICULACION = "Cómo se articulan los estados";

/* Las «En una frase» de Aprender · [fijo], una por pieza (la clave es la pieza del catálogo). */
export const SUBTEMA_FRASE_T1 = {
  "cu0-a1-recorrido-de-un-hecho": "El ciclo de la información contable",
  "cu0-a2-la-ecuacion-contable": "La ecuación contable",
  "cu0-a3-la-foto-y-la-pelicula": "Foto y película",
  "cu0-a4-como-se-articulan": SUBTEMA_ARTICULACION,
};
