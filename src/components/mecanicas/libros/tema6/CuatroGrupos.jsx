import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import {
  CONSIGNA_CAPA_3_T6_A5, PREGUNTA_CAPA_3_T6_A5, GRUPOS_T6_A5, TABLERO_T6_A5, FINAL_CAPA_3_T6_A5, ROTULO_SIMULADO_T6_A5,
} from "../../../../data/contabilidadT6Pieza5.js";
import { pegarPorcentaje } from "../../../../contabilidad/t6Pieza5.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "../tema5/EstilosT5.jsx";
import { Caja, LECTURA, PIE } from "./CajasQueRevelan.jsx";
import { RotuloSimulado, PieDeFuente } from "./FuentesT6A5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 5 · CAPA 3 · «AHORA PRUEBE USTED» — el tablero de los cuatro
 * grupos (guía de Mai v1 §6).
 *
 * El tablero de T6 · A4 en una columna: una tabla que empieza con el rótulo
 * fijo, la cabecera de su columna y una fila por grupo (su nombre y su
 * celda de 104). Cada caja llena su celda al decidirse (hoja 6: primero
 * la pregunta de la caja, en fila; la celda se llena siempre con el
 * valor correcto, se acierte o no), en cualquier orden (los
 * grupos no se acumulan entre sí); llena: Sora 15/700, borde 2 nodo y relleno
 * navy. Con las cuatro abiertas, la fila de la suma bajo un filete, y el
 * bloque final. Cada caja y el bloque final llevan su pie en su forma. Sin
 * puntaje ni color de acierto o de error. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const BORDES = COLOR.neutro;
const ATENUADO = "rgba(184,196,212,.50)";
const NOMBRE_CAJA = { ...LECTURA, fontFamily: SORA, fontWeight: 600, lineHeight: 1.35 };
const NOMBRE_FILA = { padding: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: FAE.text, textAlign: "left" };

function Celda({ cifra }) {
  const llena = Boolean(cifra);
  return (
    <td data-celda style={{ padding: 0, width: "104px" }}>
      <div style={{
        minHeight: "36px", boxSizing: "border-box", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
        border: llena ? `2px solid ${FAE.node}` : `1px solid ${ATENUADO}`, background: llena ? FAE.navy : "transparent",
        fontFamily: SORA, fontSize: "15px", fontWeight: 700, lineHeight: 1.3,
        fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: FAE.text,
      }}>
        {cifra}
      </div>
    </td>
  );
}

export default function CuatroGrupos() {
  const reducido = useReducido();
  const [abiertos, setAbiertos] = useState(() => new Set());
  const [elecciones, setElecciones] = useState(() => ({}));
  const bloqueFinal = useRef(null);
  const decidido = (g) => elecciones[g.id] !== undefined;
  const todos = GRUPOS_T6_A5.every(decidido);

  useEffect(() => {
    if (todos) bloqueFinal.current?.scrollIntoView?.({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
  }, [todos]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div data-capa3-t6-a5 className={CLASE_T5}>
      <EstilosT5 />
      <p style={{ ...LECTURA, fontFamily: SORA }}>{CONSIGNA_CAPA_3_T6_A5}</p>

      {/* El tablero: el rótulo fijo arriba y una tabla, para que se lea con sus cabeceras. */}
      <div data-tablero aria-live="polite" style={{ marginTop: "12px", border: `1px solid ${BORDES}`, borderRadius: "12px", padding: "8px 10px 10px" }}>
        <RotuloSimulado texto={ROTULO_SIMULADO_T6_A5} />
        <table style={{ width: "calc(100% + 12px)", margin: "0 -6px -6px", borderCollapse: "separate", borderSpacing: "6px", tableLayout: "fixed" }}>
          <colgroup><col /><col style={{ width: "104px" }} /></colgroup>
          <thead>
            <tr>
              <td />
              <th scope="col" style={{ padding: 0, fontFamily: INTER, fontSize: "12px", fontWeight: 400, lineHeight: 1.35, color: COLOR.apagado, textAlign: "center" }}>
                {TABLERO_T6_A5.cabecera}
              </th>
            </tr>
          </thead>
          <tbody>
            {GRUPOS_T6_A5.map((g, k) => (
              <tr key={g.id} data-fila={g.id}>
                <th scope="row" style={NOMBRE_FILA}>{g.nombre}</th>
                <Celda cifra={decidido(g) ? TABLERO_T6_A5.celdas[k] : null} />
              </tr>
            ))}
          </tbody>
          {todos && (
            <tfoot data-fila-total>
              <tr>
                <th scope="row" style={{ ...NOMBRE_FILA, borderTop: `1px solid ${BORDES}`, paddingTop: "6px" }}>{TABLERO_T6_A5.total}</th>
                <td style={{ padding: "6px 0 0", borderTop: `1px solid ${BORDES}` }}>
                  <div style={{
                    minHeight: "36px", boxSizing: "border-box", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${FAE.node}`, background: FAE.navy, fontFamily: SORA, fontSize: "15px", fontWeight: 700, lineHeight: 1.3,
                    fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: FAE.text,
                  }}>
                    {TABLERO_T6_A5.suma}
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {GRUPOS_T6_A5.map((g) => (
          <Caja key={g.id}
            caja={{
              id: g.id, titulo: `${g.nombre} · ${g.monto}`, revela: pegarPorcentaje(g.revela), pie: <PieDeFuente texto={g.pie} />,
              decide: {
                pregunta: PREGUNTA_CAPA_3_T6_A5, correcta: g.correcta, falla: pegarPorcentaje(g.falla),
                opciones: g.opciones.map((o) => ({ ...o, texto: pegarPorcentaje(o.texto) })),
              },
            }}
            estiloTitulo={NOMBRE_CAJA} forma="fila" abierto={abiertos.has(g.id)} onAbrir={() => setAbiertos((s) => new Set(s).add(g.id))}
            elegida={elecciones[g.id] ?? null} onElegir={(o) => setElecciones((e) => ({ ...e, [g.id]: o }))} />
        ))}
      </div>

      <div ref={bloqueFinal} data-final aria-live="polite">
        {todos && (
          <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "12px", border: `1px solid ${BORDES}`, background: FAE.navy }}>
            <p style={LECTURA}>{FINAL_CAPA_3_T6_A5.texto}</p>
            <p data-pie style={PIE}><PieDeFuente texto={FINAL_CAPA_3_T6_A5.pie} /></p>
          </div>
        )}
      </div>
    </div>
  );
}
