/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A0 · LA FIGURA «EL AÑO EN MARCHA» (Hanayama, rediseño de A0 §1).
 *
 * Una pista de «hoy» a la raya del año que el estudiante ARRASTRA (role
 * slider: dedo, flechas, Inicio y Fin) o pasa con «Pasar el año» (0,22 s por
 * mes). Cada activo es una fila; cuando la mano del tiempo pasa por el mes en
 * que ese activo se vuelve plata, la fila se enciende con la marca «plata».
 * Lo que llega a la raya sin volverse plata cruza al otro lado, bajo «No es
 * corriente». Todo es una función del mes: si el año vuelve atrás, las filas
 * se apagan otra vez.
 *
 * En el juego (P3) cada fila tiene dos casillas sin texto, antes y después
 * de la raya; «Pasar el año» se activa con las tres marcadas, y la raya
 * decide: en cada casilla elegida, la pastilla con palabra (✓ y borde blanco,
 * o ✗ y borde coral). La que era no se marca: en Aprender se reintenta con
 * «Otra vez», y marcarla nombraría la respuesta.
 *
 * Sin teal, ámbar ni Debe/Haber. Coral solo en el error del juego. Sin
 * círculos (caja del Tema 3), sin trazo discontinuo (corte del Tema 3), sin
 * banda maciza que se llena (año del Tema 1). Con movimiento reducido, «Pasar
 * el año» salta al mes 12 sin animar. Carril de la Célula D.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useId, useRef, useState } from "react";
import { useMovimientoReducido } from "../mecanicas/libros/verbos.jsx";
import { RAYA_A0 as RAYA, FIGURA_ANO, estadoFilaA0, ladoCorrectoA0, juegoBienA0 } from "../../data/contabilidadT4A0.js";
import { MARCA } from "../../data/contabilidadT4.js";
import { C, Mensaje, Marca } from "./comun.jsx";

const MS_POR_MES = 220;

export const CSS_ANO = `
.t4an { position: relative; margin: 0; display: grid; gap: 6px; min-width: 0; color: ${C.texto}; font-family: "Inter", sans-serif; }
.t4an * { box-sizing: border-box; }
.t4an-cab { position: relative; height: 34px; }
.t4an-zona { position: absolute; top: 0; display: grid; font: 600 12px/1.3 "Inter", sans-serif; color: ${C.texto}; }
.t4an-zona > span { white-space: nowrap; }
.t4an-zona-no { left: calc(${RAYA}% + 8px); color: ${C.texto2}; }
.t4an-cuerpo { position: relative; display: grid; gap: 4px; }
.t4an-raya { position: absolute; left: calc(${RAYA}% - 1px); top: -40px; bottom: 0; width: 2px; background: ${C.texto}; pointer-events: none; }
.t4an-mano { position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(248,249,250,0.45); pointer-events: none; }
.t4an-pista { position: relative; height: 44px; touch-action: none; cursor: pointer; outline: none; }
.t4an-pista-linea { position: absolute; left: 0; width: ${RAYA}%; top: 14px; height: 2px; background: ${C.neutro}; }
.t4an-pomo { position: absolute; top: 1px; width: 14px; height: 28px; margin-left: -7px; border-radius: 5px; background: ${C.texto}; box-shadow: 0 2px 8px rgba(0,0,0,.45); }
.t4an-pista-rot { position: absolute; top: 30px; font: 600 12px/1 "Sora", "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4an-fila { display: grid; gap: 2px; min-width: 0; padding-top: 4px; }
.t4an-nom { display: grid; max-width: calc(${RAYA}% - 10px); font-size: 13px; line-height: 1.35; color: ${C.texto2}; min-width: 0; }
.t4an-nom > span { white-space: nowrap; }
.t4an-nom > span.g { font-size: 12px; line-height: 1.3; }
.t4an-fila[data-estado="plata"] .t4an-nom, .t4an-fila[data-estado="consumio"] .t4an-nom { color: ${C.texto}; }
.t4an-fila[data-estado="plata"] .t4an-nom > span:not(.g) { font-weight: 600; }
.t4an-carril { position: relative; height: 22px; }
.t4an-base { position: absolute; left: 0; width: ${RAYA}%; top: 10px; height: 1px; background: rgba(184,196,212,0.35); }
.t4an-tic { position: absolute; top: 3px; width: 2px; height: 16px; margin-left: -1px; background: ${C.texto}; }
.t4an-chip { position: absolute; top: 1px; height: 20px; padding: 0 6px; border: 1px solid ${C.texto}; border-radius: 6px; font: 600 12px/18px "Inter", sans-serif; color: ${C.texto}; white-space: nowrap; }
.t4an-sigue { position: absolute; left: ${RAYA}%; right: 0; top: 10px; height: 2px; background: ${C.texto2}; }
.t4an-sigue::after { content: ""; position: absolute; right: 0; top: -4px; border-left: 7px solid ${C.texto2}; border-top: 5px solid transparent; border-bottom: 5px solid transparent; }
.t4an-seg { position: absolute; top: 0; height: 44px; border-radius: 8px; border: 1px solid ${C.reposo}; background: transparent; color: ${C.texto2}; font: 500 13px "Inter", sans-serif; cursor: pointer; padding: 0 8px; text-align: left; }
.t4an-seg[aria-pressed="true"] { border: 2px solid ${C.texto}; color: ${C.texto}; font-weight: 600; }
.t4an-seg[data-veredicto="bien"] { border: 2px solid ${C.texto}; }
.t4an-seg[data-veredicto="mal"] { border: 2px solid ${C.error}; }
.t4an-seg:disabled { cursor: default; }
/* La línea de marcas de cada fila (P2 de Hanayama, §3.10): 20 px reservados bajo el carril, a 2 px; la pastilla de «antes» al inicio y la de «después» al final. */
.t4an-linea { display: flex; min-height: 20px; margin-top: 2px; }
.t4an-linea[data-lado="despues"] { justify-content: flex-end; }
.t4an-pie { display: flex; justify-content: flex-end; }
`;

