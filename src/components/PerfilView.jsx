import { ChevronLeft } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import RankingFP from "./ranking/RankingFP.jsx";
import { useAuth } from "../auth/AuthProvider.jsx";
import { useContext, useEffect, useState } from "react";
import { NavigationContext } from "../navigation.js";
import { useAccesoDocente } from "../docente/useAccesoDocente.js";
import { rachaVigente, proximoHito, enRiesgoHoy } from "../fp/racha.js";
import { animosRecibidos } from "../social/animo.js";
import Medallas from "./perfil/Medallas.jsx";
import ResumenSemestre from "./perfil/ResumenSemestre.jsx";
import EditarPerfil, { SECCIONES } from "./perfil/EditarPerfil.jsx";
import Avatar, { TAMANOS } from "./avatar/Avatar.jsx";
import IconoCristal from "./shared/IconoCristal.jsx";
import { combinacionDe, leyenda } from "../avatar/generador.js";
import { saldoDe } from "../cristales/cristales.js";
import { AVISO_AVATAR, avisoPendiente, descartarAviso } from "./perfil/avisoAvatar.js";

/*
 * Perfil del estudiante. Se llega desde el indicador de cuenta de la cabecera.
 * Aquí vive el ranking general, que combina las dos materias; el de cada
 * materia vive en su propio índice de temas.
 */

const dato = {
  borderRadius: "16px",
  background: "rgba(248,249,250,0.04)",
  border: "1px solid rgba(248,249,250,0.12)",
  padding: "16px 18px",
};

