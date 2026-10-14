import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../../data/contabilidad.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { ROTULO_ESTANTE, COLECTOR, TEXTO_CONFIRMAR, TEXTO_DIFERENCIA, AVISO_UN_INTENTO } from "../../../../data/contabilidadAsientoCompuesto.js";
import { T5_ACT2, PARTES_T5_ACT2, ESTANTE_T5_ACT2, RESUMEN_T5_ACT2, ALT_T5_ACT2 } from "../../../../data/contabilidadT5Act2.js";
import { evaluarParteT5Act2, totalesDe, puntuarT5Act2 } from "../../../../contabilidad/t5Act2.js";
import { formatearCifra, leerCifra } from "../../../../contabilidad/elCierreCompleto.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · HACER 2 · EL CIERRE COMPLETO DE SANTA PACHA (Célula B, b5-t5-a2)
 *
 * La mecánica de t3-cierre-completo (tema3/ElCierreCompleto.jsx), replicada
 * en un componente de la célula para no tocar el del Tema 3: el estante, la
 * mesa de dos columnas con sus colectores y un campo de valor por cuenta, el
 * conector que cierra cuando los totales coinciden, «Confirmar asiento», un
 * intento por parte, el error con prioridad D > C > A > B y el asiento
 * correcto revelado; al acertar, solo la marca junto al rótulo.
 *
 * La adaptación de Sakuta: un solo caso con 4 partes, una por pantalla;
 * contador «Asiento»; «Siguiente asiento» / «Ver mi resumen». El estante
 * va sin montos.
 *
 * Avisa hacia fuera cada parte comprobada (`onParteComprobada`) y cada
 * reinicio (`onReiniciar`): con eso, el libro diario de encima crece (la
 * variante 1 de la guía de Mai). El diario llega por `encima` y se pinta
 * entre el encabezado y el contador, donde lo puso Mai en su réplica.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const CORAL = FAE.coral;
const CIFRA = { fontFamily: SORA, fontVariantNumeric: "tabular-nums" };

const CSS = `
@keyframes fae-b5k-entra { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.fae-b5k button { -webkit-tap-highlight-color: transparent; }
.fae-b5k button:focus-visible, .fae-b5k input:focus-visible { outline: 2px solid ${COLOR.blanco}; outline-offset: 2px; }
.fae-b5k input::placeholder { color: ${COLOR.apagado}; }
@media (prefers-reduced-motion: reduce) { .fae-b5k * { animation: none !important; transition: none !important; } }
`;

