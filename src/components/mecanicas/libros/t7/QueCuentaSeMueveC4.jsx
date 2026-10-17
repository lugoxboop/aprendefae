import { useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import DecisionC4, { OpcionC4 } from "./decisionC4.jsx";
import { CSS_T71C4, Cuadra } from "./c4T71.jsx";
import { H1, resumenH1 } from "../../../../data/contabilidadT7_1_h1.js";
import { CONSECUENCIA_C4, NO_SE_ANOTA } from "../../../../contabilidad/c4/t71h1_c4.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 1 · ¿QUÉ CUENTA SE MUEVE? en el patrón de enganche C4 («Toda
 * decisión se pinta», D4 + D9; Watari, sección t71-h1), sobre el motor de la
 * célula (decisionC4.jsx). Reemplaza en la vista a QueCuentaSeMueve.jsx, con
 * el mismo id.
 *
 * Objeto propio: las cuentas del periódico. Las cuatro cuentas T y la bandeja
 * «No se anota» SON las opciones (enFigura): al tocar, el hecho entra ahí y
 * esa cuenta se mueve; el veredicto, 380 ms después. Un intento por hecho;
 * si falló, la correcta con «Iba aquí». Los hechos se barajan en cada
 * partida (como en main); las cinco opciones, nunca.
 *
 * De Near, tal cual: consigna, hechos, opciones, error típico, porqué (tras
 * «¿Por qué?»), pie y el resumen del cierre. Puntaje: aciertos / 6 × 100.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS_H1 = `
.t71-minis { display: grid; grid-template-columns: repeat(auto-fit, minmax(118px, 1fr)); gap: 8px; }
.c4-op.t71-mini { display: grid; gap: 4px; align-content: start; justify-content: stretch; text-align: left; }
.t71-mini-tit { font-size: 13px; font-weight: 600; line-height: 1.3; }
.t71-mini-t { display: grid; grid-template-columns: 1fr 1fr; height: 22px; border-top: 2px solid var(--neutro); width: 100%; }
.t71-mini-t span:first-child { border-right: 2px solid var(--neutro); }
.t71-mini-t.mueve { border-top-width: 3px; }
.t71-mini-est { font-size: 12px; line-height: 1.3; color: var(--atenuado); }
.t71-mini-est.mueve { color: var(--texto); font-weight: 600; }
.c4-op.t71-bandeja { border-style: dashed; font-size: 13px; }
`;

function FiguraH1({ estado, item, ctx }) {
  const cuentas = item.opciones.filter((o) => o.id !== NO_SE_ANOTA);
  const no = item.opciones.find((o) => o.id === NO_SE_ANOTA);
  return (
    <section className="t71-obj" data-cuentas aria-label={CONSECUENCIA_C4.objeto}>
      <div className="t71-minis" role="group" aria-label={H1.nombre}>
        {cuentas.map((o) => {
          const c = estado.cuentas.find((x) => x.id === o.id);
          return (
            <OpcionC4 key={o.id} ctx={ctx} opcion={o} className={`t71-mini${c.mueve ? " c4-mov" : ""}`}>
              <span className="t71-mini-tit">{o.t}</span>
              <span className={`t71-mini-t${c.mueve ? " mueve" : ""}`} aria-hidden="true"><span /><span /></span>
              <span className={`t71-mini-est${c.mueve ? " mueve" : ""}`} data-estado-cuenta={o.id}>{c.rotulo}</span>
            </OpcionC4>
          );
        })}
      </div>
      <OpcionC4 ctx={ctx} opcion={no} className={`t71-bandeja${estado.bandeja ? " c4-mov" : ""}`}>
        <span data-bandeja>{estado.bandeja ?? no.t}</span>
      </OpcionC4>
      <Cuadra estado={estado} vista={ctx.vista} />
    </section>
  );
}

const Figura = (p) => <><style>{CSS_T71C4}{CSS_H1}</style><FiguraH1 {...p} /></>;

export default function QueCuentaSeMueveC4({ Marco, rotulo, titulo, acento, onCompletar, onComoSeJuega = null, items = null }) {
  const [orden] = useState(() => items ?? barajar(CONSECUENCIA_C4.items));
  const pieza = {
    ...CONSECUENCIA_C4,
    id: H1.id,
    titulo: titulo ?? H1.nombre,
    items: orden,
    objetivo: H1.objetivo ?? null,
    consigna: H1.consigna.join(" "),
    enFigura: true,
    Figura,
    resumen: resumenH1,
  };
  return <DecisionC4 pieza={pieza} Marco={Marco} rotulo={rotulo} acento={acento} onCompletar={onCompletar} onComoSeJuega={onComoSeJuega} />;
}
