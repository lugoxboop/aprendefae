import { FAE } from "../../theme.js";

/*
 * Fondo de la portada: degradado en malla.
 *
 * Manchas de color muy desenfocadas que se cruzan despacio sobre el navy de
 * marca. No representa nada, y ese es el punto: no hay silueta que pueda
 * leerse mal, solo color en movimiento.
 *
 * POR QUÉ SOLO SE ANIMA `transform`:
 * el desenfoque es lo caro de esta técnica. Si además cambiaran el tamaño, el
 * color o el propio radio de desenfoque, el navegador tendría que volver a
 * calcularlo en cada cuadro. Moviendo únicamente la posición, la mancha se
 * desenfoca una vez, queda cacheada como textura y el compositor solo la
 * traslada — que es trabajo de GPU y sale casi gratis. Por eso este fondo no
 * necesita canvas, ni rAF, ni respaldo estático para gama baja.
 *
 * LA MEZCLA:
 * `mix-blend-mode: screen` sobre el navy oscuro hace que donde dos manchas se
 * cruzan salga un tono intermedio más claro en vez de que una tape a la otra.
 * Eso es lo que da la sensación líquida; sin ello serían tres círculos sueltos.
 */

/* Variante clara del navy de marca. No es un color nuevo: es #1D3557 subido. */
const NAVY_CLARO = "#2E5385";

/*
 * Recorridos con cuatro paradas que vuelven al origen, para que el ciclo cierre
 * sin salto. No son líneas rectas: cada mancha describe una vuelta irregular.
 * Las tres duraciones son distintas y no múltiplos entre sí, así que la
 * combinación tarda muchísimo en repetirse aunque cada una sea un bucle corto.
 */
const CSS = `
@keyframes fae-mesh-a {
  0%   { transform: translate3d(-12%, -8%, 0); }
  25%  { transform: translate3d(14%, 6%, 0); }
  50%  { transform: translate3d(6%, 22%, 0); }
  75%  { transform: translate3d(-16%, 10%, 0); }
  100% { transform: translate3d(-12%, -8%, 0); }
}
@keyframes fae-mesh-b {
  0%   { transform: translate3d(10%, 12%, 0); }
  25%  { transform: translate3d(-14%, 18%, 0); }
  50%  { transform: translate3d(-6%, -10%, 0); }
  75%  { transform: translate3d(16%, -4%, 0); }
  100% { transform: translate3d(10%, 12%, 0); }
}
@keyframes fae-mesh-c {
  0%   { transform: translate3d(4%, 16%, 0); }
  25%  { transform: translate3d(-10%, -6%, 0); }
  50%  { transform: translate3d(12%, -14%, 0); }
  75%  { transform: translate3d(-4%, 4%, 0); }
  100% { transform: translate3d(4%, 16%, 0); }
}

.fae-mesh-blob {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: screen;
  will-change: transform;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

/*
 * Quien pide menos movimiento se queda con la misma imagen, quieta. El fondo
 * no deja de existir: solo deja de moverse.
 */
@media (prefers-reduced-motion: reduce) {
  .fae-mesh-blob { animation: none !important; }
}
`;

/* Cada mancha: tamaño en vmax para que escale igual en cualquier pantalla. */
const MANCHAS = [
  {
    color: FAE.coral,
    tamano: "62vmax",
    izquierda: "-14%",
    arriba: "-18%",
    desenfoque: "88px",
    opacidad: 0.5,
    keyframes: "fae-mesh-a",
    duracion: "34s",
  },
  {
    color: FAE.teal,
    tamano: "56vmax",
    izquierda: "42%",
    arriba: "30%",
    desenfoque: "84px",
    opacidad: 0.46,
    keyframes: "fae-mesh-b",
    duracion: "27s",
  },
  {
    color: NAVY_CLARO,
    tamano: "68vmax",
    izquierda: "8%",
    arriba: "-6%",
    desenfoque: "96px",
    opacidad: 0.62,
    keyframes: "fae-mesh-c",
    duracion: "31s",
  },
];

export default function MeshGradientBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: FAE.bg,
        pointerEvents: "none",
      }}
    >
      <style>{CSS}</style>
      {MANCHAS.map((m) => (
        <div
          key={m.color}
          className="fae-mesh-blob"
          style={{
            width: m.tamano,
            height: m.tamano,
            left: m.izquierda,
            top: m.arriba,
            /*
             * El degradado radial difumina el borde antes incluso del blur: sin
             * él se notaría el filo del círculo por muy desenfocado que esté.
             */
            background: `radial-gradient(circle at 50% 50%, ${m.color} 0%, ${m.color}00 70%)`,
            filter: `blur(${m.desenfoque})`,
            opacity: m.opacidad,
            /*
             * Longhand a propósito. El atajo `animation` en línea reinicia las
             * propiedades que no menciona, y eso pisaba el iteration-count
             * infinite de la clase: cada mancha daba una vuelta y se quedaba
             * quieta para siempre. Con longhand, lo de la clase sobrevive.
             */
            animationName: m.keyframes,
            animationDuration: m.duracion,
          }}
        />
      ))}
    </div>
  );
}
