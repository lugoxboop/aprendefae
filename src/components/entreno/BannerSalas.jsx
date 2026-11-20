import { useContext } from "react";
import { Gamepad2, Play, ArrowRight } from "lucide-react";
import { FAE } from "../../theme.js";
import { NavigationContext } from "../../navigation.js";
import { Escenario, Carita, Boton, perfilDeTarjeta } from "../social/amigos-comun.jsx";
import { useMisSalas } from "../../entreno/datos.js";
import { CSS_SALAS } from "./estilo-salas.js";
import { Arena } from "./Sala.jsx";

/*
 * La puerta a las salas de entrenamiento desde Amigos: las invitaciones que te
 * esperan (con «Entrar») y una franja de arena con tu mascota y «Crear sala».
 */
export default function BannerSalas({ yo }) {
  const nav = useContext(NavigationContext);
  const { invitaciones, actual } = useMisSalas(true);
  const ir = (extra = null) => nav?.irA?.("salas", null, extra);
  return (
    <section aria-label="Salas de entrenamiento" style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "26px" }} data-banner-salas>
      <style>{CSS_SALAS}</style>
      {invitaciones.slice(0, 3).map((inv) => (
        <div key={inv.sala_id} className="sal-panel" data-sal-invitacion
          style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", padding: "12px 14px", borderColor: "rgba(233,185,73,.55)", background: "linear-gradient(90deg, rgba(233,185,73,.16), rgba(248,249,250,.03))" }}>
          <Carita perfil={perfilDeTarjeta(inv.de)} tamano={48} titulo={`Mascota de ${inv.de?.apodo}`} />
          <div style={{ flex: "1 1 170px", minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "14.5px", color: FAE.text, overflowWrap: "anywhere" }}>
              {inv.de?.apodo} te {inv.duelo ? "retó a un duelo" : "invitó a su sala"}
            </p>
            <p className="sal-nota" style={{ fontSize: "12.5px" }}>{inv.tema_titulo} · {inv.jugadores} en el lobby</p>
          </div>
          <Boton tono="oro" onClick={() => ir()} etiqueta="Ver la invitación"><Play size={15} fill="currentColor" /> Entrar</Boton>
        </div>
      ))}
      <Arena style={{ minHeight: 0, padding: "14px clamp(14px, 3vw, 24px)" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <div aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", flexShrink: 0 }}>
            {yo && <div style={{ width: "86px" }}><Escenario perfil={yo} tamano={78} animo="feliz" alto={98} /></div>}
            <span className="sal-silueta sal-latido" style={{ width: "44px", height: "54px", marginBottom: "12px", marginLeft: "-6px" }} />
            <span className="sal-silueta sal-latido" style={{ width: "44px", height: "54px", marginBottom: "12px", marginLeft: "4px", animationDelay: ".6s" }} />
          </div>
          <div style={{ flex: "1 1 200px", minWidth: 0 }}>
            <span className="sal-cejilla">Nuevo · salas de entrenamiento</span>
            <p style={{ margin: "2px 0 2px", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "18px", color: FAE.text, letterSpacing: "-0.02em" }}>
              Arma una partida con tus amigos
            </p>
            <p className="sal-nota" style={{ fontSize: "13px" }}>Lobby con sus mascotas, tú eliges el tema y todos responden a la vez.</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {actual ? (
              <Boton tono="si" onClick={() => ir(`s-${actual.sala_id}`)} etiqueta="Volver a tu sala">Volver a tu sala <ArrowRight size={15} /></Boton>
            ) : (
              <Boton tono="oro" className="sal-brilla" onClick={() => ir()} etiqueta="Ir a las salas de entrenamiento" data-ir-salas>
                <Gamepad2 size={17} /> Crear o entrar
              </Boton>
            )}
          </div>
        </div>
      </Arena>
    </section>
  );
}
