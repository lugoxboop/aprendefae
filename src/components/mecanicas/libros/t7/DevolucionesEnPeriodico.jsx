import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_DEVOLUCIONES, BOTON, INTERFAZ, DEBE, HABER, cifra } from "../../../../data/contabilidadT7_1_a6.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A6 «Devoluciones en periódico», con el patrón tabular de Watari.
 *
 * Nueve pantallas, una a la vez. Cuatro tipos:
 *
 *   · lectura / portada / resumen   textos, botón y pie
 *   · caso       el enunciado, las tarifas, la ficha y los dos asientos del 1
 *                de junio en modo lectura, apilados
 *   · eleccion   una pregunta con opciones (barajadas en cada intento),
 *                «Confirmar», y el mensaje «Incorrecto.» con «Probar otra» o
 *                «Correcto.» con «Seguir». En P7, con la tabla espejo arriba
 *   · lados      un asiento: cada línea con su cuenta y, debajo, las casillas
 *                Debe | Haber. Se toca el lado; las sumas se calculan solas al
 *                colocar (ayuda, no veredicto). «Confirmar» marca con la X cada
 *                línea en el lado equivocado y da su explicación; «Probar
 *                otra» devuelve solo esas. Al acertar, desaparece la casilla
 *                vacía de cada línea y el asiento se lee como cuenta T
 *
 * Cada pantalla lleva su pie de fuente en todos sus estados. NO CALIFICA y no
 * da FP: es Aprender. Clases con el prefijo `t7a6-`, para no tocar nada del
 * sitio.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Tokens del patrón tabular de la Célula C (Watari). */
const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", debe: "#2A9D8F", haber: "#E9C46A", error: "#E76F51" };

