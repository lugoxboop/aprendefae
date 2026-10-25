/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A1 «La caja» — LOS SLIDES (Hanayama §3, A1: el caso crítico).
 *
 * La figura es «el cajón de paso» en compacto, escrito aquí porque el Cajon
 * viejo (233-415 px) no se deja compactar por props:
 *
 *   · origen, 44 px: la tarjeta del movimiento (13/16, dos renglones como
 *     mucho) y su cifra (15/500 tabular); 8 px de tubo hasta el Debe
 *   · cajón y bandeja lado a lado, 108 px: el cajón (190 a 320) con «Caja»,
 *     las dos celdas-destino de 44 y «En la caja»; la bandeja «Caja no se
 *     mueve» (60 × 108). La manija va en el borde superior y se abre 4 px
 *   · salidas, 32 px: Bancos y «Pago en efectivo» lado a lado (en p3 son los
 *     dos botones de 44; en p6, 24)
 *   · §3.2: con el acierto de p1 y p2 el asiento compacto (52) ocupa el lugar
 *     del origen y su tubo; la banda queda con la pastilla «Correcto»
 *
 *   1 · cobra        Haz     la tarjeta del cobro a debe, haber o la bandeja
 *   2 · consigna     Haz     la consignación a un destino; Bancos se enciende
 *   3 · dos-salidas  Míralo  «Consignar» y «Pagar»; la otra sigue activa y
 *                            devuelve la plata por su lado. «Pagar» trae su razón
 *   4 · cheques      Haz     dos tarjetas; la segunda llega 1,4 s después
 *   5 · el-faltante  Haz     tres opciones de palabras
 *   6 · controles    Cierre  siete controles en rejilla 4 + 3, opcionales
 *
 * La figura toma su estado al quedar resuelta (acierto o segundo error), no
 * con el primer error.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from "react";
import { DEBE, HABER, NO_SE_MUEVE, FIGURA_CAJON, INTERFAZ, CHEQUE_EN_FIGURA, ESPERA_CHEQUE_MS, CONTROLES_A1 } from "../../../data/contabilidadT4.js";
import { A1_ID, ORIGEN_FALTANTE, SLIDES_A1 } from "../../../data/contabilidadT4SlidesA1.js";
import { useNumeroQueSube } from "../../mecanicas/libros/verbos.jsx";
import { C, cifra } from "../comun.jsx";
import {
  Banda, Control, HAZ_VACIO, Opciones, RAZON_HAZ, Slide, calificar, colocada, correctoTarjeta, resueltaTarjeta,
  tarjeta, todasResueltas, useTerminada, verDe,
} from "./comun.jsx";

const CURVA = "cubic-bezier(.3,.9,.4,1)";
const BANDEJA = 60;

/* El centro de la celda del Debe y del Haber dentro del cajón (relleno 6, hueco 8): de ahí bajan los tubos. */
const centro = (lado, conBandeja) => {
  const ancho = conBandeja ? `(100% - ${BANDEJA + 8}px)` : "100%";
  return lado === DEBE ? `calc((${ancho} - 20px) / 4 + 5px)` : `calc((${ancho} - 20px) * 3 / 4 + 13px)`;
};

