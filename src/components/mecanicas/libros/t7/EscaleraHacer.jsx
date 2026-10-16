import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { CSS_T7_HACER, TarjetaPregunta, TEXTO, INTER } from "./hacerT7.jsx";
import { Plegable } from "./plegable.jsx";
import { sinUnSoloIntento } from "../../../../contabilidad/armaLaLinea.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS HACER CON ESCALERA DE LA ENTREGA D (Célula C · T7-1 H7 y T5 N3).
 *
 * La forma de los Hacer de un toque (H7 de antes, UnToqueT5), con la
 * escalera del canon (C2), el distintivo (C5) y una figura que se llena (C8):
 *
 *   · opciones fijas; al primer error, la elegida queda marcada (coral, con
 *     aspa) y bloqueada, sale la pista y se puede volver a intentar
 *   · al segundo error, la respuesta con su porqué: la buena se enseña
 *     («era esta») y el caso se cierra
 *   · con el acierto, la elegida queda con ✓ y borde claro, en neutro: ni
 *     teal ni ámbar, que son el debe y el haber
 *   · SOLO SUMA EL PRIMER INTENTO: el porcentaje y el `detalle` del panel
 *     docente se anotan con la primera respuesta de cada caso
 *   · el foco va al mensaje cada vez que se responde
 *
 * Los textos de cada pieza llegan en `config` y en los datos; aquí solo hay
 * interfaz. Las opciones no son Opcion de juego.jsx porque esa marca el
 * acierto en teal y no deja reintentar.
 *
 * config = { datos: { objetivo?, consigna, distintivo, pie? }, botones,
 *   preparar, evaluar(item, v, fallos), puntuar, total, resumen, marca,
 *   etiqueta (la del contador), glosas? ({ valor: glosa }),
 *   Figura? ({ items, i, resueltos }), figuraDebajo? (la figura va debajo
 *   del caso y no encima), Antes? ({ i }, lo que va sobre la tarjeta) }
 * Al terminar: onCompletar(pct, ms, detalle).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CLARO = "#F8F9FA";

/* ═══════════ EL DISTINTIVO ═══════════ */

/* El contador con el distintivo a la derecha (la regla del juego, fuera de la consigna). */
export function ContadorPrimerIntento({ texto, children }) {
  return (
    /* El contador no se encoge por debajo de lo suyo: si no caben los dos (320 px), el distintivo baja de renglón. */
    <div data-contador-intento style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px" }}>
      <div style={{ flex: "1 0 auto" }}>{children}</div>
      <span data-primer-intento style={{
        display: "inline-flex", alignItems: "center", flex: "none", minHeight: "22px", padding: "0 8px", borderRadius: "999px",
        border: "1px solid rgba(248,249,250,0.22)", color: "#A8B6C8",
        fontFamily: INTER, fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap",
      }}>
        {texto}
      </span>
    </div>
  );
}

/* ═══════════ LAS OPCIONES ═══════════ */

