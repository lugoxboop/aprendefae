import { ID_REPASO_CONTABILIDAD, TEMAS_DEL_POOL_CONTABILIDAD } from "./repaso.js";
import { POOL_CONTABILIDAD } from "./contabilidad/index.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS REPASOS DIARIOS QUE EXISTEN, Y DE DÓNDE SALE EL POOL DE CADA UNO.
 *
 * Hasta el 23-oct-2026 había uno, el de Macroeconomía, y el motor lo llevaba
 * escrito por dentro. Desde entonces el motor recibe el repaso como dato.
 *
 * El 22-nov-2026 el de Macro salió con todo su material (orden de Mateo: la
 * materia se rehace desde cero), así que hoy hay uno, el de Contabilidad. Con
 * él se fue el «Macro por defecto»: las funciones del motor ya no suponen un
 * repaso, lo reciben siempre, y repasoDe() sin id avisa en vez de elegir uno.
 * Un default que apunta a otra materia es la forma más fácil de pintarle a un
 * estudiante el pool equivocado sin que nada falle.
 *
 * Cuando el Macro nuevo tenga pool, entra aquí con su propio id (el viejo,
 * «repaso-diario», es lápida desde la 0258).
 *
 *   id         la actividad transversal (ACTIVIDADES_TRANSVERSALES)
 *   materiaId  la materia a la que vuelve y cuyo fondo pinta
 *   temas      los temas que alimentan el pool, en su orden
 *   pool       los ítems (src/repaso/contabilidad/, por tema)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const REPASOS = {
  [ID_REPASO_CONTABILIDAD]: { id: ID_REPASO_CONTABILIDAD, materiaId: "contabilidad", temas: TEMAS_DEL_POOL_CONTABILIDAD, pool: POOL_CONTABILIDAD },
};

/** El repaso de un id. Sin id, o con uno que no existe, revienta: no hay repaso por defecto. */
export function repasoDe(id) {
  const r = REPASOS[id];
  if (!r) throw new Error(`Repaso desconocido: ${id}`);
  return r;
}

/** Los ítems de un repaso que salen de las actividades que el estudiante ya completó. */
export function poolDel(repaso, hechas) {
  return repaso.pool.filter((x) => hechas.has(x.actividad));
}
