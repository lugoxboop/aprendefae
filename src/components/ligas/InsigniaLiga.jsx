import { FAE } from "../../theme.js";
import { poligono, LADOS } from "../shared/Medalla.jsx";
import { RIQUEZA_NIVEL } from "../../ligas/niveles.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * INSIGNIA DE NIVEL DE LIGA — el distintivo que acompaña al nombre.
 *
 * ═══════════ POR QUÉ NO ES UNA MEDALLA, Y AUN ASÍ ES LA MISMA FAMILIA ═══════
 *
 * `Medalla` es un coleccionable: 76 px, un icono dentro, resplandor en élite, y
 * un estado obtenida/bloqueada que aquí no significa nada —nadie \"desbloquea\"
 * Emergente—. Montarla a 22 px convertiría sus doce facetas y su icono en una
 * mancha.
 *
 * Pero la forma sí se comparte, y de verdad: este archivo IMPORTA `poligono` y
 * `LADOS` de Medalla.jsx en vez de redibujarlos. El hexágono de Emergente es el
 * mismo hexágono del nivel base de las medallas, con los mismos vértices. Si
 * mañana el marco intermedio deja de ser un octágono, deja de serlo en los dos
 * sitios el mismo día — que es exactamente lo que una copia parecida no da.
 *
 * Lo que cambia con el nivel es lo mismo que cambia en las medallas: MÁS CARAS
 * Y MÁS COLOR HACIA ARRIBA. 6 → 8 → 12 → 14 lados, contorno apagado abajo y
 * degradado coral→teal arriba. A 22 px las catorce caras se leen casi como un
 * círculo, y eso está bien: la progresión que hay que percibir es \"cada vez más
 * redondeado y más encendido\", no contar lados.
 *
 * ═══════════ NO LLEVA TEXTO ═══════════
 *
 * El nombre lo pone quien la monta. Así la misma pieza sirve en la cabecera del
 * tablero, donde el nombre es un titular, y en cualquier sitio futuro donde
 * haga falta solo la marca.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * El acento de cada escalón.
 *
 * ═══════════ POR QUÉ EL INTERMEDIO NO ES EL NAVY DE LA MEDALLA ═══════════
 *
 * La medalla usa `FAE.navyClaro ?? "#2E5385"` para el marco intermedio. Aquí se
 * probó y se veía PEOR que el de abajo: a 22 px, un navy oscuro sobre el fondo
 * navy del sitio casi desaparece, mientras que el contorno blanco tenue de
 * Emergente sí se distingue. La escalera quedaba invertida — el segundo escalón
 * menos visible que el primero— que es justo lo contrario de lo que la insignia
 * tiene que comunicar.
 *
 * (Nota de paso: `FAE.navyClaro` no existe en theme.js, así que la medalla vive
 * siempre del literal de respaldo. Funciona ahí porque son 76 px con mucha más
 * masa de trazo.)
 *
 * Se usa `FAE.node`, el azul claro del lenguaje de red del logo: sigue siendo
 * de la familia y sí sube un escalón de brillo respecto a Emergente.
 */
const TRAZO = {
  base: "rgba(248,249,250,0.45)",
  intermedio: FAE.node,
  avanzado: "url(#insignia-liga-borde)",
  elite: "url(#insignia-liga-borde)",
};

export default function InsigniaLiga({ nombre, tamano = 22 }) {
  const riqueza = RIQUEZA_NIVEL[nombre];
  /*
   * Un nombre que no está en la tabla no dibuja nada. Con un solo nivel activo
   * `nombre` llega null a propósito, y ese null tiene que salir por aquí sin
   * pintar un hueco ni un marco vacío.
   */
  if (!riqueza) return null;

  const lados = LADOS[riqueza] ?? 6;
  const trazo = TRAZO[riqueza];
  const conRelleno = riqueza === "avanzado" || riqueza === "elite";

  return (
    <svg
      viewBox="0 0 100 100"
      width={tamano}
      height={tamano}
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0, overflow: "visible" }}
    >
      <defs>
        <linearGradient id="insignia-liga-borde" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={FAE.coral} />
          <stop offset="100%" stopColor={FAE.teal} />
        </linearGradient>
        <linearGradient id="insignia-liga-relleno" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={FAE.navy} />
          <stop offset="100%" stopColor={FAE.teal} stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Élite se asienta sobre navy oscuro, igual que su medalla. */}
      {riqueza === "elite" && <polygon points={poligono(lados, 46)} fill="#0A1422" />}

      <polygon
        points={poligono(lados, 40)}
        fill={conRelleno ? "url(#insignia-liga-relleno)" : "none"}
        stroke={trazo}
        /*
         * El trazo sube con el nivel porque a este tamaño el grosor es la mitad
         * de la señal: un contorno de 5 y uno de 8 se distinguen antes por peso
         * que por número de caras.
         */
        strokeWidth={riqueza === "base" ? 5 : riqueza === "intermedio" ? 6.5 : 8}
        strokeLinejoin="round"
      />

      {/* Élite: el punto central, lo único que la separa de avanzado a este tamaño. */}
      {riqueza === "elite" && <circle cx="50" cy="50" r="9" fill={FAE.coral} />}
    </svg>
  );
}
