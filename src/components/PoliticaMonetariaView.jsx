import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import FondoMateria from "./shared/FondoMateria.jsx";
import EnlaceRendimiento from "./shared/EnlaceRendimiento.jsx";
import ActivityBadge from "./shared/ActivityBadge.jsx";
import CaminoHacer from "./shared/CaminoHacer.jsx";
import { useRecompensa } from "./shared/RecompensaCierre.jsx";
import { ContextoResumen, useResumenDePartida } from "./shared/PantallaResumen.jsx";
import { useNodoEnRuta } from "./shared/useNodoEnRuta.js";
import CuatroCapas from "./mecanicas/maquinas/CuatroCapas.jsx";
import {
  EscenaQuienManda, EscenaInstrumentos, EscenaTransmisiones, ExploraVolante, ExploraInstrumentos, ExploraMargen,
} from "./mecanicas/maquinas/salaDeMaquinas.jsx";
import {
  MemoramaBancoCentral, QuienDecideEsto, VolanteDeLaTasa, CajaDeHerramientas, AQuienLePegaLaTasa,
  CadenaDeTransmision, ExplicaseloADeudor, CorrienteDeDecisiones, ElRezago, DilemaBanqueroCentral,
  DueloDeInstrumentos, DisenaRespuestaMonetaria,
} from "./mecanicas/maquinas/actividades.jsx";
import { PorCualArteriaEntra, LasDosEntradas } from "./mecanicas/maquinas/monetariaRepaso.jsx";
import { EscenaFabrica, ExploraFabrica, CreaOCambiaDeManos, LaEscaleraDelEncaje } from "./mecanicas/maquinas/fabricaDelDinero.jsx";
import { APRENDER_QUIEN_MANDA, APRENDER_INSTRUMENTOS, APRENDER_TRANSMISIONES } from "../data/politicaMonetaria.js";
import { EscenaTallas, ExploraTallas } from "./mecanicas/maquinas/tallasDelDinero.jsx";
import { EnQueTallaVa, QueTocoElBanco } from "./mecanicas/maquinas/actividadesAgregados.jsx";
import { APRENDER_FABRICA } from "../data/pmFabricaDelDinero.js";
import { APRENDER_TALLAS } from "../data/pmAgregados.js";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { SUBJECTS, APRENDER, HACER, clasificacionDe, actividadesDeTipo, nombreDeActividad } from "../data/subjects.js";

/*
 * Política Monetaria — "La Sala de Máquinas". Dos mitades:
 *
 *   APRENDER  las tres piezas de cuatro capas. Material teórico: cero FP.
 *   HACER     los doce juegos, en el camino por bloques.
 *
 * Se navega igual que Política Fiscal: con el modo "aprender" se ven las tres
 * piezas; sin modo o con "hacer", el camino. Las entradillas de los juegos no
 * se escribieron: la ficha no las trae, y el título y el subtema bastan.
 */

const MATERIA = "macroeconomia";
const TEMA = "politica-monetaria";

const PIEZAS = [
  { pieza: APRENDER_QUIEN_MANDA, Escena: EscenaQuienManda, Exploracion: ExploraMargen },
  { pieza: APRENDER_INSTRUMENTOS, Escena: EscenaInstrumentos, Exploracion: ExploraInstrumentos },
  { pieza: APRENDER_TRANSMISIONES, Escena: EscenaTransmisiones, Exploracion: () => <ExploraVolante conReloj /> },
  { pieza: APRENDER_FABRICA, Escena: EscenaFabrica, Exploracion: ExploraFabrica },
  { pieza: APRENDER_TALLAS, Escena: EscenaTallas, Exploracion: ExploraTallas },
];

/* El orden es el del camino: por bloque, y dentro de cada uno el de la ficha. */
const JUEGOS = [
  { id: "memorama-banco-central", Mecanica: MemoramaBancoCentral },
  { id: "quien-decide-esto", Mecanica: QuienDecideEsto },
  { id: "en-que-talla-va", Mecanica: EnQueTallaVa },
  { id: "volante-de-la-tasa", Mecanica: VolanteDeLaTasa },
  { id: "caja-de-herramientas", Mecanica: CajaDeHerramientas },
  { id: "crea-o-cambia-de-manos", Mecanica: CreaOCambiaDeManos },
  { id: "a-quien-le-pega-la-tasa", Mecanica: AQuienLePegaLaTasa },
  { id: "las-dos-entradas", Mecanica: LasDosEntradas },
  { id: "que-toco-el-banco", Mecanica: QueTocoElBanco },
  { id: "cadena-de-transmision", Mecanica: CadenaDeTransmision },
  { id: "por-cual-arteria-entra", Mecanica: PorCualArteriaEntra },
  { id: "explicaselo-a-un-deudor", Mecanica: ExplicaseloADeudor },
  { id: "corriente-de-decisiones", Mecanica: CorrienteDeDecisiones },
  { id: "el-rezago", Mecanica: ElRezago },
  { id: "la-escalera-del-encaje", Mecanica: LaEscaleraDelEncaje },
  { id: "dilema-banquero-central", Mecanica: DilemaBanqueroCentral },
  { id: "duelo-de-instrumentos", Mecanica: DueloDeInstrumentos },
  { id: "disena-respuesta-monetaria", Mecanica: DisenaRespuestaMonetaria },
];

