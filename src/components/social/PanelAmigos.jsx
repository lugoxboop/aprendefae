import { useState } from "react";
import { FAE } from "../../theme.js";
import AvatarEstudiante from "../avatar/AvatarEstudiante.jsx";
import { useAmigos } from "../../social/useAmigos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA BARRA DE AMIGOS, en la ficha del estudiante.
 *
 * Tres bloques, de arriba abajo por lo que pide atención:
 *   · pedir amigo por apodo (una casilla y un botón);
 *   · solicitudes RECIBIDAS —las que esperan algo de ti— con aceptar/rechazar;
 *   · tus amigos, cada uno con su mascota; y al pie, en tono bajo, las
 *     solicitudes que TÚ enviaste y siguen pendientes, con cancelar.
 *
 * La mascota de cada amigo se arma desde los datos que trae `amigos_estado()`
 * (0164): se le pasa a AvatarEstudiante un perfil con la especie, el pelaje y
 * los ojos del otro —la misma cara que ese estudiante ve de sí mismo—.
 *
 * Solo pinta y llama a las funciones de la base por medio de useAmigos; no
 * decide nada de las reglas (eso vive en la 0164).
 * ═══════════════════════════════════════════════════════════════════════════
 */

const caja = {
  borderRadius: "16px",
  background: "rgba(248,249,250,0.04)",
  border: "1px solid rgba(248,249,250,0.12)",
  padding: "18px 18px 16px",
  marginBottom: "26px",
};

const tituloBloque = {
  fontFamily: "Sora, sans-serif",
  fontWeight: 700,
  fontSize: "13px",
  letterSpacing: "0.02em",
  color: "rgba(248,249,250,0.6)",
  margin: "0 0 10px",
};

/* Convierte la tarjeta de la base en el «perfil» que AvatarEstudiante entiende. */
export function perfilDeTarjeta(t) {
  return {
    id: t.user_id,
    mascota_especie: t.mascota_especie,
    mascota_paleta: t.mascota_paleta,
    mascota_ojos: t.mascota_ojos,
  };
}

