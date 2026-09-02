import { createContext } from "react";

/*
 * Navegación de nivel sitio. Existe para que piezas que viven fuera del árbol
 * de vistas —el logo, el indicador de cuenta— puedan navegar por su cuenta,
 * sin que cada lugar donde se usan tenga que recibir y reenviar un onClick.
 *
 * Expone: { goHome, irAPerfil }
 */
export const NavigationContext = createContext(null);
