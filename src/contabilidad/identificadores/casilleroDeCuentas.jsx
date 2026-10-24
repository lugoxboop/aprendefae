/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 · LAS CUENTAS, EL DEBE Y EL HABER: EL CASILLERO DE CUENTAS.
 *
 * Especificación: orquestador/conocimiento/prompts/logitos-temas-conta-v1.md
 * (Ukyo, 23 oct., §3 «CasilleroDeCuentas»), dentro del sistema de Xeno
 * (kit.md, «El sistema de los identificadores de tema»). Issue #471, T2-3b.
 *
 * Un casillero de correos de 2 × 2 —dos familias de cuentas por dos lados—
 * con una ficha en la casilla de arriba a la derecha: cada cuenta tiene su
 * casilla. La ficha es el acento (único relleno, al 16 %) y lo único que se
 * mueve: sube 3 px, como si saliera de su casilla. La regla del movimiento y
 * su apagado con movimiento reducido los pone IdentificadorDeTema.jsx.
 *
 * Única desviación de las rutas de §3, autorizada por la propia §3 («si una
 * prueba falla, se ajusta el dibujo, no el sistema»): la ficha mide 10 de
 * ancho y no 12 (x=39, mismo centro). Con 12, entre su trazo y los de la
 * división y el marco quedaban 3 px, y el sistema pide 4 o más en reposo.
 *
 * Archivo propio para no chocar con identificadoresA.jsx (células B, D y E).
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function CasilleroDeCuentas({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="8" y="10" width="48" height="44" rx="5" />
      <path d="M32 10V54M8 32H56" />
      <rect data-mueve x="39" y="18" width="10" height="7" rx="2" stroke="var(--fae-acento)" fill="var(--fae-acento)" fillOpacity="0.16" style={{ "--mueve": "translateY(-3px)" }} />
    </svg>
  );
}
