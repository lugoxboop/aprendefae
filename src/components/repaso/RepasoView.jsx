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
import { useRepaso } from "../../repaso/useRepaso.js";
import PartidaRepaso from "./PartidaRepaso.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PARTIDA DEL REPASO DIARIO.
 *
 * ═══════════ AQUÍ HABÍA UNA PANTALLA INTERMEDIA, Y YA NO ═══════════
 *
 * Esta vista enseñaba primero el pasillo con las puertas de lo ya jugado y un
 * botón de «Empezar el repaso», y solo después las preguntas. Eran dos toques
 * y una pantalla entera para decidir algo que ya venía decidido: quien entra
 * al Repaso viene a repasar.
 *
 * Esa información —qué temas entran hoy, cuántos ítems, cuántos FP— vive ahora
 * en el banner del índice, que se expande en su sitio. Esta vista arranca la
 * partida directamente.
 *
 * ═══════════ LA MEZCLA ES LA MISMA QUE PROMETIÓ EL BANNER ═══════════
 *
 * El banner dice «Hoy entran: A · B · C» antes de pulsar, y aquí se vuelve a
 * calcular. Las dos tiradas coinciden porque el barajado va sembrado con el
 * estudiante y el día —ver vistaPreviaDelDia—: sin eso el banner prometería
 * unos temas y saldrían otros.
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

export default function RepasoView({ onBack }) {
  const { pedirCuenta } = useAuth();
  const [recompensa, celebrar] = useRecompensa();
  const { cargando, error, datos, estado, previa, marcarHechoHoy } = useRepaso();

  const terminar = async (pct, ms, detalle) => {
    celebrar(REPASO.clasificacion.dificultad, ID_REPASO);
    /* Hecho hoy desde ya: el mensaje de «vuelve mañana» no espera a la red. */
    marcarHechoHoy();
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

  /*
   * Se puede llegar aquí con el hash escrito a mano, sin pasar por el banner y
   * sin cumplir las condiciones. Por eso los mensajes de estado se quedan: esta
   * es la única pantalla donde decir por qué no hay partida.
   */
  const mensaje = estado ? MENSAJE_DE_ESTADO[estado] : null;
  const jugando = !cargando && !error && estado === "listo" && previa;

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

          {cargando && (
            <p role="status" style={{ fontSize: "14px", color: "rgba(248,249,250,0.6)" }}>Cargando…</p>
          )}

          {error && (
            <p role="alert" style={{ fontSize: "14px", lineHeight: 1.55, color: "rgba(248,249,250,0.82)" }}>
              No se pudo cargar el Repaso. Intenta de nuevo en un momento.
            </p>
          )}

          {jugando && (
            <PartidaRepaso items={previa.items} historial={datos.historial} onTerminar={terminar} />
          )}

          {!cargando && !error && !jugando && mensaje && (
            <p data-mensaje-repaso={estado} style={{ margin: 0, fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.82)" }}>
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </FondoMateria>
  );
}
