/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL REPASO DIARIO — la configuración.
 *
 * Todo lo que es regla del Repaso, en un solo sitio y sin React ni Supabase:
 * qué materias alimentan el pool, cuánto hace falta para desbloquearlo, los
 * cupos del sorteo y los mensajes, literales de Gen.
 *
 * DESACOPLADO DE DÓNDE APARECE. Bajo qué índice vive la entrada lo dice
 * ACTIVIDADES_TRANSVERSALES en subjects.js (`indice`). Qué materias alimentan
 * el pool lo dice MATERIAS_DEL_POOL, aquí. El día que Pensamiento Estratégico
 * salga de standby, se añaden sus temas a esta lista y la entrada se mueve de
 * índice, cada cosa por su lado: ni El Pasillo ni el motor de selección saben
 * dónde está la entrada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ID_REPASO = "repaso-diario";

/* Los temas (materias, en el lenguaje de la ficha) cuyo contenido entra al pool. v1: solo Macro. */
export const MATERIAS_DEL_POOL = ["politica-economica", "demanda-agregada", "politica-fiscal", "politica-monetaria"];

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
