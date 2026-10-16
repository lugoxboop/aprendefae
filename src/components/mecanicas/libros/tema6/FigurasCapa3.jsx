import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { PAQUETES, FIGURA_CAPA_3 } from "../../../../data/contabilidadT5Pieza1.js";
import { FIGURA_CAPA_3_T5_A2 } from "../../../../data/contabilidadT5Pieza2.js";
import { HECHOS_T6, FIGURA_CAPA_3_T6 } from "../../../../data/contabilidadT6Pieza1.js";
import { METODOS_T6_A2, FIGURA_CAPA_3_T6_A2 } from "../../../../data/contabilidadT6Pieza2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 Y 6 · LAS FIGURAS DE LA CAPA 3 (§2b de Mai, enganche B1-B5).
 *
 * Una figura pequeña que reacciona, entre la consigna y las cajas, como el
 * tablero de T6 · A3, A4 y A5. CajasQueRevelan la pega arriba de la capa
 * (FiguraPegada) y le pasa `decididas`: los ids de las cajas ya cerradas
 * (acierto o segundo error), en el orden en que se cerraron. Se llena siempre
 * con lo CORRECTO (el registro, no la nota del estudiante), y lo último que
 * entró queda resaltado (borde 2 nodo y relleno navy, con 1 px menos de
 * relleno: no se mueve nada) hasta la decisión siguiente.
 *   · T5 · A1: dos cajones, «Temporal» y «No temporal»; cada paquete entra
 *     en el suyo.
 *   · T5 · A2: la cuenta T de las inversiones, con la compra en el
 *     DEBE; cada venta mete en el HABER lo que costaron sus títulos.
 *   · T6 · A1: la cuenta T de lo que deben los clientes; cada hecho entra
 *     con su nombre corto en el DEBE (sube) o en el HABER (baja); el que no
 *     cambia va debajo, tras «Sin movimiento:».
 *   · T6 · A2: la rejilla de los dos métodos por los dos momentos.
 * Sin coral ni color de acierto: la figura no califica, registra. Ningún
 * texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const BORDES = COLOR.neutro;
