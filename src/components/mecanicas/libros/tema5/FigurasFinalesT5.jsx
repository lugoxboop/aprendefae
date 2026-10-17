import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { MONO } from "../tema6/TanqueProvision.jsx";
import { ConLeyenda } from "../tema6/LeyendaFinal.jsx";
import { PAQUETES, FIGURA_CAPA_3 } from "../../../../data/contabilidadT5Pieza1.js";
import { ESCENA_T5_A2, FIGURA_CAPA_3_T5_A2 } from "../../../../data/contabilidadT5Pieza2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 13 · EL MODELO FINAL DE LA CAPA 4 DE T5 · A1 Y A2 (como los de T6,
 * lotes 7 y 12).
 *
 * El modelo de la pieza en su estado final, en miniatura (unos 100 px de alto
 * a 320, letra mínima 12, sin gestos ni resaltado, sin position: sticky).
 * CuatroCapas lo pinta encima de la pregunta (`FiguraFinal`) y le pasa
 * `leyenda`, la frase buena, que queda debajo (ConLeyenda). Ninguna palabra
 * ni cifra vive aquí: todo sale de los datos de la pieza.
 *   · A1: los dos cajones de la capa 3, con cada paquete en el suyo.
 *   · A2: la cuenta de las inversiones de la capa 2 al final: entró por lo
 *     que costó la compra y salió, en las dos ventas, por lo que costaron los
 *     títulos vendidos. Las cifras de la capa 3 van por título («Costó $650
 *     cada uno») y a 320 no caben en una T de unos 100 px; las de la capa 2
 *     son la misma regla, en una línea cada una.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const BORDES = COLOR.neutro;
const L = 1.25;
const TITULO = { margin: 0, textAlign: "center", fontFamily: SORA, fontSize: "12px", fontWeight: 600, lineHeight: L, color: FAE.text };
const CABECERA = { margin: 0, textAlign: "center", fontFamily: INTER, fontSize: "12px", fontWeight: 400, lineHeight: L, color: COLOR.apagado };
const CHIP = {
  margin: 0, boxSizing: "border-box", borderRadius: "6px", padding: "1px 4px", border: `1px solid ${BORDES}`, textAlign: "center",
  fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: L, color: FAE.text,
};

/* ═══════════ T5 · A1 · los dos cajones ═══════════ */
export function FinalT5A1({ leyenda = null }) {
  const cajones = [
    { id: "temporal", nombre: FIGURA_CAPA_3.temporal, temporal: true },
    { id: "no-temporal", nombre: FIGURA_CAPA_3.noTemporal, temporal: false },
  ];
  return (
    <ConLeyenda id="t5-a1" leyenda={leyenda}>
      <div data-figura="t5-a1-final" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "8px" }}>
        {cajones.map((c) => (
          <div key={c.id} data-cajon={c.id} style={{ border: `1px solid ${BORDES}`, borderRadius: "10px", padding: "6px 8px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <p style={CABECERA}>{c.nombre}</p>
            {PAQUETES.filter((p) => (p.correcta === "si") === c.temporal).map((p) => <p key={p.id} data-entrada={p.id} style={CHIP}>{p.nombre}</p>)}
          </div>
        ))}
      </div>
    </ConLeyenda>
  );
}

/* ═══════════ T5 · A2 · la T de las inversiones, al final ═══════════ */
export function FinalT5A2({ leyenda = null }) {
  const E = ESCENA_T5_A2;
  const F = FIGURA_CAPA_3_T5_A2;
  const LINEA_T = `2px solid ${BORDES}`;
  const entradas = { debe: [E.compra], haber: [E.costado1, E.costado2] };
  const columna = (lado) => (
    <div data-columna={lado} style={{ padding: "2px 6px 0", borderLeft: lado === "haber" ? LINEA_T : "none", minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
      <p style={{ ...TITULO, fontWeight: 700, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>{F[lado]}</p>
      {entradas[lado].map((x) => (
        <p key={x} data-entrada style={{ ...TITULO, fontFamily: MONO, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{x}</p>
      ))}
    </div>
  );
  return (
    <ConLeyenda id="t5-a2" leyenda={leyenda}>
      <div data-figura="t5-a2-final">
        <p style={TITULO}>{E.inversiones}</p>
        <div style={{ marginTop: "3px", borderTop: LINEA_T, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
          {columna("debe")}
          {columna("haber")}
        </div>
      </div>
    </ConLeyenda>
  );
}
