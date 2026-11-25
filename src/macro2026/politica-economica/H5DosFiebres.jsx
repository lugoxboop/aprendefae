/*
 * H5 · Un paciente, dos fiebres (pe26-h5-dos-fiebres, Hacer, Medio, 25 FP, exploratoria).
 * Especificación de Gen, t2 §2 H5. El circuito de A2, con tres medidores
 * grandes de 5 rayas: Precios, Producción y Déficit fiscal. Cada decisión
 * mueve las rayas (280 ms por raya). Desde el lote 3 de ilustrados (25-nov)
 * cada medidor es un termómetro de vidrio: el mercurio sube de 1 a 5.
 * - Paso 1: el Banco de la República decide sobre la tasa.
 * - Paso 2: el Gobierno decide sobre el gasto.
 * Los medidores se recortan a 1–5. El final se lee bajo los medidores y
 * cierra con «Ningún remedio sale gratis…» y «Probar otro tratamiento».
 * Un mapa de 9 finales se va llenando.
 *
 * Decisiones (construccion-t2.md):
 * - El FP es completo (exploratoria: pct 100) y sale UNA vez, al pulsar
 *   «Terminar» en la pantalla de un final. Así la lectura y el cierre se
 *   pueden leer antes de que la pantalla de resumen los tape. El servidor ya
 *   paga una sola vez, así que los demás finales no suman.
 * - El mapa de finales se guarda en este navegador (localStorage), no en la
 *   base: guardarlo por estudiante en el servidor pediría una migración nueva.
 */
import { useEffect, useState } from "react";
import { BORDE, INK, INK_2, SUPERFICIE_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, useCronometro, movimientoReducido } from "../comun/ui.jsx";
import { RAMAS, colorRama } from "../comun/ramas.js";
import { IconoRama } from "../comun/iconos-pe.jsx";
import { TermometroVidrio } from "../comun/ilustrados.jsx";
import { CIERRE_H5, ENTRADA_H5, FINALES_H5, INICIO_H5, MEDIDORES_H5, OTRO_H5, PASOS_H5, SUBTEMAS_CIERRE_H5, ESCENAS, POSES_H5 } from "./textos.js";

export const ID = "pe26-h5-dos-fiebres";
const CLAVE = "aprendefae-pe26-h5-finales";
const recorta = (v) => Math.max(1, Math.min(5, v));

/** Los medidores después de aplicar las decisiones, recortados a 1–5. */
export function medidoresH5(elecciones) {
  const m = { ...INICIO_H5 };
  elecciones.forEach((op, k) => {
    const o = PASOS_H5[k].opciones.find((x) => x.id === op);
    for (const [c, d] of Object.entries(o?.efecto ?? {})) m[c] = recorta(m[c] + d);
  });
  return m;
}

function leerMapa() {
  try { return new Set(JSON.parse(localStorage.getItem(CLAVE) ?? "[]")); } catch { return new Set(); }
}
function guardarMapa(s) {
  try { localStorage.setItem(CLAVE, JSON.stringify([...s])); } catch { /* sin almacenamiento */ }
}

const CSS = `
.pe26-h5-cuerpo { position: relative; padding: 14px 10px; border-radius: 50% / 22%; border: 2.5px solid ${INK_2}; }
.pe26-h5-meds { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.pe26-h5-med { display: flex; flex-direction: column; align-items: center; gap: 6px; font: 600 13px/1.2 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; text-align: center; }
.pe26-h5-rayas { display: flex; flex-direction: column-reverse; gap: 4px; width: 44px; }
.pe26-h5-raya { height: 12px; border-radius: 3px; border: 1.5px solid ${BORDE}; background: transparent; transition: background 280ms cubic-bezier(.3,.9,.4,1), border-color 280ms cubic-bezier(.3,.9,.4,1); }
.pe26-h5-raya[data-llena="1"] { background: ${INK}; border-color: ${INK}; }
.pe26-h5-num { font: 700 14px/1 var(--planck-font-mono, monospace); }
.pe26-h5-quien { display: flex; align-items: center; gap: 8px; margin: 14px 0 8px; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.pe26-h5-ops { display: flex; flex-direction: column; gap: 8px; }
.pe26-h5-op { min-height: 48px; padding: 8px 14px; border-radius: 12px; border: 2px solid var(--rama); background: transparent; color: ${INK}; font: 600 15px/1.3 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: pointer; touch-action: manipulation; }
.pe26-h5-lectura { margin: 12px 0 6px; font: 600 16px/1.4 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.pe26-h5-cierre { margin: 0 0 12px; font-size: 15px; line-height: 1.4; color: ${INK_2}; }
.pe26-h5-mapa { display: grid; grid-template-columns: repeat(3, 28px); gap: 6px; justify-content: start; margin: 4px 0 12px; }
.pe26-h5-fin { width: 28px; height: 28px; border-radius: 6px; border: 1.5px solid ${BORDE}; display: grid; place-items: center; font: 700 13px/1 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
.pe26-h5-fin[data-visto="1"] { background: ${SUPERFICIE_2}; border-color: ${INK}; }
.pe26-h5-fin[data-ahora="1"] { box-shadow: 0 0 0 2px ${INK}; }
@media (prefers-reduced-motion: reduce) { .pe26-h5-raya { transition: none; } }
`;

