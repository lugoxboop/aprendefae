import { Swords, Check, X, Clock, Gem, Trophy } from "lucide-react";
import { FAE } from "../../theme.js";
import { tiempoRestante } from "../../social/useRetos.js";
import { perfilDeTarjeta, tonoDe, Escenario, Carita, Boton, TituloSeccion, PANEL } from "./amigos-comun.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS RETOS EN COMPAÑÍA, en pantalla — rehechos el 20-nov como un duelo de
 * juego, pero en equipo: tu mascota a un lado, la de tu amigo al otro, frente a
 * frente, y entre las dos la barra de lo que llevan JUNTOS, partida en el
 * color de cada uno. Cuando llegan a la meta, el botón de reclamar brilla en
 * dorado.
 *
 * Presentacional: recibe los datos y las acciones; useRetos y el refresco del
 * saldo viven en AmigosView. Por lo que pide atención:
 *   · invitaciones que me llegaron (aceptar / rechazar);
 *   · retos en curso;
 *   · retos que mandé y siguen esperando.
 * ═══════════════════════════════════════════════════════════════════════════
 */

function BarraJuntos({ mio, otro, meta, tonoMio, tonoOtro }) {
  const m = Math.max(1, meta);
  const pMio = Math.min(100, (mio / m) * 100);
  const pOtro = Math.min(100 - pMio, (otro / m) * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={meta}
      aria-valuenow={Math.min(meta, mio + otro)}
      aria-label="Actividades que llevan juntos"
      style={{ position: "relative", height: "14px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)" }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pMio}%`, background: `linear-gradient(90deg, rgba(${tonoMio},.85), rgb(${tonoMio}))`, transition: "width .5s ease" }} />
      <div style={{ position: "absolute", left: `${pMio}%`, top: 0, bottom: 0, width: `${pOtro}%`, background: `linear-gradient(90deg, rgb(${tonoOtro}), rgba(${tonoOtro},.85))`, borderLeft: pMio > 0 && pOtro > 0 ? "2px solid #0E1B2E" : "none", transition: "width .5s ease" }} />
      {pMio + pOtro > 0 && <span className="amg-barra-brillo" style={{ width: `${pMio + pOtro}%`, right: "auto" }} />}
    </div>
  );
}

function Nombre({ children, sub }) {
  return (
    <div style={{ textAlign: "center", minWidth: 0 }}>
      <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 800, color: FAE.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{children}</p>
      {sub != null && <p style={{ margin: "1px 0 0", fontFamily: "Sora, sans-serif", fontSize: "20px", fontWeight: 800, color: FAE.text, lineHeight: 1.1 }}>{sub}</p>}
    </div>
  );
}

function RetoActivo({ reto, yo, onCerrar, cerrando }) {
  const mio = reto.avance_mio ?? 0;
  const otro = reto.avance_otro ?? 0;
  const total = mio + otro;
  const lograble = total >= reto.meta && mio >= 1 && otro >= 1;
  const amigo = perfilDeTarjeta(reto.otro ?? {});
  const tonoMio = yo ? tonoDe(yo) : "42, 157, 143";
  const tonoOtro = tonoDe(amigo);
  const apodo = reto.otro?.apodo ?? "tu amigo";
  return (
    <div
      data-reto={reto.id}
      style={{
        ...PANEL, padding: "16px clamp(12px, 3vw, 22px) 16px",
        background: lograble
          ? "radial-gradient(90% 80% at 50% 0%, rgba(233,185,73,0.22), transparent 70%), linear-gradient(180deg, rgba(248,249,250,0.07), rgba(248,249,250,0.03))"
          : PANEL.background,
        borderColor: lograble ? "rgba(233,185,73,0.55)" : PANEL.border,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "rgba(248,249,250,0.65)" }}>
          <Clock size={13} /> Quedan {tiempoRestante(reto.vence)}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "999px", background: "rgba(111,134,255,0.16)", border: "1px solid rgba(111,134,255,0.35)", fontSize: "12px", fontWeight: 700, color: "#D6DCFF" }}>
          <Gem size={13} /> +{reto.bono} para cada uno
        </span>
      </div>

      <div className="amg-duelo">
        <div>
          {yo && <Escenario perfil={yo} tamano={104} animo={lograble ? "celebra" : "tranquila"} titulo="Tu mascota" />}
          <Nombre sub={mio}>Tú</Nombre>
        </div>
        <div style={{ alignSelf: "center", paddingBottom: "8px", minWidth: 0 }}>
          <p style={{ margin: "0 0 8px", textAlign: "center", fontFamily: "Sora, sans-serif", fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 800, letterSpacing: "-0.03em", color: FAE.text, lineHeight: 1 }} data-avance>
            {total}<span style={{ color: "rgba(248,249,250,0.45)", fontSize: "0.6em", marginLeft: "3px" }}>/{reto.meta}</span>
          </p>
          <BarraJuntos mio={mio} otro={otro} meta={reto.meta} tonoMio={tonoMio} tonoOtro={tonoOtro} />
          <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: "12px", color: "rgba(248,249,250,0.6)", lineHeight: 1.35 }}>
            {lograble ? "¡Lo lograron juntos!" : mio < 1 ? "Haz tú una actividad" : otro < 1 ? `Falta que ${apodo} empiece` : `Faltan ${reto.meta - total} actividades`}
          </p>
        </div>
        <div className="amg-espejo">
          <Escenario perfil={amigo} tamano={104} animo={lograble ? "celebra" : "tranquila"} titulo={`Mascota de ${apodo}`} />
          <Nombre sub={otro}>{apodo}</Nombre>
        </div>
      </div>

      {lograble && (
        <div style={{ marginTop: "14px" }}>
          <Boton tono="oro" grande ancho className="amg-listo" etiqueta="Reclamar el bono de cristales" onClick={() => onCerrar(reto.id)}>
            <Trophy size={17} /> {cerrando === reto.id ? "…" : `Reclamar +${reto.bono} cristales`}
          </Boton>
        </div>
      )}
    </div>
  );
}

export default function PanelRetos({ activos = [], invitaciones = [], enviadas = [], cargando = false, onResponder, onCerrar, respondiendo, cerrando, yo = null, onElegirAmigo = null }) {
  const vacio = activos.length === 0 && invitaciones.length === 0 && enviadas.length === 0;
  return (
    <section data-panel-retos aria-labelledby="amg-retos" style={{ marginTop: "34px" }}>
      <TituloSeccion id="amg-retos" cuenta={activos.length || null}>Retos en compañía</TituloSeccion>

      {cargando && <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.55)", margin: "0 0 12px" }}>Cargando…</p>}

      {invitaciones.length > 0 && (
        <div style={{ display: "grid", gap: "10px", marginBottom: "14px" }}>
          {invitaciones.map((r) => (
            <div
              key={r.id}
              data-invitacion-reto={r.id}
              style={{ ...PANEL, display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", padding: "12px 14px", borderColor: "rgba(233,185,73,0.5)", background: "linear-gradient(90deg, rgba(233,185,73,0.14), rgba(248,249,250,0.03))" }}
            >
              <Carita perfil={perfilDeTarjeta(r.otro ?? {})} tamano={52} titulo={`Mascota de ${r.otro?.apodo ?? ""}`} />
              <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 800, color: FAE.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.otro?.apodo ?? "Un amigo"} te retó
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "rgba(248,249,250,0.65)" }}>
                  {r.meta} actividades entre los dos · bono +{r.bono} cristales cada uno
                </p>
              </div>
              <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                <Boton tono="si" etiqueta="Aceptar el reto" onClick={() => onResponder(r.id, true)}>
                  {respondiendo === r.id ? "…" : <><Check size={15} /> Aceptar</>}
                </Boton>
                <Boton tono="suave" etiqueta="Rechazar el reto" onClick={() => onResponder(r.id, false)}>
                  <X size={15} />
                </Boton>
              </div>
            </div>
          ))}
        </div>
      )}

      {activos.length > 0 && (
        <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 440px), 1fr))", alignItems: "start" }}>
          {activos.map((r) => (
            <RetoActivo key={r.id} reto={r} yo={yo} onCerrar={onCerrar} cerrando={cerrando} />
          ))}
        </div>
      )}

      {enviadas.length > 0 && (
        <div style={{ marginTop: "14px" }}>
          <p style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 10px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, color: "rgba(248,249,250,0.6)" }}>
            <Clock size={14} /> Esperando que acepten tu reto
          </p>
          <div className="amg-fila">
            {enviadas.map((r) => (
              <div key={r.id} style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: "10px", padding: "6px 14px 6px 8px", borderRadius: "999px", background: "rgba(248,249,250,0.05)", border: "1px dashed rgba(248,249,250,0.18)" }}>
                <Carita perfil={perfilDeTarjeta(r.otro ?? {})} tamano={36} titulo={`Mascota de ${r.otro?.apodo ?? ""}`} />
                <span style={{ fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600, color: "rgba(248,249,250,0.85)", whiteSpace: "nowrap" }}>
                  {r.otro?.apodo} · {r.meta} actividades
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {vacio && !cargando && (
        <div data-retos-vacio style={{ ...PANEL, display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", padding: "16px clamp(14px, 3vw, 22px)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
            {yo && <Escenario perfil={yo} tamano={72} titulo="Tu mascota" />}
            <span aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", marginBottom: "30px", borderRadius: "50%", background: "rgba(111,134,255,0.18)", border: "1px solid rgba(111,134,255,0.4)" }}>
              <Swords size={16} color="#C9D2FF" />
            </span>
            <span aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "72px", height: "78px", marginBottom: "8px", borderRadius: "20px", border: "2px dashed rgba(248,249,250,0.22)", fontFamily: "Sora, sans-serif", fontSize: "28px", fontWeight: 800, color: "rgba(248,249,250,0.35)" }}>
              ?
            </span>
          </div>
          <div style={{ flex: "1 1 220px", minWidth: 0 }}>
            <p style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: "16px", fontWeight: 800, color: FAE.text }}>
              Estudien juntos y los dos ganan cristales
            </p>
            <p style={{ margin: "0 0 12px", fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.65)" }}>
              Reta a un amigo: entre los dos completan una meta de actividades y cada uno se lleva su premio.
            </p>
            {onElegirAmigo && (
              <Boton tono="si" onClick={onElegirAmigo} etiqueta="Elegir a un amigo para retarlo">
                <Swords size={15} /> Elegir a quién retar
              </Boton>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
