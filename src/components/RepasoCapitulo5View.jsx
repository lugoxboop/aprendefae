import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import { HACER, SUBJECTS, clasificacionDe, actividadesDeTipo } from "../data/subjects.js";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { conIcono } from "../data/contabilidadIconos.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { useRecompensa } from "./shared/RecompensaCierre.jsx";
import { ContextoResumen, useResumenDePartida } from "./shared/PantallaResumen.jsx";
import { CSS_JUEGO, Opcion, Opciones, Cierre } from "./mecanicas/corazon/juego.jsx";
import { pesos } from "../data/contabilidad.js";
import { C, INTER, SORA, MARCA, Devolucion, BotonSiguiente } from "./repasoCap5/comun.jsx";
import { ToroNegro } from "./repasoCap5/ToroNegro.jsx";
import { R5_2 } from "../data/repasoCap5ToroNegroTextos.js";
import { Mate } from "./repasoCap5/Mate.jsx";
import { R5_3 } from "../data/repasoCap5MateTextos.js";
import {
  R5_1, INTERFAZ_R5_1, PENDIENTE_DE_REVISION_R5_1, SUBTEMAS, UNIDADES_POR_CAJA,
  prepararR5_1, evaluarR5_1, puntuarR5_1, porTema, textoDeOpcion,
} from "../data/repasoCap5Cruzado.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REPASO DEL CAPÍTULO 5 (Célula E) — el banco de ejercicios, pp. 262-274.
 *
 * Un tema transversal que solo tiene Hacer: el camino sale de `subjects.js`
 * y JUEGOS_REPASO_CAP5 dice qué componente pinta cada id. Al terminar una
 * partida, la vista registra con el motor compartido
 * (registrarActividadCompletada → otorgarFP), sin tocarlo, igual que T7.
 *
 * r5-1 «Repaso cruzado» se pinta aquí mismo, con el diseño de Itagaki del
 * paquete e5-r5-1-v1: Opcion, Opciones y Cierre de corazon/juego.jsx sin
 * cambiarlos; el progreso, la escena, los datos, el panel de devolución y el
 * bloque «POR TEMA» son de esta vista. Nada de mecanicas/libros/t7, que es de
 * la Célula C.
 *
 * Sin Marco: el paquete mide la pantalla con el ancho de contenido de la
 * vista (343 a 375 px, 288 a 320), sin el relleno de un panel encima.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
export const TEMA_REPASO_CAP5 = "repaso-capitulo-5";

const LECTOR_R5_1 = { acierto: PENDIENTE_DE_REVISION_R5_1.lectorAcierto, error: PENDIENTE_DE_REVISION_R5_1.lectorError };

const CSS_R5 = `
@keyframes r5-entra { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.r5-escena { animation: r5-entra 240ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .r5-escena { animation: none; } }
`;

/* ═══════════ LAS TRES SILUETAS (HTML/CSS a px reales, trazo de 2) ═══════════ */

const TRAZO = `2px solid ${C.hecho}`;
const caja = (estilo) => <span aria-hidden="true" style={{ position: "absolute", boxSizing: "border-box", ...estilo }} />;

/* Inversiones · el título valor. */
function TituloValor() {
  return (
    <span data-silueta="titulo-valor" style={{ position: "relative", display: "block", width: "168px", height: "44px", boxSizing: "border-box", border: TRAZO, borderRadius: "4px" }}>
      {/* La línea punteada del talón, en x = 44: puntos de 2, huecos de 4. */}
      {caja({ left: "42px", top: 0, width: "2px", height: "100%", backgroundImage: `repeating-linear-gradient(to bottom, ${C.hecho} 0 2px, transparent 2px 6px)` })}
      {[0, 1, 2].map((k) => caja({ left: "16px", top: `${7 + k * 10}px`, width: "6px", height: "6px", borderRadius: "50%", background: C.hecho }))}
      {caja({ left: "56px", top: "12px", width: "64px", height: "4px", background: C.hecho })}
      {caja({ left: "56px", top: "24px", width: "44px", height: "4px", background: C.hecho })}
      {caja({ right: "10px", top: "10px", width: "20px", height: "20px", borderRadius: "50%", border: TRAZO })}
    </span>
  );
}

/* El borde discontinuo de la cuarta factura: guiones de 4, huecos de 3. */
const discontinuo = (lado) => {
  const dir = lado === "top" || lado === "bottom" ? "to right" : "to bottom";
  return `repeating-linear-gradient(${dir}, ${C.hecho} 0 4px, transparent 4px 7px)`;
};

