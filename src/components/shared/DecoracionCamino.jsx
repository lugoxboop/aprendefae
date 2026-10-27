import { useEffect, useRef, useState } from "react";
import { Dibujo, FAE_POSES, PIEZAS } from "../decoracion/piezas.jsx";
import { POSE_FAE } from "../decoracion/poses.js";
import { shouldRenderStatic } from "../../utils/device.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA DECORACIÓN DEL CAMINO — que el recorrido pase por un sitio, no por un
 * vacío.
 *
 * POR QUÉ EXISTE. Mateo, 27-oct: «no olvides los elementos decorativos
 * alrededor del camino, animaciones geométricas, del tema o en general». El
 * camino era una serpentina de nodos sobre fondo liso.
 *
 * DE DÓNDE SALEN LAS FIGURAS, Y ESTO IMPORTA. No se dibuja ninguna aquí. Las
 * once piezas del catálogo están dibujadas y reservadas por Hanayama
 * (vida-visual-v1 §5.1 de Ukyo, piezas en src/components/decoracion/) y las
 * usan ya las bandas de las tablas de posiciones. Dibujar otro tetraedro
 * «parecido» sería tener dos tetraedros distintos en el mismo sitio, que es
 * exactamente lo que la reserva de piezas existe para evitar.
 *
 * El reparto por materia sale del catálogo:
 *   las dos      tetraedro (1), cubo (2)
 *   Macro        billete (5), flecha de tendencia (6)
 *   Contabilidad libro (7), clip (8)
 *   Estratégico  torre de ajedrez (11)
 * La chispa (3), la moneda (4) y el sello (9) quedan reservadas y fuera.
 *
 * FAE. La mascota de la casa, la pieza 10, en su pose publicada. Va al final
 * del recorrido, QUIETA: §5.2 dice que Fae no tiene bucle, y no codifica
 * nada —ni tu puesto, ni tu racha, ni si vas bien—, porque esta capa va
 * aria-hidden y lo que viva aquí no existe para un lector de pantalla.
 *
 * ═══════════ UNA EXTENSIÓN DEL ESTÁNDAR, DICHA EN VOZ ALTA ═══════════
 * La §5.0 de vida-visual-v1 dice «el bucle es solo del leaderboard; en
 * cualquier otro sitio la decoración no se anima». La orden de Mateo del
 * 27-oct pide movimiento alrededor del camino, así que aquí hay bucle. Queda
 * escrito para que Ukyo lo recoja en la v2 del estándar en vez de que alguien
 * lo encuentre un día y no sepa si fue un descuido.
 *
 * Lo que NO se relaja por eso: el bucle se para fuera de pantalla, se para
 * con la pestaña oculta y no existe con movimiento reducido ni en gama baja.
 * Son las mismas cuatro condiciones de BandaDecoracion, y por la misma razón:
 * una animación que corre sin que nadie la vea es batería del estudiante.
 *
 * LAS REGLAS QUE NO SE TOCAN
 *   1. Detrás y sin tocar: z-index 0 bajo el recorrido, pointer-events none,
 *      aria-hidden. Va en línea, no en la hoja: si el <style> no llegara,
 *      seguiría puesto.
 *   2. Dentro de su caja: overflow hidden. Es la diferencia entre decorar y
 *      provocar barra horizontal a 320 px.
 *   3. Una sola transparencia, en el trazo. La opacidad del grupo compondría
 *      dos y el kit lo prohíbe (§5.1).
 *   4. Determinista: ni un Math.random, o la foto del camino deja de ser una
 *      foto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * La familia dice 0,45 de trazo. Ahí vive sobre la banda de una tabla, que es
 * una franja vacía; aquí vive DETRÁS del recorrido, y a 0,45 el ojo va antes
 * al cubo que al nodo que toca. Se baja a 0,16, que es una sola
 * transparencia igual —en el trazo, no en el grupo— y deja la figura legible
 * sin que compita. La prueba sigue siendo la de Ukyo: si al mirar la pantalla
 * ves primero una figura y no el nodo siguiente, está mal.
 */
