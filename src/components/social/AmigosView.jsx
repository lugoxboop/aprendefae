import { useState, useMemo, useCallback, useContext } from "react";
import { ChevronLeft } from "lucide-react";
import { FAE } from "../../theme.js";
import Logo from "../Logo.jsx";
import MeshGradientBackground from "../backgrounds/MeshGradientBackground.jsx";
import Entrada, { EstiloEntrada, entrada } from "../shared/Entrada.jsx";
import { useAuth } from "../../auth/AuthProvider.jsx";
import PanelAmigos from "./PanelAmigos.jsx";
import PanelRetos from "./PanelRetos.jsx";
import { ESTILO_AMIGOS, PANEL } from "./amigos-comun.jsx";
import { useRetos } from "../../social/useRetos.js";
import { NavigationContext } from "../../navigation.js";
import BannerSalas from "../entreno/BannerSalas.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PANTALLA DE AMIGOS — su propio destino (#/amigos), como la Tienda.
 *
 * Rehecha desde cero el 20-nov al estilo de la lista de amigos de un juego:
 * a cada amigo se le ve entero, con su mascota vestida, y el nombre debajo.
 * PanelAmigos lleva la portada (tu mascota + buscar), las solicitudes y la
 * rejilla; PanelRetos, los retos como duelo en equipo. Esto pone la cabecera,
 * los datos de los retos y el estado sin sesión.
 *
 * Los amigos van primero (son la pantalla); los retos, debajo, como duelos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export default function AmigosView({ onBack }) {
  const { session, perfil, pedirCuenta, refrescarPerfil } = useAuth();
  const retos = useRetos(Boolean(session));
  const nav = useContext(NavigationContext);
  const duelo = useCallback((t) => nav?.irA?.("salas", null, `duelo-${t.user_id}`), [nav]);
  const [respondiendo, setRespondiendo] = useState(null);
  const [cerrando, setCerrando] = useState(null);

  const responderReto = async (id, aceptar) => {
    setRespondiendo(id);
    await retos.responder(id, aceptar);
    setRespondiendo(null);
  };
  const cerrarReto = async (id) => {
    setCerrando(id);
    const r = await retos.cerrar(id);
    setCerrando(null);
    if (r?.ok) refrescarPerfil?.(); // el bono ya se pagó: refrescar el saldo
  };

  /* Con quién ya hay un reto (en curso o esperando): su tarjeta no ofrece «Retar». */
  const enReto = useMemo(() => {
    const s = new Set();
    for (const r of [...retos.activos, ...retos.invitaciones, ...retos.enviadas]) if (r.otro?.user_id) s.add(r.otro.user_id);
    return s;
  }, [retos.activos, retos.invitaciones, retos.enviadas]);

  const yo = perfil ? { ...perfil, id: perfil.user_id ?? perfil.id } : null;
  const irALista = useCallback(() => {
    document.getElementById("amigos-lista")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const panelRetos = (
    <Entrada orden={3} modo="sube">
      <PanelRetos
        activos={retos.activos}
        invitaciones={retos.invitaciones}
        enviadas={retos.enviadas}
        cargando={retos.cargando}
        onResponder={responderReto}
        onCerrar={cerrarReto}
        respondiendo={respondiendo}
        cerrando={cerrando}
        yo={yo}
        onElegirAmigo={irALista}
      />
    </Entrada>
  );

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: FAE.bg,
        fontFamily: "Inter, sans-serif",
        color: FAE.text,
      }}
    >
      <MeshGradientBackground />
      <EstiloEntrada />
      <style>{ESTILO_AMIGOS}</style>
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1080px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) clamp(16px, 3vw, 28px) 64px" }}>
        <div {...entrada(0, "baja")} className="fae-cabecera amg-cabecera" style={{ ...entrada(0, "baja").style, display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
          <span className="fae-cabecera-marca"><Logo variant="symbol" size={26} theme="dark" /></span>
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "44px", height: "44px", padding: 0, flexShrink: 0,
              borderRadius: "999px", background: "rgba(248,249,250,0.06)",
              border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} color={FAE.text} />
          </button>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
            Amigos
          </h1>
        </div>

        {!session ? (
          <Entrada orden={1} modo="sube">
            <div style={{ ...PANEL, padding: "26px 22px", textAlign: "center", maxWidth: "560px", margin: "0 auto" }}>
              <p style={{ fontFamily: "Sora, sans-serif", fontSize: "18px", fontWeight: 800, margin: "0 0 6px" }}>Tu equipo de estudio te espera</p>
              <p style={{ fontSize: "14px", lineHeight: 1.5, color: "rgba(248,249,250,0.7)", margin: "0 0 16px" }}>
                Entra para agregar amigos, ver sus mascotas y retarlos a estudiar juntos.
              </p>
              <button
                type="button"
                onClick={() => pedirCuenta?.()}
                style={{
                  minHeight: "46px", padding: "0 22px", borderRadius: "999px", cursor: "pointer",
                  border: "1px solid transparent", background: FAE.teal, color: "#06202A",
                  fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 700,
                }}
              >
                Entrar
              </button>
            </div>
          </Entrada>
        ) : (
          <>
            <Entrada orden={1} modo="sube">
              <BannerSalas yo={yo} />
            </Entrada>
            <PanelAmigos onRetar={(userId) => retos.retar(userId)} enReto={enReto} perfilPropio={perfil} onDuelo={duelo} />
            {panelRetos}
          </>
        )}
      </div>
    </div>
  );
}
