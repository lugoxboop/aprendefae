import { useState } from "react";
import { FAE } from "../../theme.js";
import { useAuth } from "../../auth/AuthProvider.jsx";

/*
 * Paso de apodo del primer ingreso. Es parte del login, no una pantalla que se
 * pueda saltar: mientras no exista fila de perfil, este paso sigue en pantalla.
 *
 * El apodo es lo que ven los demás en los rankings; el nombre real de Google no
 * se muestra nunca.
 */

const MIN = 3;
const MAX = 20;

export default function NicknameStep() {
  const { crearPerfil, apodoDisponible, cerrarSesion } = useAuth();
  const [valor, setValor] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const limpio = valor.trim();
  const largoOk = limpio.length >= MIN && limpio.length <= MAX;

  const enviar = async () => {
    if (!largoOk || enviando) return;
    setEnviando(true);
    setError(null);

    const libre = await apodoDisponible(limpio);
    if (!libre) {
      setError("Ese apodo ya está tomado. Prueba con otro.");
      setEnviando(false);
      return;
    }

    const { error: err } = await crearPerfil(limpio);
    if (err) setError(err);
    setEnviando(false);
  };

  return (
    <div>
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
        Elige tu apodo
      </h2>
      <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.65)", margin: "0 0 18px" }}>
        Es lo que verán los demás en los rankings. Tu nombre real de Google no se muestra nunca.
      </p>

      <input
        value={valor}
        onChange={(e) => { setValor(e.target.value); setError(null); }}
        onKeyDown={(e) => e.key === "Enter" && enviar()}
        placeholder="Tu apodo"
        maxLength={MAX}
        autoFocus
        aria-label="Tu apodo"
        style={{
          width: "100%",
          padding: "13px 16px",
          borderRadius: "14px",
          fontFamily: "Inter, sans-serif",
          fontSize: "15px",
          color: FAE.text,
          background: "rgba(248,249,250,0.05)",
          border: `1px solid ${error ? FAE.coral : "rgba(248,249,250,0.18)"}`,
          outline: "none",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", margin: "8px 2px 18px" }}>
        <span style={{ fontSize: "12.5px", color: error ? FAE.coral : "rgba(248,249,250,0.45)" }}>
          {error || `Entre ${MIN} y ${MAX} caracteres.`}
        </span>
        <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.35)" }}>
          {limpio.length}/{MAX}
        </span>
      </div>

      <button
        type="button"
        onClick={enviar}
        disabled={!largoOk || enviando}
        style={{
          width: "100%",
          fontFamily: "Sora, sans-serif",
          fontSize: "14.5px",
          fontWeight: 600,
          padding: "13px",
          borderRadius: "999px",
          border: "none",
          cursor: largoOk && !enviando ? "pointer" : "default",
          backgroundColor: largoOk && !enviando ? FAE.teal : "rgba(248,249,250,0.08)",
          color: largoOk && !enviando ? FAE.bg : "rgba(248,249,250,0.4)",
        }}
      >
        {enviando ? "Guardando…" : "Continuar"}
      </button>

      <button
        type="button"
        onClick={cerrarSesion}
        style={{
          display: "block",
          margin: "14px auto 0",
          fontFamily: "Inter, sans-serif",
          fontSize: "12.5px",
          color: "rgba(248,249,250,0.45)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Cancelar y salir
      </button>
    </div>
  );
}
