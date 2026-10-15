import { useContext } from "react";
import { NavigationContext } from "../navigation.js";

/*
 * Marca AprendeFAE. Símbolo: dos nodos en la base y un vértice coral arriba,
 * unidos por un trazo — la idea de conectar puntos hasta llegar a lo alto.
 *
 * Siempre es un elemento accionable y siempre lleva al inicio: el destino se
 * resuelve desde NavigationContext para que ningún lugar de uso tenga que
 * volver a cablearlo. `onClick` solo existe para casos que necesiten otra cosa.
 */

const NAVY = "#1D3557";
const LIGHT = "#F8F9FA";
const CORAL = "#E76F51";

export default function Logo({
  variant = "full",
  size = 32,
  theme = "dark",
  onClick,
  label = "AprendeFAE — ir al inicio",
}) {
  const nav = useContext(NavigationContext);
  const handleClick = onClick || nav?.goHome;

  /* Sobre fondo oscuro el trazo y los nodos base van en el neutro claro; el vértice siempre es coral. */
  const ink = theme === "dark" ? LIGHT : NAVY;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      /* La zona de toque la agranda global.css; aquí solo va el enganche. */
      className="fae-logo-boton"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${size * 0.28}px`,
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        lineHeight: 1,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ display: "block" }}>
        <path
          d="M6 24 L16 7 L26 24"
          stroke={ink}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="6" cy="24" r="3.6" fill={ink} />
        <circle cx="26" cy="24" r="3.6" fill={ink} />
        <circle cx="16" cy="7" r="3.9" fill={CORAL} />
      </svg>

      {variant === "full" && (
        <span
          style={{
            fontFamily: "Sora, sans-serif",
            letterSpacing: "-0.035em",
            fontSize: `${size * 0.6}px`,
            color: ink,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontWeight: 300 }}>aprende</span>
          <span style={{ fontWeight: 700 }}>FAE</span>
        </span>
      )}
    </button>
  );
}
