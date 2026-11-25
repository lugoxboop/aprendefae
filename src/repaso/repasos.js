import { ID_REPASO_CONTABILIDAD, TEMAS_DEL_POOL_CONTABILIDAD } from "./repaso.js";
import { POOL_CONTABILIDAD } from "./contabilidad/index.js";
import { ID_REPASO_MACRO, POOL_MACRO, TEMAS_DEL_POOL_MACRO, ajustarItems } from "../macro2026/repaso/pool.js";

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
 * El 25-nov-2026 volvió el de Macro (visto bueno de Mateo), con id nuevo
 * —«repaso-diario-macro»; el viejo, «repaso-diario», es lápida desde la 0258—
 * y dos diferencias que van como dato, no como «¿es el de Macro?» en el motor:
 *
 *   poolCompleto  su pool son 14 plantillas que sortean sus cifras en cada
 *                 intento, no ítems sueltos de cada actividad. Se usa entero
 *                 desde el desbloqueo (3 actividades de Macro hechas): filtrarlo
 *                 por actividad dejaría la ronda en dos o tres consultas.
 *   ajustar       la regla de los cinco temas (pool.js · equilibrar), aplicada
 *                 dentro de vistaPreviaDelDia para que el banner y la partida
 *                 sigan saliendo de la misma tirada.
 *
 *   id         la actividad transversal (ACTIVIDADES_TRANSVERSALES)
 *   materiaId  la materia a la que vuelve y cuyo fondo pinta
 *   temas      los temas que alimentan el pool, en su orden
 *   pool       los ítems (src/repaso/contabilidad/, por tema)
 *   poolCompleto, ajustar   opcionales; ver arriba
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const REPASOS = {
  [ID_REPASO_CONTABILIDAD]: { id: ID_REPASO_CONTABILIDAD, materiaId: "contabilidad", temas: TEMAS_DEL_POOL_CONTABILIDAD, pool: POOL_CONTABILIDAD },
  [ID_REPASO_MACRO]: { id: ID_REPASO_MACRO, materiaId: "macroeconomia", temas: TEMAS_DEL_POOL_MACRO, pool: POOL_MACRO, poolCompleto: true, ajustar: ajustarItems },
};

/** El repaso de un id. Sin id, o con uno que no existe, revienta: no hay repaso por defecto. */
export function repasoDe(id) {
  const r = REPASOS[id];
  if (!r) throw new Error(`Repaso desconocido: ${id}`);
  return r;
}

/** Los ítems de un repaso que salen de las actividades que el estudiante ya completó (o todos, con `poolCompleto`). */
export function poolDel(repaso, hechas) {
  if (repaso.poolCompleto) return repaso.pool;
  return repaso.pool.filter((x) => hechas.has(x.actividad));
}
