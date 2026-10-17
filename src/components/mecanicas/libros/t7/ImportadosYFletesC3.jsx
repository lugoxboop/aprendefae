import { useEffect, useRef } from "react";
import AprenderC3, { Cruce, pesos } from "./aprenderC3.jsx";
import { Pastilla, Mensaje, RegionViva, CORRECTA, TACHADA, LECTOR_INCORRECTO } from "../b5/Devolucion.jsx";
import { comprobarFOB, confirmarCyF, marcaDe } from "./ImportadosYFletes.jsx";
import { PIEZA_IMPORTADOS_Y_FLETES_C3, FIGURA_A5, FLETE_A5 } from "../../../../data/contabilidadT7_1_a5_c3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A5 «Importados y fletes», con el Patrón de enganche C3 de Watari
 * (sección «a5», 16-oct-2026), sobre el motor de la célula (aprenderC3.jsx,
 * sin cambios). Reemplaza a ImportadosYFletes.jsx con el mismo id y lugar.
 *
 * La idea (Watari): el costo es una ETIQUETA que crece con cada gasto
 * necesario para tener la mercancía lista; el flete es un CAMIÓN que llega a
 * Santa Martha, y la cuenta depende de quién lo asume. En el lado a lado, el
 * mismo flete se desliza de «Parte del costo» a «Gasto de venta» al cambiar
 * de empresa.
 *
 * Pantallas (los datos, en contabilidadT7_1_a5_c3.js):
 *   1 portada · 2 la regla («Pasar a pesos» abre «Seguir») · 3 importados
 *   (las fichas, en la figura; con el acierto caen las tres capas) · 4 el
 *   viaje de la compra (FOB y C&F, C1 con F-1 a F-3 de Mello, AHORA DENTRO
 *   DEL MOTOR: condición 2) · 5 y 6 los fletes (las cuentas en la figura;
 *   con el acierto, el asiento del flete partido) · 7 lado a lado (A5-1 de
 *   Mello y M-1) · 8 resumen.
 *
 * El viaje dentro del motor: su estado vive en `s.fig.viaje` (ctx.fig). El
 * texto de FOB es la `consigna` de la pantalla (el motor la enfoca al
 * llegar) y se va al pasar a C&F (`antes`, M-1); el de C&F va en la figura.
 * Su escalera es la de Near y Mello (comprobarFOB y confirmarCyF, las de la
 * pieza de hoy): 1.er error, la retro o la pista, y se puede volver a
 * intentar; 2.º, la respuesta. Las marcas: coral con «No va aquí» en lo
 * tocado mal; la respuesta, en borde blanco. «Seguir» del motor no se ve
 * en el paso de FOB: ahí manda el «Seguir» del paso (no hay dos).
 *
 * [PROVISIONAL PARA WATARI] La línea del viaje, en las clases del motor (c3-),
 * hasta que Watari la dibuje en el C3.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const F = FIGURA_A5;
const VIAJE = "fob-cif-cyf";

