import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
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
import { BOTON, PIEZA_LA_CAJA } from "../data/contabilidadT4.js";
import { PIEZA_EL_ACTIVO_CORRIENTE } from "../data/contabilidadT4A0.js";
import { PIEZA_EL_FONDO_FIJO } from "../data/contabilidadT4A2.js";
import { PIEZA_EL_ARQUEO } from "../data/contabilidadT4A3.js";
import { PIEZA_BANCOS_Y_NOTAS } from "../data/contabilidadT4A4.js";
import { PIEZA_SAN_CALIXTO } from "../data/contabilidadT4A5.js";
import { H1 } from "../data/contabilidadT4H1.js";
import { CSS_T4R, cifra, SeguirAprender } from "./t4/comun.jsx";
import { CSS_CAJON } from "./t4/Cajon.jsx";
import { CSS_ANO, CuerpoA0 } from "./t4/AnoEnMarcha.jsx";
import { CSS_A1, CuerpoA1 } from "./t4/LaCaja.jsx";
import { CSS_TABLERO } from "./t4/tablero.jsx";
import { CSS_REGLA } from "./t4/Regla.jsx";
import { CSS_APRENDER } from "./t4/aprender.jsx";
import { CSS_A2, CuerpoA2 } from "./t4/A2ElFondoFijo.jsx";
import { CSS_A3, CuerpoA3 } from "./t4/A3ElArqueo.jsx";
import { CSS_A4, CuerpoA4 } from "./t4/A4BancosYNotas.jsx";
import { CSS_A5, CuerpoA5 } from "./t4/A5SanCalixto.jsx";
import { CasoT4, casoInicial } from "./t4/caso.js";
import EntraOSaleDeCaja from "./t4/EntraOSaleDeCaja.jsx";
import SeMueveLaCajaMenor from "./t4/SeMueveLaCajaMenor.jsx";
import ElArqueo from "./t4/ElArqueo.jsx";
import ConciliaLaCuenta from "./t4/ConciliaLaCuenta.jsx";
import SeAsientaONo from "./t4/SeAsientaONo.jsx";
import { H3 } from "../data/contabilidadT4H3.js";
import { H4 } from "../data/contabilidadT4H4.js";
import { H7 } from "../data/contabilidadT4H7.js";
import { H8 } from "../data/contabilidadT4H8.js";
import SecuenciaAprender from "./secuencia/SecuenciaAprender.jsx";
import { ALTO_FIGURA_T4, CSS_SLIDES } from "./t4/slides/comun.jsx";
import { CSS_SLIDES_A0, piezaSlidesA0 } from "./t4/slides/A0.jsx";
import { CSS_SLIDES_A1, piezaSlidesA1 } from "./t4/slides/A1.jsx";
import { CSS_SLIDES_A2, piezaSlidesA2 } from "./t4/slides/A2.jsx";
import { CSS_SLIDES_A3, piezaSlidesA3 } from "./t4/slides/A3.jsx";
import { CSS_SLIDES_A4, piezaSlidesA4 } from "./t4/slides/A4.jsx";
import { CSS_SLIDES_A5, piezaSlidesA5 } from "./t4/slides/A5.jsx";

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
 * figuras y los Hacer (H1, H3, H4, H7 y H8) viven en src/components/t4/
 * (rediseño de enganche, B1-B5).
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

/*
 * LOS SLIDES (#488): T4 Aprender va sobre SecuenciaAprender, una pieza tras
 * otra en el orden de `numero`. `crear(caso)` da la pieza del caso (D8) con
 * sus figuras. PIEZAS_T4 y PantallasT4 se quedan (no se borra nada), pero la
 * vista ya no las pinta.
 */
