import { FAE } from "../../theme.js";

/*
 * Camino de actividades para la mitad "Hacer" de cualquier tema.
 *
 * NINGÚN NODO SE BLOQUEA, NUNCA. La inspiración visual es Duolingo, pero eso
 * de ahí no se copia: el camino ordena y sugiere un recorrido, no lo impone.
 * Se puede saltar del nodo 2 al 9 sin fricción, igual que en el resto del
 * sitio se puede entrar a cualquier tema en cualquier orden. Que un nodo esté
 * sin hacer cambia cómo se ve, jamás si se puede pulsar.
 *
 * EL PROBLEMA CENTRAL ES QUE SE VEA INTENCIONADO CON CUALQUIER NÚMERO DE
 * NODOS. Un tema con uno solo no puede parecer una página rota con hueco de
 * sobra, y uno con quince no puede salirse ni apelotonarse. Por eso aquí no
 * hay ni una medida fija: separación, radio, grosor y amplitud del serpenteo
 * salen todos del número de nodos, con topes por arriba y por abajo.
 */

/* ---------------------------- medidas que respiran ---------------------------- */

const ANCHO = 420;                 // ancho del lienzo; la altura se calcula
const MARGEN_Y = 74;               // aire arriba y abajo, para que no roce el borde

/* Un valor que se mueve entre dos topes según cuántos nodos haya. */
const entre = (min, valor, max) => Math.max(min, Math.min(max, valor));

/*
 * Con pocos nodos el camino se estira para llenar la vista; con muchos se
 * comprime hasta un mínimo legible y a partir de ahí la página se desplaza,
 * que es preferible a apretar los nodos hasta que se toquen.
 */
export function medidas(n) {
  const separacion = n <= 1 ? 0 : entre(78, Math.round(760 / (n - 1)), 148);
  const radio = entre(17, Math.round(34 - n * 0.9), 30);
  const grosor = entre(2, Math.round(5 - n * 0.15), 4.5);
  /* La amplitud del serpenteo se abre con pocos nodos y se cierra con muchos. */
  const amplitud = n <= 1 ? 0 : entre(52, Math.round(ANCHO * 0.30 - n * 1.6), 132);
  const alto = n <= 1 ? 232 : separacion * (n - 1) + MARGEN_Y * 2;
  return { separacion, radio, grosor, amplitud, alto };
}

/* Dónde cae cada nodo. Un seno da el serpenteo sin esquinas de videojuego. */
export function posiciones(n, m) {
  const centro = ANCHO / 2;
  if (n === 1) return [{ x: centro, y: m.alto / 2 }];
  /*
   * Los nodos alternan lado estrictamente, así el camino queda equilibrado
   * alrededor del centro con cualquier cantidad. El factor variable evita que
   * la alternancia se vea mecánica: cada nodo se aparta un poco distinto.
   *
   * Un seno simple no servía: con dos a cinco nodos se iba entero hacia la
   * derecha, que es justo el caso más común hoy.
   */
  return Array.from({ length: n }, (_, i) => ({
    x: centro + m.amplitud * Math.cos(i * Math.PI) * (0.72 + 0.28 * Math.sin(i * 1.3)),
    y: MARGEN_Y + i * m.separacion,
  }));
}

/*
 * Curva suave que pasa por todos los puntos (Catmull-Rom convertido a Bézier).
 * Se usa esto y no una polilínea porque el lenguaje de líneas del sitio —la
 * red de la portada, los flujos de Demanda Agregada— es curvo, y un zigzag
 * rígido cantaría a plantilla de otro producto.
 */
