import { useState } from "react";
import { FAE } from "../../theme.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import Mascota from "../Mascota.jsx";
import { ESPECIES, NOMBRE_MAX } from "../../mascota/mascotas.js";

/*
 * El segundo paso del primer ingreso, después del apodo (0258). Como el apodo,
 * es parte del login y no se puede saltar: mientras el perfil no tenga mascota,
 * este paso sigue en pantalla. Sale a:
 *   · los estudiantes nuevos, apenas crean su perfil;
 *   · los que ya estaban activos antes de la mascota, la próxima vez que entren
 *     —su «crea tu mascotica»—.
 *
 * Una sola pantalla: elegir la criatura y ponerle nombre. Las dos cosas llegan
 * juntas a mascota_elegir(), que es como las valida la base.
 */

const MIN = 1;

export default function MascotaStep() {
  const { elegirMascota, cerrarSesion } = useAuth();
  const [especie, setEspecie] = useState(null);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const limpio = nombre.trim();
  const listo = Boolean(especie) && limpio.length >= MIN && limpio.length <= NOMBRE_MAX;

  const enviar = async () => {
    if (!listo || enviando) return;
    setEnviando(true);
    setError(null);
    const { error: err } = await elegirMascota(especie, limpio);
    if (err) setError(err);
    setEnviando(false);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "22px", letterSpacing: "-0.025em", margin: "0 0 8px", color: FAE.text }}>
        Elige tu mascotica
      </h2>
      <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.65)", margin: "0 0 18px" }}>
        Te acompaña en cada tema. Escógela y ponle nombre.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
        {ESPECIES.map((e) => {
          const sel = especie === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => { setEspecie(e.id); setError(null); }}
              aria-pressed={sel}
              aria-label={e.nombre}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
                padding: "12px 8px 10px", borderRadius: "14px", cursor: "pointer",
                background: sel ? "rgba(111,134,255,0.14)" : "rgba(248,249,250,0.04)",
                border: `1.5px solid ${sel ? "#6F86FF" : "rgba(248,249,250,0.12)"}`,
                transition: "border-color .15s, background .15s",
              }}
            >
              <Mascota especie={e.id} tamano={62} />
              <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "13.5px", color: FAE.text }}>{e.nombre}</span>
              <span style={{ fontSize: "12px", color: "rgba(248,249,250,0.45)" }}>{e.rasgo}</span>
            </button>
          );
        })}
      </div>

      <label htmlFor="paso-mascota-nombre" style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "12.5px", color: "rgba(248,249,250,0.6)", margin: "0 0 7px" }}>
        ¿Cómo se va a llamar?
      </label>
      <input
        id="paso-mascota-nombre"
        value={nombre}
        onChange={(e) => { setNombre(e.target.value); setError(null); }}
        onKeyDown={(e) => e.key === "Enter" && enviar()}
        placeholder="Nombre de tu mascota"
        maxLength={NOMBRE_MAX}
        style={{
          width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: "10px",
          background: "rgba(248,249,250,0.05)", color: FAE.text, fontSize: "16px", fontFamily: "Inter, sans-serif",
          border: `1px solid ${error ? FAE.coral : "rgba(248,249,250,0.18)"}`, outline: "none",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", margin: "8px 2px 18px" }}>
        <span style={{ fontSize: "12.5px", color: error ? FAE.coral : "rgba(248,249,250,0.45)" }}>
          {error || `Hasta ${NOMBRE_MAX} caracteres.`}
        </span>
        <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.35)" }}>{limpio.length}/{NOMBRE_MAX}</span>
      </div>

      <button
        type="button"
        onClick={enviar}
        disabled={!listo || enviando}
        style={{
          width: "100%", fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 600,
          padding: "13px", borderRadius: "999px", border: "none",
          cursor: listo && !enviando ? "pointer" : "default",
          backgroundColor: listo && !enviando ? FAE.teal : "rgba(248,249,250,0.08)",
          color: listo && !enviando ? FAE.bg : "rgba(248,249,250,0.4)",
        }}
      >
        {enviando ? "Guardando…" : "Crear mi mascota"}
      </button>

      <button
        type="button"
        onClick={cerrarSesion}
        style={{ display: "block", margin: "14px auto 0", fontFamily: "Inter, sans-serif", fontSize: "12.5px", color: "rgba(248,249,250,0.45)", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}
      >
        Cancelar y salir
      </button>
    </div>
  );
}