export const CSS_SLIDES_A1 = `
.t4s1 { display: grid; min-width: 0; }
.t4s1-slot { position: relative; height: 52px; }
.t4s1-hueco { position: relative; height: 8px; }
.t4s1-origen { height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 10px; border: 1px solid ${C.reposo}; border-radius: 8px; min-width: 0; }
.t4s1-origen-t { min-width: 0; font: 400 13px/16px "Inter", sans-serif; color: ${C.texto}; overflow-wrap: anywhere; }
.t4s1-origen-t[data-rotulo] { font-weight: 500; color: ${C.texto2}; }
.t4s1-cifra { font: 500 15px/20px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4s1-tubo { position: absolute; bottom: 0; width: 2px; height: 8px; margin-left: -1px; background: ${C.neutro}; }
.t4s1-tubo[data-vivo] { background: ${C.texto}; }
/* Parada 3: todo en 12 px y cifras en columnas de 50, para que «Ingresos por servicios» (125 px) y su sangría de 8 quepan en 136 a 320. */
.t4s1-as { height: 52px; display: grid; grid-template-rows: 14px 18px 18px; align-content: center; padding: 0 6px; border: 1px solid ${C.hundidoBorde}; border-radius: 8px; background: ${C.hundido}; }
.t4s1-as-f { display: grid; grid-template-columns: minmax(0, 1fr) 50px 50px; column-gap: 4px; align-items: center; min-width: 0; }
.t4s1-as-f > span { white-space: nowrap; font: 400 12px/18px "Inter", sans-serif; }
.t4s1-as-f > span:nth-child(n+2) { text-align: right; font-variant-numeric: tabular-nums; }
.t4s1-as-h > span { font: 600 12px/14px "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.t4s1-fila { display: grid; grid-template-columns: minmax(0, 1fr) ${BANDEJA}px; column-gap: 8px; height: 108px; }
.t4s1-fila[data-sola] { grid-template-columns: minmax(0, 1fr); height: auto; }
.t4s1-cajon { position: relative; display: grid; align-content: start; padding: 5px 6px; border: 1px solid ${C.neutro}; border-radius: 10px; min-width: 0; }
.t4s1-cajon[data-luz] { border-color: ${C.texto}; box-shadow: inset 0 0 0 1px ${C.texto}; }
.t4s1-manija { position: absolute; left: calc(50% - 12px); top: -3px; width: 24px; height: 4px; border-radius: 2px; background: ${C.neutro}; pointer-events: none; }
.t4s1-nombre { margin: 0; height: 16px; text-align: center; font: 600 13px/16px "Sora", "Inter", sans-serif; }
.t4s1-glosa { margin: 0; height: 16px; text-align: center; font: 500 12px/16px "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4s1-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; min-width: 0; }
.t4s1-celda { position: relative; height: 44px; min-height: 44px; display: grid; grid-template-rows: 14px 20px; align-content: center; justify-items: start; text-align: left; padding: 2px 6px; border-radius: 8px; border: 1px solid transparent; min-width: 0; }
.t4s-ctl.t4s1-celda { border-color: ${C.reposo}; }
.t4s-ctl.t4s1-celda[data-ver] { border-color: ${C.texto}; padding: 1px 5px; }
.t4s-ctl.t4s1-celda[data-ver="mal"] { border-color: ${C.error}; }
.t4s1-celda[data-linea] { height: 24px; min-height: 24px; grid-template-rows: 20px; grid-template-columns: auto minmax(0, 1fr); align-items: center; column-gap: 6px; padding: 1px 6px; }
.t4s1-celda[data-luz] { border-color: ${C.texto}; box-shadow: inset 0 0 0 1px ${C.texto}; }
.t4s1-lado { font: 600 12px/14px "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.t4s1-celda[data-linea] .t4s1-lado { line-height: 20px; }
.t4s1-val { justify-self: end; font: 500 15px/20px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${C.texto}; }
.t4s1-celda[data-linea] .t4s1-val { justify-self: end; }
.t4s1-d { color: ${C.debeTexto}; } .t4s1-h { color: ${C.haber}; }
.t4s1-saldo { height: 20px; display: flex; justify-content: center; align-items: baseline; gap: 8px; border-radius: 6px; border: 1px solid transparent; }
.t4s1-saldo[data-luz] { border-color: ${C.texto}; box-shadow: inset 0 0 0 1px ${C.texto}; }
.t4s1-saldo > span:first-child { font: 500 12px/18px "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4s1-saldo > span:last-child { font: 600 15px/18px "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4s-ctl.t4s1-band { height: 108px; width: ${BANDEJA}px; display: grid; align-content: center; justify-items: center; gap: 6px; padding: 18px 3px 2px; text-align: center; font: 600 12px/15px "Inter", sans-serif; }
.t4s-ctl.t4s1-band[data-ver] { padding: 17px 2px 1px; }
.t4s1-band-ult { font: 500 12px/15px "Inter", sans-serif; color: ${C.texto}; }
.t4s1-sal { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; min-width: 0; }
.t4s1-caja2 { height: 32px; display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 0 8px; border: 1px solid ${C.neutro}; border-radius: 8px; min-width: 0; }
.t4s1-sal[data-bajas] .t4s1-caja2 { height: 24px; }
.t4s1-caja2[data-luz] { border-color: ${C.texto}; box-shadow: inset 0 0 0 1px ${C.texto}; }
.t4s1-caja2-n { font: 600 12px/14px "Inter", sans-serif; white-space: nowrap; }
.t4s1-caja2-g { margin-left: -2px; margin-right: auto; font: 500 12px/14px "Inter", sans-serif; color: ${C.texto2}; white-space: nowrap; }
.t4s1-caja2 .t4s1-cifra { font-size: 14px; }
/* p3: la acción y la cifra arriba, la cuenta de destino debajo (a 320, «Pago en efectivo» y la cifra no caben en un renglón). */
.t4s-ctl.t4s1-salida { height: 44px; display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: 18px 14px; grid-template-areas: "a c" "n n"; align-content: center; column-gap: 6px; text-align: left; padding: 2px 8px; }
.t4s1-salida > .t4s1-salida-a { grid-area: a; }
.t4s1-salida > .t4s1-caja2-n { grid-area: n; font: 500 12px/14px "Inter", sans-serif; color: ${C.texto2}; }
.t4s1-salida > .t4s1-cifra { grid-area: c; line-height: 18px; }
.t4s1-salida[data-vivo] { border-color: ${C.texto}; }
.t4s1-entra { animation: t4s1-entra 280ms ${CURVA} 120ms both; }
@keyframes t4s1-entra { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.t4s1-rejilla { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.t4s-ctl.t4s1-pill { height: 44px; padding: 0 3px; display: grid; place-items: center; text-align: center; font: 500 12px/14px "Inter", sans-serif; color: ${C.texto2}; hyphens: auto; -webkit-hyphens: auto; overflow-wrap: normal; }
.t4s-ctl.t4s1-pill[aria-pressed="true"] { border-width: 2px; border-color: ${C.texto}; color: ${C.texto}; padding: 0 2px; }
`;

