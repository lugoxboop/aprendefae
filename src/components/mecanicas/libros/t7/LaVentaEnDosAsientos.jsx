import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_LA_VENTA_EN_DOS_ASIENTOS, BOTON, INTERFAZ, PENDIENTE_DE_REVISION, DEBE, HABER, cifra } from "../../../../data/contabilidadT7_2_a2.js";
import { Plegable } from "./plegable.jsx";
import { textosDelError, contarFallo, textosDeLinea, lineaCerrada, sumarFallosDeLineas, puestoTrasProbarOtra } from "./escaleraAyuda.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A2 «La venta en dos asientos».
 *
 * Siete pantallas, una a la vez. Cuatro tipos:
 *
 *   · portada / lectura   textos y, según la pantalla, el enunciado y la
 *                ficha, los cálculos y el primer asiento de la venta (P2), o
 *                la estructura del estado de resultados (P5); botón y pie
 *   · eleccion   P1 y P4: pregunta con opciones barajadas en cada intento.
 *                En P1, antes de la pregunta, el enunciado de E-1, su ficha y
 *                el repaso de IVA y retención; con el acierto, el asiento de
 *                la compra: Inventario de mercancías con su monto y las otras
 *                tres líneas sin él (casilla vacía, X1), y las dos líneas que las explican
 *   · lados      P3: las dos líneas del asiento del costo, barajadas al
 *                entrar, cada una con «Debe» | «Haber», como P3 de A1
 *   · resumen    la lista numerada, la línea «Siguiente» y el pie
 *
 * Los asientos van en el modo lectura del patrón tabular de Watari: DEBE en
 * verde azulado y HABER en ámbar, montos a la derecha y sin «$», las cuentas
 * del haber con sangría. Sin sumas: la v1 no las muestra.
 *
 * NO CALIFICA y no da FP: es Aprender. Clases con el prefijo `t7b2-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", debe: "#2A9D8F", haber: "#E9C46A", error: "#E76F51" };

export const CSS_T7B2 = `
.t7b2 { display: grid; gap: 12px; min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.4; }
.t7b2 * { box-sizing: border-box; }
.t7b2-p { margin: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t7b2-nota { margin: 0; font-size: 14px; line-height: 1.45; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7b2-preg { font: 600 15px/1.45 "Sora", "Inter", sans-serif; }
.t7b2-enunciado { margin: 0; padding: 10px 12px; border-left: 3px solid ${P.borde}; background: rgba(184,196,212,0.08); border-radius: 0 8px 8px 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t7b2-lista { margin: 0; padding-left: 22px; display: grid; gap: 6px; font-size: 15px; line-height: 1.45; }
/* La hoja global del sitio quita el estilo de lista: aquí vuelven los números. */
.t7b2-lista li { overflow-wrap: anywhere; list-style: decimal; }
.t7b2-lista li::marker { color: ${P.texto2}; font-variant-numeric: tabular-nums; }
.t7b2-pie { margin: 4px 0 0; font-size: 12px; line-height: 1.4; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7b2-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${P.texto}; background: ${P.texto}; color: ${P.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t7b2-btn[aria-disabled="true"] { background: transparent; color: ${P.texto2}; border-color: ${P.texto2}; cursor: default; }
.t7b2-btn:focus-visible, .t7b2-op:focus-visible, .t7b2-lado:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
.t7b2-ficha { margin: 0; display: grid; gap: 6px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7b2-ficha dt { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; letter-spacing: .02em; }
.t7b2-ficha dd { margin: 0 0 4px; font-size: 15px; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t7b2-ops { display: grid; gap: 8px; }
.t7b2-op { appearance: none; text-align: left; min-height: 44px; padding: 10px 14px; border: 1px solid ${P.borde}; border-radius: 12px; background: transparent; color: ${P.texto}; font: 400 15px/1.35 "Inter", sans-serif; cursor: pointer; overflow-wrap: anywhere; }
.t7b2-op[aria-pressed="true"] { background: ${P.texto}; color: ${P.fondo}; border-color: ${P.texto}; }
.t7b2-op:disabled { cursor: default; }
.t7b2-op-error { border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7b2-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 10px 12px; border-radius: 8px; border: 1px solid; outline: none; }
.t7b2-msg-error { border-color: ${P.error}; }
.t7b2-msg-ok { border-color: ${P.borde}; }
.t7b2-msg svg { margin-top: 2px; }
.t7b2-msg-cuerpo { display: grid; gap: 6px; min-width: 0; }
.t7b2-msg-palabra { font: 600 14px/1.35 "Inter", sans-serif; }
.t7b2-msg-error .t7b2-msg-palabra { color: ${P.error}; }
.t7b2-msg p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
.t7b2-calcs { display: grid; gap: 4px; }
.t7b2-calc-l { margin: 0; font: 400 14px/1.45 "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7b2-calc-l b { color: ${P.texto}; font-weight: 600; }
/* asiento en lectura (modo RESUMEN del patrón, con borde de tarjeta) */
.t7b2-as { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7b2-g2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.t7b2-as-h { display: grid; gap: 6px; padding-bottom: 6px; font: 600 13px "Sora", "Inter", sans-serif; }
.t7b2-as-h .t7b2-g2 > span { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; text-align: right; padding-inline: 9px; }
.t7b2-d { color: ${P.debe}; } .t7b2-hb { color: ${P.haber}; }
.t7b2-as-r { display: grid; gap: 4px; padding-block: 8px; border-top: 1px solid ${P.borde}; }
.t7b2-as-r > span:first-child { font-size: 14px; overflow-wrap: anywhere; min-width: 0; }
.t7b2-as-r .t7b2-g2 > span { text-align: right; padding-inline: 9px; font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; min-width: 0; }
.t7b2-sangria { padding-left: 24px; }
/* el monto que no se muestra (X1): la casilla discontinua vacía del patrón, la misma del kárdex (KardexT7_2.jsx, .t7kx-sin) */
.t7b2-oculto { display: flex; align-items: center; height: 100%; }
.t7b2-oculto i { display: block; width: 100%; height: 18px; border: 1px dashed ${P.borde}; border-radius: 4px; }
/* P3: las dos líneas del asiento del costo */
.t7b2-lineas { display: grid; gap: 10px; }
.t7b2-la { display: grid; gap: 8px; min-width: 0; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7b2-la-mala { border-color: ${P.error}; }
.t7b2-la-cab { margin: 0; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 10px; font-size: 15px; line-height: 1.45; }
.t7b2-la-cab > span:first-child { overflow-wrap: anywhere; min-width: 0; }
.t7b2-monto { margin-left: auto; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${P.texto2}; }
.t7b2-lado { position: relative; appearance: none; min-height: 44px; min-width: 0; padding: 0 8px; border: 1px dashed ${P.borde}; border-radius: 8px; background: transparent; font: 600 15px/1 "Inter", sans-serif; cursor: pointer; transition: background-color .12s, border-color .12s, box-shadow .12s; }
.t7b2-lado-debe { color: ${P.debe}; }
.t7b2-lado-haber { color: ${P.haber}; }
.t7b2-lado[aria-pressed="true"] { border-style: solid; color: ${P.fondo}; }
.t7b2-lado-debe[aria-pressed="true"] { background: ${P.debe}; border-color: ${P.debe}; }
.t7b2-lado-haber[aria-pressed="true"] { background: ${P.haber}; border-color: ${P.haber}; }
.t7b2-lado-error[aria-pressed="true"] { box-shadow: 0 0 0 2px ${P.fondo}, 0 0 0 4px ${P.error}; }
.t7b2-lado[aria-disabled="true"] { cursor: default; }
.t7b2-marca { position: absolute; top: -9px; left: -9px; width: 18px; height: 18px; border-radius: 50%; background: ${P.fondo}; border: 1px solid ${P.error}; display: grid; place-items: center; line-height: 0; color: ${P.error}; }
/* P5: la estructura del estado de resultados, sin cifras */
.t7b2-er { margin: 0; padding: 4px 12px; list-style: none; border: 1px solid ${P.borde}; border-radius: 10px; display: grid; }
.t7b2-er li { list-style: none; padding-block: 8px; font-size: 14px; line-height: 1.35; overflow-wrap: anywhere; }
.t7b2-er li + li { border-top: 1px solid ${P.borde}; }
.t7b2-er li:last-child { font-weight: 600; }
.t7b2-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.t7b2-nueva { animation: t7b2-aparece .12s ease-out; }
@keyframes t7b2-aparece { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .t7b2 *, .t7b2 *::before, .t7b2 *::after { transition: none !important; animation: none !important; } }
`;

const nombreLado = (lado) => (lado === DEBE ? INTERFAZ.debe : INTERFAZ.haber);

function Pie({ texto }) { return <p className="t7b2-pie" data-pie>{texto}</p>; }

function Boton({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t7b2-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

function Mensaje({ ok, textos, refFoco }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t7b2-msg ${ok ? "t7b2-msg-ok" : "t7b2-msg-error"}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color={P.error} aria-hidden="true" />}
      <div className="t7b2-msg-cuerpo">
        <span className="t7b2-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        {textos.map((t) => <p key={t} data-texto><Plegable texto={t} /></p>)}
      </div>
    </div>
  );
}

function Ficha({ ficha }) {
  return (
    <dl className="t7b2-ficha" data-ficha>
      {ficha.map((f) => (
        <div key={f.dato} data-dato>
          <dt>{f.dato}</dt>
          <dd data-texto data-ficha-texto>{f.texto}</dd>
        </div>
      ))}
    </dl>
  );
}

/* El resultado de cada cálculo, en blanco: lo que va después del último «= ». */
function Calculos({ lista }) {
  return (
    <div className="t7b2-calcs" data-calculos>
      {lista.map((c) => {
        const i = c.lastIndexOf("= ");
        return <p key={c} className="t7b2-calc-l" data-texto data-calculo>{c.slice(0, i + 2)}<b>{c.slice(i + 2)}</b></p>;
      })}
    </div>
  );
}

/* ═══════════ UN ASIENTO, EN LECTURA ═══════════ */

export function Asiento({ asiento, nuevo = false }) {
  const monto = (l, lado) => {
    if (l.lado !== lado) return "";
    if (l.monto === null) {
      return (
        <span className="t7b2-oculto" data-oculto data-revision="pendiente">
          <i aria-hidden="true" />
          <span className="t7b2-sr">{PENDIENTE_DE_REVISION.montoOculto}</span>
        </span>
      );
    }
    return cifra(l.monto);
  };
  return (
    <div className={`t7b2-as${nuevo ? " t7b2-nueva" : ""}`} role="table" aria-label={PENDIENTE_DE_REVISION.nombreAsiento(asiento.fecha)} data-asiento={asiento.fecha} data-revision="pendiente">
      <div className="t7b2-as-h" role="row">
        <span role="columnheader" data-fecha>{asiento.fecha}</span>
        <span className="t7b2-g2">
          <span className="t7b2-d" role="columnheader">{INTERFAZ.debe}</span>
          <span className="t7b2-hb" role="columnheader">{INTERFAZ.haber}</span>
        </span>
      </div>
      {asiento.lineas.map((l) => (
        <div key={l.cuenta} className="t7b2-as-r" role="row" data-linea={l.cuenta} data-lado={l.lado}>
          <span role="rowheader" className={l.lado === DEBE ? undefined : "t7b2-sangria"}>{l.cuenta}</span>
          <span className="t7b2-g2">
            <span role="cell">{monto(l, DEBE)}</span>
            <span role="cell">{monto(l, HABER)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ ELECCIÓN (P1 y P4) ═══════════ */

function Eleccion({ pantalla, onSeguir }) {
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

  return (
    <div className="t7b2" data-eleccion={pantalla.id} data-estado={estado}>
      {pantalla.parrafos.map((t) => <p key={t} className="t7b2-p" data-texto><Plegable texto={t} /></p>)}
      {pantalla.enunciado && <p className="t7b2-enunciado" data-texto data-enunciado>{pantalla.enunciado}</p>}
      {pantalla.ficha && <Ficha ficha={pantalla.ficha} />}
      {pantalla.repaso && <p className="t7b2-p" data-texto data-repaso>{pantalla.repaso}</p>}
      <p className="t7b2-p t7b2-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t7b2-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button key={o.id} type="button" className={`t7b2-op${estado === "error" && esta ? " t7b2-op-error" : ""}`} data-opcion={o.id} aria-pressed={esta} disabled={Boolean(confirmada)} onClick={() => setElegida(o.id)}>
              {o.texto}
            </button>
          );
        })}
      </div>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!elegida} onClick={() => { contarFallo(pantalla, elegida, setFallos); setConfirmada(elegida); }} />}
      {estado === "error" && (
        <>
          <Mensaje ok={false} textos={textosDelError(pantalla, opcion, fallos)} refFoco={ref} />
          <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={() => { setOrden((a) => barajarDistinto(pantalla.opciones, a, (o) => o.id)); setElegida(null); setConfirmada(null); }} />
        </>
      )}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={[pantalla.acierto.texto]} refFoco={ref} />
          {pantalla.acierto.asiento && <Asiento asiento={pantalla.acierto.asiento} nuevo />}
          {(pantalla.acierto.despues ?? []).map((t) => <p key={t} className="t7b2-p t7b2-nueva" data-texto><Plegable texto={t} /></p>)}
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={pie} />
    </div>
  );
}

/* ═══════════ LADOS: EL ASIENTO DEL COSTO (P3) ═══════════ */

function Lados({ pantalla, onSeguir }) {
  const [orden] = useState(() => barajar(pantalla.lineas));
  const [puesto, setPuesto] = useState({});
  const [veredicto, setVeredicto] = useState(null);
  const [fallosLinea, setFallosLinea] = useState({});
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
    const malas = orden.filter((l) => puesto[l.id] !== l.lado).map((l) => l.id);
    setFallosLinea((f) => sumarFallosDeLineas(f, malas));
    setVeredicto({ malas });
  };
  const probarOtra = () => {
    setPuesto((p) => puestoTrasProbarOtra(p, malas, pantalla.lineas, cerrada));
    setVeredicto(null);
  };

  return (
    <div className="t7b2" data-lados={pantalla.id} data-estado={estado}>
      <p className="t7b2-p" data-texto data-consigna>{pantalla.consigna}</p>
      <div className="t7b2-lineas" role="group" aria-label={pantalla.consigna}>
        {orden.map((l) => {
          const lado = puesto[l.id];
          const mala = malas.includes(l.id);
          const boton = (cual) => {
            const esta = lado === cual;
            const error = esta && mala;
            return (
              <button
                type="button"
                className={`t7b2-lado t7b2-lado-${cual}${error ? " t7b2-lado-error" : ""}`}
                data-linea={l.id}
                data-lado={cual}
                aria-pressed={esta}
                aria-disabled={estado !== "colocando" || cerrada(l) ? "true" : undefined}
                aria-label={`${l.cuenta}, ${cifra(l.monto)}: ${nombreLado(cual)}${error ? ", incorrecto" : ""}`}
                onClick={() => tocar(l, cual)}
              >
                {error && <span className="t7b2-marca" data-marca><X size={12} aria-hidden="true" /></span>}
                {nombreLado(cual)}
              </button>
            );
          };
          return (
            <div key={l.id} className={`t7b2-la${mala ? " t7b2-la-mala" : ""}`} data-fila={l.id}>
              <p className="t7b2-la-cab">
                <span data-texto data-cuenta>{l.cuenta}</span>
                <span className="t7b2-monto" data-monto>{cifra(l.monto)}</span>
              </p>
              <span className="t7b2-g2">{boton(DEBE)}{boton(HABER)}</span>
              {mala && estado === "error" && <Mensaje ok={false} textos={textosDeLinea(pantalla, l, fallosLinea[l.id] ?? 0)} refFoco={l.id === malas[0] ? ref : undefined} />}
            </div>
          );
        })}
      </div>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!completo} onClick={confirmar} />}
      {estado === "error" && <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={probarOtra} />}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={[pantalla.acierto.texto]} refFoco={ref} />
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={pie} />
    </div>
  );
}

/* ═══════════ LA PIEZA ═══════════ */

export default function LaVentaEnDosAsientos({ pieza = PIEZA_LA_VENTA_EN_DOS_ASIENTOS, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_T7B2}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        {p.tipo === "eleccion" && <Eleccion key={p.id} pantalla={p} onSeguir={seguir} />}
        {p.tipo === "lados" && <Lados key={p.id} pantalla={p} onSeguir={seguir} />}
        {(p.tipo === "portada" || p.tipo === "lectura" || p.tipo === "resumen") && (
          <div className="t7b2">
            {p.objetivo && <p className="t7b2-p" data-texto data-objetivo>{p.objetivo}</p>}
            {p.enunciado && <p className="t7b2-enunciado" data-texto data-enunciado>{p.enunciado}</p>}
            {p.ficha && <Ficha ficha={p.ficha} />}
            {p.parrafos?.map((t) => <p key={t} className="t7b2-p" data-texto><Plegable texto={t} /></p>)}
            {p.calculos && <Calculos lista={p.calculos} />}
            {p.asiento && <Asiento asiento={p.asiento} />}
            {p.estructura && (
              <ul className="t7b2-er" data-estructura>
                {p.estructura.map((t) => <li key={t} data-texto>{t}</li>)}
              </ul>
            )}
            {p.cierre && <p className="t7b2-p" data-texto>{p.cierre}</p>}
            {p.lista && (
              <ol className="t7b2-lista" data-lista>
                {p.lista.map((t) => <li key={t} data-texto>{t}</li>)}
              </ol>
            )}
            {p.siguiente && <p className="t7b2-nota" data-texto data-siguiente>{p.siguiente}</p>}
            {p.boton && <Boton nombre={p.tipo === "portada" ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <Pie texto={p.pie} />
          </div>
        )}
      </div>
    </Panel>
  );
}