export const SLIDES_T4 = [
  { numero: PIEZA_EL_ACTIVO_CORRIENTE.numero, id: PIEZA_EL_ACTIVO_CORRIENTE.id, crear: piezaSlidesA0, css: CSS_SLIDES_A0 },
  { numero: PIEZA_LA_CAJA.numero, id: PIEZA_LA_CAJA.id, crear: piezaSlidesA1, css: CSS_SLIDES_A1 },
  { numero: PIEZA_EL_FONDO_FIJO.numero, id: PIEZA_EL_FONDO_FIJO.id, crear: piezaSlidesA2, css: CSS_SLIDES_A2 },
  { numero: PIEZA_EL_ARQUEO.numero, id: PIEZA_EL_ARQUEO.id, crear: piezaSlidesA3, css: CSS_SLIDES_A3 },
  { numero: PIEZA_BANCOS_Y_NOTAS.numero, id: PIEZA_BANCOS_Y_NOTAS.id, crear: piezaSlidesA4, css: CSS_SLIDES_A4 },
  { numero: PIEZA_SAN_CALIXTO.numero, id: PIEZA_SAN_CALIXTO.id, crear: piezaSlidesA5, css: CSS_SLIDES_A5 },
].filter((s) => s.crear).sort((a, b) => a.numero - b.numero);
const CSS_SEC = CSS_SLIDES + SLIDES_T4.map((s) => s.css).join("");

/*
 * Para el banco común (scripts/banco.mjs, #583): las piezas de los slides en
 * el caso 1, las mismas que pinta la vista, con su CSS. El banco monta
 * SecuenciaAprender sin el envoltorio `.t4-sec`, así que la regla del alto de
 * la figura va también por la clave del tema.
 */
export const PIEZAS_T4_SLIDES = SLIDES_T4.map((s) => ({ ...s.crear(1), altoFigura: ALTO_FIGURA_T4 }));
export const CSS_T4_SLIDES = `${CSS_SEC}[data-secuencia^="${TEMA_T4}"] .fae-sec-figura { height: auto; }`;