export function trazo(p) {
  if (p.length < 2) return "";
  let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/* ------------------------------ el nodo especial ------------------------------ */

/*
 * Un tema puede tener, además de su camino, UN nodo de desafío al lado. No es
 * una actividad más con otro color: está fuera de la secuencia numerada, tiene
 * su propio ramal, es más grande y respira con un halo ámbar.
 *
 * ESTÁ FUERA DEL CAMINO A PROPÓSITO. Meterlo dentro lo convertiría en "la
 * novena", y entonces no completar el tema por no haberlo hecho sería un
 * bloqueo encubierto. Colgado de un ramal se lee como lo que es: algo extra que
 * está ahí para quien quiera.
 *
 * Cuando no se pasa `especial`, nada de esto se dibuja y el lienzo mantiene su
 * ancho de siempre: los caminos de los demás temas no cambian ni un píxel.
 */
const ANCHO_RAMAL = 176;

const CSS_ESPECIAL = `
@keyframes fae-ch-halo {
  0%, 100% { opacity: .16; transform: scale(1); }
  50%      { opacity: .38; transform: scale(1.13); }
}
.fae-ch-halo { transform-box: fill-box; transform-origin: center; animation: fae-ch-halo 3.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .fae-ch-halo { animation: none !important; } }
`;

/* --------------------------------- la pieza --------------------------------- */

/**
 * @param {object} p
 * @param {Array<{id:string, nombre:string, completada:boolean}>} p.nodos
 * @param {(id:string) => void} p.onAbrir
 * @param {string} [p.vacio] qué decir cuando el tema todavía no tiene juegos
 * @param {{id:string, nombre:string, completada:boolean, etiqueta?:string}} [p.especial]
 *        nodo de desafío al lado del camino; sin él, nada cambia
 */
export default function CaminoHacer({ nodos = [], onAbrir, vacio, especial = null }) {
  const n = nodos.length;

  /*
   * Un tema sin juegos todavía. Se dice y ya: inventar nodos apagados de
   * relleno para que el camino "se vea" sería prometer contenido que no está.
   */
  if (n === 0) {
    return (
      <div
        style={{
          borderRadius: "18px",
          background: "rgba(248,249,250,0.04)",
          border: "1px dashed rgba(248,249,250,0.2)",
          padding: "clamp(24px, 4vw, 38px)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.55)", margin: 0 }}>
          {vacio ?? "Los juegos de este tema están en construcción."}
        </p>
      </div>
    );
  }

  const m = medidas(n);
  const p = posiciones(n, m);
  const d = trazo(p);
  /* El siguiente sugerido: el primero sin hacer. Sugerencia, no puerta. */
  const sugerido = nodos.findIndex((x) => !x.completada);

  /*
   * El desafío cuelga de un ramal a la derecha, a la altura del tercio superior
   * del camino: lo bastante arriba para verse sin desplazarse y lo bastante
   * abajo para no competir con el primer nodo.
   */
  const anchoTotal = especial ? ANCHO + ANCHO_RAMAL : ANCHO;
  const radioEspecial = Math.round(m.radio * 1.45);
  const desdeIndice = Math.min(n - 1, Math.max(0, Math.round((n - 1) * 0.34)));
  const anclaje = p[desdeIndice];
  const esp = especial
    ? { x: ANCHO + ANCHO_RAMAL / 2 - 8, y: Math.max(anclaje.y, MARGEN_Y + radioEspecial) }
    : null;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {especial && <style>{CSS_ESPECIAL}</style>}
      <svg
        viewBox={`0 0 ${anchoTotal} ${m.alto}`}
        width="100%"
        style={{ display: "block", maxWidth: `${anchoTotal}px`, overflow: "visible" }}
      >
        {/* La línea del recorrido, por debajo de todo. */}
        {d && (
          <path
            d={d}
            fill="none"
            stroke="rgba(248,249,250,0.22)"
            strokeWidth={m.grosor}
            strokeLinecap="round"
          />
        )}
        {/*
          El tramo ya recorrido, en teal encima del gris. Se dibuja hasta el
          último nodo hecho: enseña avance real sin cerrarle el paso a nadie.
        */}
        {d && sugerido !== 0 && (
          <path
            d={trazo(p.slice(0, sugerido === -1 ? n : sugerido + 1))}
            fill="none"
            stroke={FAE.teal}
            strokeWidth={m.grosor}
            strokeLinecap="round"
            opacity="0.75"
          />
        )}

        {nodos.map((nodo, i) => {
          const { x, y } = p[i];
          const esSugerido = i === sugerido && n > 1;
          return (
            <g
              key={nodo.id}
              onClick={() => onAbrir?.(nodo.id)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                onAbrir?.(nodo.id);
              }}
              role="button"
              tabIndex={0}
              aria-label={`${nodo.nombre}${nodo.completada ? " · completada" : ""}`}
              style={{ cursor: "pointer" }}
            >
              {/* Aro coral del sugerido: acento, no candado. */}
              {esSugerido && (
                <circle cx={x} cy={y} r={m.radio + 7} fill="none" stroke={FAE.coral} strokeWidth="2" opacity="0.75" />
              )}

              <circle
                cx={x}
                cy={y}
                r={m.radio}
                fill={nodo.completada ? FAE.teal : "rgba(14,27,46,0.85)"}
                stroke={nodo.completada ? FAE.teal : "rgba(248,249,250,0.45)"}
                strokeWidth="2"
              />

              {/* El número dentro. Orienta sin ordenar. */}
              <text
                x={x}
                y={y + m.radio * 0.34}
                textAnchor="middle"
                fontFamily="Sora, sans-serif"
                fontWeight="700"
                fontSize={m.radio * 0.92}
                fill={nodo.completada ? FAE.bg : "rgba(248,249,250,0.75)"}
                pointerEvents="none"
              >
                {i + 1}
              </text>

              {/*
                El nombre, al lado que quede libre: si el nodo se fue a la
                derecha el rótulo va a su izquierda, y al revés. Así nunca se
                sale del lienzo por el lado por el que serpentea.
              */}
              <text
                x={x < ANCHO / 2 ? x + m.radio + 12 : x - m.radio - 12}
                y={y + 5}
                textAnchor={x < ANCHO / 2 ? "start" : "end"}
                fontFamily="Inter, sans-serif"
                fontSize="13.5"
                fill={nodo.completada ? FAE.text : "rgba(248,249,250,0.7)"}
                pointerEvents="none"
              >
                {nodo.nombre}
              </text>
            </g>
          );
        })}

        {/* ------------------------- el nodo de desafío ------------------------- */}
        {esp && (
          <g>
            {/* El ramal, discontinuo: sale del camino pero no es parte de él. */}
            <path
              d={`M ${anclaje.x} ${anclaje.y} C ${(anclaje.x + esp.x) / 2} ${anclaje.y}, ${(anclaje.x + esp.x) / 2} ${esp.y}, ${esp.x - radioEspecial} ${esp.y}`}
              fill="none"
              stroke={FAE.ambar}
              strokeWidth={m.grosor * 0.8}
              strokeLinecap="round"
              strokeDasharray="6 7"
              opacity="0.5"
            />

            <g
              onClick={() => onAbrir?.(especial.id)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                onAbrir?.(especial.id);
              }}
              role="button"
              tabIndex={0}
              aria-label={`${especial.etiqueta ? `${especial.etiqueta}: ` : ""}${especial.nombre}${especial.completada ? " · completada" : ""}`}
              style={{ cursor: "pointer" }}
            >
              {/* El halo, que es lo que lo hace "legendario" sin gritar. */}
              <circle
                className="fae-ch-halo"
                cx={esp.x}
                cy={esp.y}
                r={radioEspecial + 13}
                fill={FAE.ambar}
              />
              <circle
                cx={esp.x}
                cy={esp.y}
                r={radioEspecial + 5}
                fill="none"
                stroke={FAE.ambar}
                strokeWidth="1.5"
                opacity="0.4"
              />

              <circle
                cx={esp.x}
                cy={esp.y}
                r={radioEspecial}
                fill={especial.completada ? FAE.ambar : "rgba(14,27,46,0.95)"}
                stroke={FAE.ambar}
                strokeWidth="3"
              />

              {/* Una ola dentro: es el nivel del agua del propio desafío. */}
              <path
                d={`M ${esp.x - radioEspecial * 0.52} ${esp.y + radioEspecial * 0.16}
                    q ${radioEspecial * 0.26} ${-radioEspecial * 0.3}, ${radioEspecial * 0.52} 0
                    t ${radioEspecial * 0.52} 0`}
                fill="none"
                stroke={especial.completada ? FAE.bg : FAE.ambar}
                strokeWidth="2.4"
                strokeLinecap="round"
                pointerEvents="none"
              />
              <path
                d={`M ${esp.x - radioEspecial * 0.52} ${esp.y + radioEspecial * 0.5}
                    q ${radioEspecial * 0.26} ${-radioEspecial * 0.3}, ${radioEspecial * 0.52} 0
                    t ${radioEspecial * 0.52} 0`}
                fill="none"
                stroke={especial.completada ? FAE.bg : FAE.ambar}
                strokeWidth="2.4"
                strokeLinecap="round"
                opacity="0.6"
                pointerEvents="none"
              />

              {/* El rótulo, debajo y en dos líneas: el nombre es largo. */}
              <text
                x={esp.x}
                y={esp.y + radioEspecial + 24}
                textAnchor="middle"
                fontFamily="Sora, sans-serif"
                fontWeight="700"
                fontSize="10"
                letterSpacing="1.4"
                fill={FAE.ambar}
                pointerEvents="none"
              >
                {(especial.etiqueta ?? "DESAFÍO").toUpperCase()}
              </text>
              <text
                x={esp.x}
                y={esp.y + radioEspecial + 40}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="13"
                fill={FAE.text}
                pointerEvents="none"
              >
                {especial.nombre}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
