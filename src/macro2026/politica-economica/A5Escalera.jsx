/*
 * A5 · La escalera de la política (pe26-a5-escalera, Aprender).
 * Especificación de Gen, t2 §2 A5: la escalera de seis peldaños; «La
 * autoridad económica» sube un peldaño por pantalla y deja la tarjeta del
 * ejemplo del profesor (d. 18). P8: las seis tarjetas barajadas al pie se
 * arrastran (o tocar-tocar) a su peldaño; si no es el suyo, la tarjeta vuelve
 * y el peldaño correcto parpadea una vez (sin puntaje: es Aprender). P9: el
 * objetivo junto a la meta, con la cifra y el plazo subrayados.
 */
import { useMemo, useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { MarcoAprender, usePasos } from "../comun/ui.jsx";
import { barajar, azarDeLaPagina } from "../comun/azar.js";
import { useArrastre } from "../comun/arrastre.js";
import Escalera, { ORDEN_PELDANOS, nombrePeldano } from "../comun/Escalera.jsx";
import { IconoRama } from "../comun/iconos-pe.jsx";
import { APRENDER, A5_EJEMPLO, A5_P9, ESCENAS } from "./textos.js";

export const ID = "pe26-a5-escalera";
const TEXTOS = APRENDER[ID];

const CSS = `
.pe26-a5-mazo { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.pe26-a5-carta { min-height: 52px; padding: 8px 10px; border-radius: 10px; border: 2px solid ${INK_2}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 13px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.pe26-a5-carta[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK}; }
.pe26-a5-carta[data-arrastrando="1"] { transition: none; cursor: grabbing; box-shadow: 0 10px 24px rgba(0,0,0,.5); }
.pe26-a5-dos { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.pe26-a5-dos > div { min-height: 120px; padding: 10px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; display: flex; flex-direction: column; gap: 8px; font: 600 15px/1.35 var(--planck-font-sans, system-ui, sans-serif); }
.pe26-a5-dos u { text-decoration-thickness: 2px; text-underline-offset: 3px; }
.pe26-a5-tarjeta { display: inline-flex; align-items: center; gap: 6px; }
@media (prefers-reduced-motion: reduce) { .pe26-a5-carta { transition: none; } }
`;

const contenidoDe = (id) => (id === "estrategia"
  ? <span className="pe26-a5-tarjeta"><IconoRama id="fiscal" size={20} />{A5_EJEMPLO.estrategia}</span>
  : A5_EJEMPLO[id]);

function Ordenar() {
  const mazo = useMemo(() => barajar(ORDEN_PELDANOS, azarDeLaPagina()), []);
  const [puestas, setPuestas] = useState({});
  const [parpadea, setParpadea] = useState(null);
  const [vuelve, setVuelve] = useState(0);
  const { contenedor, pieza, destino } = useArrastre({
    alSoltar: (id, d) => {
      if (id === d) { setPuestas((p) => ({ ...p, [d]: true })); setParpadea(null); return; }
      setVuelve((n) => n + 1);
      setParpadea(null);
      setTimeout(() => setParpadea(id), 10);
    },
  });
  const contenido = Object.fromEntries(Object.keys(puestas).map((k) => [k, contenidoDe(k)]));
  return (
    <div ref={contenedor}>
      <Escalera contenido={contenido} destino={(p) => destino(p)} parpadea={parpadea} key={`p${vuelve}`} iluminados={new Set(Object.keys(puestas))} />
      <div className="pe26-a5-mazo" role="group" aria-label="Las seis tarjetas">
        {mazo.filter((id) => !puestas[id]).map((id) => (
          <button key={id} type="button" className="pe26-a5-carta" data-carta-a5={id} aria-label={`${A5_EJEMPLO[id]}. Toca la tarjeta y luego su peldaño, o arrástrala.`} {...pieza(id)}>
            {A5_EJEMPLO[id]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function A5Escalera({ onTerminar }) {
  const { paso, siguiente, anterior } = usePasos(TEXTOS.length);
  const [resaltado, setResaltado] = useState(null);

  let figura;
  if (paso === 0) {
    figura = <Escalera onPeldano={(id) => setResaltado(id)} resaltado={resaltado} />;
  } else if (paso <= 6) {
    const hasta = paso;
    const ids = ORDEN_PELDANOS.slice(0, hasta);
    const actual = ORDEN_PELDANOS[hasta - 1];
    const contenido = Object.fromEntries(ids.map((id) => [id, id === actual ? <span className="da26-entra" key={id}>{contenidoDe(id)}</span> : contenidoDe(id)]));
    figura = <Escalera contenido={contenido} personaje={actual} resaltado={actual} etiqueta={`La escalera: ${nombrePeldano(actual)}`} />;
  } else if (paso === 7) {
    figura = <Ordenar />;
  } else {
    figura = (
      <div className="pe26-a5-dos">
        <div data-objetivo-a5><span className="da26-rotulo">Objetivo</span><span>{A5_P9.objetivo}</span></div>
        <div data-meta-a5><span className="da26-rotulo">Meta</span>
          <span>{A5_P9.meta.map((t, k) => (typeof t === "string" ? <span key={k}>{t}</span> : <u key={k}>{t.subrayado}</u>))}</span>
        </div>
      </div>
    );
  }

  return (
    <MarcoAprender escena={ESCENAS[ID]}
      id={ID}
      paso={paso}
      total={TEXTOS.length}
      texto={TEXTOS[paso]}
      figura={<><style>{CSS}</style>{figura}</>}
      onSiguiente={siguiente}
      onAnterior={anterior}
      onTerminar={() => onTerminar?.()}
    />
  );
}
