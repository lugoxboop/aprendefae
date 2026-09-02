import { HACER } from "../data/subjects.js";
import { otorgarFP } from "./otorgarFP.js";

/*
 * Puerta de entrada al sistema de FP desde las actividades.
 *
 * Toda actividad terminada pasa por aquí. La metadata sale de su clasificación
 * en subjects.js, así que conectar una actividad nueva no requiere lógica
 * propia: basta con clasificarla y llamar a esta función al completarse.
 *
 * Garantía: una actividad "Aprender" sale por la primera guarda y nunca llega
 * al motor de FP.
 */
export async function registrarActividadCompletada(clasificacion, contexto = {}) {
  if (!clasificacion || clasificacion.tipo !== HACER) return { ok: false, motivo: "no-otorga-fp" };

  /*
   * Las mecánicas calculan su desempeño como porcentaje (0–100) y el motor lo
   * espera como proporción (0–1). La conversión vive aquí, una sola vez, para
   * que ninguna mecánica pueda equivocarse de escala y otorgar FP inflados.
   */
  let aciertos = contexto.aciertos ?? null;
  if (typeof contexto.porcentajeAciertos === "number") {
    aciertos = Math.max(0, Math.min(100, contexto.porcentajeAciertos)) / 100;
  }

  return otorgarFP({
    actividadId: contexto.actividadId,
    materiaId: contexto.materiaId,
    dificultad: clasificacion.dificultad,
    modalidad: clasificacion.modalidad,
    duracionMs: contexto.duracionMs ?? null,
    aciertos,
  });
}