export const CSS_A5_C3 = `
/* C3 · A5 «Importados y fletes» (a5.css de Watari, con c3- en lugar de c2-). */
.a5-etiqueta { padding: 12px 14px 14px; display: grid; gap: 10px; border-radius: 6px 18px 18px 6px; }
.a5-etq-tit { margin: 0; display: flex; align-items: center; gap: 8px; font: 600 14px/1.3 "Sora", sans-serif; }
.a5-ojal { width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--neutro); flex: none; }
.a5-capas { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
.a5-capa { padding: 8px 10px; border-radius: 8px; background: rgba(184,196,212,.12); border-left: 3px solid var(--neutro); font-size: 13px; line-height: 1.35; }
.a5-capa small { display: block; color: var(--atenuado); font-size: 12px; }
.a5-capa.hueco { background: transparent; border: 1px dashed rgba(248,249,250,.35); color: var(--atenuado); }
.a5-capa.nuevo { animation: c3-cae .4s cubic-bezier(.3,.9,.4,1) both; }
.a5-capa.nuevo:nth-child(3) { animation-delay: .12s; } .a5-capa.nuevo:nth-child(4) { animation-delay: .24s; }
.a5 .c3-boton { justify-self: start; }
/* 44 px de alto, dichos aquí también (el motor ya los da): lo pide alto-de-boton-celula-c, que lee este archivo. */
.a5 .c3-op, .a5 .c3-boton, .a5 .c3-seguir { min-height: 44px; }
.a5 .c3-roles button { min-height: 44px; }
.a5 .c3-op.rebota { animation: a5-rebota .35s cubic-bezier(.3,.9,.4,1); }
@keyframes a5-rebota { 0% { transform: translateY(0); } 40% { transform: translateY(-10px); } 100% { transform: translateY(0); } }
.a5-ruta { padding: 12px 14px; display: grid; gap: 8px; }
.a5-extremos { display: flex; justify-content: space-between; gap: 8px; }
.a5-lugar { display: grid; gap: 1px; padding: 6px 10px; border: 1px solid rgba(248,249,250,.35); border-radius: 8px; font-size: 13px; }
.a5-lugar:last-child { text-align: right; }
.a5-lugar small { color: var(--atenuado); font-size: 12px; }
.a5-lugar.asume { border-style: dashed; border-color: var(--neutro); }
.a5-via { overflow: hidden; border-bottom: 2px dashed rgba(248,249,250,.35); padding-bottom: 4px; }
.a5-carril { display: flex; justify-content: flex-end; }
.a5-carril.anda { animation: a5-anda .9s cubic-bezier(.3,.9,.4,1) both; }
@keyframes a5-anda { from { transform: translateX(-70%); } to { transform: none; } }
.a5-camion { display: inline-flex; align-items: center; gap: 6px; color: var(--texto); }
.a5-camion svg { width: 28px; height: 28px; flex: none; }
.a5-camion b { font-size: 13px; padding: 2px 8px; border: 1px solid var(--neutro); border-radius: 6px; }
.a5-asume { margin: 0; font-size: 13px; color: var(--atenuado); } .a5-asume b { color: var(--texto); }
/* El viaje de la compra (C1), dentro del motor. [PROVISIONAL PARA WATARI] */
.a5-viaje { padding: 12px; display: grid; gap: 10px; min-width: 0; }
.a5-viaje-txt { margin: 0; font-size: 15px; line-height: 1.5; outline: none; }
.a5-tramos { margin: 0; padding: 0 0 0 14px; list-style: none; display: grid; gap: 8px; border-left: 2px solid var(--neutro); }
.a5-tramos > li { list-style: none; display: grid; gap: 6px; min-width: 0; transition: opacity .2s; }
.a5-tramos > li.atenuado { opacity: .45; }
.a5-mar-rot { font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: var(--atenuado); }
.a5-mar { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.a5-ficha { position: relative; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 8px; min-height: 44px; width: 100%; padding: 8px 10px 12px; margin: 0;
  border: 1px solid rgba(248,249,250,.35); border-radius: 10px; background: transparent; color: var(--texto); font: 500 14px/1.35 "Inter", sans-serif; text-align: left; overflow-wrap: anywhere; min-width: 0; }
button.a5-ficha { cursor: pointer; }
.a5-ficha[aria-pressed="true"] { border: 2px solid var(--texto); padding: 7px 9px 11px; }
.a5-ficha.mal { border: 2px solid var(--coral); padding: 7px 9px 11px; }
.a5-caja { width: 18px; height: 18px; border: 2px solid var(--neutro); border-radius: 4px; display: inline-grid; place-items: center; font: 700 12px/1 "Inter", sans-serif; color: #0E1B2E; flex: none; }
.a5-ficha[aria-pressed="true"] .a5-caja { background: var(--neutro); }
.a5-ficha-tx { flex: 1 1 auto; min-width: 0; }
/* Quién paga: lisa, el vendedor; rayada, el comprador. Neutro: no son debe ni haber. */
.a5-paga { position: absolute; left: 10px; right: 10px; bottom: 4px; height: 5px; border-radius: 3px; }
.a5-paga-vendedor { background: var(--neutro); }
.a5-paga-comprador { background: repeating-linear-gradient(135deg, var(--neutro) 0 3px, transparent 3px 6px); border: 1px solid var(--neutro); }
.a5-leyenda { margin: 0; display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; line-height: 1.3; }
.a5-leyenda > span { display: inline-flex; align-items: center; gap: 6px; }
.a5-leyenda i { display: inline-block; width: 22px; height: 6px; border-radius: 3px; }
.a5-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.a5-viaje-msg { outline: none; }
.a5-viaje-msg [data-mensaje] { margin-top: 0 !important; }
`;

