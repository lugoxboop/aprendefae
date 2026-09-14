import { useEffect, useRef } from "react";
import { FAE } from "../../../../theme.js";
import { CSS_SALA } from "../../salaDeControl/marco.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA TESORERÍA EN CLASE — lo que comparten las escenas 2, 3 y 4.
 *
 * La misma Tesorería de los siete juegos —las tres máquinas, sus acentos, la
 * rejilla de la sala—, pero dibujada para un proyector. Tres reglas:
 *
 *   · el texto que se lee va en blanco (90–100 %), nunca en teal ni en coral:
 *     con la luz del aula encendida el negro del proyector sube y esos dos
 *     tonos caen por debajo de 3:1 contra el fondo;
 *   · el teal, el coral y el ámbar marcan con trazo grueso o con relleno, y
 *     siempre al lado del nombre escrito;
 *   · los paneles se separan del fondo por un borde blanco de 2 px como
 *     mínimo, no por un cambio de tono: el navy sobre el fondo oscuro, en un
 *     proyector, desaparece.
 *
 * ═══════════ CUÁNDO SE MUEVE ALGO ═══════════
 *
 * Solo cuando el profesor lo pide —con el mando o tocando— y una sola vez: la
 * animación corre y se queda en su estado final. Ningún bucle, ningún
 * temporizador. "Verlo otra vez" la repite.
 *
 * TODO KEYFRAME DESCRIBE SOLO EL PRINCIPIO. El final es el estilo normal del
 * elemento, así que con "reducir movimiento" se quita la animación y queda el
 * final, volver a una escena ya vista la pinta quieta en su final, y el final
 * no se escribe en dos sitios.
 *
 * Qué se anima lo decide `UnaVez`: una pieza se anima si su FIRMA —qué es y
 * cuántas veces se ha pedido— es nueva en este montaje de la escena. Al volver
 * a la escena, o al recargar, lo ya pedido se ve quieto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PAPEL = "#F4EFE3";

