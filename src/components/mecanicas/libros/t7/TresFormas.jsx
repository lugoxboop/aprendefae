import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_TRES_FORMAS, BOTON, INTERFAZ } from "../../../../data/contabilidadT7_1_ap3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP3 «Tres formas de ponerle precio a lo que quedó».
 *
 * Diez pantallas, una a la vez. Dos tipos:
 *
 *   · lectura    textos y, según la pantalla, la ficha de B-1 y su cálculo
 *                (P2); botón y pie
 *   · eleccion   un encabezado (el método, en P3 a P5), la pregunta con
 *                opciones barajadas en cada intento, «Confirmar», y el mensaje
 *                «Incorrecto.» con «Probar otra» o «Correcto.» con «Seguir».
 *                Los cálculos del acierto llegan con el acierto. En P6, las
 *                tres tarjetas de los métodos; en P7, las tres de «a favor»
 *                y «en contra»
 *
 * No hay «Figura de AP3»: P6 y P7 van con la forma que la v2 le indica a
 * Watari (una tarjeta por método), con los tokens del patrón de la célula,
 * sin color de debe ni de haber. NO CALIFICA y no da FP: es Aprender. Clases
 * con el prefijo `t7a3-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", error: "#E76F51" };

export const CSS_AP3 = `
.t7a3 { display: grid; gap: 12px; min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.4; }
.t7a3 * { box-sizing: border-box; }
.t7a3-p { margin: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t7a3-nota { margin: 0; font-size: 14px; line-height: 1.45; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a3-preg { font: 600 15px/1.45 "Sora", "Inter", sans-serif; }
.t7a3-h { margin: 0; font: 600 13px/1.3 "Sora", "Inter", sans-serif; letter-spacing: .02em; overflow-wrap: anywhere; }
.t7a3-pie { margin: 4px 0 0; font-size: 12px; line-height: 1.4; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7a3-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${P.texto}; background: ${P.texto}; color: ${P.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t7a3-btn[aria-disabled="true"] { background: transparent; color: ${P.texto2}; border-color: ${P.texto2}; cursor: default; }
.t7a3-btn:focus-visible, .t7a3-op:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
.t7a3-ficha { margin: 0; display: grid; gap: 6px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7a3-ficha dt { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; letter-spacing: .02em; }
.t7a3-ficha dd { margin: 0 0 4px; font-size: 15px; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t7a3-ops { display: grid; gap: 8px; }
.t7a3-op { appearance: none; text-align: left; min-height: 44px; padding: 10px 14px; border: 1px solid ${P.borde}; border-radius: 12px; background: transparent; color: ${P.texto}; font: 400 15px/1.35 "Inter", sans-serif; cursor: pointer; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t7a3-op[aria-pressed="true"] { background: ${P.texto}; color: ${P.fondo}; border-color: ${P.texto}; }
.t7a3-op:disabled { cursor: default; }
.t7a3-op-error { border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7a3-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 10px 12px; border-radius: 8px; border: 1px solid; outline: none; }
.t7a3-msg-error { border-color: ${P.error}; }
.t7a3-msg-ok { border-color: ${P.borde}; }
.t7a3-msg svg { margin-top: 2px; }
.t7a3-msg-cuerpo { display: grid; gap: 6px; min-width: 0; }
.t7a3-msg-palabra { font: 600 14px/1.35 "Inter", sans-serif; }
.t7a3-msg-error .t7a3-msg-palabra { color: ${P.error}; }
.t7a3-msg p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
.t7a3-calcs { display: grid; gap: 4px; }
.t7a3-calc-l { margin: 0; font: 400 14px/1.45 "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${P.texto2}; overflow-wrap: anywhere; }
/* Sin nowrap: un resultado con texto (AP4, P5) empujaba el panel a 320. Una cifra no se parte igual. */
.t7a3-calc-l b { color: ${P.texto}; font-weight: 600; }
/* tarjetas: una por método (P6) y «a favor» / «en contra» (P7) */
.t7a3-tarjetas { display: grid; gap: 8px; }
.t7a3-tarjeta { margin: 0; display: grid; gap: 8px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; min-width: 0; }
.t7a3-tarjeta dl { margin: 0; display: grid; gap: 6px; }
.t7a3-tarjeta dt { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; letter-spacing: .02em; }
.t7a3-tarjeta dd { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t7a3-fila { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 2px 8px; }
.t7a3-fila dd { margin-left: auto; font: 500 15px/1.3 "Inter", sans-serif; white-space: nowrap; }
.t7a3-fila dd.t7a3-txt { white-space: normal; font: 400 14px/1.4 "Inter", sans-serif; text-align: right; }
.t7a3-nueva { animation: t7a3-aparece .12s ease-out; }
@keyframes t7a3-aparece { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .t7a3 *, .t7a3 *::before, .t7a3 *::after { transition: none !important; animation: none !important; } }
`;

function Pie({ texto }) { return <p className="t7a3-pie" data-pie>{texto}</p>; }

function Boton({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t7a3-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

function Mensaje({ ok, textos, refFoco }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t7a3-msg ${ok ? "t7a3-msg-ok" : "t7a3-msg-error"}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color={P.error} aria-hidden="true" />}
      <div className="t7a3-msg-cuerpo">
        <span className="t7a3-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        {textos.map((t) => <p key={t} data-texto>{t}</p>)}
      </div>
    </div>
  );
}

/* El resultado de cada cálculo, en blanco: lo que va después del último «= ». */
function Calculos({ lista, nueva = false }) {
  if (!lista?.length) return null;
  return (
    <div className={`t7a3-calcs${nueva ? " t7a3-nueva" : ""}`} data-calculos>
      {lista.map((c) => {
        const i = c.lastIndexOf("= ");
        if (i < 0) return <p key={c} className="t7a3-calc-l" data-texto data-calculo>{c}</p>;
        return <p key={c} className="t7a3-calc-l" data-texto data-calculo>{c.slice(0, i + 2)}<b>{c.slice(i + 2)}</b></p>;
      })}
    </div>
  );
}

/* P6 · una tarjeta por método, con las tres columnas de la tabla de Near. */
export function TarjetasMetodos({ metodos }) {
  return (
    <div className="t7a3-tarjetas" data-metodos>
      {metodos.filas.map((f) => (
        <section key={f.metodo} className="t7a3-tarjeta" data-tarjeta={f.metodo} aria-label={f.metodo}>
          <p className="t7a3-h" data-texto>{f.metodo}</p>
          <dl>
            {metodos.columnas.map((c, i) => (
              <div key={c} className="t7a3-fila">
                <dt>{c}</dt>
                <dd className={i === 0 ? "t7a3-txt" : undefined} data-valor>{f.valores[i]}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

/* P7 · tres tarjetas, cada una con «a favor» y «en contra». */
export function TarjetasAFavor({ tarjetas }) {
  return (
    <div className="t7a3-tarjetas" data-a-favor>
      {tarjetas.metodos.map((m) => (
        <section key={m.metodo} className="t7a3-tarjeta" data-tarjeta={m.metodo} aria-label={m.metodo}>
          <p className="t7a3-h" data-texto>{m.metodo}</p>
          <dl>
            <dt>{tarjetas.rotulos.aFavor}</dt>
            <dd data-texto>{m.aFavor}</dd>
            <dt>{tarjetas.rotulos.enContra}</dt>
            <dd data-texto>{m.enContra}</dd>
          </dl>
        </section>
      ))}
    </div>
  );
}

function Eleccion({ pantalla, onSeguir }) {
  const [orden, setOrden] = useState(() => barajar(pantalla.opciones));
  const [elegida, setElegida] = useState(null);
  const [confirmada, setConfirmada] = useState(null);
  const ref = useRef(null);
  const opcion = confirmada ? pantalla.opciones.find((o) => o.id === confirmada) : null;
  const estado = !opcion ? "colocando" : opcion.correcta ? "acierto" : "error";
  useEffect(() => { if (estado !== "colocando") ref.current?.focus(); }, [estado]);
  const pie = estado === "colocando" ? pantalla.pie : estado === "error" ? pantalla.error.pie : pantalla.acierto.pie;

  return (
    <div className="t7a3" data-eleccion={pantalla.id} data-estado={estado}>
      {pantalla.encabezado && <p className="t7a3-h" data-texto data-encabezado>{pantalla.encabezado}</p>}
      {pantalla.parrafos.map((t) => <p key={t} className="t7a3-p" data-texto>{t}</p>)}
      <Calculos lista={pantalla.calculos} />
      {pantalla.metodos && <TarjetasMetodos metodos={pantalla.metodos} />}
      {pantalla.tarjetas && <TarjetasAFavor tarjetas={pantalla.tarjetas} />}
      <p className="t7a3-p t7a3-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t7a3-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button key={o.id} type="button" className={`t7a3-op${estado === "error" && esta ? " t7a3-op-error" : ""}`} data-opcion={o.id} aria-pressed={esta} disabled={Boolean(confirmada)} onClick={() => setElegida(o.id)}>
              {o.texto}
            </button>
          );
        })}
      </div>
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!elegida} onClick={() => setConfirmada(elegida)} />}
      {estado === "error" && (
        <>
          <Mensaje ok={false} textos={[opcion.devolucion]} refFoco={ref} />
          <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={() => { setOrden((a) => barajarDistinto(pantalla.opciones, a, (o) => o.id)); setElegida(null); setConfirmada(null); }} />
        </>
      )}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={[pantalla.acierto.texto]} refFoco={ref} />
          <Calculos lista={pantalla.acierto.calculos} nueva />
          <Boton nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />
        </>
      )}
      <Pie texto={pie} />
    </div>
  );
}

export default function TresFormas({ pieza = PIEZA_TRES_FORMAS, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_AP3}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        {p.tipo === "eleccion" ? (
          <Eleccion key={p.id} pantalla={p} onSeguir={seguir} />
        ) : (
          <div className="t7a3">
            {p.objetivo && <p className="t7a3-p" data-texto data-objetivo>{p.objetivo}</p>}
            {p.parrafos.map((t) => <p key={t} className="t7a3-p" data-texto>{t}</p>)}
            {p.ficha && (
              <dl className="t7a3-ficha" data-ficha>
                {p.ficha.map((f) => (
                  <div key={f.dato} data-dato>
                    <dt>{f.dato}</dt>
                    <dd>{f.texto}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Calculos lista={p.calculos} />
            {p.cierre && <p className="t7a3-p" data-texto>{p.cierre}</p>}
            {p.siguiente && <p className="t7a3-nota" data-texto data-siguiente>{p.siguiente}</p>}
            {p.boton && <Boton nombre={k === 0 ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <Pie texto={p.pie} />
          </div>
        )}
      </div>
    </Panel>
  );
}