const CAMION = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" />
  </svg>
);

/* ═══════════ LAS FIGURAS ═══════════ */

/* Las opciones que se pintan dentro de la figura (fichas o cuentas), con la escalera C2 del motor. */
function OpcionesEnFigura({ ctx, clase }) {
  const { s, P } = ctx;
  const res = Boolean(s.resuelto[P.id]);
  return (
    <div className={`c3-ops ${clase}`} role="group" aria-label={F.opciones}>
      {ctx.ordenar(P.opciones).map((o) => {
        const m = ctx.marca(o.id);
        const rebota = m === "mal" && ctx.evento === "error" && !ctx.reducido;
        return (
          <button key={o.id} type="button" className={`c3-op${m ? ` ${m}` : ""}${rebota ? " rebota" : ""}`} data-op={o.id}
            aria-disabled={res ? "true" : undefined} aria-label={`${o.t}${m === "mal" ? `. ${LECTOR_INCORRECTO}` : m === "bien" ? ". Correcto." : ""}`}
            onClick={() => ctx.elegir(o.id)}>
            <span>{o.t}</span>{m === "mal" && <Pastilla marca={TACHADA} />}{m === "bien" && <Pastilla marca={CORRECTA} />}
          </button>
        );
      })}
    </div>
  );
}

/* La etiqueta del costo: la factura arriba y lo que el libro le suma debajo. */
function Etiqueta({ ctx }) {
  const { s, P } = ctx;
  const enPesos = Boolean(s.fig.pesos) || P.id === "importados";
  const res = Boolean(s.resuelto.importados);
  const cae = ctx.evento === "acierto" && !ctx.reducido ? " nuevo" : "";
  return (
    <section className="a5-etiqueta c3-hundido" aria-label={F.etiqueta} data-etiqueta>
      <p className="a5-etq-tit"><span className="a5-ojal" aria-hidden="true" />{F.etiqueta}</p>
      <ul className="a5-capas">
        <li className="a5-capa base" data-capa="factura">{enPesos ? F.facturaEnPesos : F.factura} <small>{enPesos ? F.facturaTasa : F.facturaMoneda}</small></li>
        {res
          ? F.capas.map((c) => <li key={c} className={`a5-capa${cae}`} data-capa>{c}</li>)
          : <li className="a5-capa hueco" data-capa="hueco">{F.hueco}</li>}
      </ul>
    </section>
  );
}

/* El camino del flete y, con el acierto, el asiento del flete partido (la cuenta elegida en el debe). */
function Ruta({ ctx }) {
  const { s, P } = ctx;
  const res = Boolean(s.resuelto[P.id]);
  const anda = ctx.evento === "entra" && !ctx.reducido;
  const cuenta = P.opciones.find((o) => o.correcta).t;
  const n = ctx.evento === "acierto" && !ctx.reducido ? " nuevo" : "";
  return (
    <>
      <section className="a5-ruta c3-hundido" aria-label={F.ruta} data-ruta>
        <div className="a5-extremos">
          <span className={`a5-lugar${P.quien === P.desde ? " asume" : ""}`}><b>{P.desde}</b><small>{F.vende}</small></span>
          <span className={`a5-lugar${P.quien === F.comprador ? " asume" : ""}`}><b>{F.comprador}</b><small>{F.compra}</small></span>
        </div>
        <div className="a5-via"><span className={`a5-carril${anda ? " anda" : ""}`}><span className="a5-camion">{CAMION}<b className="c3-num">{F.flete} {pesos(FLETE_A5.flete)}</b></span></span></div>
        <p className="a5-asume">{F.asume} <b>{P.quien}</b>, {P.rolQuien}</p>
        <p className="c3-rotulo">{F.tarifas}</p>
      </section>
      {!res && <><p className="c3-preg" data-cuentas-de>{F.cuentasDe[P.quien]}</p><OpcionesEnFigura ctx={ctx} clase="a5-cuentas" /></>}
      {res && (
        <div className="c3-t c3-hundido" data-asiento>
          <p className="c3-t-tit">{F.asiento}</p>
          <div className="c3-t-lados">
            <div className="c3-lado" data-lado="debe"><span className="c3-lado-cab"><span className="c3-lado-rot">{ctx.interfaz.debe}</span></span>
              <span className={`c3-ren${n}`}><span>{cuenta}</span><b className="c3-num">{pesos(FLETE_A5.flete)}</b><Pastilla marca={CORRECTA} /></span></div>
            <div className="c3-lado" data-lado="haber"><span className="c3-lado-cab"><span className="c3-lado-rot">{ctx.interfaz.haber}</span></span>
              <span className={`c3-ren${n}`}><span>{F.retencion}</span><b className="c3-num">{pesos(FLETE_A5.retencion)}</b></span>
              <span className={`c3-ren${n}`}><span>{F.pago}</span><b className="c3-num">{pesos(FLETE_A5.pago)}</b></span></div>
          </div>
        </div>
      )}
    </>
  );
}