/* ═══════════ Las partes del cajón compacto ═══════════ */

/* D9: el cajón se abre 4 px y vuelve (solo transform), una vez por cada `abre` que sube; quieto con movimiento reducido. */
function useAbre(ref, abre, reducido) {
  useEffect(() => {
    const el = ref.current;
    if (!abre || reducido || !el?.animate) return;
    el.animate([{ transform: "translateY(0)" }, { transform: "translateY(-4px)" }, { transform: "translateY(0)" }], { duration: 440, easing: CURVA });
  }, [abre]); // eslint-disable-line react-hooks/exhaustive-deps
}

function Origen({ texto, rotulo = false, cifra: c = null, clave }) {
  return (
    <div className="t4s1-origen t4s-nueva" data-origen key={clave}>
      <span className="t4s1-origen-t" data-rotulo={rotulo ? "" : undefined}>{texto}</span>
      {c != null && <span className="t4s1-cifra" data-monto="origen">{c}</span>}
    </div>
  );
}

/* §3.2: el asiento compacto de 52 px (Debe/Haber 14, dos renglones de 18 y el borde). */
function Asiento({ asiento }) {
  return (
    <div className="t4s1-as t4s-nueva" role="table" aria-label={asiento.nombre} data-asiento={asiento.nombre}>
      <div className="t4s1-as-f t4s1-as-h" role="row">
        <span />
        <span role="columnheader" style={{ color: C.debeTexto }}>{INTERFAZ.debe}</span>
        <span role="columnheader" style={{ color: C.haber }}>{INTERFAZ.haber}</span>
      </div>
      {asiento.lineas.map((l) => (
        <div key={l.cuenta} className="t4s1-as-f" role="row" data-linea={l.cuenta} data-lado={l.lado}>
          <span role="rowheader" style={{ paddingLeft: l.lado === HABER ? "8px" : 0 }}>{l.cuenta}</span>
          <span role="cell">{l.lado === DEBE ? cifra(l.monto) : ""}</span>
          <span role="cell">{l.lado === HABER ? cifra(l.monto) : ""}</span>
        </div>
      ))}
    </div>
  );
}

