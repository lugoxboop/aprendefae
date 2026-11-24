/*
 * H6 · Cada hecho a su correa (pc26-h6-correa, Hacer, Medio, 25 FP × %).
 * Especificación de Gen, t5 §2 H6. Las cuatro correas de A7 en miniatura
 * (fijo, banda, gota a gota, flexible) son los destinos. El hecho se
 * arrastra, o se toca y luego se toca la correa. Acierto: el perro de esa
 * correa hace su animación. Error: la ficha rebota con borde coral y la
 * retro del par (verdadero → elegido); se reintenta.
 * Partida: 6 de 8. Puntaje = aciertos al primer intento / 6.
 */
import { useMemo, useState } from "react";
import { BORDE, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { useArrastre } from "../comun/arrastre.js";
import { CAMBIARIA, CSS_PC, Correa } from "./comun-pc.jsx";
import { BANCO_H6, CONSIGNAS, H6, PARTIDA_H6, REGIMENES, RETRO_H6, ESCENAS } from "./textos.js";

export const ID = "pc26-h6-correa";
export const prepararH6 = (rng = Math.random) => sortear(BANCO_H6, PARTIDA_H6, rng);

const CSS = `
.pc26-h6-ficha { display: block; width: 100%; min-height: 56px; padding: 8px 14px; border-radius: 14px; border: 2px solid ${INK}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: center; cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; }
.pc26-h6-ficha[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK_2}; }
.pc26-h6-ficha[data-estado="mal"] { border-color: #E76F51; }
.pc26-h6-correas { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
.pc26-h6-correa { display: grid; gap: 2px; padding: 6px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 700 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); text-align: center; cursor: pointer; touch-action: manipulation; }
.pc26-h6-correa[data-blanco="1"] { box-shadow: 0 0 0 3px ${CAMBIARIA}; }
.pc26-h6-correa[data-entro="1"] { border-color: ${INK}; }
`;

export default function H6Correa({ onTerminar, rng = null }) {
  const hechos = useMemo(() => prepararH6(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [intento, setIntento] = useState(1);
  const [entro, setEntro] = useState(null);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const [rojo, setRojo] = useState(false);
  const [vez, setVez] = useState({});
  const [detalle, setDetalle] = useState([]);
  const h = hechos[n];

  const soltar = (id, reg) => {
    if (!h || entro || id !== h.id) return;
    if (reg === h.regimen) {
      if (intento === 1) setDetalle((d) => [...d, { item: h.id, ok: true, subtemas: h.subtemas }]);
      setEntro(reg);
      setRetro(null);
      setVez((v) => ({ ...v, [reg]: (v[reg] ?? 0) + 1 }));
      return;
    }
    if (intento === 1) { setDetalle((d) => [...d, { item: h.id, ok: false, subtemas: h.subtemas }]); setIntento(2); }
    setRetro(RETRO_H6[h.regimen][reg]);
    setMal((m) => m + 1);
    setRojo(true);
    setTimeout(() => setRojo(false), 300);
  };
  const seguir = () => {
    if (n + 1 >= hechos.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / hechos.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setIntento(1);
    setEntro(null);
    setRetro(null);
  };
  const { contenedor, pieza, destino } = useArrastre({ alSoltar: soltar, activo: !entro });

  return (
    <MarcoHacer id={ID} escena={ESCENAS[ID]} mini={{ texto: ESCENAS[ID].porRonda.todas }} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${hechos.length}`}>
      <style>{CSS_PC}{CSS}</style>
      <div data-figura ref={contenedor}>
        <div style={{ minHeight: 60 }}>
          {!entro
            ? <div className="da26-entra" key={h.id}>
                <button type="button" key={`${h.id}-${mal}`} className={`pc26-h6-ficha${rojo ? " da26-tiembla" : ""}`} data-ficha={h.id} data-estado={rojo ? "mal" : undefined}
                  aria-label={`${h.texto}. Arrástralo a su correa, o tócalo y toca la correa.`} {...pieza(h.id)}>{h.texto}</button>
              </div>
            : <p className="da26-entra" style={{ margin: 0, padding: "10px 4px", fontSize: 15, fontWeight: 600 }} data-ficha-puesta>{h.texto}</p>}
        </div>
        <div className="pc26-h6-correas">
          {REGIMENES.map((r) => (
            <button key={r.id} type="button" className="pc26-h6-correa" data-correa-destino={r.id} data-entro={entro === r.id ? "1" : "0"}
              aria-label={`Llevar a ${r.nombre}`} disabled={Boolean(entro)} {...destino(r.id, h.id)}>
              <Correa regimen={r.id} vez={vez[r.id] ?? 0} mini sucia={false} />
              <span>{r.nombre}</span>
            </button>
          ))}
        </div>
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
      {entro && <Retro estado="bien">{REGIMENES.find((r) => r.id === entro).nombre}</Retro>}
      <div className="da26-nav">
        <span />
        <Boton primario onClick={seguir} disabled={!entro} data-siguiente>{n + 1 >= hechos.length ? H6.terminar : H6.siguiente}</Boton>
      </div>
    </MarcoHacer>
  );
}
