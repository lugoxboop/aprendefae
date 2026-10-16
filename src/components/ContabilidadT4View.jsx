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
import { BOTON, INTERFAZ, DEBE, HABER, PIEZA_LA_CAJA } from "../data/contabilidadT4.js";
import { PIEZA_EL_ACTIVO_CORRIENTE } from "../data/contabilidadT4A0.js";
import { PIEZA_EL_FONDO_FIJO, FIGURA_SOBRE, ESTADOS_SOBRE_A2, ALT_SOBRE_A2 } from "../data/contabilidadT4A2.js";
import { PIEZA_EL_ARQUEO, FIGURA_SOBRE_A3, ESTADOS_SOBRE_A3, ALT_SOBRE_A3 } from "../data/contabilidadT4A3.js";
import { PIEZA_BANCOS_Y_NOTAS, FIGURA_LIBRETAS, ESTADOS_LIBRETAS, ALT_LIBRETAS } from "../data/contabilidadT4A4.js";
import {
  PIEZA_SAN_CALIXTO, FIGURA_CONCILIA, ESTADOS_CONCILIA, NOTAS_A5, CHEQUES_A5, NOTAS_CREDITO_A5, NOTAS_DEBITO_A5,
  EXTRACTO as EXTRACTO_A5, LIBROS as LIBROS_A5, CONSIGNACION_EN_TRANSITO as CONSIGNACION_EN_TRANSITO_A5,
  TOTAL_CHEQUES as TOTAL_CHEQUES_A5, TOTAL_NOTAS_CREDITO as TOTAL_NOTAS_CREDITO_A5, TOTAL_NOTAS_DEBITO as TOTAL_NOTAS_DEBITO_A5,
  CONCILIADO_BANCO as CONCILIADO_BANCO_A5, CONCILIADO_LIBROS as CONCILIADO_LIBROS_A5,
  SUMA_DEBE_MAYOR as SUMA_DEBE_MAYOR_A5, SALDO_MAYOR as SALDO_MAYOR_A5,
} from "../data/contabilidadT4A5.js";
import { H1 } from "../data/contabilidadT4H1.js";
import { CSS_T4R, cifra } from "./t4/comun.jsx";
import { CSS_CAJON } from "./t4/Cajon.jsx";
import { CSS_ANO, CuerpoA0 } from "./t4/AnoEnMarcha.jsx";
import { CSS_A1, CuerpoA1 } from "./t4/LaCaja.jsx";
import EntraOSaleDeCaja from "./t4/EntraOSaleDeCaja.jsx";
import SeMueveLaCajaMenor from "./t4/SeMueveLaCajaMenor.jsx";
import ElArqueo from "./t4/ElArqueo.jsx";
import ConciliaLaCuenta from "./t4/ConciliaLaCuenta.jsx";
import SeAsientaONo from "./t4/SeAsientaONo.jsx";
import { H3 } from "../data/contabilidadT4H3.js";
import { H4 } from "../data/contabilidadT4H4.js";
import { H7 } from "../data/contabilidadT4H7.js";
import { H8 } from "../data/contabilidadT4H8.js";

export { cifra, EntraOSaleDeCaja, SeMueveLaCajaMenor, ElArqueo, ConciliaLaCuenta, SeAsientaONo };

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
 * carpeta de mecánicas: es el carril de la Célula D y nadie más lo usa. Sus
 * figuras y H1 viven en src/components/t4/ (rediseño de enganche, B1-B5).
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
  { numero: PIEZA_BANCOS_Y_NOTAS.numero, pieza: PIEZA_BANCOS_Y_NOTAS, Pieza: PantallasT4 },
  { numero: PIEZA_SAN_CALIXTO.numero, pieza: PIEZA_SAN_CALIXTO, Pieza: PantallasT4 },
].sort((a, b) => a.numero - b.numero);

