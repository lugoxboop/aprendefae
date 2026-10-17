import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { MONO } from "./TanqueProvision.jsx";
import { HECHOS_T6, FIGURA_CAPA_3_T6 } from "../../../../data/contabilidadT6Pieza1.js";
import { METODOS_T6_A2, FIGURA_CAPA_3_T6_A2 } from "../../../../data/contabilidadT6Pieza2.js";
import { TABLERO_T6_A4, CASOS_T6_A4 } from "../../../../data/contabilidadT6Pieza4.js";
import { GRUPOS_T6_A5, ROTULO_SIMULADO_T6_A5, ESCENARIO_T6_A5 } from "../../../../data/contabilidadT6Pieza5.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOTE 12 · EL MODELO FINAL DE LA CAPA 4 DE T6 · A1, A2, A4 Y A5 (como el
 * tanque de T6 · A3, lote 7).
 *
 * La figura de la capa 3 de cada pieza en su estado final (todas las cajas
 * cerradas, cada una con lo correcto), en miniatura: cabe en unos 100 px de
 * alto a 320. Sin gestos, sin resaltado de «lo último» y sin calificar: el
 * modelo ya está completo. CuatroCapas la pinta encima de la pregunta
 * (`FiguraFinal`) y le pasa `leyenda`: la frase buena, que queda debajo como
 * su leyenda (Inter 13/1,5, como la del tanque). Letra mínima 12. Sin
 * position: sticky. Ninguna palabra ni cifra vive aquí: todo sale de los
 * datos de la pieza.
 *   · A1: la T de lo que deben los clientes, con los seis hechos.
 *   · A2: la rejilla de los dos métodos por los dos momentos.
 *   · A4: el tablero de los tres casos, con sus dos cifras.
 *   · A5: los cuatro grupos con el porcentaje que les tocó en la capa 3,
 *     con su rótulo de escenario simulado (ver abajo por qué sin cifras).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const BORDES = COLOR.neutro;
const L = 1.25;
const TEXTO = { margin: 0, fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: L, color: FAE.text };
const TITULO = { margin: 0, textAlign: "center", fontFamily: SORA, fontSize: "12px", fontWeight: 600, lineHeight: L, color: FAE.text };
const APAGADO = { margin: 0, fontFamily: INTER, fontSize: "12px", fontWeight: 400, lineHeight: L, color: COLOR.apagado };
const CHIP = {
  boxSizing: "border-box", borderRadius: "6px", padding: "1px 4px", border: `1px solid ${BORDES}`, textAlign: "center",
  fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: L, color: FAE.text, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
};
/* La cifra destacada de la capa 3 (borde 2 nodo y relleno navy), con 1 px menos de relleno: mide lo mismo. */
const DESTACADA = { ...CHIP, padding: "0 3px", border: `2px solid ${FAE.node}`, background: FAE.navy, fontFamily: SORA, fontWeight: 700 };
const CIFRA = { ...CHIP, fontFamily: MONO };

/* El modelo y, debajo, la frase buena como su leyenda. */
function ConLeyenda({ id, leyenda, children }) {
  return (
    <div data-modelo-final={id}>
      <div style={{ maxWidth: "320px", margin: "0 auto" }}>{children}</div>
      {leyenda && <p data-leyenda style={{ margin: "8px 0 0", textAlign: "center", fontFamily: INTER, fontSize: "13px", lineHeight: 1.5, color: FAE.text }}>{leyenda}</p>}
    </div>
  );
}

