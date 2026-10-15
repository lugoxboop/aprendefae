import { FAE } from "../../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA MARCA DE NIVEL DEL PANEL: UNA FORMA POR NIVEL, NO UN PUNTO DE COLOR.
 *
 * El panel marca cada alerta con un punto de 8 px en coral, ámbar o teal. Coral
 * y teal miden lo mismo en gris (1,07:1), y en la fila cerrada de un estudiante
 * el punto era lo ÚNICO que decía algo: la palabra vivía en un `title` —que
 * solo sale al pasar el ratón, no en el móvil ni con el teclado— y en el
 * aria-label. Para quien no distingue esos dos tonos, o con la pantalla en
 * blanco y negro, «urgente» y «destacado» eran el mismo punto: los dos extremos
 * opuestos de la lista.
 *
 * Aquí el nivel se dice con la silueta y el color la acompaña:
 *
 *   urgente      ▲ triángulo   coral    pide actuar
 *   atención     ◆ rombo       ámbar    conviene mirar
 *   informativa  ● círculo     teal     para saber
 *   destacado    ★ estrella    teal     alguien que va bien
 *   sin señal    · punto tenue
 *
 * El coral SIGUE siendo alarma aquí (en este panel sí lo es). Lo que cambia es
 * que ya no es lo único que lo dice.
 *
 * Los cuatro símbolos son de relleno y de tamaño parecido a propósito: se
 * distinguen por contorno, no por quién pesa más. Todos son aria-hidden: junto
 * a cada uno va la palabra (en la cabecera y en el detalle) o el aria-label de
 * la fila.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const NIVEL_MARCA = {
  URGENTE: "urgente",
  ATENCION: "atencion",
  INFO: "info",
  DESTACADO: "destacado",
  NINGUNO: "ninguno",
};

const FORMAS = {
  [NIVEL_MARCA.URGENTE]: { color: FAE.coral, d: "M6 1 L11.3 10.6 H0.7 Z" },
  [NIVEL_MARCA.ATENCION]: { color: FAE.ambar, d: "M6 0.7 L11.3 6 L6 11.3 L0.7 6 Z" },
  [NIVEL_MARCA.INFO]: { color: FAE.teal, circulo: 4.8 },
  [NIVEL_MARCA.DESTACADO]: { color: FAE.teal, d: "M6 0.8 L7.41 4.46 L11.33 4.67 L8.28 7.14 L9.29 10.93 L6 8.8 L2.71 10.93 L3.72 7.14 L0.67 4.67 L4.59 4.46 Z" },
  [NIVEL_MARCA.NINGUNO]: { color: "rgba(248,249,250,0.18)", circulo: 3 },
};

export default function MarcaNivel({ nivel, tamano = 12 }) {
  const f = FORMAS[nivel] ?? FORMAS[NIVEL_MARCA.NINGUNO];
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      data-nivel={FORMAS[nivel] ? nivel : NIVEL_MARCA.NINGUNO}
      style={{ flexShrink: 0, display: "block" }}
    >
      {f.circulo ? (
        <circle cx="6" cy="6" r={f.circulo} fill={f.color} />
      ) : (
        <path d={f.d} fill={f.color} stroke={f.color} strokeWidth="0.6" strokeLinejoin="round" />
      )}
    </svg>
  );
}
