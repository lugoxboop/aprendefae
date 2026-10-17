import AprenderC3, { Cruce, AsientoT } from "./aprenderC3.jsx";
import { Pastilla, TACHADA, CORRECTA, LECTOR_INCORRECTO } from "../b5/Devolucion.jsx";
import { PIEZA_DEVOLUCIONES_C3, FIGURA as F, CIFRAS as C, CALCULOS, COMPRADOR, VENDEDOR, PCT, pesos } from "../../../../data/contabilidadT7_1_a6_c3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A6 «Devoluciones en periódico», en el motor C3 (Patrón de enganche
 * C3 de Watari, pieza 3: a6.js y a6.css → aquí). Reemplaza a
 * DevolucionesEnPeriodico.jsx con el mismo id y en la misma posición.
 *
 * La idea: una devolución es el registro original al revés. El estudiante
 * devuelve la mercancía y ve viajar la nota crédito; compara restar de las
 * ventas con la cuenta propia en un estado de resultados que no califica;
 * pela de la compra la parte devuelta; elige la tajada del IVA; arma los dos
 * libros línea por línea, y cada línea deja enfrente, en fantasma, la del 1
 * de junio que reversa. En el lado a lado, las ocho líneas cruzan de lado al
 * cambiar de fecha.
 *
 * A6-1 de Mello: antes del acierto de «¿Cuánto IVA se devuelve?», la barra
 * del IVA va entera; el corte aparece con el acierto.
 *
 * Las filas pareadas de la cuenta T usan `grid-template-rows: subgrid`, dentro
 * de @supports: sin subgrid (Safari < 16), cada lado queda con la rejilla del
 * motor; las filas no se emparejan, pero nada se rompe.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_A6 = `
/* C3 · A6 «Devoluciones en periódico» (a6.css de Watari) */
.a6 .c3-tile { transition: transform .5s cubic-bezier(.3,.9,.4,1), opacity .5s cubic-bezier(.3,.9,.4,1); }
.a6 .c3-tile.oculta { opacity: 0; }
.a6-nombres { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 8px; font-size: 12px; line-height: 1.35; color: var(--atenuado); opacity: 0; transition: opacity .4s cubic-bezier(.3,.9,.4,1); }
.a6-nombres.on { opacity: 1; } .a6-nombres b { color: var(--texto); font-weight: 600; }
.a6-er { padding: 10px 14px 12px; display: grid; gap: 6px; }
.a6-er-tit { margin: 0 0 4px; font: 600 13px/1.3 "Sora", sans-serif; }
.a6-er-ren, .a6-ren { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; transition: opacity .4s cubic-bezier(.3,.9,.4,1); }
.a6-er-ren.off, .a6-ren.off { opacity: .4; }
.a6-er-ren.total, .a6-ren.total { padding-top: 6px; border-top: 1px solid rgba(248,249,250,.35); font-weight: 600; }
.a6-compra { padding: 12px 14px; display: grid; gap: 8px; }
.a6-cab { display: flex; justify-content: space-between; gap: 8px; font: 600 13px/1.3 "Sora", sans-serif; padding-bottom: 6px; border-bottom: 1px solid rgba(248,249,250,.35); }
.a6-cab span:last-child { font: 500 12px/1.3 "Inter", sans-serif; color: var(--atenuado); }
.a6-eti { margin: 0; font-size: 12px; color: var(--atenuado); }
.a6-barra { display: flex; height: 22px; gap: 0; }
.a6-barra i { display: block; height: 100%; }
.a6-barra .queda { background: var(--neutro); border-radius: 4px 0 0 4px; }
.a6-barra .queda.entera { border-radius: 4px; }
.a6-barra .dev { background: var(--neutro); border-left: 2px solid #1F2D3D; border-radius: 0 4px 4px 0; transition: transform .5s cubic-bezier(.3,.9,.4,1), opacity .5s cubic-bezier(.3,.9,.4,1); }
.a6-barra .dev.pelada { transform: translate(6px, 12px) rotate(4deg); opacity: .55; }
.a6-barra .dev.marcada { background: transparent; border: 2px dashed var(--neutro); }
.a6-barra.iva .queda, .a6-barra.iva .dev:not(.marcada) { background: rgba(184,196,212,.55); }
.a6-bases { display: grid; gap: 6px; }
.a6-base { min-height: 44px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; padding: 6px 10px; margin-left: calc(var(--a) * 1%); width: calc((var(--b) - var(--a)) * 1%); min-width: 132px; max-width: 100%; justify-self: start; border: 1px solid rgba(248,249,250,.35); border-top-width: 3px; border-radius: 6px; background: transparent; color: var(--texto); font: 600 13px/1.2 "Inter", sans-serif; cursor: pointer; text-align: left; box-sizing: border-box; }
.a6-base.fin { margin-left: auto; justify-self: end; }
.a6-base.cero { border-top-style: dashed; }
.a6-base.mal { border-color: var(--coral); border-width: 3px 2px 2px; }
.a6-base.pista, .a6-base.bien { border-color: var(--texto); border-width: 3px 2px 2px; }
.a6-base[aria-disabled="true"] { cursor: default; }
.a6-base:focus-visible { outline: 2px solid var(--texto); outline-offset: 2px; }
.a6 .c3-calc { margin: 0; display: grid; gap: 2px; font-size: 13px; }
.a6 .c3-calc.nuevo > * { animation: c3-cae .4s cubic-bezier(.3,.9,.4,1) both; }
.a6-t { display: grid; gap: 10px; }
@supports (grid-template-rows: subgrid) {
  .a6 .c3-t-lados { grid-template-rows: repeat(var(--n, 1), auto) minmax(56px, auto); row-gap: 6px; }
  .a6 .c3-lado { grid-row: 1 / -1; grid-template-rows: subgrid; }
}
.a6 .c3-tile.a6-libro { grid-column: 1 / -1; transform: none; margin: 6px 0 0; padding: 2px 0; border: 0; border-radius: 0; background: #16222F; color: var(--texto); font: 600 13px/1.3 "Sora", sans-serif; position: relative; z-index: 1; }
.a6-espejo .c3-tile:not(.a6-libro) { min-height: 44px; }
/* Los mismos 44 px que dan .c3-boton y .c3-roles button en el motor, dichos aquí para alto-de-boton-celula-c. */
.a6 .c3-boton, .a6-rol { min-height: 44px; }
`;

