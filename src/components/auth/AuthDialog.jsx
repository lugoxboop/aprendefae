import { useEffect } from "react";
import { X } from "lucide-react";
import { FAE } from "../../theme.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import GoogleSignInButton from "./GoogleSignInButton.jsx";
import NicknameStep from "./NicknameStep.jsx";

/*
 * Diálogo de cuenta. Aparece solo cuando algo necesita guardarse o mirar datos
 * propios, nunca al cargar el sitio.
 *
 * Tiene dos estados: pedir el login, y —si es el primer ingreso— pedir el
 * apodo. El paso de apodo no se puede cerrar: mientras no haya perfil, la
 * cuenta está a medio crear.
 */
export default function AuthDialog() {
  const { motivoLogin, necesitaApodo, cerrarDialogo } = useAuth();

  const abierto = necesitaApodo || motivoLogin !== null;
  const puedeCerrar = !necesitaApodo;

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => { if (e.key === "Escape" && puedeCerrar) cerrarDialogo(); };
    window.addEventListener("keydown", onKey);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previo;
    };
  }, [abierto, puedeCerrar, cerrarDialogo]);

  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={necesitaApodo ? "Elige tu apodo" : "Iniciar sesión"}
      onClick={() => puedeCerrar && cerrarDialogo()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "rgba(10,20,34,0.78)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          borderRadius: "20px",
          background: "#16233A",
          border: "1px solid rgba(248,249,250,0.14)",
          padding: "clamp(22px, 4vw, 30px)",
          fontFamily: "Inter, sans-serif",
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        }}
      >
        {puedeCerrar && (
          <button
            type="button"
            onClick={cerrarDialogo}
            aria-label="Cerrar"
            style={{
              position: "absolute", top: "14px", right: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "30px", height: "30px", borderRadius: "999px",
              background: "rgba(248,249,250,0.06)", border: "none", cursor: "pointer",
            }}
          >
            <X size={16} color="rgba(248,249,250,0.6)" />
          </button>
        )}

        {necesitaApodo ? (
          <NicknameStep />
        ) : (
          <>
            <h2
              style={{
                fontFamily: "Sora, sans-serif",
                fontWeight: 700,
                fontSize: "22px",
                letterSpacing: "-0.025em",
                margin: "0 0 8px",
                color: FAE.text,
              }}
            >
              Entra para {motivoLogin}
            </h2>
            <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.65)", margin: "0 0 22px" }}>
              Puedes seguir explorando sin cuenta. La necesitas solo para que tu progreso quede guardado.
            </p>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <GoogleSignInButton />
            </div>

            <p style={{ fontSize: "12px", lineHeight: 1.5, color: "rgba(248,249,250,0.4)", margin: "20px 0 0", textAlign: "center" }}>
              Al entrar aceptas nuestra{" "}
              <a href="/privacidad" style={{ color: "rgba(248,249,250,0.6)" }}>política de privacidad</a>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
