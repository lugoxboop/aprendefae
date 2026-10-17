import AprenderC3, { C3, pesos } from "./aprenderC3.jsx";
import { Pastilla, CORRECTA, TACHADA, LECTOR_INCORRECTO } from "../b5/Devolucion.jsx";
import { PIEZA_A2_C3, ROTULOS_A2 as W, FIGURA_A2 as F, CIFRAS_A2 as N, FECHAS_A2, COMPRAS_A2 } from "../../../../data/contabilidadT7_1_a2_c3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 A2 · «LA FACTURA COMPLETA» EN EL PATRÓN DE ENGANCHE C3 (Watari,
 * 16-oct-2026; a2.js → aquí), sobre el motor C3 de la célula.
 *
 * El estudiante VE la factura armarse (más el IVA, menos la retención, que se
 * va a la Dirección de Impuestos) y luego VE el IVA y la retención cruzar de
 * lado cuando La Reventa pasa de comprar a vender.
 *
 * Correcciones de Mello (auditoria-mello-patron-c3.md §3):
 *   · A2-1: con `conBase` (la base acertada en la pantalla 3), el rótulo de
 *     las tarifas no dice «, sobre la mercancía sin el IVA», y la retención,
 *     lo que se queda debiendo y la caja de la Dirección de Impuestos van en
 *     `$?`. El botón y la caída a la Dirección de Impuestos de la pantalla 2
 *     no cambian; las cifras llegan con el acierto de la pantalla 3.
 *     En la pantalla 3 la retención se ve (en `$?`), como pide la condición
 *     de fusión §4 («la retención está en `$?`»); en el código de Watari ese
 *     renglón iba apagado («—») hasta el acierto.
 *   · A2-2: el lado a lado usa C3.cruce y `.c3-tile` del motor (borde de
 *     reposo), no una ficha propia.
 *
 * Dos cosas de Misa sobre el código de referencia (anotadas para Watari):
 *   · La portada muestra la factura con la mercancía sola, como dicen la
 *     tabla de estados («vacío») y el «Primer impacto» de la C3; el código
 *     encendía ya el IVA en la portada.
 *   · Los corchetes de la base van a todo el ancho, uno debajo de otro: el
 *     `calc(var(--a) * 1%)` de Watari multiplicaba dos porcentajes, así que el
 *     navegador lo descartaba y así es como Watari los midió.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const BASE = "base-de-la-retencion";
const ESCALA = N.mercancia + N.iva;
const pct = (n) => `${(100 * n) / ESCALA}%`;

/* La factura de la compra: mercancía, más IVA, menos retención; la retención se va a la Dirección de Impuestos. */
function Factura({ ctx }) {
  const { s, P } = ctx;
  const f = s.fig;
  const elige = P.id === BASE;
  const res = Boolean(s.resuelto[P.id]);
  const conBase = Boolean(s.resuelto[BASE]);
  const iva = f.iva || !["dos-impuestos", "portada"].includes(P.id);
  /* La barra, como en Watari: el tramo de la retención aparece con el botón (pantalla 2) o con el acierto (pantalla 3). */
  const ret = (f.ret && P.id === "dos-impuestos") || (elige && res);
  /* Los renglones: en la pantalla 3 la retención ya se descontó; su cifra espera a la base (A2-1). */
  const retVisto = ret || elige;
  const cifra = (n) => (conBase ? pesos(n) : F.pendiente);
  const llega = !ctx.reducido && ((P.id === "dos-impuestos" && ctx.evento === "figura" && f.ultimo === "ret") || (elige && ctx.evento === "acierto"));

  const base = (id) => {
    const o = P.opciones.find((x) => x.id === id);
    const m = ctx.marca(id);
    return (
      <button key={id} type="button" className={`a2-base${m ? ` ${m}` : ""}`} data-elige={id} data-op={id}
        aria-disabled={res ? "true" : undefined} aria-label={`${o.t}${m === "mal" ? `. ${LECTOR_INCORRECTO}` : m === "bien" ? ". Correcto." : ""}`}
        onClick={() => ctx.elegir(id)}>
        <span className="c3-num">{o.t}</span>{m === "mal" && <Pastilla marca={TACHADA} />}{m === "bien" && <Pastilla marca={CORRECTA} />}
      </button>
    );
  };

  return (
    <section className="a2-factura c3-hundido" aria-label={F.nombreFactura} data-factura>
      <header className="a2-fcab"><span>{W.facturaCompra}</span><span>{FECHAS_A2.compra}</span></header>
      {elige && <div className="a2-bases" role="group" aria-label={F.nombreBases}>{ctx.ordenar(P.opciones).map((o) => base(o.id))}</div>}
      <div className="a2-barra" aria-hidden="true">
        <i className="m" style={{ width: pct(N.mercancia) }} />
        <i className={`i${iva ? " on" : ""}`} style={{ left: pct(N.mercancia), width: pct(N.iva) }} />
        <i className={`r${ret ? " on" : ""}`} style={{ left: pct(N.proveedores), width: pct(N.retencion) }} />
      </div>
      <div className="a2-ren" data-ren="mercancia"><span>{F.mercancia}</span><b className="c3-num">{pesos(N.mercancia)}</b></div>
      <div className={`a2-ren${iva ? "" : " off"}`} data-ren="iva"><span>{F.masIva}</span><b className="c3-num">{iva ? pesos(N.iva) : F.vacio}</b></div>
      <div className={`a2-ren${retVisto ? "" : " off"}`} data-ren="retencion"><span>{F.menosRetencion}</span><b className="c3-num">{retVisto ? cifra(N.retencion) : F.vacio}</b></div>
      <div className={`a2-ren total${iva && retVisto ? "" : " off"}`} data-ren="total"><span>{W.debeCompra}</span><b className="c3-num">{iva && retVisto ? cifra(N.proveedores) : F.vacio}</b></div>
      <p className={`a2-dian${retVisto ? " on" : ""}${llega ? " llega" : ""}`} data-dian><span>{W.dian}</span><b className="c3-num">{retVisto ? cifra(N.retencion) : ""}</b></p>
      <p className="a2-tarifa" data-tarifa>{F.tarifa(conBase)}</p>
    </section>
  );
}

