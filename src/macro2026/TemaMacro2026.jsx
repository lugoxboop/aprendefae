/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · LO PUBLICADO DE CADA TEMA (Aprender y Hacer)
 *
 * Una sola vista para los temas nuevos de Macroeconomía. Cada tema ve SOLO
 * las piezas anotadas en su lista de publicadas (PUBLICADAS_T1, PUBLICADAS_T2)
 * y declaradas en subjects.js; lo que no está publicado no se carga ni se
 * enlaza desde aquí (sigue en la vista previa por dirección, que esta vista
 * no nombra).
 *
 * Aprender: la lista y una pieza a la vez. No da FP ni escribe nada.
 * Hacer: el camino compartido (CaminoHacer) con los retos publicados y, al
 * terminar uno, el mismo flujo que las Hacer de Contabilidad: la
 * clasificación sale del catálogo (subjects.js = actividad_catalogo del
 * servidor), registrarActividadCompletada registra el intento y otorga el FP
 * (el servidor lo paga una sola vez por actividad), y la pantalla de resumen
 * común cierra la partida.
 *
 * Rutas: #/<tema>/aprender[/<id>] y #/<tema>/hacer[/<id>].
 * Las filas de volver llevan .fae-cabecera-titulo: así reservan el hueco de
 * la pastilla de FP (fija arriba a la izquierda) y no quedan debajo de ella.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createContext, lazy, Suspense, useContext, useState } from "react";
import { APRENDER, HACER, SUBJECTS, actividadesDeTipo, clasificacionDe } from "../data/subjects.js";
import { serializar } from "../ruta.js";
import CaminoHacer from "../components/shared/CaminoHacer.jsx";
import PantallaResumen, { ContextoResumen, useResumenDePartida, caeAlCierreDeSiempre } from "../components/shared/PantallaResumen.jsx";
import { useRecompensa } from "../components/shared/RecompensaCierre.jsx";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import * as T1 from "./demanda-agregada/catalogo.js";
import * as T2 from "./politica-economica/catalogo.js";
import { Raiz, Boton } from "./comun/ui.jsx";
import { FONDO, INK, INK_2 } from "./comun/colores-da.js";

const MATERIA = "macroeconomia";

/*
 * Qué componente pinta cada id publicable. Solo lo que ya se puede publicar:
 * una pieza sin componente aquí no se abre aunque alguien la anote.
 */
export const TEMAS_2026 = {
  "demanda-agregada": {
    titulo: "Demanda agregada",
    piezas: T1.PIEZAS_T1,
    publicada: T1.estaPublicada,
    componentes: {
      "da26-a1-carrito": lazy(() => import("./demanda-agregada/A1Carrito.jsx")),
      "da26-a2-vaso-renta": lazy(() => import("./demanda-agregada/A2VasoRenta.jsx")),
      "da26-a3-columpio-tasa": lazy(() => import("./demanda-agregada/A3ColumpioTasa.jsx")),
      "da26-a4-no-miran-renta": lazy(() => import("./demanda-agregada/A4NoMiranRenta.jsx")),
      "da26-a5-bisagra-ascensor": lazy(() => import("./demanda-agregada/A5BisagraAscensor.jsx")),
      "da26-a6-eco-multiplicador": lazy(() => import("./demanda-agregada/A6EcoMultiplicador.jsx")),
      "da26-h1-llena-carrito": lazy(() => import("./demanda-agregada/H1LlenaCarrito.jsx")),
      "da26-h4-empresario": lazy(() => import("./demanda-agregada/H4Empresario.jsx")),
      "da26-h3-gira-o-sube": lazy(() => import("./demanda-agregada/H3GiraOSube.jsx")),
      "da26-h2-arma-formula": lazy(() => import("./demanda-agregada/H2ArmaFormula.jsx")),
      "da26-h5-libreta": lazy(() => import("./demanda-agregada/H5Libreta.jsx")),
      "da26-h6-meta": lazy(() => import("./demanda-agregada/H6Meta.jsx")),
    },
  },
  "politica-economica": {
    titulo: "Política económica",
    piezas: T2.PIEZAS_T2,
    publicada: T2.estaPublicadaT2,
    componentes: {
      "pe26-a1-mecanico": lazy(() => import("./politica-economica/A1Mecanico.jsx")),
      "pe26-a2-fiebre": lazy(() => import("./politica-economica/A2Fiebre.jsx")),
      "pe26-a3-problema-resuelto": lazy(() => import("./politica-economica/A3ProblemaResuelto.jsx")),
      "pe26-a4-perillas": lazy(() => import("./politica-economica/A4Perillas.jsx")),
      "pe26-a5-escalera": lazy(() => import("./politica-economica/A5Escalera.jsx")),
      "pe26-h3-cables": lazy(() => import("./politica-economica/H3Cables.jsx")),
      "pe26-h1-seis-cajones": lazy(() => import("./politica-economica/H1SeisCajones.jsx")),
      "pe26-h2-grupo-logico": lazy(() => import("./politica-economica/H2GrupoLogico.jsx")),
      "pe26-h4-expediente": lazy(() => import("./politica-economica/H4Expediente.jsx")),
      "pe26-h5-dos-fiebres": lazy(() => import("./politica-economica/H5DosFiebres.jsx")),
    },
  },
};

