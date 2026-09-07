import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { escucharFP } from "../fp/aviso.js";

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
 *
 * ═══════════ POR QUÉ SE ESCUCHA Y NO SOLO SE PREGUNTA UNA VEZ ═══════════
 *
 * Antes esto preguntaba una sola vez al montar y, si en ese instante no había
 * sesión, se rendía para siempre. Dos consecuencias, las dos visibles:
 *
 *   · UN INVITADO QUE ENTRA A MITAD DE CAMINO SEGUÍA VIENDO CERO. El diálogo
 *     de cuenta aparece justo al terminar una actividad sin sesión; entraba,
 *     y el camino se quedaba vacío porque la vista nunca se desmonta —lo único
 *     que cambia es qué nodo está abierto—. Recargar era la única salida.
 *
 *   · TERMINAR UNA ACTIVIDAD NO PINTABA SU NODO. El FP quedaba guardado, pero
 *     el camino seguía gris hasta la siguiente carga de la página.
 *
 * Ahora hay dos fuentes, y ninguna es un temporizador:
 *
 *   · onAuthStateChange, que dispara INITIAL_SESSION al suscribirse —así queda
 *     cubierto el montaje y la recarga— y luego SIGNED_IN y SIGNED_OUT. Se
 *     ignora TOKEN_REFRESHED: renovar el token no cambia lo que hizo nadie.
 *
 *   · El canal de FP. Se marca el nodo con lo que emitió otorgarFP, que solo
 *     emite DESPUÉS de que el servidor confirmó la escritura. Nunca se pinta
 *     en verde algo que la base no tenga: por eso se añade el id que viene en
 *     el aviso y no el que la actividad creía estar completando.
 */
export function useCompletadas() {
  const [hechas, setHechas] = useState(() => new Set());

  useEffect(() => {
    if (!supabase) return;
    let vivo = true;

    const traer = async () => {
      const { data, error } = await supabase.rpc("actividades_hechas");
      if (!vivo) return;
      if (error) {
        /*
         * Se deja constancia. Antes este error se tragaba en silencio y el
         * síntoma era indistinguible de "todavía no has hecho nada", que es
         * justo la confusión que hay que evitar al depurar avance perdido.
         */
        console.error("[aprendeFAE] No se pudo leer lo ya completado:", error.message);
        return;
      }
      setHechas(new Set((data ?? []).map((f) => f.activity_id)));
    };

    const { data: sub } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (evento === "SIGNED_OUT" || !sesion) {
        if (vivo) setHechas(new Set());
        return;
      }
      if (evento === "INITIAL_SESSION" || evento === "SIGNED_IN") traer();
    });

    const dejarDeEscuchar = escucharFP(({ actividadId }) => {
      if (!vivo || !actividadId) return;
      setHechas((previas) =>
        previas.has(actividadId) ? previas : new Set(previas).add(actividadId)
      );
    });

    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
      dejarDeEscuchar();
    };
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
