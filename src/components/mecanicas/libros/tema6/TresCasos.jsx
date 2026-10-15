import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import {
  CONSIGNA_CAPA_3_T6_A4, PREGUNTA_CAPA_3_T6_A4, OPCIONES_CAPA_3_T6_A4, TABLERO_T6_A4, CASOS_T6_A4, FINAL_CAPA_3_T6_A4,
} from "../../../../data/contabilidadT6Pieza4.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "../tema5/EstilosT5.jsx";
import { Caja, LECTURA, PIE } from "./CajasQueRevelan.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 4 · CAPA 3 · «AHORA PRUEBE USTED» — el tablero de los tres
 * casos (guía de Mai v1 §4).
 *
 * Una tabla de tres filas (a, b y c) y dos columnas: lo revivido y la plata. Cada
 * caso llena su fila al decidirse (hoja 6: primero la pregunta de la caja, en
 * fila; la fila se llena siempre con el valor correcto, se acierte o no); las
 * cajas se abren en cualquier orden (los
 * casos no se suman: son tres finales distintos del mismo castigo). La cifra
 * revivida es la que se destaca: Sora 15/700, borde 2 nodo y relleno navy;
 * lo que entra a Caja, Sora 13/600 con borde neutro. Antes de abrir, la
 * celda va vacía con borde atenuado. Con las tres filas llenas, b y c
 * muestran la misma plata y distinto monto revivido, una debajo de la otra.
 * Sin puntaje ni color de acierto o de error. Ningún texto vive aquí.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const BORDES = COLOR.neutro;
const ATENUADO = "rgba(184,196,212,.50)";
const NOMBRE_CAJA = { ...LECTURA, fontFamily: SORA, fontWeight: 600, lineHeight: 1.35 };
const CABECERA = { padding: 0, fontFamily: INTER, fontSize: "12px", fontWeight: 400, lineHeight: 1.35, color: COLOR.apagado, textAlign: "center" };

function Celda({ cifra, destacada }) {
  const llena = Boolean(cifra);
  return (
    <td data-celda={destacada ? "revive" : "entran"} style={{ padding: 0 }}>
      <div style={{
        minHeight: "36px", boxSizing: "border-box", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
        border: !llena ? `1px solid ${ATENUADO}` : destacada ? `2px solid ${FAE.node}` : `1px solid ${BORDES}`,
        background: llena && destacada ? FAE.navy : "transparent",
        fontFamily: SORA, fontSize: destacada ? "15px" : "13px", fontWeight: destacada ? 700 : 600, lineHeight: 1.3,
        fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: FAE.text,
      }}>
        {cifra}
      </div>
    </td>
  );
}

export default function TresCasos() {
  const reducido = useReducido();
  const [abiertos, setAbiertos] = useState(() => new Set());
  const [elecciones, setElecciones] = useState(() => ({}));
  const bloqueFinal = useRef(null);
  const decidido = (c) => elecciones[c.id] !== undefined;
  const todos = CASOS_T6_A4.every(decidido);

  useEffect(() => {
    if (todos) bloqueFinal.current?.scrollIntoView?.({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
  }, [todos]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div data-capa3-t6-a4 className={CLASE_T5}>
      <EstilosT5 />
      <p style={{ ...LECTURA, fontFamily: SORA }}>{CONSIGNA_CAPA_3_T6_A4}</p>

      {/* El tablero: una tabla, para que se lea con sus cabeceras de fila y de columna. */}
      <div data-tablero aria-live="polite" style={{ marginTop: "12px", border: `1px solid ${BORDES}`, borderRadius: "12px", padding: "8px 10px 10px" }}>
        <table style={{ width: "calc(100% + 12px)", margin: "-6px", borderCollapse: "separate", borderSpacing: "6px", tableLayout: "fixed" }}>
          <colgroup><col style={{ width: "20px" }} /><col /><col /></colgroup>
          <thead>
            <tr>
              <td />
              <th scope="col" style={CABECERA}>{TABLERO_T6_A4.revive}</th>
              <th scope="col" style={CABECERA}>{TABLERO_T6_A4.entran}</th>
            </tr>
          </thead>
          <tbody>
            {CASOS_T6_A4.map((c) => {
              const lleno = decidido(c);
              return (
                <tr key={c.id} data-fila={c.id}>
                  <th scope="row" style={{ padding: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: FAE.text, textAlign: "left" }}>{c.letra}</th>
                  <Celda cifra={lleno ? c.revive : null} destacada />
                  <Celda cifra={lleno ? c.entran : null} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {CASOS_T6_A4.map((c) => (
          <Caja key={c.id} estiloTitulo={NOMBRE_CAJA} forma="fila"
            caja={{ id: c.id, titulo: c.nombre, revela: c.revela, pie: c.pie, decide: { pregunta: PREGUNTA_CAPA_3_T6_A4, opciones: OPCIONES_CAPA_3_T6_A4, correcta: c.correcta, falla: c.falla } }}
            abierto={abiertos.has(c.id)} onAbrir={() => setAbiertos((s) => new Set(s).add(c.id))}
            elegida={elecciones[c.id] ?? null} onElegir={(o) => setElecciones((e) => ({ ...e, [c.id]: o }))} />
        ))}
      </div>

      <div ref={bloqueFinal} data-final aria-live="polite">
        {todos && (
          <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "12px", border: `1px solid ${BORDES}`, background: FAE.navy }}>
            <p style={LECTURA}>{FINAL_CAPA_3_T6_A4.texto}</p>
            <p data-pie style={PIE}>{FINAL_CAPA_3_T6_A4.pie}</p>
          </div>
        )}
      </div>
    </div>
  );
}
