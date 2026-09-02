import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { COLORS, FAE } from "./theme.js";
import { NavigationContext } from "./navigation.js";
import { useAuth } from "./auth/AuthProvider.jsx";
import { clasificacionDe } from "./data/subjects.js";
import { registrarActividadCompletada } from "./fp/registrarActividad.js";

/* La pantalla de entrada se carga de forma estática: es lo primero que ve el estudiante. */
import HomeScreen from "./components/HomeScreen.jsx";

/*
 * Cada índice de materia trae su propio fondo animado, así que se cargan aparte:
 * la escena 3D de ajedrez solo se descarga si el estudiante abre esa materia.
 */
const MacroTopicIndex = lazy(() => import("./components/MacroTopicIndex.jsx"));
const EstrategiaTopicIndex = lazy(() => import("./components/EstrategiaTopicIndex.jsx"));
const PensamientoSistemicoView = lazy(() => import("./components/PensamientoSistemicoView.jsx"));
const IcebergView = lazy(() => import("./components/IcebergView.jsx"));
const PorterView = lazy(() => import("./components/PorterView.jsx"));
const PerfilView = lazy(() => import("./components/PerfilView.jsx"));
const PoliticaEconomicaView = lazy(() => import("./components/PoliticaEconomicaView.jsx"));

/*
 * DA-Learn se carga bajo demanda. Recharts pesa la mayor parte del bundle y solo lo
 * necesitan las cuatro vistas de canal, así que la entrada no lo descarga nunca.
 */
const NameGate = lazy(() => import("./components/NameGate.jsx"));
const Dashboard = lazy(() => import("./components/Dashboard.jsx"));
const ConsumoView = lazy(() => import("./components/ConsumoView.jsx"));
const InversionView = lazy(() => import("./components/InversionView.jsx"));
const GastoView = lazy(() => import("./components/GastoView.jsx"));
const XNView = lazy(() => import("./components/XNView.jsx"));
const FinalView = lazy(() => import("./components/FinalView.jsx"));
const RankingView = lazy(() => import("./components/RankingView.jsx"));

/*
 * DA-Learn como actividad del sistema de FP.
 *
 * El simulador no calcula puntos por su cuenta: al terminarlo llama al mismo
 * camino que el resto del sitio —registrarActividadCompletada → otorgarFP →
 * calcularFP → rpc registrar_fp—, con la clasificación que salga de
 * subjects.js.
 *
 * Hoy `simulador-da` NO está clasificado (Gen todavía no le asignó tipo,
 * modalidad ni dificultad), así que clasificacionDe devuelve null y la llamada
 * sale por la primera guarda sin otorgar nada ni tocar la red. Es el mismo
 * estado "pendiente de clasificar" que tienen las dos mecánicas de Porter.
 * Cuando Gen lo clasifique, los FP empiezan a contar sin tocar este archivo.
 */
const MATERIA = "macroeconomia";
const TEMA = "demanda-agregada";
const ACTIVIDAD = "simulador-da";
const CLAS_SIMULADOR = clasificacionDe(MATERIA, TEMA, ACTIVIDAD);