export const CSS_A6 = `
.t7a6 { display: grid; gap: 12px; min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.4; }
.t7a6 * { box-sizing: border-box; }
.t7a6-p { margin: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t7a6-preg { font: 600 15px/1.45 "Sora", "Inter", sans-serif; }
.t7a6-pie { margin: 4px 0 0; font-size: 12px; line-height: 1.4; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a6-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${P.texto}; background: ${P.texto}; color: ${P.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t7a6-btn[aria-disabled="true"] { background: transparent; color: ${P.texto2}; border-color: ${P.texto2}; cursor: default; }
.t7a6-btn:focus-visible, .t7a6-op:focus-visible, .t7a6-cas:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
.t7a6-ficha { margin: 0; display: grid; gap: 6px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7a6-ficha dt { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; letter-spacing: .02em; }
.t7a6-ficha dd { margin: 0 0 4px; font-size: 15px; overflow-wrap: anywhere; }
.t7a6-ops { display: grid; gap: 8px; }
.t7a6-op { appearance: none; text-align: left; min-height: 44px; padding: 10px 14px; border: 1px solid ${P.borde}; border-radius: 12px; background: transparent; color: ${P.texto}; font: 400 15px/1.35 "Inter", sans-serif; cursor: pointer; overflow-wrap: anywhere; }
.t7a6-op[aria-pressed="true"] { background: ${P.texto}; color: ${P.fondo}; border-color: ${P.texto}; }
.t7a6-op:disabled { cursor: default; }
.t7a6-op-error { border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7a6-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 10px 12px; border-radius: 8px; border: 1px solid; outline: none; }
.t7a6-msg-error { border-color: ${P.error}; }
.t7a6-msg-ok { border-color: ${P.borde}; }
.t7a6-msg svg { margin-top: 2px; }
.t7a6-msg-cuerpo { display: grid; gap: 6px; min-width: 0; }
.t7a6-msg-palabra { font: 600 14px/1.35 "Inter", sans-serif; }
.t7a6-msg-error .t7a6-msg-palabra { color: ${P.error}; }
.t7a6-msg p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
.t7a6-calc { font-variant-numeric: tabular-nums; color: ${P.texto2}; }
/* asiento */
.t7a6-u { border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; display: grid; gap: 10px; min-width: 0; }
.t7a6-u-tit { font: 600 13px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .02em; overflow-wrap: anywhere; }
.t7a6-dh { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.t7a6-dh span { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; text-align: right; padding-inline: 9px; }
.t7a6-d { color: ${P.debe}; } .t7a6-h { color: ${P.haber}; }
.t7a6-la { display: grid; gap: 6px; min-width: 0; }
.t7a6-la + .t7a6-la { padding-top: 8px; }
.t7a6-cuenta { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 8px; font-size: 15px; overflow-wrap: anywhere; min-width: 0; }
.t7a6-ficha-monto { color: ${P.texto2}; font-variant-numeric: tabular-nums; white-space: nowrap; margin-left: auto; }
.t7a6-g2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.t7a6-cas { position: relative; appearance: none; display: flex; align-items: center; justify-content: flex-end; min-height: 44px; min-width: 0; padding: 0 8px; border: 1px dashed ${P.borde}; border-radius: 6px; background: transparent; color: ${P.texto}; font: 500 15px/1 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; cursor: pointer; transition: box-shadow .12s, border-color .12s; }
.t7a6-cas-objetivo { border-style: solid; border-color: ${P.texto}; box-shadow: inset 0 0 0 1px ${P.texto}; }
.t7a6-cas-llena { border-style: solid; border-color: ${P.borde}; }
.t7a6-cas-error { border-style: solid; border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7a6-cas-ok { border-style: solid; border-color: ${P.texto2}; cursor: default; }
.t7a6-cas-nada { visibility: hidden; }
.t7a6-marca { position: absolute; top: -7px; left: -7px; width: 16px; height: 16px; border-radius: 50%; background: ${P.fondo}; display: block; line-height: 0; color: ${P.error}; }
.t7a6-sumas { display: grid; gap: 4px; border-top: 1px solid ${P.borde}; padding-top: 8px; }
.t7a6-sumas-rot { font-size: 12px; color: ${P.texto2}; }
.t7a6-sum { text-align: right; padding-inline: 9px; font: 600 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
/* lectura */
.t7a6-lect { display: grid; min-width: 0; }
.t7a6-lect-r { display: grid; gap: 4px; padding-block: 8px; border-top: 1px solid ${P.borde}; }
.t7a6-lect-r > span:first-child { font-size: 14px; overflow-wrap: anywhere; }
.t7a6-sangria { padding-left: 24px; }
.t7a6-lect-r .t7a6-g2 > span { text-align: right; padding-inline: 9px; font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
/* espejo */
.t7a6-esp { display: grid; gap: 0; min-width: 0; }
.t7a6-esp-cab { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; align-items: end; padding-bottom: 6px; }
.t7a6-esp-cab span { font: 600 13px/1.3 "Sora", "Inter", sans-serif; padding-bottom: 6px; border-bottom: 1px solid ${P.borde}; overflow-wrap: anywhere; min-width: 0; }
.t7a6-esp-f { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; row-gap: 4px; padding-block: 8px; border-bottom: 1px solid rgba(184,196,212,.35); }
.t7a6-esp-monto { grid-column: 1 / -1; font: 600 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; }
.t7a6-esp-c { display: grid; gap: 2px; align-content: start; min-width: 0; font-size: 14px; line-height: 1.3; overflow-wrap: anywhere; }
.t7a6-esp-lado { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.t7a6-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .t7a6 *, .t7a6 *::before, .t7a6 *::after { transition: none !important; animation: none !important; } }
`;

const nombreLado = (lado) => (lado === DEBE ? INTERFAZ.debe : INTERFAZ.haber);

function Pie({ texto }) { return <p className="t7a6-pie" data-pie>{texto}</p>; }

function Boton({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t7a6-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

function Mensaje({ ok, textos, calculos = [], refFoco }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t7a6-msg ${ok ? "t7a6-msg-ok" : "t7a6-msg-error"}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color={P.error} aria-hidden="true" />}
      <div className="t7a6-msg-cuerpo">
        <span className="t7a6-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        {textos.map((t) => <p key={t} data-texto>{t}</p>)}
        {calculos.map((c) => <p key={c} className="t7a6-calc" data-texto data-calculo>{c}</p>)}
      </div>
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
    <div className="t7a6" data-eleccion={pantalla.id} data-estado={estado}>
      {pantalla.parrafos.map((t) => <p key={t} className="t7a6-p" data-texto>{t}</p>)}
      {pantalla.espejo && <Espejo espejo={pantalla.espejo} />}
      <p className="t7a6-p t7a6-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t7a6-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button
              key={o.id}
              type="button"
              className={`t7a6-op${estado === "error" && esta ? " t7a6-op-error" : ""}`}
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
          <Mensaje ok textos={[pantalla.acierto.texto]} calculos={pantalla.acierto.calculos} refFoco={ref} />
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={pantalla.pie} />
    </div>
  );
}

