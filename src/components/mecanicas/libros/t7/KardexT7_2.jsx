import { cifraK } from "../../../../contabilidad/t7_2Kardex.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · EL KÁRDEX EN LECTURA (A3 y A4) — la guía «Kárdex de T7-2» de Watari.
 *
 * Una sola forma en todos los anchos: una franja por fecha y, dentro, los
 * bloques que tiene ese día (Entradas o Salidas, y siempre Saldos). Cada capa
 * es una fila de tres columnas, como el libro (p. 238): Cantidad · Costo
 * unitario · Costo total, a la derecha, Inter 500 de 15 px con dígitos
 * tabulares. El encabezado de columnas se queda arriba mientras se desplaza.
 *
 *   · sin «=» (corrección de Mello): las tres cifras van en columnas
 *   · un costo total que no se da (cifras de X2) es la casilla discontinua
 *     vacía del patrón: «todavía no hay valor», ni cero ni guion
 *   · la fecha va en la línea del primer bloque
 *   · un total que da Near va en una fila «Total» con raya encima; el saldo
 *     final, en negrita
 *
 * Solo lectura: no se toca nada. Sin teal ni ámbar (esos colores son el debe
 * y el haber). Clases con el prefijo `t7kx-`.
 *
 * kardex = { titulo, nota?, filas: [{ f, en?, sa?, saT?, sal, salT?, fin? }] }
 * capa   = [cantidad, costo unitario, costo total | null]
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Los rótulos de la guía: los nombres del libro (p. 238) y «Total». */
export const ROTULOS_KX = {
  cantidad: "Cantidad",
  costoUnitario: "Costo unitario",
  costoTotal: "Costo total",
  entradas: "Entradas",
  salidas: "Salidas",
  saldos: "Saldos",
  total: "Total",
};

/* El nombre accesible de la casilla vacía: de Watari, marcado por ella como pendiente de revisión. */
export const PENDIENTE_DE_REVISION_KX = { sinTotal: "Costo total: no se da" };

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", raya: "#33445E" };

export const CSS_KX = `
.t7kx { margin: 0; display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; }
.t7kx * { box-sizing: border-box; }
.t7kx-tit { font: 600 15px/1.3 "Sora", "Inter", sans-serif; color: ${P.texto}; padding-bottom: 6px; }
.t7kx-nota { margin: 0 0 8px; font-size: 13px; line-height: 1.45; color: ${P.texto2}; }
.t7kx-cab, .t7kx-capa { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1fr) minmax(0, 1.25fr); column-gap: 6px; }
.t7kx-cab { position: sticky; top: 0; z-index: 1; background: ${P.fondo}; padding: 4px 0 6px; border-bottom: 1px solid ${P.borde}; }
.t7kx-cab span { font: 500 12px/1.25 "Inter", sans-serif; color: ${P.texto2}; text-align: right; padding-inline: 4px; overflow-wrap: anywhere; }
.t7kx-mov { margin: 0; padding: 8px 0 10px; border-bottom: 1px solid ${P.raya}; display: grid; gap: 6px; }
.t7kx-fecha { font: 600 13px/1.3 "Sora", "Inter", sans-serif; color: ${P.texto}; letter-spacing: 0; }
.t7kx-bloque { display: grid; gap: 2px; }
.t7kx-rot { font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${P.texto2}; }
.t7kx-capa > span { text-align: right; padding-inline: 4px; font: 500 15px/1.5 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${P.texto}; }
.t7kx-total .t7kx-total-rot { grid-column: 1 / 3; text-align: left; font: 500 13px/1.7 "Inter", sans-serif; color: ${P.texto2}; }
.t7kx-total > span:last-child { border-top: 1px solid ${P.borde}; }
.t7kx-fin > span { font-weight: 700; }
.t7kx-sin { display: flex; align-items: center; }
.t7kx-sin i { display: block; width: 100%; height: 18px; border: 1px dashed ${P.borde}; border-radius: 4px; }
`;

function Capa({ capa, fin }) {
  const [q, cu, t] = capa;
  return (
    <div className={`t7kx-capa${fin ? " t7kx-fin" : ""}`} role="row" data-capa>
      <span role="cell" aria-label={`${ROTULOS_KX.cantidad} ${cifraK(q)}`}>{cifraK(q)}</span>
      <span role="cell" aria-label={`${ROTULOS_KX.costoUnitario} ${cifraK(cu)}`}>{cifraK(cu)}</span>
      {t === null
        ? <span role="cell" className="t7kx-sin" data-sin-total data-revision="pendiente" aria-label={PENDIENTE_DE_REVISION_KX.sinTotal}><i aria-hidden="true" /></span>
        : <span role="cell" aria-label={`${ROTULOS_KX.costoTotal} ${cifraK(t)}`}>{cifraK(t)}</span>}
    </div>
  );
}

function Total({ valor, fin }) {
  return (
    <div className={`t7kx-capa t7kx-total${fin ? " t7kx-fin" : ""}`} role="row" data-total>
      <span role="cell" className="t7kx-total-rot">{ROTULOS_KX.total}</span>
      <span role="cell" aria-label={`${ROTULOS_KX.costoTotal} ${cifraK(valor)}`}>{cifraK(valor)}</span>
    </div>
  );
}

function Bloque({ rot, cual, capas, total, fin, fecha }) {
  if (!capas) return null;
  return (
    <div className="t7kx-bloque" role="rowgroup" aria-label={rot} data-bloque={cual}>
      <span className="t7kx-rot" aria-hidden="true">{fecha && <><span className="t7kx-fecha">{fecha}</span> · </>}{rot}</span>
      {capas.map((c, k) => <Capa key={k} capa={c} fin={fin && !total} />)}
      {total != null && <Total valor={total} fin={fin} />}
    </div>
  );
}

export default function Kardex({ kardex, nota = null }) {
  return (
    <figure className="t7kx" role="table" aria-label={`Kárdex · ${kardex.titulo}`} data-kardex={kardex.titulo}>
      <style>{CSS_KX}</style>
      <figcaption className="t7kx-tit">{kardex.titulo}</figcaption>
      {nota && <p className="t7kx-nota" data-texto data-nota-kardex>{nota}</p>}
      <div className="t7kx-cab" role="row" aria-hidden="true">
        <span>{ROTULOS_KX.cantidad}</span><span>{ROTULOS_KX.costoUnitario}</span><span>{ROTULOS_KX.costoTotal}</span>
      </div>
      {kardex.filas.map((r) => {
        const primero = r.en ? "en" : r.sa ? "sa" : "sal";
        return (
          <section key={r.f} className="t7kx-mov" aria-label={r.f} data-fecha={r.f}>
            <Bloque rot={ROTULOS_KX.entradas} cual="entradas" capas={r.en} fecha={primero === "en" ? r.f : null} />
            <Bloque rot={ROTULOS_KX.salidas} cual="salidas" capas={r.sa} total={r.saT} fecha={primero === "sa" ? r.f : null} />
            <Bloque rot={ROTULOS_KX.saldos} cual="saldos" capas={r.sal} total={r.salT} fin={r.fin} fecha={primero === "sal" ? r.f : null} />
          </section>
        );
      })}
    </figure>
  );
}
