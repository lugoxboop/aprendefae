import { useEffect, useRef, useState } from "react";
import { supabase, GOOGLE_CLIENT_ID } from "../../lib/supabase.js";
import { FAE } from "../../theme.js";

/*
 * Botón "Sign in with Google" renderizado por la propia librería de Google
 * (Google Identity Services). No se recrea con CSS: eso incumple las normas de
 * marca de Google. Solo se eligen las opciones que Google permite —theme,
 * shape, size, text— y se toman las que mejor calzan con el fondo navy:
 * filled_black + pill.
 *
 * El token de Google se entrega a Supabase con signInWithIdToken.
 *
 * Si la librería de Google no carga (bloqueada, sin client id, sin red), no se
 * dibuja una imitación del botón: se ofrece un enlace de texto que hace el
 * mismo login por redirección de Supabase.
 */

const GSI_SRC = "https://accounts.google.com/gsi/client";

function cargarGsi() {
  if (window.google?.accounts?.id) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existente = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existente) {
      existente.addEventListener("load", () => resolve(true));
      existente.addEventListener("error", () => resolve(false));
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

export default function GoogleSignInButton({ size = "large" }) {
  const contenedor = useRef(null);
  const [modo, setModo] = useState("cargando"); // cargando | gsi | fallback
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;

    if (!GOOGLE_CLIENT_ID) {
      setModo("fallback");
      return;
    }

    cargarGsi().then((ok) => {
      if (!vigente) return;
      if (!ok || !window.google?.accounts?.id || !contenedor.current) {
        setModo("fallback");
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            const { error: err } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: credential,
            });
            if (err) setError(err.message);
          },
        });
        window.google.accounts.id.renderButton(contenedor.current, {
          type: "standard",
          theme: "filled_black", // el que mejor se integra al navy del sitio
          shape: "pill",         // coincide con los controles redondeados del resto
          size,
          text: "signin_with",
          logo_alignment: "left",
        });
        setModo("gsi");
      } catch (e) {
        setModo("fallback");
      }
    });

    return () => { vigente = false; };
  }, [size]);

  /* Login por redirección: mismo resultado, sin imitar el botón de Google. */
  const entrarPorRedireccion = async () => {
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (err) setError(err.message);
  };

  return (
    <div>
      <div ref={contenedor} style={{ display: modo === "gsi" ? "block" : "none", colorScheme: "light" }} />

      {modo === "fallback" && (
        <button
          type="button"
          onClick={entrarPorRedireccion}
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            color: FAE.text,
            background: "transparent",
            border: "1px solid rgba(248,249,250,0.28)",
            borderRadius: "999px",
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          Continuar con Google
        </button>
      )}

      {error && (
        <p style={{ fontSize: "12.5px", color: FAE.coral, margin: "10px 0 0" }}>{error}</p>
      )}
    </div>
  );
}
