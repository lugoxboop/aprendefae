import { useState } from "react";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA ENTRADA A LA APLICACIÓN, ESTILO LANDING PAGE (orden de Mateo vía Miku,
 * 25-oct).
 *
 * La pantalla de inicio se arma en una secuencia corta en vez de aparecer de
 * golpe: primero el fondo, luego la marca, el titular sube, y las tres
 * materias suben una tras otra; al final, la línea de abajo.
 *
 *   fondo      aparece                0 ms → 700 ms
 *   marca      baja 10 px y aparece   120 → 640
 *   titular    sube 28 px y aparece   220 → 860
 *   materias   suben 36 px, de .96 a 1, una cada 90 ms desde 420 (la última
 *              termina a 1.240)
 *   pie        aparece                760 → 1.360
 *
 * Las reglas de movimiento de la casa: una sola curva, cubic-bezier(.3,.9,.4,1);
 * solo transform y opacity; nada en bucle; con movimiento reducido no se
 * mueve nada y todo está desde el primer instante.
 *
 * UNA VEZ POR VISITA. La secuencia es la entrada a la aplicación, no a la
 * pantalla: si el estudiante entra a una materia y vuelve al inicio, el
 * inicio ya está. Se recuerda en memoria del módulo (se olvida al recargar),
 * sin guardar nada en el navegador.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const CURVA_ENTRADA_APP = "cubic-bezier(.3,.9,.4,1)";

let yaEntro = false;

/** Verdadero solo en el primer montaje de la visita. */
export function useEntradaApp() {
  const [anima] = useState(() => {
    const primera = !yaEntro;
    yaEntro = true;
    return primera;
  });
  return anima;
}

/** Solo para las pruebas: vuelve a la primera visita. */
export function olvidarEntradaApp() {
  yaEntro = false;
}

const C = CURVA_ENTRADA_APP;
export const CSS_ENTRADA_APP = `
@keyframes fae-app-sube { from { opacity: 0; transform: translateY(var(--fae-sube, 24px)) scale(var(--fae-escala, 1)); } to { opacity: 1; transform: none; } }
@keyframes fae-app-aparece { from { opacity: 0; } to { opacity: 1; } }
.fae-app-entra .fae-app-fondo { animation: fae-app-aparece 700ms ${C} both; }
.fae-app-entra .fae-app-marca { --fae-sube: -10px; animation: fae-app-sube 520ms ${C} 120ms both; }
.fae-app-entra .fae-app-titular { --fae-sube: 28px; animation: fae-app-sube 640ms ${C} 220ms both; }
.fae-app-entra .fae-app-materias > * { --fae-sube: 36px; --fae-escala: .96; animation: fae-app-sube 640ms ${C} both; }
.fae-app-entra .fae-app-materias > :nth-child(1) { animation-delay: 420ms; }
.fae-app-entra .fae-app-materias > :nth-child(2) { animation-delay: 510ms; }
.fae-app-entra .fae-app-materias > :nth-child(3) { animation-delay: 600ms; }
.fae-app-entra .fae-app-pie { animation: fae-app-aparece 600ms ${C} 760ms both; }
@media (prefers-reduced-motion: reduce) { .fae-app-entra, .fae-app-entra * { animation: none !important; } }
`;