/* Dos botones que no califican (Watari: roles). on = 0 o 1. */
function Roles({ accion, valores, textos, on, elegir }) {
  return (
    <div className="c3-roles" role="group">
      {valores.map((v, i) => (
        <button key={v} type="button" data-accion={accion} data-v={v} aria-pressed={String(on === i)} className={`a6-rol${on === i ? " on" : ""}`} onClick={() => elegir(v)}>{textos[i]}</button>
      ))}
    </div>
  );
}

const sinDeshabilitar = (hecho, hacer) => () => { if (!hecho) hacer(); };

/* Portada y P2 · la mercancía vuelve al vendedor y la nota crédito viaja al comprador. */
function escena(ctx) {
  const d = ctx.s.fig.devuelta;
  const E = F.escena;
  return (
    <>
      <Cruce clave="escena" className="a6-escena" rotulos={[E.vendedor, E.comprador]} fichas={[
        { key: "mercancia", der: !d, contenido: <><span>{E.mercancia}</span><b>{d ? E.devuelta : E.enMalEstado}</b></> },
        { key: "nota", der: d, clase: d ? "" : "oculta", contenido: <><span>{E.nota}</span><b>{E.notaDice}</b></> },
      ]} />
      {ctx.P.id !== "portada" && (
        <div className="c3-abajo">
          <div className={`a6-nombres${d ? " on" : ""}`} aria-hidden={d ? undefined : "true"}>
            <span>{E.paraVendedor}<b>{E.devVentas}</b></span><span>{E.paraComprador}<b>{E.devCompras}</b></span>
          </div>
          <button type="button" className="c3-boton" data-accion="devolver" aria-disabled={d ? "true" : undefined} onClick={sinDeshabilitar(d, () => ctx.fig({ devuelta: true }))}>{E.devolver}</button>
        </div>
      )}
    </>
  );
}

