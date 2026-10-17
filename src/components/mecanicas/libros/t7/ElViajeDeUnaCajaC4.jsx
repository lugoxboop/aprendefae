import { useMemo, useState } from "react";
import DecisionC4 from "./decisionC4.jsx";
import { Panel } from "../../salaDeControl/marco.jsx";
import { CSS_T71C4, Cuadra } from "./c4T71.jsx";
import { A7_ID, BOTON, PIEZA_CONTROL_INTERNO } from "../../../../data/contabilidadT7_1_a7.js";
import { CONSECUENCIA_C4, PORTADA_A7, LECTURA_A7, RESUMEN_A7 } from "../../../../contabilidad/c4/t71a7_c4.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A7 DE APRENDER — «El viaje de una caja» en el patrón de enganche C4
 * («Toda decisión se pinta», D4; Watari, sección t71-a7), sobre el motor de
 * la célula (decisionC4.jsx). Reemplaza en la vista a la de la v6, con el
 * mismo id y en la misma posición.
 *
 * Los textos son los de Near en main (contabilidadT7_1_a7.js): la portada,
 * «Por qué cuidarlo», las dos preguntas (con su lista y sus glosas), las
 * devoluciones, las pistas, los aciertos y el resumen. Near los está
 * recortando: la prueba los lleva en PENDIENTES_NEAR.
 *
 * Objeto propio (D9): el camino de la caja. Al tocar, el control se pone
 * donde dice la opción y la caja sigue hasta ahí; el veredicto, 380 ms
 * después, con la escalera C2 del motor (pista; luego devolución y la
 * correcta en blanco).
 *
 * El resumen de Near va al final, en su propio panel: aparece cuando el botón
 * de la última pregunta lleva el foco ahí (el motor busca el siguiente
 * [data-pieza]). El botón dice «Seguir» (BOTON de Near), no «Siguiente pieza»:
 * A7 es la última pieza de T7-1.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * `pantallas`: las de Near (las lee la medida del canon de enganche,
 * canon-enganche.test.mjs); cada opción lleva además su `t`, el nombre del
 * motor. La pieza pinta solo las pantallas que trae (el canon la monta desde
 * cada una).
 */
export const PIEZA_A7_C4 = {
  id: A7_ID, numero: 7, titulo: "El viaje de una caja",
  pantallas: PIEZA_CONTROL_INTERNO.pantallas.map((p) => (p.opciones ? { ...p, opciones: p.opciones.map((o) => ({ ...o, t: o.texto })) } : p)),
};

const CSS_A7 = `
.t71-a7-intro { display: grid; gap: 6px; margin: 0 0 14px; }
.t71-a7-intro p { margin: 0; font-size: 15px; line-height: 1.5; }
.t71-a7-pie { font-size: 12px !important; color: #A8B6C8; }
.t71-a7-objetivo { font-weight: 600; }
.t71-bloque { display: block; }
.t71-bloque + .t71-bloque { margin-top: 6px; }
.t71-item-lista { display: block; padding-left: 14px; position: relative; }
.t71-item-lista::before { content: "·"; position: absolute; left: 3px; font-weight: 700; }
.t71-camino { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
.t71-paso { display: grid; grid-template-columns: minmax(0, 7.2em) minmax(0, 1fr); gap: 2px 8px; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(248,249,250,.12); font-size: 13px; line-height: 1.35; overflow-wrap: anywhere; }
.t71-paso-rot { font-weight: 600; color: var(--atenuado); }
.t71-paso.control { border: 2px solid var(--texto); padding: 7px 9px; }
.t71-control { grid-column: 2; justify-self: start; font: 600 12px/1.2 "Inter", sans-serif; padding: 3px 8px; border-radius: 999px; border: 1px solid var(--neutro); }
.t71-a7-resumen { display: grid; gap: 6px; outline: none; }
.t71-a7-resumen p { margin: 0; font-size: 15px; line-height: 1.5; }
`;

