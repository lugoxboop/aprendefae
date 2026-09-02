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
const Dashboard = lazy(() => import("./components/Dashboard.jsx"));
const ConsumoView = lazy(() => import("./components/ConsumoView.jsx"));
const InversionView = lazy(() => import("./components/InversionView.jsx"));
const GastoView = lazy(() => import("./components/GastoView.jsx"));
const XNView = lazy(() => import("./components/XNView.jsx"));
const FinalView = lazy(() => import("./components/FinalView.jsx"));

/* Fondo de DA-Learn: el mismo del índice de Macroeconomía, cargado aparte. */
const SupplyDemandBackground = lazy(() => import("./components/backgrounds/SupplyDemandBackground.jsx"));
const BackgroundVeil = lazy(() => import("./components/shared/BackgroundVeil.jsx"));

/*
 * DA-Learn como actividad del sistema de FP.
 *
 * El simulador no calcula puntos por su cuenta: al terminarlo llama al mismo
 * camino que el resto del sitio —registrarActividadCompletada → otorgarFP →
 * calcularFP → rpc registrar_fp—, con la clasificación que salga de
 * subjects.js.
 *
 * Gen la clasificó como Hacer · exploratoria · difícil: 50 FP por completarla,
 * sin escalar por aciertos. Exploratoria y no evaluativa porque el quiz deja
 * reintentar hasta acertar, así que un porcentaje de aciertos final mediría
 * constancia y no desempeño.
 */
const MATERIA = "macroeconomia";
const TEMA = "demanda-agregada";
const ACTIVIDAD = "simulador-da";
const CLAS_SIMULADOR = clasificacionDe(MATERIA, TEMA, ACTIVIDAD);

