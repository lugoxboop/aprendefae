import { useId } from "react";
import { FIGURA, FIGURA_ALT, FIGURA_TEXTOS as TX } from "../../../../data/contabilidadT7_1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP1 · LA FIGURA «DOS COLUMNAS DEL PERIODO» (Watari, v3).
 *
 * Portada de la guía de Watari (`figura(k)` y las clases `.fg-*`), con sus
 * tokens y sus medidas. Para el lector de pantalla es una tabla: las cuentas
 * son encabezados de columna y los tres momentos, encabezados de fila. El
 * texto alternativo de Near va en un figcaption oculto, enlazado con
 * aria-describedby.
 *
 * Reglas que no se pierden:
 *   · nada punteado ni discontinuo
 *   · en los errores la compra nunca se dibuja dentro de Inventario
 *   · la segunda columna no cambia de lugar ni de ancho, tenga o no nombre
 *   · señalar es pasar de #A8B6C8 a #F8F9FA en 600; nada más cambia
 *   · fundido de 120 ms solo en lo que aparece en su pantalla, y ninguno con
 *     movimiento reducido
 *   · «DEBE» y el monto: con menos de 130 px de línea, el monto baja a la
 *     línea siguiente, a la derecha (container query)
 *
 * Las clases llevan el prefijo `t7fg-` para no tocar nada del sitio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Tokens del patrón tabular de la Célula C (Watari). */
const P = {
  texto: "#F8F9FA",
  texto2: "#A8B6C8",
  borde: "#B8C4D4",
  debe: "#2A9D8F",
};

export const CSS_FIGURA = `
.t7fg { margin: 0; display: grid; gap: 10px; min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; }
.t7fg-tabla { display: grid; gap: 12px; min-width: 0; grid-template-columns: minmax(0, 1fr); }
.t7fg-cab, .t7fg-fila { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; row-gap: 6px; align-items: start; }
.t7fg-col { font: 600 13px/1.3 "Sora", "Inter", sans-serif; padding-bottom: 6px; border-bottom: 1px solid ${P.borde}; overflow-wrap: anywhere; min-width: 0; }
.t7fg-col-vacia { border-bottom-color: transparent; }
.t7fg-mom { grid-column: 1 / -1; font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${P.texto2}; }
.t7fg-celda { display: grid; gap: 6px; align-content: start; min-width: 0; }
.t7fg-anot { border: 1px solid ${P.borde}; border-radius: 6px; padding: 8px 10px; font-size: 13px; line-height: 1.35; overflow-wrap: anywhere; min-width: 0; }
.t7fg-nota { margin: 0; font-size: 13px; line-height: 1.35; color: ${P.texto2}; overflow-wrap: anywhere; min-width: 0; padding: 8px 2px; }
.t7fg-mov { display: grid; gap: 4px; container: t7figmov / inline-size; }
.t7fg-fecha { font-size: 12px; color: ${P.texto2}; }
.t7fg-lin { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 4px 8px; }
.t7fg-lin .t7fg-monto { margin-left: auto; }
@container t7figmov (max-width: 129px) { .t7fg-lin { flex-direction: column; align-items: stretch; } .t7fg-lin .t7fg-monto { align-self: flex-end; } }
.t7fg-debe { font: 600 12px/1 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: ${P.debe}; flex: none; }
.t7fg-monto { font: 500 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t7fg .t7fg-foco, .t7fg .t7fg-foco .t7fg-fecha { color: ${P.texto}; font-weight: 600; }
.t7fg-mov.t7fg-foco .t7fg-monto { font-weight: 600; }
.t7fg-mov.t7fg-foco .t7fg-debe { color: ${P.debe}; }
.t7fg-factura { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; border: 1px solid ${P.borde}; border-radius: 8px; padding: 8px 12px; }
.t7fg-factura .t7fg-monto { font-weight: 600; }
.t7fg-nueva { animation: t7fg-aparece .12s ease-out; }
@keyframes t7fg-aparece { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .t7fg-nueva { animation: none; } }
.t7fg-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
`;

export default function FiguraDosColumnas({ estado }) {
  const s = FIGURA[estado];
  const idAlt = `t7fg-alt-${useId().replace(/:/g, "")}`;
  const foco = (x) => (s.foco.includes(x) ? " t7fg-foco" : "");
  const cab2 = s.col2 === "compras" ? TX.compras : s.col2 === "otra" ? TX.otraCuenta : "";
  const mom = (id, txt) => (
    <span className={`t7fg-mom${foco(`fila-${id}`)}`} role="rowheader" data-fg={`fila-${id}`}>{txt}</span>
  );

  return (
    <figure className="t7fg" data-figura={estado}>
      <style>{CSS_FIGURA}</style>
      {s.factura && (
        <div className="t7fg-factura" data-fg="factura">
          <span className="t7fg-fecha">{TX.fecha}</span>
          <span className="t7fg-monto">{TX.monto}</span>
        </div>
      )}
      <div className="t7fg-tabla" role="table" aria-describedby={idAlt}>
        <div className="t7fg-cab" role="row">
          <span className="t7fg-sr" role="columnheader">{TX.momento}</span>
          <span className="t7fg-col" role="columnheader" data-fg="col-inventario">{TX.inventario}</span>
          <span className={`t7fg-col${s.col2 ? "" : " t7fg-col-vacia"}`} role="columnheader" data-fg="col-2">{cab2}</span>
        </div>

        <div className="t7fg-fila" role="row">
          {mom("inicio", TX.inicio)}
          <div className="t7fg-celda" role="cell"><div className="t7fg-anot" data-fg="inv-inicio">{TX.valorInicio}</div></div>
          <div className="t7fg-celda" role="cell" />
        </div>

        {s.filas.includes("durante") && (
          <div className="t7fg-fila" role="row">
            {mom("durante", TX.durante)}
            <div className="t7fg-celda" role="cell">
              <p className={`t7fg-nota${foco("inv-durante")}`} data-fg="inv-durante">{TX.noSeMueve}</p>
            </div>
            <div className="t7fg-celda" role="cell" data-fg="col2-durante">
              {s.compra && (
                <div className={`t7fg-anot t7fg-mov${foco("compra")}${s.aparece === "compra" ? " t7fg-nueva" : ""}`} data-fg="compra">
                  <span className="t7fg-fecha">{TX.fecha}</span>
                  <span className="t7fg-lin">
                    <span className="t7fg-debe">{TX.debe}</span>
                    <span className="t7fg-monto">{TX.monto}</span>
                  </span>
                </div>
              )}
              {s.otras && <p className="t7fg-nota" data-fg="demas-compras">{TX.demasCompras}</p>}
            </div>
          </div>
        )}

        {s.filas.includes("cierre") && (
          <div className="t7fg-fila" role="row">
            {mom("cierre", TX.cierre)}
            <div className="t7fg-celda" role="cell">
              {s.conteo ? (
                <div className={`t7fg-anot${foco("conteo")}${s.aparece === "conteo" ? " t7fg-nueva" : ""}`} data-fg="conteo">{TX.conteoAlDia}</div>
              ) : (
                <p className={`t7fg-nota${foco("inv-cierre")}`} data-fg="inv-cierre">{TX.conteoPendiente}</p>
              )}
            </div>
            <div className="t7fg-celda" role="cell" />
          </div>
        )}
      </div>
      <figcaption className="t7fg-sr" id={idAlt} data-fg="alt">{FIGURA_ALT[estado]}</figcaption>
    </figure>
  );
}
