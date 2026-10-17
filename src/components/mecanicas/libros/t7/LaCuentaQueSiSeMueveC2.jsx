import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { Panel } from "../../salaDeControl/marco.jsx";
import { barajar } from "../../../../utils/barajar.js";
import { PIEZA_LA_CUENTA_C2, PANTALLAS_C2, HECHOS, INICIO, MAX, INTERFAZ_C2 as T, renglonDe } from "../../../../data/contabilidadT7_2_a1_c2.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · PIEZA 1 DE APRENDER — «La cuenta que sí se mueve», RENOVADA (C2).
 *
 * La «Pieza 2» del Patrón de enganche C2 de Watari (16-oct-2026), pasada a
 * un componente de la casa: arriba la bodega, abajo la cuenta T de
 * Inventario de mercancías. Cada hecho de la lista del libro se ubica
 * tocando el Debe o el Haber de la cuenta, y al acertar las cajas entran o
 * salen de la bodega, el renglón cae en su lado y la barra del saldo se
 * ajusta, todo a la vez. Sin una sola cifra (regla 3). Cinco pantallas.
 *
 * MECÁNICA REPETIDA (Mello la acepta con esta línea escrita en la ficha):
 * tocar el lado de una cuenta ya se usó más de cuatro veces; aquí va porque
 * «es la pareja de T7-1 A1; aquí el toque mueve el modelo».
 *
 * La lógica es la del código de referencia de la C2, paso por paso (ubicar,
 * elegir, contar, abrir el porqué, seguir), escrita como funciones puras
 * sobre el estado, con las correcciones OBLIGATORIAS de Mello
 * (auditoria-mello-patron-c2.md, sección 2):
 *   · Cu-1  Costo de la mercancía vendida aparece al acertar la pantalla 3
 *           (no antes) y trae ya la venta anterior y «Otra venta», nuevo
 *   · Cu-2  el debe arranca con «Saldo inicial» (las cajas del inicio): el
 *           saldo es debe menos haber en todo momento
 *   · Cu-3  el porqué de la pantalla 3 va plegado en «¿Por qué?»
 *
 * Escalera C2 (Aprender): 1.er error, la pista de Near; 2.º, la devolución
 * de Near con el lado o la opción buena marcados en blanco. Nunca «Iba
 * aquí». No califica y no da FP.
 *
 * Lo que este componente pone y la C2 no (lo pide la casa):
 *   · los lados son botones de verdad mientras hay un hecho por ubicar (en
 *     la C2, div con role=button)
 *   · al responder, el foco va al mensaje; al abrir el porqué, al porqué
 *   · letra mínima de 12 px (la C2 tiene 10,5 en «Pantalla n de 5»)
 *   · «Siguiente pieza» lleva el foco a la pieza siguiente de la vista
 *   · cada pantalla se puede montar sola, en el estado de llegar a ella
 *   · sin el fondo propio de la raíz: la pieza va sobre el del panel
 *
 * Teal y ámbar solo en los rótulos DEBE y HABER; coral solo en el error; el
 * acierto, con ✓ y borde neutro. Clases con el prefijo `t7cs-` (`c2-` y
 * `c2c-` en la C2). Movimiento reducido: sin animación y en el estado final.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Cuánto dura la salida de una caja: el de la C2. */
export const TIEMPOS = { sale: 360 };