const CLAS = Object.fromEntries(JUEGOS.map((j) => [j.id, clasificacionDe(MATERIA, TEMA, j.id)]));

/* Teal: el coral es error en todo el sitio, no un rótulo de sección. */
const sectionLabel = { fontFamily: "Sora, sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", color: FAE.teal, margin: 0 };
const h2 = { fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "clamp(21px, 3.2vw, 27px)", letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 16px" };
const lead = { fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.62)", margin: "0 0 20px" };

export default function PoliticaMonetariaView({ modo = null, nodoInicial = null, onBack }) {
  const esAprender = modo === APRENDER;
  const [nodoAbierto, setNodoAbierto] = useState(null);
  const hechas = useCompletadas();
  const { pedirCuenta } = useAuth();
  const [recompensa, celebrar, celebrando] = useRecompensa();
  /* La pantalla de resumen. Apagada para esta materia: ver hacer/pantallaResumen.js. */
  const resumen = useResumenDePartida(MATERIA, celebrando);

  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === TEMA);
  const nodos = nodosDe(actividadesDeTipo(tema, HACER), hechas);
  const resaltado = useNodoEnRuta(nodoAbierto, nodoInicial, esAprender ? [] : nodos.map((x) => x.id));

  const completarJuego = async (actividadId, porcentajeAciertos, duracionMs, detalle = null) => {
    celebrar(CLAS[actividadId]?.dificultad, actividadId);
    const resultado = await resumen.registrar(
      { actividadId, clasificacion: CLAS[actividadId], pct: porcentajeAciertos, detalle },
      () => registrarActividadCompletada(CLAS[actividadId], {
        materiaId: MATERIA, temaId: TEMA, actividadId, porcentajeAciertos, duracionMs, detalle,
      }),
    );
    if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  const juego = esAprender ? null : JUEGOS.find((j) => j.id === nodoAbierto);

  return (
    <FondoMateria materiaId="macroeconomia">
      {recompensa}
      <div style={{ minHeight: "100vh", backgroundColor: "transparent", fontFamily: "Inter, sans-serif", color: FAE.text, backgroundImage: "radial-gradient(circle at 50% -10%, rgba(42,157,143,0.14), transparent 55%)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) clamp(16px, 2vw, 24px) 56px" }}>
          <div className="fae-cabecera-titulo" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
            <span className="fae-cabecera-marca"><Logo variant="symbol" size={26} theme="dark" /></span>
            <span aria-hidden="true" className="fae-cabecera-marca" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
            <button type="button" onClick={onBack} aria-label="Volver a Macroeconomía" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "999px", background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer" }}>
              <ChevronLeft size={20} color={FAE.text} />
            </button>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>Política Monetaria</h1>
          </div>

          {/*
            LA INSIGNIA VIVE CON EL CONTENIDO, NO EN LA CABECERA.
          
            Es metadato de lo que hay debajo —no navegación, no estado— y no
            cambia mientras se juega: el estudiante ya la vio en la tarjeta que
            tocó para entrar. En la cabecera competía por el ancho con el título,
            y a 375 px se lo comía. Sale en TODOS los anchos, no solo en móvil.
          */}
          <div className="fae-insignia-actividad"><ActivityBadge tipo={esAprender ? APRENDER : HACER} size="sm" /></div>

          {esAprender && (
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {PIEZAS.map(({ pieza, Escena, Exploracion }, k) => (
                <section key={pieza.id} data-pieza={pieza.id}>
                  <p style={{ ...sectionLabel, marginBottom: "10px" }}>PIEZA {k + 1} DE {PIEZAS.length}</p>
                  <CuatroCapas pieza={pieza} Escena={Escena} Exploracion={Exploracion} />
                </section>
              ))}
            </div>
          )}

          {!esAprender && !nodoAbierto && (
            <>
              <h2 style={h2}>El camino de este tema</h2>
              <p style={lead}>Toca el juego que quieras. No hay orden obligatorio: el camino sugiere uno, no lo impone.</p>
              <CaminoHacer nodos={nodos} onAbrir={setNodoAbierto} resaltado={resaltado} porBloques />
            </>
          )}

          {juego && (
            <>
              <button
                type="button"
                onClick={() => { resumen.limpiar(); setNodoAbierto(null); }}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px", marginBottom: "18px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, padding: "9px 15px", borderRadius: "999px", cursor: "pointer", background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.7)" }}
              >
                <ChevronLeft size={15} /> Volver al camino
              </button>
              {nodoAbierto && <EnlaceRendimiento actividadId={nodoAbierto} />}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 8px" }}>
                <p style={sectionLabel}>JUEGO {JUEGOS.findIndex((j) => j.id === juego.id) + 1}</p>
                <ActivityBadge tipo={CLAS[juego.id]?.tipo} size="sm" />
              </div>
              <h2 style={h2}>{nombreDeActividad(juego.id)}</h2>
              <ContextoResumen.Provider value={resumen.contexto(juego.id, () => setNodoAbierto(null))}>
                <juego.Mecanica onCompletar={(pct, ms, detalle) => completarJuego(juego.id, pct, ms, detalle)} />
              </ContextoResumen.Provider>
            </>
          )}
        </div>
      </div>
    </FondoMateria>
  );
}
