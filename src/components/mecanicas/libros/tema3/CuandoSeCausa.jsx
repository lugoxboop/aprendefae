import { useEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import {
  ACT2_T3, ITEMS_ACT2, pieDe, LEYENDA_ORDEN, ESTADO_VACIO, SE_CAUSA_AQUI, SIGUIENTE_ITEM, VER_RESUMEN, ALT_ACT2,
  SEGUNDA_ACT2, MARCA_ACT2, SE_CAUSA_DIA,
} from "../../../../data/contabilidadTema3Act2.js";
import {
  evaluarAct2, puntuarAct2, esArrastre, tieneSegunda, evaluarSegundaAct2,
} from "../../../../contabilidad/cuandoSeCausa.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { useSegunda, OpcionSegunda, MensajeSegunda, mostrarTramo, pastillasTocadas } from "./segundaDecision.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 2 · ¿CUÁNDO SE CAUSA? (Xeno, parte B v2; correcciones de Levi)
 *
 * Una línea vertical de marcas, de antes (arriba) a después (abajo). Cada
 * marca es una fila de ≥ 56 px con su nodo sobre un riel; entre filas, 8 px
 * que no responden. Todos los nodos son iguales: lo que distingue un día, un
 * rango o una marca sin día es el rótulo.
 *
 * El toque es la única interacción y el primero califica. Cuenta al levantar
 * el dedo dentro de la fila; si se arrastró más de 10 px, era scroll y no
 * cuenta. Tras responder, las filas se desactivan hasta el siguiente ítem.
 *
 * Coral solo en la marca equivocada. Ni verde azulado ni ámbar.
 *
 * ═══════════ LA SEGUNDA DECISIÓN (Hanayama; textos de Katsumi) ═══════════
 *
 * En los ítems que llevan `queda` (los seis del banco; no el ejemplo de la
 * panadería), al acertar el día: el día queda en una línea sobre la pregunta
 * y las marcas ceden su lugar a tres filas de ≥ 56 px, a todo el ancho. Un
 * toque califica. La devolución del ítem y «Siguiente ítem» esperan a que se
 * resuelva. El ítem cuenta solo si las dos decisiones son correctas (Yujiro);
 * el detalle guarda las dos. Al fallar el día no hay segunda decisión.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const CORAL = FAE.coral;

/* La forma de una fila de la línea, para que la segunda decisión la copie. */
const FORMA_FILA = {
  relleno: [14, 14], radio: "14px", altoMinimo: "56px",
  letra: { fontFamily: INTER, fontSize: "15px", fontWeight: 600, lineHeight: 1.35 },
};

const CSS = `
.fae-a2-fila { -webkit-tap-highlight-color: transparent; }
.fae-a2-fila:not([aria-disabled="true"]):active { background: rgba(184,196,212,0.18) !important; }
.fae-a2-fila:focus-visible, .fae-a2-hecho:focus-visible { outline: 2px solid ${COLOR.neutro}; outline-offset: 2px; }
@keyframes fae-a2-fundido { from { opacity: 0; } to { opacity: 1; } }
@keyframes fae-a2-relleno { from { background-color: rgba(184,196,212,0); } }
@media (prefers-reduced-motion: reduce) { .fae-a2 * { animation: none !important; transition: none !important; } }
`;

function Visto({ color }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" style={{ flex: "none" }}>
      <path d="M4 9.5 L7.5 13 L14 5.5" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Equis() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" style={{ flex: "none" }}>
      <path d="M5 5 L13 13 M13 5 L5 13" fill="none" stroke={CORAL} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/* Una marca. El nombre accesible es el rótulo; tras responder dice si era la correcta. */
function Fila({ marca, estado, onTocar }) {
  const inicio = useRef(null);
  const arrastre = useRef(false);
  const contestado = estado !== "reposo";
  const esCorrecta = estado === "correcta";
  const esEquivocada = estado === "equivocada";
  const fondo = esCorrecta ? COLOR.neutro : esEquivocada ? "rgba(231,111,81,0.14)" : "transparent";
  const borde = esCorrecta ? COLOR.neutro : esEquivocada ? CORAL : COLOR.quieto;
  const texto = esCorrecta ? COLOR.navy : estado === "atenuada" ? COLOR.apagado : COLOR.blanco;
  const nombre = esCorrecta ? `${marca.rotulo}, correcta` : esEquivocada ? `${marca.rotulo}, equivocada` : marca.rotulo;

  return (
    <button
      type="button"
      className="fae-a2-fila"
      data-marca={marca.id}
      data-estado={estado}
      aria-label={nombre}
      aria-disabled={contestado ? "true" : undefined}
      onPointerDown={(e) => { inicio.current = { x: e.clientX, y: e.clientY }; arrastre.current = false; }}
      onPointerMove={(e) => {
        if (inicio.current && esArrastre(e.clientX - inicio.current.x, e.clientY - inicio.current.y)) arrastre.current = true;
      }}
      onPointerCancel={() => { arrastre.current = true; }}
      onClick={() => {
        const fue = arrastre.current;
        inicio.current = null; arrastre.current = false;
        if (fue || contestado) return;
        onTocar(marca.id);
      }}
      style={{
        position: "relative", display: "flex", alignItems: "center", gap: "10px", width: "100%", minHeight: "56px",
        boxSizing: "border-box", padding: "14px", borderRadius: "14px", textAlign: "left",
        cursor: contestado ? "default" : "pointer", touchAction: "manipulation",
        background: fondo, border: `2px solid ${borde}`, color: texto,
        fontFamily: INTER, fontSize: "15px", fontWeight: 600, lineHeight: 1.35,
        animation: esCorrecta ? "fae-a2-relleno 200ms ease-out both" : undefined,
        transition: "color 200ms ease, border-color 200ms ease",
      }}
    >
      {/* El nodo, sobre el riel: un círculo de 16 px con anillo de 2,5 px. */}
      <span aria-hidden="true" data-nodo-marca style={{
        position: "absolute", left: "-31px", top: "50%", transform: "translateY(-50%)",
        width: "16px", height: "16px", boxSizing: "border-box", borderRadius: "50%",
        border: `2.5px solid ${esEquivocada ? CORAL : COLOR.neutro}`,
        background: esCorrecta ? COLOR.neutro : esEquivocada ? CORAL : FAE.bg,
      }} />
      <span style={{ flex: "1 1 auto", minWidth: 0 }}>
        <span data-rotulo-marca style={{ display: "block" }}>{marca.rotulo}</span>
        {esCorrecta && (
          <span data-se-causa style={{ display: "block", marginTop: "2px", fontSize: "12.5px", fontWeight: 700, color: COLOR.navy }}>
            {SE_CAUSA_AQUI}
          </span>
        )}
      </span>
      {esCorrecta && <Visto color={COLOR.navy} />}
      {esEquivocada && <Equis />}
    </button>
  );
}

export default function CuandoSeCausa({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const t = useTanda(() => items ?? ITEMS_ACT2);
  const [r, setR] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const tarjeta = useRef(null);
  const zonaBoton = useRef(null);
  const primeraVez = useRef(true);
  const pregunta = useRef(null);
  const mensaje = useRef(null);
  const zonaSegunda = useRef(null);
  const segunda = useSegunda();
  const toque = useRef({ inicio: null, arrastre: false });

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const pct = puntuarAct2(respuestas, cuantos);
  const enSegunda = Boolean(r?.ok && tieneSegunda(item));
  const resuelto = Boolean(r && (!enSegunda || segunda.lista));

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  /* Al cambiar de ítem, el foco pasa al encabezado de la tarjeta del hecho. */
  useEffect(() => {
    if (primeraVez.current) { primeraVez.current = false; return; }
    if (!modoDemo) tarjeta.current?.focus({ preventScroll: false });
  }, [t.i]);
  useEffect(() => {
    if (enSegunda && !modoDemo) pregunta.current?.focus();
  }, [enSegunda]);
  /* El tramo de la pastilla al mensaje o al botón (lote A): al tocar mal, sin foco; al resolverse, con foco. */
  useEffect(() => {
    if (segunda.s && !segunda.lista && !modoDemo) mostrarTramo({ mensaje: mensaje.current, pastillas: pastillasTocadas(zonaSegunda.current) });
  }, [segunda.s]);
  useEffect(() => {
    if (enSegunda && resuelto && !modoDemo) {
      mostrarTramo({ mensaje: mensaje.current, pastillas: pastillasTocadas(zonaSegunda.current), boton: zonaBoton.current?.querySelector("button"), enfocar: true });
    }
  }, [resuelto]);

  const tocar = (marcaId) => {
    if (r) return;
    const nuevo = evaluarAct2(item, marcaId);
    t.anotar(item.id, nuevo.ok, nuevo.ok ? null : marcaId);
    if (tieneSegunda(item)) t.detalle.current[t.detalle.current.length - 1].respuestas = { dia: marcaId };
    /* Con segunda decisión, la respuesta del ítem espera a que se resuelva. */
    if (!(nuevo.ok && tieneSegunda(item))) setRespuestas((xs) => [...xs, { id: item.id, ok: nuevo.ok }]);
    setR({ ...nuevo, tocada: marcaId });
  };
  const elegirSegunda = (id) => {
    const ev = evaluarSegundaAct2(item, id);
    if (!segunda.elegir(id, ev.ok, ev.correcta, ev.error)) return;
    const d = t.detalle.current.find((x) => x.item === item.id);
    if (d) {
      d.respuestas = { ...d.respuestas, segunda: id };
      if (!ev.ok) { d.ok = false; d.respuesta = id; }
    }
    setRespuestas((xs) => [...xs, { id: item.id, ok: ev.ok }]);
  };
  /* Como en la línea: si el dedo se arrastró más de 10 px, era scroll y no cuenta. */
  const eventosToque = {
    onPointerDown: (e) => { toque.current = { inicio: { x: e.clientX, y: e.clientY }, arrastre: false }; },
    onPointerMove: (e) => {
      const i = toque.current.inicio;
      if (i && esArrastre(e.clientX - i.x, e.clientY - i.y)) toque.current.arrastre = true;
    },
    onPointerCancel: () => { toque.current.arrastre = true; },
  };
  const antesDeTocar = () => {
    const fue = toque.current.arrastre;
    toque.current = { inicio: null, arrastre: false };
    return !fue;
  };
  const avanzar = () => {
    setR(null); segunda.reiniciar();
    if (t.i + 1 < cuantos) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => { t.reiniciar(); setR(null); setRespuestas([]); segunda.reiniciar(); };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.ok).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantos} al primer toque. Cada ítem valía {(100 / cuantos).toFixed(2)} %.
          </p>
        </Cierre>
      </Marco>
    );
  }

  const estadoDe = (m) => {
    if (!r) return "reposo";
    if (m.id === r.correcta) return "correcta";
    if (m.id === r.tocada) return "equivocada";
    return "atenuada";
  };
  const pie = item.fuente ? pieDe(item) : null;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <div className="fae-a2" data-act2>
        {!modoDemo && (
          <>
            <Encabezado consigna={ACT2_T3.consigna} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Ítem" />
            </div>
          </>
        )}

        {/* La tarjeta del hecho: empresa, hecho de Gen y pie. */}
        <div key={item.id} data-tarjeta-hecho={item.id} style={{
          margin: "0 0 12px", padding: "11px 13px", borderRadius: "11px",
          background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${COLOR.neutro}`,
          animation: modoDemo ? undefined : "fae-a2-fundido 150ms ease-out both",
        }}>
          <p ref={tarjeta} tabIndex={-1} className="fae-a2-hecho" data-empresa style={{
            margin: "0 0 4px", fontFamily: INTER, fontSize: "13px", color: COLOR.apagado,
            display: "flex", flexWrap: "wrap", columnGap: "5px",
          }}>
            <span>Empresa:</span><strong style={{ color: COLOR.blanco, fontWeight: 700 }}>{item.empresa}</strong>
          </p>
          <p data-hecho style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{item.hecho}</p>
          {pie && <p data-pie style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>{pie}</p>}
        </div>

        {/* La segunda decisión, en el lugar de la línea y con la forma de sus filas. */}
        {enSegunda && (
          <div data-segunda ref={zonaSegunda}>
            <p data-se-causa-dia style={{ margin: "0 0 6px", fontFamily: INTER, fontSize: "13.5px", fontWeight: 700, color: COLOR.blanco }}>
              {SE_CAUSA_DIA(item.marcas.find((m) => m.id === r.correcta).rotulo)}
            </p>
            <p ref={pregunta} tabIndex={-1} data-pregunta-segunda style={{
              margin: "0 0 10px", fontFamily: INTER, fontSize: "15px", fontWeight: 700, lineHeight: "22px", color: COLOR.blanco, outline: "none",
            }}>
              {SEGUNDA_ACT2.pregunta}
            </p>
            <div role="group" aria-label={SEGUNDA_ACT2.pregunta} style={{ display: "flex", flexDirection: "column", rowGap: "8px" }}>
              {SEGUNDA_ACT2.opciones.map((o) => (
                <OpcionSegunda key={`${item.id}-${o.id}`} opcion={o} estado={segunda.estadoDe(o.id)} palabras={MARCA_ACT2}
                  onTocar={elegirSegunda} forma={FORMA_FILA} eventos={eventosToque} antesDeTocar={antesDeTocar} />
              ))}
            </div>
            <MensajeSegunda s={segunda.s} lista={segunda.lista} devolucion={item.acierto} refMensaje={mensaje}
              letra={{ fontFamily: INTER, fontSize: "15px", lineHeight: "22px" }} />
          </div>
        )}

        {/* La leyenda de orden: la separación entre filas no es proporcional a los días. */}
        {!enSegunda && <p data-leyenda style={{ margin: "0 0 10px", display: "flex", alignItems: "flex-start", gap: "6px", fontFamily: INTER, fontSize: "12.5px", lineHeight: 1.4, color: COLOR.apagado }}>
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" style={{ flex: "none", marginTop: "2px" }}>
            <path d="M7 2 V12 M3 8 L7 12 L11 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {LEYENDA_ORDEN}
        </p>}

        {/* Las filas, sobre su riel. Entre fila y fila, 8 px que no responden. */}
        {!enSegunda && <div data-filas style={{ position: "relative", paddingLeft: "40px" }}>
          <span aria-hidden="true" data-riel style={{
            position: "absolute", left: "15px", top: "28px", bottom: "28px", width: "2px", background: COLOR.quieto,
          }} />
          <div role="group" aria-label={LEYENDA_ORDEN} style={{ display: "flex", flexDirection: "column", rowGap: "8px" }}>
            {item.marcas.map((m) => (
              <Fila key={`${item.id}-${m.id}`} marca={m} estado={estadoDe(m)} onTocar={tocar} />
            ))}
          </div>
        </div>}

        {!r && (
          <p data-estado-vacio style={{ margin: "10px 0 0", fontFamily: INTER, fontSize: "13.5px", color: COLOR.apagado }}>{ESTADO_VACIO}</p>
        )}

        {/* La retroalimentación: región viva. En un error, primero el tipo y después el acierto. */}
        <div data-retro aria-live="polite" aria-atomic="true">
          {/* Con segunda decisión, la devolución va en su mensaje, no aquí. */}
          {r && !enSegunda && (
            <div data-panel={r.ok ? "acierto" : "error"} style={{
              marginTop: "12px", padding: "11px 13px", borderRadius: "11px",
              background: r.ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
              borderLeft: `3px solid ${r.ok ? COLOR.neutro : CORAL}`,
              animation: "fae-a2-fundido 150ms ease-out both",
            }}>
              <span style={SOLO_LECTOR}>{r.ok ? "Correcto: " : "Incorrecto: "}</span>
              {r.textos.map((x) => (
                <p key={x} data-texto-retro style={{ margin: "0 0 4px", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{x}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {resuelto && !modoDemo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? VER_RESUMEN : SIGUIENTE_ITEM}</Responder>
        </div>
      )}

      {!modoDemo && <p style={SOLO_LECTOR}>{ALT_ACT2}</p>}
    </Marco>
  );
}
