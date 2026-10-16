import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import {
  CONSIGNA_CAPA_3_T6_A3, MOMENTOS_T6_A3, CUENTA_T_T6_A3, FINAL_CAPA_3_T6_A3,
} from "../../../../data/contabilidadT6Pieza3.js";
import { useReducido } from "../tema3/DosLineas.jsx";
import EstilosT5, { CLASE_T5 } from "../tema5/EstilosT5.jsx";
import { Caja, LECTURA, PIE } from "./CajasQueRevelan.jsx";
import { escalera, elegir } from "./escaleraB5.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 3 · CAPA 3 · «AHORA PRUEBE USTED» — la cuenta T de la
 * provisión en tres momentos (guía de Mai v1 §5).
 *
 * Los momentos se abren EN ORDEN: al principio solo se ve la caja de 2007, y
 * cada caja aparece cuando se DECIDE la anterior (con la escalera de ayuda:
 * cuando su pregunta se cierra, al acertar o al segundo error) (hoja 6: cada momento hace
 * su pregunta antes de revelar; la T se llena al decidir, siempre con el
 * valor correcto, se acierte o no) (si marzo se abriera primero,
 * la T mostraría un saldo que nunca existió). Sin cajas bloqueadas ni texto
 * nuevo. Cada momento abierto deja su monto en su columna, con el nombre del
 * momento debajo, y el saldo que queda:
 *   · normal: bajo HABER, a la derecha, bajo un filete de 1 px, como un total;
 *   · en contra (lo que le falta): bajo DEBE, a la izquierda, en un
 *     recuadro de borde 2 px nodo. Sin coral ni borde discontinuo: la
 *     provisión no está mal anotada, se quedó corta.
 * «DEBE» y «HABER» llevan el estilo publicado de los colectores de
 * ElCierreCompleto (Sora 9). Ningún texto vive aquí.
 *
 * B5 de Futaba: las cajas se llaman por lo que pasa («Se crea», «Se usa»,
 * «Se corrige»); la fecha de cada momento queda solo en su fila de la T.
 * Cada caja conserva su pregunta visible mientras falta decidir, porque cada
 * una pregunta algo distinto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const BORDES = COLOR.neutro;
const LINEA_T = `2px solid ${BORDES}`;
const MONTO = { margin: 0, fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: FAE.text };
const MOMENTO = { margin: 0, fontFamily: INTER, fontSize: "12px", lineHeight: 1.35, color: COLOR.apagado };
const NOMBRE_CAJA = { ...LECTURA, fontFamily: SORA, fontWeight: 600, lineHeight: 1.35 };

function Columna({ lado, movimientos }) {
  return (
    <div data-columna={lado} style={{ padding: "6px 8px 4px", textAlign: "right", borderLeft: lado === "haber" ? LINEA_T : "none" }}>
      <p style={{ margin: "0 0 4px", textAlign: "center", fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: 1.3, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>
        {CUENTA_T_T6_A3[lado]}
      </p>
      {movimientos.map((m) => (
        <div key={m.id} data-movimiento={m.id} style={{ marginTop: "6px" }}>
          <p style={MONTO}>{m.monto}</p>
          <p style={MOMENTO}>{m.nombre}</p>
        </div>
      ))}
    </div>
  );
}

function Saldo({ saldo }) {
  if (!saldo) return null;
  if (saldo.enContra) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: "8px" }}>
        <p data-saldo="en-contra" style={{
          margin: 0, justifySelf: "start", padding: "5px 8px", borderRadius: "10px", border: `2px solid ${FAE.node}`,
          fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.35, color: FAE.text,
        }}>
          {saldo.texto}
        </p>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: "8px" }}>
      <p data-saldo="normal" style={{
        gridColumn: "2", margin: 0, paddingTop: "4px", borderTop: `1px solid ${BORDES}`, textAlign: "right",
        fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.35, color: FAE.text,
      }}>
        {saldo.texto}
      </p>
    </div>
  );
}

export default function CuentaT() {
  const reducido = useReducido();
  const [abiertos, setAbiertos] = useState(0);
  const [elecciones, setElecciones] = useState(() => ({}));
  const bloqueFinal = useRef(null);
  /* Un momento queda decidido al cerrarse su pregunta: al acertar o al segundo error (escalera de ayuda, lote C2). */
  const decideDe = (m) => ({ pregunta: m.pregunta, opciones: m.opciones, correcta: m.correcta, falla: m.falla, pista: m.pista });
  const decididos = MOMENTOS_T6_A3.findIndex((m) => !escalera(decideDe(m), elecciones[m.id]).resuelta);
  const n = decididos === -1 ? MOMENTOS_T6_A3.length : decididos;
  const todos = n === MOMENTOS_T6_A3.length;
  const hechos = MOMENTOS_T6_A3.slice(0, n);
  const saldo = hechos.length ? hechos[hechos.length - 1].saldo : null;

  useEffect(() => {
    if (todos) bloqueFinal.current?.scrollIntoView?.({ block: "nearest", behavior: reducido ? "auto" : "smooth" });
  }, [todos]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div data-capa3-t6-a3 className={CLASE_T5}>
      <EstilosT5 />
      <p style={{ ...LECTURA, fontFamily: SORA }}>{CONSIGNA_CAPA_3_T6_A3}</p>

      {/* La cuenta T. */}
      <div data-cuenta-t aria-live="polite" style={{ marginTop: "12px", border: `1px solid ${BORDES}`, borderRadius: "12px", padding: "10px 12px 12px" }}>
        <p style={{ margin: 0, textAlign: "center", fontFamily: SORA, fontSize: "13px", fontWeight: 600, lineHeight: 1.3, color: FAE.text }}>{CUENTA_T_T6_A3.nombre}</p>
        <div style={{ marginTop: "6px", borderTop: LINEA_T, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <Columna lado="debe" movimientos={hechos.filter((m) => m.lado === "debe")} />
          <Columna lado="haber" movimientos={hechos.filter((m) => m.lado === "haber")} />
        </div>
        <Saldo saldo={saldo} />
      </div>

      {/* Las cajas, en orden: cada una aparece cuando se decide la anterior. Opciones en columna (Mai §2). */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
        {MOMENTOS_T6_A3.slice(0, Math.min(n + 1, MOMENTOS_T6_A3.length)).map((m, i) => (
          <Caja key={m.id} estiloTitulo={NOMBRE_CAJA} forma="columna"
            caja={{ id: m.id, titulo: m.caja, revela: m.revela, pie: m.pie, decide: decideDe(m) }}
            abierto={i < abiertos} onAbrir={() => setAbiertos((k) => Math.max(k, i + 1))}
            intentos={elecciones[m.id]} onElegir={(o) => setElecciones((e) => ({ ...e, [m.id]: elegir(decideDe(m), e[m.id] ?? [], o) }))} />
        ))}
      </div>

      <div ref={bloqueFinal} data-final aria-live="polite">
        {todos && (
          <div style={{ marginTop: "16px", padding: "12px 14px", borderRadius: "12px", border: `1px solid ${BORDES}`, background: FAE.navy }}>
            <p style={LECTURA}>{FINAL_CAPA_3_T6_A3.texto}</p>
            <p data-pie style={PIE}>{FINAL_CAPA_3_T6_A3.pie}</p>
          </div>
        )}
      </div>
    </div>
  );
}