export const CSS_T7CS = `
/* T7-2 A1 · la bodega y su cuenta, en paralelo (C2 de Watari). Teal y ámbar solo en DEBE y HABER. */
.t7cs { --texto: #F8F9FA; --atenuado: #A8B6C8; --neutro: #B8C4D4;
  --teal-texto: #3FA69A; --ambar: #E9C46A; --coral: #E76F51; --coral-texto: #EE8266; /* lado */
  --hundido: rgba(10,20,34,.45); --hundido-borde: rgba(248,249,250,.12);
  display: grid; gap: 12px; color: var(--texto); font: 400 15px/1.5 "Inter", system-ui, sans-serif; min-width: 0; outline: none; }
.t7cs * { box-sizing: border-box; }
.t7cs :focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
.t7cs-cejilla { margin: 0; font: 700 12px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--atenuado); }
.t7cs-txt { margin: 0; font-size: 15px; line-height: 1.5; outline: none; }
.t7cs-pie { margin: 0; font-size: 12px; color: var(--atenuado); }
.t7cs-hundido { background: var(--hundido); border: 1px solid var(--hundido-borde); border-radius: 12px; }
.t7cs-solo-lector { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.t7cs-pastilla { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px 2px 6px; border-radius: 999px; font: 600 12px/1.3 "Inter", sans-serif; white-space: nowrap; }
.t7cs-pastilla svg { width: 16px; height: 16px; flex: none; }
.t7cs-pastilla.ok { color: var(--texto); border: 1px solid var(--texto); }
.t7cs-pastilla.mal { color: var(--coral-texto); border: 1px solid var(--coral); }
.t7cs-msg { margin: 0; padding: 10px 12px; background: rgba(184,196,212,.12); border-left: 3px solid var(--neutro); border-radius: 0 10px 10px 0; font-size: 14px; line-height: 1.45; outline: none; }
.t7cs-msg:empty { display: none; }
.t7cs-msg.mal { border-left-color: var(--coral); }
.t7cs-msg .t7cs-pastilla { margin-right: 6px; vertical-align: 1px; }
.t7cs-porque { margin-top: 6px; min-height: 44px; padding: 0 14px; border: 1px solid rgba(248,249,250,.35); border-radius: 999px; background: transparent; color: var(--texto); font: 600 13px/1 "Inter", sans-serif; cursor: pointer; }
.t7cs-msg p { margin: 0; outline: none; } .t7cs-msg p + p { margin-top: 6px; }
.t7cs-seguir { width: 100%; min-height: 44px; border: 0; cursor: pointer; font: 700 14px/1.2 "Sora", sans-serif; padding: 12px 16px; background: var(--neutro); color: #1D3557; border-radius: 12px; }
.t7cs-seguir[aria-disabled="true"] { background: transparent; color: var(--atenuado); border: 2px solid rgba(184,196,212,.35); cursor: default; }
.t7cs-fig { display: grid; gap: 10px; transition: opacity .2s; }
.t7cs.dormida .t7cs-fig { opacity: .55; }
.t7cs-hecho { margin: 0; justify-self: start; padding: 5px 12px; border: 1px dashed var(--neutro); border-radius: 999px; font: 600 13px/1.3 "Inter", sans-serif; }
.t7cs-hecho[hidden], .t7cs-txt[hidden], .t7cs-lista[hidden], .t7cs-conteo[hidden], .t7cs-t[hidden] { display: none; }
/* La bodega: cajas en la paleta (neutro), no café. */
.t7cs-bodega { display: grid; gap: 4px; }
.t7cs-estante { min-height: 34px; display: flex; flex-wrap: wrap; align-content: flex-end; gap: 5px; padding: 0 2px 4px; border-bottom: 2px solid var(--neutro); }
.t7cs-caja { position: relative; width: 24px; height: 22px; border-radius: 4px; background: #B8C4D4; border: 1px solid #F8F9FA; display: grid; place-items: center; font: 700 12px/1 "Inter", sans-serif; color: #1D3557; }
.t7cs-caja::before { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; width: 4px; margin-left: -2px; background: rgba(29,53,87,.25); }
.t7cs-caja.llega { animation: t7cs-llega .36s cubic-bezier(.3,.9,.4,1) both; }
@keyframes t7cs-llega { from { transform: translateX(-36px); opacity: 0; } to { transform: none; opacity: 1; } }
.t7cs-caja.sale { transition: transform .34s cubic-bezier(.3,.9,.4,1), opacity .34s; transform: translateX(40px); opacity: 0; }
.t7cs-caja.contada::after { content: attr(data-n); position: relative; z-index: 1; }
.t7cs-rot { margin: 0; font-size: 12px; color: var(--atenuado); }
/* Las cuentas T: el contenedor hundido de Cuentas. */
.t7cs-cuentas { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); }
.t7cs-t { padding: 10px 12px; display: grid; gap: 8px; min-width: 0; }
.t7cs-t-nombre { margin: 0; padding-bottom: 6px; border-bottom: 2px solid var(--neutro); font: 600 13px/1.3 "Sora", sans-serif; }
.t7cs-t-lados { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.t7cs-lado { display: grid; align-content: start; gap: 6px; min-height: 64px; min-width: 0; padding: 6px 8px; border: 0; border-radius: 8px; background: transparent; color: inherit; font: inherit; text-align: left; margin: 0; }
.t7cs-lado[data-lado="debe"] { border-right: 2px solid var(--neutro); border-radius: 8px 0 0 8px; }
.t7cs-lado-rot { font: 700 12px/1.3 "Inter", sans-serif; letter-spacing: .06em; }
.t7cs-lado[data-lado="debe"] .t7cs-lado-rot { color: var(--teal-texto); }
.t7cs-lado[data-lado="haber"] .t7cs-lado-rot { color: var(--ambar); }
.t7cs-sub { font-size: 12px; color: var(--atenuado); margin-top: -4px; }
/* Mientras hay un hecho por ubicar, los dos lados son botones: contorno de reposo, 88 px de alto. */
.t7cs-lado.blanco { min-height: 88px; cursor: pointer; outline: 1px solid rgba(248,249,250,.35); outline-offset: -1px; }
.t7cs-lado.blanco:focus-visible { outline: 2px solid #F8F9FA; outline-offset: 2px; }
.t7cs-lado.blanco.mal { outline: 2px solid var(--coral); outline-offset: -2px; }
.t7cs-lado.blanco.pista { outline: 2px solid var(--texto); outline-offset: -2px; }
.t7cs-lado .t7cs-pastilla { justify-self: start; }
.t7cs-barras { display: grid; gap: 6px; }
.t7cs-renglon { display: grid; gap: 2px; font-size: 12px; line-height: 1.3; color: var(--atenuado); overflow-wrap: anywhere; }
.t7cs-renglon i, .t7cs-saldo-barra, .t7cs-conteo-barra { display: block; height: 10px; border-radius: 3px; background: rgba(184,196,212,.55); border: 1px solid var(--neutro); transform-origin: left center; transform: scaleX(var(--l)); }
.t7cs-renglon.nuevo { animation: t7cs-cae .4s cubic-bezier(.3,.9,.4,1) .15s both; }
@keyframes t7cs-cae { from { transform: translateY(-14px); opacity: 0; } to { transform: none; opacity: 1; } }
.t7cs-saldo-barra, .t7cs-conteo-barra { transition: transform .45s cubic-bezier(.3,.9,.4,1); height: 12px; }
.t7cs-conteo-barra { background: transparent; border-style: dashed; }
.t7cs-saldo, .t7cs-conteo { display: grid; grid-template-columns: 58px minmax(0, 1fr); align-items: center; gap: 8px; }
.t7cs-saldo-rot { font: 600 12px/1.3 "Inter", sans-serif; color: var(--atenuado); }
.t7cs-saldo-pista { display: block; }
.t7cs-acc:empty { display: none; }
.t7cs-acc { display: grid; gap: 8px; }
.t7cs-boton { min-height: 44px; border-radius: 12px; border: 2px solid var(--neutro); background: transparent; color: var(--texto); font: 600 15px/1.2 "Inter", sans-serif; cursor: pointer; padding: 10px 14px; }
.t7cs-ops { display: grid; gap: 8px; }
.t7cs-op { min-height: 44px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 8px; padding: 10px 12px; border: 1px solid rgba(248,249,250,.35); border-radius: 12px; background: transparent; color: var(--texto); font: 500 14px/1.35 "Inter", sans-serif; text-align: left; cursor: pointer; }
.t7cs-op[aria-disabled="true"] { cursor: default; }
.t7cs-op.mal { border: 2px solid var(--coral); padding: 9px 11px; }
.t7cs-op.pista, .t7cs-op.bien { border: 2px solid var(--texto); padding: 9px 11px; }
.t7cs-lista { margin: 0; padding: 10px 12px 10px 28px; display: grid; gap: 6px; font-size: 14px; border-left: 3px solid var(--neutro); }
.t7cs-lista li { list-style: disc; }
.t7cs-lista li.t7cs-sig { list-style: none; margin-left: -16px; color: var(--atenuado); font-size: 13px; }
@media (prefers-reduced-motion: reduce) { .t7cs *, .t7cs *::before, .t7cs *::after { animation: none !important; transition: none !important; } }
`;