/* La fila del origen (44 + 8 de tubo) o, en su lugar, el asiento (52). */
function Slot({ children, asiento = null, vivo = false, conBandeja = true }) {
  return (
    <div className="t4s1-slot">
      {asiento ? <Asiento asiento={asiento} /> : children}
      {!asiento && <span className="t4s1-tubo" aria-hidden="true" data-trazo="entrada" data-vivo={vivo ? "" : undefined} style={{ left: centro(DEBE, conBandeja) }} />}
    </div>
  );
}

/* Un hueco de 8 px con el tubo que baja de una celda. */
function Hueco({ lado = null, vivo = false, conBandeja = false }) {
  return (
    <div className="t4s1-hueco" aria-hidden="true">
      {lado && <span className="t4s1-tubo" data-trazo={lado === DEBE ? "entrada" : "salida"} data-vivo={vivo ? "" : undefined} style={{ left: centro(lado, conBandeja) }} />}
    </div>
  );
}

const ROTULO_LADO = { [DEBE]: INTERFAZ.debe, [HABER]: INTERFAZ.haber };

/* Una celda del cajón: destino calificable (Control) o lectura. `linea` la deja en un renglón de 24. */
function Celda({ lado, valor = null, destino = null, linea = false, luz = false }) {
  const dentro = (
    <>
      <span className={`t4s1-lado ${lado === DEBE ? "t4s1-d" : "t4s1-h"}`}>{ROTULO_LADO[lado]}</span>
      <span className="t4s1-val t4s-nueva" key={valor ?? "-"} data-linea-valor={lado}>{valor ?? ""}</span>
    </>
  );
  if (destino) {
    return (
      <Control className="t4s1-celda" data-destino={lado} data-columna={lado} ver={destino.ver} apagado={destino.apagado} nombre={FIGURA_CAJON.destino[lado]} onClick={() => destino.onElegir(lado)}>
        {dentro}
      </Control>
    );
  }
  return <div className="t4s1-celda" data-columna={lado} data-linea={linea ? "" : undefined} data-luz={luz ? "" : undefined}>{dentro}</div>;
}

function Saldo({ valor, luz = false }) {
  const visto = useNumeroQueSube(typeof valor === "number" ? valor : 0);
  return (
    <div className="t4s1-saldo" data-saldo={valor ?? ""} data-luz={luz ? "" : undefined}>
      {valor != null && <span>{FIGURA_CAJON.enLaCaja}</span>}
      {valor != null && <span data-saldo-visto>{typeof valor === "number" ? cifra(visto) : valor}</span>}
    </div>
  );
}

/*
 * El cajón: «Caja» (y su glosa en p1), las dos celdas y «En la caja».
 * destinos = { ver(lado), apagado, onElegir } o null; valores = { debe, haber }.
 */
function CajonC({ glosa = false, valores = {}, destinos = null, linea = false, saldo = null, luz = [], abre = 0, reducido = false, alLlegar = false }) {
  const ref = useRef(null);
  useAbre(ref, abre, reducido);
  /* p1 (§4): el modelo de la pantalla 1 corre una vez al llegar: la manija. */
  const llegada = useRef(alLlegar).current;
  useAbre(ref, llegada ? 1 : 0, reducido);
  const des = (lado) => (destinos ? { ver: destinos.ver(lado), apagado: destinos.apagado, onElegir: destinos.onElegir } : null);
  return (
    <div className="t4s1-cajon" ref={ref} data-cajon data-abre={abre} data-luz={luz.includes("cajon") ? "" : undefined}>
      <span className="t4s1-manija" aria-hidden="true" data-manija />
      <p className="t4s1-nombre">{FIGURA_CAJON.cuenta}</p>
      {glosa && <p className="t4s1-glosa" data-glosa-cuenta="caja">{FIGURA_CAJON.glosaCaja.join(" ")}</p>}
      <div className="t4s1-cols">
        {[DEBE, HABER].map((lado) => <Celda key={lado} lado={lado} valor={valores[lado] ?? null} destino={des(lado)} linea={linea} luz={luz.includes("cols")} />)}
      </div>
      <Saldo valor={saldo} luz={luz.includes("saldo")} />
    </div>
  );
}

