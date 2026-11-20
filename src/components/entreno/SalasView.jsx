import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Play, LogIn, Swords, Users, Gamepad2, ArrowRight, X as Equis } from "lucide-react";
import { FAE } from "../../theme.js";
import Logo from "../Logo.jsx";
import MeshGradientBackground from "../backgrounds/MeshGradientBackground.jsx";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { NavigationContext } from "../../navigation.js";
import { CSS_VIVO } from "../../vivo/estilo.js";
import { ESTILO_AMIGOS, Escenario, Carita, Boton, perfilDeTarjeta } from "../social/amigos-comun.jsx";
import { crearSala, unirse, entrar, rechazar, limpiarCodigo, mensajeSala, amigosParaInvitar, useMisSalas, leerEstado } from "../../entreno/datos.js";
import { CSS_SALAS } from "./estilo-salas.js";
import { ElegirActividad, ElegirAmigos, paqueteDeActividad, separarElegidos, Seccion, Pasos, NOMBRE_MATERIA } from "./piezas-sala.jsx";
import Sala, { Arena } from "./Sala.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS SALAS DE ENTRENAMIENTO (#/salas) — pedido de Mateo, 20-nov.
 *
 *   #/salas                  la portada: crear, entrar con código, invitaciones
 *   #/salas/123456           entra con ese código (el enlace que se comparte)
 *   #/salas/s-<id>           una sala concreta (así recargar no te saca)
 *   #/salas/duelo-<cuenta>   crear un duelo 1 vs 1 contra ese amigo
 *   #/salas/duelo-demo-<id>  …o contra un amigo de demostración
 *
 * El duelo es una sala de dos: el mismo lobby y la misma partida.
 * ═══════════════════════════════════════════════════════════════════════════
 */

function leerExtra(extra) {
  const e = String(extra ?? "");
  if (/^\d{6}$/.test(e)) return { tipo: "codigo", valor: e };
  if (e.startsWith("s-")) return { tipo: "sala", valor: e.slice(2) };
  if (e.startsWith("duelo-demo-")) return { tipo: "duelo", valor: `d:${e.slice(11)}` };
  if (e.startsWith("duelo-")) return { tipo: "duelo", valor: `u:${e.slice(6)}` };
  return { tipo: null, valor: null };
}

export default function SalasView({ extra = null, onBack }) {
  const { session, perfil, pedirCuenta } = useAuth();
  const nav = useContext(NavigationContext);
  const pedido = useMemo(() => leerExtra(extra), [extra]);
  const [pantalla, setPantalla] = useState(() => (pedido.tipo === "duelo" ? "crear" : pedido.tipo === "sala" ? "sala" : "inicio"));
  const [sala, setSala] = useState(() => (pedido.tipo === "sala" ? { id: pedido.valor, inicial: null } : null));
  const [aviso, setAviso] = useState(null);
  const intentado = useRef(false);

  /* Al estar en una sala, la dirección la recuerda (sin empujar historial). */
  const abrirSala = (estado) => {
    setSala({ id: estado.sala_id, inicial: estado });
    setPantalla("sala");
    nav?.marcarNodo?.(`s-${estado.sala_id}`);
  };
  const aInicio = () => { setSala(null); setPantalla("inicio"); nav?.marcarNodo?.(null); };

  /* Con el código en la dirección y sesión puesta, se entra sin tocar nada. */
  useEffect(() => {
    if (intentado.current || !session || pedido.tipo !== "codigo") return;
    intentado.current = true;
    unirse(pedido.valor).then(({ data, error }) => (error ? setAviso(mensajeSala(error)) : abrirSala(data)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, pedido]);

  const yo = perfil ? { ...perfil, id: perfil.user_id ?? perfil.id } : null;

  return (
    <div className="sal" style={{ position: "relative", minHeight: "100vh", backgroundColor: FAE.bg, fontFamily: "Inter, sans-serif", color: FAE.text }} data-salas>
      <MeshGradientBackground />
      <style>{ESTILO_AMIGOS}</style>
      <style>{CSS_VIVO}</style>
      <style>{CSS_SALAS}</style>
      <div className="sal-marco">
        <div className="fae-cabecera amg-cabecera" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="fae-cabecera-marca"><Logo variant="symbol" size={26} theme="dark" /></span>
          <button type="button" onClick={pantalla === "crear" ? aInicio : pantalla === "sala" ? aInicio : onBack} aria-label="Volver"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", padding: 0, flexShrink: 0, borderRadius: "999px",
              background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer" }}>
            <ChevronLeft size={20} color={FAE.text} />
          </button>
          <h1 style={{ flex: "1 1 auto", minWidth: 0, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.15 }}>Salas<span className="sal-largo"> de entrenamiento</span></h1>
        </div>

        {!session ? (
          <SinSesion pedirCuenta={pedirCuenta} />
        ) : pantalla === "sala" && sala ? (
          <Sala key={sala.id} salaId={sala.id} inicial={sala.inicial} onSalir={aInicio} />
        ) : pantalla === "crear" ? (
          <Crear yo={yo} duelo={pedido.tipo === "duelo" ? pedido.valor : null} onCreada={abrirSala} onCancelar={aInicio} />
        ) : (
          <Inicio yo={yo} aviso={aviso} onCrear={() => setPantalla("crear")} onAbrir={abrirSala} setAviso={setAviso} />
        )}
      </div>
    </div>
  );
}

function SinSesion({ pedirCuenta }) {
  return (
    <div className="sal-panel" style={{ padding: "26px 22px", textAlign: "center", maxWidth: "560px", margin: "24px auto" }}>
      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "18px", fontWeight: 800, margin: "0 0 6px" }}>Tu equipo te espera en la sala</p>
      <p className="sal-nota" style={{ margin: "0 0 16px" }}>Entra para armar salas con tus amigos y jugar partidas de tus temas.</p>
      <Boton tono="si" grande onClick={() => pedirCuenta?.()}><LogIn size={17} /> Entrar</Boton>
    </div>
  );
}

