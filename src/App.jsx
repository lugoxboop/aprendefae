import { useState, useCallback, lazy, Suspense } from "react";
import { FAE } from "./theme.js";
import { NavigationContext } from "./navigation.js";
import { useRuta, vistaDeTema } from "./ruta.js";

/* La pantalla de entrada se carga de forma estática: es lo primero que ve el estudiante. */
import HomeScreen from "./components/HomeScreen.jsx";

/*
 * El indicador de cuenta y el diálogo de login acompañan a todas las vistas, y
 * los monta `wrap` para que queden DENTRO del proveedor de navegación. Si se
 * montan fuera —como estaban, desde main.jsx— el contexto les llega en null y
 * sus acciones de navegación no hacen nada, en silencio.
 */
import AccountControl from "./components/auth/AccountControl.jsx";
import AuthDialog from "./components/auth/AuthDialog.jsx";
import AvisoFP from "./components/shared/AvisoFP.jsx";
import MomentoRacha from "./components/racha/MomentoRacha.jsx";

/*
 * Cada índice de materia trae su propio fondo animado, así que se cargan aparte:
 * la escena 3D de ajedrez solo se descarga si el estudiante abre esa materia.
 */
const MacroTopicIndex = lazy(() => import("./components/MacroTopicIndex.jsx"));
const EstrategiaTopicIndex = lazy(() => import("./components/EstrategiaTopicIndex.jsx"));
const ContabilidadTopicIndex = lazy(() => import("./components/ContabilidadTopicIndex.jsx"));
const PensamientoSistemicoView = lazy(() => import("./components/PensamientoSistemicoView.jsx"));
const IcebergView = lazy(() => import("./components/IcebergView.jsx"));
const PorterView = lazy(() => import("./components/PorterView.jsx"));
const PerfilView = lazy(() => import("./components/PerfilView.jsx"));
const TiendaView = lazy(() => import("./components/tienda/TiendaView.jsx"));
const PoliticaEconomicaView = lazy(() => import("./components/PoliticaEconomicaView.jsx"));
/* "La Tesorería Nacional": los siete juegos de Política Fiscal. Solo tiene mitad Hacer. */
const PoliticaFiscalView = lazy(() => import("./components/PoliticaFiscalView.jsx"));
/* "La Sala de Máquinas": Política Monetaria, con sus dos mitades. */
const PoliticaMonetariaView = lazy(() => import("./components/PoliticaMonetariaView.jsx"));
const IntroContabilidadView = lazy(() => import("./components/IntroContabilidadView.jsx"));
const CuentasDebeHaberView = lazy(() => import("./components/CuentasDebeHaberView.jsx"));
const ContabilidadTema3View = lazy(() => import("./components/ContabilidadTema3View.jsx"));
const ContabilidadTema5View = lazy(() => import("./components/ContabilidadTema5View.jsx"));
const ContabilidadTema6View = lazy(() => import("./components/ContabilidadTema6View.jsx"));
const ContabilidadT7_1View = lazy(() => import("./components/ContabilidadT7_1View.jsx"));
const RepasoView = lazy(() => import("./components/repaso/RepasoView.jsx"));
const PanelDocente = lazy(() => import("./components/docente/PanelDocente.jsx"));

/*
 * Las dos mitades de Demanda Agregada. Cada una carga aparte: quien entra a
 * "Aprender" no descarga los siete juegos, y al revés.
 *
 * ═══════════ AQUÍ VIVÍA DA-LEARN, Y YA NO ═══════════
 *
 * El simulador de los cuatro canales —dashboard, consumo, inversion, gasto, xn
 * y final— era la única actividad "Hacer" del tema y ocupaba la mitad de este
 * archivo: su progreso por canal, su primer intento por pregunta, su detalle
 * por ítem y su registro de FP. Se retiró entero, junto con su fila del
 * catálogo del servidor.
 *
 * Lo sustituyen dos cosas que ya existen. "El corazón de la economía" hereda su
 * mismo modelo y es la exploración con diales, en la mitad Aprender. Y los
 * siete juegos del camino de "Hacer" cubren lo que él preguntaba —recordar y
 * comprender, con banco más grande y sorteo por partida— y añaden analizar,
 * evaluar y crear, que no tenía de ninguna forma.
 *
 * Con él se fue el último estado de actividad que vivía en App. Hoy ninguna
 * mecánica guarda su avance aquí: cada una lo lleva dentro y entrega el
 * resultado a la vista de su tema, que es la que llama al motor de FP.
 */
const DemandaAgregadaAprenderView = lazy(() => import("./components/DemandaAgregadaAprenderView.jsx"));
const DemandaAgregadaHacerView = lazy(() => import("./components/DemandaAgregadaHacerView.jsx"));