/* El mes de la figura, y cómo se pasa el año (con o sin animar). */
export function useAno(inicial = 0) {
  const reducido = useMovimientoReducido();
  const [m, setM] = useState(inicial);
  const raf = useRef(0);
  const parar = () => globalThis.cancelAnimationFrame?.(raf.current);
  const pasar = (alFinal) => {
    parar();
    if (reducido) { setM(12); alFinal?.(); return; }
    const desde = m >= 12 ? 0 : m;
    const t0 = performance.now();
    const dur = (12 - desde) * MS_POR_MES;
    const paso = (t) => {
      const x = Math.min(12, desde + ((t - t0) / dur) * (12 - desde));
      setM(x);
      if (x < 12) raf.current = requestAnimationFrame(paso); else alFinal?.();
    };
    raf.current = requestAnimationFrame(paso);
  };
  useEffect(() => parar, []);
  return { m, setM: (x) => { parar(); setM(x); }, pasar };
}

function Pista({ m, setM }) {
  const ref = useRef(null);
  const arrastra = useRef(false);
  const aMes = (x) => {
    const r = ref.current.getBoundingClientRect();
    return Math.max(0, Math.min(12, Math.round(((x - r.left) / ((r.width * RAYA) / 100)) * 12)));
  };
  const x = `${(m / 12) * RAYA}%`;
  return (
    <div
      ref={ref}
      className="t4an-pista"
      role="slider"
      tabIndex={0}
      aria-label={FIGURA_ANO.pista}
      aria-valuemin={0}
      aria-valuemax={12}
      aria-valuenow={Math.round(m)}
      aria-valuetext={FIGURA_ANO.valorPista(Math.round(m))}
      data-pista
      onPointerDown={(e) => { arrastra.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); setM(aMes(e.clientX)); }}
      onPointerMove={(e) => { if (arrastra.current) setM(aMes(e.clientX)); }}
      onPointerUp={() => { arrastra.current = false; }}
      onKeyDown={(e) => {
        const k = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
        if (k) { e.preventDefault(); setM(Math.max(0, Math.min(12, Math.round(m) + k))); }
        if (e.key === "Home") { e.preventDefault(); setM(0); }
        if (e.key === "End") { e.preventDefault(); setM(12); }
      }}
    >
      <span className="t4an-pista-linea" aria-hidden="true" />
      <span className="t4an-pomo" aria-hidden="true" style={{ left: x }} />
      <span className="t4an-pista-rot" style={{ left: 0 }} aria-hidden="true">{FIGURA_ANO.hoy}</span>
      <span className="t4an-pista-rot" style={{ right: `calc(${100 - RAYA}% + 6px)` }} aria-hidden="true">{FIGURA_ANO.unAno}</span>
    </div>
  );
}

