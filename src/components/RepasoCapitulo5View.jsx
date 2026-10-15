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
import { CSS_JUEGO, Cierre } from "./mecanicas/corazon/juego.jsx";
import { C, INTER, SORA, MARCA, Devolucion, BotonSiguiente } from "./repasoCap5/comun.jsx";
import { ToroNegro } from "./repasoCap5/ToroNegro.jsx";
import { OpcionesTitulo } from "./repasoCap5/OpcionesTitulo.jsx";
import { Flujos } from "./repasoCap5/Flujos.jsx";
import { MayorCompacto } from "./repasoCap5/MayorCompacto.jsx";
import { Latas } from "./repasoCap5/Latas.jsx";
import { Fichas } from "./repasoCap5/Fichas.jsx";
import { Lotes } from "./repasoCap5/Lotes.jsx";
import { R5_2 } from "../data/repasoCap5ToroNegroTextos.js";
import {
  R5_1, INTERFAZ_R5_1, PENDIENTE_DE_REVISION_R5_1, SUBTEMAS, ORDEN_SUBTEMAS,
  prepararR5_1, puntuarR5_1, porTema, textoDeOpcion, renglonesDeAsiento, mayorTrasAsiento,
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
 * r5-1 «Repaso cruzado» v2 (paquete e5-r5-1-v2): aquí van la cabecera, la
 * pista, el orden de las pantallas y el final POR TEMA; las mecánicas (la
 * opción propia, los flujos, el mayor compacto, las latas, las fichas, los
 * lotes) viven en repasoCap5/. De corazon/juego.jsx solo se usan el Cierre y
 * su CSS, sin tocarlos: su `Opcion` pinta el acierto en teal, que en
 * Contabilidad es DEBE (decisión 2). Nada de mecanicas/libros/t7, que es de la
 * Célula C.
 *
 * Sin Marco: el paquete mide la pantalla con el ancho de contenido de la
 * vista (343 a 375 px, 288 a 320), sin el relleno de un panel encima.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
export const TEMA_REPASO_CAP5 = "repaso-capitulo-5";

const LECTOR_R5_1 = { acierto: PENDIENTE_DE_REVISION_R5_1.lectorAcierto, error: PENDIENTE_DE_REVISION_R5_1.lectorError };

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
const ALTO_SILUETA = { "titulo-valor": 44, facturas: 44, bodega: 48 };

/* ═══════════ LA CABECERA: «PREGUNTA n DE 6» Y LA SILUETA DEL TEMA AL 50 % ═══════════ */

/*
 * v2 (§0): sale la banda de escena de 72 px de v1. Queda un renglón de 40 px
 * con la marca a la izquierda y la silueta del tema a la mitad a la derecha
 * (título 84 × 22, facturas 75 × 22, bodega 100 × 24).
 */
function Cabecera({ actual, total, escena }) {
  const Silueta = SILUETAS[escena];
  return (
    <div data-cabecera-r5 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "40px", gap: "12px" }}>
      <p data-progreso style={{ ...MARCA, margin: 0 }}>{INTERFAZ_R5_1.progreso(actual + 1, total)}</p>
      <span aria-hidden="true" data-silueta-cabecera={escena} style={{ position: "relative", width: `${ANCHO_SILUETA[escena] / 2}px`, height: `${ALTO_SILUETA[escena] / 2}px`, flexShrink: 0 }}>
        <span style={{ position: "absolute", left: 0, top: 0, transform: "scale(0.5)", transformOrigin: "left top" }}><Silueta /></span>
      </span>
    </div>
  );
}

/*
 * v1.3 · LA PISTA, A PEDIDO. Se pide con un botón antes de responder, debajo
 * de la interacción (decisión 7 de v2: nunca encima de la figura); no quita
 * FP (la nota es «bien a la primera», y la pista no es un intento). Al
 * responder se va: la devolución ocupa su sitio.
 */
function Pista({ texto, abierta, onAbrir }) {
  if (!abierta) {
    return (
      <button
        type="button"
        data-ver-pista
        aria-expanded="false"
        onClick={onAbrir}
        style={{
          marginTop: "16px", minHeight: "44px", padding: "0 16px", borderRadius: "999px",
          background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.22)",
          color: C.texto, cursor: "pointer", fontFamily: INTER, fontSize: "14px", fontWeight: 600,
        }}
      >
        {INTERFAZ_R5_1.verPista}
      </button>
    );
  }
  return (
    <div data-pista style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "12px", background: C.navy, borderLeft: `3px solid ${C.hecho}` }}>
      <p style={{ ...MARCA, margin: "0 0 4px" }}>{INTERFAZ_R5_1.marcaPista}</p>
      <p style={{ margin: 0, fontFamily: INTER, fontSize: "14px", lineHeight: 1.5, color: C.texto }}>{texto}</p>
    </div>
  );
}