export const CSS_CLASE = `
${CSS_SALA}
.fae-cl { color: #F8F9FA; }
.fae-cl-panel {
  box-sizing: border-box; border-radius: 18px;
  /* Opaco: por un panel translúcido se vería la rejilla, y en un proyector eso es ruido. */
  background: linear-gradient(160deg, #1C3150, #13233B);
  border: var(--pres-borde, 2px) solid rgba(248,249,250,0.42);
  box-shadow: inset 0 1px 0 rgba(248,249,250,0.1);
  padding: max(14px, 2.2vh) max(14px, 1.4vw);
}
.fae-cl-rotulo { font-family: Sora, sans-serif; font-size: var(--pres-min, 14px); font-weight: 700; letter-spacing: 0.14em; line-height: 1.25; margin: 0; color: rgba(248,249,250,0.92); }
.fae-cl-nota { font-size: var(--pres-min, 14px); line-height: 1.35; margin: 0; color: rgba(248,249,250,0.9); }
.fae-cl-pestanas { display: flex; flex-wrap: wrap; gap: max(8px, 0.8vw); }
.fae-cl-pestana, .fae-cl-accion {
  display: inline-flex; align-items: center; gap: 0.45em; cursor: pointer;
  font-family: Sora, sans-serif; font-weight: 700; font-size: var(--pres-min, 14px); line-height: 1.2;
  padding: 0.4em 1em; border-radius: 999px;
  border: var(--pres-borde, 2px) solid rgba(248,249,250,0.65); background: transparent; color: #F8F9FA;
}
/*
 * Escenas 3 y 4: las pestañas arriba, a lo ancho; debajo, el dibujo a la
 * izquierda y el enunciado con lo que se hace con él a la derecha. Así el
 * enunciado no suma alto encima del dibujo, que es lo que hacía que la escena
 * 4 no cupiera en 1080. (Con las pestañas en la columna del dibujo, las de la
 * escena 4 se partían en dos filas.) En el teléfono, en orden de lectura:
 * pestañas, enunciado, dibujo, acciones.
 */
.fae-cl-rejilla-clase {
  display: grid; column-gap: max(14px, 2.6vw); row-gap: max(10px, 1.4vh); align-items: start;
  grid-template-areas: "tabs tabs" "dibujo enunciado" "dibujo acciones";
}
.fae-cl-a-tabs { grid-area: tabs; }
.fae-cl-a-enunciado { grid-area: enunciado; }
.fae-cl-a-dibujo { grid-area: dibujo; }
.fae-cl-a-acciones { grid-area: acciones; }
@media (orientation: portrait), (max-width: 760px) {
  .fae-cl-rejilla-clase { grid-template-areas: "tabs" "enunciado" "dibujo" "acciones"; }
}
.fae-cl-pestana[aria-pressed="true"] { background: #F8F9FA; border-color: #F8F9FA; color: #0E1B2E; }
.fae-cl-accion { border-color: #F8F9FA; background: rgba(248,249,250,0.12); }
.fae-cl-oculto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.fae-cl-maquina { display: block; width: 100%; height: max(84px, 13vh); overflow: visible; }
.fae-cl-trazo { stroke-dasharray: 1; stroke-dashoffset: 0; }
.fae-cl-giro { transform-box: fill-box; transform-origin: center; }

@keyframes fae-cl-aparecer { from { opacity: 0; transform: translateY(0.6em); } }
@keyframes fae-cl-fundido { from { opacity: 0; } }
@keyframes fae-cl-desvanecer { from { opacity: 1; } }
@keyframes fae-cl-ancho { from { transform: scaleX(0); } }
@keyframes fae-cl-alto { from { transform: scaleY(0); } }
@keyframes fae-cl-mover { from { transform: translate(var(--de-x, 0px), var(--de-y, 0px)); } }
@keyframes fae-cl-entrar { from { opacity: 0; transform: translate(var(--de-x, 0px), var(--de-y, 0px)); } }
@keyframes fae-cl-girar { from { transform: rotate(-360deg); } }
@keyframes fae-cl-trazar { from { stroke-dashoffset: 1; } }
@keyframes fae-cl-izquierda { from { left: 0%; transform: translate(0, -50%); } }
@keyframes fae-cl-barrera { from { transform: rotate(0deg); } }
@keyframes fae-cl-encender { from { background-color: rgba(248,249,250,0.07); color: #F8F9FA; border-color: rgba(248,249,250,0.45); } }
/* Lo que viaja y se queda dentro de la máquina: su final es invisible, y su estilo normal también. */
@keyframes fae-cl-viajar {
  from { opacity: 1; transform: translate(var(--de-x, 0px), var(--de-y, 0px)); }
  80% { opacity: 1; }
  to { opacity: 0; transform: none; }
}
/* La moneda cae por la ranura y aparece otra arriba: acaba donde empezó. */
@keyframes fae-cl-moneda {
  0% { opacity: 1; transform: none; }
  50% { opacity: 1; transform: translateY(15px); }
  51% { opacity: 0; transform: translateY(15px); }
  52% { opacity: 0; transform: translateY(-8px); }
  100% { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .fae-cl, .fae-cl * { animation: none !important; }
}
`;

/** La animación de un elemento, solo si `activo`. Sin ella el elemento está en su final. */
export function anima(activo, nombre, ms, retraso = 0, curva = "cubic-bezier(.3,.9,.4,1)") {
  return activo ? { animation: `${nombre} ${ms}ms ${curva} ${retraso}ms both` } : undefined;
}

/**
 * Las firmas que ya estaban pedidas al montar la escena: esas no se animan.
 * Se calcula una vez; después solo crece, desde los efectos de `UnaVez`.
 */
export function useVistasAlMontar(firmas) {
  const vistas = useRef(null);
  if (vistas.current === null) vistas.current = new Set(typeof firmas === "function" ? firmas() : firmas);
  return vistas.current;
}

/*
 * Una pieza que se anima una vez por firma. Va con `key={firma}`: pedirla otra
 * vez cambia la firma, la pieza se vuelve a montar y la animación arranca de
 * cero. La decisión se toma al montar y no cambia con los repintados, así que
 * nada corta una animación a medias.
 */
export function UnaVez({ firma, vistas, activo = true, children }) {
  const decision = useRef(null);
  if (decision.current === null) decision.current = !vistas.has(firma);
  useEffect(() => {
    if (activo) vistas.add(firma);
  }, [firma, vistas, activo]);
  return children(decision.current && Boolean(activo));
}

/*
 * ═══════════ LAS TRES MÁQUINAS, EN GRANDE ═══════════
 *
 * Las de IconoMecanismo, redibujadas para verse desde el fondo del aula y con
 * su movimiento propio: el recaudador GIRA y se traga la moneda, el
 * distribuidor REPARTE por sus tres flechas, el libro de la deuda SE ABRE.
 * Decorativas: el nombre del instrumento va escrito siempre al lado.
 */
