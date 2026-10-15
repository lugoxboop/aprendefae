import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { barajar, barajarDistinto } from "../../../../utils/barajar.js";
import { Panel } from "../../salaDeControl/marco.jsx";
import { PIEZA_LA_CUENTA_QUE_SI_SE_MUEVE, BOTON, INTERFAZ, DEBE, HABER } from "../../../../data/contabilidadT7_2.js";
import { textosDelError, contarFallo, textosDeLinea, lineaCerrada, sumarFallosDeLineas, puestoTrasProbarOtra } from "./escaleraAyuda.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A1 «La cuenta que sí se mueve».
 *
 * Siete pantallas, una a la vez, sin figura y sin cifras. Cuatro tipos:
 *
 *   · portada / lectura   textos, botón y pie
 *   · lados      P3: las cinco líneas de la lista del libro, barajadas al
 *                entrar, cada una con «Debe» | «Haber». «Confirmar» se activa
 *                con todas puestas y marca con la X cada línea en el lado
 *                equivocado, con su explicación debajo; «Probar otra» deja
 *                las buenas y devuelve solo esas. Es la forma de AP4 de T7-1,
 *                sin montos: aquí el lado elegido se lee en el botón
 *   · eleccion   P5: pregunta con opciones barajadas en cada intento, como A7
 *   · resumen    la lista numerada, la línea «Siguiente» y el pie
 *
 * Cada pantalla lleva su pie en todos sus estados. NO CALIFICA y no da FP: es
 * Aprender. Clases con el prefijo `t7b1-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const P = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", debe: "#2A9D8F", haber: "#E9C46A", error: "#E76F51" };

export const CSS_T7B1 = `
.t7b1 { display: grid; gap: 12px; min-width: 0; color: ${P.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.4; }
.t7b1 * { box-sizing: border-box; }
.t7b1-p { margin: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t7b1-nota { margin: 0; font-size: 14px; line-height: 1.45; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7b1-preg { font: 600 15px/1.45 "Sora", "Inter", sans-serif; }
.t7b1-lista { margin: 0; padding-left: 22px; display: grid; gap: 6px; font-size: 15px; line-height: 1.45; }
/* La hoja global del sitio quita el estilo de lista: aquí vuelven los números. */
.t7b1-lista li { overflow-wrap: anywhere; list-style: decimal; }
.t7b1-lista li::marker { color: ${P.texto2}; font-variant-numeric: tabular-nums; }
.t7b1-pie { margin: 4px 0 0; font-size: 12px; line-height: 1.4; color: ${P.texto2}; overflow-wrap: anywhere; }
.t7b1-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${P.texto}; background: ${P.texto}; color: ${P.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t7b1-btn[aria-disabled="true"] { background: transparent; color: ${P.texto2}; border-color: ${P.texto2}; cursor: default; }
.t7b1-btn:focus-visible, .t7b1-op:focus-visible, .t7b1-lado:focus-visible { outline: 2px solid ${P.texto}; outline-offset: 2px; }
.t7b1-ops { display: grid; gap: 8px; }
.t7b1-op { appearance: none; text-align: left; min-height: 44px; padding: 10px 14px; border: 1px solid ${P.borde}; border-radius: 12px; background: transparent; color: ${P.texto}; font: 400 15px/1.35 "Inter", sans-serif; cursor: pointer; overflow-wrap: anywhere; }
.t7b1-op[aria-pressed="true"] { background: ${P.texto}; color: ${P.fondo}; border-color: ${P.texto}; }
.t7b1-op:disabled { cursor: default; }
.t7b1-op-error { border-color: ${P.error}; box-shadow: inset 0 0 0 1px ${P.error}; }
.t7b1-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 10px 12px; border-radius: 8px; border: 1px solid; outline: none; }
.t7b1-msg-error { border-color: ${P.error}; }
.t7b1-msg-ok { border-color: ${P.borde}; }
.t7b1-msg svg { margin-top: 2px; }
.t7b1-msg-cuerpo { display: grid; gap: 6px; min-width: 0; }
.t7b1-msg-palabra { font: 600 14px/1.35 "Inter", sans-serif; }
.t7b1-msg-error .t7b1-msg-palabra { color: ${P.error}; }
.t7b1-msg p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
/* P3: cada línea de la lista, con sus dos lados */
.t7b1-lineas { display: grid; gap: 10px; }
.t7b1-la { display: grid; gap: 8px; min-width: 0; border: 1px solid ${P.borde}; border-radius: 10px; padding: 12px; }
.t7b1-la-mala { border-color: ${P.error}; }
.t7b1-la-texto { margin: 0; font-size: 15px; line-height: 1.45; overflow-wrap: anywhere; }
.t7b1-g2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.t7b1-lado { position: relative; appearance: none; min-height: 44px; min-width: 0; padding: 0 8px; border: 1px dashed ${P.borde}; border-radius: 8px; background: transparent; font: 600 15px/1 "Inter", sans-serif; cursor: pointer; transition: background-color .12s, border-color .12s, box-shadow .12s; }
.t7b1-lado-debe { color: ${P.debe}; }
.t7b1-lado-haber { color: ${P.haber}; }
.t7b1-lado[aria-pressed="true"] { border-style: solid; color: ${P.fondo}; }
.t7b1-lado-debe[aria-pressed="true"] { background: ${P.debe}; border-color: ${P.debe}; }
.t7b1-lado-haber[aria-pressed="true"] { background: ${P.haber}; border-color: ${P.haber}; }
.t7b1-lado-error[aria-pressed="true"] { box-shadow: 0 0 0 2px ${P.fondo}, 0 0 0 4px ${P.error}; }
.t7b1-lado[aria-disabled="true"] { cursor: default; }
.t7b1-marca { position: absolute; top: -9px; left: -9px; width: 18px; height: 18px; border-radius: 50%; background: ${P.fondo}; border: 1px solid ${P.error}; display: grid; place-items: center; line-height: 0; color: ${P.error}; }
@media (prefers-reduced-motion: reduce) { .t7b1 *, .t7b1 *::before, .t7b1 *::after { transition: none !important; animation: none !important; } }
`;

const nombreLado = (lado) => (lado === DEBE ? INTERFAZ.debe : INTERFAZ.haber);

function Pie({ texto }) { return <p className="t7b1-pie" data-pie>{texto}</p>; }

function Boton({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t7b1-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

function Mensaje({ ok, textos, refFoco }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t7b1-msg ${ok ? "t7b1-msg-ok" : "t7b1-msg-error"}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={P.texto} aria-hidden="true" /> : <X size={16} color={P.error} aria-hidden="true" />}
      <div className="t7b1-msg-cuerpo">
        <span className="t7b1-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        {textos.map((t) => <p key={t} data-texto>{t}</p>)}
      </div>
    </div>
  );
}

/* ═══════════ ELECCIÓN (P5) ═══════════ */

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
    <div className="t7b1" data-eleccion={pantalla.id} data-estado={estado}>
      {pantalla.parrafos.map((t) => <p key={t} className="t7b1-p" data-texto>{t}</p>)}
      <p className="t7b1-p t7b1-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t7b1-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button key={o.id} type="button" className={`t7b1-op${estado === "error" && esta ? " t7b1-op-error" : ""}`} data-opcion={o.id} aria-pressed={esta} disabled={Boolean(confirmada)} onClick={() => setElegida(o.id)}>
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

/* ═══════════ LADOS: LA LISTA DEL LIBRO (P3) ═══════════ */

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
    <div className="t7b1" data-lados={pantalla.id} data-estado={estado}>
      <p className="t7b1-p" data-texto data-consigna>{pantalla.consigna}</p>
      <div className="t7b1-lineas" role="group" aria-label={pantalla.consigna}>
        {orden.map((l) => {
          const lado = puesto[l.id];
          const mala = malas.includes(l.id);
          const boton = (cual) => {
            const esta = lado === cual;
            const error = esta && mala;
            return (
              <button
                type="button"
                className={`t7b1-lado t7b1-lado-${cual}${error ? " t7b1-lado-error" : ""}`}
                data-linea={l.id}
                data-lado={cual}
                aria-pressed={esta}
                aria-disabled={estado !== "colocando" || cerrada(l) ? "true" : undefined}
                aria-label={`${l.texto} ${nombreLado(cual)}${error ? ", incorrecto" : ""}`}
                onClick={() => tocar(l, cual)}
              >
                {error && <span className="t7b1-marca" data-marca><X size={12} aria-hidden="true" /></span>}
                {nombreLado(cual)}
              </button>
            );
          };
          return (
            <div key={l.id} className={`t7b1-la${mala ? " t7b1-la-mala" : ""}`} data-fila={l.id}>
              <p className="t7b1-la-texto" data-texto data-linea-texto>{l.texto}</p>
              <span className="t7b1-g2">{boton(DEBE)}{boton(HABER)}</span>
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

export default function LaCuentaQueSiSeMueve({ pieza = PIEZA_LA_CUENTA_QUE_SI_SE_MUEVE, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_T7B1}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        {p.tipo === "eleccion" && <Eleccion key={p.id} pantalla={p} onSeguir={seguir} />}
        {p.tipo === "lados" && <Lados key={p.id} pantalla={p} onSeguir={seguir} />}
        {(p.tipo === "portada" || p.tipo === "lectura" || p.tipo === "resumen") && (
          <div className="t7b1">
            {p.objetivo && <p className="t7b1-p" data-texto data-objetivo>{p.objetivo}</p>}
            {p.parrafos?.map((t) => <p key={t} className="t7b1-p" data-texto>{t}</p>)}
            {p.lista && (
              <ol className="t7b1-lista" data-lista>
                {p.lista.map((t) => <li key={t} data-texto>{t}</li>)}
              </ol>
            )}
            {p.siguiente && <p className="t7b1-nota" data-texto data-siguiente>{p.siguiente}</p>}
            {p.boton && <Boton nombre={p.tipo === "portada" ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <Pie texto={p.pie} />
          </div>
        )}
      </div>
    </Panel>
  );
}
