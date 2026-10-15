import { useEffect, useId, useRef, useState } from "react";
import { CSS_JUEGO, Cierre } from "../mecanicas/corazon/juego.jsx";
import { pesos } from "../../data/contabilidad.js";
import { C, INTER, SORA, MARCA, SOLO_LECTOR, Devolucion, BotonSiguiente } from "./comun.jsx";
import { R5_2, ETAPAS, PREGUNTAS_R5_2, CORTES_R5_2, ROTULOS_R5_2 as RT, GRUPOS_A0, ROTULOS_A0 as RA } from "../../data/repasoCap5ToroNegroTextos.js";
import {
  prepararR5_2, evaluarAsiento, evaluarSaldo, evaluarCalculo, puedeRevisarAsiento, puedeRevisarSaldo, puedeRevisarCalculo,
  MOVIMIENTOS, libroAntesDe, saldoDe, naturaleza, fraccionDeBarra, porEtapa, puntuarR5_2,
  PASOS_R5_2, resolver, correctoDe,
} from "../../data/repasoCap5ToroNegroJuego.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * r5-2 «EL TORO NEGRO» (Célula E) — la mecánica, con el diseño de Itagaki v2
 * del paquete e5-r5-2-v2 y las decisiones de Kamogawa, que mandan.
 *
 *   entrada → P1 → corte 31 DIC → P2 → P3 → P4 (saldo) → corte MARZO
 *           → P5 → P6 → corte MAYO → final (EL CASO EN TRES TIEMPOS + Cierre)
 *
 * El armador, la hoja de cuentas, el libro T con su medidor y la pantalla de
 * saldo son de esta célula. De corazon/juego.jsx solo el Cierre y su CSS,
 * sin tocarlos; de otras células, nada (ni b5/ ni t7/).
 *
 * Ningún bloque tiene alto fijo: los altos del paquete son mínimos y el
 * contenido manda (decisión 3).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las cifras del libro y del campo van sin «$», con puntos de miles. */
export const cifra = (n) => pesos(Math.abs(n)).replace("$", "");
const LECTOR = { acierto: "Correcto: ", error: "Incorrecto: " };

const ESTADO_PIEZA = {
  /*
   * v2.1 · B4 de enganche.md: en Contabilidad el teal es DEBE (lo es en el
   * libro de esta misma pantalla). El acierto va en neutro y lo dice la
   * palabra de debajo («Correcta», «Correcto»), no el color.
   */
  ok: { border: `2px solid ${C.hecho}`, background: "rgba(203,220,242,0.10)" },
  mal: { border: `2px solid ${C.coral}`, background: "rgba(231,111,81,0.13)" },
  /* «ERA ESTE»: borde neutro discontinuo, sin celebrarlo y sin teal (B4). */
  revelada: { border: `1.5px dashed ${C.hecho}`, background: C.fondo },
};

const CSS_R5_2 = `
@keyframes r52-entra { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.r52-entra { animation: r52-entra 320ms ease-out both; }
.r52-barra { transition: width 160ms linear; }
.r52-campo:focus { outline: none; border: 2px solid ${C.ambar} !important; }
@media (prefers-reduced-motion: reduce) {
  .r52-entra { animation: none; }
  .r52-barra { transition: none; }
}
`;

const reducirMovimiento = () => {
  try { return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches); } catch { return false; }
};

/* ═══════════ LA LÍNEA DE TIEMPO ═══════════ */

