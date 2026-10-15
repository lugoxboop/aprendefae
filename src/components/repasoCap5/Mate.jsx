import { useEffect, useId, useRef, useState } from "react";
import { CSS_JUEGO, Cierre } from "../mecanicas/corazon/juego.jsx";
import { C, INTER, SORA, MARCA, SOLO_LECTOR, Devolucion, BotonSiguiente } from "./comun.jsx";
import { cifra, leerCifra } from "./ToroNegro.jsx";
import {
  ASIENTOS_MATE, HOJA_MATE, ENTRADA_MATE, DATOS_DEL_LIBRO, DATOS_DECLARADOS, ROTULOS_MATE as RM,
} from "../../data/repasoCap5MateTextos.js";
import { evaluarMate, puedeRevisarMate, sumasDe, puntuarR5_3, MAXIMO_POR_LADO } from "../../data/repasoCap5MateJuego.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-3 «MARZO EN COMERCIALIZADORA MATE» (Célula E) — la mecánica, con el
 * diseño de Itagaki (base y delta v2) del paquete e5-r5-3-v3 y las decisiones
 * de Kamogawa, que mandan.
 *
 *   entrada → 8 asientos (uno por pantalla) → final «MARZO EN OCHO ASIENTOS» + Cierre
 *
 * Sin libro ni medidor. El armador compuesto empieza vacío: el lado lo decide
 * el grupo donde se toca «+ Añadir», hasta 3 renglones por lado; cada
 * renglón se arma en una hoja de dos pasos (cuenta, valor). La hoja «Datos
 * de marzo» está en las ocho pantallas y es de solo lectura.
 *
 * De corazon/juego.jsx solo el Cierre y su CSS, sin tocarlos; lo común de la
 * célula (devolución, «Siguiente») de comun.jsx; nada de otras células.
 * Ningún bloque tiene alto fijo: el contenido manda.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const LECTOR = { acierto: "Correcto: ", error: "Incorrecto: " };
const DIVISORIA = "1px solid rgba(184,196,212,0.25)";
const ESTADO = {
  ok: { border: `2px solid ${C.teal}`, background: "rgba(42,157,143,0.14)" },
  mal: { border: `2px solid ${C.coral}`, background: "rgba(231,111,81,0.13)" },
  revelada: { border: `1px solid ${C.teal}88`, background: C.fondo },
};
const CSS_MATE = `
.mate-campo:focus { outline: none; border: 2px solid ${C.ambar} !important; }
`;

/* ═══════════ LA LÍNEA DE MARZO (§1) ═══════════ */

/*
 * El día d va en x = 6 + (d − 1) / 30 × (ancho − 12). Dos operaciones el mismo
 * día: la segunda 14 px más abajo, unida por una línea de 2 px.
 */
const xDelDia = (d) => `calc(6px + ${(d - 1) / 30} * (100% - 12px))`;