function Fila({ f, m, juego = null }) {
  const est = estadoFilaA0(f, m);
  const x = f.mes != null ? (f.mes / 12) * RAYA : 0;
  const chip = est === "plata" ? FIGURA_ANO.marca.plata : est === "consumio" ? FIGURA_ANO.marca.consumio : null;
  const izq = x > RAYA * 0.6;
  /* Solo se marca lo elegido: en Aprender, «era» nombraría la respuesta antes de reintentar. */
  const verDe = (lado) => (juego?.fin && juego.eleccion === lado ? (ladoCorrectoA0(f) === lado ? "bien" : "mal") : null);
  const conMarca = juego ? ["antes", "despues"].find((l) => verDe(l)) : null;
  return (
    <div className="t4an-fila" data-fila={f.id} data-estado={est}>
      <div className="t4an-nom">
        {f.texto.map((t) => <span key={t}>{t}</span>)}
        {f.glosa.map((t) => <span key={t} className="g">{t}</span>)}
      </div>
      <div className="t4an-carril" style={juego ? { height: "44px" } : undefined}>
        {juego ? ["antes", "despues"].map((lado) => {
          const elegido = juego.eleccion === lado;
          /* El lector oye la palabra de la marca en el nombre de la casilla (Katsumi). */
          const ver = verDe(lado);
          return (
            <button
              key={lado}
              type="button"
              className="t4an-seg"
              data-seg={lado}
              data-veredicto={ver ?? undefined}
              aria-pressed={elegido}
              aria-label={`${f.texto.join(" ")}: ${FIGURA_ANO.casilla[lado]}${ver ? `: ${MARCA[ver]}` : ""}`}
              disabled={juego.fin}
              onClick={() => juego.elegir(lado)}
              style={lado === "antes" ? { left: 0, width: `calc(${RAYA}% - 4px)` } : { left: `calc(${RAYA}% + 4px)`, right: 0 }}
            />
          );
        }) : <span className="t4an-base" aria-hidden="true" />}
        {chip && (
          <span aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", top: juego ? "11px" : 0 }}>
            <span className="t4an-tic t4r-nueva" style={{ left: `${x}%` }} />
            <span className="t4an-chip t4r-nueva" data-marca-fila={est} style={izq ? { right: `calc(${100 - x}% + 5px)` } : { left: `calc(${x}% + 5px)` }}>{chip}</span>
          </span>
        )}
        {est === "despues" && !juego && <span className="t4an-sigue t4r-nueva" data-cruza aria-hidden="true" />}
      </div>
      {juego && <div className="t4an-linea" data-linea-fila={f.id} data-lado={conMarca ?? undefined} aria-hidden="true">{conMarca && <Marca marca={verDe(conMarca)} />}</div>}
    </div>
  );
}

