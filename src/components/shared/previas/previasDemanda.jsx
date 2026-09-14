import { Lamina, C } from "./previasComun.jsx";

/*
 * Demanda Agregada. Ninguno de estos siete juegos tenía un movimiento propio
 * —son opciones que se tocan—, así que los seis gestos son de la ficha de
 * pedagogía, sacados de lo que el estudiante hace dentro. Biopsia se queda
 * quieta: ver su razón en PreviaActividad.jsx.
 */

/* Cuatro periodos de la onda: el lienzo corre uno por vuelta, así el bucle no tiene costura. */
const ONDA = `M0 50 ${Array.from({ length: 4 }, (_, k) => `H${20 + 60 * k} l5 -6 l5 6 l4 0 l4 -30 l5 45 l4 -15 H${60 + 60 * k}`).join(" ")}`;

/*
 * GESTO. La línea corre sin parar; en un pico, un punto late como si algo
 * aterrizara ahí, y un destello lo confirma. Vale para las dos etapas de la
 * actividad —definiciones y fragmentos—: las dos son identificar y confirmar
 * sobre la onda. El punto va con la línea: está en el pico que pasa por el
 * centro al 40 % de la vuelta.
 */
function Electro() {
  return (
    <Lamina
      id="electrocardiograma"
      css={`
@keyframes fae-pv-ek-corre { from { transform: translateX(-14px); } to { transform: translateX(-74px); } }
.fae-pv-ek-linea { animation: fae-pv-ek-corre 1.8s linear infinite; }
@keyframes fae-pv-ek-punto {
  0%, 37% { transform: scale(.4); opacity: 0; } 38% { transform: scale(.4); opacity: 1; }
  49% { transform: scale(1.5); opacity: 1; } 60% { transform: scale(1); opacity: 1; } 78%, 100% { transform: scale(1); opacity: 0; }
}
.fae-pv-ek-punto { animation: fae-pv-ek-punto 1.8s linear infinite; }
@keyframes fae-pv-ek-destello { 0%, 59% { transform: scale(.6); opacity: 0; } 60% { transform: scale(.6); opacity: .95; } 71%, 100% { transform: scale(2.2); opacity: 0; } }
.fae-pv-ek-destello { animation: fae-pv-ek-destello 1.8s linear infinite; }
`}
    >
      <rect x="0" y="0" width="120" height="90" fill={C.fondo} />
      <g className="fae-pv-ek-linea">
        <path d={ONDA} fill="none" stroke={C.trazo} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <circle className="fae-pv-ek-destello" cx="98" cy="20" r="5" fill="none" stroke={C.luz} strokeWidth="2" />
        <circle className="fae-pv-ek-punto" cx="98" cy="20" r="3.8" fill={C.luz} />
      </g>
    </Lamina>
  );
}

/*
 * GESTO. El mercurio sube del medio a una marca más alta, se sostiene y SE
 * DISUELVE de vuelta al medio: se desvanece, no baja. Bajar diría que después
 * de subir siempre baja, y eso no es cierto.
 */
function Termometro() {
  return (
    <Lamina
      id="termometro-reacciones"
      css={`
@keyframes fae-pv-te-sube {
  0% { transform: scaleY(0); opacity: 1; animation-timing-function: cubic-bezier(.3,.7,.3,1); }
  54%, 77% { transform: scaleY(1); opacity: 1; } 100% { transform: scaleY(1); opacity: 0; }
}
.fae-pv-te-sube { transform-origin: center bottom; animation: fae-pv-te-sube 1.3s linear infinite; }
`}
    >
      <rect x="52" y="8" width="16" height="62" rx="8" fill="none" stroke={C.trazo} strokeWidth="2" />
      <rect x="56" y="45" width="8" height="28" fill={C.luz} />
      <rect className="fae-pv-te-sube" x="56" y="22" width="8" height="23" fill={C.luz} />
      <circle cx="60" cy="75" r="10" fill={C.luz} stroke={C.trazo} strokeWidth="2" />
      <path d="M73 45 h9 M73 22 h9" stroke={C.hueco} strokeWidth="2" strokeLinecap="round" />
    </Lamina>
  );
}

/*
 * GESTO. Dos de los cuatro huecos de la bolsa se llenan, uno después del
 * otro, con un pulso de color que sube. Dos de cuatro, no los cuatro: la
 * vuelta entera no cabe en el tiempo.
 */
