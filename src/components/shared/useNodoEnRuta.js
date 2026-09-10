import { useContext, useEffect, useRef, useState } from "react";
import { NavigationContext } from "../../navigation.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A2 — EL NODO ABIERTO DE UN TEMA, EN LA URL.
 *
 * Abrir un juego del camino escribe su id en el último segmento del hash
 * —#/modelo-iceberg/hacer/proyecto-arca— y cerrarlo lo quita. Se REEMPLAZA la
 * entrada del historial, no se empuja otra: abrir un juego nunca fue una
 * página nueva para el botón atrás, y esto no lo cambia.
 *
 * ═══════════ RECARGAR VUELVE AL CAMINO, NUNCA A UN JUEGO REINICIADO ═══════════
 *
 * Al recargar dentro de una actividad, la vista NO la vuelve a abrir: abrirla
 * sería empezarla de cero en silencio, que es justo lo que nadie espera. Vuelve
 * al camino con ese nodo resaltado y a la vista, y es el estudiante quien
 * decide entrar. En el Arca, además, el nodo lleva la marca de partida a
 * medias y dentro espera la pregunta de continuar.
 *
 * ═══════════ CADA VISTA VALIDA EL NODO QUE LE LLEGA ═══════════
 *
 * El enrutador no conoce el catálogo, a propósito —ver ruta.js—. Un id que no
 * es de este camino —escrito a mano, de otro tema, de un juego retirado, o de
 * la mitad Hacer cuando se entró por Aprender— no resalta nada: el camino se
 * ve como siempre y el id sobrante se quita de la URL, para que no se quede
 * ahí prometiendo algo.
 *
 * Solo se resalta el nodo con el que SE MONTÓ la vista. Al abrir y cerrar
 * cualquier juego el resaltado se apaga: ya cumplió, y un aro que sigue
 * latiendo sobre un juego que acabas de dejar no dice nada.
 *
 * Devuelve el id que hay que resaltar, o null.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function useNodoEnRuta(nodoAbierto, nodoInicial, idsDelCamino) {
  const nav = useContext(NavigationContext);
  const esDeAqui = !!nodoInicial && idsDelCamino.includes(nodoInicial);
  const [resaltado, setResaltado] = useState(() => (esDeAqui ? nodoInicial : null));

  /* Un id que no es de este camino se quita de la URL, una vez, al montar. */
  useEffect(() => {
    if (nodoInicial && !esDeAqui) nav?.marcarNodo?.(null);
    // Solo al montar: después, la URL la escribe el efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Abrir o cerrar un nodo escribe la URL. Se compara con el valor anterior en
   * vez de saltarse "el primer efecto": en desarrollo React ejecuta los efectos
   * dos veces al montar, y un "es el primero" contado con un ref se equivoca
   * en la segunda y borraría el nodo recién llegado.
   */
  const anterior = useRef(nodoAbierto);
  useEffect(() => {
    if (anterior.current === nodoAbierto) return;
    anterior.current = nodoAbierto;
    setResaltado(null);
    nav?.marcarNodo?.(nodoAbierto ?? null);
    // Solo reacciona a abrir y cerrar; `nav` cambia en cada pintado de App.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodoAbierto]);

  return nodoAbierto ? null : resaltado;
}
