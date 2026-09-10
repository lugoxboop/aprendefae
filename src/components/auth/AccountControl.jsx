import { useState, useEffect, useRef, useContext } from "react";
import { FAE, ANCHO_ESTRECHO } from "../../theme.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { NavigationContext } from "../../navigation.js";
import { rachaVigente } from "../../fp/racha.js";
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
 */
/* El corte vive en theme.js: es el mismo en que el camino pasa a su forma de teléfono. */
const CSS_CUENTA = `
.fae-gsi-icono { display: none; }
@media (max-width: ${ANCHO_ESTRECHO}px) {
  .fae-reserva-cuenta { padding-right: 40px; }
  .fae-gsi-ancho { display: none; }
  .fae-gsi-icono { display: block; }
  .fae-cuenta-boton { width: 40px; height: 40px; padding: 0 !important; }
  .fae-cuenta-nombre { display: none; }
  .fae-cuenta-inicial { width: 26px !important; height: 26px !important; font-size: 12px !important; }
}
`;
const EstiloCuenta = () => <style>{CSS_CUENTA}</style>;

export default function AccountControl() {
  const { disponible, cargando, perfil, session, cerrarSesion } = useAuth();
  const nav = useContext(NavigationContext);
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => { if (caja.current && !caja.current.contains(e.target)) setAbierto(false); };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  /* Sin credenciales configuradas no se anuncia un login que no existe. */
  if (!disponible) return null;

  const envoltorio = {
    position: "fixed",
    top: "clamp(14px, 2.4vh, 24px)",
    right: "clamp(14px, 2.4vw, 24px)",
    zIndex: 40,
  };

  /* Mientras se resuelve la sesión guardada no se parpadea entre estados. */
  if (cargando) {
    return (
      <>
        <EstiloCuenta />
        <div style={{ ...envoltorio, width: "1px", height: "1px" }} />
      </>
    );
  }

  if (!session) {
    return (
      <div style={envoltorio}>
        <EstiloCuenta />
        <GoogleSignInButton size="medium" adaptable />
      </div>
    );
  }

  /* Con sesión pero sin perfil, el diálogo de apodo ya está encima. */
  const etiqueta = perfil?.nickname ?? "Tu cuenta";

  return (
    <div style={envoltorio} ref={caja}>
      <EstiloCuenta />
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
