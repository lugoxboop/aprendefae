import { useState, useEffect, useRef, useContext } from "react";
import { BarChart2 } from "lucide-react";
import { FAE, ANCHO_ESTRECHO } from "../../theme.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { NavigationContext } from "../../navigation.js";
import { rachaVigente } from "../../fp/racha.js";
import { useAccesoDocente, recordadoComoDocente } from "../../docente/useAccesoDocente.js";
import GoogleSignInButton from "./GoogleSignInButton.jsx";

/*
 * Control de cuenta fijo arriba a la derecha, en todas las páginas.
 *
 * Sin sesión muestra el botón oficial de Google; con sesión, el apodo y la
 * salida.
 *
 * ═══════════ EN MÓVIL SE ENCOGE, Y POR QUÉ ═══════════
 *
 * La nota de antes decía que era "el espejo del logo" y que no estorbaba a las
 * cabeceras. En escritorio es verdad. A 375 px no lo era: la pastilla "Acceder
 * con Google" medía 181×32 y, medida vista por vista, tapaba el título de LAS
 * ONCE —el h1 de cada tema, "Tu perfil", "Panel docente"— y, en la portada,
 * 171 px del propio logo. Lo veía cada estudiante que entraba desde el
 * teléfono, en cada pantalla, desde el primer día.
 *
 * Por debajo de ANCHO_ESTRECHO pasa a un círculo de 40×40: sin sesión, el
 * botón de Google en su forma de icono —oficial, lo dibuja su librería—; con
 * sesión, solo la inicial del apodo. 40 px es también el mínimo cómodo para el
 * dedo. Por encima de ese ancho, todo sigue exactamente como estaba.
 *
 * ═══════════ LO DECIDE EL CSS, NO JAVASCRIPT ═══════════
 *
 * Una media query elige la forma. Se intentó primero midiendo la ventana con
 * JavaScript y falló de tres maneras distintas, todas medidas: el ancho pasaba
 * por un valor transitorio al cargar y el control se quedaba en círculo en
 * escritorio; al girar, el aviso llegaba antes que la media query y el botón
 * iba un paso atrasado; y los temporizadores de respaldo se congelan con la
 * pestaña en segundo plano. El CSS lo evalúa el navegador en cada pintado.
 *
 * ═══════════ Y EL HUECO QUE RESERVA ═══════════
 *
 * Encoger no bastó: el círculo todavía tapaba el título largo de Pensamiento
 * Sistémico y la etiqueta «Hacer» / «Aprender» de Demanda Agregada. Así que
 * las filas de cabecera de las vistas de tema llevan la clase
 * `fae-reserva-cuenta`, y la regla vive AQUÍ, junto al elemento que necesita el
 * hueco: si el control cambia de tamaño, su reserva cambia en el mismo
 * archivo. 40 px: el círculo empieza a 54 px del borde y el contenido de las
 * páginas a 24, así que el texto queda a unos 8 px del círculo.
 *
 * ═══════════ EL ATAJO AL PANEL DOCENTE, Y POR QUÉ NO SIEMPRE ES PASTILLA ═══════════
 *
 * Un docente tiene una segunda pastilla, teal, a la izquierda de la cuenta:
 * «Panel docente», un toque y se está dentro. Pero solo desde ANCHO_ATAJO.
 * Medido con la pastilla real puesta en su sitio, en las doce vistas:
 *
 *   · A 375 px no cabe de ninguna forma. La completa (147 px) tapaba el título
 *     en diez de las doce; solo el icono (40 px), la insignia «Hacer /
 *     Aprender» en seis temas y el título de Pensamiento Sistémico. Ensanchar
 *     la reserva no lo arregla: la fila no encoge por debajo de su contenido y
 *     se sigue metiendo debajo, y en Iceberg y Porter el título salta de línea
 *     y todo baja 13,4 px. Debajo del círculo tapaba «El camino de este tema».
 *   · Por encima de ANCHO_ESTRECHO la cuenta es la pastilla con el apodo, sin
 *     reserva. La cabecera más larga —Demanda Agregada, con «Hacer»— llega a
 *     343 px del borde de su columna, y el apodo admite 20 letras: con uno de
 *     20 (200 px de pastilla) la pareja deja de tocarla a partir de unos 740 px.
 *     De ahí el corte en 768.
 *
 * Por debajo, el atajo es la primera opción del menú de la cuenta: dos toques
 * en vez de tres —cuenta, perfil, buscar el bloque— y ni un píxel en la
 * cabecera. Lo elige una media query, como todo lo de este archivo.
 *
 * La pregunta de si es docente es la misma de todo el sitio —useAccesoDocente,
 * una llamada por carga compartida con el perfil, el panel y las actividades—,
 * y un invitado no la hace: sin sesión este trozo ni se monta.
 */
