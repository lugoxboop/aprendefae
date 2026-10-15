/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA MARCA DE VEREDICTO: UN ANILLO CON ✓ O CON ✗.
 *
 * Es lo que dice «bien» o «mal» cuando el color no puede decirlo solo. El teal
 * y el coral de la marca tienen la MISMA luminosidad (1,07:1): en blanco y
 * negro, o para quien no distingue el rojo del verde, un borde teal y un borde
 * coral son el mismo borde. Lo que sobrevive es la forma, así que la forma va
 * siempre: palomita para lo bueno, equis para lo malo.
 *
 * Y el color de la marca NO cambia el significado del lado. Teal es el debe y
 * ámbar es el haber en toda la materia: una respuesta correcta del haber no
 * puede pintarse de teal para decir «bien». Por eso `color` lo pone quien la
 * usa —el tono del propio lado, o el coral del error— y el veredicto lo lleva
 * el dibujo.
 *
 * Es un <svg role="img"> con su etiqueta: quien no ve el dibujo la oye. No
 * lleva texto dentro, así que no cambia el textContent del control que la
 * contiene.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function MarcaVeredicto({ bien, color, etiqueta, tamano = 18 }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 18 18"
      role="img"
      aria-label={etiqueta}
      data-veredicto={bien ? "bien" : "mal"}
      style={{ flexShrink: 0 }}
    >
      <circle cx="9" cy="9" r="8" fill="none" stroke={color} strokeWidth="1.5" />
      {bien ? (
        <path d="M5.4 9.3 L7.9 11.7 L12.6 6.6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M6 6 L12 12 M12 6 L6 12" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}
