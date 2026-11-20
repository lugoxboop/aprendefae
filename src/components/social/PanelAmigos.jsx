import { useState, useEffect, useRef, useCallback } from "react";
import { Search, UserPlus, Copy, Check, X, Swords, UserMinus, Clock, Gem } from "lucide-react";
import { FAE } from "../../theme.js";
import { useAmigos } from "../../social/useAmigos.js";
import Entrada from "../shared/Entrada.jsx";
import {
  perfilDeTarjeta, tonoDe, nombreEspecie,
  Escenario, Carita, PuntoHoy, Racha, Boton, TituloSeccion, PANEL,
} from "./amigos-comun.jsx";

export { perfilDeTarjeta };

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TUS AMIGOS — rehecho desde cero el 20-nov, al estilo de la lista de amigos
 * de un videojuego.
 *
 * Antes era una lista de contactos: una carita de 38 px, el apodo y dos
 * botones. Ahora, de arriba abajo:
 *   · la PORTADA: tu mascota de cuerpo entero con tu apodo para compartir, y
 *     al lado el buscador grande; las sugerencias salen como tarjetitas con su
 *     cara, no como una lista de texto;
 *   · «Te quieren agregar»: cada solicitud con su mascota y aceptar/rechazar;
 *   · la REJILLA de amigos: a cada uno se le ve entero, vestido como se vistió
 *     en la tienda, sobre un escenario del color de su pelaje, el nombre debajo,
 *     su racha y un punto verde si ya estudió hoy. El botón grande es «Retar»;
 *     «Quitar» vive en su ficha, para que no se toque sin querer;
 *   · la FICHA: al tocar una tarjeta, el amigo en grande, saludando.
 *   · al pie, las solicitudes que tú mandaste, en una fila discreta.
 *
 * Solo pinta y llama a la base por medio de useAmigos; las reglas viven en la
 * 0164 (y los datos de la tarjeta, en la 0170).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Amigos que estudiaron hoy primero; después, por apodo (como llega). */
function ordenar(amigos) {
  return [...amigos].sort((a, b) => Number(Boolean(b.estudio_hoy)) - Number(Boolean(a.estudio_hoy)));
}

function Aviso({ aviso }) {
  if (!aviso) return null;
  const error = aviso.tipo === "error";
  return (
    <p
      role="status"
      data-aviso={aviso.tipo}
      style={{
        display: "flex", alignItems: "center", gap: "8px", margin: "12px 0 0", padding: "10px 13px", borderRadius: "12px",
        fontSize: "13px", lineHeight: 1.45,
        color: error ? "#FFC3B0" : "#CFF5EE",
        background: error ? "rgba(231,111,81,0.12)" : "rgba(42,157,143,0.14)",
        border: `1px solid ${error ? "rgba(231,111,81,0.35)" : "rgba(42,157,143,0.4)"}`,
      }}
    >
      {error ? <X size={15} /> : <Check size={15} />}
      {aviso.texto}
    </p>
  );
}

