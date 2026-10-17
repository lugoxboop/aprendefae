import { useEffect, useId, useRef, useState } from "react";
import { Panel } from "../../salaDeControl/marco.jsx";
import { barajar } from "../../../../utils/barajar.js";
import {
  PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE, PANTALLAS, CUENTAS, TOQUE, VALORES, VALOR, TEXTOS,
  PRECIO, INICIO, FINAL, EVENTOS, CIERRE, cajasEn, pesos,
} from "../../../../data/contabilidadT7_1.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · PIEZA 1 DE APRENDER — «La cuenta que no se mueve», RENOVADA (v6).
 *
 * La «Pieza 1» del Patrón de enganche C de Watari, v6, pasada a un
 * componente de la casa: arriba la bodega de La Reventa, en medio el día (un
 * deslizador nativo hasta el cierre) y abajo su libro. Al mover el día, las
 * cajas salen con cada venta y llegan con la compra, mientras Inventario de
 * mercancías no se mueve (va con candado) hasta el cierre. Seis pantallas.
 *
 * La lógica es la del código de referencia de la v6, paso por paso (mover,
 * tocar una cuenta, contar, elegir el valor, seguir), escrita como funciones
 * puras sobre el estado: cada acción devuelve el estado nuevo y los
 * temporizadores (la caja que termina de salir, el temblor del error, el
 * conteo caja por caja) vuelven a llamar a esas funciones.
 *
 * A1-N2 DE MELLO (auditoria-mello-enganche-v6-y-t7-3-aciertos.md, sección 1),
 * que la v6 todavía no trae: si el deslizador va rápido, la caja que sale se
 * queda un rato en el estante (la animación de salida) y, si el día vuelve,
 * nace otra con el mismo id; al avanzar de nuevo la v6 sacaba la vieja y la
 * nueva se quedaba para siempre. Aquí, como lo pide Mello: al sacar una caja
 * se busca una viva (que no esté saliendo) y, antes de crear las que llegan,
 * se quitan las que estaban saliendo con ese id. El estante tiene siempre
 * exactamente cajasEn(día).length cajas vivas.
 *
 * Lo que este componente pone y la v6 no (todo lo pide la casa):
 *   · las cuentas son botones de verdad (en la v6, div con role=button)
 *   · al responder, el foco va al mensaje (o a la pregunta del valor, o al
 *     acierto del cierre, cuando no hay mensaje)
 *   · letra mínima de 12 px (la v6 tiene 10,5 en «Pantalla n de 6» y en
 *     DEBE y HABER)
 *   · «Siguiente pieza» lleva el foco a la pieza siguiente de la vista
 *   · una caja «llega» (cae desde arriba) solo en el paso en que llegó
 *   · sin el fondo #0E1B2E de la raíz: la pieza va sobre el del panel
 *
 * NO CALIFICA y no da FP: es material de Aprender. Clases con el prefijo
 * `t7a1-` (el `ea1-` de la v6); la cuenta del libro, `t7a1-cuenta` (`ea1-t`
 * en la v6: alto-de-boton-celula-c lee `.t7a1-t` como prefijo de
 * `.t7a1-t-cuerpo`, de 30 px). Movimiento reducido: sin animación, y la
 * pieza queda en su estado final correcto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Cuánto dura la salida de una caja (la transición de .t7a1-caja.sale), el temblor del error y cada paso del conteo: los de la v6. */
export const TIEMPOS = { sale: 320, rebota: 420, conteo: 140 };

