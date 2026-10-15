import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { H3, FICHA_H3, BOTON_H3, resumenH3 } from "../../../../data/contabilidadT7_1_h3.js";
import { prepararH3, evaluarH3, textoDeOpcionH3, puntuarH3, TOTAL_H3 } from "../../../../contabilidad/t7H3.js";
import { Opcion, Opciones, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { Plegable } from "./plegable.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 3 · ¿CUÁNTO VALE LO QUE SOBRÓ? (Célula C)
 *
 * Arriba, siempre a la vista: la entrada de Near y la ficha de valoración
 * (regla 10, versión periódico), porque los cinco ítems la usan. Debajo, un
 * ítem a la vez, en el orden de la tabla, con el encabezado del método cuando
 * la v1 lo trae y tres opciones barajadas. UN SOLO TOQUE: se bloquea, la
 * elegida queda en acierto o en error y, si falló, la buena se enseña.
 * Debajo, el acierto de Near o la retroalimentación de ese distractor.
 *
 * La misma forma que H1 y H2, con las piezas compartidas (Opcion, Pulsos,
 * Cierre, Encabezado, Responder) sin cambiarlas. Coral solo para el error.
 *
 * Al terminar: onCompletar(pct, ms, detalle). Evaluativa: el motor escala los
 * 25 FP con el porcentaje, con piso del 50 %.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const INTER = "Inter, sans-serif";
const APAGADO = "rgba(248,249,250,0.6)";
const TEXTO = { margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: FAE.text };

const CSS = `
@keyframes fae-t7h3-fundido { from { opacity: 0; } to { opacity: 1; } }
.fae-t7h3-entra { animation: fae-t7h3-fundido 150ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .fae-t7h3-entra { animation: none !important; } }
`;

function Ficha() {
  /* Un dato por renglón: el rótulo arriba y el dato debajo, que a 320 px se lee entero. */
  return (
    <dl data-ficha style={{
      margin: "0 0 14px", padding: "10px 12px", borderRadius: "11px", border: "1px solid rgba(248,249,250,0.12)",
      background: "rgba(10,20,34,0.35)", display: "grid", rowGap: "7px",
    }}>
      {FICHA_H3.map(([dato, texto]) => (
        <div key={dato}>
          <dt style={{ fontFamily: INTER, fontSize: "12px", color: APAGADO }}>{dato}</dt>
          <dd style={{ margin: 0, fontFamily: INTER, fontSize: "14px", color: FAE.text, overflowWrap: "anywhere" }}>{texto}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function CuantoValeLoQueSobro({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH3(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH3(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r) zonaBoton.current?.querySelector("button")?.focus(); }, [r]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarH3(item, v);
    t.anotar(item.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(v);
    setR(nuevo);
  };

  const avanzar = () => {
    setElegida(null); setR(null);
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setElegida(null); setR(null); setBien(0); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH3(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH3(bien, TOTAL_H3)}</p>
        </Cierre>
      </Marco>
    );
  }

  const estadoDe = (v) => {
    if (!r) return null;
    if (v === elegida) return r.ok ? "correcta" : "incorrecta";
    if (v === r.correcta) return "revelada";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <div data-h3>
        <Encabezado consigna={H3.consigna} onComoSeJuega={onComoSeJuega} />
        <p data-entrada style={{ ...TEXTO, fontSize: "14px", lineHeight: "21px", margin: "0 0 8px" }}>{H3.entrada}</p>
        <Ficha />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
        </div>

        <div key={item.id} className="fae-t7h3-entra" data-item={item.id} style={{
          margin: "0 0 12px", padding: "11px 13px", borderRadius: "11px",
          background: "rgba(184,196,212,0.12)", borderLeft: "3px solid #B8C4D4",
        }}>
          {item.encabezado && (
            <p data-encabezado-metodo style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", color: FAE.ambar }}>
              {item.encabezado.toUpperCase()}
            </p>
          )}
          <p ref={tarjeta} tabIndex={-1} data-pregunta style={{ ...TEXTO, outline: "none" }}>{item.pregunta}</p>
          <p data-pie style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", color: APAGADO }}>{H3.pie}</p>
        </div>

        <div role="group" aria-label={item.pregunta}>
          <Opciones columnas="minmax(0, 1fr)">
            {item.opciones.map((v) => (
              <span key={v} data-opcion={v} style={{ display: "contents" }}>
                <Opcion ancho deshabilitada={Boolean(r)} estado={estadoDe(v)} onClick={() => elegir(v)}>{textoDeOpcionH3(item, v)}</Opcion>
              </span>
            ))}
          </Opciones>
        </div>

        <div data-retro aria-live="polite" aria-atomic="true">
          {r && (
            <div className="fae-t7h3-entra" data-panel={r.ok ? "acierto" : "error"} style={{
              marginTop: "12px", padding: "11px 13px", borderRadius: "11px",
              background: r.ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
              borderLeft: `3px solid ${r.ok ? "#B8C4D4" : FAE.coral}`,
            }}>
              {!r.ok && <span style={SOLO_LECTOR}>{`Incorrecto. La respuesta es ${textoDeOpcionH3(item, r.correcta)}. `}</span>}
              <p data-texto-retro style={TEXTO}><Plegable texto={r.texto} /></p>
            </div>
          )}
        </div>
      </div>

      {r && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H3.verResumen : BOTON_H3.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
