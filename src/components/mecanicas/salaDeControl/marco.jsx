import { FAE } from "../../../theme.js";
import { ROTULO, TITULO } from "../../../estilo/jerarquia.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA SALA DE CONTROL DE LA ECONOMÍA — vocabulario compartido.
 *
 * Las tres piezas de Política Económica son tres paneles de la MISMA sala. Lo
 * que las hace parecer una sola cosa vive aquí y no se reescribe en cada una:
 * el bisel de los paneles, el rótulo grabado, la lucecita de estado, la
 * rejilla de fondo.
 *
 * POR QUÉ ESTA METÁFORA Y NO OTRA. La política económica ES literalmente un
 * tablero de mandos operado sobre una máquina. La metáfora no envuelve la
 * lección: es la lección. Por eso los controles se ven como instrumentos y no
 * como tarjetas con iconos.
 *
 * DE DÓNDE SALE EL AIRE DE SALA DE CONTROL. De la disposición, la
 * instrumentación y el movimiento —biseles, rótulos grabados, agujas, pilotos—
 * NO de importar una paleta industrial oscura ajena al sitio. Los colores y las
 * tipografías son los de la marca: Sora para rótulos, Inter para texto, y el
 * navy/teal/coral/ámbar de siempre.
 *
 * NADA DE BUCEO. El Iceberg tiene su identidad y esta es otra. Ni sonar, ni
 * burbujas, ni agua: aquí hay metal, luz y vidrio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El verde de "en meta". El teal de marca hace de verde en todo el sitio. */
export const VERDE = FAE.teal;
/* El rojo de alarma. El coral de marca hace de rojo. */
export const ROJO = FAE.coral;
/* El ámbar de aviso, ya presente en el kit para el nivel intermedio. */
export const AMBAR = FAE.ambar;

export const CSS_SALA = `
/* La rejilla del fondo: chapa de instrumento, muy tenue. */
.fae-sc-rejilla {
  background-image:
    linear-gradient(rgba(203,220,242,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(203,220,242,0.05) 1px, transparent 1px);
  background-size: 22px 22px;
}
/* El piloto de estado. Solo late si la pieza está a la vista. */
@keyframes fae-sc-piloto {
  0%, 100% { opacity: .35; }
  50%      { opacity: 1; }
}
.fae-sc-late { animation: fae-sc-piloto 2.2s ease-in-out infinite; }
@keyframes fae-sc-entrar { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fae-sc-entrar { animation: fae-sc-entrar 420ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-sc-late, .fae-sc-entrar { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

/*
 * Un panel de la sala. Es el contenedor con bisel que comparten las tres
 * piezas: borde doble, esquinas redondeadas y un rótulo grabado arriba.
 */
export function Panel({ rotulo, titulo, children, acento = FAE.teal, style }) {
  return (
    <section
      style={{
        borderRadius: "20px",
        background: "linear-gradient(160deg, rgba(29,53,87,0.34), rgba(10,20,34,0.62))",
        border: "1px solid rgba(248,249,250,0.14)",
        boxShadow: "inset 0 1px 0 rgba(248,249,250,0.08)",
        padding: "clamp(14px, 2.2vw, 20px)",
        ...style,
      }}
    >
      {(rotulo || titulo) && (
        <header style={{ marginBottom: "14px" }}>
          {rotulo && (
            <p
              style={{
                /* Jerarquía (src/estilo/jerarquia.js): el rótulo dice dónde estás, a 12 px. */
                ...ROTULO, color: acento, margin: "0 0 6px",
              }}
            >
              {rotulo}
            </p>
          )}
          {titulo && (
            <h3
              style={{
                /* El título es lo primero que se lee: 20 px, el más grande de la tarjeta. */
                ...TITULO, margin: 0,
              }}
            >
              {titulo}
            </h3>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

/*
 * El piloto de estado: un punto de luz con su texto al lado.
 *
 * EL COLOR NUNCA VA SOLO. Siempre lleva la palabra escrita —"fuera de meta",
 * "sin meta definida"— porque en estas piezas el color carga significado y un
 * estudiante que no lo distinga tiene que poder leerlo igual.
 */
export function Piloto({ color, texto, late = false, tamano = 8 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
      <span
        aria-hidden="true"
        className={late ? "fae-sc-late" : undefined}
        style={{
          width: `${tamano}px`, height: `${tamano}px`, borderRadius: "999px",
          background: color, boxShadow: `0 0 ${tamano}px ${color}`, flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 600,
          letterSpacing: "0.04em", color: "rgba(248,249,250,0.72)",
        }}
      >
        {texto}
      </span>
    </span>
  );
}

/* Rótulo grabado, del tipo que llevan las placas de un tablero real. */
export function Grabado({ children, color = "rgba(248,249,250,0.45)", style }) {
  return (
    <p
      style={{
        fontFamily: "Sora, sans-serif", fontSize: "10.5px", fontWeight: 700,
        letterSpacing: "0.14em", color, margin: 0, ...style,
      }}
    >
      {children}
    </p>
  );
}
