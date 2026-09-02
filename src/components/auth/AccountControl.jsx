import { useState, useEffect, useRef, useContext } from "react";
import { FAE } from "../../theme.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { NavigationContext } from "../../navigation.js";
import { rachaVigente } from "../../fp/racha.js";
import GoogleSignInButton from "./GoogleSignInButton.jsx";

/*
 * Control de cuenta fijo arriba a la derecha, en todas las páginas.
 * Es el espejo del logo (arriba a la izquierda), así que ninguno de los dos
 * estorba al otro ni a lo que ya vive en las cabeceras.
 *
 * Sin sesión muestra el botón oficial de Google; con sesión, el apodo y la
 * salida.
 */
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
  if (cargando) return <div style={{ ...envoltorio, width: "1px", height: "1px" }} />;

  if (!session) {
    return (
      <div style={envoltorio}>
        <GoogleSignInButton size="medium" />
      </div>
    );
  }

  /* Con sesión pero sin perfil, el diálogo de apodo ya está encima. */
  const etiqueta = perfil?.nickname ?? "Tu cuenta";

  return (
    <div style={envoltorio} ref={caja}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        style={{
          display: "inline-flex",
          alignItems: "center",
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
          style={{
            width: "18px", height: "18px", borderRadius: "999px", flexShrink: 0,
            background: "rgba(42,157,143,0.28)", border: `1px solid ${FAE.teal}`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "10px", color: FAE.teal,
          }}
        >
          {etiqueta.charAt(0).toUpperCase()}
        </span>
        {etiqueta}
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