/* La clave de lo guardado en la pestaña lleva el caso de cada pieza (§5.2 de Ukyo: tema/pieza/caso). */
export const temaIdSlides = (casos) => `${TEMA_T4}/${SLIDES_T4.map((s) => casos[s.id] ?? 1).join("")}`;

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
  const [nodoAbierto, setNodoAbierto] = useState(nodoInicial ?? null);
  /* D8: el caso de cada pieza de Aprender, elegido al abrir la vista (el 1 la primera vez; al repetir, sorteo). */
  const [casos] = useState(() => Object.fromEntries(PIEZAS_T4.map(({ pieza }) => [pieza.id, casoInicial(pieza.id)])));
  const [slides] = useState(() => SLIDES_T4.map((s) => ({ ...s.crear(casos[s.id]), altoFigura: ALTO_FIGURA_T4 })));
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
              El título rompe en dos renglones antes que perder palabras, y eso
              ya NO se arregla aquí: lo hace la hoja compartida de
              AccountControl.jsx para toda `.fae-cabecera-titulo > h1`. Esta
              vista tenía el rodeo en línea —y otras seis el mismo— porque la
              hoja ponía `nowrap`. Ya no lo pone.

              Los estilos en línea que quedan son tipografía, y solo eso: si
              alguno volviera a tocar cómo cede el título, estaría peleándose
              con lo compartido, y ganaría el de aquí, que es justo lo que no
              se quiere.
            */}
            <h1 data-titulo-tema style={{
              fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2,
            }}>
              {tema.title}
            </h1>
          </div>

          {recompensa}
          <div className="fae-insignia-actividad"><ActivityBadge tipo={esAprender ? APRENDER : HACER} size="sm" /></div>

          {esAprender ? (
            <div className="t4-sec" data-slides-t4>
              <style>{CSS_SEC}</style>
              <SecuenciaAprender temaId={temaIdSlides(casos)} piezas={slides} final="tema" onFinal={onBack} />
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
 * A0-A5 y lote B): el texto de antes (en las P0, ninguno: la pieza abre con el
 * objeto, capa 1), la figura con lo que el estudiante hace en ella, el texto
 * de después, la frase de cierre, «Siguiente…», «Seguir» y el pie. Es
 * Aprender: no califica ni da FP. No hay pantalla de resumen en lista: la
 * frase de cierre queda pegada al modelo en su estado final (capa 4).
 *
 * Lo que una pantalla puede traer, además de `antes` y `despues`:
 *   · `despuesConAccion`: [{ texto, con }] textos que aparecen con la primera
 *     acción del cuerpo (`onAccion(clave)`; `con` es la clave, o «accion»
 *     para cualquiera). Reservan su alto desde el principio: nada se mueve
 *   · `cierre`: la frase de cierre. Con `cierreAl: "llegar"` se ve desde el
 *     principio; si no, aparece cuando el cuerpo llama a `onCierre()`. Con
 *     `cierreEnCuerpo`, la pinta el cuerpo (A1, en el hueco del control)
 *   · `siguiente`: va debajo de la frase y aparece con ella
 *   · `rotuloAccion`: el rótulo de instrucción, que pinta el cuerpo sobre su
 *     control, dentro de la figura
 *
 * EN UNA PANTALLA CON PREGUNTA (`pregunta: true`), «SEGUIR» NO APARECE HASTA
 * EL ACIERTO (regla D7 del canon; decisión de Yujiro, que manda sobre el §2.4
 * de Hanayama). Las opciones siguen activas tras el error: reintentar es
 * volver a tocar. El cuerpo avisa del acierto con `onAcierto`, y una vez
 * acertada la pantalla, «Seguir» se queda.
 *
 * Lo propio de cada pieza es su cuerpo, en src/components/t4/: CuerpoA0 («El
 * año en marcha»), CuerpoA1 (el cajón operable), CuerpoA2 (el sobre y el
 * libro), CuerpoA3 (el sobre con la regla del fondo), CuerpoA4 (Bancos y las
 * dos libretas) y CuerpoA5 (el par que se iguala). Clases `t4r-`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CUERPOS = {
  [PIEZA_EL_ACTIVO_CORRIENTE.id]: CuerpoA0,
  [PIEZA_LA_CAJA.id]: CuerpoA1,
  [PIEZA_EL_FONDO_FIJO.id]: CuerpoA2,
  [PIEZA_EL_ARQUEO.id]: CuerpoA3,
  [PIEZA_BANCOS_Y_NOTAS.id]: CuerpoA4,
  [PIEZA_SAN_CALIXTO.id]: CuerpoA5,
};
const CSS_PANTALLAS = CSS_T4R + CSS_CAJON + CSS_ANO + CSS_A1 + CSS_TABLERO + CSS_REGLA + CSS_APRENDER + CSS_A2 + CSS_A3 + CSS_A4 + CSS_A5;

const TextosR = ({ lista }) => (lista ?? []).map((t) => <p key={t} className="t4r-p" data-texto>{t}</p>);

/*
 * Un texto que aparece después (con la acción, o la frase de cierre): reserva
 * su alto desde el principio con una copia invisible (visibility: hidden y
 * aria-hidden), así que nada se mueve, y al aparecer entra con el fundido de
 * 120 ms en una región viva. Con movimiento reducido, sin fundido (CSS_T4R).
 */
export function Reservado({ visible, children, clase = "t4r-p", ...datos }) {
  return (
    <div className="t4r-reserva" {...datos} data-visible={visible ? "" : undefined}>
      <p className={`${clase} t4r-fantasma`} aria-hidden="true">{children}</p>
      <p className={`${clase}${visible ? " t4r-nueva" : ""}`} aria-live="polite" data-texto={visible ? "" : undefined}>{visible ? children : null}</p>
    </div>
  );
}

/* Una pantalla: lo que se ve con la acción y la frase de cierre se olvidan al cambiar de pantalla (va con `key`). */
function PantallaT4({ p, Cuerpo, onAcierto, seguirBoton }) {
  const [hechas, setHechas] = useState(() => new Set());
  const [cerrada, setCerrada] = useState(p.cierreAl === "llegar");
  const refCierre = useRef(null);
  const onAccion = (clave = "accion") => setHechas((h) => (h.has(clave) ? h : new Set([...h, clave])));
  const onCierre = () => setCerrada(true);
  /* E2: cuando aparece la frase de cierre (y «Siguiente»), la vista baja lo justo para que se vean enteras. */
  useEffect(() => {
    if (!cerrada || p.cierreAl === "llegar") return;
    const el = refCierre.current;
    const V = el?.ownerDocument?.defaultView;
    const quieto = V?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    el?.scrollIntoView?.({ block: "nearest", behavior: quieto ? "auto" : "smooth" });
  }, [cerrada]); // eslint-disable-line react-hooks/exhaustive-deps
  const conCierre = Boolean(p.cierre);
  const verSiguiente = conCierre ? cerrada : true;
  return (
    <div className="t4r" key={p.id}>
      <TextosR lista={p.antes} />
      <Cuerpo p={p} onAcierto={onAcierto} onAccion={onAccion} onCierre={onCierre} cerrada={cerrada} />
      <TextosR lista={p.despues} />
      {(p.despuesConAccion ?? []).map((x) => (
        <Reservado key={x.texto} visible={hechas.has(x.con ?? "accion") || (!x.con && hechas.size > 0)} data-con-accion={x.con ?? "accion"}>{x.texto}</Reservado>
      ))}
      {(conCierre || p.siguiente) && (
        <div ref={refCierre} className="t4r-cierre" data-bloque-cierre>
          {conCierre && !p.cierreEnCuerpo && <Reservado visible={cerrada} data-cierre>{p.cierre}</Reservado>}
          {p.siguiente && (conCierre
            ? <Reservado visible={verSiguiente} clase="t4r-sig" data-siguiente>{p.siguiente}</Reservado>
            : <p className="t4r-sig" data-texto data-siguiente>{p.siguiente}</p>)}
        </div>
      )}
      {seguirBoton}
      {p.pie && <p className="t4r-pie" data-pie>{p.pie}</p>}
    </div>
  );
}

export function PantallasT4({ pieza: base, rotulo, caso = 1, onTerminada = null }) {
  /* D8: en el caso 2, la pieza del caso B (mismas pantallas y la misma decisión; otras cifras y nombres). */
  const pieza = caso === 2 && base.casoB ? base.casoB : base;
  const [k, setK] = useState(0);
  const p = pieza.pantallas[k];
  const ultima = k === pieza.pantallas.length - 1;
  const marco = useRef(null);
  const primera = useRef(true);
  const seguir = () => setK((x) => Math.min(x + 1, pieza.pantallas.length - 1));
  useEffect(() => { if (primera.current) { primera.current = false; return; } marco.current?.focus(); }, [k]);
  const Cuerpo = CUERPOS[base.id];
  useEffect(() => { if (ultima) onTerminada?.(); }, [ultima]); // eslint-disable-line react-hooks/exhaustive-deps
  /* La pantalla en la que ya se acertó (se olvida al cambiar de pantalla, porque cambia `k`). */
  const [acertada, setAcertada] = useState(-1);
  const puedeSeguir = !p.pregunta || acertada === k;
  /*
   * E2 (Shibukawa): al dar el veredicto, la vista baja lo justo para que la
   * devolución (`[data-mensaje]`, la de cualquier cuerpo, A0-A5) quede entera
   * en la ventana; a 320×568 caía debajo del borde. Sin animación si el
   * movimiento está reducido. Lo mide en el navegador scripts/t4/guardia-enganche.mjs.
   */
  useEffect(() => {
    const raiz = marco.current;
    const V = raiz?.ownerDocument?.defaultView;
    if (!V?.MutationObserver) return undefined;
    const mostrar = (el) => {
      const quieto = V.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      el.scrollIntoView?.({ block: "nearest", behavior: quieto ? "auto" : "smooth" });
    };
    const obs = new V.MutationObserver((cambios) => {
      for (const c of cambios) {
        for (const n of c.addedNodes) {
          if (n.nodeType !== 1) continue;
          const m = n.matches("[data-mensaje]") ? n : n.querySelector("[data-mensaje]");
          if (m) { mostrar(m); return; }
        }
      }
    });
    obs.observe(raiz, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  return (
    <CasoT4.Provider value={pieza === base ? 1 : 2}>
    <Panel rotulo={rotulo} titulo={pieza.titulo}>
      <style>{CSS_PANTALLAS}</style>
      <div ref={marco} tabIndex={-1} data-pieza={base.id} data-pantalla={p.id} data-caso-pieza={pieza === base ? "1" : "2"} style={{ outline: "none" }}>
        {/* D2: el objetivo de la pieza, fijo bajo el título, solo en la P0 (Shibukawa; Yujiro; texto de Katsumi). */}
        {k === 0 && pieza.objetivo && <p className="t4r-objetivo" data-objetivo>{pieza.objetivo}</p>}
        <PantallaT4 key={p.id} p={p} Cuerpo={Cuerpo} onAcierto={() => setAcertada(k)}
          seguirBoton={!ultima && puedeSeguir ? <SeguirAprender nueva onClick={seguir}>{pieza.boton ?? BOTON.seguir}</SeguirAprender> : null} />
      </div>
    </Panel>
    </CasoT4.Provider>
  );
}