export default function PerfilView({ seccion = null, onBack }) {
  /*
   * El acceso al panel docente aparece solo si la cuenta está en la lista
   * blanca. Para un estudiante no existe: ni el enlace ni la pista de que haya
   * algo detrás.
   */
  const nav = useContext(NavigationContext);
  const [animos, setAnimos] = useState(null);
  /* La misma respuesta que el atajo de la cabecera: no se vuelve a preguntar. */
  const { esDocente } = useAccesoDocente();

  const { perfil, session, pedirCuenta, guardarPerfil } = useAuth();
  /*
   * Editar perfil se abre en el sitio de la ficha y vuelve a ella al guardar o
   * cancelar. `vuelta` remonta el ranking de abajo tras guardar: ya pintado,
   * seguiría enseñando el apodo viejo en tu fila hasta recargar.
   */
  /*
   * ═══════════ #/perfil/avatar ABRE DIRECTO EN EL AVATAR ═══════════
   *
   * «Mi avatar», en el menú de cuenta, tiene que llevar al selector y no al
   * formulario entero: cambiar de figura no es editar el apodo. Se resuelve
   * con el mismo mecanismo que ya existe —EditarPerfil recibe qué secciones
   * pintar— así que aquí solo se filtra la lista, y no hay una segunda vista
   * de avatar que mantener al lado de la primera.
   */
  const soloAvatar = seccion === "avatar";
  const [editando, setEditando] = useState(soloAvatar);

  /* Si se llega con el hash puesto estando ya en el perfil, se abre igual. */
  useEffect(() => { if (soloAvatar) setEditando(true); }, [soloAvatar]);
  const [vuelta, setVuelta] = useState(0);
  /* El aviso de la primera vez. Se decide al montar: ver avisoAvatar.js. */
  const [aviso, setAviso] = useState(() => avisoPendiente());

  useEffect(() => {
    if (!session) return;
    let vivo = true;
    animosRecibidos().then((n) => vivo && setAnimos(n));
    return () => { vivo = false; };
  }, [session]);

  const racha = rachaVigente(perfil);
  const siguiente = proximoHito(racha);
  const enRiesgo = enRiesgoHoy(perfil);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: FAE.bg,
        fontFamily: "Inter, sans-serif",
        color: FAE.text,
        backgroundImage: "radial-gradient(circle at 50% -10%, rgba(42,157,143,0.16), transparent 55%)",
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "26px" }}>
          <Logo variant="symbol" size={26} theme="dark" />
          <span aria-hidden="true" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", padding: "8px",
              borderRadius: "999px", background: "rgba(248,249,250,0.06)",
              border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} color={FAE.text} />
          </button>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
            Tu perfil
          </h1>
        </div>

        {!session ? (
          <div style={{ ...dato, marginBottom: "22px" }}>
            <p style={{ fontSize: "14.5px", lineHeight: 1.55, color: "rgba(248,249,250,0.7)", margin: "0 0 12px" }}>
              Entra para ver tu perfil y tu posición en el ranking.
            </p>
            <button
              type="button"
              onClick={() => pedirCuenta("ver tu perfil")}
              style={{
                fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
                padding: "10px 18px", borderRadius: "999px", border: "none",
                cursor: "pointer", backgroundColor: FAE.teal, color: FAE.bg,
              }}
            >
              Entrar
            </button>
          </div>
        ) : editando ? (
          <div style={{ ...dato, marginBottom: "26px" }}>
            <EditarPerfil
              perfil={perfil}
              guardar={guardarPerfil}
              secciones={soloAvatar ? SECCIONES.filter((s) => s.id === "avatar") : SECCIONES}
              onCancelar={() => setEditando(false)}
              onGuardado={() => { setEditando(false); setVuelta((v) => v + 1); }}
            />
          </div>
        ) : (
          <>
            {/*
              El avatar, a 96 px, con el apodo al lado. TOCARLO ABRE EDITAR
              PERFIL: es el atajo directo al selector, además del botón de
              abajo. Lo que se toca para cambiar algo es la cosa misma.
            */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "0 0 10px" }}>
              <button
                type="button"
                data-abrir-avatar
                onClick={() => setEditando(true)}
                aria-label={`Cambiar tu avatar. Ahora: ${leyenda(combinacionDe(perfil))}`}
                style={{
                  padding: "6px", borderRadius: "999px", cursor: "pointer", flexShrink: 0,
                  background: "rgba(29,53,87,0.55)", border: "1px solid rgba(248,249,250,0.14)", lineHeight: 0,
                }}
              >
                <Avatar perfil={perfil} tamano={TAMANOS.perfil} />
              </button>
              <p
                data-apodo
                style={{
                  fontFamily: "Sora, sans-serif", fontWeight: 700,
                  fontSize: "clamp(24px, 4vw, 34px)", letterSpacing: "-0.03em",
                  lineHeight: 1.1, margin: 0, minWidth: 0, overflowWrap: "anywhere",
                }}
              >
                {perfil?.nickname ?? "Tu cuenta"}
              </p>
            </div>

            {aviso && (
              <p
                data-aviso-avatar
                style={{
                  display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
                  fontSize: "13px", lineHeight: 1.5, color: "rgba(248,249,250,0.66)", margin: "0 0 12px",
                }}
              >
                {AVISO_AVATAR}
                <button
                  type="button"
                  data-descartar-aviso
                  onClick={() => { descartarAviso(); setAviso(false); }}
                  style={{
                    background: "transparent", border: "none", padding: 0, cursor: "pointer",
                    fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600, color: FAE.teal,
                  }}
                >
                  Entendido
                </button>
              </p>
            )}
            <p style={{ fontSize: "14px", color: "rgba(248,249,250,0.5)", margin: "0 0 4px" }}>
              Este es el nombre que ven los demás en los rankings.
            </p>
            <p data-nombre-real style={{ fontSize: "14px", color: "rgba(248,249,250,0.5)", margin: "0 0 14px" }}>
              Nombre real: {perfil?.full_name || "sin escribir"} · solo lo ve tu profesor.
            </p>
            <button
              type="button"
              onClick={() => setEditando(true)}
              style={{
                fontFamily: "Sora, sans-serif", fontSize: "13.5px", fontWeight: 600,
                padding: "10px 18px", borderRadius: "999px", cursor: "pointer", margin: "0 0 22px",
                background: "transparent", border: "1px solid rgba(248,249,250,0.22)", color: "rgba(248,249,250,0.72)",
              }}
            >
              Editar perfil
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "26px" }}>
              <div style={dato}>
                <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "0 0 4px" }}>FP acumulados</p>
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", margin: 0, color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
                  {perfil?.points ?? 0}
                </p>
              </div>
              {/*
                La racha que se enseña es la vigente, no la guardada: si pasó un
                día entero sin entrar, se acabó, y mostrar el número viejo sería
                el mismo dato falso que había antes.
              */}
              <div style={dato}>
                <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "0 0 4px" }}>Racha</p>
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", margin: 0, color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
                  {racha} {racha === 1 ? "día" : "días"}
                </p>
                {siguiente && (
                  <p style={{ fontSize: "11.5px", color: FAE.teal, margin: "4px 0 0" }}>
                    {siguiente - racha === 1 ? "1 día" : `${siguiente - racha} días`} para el bono de {siguiente}
                  </p>
                )}
              </div>
              <div style={dato}>
                <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "0 0 4px" }}>Récord de racha</p>
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", margin: 0, color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
                  {perfil?.best_streak ?? 0} {(perfil?.best_streak ?? 0) === 1 ? "día" : "días"}
                </p>
              </div>
              {/*
                * Ánimos recibidos: el número y nada más. Quién los dio no se
                * guarda para mostrarse, y ninguna consulta lo devuelve.
                */}
              {/*
                * Los Cristales, junto a los FP y la racha, y la entrada
                * principal a la Tienda: la moneda y el sitio donde se gasta son
                * la misma tarjeta. FP y Cristales se ven al lado sin mezclarse
                * —uno es el puntaje, el otro la moneda— y no hay forma de
                * cambiar uno por el otro en ninguna dirección.
                */}
              <button
                type="button"
                data-ir-tienda
                onClick={() => nav?.irATienda?.()}
                style={{ ...dato, textAlign: "left", cursor: "pointer", color: FAE.text, font: "inherit", border: `1px solid ${FAE.teal}`, background: "rgba(42,157,143,0.10)" }}
              >
                <p style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "0 0 4px" }}>
                  <IconoCristal tamano={12} />
                  Cristales
                </p>
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", margin: 0, color: FAE.text, fontVariantNumeric: "tabular-nums" }}>
                  {saldoDe(perfil)}
                </p>
                <p style={{ fontSize: "11.5px", color: FAE.teal, margin: "4px 0 0" }}>Ir a la Tienda →</p>
              </button>
              <div style={dato}>
                <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "0 0 4px" }}>Ánimos recibidos</p>
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "24px", margin: 0, color: FAE.coral, fontVariantNumeric: "tabular-nums" }}>
                  {animos ?? "—"}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: "26px" }}>
              <Medallas />
            </div>

            <div style={{ marginBottom: "26px" }}>
              <ResumenSemestre apodo={perfil?.nickname} />
            </div>

            {enRiesgo && (
              <p style={{ fontSize: "13px", lineHeight: 1.5, color: FAE.ambar, margin: "-14px 0 26px" }}>
                Tu racha de {racha} {racha === 1 ? "día" : "días"} se corta si hoy no completas nada.
              </p>
            )}
          </>
        )}

        {esDocente && (
          <button
            type="button"
            onClick={() => nav?.irAPanelDocente?.()}
            style={{
              width: "100%", marginBottom: "18px", padding: "14px 18px", borderRadius: "16px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
              cursor: "pointer", textAlign: "left",
              background: "rgba(42,157,143,0.10)", border: `1px solid ${FAE.teal}`, color: FAE.text,
            }}
          >
            <span>
              <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "15px" }}>Panel docente</span>
              <span style={{ display: "block", fontSize: "12.5px", color: "rgba(248,249,250,0.6)", marginTop: "2px" }}>El avance de tus estudiantes</span>
            </span>
            <span style={{ fontSize: "20px", color: FAE.teal }}>→</span>
          </button>
        )}

        <RankingFP key={vuelta} titulo="Ranking general" nota="Todas las materias" />
      </div>
    </div>
  );
}
