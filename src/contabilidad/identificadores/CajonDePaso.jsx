/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · EL IDENTIFICADOR DEL TEMA «Efectivo, caja menor y bancos»: el cajón
 * de paso (Hanayama, en el sistema de Xeno: orquestador/conocimiento/kit.md,
 * «El sistema de los identificadores de tema»).
 *
 *   · un billete, el único elemento en el acento, que baja 4 px a la boca del
 *     cajón con hover, foco o pulsación de la tarjeta (`data-mueve`, con su
 *     `--mueve`; la regla la pone una sola vez IdentificadorDeTema.jsx)
 *   · el cajón, con su división Debe | Haber
 *   · dos patas, una a cada salida, sin la rama del medio (Hanayama, 24 oct.: con ella se leía como organigrama)
 * 64 × 64, trazo de 3 px redondeado, currentColor; 4 px o más entre trazos en
 * reposo. Sin letras, cifras ni círculos.
 *
 * YA VA EN EL REGISTRO (src/data/identificadoresDeTema.js, 24 oct.): Ukyo lo
 * adoptó para T4 (prompts/logitos-temas-conta-v1.md, §4), e
 * IdentificadorDeTema.jsx ya pone la regla `transform: var(--mueve)` y su
 * versión de movimiento reducido. Se reexporta desde identificadoresA.jsx.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function CajonDePaso({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect data-mueve x="26" y="4" width="12" height="7" rx="2" stroke="var(--fae-acento)" fill="var(--fae-acento)" fillOpacity="0.16" style={{ "--mueve": "translateY(4px)" }} />
      <path d="M24 18H14a5 5 0 0 0-5 5v8a5 5 0 0 0 5 5h36a5 5 0 0 0 5-5v-8a5 5 0 0 0-5-5H40" />
      <path d="M32 22v10" />
      <path d="M16 36v14M48 36v14" />
      <path d="M9 50v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6M41 50v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}
