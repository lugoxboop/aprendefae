import { Panel } from "../../salaDeControl/marco.jsx";
import { IconoCheck } from "../b5/Devolucion.jsx";
import { Ficha, Parrafos } from "./hacerT7.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * C4 · T7-1 — lo que comparten las figuras de A7, H1, H3, H4, H5, H6 y H7
 * sobre el motor de la célula (decisionC4.jsx). Las figuras son de Watari
 * (patrón de enganche C4, codigo-f71); las clases van con el prefijo `t71-`
 * para no chocar con las de T7-2, T7-3 y T5, que viven en la misma página.
 * Colores: los del motor (texto, neutro, coral solo para la falla). Ni teal
 * ni ámbar: son el debe y el haber.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_T71C4 = `
.t71-obj { margin: 0; padding: 12px 14px; display: grid; gap: 8px; min-width: 0; border-radius: 12px; background: rgba(10,20,34,.45); border: 1px solid rgba(248,249,250,.12); }
.t71-tit { margin: 0; font: 600 13px/1.3 "Sora", "Inter", sans-serif; }
.t71-linea { margin: 0; font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; }
.t71-num { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; font-weight: 600; white-space: nowrap; }
.t71-cuadra { margin: 0; display: flex; gap: 6px; align-items: flex-start; font-size: 13px; line-height: 1.4; }
.t71-cuadra svg { flex: none; margin-top: 2px; }
.t71-mal { border-color: var(--coral) !important; }
.t71-contexto { display: grid; gap: 0; }
`;

/* Lo que sí cuadra: un ✓ y su frase. Solo con el veredicto (la falla la pinta el motor). */
export function Cuadra({ estado, vista }) {
  if (!estado?.cuadra || !vista.veredicto || !vista.ok) return null;
  return <p className="t71-cuadra c4-cuadra" data-cuadra><IconoCheck /><span>{estado.cuadra}</span></p>;
}

/*
 * El Marco de los Hacer con caso: envuelve el Marco de la vista y pone el caso
 * de Near (párrafos y ficha), como en main, arriba de la actividad. En el
 * cierre (un solo hijo: Cierre) no va. Se crea una vez por Marco (useMemo en
 * la pieza): un tipo nuevo en cada render volvería a montar el motor.
 */
export function marcoConCaso(Marco = Panel, { parrafos = null, entrada = null, ficha = null }) {
  return function MarcoCaso({ rotulo, titulo, acento, children }) {
    const jugando = Array.isArray(children);
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        {jugando && (
          <div className="t71-contexto" data-caso>
            {entrada && <Parrafos textos={[entrada]} dato="entrada" />}
            {parrafos && <Parrafos textos={parrafos} />}
            {ficha && <Ficha filas={ficha} />}
          </div>
        )}
        {children}
      </Marco>
    );
  };
}
