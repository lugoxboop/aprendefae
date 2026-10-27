import { FAE } from "../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA MASCOTA — el muñequito del final del camino.
 *
 * POR QUÉ EXISTE. Mateo lo pidió con nombre y referencia: «en duolingo hay
 * como muñequitos de animación que le dan vida a la página». Esto es eso,
 * pero nuestro: no se copia a nadie. Sale de la marca —el triángulo y el
 * punto coral del logo— y es una figura facetada, el mismo idioma visual que
 * FiguraFacetada y que la decoración del camino.
 *
 * DÓNDE VA. Al final del recorrido, centrada bajo el último nodo, en el aire
 * que el camino ya reserva abajo. Ahí hace de meta: la ves al llegar, y
 * mientras bajas la vas teniendo delante. No se pone al lado del nodo
 * sugerido a propósito: ahí competiría con lo único que el estudiante tiene
 * que mirar.
 *
 * CÓMO SE MUEVE, Y POR QUÉ TAN POCO
 *   · RESPIRA. Escala de 1 a 1,035 cada 2,6 s. Es lo que separa un dibujo de
 *     algo vivo, y es tan pequeño que no se mira: se nota.
 *   · PARPADEA. Una vez cada 5,2 s, 160 ms. Un parpadeo más frecuente la
 *     vuelve nerviosa y empieza a robar atención.
 *   · SALUDA TRES VECES Y PARA. El saludo es entrada, no bucle. Un muñequito
 *     que saluda sin parar deja de ser simpático a los veinte segundos.
 *
 * Y NO HACE NADA MÁS. No se puede pulsar, no se enfoca, no la lee un lector
 * de pantalla, no dice nada y no interrumpe. Con movimiento reducido se queda
 * quieta, de pie y entera: el dibujo no depende de que se mueva.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CUERPO = "rgba(203,220,242,0.16)";

export const CSS = `
.fae-ms { transform-box: fill-box; transform-origin: 50% 100%; }
.fae-ms-cuerpo {
  transform-box: fill-box; transform-origin: 50% 100%;
  animation: fae-ms-respira 2.6s ease-in-out infinite alternate;
}
@keyframes fae-ms-respira {
  from { transform: scale(1, 1); }
  to   { transform: scale(0.99, 1.035); }
}
.fae-ms-ojos {
  transform-box: fill-box; transform-origin: 50% 50%;
  animation: fae-ms-parpadea 5.2s ease-in-out infinite;
}
@keyframes fae-ms-parpadea {
  0%, 94% { transform: scaleY(1); }
  96.5%   { transform: scaleY(0.08); }
  99%, 100% { transform: scaleY(1); }
}
/* El saludo: tres veces y se queda quieto. Entrada, no adorno permanente. */
.fae-ms-brazo {
  transform-box: fill-box; transform-origin: 10% 90%;
  animation: fae-ms-saluda 760ms cubic-bezier(.3,.9,.4,1) 600ms 3 both;
}
@keyframes fae-ms-saluda {
  0%, 100% { transform: rotate(0deg); }
  50%      { transform: rotate(-26deg); }
}
@media (prefers-reduced-motion: reduce) {
  .fae-ms-cuerpo, .fae-ms-ojos, .fae-ms-brazo { animation: none; }
}
`;

/**
 * La mascota, dibujada. `tamano` en px; por defecto 58, que a 320 px de ancho
 * ocupa menos de una quinta parte y no se come el final del camino.
 */
export default function Mascota({ tamano = 58, style = null }) {
  return (
    <svg
      className="fae-ms"
      viewBox="0 0 100 100"
      width={tamano}
      height={tamano}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", overflow: "visible", ...style }}
    >
      <style>{CSS}</style>
      <g className="fae-ms-cuerpo">
        {/*
          El cuerpo: el triángulo de la marca con las esquinas redondeadas y
          una arista interior, que es lo que lo saca de plano. Mismo recurso
          que el tetraedro de la decoración, a propósito: son de la misma
          familia.
        */}
        <path
          d="M 50 14 Q 54 14 56 18 L 84 72 Q 86 78 80 79 L 20 79 Q 14 78 16 72 L 44 18 Q 46 14 50 14 Z"
          fill={CUERPO}
          stroke={FAE.node}
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        {/* La arista interior se para en la frente: si baja hasta la boca, la
            cara parece partida en dos. */}
        <path d="M 50 18 L 56 44" fill="none" stroke={FAE.node} strokeWidth="2.2" strokeOpacity="0.5" strokeLinecap="round" />

        {/* El punto coral del logo, que es de donde viene. */}
        <circle cx="50" cy="10" r="5.2" fill={FAE.coral} />

        <g className="fae-ms-ojos">
          <circle cx="41" cy="57" r="5.2" fill={FAE.bg} />
          <circle cx="60" cy="57" r="5.2" fill={FAE.bg} />
          {/* El brillo: dos puntos y ya mira. */}
          <circle cx="42.6" cy="55.3" r="1.6" fill={FAE.text} />
          <circle cx="61.6" cy="55.3" r="1.6" fill={FAE.text} />
        </g>

        {/* La sonrisa, de un trazo. */}
        <path d="M 43 68 Q 50 73 58 68" fill="none" stroke={FAE.node} strokeWidth="2.6" strokeLinecap="round" />

        {/* El brazo que saluda. Arranca SOBRE el borde del cuerpo: separado un
            pixel ya no es un brazo, es un palo flotando. */}
        <path className="fae-ms-brazo" d="M 78 62 L 92 49" fill="none" stroke={FAE.node} strokeWidth="3.4" strokeLinecap="round" />

        {/* Las dos patas. Cortas: lo que importa es la cara. */}
        <path d="M 38 79 L 38 88" fill="none" stroke={FAE.node} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M 62 79 L 62 88" fill="none" stroke={FAE.node} strokeWidth="3.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