export const CSS_AP1 = `
/* (1) T7-1 A1 renovada · tokens del producto. Teal y ámbar solo para Debe y Haber; coral solo para el error. */
.t7a1 { --fondo: #0E1B2E; --texto: #F8F9FA; --texto2: #A8B6C8; --neutro: #B8C4D4; --borde: rgba(248,249,250,0.16);
  --teal: #2A9D8F; --ambar: #E9C46A; --coral: #E76F51; /* lado */
  display: grid; gap: 12px; color: var(--texto); font: 400 15px/1.5 "Inter", system-ui, sans-serif; background: var(--fondo);
  min-width: 0; }
.t7a1 * { box-sizing: border-box; }
.t7a1-marca { margin: 0; font: 600 12px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: var(--texto2); }
.t7a1-txt { margin: 0; font-size: 15px; line-height: 1.5; outline: none; }
.t7a1-fig { display: grid; gap: 10px; transition: opacity .2s; }
.t7a1-fig.dormida { opacity: .55; pointer-events: none; }

/* La bodega: un estante con tablas; las cajas se apilan de izquierda a derecha. */
.t7a1-bodega { border: 1px solid var(--borde); border-radius: 12px; padding: 10px 12px 8px; }
.t7a1-estante { min-height: 56px; display: flex; flex-wrap: wrap; align-content: flex-end; gap: 6px 5px; padding-bottom: 4px;
  background: repeating-linear-gradient(to top, transparent 0 22px, rgba(184,196,212,.35) 22px 24px, transparent 24px 30px); }
/* R6 del lote de dialecto C: la caja en neutro, no en café; el número en navy (6,99:1). */
.t7a1-caja { position: relative; width: 26px; height: 22px; border-radius: 4px; background: #B8C4D4; border: 1px solid #F8F9FA;
  transition: transform .3s ease-in, opacity .3s ease-in; display: grid; place-items: center; font: 700 12px/1 "Sora", sans-serif; color: #1D3557; }
.t7a1-caja::before { content: ""; position: absolute; left: 50%; top: 0; bottom: 3px; width: 4px; margin-left: -2px; background: rgba(29,53,87,.25); }
.t7a1-caja.sale { transform: translateX(42px); opacity: 0; }
.t7a1-caja.llega { animation: t7a1-llega .32s ease-out both; }
@keyframes t7a1-llega { from { transform: translateY(-26px); opacity: 0; } to { transform: none; opacity: 1; } }
.t7a1-caja.contada::after { content: attr(data-n); position: relative; z-index: 1; }
.t7a1-cuantas { margin: 6px 0 0; font-size: 13px; color: var(--texto2); }
.t7a1-cuantas b { color: var(--texto); font-variant-numeric: tabular-nums; }

/* El día: un deslizador con marcas en los días que pasa algo. Pulgar de 44 px de alto para el dedo. */
.t7a1-dia { position: relative; padding-top: 2px; }
.t7a1-dia-rot { display: block; font-size: 13px; color: var(--texto2); }
.t7a1-dia-rot b { color: var(--texto); font-weight: 600; }
.t7a1-rango { -webkit-appearance: none; appearance: none; width: 100%; height: 44px; margin: 0; background: transparent; cursor: pointer; position: relative; z-index: 1; }
.t7a1-rango::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; background: rgba(248,249,250,.14); }
.t7a1-rango::-moz-range-track { height: 6px; border-radius: 3px; background: rgba(248,249,250,.14); }
/* R7 del lote de dialecto C: lo que se agarra mide 44 × 44; el disco visible sigue de 26 px. */
.t7a1-rango::-webkit-slider-thumb { -webkit-appearance: none; width: 44px; height: 44px; margin-top: -19px; border: 0; border-radius: 50%; background: radial-gradient(circle at center, #F8F9FA 0 8px, #1F2D3D 8px 11px, #B8C4D4 11px 13px, transparent 13.5px); }
.t7a1-rango::-moz-range-thumb { width: 44px; height: 44px; border: 0; border-radius: 50%; background: radial-gradient(circle at center, #F8F9FA 0 8px, #1F2D3D 8px 11px, #B8C4D4 11px 13px, transparent 13.5px); }
.t7a1-rango:focus-visible { outline: 2px solid var(--texto); outline-offset: 2px; border-radius: 8px; }
.t7a1-rango:disabled { cursor: default; opacity: .6; }
.t7a1-marcas { position: absolute; left: 0; right: 0; bottom: 8px; height: 10px; pointer-events: none; }
.t7a1-marcas i { position: absolute; top: 0; width: 2px; height: 10px; margin-left: -1px; background: var(--neutro); border-radius: 1px; }

/* El libro: dos cuentas T a lo ancho. Debe en teal y Haber en ámbar solo como rótulo de columna. */
.t7a1-libro { display: grid; gap: 8px; }
.t7a1-cuenta { border: 1px solid var(--borde); border-radius: 12px; padding: 8px 12px 8px; transition: border-color .2s; outline: none; }
.t7a1-t-cab { display: flex; justify-content: space-between; align-items: center; gap: 8px; font: 600 13px/1.3 "Sora", sans-serif; padding-bottom: 6px; border-bottom: 2px solid var(--neutro); }
.t7a1-cand { display: inline-flex; color: var(--texto2); }
.t7a1-candado { width: 16px; height: 19px; overflow: visible; }
.t7a1-arco { transition: transform .3s ease-out; transform-origin: 15px 11px; }
.t7a1-candado.abierto .t7a1-arco { transform: translateY(-3px) rotate(28deg); }
.t7a1-candado.late { animation: t7a1-late .45s ease-in-out; }
@keyframes t7a1-late { 0%, 100% { transform: none; } 30% { transform: scale(1.25); } 60% { transform: scale(.95); } }
.t7a1-t-cuerpo { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-height: 30px; }
.t7a1-col { padding: 6px 8px 0; display: grid; gap: 2px; align-content: start; }
.t7a1-col[data-lado="debe"] { border-right: 2px solid var(--neutro); padding-left: 0; }
.t7a1-col::before { font: 600 12px/1.3 "Sora", sans-serif; letter-spacing: .1em; }
.t7a1-col[data-lado="debe"]::before { content: "DEBE"; color: var(--teal); }
.t7a1-col[data-lado="haber"]::before { content: "HABER"; color: var(--ambar); }
.t7a1-mov { margin: 0; display: flex; justify-content: space-between; align-items: baseline; gap: 6px; font-size: 12px; color: var(--texto2); }
.t7a1-mov span { white-space: nowrap; }
.t7a1-mov b { white-space: nowrap; font: 500 13.5px/1.4 "Inter", sans-serif; font-variant-numeric: tabular-nums; color: var(--texto); }
.t7a1-mov.tachado b { text-decoration: line-through; color: var(--texto2); }
.t7a1-mov.nuevo { animation: t7a1-entra .3s ease-out both; }
@keyframes t7a1-entra { from { transform: translateY(-8px); opacity: 0; } to { transform: none; opacity: 1; } }
.t7a1-saldo { margin: 6px 0 0; font-size: 13px; color: var(--texto2); }
.t7a1-saldo b { color: var(--texto); font-variant-numeric: tabular-nums; }
.t7a1-cuenta.blanco { border: 2px dashed var(--neutro); padding: 7px 11px 7px; cursor: pointer; }
.t7a1-cuenta.blanco:focus-visible { outline: 2px solid var(--texto); outline-offset: 2px; }
.t7a1-cuenta.rebota { border: 2px solid var(--coral); padding: 7px 11px 7px; }
/* El temblor va por dentro de la cuenta: nada sale del borde de la tarjeta. */
.t7a1-cuenta.rebota > * { animation: t7a1-rebota .4s ease-out; }
@keyframes t7a1-rebota { 0%, 100% { transform: none; } 25% { transform: translateX(-6px); } 60% { transform: translateX(5px); } }

/* La compra que espera en el día 16. */
.t7a1-tarjeta { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: baseline; gap: 2px 8px; border: 1px solid var(--neutro); border-radius: 12px; padding: 10px 12px; background: rgba(184,196,212,.08); animation: t7a1-entra .3s ease-out both; }
.t7a1-tarjeta[hidden] { display: none; }
.t7a1-tarjeta span { font-size: 13px; color: var(--texto2); }
.t7a1-tarjeta b { font: 600 16px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.t7a1-tarjeta small { grid-column: 1 / -1; font-size: 13px; color: var(--texto); }
/* La tarjeta va entre el deslizador y el libro: lo que se toca queda a la vista. */
.t7a1-fig { grid-template-areas: "bodega" "dia" "tarjeta" "libro"; }
.t7a1-bodega { grid-area: bodega; } .t7a1-dia { grid-area: dia; } .t7a1-tarjeta { grid-area: tarjeta; } .t7a1-libro { grid-area: libro; }

.t7a1-acc:empty { display: none; }
.t7a1-preg { margin: 0 0 8px; font: 600 14px/1.4 "Sora", sans-serif; }
.t7a1-ops { display: grid; gap: 8px; }
.t7a1-op, .t7a1-boton, .t7a1-seguir { min-height: 44px; border-radius: 12px; font: 600 15px/1.2 "Inter", sans-serif; cursor: pointer; padding: 10px 14px; text-align: left; }
.t7a1-op { background: transparent; color: var(--texto); border: 1px solid var(--borde); font-variant-numeric: tabular-nums; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.t7a1-op.mal { border: 2px solid var(--coral); }
.t7a1-op em { font: 600 12px/1.2 "Inter", sans-serif; font-style: normal; color: var(--texto); }
.t7a1-boton { width: 100%; background: transparent; color: var(--texto); border: 2px solid var(--neutro); text-align: center; }
.t7a1-bien { margin: 0; padding: 10px 12px; border: 2px solid var(--neutro); border-radius: 12px; font-size: 14px; }
.t7a1-msg { margin: 0; min-height: 0; font-size: 14px; color: var(--texto2); }
.t7a1-msg:empty { display: none; }
.t7a1-msg.mal { color: var(--texto); padding: 8px 12px; border-left: 3px solid var(--coral); background: rgba(231,111,81,.10); border-radius: 0 8px 8px 0; }
.t7a1-nav { display: flex; }
.t7a1-seguir { width: 100%; background: var(--neutro); color: #1D3557; border: 0; text-align: center; }
.t7a1-seguir:disabled { background: transparent; color: var(--texto2); border: 2px solid rgba(184,196,212,.35); cursor: default; }
.t7a1 button:focus-visible { outline: 2px solid var(--texto); outline-offset: 2px; }

/* v4 · error con borde coral y «No va aquí»; segundo peldaño de la escalera: la cuenta correcta en borde neutro sólido. */
.t7a1-sello { margin-left: auto; font: 600 12px/1.2 "Inter", sans-serif; white-space: nowrap; }
.t7a1-sello:empty { display: none; }
.t7a1-t-cab .t7a1-cand + .t7a1-sello { margin-left: 8px; }
.t7a1-cuenta.blanco.mal { border: 2px solid var(--coral); }
.t7a1-cuenta.blanco.pista, .t7a1-cuenta.elegida { border: 2px solid var(--neutro); padding: 7px 11px 7px; }
.t7a1-cuenta.blanco.pista { background: rgba(184,196,212,.10); }
.t7a1-op.pista { border: 2px solid var(--neutro); background: rgba(184,196,212,.14); }
.t7a1-msg.bien { color: var(--texto); padding: 8px 12px; border: 2px solid var(--neutro); border-radius: 12px; }
.t7a1-msg.pista { color: var(--texto); padding: 8px 12px; border-left: 3px solid var(--neutro); background: rgba(184,196,212,.08); border-radius: 0 8px 8px 0; }

/* Del componente, no de la v6. La cuenta es un botón de verdad (en la v6, un div con role=button): por dentro van spans. */
.t7a1:focus { outline: none; }
/* Dentro del panel de la casa, la pieza va sobre su fondo: el #0E1B2E de la v6 (el del marco de Watari) dibujaba un recuadro. */
.t7a1 { background: transparent; }
.t7a1-cuenta { display: block; width: 100%; min-height: 44px; margin: 0; background: transparent; color: var(--texto); font: inherit; text-align: left; cursor: default; }
.t7a1-saldo { display: block; }
@media (prefers-reduced-motion: reduce) { .t7a1 *, .t7a1 *::before, .t7a1 *::after { animation: none !important; transition: none !important; } }
`;

