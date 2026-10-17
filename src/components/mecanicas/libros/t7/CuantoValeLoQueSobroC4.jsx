import { useMemo } from "react";
import DecisionC4 from "./decisionC4.jsx";
import { CSS_T71C4, Cuadra, marcoConCaso } from "./c4T71.jsx";
import { H3, FICHA_H3, resumenH3 } from "../../../../data/contabilidadT7_1_h3.js";
import { CONSECUENCIA_C4, escribiendoH3 } from "../../../../contabilidad/c4/t71h3_c4.js";
import { pesosC4 } from "../../../../contabilidad/c4/t71Comun.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 3 · ¿CUÁNTO VALE LO QUE SOBRÓ? en el patrón de enganche C4
 * («Toda decisión se pinta», D4 + D9; Watari, sección t71-h3), sobre el motor
 * de la célula (decisionC4.jsx). Reemplaza en la vista a
 * CuantoValeLoQueSobro.jsx, con el mismo id.
 *
 * Objeto propio: la bodega por capas. La cifra que se escribe cambia la
 * bodega con cada número: qué 10 cajas quedan, a qué precio, y si con ese
 * método podían quedar. En el ítem 5 se toca el método y salen las tres
 * barras. Un intento por ítem; si falló, «Iba aquí» con la cifra o el método.
 *
 * De Near, tal cual: objetivo, consigna, entrada, ficha, pie, el encabezado
 * de cada método, preguntas, aciertos, la línea de cada distractor y el
 * resumen del cierre. Puntaje: aciertos / 5 × 100.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS_H3 = `
.t71-estante { display: grid; gap: 4px; }
.t71-estante > div { display: flex; flex-wrap: wrap; gap: 4px; }
.t71-est-rot { font-size: 12px; color: var(--atenuado); }
.t71-caja { width: 28px; height: 22px; border-radius: 4px; background: var(--neutro); display: grid; place-items: center; font: 600 12px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #1D3557; }
.t71-caja.inicio { background: #8FA3BC; }
.t71-caja.prom { background: #A7B6C9; }
.t71-caja.queda { width: auto; padding: 0 6px; outline: 2px solid var(--texto); outline-offset: 1px; }
.t71-caja.queda.t71-malo { outline-color: var(--coral); }
.t71-suelta { justify-self: start; padding: 6px 8px; border-radius: 6px; border: 2px solid var(--neutro); }
.t71-suelta.t71-malo { border-color: var(--coral); }
.t71-barras { display: grid; gap: 6px; }
.t71-b3 { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 8px; align-items: center; font-size: 13px; padding: 4px 6px; border-radius: 6px; }
.t71-b3 i { grid-column: 1 / -1; grid-row: 2; height: 12px; border-radius: 3px; background: var(--neutro); transform-origin: left; }
.t71-b3.activa { outline: 2px solid var(--neutro); }
.t71-b3.activa.t71-malo { outline-color: var(--coral); }
`;

const Bloques = ({ capa, n }) => Array.from({ length: n }, (_, i) => <span key={i} className={`t71-caja ${capa}`} aria-hidden="true" />);

function FiguraH3({ estado, ctx }) {
  const v = ctx.vista;
  const malo = v.veredicto && !v.ok ? " t71-malo mal" : "";
  if (estado.forma === "barras") {
    return (
      <section className="t71-obj" data-bodega="barras" aria-label={CONSECUENCIA_C4.objeto}>
        <p className="t71-tit">{estado.titulo}</p>
        <div className="t71-barras">
          {estado.barras.map((b) => (
            <div key={b.id} data-barra={b.id} className={`t71-b3${estado.eleccion === b.id ? ` activa${malo}` : ""}`}>
              <span>{b.nombre}</span>
              <b className="t71-num">{b.valor == null ? "$?" : pesosC4(b.valor)}</b>
              <i className={b.valor == null ? "" : "c4-mov"} style={{ transform: `scaleX(${b.escala})` }} />
            </div>
          ))}
        </div>
        <Cuadra estado={estado} vista={v} />
      </section>
    );
  }
  if (estado.forma === "promedio") {
    return (
      <section className="t71-obj" data-bodega="promedio" aria-label={CONSECUENCIA_C4.objeto}>
        <p className="t71-tit">{estado.titulo}</p>
        <div className="t71-estante"><div><Bloques capa="prom" n={estado.cajas} /></div></div>
        <p className={`t71-linea${estado.escrito == null ? "" : " c4-mov"}`} data-linea-promedio>{estado.linea}</p>
        <p className="t71-linea">{estado.costaron}</p>
        <Cuadra estado={estado} vista={v} />
      </section>
    );
  }
  const q = estado.queda;
  return (
    <section className="t71-obj" data-bodega="capas" aria-label={CONSECUENCIA_C4.objeto}>
      <p className="t71-tit">{estado.titulo}</p>
      <p className="t71-linea">{estado.orden}</p>
      {estado.estantes.map((e) => {
        const aqui = q?.capa === e.id;
        return (
          <div key={e.id} className="t71-estante" data-estante={e.id}>
            <span className="t71-est-rot">{e.rotulo} · {pesosC4(e.precio)}</span>
            <div>
              <Bloques capa={e.id} n={e.bloques - (aqui ? 1 : 0)} />
              {aqui && <span className={`t71-caja ${e.id} queda c4-mov${q.mal && v.veredicto ? " t71-malo mal" : ""}`} data-queda>10</span>}
            </div>
          </div>
        );
      })}
      {q && <p className={`t71-linea${q.capa || q.neutro ? "" : ` t71-suelta c4-mov${v.veredicto ? " t71-malo mal" : ""}`}`} data-linea-queda>{q.linea}</p>}
      <Cuadra estado={estado} vista={v} />
    </section>
  );
}

/* Cifra (Mello C4-1): mientras se escribe, la figura muestra la cifra en su lugar, sin calificarla; la consecuencia, solo tras «Comprobar». */
const Figura = (p) => {
  const escribiendo = p.item.tipo === "cifra" && p.vista.valor == null && p.vista.borrador != null;
  return <><style>{CSS_T71C4}{CSS_H3}</style><FiguraH3 {...p} estado={escribiendo ? escribiendoH3(p.item, p.vista.borrador) : p.estado} /></>;
};

/* Para la prueba C5 de consecuencia-c (la figura con la cifra escrita sin comprobar). */
export const PIEZA_C4 = { ...CONSECUENCIA_C4, Figura };

export default function CuantoValeLoQueSobroC4({ Marco, rotulo, titulo, acento, onCompletar, onComoSeJuega = null, items = null }) {
  const M = useMemo(() => marcoConCaso(Marco, { entrada: H3.entrada, ficha: FICHA_H3 }), [Marco]);
  const pieza = {
    ...CONSECUENCIA_C4,
    items: items ?? CONSECUENCIA_C4.items,
    id: H3.id,
    titulo: titulo ?? H3.nombre,
    objetivo: H3.objetivo ?? null,
    consigna: H3.consigna,
    pie: H3.pie,
    Figura,
    resumen: resumenH3,
  };
  return <DecisionC4 pieza={pieza} Marco={M} rotulo={rotulo} acento={acento} onCompletar={onCompletar} onComoSeJuega={onComoSeJuega} />;
}