function Fila({ tarjeta, children }) {
  return (
    <div
      data-amigo
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px 11px",
        padding: "8px 0",
        borderTop: "1px solid rgba(248,249,250,0.07)",
      }}
    >
      <AvatarEstudiante perfil={perfilDeTarjeta(tarjeta)} tamano={38} titulo={`Mascota de ${tarjeta.apodo}`} />
      <span
        style={{
          /*
           * flex:1 para ocupar el hueco, pero con un mínimo legible: si el
           * apodo es muy largo y los botones no caben, estos bajan a otra línea
           * (flexWrap) en vez de aplastar el nombre hasta una letra (320 px).
           */
          flex: "1 1 110px",
          minWidth: "90px",
          fontFamily: "Sora, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          color: FAE.text,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {tarjeta.apodo}
      </span>
      <div style={{ display: "flex", gap: "6px", marginLeft: "auto", flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function BotonChip({ onClick, children, tono = "neutro", etiqueta }) {
  /*
   * El teal nunca es color de texto (no llega a 4,5:1): el tono afirmativo es un
   * RELLENO teal con texto oscuro #06202A encima, que es la regla de la casa
   * (teal-no-es-texto). Los otros van en neutros que sí contrastan.
   */
  const tonos = {
    neutro: { color: "#A8B6C8", border: "rgba(248,249,250,0.16)", fondo: "rgba(248,249,250,0.05)" },
    si: { color: "#06202A", border: "transparent", fondo: FAE.teal },
    no: { color: "#A8B6C8", border: "rgba(248,249,250,0.14)", fondo: "transparent" },
  };
  const c = tonos[tono] || tonos.neutro;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40px",
        padding: "0 13px",
        borderRadius: "999px",
        border: `1px solid ${c.border}`,
        background: c.fondo,
        color: c.color,
        fontFamily: "Sora, sans-serif",
        fontSize: "12.5px",
        fontWeight: 700,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

export default function PanelAmigos() {
  const { amigos, recibidas, enviadas, cargando, error, solicitar, responder, eliminar } = useAmigos();
  const [apodo, setApodo] = useState("");
  const [aviso, setAviso] = useState(null); // { tipo: "ok"|"error", texto }
  const [enviando, setEnviando] = useState(false);

  const pedir = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setAviso(null);
    const r = await solicitar(apodo);
    setEnviando(false);
    if (r.error) {
      setAviso({ tipo: "error", texto: r.error });
      return;
    }
    setApodo("");
    setAviso({ tipo: "ok", texto: "¡Listo! Le llegó tu solicitud." });
  };

  return (
    <section style={caja} data-panel-amigos aria-label="Amigos">
      <h3 style={{ ...tituloBloque, marginBottom: "12px", fontSize: "14px", color: FAE.text }}>
        Amigos{amigos.length > 0 ? ` · ${amigos.length}` : ""}
      </h3>

      {/* ── Pedir por apodo ─────────────────────────────────────────────── */}
      <form onSubmit={pedir} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
        <input
          value={apodo}
          onChange={(e) => setApodo(e.target.value)}
          placeholder="Apodo de tu amigo"
          aria-label="Apodo de tu amigo"
          maxLength={40}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: "40px",
            padding: "0 13px",
            borderRadius: "10px",
            border: "1px solid rgba(248,249,250,0.16)",
            background: "rgba(248,249,250,0.05)",
            color: FAE.text,
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          }}
        />
        <BotonChip onClick={pedir} tono="si" etiqueta="Enviar solicitud de amistad">
          {enviando ? "…" : "Agregar"}
        </BotonChip>
      </form>

      {aviso && (
        <p
          style={{
            margin: "0 0 10px",
            fontSize: "12.5px",
            color: aviso.tipo === "error" ? FAE.coral : "#A8B6C8",
          }}
        >
          {aviso.texto}
        </p>
      )}

      {cargando && (
        <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.5)", margin: "8px 0 0" }}>Cargando…</p>
      )}
      {error && !cargando && (
        <p style={{ fontSize: "13px", color: FAE.coral, margin: "8px 0 0" }}>{error}</p>
      )}

      {/* ── Solicitudes recibidas (piden acción) ────────────────────────── */}
      {recibidas.length > 0 && (
        <div style={{ marginTop: "14px" }}>
          <p style={tituloBloque}>Te quieren agregar</p>
          {recibidas.map((t) => (
            <Fila key={t.amistad_id} tarjeta={t}>
              <BotonChip tono="si" etiqueta={`Aceptar a ${t.apodo}`} onClick={() => responder(t.amistad_id, true)}>
                Aceptar
              </BotonChip>
              <BotonChip tono="no" etiqueta={`Rechazar a ${t.apodo}`} onClick={() => responder(t.amistad_id, false)}>
                Rechazar
              </BotonChip>
            </Fila>
          ))}
        </div>
      )}

      {/* ── Tus amigos ──────────────────────────────────────────────────── */}
      <div style={{ marginTop: "14px" }}>
        {amigos.length === 0 && !cargando ? (
          <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.5)", margin: "6px 0 0", lineHeight: 1.5 }}>
            Todavía no tienes amigos aquí. Pídele su apodo a un compañero y agrégalo arriba.
          </p>
        ) : (
          amigos.map((t) => (
            <Fila key={t.amistad_id} tarjeta={t}>
              <BotonChip tono="no" etiqueta={`Quitar a ${t.apodo}`} onClick={() => eliminar(t.amistad_id)}>
                Quitar
              </BotonChip>
            </Fila>
          ))
        )}
      </div>

      {/* ── Lo que tú enviaste y sigue pendiente ────────────────────────── */}
      {enviadas.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <p style={tituloBloque}>Esperando respuesta</p>
          {enviadas.map((t) => (
            <Fila key={t.amistad_id} tarjeta={t}>
              <BotonChip tono="no" etiqueta={`Cancelar la solicitud a ${t.apodo}`} onClick={() => eliminar(t.amistad_id)}>
                Cancelar
              </BotonChip>
            </Fila>
          ))}
        </div>
      )}
    </section>
  );
}