function LineaDeTiempo({ estados }) {
  return (
    <div data-linea-tiempo style={{ position: "relative", minHeight: "44px" }}>
      <span aria-hidden="true" style={{ position: "absolute", left: "6px", right: "6px", top: "5px", height: "2px", background: C.navy }} />
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", justifyContent: "space-between", position: "relative" }}>
        {ETAPAS.map((e, k) => {
          const est = estados[k];
          const extremo = k === 0 ? "flex-start" : k === ETAPAS.length - 1 ? "flex-end" : "center";
          return (
            <li key={e.id} data-nodo={e.id} data-estado={est} style={{ display: "flex", flexDirection: "column", alignItems: extremo }}>
              <span
                aria-hidden="true"
                style={{
                  width: "12px", height: "12px", borderRadius: "50%", boxSizing: "border-box",
                  background: est === "hecho" ? C.hecho : est === "actual" ? C.ambar : C.fondo,
                  border: est === "pendiente" ? `1.5px solid ${C.atenuado}` : "none",
                }}
              />
              <span style={{ ...MARCA, marginTop: "8px" }}>{e.marca}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const estadosDeTiempo = (etapa, cerrada = false) => {
  const k = ETAPAS.findIndex((e) => e.id === etapa);
  return ETAPAS.map((_, j) => (j < k || (j === k && cerrada) ? "hecho" : j === k ? "actual" : "pendiente"));
};

/* ═══════════ EL HECHO ═══════════ */

function TarjetaHecho({ marca, texto }) {
  return (
    <div data-hecho style={{ background: C.navy, borderRadius: "12px", borderLeft: `3px solid ${C.hecho}`, padding: "14px 16px" }}>
      <p style={{ ...MARCA, margin: 0 }}>{marca}</p>
      <p style={{ margin: "6px 0 0", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: C.texto }}>{texto}</p>
    </div>
  );
}

/* ═══════════ EL LIBRO: LA T DE LA PROVISIÓN CON SU MEDIDOR ═══════════ */

function Movimiento({ m, nuevo }) {
  return (
    <div data-movimiento={m.id} className={nuevo ? "r52-entra" : undefined} style={{ minHeight: "40px", padding: "2px 0" }}>
      <span style={{ display: "block", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: C.atenuado }}>{m.concepto}</span>
      <span style={{ display: "block", textAlign: "right", fontFamily: INTER, fontSize: "15px", fontWeight: 600, lineHeight: "20px", fontVariantNumeric: "tabular-nums", color: C.texto }}>{cifra(m.valor)}</span>
    </div>
  );
}

/* El renglón del saldo, en la columna de su naturaleza; la palabra siempre junto al color. */
function RenglonSaldo({ saldo, lado }) {
  const credito = lado === "credito";
  return (
    <div data-saldo={lado} style={{ minHeight: "48px", borderLeft: `3px solid ${credito ? C.ambar : C.teal}`, paddingLeft: "8px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <span style={MARCA}>{credito ? RT.saldoCredito : RT.saldoDebito}</span>
      <span style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto, textAlign: "right" }}>{cifra(saldo)}</span>
    </div>
  );
}

/*
 * El medidor: riel, cero y la barra que nace del cero. `fantasma` es el saldo
 * con que empezó la etapa, dibujado en contorno discontinuo.
 */
export function Medidor({ saldo, fantasma = null, mini = false }) {
  const lado = naturaleza(saldo);
  const ancho = `${Math.min(1, fraccionDeBarra(saldo)) * 50}%`;
  const barra = (s, estilo) => {
    const n = naturaleza(s);
    if (n === "cero") return null;
    const w = mini ? `max(4px, ${Math.min(1, fraccionDeBarra(s)) * 50}%)` : `${Math.min(1, fraccionDeBarra(s)) * 50}%`;
    return <span style={{ position: "absolute", top: mini ? "7px" : "2px", height: "10px", width: w, ...(n === "credito" ? { left: "50%" } : { right: "50%" }), ...estilo }} />;
  };
  return (
    <div data-medidor={lado} data-fraccion={fraccionDeBarra(saldo).toFixed(4)} aria-hidden="true" style={{ position: "relative", height: mini ? "24px" : "48px", minWidth: 0 }}>
      <span style={{ position: "absolute", left: 0, right: 0, top: mini ? "11px" : "6px", height: "2px", background: C.atenuado }} />
      {fantasma !== null && naturaleza(fantasma) !== "cero" && barra(fantasma, { boxSizing: "border-box", border: `1px dashed ${C.atenuado}`, background: "transparent" })}
      {lado !== "cero" && (
        <span
          data-barra={lado}
          className="r52-barra"
          style={{
            position: "absolute", top: mini ? "7px" : "2px", height: "10px",
            width: mini ? `max(4px, ${ancho})` : ancho,
            background: lado === "credito" ? C.ambar : C.teal,
            ...(lado === "credito" ? { left: "50%" } : { right: "50%" }),
          }}
        />
      )}
      <span style={{ position: "absolute", left: "calc(50% - 1px)", top: mini ? "4px" : "0", width: "2px", height: "16px", background: C.texto }} />
      {!mini && (
        <>
          <span style={{ position: "absolute", left: "50%", top: "20px", transform: "translateX(-50%)", fontFamily: INTER, fontSize: "11px", color: C.texto }}>0</span>
          <span style={{ ...MARCA, position: "absolute", left: 0, top: "22px" }}>{RT.debito}</span>
          <span style={{ ...MARCA, position: "absolute", right: 0, top: "22px" }}>{RT.credito}</span>
        </>
      )}
    </div>
  );
}

/*
 * La T. `movimientos` son los del libro; `nuevos` los ids que acaban de
 * entrar (se animan). `saldo` puede ir por detrás de los movimientos mientras
 * el corte anima; por defecto es el de los movimientos.
 */
export function LibroProvision({ movimientos, saldo = saldoDe(movimientos), fantasma = null, nuevos = [] }) {
  const lado = naturaleza(saldo);
  const col = (l) => movimientos.filter((m) => m.lado === l);
  const vacio = movimientos.length === 0;
  return (
    <div data-libro style={{ background: C.navy, borderRadius: "12px", padding: "16px" }}>
      <p style={{ margin: "0 0 8px", fontFamily: INTER, fontSize: "15px", fontWeight: 600, lineHeight: "22px", color: C.texto }}>{RT.tituloLibro}</p>
      <div style={{ position: "relative" }}>
        <span aria-hidden="true" style={{ position: "absolute", left: "calc(50% - 1px)", top: 0, bottom: 0, width: "2px", background: C.atenuado }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {["debe", "haber"].map((l) => (
            <div key={l} data-cabecera-columna={l} style={{ minHeight: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
              <span style={MARCA}>{l === "debe" ? RT.debe : RT.haber}</span>
              <span aria-hidden="true" style={{ marginTop: "3px", width: "24px", height: "3px", background: l === "debe" ? C.teal : C.ambar }} />
            </div>
          ))}
        </div>
        {vacio ? (
          <p data-sin-movimientos style={{ margin: 0, minHeight: "40px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontSize: "13px", color: C.atenuado, background: C.navy, position: "relative" }}>
            {RT.sinMovimientos}
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {["debe", "haber"].map((l) => (
              <div key={l} data-columna={l} style={{ padding: "0 8px", minWidth: 0 }}>
                {col(l).map((m) => <Movimiento key={m.id} m={m} nuevo={nuevos.includes(m.id)} />)}
              </div>
            ))}
          </div>
        )}
        <div style={{ borderTop: `1px solid ${C.atenuado}` }}>
          {lado === "cero" ? (
            <div data-saldo="cero" style={{ minHeight: "48px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", background: C.navy }}>
              <span style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, color: C.texto }}>0</span>
              <span style={MARCA}>{RT.sinSaldo}</span>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ padding: "0 8px", minWidth: 0 }}>{lado === "debito" && <RenglonSaldo saldo={saldo} lado="debito" />}</div>
              <div style={{ padding: "0 8px", minWidth: 0 }}>{lado === "credito" && <RenglonSaldo saldo={saldo} lado="credito" />}</div>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: "8px" }}><Medidor saldo={saldo} fantasma={fantasma} /></div>
    </div>
  );
}

/* ═══════════ EL CAMPO DE VALOR ═══════════ */

/* Solo dígitos, hasta 8 (9 en la pantalla a0: decisión 4 del delta), con puntos de miles mientras se escribe. */
export const leerCifra = (texto, maximo = 8) => {
  const digitos = String(texto).replace(/\D/g, "").slice(0, maximo);
  return digitos === "" ? null : Number(digitos);
};

function CampoValor({
  id, valor, onCambiar, estado = null, soloLectura = false,
  maximo = 8, alto = "48px", placeholder, enterKeyHint, onEnter, inputRef, etiqueta,
}) {
  const base = { border: `1.5px solid ${C.atenuado}`, background: C.fondo };
  const visto = estado && estado !== "vacia" ? ESTADO_PIEZA[estado] : base;
  return (
    <input
      id={id}
      ref={inputRef}
      data-campo-valor={estado ?? "libre"}
      className="r52-campo"
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label={etiqueta}
      placeholder={placeholder}
      enterKeyHint={enterKeyHint}
      readOnly={soloLectura || Boolean(estado)}
      value={valor === null ? "" : cifra(valor)}
      onChange={(e) => onCambiar?.(leerCifra(e.target.value, maximo))}
      onKeyDown={onEnter ? (e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(); } } : undefined}
      style={{
        width: "100%", height: alto, boxSizing: "border-box", borderRadius: "10px", padding: "0 12px",
        fontFamily: INTER, fontSize: "17px", fontWeight: 600, fontVariantNumeric: "tabular-nums", textAlign: "right", color: C.texto,
        ...visto,
      }}
    />
  );
}

/*
 * v2.1 · LA PALABRA DEBAJO DE CADA PIEZA. Después de revisar, el borde teal o
 * coral iba solo: en blanco y negro no se sabía qué renglón estaba mal. Ahora
 * cada pieza lleva su palabra, como las filas de a0 («Correcta», «Era …»).
 */
function Veredicto({ estado, textos }) {
  if (estado !== "ok" && estado !== "mal") return null;
  return (
    <span data-veredicto={estado} style={{ display: "block", marginTop: "4px", textAlign: "right", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", fontWeight: 600, color: C.texto }}>
      {textos[estado]}
    </span>
  );
}

/* ═══════════ EL ARMADOR DE ASIENTOS ═══════════ */

function Hueco({ lado, cuenta, activo, estado, onTocar, huecoRef, soloLectura = false }) {
  const lleno = Boolean(cuenta);
  const borde = estado ? null : activo ? `2px solid ${C.ambar}` : lleno ? `1px solid ${C.atenuado}` : `1.5px dashed ${C.atenuado}`;
  const contenido = (
    <>
      <span style={SOLO_LECTOR}>{lado === "debe" ? RT.debe : RT.haber}: </span>
      {lleno
        ? <span style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, color: C.texto }}>{cuenta}</span>
        : <span style={{ fontFamily: INTER, fontSize: "14px", color: C.atenuado }}>{RT.vacio}</span>}
    </>
  );
  const estilo = {
    display: "flex", alignItems: "center", width: "100%", minHeight: "56px", boxSizing: "border-box", textAlign: "left",
    borderRadius: "10px", padding: "12px", background: C.fondo, ...(borde ? { border: borde } : ESTADO_PIEZA[estado]),
  };
  if (soloLectura) return <div data-hueco={lado} data-lleno={lleno} style={{ ...estilo, ...ESTADO_PIEZA.revelada }}>{contenido}</div>;
  return (
    <button
      ref={huecoRef}
      type="button"
      data-hueco={lado}
      data-lleno={lleno}
      data-activo={activo || undefined}
      data-estado={estado ?? "libre"}
      disabled={Boolean(estado)}
      aria-haspopup="dialog"
      onClick={onTocar}
      style={{ ...estilo, cursor: estado ? "default" : "pointer" }}
    >
      {contenido}
    </button>
  );
}

function TarjetaAsiento({ debe, haber, valor, activo, estados = null, onTocar, onValor, refs, soloLectura = false, marca = null, idCampo }) {
  return (
    <div data-tarjeta-asiento={soloLectura ? "era-este" : "armador"} style={{ background: C.navy, borderRadius: "12px", padding: "16px", ...(soloLectura ? ESTADO_PIEZA.revelada : {}), ...(soloLectura ? { background: C.navy } : {}) }}>
      {marca && <p data-era-este style={{ ...MARCA, color: C.texto, margin: "0 0 10px" }}>{marca}</p>}
      <p style={{ ...MARCA, margin: "0 0 4px" }}>{RT.debe}</p>
      <Hueco lado="debe" cuenta={debe} activo={activo === "debe"} estado={estados?.debe} onTocar={() => onTocar?.("debe")} huecoRef={refs?.debe} soloLectura={soloLectura} />
      <Veredicto estado={estados?.debe} textos={RT.veredicto.cuenta} />
      <div style={{ marginTop: "12px", paddingLeft: "16px" }}>
        <p style={{ ...MARCA, margin: "0 0 4px" }}>{RT.haber}</p>
        <Hueco lado="haber" cuenta={haber} activo={activo === "haber"} estado={estados?.haber} onTocar={() => onTocar?.("haber")} huecoRef={refs?.haber} soloLectura={soloLectura} />
        <Veredicto estado={estados?.haber} textos={RT.veredicto.cuenta} />
      </div>
      <div aria-hidden="true" style={{ height: "1px", background: "rgba(184,196,212,0.25)", margin: "16px 0" }} />
      <label htmlFor={idCampo} style={{ ...MARCA, display: "block", margin: "0 0 4px" }}>{RT.valor}</label>
      <CampoValor id={idCampo} valor={valor} onCambiar={onValor} estado={soloLectura ? "revelada" : estados?.valor} soloLectura={soloLectura} />
      <Veredicto estado={soloLectura ? null : estados?.valor} textos={RT.veredicto.valor} />
    </div>
  );
}

/* La hoja inferior con las cinco cuentas. */
function HojaDeCuentas({ lado, hoja, puestas, onElegir, onCerrar }) {
  const titulo = useId();
  const primera = useRef(null);
  const otro = lado === "debe" ? "haber" : "debe";
  useEffect(() => {
    primera.current?.focus();
    const tecla = (e) => { if (e.key === "Escape") onCerrar(); };
    globalThis.addEventListener?.("keydown", tecla);
    return () => globalThis.removeEventListener?.("keydown", tecla);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div data-hoja-velo onClick={onCerrar} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(14,27,46,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titulo}
        data-hoja={lado}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "860px", maxHeight: "70vh", overflowY: "auto", background: C.navy, borderRadius: "16px 16px 0 0", boxSizing: "border-box" }}
      >
        <div style={{ minHeight: "48px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 0 16px" }}>
          <span id={titulo} style={MARCA}>{RT.cuentaDel[lado]}</span>
          <button type="button" data-cerrar onClick={onCerrar} style={{ minHeight: "44px", minWidth: "44px", padding: "0 8px", background: "transparent", border: "none", cursor: "pointer", fontFamily: INTER, fontSize: "15px", fontWeight: 600, color: C.texto }}>
            {RT.cerrar}
          </button>
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: "0 0 8px" }}>
          {hoja.map((cuenta, k) => {
            const enElOtro = puestas[otro] === cuenta;
            return (
              <li key={cuenta} style={{ borderTop: "1px solid rgba(184,196,212,0.25)" }}>
                <button
                  ref={k === 0 ? primera : undefined}
                  type="button"
                  data-cuenta={cuenta}
                  onClick={() => onElegir(cuenta)}
                  style={{
                    width: "100%", minHeight: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
                    padding: "8px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                    fontFamily: INTER, fontSize: "15px", color: enElOtro ? C.atenuado : C.texto,
                  }}
                >
                  <span>{cuenta}</span>
                  {enElOtro && <span data-en-el-otro={otro} style={{ ...MARCA, flexShrink: 0 }}>{RT.enElOtro[otro]}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function BotonRevisar({ activo, onClick, texto }) {
  return (
    <button
      type="button"
      data-revisar
      disabled={!activo}
      onClick={onClick}
      style={{
        marginTop: "16px", width: "100%", minHeight: "52px", borderRadius: "12px", border: "none",
        background: activo ? C.ambar : C.navy, color: activo ? C.fondo : C.atenuado,
        fontFamily: SORA, fontSize: "16px", fontWeight: 600, cursor: activo ? "pointer" : "default",
      }}
    >
      {texto}
    </button>
  );
}

/* Una pantalla de asiento (preguntas 1, 2, 3, 5 y 6). */
function PreguntaAsiento({ p, hoja, onRespondida, r, respuestas = {} }) {
  const [debe, setDebe] = useState(null);
  const [haber, setHaber] = useState(null);
  const [valor, setValor] = useState(null);
  const [activo, setActivo] = useState(null);
  const [abierta, setAbierta] = useState(null);
  const refs = { debe: useRef(null), haber: useRef(null) };
  const idCampo = useId();

  const elegir = (cuenta) => {
    const lado = abierta;
    const otro = lado === "debe" ? "haber" : "debe";
    const puestas = { debe, haber };
    const nuevas = { ...puestas, [lado]: cuenta };
    if (puestas[otro] === cuenta) nuevas[otro] = null;
    setDebe(nuevas.debe); setHaber(nuevas.haber);
    setAbierta(null);
    /* Si se acaba de llenar el DEBE y el HABER está vacío, el HABER queda activo. La hoja no se reabre. */
    const siguienteActivo = lado === "debe" && !nuevas.haber ? "haber" : null;
    setActivo(siguienteActivo);
    requestAnimationFrame(() => refs[siguienteActivo ?? lado].current?.focus());
  };
  const cerrar = () => { const l = abierta; setAbierta(null); setActivo(null); requestAnimationFrame(() => refs[l]?.current?.focus()); };
  const tocar = (lado) => { setActivo(lado); setAbierta(lado); };

  const estados = r ? { debe: r.piezas.debe ? "ok" : "mal", haber: r.piezas.haber ? "ok" : "mal", valor: r.piezas.valor ? "ok" : "mal" } : null;
  return (
    <>
      <TarjetaAsiento debe={debe} haber={haber} valor={valor} activo={r ? null : activo} estados={estados} onTocar={tocar} onValor={setValor} refs={refs} idCampo={idCampo} />
      {r && !r.ok && (
        <div style={{ marginTop: "12px" }}>
          <TarjetaAsiento soloLectura marca={RT.eraEste} debe={p.correcto.debe} haber={p.correcto.haber} valor={correctoDe(p, respuestas).valor} idCampo={`${idCampo}-era`} />
        </div>
      )}
      {!r && <BotonRevisar activo={puedeRevisarAsiento({ debe, haber, valor })} texto={RT.revisarAsiento} onClick={() => onRespondida(evaluarAsiento(p, { debe, haber, valor }, respuestas), `${debe} | ${haber} | ${valor}`, { debe, haber, valor })} />}
      {abierta && <HojaDeCuentas lado={abierta} hoja={hoja} puestas={{ debe, haber }} onElegir={elegir} onCerrar={cerrar} />}
    </>
  );
}

/* ═══════════ LA PANTALLA DE SALDO (pregunta 4) ═══════════ */

function BotonLado({ lado, elegido, estado, onClick, soloLectura }) {
  /*
   * v2.1: el lado elegido sigue relleno después de revisar, y en «ERA ESTE» el
   * lado correcto va relleno: relleno contra contorno es forma, no solo color.
   * Antes, al revisar, el relleno se perdía y los dos lados quedaban iguales
   * salvo el color de un borde.
   */
  const relleno = elegido || estado === "revelada";
  const borde = estado ? ESTADO_PIEZA[estado].border : relleno ? `1.5px solid ${C.hecho}` : `1.5px solid ${C.atenuado}`;
  const visto = { background: relleno ? C.hecho : C.fondo, border: borde };
  return (
    <button
      type="button"
      data-lado={lado}
      data-estado={estado ?? (elegido ? "elegido" : "reposo")}
      aria-pressed={elegido}
      disabled={soloLectura || Boolean(estado)}
      onClick={onClick}
      style={{
        flex: 1, minWidth: 0, minHeight: "48px", borderRadius: "10px", cursor: soloLectura || estado ? "default" : "pointer",
        fontFamily: INTER, fontSize: "15px", fontWeight: 600, color: relleno ? C.fondo : C.texto, ...visto,
      }}
    >
      {lado === "debito" ? RT.debito : RT.credito}
    </button>
  );
}

function TarjetaSaldo({ valor, lado, onValor, onLado, estados = null, soloLectura = false, marca = null, idCampo }) {
  return (
    <div data-tarjeta-saldo={soloLectura ? "era-este" : "respuesta"} style={{ background: C.navy, borderRadius: "12px", padding: "16px", ...(soloLectura ? { border: ESTADO_PIEZA.revelada.border } : {}) }}>
      {marca && <p data-era-este style={{ ...MARCA, color: C.texto, margin: "0 0 10px" }}>{marca}</p>}
      <label htmlFor={idCampo} style={{ ...MARCA, display: "block", margin: "0 0 4px" }}>{RT.valor}</label>
      <CampoValor id={idCampo} valor={valor} onCambiar={onValor} estado={soloLectura ? "revelada" : estados?.valor} soloLectura={soloLectura} />
      <Veredicto estado={soloLectura ? null : estados?.valor} textos={RT.veredicto.valor} />
      <p style={{ ...MARCA, margin: "12px 0 4px" }}>{RT.ladoDelSaldo}</p>
      <div role="group" aria-label={RT.ladoDelSaldo} style={{ display: "flex", gap: "8px" }}>
        {["debito", "credito"].map((l) => (
          <BotonLado
            key={l}
            lado={l}
            elegido={lado === l}
            soloLectura={soloLectura}
            estado={soloLectura ? (lado === l ? "revelada" : null) : estados && lado === l ? estados.lado : null}
            onClick={() => onLado?.(l)}
          />
        ))}
      </div>
      {/* Con 0 no se pide lado: si no eligió ninguno, no hay lado que calificar. */}
      <Veredicto estado={soloLectura || !lado ? null : estados?.lado} textos={RT.veredicto.lado} />
    </div>
  );
}

function PreguntaSaldo({ p, onRespondida, r, respuestas = {} }) {
  const [valor, setValor] = useState(null);
  const [lado, setLado] = useState(null);
  const idCampo = useId();
  const estados = r ? { valor: r.piezas.valor ? "ok" : "mal", lado: r.piezas.lado ? "ok" : "mal" } : null;
  return (
    <>
      <TarjetaSaldo valor={valor} lado={lado} onValor={setValor} onLado={setLado} estados={estados} idCampo={idCampo} />
      {r && !r.ok && (
        <div style={{ marginTop: "12px" }}>
          <TarjetaSaldo soloLectura marca={RT.eraEste} valor={correctoDe(p, respuestas).valor} lado={p.correcto.lado} idCampo={`${idCampo}-era`} />
        </div>
      )}
      {!r && <BotonRevisar activo={puedeRevisarSaldo({ valor, lado })} texto={RT.revisarSaldo} onClick={() => onRespondida(evaluarSaldo(p, { valor, lado }, respuestas), `${valor} | ${lado ?? "sin lado"}`, { valor, lado })} />}
    </>
  );
}

/* ═══════════ (a0) CALCULA LA PROVISIÓN ═══════════ */

/* Debajo del campo, después de revisar: «Correcta» o «Era …», la palabra siempre con el color. */
function Bajo({ estado, era }) {
  if (!estado) return null;
  const calificado = estado !== "vacia";
  return (
    <span data-bajo={estado} style={{ display: "block", marginTop: "4px", textAlign: "right", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", fontWeight: 600, color: calificado ? C.texto : C.atenuado }}>
      {estado === "ok" ? RA.correcta : RA.era(cifra(era))}
    </span>
  );
}

function PreguntaCalculo({ p, onRespondida, r, respuestas = {} }) {
  const [filas, setFilas] = useState({});
  const [total, setTotal] = useState(null);
  const refs = useRef([]);
  const base = useId();
  /* «Siguiente» del teclado: de una fila a la siguiente y de la última al total. */
  const pasar = (k) => () => refs.current[k + 1]?.focus();
  const DIVISORIA = "1px solid rgba(184,196,212,0.25)";
  return (
    <>
      <div data-tarjeta-calculo style={{ background: C.navy, borderRadius: "12px", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "24px", marginBottom: "8px", gap: "8px" }}>
          <span style={MARCA}>{RA.grupoYSaldo}</span>
          <span style={MARCA}>{RA.tuProvision}</span>
        </div>
        {GRUPOS_A0.map((g, k) => {
          const estado = r ? r.filas[g.id] : null;
          return (
            <div key={g.id} data-fila-grupo={g.id} style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "72px", padding: "6px 0", boxSizing: "border-box", borderTop: k ? DIVISORIA : "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span data-grupo style={{ display: "block", fontFamily: INTER, fontSize: "13px", lineHeight: "18px", color: C.texto }}>{g.grupo}</span>
                <span data-saldo-grupo style={{ display: "block", fontFamily: INTER, fontSize: "15px", lineHeight: "20px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto }}>
                  {cifra(g.saldo)}{" "}
                  <span data-porcentaje style={{ whiteSpace: "nowrap", fontWeight: 600, color: C.atenuado }}>{RA.porcentaje(g.porcentaje)}</span>
                </span>
              </div>
              <div style={{ width: "136px", flexShrink: 0 }}>
                <CampoValor
                  id={`${base}-${g.id}`}
                  inputRef={(el) => { refs.current[k] = el; }}
                  etiqueta={`${RA.tuProvision}: ${g.grupo}`}
                  valor={filas[g.id] ?? null}
                  onCambiar={(v) => setFilas((x) => ({ ...x, [g.id]: v }))}
                  estado={estado}
                  maximo={9}
                  alto="44px"
                  placeholder={RA.marcador}
                  enterKeyHint="next"
                  onEnter={pasar(k)}
                />
                <Bajo estado={estado} era={g.provision} />
              </div>
            </div>
          );
        })}
        <div aria-hidden="true" style={{ height: "1px", background: C.atenuado, margin: "16px 0" }} />
        <div data-fila-total style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "48px" }}>
          <label htmlFor={`${base}-total`} style={{ flex: 1, minWidth: 0, fontFamily: INTER, fontSize: "15px", fontWeight: 600, color: C.texto }}>{RA.total}</label>
          <div style={{ width: "136px", flexShrink: 0 }}>
            <CampoValor
              id={`${base}-total`}
              inputRef={(el) => { refs.current[GRUPOS_A0.length] = el; }}
              valor={total}
              onCambiar={setTotal}
              estado={r ? (r.ok ? "ok" : "mal") : null}
              maximo={9}
              placeholder={RA.marcador}
              enterKeyHint="done"
            />
            <Bajo estado={r ? (r.ok ? "ok" : "mal") : null} era={correctoDe(p, respuestas).valor} />
          </div>
        </div>
        <p style={{ ...MARCA, margin: "12px 0 0" }}>{RA.cifrasEnPesos}</p>
      </div>
      {!r && (
        <BotonRevisar
          activo={puedeRevisarCalculo({ total })}
          texto={RA.revisar}
          onClick={() => onRespondida(
            evaluarCalculo(p, { filas, total }, respuestas),
            `${total} | ${GRUPOS_A0.map((g) => filas[g.id] ?? "-").join(" ")}`,
            { filas, total },
          )}
        />
      )}
    </>
  );
}

/* ═══════════ LAS PANTALLAS DE CORTE ═══════════ */

/*
 * Entran los movimientos de la etapa uno a uno: fundido y 8 px; después de
 * cada uno, el saldo y la barra se mueven en 320 ms (dos tramos de 160 si
 * cruzan el cero: la palabra y la franja cambian a mitad). 400 ms de pausa
 * entre renglones. Con prefers-reduced-motion, el estado final de una vez.
 * El fantasma es la barra con que empezó la etapa.
 */
function Corte({ etapa, onSiguiente }) {
  const antes = libroAntesDe(etapa);
  const nuevos = MOVIMIENTOS[etapa];
  const saldoInicial = saldoDe(antes);
  const reducir = reducirMovimiento();
  const [vistos, setVistos] = useState(reducir ? nuevos.length : 0);
  const [saldo, setSaldo] = useState(reducir ? saldoDe([...antes, ...nuevos]) : saldoInicial);
  const [terminado, setTerminado] = useState(reducir);
  const titulo = useRef(null);

  useEffect(() => {
    titulo.current?.focus();
    if (reducir) return undefined;
    const relojes = [];
    let t = 0;
    let s = saldoInicial;
    nuevos.forEach((m, k) => {
      if (k > 0) t += 400;
      relojes.push(setTimeout(() => setVistos(k + 1), t));
      const destino = s + (m.lado === "haber" ? m.valor : -m.valor);
      if (naturaleza(s) !== "cero" && naturaleza(destino) !== naturaleza(s)) {
        relojes.push(setTimeout(() => setSaldo(0), t));
        relojes.push(setTimeout(() => setSaldo(destino), t + 160));
      } else {
        relojes.push(setTimeout(() => setSaldo(destino), t));
      }
      t += 320;
      s = destino;
    });
    relojes.push(setTimeout(() => setTerminado(true), t));
    return () => relojes.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const movimientos = [...antes, ...nuevos.slice(0, vistos)];
  return (
    <div data-corte={etapa}>
      <LineaDeTiempo estados={estadosDeTiempo(etapa, true)} />
      <h3 ref={titulo} tabIndex={-1} style={{ margin: "16px 0", fontFamily: SORA, fontSize: "20px", lineHeight: "28px", fontWeight: 600, color: C.texto, outline: "none" }}>{RT.tituloCorte}</h3>
      <LibroProvision movimientos={movimientos} saldo={saldo} fantasma={terminado ? saldoInicial : null} nuevos={nuevos.map((m) => m.id)} />
      {CORTES_R5_2[etapa].parrafos.map((t, k) => (
        <p key={k} data-texto-corte style={{ margin: k ? "12px 0 0" : "16px 0 0", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: C.texto }}>{t}</p>
      ))}
      <div style={{ marginTop: "24px" }}><BotonSiguiente texto={RT.siguiente} onClick={onSiguiente} /></div>
    </div>
  );
}

/* ═══════════ LA PANTALLA FINAL ═══════════ */

function CasoEnTresTiempos({ filas }) {
  return (
    <div data-caso-en-tres-tiempos>
      <p style={{ ...MARCA, margin: "0 0 8px" }}>{RT.casoEnTresTiempos}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filas.map((f) => {
          const lado = naturaleza(f.saldo);
          return (
            <div key={f.id} data-fila-etapa={f.id} style={{ minHeight: "76px", background: C.navy, borderRadius: "12px", padding: "12px 16px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", minHeight: "20px" }}>
                <span style={MARCA}>{f.marca}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span aria-hidden="true" style={{ display: "flex", gap: "6px" }}>
                    {/* Forma además de color (decisión 9 del delta): relleno si acertó, anillo si falló. */}
                    {f.puntos.map((x) => (
                      <span
                        key={x.id}
                        data-punto={x.ok ? "acierto" : "error"}
                        data-forma={x.ok ? "relleno" : "anillo"}
                        style={{ width: "10px", height: "10px", borderRadius: "50%", boxSizing: "border-box", ...(x.ok ? { background: C.hecho } : { background: "transparent", border: `2px solid ${C.coral}` }) }}
                      />
                    ))}
                  </span>
                  <span data-n-de-m style={{ fontFamily: SORA, fontSize: "15px", fontWeight: 600, color: C.texto, whiteSpace: "nowrap" }}>{RT.nDeM(f.bien, f.total)}</span>
                </span>
              </div>
              {/* Si no cabe, cede el medidor, nunca el texto (decisión 4). */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", minHeight: "24px" }}>
                <span data-rotulo-saldo style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "140px", flexShrink: 0, whiteSpace: "nowrap" }}>
                  <span aria-hidden="true" style={{ width: "3px", alignSelf: "stretch", background: lado === "credito" ? C.ambar : C.teal }} />
                  <span style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto }}>{cifra(f.saldo)}</span>
                  <span style={MARCA}>{lado === "credito" ? RT.credito : RT.debito}</span>
                </span>
                <span style={{ flex: 1, minWidth: 0 }}><Medidor saldo={f.saldo} mini /></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════ LA ACTIVIDAD ═══════════ */

/*
 * Cada tipo de pregunta, con el componente que la pinta. «calculo» es la
 * etapa a0 del delta e5-r5-2-a0.
 */
const PREGUNTA_POR_TIPO = { calculo: PreguntaCalculo, asiento: PreguntaAsiento, saldo: PreguntaSaldo };

export function ToroNegro({ onCompletar, preparar = null, preguntas = PREGUNTAS_R5_2, pasos = PASOS_R5_2 }) {
  const [tanda, setTanda] = useState(() => preparar?.() ?? prepararR5_2());
  const [paso, setPaso] = useState(0);
  const [r, setR] = useState(null);
  const [resultados, setResultados] = useState({});
  /* Lo que respondió en cada ítem: el ajuste puede tomar de aquí el total calculado. */
  const [respuestas, setRespuestas] = useState({});
  const [terminado, setTerminado] = useState(false);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const boton = useRef(null);
  const raiz = useRef(null);

  const total = preguntas.length;
  const bien = Object.values(resultados).filter(Boolean).length;

  useEffect(() => {
    if (terminado) onCompletar?.(puntuarR5_2(bien, total), Date.now() - inicio.current, detalle.current);
  }, [terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r) boton.current?.focus(); }, [r]);

  const avanzar = () => {
    setR(null);
    if (paso + 1 < pasos.length) {
      setPaso(paso + 1);
      requestAnimationFrame(() => raiz.current?.querySelector("[data-enunciado], h3")?.focus());
    } else setTerminado(true);
  };

  const responder = (p) => (veredicto, respuesta, valores = null) => {
    setRespuestas((x) => ({ ...x, [p.id]: valores }));
    detalle.current.push({ item: p.id, ok: veredicto.ok, intentos: 1, respuesta: veredicto.ok ? null : respuesta, orden: detalle.current.length + 1 });
    setResultados((x) => ({ ...x, [p.id]: veredicto.ok }));
    setR(veredicto);
  };

  const reiniciar = () => {
    setTanda(preparar?.() ?? prepararR5_2());
    setPaso(0); setR(null); setResultados({}); setRespuestas({}); setTerminado(false);
    detalle.current = []; inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <div data-r5-2 data-cierre>
        <style>{CSS_JUEGO + CSS_R5_2}</style>
        <CasoEnTresTiempos filas={porEtapa(resultados, preguntas)} />
        <Cierre pct={Math.round(puntuarR5_2(bien, total))} onReiniciar={reiniciar} />
      </div>
    );
  }

  const ahora = pasos[paso];
  if (ahora.tipo === "entrada") {
    return (
      <div data-r5-2 data-paso="entrada" ref={raiz}>
        <style>{CSS_JUEGO + CSS_R5_2}</style>
        <p data-objetivo style={{ margin: "0 0 16px", fontFamily: INTER, fontSize: "14px", lineHeight: 1.5, color: C.atenuado }}>{R5_2.objetivo}</p>
        <p data-entrada style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: C.texto }}>{R5_2.entrada}</p>
        <div style={{ marginTop: "24px" }}><BotonSiguiente texto={RT.siguiente} onClick={avanzar} /></div>
      </div>
    );
  }
  if (ahora.tipo === "corte") {
    return (
      <div data-r5-2 data-paso={`corte-${ahora.etapa}`} ref={raiz}>
        <style>{CSS_JUEGO + CSS_R5_2}</style>
        <Corte key={ahora.etapa} etapa={ahora.etapa} onSiguiente={avanzar} />
      </div>
    );
  }

  const p = preguntas[ahora.i];
  const etapa = ETAPAS.find((e) => e.id === p.etapa);
  const Pregunta = PREGUNTA_POR_TIPO[p.tipo];
  return (
    <div data-r5-2 data-paso={p.id} ref={raiz}>
      <style>{CSS_JUEGO + CSS_R5_2}</style>
      <p data-progreso style={{ ...MARCA, margin: 0 }}>{RT.progreso(ahora.i + 1, total)}</p>
      <div style={{ marginTop: "8px" }}><LineaDeTiempo estados={estadosDeTiempo(p.etapa)} /></div>
      <div style={{ marginTop: "16px" }}><TarjetaHecho marca={etapa.marca} texto={resolver(p.hecho, respuestas)} /></div>
      {/* El libro como estaba al empezar la etapa (la regla del libro). */}
      {!p.sinLibro && <div style={{ marginTop: "16px" }}><LibroProvision movimientos={libroAntesDe(p.etapa)} /></div>}
      <p data-enunciado tabIndex={-1} style={{ margin: "16px 0", fontFamily: INTER, fontSize: "17px", lineHeight: "26px", fontWeight: 600, color: C.texto, outline: "none" }}>{p.enunciado}</p>
      <Pregunta key={p.id} p={p} hoja={tanda.hoja} r={r} respuestas={respuestas} onRespondida={responder(p)} />
      <Devolucion r={r} lector={LECTOR} />
      {r && <BotonSiguiente onClick={avanzar} botonRef={boton} texto={RT.siguiente} />}
    </div>
  );
}
