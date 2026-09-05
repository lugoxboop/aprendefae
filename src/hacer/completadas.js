import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

/*
 * Qué actividades ha completado ya el estudiante.
 *
 * Se lee de actividades_hechas(), la misma función que usan las medallas: una
 * actividad cuenta como hecha cuando dejó una fila en fp_history. No hay una
 * tabla de "completadas" aparte porque no hace falta y porque dos verdades
 * sobre lo mismo se separan tarde o temprano.
 *
 * Sin sesión no hay nada que consultar y el camino se dibuja entero sin hacer:
 * un invitado ve el recorrido igual, solo que sin avance. Nada se bloquea por
 * no haber entrado.
 */
export function useCompletadas() {
  const [hechas, setHechas] = useState(() => new Set());

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;

    (async () => {
      const { data: sesion } = await supabase.auth.getSession();
      if (!sesion?.session) return;
      const { data, error } = await supabase.rpc("actividades_hechas");
      if (error || !vivo) return;
      setHechas(new Set((data ?? []).map((f) => f.activity_id)));
    })();

    return () => { vivo = false; };
  }, []);

  return hechas;
}

/*
 * Arma los nodos del camino de un tema a partir del catálogo y de lo hecho.
 * El orden es el de subjects.js: es el que decide Gen al escribir el tema.
 */
export function nodosDe(actividades, hechas) {
  return actividades.map((a) => ({
    id: a.id,
    nombre: a.nombre,
    completada: hechas.has(a.id),
  }));
}
