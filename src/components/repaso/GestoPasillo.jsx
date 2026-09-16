import { Lamina, C } from "../shared/previas/previasComun.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA MINIATURA DEL REPASO DIARIO (B6).
 *
 * Una ficha sale por una puerta, cruza el pasillo y entra por otra (0,6 s);
 * luego lo mismo desde otra puerta (0,6 s). Es el gesto del Repaso: lo que
 * llega hoy viene de puertas distintas.
 *
 * Las cuatro puertas son IGUALES a propósito: sin texto y sin ninguna de las
 * cuatro puertas de El Pasillo, para que la miniatura no diga de qué materia
 * sale nada. Sin coral, como todas las previsualizaciones.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const PUERTAS_GESTO = [18, 46, 74, 102];
const ARRIBA = 50;   // el umbral de las puertas
const PASILLO = 68;  // la línea por la que cruza la ficha

/* Dos viajes: de la puerta 1 a la 3, y de la 4 a la 2. Cada uno la mitad del ciclo. */
export const VIAJES = [[0, 2], [3, 1]];
export const SEGUNDOS_POR_VIAJE = 0.6;

function tramo(desde, hasta, ini, fin) {
  const x0 = PUERTAS_GESTO[desde];
  const x1 = PUERTAS_GESTO[hasta];
  const p = (f) => `${(ini + (fin - ini) * f).toFixed(1)}%`;
  return `
  ${p(0)} { transform: translate(${x0}px, ${ARRIBA - 6}px); opacity: 0; }
  ${p(0.12)} { transform: translate(${x0}px, ${ARRIBA - 2}px); opacity: 1; }
  ${p(0.3)} { transform: translate(${x0}px, ${PASILLO}px); opacity: 1; }
  ${p(0.7)} { transform: translate(${x1}px, ${PASILLO}px); opacity: 1; }
  ${p(0.88)} { transform: translate(${x1}px, ${ARRIBA - 2}px); opacity: 1; }
  ${p(0.999)} { transform: translate(${x1}px, ${ARRIBA - 6}px); opacity: 0; }`;
}

export default function GestoPasillo() {
  const ciclo = SEGUNDOS_POR_VIAJE * VIAJES.length;
  const css = `
@keyframes fae-pv-repaso-ficha {${VIAJES.map(([a, b], k) => tramo(a, b, (k / VIAJES.length) * 100, ((k + 1) / VIAJES.length) * 100)).join("")}
}
.fae-pv-repaso-ficha { transform-box: view-box; transform-origin: 0 0; animation: fae-pv-repaso-ficha ${ciclo}s linear infinite; }
`;
  return (
    <Lamina id="repaso-diario" css={css}>
      <rect x="0" y="0" width="120" height="90" fill={C.fondo} />
      {/* El suelo del pasillo. */}
      <path d="M0 52 H120 M0 84 H120" stroke={C.borde} strokeWidth="1" />
      {PUERTAS_GESTO.map((x) => (
        <g key={x}>
          <rect x={x - 9} y="18" width="18" height="32" rx="2" fill={C.tarjeta} stroke={C.hueco} strokeWidth="1.2" />
          <circle cx={x + 5} cy="35" r="1.3" fill={C.silueta} />
        </g>
      ))}
      <circle className="fae-pv-repaso-ficha" cx="0" cy="0" r="4.2" fill={C.luz} />
    </Lamina>
  );
}
