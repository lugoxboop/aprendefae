/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA BANDA DE DECORACIÓN DE LAS TABLAS DE POSICIONES.
 *
 * Forma: vida-visual-v1 §5 y §7 (Ukyo, #545). Sitio, piezas y poses:
 * zonas-hanayama.md v3 (Hanayama). La montan RankingFP y LigaBoard SOLO si
 * reciben `decoracion = { piezas, bucle, fae }`; sin ella no se pinta nada y
 * la tabla queda como antes.
 *
 *   · una banda propia de 56 px (72 desde 375) con 14 px debajo, entre la
 *     cabecera de la tabla y lo que esa cabecera presenta. Nunca por detrás
 *     de texto. `overflow: hidden`: es el sobre del movimiento
 *   · tres piezas como máximo, con UN solo juego de keyframes («flota»): lo
 *     que varía es duración, retardo, altura y giro (por variables)
 *   · Fae, a la derecha, en pose estática; no cuenta en los tres
 *
 * Las cinco condiciones de la §7, todas, o no hay bucle:
 *   1. pausa fuera de pantalla: IntersectionObserver sobre la banda
 *   2. pausa con la pestaña oculta: visibilitychange
 *   3. pose de reposo, quieta, con shouldRenderStatic() (movimiento reducido
 *      o gama baja) y cuando la tabla pide `bucle: false` o está cargando
 *   4. solo transform
 *   5. sin will-change
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { shouldRenderStatic } from "../../utils/device.js";
import { Dibujo, FAE_POSES, PIEZAS } from "./piezas.jsx";

/* §1.4 de Hanayama: reposo (x, y) a 320 y a 375; §3: duración, retardo y altura de cada lugar. */
const LUGARES = [
  { a320: [12, 14], a375: [16, 18], dur: 3600, retardo: 0, alto: -6 },
  { a320: [74, 22], a375: [92, 28], dur: 5100, retardo: 900, alto: -5 },
  { a320: [136, 8], a375: [168, 10], dur: 7200, retardo: 1700, alto: -6 },
];

export const CSS_BANDA = `
.vv-banda { position: relative; height: 56px; margin-bottom: 14px; overflow: hidden; pointer-events: none; }
.vv-banda .vv-pieza { position: absolute; left: var(--vv-x320); top: var(--vv-y320); width: 32px; height: 32px; }
.vv-banda .vv-pieza > svg { display: block; width: 100%; height: 100%; }
.vv-banda .vv-fae { position: absolute; right: 0; top: 6px; width: 44px; height: 44px; }
.vv-banda .vv-fae > svg { display: block; width: 100%; height: 100%; }
@media (min-width: 375px) {
  .vv-banda { height: 72px; }
  .vv-banda .vv-pieza { left: var(--vv-x375); top: var(--vv-y375); width: 40px; height: 40px; }
  .vv-banda .vv-fae { top: 14px; }
}
@keyframes vv-flota {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(var(--vv-alto, -6px)) rotate(var(--vv-giro, 0deg)); }
}
.vv-banda[data-bucle] .vv-pieza { animation: vv-flota var(--vv-dur) cubic-bezier(.3,.9,.4,1) var(--vv-retardo) infinite; }
.vv-banda[data-pausa] .vv-pieza { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) { .vv-banda .vv-pieza { animation: none !important; } }
`;

/*
 * piezas  ids de PIEZAS, hasta 3 (A, B y C)
 * bucle   si las piezas flotan (una sola banda en bucle por página)
 * fae     la pose de Fae ("saluda", "celebra", "mira") o null
 */
export default function BandaDecoracion({ piezas = [], bucle = true, fae = null }) {
  const ref = useRef(null);
  /* Condición 3: movimiento reducido o gama baja → pose de reposo, quieta. Se decide al montar. */
  const [estatica] = useState(() => (typeof window === "undefined" ? true : shouldRenderStatic()));
  const corre = bucle && !estatica;
  const [aLaVista, setALaVista] = useState(true);
  const [visible, setVisible] = useState(() => typeof document === "undefined" || document.visibilityState !== "hidden");

  /* Condición 1: fuera de pantalla, en pausa. */
  useEffect(() => {
    if (!corre || !ref.current || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setALaVista(e.isIntersecting), { threshold: 0 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [corre]);

  /* Condición 2: con la pestaña oculta, en pausa. */
  useEffect(() => {
    if (!corre) return undefined;
    const alCambiar = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", alCambiar);
    return () => document.removeEventListener("visibilitychange", alCambiar);
  }, [corre]);

  const pausa = corre && (!aLaVista || !visible);
  return (
    <div
      ref={ref}
      className="vv-banda"
      data-banda
      data-bucle={corre ? "" : undefined}
      data-pausa={pausa ? "" : undefined}
      aria-hidden="true"
    >
      <style>{CSS_BANDA}</style>
      {piezas.slice(0, 3).map((id, k) => {
        const pieza = PIEZAS[id];
        const l = LUGARES[k];
        if (!pieza) return null;
        return (
          <span
            key={id}
            className="vv-pieza"
            data-pieza={id}
            style={{
              "--vv-x320": `${l.a320[0]}px`, "--vv-y320": `${l.a320[1]}px`,
              "--vv-x375": `${l.a375[0]}px`, "--vv-y375": `${l.a375[1]}px`,
              "--vv-dur": `${l.dur}ms`, "--vv-retardo": `${l.retardo}ms`, "--vv-alto": `${l.alto}px`,
              "--vv-giro": pieza.giro ?? "0deg",
            }}
          >
            <Dibujo pieza={pieza} tamano={40} />
          </span>
        );
      })}
      {fae && FAE_POSES[fae] && (
        <span className="vv-fae" data-fae={fae}><Dibujo pieza={FAE_POSES[fae]} tamano={44} /></span>
      )}
    </div>
  );
}