/* ── La portada: tu mascota + agregar amigos ──────────────────────────────── */
function Portada({ perfilPropio, nAmigos, apodo, setApodo, sugerencias, enviando, onPedir, inputRef }) {
  const [copiado, setCopiado] = useState(false);
  const yo = perfilPropio ? { ...perfilPropio, id: perfilPropio.user_id ?? perfilPropio.id } : null;
  const miApodo = perfilPropio?.nickname ?? "";

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(miApodo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch { /* sin portapapeles: el apodo igual se ve */ }
  };

  return (
    <section className="amg-portada" style={PANEL} aria-label="Agregar amigos">
      {yo && (
        <div className="amg-yo" style={{ "--tono": tonoDe(yo) }}>
          <Escenario perfil={yo} tamano={128} animo="tranquila" foco titulo={`Tu mascota${perfilPropio.mascota_nombre ? `: ${perfilPropio.mascota_nombre}` : ""}`} />
          <div className="amg-yo-texto" style={{ textAlign: "center", minWidth: 0 }}>
            <p style={{ margin: "6px 0 0", fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(248,249,250,0.55)" }}>
              Tu apodo
            </p>
            <p data-mi-apodo style={{ margin: "2px 0 8px", fontFamily: "Sora, sans-serif", fontSize: "21px", fontWeight: 800, letterSpacing: "-0.02em", color: FAE.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {miApodo || "Sin apodo"}
            </p>
            {miApodo && (
              <Boton tono="neutro" onClick={copiar} etiqueta="Copiar tu apodo para compartirlo">
                {copiado ? <Check size={15} /> : <Copy size={15} />}
                {copiado ? "¡Copiado!" : "Copiar apodo"}
              </Boton>
            )}
          </div>
        </div>
      )}

      <div style={{ padding: "22px clamp(16px, 3vw, 26px)", minWidth: 0 }}>
        <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "clamp(20px, 3.2vw, 26px)", letterSpacing: "-0.025em", lineHeight: 1.15, margin: "0 0 6px", color: FAE.text }}>
          {nAmigos > 0 ? "Suma más amigos a tu equipo" : "Arma tu equipo de estudio"}
        </h2>
        <p style={{ fontSize: "13.5px", lineHeight: 1.5, color: "rgba(248,249,250,0.68)", margin: "0 0 16px" }}>
          Busca a tus compañeros por su apodo. Juntos pueden retarse a estudiar y los dos ganan cristales.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); onPedir(apodo); }} style={{ display: "flex", gap: "8px" }}>
          <label style={{ position: "relative", flex: 1, minWidth: 0, display: "flex" }}>
            <Search size={18} color="rgba(248,249,250,0.55)" style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              ref={inputRef}
              className="amg-input"
              value={apodo}
              onChange={(e) => setApodo(e.target.value)}
              placeholder="Escribe un apodo…"
              aria-label="Apodo de tu amigo"
              maxLength={40}
              autoComplete="off"
              style={{
                flex: 1, minWidth: 0, minHeight: "50px", padding: "0 14px 0 44px", borderRadius: "999px",
                border: "1px solid rgba(248,249,250,0.2)", background: "rgba(6,12,22,0.45)",
                color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "15px",
              }}
            />
          </label>
          <Boton type="submit" tono="si" grande etiqueta="Enviar solicitud de amistad" disabled={enviando || !apodo.trim()}>
            <UserPlus size={17} />
            <span className="amg-txt-agregar">{enviando ? "…" : "Agregar"}</span>
          </Boton>
        </form>

        {sugerencias.length === 0 && (
          <ol className="amg-pasos" style={{ listStyle: "none", padding: 0, margin: "18px 0 0" }}>
            {[
              [UserPlus, "Agrega", "Busca su apodo y envía la solicitud."],
              [Swords, "Rétalo", "Elijan una meta de actividades juntos."],
              [Gem, "Ganen", "Al cumplirla, los dos se llevan cristales."],
            ].map(([Icono, titulo, texto], i) => (
              <li key={titulo} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px", borderRadius: "16px", background: "rgba(248,249,250,0.045)", border: "1px solid rgba(248,249,250,0.09)" }}>
                <span aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", flexShrink: 0, borderRadius: "11px", background: ["rgba(42,157,143,0.22)", "rgba(111,134,255,0.22)", "rgba(233,185,73,0.22)"][i] }}>
                  <Icono size={17} color={["#7FE0D2", "#C9D2FF", "#FFE08A"][i]} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 700, color: FAE.text }}>{i + 1}. {titulo}</span>
                  <span style={{ display: "block", fontSize: "12px", lineHeight: 1.4, color: "rgba(248,249,250,0.6)", marginTop: "2px" }}>{texto}</span>
                </span>
              </li>
            ))}
          </ol>
        )}

        {sugerencias.length > 0 && (
          <div style={{ marginTop: "14px" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em", color: "rgba(248,249,250,0.55)" }}>
              ¿Es alguno de ellos?
            </p>
            <div data-sugerencias role="listbox" aria-label="Sugerencias" className="amg-sugerencias">
              {sugerencias.map((s) => (
                <button
                  key={s.user_id}
                  type="button"
                  role="option"
                  aria-selected="false"
                  data-sugerencia={s.apodo}
                  onClick={() => onPedir(s.apodo)}
                  className="amg-tocar amg-boton"
                  style={{
                    display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "16px",
                    background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.12)", boxSizing: "border-box", minWidth: 0,
                  }}
                >
                  <Carita perfil={perfilDeTarjeta(s)} tamano={44} titulo={`Mascota de ${s.apodo}`} />
                  <span style={{ flex: 1, minWidth: 0, fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700, color: FAE.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.apodo}
                  </span>
                  <span aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", background: FAE.teal, flexShrink: 0 }}>
                    <UserPlus size={15} color="#06202A" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Una tarjeta de amigo ─────────────────────────────────────────────────── */
function TarjetaAmigo({ t, onAbrir, onRetar, enReto }) {
  const perfil = perfilDeTarjeta(t);
  return (
    <div data-amigo={t.apodo} className="amg-carta" style={{ "--tono": tonoDe(perfil) }}>
      <button type="button" className="amg-tocar" onClick={() => onAbrir(t)} aria-label={`Ver a ${t.apodo}`}>
        <div style={{ position: "relative", paddingTop: "10px" }}>
          <Escenario perfil={perfil} tamano={150} titulo={`Mascota de ${t.apodo}`} />
          {t.estudio_hoy && (
            <span
              title="Ya estudió hoy"
              style={{
                position: "absolute", top: "10px", left: "10px", display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "3px 8px 3px 6px", borderRadius: "999px", background: "rgba(6,12,22,0.6)",
                fontSize: "10.5px", fontWeight: 700, color: "#B9F5D8",
              }}
            >
              <span style={{ position: "relative", width: "8px", height: "8px" }}><PuntoHoy tamano={8} style={{ border: "none" }} /></span>
              Hoy
            </span>
          )}
          <span style={{ position: "absolute", top: "10px", right: "10px" }}><Racha dias={t.racha} /></span>
        </div>
        <div style={{ padding: "6px 12px 0", textAlign: "center" }}>
          <p data-nombre className="amg-nombre" style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "15.5px", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.25, color: FAE.text }}>
            {t.apodo}
          </p>
          <p style={{ margin: "1px 0 0", fontSize: "11.5px", color: "rgba(248,249,250,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {t.mascota_nombre ? `${t.mascota_nombre} · ${nombreEspecie(perfil)}` : nombreEspecie(perfil)}
          </p>
        </div>
      </button>
      <div style={{ padding: "10px 12px 12px", marginTop: "auto" }}>
        {enReto ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", minHeight: "44px", borderRadius: "999px", background: "rgba(111,134,255,0.14)", border: "1px solid rgba(111,134,255,0.35)", fontSize: "12.5px", fontWeight: 700, color: "#C9D2FF" }}>
            <Swords size={14} /> En reto
          </span>
        ) : onRetar ? (
          <Boton tono="si" ancho etiqueta={`Retar a ${t.apodo}`} onClick={() => onRetar(t)}>
            <Swords size={15} /> Retar
          </Boton>
        ) : null}
      </div>
    </div>
  );
}

/* La tarjeta vacía del principio de la rejilla: agregar a alguien más. */
function TarjetaNueva({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="amg-carta amg-nueva amg-tocar" data-agregar-amigo style={{ minHeight: "270px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "20px" }}>
      <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "16px" }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%", background: "rgba(42,157,143,0.18)", border: "1px solid rgba(63,193,176,0.5)" }}>
          <UserPlus size={26} color="#7FE0D2" />
        </span>
        <span style={{ fontFamily: "Sora, sans-serif", fontSize: "14.5px", fontWeight: 700, color: FAE.text }}>Agregar amigo</span>
        <span style={{ fontSize: "12px", color: "rgba(248,249,250,0.55)", textAlign: "center", lineHeight: 1.4 }}>Búscalo por su apodo</span>
      </span>
    </button>
  );
}

/* ── La ficha: el amigo en grande ─────────────────────────────────────────── */
function Ficha({ t, onCerrar, onRetar, onQuitar, enReto, onDuelo = null }) {
  const [seguro, setSeguro] = useState(false);
  const cerrarRef = useRef(null);
  const perfil = perfilDeTarjeta(t);

  useEffect(() => {
    cerrarRef.current?.focus();
    const tecla = (e) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onCerrar]);

  return (
    <div className="amg-velo" onClick={onCerrar} data-ficha-amigo>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha de ${t.apodo}`}
        className="amg-ficha"
        onClick={(e) => e.stopPropagation()}
        style={{
          ...PANEL, "--tono": tonoDe(perfil), width: "380px", maxWidth: "100%", overflow: "hidden",
          background: `radial-gradient(120% 70% at 50% 0%, rgba(${tonoDe(perfil)}, .28), transparent 70%), #13233A`,
        }}
      >
        <button
          ref={cerrarRef}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="amg-tocar"
          style={{ position: "absolute", top: "12px", right: "12px", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "50%", background: "rgba(6,12,22,0.5)" }}
        >
          <X size={18} color={FAE.text} />
        </button>
        <div style={{ paddingTop: "18px" }}>
          <Escenario perfil={perfil} tamano={190} animo="saluda" foco titulo={`Mascota de ${t.apodo}`} />
        </div>
        <div style={{ padding: "4px 22px 22px", textAlign: "center" }}>
          <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.025em", color: FAE.text, overflowWrap: "anywhere" }}>
            {t.apodo}
          </p>
          <p style={{ margin: "2px 0 12px", fontSize: "13px", color: "rgba(248,249,250,0.6)" }}>
            {t.mascota_nombre ? `Su ${nombreEspecie(perfil).toLowerCase()} ${t.mascota_nombre}` : `Su mascota: ${nombreEspecie(perfil).toLowerCase()}`}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
            {t.racha > 0 && <Racha dias={t.racha} />}
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "2px 9px", borderRadius: "999px", background: "rgba(248,249,250,0.08)", fontSize: "11.5px", fontWeight: 700, color: t.estudio_hoy ? "#B9F5D8" : "rgba(248,249,250,0.6)" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: t.estudio_hoy ? "#3DDC97" : "rgba(248,249,250,0.3)" }} />
              {t.estudio_hoy ? "Ya estudió hoy" : "Hoy aún no estudia"}
            </span>
          </div>
          <div style={{ display: "grid", gap: "8px" }}>
            {onDuelo && (
              <Boton tono="oro" grande ancho etiqueta={`Retar a ${t.apodo} a un duelo`} onClick={() => { onCerrar(); onDuelo(t); }} data-retar-duelo>
                <Swords size={17} /> Duelo 1 vs 1
              </Boton>
            )}
            {enReto ? (
              <p style={{ margin: 0, fontSize: "13px", color: "#C9D2FF" }}>Ya tienen un reto juntos. ¡A estudiar!</p>
            ) : onRetar ? (
              <Boton tono="si" grande ancho etiqueta={`Retar a ${t.apodo}`} onClick={() => { onRetar(t); onCerrar(); }}>
                <Swords size={17} /> Retar a estudiar juntos
              </Boton>
            ) : null}
            <Boton
              tono={seguro ? "peligro" : "suave"}
              ancho
              etiqueta={seguro ? `Confirmar: quitar a ${t.apodo}` : `Quitar a ${t.apodo} de tus amigos`}
              onClick={() => { if (seguro) { onQuitar(t); onCerrar(); } else setSeguro(true); }}
            >
              <UserMinus size={15} /> {seguro ? "Sí, quitarlo de mis amigos" : "Quitar de mis amigos"}
            </Boton>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── El panel completo ─────────────────────────────────────────────────────── */
export default function PanelAmigos({ onRetar = null, enReto = new Set(), perfilPropio = null, onDuelo = null }) {
  const { amigos, recibidas, enviadas, cargando, error, solicitar, responder, eliminar, buscar } = useAmigos();
  const [apodo, setApodo] = useState("");
  const [aviso, setAviso] = useState(null); // { tipo: "ok"|"error", texto }
  const [enviando, setEnviando] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const tecleo = useRef(null);
  const inputRef = useRef(null);

  /*
   * Sugerencias mientras se escribe: a partir de dos letras, y con un respiro
   * (debounce) para no consultar en cada tecla. No hace falta el apodo exacto.
   */
  useEffect(() => {
    const q = apodo.trim();
    if (tecleo.current) clearTimeout(tecleo.current);
    if (q.length < 2) {
      setSugerencias([]);
      return;
    }
    tecleo.current = setTimeout(async () => {
      const hallados = await buscar(q);
      setSugerencias(hallados);
    }, 220);
    return () => tecleo.current && clearTimeout(tecleo.current);
  }, [apodo, buscar]);

  const retar = async (t) => {
    if (!onRetar) return;
    setAviso(null);
    const r = await onRetar(t.user_id);
    if (r?.error) setAviso({ tipo: "error", texto: r.error });
    else setAviso({ tipo: "ok", texto: `¡Reto enviado a ${t.apodo}! Cuando acepte, a estudiar juntos.` });
  };

  const pedirA = async (valor) => {
    if (enviando) return;
    setEnviando(true);
    setAviso(null);
    const r = await solicitar(valor);
    setEnviando(false);
    if (r.error) {
      setAviso({ tipo: "error", texto: r.error });
      return;
    }
    setApodo("");
    setSugerencias([]);
    setAviso({ tipo: "ok", texto: `¡Listo! Le llegó tu solicitud a ${valor.trim()}.` });
  };

  const cerrarFicha = useCallback(() => setAbierto(null), []);

  const irAlBuscador = useCallback(() => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const lista = ordenar(amigos);
  const hoy = amigos.filter((a) => a.estudio_hoy).length;

  return (
    <div data-panel-amigos>
      <Entrada orden={1} modo="sube">
        <Portada
          perfilPropio={perfilPropio}
          nAmigos={amigos.length}
          apodo={apodo}
          setApodo={setApodo}
          sugerencias={sugerencias}
          enviando={enviando}
          onPedir={pedirA}
          inputRef={inputRef}
        />
        <Aviso aviso={aviso} />
      </Entrada>

      {/* ── Solicitudes recibidas: piden acción, van arriba ──────────────── */}
      {recibidas.length > 0 && (
        <section style={{ marginTop: "30px" }} aria-labelledby="amg-recibidas">
          <TituloSeccion id="amg-recibidas" cuenta={recibidas.length}>Te quieren agregar</TituloSeccion>
          <div className="amg-fila">
            {recibidas.map((t) => (
              <div
                key={t.amistad_id}
                data-solicitud={t.apodo}
                className="amg-carta"
                style={{ "--tono": tonoDe(perfilDeTarjeta(t)), flex: "0 0 200px", padding: "10px 12px 12px", boxShadow: "0 0 0 1px rgba(233,185,73,0.45) inset" }}
              >
                <Escenario perfil={perfilDeTarjeta(t)} tamano={96} animo="saluda" titulo={`Mascota de ${t.apodo}`} />
                <p style={{ margin: "4px 0 10px", textAlign: "center", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 800, color: FAE.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.apodo}
                </p>
                <div style={{ display: "flex", gap: "6px" }}>
                  <Boton tono="si" etiqueta={`Aceptar a ${t.apodo}`} onClick={() => responder(t.amistad_id, true)} style={{ flex: 1 }}>
                    <Check size={15} /> Aceptar
                  </Boton>
                  <Boton tono="suave" etiqueta={`Rechazar a ${t.apodo}`} onClick={() => responder(t.amistad_id, false)}>
                    <X size={15} />
                  </Boton>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Tus amigos ──────────────────────────────────────────────────── */}
      <section style={{ marginTop: "30px" }} aria-labelledby="amg-amigos" id="amigos-lista">
        <TituloSeccion
          id="amg-amigos"
          cuenta={amigos.length || null}
          derecha={hoy > 0 ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", fontWeight: 600, color: "#B9F5D8" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3DDC97", boxShadow: "0 0 8px #3DDC97" }} />
              {hoy} {hoy === 1 ? "estudió" : "estudiaron"} hoy
            </span>
          ) : null}
        >
          Tus amigos
        </TituloSeccion>

        {cargando && <p style={{ fontSize: "13px", color: "rgba(248,249,250,0.55)", margin: "0 0 12px" }}>Cargando…</p>}
        {error && !cargando && <p style={{ fontSize: "13px", color: FAE.coral, margin: "0 0 12px" }}>{error}</p>}

        {!cargando && amigos.length === 0 && (
          <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.6)", margin: "0 0 14px", lineHeight: 1.5 }}>
            Todavía no tienes amigos aquí. Pídele su apodo a un compañero y búscalo arriba: su mascota aparecerá en esta pared.
          </p>
        )}

        <div className="amg-rejilla">
          {lista.map((t) => (
            <TarjetaAmigo key={t.amistad_id} t={t} onAbrir={setAbierto} onRetar={onRetar ? retar : null} enReto={enReto.has(t.user_id)} />
          ))}
          <TarjetaNueva onClick={irAlBuscador} />
        </div>
      </section>

      {/* ── Lo que tú enviaste y sigue pendiente ────────────────────────── */}
      {enviadas.length > 0 && (
        <section style={{ marginTop: "26px" }} aria-labelledby="amg-enviadas">
          <p id="amg-enviadas" style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 10px", fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, color: "rgba(248,249,250,0.6)" }}>
            <Clock size={14} /> Esperando que te acepten
          </p>
          <div className="amg-fila">
            {enviadas.map((t) => (
              <div
                key={t.amistad_id}
                data-enviada={t.apodo}
                style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: "10px", padding: "6px 6px 6px 8px", borderRadius: "999px", background: "rgba(248,249,250,0.05)", border: "1px dashed rgba(248,249,250,0.18)", maxWidth: "260px" }}
              >
                <span style={{ opacity: 0.75, display: "flex" }}><Carita perfil={perfilDeTarjeta(t)} tamano={40} titulo={`Mascota de ${t.apodo}`} /></span>
                <span style={{ minWidth: 0, fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600, color: "rgba(248,249,250,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.apodo}
                </span>
                <Boton tono="suave" etiqueta={`Cancelar la solicitud a ${t.apodo}`} onClick={() => eliminar(t.amistad_id)}>
                  Cancelar
                </Boton>
              </div>
            ))}
          </div>
        </section>
      )}

      {abierto && (
        <Ficha
          t={abierto}
          onCerrar={cerrarFicha}
          onRetar={onRetar ? retar : null}
          onQuitar={(t) => eliminar(t.amistad_id)}
          enReto={enReto.has(abierto.user_id)}
          onDuelo={onDuelo}
        />
      )}
    </div>
  );
}
