/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GESTIÓN DE PROYECTOS · LAS HACER: el camino de un módulo y cada reto
 *
 * Sobre el contrato de Magno (estructura.js + catalogo.js): una Hacer se ve si
 * está en PIEZAS[<módulo>], en PUBLICADAS y tiene componente aquí. El camino
 * se pinta dentro de la página de la materia (Materia.jsx); cada reto vive en
 * #/gestion-proyectos/hacer/<id>.
 *
 * El flujo de cierre es el de Macro 2026 (src/macro2026/TemaMacro2026.jsx):
 * la clasificación sale de subjects.js (= catalogo.js = actividad_catalogo,
 * migración 0276), registrarActividadCompletada registra el intento y otorga
 * el FP (el servidor lo paga una sola vez por actividad) y abre la pantalla
 * de resumen común.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { lazy, Suspense, useEffect, useState } from "react";
import { HACER, clasificacionDe } from "../data/subjects.js";
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
import { MATERIA } from "./estructura.js";
import { PIEZAS, estaPublicada, todasLasPiezas } from "./catalogo.js";

/* Qué componente pinta cada id. Una pieza sin componente aquí no se abre. */
export const COMPONENTES_GP = {
  "gp26-fun-h01-bandeja": lazy(() => import("./fundamentos/H01Bandeja.jsx")),
  "gp26-fun-h02-reloj": lazy(() => import("./fundamentos/H02Reloj.jsx")),
  "gp26-fun-h03-sellos": lazy(() => import("./fundamentos/H03Sellos.jsx")),
  "gp26-fun-h04-puente": lazy(() => import("./fundamentos/H04Puente.jsx")),
  "gp26-fun-h05-portafolio": lazy(() => import("./fundamentos/H05Portafolio.jsx")),
  "gp26-fun-h06-lineas": lazy(() => import("./fundamentos/H06Lineas.jsx")),
  "gp26-fun-h07-puerta": lazy(() => import("./fundamentos/H07Puerta.jsx")),
  "gp26-fun-h08-calendario": lazy(() => import("./fundamentos/H08Calendario.jsx")),
  "gp26-fun-h09-central": lazy(() => import("./fundamentos/H09Central.jsx")),
  "gp26-fun-h10-cafetera": lazy(() => import("./fundamentos/H10Cafetera.jsx")),
  "gp26-fun-h11-caso-puente": lazy(() => import("./fundamentos/H11CasoPuente.jsx")),
  "gp26-fun-h12-balanzas": lazy(() => import("./fundamentos/H12Balanzas.jsx")),
  "gp26-fun-h13-memorando": lazy(() => import("./fundamentos/H13Memorando.jsx")),
  "gp26-fun-h14-sobre": lazy(() => import("./fundamentos/H14Sobre.jsx")),
  "gp26-fun-h15-control": lazy(() => import("./fundamentos/H15Control.jsx")),
  "gp26-fun-h16-nudos": lazy(() => import("./fundamentos/H16Nudos.jsx")),
  "gp26-fun-h17-dial": lazy(() => import("./fundamentos/H17Dial.jsx")),
  "gp26-fun-h18-pmo": lazy(() => import("./fundamentos/H18Pmo.jsx")),
  /* Lote 2 · cap. 3 (fundamentos) */
  "gp26-fun-c03-h01-orquesta": lazy(() => import("./fundamentos/C03H01Orquesta.jsx")),
  "gp26-fun-c03-h02-tranvia": lazy(() => import("./fundamentos/C03H02Tranvia.jsx")),
  "gp26-fun-c03-h03-taburete": lazy(() => import("./fundamentos/C03H03Taburete.jsx")),
  "gp26-fun-c03-h04-llavero": lazy(() => import("./fundamentos/C03H04Llavero.jsx")),
  "gp26-fun-c03-h05-moneda": lazy(() => import("./fundamentos/C03H05Moneda.jsx")),
  "gp26-fun-c03-h06-comandas": lazy(() => import("./fundamentos/C03H06Comandas.jsx")),
  "gp26-fun-c03-h07-mosaico": lazy(() => import("./fundamentos/C03H07Mosaico.jsx")),
  /* Lote 2 · cap. 4 (Integración, repartido por grupo de procesos) */
  "gp26-ini-c04-h01-acta": lazy(() => import("./integracion/C04H01Acta.jsx")),
  "gp26-ini-c04-h02-expositor": lazy(() => import("./integracion/C04H02Expositor.jsx")),
  "gp26-pla-c04-h03-portaplanos": lazy(() => import("./integracion/C04H03Portaplanos.jsx")),
  "gp26-eje-c04-h04-carretillas": lazy(() => import("./integracion/C04H04Carretillas.jsx")),
  "gp26-eje-c04-h05-bitacora": lazy(() => import("./integracion/C04H05Bitacora.jsx")),
  "gp26-eje-c04-h06-recetario": lazy(() => import("./integracion/C04H06Recetario.jsx")),
  "gp26-moc-c04-h07-camara": lazy(() => import("./integracion/C04H07Camara.jsx")),
  "gp26-moc-c04-h08-turnero": lazy(() => import("./integracion/C04H08Turnero.jsx")),
  "gp26-cie-c04-h09-breakers": lazy(() => import("./integracion/C04H09Breakers.jsx")),
  "gp26-cie-c04-h10-beneficiadero": lazy(() => import("./integracion/C04H10Beneficiadero.jsx")),
};

