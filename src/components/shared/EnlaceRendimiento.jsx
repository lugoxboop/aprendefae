import { useContext } from "react";
import { BarChart2, ChevronRight } from "lucide-react";
import { FAE } from "../../theme.js";
import { NavigationContext } from "../../navigation.js";
import { useAccesoDocente } from "../../docente/useAccesoDocente.js";
import { ubicacionDeActividad } from "../../data/subjects.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «VER EL RENDIMIENTO DEL GRUPO» — el atajo del docente dentro de una actividad.
 *
 * ═══════════ POR QUÉ NO SE VEÍA, QUE NO ERA FALTA DE TAMAÑO ═══════════
 *
 * Era un enlace de texto subrayado DEBAJO del botón de volver al camino. Con un
 * control con forma encima y prosa debajo, el ojo lee lo segundo como pie del
 * primero: no como algo que se pulsa, sino como una nota sobre el botón. Podía
 * ponerse más grande y habría seguido leyéndose igual.
 *
 * Lo que lo arregla es el NIVEL, no el tamaño: pasa a ser un botón con las
 * mismas medidas exactas que el de volver —mismo padding, mismo radio, mismo
 * tamaño de letra— y, al ser los dos inline-flex sin nada de bloque en medio,
 * comparten fila. Dos pastillas seguidas se leen como una barra de acciones.
 *
 * ═══════════ Y ASÍ EL CONTENIDO SUBE, NO BAJA ═══════════
 *
 * La condición era no empujar la actividad hacia abajo. Al ocupar la fila que
 * ya existe en vez de una propia, en escritorio la actividad sube unos cincuenta
 * píxeles. A 375 px no caben las dos pastillas juntas y esta salta a la línea
 * siguiente, que es exactamente donde estaba antes: ni un píxel de más.
 *
 * ═══════════ POR QUÉ NO MÁS PROMINENTE ═══════════
 *
 * La actividad sigue siendo lo principal de la pantalla. El fondo es teal al
 * 14% y el borde al 40%: se distingue del botón neutro de volver sin gritar.
 * Un botón sólido de color competiría con el juego, que es lo que el docente
 * viene a hacer la mayoría de las veces — Mateo prueba cada actividad del sitio.
 *
 * ═══════════ EL TEXTO DICE A DÓNDE VA ═══════════
 *
 * Era «Ver cómo le fue al grupo», que no dice si lleva a una lista, a una
 * gráfica o a otra pantalla. Ahora es «Ver el rendimiento del grupo», que es el
 * nombre de la sección a la que aterriza —RENDIMIENTO POR ACTIVIDAD—: un
 * control que se llama como su destino se aprende solo la primera vez. Y el
 * chevrón de la derecha dice que se sale de aquí, que era la otra mitad de la
 * duda.
 *
 * ═══════════ QUIÉN LO VE ═══════════
 *
 * Solo un docente autenticado y autorizado EN LA MATERIA DE ESTA ACTIVIDAD. Sin
 * cambios: la materia sale de subjects.js, no de quien monta el componente, así
 * que no hay forma de pasarle la equivocada. Un estudiante no lo ve nunca, y si
 * lo viera tampoco pasaría nada — las funciones del panel comprueban docente y
 * materia en el servidor. Esto es interfaz, no seguridad.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function EnlaceRendimiento({ actividadId }) {
  const acceso = useAccesoDocente();
  const nav = useContext(NavigationContext);
  const ubicacion = ubicacionDeActividad(actividadId);

  if (!acceso.esDocente) return null;
  if (!ubicacion || !acceso.materias.includes(ubicacion.materiaId)) return null;
  if (!nav?.irA) return null;

  return (
    <button
      type="button"
      onClick={() => nav.irA("docente", null, actividadId)}
      style={{
        /*
         * Las medidas son LAS MISMAS del botón de volver, a propósito: dos
         * pastillas de distinta altura en la misma fila se leen como un error.
         * Si aquel cambia, este tiene que cambiar con él.
         */
        display: "inline-flex", alignItems: "center", gap: "7px",
        /*
         * ═══════════ LOS MÁRGENES SON PARA NO EMPUJAR NADA ═══════════
         *
         * Un inline-flex sí mete su caja de márgenes en la altura de la línea,
         * así que un marginBottom aquí SÍ baja el contenido cuando este botón
         * salta de línea. Medido: con 18 abajo costaba 57 px a 375 px, contra
         * los 35 de la versión anterior. Eso es empujar la actividad hacia
         * abajo, que es exactamente lo que no puede pasar.
         *
         * Con -6 arriba y 0 abajo cuesta 34: un píxel MENOS que antes. Y en
         * escritorio no cambia nada, porque al compartir línea la altura la
         * manda la caja más alta, que es la del botón de volver con sus 18.
         */
        marginTop: "-6px",
        marginBottom: 0,
        /* Separación cuando van juntos; sangría mínima cuando este salta de línea. */
        marginLeft: "10px",
        fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
        padding: "9px 15px", borderRadius: "999px", cursor: "pointer",
        background: "rgba(42,157,143,0.14)",
        border: `1px solid ${FAE.teal}66`,
        color: FAE.teal,
      }}
    >
      <BarChart2 size={15} aria-hidden="true" />
      Ver el rendimiento del grupo
      <ChevronRight size={15} aria-hidden="true" style={{ marginRight: "-4px", opacity: 0.7 }} />
    </button>
  );
}
