import { lazy, Suspense } from "react";
import { FAE } from "../../theme.js";
import BackgroundVeil from "./BackgroundVeil.jsx";

/*
 * Fondo animado de la materia, para las páginas de actividad.
 *
 * Hasta ahora la animación vivía solo en el índice de cada materia y entrar a
 * un tema caía en un fondo plano: se sentía como salir del sitio. Esto la lleva
 * dentro, con el mismo componente que ya usa el índice.
 *
 * Dos cuidados que no se relajan por reutilizar algo ya hecho:
 *
 *   · Los fondos ya traen su propia salida para hardware limitado —un solo
 *     fotograma en las curvas, imagen fija en el ajedrez— y eso sigue igual:
 *     este componente no los reconfigura, solo los coloca.
 *   · El velo va MÁS OPACO que en el índice. Allí el fondo es el protagonista y
 *     hay cuatro palabras encima; aquí debajo hay quizzes, faders y diagramas
 *     que se leen de cerca, y una escena en movimiento detrás de un texto largo
 *     compite con él. El fondo tiene que estar, no que notarse.
 */

const SupplyDemandBackground = lazy(() => import("../backgrounds/SupplyDemandBackground.jsx"));
const ChessBackground = lazy(() => import("../backgrounds/ChessBackground.jsx"));
const LibroMayorBackground = lazy(() => import("../backgrounds/LibroMayorBackground.jsx"));

const FONDOS = {
  macroeconomia: SupplyDemandBackground,
  "pensamiento-estrategico": ChessBackground,
  /*
   * Registrado desde ya, aunque Contabilidad no tenga todavía ninguna página
   * de actividad que lo use: el encargo pide que el fondo se propague hacia
   * dentro como en las otras dos, y dejarlo enganchado ahora evita que la
   * primera actividad que entre se abra con fondo plano sin que nadie sepa por qué.
   */
  contabilidad: LibroMayorBackground,
};

export default function FondoMateria({ materiaId, children }) {
  const Fondo = FONDOS[materiaId] ?? null;

  /*
   * overflow-x: clip Y NO overflow: hidden, y la diferencia no es de estilo.
   *
   * Lo encontró la Célula E: con hidden, el div de abajo se convierte en el
   * «scrollport» de todo lo que lleva dentro, y entonces NINGÚN position:
   * sticky de la página vuelve a pegarse a la ventana —se pega a ese div, que
   * no se desplaza porque crece con el contenido—. O sea que el fondo animado
   * rompía en silencio la cabecera pegajosa del repaso del capítulo 5, la
   * barra inferior de «Así se juega» y cuatro sitios más, en toda página de
   * actividad que lleve fondo.
   *
   * clip recorta exactamente igual —que es para lo que estaba, porque los
   * fondos son absolutos y sobresalen— pero NO crea scrollport. Y solo en X:
   * en Y no hay nada que recortar, y recortarlo volvería a romper el sticky.
   */

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: FAE.bg, overflowX: "clip" }}>
      {Fondo && (
        /* Sin fallback: el fondo puede llegar tarde, el contenido no espera. */
        <Suspense fallback={null}>
          {/*
            Atenuado, no solo velado. En el índice el fondo es el protagonista;
            aquí debajo hay nodos, faders y diagramas que se leen de cerca, y la
            madera clara del tablero se colaba entre ellos hasta volverlos
            difíciles de distinguir. Queda como textura, que es lo que se
            pretendía: que la página siga oliendo a la materia sin disputarle la
            atención a lo que hay que leer.
          */}
          <div aria-hidden="true" style={{ opacity: 0.3 }}>
            <Fondo />
          </div>
          <BackgroundVeil centerAlpha={0.62} />
        </Suspense>
      )}
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}
