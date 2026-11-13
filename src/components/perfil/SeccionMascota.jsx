import { useState } from "react";
import { FAE } from "../../theme.js";
import { useAuthOpcional } from "../../auth/AuthProvider.jsx";
import Mascota from "../Mascota.jsx";
import { PALETAS_MASCOTA, OJOS_MASCOTA } from "../../mascota/mascotas.js";

/*
 * «Tu mascota», en el perfil: la mascota en grande con su nombre, y una fila de
 * colores para cambiarle el tinte. Copia el trato del selector de avatar —cada
 * toque pinta primero y guarda después; si la base dice que no, se vuelve a lo
 * de antes y se dice en palabras—, sin botón de guardar.
 *
 * Solo aparece si el estudiante ya tiene mascota. El color es la Etapa 1b; los
 * accesorios de la tienda y que la mascota sea el avatar en todas las pantallas
 * vienen después.
 */
const dato = {
  borderRadius: "16px",
  background: "rgba(248,249,250,0.04)",
  border: "1px solid rgba(248,249,250,0.12)",
  padding: "16px 18px",
};

export default function SeccionMascota({ perfil: perfilProp = null }) {
  const auth = useAuthOpcional();
  const perfil = perfilProp ?? auth?.perfil ?? null;
  const [paleta, setPaleta] = useState(() => perfil?.mascota_paleta ?? "natural");
  const [ojos, setOjos] = useState(() => perfil?.mascota_ojos ?? "natural");
  const [error, setError] = useState(null);

  if (!perfil?.mascota_especie) return null;

  const elegir = async (id) => {
    if (id === paleta) return;
    const antes = paleta;
    setPaleta(id);
    setError(null);
    const { error: err } = (await auth?.personalizarMascota?.(id)) ?? {};
    if (err) { setPaleta(antes); setError(err); }
  };

  const elegirOjos = async (id) => {
    if (id === ojos) return;
    const antes = ojos;
    setOjos(id);
    setError(null);
    const { error: err } = (await auth?.cambiarOjos?.(id)) ?? {};
    if (err) { setOjos(antes); setError(err); }
  };

  return (
    <div style={{ ...dato, marginBottom: "26px" }} data-seccion-mascota>
      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.01em", margin: "0 0 14px", color: FAE.text }}>
        Tu mascota
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ lineHeight: 0, flexShrink: 0 }}>
          <Mascota perfil={perfil} paleta={paleta} ojos={ojos} tamano={96} titulo={`Tu mascota: ${perfil.mascota_nombre || ""}`} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "20px", letterSpacing: "-0.01em", margin: "0 0 10px", color: FAE.text, overflowWrap: "anywhere" }}>
            {perfil.mascota_nombre || "Tu mascota"}
          </p>
          <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.55)", margin: "0 0 9px" }}>Su color</p>
          <div role="radiogroup" aria-label="Color de tu mascota" style={{ display: "flex", flexWrap: "wrap", gap: "9px" }}>
            {PALETAS_MASCOTA.map((p) => {
              const sel = paleta === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  aria-label={p.nombre}
                  title={p.nombre}
                  data-color={p.id}
                  onClick={() => elegir(p.id)}
                  style={{
                    width: "32px", height: "32px", borderRadius: "999px", cursor: "pointer", padding: 0,
                    background: p.muestra,
                    border: sel ? `2.5px solid ${FAE.text}` : "2.5px solid rgba(248,249,250,0.18)",
                    boxShadow: sel ? `0 0 0 2px ${FAE.teal}` : "none",
                  }}
                />
              );
            })}
          </div>
          <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.55)", margin: "14px 0 9px" }}>Sus ojos</p>
          <div role="radiogroup" aria-label="Color de ojos de tu mascota" style={{ display: "flex", flexWrap: "wrap", gap: "9px" }}>
            {OJOS_MASCOTA.map((o) => {
              const sel = ojos === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  aria-label={o.nombre}
                  title={o.nombre}
                  data-ojos={o.id}
                  onClick={() => elegirOjos(o.id)}
                  style={{
                    width: "32px", height: "32px", borderRadius: "999px", cursor: "pointer", padding: 0,
                    background: o.muestra,
                    border: sel ? `2.5px solid ${FAE.text}` : "2.5px solid rgba(248,249,250,0.18)",
                    boxShadow: sel ? `0 0 0 2px ${FAE.teal}` : "none",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
      {error && (
        <p role="alert" style={{ fontSize: "13px", lineHeight: 1.5, color: FAE.ambar, margin: "12px 0 0" }}>
          {error}
        </p>
      )}
    </div>
  );
}
