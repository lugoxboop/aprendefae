import { useState } from "react";
import { N1, resumenN1 } from "../../../../data/contabilidadT5_n1.js";
import { prepararN1 } from "../../../../contabilidad/t5N1.js";
import { CONSECUENCIA_C4, FIGURA_N1_C4, itemC4DeN1, rotuloDeN1 } from "../../../../contabilidad/c4/t5N1_c4.js";
import DecisionC4, { OpcionC4 } from "../t7/decisionC4.jsx";
import { Parrafos } from "../t7/hacerT7.jsx";
import { CSS_T5C4 } from "./figurasC4T5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N1 · ¿TEMPORAL O A LARGO PLAZO? (Célula C) · patrón C4.
 *
 * Nueve ítems de un solo toque con el motor C4 (t7/decisionC4.jsx): al tocar,
 * el caso cae en su cajón del balance de la empresa (o de la clase de título,
 * o de lo que respalda la intención); el veredicto llega 380 ms después. Un
 * intento; la correcta con «Iba aquí». La consecuencia, pura, en
 * contabilidad/c4/t5N1_c4.js; los textos, en data/contabilidadT5_n1.js (los
 * de Near, tal cual); el orden, como en main (prepararN1: solo el bloque 3 se
 * baraja, una vez por partida).
 *
 * B2: hay pantallas de más de 60 palabras. Son textos de Near, que él está
 * recortando; la prueba las lleva en PENDIENTES_NEAR.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* El objeto: los cajones son las opciones. PROVISIONAL PARA WATARI (su forma de .c4-zonas). */
export function FiguraN1({ estado, item, ctx }) {
  return (
    <section className="t5c4" data-objeto-n1={estado.marco}>
      <p className="t5c4-tit">{FIGURA_N1_C4[estado.marco]}</p>
      <div className="t5c4-zonas" role="group" aria-label={FIGURA_N1_C4[estado.marco]}>
        {item.opciones.map((o) => {
          const rot = rotuloDeN1(item, o.t);
          return (
            <OpcionC4 key={o.id} ctx={ctx} opcion={o} className="t5c4-cajon">
              <span className="t5c4-cuerpo">
                {rot && <span className="t5c4-rot" data-rotulo>{rot}</span>}
                <span data-texto-opcion>{o.t}</span>
                {estado.cajon === o.id && <span className="t5c4-chip c4-mov" data-chip>{FIGURA_N1_C4.chip}</span>}
              </span>
            </OpcionC4>
          );
        })}
      </div>
    </section>
  );
}

/* Entre el contador y el ítem: el resto del enunciado (siempre) y la pantalla del bloque 2. */
function AntesN1({ item }) {
  const [, ...resto] = N1.enunciado;
  return (
    <div data-antes-n1>
      {/* El estilo de la figura va aquí, fuera de ella. */}
      <style>{CSS_T5C4}</style>
      {resto.length > 0 && <Parrafos textos={resto} />}
      {item.intro && <Parrafos textos={[item.intro]} dato="intro" />}
    </div>
  );
}

export const piezaN1 = (preparados) => ({
  ...CONSECUENCIA_C4,
  items: preparados.map((it) => itemC4DeN1(it, it.opciones.map((o) => o.valor))),
  titulo: N1.nombre, enFigura: true, objetivo: N1.objetivo ?? null, consigna: N1.enunciado[0],
  Figura: FiguraN1, Antes: AntesN1, resumen: resumenN1,
});

/* `items`: los ítems ya preparados (prepararN1), para fijar el orden en las pruebas. */
export default function TemporalOLargoPlazo({ Marco, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  const [pieza] = useState(() => piezaN1(items ?? prepararN1()));
  return <DecisionC4 pieza={{ ...pieza, titulo: titulo ?? pieza.titulo }} Marco={Marco} rotulo={rotulo} acento={acento} onCompletar={onCompletar} onComoSeJuega={onComoSeJuega} />;
}