/* ═══════════ EL ESTADO Y SUS PASOS (funciones puras, como en la v6) ═══════════ */

const ORDEN = PANTALLAS.map((p) => p.id);
const llenar = (t, vars) => t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));
export const fecha = (d) => (d === CIERRE ? TEXTOS.fechaCierre : llenar(TEXTOS.fecha, { d }));
const limitar = (d, P) => Math.max(P.min, Math.min(P.max, d));

export function estaListo(P, s) {
  if (P.listo === true) return true;
  if (P.listo?.visto) return s.visto >= P.listo.visto;
  if (P.listo?.compraAnotada) return s.compraAnotada;
  if (P.listo?.cierreOk) return s.cierreOk;
  return false;
}

/* La bodega de un estante recién montado: las cajas del día, sin animación. */
function estanteDe(dia) {
  return cajasEn(dia).map((id, k) => ({ id, uid: k + 1, sale: false, llega: false }));
}

/*
 * El estado al llegar a la primera pantalla de la lista. Con la pieza entera,
 * el día 1 y nada respondido. Si la lista empieza más adelante (la barra de
 * enganche monta cada pantalla sola), como si las anteriores se hubieran
 * jugado bien: la compra anotada después de la pantalla 3 y el cierre
 * después de la 5, y el día donde terminó la pantalla anterior.
 */
