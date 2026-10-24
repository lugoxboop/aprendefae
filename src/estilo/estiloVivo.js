/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ESTILO VIVO, POR MATERIA — la compuerta, sin React.
 *
 * Orden de Mateo del 24-oct-2026 (vía Miku): la página se siente plana. Entra
 * animación al abrir, volumen en los controles al estilo Duolingo y
 * decoraciones animadas. SOLO en Macroeconomía y Contabilidad.
 * PENSAMIENTO ESTRATÉGICO NO SE TOCA.
 *
 * El problema que resuelve este archivo: los componentes son compartidos.
 * CaminoHacer lo usa PensamientoSistemicoView; los controles de actividad, las
 * tres materias. Un cambio de estilo hecho «en el componente» le llega a
 * Pensamiento Estratégico sin que nadie lo pida. Por eso lo nuevo no entra en
 * el componente a secas: entra detrás de esta compuerta, que se abre por
 * materia, y Pensamiento Estratégico está fuera por construcción.
 *
 * ═══════════ CÓMO SE USA (desde React, ver EstiloVivo.jsx) ═══════════
 *
 *   const vivo = useEstiloVivo();       // true solo en Macro y Contabilidad
 *   <SoloEstiloVivo>…lo nuevo…</SoloEstiloVivo>
 *   [data-estilo-vivo] .mi-clase { … } // en CSS: el atributo solo existe donde toca
 *
 * Fuera de una materia (inicio, perfil, privacidad) la compuerta está cerrada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las materias donde entra el estilo vivo. Agregar una aquí la abre para TODO lo nuevo a la vez. */
export const MATERIAS_ESTILO_VIVO = Object.freeze(["macroeconomia", "contabilidad"]);

/*
 * La que nunca se abre, escrita aparte y comprobada ANTES que la lista: si
 * alguien la agrega a MATERIAS_ESTILO_VIVO por error, la compuerta sigue
 * cerrada para ella. Quitarla de aquí exige cambiar la prueba que la nombra,
 * y eso deja rastro en un PR.
 */
export const MATERIA_BLINDADA = "pensamiento-estrategico";

/** Si lo nuevo entra para esta materia. Cualquier cosa desconocida, vacía o blindada: no. */
export function estiloVivoPara(materiaId) {
  if (typeof materiaId !== "string" || materiaId === "") return false;
  if (materiaId === MATERIA_BLINDADA) return false;
  return MATERIAS_ESTILO_VIVO.includes(materiaId);
}

/*
 * ═══════════ LA ENTRADA A LA PÁGINA ═══════════
 *
 * El sitio lo pone el coordinador; la FORMA la define Ukyo. Hasta que la
 * defina, la entrada está apagada (`activa: false`) y la página se abre como
 * siempre. Ukyo cambia solo estos números; nadie toca los componentes.
 *
 * Reglas de la casa que no se discuten aquí: una sola curva, solo transform y
 * opacity, nada en bucle, y con movimiento reducido no se mueve nada.
 *
 * Los grupos se marcan con data-entrada="1", "2", "3"… en el orden en que deben
 * aparecer; cada grupo entra `retardoMs` después del anterior.
 */
export const ENTRADA = Object.freeze({
  activa: false,
  curva: "cubic-bezier(.3,.9,.4,1)",
  duracionMs: 280,
  retardoMs: 80,
  desplazamientoPx: 12,
  maxGrupos: 6,
});
