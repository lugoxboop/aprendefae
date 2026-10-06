import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { FAE } from "../../../../theme.js";
import { COLOR } from "../../../../data/contabilidadTema3.js";
import {
  ACT6_T3, ITEMS_ACT6, COBRO, AL_PERIODO, QUEDA, ANTES, DESPUES, COMPROBAR, SIGUIENTE_ITEM, VER_RESUMEN,
  MOVER_ANTES, MOVER_DESPUES, PISTA_CORTE, PISTA_CIFRAS,
} from "../../../../data/contabilidadTema3Act6.js";
import {
  evaluarAct6, puntuarAct6, acotar, corteConTecla, corteEnX, rotulosDeBarra, tocableDirecto,
  banderaDelCorte, valorDelCorte, formatearCampo, valorDeCampo, pesos,
} from "../../../../contabilidad/queLeToca.js";
import { Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { SOLO_LECTOR } from "../verbos.jsx";
import { Encabezado } from "../tema1/encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · ACT. 6 · ¿QUÉ LE TOCA A ESTE PERIODO? (Xeno, P2 final; Levi)
 *
 * La barra del total, con los meses del hecho. El estudiante pone el corte
 * en el mes en que cierra la empresa y escribe las dos cifras: lo que le toca
 * al periodo y lo que queda.
 *
 * La barra usa el vocabulario de la pieza 3 (Levi): a la izquierda del
 * corte, lo que le toca al periodo es un fantasma de contorno discontinuo
 * #8C9BB0; a la derecha, lo que queda va sólido #B8C4D4 si el ítem es un
 * pago anticipado y de contorno discontinuo #B8C4D4 si es un cobro
 * anticipado. El cuadrito de cada campo copia el estilo de su lado.
 *
 * El corte se mueve de cuatro formas, un mes por paso: el asa (arrastre
 * grueso), «Antes» y «Después» (repiten si se mantienen), el toque directo
 * en una celda (solo si mide 44 px o más) y el teclado del slider.
 *
 * Coral solo en el error. Ni verde azulado ni ámbar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SORA = "Sora, sans-serif";
const INTER = "Inter, sans-serif";
const CORAL = FAE.coral;
/* El carril cuando todavía no se puede medir (Xeno: 275 px a 375). */
const ANCHO_POR_DEFECTO = 275;
const REPETIR_TRAS = 400;
const REPETIR_CADA = 120;

const CSS = `
.fae-a6 button { -webkit-tap-highlight-color: transparent; }
.fae-a6 [data-asa]:focus-visible, .fae-a6 [data-paso-corte]:focus-visible, .fae-a6-hecho:focus-visible { outline: 2px solid ${COLOR.blanco}; outline-offset: 2px; }
.fae-a6 input::placeholder { color: ${COLOR.apagado}; }
.fae-a6-campos { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
@keyframes fae-a6-fundido { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .fae-a6 * { animation: none !important; transition: none !important; } }
`;

/* El estilo de cada lado de la barra, y del cuadrito de su campo. */
const estiloAlPeriodo = { background: "transparent", border: `2px dashed ${COLOR.quieto}` };
const estiloQueda = (tipo) => (tipo === COBRO
  ? { background: "transparent", border: `2px dashed ${COLOR.neutro}` }
  : { background: COLOR.neutro, border: `2px solid ${COLOR.neutro}` });

function Visto({ color = COLOR.navy }) {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
      <path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Equis() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
      <path d="M3 3 L9 9 M9 3 L3 9" fill="none" stroke={COLOR.blanco} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* Mide el ancho del carril, y lo sigue si cambia. */
function useAncho(ref) {
  const [ancho, setAncho] = useState(ANCHO_POR_DEFECTO);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const leer = () => { const w = el.getBoundingClientRect().width; if (w > 0) setAncho(w); };
    leer();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(leer);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return ancho;
}

/*
 * «Antes» y «Después»: un mes por pulsación; mantenidos, repiten tras 400 ms
 * cada 120 ms (no es animación: con movimiento reducido se conserva). El
 * puntero da el primer paso al bajar; el clic que sigue no lo repite. Con
 * teclado, el clic es el paso.
 */
function BotonPaso({ etiqueta, rotulo, deshabilitado, onPaso, datos }) {
  const reloj = useRef(null);
  const porPuntero = useRef(false);
  const parar = () => { clearTimeout(reloj.current); clearInterval(reloj.current); reloj.current = null; };
  useEffect(() => parar, []);
  useEffect(() => { if (deshabilitado) parar(); }, [deshabilitado]);
  return (
    <button
      type="button"
      data-paso-corte={datos}
      aria-label={rotulo}
      disabled={deshabilitado}
      onPointerDown={(e) => {
        if (deshabilitado || e.button > 0) return;
        porPuntero.current = true;
        onPaso();
        parar();
        reloj.current = setTimeout(() => { reloj.current = setInterval(onPaso, REPETIR_CADA); }, REPETIR_TRAS);
      }}
      onPointerUp={parar}
      onPointerLeave={parar}
      onPointerCancel={parar}
      onClick={() => {
        if (porPuntero.current) { porPuntero.current = false; return; }
        onPaso();
      }}
      style={{
        flex: "1 1 0", minWidth: 0, height: "44px", borderRadius: "999px", touchAction: "manipulation",
        cursor: deshabilitado ? "default" : "pointer", fontFamily: SORA, fontSize: "14px", fontWeight: 600,
        background: "transparent", border: `2px solid ${deshabilitado ? COLOR.quieto : COLOR.neutro}`,
        color: deshabilitado ? COLOR.apagado : COLOR.blanco,
      }}
    >
      {etiqueta}
    </button>
  );
}

/* ═══════════ LA BARRA, CON SU CORTE ═══════════ */
function Barra({ item, corte, onCorte, evaluado, r, reducido }) {
  const carril = useRef(null);
  const ancho = useAncho(carril);
  const [arrastre, setArrastre] = useState(null);
  const n = item.meses;
  const { etiquetas, marcas } = rotulosDeBarra(item, ancho);
  const directo = tocableDirecto(item, ancho) && !evaluado;
  const xDe = (k) => (k / n) * ancho;

  /* Durante el arrastre, el asa sigue al dedo y la bandera dice el mes en vivo. */
  const corteVivo = arrastre !== null ? corteEnX(item, arrastre, ancho) : corte;
  const xAsa = arrastre !== null ? arrastre : corte !== null ? xDe(corte) : 0;
  const errorCorte = evaluado && !r.corteOk;

  const xDelDedo = (e) => {
    const base = carril.current?.getBoundingClientRect();
    return Math.min(ancho, Math.max(0, e.clientX - (base?.left ?? 0)));
  };
  /*
   * Una sola bandera visible: la del corte puesto. Tras un error en el corte,
   * el correcto se ve solo como línea fantasma (Levi). La bandera mide su
   * propio ancho para no salirse del carril: «Cierre · Dic · año 1» es la
   * más larga.
   */
  const refBandera = useRef(null);
  const [medioBandera, setMedioBandera] = useState(44);
  useLayoutEffect(() => {
    const w = refBandera.current?.offsetWidth;
    if (w && Math.abs(w / 2 - medioBandera) > 0.5) setMedioBandera(w / 2);
  });
  const bandera = (x, texto, props) => (
    <span ref={refBandera} {...props} style={{
      position: "absolute", top: 0, left: `${Math.min(ancho - medioBandera, Math.max(medioBandera, x))}px`, transform: "translateX(-50%)",
      whiteSpace: "nowrap", padding: "3px 9px", borderRadius: "999px", fontFamily: INTER, fontSize: "12px", fontWeight: 700,
      lineHeight: 1.2, ...props.style,
    }}>{texto}</span>
  );
  const transicion = arrastre !== null || reducido ? "none" : "left 150ms ease-out";

  return (
    <div data-barra data-tipo={item.tipo} style={{ position: "relative", padding: "0 8px", margin: "0 0 6px" }}>
      <div ref={carril} data-carril style={{ position: "relative", paddingTop: "30px" }}>
        {/* La bandera del corte puesto: «Cierre · Dic», o «Cierre · Dic · año 1» con más de 12 meses. */}
        {corteVivo !== null && bandera(xAsa, banderaDelCorte(item, corteVivo), {
          "data-bandera": "",
          "aria-hidden": "true",
          style: {
            background: FAE.bg, border: `1.5px solid ${errorCorte ? CORAL : COLOR.blanco}`, color: COLOR.blanco,
            transition: transicion,
          },
        })}
        {/* Los dos lados de la barra (44 px). Sin corte, todo es lo que queda. */}
        <div data-tramos aria-hidden="true" style={{ position: "relative", height: "44px" }}>
          {corteVivo !== null && (
            <span data-lado="al-periodo" style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: `${xAsa}px`, boxSizing: "border-box",
              borderRadius: "8px 0 0 8px", ...estiloAlPeriodo, transition: transicion === "none" ? "none" : "width 150ms ease-out",
            }} />
          )}
          <span data-lado="queda" style={{
            position: "absolute", top: 0, bottom: 0, right: 0, left: `${corteVivo !== null ? xAsa : 0}px`, boxSizing: "border-box",
            borderRadius: corteVivo !== null ? "0 8px 8px 0" : "8px", ...estiloQueda(item.tipo),
            transition: transicion === "none" ? "none" : "left 150ms ease-out",
          }} />
          {/* La línea del corte: blanca, discontinua, sobresale 8 px. */}
          {corteVivo !== null && (
            <span data-linea-corte style={{
              position: "absolute", top: "-8px", bottom: "-8px", left: `${xAsa}px`, width: 0, transform: "translateX(-1.25px)",
              borderLeft: `2.5px dashed ${errorCorte ? CORAL : COLOR.blanco}`, transition: transicion,
            }} />
          )}
          {errorCorte && (
            <span data-linea-correcta style={{
              position: "absolute", top: "-8px", bottom: "-8px", left: `${xDe(item.corte)}px`, width: "3px", transform: "translateX(-1.5px)",
              /* Sólida #B8C4D4; el filo navy la separa del relleno sólido de «Queda». */
              background: COLOR.neutro, boxShadow: `0 0 0 1.5px ${COLOR.navy}`, animation: "fae-a6-fundido 150ms ease-out both",
            }} />
          )}
        </div>
        {/* El toque directo: una celda pone el corte al final de esa celda. Solo si mide 44 px o más. */}
        {directo && (
          <div data-celdas aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: "30px", height: "44px", display: "flex" }}>
            {Array.from({ length: n }, (_, i) => (
              <button key={i} type="button" tabIndex={-1} data-celda={i} onClick={() => onCorte(acotar(item, i + 1))}
                style={{ flex: "1 1 0", height: "100%", padding: 0, border: "none", background: "transparent", cursor: "pointer" }} />
            ))}
          </div>
        )}

        {/* Las marcas de mes (o de año) y sus etiquetas. */}
        <div aria-hidden="true" style={{ position: "relative", height: "10px" }}>
          {marcas.map((m) => (
            <span key={m.en} data-marca-mes={m.gruesa ? "anio" : "mes"} style={{
              position: "absolute", top: 0, left: `${xDe(m.en)}px`, transform: "translateX(-50%)",
              width: m.gruesa ? "2px" : "1px", height: m.gruesa ? "10px" : "6px", background: COLOR.quieto,
            }} />
          ))}
        </div>
        <div aria-hidden="true" data-etiquetas style={{ position: "relative", height: "18px" }}>
          {etiquetas.map((e) => (
            <span key={`${e.desde}-${e.texto}`} data-etiqueta-mes style={{
              position: "absolute", top: 0, left: `${xDe((e.desde + e.hasta) / 2)}px`, transform: "translateX(-50%)",
              whiteSpace: "nowrap", fontFamily: INTER, fontSize: "12px", lineHeight: "16px", color: COLOR.apagado,
            }}>{e.texto}</span>
          ))}
        </div>

        {/* El asa: 28 × 26 a la vista, 44 × 44 al toque. Es el slider. */}
        <div style={{ position: "relative", height: "44px" }}>
          <div
            role="slider"
            data-asa
            tabIndex={evaluado ? -1 : 0}
            aria-label="Corte"
            aria-valuemin={1}
            aria-valuemax={n - 1}
            aria-valuenow={corte ?? undefined}
            aria-valuetext={corte !== null ? valorDelCorte(item, corte) : PISTA_CORTE}
            aria-disabled={evaluado ? "true" : undefined}
            onKeyDown={(e) => {
              if (evaluado) return;
              const k = corteConTecla(item, corte, e.key);
              if (k === null) return;
              e.preventDefault();
              onCorte(k);
            }}
            onPointerDown={(e) => {
              if (evaluado) return;
              e.currentTarget.setPointerCapture?.(e.pointerId);
              setArrastre(xDelDedo(e));
            }}
            onPointerMove={(e) => { if (arrastre !== null) setArrastre(xDelDedo(e)); }}
            onPointerUp={(e) => {
              if (arrastre === null) return;
              onCorte(corteEnX(item, xDelDedo(e), ancho));
              setArrastre(null);
            }}
            onPointerCancel={() => setArrastre(null)}
            style={{
              position: "absolute", top: 0, left: `${xAsa}px`, width: "44px", height: "44px", transform: "translateX(-50%)",
              display: "grid", placeItems: "center", cursor: evaluado ? "default" : arrastre !== null ? "grabbing" : "grab",
              touchAction: "none", borderRadius: "10px", transition: transicion,
            }}
          >
            <span aria-hidden="true" data-asa-visible style={{
              width: "28px", height: "26px", borderRadius: "7px", boxSizing: "border-box",
              background: errorCorte ? CORAL : corte === null ? "transparent" : COLOR.blanco,
              border: `2px solid ${errorCorte ? CORAL : COLOR.blanco}`,
              display: "grid", placeItems: "center",
            }}>
              <svg width="12" height="10" viewBox="0 0 12 10">
                <path d="M3 1 V9 M6 1 V9 M9 1 V9" stroke={corte === null ? COLOR.blanco : COLOR.navy} strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ UN CAMPO: «Al periodo» o «Queda» ═══════════ */