/* Cartera · las facturas. */
function Facturas() {
  return (
    <span data-silueta="facturas" style={{ display: "flex", gap: "10px" }}>
      {[0, 1, 2, 3].map((k) => {
        const ultima = k === 3;
        const barras = ultima ? 0.5 : 1;
        return (
          <span
            key={k}
            style={{
              position: "relative", display: "block", width: "30px", height: "44px", boxSizing: "border-box", borderRadius: "3px",
              ...(ultima
                ? {
                  backgroundImage: [discontinuo("top"), discontinuo("bottom"), discontinuo("left"), discontinuo("right")].join(", "),
                  backgroundSize: "100% 2px, 100% 2px, 2px 100%, 2px 100%",
                  backgroundPosition: "top left, bottom left, top left, top right",
                  backgroundRepeat: "no-repeat",
                }
                : { border: TRAZO }),
            }}
          >
            {caja({ left: "4px", top: "6px", width: "18px", height: "4px", background: C.hecho, opacity: barras })}
            {caja({ left: "4px", top: "14px", width: "12px", height: "4px", background: C.hecho, opacity: barras })}
            {caja({ left: "4px", bottom: "6px", width: "18px", height: "4px", background: C.hecho, opacity: barras })}
          </span>
        );
      })}
    </span>
  );
}

/* Inventarios · la bodega: repisas en y = 22 e y = 46, 7 cajas arriba y 5 abajo. */
function Bodega() {
  const fila = (n, abajo) => Array.from({ length: n }, (_, k) =>
    caja({ left: `${8 + k * 18}px`, top: `${abajo - 14}px`, width: "14px", height: "14px", borderRadius: "2px", background: C.hecho }));
  return (
    <span data-silueta="bodega" style={{ position: "relative", display: "block", width: "200px", height: "48px" }}>
      {caja({ left: 0, top: 0, width: "2px", height: "48px", background: C.hecho })}
      {caja({ right: 0, top: 0, width: "2px", height: "48px", background: C.hecho })}
      {caja({ left: 0, top: "22px", width: "200px", height: "2px", background: C.hecho })}
      {caja({ left: 0, top: "46px", width: "200px", height: "2px", background: C.hecho })}
      {fila(7, 22)}
      {fila(5, 46)}
    </span>
  );
}

const SILUETAS = { "titulo-valor": TituloValor, facturas: Facturas, bodega: Bodega };
const ANCHO_SILUETA = { "titulo-valor": 168, facturas: 150, bodega: 200 };

