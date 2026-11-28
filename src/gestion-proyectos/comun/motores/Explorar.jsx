/*
 * GESTIÓN DE PROYECTOS · MOTOR «EXPLORAR» (lote 4, c07 H03): exploración
 * libre, sin puntaje, antes del reto.
 *
 * Unos deslizadores (cada uno con su valor ESCRITO al lado y botones ◀ ▶ de
 * 48 px, porque el pulgar del deslizador es chico en el teléfono) y lo que la
 * escena pinte con esos valores (`escena.explorar(valores)`: las dos
 * pantallas de la calculadora). Con `minimo` movimientos aparece «Seguir».
 * No manda detalle ni puntos: vale 0 ítems (preparar.js, itemsDePaso).
 *
 * Lote 5 (c10 H04, predecir y revelar): con `paso.apuesta` el paso es una
 * apuesta sin puntaje; los valores elegidos van como `destino` a los pasos
 * que siguen en la etapa (la escena del revelado los lee), y `paso.listo`
 * cambia el rótulo de abajo.
 */
import { useState } from "react";
import { Boton } from "../../../macro2026/comun/ui.jsx";
import { Personaje } from "../elenco.jsx";

const CSS = `
.gp-explora { display: grid; gap: 8px; margin-top: 10px; }
.gp-explora-fila { display: grid; grid-template-columns: 48px minmax(0, 1fr) 48px; gap: 6px 8px; align-items: center; padding: 8px 10px; border-radius: 12px; background: rgba(8,16,30,.72); border: 1px solid rgba(244,245,247,.28); }
.gp-explora-nombre { grid-column: 1 / -1; display: flex; justify-content: space-between; gap: 8px; font: 700 14px/1.25 var(--planck-font-sans, system-ui, sans-serif); }
.gp-explora-valor { font: 800 16px/1.2 var(--planck-font-mono, ui-monospace, monospace); }
.gp-explora input[type="range"] { width: 100%; min-height: 44px; accent-color: var(--gp-acento, #a7bbff); }
.gp-explora .gp-flecha { min-width: 48px; min-height: 48px; border-radius: 10px; border: 2px solid rgba(244,245,247,.55); background: rgba(31,50,80,.92); color: #f4f5f7; font: 800 18px/1 var(--planck-font-sans, system-ui, sans-serif); cursor: pointer; touch-action: manipulation; }
.gp-explora-cuenta { margin: 6px 0 0; text-align: right; font: 600 12px/16px var(--planck-font-sans, system-ui, sans-serif); color: #b6bbc5; }
`;

const coma = (v) => String(v).replace(".", ",");

export default function Explorar({ paso, escena = {}, alTerminar }) {
  const [valores, setValores] = useState(() => Object.fromEntries(paso.controles.map((c) => [c.id, c.inicial])));
  const [movs, setMovs] = useState(0);
  const minimo = paso.minimo ?? 3;
  const poner = (c, v) => {
    const n = Math.max(c.min, Math.min(c.max, Number(v)));
    if (n === valores[c.id]) return;
    setValores((x) => ({ ...x, [c.id]: n }));
    setMovs((m) => m + 1);
  };
  const quien = escena.mesa === false ? null : paso.mesa ?? escena.mesa ?? "tu";

  return (
    <div data-paso-id={paso.id} data-motor="explorar">
      <style>{CSS}</style>
      <div className="gp-visual" data-visual={escena.nombre ?? "escena"}
        style={{ "--gp-a": escena.fondo?.[0], "--gp-b": escena.fondo?.[1], "--gp-acento": escena.acento, "--gp-luz": escena.luz }}>
        {escena.antes?.({ paso, valores })}
        {quien && <div className="gp-mesa" style={{ minHeight: 0 }}><Personaje quien={quien} alto={124} /><div className="gp-centro">{paso.texto && <p className="gp-contexto">{paso.texto}</p>}</div></div>}
        {escena.explorar?.({ paso, valores })}
        <div className="gp-explora" role="group" aria-label="Valores para explorar">
          {paso.controles.map((c) => {
            const etq = `${paso.id}-${c.id}`;
            return (
              <div key={c.id} className="gp-explora-fila" data-control={c.id}>
                <label className="gp-explora-nombre" htmlFor={etq}><span>{c.nombre}</span><span className="gp-explora-valor" data-valor={c.id}>{coma(valores[c.id])}{c.unidad ? ` ${c.unidad}` : ""}</span></label>
                <button type="button" className="gp-flecha" aria-label={`${c.nombre}: menos`} onClick={() => poner(c, valores[c.id] - (c.salto ?? 1))} data-menos={c.id}>◀</button>
                <input id={etq} type="range" min={c.min} max={c.max} step={c.salto ?? 1} value={valores[c.id]} onChange={(ev) => poner(c, ev.target.value)} data-deslizador={c.id} />
                <button type="button" className="gp-flecha" aria-label={`${c.nombre}: más`} onClick={() => poner(c, valores[c.id] + (c.salto ?? 1))} data-mas={c.id}>▶</button>
              </div>
            );
          })}
        </div>
        <p className="gp-explora-cuenta" data-movimientos={movs}>{movs < minimo ? `Prueba ${minimo - movs} ${minimo - movs === 1 ? "movimiento" : "movimientos"} más` : paso.listo ?? "Ya viste cómo cambian: sigue al reto"}</p>
      </div>
      {movs >= minimo && (
        <div className="gp-pie"><Boton primario onClick={() => alTerminar({ detalle: [], puntos: 0, ...(paso.apuesta ? { destino: valores } : {}) })} data-seguir>Seguir</Boton></div>
      )}
    </div>
  );
}
