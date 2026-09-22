import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../../theme.js";
import Logo from "../Logo.jsx";
import FondoMateria from "../shared/FondoMateria.jsx";
import ActivityBadge from "../shared/ActivityBadge.jsx";
import { useRecompensa } from "../shared/RecompensaCierre.jsx";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { registrarActividadCompletada } from "../../fp/registrarActividad.js";
import { ACTIVIDADES_TRANSVERSALES, HACER } from "../../data/subjects.js";
import { ID_REPASO, MENSAJES } from "../../repaso/repaso.js";
import { poolDe } from "../../repaso/items.js";
import { estadoRepaso, materiasCompletadas, seleccionarRepaso } from "../../repaso/seleccion.js";
import { leerHechas, leerHistorial, leerHechoHoy } from "../../repaso/datos.js";
import Pasillo from "./Pasillo.jsx";
import PartidaRepaso from "./PartidaRepaso.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL PASILLO — la vista del Repaso Diario.
 *
 * No es un nodo de ningún camino ni de ningún bloque: es su propia entrada en
 * el índice de Macroeconomía. Dentro, el pasillo con las puertas de lo ya
 * jugado y, según el día, el botón de empezar o uno de los tres mensajes de
 * Gen (B5), literales.
 *
 * Lo registra como cualquier actividad: registrarActividadCompletada con su
 * clasificación. El servidor decide los FP —base 60, renovable a diario— y la
 * racha se alimenta sola dentro de registrar_fp.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const REPASO = ACTIVIDADES_TRANSVERSALES.find((a) => a.id === ID_REPASO);

const MENSAJE_DE_ESTADO = {
  "pocas-actividades": MENSAJES.pocasActividades,
  "pool-corto": MENSAJES.poolCorto,
  "hecho-hoy": MENSAJES.hechoHoy,
};

const VACIO = { hechas: new Set(), historial: new Map(), hechoHoy: false };

export default function RepasoView({ onBack }) {
  const { session, cargando: cargandoSesion, pedirCuenta } = useAuth();
  const [recompensa, celebrar] = useRecompensa();

  /* null mientras carga; "error" si una lectura falló; si no, lo leído. */
  const [datos, setDatos] = useState(null);
  const [partida, setPartida] = useState(null);

  const idUsuario = session?.user?.id ?? null;

  useEffect(() => {
    if (cargandoSesion) return;
    let vivo = true;
    if (!idUsuario) {
      setDatos(VACIO);
      return;
    }
    setDatos(null);
    Promise.all([leerHechas(), leerHistorial(), leerHechoHoy()]).then(([hechas, historial, hechoHoy]) => {
      if (!vivo) return;
      if (hechas === null || historial === null || hechoHoy === null) setDatos("error");
      else setDatos({ hechas, historial, hechoHoy });
    });
    return () => { vivo = false; };
  }, [cargandoSesion, idUsuario]);

  const empezar = () => {
    const { items } = seleccionarRepaso({ pool: poolDe(datos.hechas), historial: datos.historial, ahora: new Date() });
    setPartida({ items, historial: datos.historial });
  };

  const terminar = async (pct, ms, detalle) => {
    celebrar(REPASO.clasificacion.dificultad, ID_REPASO);
    /* Hecho hoy desde ya: el mensaje de «vuelve mañana» no espera a la red. */
    setDatos((d) => (d && d !== "error" ? { ...d, hechoHoy: true } : d));
    const resultado = await registrarActividadCompletada(REPASO.clasificacion, {
      materiaId: REPASO.materiaId,
      temaId: REPASO.temaId,
      actividadId: ID_REPASO,
      porcentajeAciertos: pct,
      duracionMs: ms,
      detalle,
    });
    if (resultado?.motivo === "sin-sesion") pedirCuenta("guardar tus FP");
  };

  const listo = datos && datos !== "error";
  const estado = listo ? estadoRepaso(datos) : null;
  const mensaje = estado ? MENSAJE_DE_ESTADO[estado] : null;

  return (
    <FondoMateria materiaId="macroeconomia">
      {recompensa}
      <div style={{ minHeight: "100vh", backgroundColor: "transparent", fontFamily: "Inter, sans-serif", color: FAE.text, backgroundImage: "radial-gradient(circle at 50% -10%, rgba(42,157,143,0.14), transparent 55%)" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 16px 56px" }}>
          <div className="fae-cabecera-titulo" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
            <span className="fae-cabecera-marca"><Logo variant="symbol" size={26} theme="dark" /></span>
            <span aria-hidden="true" className="fae-cabecera-marca" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
            <button type="button" onClick={onBack} aria-label="Volver a Macroeconomía" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "999px", background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer" }}>
              <ChevronLeft size={20} color={FAE.text} />
            </button>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>{REPASO.nombre}</h1>
          </div>

          {/*
            LA INSIGNIA VIVE CON EL CONTENIDO, NO EN LA CABECERA.
          
            Es metadato de lo que hay debajo —no navegación, no estado— y no
            cambia mientras se juega: el estudiante ya la vio en la tarjeta que
            tocó para entrar. En la cabecera competía por el ancho con el título,
            y a 375 px se lo comía. Sale en TODOS los anchos, no solo en móvil.
          */}
          <div className="fae-insignia-actividad"><ActivityBadge tipo={HACER} size="sm" /></div>

          {!datos && (
            <p role="status" style={{ fontSize: "14px", color: "rgba(248,249,250,0.6)" }}>Cargando…</p>
          )}

          {datos === "error" && (
            <p role="alert" style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.82)" }}>
              No se pudo cargar el Repaso. Intenta de nuevo en un momento.
            </p>
          )}

          {listo && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <Pasillo materias={materiasCompletadas(datos.hechas)} />

              {partida ? (
                <PartidaRepaso items={partida.items} historial={partida.historial} onTerminar={terminar} />
              ) : estado === "listo" ? (
                <button
                  type="button"
                  onClick={empezar}
                  style={{ alignSelf: "flex-start", fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700, padding: "13px 22px", borderRadius: "14px", cursor: "pointer", background: FAE.teal, border: `1px solid ${FAE.teal}`, color: FAE.bg }}
                >
                  Empezar el repaso
                </button>
              ) : null}

              {mensaje && (!partida || estado === "hecho-hoy") && (
                <p data-mensaje-repaso={estado} style={{ margin: 0, fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.82)" }}>
                  {mensaje}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </FondoMateria>
  );
}
