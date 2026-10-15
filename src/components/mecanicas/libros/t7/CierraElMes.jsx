import { useEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { pesos } from "../../../../data/contabilidad.js";
import {
  H4, FICHA_H4, METODOS_H4, FILAS_H4, UTILIDAD_ANTES_H4, CIERRE_PARTE1_H4, PARTE2_H4, BOTON_H4, resumenH4,
} from "../../../../data/contabilidadT7_1_h4.js";
import { CASILLAS_H4, bancoH4, evaluarCasillaH4, idLineaH4, puntuarH4, TOTAL_H4 } from "../../../../contabilidad/t7H4.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { CSS_T7_HACER, Ficha, LineasConComprobar, TEXTO, INTER, APAGADO } from "./hacerT7.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 4 · CIERRA EL MES (Célula C)
 *
 * PARTE 1 · LA TABLA. Tres métodos × cuatro filas, una tarjeta por método
 * (en el teléfono se apilan; en pantallas anchas van lado a lado). Arriba, el
 * banco de quince cifras. Se toca una cifra y después la casilla donde va
 * (corrección 3: tocar en vez de arrastrar). Mientras no se confirma, una
 * casilla llena se vacía tocándola, o se cambia tocando otra cifra y luego
 * ella. «Confirmar» se activa con las doce llenas y las califica UNA vez.
 * Después: cada casilla en acierto o en error (la buena se enseña), la fila
 * «Utilidad antes de impuestos» con su texto, la devolución de cada casilla
 * mal llenada y el cierre de la parte 1, que siempre se ve.
 *
 * PARTE 2 · EL CIERRE CON EL PROMEDIO. Va después, para no regalar el
 * inventario final con el promedio. Las dos líneas de Inventario de
 * mercancías, con «Comprobar» (patrón v3.2).
 *
 * Al terminar: onCompletar(pct, ms, detalle) con las catorce unidades.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS = `
.t7h4-metodos { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr)); gap: 10px; }
.t7h4-banco { display: flex; flex-wrap: wrap; gap: 7px; }
`;

const FICHA_BTN = (activa) => ({
  minHeight: "44px", padding: "8px 11px", borderRadius: "10px", cursor: "pointer",
  fontFamily: INTER, fontSize: "14px", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
  background: activa ? "rgba(233,196,106,0.16)" : "rgba(14,27,46,0.6)",
  border: `1px solid ${activa ? FAE.ambar : "rgba(248,249,250,0.22)"}`, color: FAE.text,
});

const CASILLA_BTN = (estado) => {
  const borde = { ok: FAE.teal, mal: FAE.coral, llena: "rgba(248,249,250,0.45)" }[estado] ?? "rgba(248,249,250,0.22)";
  return {
    minHeight: "44px", minWidth: "112px", padding: "8px 10px", borderRadius: "10px",
    fontFamily: INTER, fontSize: "14px", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", textAlign: "right",
    background: estado === "mal" ? "rgba(231,111,81,0.13)" : estado === "ok" ? "rgba(42,157,143,0.12)" : "rgba(10,20,34,0.45)",
    border: `1px ${estado ? "solid" : "dashed"} ${borde}`, color: FAE.text, cursor: estado === "ok" || estado === "mal" ? "default" : "pointer",
  };
};

export default function CierraElMes({ Marco, rotulo, titulo, acento, onCompletar, banco = null, onComoSeJuega = null }) {
  const t = useTanda(() => banco ?? bancoH4(barajar));
  const [colocadas, setColocadas] = useState({});
  const [seleccion, setSeleccion] = useState(null);
  const [revision, setRevision] = useState(null);
  const [parte, setParte] = useState(1);
  const [cierreHecho, setCierreHecho] = useState(false);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuarH4(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps

  const enBanco = t.items.filter((v) => !Object.values(colocadas).includes(v));
  const llenas = CASILLAS_H4.every((c) => colocadas[c.id] !== undefined);

  const tocarCasilla = (id) => {
    if (revision) return;
    if (seleccion !== null) {
      setColocadas((c) => ({ ...c, [id]: seleccion }));
      setSeleccion(null);
    } else if (colocadas[id] !== undefined) {
      setColocadas((c) => { const n = { ...c }; delete n[id]; return n; });
    }
  };

  const confirmar = () => {
    if (revision || !llenas) return;
    const r = {};
    let n = 0;
    for (const c of CASILLAS_H4) {
      r[c.id] = evaluarCasillaH4(c.id, colocadas[c.id]);
      t.anotar(c.id, r[c.id].ok, colocadas[c.id]);
      if (r[c.id].ok) n += 1;
    }
    setBien((b) => b + n);
    setRevision(r);
    requestAnimationFrame(() => zonaBoton.current?.querySelector("button")?.focus());
  };

  const comprobarCierre = (resultados) => {
    let n = 0;
    for (const x of resultados) { t.anotar(idLineaH4(x.linea), x.ok, x.elegido); if (x.ok) n += 1; }
    setBien((b) => b + n);
    setCierreHecho(true);
  };

  const reiniciar = () => {
    t.reiniciar(); setColocadas({}); setSeleccion(null); setRevision(null); setParte(1); setCierreHecho(false); setBien(0);
  };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH4(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumenH4(bien, TOTAL_H4)}</p>
        </Cierre>
      </Marco>
    );
  }

  const malas = revision ? CASILLAS_H4.filter((c) => !revision[c.id].ok) : [];

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER + CSS}</style>
      <div data-h4>
        <Encabezado consigna={H4.consigna.join(" ")} onComoSeJuega={onComoSeJuega} />
        <p data-entrada style={{ ...TEXTO, fontSize: "14px", lineHeight: "21px", margin: "0 0 8px" }}>{H4.entrada}</p>
        <Ficha filas={FICHA_H4} />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={2} hechos={(parte === 1 ? 0 : 1) + ((parte === 1 && revision) || (parte === 2 && cierreHecho) ? 1 : 0)} enCurso={parte} etiqueta="Parte" />
        </div>

        {parte === 1 && (
          <div data-parte-h4="tabla">
            <p data-recordatorio style={{
              margin: "0 0 12px", padding: "9px 12px", borderRadius: "10px", border: `1px solid ${FAE.ambar}55`,
              fontFamily: INTER, fontSize: "13.5px", lineHeight: "20px", color: FAE.text,
            }}>{H4.recordatorio}</p>

            {!revision && (
              <div data-banco style={{ margin: "0 0 14px" }}>
                <p style={{ margin: "0 0 7px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: APAGADO }}>CIFRAS</p>
                <div className="t7h4-banco" role="group" aria-label="Cifras para poner en la tabla">
                  {enBanco.map((v) => (
                    <button key={v} type="button" data-ficha-cifra={v} aria-pressed={seleccion === v}
                      onClick={() => setSeleccion((s) => (s === v ? null : v))} style={FICHA_BTN(seleccion === v)}>
                      {pesos(v)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="t7h4-metodos">
              {METODOS_H4.map((m) => (
                <div key={m.id} data-metodo={m.id} style={{ padding: "10px 12px", borderRadius: "11px", border: "1px solid rgba(248,249,250,0.12)" }}>
                  <p style={{ margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", color: FAE.ambar }}>{m.nombre}</p>
                  {FILAS_H4.map((f) => {
                    const id = `${m.id}:${f.id}`;
                    const r = revision?.[id];
                    const v = colocadas[id];
                    const estado = r ? (r.ok ? "ok" : "mal") : v !== undefined ? "llena" : null;
                    return (
                      <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", padding: "4px 0" }}>
                        <span style={{ fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: APAGADO, minWidth: 0 }}>{f.nombre}</span>
                        <span style={{ display: "grid", justifyItems: "end", flexShrink: 0 }}>
                          <button type="button" data-casilla={id} data-estado={estado ?? "vacia"} disabled={Boolean(revision)}
                            aria-label={`${m.nombre}, ${f.nombre}: ${v !== undefined ? pesos(v) : "vacía"}`}
                            onClick={() => tocarCasilla(id)} style={CASILLA_BTN(estado)}>
                            {v !== undefined ? pesos(v) : "—"}
                          </button>
                          {r && !r.ok && <span data-era style={{ fontFamily: INTER, fontSize: "12px", color: FAE.teal, marginTop: "2px" }}>era {pesos(r.correcta)}</span>}
                        </span>
                      </div>
                    );
                  })}
                  {revision && (
                    <div data-antes-impuestos style={{ display: "flex", justifyContent: "space-between", gap: "8px", padding: "6px 0 0", marginTop: "4px", borderTop: "1px solid rgba(248,249,250,0.14)" }}>
                      <span style={{ fontFamily: INTER, fontSize: "13px", color: FAE.text }}>{UTILIDAD_ANTES_H4.nombre}</span>
                      <span style={{ fontFamily: INTER, fontSize: "14px", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", color: FAE.text }}>{pesos(m.cifras.operacional)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!revision && <Responder onClick={confirmar} deshabilitado={!llenas}>{BOTON_H4.confirmar}</Responder>}

            {revision && (
              <div className="fae-t7h-entra" style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
                <p data-texto-antes style={{ ...TEXTO, fontSize: "14px" }}>{UTILIDAD_ANTES_H4.texto}</p>
                {malas.map((c) => (
                  <div key={c.id} data-retro-casilla={c.id} data-panel="error" style={{
                    padding: "11px 13px", borderRadius: "11px", background: "rgba(231,111,81,0.13)", borderLeft: `3px solid ${FAE.coral}`,
                  }}>
                    <p style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: APAGADO }}>
                      {`${c.metodo.nombre} · ${c.fila.nombre}`.toUpperCase()}
                    </p>
                    <span style={SOLO_LECTOR}>{`Incorrecto. Era ${pesos(c.valor)}. `}</span>
                    {revision[c.id].textos.map((x) => <p key={x} data-texto-retro style={{ ...TEXTO, margin: "0 0 4px" }}>{x}</p>)}
                  </div>
                ))}
                <p data-cierre-parte1 style={{ ...TEXTO, padding: "11px 13px", borderRadius: "11px", background: "rgba(184,196,212,0.13)", borderLeft: "3px solid #B8C4D4" }}>
                  {CIERRE_PARTE1_H4}
                </p>
                <div ref={zonaBoton}>
                  <Responder onClick={() => setParte(2)}>{BOTON_H4.siguiente}</Responder>
                </div>
              </div>
            )}
          </div>
        )}

        {parte === 2 && (
          <div data-parte-h4="cierre" className="fae-t7h-entra">
            <p data-consigna-cierre style={{ ...TEXTO, margin: "0 0 10px" }}>{PARTE2_H4.consigna}</p>
            <LineasConComprobar lineas={PARTE2_H4.lineas} onComprobar={comprobarCierre} comprobado={cierreHecho} />
            {cierreHecho && <Responder onClick={() => t.setTerminado(true)}>{BOTON_H4.verResumen}</Responder>}
          </div>
        )}
        <p data-pie style={{ margin: "14px 0 0", fontFamily: INTER, fontSize: "12px", color: APAGADO }}>{H4.pie}</p>
      </div>
    </Marco>
  );
}
