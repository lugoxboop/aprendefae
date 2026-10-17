import { Check } from "lucide-react";
import { sinPartir } from "./PatronT7_3.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · LO COMÚN DE LAS FIGURAS C4 (Célula C): Aprender (AprenderT7_3C4)
 * y los Hacer del lote (H1, H2, H4, H5, H7).
 *   marcaDe(vista, toca)  lo que la opción movió: blanco al tocar, coral si
 *                         el veredicto la dio por mala
 *   mov(toca)             la clase que anima el motor (c4-mov)
 *   Cuadra                lo que cuadra, con su ✓, solo con el veredicto de una buena
 *   Cuenta                renglones con la forma del Patrón T7-3, con el renglón movido marcado
 *   Regla                 una línea de valores con marcas y la cifra tocada
 *   CSS_T73C4             las clases t73c4-
 * FIGURAS PROVISIONALES PARA WATARI (su prototipo, f73.js).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const miles = (n) => `${n < 0 ? "−" : ""}${String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
export const valorDe = (v) => (v == null ? "$?" : typeof v === "number" ? miles(v) : sinPartir(v));
const OP_SR = { "−": "menos ", "+": "más ", "×": "por ", "=": "igual a " };

/* La marca de lo que la opción movió: blanca al tocar; coral si el veredicto la dio por mala. */
export const marcaDe = (vista, toca) => (!toca ? "" : vista.veredicto && !vista.ok ? " t73c4-mal" : " t73c4-toca");
export const mov = (toca) => (toca ? " c4-mov" : "");

/* Lo que cuadra, con su ✓: solo con el veredicto de una buena. La falla la pinta el motor. */
export function Cuadra({ estado, vista }) {
  if (!estado?.cuadra || !vista.veredicto || !vista.ok) return null;
  return <p className="t73c4-cuadra" data-cuadra><Check size={16} aria-hidden="true" /><span>{estado.cuadra}</span></p>;
}

/* Una cuenta en renglones, con la forma del Patrón T7-3 (Renglones), y el renglón que la opción movió marcado. */
export function Cuenta({ titulo, filas, vista, dato }) {
  return (
    <div className="t73pt">
      <figure className="rg" role="table" aria-label={titulo ?? undefined} data-renglones={titulo ?? ""} data-c4-objeto={dato}>
        {titulo && <figcaption className="rg-tit">{titulo}</figcaption>}
        {filas.map((f, k) => (
          <div key={k} role="row" data-renglon data-toca={f.toca ? "" : undefined} className={`rg-f${f.res ? " rg-res" : ""}${marcaDe(vista, f.toca)}`}>
            <span className="rg-op" aria-hidden="true">{f.op ?? ""}</span>
            <span className="rg-rot" role="rowheader">{f.op && <span className="sr">{OP_SR[f.op] ?? ""}</span>}{sinPartir(f.rot)}</span>
            <span className={`rg-v${mov(f.toca)}`} role="cell">{valorDe(f.v)}</span>
          </div>
        ))}
      </figure>
    </div>
  );
}


/* Una línea de valores (de `desde` a `hasta`): una marca por valor, cada una en su altura, y la cifra tocada arriba. */
const enRegla = (desde, hasta, y) => Math.max(0, Math.min(100, (100 * (y - desde)) / (hasta - desde)));
export const anclar = (pos) => ({ left: `${pos}%`, transform: `translateX(${pos > 78 ? "-100%" : pos < 22 ? "0" : "-50%"})` });
export function Regla({ marcas, desde, hasta, valor, vista, fmt }) {
  return (
    <div className="t73c4-regla" style={{ height: `${36 + 22 * marcas.length}px` }} data-regla>
      {marcas.map((m, k) => <span key={m.rot} className="t73c4-marca" style={{ ...anclar(enRegla(desde, hasta, m.v)), bottom: `${2 + 22 * k}px` }} data-marca={m.rot}>{m.rot} {fmt(m.v)}</span>)}
      {/* La posición (transform) va en la caja de afuera; la animación del motor (c4-mov, también transform), en la de adentro. */}
      {valor != null && (
        <span className="t73c4-valor-pos" style={{ ...anclar(enRegla(desde, hasta, valor)), bottom: `${6 + 22 * marcas.length}px` }}>
          <b className={`t73c4-valor c4-mov${marcaDe(vista, true)}`} data-valor>{fmt(valor)}</b>
        </span>
      )}
    </div>
  );
}

export const CSS_T73C4 = `
.t73c4 { display: grid; gap: 10px; min-width: 0; --coral: #E76F51; }
.t73c4-obj { display: grid; gap: 8px; padding: 10px 12px; border: 1px solid #B8C4D4; border-radius: 10px; min-width: 0; }
.t73c4-tit { margin: 0; font: 600 13px/1.3 "Sora", "Inter", sans-serif; color: #F8F9FA; }
.t73c4-linea { margin: 0; font-size: 13px; line-height: 1.4; color: #F8F9FA; overflow-wrap: anywhere; }
.t73c4-num { font-variant-numeric: tabular-nums; white-space: nowrap; }
.t73c4-toca { outline: 2px solid #F8F9FA; outline-offset: 1px; border-radius: 6px; }
.t73c4-mal { outline: 2px solid var(--coral); outline-offset: 1px; border-radius: 6px; }
.t73c4-cuadra { margin: 0; display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 6px; align-items: start; font-size: 13px; line-height: 1.4; color: #F8F9FA; }
.t73c4-cuadra svg { margin-top: 1px; }
.t73c4-aparte { margin: 0; padding: 6px 8px; border: 1px dashed #B8C4D4; border-radius: 6px; font-size: 13px; line-height: 1.35; }
.t73c4-aparte.t73c4-toca, .t73c4-aparte.t73c4-mal { border-style: solid; }
.t73c4-barra { display: flex; height: 44px; border-radius: 6px; overflow: hidden; gap: 2px; }
.t73c4-barra i { display: grid; place-items: center; min-width: 0; background: #B8C4D4; color: #1D3557; font: 600 12px/1.2 "Inter", sans-serif; font-style: normal; overflow: hidden; outline-offset: -2px; }
.t73c4-barra i span { padding: 0 4px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.t73c4-barra i.corte { background: transparent; border: 1px dashed #B8C4D4; color: #F8F9FA; }
.t73c4-leyenda { color: #A8B6C8; font-size: 12px; }
.t73c4-dos { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
.t73c4-zona { display: grid; gap: 6px; align-content: start; min-height: 72px; padding: 8px; border-radius: 8px; border: 1px solid rgba(248,249,250,.25); }
.t73c4-zona-rot { font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: #A8B6C8; font-weight: 600; }
.t73c4-chip { margin: 0; justify-self: start; display: inline-block; padding: 4px 8px; border-radius: 6px; border: 1px solid #F8F9FA; font-size: 12px; line-height: 1.3; }
.t73c4-libros { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t73c4-libros .t73p-t { padding: 8px 4px; }
.t73c4-libros .t73p-t-lado { padding: 6px 2px 0; }
.t73c4-libros .t73p-t-v { font-size: 12px; }
.t73c4-libros .t73p-t-cuenta { font-size: 12px; }
.t73c4-fuera { margin: 6px 4px 0; justify-self: center; text-align: center; padding: 2px 8px; border: 1px dashed #B8C4D4; border-radius: 6px; font-size: 12px; font-variant-numeric: tabular-nums; text-decoration: line-through; }
.t73c4-renops { display: grid; gap: 6px; }
.t73c4-renop { justify-content: space-between; }
.t73c4-regla { position: relative; margin: 0 4px; border-bottom: 2px solid #B8C4D4; }
.t73c4-marca { position: absolute; font-size: 12px; line-height: 1.2; color: #A8B6C8; white-space: nowrap; padding-bottom: 2px; border-bottom: 2px solid #A8B6C8; }
.t73c4-valor-pos { position: absolute; display: block; }
.t73c4-valor { display: inline-block; white-space: nowrap; font: 600 12px/1.2 "Inter", sans-serif; padding: 3px 6px; border-radius: 6px; border: 2px solid #F8F9FA; background: #1F2D3D; outline: 0; }
.t73c4-valor.t73c4-mal { border-color: var(--coral); outline: 0; }
.t73c4-tiempo { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; font-size: 12px; text-align: center; color: #A8B6C8; }
.t73c4-tiempo span { padding: 6px 2px; border-top: 2px solid #B8C4D4; }
.t73pt .pz-c4-et.t73c4-toca { outline: 0; border: 2px solid #F8F9FA; }
.t73pt .pz-c4-et.t73c4-mal { outline: 0; border: 2px solid var(--coral); }
.t73pt .pz-c4-mark.t73c4-mal { outline: 0; background: var(--coral); }
.t73pt .pz-c4-mark.t73c4-toca { outline: 0; }
.t73pt .br-f.t73c4-toca, .t73pt .br-f.t73c4-mal { padding: 2px 4px; }
.t73p-as-r.t73c4-toca, .t73p-as-r.t73c4-mal { outline-offset: -2px; padding-inline: 4px; }
.c4-pie .t73c4-pie-l { display: block; }
`;
