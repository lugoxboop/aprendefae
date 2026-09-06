import { useEffect, useRef, useState } from "react";

/*
 * ¿Está este bloque a la vista?
 *
 * PARA QUÉ. La sala de control monta tres piezas animadas en un mismo tema.
 * Una aguja que oscila, un mercado que corre y unas palancas que iluminan son
 * baratas por separado y caras las tres a la vez si siguen moviéndose mientras
 * el estudiante lee otra cosa doscientos píxeles más abajo. Esto permite que
 * cada pieza apague su animación cuando no se la está mirando.
 *
 * NO ES EL MISMO CASO QUE VideoYouTube. Aquel observa una sola vez y se
 * desconecta, porque cargar un iframe es irreversible. Aquí hace falta que
 * encienda y apague tantas veces como el estudiante suba y baje, así que el
 * observador se queda vivo mientras el componente exista.
 *
 * SIN IntersectionObserver SE ASUME VISIBLE. Un navegador viejo se queda sin
 * la optimización, no sin la pieza: es la misma decisión que ya tomó el video.
 */
export function useEnPantalla({ margen = "120px" } = {}) {
  const referencia = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const nodo = referencia.current;
    if (!nodo) return;

    const observador = new IntersectionObserver(
      (entradas) => setVisible(entradas.some((e) => e.isIntersecting)),
      { rootMargin: margen }
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, [margen]);

  return [referencia, visible];
}
