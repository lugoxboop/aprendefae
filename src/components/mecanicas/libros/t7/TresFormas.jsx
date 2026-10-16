import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_TRES_FORMAS, BOTON, INTERFAZ } from "../../../../data/contabilidadT7_1_ap3.js";
import { Plegable, partirEnFrases } from "./plegable.jsx";
import { textosDelError, contarFallo } from "./escaleraAyuda.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP3 «Tres formas de ponerle precio a lo que quedó» (recorte del
 * lote 1 de Near, con las correcciones de Mello).
 *
 * Diez pantallas, una a la vez. Tres tipos:
 *
 *   · lectura    textos y, según la pantalla, la pila de unidades (P1: 10 del
 *                inicio y 30 compradas; salen 35 y quedan 5, sin precio) o la
 *                tabla de los tres métodos (P9); botón y pie
 *   · eleccion   un encabezado (el método, en P2 a P4), la tabla (P5), la
 *                pregunta con opciones barajadas en cada intento, «Confirmar»,
 *                y el mensaje «Incorrecto.» con «Probar otra» o «Correcto.»
 *                con «Seguir». La cuenta del inventario final llega con el
 *                acierto
 *   · tarjetas   (P7) tres tarjetas cerradas, una por método. Al tocar una se
 *                abre solo esa, con «A favor» y «En contra»; al tocar otra, la
 *                anterior se cierra. «Seguir» se activa cuando se han abierto
 *                las tres: la de UEPS trae la glosa de «impuesto de renta»
 *                que A4 usa (corrección 2 de Mello)
 *
 * El acierto puede traer su plegado escrito aparte (`acierto.porque`). Por la
 * regla de L, lo que de ese plegado traiga una condición («solo»,
 * «directamente», «cuando», «si») se queda a la vista: ver `partirPorque`.
 *
 * Sin color de debe ni de haber: el acierto se marca con ✓ y borde neutro.
 * NO CALIFICA y no da FP: es Aprender. Clases con el prefijo `t7a3-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", error: "#E76F51" };

/* La pila de P1: cuándo empiezan a salir las 35, cada cuánto sale una y cuánto tarda. */
export const PILA = { inicio: 0.7, paso: 0.03, sale: 0.45 };

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
.t7a3-btn:focus-visible, .t7a3-op:focus-visible, .t7a3-abre:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
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
.t7a3-calc-l b { color: ${P.texto}; font-weight: 600; }
/* P1 · la pila: cada unidad, un cuadro. Las 35 que salen se apagan y se encogen; las 5 que quedan llegan sin precio.
 * El estilo de base es el final: sin movimiento (prefers-reduced-motion), se ve el final. */
.t7a3-pila { margin: 0; display: grid; gap: 10px; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; min-width: 0; }
.t7a3-grupo { display: grid; gap: 6px; }
.t7a3-rot { margin: 0; font: 500 13px/1.35 "Inter", sans-serif; color: ${P.texto2}; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.t7a3-uds, .t7a3-quedan { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 4px; max-width: 240px; }
.t7a3-u { aspect-ratio: 1; border-radius: 3px; border: 1px solid ${P.texto}; opacity: .3; transform: scale(.72);
  animation: t7a3-sale ${PILA.sale}s ease-in both; animation-delay: var(--t7a3-d, 0s); }
.t7a3-u-inicio { background: ${P.texto2}; border-color: ${P.texto2}; }
.t7a3-u-compras { background: ${P.texto}; }
@keyframes t7a3-sale { from { opacity: 1; transform: none; } to { opacity: .3; transform: scale(.72); } }
.t7a3-quedan { padding-top: 10px; border-top: 1px dashed ${P.texto2}; animation: t7a3-llegan .4s ease-out both; animation-delay: var(--t7a3-d, 0s); }
.t7a3-q { aspect-ratio: 1; border-radius: 3px; border: 1px dashed ${P.texto}; display: grid; place-items: center; font: 600 12px/1 "Inter", sans-serif; color: ${P.texto}; }
@keyframes t7a3-llegan { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
/* P5 y P9 · la tabla de los tres métodos. */
.t7a3-tabla { width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.35; font-variant-numeric: tabular-nums; }
.t7a3-tabla th, .t7a3-tabla td { padding: 7px 6px; text-align: left; vertical-align: top; border-bottom: 1px solid rgba(184,196,212,.35); overflow-wrap: break-word; }
.t7a3-tabla th:first-child, .t7a3-tabla td:first-child { padding-left: 0; }
.t7a3-tabla th:last-child, .t7a3-tabla td:last-child { padding-right: 0; text-align: right; white-space: nowrap; overflow-wrap: normal; }
.t7a3-tabla thead th { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; letter-spacing: .02em; }
.t7a3-tabla tbody th { font-weight: 600; }
/* P7 · tarjetas que se abren una a la vez. */
.t7a3-tarjetas { display: grid; gap: 8px; }
.t7a3-tarjeta { border: 1px solid ${P.borde}; border-radius: 10px; min-width: 0; }
.t7a3-tarjeta[data-abierta="si"] { border-color: ${P.texto}; box-shadow: inset 0 0 0 1px ${P.texto}; }
.t7a3-abre { appearance: none; width: 100%; min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px; border: none; border-radius: 10px; background: transparent; color: ${P.texto}; font: 600 15px/1.35 "Sora", "Inter", sans-serif; text-align: left; cursor: pointer; overflow-wrap: anywhere; }
.t7a3-abre svg { flex: none; transition: transform .15s ease; }
.t7a3-abre[aria-expanded="true"] svg { transform: rotate(180deg); }
.t7a3-abierta { margin: 0; display: grid; gap: 6px; padding: 0 12px 12px; }
.t7a3-abierta dt { font: 500 12px/1.2 "Inter", sans-serif; color: ${P.texto2}; letter-spacing: .02em; }
.t7a3-abierta dd { margin: 0 0 4px; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
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

/*
 * El plegado escrito aparte, con la regla de L: lo que traiga una condición se
 * queda a la vista. Devuelve [lo que se suma a lo visible, lo que se pliega o
 * null]. Se le pregunta a `partirEnFrases` con dos frases delante: lo que él
 * plegaría del plegado es lo único que puede ir detrás de «¿Por qué?».
 */
export function partirPorque(porque) {
  if (!porque) return ["", null];
  const plegable = partirEnFrases(`A. B. ${porque}`)[1].trimStart();
  const aLaVista = porque.slice(0, porque.length - plegable.length).trim();
  return [aLaVista ? ` ${aLaVista}` : "", plegable || null];
}

function Mensaje({ ok, textos, porque = null, refFoco }) {
  const [mas, plegado] = partirPorque(porque);
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t7a3-msg ${ok ? "t7a3-msg-ok" : "t7a3-msg-error"}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color={P.error} aria-hidden="true" />}
      <div className="t7a3-msg-cuerpo">
        <span className="t7a3-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        {textos.map((t, i) => (
          <p key={t} data-texto>{porque && i === textos.length - 1 ? <Plegable texto={t + mas} porque={plegado} /> : <Plegable texto={t} />}</p>
        ))}
      </div>
    </div>
  );
}

/* El resultado de cada cálculo, en blanco: lo que va después del último «= ». */
function Calculos({ lista }) {
  if (!lista?.length) return null;
  return (
    <div className="t7a3-calcs t7a3-nueva" data-calculos>
      {lista.map((c) => {
        const i = c.lastIndexOf("= ");
        return <p key={c} className="t7a3-calc-l" data-texto data-calculo>{c.slice(0, i + 2)}<b>{c.slice(i + 2)}</b></p>;
      })}
    </div>
  );
}

/*
 * P1 · la pila. Las unidades, en el orden en que entraron (primero las del
 * inicio). Las 35 que se venden se apagan una tras otra, y abajo aparecen
 * las 5 que quedan, sin precio: el conteo no dice de qué grupo son.
 */
export function Pila({ pila }) {
  let k = 0;
  const fin = PILA.inicio + (pila.salen - 1) * PILA.paso + PILA.sale;
  return (
    <figure className="t7a3-pila" data-pila>
      {pila.grupos.map((g) => (
        <div key={g.id} className="t7a3-grupo" data-grupo={g.id}>
          <p className="t7a3-rot" data-texto>{g.rotulo}</p>
          <div className="t7a3-uds" aria-hidden="true">
            {Array.from({ length: g.unidades }, () => {
              const d = PILA.inicio + Math.min(k, pila.salen - 1) * PILA.paso;
              k++;
              return <span key={k} className={`t7a3-u t7a3-u-${g.id}`} data-unidad style={{ "--t7a3-d": `${d.toFixed(2)}s` }} />;
            })}
          </div>
        </div>
      ))}
      <div className="t7a3-quedan" data-quedan aria-hidden="true" style={{ "--t7a3-d": `${fin.toFixed(2)}s` }}>
        {Array.from({ length: pila.quedan }, (_, i) => <span key={i} className="t7a3-q" data-queda>?</span>)}
      </div>
    </figure>
  );
}

/* P5 y P9 · la tabla: método · quedan · valen. */
export function Tabla({ tabla }) {
  return (
    <table className="t7a3-tabla" data-tabla data-figura>
      <thead>
        <tr>{tabla.columnas.map((c) => <th key={c} scope="col" data-texto>{c}</th>)}</tr>
      </thead>
      <tbody>
        {tabla.filas.map((f) => (
          <tr key={f.metodo} data-fila={f.metodo}>
            <th scope="row" data-texto>{f.metodo}</th>
            <td data-texto>{f.quedan}</td>
            <td data-texto data-valor>{f.valen}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* P7 · tres tarjetas cerradas; se abre una a la vez. */
function Tarjetas({ pantalla, onSeguir }) {
  const { rotulos, metodos } = pantalla.tarjetas;
  const [abierta, setAbierta] = useState(null);
  const [vistas, setVistas] = useState([]);
  const abrir = (id) => {
    setAbierta((a) => (a === id ? null : id));
    setVistas((v) => (v.includes(id) ? v : [...v, id]));
  };
  return (
    <div className="t7a3" data-tarjetas={pantalla.id}>
      {pantalla.parrafos.map((t) => <p key={t} className="t7a3-p" data-texto><Plegable texto={t} /></p>)}
      <div className="t7a3-tarjetas">
        {metodos.map((m) => {
          const esta = abierta === m.id;
          const panel = `t7a3-tarjeta-${m.id}`;
          return (
            <section key={m.id} className="t7a3-tarjeta" data-tarjeta={m.id} data-abierta={esta ? "si" : "no"}>
              <button type="button" className="t7a3-abre" data-abrir={m.id} aria-expanded={esta} aria-controls={esta ? panel : undefined} onClick={() => abrir(m.id)}>
                <span data-texto>{m.metodo}</span>
                <ChevronDown size={18} aria-hidden="true" />
              </button>
              {esta && (
                <dl id={panel} className="t7a3-abierta t7a3-nueva" data-abierta-de={m.id}>
                  <dt data-texto>{rotulos.aFavor}</dt>
                  <dd data-texto>{m.aFavor}</dd>
                  <dt data-texto>{rotulos.enContra}</dt>
                  <dd data-texto>{m.enContra}</dd>
                </dl>
              )}
            </section>
          );
        })}
      </div>
      <Boton nombre="seguir" texto={pantalla.boton} inactivo={vistas.length < metodos.length} onClick={onSeguir} />
      <Pie texto={pantalla.pie} />
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
    <div className="t7a3" data-eleccion={pantalla.id} data-estado={estado}>
      {pantalla.encabezado && <p className="t7a3-h" data-texto data-encabezado>{pantalla.encabezado}</p>}
      {pantalla.parrafos.map((t) => <p key={t} className="t7a3-p" data-texto><Plegable texto={t} /></p>)}
      {pantalla.figura && <Tabla tabla={pantalla.figura} />}
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
      {estado === "colocando" && <Boton nombre="confirmar" texto={BOTON.confirmar} inactivo={!elegida} onClick={() => { contarFallo(pantalla, elegida, setFallos); setConfirmada(elegida); }} />}
      {estado === "error" && (
        <>
          <Mensaje ok={false} textos={textosDelError(pantalla, opcion, fallos)} refFoco={ref} />
          <Boton nombre="probar-otra" texto={BOTON.probarOtra} onClick={() => { setOrden((a) => barajarDistinto(pantalla.opciones, a, (o) => o.id)); setElegida(null); setConfirmada(null); }} />
        </>
      )}
      {estado === "acierto" && (
        <>
          <Mensaje ok textos={[pantalla.acierto.texto]} porque={pantalla.acierto.porque} refFoco={ref} />
          <Calculos lista={pantalla.acierto.calculos} />
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
        ) : p.tipo === "tarjetas" ? (
          <Tarjetas key={p.id} pantalla={p} onSeguir={seguir} />
        ) : (
          <div className="t7a3">
            {p.objetivo && <p className="t7a3-p" data-texto data-objetivo>{p.objetivo}</p>}
            {p.pila && <Pila pila={p.pila} />}
            {p.parrafos.map((t) => <p key={t} className="t7a3-p" data-texto><Plegable texto={t} /></p>)}
            {p.figura && <Tabla tabla={p.figura} />}
            {(p.despues ?? []).map((t) => <p key={t} className="t7a3-p" data-texto><Plegable texto={t} /></p>)}
            {p.siguiente && <p className="t7a3-nota" data-texto data-siguiente>{p.siguiente}</p>}
            {p.boton && <Boton nombre={k === 0 ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <Pie texto={p.pie} />
          </div>
        )}
      </div>
    </Panel>
  );
}