export function MaquinaGrande({ id, color, animar = false }) {
  const trazo = { fill: "none", stroke: color, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" };
  const relleno = `${color}2E`;

  return (
    <svg className="fae-cl-maquina" viewBox="0 0 120 80" aria-hidden="true">
      {id === "tributacion" && (
        <>
          <rect x="24" y="30" width="72" height="44" rx="7" {...trazo} fill={relleno} />
          <path d="M47 30 H73" {...trazo} strokeWidth="5" />
          <g className="fae-cl-giro" style={anima(animar, "fae-cl-girar", 1200, 0, "cubic-bezier(.25,.8,.3,1)")}>
            <circle cx="60" cy="53" r="13" {...trazo} />
            <path d="M60 40 V66 M48.7 46.5 L71.3 59.5 M48.7 59.5 L71.3 46.5" {...trazo} strokeWidth="2.4" />
          </g>
          <g style={anima(animar, "fae-cl-moneda", 1200, 0, "ease-in")}>
            <circle cx="60" cy="14" r="7" {...trazo} fill={relleno} />
            <path d="M60 10.5 V17.5" {...trazo} strokeWidth="2.2" />
          </g>
        </>
      )}
      {id === "gasto" && (
        <>
          <rect x="8" y="26" width="30" height="28" rx="6" {...trazo} fill={relleno} />
          {[
            "M38 40 H104 M96 33 L104 40 L96 47",
            "M38 34 L98 12 M89.1 10.5 L98 12 L92.2 18.9",
            "M38 46 L98 68 M92.2 61.1 L98 68 L89.1 69.5",
          ].map((d, k) => (
            <path
              key={d}
              d={d}
              pathLength="1"
              className="fae-cl-trazo"
              {...trazo}
              style={anima(animar, "fae-cl-trazar", 650, 150 + k * 170, "ease-out")}
            />
          ))}
          {[
            [112, 40],
            [105.5, 9.2],
            [105.5, 70.8],
          ].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r="4.5" fill={color} style={anima(animar, "fae-cl-fundido", 300, 700 + k * 170)} />
          ))}
        </>
      )}
      {id === "deuda" && (
        <>
          <path d="M60 20 C72 13 90 13 106 17 V68 C90 64 72 64 60 71 Z" {...trazo} fill={relleno} />
          <path d="M70 31 H96 M70 40 H96 M70 49 H89" {...trazo} strokeWidth="2.2" style={anima(animar, "fae-cl-fundido", 350, 600)} />
          {/* La hoja izquierda se abre desde el lomo. */}
          <g
            style={{
              transformBox: "fill-box",
              transformOrigin: "right center",
              ...anima(animar, "fae-cl-ancho", 750, 0, "cubic-bezier(.3,1.2,.5,1)"),
            }}
          >
            <path d="M60 20 C48 13 30 13 14 17 V68 C30 64 48 64 60 71 Z" {...trazo} fill={relleno} />
            <path d="M24 31 H50 M24 40 H50 M24 49 H43" {...trazo} strokeWidth="2.2" />
          </g>
          <path d="M60 20 V71" {...trazo} />
        </>
      )}
    </svg>
  );
}

/* La analogía de la familia: una casa con dos personas, atenuada. Acompaña al texto; no lo sustituye. */
export function Familia({ tam = "1.5em" }) {
  const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg viewBox="0 0 32 32" width={tam} height={tam} aria-hidden="true" style={{ flexShrink: 0, opacity: 0.7 }}>
      <path d="M4 15 L16 5 L28 15" {...trazo} />
      <path d="M7 13 V27 H25 V13" {...trazo} />
      <circle cx="13" cy="16.5" r="2" {...trazo} />
      <path d="M10 26 V22.5 A3 3 0 0 1 16 22.5 V26" {...trazo} />
      <circle cx="20" cy="18.5" r="1.6" {...trazo} />
      <path d="M17.8 26 V23.6 A2.2 2.2 0 0 1 22.2 23.6 V26" {...trazo} />
    </svg>
  );
}

/* Una persona de la base gravable. Las que entran van rellenas: la forma distingue, no solo el color. */
export function Persona({ x, nueva = false }) {
  const color = nueva ? FAE.ambar : "#F8F9FA";
  return (
    <g>
      <circle cx={x} cy="22" r="5.5" fill={nueva ? color : "none"} stroke={color} strokeWidth="2" />
      <path
        d={`M${x - 8} 43 C${x - 8} 31 ${x + 8} 31 ${x + 8} 43 Z`}
        fill={nueva ? color : "none"} stroke={color} strokeWidth="2" strokeLinejoin="round"
      />
    </g>
  );
}