/* Lado a lado: el asiento de La Reventa con solo los dos impuestos. Al cambiar de papel, cruzan la línea del centro (C3.cruce). */
const COMPRA = PIEZA_A2_C3.pantallas.find((p) => p.id === "lados-de-la-compra").lineas;
const VENTA = PIEZA_A2_C3.pantallas.find((p) => p.id === "la-venta").lineas;
function Roles({ ctx }) {
  const venta = ctx.s.fig.rol === "venta";
  const [iva, ret] = venta ? [VENTA.find((l) => l.id === "iva"), VENTA.find((l) => l.id === "anticipo")] : [COMPRA.find((l) => l.id === "iva"), COMPRA.find((l) => l.id === "retencion")];
  const rol = (r, t) => {
    const on = (r === "venta") === venta;
    return <button type="button" data-accion="rol" data-rol={r} aria-pressed={String(on)} className={`a2-rol${on ? " on" : ""}`}
      onClick={() => ctx.fig(r === "venta" ? { rol: r, vioRoles: true } : { rol: r })}>{t}</button>;
  };
  return (
    <>
      <div className="c3-roles" role="group" aria-label={F.nombreRoles}>{rol("compra", W.compra)}{rol("venta", W.venta)}</div>
      <C3.cruce clave="a2-roles" className="a2-cruce" fichas={[
        { key: "iva", der: venta, contenido: <><span>{iva.cuenta}</span><b className="c3-num">{pesos(iva.monto)}</b></> },
        { key: "ret", der: !venta, contenido: <><span>{ret.cuenta}</span><b className="c3-num">{pesos(ret.monto)}</b></> },
      ]} />
    </>
  );
}

function figura(ctx) {
  const { P, s } = ctx;
  if (["portada", "dos-impuestos", BASE].includes(P.id)) {
    return (
      <>
        <Factura ctx={ctx} />
        {P.id === "dos-impuestos" && (
          <div className="a2-acciones">
            <button type="button" className="c3-boton a2-accion" data-accion="iva" aria-disabled={s.fig.iva ? "true" : undefined}
              onClick={() => { if (!s.fig.iva) ctx.fig({ iva: true, ultimo: "iva" }); }}>{W.sumarIva}</button>
            <button type="button" className="c3-boton a2-accion" data-accion="ret" aria-disabled={s.fig.ret || !s.fig.iva ? "true" : undefined}
              onClick={() => { if (s.fig.iva && !s.fig.ret) ctx.fig({ ret: true, ultimo: "ret" }); }}>{W.descontarRetencion}</button>
          </div>
        )}
      </>
    );
  }
  if (P.tipo === "lados") {
    const venta = P.id === "la-venta";
    const lineas = P.lineas.map((l) => ({ ...l, monto: l.monto ?? (s.resuelto[P.id] ? P.resuelto[l.id] : null) }));
    return (
      <>
        {venta && <p className="a2-calc" data-calc>{W.facturaVenta} · <span className="c3-num">{pesos(N.venta)}</span> {F.ventaIva} <span className="c3-num">{pesos(N.ivaVenta)}</span> {F.ventaRetencion} <span className="c3-num">{pesos(N.anticipo)}</span></p>}
        <C3.asientoT ctx={ctx} titulo={venta ? W.asientoVenta : W.asientoCompra} lineas={lineas} resueltas={venta ? [] : [COMPRAS_A2]} />
      </>
    );
  }
  return <Roles ctx={ctx} />;
}