export default function App() {
  /*
   * El apodo sale del perfil, que se elige una sola vez al entrar con Google y
   * vale para todo el sitio. DA-Learn ya no pide un nombre propio: aquel
   * NameGate existía cuando el simulador no tenía forma de saber quién era el
   * estudiante, y hoy sí la tiene.
   */
  const { pedirCuenta, perfil } = useAuth();
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
   * Acierto al PRIMER intento, por pregunta: true, false, o null si todavía no
   * se ha intentado. Va aparte del progreso porque mide otra cosa: el progreso
   * dice si acabó acertando —siempre acaba acertando, el quiz deja reintentar—
   * y esto dice si lo sabía de entrada.
   *
   * Vive junto al progreso, con la misma vida que él, y sale de aquí hacia
   * fp_history.correct_pct al completar la actividad. Ahí queda consultable
   * sin necesidad de tocar la mecánica ni el esquema más adelante.
   */
  const [firstTry, setFirstTry] = useState({
    consumo: [null, null, null, null, null],
    inversion: [null, null, null, null, null],
    gasto: [null, null, null, null, null],
    xn: [null, null, null, null, null],
  });
  const [finalFirstTry, setFinalFirstTry] = useState({ finalQ1: null, finalQ2: null });

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

  /*
   * El primer intento se anota una sola vez por pregunta. La guarda vive aquí y
   * no en el quiz porque este estado sí sobrevive a salir del canal y volver:
   * si el quiz se remonta, el intento de esa pregunta ya no es el primero.
   */
  const markFirstAttempt = (topicKey, index, acerto) => {
    setFirstTry((prev) => {
      if (prev[topicKey][index] !== null) return prev;
      const updated = [...prev[topicKey]];
      updated[index] = acerto;
      return { ...prev, [topicKey]: updated };
    });
  };

  const markFinalFirstAttempt = (key, acerto) => {
    setFinalFirstTry((prev) => (prev[key] !== null ? prev : { ...prev, [key]: acerto }));
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
   * Respuestas resueltas. NO es un puntaje: es lo que se muestra como avance.
   * Los FP los calcula el motor con la clasificación de Gen, no este archivo.
   */
  const correctCount =
    topicProgress.consumo.filter(Boolean).length +
    topicProgress.inversion.filter(Boolean).length +
    topicProgress.gasto.filter(Boolean).length +
    topicProgress.xn.filter(Boolean).length +
    (finalCompleted.finalQ1 ? 1 : 0) +
    (finalCompleted.finalQ2 ? 1 : 0);

  /*
   * Las insignias ("Maestro del Consumo", etc.) se fueron con la pantalla de
   * ranking de DA-Learn: eran premios inventados por el simulador y su único
   * lugar de aparición era esa pantalla. El reconocimiento del sitio son los
   * FP y el ranking de la materia, un nivel más arriba.
   */

  const totalPreguntas =
    Object.values(topicProgress).reduce((n, canal) => n + canal.length, 0) +
    Object.keys(finalCompleted).length;

  /* Cuántas salieron bien de una: la medida honesta de desempeño de esta actividad. */
  const aciertosPrimerIntento =
    Object.values(firstTry).flat().filter(Boolean).length +
    Object.values(finalFirstTry).filter(Boolean).length;

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
   * Al ser exploratoria, el motor paga la base completa por terminar y NO mira
   * el porcentaje. Aun así se envía, y se envía el del primer intento: es el
   * único número que dice algo real de esta actividad —terminarla siempre da
   * 100% de aciertos finales— y viaja a fp_history.correct_pct, donde queda
   * disponible para calcular la métrica más adelante sin volver a tocar nada.
   */
  useEffect(() => {
    if (!allFourDone || !finalDone || yaRegistrado.current) return;
    yaRegistrado.current = true;

    (async () => {
      const resultado = await registrarActividadCompletada(CLAS_SIMULADOR, {
        materiaId: MATERIA,
        temaId: TEMA,
        actividadId: ACTIVIDAD,
        porcentajeAciertos: (aciertosPrimerIntento / totalPreguntas) * 100,
        duracionMs: inicioSimulador.current ? Date.now() - inicioSimulador.current : null,
      });
      if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
    })();
  }, [allFourDone, finalDone, aciertosPrimerIntento, totalPreguntas, pedirCuenta]);

  const goDashboard = () => setView("dashboard");
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
            /*
             * Demanda Agregada entra directo al simulador. El reloj de la
             * actividad arranca aquí, que es el momento en que el estudiante
             * empieza de verdad.
             */
            if (topicId === "demanda-agregada") {
              if (!inicioSimulador.current) inicioSimulador.current = Date.now();
              abrirTema("dashboard", modo);
              return;
            }
            abrirTema(topicId, modo);
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
    <div
      style={{
        position: "relative",
        backgroundColor: COLORS.bg,
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
      }}
    >
      {/*
        El mismo fondo de curvas del índice de Macroeconomía. DA-Learn es un
        tema de esa materia, así que comparte su fondo en vez de tener uno
        propio: entrar al tema no debería sentirse como cambiar de sitio.
        Llega aparte para no entrar en la carga inicial de la portada.
      */}
      <Suspense fallback={null}>
        <SupplyDemandBackground />
        <BackgroundVeil centerAlpha={0.42} />
      </Suspense>

      {/* Fondo vacío mientras llega el chunk: evita un destello claro sobre el tema oscuro. */}
      <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
        <div className="max-w-md mx-auto px-4 py-6" style={{ position: "relative", zIndex: 2 }}>
          {view === "dashboard" && (
            <Dashboard
              apodo={perfil?.nickname}
              completed={completed}
              correctCount={correctCount}
              totalPreguntas={totalPreguntas}
              allFourDone={allFourDone}
              finalDone={finalDone}
              progress={progress}
              onOpenTopic={(key) => setView(key)}
              onOpenFinal={() => setView("final")}
             
              onExitTopic={goMacroIndex}
            />
          )}
          {view === "consumo" && (
            <ConsumoView
              state={consumoState} setState={setConsumoState}
              quizProgress={topicProgress.consumo} onAnswerCorrect={(idx) => markTopicCorrect("consumo", idx)} onFirstAttempt={(idx, a) => markFirstAttempt("consumo", idx, a)}
              onBack={goDashboard} onNext={() => setView("inversion")}
            />
          )}
          {view === "inversion" && (
            <InversionView
              state={inversionState} setState={setInversionState}
              quizProgress={topicProgress.inversion} onAnswerCorrect={(idx) => markTopicCorrect("inversion", idx)} onFirstAttempt={(idx, a) => markFirstAttempt("inversion", idx, a)}
              onBack={goDashboard} onNext={() => setView("gasto")}
            />
          )}
          {view === "gasto" && (
            <GastoView
              state={gastoState} setState={setGastoState}
              quizProgress={topicProgress.gasto} onAnswerCorrect={(idx) => markTopicCorrect("gasto", idx)} onFirstAttempt={(idx, a) => markFirstAttempt("gasto", idx, a)}
              onBack={goDashboard} onNext={() => setView("xn")}
            />
          )}
          {view === "xn" && (
            <XNView
              state={xnState} setState={setXnState}
              quizProgress={topicProgress.xn} onAnswerCorrect={(idx) => markTopicCorrect("xn", idx)} onFirstAttempt={(idx, a) => markFirstAttempt("xn", idx, a)}
              onBack={goDashboard} onNext={() => setView(allFourDone ? "final" : "dashboard")}
            />
          )}
          {view === "final" && (
            <FinalView
              completed={completed}
              onCorrectQ1={() => markFinalCorrect("finalQ1")}
              onCorrectQ2={() => markFinalCorrect("finalQ2")}
              onFirstAttempt={markFinalFirstAttempt}
              onBack={goDashboard}
            />
          )}
        </div>
      </Suspense>
    </div>
  );
}

