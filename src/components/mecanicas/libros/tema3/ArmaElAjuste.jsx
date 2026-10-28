import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { DEBE, HABER, COLOR_LADO, pesos } from "../../../../data/contabilidad.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import { ROTULO_BANCO, ROTULO_FICHAS, TEXTO_CONFIRMAR } from "../../../../data/contabilidadArmaElAsiento.js";
import { ACT4_T3, ITEMS_ACT4 } from "../../../../data/contabilidadTema3Act4.js";
import { ACT5_T3, ITEMS_ACT5 } from "../../../../data/contabilidadTema3Act5.js";
import {
  cuentasDe, universoDe, bancoDe, evaluarAct4, evaluarAct5, puntuar, TIPOS_ACT4, TIPOS_ACT5,
} from "../../../../contabilidad/armaElAjuste.js";
import { formatearCampo, valorDeCampo } from "../../../../contabilidad/queLeToca.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";
import { TONO_ROTULO } from "../debeHaber/piezasDebeHaber.jsx";
import { partirPorFrases } from "../ElAsientoSimple.jsx";
import { Relieve, CSS_RELIEVE, N2, HUNDIDO, DESTINO_REPOSO, DESTINO_DISPONIBLE, SECUNDARIO_N2 } from "./relieve.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACTS. 4 Y 5 · ARMA EL AJUSTE (acumulado y diferido).
 *
 * El patrón de A6 del Tema 2, en un componente propio de Contabilidad para no
 * tocar A6 ni A7: el hecho arriba, dos cuentas T sin nombre, un banco de
 * nombres y las fichas de valor. Al confirmar se encienden SIEMPRE las tres
 * señales: el arco del cuadre, el ▲ con su flecha y el anclaje al hecho.
 *
 * Act. 4: el valor viene puesto en las fichas.
 * Act. 5: cada cuenta lleva su campo (el de A7) y el estudiante escribe el
 * valor; la ficha lleva al lado lo que escribió. El arco queda abierto si los
 * dos montos no coinciden. Gen no trajo texto para dos fichas del mismo lado
 * en esta actividad: una cuenta no puede ocupar el lado que ya tiene la otra.
 *
 * Teal y ámbar solo dentro del asiento (las cuentas T, sus lados y el arco);
 * coral solo en el error.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const CORAL = FAE.coral;
const BANDA = 30;
const MS_ANCLAJE = 1400;
/* Los dos textos de ayuda son los de A6. */
const AYUDA_NOMBRE = "Toca un nombre y después la cuenta donde va.";
const AYUDA_VALOR = "Toca el valor y después el lado de su cuenta.";

const CSS = `
@keyframes fae-aj-traza { from { stroke-dashoffset: 260; } to { stroke-dashoffset: 0; } }
.fae-aj-ancla { stroke-dasharray: 260; animation: fae-aj-traza 500ms ease-out both; }
/* Volumen (#5): la ficha que llega baja de su elevación a E0, solo con transform, en 160 ms. */
@keyframes fae-aj-cae { from { transform: translateY(-4px); } to { transform: none; } }
.fae-aj-cae { animation: fae-aj-cae 160ms cubic-bezier(.3,.9,.4,1) both; }
@keyframes fae-aj-fundido { from { opacity: 0; } to { opacity: 1; } }
.fae-aj button { -webkit-tap-highlight-color: transparent; }
.fae-aj button:focus-visible, .fae-aj input:focus-visible { outline: 2px solid ${COLOR.blanco}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .fae-aj * { animation: none !important; transition: none !important; }
  .fae-aj-ancla { stroke-dashoffset: 0 !important; }
}
`;

const ACTIVIDADES = {
  [ACT4_T3.id]: { act: ACT4_T3, banco: ITEMS_ACT4, tipos: TIPOS_ACT4, evaluar: evaluarAct4, conCampo: false },
  [ACT5_T3.id]: { act: ACT5_T3, banco: ITEMS_ACT5, tipos: TIPOS_ACT5, evaluar: evaluarAct5, conCampo: true },
};

