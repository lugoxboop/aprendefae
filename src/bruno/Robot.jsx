/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL ROBOT DE BRUNO (orden de Mateo, 30-oct: «en vez de una B, un pequeño robot
 * animado»).
 *
 * Una cabeza redonda color teal, visor oscuro, dos ojos menta y una antena con
 * luz ámbar. Se mueve solo cuando algo pasa —nada en bucle permanente, regla del
 * Kit—:
 *   · saluda  → al abrir el panel inclina la cabeza y entra (una vez);
 *   · pensando → mientras espera la respuesta, la luz de la antena late y los
 *                ojos miran a los lados (con un número fijo de repeticiones);
 *   · parpadeo → cada vez que llega un mensaje nuevo, parpadea una vez.
 * Las animaciones viven en el CSS de Bruno.jsx (clases fae-bruno-robot-*).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TEAL = "#2A9D8F";
const TEAL_CLARO = "#3DBBAB";
const VISOR = "#0B1626";
const OJO = "#8FF5E3";
const AMBAR = "#E9C46A";

export default function Robot({ tamano = 36, estado = "quieto", parpadeo = 0, className = "" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={tamano}
      height={tamano}
      aria-hidden="true"
      focusable="false"
      data-bruno-robot={estado}
      className={`fae-bruno-robot ${className}`}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Antena */}
      <line x1="24" y1="7.5" x2="24" y2="13" stroke="#C9D3E0" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="5.5" r="3.2" fill={AMBAR} className="fae-bruno-robot-antena" />
      {/* Orejas */}
      <rect x="3.5" y="21" width="5" height="10" rx="2.2" fill={TEAL_CLARO} />
      <rect x="39.5" y="21" width="5" height="10" rx="2.2" fill={TEAL_CLARO} />
      {/* Cabeza */}
      <rect x="7.5" y="12" width="33" height="28" rx="11" fill={TEAL} />
      <rect x="11" y="14.5" width="18" height="3" rx="1.5" fill="#F8F9FA" opacity="0.22" />
      {/* Visor */}
      <rect x="12.5" y="19" width="23" height="15" rx="7.5" fill={VISOR} />
      {/* Ojos: el grupo de fuera mira a los lados; el de dentro parpadea. */}
      <g className="fae-bruno-robot-mirada">
        <g key={parpadeo} className="fae-bruno-robot-ojos">
          <rect x="17.5" y="22.5" width="4.2" height="6.4" rx="2.1" fill={OJO} />
          <rect x="26.3" y="22.5" width="4.2" height="6.4" rx="2.1" fill={OJO} />
        </g>
      </g>
      {/* Sonrisa */}
      <path d="M21.2 31 q2.8 1.8 5.6 0" fill="none" stroke={OJO} strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}
