import { supabase } from "../lib/supabase.js";
import { MEDALLAS, PARA_EL_META } from "../data/medallas.js";

/*
 * De hechos a medallas.
 *
 * La base devuelve datos (logros(), resumen_semestre()); el reparto de esos
 * datos entre las 24 medallas se decide aquí, junto al catálogo. Ninguna
 * medalla marcada como "pendiente" pasa por este archivo: no tienen regla, y no
 * se les inventa una.
 */

/* Sin sesión o sin la migración corrida, nada está ganado y nada revienta. */
const VACIO = { ganadas: new Set(), disponible: false };

export async function cargarLogros() {
  if (!supabase) return VACIO;

  const { data: sesion } = await supabase.auth.getSession();
  if (!sesion?.session) return VACIO;

  const [hechos, resumen] = await Promise.all([
    supabase.rpc("logros"),
    supabase.rpc("resumen_semestre"),
  ]);

  if (hechos.error) {
    /*
     * La 0009 todavía no está corrida: se avisa una vez y el perfil sigue
     * mostrando las 24 atenuadas en vez de romperse.
     */
    console.warn("[aprendeFAE] logros() no disponible:", hechos.error.message);
    return VACIO;
  }

  const h = hechos.data?.[0] ?? {};
  const ganadas = new Set();
  const marcar = (id, cumple) => { if (cumple) ganadas.add(id); };

  /* --- primeras veces --- */
  marcar("primera-leccion", !!h.hizo_algo);
  marcar("primer-avance", !!h.hizo_algo);
  marcar("primer-quiz", !!h.hizo_evaluativa);
  marcar("quiz-perfecto", !!h.quiz_perfecto);

  /* --- ligas --- */
  marcar("liga-union", !!h.entro_a_liga);
  const mejor = h.mejor_posicion == null ? null : Number(h.mejor_posicion);
  marcar("liga-top10", mejor != null && mejor <= 10);
  marcar("liga-top3", mejor != null && mejor <= 3);
  marcar("liga-primero", !!h.primero_de_liga);

  /*
   * Primer lugar del semestre: por materia, nunca combinado. Vale con haber
   * sido primero en alguna; la función ya lo calcula así y el resumen lo
   * confirma materia por materia.
   */
  const porMateria = (resumen.error ? [] : resumen.data ?? []).some((f) => Number(f.posicion_final) === 1);
  marcar("primero-semestre", !!h.primero_semestre || porMateria);

  /* --- racha --- */
  const racha = Number(h.mejor_racha ?? 0);
  marcar("racha-3", racha >= 3);
  marcar("racha-7", racha >= 7);
  marcar("racha-14", racha >= 14);
  marcar("racha-30", racha >= 30);

  /*
   * El meta. Se compara solo contra las que hoy SE PUEDEN ganar: contarse a sí
   * misma o contar las pendientes la volvería inalcanzable por definición, que
   * es exactamente el error que costó encontrar en el 100% del dashboard.
   */
  marcar("todas-las-medallas", PARA_EL_META.every((id) => ganadas.has(id)));

  return { ganadas, disponible: true };
}

/** El catálogo completo, con el estado resuelto de cada medalla. */
export function conEstado(ganadas) {
  return MEDALLAS.map((m) => ({
    ...m,
    obtenida: ganadas.has(m.id),
    /* Una pendiente jamás sale obtenida, pase lo que pase con los hechos. */
    ganable: m.disparador === "activo",
  }));
}
