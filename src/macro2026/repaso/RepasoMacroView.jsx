/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · EL REPASO DIARIO EN EL SITIO («la ronda del economista»).
 *
 * Publicado el 25-nov-2026 con el visto bueno de Mateo. Es la página a la que
 * lleva el banner del índice de Macroeconomía (#/repaso-diario-macro).
 *
 * Usa el MISMO motor y los mismos datos que el de Contabilidad (useRepaso):
 * estado (desbloqueo, hecho hoy), historial y la tirada del día. Lo que cambia
 * es la partida: en vez de PartidaRepaso monta RepasoMacro, que dibuja cada
 * consulta con la escena de su tema. Por eso no pasa por RepasoView, que es
 * de la paleta oscura de Contabilidad.
 *
 *  · LA TIRADA ES LA DEL BANNER. Los ítems salen de vistaPreviaDelDia
 *    (sembrada con estudiante y día, y con la regla de los cinco temas dentro);
 *    aquí solo se sortean las cifras de cada consulta (consultasDe).
 *  · LA RONDA SE GUARDA EN ESTADO al empezar. Al terminar, el día queda hecho
 *    y useRepaso pasa a «hecho-hoy»; si la partida dependiera de ese estado,
 *    el balance desaparecería justo cuando el estudiante lo va a leer.
 *  · LOS FP SE REGISTRAN UNA VEZ: 60 × % de aciertos, renovable a diario (lo
 *    decide el servidor con la clasificación). «Otra ronda de práctica» arma
 *    otra ronda con cifras nuevas y no registra nada.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { lazy, Suspense, useEffect, useState } from "react";
import { ACTIVIDADES_TRANSVERSALES } from "../../data/subjects.js";
import { MENSAJES } from "../../repaso/repaso.js";
import { useRepaso } from "../../repaso/useRepaso.js";
import { registrarActividadCompletada } from "../../fp/registrarActividad.js";
import { useRecompensa } from "../../components/shared/RecompensaCierre.jsx";
import { useAuth } from "../../auth/AuthProvider.jsx";
import FondoPagina from "../comun/FondoPagina.jsx";
import { Boton, Raiz } from "../comun/ui.jsx";
import { INK, INK_2 } from "../comun/colores-da.js";
import { MascotaRol } from "../comun/mascotas.jsx";
import { ID_REPASO_MACRO, armarRonda, consultasDe } from "./ronda.js";

const RepasoMacro = lazy(() => import("./RepasoMacro.jsx"));

const MENSAJE_DE_ESTADO = {
  "pocas-actividades": MENSAJES.pocasActividades,
  "pool-corto": MENSAJES.poolCorto,
  "hecho-hoy": MENSAJES.hechoHoy,
};

function Aviso({ estado, onPractica, onBack }) {
  const hecho = estado === "hecho-hoy";
  return (
    <div className="da26-tarjeta" data-repaso-macro-aviso={estado} style={{ textAlign: "center", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        <MascotaRol id="profesor" pose={hecho ? "libro" : "pregunta"} alto={150} rotulo={false} decorativa />
      </div>
      <h2 style={{ margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: 22, lineHeight: 1.2, color: INK }}>
        {hecho ? "Repaso de hoy, listo" : "Aún no hay ronda"}
      </h2>
      <p data-mensaje-repaso={estado} style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.55, color: INK_2 }}>
        {MENSAJE_DE_ESTADO[estado]}
        {hecho && " Si quieres, juega una ronda de práctica: no suma FP."}
      </p>
      <div className="da26-nav" style={{ justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
        <Boton onClick={onBack} data-volver-indice>Volver a Macroeconomía</Boton>
        {hecho && <Boton primario onClick={onPractica} data-practica>Ronda de práctica</Boton>}
      </div>
    </div>
  );
}

export default function RepasoMacroView({ onBack }) {
  const { pedirCuenta } = useAuth();
  const [recompensa, celebrar] = useRecompensa();
  const REPASO = ACTIVIDADES_TRANSVERSALES.find((a) => a.id === ID_REPASO_MACRO);
  const { cargando, error, datos, estado, previa, marcarHechoHoy } = useRepaso(ID_REPASO_MACRO);
  /* { n, consultas, practica }: la ronda en juego, guardada al empezar. */
  const [ronda, setRonda] = useState(null);

  useEffect(() => {
    if (!ronda && estado === "listo" && previa) setRonda({ n: 0, consultas: consultasDe(previa.items), practica: false });
  }, [ronda, estado, previa]);

  const practicar = () => setRonda((r) => ({
    n: (r?.n ?? 0) + 1,
    consultas: armarRonda({ historial: datos?.historial ?? new Map() }),
    practica: true,
  }));

  const terminar = async (pct, ms, detalle) => {
    celebrar(REPASO.clasificacion.dificultad, ID_REPASO_MACRO);
    /* Hecho hoy desde ya: si vuelve al índice, el banner no espera a la red. */
    marcarHechoHoy();
    const resultado = await registrarActividadCompletada(REPASO.clasificacion, {
      materiaId: REPASO.materiaId,
      temaId: REPASO.temaId,
      actividadId: ID_REPASO_MACRO,
      porcentajeAciertos: pct,
      duracionMs: ms,
      detalle,
    });
    if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  let cuerpo;
  if (ronda) {
    cuerpo = (
      <Suspense fallback={<div className="da26-tarjeta" style={{ minHeight: 320 }} />}>
        <RepasoMacro
          key={ronda.n}
          consultas={ronda.consultas}
          conPortada={!ronda.practica}
          onTerminar={ronda.practica ? null : terminar}
          onOtra={practicar}
          textoOtra="Otra ronda de práctica"
        />
      </Suspense>
    );
  } else if (cargando || (estado === "listo" && previa)) {
    cuerpo = <div className="da26-tarjeta" role="status" style={{ minHeight: 320, color: INK_2 }}>Cargando…</div>;
  } else if (error) {
    cuerpo = <div className="da26-tarjeta" role="alert" style={{ color: INK }}>No se pudo cargar el Repaso. Intenta de nuevo en un momento.</div>;
  } else {
    cuerpo = <Aviso estado={estado} onPractica={practicar} onBack={onBack} />;
  }

  return (
    <FondoPagina tema={null} style={{ color: INK }}>
      <Raiz data-repaso-macro-vista>
        {recompensa}
        <div style={{ padding: "16px 16px 56px", maxWidth: 672, margin: "0 auto" }}>
          <div className="fae-cabecera-titulo" style={{ display: "flex", alignItems: "center", maxWidth: 640, margin: "0 auto 12px" }}>
            <Boton onClick={onBack} data-volver-indice>‹ Macroeconomía</Boton>
          </div>
          {cuerpo}
        </div>
      </Raiz>
    </FondoPagina>
  );
}