/* P3 · el estado de resultados en miniatura, de El Tajamar: no califica. */
function estado(ctx) {
  const ap = ctx.s.fig.modo === "aparte";
  const E = F.estado;
  return (
    <>
      <Roles accion="modo" valores={["directo", "aparte"]} textos={[E.directo, E.aparte]} on={ap ? 1 : 0}
        elegir={(v) => ctx.fig(v === "aparte" ? { modo: v, vioAparte: true } : { modo: v })} />
      <div className="a6-er c3-hundido" role="group" aria-label={E.titulo} aria-live="polite">
        <p className="a6-er-tit">{E.titulo}</p>
        <div className="a6-er-ren" data-fila="ingresos"><span>{E.ingresos}</span><b className="c3-num">{pesos(ap ? C.compra : C.compra - C.devuelto)}</b></div>
        <div className={`a6-er-ren dev${ap ? "" : " off"}`} data-fila="devoluciones"><span>{E.devoluciones}</span><b className="c3-num">{ap ? pesos(C.devuelto) : E.vacio}</b></div>
        <div className="a6-er-ren total" data-fila="neto"><span>{E.neto}</span><b className="c3-num">{pesos(C.compra - C.devuelto)}</b></div>
      </div>
    </>
  );
}

/* P4 · la barra de la compra; la parte devuelta se pela. */
function barra(ctx) {
  const p = ctx.s.fig.pelada;
  const B = F.barra;
  return (
    <>
      <div className="a6-compra c3-hundido" role="group" aria-label={B.nombre}>
        <div className="a6-cab"><span>{B.cabecera}</span><span>{B.fecha}</span></div>
        <div className="a6-barra" aria-hidden="true" data-barra="compra">
          <i className="queda" style={{ width: `${100 - PCT}%` }} /><i className={`dev${p ? " pelada" : ""}`} style={{ width: `${PCT}%` }} />
        </div>
        <div className="a6-ren" data-fila="comprada"><span>{B.comprada}</span><b className="c3-num">{pesos(C.compra)}</b></div>
        <div className={`a6-ren${p ? "" : " off"}`} data-fila="devuelta"><span>{B.devuelta}</span><b className="c3-num">{p ? pesos(C.devuelto) : F.estado.vacio}</b></div>
        <div className={`a6-ren total${p ? "" : " off"}`} data-fila="queda"><span>{B.queda}</span><b className="c3-num">{p ? pesos(C.compra - C.devuelto) : F.estado.vacio}</b></div>
        <p className="c3-rotulo">{B.rotulo}</p>
      </div>
      <button type="button" className="c3-boton" data-accion="pelar" aria-disabled={p ? "true" : undefined} onClick={sinDeshabilitar(p, () => ctx.fig({ pelada: true }))}>{B.pelar}</button>
    </>
  );
}

