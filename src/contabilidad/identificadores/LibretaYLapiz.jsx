/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1 · EL IDENTIFICADOR DEL TEMA «Introducción a la contabilidad»: la libreta
 * y el lápiz (Ukyo, orquestador/conocimiento/prompts/logitos-temas-conta-v1.md,
 * en el sistema de Xeno: kit.md, «El sistema de los identificadores de tema»).
 *
 * La contabilidad empieza por anotar: es lo primero que hace un tendero al
 * abrir su negocio.
 *
 *   · el lápiz (con su virola), el único elemento en el acento, que sube 4 px
 *     —como levantarlo para escribir— con hover, foco o pulsación de la
 *     tarjeta (`data-mueve`, con su `--mueve`; la regla la pone una sola vez
 *     IdentificadorDeTema.jsx)
 *   · la libreta cerrada, con tres renglones
 * 64 × 64, trazo de 3 px redondeado, currentColor; 4 px o más entre trazos en
 * reposo. Sin letras, cifras ni círculos.
 *
 * Va en su propio archivo, como CajonDePaso, y no en identificadoresA.jsx:
 * así no choca con las otras células que dibujan los suyos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function LibretaYLapiz({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="6" y="8" width="32" height="48" rx="4" />
      <path d="M14 22H30M14 32H30M14 42H24" />
      <g data-mueve stroke="var(--fae-acento)" fill="var(--fae-acento)" fillOpacity="0.16" style={{ "--mueve": "translateY(-4px)" }}>
        <path d="M47 16a5 5 0 0 1 10 0V40L52 50L47 40Z" />
        <path d="M47 24H57" />
      </g>
    </svg>
  );
}