/* Las piezas que se ven de un tema y una mitad: publicadas y con componente. */
export const piezasVisibles = (temaId, tipo) => {
  const t = TEMAS_2026[temaId];
  if (!t) return [];
  return t.piezas.filter((p) => p.tipo === tipo && t.publicada(p.id) && t.componentes[p.id]);
};

/*
 * Cómo se navega dentro del tema: con el `navegar` de App (onIr), no tocando
 * el hash a mano. CaminoHacer abre cada nodo DENTRO de una transición, y
 * mientras dura, useRuta no atiende hashchange (lo espera de `navegar`): con
 * el hash a mano la dirección cambiaba y la pantalla no. Sin onIr (pruebas),
 * se cae al hash.
 */
const irPorHash = (temaId, modo, id = null) => { window.location.hash = serializar(temaId, modo, id) || "#/"; };
const IrContexto = createContext(irPorHash);

function FilaVolver({ children }) {
  return (
    <div className="fae-cabecera-titulo" style={{ display: "flex", alignItems: "center", maxWidth: 640, margin: "0 auto 12px" }}>
      {children}
    </div>
  );
}

/* ─── Aprender ─── */

function ListaAprender({ temaId }) {
  const ir = useContext(IrContexto);
  const piezas = piezasVisibles(temaId, APRENDER);
  return (
    <div className="da26-tarjeta" data-tema-publicado={temaId}>
      <p className="da26-rotulo da26-mono" style={{ margin: 0 }}>MACROECONOMÍA · APRENDER</p>
      <h1 style={{ font: "700 22px/28px var(--planck-font-sans, system-ui)", margin: "6px 0 12px" }}>{TEMAS_2026[temaId].titulo}</h1>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
        {piezas.map((p, k) => (
          <li key={p.id}>
            <button type="button" className="da26-boton" data-abrir={p.id} onClick={() => ir(temaId, APRENDER, p.id)}
              style={{ width: "100%", minHeight: 44, display: "flex", gap: 10, alignItems: "center", textAlign: "left", borderRadius: 12 }}>
              <span className="da26-mono" style={{ color: INK_2, width: 22, flex: "none" }}>{k + 1}</span>
              <span style={{ flex: 1 }}>{p.nombre}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PiezaAprender({ temaId, id }) {
  const ir = useContext(IrContexto);
  const tema = TEMAS_2026[temaId];
  const pieza = tema.piezas.find((p) => p.id === id);
  const Componente = tema.componentes[id];
  const [intento, setIntento] = useState(0);
  const [terminada, setTerminada] = useState(false);
  const piezas = piezasVisibles(temaId, APRENDER);
  const siguiente = piezas[piezas.findIndex((p) => p.id === id) + 1] ?? null;
  return (
    <>
      <FilaVolver><Boton onClick={() => ir(temaId, APRENDER)} data-volver-lista>‹ {tema.titulo}</Boton></FilaVolver>
      {terminada ? (
        <div className="da26-tarjeta" data-pieza-terminada={id}>
          <p style={{ margin: "0 0 12px", fontSize: 16 }}>Terminaste «{pieza.nombre}».</p>
          <div className="da26-nav">
            <Boton onClick={() => { setTerminada(false); setIntento((n) => n + 1); }}>Repetir</Boton>
            {siguiente
              ? <Boton primario onClick={() => ir(temaId, APRENDER, siguiente.id)}>Siguiente pieza</Boton>
              : <Boton primario onClick={() => ir(temaId, APRENDER)}>Volver al tema</Boton>}
          </div>
        </div>
      ) : (
        <Suspense fallback={<div className="da26-tarjeta" style={{ minHeight: 320 }} />}>
          <Componente key={intento} onTerminar={() => setTerminada(true)} />
        </Suspense>
      )}
    </>
  );
}

/* ─── Hacer ─── */

function CaminoRetos({ temaId }) {
  const ir = useContext(IrContexto);
  const hechas = useCompletadas();
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === temaId);
  const visibles = new Set(piezasVisibles(temaId, HACER).map((p) => p.id));
  const nodos = nodosDe(actividadesDeTipo(tema, HACER).filter((a) => visibles.has(a.id)), hechas);
  return (
    <div data-camino-macro2026={temaId}>
      <p className="da26-rotulo da26-mono" style={{ margin: "0 0 4px" }}>MACROECONOMÍA · HACER</p>
      <h1 style={{ font: "700 22px/28px var(--planck-font-sans, system-ui)", margin: "0 0 12px" }}>{TEMAS_2026[temaId].titulo}</h1>
      <CaminoHacer nodos={nodos} onAbrir={(id) => ir(temaId, HACER, id)} vacio="Este tema todavía no tiene retos." />
    </div>
  );
}

function RetoHacer({ temaId, id }) {
  const ir = useContext(IrContexto);
  const tema = TEMAS_2026[temaId];
  const pieza = tema.piezas.find((p) => p.id === id);
  const Componente = tema.componentes[id];
  const { pedirCuenta } = useAuth();
  const [recompensa, celebrar, celebrando] = useRecompensa();
  const resumen = useResumenDePartida(MATERIA, celebrando);
  const [intento, setIntento] = useState(0);
  const [cerrada, setCerrada] = useState(null);
  const volver = () => { resumen.limpiar(); ir(temaId, HACER); };
  const ctx = resumen.contexto(id, volver);
  const repetir = () => { resumen.limpiar(); setCerrada(null); setIntento((n) => n + 1); };

  const completar = async ({ pct, detalle, duracionMs }) => {
    setCerrada({ pct });
    const clas = clasificacionDe(MATERIA, temaId, id);
    celebrar(clas?.dificultad, id);
    const res = await resumen.registrar({ actividadId: id, clasificacion: clas, pct, detalle }, () =>
      registrarActividadCompletada(clas, {
        materiaId: MATERIA, temaId, actividadId: id, porcentajeAciertos: pct, duracionMs, detalle,
      }));
    if (res?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  let cuerpo;
  if (!cerrada) {
    cuerpo = (
      <Suspense fallback={<div className="da26-tarjeta" style={{ minHeight: 320 }} />}>
        <Componente key={intento} onTerminar={completar} />
      </Suspense>
    );
  } else if (!ctx.activa || caeAlCierreDeSiempre(ctx)) {
    /* El cierre de siempre: cuando la pantalla de resumen no aplica. */
    cuerpo = (
      <div className="da26-tarjeta" data-cierre-macro2026={id}>
        <p style={{ margin: "0 0 4px", fontSize: 16 }}>Terminaste «{pieza.nombre}».</p>
        <p className="da26-mono" style={{ margin: "0 0 12px", fontSize: 20 }}>{cerrada.pct} %</p>
        <div className="da26-nav">
          <Boton onClick={repetir}>Repetir</Boton>
          <Boton primario onClick={volver}>Volver a los retos</Boton>
        </div>
      </div>
    );
  } else {
    cuerpo = (
      <div className="da26-tarjeta" data-cierre-macro2026={id}>
        <ContextoResumen.Provider value={ctx}>
          <PantallaResumen onRepetir={repetir} />
        </ContextoResumen.Provider>
      </div>
    );
  }

  return (
    <>
      <FilaVolver><Boton onClick={volver} data-volver-camino>‹ Retos</Boton></FilaVolver>
      {recompensa}
      {cuerpo}
    </>
  );
}

export default function TemaMacro2026({ temaId, modo = null, extra = null, onBack, onIr = null }) {
  const tema = TEMAS_2026[temaId];
  const mitad = modo === HACER ? HACER : APRENDER;
  const id = extra ? String(extra).split("?")[0] : null;
  const pieza = id && tema?.publicada(id) && tema.componentes[id] ? tema.piezas.find((p) => p.id === id && p.tipo === mitad) : null;
  return (
    <div style={{ minHeight: "100vh", background: FONDO, color: INK }}>
      <IrContexto.Provider value={onIr ? (t, m, i = null) => onIr(t, m, i) : irPorHash}>
      <Raiz data-macro2026-publicado={temaId}>
        <div style={{ padding: "16px 16px 56px", maxWidth: 672, margin: "0 auto" }}>
          {!pieza && <FilaVolver><Boton onClick={onBack} data-volver-indice>‹ Macroeconomía</Boton></FilaVolver>}
          {pieza && mitad === HACER && <RetoHacer key={pieza.id} temaId={temaId} id={pieza.id} />}
          {pieza && mitad === APRENDER && <PiezaAprender key={pieza.id} temaId={temaId} id={pieza.id} />}
          {!pieza && mitad === HACER && <CaminoRetos temaId={temaId} />}
          {!pieza && mitad === APRENDER && <ListaAprender temaId={temaId} />}
        </div>
      </Raiz>
      </IrContexto.Provider>
    </div>
  );
}
