import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Check, X } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import { APRENDER, HACER, SUBJECTS, clasificacionDe, actividadesDeTipo } from "../data/subjects.js";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { conIcono } from "../data/contabilidadIconos.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { useRecompensa } from "./shared/RecompensaCierre.jsx";
import { ContextoResumen, useResumenDePartida } from "./shared/PantallaResumen.jsx";
import { MarcoLibros } from "./mecanicas/bloques/marcos.jsx";
import { bloqueDeDificultad } from "../hacer/bloques.js";
import JuegoConTutorial from "./mecanicas/libros/JuegoConTutorial.jsx";
import { Panel } from "./mecanicas/salaDeControl/marco.jsx";
import { barajar, barajarDistinto } from "../utils/barajar.js";
import { BOTON, INTERFAZ, DEBE, HABER, PIEZA_LA_CAJA, FIGURA_CAJON, ESTADOS_CAJON, SUS_SERVICIOS } from "../data/contabilidadT4.js";
import { PIEZA_EL_ACTIVO_CORRIENTE, FIGURA_RAYA, ESTADOS_RAYA } from "../data/contabilidadT4A0.js";
import { PIEZA_EL_FONDO_FIJO, FIGURA_SOBRE, ESTADOS_SOBRE_A2, ALT_SOBRE_A2 } from "../data/contabilidadT4A2.js";
import { PIEZA_EL_ARQUEO, FIGURA_SOBRE_A3, ESTADOS_SOBRE_A3, ALT_SOBRE_A3 } from "../data/contabilidadT4A3.js";
import {
  H1, DESTINOS_H1, BOTON_H1, CIERRE_H1, resumenH1, lectorErrorH1,
  sortearH1, evaluarH1, puntuarH1, nombreDeDestinoH1,
} from "../data/contabilidadT4H1.js";
import {
  H2, PIE_CASO_H2, PREGUNTA_H2, BOTON_H2, CIERRE_H2, resumenH2, lectorErrorH2,
  controlH2, sortearH2, opcionesEnOrden, evaluarH2, puntuarH2,
} from "../data/contabilidadT4H2.js";
import {
  H3, CUENTAS_H3, BOTON_H3, CIERRE_H3, CORRECTO as CORRECTO_H3, INCORRECTO as INCORRECTO_H3, MISMO_LADO, ROTULO_ASIENTO_H3, resumenH3,
  sortearH3, evaluarH3, puntuarH3, ESTA_LISTO, mismoLado,
} from "../data/contabilidadT4H3.js";
import { Opcion, Opciones, Pulsos, Cierre } from "./mecanicas/corazon/juego.jsx";
import { TEXTO_CIERRE } from "./mecanicas/bloques/marcos.jsx";
import { Responder, useTanda, AsientoEnLineas } from "./mecanicas/libros/piezas.jsx";
import ConstructorAsiento, { filaVacia } from "./mecanicas/libros/ConstructorAsiento.jsx";
import { SOLO_LECTOR } from "./mecanicas/libros/verbos.jsx";
import { Encabezado } from "./mecanicas/libros/tema1/encabezado.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 DE CONTABILIDAD — «Efectivo, caja menor y bancos» (Célula D).
 *
 * La cabecera, las dos mitades y el camino, con la misma forma que T7-3. El
 * camino sale de `subjects.js` y JUEGOS_T4 dice qué componente pinta cada
 * id. Al terminar una partida, la vista registra con el motor compartido
 * (registrarActividadCompletada → otorgarFP), sin tocarlo.
 *
 * Las piezas de Aprender se pintan con PantallasT4, que vive aquí y no en una
 * carpeta de mecánicas: es el carril de la Célula D y nadie más lo usa.
 *
 * EL ORDEN DE PIEZAS_T4 LO DA `numero`, no la posición en la lista: A0 «El
 * activo corriente» = 0, A1 «La caja» = 1, A2 «El fondo fijo» = 2… La
 * prueba t4-andamio lo afirma.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
export const TEMA_T4 = "efectivo-caja-menor-bancos";

/* En el orden del número de pieza. El rótulo «Pieza n de N» cuenta las publicadas. */
export const PIEZAS_T4 = [
  { numero: PIEZA_EL_ACTIVO_CORRIENTE.numero, pieza: PIEZA_EL_ACTIVO_CORRIENTE, Pieza: PantallasT4 },
  { numero: PIEZA_LA_CAJA.numero, pieza: PIEZA_LA_CAJA, Pieza: PantallasT4 },
  { numero: PIEZA_EL_FONDO_FIJO.numero, pieza: PIEZA_EL_FONDO_FIJO, Pieza: PantallasT4 },
  { numero: PIEZA_EL_ARQUEO.numero, pieza: PIEZA_EL_ARQUEO, Pieza: PantallasT4 },
].sort((a, b) => a.numero - b.numero);

/* Lo que se puede abrir desde el camino. Una prueba lo compara con el catálogo. */
export const JUEGOS_T4 = [
  { id: H1.id, Mecanica: EntraOSaleDeCaja, titulo: H1.nombre },
  { id: H2.id, Mecanica: ElControlQueSeSaltaron, titulo: H2.nombre },
  { id: H3.id, Mecanica: SeMueveLaCajaMenor, titulo: H3.nombre },
];

/* El rótulo del bloque sale de la dificultad del catálogo, como en el Tema 3. */
const rotuloDeBloque = (actividadId) => {
  const b = bloqueDeDificultad(clasificacionDe(MATERIA, TEMA_T4, actividadId)?.dificultad);
  return b ? b.nombre.toUpperCase() : null;
};

