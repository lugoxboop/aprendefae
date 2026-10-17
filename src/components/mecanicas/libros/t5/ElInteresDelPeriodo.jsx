import { N4, BOTON_N4, resumenN4 } from "../../../../data/contabilidadT5_n4.js";
import { prepararN4, evaluarN4, idLineaN4, puntuarN4, TOTAL_N4 } from "../../../../contabilidad/t5N4.js";
import PreguntasConAsientoT5 from "./PreguntasConAsientoT5.jsx";
import FiguraAcumulada from "../t7/FiguraAcumulada.jsx";
import { FIGURA_T5_N4, cerradosDe } from "../../../../contabilidad/figuraAcumulada.js";
import { CONSECUENCIA_C4, TEXTOS_N4_C4 } from "../../../../contabilidad/c4/t5N4_c4.js";
import { pesos } from "../../../../data/contabilidad.js";
import { NotaC4 } from "./figurasC4T5.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N4 · EL INTERÉS DEL PERIODO (Célula C)
 *
 * Dos elecciones, dos casillas de cifra y el asiento del cobro, con «Arma la
 * línea» (lote 3), en PreguntasConAsientoT5.jsx. Los
 * textos y las cifras, en data/contabilidadT5_n4.js; la lógica, en
 * contabilidad/t5N4.js.
 *
 * Arriba, la figura acumulada (lote 5 de L, t7/FiguraAcumulada.jsx): la
 * cuenta de intereses crece trimestre a trimestre, cada parte al cerrarse su
 * ítem.
 *
 * PATRÓN C4 (D9, contabilidad/c4/t5N4_c4.js): debajo, el objeto propio, los
 * cobros del año de Caoba. La frecuencia o la base tocadas, o la cifra que se
 * escribe, cambian en el acto los cupones de los doce meses; el veredicto,
 * 380 ms después (PreguntasConAsientoT5 con `c4`).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Los cobros del año. PROVISIONAL PARA WATARI (su forma de .c4-meses). */
export function CobrosN4({ estado, vista }) {
  const mov = vista.anim ? " t5c4-anim" : "";
  return (
    <section className={`t5c4${mov}`} data-figura data-cobros-n4 aria-live="polite" style={{ margin: "0 0 14px" }}>
      <p className="t5c4-tit" data-titulo-cobros>{estado.titulo}</p>
      <div className="t5c4-meses" aria-hidden="true">
        {Array.from({ length: 12 }, (_, m) => {
          const toca = estado.cupon != null && (m + 1) % estado.cada === 0;
          return <span key={m} className="t5c4-mes" data-mes={m + 1}>{toca && <i data-cupon className="t5c4-crece" style={{ height: `${Math.round(estado.alto * 100)}%` }} />}</span>;
        })}
      </div>
      <p className="t5c4-linea" data-linea-cobros>
        {estado.cupon != null ? <>{TEXTOS_N4_C4.cadaCobro} <b className="t5c4-num t5c4-mov">{pesos(estado.cupon)}</b></>
          : vista.borrador != null ? <>{TEXTOS_N4_C4.cadaCobro} <b className="t5c4-num" data-borrador>{pesos(vista.borrador)}</b></>
            : TEXTOS_N4_C4.sinCobros}
      </p>
      <NotaC4 estado={estado} vista={vista} />
    </section>
  );
}

/* Para la prueba C5 (consecuencia-c): el objeto C4 con la forma del motor. */
export const PIEZA_C4 = { ...CONSECUENCIA_C4, Figura: CobrosN4 };

export function FiguraN4({ i, listo, c4 = null }) {
  return (
    <>
      <FiguraAcumulada figura={FIGURA_T5_N4} cerrados={cerradosDe(i, listo)} listo={listo} />
      {c4?.estado && <CobrosN4 estado={c4.estado} vista={c4.vista} />}
    </>
  );
}

export const CONFIG_N4 = {
  datos: N4, botones: BOTON_N4, preparar: prepararN4, evaluar: evaluarN4, idLinea: idLineaN4,
  puntuar: puntuarN4, total: TOTAL_N4, resumen: resumenN4, marca: "t5-n4", Figura: FiguraN4,
  c4: CONSECUENCIA_C4,
};

export default function ElInteresDelPeriodo(props) {
  return <PreguntasConAsientoT5 config={CONFIG_N4} {...props} />;
}
