import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_EL_CIERRE, BOTON, INTERFAZ, PENDIENTE_DE_REVISION, FECHA, DEBE, HABER, cifra } from "../../../../data/contabilidadT7_1_ap4.js";
import { Plegable } from "./plegable.jsx";
import { textosDelError, contarFallo, textosDeLinea, lineaCerrada, sumarFallosDeLineas, puestoTrasProbarOtra, sinAsiEs } from "./escaleraAyuda.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP4 «El cierre en periódico» — el RECORTE del lote 1 de Near, con
 * las correcciones de Mello. Ocho pantallas, una a la vez. Cinco tipos:
 *
 *   · lectura      P0, P2 (la ficha de totales; las 10 operaciones del mes,
 *                  plegadas tras «Ver las operaciones del mes») y P7 (la
 *                  cuenta en una línea, como figura)
 *   · prediccion   P1: la apuesta. Sin calificar y sin puntos: al elegir sale
 *                  «Guardamos tu apuesta…» y el botón para seguir. Lo elegido
 *                  vive en el estado de la pieza y marca su columna en P6
 *   · lados        P3: «Inventario de mercancías» una sola vez, arriba de sus
 *                  dos líneas, cada una con Debe | Haber; los otros asientos
 *                  del cierre, plegados. El error va bajo su línea; «Probar
 *                  otra» devuelve solo las mal puestas
 *   · eleccion     P4 y P6: opciones barajadas en cada intento. En P6, la
 *                  tabla de los tres métodos muestra solo «Inventario final»
 *                  hasta el acierto (Mello); la columna de la apuesta va con
 *                  borde, sin texto
 *   · tocar-filas  P5: el estado de resultados en filas; cada utilidad es un
 *                  botón que abre su definición, una a la vez
 *
 * NO CALIFICA y no da FP: es Aprender. Clases con el prefijo `t7a4-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", debe: "#2A9D8F", haber: "#E9C46A", error: "#E76F51" }; /* lado */

export const CSS_AP4 = `
.t7a4 { display: grid; gap: 12px; min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.4; container: t7a4 / inline-size; }
.t7a4 * { box-sizing: border-box; }
.t7a4-p { margin: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t7a4-nota { margin: 0; font-size: 14px; line-height: 1.45; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a4-preg { font: 600 15px/1.45 "Sora", "Inter", sans-serif; }
.t7a4-h { margin: 0; font: 600 13px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .02em; overflow-wrap: anywhere; }
.t7a4-pie { margin: 4px 0 0; font-size: 12px; line-height: 1.4; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a4-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${P.texto}; background: ${P.texto}; color: ${P.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t7a4-btn[aria-disabled="true"] { background: transparent; color: ${P.texto2}; border-color: ${P.texto2}; cursor: default; }
.t7a4-btn:focus-visible, .t7a4-op:focus-visible, .t7a4-cas:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
.t7a4-ficha { margin: 0; display: grid; gap: 6px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7a4-ficha dt { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; letter-spacing: .02em; }
.t7a4-ficha dd { margin: 0 0 4px; display: grid; gap: 2px; font-size: 15px; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t7a4-ops { display: grid; gap: 8px; }
.t7a4-op { appearance: none; text-align: left; min-height: 44px; padding: 10px 14px; border: 1px solid ${P.borde}; border-radius: 12px; background: transparent; color: ${P.texto}; font: 400 15px/1.35 "Inter", sans-serif; cursor: pointer; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t7a4-op[aria-pressed="true"] { background: ${P.texto}; color: ${P.fondo}; border-color: ${P.texto}; }
.t7a4-op:disabled { cursor: default; }
.t7a4-op-error { border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7a4-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 10px 12px; border-radius: 8px; border: 1px solid; outline: none; }
.t7a4-msg-error { border-color: ${P.error}; }
.t7a4-msg-ok { border-color: ${P.borde}; }
.t7a4-msg svg { margin-top: 2px; }
.t7a4-msg-cuerpo { display: grid; gap: 6px; min-width: 0; }
.t7a4-msg-palabra { font: 600 14px/1.35 "Inter", sans-serif; }
.t7a4-msg-error .t7a4-msg-palabra { color: ${P.error}; }
.t7a4-msg p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
.t7a4-err { margin-top: 2px; }
.t7a4-calcs { display: grid; gap: 4px; }
.t7a4-calc-l { margin: 0; font: 400 14px/1.45 "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a4-calc-l b { color: ${P.texto}; font-weight: 600; }
/* asientos en lectura (modo RESUMEN del patrón, con borde de tarjeta) */
.t7a4-as { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7a4-g2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.t7a4-as-h { display: grid; gap: 6px; padding-bottom: 6px; font: 600 13px "Sora", "Inter", sans-serif; }
.t7a4-as-h .t7a4-g2 > span, .t7a4-dh span { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; text-align: right; padding-inline: 9px; }
.t7a4-d { color: ${P.debe}; } .t7a4-hb { color: ${P.haber}; }
.t7a4-as-r { display: grid; gap: 4px; padding-block: 8px; border-top: 1px solid ${P.borde}; }
.t7a4-as-r > span:first-child { font-size: 14px; overflow-wrap: anywhere; min-width: 0; }
.t7a4-as-r .t7a4-g2 > span { text-align: right; padding-inline: 9px; font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; min-width: 0; }
.t7a4-sangria { padding-left: 24px; }
/* las dos líneas que se colocan */
.t7a4-u { border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; display: grid; gap: 10px; min-width: 0; }
.t7a4-dh { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.t7a4-la { display: grid; gap: 6px; min-width: 0; }
.t7a4-la + .t7a4-la { padding-top: 8px; }
.t7a4-cuenta { display: grid; gap: 2px; font-size: 15px; overflow-wrap: anywhere; min-width: 0; }
.t7a4-cas { position: relative; appearance: none; display: flex; align-items: center; justify-content: flex-end; min-height: 44px; min-width: 0; padding: 0 8px; border: 1px dashed ${P.borde}; border-radius: 6px; background: transparent; color: ${P.texto}; font: 500 15px/1 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; cursor: pointer; transition: box-shadow .12s, border-color .12s; }
.t7a4-cas-objetivo { border-style: solid; border-color: ${P.texto}; box-shadow: inset 0 0 0 1px ${P.texto}; }
.t7a4-cas-llena { border-style: solid; border-color: ${P.borde}; }
.t7a4-cas-error { border-style: solid; border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7a4-marca { position: absolute; top: -7px; left: -7px; width: 16px; height: 16px; border-radius: 50%; background: ${P.fondo}; display: block; line-height: 0; color: ${P.error}; }
/* estado de resultados de tres columnas (patrón v3.2): tres columnas iguales; apilado con 341 px o menos */
.t7a4-er { display: grid; grid-template-columns: minmax(0, 1fr); border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; min-width: 0; }
.t7a4-er-head { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; padding-bottom: 6px; }
.t7a4-er-head > span { font: 600 12px/1.2 "Sora", "Inter", sans-serif; text-align: right; padding-inline: 7px; overflow-wrap: anywhere; }
.t7a4-er-r { display: grid; gap: 6px; padding-block: 8px; border-top: 1px solid ${P.borde}; }
.t7a4-er-rubro { font-size: 14px; line-height: 1.35; }
.t7a4-er-v { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.t7a4-er-c { display: flex; justify-content: flex-end; align-items: center; min-width: 0; }
.t7a4-er-cap { display: none; }
.t7a4-er-dato { padding-inline: 7px; font: 500 14px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
@container t7a4 (max-width: 341px) {
  .t7a4-er-head { display: none; }
  .t7a4-er-head + .t7a4-er-r { border-top: 0; padding-top: 0; }
  .t7a4-er-v { grid-template-columns: minmax(0, 1fr); gap: 4px; }
  .t7a4-er-c { display: grid; grid-template-columns: 88px minmax(0, 1fr); align-items: center; gap: 8px; }
  .t7a4-er-cap { display: block; font-size: 12px; line-height: 1.3; color: ${P.texto2}; overflow-wrap: anywhere; }
  .t7a4-er-dato { justify-self: end; font-size: 15px; padding-inline: 8px; }
}
.t7a4-nueva { animation: t7a4-aparece .12s ease-out; }
@keyframes t7a4-aparece { from { opacity: 0; } to { opacity: 1; } }
.t7a4-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .t7a4 *, .t7a4 *::before, .t7a4 *::after { transition: none !important; animation: none !important; } }

/* P1 y P2: la figura de valores y la ficha de totales */
.t7a4-fig { margin: 0; display: grid; gap: 6px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; min-width: 0; }
.t7a4-fig-f { margin: 0; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; font-size: 15px; line-height: 1.4; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t7a4-fig-f > b { margin-left: auto; font-weight: 600; white-space: nowrap; }
.t7a4-fig-f + .t7a4-fig-f { border-top: 1px solid ${P.borde}; padding-top: 6px; }
.t7a4-rot { color: ${P.texto2}; }
.t7a4-una { margin: 0; font: 600 16px/1.45 "Sora", "Inter", sans-serif; overflow-wrap: anywhere; }
/* lo plegado: «Ver las operaciones del mes», «Ver los otros asientos del cierre» */
.t7a4-plegar { appearance: none; display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 44px; width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid ${P.borde}; background: transparent; color: ${P.texto}; font: 600 15px/1.3 "Inter", sans-serif; text-align: left; cursor: pointer; }
.t7a4-plegar svg { flex: none; transition: transform .12s; }
.t7a4-plegar[aria-expanded="true"] svg { transform: rotate(180deg); }
.t7a4-plegar:focus-visible, .t7a4-res-btn:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
/* P3: el nombre de la cuenta, una sola vez */
.t7a4-cuenta-h { margin: 0; font: 600 15px/1.35 "Sora", "Inter", sans-serif; overflow-wrap: anywhere; }
.t7a4-guardada { padding: 10px 12px; border-radius: 8px; border: 1px solid ${P.borde}; outline: none; }
.t7a4-guardada p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
/* P5: el estado de resultados en filas; las utilidades se tocan */
.t7a4-res { margin: 0; display: grid; border: 1px solid ${P.borde}; border-radius: 10px; padding: 4px 12px; min-width: 0; }
.t7a4-res-f { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; padding-block: 8px; font-size: 14px; line-height: 1.35; overflow-wrap: anywhere; }
.t7a4-res-f + .t7a4-res-f { border-top: 1px solid ${P.borde}; }
.t7a4-res-f > b, .t7a4-res-btn > b { margin-left: auto; font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t7a4-res-u { display: grid; gap: 4px; padding-block: 4px; }
.t7a4-res-btn { appearance: none; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 2px 8px; min-height: 44px; padding: 6px 8px; margin-inline: -8px; width: calc(100% + 16px); border: 1px dashed ${P.borde}; border-radius: 8px; background: transparent; color: ${P.texto}; font: 600 14px/1.35 "Inter", sans-serif; text-align: left; cursor: pointer; overflow-wrap: anywhere; }
.t7a4-res-btn[aria-expanded="true"] { border-style: solid; border-color: ${P.texto}; }
.t7a4-def { margin: 0 0 4px; font-size: 14px; line-height: 1.45; color: ${P.texto}; overflow-wrap: anywhere; }
/* P6: la columna de la apuesta, con borde y sin texto */
.t7a4-er-apuesta { box-shadow: inset 0 0 0 2px ${P.texto}; border-radius: 6px; padding-inline: 6px; }`;

const nombreLado = (lado) => (lado === DEBE ? INTERFAZ.debe : INTERFAZ.haber);

function Pie({ texto }) { return <p className="t7a4-pie" data-pie>{texto}</p>; }

function Boton({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t7a4-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

/* `porques`: el plegado escrito aparte de un texto (de Near), por texto. */
function Mensaje({ ok, textos, porques = {}, refFoco, clase = "" }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t7a4-msg ${ok ? "t7a4-msg-ok" : "t7a4-msg-error"} ${clase}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color={P.error} aria-hidden="true" />}
      <div className="t7a4-msg-cuerpo">
        <span className="t7a4-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        {textos.map((t) => <p key={t} data-texto><Plegable texto={t} porque={porques[t] ?? null} /></p>)}
      </div>
    </div>
  );
}

/* El resultado de cada cálculo, en blanco: lo que va después del último «= » y antes de « · ». */
function Calculos({ lista, nueva = false }) {
  if (!lista?.length) return null;
  return (
    <div className={`t7a4-calcs${nueva ? " t7a4-nueva" : ""}`} data-calculos>
      {lista.map((c) => {
        const i = c.lastIndexOf("= ");
        const j = c.indexOf(" · ", i);
        const fin = j < 0 ? c.length : j;
        return <p key={c} className="t7a4-calc-l" data-texto data-calculo>{c.slice(0, i + 2)}<b>{c.slice(i + 2, fin)}</b>{c.slice(fin)}</p>;
      })}
    </div>
  );
}

/* Un botón que abre y cierra lo plegado, con aria-expanded. */
function Plegar({ nombre, texto, abierto, controla, onClick }) {
  return (
    <button type="button" className="t7a4-plegar" data-plegar={nombre} aria-expanded={abierto} aria-controls={controla} onClick={onClick}>
      <span data-texto>{texto}</span>
      <ChevronDown size={18} aria-hidden="true" />
    </button>
  );
}

/* Las operaciones del mes (P2), plegadas: como la ficha de la v2.1. */
function Ficha({ ficha, id }) {
  return (
    <dl className="t7a4-ficha" id={id} data-operaciones>
      {ficha.map((f) => (
        <div key={f.dato} data-dato>
          <dt data-texto>{f.dato}</dt>
          <dd>{f.partes.map((x) => <span key={x} data-texto data-parte>{x}</span>)}</dd>
        </div>
      ))}
    </dl>
  );
}

/* «Inventario inicial: 5.200 unidades, $6.760.000»: el rótulo, en gris. El texto del renglón es el original. */
function Total({ texto }) {
  const i = texto.indexOf(": ");
  return <p className="t7a4-fig-f" data-texto data-total><span className="t7a4-rot">{texto.slice(0, i + 1)}</span>{" "}<span>{texto.slice(i + 2)}</span></p>;
}

/* ═══════════ LOS ASIENTOS, EN LECTURA ═══════════ */

export function Asientos({ lineas, id }) {
  return (
    <div className="t7a4-as" role="table" id={id} aria-label={PENDIENTE_DE_REVISION.nombreAsientos(FECHA)} data-asientos data-revision="pendiente">
      <div className="t7a4-as-h" role="row">
        <span role="columnheader" data-fecha>{FECHA}</span>
        <span className="t7a4-g2">
          <span className="t7a4-d" role="columnheader">{INTERFAZ.debe}</span>
          <span className="t7a4-hb" role="columnheader">{INTERFAZ.haber}</span>
        </span>
      </div>
      {lineas.map((l, k) => (
        <div key={k} className="t7a4-as-r" role="row" data-linea={l.cuenta} data-lado={l.lado}>
          <span role="rowheader" className={l.lado === DEBE ? undefined : "t7a4-sangria"}>{l.cuenta}</span>
          <span className="t7a4-g2">
            <span role="cell">{l.lado === DEBE ? cifra(l.monto) : ""}</span>
            <span role="cell">{l.lado === DEBE ? "" : cifra(l.monto)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ LOS TRES MÉTODOS, LADO A LADO (P6) ═══════════ */

/* `todas`: con el acierto llegan las filas de costo y utilidad. `apuesta`: la columna marcada (o null). */
export function TresMetodos({ tabla, todas, apuesta = null }) {
  const marca = (i) => (i === apuesta ? { className: "t7a4-er-apuesta", "data-apuesta": "si" } : {});
  return (
    <div className="t7a4-er" role="table" aria-label={tabla.nombre} data-metodos data-figura data-revision="pendiente">
      <div className="t7a4-er-head" role="row">
        <span className="t7a4-sr" role="columnheader" data-revision="pendiente">{PENDIENTE_DE_REVISION.rubro}</span>
        {tabla.metodos.map((m, i) => <span key={m} role="columnheader" {...marca(i)}>{m}</span>)}
      </div>
      {tabla.filas.filter((f) => todas || !f.despues).map((f) => (
        <div key={f.rubro} className={`t7a4-er-r${f.despues ? " t7a4-nueva" : ""}`} role="row" data-rubro={f.rubro}>
          <span className="t7a4-er-rubro" role="rowheader">{f.rubro}</span>
          <span className="t7a4-er-v">
            {f.valores.map((v, i) => (
              <span key={i} role="cell" {...marca(i)} className={`t7a4-er-c${i === apuesta ? " t7a4-er-apuesta" : ""}`}>
                <span className="t7a4-er-cap" aria-hidden="true">{tabla.metodos[i]}</span>
                <span className="t7a4-er-dato" data-dato-metodo={i}>{v}</span>
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ PREDICCIÓN: LA APUESTA (P1) ═══════════ */

function Prediccion({ pantalla, apuesta, onApostar, onSeguir }) {
  const ref = useRef(null);
  const elegida = useRef(apuesta);
  useEffect(() => { if (apuesta && apuesta !== elegida.current) { elegida.current = apuesta; ref.current?.focus(); } }, [apuesta]);
  return (
    <div className="t7a4" data-prediccion={pantalla.id} data-estado={apuesta ? "apostada" : "eligiendo"}>
      {pantalla.parrafos.map((t) => <p key={t} className="t7a4-p" data-texto><Plegable texto={t} /></p>)}
      <figure className="t7a4-fig" data-figura data-valores>
        {pantalla.valores.map((v) => <p key={v.metodo} className="t7a4-fig-f" data-texto data-valor><span>{v.metodo}</span>{" "}<b>{v.valor}</b></p>)}
      </figure>
      <p className="t7a4-p t7a4-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t7a4-ops" role="group" aria-label={pantalla.pregunta}>
        {pantalla.opciones.map((o) => (
          <button key={o.id} type="button" className="t7a4-op" data-opcion={o.id} aria-pressed={o.id === apuesta} onClick={() => onApostar(o.id)}>
            {o.texto}
          </button>
        ))}
      </div>
      {apuesta && (
        <>
          <div ref={ref} tabIndex={-1} role="status" className="t7a4-guardada" data-mensaje="apuesta">
            <p data-texto>{pantalla.guardada}</p>
          </div>
          <Boton nombre="seguir" texto={pantalla.boton} onClick={onSeguir} />
        </>
      )}
      <Pie texto={pantalla.pie} />
    </div>
  );
}

/* ═══════════ TOCAR FILAS: LAS UTILIDADES (P5) ═══════════ */

function TocarFilas({ pantalla, onSeguir }) {
  const [abierta, setAbierta] = useState(null);
  const base = useId();
  return (
    <div className="t7a4" data-tocar-filas={pantalla.id} data-estado={abierta ?? "cerradas"}>
      <p className="t7a4-p" data-texto data-consigna>{pantalla.consigna}</p>
      <figure className="t7a4-res" data-figura data-resultados>
        {pantalla.filas.map((f) => {
          if (!f.definicion) return <p key={f.id} className="t7a4-res-f" data-texto data-fila-er={f.id}><span>{f.rubro}</span>{" "}<b>{f.valor}</b></p>;
          const abre = abierta === f.id;
          const id = `${base}-${f.id}`;
          return (
            <div key={f.id} className="t7a4-res-u">
              <button type="button" className="t7a4-res-btn" data-texto data-fila-er={f.id} data-utilidad={f.id} aria-expanded={abre} aria-controls={id} onClick={() => setAbierta(abre ? null : f.id)}>
                <span>{f.rubro}</span>{" "}<b>{f.valor}</b>
              </button>
              {abre && <p id={id} className="t7a4-def t7a4-nueva" data-texto data-definicion={f.id}>{f.definicion}</p>}
            </div>
          );
        })}
      </figure>
      <Boton nombre="seguir" texto={pantalla.boton} onClick={onSeguir} />
      <Pie texto={pantalla.pie} />
    </div>
  );
}

/* ═══════════ ELECCIÓN ═══════════ */

function Eleccion({ pantalla, onSeguir, apuesta = null }) {
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
  /* El acierto lleva su «¿Por qué?» escrito aparte; también cuando llega tras el segundo error, sin el «Así es:». */
  const porques = pantalla.acierto.porque ? { [pantalla.acierto.texto]: pantalla.acierto.porque, [sinAsiEs(pantalla.acierto.texto)]: pantalla.acierto.porque } : {};

  return (
    <div className="t7a4" data-eleccion={pantalla.id} data-estado={estado}>
      <Calculos lista={pantalla.calculos} />
      {(pantalla.parrafos ?? []).map((t) => <p key={t} className="t7a4-p" data-texto><Plegable texto={t} /></p>)}
      {pantalla.tabla && <TresMetodos tabla={pantalla.tabla} todas={estado === "acierto"} apuesta={apuesta} />}
      <p className="t7a4-p t7a4-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t7a4-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button key={o.id} type="button" className={`t7a4-op${estado === "error" && esta ? " t7a4-op-error" : ""}`} data-opcion={o.id} aria-pressed={esta} disabled={Boolean(confirmada)} onClick={() => setElegida(o.id)}>
              {o.texto}
            </button>
          );
        })}
      </div>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!elegida} onClick={() => { contarFallo(pantalla, elegida, setFallos); setConfirmada(elegida); }} />}
      {estado === "error" && (
        <>
          <Mensaje ok={false} textos={textosDelError(pantalla, opcion, fallos)} porques={porques} refFoco={ref} />
          <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={() => { setOrden((a) => barajarDistinto(pantalla.opciones, a, (o) => o.id)); setElegida(null); setConfirmada(null); }} />
        </>
      )}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={[pantalla.acierto.texto]} porques={porques} refFoco={ref} />
          <Calculos lista={pantalla.acierto.calculos} nueva />
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={pie} />
    </div>
  );
}

/* ═══════════ LADOS: EL INVENTARIO DEL CIERRE (P3) ═══════════ */

function Lados({ pantalla, onSeguir }) {
  const [puesto, setPuesto] = useState({});
  const [veredicto, setVeredicto] = useState(null);
  const [fallosLinea, setFallosLinea] = useState({});
  const [otros, setOtros] = useState(false);
  const idOtros = useId();
  const cerrada = (l) => lineaCerrada(pantalla, l, fallosLinea[l.id]);
  const ref = useRef(null);
  const malas = veredicto?.malas ?? [];
  const estado = !veredicto ? "colocando" : malas.length ? "error" : "acierto";
  useEffect(() => { if (estado !== "colocando") ref.current?.focus(); }, [estado]);
  const completo = pantalla.lineas.every((l) => puesto[l.id]);
  const pie = estado === "colocando" ? pantalla.pie : estado === "error" ? pantalla.error.pie : pantalla.acierto.pie;

  const tocar = (l, lado) => {
    if (estado !== "colocando" || cerrada(l)) return;
    setPuesto((p) => ({ ...p, [l.id]: p[l.id] === lado ? undefined : lado }));
  };
  const confirmar = () => {
    const malas = pantalla.lineas.filter((l) => puesto[l.id] !== l.lado).map((l) => l.id);
    setFallosLinea((f) => sumarFallosDeLineas(f, malas));
    setVeredicto({ malas });
  };
  const probarOtra = () => {
    setPuesto((p) => puestoTrasProbarOtra(p, malas, pantalla.lineas, cerrada));
    setVeredicto(null);
  };

  return (
    <div className="t7a4" data-lados={pantalla.id} data-estado={estado}>
      {pantalla.parrafos.map((t) => <p key={t} className="t7a4-p" data-texto><Plegable texto={t} /></p>)}
      <p className="t7a4-p" data-texto data-consigna>{pantalla.consigna}</p>
      <div className="t7a4-u" role="group" aria-label={pantalla.consigna}>
        <p className="t7a4-cuenta-h" data-texto data-cuenta>{pantalla.cuenta}</p>
        <div className="t7a4-dh" aria-hidden="true"><span className="t7a4-d">{INTERFAZ.debe}</span><span className="t7a4-hb">{INTERFAZ.haber}</span></div>
        {pantalla.lineas.map((l) => {
          const lado = puesto[l.id];
          const mala = malas.includes(l.id);
          const cas = (cual) => {
            const llena = lado === cual;
            let clase = "t7a4-cas";
            let nombre;
            if (llena) { clase += mala ? " t7a4-cas-error" : " t7a4-cas-llena"; nombre = `${nombreLado(cual)}, ${cifra(l.monto)}${mala ? ", incorrecto" : ""}`; }
            else if (!lado) { clase += " t7a4-cas-objetivo"; nombre = `${nombreLado(cual)}, vacía, lista para recibir`; }
            else nombre = `${nombreLado(cual)}, vacía`;
            return (
              <button type="button" className={clase} data-linea={l.id} data-lado={cual} data-llena={llena ? "si" : "no"} aria-label={`${pantalla.cuenta}, ${l.texto}: ${nombre}`} aria-pressed={llena} aria-disabled={cerrada(l) || estado === "acierto" ? "true" : undefined} onClick={() => tocar(l, cual)}>
                {llena && mala && <span className="t7a4-marca"><X size={16} aria-hidden="true" /></span>}
                {llena ? cifra(l.monto) : ""}
              </button>
            );
          };
          return (
            <div key={l.id} className="t7a4-la" data-fila={l.id}>
              {/* El monto va con la línea hasta que se coloca; puesto, va en su casilla. */}
              <span className="t7a4-cuenta" data-texto data-texto-linea>{l.texto}{!lado && ` · $${cifra(l.monto)}`}</span>
              <span className="t7a4-g2">{cas(DEBE)}{cas(HABER)}</span>
              {mala && estado === "error" && <Mensaje ok={false} textos={textosDeLinea(pantalla, l, fallosLinea[l.id] ?? 0)} porques={{ [l.devolucion]: l.porque }} clase="t7a4-err" refFoco={l.id === malas[0] ? ref : undefined} />}
            </div>
          );
        })}
      </div>
      <Plegar nombre="otros" texto={pantalla.verOtros} abierto={otros} controla={idOtros} onClick={() => setOtros((x) => !x)} />
      {otros && <Asientos lineas={pantalla.otros} id={idOtros} />}
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!completo} onClick={confirmar} />}
      {estado === "error" && <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={probarOtra} />}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={[pantalla.acierto.texto]} porques={{ [pantalla.acierto.texto]: pantalla.acierto.porque }} refFoco={ref} />
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={pie} />
    </div>
  );
}

/* ═══════════ LECTURA ═══════════ */

function Lectura({ p, primera, onSeguir }) {
  const [operaciones, setOperaciones] = useState(false);
  const idOps = useId();
  return (
    <div className="t7a4">
      {p.objetivo && <p className="t7a4-p" data-texto data-objetivo>{p.objetivo}</p>}
      {p.cuentaEnUnaLinea && <figure className="t7a4-fig" data-figura><p className="t7a4-una" data-texto data-cuenta-una>{p.cuentaEnUnaLinea}</p></figure>}
      {p.parrafos.map((t) => <p key={t} className="t7a4-p" data-texto><Plegable texto={t} /></p>)}
      {p.totales && <figure className="t7a4-fig" data-figura data-totales>{p.totales.map((t) => <Total key={t} texto={t} />)}</figure>}
      {p.operaciones && (
        <>
          <Plegar nombre="operaciones" texto={p.verOperaciones} abierto={operaciones} controla={idOps} onClick={() => setOperaciones((x) => !x)} />
          {operaciones && <Ficha ficha={p.operaciones} id={idOps} />}
        </>
      )}
      {p.siguiente && <p className="t7a4-nota" data-texto data-siguiente>{p.siguiente}</p>}
      {p.boton && <Boton nombre={primera ? "empezar" : "seguir"} texto={p.boton} onClick={onSeguir} />}
      <Pie texto={p.pie} />
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function ElCierreEnPeriodico({ pieza = PIEZA_EL_CIERRE, rotulo }) {
  const [k, setK] = useState(0);
  /* La apuesta de P1: estado de la pieza, en memoria; sin calificar y sin puntos. */
  const [apuesta, setApuesta] = useState(null);
  const p = pieza.pantallas[k];
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);
  const prediccion = pieza.pantallas.find((x) => x.tipo === "prediccion") ?? PIEZA_EL_CIERRE.pantallas.find((x) => x.tipo === "prediccion");
  const columna = prediccion?.opciones.find((o) => o.id === apuesta)?.columna ?? null;

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_AP4}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} data-apuesta={apuesta ?? undefined} style={{ outline: "none" }}>
        {p.tipo === "lectura" && <Lectura key={p.id} p={p} primera={k === 0} onSeguir={seguir} />}
        {p.tipo === "prediccion" && <Prediccion key={p.id} pantalla={p} apuesta={apuesta} onApostar={setApuesta} onSeguir={seguir} />}
        {p.tipo === "eleccion" && <Eleccion key={p.id} pantalla={p} onSeguir={seguir} apuesta={columna} />}
        {p.tipo === "lados" && <Lados key={p.id} pantalla={p} onSeguir={seguir} />}
        {p.tipo === "tocar-filas" && <TocarFilas key={p.id} pantalla={p} onSeguir={seguir} />}
      </div>
    </Panel>
  );
}
