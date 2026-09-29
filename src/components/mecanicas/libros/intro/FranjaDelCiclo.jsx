import { useLayoutEffect, useRef, useState } from "react";
import { NEUTRO } from "../../../../data/contabilidadIntro.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FRANJA DEL CICLO — el anillo, cuando el anillo no cabe.
 *
 * A 375 px cinco estaciones no caben en círculo sin encogerlas hasta que no se
 * lean. Así que el circuito se estira: las estaciones van en columna y el
 * anillo pasa a ser esta franja de 28 px en su propio carril a la izquierda —
 * nunca encima del contenido.
 *
 * Y sigue siendo un anillo, no un borde, por tres cosas que un borde no tiene:
 *
 *   1. DIRECCIÓN. Chevrones hacia abajo en la línea de avance, hacia arriba en
 *      la de retorno. Un borde no apunta a ninguna parte.
 *   2. DOS TRAZOS DISTINTOS conviviendo: uno sólido y otro punteado. Un borde
 *      decorativo es un trazo uniforme.
 *   3. SE CIERRA SOBRE SÍ MISMO. Arriba y abajo las dos líneas se fusionan en
 *      una curva en U. Sin esa fusión serían dos rayas paralelas sueltas; con
 *      ella, el recorrido vuelve al principio y se ve que vuelve.
 *
 * ═══════════ LA DISTINCIÓN NO ES DE COLOR NI DE OPACIDAD ═══════════
 *
 * Las dos líneas llevan el MISMO color y la MISMA opacidad. El retorno es la
 * mitad del ciclo, no un adorno: bajarle la opacidad crearía una jerarquía
 * falsa, y el estudiante leería «esto de aquí importa menos». Lo único que las
 * separa es sólido contra punteado, más hacia dónde apuntan.
 *
 * La única excepción es el estado `atenuado` de la capa 3, y ahí significa
 * otra cosa: no «menos importante», sino «con este usuario el ciclo no se
 * cierra». Tampoco ahí desaparece.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ANCHO = 28;
/* La de avance va del lado del contenido; la de retorno, del lado de afuera. */
const X_AVANCE = 19;
const X_RETORNO = 8;
const RADIO_U = 7;

export const ESTADOS_DEL_RETORNO = ["encendido", "atenuado", "apagado"];

/*
 * `apagado` es de T1-8, y solo para el punto 5: el hecho llegó a los cinco
 * puntos y aun así no cambió nada. No es `atenuado` —«con este usuario el
 * ciclo no se cierra»— sino «esta vez la vuelta no ocurrió». Tampoco ahí
 * desaparece la línea, y nunca va sola: la acompaña su rótulo escrito.
 */
const OPACIDAD = { encendido: 1, atenuado: 0.35, apagado: 0.14 };

/** Un chevrón: dos trazos en pico. `haciaAbajo` invierte la punta. */
function Chevron({ x, y, haciaAbajo, opacidad }) {
  const d = haciaAbajo ? 3.2 : -3.2;
  return (
    <path
      d={`M ${x - 3} ${y - d} L ${x} ${y + d} L ${x + 3} ${y - d}`}
      fill="none" stroke={NEUTRO} strokeWidth="1.3" strokeLinecap="round"
      strokeLinejoin="round" opacity={opacidad}
    />
  );
}

/*
 * Un alto de reserva para el primer render, antes de que nadie haya medido la
 * columna. La versión anterior devolvía un hueco vacío hasta tener la medida,
 * y eso tenía dos problemas: un parpadeo sin ciclo en el primer pintado, y
 * —peor— que en cualquier entorno donde la medición no llegue, la franja
 * sencillamente no existiría. La estructura no puede depender de haber medido.
 */
const ALTO_DE_RESERVA = 260;

/*
 * ═══════════ LA FRANJA NO PUEDE EMPUJAR LO QUE MIDE ═══════════
 *
 * La primera versión recibía el alto medido de la columna y se lo ponía al
 * SVG. Y ahí había un bucle que no se ve leyendo el código: el SVG con alto
 * propio estiraba el contenedor, el contenedor estiraba la columna, y la
 * siguiente medición salía más grande. En pantalla la franja acababa
 * colgando mucho más abajo de la última estación, con sus nodos repartidos
 * por un vacío.
 *
 * Ahora la franja vive en su propio carril, que se estira solo —lo estira el
 * contenido de al lado— y el SVG va dentro EN ABSOLUTO: hereda el alto y no
 * aporta ninguno. La medición ya no se alimenta de sí misma.
 */
