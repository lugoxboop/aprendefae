import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_CONTROL_INTERNO, BOTON, INTERFAZ } from "../../../../data/contabilidadT7_1_a7.js";
import { Plegable } from "./plegable.jsx";
import { textosDelError, contarFallo } from "./escaleraAyuda.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · A7 «Control interno de los inventarios».
 *
 * Cinco pantallas, una a la vez, sin figura. Tres tipos:
 *
 *   · portada / lectura / resumen   textos, botón y pie
 *   · eleccion   un caso con opciones (barajadas en cada intento),
 *                «Confirmar», y el mensaje «Incorrecto.» con «Probar otra» o
 *                «Correcto.» con «Seguir». En P3, antes de la pregunta, la
 *                lista del libro numerada y en su orden, y las dos glosas
 *
 * Las formas son las de A5 (preguntas de opción del patrón de la célula). Cada
 * pantalla lleva su pie en todos sus estados: el de colocando, el del error y
 * el del acierto, como los da la v1. NO CALIFICA y no da FP: es Aprender.
 * Clases con el prefijo `t7a7-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", error: "#E76F51" };

export const CSS_A7 = `

.t7a7 { display: grid; gap: 12px; min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.4; }
.t7a7 * { box-sizing: border-box; }
.t7a7-p { margin: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t7a7-nota { margin: 0; font-size: 14px; line-height: 1.45; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a7-preg { font: 600 15px/1.45 "Sora", "Inter", sans-serif; }
.t7a7-lista { margin: 0; padding-left: 22px; display: grid; gap: 6px; font-size: 15px; line-height: 1.45; }
/* La hoja global del sitio quita el estilo de lista: aquí vuelven los números. */
.t7a7-lista li { overflow-wrap: anywhere; list-style: decimal; }
.t7a7-lista li::marker { color: ${P.texto2}; font-variant-numeric: tabular-nums; }
.t7a7-pie { margin: 4px 0 0; font-size: 12px; line-height: 1.4; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a7-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${P.texto}; background: ${P.texto}; color: ${P.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t7a7-btn[aria-disabled="true"] { background: transparent; color: ${P.texto2}; border-color: ${P.texto2}; cursor: default; }
.t7a7-btn:focus-visible, .t7a7-op:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
.t7a7-ops { display: grid; gap: 8px; }
.t7a7-op { appearance: none; text-align: left; min-height: 44px; padding: 10px 14px; border: 1px solid ${P.borde}; border-radius: 12px; background: transparent; color: ${P.texto}; font: 400 15px/1.35 "Inter", sans-serif; cursor: pointer; overflow-wrap: anywhere; }
.t7a7-op[aria-pressed="true"] { background: ${P.texto}; color: ${P.fondo}; border-color: ${P.texto}; }
.t7a7-op:disabled { cursor: default; }
.t7a7-op-error { border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7a7-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 10px 12px; border-radius: 8px; border: 1px solid; outline: none; }
.t7a7-msg-error { border-color: ${P.error}; }
.t7a7-msg-ok { border-color: ${P.borde}; }
.t7a7-msg svg { margin-top: 2px; }
.t7a7-msg-cuerpo { display: grid; gap: 6px; min-width: 0; }
.t7a7-msg-palabra { font: 600 14px/1.35 "Inter", sans-serif; }
.t7a7-msg-error .t7a7-msg-palabra { color: ${P.error}; }
.t7a7-msg p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
@media (prefers-reduced-motion: reduce) { .t7a7 *, .t7a7 *::before, .t7a7 *::after { transition: none !important; animation: none !important; } }

`;

function Pie({ texto }) { return <p className="t7a7-pie" data-pie>{texto}</p>; }

function Boton({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t7a7-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

function Mensaje({ ok, textos, refFoco }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t7a7-msg ${ok ? "t7a7-msg-ok" : "t7a7-msg-error"}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color={P.error} aria-hidden="true" />}
      <div className="t7a7-msg-cuerpo">
        <span className="t7a7-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        {textos.map((t) => <p key={t} data-texto><Plegable texto={t} /></p>)}
      </div>
    </div>
  );
}

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
    <div className="t7a7" data-eleccion={pantalla.id} data-estado={estado}>
      {pantalla.parrafos.map((t) => <p key={t} className="t7a7-p" data-texto><Plegable texto={t} /></p>)}
      {pantalla.lista && (
        <ol className="t7a7-lista" data-lista>
          {pantalla.lista.map((t) => <li key={t} data-texto>{t}</li>)}
        </ol>
      )}
      {(pantalla.despues ?? []).map((t) => <p key={t} className="t7a7-p" data-texto><Plegable texto={t} /></p>)}
      <p className="t7a7-p t7a7-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t7a7-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button key={o.id} type="button" className={`t7a7-op${estado === "error" && esta ? " t7a7-op-error" : ""}`} data-opcion={o.id} aria-pressed={esta} disabled={Boolean(confirmada)} onClick={() => setElegida(o.id)}>
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
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={pie} />
    </div>
  );
}

export default function ControlInterno({ pieza = PIEZA_CONTROL_INTERNO, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_A7}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        {p.tipo === "eleccion" ? (
          <Eleccion key={p.id} pantalla={p} onSeguir={seguir} />
        ) : (
          <div className="t7a7">
            {p.objetivo && <p className="t7a7-p" data-texto data-objetivo>{p.objetivo}</p>}
            {p.parrafos?.map((t) => <p key={t} className="t7a7-p" data-texto><Plegable texto={t} /></p>)}
            {p.siguiente && <p className="t7a7-nota" data-texto data-siguiente>{p.siguiente}</p>}
            {p.boton && <Boton nombre={p.tipo === "portada" ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <Pie texto={p.pie} />
          </div>
        )}
      </div>
    </Panel>
  );
}