/*
 * ═══════════ QUÉ VISTAS LLEVAN TÍTULO EN LA CABECERA ═══════════
 *
 * Las que lo llevan usan el header compacto en pantallas estrechas: sin logo,
 * sin divisor y con la pastilla de cuenta encogida a solo los FP. La lista vive
 * aquí porque es App quien sabe qué vista está puesta, y la pastilla se pinta
 * fuera del árbol de la vista —no puede deducirlo mirando a su alrededor—.
 *
 * NO ESTÁN el perfil, la Tienda ni el panel docente, aunque sus cabeceras
 * también tienen un título: la tabla de variantes de Xeno pone el perfil con la
 * pastilla completa, y sus cabeceras no llevan insignia ni compiten por el
 * ancho como las de actividad. Queda anotado porque la regla general, leída al
 * pie de la letra, los incluiría.
 */
const VISTAS_CON_TITULO = new Set([
  "macroeconomia", "pensamiento-estrategico", "contabilidad",
  "camino-da", "grifos-da",
  "politica-economica", "politica-fiscal", "politica-monetaria",
  "pensamiento-sistemico", "modelo-iceberg", "fuerzas-porter",
  "introduccion-contabilidad",
  "cuentas-debe-haber",
  "ingresos-gastos-y-caja",
  "activos-financieros",
  "cuentas-por-cobrar",
  "inventarios-periodico",
  "repaso-diario",
]);