/* ═══════════ LA PORTADA DE LAS SALAS ═══════════ */

function Inicio({ yo, aviso, setAviso, onCrear, onAbrir }) {
  const mis = useMisSalas(true);
  const [codigo, setCodigo] = useState("");
  const [entrando, setEntrando] = useState(false);

  const conCodigo = async (e) => {
    e.preventDefault();
    if (codigo.length !== 6 || entrando) return;
    setEntrando(true); setAviso(null);
    const { data, error } = await unirse(codigo);
    setEntrando(false);
    if (error) { setAviso(mensajeSala(error)); return; }
    onAbrir(data);
  };
  const aceptar = async (inv) => {
    const { data, error } = await entrar(inv.sala_id);
    if (error) { setAviso(mensajeSala(error)); mis.recargar(); return; }
    onAbrir(data);
  };
  const volver = async () => {
    const { data, error } = await leerEstado(mis.actual.sala_id);
    if (error) { mis.recargar(); return; }
    onAbrir(data);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }} data-sal-inicio>
      {mis.invitaciones.length > 0 && (
        <section aria-label="Invitaciones" style={{ display: "grid", gap: "10px" }}>
          {mis.invitaciones.map((inv) => (
            <div key={inv.sala_id} className="sal-panel vivo-pop" data-sal-invitacion
              style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", borderColor: "rgba(233,185,73,.55)", background: "linear-gradient(90deg, rgba(233,185,73,.16), rgba(248,249,250,.03))" }}>
              <Carita perfil={perfilDeTarjeta(inv.de)} tamano={54} titulo={`Mascota de ${inv.de?.apodo}`} />
              <div style={{ flex: "1 1 180px", minWidth: 0 }}>
                <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "15px", overflowWrap: "anywhere" }}>
                  {inv.de?.apodo} te {inv.duelo ? "retó a un duelo" : "invitó a su sala"}
                </p>
                <p className="sal-nota" style={{ fontSize: "12.5px" }}>{inv.tema_titulo} · {inv.total} {inv.total === 1 ? "pregunta" : "preguntas"} · {inv.jugadores} en la sala</p>
              </div>
              <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                <Boton tono="oro" onClick={() => aceptar(inv)} etiqueta="Entrar a la sala"><Play size={15} fill="currentColor" /> Entrar</Boton>
                <Boton tono="suave" onClick={async () => { await rechazar(inv.sala_id); mis.recargar(); }} etiqueta="Rechazar la invitación" style={{ width: "44px", padding: 0 }}><Equis size={16} /></Boton>
              </div>
            </div>
          ))}
        </section>
      )}

      {mis.actual && (
        <button type="button" onClick={volver} className="sal-panel" data-sal-volver
          style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderRadius: "22px",
            background: "linear-gradient(90deg, rgba(111,134,255,.22), rgba(248,249,250,.04))", border: "1px solid rgba(111,134,255,.45)" }}>
          <Gamepad2 size={24} color="#D6DCFF" aria-hidden="true" />
          <span style={{ flex: 1, minWidth: 0 }}>
            <b style={{ display: "block", fontFamily: "Sora, sans-serif", fontSize: "15px" }}>Vuelve a tu sala: {mis.actual.nombre}</b>
            <span className="sal-nota" style={{ fontSize: "12.5px" }}>{mis.actual.jugadores} en la sala · {mis.actual.estado === "lobby" ? "en el lobby" : "partida en curso"}</span>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      )}

      <Arena style={{ minHeight: 0 }}>
        <div style={{ position: "relative", display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "2px", minHeight: "170px" }}>
            {yo && <div className="sal-puesto sal-cae" style={{ width: "140px" }}><Escenario perfil={yo} tamano={128} animo="saluda" foco titulo="Tu mascota" /></div>}
            {[0, 1].map((k) => (
              <div key={k} className="sal-puesto sal-cae" style={{ width: "90px", animationDelay: `${200 + k * 140}ms` }}>
                <div className="sal-hueco" style={{ height: "120px" }}><span className="sal-silueta sal-latido" aria-hidden="true"><Users size={20} /></span></div>
              </div>
            ))}
          </div>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
            <span className="sal-cejilla">Juega con tus amigos</span>
            <h2 className="sal-h1" style={{ fontSize: "clamp(26px, 5vw, 36px)" }}>Arma tu sala y reta a tu equipo</h2>
            <p className="sal-nota" style={{ color: "rgba(248,249,250,.78)" }}>
              Entran con su mascota al lobby, tú eliges el tema y arrancas la partida. Todos responden a la vez, como en un juego.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Boton tono="oro" grande className="sal-brilla" onClick={onCrear} etiqueta="Crear una sala" data-sal-crear>
                <Gamepad2 size={18} /> Crear sala
              </Boton>
            </div>
          </div>
        </div>
      </Arena>

      <form className="sal-panel" onSubmit={conCodigo} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <label htmlFor="sal-codigo" style={{ flex: "1 1 200px", minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "15px" }}>¿Te pasaron un código?</span>
          <span className="sal-nota" style={{ fontSize: "12.5px" }}>Escríbelo y entras al lobby de tu amigo.</span>
        </label>
        <input id="sal-codigo" className="amg-input" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={7}
          value={codigo} onChange={(e) => setCodigo(limpiarCodigo(e.target.value))} data-sal-campo-codigo
          style={{ width: "150px", minHeight: "48px", borderRadius: "14px", border: "1px solid rgba(248,249,250,.2)", background: "rgba(6,12,22,.4)", color: FAE.text,
            fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "22px", letterSpacing: ".16em", textAlign: "center" }} />
        <Boton tono="si" grande type="submit" disabled={codigo.length !== 6 || entrando}>{entrando ? "Entrando…" : "Entrar"}</Boton>
      </form>
      {aviso && <p role="alert" className="sal-nota" style={{ color: "#FFB4A2" }}>{aviso}</p>}

      <Pasos />
    </div>
  );
}

