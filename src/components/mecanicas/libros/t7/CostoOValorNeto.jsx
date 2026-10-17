import { useMemo, useState } from "react";
import { barajar } from "../../../../utils/barajar.js";
import { H7, CASOS_H7, FIGURAS_H7, ITEMS_H7, fichaH7, resumenH7 } from "../../../../data/contabilidadT7_3_h7.js";
import { prepararH7 } from "../../../../contabilidad/t7_3H7.js";
import { CONSECUENCIA_C4, itemsH7, W_H7 } from "../../../../contabilidad/c4/t73h7_c4.js";
import DecisionC4 from "./decisionC4.jsx";
import { Panel } from "../../salaDeControl/marco.jsx";
import { Ficha } from "./hacerT7.jsx";
import { FranjaNIC2, FigurasHacer, CSS_T73_PATRON } from "./PatronT7_3.jsx";
import { CSS_T73C4, Cuadra, Regla } from "./T73C4Comun.jsx";
import { pesos } from "../../../../contabilidad/c4/t73.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · HACER 7 · ¿COSTO O VALOR NETO REALIZABLE? (Célula C) · PATRÓN C4.
 *
 * Arriba, siempre a la vista, la frase fija de la NIC 2; luego el encabezado
 * del motor C4 (t7/decisionC4.jsx) con el objetivo y la consigna. Un ítem a
 * la vez, en el orden de la tabla: el texto del caso; la figura (su objeto,
 * «la línea costo – VNR»): la ficha de la regla 10c, la línea con el precio,
 * el costo y, en la medida, el valor neto realizable, y la cifra tocada sobre
 * ella; debajo, las cuentas del Patrón T7-3, que aparecen después de su
 * ítem. Cifras barajadas en cada partida, como en main: UN SOLO TOQUE; la
 * buena se enseña («Iba aquí»). Al terminar: onCompletar(pct, ms, detalle),
 * con el primer (único) intento de cada ítem.
 *
 * La consecuencia de cada cifra es pura (src/contabilidad/c4/t73h7_c4.js).
 * FIGURA PROVISIONAL PARA WATARI (su prototipo, f73.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const ORDEN = ITEMS_H7.map((it) => it.id);

function FiguraH7({ estado, item, vista }) {
  const c = CASOS_H7[item.caso];
  const listo = vista.veredicto && (vista.resuelto || vista.fallado);
  return (
    <div className="t73c4" data-c4-estado={JSON.stringify(estado)}>
      <div data-caso={item.caso + 1}><Ficha filas={fichaH7(c)} /></div>
      <div className="t73c4-obj" data-c4-objeto="linea">
        <p className="t73c4-tit" data-encabezado-item>{c.encabezado} · {c.quien}</p>
        <Regla marcas={estado.marcas} desde={estado.desde} hasta={estado.hasta} valor={estado.valor} vista={vista} fmt={pesos} />
        <p className="t73c4-linea" data-gastos>{W_H7.vender(c.vender)}{c.terminar ? ` · ${W_H7.terminar(c.terminar)}` : ""}</p>
      </div>
      <Cuadra estado={estado} vista={vista} />
      <FigurasHacer figuras={FIGURAS_H7} respondidos={ORDEN.indexOf(item.id) + (listo ? 1 : 0)} listo={listo} />
    </div>
  );
}

export default function CostoOValorNeto({ Marco = Panel, rotulo, titulo, acento, onCompletar, items = null, onComoSeJuega = null }) {
  /* Las cifras, barajadas al montar (como en main); `items` las fija (pruebas). */
  const [base] = useState(() => items ?? prepararH7(barajar));
  const losItems = useMemo(() => itemsH7(base), [base]);
  /* La frase de la NIC 2 va primero, también en el cierre: el marco del motor la pone antes que todo. */
  const MarcoH7 = useMemo(() => function MarcoConFranja({ children, ...p }) {
    return (
      <Marco {...p}>
        <style>{CSS_T73_PATRON + CSS_T73C4}</style>
        <div data-t7-3-h7 className="t73pt-pieza">
          <FranjaNIC2 texto={H7.aviso} />
          {children}
        </div>
      </Marco>
    );
  }, [Marco]);
  const pieza = {
    ...CONSECUENCIA_C4, items: losItems, titulo, objetivo: H7.objetivo, consigna: H7.consigna, pie: H7.pie,
    resumen: resumenH7, Figura: FiguraH7, clase: "t73h7",
  };
  return <DecisionC4 pieza={pieza} Marco={MarcoH7} rotulo={rotulo} acento={acento} onCompletar={onCompletar} onComoSeJuega={onComoSeJuega} />;
}
