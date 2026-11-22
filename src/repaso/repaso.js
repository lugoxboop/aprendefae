/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL REPASO DIARIO — la configuración.
 *
 * Todo lo que es regla del Repaso, en un solo sitio y sin React ni Supabase:
 * qué materias alimentan el pool, cuánto hace falta para desbloquearlo, los
 * cupos del sorteo y los mensajes, literales de Gen.
 *
 * DESACOPLADO DE DÓNDE APARECE. Bajo qué índice vive la entrada lo dice
 * ACTIVIDADES_TRANSVERSALES en subjects.js (`indice`). Qué temas alimentan
 * el pool lo dice la lista de temas de cada repaso, aquí (y repasos.js los
 * junta con su pool): ni el banner ni el motor de selección saben dónde está
 * la entrada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * EL REPASO DE MACRO, RETIRADO (22-nov-2026). Su pool eran los juegos de los
 * cuatro temas de Macroeconomía, que salieron enteros para rehacerse desde
 * cero; su fila es lápida desde la 0258. El id se queda aquí y no es descuido:
 *
 *  · fp_history y repaso_historial lo guardan, y el panel docente lo sigue
 *    leyendo (etiquetasItem.js).
 *  · Dos reglas del motor preguntan «¿es el de Macro?»: la semilla del día
 *    (seleccion.js) y la función del servidor que dice si ya se hizo hoy
 *    (datos.js). La rama de Contabilidad es la otra y no cambia; si un día
 *    se quita la de Macro, la de Contabilidad tiene que quedar idéntica (su
 *    semilla lleva el id al final), o su mezcla del día cambia a quien ya
 *    la vio.
 *
 * Lo que ya no existe es su lista de temas ni su pool.
 */
export const ID_REPASO = "repaso-diario";

/*
 * EL REPASO DE CONTABILIDAD (orden de Mateo del 23-oct-2026). El mismo motor,
 * otro pool: mezcla lo ya visto entre los cuatro temas que se ven este
 * semestre. Es una actividad aparte —su propio id, su propio «hecho hoy»—, así
 * que hacer el de Macro no gasta el de Contabilidad ni al revés. Todo lo
 * demás (cupos, tope, desbloqueo, mensajes) es la misma regla.
 */
export const ID_REPASO_CONTABILIDAD = "repaso-diario-contabilidad";
export const TEMAS_DEL_POOL_CONTABILIDAD = [
  "introduccion-contabilidad",
  "cuentas-debe-haber",
  "ingresos-gastos-y-caja",
  "efectivo-caja-menor-bancos",
];

export const ITEMS_POR_REPASO = 10;
export const MINIMO_ACTIVIDADES = 3;
export const MINIMO_POOL = 10;

/* Cupos por prioridad (B4). El faltante de uno pasa al siguiente, en este orden. */
export const CUPOS = { fallados: 4, olvidandose: 3, frescos: 3 };
export const DIAS_PARA_OLVIDO = 7;

/*
 * Tope por materia (B4, Rohrer 2012): 4. Con una sola materia completada no
 * hay tope. Con exactamente dos, 4 + 4 no llega a 10: el tope sube a 5
 * (decisión de Mateo al revisar la ficha).
 */
export function topePorMateria(materiasCompletadas) {
  if (materiasCompletadas <= 1) return Infinity;
  if (materiasCompletadas === 2) return 5;
  return 4;
}

export const MENSAJES = {
  pocasActividades: "Completa 3 actividades para desbloquear el Repaso Diario.",
  poolCorto: "Te faltan un par de actividades para que el Repaso tenga con qué armarse.",
  hechoHoy: "Ya hiciste el repaso de hoy. Vuelve mañana.",
  antesFallada: "🎯 Esta la habías fallado. Ahora sí.",
};
