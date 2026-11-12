import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../../data/contabilidad.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { ROTULO_ESTANTE, COLECTOR, TEXTO_CONFIRMAR, TEXTO_DIFERENCIA, AVISO_UN_INTENTO } from "../../../../data/contabilidadAsientoCompuesto.js";
import {
  ACT7_T3, CASOS_ACT7, PASOS_ACT7, GYP, ROTULO_ASIENTO_1, ROTULO_ASIENTO_2, ROTULO_SALDO, RESUMEN_ACT7,
} from "../../../../data/contabilidadTema3Act7.js";
import {
  estanteDe, saldoDe, evaluarAsiento, evaluarSaldo, totalesDe, puntuarAct7, formatearCifra, leerCifra, esperadoDe, POR_CASO,
} from "../../../../contabilidad/elCierreCompleto.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { Relieve, CSS_RELIEVE, N1, N2 } from "./relieve.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 7 · EL CIERRE COMPLETO (paquete de Levi).
 *
 * El patrón de A7 del Tema 2 —el estante, la mesa de dos columnas con sus
 * colectores, el conector que cierra cuando los totales coinciden y un
 * campo de valor por cuenta— en un componente propio de Contabilidad, para
 * no tocar A7.
 *
 * Por caso, una pantalla con tres partes en secuencia: asiento 1, asiento 2
 * y el saldo. Cada parte se habilita cuando la anterior está comprobada.
 * Un intento por parte: si falla, se muestra el error de Gen y se revela lo
 * correcto para seguir. «Ganancias y pérdidas» está una sola vez en el
 * estante y se usa en los dos asientos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const CORAL = FAE.coral;
const CIFRA = { fontFamily: SORA, fontVariantNumeric: "tabular-nums" };

