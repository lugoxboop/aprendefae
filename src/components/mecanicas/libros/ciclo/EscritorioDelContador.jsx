import { FAE } from "../../../../theme.js";

/*
 * El dibujo de dentro del nodo del desafío de Contabilidad: un escritorio
 * visto desde arriba con tres hojas en fila —el diario, el mayor y el estado—
 * y la balanza de la ecuación en el borde.
 *
 * SOLO EL DIBUJO. El aro ámbar, el halo que respira y el relleno al
 * completarlo los pone IconoDesafio, que es lo común a todos los desafíos.
 * Las olas son el Arca, la mesa de junta es NOVA, y esto es este.
 *
 * SIN TEXTO Y SIN CIFRAS: se ve a 30 px de diámetro en el teléfono. Tres
 * rectángulos y una viga con dos platillos es todo lo que sobrevive a ese
 * tamaño, y se dibuja en proporciones del radio para que sirva igual en la
 * tarjeta (r=21) que en el ramal (r≈43).
 */
export default function EscritorioDelContador({ cx, cy, r, completada }) {
  const tinta = completada ? FAE.bg : FAE.ambar;
  const trazo = Math.max(1.5, r * 0.055);
  const ancho = r * 0.26;
  const alto = r * 0.5;
  const arriba = cy - r * 0.08;

  return (
    <>
      {/* Las tres hojas, de izquierda a derecha: diario, mayor, estado. */}
      {[-1, 0, 1].map((k) => (
        <rect
          key={k}
          x={cx + k * (ancho + r * 0.09) - ancho / 2}
          y={arriba}
          width={ancho} height={alto}
          rx={r * 0.05}
          fill="none" stroke={tinta} strokeWidth={trazo}
          opacity={k === 0 ? 1 : 0.8}
          pointerEvents="none"
        />
      ))}
      {/* La balanza, en el borde de arriba: nivelada. */}
      <line
        x1={cx - r * 0.4} y1={cy - r * 0.4} x2={cx + r * 0.4} y2={cy - r * 0.4}
        stroke={tinta} strokeWidth={trazo} strokeLinecap="round" pointerEvents="none"
      />
      <line
        x1={cx} y1={cy - r * 0.55} x2={cx} y2={cy - r * 0.4}
        stroke={tinta} strokeWidth={trazo} strokeLinecap="round" pointerEvents="none"
      />
      {[-1, 1].map((s) => (
        <circle
          key={s}
          cx={cx + s * r * 0.4} cy={cy - r * 0.31} r={r * 0.075}
          fill="none" stroke={tinta} strokeWidth={trazo} pointerEvents="none"
        />
      ))}
    </>
  );
}