function BandaEscena({ escena }) {
  const Silueta = SILUETAS[escena];
  return (
    <div aria-hidden="true" data-banda-escena style={{ height: "72px", borderRadius: "12px", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* La clave es la escena: mismo tema, la silueta no se mueve; tema nuevo, entra. */}
      <div key={escena} className="r5-escena" style={{ height: "48px", display: "flex", alignItems: "center" }}>
        <Silueta />
      </div>
    </div>
  );
}

/* ═══════════ EL PROGRESO ═══════════ */

function Progreso({ actual, total }) {
  return (
    <div data-progreso>
      <p style={{ ...MARCA, margin: 0 }}>{INTERFAZ_R5_1.progreso(actual + 1, total)}</p>
      {/* Los segmentos no dicen acierto ni error. */}
      <div aria-hidden="true" style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
        {Array.from({ length: total }, (_, k) => (
          <span
            key={k}
            data-segmento={k < actual ? "hecho" : k === actual ? "actual" : "pendiente"}
            style={{ flex: 1, height: "4px", borderRadius: "2px", background: k < actual ? C.hecho : k === actual ? C.ambar : C.navy }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════ LOS DATOS DE LAS PANTALLAS 4 Y 5 ═══════════ */

const CONTENEDOR = { background: C.navy, borderRadius: "12px", padding: "4px 16px", marginTop: "16px" };
const DIVISORIA = "1px solid rgba(184,196,212,0.25)";

function ListaDeDatos({ datos }) {
  return (
    <div data-datos="lista" style={CONTENEDOR}>
      {datos.map((d, k) => (
        <div key={d.id} data-dato={d.id} style={{ display: "flex", alignItems: "center", minHeight: "40px", gap: "8px", borderTop: k ? DIVISORIA : "none" }}>
          <span style={{ flex: 1, minWidth: 0, fontFamily: INTER, fontSize: "14px", color: C.atenuado }}>{d.etiqueta}</span>
          <span style={{ width: "96px", flexShrink: 0, textAlign: "right", fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto }}>
            {pesos(d.valor)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Cajas({ n }) {
  return (
    <span aria-hidden="true" data-cajas={n} style={{ display: "flex", gap: "3px" }}>
      {Array.from({ length: n }, (_, k) => (
        <span key={k} style={{ width: "12px", height: "12px", borderRadius: "2px", background: C.hecho, flexShrink: 0 }} />
      ))}
    </span>
  );
}

function BloqueDeLotes({ lotes, vendidas }) {
  return (
    <div data-datos="lotes" style={CONTENEDOR}>
      {lotes.map((l, k) => (
        <div key={l.marca} data-lote={k + 1} style={{ minHeight: "48px", padding: "6px 0", boxSizing: "border-box", borderTop: k ? DIVISORIA : "none" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
            <span style={MARCA}>{l.marca}</span>
            <span style={{ fontFamily: INTER, fontSize: "14px", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: C.texto, whiteSpace: "nowrap" }}>
              {INTERFAZ_R5_1.unidadesACosto(l.unidades, l.costo)}
            </span>
          </div>
          <div style={{ marginTop: "6px" }}><Cajas n={l.unidades / UNIDADES_POR_CAJA} /></div>
        </div>
      ))}
      <div style={{ borderTop: DIVISORIA, minHeight: "40px", display: "flex", alignItems: "center", fontFamily: INTER, fontSize: "14px", fontWeight: 600, color: C.texto }}>
        {INTERFAZ_R5_1.vendidas(vendidas)}
      </div>
      <p style={{ margin: "0 0 8px", fontFamily: INTER, fontSize: "12px", color: C.atenuado }}>{INTERFAZ_R5_1.leyendaCajas}</p>
    </div>
  );
}

/* ═══════════ EL CONTENIDO DE UNA OPCIÓN, SEGÚN SU FORMA ═══════════ */

/* Sin teal ni ámbar en los renglones: no chocan con los estados de la opción. */
function Asiento({ asiento }) {
  return (
    <span data-asiento style={{ display: "block" }}>
      <span style={{ ...MARCA, display: "block" }}>{INTERFAZ_R5_1.marcaDebe}</span>
      <span data-renglon="debe" style={{ display: "block", color: C.texto }}>{asiento.debe}</span>
      <span style={{ display: "block", marginTop: "10px", paddingLeft: "16px" }}>
        <span style={{ ...MARCA, display: "block" }}>{INTERFAZ_R5_1.marcaHaber}</span>
        <span data-renglon="haber" style={{ display: "block", color: C.texto }}>{asiento.haber}</span>
      </span>
    </span>
  );
}

const TRES_COLUMNAS = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" };

function Celdas({ celdas }) {
  return (
    <span data-celdas style={TRES_COLUMNAS}>
      {celdas.map((c, k) => (
        <span key={k} style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, color: C.texto }}>{c}</span>
      ))}
    </span>
  );
}

/*
 * La cabecera de la pantalla 3, alineada con las celdas: el relleno de Opcion
 * (15) más su borde (1), el marcador (18) y su hueco (12) van a la izquierda.
 */
function CabeceraDeTabla({ columnas }) {
  return (
    <div data-cabecera-tabla aria-hidden="true" style={{ ...TRES_COLUMNAS, minHeight: "36px", alignItems: "end", padding: "0 16px 0 46px", marginTop: "16px", boxSizing: "border-box" }}>
      {columnas.map((c) => <span key={c} style={{ fontFamily: INTER, fontSize: "12px", color: C.atenuado }}>{c}</span>)}
    </div>
  );
}

function ContenidoDeOpcion({ pantalla, opcion }) {
  if (opcion.asiento) return <Asiento asiento={opcion.asiento} />;
  if (opcion.celdas) return <Celdas celdas={opcion.celdas} />;
  if (opcion.valor !== undefined) {
    return <span style={{ fontFamily: INTER, fontSize: "15px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{pesos(opcion.valor)}</span>;
  }
  return <span>{textoDeOpcion(pantalla, opcion)}</span>;
}

/* ═══════════ EL BLOQUE «POR TEMA» DEL FINAL ═══════════ */

function PorTema({ filas }) {
  return (
    <div data-por-tema style={{ marginTop: "8px" }}>
      <p style={{ ...MARCA, margin: "0 0 8px" }}>{INTERFAZ_R5_1.porTema}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filas.map((f) => {
          const Silueta = SILUETAS[f.escena];
          const ancho = ANCHO_SILUETA[f.escena] * 0.45;
          return (
            <div key={f.id} data-fila-tema={f.id} style={{ minHeight: "72px", background: C.navy, borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", padding: "0 16px", boxSizing: "border-box" }}>
              {/* La silueta del tema al 45 %. */}
              <span aria-hidden="true" style={{ width: `${ancho}px`, height: "22px", flexShrink: 0, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, top: 0, transform: "scale(0.45)", transformOrigin: "left top" }}><Silueta /></span>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: INTER, fontSize: "15px", fontWeight: 600, color: C.texto }}>{f.nombre}</p>
                {/*
                  El total va en palabras: el «n de m» de la derecha. Cada punto lleva
                  forma además de color: relleno si acertó, anillo (solo borde) si
                  falló. Así quien no distingue teal de coral sabe CUÁLES acertó, no
                  solo cuántas. Los puntos siguen aria-hidden: el lector oye el «n de m».
                */}
                <div aria-hidden="true" style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                  {f.puntos.map((p) => (
                    <span
                      key={p.id}
                      data-punto={p.ok ? "acierto" : "error"}
                      data-forma={p.ok ? "relleno" : "anillo"}
                      style={{
                        width: "10px", height: "10px", borderRadius: "50%", boxSizing: "border-box",
                        ...(p.ok ? { background: C.teal } : { background: "transparent", border: `2px solid ${C.coral}` }),
                      }}
                    />
                  ))}
                </div>
              </div>
              <span data-n-de-m style={{ fontFamily: SORA, fontSize: "17px", fontWeight: 700, color: C.texto, whiteSpace: "nowrap" }}>
                {INTERFAZ_R5_1.nDeM(f.bien, f.total)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════ r5-1 «REPASO CRUZADO» ═══════════ */

/*
 * Seis pantallas en el orden del libro, un toque por pantalla. Las opciones se
 * barajan en cada intento (`prepararR5_1`). Al terminar:
 * onCompletar(pct, ms, detalle), con el detalle de useTanda: una fila por
 * pantalla, con la opción elegida cuando falló.
 */
export function RepasoCruzado({ onCompletar, pantallas = null }) {
  const [tanda, setTanda] = useState(() => pantallas ?? prepararR5_1());
  const [i, setI] = useState(0);
  const [r, setR] = useState(null);
  const [resultados, setResultados] = useState({});
  const [terminado, setTerminado] = useState(false);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const boton = useRef(null);
  const enunciado = useRef(null);

  const pantalla = tanda[i];
  const total = tanda.length;
  const bien = Object.values(resultados).filter(Boolean).length;

  useEffect(() => {
    if (terminado) onCompletar?.(puntuarR5_1(bien, total), Date.now() - inicio.current, detalle.current);
  }, [terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r) boton.current?.focus(); }, [r]);

  const elegir = (opcionId) => {
    if (r) return;
    const nuevo = evaluarR5_1(pantalla, opcionId);
    detalle.current.push({ item: pantalla.id, ok: nuevo.ok, intentos: 1, respuesta: nuevo.ok ? null : opcionId, orden: detalle.current.length + 1 });
    setResultados((x) => ({ ...x, [pantalla.id]: nuevo.ok }));
    setR(nuevo);
  };

  const siguiente = () => {
    setR(null);
    if (i + 1 < total) { setI(i + 1); requestAnimationFrame(() => enunciado.current?.focus()); }
    else setTerminado(true);
  };

  const reiniciar = () => {
    setTanda((antes) => prepararR5_1(antes));
    setI(0); setR(null); setResultados({}); setTerminado(false);
    detalle.current = []; inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <div data-r5-1 data-cierre>
        <style>{CSS_JUEGO + CSS_R5}</style>
        <PorTema filas={porTema(resultados)} />
        <Cierre pct={Math.round(puntuarR5_1(bien, total))} onReiniciar={reiniciar} />
      </div>
    );
  }

  const estadoDe = (o) => {
    if (!r) return null;
    if (o.id === r.elegida) return r.ok ? "correcta" : "incorrecta";
    if (o.id === r.correcta) return "revelada";
    return null;
  };

  return (
    <div data-r5-1 data-pantalla={pantalla.id}>
      <style>{CSS_JUEGO + CSS_R5}</style>
      <p data-objetivo style={{ margin: "0 0 16px", fontFamily: INTER, fontSize: "14px", lineHeight: 1.5, color: C.atenuado }}>{R5_1.objetivo}</p>
      <Progreso actual={i} total={total} />
      <div style={{ marginTop: "16px" }}><BandaEscena escena={SUBTEMAS[pantalla.subtema].escena} /></div>
      <p ref={enunciado} tabIndex={-1} data-enunciado style={{ margin: "20px 0 0", fontFamily: INTER, fontSize: "17px", lineHeight: "26px", fontWeight: 600, color: C.texto, outline: "none" }}>
        {pantalla.enunciado}
      </p>
      {pantalla.datos && <ListaDeDatos datos={pantalla.datos} />}
      {pantalla.lotes && <BloqueDeLotes lotes={pantalla.lotes} vendidas={pantalla.vendidas} />}
      {pantalla.columnas && <CabeceraDeTabla columnas={pantalla.columnas} />}
      <Opciones columnas="1fr">
        {pantalla.opciones.map((o) => (
          <div key={o.id} data-opcion={o.id}>
            <Opcion ancho estado={estadoDe(o)} deshabilitada={Boolean(r)} onClick={() => elegir(o.id)}>
              <ContenidoDeOpcion pantalla={pantalla} opcion={o} />
            </Opcion>
          </div>
        ))}
      </Opciones>
      <Devolucion r={r && { ok: r.ok, textos: [r.texto] }} lector={LECTOR_R5_1} />
      {r && <BotonSiguiente onClick={siguiente} botonRef={boton} texto={INTERFAZ_R5_1.siguiente} />}
    </div>
  );
}

/* Lo que se puede abrir desde el camino. Una prueba lo compara con el catálogo. */
export const JUEGOS_REPASO_CAP5 = [
  { id: R5_1.id, Mecanica: RepasoCruzado, titulo: R5_1.nombre },
  { id: R5_2.id, Mecanica: ToroNegro, titulo: R5_2.nombre },
  { id: R5_3.id, Mecanica: Mate, titulo: R5_3.nombre },
];

/* ═══════════ LA VISTA DEL TEMA ═══════════ */

export default function RepasoCapitulo5View({ nodoInicial = null, onBack }) {
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA_REPASO_CAP5);
  const [nodoAbierto, setNodoAbierto] = useState(nodoInicial ?? null);
  const hechas = useCompletadas();
  const { pedirCuenta } = useAuth();
  const [recompensa, celebrar, celebrando] = useRecompensa();
  const resumen = useResumenDePartida(MATERIA, celebrando);
  const nodos = conIcono(nodosDe(actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente), hechas));
  const juego = JUEGOS_REPASO_CAP5.find((j) => j.id === nodoAbierto) ?? null;

  const completar = async (actividadId, porcentaje, duracionMs, detalle = null) => {
    const clas = clasificacionDe(MATERIA, TEMA_REPASO_CAP5, actividadId);
    celebrar(clas?.dificultad, actividadId);
    const res = await resumen.registrar({ actividadId, clasificacion: clas, pct: porcentaje, detalle }, () =>
      registrarActividadCompletada(clas, {
        materiaId: MATERIA, temaId: TEMA_REPASO_CAP5, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,
      }));
    if (res?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  return (
    <FondoMateria materiaId={MATERIA}>
      <div style={{
        minHeight: "100vh", backgroundColor: "transparent", fontFamily: INTER, color: FAE.text,
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
            <h1 style={{ fontFamily: SORA, fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2 }}>
              {tema.title}
            </h1>
          </div>

          {recompensa}
          <div className="fae-insignia-actividad"><ActivityBadge tipo={HACER} size="sm" /></div>

          {juego ? (
            <div>
              <button
                type="button"
                onClick={() => { resumen.limpiar(); setNodoAbierto(null); }}
                style={{
                  marginBottom: "16px", padding: "8px 14px", borderRadius: "999px",
                  background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.14)",
                  color: FAE.text, cursor: "pointer", fontFamily: SORA, fontSize: "12.5px",
                }}
              >
                ‹ Volver al camino
              </button>
              <ContextoResumen.Provider value={resumen.contexto(juego.id, () => setNodoAbierto(null))}>
                <juego.Mecanica key={juego.id} onCompletar={(pct, ms, detalle) => completar(juego.id, pct, ms, detalle)} />
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