/* El texto de cada pregunta, con la forma de Near: párrafos, la lista del libro y las glosas, cada uno en su renglón. */
function TextoA7({ item }) {
  return (
    <>
      {item.parrafos.map((t) => <span key={t} className="t71-bloque">{t}</span>)}
      {item.lista && <span className="t71-bloque" data-lista>{item.lista.map((t) => <span key={t} className="t71-item-lista">{t}</span>)}</span>}
      {item.despues?.map((t) => <span key={t} className="t71-bloque">{t}</span>)}
    </>
  );
}

function FiguraA7({ estado, vista }) {
  const mal = vista.veredicto && !vista.ok;
  return (
    <section className="t71-obj" data-camino aria-label={CONSECUENCIA_C4.objeto}>
      <p className="t71-tit">{estado.titulo}</p>
      <ol className="t71-camino">
        {estado.pasos.map((p) => (
          <li key={p.id} data-paso={p.id} data-control={p.control ? "si" : undefined}
            className={`t71-paso${p.control ? ` control c4-mov${mal ? " t71-mal mal" : ""}` : ""}`}>
            <span className="t71-paso-rot">{p.rotulo}</span>
            <span>{p.texto}</span>
            {p.control && <span className="t71-control">{p.control}</span>}
          </li>
        ))}
      </ol>
      <Cuadra estado={estado} vista={vista} />
    </section>
  );
}

const PIEZA = {
  ...CONSECUENCIA_C4,
  id: A7_ID,
  titulo: PIEZA_A7_C4.titulo,
  Figura: FiguraA7,
  interfaz: { siguientePieza: BOTON.seguir },
};

function Resumen() {
  return (
    <div className="t71-a7-resumen" data-resumen-a7>
      <style>{CSS_A7}</style>
      {RESUMEN_A7.parrafos.map((t) => <p key={t}>{t}</p>)}
      <p>{RESUMEN_A7.siguiente}</p>
      <p className="t71-a7-pie">{RESUMEN_A7.pie}</p>
    </div>
  );
}

/* La portada y «Por qué cuidarlo» arriba; el resumen, en el panel de abajo. */
function marcoA7(Marco, ids) {
  return function MarcoA7({ rotulo, titulo, acento, children }) {
    const [fin, setFin] = useState(false);
    return (
      <>
        <div>
          <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
            <style>{CSS_T71C4}{CSS_A7}</style>
            {ids.has(PORTADA_A7.id) && <div className="t71-a7-intro" data-portada>
              <p className="t71-a7-objetivo" data-objetivo-a7>{PORTADA_A7.objetivo}</p>
              <p className="t71-a7-pie">{PORTADA_A7.pie}</p>
            </div>}
            {ids.has(LECTURA_A7.id) && <div className="t71-a7-intro" data-lectura>
              {LECTURA_A7.parrafos.map((t) => <p key={t}>{t}</p>)}
              <p className="t71-a7-pie">{LECTURA_A7.pie}</p>
            </div>}
            {children}
          </Marco>
        </div>
        <div style={{ marginTop: fin ? "16px" : 0 }}>
          <div data-pieza={`${A7_ID}-resumen`} tabIndex={-1} className="t71-a7-resumen" onFocus={() => setFin(true)}>
            {fin && (
              <Marco><Resumen /></Marco>
            )}
          </div>
        </div>
      </>
    );
  };
}

export default function ElViajeDeUnaCajaC4({ pieza: datos = PIEZA_A7_C4, rotulo, Marco = Panel, acento, items = null }) {
  const ids = useMemo(() => new Set(datos.pantallas.map((p) => p.id)), [datos]);
  const M = useMemo(() => marcoA7(Marco, ids), [Marco, ids]);
  const pieza = useMemo(() => {
    const propios = items ?? CONSECUENCIA_C4.items.filter((I) => ids.has(I.id));
    return { ...PIEZA, items: propios.map((I) => ({ ...I, texto: <TextoA7 item={I} /> })) };
  }, [items, ids]);
  /* Montada desde el resumen (solo el canon lo hace): el resumen solo. */
  if (!pieza.items.length) return <Marco rotulo={rotulo} titulo={datos.titulo} acento={acento}><Resumen /></Marco>;
  return <DecisionC4 pieza={pieza} Marco={M} rotulo={rotulo} acento={acento} />;
}
