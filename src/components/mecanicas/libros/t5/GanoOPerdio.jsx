import { FAE } from "../../../../theme.js";
import { N5, BOTON_N5, FIGURA_N5, RESULTADOS_N5, resumenN5 } from "../../../../data/contabilidadT5_n5.js";
import { prepararN5, evaluarN5, respuestaN5, idLineaN5, puntuarN5, TOTAL_N5 } from "../../../../contabilidad/t5N5.js";
import { AsientoEnLineas } from "../piezas.jsx";
import PreguntasConAsientoT5 from "./PreguntasConAsientoT5.jsx";
import { CONSECUENCIA_C4 } from "../../../../contabilidad/c4/t5N5_c4.js";
import { NotaC4 } from "./figurasC4T5.jsx";
import { pesos } from "../../../../data/contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N5 · ¿GANÓ O PERDIÓ? (Célula C) · versión 2
 *
 * Tres casillas de cifra (dos de ellas con Ganó o Perdió al lado) y los dos
 * asientos con «Arma la línea», todo con la escalera (C2) y «Vale el primer
 * intento», en PreguntasConAsientoT5.jsx. Arriba, la figura que crece
 * (C8): «La inversión de Acacia». Los textos y las cifras, en
 * data/contabilidadT5_n5.js; la lógica, en contabilidad/t5N5.js.
 *
 * PATRÓN C4 (D9, contabilidad/c4/t5N5_c4.js): bajo la figura, el objeto
 * propio, las 900 acciones de Acacia. La cifra que se escribe (y Ganó o
 * Perdió) cambian la barra en el acto; el veredicto, 380 ms después, con la
 * escalera de siempre (PreguntasConAsientoT5 con `c4`).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las 900 acciones de Acacia. PROVISIONAL PARA WATARI (su forma de .c4-bloque). */
export function AccionesN5({ estado, vista }) {
  const mal = vista.veredicto && Boolean(estado.falla) && estado.valor != null && !estado.fila;
  return (
    <section className={`t5c4${vista.anim ? " t5c4-anim" : ""}`} data-figura data-acciones-n5 aria-live="polite" style={{ margin: "0 0 14px" }}>
      <p className="t5c4-tit" data-titulo-acciones>{estado.titulo}</p>
      <div className="t5c4-bloque" aria-hidden="true">
        {estado.acciones != null && <i data-barra={estado.acciones} className={`t5c4-crece${mal ? " mal" : ""}`} style={{ width: `${(estado.acciones / estado.total) * 100}%` }} />}
      </div>
      <p className="t5c4-linea" data-linea-acciones>
        {estado.linea}
        {/* [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: lo elegido y escrito junto a «Las 550» (con «Ganó» y «Perdió» de Near). */}
        {estado.eleccion && <> · <b className="t5c4-num t5c4-mov" data-eleccion-n5>{estado.eleccion}</b></>}
        {/* C4-1: mientras se escribe, la cifra solo se muestra (con Ganó o Perdió tal como se eligió). */}
        {!estado.eleccion && vista.borrador != null && <> · <b className="t5c4-num" data-borrador>{[RESULTADOS_N5.find((x) => x.valor === vista.resultado)?.texto, pesos(vista.borrador)].filter(Boolean).join(" ")}</b></>}
      </p>
      {estado.fila && vista.cerrado && <p className="t5c4-linea" data-fila-acciones>{estado.fila}</p>}
      <NotaC4 estado={estado} vista={vista} />
    </section>
  );
}


/*
 * LA FIGURA, PROVISIONAL PARA WATARI: una versión funcional y sobria, con el
 * estilo de la ficha de datos de los Hacer de la célula (hacerT7.jsx) y el
 * asiento con sus sumas de piezas.jsx, mientras Watari entrega su forma.
 *
 * Una fila sale cuando se cierra su ítem (acierto o segundo error), nunca
 * antes (E8). La fila del asiento 1 va plegada, sin sus líneas, mientras se
 * arma el asiento 2, y se despliega al cerrarlo (N5-1 de Mello).
 */
/* Para la prueba C5 (consecuencia-c): el objeto C4 con la forma del motor. */
export const PIEZA_C4 = { ...CONSECUENCIA_C4, Figura: AccionesN5 };

export function FiguraN5({ items, i, listo, c4 = null }) {
  const actual = items[i]?.id ?? null;
  const cerrados = new Set([...items.slice(0, i).map((x) => x.id), ...(listo && actual ? [actual] : [])]);
  const filas = FIGURA_N5.filas.filter((f) => f.tras === null || cerrados.has(f.tras));
  return (
    <section data-figura-n5 aria-label={FIGURA_N5.titulo} style={{
      margin: "0 0 14px", padding: "10px 12px", borderRadius: "11px", border: "1px solid rgba(248,249,250,0.12)",
      background: "rgba(10,20,34,0.35)",
    }}>
      <p data-titulo-figura style={{ margin: "0 0 8px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, color: "#A8B6C8" }}>{FIGURA_N5.titulo}</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", rowGap: "6px" }}>
        {filas.map((f) => {
          if (f.asiento) {
            const plegada = f.plegadaDurante === actual && !listo;
            const it = items.find((x) => x.id === f.asiento);
            return (
              <li key={f.id} data-fila={f.id} data-plegada={plegada ? "" : undefined} className="fae-t7h-entra">
                {plegada ? (
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: "20px", color: FAE.text }}>{f.plegada}</span>
                ) : (
                  <AsientoEnLineas lineas={it.lineas.map((l) => ({ cuenta: l.cuenta, lado: l.lado, valor: l.valor }))} totales />
                )}
              </li>
            );
          }
          return (
            <li key={f.id} data-fila={f.id} className="fae-t7h-entra" style={{
              fontFamily: "Inter, sans-serif", fontSize: "14px", lineHeight: "20px", color: FAE.text, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere",
            }}>
              {f.texto}
            </li>
          );
        })}
      </ul>
      {c4?.estado && <div style={{ marginTop: "10px" }}><AccionesN5 estado={c4.estado} vista={c4.vista} /></div>}
    </section>
  );
}

export const CONFIG_N5 = {
  datos: N5, botones: BOTON_N5, preparar: prepararN5, evaluar: evaluarN5, idLinea: idLineaN5,
  puntuar: puntuarN5, total: TOTAL_N5, resumen: resumenN5, marca: "t5-n5",
  escalera: true, resultados: RESULTADOS_N5, respuesta: respuestaN5, Figura: FiguraN5,
  c4: CONSECUENCIA_C4,
};

export default function GanoOPerdio(props) {
  return <PreguntasConAsientoT5 config={CONFIG_N5} {...props} />;
}