export default function ContabilidadT4View({ modo = null, nodoInicial = null, onBack }) {
  const esAprender = modo !== HACER;
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA_T4);
  const rotulo = `${tema.title.toUpperCase()} · APRENDER`;
  const [nodoAbierto, setNodoAbierto] = useState(nodoInicial ?? null);
  const hechas = useCompletadas();
  const { pedirCuenta, usuario } = useAuth();
  const [recompensa, celebrar, celebrando] = useRecompensa();
  const resumen = useResumenDePartida(MATERIA, celebrando);
  const nodos = conIcono(nodosDe(actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente), hechas));
  const juego = esAprender ? null : JUEGOS_T4.find((j) => j.id === nodoAbierto);

  const completar = async (actividadId, porcentaje, duracionMs, detalle = null) => {
    const clas = clasificacionDe(MATERIA, TEMA_T4, actividadId);
    celebrar(clas?.dificultad, actividadId);
    const res = await resumen.registrar({ actividadId, clasificacion: clas, pct: porcentaje, detalle }, () =>
      registrarActividadCompletada(clas, {
        materiaId: MATERIA, temaId: TEMA_T4, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,
      }));
    if (res?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  return (
    <FondoMateria materiaId={MATERIA}>
      <div style={{
        minHeight: "100vh", backgroundColor: "transparent", fontFamily: "Inter, sans-serif", color: FAE.text,
        backgroundImage: "radial-gradient(circle at 50% -10%, rgba(233,196,106,0.12), transparent 55%)",
      }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) clamp(16px, 2vw, 24px) 56px" }}>
          <div className="fae-cabecera-titulo" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
            <span className="fae-cabecera-marca"><Logo variant="symbol" size={26} theme="dark" /></span>
            <span aria-hidden="true" className="fae-cabecera-marca" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
            <button
              type="button"
              onClick={onBack}
              aria-label="Volver a Contabilidad"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", padding: "8px",
                borderRadius: "999px", background: "rgba(248,249,250,0.06)",
                border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
              }}
            >
              <ChevronLeft size={20} color={FAE.text} />
            </button>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2 }}>
              {tema.title}
            </h1>
          </div>

          {recompensa}
          <div className="fae-insignia-actividad"><ActivityBadge tipo={esAprender ? APRENDER : HACER} size="sm" /></div>

          {esAprender ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {PIEZAS_T4.map(({ pieza, Pieza }, k) => (
                <div key={pieza.id}>
                  <p style={{ fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 10px" }}>
                    PIEZA {k + 1} DE {PIEZAS_T4.length}
                  </p>
                  <Pieza pieza={pieza} rotulo={rotulo} />
                </div>
              ))}
            </div>
          ) : juego ? (
            <div>
              <button
                type="button"
                onClick={() => { resumen.limpiar(); setNodoAbierto(null); }}
                style={{
                  marginBottom: "16px", padding: "8px 14px", borderRadius: "999px",
                  background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.14)",
                  color: FAE.text, cursor: "pointer", fontFamily: "Sora, sans-serif", fontSize: "12.5px",
                }}
              >
                ‹ Volver al camino
              </button>
              <ContextoResumen.Provider value={resumen.contexto(juego.id, () => setNodoAbierto(null))}>
                <JuegoConTutorial
                  key={juego.id}
                  juego={juego}
                  usuarioId={usuario?.id ?? null}
                  Marco={MarcoLibros}
                  acento={FAE.ambar}
                  rotulo={rotuloDeBloque(juego.id)}
                  onCompletar={(pct, ms, detalle) => completar(juego.id, pct, ms, detalle)}
                />
              </ContextoResumen.Provider>
            </div>
          ) : (
            <CaminoHacer nodos={nodos} onAbrir={(id) => setNodoAbierto(id)} vacio="Este tema todavía no tiene juegos." />
          )}
        </div>
      </div>
    </FondoMateria>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LAS PANTALLAS DE APRENDER.
 *
 * La forma de PantallasT7_3, sin lo que T4 no usa (fichas, cuentas T y las
 * figuras de Watari): una pantalla a la vez; portada, lectura y resumen con
 * su botón y su pie; elección con opciones barajadas en cada intento,
 * «Confirmar», y «Incorrecto.» con «Probar otra» o «Correcto.» con «Seguir».
 *
 * Lo que traen los paquetes de T4:
 *   · `listaNumerada`: los siete controles y el resumen van numerados, como
 *     en el paquete
 *   · `trasAcertar`: lo que se muestra solo con el acierto, debajo del
 *     mensaje: sus textos y sus asientos (el asiento 2 de la p. 180 en A1 v5;
 *     en A2 v2, la línea del libro de P5 y el asiento del reembolso de P7)
 *   · `tabla`: una lista de dos columnas con su total sumado (los gastos de
 *     mayo de A2)
 *   · un asiento con `fecha` la pone en su cabecera (A2: «1 de mayo», «31 de
 *     mayo»); uno con `signo` es un asiento modelo sin cifras, y su lado lleva
 *     el signo («xxxx», Hanayama A2 v1 §4) con su texto para el lector
 *
 * Las figuras de Hanayama: una pantalla que traiga `figura` la pinta entre sus
 * textos y su asiento (texto → figura → asiento → botón → pie). En una
 * elección, la figura sigue el estado de la pregunta y no dibuja la respuesta
 * mientras se pregunta. NO CALIFICA y no da FP: es Aprender. Clases `t4p-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const COLOR = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", debe: "#2A9D8F", haber: "#E9C46A", error: "#E76F51" };

/* Las cifras con el formato del libro: miles con punto. */
export const cifra = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const CSS_T4P = `
.t4p { display: grid; gap: 12px; min-width: 0; color: ${COLOR.texto}; font-family: "Inter", sans-serif; font-size: 15px; line-height: 1.4; }
.t4p * { box-sizing: border-box; }
.t4p-p { margin: 0; font-size: 15px; line-height: 1.5; overflow-wrap: anywhere; }
.t4p-nota { margin: 0; font-size: 14px; line-height: 1.45; color: ${COLOR.texto2}; overflow-wrap: anywhere; }
.t4p-preg { font: 600 15px/1.45 "Sora", "Inter", sans-serif; }
.t4p-pie { margin: 4px 0 0; font-size: 12px; line-height: 1.4; color: ${COLOR.texto2}; overflow-wrap: anywhere; }
.t4p-btn { appearance: none; min-height: 44px; width: 100%; border-radius: 8px; border: 1px solid ${COLOR.texto}; background: ${COLOR.texto}; color: ${COLOR.fondo}; font: 600 15px "Inter", sans-serif; cursor: pointer; }
.t4p-btn[aria-disabled="true"] { background: transparent; color: ${COLOR.texto2}; border-color: ${COLOR.texto2}; cursor: default; }
.t4p-btn:focus-visible, .t4p-op:focus-visible { outline: 2px solid ${COLOR.texto}; outline-offset: 2px; }
.t4p-ops { display: grid; gap: 8px; }
.t4p-op { appearance: none; text-align: left; min-height: 44px; padding: 10px 14px; border: 1px solid ${COLOR.borde}; border-radius: 12px; background: transparent; color: ${COLOR.texto}; font: 400 15px/1.35 "Inter", sans-serif; cursor: pointer; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.t4p-op[aria-pressed="true"] { background: ${COLOR.texto}; color: ${COLOR.fondo}; border-color: ${COLOR.texto}; }
.t4p-op:disabled { cursor: default; }
.t4p-op-error { border-color: ${COLOR.error}; box-shadow: inset 0 0 0 1px ${COLOR.error}; }
.t4p-msg { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 8px; align-items: start; padding: 10px 12px; border-radius: 8px; border: 1px solid; outline: none; }
.t4p-msg-error { border-color: ${COLOR.error}; }
.t4p-msg-ok { border-color: ${COLOR.borde}; }
.t4p-msg svg { margin-top: 2px; }
.t4p-msg-cuerpo { display: grid; gap: 6px; min-width: 0; }
.t4p-msg-palabra { font: 600 14px/1.35 "Inter", sans-serif; }
.t4p-msg-error .t4p-msg-palabra { color: ${COLOR.error}; }
.t4p-msg p { margin: 0; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
.t4p-as { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; border: 1px solid ${COLOR.borde}; border-radius: 10px; padding: 12px; }
.t4p-g2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.t4p-as-h { display: grid; gap: 6px; padding-bottom: 6px; font: 600 13px "Sora", "Inter", sans-serif; }
.t4p-as-h .t4p-g2 > span { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; text-align: right; padding-inline: 9px; }
.t4p-d { color: ${COLOR.debe}; } .t4p-hb { color: ${COLOR.haber}; }
.t4p-as-r { display: grid; gap: 4px; padding-block: 8px; border-top: 1px solid ${COLOR.borde}; }
.t4p-as-r > span:first-child { font-size: 14px; overflow-wrap: anywhere; min-width: 0; }
.t4p-as-r .t4p-g2 > span { text-align: right; padding-inline: 9px; font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; min-width: 0; }
.t4p-sangria { padding-left: 24px; }
.t4p-lista { margin: 0; padding-left: 26px; display: grid; gap: 6px; font-size: 15px; line-height: 1.45; }
/* La hoja global del sitio quita el estilo de lista: aquí vuelven los números. */
.t4p-lista li { overflow-wrap: anywhere; list-style: decimal; }
.t4p-nueva { animation: t4p-aparece .12s ease-out; }
@keyframes t4p-aparece { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .t4p *, .t4p *::before, .t4p *::after { transition: none !important; animation: none !important; } }
`;

/* Una pantalla sin pie (el paquete de A0 deja una así) no pinta el párrafo vacío. */
function PieT4({ texto }) { return texto ? <p className="t4p-pie" data-pie>{texto}</p> : null; }

function BotonT4({ nombre, texto, onClick, inactivo = false }) {
  return (
    <button type="button" className="t4p-btn" data-boton={nombre} aria-disabled={inactivo ? "true" : undefined} onClick={inactivo ? undefined : onClick}>
      {texto}
    </button>
  );
}

function MensajeT4({ ok, texto, refFoco }) {
  return (
    <div ref={refFoco} tabIndex={-1} role="status" className={`t4p-msg ${ok ? "t4p-msg-ok" : "t4p-msg-error"}`} data-mensaje={ok ? "acierto" : "error"}>
      {ok ? <Check size={16} color={COLOR.texto} aria-hidden="true" /> : <X size={16} color={COLOR.error} aria-hidden="true" />}
      <div className="t4p-msg-cuerpo">
        <span className="t4p-msg-palabra" data-palabra>{ok ? INTERFAZ.correcto : INTERFAZ.incorrecto}</span>
        <p data-texto data-devolucion>{texto}</p>
      </div>
    </div>
  );
}

const TextosT4 = ({ lista, nueva = false }) => (lista ?? []).map((t) => <p key={t} className={`t4p-p${nueva ? " t4p-nueva" : ""}`} data-texto>{t}</p>);

/*
 * Un asiento en lectura. Sin `fecha` no la muestra (en A1 el libro pone
 * «xxxx»); con ella, va en la cabecera. Con `signo`, es un asiento modelo: el
 * lado de cada cuenta lleva el signo y no una cifra.
 */
export function AsientoT4({ asiento, nuevo = false }) {
  const celda = (l, lado) => {
    if (l.lado !== lado) return <span role="cell" />;
    if (asiento.signo) {
      return (
        <span role="cell" data-signo={lado}>
          <span className="t4p-signo" aria-hidden="true">{asiento.signo.visible}</span>
          <span className="t4f-sr">{asiento.signo.lector}</span>
        </span>
      );
    }
    return <span role="cell" data-cifra={cifra(l.monto)}>{cifra(l.monto)}</span>;
  };
  return (
    <div className={`t4p-as${nuevo ? " t4p-nueva" : ""}`} role="table" aria-label={asiento.nombre} data-asiento={asiento.nombre}>
      <div className="t4p-as-h" role="row">
        {asiento.fecha && <span role="columnheader" data-fecha>{asiento.fecha}</span>}
        <span className="t4p-g2">
          <span className="t4p-d" role="columnheader">{INTERFAZ.debe}</span>
          <span className="t4p-hb" role="columnheader">{INTERFAZ.haber}</span>
        </span>
      </div>
      {asiento.lineas.map((l) => (
        <div key={l.cuenta} className="t4p-as-r" role="row" data-linea={l.cuenta} data-lado={l.lado}>
          <span role="rowheader" className={l.lado === DEBE ? undefined : "t4p-sangria"}>{l.cuenta}</span>
          <span className="t4p-g2">
            {celda(l, DEBE)}
            {celda(l, HABER)}
          </span>
        </div>
      ))}
    </div>
  );
}

const AsientosT4 = ({ lista, nuevo = false }) => (lista ?? []).map((a) => <AsientoT4 key={a.nombre} asiento={a} nuevo={nuevo} />);

/* Una tabla de dos columnas del paquete, con su total: lo calcula la suma, no se transcribe. */
export function TablaT4({ tabla }) {
  const total = tabla.filas.reduce((x, f) => x + f.monto, 0);
  return (
    <div className="t4p-tb" role="table" aria-label={tabla.nombre} data-tabla={tabla.nombre}>
      <div className="t4p-tb-r t4p-tb-h" role="row">
        {tabla.columnas.map((c) => <span key={c} role="columnheader">{c}</span>)}
      </div>
      {tabla.filas.map((f) => (
        <div key={f.texto} className="t4p-tb-r" role="row" data-fila-tabla={f.texto}>
          <span role="rowheader">{f.texto}</span>
          <span role="cell" data-cifra={cifra(f.monto)}>{cifra(f.monto)}</span>
        </div>
      ))}
      <div className="t4p-tb-r t4p-tb-total" role="row" data-total>
        <span role="rowheader">{tabla.total}</span>
        <span role="cell" data-cifra={cifra(total)}>{cifra(total)}</span>
      </div>
    </div>
  );
}

function CuerpoT4({ p, estadoFigura = null }) {
  return (
    <>
      {p.objetivo && <p className="t4p-p" data-texto data-objetivo>{p.objetivo}</p>}
      <TextosT4 lista={p.parrafos} />
      {p.listaNumerada && <ol className="t4p-lista" data-lista>{p.listaNumerada.map((t) => <li key={t} data-texto>{t}</li>)}</ol>}
      <TextosT4 lista={p.despues} />
      {p.tabla && <TablaT4 tabla={p.tabla} />}
      {p.figura && <FiguraT4 tipo={p.figura.tipo} estado={estadoFigura ?? p.figura.estado} />}
      <AsientosT4 lista={p.asientos} />
      <TextosT4 lista={p.tras} />
    </>
  );
}

function EleccionT4({ pantalla, onSeguir }) {
  const [orden, setOrden] = useState(() => barajar(pantalla.opciones));
  const [elegida, setElegida] = useState(null);
  const [confirmada, setConfirmada] = useState(null);
  const ref = useRef(null);
  const opcion = confirmada ? pantalla.opciones.find((o) => o.id === confirmada) : null;
  const estado = !opcion ? "colocando" : opcion.correcta ? "acierto" : "error";
  useEffect(() => { if (estado !== "colocando") ref.current?.focus(); }, [estado]);
  const pie = estado === "colocando" ? pantalla.pie : estado === "error" ? pantalla.error.pie : pantalla.acierto.pie;
  const despues = pantalla.trasAcertar;
  /* La figura de una elección: por estado de la pregunta, y en el error, por la opción elegida. */
  const porEstado = pantalla.figura?.estados?.[estado];
  const estadoFigura = porEstado && typeof porEstado === "object" ? porEstado[opcion.id] : porEstado ?? null;

  return (
    <div className="t4p" data-eleccion={pantalla.id} data-estado={estado}>
      <CuerpoT4 p={pantalla} estadoFigura={estadoFigura} />
      <p className="t4p-p t4p-preg" data-texto data-pregunta>{pantalla.pregunta}</p>
      <div className="t4p-ops" role="group" aria-label={pantalla.pregunta}>
        {orden.map((o) => {
          const esta = o.id === (confirmada ?? elegida);
          return (
            <button key={o.id} type="button" className={`t4p-op${estado === "error" && esta ? " t4p-op-error" : ""}`} data-opcion={o.id} aria-pressed={esta} disabled={Boolean(confirmada)} onClick={() => setElegida(o.id)}>
              {o.texto}
            </button>
          );
        })}
      </div>
      {estado === "colocando" && <BotonT4 nombre="confirmar" texto={BOTON.confirmar} inactivo={!elegida} onClick={() => setConfirmada(elegida)} />}
      {estado !== "colocando" && <MensajeT4 ok={estado === "acierto"} texto={estado === "acierto" ? pantalla.acierto.texto : opcion.devolucion} refFoco={ref} />}
      {estado === "acierto" && despues && <TextosT4 lista={despues.textos} nueva />}
      {estado === "acierto" && despues && <AsientosT4 lista={despues.asientos} nuevo />}
      {estado === "error" && (
        <BotonT4 nombre="probar-otra" texto={BOTON.probarOtra} onClick={() => { setOrden((x) => barajarDistinto(pantalla.opciones, x, (o) => o.id)); setElegida(null); setConfirmada(null); }} />
      )}
      {estado === "acierto" && onSeguir && <BotonT4 nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />}
      <PieT4 texto={pie} />
    </div>
  );
}

export function PantallasT4({ pieza, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const ultima = k === pieza.pantallas.length - 1;
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_T4P + CSS_T4F + CSS_T4S}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        {p.tipo === "eleccion" ? (
          <EleccionT4 key={p.id} pantalla={p} onSeguir={ultima ? null : seguir} />
        ) : (
          <div className="t4p">
            <CuerpoT4 p={p} />
            {p.siguiente && <p className="t4p-nota" data-texto data-siguiente>{p.siguiente}</p>}
            {p.boton && !ultima && <BotonT4 nombre={p.tipo === "portada" ? "empezar" : "seguir"} texto={p.boton} onClick={seguir} />}
            <PieT4 texto={p.pie} />
          </div>
        )}
      </div>
    </Panel>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LAS FIGURAS DE HANAYAMA.
 *
 * Construidas desde la especificación, no desde los prototipos: la versión
 * más alta de cada una (celula-d/hanayama-a1-figura-v1.md con su v1.1 y su
 * v1.2, y hanayama-a0-figura-v1.md con su v1.1). Viven aquí, en el
 * carril de la Célula D: no son componentes compartidos.
 *
 *   · «El cajón de paso» (A1): el dinero entra a Caja por el Debe y sale por
 *     el Haber hacia Bancos o hacia un pago en efectivo
 *   · «La raya del año» (A0): cada activo cae arriba (corriente) o abajo (no
 *     corriente) de una sola raya. El eje del tiempo va solo de «hoy» a la
 *     raya: abajo no hay «después», hay «no cumple la prueba»
 *   · «El sobre y el libro» (A2, y después A3 y H4): lo que tiene Rosa en el
 *     sobre de la caja menor frente a lo que dice el libro. Más abajo, con su
 *     propia hoja (CSS_T4S, clases `t4sb-`)
 *
 * Cada figura es una función de su estado. Solo cambia el color de lo
 * señalado, y lo que aparece lo hace con un fundido de 120 ms; con movimiento
 * reducido, nada se mueve. Ni coral, ni círculos, ni trazos discontinuos. Las
 * cifras van sin «$» y sin partirse. El texto alternativo va en un
 * figcaption oculto, enlazado con aria-describedby. Clases `t4cj-` y `t4ry-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const BOCA = 40;

export const CSS_T4F = `
.t4f-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.t4f-nueva { animation: t4f-aparece .12s ease-out; }
@keyframes t4f-aparece { from { opacity: 0; } to { opacity: 1; } }
/* cajón de paso */
.t4cj { position: relative; margin: 0; display: grid; min-width: 0; color: ${COLOR.texto}; font-family: "Inter", sans-serif; }
.t4cj * { box-sizing: border-box; }
.t4cj-origen { display: grid; gap: 2px; border: 1px solid ${COLOR.borde}; border-radius: 8px; padding: 8px 12px; }
.t4cj-rot { font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${COLOR.texto2}; overflow-wrap: anywhere; }
.t4cj-lin { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 2px 10px; }
.t4cj-hecho { font-size: 13px; line-height: 1.35; white-space: nowrap; }
.t4cj-monto { margin-left: auto; font: 500 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${COLOR.texto2}; }
.t4cj-monto.t4cj-foco { color: ${COLOR.texto}; font-weight: 600; }
.t4cj-tubo { position: relative; height: 16px; }
.t4cj-v { position: absolute; width: 2px; background: ${COLOR.borde}; }
.t4cj-h { position: absolute; height: 2px; background: ${COLOR.borde}; }
.t4cj-vivo { background: ${COLOR.texto}; }
.t4cj-cajon { position: relative; padding: 10px 12px; border-left: 1px solid ${COLOR.borde}; border-right: 1px solid ${COLOR.borde}; border-radius: 12px; display: grid; gap: 8px; }
.t4cj-borde { position: absolute; left: -1px; right: -1px; height: 12px; display: flex; justify-content: space-between; pointer-events: none; }
.t4cj-borde > span { border-color: ${COLOR.borde}; border-style: solid; border-width: 0; }
.t4cj-nombre { margin: 0; text-align: center; font: 600 13px/1.3 "Sora", "Inter", sans-serif; }
.t4cj-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; }
.t4cj-col { display: grid; gap: 6px; align-content: start; min-width: 0; }
.t4cj-col-h { justify-items: end; text-align: right; }
.t4cj-lado { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; }
.t4cj-glosa { display: grid; font-size: 12px; line-height: 1.35; color: ${COLOR.texto2}; min-width: 0; }
.t4cj-glosa > span { white-space: nowrap; }
.t4cj-mcol { min-height: 18px; display: flex; }
.t4cj-col-h .t4cj-mcol { justify-content: flex-end; }
.t4cj-rama { position: relative; height: 24px; }
.t4cj-dest { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; }
.t4cj-caja2 { display: grid; gap: 4px; align-content: start; min-width: 0; border: 1px solid ${COLOR.borde}; border-radius: 8px; padding: 8px 10px; min-height: 76px; }
.t4cj-caja2-n { font: 600 13px/1.3 "Sora", "Inter", sans-serif; overflow-wrap: anywhere; }
.t4cj-caja2-n > span { white-space: nowrap; }
.t4cj-caja2 .t4cj-monto { margin-left: 0; justify-self: end; }
.t4cj-d { color: ${COLOR.debe}; } .t4cj-hb { color: ${COLOR.haber}; }
/* raya del año */
.t4ry { position: relative; margin: 0; display: grid; min-width: 0; color: ${COLOR.texto}; font-family: "Inter", sans-serif; }
.t4ry * { box-sizing: border-box; }
.t4ry-esc { display: grid; grid-template-columns: 44px 2px minmax(0, 1fr); }
.t4ry-mar { font: 600 13px/1.2 "Sora", "Inter", sans-serif; color: ${COLOR.texto2}; text-align: right; padding-right: 8px; white-space: nowrap; }
.t4ry-eje { background: ${COLOR.borde}; }
.t4ry-zona { display: grid; gap: 6px; align-content: start; padding: 10px 0 12px; min-width: 0; margin: 0; list-style: none; }
.t4ry-zrot { display: grid; padding: 0 0 2px 12px; font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${COLOR.texto2}; }
.t4ry-zrot > span { white-space: nowrap; }
.t4ry-zrot > span:first-child { font-weight: 600; color: ${COLOR.texto}; letter-spacing: 0; }
.t4ry-item { display: grid; grid-template-columns: 12px minmax(0, 1fr); align-items: center; min-width: 0; list-style: none; }
.t4ry-tick { height: 2px; background: ${COLOR.borde}; }
.t4ry-tarj { display: grid; border: 1px solid ${COLOR.borde}; border-radius: 8px; padding: 5px 10px; font-size: 13px; line-height: 1.35; color: ${COLOR.texto2}; min-width: 0; }
.t4ry-tarj > span { white-space: nowrap; }
.t4ry-tarj > span + span { font-size: 12px; }
.t4ry-foco .t4ry-tarj { color: ${COLOR.texto}; border-color: ${COLOR.texto}; }
.t4ry-foco .t4ry-tarj > span:first-child { font-weight: 600; }
.t4ry-foco .t4ry-tick { background: ${COLOR.texto}; }
.t4ry-raya { display: grid; grid-template-columns: 44px minmax(0, 1fr); align-items: center; }
.t4ry-raya .t4ry-mar { color: ${COLOR.texto}; }
.t4ry-raya > span:last-child { height: 2px; background: ${COLOR.texto}; }
@media (prefers-reduced-motion: reduce) { .t4cj *, .t4ry *, .t4f-nueva { transition: none !important; animation: none !important; } }
`;

/*
 * Los sobres de cada pieza: el mismo dibujo, con los estados y el texto
 * alternativo de la pieza que lo usa. A3 añade el suyo aquí.
 */
const SOBRES = {
  "sobre-a2": { estados: ESTADOS_SOBRE_A2, alt: ALT_SOBRE_A2, F: FIGURA_SOBRE },
  "sobre-a3": { estados: ESTADOS_SOBRE_A3, alt: ALT_SOBRE_A3, F: FIGURA_SOBRE_A3 },
};

function FiguraT4({ tipo, estado }) {
  if (tipo === "cajon") return <CajonDePaso estado={estado} />;
  if (tipo === "raya") return <RayaDelAno estado={estado} />;
  const sobre = SOBRES[tipo];
  return <SobreCajaMenor estado={estado} s={sobre.estados[estado]} alt={sobre.alt[estado]} F={sobre.F} />;
}

/* El borde de arriba o de abajo del cajón, con su boca de 40 px en el 25 % (arriba) o el 75 % (abajo). */
function BordeCajon({ arriba }) {
  const centro = arriba ? "25%" : "75%";
  const lado = arriba ? "borderTopWidth" : "borderBottomWidth";
  return (
    <span className="t4cj-borde" aria-hidden="true" style={arriba ? { top: 0 } : { bottom: 0 }}>
      <span style={{ width: `calc(${centro} - ${BOCA / 2}px)`, [lado]: "1px", borderLeftWidth: "1px", borderRadius: arriba ? "12px 0 0 0" : "0 0 0 12px" }} />
      <span style={{ width: `calc(100% - ${centro} - ${BOCA / 2}px)`, [lado]: "1px", borderRightWidth: "1px", borderRadius: arriba ? "0 12px 0 0" : "0 0 12px 0" }} />
    </span>
  );
}

export function CajonDePaso({ estado }) {
  const s = ESTADOS_CAJON[estado];
  const F = FIGURA_CAJON;
  const monto = cifra(SUS_SERVICIOS);
  const foco = (k) => (s.foco.includes(k) ? " t4cj-foco" : "");
  const vivo = (k) => (s.vivo.includes(k) ? " t4cj-vivo" : "");
  /* Lo que aparece, aparece con fundido; la key por estado lo vuelve a montar al cambiar. */
  const Monto = ({ k }) => <span key={`${estado}-${k}`} className={`t4cj-monto t4f-nueva${foco(k)}`} data-monto={k}>{monto}</span>;
  const idAlt = `t4cj-alt-${estado}`;
  return (
    <figure className="t4cj t4f-nueva" data-figura="cajon" data-estado={estado} aria-describedby={idAlt}>
      {s.origen && (
        <div className="t4cj-origen t4f-nueva" data-origen>
          <span className="t4cj-rot">{F.rotuloOrigen}</span>
          <span className="t4cj-lin">
            <span className="t4cj-hecho">{F.hecho}</span>
            <Monto k="origen" />
          </span>
        </div>
      )}
      <div className="t4cj-tubo" aria-hidden="true"><span className={`t4cj-v${vivo("entrada")}`} data-trazo="entrada" style={{ left: "calc(25% - 1px)", top: 0, bottom: 0 }} /></div>
      <div className="t4cj-cajon">
        <BordeCajon arriba />
        <BordeCajon />
        <p className="t4cj-nombre">{F.cuenta}</p>
        <div className="t4cj-cols">
          <div className="t4cj-col" data-columna={DEBE}>
            <span className="t4cj-lado t4cj-d">{INTERFAZ.debe}</span>
            <span className="t4cj-glosa">{F.glosaDebe.map((t) => <span key={t}>{t}</span>)}</span>
            <span className="t4cj-mcol">{s.debe && <Monto k="debe" />}</span>
          </div>
          <div className="t4cj-col t4cj-col-h" data-columna={HABER}>
            <span className="t4cj-lado t4cj-hb">{INTERFAZ.haber}</span>
            <span className="t4cj-glosa">{F.glosaHaber.map((t) => <span key={t}>{t}</span>)}</span>
            <span className="t4cj-mcol">{s.haber && <Monto k="haber" />}</span>
          </div>
        </div>
      </div>
      <div className="t4cj-rama" aria-hidden="true">
        <span className={`t4cj-v${vivo("salida")}`} data-trazo="salida" style={{ left: "calc(75% - 1px)", top: 0, height: "13px" }} />
        <span className={`t4cj-h${vivo("bancos")}`} data-trazo="cruce" style={{ left: "calc(25% - 1px)", width: "calc(50% + 2px)", top: "11px" }} />
        <span className={`t4cj-v${vivo("bancos")}`} data-trazo="a-bancos" style={{ left: "calc(25% - 1px)", top: "11px", bottom: 0 }} />
        <span className="t4cj-v" data-trazo="a-pago" style={{ left: "calc(75% - 1px)", top: "11px", bottom: 0 }} />
      </div>
      <div className="t4cj-dest">
        <div className="t4cj-caja2" data-destino="bancos">
          <span className="t4cj-caja2-n">{F.destino}</span>
          {s.bancos && <Monto k="bancos" />}
        </div>
        <div className="t4cj-caja2" data-destino="pago">
          <span className="t4cj-caja2-n">{F.pago.map((t, k) => <span key={t}>{k ? " " : ""}{t}</span>)}</span>
        </div>
      </div>
      <figcaption id={idAlt} className="t4f-sr">{F.alt[estado]}</figcaption>
    </figure>
  );
}

/* El alto que reservan las dos zonas en los cuatro estados de P4 (Hanayama v1, §3): la raya no salta. */
const ALTO_P4 = { antes: "122.52px", despues: "174.25px" };

function ZonaRaya({ id, rotulo, s, conEje = true }) {
  return (
    <ul className="t4ry-zona" data-zona={id} aria-label={rotulo.join(" ")} style={{ minHeight: s.p4 ? ALTO_P4[id] : undefined }}>
      <li className="t4ry-zrot" aria-hidden="true">{rotulo.map((t) => <span key={t}>{t}</span>)}</li>
      {s[id].map((it) => (
        <li key={it.id} className={`t4ry-item t4f-nueva${s.foco.includes(it.id) ? " t4ry-foco" : ""}`} data-tarjeta={it.id} data-foco={s.foco.includes(it.id) ? "si" : undefined}>
          {conEje ? <span className="t4ry-tick" aria-hidden="true" /> : <span aria-hidden="true" />}
          <span className="t4ry-tarj"><span>{it.texto}</span>{it.glosa && <span>{it.glosa}</span>}</span>
        </li>
      ))}
    </ul>
  );
}

export function RayaDelAno({ estado }) {
  const s = ESTADOS_RAYA[estado];
  const F = FIGURA_RAYA;
  const idAlt = `t4ry-alt-${estado}`;
  return (
    <figure className="t4ry t4f-nueva" data-figura="raya" data-estado={estado} aria-describedby={idAlt}>
      <div className="t4ry-esc">
        <span className="t4ry-mar" style={{ paddingTop: "9px" }} aria-hidden="true">{F.hoy}</span>
        <span className="t4ry-eje" aria-hidden="true" />
        <ZonaRaya id="antes" rotulo={F.zonaSi} s={s} conEje />
      </div>
      <div className="t4ry-raya" data-raya aria-hidden="true"><span className="t4ry-mar">{F.unAno}</span><span /></div>
      {/*
        Hanayama v1.1, cambio 2: el eje del tiempo termina en la raya. Debajo
        no hay eje ni muescas: las tarjetas van en la misma columna, sueltas.
        La zona dice «no cumple la prueba», no «cuándo».
      */}
      <div className="t4ry-esc">
        <span />
        <span />
        <ZonaRaya id="despues" rotulo={F.zonaNo} s={s} conEje={false} />
      </div>
      <figcaption id={idAlt} className="t4f-sr">{F.alt[estado]}</figcaption>
    </figure>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · «EL SOBRE Y EL LIBRO» (Hanayama, A2 v1 con la v1.1 y la v1.2 encima).
 *
 * Arriba, lo que tiene Rosa: el sobre de la caja menor, con el cheque que
 * entra cuando lo hay. Abajo, lo que dice el libro: la cuenta Caja menor y,
 * en el reembolso, Gastos generales. La trampa de A2 se ve en las dos
 * superficies: el cheque vuelve a llenar el sobre y Caja menor sigue en el
 * mismo valor.
 *
 * ES UNA PIEZA REUTILIZABLE DE T4, no un componente compartido: A3 usa el
 * mismo sobre con el mismo significado (Yujiro; Hanayama A3 v1 §0). Recibe
 * el estado ya resuelto (`s`), su texto alternativo y sus rótulos (`F`), así
 * que cada pieza trae los suyos en sus datos. Lo que A3 añade entra como
 * datos, no como copia (Hanayama A3 v1 §2 y §6.1):
 *   · `diferencia`: la última fila del sobre, «Sobrante de caja menor»,
 *     «Faltante de caja menor»; la palabra dice cuál es, sin coral ni signo
 *   · `calculo`: la línea «efectivo + cheque = fondo» bajo el cheque
 *   · la tercera fila del libro, en dos renglones partidos en el guion
 *   · y los huecos que guardan su sitio sin decir nada: `sumanOculto`,
 *     `diferencia.oculta`, `chequeOculto` y el libro oculto de tres filas
 *
 *   · «sin contar» en una fila es un dato que todavía no se conoce: #A8B6C8
 *     500, nunca señalado (v1.2, FA2-1)
 *   · el cheque, en dos renglones fijos: «Cheque» con el monto, y «sale de
 *     Bancos» (v1.2, FA2-2), a todo el ancho; el tubo sale del centro
 *   · cuando el libro es la respuesta (`libro.oculto`), su sitio se reserva
 *     con la misma forma y SIN su contenido: cada renglón es un espacio duro.
 *     Mientras se pregunta, la respuesta no está en el DOM (PH8-2)
 *
 * Señalar es pasar de #A8B6C8 500 a #F8F9FA 600. Sin teal, ámbar ni coral,
 * sin «Debe»/«Haber», sin círculos, sin trazos discontinuos y sin «✓». Lo que
 * aparece lo hace con el fundido de 120 ms; con movimiento reducido, nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_T4S = `
/* tabla de dos columnas (A2, P4) */
.t4p-tb { display: grid; min-width: 0; border: 1px solid ${COLOR.borde}; border-radius: 10px; padding: 4px 12px; }
.t4p-tb-r { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 10px; align-items: baseline; padding-block: 7px; }
.t4p-tb-r + .t4p-tb-r { border-top: 1px solid ${COLOR.borde}; }
.t4p-tb-r > span:first-child { font-size: 14px; line-height: 1.35; overflow-wrap: anywhere; min-width: 0; }
.t4p-tb-r > span:last-child { text-align: right; font: 500 15px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; }
.t4p-tb-h > span, .t4p-tb-h > span:first-child, .t4p-tb-h > span:last-child { font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: ${COLOR.texto2}; }
.t4p-tb-total > span:first-child, .t4p-tb-total > span:last-child { font-weight: 600; }
/* el signo de un asiento modelo (A2, P8 y P9) */
.t4p-signo { color: ${COLOR.texto2}; }
/* sobre y libro */
.t4sb { position: relative; margin: 0; display: grid; gap: 8px; min-width: 0; color: ${COLOR.texto}; font-family: "Inter", sans-serif; }
.t4sb * { box-sizing: border-box; }
.t4sb-rot { display: block; font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${COLOR.texto2}; white-space: nowrap; }
.t4sb-zona { display: grid; gap: 6px; min-width: 0; }
.t4sb-paso { display: grid; min-width: 0; }
.t4sb-cheque { display: grid; gap: 2px; border: 1px solid ${COLOR.texto}; border-radius: 8px; padding: 6px 12px; min-width: 0; }
.t4sb-cheque-n { font: 600 13px/1.3 "Sora", "Inter", sans-serif; white-space: nowrap; }
.t4sb-cheque-m { margin-left: auto; font: 400 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${COLOR.texto}; }
.t4sb-cheque-s { font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${COLOR.texto2}; white-space: nowrap; }
.t4sb-tubo { width: 2px; height: 16px; margin: 0 auto; background: ${COLOR.texto}; }
.t4sb-sobre { position: relative; display: grid; gap: 6px; min-width: 0; border: 1px solid ${COLOR.borde}; border-top: 0; border-radius: 0 0 10px 10px; padding: 26px 12px 10px; }
.t4sb-solapa { position: absolute; top: 0; left: -1px; width: calc(100% + 2px); height: 18px; overflow: visible; }
.t4sb-solapa path { fill: none; stroke: ${COLOR.borde}; stroke-width: 1; vector-effect: non-scaling-stroke; }
.t4sb-lin { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 2px 10px; min-width: 0; }
.t4sb-nom { font: 400 13px/1.35 "Inter", sans-serif; color: ${COLOR.texto2}; white-space: nowrap; }
.t4sb-monto { margin-left: auto; font: 500 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${COLOR.texto2}; }
.t4sb-titulo .t4sb-nom { font: 600 13px/1.3 "Sora", "Inter", sans-serif; color: ${COLOR.texto}; }
.t4sb-titulo .t4sb-monto { color: ${COLOR.texto}; }
.t4sb-suman { border-top: 1px solid ${COLOR.borde}; padding-top: 6px; }
.t4sb-suman .t4sb-monto { color: ${COLOR.texto}; }
.t4sb-suman .t4sb-monto.t4sb-sin { color: ${COLOR.texto2}; }
.t4sb-libro { display: grid; min-width: 0; border: 1px solid ${COLOR.borde}; border-radius: 10px; }
.t4sb-cta { display: grid; gap: 2px; padding: 8px 12px; min-width: 0; }
.t4sb-cta + .t4sb-cta { border-top: 1px solid ${COLOR.borde}; }
.t4sb-cta-n { font: 600 13px/1.3 "Sora", "Inter", sans-serif; color: ${COLOR.texto}; white-space: nowrap; }
.t4sb-nota { font: 400 12px/1.3 "Inter", sans-serif; color: ${COLOR.texto2}; white-space: nowrap; }
.t4sb-oculto { visibility: hidden; }
.t4sb-dif .t4sb-nom { font: 600 13px/1.35 "Inter", sans-serif; color: ${COLOR.texto}; }
.t4sb-calc { margin: 6px 0 0; text-align: center; font: 400 14px/1.3 "Inter", sans-serif; font-variant-numeric: tabular-nums; color: ${COLOR.texto2}; white-space: nowrap; }
.t4sb-calc b { font-weight: 600; color: ${COLOR.texto}; }
.t4sb-cta2 { display: grid; gap: 2px; min-width: 0; }
.t4sb-cta2 > span:first-child { font: 600 13px/1.3 "Sora", "Inter", sans-serif; color: ${COLOR.texto}; white-space: nowrap; }
.t4sb-cta2 .t4sb-cta-n2 { font: 600 13px/1.3 "Sora", "Inter", sans-serif; color: ${COLOR.texto}; white-space: nowrap; }
.t4sb-monto.t4sb-foco { color: ${COLOR.texto}; font-weight: 600; }
@media (prefers-reduced-motion: reduce) { .t4sb, .t4sb * { transition: none !important; animation: none !important; } }
`;

/* Un espacio duro: ocupa su renglón entero sin decir nada. */
const VACIO = " ";

/* Una fila del sobre: el nombre a la izquierda y el monto a la derecha; sin cifra, «sin contar». */
function FilaSobre({ id, nombre, monto, estado, foco, clase = "", F = FIGURA_SOBRE }) {
  const sin = monto == null;
  return (
    <div className={`t4sb-lin ${clase}`} data-fila={id}>
      <span className="t4sb-nom">{nombre}</span>
      <span key={`${estado}-${id}`} className={`t4sb-monto t4f-nueva${sin ? " t4sb-sin" : ""}${foco ? " t4sb-foco" : ""}`} data-monto={sin ? undefined : id} data-sin-contar={sin ? "" : undefined}>
        {sin ? F.sinContar : cifra(monto)}
      </span>
    </div>
  );
}

/* Una fila que guarda su sitio sin decir nada: la misma forma, solo espacios duros (PH8-2). */
function FilaHueco({ id, clase = "" }) {
  return (
    <div className={`t4sb-lin t4sb-oculto ${clase}`} aria-hidden="true" data-hueco={id}>
      <span className="t4sb-nom">{VACIO}</span><span className="t4sb-monto">{VACIO}</span>
    </div>
  );
}

/* La tarjeta del cheque, en sus dos renglones, y la línea del cálculo si la hay. */
function ChequeSobre({ estado, s, F }) {
  return (
    <>
      <div key={`cheque-${estado}`} className="t4sb-cheque t4f-nueva" data-cheque>
        <span className="t4sb-lin"><span className="t4sb-cheque-n">{F.cheque}</span><span className="t4sb-cheque-m" data-monto="cheque">{cifra(s.cheque)}</span></span>
        <span className="t4sb-cheque-s">{F.chequeSale}</span>
      </div>
      {s.calculo && (
        <p key={`calc-${estado}`} className="t4sb-calc t4f-nueva" data-calculo>
          {cifra(s.calculo.efectivo)} + {cifra(s.cheque)} = <b>{cifra(s.calculo.efectivo + s.cheque)}</b>
        </p>
      )}
      <div className="t4sb-tubo" aria-hidden="true" data-tubo />
    </>
  );
}

/* El cheque guardando su sitio: la misma forma, sin cifra ni rótulo (PH8-2). */
function ChequeHueco({ calculo }) {
  return (
    <div className="t4sb-oculto" aria-hidden="true" data-hueco="cheque">
      <div className="t4sb-cheque">
        <span className="t4sb-lin"><span className="t4sb-cheque-n">{VACIO}</span><span className="t4sb-cheque-m">{VACIO}</span></span>
        <span className="t4sb-cheque-s">{VACIO}</span>
      </div>
      {calculo && <p className="t4sb-calc">{VACIO}</p>}
      <div className="t4sb-tubo" />
    </div>
  );
}

/* Una cuenta del libro: en una línea, o en dos renglones partidos en el guion con el monto al lado del segundo. */
function CuentaLibro({ f, F, foco }) {
  const nombre = F.cuentas[f.id];
  const monto = <span className={`t4sb-monto${foco ? " t4sb-foco" : ""}`} data-monto={f.id}>{cifra(f.monto)}</span>;
  return (
    <div className="t4sb-cta" data-cuenta={f.id}>
      {Array.isArray(nombre) ? (
        <span className="t4sb-cta2">
          <span>{nombre[0]}</span>
          <span className="t4sb-lin"><span className="t4sb-cta-n2">{nombre[1]}</span>{monto}</span>
        </span>
      ) : (
        <span className="t4sb-lin"><span className="t4sb-cta-n">{nombre}</span>{monto}</span>
      )}
      {f.nota && <span className="t4sb-nota" data-nota={f.nota}>{F.notas[f.nota]}</span>}
    </div>
  );
}

export function SobreCajaMenor({ estado, s, alt, F = FIGURA_SOBRE }) {
  const foco = (k) => s.foco.includes(k);
  const idAlt = `t4sb-alt-${estado}`;
  const dif = s.diferencia;
  return (
    <figure className="t4sb t4f-nueva" data-figura="sobre" data-estado={estado} aria-describedby={idAlt}>
      <div className="t4sb-zona" data-zona="sobre">
        <span className="t4sb-rot">{F.rotuloSobre}</span>
        <div className="t4sb-paso">
          {s.cheque != null && <ChequeSobre estado={estado} s={s} F={F} />}
          {s.chequeOculto && <ChequeHueco calculo={s.chequeOculto.calculo} />}
          <div className="t4sb-sobre" data-sobre>
            <svg className="t4sb-solapa" viewBox="0 0 100 18" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d="M0 0.5 H100 M0 0.5 L50 17.5 L100 0.5" />
            </svg>
            <div className="t4sb-lin t4sb-titulo" data-fila="fondo">
              <span className="t4sb-nom">{F.fondo}</span>
              <span className="t4sb-monto" data-monto="fondo">{cifra(s.fondo)}</span>
            </div>
            <FilaSobre id="billetes" nombre={F.billetes} monto={s.billetes} estado={estado} foco={foco("billetes")} F={F} />
            <FilaSobre id="soportes" nombre={F.soportes} monto={s.soportes} estado={estado} foco={foco("soportes")} F={F} />
            {s.sumanOculto
              ? <FilaHueco id="suman" clase="t4sb-suman" />
              : <FilaSobre id="suman" nombre={F.suman} monto={s.suman} estado={estado} foco={foco("suman")} clase="t4sb-suman" F={F} />}
            {dif && (dif.oculta
              ? <FilaHueco id="diferencia" clase="t4sb-dif" />
              : (
                <div className="t4sb-lin t4sb-dif" data-fila="diferencia" data-diferencia={dif.tipo}>
                  <span className="t4sb-nom">{F.diferencias[dif.tipo]}</span>
                  <span key={`${estado}-dif`} className={`t4sb-monto t4f-nueva${foco("diferencia") ? " t4sb-foco" : ""}`} data-monto="diferencia">{cifra(dif.monto)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
      {s.libro?.oculto && (
        /* El libro es la respuesta: guarda su sitio, con la misma forma y sin decir nada (PH8-2). */
        <div className="t4sb-zona t4sb-oculto" aria-hidden="true" data-libro="oculto">
          <span className="t4sb-rot">{VACIO}</span>
          <div className="t4sb-libro">
            {s.libro.oculto.map((f, k) => (
              <div key={k} className="t4sb-cta">
                {f.dos && <span className="t4sb-cta-n">{VACIO}</span>}
                <span className="t4sb-lin"><span className="t4sb-cta-n">{VACIO}</span><span className="t4sb-monto">{VACIO}</span></span>
                {f.nota && <span className="t4sb-nota">{VACIO}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      {s.libro?.filas && (
        <div key={`libro-${estado}`} className="t4sb-zona t4f-nueva" data-libro="visible">
          <span className="t4sb-rot">{F.rotuloLibro}</span>
          <div className="t4sb-libro">
            {s.libro.filas.map((f) => <CuentaLibro key={f.id} f={f} F={F} foco={foco(f.id)} />)}
          </div>
        </div>
      )}
      <figcaption id={idAlt} className="t4f-sr">{alt}</figcaption>
    </figure>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · HACER 1 · ¿ENTRA O SALE DE CAJA? (Célula D)
 *
 * Construida desde la especificación de Hanayama (celula-d/hanayama-h1-
 * pantalla-v1.md con la v1.1 encima) y el paquete vigente de Katsumi, no
 * desde el prototipo. La forma de T7-2 H1 «¿Debe o haber?», con tres
 * destinos apilados a todo el ancho en vez de dos, y con las piezas
 * compartidas sin cambiarlas (Encabezado, Pulsos, Opciones, Opcion,
 * Responder, Cierre).
 *
 *   · la tarjeta trae SOLO el hecho: sin pie (v1.1, PH1-1). La página va en la
 *     devolución, debajo de su texto, y H1-8 no la lleva
 *   · los tres destinos, siempre en el mismo orden; lo que se baraja son los
 *     hechos
 *   · UN SOLO TOQUE por tarjeta: al tocar se bloquean los tres; si falló, el
 *     correcto se enseña («era esta»). Coral solo en el error
 *   · mientras se pregunta, nada de la respuesta está en el DOM (PH8-2): ni la
 *     devolución ni la página existen hasta tocar
 *
 * Al terminar: onCompletar(pct, ms, detalle). Exploratoria: el motor paga los
 * 10 FP al terminar; el porcentaje va para el panel docente. En modo demo
 * («Así se juega») no reporta nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const APAGADO_H1 = "rgba(248,249,250,0.6)";
const CSS_T4H1 = `
@keyframes fae-t4h1-fundido { from { opacity: 0; } to { opacity: 1; } }
.fae-t4h1-entra { animation: fae-t4h1-fundido 150ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .fae-t4h1-entra { animation: none !important; } }
`;

export function EntraOSaleDeCaja({ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? sortearH1(barajar));
  const [elegido, setElegido] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const item = t.items[t.i];
  const cuantos = t.items.length;

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(puntuarH1(bien, cuantos), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r && !modoDemo) zonaBoton.current?.querySelector("button")?.focus(); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps

  const responder = (id) => {
    if (r) return;
    const nuevo = evaluarH1(item, id);
    /* En el error se guarda el destino elegido: eso le dice algo al docente. */
    t.anotar(item.id, nuevo.ok, id);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegido(id);
    setR(nuevo);
  };

  const avanzar = () => {
    setElegido(null); setR(null);
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setElegido(null); setR(null); setBien(0); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH1(bien, cuantos))} onReiniciar={reiniciar} textoReiniciar={BOTON_H1.otraVez}>
          <p data-resumen style={TEXTO_CIERRE}>{resumenH1(bien, cuantos)}</p>
          <p data-cierre style={{ ...TEXTO_CIERRE, marginTop: "8px" }}>{CIERRE_H1.texto}</p>
          <p data-pie-cierre style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", color: APAGADO_H1 }}>{CIERRE_H1.pie}</p>
        </Cierre>
      </Marco>
    );
  }

  const estadoDe = (id) => {
    if (!r) return null;
    if (id === elegido) return r.ok ? "correcta" : "incorrecta";
    if (id === r.correcta) return "revelada";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T4H1}</style>
      {/*
        La raíz del juego lleva `data-t4-h1`; la de la demo de «Así se juega»,
        `data-t4-h1-demo`. Así, en la página del juego, `[data-t4-h1]` encuentra
        exactamente una: la partida, nunca el ejemplo (Shibukawa, juego de H1).
      */}
      <div {...(modoDemo ? { "data-t4-h1-demo": "" } : { "data-t4-h1": "" })}>
        <Encabezado consigna={H1.consigna.join(" ")} onComoSeJuega={onComoSeJuega} />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Hecho" />
        </div>

        {/* El hecho, y nada más: la página va en la devolución (Hanayama v1.1, PH1-1). */}
        <div key={item.id} className="fae-t4h1-entra" data-tarjeta-hecho={item.id} style={{
          margin: "0 0 12px", padding: "11px 13px", borderRadius: "11px",
          background: "rgba(184,196,212,0.12)", borderLeft: "3px solid #B8C4D4",
        }}>
          <p ref={tarjeta} tabIndex={-1} data-hecho style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: "22px", color: FAE.text, outline: "none" }}>
            {item.texto}
          </p>
        </div>

        <div role="group" aria-label={H1.nombre}>
          <Opciones columnas="minmax(0, 1fr)">
            {DESTINOS_H1.map((d) => (
              <span key={d.id} data-opcion={d.id} style={{ display: "contents" }}>
                <Opcion ancho deshabilitada={Boolean(r)} estado={estadoDe(d.id)} onClick={() => responder(d.id)}>
                  {d.nombre}
                </Opcion>
              </span>
            ))}
          </Opciones>
        </div>

        {/* La devolución: región viva. Vacía mientras se pregunta: ni su texto ni su página están en el DOM. */}
        <div data-retro aria-live="polite" aria-atomic="true">
          {r && (
            <div className="fae-t4h1-entra" data-panel={r.ok ? "acierto" : "error"} style={{
              marginTop: "12px", padding: "11px 13px", borderRadius: "11px",
              background: r.ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
              borderLeft: `3px solid ${r.ok ? "#B8C4D4" : FAE.coral}`,
            }}>
              {!r.ok && <span style={SOLO_LECTOR}>{lectorErrorH1(nombreDeDestinoH1(r.correcta))} </span>}
              {r.textos.map((x) => (
                <p key={x} data-texto-retro style={{ margin: "0 0 4px", fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: "22px", color: FAE.text, fontWeight: x === r.textos[0] && r.ok ? 700 : 400 }}>{x}</p>
              ))}
              {r.pagina && <p data-pagina style={{ margin: "4px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", color: APAGADO_H1 }}>{r.pagina}</p>}
            </div>
          )}
        </div>
      </div>

      {r && !modoDemo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H1.verResumen : BOTON_H1.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · HACER 2 · EL CONTROL QUE SE SALTARON (Célula D)
 *
 * Desde la especificación de Hanayama (celula-d/hanayama-h2-pantalla-v1.md,
 * PASA de Shibukawa) y el paquete vigente de Katsumi, no desde el prototipo.
 * La forma de H1, con las piezas compartidas sin cambiarlas:
 *
 *   · la tarjeta del caso lleva el pie «Caso construido», igual en los siete:
 *     no delata nada. La página va en la devolución, la del control correcto
 *   · una línea de pregunta entre el caso y las opciones
 *   · tres opciones apiladas —el control que falla y dos distractores—,
 *     barajadas por caso. Un solo toque; si falla, «era esta». Coral solo en
 *     el error
 *   · mientras se pregunta, nada de la respuesta está en el DOM (PH8-2)
 *
 * Al terminar: onCompletar(pct, ms, detalle). Evaluativa: el motor escala los
 * 10 FP con el porcentaje. En modo demo no reporta nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function ElControlQueSeSaltaron({ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? sortearH2(barajar));
  const [elegida, setElegida] = useState(null);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const caso = t.items[t.i];
  const cuantos = t.items.length;

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(puntuarH2(bien, cuantos), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r && !modoDemo) zonaBoton.current?.querySelector("button")?.focus(); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps

  const responder = (id) => {
    if (r) return;
    const nuevo = evaluarH2(caso, id);
    /* En el error se guarda el control elegido: eso le dice algo al docente. */
    t.anotar(caso.id, nuevo.ok, id);
    if (nuevo.ok) setBien((n) => n + 1);
    setElegida(id);
    setR(nuevo);
  };

  const avanzar = () => {
    setElegida(null); setR(null);
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setElegida(null); setR(null); setBien(0); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH2(bien, cuantos))} onReiniciar={reiniciar} textoReiniciar={BOTON_H2.otraVez}>
          <p data-resumen style={TEXTO_CIERRE}>{resumenH2(bien, cuantos)}</p>
          <p data-cierre style={{ ...TEXTO_CIERRE, marginTop: "8px" }}>{CIERRE_H2.texto}</p>
          <p data-pie-cierre style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", color: APAGADO_H1 }}>{CIERRE_H2.pie}</p>
        </Cierre>
      </Marco>
    );
  }

  const estadoDe = (id) => {
    if (!r) return null;
    if (id === elegida) return r.ok ? "correcta" : "incorrecta";
    if (id === r.correcta) return "revelada";
    return null;
  };

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T4H1}</style>
      {/* Como en H1: la partida lleva `data-t4-h2` y la demo, `data-t4-h2-demo`. */}
      <div {...(modoDemo ? { "data-t4-h2-demo": "" } : { "data-t4-h2": "" })}>
        <Encabezado consigna={H2.consigna.join(" ")} onComoSeJuega={onComoSeJuega} />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Caso" />
        </div>

        {/* El caso y su pie neutro, igual en los siete. */}
        <div key={caso.id} className="fae-t4h1-entra" data-tarjeta-caso={caso.id} style={{
          margin: "0 0 12px", padding: "11px 13px", borderRadius: "11px",
          background: "rgba(184,196,212,0.12)", borderLeft: "3px solid #B8C4D4",
        }}>
          <p ref={tarjeta} tabIndex={-1} data-caso style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: "22px", color: FAE.text, outline: "none" }}>
            {caso.caso}
          </p>
          <p data-pie style={{ margin: "4px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", color: APAGADO_H1 }}>{PIE_CASO_H2}</p>
        </div>

        <p data-pregunta style={{ margin: "0 0 10px", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600, lineHeight: 1.4, color: FAE.text }}>{PREGUNTA_H2}</p>

        <div role="group" aria-label={PREGUNTA_H2}>
          <Opciones columnas="minmax(0, 1fr)">
            {opcionesEnOrden(caso).map((id) => (
              <span key={id} data-opcion={id} style={{ display: "contents" }}>
                <Opcion ancho deshabilitada={Boolean(r)} estado={estadoDe(id)} onClick={() => responder(id)}>
                  {controlH2(id).texto}
                </Opcion>
              </span>
            ))}
          </Opciones>
        </div>

        {/* La devolución: región viva, vacía mientras se pregunta. */}
        <div data-retro aria-live="polite" aria-atomic="true">
          {r && (
            <div className="fae-t4h1-entra" data-panel={r.ok ? "acierto" : "error"} style={{
              marginTop: "12px", padding: "11px 13px", borderRadius: "11px",
              background: r.ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
              borderLeft: `3px solid ${r.ok ? "#B8C4D4" : FAE.coral}`,
            }}>
              {!r.ok && <span style={SOLO_LECTOR}>{lectorErrorH2(controlH2(r.correcta).texto)} </span>}
              {r.textos.filter(Boolean).map((x) => (
                <p key={x} data-texto-retro style={{ margin: "0 0 4px", fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: "22px", color: FAE.text, fontWeight: x === r.textos[0] && r.ok ? 700 : 400 }}>{x}</p>
              ))}
              <p data-pagina style={{ margin: "4px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", color: APAGADO_H1 }}>{r.pagina}</p>
            </div>
          )}
        </div>
      </div>

      {r && !modoDemo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H2.verResumen : BOTON_H2.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · HACER 3 · ¿SE MUEVE LA CAJA MENOR? (Célula D)
 *
 * Desde la especificación de Hanayama (celula-d/hanayama-h3-pantalla-v1.md,
 * PASA de Shibukawa) y el paquete vigente de Katsumi (serie 1 con la v2, y
 * serie 2), no desde el prototipo. Piezas compartidas, sin cambiarlas:
 * Encabezado, Pulsos, ConstructorAsiento (cuatro cuentas, máximo 2, sin
 * cifras), Responder, AsientoEnLineas y Cierre.
 *
 *   · las cuatro operaciones van en el orden de la vida del fondo, SIN
 *     barajar; lo que se sortea es la serie, una por intento (D8)
 *   · «Comprobar» se activa con dos cuentas y una a cada lado. Un intento
 *   · al comprobar: cada fila dice si está bien o mal (coral solo en la que
 *     falló y en la devolución de error), UN mensaje —el primero de la lista
 *     de Katsumi que aplique— y el asiento completo con el valor
 *   · mientras se pregunta, nada de la respuesta está en el DOM (PH8-2): ni la
 *     devolución, ni el asiento completo, ni ningún atributo con la respuesta
 *
 * Al terminar: onCompletar(pct, ms, detalle). Evaluativa: el motor escala los
 * 25 FP con el porcentaje. En modo demo no reporta nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export function SeMueveLaCajaMenor({ Marco, rotulo, titulo, acento, onCompletar, items = null, modoDemo = false, onComoSeJuega = null }) {
  const t = useTanda(() => items ?? sortearH3());
  const [filas, setFilas] = useState(() => [filaVacia(), filaVacia()]);
  const [r, setR] = useState(null);
  const [bien, setBien] = useState(0);
  const zonaBoton = useRef(null);
  const tarjeta = useRef(null);

  const op = t.items[t.i];
  const cuantos = t.items.length;
  const listo = ESTA_LISTO(filas);

  useEffect(() => {
    if (t.terminado && !modoDemo) onCompletar?.(puntuarH3(bien, cuantos), Date.now() - t.inicio.current, t.detalle.current);
  }, [t.terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r && !modoDemo) zonaBoton.current?.querySelector("button")?.focus(); }, [r]); // eslint-disable-line react-hooks/exhaustive-deps

  const comprobar = () => {
    if (r || !listo) return;
    const nuevo = evaluarH3(op, filas);
    /* En el error se guarda el asiento armado: eso le dice algo al docente. */
    t.anotar(op.id, nuevo.ok, nuevo.respuesta);
    if (nuevo.ok) setBien((n) => n + 1);
    setR(nuevo);
  };

  const avanzar = () => {
    setR(null); setFilas([filaVacia(), filaVacia()]);
    if (t.i + 1 < cuantos) { t.setI(t.i + 1); requestAnimationFrame(() => tarjeta.current?.focus()); }
    else t.setTerminado(true);
  };

  const reiniciar = () => { t.reiniciar(); setR(null); setFilas([filaVacia(), filaVacia()]); setBien(0); };

  if (t.terminado) {
    return (
      <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
        <Cierre pct={Math.round(puntuarH3(bien, cuantos))} onReiniciar={reiniciar} textoReiniciar={BOTON_H3.otraVez}>
          <p data-resumen style={TEXTO_CIERRE}>{resumenH3(bien, cuantos)}</p>
          <p data-cierre style={{ ...TEXTO_CIERRE, marginTop: "8px" }}>{CIERRE_H3.texto}</p>
          <p data-pie-cierre style={{ margin: "6px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12px", color: APAGADO_H1 }}>{CIERRE_H3.pie}</p>
        </Cierre>
      </Marco>
    );
  }

  return (
    <Marco rotulo={rotulo} titulo={titulo} acento={acento}>
      <style>{CSS_T4H1}</style>
      {/* Como en H1 y H2: la partida lleva `data-t4-h3` y la demo, `data-t4-h3-demo`. */}
      <div {...(modoDemo ? { "data-t4-h3-demo": "" } : { "data-t4-h3": "" })}>
        <Encabezado consigna={H3.consigna.join(" ")} onComoSeJuega={onComoSeJuega} />
        <div style={{ marginBottom: "12px" }}>
          <Pulsos total={cuantos} hechos={t.i + (r ? 1 : 0)} enCurso={t.i + 1} etiqueta="Operación" />
        </div>

        {/* La tarjeta de la operación, la de H1: solo el enunciado. */}
        <div key={op.id} className="fae-t4h1-entra" data-tarjeta-operacion={op.id} style={{
          margin: "0 0 4px", padding: "11px 13px", borderRadius: "11px",
          background: "rgba(184,196,212,0.12)", borderLeft: "3px solid #B8C4D4",
        }}>
          <p ref={tarjeta} tabIndex={-1} data-enunciado style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: "22px", color: FAE.text, outline: "none" }}>
            {op.enunciado}
          </p>
        </div>

        <div data-constructor>
          <ConstructorAsiento
            filas={filas}
            cuentas={CUENTAS_H3}
            conCifras={false}
            maximo={2}
            deshabilitado={Boolean(r)}
            estados={r ? r.estados : null}
            acento={acento}
            onFilas={setFilas}
          />
        </div>

        {!r && mismoLado(filas) && (
          <p data-aviso style={{ margin: "10px 0 0", fontFamily: "Inter, sans-serif", fontSize: "12.5px", color: APAGADO_H1, textAlign: "center" }}>{MISMO_LADO}</p>
        )}

        {/* La devolución: región viva, vacía mientras se pregunta. */}
        <div data-retro aria-live="polite" aria-atomic="true">
          {r && (
            <div className="fae-t4h1-entra" data-panel={r.ok ? "acierto" : "error"} style={{
              marginTop: "12px", padding: "11px 13px", borderRadius: "11px",
              background: r.ok ? "rgba(184,196,212,0.13)" : "rgba(231,111,81,0.13)",
              borderLeft: `3px solid ${r.ok ? "#B8C4D4" : FAE.coral}`,
            }}>
              <p data-palabra style={{ margin: "0 0 4px", fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: "22px", fontWeight: 700, color: r.ok ? FAE.text : FAE.coral }}>{r.ok ? CORRECTO_H3 : INCORRECTO_H3}</p>
              <p data-texto-retro style={{ margin: 0, fontFamily: "Inter, sans-serif", fontSize: "15px", lineHeight: "22px", color: FAE.text }}>{r.texto}</p>
            </div>
          )}
          {r && (
            <div className="fae-t4h1-entra" data-asiento-completo style={{ marginTop: "12px" }}>
              <AsientoEnLineas lineas={r.asiento} rotulo={ROTULO_ASIENTO_H3} acento={acento} totales />
            </div>
          )}
        </div>
      </div>

      {/* «Comprobar» también en la demo: la mano lo toca. */}
      {!r && <Responder onClick={comprobar} deshabilitado={!listo}>{BOTON_H3.comprobar}</Responder>}
      {r && !modoDemo && (
        <div ref={zonaBoton}>
          <Responder onClick={avanzar}>{t.i + 1 === cuantos ? BOTON_H3.verResumen : BOTON_H3.siguiente}</Responder>
        </div>
      )}
    </Marco>
  );
}
