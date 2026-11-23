/*
 * H3 · La factura con lupa (pf26-h3-factura, Hacer, Medio, 25 × 3 = 75 FP × %).
 * Especificación de Gen, t3 §2 H3. Un documento con aspecto de recibo real
 * (papel, renglones, totales), sin logos ni nombres de empresas. Arriba, el
 * profesor con su pregunta (hueco de mascota: Mateo retiró los personajes
 * humanos). Tocar una línea abre, DEBAJO de ella, cinco fichas en dos filas
 * (3 + 2), nunca una ventana que tape el documento. Correcto: la línea se
 * pinta del color de su tributo con ✓ (directo e indirecto con su marca de
 * forma). Incorrecto: coral breve, la retro del par, y la línea queda abierta
 * para reintentar (ya no puntúa). La barra lateral «Lo que va al Estado»
 * crece con cada tributo bien marcado.
 * Partida: 3 documentos de 4 (3 etapas). Puntaje = líneas correctas al
 * primer intento / total de líneas.
 */
import { useMemo, useState } from "react";
import { BORDE, CORAL, FONDO, INK, INK_2, SUPERFICIE_2, TINTA_SOBRE_COLOR } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { tonoTributo } from "../comun/tributos.js";
import { IconoDirecto, IconoIndirecto } from "../comun/iconos-pf.jsx";
import { Objeto } from "../comun/kit.jsx";
import Mascota from "../comun/Mascota.jsx";
import { CONSIGNAS, DOCUMENTOS_H3, FICHAS_H3, H3, PARTIDA_H3, RETRO_H3 } from "./textos.js";

export const ID = "pf26-h3-factura";
export const prepararH3 = (rng = Math.random) => sortear(DOCUMENTOS_H3, PARTIDA_H3, rng);
const ficha = (id) => FICHAS_H3.find((f) => f.id === id);
const esTributo = (clave) => clave !== "no";

const CSS = `
.pf26-h3-pregunta { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.pf26-h3-pregunta p { margin: 0; font: 600 15px/1.35 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-h3-doc { display: grid; grid-template-columns: minmax(0, 1fr) 18px; gap: 8px; }
.pf26-h3-papel { position: relative; padding: 10px 8px 8px; border-radius: 6px; background: #f4f1ea; color: #1c2230; box-shadow: 0 2px 0 rgba(0,0,0,.25);
  background-image: repeating-linear-gradient(to bottom, transparent 0 47px, rgba(28,34,48,.08) 47px 48px); }
.pf26-h3-titulo { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; padding-bottom: 6px; border-bottom: 2px dashed rgba(28,34,48,.35); font: 700 15px/1.25 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); }
.pf26-h3-linea { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 48px; padding: 6px 8px; margin: 0 0 2px; border-radius: 6px; border: 2px solid transparent; background: transparent; color: #1c2230; font: 500 14px/1.25 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); text-align: left; cursor: pointer; touch-action: manipulation; }
.pf26-h3-linea[aria-expanded="true"] { border-color: #1c2230; border-style: dashed; }
.pf26-h3-linea[data-estado="mal"] { border-color: ${CORAL}; border-style: solid; }
.pf26-h3-linea[data-hecha="1"] { cursor: default; border-color: var(--tono); background: var(--tono); color: ${TINTA_SOBRE_COLOR}; }
.pf26-h3-linea[data-hecha="1"][data-no="1"] { background: transparent; color: #1c2230; border-color: rgba(28,34,48,.35); }
.pf26-h3-monto { flex: none; font-variant-numeric: tabular-nums; }
.pf26-h3-marca { display: inline-flex; align-items: center; gap: 4px; font: 700 12px/1.2 var(--planck-font-sans, system-ui, sans-serif); }
.pf26-h3-fichas { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; margin: 4px 0 8px; padding: 8px; border-radius: 10px; background: ${FONDO}; }
.pf26-h3-fichas > :nth-child(-n+3) { grid-column: span 2; }
.pf26-h3-fichas > :nth-child(n+4) { grid-column: span 3; }
.pf26-h3-ficha { min-height: 44px; min-width: 0; padding: 4px 6px; border-radius: 999px; border: 2px solid var(--tono, ${BORDE}); background: ${SUPERFICIE_2}; color: ${INK}; font: 600 13px/1.15 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.pf26-h3-pie { display: flex; justify-content: space-between; margin-top: 6px; padding-top: 6px; border-top: 2px solid rgba(28,34,48,.6); font: 700 14px/1.25 var(--planck-font-mono, "Geist Mono", ui-monospace, monospace); }
.pf26-h3-barra { position: relative; border-radius: 999px; border: 1px solid ${BORDE}; background: ${FONDO}; overflow: hidden; }
.pf26-h3-barra > i { position: absolute; left: 0; right: 0; bottom: 0; height: 100%; background: ${INK}; transform-origin: bottom; transition: transform 420ms cubic-bezier(.3,.9,.4,1); }
.pf26-h3-estado { margin: 0 0 4px; text-align: right; font: 600 12px/1.3 var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; }
@media (prefers-reduced-motion: reduce) { .pf26-h3-barra > i { transition: none; } }
`;