const ATENUADO = "rgba(184,196,212,.50)";
const LINEA_T = `2px solid ${BORDES}`;
const MARCO = { border: `1px solid ${BORDES}`, borderRadius: "12px", padding: "8px 10px 10px" };
const NOMBRE_CUENTA = { margin: 0, textAlign: "center", fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: FAE.text };
const ROTULO = { margin: "0 0 4px", textAlign: "center", fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.1em" };
const CABECERA = { margin: 0, fontFamily: INTER, fontSize: "12px", fontWeight: 400, lineHeight: 1.35, color: COLOR.apagado, textAlign: "center" };

/*
 * Una entrada de la figura (Inter 12/600, la letra mínima: la figura es
 * pequeña): borde 1 neutro; la última, resaltada sin moverse. `detalle` (la
 * fecha de T5 · A2) va en su propio renglón, en color secundario, como el
 * momento bajo el monto en la T de T6 · A3.
 */
const ALTO_ENTRADA = "22.2px"; // 12 × 1,35 + 2 × 2 de relleno + 2 × 1 de borde
function Entrada({ id, texto, detalle = null, ultima, centrada = false }) {
  const d = ultima ? 1 : 0;
  return (
    <p data-entrada={id} data-ultima={ultima ? "si" : "no"} style={{
      margin: 0, boxSizing: "border-box", borderRadius: "6px", padding: `${2 - d}px ${5 - d}px`,
      border: ultima ? `2px solid ${FAE.node}` : `1px solid ${BORDES}`, background: ultima ? FAE.navy : "transparent",
      fontFamily: INTER, fontSize: "12px", fontWeight: 600, lineHeight: 1.35, color: FAE.text,
      fontVariantNumeric: "tabular-nums", textAlign: centrada ? "center" : "left",
    }}>
      <span style={{ display: "block" }}>{texto}</span>
      {detalle && <span data-detalle style={{ display: "block", fontWeight: 400, color: COLOR.apagado }}>{detalle}</span>}
    </p>
  );
}

/* Una cuenta T pequeña: el nombre, la línea de la T y sus dos columnas; `debajo`, lo que va bajo la T. */
function CuentaPequena({ figura, entradas, ultima, debajo = null, atributos }) {
  const columna = (lado) => (
    <div data-columna={lado} style={{ padding: "6px 4px 2px", borderLeft: lado === "haber" ? LINEA_T : "none", display: "flex", flexDirection: "column", gap: "4px" }}>
      <p style={{ ...ROTULO, color: TONO_ROTULO[lado] }}>{figura[lado]}</p>
      {entradas.filter((e) => e.lado === lado).map((e) => <Entrada key={e.id} id={e.id} texto={e.texto} detalle={e.detalle} ultima={e.id === ultima} />)}
    </div>
  );
  return (
    <div {...atributos} aria-live="polite" style={MARCO}>
      <p style={NOMBRE_CUENTA}>{figura.cuenta}</p>
      <div style={{ marginTop: "6px", borderTop: LINEA_T, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
        {columna("debe")}
        {columna("haber")}
      </div>
      {debajo}
    </div>
  );
}

const ultimaDe = (decididas) => (decididas.length ? decididas[decididas.length - 1] : null);

/* ═══════════ T5 · A1 · los dos cajones ═══════════ */
export function FiguraT5A1({ decididas }) {
  const ultima = ultimaDe(decididas);
  const cajones = [
    { id: "temporal", nombre: FIGURA_CAPA_3.temporal, temporal: true },
    { id: "no-temporal", nombre: FIGURA_CAPA_3.noTemporal, temporal: false },
  ];
  return (
    <div data-figura="t5-a1" aria-live="polite" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "8px" }}>
      {cajones.map((c) => (
        <div key={c.id} data-cajon={c.id} style={{ ...MARCO, borderRadius: "10px", padding: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <p style={CABECERA}>{c.nombre}</p>
          {/* El sitio de un paquete, reservado: la figura no cambia de alto al llenarse. */}
          <div style={{ minHeight: ALTO_ENTRADA, display: "flex", flexDirection: "column", gap: "4px" }}>
            {decididas
              .map((id) => PAQUETES.find((p) => p.id === id))
              .filter((p) => p && (p.correcta === "si") === c.temporal)
              .map((p) => <Entrada key={p.id} id={p.id} texto={p.nombre} ultima={p.id === ultima} centrada />)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ T5 · A2 · la T de las inversiones ═══════════ */
/* «$2.000.000 · 1 de mayo» (§2b de Mai): el monto y, debajo, la fecha; a 320 no caben en un renglón de media T. */
export function FiguraT5A2({ decididas }) {
  const F = FIGURA_CAPA_3_T5_A2;
  const entradas = [
    { id: "compra", lado: "debe", texto: F.compra.monto, detalle: F.compra.fecha },
    ...decididas.filter((id) => F.ventas[id]).map((id) => ({ id, lado: "haber", texto: F.ventas[id].monto, detalle: F.ventas[id].fecha })),
  ];
  return <CuentaPequena figura={F} entradas={entradas} ultima={ultimaDe(decididas)} atributos={{ "data-figura": "t5-a2" }} />;
}

/* ═══════════ T6 · A1 · la T de los clientes ═══════════ */
const LADO_T6_A1 = { sube: "debe", baja: "haber" };
export function FiguraT6A1({ decididas }) {
  const F = FIGURA_CAPA_3_T6;
  const hechos = decididas.map((id) => HECHOS_T6.find((x) => x.id === id)).filter(Boolean);
  const entradas = hechos.filter((x) => LADO_T6_A1[x.correcta]).map((x) => ({ id: x.id, lado: LADO_T6_A1[x.correcta], texto: x.corto }));
  const quietos = hechos.filter((x) => !LADO_T6_A1[x.correcta]);
  const ultima = ultimaDe(decididas);
  const debajo = quietos.length ? (
    <div data-sin-movimiento style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
      <span style={{ ...CABECERA, textAlign: "left" }}>{F.sinMovimiento}</span>
      {quietos.map((x) => <Entrada key={x.id} id={x.id} texto={x.corto} ultima={x.id === ultima} />)}
    </div>
  ) : null;
  return <CuentaPequena figura={F} entradas={entradas} ultima={ultima} debajo={debajo} atributos={{ "data-figura": "t6-a1" }} />;
}

/* ═══════════ T6 · A2 · la rejilla de los dos métodos ═══════════ */
export function FiguraT6A2({ decididas }) {
  const F = FIGURA_CAPA_3_T6_A2;
  const ultima = ultimaDe(decididas);
  return (
    <div data-figura="t6-a2" aria-live="polite" style={{ ...MARCO, padding: "8px 10px 10px" }}>
      <table style={{ width: "calc(100% + 12px)", margin: "-6px", borderCollapse: "separate", borderSpacing: "6px", tableLayout: "fixed" }}>
        <colgroup><col style={{ width: "34%" }} /><col /><col /></colgroup>
        <thead>
          <tr>
            <td />
            {F.columnas.map((c) => <th key={c.id} scope="col" style={{ ...CABECERA, padding: 0, verticalAlign: "bottom" }}>{c.texto}</th>)}
          </tr>
        </thead>
        <tbody>
          {METODOS_T6_A2.map((m) => {
            const lleno = decididas.includes(m.id);
            return (
              <tr key={m.id} data-fila={m.id}>
                <th scope="row" style={{ padding: 0, fontFamily: SORA, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.3, color: FAE.text, textAlign: "left" }}>{m.nombre}</th>
                {F.columnas.map((c) => (
                  <td key={c.id} data-celda={c.id} style={{ padding: 0 }}>
                    {lleno
                      ? <Entrada id={`${m.id}-${c.id}`} texto={F.filas[m.id][c.id]} ultima={m.id === ultima} centrada />
                      : <div aria-hidden="true" style={{ minHeight: ALTO_ENTRADA, boxSizing: "border-box", borderRadius: "6px", border: `1px solid ${ATENUADO}` }} />}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
