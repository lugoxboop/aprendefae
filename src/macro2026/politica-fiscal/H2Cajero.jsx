/*
 * H2 · ¿Qué cajero te cobra? (pf26-h2-cajero, Hacer, Fácil, 10 FP × %).
 * Especificación de Gen, t3 §2 H2. Los dos cajeros de A3: a la izquierda el
 * directo (lupa), a la derecha el indirecto (código de barras), cada uno al
 * 40 % del ancho. La tarjeta del tributo se desliza con el dedo hacia un lado,
 * con las flechas del teclado, o se toca el cajero. Acierto: el cajero la
 * recibe y hace su gesto (la lupa se acerca, el lector pasa). Error: la
 * tarjeta vuelve al centro con borde coral y la retro; segundo intento sin
 * puntaje. Partida: 8 de 12. Puntaje = aciertos al primer intento / 8.
 *
 * La tarjeta lleva `touch-action: pan-y`: el deslizamiento horizontal es de
 * la pieza y el vertical sigue moviendo la página.
 */
import { useMemo, useRef, useState } from "react";
import { BORDE, CORAL, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { IconoDirecto, IconoIndirecto } from "../comun/iconos-pf.jsx";
import { A3, BANCO_H2, CONSIGNAS, PARTIDA_H2, ESCENAS } from "./textos.js";

export const ID = "pf26-h2-cajero";
export const prepararH2 = (rng = Math.random) => sortear(BANCO_H2, PARTIDA_H2, rng);
const UMBRAL = 60;
const LADO = { directo: -1, indirecto: 1 };

const CSS = `
.pf26-h2-tarjeta { display: block; width: 100%; min-height: 72px; padding: 12px 14px; border-radius: 14px; border: 2px solid ${INK}; background: ${FONDO}; color: ${INK}; font: 600 17px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: center; cursor: grab; touch-action: pan-y; -webkit-user-select: none; user-select: none; transition: transform 280ms cubic-bezier(.3,.9,.4,1), opacity 280ms cubic-bezier(.3,.9,.4,1); }
.pf26-h2-tarjeta[data-moviendo="1"] { transition: none; cursor: grabbing; }
.pf26-h2-tarjeta[data-estado="mal"] { border-color: ${CORAL}; }
.pf26-h2-pista { display: flex; justify-content: space-between; margin: 6px 4px 8px; font: 600 13px/1 var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; }
.pf26-h2-cajeros { display: flex; justify-content: space-between; gap: 8px; }
.pf26-h2-cajero { width: 40%; min-height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 8px 4px; border-radius: 14px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 700 15px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pf26-h2-cajero[data-recibe="1"] { border-color: ${INK}; background: ${SUPERFICIE_2}; }
.pf26-h2-cajero[data-recibe="1"] .pf26-h2-gesto { animation: pf26-h2-gesto 520ms cubic-bezier(.3,.9,.4,1) 1; }
@keyframes pf26-h2-gesto { 0% { transform: none; } 40% { transform: scale(1.25) rotate(-8deg); } 100% { transform: none; } }
.pf26-h2-recibida { font: 600 13px/1.25 var(--planck-font-sans, system-ui, sans-serif); text-align: center; }
@media (prefers-reduced-motion: reduce) { .pf26-h2-tarjeta { transition: opacity 120ms linear; } .pf26-h2-cajero[data-recibe="1"] .pf26-h2-gesto { animation: none; } }
`;

export default function H2Cajero({ onTerminar, rng = null }) {
  const tarjetas = useMemo(() => prepararH2(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [intento, setIntento] = useState(1);
  const [detalle, setDetalle] = useState([]);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const [rojo, setRojo] = useState(false);
  const [recibe, setRecibe] = useState(null);
  const [dx, setDx] = useState(0);
  const gesto = useRef(null);
  const t = tarjetas[n];

  const elegir = (cajero) => {
    if (!t || recibe) return;
    setDx(0);
    if (cajero === t.correcta) {
      if (intento === 1) setDetalle((d) => [...d, { item: t.id, ok: true, subtemas: t.subtemas }]);
      setRetro(null);
      setRecibe(cajero);
      return;
    }
    setRetro(t.retro);
    setMal((m) => m + 1);
    setRojo(true);
    setTimeout(() => setRojo(false), 300);
    if (intento === 1) {
      setDetalle((d) => [...d, { item: t.id, ok: false, subtemas: t.subtemas }]);
      setIntento(2);
    } else {
      setRecibe(t.correcta);
    }
  };

  const seguir = () => {
    if (n + 1 >= tarjetas.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / tarjetas.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setIntento(1);
    setRecibe(null);
    setRetro(null);
  };

  const tarjeta = {
    onPointerDown: (e) => {
      if (recibe || (e.button !== undefined && e.button !== 0)) return;
      gesto.current = { x0: e.clientX, y0: e.clientY, horizontal: null };
    },
    onPointerMove: (e) => {
      const g = gesto.current;
      if (!g) return;
      const ddx = e.clientX - g.x0, ddy = e.clientY - g.y0;
      if (g.horizontal == null && Math.hypot(ddx, ddy) > 8) {
        g.horizontal = Math.abs(ddx) > Math.abs(ddy);
        if (g.horizontal) e.currentTarget.setPointerCapture?.(e.pointerId);
      }
      if (g.horizontal) setDx(ddx);
    },
    onPointerUp: (e) => {
      const g = gesto.current;
      gesto.current = null;
      if (!g?.horizontal) return;
      const ddx = e.clientX - g.x0;
      if (Math.abs(ddx) >= UMBRAL) elegir(ddx < 0 ? "directo" : "indirecto");
      else setDx(0);
    },
    onPointerCancel: () => { gesto.current = null; setDx(0); },
    onKeyDown: (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); elegir("directo"); }
      if (e.key === "ArrowRight") { e.preventDefault(); elegir("indirecto"); }
    },
  };

  const desplazada = recibe ? LADO[recibe] * 140 : dx;
  return (
    <MarcoHacer id={ID} escena={ESCENAS[ID]} mini={{ texto: ESCENAS[ID].porRonda.todas }} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${tarjetas.length}`}>
      <style>{CSS}</style>
      <div data-figura>
        <div className="da26-entra" key={t.id} style={{ overflow: "hidden", padding: "2px" }}>
          <button
            type="button" key={`${t.id}-${mal}`}
            className={`pf26-h2-tarjeta${retro && !recibe ? " da26-tiembla" : ""}`}
            data-tarjeta={t.id}
            data-estado={rojo ? "mal" : undefined}
            data-moviendo={dx !== 0 && !recibe ? "1" : undefined}
            aria-label={`${t.texto}. Desliza a la izquierda para el directo o a la derecha para el indirecto; también con las flechas, o toca un cajero.`}
            style={{ transform: `translateX(${desplazada}px)`, opacity: recibe ? 0 : 1 }}
            {...tarjeta}
          >
            {t.texto}
          </button>
        </div>
        <div className="pf26-h2-pista" aria-hidden="true"><span>← {A3.directo}</span><span>{A3.indirecto} →</span></div>
        <div className="pf26-h2-cajeros" role="group" aria-label="Los dos cajeros">
          {["directo", "indirecto"].map((c) => (
            <button key={c} type="button" className="pf26-h2-cajero" data-cajero={c} data-recibe={recibe === c ? "1" : "0"}
              disabled={Boolean(recibe)} aria-label={`Cajero ${c === "directo" ? A3.directo : A3.indirecto}`} onClick={() => elegir(c)}>
              <span className="pf26-h2-gesto" style={{ display: "inline-block" }}>{c === "directo" ? <IconoDirecto size={44} /> : <IconoIndirecto size={44} />}</span>
              <span>{c === "directo" ? A3.directo : A3.indirecto}</span>
              {recibe === c && <span className="pf26-h2-recibida da26-entra" data-recibida>{t.texto}</span>}
            </button>
          ))}
        </div>
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
      <div className="da26-nav">
        <span />
        <Boton primario onClick={seguir} disabled={!recibe} data-siguiente>{n + 1 >= tarjetas.length ? "Terminar" : "Siguiente tributo"}</Boton>
      </div>
    </MarcoHacer>
  );
}