/* ═══════════ EL ESTADO (funciones puras: cada acción devuelve el estado nuevo) ═══════════ */

const ORDEN = PANTALLAS_C2.map((p) => p.id);
const llenar = (t, vars) => t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));
const vivasDe = (s) => s.estante.filter((c) => !c.sale);

/* La bodega sigue a s.cajas: llegan cajas nuevas o salen las últimas vivas (con animación solo si `animar`). */
function conBodega(s, animar) {
  let uid = s.uid;
  const vivas = vivasDe(s);
  let estante = s.estante;
  if (s.cajas > vivas.length) {
    const nuevas = Array.from({ length: s.cajas - vivas.length }, () => ({ uid: ++uid, sale: false, llega: animar }));
    estante = [...estante, ...nuevas];
  } else if (s.cajas < vivas.length) {
    const salen = new Set(vivas.slice(s.cajas).map((c) => c.uid));
    estante = animar ? estante.map((c) => (salen.has(c.uid) ? { ...c, sale: true } : c)) : estante.filter((c) => !salen.has(c.uid));
  }
  return { ...s, estante, uid };
}

/* Un renglón nuevo de la cuenta. */
const renglon = (s, lado, cajas, rot) => ({ uid: s.uid + 1000 + s.renglones.length, lado, cajas, rot });