export function FiguraAno({ filas, ano, quieta = false, boton = null, juego = null, rotulo = null }) {
  const idAlt = useId();
  const { m, setM } = ano;
  return (
    <figure className="t4an" data-figura="ano" data-mes={Math.round(m)} aria-describedby={idAlt}>
      {/* Lote B, capa 1: el rótulo de instrucción, sobre la pista (Hanayama §2.1). */}
      {rotulo && <p className="t4r-rotacc" data-rotulo-accion>{rotulo}</p>}
      <div className="t4an-cab" aria-hidden="true">
        <span className="t4an-zona" style={{ left: 0 }}>{FIGURA_ANO.zonaSi.map((t) => <span key={t}>{t}</span>)}</span>
        <span className="t4an-zona t4an-zona-no">{FIGURA_ANO.zonaNo.map((t) => <span key={t}>{t}</span>)}</span>
      </div>
      <div className="t4an-cuerpo">
        <span className="t4an-raya" aria-hidden="true" />
        {quieta ? (
          <div style={{ height: "44px", position: "relative" }} aria-hidden="true">
            <span className="t4an-pista-linea" />
            <span className="t4an-pista-rot" style={{ left: 0 }}>{FIGURA_ANO.hoy}</span>
            <span className="t4an-pista-rot" style={{ right: `calc(${100 - RAYA}% + 6px)` }}>{FIGURA_ANO.unAno}</span>
          </div>
        ) : <Pista m={m} setM={setM} />}
        <div style={{ position: "relative", display: "grid", gap: "4px" }}>
          {!quieta && m > 0 && m < 12 && <span className="t4an-mano" style={{ left: `${(m / 12) * RAYA}%` }} aria-hidden="true" />}
          {filas.map((f) => (
            <Fila key={f.id} f={f} m={m} juego={juego ? { ...juego, eleccion: juego.elecciones[f.id] ?? null, elegir: (l) => juego.elegir(f.id, l) } : null} />
          ))}
        </div>
      </div>
      {boton && <div className="t4an-pie">{boton}</div>}
      <figcaption id={idAlt} className="t4f-sr">{FIGURA_ANO.alt}</figcaption>
    </figure>
  );
}

/* El cuerpo de una pantalla de A0: la figura y, en el juego, la devolución. */
export function CuerpoA0({ p, onAcierto, onAccion }) {
  const quieta = p.modo === "quieta";
  const ano = useAno(quieta ? 12 : 0);
  /* Lote B, capa 1: con el primer arrastre o «Pasar el año», aparece el texto de debajo. */
  const movido = !quieta && ano.m > 0;
  useEffect(() => { if (movido) onAccion?.(); }, [movido]); // eslint-disable-line react-hooks/exhaustive-deps
  const [elecciones, setElecciones] = useState({});
  const [fin, setFin] = useState(false);
  const juego = p.modo === "juego";
  const listas = juego ? p.filas.every((f) => elecciones[f.id]) : true;
  /* D7: «Pasar el año» nunca se apaga; con filas sin marcar, un aviso neutro (no es una devolución), que se va al marcar la que faltaba (Katsumi). */
  const [aviso, setAviso] = useState(false);
  const verAviso = juego && aviso && !listas && !fin;
  const bien = juego && fin && juegoBienA0(p.filas, elecciones);
  useEffect(() => { if (bien) onAcierto?.(); }, [bien]); // eslint-disable-line react-hooks/exhaustive-deps

  let boton = null;
  if (juego) {
    boton = fin
      ? <button type="button" className="t4r-btn2" data-accion="otra-vez" onClick={() => { setFin(false); setElecciones({}); ano.setM(0); }}>{FIGURA_ANO.otraVez}</button>
      : <button type="button" className="t4r-btn2" data-accion="pasar" onClick={() => { if (!listas) { setAviso(true); return; } setAviso(false); ano.pasar(() => setFin(true)); }}>{FIGURA_ANO.pasar}</button>;
  } else if (!quieta) {
    boton = ano.m >= 12
      ? <button type="button" className="t4r-btn2" data-accion="volver" onClick={() => ano.setM(0)}>{FIGURA_ANO.volver}</button>
      : <button type="button" className="t4r-btn2" data-accion="pasar" onClick={() => ano.pasar()}>{FIGURA_ANO.pasar}</button>;
  }
  const datosJuego = juego ? { elecciones, fin, elegir: (id, l) => !fin && setElecciones((e) => ({ ...e, [id]: l })) } : null;

  return (
    <>
      <FiguraAno filas={p.filas} ano={ano} quieta={quieta} boton={boton} juego={datosJuego} rotulo={p.rotuloAccion ?? null} />
      {juego && <p className="t4r-aviso" data-aviso aria-live="polite">{verAviso ? FIGURA_ANO.aviso : null}</p>}
      {juego && fin && <Mensaje ok={bien} texto={bien ? p.acierto : p.error} />}
    </>
  );
}
