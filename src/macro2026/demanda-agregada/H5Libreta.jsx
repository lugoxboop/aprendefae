/*
 * H5 · La libreta de la analista (da26-h5-libreta, Hacer, Difícil, 50 FP × %).
 * Especificación de Gen §2 H5. Una hoja de libreta rayada con margen; «La
 * analista» arriba a la derecha. Cuatro líneas (fuente del sitio, no
 * manuscrita, por legibilidad); exactamente una es falsa. Tocar la falsa: se
 * tacha con un trazo animado (280 ms) y la corrección se escribe debajo letra
 * a letra (≤ 600 ms; con movimiento reducido, aparece). Tocar una verdadera:
 * borde coral breve, su retro, y queda marcada ✓ «correcta». La página se
 * puntúa solo si se acierta al primer toque. 4 páginas de 6; orden de las
 * líneas aleatorio en cada página. El margen de la libreta es gris: el coral
 * es solo para el error.
 */
import { MascotaRol } from "../comun/mascotas.jsx";
import { useEffect, useMemo, useState } from "react";
import { BORDE, CORAL, FONDO, INK, INK_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, movimientoReducido, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, barajar, sortear } from "../comun/azar.js";
import { BANCO_H5, CONSIGNAS, PARTIDA_H5 } from "./textos.js";

export const ID = "da26-h5-libreta";

export function prepararH5(rng = Math.random) {
  return sortear(BANCO_H5, PARTIDA_H5, rng).map((pg) => ({ ...pg, lineas: barajar(pg.lineas, rng) }));
}

const CSS = `
.da26-h5-hoja { position: relative; border-radius: 10px; border: 1px solid ${BORDE}; background: ${FONDO}; padding: 14px 10px 12px 30px;
  background-image: repeating-linear-gradient(to bottom, transparent 0 31px, rgba(182,187,197,.16) 31px 32px); }
.da26-h5-hoja::before { content: ""; position: absolute; left: 20px; top: 0; bottom: 0; width: 2px; background: rgba(182,187,197,.45); }
.da26-h5-linea { position: relative; display: block; width: 100%; min-height: 48px; margin: 0 0 6px; padding: 10px 10px; border-radius: 8px; border: 2px solid transparent; background: transparent; color: ${INK}; font: 500 16px/1.35 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; touch-action: manipulation; }
.da26-h5-linea:hover { border-color: ${BORDE}; }
.da26-h5-linea[data-estado="mal"] { border-color: ${CORAL}; }
.da26-h5-linea[data-estado="bien"] { border-color: ${INK}; }
.da26-h5-linea:disabled { cursor: default; }
.da26-h5-tacha { position: absolute; left: 8px; right: 8px; top: 50%; height: 2.5px; background: ${INK}; transform-origin: left; transform: scaleX(0); transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.da26-h5-tacha[data-on="1"] { transform: scaleX(1); }
.da26-h5-texto[data-tachada="1"] { opacity: .6; }
.da26-h5-correccion { margin: 2px 0 8px 10px; font: 600 16px/1.35 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
@media (prefers-reduced-motion: reduce) { .da26-h5-tacha { transition: opacity 120ms linear; } }
`;

function Escribe({ texto }) {
  const [n, setN] = useState(() => (movimientoReducido() ? texto.length : 0));
  useEffect(() => {
    if (movimientoReducido()) { setN(texto.length); return undefined; }
    const paso = Math.max(8, 600 / texto.length);
    const ini = performance.now();
    let marco = 0;
    const tic = (t) => {
      const k = Math.min(texto.length, Math.floor((t - ini) / paso));
      setN(k);
      if (k < texto.length) marco = requestAnimationFrame(tic);
    };
    marco = requestAnimationFrame(tic);
    const respaldo = setTimeout(() => setN(texto.length), 700);
    return () => { cancelAnimationFrame(marco); clearTimeout(respaldo); };
  }, [texto]);
  return (
    <p className="da26-h5-correccion" data-correccion aria-label={texto}>
      <span aria-hidden="true">{texto.slice(0, n)}</span>
    </p>
  );
}

export default function H5Libreta({ onTerminar, rng = null }) {
  const paginas = useMemo(() => prepararH5(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [tocadas, setTocadas] = useState([]);
  const [rojo, setRojo] = useState(null);
  const [retro, setRetro] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const pg = paginas[n];
  const resuelta = tocadas.some((id) => pg.lineas.find((l) => l.id === id)?.falsa);

  const tocar = (l) => {
    if (resuelta || tocadas.includes(l.id)) return;
    if (tocadas.length === 0) setDetalle((d) => [...d, { item: pg.id, ok: Boolean(l.falsa), subtemas: pg.subtemas }]);
    setTocadas((t) => [...t, l.id]);
    if (l.falsa) { setRetro(null); return; }
    setRetro(l.retro);
    setRojo(l.id);
    setTimeout(() => setRojo((r) => (r === l.id ? null : r)), 300);
  };
  const seguir = () => {
    if (n + 1 >= paginas.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / paginas.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setTocadas([]);
    setRetro(null);
  };

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${paginas.length}`}>
      <style>{CSS}</style>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, color: INK_2 }}>
        <MascotaRol id="analista" pose="libreta" alto={140} />
      </div>
      <div className="da26-h5-hoja da26-entra" key={pg.id} data-figura data-pagina={pg.id}>
        {pg.lineas.map((l, k) => {
          const tocada = tocadas.includes(l.id);
          const tachada = tocada && l.falsa;
          return (
            <div key={l.id}>
              <button
                type="button"
                className="da26-h5-linea"
                data-linea={l.id}
                data-falsa={l.falsa ? "1" : undefined}
                data-estado={rojo === l.id ? "mal" : tocada && !l.falsa ? "bien" : undefined}
                disabled={resuelta || tocada}
                onClick={() => tocar(l)}
                aria-label={`${String.fromCharCode(97 + k)}) ${l.texto}${tocada && !l.falsa ? " (correcta)" : ""}${tachada ? " (tachada)" : ""}`}
              >
                <span className="da26-h5-texto" data-tachada={tachada ? "1" : "0"}>{String.fromCharCode(97 + k)}) {l.texto}</span>
                {tocada && !l.falsa && <span style={{ display: "block", fontSize: 13, color: INK_2, marginTop: 2 }}>✓ correcta</span>}
                <span className="da26-h5-tacha" data-on={tachada ? "1" : "0"} aria-hidden="true" />
              </button>
              {tachada && <Escribe texto={pg.correccion} />}
            </div>
          );
        })}
      </div>
      {retro && !resuelta && <Retro estado="info" key={tocadas.length}>{retro}</Retro>}
      <div className="da26-nav">
        <span />
        <Boton primario onClick={seguir} disabled={!resuelta} data-siguiente>{n + 1 >= paginas.length ? "Terminar" : "Siguiente página"}</Boton>
      </div>
    </MarcoHacer>
  );
}