const vacia = () => ({ cuenta: null, lado: null, texto: "" });

/* ═══════════ UNA CUENTA T ═══════════ */
function CuentaT({
  indice, fila, valorFicha, info, senales, estado, destinoNombre, destinoLados, ladoOcupado,
  onNombre, onLado, onQuitarNombre, onQuitarLado, refT, conCampo, onTexto, bloqueada, valorOk,
}) {
  const columna = (cual) => {
    const conFicha = fila.lado === cual;
    const activa = destinoLados && !fila.lado && ladoOcupado !== cual;
    const triangulo = senales && info?.creceP === cual;
    return (
      <button
        key={cual}
        type="button"
        className="fae-destino"
        data-columna={cual}
        data-destino={activa ? `${indice}:${cual}` : undefined}
        disabled={!activa && !(conFicha && !bloqueada)}
        onClick={() => (conFicha ? onQuitarLado() : onLado(cual))}
        aria-label={conFicha
          ? `Quitar el valor del ${cual === DEBE ? "debe" : "haber"} de ${fila.cuenta}`
          : `Poner el valor en el ${cual === DEBE ? "debe" : "haber"} de ${fila.cuenta ?? "esta cuenta"}`}
        style={{
          flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "3px",
          padding: "5px 3px", borderRadius: "9px", minHeight: "84px",
          /* Volumen (#5): destino hundido. Un escalón más oscuro (#0D1725), sin canto; #CBDCF2 cuando espera la ficha. */
          background: HUNDIDO,
          border: `1px solid ${activa ? DESTINO_DISPONIBLE : DESTINO_REPOSO}`,
          cursor: activa || (conFicha && !bloqueada) ? "pointer" : "default",
        }}
      >
        <span aria-hidden="true" style={{ height: "12px", lineHeight: "12px", fontSize: "10px", color: COLOR_LADO[cual] }}>
          {triangulo && <span data-triangulo={cual}>▲</span>}
          {triangulo && <span data-flecha={info.sube ? "sube" : "baja"}>{info.sube ? " ↑" : " ↓"}</span>}
        </span>
        {triangulo && <span style={SOLO_LECTOR}>{`Esta cuenta crece por aquí, y este hecho la hace ${info.sube ? "crecer" : "decrecer"}.`}</span>}
        <span data-rotulo={cual} style={{ fontFamily: SORA, fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", color: TONO_ROTULO[cual], textAlign: "center" }}>
          {cual === DEBE ? "DEBE" : "HABER"}
        </span>
        <span style={{ flex: 1 }} />
        {conFicha
          ? (
            <span data-valor={cual} className="fae-aj-cae" style={{
              display: "block", padding: "8px 2px", borderRadius: "8px", boxSizing: "border-box",
              /* La ficha ya puesta: N2 sin filo, en E0. El lado lo dicen la palabra y la posición, no el teal. */
              background: N2, border: "1px solid transparent",
              fontFamily: SORA, fontSize: valorFicha.length > 8 ? "10.5px" : "12px", fontWeight: 700,
              color: COLOR.blanco, textAlign: "center", whiteSpace: "nowrap",
              width: "max-content", minWidth: "100%", alignSelf: "center",
            }}>
              {valorFicha}
            </span>
          )
          : <span data-vacia aria-hidden="true" style={{ display: "block", padding: "8px 2px", fontSize: "12px", color: COLOR.apagado, textAlign: "center" }}>—</span>}
      </button>
    );
  };

  const borde = estado === "correcta" ? FAE.text : estado === "incorrecta" ? CORAL : "rgba(248,249,250,0.14)";
  return (
    <div ref={refT} data-cuenta-t={indice} data-cuenta={fila.cuenta ?? undefined} data-estado-t={estado ?? undefined} style={{
      flex: "1 1 0", minWidth: 0, padding: "9px 7px", borderRadius: "13px",
      background: "rgba(10,20,34,0.45)", border: `1px solid ${borde}`,
    }}>
      {fila.cuenta
        ? (
          <button
            type="button"
            data-nombre-puesto={fila.cuenta}
            disabled={bloqueada}
            onClick={onQuitarNombre}
            aria-label={bloqueada ? fila.cuenta : `${fila.cuenta}. Tócala para quitarla.`}
            style={{
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
              width: "100%", minHeight: "44px", margin: "0 0 6px", padding: "2px", background: N2, border: "none", borderRadius: "8px",
              fontFamily: SORA, fontWeight: 700, fontSize: "11.5px", lineHeight: 1.25, color: COLOR.blanco, textAlign: "center",
              cursor: bloqueada ? "default" : "pointer",
            }}
          >
            {fila.cuenta}
          </button>
        )
        : (
          <button
            type="button"
            className="fae-destino"
            data-destino={destinoNombre ? `nombre:${indice}` : undefined}
            disabled={!destinoNombre}
            onClick={onNombre}
            aria-label={`Poner un nombre en la cuenta ${indice + 1}`}
            style={{
              display: "block", width: "100%", minHeight: "44px", margin: "0 0 6px", borderRadius: "8px",
              background: HUNDIDO,
              border: `1px solid ${destinoNombre ? DESTINO_DISPONIBLE : DESTINO_REPOSO}`,
              color: COLOR.apagado, fontFamily: SORA, fontSize: "10.5px", cursor: destinoNombre ? "pointer" : "default",
            }}
          >
            sin nombre
          </button>
        )}
      {/*
        * `fae-t-apila` (global.css): a 320 px la ficha de FP tapaba el destino
        * «HABER», y la ficha no puede apartarse sin quedar bajo el piso de
        * toque. Apiladas, cada destino ocupa el ancho de la fila y el hueco
        * deja de ser el problema. A 375 siguen lado a lado.
        */}
      <div className="fae-t-apila" style={{ display: "flex", gap: "5px", borderTop: "1px solid rgba(248,249,250,0.22)", paddingTop: "7px" }}>
        {columna(DEBE)}
        <div aria-hidden="true" style={{ width: "1px", background: "rgba(248,249,250,0.22)" }} />
        {columna(HABER)}
      </div>
      {/* Act. 5: el campo de valor de esta cuenta (el de A7), a todo el ancho de la T. */}
      {conCampo && fila.cuenta && (
        <div style={{
          display: "flex", alignItems: "center", marginTop: "8px", height: "44px", boxSizing: "border-box", padding: "0 8px",
          borderRadius: "10px", background: "rgba(14,27,46,0.7)",
          border: `${valorOk === false ? "2px" : "1px"} solid ${valorOk === false ? CORAL : "rgba(248,249,250,0.22)"}`,
        }}>
          <span aria-hidden="true" style={{ fontFamily: SORA, fontSize: "14px", fontWeight: 700, color: COLOR.apagado, marginRight: "3px" }}>$</span>
          <input
            data-campo-valor={indice}
            value={fila.texto}
            onChange={(e) => onTexto(formatearCampo(e.target.value))}
            readOnly={bloqueada}
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            aria-label={`Valor de ${fila.cuenta}`}
            aria-invalid={valorOk === false ? "true" : undefined}
            style={{
              flex: "1 1 auto", minWidth: 0, width: "100%", height: "100%", padding: 0, border: "none", outline: "none",
              background: "transparent", color: COLOR.blanco, fontFamily: SORA, fontSize: "14px", fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════ LA MECÁNICA ═══════════ */
function ArmaElAjuste({
  actividadId, Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const cfg = ACTIVIDADES[actividadId];
  const universo = useMemo(() => universoDe([...cfg.banco, ...(items ?? [])]), [cfg, items]);
  const t = useTanda(() => (items ?? cfg.banco).map((it) => ({ it, banco: bancoDe(it, universo, modoDemo ? (x) => x : barajar) })));
  const [filas, setFilas] = useState([vacia(), vacia()]);
  const [tomada, setTomadaEstado] = useState(null);
  /*
   * Lo tomado también vive en una referencia que cambia en el acto: dos
   * toques seguidos (el guion del tutorial con movimiento reducido, o un dedo
   * rápido) no pueden leer la ficha del toque anterior antes de que se pinte.
   */
  const tomadaYa = useRef(null);
  const setTomada = (v) => {
    const nuevo = typeof v === "function" ? v(tomadaYa.current) : v;
    tomadaYa.current = nuevo;
    setTomadaEstado(nuevo);
  };
  const [r, setR] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [curvas, setCurvas] = useState([]);
  const [curvasVivas, setCurvasVivas] = useState(false);
  const [reducido, setReducido] = useState(false);
  const reloj = useRef(null);
  const lienzo = useRef(null);
  const refsT = [useRef(null), useRef(null)];
  const refsChip = useRef({});
  const tarjeta = useRef(null);
  const primeraVez = useRef(true);

  const actual = t.items[t.i];
  const it = actual?.it;
  const cuantos = t.items.length;
  const pct = puntuar(respuestas, cuantos);
  const cuentas = useMemo(() => (it ? cuentasDe(it, cfg.tipos) : []), [it, cfg]);

  useEffect(() => {
    try { setReducido(Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches)); } catch { /* sin matchMedia */ }
  }, []);
  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => () => clearTimeout(reloj.current), []);
  useEffect(() => {
    if (primeraVez.current) { primeraVez.current = false; return; }
    if (!modoDemo) tarjeta.current?.focus({ preventScroll: false });
  }, [t.i]);

  /* Las curvas al hecho se miden, no se adivinan (como en A6). */
  useLayoutEffect(() => {
    if (!r) { setCurvas([]); return; }
    const caja = lienzo.current?.getBoundingClientRect();
    if (!caja) return;
    const trazos = [];
    filas.forEach((f, i) => {
      const frase = f.cuenta ? it.anclajes[f.cuenta] : null;
      const chip = frase ? refsChip.current[frase] : null;
      const t0 = refsT[i].current;
      if (!chip || !t0) return;
      const c = chip.getBoundingClientRect();
      const b = t0.getBoundingClientRect();
      trazos.push({ cuenta: f.cuenta, x1: b.left + b.width / 2 - caja.left, y1: b.top - caja.top, x2: c.left + c.width / 2 - caja.left, y2: c.bottom - caja.top });
    });
    setCurvas(trazos);
    setCurvasVivas(true);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setCurvasVivas(false), reducido ? 1 : MS_ANCLAJE);
  }, [r]); // eslint-disable-line react-hooks/exhaustive-deps

  const evaluado = Boolean(r);
  const nombradas = filas.every((f) => f.cuenta);
  const completo = filas.every((f) => f.cuenta && f.lado && (!cfg.conCampo || valorDeCampo(f.texto) !== null));
  const cambiar = (i, cambio) => setFilas((xs) => xs.map((f, k) => (k === i ? { ...f, ...cambio } : f)));

  const tocarNombre = (c) => { if (!evaluado) setTomada((x) => (x === c ? null : c)); };
  const ponerNombre = (i) => {
    const elegida = tomadaYa.current;
    if (evaluado || !elegida || elegida.startsWith("valor:")) return;
    cambiar(i, { cuenta: elegida });
    setTomada(null);
  };
  const ponerLado = (i, lado) => {
    if (evaluado || tomadaYa.current !== `valor:${i}`) return;
    cambiar(i, { lado });
    setTomada(null);
  };

  const confirmar = () => {
    if (evaluado || !completo) return;
    const puestas = filas.map((f) => ({ cuenta: f.cuenta, lado: f.lado, valor: cfg.conCampo ? valorDeCampo(f.texto) : it.valor }));
    const nuevo = cfg.evaluar(it, puestas);
    t.anotar(it.id, nuevo.ok, nuevo.ok ? null : nuevo.caso);
    setRespuestas((xs) => [...xs, { id: it.id, ok: nuevo.ok }]);
    setR(nuevo);
    setTomada(null);
  };
  const limpiar = () => { setR(null); setFilas([vacia(), vacia()]); setTomada(null); setCurvas([]); clearTimeout(reloj.current); };
  const avanzar = () => {
    limpiar();
    if (t.i + 1 < cuantos) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => { t.reiniciar(); limpiar(); setRespuestas([]); };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.ok).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra vez">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantos} al primer intento. Cada ítem valía {(100 / cuantos).toFixed(2)} %.
          </p>
        </Cierre>
      </Marco>
    );
  }

  const trozos = partirPorFrases(it.hecho, r ? r.frases : []);
  const infoDe = (f) => cuentas.find((c) => c.cuenta === f.cuenta) ?? null;
  const estadoDe = (f) => {
    if (!r || !f.cuenta) return null;
    const real = r.real.get(f.cuenta);
    return real && real === f.lado ? "correcta" : "incorrecta";
  };
  const fichaDe = (f) => (cfg.conCampo ? (f.texto ? `$${f.texto}` : "$") : pesos(it.valor));

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <style>{CSS_RELIEVE}</style>
      <div className="fae-aj" data-arma-ajuste={actividadId}>
        {!modoDemo && (
          <>
            <Encabezado consigna={cfg.act.consigna} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Ítem" />
            </div>
          </>
        )}

        <div ref={lienzo} style={{ position: "relative" }}>
          {/* La tarjeta del hecho: empresa, hecho de Gen (con los anclajes, al confirmar) y pie. */}
          <div key={it.id} data-tarjeta-hecho={it.id} style={{
            padding: "11px 13px", borderRadius: "11px",
            background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${COLOR.neutro}`,
            animation: modoDemo ? undefined : "fae-aj-fundido 150ms ease-out both",
          }}>
            {it.empresa && (
              <p ref={tarjeta} tabIndex={-1} data-empresa style={{
                margin: "0 0 4px", fontFamily: INTER, fontSize: "13px", color: COLOR.apagado, display: "flex", flexWrap: "wrap", columnGap: "5px",
              }}>
                <span>Empresa:</span><strong style={{ color: COLOR.blanco, fontWeight: 700 }}>{it.empresa}</strong>
              </p>
            )}
            <p data-hecho style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>
              {trozos.map((x, k) => (x.frase
                ? (
                  <span key={`${x.frase}-${k}`} data-frase={x.frase} ref={(el) => { if (el) refsChip.current[x.frase] = el; }}
                    style={{ padding: "1px 4px", borderRadius: "5px", background: COLOR.neutro, color: COLOR.navy, fontWeight: 700 }}>
                    {x.texto}
                  </span>
                )
                : <span key={k}>{x.texto}</span>))}
            </p>
            {it.pie && <p data-pie style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>{it.pie}</p>}
          </div>

          {/* La franja por la que van las curvas. */}
          <div aria-hidden="true" style={{ height: `${BANDA}px` }} />

          <div data-mesa style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
            {filas.map((f, i) => (
              <CuentaT
                key={i}
                indice={i}
                refT={refsT[i]}
                fila={f}
                valorFicha={fichaDe(f)}
                info={infoDe(f)}
                senales={evaluado && Boolean(infoDe(f))}
                estado={estadoDe(f)}
                destinoNombre={!evaluado && !f.cuenta && tomada != null && !tomada.startsWith("valor:")}
                destinoLados={!evaluado && Boolean(f.cuenta) && tomada === `valor:${i}`}
                ladoOcupado={cfg.conCampo ? filas[1 - i].lado : null}
                bloqueada={evaluado}
                conCampo={cfg.conCampo}
                valorOk={r && cfg.conCampo ? r.valoresOk[i] : null}
                onNombre={() => ponerNombre(i)}
                onLado={(lado) => ponerLado(i, lado)}
                onQuitarNombre={() => { if (!evaluado) cambiar(i, { cuenta: null, lado: null }); }}
                onQuitarLado={() => { if (!evaluado) cambiar(i, { lado: null }); }}
                onTexto={(texto) => { if (!evaluado) cambiar(i, { texto }); }}
              />
            ))}
          </div>

          {/* Las curvas al hecho: dibujo, no controles. */}
          {evaluado && curvasVivas && (
            <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
              {curvas.map((c) => (
                <path key={c.cuenta} data-ancla={c.cuenta} className={reducido ? undefined : "fae-aj-ancla"}
                  d={`M ${c.x1} ${c.y1} C ${c.x1} ${c.y1 - BANDA * 0.7}, ${c.x2} ${c.y2 + BANDA * 0.7}, ${c.x2} ${c.y2}`}
                  fill="none" stroke={COLOR.neutro} strokeWidth="1.4" strokeLinecap="round" />
              ))}
            </svg>
          )}
        </div>

        {/* El arco del cuadre, entre las dos cuentas. */}
        {evaluado && (
          <svg data-arco={r.cuadra ? "cerrado" : "abierto"} aria-hidden="true" viewBox="0 0 100 16" preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: "16px", marginTop: "4px", overflow: "visible", animation: "fae-aj-fundido 300ms ease-out both" }}>
            <path d={r.cuadra ? "M 25 0 Q 50 16 75 0" : "M 25 0 Q 42 14 48 6"} fill="none" stroke={r.cuadra ? FAE.teal : CORAL}
              strokeWidth="1.1" strokeLinecap="round" strokeDasharray={r.cuadra ? undefined : "3 3"} vectorEffect="non-scaling-stroke" />
            {!r.cuadra && <path d="M 75 0 Q 58 14 52 6" fill="none" stroke={CORAL} strokeWidth="1.1" strokeLinecap="round" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
          </svg>
        )}
        {evaluado && (
          <p style={SOLO_LECTOR}>
            {r.cuadra
              ? `El asiento cuadra: ${pesos(r.totalDebe)} al debe contra ${pesos(r.totalHaber)} al haber.`
              : "El asiento no cuadra: el arco queda abierto."}
            {r.ajena && ` ${r.ajena} no tiene línea hacia el hecho: no se mueve en este hecho.`}
          </p>
        )}

        {/* El banco de nombres, y después las fichas de valor. */}
        {!evaluado && (
          <>
            <p style={{ margin: "14px 0 8px", fontFamily: SORA, fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.16em", color: acento }}>
              {nombradas ? ROTULO_FICHAS : ROTULO_BANCO}
            </p>
            {nombradas
              ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  {filas.map((f, i) => (
                    <Relieve key={i} e={4} filo plano={Boolean(f.lado)} radio="10px" style={{ flex: "1 1 0", minWidth: 0 }}>
                    <button
                      type="button"
                      className="fae-rel-cara"
                      data-ficha-valor={i}
                      disabled={Boolean(f.lado)}
                      aria-pressed={tomada === `valor:${i}`}
                      aria-label={`Valor de ${f.cuenta}. Llévalo al debe o al haber de esa cuenta.`}
                      onClick={() => setTomada((x) => (x === `valor:${i}` ? null : `valor:${i}`))}
                      style={{
                        display: "block", width: "100%", minHeight: "44px", padding: "8px 6px", borderRadius: "10px", boxSizing: "border-box",
                        cursor: f.lado ? "default" : "pointer", fontFamily: SORA, fontSize: "13px", fontWeight: 700,
                        /* Volumen (#5): N2 + filo en E2; tomada, borde de 2 px #F8F9FA; ya puesta, plana (E0). */
                        background: N2,
                        color: f.lado ? SECUNDARIO_N2 : COLOR.blanco,
                        border: `2px solid ${tomada === `valor:${i}` ? COLOR.blanco : "transparent"}`,
                      }}
                    >
                      {f.lado ? "—" : fichaDe(f)}
                    </button>
                    </Relieve>
                  ))}
                </div>
              )
              : (
                <div data-banco style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                  {actual.banco.map((c) => {
                    const puesta = filas.some((f) => f.cuenta === c);
                    const sel = tomada === c;
                    return (
                      <Relieve key={c} e={4} filo plano={puesta} radio="999px">
                      <button
                        type="button"
                        className="fae-rel-cara"
                        data-nombre={c}
                        disabled={puesta}
                        aria-pressed={sel}
                        onClick={() => tocarNombre(c)}
                        style={{
                          display: "block", minHeight: "44px", padding: "8px 12px", borderRadius: "999px", cursor: puesta ? "default" : "pointer",
                          fontFamily: INTER, fontSize: "13px", fontWeight: 600, textAlign: "left",
                          /* Volumen (#5): la ficha empieza en E2, N2 + filo; tomada, borde de 2 px #F8F9FA; puesta, plana (E0). */
                          background: N2,
                          color: puesta ? SECUNDARIO_N2 : COLOR.blanco,
                          border: `2px solid ${sel ? COLOR.blanco : "transparent"}`,
                        }}
                      >
                        {c}
                      </button>
                      </Relieve>
                    );
                  })}
                </div>
              )}
            <p data-ayuda style={{ margin: "9px 0 0", fontFamily: INTER, fontSize: "12.5px", color: COLOR.apagado, textAlign: "center" }}>
              {nombradas ? AYUDA_VALOR : AYUDA_NOMBRE}
            </p>
          </>
        )}

        {/* La retroalimentación: región viva. Con error, primero el caso y después el acierto. */}
        <div data-retro aria-live="polite" aria-atomic="true">
          {r && (
            <div data-panel={r.ok ? "acierto" : "error"} data-caso={r.caso ?? "acierto"} style={{
              marginTop: "14px", padding: r.textos.length ? "11px 13px" : 0, borderRadius: "11px",
              background: r.ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
              borderLeft: r.textos.length ? `3px solid ${r.ok ? COLOR.neutro : CORAL}` : "none",
              animation: "fae-aj-fundido 150ms ease-out both",
            }}>
              <span style={SOLO_LECTOR}>{r.ok ? "Correcto." : "Incorrecto: "}</span>
              {r.textos.map((x) => (
                <p key={x} data-texto-retro style={{ margin: "0 0 4px", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{x}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {!evaluado && <ConfirmarBoton deshabilitado={!completo} onClick={confirmar} />}
      {evaluado && !modoDemo && (
        <Responder onClick={avanzar}>{t.i + 1 === cuantos ? "Ver mi resumen" : "Siguiente ítem"}</Responder>
      )}
    </Marco>
  );
}

/* «Confirmar asiento»: el botón de siempre, con su marca para el guion del tutorial. */
function ConfirmarBoton({ deshabilitado, onClick }) {
  const caja = useRef(null);
  useLayoutEffect(() => { caja.current?.querySelector("button")?.setAttribute("data-confirmar", ""); });
  return <div ref={caja}><Responder onClick={onClick} deshabilitado={deshabilitado}>{TEXTO_CONFIRMAR}</Responder></div>;
}

export function ArmaElAjusteAcumulado(props) {
  return <ArmaElAjuste actividadId={ACT4_T3.id} {...props} />;
}
export function ArmaElAjusteDiferido(props) {
  return <ArmaElAjuste actividadId={ACT5_T3.id} {...props} />;
}
