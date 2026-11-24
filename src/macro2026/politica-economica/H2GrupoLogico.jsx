/*
 * H2 · Arma el grupo lógico (pe26-h2-grupo-logico, Hacer, Difícil, 50 × 3 = 150 FP × %).
 * Especificación de Gen, t2 §2 H2. La escalera empieza con el Problema ya
 * puesto abajo. Para el peldaño siguiente salen 3 tarjetas en orden
 * aleatorio: 1 coherente y 2 distractoras. Se arrastra una al peldaño, o se
 * toca.
 * - Correcta: encaja y el personaje sube un peldaño.
 * - Distractora: cae por el hueco, borde coral, su retro. Se elige de nuevo
 *   entre las dos que quedan, y ese peldaño ya no puntúa.
 * Al llegar a Meta, la escalera se ilumina de abajo arriba (6 × 120 ms) con
 * la bandera «Grupo lógico».
 * Partida: 3 grupos (3 etapas) sorteados de 7. Puntaje = peldaños correctos
 * al primer intento / 15.
 *
 * Decisión (construccion-t2.md): tocar una tarjeta la elige y la suelta en
 * el peldaño actual. En esta pieza solo hay un destino, así que pedir un
 * segundo toque no aporta nada. Un ítem es `<grupo>-<peldaño>`.
 */
import { useEffect, useMemo, useState } from "react";
import { CORAL, FONDO, INK, INK_2 } from "../comun/colores-da.js";
import { Boton, MarcoHacer, Retro, useCronometro, movimientoReducido } from "../comun/ui.jsx";
import { barajar, sortear, azarDeLaPagina } from "../comun/azar.js";
import { useArrastre } from "../comun/arrastre.js";
import Escalera, { ORDEN_PELDANOS } from "../comun/Escalera.jsx";
import { BANCO_H2, CONSIGNAS, ENUNCIADOS, H2, PARTIDA_H2, ESCENAS } from "./textos.js";

export const ID = "pe26-h2-grupo-logico";
const SUBEN = ORDEN_PELDANOS.slice(1);

/** Los grupos de la partida, cada peldaño con sus tres tarjetas ya barajadas. */
export function prepararH2(rng = Math.random) {
  return sortear(BANCO_H2, PARTIDA_H2, rng).map((g) => ({
    ...g,
    tarjetas: Object.fromEntries(SUBEN.map((p) => {
      const s = g.pasos[p];
      return [p, barajar([{ n: s.correcta, ok: true }, ...s.distractoras.map((d) => ({ n: d.n, ok: false, retro: d.retro }))], rng)];
    })),
  }));
}

const CSS = `
.pe26-h2-cab { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 8px; font: 600 13px/1.3 var(--planck-font-sans, system-ui, sans-serif); color: ${INK_2}; }
.pe26-h2-tarjetas { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.pe26-h2-tarjeta { display: block; width: 100%; min-height: 48px; padding: 8px 12px; border-radius: 12px; border: 2px solid ${INK}; background: ${FONDO}; color: ${INK}; font: 600 14px/1.35 var(--planck-font-sans, system-ui, sans-serif); text-align: left; cursor: grab; touch-action: none; -webkit-user-select: none; user-select: none; transition: transform 280ms cubic-bezier(.3,.9,.4,1); }
.pe26-h2-tarjeta[data-arrastrando="1"] { transition: none; cursor: grabbing; box-shadow: 0 10px 24px rgba(0,0,0,.5); }
.pe26-h2-tarjeta[data-estado="mal"] { border-color: ${CORAL}; }
.pe26-h2-cae { animation: pe26-h2-cae 420ms cubic-bezier(.5,0,.8,.4) both 1; pointer-events: none; }
@keyframes pe26-h2-cae { from { opacity: 1; transform: translateY(0) rotate(0); } to { opacity: 0; transform: translateY(60px) rotate(4deg); } }
.pe26-h2-bandera { display: inline-flex; align-items: center; gap: 6px; margin: 10px 0 0; padding: 6px 12px; border-radius: 999px; border: 2px solid ${INK}; font: 700 14px/1.2 var(--planck-font-sans, system-ui, sans-serif); color: ${INK}; }
@media (prefers-reduced-motion: reduce) { .pe26-h2-tarjeta { transition: none; } .pe26-h2-cae { animation: pe26-h2-funde 120ms linear both 1; } }
@keyframes pe26-h2-funde { to { opacity: 0; } }
`;

