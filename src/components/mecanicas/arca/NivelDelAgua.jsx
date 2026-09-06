import { FAE } from "../../../theme.js";

/*
 * El nivel del agua — el hilo que cruza las cuatro etapas.
 *
 * NO ES DECORACIÓN, y por eso no está quieto: sube con cada etapa terminada
 * porque el plazo corre pase lo que pase, y sube MÁS si el rendimiento es
 * flojo. En el caso, lo que mata al proyecto no es una mala decisión suelta:
 * es que el tiempo se acaba mientras se discute. Tener el agua a la vista
 * mientras se responde es la única forma de que eso se sienta en vez de
 * contarse.
 *
 * La altura la calcula nivelDelAgua() en arca/puntuacion.js; aquí solo se
 * dibuja. Es una transición CSS larga, sin bucle ni rAF: sube cuando el número
 * cambia y se queda quieta el resto del tiempo.
 */

const CSS = `
@keyframes fae-agua-ola {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.fae-agua-ola { animation: fae-agua-ola 7s linear infinite; }
@keyframes fae-agua-burbuja {
  from { transform: translateY(0); opacity: .55; }
  to   { transform: translateY(-42px); opacity: 0; }
}
.fae-agua-burbuja { animation: fae-agua-burbuja 3.4s ease-in infinite; }
@media (prefers-reduced-motion: reduce) {
  .fae-agua-ola, .fae-agua-burbuja { animation: none !important; }
  .fae-agua-nivel { transition: none !important; }
}
`;

export default function NivelDelAgua({ altura, etapa, total, apremia = false }) {
  const pct = Math.max(0, Math.min(100, altura));
  /* Por encima de tres cuartos el agua avisa: el ámbar es el nivel medio del kit. */
  const color = pct >= 75 ? FAE.ambar : FAE.teal;

  return (
    <div
      style={{
        display: "flex", alignItems: "stretch", gap: "10px",
        borderRadius: "16px", padding: "10px 12px",
        background: "rgba(10,20,34,0.55)",
        border: "1px solid rgba(248,249,250,0.12)",
      }}
    >
      <style>{CSS}</style>

      {/* La probeta. */}
      <div
        aria-hidden="true"
        style={{
          position: "relative", width: "26px", minHeight: "78px", flexShrink: 0,
          borderRadius: "8px", overflow: "hidden",
          background: "rgba(248,249,250,0.05)",
          border: "1px solid rgba(248,249,250,0.16)",
        }}
      >
        {/* El agua. */}
        <div
          className="fae-agua-nivel"
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            height: `${pct}%`,
            background: `linear-gradient(to bottom, ${color}cc, ${color}66)`,
            transition: "height 1400ms cubic-bezier(.4,0,.2,1), background 600ms ease",
          }}
        >
          {/* Una ola encima de la lámina, dibujada dos veces para poder correrla. */}
          <div
            className="fae-agua-ola"
            style={{
              position: "absolute", top: "-4px", left: 0, width: "200%", height: "8px",
              background: `repeating-linear-gradient(to right, ${color} 0 6px, transparent 6px 12px)`,
              opacity: 0.75, borderRadius: "50%",
            }}
          />
          <span
            className="fae-agua-burbuja"
            style={{
              position: "absolute", left: "7px", bottom: "6px",
              width: "4px", height: "4px", borderRadius: "999px", background: "#F8F9FA",
            }}
          />
        </div>
      </div>

      {/* La lectura. */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(248,249,250,0.45)", margin: "0 0 3px" }}>
          NIVEL DEL AGUA
        </p>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "17px", fontWeight: 700, color, margin: 0, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {pct}%
        </p>
        <p style={{ fontSize: "11px", color: "rgba(248,249,250,0.5)", margin: "5px 0 0", lineHeight: 1.35 }}>
          Etapa {etapa} de {total}
          {apremia && (
            <>
              <br />
              <span style={{ color: FAE.ambar }}>El agua sube más rápido.</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
