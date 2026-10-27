import { FAE } from "../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA DECORACIÓN DEL CAMINO — que el recorrido pase por un sitio, no por un
 * vacío.
 *
 * POR QUÉ EXISTE. El camino de actividades estaba solo: una serpentina de
 * nodos sobre fondo liso. Mateo pidió «elementos decorativos alrededor del
 * camino, animaciones geométricas, del tema o en general». Esto es eso:
 * figuras facetadas que respiran despacio detrás del recorrido, y un par de
 * glifos del tema —una cuenta T, unas barras— para que la decoración diga de
 * qué materia es y no sea adorno genérico.
 *
 * LAS CUATRO REGLAS QUE SE IMPUSO
 *
 *   1. DETRÁS Y SIN TOCAR. La capa va en z-index 0 bajo el recorrido, con
 *      pointer-events en none y aria-hidden. Nada de lo que hay aquí se puede
 *      pulsar, enfocar ni oír con un lector de pantalla. Un adorno que roba
 *      un toque deja de ser adorno.
 *
 *   2. DENTRO DE SU CAJA. `overflow: hidden` sobre la caja del camino. Es la
 *      diferencia entre decorar y provocar barra horizontal a 320 px: lo que
 *      asoma, se corta.
 *
 *   3. TAN TENUE QUE NO COMPITE. Entre 0,05 y 0,12 de opacidad. La prueba es
 *      sencilla: si al mirar la pantalla ves primero un rombo y no el nodo
 *      que sigue, la decoración ganó y eso es un fallo.
 *
 *   4. DETERMINISTA. Ni un Math.random. Las mismas figuras en los mismos
 *      sitios en cada pintado: así la foto de `camino-sin-cambios` sigue
 *      siendo una foto y no un sorteo, y el camino no «parpadea» distinto
 *      cada vez que React vuelve a pintar.
 *
 * EL MOVIMIENTO. Flotan de 14 a 26 segundos por vuelta, cada una con su
 * desfase: a esa velocidad el ojo no las persigue, solo nota que el fondo
 * está vivo. Solo `transform` y `opacity`, las dos que el navegador mueve sin
 * recalcular la página. Con movimiento reducido se quedan quietas —no más
 * lentas: quietas— y siguen ahí, porque la composición no depende de que se
 * muevan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Lo que mantiene al adorno en su sitio va EN LÍNEA, no en la hoja de estilos.
 * Estar detrás, no ocupar flujo, no robar toques y recortarse en su caja son
 * las cuatro propiedades de las que depende que esto sea decoración y no un
 * fallo: si un día el <style> no llegara, o alguien pisara la clase desde
 * fuera, seguirían puestas. En la hoja queda solo el movimiento, que es lo
 * único que puede faltar sin consecuencias.
 */
const CAJA = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  overflow: "hidden",
  pointerEvents: "none",
};

const NODO = FAE.node; // #CBDCF2, el gris azulado de los nodos
const TEAL = FAE.teal;
const AMBAR = FAE.ambar;

export const CSS = `
.fae-dc-f {
  transform-origin: 50% 50%;
  animation: fae-dc-flota var(--fae-dc-dur) ease-in-out var(--fae-dc-esp) infinite alternate;
}
@keyframes fae-dc-flota {
  from { transform: translate3d(0, var(--fae-dc-sube), 0) rotate(var(--fae-dc-giro-a)); }
  to   { transform: translate3d(0, calc(var(--fae-dc-sube) * -1), 0) rotate(var(--fae-dc-giro-b)); }
}
/* El anillo no flota: gira entero y muy despacio. Un solo elemento que rota
   basta para que la capa no parezca una imagen fija. */
.fae-dc-gira {
  transform-origin: 50% 50%;
  animation: fae-dc-vuelta var(--fae-dc-dur) linear var(--fae-dc-esp) infinite;
}
@keyframes fae-dc-vuelta {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .fae-dc-f, .fae-dc-gira { animation: none; }
}
`;

/*
 * Las figuras. Cada una se dibuja en una caja de 0 a 100 y luego se escala,
 * así la colocación se piensa en porcentajes y el tamaño en píxeles.
 */
const FIGURAS = {
  /* El tetraedro que pidió Mateo: triángulo con la arista de dentro, que es
     lo único que hace falta para que se lea en volumen y no plano. */
  tetra: (
    <g>
      <polygon points="50,6 95,90 5,90" />
      <polyline points="50,6 63,66 5,90" />
      <polyline points="63,66 95,90" />
    </g>
  ),
  hexa: <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" />,
  rombo: <polygon points="50,4 92,50 50,96 8,50" />,
  anillo: <circle cx="50" cy="50" r="44" />,
  triangulo: <polygon points="50,10 92,86 8,86" />,

  /* Del tema: macroeconomía. Tres barras y una curva, los dos dibujos que
     salen en cada tema de la materia. */
  barras: (
    <g>
      <polyline points="16,90 16,58" />
      <polyline points="50,90 50,34" />
      <polyline points="84,90 84,14" />
    </g>
  ),
  curva: <path d="M 6 84 C 28 84, 34 28, 54 28 S 78 62, 94 18" />,

  /* Del tema: contabilidad. La cuenta T y una moneda. Nada más reconocible
     en esa materia que la T de debe y haber. */
  cuentaT: (
    <g>
      <polyline points="10,22 90,22" />
      <polyline points="50,22 50,92" />
    </g>
  ),
  moneda: (
    <g>
      <circle cx="50" cy="50" r="42" />
      <circle cx="50" cy="50" r="22" />
    </g>
  ),
};