const OPACIDAD_AL_FONDO = 0.16;

export const CSS = `
.fae-dc-p { position: absolute; transform-origin: 50% 50%; }
.fae-dc-p > svg { display: block; width: 100%; height: 100%; }
@keyframes fae-dc-flota {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(var(--fae-dc-alto, -6px)) rotate(var(--fae-dc-giro, 0deg)); }
}
.fae-dc[data-bucle] .fae-dc-p {
  animation: fae-dc-flota var(--fae-dc-dur) cubic-bezier(.3,.9,.4,1) var(--fae-dc-retardo) infinite;
}
.fae-dc[data-pausa] .fae-dc-p { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .fae-dc .fae-dc-p { animation: none !important; } }
`;

/*
 * Lo que mantiene al adorno en su sitio va EN LÍNEA, no en la hoja de
 * estilos. Estar detrás, no ocupar flujo, no robar toques y recortarse en su
 * caja son las cuatro propiedades de las que depende que esto sea decoración
 * y no un fallo. En la hoja queda solo el movimiento, que es lo único que
 * puede faltar sin consecuencias.
 */
const CAJA = { position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" };

/*
 * La composición: una figura cada ~12 % de alto, alternando lado, para que
 * ningún tramo del recorrido quede desnudo por largo que sea el camino.
 *
 *   x, y    en % de la caja del camino
 *   t       tamaño en px (la familia manda de 28 a 44)
 *   dur     segundos de vuelta, y retardo para que no respiren a la vez
 *   alto    cuánto sube, en px; giro, cuánto se inclina
 */
const COMUNES = [
  { p: "tetraedro", x: 3, y: 5, t: 40, dur: 7.2, retardo: 0, alto: -6, giro: -3 },
  { p: "cubo", x: 82, y: 15, t: 34, dur: 5.1, retardo: 0.9, alto: -5, giro: 4 },
  { p: "tetraedro", x: 2, y: 38, t: 30, dur: 6.4, retardo: 1.7, alto: -6, giro: 3 },
  { p: "cubo", x: 84, y: 50, t: 38, dur: 8.1, retardo: 0.4, alto: -5, giro: -4 },
  { p: "tetraedro", x: 4, y: 64, t: 32, dur: 5.6, retardo: 2.3, alto: -6, giro: 5 },
  { p: "cubo", x: 81, y: 76, t: 30, dur: 7.8, retardo: 1.2, alto: -5, giro: -3 },
  /*
   * Esta se queda en el 86 y no baja más: por debajo del 88 se le monta a
   * Fae, que vive pegada al borde de abajo y puede caer a cualquiera de los
   * dos lados según dónde acabe el camino. La franja final es suya.
   */
  { p: "tetraedro", x: 3, y: 86, t: 36, dur: 6.0, retardo: 0.6, alto: -6, giro: -4 },
];

/* Las del tema. Dos por materia, del catálogo reservado; ninguna inventada. */
const DEL_TEMA = {
  macroeconomia: [
    { p: "flecha", x: 78, y: 32, t: 36, dur: 6.8, retardo: 1.1, alto: -6, giro: 3 },
    { p: "billete", x: 5, y: 72, t: 40, dur: 7.6, retardo: 2.0, alto: -5, giro: 3 },
  ],
  contabilidad: [
    { p: "libro", x: 78, y: 32, t: 38, dur: 6.8, retardo: 1.1, alto: -6, giro: -3 },
    { p: "clip", x: 5, y: 72, t: 32, dur: 7.6, retardo: 2.0, alto: -5, giro: 6 },
  ],
  "pensamiento-estrategico": [
    { p: "torre", x: 78, y: 32, t: 36, dur: 6.8, retardo: 1.1, alto: -6, giro: -3 },
    { p: "torre", x: 5, y: 72, t: 30, dur: 7.6, retardo: 2.0, alto: -5, giro: 4 },
  ],
};

/*
 * Dónde se planta Fae al final del camino: en el lado CONTRARIO al último
 * nodo. Medido a 320: bajo el último nodo quedan unos 38 px libres y Fae mide
 * 38; puesta del lado del nodo se le monta encima, puesta enfrente cae bajo
 * el rótulo, que acaba bastante más arriba. A 375 las dos se veían bien, y
 * por eso la primera versión pasó: a 375 casi todo cabe.
 */
const SITIO_FAE = {
  izquierda: { left: "4%" },
  derecha: { right: "4%" },
  centro: { left: "50%", transform: "translateX(-50%)" },
};

function Pieza({ d }) {
  const pieza = PIEZAS[d.p];
  if (!pieza) return null;
  return (
    <div
      className="fae-dc-p"
      style={{
        left: `${d.x}%`,
        top: `${d.y}%`,
        width: `${d.t}px`,
        height: `${d.t}px`,
        "--fae-dc-dur": `${d.dur}s`,
        "--fae-dc-retardo": `${d.retardo}s`,
        "--fae-dc-alto": `${d.alto}px`,
        "--fae-dc-giro": `${d.giro}deg`,
      }}
    >
      <Dibujo pieza={pieza} tamano={d.t} strokeOpacity={OPACIDAD_AL_FONDO} />
    </div>
  );
}

/**
 * La capa decorativa del camino. Va dentro de la caja en position relative
 * que ya envuelve el recorrido, ANTES del SVG.
 *
 * @param tema       "macroeconomia" | "contabilidad" | "pensamiento-estrategico" | null
 * @param fae        false quita a Fae sin tocar el resto
 * @param ladoFae    "izquierda" | "derecha" | "centro"
 */
export default function DecoracionCamino({ tema = null, fae = true, ladoFae = "centro" }) {
  const ref = useRef(null);
  /* Movimiento reducido o gama baja: quieta. Se decide al montar, una vez. */
  const [estatica] = useState(() => (typeof window === "undefined" ? true : shouldRenderStatic()));
  const corre = !estatica;
  const [aLaVista, setALaVista] = useState(true);
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState !== "hidden",
  );

  /* Fuera de pantalla, en pausa. El camino es alto: casi siempre hay parte fuera. */
  useEffect(() => {
    if (!corre || !ref.current || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setALaVista(e.isIntersecting), { threshold: 0 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [corre]);

  /* Con la pestaña oculta, en pausa. */
  useEffect(() => {
    if (!corre) return undefined;
    const alCambiar = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", alCambiar);
    return () => document.removeEventListener("visibilitychange", alCambiar);
  }, [corre]);

  const pausa = corre && (!aLaVista || !visible);
  const piezas = [...COMUNES, ...(DEL_TEMA[tema] || [])];

  return (
    <div
      ref={ref}
      className="fae-dc"
      aria-hidden="true"
      style={CAJA}
      data-bucle={corre ? "" : undefined}
      data-pausa={pausa ? "" : undefined}
    >
      <style>{CSS}</style>
      {piezas.map((d, i) => (
        <Pieza key={`${d.p}-${i}`} d={d} />
      ))}
      {fae && (
        <div style={{ position: "absolute", bottom: "2px", width: "38px", height: "38px", ...SITIO_FAE[ladoFae] }}>
          {/*
            Fae sí va al 0,45 de la familia. Ella no está detrás del
            recorrido: está en el aire del final, donde no hay nada con lo
            que competir, y es el personaje de la casa. Bajarla al 0,16 del
            fondo la dejaba en una mancha.
          */}
          <Dibujo pieza={FAE_POSES[POSE_FAE]} tamano={38} />
        </div>
      )}
    </div>
  );
}