export const CSS_A2 = `
/* A2 · la factura que se arma (Watari, a2.css). El cruce es el del motor (A2-2). */
.a2-factura { padding: 10px 12px 12px; display: grid; gap: 6px; margin: 0; }
.a2-fcab { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; padding-bottom: 6px; border-bottom: 2px solid var(--neutro); font: 600 13px/1.3 "Sora", sans-serif; }
.a2-fcab span + span { font: 400 12px/1.6 "Inter", sans-serif; color: var(--atenuado); }
.a2-barra { position: relative; height: 16px; margin: 4px 0; }
.a2-barra i { position: absolute; top: 0; bottom: 0; border-radius: 3px; transform-origin: left center; transition: transform .35s cubic-bezier(.3,.9,.4,1), opacity .35s; }
.a2-barra .m { left: 0; background: rgba(184,196,212,.45); }
.a2-barra .i { background: transparent; border: 1px solid var(--neutro); transform: scaleX(0); }
.a2-barra .i.on { transform: none; }
.a2-barra .r { background: repeating-linear-gradient(135deg, rgba(248,249,250,.85) 0 3px, transparent 3px 6px); opacity: 0; }
.a2-barra .r.on { opacity: 1; transform: translateY(0); }
.a2-ren { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; }
.a2-ren.off { color: var(--atenuado); }
.a2-ren.total { border-top: 1px solid rgba(248,249,250,.35); padding-top: 6px; font-weight: 600; }
.a2-dian { margin: 4px 0 0; display: flex; justify-content: space-between; gap: 8px; padding: 6px 10px; border: 1px dashed rgba(184,196,212,.6); border-radius: 8px; font-size: 12px; color: var(--atenuado); }
.a2-dian.on { border-style: solid; color: var(--texto); }
.a2-dian.llega b { display: inline-block; animation: a2-llega .5s cubic-bezier(.3,.9,.4,1) both; }
@keyframes a2-llega { from { transform: translateY(-40px); opacity: 0; } to { transform: none; opacity: 1; } }
.a2-tarifa { margin: 0; font-size: 12px; color: var(--atenuado); }
/* El alto de los botones de la figura, declarado aquí (el motor ya lo da; alto-de-boton-celula-c lee este archivo). */
.a2-accion, .a2-rol { min-height: 44px; }
.a2-acciones { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 8px; }
.a2-bases { display: grid; gap: 6px; }
.a2-base { min-height: 44px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; padding: 6px 10px; max-width: 100%; border: 1px solid rgba(248,249,250,.35); border-top-width: 3px; border-radius: 6px; background: transparent; color: var(--texto); font: 600 13px/1.2 "Inter", sans-serif; cursor: pointer; text-align: left; }
.a2-base.mal { border-color: var(--coral); border-width: 3px 2px 2px; }
.a2-base.pista, .a2-base.bien { border-color: var(--texto); border-width: 3px 2px 2px; }
.a2-base[aria-disabled="true"] { cursor: default; }
.a2-calc { margin: 0; font-size: 13px; color: var(--atenuado); }
@media (prefers-reduced-motion: reduce) { .a2 *, .a2 *::before, .a2 *::after { animation: none !important; transition: none !important; } }
`;

export const PIEZA_A2 = { ...PIEZA_A2_C3, figura };

export default function LaFacturaCompletaC3({ pieza = PIEZA_A2, rotulo, barajar }) {
  return (
    <>
      <style>{CSS_A2}</style>
      <AprenderC3 pieza={pieza.figura ? pieza : { ...pieza, figura }} rotulo={rotulo} barajar={barajar} />
    </>
  );
}
