import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { FAE } from "../../../../theme.js";
import { NEUTRO, NAVY_DEL_CHIP, TEXTO_ATENUADO } from "../../../../data/contabilidadIntro.js";
import {
  T1_8, PUNTOS_T1_8, PREDICCION_T1_8, ROTULO_APAGADO,
  ROTULO_FLECHA_APAGADA, CIERRE_T1_8, ALT_T1_8,
} from "../../../../data/contabilidadTema1.js";
import {
  sortearT1_8, evaluarT1_8, evaluarPrediccion, esTocable, apagadosDe, noAlcanzados,
  apagaLaFlecha, textoDelContador, puntuar, pesoDeCadaItem, TOTAL_PUNTOS, PRIMER_PUNTO, puntoPorN, sinEmoji,
} from "../../../../contabilidad/tema1.js";
import { Cierre } from "../../corazon/juego.jsx";
import { TEXTO_CIERRE } from "../../bloques/marcos.jsx";
import { useTanda, useRelojes } from "../piezas.jsx";
import { useMovimientoReducido, SOLO_LECTOR } from "../verbos.jsx";
import FranjaDelCiclo from "../intro/FranjaDelCiclo.jsx";
import EncabezadoCompacto from "../b5/EncabezadoCompacto.jsx";
import {
  Pastilla, Mensaje, RegionViva, IconoCheck, IconoX, CORRECTA, REVELADA, CSS_B5H, CLASE_B5H,
} from "../b5/Devolucion.jsx";
import { INTER, NAVY, CURVA, ACIERTO, FANTASMA, estiloC2, contadorDe, Avance, CSS_REGISTRO, CLASE_APARECE } from "./registro.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T1-8 · ¿DÓNDE SE ROMPIÓ? — el apagón también tras el error (P2 de Mai,
 * 23-oct; ajustes a la auditoría de Shoko, 24-oct, §2).
 *
 * Vuelve el anillo de la pieza 1, en columna, con los cinco puntos
 * encendidos. Llega una situación y el estudiante toca el punto donde se
 * cortó el ciclo. Aquí el anillo marca SECUENCIA —qué va antes de qué—, no
 * pertenencia como en T1-1.
 *
 * ═══════════ DOS DECISIONES, Y LA CASCADA VA DESPUÉS DE LA SEGUNDA ═══════════
 *
 * 1 · tocar el punto roto. Un intento. Se acierte o no, el flujo corre del
 *     punto 1 hasta el hueco antes del roto VERDADERO (el registro), aparece
 *     la marca // y el punto roto queda marcado: ✓ en el correcto y, si
 *     erró, el tocado con el fantasma coral y ✕. Los puntos siguientes NO se
 *     apagan todavía: si se apagaran, la pantalla ya diría la respuesta de la
 *     segunda decisión (Shoko).
 * 2 · «¿Cuántos puntos se van a apagar?». Al responderla corre la cascada:
 *     el roto y todos los que siguen se apagan uno por uno —opacidad, 240 ms,
 *     80 ms entre puntos— y aparecen los chips «apagado». No puntúa.
 *
 * El veredicto lo pinta esta pieza (lucide, sin emoji); `Retro` y `Responder`
 * son compartidos y no se usan (#487).
 *
 * ═══════════ CADA SEÑAL DICE UNA SOLA COSA ═══════════
 *
 * El chip «apagado» dice qué no pasó; la marca // dice dónde se rompió; el
 * contorno dice qué se respondió. La // no va encima de ningún punto: va en
 * el hueco entre el último encendido y el primer apagado.
 *
 * Un punto apagado NO es un paso que la empresa deja de hacer: es que ESTE
 * HECHO no llegó hasta ahí. Por eso ningún rótulo dice más que «apagado».
 *
 * ═══════════ NADA SALTA (C3) ═══════════
 *
 * El hueco del icono, el del chip, el renglón del veredicto, el del contador y
 * la segunda decisión tienen su sitio desde el principio: el escenario mide lo
 * mismo antes de tocar, entre las dos decisiones y al final.
 *
 * ═══════════ EL PUNTO 1 NO ES UN BOTÓN ═══════════
 *
 * Ni por toque ni por teclado: así el Tab lo salta sin que haga falta decirlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las duraciones, en un solo sitio. Las pruebas las leen de aquí. */
export const MS = {
  flujo: 600,
  corte: 300,
  /* Cada apagón: 240 ms de opacidad, y 80 ms entre un punto y el siguiente (ajustes de Mai, §2). */
  apagon: 240,
  entrePuntos: 80,
};

const CSS = `
@keyframes fae-t18-flujo { from { transform: translateY(var(--y0)); } to { transform: translateY(var(--y1)); } }
.fae-t18-flujo { animation: fae-t18-flujo ${MS.flujo}ms ease-in-out both; }
@keyframes fae-t18-corte { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: none; } }
.fae-t18-corte { animation: fae-t18-corte ${MS.corte}ms ${CURVA} both; transform-box: fill-box; transform-origin: center; }
@media (prefers-reduced-motion: reduce) {
  .fae-t18-flujo, .fae-t18-corte { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`;

const SORA = "Sora, sans-serif";

/*
 * ═══════════ ATENUADO, PERO LEGIBLE: 4,5:1 ═══════════
 *
 * Un punto apagado se atenúa, y aun así todo su texto —número, rótulo y chip—
 * mide al menos 4,5:1 contra el fondo del panel. Medido en Chromium a 375 px,
 * 0,66 deja el peor texto por encima de 4,5:1.
 */
export const OPACIDAD_ATENUADA = 0.66;
/*
 * El cierre de la situación cuando la decisión 1 estuvo bien y la 2 no: el
 * mismo bloque que `Mensaje`, sin el visto ni «Correcto.».
 */
function CierreSinVeredicto({ texto }) {
  return (
    <div role="status" className="fae-b5h-nueva" data-mensaje="cierre" style={{
      margin: "12px 0 0", padding: "11px 13px", borderRadius: "11px",
      background: "rgba(184,196,212,0.12)", borderLeft: `3px solid ${NEUTRO}`,
    }}>
      <p data-devolucion style={{ margin: 0, fontFamily: INTER, fontSize: "15px", lineHeight: "22px", color: FAE.text, overflowWrap: "anywhere" }}>
        <span data-texto-retro>{texto}</span>
      </p>
    </div>
  );
}

/* Las opciones de predicción que no se eligieron. Solo en su borde. */
export const OPACIDAD_NO_ELEGIDA = 0.5;
const NEUTRO_RGB = "184,196,212";
const BLANCO_RGB = "248,249,250";
export const atenuar = (rgb, alfa, opacidad = OPACIDAD_ATENUADA) =>
  `rgba(${rgb},${Math.round(alfa * opacidad * 1000) / 1000})`;
/* Dónde corre la línea de avance de la franja. */
const X_AVANCE = 19;

/* Las fases de una situación. */
const TOCAR = "tocar";
const FLUJO = "flujo";
const PREDICCION = "prediccion";
const APAGANDO = "apagando";
const FIN = "fin";

/* El corte es FORMA, no tono: dos trazos oblicuos que cruzan la línea. */
function Corte({ x, y, animado }) {
  return (
    <g data-corte-trazo className={animado ? "fae-t18-corte" : undefined}>
      <path d={`M ${x - 6} ${y + 1} L ${x - 1} ${y - 6}`} stroke={NEUTRO} strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M ${x + 1} ${y + 6} L ${x + 6} ${y - 1}`} stroke={NEUTRO} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

/*
 * Un punto. `marca`: lo que se respondió en él (C2) —"correcta" o "revelada"
 * en el roto, "tachada" en el tocado por error—. `apagado`: la cascada ya
 * pasó por él. El icono y el chip tienen su hueco reservado en todas las filas.
 */
function Punto({ p, marca, apagado, onTocar, refCaja, activo, reducido }) {
  const tocable = esTocable(p.n);
  const transicion = reducido ? "none" : `opacity ${MS.apagon}ms ${CURVA}`;
  const roto = marca === CORRECTA || marca === REVELADA;
  const contenido = (
    <>
      <span data-icono-punto aria-hidden="true" style={{ flex: "none", width: "16px", display: "flex", justifyContent: "center" }}>
        {roto && <IconoCheck />}
        {marca === "tachada" && <IconoX />}
      </span>
      <span data-numero={p.n} style={{
        flex: "none", width: "18px", height: "18px", borderRadius: "999px",
        border: `1px solid ${apagado ? atenuar(NEUTRO_RGB, 1) : NEUTRO}`,
        color: apagado ? TEXTO_ATENUADO : NEUTRO, fontFamily: SORA,
        fontSize: "12px", fontWeight: 700, lineHeight: "17px", textAlign: "center",
      }}>
        {p.n}
      </span>
      <span data-rotulo-punto style={{
        flex: 1, minWidth: 0, fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: 1.3, color: FAE.text,
        opacity: apagado ? OPACIDAD_ATENUADA : 1, transition: transicion,
      }}>
        {p.rotulo}
      </span>
      {/* Apagado se dice con opacidad Y con su palabra. El hueco está desde el principio. */}
      <span data-rotulo-apagado={apagado ? "si" : "no"} aria-hidden={!apagado} style={{
        flex: "none", fontSize: "12px", fontWeight: 600, lineHeight: "16px",
        color: TEXTO_ATENUADO, border: `1px solid ${atenuar(BLANCO_RGB, 0.35)}`,
        borderRadius: "999px", padding: "1px 7px",
        opacity: apagado ? 1 : 0, transition: transicion,
      }}>
        {ROTULO_APAGADO}
      </span>
    </>
  );

  /* C2: el roto con contorno #F8F9FA y relleno navy; el tocado por error, fantasma coral; reposo, borde de 2 sin salto. */
  const borde = roto
    ? { border: `2px solid ${FAE.text}`, background: apagado ? atenuar(NEUTRO_RGB, 0.06) : NAVY, boxShadow: "none" }
    : marca === "tachada"
      ? { border: `2px dashed ${FAE.coral}`, background: "transparent", boxShadow: "none" }
      : {
        border: "2px solid transparent", background: apagado ? atenuar(NEUTRO_RGB, 0.06) : "rgba(184,196,212,0.06)",
        boxShadow: `inset 0 0 0 1.5px ${apagado ? atenuar(BLANCO_RGB, 0.18) : NEUTRO}`,
      };
  const estilo = {
    display: "flex", gap: "6px", alignItems: "center", width: "100%", textAlign: "left",
    minHeight: "44px", padding: "6px 8px 6px 4px", borderRadius: "11px", boxSizing: "border-box",
    transition: reducido ? "none" : `background-color ${MS.apagon}ms ${CURVA}, box-shadow ${MS.apagon}ms ${CURVA}`,
    color: FAE.text, font: "inherit", ...borde,
  };

  const comunes = {
    ref: refCaja,
    "data-punto": p.n,
    "data-apagado": apagado ? "si" : "no",
    "data-marca": marca ?? undefined,
  };

  if (!tocable) {
    /* El 1: un bloque de texto, no un botón. No entra en el Tab. */
    return <div {...comunes} data-tocable="no" style={estilo}>{contenido}</div>;
  }
  return (
    <button
      type="button"
      {...comunes}
      data-tocable="si"
      disabled={!activo}
      onClick={activo ? () => onTocar(p.n) : undefined}
      aria-label={`Punto ${p.n}: ${p.rotulo}${apagado ? `, ${ROTULO_APAGADO}` : ""}`}
      style={{ ...estilo, cursor: activo ? "pointer" : "default" }}
    >
      {contenido}
    </button>
  );
}

/*
 * El anillo: la franja de la pieza 1 a la izquierda y los cinco puntos en
 * columna. Encima, en absoluto, el flujo que corre por la línea de avance y
 * el corte que la cruza.
 */
function Anillo({ marcas, apagados, retorno, flujo, corte, onTocar, activo, reducido }) {
  const caja = useRef(null);
  const refs = useRef({});
  const [centros, setCentros] = useState({});

  /* Dónde toca cada punto la franja; solo se guarda si cambió, para no pintar sin fin. */
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
  /* El hueco antes de un punto: ahí va la //, y ahí se para el flujo. */
  const hueco = (n) => (y(n - 1) + y(n)) / 2;
  const posCorte = corte == null ? null : { x: X_AVANCE, y: hueco(corte) };

  return (
    <div ref={caja} data-anillo data-retorno={retorno} style={{ position: "relative", display: "flex", gap: "6px", alignItems: "stretch" }}>
      <FranjaDelCiclo retorno={retorno} reducido={reducido} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        {PUNTOS_T1_8.map((p) => (
          <Punto
            key={p.n}
            p={p}
            marca={marcas[p.n] ?? null}
            apagado={apagados.includes(p.n)}
            onTocar={onTocar}
            activo={activo}
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
      {flujo && !reducido && (
        <span
          key={flujo.clave}
          data-flujo="avanza"
          data-flujo-hasta={flujo.hasta}
          className="fae-t18-flujo"
          style={{
            position: "absolute", top: 0, left: `${X_AVANCE - 4}px`, width: "8px", height: "8px",
            marginTop: "-4px", borderRadius: "999px", background: NEUTRO,
            boxShadow: "0 0 0 3px rgba(184,196,212,0.25)", pointerEvents: "none",
            "--y0": `${y(PRIMER_PUNTO)}px`, "--y1": `${hueco(flujo.hasta)}px`,
          }}
        />
      )}
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
      <p style={{ margin: "0 0 7px", fontSize: "12px", lineHeight: 1.45, color: "rgba(248,249,250,0.78)" }}>
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
                  background: apagado ? "transparent" : NEUTRO, opacity: apagado ? OPACIDAD_ATENUADA : 1,
                  fontFamily: SORA, fontSize: "12px", fontWeight: 700, lineHeight: "17px", textAlign: "center",
                }}
              >
                {p.n}
                {apagado && <span style={SOLO_LECTOR}> {ROTULO_APAGADO}</span>}
              </span>
              {p.n < TOTAL_PUNTOS && (
                <span aria-hidden="true" data-tira-tramo={p.n + 1 === rompe ? "corte" : "sigue"} style={{
                  width: "14px", textAlign: "center", fontFamily: SORA, fontSize: "12px", fontWeight: 700,
                  color: NEUTRO, opacity: p.n + 1 === rompe ? 1 : apagado ? OPACIDAD_ATENUADA : 0.7,
                }}>
                  {p.n + 1 === rompe ? "//" : "—"}
                </span>
              )}
            </span>
          );
        })}
        <span aria-hidden="true" data-tira-vuelta={apagaLaFlecha(rompe) ? "apagada" : "sigue"} style={{
          marginLeft: "2px", fontFamily: SORA, fontSize: "12px", fontWeight: 700, color: NEUTRO,
          opacity: apagaLaFlecha(rompe) ? OPACIDAD_ATENUADA : 0.7,
        }}>
          ↺
        </span>
      </div>
      <p data-tira-contador style={{ margin: "7px 0 0", fontSize: "12px", color: "rgba(248,249,250,0.72)" }}>
        {textoDelContador(noAlcanzados(rompe))}
        {apagaLaFlecha(rompe) && <> — {ROTULO_FLECHA_APAGADA}</>}
      </p>
    </li>
  );
}

/*
 * ═══════════ EL MODO DEMO DE «ASÍ SE JUEGA» ═══════════
 *
 * Es este mismo componente: `items` le da el ejemplo desde afuera y `modoDemo`
 * le quita el encabezado y el avance, y no llama a `onCompletar`.
 */
export default function DondeSeRompio({
  Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false,
  /* Solo la demo lo enciende: con «Pausar» la cascada se congela donde va. */
  pausado = false,
}) {
  const reducido = useMovimientoReducido();
  const t = useTanda(() => items ?? sortearT1_8(barajar));

  const [r, setR] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [fase, setFase] = useState(TOCAR);
  /* Cuántos puntos ya apagó la cascada: sube de uno en uno con los relojes de la pieza, que «Pausar» congela. */
  const [apagando, setApagando] = useState(0);
  const [prediccion, setPrediccion] = useState(null);
  const [flujo, setFlujo] = useState(null);
  const [resueltas, setResueltas] = useState([]);
  const zonaBoton = useRef(null);

  const s = t.items[t.i];
  const cuantas = t.items.length;
  const pct = puntuar(respuestas, cuantas);

  const { despues, limpiar } = useRelojes(pausado);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(pct, Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]);
  useEffect(() => {
    if (fase === FIN && !modoDemo) zonaBoton.current?.focus();
  }, [fase]);

  /* La decisión 1: un intento. El flujo corre hasta el roto de verdad, se acierte o no. */
  const tocar = (n) => {
    if (fase !== TOCAR) return;
    const nuevo = evaluarT1_8(s, n);
    limpiar();
    t.anotar(s.id, nuevo.ok, nuevo.ok ? null : n);
    setRespuestas((xs) => [...xs, { id: s.id, primeroOk: nuevo.ok }]);
    setResueltas((xs) => [...xs, s]);
    setR({ ...nuevo, tocado: n });
    if (reducido) { setFlujo(null); setFase(PREDICCION); return; }
    setFlujo({ hasta: s.rompe, clave: `${t.i}` });
    setFase(FLUJO);
    despues(MS.flujo, () => setFase(PREDICCION));
  };

  /* La decisión 2 (sin puntaje). Al responderla, la cascada. */
  const predecir = (n) => {
    if (fase !== PREDICCION || prediccion) return;
    setPrediccion({ elegido: n, ...evaluarPrediccion(s, n) });
    setFlujo(null);
    const cuantos = apagadosDe(s.rompe).length;
    if (reducido) { setApagando(cuantos); setFase(FIN); return; }
    /* El roto primero y luego los que siguen: uno cada 80 ms, cada uno con 240 ms de opacidad. */
    setFase(APAGANDO);
    setApagando(1);
    for (let k = 2; k <= cuantos; k++) despues(MS.entrePuntos * (k - 1), () => setApagando(k));
    despues(MS.entrePuntos * (cuantos - 1) + MS.apagon, () => setFase(FIN));
  };

  const avanzar = () => {
    limpiar();
    setR(null); setFase(TOCAR); setApagando(0); setPrediccion(null); setFlujo(null);
    if (t.i + 1 < cuantas) t.setI(t.i + 1);
    else t.setTerminado(true);
  };
  const reiniciar = () => {
    limpiar();
    t.reiniciar();
    setR(null); setRespuestas([]); setFase(TOCAR); setApagando(0);
    setPrediccion(null); setFlujo(null); setResueltas([]);
  };

  if (t.terminado) {
    const bien = respuestas.filter((x) => x.primeroOk).length;
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
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

  /* ═══════ QUÉ SE VE, SEGÚN LA FASE ═══════ */
  const rompe = s.rompe;
  const respondida = fase !== TOCAR;
  const apagados = apagadosDe(rompe).slice(0, apagando);
  const flechaApagada = fase === FIN && apagaLaFlecha(rompe);
  const marcas = r ? {
    [rompe]: r.ok ? CORRECTA : REVELADA,
    ...(r.ok ? {} : { [r.tocado]: "tachada" }),
  } : {};
  const contador = fase === FIN ? textoDelContador(noAlcanzados(rompe)) : null;
  const roto = puntoPorN(rompe);

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS}{CSS_B5H}{CSS_REGISTRO}</style>
      <div className={CLASE_B5H} data-t18>
        {!modoDemo && (
          <EncabezadoCompacto
            objetivo={T1_8.objetivo}
            contador={contadorDe("Situación", t.i + 1, cuantas)}
            consigna={T1_8.consigna}
          />
        )}

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

          <div data-escenario>
            <Anillo
              marcas={marcas}
              apagados={apagados}
              retorno={flechaApagada ? "apagado" : "encendido"}
              /* El flujo se va cuando empieza la cascada: la // es la que dice dónde se rompió. */
              flujo={fase === FLUJO || fase === PREDICCION ? flujo : null}
              corte={respondida ? rompe : null}
              onTocar={tocar}
              activo={fase === TOCAR}
              reducido={reducido}
            />

            {/* El renglón del veredicto: el punto roto, con su número y su nombre. Reservado. */}
            <div data-renglon style={{ minHeight: "28px", marginTop: "8px", display: "flex", alignItems: "center" }}>
              {r && <Pastilla marca={r.ok ? CORRECTA : REVELADA} valor={`${roto.n} ${roto.rotulo}`} />}
            </div>

          </div>

          {/*
            LA SEGUNDA DECISIÓN. Activa tras la primera, se acierte o no; antes
            guarda su sitio sin verse. Sin puntaje: la elegida queda marcada y ya.
          */}
          <div
            data-prediccion
            data-activa={fase === PREDICCION ? "si" : "no"}
            aria-hidden={!respondida}
            style={{ marginTop: "12px", visibility: respondida ? "visible" : "hidden" }}
            className={respondida ? CLASE_APARECE : undefined}
          >
            <p style={{ margin: "0 0 3px", fontSize: "13px", lineHeight: 1.45, color: FAE.text }}>
              {PREDICCION_T1_8.pregunta}
            </p>
            <p data-regla-prediccion style={{
              margin: "0 0 8px", fontSize: "12px", lineHeight: 1.45, color: "rgba(248,249,250,0.6)",
            }}>
              {PREDICCION_T1_8.regla}
            </p>
            <div role="group" aria-label={PREDICCION_T1_8.pregunta} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "7px" }}>
              {PREDICCION_T1_8.opciones.map((n) => {
                const elegida = prediccion?.elegido === n;
                const abierta = fase === PREDICCION && !prediccion;
                /*
                 * Al final, el registro de C2 como en las otras cinco (Shoko, #535 b):
                 * ✓ y en blanco la que era; ✕ y coral discontinuo la elegida si no era.
                 */
                const final = fase === FIN && prediccion;
                const era = final && n === noAlcanzados(s.rompe);
                const veredicto = !final ? null : era ? ACIERTO : elegida ? FANTASMA : null;
                return (
                  <button
                    key={n}
                    type="button"
                    data-prediccion-opcion={n}
                    data-elegida={elegida ? "si" : undefined}
                    aria-pressed={elegida}
                    disabled={!abierta}
                    tabIndex={respondida ? undefined : -1}
                    data-veredicto-prediccion={veredicto ?? undefined}
                    onClick={() => predecir(n)}
                    style={{
                      minHeight: "44px", padding: "10px 0", borderRadius: "10px", fontFamily: SORA, fontSize: "15px", fontWeight: 700,
                      cursor: abierta ? "pointer" : "default",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                      ...(veredicto
                        ? { ...estiloC2(veredicto), color: FAE.text }
                        : {
                          background: elegida ? NEUTRO : "transparent",
                          color: elegida ? NAVY_DEL_CHIP : prediccion ? TEXTO_ATENUADO : FAE.text,
                          border: `2px solid ${elegida ? NEUTRO : "transparent"}`,
                          boxShadow: elegida ? "none" : `inset 0 0 0 1px ${prediccion ? atenuar(BLANCO_RGB, 0.3, OPACIDAD_NO_ELEGIDA) : "rgba(248,249,250,0.3)"}`,
                        }),
                    }}
                  >
                    {veredicto === ACIERTO && <IconoCheck />}
                    {veredicto === FANTASMA && <IconoX />}
                    {n}
                  </button>
                );
              })}
            </div>
            {/*
              El contador y la flecha apagada, debajo de las opciones y junto a la
              devolución (Shoko, #535): encima de la pregunta, la respuesta quedaba
              antes del enunciado que la pide. Su sitio está desde el principio (C3).
            */}
            <p data-cuenta-apagados aria-live="polite" style={{
              margin: "9px 0 0", minHeight: "36px", boxSizing: "border-box", padding: "8px 11px", borderRadius: "10px",
              fontFamily: SORA, fontSize: "13px", fontWeight: 700, lineHeight: "20px", color: FAE.text,
              background: contador ? "rgba(184,196,212,0.1)" : "transparent",
              /*
               * La banda dice un hecho verdadero («Se apagaron 3 puntos.»), así que va
               * neutra y sin ✕ (Shoko, #535 c): el ✕ queda solo en lo que eligió el
               * estudiante.
               */
              borderLeft: `3px solid ${contador ? NEUTRO : "transparent"}`,
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              {contador && <span className={CLASE_APARECE}>{contador}{flechaApagada && <span data-rotulo-flecha> — {ROTULO_FLECHA_APAGADA}</span>}</span>}
            </p>
            <p data-cierre-prediccion={fase === FIN && prediccion ? (prediccion.acerto ? "acerto" : "fallo") : undefined} style={{
              margin: "9px 0 0", minHeight: "17px", fontSize: "12.5px", lineHeight: "17px", color: "rgba(248,249,250,0.8)",
            }}>
              {fase === FIN && prediccion && <span className={CLASE_APARECE}>{prediccion.texto}</span>}
            </p>
          </div>
        </div>

        {/* La devolución: la del error tras la decisión 1; la del acierto, al final de la cascada (dice cuántos se apagaron). */}
        <RegionViva>
          {r && !r.ok && <Mensaje ok={false} texto={sinEmoji(r.texto)} />}
          {/* Si la segunda falló, el cierre no abre con «Correcto.»: llegaría después del error y lo contradiría (Shoko, #535). */}
          {r && r.ok && fase === FIN && (prediccion?.acerto === false
            ? <CierreSinVeredicto texto={sinEmoji(r.texto)} />
            : <Mensaje ok texto={sinEmoji(r.texto)} />)}
        </RegionViva>

        {fase === FIN && !modoDemo && (
          <Avance onClick={avanzar} refBoton={zonaBoton}>
            {t.i + 1 === cuantas ? "Ver el resultado" : "Siguiente situación"}
          </Avance>
        )}

        {/* El texto alternativo de la situación que está, con el estado final ya en pantalla. */}
        {fase === FIN && !modoDemo && ALT_T1_8[s.id] && <p data-alt-t18 style={SOLO_LECTOR}>{ALT_T1_8[s.id]}</p>}
      </div>
    </Marco>
  );
}
