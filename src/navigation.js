import { createContext } from "react";

/*
 * Navegación de nivel sitio. Existe para que piezas que viven fuera del árbol
 * de vistas —el logo, el indicador de cuenta— puedan navegar por su cuenta,
 * sin que cada lugar donde se usan tenga que recibir y reenviar un onClick.
 *
 * Expone: { goHome, irAPerfil, irAPanelDocente, irA, marcarNodo }
 *
 * `marcarNodo(id)` escribe —o quita, con null— el nodo abierto de un tema en
 * la URL, reemplazando la entrada del historial. Lo usa useNodoEnRuta.
 *
 * `irA(vista, modo, extra)` es la navegación general, y existe para los dos
 * enlaces que cruzan de una parte del sitio a otra: el de una actividad al
 * panel docente con esa actividad puesta, y el de vuelta. Sin él, cada uno
 * tendría que recibir un callback desde App atravesando tres componentes que
 * no pintan nada relacionado.
 */
export const NavigationContext = createContext(null);
