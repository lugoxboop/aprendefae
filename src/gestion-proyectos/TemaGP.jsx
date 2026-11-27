/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · LA VISTA DE UN TEMA (camino de Hacer y cada reto)
 *
 * El mismo flujo que Macro 2026 (src/macro2026/TemaMacro2026.jsx), del que
 * copia el patrón: cada tema ve SOLO las piezas de su lista de publicadas y
 * declaradas en subjects.js. Al terminar un reto, la clasificación sale del
 * catálogo (subjects.js = actividad_catalogo del servidor, migración 0276),
 * registrarActividadCompletada registra el intento y otorga el FP (el
 * servidor lo paga una sola vez por actividad) y cierra la pantalla de
 * resumen común.
 *
 * Aún no hay Aprender (los hace Jane): el tema abre directo en su camino de
 * Hacer. Cuando lleguen, entran al catálogo con tipo "aprender".
 *
 * Rutas: #/<tema>/hacer[/<id>] (también #/<tema> a secas).
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { createContext, lazy, Suspense, useContext, useState } from "react";
import { HACER, SUBJECTS, actividadesDeTipo, clasificacionDe } from "../data/subjects.js";
import { serializar } from "../ruta.js";
import CaminoHacer from "../components/shared/CaminoHacer.jsx";
import PantallaResumen, { ContextoResumen, useResumenDePartida, caeAlCierreDeSiempre } from "../components/shared/PantallaResumen.jsx";
import { useRecompensa } from "../components/shared/RecompensaCierre.jsx";
import { useCompletadas, nodosDe } from "../hacer/completadas.js";
import { registrarActividadCompletada } from "../fp/registrarActividad.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { Raiz, Boton } from "../macro2026/comun/ui.jsx";
import { INK } from "../macro2026/comun/colores-da.js";
import FondoGP from "./comun/FondoGP.jsx";
import { MATERIA_GP as MATERIA, TEMAS_GP } from "./temas.js";

/* Qué componente pinta cada id. Una pieza sin componente aquí no se abre. */
export const COMPONENTES_GP = {
  "gp-h01-bandeja": lazy(() => import("./introduccion/H01Bandeja.jsx")),
  "gp-h02-reloj": lazy(() => import("./introduccion/H02Reloj.jsx")),
  "gp-h03-sellos": lazy(() => import("./introduccion/H03Sellos.jsx")),
  "gp-h04-puente": lazy(() => import("./introduccion/H04Puente.jsx")),
  "gp-h05-portafolio": lazy(() => import("./introduccion/H05Portafolio.jsx")),
  "gp-h06-lineas": lazy(() => import("./introduccion/H06Lineas.jsx")),
  "gp-h07-puerta": lazy(() => import("./introduccion/H07Puerta.jsx")),
  "gp-h08-calendario": lazy(() => import("./introduccion/H08Calendario.jsx")),
  "gp-h09-central": lazy(() => import("./introduccion/H09Central.jsx")),
  "gp-h10-cafetera": lazy(() => import("./introduccion/H10Cafetera.jsx")),
  "gp-h11-caso-puente": lazy(() => import("./introduccion/H11CasoPuente.jsx")),
  "gp-h12-balanzas": lazy(() => import("./introduccion/H12Balanzas.jsx")),
  "gp-h13-memorando": lazy(() => import("./introduccion/H13Memorando.jsx")),
  "gp-h14-sobre": lazy(() => import("./introduccion/H14Sobre.jsx")),
  "gp-h15-control": lazy(() => import("./entorno/H15Control.jsx")),
  "gp-h16-nudos": lazy(() => import("./entorno/H16Nudos.jsx")),
  "gp-h17-dial": lazy(() => import("./entorno/H17Dial.jsx")),
  "gp-h18-pmo": lazy(() => import("./entorno/H18Pmo.jsx")),
};

/* Las Hacer que se ven de un tema: publicadas y con componente. */
export const piezasVisiblesGP = (temaId) => {
  const t = TEMAS_GP[temaId];
  if (!t) return [];
  return t.piezas.filter((p) => p.tipo === HACER && t.publicada(p.id) && COMPONENTES_GP[p.id]);
};

const irPorHash = (temaId, modo, id = null) => { window.location.hash = serializar(temaId, modo, id) || "#/"; };
const IrContexto = createContext(irPorHash);

function FilaVolver({ children }) {
  return <div className="fae-cabecera-titulo" style={{ display: "flex", alignItems: "center", maxWidth: 640, margin: "0 auto 12px" }}>{children}</div>;
}

function CaminoRetos({ temaId }) {
  const ir = useContext(IrContexto);
  const hechas = useCompletadas();
  const tema = SUBJECTS[MATERIA].topics.find((t) => t.id === temaId);
  const visibles = new Set(piezasVisiblesGP(temaId).map((p) => p.id));
  const nodos = nodosDe(actividadesDeTipo(tema, HACER).filter((a) => visibles.has(a.id)), hechas);
  return (
    <div data-camino-gp={temaId}>
      <p className="da26-rotulo da26-mono" style={{ margin: "0 0 4px" }}>GESTIÓN DE PROYECTOS · CAP. {TEMAS_GP[temaId].capitulo} · HACER</p>
      <h1 style={{ font: "700 22px/28px var(--planck-font-sans, system-ui)", margin: "0 0 12px" }}>{TEMAS_GP[temaId].titulo}</h1>
      <CaminoHacer nodos={nodos} onAbrir={(id) => ir(temaId, HACER, id)} vacio="Este tema todavía no tiene retos." />
    </div>
  );
}

function RetoHacer({ temaId, id }) {
  const ir = useContext(IrContexto);
  const tema = TEMAS_GP[temaId];
  const pieza = tema.piezas.find((p) => p.id === id);
  const Componente = COMPONENTES_GP[id];
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
    cuerpo = (
      <div className="da26-tarjeta" data-cierre-gp={id}>
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
      <div className="da26-tarjeta" data-cierre-gp={id}>
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

export default function TemaGP({ temaId, extra = null, onBack, onIr = null }) {
  const tema = TEMAS_GP[temaId];
  const id = extra ? String(extra).split("?")[0] : null;
  const pieza = id && tema?.publicada(id) && COMPONENTES_GP[id] ? tema.piezas.find((p) => p.id === id && p.tipo === HACER) : null;
  return (
    <FondoGP style={{ color: INK }}>
      <IrContexto.Provider value={onIr ? (t, m, i = null) => onIr(t, m, i) : irPorHash}>
        <Raiz data-gp-tema={temaId}>
          <div style={{ padding: "16px 16px 56px", maxWidth: 672, margin: "0 auto" }}>
            {!pieza && <FilaVolver><Boton onClick={onBack} data-volver-indice>‹ Gestión de Proyectos</Boton></FilaVolver>}
            {pieza ? <RetoHacer key={pieza.id} temaId={temaId} id={pieza.id} /> : <CaminoRetos temaId={temaId} />}
          </div>
        </Raiz>
      </IrContexto.Provider>
    </FondoGP>
  );
}
