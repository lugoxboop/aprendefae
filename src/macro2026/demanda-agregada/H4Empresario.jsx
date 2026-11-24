/*
 * H4 · Lo que oyó el empresario (da26-h4-empresario, Hacer, Difícil, 50 FP × %).
 * Especificación de Gen §2 H4. Arriba «El empresario» con su periódico y el
 * titular; debajo tres eslabones unidos por flechas, cada uno con un botón que
 * alterna ↑ / ↓ (empieza en «?»). «Explicárselo» se activa con los tres
 * puestos. Al revelar, la cadena se enciende eslabón por eslabón (280 ms cada
 * uno): ✓ si acierta; si yerra, tiembla en coral, su retro, y la flecha gira a
 * la dirección correcta. Al final, un medidor «DA» sube o baja.
 * 5 titulares de 7; puntaje = eslabones correctos / 15.
 */
import { useEffect, useMemo, useState } from "react";
import { BORDE, CORAL, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, movimientoReducido, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { BANCO_H4, CONSIGNAS, ESCENAS, PARTIDA_H4 } from "./textos.js";

export const ID = "da26-h4-empresario";
export const prepararH4 = (rng = Math.random) => sortear(BANCO_H4, PARTIDA_H4, rng);

const CSS = `
.da26-h4-cadena { display: flex; flex-direction: column; align-items: stretch; gap: 0; }
.da26-h4-eslabon { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 60px; padding: 6px 6px 6px 14px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; font-size: 16px; line-height: 1.25; }
.da26-h4-eslabon[data-encendido="1"] { background: ${SUPERFICIE_2}; }
.da26-h4-eslabon[data-estado="bien"] { border-color: ${INK}; }
.da26-h4-eslabon[data-estado="mal"] { border-color: ${CORAL}; }
.da26-h4-flecha { width: 48px; height: 48px; flex: none; border-radius: 10px; border: 1px solid ${BORDE}; background: ${SUPERFICIE_2}; color: ${INK}; font: 700 24px/1 var(--planck-font-mono, monospace); cursor: pointer; touch-action: manipulation; }
.da26-h4-flecha[data-dir="?"] { color: ${INK_2}; }
.da26-h4-flecha span { display: inline-block; transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.da26-h4-une { text-align: center; color: ${INK_2}; font-size: 18px; line-height: 22px; }
@media (min-width: 560px) {
  .da26-h4-cadena { flex-direction: row; align-items: center; }
  .da26-h4-cadena > .da26-h4-eslabon { flex: 1; }
  .da26-h4-une { transform: rotate(-90deg); padding: 0 2px; }
}
@media (prefers-reduced-motion: reduce) { .da26-h4-flecha span { transition: none; } }
`;

const flecha = (d) => (d === 1 ? "↑" : d === -1 ? "↓" : "?");


function Medidor({ dir }) {
  const alto = dir === 1 ? 0.78 : 0.22;
  return (
    <div style={{ marginTop: 12 }} data-medidor={dir}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: INK_2 }}><span>DA</span><span>{dir === 1 ? "↑" : "↓"}</span></div>
      <div style={{ height: 14, borderRadius: 999, background: FONDO, border: `1px solid ${BORDE}`, overflow: "hidden" }}>
        <div className="da26-trans" style={{ height: "100%", width: "100%", background: INK, transformOrigin: "left", transform: `scaleX(${alto})` }} />
      </div>
    </div>
  );
}

export default function H4Empresario({ onTerminar, rng = null }) {
  const titulares = useMemo(() => prepararH4(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [dirs, setDirs] = useState([0, 0, 0]);
  const [revelados, setRevelados] = useState(-1); /* -1: sin revelar; 0..3: cuántos encendidos */
  const [detalle, setDetalle] = useState([]);
  const h = titulares[n];
  const listo = dirs.every((d) => d !== 0);
  const juzgados = revelados >= 0 ? dirs.map((d, k) => d === h.eslabones[k][1]) : null;

  useEffect(() => {
    if (revelados < 0 || revelados >= 3) return undefined;
    const t = setTimeout(() => setRevelados((r) => r + 1), movimientoReducido() ? 0 : 280);
    return () => clearTimeout(t);
  }, [revelados]);

  const explicar = () => {
    setRevelados(0);
    setDetalle((d) => [...d, ...h.eslabones.map(([, dir], k) => ({ item: `${h.id}-${k + 1}`, ok: dirs[k] === dir, subtemas: h.subtemas }))]);
  };
  const seguir = () => {
    if (n + 1 >= titulares.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setDirs([0, 0, 0]);
    setRevelados(-1);
  };
  const daReal = h.eslabones.find(([nombre]) => nombre === "DA")?.[1] ?? 1;

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} escena={ESCENAS[ID]}
      mini={{ etiqueta: ESCENAS[ID].porRonda.etiqueta, texto: h.titular, datos: { "data-titular": h.id } }} progreso={`${n + 1} / ${titulares.length}`}>
      <style>{CSS}</style>
      <div className="da26-h4-cadena" data-figura>
        {h.eslabones.map(([nombre, correcta], k) => {
          const encendido = revelados > k;
          const ok = juzgados?.[k];
          const mostrada = encendido && !ok ? correcta : dirs[k];
          return (
            <div key={k} style={{ display: "contents" }}>
              {k > 0 && <div className="da26-h4-une" aria-hidden="true">↓</div>}
              <div
                className={`da26-h4-eslabon${encendido && !ok ? " da26-tiembla" : ""}`}
                data-eslabon={k + 1}
                data-encendido={encendido ? "1" : "0"}
                data-estado={encendido ? (ok ? "bien" : "mal") : undefined}
              >
                <span>{nombre}{encendido && ok ? " ✓" : ""}</span>
                <button
                  type="button"
                  className="da26-h4-flecha"
                  data-dir={flecha(mostrada)}
                  disabled={revelados >= 0}
                  aria-label={`${nombre}: ${mostrada === 1 ? "sube" : mostrada === -1 ? "baja" : "sin elegir"}. Toca para cambiar.`}
                  onClick={() => setDirs((ds) => ds.map((d, j) => (j === k ? (d === 1 ? -1 : 1) : d)))}
                >
                  <span style={{ transform: encendido && !ok ? "rotate(180deg)" : "none" }}>{flecha(encendido && !ok ? -correcta : dirs[k])}</span>
                </button>
              </div>
              {encendido && !ok && <Retro estado="mal" data-retro-eslabon={k + 1}>{h.retro[k]}</Retro>}
            </div>
          );
        })}
      </div>
      {revelados >= 3 && <Medidor dir={daReal} />}
      <div className="da26-nav">
        <span />
        {revelados < 0
          ? <Boton primario onClick={explicar} disabled={!listo} data-explicar>Explicárselo</Boton>
          : <Boton primario onClick={seguir} disabled={revelados < 3} data-siguiente>{n + 1 >= titulares.length ? "Terminar" : "Siguiente titular"}</Boton>}
      </div>
    </MarcoHacer>
  );
}
