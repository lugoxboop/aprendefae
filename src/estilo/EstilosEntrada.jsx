import { ENTRADA, cssEntrada } from "./entrada.js";

/*
 * La hoja de la entrada a la página, una vez por pantalla. Mientras Ukyo no la
 * encienda (ENTRADA.activa en entrada.js) no pinta nada, y la página se abre
 * como siempre.
 */
export default function EstilosEntrada({ entrada = ENTRADA }) {
  if (!entrada.activa) return null;
  return <style data-estilos-entrada>{cssEntrada(entrada)}</style>;
}
