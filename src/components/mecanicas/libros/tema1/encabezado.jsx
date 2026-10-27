import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import { CUERPO, TEXTO_APOYO, TEXTO_DATO } from "../../../../estilo/jerarquia.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS PIEZAS DE TEXTO QUE COMPARTEN LAS ACTIVIDADES DEL TEMA 1.
 *
 * Dos, y las dos salen de la reescritura de lenguaje.
 *
 * ═══════════ 1 · EL OBJETIVO Y LA CONSIGNA ═══════════
 *
 * El objetivo dice qué se va a aprender; la consigna, qué hacer con los dedos.
 * Las dos se quedan fijas y visibles toda la partida — no son un aviso que
 * aparece al empezar y se va: el estudiante que se pierde a mitad de la tanda
 * no tiene dónde volver a leer qué le están pidiendo.
 *
 * Y la consigna NO reemplaza al texto de «vacío». El vacío es la pregunta que
 * encabeza la elección y desaparece en cuanto se elige; la consigna se queda.
 *
 * ═══════════ 2 · LA IDEA SIMPLE Y EL TÉRMINO DEL LIBRO ═══════════
 *
 * Los términos del libro —activo, pasivo, patrimonio, estado de situación
 * financiera— no entran dentro de ninguna frase. Van como rótulo al lado de la
 * idea simple, que es la que manda: «Lo que tiene» grande, «Activo» pequeño al
 * lado. Las dos se ven siempre; ninguna se abrevia ni se quita.
 *
 * A 375 px se apila solo, sin medir nada: es un flex que envuelve. Si el
 * término no cabe en el renglón de la idea, cae al siguiente y ya.
 *
 * ═══════════ EL COLOR ═══════════
 *
 * Nada de esto usa teal ni ámbar: los dos significan debe y haber en esta
 * materia y el Tema 1 va antes de que eso signifique algo. Tampoco coral, que
 * es error. Solo neutros.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";

/*
 * ═══════════ «¿CÓMO SE JUEGA?» ═══════════
 *
 * Debajo de la consigna, y solo en las actividades que ya tienen su «Así se
 * juega». Va en el mismo gris secundario de la consigna —es una ayuda, no una
 * acción de la partida— y el icono es el círculo #B8C4D4 con el «?» navy del
 * resto del tema.
 *
 * EL BLANCO DE TOQUE SON 44, Y ESTE COMENTARIO DECÍA 40. Lo midió la Célula D
 * en T4: 40 × 40, que era la regla de antes de que kit.md fijara 44. No se
 * arregla subiendo el minHeight —este botón va en el flujo, con un margen
 * inferior negativo que aprieta el espacio, así que crecer 4 px empujaría el
 * contenido de todas las actividades que lo traen—, sino con el ::after de
 * global.css que da 44 sin mover el dibujo. La caja dibujada sigue en 40.
 *
 * EL MARGEN IZQUIERDO NEGATIVO NO ES UN DEFECTO, aunque se mida como que el
 * botón sobresale 6 px del texto de la consigna. Es lo que alinea
 * ÓPTICAMENTE la palabra con la consigna, compensando el relleno del propio
 * botón: sin él, el texto del botón se vería 6 px metido hacia dentro. No
 * desborda la pantalla; lo que se come es relleno del contenedor.
 */
export function BotonComoSeJuega({ onClick }) {
  return (
    <button
      type="button"
      data-como-se-juega
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: "7px",
        /* 44 px de toque (kit.md); los márgenes negativos lo dejan ocupar lo mismo que antes. */
        minHeight: "44px", minWidth: "44px", margin: "0 0 -10px -6px", padding: "0 6px",
        background: "transparent", border: "none", borderRadius: "10px", cursor: "pointer",
        ...TEXTO_DATO,
      }}
    >
      <span aria-hidden="true" style={{
        flex: "none", width: "18px", height: "18px", borderRadius: "999px",
        background: NEUTRO, color: NAVY_DEL_CHIP, fontFamily: SORA, fontSize: "12px",
        fontWeight: 700, lineHeight: "18px", textAlign: "center",
      }}>
        ?
      </span>
      ¿Cómo se juega?
    </button>
  );
}

/*
 * `objetivo` es opcional: las actividades del Tema 2 solo tienen consigna (el
 * objetivo lo lee el lector de pantalla). Sin objetivo, la consigna va sola,
 * sin la raya que la separaba de él.
 */
export function Encabezado({ objetivo = null, consigna, onComoSeJuega = null }) {
  return (
    <div data-encabezado style={{ margin: "0 0 14px" }}>
      {objetivo && (
        <p data-objetivo style={{
          /* Lo segundo que se lee, después del título: qué se busca (jerarquia.js). */
          ...CUERPO, margin: 0,
        }}>
          {objetivo}
        </p>
      )}
      <p data-consigna style={{
        /* Cómo se hace: 14 px y gris claro, un escalón por debajo del objetivo. */
        ...TEXTO_APOYO,
        margin: objetivo ? "8px 0 0" : 0, paddingTop: objetivo ? "8px" : 0, borderTop: objetivo ? "1px solid rgba(248,249,250,0.12)" : "none",
      }}>
        {consigna}
      </p>
      {onComoSeJuega && <BotonComoSeJuega onClick={onComoSeJuega} />}
    </div>
  );
}

/**
 * La idea simple con el término del libro al lado.
 *
 *   idea     lo que se lee primero y en grande
 *   termino  el nombre del libro, pequeño, al lado o debajo si no cabe
 */
export function IdeaConTermino({ idea, termino, tamano = 13, color = FAE.text, colorTermino = "rgba(248,249,250,0.55)" }) {
  return (
    <span data-idea={idea} style={{
      display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "1px 6px", minWidth: 0,
    }}>
      <span style={{
        fontFamily: SORA, fontSize: `${tamano}px`, fontWeight: 700, lineHeight: 1.25, color,
      }}>
        {idea}
      </span>
      <span data-termino={termino} style={{
        /* El piso de 12 px de kit.md también vale para el rótulo del libro (lote 4). */
        fontSize: `${Math.max(12, tamano - 3.5)}px`, lineHeight: 1.25,
        color: colorTermino, whiteSpace: "nowrap",
      }}>
        {termino}
      </span>
    </span>
  );
}