export function estadoInicial(pantallas) {
  const k0 = ORDEN.indexOf(pantallas[0].id);
  const P = pantallas[0];
  const despuesDe = (id) => k0 > ORDEN.indexOf(id);
  const dia = limitar(k0 > 0 ? PANTALLAS[k0 - 1].max : 1, P);
  const cerrado = k0 >= 0 && despuesDe("p4");
  return {
    k0: Math.max(k0, 0), p: 0, dia, visto: dia,
    compraAnotada: k0 >= 0 && despuesDe("p2"), contado: cerrado, contando: null, cuentaCierre: cerrado, cierreOk: cerrado,
    intento: null, errores: { compra: 0, cierre: 0, valor: 0 }, pista: null, intentoValor: null,
    rebota: null, msg: "", msgMal: false, msgEsPista: false, recienAnotada: false, recienCierre: false,
    late: false, latido: 0,
    estante: estanteDe(dia), antes: cajasEn(dia), uid: cajasEn(dia).length,
  };
}

/* El conteo solo existe el día del cierre: fuera de él, la bodega va «sin contar». */
export const conteoVisible = (s) => s.contado && s.dia === CIERRE;
export const vivas = (s) => s.estante.filter((c) => !c.sale);

/*
 * La bodega del día s.dia, a partir de la que había (pintarBodega de la v6).
 * animar: solo al avanzar hasta el hecho siguiente (A1-N1 de Mello). Devuelve
 * el estado nuevo, cuántas salen y llegan, y las cajas que quedan saliendo
 * (hay que quitarlas cuando termine su animación).
 */
