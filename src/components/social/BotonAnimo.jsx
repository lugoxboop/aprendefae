import { useState } from "react";
import { FAE } from "../../theme.js";
import { darAnimo } from "../../social/animo.js";

/*
 * Botón de ánimo, para pegar a una fila que ya muestra el apodo de otro
 * estudiante junto a un logro.
 *
 * ICONO: un destello de cuatro puntas, dibujado a mano en SVG. No es pulgar
 * arriba, ni corazón, ni medalla — la regla de no usar iconografía gamificada
 * de catálogo vale también aquí. Es una forma geométrica que sugiere chispa sin
 * parecerse a un premio.
 *
 * NUNCA aparece en la fila propia: quien llama decide, y además la base rechaza
 * el intento con un check, así que no depende de que la interfaz se porte bien.
 */

function Destello({ tamano = 13, relleno }) {
  /* Cuatro puntas con lados cóncavos: se lee como chispa, no como estrella de premio. */
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" aria-hidden="true" style={{ display: "block" }}>
      <path
        d="M12 1 C13 8, 16 11, 23 12 C16 13, 13 16, 12 23 C11 16, 8 13, 1 12 C8 11, 11 8, 12 1 Z"
        fill={relleno}
      />
    </svg>
  );
}

export default function BotonAnimo({ apodo, recibidos = 0, yaLeDi = false, onDado }) {
  const [estado, setEstado] = useState(yaLeDi ? "dado" : "libre");
  const [cuenta, setCuenta] = useState(recibidos);
  const [destellando, setDestellando] = useState(false);

  const yaEsta = estado === "dado";

  const pulsar = async (e) => {
    e.stopPropagation();
    if (yaEsta || estado === "enviando") return;

    setEstado("enviando");
    const r = await darAnimo(apodo);

    if (r === "error") {
      setEstado("libre");
      return;
    }
    if (r === "nuevo") {
      setCuenta((n) => n + 1);
      setDestellando(true);
      setTimeout(() => setDestellando(false), 420);
    }
    /* "repetido" también bloquea: ya lo había dado esta semana desde otra pantalla. */
    setEstado("dado");
    onDado?.(apodo);
  };

  return (
    <button
      type="button"
      onClick={pulsar}
      disabled={yaEsta || estado === "enviando"}
      aria-label={yaEsta ? `Ya le diste ánimo a ${apodo} esta semana` : `Dar ánimo a ${apodo}`}
      title={yaEsta ? "Ya le diste ánimo esta semana" : "Dar ánimo"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 9px",
        borderRadius: "999px",
        border: `1px solid ${yaEsta ? "rgba(231,111,81,0.5)" : "rgba(248,249,250,0.16)"}`,
        background: yaEsta ? "rgba(231,111,81,0.16)" : "rgba(248,249,250,0.05)",
        cursor: yaEsta ? "default" : "pointer",
        /* El destello: un pulso corto al registrarse, sin insignias ni medallas. */
        transform: destellando ? "scale(1.18)" : "scale(1)",
        transition: "transform 200ms cubic-bezier(.34,1.56,.64,1), background 200ms ease, border-color 200ms ease",
        flexShrink: 0,
      }}
    >
      <Destello relleno={yaEsta || destellando ? FAE.coral : "rgba(248,249,250,0.45)"} />
      <span
        style={{
          fontFamily: "Sora, sans-serif",
          fontSize: "11.5px",
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: yaEsta ? FAE.coral : "rgba(248,249,250,0.6)",
        }}
      >
        {cuenta}
      </span>
    </button>
  );
}
