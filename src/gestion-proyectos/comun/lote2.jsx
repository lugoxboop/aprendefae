/*
 * GESTIÓN DE PROYECTOS · PIEZAS COMUNES DE LAS ESCENAS DEL LOTE 2 (caps. 3 y 4).
 *
 * Las 17 Hacer de los caps. 3 y 4 juegan con los motores del lote 1 (casi
 * todas con «decidir»). Lo propio de cada una es su escena: el objeto
 * protagonista (diseño §3) que cambia con cada acierto. Aquí, lo que varias
 * comparten: contar lo ya puesto en la etapa, la tira de lo colocado y la hoja
 * de estilo de esos elementos. Solo transform y opacity en movimiento.
 */
import { CURVA } from "./estilo.js";

/* Las claves ya colocadas en esta etapa, contando el acierto que está entrando. */
export function colocados({ etapa, paso, encaja }) {
  const antes = (etapa?.hechos ?? []).map((h) => ({ id: h.paso.id, texto: h.paso.texto, destino: h.destino, paso: h.paso }));
  return encaja ? [...antes, { id: paso.id, texto: paso.texto, destino: encaja, paso }] : antes;
}
export const cuantos = (estado, clave) => colocados(estado).filter((x) => x.destino === clave).length;

export const CSS_LOTE2 = `
.gp2-fila { display: flex; flex-wrap: wrap; gap: 6px; align-items: flex-end; justify-content: center; }
.gp2-pila { display: grid; gap: 6px; margin-top: 10px; }
.gp2-caja { padding: 8px 10px; border-radius: 12px; background: rgba(8,16,30,.74); border: 1px solid rgba(244,245,247,.28); font: 600 13px/1.3 var(--planck-font-sans, system-ui, sans-serif); min-width: 0; }
.gp2-caja b { display: block; font-size: 12px; letter-spacing: .04em; text-transform: uppercase; color: #b6bbc5; margin-bottom: 4px; }
.gp2-caja[data-lleno="1"] { border-color: #f4f5f7; }
.gp2-rejilla { display: grid; gap: 6px; grid-template-columns: repeat(var(--gp2-cols, 3), minmax(0, 1fr)); margin-top: 10px; }
@media (max-width: 359px) { .gp2-rejilla { --gp2-cols: 2; } }
.gp2-pieza { display: grid; justify-items: center; gap: 4px; min-width: 0; text-align: center; font: 600 12px/1.25 var(--planck-font-sans, system-ui, sans-serif); }
.gp2-gira { transition: transform 480ms ${CURVA}, opacity 480ms ${CURVA}; }
.gp2-entra { animation: gp2-entra 420ms ${CURVA} both 1; }
@keyframes gp2-entra { from { opacity: 0; transform: translateY(8px) scale(.96); } to { opacity: 1; transform: none; } }
.gp2-tambalea { animation: gp2-tambalea 520ms ${CURVA} 1; }
@keyframes gp2-tambalea { 0%,100% { transform: none; } 25% { transform: rotate(-7deg); } 60% { transform: rotate(5deg); } }
.gp2-medidor { position: relative; height: 10px; border-radius: 999px; background: rgba(244,245,247,.18); overflow: hidden; }
.gp2-medidor > span { position: absolute; inset: 0; transform-origin: 0 50%; background: var(--gp2-relleno, #ffc978); transition: transform 420ms ${CURVA}; }
.gp-destinos[data-disposicion="aro"] { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(96px, 30%); grid-template-columns: none; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 6px; overscroll-behavior-x: contain; }
.gp-destinos[data-disposicion="aro"] > * { scroll-snap-align: start; }
@media (max-width: 400px) { .gp-destinos[data-disposicion="aro"] { grid-auto-columns: minmax(84px, 31%); } }
@media (prefers-reduced-motion: reduce) { .gp2-entra, .gp2-tambalea { animation: none !important; } .gp2-gira { transition: opacity 120ms linear !important; } }
`;

/** La hoja de estilo del lote 2 (se monta con `antes` en cada escena). */
export const EstiloLote2 = () => <style>{CSS_LOTE2}</style>;

/** Una barra que se llena (fracción 0–1), con su nombre. */
export function Barra({ nombre, valor, relleno = "#ffc978", total = null }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "2px 8px", alignItems: "center" }}>
      <small style={{ minWidth: 0 }}>{nombre}</small>
      <small className="da26-mono">{total == null ? "" : `${Math.round(valor * total)} / ${total}`}</small>
      <span className="gp2-medidor" style={{ gridColumn: "1 / -1" }}><span style={{ transform: `scaleX(${Math.max(0, Math.min(1, valor))})`, "--gp2-relleno": relleno }} /></span>
    </div>
  );
}