export default function App() {
  /*
   * ═══════════ LA VISTA VIVE EN LA URL, NO EN ESTADO SUELTO ═══════════
   *
   * Antes era un useState y recargar devolvía a la portada desde cualquier
   * punto, con el botón atrás sacando del sitio porque no había ni una entrada
   * de historial que retroceder. Ahora la URL manda: recargar deja donde
   * estabas y atrás retrocede un paso.
   *
   * setView sigue existiendo con el mismo nombre y la misma forma —una función
   * de un argumento— para no tocar las llamadas repartidas por el archivo. Lo
   * que cambia es lo que hace por dentro.
   */
  const [ruta, navegar] = useRuta();
  const view = ruta.vista;
  const setView = useCallback((vista) => navegar(vista, null), [navegar]);

  /* A dónde vuelve el perfil o el panel docente: a donde estaba, no al inicio. */
  const [prevView, setPrevView] = useState("home");
  /*
   * Con qué mitad del tema se entró: "aprender", "hacer", o null cuando el tema
   * no tiene las dos y se entra directo. Lo elige la tarjeta partida del índice
   * y lo consume la vista del tema para filtrar sus mecánicas.
   */
  const modoTema = ruta.modo;

  /* Entrar a un tema, con o sin mitad elegida. */
  const abrirTema = (topicId, modo = null) => navegar(topicId, modo);

  const goHome = () => setView("home");

  /*
   * El logo y el indicador de cuenta viven fuera del árbol de vistas, así que
   * navegan por contexto en vez de recibir callbacks.
   */
  const navigation = {
    goHome,
    irAPerfil: () => { setPrevView(view); setView("perfil"); },
    irAPanelDocente: () => { setPrevView(view); setView("docente"); },
    /* La Tienda. Se entra desde el perfil y desde la pestaña «Nivel» del selector. */
    irATienda: () => { setPrevView(view); setView("tienda"); },
    /*
     * La navegación con estado en el hash. La usan los dos enlaces que cruzan
     * entre una actividad y su rendimiento; `prevView` se recuerda igual que
     * con el perfil, para que volver del panel devuelva a donde se estaba.
     */
    irA: (vista, modo = null, extra = null) => {
      setPrevView(view);
      navegar(vista, modo, { extra });
    },
    /*
     * A2: el nodo abierto de un tema, en la URL —ver useNodoEnRuta—.
     * REEMPLAZA la entrada en vez de empujar otra: abrir un juego no es una
     * página nueva para el botón atrás. Existe para que recargar devuelva al
     * camino con ese nodo a la vista.
     */
    marcarNodo: (extra) => navegar(view, ruta.modo, { extra, reemplazar: true }),
  };
  const siteFallback = <div style={{ minHeight: "100vh", backgroundColor: FAE.bg }} />;
  const wrap = (node) => (
    <NavigationContext.Provider value={navigation}>
      {node}
      <AccountControl conTitulo={VISTAS_CON_TITULO.has(view)} />
      <AuthDialog />
      {/* Escucha al motor de FP y confirma en pantalla. Se monta una sola vez. */}
      <AvisoFP />
      {/* Va aparte del aviso de FP: uno es la esquina, el otro el centro. */}
      <MomentoRacha />
    </NavigationContext.Provider>
  );

  if (view === "macroeconomia") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <MacroTopicIndex
          onOpenTopic={(topicId, modo) => {
            /*
             * Casi todos los temas se llaman igual que su vista; Demanda
             * Agregada tiene una por mitad. Esa excepción vive en vistaDeTema()
             * porque el enlace de vuelta del panel necesita la misma respuesta,
             * y dos copias de una excepción se separan en la primera edición.
             */
            abrirTema(vistaDeTema(topicId, modo) ?? topicId, modo);
          }}
        />
      </Suspense>
    );
  }

  if (view === "camino-da") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <DemandaAgregadaHacerView nodoInicial={ruta.extra} onBack={() => setView("macroeconomia")} />
      </Suspense>
    );
  }

  if (view === "grifos-da") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <DemandaAgregadaAprenderView onBack={() => setView("macroeconomia")} />
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

  if (view === "contabilidad") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <ContabilidadTopicIndex onOpenTopic={abrirTema} />
      </Suspense>
    );
  }

  /* El primer tema de Contabilidad, con sus dos mitades como los demás. */
  if (view === "introduccion-contabilidad") {
    return (
      <Suspense fallback={null}>
        <IntroContabilidadView modo={modoTema} nodoInicial={ruta.extra} onBack={() => setView("contabilidad")} />
      </Suspense>
    );
  }

  if (view === "cuentas-debe-haber") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <CuentasDebeHaberView modo={modoTema} nodoInicial={ruta.extra} onBack={() => setView("contabilidad")} />
      </Suspense>
    );
  }

  /* El Tema 3 de Contabilidad: por ahora, su primera pieza de Aprender. */
  if (view === "ingresos-gastos-y-caja") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <ContabilidadTema3View modo={modoTema} nodoInicial={ruta.extra} onBack={() => setView("contabilidad")} />
      </Suspense>
    );
  }

  /* El Tema 5 de Contabilidad (Célula B): por ahora, su pieza 1 de Aprender. Catálogo: decide Erwin. */
  if (view === "activos-financieros") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <ContabilidadTema5View onBack={() => setView("contabilidad")} />
      </Suspense>
    );
  }

  /* El Tema 6 de Contabilidad (Célula B): su pieza 1 de Aprender y su act. 1 de Hacer. Catálogo: decide Erwin. */
  if (view === "cuentas-por-cobrar") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <ContabilidadTema6View modo={modoTema} nodoInicial={ruta.extra} onBack={() => setView("contabilidad")} />
      </Suspense>
    );
  }

  /* T7-1 de Contabilidad (Célula C): por ahora, su pieza 1 de Aprender. */
  if (view === "inventarios-periodico") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <ContabilidadT7_1View onBack={() => setView("contabilidad")} />
      </Suspense>
    );
  }

  if (view === "pensamiento-sistemico") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <PensamientoSistemicoView modo={modoTema} nodoInicial={ruta.extra} onBack={() => setView("pensamiento-estrategico")} />
      </Suspense>
    );
  }

  if (view === "modelo-iceberg") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <IcebergView modo={modoTema} nodoInicial={ruta.extra} onBack={() => setView("pensamiento-estrategico")} />
      </Suspense>
    );
  }

  if (view === "politica-economica") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <PoliticaEconomicaView modo={modoTema} nodoInicial={ruta.extra} onBack={() => setView("macroeconomia")} />
      </Suspense>
    );
  }

  if (view === "politica-fiscal") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <PoliticaFiscalView modo={modoTema} nodoInicial={ruta.extra} onBack={() => setView("macroeconomia")} />
      </Suspense>
    );
  }

  if (view === "politica-monetaria") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <PoliticaMonetariaView modo={modoTema} nodoInicial={ruta.extra} onBack={() => setView("macroeconomia")} />
      </Suspense>
    );
  }

  if (view === "repaso-diario") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <RepasoView onBack={() => setView("macroeconomia")} />
      </Suspense>
    );
  }

  if (view === "docente") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <PanelDocente
          actividadInicial={ruta.extra}
          onBack={() => setView(prevView === "docente" ? "home" : prevView)}
        />
      </Suspense>
    );
  }

  if (view === "perfil") {
    return wrap(
      <Suspense fallback={siteFallback}>
        {/*
          Volver devuelve a donde estaba el estudiante, no siempre al inicio.

          `seccion` es el tercer segmento del hash: #/perfil/avatar entra
          directo al selector de avatar, sin pasar por apodo y nombre real. Lo
          usa «Mi avatar» del menú de cuenta.
        */}
        <PerfilView
          seccion={ruta.extra}
          onBack={() => setView(prevView === "perfil" ? "home" : prevView)}
        />
      </Suspense>
    );
  }

  if (view === "tienda") {
    return wrap(
      <Suspense fallback={siteFallback}>
        {/* Se entra desde el perfil o desde el selector de avatar; vuelve a donde estaba. */}
        <TiendaView onBack={() => setView(prevView === "tienda" ? "perfil" : prevView)} />
      </Suspense>
    );
  }

  if (view === "fuerzas-porter") {
    return wrap(
      <Suspense fallback={siteFallback}>
        <PorterView modo={modoTema} nodoInicial={ruta.extra} onBack={() => setView("pensamiento-estrategico")} />
      </Suspense>
    );
  }

  /*
   * La portada, y también la salida por defecto. ruta.js filtra los hashes que
   * no son vistas conocidas, así que llegar aquí con otra cosa no debería
   * pasar; si pasa, se ve la portada y no una pantalla en blanco.
   */
  return wrap(<HomeScreen onSelectSubject={(subject) => setView(subject)} />);
}
