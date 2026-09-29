import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP } from "../../../../data/contabilidadIntro.js";
import {
  T1_8, PUNTOS_T1_8, PREDICCION_T1_8, ROTULO_ERROR_B_T1_8, ROTULO_APAGADO,
  ROTULO_FLECHA_APAGADA, CIERRE_T1_8, ALT_T1_8, SITUACION_DEL_ALT_T1_8,
} from "../../../../data/contabilidadTema1.js";
import {
  sortearT1_8, evaluarT1_8, evaluarPrediccion, esTocable, apagadosDe, noAlcanzados,
  apagaLaFlecha, textoDelContador, puntuar, pesoDeCadaItem, TOTAL_PUNTOS, PRIMER_PUNTO,
} from "../../../../contabilidad/tema1.js";
import { Retro, Pulsos, Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { Responder, useTanda } from "../piezas.jsx";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import FranjaDelCiclo from "../intro/FranjaDelCiclo.jsx";
import { Encabezado } from "./encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-8 · ¿DÓNDE SE ROMPIÓ?
 *
 * Vuelve el anillo de la pieza 1, en su versión en columna, con los cinco
 * puntos encendidos. Llega una situación y el estudiante toca el punto donde
 * se cortó el ciclo. Aquí el anillo marca SECUENCIA —qué va antes de qué—, no
 * pertenencia como en T1-1: no hay adentro ni afuera.
 *
 * ═══════════ EL APAGÓN AGUAS ABAJO ═══════════
 *
 * Al acertar, el flujo sale del punto 1 y avanza hasta el hueco antes del
 * roto. Ahí se para, pregunta a cuántos puntos no va a llegar el hecho, y SOLO
 * ENTONCES aparece el corte y se apagan uno por uno el roto y los que siguen,
 * con un contador que sube con cada apagón.
 *
 * ═══════════ CADA SEÑAL DICE UNA SOLA COSA ═══════════
 *
 * El chip «apagado» dice qué no pasó; la marca // dice dónde se rompió. Por
 * eso el punto roto se ve EXACTAMENTE como cualquier otro apagado —sin borde
 * ni fondo propio— y la // no va encima de ningún punto: va en el hueco entre
 * el último encendido y el primer apagado. En el 5, entre el 4 y el 5.
 *
 * Un punto apagado NO es un paso que la empresa deja de hacer: es que ESTE
 * HECHO no llegó hasta ahí. Por eso ningún rótulo dice más que «apagado».
 *
 * ═══════════ EL PUNTO 5 ES DISTINTO, A PROPÓSITO ═══════════
 *
 * Se apaga el 5 y, además, la flecha de vuelta, con «pero no cambió nada».
 *
 * ═══════════ EN UN ERROR NO CORRE NADA ═══════════
 *
 * Una cascada desde el punto equivocado enseñaría algo falso. El punto tocado
 * parpadea con el contorno coral punteado y vuelve. En la A el flujo pasa de
 * largo por él y se desvanece sin pararse en ninguno; en la B el punto se
 * atenúa con «este hecho no llegó aquí», que es verdad sea cual sea el roto.
 *
 * ═══════════ EL PUNTO 1 NO ES UN BOTÓN ═══════════
 *
 * Ni por toque ni por teclado: no es un botón deshabilitado, es que no es un
 * botón. Así el Tab lo salta sin que haga falta decírselo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las duraciones del encargo, en un solo sitio. Las pruebas las leen de aquí. */
export const MS = {
  flujo: 600,
  corte: 300,
  apagon: 300,
  parpadeo: 400,
  desvanece: 500,
  atenua: 400,
  /* Con movimiento reducido no hay transición: se sostiene cada imagen. */
  imagen: 900,
};

const CSS = `
@keyframes fae-t18-flujo { from { transform: translateY(var(--y0)); } to { transform: translateY(var(--y1)); } }
.fae-t18-flujo { animation: fae-t18-flujo ${MS.flujo}ms ease-in-out both; }
@keyframes fae-t18-desvanece {
  from { transform: translateY(var(--y0)); opacity: 1; }
  to { transform: translateY(var(--y1)); opacity: 0; }
}
.fae-t18-desvanece { animation: fae-t18-desvanece ${MS.desvanece}ms ease-in both; }
@keyframes fae-t18-corte { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: none; } }
.fae-t18-corte { animation: fae-t18-corte ${MS.corte}ms ease-out both; transform-box: fill-box; transform-origin: center; }
@keyframes fae-t18-parpadea { 0%, 100% { opacity: 1; } 25%, 75% { opacity: 0.35; } 50% { opacity: 1; } }
.fae-t18-parpadea { animation: fae-t18-parpadea ${MS.parpadeo}ms ease-in-out 1; }
@keyframes fae-t18-aparece { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.fae-t18-aparece { animation: fae-t18-aparece 300ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .fae-t18-flujo, .fae-t18-desvanece, .fae-t18-corte, .fae-t18-parpadea, .fae-t18-aparece {
    animation: none !important; opacity: 1 !important; transform: none !important;
  }
}
`;

const SORA = "Sora, sans-serif";
/* Dónde corre la línea de avance de la franja. */
const X_AVANCE = 19;

/*
 * Las fases de una situación. El error no es una fase: el anillo se queda en
 * `tocar` y lo único que cambia es el punto tocado.
 */
const TOCAR = "tocar";
const FLUJO = "flujo";
const PREDICCION = "prediccion";
const CORTE = "corte";
const APAGANDO = "apagando";
const FIN = "fin";
/* Tras fallar dos veces: el corte verdadero, quieto y sin predicción. */
const REVELADO = "revelado";

/* El corte es FORMA, no tono: dos trazos oblicuos que cruzan la línea. */
function Corte({ x, y, animado }) {
  return (
    <g data-corte-trazo className={animado ? "fae-t18-corte" : undefined}>
      <path d={`M ${x - 6} ${y + 1} L ${x - 1} ${y - 6}`} stroke={NEUTRO} strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M ${x + 1} ${y + 6} L ${x + 6} ${y - 1}`} stroke={NEUTRO} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

function Punto({ p, estado, onTocar, refCaja, fase, reducido }) {
  const tocable = esTocable(p.n);
  const { apagado, atenuado, parpadea } = estado;
  const tenue = apagado || atenuado;
  const contenido = (
    <>
      <span data-numero={p.n} style={{
        flex: "none", width: "18px", height: "18px", borderRadius: "999px",
        border: `1px solid ${NEUTRO}`, color: NEUTRO, fontFamily: SORA,
        fontSize: "10px", fontWeight: 700, lineHeight: "17px", textAlign: "center",
      }}>
        {p.n}
      </span>
      <span style={{ flex: 1, minWidth: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: 1.3, color: FAE.text }}>
        {p.rotulo}
      </span>
      {/* Apagado se dice con opacidad Y con su palabra; nunca solo con tono. */}
      {apagado && (
        <span data-rotulo-apagado style={{
          flex: "none", fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.06em",
          color: "rgba(248,249,250,0.8)", border: "1px solid rgba(248,249,250,0.35)",
          borderRadius: "999px", padding: "1px 7px",
        }}>
          {ROTULO_APAGADO}
        </span>
      )}
      {atenuado && !apagado && (
        <span data-rotulo-no-llego style={{
          flex: "none", maxWidth: "46%", fontSize: "10px", lineHeight: 1.3, textAlign: "right",
          color: "rgba(248,249,250,0.85)",
        }}>
          {ROTULO_ERROR_B_T1_8}
        </span>
      )}
    </>
  );

  const estilo = {
    display: "flex", gap: "8px", alignItems: "center", width: "100%", textAlign: "left",
    padding: "9px 10px", borderRadius: "11px", boxSizing: "border-box",
    /*
     * Sin estado de «tocado»: al confirmar, el punto muestra solo su estado
     * final real. El roto no lleva borde ni fondo propio — se apaga como
     * cualquier otro.
     */
    background: "rgba(184,196,212,0.06)",
    border: parpadea
      ? `1.5px dashed ${FAE.coral}`
      : `1.5px solid ${tenue ? "rgba(248,249,250,0.18)" : NEUTRO}`,
    opacity: tenue ? 0.4 : 1,
    /* Con movimiento reducido el estado final se pinta directo, sin transición. */
    transition: reducido ? "none" : `opacity ${atenuado ? MS.atenua : MS.apagon}ms ease, border-color 200ms ease`,
    color: FAE.text, font: "inherit",
  };

  const comunes = {
    ref: refCaja,
    "data-punto": p.n,
    "data-apagado": apagado ? "si" : "no",
    "data-atenuado": atenuado ? "si" : undefined,
    "data-parpadea": parpadea ? "si" : undefined,
    className: parpadea ? "fae-t18-parpadea" : undefined,
  };

  if (!tocable) {
    /* El 1: un bloque de texto, no un botón. No entra en el Tab. */
    return <div {...comunes} data-tocable="no" style={estilo}>{contenido}</div>;
  }
  const activo = fase === TOCAR;
  return (
    <button
      type="button"
      {...comunes}
      data-tocable="si"
      disabled={!activo}
      onClick={activo ? () => onTocar(p.n) : undefined}
      aria-label={`Punto ${p.n}: ${p.rotulo}${apagado ? `, ${ROTULO_APAGADO}` : ""}${atenuado && !apagado ? `, ${ROTULO_ERROR_B_T1_8}` : ""}`}
      style={{ ...estilo, cursor: activo ? "pointer" : "default" }}
    >
      {contenido}
    </button>
  );
}

/*
 * El anillo: la franja de la pieza 1 a la izquierda y los cinco puntos en
 * columna. Encima, en absoluto, lo que es de esta actividad: el flujo que
 * corre por la línea de avance y el corte que la cruza.
 */
function Anillo({ estados, retorno, flujo, corte, onTocar, fase, reducido }) {
  const caja = useRef(null);
  const refs = useRef({});
  const [centros, setCentros] = useState({});

  /*
   * Dónde toca cada punto la franja. Se mide en cada pintado —un rótulo de
   * «apagado» puede cambiar el alto de una fila— y solo se guarda si cambió,
   * para que medir no vuelva a pintar sin fin.
   */
  useLayoutEffect(() => {
    const base = caja.current?.getBoundingClientRect();
    if (!base) return;
    const nuevos = {};
    for (const p of PUNTOS_T1_8) {
      const el = refs.current[p.n];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      nuevos[p.n] = Math.round(r.top + r.height / 2 - base.top);
    }
    const igual = PUNTOS_T1_8.every((p) => nuevos[p.n] === centros[p.n]);
    if (!igual) setCentros(nuevos);
  });

  const y = (n) => centros[n] ?? 0;
  /*
   * El hueco antes de un punto: entre él y el anterior. Ahí va la //, y ahí se
   * para el flujo — nunca encima de un punto, porque el roto ya no se alcanzó.
   */
  const hueco = (n) => (y(n - 1) + y(n)) / 2;
  const posCorte = corte == null ? null : { x: X_AVANCE, y: hueco(corte) };

  let punto = null;
  if (flujo && !reducido) {
    const y0 = y(PRIMER_PUNTO);
    const y1 = flujo.tipo === "desvanece" ? hueco(flujo.hasta + 1) : hueco(flujo.hasta);
    punto = (
      <span
        key={flujo.clave}
        data-flujo={flujo.tipo}
        data-flujo-hasta={flujo.hasta}
        className={flujo.tipo === "desvanece" ? "fae-t18-desvanece" : "fae-t18-flujo"}
        style={{
          position: "absolute", top: 0, left: `${X_AVANCE - 4}px`, width: "8px", height: "8px",
          marginTop: "-4px", borderRadius: "999px", background: NEUTRO,
          boxShadow: "0 0 0 3px rgba(184,196,212,0.25)", pointerEvents: "none",
          "--y0": `${y0}px`, "--y1": `${y1}px`,
        }}
      />
    );
  }

  return (
    <div ref={caja} data-anillo data-retorno={retorno} style={{ position: "relative", display: "flex", gap: "6px", alignItems: "stretch" }}>
      <FranjaDelCiclo retorno={retorno} reducido={reducido} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
        {PUNTOS_T1_8.map((p) => (
          <Punto
            key={p.n}
            p={p}
            estado={estados[p.n]}
            onTocar={onTocar}
            fase={fase}
            reducido={reducido}
            refCaja={(el) => { if (el) refs.current[p.n] = el; }}
          />
        ))}
      </div>
      {posCorte && (
        <svg
          data-corte={corte}
          data-corte-entre={`${corte - 1}-${corte}`}
          role="img"
          aria-label={`Corte entre el punto ${corte - 1} y el ${corte}`}
          style={{ position: "absolute", left: 0, top: 0, width: "28px", height: "100%", overflow: "visible", pointerEvents: "none" }}
        >
          <Corte x={posCorte.x} y={posCorte.y} animado={!reducido} />
        </svg>
      )}
      {punto}
    </div>
  );
}

/*
 * La tira del final: una situación resuelta, en pequeño. Los cinco puntos, su
 * corte y lo que quedó apagado — y debajo el contador con su número.
 */
function Tira({ situacion }) {
  const rompe = situacion.rompe;
  const apagados = apagadosDe(rompe);
  return (
    <li data-resuelta={situacion.id} data-rompe={rompe} style={{
      padding: "9px 10px", borderRadius: "11px", background: "rgba(10,20,34,0.45)",
      border: "1px solid rgba(248,249,250,0.14)",
    }}>
      <p style={{ margin: "0 0 7px", fontSize: "11.5px", lineHeight: 1.45, color: "rgba(248,249,250,0.78)" }}>
        {situacion.texto}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "nowrap" }}>
        {PUNTOS_T1_8.map((p) => {
          const apagado = apagados.includes(p.n);
          return (
            <span key={p.n} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span
                data-tira-punto={p.n}
                data-apagado={apagado ? "si" : "no"}
                style={{
                  width: "20px", height: "20px", borderRadius: "999px", flex: "none",
                  border: `1.5px solid ${NEUTRO}`, color: apagado ? NEUTRO : NAVY_DEL_CHIP,
                  background: apagado ? "transparent" : NEUTRO, opacity: apagado ? 0.35 : 1,
                  fontFamily: SORA, fontSize: "10px", fontWeight: 700, lineHeight: "17px", textAlign: "center",
                }}
              >
                {p.n}
                {apagado && <span style={SOLO_LECTOR}> {ROTULO_APAGADO}</span>}
              </span>
              {p.n < TOTAL_PUNTOS && (
                <span aria-hidden="true" data-tira-tramo={p.n + 1 === rompe ? "corte" : "sigue"} style={{
                  width: "14px", textAlign: "center", fontFamily: SORA, fontSize: "11px", fontWeight: 700,
                  color: NEUTRO, opacity: p.n + 1 === rompe ? 1 : apagado ? 0.35 : 0.7,
                }}>
                  {p.n + 1 === rompe ? "//" : "—"}
                </span>
              )}
            </span>
          );
        })}
        {/* La vuelta al punto 1: en el 5 también se apaga. El corte no va aquí. */}
        <span aria-hidden="true" data-tira-vuelta={apagaLaFlecha(rompe) ? "apagada" : "sigue"} style={{
          marginLeft: "2px", fontFamily: SORA, fontSize: "12px", fontWeight: 700, color: NEUTRO,
          opacity: apagaLaFlecha(rompe) ? 0.35 : 0.7,
        }}>
          ↺
        </span>
      </div>
      <p data-tira-contador style={{ margin: "7px 0 0", fontSize: "11px", color: "rgba(248,249,250,0.72)" }}>
        {textoDelContador(noAlcanzados(rompe))}
        {apagaLaFlecha(rompe) && <> — {ROTULO_FLECHA_APAGADA}</>}
      </p>
    </li>
  );
}

export default function DondeSeRompio({ Marco, rotulo, titulo, acento, onCompletar }) {
  const reducido = useMovimientoReducido();
  const t = useTanda(() => sortearT1_8(barajar));

  const [r, setR] = useState(null);
  const [intento, setIntento] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [fase, setFase] = useState(TOCAR);
  const [encendidos, setEncendidos] = useState(0);
  const [prediccion, setPrediccion] = useState(null);
  const [parpadeo, setParpadeo] = useState(null);
  const [atenuado, setAtenuado] = useState(null);
  const [flujo, setFlujo] = useState(null);
  const [resueltas, setResueltas] = useState([]);
  const relojes = useRef([]);
  const zonaBoton = useRef(null);

  const s = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);
  const esperandoReintento = Boolean(r && !r.ok && intento === 1);
  const cerrada = fase === FIN || fase === REVELADO;

  const despues = (ms, fn) => { relojes.current.push(setTimeout(fn, ms)); };
  const limpiar = () => { relojes.current.forEach(clearTimeout); relojes.current = []; };

  useEffect(() => {
    if (t.terminado) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => () => limpiar(), []);
  useEffect(() => {
    if (cerrada) zonaBoton.current?.querySelector("button")?.focus();
  }, [cerrada]);

  /*
   * ═══════════ LA CASCADA ═══════════
   *
   * Corte, y después un apagón cada 300 ms, con el contador subiendo a la par.
   * Con movimiento reducido son tres imágenes quietas: el anillo entero (la
   * predicción), el corte, y los apagados con el contador.
   */
  const cascada = (rompe) => {
    const apagados = apagadosDe(rompe).length;
    setFase(CORTE);
    const paso = reducido ? MS.imagen : MS.corte;
    if (reducido) {
      despues(paso, () => { setEncendidos(apagados); setFase(FIN); });
      return;
    }
    for (let k = 1; k <= apagados; k++) {
      despues(paso + MS.apagon * (k - 1), () => { setFase(APAGANDO); setEncendidos(k); });
    }
    despues(paso + MS.apagon * apagados, () => setFase(FIN));
  };

  const tocar = (n) => {
    if (fase !== TOCAR) return;
    const nuevo = evaluarT1_8(s, n);
    limpiar();

    if (nuevo.ok) {
      setParpadeo(null); setAtenuado(null); setEncendidos(0); setPrediccion(null);
      if (intento === 0) {
        t.anotar(s.id, true);
        setRespuestas((xs) => [...xs, { id: s.id, primeroOk: true }]);
      } else {
        setRespuestas((xs) => [...xs, { id: s.id, primeroOk: false, segundoOk: true }]);
        setIntento(2);
      }
      setResueltas((xs) => [...xs, s]);
      setR(nuevo);
      if (reducido) { setFlujo(null); setFase(PREDICCION); return; }
      setFlujo({ tipo: "avanza", hasta: nuevo.rompe, clave: `${t.i}-${intento}` });
      setFase(FLUJO);
      despues(MS.flujo, () => setFase(PREDICCION));
      return;
    }

    /* El error: parpadea y vuelve. Nada más cambia en el anillo. */
    setParpadeo(n);
    despues(MS.parpadeo, () => setParpadeo(null));
    if (nuevo.patron === "A") {
      setFlujo({ tipo: "desvanece", hasta: n, clave: `${t.i}-${intento}-a` });
      despues(MS.desvanece, () => setFlujo(null));
    } else {
      setFlujo(null);
    }
    if (nuevo.atenuado != null) setAtenuado(nuevo.atenuado);
    setR(nuevo);

    if (intento === 0) {
      t.anotar(s.id, false, n);
      setIntento(1);
      return;
    }
    /*
     * Segundo fallo: la situación se cierra y se enseña el corte VERDADERO,
     * quieto. Es información cierta —no una cascada desde el punto tocado— y
     * es la que el estudiante necesita para no quedarse con la duda.
     */
    setRespuestas((xs) => [...xs, { id: s.id, primeroOk: false, segundoOk: false }]);
    setResueltas((xs) => [...xs, s]);
    setIntento(2);
    setEncendidos(apagadosDe(s.rompe).length);
    setFase(REVELADO);
  };

  const predecir = (n) => {
    if (fase !== PREDICCION || prediccion) return;
    setPrediccion({ elegido: n, ...evaluarPrediccion(s, n) });
    cascada(s.rompe);
  };

  const avanzar = () => {
    limpiar();
    setR(null); setIntento(0); setFase(TOCAR); setEncendidos(0); setPrediccion(null);
    setParpadeo(null); setAtenuado(null); setFlujo(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    limpiar();
    t.reiniciar();
    setR(null); setIntento(0); setRespuestas([]); setFase(TOCAR); setEncendidos(0);
    setPrediccion(null); setParpadeo(null); setAtenuado(null); setFlujo(null); setResueltas([]);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <style>{CSS}</style>
        <Cierre pct={Math.round(pct)} onReiniciar={reiniciar} textoReiniciar="Otra tanda">
          <p style={TEXTO_CIERRE}>
            {bien} de {cuantas} al primer intento. Cada situación valía {pesoDeCadaItem(cuantas).toFixed(2)} %.
          </p>
        </Cierre>
        <div data-contenido style={{ marginTop: "14px" }}>
          <p data-cierre-texto style={{ margin: "0 0 12px", fontSize: "13.5px", lineHeight: 1.6, color: FAE.text }}>
            {CIERRE_T1_8}
          </p>
          <ul data-resueltas style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {resueltas.map((x) => <Tira key={x.id} situacion={x} />)}
          </ul>
        </div>
      </Marco>
    );
  }

  /* ═══════ QUÉ SE VE EN EL ANILLO, SEGÚN LA FASE ═══════ */
  const rompe = s.rompe;
  const verCorte = fase === CORTE || fase === APAGANDO || fase === FIN || fase === REVELADO;
  const apagadosAhora = apagadosDe(rompe).slice(0, verCorte ? encendidos : 0);
  const flechaApagada = verCorte && apagaLaFlecha(rompe);
  const estados = Object.fromEntries(PUNTOS_T1_8.map((p) => [p.n, {
    apagado: apagadosAhora.includes(p.n),
    atenuado: atenuado === p.n,
    parpadea: parpadeo === p.n,
  }]));
  const contador = fase === FIN || fase === REVELADO
    ? textoDelContador(noAlcanzados(rompe))
    : fase === APAGANDO && encendidos > 0 ? textoDelContador(encendidos) : null;
  const vacio = fase === TOCAR && !r;

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}</style>
      <Encabezado objetivo={T1_8.objetivo} consigna={T1_8.consigna} />
      <div style={{ marginBottom: "12px" }}>
        <Pulsos total={cuantas} hechos={t.i + (cerrada ? 1 : 0)} etiqueta="Situación" />
      </div>

      {/*
        ═══════ AQUÍ DENTRO NO ENTRA EL VOCABULARIO DEL TEMA 2 ═══════
        Ni ▲, ni saldo, ni arcos, ni colectores, ni balanza; ni teal ni ámbar.
        El coral solo al fallar. Hay una prueba que mira esta caja.
      */}
      <div data-contenido data-fase={fase}>
        <p data-situacion={s.id} style={{
          margin: "0 0 12px", padding: "10px 12px", borderRadius: "11px",
          fontFamily: SORA, fontSize: "13px", fontWeight: 700, lineHeight: 1.45,
          color: FAE.text, background: "rgba(10,20,34,0.5)",
          border: "1px solid rgba(248,249,250,0.18)",
        }}>
          {s.texto}
        </p>

        {vacio && (
          <p data-vacio style={{
            margin: "0 0 9px", fontSize: "12.5px", textAlign: "center", color: "rgba(248,249,250,0.6)",
          }}>
            {T1_8.pregunta}
          </p>
        )}

        <Anillo
          estados={estados}
          retorno={flechaApagada ? "apagado" : "encendido"}
          /*
            El flujo se para en el hueco antes del roto y ahí se queda hasta
            que llega el corte. Cuando aparece la //, el flujo se va: los dos
            en el mismo hueco se taparían, y la // es la que dice dónde se rompió.
          */
          flujo={fase === TOCAR || fase === FLUJO || fase === PREDICCION ? flujo : null}
          corte={verCorte ? rompe : null}
          onTocar={tocar}
          fase={fase}
          reducido={reducido}
        />

        {flechaApagada && (
          <p data-rotulo-flecha className="fae-t18-aparece" style={{
            margin: "7px 0 0", fontSize: "11.5px", color: "rgba(248,249,250,0.75)",
          }}>
            <span aria-hidden="true" style={{ opacity: 0.45 }}>↑ </span>{ROTULO_FLECHA_APAGADA}
          </p>
        )}

        {contador && (
          <p data-contador aria-live="polite" style={{
            margin: "10px 0 0", padding: "8px 11px", borderRadius: "10px",
            fontFamily: SORA, fontSize: "13px", fontWeight: 700, color: FAE.text,
            background: "rgba(184,196,212,0.1)", borderLeft: `3px solid ${NEUTRO}`,
          }}>
            {contador}
          </p>
        )}

        {/*
          LA PREDICCIÓN. Solo tras acertar el punto y antes del corte. Sin
          puntaje, así que ninguna opción se pinta de bien o de mal: la
          elegida queda marcada, y ya.
        */}
        {(fase === PREDICCION || (prediccion && fase !== TOCAR && fase !== REVELADO)) && (
          <div data-prediccion className="fae-t18-aparece" style={{ marginTop: "12px" }}>
            <p style={{ margin: "0 0 8px", fontSize: "13px", lineHeight: 1.45, color: FAE.text }}>
              {PREDICCION_T1_8.pregunta}
            </p>
            <div role="group" aria-label={PREDICCION_T1_8.pregunta} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "7px" }}>
              {PREDICCION_T1_8.opciones.map((n) => {
                const elegida = prediccion?.elegido === n;
                return (
                  <button
                    key={n}
                    type="button"
                    data-prediccion-opcion={n}
                    data-elegida={elegida ? "si" : undefined}
                    aria-pressed={elegida}
                    disabled={Boolean(prediccion)}
                    onClick={() => predecir(n)}
                    style={{
                      padding: "10px 0", borderRadius: "10px", fontFamily: SORA, fontSize: "15px", fontWeight: 700,
                      cursor: prediccion ? "default" : "pointer",
                      background: elegida ? NEUTRO : "transparent",
                      color: elegida ? NAVY_DEL_CHIP : FAE.text,
                      border: `${elegida ? 2 : 1}px solid ${elegida ? NEUTRO : "rgba(248,249,250,0.3)"}`,
                      opacity: prediccion && !elegida ? 0.5 : 1,
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            {fase === FIN && prediccion && (
              <p data-cierre-prediccion={prediccion.acerto ? "acerto" : "fallo"} className="fae-t18-aparece" style={{
                margin: "9px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.8)",
              }}>
                {prediccion.texto}
              </p>
            )}
          </div>
        )}
      </div>

      {esperandoReintento && (
        <p data-rotulo-seccion style={{
          margin: "12px 0 0", fontFamily: SORA, fontSize: "10.5px",
          fontWeight: 700, letterSpacing: "0.16em", color: acento,
        }}>
          INTÉNTALO OTRA VEZ
        </p>
      )}

      {/* La devolución: la del error enseguida; la del acierto, al final de la cascada. */}
      {r && (!r.ok || fase === FIN) && <Retro texto={r.texto} />}

      {cerrada && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente situación"}
          </Responder>
        </div>
      )}

      {/* El texto alternativo describe una situación concreta: solo se lee cuando es la que está. */}
      {s.id === SITUACION_DEL_ALT_T1_8 && cerrada && <p style={SOLO_LECTOR}>{ALT_T1_8}</p>}
    </Marco>
  );
}
