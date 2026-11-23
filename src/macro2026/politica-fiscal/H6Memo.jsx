/*
 * H6 · El memo de la gerencia (pf26-h6-memo, Hacer, Difícil, 50 FP × %).
 * Especificación de Gen, t3 §2 H6. Un memo interno de «NOVA S. A.» (la
 * empresa del pre-parcial, d. 45), con membrete simple, cuatro frases y la
 * firma «La gerencia». Mecánica de T1 H5: tocar la falsa la tacha y escribe la
 * corrección; tocar una verdadera da su retro (borde coral breve, queda
 * marcada «correcta») y la página ya no puntúa.
 * Partida: 4 memos de 5, frases en orden aleatorio. Puntaje = memos al primer
 * toque / 4.
 */
import { useEffect, useMemo, useState } from "react";
import { CORAL } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, movimientoReducido, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, barajar, sortear } from "../comun/azar.js";
import { Objeto } from "../comun/kit.jsx";
import { BANCO_H6, CONSIGNAS, H6, PARTIDA_H6 } from "./textos.js";

export const ID = "pf26-h6-memo";
export function prepararH6(rng = Math.random) {
  return sortear(BANCO_H6, PARTIDA_H6, rng).map((m) => ({ ...m, frases: barajar(m.frases, rng) }));
}

const PAPEL = "#f4f1ea";
const TINTA = "#1c2230";
const CSS = `
.pf26-h6-memo { border-radius: 8px; background: ${PAPEL}; color: ${TINTA}; padding: 12px 10px 14px; box-shadow: 0 2px 0 rgba(0,0,0,.25); }
.pf26-h6-membrete { display: flex; align-items: center; gap: 8px; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 2px solid ${TINTA}; }
.pf26-h6-empresa { font: 800 17px/1.1 var(--planck-font-sans, system-ui, sans-serif); letter-spacing: .04em; }
.pf26-h6-tipo { font: 600 12px/1.2 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); color: #4a5263; }
.pf26-h6-frase { position: relative; display: block; width: 100%; min-height: 48px; margin: 0 0 4px; padding: 8px 8px; border-radius: 8px; border: 2px solid transparent; background: transparent; color: ${TINTA}; font: 500 15px/1.35 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; touch-action: manipulation; }
.pf26-h6-frase:hover { border-color: rgba(28,34,48,.25); }
.pf26-h6-frase[data-estado="mal"] { border-color: ${CORAL}; }
.pf26-h6-frase[data-estado="bien"] { border-color: rgba(28,34,48,.45); }
.pf26-h6-frase:disabled { cursor: default; }
.pf26-h6-tacha { position: absolute; left: 6px; right: 6px; top: 50%; height: 2.5px; background: ${TINTA}; transform-origin: left; transform: scaleX(0); transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.pf26-h6-tacha[data-on="1"] { transform: scaleX(1); }
.pf26-h6-texto[data-tachada="1"] { opacity: .55; }
.pf26-h6-correccion { margin: 2px 0 8px 8px; font: 700 15px/1.35 var(--planck-font-sans, system-ui, sans-serif); color: ${TINTA}; }
.pf26-h6-firma { margin: 10px 0 0; text-align: right; font: italic 600 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-h6-ok { display: block; margin-top: 2px; font-size: 13px; color: #4a5263; }
@media (prefers-reduced-motion: reduce) { .pf26-h6-tacha { transition: opacity 120ms linear; } }
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
    <p className="pf26-h6-correccion" data-correccion aria-label={texto}>
      <span aria-hidden="true">{texto.slice(0, n)}</span>
    </p>
  );
}

export default function H6Memo({ onTerminar, rng = null }) {
  const memos = useMemo(() => prepararH6(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [tocadas, setTocadas] = useState([]);
  const [rojo, setRojo] = useState(null);
  const [retro, setRetro] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const memo = memos[n];
  const resuelto = tocadas.some((id) => memo.frases.find((f) => f.id === id)?.falsa);

  const tocar = (f) => {
    if (resuelto || tocadas.includes(f.id)) return;
    if (tocadas.length === 0) setDetalle((d) => [...d, { item: memo.id, ok: f.falsa, subtemas: memo.subtemas }]);
    setTocadas((t) => [...t, f.id]);
    if (f.falsa) { setRetro(null); return; }
    setRetro(f.retro);
    setRojo(f.id);
    setTimeout(() => setRojo((r) => (r === f.id ? null : r)), 300);
  };
  const seguir = () => {
    if (n + 1 >= memos.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / memos.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setTocadas([]);
    setRetro(null);
  };

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${memos.length}`}>
      <style>{CSS}</style>
      <div className="pf26-h6-memo da26-entra" key={memo.id} data-figura data-memo={memo.id}>
        <div className="pf26-h6-membrete">
          <Objeto id="fabrica" alto={40} />
          <div>
            <div className="pf26-h6-empresa">{H6.empresa}</div>
            <div className="pf26-h6-tipo">{H6.membrete}</div>
          </div>
        </div>
        {memo.frases.map((f) => {
          const tocada = tocadas.includes(f.id);
          const tachada = tocada && f.falsa;
          return (
            <div key={f.id}>
              <button
                type="button" className="pf26-h6-frase" data-frase={f.id} data-falsa={f.falsa ? "1" : undefined}
                data-estado={rojo === f.id ? "mal" : tocada && !f.falsa ? "bien" : undefined}
                disabled={resuelto || tocada} onClick={() => tocar(f)}
                aria-label={`${f.texto}${tocada && !f.falsa ? " (correcta)" : ""}${tachada ? " (tachada)" : ""}`}
              >
                <span className="pf26-h6-texto" data-tachada={tachada ? "1" : "0"}>{f.texto}</span>
                {tocada && !f.falsa && <span className="pf26-h6-ok">{H6.correcta}</span>}
                <span className="pf26-h6-tacha" data-on={tachada ? "1" : "0"} aria-hidden="true" />
              </button>
              {tachada && <Escribe texto={memo.correccion} />}
            </div>
          );
        })}
        <p className="pf26-h6-firma">— {H6.firma}</p>
      </div>
      {retro && !resuelto && <Retro estado="info" key={tocadas.length}>{retro}</Retro>}
      <div className="da26-nav">
        <span />
        <Boton primario onClick={seguir} disabled={!resuelto} data-siguiente>{n + 1 >= memos.length ? H6.terminar : H6.siguiente}</Boton>
      </div>
    </MarcoHacer>
  );
}
