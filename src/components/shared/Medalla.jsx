import { FAE } from "../../theme.js";

/*
 * Medalla. Un solo sistema de marco para las 24; lo que cambia entre niveles es
 * el número de nodos o facetas y el tratamiento de color, no la estructura.
 *
 * EL MARCO DICE EL NIVEL, EL ICONO DICE EL LOGRO, y son props independientes:
 * cualquier icono se puede montar en cualquier nivel. Eso es lo que permite que
 * una misma familia de iconos escale de prestigio —el gráfico de ranking va de
 * "Top 10" a "Primer lugar del semestre" cambiando solo el marco— sin dibujar
 * un icono nuevo cada vez.
 *
 * ┌─ base        hexágono, 6 nodos, línea simple, un acento coral. Sin relleno.
 * ├─ intermedio  octágono, 8 nodos, anillo interior con relieve, navy.
 * ├─ avanzado    12 facetas, relleno navy→teal y trazo degradado.
 * └─ elite       14 facetas + anillo reticulado exterior, con resplandor.
 *
 * Bloqueada = atenuada, nunca escondida: saber qué falta es la mitad de para
 * qué sirven. Es el mismo criterio que ya usaba el perfil.
 */

const VB = 100;
const C = VB / 2;

/*
 * Polígono regular de n lados, con la punta arriba.
 *
 * EXPORTADO PARA LA INSIGNIA DE LIGA. El distintivo de nivel de las ligas usa
 * esta misma geometría y el mismo LADOS de abajo, no una copia parecida: si
 * algún día el marco intermedio deja de ser un octágono, deja de serlo en los
 * dos sitios a la vez. Ver InsigniaLiga.jsx.
 */
export function poligono(n, r, cx = C, cy = C) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

/* Los vértices sueltos, para dibujar los nodos del marco base e intermedio. */
function vertices(n, r, cx = C, cy = C) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

export const NIVELES = ["base", "intermedio", "avanzado", "elite"];

export const ETIQUETA_NIVEL = {
  base: "Base",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  elite: "Élite",
};

/* Cuántos lados tiene el marco de cada nivel. Exportado: ver poligono(). */
export const LADOS = { base: 6, intermedio: 8, avanzado: 12, elite: 14 };

/* ------------------------------- los iconos ------------------------------- */

/*
 * Familias de iconos. Se dibujan sobre una caja de 40×40 centrada en el marco,
 * en trazo, para que el mismo glifo funcione atenuado y a todo color.
 *
 * Cada familia agrupa logros conceptualmente parientes: el gráfico de barras
 * sirve a las cuatro medallas de ranking, y lo que las distingue es el marco.
 */