/* La bandeja «Caja no se mueve»: destino de 60 × 108. */
function Bandeja({ destinos, ultimo = null }) {
  return (
    <Control className="t4s1-band" data-destino={NO_SE_MUEVE} data-bandeja ver={destinos.ver(NO_SE_MUEVE)} apagado={destinos.apagado} nombre={FIGURA_CAJON.destino[NO_SE_MUEVE]} onClick={() => destinos.onElegir(NO_SE_MUEVE)}>
      <span>{FIGURA_CAJON.bandeja}</span>
      {ultimo && <span className="t4s1-band-ult t4s-nueva" data-linea="bandeja">{ultimo}</span>}
    </Control>
  );
}

/* Las salidas en lectura: Bancos (con su glosa en p1) y «Pago en efectivo». 32 px; `bajas`, 24. */
function Salidas({ glosa = false, bancos = null, luz = [], vivo = [], bajas = false }) {
  const L = (k) => (luz.includes(k) || vivo.includes(k) ? "" : undefined);
  return (
    <div className="t4s1-sal" data-bajas={bajas ? "" : undefined}>
      <div className="t4s1-caja2" data-caja2="bancos" data-luz={L("bancos")}>
        <span className="t4s1-caja2-n">{FIGURA_CAJON.bancos}</span>
        {glosa && <span className="t4s1-caja2-g" data-glosa-cuenta="bancos">{FIGURA_CAJON.glosaBancos.join(" ")}</span>}
        {bancos && <span className="t4s1-cifra t4s-nueva" data-monto="bancos">{bancos}</span>}
      </div>
      <div className="t4s1-caja2" data-caja2="pago" data-luz={L("pago")}>
        <span className="t4s1-caja2-n">{FIGURA_CAJON.pago.join(" ")}</span>
      </div>
    </div>
  );
}

/* Los destinos de una tarjeta: el veredicto de cada uno según C2. */
const destinosDe = (e, id, correcta, apagado, setEstado) => ({
  ver: (lado) => verDe(e, id, lado, correcta),
  apagado,
  onElegir: (lado) => setEstado((x) => calificar(x, id, lado, correcta)),
});

/* La devolución de una pantalla de una sola tarjeta (como A0). */
function devUna(t, e, id) {
  const x = tarjeta(e, id);
  if (!x) return null;
  if (correctoTarjeta(e, id)) return { ver: "mal", textos: [t.porque] };
  if (x.ok) return { ver: "bien", textos: t.acierto };
  return { ver: "mal", textos: [t.errores[x.eleccion]], n: x.intentos };
}
const posiblesUna = (t) => [
  { ver: "bien", textos: t.acierto }, { ver: "mal", textos: [t.porque] }, ...Object.values(t.errores).map((x) => ({ ver: "mal", textos: [x] })),
];

/* ═══════════ 1 · cobra ═══════════ */

function FiguraCobra({ t, D, estado, setEstado, reducido, primeraVez }) {
  const e = estado ?? HAZ_VACIO;
  const hecha = resueltaTarjeta(e, "cobro");
  const M = cifra(D.cobro);
  return (
    <Slide banda={<Banda antes={t.antes} dev={devUna(t, e, "cobro")} posibles={posiblesUna(t)} />}>
      <div className="t4s1">
        <Slot asiento={hecha ? t.asiento : null}>
          <Origen texto={D.rotuloOrigen} rotulo cifra={M} clave="cobro" />
        </Slot>
        <div className="t4s1-fila">
          <CajonC glosa valores={{ [DEBE]: hecha ? M : null }} saldo={hecha ? D.cobro : 0} abre={hecha ? 1 : 0} reducido={reducido} alLlegar={primeraVez}
            destinos={destinosDe(e, "cobro", t.correcta, hecha, setEstado)} />
          <Bandeja destinos={destinosDe(e, "cobro", t.correcta, hecha, setEstado)} />
        </div>
        <Hueco lado={HABER} conBandeja />
        <Salidas glosa />
      </div>
    </Slide>
  );
}