/* P5 · mercancía e IVA, cada uno en su barra. Los corchetes son las opciones. A6-1: la barra del IVA, entera hasta el acierto. */
function tajada(ctx) {
  const { s, P } = ctx;
  const res = Boolean(s.resuelto[P.id]);
  const T = F.tajada;
  const base = (id, a, b, fin = false) => {
    const o = P.opciones.find((x) => x.id === id);
    const m = ctx.marca(id);
    return (
      <button key={id} type="button" data-elige={id} className={`a6-base${m ? ` ${m}` : ""}${a === b ? " cero" : ""}${fin ? " fin" : ""}`}
        style={{ "--a": a, "--b": b }} aria-disabled={res ? "true" : undefined}
        aria-label={`${o.t}${m === "mal" ? `. ${LECTOR_INCORRECTO}` : m === "bien" ? ". Correcto." : ""}`} onClick={() => ctx.elegir(id)}>
        <span className="c3-num">{o.t}</span>{m === "mal" && <Pastilla marca={TACHADA} />}{m === "bien" && <Pastilla marca={CORRECTA} />}
      </button>
    );
  };
  return (
    <div className="a6-compra c3-hundido" role="group" aria-label={T.nombre}>
      <p className="a6-eti">{T.mercancia}<span className="c3-num">{pesos(C.compra)}</span></p>
      <div className="a6-barra" aria-hidden="true" data-barra="mercancia"><i className="queda" style={{ width: `${100 - PCT}%` }} /><i className="dev marcada" style={{ width: `${PCT}%` }} /></div>
      <p className="a6-eti">{T.iva}<span className="c3-num">{pesos(C.ivaCompra)}</span></p>
      <div className="a6-barra iva" aria-hidden="true" data-barra="iva">
        {res
          ? <><i className="queda" style={{ width: `${100 - PCT}%` }} /><i className="dev marcada" style={{ width: `${PCT}%` }} /></>
          : <i className="queda entera" style={{ width: "100%" }} />}
      </div>
      <div className="a6-bases" role="group" aria-label={T.bases}>{ctx.ordenar([{ id: "proporcional", a: 100 - PCT, b: 100, fin: true }, { id: "todo", a: 0, b: 100 }, { id: "nada", a: 0, b: 0 }]).map((x) => base(x.id, x.a, x.b, x.fin))}</div>
      {res && <div className={`c3-calc${ctx.evento === "acierto" && !ctx.reducido ? " nuevo" : ""}`} data-calculos>{CALCULOS.map((c) => <span key={c} className="c3-num">{c}</span>)}</div>}
    </div>
  );
}

/* P6 y P7 · el libro de cada uno, línea por línea, con el fantasma de la del 1 de junio. --n: las filas pareadas. */
function libro(ctx) {
  const k = ctx.s.linea[ctx.P.id] ?? 0;
  const titulo = ctx.P.id === "libro-del-comprador" ? F.libros.comprador : F.libros.vendedor;
  return <div className="a6-t" style={{ "--n": k + 1 }}><AsientoT ctx={ctx} titulo={titulo} /></div>;
}

/* P8 · las ocho líneas en un solo cruce: al cambiar de fecha, cada una cruza de lado (y Compras ↔ Devoluciones…). */
function espejo(ctx) {
  const j1 = ctx.s.fig.fecha === "j1";
  const E = F.espejo;
  const ficha = (libroId) => (l) => {
    const lado = j1 ? (l.lado === "debe" ? "haber" : "debe") : l.lado;
    const c = j1 ? l.fantasma : l;
    return { key: `${libroId}-${l.id}`, der: lado === "haber", contenido: <><span>{c.cuenta}</span><b className="c3-num">{pesos(c.monto)}</b></> };
  };
  const fichas = [
    { key: "libro-comprador", clase: "a6-libro", contenido: E.comprador }, ...COMPRADOR.map(ficha("comprador")),
    { key: "libro-vendedor", clase: "a6-libro", contenido: E.vendedor }, ...VENDEDOR.map(ficha("vendedor")),
  ];
  return (
    <>
      <div className="c3-arriba">
        <Roles accion="fecha" valores={["j1", "j5"]} textos={[E.j1, E.j5]} on={j1 ? 0 : 1}
          elegir={(v) => ctx.fig(v === "j1" ? { fecha: v, vioJ1: true } : { fecha: v })} />
      </div>
      <Cruce clave="espejo" className="a6-espejo" fichas={fichas} />
    </>
  );
}

export function figuraA6(ctx) {
  const id = ctx.P.id;
  if (id === "portada" || id === "que-es-una-devolucion") return escena(ctx);
  if (id === "dos-cuentas-propias") return estado(ctx);
  if (id === "el-caso") return barra(ctx);
  if (id === "cuanto-se-reversa") return tajada(ctx);
  if (ctx.P.tipo === "lados") return libro(ctx);
  if (id === "lado-a-lado") return espejo(ctx);
  return null;
}

export default function DevolucionesEnPeriodicoC3({ pieza = PIEZA_DEVOLUCIONES_C3, rotulo, barajar }) {
  return (
    <>
      <style>{CSS_A6}</style>
      <AprenderC3 pieza={{ ...pieza, figura: figuraA6 }} rotulo={rotulo} barajar={barajar} />
    </>
  );
}