/*
 * La composición. Se piensa como el margen de una página: las figuras grandes
 * en las esquinas, donde la serpentina nunca llega, y las pequeñas repartidas
 * para que ningún tramo quede del todo desnudo.
 *
 *   x, y    dónde, en % de la caja del camino
 *   t       tamaño en px
 *   op      opacidad
 *   dur/esp segundos de vuelta y de desfase
 *   sube    cuánto sube y baja, en px
 */
const AMBIENTE = [
  { f: "tetra", x: 1, y: 5, t: 78, op: 0.07, color: NODO, dur: 22, esp: 0, sube: 7, giro: [-6, 2] },
  { f: "hexa", x: 80, y: 14, t: 58, op: 0.06, color: TEAL, dur: 18, esp: 2.5, sube: 6, giro: [4, -5] },
  { f: "rombo", x: 2, y: 24, t: 40, op: 0.08, color: AMBAR, dur: 16, esp: 1.2, sube: 8, giro: [-8, 6] },
  { f: "anillo", x: 83, y: 34, t: 74, op: 0.05, color: NODO, dur: 46, esp: 0, gira: true },
  { f: "triangulo", x: 3, y: 46, t: 46, op: 0.07, color: NODO, dur: 20, esp: 3.4, sube: 6, giro: [5, -4] },
  { f: "tetra", x: 79, y: 56, t: 66, op: 0.06, color: TEAL, dur: 26, esp: 1.8, sube: 9, giro: [3, -7] },
  { f: "rombo", x: 4, y: 68, t: 34, op: 0.08, color: NODO, dur: 14, esp: 0.6, sube: 5, giro: [-5, 5] },
  { f: "hexa", x: 82, y: 78, t: 48, op: 0.06, color: AMBAR, dur: 21, esp: 2.9, sube: 7, giro: [6, -3] },
  { f: "anillo", x: 2, y: 88, t: 56, op: 0.05, color: TEAL, dur: 52, esp: 1, gira: true },
  { f: "triangulo", x: 84, y: 94, t: 36, op: 0.07, color: NODO, dur: 17, esp: 0.3, sube: 6, giro: [-4, 4] },
];

/*
 * Lo del tema. Dos piezas, no más: llevan color propio y se notan, así que
 * una tercera dejaría de ser un guiño y pasaría a ser un patrón. Se cuelan
 * entre las de fondo, a media altura, que es donde el estudiante está
 * mirando mientras recorre.
 */
const DEL_TEMA = {
  macroeconomia: [
    { f: "barras", x: 5, y: 35, t: 42, op: 0.1, color: FAE.coral, dur: 19, esp: 0.9, sube: 5, giro: [-3, 3] },
    { f: "curva", x: 78, y: 67, t: 50, op: 0.09, color: FAE.coral, dur: 24, esp: 2.2, sube: 7, giro: [2, -3] },
  ],
  contabilidad: [
    { f: "cuentaT", x: 6, y: 35, t: 40, op: 0.11, color: TEAL, dur: 19, esp: 0.9, sube: 5, giro: [-3, 3] },
    { f: "moneda", x: 80, y: 67, t: 38, op: 0.09, color: AMBAR, dur: 24, esp: 2.2, sube: 7, giro: [2, -3] },
  ],
};

function Figura({ p }) {
  const dibujo = FIGURAS[p.f];
  if (!dibujo) return null;
  const comun = {
    style: {
      position: "absolute",
      left: `${p.x}%`,
      top: `${p.y}%`,
      width: `${p.t}px`,
      height: `${p.t}px`,
      opacity: p.op,
      "--fae-dc-dur": `${p.dur}s`,
      "--fae-dc-esp": `${p.esp ?? 0}s`,
      ...(p.gira
        ? null
        : {
            "--fae-dc-sube": `${p.sube ?? 6}px`,
            "--fae-dc-giro-a": `${p.giro?.[0] ?? 0}deg`,
            "--fae-dc-giro-b": `${p.giro?.[1] ?? 0}deg`,
          }),
    },
    className: p.gira ? "fae-dc-gira" : "fae-dc-f",
  };
  return (
    <svg
      {...comun}
      viewBox="0 0 100 100"
      width={p.t}
      height={p.t}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke={p.color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dibujo}
    </svg>
  );
}

/**
 * La capa decorativa del camino. Se pone dentro de la caja en position
 * relative que ya envuelve el recorrido, antes del SVG.
 *
 * @param tema  "macroeconomia" | "contabilidad" | null — qué glifos añade.
 * @param densa false (por defecto) deja solo las figuras grandes y tenues;
 *              true añade las del tema. Un camino de un solo nodo, o uno muy
 *              corto, no tiene sitio para más de lo tenue.
 */
export default function DecoracionCamino({ tema = null, densa = true }) {
  const piezas = densa ? [...AMBIENTE, ...(DEL_TEMA[tema] || [])] : AMBIENTE;
  return (
    <div className="fae-dc" aria-hidden="true" style={CAJA}>
      <style>{CSS}</style>
      {piezas.map((p, i) => (
        <Figura key={`${p.f}-${i}`} p={p} />
      ))}
    </div>
  );
}