function Campo({ id, etiqueta, cuadrito, valor, onValor, bloqueado, idPista, estado, correcto }) {
  const [foco, setFoco] = useState(false);
  const idInput = useId();
  const error = estado === "error";
  const bien = estado === "acierto";
  const borde = error ? `2px solid ${CORAL}` : foco ? `3px solid ${COLOR.blanco}` : bloqueado ? `1.2px solid ${COLOR.quieto}` : `2px solid ${COLOR.quieto}`;
  return (
    <div data-campo-caja={id} data-estado-campo={estado ?? (bloqueado ? "bloqueado" : valor ? "lleno" : "libre")} style={{ minWidth: 0 }}>
      <label htmlFor={idInput} style={{
        display: "flex", alignItems: "center", gap: "7px", margin: "0 0 5px",
        fontFamily: INTER, fontSize: "13px", fontWeight: 600, color: bloqueado ? COLOR.quieto : COLOR.blanco,
      }}>
        <span aria-hidden="true" data-cuadrito={id} style={{ flex: "none", width: "14px", height: "14px", boxSizing: "border-box", borderRadius: "3px", ...cuadrito }} />
        {etiqueta}
      </label>
      <div style={{
        position: "relative", display: "flex", alignItems: "center", height: "52px", boxSizing: "border-box",
        padding: "0 12px", borderRadius: "12px", border: borde, background: error ? "rgba(231,111,81,0.10)" : "transparent",
      }}>
        <span aria-hidden="true" style={{ fontFamily: SORA, fontSize: "17px", fontWeight: 700, color: bloqueado ? COLOR.quieto : COLOR.blanco, marginRight: "4px" }}>$</span>
        <input
          id={idInput}
          data-campo={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="done"
          value={valor}
          readOnly={bloqueado || Boolean(estado)}
          aria-disabled={bloqueado ? "true" : undefined}
          aria-describedby={bloqueado ? idPista : undefined}
          aria-invalid={error ? "true" : undefined}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          onChange={(e) => { if (!bloqueado && !estado) onValor(formatearCampo(e.target.value)); }}
          style={{
            flex: "1 1 auto", minWidth: 0, width: "100%", height: "100%", padding: 0, border: "none", outline: "none",
            background: "transparent", color: COLOR.blanco, fontFamily: SORA, fontSize: "17px", fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        />
        {(bien || error) && (
          <span data-insignia={bien ? "visto" : "equis"} aria-hidden="true" style={{
            position: "absolute", top: "-8px", right: "-6px", width: "22px", height: "22px", borderRadius: "50%",
            background: bien ? COLOR.neutro : CORAL, display: "grid", placeItems: "center",
          }}>
            {bien ? <Visto /> : <Equis />}
          </span>
        )}
      </div>
      {error && (
        <span data-valor-correcto style={{
          display: "inline-block", marginTop: "6px", padding: "3px 10px", borderRadius: "999px",
          background: COLOR.neutro, color: COLOR.navy, fontFamily: SORA, fontSize: "13px", fontWeight: 700,
          animation: "fae-a6-fundido 150ms ease-out both",
        }}>
          {pesos(correcto)}
        </span>
      )}
    </div>
  );
}

export default function QueLeToca({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null,
}) {
  const t = useTanda(() => items ?? ITEMS_ACT6);
  const [corte, setCorte] = useState(null);
  const [alPeriodo, setAlPeriodo] = useState("");
  const [queda, setQueda] = useState("");
  const [r, setR] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [reducido, setReducido] = useState(false);
  const tarjeta = useRef(null);
  const primeraVez = useRef(true);
  const idPista = useId();

  const item = t.items[t.i];
  const cuantos = t.items.length;
  const pct = puntuarAct6(respuestas, cuantos);

  useEffect(() => {
    try { setReducido(Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches)); } catch { /* sin matchMedia */ }
  }, []);
  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  /* Al cambiar de ítem, el foco pasa a la tarjeta del hecho. */
  useEffect(() => {
    if (primeraVez.current) { primeraVez.current = false; return; }
    if (!modoDemo) tarjeta.current?.focus({ preventScroll: false });
  }, [t.i]);

  const bloqueados = corte === null;
  const listo = corte !== null && alPeriodo !== "" && queda !== "";

  const comprobar = () => {
    if (!listo || r) return;
    const nuevo = evaluarAct6(item, { corte, alPeriodo: valorDeCampo(alPeriodo), queda: valorDeCampo(queda) });
    t.anotar(item.id, nuevo.ok, nuevo.ok ? null : nuevo.caso);
    setRespuestas((xs) => [...xs, { id: item.id, ok: nuevo.ok }]);
    setR(nuevo);
  };
  const avanzar = () => {
    setR(null); setCorte(null); setAlPeriodo(""); setQueda("");
    if (t.i + 1 < cuantos) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => { t.reiniciar(); setR(null); setCorte(null); setAlPeriodo(""); setQueda(""); setRespuestas([]); };

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

  const evaluado = Boolean(r);
  const mover = (d) => setCorte((c) => (c === null ? (d > 0 ? 1 : null) : acotar(item, c + d)));
  /*
   * Lo que se marca en cada campo. Con el corte mal y las cifras bien, los
   * campos quedan como acierto y solo el corte es error (Levi).
   */
  const estadoCampo = (clave) => (!r ? null : r.campos[clave] ? "acierto" : "error");
  const pista = r ? null : corte === null ? PISTA_CORTE : !listo ? PISTA_CIFRAS : null;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <div className="fae-a6" data-act6>
        {!modoDemo && (
          <>
            <Encabezado consigna={ACT6_T3.consigna} onComoSeJuega={onComoSeJuega} />
            <div style={{ marginBottom: "12px" }}>
              <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Ítem" />
            </div>
          </>
        )}

        {/* La tarjeta del hecho: empresa, hecho de Gen y pie. */}
        <div key={item.id} data-tarjeta-hecho={item.id} data-tipo-item={item.tipo} style={{
          margin: "0 0 14px", padding: "11px 13px", borderRadius: "11px",
          background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${COLOR.neutro}`,
          animation: modoDemo ? undefined : "fae-a6-fundido 150ms ease-out both",
        }}>
          <p ref={tarjeta} tabIndex={-1} className="fae-a6-hecho" data-empresa style={{
            margin: "0 0 4px", fontFamily: INTER, fontSize: "13px", color: COLOR.apagado,
            display: "flex", flexWrap: "wrap", columnGap: "5px",
          }}>
            <span>Empresa:</span><strong style={{ color: COLOR.blanco, fontWeight: 700 }}>{item.empresa}</strong>
          </p>
          <p data-hecho style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{item.hecho}</p>
          {item.pie && <p data-pie style={{ margin: "4px 0 0", fontFamily: INTER, fontSize: "12px", color: COLOR.apagado }}>{item.pie}</p>}
        </div>

        <Barra key={`barra-${item.id}`} item={item} corte={corte} onCorte={setCorte} evaluado={evaluado} r={r} reducido={reducido} />

        {/* La pista de una línea: el paso 2 sin corte, el paso 3 con corte y campos incompletos. */}
        <p id={idPista} data-pista style={{
          margin: "0 0 10px", minHeight: pista ? undefined : 0, fontFamily: INTER, fontSize: "13.5px", lineHeight: 1.4, color: COLOR.apagado,
          ...(pista ? {} : SOLO_LECTOR),
        }}>
          {pista ?? ""}
        </p>

        <div style={{ display: "flex", gap: "9px", margin: "0 0 14px" }}>
          <BotonPaso etiqueta={ANTES} rotulo={MOVER_ANTES} datos="antes" deshabilitado={evaluado || corte === null || corte <= 1} onPaso={() => mover(-1)} />
          <BotonPaso etiqueta={DESPUES} rotulo={MOVER_DESPUES} datos="despues" deshabilitado={evaluado || corte === item.meses - 1} onPaso={() => mover(1)} />
        </div>

        <div className="fae-a6-campos" data-campos>
          <Campo id="alPeriodo" etiqueta={AL_PERIODO} cuadrito={estiloAlPeriodo} valor={alPeriodo} onValor={setAlPeriodo}
            bloqueado={bloqueados} idPista={idPista} estado={estadoCampo("alPeriodo")} correcto={item.alPeriodo} />
          <Campo id="queda" etiqueta={QUEDA} cuadrito={estiloQueda(item.tipo)} valor={queda} onValor={setQueda}
            bloqueado={bloqueados} idPista={idPista} estado={estadoCampo("queda")} correcto={item.queda} />
        </div>

        {!r && (
          <div data-comprobar-caja>
            <ComprobarBoton deshabilitado={!listo} onClick={comprobar} />
          </div>
        )}

        {/* La retroalimentación: región viva. Con error, primero el caso y después el acierto. */}
        <div data-retro aria-live="polite" aria-atomic="true">
          {r && (
            <div data-panel={r.ok ? "acierto" : "error"} data-caso={r.caso ?? "acierto"} style={{
              marginTop: "14px", padding: "11px 13px", borderRadius: "11px",
              background: r.ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
              borderLeft: `3px solid ${r.ok ? COLOR.neutro : CORAL}`,
              animation: "fae-a6-fundido 150ms ease-out both",
            }}>
              <span style={SOLO_LECTOR}>{r.ok ? "Correcto: " : "Incorrecto: "}</span>
              {r.textos.map((x) => (
                <p key={x} data-texto-retro style={{ margin: "0 0 4px", fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: COLOR.blanco }}>{x}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {r && !modoDemo && (
        <Responder onClick={avanzar}>{t.i + 1 === cuantos ? VER_RESUMEN : SIGUIENTE_ITEM}</Responder>
      )}
    </Marco>
  );
}

/* «Comprobar»: el botón de siempre, con su marca para el guion del tutorial. */
function ComprobarBoton({ deshabilitado, onClick }) {
  const caja = useRef(null);
  useLayoutEffect(() => { caja.current?.querySelector("button")?.setAttribute("data-comprobar", ""); });
  return <div ref={caja}><Responder onClick={onClick} deshabilitado={deshabilitado}>{COMPROBAR}</Responder></div>;
}