/* El lado a lado: A5-1 de Mello (sin rótulo arriba; «Empresa»; «Santa Martha» y «La Popa»). */
function LadoALado({ ctx }) {
  const vende = ctx.s.fig.asume === "vendedor";
  const quien = vende ? "vendedor" : "comprador";
  const elegir = (q) => ctx.fig(q === "vendedor" ? { asume: q, vio: true } : { asume: q });
  return (
    <>
      <div className="c3-roles" role="group" aria-label={F.empresa}>
        {["comprador", "vendedor"].map((q) => (
          <button key={q} type="button" data-accion="asume" data-asume={q} aria-pressed={String(quien === q)} className={quien === q ? "on" : ""} onClick={() => elegir(q)}>{F.empresas[q]}</button>
        ))}
      </div>
      <Cruce clave="flete" rotulos={F.columnas} fichas={[{
        key: "flete", der: vende,
        contenido: <><span>{F.empresas[quien]} · {F.pagado}</span><b className="c3-num">{pesos(FLETE_A5.flete)}</b><span>{F.cuentas[quien]}</span></>,
      }]} />
    </>
  );
}

/* ═══════════ EL VIAJE DE LA COMPRA (C1, con F-1 a F-3), DENTRO DEL MOTOR ═══════════ */

export const VIAJE_INICIAL = { paso: 0, p1: { marcadas: [], errores: 0, resuelto: false, peldano: null, texto: "", malas: [] }, p2: { intento: null, errores: 0, resuelto: false, peldano: null, texto: "" }, respondio: 0, cambio: 0 };

/* Las transiciones del viaje (puras): tocar una ficha, «Comprobar», pasar a C&F, elegir en C&F. */
export function tocarFicha(v, id) {
  if (v.paso !== 0 || v.p1.resuelto) return v;
  const marcadas = v.p1.marcadas.includes(id) ? v.p1.marcadas.filter((m) => m !== id) : [...v.p1.marcadas, id];
  return { ...v, p1: { ...v.p1, marcadas, malas: v.p1.malas.filter((m) => m !== id) } };
}
export function comprobar(v, pantalla) {
  if (v.paso !== 0 || v.p1.resuelto || !v.p1.marcadas.length) return v;
  const r = comprobarFOB(pantalla, v.p1.marcadas, v.p1.errores);
  return { ...v, p1: { ...v.p1, ...r, errores: r.peldano === "acierto" ? v.p1.errores : v.p1.errores + 1 }, respondio: v.respondio + 1 };
}
export const alPaso2 = (v) => (v.paso === 0 && v.p1.resuelto ? { ...v, paso: 1, cambio: v.cambio + 1 } : v);
export function elegirCyF(v, pantalla, id) {
  if (v.paso !== 1 || v.p2.resuelto) return v;
  const r = confirmarCyF(pantalla, id, v.p2.errores);
  return { ...v, p2: { ...v.p2, ...r, intento: r.peldano === "acierto" ? null : id, errores: r.peldano === "acierto" ? v.p2.errores : v.p2.errores + 1 }, respondio: v.respondio + 1 };
}