/* ═══════════ 2 · consigna ═══════════ */

function FiguraConsigna({ t, D, estado, setEstado, reducido }) {
  const e = estado ?? HAZ_VACIO;
  const hecha = resueltaTarjeta(e, "consigna");
  const M = cifra(D.cobro);
  return (
    <Slide banda={<Banda antes={t.antes} dev={devUna(t, e, "consigna")} posibles={posiblesUna(t)} />}>
      <div className="t4s1">
        <Slot asiento={hecha ? t.asiento : null}>
          <Origen texto={t.tarjeta} cifra={M} clave="consigna" />
        </Slot>
        <div className="t4s1-fila">
          <CajonC valores={{ [DEBE]: M, [HABER]: hecha ? M : null }} saldo={hecha ? 0 : D.cobro} abre={hecha ? 1 : 0} reducido={reducido}
            destinos={destinosDe(e, "consigna", t.correcta, hecha, setEstado)} />
          <Bandeja destinos={destinosDe(e, "consigna", t.correcta, hecha, setEstado)} />
        </div>
        <Hueco lado={HABER} vivo={hecha} conBandeja />
        <Salidas bancos={hecha ? M : null} vivo={hecha ? ["bancos"] : []} />
      </div>
    </Slide>
  );
}

/* ═══════════ 3 · dos-salidas (Míralo) ═══════════ */

function FiguraSalidas({ t, D, estado, setEstado, reducido }) {
  const salio = estado?.salio ?? null;
  const [abre, setAbre] = useState(0);
  const M = cifra(D.cobro);
  /* Sin «Otra vez»: la otra salida sigue activa y, al tocarla, la plata vuelve y sale por ahí. */
  const sacar = (a) => { if (a === salio) return; setEstado({ salio: a }); setAbre((n) => n + 1); };
  const salida = (id, accion, nombre) => (
    <Control className="t4s1-salida" data-accion={accion} data-vivo={salio === id ? "" : undefined} aria-pressed={salio === id} nombre={`${FIGURA_CAJON.acciones[accion]}: ${nombre}`} onClick={() => sacar(id)}>
      <span className="t4s1-salida-a">{FIGURA_CAJON.acciones[accion]}</span>
      <span className="t4s1-caja2-n">{nombre}</span>
      {salio === id && <span className={`t4s1-cifra${reducido ? "" : " t4s1-entra"}`} key={`${id}-${abre}`} data-monto={id}>{M}</span>}
    </Control>
  );
  const antes = salio === "pago" ? [t.razonPagar] : t.antes;
  return (
    <Slide banda={<Banda antes={antes} posibles={[{ textos: t.antes }, { textos: [t.razonPagar] }]} />}>
      <div className="t4s1">
        <div className="t4s1-fila" data-sola>
          <CajonC valores={{ [DEBE]: M, [HABER]: salio ? M : null }} saldo={salio ? 0 : D.cobro} abre={abre} reducido={reducido} />
        </div>
        <Hueco lado={HABER} vivo={Boolean(salio)} />
        <div className="t4s1-sal">
          {salida("bancos", "consignar", FIGURA_CAJON.bancos)}
          {salida("pago", "pagar", FIGURA_CAJON.pago.join(" "))}
        </div>
      </div>
    </Slide>
  );
}

/* ═══════════ 4 · cheques ═══════════ */

function devCheques(t, e) {
  const id = e?.foco;
  const x = tarjeta(e, id);
  if (!x) return null;
  const ch = t.tarjetas.find((c) => c.id === id);
  if (correctoTarjeta(e, id)) return { ver: "mal", textos: [t.porque], n: x.intentos };
  if (x.ok) return { ver: "bien", textos: ch.acierto };
  return { ver: "mal", textos: [ch.errores[x.eleccion]], n: x.intentos };
}

