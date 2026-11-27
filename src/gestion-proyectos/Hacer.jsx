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
  /* Lote 3 · cap. 5 (Alcance) */
  "gp26-pla-c05-h01-teatro": lazy(() => import("./alcance/C05H01Teatro.jsx")),
  "gp26-pla-c05-h02-noria": lazy(() => import("./alcance/C05H02Noria.jsx")),
  "gp26-pla-c05-h03-libretas": lazy(() => import("./alcance/C05H03Libretas.jsx")),
  "gp26-pla-c05-h04-mochila": lazy(() => import("./alcance/C05H04Mochila.jsx")),
  "gp26-pla-c05-h05-urna": lazy(() => import("./alcance/C05H05Urna.jsx")),
  "gp26-pla-c05-h06-alacena": lazy(() => import("./alcance/C05H06Alacena.jsx")),
  "gp26-pla-c05-h07-telar": lazy(() => import("./alcance/C05H07Telar.jsx")),
  "gp26-pla-c05-h08-mapa": lazy(() => import("./alcance/C05H08Mapa.jsx")),
  "gp26-pla-c05-h09-movil": lazy(() => import("./alcance/C05H09Movil.jsx")),
  "gp26-pla-c05-h10-caja-fuerte": lazy(() => import("./alcance/C05H10CajaFuerte.jsx")),
  "gp26-moc-c05-h11-embarque": lazy(() => import("./alcance/C05H11Embarque.jsx")),
  "gp26-moc-c05-h12-globo": lazy(() => import("./alcance/C05H12Globo.jsx")),
  /* Lote 3 · cap. 6 (Cronograma) */
  "gp26-pla-c06-h01-semaforo": lazy(() => import("./cronograma/C06H01Semaforo.jsx")),
  "gp26-pla-c06-h02-linterna": lazy(() => import("./cronograma/C06H02Linterna.jsx")),
  "gp26-pla-c06-h03-rompecabezas": lazy(() => import("./cronograma/C06H03Rompecabezas.jsx")),
  "gp26-pla-c06-h04-cinta": lazy(() => import("./cronograma/C06H04Cinta.jsx")),
  "gp26-pla-c06-h05-sumadora": lazy(() => import("./cronograma/C06H05Sumadora.jsx")),
  "gp26-pla-c06-h06-alcancias": lazy(() => import("./cronograma/C06H06Alcancias.jsx")),
  "gp26-pla-c06-h07-metro": lazy(() => import("./cronograma/C06H07Metro.jsx")),
  "gp26-pla-c06-h08-domino": lazy(() => import("./cronograma/C06H08Domino.jsx")),
  "gp26-pla-c06-h09-relevos": lazy(() => import("./cronograma/C06H09Relevos.jsx")),
  "gp26-pla-c06-h10-bloques": lazy(() => import("./cronograma/C06H10Bloques.jsx")),
  "gp26-moc-c06-h11-rotafolio": lazy(() => import("./cronograma/C06H11Rotafolio.jsx")),
  "gp26-pla-c06-h12-plotter": lazy(() => import("./cronograma/C06H12Plotter.jsx")),
  /* Lote 4 · cap. 7 (Costos) */
  "gp26-pla-c07-h01-plan-costos": lazy(() => import("./costos/C07H01Cajones.jsx")),
  "gp26-pla-c07-h02-metodos": lazy(() => import("./costos/C07H02Mesa.jsx")),
  "gp26-pla-c07-h03-tres-valores": lazy(() => import("./costos/C07H03Calculadora.jsx")),
  "gp26-pla-c07-h04-embudo": lazy(() => import("./costos/C07H04Embudo.jsx")),
  "gp26-pla-c07-h05-reservas": lazy(() => import("./costos/C07H05Barriles.jsx")),
  "gp26-pla-c07-h06-polea": lazy(() => import("./costos/C07H06Polea.jsx")),
  "gp26-pla-c07-h07-curva-s": lazy(() => import("./costos/C07H07CurvaS.jsx")),
  "gp26-moc-c07-h08-lona": lazy(() => import("./costos/C07H08Lona.jsx")),
  "gp26-moc-c07-h09-termometros": lazy(() => import("./costos/C07H09Termometros.jsx")),
  "gp26-moc-c07-h10-telescopio": lazy(() => import("./costos/C07H10Telescopio.jsx")),
  "gp26-moc-c07-h11-rampa": lazy(() => import("./costos/C07H11Rampa.jsx")),
  "gp26-moc-c07-h12-libro": lazy(() => import("./costos/C07H12Libro.jsx")),
  /* Lote 4 · cap. 8 (Calidad) */
  "gp26-pla-c08-h01-gondola": lazy(() => import("./calidad/C08H01Gondola.jsx")),
  "gp26-pla-c08-h02-cubetas": lazy(() => import("./calidad/C08H02Cubetas.jsx")),
  "gp26-pla-c08-h03-ascensor": lazy(() => import("./calidad/C08H03Ascensor.jsx")),
  "gp26-pla-c08-h04-plano": lazy(() => import("./calidad/C08H04Plano.jsx")),
  "gp26-eje-c08-h05-casilleros": lazy(() => import("./calidad/C08H05Casilleros.jsx")),
  "gp26-eje-c08-h06-espina": lazy(() => import("./calidad/C08H06Espina.jsx")),
  "gp26-moc-c08-h07-hoja": lazy(() => import("./calidad/C08H07Hoja.jsx")),
  "gp26-moc-c08-h08-monitor": lazy(() => import("./calidad/C08H08Monitor.jsx")),
  "gp26-eje-c08-h09-tablero": lazy(() => import("./calidad/C08H09Tablero.jsx")),
  "gp26-eje-c08-h10-auditoria": lazy(() => import("./calidad/C08H10Auditoria.jsx")),
  "gp26-eje-c08-h11-cadena": lazy(() => import("./calidad/C08H11Cadena.jsx")),
  "gp26-moc-c08-h12-despacho": lazy(() => import("./calidad/C08H12Despacho.jsx")),
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