/* La marca de la izquierda: hueca mientras se puede elegir; aspa coral en el error; ✓ en neutro en la buena. */
function Marca({ estado }) {
  const lleno = { correcta: CLARO, incorrecta: FAE.coral }[estado] ?? null;
  const anillo = lleno ?? (estado === "revelada" ? CLARO : "rgba(248,249,250,0.5)");
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" data-marca={estado ?? "libre"} style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="7.5" fill={lleno ?? "none"} stroke={anillo} strokeWidth={estado === "revelada" ? 2 : 1.5} />
      {(estado === "correcta" || estado === "revelada") && (
        <path d="M5.4 9.3 L7.9 11.7 L12.6 6.6" fill="none" stroke={estado === "revelada" ? CLARO : FAE.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {estado === "incorrecta" && <path d="M6.2 6.2 L11.8 11.8 M11.8 6.2 L6.2 11.8" fill="none" stroke={FAE.bg} strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

function OpcionEscalera({ texto, glosa, estado, deshabilitada, onClick }) {
  const borde = { correcta: `2px solid ${CLARO}`, revelada: `2px dashed ${CLARO}`, incorrecta: `1px solid ${FAE.coral}` }[estado] ?? "1px solid rgba(248,249,250,0.14)";
  return (
    <button type="button" onClick={onClick} disabled={deshabilitada} data-estado={estado ?? "libre"} style={{
      display: "flex", alignItems: "center", gap: "12px", width: "100%", minHeight: "44px", boxSizing: "border-box",
      textAlign: "left", padding: "10px 14px", borderRadius: "14px", border: borde,
      background: estado === "incorrecta" ? "rgba(231,111,81,0.10)" : "rgba(248,249,250,0.055)",
      color: FAE.text, fontFamily: INTER, fontSize: "14px", lineHeight: 1.4,
      opacity: deshabilitada && !estado ? 0.62 : 1, cursor: deshabilitada ? "default" : "pointer",
    }}>
      <Marca estado={estado} />
      <span style={{ minWidth: 0, flex: 1, overflowWrap: "break-word" }}>
        <span data-texto-opcion style={{ display: "block" }}>{texto}</span>
        {glosa && <span data-glosa style={{ display: "block", marginTop: "2px", fontSize: "12.5px", lineHeight: 1.4, color: "rgba(248,249,250,0.66)" }}>{glosa}</span>}
        {estado === "revelada" && <span data-era style={{ display: "block", marginTop: "2px", fontSize: "12px", color: "rgba(248,249,250,0.72)" }}>era esta</span>}
      </span>
    </button>
  );
}

/* ═══════════ EL MENSAJE ═══════════ */

function Mensaje({ r, panelRef }) {
  return (
    <div data-retro aria-live="polite" aria-atomic="true">
      {r && (
        <div ref={panelRef} tabIndex={-1} className="fae-t7h-entra" data-panel={r.ok ? "acierto" : "error"} data-cerrado={r.cerrado ? "si" : "no"} style={{
          marginTop: "12px", padding: "11px 13px", borderRadius: "11px", outline: "none",
          background: r.ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
          borderLeft: `3px solid ${r.ok ? "#B8C4D4" : FAE.coral}`,
        }}>
          {!r.ok && <span style={SOLO_LECTOR}>Incorrecto. </span>}
          {r.textos.map((x, k) => <p key={k} data-texto-retro style={{ ...TEXTO, margin: k ? "6px 0 0" : 0 }}><Plegable texto={x} /></p>)}
        </div>
      )}
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function EscaleraHacer({ config, Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const { datos, botones, preparar, evaluar, puntuar, total, resumen, marca, etiqueta, glosas = null, Figura = null, figuraDebajo = false, Antes = null } = config;
  const t = useTanda(() => items ?? preparar());
  const [fallos, setFallos] = useState(0);
  const [descartadas, setDescartadas] = useState([]);
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const [resueltos, setResueltos] = useState([]);
  const panel = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const cerrado = Boolean(r?.cerrado);

  useEffect(() => {
    if (t.terminado) onCompletar?.(puntuar(bien), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  /* El foco va al mensaje cada vez que se responde. */
  useEffect(() => { if (r) panel.current?.focus(); }, [r]);

  const elegir = (v) => {
    if (cerrado || descartadas.includes(v)) return;
    const nuevo = evaluar(item, v, fallos);
    /* Solo suma el primer intento: el detalle y el puntaje se anotan con la primera respuesta. */
    if (fallos === 0) {
      t.anotar(item.id, nuevo.ok, v);
      if (nuevo.ok) setBien((n) => n + 1);
    }
    if (!nuevo.ok) { setFallos((n) => n + 1); setDescartadas((d) => [...d, v]); }
    if (nuevo.cerrado) setResueltos((x) => [...x, item.id]);
    setElegida(v);
    setR(nuevo);
  };

  const limpiar = () => { setFallos(0); setDescartadas([]); setElegida(null); setR(null); };

  const avanzar = () => {
    limpiar();
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); limpiar(); setBien(0); setResueltos([]); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuar(bien))} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p data-resumen style={TEXTO_CIERRE}>{resumen(bien, total)}</p>
        </Cierre>
        {Figura && <div style={{ marginTop: "16px" }}><Figura items={t.items} i={t.i} resueltos={resueltos} /></div>}
      </Marco>
    );
  }

  const estadoDe = (v) => {
    if (descartadas.includes(v)) return "incorrecta";
    if (!cerrado) return null;
    if (r.ok && v === elegida) return "correcta";
    if (!r.ok && v === r.correcta) return "revelada";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T7_HACER}</style>
      <div {...{ [`data-${marca}`]: true }}>
        <Encabezado objetivo={datos.objetivo ?? null} consigna={sinUnSoloIntento(datos.consigna)} onComoSeJuega={onComoSeJuega} />
        <div style={{ marginBottom: "12px" }}>
          <ContadorPrimerIntento texto={datos.distintivo}>
            <Pulsos total={cuantos} hechos={t.i + (cerrado ? 1 : 0)} enCurso={t.i + 1} etiqueta={etiqueta} />
          </ContadorPrimerIntento>
        </div>
        {Figura && !figuraDebajo && <div style={{ marginBottom: "12px" }}><Figura items={t.items} i={t.i} resueltos={resueltos} /></div>}
        {Antes && <Antes i={t.i} />}
        <TarjetaPregunta id={item.id} pregunta={item.pregunta ?? item.texto} pie={item.pie ?? datos.pie ?? null} tarjetaRef={tarjeta} />
        <div role="group" aria-label={item.pregunta ?? item.texto} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "8px" }}>
          {item.opciones.map((o) => {
            const estado = estadoDe(o.valor);
            return (
              <span key={o.valor} data-opcion={o.valor} style={{ display: "contents" }}>
                <OpcionEscalera texto={o.texto} glosa={glosas?.[o.valor] ?? null} estado={estado}
                  deshabilitada={cerrado || estado === "incorrecta"} onClick={() => elegir(o.valor)} />
              </span>
            );
          })}
        </div>
        <Mensaje r={r} panelRef={panel} />
      </div>
      {cerrado && (
        <div data-zona-boton>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? botones.verResumen : botones.siguiente}</Responder>
        </div>
      )}
      {Figura && figuraDebajo && <div style={{ marginTop: "16px" }}><Figura items={t.items} i={t.i} resueltos={resueltos} /></div>}
    </Marco>
  );
}
