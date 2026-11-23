/*
 * H3 · Cada depósito a su caja (pm26-h3-cajas, Hacer, Medio, 25 FP × %).
 * Especificación de Gen, t4 §2 H3. La bóveda (BM) aparte y las cajas
 * M1 ⊂ M2 ⊂ M3 anidadas de A4, más la bandeja «No es depósito». La ficha se
 * arrastra (o se toca y luego la caja) al PRIMER agregado donde entra.
 * Acierto: entra y la caja crece un poco. Error: rebota con borde coral, la
 * retro de ese destino, y se reintenta sin puntaje.
 * Las cajas anidadas son botones hermanos superpuestos: M1 va primero en el
 * DOM y encima (z-index), así el destino bajo el dedo es el más interno.
 * Partida: 7 de 9. Puntaje = aciertos al primer intento / 7.
 */
import { useMemo, useState } from "react";
import { BORDE, CORAL, FONDO, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, useCronometro } from "../comun/ui.jsx";
import { azarDeLaPagina, sortear } from "../comun/azar.js";
import { useArrastre } from "../comun/arrastre.js";
import { Objeto } from "../comun/kit.jsx";
import { MONETARIA } from "./comun-pm.jsx";
import { BANCO_H3, CAJAS_H3, CONSIGNAS, PARTIDA_H3 } from "./textos.js";

export const ID = "pm26-h3-cajas";
export const prepararH3 = (rng = Math.random) => sortear(BANCO_H3, PARTIDA_H3, rng);
const nombre = (id) => CAJAS_H3.find((c) => c.id === id).nombre;

const CSS = `
.pm26-h3-ficha { display: block; width: 100%; min-height: 56px; padding: 8px 14px; border-radius: 14px; border: 2px solid ${INK}; background: ${SUPERFICIE_2}; color: ${INK}; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: center; cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; }
.pm26-h3-ficha[aria-pressed="true"] { box-shadow: 0 0 0 3px ${INK_2}; }
.pm26-h3-ficha[data-estado="mal"] { border-color: ${CORAL}; }
.pm26-h3-zona { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 8px; margin-top: 10px; }
.pm26-h3-anidadas { position: relative; height: 196px; }
.pm26-h3-caja { position: absolute; left: 0; bottom: 0; display: flex; align-items: flex-start; justify-content: flex-start; padding: 4px 8px; border-radius: 10px; border: 2px solid ${INK_2}; background: rgba(42,157,143,.06); color: ${INK}; font: 700 15px/1.2 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; transform-origin: bottom left; transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.pm26-h3-caja[data-blanco="1"], .pm26-h3-otro[data-blanco="1"] { box-shadow: 0 0 0 3px ${MONETARIA}; }
.pm26-h3-otro { display: grid; justify-items: center; align-content: center; gap: 2px; width: 100%; min-height: 92px; padding: 4px; border-radius: 12px; border: 2px solid ${BORDE}; background: ${FONDO}; color: ${INK}; font: 700 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); text-align: center; cursor: pointer; touch-action: manipulation; }
.pm26-h3-cuenta { font: 600 12px/1 var(--planck-font-mono, monospace); color: ${INK_2}; }
`;
/* M1 primero: es el destino más interno y va encima. */
const GEOMETRIA = { m1: { w: "46%", h: 92, z: 3 }, m2: { w: "73%", h: 144, z: 2 }, m3: { w: "100%", h: 196, z: 1 } };

export default function H3Cajas({ onTerminar, rng = null }) {
  const fichas = useMemo(() => prepararH3(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [n, setN] = useState(0);
  const [intento, setIntento] = useState(1);
  const [detalle, setDetalle] = useState([]);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const [rojo, setRojo] = useState(false);
  const [entro, setEntro] = useState(null);
  const [cuenta, setCuenta] = useState({});
  const f = fichas[n];

  const soltar = (id, caja) => {
    if (!f || entro || id !== f.id) return;
    if (caja === f.correcta) {
      if (intento === 1) setDetalle((d) => [...d, { item: f.id, ok: true, subtemas: f.subtemas }]);
      setRetro(null);
      setEntro(caja);
      setCuenta((c) => ({ ...c, [caja]: (c[caja] ?? 0) + 1 }));
      return;
    }
    if (intento === 1) { setDetalle((d) => [...d, { item: f.id, ok: false, subtemas: f.subtemas }]); setIntento(2); }
    setRetro(f.retro[caja]);
    setMal((m) => m + 1);
    setRojo(true);
    setTimeout(() => setRojo(false), 300);
  };
  const seguir = () => {
    if (n + 1 >= fichas.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / fichas.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setN(n + 1);
    setIntento(1);
    setEntro(null);
    setRetro(null);
  };
  const { contenedor, pieza, destino } = useArrastre({ alSoltar: soltar, activo: !entro });
  const crece = (id) => `scale(${1 + 0.015 * (cuenta[id] ?? 0)})`;

  return (
    <MarcoHacer id={ID} consigna={CONSIGNAS[ID]} progreso={`${n + 1} / ${fichas.length}`}>
      <style>{CSS}</style>
      <div data-figura ref={contenedor}>
        <div style={{ minHeight: 60 }}>
          {!entro
            ? <div className="da26-entra" key={f.id}>
                <button type="button" key={`${f.id}-${mal}`} className={`pm26-h3-ficha${rojo ? " da26-tiembla" : ""}`} data-ficha={f.id} data-estado={rojo ? "mal" : undefined}
                  aria-label={`${f.texto}. Arrástrala a su caja, o tócala y toca la caja.`} {...pieza(f.id)}>{f.texto}</button>
              </div>
            : <p className="da26-entra" style={{ margin: 0, padding: "10px 4px", fontSize: 15, fontWeight: 600 }} data-ficha-puesta>{f.texto} → {nombre(entro)}</p>}
        </div>
        <div className="pm26-h3-zona">
          <div style={{ display: "grid", gap: 8 }}>
            <button type="button" className="pm26-h3-otro" style={{ transform: crece("bm") }} aria-label={`Llevar a ${nombre("bm")}`} disabled={Boolean(entro)} {...destino("bm", f.id)}>
              <Objeto id="boveda" alto={44} />{nombre("bm")}
            </button>
            <button type="button" className="pm26-h3-otro" aria-label={`Llevar a ${nombre("no")}`} disabled={Boolean(entro)} {...destino("no", f.id)}>
              <svg viewBox="0 0 48 24" width="48" height="24" aria-hidden="true"><path d="M3 6l5 15h32l5-15" fill="none" stroke={INK_2} strokeWidth="2.5" strokeLinejoin="round" /></svg>{nombre("no")}
            </button>
          </div>
          <div className="pm26-h3-anidadas" role="group" aria-label="M1 dentro de M2 dentro de M3">
            {["m1", "m2", "m3"].map((id) => (
              <button key={id} type="button" className="pm26-h3-caja" data-caja={id} aria-label={`Llevar a ${nombre(id)}`} disabled={Boolean(entro)}
                style={{ width: GEOMETRIA[id].w, height: GEOMETRIA[id].h, zIndex: GEOMETRIA[id].z, borderColor: entro === id ? MONETARIA : undefined, transform: crece(id) }}
                {...destino(id, f.id)}>
                {nombre(id)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
      {entro && <Retro estado="bien">{nombre(entro)}</Retro>}
      <div className="da26-nav">
        <span />
        <Boton primario onClick={seguir} disabled={!entro} data-siguiente>{n + 1 >= fichas.length ? "Terminar" : "Siguiente ficha"}</Boton>
      </div>
    </MarcoHacer>
  );
}