function Visto() {
  return (
    <span aria-hidden="true" data-visto-parte style={{ width: "20px", height: "20px", borderRadius: "50%", background: COLOR.neutro, display: "inline-grid", placeItems: "center", flex: "none" }}>
      <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke={COLOR.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

/* Un campo de cifra: «$», punto de miles, sin decimales, hasta 8 dígitos. */
function Campo({ id, valor, onCambio, bloqueado, etiqueta, error }) {
  return (
    <div data-caja-campo={id} style={{
      display: "flex", alignItems: "center", height: "44px", boxSizing: "border-box", padding: "0 8px", borderRadius: "10px",
      background: "rgba(14,27,46,0.7)", border: `${error ? "2px" : "1px"} solid ${error ? CORAL : "rgba(248,249,250,0.22)"}`,
    }}>
      <span aria-hidden="true" data-signo style={{ fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: COLOR.apagado, marginRight: "3px" }}>$</span>
      <input
        data-campo-cifra={id}
        value={valor}
        onChange={(e) => onCambio(formatearCifra(e.target.value))}
        readOnly={bloqueado}
        inputMode="numeric"
        autoComplete="off"
        placeholder="0"
        aria-label={etiqueta}
        style={{
          flex: "1 1 auto", minWidth: 0, width: "100%", height: "100%", padding: 0, border: "none", outline: "none",
          background: "transparent", color: COLOR.blanco, fontSize: "14px", fontWeight: 700, ...CIFRA,
        }}
      />
    </div>
  );
}

function Colector({ lado, total }) {
  return (
    <div data-colector={lado} style={{
      padding: "7px 6px", borderRadius: "10px", textAlign: "center",
      background: `${COLOR_LADO[lado]}1A`, border: `1px solid ${COLOR_LADO[lado]}`,
    }}>
      <p style={{ margin: 0, fontFamily: SORA, fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", color: TONO_ROTULO[lado] }}>
        {lado === DEBE ? COLECTOR.debe : COLECTOR.haber}
      </p>
      <p data-total={lado} style={{ margin: "2px 0 0", ...CIFRA, fontSize: "13px", fontWeight: 700, color: COLOR.blanco, whiteSpace: "nowrap" }}>
        {pesos(total)}
      </p>
    </div>
  );
}

/* La mesa de dos columnas, su conector y (si está activa) el estante, sin montos. */
function Mesa({ mesa, onSacar, onCifra, onDevolver, activa, resultado, enEstante }) {
  const conValor = mesa.map((m) => ({ ...m, valor: leerCifra(m.texto) }));
  const t = totalesDe(conValor);
  const cierra = t.debe > 0 && t.debe === t.haber;
  const conError = resultado && (resultado.error === "B" || resultado.error === "C7");
  const columna = (lado) => (
    <div data-columna={lado} style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
      <Colector lado={lado} total={lado === DEBE ? t.debe : t.haber} />
      {mesa.filter((m) => m.lado === lado).map((m) => (
        <div key={m.cuenta} data-en-mesa={m.cuenta} style={{
          padding: "7px 6px", borderRadius: "11px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.14)",
          animation: "fae-b5k-entra 200ms ease-out both",
        }}>
          <p data-nombre-mesa style={{ margin: "0 0 5px", fontFamily: SORA, fontWeight: 700, fontSize: "11px", lineHeight: 1.25, color: COLOR.blanco, textAlign: "center" }}>{m.cuenta}</p>
          <Campo id={m.cuenta} valor={m.texto} onCambio={(v) => onCifra(m.cuenta, v)} bloqueado={!activa}
            etiqueta={`Valor de ${m.cuenta}`} error={conError && leerCifra(m.texto) !== resultado.esperado.find((e) => e.cuenta === m.cuenta)?.valor} />
          {activa && (
            <button type="button" data-devolver={m.cuenta} onClick={() => onDevolver(m.cuenta)} style={{
              display: "block", width: "100%", minHeight: "32px", marginTop: "3px", background: "none", border: "none", cursor: "pointer",
              color: COLOR.apagado, fontFamily: SORA, fontSize: "10px",
            }}>
              devolver al estante
            </button>
          )}
        </div>
      ))}
    </div>
  );
  return (
    <>
      <div data-mesa style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
        {columna(DEBE)}
        {columna(HABER)}
      </div>
      <div data-conector={cierra ? "cerrado" : "abierto"} style={{ margin: "10px 0 0", textAlign: "center" }}>
        <svg aria-hidden="true" viewBox="0 0 100 10" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "10px" }}>
          <line x1="18" y1="5" x2="82" y2="5" stroke={cierra ? FAE.teal : "rgba(248,249,250,0.35)"} strokeWidth="1.4" strokeLinecap="round"
            strokeDasharray={cierra ? undefined : "4 4"} vectorEffect="non-scaling-stroke" />
          {cierra && <circle cx="50" cy="5" r="2" fill={FAE.teal} vectorEffect="non-scaling-stroke" />}
        </svg>
        {!cierra && (t.debe > 0 || t.haber > 0) && (
          <p data-diferencia={Math.abs(t.debe - t.haber)} style={{ margin: "4px 0 0", ...CIFRA, fontSize: "11.5px", color: COLOR.apagado }}>
            {TEXTO_DIFERENCIA}: {pesos(Math.abs(t.debe - t.haber))}
          </p>
        )}
      </div>
      <p style={SOLO_LECTOR}>
        {cierra
          ? `El conector está cerrado: ${pesos(t.debe)} al debe contra ${pesos(t.haber)} al haber.`
          : `El conector está abierto. Debe ${pesos(t.debe)}, haber ${pesos(t.haber)}.`}
      </p>
      {activa && (
        <>
          <p style={{ margin: "14px 0 8px", fontFamily: SORA, fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em", color: COLOR.apagado }}>
            {ROTULO_ESTANTE}
          </p>
          <div data-estante style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {enEstante.map((c) => (
              <div key={c} data-en-estante={c} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span data-nombre-estante style={{ flex: "1 1 auto", minWidth: 0, fontFamily: INTER, fontSize: "12.5px", fontWeight: 600, lineHeight: 1.25, color: COLOR.blanco }}>{c}</span>
                {[DEBE, HABER].map((lado) => (
                  <button key={lado} type="button" data-sacar={`${c}:${lado}`} onClick={() => onSacar(c, lado)}
                    aria-label={`${c} ${lado === DEBE ? "al debe" : "al haber"}`}
                    style={{
                      flex: "none", minHeight: "40px", padding: "5px 8px", borderRadius: "8px", cursor: "pointer",
                      background: `${COLOR_LADO[lado]}14`, border: `1px solid ${COLOR_LADO[lado]}66`,
                      color: TONO_ROTULO[lado], fontFamily: SORA, fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.08em",
                    }}>
                    {lado === DEBE ? "AL DEBE" : "AL HABER"}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Retro({ resultado }) {
  return (
    <div data-retro aria-live="polite" aria-atomic="true">
      {resultado && (
        <div data-panel={resultado.ok ? "acierto" : "error"} data-error={resultado.error ?? "ninguno"} style={resultado.ok ? undefined : {
          marginTop: "12px", padding: "11px 13px", borderRadius: "11px", background: "rgba(231,111,81,0.13)", borderLeft: `3px solid ${CORAL}`,
        }}>
          <span style={SOLO_LECTOR}>{resultado.ok ? "Correcto." : "Incorrecto: "}</span>
          {resultado.texto && <p data-texto-retro style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{resultado.texto}</p>}
        </div>
      )}
    </div>
  );
}

const vacio = () => ({ mesa: [], resultado: null });

export default function CierreSantaPacha({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
  encima = null, onParteComprobada = null, onReiniciar = null,
}) {
  const t = useTanda(() => items ?? PARTES_T5_ACT2);
  const [s, setS] = useState(vacio);
  const [todos, setTodos] = useState([]);
  const tarjeta = useRef(null);
  const primeraVez = useRef(true);
  const parte = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuarT5Act2(todos, cuantas);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (primeraVez.current) { primeraVez.current = false; return; }
    if (!modoDemo) tarjeta.current?.focus({ preventScroll: false });
  }, [t.i]); // eslint-disable-line react-hooks/exhaustive-deps

  if (t.terminado) {
    const bien = todos.filter((x) => x.ok).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        {encima}
        <Cierre pct={Math.round(pct)} onReiniciar={() => { t.reiniciar(); setS(vacio()); setTodos([]); onReiniciar?.(); }} textoReiniciar="Otra vez">
          <p data-resumen-cierre style={TEXTO_CIERRE}>{RESUMEN_T5_ACT2(bien, cuantas)}</p>
        </Cierre>
      </Marco>
    );
  }

  const comprobada = Boolean(s.resultado);
  const enEstante = ESTANTE_T5_ACT2.filter((c) => !s.mesa.some((m) => m.cuenta === c));
  const sacar = (cuenta, lado) => setS((x) => (x.mesa.some((m) => m.cuenta === cuenta) ? x : { ...x, mesa: [...x.mesa, { cuenta, lado, texto: "" }] }));
  const cifra = (cuenta, texto) => setS((x) => ({ ...x, mesa: x.mesa.map((m) => (m.cuenta === cuenta ? { ...m, texto } : m)) }));
  const devolver = (cuenta) => setS((x) => ({ ...x, mesa: x.mesa.filter((m) => m.cuenta !== cuenta) }));

  const confirmar = () => {
    const puestas = s.mesa.map((m) => ({ cuenta: m.cuenta, lado: m.lado, valor: leerCifra(m.texto) }));
    const r = evaluarParteT5Act2(parte, puestas);
    t.anotar(parte.id, r.ok, r.ok ? null : r.error);
    setTodos((xs) => [...xs, { id: parte.id, ok: r.ok }]);
    /* Si falla, se revela lo correcto. */
    const mesa = r.ok ? s.mesa : r.esperado.map((e) => ({ cuenta: e.cuenta, lado: e.lado, texto: formatearCifra(String(e.valor)) }));
    setS({ mesa, resultado: r });
    onParteComprobada?.(parte, r);
  };
  const avanzar = () => {
    setS(vacio());
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const listo = s.mesa.length > 0 && s.mesa.every((m) => leerCifra(m.texto) !== null);

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <div className="fae-b5k" data-cierre-t5>
        {!modoDemo && <Encabezado objetivo={T5_ACT2.objetivo} consigna={T5_ACT2.consigna} onComoSeJuega={onComoSeJuega} />}
        {encima}
        {!modoDemo && (
          <div style={{ marginBottom: "12px" }}>
            <Pulsos total={cuantas} hechos={t.i + (comprobada ? 1 : 0)} enCurso={t.i + 1} etiqueta="Asiento" />
          </div>
        )}

        <div key={parte.id} data-tarjeta-parte={parte.id} style={{ padding: "11px 13px", borderRadius: "11px", background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${COLOR.neutro}` }}>
          <p ref={tarjeta} tabIndex={-1} data-hecho style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{parte.hecho}</p>
        </div>

        <section key={`${parte.id}-parte`} data-parte={parte.id} data-estado-parte={comprobada ? "comprobada" : "activa"}
          style={{ margin: "18px 0 0", padding: "12px 10px", borderRadius: "13px", border: `1px solid ${comprobada ? COLOR.quieto : COLOR.neutro}` }}>
          {(parte.rotulo || s.resultado?.ok) && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", margin: "0 0 8px" }}>
              {s.resultado?.ok && <Visto />}
              {parte.rotulo && (
                <div>
                  <p data-rotulo-parte style={{ margin: 0, fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: COLOR.blanco }}>{parte.rotulo}</p>
                  <p data-instruccion style={{ margin: "2px 0 0", fontFamily: INTER, fontSize: "13px", lineHeight: 1.45, color: COLOR.apagado }}>{parte.instruccion}</p>
                </div>
              )}
            </div>
          )}
          <Mesa mesa={s.mesa} activa={!comprobada} resultado={s.resultado} enEstante={enEstante}
            onSacar={sacar} onCifra={cifra} onDevolver={devolver} />
          <Retro resultado={s.resultado} />
          {!comprobada && (
            <>
              <BotonConfirmar deshabilitado={!listo} onClick={confirmar}>{TEXTO_CONFIRMAR}</BotonConfirmar>
              {!modoDemo && (
                <p data-un-intento style={{ margin: "9px 0 0", fontSize: "12px", lineHeight: 1.45, color: COLOR.apagado, textAlign: "center" }}>{AVISO_UN_INTENTO}</p>
              )}
            </>
          )}
        </section>

        {/* El ejemplo de «Así se juega» termina con su explicación. */}
        {comprobada && parte.resolucion && (
          <div data-resolucion style={{ margin: "14px 0 0", padding: "11px 13px", borderRadius: "11px", background: "rgba(184,196,212,0.13)", borderLeft: `3px solid ${COLOR.neutro}` }}>
            {parte.resolucion.map((linea) => (
              <p key={linea} style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{linea}</p>
            ))}
          </div>
        )}
      </div>

      {comprobada && !modoDemo && (
        <div data-boton-avanzar>
          <Responder onClick={avanzar}>{t.i + 1 === cuantas ? "Ver mi resumen" : "Siguiente asiento"}</Responder>
        </div>
      )}

      {!modoDemo && <p style={SOLO_LECTOR}>{ALT_T5_ACT2}</p>}
    </Marco>
  );
}

/* El botón de siempre, con su marca para el guion del tutorial. */
function BotonConfirmar({ deshabilitado, onClick, children }) {
  const caja = useRef(null);
  useLayoutEffect(() => { caja.current?.querySelector("button")?.setAttribute("data-confirmar-parte", "1"); });
  return <div ref={caja} data-confirmar-caja><Responder onClick={onClick} deshabilitado={deshabilitado}>{children}</Responder></div>;
}
