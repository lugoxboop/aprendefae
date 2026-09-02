import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import RankingFP from "./ranking/RankingFP.jsx";
import { useAuth } from "../auth/AuthProvider.jsx";
import { useContext, useEffect, useState } from "react";
import { NavigationContext } from "../navigation.js";
import { accesoDocente } from "../docente/datos.js";

/*
 * Perfil del estudiante. Se llega desde el indicador de cuenta de la cabecera.
 * Aquí vive el ranking general, que combina las dos materias; el de cada
 * materia vive en su propio índice de temas.
 */

const dato = {
  borderRadius: "16px",
  background: "rgba(248,249,250,0.04)",
  border: "1px solid rgba(248,249,250,0.12)",
  padding: "16px 18px",
};

export default function PerfilView({ onBack }) {
  /*
   * El acceso al panel docente aparece solo si la cuenta está en la lista
   * blanca. Para un estudiante no existe: ni el enlace ni la pista de que haya
   * algo detrás.
   */
  const nav = useContext(NavigationContext);
  const [esDocente, setEsDocente] = useState(false);
  useEffect(() => { accesoDocente().then((a) => setEsDocente(a.esDocente)); }, []);

  const { perfil, session, pedirCuenta } = useAuth();

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
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "26px" }}>
          <Logo variant="symbol" size={26} theme="dark" />
          <span aria-hidden="true" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", padding: "8px",
              borderRadius: "999px", background: "rgba(248,249,250,0.06)",
              border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} color={FAE.text} />
          </button>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
            Tu perfil
          </h1>
        </div>

        {!session ? (
          <div style={{ ...dato, marginBottom: "22px" }}>
            <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.7)", margin: "0 0 12px" }}>
              Entra para ver tu perfil y tu posición en el ranking.
            </p>
            <button
              type="button"
              onClick={() => pedirCuenta("ver tu perfil")}
              style={{
                fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
                padding: "10px 18px", borderRadius: "999px", border: "none",
                cursor: "pointer", backgroundColor: FAE.teal, color: FAE.bg,
              }}
            >
              Entrar
            </button>
          </div>
        ) : (
          <>
            <p
              style={{
                fontFamily: "Sora, sans-serif", fontWeight: 700,
                fontSize: "clamp(26px, 4vw, 34px)", letterSpacing: "-0.03em",
                lineHeight: 1.1, margin: "0 0 4px",
              }}
            >
              {perfil?.nickname ?? "Tu cuenta"}
            </p>
            <p style={{ fontSize: "14px", color: "rgba(248,249,250,0.5)", margin: "0 0 22px" }}>
              Este es el nombre que ven los demás en los rankings.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "26px" }}>
              <div style={dato}>
                <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "0 0 4px" }}>FP acumulados</p>
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", margin: 0, color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
                  {perfil?.points ?? 0}
                </p>
              </div>
              <div style={dato}>
                <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "0 0 4px" }}>Racha</p>
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", margin: 0, color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
                  {perfil?.streak ?? 0}
                </p>
              </div>
            </div>
          </>
        )}

        {esDocente && (
          <button
            type="button"
            onClick={() => nav?.irAPanelDocente?.()}
            style={{
              width: "100%", marginBottom: "18px", padding: "14px 18px", borderRadius: "16px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
              cursor: "pointer", textAlign: "left",
              background: "rgba(42,157,143,0.10)", border: `1px solid ${FAE.teal}`, color: FAE.text,
            }}
          >
            <span>
              <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "15px" }}>Panel docente</span>
              <span style={{ display: "block", fontSize: "12.5px", color: "rgba(248,249,250,0.6)", marginTop: "2px" }}>El avance de tus estudiantes</span>
            </span>
            <span style={{ fontSize: "20px", color: FAE.teal }}>→</span>
          </button>
        )}

        <RankingFP titulo="Ranking general" nota="Todas las materias" />
      </div>
    </div>
  );
}
