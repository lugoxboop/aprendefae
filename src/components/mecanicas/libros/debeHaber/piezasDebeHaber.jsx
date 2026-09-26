import { FAE } from "../../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../../data/contabilidad.js";
import { SOLO_LECTOR } from "../verbos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS PIEZAS PROPIAS DE «EL DEBE Y EL HABER».
 *
 * ═══════════ LOS TONOS DE RÓTULO, Y DE DÓNDE SALEN ═══════════
 *
 * El teal y el ámbar de marca —#2A9D8F y #E9C46A— siguen mandando en
 * rellenos, iconos y elementos grandes. Estas dos variantes son SOLO para
 * texto pequeño, que es donde el contraste aprieta.
 *
 * El fondo real de la tarjeta de cuenta T en Contabilidad se midió: las dos
 * capas de rgba(10,20,34,0.45) sobre el fondo de la materia dan #0B1626 —
 * bastante más oscuro que el navy que la tabla asumía. Contra ese fondo:
 *
 *   #52C4B0  sobre #0B1626  →   8,54:1
 *   #E9C46A  sobre #0B1626  →  10,86:1
 *
 * y en el peor caso, con el degradado ámbar de la página al 12 % encima,
 * 8,05:1 y 10,24:1. Los dos muy por encima del 4,5:1, así que no hay parada.
 *
 * ═══════════ EL COLOR NO LLEVA NADA SOLO ═══════════
 *
 * Cada lado se dice de tres formas a la vez: color, palabra escrita
 * (DEBE/HABER) y flecha (←/→). El ▲ es una cuarta señal, de forma, para quien
 * las tres primeras se le quedan en dos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TONO_ROTULO = { [DEBE]: "#52C4B0", [HABER]: "#E9C46A" };

/* El fondo medido, guardado para que la prueba de contraste no lo adivine. */
export const FONDO_TARJETA = "#0B1626";

export const PANEL = {
  padding: "10px 9px", borderRadius: "12px",
  background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.12)",
};

/*
 * El ▲ sobre el lado por el que crece la cuenta. No es adorno: es la regla,
 * codificada de forma permanente en la cuenta. Va en una fila de dos mitades
 * para que caiga justo encima de su columna.
 */
export function Triangulito({ lado }) {
  return (
    <div data-triangulito={lado} style={{ display: "flex", height: "12px" }}>
      {[DEBE, HABER].map((cual) => (
        /*
         * El lado que NO crece va vacío, no con un ▲ invisible: un glifo con
         * opacidad cero sigue estando en el texto de la página, y quien
         * copiara o leyera el contenido vería dos triángulos donde hay uno.
         */
        <span key={cual} style={{
          flex: 1, textAlign: "center", fontSize: "10px", lineHeight: "12px",
          color: COLOR_LADO[cual],
        }} aria-hidden="true">
          {cual === lado ? "▲" : ""}
        </span>
      ))}
      <span style={SOLO_LECTOR}>
        Esta cuenta crece por el {lado === DEBE ? "debe" : "haber"}.
      </span>
    </div>
  );
}

/*
 * La barra del saldo de una cuenta. Crece del lado por el que crece la cuenta
 * —no siempre hacia la derecha— y lleva su signo escrito además del color y
 * de la altura, que es la tercera señal del mismo dato.
 */
export function Barra({ valor, maximo, lado, signo = null }) {
  const proporcion = maximo > 0 ? Math.max(0, Math.min(1, valor / maximo)) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <div
        data-barra
        data-valor={valor}
        style={{
          flex: 1, minWidth: 0, height: "16px", borderRadius: "6px",
          background: "rgba(248,249,250,0.07)", overflow: "hidden",
          display: "flex", justifyContent: lado === HABER ? "flex-end" : "flex-start",
        }}
      >
        <span style={{
          display: "block", width: `${proporcion * 100}%`, height: "100%",
          background: `${COLOR_LADO[lado]}55`, borderRight: lado === DEBE ? `2px solid ${COLOR_LADO[lado]}` : "none",
          borderLeft: lado === HABER ? `2px solid ${COLOR_LADO[lado]}` : "none",
          transition: "width 800ms cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
      {signo && (
        <span data-signo={signo === "+" ? "mas" : "menos"} style={{
          fontFamily: "Sora, sans-serif", fontSize: "11px", fontWeight: 700,
          color: TONO_ROTULO[lado], width: "10px", textAlign: "center",
        }}>
          {signo}
        </span>
      )}
      <span style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontVariantNumeric: "tabular-nums", fontSize: "10.5px", fontWeight: 700,
        color: TONO_ROTULO[lado], whiteSpace: "nowrap",
      }}>
        {pesos(valor)}
      </span>
    </div>
  );
}

/*
 * ═══════════ EL MARCADOR QUE SE DESLIZA ═══════════
 *
 * No es la balanza —que se inclina— ni una barra que crece: es un indicador
 * que recorre el pie de la cuenta y SE DETIENE bajo la columna que quedó en
 * pie. Cambia de lado, y ese cambio de lado es la regla: el saldo va del lado
 * del movimiento mayor.
 *
 * La balanza está reservada para el desafío y para CU-8 y CU-10. Repetir el
 * mismo cierre cuatro veces le quitaría significado a las tres.
 */
export function MarcadorDeSaldo({ lado, cifra }) {
  const puesto = lado === DEBE || lado === HABER;
  return (
    <div data-marcador={puesto ? lado : "sin-lado"} style={{
      position: "relative", height: "34px", marginTop: "6px",
      borderTop: "1px solid rgba(248,249,250,0.16)",
    }}>
      <div style={{
        position: "absolute", top: "6px",
        left: lado === HABER ? "50%" : 0,
        width: "50%",
        transition: "left 500ms cubic-bezier(.34,1.1,.5,1), opacity 300ms ease",
        opacity: puesto ? 1 : 0,
        textAlign: "center",
      }}>
        {/*
          UNA BARRA, NO UN TRIÁNGULO. El ▲ ya significa otra cosa en este tema
          —por dónde crece la cuenta, una propiedad permanente— y dibujar el
          marcador de saldo también como triángulo ponía dos símbolos con la
          misma forma y distinto significado dentro de la misma cuenta T. Se
          vio mirándolo, no leyéndolo.
        */}
        <span aria-hidden="true" style={{
          display: "block", width: "26px", height: "3px", margin: "0 auto 3px",
          borderRadius: "999px",
          background: puesto ? COLOR_LADO[lado] : "transparent",
        }} />
        <span style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontVariantNumeric: "tabular-nums", fontSize: "12px", fontWeight: 700,
          color: puesto ? TONO_ROTULO[lado] : "transparent",
        }}>
          {pesos(cifra)}
        </span>
      </div>
      {puesto && (
        <span style={SOLO_LECTOR}>
          El saldo es {pesos(cifra)} y queda del lado del {lado === DEBE ? "debe" : "haber"}.
        </span>
      )}
    </div>
  );
}

/* El rótulo de un lado, con sus tres señales. */
export function RotuloDeLado({ lado }) {
  return (
    <span data-rotulo={lado} style={{
      fontFamily: "Sora, sans-serif", fontSize: "10px", fontWeight: 700,
      letterSpacing: "0.14em", color: TONO_ROTULO[lado],
    }}>
      {lado === DEBE ? "← DEBE" : "HABER →"}
    </span>
  );
}

export { FAE };
