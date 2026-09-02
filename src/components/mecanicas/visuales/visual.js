/*
 * Piezas comunes a las cuatro visualizaciones de los faders de DA-Learn.
 *
 * Cada canal tiene su dibujo —canasta, pila de billetes, carretera, balanza—
 * pero los cuatro comparten el mismo trato: una razón 0..1 del valor dentro de
 * su rango, y el mismo alto, para que al recorrer los canales el bloque no
 * cambie de tamaño.
 */

/** Posición del valor dentro de su rango, recortada a 0..1. */
export function razon(valor, min, max) {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (valor - min) / (max - min)));
}

/**
 * Razón con signo respecto al centro del rango: -1 en el mínimo, 0 en el medio,
 * +1 en el máximo. La usa la balanza, que necesita inclinarse a los dos lados.
 */
export function razonCentrada(valor, min, max) {
  return razon(valor, min, max) * 2 - 1;
}

export const VISUAL_ALTO = 132;
