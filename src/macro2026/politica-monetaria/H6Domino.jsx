/*
 * H6 · El dominó de la tasa (pm26-h6-domino, Hacer, Medio, 25 FP × %).
 * Especificación de Gen, t4 §2 H6. Fichas de dominó de pie, revueltas, en
 * columna (de arriba abajo, ≥ 56 px; decisión 8: en columna a todo ancho, no
 * solo a 320). Se reordenan tocando dos para intercambiarlas (también con
 * teclado: son botones). «Empujar»: si el orden está bien, caen todas en
 * cadena (120 ms entre fichas); si no, la cadena se detiene en la primera
 * ficha fuera de lugar, que se pinta coral y muestra su retro.
 * Partida: 2 cadenas de 3. Puntaje = fichas en su lugar en el primer
 * empujón / total de fichas.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { BORDE, CORAL, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, barajar, sortear } from "../comun/azar.js";
import { MONETARIA } from "./comun-pm.jsx";
import { BANCO_H6, CONSIGNAS, H6, PARTIDA_H6 } from "./textos.js";

export const ID = "pm26-h6-domino";
/* Cada cadena sale revuelta y nunca ya ordenada. */
export function prepararH6(rng = Math.random) {
  return sortear(BANCO_H6, PARTIDA_H6, rng).map((c) => {
    let orden = barajar(c.fichas, rng);
    for (let k = 0; k < 5 && orden.every((f, i) => f.orden === i); k += 1) orden = barajar(c.fichas, rng);
    if (orden.every((f, i) => f.orden === i)) orden = [...orden.slice(1), orden[0]];
    return { ...c, revuelta: orden };
  });
}
export const primeraFuera = (orden) => orden.findIndex((f, i) => f.orden !== i);
export const CAIDA_MS = 120;

const CSS = `
.pm26-h6-fila { margin-bottom: 6px; }
.pm26-h6-ficha { position: relative; display: flex; width: 100%; align-items: center; gap: 10px; min-height: 56px; padding: 8px 12px; border-radius: 10px; border: 2px solid ${INK_2}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; touch-action: manipulation; transform-origin: top center; transition: transform 300ms cubic-bezier(.5,0,.75,0), opacity 300ms linear; }
.pm26-h6-ficha[aria-pressed="true"] { border-color: ${MONETARIA}; box-shadow: 0 0 0 3px ${MONETARIA}; }
.pm26-h6-ficha[data-estado="mal"] { border-color: ${CORAL}; }
.pm26-h6-ficha[data-cae="1"] { transform: perspective(400px) rotateX(-70deg) translateY(6px); opacity: .55; }
.pm26-h6-puntos { flex: none; width: 10px; display: grid; gap: 4px; }
.pm26-h6-puntos i { width: 6px; height: 6px; border-radius: 50%; background: ${INK_2}; }
@media (prefers-reduced-motion: reduce) { .pm26-h6-ficha { transition: opacity 120ms linear; } .pm26-h6-ficha[data-cae="1"] { transform: none; } }
`;

export default function H6Domino({ onTerminar, rng = null }) {
  const cadenas = useMemo(() => prepararH6(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [orden, setOrden] = useState(cadenas[0].revuelta);
  const [elegida, setElegida] = useState(null);
  const [caidas, setCaidas] = useState(0);
  const [empujes, setEmpujes] = useState(0);
  const [parada, setParada] = useState(null);
  const [completa, setCompleta] = useState(false);
  const [detalle, setDetalle] = useState([]);
  const relojes = useRef([]);
  const c = cadenas[n];
  useEffect(() => () => relojes.current.forEach(clearTimeout), []);

  const intercambiar = (i, j) => {
    if (j < 0 || j >= orden.length || completa) return;
    const o = [...orden];
    [o[i], o[j]] = [o[j], o[i]];
    setOrden(o);
    setParada(null);
    setCaidas(0);
  };
  const tocar = (i) => {
    if (completa) return;
    if (elegida == null) { setElegida(i); return; }
    if (elegida !== i) intercambiar(elegida, i);
    setElegida(null);
  };
  const empujar = () => {
    const fuera = primeraFuera(orden);
    if (empujes === 0) setDetalle((d) => [...d, ...orden.map((f, i) => ({ item: f.id, ok: f.orden === i, subtemas: c.subtemas }))]);
    setEmpujes((e) => e + 1);
    setElegida(null);
    const hasta = fuera === -1 ? orden.length : fuera;
    relojes.current.forEach(clearTimeout);
    relojes.current = [];
    setCaidas(0);
    setParada(null);
    for (let k = 1; k <= hasta; k += 1) relojes.current.push(setTimeout(() => setCaidas(k), k * CAIDA_MS));
    relojes.current.push(setTimeout(() => { if (fuera === -1) setCompleta(true); else setParada(fuera); }, (hasta + 1) * CAIDA_MS));
  };
  const seguir = () => {
    if (n + 1 >= cadenas.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setOrden(cadenas[n + 1].revuelta);
    setElegida(null);
    setCaidas(0);
    setEmpujes(0);
    setParada(null);
    setCompleta(false);
  };

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${cadenas.length}`}>
      <style>{CSS}</style>
      <p className="da26-rotulo" style={{ margin: "0 0 6px", fontSize: 14 }} data-cadena={c.id}>{c.nombre}</p>
      <div data-figura role="list" aria-label={c.nombre} key={c.id} className="da26-entra">
        {orden.map((f, i) => (
          <div key={f.id} className="pm26-h6-fila" role="listitem">
            <button type="button" className="pm26-h6-ficha" data-ficha={f.id} data-pos={i} aria-pressed={elegida === i}
              data-cae={i < caidas ? "1" : "0"} data-estado={parada === i ? "mal" : undefined} disabled={completa}
              aria-label={`${i + 1}. ${f.texto}. Toca dos fichas para intercambiarlas.`} onClick={() => tocar(i)}>
              <span className="pm26-h6-puntos" aria-hidden="true">{Array.from({ length: (f.orden % 3) + 1 }, (_, k) => <i key={k} />)}</span>
              <span>{f.texto}</span>
            </button>
          </div>
        ))}
      </div>
      <Retro estado="mal" key={`p${empujes}`}>{parada != null ? orden[parada].retro : null}</Retro>
      {completa && <Retro estado="bien">{c.nombre}</Retro>}
      <div className="da26-nav">
        <span />
        {completa
          ? <Boton primario onClick={seguir} data-siguiente>{n + 1 >= cadenas.length ? H6.terminar : H6.siguiente}</Boton>
          : <Boton primario onClick={empujar} data-empujar>{H6.empujar}</Boton>}
      </div>
    </MarcoHacer>
  );
}