export default function FranjaDelCiclo({
  nodos = [], retorno = "atenuado", pulso = false, reducido = false,
}) {
  const carril = useRef(null);
  const [alto, setAlto] = useState(0);

  useLayoutEffect(() => {
    const el = carril.current;
    if (!el) return undefined;
    const medir = () => setAlto(Math.round(el.getBoundingClientRect().height));
    medir();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const h = Math.max(alto, ALTO_DE_RESERVA);
  const arriba = RADIO_U + 2;
  const abajo = h - RADIO_U - 2;
  const opRetorno = OPACIDAD[retorno] ?? OPACIDAD.atenuado;

  /* Los chevrones se reparten a lo largo de cada línea, sin amontonarse. */
  const cuantos = Math.max(2, Math.min(5, Math.floor((abajo - arriba) / 95)));
  const marcas = Array.from({ length: cuantos }, (_, k) => arriba + ((abajo - arriba) * (k + 0.5)) / cuantos);

  return (
    <div
      ref={carril}
      style={{ width: `${ANCHO}px`, flex: "none", alignSelf: "stretch", position: "relative" }}
    >
    <svg
      data-franja
      data-retorno={retorno}
      aria-hidden="true"
      viewBox={`0 0 ${ANCHO} ${h}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
    >
      {/* La U de arriba: el retorno entra y se convierte en el avance. */}
      <path
        data-fusion="arriba"
        d={`M ${X_RETORNO} ${arriba} A ${RADIO_U} ${RADIO_U} 0 0 1 ${X_AVANCE} ${arriba}`}
        fill="none" stroke={NEUTRO} strokeWidth="1.5" strokeLinecap="round" opacity={opRetorno}
      />
      {/* La U de abajo: el avance sale y se convierte en el retorno. */}
      <path
        data-fusion="abajo"
        d={`M ${X_AVANCE} ${abajo} A ${RADIO_U} ${RADIO_U} 0 0 1 ${X_RETORNO} ${abajo}`}
        fill="none" stroke={NEUTRO} strokeWidth="1.5" strokeLinecap="round" opacity={opRetorno}
      />

      {/* AVANCE — sólida, siempre al 100 %. */}
      <line
        data-linea="avance"
        x1={X_AVANCE} y1={arriba} x2={X_AVANCE} y2={abajo}
        stroke={NEUTRO} strokeWidth="1.5" strokeLinecap="round"
      />
      {marcas.map((y) => <Chevron key={`a${y}`} x={X_AVANCE} y={y} haciaAbajo opacidad={1} />)}

      {/* RETORNO — punteada, mismo color y mismo grosor. */}
      <line
        data-linea="retorno"
        x1={X_RETORNO} y1={arriba} x2={X_RETORNO} y2={abajo}
        stroke={NEUTRO} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4"
        opacity={opRetorno}
      />
      {marcas.map((y) => <Chevron key={`r${y}`} x={X_RETORNO} y={y} haciaAbajo={false} opacidad={opRetorno} />)}

      {/* Un nodo donde cada estación toca la franja. */}
      {nodos.map((y, k) => (
        <circle key={k} data-nodo={k + 1} cx={X_AVANCE} cy={y} r="2.6" fill={NEUTRO} />
      ))}

      {/*
        EL PULSO. Lento y pequeño: recorre cada línea en su sentido y se para a
        los tres ciclos. Con movimiento reducido no se dibuja — y no se dibuja
        de verdad: no está en el árbol, no es que corra en cero milisegundos.
      */}
      {pulso && !reducido && (
        <>
          <circle data-pulso="avance" r="2.2" fill={NEUTRO}>
            <animateMotion dur="4.5s" repeatCount="3" path={`M ${X_AVANCE} ${arriba} L ${X_AVANCE} ${abajo}`} />
          </circle>
          <circle data-pulso="retorno" r="2.2" fill={NEUTRO} opacity={opRetorno}>
            <animateMotion dur="4.5s" repeatCount="3" path={`M ${X_RETORNO} ${abajo} L ${X_RETORNO} ${arriba}`} />
          </circle>
        </>
      )}
    </svg>
    </div>
  );
}
