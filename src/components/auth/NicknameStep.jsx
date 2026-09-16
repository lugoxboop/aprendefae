import { useState } from "react";
import { FAE } from "../../theme.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { CAMPO, ETIQUETA, AYUDA } from "./estilosCampo.js";

/*
 * Paso del primer ingreso. Es parte del login, no una pantalla que se pueda
 * saltar: mientras no exista fila de perfil, este paso sigue en pantalla.
 *
 * Se piden dos cosas distintas y conviene no confundirlas:
 *
 *   apodo        lo público. Es lo único que ven los demás estudiantes en los
 *                rankings, y sigue siendo así.
 *   nombre real  privado. Solo lo ve el docente autorizado del curso, en su
 *                panel, para saber a quién corresponde cada avance — un apodo
 *                no le sirve para eso. No aparece en ningún ranking.
 *
 * La pantalla lo dice con esas palabras: pedir el nombre real sin explicar a
 * dónde va sería recoger un dato personal a espaldas de quien lo entrega.
 */

const MIN = 3;
const MAX = 20;
const MAX_NOMBRE = 80;

export default function NicknameStep() {
  const { crearPerfil, apodoDisponible, cerrarSesion } = useAuth();
  const [valor, setValor] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const limpio = valor.trim();
  const nombreLimpio = nombre.trim();
  const largoOk = limpio.length >= MIN && limpio.length <= MAX;
  const nombreOk = nombreLimpio.length >= MIN && nombreLimpio.length <= MAX_NOMBRE;
  const listo = largoOk && nombreOk;

  const enviar = async () => {
    if (!listo || enviando) return;
    setEnviando(true);
    setError(null);

    const libre = await apodoDisponible(limpio);
    if (!libre) {
      setError("Ese apodo ya está tomado. Prueba con otro.");
      setEnviando(false);
      return;
    }

    const { error: err } = await crearPerfil(limpio, nombreLimpio);
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
        Antes de entrar
      </h2>
      <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.65)", margin: "0 0 18px" }}>
        Dos datos y listo. El apodo es lo público; tu nombre es privado.
      </p>

      <label htmlFor="paso-nombre" style={ETIQUETA}>
        ¿Cómo te llamas?
      </label>
      <input
        id="paso-nombre"
        value={nombre}
        onChange={(e) => { setNombre(e.target.value); setError(null); }}
        onKeyDown={(e) => e.key === "Enter" && enviar()}
        placeholder="Tu nombre y apellido"
        maxLength={MAX_NOMBRE}
        autoFocus
        autoComplete="name"
        style={CAMPO}
      />
      <p style={AYUDA}>
        Solo lo ve el profesor de tu curso, para saber cómo vas. No aparece en los rankings.
      </p>

      <label htmlFor="paso-apodo" style={ETIQUETA}>
        Tu apodo
      </label>
      <input
        id="paso-apodo"
        value={valor}
        onChange={(e) => { setValor(e.target.value); setError(null); }}
        onKeyDown={(e) => e.key === "Enter" && enviar()}
        placeholder="Tu apodo"
        maxLength={MAX}
        aria-label="Tu apodo"
        style={{ ...CAMPO, border: `1px solid ${error ? FAE.coral : "rgba(248,249,250,0.18)"}` }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", margin: "8px 2px 18px" }}>
        <span style={{ fontSize: "12.5px", color: error ? FAE.coral : "rgba(248,249,250,0.45)" }}>
          {error || `Es lo que verán los demás. Entre ${MIN} y ${MAX} caracteres.`}
        </span>
        <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.35)" }}>
          {limpio.length}/{MAX}
        </span>
      </div>

      <button
        type="button"
        onClick={enviar}
        disabled={!listo || enviando}
        style={{
          width: "100%",
          fontFamily: "Sora, sans-serif",
          fontSize: "14.5px",
          fontWeight: 600,
          padding: "13px",
          borderRadius: "999px",
          border: "none",
          cursor: listo && !enviando ? "pointer" : "default",
          backgroundColor: listo && !enviando ? FAE.teal : "rgba(248,249,250,0.08)",
          color: listo && !enviando ? FAE.bg : "rgba(248,249,250,0.4)",
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