export const ICONOS = {
  /* Racha: llama esquemática, sin fuego de dibujo animado. */
  racha: (c) => (
    <path d="M20 4 C26 12, 31 15, 31 23 A11 11 0 0 1 9 23 C9 17, 13 15, 14 10 C17 14, 16 18, 19 19 C21 16, 20 10, 20 4 Z"
      fill="none" stroke={c} strokeWidth="2.4" strokeLinejoin="round" />
  ),
  /* Ranking: barras crecientes. Vale de Top 10 a Primer lugar del semestre. */
  ranking: (c) => (
    <g fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round">
      <line x1="8" y1="30" x2="8" y2="22" />
      <line x1="20" y1="30" x2="20" y2="14" />
      <line x1="32" y1="30" x2="32" y2="6" />
      <line x1="4" y1="34" x2="36" y2="34" strokeWidth="2" />
    </g>
  ),
  /* Liga: dos rombos enlazados, la forma de las válvulas del sitio. */
  liga: (c) => (
    <g fill="none" stroke={c} strokeWidth="2.4" strokeLinejoin="round">
      <polygon points="14,6 24,20 14,34 4,20" />
      <polygon points="26,6 36,20 26,34 16,20" />
    </g>
  ),
  /* Primera vez: un destello de cuatro puntas, el mismo del botón de ánimo. */
  primero: (c) => (
    <path d="M20 2 C21.6 13, 27 18.4, 38 20 C27 21.6, 21.6 27, 20 38 C18.4 27, 13 21.6, 2 20 C13 18.4, 18.4 13, 20 2 Z"
      fill="none" stroke={c} strokeWidth="2.2" strokeLinejoin="round" />
  ),
  /* Quiz: diana. Acierto, no premio. */
  quiz: (c) => (
    <g fill="none" stroke={c} strokeWidth="2.4">
      <circle cx="20" cy="20" r="15" />
      <circle cx="20" cy="20" r="8" />
      <circle cx="20" cy="20" r="2" fill={c} />
    </g>
  ),
  /* Perfil: silueta geométrica, sin caricatura. */
  perfil: (c) => (
    <g fill="none" stroke={c} strokeWidth="2.4" strokeLinejoin="round">
      <circle cx="20" cy="13" r="7" />
      <path d="M6 36 C6 26, 34 26, 34 36" />
    </g>
  ),
  /* Módulo: un bloque con su marca de cierre. */
  modulo: (c) => (
    <g fill="none" stroke={c} strokeWidth="2.4" strokeLinejoin="round">
      <rect x="5" y="7" width="30" height="26" rx="4" />
      <path d="M12 20 l6 6 l11 -13" />
    </g>
  ),
  /* Curso: pila de módulos. */
  curso: (c) => (
    <g fill="none" stroke={c} strokeWidth="2.4" strokeLinejoin="round">
      <rect x="6" y="6" width="28" height="8" rx="2.5" />
      <rect x="6" y="17" width="28" height="8" rx="2.5" />
      <rect x="6" y="28" width="28" height="8" rx="2.5" />
    </g>
  ),
  /* Periodo: calendario esquemático, para semana y semestre. */
  periodo: (c) => (
    <g fill="none" stroke={c} strokeWidth="2.4" strokeLinejoin="round">
      <rect x="5" y="9" width="30" height="27" rx="4" />
      <line x1="5" y1="17" x2="35" y2="17" />
      <line x1="13" y1="4" x2="13" y2="11" />
      <line x1="27" y1="4" x2="27" y2="11" />
    </g>
  ),
  /* Grupo: tres nodos unidos, el lenguaje de red del logo. */
  grupo: (c) => (
    <g fill="none" stroke={c} strokeWidth="2.4">
      <circle cx="20" cy="8" r="4.5" />
      <circle cx="8" cy="30" r="4.5" />
      <circle cx="32" cy="30" r="4.5" />
      <path d="M18 12 L10 26 M22 12 L30 26 M13 30 L27 30" strokeLinecap="round" />
    </g>
  ),
  /* Tendencia: la línea que sube, para progreso y desempeño sostenido. */
  tendencia: (c) => (
    <g fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 30 L15 20 L23 26 L35 10" />
      <path d="M27 10 L35 10 L35 18" />
    </g>
  ),
  /* Dominio: el rombo lleno dentro del anillo. El tope de la familia. */
  dominio: (c) => (
    <g fill="none" stroke={c} strokeWidth="2.4" strokeLinejoin="round">
      <circle cx="20" cy="20" r="16" />
      <polygon points="20,7 31,20 20,33 9,20" fill={c} fillOpacity="0.85" />
    </g>
  ),
  /* Meta: el conjunto completo. Un marco dentro de otro. */
  meta: (c) => (
    <g fill="none" stroke={c} strokeWidth="2.3" strokeLinejoin="round">
      <polygon points="20,3 34,11 34,29 20,37 6,29 6,11" />
      <polygon points="20,12 27,16 27,24 20,28 13,24 13,16" fill={c} fillOpacity="0.7" />
    </g>
  ),
};

/* --------------------------------- la pieza --------------------------------- */

/**
 * @param {object} p
 * @param {"base"|"intermedio"|"avanzado"|"elite"} p.nivel  qué marco se dibuja
 * @param {string} [p.icono]   clave de ICONOS; manda sobre `numero` si van los dos
 * @param {string|number} [p.numero]  para las medallas que llevan cifra dentro
 * @param {boolean} [p.obtenida]
 * @param {number} [p.tamano]  lado en píxeles
 */