function Viaje({ ctx }) {
  const V = ctx.P;
  const v = ctx.s.fig.viaje ?? VIAJE_INICIAL;
  const cambiar = (fn) => ctx.fig((f) => ({ viaje: fn(f.viaje ?? VIAJE_INICIAL) }));
  const msg = useRef(null);
  const txt = useRef(null);
  useEffect(() => { if (v.respondio) msg.current?.focus({ preventScroll: true }); }, [v.respondio]);
  useEffect(() => { if (v.cambio) txt.current?.focus({ preventScroll: true }); }, [v.cambio]);
  const paso = V.pasos[v.paso];
  const p = v.paso === 0 ? v.p1 : v.p2;
  const estado = p.resuelto ? (p.peldano === "acierto" ? "acierto" : "respuesta") : p.peldano ? "error" : "colocando";
  const leyenda = v.paso === 1 || v.p1.resuelto;

  const ficha = (t, f) => {
    const quien = marcaDe(V, t, f, v);
    const marca = quien && <><i className={`a5-paga a5-paga-${quien}`} aria-hidden="true" data-paga={quien} /><span className="a5-sr">{V.leyenda[quien]}</span></>;
    if (v.paso === 0 && !v.p1.resuelto) {
      const marcada = v.p1.marcadas.includes(f.id);
      const mal = v.p1.malas.includes(f.id);
      return (
        <button key={f.id} type="button" className={`a5-ficha${mal ? " mal" : ""}`} data-ficha={f.id} aria-pressed={String(marcada)}
          aria-label={`${f.texto}${mal ? `. ${LECTOR_INCORRECTO}` : ""}`} onClick={() => cambiar((x) => tocarFicha(x, f.id))}>
          <span className="a5-caja" aria-hidden="true">{marcada ? "✓" : ""}</span>
          <span className="a5-ficha-tx">{f.texto}</span>
          {mal && <Pastilla marca={TACHADA} />}
        </button>
      );
    }
    return <span key={f.id} className="a5-ficha" data-ficha={f.id} data-paga={quien ?? undefined}><span className="a5-ficha-tx">{f.texto}</span>{marca}</span>;
  };

  return (
    <div className="a5-viaje c3-hundido" data-viaje={V.id} data-paso={paso.id} data-estado={estado}>
      {/* En el paso de FOB, el «Seguir» del motor no se ve: manda el del paso. */}
      {v.paso === 0 && <style>{`.c3.a5[data-pantalla="${VIAJE}"] > .c3-seguir { display: none; }`}</style>}
      {v.paso === 1 && <p ref={txt} tabIndex={-1} className="a5-viaje-txt" data-texto-paso>{paso.texto}</p>}
      <div role="group" aria-label={V.nombre} data-linea>
        <ol className="a5-tramos">
          {V.tramos.map((t) => {
            const atenuado = v.paso === 1 && t.tierra;
            return (
              <li key={t.id} className={atenuado ? "atenuado" : undefined} data-tramo={t.id} data-atenuado={atenuado ? "si" : undefined}>
                {t.tierra ? ficha(t, t.fichas[0]) : <><span className="a5-mar-rot" data-rotulo>{t.rotulo}</span><div className="a5-mar">{t.fichas.map((f) => ficha(t, f))}</div></>}
              </li>
            );
          })}
        </ol>
      </div>
      {leyenda && <p className="a5-leyenda" data-leyenda>{["vendedor", "comprador"].map((q) => <span key={q}><i className={`a5-paga-${q}`} aria-hidden="true" />{V.leyenda[q]}</span>)}</p>}
      {v.paso === 1 && (
        <div className="c3-ops" role="group" aria-label={paso.texto}>
          {ctx.ordenar(paso.opciones, `${V.id}:${paso.id}`).map((o) => {
            const mal = !v.p2.resuelto && v.p2.intento === o.id;
            const revela = v.p2.resuelto && v.p2.peldano === "respuesta" && o.correcta;
            const bien = v.p2.resuelto && v.p2.peldano === "acierto" && o.correcta;
            const m = mal ? "mal" : revela ? "pista" : bien ? "bien" : "";
            return (
              <button key={o.id} type="button" className={`c3-op${m ? ` ${m}` : ""}`} data-op={o.id} aria-disabled={v.p2.resuelto ? "true" : undefined}
                aria-label={`${o.texto}${mal ? `. ${LECTOR_INCORRECTO}` : bien ? ". Correcto." : ""}`} onClick={() => cambiar((x) => elegirCyF(x, V, o.id))}>
                <span>{o.texto}</span>{mal && <Pastilla marca={TACHADA} />}{bien && <Pastilla marca={CORRECTA} />}
              </button>
            );
          })}
        </div>
      )}
      {v.paso === 0 && !v.p1.resuelto && (
        <button type="button" className="c3-boton" data-boton="comprobar" aria-disabled={String(!v.p1.marcadas.length)} onClick={() => cambiar((x) => comprobar(x, V))}>{paso.boton}</button>
      )}
      <div ref={msg} tabIndex={-1} className="a5-viaje-msg" data-viaje-msg>
        <RegionViva>{p.peldano && <Mensaje ok={p.peldano === "acierto"} texto={p.texto} />}</RegionViva>
      </div>
      {v.paso === 0 && v.p1.resuelto && (
        <button type="button" className="c3-seguir" data-boton="seguir-paso" onClick={() => cambiar(alPaso2)}>{ctx.interfaz.seguir}</button>
      )}
    </div>
  );
}

