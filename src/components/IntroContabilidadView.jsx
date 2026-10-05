import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import { useState } from "react";
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
import { FAE as TEMA1_ACENTO } from "../theme.js";
import DesdeDondePreguntan from "./mecanicas/libros/tema1/DesdeDondePreguntan.jsx";
import QueEntroYQueSalio from "./mecanicas/libros/tema1/QueEntroYQueSalio.jsx";
import QueLePasaACadaUno from "./mecanicas/libros/tema1/QueLePasaACadaUno.jsx";
import LaEcuacionEnMovimiento from "./mecanicas/libros/tema1/LaEcuacionEnMovimiento.jsx";
import EnCualEstadoAparece from "./mecanicas/libros/tema1/EnCualEstadoAparece.jsx";
import LaArticulacion from "./mecanicas/libros/tema1/LaArticulacion.jsx";
import DondeSeRompio from "./mecanicas/libros/tema1/DondeSeRompio.jsx";
import { T1_1, T1_2, T1_4, T1_5, T1_6, T1_7, T1_8 } from "../data/contabilidadTema1.js";
import CuatroCapas from "./mecanicas/maquinas/CuatroCapas.jsx";
import { PIEZAS_INTRO } from "../data/contabilidadPiezas234.js";
import { ESCENAS_INTRO } from "./mecanicas/libros/intro/escenasIntro.jsx";
import JuegoConTutorial from "./mecanicas/libros/JuegoConTutorial.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * INTRODUCCIÓN A LA CONTABILIDAD — el primer tema de la materia.
 *
 * Es el capítulo 1, y va ANTES que «Las cuentas, el debe y el haber» aunque
 * se haya construido después. Por ahora solo tiene mitad de Aprender: el
 * índice no parte la tarjeta hasta que un tema tenga contenido de las dos, así
 * que entrar aquí lleva derecho al material, sin un clic de más hacia el único
 * destino que existe.
 *
 * Cuando lleguen actividades de Hacer, el tema se parte solo, sin tocar esta
 * vista ni el índice.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MATERIA = "contabilidad";
const TEMA = "introduccion-contabilidad";
export const TITULO = "Introducción a la contabilidad";

/* Las que ya se pueden jugar, en el orden del camino. */
/*
 * Solo el bloque. `MarcoLibros` ya antepone «EL LIBRO MAYOR ·» por su cuenta,
 * así que poner aquí un prefijo propio lo escribía dos veces seguidas.
 * El título de cada juego es su subtema: lo que se está practicando.
 */
/*
 * ═══════════ ESTA LISTA ES UNA PUERTA, NO UN ÍNDICE ═══════════
 *
 * Lo que está aquí se puede abrir escribiendo el hash a mano, aunque no salga
 * en el camino: el camino lo dibuja `subjects.js` y esto es el registro de qué
 * componente pinta cada id. Así que una actividad construida y NO publicada no
 * puede entrar aquí — entraría por la puerta de atrás, y al terminarla
 * llamaría a registrar FP de una actividad que el catálogo no conoce.
 *
 * Hay una prueba que compara esta lista con el catálogo. Se exporta para eso.
 *
 * Las siete están abiertas. T1-4 a T1-7 desde que existen las piezas 2, 3 y 4
 * del Aprender; T1-8 dependía solo de la pieza 1 y salió con ella.
 * Hasta entonces esas cuatro estaban construidas y fuera de las dos
 * puertas, porque preguntaban por cosas que nadie le había explicado todavía
 * al estudiante.
 */
export const JUEGOS = [
  { id: T1_1.id, Mecanica: DesdeDondePreguntan, titulo: T1_1.subtema },
  { id: T1_2.id, Mecanica: QueEntroYQueSalio, titulo: T1_2.subtema },
  /* T1-8 va tercera: practica la pieza 1, así que no esperó a las otras tres. */
  { id: T1_8.id, Mecanica: DondeSeRompio, titulo: T1_8.subtema },
  { id: T1_4.id, Mecanica: QueLePasaACadaUno, titulo: T1_4.subtema },
  { id: T1_5.id, Mecanica: LaEcuacionEnMovimiento, titulo: T1_5.subtema },
  { id: T1_6.id, Mecanica: EnCualEstadoAparece, titulo: T1_6.subtema },
  { id: T1_7.id, Mecanica: LaArticulacion, titulo: T1_7.subtema },
];

