import { useMemo } from "react";
import DecisionC4 from "./decisionC4.jsx";
import { CSS_T71C4, Cuadra, marcoConCaso } from "./c4T71.jsx";
import { Pastilla, REVELADA } from "../b5/Devolucion.jsx";
import { H5, FICHA_H5, resumenH5 } from "../../../../data/contabilidadT7_1_h5.js";
import { CONSECUENCIA_C4, W_H5, escribiendoH5 } from "../../../../contabilidad/c4/t71h5_c4.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · HACER 5 · ¿COSTO O GASTO? en el patrón de enganche C4 («Toda decisión
 * se pinta», D4 + D9; Watari, sección t71-h5), sobre el motor de la célula
 * (decisionC4.jsx). Reemplaza en la vista a CostoOGasto.jsx, con el mismo id.
 *
 * Objeto propio: la etiqueta del costo de El Faro. Al tocar, el gasto entra a
 * la etiqueta del costo o a la bandeja de gastos (y el flete, a su cuenta);
 * los ya resueltos se quedan. Las cifras parten el flete en retención y pago
 * con cada número, y la última se compara con la factura. Un intento por
 * ítem; si falló, «Iba aquí» en el sitio o la cifra correcta.
 *
 * De Near, tal cual: objetivo, consigna, caso, ficha, pie, preguntas, el par
 * fijo, aciertos, errores, porqués, la línea de cada distractor y el
 * resumen. Puntaje: aciertos / 8 × 100.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CSS_H5 = `
.t71-dos { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
.t71-etq, .t71-gas, .t71-inv { display: grid; gap: 6px; align-content: start; padding: 8px; border-radius: 8px 16px 16px 8px; border: 1px solid rgba(248,249,250,.35); min-height: 96px; min-width: 0; }
.t71-gas { border-radius: 8px; border-style: dashed; }
.t71-inv { border-radius: 8px; }
.t71-etq ul, .t71-gas ul, .t71-inv ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 4px; font-size: 12px; line-height: 1.3; }
.t71-etq li, .t71-gas li, .t71-inv li { padding: 4px 6px; border-radius: 6px; background: rgba(184,196,212,.12); overflow-wrap: anywhere; }
li.t71-ficha { border: 2px solid var(--neutro); }
li.t71-ficha.t71-malo { border-color: var(--coral); }
li.t71-ficha.bien { border-color: var(--texto); }
li.t71-ficha.iba { border: 2px dashed var(--texto); display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
.t71-parte { height: 14px; border-radius: 4px; background: var(--neutro); overflow: hidden; }
.t71-parte i { display: block; height: 100%; background: #1D3557; transform-origin: left; outline: 1px solid var(--texto); }
`;

function Bandeja({ clase, titulo, id, estado, vista }) {
  const f = estado.ficha;
  const marca = !vista.veredicto ? "" : vista.ok ? " bien" : " t71-malo mal";
  return (
    <div className={clase} data-bandeja={id}>
      <p className="t71-tit">{titulo}</p>
      <ul>
        {estado.previos.filter((p) => p.destino === id).map((p) => <li key={p.id} data-previo={p.id}>{p.rotulo}</li>)}
        {f?.destino === id && <li className={`t71-ficha c4-mov${marca}`} data-ficha-c4>{f.rotulo}</li>}
        {vista.veredicto && vista.fallado && estado.correcto === id && (
          <li className="t71-ficha iba" data-ficha-iba>{estado.rotuloCorrecto} <Pastilla marca={REVELADA} /></li>
        )}
      </ul>
    </div>
  );
}

function FiguraH5({ estado, ctx }) {
  const v = ctx.vista;
  if (estado.forma === "etiqueta") {
    return (
      <section className="t71-obj" data-etiqueta aria-label={CONSECUENCIA_C4.objeto}>
        <div className="t71-dos">
          <Bandeja clase="t71-etq" titulo={W_H5.costo} id="costo" estado={estado} vista={v} />
          <Bandeja clase="t71-gas" titulo={W_H5.gasto} id="gasto" estado={estado} vista={v} />
          {estado.conInventario && <Bandeja clase="t71-inv" titulo={W_H5.inventario} id="inventario" estado={estado} vista={v} />}
        </div>
        <Cuadra estado={estado} vista={v} />
      </section>
    );
  }
  if (estado.forma === "partido") {
    return (
      <section className="t71-obj" data-flete-partido aria-label={CONSECUENCIA_C4.objeto}>
        <p className="t71-tit">{estado.titulo}</p>
        <div className="t71-parte" aria-hidden="true"><i className={estado.escrito == null ? "" : "c4-mov"} style={{ transform: `scaleX(${estado.escala})` }} /></div>
        <p className="t71-linea" data-retencion>{estado.retencion}</p>
        <p className="t71-linea" data-pago>{estado.pago}</p>
        <Cuadra estado={estado} vista={v} />
      </section>
    );
  }
  return (
    <section className="t71-obj" data-deuda aria-label={CONSECUENCIA_C4.objeto}>
      <p className="t71-tit">{estado.titulo}</p>
      <p className="t71-linea">{estado.cuenta}</p>
      <p className={`t71-linea${estado.escrito == null ? "" : " c4-mov"}`} data-tuya>{estado.tuya}</p>
      <Cuadra estado={estado} vista={v} />
    </section>
  );
}

/* Cifra (Mello C4-1): mientras se escribe, la figura muestra la cifra en su lugar, sin calificarla; la consecuencia, solo tras «Comprobar». */
const Figura = (p) => {
  const escribiendo = p.item.tipo === "cifra" && p.vista.valor == null && p.vista.borrador != null;
  return <><style>{CSS_T71C4}{CSS_H5}</style><FiguraH5 {...p} estado={escribiendo ? escribiendoH5(p.item, p.vista.borrador) : p.estado} /></>;
};

/* Para la prueba C5 de consecuencia-c (la figura con la cifra escrita sin comprobar). */
export const PIEZA_C4 = { ...CONSECUENCIA_C4, Figura };

export default function CostoOGastoC4({ Marco, rotulo, titulo, acento, onCompletar, onComoSeJuega = null, items = null }) {
  const M = useMemo(() => marcoConCaso(Marco, { parrafos: H5.caso, ficha: FICHA_H5 }), [Marco]);
  const pieza = {
    ...CONSECUENCIA_C4,
    items: items ?? CONSECUENCIA_C4.items,
    id: H5.id,
    titulo: titulo ?? H5.nombre,
    objetivo: H5.objetivo ?? null,
    consigna: H5.consigna,
    pie: H5.pie,
    Figura,
    resumen: resumenH5,
  };
  return <DecisionC4 pieza={pieza} Marco={M} rotulo={rotulo} acento={acento} onCompletar={onCompletar} onComoSeJuega={onComoSeJuega} />;
}