export default function H2GrupoLogico({ onTerminar, rng = null }) {
  const grupos = useMemo(() => prepararH2(rng ?? azarDeLaPagina()), [rng]);
  const tiempo = useCronometro();
  const [g, setG] = useState(0);
  const [k, setK] = useState(0);
  const [fallados, setFallados] = useState(new Set());
  const [cayendo, setCayendo] = useState(null);
  const [puestos, setPuestos] = useState({});
  const [detalle, setDetalle] = useState([]);
  const [retro, setRetro] = useState(null);
  const [mal, setMal] = useState(0);
  const [luz, setLuz] = useState(0);
  const grupo = grupos[g];
  const peldano = SUBEN[k] ?? null;
  const completo = k >= SUBEN.length;
  const tarjetas = peldano ? grupo.tarjetas[peldano] : [];
  const item = (p) => `${grupo.id}-${p}`;

  const soltar = (n, destino) => {
    if (completo || cayendo != null || destino !== peldano) return;
    const t = tarjetas.find((x) => String(x.n) === String(n));
    if (!t || fallados.has(t.n)) return;
    const primera = fallados.size === 0;
    if (t.ok) {
      const det = [...detalle, { item: item(peldano), ok: primera, subtemas: grupo.subtemas }];
      setDetalle(det);
      setRetro(null);
      setPuestos({ ...puestos, [peldano]: ENUNCIADOS[t.n] });
      setFallados(new Set());
      setK(k + 1);
      return;
    }
    setRetro(t.retro);
    setMal((m) => m + 1);
    setCayendo(t.n);
    setTimeout(() => { setCayendo(null); setFallados((f) => new Set(f).add(t.n)); }, movimientoReducido() ? 120 : 420);
  };

  const { contenedor, pieza, destino, elegido, setElegido } = useArrastre({ alSoltar: soltar, activo: !completo && cayendo == null });

  /* Tocar (o Enter) una tarjeta la suelta en el peldaño actual. */
  useEffect(() => {
    if (elegido == null || !peldano) return;
    setElegido(null);
    soltar(elegido, peldano);
  });

  /* Al llegar a Meta: la escalera se enciende de abajo arriba, 6 × 120 ms. */
  useEffect(() => {
    if (!completo) { setLuz(0); return undefined; }
    if (luz >= ORDEN_PELDANOS.length) return undefined;
    const t = setTimeout(() => setLuz((x) => x + 1), movimientoReducido() ? 0 : 120);
    return () => clearTimeout(t);
  }, [completo, luz]);

  const siguienteGrupo = () => {
    if (g + 1 >= grupos.length) {
      const bien = detalle.filter((d) => d.ok).length;
      onTerminar?.({ pct: Math.round((bien / detalle.length) * 100), detalle, duracionMs: tiempo() });
      return;
    }
    setG(g + 1);
    setK(0);
    setPuestos({});
    setFallados(new Set());
    setRetro(null);
  };

  const contenido = { problema: ENUNCIADOS[grupo.problema], ...puestos };
  const iluminados = completo ? new Set(ORDEN_PELDANOS.slice(0, luz)) : null;
  const personaje = completo ? "meta" : ORDEN_PELDANOS[k];

  return (
    <MarcoHacer id={ID} escena={ESCENAS[ID]} mini={{ etiqueta: ESCENAS[ID].porRonda.etiqueta, texto: grupos[g]?.nombre, datos: { "data-grupo-escena": grupos[g]?.id } }} consigna={CONSIGNAS[ID]} progreso={`${g + 1} / ${grupos.length}`}>
      <style>{CSS}</style>
      <div data-figura ref={contenedor} data-grupo={grupo.id}>
        <div className="pe26-h2-cab"><span>Grupo {g + 1}: {grupo.nombre}</span></div>
        <Escalera
          contenido={contenido}
          actual={peldano}
          compacto
          personaje={personaje}
          iluminados={iluminados}
          destino={(p) => (p === peldano ? destino(p) : {})}
        />
        {!completo && (
          <div className="pe26-h2-tarjetas" role="group" aria-label={`Tarjetas para el peldaño ${k + 2}`} key={`${grupo.id}-${peldano}`}>
            {tarjetas.filter((t) => !fallados.has(t.n)).map((t) => {
              const p = pieza(t.n);
              return (
                <button
                  key={t.n}
                  type="button"
                  className={`pe26-h2-tarjeta da26-entra${cayendo === t.n ? " pe26-h2-cae" : ""}`}
                  data-tarjeta={t.n}
                  data-estado={cayendo === t.n ? "mal" : undefined}
                  aria-label={`${ENUNCIADOS[t.n]}. Tócala o arrástrala a la escalera.`}
                  {...p}
                  style={p.style}
                >
                  {ENUNCIADOS[t.n]}
                </button>
              );
            })}
          </div>
        )}
        {completo && (
          <div className="da26-entra" data-grupo-completo={grupo.id}>
            {luz >= ORDEN_PELDANOS.length && <p className="pe26-h2-bandera" data-bandera>⚑ {H2.bandera}</p>}
            <div className="da26-nav" style={{ marginTop: 12 }}>
              <span />
              <Boton primario onClick={siguienteGrupo} data-siguiente-grupo>{g + 1 >= grupos.length ? "Terminar" : "Siguiente grupo"}</Boton>
            </div>
          </div>
        )}
      </div>
      <Retro estado="mal" key={`r${mal}`}>{retro}</Retro>
    </MarcoHacer>
  );
}