function FiguraCheques({ t, estado, setEstado, reducido }) {
  const e = estado ?? HAZ_VACIO;
  const [uno, dos] = t.tarjetas;
  const r1 = resueltaTarjeta(e, uno.id);
  const r2 = resueltaTarjeta(e, dos.id);
  /* La segunda tarjeta llega 1,4 s después de resolver la primera (Hanayama §3); al volver con «Anterior», ya está. Con movimiento reducido, directa. */
  const [llego, setLlego] = useState(() => r1);
  useEffect(() => {
    if (!r1 || llego || reducido) return undefined;
    const reloj = setTimeout(() => setLlego(true), ESPERA_CHEQUE_MS);
    return () => clearTimeout(reloj);
  }, [r1, llego, reducido]);
  const segunda = r1 && (llego || reducido);
  const ch = segunda ? dos : uno;
  const enDebe = colocada(e, uno.id, uno.correcta);
  const enBandeja = colocada(e, dos.id, dos.correcta);
  const des = destinosDe(e, ch.id, ch.correcta, segunda ? r2 : r1, setEstado);
  const posibles = [
    { ver: "mal", textos: [t.porque] },
    ...t.tarjetas.flatMap((c) => [{ ver: "bien", textos: c.acierto }, ...Object.values(c.errores).map((x) => ({ ver: "mal", textos: [x] }))]),
  ];
  return (
    <Slide banda={<Banda antes={t.antes} dev={devCheques(t, e)} posibles={posibles} />}>
      <div className="t4s1">
        <Slot vivo={Boolean(enDebe) && !segunda}>
          <Origen texto={ch.tarjeta} clave={ch.id} />
        </Slot>
        <div className="t4s1-fila">
          <CajonC valores={{ [DEBE]: enDebe ? CHEQUE_EN_FIGURA[uno.id] : null }} destinos={des} reducido={reducido} />
          <Bandeja destinos={des} ultimo={enBandeja === NO_SE_MUEVE ? CHEQUE_EN_FIGURA[dos.id] : null} />
        </div>
        <Hueco conBandeja />
        <Salidas luz={enBandeja ? ["bancos"] : []} />
      </div>
    </Slide>
  );
}

/* ═══════════ 5 · el-faltante ═══════════ */

function FiguraFaltante({ t, D, estado, setEstado }) {
  const e = estado ?? HAZ_VACIO;
  const hecha = resueltaTarjeta(e, "faltante");
  /* Resuelta, se enciende lo que cuida la separación (el control 4): el tubo de entrada y las columnas. */
  const c = hecha ? CONTROLES_A1[t.control - 1] : null;
  return (
    <Slide banda={<Banda antes={t.antes} dev={devUna(t, e, "faltante")} posibles={posiblesUna(t)} />}>
      <div className="t4s1">
        <Slot vivo={Boolean(c?.vivo.includes("entrada"))} conBandeja={false}>
          <div className="t4s1-origen" data-origen>
            <span className="t4s1-origen-t">
              {ORIGEN_FALTANTE.cobrado} <span className="t4s1-cifra" data-monto="cobrado">{cifra(D.cobro)}</span>
              {" · "}
              {ORIGEN_FALTANTE.sinAnotar} <span className="t4s1-cifra" data-sin-anotar>{cifra(D.cobro - D.anotado)}</span>
            </span>
          </div>
        </Slot>
        <div className="t4s1-fila" data-sola>
          <CajonC linea valores={{ [DEBE]: cifra(D.anotado) }} saldo={D.anotado} luz={c?.luz ?? []} />
        </div>
        <Hueco />
        <Opciones
          opciones={t.opciones}
          etiqueta={t.titular}
          apagadas={hecha}
          ver={(id) => verDe(e, "faltante", id, t.correcta)}
          onElegir={(id) => setEstado((x) => calificar(x, "faltante", id, t.correcta))}
        />
      </div>
    </Slide>
  );
}

/* ═══════════ 6 · controles (Cierre) ═══════════ */

