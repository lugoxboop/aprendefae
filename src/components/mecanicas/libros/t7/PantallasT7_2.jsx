import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { cifraK } from "../../../../contabilidad/t7_2Kardex.js";
import Kardex from "./KardexT7_2.jsx";
import { Plegable } from "./plegable.jsx";
import { textosDelError, contarFallo } from "./escaleraAyuda.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · LAS PANTALLAS DE APRENDER DE A3 A A6 (Célula C).
 *
 * Una pieza es una lista de pantallas, una a la vez, con las formas de A1 y
 * A2 de T7-2. Cuatro tipos:
 *
 *   · portada / lectura / resumen   textos y, según la pantalla, el
 *                enunciado y su ficha, la estructura del kárdex, la tabla de
 *                movimientos, cálculos, asientos en lectura, un kárdex, la
 *                lista numerada y «Siguiente»; botón y pie
 *   · eleccion   una pregunta con opciones barajadas en cada intento,
 *                «Confirmar», y «Incorrecto.» con «Probar otra» o «Correcto.»
 *                con «Seguir». Antes de la pregunta, lo que la pantalla traiga
 *                (encabezado, textos, ficha, asientos, cálculos, la tabla de
 *                los tres métodos, una lista de finales). Con el acierto, lo
 *                que se descubre: un asiento, cálculos, un kárdex, más texto
 *   · lados      líneas con su monto, barajadas al entrar, cada una con
 *                «Debe» | «Haber», como P3 de A2; «Probar otra» devuelve solo
 *                las equivocadas
 *
 * Los asientos van en el modo lectura del patrón tabular (DEBE en verde
 * azulado, HABER en ámbar, sangría en el haber, sin sumas); un monto que no
 * se muestra lleva el ● provisional de A2, a la espera de Watari. El kárdex
 * es el de la guía de Watari (KardexT7_2.jsx).
 *
 * Cada pantalla lleva su pie en todos sus estados. NO CALIFICA y no da FP:
 * es Aprender. Clases con el prefijo `t7bp-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };
export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto.", debe: "Debe", haber: "Haber" };
export const DEBE = "debe";
export const HABER = "haber";

/* Lo mismo que en A2: el nombre de un asiento y de un monto oculto para el lector, pendientes de revisión. */
export const PENDIENTE_DE_REVISION = {
  nombreAsiento: (fecha) => `Asiento del ${fecha}`,
  montoOculto: "monto que no se muestra",
};

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", debe: "#2A9D8F", haber: "#E9C46A", error: "#E76F51" };

export const CSS_T7BP = `
.t7bp { display: grid; gap: 12px; min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.4; container: t7bp / inline-size; }
.t7bp * { box-sizing: border-box; }
.t7bp-p { margin: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t7bp-nota { margin: 0; font-size: 14px; line-height: 1.45; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7bp-h { margin: 0; font: 600 13px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .02em; overflow-wrap: anywhere; }
.t7bp-preg { font: 600 15px/1.45 "Sora", "Inter", sans-serif; }
.t7bp-enunciado { margin: 0; padding: 10px 12px; border-left: 3px solid ${P.borde}; background: rgba(184,196,212,0.08); border-radius: 0 8px 8px 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t7bp-lista { margin: 0; padding-left: 22px; display: grid; gap: 6px; font-size: 15px; line-height: 1.45; }
.t7bp-lista li { overflow-wrap: anywhere; list-style: decimal; }
.t7bp-lista li::marker { color: ${P.texto2}; font-variant-numeric: tabular-nums; }
.t7bp-pie { margin: 4px 0 0; font-size: 12px; line-height: 1.4; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7bp-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${P.texto}; background: ${P.texto}; color: ${P.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t7bp-btn[aria-disabled="true"] { background: transparent; color: ${P.texto2}; border-color: ${P.texto2}; cursor: default; }
.t7bp-btn:focus-visible, .t7bp-op:focus-visible, .t7bp-lado:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
.t7bp-ficha { margin: 0; display: grid; gap: 6px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7bp-ficha dt { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; letter-spacing: .02em; }
.t7bp-ficha dd { margin: 0 0 4px; font-size: 15px; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t7bp-ops { display: grid; gap: 8px; }
.t7bp-op { appearance: none; text-align: left; min-height: 44px; padding: 10px 14px; border: 1px solid ${P.borde}; border-radius: 12px; background: transparent; color: ${P.texto}; font: 400 15px/1.35 "Inter", sans-serif; cursor: pointer; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t7bp-op[aria-pressed="true"] { background: ${P.texto}; color: ${P.fondo}; border-color: ${P.texto}; }
.t7bp-op:disabled { cursor: default; }
.t7bp-op-error { border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7bp-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 10px 12px; border-radius: 8px; border: 1px solid; outline: none; }
.t7bp-msg-error { border-color: ${P.error}; }
.t7bp-msg-ok { border-color: ${P.borde}; }
.t7bp-msg svg { margin-top: 2px; }
.t7bp-msg-cuerpo { display: grid; gap: 6px; min-width: 0; }
.t7bp-msg-palabra { font: 600 14px/1.35 "Inter", sans-serif; }
.t7bp-msg-error .t7bp-msg-palabra { color: ${P.error}; }
.t7bp-msg p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
.t7bp-calcs { display: grid; gap: 4px; }
.t7bp-calc-l { margin: 0; font: 400 14px/1.45 "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${P.texto2}; overflow-wrap: anywhere; }
/* la estructura del kárdex (A3, P1) */
.t7bp-est { margin: 0; padding: 4px 12px; list-style: none; border: 1px solid ${P.borde}; border-radius: 10px; display: grid; }
.t7bp-est li { list-style: none; padding-block: 8px; font-size: 14px; line-height: 1.35; overflow-wrap: anywhere; }
.t7bp-est li + li { border-top: 1px solid ${P.borde}; }
/* tabla de movimientos: fecha y movimiento */
.t7bp-mov { display: grid; border: 1px solid ${P.borde}; border-radius: 10px; padding: 4px 12px; }
.t7bp-mov-f { display: grid; grid-template-columns: minmax(0, 5.5em) minmax(0, 1fr); gap: 10px; padding-block: 8px; font-size: 14px; line-height: 1.35; font-variant-numeric: tabular-nums; }
.t7bp-mov-f + .t7bp-mov-f { border-top: 1px solid ${P.borde}; }
.t7bp-mov-h { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; }
.t7bp-mov-f > span { overflow-wrap: anywhere; min-width: 0; }
/* asiento en lectura */
.t7bp-as { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7bp-g2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.t7bp-as-h { display: grid; gap: 6px; padding-bottom: 6px; font: 600 13px "Sora", "Inter", sans-serif; }
.t7bp-as-h .t7bp-g2 > span { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; text-align: right; padding-inline: 9px; }
.t7bp-d { color: ${P.debe}; } .t7bp-hb { color: ${P.haber}; }
.t7bp-as-r { display: grid; gap: 4px; padding-block: 8px; border-top: 1px solid ${P.borde}; }
.t7bp-as-r > span:first-child { font-size: 14px; overflow-wrap: anywhere; min-width: 0; }
.t7bp-as-r .t7bp-g2 > span { text-align: right; padding-inline: 9px; font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; min-width: 0; }
.t7bp-sangria { padding-left: 24px; }
.t7bp-oculto { color: ${P.texto2}; }
/* cierre por nombres (A4, P6): «cuenta → cuenta», sin montos */
.t7bp-cierre { margin: 0; padding: 4px 12px; list-style: none; border: 1px solid ${P.borde}; border-radius: 10px; display: grid; }
.t7bp-cierre li { list-style: none; padding-block: 8px; font-size: 14px; line-height: 1.35; overflow-wrap: anywhere; }
.t7bp-cierre li + li { border-top: 1px solid ${P.borde}; }
/* tabla de tres métodos (A3, P6): tres columnas; apiladas con 341 px o menos */
.t7bp-er { display: grid; grid-template-columns: minmax(0, 1fr); border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; min-width: 0; }
.t7bp-er-head { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; padding-bottom: 6px; }
.t7bp-er-head > span { font: 600 12px/1.2 "Sora", "Inter", sans-serif; text-align: right; padding-inline: 7px; overflow-wrap: anywhere; }
.t7bp-er-r { display: grid; gap: 6px; padding-block: 8px; border-top: 1px solid ${P.borde}; }
.t7bp-er-rubro { font-size: 14px; line-height: 1.35; }
.t7bp-er-v { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.t7bp-er-c { display: flex; justify-content: flex-end; align-items: center; min-width: 0; }
.t7bp-er-cap { display: none; }
.t7bp-er-dato { padding-inline: 7px; font: 500 14px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
@container t7bp (max-width: 341px) {
  .t7bp-er-head { display: none; }
  .t7bp-er-head + .t7bp-er-r { border-top: 0; padding-top: 0; }
  .t7bp-er-v { grid-template-columns: minmax(0, 1fr); gap: 4px; }
  .t7bp-er-c { display: grid; grid-template-columns: 96px minmax(0, 1fr); align-items: center; gap: 8px; }
  .t7bp-er-cap { display: block; font-size: 12px; line-height: 1.3; color: ${P.texto2}; overflow-wrap: anywhere; }
  .t7bp-er-dato { justify-self: end; font-size: 15px; padding-inline: 8px; }
}
/* lados */
.t7bp-lineas { display: grid; gap: 10px; }
.t7bp-la { display: grid; gap: 8px; min-width: 0; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7bp-la-mala { border-color: ${P.error}; }
.t7bp-la-cab { margin: 0; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 10px; font-size: 15px; line-height: 1.45; }
.t7bp-la-cab > span:first-child { overflow-wrap: anywhere; min-width: 0; }
.t7bp-monto { margin-left: auto; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${P.texto2}; }
.t7bp-lado { position: relative; appearance: none; min-height: 44px; min-width: 0; padding: 0 8px; border: 1px dashed ${P.borde}; border-radius: 8px; background: transparent; font: 600 15px/1 "Inter", sans-serif; cursor: pointer; transition: background-color .12s, border-color .12s, box-shadow .12s; }
.t7bp-lado-debe { color: ${P.debe}; }
.t7bp-lado-haber { color: ${P.haber}; }
.t7bp-lado[aria-pressed="true"] { border-style: solid; color: ${P.fondo}; }
.t7bp-lado-debe[aria-pressed="true"] { background: ${P.debe}; border-color: ${P.debe}; }
.t7bp-lado-haber[aria-pressed="true"] { background: ${P.haber}; border-color: ${P.haber}; }
.t7bp-lado-error[aria-pressed="true"] { box-shadow: 0 0 0 2px ${P.fondo}, 0 0 0 4px ${P.error}; }
.t7bp-lado[aria-disabled="true"] { cursor: default; }
.t7bp-marca { position: absolute; top: -9px; left: -9px; width: 18px; height: 18px; border-radius: 50%; background: ${P.fondo}; border: 1px solid ${P.error}; display: grid; place-items: center; line-height: 0; color: ${P.error}; }
.t7bp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.t7bp-nueva { animation: t7bp-aparece .12s ease-out; }
@keyframes t7bp-aparece { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .t7bp *, .t7bp *::before, .t7bp *::after { transition: none !important; animation: none !important; } }
`;

const nombreLado = (lado) => (lado === DEBE ? INTERFAZ.debe : INTERFAZ.haber);

function Pie({ texto }) { return <p className="t7bp-pie" data-pie>{texto}</p>; }

function Boton({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t7bp-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

function Mensaje({ ok, textos, refFoco }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t7bp-msg ${ok ? "t7bp-msg-ok" : "t7bp-msg-error"}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color={P.error} aria-hidden="true" />}
      <div className="t7bp-msg-cuerpo">
        <span className="t7bp-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        {textos.map((t) => <p key={t} data-texto><Plegable texto={t} /></p>)}
      </div>
    </div>
  );
}

const Textos = ({ lista, clase = "t7bp-p", nueva = false }) => (lista ?? []).map((t) => <p key={t} className={`${clase}${nueva ? " t7bp-nueva" : ""}`} data-texto><Plegable texto={t} /></p>);

function Ficha({ ficha }) {
  return (
    <dl className="t7bp-ficha" data-ficha>
      {ficha.map((f) => (
        <div key={f.dato} data-dato>
          <dt>{f.dato}</dt>
          <dd data-texto data-ficha-texto>{f.texto}</dd>
        </div>
      ))}
    </dl>
  );
}

function Calculos({ lista }) {
  return (
    <div className="t7bp-calcs" data-calculos>
      {lista.map((c) => <p key={c} className="t7bp-calc-l" data-texto data-calculo>{c}</p>)}
    </div>
  );
}

function Estructura({ lista }) {
  return <ul className="t7bp-est" data-estructura>{lista.map((t) => <li key={t} data-texto>{t}</li>)}</ul>;
}

function Movimientos({ tabla }) {
  return (
    <div className="t7bp-mov" role="table" aria-label={tabla.nombre ?? tabla.columnas.join(" y ")} data-movimientos>
      <div className="t7bp-mov-f" role="row">
        {tabla.columnas.map((c) => <span key={c} className="t7bp-mov-h" role="columnheader">{c}</span>)}
      </div>
      {tabla.filas.map((f) => (
        <div key={f[0]} className="t7bp-mov-f" role="row" data-movimiento={f[0]}>
          {f.map((c, k) => <span key={k} role={k ? "cell" : "rowheader"} data-texto>{c}</span>)}
        </div>
      ))}
    </div>
  );
}

/* Un asiento en lectura. monto null = monto que no se muestra (●). */
export function Asiento({ asiento, nuevo = false }) {
  const monto = (l, lado) => {
    if (l.lado !== lado) return "";
    if (l.monto === null) {
      return (
        <span className="t7bp-oculto" data-oculto data-revision="pendiente">
          <span aria-hidden="true">●</span>
          <span className="t7bp-sr">{PENDIENTE_DE_REVISION.montoOculto}</span>
        </span>
      );
    }
    return cifraK(l.monto);
  };
  return (
    <div className={`t7bp-as${nuevo ? " t7bp-nueva" : ""}`} role="table" aria-label={asiento.nombre ?? PENDIENTE_DE_REVISION.nombreAsiento(asiento.fecha)} data-asiento={asiento.fecha} data-revision="pendiente">
      <div className="t7bp-as-h" role="row">
        <span role="columnheader" data-fecha>{asiento.fecha}</span>
        <span className="t7bp-g2">
          <span className="t7bp-d" role="columnheader">{INTERFAZ.debe}</span>
          <span className="t7bp-hb" role="columnheader">{INTERFAZ.haber}</span>
        </span>
      </div>
      {asiento.lineas.map((l, k) => (
        <div key={`${l.cuenta}-${k}`} className="t7bp-as-r" role="row" data-linea={l.cuenta} data-lado={l.lado}>
          <span role="rowheader" className={l.lado === DEBE ? undefined : "t7bp-sangria"}>{l.cuenta}</span>
          <span className="t7bp-g2">
            <span role="cell">{monto(l, DEBE)}</span>
            <span role="cell">{monto(l, HABER)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

const Asientos = ({ lista, nuevo = false }) => (lista ?? []).map((a) => <Asiento key={`${a.fecha}-${a.lineas[0].cuenta}`} asiento={a} nuevo={nuevo} />);

/* Los asientos del cierre por nombre: «cuenta → cuenta», sin montos. */
function CierrePorNombres({ lista }) {
  return <ul className="t7bp-cierre" data-cierre>{lista.map((t) => <li key={t} data-texto>{t}</li>)}</ul>;
}

export function TresMetodos({ tabla }) {
  return (
    <div className="t7bp-er" role="table" aria-label={tabla.nombre} data-metodos>
      <div className="t7bp-er-head" role="row">
        {tabla.metodos.map((m) => <span key={m} role="columnheader">{m}</span>)}
      </div>
      {tabla.filas.map((f) => (
        <div key={f.rubro} className="t7bp-er-r" role="row" data-rubro={f.rubro}>
          <span className="t7bp-er-rubro" role="rowheader" data-texto>{f.rubro}</span>
          <span className="t7bp-er-v">
            {f.valores.map((v, i) => (
              <span key={i} className="t7bp-er-c" role="cell">
                <span className="t7bp-er-cap" aria-hidden="true">{tabla.metodos[i]}</span>
                <span className="t7bp-er-dato" data-dato-metodo={i}>{cifraK(v)}</span>
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Lo que una pantalla trae antes de su pregunta o de su botón. */
function Cuerpo({ p, kardexDe }) {
  return (
    <>
      {p.encabezado && <p className="t7bp-h" data-texto data-encabezado>{p.encabezado}</p>}
      {p.objetivo && <p className="t7bp-p" data-texto data-objetivo>{p.objetivo}</p>}
      <Textos lista={p.parrafos} />
      {p.enunciado && <p className="t7bp-enunciado" data-texto data-enunciado>{p.enunciado}</p>}
      {p.ficha && <Ficha ficha={p.ficha} />}
      {p.estructura && <Estructura lista={p.estructura} />}
      {p.finales && <ul className="t7bp-est" data-finales>{p.finales.map((t) => <li key={t} data-texto>{t}</li>)}</ul>}
      {p.movimientos && <Movimientos tabla={p.movimientos} />}
      <Asientos lista={p.asientos} />
      {p.cierre && <CierrePorNombres lista={p.cierre} />}
      {p.calculos && <Calculos lista={p.calculos} />}
      {p.tabla && <TresMetodos tabla={p.tabla} />}
      {p.kardex && <Kardex kardex={kardexDe(p.kardex)} nota={p.notaKardex ?? null} />}
      <Textos lista={p.despues} />
    </>
  );
}

/* ═══════════ ELECCIÓN ═══════════ */

function Eleccion({ pantalla, onSeguir, kardexDe }) {
  const [orden, setOrden] = useState(() => barajar(pantalla.opciones));
  const [elegida, setElegida] = useState(null);
  const [confirmada, setConfirmada] = useState(null);
  /* Cuántas veces se ha fallado esta pregunta: la escalera de ayuda (escaleraAyuda.js). */
  const [fallos, setFallos] = useState(0);
  const ref = useRef(null);
  const opcion = confirmada ? pantalla.opciones.find((o) => o.id === confirmada) : null;
  const estado = !opcion ? "colocando" : opcion.correcta ? "acierto" : "error";
  useEffect(() => { if (estado !== "colocando") ref.current?.focus(); }, [estado]);
  const pie = estado === "colocando" ? pantalla.pie : estado === "error" ? pantalla.error.pie : pantalla.acierto.pie;
  const a = pantalla.acierto;

  return (
    <div className="t7bp" data-eleccion={pantalla.id} data-estado={estado}>
      <Cuerpo p={pantalla} kardexDe={kardexDe} />
      <p className="t7bp-p t7bp-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t7bp-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button key={o.id} type="button" className={`t7bp-op${estado === "error" && esta ? " t7bp-op-error" : ""}`} data-opcion={o.id} aria-pressed={esta} disabled={Boolean(confirmada)} onClick={() => setElegida(o.id)}>
              {o.texto}
            </button>
          );
        })}
      </div>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!elegida} onClick={() => { contarFallo(pantalla, elegida, setFallos); setConfirmada(elegida); }} />}
      {estado === "error" && (
        <>
          <Mensaje ok={false} textos={textosDelError(pantalla, opcion, fallos)} refFoco={ref} />
          <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={() => { setOrden((x) => barajarDistinto(pantalla.opciones, x, (o) => o.id)); setElegida(null); setConfirmada(null); }} />
        </>
      )}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={[a.texto]} refFoco={ref} />
          <Asientos lista={a.asientos} nuevo />
          {a.calculos && <div className="t7bp-nueva"><Calculos lista={a.calculos} /></div>}
          {a.kardex && <div className="t7bp-nueva"><Kardex kardex={kardexDe(a.kardex)} nota={a.notaKardex ?? null} /></div>}
          <Textos lista={a.despues} nueva />
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={pie} />
    </div>
  );
}

/* ═══════════ LADOS ═══════════ */

function Lados({ pantalla, onSeguir, kardexDe }) {
  const [orden] = useState(() => barajar(pantalla.lineas));
  const [puesto, setPuesto] = useState({});
  const [veredicto, setVeredicto] = useState(null);
  const ref = useRef(null);
  const malas = veredicto?.malas ?? [];
  const estado = !veredicto ? "colocando" : malas.length ? "error" : "acierto";
  useEffect(() => { if (estado !== "colocando") ref.current?.focus(); }, [estado]);
  const completo = pantalla.lineas.every((l) => puesto[l.id]);
  const pie = estado === "colocando" ? pantalla.pie : estado === "error" ? pantalla.error.pie : pantalla.acierto.pie;

  const tocar = (l, lado) => {
    if (estado !== "colocando") return;
    setPuesto((p) => ({ ...p, [l.id]: p[l.id] === lado ? undefined : lado }));
  };
  const confirmar = () => setVeredicto({ malas: orden.filter((l) => puesto[l.id] !== l.lado).map((l) => l.id) });
  const probarOtra = () => {
    setPuesto((p) => { const n = { ...p }; for (const id of malas) delete n[id]; return n; });
    setVeredicto(null);
  };

  return (
    <div className="t7bp" data-lados={pantalla.id} data-estado={estado}>
      <Cuerpo p={pantalla} kardexDe={kardexDe} />
      <p className="t7bp-p" data-texto data-consigna>{pantalla.consigna}</p>
      <div className="t7bp-lineas" role="group" aria-label={pantalla.consigna}>
        {orden.map((l) => {
          const lado = puesto[l.id];
          const mala = malas.includes(l.id);
          const boton = (cual) => {
            const esta = lado === cual;
            const error = esta && mala;
            return (
              <button
                type="button"
                className={`t7bp-lado t7bp-lado-${cual}${error ? " t7bp-lado-error" : ""}`}
                data-linea={l.id}
                data-lado={cual}
                aria-pressed={esta}
                aria-disabled={estado !== "colocando" ? "true" : undefined}
                aria-label={`${l.cuenta}, ${cifraK(l.monto)}: ${nombreLado(cual)}${error ? ", incorrecto" : ""}`}
                onClick={() => tocar(l, cual)}
              >
                {error && <span className="t7bp-marca" data-marca><X size={12} aria-hidden="true" /></span>}
                {nombreLado(cual)}
              </button>
            );
          };
          return (
            <div key={l.id} className={`t7bp-la${mala ? " t7bp-la-mala" : ""}`} data-fila={l.id}>
              <p className="t7bp-la-cab">
                <span data-texto data-cuenta>{l.cuenta}</span>
                <span className="t7bp-monto" data-monto>{cifraK(l.monto)}</span>
              </p>
              <span className="t7bp-g2">{boton(DEBE)}{boton(HABER)}</span>
              {mala && estado === "error" && <Mensaje ok={false} textos={[l.devolucion]} refFoco={l.id === malas[0] ? ref : undefined} />}
            </div>
          );
        })}
      </div>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!completo} onClick={confirmar} />}
      {estado === "error" && <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={probarOtra} />}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={[pantalla.acierto.texto]} refFoco={ref} />
          <Asientos lista={pantalla.acierto.asientos} nuevo />
          <Textos lista={pantalla.acierto.despues} nueva />
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={pie} />
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function PantallasT7_2({ pieza, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);
  const kardexDe = (clave) => pieza.kardex[clave];

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_T7BP}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        {p.tipo === "eleccion" && <Eleccion key={p.id} pantalla={p} onSeguir={seguir} kardexDe={kardexDe} />}
        {p.tipo === "lados" && <Lados key={p.id} pantalla={p} onSeguir={seguir} kardexDe={kardexDe} />}
        {(p.tipo === "portada" || p.tipo === "lectura" || p.tipo === "resumen") && (
          <div className="t7bp">
            <Cuerpo p={p} kardexDe={kardexDe} />
            {p.lista && (
              <ol className="t7bp-lista" data-lista>
                {p.lista.map((t) => <li key={t} data-texto>{t}</li>)}
              </ol>
            )}
            {p.siguiente && <p className="t7bp-nota" data-texto data-siguiente>{p.siguiente}</p>}
            {p.boton && <Boton nombre={p.tipo === "portada" ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <Pie texto={p.pie} />
          </div>
        )}
      </div>
    </Panel>
  );
}