export function pintarBodega(s, animar, reducido) {
  const ahora = cajasEn(s.dia);
  const salen = s.antes.filter((x) => !ahora.includes(x));
  const llegan = ahora.filter((x) => !s.antes.includes(x));
  let estante = s.estante.map((c) => ({ ...c, llega: false }));
  let uid = s.uid;
  const porQuitar = [];
  /* Las que salen se van hacia la derecha. A1-N2 (Mello): se saca una viva, nunca una que ya está saliendo. */
  for (const id of salen) {
    const n = estante.find((c) => c.id === id && !c.sale);
    if (!n) continue;
    if (reducido || !animar) estante = estante.filter((c) => c !== n);
    else { const sale = { ...n, sale: true }; estante = estante.map((c) => (c === n ? sale : c)); porQuitar.push(sale.uid); }
  }
  /* Las que llegan caen desde arriba. A1-N2 (Mello): antes, se quitan las que con su mismo id todavía estaban saliendo. */
  for (const id of llegan) {
    estante = estante.filter((c) => !(c.sale && c.id === id));
    uid += 1;
    estante.push({ id, uid, sale: false, llega: !(reducido || !animar) });
  }
  /* Orden estable, el de la v6: las que están saliendo quedan delante y las vivas, en el orden del día (las del inicio primero). */
  const orden = [...estante].sort((a, b) => ahora.indexOf(a.id) - ahora.indexOf(b.id));
  estante = [...estante.filter((c) => c.sale), ...orden.filter((c) => !c.sale)];
  return { s: { ...s, estante, antes: ahora, uid }, salen: salen.length, llegan: llegan.length, porQuitar };
}

/* La caja terminó de salir. */
export const quitarCaja = (s, uid) => ({ ...s, estante: s.estante.filter((c) => c.uid !== uid) });

/* ¿Qué pregunta de cuenta está abierta ahora? (la compra el 16, o la cuenta del cierre después de contar) */
export function preguntaAbierta(s, P) {
  if (P.id === "p2" && s.dia === 16 && !s.compraAnotada) return "compra";
  if (P.id === "p4" && s.contado && !s.cuentaCierre) return "cierre";
  return null;
}

/*
 * Mover el día (mover de la v6). A1-N1 de Mello: solo se narra y se anima al
 * avanzar hasta el hecho siguiente. Hacia atrás, o en un salto que cruza
 * varios hechos, la bodega se pone en el día nuevo sin mensaje, sin animación
 * y sin que el candado lata.
 */
export function mover(s, P, d, reducido) {
  d = limitar(d, P);
  if (d === s.dia) return { s, porQuitar: [] };
  const cruzados = EVENTOS.filter((e) => e.dia > s.dia && e.dia <= d);
  const narra = d > s.dia && cruzados.length === 1;
  const r = pintarBodega({ ...s, dia: d, visto: Math.max(s.visto, d) }, narra, reducido);
  /* C7: la venta lleva el porqué de que la cuenta no se mueva. */
  const msg = !narra ? "" : r.salen ? TEXTOS.venta : r.llegan ? llenar(TEXTOS.llegaron, { n: r.llegan }) : "";
  const late = Boolean(narra && r.salen && !reducido);
  return {
    s: { ...r.s, msg, msgMal: false, msgEsPista: false, recienAnotada: false, recienCierre: false, intento: null, late, latido: r.s.latido + (late ? 1 : 0) },
    porQuitar: r.porQuitar,
  };
}

/* Tocar una cuenta del libro. Escalera de ayuda: al segundo error, la cuenta correcta se marca en neutro y el mensaje dice dónde va. */
export function tocarCuenta(s, P, id) {
  const clave = preguntaAbierta(s, P);
  if (!clave) return s;
  const T = TOQUE[clave];
  const t = { ...s, late: false, recienAnotada: false, recienCierre: false };
  if (id === T.correcta) {
    const base = { ...t, intento: null, pista: null, msgMal: false, msgEsPista: false };
    return clave === "compra" ? { ...base, compraAnotada: true, recienAnotada: true, msg: T.bien } : { ...base, cuentaCierre: true, msg: "" };
  }
  const errores = { ...s.errores, [clave]: s.errores[clave] + 1 };
  const escalon = errores[clave] >= 2
    ? { pista: clave, msg: T.pista, msgEsPista: true, msgMal: false }
    : { msg: T.mal[id], msgMal: true, msgEsPista: false };
  return { ...t, errores, intento: id, ...escalon, rebota: id };
}