export default function Medalla({ nivel = "base", icono, numero, obtenida = false, tamano = 76 }) {
  const lados = LADOS[nivel] ?? 6;
  const id = `med-${nivel}-${icono ?? "num"}-${obtenida ? "on" : "off"}`;

  /*
   * Atenuada, no escondida. Se baja la opacidad y se apagan los colores a un
   * gris azulado, conservando la forma: se sigue viendo qué medalla es.
   */
  const trazo = obtenida ? undefined : "rgba(248,249,250,0.3)";
  const tinta = obtenida ? FAE.text : "rgba(248,249,250,0.38)";

  /* Color del marco por nivel, ya resuelto para el estado. */
  const marco = obtenida
    ? { base: "rgba(248,249,250,0.6)", intermedio: FAE.navyClaro ?? "#2E5385", avanzado: `url(#${id}-borde)`, elite: `url(#${id}-borde)` }[nivel]
    : trazo;

  const relleno = obtenida && (nivel === "avanzado" || nivel === "elite") ? `url(#${id}-relleno)` : "none";

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      width={tamano}
      height={tamano}
      aria-hidden="true"
      style={{ display: "block", overflow: "visible", opacity: obtenida ? 1 : 0.55 }}
    >
      <defs>
        <linearGradient id={`${id}-borde`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={FAE.coral} />
          <stop offset="100%" stopColor={FAE.teal} />
        </linearGradient>
        <linearGradient id={`${id}-relleno`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={FAE.navy} />
          <stop offset="100%" stopColor={FAE.teal} stopOpacity={nivel === "elite" ? 0.55 : 0.4} />
        </linearGradient>
        {nivel === "elite" && obtenida && (
          <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/*
        Élite: el nivel vive sobre navy oscuro incluso dentro de una tarjeta
        clara, que es lo que lo reserva visualmente para lo de arriba.
      */}
      {nivel === "elite" && (
        <polygon points={poligono(lados, 46)} fill={obtenida ? "#0A1422" : "rgba(10,20,34,0.45)"} />
      )}

      <g filter={nivel === "elite" && obtenida ? `url(#${id}-glow)` : undefined}>
        {/* Anillo reticulado exterior, solo en élite. */}
        {nivel === "elite" && (
          <g stroke={marco} strokeWidth="1" opacity="0.6" fill="none">
            <polygon points={poligono(lados, 45)} />
            {vertices(lados, 45).map((v, i) => (
              <line key={i} x1={C} y1={C} x2={v.x} y2={v.y} strokeWidth="0.6" opacity="0.5" />
            ))}
          </g>
        )}

        {/* El marco. */}
        <polygon
          points={poligono(lados, nivel === "elite" ? 38 : 40)}
          fill={relleno}
          stroke={marco}
          strokeWidth={nivel === "base" ? 2.2 : 2.8}
          strokeLinejoin="round"
        />

        {/* Anillo interior con relieve, del intermedio hacia arriba. */}
        {nivel !== "base" && (
          <polygon
            points={poligono(lados, nivel === "elite" ? 31 : 33)}
            fill="none"
            stroke={marco}
            strokeWidth="1"
            opacity="0.45"
          />
        )}

        {/* Los nodos del marco. En base, uno solo va en coral: el activo. */}
        {(nivel === "base" || nivel === "intermedio") &&
          vertices(lados, nivel === "base" ? 40 : 40).map((v, i) => (
            <circle
              key={i}
              cx={v.x}
              cy={v.y}
              r={nivel === "base" ? 3.4 : 2.8}
              fill={obtenida && nivel === "base" && i === 0 ? FAE.coral : marco}
            />
          ))}
      </g>

      {/* El interior: o un icono, o una cifra. Nunca los dos. */}
      <g transform={`translate(${C - 20}, ${C - 20})`}>
        {icono && ICONOS[icono] ? (
          ICONOS[icono](tinta)
        ) : (
          <text
            x="20"
            y="28"
            textAnchor="middle"
            fontFamily="Sora, sans-serif"
            fontWeight="800"
            fontSize={String(numero).length > 2 ? 22 : 27}
            letterSpacing="-1"
            fill={tinta}
          >
            {numero}
          </text>
        )}
      </g>
    </svg>
  );
}