/*
 * ═══════════ EL RÓTULO DEL BLOQUE SALE DEL CATÁLOGO ═══════════
 *
 * Antes era una constante, «CIMIENTOS», para las siete: T1-8 decía Cimientos
 * siendo de Aplicación, y T1-7 lo mismo siendo de Maestría. Ahora sale de la
 * dificultad que la actividad trae en `subjects.js`, que es de donde el
 * camino saca sus bloques. Así el rótulo del marco y el bloque del camino no
 * pueden decir cosas distintas.
 */
export function rotuloDeBloque(actividadId) {
  const b = bloqueDeDificultad(clasificacionDe(MATERIA, TEMA, actividadId)?.dificultad);
  return b ? b.nombre.toUpperCase() : null;
}

/* Vive en su propio archivo porque la usan las dos vistas; se reexporta para las pruebas. */
export { JuegoConTutorial };

export default function IntroContabilidadView({ modo = null, nodoInicial = null, onBack }) {
  const esAprender = modo === APRENDER;
  const [nodoAbierto, setNodoAbierto] = useState(nodoInicial ?? null);
  const hechas = useCompletadas();
  const { pedirCuenta, usuario } = useAuth();
  const [recompensa, celebrar, celebrando] = useRecompensa();
  /* La pantalla de resumen: solo muestra; el interruptor está en hacer/pantallaResumen.js. */
  const resumen = useResumenDePartida(MATERIA, celebrando);

  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA);
  /* Cada nodo con su ícono de Contabilidad, si ya lo tiene. */
  const nodos = conIcono(nodosDe(actividadesDeTipo(tema, HACER).filter((a) => !a.pendiente), hechas));
  const juego = esAprender ? null : JUEGOS.find((j) => j.id === nodoAbierto);

  const completar = async (actividadId, porcentaje, duracionMs, detalle = null) => {
    const clas = clasificacionDe(MATERIA, TEMA, actividadId);
    celebrar(clas?.dificultad, actividadId);
    const res = await resumen.registrar({ actividadId, clasificacion: clas, pct: porcentaje, detalle }, () =>
      registrarActividadCompletada(clas, {
        materiaId: MATERIA, temaId: TEMA, actividadId, porcentajeAciertos: porcentaje, duracionMs, detalle,
      }));
    if (res?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  return (
    <FondoMateria materiaId={MATERIA}>
      <div style={{
        minHeight: "100vh", backgroundColor: "transparent", fontFamily: "Inter, sans-serif",
        color: FAE.text,
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
            <h1 style={{
              fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px",
              letterSpacing: "-0.02em", margin: 0, lineHeight: 1,
            }}>
              {TITULO}
            </h1>
          </div>

          {recompensa}
          <div className="fae-insignia-actividad"><ActivityBadge tipo={esAprender ? APRENDER : HACER} size="sm" /></div>

          {esAprender ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {PIEZAS_INTRO.map((pieza, k) => {
                const { Capa2, Exploracion, Capa4 } = ESCENAS_INTRO[pieza.id];
                return (
                  <div key={pieza.id}>
                    <p style={{
                      fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700,
                      letterSpacing: "0.12em", color: FAE.ambar, margin: "0 0 10px",
                    }}>
                      PIEZA {k + 1} DE {PIEZAS_INTRO.length}
                    </p>
                    <CuatroCapas
                      pieza={pieza}
                      Capa2={Capa2}
                      Exploracion={Exploracion}
                      Capa4={Capa4}
                      rotulo="EL CICLO CONTABLE · APRENDER"
                    />
                  </div>
                );
              })}
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
                  acento={TEMA1_ACENTO.ambar}
                  rotulo={rotuloDeBloque(juego.id)}
                  onCompletar={(pct, ms, detalle) => completar(juego.id, pct, ms, detalle)}
                />
              </ContextoResumen.Provider>
            </div>
          ) : (
            <CaminoHacer nodos={nodos} onAbrir={(id) => setNodoAbierto(id)} />
          )}
        </div>
      </div>
    </FondoMateria>
  );
}