export default function App() {
  const { pedirCuenta } = useAuth();
  const [studentName, setStudentName] = useState("");
  const [view, setView] = useState("home");
  const [prevView, setPrevView] = useState("dashboard");
  /*
   * Con qué mitad del tema se entró: "aprender", "hacer", o null para las
   * vistas que todavía se muestran enteras. Lo elige la tarjeta partida del
   * índice y lo consume la vista del tema para filtrar sus mecánicas.
   */
  const [modoTema, setModoTema] = useState(null);

  /* Entrar a un tema, con o sin mitad elegida. */
  const abrirTema = (topicId, modo = null) => {
    setModoTema(modo);
    setView(topicId);
  };

  const [consumoState, setConsumoState] = useState({ Y: 5000000, TR: 500000, T: 300000, c: 0.6 });
  const [inversionState, setInversionState] = useState({ Ibar: 2000000, b: 50000, i: 10 });
  const [gastoState, setGastoState] = useState({ G: 3000000 });
  const [xnState, setXnState] = useState({ tc: 4000 });

  const [topicProgress, setTopicProgress] = useState({
    consumo: [false, false, false, false, false],
    inversion: [false, false, false, false, false],
    gasto: [false, false, false, false, false],
    xn: [false, false, false, false, false],
  });
  const [finalCompleted, setFinalCompleted] = useState({ finalQ1: false, finalQ2: false });

  /*
   * El avance se guarda en local y no depende de tener cuenta. Acertar una
   * pregunta suelta ya no pide la cuenta: no hay nada que guardar todavía,
   * porque los FP se otorgan al completar la actividad entera, no por
   * pregunta. Pedirla antes sería ofrecer guardar algo que no existe.
   */
  const markTopicCorrect = (topicKey, index) => {
    setTopicProgress((prev) => {
      if (prev[topicKey][index]) return prev;
      const updated = [...prev[topicKey]];
      updated[index] = true;
      return { ...prev, [topicKey]: updated };
    });
  };

  const markFinalCorrect = (key) => {
    setFinalCompleted((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  };

  const completed = {
    consumo: topicProgress.consumo.every(Boolean),
    inversion: topicProgress.inversion.every(Boolean),
    gasto: topicProgress.gasto.every(Boolean),
    xn: topicProgress.xn.every(Boolean),
    finalQ1: finalCompleted.finalQ1,
    finalQ2: finalCompleted.finalQ2,
  };

  /*
   * Respuestas acertadas. NO es un puntaje: es la entrada de desempeño que se
   * le pasa al motor de FP y lo que se muestra como avance. La conversión a
   * puntos la hace el motor con la dificultad que asigne Gen, no este archivo.
   */
  const correctCount =
    topicProgress.consumo.filter(Boolean).length +
    topicProgress.inversion.filter(Boolean).length +
    topicProgress.gasto.filter(Boolean).length +
    topicProgress.xn.filter(Boolean).length +
    (finalCompleted.finalQ1 ? 1 : 0) +
    (finalCompleted.finalQ2 ? 1 : 0);

  const badges = [];
  if (correctCount >= 5) badges.push("maestro-consumo");
  if (completed.inversion) badges.push("inversor-audaz");
  if (completed.xn) badges.push("domador-dolar");

  const totalPreguntas =
    Object.values(topicProgress).reduce((n, canal) => n + canal.length, 0) +
    Object.keys(finalCompleted).length;

  const allFourDone = completed.consumo && completed.inversion && completed.gasto && completed.xn;
  const finalDone = completed.finalQ1 && completed.finalQ2;
  const coreCount = ["consumo", "inversion", "gasto", "xn"].filter((k) => completed[k]).length;
  const progress = Math.round(((coreCount + (finalDone ? 1 : 0)) / 5) * 100);

  /*
   * Reloj de la actividad, para la defensa de tiempo del motor. Arranca al
   * entrar al simulador (NameGate → dashboard), no al montar la app.
   */
  const inicioSimulador = useRef(null);
  /* Una finalización, un registro: el efecto puede reevaluarse varias veces. */
  const yaRegistrado = useRef(false);

  /*
   * Fin de la actividad: los 4 canales y la Ronda Final. Único punto donde
   * DA-Learn entrega FP, y lo hace por el camino central como cualquier otra
   * mecánica del sitio.
   *
   * LIMITACIÓN CONOCIDA: QuizBlock deja reintentar hasta acertar y solo
   * registra los aciertos, así que al completar el simulador el porcentaje
   * siempre es 100. Si Gen clasifica esta actividad como *evaluativa*, hay que
   * registrar antes los intentos fallados en QuizBlock; si la clasifica como
   * exploratoria, el motor ignora este dato y no hace falta tocar nada.
   */
  useEffect(() => {
    if (!allFourDone || !finalDone || yaRegistrado.current) return;
    yaRegistrado.current = true;

    (async () => {
      const resultado = await registrarActividadCompletada(CLAS_SIMULADOR, {
        materiaId: MATERIA,
        temaId: TEMA,
        actividadId: ACTIVIDAD,
        porcentajeAciertos: (correctCount / totalPreguntas) * 100,
        duracionMs: inicioSimulador.current ? Date.now() - inicioSimulador.current : null,
      });
      if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
    })();
  }, [allFourDone, finalDone, correctCount, totalPreguntas, pedirCuenta]);

  const goDashboard = () => setView("dashboard");
  /* El ranking es dato propio frente a otros: aquí también se pide la cuenta. */
  const openRanking = () => {
    pedirCuenta("ver el ranking");
    setPrevView(view);
    setView("ranking");
  };
  const goHome = () => setView("home");
  /* Salir de DA-Learn sube un nivel, al índice de temas de Macroeconomía. */
  const goMacroIndex = () => setView("macroeconomia");

  /*
   * El logo y el indicador de cuenta viven fuera del árbol de vistas, así que
   * navegan por contexto en vez de recibir callbacks.
   */
  const navigation = {
    goHome,
    irAPerfil: () => { setPrevView(view); setView("perfil"); },
  };
  const siteFallback = <div style={{ minHeight: "100vh", backgroundColor: FAE.bg }} />;
  const wrap = (node) => (
    <NavigationContext.Provider value={navigation}>{node}</NavigationContext.Provider>
  );

  /*
   * Vistas de nivel sitio: viven fuera del contenedor de DA-Learn porque traen
   * su propio layout a pantalla completa y su propio fondo animado.
   */
  if (view === "home") {
    return wrap(<HomeScreen onSelectSubject={(subject) => setView(subject)} />);
  }

  if (view === "macroeconomia") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <MacroTopicIndex
          onOpenTopic={(topicId, modo) => {
            /* Demanda Agregada entra por el NameGate de DA-Learn; el resto es directo. */
            abrirTema(topicId === "demanda-agregada" ? "name" : topicId, modo);
          }}
        />
      </Suspense>
    );
  }

  if (view === "pensamiento-estrategico") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <EstrategiaTopicIndex onOpenTopic={abrirTema} />
      </Suspense>
    );
  }

  if (view === "pensamiento-sistemico") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <PensamientoSistemicoView onBack={() => setView("pensamiento-estrategico")} />
      </Suspense>
    );
  }

  if (view === "modelo-iceberg") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <IcebergView modo={modoTema} onBack={() => setView("pensamiento-estrategico")} />
      </Suspense>
    );
  }

  if (view === "politica-economica") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <PoliticaEconomicaView onBack={() => setView("macroeconomia")} />
      </Suspense>
    );
  }

  if (view === "perfil") {
    return wrap(
      <Suspense fallback={siteFallback}>
        {/* Volver devuelve a donde estaba el estudiante, no siempre al inicio. */}
        <PerfilView onBack={() => setView(prevView === "perfil" ? "home" : prevView)} />
      </Suspense>
    );
  }

  if (view === "fuerzas-porter") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <PorterView onBack={() => setView("pensamiento-estrategico")} />
      </Suspense>
    );
  }

  return wrap(
    <div style={{ backgroundColor: COLORS.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif", backgroundImage: "radial-gradient(circle at 50% -10%, rgba(61,127,255,0.18), transparent 55%)" }}>
      {/* Fondo vacío mientras llega el chunk: evita un destello claro sobre el tema oscuro. */}
      <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      {view === "name" ? (
        <NameGate
          onStart={(name) => {
            setStudentName(name);
            /* El reloj de la actividad arranca aquí, al entrar de verdad. */
            if (!inicioSimulador.current) inicioSimulador.current = Date.now();
            setView("dashboard");
          }}
          onBack={goMacroIndex}
        />
      ) : (
        <div className="max-w-md mx-auto px-4 py-6">
          {view === "dashboard" && (
            <Dashboard
              studentName={studentName}
              completed={completed}
              correctCount={correctCount}
              totalPreguntas={totalPreguntas}
              badges={badges}
              allFourDone={allFourDone}
              finalDone={finalDone}
              progress={progress}
              onOpenTopic={(key) => setView(key)}
              onOpenFinal={() => setView("final")}
              onRanking={openRanking}
              onExitTopic={goMacroIndex}
            />
          )}
          {view === "consumo" && (
            <ConsumoView
              state={consumoState} setState={setConsumoState}
              quizProgress={topicProgress.consumo} onAnswerCorrect={(idx) => markTopicCorrect("consumo", idx)}
              onBack={goDashboard} onNext={() => setView("inversion")} onRanking={openRanking}
            />
          )}
          {view === "inversion" && (
            <InversionView
              state={inversionState} setState={setInversionState}
              quizProgress={topicProgress.inversion} onAnswerCorrect={(idx) => markTopicCorrect("inversion", idx)}
              onBack={goDashboard} onNext={() => setView("gasto")} onRanking={openRanking}
            />
          )}
          {view === "gasto" && (
            <GastoView
              state={gastoState} setState={setGastoState}
              quizProgress={topicProgress.gasto} onAnswerCorrect={(idx) => markTopicCorrect("gasto", idx)}
              onBack={goDashboard} onNext={() => setView("xn")} onRanking={openRanking}
            />
          )}
          {view === "xn" && (
            <XNView
              state={xnState} setState={setXnState}
              quizProgress={topicProgress.xn} onAnswerCorrect={(idx) => markTopicCorrect("xn", idx)}
              onBack={goDashboard} onNext={() => setView(allFourDone ? "final" : "dashboard")} onRanking={openRanking}
            />
          )}
          {view === "final" && (
            <FinalView
              completed={completed}
              onCorrectQ1={() => markFinalCorrect("finalQ1")}
              onCorrectQ2={() => markFinalCorrect("finalQ2")}
              onBack={goDashboard}
              onRanking={openRanking}
            />
          )}
          {view === "ranking" && (
            <RankingView materiaId={MATERIA} badges={badges} onBack={() => setView(prevView)} />
          )}
        </div>
      )}
      </Suspense>
    </div>
  );
}