/* Una raya cambia cada 280 ms: los medidores no saltan de golpe. */
function useRayas(objetivo) {
  const [v, setV] = useState(objetivo);
  useEffect(() => {
    /* Ya está: no se toca el estado (si no, cada render pediría otro). */
    if (MEDIDORES_H5.every((m) => v[m.id] === objetivo[m.id])) return undefined;
    if (movimientoReducido()) { setV(objetivo); return undefined; }
    const t = setTimeout(() => setV((a) => Object.fromEntries(MEDIDORES_H5.map((m) => [m.id, a[m.id] + Math.sign(objetivo[m.id] - a[m.id])]))), 280);
    return () => clearTimeout(t);
  });
  return v;
}

export default function H5DosFiebres({ onTerminar }) {
  const tiempo = useCronometro();
  const [elecciones, setElecciones] = useState([]);
  const [narracion, setNarracion] = useState(null);
  const [mapa, setMapa] = useState(leerMapa);
  const [cobrado, setCobrado] = useState(false);
  const objetivo = medidoresH5(elecciones);
  const v = useRayas(objetivo);
  const paso = PASOS_H5[elecciones.length] ?? null;
  const clave = elecciones.length === 2 ? elecciones.join("+") : null;
  const final = clave ? FINALES_H5[clave] : null;

  const elegir = (op) => {
    const nuevas = [...elecciones, op.id];
    setElecciones(nuevas);
    setNarracion(op.narracion);
    if (nuevas.length === 2) {
      const s = new Set(mapa).add(nuevas.join("+"));
      setMapa(s);
      guardarMapa(s);
    }
  };
  const otro = () => { setElecciones([]); setNarracion(null); };
  const terminar = () => {
    if (cobrado) return;
    setCobrado(true);
    const detalle = [
      ...PASOS_H5.map((p, k) => ({ item: `${p.id}-${elecciones[k]}`, ok: true, subtemas: p.subtemas })),
      { item: `final-${clave}`, ok: true, subtemas: SUBTEMAS_CIERRE_H5 },
    ];
    onTerminar?.({ pct: 100, detalle, duracionMs: tiempo() });
  };

  /* Rediseño lote 2: la escena compacta lee el paso. Antes de elegir, la
     entrada; después, la narración de lo elegido (antes iba en una Retro del
     cuerpo). La autoridad cambia de pose: timón con la tasa, grifo con el gasto. */
  const mini = {
    texto: narracion ?? ENTRADA_H5,
    datos: narracion ? { "data-retro": "", role: "status" } : { "data-entrada": "" },
    mascota: { id: "autoridad-economica", pose: POSES_H5[(paso ?? PASOS_H5[1]).id] },
  };

  return (
    <MarcoHacer id={ID} escena={ESCENAS[ID]} mini={mini} consigna={(paso ?? PASOS_H5[1]).consigna} progreso={`${Math.min(elecciones.length + 1, 2)} / 2`}>
      <style>{CSS}</style>
      <div data-figura>
        <div className="pe26-h5-cuerpo" data-circuito>
          <div className="pe26-h5-meds">
            {MEDIDORES_H5.map((m) => (
              <div key={m.id} className="pe26-h5-med" data-medidor={m.id} data-valor={objetivo[m.id]} role="img" aria-label={`${m.nombre}: ${objetivo[m.id]} de 5`}>
                <svg width="44" height="104" viewBox="0 0 44 104" aria-hidden="true" style={{ width: 44, height: 104, display: "block" }} data-termo-h5={v[m.id]}>
                  <TermometroVidrio x={2} y={0} alto={104} nivel={(v[m.id] - 1) / 4} />
                </svg>
                <span className="pe26-h5-num" aria-hidden="true">{v[m.id]}</span>
                <span>{m.nombre}</span>
              </div>
            ))}
          </div>
        </div>
        {paso && (
          <div className="da26-entra" key={paso.id}>
            <p className="pe26-h5-quien">
              <IconoRama id={paso.quien} size={26} />
              <span>{RAMAS[paso.quien].largo}</span>
            </p>
            <div className="pe26-h5-ops" role="group" aria-label={paso.consigna}>
              {paso.opciones.map((o) => (
                <button key={o.id} type="button" className="pe26-h5-op da26-marcable" data-opcion={`${paso.id}-${o.id}`} style={{ "--rama": colorRama(paso.quien) }} onClick={() => elegir(o)}>
                  {o.texto}
                </button>
              ))}
            </div>
          </div>
        )}
        {final && (
          <div className="da26-entra" data-final={clave}>
            <p className="pe26-h5-lectura" data-lectura>{final.lectura}</p>
            <p className="pe26-h5-cierre" data-cierre>{CIERRE_H5}</p>
            <div className="pe26-h5-mapa" role="img" aria-label={`Finales vistos: ${mapa.size} de 9`} data-mapa={mapa.size}>
              {PASOS_H5[0].opciones.flatMap((a) => PASOS_H5[1].opciones.map((b) => {
                const k = `${a.id}+${b.id}`;
                return <span key={k} className="pe26-h5-fin" data-fin={k} data-visto={mapa.has(k) ? "1" : "0"} data-ahora={k === clave ? "1" : "0"}>{mapa.has(k) ? "✓" : ""}</span>;
              }))}
            </div>
            <div className="da26-nav" style={{ flexWrap: "wrap" }}>
              <Boton onClick={otro} data-otro>{OTRO_H5}</Boton>
              <Boton primario onClick={terminar} data-terminar disabled={cobrado}>Terminar</Boton>
            </div>
          </div>
        )}
      </div>
    </MarcoHacer>
  );
}
