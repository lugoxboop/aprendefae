/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA ENTRADA A LA PÁGINA — la primera impresión al abrir una materia.
 *
 * Encargo de Mateo vía Miku (24-oct-2026): la página se siente plana. Vale
 * para las tres materias. El SITIO lo pone el coordinador; la FORMA la define
 * Ukyo. Hasta que la defina, la entrada está apagada (`activa: false`) y la
 * página se abre exactamente como siempre: Macroeconomía y Contabilidad tienen
 * estudiantes y Pensamiento Estratégico está publicado.
 *
 * Ukyo cambia solo estos números; nadie toca los componentes.
 *
 * Las reglas de la casa no se discuten aquí: una sola curva, solo transform y
 * opacity, nada en bucle, y con movimiento reducido no se mueve nada.
 *
 * Los grupos se marcan en la página con data-entrada="1", "2", "3"… en el
 * orden en que deben aparecer; cada uno entra `retardoMs` después del
 * anterior. Hoy los lleva el índice de materia (TopicIndexView): la cabecera,
 * lo transversal (el Repaso Diario) y la rejilla de temas.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ENTRADA = Object.freeze({
  activa: false,
  curva: "cubic-bezier(.3,.9,.4,1)",
  duracionMs: 280,
  retardoMs: 80,
  desplazamientoPx: 12,
  maxGrupos: 6,
});

/** La hoja de estilo de la entrada, para unos números dados. */
export function cssEntrada(entrada = ENTRADA) {
  const reglas = [
    `@keyframes fae-entrada { from { opacity: 0; transform: translateY(${entrada.desplazamientoPx}px); } to { opacity: 1; transform: none; } }`,
  ];
  for (let n = 1; n <= entrada.maxGrupos; n++) {
    reglas.push(
      `[data-entrada="${n}"] { animation: fae-entrada ${entrada.duracionMs}ms ${entrada.curva} ${(n - 1) * entrada.retardoMs}ms both; }`
    );
  }
  reglas.push("@media (prefers-reduced-motion: reduce) { [data-entrada] { animation: none !important; } }");
  return reglas.join("\n");
}
