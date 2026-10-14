import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_IMPORTADOS_Y_FLETES, BOTON, INTERFAZ, FIGURA_PENDIENTE_DE_REVISION, DEBE, cifra } from "../../../../data/contabilidadT7_1_a5.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A5 «Importados y fletes», con la «Figura de A5» de Watari.
 *
 * Ocho pantallas, una a la vez. Tres tipos:
 *
 *   · portada / lectura / resumen   textos, botón y pie
 *   · eleccion   una pregunta con opciones (barajadas en cada intento),
 *                «Confirmar», y el mensaje «Incorrecto.» con «Probar otra» o
 *                «Correcto.» con «Seguir». Lo que va antes de la pregunta
 *                cambia por pantalla: la lista de P2, las condiciones de P3,
 *                el enunciado y la ficha de P4 y P5, la tabla de P6
 *
 * Las dos figuras de Watari:
 *   · Tarjeta    los asientos del 18 de marzo en lectura: el de la compra o
 *                la venta con sus sumas y, tras la raya doble, el del flete.
 *                Aparece con el acierto de P4 y P5, bajo el mensaje y antes
 *                de «Seguir», con fundido de 120 ms
 *   · LadoALado  Santa Martha y La Popa, con texto en las celdas y sin color
 *                de lado. La fila «Quién asume el flete» se señala solo con
 *                el acierto
 *
 * Cada pantalla lleva su pie de fuente en todos sus estados: el de colocando
 * y, donde la v1 lo cambia, el de los errores y el acierto. NO CALIFICA y no
 * da FP: es Aprender. Clases con el prefijo `t7a5-`, para no tocar nada del
 * sitio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Tokens del patrón tabular de la Célula C (Watari). */
const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", debe: "#2A9D8F", haber: "#E9C46A", error: "#E76F51" };

export const CSS_A5 = `
.t7a5 { display: grid; gap: 12px; min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.4; }
.t7a5 * { box-sizing: border-box; }
.t7a5-p { margin: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t7a5-nota { margin: 0; font-size: 14px; line-height: 1.45; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a5-preg { font: 600 15px/1.45 "Sora", "Inter", sans-serif; }
.t7a5-lista { margin: 0; padding-left: 20px; display: grid; gap: 6px; font-size: 15px; line-height: 1.45; }
.t7a5-lista li { overflow-wrap: anywhere; }
.t7a5-pie { margin: 4px 0 0; font-size: 12px; line-height: 1.4; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a5-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${P.texto}; background: ${P.texto}; color: ${P.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t7a5-btn[aria-disabled="true"] { background: transparent; color: ${P.texto2}; border-color: ${P.texto2}; cursor: default; }
.t7a5-btn:focus-visible, .t7a5-op:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
.t7a5-ficha { margin: 0; display: grid; gap: 6px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7a5-ficha dt { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; letter-spacing: .02em; }
.t7a5-ficha dd { margin: 0 0 4px; font-size: 15px; overflow-wrap: anywhere; }
.t7a5-ops { display: grid; gap: 8px; }
.t7a5-op { appearance: none; text-align: left; min-height: 44px; padding: 10px 14px; border: 1px solid ${P.borde}; border-radius: 12px; background: transparent; color: ${P.texto}; font: 400 15px/1.35 "Inter", sans-serif; cursor: pointer; overflow-wrap: anywhere; }
.t7a5-op[aria-pressed="true"] { background: ${P.texto}; color: ${P.fondo}; border-color: ${P.texto}; }
.t7a5-op:disabled { cursor: default; }
.t7a5-op-error { border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7a5-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 10px 12px; border-radius: 8px; border: 1px solid; outline: none; }
.t7a5-msg-error { border-color: ${P.error}; }
.t7a5-msg-ok { border-color: ${P.borde}; }
.t7a5-msg svg { margin-top: 2px; }
.t7a5-msg-cuerpo { display: grid; gap: 6px; min-width: 0; }
.t7a5-msg-palabra { font: 600 14px/1.35 "Inter", sans-serif; }
.t7a5-msg-error .t7a5-msg-palabra { color: ${P.error}; }
.t7a5-msg p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
/* tarjeta de asientos: el modo lectura del patrón tabular, con borde de tarjeta (Watari, «Figura de A5») */
.t7a5-as { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7a5-g2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.t7a5-as-h { display: grid; gap: 6px; padding-bottom: 6px; font: 600 13px "Sora", "Inter", sans-serif; }
.t7a5-as-h .t7a5-g2 > span { font: 500 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; text-align: right; padding-inline: 9px; }
.t7a5-d { color: ${P.debe}; } .t7a5-h { color: ${P.haber}; }
.t7a5-as-r { display: grid; gap: 4px; padding-block: 8px; border-top: 1px solid ${P.borde}; }
.t7a5-as-r > span:first-child { font-size: 14px; overflow-wrap: anywhere; min-width: 0; }
.t7a5-as-r .t7a5-g2 > span { text-align: right; padding-inline: 9px; font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; min-width: 0; }
.t7a5-sangria { padding-left: 24px; }
.t7a5-tot > span:first-child { font-size: 12px; color: ${P.texto2}; }
.t7a5-tot .t7a5-g2 > span { font-weight: 600; }
/* la raya doble entre los dos asientos: esta raya y la de la primera línea del flete */
.t7a5-sep { height: 0; border-top: 1px solid ${P.borde}; margin-top: 10px; }
/* lado a lado: el de AP2 y A6, con texto en las celdas y sin color de lado */
.t7a5-lal { margin: 0; display: grid; grid-template-columns: minmax(0, 1fr); border: 1px solid ${P.borde}; border-radius: 10px; min-width: 0; }
.t7a5-lal-f { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; row-gap: 6px; padding: 10px 12px; }
.t7a5-lal-f + .t7a5-lal-f { border-top: 1px solid ${P.borde}; }
.t7a5-lal-h > span:not(.t7a5-sr) { font: 600 13px/1.3 "Sora", "Inter", sans-serif; overflow-wrap: anywhere; min-width: 0; }
.t7a5-lal-rot { grid-column: 1 / -1; font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${P.texto2}; }
.t7a5-lal-c { min-width: 0; font-size: 14px; line-height: 1.35; overflow-wrap: anywhere; }
.t7a5-foco { color: ${P.texto}; font-weight: 600; }
.t7a5-nueva { animation: t7a5-aparece .12s ease-out; }
@keyframes t7a5-aparece { from { opacity: 0; } to { opacity: 1; } }
.t7a5-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .t7a5 *, .t7a5 *::before, .t7a5 *::after { transition: none !important; animation: none !important; } }
`;