const CSS = `
@keyframes fae-a7c-entra { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.fae-a7c button { -webkit-tap-highlight-color: transparent; }
.fae-a7c button:focus-visible, .fae-a7c input:focus-visible { outline: 2px solid ${COLOR.blanco}; outline-offset: 2px; }
.fae-a7c input::placeholder { color: ${COLOR.apagado}; }
@media (prefers-reduced-motion: reduce) { .fae-a7c * { animation: none !important; transition: none !important; } }
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
    <div style={{
      display: "flex", alignItems: "center", height: "44px", boxSizing: "border-box", padding: "0 8px", borderRadius: "10px",
      background: "rgba(14,27,46,0.7)", border: `${error ? "2px" : "1px"} solid ${error ? CORAL : "rgba(248,249,250,0.22)"}`,
    }}>
      <span aria-hidden="true" style={{ fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: COLOR.apagado, marginRight: "3px" }}>$</span>
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

/* El colector de una columna (A7): su rótulo y el total que suma. */
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

/*
 * EL RENGLÓN DEL ESTANTE (volumen, delta de Itagaki §2;
 * orquestador/revisiones/volumen/e-volumen-forma-v1-delta.md).
 *
 *   relleno 4 arriba y abajo · nombre (el resto: 106 px a 320, 161 a 375) ·
 *   8 · botones en 122 px: «Al debe» 56 · 4 · «Al haber» 62
 *
 * El delta suponía un estante de 258 a 320, y dentro de su sección mide 236
 * (medido). Con sus 6 px a los lados y sus botones de 59 · 6 · 66, el nombre
 * quedaba en 85 y «computación» y «mantenimiento» (88,6 y 101 en Inter
 * 14/600) se salían de su caja. Para devolverle al nombre los ~107 px que
 * pedía el delta: sin relleno a los lados (el renglón no tiene fondo; así el
 * nombre arranca alineado con el rótulo del estante) y los botones en la
 * dirección del arreglo del propio delta, «Al debe» a 56 (47,7 de texto) y
 * «Al haber» a 62 (52,5 de texto), con 4 entre los dos. «Devolver al
 * estante» (111,1 de texto en Inter 12/600) cabe en los 122.
 *
 * Cada botón es una cara N2 + filo de 44 px sobre canto N1 de 4 (E2): el
 * bloque mide 48 y el renglón, 56 como mínimo. El hover sube la cara 2 px
 * más y el relleno de arriba lo absorbe. Texto #F8F9FA, sin teal ni ámbar:
 * el lado lo dicen la palabra y el orden (el debe a la izquierda).
 *
 * La cuenta que ya está en la mesa no sale del estante: en su renglón, en el
 * mismo hueco de 131 px, «Devolver al estante» (letra 12, cara de 44). Así no
 * cambia el orden del estante y ya no hay botón de 32 px con letra de 10.
 *
 * El saldo publicado sigue debajo del nombre (Sora 12/16): el renglón crece
 * con él, máx(nombre + saldo + 8, 56).
 */
const ANCHO_BOTONES = 122;
const ANCHO_DEBE = 56;
const ANCHO_HABER = 62;
const RENGLON = { display: "flex", gap: "8px", alignItems: "center", boxSizing: "border-box", minHeight: "56px", padding: "4px 0" };

function BotonEstante({ ancho, letra, datos, etiqueta, onClick, children }) {
  return (
    <Relieve e={4} canto={N1} filo radio="10px" style={{ flex: "none", width: `${ancho}px` }}>
      <button type="button" className="fae-rel-cara" {...datos} onClick={onClick} aria-label={etiqueta} style={{
        display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "44px", boxSizing: "border-box",
        padding: "0 4px", borderRadius: "10px", border: "none", background: N2, cursor: "pointer", touchAction: "manipulation",
        color: COLOR.blanco, fontFamily: INTER, fontSize: `${letra}px`, lineHeight: "16px", fontWeight: 600, whiteSpace: "nowrap",
      }}>
        {children}
      </button>
    </Relieve>
  );
}

/* Un asiento: la mesa de dos columnas, su conector y (si está activo) el estante. */
function Asiento({ parte, caso, mesa, onSacar, onCifra, onDevolver, activo, resultado, enEstante }) {
  const conValor = mesa.map((m) => ({ ...m, valor: leerCifra(m.texto) }));
  const t = totalesDe(conValor);
  const cierra = t.debe > 0 && t.debe === t.haber;
  const columna = (lado) => (
    <div data-columna={lado} style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
      <Colector lado={lado} total={lado === DEBE ? t.debe : t.haber} />
      {mesa.filter((m) => m.lado === lado).map((m) => (
        <div key={m.cuenta} data-en-mesa={`${parte}:${m.cuenta}`} style={{
          padding: "7px 6px", borderRadius: "11px", background: "rgba(10,20,34,0.45)", border: "1px solid rgba(248,249,250,0.14)",
          animation: "fae-a7c-entra 200ms ease-out both",
        }}>
          <p style={{ margin: "0 0 5px", fontFamily: SORA, fontWeight: 700, fontSize: "11px", lineHeight: 1.25, color: COLOR.blanco, textAlign: "center" }}>{m.cuenta}</p>
          <Campo id={`${parte}:${m.cuenta}`} valor={m.texto} onCambio={(v) => onCifra(m.cuenta, v)} bloqueado={!activo}
            etiqueta={`Valor de ${m.cuenta}`} error={resultado?.error === "B" && leerCifra(m.texto) !== resultado.esperado.find((e) => e.cuenta === m.cuenta)?.valor} />
          {/* «Devolver al estante» ya no va aquí (32 px, letra de 10): va en el renglón del estante (delta de volumen §2). */}
        </div>
      ))}
    </div>
  );
  return (
    <>
      <div data-mesa={parte} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
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
      {activo && (
        <>
          <p style={{ margin: "14px 0 8px", fontFamily: SORA, fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em", color: COLOR.apagado }}>
            {ROTULO_ESTANTE}
          </p>
          <div data-estante={parte} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {enEstante.map((c) => {
              const saldo = saldoDe(caso, c);
              const puesta = mesa.find((m) => m.cuenta === c);
              return (
                <div key={c} data-en-estante={c} data-puesta={puesta ? puesta.lado : undefined} style={RENGLON}>
                  <span data-nombre-estante style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontFamily: INTER, fontSize: "14px", lineHeight: "20px", fontWeight: 600, color: COLOR.blanco }}>{c}</span>
                    {saldo !== null && <span data-saldo-estante style={{ ...CIFRA, fontSize: "12px", lineHeight: "16px", color: COLOR.apagado }}>{pesos(saldo)}</span>}
                  </span>
                  <span data-botones-estante style={{ flex: "none", width: `${ANCHO_BOTONES}px`, display: "flex", gap: "4px" }}>
                    {puesta ? (
                      <BotonEstante ancho={ANCHO_BOTONES} letra={12} datos={{ "data-devolver": `${parte}:${c}` }}
                        etiqueta={`Devolver ${c} al estante`} onClick={() => onDevolver(c)}>
                        Devolver al estante
                      </BotonEstante>
                    ) : [DEBE, HABER].map((lado) => (
                      <BotonEstante key={lado} ancho={lado === DEBE ? ANCHO_DEBE : ANCHO_HABER} letra={13} datos={{ "data-sacar": `${c}:${lado}` }}
                        etiqueta={`${c} ${lado === DEBE ? "al debe" : "al haber"}`} onClick={() => onSacar(c, lado)}>
                        {lado === DEBE ? "Al debe" : "Al haber"}
                      </BotonEstante>
                    ))}
                  </span>
                </div>
              );
            })}
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

const vacio = () => ({ parte: 1, mesas: { 1: [], 2: [] }, saldo: "", resultados: {} });

export default function ElCierreCompleto({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const t = useTanda(() => items ?? CASOS_ACT7);
  const [s, setS] = useState(vacio);
  const [todos, setTodos] = useState([]);
  const tarjeta = useRef(null);
  const primeraVez = useRef(true);
  const caso = t.items[t.i];
  const cuantos = t.items.length;
  const totalPartes = cuantos * POR_CASO;
  const pct = puntuarAct7(todos, totalPartes);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => {
    if (primeraVez.current) { primeraVez.current = false; return; }
    if (!modoDemo) tarjeta.current?.focus({ preventScroll: false });
  }, [t.i]);

  if (t.terminado) {
    const bien = todos.filter((x) => x.ok).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={() => { t.reiniciar(); setS(vacio()); setTodos([]); }} textoReiniciar="Otra vez">
          <p data-resumen-act7 style={TEXTO_CIERRE}>{RESUMEN_ACT7(bien, totalPartes)}</p>
        </Cierre>
      </Marco>
    );
  }

  /*
   * El estante: sin lo que ya se cerró en el asiento 1. Lo que está en la mesa
   * activa se queda en su renglón, con «Devolver al estante» (delta §2).
   */
  const cerradas = s.resultados[1] ? esperadoDe(caso, 1).map((e) => e.cuenta).filter((c) => c !== GYP) : [];
  const enEstanteDe = () => estanteDe(caso).filter((c) => !cerradas.includes(c));

  const cambiarMesa = (parte, f) => setS((x) => ({ ...x, mesas: { ...x.mesas, [parte]: f(x.mesas[parte]) } }));
  const sacar = (parte) => (cuenta, lado) => cambiarMesa(parte, (m) => (m.some((x) => x.cuenta === cuenta) ? m : [...m, { cuenta, lado, texto: "" }]));
  const cifra = (parte) => (cuenta, texto) => cambiarMesa(parte, (m) => m.map((x) => (x.cuenta === cuenta ? { ...x, texto } : x)));
  const devolver = (parte) => (cuenta) => cambiarMesa(parte, (m) => m.filter((x) => x.cuenta !== cuenta));

  const anotar = (parte, r) => {
    t.anotar(`${caso.id}:${parte}`, r.ok, r.ok ? null : r.error);
    setTodos((xs) => [...xs, { id: `${caso.id}:${parte}`, ok: r.ok }]);
  };
  const comprobarAsiento = (parte) => {
    const puestas = s.mesas[parte].map((m) => ({ cuenta: m.cuenta, lado: m.lado, valor: leerCifra(m.texto) }));
    const r = evaluarAsiento(caso, parte, puestas);
    anotar(parte, r);
    /* Si falla, se revela lo correcto para seguir. */
    const mesa = r.ok ? s.mesas[parte] : r.esperado.map((e) => ({ cuenta: e.cuenta, lado: e.lado, texto: formatearCifra(String(e.valor)) }));
    setS((x) => ({ ...x, parte: parte + 1, mesas: { ...x.mesas, [parte]: mesa }, resultados: { ...x.resultados, [parte]: r } }));
  };
  const comprobarSaldo = () => {
    const r = evaluarSaldo(caso, leerCifra(s.saldo));
    anotar(3, r);
    setS((x) => ({ ...x, parte: 4, saldo: r.ok ? x.saldo : formatearCifra(String(caso.saldo)), resultados: { ...x.resultados, 3: r } }));
  };
  const avanzar = () => {
    setS(vacio());
    if (t.i + 1 < cuantos) t.setI(t.i + 1);
    else t.setTerminado(true);
  };

  const listoAsiento = (parte) => s.mesas[parte].length > 0 && s.mesas[parte].every((m) => leerCifra(m.texto) !== null);
  const encabezadoParte = (n, rotuloParte) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", margin: "0 0 8px" }}>
      {s.resultados[n]?.ok && <Visto />}
      <div>
        <p style={{ margin: 0, fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: s.parte >= n ? COLOR.blanco : COLOR.apagado }}>{rotuloParte}</p>
        <p style={{ margin: "2px 0 0", fontFamily: INTER, fontSize: "13px", lineHeight: 1.45, color: COLOR.apagado }}>{PASOS_ACT7[n - 1]}</p>
      </div>
    </div>
  );
  const seccion = (n) => ({
    "data-parte": n,
    "data-estado-parte": s.parte === n ? "activa" : s.parte > n ? "comprobada" : "bloqueada",
    "aria-disabled": s.parte < n ? "true" : undefined,
    style: { margin: "18px 0 0", padding: "12px 10px", borderRadius: "13px", border: `1px solid ${s.parte === n ? COLOR.neutro : COLOR.quieto}`, opacity: s.parte < n ? 0.6 : 1 },
  });

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <style>{CSS_RELIEVE}</style>
      <div className="fae-a7c" data-act7>
        {!modoDemo && (
          <>
            <Encabezado consigna={ACT7_T3.consigna} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={cuantos} hechos={t.i + (s.parte > 3 ? 1 : 0)} enCurso={t.i + 1} etiqueta="Caso" />
            </div>
          </>
        )}

        <div key={caso.id} data-tarjeta-caso={caso.id} style={{ padding: "11px 13px", borderRadius: "11px", background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${COLOR.neutro}` }}>
          {caso.empresa && (
            <p ref={tarjeta} tabIndex={-1} data-empresa style={{ margin: 0, fontFamily: INTER, fontSize: "13px", color: COLOR.apagado, display: "flex", flexWrap: "wrap", columnGap: "5px" }}>
              <span>Empresa:</span><strong style={{ color: COLOR.blanco, fontWeight: 700 }}>{caso.empresa}</strong>
            </p>
          )}
          {caso.hecho && <p data-hecho style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{caso.hecho}</p>}
          {caso.pie && <p data-pie style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>{caso.pie}</p>}
        </div>

        {[[1, ROTULO_ASIENTO_1], [2, ROTULO_ASIENTO_2]].map(([n, rot]) => (
          <section key={`${caso.id}-${n}`} {...seccion(n)}>
            {encabezadoParte(n, rot)}
            {s.parte >= n && (
              <>
                <Asiento parte={n} caso={caso} mesa={s.mesas[n]} activo={s.parte === n} resultado={s.resultados[n]}
                  enEstante={enEstanteDe(n)} onSacar={sacar(n)} onCifra={cifra(n)} onDevolver={devolver(n)} />
                <Retro resultado={s.resultados[n]} />
                {s.parte === n && (
                  <>
                    <div data-confirmar-caja={n}>
                      <BotonParte n={n} deshabilitado={!listoAsiento(n)} onClick={() => comprobarAsiento(n)}>{TEXTO_CONFIRMAR}</BotonParte>
                    </div>
                    {!modoDemo && (
                      <p data-un-intento style={{ margin: "9px 0 0", fontSize: "12px", lineHeight: 1.45, color: COLOR.apagado, textAlign: "center" }}>{AVISO_UN_INTENTO}</p>
                    )}
                  </>
                )}
              </>
            )}
          </section>
        ))}

        <section {...seccion(3)}>
          {encabezadoParte(3, ROTULO_SALDO)}
          {s.parte >= 3 && (
            <>
              <Campo id="saldo" valor={s.saldo} onCambio={(v) => setS((x) => ({ ...x, saldo: v }))} bloqueado={s.parte !== 3}
                etiqueta={ROTULO_SALDO} error={s.resultados[3]?.error === "B"} />
              <Retro resultado={s.resultados[3]} />
              {s.parte === 3 && (
                <BotonParte n={3} deshabilitado={leerCifra(s.saldo) === null} onClick={comprobarSaldo}>Comprobar</BotonParte>
              )}
            </>
          )}
        </section>

        {/* El tutorial termina con la resolución de Gen. */}
        {s.parte > 3 && caso.resolucion && (
          <p data-resolucion style={{ margin: "14px 0 0", padding: "11px 13px", borderRadius: "11px", background: "rgba(184,196,212,0.13)", borderLeft: `3px solid ${COLOR.neutro}`, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>
            {caso.resolucion}
          </p>
        )}
      </div>

      {s.parte > 3 && !modoDemo && (
        <Responder onClick={avanzar}>{t.i + 1 === cuantos ? "Ver mi resumen" : "Siguiente caso"}</Responder>
      )}
    </Marco>
  );
}

/* El botón de siempre, con su marca para el guion del tutorial. */
function BotonParte({ n, deshabilitado, onClick, children }) {
  const caja = useRef(null);
  useLayoutEffect(() => { caja.current?.querySelector("button")?.setAttribute("data-confirmar-parte", String(n)); });
  return <div ref={caja}><Responder onClick={onClick} deshabilitado={deshabilitado}>{children}</Responder></div>;
}
