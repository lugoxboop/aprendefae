/*
 * H3 · Conecta los cables (pe26-h3-cables, Hacer, Medio, 25 FP × %).
 * Especificación de Gen, t2 §2 H3. Arriba va la máquina de la DA de A4 en
 * miniatura: la ecuación, en una franja de 80 px. Abajo a la izquierda, los
 * enchufes; a la derecha, las cuatro tomas, con el ícono y el nombre de cada
 * rama. El cable se arrastra del enchufe a una toma; también vale tocar el
 * enchufe y luego la toma, o usar el teclado.
 * - Acierto: el cable se tiende en el tono de la rama y en la máquina late el
 *   término que esa rama mueve.
 * - Error: el enchufe se suelta y tiembla, borde coral 300 ms, sale la
 *   retroalimentación de ESA toma, y hay un segundo intento que ya no puntúa.
 * Partida: 8 instrumentos sorteados de 9. Puntaje = aciertos al primer
 * intento / 8.
 *
 * Decisión (construccion-t2.md): si el segundo intento también yerra, el
 * cable va solo a su toma con la retro a la vista (como H1 de T1).
 */
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { CORAL, FONDO, INK, INK_2, BORDE } from "../comun/colores-da.js";
import { MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { sortear, azarDeLaPagina } from "../comun/azar.js";
import { useArrastre } from "../comun/arrastre.js";
import { RAMAS, ORDEN_RAMAS, colorRama, TERMINOS_RAMA } from "../comun/ramas.js";
import { IconoRama } from "../comun/iconos-pe.jsx";
import { BANCO_H3, CONSIGNAS, PARTIDA_H3 } from "./textos.js";

export const ID = "pe26-h3-cables";

export function prepararH3(rng = Math.random) {
  return sortear(BANCO_H3, PARTIDA_H3, rng);
}

const CSS = `
.pe26-h3-maq { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 2px 4px; min-height: 64px; max-height: 80px; padding: 6px 8px; margin-bottom: 12px; border: 1px solid ${BORDE}; border-radius: 12px; font: 600 14px/1.25 var(--planck-font-mono, monospace); color: ${INK_2}; }
.pe26-h3-term { display: inline-block; min-width: 1.4em; padding: 2px 4px; border-radius: 6px; text-align: center; color: ${INK}; border: 1px solid ${BORDE}; }
.pe26-h3-term[data-late="1"] { background: var(--rama); color: #121418; border-color: var(--rama); animation: pe26-h3-late 560ms cubic-bezier(.3,.9,.4,1) 1; }
@keyframes pe26-h3-late { 0% { transform: scale(1); } 40% { transform: scale(1.25); } 100% { transform: scale(1); } }
.pe26-h3-tablero { position: relative; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 10px 22px; align-items: start; }
.pe26-h3-col { display: flex; flex-direction: column; gap: 8px; position: relative; z-index: 2; }
.pe26-h3-enchufe { display: flex; align-items: center; min-height: 48px; padding: 6px 10px; border-radius: 10px; border: 2px solid ${INK_2}; background: ${FONDO}; color: ${INK}; font: 600 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.pe26-h3-enchufe[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK_2}; }
.pe26-h3-enchufe[data-arrastrando="1"] { transition: none; cursor: grabbing; box-shadow: 0 10px 24px rgba(0,0,0,.5); }
.pe26-h3-enchufe[data-estado="mal"] { border-color: ${CORAL}; }
.pe26-h3-enchufe[data-conectado] { cursor: default; border-color: var(--rama); }
.pe26-h3-toma { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 64px; padding: 6px 4px; text-align: center; border-radius: 10px; border: 2px solid var(--rama); background: ${FONDO}; color: ${INK}; font: 600 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pe26-h3-toma[data-blanco="1"] { box-shadow: 0 0 0 3px var(--rama); }
.pe26-h3-cables { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; overflow: visible; }
.pe26-h3-cable { stroke-dasharray: 400; stroke-dashoffset: 0; animation: pe26-h3-tiende 420ms cubic-bezier(.3,.9,.4,1) 1; }
@keyframes pe26-h3-tiende { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { .pe26-h3-enchufe { transition: none; } .pe26-h3-term[data-late="1"], .pe26-h3-cable { animation: none; } }
`;

/* La máquina de A4 en miniatura: DA = C̄ + c(Y + TR − tY) + Ī − b·i + G + XN. */
function Maquina({ late }) {
  const rama = late?.rama;
  const T = (t) => (
    <span className="pe26-h3-term" data-termino={t} data-late={rama && TERMINOS_RAMA[rama].includes(t) ? "1" : "0"}
      key={`${t}-${late?.n ?? 0}`} style={{ "--rama": rama ? colorRama(rama) : INK }}>{t}</span>
  );
  return (
    <div className="pe26-h3-maq" data-maquina aria-label="DA = C̄ + c(Y + TR − tY) + Ī − b·i + G + XN">
      <span>DA = C̄ + c(Y +</span>{T("TR")}<span>−</span>{T("t")}<span>Y) + Ī − b·</span>{T("i")}<span>+</span>{T("G")}<span>+</span>{T("XN")}
    </div>
  );
}

export default function H3Cables({ onTerminar, rng = null }) {
  const instrumentos = useMemo(() => prepararH3(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [conectados, setConectados] = useState({});
  const [intentos, setIntentos] = useState({});
  const [detalle, setDetalle] = useState([]);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const [rojo, setRojo] = useState(null);
  const [late, setLate] = useState(null);
  const [lineas, setLineas] = useState([]);
  const [cerrado, setCerrado] = useState(false);
  const tablero = useRef(null);
  const enchufes = useRef({});
  const tomas = useRef({});

  const conectar = (x, rama, det) => {
    const nuevos = { ...conectados, [x.id]: rama };
    setConectados(nuevos);
    setLate({ rama, n: Object.keys(nuevos).length });
    if (Object.keys(nuevos).length >= instrumentos.length) {
      setCerrado(true);
      setTimeout(() => {
        const bien = det.filter((d) => d.ok).length;
        onTerminar?.({ pct: Math.round((bien / instrumentos.length) * 100), detalle: det, duracionMs: tiempo() });
      }, 1100);
    }
  };

  const soltar = (id, rama) => {
    const x = instrumentos.find((i) => i.id === id);
    if (!x || conectados[id] || cerrado) return;
    const intento = intentos[id] ?? 1;
    if (rama === x.rama) {
      const det = intento === 1 ? [...detalle, { item: x.id, ok: true, subtemas: x.subtemas }] : detalle;
      setDetalle(det);
      setRetro(null);
      conectar(x, rama, det);
      return;
    }
    /* Error: el cable se suelta, borde coral 300 ms y la retro de ESA toma. */
    setRetro(x.retro[rama]);
    setMal((m) => m + 1);
    setRojo(id);
    setTimeout(() => setRojo(null), 300);
    if (intento === 1) {
      const det = [...detalle, { item: x.id, ok: false, subtemas: x.subtemas }];
      setDetalle(det);
      setIntentos({ ...intentos, [id]: 2 });
    } else {
      /* Segundo error: el cable va solo a su toma (decisión anotada). */
      conectar(x, x.rama, detalle);
    }
  };

  const { contenedor, pieza, destino } = useArrastre({ alSoltar: soltar, activo: !cerrado, raiz: tablero });

  /* Los cables tendidos: del borde derecho del enchufe al izquierdo de la toma. */
  useLayoutEffect(() => {
    const medir = () => {
      const base = tablero.current?.getBoundingClientRect();
      if (!base) return;
      setLineas(Object.entries(conectados).map(([id, rama]) => {
        const a = enchufes.current[id]?.getBoundingClientRect();
        const b = tomas.current[rama]?.getBoundingClientRect();
        if (!a || !b) return null;
        return { id, rama, x1: a.right - base.left, y1: a.top + a.height / 2 - base.top, x2: b.left - base.left, y2: b.top + b.height / 2 - base.top };
      }).filter(Boolean));
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [conectados]);

  const hechos = Object.keys(conectados).length;
  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${hechos} / ${instrumentos.length}`}>
      <style>{CSS}</style>
      <div data-figura ref={contenedor}>
        <Maquina late={late} />
        <div className="pe26-h3-tablero" ref={tablero}>
          <svg className="pe26-h3-cables" aria-hidden="true">
            {lineas.map((l) => (
              <path key={l.id} className="pe26-h3-cable" data-cable={l.id} fill="none" stroke={colorRama(l.rama)} strokeWidth="3" strokeLinecap="round"
                d={`M${l.x1},${l.y1} C${l.x1 + 18},${l.y1} ${l.x2 - 18},${l.y2} ${l.x2},${l.y2}`} />
            ))}
          </svg>
          <div className="pe26-h3-col" role="group" aria-label="Instrumentos">
            {instrumentos.map((x) => {
              const r = conectados[x.id];
              const props = r ? {} : pieza(x.id);
              return (
                <button
                  key={`${x.id}-${rojo === x.id ? mal : 0}`}
                  ref={(el) => { enchufes.current[x.id] = el; }}
                  type="button"
                  className={`pe26-h3-enchufe${rojo === x.id ? " da26-tiembla" : ""}`}
                  data-enchufe={x.id}
                  data-conectado={r || undefined}
                  data-estado={rojo === x.id ? "mal" : r ? "bien" : undefined}
                  disabled={Boolean(r)}
                  aria-label={r ? `${x.nombre}: conectado a ${RAMAS[r].largo}` : `${x.nombre}. Tócalo y luego una rama, o arrástralo.`}
                  {...props}
                  style={{ ...(props.style ?? {}), "--rama": r ? colorRama(r) : INK_2 }}
                >
                  {x.nombre}{r ? " ✓" : ""}
                </button>
              );
            })}
          </div>
          <div className="pe26-h3-col" role="group" aria-label="Las cuatro ramas">
            {ORDEN_RAMAS.map((r) => (
              <button
                key={r}
                ref={(el) => { tomas.current[r] = el; }}
                type="button"
                className="pe26-h3-toma da26-marcable"
                data-toma={r}
                style={{ "--rama": colorRama(r) }}
                aria-label={`Conectar a ${RAMAS[r].largo}`}
                {...destino(r)}
              >
                <IconoRama id={r} size={26} />
                <span>{RAMAS[r].nombre}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
    </MarcoHacer>
  );
}