export function LineaDeMarzo({ actual = null, hechos = 0 }) {
  const vistos = {};
  const nodos = ASIENTOS_MATE.map((a, k) => {
    const abajo = Boolean(vistos[a.dia]);
    vistos[a.dia] = true;
    return { a, k, abajo, estado: k < hechos ? "hecho" : k === actual ? "actual" : "pendiente" };
  });
  const marcaActual = actual === null ? null : ASIENTOS_MATE[actual];
  return (
    <div data-linea-marzo style={{ position: "relative", height: "44px" }}>
      {marcaActual && (
        <span
          data-marca-fecha
          style={{
            ...MARCA, position: "absolute", top: 0, whiteSpace: "nowrap",
            ...(marcaActual.dia === 1 ? { left: 0 } : marcaActual.dia === 31 ? { right: 0 } : { left: xDelDia(marcaActual.dia), transform: "translateX(-50%)" }),
          }}
        >
          {`${marcaActual.dia} MAR`}
        </span>
      )}
      <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: "21px", height: "2px", background: C.navy }} />
      {nodos.filter((n) => n.abajo).map((n) => (
        <span key={`v-${n.k}`} aria-hidden="true" style={{ position: "absolute", left: `calc(${xDelDia(n.a.dia)} - 1px)`, top: "22px", width: "2px", height: "14px", background: C.navy }} />
      ))}
      {nodos.map((n) => (
        <span
          key={n.k}
          data-nodo={n.a.id}
          data-estado={n.estado}
          aria-hidden="true"
          style={{
            position: "absolute", left: `calc(${xDelDia(n.a.dia)} - 5px)`, top: n.abajo ? "31px" : "17px",
            width: "10px", height: "10px", borderRadius: "50%", boxSizing: "border-box",
            background: n.estado === "hecho" ? C.hecho : n.estado === "actual" ? C.ambar : C.fondo,
            border: n.estado === "pendiente" ? `1.5px solid ${C.atenuado}` : "none",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════ LAS TARJETAS DE DATOS (entrada y hoja «Datos de marzo») ═══════════ */

function TarjetasDeDatos() {
  return (
    <>
      <div data-datos-libro style={{ background: C.navy, borderRadius: "12px", padding: "16px" }}>
        {DATOS_DEL_LIBRO.map((g, k) => (
          <div key={g.marca} style={{ marginTop: k ? "12px" : 0 }}>
            <p style={{ ...MARCA, margin: "0 0 4px" }}>{g.marca}</p>
            {(g.renglones ?? []).map(([et, val]) => (
              <div key={et} data-dato-libro style={{ minHeight: "40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <span style={{ fontFamily: INTER, fontSize: "14px", color: C.atenuado }}>{et}</span>
                <span style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto, textAlign: "right" }}>{val}</span>
              </div>
            ))}
            {g.nota && <p style={{ margin: "8px 0 0", fontFamily: INTER, fontSize: "14px", lineHeight: "20px", color: C.texto }}>{g.nota}</p>}
            {(g.frases ?? []).map((f, j) => <p key={f} style={{ margin: j ? "8px 0 0" : 0, fontFamily: INTER, fontSize: "14px", lineHeight: "20px", color: C.texto }}>{f}</p>)}
          </div>
        ))}
      </div>
      {/* El trazo discontinuo marca lo que no viene del libro (decisión 2). */}
      <div data-datos-declarados style={{ marginTop: "16px", borderRadius: "12px", padding: "16px", border: `1.5px dashed ${C.atenuado}`, background: C.navy }}>
        <p style={{ ...MARCA, margin: 0 }}>{DATOS_DECLARADOS.marca}</p>
        <p style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: C.atenuado }}>{DATOS_DECLARADOS.linea}</p>
        {DATOS_DECLARADOS.datos.map((x, k) => (
          <p key={x} data-dato-declarado style={{ margin: k ? "8px 0 0" : "8px 0 0", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: C.texto }}>{x}</p>
        ))}
      </div>
    </>
  );
}

/* Una hoja inferior genérica: velo, tope de alto y scroll interno. */
function Hoja({ etiqueta, tope = "85vh", onCerrar, children, datos = {} }) {
  useEffect(() => {
    const tecla = (e) => { if (e.key === "Escape") onCerrar(); };
    globalThis.addEventListener?.("keydown", tecla);
    return () => globalThis.removeEventListener?.("keydown", tecla);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div data-velo onClick={onCerrar} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(14,27,46,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={etiqueta}
        {...datos}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "860px", maxHeight: tope, overflowY: "auto", background: C.navy, borderRadius: "16px 16px 0 0", boxSizing: "border-box", position: "relative" }}
      >
        {children}
      </div>
    </div>
  );
}

const botonTexto = (color = C.texto) => ({
  minHeight: "44px", minWidth: "44px", padding: "0 8px", background: "transparent", border: "none", cursor: "pointer",
  fontFamily: INTER, fontSize: "15px", fontWeight: 600, color,
});

function HojaDatosDeMarzo({ onCerrar }) {
  const cerrar = useRef(null);
  useEffect(() => { cerrar.current?.focus(); }, []);
  return (
    <Hoja etiqueta={RM.datosDeMarzoMarca} onCerrar={onCerrar} datos={{ "data-hoja-datos": true }}>
      <div style={{ position: "sticky", top: 0, background: C.navy, minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 0 16px", zIndex: 1 }}>
        <span style={MARCA}>{RM.datosDeMarzoMarca}</span>
        <button ref={cerrar} type="button" data-cerrar onClick={onCerrar} style={botonTexto()}>{RM.cerrar}</button>
      </div>
      <div style={{ padding: "0 16px 16px" }}><TarjetasDeDatos /></div>
    </Hoja>
  );
}

/* ═══════════ LA PANTALLA DE ENTRADA (delta v2 §1) ═══════════ */

function Entrada({ onEmpezar }) {
  return (
    <div data-r5-3 data-paso="entrada">
      <p style={{ ...MARCA, margin: 0 }}>{ENTRADA_MATE.marca}</p>
      <h3 style={{ margin: "8px 0 0", fontFamily: SORA, fontSize: "24px", lineHeight: "32px", fontWeight: 600, color: C.texto }}>{ENTRADA_MATE.titulo}</h3>
      <p data-apertura style={{ margin: "8px 0 0", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: C.texto }}>{ENTRADA_MATE.apertura}</p>
      <p data-instruccion style={{ margin: "8px 0 0", fontFamily: INTER, fontSize: "14px", lineHeight: "20px", color: C.atenuado }}>{ENTRADA_MATE.instruccion}</p>
      <div style={{ marginTop: "16px" }}><LineaDeMarzo /></div>
      <div style={{ marginTop: "16px" }}><TarjetasDeDatos /></div>
      <button
        type="button"
        data-empezar
        onClick={onEmpezar}
        style={{ marginTop: "24px", width: "100%", minHeight: "52px", borderRadius: "12px", border: "none", background: C.ambar, color: C.fondo, fontFamily: SORA, fontSize: "16px", fontWeight: 600, cursor: "pointer" }}
      >
        {ENTRADA_MATE.empezar}
      </button>
    </div>
  );
}

/* ═══════════ EL HECHO (§3 y delta v2 §2) ═══════════ */

const renglonDeDato = { minHeight: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" };

function Hecho({ a }) {
  return (
    <div data-hecho style={{ background: C.navy, borderRadius: "12px", borderLeft: `3px solid ${C.hecho}`, padding: "12px" }}>
      <p style={{ ...MARCA, margin: 0 }}>{a.fecha}</p>
      <p data-frase style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: C.texto }}>{a.hecho}</p>
      <div style={{ marginTop: "8px" }}>
        {a.renglones.map(([et, val]) => (
          <div key={et} data-renglon-hecho style={renglonDeDato}>
            <span style={{ fontFamily: INTER, fontSize: "14px", color: C.atenuado }}>{et}</span>
            <span style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto, textAlign: "right" }}>{val}</span>
          </div>
        ))}
        {/* Asientos 3 y 7: el flete va en el asiento siguiente, como nota y no como cifra. */}
        {a.fleteEnElSiguiente && (
          <div data-renglon-hecho="flete" style={renglonDeDato}>
            <span style={{ fontFamily: INTER, fontSize: "14px", color: C.atenuado }}>Flete</span>
            <span style={{ fontFamily: INTER, fontSize: "14px", color: C.atenuado, textAlign: "right" }}>{RM.fleteEnElSiguiente}</span>
          </div>
        )}
        {/* Asiento 5: el dato de otra operación, al final y separado (decisión 3). */}
        {a.deOtraOperacion && (
          <div data-otra-operacion style={{ borderTop: DIVISORIA, marginTop: "8px", paddingTop: "8px" }}>
            <div style={renglonDeDato}>
              <span style={{ fontFamily: INTER, fontSize: "14px", color: C.atenuado }}>{a.deOtraOperacion[0]}</span>
              <span style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto, textAlign: "right" }}>{a.deOtraOperacion[1]}</span>
            </div>
            <span style={{ ...MARCA, display: "block" }}>{RM.deOtraOperacion}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BotonDatos({ onAbrir }) {
  return (
    <button
      type="button"
      data-boton-datos
      aria-haspopup="dialog"
      onClick={onAbrir}
      style={{ width: "100%", minHeight: "60px", borderRadius: "12px", border: "none", background: C.navy, textAlign: "left", padding: "10px 16px", cursor: "pointer" }}
    >
      <span style={{ display: "block", fontFamily: INTER, fontSize: "15px", fontWeight: 600, color: C.texto }}>{RM.datosDeMarzo}</span>
      <span style={{ display: "block", fontFamily: INTER, fontSize: "13px", color: C.atenuado }}>{RM.tasasALaVista}</span>
    </button>
  );
}

/* ═══════════ EL ARMADOR COMPUESTO (§4) ═══════════ */

function Renglon({ r, estado = null, onTocar, soloLectura = false }) {
  const visto = estado ? ESTADO[estado] : { border: `1px solid ${C.atenuado}`, background: C.fondo };
  const contenido = (
    <>
      <span style={SOLO_LECTOR}>{r.lado === "debe" ? RM.debe : RM.haber}: </span>
      <span style={{ display: "block", fontFamily: INTER, fontSize: "14px", lineHeight: "20px", fontWeight: 600, color: C.texto }}>{r.cuenta}</span>
      <span style={{ display: "block", marginTop: "4px", textAlign: "right", fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto }}>{cifra(r.valor)}</span>
    </>
  );
  const estilo = { display: "block", width: "100%", boxSizing: "border-box", textAlign: "left", borderRadius: "10px", padding: "10px", ...visto };
  if (soloLectura || estado) return <div data-renglon={r.lado} data-estado={estado ?? "revelada"} style={estilo}>{contenido}</div>;
  return <button type="button" data-renglon={r.lado} data-estado="libre" onClick={onTocar} style={{ ...estilo, cursor: "pointer" }}>{contenido}</button>;
}

function Grupo({ lado, renglones, estados, onAnadir, onEditar, bloqueado, soloLectura }) {
  const mios = renglones.filter((r) => r.lado === lado);
  return (
    <div data-grupo={lado} style={{ paddingLeft: lado === "haber" ? "16px" : 0, marginTop: lado === "haber" ? "16px" : 0 }}>
      <p style={{ ...MARCA, margin: "0 0 6px" }}>{lado === "debe" ? RM.debe : RM.haber}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {mios.map((r) => (
          <Renglon key={r.id} r={r} estado={estados?.[r.id] ?? null} soloLectura={soloLectura} onTocar={() => onEditar(r)} />
        ))}
      </div>
      {!bloqueado && !soloLectura && mios.length < MAXIMO_POR_LADO && (
        <button
          type="button"
          data-anadir={lado}
          onClick={() => onAnadir(lado)}
          style={{
            marginTop: mios.length ? "8px" : 0, width: "100%", minHeight: "44px", borderRadius: "10px", cursor: "pointer",
            border: `1.5px dashed ${C.atenuado}`, background: "transparent", color: C.texto, fontFamily: INTER, fontSize: "14px", fontWeight: 600,
          }}
        >
          {mios.length ? RM.otro[lado] : RM.anadir[lado]}
        </button>
      )}
    </div>
  );
}

function Sumas({ renglones }) {
  const s = sumasDe(renglones);
  return (
    <>
      <div aria-hidden="true" style={{ height: "1px", background: "rgba(184,196,212,0.25)", margin: "16px 0" }} />
      <div data-sumas style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", minHeight: "44px" }}>
        {[["debe", RM.sumaDebe, s.debe], ["haber", RM.sumaHaber, s.haber]].map(([l, m, val]) => (
          <div key={l} data-suma={l}>
            <span style={{ ...MARCA, display: "block" }}>{m}</span>
            <span style={{ display: "block", fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto }}>{cifra(val)}</span>
          </div>
        ))}
      </div>
      {/* Sin color: aquí todavía nada es error. No cuadrar no bloquea «Revisar». */}
      <p data-cuadre style={{ margin: "4px 0 0", minHeight: "20px", fontFamily: INTER, fontSize: "13px", color: C.atenuado }}>
        {s.cuadran ? RM.cuadran : RM.diferencia(cifra(s.diferencia))}
      </p>
    </>
  );
}

function Armador({ renglones, estados = null, onAnadir, onEditar, bloqueado = false, soloLectura = false, marca = RM.tuAsiento, datos = {} }) {
  return (
    <div {...datos} style={{ background: C.navy, borderRadius: "12px", padding: "16px", ...(soloLectura ? { border: ESTADO.revelada.border } : {}) }}>
      <p style={{ ...MARCA, margin: "0 0 8px", ...(soloLectura ? { color: C.teal } : {}) }}>{marca}</p>
      <Grupo lado="debe" renglones={renglones} estados={estados} onAnadir={onAnadir} onEditar={onEditar} bloqueado={bloqueado} soloLectura={soloLectura} />
      <Grupo lado="haber" renglones={renglones} estados={estados} onAnadir={onAnadir} onEditar={onEditar} bloqueado={bloqueado} soloLectura={soloLectura} />
      <Sumas renglones={renglones} />
    </div>
  );
}

/* La hoja en dos pasos: la cuenta y el valor. `inicial` trae el renglón que se edita. */
function HojaRenglon({ lado, inicial = null, renglones, onListo, onQuitar, onCancelar }) {
  const [paso, setPaso] = useState(inicial ? 2 : 1);
  const [cuenta, setCuenta] = useState(inicial?.cuenta ?? null);
  const [valor, setValor] = useState(inicial?.valor ?? null);
  const campo = useRef(null);
  const primera = useRef(null);
  const idCampo = useId();
  useEffect(() => {
    if (paso === 2) campo.current?.focus();
    else primera.current?.focus();
  }, [paso]);
  const dondeEsta = (c) => {
    const r = renglones.find((x) => x.cuenta === c && x.id !== inicial?.id);
    return r ? r.lado : null;
  };
  const cabecera = { position: "sticky", top: 0, zIndex: 1, background: C.navy, minHeight: "48px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "0 8px" };
  return (
    <Hoja etiqueta={paso === 1 ? RM.cuentaDel[lado] : RM.renglonDel[lado]} onCerrar={onCancelar} datos={{ "data-hoja-renglon": lado, "data-paso": paso }}>
      {paso === 1 ? (
        <>
          <div style={cabecera}>
            <button type="button" data-cancelar onClick={onCancelar} style={{ ...botonTexto(), justifySelf: "start" }}>{RM.cancelar}</button>
            <span style={MARCA}>{RM.cuentaDel[lado]}</span>
            <span />
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: "0 0 24px" }}>
            {HOJA_MATE.map((c, k) => {
              const en = dondeEsta(c);
              return (
                <li key={c} style={{ borderTop: DIVISORIA }}>
                  <button
                    ref={k === 0 ? primera : undefined}
                    type="button"
                    data-cuenta={c}
                    onClick={() => { setCuenta(c); setPaso(2); }}
                    style={{
                      width: "100%", minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
                      padding: "8px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                      fontFamily: INTER, fontSize: "15px", color: en ? C.atenuado : C.texto,
                    }}
                  >
                    <span>{c}</span>
                    {en && <span data-en-el={en} style={{ ...MARCA, flexShrink: 0 }}>{RM.enEl[en]}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {/* Un degradado avisa que la lista sigue más abajo. */}
          <div aria-hidden="true" style={{ position: "sticky", bottom: 0, height: "24px", marginTop: "-24px", background: `linear-gradient(transparent, ${C.navy})`, pointerEvents: "none" }} />
        </>
      ) : (
        <>
          <div style={cabecera}>
            <button type="button" data-cancelar onClick={onCancelar} style={{ ...botonTexto(), justifySelf: "start" }}>{RM.cancelar}</button>
            <span style={MARCA}>{RM.renglonDel[lado]}</span>
            <button
              type="button"
              data-listo
              disabled={!(Number(valor) > 0)}
              onClick={() => onListo({ lado, cuenta, valor })}
              style={{ ...botonTexto(Number(valor) > 0 ? C.ambar : C.atenuado), justifySelf: "end", cursor: Number(valor) > 0 ? "pointer" : "default" }}
            >
              {RM.listo}
            </button>
          </div>
          <div style={{ padding: "12px 16px 16px" }}>
            <p data-cuenta-elegida style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "20px", fontWeight: 600, color: C.texto }}>{cuenta}</p>
            <div style={{ marginTop: "4px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button type="button" data-cambiar-cuenta onClick={() => setPaso(1)} style={{ ...botonTexto(), paddingLeft: 0 }}>{RM.cambiarCuenta}</button>
              {inicial && <button type="button" data-quitar onClick={() => onQuitar(inicial)} style={{ ...botonTexto(), paddingRight: 0 }}>{RM.quitar}</button>}
            </div>
            <label htmlFor={idCampo} style={{ ...MARCA, display: "block", margin: "12px 0 4px" }}>{RM.valor}</label>
            <input
              id={idCampo}
              ref={campo}
              data-campo-valor
              className="mate-campo"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              enterKeyHint="done"
              value={valor === null ? "" : cifra(valor)}
              onChange={(e) => setValor(leerCifra(e.target.value))}
              onKeyDown={(e) => { if (e.key === "Enter" && Number(valor) > 0) { e.preventDefault(); onListo({ lado, cuenta, valor }); } }}
              style={{
                width: "100%", height: "48px", boxSizing: "border-box", borderRadius: "10px", padding: "0 12px", background: C.fondo,
                border: `1.5px solid ${C.atenuado}`, fontFamily: INTER, fontSize: "17px", fontWeight: 600, fontVariantNumeric: "tabular-nums", textAlign: "right", color: C.texto,
              }}
            />
          </div>
        </>
      )}
    </Hoja>
  );
}

/* ═══════════ UNA PANTALLA DE ASIENTO ═══════════ */

let siguienteId = 0;

function PantallaAsiento({ a, i, total, r, onRespondida, onSiguiente, botonRef }) {
  const [renglones, setRenglones] = useState([]);
  const [hoja, setHoja] = useState(null); // { lado, inicial }
  const [datos, setDatos] = useState(false);

  const listo = ({ lado, cuenta, valor }) => {
    setRenglones((xs) => (hoja.inicial
      ? xs.map((x) => (x.id === hoja.inicial.id ? { ...x, cuenta, valor } : x))
      : [...xs, { id: `m${siguienteId++}`, lado, cuenta, valor }]));
    setHoja(null);
  };
  const quitar = (rq) => { setRenglones((xs) => xs.filter((x) => x.id !== rq.id)); setHoja(null); };

  return (
    <div data-r5-3 data-paso={a.id}>
      <p data-progreso style={{ ...MARCA, margin: 0 }}>{RM.progreso(i + 1, total)}</p>
      <div style={{ marginTop: "8px" }}><LineaDeMarzo actual={i} hechos={i} /></div>
      <div style={{ marginTop: "16px" }}><Hecho a={a} /></div>
      <div style={{ marginTop: "12px" }}><BotonDatos onAbrir={() => setDatos(true)} /></div>
      <div style={{ marginTop: "16px" }}>
        <Armador
          datos={{ "data-armador": "tu-asiento" }}
          renglones={renglones}
          estados={r ? r.estados : null}
          bloqueado={Boolean(r)}
          onAnadir={(lado) => setHoja({ lado, inicial: null })}
          onEditar={(x) => setHoja({ lado: x.lado, inicial: x })}
        />
      </div>
      {r && !r.ok && (
        <div style={{ marginTop: "12px" }}>
          <Armador datos={{ "data-armador": "era-este" }} soloLectura marca={RM.eraEste} renglones={r.correcto.map((c, k) => ({ ...c, id: `c${k}` }))} />
        </div>
      )}
      {!r && (
        <button
          type="button"
          data-revisar
          disabled={!puedeRevisarMate(renglones)}
          onClick={() => onRespondida(evaluarMate(a, renglones), renglones)}
          style={{
            marginTop: "16px", width: "100%", minHeight: "52px", borderRadius: "12px", border: "none",
            background: puedeRevisarMate(renglones) ? C.ambar : C.navy, color: puedeRevisarMate(renglones) ? C.fondo : C.atenuado,
            fontFamily: SORA, fontSize: "16px", fontWeight: 600, cursor: puedeRevisarMate(renglones) ? "pointer" : "default",
          }}
        >
          {RM.revisar}
        </button>
      )}
      <Devolucion r={r && { ok: r.ok, textos: r.textos }} lector={LECTOR} />
      {r && <BotonSiguiente onClick={onSiguiente} botonRef={botonRef} texto={RM.siguiente} />}
      {hoja && <HojaRenglon lado={hoja.lado} inicial={hoja.inicial} renglones={renglones} onListo={listo} onQuitar={quitar} onCancelar={() => setHoja(null)} />}
      {datos && <HojaDatosDeMarzo onCerrar={() => setDatos(false)} />}
    </div>
  );
}

/* ═══════════ LA PANTALLA FINAL (§6) ═══════════ */

function MarzoEnOcho({ resultados }) {
  const bien = ASIENTOS_MATE.filter((a) => resultados[a.id]).length;
  return (
    <div data-marzo-en-ocho style={{ background: C.navy, borderRadius: "12px", padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={MARCA}>{RM.marzoEnOcho}</span>
        <span data-n-de-m style={{ fontFamily: SORA, fontSize: "17px", fontWeight: 600, color: C.texto, whiteSpace: "nowrap" }}>{RM.nDeM(bien, ASIENTOS_MATE.length)}</span>
      </div>
      {ASIENTOS_MATE.map((a, k) => {
        const ok = Boolean(resultados[a.id]);
        return (
          <div key={a.id} data-fila-asiento={a.id} style={{ minHeight: "44px", display: "flex", alignItems: "center", gap: "8px", borderTop: k ? DIVISORIA : "none" }}>
            <span style={{ ...MARCA, width: "44px", flexShrink: 0 }}>{`${a.dia} MAR`}</span>
            <span style={{ flex: 1, minWidth: 0, fontFamily: INTER, fontSize: "14px", color: C.texto }}>{a.operacion}</span>
            {/* Forma, color y palabra (decisión 7). */}
            <span data-resultado={ok ? "acierto" : "error"} style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              <span
                aria-hidden="true"
                data-punto={ok ? "acierto" : "error"}
                style={{ width: "10px", height: "10px", borderRadius: "50%", boxSizing: "border-box", ...(ok ? { background: C.teal } : { background: "transparent", border: `2px solid ${C.coral}` }) }}
              />
              <span style={{ fontFamily: INTER, fontSize: "13px", fontWeight: 600, color: C.texto }}>{ok ? RM.acierto : RM.error}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════ LA ACTIVIDAD ═══════════ */

export function Mate({ onCompletar }) {
  const [paso, setPaso] = useState(-1); // -1: entrada; 0..7: asientos
  const [r, setR] = useState(null);
  const [resultados, setResultados] = useState({});
  const [terminado, setTerminado] = useState(false);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const boton = useRef(null);
  const total = ASIENTOS_MATE.length;
  const bien = Object.values(resultados).filter(Boolean).length;

  useEffect(() => {
    if (terminado) onCompletar?.(puntuarR5_3(bien, total), Date.now() - inicio.current, detalle.current);
  }, [terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r) boton.current?.focus(); }, [r]);

  const responder = (a) => (veredicto, renglones) => {
    const respuesta = renglones.map((x) => `${x.lado === "debe" ? "D" : "H"} ${x.cuenta} ${x.valor}`).join(" | ");
    detalle.current.push({ item: a.id, ok: veredicto.ok, intentos: 1, respuesta: veredicto.ok ? null : respuesta, orden: detalle.current.length + 1 });
    setResultados((x) => ({ ...x, [a.id]: veredicto.ok }));
    setR(veredicto);
  };
  const siguiente = () => {
    setR(null);
    if (paso + 1 < total) setPaso(paso + 1);
    else setTerminado(true);
    try { globalThis.scrollTo?.(0, 0); } catch { /* sin ventana */ }
  };
  const reiniciar = () => {
    setPaso(-1); setR(null); setResultados({}); setTerminado(false);
    detalle.current = []; inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <div data-r5-3 data-cierre>
        <style>{CSS_JUEGO + CSS_MATE}</style>
        <MarzoEnOcho resultados={resultados} />
        <Cierre pct={Math.round(puntuarR5_3(bien, total))} onReiniciar={reiniciar} />
      </div>
    );
  }
  if (paso < 0) {
    return (
      <>
        <style>{CSS_JUEGO + CSS_MATE}</style>
        <Entrada onEmpezar={() => setPaso(0)} />
      </>
    );
  }
  const a = ASIENTOS_MATE[paso];
  return (
    <>
      <style>{CSS_JUEGO + CSS_MATE}</style>
      <PantallaAsiento key={a.id} a={a} i={paso} total={total} r={r} onRespondida={responder(a)} onSiguiente={siguiente} botonRef={boton} />
    </>
  );
}