/* ═══════════ CREAR UNA SALA (O UN DUELO) ═══════════ */

function Crear({ yo, duelo = null, onCreada, onCancelar }) {
  const [valor, setValor] = useState({ materia: "contabilidad", tema: null, cantidad: duelo ? 5 : 8, duracion: 30 });
  const [amigos, setAmigos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [elegidos, setElegidos] = useState(() => new Set(duelo ? [duelo] : []));
  const [nombre, setNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    amigosParaInvitar().then(({ data }) => { setAmigos(Array.isArray(data?.amigos) ? data.amigos : []); setCargando(false); });
  }, []);
  const rival = duelo ? amigos.find((a) => (a.user_id ? `u:${a.user_id}` : `d:${a.demo_id}`) === duelo) : null;
  const apodo = yo?.nickname ?? "";

  const crear = async () => {
    const p = paqueteDeActividad(valor);
    if (!p) return;
    setCreando(true); setError(null);
    const { invitar, demos } = separarElegidos(elegidos);
    const titulo = nombre.trim() || (rival ? `${apodo || "Tú"} vs ${rival.apodo}` : "");
    const { data, error: e } = await crearSala({ ...p, nombre: titulo, invitar, demos });
    setCreando(false);
    if (e) { setError(mensajeSala(e)); return; }
    onCreada(data);
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "16px" }} data-sal-crear-form>
      <header>
        <span className="sal-cejilla">{duelo ? "Duelo 1 vs 1" : "Nueva sala"}</span>
        <h2 className="sal-h1" style={{ fontSize: "clamp(24px, 5vw, 34px)", marginTop: "4px" }}>
          {duelo ? (rival ? `Reta a ${rival.apodo} a un duelo` : "Reta a tu amigo a un duelo") : "Arma tu sala de entrenamiento"}
        </h2>
      </header>

      {duelo && rival && (
        <Arena style={{ minHeight: 0, padding: "18px 12px 22px" }}>
          <div className="amg-duelo" style={{ position: "relative" }}>
            <div style={{ textAlign: "center" }}>
              {yo && <Escenario perfil={yo} tamano={104} animo="feliz" titulo="Tu mascota" />}
              <span className="sal-placa"><span>{apodo || "Tú"}</span></span>
            </div>
            <div style={{ alignSelf: "center", textAlign: "center", paddingBottom: "18px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(233,185,73,.5), rgba(233,185,73,.1))", border: "2px solid rgba(233,185,73,.7)", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "22px", color: "#FFE3A1" }}>
                VS
              </span>
            </div>
            <div className="amg-espejo" style={{ textAlign: "center" }}>
              <Escenario perfil={perfilDeTarjeta(rival)} tamano={104} animo="feliz" titulo={`Mascota de ${rival.apodo}`} />
              <span className="sal-placa"><span>{rival.apodo}</span></span>
            </div>
          </div>
        </Arena>
      )}

      <div className="sal-panel" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <ElegirActividad valor={valor} onCambio={setValor} />
      </div>

      {!duelo && (
        <div className="sal-panel" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Seccion titulo="Nombre de la sala" extra={<span className="sal-nota" style={{ fontSize: "12px" }}>opcional</span>}>
            <input className="amg-input" value={nombre} onChange={(e) => setNombre(e.target.value.slice(0, 60))} placeholder={`Sala de ${apodo || "entrenamiento"}`}
              style={{ minHeight: "48px", borderRadius: "14px", border: "1px solid rgba(248,249,250,.2)", background: "rgba(6,12,22,.4)", color: FAE.text, padding: "0 14px", fontSize: "15px", fontFamily: "inherit" }} />
          </Seccion>
          <Seccion titulo="Invita a tus amigos" extra={<span className="sal-nota" style={{ fontSize: "12px" }}>{elegidos.size ? `${elegidos.size} elegidos` : "o comparte el código después"}</span>}>
            <ElegirAmigos amigos={amigos} cargando={cargando} elegidos={elegidos} onCambio={setElegidos} />
          </Seccion>
        </div>
      )}

      {error && <p role="alert" className="sal-nota" style={{ color: "#FFB4A2" }}>{error}</p>}
      <div className="sal-barra">
        <Boton tono="oro" grande className="sal-principal" disabled={!valor.tema || creando} onClick={crear} etiqueta={duelo ? "Enviar el duelo" : "Crear la sala"} data-sal-confirmar>
          {duelo ? <Swords size={18} /> : <Play size={18} fill="currentColor" />} {creando ? "Abriendo el lobby…" : duelo ? "Enviar el reto y abrir el lobby" : "Crear sala y abrir el lobby"}
        </Boton>
        <Boton tono="suave" grande onClick={onCancelar} etiqueta="Cancelar"><Equis size={17} /> <span className="sal-txt">Cancelar</span></Boton>
      </div>
      <p className="sal-nota" style={{ fontSize: "12px", textAlign: "center", marginTop: "-6px" }}>
        {NOMBRE_MATERIA[valor.materia]} · las preguntas salen del Repaso de cada tema.
      </p>
    </section>
  );
}