/* Las opciones de asiento: «Debita …» / «Acredita …», cada renglón puede partir. */
function RenglonesDeAsiento({ asiento }) {
  const [debita, acredita] = renglonesDeAsiento(asiento);
  return (
    <span data-asiento style={{ display: "block" }}>
      <span data-renglon="debe" style={{ display: "block" }}>{debita}</span>
      <span data-renglon="haber" style={{ display: "block" }}>{acredita}</span>
    </span>
  );
}

/* La mecánica de cada pantalla, según su forma. */
function Mecanica({ pantalla, onCalificar }) {
  const p = pantalla;
  if (p.forma === "flujos") {
    return (
      <OpcionesTitulo
        opciones={p.opciones}
        etiqueta={(o) => textoDeOpcion(p, o)}
        contenido={(o) => <span>{o.texto}</span>}
        figura={(o, clave, onTerminar) => <Flujos flujo={o?.flujo ?? null} clave={clave} onTerminar={onTerminar} />}
        onCalificar={onCalificar}
      />
    );
  }
  if (p.forma === "asiento") {
    return (
      <OpcionesTitulo
        opciones={p.opciones}
        etiqueta={(o) => textoDeOpcion(p, o)}
        contenido={(o) => <RenglonesDeAsiento asiento={o.asiento} />}
        figura={(o, clave, onTerminar) => (
          <MayorCompacto
            cuentas={o ? mayorTrasAsiento(p.mayor, o.asiento, p.valor) : p.mayor.map((c) => ({ ...c, nueva: false, entra: null, saldoNuevo: null }))}
            clave={clave}
            onTerminar={onTerminar}
          />
        )}
        onCalificar={onCalificar}
      />
    );
  }
  if (p.forma === "latas") return <Latas pantalla={p} onCalificar={onCalificar} />;
  if (p.forma === "fichas") return <Fichas pantalla={p} onCalificar={onCalificar} />;
  return <Lotes pantalla={p} onCalificar={onCalificar} />;
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
                        /* B4 de enganche.md: el acierto, relleno neutro; el teal es DEBE en Contabilidad. */
                        ...(p.ok ? { background: C.hecho } : { background: "transparent", border: `2px solid ${C.coral}` }),
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

/* ═══════════ r5-1 «REPASO CRUZADO» v2 ═══════════ */

/*
 * Seis pantallas en el orden del libro, una calificación por pantalla («bien
 * a la primera»). Arriba: relleno 12, la cabecera de 40 px, 8 px y el
 * enunciado (Inter 16/24, peso 600); 16 px y la mecánica. Abajo: «Ver pista»,
 * el panel de devolución y «Siguiente» (§0). Al terminar:
 * onCompletar(pct, ms, detalle), con una fila por pantalla y la respuesta
 * cuando falló (la opción elegida, o la clasificación entera en la 4).
 */
export function RepasoCruzado({ onCompletar, pantallas = null }) {
  const [tanda, setTanda] = useState(() => pantallas ?? prepararR5_1());
  const [i, setI] = useState(0);
  const [r, setR] = useState(null);
  const [pistaAbierta, setPistaAbierta] = useState(false);
  const [resultados, setResultados] = useState({});
  const [terminado, setTerminado] = useState(false);
  const detalle = useRef([]);
  const inicio = useRef(Date.now());
  const boton = useRef(null);
  const enunciado = useRef(null);
  const tarjeta = useRef(null);

  const pantalla = tanda[i];
  const total = tanda.length;
  const bien = Object.values(resultados).filter(Boolean).length;

  useEffect(() => {
    if (terminado) onCompletar?.(puntuarR5_1(bien, total), Date.now() - inicio.current, detalle.current);
  }, [terminado]); // eslint-disable-line react-hooks/exhaustive-deps
  /* E2 de enganche.md: el foco baja a «Siguiente» SIN mover la página; lo que cambia sigue a la vista. */
  useEffect(() => { if (r) boton.current?.focus({ preventScroll: true }); }, [r]);

  const calificar = ({ ok, elegida = null, textos = null, respuesta = null }) => {
    if (r) return;
    const texto = textos ?? [pantalla.opciones.find((o) => o.id === elegida).retro];
    detalle.current.push({ item: pantalla.id, ok, intentos: 1, respuesta: ok ? null : (respuesta ?? elegida), orden: detalle.current.length + 1 });
    setResultados((x) => ({ ...x, [pantalla.id]: ok }));
    setR({ ok, textos: texto });
  };

  const siguiente = () => {
    setR(null);
    setPistaAbierta(false);
    if (i + 1 < total) {
      setI(i + 1);
      requestAnimationFrame(() => {
        const t = tarjeta.current?.getBoundingClientRect();
        if (t && t.top < 0) window.scrollTo?.(0, window.scrollY + t.top);
        enunciado.current?.focus({ preventScroll: true });
      });
    } else setTerminado(true);
  };

  const reiniciar = () => {
    setTanda((antes) => prepararR5_1(antes));
    setI(0); setR(null); setPistaAbierta(false); setResultados({}); setTerminado(false);
    detalle.current = []; inicio.current = Date.now();
  };

  if (terminado) {
    return (
      <div data-r5-1 data-cierre>
        <style>{CSS_JUEGO}</style>
        <PorTema filas={porTema(resultados)} />
        <Cierre pct={Math.round(puntuarR5_1(bien, total))} onReiniciar={reiniciar} />
      </div>
    );
  }

  return (
    <div ref={tarjeta} data-r5-1 data-pantalla={pantalla.id} data-forma={pantalla.forma} style={{ paddingTop: "12px" }}>
      <Cabecera actual={i} total={total} escena={SUBTEMAS[pantalla.subtema].escena} />
      <p ref={enunciado} tabIndex={-1} data-enunciado style={{ margin: "8px 0 0", fontFamily: INTER, fontSize: "16px", lineHeight: "24px", fontWeight: 600, color: C.texto, outline: "none" }}>
        {pantalla.enunciado}
      </p>
      <div data-interaccion style={{ marginTop: "16px" }}>
        <Mecanica key={pantalla.id} pantalla={pantalla} onCalificar={calificar} />
      </div>
      {!r && <Pista key={pantalla.id} texto={pantalla.pista} abierta={pistaAbierta} onAbrir={() => setPistaAbierta(true)} />}
      <Devolucion r={r} lector={LECTOR_R5_1} />
      {r && <BotonSiguiente onClick={siguiente} botonRef={boton} texto={INTERFAZ_R5_1.siguiente} />}
    </div>
  );
}

/* Lo que se puede abrir desde el camino. Una prueba lo compara con el catálogo. */
export const JUEGOS_REPASO_CAP5 = [
  { id: R5_1.id, Mecanica: RepasoCruzado, titulo: R5_1.nombre },
  { id: R5_2.id, Mecanica: ToroNegro, titulo: R5_2.nombre },
];

/*
 * ═══════════ LA PORTADA DEL REPASO ═══════════
 *
 * Autodiagnóstico del 15 de octubre (Erwin a 320 px): con pocas piezas en
 * Hacer, la vista era un nodo arriba y el resto fondo. Es la primera
 * impresión del tema al que se llega cansado, al final del capítulo. La
 * portada dice qué se cruza aquí con las tres siluetas que el estudiante va a
 * volver a ver en las preguntas: el mismo dibujo es el mismo tema.
 */
export function PortadaRepaso() {
  const temas = ORDEN_SUBTEMAS.map((id) => SUBTEMAS[id]);
  return (
    <section data-portada-repaso aria-labelledby="r5-portada-titulo" style={{ background: C.navy, borderRadius: "16px", padding: "18px 16px 16px", margin: "4px 0 20px" }}>
      <p style={{ ...MARCA, margin: 0 }}>{INTERFAZ_R5_1.marcaPortada}</p>
      <p id="r5-portada-titulo" style={{ margin: "6px 0 0", fontFamily: SORA, fontSize: "17px", fontWeight: 700, lineHeight: 1.3, color: C.texto }}>
        {INTERFAZ_R5_1.portada}
      </p>
      <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
        {temas.map((t) => (
          <li key={t.id} data-portada-tema={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <span aria-hidden="true" style={{ height: "28px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <span style={{ transform: `scale(${ESCALA_PORTADA})`, transformOrigin: "center" }}><EscenaSola escena={t.escena} /></span>
            </span>
            <span style={{ fontFamily: INTER, fontSize: "13px", fontWeight: 600, color: C.texto, textAlign: "center" }}>{t.nombre}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/*
 * A 320 cada columna mide 80 px ((288 − 32 − 16) / 3). A 0,38 la silueta más
 * ancha (200 px) queda en 76 y no se recorta; a 0,42 medía 84 y perdía los
 * postes de la bodega (medido en Chromium).
 */
const ESCALA_PORTADA = 0.38;
function EscenaSola({ escena }) {
  const Silueta = SILUETAS[escena];
  return <Silueta />;
}

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
            {/*
              * El nombre del tema no se corta (herramientas.md, 15 oct.): a 320
              * la regla compartida .fae-cabecera-titulo lo truncaba en «Repaso
              * del capít…» y se perdía justo el número. Aquí puede encoger y
              * partir en dos renglones; el estilo en línea gana a la clase.
              */}
            <h1 data-titulo-tema style={{ fontFamily: SORA, fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2, minWidth: 0, flexShrink: 1, whiteSpace: "normal", overflow: "visible", textOverflow: "clip", overflowWrap: "anywhere" }}>
              {/* «capítulo 5» no se separa: si parte, parte antes. */}
              {tema.title.replace(/ (\S+)$/, "\u00a0$1")}
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
            <>
              <PortadaRepaso />
              <CaminoHacer nodos={nodos} onAbrir={(id) => setNodoAbierto(id)} vacio="Este tema todavía no tiene juegos." />
            </>
          )}
        </div>
      </div>
    </FondoMateria>
  );
}