/** Cuál pantalla es (índice en las cinco de la pieza, aunque se monte desde la mitad). */
export const absoluta = (s) => s.k0 + s.p;

export function estaListo(P, s) {
  if (P.boton) return true;
  if (P.lados) return s.hecho >= HECHOS.length;
  if (P.opciones) return Boolean(s.resuelto[P.id]);
  return true;
}

/* Fallar: el 1.er error da la pista; el 2.º y siguientes, la devolución y lo bueno en blanco. */
function fallar(s, P, clave, id, mal) {
  const errores = { ...s.errores, [clave]: (s.errores[clave] ?? 0) + 1 };
  const segundo = errores[clave] >= 2;
  return { ...s, errores, intento: id, pista: segundo || s.pista, msg: { tipo: "mal", t: segundo ? mal : P.pista }, nuevo: null };
}

/** Tocar un lado de Inventario de mercancías con el hecho que está por ubicar. */
export function ubicar(s, P, lado, reducido) {
  const H = HECHOS[s.hecho];
  if (!P.lados || !H) return s;
  if (lado !== H.lado) return fallar(s, P, H.id, lado, H.devolucion);
  /* Mira esto: las cajas entran o salen de la bodega y, en el mismo instante, el renglón cae en su lado y el saldo cambia. */
  const r = renglon(s, H.lado, H.cajas, renglonDe(H.texto));
  const hecho = s.hecho + 1;
  const fin = hecho >= HECHOS.length;
  const t = {
    ...s, cajas: s.cajas + (H.lado === "debe" ? H.cajas : -H.cajas), renglones: [...s.renglones, r], hecho, intento: null, pista: false, nuevo: r.uid,
    msg: fin ? { tipo: "ok", t: P.bien, porque: P.porque, vista: Boolean(P.porqueALaVista) } : { tipo: "ok", t: "" },
  };
  return conBodega(t, !reducido);
}

/** Elegir una opción de las pantallas 3 y 4. */
export function elegir(s, P, id, reducido) {
  if (!P.opciones || s.resuelto[P.id]) return s;
  if (id !== P.correcta) return fallar(s, P, P.id, id, P.mal[id]);
  const t = { ...s, resuelto: { ...s.resuelto, [P.id]: true }, intento: null, pista: false, msg: { tipo: "ok", t: P.bien, porque: P.porque, vista: Boolean(P.porqueALaVista) }, nuevo: null };
  if (!P.cmv) return t;
  /*
   * Mira esto: una venta. Sale una caja, y en el mismo instante cae un renglón en el Haber de Inventario y otro en
   * el Debe del costo. Cu-1 de Mello: la cuenta del costo aparece ahora y trae ya la venta anterior; solo cae el nuevo.
   */
  const r = renglon(t, "haber", 1, T.otraVenta);
  const vende = HECHOS.find((h) => h.id === "vende");
  return conBodega({
    ...t, cajas: t.cajas - 1, renglones: [...t.renglones, r], nuevo: r.uid,
    cmv: [{ uid: 1, cajas: vende.cajas, rot: renglonDe(vende.texto), nuevo: false }, { uid: 2, cajas: 1, rot: T.otraVenta, nuevo: true }],
  }, !reducido);
}

