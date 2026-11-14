import { FAE } from "../../theme.js";
import AvatarEstudiante from "../avatar/AvatarEstudiante.jsx";
import { perfilDeTarjeta } from "./PanelAmigos.jsx";
import { tiempoRestante } from "../../social/useRetos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS RETOS EN COMPAÑÍA, en pantalla. Presentacional: recibe los datos y las
 * acciones; useRetos y el refresco del saldo viven en AmigosView.
 *
 * Tres bloques por lo que pide atención:
 *   · invitaciones que me llegaron (aceptar / rechazar);
 *   · retos activos, con la barra de progreso de los dos y el botón de reclamar
 *     el bono cuando ya cumplieron la meta entre ambos;
 *   · invitaciones que mandé y siguen esperando.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const caja = {
  borderRadius: "16px",
  background: "rgba(248,249,250,0.04)",
  border: "1px solid rgba(248,249,250,0.12)",
  padding: "18px 18px 16px",
  marginBottom: "26px",
};
const sub = {
  fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "12.5px",
  letterSpacing: "0.02em", color: "rgba(248,249,250,0.6)", margin: "0 0 10px",
};

function Chip({ onClick, children, tono = "neutro", etiqueta }) {
  const estilos = {
    si: { color: "#06202A", border: "transparent", fondo: FAE.teal },
    neutro: { color: "#A8B6C8", border: "rgba(248,249,250,0.16)", fondo: "rgba(248,249,250,0.05)" },
  };
  const c = estilos[tono] || estilos.neutro;
  return (
    <button
      type="button" onClick={onClick} aria-label={etiqueta} title={etiqueta}
      style={{
        minHeight: "38px", padding: "0 13px", borderRadius: "999px", cursor: "pointer", flexShrink: 0,
        border: `1px solid ${c.border}`, background: c.fondo, color: c.color,
        fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}

function Cabeza({ tarjeta, children, sufijo }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px 11px", padding: "4px 0" }}>
      <AvatarEstudiante perfil={perfilDeTarjeta(tarjeta)} tamano={40} titulo={`Mascota de ${tarjeta.apodo}`} />
      <div style={{ flex: "1 1 120px", minWidth: "100px" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, color: FAE.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {tarjeta.apodo}
        </p>
        {sufijo && <p style={{ fontSize: "12px", color: "rgba(248,249,250,0.55)", margin: "2px 0 0" }}>{sufijo}</p>}
      </div>
      {children && <div style={{ display: "flex", gap: "6px", marginLeft: "auto", flexShrink: 0 }}>{children}</div>}
    </div>
  );
}

function Barra({ hecho, meta }) {
  const pct = Math.max(0, Math.min(100, Math.round((hecho / Math.max(1, meta)) * 100)));
  return (
    <div style={{ height: "8px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", overflow: "hidden", margin: "8px 0 6px" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: "999px", background: FAE.teal, transition: "width .4s ease" }} />
    </div>
  );
}

function RetoActivo({ reto, onCerrar, cerrando }) {
  const mio = reto.avance_mio ?? 0;
  const otro = reto.avance_otro ?? 0;
  const total = mio + otro;
  const lograble = total >= reto.meta && mio >= 1 && otro >= 1;
  return (
    <div data-reto={reto.id} style={{ padding: "10px 0", borderTop: "1px solid rgba(248,249,250,0.07)" }}>
      <Cabeza tarjeta={reto.otro ?? {}} sufijo={`Meta: ${reto.meta} actividades juntos · quedan ${tiempoRestante(reto.vence)}`} />
      <Barra hecho={total} meta={reto.meta} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
        <span style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.6)" }} data-avance>
          Tú {mio} · {reto.otro?.apodo ?? "tu amigo"} {otro} &nbsp;=&nbsp; {total}/{reto.meta}
        </span>
        {lograble ? (
          <Chip tono="si" etiqueta="Reclamar el bono de cristales" onClick={() => onCerrar(reto.id)}>
            {cerrando === reto.id ? "…" : `Reclamar +${reto.bono} 💎`}
          </Chip>
        ) : (
          <span style={{ fontSize: "12px", color: "rgba(248,249,250,0.45)" }}>
            {mio < 1 ? "Haz tú una actividad" : otro < 1 ? "Falta que tu amigo empiece" : `Faltan ${reto.meta - total}`}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PanelRetos({ activos = [], invitaciones = [], enviadas = [], cargando = false, onResponder, onCerrar, respondiendo, cerrando }) {
  const vacio = activos.length === 0 && invitaciones.length === 0 && enviadas.length === 0;
  return (
    <section style={caja} data-panel-retos aria-label="Retos en compañía">
      <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "15px", color: FAE.text, margin: "0 0 4px" }}>
        Retos en compañía
      </h3>
      <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.55)", margin: "0 0 14px", lineHeight: 1.5 }}>
        Estudien juntos y los dos ganan cristales. Reta a un amigo desde la lista de abajo.
      </p>

      {cargando && <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.5)", margin: 0 }}>Cargando…</p>}

      {invitaciones.length > 0 && (
        <div style={{ marginBottom: "6px" }}>
          <p style={sub}>Te retaron</p>
          {invitaciones.map((r) => (
            <div key={r.id} style={{ borderTop: "1px solid rgba(248,249,250,0.07)" }}>
              <Cabeza tarjeta={r.otro ?? {}} sufijo={`${r.meta} actividades juntos · bono +${r.bono} 💎`}>
                <Chip tono="si" etiqueta="Aceptar el reto" onClick={() => onResponder(r.id, true)}>
                  {respondiendo === r.id ? "…" : "Aceptar"}
                </Chip>
                <Chip etiqueta="Rechazar el reto" onClick={() => onResponder(r.id, false)}>Rechazar</Chip>
              </Cabeza>
            </div>
          ))}
        </div>
      )}

      {activos.length > 0 && (
        <div style={{ marginTop: invitaciones.length > 0 ? "14px" : 0 }}>
          <p style={sub}>En curso</p>
          {activos.map((r) => (
            <RetoActivo key={r.id} reto={r} onCerrar={onCerrar} cerrando={cerrando} />
          ))}
        </div>
      )}

      {enviadas.length > 0 && (
        <div style={{ marginTop: "14px" }}>
          <p style={sub}>Esperando respuesta</p>
          {enviadas.map((r) => (
            <Cabeza key={r.id} tarjeta={r.otro ?? {}} sufijo={`Lo retaste · ${r.meta} actividades`} />
          ))}
        </div>
      )}

      {vacio && !cargando && (
        <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.5)", margin: "6px 0 0", lineHeight: 1.5 }}>
          Todavía no tienes retos. Reta a un amigo de la lista de abajo y estudien juntos.
        </p>
      )}
    </section>
  );
}