function FiguraControles({ t }) {
  useTerminada(A1_ID);
  /* Tocar un control es opcional: enciende la parte que vigila. No se califica ni se guarda. */
  const [k, setK] = useState(null);
  const c = k != null ? t.lista[k] : null;
  const luz = c?.luz ?? [];
  const vivo = c?.vivo ?? [];
  return (
    <Slide banda={<Banda antes={[t.cierre]} siguiente={t.siguiente} pie={t.pie} />}>
      <div className="t4s1">
        <div className="t4s1-rejilla" role="group" aria-label={t.titular} lang="es">
          {t.lista.map((x, i) => (
            <Control key={x.rotulo} className="t4s1-pill" data-control={i + 1} aria-pressed={k === i} nombre={x.rotulo} onClick={() => setK(i)}>
              <span lang="es">{x.rotulo}</span>
            </Control>
          ))}
        </div>
        <Hueco lado={DEBE} vivo={vivo.includes("entrada")} />
        <div className="t4s1-fila" data-sola>
          <CajonC linea saldo="—" luz={luz} />
        </div>
        <Hueco lado={HABER} vivo={vivo.includes("salida")} />
        <Salidas bajas luz={luz} vivo={vivo} />
      </div>
    </Slide>
  );
}

/* ═══════════ La pieza ═══════════ */

/* El nombre del dibujo, sin la respuesta de ninguna pantalla (D9). */
const NOMBRE_FIGURA = "La cuenta Caja como un cajón, con su Debe, su Haber y «En la caja», la bandeja «Caja no se mueve» y las salidas a Bancos y a Pago en efectivo";

export function piezaSlidesA1(caso = 1) {
  const t = SLIDES_A1[caso] ?? SLIDES_A1[1];
  const D = t.datos;
  const con = (Fig, datos) => (props) => <Fig t={datos} D={D} {...props} />;
  return {
    id: A1_ID,
    pantallas: [
      {
        id: "cobra", tipo: "haz", titular: t.cobra.titular, antes: t.cobra.antes, Figura: con(FiguraCobra, t.cobra), nombreFigura: NOMBRE_FIGURA,
        estadoInicial: HAZ_VACIO, resuelta: (e) => resueltaTarjeta(e, "cobro"), razon: RAZON_HAZ,
      },
      {
        id: "consigna", tipo: "haz", titular: t.consigna.titular, antes: t.consigna.antes, Figura: con(FiguraConsigna, t.consigna), nombreFigura: NOMBRE_FIGURA,
        estadoInicial: HAZ_VACIO, resuelta: (e) => resueltaTarjeta(e, "consigna"), razon: RAZON_HAZ,
      },
      {
        id: "dos-salidas", tipo: "miralo", titular: t.salidas.titular, antes: t.salidas.antes, Figura: con(FiguraSalidas, t.salidas), nombreFigura: NOMBRE_FIGURA,
        estadoInicial: { salio: null },
      },
      {
        id: "cheques", tipo: "haz", titular: t.cheques.titular, antes: t.cheques.antes, Figura: con(FiguraCheques, t.cheques), nombreFigura: NOMBRE_FIGURA,
        estadoInicial: HAZ_VACIO, resuelta: (e) => todasResueltas(e, t.cheques.tarjetas.map((c) => c.id)), razon: RAZON_HAZ,
      },
      {
        id: "el-faltante", tipo: "haz", titular: t.faltante.titular, antes: t.faltante.antes, Figura: con(FiguraFaltante, t.faltante), nombreFigura: NOMBRE_FIGURA,
        estadoInicial: HAZ_VACIO, resuelta: (e) => resueltaTarjeta(e, "faltante"), razon: RAZON_HAZ,
      },
      {
        id: "controles", tipo: "cierre", titular: t.controles.titular, antes: [t.controles.cierre], Figura: con(FiguraControles, t.controles), nombreFigura: NOMBRE_FIGURA,
      },
    ],
    /* Para las pruebas y la sonda: lo que la banda puede decir, por pantalla. */
    textos: t,
  };
}