export const contar = (s) => ({ ...s, contado: true, nuevo: null });
export const abrirPorque = (s) => (s.msg ? { ...s, msg: { ...s.msg, abierto: true }, nuevo: null } : s);
export const quitarCaja = (s, uid) => ({ ...s, estante: s.estante.filter((c) => c.uid !== uid) });

export function seguir(s, pantallas) {
  return { ...s, p: Math.min(pantallas.length - 1, s.p + 1), intento: null, pista: false, msg: null, nuevo: null, cmv: s.cmv.map((r) => ({ ...r, nuevo: false })) };
}

/*
 * El estado de llegar a la primera pantalla que se monta: si la pieza se
 * monta desde la mitad (como la mide la barra de enganche), lo de las
 * pantallas anteriores ya está hecho, sin animación.
 */
export function estadoInicial(pantallas) {
  const k0 = Math.max(0, ORDEN.indexOf(pantallas[0]?.id));
  let s = {
    k0, p: 0, hecho: 0, cajas: INICIO, uid: 0, estante: [], resuelto: {}, errores: {}, intento: null, pista: false, msg: null, contado: false, cmv: [], nuevo: null,
    /* Cu-2 de Mello: el saldo inicial, en el debe. */
    renglones: [{ uid: 900, lado: "debe", cajas: INICIO, rot: T.saldoInicial }],
  };
  s = conBodega(s, false);
  const P = (id) => PANTALLAS_C2.find((x) => x.id === id);
  if (k0 > ORDEN.indexOf("la-lista-del-libro")) for (const H of HECHOS) s = ubicar(s, P("la-lista-del-libro"), H.lado, true);
  if (k0 > ORDEN.indexOf("el-permanente")) s = elegir(s, P("el-permanente"), P("el-permanente").correcta, true);
  if (k0 > ORDEN.indexOf("el-conteo-en-el-permanente")) s = elegir(contar(s), P("el-conteo-en-el-permanente"), P("el-conteo-en-el-permanente").correcta, true);
  return { ...s, msg: null, nuevo: null, intento: null, pista: false, cmv: s.cmv.map((r) => ({ ...r, nuevo: false })) };
}

/* ═══════════ LA PIEZA ═══════════ */

function Pastilla({ ok }) {
  return ok
    ? <span className="t7cs-pastilla ok"><Check aria-hidden="true" strokeWidth={2.5} />{T.correcto}</span>
    : <span className="t7cs-pastilla mal"><X aria-hidden="true" strokeWidth={2.5} />{T.noVaAqui}</span>;
}

const Renglon = ({ r, nuevo }) => (
  <span className={`t7cs-renglon${nuevo ? " nuevo" : ""}`}><i style={{ "--l": r.cajas / MAX }} /><span>{r.rot}</span></span>
);

const reducidoAhora = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

