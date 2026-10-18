import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import {
  CONSIGNA_CAPA_3_T6_A4, PREGUNTA_CAPA_3_T6_A4, OPCIONES_CAPA_3_T6_A4, TABLERO_T6_A4, CASOS_T6_A4, FINAL_CAPA_3_T6_A4,
} from "../../../../data/contabilidadT6Pieza4.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "../tema5/EstilosT5.jsx";
import { Caja, LECTURA, PIE, useFormaQueCabe } from "./CajasQueRevelan.jsx";
import { escalera, elegir } from "./escaleraB5.js";
import { MONO } from "./TanqueProvision.jsx";
import { Fantasma, erradaDe } from "./FigurasCapa3.jsx";

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
 *
 * Lote C1-11 de Futaba: el caso a es el de la capa 2, así que ya no se
 * pregunta. No tiene caja: su fila viene llena desde el principio, con el
 * rótulo «Ejemplo» bajo su letra. Solo b y c se deciden, con la escalera de
 * ayuda (escaleraB5.js): cada fila se llena al cerrarse su pregunta.
 *
 * B5 de Futaba: los textos que se revelan ya no llevan cifras (están en el
 * tablero) y solo los lee quien acierta; quien falla dos veces lee la
 * devolución de su opción (Caja). El del caso a va bajo su fila.
 *
 * Lote 27 (D4, Shoko): la cifra que eligió el estudiante por error queda
 * escrita en la celda «Se revive», como fantasma (tachada, borde coral
 * discontinuo), junto a la correcta: desde el error, y también después.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const BORDES = COLOR.neutro;
const ATENUADO = "rgba(184,196,212,.50)";
const NOMBRE_CAJA = { ...LECTURA, fontFamily: SORA, fontWeight: 600, lineHeight: 1.35 };
const ROTULO_EJEMPLO = { display: "block", marginTop: "2px", fontFamily: INTER, fontSize: "12px", fontWeight: 400, lineHeight: 1.35, color: COLOR.apagado };
/* El caso a es el ejemplo; los demás se preguntan. */
const PREGUNTADOS = CASOS_T6_A4.filter((c) => !c.ejemplo);
const decideDe = (c) => ({ pregunta: PREGUNTA_CAPA_3_T6_A4, opciones: OPCIONES_CAPA_3_T6_A4, correcta: c.correcta, falla: c.falla, pista: c.pista });
const CABECERA = { padding: 0, fontFamily: INTER, fontSize: "12px", fontWeight: 400, lineHeight: 1.35, color: COLOR.apagado, textAlign: "center" };

function Celda({ cifra, destacada, fantasma = null, id }) {
  const llena = Boolean(cifra);
  return (
    <td data-celda={destacada ? "revive" : "entran"} style={{ padding: 0, verticalAlign: "top" }}>
      <div style={{
        minHeight: "36px", boxSizing: "border-box", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
        border: !llena ? `1px solid ${ATENUADO}` : destacada ? `2px solid ${FAE.node}` : `1px solid ${BORDES}`,
        background: llena && destacada ? FAE.navy : "transparent",
        /* Lote 9: la cifra que entra, monoespaciada; la destacada (el resultado del caso) sigue en Sora. */
        fontFamily: destacada ? SORA : MONO, fontSize: destacada ? "15px" : "13px", fontWeight: destacada ? 700 : 600, lineHeight: 1.3,
        fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: FAE.text,
      }}>
        {cifra}
      </div>
      {fantasma && <div style={{ marginTop: "4px" }}><Fantasma id={id} texto={fantasma} centrada /></div>}
    </td>
  );
}

const textoDe = (id) => OPCIONES_CAPA_3_T6_A4.find((o) => o.id === id)?.texto ?? null;

export default function TresCasos() {
  const reducido = useReducido();
  const [abiertos, setAbiertos] = useState(() => new Set());
  const [elecciones, setElecciones] = useState(() => ({}));
  /* En fila, salvo que alguna opción se parta donde se pinta (Sakuta, 15-oct). */
  const [forma, seParte, vuelta] = useFormaQueCabe("fila");
  const bloqueFinal = useRef(null);
  const decidido = (c) => c.ejemplo || escalera(decideDe(c), elecciones[c.id]).resuelta;
  const todos = PREGUNTADOS.every(decidido);

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
          <colgroup><col style={{ width: "56px" }} /><col /><col /></colgroup>
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
                  <th scope="row" style={{ padding: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: FAE.text, textAlign: "left" }}>
                    {c.letra}
                    {c.ejemplo && <span data-rotulo-ejemplo style={ROTULO_EJEMPLO}>{TABLERO_T6_A4.ejemplo}</span>}
                  </th>
                  <Celda cifra={lleno ? c.revive : null} destacada id={c.id} fantasma={c.ejemplo ? null : textoDe(erradaDe(elecciones[c.id], c.correcta))} />
                  <Celda cifra={lleno ? c.entran : null} />
                </tr>
              );
            }).flatMap((fila, k) => {
              /* El ejemplo no tiene caja: su texto (B5 de Futaba) va bajo su fila, a lo ancho de las dos celdas. */
              const c = CASOS_T6_A4[k];
              if (!c.ejemplo || !c.revela) return [fila];
              return [fila, (
                <tr key={`${c.id}-texto`} data-texto-ejemplo={c.id}>
                  <td />
                  <td colSpan={2} style={{ padding: 0, fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: COLOR.apagado }}>{c.revela}</td>
                </tr>
              )];
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
        {PREGUNTADOS.map((c) => (
          <Caja key={c.id} estiloTitulo={NOMBRE_CAJA} forma={forma} onSeParte={seParte} vuelta={vuelta}
            caja={{ id: c.id, titulo: c.nombre, revela: c.revela, pie: c.pie, decide: decideDe(c) }}
            abierto={abiertos.has(c.id)} onAbrir={() => setAbiertos((s) => new Set(s).add(c.id))}
            intentos={elecciones[c.id]} onElegir={(o) => setElecciones((e) => ({ ...e, [c.id]: elegir(decideDe(c), e[c.id] ?? [], o) }))} />
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