/*
 * El corte del círculo, ANCHO_ESTRECHO, vive en theme.js: es el mismo en que el
 * camino pasa a su forma de teléfono. Este otro solo le importa a este control.
 */
const ANCHO_ATAJO = 768;

const CSS_CUENTA = `
.fae-gsi-icono { display: none; }
.fae-atajo-pastilla { display: inline-flex; }
.fae-atajo-menu { display: none; }
@media (max-width: ${ANCHO_ATAJO - 1}px) {
  .fae-atajo-pastilla { display: none; }
  .fae-atajo-menu { display: flex; }
}
@media (max-width: ${ANCHO_ESTRECHO}px) {
  .fae-reserva-cuenta { padding-right: 40px; }
  .fae-gsi-ancho { display: none; }
  .fae-gsi-icono { display: block; }
  .fae-cuenta-boton { width: 40px; height: 40px; padding: 0 !important; }
  .fae-cuenta-nombre { display: none; }
  .fae-cuenta-inicial { width: 26px !important; height: 26px !important; font-size: 12px !important; }
}
@keyframes fae-atajo-entra { from { opacity: 0; transform: translateX(6px); } to { opacity: 1; transform: none; } }
.fae-atajo-entra { animation: fae-atajo-entra 0.2s ease-out; }
@media (prefers-reduced-motion: reduce) { .fae-atajo-entra { animation: none; } }
`;
const EstiloCuenta = () => <style>{CSS_CUENTA}</style>;

const ENVOLTORIO = {
  position: "fixed",
  top: "clamp(14px, 2.4vh, 24px)",
  right: "clamp(14px, 2.4vw, 24px)",
  zIndex: 40,
};

export default function AccountControl() {
  const { disponible, cargando, perfil, session, cerrarSesion } = useAuth();

  /* Sin credenciales configuradas no se anuncia un login que no existe. */
  if (!disponible) return null;

  /* Mientras se resuelve la sesión guardada no se parpadea entre estados. */
  if (cargando) {
    return (
      <>
        <EstiloCuenta />
        <div style={{ ...ENVOLTORIO, width: "1px", height: "1px" }} />
      </>
    );
  }

  if (!session) {
    return (
      <div style={ENVOLTORIO}>
        <EstiloCuenta />
        <GoogleSignInButton size="medium" adaptable />
      </div>
    );
  }

  /* Una por cuenta: si se entra con otra, el atajo vuelve a decidir desde cero. */
  return <ConSesion key={session.user.id} usuarioId={session.user.id} perfil={perfil} cerrarSesion={cerrarSesion} />;
}