/* Lo que se puede abrir desde el camino. Una prueba lo compara con el catálogo. */
export const JUEGOS_T4 = [
  { id: H1.id, Mecanica: EntraOSaleDeCaja, titulo: H1.nombre },
  { id: H3.id, Mecanica: SeMueveLaCajaMenor, titulo: H3.nombre },
  { id: H4.id, Mecanica: ElArqueo, titulo: H4.nombre },
  { id: H7.id, Mecanica: ConciliaLaCuenta, titulo: H7.nombre },
  { id: H8.id, Mecanica: SeAsientaONo, titulo: H8.nombre },
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
            {/*
              El título puede encogerse o romper en dos líneas, pero no
              desaparecer (herramientas.md). La hoja compartida del header
              compacto (AccountControl.jsx) le pone `nowrap` y elipsis al h1
              de toda `.fae-cabecera-titulo`; aquí, en línea, se le deja
              encoger (`minWidth: 0`) y romper. No se toca la hoja compartida.
            */}
            <h1 data-titulo-tema style={{
              fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2,
              minWidth: 0, flexShrink: 1, whiteSpace: "normal", overflow: "visible", textOverflow: "clip", overflowWrap: "break-word",
            }}>
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
                data-volver-camino
                style={{
                  /* 44 px de alto como mínimo: el blanco táctil de la casa (medía 129×37). */
                  display: "inline-flex", alignItems: "center", minHeight: "44px",
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
 * T4 · LAS PANTALLAS DE APRENDER (rediseño de enganche).
 *
 * Una pantalla a la vez, siempre en el mismo orden (Hanayama, rediseños de
 * A0 y A1): el texto de antes (corto: la figura queda en los primeros 280 px a
 * 320), la figura con lo que el estudiante hace en ella, el texto de después,
 * el resumen, «Siguiente…», «Seguir» y el pie. «Seguir» está siempre activo:
 * es Aprender, no califica ni da FP, y la figura ya muestra la verdad.
 *
 * Lo propio de cada pieza es su cuerpo: CuerpoA0 («El año en marcha») y
 * CuerpoA1 (el cajón operable), en src/components/t4/. Clases `t4r-`.
 *
 * Una pieza sin cuerpo nuevo (A2-A5 de la pila, mientras llega su rediseño)
 * se pinta con el armazón de antes, PantallasViejasT4.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CUERPOS = { [PIEZA_EL_ACTIVO_CORRIENTE.id]: CuerpoA0, [PIEZA_LA_CAJA.id]: CuerpoA1 };
const CSS_PANTALLAS = CSS_T4R + CSS_CAJON + CSS_ANO + CSS_A1;

const TextosR = ({ lista }) => (lista ?? []).map((t) => <p key={t} className="t4r-p" data-texto>{t}</p>);

export function PantallasT4({ pieza, rotulo }) {
  return CUERPOS[pieza.id] ? <PantallasR pieza={pieza} rotulo={rotulo} /> : <PantallasViejasT4 pieza={pieza} rotulo={rotulo} />;
}

function PantallasR({ pieza, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const ultima = k === pieza.pantallas.length - 1;
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);
  const Cuerpo = CUERPOS[pieza.id];

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_PANTALLAS}</style>
      <div ref={marco} tabIndex={-1} data-pieza={pieza.id} data-pantalla={p.id} style={{ outline: "none" }}>
        <div className="t4r" key={p.id}>
          <TextosR lista={p.antes} />
          <Cuerpo p={p} />
          <TextosR lista={p.despues} />
          {p.resumen && <ol className="t4r-lista" data-lista>{p.resumen.map((t) => <li key={t} data-texto>{t}</li>)}</ol>}
          {p.siguiente && <p className="t4r-sig" data-texto data-siguiente>{p.siguiente}</p>}
          {!ultima && <button type="button" className="t4r-btn" data-boton="seguir" onClick={seguir}>{pieza.boton ?? BOTON.seguir}</button>}
          {p.pie && <p className="t4r-pie" data-pie>{p.pie}</p>}
        </div>
      </div>
    </Panel>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · LAS PANTALLAS DE APRENDER DE ANTES (A2-A5 de la pila, hasta su rediseño).
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
 *   · `glosaDeLista`: una glosa debajo de un renglón de la lista numerada (A4,
 *     «girar» en su primera aparición)
 *   · `trasAcertar.grupos`: listas con título que salen solo con el acierto,
 *     numeradas de corrido (A4, las seis causas agrupadas)
 *   · `glosaDeParrafo`: una glosa debajo de un párrafo (A5, «sobregiro»)
 *
 * Las figuras de Hanayama: una pantalla que traiga `figura` la pinta entre sus
 * textos y su asiento (texto → figura → asiento → botón → pie). En una
 * elección, la figura sigue el estado de la pregunta y no dibuja la respuesta
 * mientras se pregunta. NO CALIFICA y no da FP: es Aprender. Clases `t4p-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const COLOR = { fondo: "#0E1B2E", texto: "#F8F9FA", texto2: "#A8B6C8", borde: "#B8C4D4", debe: "#2A9D8F", haber: "#E9C46A", error: "#E76F51" };

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
.t4p-glosa { display: block; margin-top: 4px; font-size: 14px; line-height: 1.45; color: ${COLOR.texto2}; }
.t4p-grupo { display: grid; gap: 6px; }
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

/* Listas con título, numeradas de corrido (A4, P7: las seis causas agrupadas). */
function GruposT4({ grupos }) {
  let n = 0;
  return grupos.map((g) => {
    const inicio = n + 1;
    n += g.causas.length;
    return (
      <div key={g.titulo} className="t4p-grupo t4p-nueva" data-grupo>
        <p className="t4p-p" data-texto>{g.titulo}</p>
        <ol className="t4p-lista" start={inicio} data-lista>{g.causas.map((c) => <li key={c} data-texto>{c}</li>)}</ol>
      </div>
    );
  });
}

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
      {/* Con `glosaDeParrafo`, la glosa va justo debajo de su párrafo (A5, «sobregiro» en P4). */}
      {(p.parrafos ?? []).flatMap((t, k) => [
        <p key={t} className="t4p-p" data-texto>{t}</p>,
        ...(p.glosaDeParrafo?.parrafo === k ? [<p key={`glosa-${t}`} className="t4p-nota" data-texto data-glosa>{p.glosaDeParrafo.texto}</p>] : []),
      ])}
      {p.listaNumerada && (
        <ol className="t4p-lista" data-lista>
          {p.listaNumerada.map((t, k) => (p.glosaDeLista?.renglon === k
            ? <li key={t}><span data-texto>{t}</span><span className="t4p-glosa" data-texto data-glosa>{p.glosaDeLista.texto}</span></li>
            : <li key={t} data-texto>{t}</li>))}
        </ol>
      )}
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
      {estado === "acierto" && despues?.grupos && <GruposT4 grupos={despues.grupos} />}
      {estado === "acierto" && despues && <AsientosT4 lista={despues.asientos} nuevo />}
      {estado === "error" && (
        <BotonT4 nombre="probar-otra" texto={BOTON.probarOtra} onClick={() => { setOrden((x) => barajarDistinto(pantalla.opciones, x, (o) => o.id)); setElegida(null); setConfirmada(null); }} />
      )}
      {estado === "acierto" && onSeguir && <BotonT4 nombre="seguir" texto={BOTON.seguir} onClick={onSeguir} />}
      <PieT4 texto={pie} />
    </div>
  );
}

function PantallasViejasT4({ pieza, rotulo }) {
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const ultima = k === pieza.pantallas.length - 1;
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);

  return (
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_T4P + CSS_T4F + CSS_T4S + CSS_T4L + CSS_T4C}</style>
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
  if (tipo === "libretas") return <LasDosLibretas estado={estado} />;
  if (tipo === "concilia") return <ConciliacionSanCalixto estado={estado} />;
  const sobre = SOBRES[tipo];
  return <SobreCajaMenor estado={estado} s={sobre.estados[estado]} alt={sobre.alt[estado]} F={sobre.F} />;
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
 * T4 · «LAS DOS LIBRETAS» (Hanayama, A4 v1 con la v1.1 encima).
 *
 * Dos registros de la misma cuenta, uno al lado del otro: el de la empresa
 * (libro auxiliar) y el del banco (extracto del mes). Cada hecho es un
 * renglón A LO ANCHO de las dos: en la libreta de quien lo anotó, su nombre
 * y si suma o resta; en la otra, «todavía no / lo sabe». Las dos libretas
 * usan `grid-template-rows: subgrid`, así el renglón k de una queda a la
 * altura del renglón k de la otra.
 *
 *   · sin coral ni rayado en lo que falta: que el otro no lo sepa es tiempo,
 *     no un error. Sin teal, ámbar, Debe ni Haber; sin cifras
 *   · «Cheque girado» en dos renglones fijos; todo renglón con nowrap
 *   · v1.1 (FA4-1): en `notas`, la cabecera no dice «libro auxiliar» ni
 *     «extracto del mes»; el subtítulo guarda su sitio sin texto
 *   · P7: mientras se pregunta, el renglón del cheque guarda su sitio sin
 *     decir nada (PH8-2)
 *   · para el lector de pantalla, una tabla (filas = hechos, columnas = las
 *     dos libretas, con encabezados de fila); el dibujo va aria-hidden
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_T4L = `
.t4lb { position: relative; margin: 0; display: grid; gap: 8px; min-width: 0; color: ${COLOR.texto}; font-family: "Inter", sans-serif; }
.t4lb * { box-sizing: border-box; }
.t4lb-hecho { display: grid; gap: 2px; border: 1px solid ${COLOR.texto}; border-radius: 8px; padding: 8px 12px; min-width: 0; }
.t4lb-hecho > span:first-child { font: 400 12px/1.3 "Inter", sans-serif; color: ${COLOR.texto2}; white-space: nowrap; }
.t4lb-hecho > span + span { font: 400 13px/1.35 "Inter", sans-serif; white-space: nowrap; }
.t4lb-par { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 8px; min-width: 0; }
.t4lb-lib { grid-row: 1 / -1; display: grid; grid-template-rows: subgrid; min-width: 0; border: 1px solid ${COLOR.borde}; border-radius: 10px; padding: 0 10px; }
.t4lb-cab { display: grid; gap: 2px; padding: 8px 0; border-bottom: 1px solid ${COLOR.borde}; min-width: 0; }
.t4lb-cab > span:first-child { font: 600 13px/1.3 "Sora", "Inter", sans-serif; white-space: nowrap; }
.t4lb-cab > span + span { font: 500 12px/1.3 "Inter", sans-serif; color: ${COLOR.texto2}; white-space: nowrap; }
.t4lb-ren { display: grid; align-content: start; gap: 2px; min-width: 0; min-height: 62px; margin: 6px 0 0; padding: 4px 0 4px 8px; }
.t4lb-ren.t4lb-anotado { border-left: 2px solid ${COLOR.borde}; }
.t4lb-ren.t4lb-anotado.t4lb-foco { border-left-color: ${COLOR.texto}; }
.t4lb-nom { font: 600 13px/1.3 "Inter", sans-serif; color: ${COLOR.texto2}; white-space: nowrap; }
.t4lb-foco .t4lb-nom { color: ${COLOR.texto}; }
.t4lb-ef, .t4lb-no { font: 400 12px/1.3 "Inter", sans-serif; color: ${COLOR.texto2}; white-space: nowrap; }
.t4lb-pie { padding: 8px 0; margin-top: 6px; border-top: 1px solid ${COLOR.borde}; font: 500 12px/1.3 "Inter", sans-serif; color: ${COLOR.texto2}; white-space: nowrap; }
.t4lb-oculto { visibility: hidden; }
@media (prefers-reduced-motion: reduce) { .t4lb, .t4lb * { transition: none !important; animation: none !important; } }
`;

/* Un renglón de una libreta: anotado (de quien lo anotó), «todavía no / lo sabe», o un hueco. */
function RenglonLibreta({ lado, id, foco, estado }) {
  const F = FIGURA_LIBRETAS;
  if (!id) {
    return (
      <div className="t4lb-ren t4lb-oculto" aria-hidden="true" data-hueco-renglon>
        <span className="t4lb-nom">{VACIO}</span><span className="t4lb-ef">{VACIO}</span>
      </div>
    );
  }
  const h = F.hechos[id];
  if (h.quien === lado) {
    return (
      <div key={`${estado}-${id}`} className={`t4lb-ren t4lb-anotado t4f-nueva${foco ? " t4lb-foco" : ""}`} data-renglon={id} data-anotado={lado}>
        {h.nombre.map((t) => <span key={t} className="t4lb-nom">{t}</span>)}
        <span className="t4lb-ef" data-efecto={h.efecto}>{F[h.efecto]}</span>
      </div>
    );
  }
  return (
    <div key={`${estado}-${id}`} className="t4lb-ren t4f-nueva" data-renglon={id} data-no-lo-sabe={lado}>
      {F.noLoSabe.map((t) => <span key={t} className="t4lb-no">{t}</span>)}
    </div>
  );
}

export function LasDosLibretas({ estado }) {
  const s = ESTADOS_LIBRETAS[estado];
  const F = FIGURA_LIBRETAS;
  const filas = [...s.renglones, ...Array.from({ length: s.huecos ?? 0 }, () => null)];
  const idAlt = `t4lb-alt-${estado}`;
  const libreta = (lado) => (
    <div className="t4lb-lib" data-libreta={lado}>
      <div className="t4lb-cab">
        <span>{F[lado].nombre}</span>
        {/* v1.1, FA4-1: en P2 el subtítulo guarda su sitio sin decir «libro auxiliar» ni «extracto». */}
        {s.subtitulo ? <span data-registro>{F[lado].registro}</span> : <span className="t4lb-oculto" aria-hidden="true">{VACIO}</span>}
      </div>
      {filas.map((id, k) => <RenglonLibreta key={id ?? `hueco-${k}`} lado={lado} id={id} foco={s.foco.includes(id)} estado={estado} />)}
      <div className={`t4lb-pie${s.saldo === "oculto" ? " t4lb-oculto" : ""}`} aria-hidden={s.saldo === "oculto" ? "true" : undefined} data-saldo={s.saldo}>
        {s.saldo === "visible" ? F.saldo : VACIO}
      </div>
    </div>
  );
  return (
    <figure className="t4lb t4f-nueva" data-figura="libretas" data-estado={estado} aria-describedby={idAlt}>
      {s.tarjeta && (
        <div className="t4lb-hecho" aria-hidden="true" data-tarjeta-hecho>
          <span>{F.tarjetaP7.cuando}</span>
          {F.tarjetaP7.renglones.map((t) => <span key={t}>{t}</span>)}
        </div>
      )}
      {/* Una fila por renglón, más la cabecera y el pie. Sin «repeat(0, …)»: no es CSS válido y se pierde la plantilla entera. */}
      <div className="t4lb-par" aria-hidden="true" style={{ gridTemplateRows: ["auto", ...filas.map(() => "auto"), "auto"].join(" ") }}>
        {libreta("empresa")}
        {libreta("banco")}
      </div>
      {/* Para el lector de pantalla: una fila por hecho que ya está anotado; los huecos no se leen. */}
      <table className="t4f-sr" data-tabla-libretas>
        <thead><tr><td />{["empresa", "banco"].map((l) => <th key={l} scope="col">{F[l].nombre}</th>)}</tr></thead>
        <tbody>
          {s.renglones.map((id) => (
            <tr key={id}>
              <th scope="row">{F.hechos[id].nombre.join(" ")}</th>
              {["empresa", "banco"].map((l) => <td key={l}>{F.hechos[id].quien === l ? F[F.hechos[id].efecto] : F.noLoSabe.join(" ")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption id={idAlt} className="t4f-sr">{ALT_LIBRETAS[estado]}</figcaption>
    </figure>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · «LA CONCILIACIÓN DE DOS LADOS» (Hanayama, A5 v1 con la v1.1 y la
 * v1.2 encima). Tres piezas, una por idea:
 *
 *   · el PAR «el banco / la empresa», fijo arriba: los dos saldos, y el «=»
 *     solo cuando son iguales (lo calcula la figura, no lo dice el estado)
 *   · cada LADO de la conciliación, la presentación de la p. 190: «Más» y
 *     «Menos» sin color (no son debe ni haber, ni un error), cada concepto en
 *     dos renglones fijos y su monto a la base del último; el detalle de
 *     cada partida alineado con la columna de conceptos, con su filete. Un
 *     lado por pantalla; los dos, compactos, en P6
 *   · las CINCO NOTAS (P7), como tarjetas de asiento (aquí sí DEBE teal y
 *     HABER ámbar: es un asiento), y el MAYOR de Bancos (P8), con los
 *     rótulos encima del monto
 *
 * Las cifras se calculan de las partidas (contabilidadT4A5.js). Un signo o
 * una marca de P6 que todavía no se ve guarda su sitio SIN su texto: es la
 * respuesta (PH8-2). Para el lector de pantalla, el par se lee en una frase
 * y cada lado, las notas y el mayor son tablas; el dibujo de las notas y el
 * del mayor van aria-hidden. Clases `t4cn-`, `t4na-` y `t4my-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const CSS_T4C = `
.t4cn { position: relative; margin: 0; display: grid; gap: 14px; min-width: 0; color: ${COLOR.texto}; font-family: "Inter", sans-serif; }
.t4cn * { box-sizing: border-box; }
.t4cn-par { display: grid; grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr); align-items: end; border: 1px solid ${COLOR.borde}; border-radius: 10px; padding: 8px 12px; min-width: 0; }
.t4cn-parl { display: grid; min-width: 0; }
.t4cn-parl + .t4cn-igual + .t4cn-parl { justify-items: end; text-align: right; }
.t4cn-parl > span:first-child { font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${COLOR.texto2}; white-space: nowrap; }
.t4cn-m { font: 500 15px/1.2 "Inter", sans-serif; font-variant-numeric: tabular-nums; white-space: nowrap; color: ${COLOR.texto2}; text-align: right; }
.t4cn-parl .t4cn-m { color: ${COLOR.texto}; }
.t4cn-igual { text-align: center; font: 600 15px/1.2 "Inter", sans-serif; }
.t4cn-lado { display: grid; min-width: 0; border: 1px solid ${COLOR.borde}; border-radius: 10px; padding: 4px 12px 8px; }
.t4cn-cab { padding: 6px 0; font: 600 13px/1.3 "Sora", "Inter", sans-serif; white-space: nowrap; border-bottom: 1px solid ${COLOR.borde}; }
.t4cn-tabla { display: grid; min-width: 0; }
.t4cn-fila, .t4cn-det { display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; column-gap: 8px; align-items: end; min-width: 0; }
.t4cn-fila { padding: 6px 0; }
.t4cn-fila + .t4cn-fila, .t4cn-det + .t4cn-fila { border-top: 1px solid rgba(184,196,212,0.35); }
.t4cn-det { padding: 2px 0; }
.t4cn-signo { align-self: start; padding-top: 1px; font: 600 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; white-space: nowrap; color: ${COLOR.texto2}; }
.t4cn-con { display: grid; min-width: 0; font: 400 13px/1.3 "Inter", sans-serif; color: ${COLOR.texto2}; }
.t4cn-con > span, .t4cn-dn > span { white-space: nowrap; }
.t4cn-dn { display: grid; min-width: 0; padding-left: 8px; border-left: 1px solid ${COLOR.borde}; font: 400 12px/1.35 "Inter", sans-serif; color: ${COLOR.texto2}; }
.t4cn-det .t4cn-m { font-size: 13px; }
.t4cn-total { border-top: 1px solid ${COLOR.borde} !important; }
.t4cn-total .t4cn-con, .t4cn-total .t4cn-m { color: ${COLOR.texto}; font-weight: 600; }
.t4cn-foco .t4cn-con, .t4cn-foco .t4cn-signo, .t4cn-foco .t4cn-dn { color: ${COLOR.texto}; }
.t4cn-foco .t4cn-m, .t4cn-parl.t4cn-foco .t4cn-m { color: ${COLOR.texto}; font-weight: 600; }
.t4cn-marca { padding: 6px 0 2px; border-top: 1px solid ${COLOR.borde}; font: 500 12px/1.3 "Inter", sans-serif; color: ${COLOR.texto}; white-space: nowrap; }
.t4cn-oculto { visibility: hidden; }
.t4na { margin: 0; display: grid; gap: 8px; min-width: 0; color: ${COLOR.texto}; font-family: "Inter", sans-serif; }
.t4na * { box-sizing: border-box; }
.t4na-cab { font: 500 12px/1.3 "Inter", sans-serif; letter-spacing: .04em; color: ${COLOR.texto2}; white-space: nowrap; }
.t4na-n { display: grid; gap: 4px; min-width: 0; border: 1px solid ${COLOR.borde}; border-radius: 10px; padding: 8px 12px; }
.t4na-top { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 10px; align-items: start; min-width: 0; }
.t4na-nom { display: grid; min-width: 0; font: 400 13px/1.35 "Inter", sans-serif; color: ${COLOR.texto2}; }
.t4na-nom > span, .t4na-cta > span { white-space: nowrap; }
.t4na-top .t4cn-m { color: ${COLOR.texto}; }
.t4na-l { display: grid; grid-template-columns: 52px minmax(0, 1fr); column-gap: 8px; align-items: baseline; min-width: 0; }
.t4na-lado { font: 600 12px/1.3 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
.t4na-cta { display: grid; min-width: 0; font: 600 13px/1.3 "Sora", "Inter", sans-serif; }
.t4my { margin: 0; display: grid; min-width: 0; border: 1px solid ${COLOR.borde}; border-radius: 10px; padding: 8px 12px; color: ${COLOR.texto}; font-family: "Inter", sans-serif; }
.t4my * { box-sizing: border-box; }
.t4my-n { padding-bottom: 6px; text-align: center; font: 600 13px/1.3 "Sora", "Inter", sans-serif; white-space: nowrap; }
.t4my-g { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid ${COLOR.borde}; min-width: 0; }
.t4my-c { display: grid; justify-items: end; align-content: end; min-width: 0; padding: 3px 8px; }
.t4my-g > .t4my-c:nth-child(even) { border-left: 1px solid ${COLOR.borde}; }
.t4my-lado { justify-self: start; padding-top: 3px; font: 600 12px/1.2 "Inter", sans-serif; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
.t4my-g > .t4my-c:nth-child(2) .t4my-lado { justify-self: end; }
.t4my-r { justify-self: start; font: 400 12px/1.3 "Inter", sans-serif; color: ${COLOR.texto2}; white-space: nowrap; }
.t4my-c .t4cn-m { color: ${COLOR.texto}; }
.t4my-suma { border-top: 1px solid ${COLOR.borde}; margin-top: 2px; }
.t4my-saldo .t4cn-m, .t4my-saldo .t4my-r { font-weight: 600; color: ${COLOR.texto}; }
@media (prefers-reduced-motion: reduce) { .t4cn, .t4cn *, .t4na, .t4na *, .t4my, .t4my * { transition: none !important; animation: none !important; } }
`;

/* Un signo de la p. 190: «Más» o «Menos», o su sitio sin texto (es la respuesta). */
function SignoConcilia({ signo, visible, estado, id }) {
  return visible
    ? <span key={`${estado}-${id}`} role="cell" className="t4cn-signo t4f-nueva" data-signo="visible">{signo}</span>
    : <span role="cell" className="t4cn-signo t4cn-oculto" data-signo="oculto"><span aria-hidden="true">{VACIO}</span></span>;
}

/* Una fila de un lado: signo, concepto en renglones fijos y monto. */
function FilaConcilia({ id, signo = null, visible = false, concepto, monto, foco, total = false, estado }) {
  return (
    <div role="row" className={`t4cn-fila${total ? " t4cn-total" : ""}${foco ? " t4cn-foco" : ""}`} data-fila={id}>
      {signo ? <SignoConcilia signo={signo} visible={visible} estado={estado} id={id} /> : <span role="cell" className="t4cn-signo" />}
      <span role="rowheader" className="t4cn-con">{concepto.map((t) => <span key={t}>{t}</span>)}</span>
      <span role="cell" className="t4cn-m" data-monto={id}>{cifra(monto)}</span>
    </div>
  );
}

/* Un renglón del detalle: alineado con la columna de conceptos, con su filete. */
function DetalleConcilia({ id, renglones, monto, foco }) {
  return (
    <div role="row" className={`t4cn-det${foco ? " t4cn-foco" : ""}`} data-detalle={id}>
      <span role="cell" />
      <span role="rowheader" className="t4cn-dn">{renglones.map((t) => <span key={t}>{t}</span>)}</span>
      <span role="cell" className="t4cn-m" data-monto={id}>{cifra(monto)}</span>
    </div>
  );
}

/* Los datos de cada lado, sacados de las partidas: nada se transcribe. */
const LADOS_CONCILIA = {
  banco: {
    inicial: EXTRACTO_A5,
    mas: { monto: CONSIGNACION_EN_TRANSITO_A5, detalle: [] },
    menos: { monto: TOTAL_CHEQUES_A5, detalle: CHEQUES_A5.map((c) => ({ id: c.beneficiario, renglones: [c.beneficiario], monto: c.monto })) },
    conciliado: CONCILIADO_BANCO_A5,
  },
  empresa: {
    inicial: LIBROS_A5,
    mas: { monto: TOTAL_NOTAS_CREDITO_A5, detalle: NOTAS_CREDITO_A5.map((n) => ({ id: n.id, renglones: n.detalle, monto: n.monto })) },
    menos: { monto: TOTAL_NOTAS_DEBITO_A5, detalle: NOTAS_DEBITO_A5.map((n) => ({ id: n.id, renglones: n.detalle, monto: n.monto })) },
    conciliado: CONCILIADO_LIBROS_A5,
  },
};

function LadoConcilia({ lado, ver, s, estado }) {
  const F = FIGURA_CONCILIA;
  const L = LADOS_CONCILIA[lado];
  const T = F[lado];
  const foco = (id) => (s.foco ?? []).includes(id);
  const detalle = (parte, id) => !s.compacto && L[parte].detalle.map((d) => <DetalleConcilia key={d.id} id={d.id} renglones={d.renglones} monto={d.monto} foco={foco(id)} />);
  return (
    <div className="t4cn-lado" data-lado={lado} data-ver={ver}>
      <span className="t4cn-cab" aria-hidden="true">{T.cabecera}</span>
      <div className="t4cn-tabla" role="table" aria-label={T.cabecera}>
        <FilaConcilia id={`inicial-${lado}`} concepto={T.inicial} monto={L.inicial} estado={estado} />
        <FilaConcilia id={T.mas.id} signo={F.mas} visible={s.signos.includes(T.mas.id)} concepto={T.mas.concepto} monto={L.mas.monto} foco={foco(T.mas.id)} estado={estado} />
        {detalle("mas", T.mas.id)}
        <FilaConcilia id={T.menos.id} signo={F.menos} visible={s.signos.includes(T.menos.id)} concepto={T.menos.concepto} monto={L.menos.monto} foco={foco(T.menos.id)} estado={estado} />
        {detalle("menos", T.menos.id)}
        {ver === "todo" && <FilaConcilia id={`conciliado-${lado}`} concepto={F.conciliado} monto={L.conciliado} foco={foco(`conciliado-${lado}`)} total estado={estado} />}
      </div>
      {/* P6: la marca de qué se asienta guarda su sitio sin decirlo hasta el acierto. */}
      {s.compacto && (s.marcas
        ? <span key={`${estado}-marca`} className="t4cn-marca t4f-nueva" data-marca={lado}>{T.marca}</span>
        : <span className="t4cn-marca t4cn-oculto" aria-hidden="true" data-marca-oculta={lado}>{VACIO}</span>)}
    </div>
  );
}

/* Las cinco notas (P7): tarjetas de asiento, en el orden de la p. 191. Una cuenta con raya se parte en la raya. */
const partirEnLaRaya = (c) => { const i = c.indexOf(" – "); return i < 0 ? [c] : [c.slice(0, i), c.slice(i + 1)]; };

function NotasConcilia() {
  const F = FIGURA_CONCILIA;
  return (
    <figure className="t4na t4f-nueva" data-figura="concilia" data-estado="notas">
      <div aria-hidden="true" style={{ display: "grid", gap: "8px", minWidth: 0 }}>
        <span className="t4na-cab">{F.notas.cabecera}</span>
        {NOTAS_A5.map((n) => (
          <div key={n.id} className="t4na-n" data-nota={n.id}>
            <div className="t4na-top">
              <span className="t4na-nom" data-nombre-nota>{n.tarjeta.map((t) => <span key={t}>{t}</span>)}</span>
              <span className="t4cn-m" data-monto={n.id}>{cifra(n.monto)}</span>
            </div>
            {[[DEBE, n.debe, "t4p-d", INTERFAZ.debe], [HABER, n.haber, "t4p-hb", INTERFAZ.haber]].map(([lado, cuenta, clase, rotulo]) => (
              <div key={lado} className="t4na-l" data-lado-nota={lado}>
                <span className={`t4na-lado ${clase}`}>{rotulo}</span>
                <span className="t4na-cta" data-cuenta-nota={cuenta}>{partirEnLaRaya(cuenta).map((t) => <span key={t}>{t}</span>)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Para el lector de pantalla: la tabla de P7 del paquete. */}
      <table className="t4f-sr" data-tabla-notas>
        <caption>{F.lector.notas}</caption>
        <thead><tr>{["Nota", INTERFAZ.debe, INTERFAZ.haber, "Valor"].map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>{NOTAS_A5.map((n) => <tr key={n.id}><th scope="row">{n.nombre}</th><td>{n.debe}</td><td>{n.haber}</td><td>{cifra(n.monto)}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

/*
 * El mayor de Bancos (P8). Una rejilla de dos columnas, fila por fila, para
 * que los renglones del debe y del haber queden a la misma altura; si un
 * lado lleva rótulo en una fila, el otro guarda ese renglón vacío.
 */
function MayorConcilia() {
  const F = FIGURA_CONCILIA;
  const filasDebe = [{ rotulo: F.mayor.saldo, monto: LIBROS_A5 }, ...NOTAS_CREDITO_A5.map((n) => ({ monto: n.monto })), { rotulo: F.mayor.suma, monto: SUMA_DEBE_MAYOR_A5, clase: "t4my-suma" }, { rotulo: F.mayor.conciliado, monto: SALDO_MAYOR_A5, clase: "t4my-saldo" }];
  const filasHaber = [...NOTAS_DEBITO_A5.map((n) => ({ monto: n.monto })), { rotulo: F.mayor.suma, monto: TOTAL_NOTAS_DEBITO_A5, clase: "t4my-suma" }];
  const n = Math.max(filasDebe.length, filasHaber.length);
  const celda = (f, otra, lado, k) => {
    const conRotulo = Boolean(f?.rotulo || otra?.rotulo);
    return (
      <div key={`${lado}-${k}`} className={`t4my-c ${f?.clase ?? otra?.clase ?? ""}`} data-mayor={f ? lado : undefined} data-fila-mayor={k}>
        {conRotulo && <span className="t4my-r">{f?.rotulo ?? VACIO}</span>}
        {f ? <span className="t4cn-m" data-monto={`mayor-${lado}-${k}`}>{cifra(f.monto)}</span> : <span className="t4cn-m">{VACIO}</span>}
      </div>
    );
  };
  return (
    <figure className="t4my t4f-nueva" data-figura="concilia" data-estado="mayor">
      <div aria-hidden="true" style={{ display: "grid", minWidth: 0 }}>
        <span className="t4my-n">{F.mayor.titulo}</span>
        <div className="t4my-g">
          <div className="t4my-c"><span className="t4my-lado t4p-d">{INTERFAZ.debe}</span></div>
          <div className="t4my-c"><span className="t4my-lado t4p-hb">{INTERFAZ.haber}</span></div>
          {Array.from({ length: n }, (_, k) => [celda(filasDebe[k], filasHaber[k], DEBE, k), celda(filasHaber[k], filasDebe[k], HABER, k)])}
        </div>
      </div>
      {/* Para el lector de pantalla: el mayor como tabla de dos columnas. */}
      <table className="t4f-sr" data-tabla-mayor>
        <caption>{F.lector.mayor}</caption>
        <thead><tr><th scope="col">{INTERFAZ.debe}</th><th scope="col">{INTERFAZ.haber}</th></tr></thead>
        <tbody>
          {Array.from({ length: n }, (_, k) => (
            <tr key={k}>{[filasDebe[k], filasHaber[k]].map((f, j) => <td key={j}>{f ? [f.rotulo, cifra(f.monto)].filter(Boolean).join(" ") : ""}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function ConciliacionSanCalixto({ estado }) {
  const s = ESTADOS_CONCILIA[estado];
  if (s.tipo === "notas") return <NotasConcilia />;
  if (s.tipo === "mayor") return <MayorConcilia />;
  const F = FIGURA_CONCILIA;
  const [banco, empresa] = s.par;
  const iguales = banco === empresa;
  const foco = (id) => ((s.foco ?? []).includes(id) ? " t4cn-foco" : "");
  return (
    <figure className="t4cn t4f-nueva" data-figura="concilia" data-estado={estado}>
      <div className="t4cn-par" data-par>
        <span className="t4f-sr" data-par-lector>{F.lector.par(cifra(banco), cifra(empresa))}{iguales ? ` ${F.lector.iguales}` : ""}</span>
        <div className={`t4cn-parl${foco("par-banco")}`} aria-hidden="true">
          <span>{F.par.banco}</span>
          <span key={`${estado}-b`} className="t4cn-m t4f-nueva" data-monto="par-banco" data-par-monto="banco">{cifra(banco)}</span>
        </div>
        {/* El «=» guarda su sitio, sin texto, hasta que los dos saldos son iguales. */}
        {iguales
          ? <span key={`${estado}-igual`} className="t4cn-igual t4f-nueva" aria-hidden="true" data-igual="visible">{F.par.igual}</span>
          : <span className="t4cn-igual t4cn-oculto" aria-hidden="true" data-igual="oculto">{VACIO}</span>}
        <div className={`t4cn-parl${foco("par-empresa")}`} aria-hidden="true">
          <span>{F.par.empresa}</span>
          <span key={`${estado}-e`} className="t4cn-m t4f-nueva" data-monto="par-empresa" data-par-monto="empresa">{cifra(empresa)}</span>
        </div>
      </div>
      {s.lados.map(({ lado, ver }) => <LadoConcilia key={lado} lado={lado} ver={ver} s={s} estado={estado} />)}
    </figure>
  );
}