/* ═══════════ T6 · A1 · la T de los clientes, con los seis hechos ═══════════ */
const LADO_T6_A1 = { sube: "debe", baja: "haber" };
export function FinalT6A1({ leyenda = null }) {
  const F = FIGURA_CAPA_3_T6;
  const LINEA_T = `2px solid ${BORDES}`;
  const columna = (lado) => (
    <div data-columna={lado} style={{ padding: "2px 6px 0", borderLeft: lado === "haber" ? LINEA_T : "none", minWidth: 0 }}>
      <p style={{ ...TITULO, fontWeight: 700, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>{F[lado]}</p>
      {HECHOS_T6.filter((x) => LADO_T6_A1[x.correcta] === lado).map((x) => <p key={x.id} data-entrada={x.id} style={TEXTO}>{x.corto}</p>)}
    </div>
  );
  const quietos = HECHOS_T6.filter((x) => !LADO_T6_A1[x.correcta]);
  return (
    <ConLeyenda id="t6-a1" leyenda={leyenda}>
      <div data-figura="t6-a1-final">
        <p style={TITULO}>{F.cuenta}</p>
        <div style={{ marginTop: "3px", borderTop: LINEA_T, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
          {columna("debe")}
          {columna("haber")}
        </div>
        <p data-sin-movimiento style={{ ...APAGADO, marginTop: "3px" }}>
          {F.sinMovimiento} {quietos.map((x) => <span key={x.id} data-entrada={x.id} style={{ ...TEXTO, color: FAE.text }}>{x.corto}</span>)}
        </p>
      </div>
    </ConLeyenda>
  );
}

/* ═══════════ T6 · A2 · la rejilla de los dos métodos ═══════════ */
export function FinalT6A2({ leyenda = null }) {
  const F = FIGURA_CAPA_3_T6_A2;
  return (
    <ConLeyenda id="t6-a2" leyenda={leyenda}>
      <div data-figura="t6-a2-final">
        <p style={TITULO}>{F.titulo}</p>
        <div role="table" style={{ marginTop: "4px", display: "grid", gridTemplateColumns: "max-content minmax(0, 1fr) minmax(0, 1fr)", gap: "4px 6px", alignItems: "center" }}>
          <div role="row" style={{ display: "contents" }}>
            <span role="cell" />
            {F.columnas.map((c) => <span key={c.id} role="columnheader" style={{ ...APAGADO, textAlign: "center", alignSelf: "end" }}>{c.texto}</span>)}
          </div>
          {METODOS_T6_A2.map((m) => (
            <div key={m.id} role="row" data-fila={m.id} style={{ display: "contents" }}>
              <span role="rowheader" style={{ ...TITULO, textAlign: "left", whiteSpace: "nowrap" }}>{m.nombre}</span>
              {F.columnas.map((c) => <span key={c.id} role="cell" data-celda={c.id} style={CHIP}>{F.filas[m.id][c.id]}</span>)}
            </div>
          ))}
        </div>
      </div>
    </ConLeyenda>
  );
}

/* ═══════════ T6 · A4 · el tablero de los tres casos ═══════════ */
export function FinalT6A4({ leyenda = null }) {
  return (
    <ConLeyenda id="t6-a4" leyenda={leyenda}>
      <table data-figura="t6-a4-final" style={{ width: "100%", borderCollapse: "separate", borderSpacing: "6px 4px", margin: "-4px 0", tableLayout: "fixed" }}>
        <colgroup><col style={{ width: "24px" }} /><col /><col /></colgroup>
        <thead>
          <tr>
            <td />
            <th scope="col" style={{ ...APAGADO, padding: 0, textAlign: "center" }}>{TABLERO_T6_A4.revive}</th>
            <th scope="col" style={{ ...APAGADO, padding: 0, textAlign: "center" }}>{TABLERO_T6_A4.entran}</th>
          </tr>
        </thead>
        <tbody>
          {CASOS_T6_A4.map((c) => (
            <tr key={c.id} data-fila={c.id}>
              <th scope="row" style={{ ...TITULO, padding: 0, textAlign: "left" }}>{c.letra}</th>
              <td style={{ padding: 0 }}><div data-celda="revive" style={DESTACADA}>{c.revive}</div></td>
              <td style={{ padding: 0 }}><div data-celda="entran" style={CIFRA}>{c.entran}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </ConLeyenda>
  );
}

/* ═══════════ T6 · A5 · el porcentaje de cada grupo ═══════════ */
/*
 * La pregunta de la capa 4 pide la provisión de una deuda de ocho meses «con
 * los porcentajes del ejemplo», y su respuesta buena es una cifra sola. Por
 * eso el modelo final es el de las decisiones de la capa 3: cada grupo con el
 * porcentaje que le tocó (sin la columna de lo provisionado, que daría otra
 * cifra junto a la leyenda). Con la leyenda puesta, el porcentaje que la
 * pregunta usa queda señalado (contorno, que no mueve nada).
 */
const PORCENTAJE_DE = (g) => g.opciones.find((o) => o.id === g.correcta)?.texto ?? "";
const GRUPO_DE_LA_PREGUNTA = GRUPOS_T6_A5.find((g) => g.correcta === String(ESCENARIO_T6_A5.pregunta.porcentaje))?.id ?? null;
export function FinalT6A5({ leyenda = null }) {
  const apretado = { lineHeight: 1.2 };
  const fila = { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" };
  return (
    <ConLeyenda id="t6-a5" leyenda={leyenda}>
      <div data-figura="t6-a5-final">
        <p data-rotulo-simulado style={{ ...APAGADO, ...apretado, textAlign: "center" }}>{ROTULO_SIMULADO_T6_A5}</p>
        <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "3px" }}>
          {GRUPOS_T6_A5.map((g) => {
            const senalado = Boolean(leyenda) && g.id === GRUPO_DE_LA_PREGUNTA;
            return (
              <div key={g.id} data-fila={g.id} style={fila}>
                <span style={{ ...TEXTO, ...apretado, fontWeight: 400, minWidth: 0 }}>{g.nombre}</span>
                <span data-celda data-senalado={senalado ? "si" : "no"} style={{
                  ...TEXTO, ...apretado, whiteSpace: "nowrap", padding: "0 4px", borderRadius: "4px",
                  outline: senalado ? `2px solid ${FAE.node}` : "none", background: senalado ? FAE.navy : "transparent",
                }}>{PORCENTAJE_DE(g)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </ConLeyenda>
  );
}