export default function LaCuentaQueSiSeMueveC2({ pieza = PIEZA_LA_CUENTA_C2, rotulo, barajar: barajarOpciones = barajar }) {
  const pantallas = pieza.pantallas;
  /* Lote V (Mello): las opciones, barajadas UNA vez al montar (como los Hacer de T7 al armar la tanda); el orden no cambia al reintentar. `barajar` se inyecta en las pruebas. */
  const [opciones] = useState(() => Object.fromEntries(pantallas.filter((x) => x.opciones).map((x) => [x.id, barajarOpciones(x.opciones)])));
  const [s, setS] = useState(() => estadoInicial(pantallas));
  const sRef = useRef(s);
  const commit = (t) => { sRef.current = t; setS(t); };
  const relojes = useRef(new Set());
  const despues = (ms, f) => { const id = setTimeout(() => { relojes.current.delete(id); f(); }, ms); relojes.current.add(id); };
  useEffect(() => () => { for (const id of relojes.current) clearTimeout(id); relojes.current.clear(); }, []);

  const marco = useRef(null);
  const txt = useRef(null);
  const msgRef = useRef(null);
  const porqueRef = useRef(null);
  /* A dónde va el foco después de pintar: «txt» al seguir, «msg» al responder, «porque» al abrirlo. */
  const [foco, setFoco] = useState(null);
  useEffect(() => {
    if (!foco) return;
    if (foco.que === "txt") (txt.current?.hidden ? marco.current : txt.current)?.focus({ preventScroll: true });
    else if (foco.que === "porque") porqueRef.current?.focus();
    else msgRef.current?.focus();
  }, [foco]);

  const P = pantallas[s.p];
  const abs = absoluta(s);
  const abierta = Boolean(P.lados) && s.hecho < HECHOS.length;
  const H = HECHOS[s.hecho];

  /* Las cajas que salen se quitan al terminar su animación. */
  const conSalidas = (t) => {
    commit(t);
    for (const c of t.estante) if (c.sale) despues(TIEMPOS.sale, () => commit(quitarCaja(sRef.current, c.uid)));
  };
  const onLado = (lado) => { conSalidas(ubicar(sRef.current, pantallas[sRef.current.p], lado, reducidoAhora())); setFoco({ que: "msg", n: Math.random() }); };
  const onOpcion = (id) => {
    const t = elegir(sRef.current, pantallas[sRef.current.p], id, reducidoAhora());
    if (t === sRef.current) return;
    conSalidas(t);
    setFoco({ que: "msg", n: Math.random() });
  };
  const onContar = () => commit(contar(sRef.current));
  const onPorque = () => { commit(abrirPorque(sRef.current)); setFoco({ que: "porque", n: Math.random() }); };
  const onSeguir = () => {
    if (!estaListo(P, sRef.current)) return;
    if (sRef.current.p === pantallas.length - 1) {
      if (P.boton === T.siguientePieza) {
        /* La pieza siguiente de la vista: el bloque que viene después del de esta pieza. */
        const siguiente = marco.current?.closest("section")?.parentElement?.nextElementSibling?.querySelector("[data-pieza]");
        if (siguiente) { siguiente.scrollIntoView?.({ block: "start" }); siguiente.focus({ preventScroll: true }); }
      }
      return;
    }
    commit(seguir(sRef.current, pantallas));
    setFoco({ que: "txt", n: Math.random() });
  };

  const vivas = vivasDe(s);
  const numero = new Map(vivas.map((c, i) => [c.uid, i + 1]));
  const cmvVisible = Boolean((P.cmv && s.resuelto[P.id]) || abs > 2);
  const conteoVisible = Boolean(P.conteo && s.contado) || abs > 3;
  const res = P.opciones ? Boolean(s.resuelto[P.id]) : false;
  const listo = estaListo(P, s);
  const boton = P.boton || T.seguir;

  const lado = (l) => {
    const mal = abierta && s.intento === l;
    const pista = abierta && s.pista && l === H.lado;
    const etiqueta = `${l === "debe" ? T.ladoDebe : T.ladoHaber} ${T.de} ${T.inventario}${mal ? `. ${T.incorrecto}` : ""}`;
    const dentro = (
      <>
        <span className="t7cs-lado-rot">{l === "debe" ? T.debe : T.haber}</span>
        {mal && <Pastilla ok={false} />}
        {P.resumen && <span className="t7cs-sub">{l === "debe" ? T.entradas : T.salidas}</span>}
        <span className="t7cs-barras">{s.renglones.filter((r) => r.lado === l).map((r) => <Renglon key={r.uid} r={r} nuevo={r.uid === s.nuevo} />)}</span>
      </>
    );
    const clases = `t7cs-lado${abierta ? " blanco" : ""}${mal ? " mal" : ""}${pista ? " pista" : ""}`;
    return abierta
      ? <button key={`${l}-b`} type="button" className={clases} data-lado={l} aria-label={etiqueta} onClick={() => onLado(l)}>{dentro}</button>
      : <div key={`${l}-g`} className={clases} data-lado={l} role="group" aria-label={etiqueta}>{dentro}</div>;
  };

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_T7CS}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={P.id} className={`t7cs${abs === 0 ? " dormida" : ""}`}>
        <p className="t7cs-cejilla" aria-hidden="true">{llenar(T.marca, { n: abs + 1, total: s.k0 + pantallas.length })}</p>
        <p ref={txt} className="t7cs-txt" tabIndex={-1} data-texto hidden={!P.texto}>{P.texto}</p>

        <div className="t7cs-fig" data-figura>
          <p className="t7cs-hecho" aria-live="polite" hidden={!abierta}>{abierta ? H.texto : ""}</p>
          <div className="t7cs-bodega" role="img" aria-label={T.bodega}>
            <div className="t7cs-estante">
              {s.estante.map((c) => {
                const n = !c.sale && s.contado ? numero.get(c.uid) : null;
                return <i key={c.uid} className={`t7cs-caja${c.llega ? " llega" : ""}${c.sale ? " sale" : ""}${n ? " contada" : ""}`} data-n={n ?? ""} />;
              })}
            </div>
            <p className="t7cs-rot">{T.bodega}</p>
          </div>
          <div className="t7cs-cuentas">
            <div className="t7cs-t t7cs-hundido" data-t="inv">
              <p className="t7cs-t-nombre">{T.inventario}</p>
              <div className="t7cs-t-lados">{lado("debe")}{lado("haber")}</div>
              <div className="t7cs-saldo"><span className="t7cs-saldo-rot">{T.saldo}</span><span className="t7cs-saldo-pista"><i className="t7cs-saldo-barra" style={{ "--l": s.cajas / MAX }} /></span></div>
              <div className="t7cs-conteo" hidden={!conteoVisible}><span className="t7cs-saldo-rot">{T.conteo}</span><span className="t7cs-saldo-pista"><i className="t7cs-conteo-barra" style={{ "--l": s.cajas / MAX }} /></span></div>
            </div>
            <div className="t7cs-t t7cs-hundido" data-t="cmv" hidden={!cmvVisible}>
              <p className="t7cs-t-nombre">{T.costo}</p>
              <div className="t7cs-t-lados">
                <div className="t7cs-lado" data-lado="debe"><span className="t7cs-lado-rot">{T.debe}</span>
                  <span className="t7cs-barras">{s.cmv.map((r, i) => <Renglon key={r.uid} r={r} nuevo={i === s.cmv.length - 1 && r.nuevo} />)}</span></div>
                <div className="t7cs-lado" data-lado="haber"><span className="t7cs-lado-rot">{T.haber}</span><span className="t7cs-barras" /></div>
              </div>
            </div>
          </div>
          <ul className="t7cs-lista" hidden={!P.lista}>
            {P.lista && <>{P.lista.map((x) => <li key={x} data-texto>{x}</li>)}<li className="t7cs-sig" data-texto>{P.siguiente}</li></>}
          </ul>
        </div>

        <div className="t7cs-acc">
          {P.conteo && !s.contado && <button type="button" className="t7cs-boton" data-accion="contar" onClick={onContar}>{T.contar}</button>}
          {P.opciones && (!P.conteo || s.contado) && (
            <div className="t7cs-ops" role="group">
              {opciones[P.id].map((o) => {
                const mal = !res && s.intento === o.id;
                const pista = !res && s.pista && o.id === P.correcta;
                const bien = res && o.id === P.correcta;
                return (
                  <button
                    key={o.id} type="button" className={`t7cs-op${mal ? " mal" : ""}${pista ? " pista" : ""}${bien ? " bien" : ""}`} data-opcion={o.id}
                    aria-disabled={res ? "true" : undefined} aria-label={`${o.t}${mal ? ` ${T.incorrecto}` : bien ? ` ${T.correcto}.` : ""}`} onClick={() => onOpcion(o.id)}
                  >
                    <span>{o.t}</span>{mal && <Pastilla ok={false} />}{bien && <Pastilla ok />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div ref={msgRef} tabIndex={-1} className={`t7cs-msg${s.msg?.tipo === "mal" ? " mal" : ""}`} role="status" data-mensaje={s.msg ? (s.msg.tipo === "mal" ? "error" : "acierto") : undefined}>{s.msg && <>
          <p data-texto>{s.msg.tipo === "ok" ? <Pastilla ok /> : <span className="t7cs-solo-lector">{`${T.incorrecto} `}</span>}{s.msg.t}</p>
          {s.msg.porque && (s.msg.vista || s.msg.abierto
            ? <p ref={porqueRef} tabIndex={-1} data-texto data-porque>{s.msg.porque}</p>
            : <button type="button" className="t7cs-porque" data-boton="por-que" aria-expanded="false" onClick={onPorque}>{T.porQue}</button>)}
        </>}</div>

        <p className="t7cs-pie" data-pie>{P.pie}</p>
        <button
          type="button" className="t7cs-seguir" aria-disabled={String(!listo)} onClick={onSeguir}
          data-boton={boton === T.siguientePieza ? "siguiente-pieza" : P.boton ? "empezar" : "seguir"}
        >
          {boton}
        </button>
      </div>
    </Panel>
  );
}