function Pie({ texto }) { return <p className="t7a5-pie" data-pie>{texto}</p>; }

function Boton({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t7a5-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

function Mensaje({ ok, textos, refFoco }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t7a5-msg ${ok ? "t7a5-msg-ok" : "t7a5-msg-error"}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color={P.error} aria-hidden="true" />}
      <div className="t7a5-msg-cuerpo">
        <span className="t7a5-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        {textos.map((t) => <p key={t} data-texto>{t}</p>)}
      </div>
    </div>
  );
}

function Ficha({ ficha }) {
  return (
    <dl className="t7a5-ficha" data-ficha>
      {ficha.map((f) => (
        <div key={f.dato} data-dato>
          <dt>{f.dato}</dt>
          <dd>{f.texto}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ═══════════ LA TARJETA DE ASIENTOS ═══════════ */

/*
 * Los dos asientos del 18 de marzo, en lectura: cada línea con la cuenta a lo
 * ancho y la cifra debajo, en su columna; las del haber, con sangría. Sumas
 * solo en el primero. El nombre accesible está pendiente de revisión.
 */
export function Tarjeta({ tarjeta }) {
  const fila = (l, k) => (
    <div key={`${l.cuenta}-${k}`} className="t7a5-as-r" role="row" data-linea={l.cuenta} data-lado={l.lado}>
      <span role="rowheader" className={l.lado === DEBE ? undefined : "t7a5-sangria"}>{l.cuenta}</span>
      <span className="t7a5-g2">
        <span role="cell">{l.lado === DEBE ? cifra(l.monto) : ""}</span>
        <span role="cell">{l.lado === DEBE ? "" : cifra(l.monto)}</span>
      </span>
    </div>
  );
  return (
    <div className="t7a5-as t7a5-nueva" role="table" aria-label={tarjeta.nombre} data-tarjeta data-revision="pendiente">
      <div className="t7a5-as-h" role="row">
        <span role="columnheader" data-fecha>{tarjeta.fecha}</span>
        <span className="t7a5-g2">
          <span className="t7a5-d" role="columnheader">{INTERFAZ.debe}</span>
          <span className="t7a5-h" role="columnheader">{INTERFAZ.haber}</span>
        </span>
      </div>
      {tarjeta.asientos.map((a, i) => (
        <div key={i} role="rowgroup" style={{ display: "contents" }} data-asiento={i}>
          {i > 0 && <div className="t7a5-sep" aria-hidden="true" data-raya />}
          {a.lineas.map(fila)}
          {a.sumas && (
            <div className="t7a5-as-r t7a5-tot" role="row" data-sumas>
              <span role="rowheader">{INTERFAZ.sumas}</span>
              <span className="t7a5-g2">
                <span role="cell" data-suma="debe">{cifra(a.sumas.debe)}</span>
                <span role="cell" data-suma="haber">{cifra(a.sumas.haber)}</span>
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════ LADO A LADO ═══════════ */

export function LadoALado({ tabla, acierto = false }) {
  return (
    <div className="t7a5-lal" role="table" aria-label={tabla.nombre} data-lado-a-lado data-revision="pendiente">
      <div className="t7a5-lal-f t7a5-lal-h" role="row">
        <span className="t7a5-sr" role="columnheader" data-revision="pendiente">{FIGURA_PENDIENTE_DE_REVISION.dato}</span>
        {tabla.columnas.map((c) => <span key={c} role="columnheader">{c}</span>)}
      </div>
      {tabla.filas.map((f) => {
        const foco = acierto && f.focoConAcierto;
        return (
          <div key={f.rotulo} className="t7a5-lal-f" role="row" data-fila-lal={f.rotulo} data-foco={foco ? "si" : undefined}>
            <span className={`t7a5-lal-rot${foco ? " t7a5-foco" : ""}`} role="rowheader">{f.rotulo}</span>
            {f.celdas.map((c, i) => <span key={i} role="cell" className={`t7a5-lal-c${foco ? " t7a5-foco" : ""}`}>{c}</span>)}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════ ELECCIÓN ═══════════ */

function Eleccion({ pantalla, onSeguir }) {
  const [orden, setOrden] = useState(() => barajar(pantalla.opciones));
  const [elegida, setElegida] = useState(null);
  const [confirmada, setConfirmada] = useState(null);
  const ref = useRef(null);
  const opcion = confirmada ? pantalla.opciones.find((o) => o.id === confirmada) : null;
  const estado = !opcion ? "colocando" : opcion.correcta ? "acierto" : "error";
  useEffect(() => { if (estado !== "colocando") ref.current?.focus(); }, [estado]);

  return (
    <div className="t7a5" data-eleccion={pantalla.id} data-estado={estado}>
      {pantalla.entrada && <p className="t7a5-p" data-texto data-entrada>{pantalla.entrada}</p>}
      {pantalla.enunciado && <p className="t7a5-p" data-texto data-enunciado>{pantalla.enunciado}</p>}
      {pantalla.parrafos.map((t) => <p key={t} className="t7a5-p" data-texto>{t}</p>)}
      {pantalla.aviso && <p className="t7a5-nota" data-texto data-aviso>{pantalla.aviso}</p>}
      {pantalla.lista && (
        <ul className="t7a5-lista" data-lista>
          {pantalla.lista.map((t) => <li key={t} data-texto>{t}</li>)}
        </ul>
      )}
      {pantalla.ficha && <Ficha ficha={pantalla.ficha} />}
      {pantalla.tabla && <LadoALado tabla={pantalla.tabla} acierto={estado === "acierto"} />}
      <p className="t7a5-p t7a5-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t7a5-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button
              key={o.id}
              type="button"
              className={`t7a5-op${estado === "error" && esta ? " t7a5-op-error" : ""}`}
              data-opcion={o.id}
              aria-pressed={esta}
              disabled={Boolean(confirmada)}
              onClick={() => setElegida(o.id)}
            >
              {o.texto}
            </button>
          );
        })}
      </div>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!elegida} onClick={() => setConfirmada(elegida)} />}
      {estado === "error" && (
        <>
          <Mensaje ok={false} textos={[opcion.devolucion]} refFoco={ref} />
          <Boton
            nombre="probar-otra"
            texto={BOTON.probarOtra}
            onClick={() => { setOrden((a) => barajarDistinto(pantalla.opciones, a, (o) => o.id)); setElegida(null); setConfirmada(null); }}
          />
        </>
      )}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={pantalla.acierto.textos} refFoco={ref} />
          {/* La tarjeta llega con el acierto, bajo el mensaje y antes de «Seguir» (Watari). */}
          {pantalla.acierto.tarjeta && <Tarjeta tarjeta={pantalla.acierto.tarjeta} />}
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={estado === "colocando" ? pantalla.pie : pantalla.pieRespuesta} />
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function ImportadosYFletes({ pieza = PIEZA_IMPORTADOS_Y_FLETES, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_A5}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        {p.tipo === "eleccion" ? (
          <Eleccion key={p.id} pantalla={p} onSeguir={seguir} />
        ) : (
          <div className="t7a5">
            {p.objetivo && <p className="t7a5-p" data-texto data-objetivo>{p.objetivo}</p>}
            {p.parrafos?.map((t) => <p key={t} className="t7a5-p" data-texto>{t}</p>)}
            {p.siguiente && <p className="t7a5-nota" data-texto data-siguiente>{p.siguiente}</p>}
            {p.boton && <Boton nombre={p.tipo === "portada" ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <Pie texto={p.pie} />
          </div>
        )}
      </div>
    </Panel>
  );
}