function ConSesion({ usuarioId, perfil, cerrarSesion }) {
  const nav = useContext(NavigationContext);
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);

  /*
   * ═══════════ QUE NO APAREZCA TARDE ═══════════
   *
   * La respuesta del servidor llega un momento después que la sesión, y un
   * botón que asoma cuando la cuenta ya está pintada se lee como algo roto. Si
   * este navegador ya vio al servidor confirmar a ESTA cuenta como docente, el
   * atajo sale a la vez que la cuenta y la respuesta solo lo confirma —o lo
   * quita, si se le retiró el acceso—. La primera vez no hay nada que
   * recordar: entonces entra con un fundido corto, que se lee como intención.
   */
  const acceso = useAccesoDocente();
  const [presumido] = useState(() => recordadoComoDocente(usuarioId));
  const esDocente = acceso.pendiente ? presumido : acceso.esDocente;
  const [estabaAlMontar] = useState(esDocente);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => { if (caja.current && !caja.current.contains(e.target)) setAbierto(false); };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  /* Con sesión pero sin perfil, el diálogo de apodo ya está encima. */
  const etiqueta = perfil?.nickname ?? "Tu cuenta";

  /* La misma ruta con estado en el hash que usa el atajo de cada actividad. */
  const irAlPanel = () => { setAbierto(false); nav?.irA?.("docente"); };

  return (
    <div style={ENVOLTORIO} ref={caja}>
      <EstiloCuenta />
      {esDocente && (
        <button
          type="button"
          className={`fae-atajo-pastilla${estabaAlMontar ? "" : " fae-atajo-entra"}`}
          onClick={irAlPanel}
          aria-label="Panel docente"
          style={{
            /*
             * Fuera del flujo, a la izquierda de la cuenta: su llegada no mueve
             * la pastilla de la cuenta ni un píxel, ni para el docente ni para
             * nadie. La caja pulsable mide 40 de alto —el mínimo para el dedo—,
             * centrada en la fila; la pastilla que se ve lleva el relleno y la
             * letra de la de la cuenta, así que mide lo mismo que ella: dos
             * pastillas de distinta altura en la misma fila se leen como un
             * error.
             */
            position: "absolute",
            right: "calc(100% + 8px)",
            top: 0,
            bottom: 0,
            margin: "auto 0",
            height: "40px",
            alignItems: "center",
            padding: 0,
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "8px 14px",
              borderRadius: "999px",
              whiteSpace: "nowrap",
              fontFamily: "Sora, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: FAE.text,
              /* El teal del bloque del perfil, a la intensidad de la pastilla de la cuenta. */
              background: "rgba(42,157,143,0.14)",
              border: `1px solid ${FAE.teal}99`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <BarChart2 size={15} color={FAE.teal} aria-hidden="true" />
            Panel docente
          </span>
        </button>
      )}
      <button
        type="button"
        className="fae-cuenta-boton"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        /* En móvil solo se ve la inicial: el nombre va aquí para quien no ve la pantalla. */
        aria-label={`Tu cuenta: ${etiqueta}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontFamily: "Sora, sans-serif",
          fontSize: "13px",
          fontWeight: 600,
          padding: "8px 14px",
          borderRadius: "999px",
          cursor: "pointer",
          background: "rgba(248,249,250,0.06)",
          border: "1px solid rgba(248,249,250,0.16)",
          color: FAE.text,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <span
          aria-hidden="true"
          className="fae-cuenta-inicial"
          style={{
            width: "18px", height: "18px", borderRadius: "999px", flexShrink: 0,
            background: "rgba(42,157,143,0.28)", border: `1px solid ${FAE.teal}`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "10px", color: FAE.teal,
          }}
        >
          {etiqueta.charAt(0).toUpperCase()}
        </span>
        <span className="fae-cuenta-nombre">{etiqueta}</span>
      </button>

      {abierto && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: "180px",
            borderRadius: "14px", background: "#16233A",
            border: "1px solid rgba(248,249,250,0.14)", padding: "8px",
            boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Donde la pastilla no cabe, el atajo va aquí, primero. */}
          {esDocente && (
            <button
              type="button"
              className="fae-atajo-menu"
              onClick={irAlPanel}
              aria-label="Panel docente"
              style={{
                width: "100%", alignItems: "center", gap: "8px", minHeight: "44px",
                marginBottom: "6px", padding: "0 10px", borderRadius: "9px", cursor: "pointer",
                fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600, textAlign: "left",
                background: "rgba(42,157,143,0.14)", border: `1px solid ${FAE.teal}99`, color: FAE.text,
              }}
            >
              <BarChart2 size={16} color={FAE.teal} aria-hidden="true" />
              Panel docente
            </button>
          )}
          {perfil && (
            <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid rgba(248,249,250,0.08)", marginBottom: "6px" }}>
              <p style={{ fontSize: "12px", color: "rgba(248,249,250,0.45)", margin: "0 0 3px" }}>Tu progreso</p>
              <p style={{ fontSize: "13px", color: FAE.text, margin: 0 }}>
                {perfil.points} pts · racha {rachaVigente(perfil)}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => { setAbierto(false); nav?.irAPerfil?.(); }}
            style={{
              width: "100%", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "13.5px",
              padding: "9px 10px", borderRadius: "9px", cursor: "pointer",
              background: "transparent", border: "none", color: "rgba(248,249,250,0.8)",
            }}
          >
            Ver mi perfil
          </button>
          <button
            type="button"
            onClick={() => { setAbierto(false); cerrarSesion(); }}
            style={{
              width: "100%", textAlign: "left", fontFamily: "Inter, sans-serif", fontSize: "13.5px",
              padding: "9px 10px", borderRadius: "9px", cursor: "pointer",
              background: "transparent", border: "none", color: "rgba(248,249,250,0.8)",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
