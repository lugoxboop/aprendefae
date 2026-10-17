import { useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import DecisionC4, { OpcionC4 } from "./decisionC4.jsx";
import { CSS_T71C4, Cuadra } from "./c4T71.jsx";
import { H7, resumenH7 } from "../../../../data/contabilidadT7_1_h7.js";
import { CONSECUENCIA_C4, ZONAS_H7, LUGAR_H7 } from "../../../../contabilidad/c4/t71h7_c4.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 7 · ¿QUÉ CONTROL FALTA? en el patrón de enganche C4 («Toda
 * decisión se pinta», D4; Watari, sección t71-h7), sobre el motor de la
 * célula (decisionC4.jsx). Reemplaza en la vista a QueControlFalta.jsx, con
 * el mismo id.
 *
 * Objeto propio: el plano de la bodega. Los siete controles SON lugares del
 * plano (enFigura): el que se toca se instala en su zona y el riesgo del caso
 * queda cubierto o sigue abierto; el veredicto, 380 ms después. Un intento
 * por caso (el motor de la célula; la escalera de dos intentos de la D se va
 * con él) y, si falló, la correcta con «Iba aquí». Solo suma el primer
 * intento, como antes. Los casos se barajan en cada partida; las opciones,
 * nunca.
 *
 * De Near, tal cual: objetivo, consigna, casos, controles, la línea de cada
 * distractor, el porqué del libro (tras «¿Por qué?»), el pie y el resumen.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS_H7 = `
.t71-riesgo { margin: 0; padding: 8px 10px; border-radius: 8px; border: 1px dashed var(--neutro); font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
.t71-riesgo.tocado { border: 2px solid var(--neutro); }
.t71-riesgo.cubierto { border: 2px solid var(--texto); }
.t71-riesgo.abierto { border: 2px solid var(--coral); }
.t71-zonas { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; }
.t71-zona { display: grid; gap: 6px; align-content: start; padding: 8px; border-radius: 8px; border: 1px solid rgba(248,249,250,.12); min-width: 0; }
.t71-zona.activa { border: 1px solid var(--neutro); }
.t71-zona-rot { font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--atenuado); font-weight: 600; }
`;

function FiguraH7({ estado, item, ctx }) {
  /* El coral, solo con el veredicto: antes, la consecuencia va en neutro. */
  const clase = estado.cubierto == null ? "" : ` ${!ctx.vista.veredicto ? "tocado" : estado.cubierto ? "cubierto" : "abierto"} c4-mov`;
  return (
    <section className="t71-obj" data-plano aria-label={CONSECUENCIA_C4.objeto}>
      <p className={`t71-riesgo${clase}`} data-riesgo>{estado.riesgo}</p>
      <div className="t71-zonas" role="group" aria-label={H7.nombre}>
        {ZONAS_H7.map((z) => (
          <div key={z} className={`t71-zona${estado.zona === z ? " activa" : ""}`} data-zona={z}>
            <span className="t71-zona-rot">{z}</span>
            {item.opciones.filter((o) => LUGAR_H7[o.id] === z).map((o) => (
              <OpcionC4 key={o.id} ctx={ctx} opcion={o} className={estado.instalado === o.id ? "c4-mov" : ""} />
            ))}
          </div>
        ))}
      </div>
      <Cuadra estado={estado} vista={ctx.vista} />
    </section>
  );
}

const Figura = (p) => <><style>{CSS_T71C4}{CSS_H7}</style><FiguraH7 {...p} /></>;

export default function QueControlFaltaC4({ Marco, rotulo, titulo, acento, onCompletar, onComoSeJuega = null, items = null }) {
  const [orden] = useState(() => items ?? barajar(CONSECUENCIA_C4.items));
  const pieza = {
    ...CONSECUENCIA_C4,
    id: H7.id,
    titulo: titulo ?? H7.nombre,
    items: orden,
    objetivo: H7.objetivo ?? null,
    consigna: H7.consigna.join(" "),
    enFigura: true,
    Figura,
    resumen: resumenH7,
  };
  return <DecisionC4 pieza={pieza} Marco={Marco} rotulo={rotulo} acento={acento} onCompletar={onCompletar} onComoSeJuega={onComoSeJuega} />;
}