function Marca({ clave }) {
  const f = ficha(clave);
  return (
    <span className="pf26-h3-marca">
      {clave === "directo" && <IconoDirecto size={16} />}
      {clave === "indirecto" && <IconoIndirecto size={16} />}
      {f.nombre} ✓
    </span>
  );
}

export default function H3Factura({ onTerminar, rng = null }) {
  const docs = useMemo(() => prepararH3(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [abierta, setAbierta] = useState(null);
  const [hechas, setHechas] = useState(new Set());
  const [falladas, setFalladas] = useState(new Set());
  const [retro, setRetro] = useState(null);
  const [rojo, setRojo] = useState(null);
  const [mal, setMal] = useState(0);
  const [detalle, setDetalle] = useState([]);
  const doc = docs[n];
  const tributos = doc.lineas.filter((l) => esTributo(l.clave));
  const alEstado = tributos.filter((l) => hechas.has(l.id)).length / tributos.length;
  const completo = doc.lineas.every((l) => hechas.has(l.id));

  const elegir = (l, eleccion) => {
    const item = `${doc.id}-${l.id}`;
    const primera = !falladas.has(l.id);
    if (eleccion === l.clave) {
      if (primera) setDetalle((d) => [...d, { item, ok: true, subtemas: l.subtemas }]);
      setHechas((s) => new Set(s).add(l.id));
      setAbierta(null);
      setRetro(null);
      return;
    }
    if (primera) setDetalle((d) => [...d, { item, ok: false, subtemas: l.subtemas }]);
    setFalladas((s) => new Set(s).add(l.id));
    setRetro(RETRO_H3[l.clave][eleccion]);
    setMal((m) => m + 1);
    setRojo(l.id);
    setTimeout(() => setRojo((r) => (r === l.id ? null : r)), 300);
  };

  const seguir = () => {
    if (n + 1 >= docs.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setHechas(new Set());
    setFalladas(new Set());
    setAbierta(null);
    setRetro(null);
  };

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${docs.length}`}>
      <style>{CSS}</style>
      <div className="pf26-h3-pregunta da26-entra" key={`q-${doc.id}`} data-pregunta>
        <Mascota rol="profesor" alto={96} />
        <div>
          <span className="da26-rotulo">{H3.profesor}</span>
          <p>{doc.pregunta}</p>
        </div>
      </div>
      <p className="pf26-h3-estado" aria-hidden="true">{H3.alEstado}</p>
      <div className="pf26-h3-doc da26-entra" key={doc.id} data-figura data-documento={doc.id}>
        <div className="pf26-h3-papel">
          <p className="pf26-h3-titulo"><Objeto id="recibo" alto={36} />{doc.titulo}</p>
          {doc.lineas.map((l) => {
            const hecha = hechas.has(l.id);
            const f = ficha(l.clave);
            return (
              <div key={l.id}>
                <button
                  type="button"
                  className="pf26-h3-linea"
                  data-linea={l.id}
                  data-hecha={hecha ? "1" : "0"}
                  data-no={l.clave === "no" ? "1" : undefined}
                  data-estado={rojo === l.id ? "mal" : undefined}
                  aria-expanded={abierta === l.id}
                  disabled={hecha}
                  style={hecha && f.tributo ? { "--tono": tonoTributo(f.tributo) } : undefined}
                  onClick={() => setAbierta(abierta === l.id ? null : l.id)}
                >
                  <span>{l.texto}{hecha && <><br /><Marca clave={l.clave} /></>}</span>
                  {l.monto && <span className="pf26-h3-monto">{l.monto}</span>}
                </button>
                {abierta === l.id && (
                  <div className="pf26-h3-fichas da26-entra" role="group" aria-label={`¿Qué es «${l.texto}»?`}>
                    {FICHAS_H3.map((x) => (
                      <button key={x.id} type="button" className="pf26-h3-ficha" data-ficha={x.id}
                        style={x.tributo ? { "--tono": tonoTributo(x.tributo) } : undefined} onClick={() => elegir(l, x.id)}>
                        {x.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {doc.pie && <p className="pf26-h3-pie"><span>{doc.pie.rotulo}</span><span>{doc.pie.monto}</span></p>}
        </div>
        <div className="pf26-h3-barra" role="img" aria-label={`${H3.alEstado}: ${Math.round(alEstado * 100)} %`} data-al-estado={Math.round(alEstado * 100)}>
          <i style={{ transform: `scaleY(${alEstado})` }} />
        </div>
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
      <div className="da26-nav">
        <span />
        <Boton primario onClick={seguir} disabled={!completo} data-siguiente>{n + 1 >= docs.length ? H3.terminar : H3.siguiente}</Boton>
      </div>
    </MarcoHacer>
  );
}