export const finRebota = (s) => ({ ...s, rebota: null });

/* Elegir el valor del cierre. */
export function elegirValor(s, v) {
  const t = { ...s, late: false };
  if (v === VALOR.correcta) return { ...t, cierreOk: true, recienCierre: true, intentoValor: null, pista: null, msg: "", msgMal: false, msgEsPista: false };
  const errores = { ...s.errores, valor: s.errores.valor + 1 };
  const escalon = errores.valor >= 2
    ? { pista: "valor", msg: VALOR.pista, msgEsPista: true, msgMal: false }
    : { msg: VALOR.mal[v], msgMal: true, msgEsPista: false };
  return { ...t, errores, intentoValor: v, ...escalon };
}

/* Contar la bodega: las cajas se numeran una por una. La última cierra el conteo. */
export const empezarConteo = (s) => ({ ...s, contando: 0, late: false });
export function contarPaso(s, i, total) {
  if (i < total - 1) return { ...s, contando: i + 1 };
  return { ...s, contando: null, contado: true, msg: "", late: false };
}

/* Seguir a la pantalla siguiente. Si el día queda fuera del tramo de la nueva, se pone en su borde, sin animación. */
export function seguir(s, pantallas, reducido) {
  const p = Math.min(pantallas.length - 1, s.p + 1);
  let t = { ...s, p, msg: "", msgMal: false, msgEsPista: false, intento: null, pista: null, recienAnotada: false, recienCierre: false, late: false };
  const P = pantallas[p];
  if (t.dia < P.min || t.dia > P.max) t = pintarBodega({ ...t, dia: limitar(t.dia, P) }, false, reducido).s;
  return t;
}

/* ═══════════ LA FIGURA ═══════════ */

function Candado({ abierto, late, latido }) {
  return (
    <svg key={latido} className={`t7a1-candado${abierto ? " abierto" : ""}${late ? " late" : ""}`} viewBox="0 0 20 24" aria-hidden="true">
      <path className="t7a1-arco" d="M5 11 V7 a5 5 0 0 1 10 0 V11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="2.5" y="10.5" width="15" height="11.5" rx="2.5" fill="currentColor" />
    </svg>
  );
}

function Mov({ dia, monto, nuevo }) {
  return <span className={`t7a1-mov${nuevo ? " nuevo" : ""}`}><span>{dia}</span><b>{pesos(monto)}</b></span>;
}

/* Las marcas de los días con hechos, en la regla del deslizador. */
const MARCAS = [...EVENTOS.map((e) => e.dia), CIERRE].map((d) => {
  const f = (d - 1) / (CIERRE - 1);
  return { d, left: `calc(${f * 100}% + ${22 - f * 44}px)` }; /* calc(22px + (100% - 44px) * f): el centro del pulgar de 44 */
});

/* ═══════════ LA PIEZA ═══════════ */

const reducidoAhora = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

