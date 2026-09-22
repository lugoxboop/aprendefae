import { FAE } from "../../../theme.js";

/*
 * El dibujo de dentro del nodo del desafío de Política Fiscal: una mesa de
 * junta vista desde arriba, con la pantalla al fondo.
 *
 * SOLO EL DIBUJO. El aro ámbar, el halo que respira y el relleno al
 * completarlo los pone IconoDesafio, que es lo común a todos los desafíos:
 * aquí solo se dice qué desafío es este. Las olas del Arca son el otro.
 *
 * SIN TEXTO Y SIN CIFRAS. Se ve a 30 px de diámetro en el teléfono: una elipse,
 * cuatro sillas y una barra al fondo es todo lo que sobrevive a ese tamaño. Se
 * dibuja en proporciones del radio para que sirva igual en la tarjeta (r=21)
 * que en el ramal (r≈43).
 */
export default function MesaDeJuntas({ cx, cy, r, completada }) {
  const tinta = completada ? FAE.bg : FAE.ambar;
  const trazo = Math.max(1.5, r * 0.055);
  /* Las cuatro sillas: dos arriba y dos abajo de la mesa, a los lados. */
  const sillas = [-0.34, 0.34].flatMap((dx) => [-1, 1].map((s) => [dx, s]));

  return (
    <>
      {/* La pantalla del fondo, arriba: es lo que hace que sea ESTA sala. */}
      <rect
        x={cx - r * 0.46} y={cy - r * 0.6}
        width={r * 0.92} height={r * 0.26}
        rx={r * 0.07}
        fill="none" stroke={tinta} strokeWidth={trazo} opacity="0.95"
        pointerEvents="none"
      />
      {/* La mesa, vista desde arriba. */}
      <ellipse
        cx={cx} cy={cy + r * 0.16} rx={r * 0.52} ry={r * 0.27}
        fill="none" stroke={tinta} strokeWidth={trazo}
        pointerEvents="none"
      />
      {sillas.map(([dx, s], i) => (
        <circle
          key={i}
          cx={cx + r * dx}
          cy={cy + r * 0.16 + s * r * 0.42}
          r={Math.max(1.3, r * 0.075)}
          fill={tinta}
          opacity="0.72"
          pointerEvents="none"
        />
      ))}
    </>
  );
}
