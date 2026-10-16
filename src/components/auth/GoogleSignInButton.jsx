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
 *
 * ═══════════ `adaptable`: LAS DOS FORMAS, Y EL CSS ELIGE ═══════════
 *
 * Con `adaptable`, además del botón con texto se dibuja el mismo botón en su
 * forma de icono —también oficial: type "icon" de la librería de Google—, y es
 * una media query de AccountControl la que enseña uno u otro según el ancho.
 *
 * Por qué dos botones y no uno que se redibuja al cambiar el ancho: se probó
 * midiendo la ventana con JavaScript y ninguna lectura acertaba en todos los
 * casos. Durante la carga el ancho puede pasar por un valor transitorio;
 * al girar, la media query y el ancho no se actualizan en el mismo orden; y
 * los temporizadores de respaldo se congelan con la pestaña en segundo plano.
 * Una media query de CSS no tiene ninguno de esos problemas: la evalúa el
 * navegador en cada pintado. Girar el teléfono cambia la forma sin redibujar
 * nada.
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

/*
 * `fondo`: el relleno del botón de texto de respaldo. Por defecto, ninguno: en
 * un diálogo el botón se apoya en el panel que lo contiene. Pero el control de
 * cuenta flota sobre el contenido (position: fixed), y un botón sin relleno
 * deja leer a su través lo que pase por debajo: con `fondo` se pinta sólido y
 * TAPA el texto en vez de mezclarse con él. El botón de Google en sí
 * (filled_black) ya es opaco.
 */
export default function GoogleSignInButton({ size = "large", adaptable = false, fondo = "transparent" }) {
  const ancho = useRef(null);
  const icono = useRef(null);
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
      if (!ok || !window.google?.accounts?.id || !ancho.current) {
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
        window.google.accounts.id.renderButton(ancho.current, {
          type: "standard",
          theme: "filled_black", // el que mejor se integra al navy del sitio
          shape: "pill",         // coincide con los controles redondeados del resto
          size,
          text: "signin_with",
          logo_alignment: "left",
        });
        /* El icono de 40 px: "large" es el tamaño en el que la librería lo dibuja así. */
        if (adaptable && icono.current) {
          window.google.accounts.id.renderButton(icono.current, {
            type: "icon",
            shape: "circle",
            theme: "filled_black",
            size: "large",
          });
        }
        setModo("gsi");
      } catch (e) {
        setModo("fallback");
      }
    });

    return () => { vigente = false; };
  }, [size, adaptable]);

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
      {/*
        Los contenedores quedan vacíos hasta que la librería dibuja en ellos:
        mientras carga, o si falla, no ocupan sitio.
      */}
      <div ref={ancho} className={adaptable ? "fae-gsi-ancho" : undefined} style={{ colorScheme: "light" }} />
      {adaptable && <div ref={icono} className="fae-gsi-icono" style={{ colorScheme: "light" }} />}

      {modo === "fallback" && (
        <button
          type="button"
          onClick={entrarPorRedireccion}
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            color: FAE.text,
            background: fondo,
            border: "1px solid rgba(248,249,250,0.28)",
            borderRadius: "999px",
            padding: "10px 18px",
            /* 44 px: el mínimo que un dedo acierta a 320 px (kit.md). Con el
               rótulo corto de móvil («Entrar») el relleno solo daba 40. */
            minHeight: "44px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {adaptable ? (
            <>
              <span className="fae-gsi-ancho">Continuar con Google</span>
              {/* En móvil, corto: el largo tapaba el título igual que el botón de Google. */}
              <span className="fae-gsi-icono">Entrar</span>
            </>
          ) : (
            "Continuar con Google"
          )}
        </button>
      )}

      {error && (
        <p style={{ fontSize: "12.5px", color: FAE.coral, margin: "10px 0 0" }}>{error}</p>
      )}
    </div>
  );
}