/* Las Hacer que se ven de un módulo: publicadas y con componente, en el orden del camino. */
export const hacerVisibles = (moduloId) =>
  (PIEZAS[moduloId] ?? []).filter((pz) => pz.tipo === HACER && estaPublicada(pz.id) && COMPONENTES_GP[pz.id]);

export const rutaDeHacer = (id) => serializar(MATERIA, HACER, id);
const irA = (hash) => { window.location.hash = hash || "#/"; };

/* El camino de Hacer de un módulo, para la página de la materia. */
/*
 * `onAbrir` es el navegar de App: CaminoHacer abre dentro de una transición y
 * useRuta ignora un hashchange que llega durante una, así que solo asignar el
 * hash no basta (el respaldo es para pruebas y usos sueltos).
 */
export function CaminoHacerGP({ moduloId, onAbrir = null }) {
  const hechas = useCompletadas();
  const nodos = nodosDe(hacerVisibles(moduloId).map(({ id, nombre, clasificacion }) => ({ id, nombre, clasificacion })), hechas);
  return (
    <Raiz data-camino-gp={moduloId}>
      <CaminoHacer nodos={nodos} onAbrir={(id) => (onAbrir ? onAbrir(id) : irA(rutaDeHacer(id)))} vacio="Este módulo todavía no tiene retos." />
    </Raiz>
  );
}

function FilaVolver({ children }) {
  return <div className="fae-cabecera-titulo" style={{ display: "flex", alignItems: "center", maxWidth: 640, margin: "0 auto 12px" }}>{children}</div>;
}

function Reto({ pieza, onVolver }) {
  const { id, moduloId } = pieza;
  const Componente = COMPONENTES_GP[id];
  const { pedirCuenta } = useAuth();
  const [recompensa, celebrar, celebrando] = useRecompensa();
  const resumen = useResumenDePartida(MATERIA, celebrando);
  const [intento, setIntento] = useState(0);
  const [cerrada, setCerrada] = useState(null);
  const volver = () => { resumen.limpiar(); onVolver(); };
  const ctx = resumen.contexto(id, volver);
  const repetir = () => { resumen.limpiar(); setCerrada(null); setIntento((n) => n + 1); };

  const completar = async ({ pct, detalle, duracionMs }) => {
    setCerrada({ pct });
    const clas = clasificacionDe(MATERIA, moduloId, id);
    celebrar(clas?.dificultad, id);
    const res = await resumen.registrar({ actividadId: id, clasificacion: clas, pct, detalle }, () =>
      registrarActividadCompletada(clas, {
        materiaId: MATERIA, temaId: moduloId, actividadId: id, porcentajeAciertos: pct, duracionMs, detalle,
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

/* #/gestion-proyectos/hacer/<id>. Un id que no está publicado vuelve a la materia. */
export default function HacerGP({ extra = null, onBack }) {
  const id = extra ? String(extra).split("?")[0] : null;
  const pieza = todasLasPiezas().find((pz) => pz.id === id && pz.tipo === HACER && estaPublicada(pz.id) && COMPONENTES_GP[pz.id]);
  useEffect(() => { if (!pieza) onBack?.(); }, [pieza, onBack]);
  if (!pieza) return null;
  return (
    <FondoGP style={{ color: INK }}>
      <Raiz data-gp-hacer={pieza.id}>
        <div style={{ padding: "16px 16px 56px", maxWidth: 672, margin: "0 auto" }}>
          <Reto key={pieza.id} pieza={pieza} onVolver={onBack} />
        </div>
      </Raiz>
    </FondoGP>
  );
}
