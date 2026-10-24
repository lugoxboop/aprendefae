import { ID_REPASO, MATERIAS_DEL_POOL, ID_REPASO_CONTABILIDAD, TEMAS_DEL_POOL_CONTABILIDAD } from "./repaso.js";
import { POOL } from "./items.js";
import { POOL_CONTABILIDAD } from "./contabilidad/index.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS REPASOS DIARIOS QUE EXISTEN, Y DE DÓNDE SALE EL POOL DE CADA UNO.
 *
 * Hasta el 23-oct-2026 había uno, el de Macroeconomía, y el motor lo llevaba
 * escrito por dentro. Ahora el motor recibe el repaso como dato y cada función
 * que antes miraba a Macro toma `repaso` con Macro POR DEFECTO: quien no lo
 * pasa obtiene, línea por línea, el comportamiento de siempre. Macroeconomía
 * tiene estudiantes reales y su Repaso no cambia ni en la semilla del día.
 *
 *   id         la actividad transversal (ACTIVIDADES_TRANSVERSALES)
 *   materiaId  la materia a la que vuelve y cuyo fondo pinta
 *   temas      los temas que alimentan el pool, en su orden
 *   pool       los ítems (el de Macro en items.js; el de Contabilidad, por tema)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const REPASOS = {
  [ID_REPASO]: { id: ID_REPASO, materiaId: "macroeconomia", temas: MATERIAS_DEL_POOL, pool: POOL },
  [ID_REPASO_CONTABILIDAD]: { id: ID_REPASO_CONTABILIDAD, materiaId: "contabilidad", temas: TEMAS_DEL_POOL_CONTABILIDAD, pool: POOL_CONTABILIDAD },
};

export const REPASO_MACRO = REPASOS[ID_REPASO];

/** El repaso de un id, o el de Macro si no se dice cuál. */
export function repasoDe(id) {
  if (!id) return REPASO_MACRO;
  const r = REPASOS[id];
  if (!r) throw new Error(`Repaso desconocido: ${id}`);
  return r;
}

/** Los ítems de un repaso que salen de las actividades que el estudiante ya completó. */
export function poolDel(repaso, hechas) {
  return repaso.pool.filter((x) => hechas.has(x.actividad));
}