/* ═══════════ LA TABLA ESPEJO ═══════════ */

function Espejo({ espejo }) {
  const celda = (c) => (
    <span role="cell" className="t7a6-esp-c">
      <span className={`t7a6-esp-lado ${c.lado === DEBE ? "t7a6-d" : "t7a6-h"}`}>{nombreLado(c.lado)}</span>
      <span>{c.cuenta}</span>
    </span>
  );
  return (
    <div className="t7a6-esp" role="table" data-espejo>
      <div className="t7a6-esp-cab" role="row">
        <span className="t7a6-sr" role="columnheader" />
        {espejo.libros.map((l) => <span key={l} role="columnheader">{l}</span>)}
      </div>
      {espejo.filas.map((f) => (
        <div key={f.monto} className="t7a6-esp-f" role="row" data-fila-espejo={f.cifra}>
          <span className="t7a6-esp-monto" role="rowheader">{f.cifra}</span>
          {celda(f.comprador)}
          {celda(f.vendedor)}
        </div>
      ))}
    </div>
  );
}

/* ═══════════ UN ASIENTO EN LECTURA ═══════════ */

function AsientoLectura({ asiento }) {
  return (
    <div className="t7a6-u" data-asiento-lectura={asiento.libro}>
      <span className="t7a6-u-tit">{asiento.libro}</span>
      <div className="t7a6-lect" role="table">
        <div className="t7a6-dh" role="row" aria-hidden="true"><span className="t7a6-d">{INTERFAZ.debe}</span><span className="t7a6-h">{INTERFAZ.haber}</span></div>
        {asiento.lineas.map((l) => (
          <div key={l.cuenta} className="t7a6-lect-r" role="row">
            <span className={l.lado === HABER ? "t7a6-sangria" : ""} role="rowheader">{l.cuenta}</span>
            <span className="t7a6-g2">
              <span role="cell" aria-label={`${INTERFAZ.debe}: ${l.lado === DEBE ? cifra(l.monto) : "—"}`}>{l.lado === DEBE ? cifra(l.monto) : ""}</span>
              <span role="cell" aria-label={`${INTERFAZ.haber}: ${l.lado === HABER ? cifra(l.monto) : "—"}`}>{l.lado === HABER ? cifra(l.monto) : ""}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ LADOS: COLOCAR CADA LÍNEA EN DEBE O EN HABER ═══════════ */

function Lados({ pantalla, onSeguir }) {
  const [puesto, setPuesto] = useState({});
  const [veredicto, setVeredicto] = useState(null); // null | { malas: [ids] }
  const ref = useRef(null);
  const malas = veredicto?.malas ?? [];
  const estado = !veredicto ? "colocando" : malas.length ? "error" : "acierto";
  useEffect(() => { if (estado !== "colocando") ref.current?.focus(); }, [estado]);

  const completo = pantalla.lineas.every((l) => puesto[l.id]);
  const algo = pantalla.lineas.some((l) => puesto[l.id]);
  const suma = (lado) => pantalla.lineas.filter((l) => puesto[l.id] === lado).reduce((t, l) => t + l.monto, 0);

  const tocar = (l, lado) => {
    if (estado !== "colocando") return;
    setPuesto((p) => ({ ...p, [l.id]: p[l.id] === lado ? undefined : lado }));
  };
  const confirmar = () => setVeredicto({ malas: pantalla.lineas.filter((l) => puesto[l.id] !== l.lado).map((l) => l.id) });
  const probarOtra = () => {
    setPuesto((p) => { const n = { ...p }; for (const id of malas) delete n[id]; return n; });
    setVeredicto(null);
  };

  return (
    <div className="t7a6" data-lados={pantalla.id} data-estado={estado}>
      <div className="t7a6-u">
        <span className="t7a6-u-tit">{pantalla.libro}</span>
        <p className="t7a6-p" data-texto data-consigna>{pantalla.consigna}</p>
        <div className="t7a6-dh" aria-hidden="true"><span className="t7a6-d">{INTERFAZ.debe}</span><span className="t7a6-h">{INTERFAZ.haber}</span></div>
        {pantalla.lineas.map((l) => {
          const lado = puesto[l.id];
          const mala = malas.includes(l.id);
          const cas = (cual) => {
            const llena = lado === cual;
            let clase = "t7a6-cas";
            if (estado === "acierto") clase += llena ? " t7a6-cas-ok" : " t7a6-cas-nada";
            else if (llena) clase += mala ? " t7a6-cas-error" : " t7a6-cas-llena";
            else if (algo) clase += " t7a6-cas-objetivo";
            const nombre = `${l.cuenta}, ${nombreLado(cual)}${llena && mala ? ", incorrecto" : ""}`;
            return (
              <button
                type="button"
                className={clase}
                data-linea={l.id}
                data-lado={cual}
                data-llena={llena ? "si" : "no"}
                aria-label={nombre}
                aria-pressed={llena}
                tabIndex={estado === "acierto" ? -1 : 0}
                aria-hidden={estado === "acierto" && !llena ? "true" : undefined}
                onClick={() => tocar(l, cual)}
              >
                {llena && mala && <span className="t7a6-marca"><X size={16} aria-hidden="true" /></span>}
                {llena ? cifra(l.monto) : ""}
              </button>
            );
          };
          return (
            <div key={l.id} className="t7a6-la" data-fila={l.id}>
              <span className="t7a6-cuenta">
                <span>{l.cuenta}</span>
                {!lado && <span className="t7a6-ficha-monto" data-monto-suelto>{cifra(l.monto)}</span>}
              </span>
              <span className="t7a6-g2">{cas(DEBE)}{cas(HABER)}</span>
            </div>
          );
        })}
        <div className="t7a6-sumas" data-sumas>
          <span className="t7a6-sumas-rot">{INTERFAZ.sumas}</span>
          <span className="t7a6-g2">
            <span className="t7a6-sum" data-suma={DEBE} aria-label={`${INTERFAZ.sumas}, ${INTERFAZ.debe}: ${cifra(suma(DEBE))}`}>{cifra(suma(DEBE))}</span>
            <span className="t7a6-sum" data-suma={HABER} aria-label={`${INTERFAZ.sumas}, ${INTERFAZ.haber}: ${cifra(suma(HABER))}`}>{cifra(suma(HABER))}</span>
          </span>
        </div>
      </div>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!completo} onClick={confirmar} />}
      {estado === "error" && (
        <>
          <Mensaje ok={false} textos={pantalla.lineas.filter((l) => malas.includes(l.id)).map((l) => l.devolucion)} refFoco={ref} />
          <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={probarOtra} />
        </>
      )}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={[pantalla.acierto.texto]} refFoco={ref} />
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={pantalla.pie} />
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function DevolucionesEnPeriodico({ pieza = PIEZA_DEVOLUCIONES, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_A6}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        {(p.tipo === "portada" || p.tipo === "lectura" || p.tipo === "resumen" || p.tipo === "caso") && (
          <div className="t7a6">
            {p.objetivo && <p className="t7a6-p" data-texto data-objetivo>{p.objetivo}</p>}
            {p.enunciado && <p className="t7a6-p" data-texto data-enunciado>{p.enunciado}</p>}
            {(p.parrafos ?? []).map((t) => <p key={t} className="t7a6-p" data-texto>{t}</p>)}
            {p.ficha && (
              <dl className="t7a6-ficha" data-ficha>
                {p.ficha.map((f) => (
                  <div key={f.dato} data-dato>
                    <dt>{f.dato}</dt>
                    <dd>{f.texto}</dd>
                  </div>
                ))}
              </dl>
            )}
            {(p.asientos ?? []).map((a) => <AsientoLectura key={a.libro} asiento={a} />)}
            {p.siguiente && <p className="t7a6-p" data-texto data-siguiente>{p.siguiente}</p>}
            {p.boton && <Boton nombre={p.tipo === "portada" ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <Pie texto={p.pie} />
          </div>
        )}
        {p.tipo === "eleccion" && <Eleccion key={p.id} pantalla={p} onSeguir={seguir} />}
        {p.tipo === "lados" && <Lados key={p.id} pantalla={p} onSeguir={seguir} />}
      </div>
    </Panel>
  );
}
