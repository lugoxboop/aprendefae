import { ChevronLeft, ArrowRight, Flame, Heart, Trophy, Zap } from "lucide-react";
import { FAE } from "../theme.js";
import Logo from "./Logo.jsx";
import RankingFP from "./ranking/RankingFP.jsx";
import { decoracionDe } from "../data/decoracionTablas.js";
import { useAuth } from "../auth/AuthProvider.jsx";
import { useContext, useEffect, useState } from "react";
import { NavigationContext } from "../navigation.js";
import { useAccesoDocente } from "../docente/useAccesoDocente.js";
import { rachaVigente, proximoHito, enRiesgoHoy, HITOS } from "../fp/racha.js";
import { animosRecibidos } from "../social/animo.js";
import Medallas, { useMedallas } from "./perfil/Medallas.jsx";
import HeroePerfil from "./perfil/HeroePerfil.jsx";
import { CSS_PERFIL, MENTA } from "./perfil/estilo-perfil.js";
import ResumenSemestre from "./perfil/ResumenSemestre.jsx";
import EditarPerfil, { SECCIONES } from "./perfil/EditarPerfil.jsx";
import IconoCristal from "./shared/IconoCristal.jsx";
import { saldoDe } from "../cristales/cristales.js";
import { avisoPendiente, descartarAviso } from "./perfil/avisoAvatar.js";

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
  /* Desde dónde se cuenta la barra hacia el próximo bono: el hito anterior. */
  const previo = [...HITOS].reverse().find((h) => h <= racha) ?? 0;
  /* Una sola carga de logros: la usan la vitrina de la cabecera y la colección. */
  const medallas = useMedallas();
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
      <div data-mv-fila style={{ maxWidth: "680px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 56px" }}>
        <div className="fae-cabecera" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "26px" }}>
          <span className="fae-cabecera-marca"><Logo variant="symbol" size={26} theme="dark" /></span>
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{
              /* 44 px medidos, no de padding: con 8 de relleno sobre un icono
                 de 20 el botón salía de 38 y es el control más usado del
                 sitio después de los nodos. */
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "44px", height: "44px", padding: 0, flexShrink: 0,
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
          <div className="fae-pf-raiz">
            <style>{CSS_PERFIL}</style>
            <HeroePerfil
              perfil={perfil}
              racha={racha}
              medallas={medallas}
              aviso={aviso}
              onDescartarAviso={() => { descartarAviso(); setAviso(false); }}
              onEditar={() => setEditando(true)}
            />

            {enRiesgo && (
              <p data-racha-en-riesgo className="fae-pf-aviso" style={{ margin: "0 0 16px", color: FAE.ambar, borderColor: "rgba(233,196,106,0.45)" }}>
                Tu racha de {racha} {racha === 1 ? "día" : "días"} se corta si hoy no completas nada.
              </p>
            )}

            {/*
              Las fichas de números. La racha, ancha y con su barra hacia el
              próximo bono: es la que se pierde si no vuelves, y lo que está en
              juego se ve (el mismo criterio del banner del Repaso). La racha
              que se enseña es la vigente, no la guardada.
            */}
            <div className="fae-pf-fichas" data-fichas-perfil>
              <div className="fae-pf-ficha fae-pf-ficha--ancha">
                <p className="fae-pf-rotulo">
                  <span className="fae-pf-icono" style={{ background: "rgba(244,162,97,0.16)" }}><Flame size={14} strokeWidth={2.4} color={FAE.ambar} /></span>
                  Racha
                </p>
                <p className="fae-pf-cifra">{racha} <small>{racha === 1 ? "día" : "días"}</small></p>
                {siguiente && (
                  <>
                    <div className="fae-pf-barra" aria-hidden="true">
                      <span style={{ width: `${Math.max(4, Math.round(((racha - previo) / (siguiente - previo)) * 100))}%` }} />
                    </div>
                    <p className="fae-pf-nota">
                      {siguiente - racha === 1 ? "1 día" : `${siguiente - racha} días`} para el bono de {siguiente}
                    </p>
                  </>
                )}
              </div>
              <div className="fae-pf-ficha">
                <p className="fae-pf-rotulo">
                  <span className="fae-pf-icono" style={{ background: "rgba(134,224,195,0.14)" }}><Zap size={14} strokeWidth={2.4} color={MENTA} /></span>
                  FP acumulados
                </p>
                <p className="fae-pf-cifra">{perfil?.points ?? 0}</p>
              </div>
              <div className="fae-pf-ficha">
                <p className="fae-pf-rotulo">
                  <span className="fae-pf-icono" style={{ background: "rgba(233,196,106,0.14)" }}><Trophy size={14} strokeWidth={2.4} color={FAE.ambar} /></span>
                  Récord de racha
                </p>
                <p className="fae-pf-cifra">{perfil?.best_streak ?? 0} <small>{(perfil?.best_streak ?? 0) === 1 ? "día" : "días"}</small></p>
              </div>
              {/*
                * Los Cristales, junto a los FP y la racha, y la entrada
                * principal a la Tienda: la moneda y el sitio donde se gasta son
                * la misma tarjeta. FP y Cristales se ven al lado sin mezclarse.
                */}
              <button
                type="button"
                data-ir-tienda
                className="fae-pf-ficha fae-pf-ficha--boton fae-pf-ficha--media"
                onClick={() => nav?.irATienda?.()}
              >
                <span className="fae-pf-rotulo">
                  <span className="fae-pf-icono" style={{ background: "rgba(134,224,195,0.14)" }}><IconoCristal tamano={14} /></span>
                  Cristales
                </span>
                <span className="fae-pf-cifra" style={{ display: "block" }}>{saldoDe(perfil)}</span>
                <span className="fae-pf-nota" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  Ir a la Tienda <ArrowRight size={13} strokeWidth={2.4} aria-hidden="true" />
                </span>
              </button>
              {/* Ánimos recibidos: el número y nada más. Quién los dio no se guarda para mostrarse. */}
              <div className="fae-pf-ficha fae-pf-ficha--media">
                <p className="fae-pf-rotulo">
                  <span className="fae-pf-icono" style={{ background: "rgba(231,111,81,0.16)" }}><Heart size={14} strokeWidth={2.4} color={FAE.coral} /></span>
                  Ánimos recibidos
                </p>
                <p className="fae-pf-cifra">{animos ?? "—"}</p>
              </div>
            </div>

            <Medallas estado={medallas} />

            <section className="fae-pf-tarjeta" style={{ marginBottom: "16px" }}>
              <div className="fae-pf-tarjeta-in">
                <ResumenSemestre apodo={perfil?.nickname} />
              </div>
            </section>
          </div>
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
            <span style={{ fontSize: "20px", color: MENTA }}>→</span>
          </button>
        )}

        <RankingFP key={vuelta} titulo="Ranking general" nota="Todas las materias" decoracion={decoracionDe("general")} />
      </div>
    </div>
  );
}
