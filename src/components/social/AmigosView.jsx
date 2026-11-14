import { ChevronLeft } from "lucide-react";
import { FAE } from "../../theme.js";
import Logo from "../Logo.jsx";
import Entrada, { EstiloEntrada, entrada } from "../shared/Entrada.jsx";
import { useAuth } from "../../auth/AuthProvider.jsx";
import PanelAmigos from "./PanelAmigos.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PANTALLA DE AMIGOS — su propio destino, como la Tienda y «Mi avatar».
 *
 * Antes el panel de amigos vivía enterrado en el perfil y no se encontraba.
 * Ahora es una vista con su hash (#/amigos) y su entrada en el menú de cuenta.
 * El trabajo de verdad lo hace PanelAmigos; esto solo le pone la cabecera, el
 * botón de volver y el estado sin sesión.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function AmigosView({ onBack }) {
  const { session, pedirCuenta } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: FAE.bg,
        fontFamily: "Inter, sans-serif",
        color: FAE.text,
        backgroundImage: "radial-gradient(circle at 50% -10%, rgba(42,157,143,0.16), transparent 55%)",
      }}
    >
      <EstiloEntrada />
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 56px" }}>
        <div {...entrada(0, "baja")} style={{ ...entrada(0, "baja").style, display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <Logo variant="symbol" size={26} theme="dark" />
          <span aria-hidden="true" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "44px", height: "44px", padding: 0, flexShrink: 0,
              borderRadius: "999px", background: "rgba(248,249,250,0.06)",
              border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} color={FAE.text} />
          </button>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
            Amigos
          </h1>
        </div>

        {!session ? (
          <Entrada orden={1} modo="sube">
            <div
              style={{
                borderRadius: "16px", background: "rgba(248,249,250,0.04)",
                border: "1px solid rgba(248,249,250,0.12)", padding: "22px 20px", textAlign: "center",
              }}
            >
              <p style={{ fontSize: "15px", lineHeight: 1.5, color: FAE.text, margin: "0 0 14px" }}>
                Entra para agregar amigos y ver sus mascotas.
              </p>
              <button
                type="button"
                onClick={() => pedirCuenta?.()}
                style={{
                  minHeight: "44px", padding: "0 20px", borderRadius: "999px", cursor: "pointer",
                  border: "1px solid transparent", background: FAE.teal, color: "#06202A",
                  fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
                }}
              >
                Entrar
              </button>
            </div>
          </Entrada>
        ) : (
          <>
            <Entrada orden={1} modo="sube">
              <p style={{ fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.6)", margin: "0 0 18px" }}>
                Agrega a tus compañeros por su apodo y verás a cada uno con su mascota. Pronto podrán
                competir y estudiar juntos.
              </p>
            </Entrada>
            <Entrada orden={2} modo="sube">
              <PanelAmigos />
            </Entrada>
          </>
        )}
      </div>
    </div>
  );
}