/* ═══════════ LA PIEZA PARA EL MOTOR ═══════════ */

/* Lo que no es texto: cuándo se puede seguir, cuándo sale la pregunta. */
const CONDUCTA = {
  "la-regla-del-costo": { listo: (s) => Boolean(s.fig.pesos) },
  [VIAJE]: { listo: (s) => Boolean(s.fig.viaje?.p2.resuelto), antes: (s) => (s.fig.viaje?.paso ?? 0) === 1 },
  "lado-a-lado": { antes: (s) => Boolean(s.fig.vio) },
};

/* Los datos (con `texto` en las opciones) en la forma del motor (`t`). El viaje: su texto de FOB, como consigna. */
export function piezaParaElMotor(pieza) {
  return {
    id: pieza.id,
    titulo: pieza.titulo,
    clase: "a5",
    fig: { asume: "comprador" },
    pantallas: pieza.pantallas.map((p) => ({
      ...p,
      ...(p.opciones ? { opciones: p.opciones.map((o) => ({ ...o, t: o.texto })) } : {}),
      ...(p.id === VIAJE ? { tipo: "lectura", texto: "", consigna: p.pasos[0].texto } : {}),
      ...(CONDUCTA[p.id] ?? {}),
    })),
    figura(ctx) {
      const { P, s } = ctx;
      if (P.id === "lado-a-lado") return <LadoALado ctx={ctx} />;
      if (P.id === VIAJE) return <Viaje ctx={ctx} />;
      if (["portada", "la-regla-del-costo", "importados"].includes(P.id)) {
        return (
          <>
            <Etiqueta ctx={ctx} />
            {P.id === "la-regla-del-costo" && (
              <button type="button" className="c3-boton" data-accion="pesos" aria-disabled={s.fig.pesos ? "true" : undefined}
                onClick={() => { if (!s.fig.pesos) ctx.fig({ pesos: true }); }}>{F.pasarAPesos}</button>
            )}
            {P.id === "importados" && <OpcionesEnFigura ctx={ctx} clase="a5-fichas" />}
          </>
        );
      }
      if (P.desde) return <Ruta ctx={ctx} />;
      return null;
    },
  };
}

export default function ImportadosYFletesC3({ pieza = PIEZA_IMPORTADOS_Y_FLETES_C3, rotulo, barajar }) {
  const motor = piezaParaElMotor(pieza);
  return (
    <>
      <style>{CSS_A5_C3}</style>
      <AprenderC3 pieza={motor} rotulo={rotulo} barajar={barajar} />
    </>
  );
}