export default function LaCuentaQueNoSeMueve({ pieza = PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE, rotulo, barajar: barajarOpciones = barajar }) {
  /* Lote V (Mello): las opciones, barajadas UNA vez al montar (como los Hacer de T7 al armar la tanda); el orden no cambia al reintentar. `barajar` se inyecta en las pruebas. */
  const [valores] = useState(() => barajarOpciones(VALORES));
  const pantallas = pieza.pantallas;
  const [s, setS] = useState(() => estadoInicial(pantallas));
  /* El estado de ahora, para los manejadores y los temporizadores: el deslizador puede mandar varios cambios antes de pintar. */
  const sRef = useRef(s);
  const commit = (t) => { sRef.current = t; setS(t); };
  const relojes = useRef(new Set());
  const despues = (ms, f) => { const id = setTimeout(() => { relojes.current.delete(id); f(); }, ms); relojes.current.add(id); };
  useEffect(() => () => { for (const id of relojes.current) clearTimeout(id); relojes.current.clear(); }, []);

  const marco = useRef(null);
  const txt = useRef(null);
  const msgRef = useRef(null);
  const pregRef = useRef(null);
  const bienRef = useRef(null);
  /* A dónde va el foco después de pintar: «txt» al seguir, «respuesta» al responder. */
  const [foco, setFoco] = useState(null);
  const idRango = useId();

  const P = pantallas[s.p];
  const abierta = preguntaAbierta(s, P);
  const vis = conteoVisible(s);
  const conCompra = s.compraAnotada && s.dia >= 16;
  const conCierre = s.cierreOk && s.dia === CIERRE;

  useEffect(() => {
    if (!foco) return;
    if (foco.que === "txt") txt.current?.focus({ preventScroll: true });
    else (s.msg ? msgRef.current : pregRef.current ?? bienRef.current)?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foco]);

  const onDia = (e) => {
    const r = mover(sRef.current, pantallas[sRef.current.p], Number(e.target.value), reducidoAhora());
    if (r.s === sRef.current) return;
    commit(r.s);
    for (const uid of r.porQuitar) despues(TIEMPOS.sale, () => commit(quitarCaja(sRef.current, uid)));
  };

  const onCuenta = (id) => {
    const t = tocarCuenta(sRef.current, pantallas[sRef.current.p], id);
    if (t === sRef.current) return;
    commit(t);
    if (t.rebota) despues(TIEMPOS.rebota, () => commit(finRebota(sRef.current)));
    setFoco({ que: "respuesta", n: Math.random() });
  };

  const onContar = () => {
    if (sRef.current.contando !== null || sRef.current.contado) return;
    const total = vivas(sRef.current).length;
    const paso = reducidoAhora() ? 0 : TIEMPOS.conteo;
    commit(empezarConteo(sRef.current));
    for (let i = 0; i < total; i++) despues(i * paso, () => commit(contarPaso(sRef.current, i, total)));
  };

  const onValor = (v) => {
    commit(elegirValor(sRef.current, v));
    setFoco({ que: "respuesta", n: Math.random() });
  };

  const onSeguir = () => {
    const ultima = sRef.current.p === pantallas.length - 1;
    if (ultima && P.boton === "Siguiente pieza") {
      /* La pieza siguiente de la vista: el bloque que viene después del de esta pieza. */
      const siguiente = marco.current?.closest("section")?.parentElement?.nextElementSibling?.querySelector("[data-pieza]");
      if (siguiente) { siguiente.scrollIntoView?.({ block: "start" }); siguiente.focus({ preventScroll: true }); return; }
    }
    commit(seguir(sRef.current, pantallas, reducidoAhora()));
    setFoco({ que: "txt", n: Math.random() });
  };

  const numeroDe = (k) => (vis ? k + 1 : s.contando !== null && k < s.contando ? k + 1 : null);
  const total = s.k0 + pantallas.length;

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_AP1}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={P.id} className="t7a1">
        <p className="t7a1-marca" aria-hidden="true">{llenar(TEXTOS.marca, { n: s.k0 + s.p + 1, total })}</p>
        <p ref={txt} className="t7a1-txt" tabIndex={-1} data-texto>{P.texto}</p>

        <div className={`t7a1-fig${s.k0 + s.p === 0 ? " dormida" : ""}`} data-figura>
          <div className="t7a1-bodega">
            <div className="t7a1-estante" role="img" aria-label={TEXTOS.bodega}>
              {(() => {
                let k = 0;
                return s.estante.map((c) => {
                  const n = c.sale ? null : numeroDe(k++);
                  return <i key={c.uid} className={`t7a1-caja${c.sale ? " sale" : ""}${c.llega ? " llega" : ""}${n ? " contada" : ""}`} data-caja={c.id} data-n={n ?? ""} />;
                });
              })()}
            </div>
            <p className="t7a1-cuantas">
              {vis
                ? <>{TEXTOS.conteo[0]}<b>{llenar(TEXTOS.conteo[1], { n: cajasEn(s.dia).length, precio: pesos(PRECIO) })}</b></>
                : <>{TEXTOS.sinContar[0]}<b>{TEXTOS.sinContar[1]}</b></>}
            </p>
          </div>

          <div className="t7a1-dia">
            <label className="t7a1-dia-rot" htmlFor={idRango}><b>{fecha(s.dia)}</b></label>
            <input
              type="range" id={idRango} className="t7a1-rango" min={1} max={CIERRE} step={1} value={s.dia}
              disabled={P.min === P.max} aria-valuetext={fecha(s.dia)} onChange={onDia}
            />
            <div className="t7a1-marcas" aria-hidden="true">{MARCAS.map((m) => <i key={m.d} style={{ left: m.left }} />)}</div>
          </div>

          <div className="t7a1-libro">
            {CUENTAS.map((c) => {
              const mal = Boolean(abierta) && s.intento === c.id;
              const pista = Boolean(abierta) && s.pista === abierta && c.id === TOQUE[abierta].correcta;
              const elegida = P.id === "p4" && s.cuentaCierre && c.id === "inventario" && s.dia === CIERRE;
              const sello = mal ? TEXTOS.noVaAqui : P.id === "p4" && s.cuentaCierre && c.id === "inventario" ? TEXTOS.bien : "";
              const estados = [abierta && "blanco", mal && "mal", pista && "pista", elegida && "elegida", s.rebota === c.id && "rebota"].filter(Boolean);
              return (
                <button key={c.id} type="button" className={`t7a1-cuenta${estados.map((e) => ` ${e}`).join("")}`} data-cuenta={c.id} disabled={!abierta} onClick={() => onCuenta(c.id)}>
                  <span className="t7a1-t-cab">
                    <span>{c.nombre}</span>
                    {c.id === "inventario" && <span className="t7a1-cand"><Candado abierto={conCierre} late={s.late} latido={s.latido} /></span>}
                    <span className="t7a1-sello" aria-hidden="true">{sello}</span>
                  </span>
                  <span className="t7a1-t-cuerpo">
                    <span className="t7a1-col" data-lado="debe">
                      {c.id === "inventario" && <Mov dia={TEXTOS.movInicio} monto={INICIO * PRECIO} />}
                      {c.id === "inventario" && conCierre && <Mov dia={TEXTOS.movCierre} monto={FINAL * PRECIO} nuevo={s.recienCierre} />}
                      {c.id === "compras" && conCompra && <Mov dia={TEXTOS.movCompra} monto={EVENTOS.find((e) => e.tipo === "compra").cajas * PRECIO} nuevo={s.recienAnotada} />}
                    </span>
                    <span className="t7a1-col" data-lado="haber">
                      {c.id === "inventario" && conCierre && <Mov dia={TEXTOS.movCierre} monto={INICIO * PRECIO} nuevo={s.recienCierre} />}
                    </span>
                  </span>
                  {c.id === "inventario" && <span className="t7a1-saldo">{TEXTOS.saldo}<b>${pesos(conCierre ? FINAL * PRECIO : INICIO * PRECIO)}</b></span>}
                </button>
              );
            })}
          </div>

          <div className="t7a1-tarjeta" hidden={abierta !== "compra"}>
            {abierta === "compra" && <>
              <span>{TEXTOS.tarjeta.fecha}</span><b>${pesos(EVENTOS.find((e) => e.tipo === "compra").cajas * PRECIO)}</b><small>{TEXTOS.tarjeta.toca}</small>
            </>}
          </div>
        </div>

        <div className="t7a1-acc">
          {P.id === "p4" && !s.contado && (
            <button type="button" className="t7a1-boton" data-accion="contar" disabled={s.contando !== null} onClick={onContar}>{TEXTOS.contar}</button>
          )}
          {P.id === "p4" && s.contado && s.cuentaCierre && !s.cierreOk && <>
            <p ref={pregRef} tabIndex={-1} className="t7a1-preg" data-texto>{TEXTOS.preguntaValor}</p>
            <div className="t7a1-ops" role="group" aria-label={TEXTOS.preguntaValor}>
              {valores.map((v) => {
                const mal = s.intentoValor === v;
                const pista = s.pista === "valor" && v === VALOR.correcta;
                return (
                  <button key={v} type="button" className={`t7a1-op${mal ? " mal" : ""}${pista ? " pista" : ""}`} data-valor={v} onClick={() => onValor(v)}>
                    ${pesos(v)}{mal && <em>{TEXTOS.noEsEste}</em>}
                  </button>
                );
              })}
            </div>
          </>}
          {P.id === "p4" && s.cierreOk && (
            <p ref={bienRef} tabIndex={-1} className="t7a1-bien" data-texto><span aria-hidden="true">{TEXTOS.bien}</span> {TEXTOS.bienCierre}</p>
          )}
        </div>

        <p
          ref={msgRef}
          tabIndex={-1}
          role="status"
          data-texto
          className={["t7a1-msg", s.msgMal && "mal", s.msg && !s.msgMal && s.msg.startsWith("✓") && "bien", s.msg && s.msgEsPista && "pista"].filter(Boolean).join(" ")}
        >
          {s.msg}
        </p>

        <div className="t7a1-nav">
          <button
            type="button"
            className="t7a1-seguir"
            data-boton={P.boton === "Empezar" ? "empezar" : P.boton === "Siguiente pieza" ? "siguiente-pieza" : "seguir"}
            disabled={!estaListo(P, s)}
            onClick={onSeguir}
          >
            {P.boton || TEXTOS.seguir}
          </button>
        </div>
      </div>
    </Panel>
  );
}