function Banco() {
  return (
    <Lamina
      id="banco-transfusiones"
      css={`
@keyframes fae-pv-bt-a { 0% { transform: scaleY(0); opacity: .7; } 33% { transform: scaleY(1); opacity: 1; } 90% { transform: scaleY(1); opacity: 1; } 100% { transform: scaleY(1); opacity: 0; } }
@keyframes fae-pv-bt-b { 0%, 50% { transform: scaleY(0); opacity: .7; } 83% { transform: scaleY(1); opacity: 1; } 90% { transform: scaleY(1); opacity: 1; } 100% { transform: scaleY(1); opacity: 0; } }
.fae-pv-bt-a, .fae-pv-bt-b { transform-origin: center bottom; }
.fae-pv-bt-a { animation: fae-pv-bt-a 1.2s ease-out infinite; }
.fae-pv-bt-b { animation: fae-pv-bt-b 1.2s ease-out infinite; }
`}
    >
      <path d="M52 12 V6 H68 V12" fill="none" stroke={C.trazo} strokeWidth="2" strokeLinejoin="round" />
      <rect x="38" y="12" width="44" height="60" rx="9" fill="none" stroke={C.trazo} strokeWidth="2" />
      <path d="M60 72 V86" stroke={C.trazo} strokeWidth="2" strokeLinecap="round" />
      {[16, 30, 44, 58].map((y) => (
        <rect key={y} x="43" y={y} width="34" height="11" rx="3" fill="none" stroke={C.hueco} strokeWidth="1.4" />
      ))}
      <rect className="fae-pv-bt-a" x="43" y="58" width="34" height="11" rx="3" fill={C.luz} />
      <rect className="fae-pv-bt-b" x="43" y="44" width="34" height="11" rx="3" fill={C.luz} />
    </Lamina>
  );
}

/*
 * GESTO. Dos tarjetas lado a lado; una se adelanta, elegida, y la otra
 * retrocede. Luego al revés: alterna qué lado gana, para no insinuar un patrón.
 */
function Triage() {
  return (
    <Lamina
      id="triage-emergencias"
      css={`
@keyframes fae-pv-tr-i {
  0% { transform: none; opacity: .8; } 31%, 47% { transform: translateY(-4px) scale(1.12) rotate(-3deg); opacity: 1; }
  50% { transform: none; opacity: .8; } 81%, 97% { transform: translateY(3px) scale(.86); opacity: .38; } 100% { transform: none; opacity: .8; }
}
@keyframes fae-pv-tr-d {
  0% { transform: none; opacity: .8; } 31%, 47% { transform: translateY(3px) scale(.86); opacity: .38; }
  50% { transform: none; opacity: .8; } 81%, 97% { transform: translateY(-4px) scale(1.12) rotate(3deg); opacity: 1; } 100% { transform: none; opacity: .8; }
}
.fae-pv-tr-i { animation: fae-pv-tr-i 1.6s cubic-bezier(.3,.7,.3,1) infinite; }
.fae-pv-tr-d { animation: fae-pv-tr-d 1.6s cubic-bezier(.3,.7,.3,1) infinite; }
`}
    >
      <rect className="fae-pv-tr-i" x="20" y="24" width="34" height="42" rx="5" fill={C.silueta} />
      <rect className="fae-pv-tr-d" x="66" y="24" width="34" height="42" rx="5" fill={C.silueta} />
    </Lamina>
  );
}

/*
 * GESTO. Una pieza al primer hueco; UNA PAUSA QUE SE VE —0,3 s de quietud—;
 * y otra al segundo. La pausa es todo el punto: esta actividad pide
 * distinguir el efecto de primer orden del de segundo. Sin ella, sería Arma
 * el grupo lógico con otra piel.
 */
function Cirugia() {
  return (
    <Lamina
      id="cirugia-reconstruccion"
      css={`
@keyframes fae-pv-ci-a {
  0% { transform: translateY(62px); animation-timing-function: cubic-bezier(.2,.8,.3,1); }
  31%, 92% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(0); opacity: 0; }
}
@keyframes fae-pv-ci-b {
  0%, 50% { transform: translateY(62px); animation-timing-function: cubic-bezier(.2,.8,.3,1); }
  81%, 92% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(0); opacity: 0; }
}
.fae-pv-ci-a { animation: fae-pv-ci-a 1.6s linear infinite; }
.fae-pv-ci-b { animation: fae-pv-ci-b 1.6s linear infinite; }
`}
    >
      <rect x="14" y="30" width="30" height="30" rx="5" fill="none" stroke={C.hueco} strokeWidth="1.6" strokeDasharray="4 3" />
      <rect x="76" y="30" width="30" height="30" rx="5" fill="none" stroke={C.hueco} strokeWidth="1.6" strokeDasharray="4 3" />
      <path d="M50 45 H69 M64 40 L69 45 L64 50" fill="none" stroke={C.hueco} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect className="fae-pv-ci-a" x="14" y="30" width="30" height="30" rx="5" fill={C.silueta} />
      <rect className="fae-pv-ci-b" x="76" y="30" width="30" height="30" rx="5" fill={C.silueta} />
    </Lamina>
  );
}

