import { useState } from "react";
import { FAE } from "../../theme.js";
import { useAuthOpcional } from "../../auth/AuthProvider.jsx";
import Mascota from "../Mascota.jsx";
import { ESPECIES, PALETAS_MASCOTA, OJOS_MASCOTA, mascotaDe } from "../../mascota/mascotas.js";

/*
 * «Tu mascota», en el perfil. Dos modos con el mismo componente:
 *
 *   · SIMPLE (por defecto) — la mascota en grande con su nombre y las filas de
 *     color y ojos. Es la tarjeta que vive en la ficha.
 *   · COMPLETO (`completo`) — lo anterior MÁS elegir especie y renombrar. Es lo
 *     que abre «Mi avatar»: antes mostraba las figuras geométricas viejas; ahora
 *     edita la mascota entera. La especie se cambia con mascota_elegir (0160),
 *     que conserva color y ojos; cambiar de perro a gato no borra su tinte.
 *
 * Cada toque pinta primero y guarda después; si la base dice que no, se vuelve
 * a lo de antes y se dice en palabras. Sin botón de guardar. Solo aparece si el
 * estudiante ya tiene mascota.
 */
const dato = {
  borderRadius: "16px",
  background: "rgba(248,249,250,0.04)",
  border: "1px solid rgba(248,249,250,0.12)",
  padding: "16px 18px",
};

const sub = { fontSize: "12.5px", color: "rgba(248,249,250,0.55)", margin: "0 0 9px" };

function FilaMuestras({ etiqueta, items, valor, onElegir, attr }) {
  return (
    <>
      <p style={{ ...sub, marginTop: "14px" }}>{etiqueta}</p>
      <div role="radiogroup" aria-label={etiqueta} style={{ display: "flex", flexWrap: "wrap", gap: "9px" }}>
        {items.map((it) => {
          const sel = valor === it.id;
          return (
            <button
              key={it.id}
              type="button"
              role="radio"
              aria-checked={sel}
              aria-label={it.nombre}
              title={it.nombre}
              {...{ [attr]: it.id }}
              onClick={() => onElegir(it.id)}
              style={{
                width: "32px", height: "32px", borderRadius: "999px", cursor: "pointer", padding: 0,
                background: it.muestra,
                border: sel ? `2.5px solid ${FAE.text}` : "2.5px solid rgba(248,249,250,0.18)",
                boxShadow: sel ? `0 0 0 2px ${FAE.teal}` : "none",
              }}
            />
          );
        })}
      </div>
    </>
  );
}

export default function SeccionMascota({ perfil: perfilProp = null, completo = false }) {
  const auth = useAuthOpcional();
  const perfil = perfilProp ?? auth?.perfil ?? null;
  /* La especie de arranque: la elegida, o —si aún está en la de fábrica— la que
     le toca por defecto, para que el editor NUNCA salga vacío. */
  const base = perfil ? mascotaDe(perfil) : null;
  const [especie, setEspecie] = useState(() => perfil?.mascota_especie ?? base?.especie ?? null);
  const [nombre, setNombre] = useState(() => perfil?.mascota_nombre ?? "");
  const [paleta, setPaleta] = useState(() => perfil?.mascota_paleta ?? "natural");
  const [ojos, setOjos] = useState(() => perfil?.mascota_ojos ?? "natural");
  const [error, setError] = useState(null);

  /* La tarjeta simple del perfil solo aparece si ya eligió mascota; el editor
     completo («Mi avatar») sale siempre, para poder elegirla. */
  if (!perfil || (!completo && !perfil.mascota_especie)) return null;

  const elegirColor = async (id) => {
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

  /* Cambiar de especie conservando nombre, color y ojos (mascota_elegir, 0160). */
  const elegirEspecie = async (id) => {
    if (id === especie) return;
    const nom = (nombre || "").trim();
    if (!nom) { setError("Primero ponle un nombre a tu mascota."); return; }
    const antes = especie;
    setEspecie(id);
    setError(null);
    const { error: err } = (await auth?.elegirMascota?.(id, nom, paleta)) ?? {};
    if (err) { setEspecie(antes); setError(err); }
  };

  /* Renombrar: guarda al salir del campo, con la especie actual. */
  const guardarNombre = async () => {
    const nom = (nombre || "").trim();
    if (!nom || nom === (perfil.mascota_nombre || "")) return;
    setError(null);
    const { error: err } = (await auth?.elegirMascota?.(especie, nom, paleta)) ?? {};
    if (err) { setNombre(perfil.mascota_nombre || ""); setError(err); }
  };

  return (
    <div style={{ ...dato, marginBottom: "26px" }} data-seccion-mascota>
      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.01em", margin: "0 0 14px", color: FAE.text }}>
        Tu mascota
      </p>

      {/* ── Elegir especie (solo en el editor completo) ─────────────────── */}
      {completo && (
        <div style={{ marginBottom: "18px" }}>
          <p style={sub}>Cuál es</p>
          <div role="radiogroup" aria-label="Especie de tu mascota" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {ESPECIES.map((e) => {
              const sel = especie === e.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  aria-label={`${e.nombre} · ${e.rasgo}`}
                  title={`${e.nombre} · ${e.rasgo}`}
                  data-especie={e.id}
                  onClick={() => elegirEspecie(e.id)}
                  style={{
                    display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "4px",
                    padding: "8px 10px 6px", borderRadius: "14px", cursor: "pointer",
                    background: sel ? "rgba(42,157,143,0.12)" : "rgba(248,249,250,0.04)",
                    border: sel ? `2px solid ${FAE.teal}` : "2px solid rgba(248,249,250,0.14)",
                  }}
                >
                  <Mascota especie={e.id} paleta={paleta} ojos={ojos} tamano={52} />
                  <span style={{ fontFamily: "Sora, sans-serif", fontSize: "11.5px", fontWeight: 700, color: sel ? FAE.text : "#A8B6C8" }}>
                    {e.nombre}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ lineHeight: 0, flexShrink: 0 }}>
          <Mascota especie={especie} perfil={perfil} paleta={paleta} ojos={ojos} tamano={96} titulo={`Tu mascota: ${nombre || ""}`} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* ── Nombre ── */}
          {completo ? (
            <>
              <label htmlFor="editar-mascota-nombre" style={sub}>Su nombre</label>
              <input
                id="editar-mascota-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onBlur={guardarNombre}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
                maxLength={16}
                style={{
                  width: "100%", minHeight: "40px", padding: "0 12px", marginBottom: "6px",
                  borderRadius: "10px", border: "1px solid rgba(248,249,250,0.16)",
                  background: "rgba(248,249,250,0.05)", color: FAE.text,
                  fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 700,
                }}
              />
            </>
          ) : (
            <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "20px", letterSpacing: "-0.01em", margin: "0 0 10px", color: FAE.text, overflowWrap: "anywhere" }}>
              {nombre || "Tu mascota"}
            </p>
          )}

          <FilaMuestras etiqueta="Su color" items={PALETAS_MASCOTA} valor={paleta} onElegir={elegirColor} attr="data-color" />
          <FilaMuestras etiqueta="Sus ojos" items={OJOS_MASCOTA} valor={ojos} onElegir={elegirOjos} attr="data-ojos" />
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
