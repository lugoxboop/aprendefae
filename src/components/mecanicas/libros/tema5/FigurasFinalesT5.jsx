import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { MONO } from "../tema6/TanqueProvision.jsx";
import { ConLeyenda, useVarianteCapa4 } from "../tema6/LeyendaFinal.jsx";
import { PAQUETES, FIGURA_CAPA_3 } from "../../../../data/contabilidadT5Pieza1.js";
import { ESCENA_T5_A2, FIGURA_CAPA_3_T5_A2, FINAL_T5_A2, PIEZA_TRES_MOMENTOS } from "../../../../data/contabilidadT5Pieza2.js";

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
 *   · A2 (lote 27, Shoko): la T del caso de la pregunta, los 260 títulos:
 *     Caja $273.000 al DEBE; al HABER, Inversiones – títulos $221.000 y la
 *     ganancia $52.000, con el pie «Escenario simulado». Antes era el caso de
 *     Santa Pacha, que no es el que se pregunta. Las cifras del HABER son la
 *     respuesta: entran solo al responder (con la leyenda); antes, su hueco.
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

/* ═══════════ T5 · A2 · la T de la venta de la pregunta ═══════════ */
const HUECO = { display: "inline-block", width: "60px", height: "12px", borderRadius: "4px", background: "rgba(248,249,250,0.08)", verticalAlign: "middle" };
/*
 * Lote 27 · D8: en la segunda visita la pregunta es la de antes del cambio C1 (la venta de agosto de Santa
 * Pacha), y la T es la de entonces: la cuenta de las inversiones, con la compra y lo que costaron las dos
 * ventas. Su HABER también es la respuesta: entra con ella.
 */
function FinalT5A2AntesC1({ leyenda }) {
  const E = ESCENA_T5_A2;
  const F = FIGURA_CAPA_3_T5_A2;
  const LINEA_T = `2px solid ${BORDES}`;
  const entradas = { debe: [E.compra], haber: [E.costado1, E.costado2] };
  const columna = (lado) => (
    <div data-columna={lado} style={{ padding: "2px 6px 0", borderLeft: lado === "haber" ? LINEA_T : "none", minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
      <p style={{ ...TITULO, fontWeight: 700, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>{F[lado]}</p>
      {entradas[lado].map((x) => (
        <p key={x} data-entrada={x} style={{ ...TITULO, fontFamily: MONO, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {lado === "debe" || leyenda ? x : <span data-hueco aria-hidden="true" style={HUECO} />}
        </p>
      ))}
    </div>
  );
  return (
    <ConLeyenda id="t5-a2" leyenda={leyenda}>
      <div data-figura="t5-a2-final" data-antes-c1>
        <p style={TITULO}>{E.inversiones}</p>
        <div style={{ marginTop: "3px", borderTop: LINEA_T, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
          {columna("debe")}
          {columna("haber")}
        </div>
      </div>
    </ConLeyenda>
  );
}

export function FinalT5A2({ leyenda = null }) {
  const variante = useVarianteCapa4(PIEZA_TRES_MOMENTOS.id);
  if (variante) return <FinalT5A2AntesC1 leyenda={leyenda} />;
  const F = FIGURA_CAPA_3_T5_A2;
  const LINEA_T = `2px solid ${BORDES}`;
  /* R10: lo que se pregunta (el HABER) solo con la respuesta; Caja ya lo dice la pregunta. */
  const respondida = Boolean(leyenda);
  const columna = (lado) => (
    <div data-columna={lado} style={{ padding: "2px 6px 0", borderLeft: lado === "haber" ? LINEA_T : "none", minWidth: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
      <p style={{ ...TITULO, fontWeight: 700, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>{F[lado]}</p>
      {FINAL_T5_A2[lado].map((x) => (
        <div key={x.cuenta} data-entrada={x.cuenta}>
          <p style={{ ...CABECERA, color: FAE.text }}>{x.cuenta}</p>
          <p data-cifra-final style={{ ...TITULO, fontFamily: MONO, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
            {lado === "debe" || respondida ? x.cifra : <span data-hueco aria-hidden="true" style={HUECO} />}
          </p>
        </div>
      ))}
    </div>
  );
  return (
    <ConLeyenda id="t5-a2" leyenda={leyenda}>
      <div data-figura="t5-a2-final">
        <div style={{ borderTop: LINEA_T, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
          {columna("debe")}
          {columna("haber")}
        </div>
        <p data-pie-final style={{ ...CABECERA, margin: "4px 0 0" }}>{FINAL_T5_A2.pie}</p>
      </div>
    </ConLeyenda>
  );
}