/*
 * GESTO. Una alerta destella en el monitor y sale disparada a una de cuatro
 * bandejas, que destella; luego otra, a otra bandeja. 0,4 s por viaje: el más
 * rápido del juego de miniaturas, y a propósito. Aquí la velocidad ES el
 * contenido —intercalar bajo presión—; un gesto lento mentiría aunque el
 * movimiento fuera el correcto.
 */
function Sala() {
  return (
    <Lamina
      id="sala-monitores"
      css={`
@keyframes fae-pv-sm-a {
  0% { transform: translate(0, 0) scale(0); opacity: 1; } 5% { transform: translate(0, 0) scale(1.4); opacity: 1; }
  8% { transform: translate(0, 0) scale(1); opacity: 1; animation-timing-function: cubic-bezier(.5,0,.9,.6); }
  38% { transform: translate(-14px, 54px) scale(1); opacity: 1; } 44%, 100% { transform: translate(-14px, 54px) scale(1); opacity: 0; }
}
@keyframes fae-pv-sm-b {
  0%, 46% { transform: translate(0, 0) scale(0); opacity: 1; } 51% { transform: translate(0, 0) scale(1.4); opacity: 1; }
  54% { transform: translate(0, 0) scale(1); opacity: 1; animation-timing-function: cubic-bezier(.5,0,.9,.6); }
  85% { transform: translate(42px, 54px) scale(1); opacity: 1; } 91%, 100% { transform: translate(42px, 54px) scale(1); opacity: 0; }
}
.fae-pv-sm-a { animation: fae-pv-sm-a 1.3s linear infinite; }
.fae-pv-sm-b { animation: fae-pv-sm-b 1.3s linear infinite; }
@keyframes fae-pv-sm-ba { 0%, 36% { stroke: ${C.hueco}; fill: transparent; } 39%, 47% { stroke: ${C.luz}; fill: rgba(42,157,143,0.28); } 54%, 100% { stroke: ${C.hueco}; fill: transparent; } }
@keyframes fae-pv-sm-bb { 0%, 83% { stroke: ${C.hueco}; fill: transparent; } 86%, 94% { stroke: ${C.luz}; fill: rgba(42,157,143,0.28); } 100% { stroke: ${C.hueco}; fill: transparent; } }
.fae-pv-sm-ba { animation: fae-pv-sm-ba 1.3s linear infinite; }
.fae-pv-sm-bb { animation: fae-pv-sm-bb 1.3s linear infinite; }
`}
    >
      <rect x="42" y="6" width="36" height="24" rx="3" fill={C.fondo} stroke={C.trazo} strokeWidth="1.8" />
      <path d="M60 30 V35 M53 35 H67" stroke={C.trazo} strokeWidth="1.8" strokeLinecap="round" />
      {[6, 34, 62, 90].map((x, k) => (
        <rect key={x} className={k === 1 ? "fae-pv-sm-ba" : k === 3 ? "fae-pv-sm-bb" : undefined} x={x} y="64" width="24" height="16" rx="3" fill="transparent" stroke={C.hueco} strokeWidth="1.6" />
      ))}
      <circle className="fae-pv-sm-a" cx="60" cy="18" r="4" fill={C.texto} />
      <circle className="fae-pv-sm-b" cx="60" cy="18" r="4" fill={C.texto} />
    </Lamina>
  );
}

const GESTOS = {
  "electrocardiograma": Electro,
  "termometro-reacciones": Termometro,
  "banco-transfusiones": Banco,
  "triage-emergencias": Triage,
  "cirugia-reconstruccion": Cirugia,
  "sala-monitores": Sala,
};

export default function PreviasDemanda({ actividadId }) {
  const Gesto = GESTOS[actividadId];
  return Gesto ? <Gesto /> : null;
}
