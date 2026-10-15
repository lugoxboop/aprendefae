import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import { H2, FICHAS_H2, BOTON_H2, LADOS_H2, resumenH2 } from "../../../../data/contabilidadT7_1_h2.js";
import { prepararH2, evaluarCalculoH2, evaluarLineaH2, idDeLinea, puntuarH2, TOTAL_H2 } from "../../../../contabilidad/t7H2.js";
import { Opcion, Opciones, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { AsientoEnLineas, ElegirLado, Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { Plegable } from "./plegable.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 2 · ARMA LA FACTURA (Célula C)
 *
 * Arriba, siempre a la vista: el enunciado de Near y las fichas de la compra y
 * de la venta, porque cada cálculo las usa. Debajo, un ítem a la vez, en el
 * orden de la tabla:
 *
 *   CÁLCULO  la pregunta y tres cifras, barajadas. UN SOLO TOQUE: se bloquea,
 *            la elegida queda en acierto o en error y, si falló, la buena se
 *            enseña. Debajo, el acierto de Near o la retroalimentación de ese
 *            distractor.
 *   ASIENTO  cuatro líneas, barajadas, cada una con Debe y Haber. UN SOLO
 *            TOQUE POR LÍNEA: la línea se bloquea y enseña su lado; si falló,
 *            su mensaje va debajo de ella. Con las cuatro puestas, el asiento
 *            completo con sus sumas.
 *
 * Doce unidades, doce aciertos posibles, sin arrastre: las cifras son fijas.
 * El error va en coral, que el canon reserva para el error. Todo lo que se
 * toca es de las piezas compartidas (Opcion, Pulsos, Cierre, Encabezado,
 * Responder, ElegirLado, AsientoEnLineas), sin cambiarlas; lo propio es la
 * tarjeta de la pregunta, las fichas y la devolución, con la forma de H1.
 *
 * Al terminar: onCompletar(pct, ms, detalle). Evaluativa: el motor escala los
 * 25 FP con el porcentaje, con piso del 50 %.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const INTER = "Inter, sans-serif";
const APAGADO = "rgba(248,249,250,0.6)";

const CSS = `
@keyframes fae-t7h2-fundido { from { opacity: 0; } to { opacity: 1; } }
.fae-t7h2-entra { animation: fae-t7h2-fundido 150ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .fae-t7h2-entra { animation: none !important; } }
`;

const PANEL = (ok) => ({
  marginTop: "10px", padding: "11px 13px", borderRadius: "11px",
  background: ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
  borderLeft: `3px solid ${ok ? "#B8C4D4" : FAE.coral}`,
});
const TEXTO = { margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: FAE.text };

function Fichas() {
  const ficha = (f) => (
    <div key={f.titulo} data-ficha={f.titulo} style={{ padding: "10px 12px", borderRadius: "11px", border: "1px solid rgba(248,249,250,0.12)", background: "rgba(10,20,34,0.35)" }}>
      <p style={{ margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar }}>{f.titulo.toUpperCase()}</p>
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", columnGap: "10px", rowGap: "3px" }}>
        {FICHAS_H2.campos.map((c, k) => (
          <div key={c} style={{ display: "contents" }}>
            <dt style={{ fontFamily: INTER, fontSize: "12.5px", color: APAGADO }}>{c}</dt>
            <dd style={{ margin: 0, fontFamily: INTER, fontSize: "13px", color: FAE.text, overflowWrap: "anywhere" }}>{f.valores[k]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
  return (
    <div data-fichas style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "8px", margin: "0 0 14px" }}>
      {ficha(FICHAS_H2.compra)}
      {ficha(FICHAS_H2.venta)}
    </div>
  );
}

function Calculo({ item, r, elegida, onElegir }) {
  const estadoDe = (v) => {
    if (!r) return null;
    if (v === elegida) return r.ok ? "correcta" : "incorrecta";
    if (v === r.correcta) return "revelada";
    return null;
  };
  return (
    <>
      <div role="group" aria-label={item.pregunta}>
        <Opciones columnas="minmax(0, 1fr)">
          {item.opciones.map((v) => (
            <span key={v} data-opcion={v} style={{ display: "contents" }}>
              <Opcion ancho deshabilitada={Boolean(r)} estado={estadoDe(v)} onClick={() => onElegir(v)}>{pesos(v)}</Opcion>
            </span>
          ))}
        </Opciones>
      </div>
      <div data-retro aria-live="polite" aria-atomic="true">
        {r && (
          <div className="fae-t7h2-entra" data-panel={r.ok ? "acierto" : "error"} style={PANEL(r.ok)}>
            {!r.ok && <span style={SOLO_LECTOR}>{`Incorrecto. La respuesta es ${pesos(r.correcta)}. `}</span>}
            <p data-texto-retro style={TEXTO}><Plegable texto={r.texto} /></p>
          </div>
        )}
      </div>
    </>
  );
}

function Asiento({ item, puestas, onPoner }) {
  const porId = Object.fromEntries(item.lineas.map((l) => [l.id, l]));
  const completo = item.lineas.every((l) => puestas[l.id]);
  return (
    <>
      <div style={{ display: "grid", gap: "10px" }}>
        {item.orden.map((id) => {
          const l = porId[id];
          const r = puestas[id] ?? null;
          return (
            <div key={id} data-linea={id} style={{ padding: "10px 12px", borderRadius: "11px", border: "1px solid rgba(248,249,250,0.12)" }}>
              <p style={{ ...TEXTO, margin: "0 0 8px", display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                <span data-cuenta>{l.cuenta}</span>
                <span data-valor style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{pesos(l.valor)}</span>
              </p>
              <div role="group" aria-label={`${l.cuenta}: Debe o Haber`}>
                <ElegirLado elegido={r?.elegido ?? null} correcto={r ? r.correcto : null} deshabilitado={Boolean(r)} onElegir={(lado) => onPoner(l, lado)} nombres={LADOS_H2} />
              </div>
              <div data-retro-linea aria-live="polite">
                {r && !r.ok && (
                  <div className="fae-t7h2-entra" data-panel="error" style={PANEL(false)}>
                    <span style={SOLO_LECTOR}>{`Incorrecto. Va al ${LADOS_H2[r.correcto].toLowerCase()}. `}</span>
                    <p data-texto-retro style={TEXTO}><Plegable texto={r.texto} /></p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {completo && (
        <div className="fae-t7h2-entra" data-asiento-completo style={{ marginTop: "12px" }}>
          <AsientoEnLineas lineas={item.lineas.map((l) => ({ cuenta: l.cuenta, lado: l.lado, valor: l.valor }))} totales acento={FAE.ambar} />
        </div>
      )}
    </>
  );
}

export default function ArmaLaFactura({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? prepararH2(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [puestas, setPuestas] = useState({});
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const listo = item && (item.tipo === "calculo" ? Boolean(r) : item.lineas.every((l) => puestas[l.id]));

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH2(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (listo) zonaBoton.current?.querySelector("button")?.focus(); }, [listo]);

  const elegir = (v) => {
    if (r) return;
    const nuevo = evaluarCalculoH2(item, v);
    t.anotar(item.id, nuevo.ok, v);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(v);
    setR(nuevo);
  };

  const poner = (linea, lado) => {
    if (puestas[linea.id]) return;
    const nuevo = evaluarLineaH2(linea, lado);
    t.anotar(idDeLinea(item, linea), nuevo.ok, lado);
    if (nuevo.ok) setBien((n) => n + 1);
    setPuestas((p) => ({ ...p, [linea.id]: { ...nuevo, elegido: lado } }));
  };

  const avanzar = () => {
    setElegida(null); setR(null); setPuestas({});
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setElegida(null); setR(null); setPuestas({}); setBien(0); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH2(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH2(bien, TOTAL_H2)}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <div data-h2>
        <Encabezado consigna={H2.consigna} onComoSeJuega={onComoSeJuega} />
        <div data-enunciado style={{ margin: "0 0 10px" }}>
          {H2.enunciado.map((p) => <p key={p} style={{ ...TEXTO, fontSize: "14px", lineHeight: "21px", margin: "0 0 6px" }}>{p}</p>)}
        </div>
        <Fichas />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (listo ? 1 : 0)} enCurso={t.i + 1} etiqueta="Pregunta" />
        </div>

        <div key={item.id} className="fae-t7h2-entra" data-item={item.id} style={{
          margin: "0 0 12px", padding: "11px 13px", borderRadius: "11px",
          background: "rgba(184,196,212,0.12)", borderLeft: "3px solid #B8C4D4",
        }}>
          <p ref={tarjeta} tabIndex={-1} data-pregunta style={{ ...TEXTO, outline: "none" }}>{item.pregunta}</p>
          <p data-pie style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", color: APAGADO }}>{H2.pie}</p>
        </div>

        {item.tipo === "calculo"
          ? <Calculo item={item} r={r} elegida={elegida} onElegir={elegir} />
          : <Asiento item={item} puestas={puestas} onPoner={poner} />}
      </div>

      {listo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H2.verResumen : BOTON_H2.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
