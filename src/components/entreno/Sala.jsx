import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Crown, Copy, Check, X as Equis, Play, UserPlus, LogOut, Clock, Repeat, BookOpen, Swords, Plus, Users } from "lucide-react";
import { FAE } from "../../theme.js";
import { Escenario, Carita, Boton, perfilDeTarjeta, tonoDe, PANEL } from "../social/amigos-comun.jsx";
import { Enunciado, Opciones, Reloj, miles } from "../vivo/piezas.jsx";
import {
  useSalaEntreno, useReloj, avanzar, responder, marcarListo, salir, invitar, entrar, cambiarActividad, amigosParaInvitar,
  faltaParaAbrir, restanteMs, faltaSiguiente, tabla, esDuelo, mensajeSala, MAX_JUGADORES, PAUSA_RESULTADOS_MS,
} from "../../entreno/datos.js";
import { NOMBRE_MATERIA, ElegirActividad, ElegirAmigos, paqueteDeActividad, claveAmigo, separarElegidos, Confeti } from "./piezas-sala.jsx";
import { ORO, VERDE } from "./estilo-salas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * UNA SALA DE ENTRENAMIENTO, de punta a punta: el lobby, la cuenta atrás, cada
 * pregunta, los resultados y el podio. La pantalla la decide el estado que
 * manda la base (0172); este componente solo pinta y pide.
 *
 * Avanza sola: al acabarse el tiempo (o al responder) se pide «resultados», y
 * a los 7 s «siguiente». La base decide si toca; pedir de más no hace daño.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function Sala({ salaId, inicial = null, onSalir }) {
  const { estado, hacer, refrescar, desfase, error } = useSalaEntreno(salaId, { inicial });
  const fase = estado?.estado;

  if (!estado) {
    return error
      ? <Cerrada titulo="No encontramos esa sala" texto={mensajeSala(error)} onSalir={onSalir} />
      : <p className="sal-nota">Entrando a la sala…</p>;
  }
  if (fase === "cerrada") return <Cerrada titulo="La sala se cerró" texto="Gracias por entrenar. Arma otra cuando quieras." onSalir={onSalir} />;
  if (fase === "lobby") return <Lobby estado={estado} hacer={hacer} refrescar={refrescar} onSalir={onSalir} />;
  if (fase === "final") return <Final estado={estado} hacer={hacer} onSalir={onSalir} />;
  return <Partida estado={estado} hacer={hacer} refrescar={refrescar} desfase={desfase} onSalir={onSalir} />;
}

function Cerrada({ titulo, texto, onSalir }) {
  return (
    <section className="sal-panel" style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "520px", margin: "24px auto", textAlign: "center", padding: "26px 22px" }} data-sal-fase="cerrada">
      <h2 className="sal-h1" style={{ fontSize: "24px" }}>{titulo}</h2>
      <p className="sal-nota">{texto}</p>
      <div><Boton tono="si" onClick={onSalir}>Volver a las salas</Boton></div>
    </section>
  );
}

/* ═══════════ EL LOBBY ═══════════ */

function Puesto({ j, orden }) {
  const perfil = perfilDeTarjeta(j);
  return (
    <div className="sal-puesto sal-cae" style={{ animationDelay: `${orden * 90}ms`, "--tono": tonoDe(perfil) }} data-sal-jugador={j.apodo}>
      {j.anfitrion && <span className="sal-corona" title="Creó la sala"><Crown size={22} color={ORO} fill={ORO} aria-label="Anfitrión" /></span>}
      {j.demo && <span className="sal-demo">demo</span>}
      <Escenario perfil={perfil} tamano={104} animo={j.listo ? "feliz" : "tranquila"} foco={j.soy_yo} titulo={`Mascota de ${j.apodo}`} />
      <span className="sal-placa" data-yo={j.soy_yo ? "" : undefined}><span>{j.apodo}</span></span>
      <span className={`sal-estado ${j.listo ? "sal-estado--listo" : "sal-estado--espera"}`}>
        {j.listo ? <><Check size={11} strokeWidth={3.2} aria-hidden="true" /> Listo</> : "Preparándose"}
      </span>
    </div>
  );
}

function Invitado({ t, orden }) {
  return (
    <div className="sal-puesto sal-cae" style={{ animationDelay: `${orden * 90}ms`, "--tono": tonoDe(perfilDeTarjeta(t)) }} data-sal-invitado={t.apodo}>
      <div className="sal-fantasma"><Escenario perfil={perfilDeTarjeta(t)} tamano={104} titulo={`Mascota de ${t.apodo}`} /></div>
      <span className="sal-placa" style={{ opacity: 0.75 }}><span>{t.apodo}</span></span>
      <span className="sal-estado sal-estado--espera sal-latido">Invitado…</span>
    </div>
  );
}

function Hueco({ onInvitar }) {
  const cuerpo = (
    <>
      <span className="sal-silueta" aria-hidden="true">{onInvitar ? <Plus size={24} /> : <Users size={20} />}</span>
      <span style={{ fontSize: "11.5px", fontWeight: 700, color: "rgba(248,249,250,.55)" }}>{onInvitar ? "Invitar" : "Libre"}</span>
    </>
  );
  return (
    <div className="sal-puesto">
      {onInvitar ? <button type="button" className="sal-hueco" onClick={onInvitar} aria-label="Invitar a un amigo">{cuerpo}</button> : <div className="sal-hueco">{cuerpo}</div>}
    </div>
  );
}

export function Arena({ children, style = null }) {
  return (
    <div className="sal-arena" style={style}>
      <span className="sal-foco sal-foco--i" aria-hidden="true" />
      <span className="sal-foco sal-foco--d" aria-hidden="true" />
      <span className="sal-piso" aria-hidden="true" />
      {children}
    </div>
  );
}

function Hoja({ titulo, onCerrar, children, pie }) {
  useEffect(() => {
    const t = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  }, [onCerrar]);
  return createPortal(
    <div className="amg-velo" onClick={onCerrar}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className="amg-ficha" onClick={(e) => e.stopPropagation()}
        style={{ ...PANEL, width: "640px", maxWidth: "100%", maxHeight: "88vh", display: "flex", flexDirection: "column", background: "#13233A" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 18px 10px" }}>
          <h2 className="sal-h1" style={{ fontSize: "19px", flex: 1 }}>{titulo}</h2>
          <Boton tono="suave" etiqueta="Cerrar" onClick={onCerrar} style={{ width: "44px", padding: 0 }}><Equis size={18} /></Boton>
        </div>
        <div style={{ overflowY: "auto", padding: "4px 18px 16px" }}>{children}</div>
        {pie && <div style={{ padding: "12px 18px 16px", borderTop: "1px solid rgba(248,249,250,.1)" }}>{pie}</div>}
      </div>
    </div>,
    document.body,
  );
}

function CodigoSala({ codigo }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    const enlace = `${location.origin}${location.pathname}#/salas/${codigo}`;
    try { await navigator.clipboard.writeText(enlace); setCopiado(true); setTimeout(() => setCopiado(false), 1800); } catch { /* sin portapapeles */ }
  };
  return (
    <div className="sal-codigo" data-sal-codigo={codigo}>
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <small style={{ fontSize: "10px", fontWeight: 800, letterSpacing: ".12em", color: "rgba(248,249,250,.55)", textTransform: "uppercase" }}>Código</small>
        <b>{codigo}</b>
      </span>
      <Boton tono={copiado ? "si" : "neutro"} etiqueta="Copiar el enlace de la sala" onClick={copiar}>
        {copiado ? <><Check size={15} /> Copiado</> : <><Copy size={15} /> Enlace</>}
      </Boton>
    </div>
  );
}

function Lobby({ estado, hacer, refrescar, onSalir }) {
  const [aviso, setAviso] = useState(null);
  const [hoja, setHoja] = useState(null); // "invitar" | "actividad"
  const [empezando, setEmpezando] = useState(false);
  const yo = estado.jugadores.find((j) => j.soy_yo);
  const host = estado.soy_anfitrion;
  const n = estado.jugadores.length;
  const duelo = esDuelo(estado);
  const libres = Math.max(0, Math.min(MAX_JUGADORES, duelo ? 2 : Math.max(4, n + estado.invitados.length + (host ? 1 : 0))) - n - estado.invitados.length);

  const empezar = async () => {
    setEmpezando(true); setAviso(null);
    const r = await hacer(avanzar(estado.sala_id, "empezar"));
    setEmpezando(false);
    if (r.error) setAviso(mensajeSala(r.error));
  };
  const listo = async () => {
    const r = await hacer(marcarListo(estado.sala_id, !yo?.listo));
    if (r.error) setAviso(mensajeSala(r.error));
  };
  const entrarYa = async () => {
    const r = await hacer(entrar(estado.sala_id));
    if (r.error) setAviso(mensajeSala(r.error));
  };
  const irse = async () => { await hacer(salir(estado.sala_id)); onSalir(); };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "16px" }} data-sal-fase="lobby">
      <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px 18px", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: "1 1 260px" }}>
          <span className="sal-cejilla">{duelo ? "Duelo 1 vs 1 · lobby" : "Sala de entrenamiento · lobby"}</span>
          <h1 className="sal-h1" style={{ fontSize: "clamp(24px, 5vw, 34px)", marginTop: "4px", overflowWrap: "anywhere" }}>{estado.nombre}</h1>
        </div>
        <CodigoSala codigo={estado.codigo} />
      </header>

      <Arena>
        <p style={{ position: "relative", margin: "0 0 14px", textAlign: "center", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "13px", letterSpacing: ".1em", textTransform: "uppercase", color: "#C9D2FF" }}>
          {n} {n === 1 ? "jugador" : "jugadores"} en la sala{estado.invitados.length ? ` · ${estado.invitados.length} en camino` : ""}
        </p>
        <div className="sal-puestos">
          {estado.jugadores.map((j, k) => <Puesto key={j.id} j={j} orden={k} />)}
          {estado.invitados.map((t, k) => <Invitado key={t.user_id} t={t} orden={n + k} />)}
          {Array.from({ length: libres }, (_, k) => <Hueco key={`h${k}`} onInvitar={host ? () => setHoja("invitar") : null} />)}
        </div>
      </Arena>

      <div className="sal-panel" style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }} data-sal-actividad>
        <span aria-hidden="true" style={{ flex: "none", width: "46px", height: "46px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(180deg, rgba(111,134,255,.35), rgba(111,134,255,.15))", border: "1px solid rgba(111,134,255,.45)" }}>
          <BookOpen size={22} color="#D6DCFF" />
        </span>
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <p className="sal-cejilla" style={{ margin: 0 }}>La actividad · {NOMBRE_MATERIA[estado.materia] ?? estado.materia}</p>
          <p style={{ margin: "2px 0 0", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "17px", color: FAE.text, overflowWrap: "anywhere" }}>{estado.tema_titulo}</p>
          <p className="sal-nota" style={{ fontSize: "13px" }}>{estado.total} preguntas · {estado.duracion_s} s cada una{estado.ronda > 1 ? ` · partida ${estado.ronda}` : ""}</p>
        </div>
        {host && <Boton tono="neutro" onClick={() => setHoja("actividad")} etiqueta="Cambiar la actividad"><Repeat size={15} /> Cambiar</Boton>}
      </div>

      {aviso && <p role="alert" className="sal-nota" style={{ color: "#FFB4A2" }}>{aviso}</p>}

      <div className="sal-barra">
        {!estado.dentro ? (
          <Boton tono="si" grande className="sal-principal" onClick={entrarYa} etiqueta="Entrar a la sala"><Play size={17} /> Entrar con mi mascota</Boton>
        ) : host ? (
          <>
            <Boton tono="oro" grande className={`sal-principal ${n >= 2 ? "sal-brilla" : ""}`} disabled={n < 2 || empezando} onClick={empezar} etiqueta="Empezar la partida" data-sal-empezar>
              <Play size={18} fill="currentColor" /> {empezando ? "Empezando…" : n < 2 ? "Esperando jugadores…" : "¡Empezar partida!"}
            </Boton>
            {!duelo && <Boton tono="neutro" grande onClick={() => setHoja("invitar")} etiqueta="Invitar amigos"><UserPlus size={17} /> <span className="sal-txt">Invitar</span></Boton>}
          </>
        ) : (
          <Boton tono={yo?.listo ? "neutro" : "si"} grande className="sal-principal" onClick={listo} etiqueta={yo?.listo ? "Ya no estoy listo" : "Estoy listo"} data-sal-listo>
            {yo?.listo ? <><Check size={17} /> ¡Listo! Esperando al anfitrión</> : <><Check size={17} /> Estoy listo</>}
          </Boton>
        )}
        <Boton tono="suave" grande onClick={irse} etiqueta="Salir de la sala"><LogOut size={16} /> <span className="sal-txt">Salir</span></Boton>
      </div>

      {hoja === "invitar" && <HojaInvitar estado={estado} hacer={hacer} onCerrar={() => { setHoja(null); refrescar(); }} />}
      {hoja === "actividad" && <HojaActividad estado={estado} hacer={hacer} onCerrar={() => setHoja(null)} />}
    </section>
  );
}

function HojaInvitar({ estado, hacer, onCerrar }) {
  const [amigos, setAmigos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [elegidos, setElegidos] = useState(new Set());
  const [enviando, setEnviando] = useState(false);
  useEffect(() => {
    amigosParaInvitar().then(({ data }) => { setAmigos(Array.isArray(data?.amigos) ? data.amigos : []); setCargando(false); });
  }, []);
  const ocupados = useMemo(() => {
    const s = new Set(estado.invitados.map((t) => `u:${t.user_id}`));
    for (const a of amigos) if (estado.jugadores.some((j) => j.apodo === a.apodo)) s.add(claveAmigo(a));
    return s;
  }, [amigos, estado]);
  const max = MAX_JUGADORES - estado.jugadores.length - estado.invitados.length;
  const enviar = async () => {
    setEnviando(true);
    const { invitar: ids, demos } = separarElegidos(elegidos);
    await hacer(invitar(estado.sala_id, ids, demos));
    setEnviando(false);
    onCerrar();
  };
  return (
    <Hoja titulo="Invitar a la sala" onCerrar={onCerrar}
      pie={<Boton tono="si" grande ancho disabled={!elegidos.size || enviando} onClick={enviar}><UserPlus size={17} /> {enviando ? "Invitando…" : elegidos.size ? `Invitar a ${elegidos.size}` : "Elige a quién invitar"}</Boton>}>
      <p className="sal-nota" style={{ marginBottom: "12px" }}>Les llega la invitación en Amigos y en el inicio. También pueden entrar con el código {estado.codigo}.</p>
      <ElegirAmigos amigos={amigos} cargando={cargando} elegidos={elegidos} onCambio={setElegidos} ocupados={ocupados} max={max} />
    </Hoja>
  );
}

function HojaActividad({ estado, hacer, onCerrar, titulo = "Cambiar la actividad", alListo = null }) {
  const [valor, setValor] = useState({ materia: estado.materia, tema: estado.tema, cantidad: Math.min(10, estado.total) || 8, duracion: estado.duracion_s });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const guardar = async () => {
    const p = paqueteDeActividad(valor);
    if (!p) return;
    setGuardando(true); setError(null);
    const r = await hacer(cambiarActividad(estado.sala_id, p));
    setGuardando(false);
    if (r.error) { setError(mensajeSala(r.error)); return; }
    alListo?.();
    onCerrar();
  };
  return (
    <Hoja titulo={titulo} onCerrar={onCerrar}
      pie={<>
        {error && <p role="alert" className="sal-nota" style={{ color: "#FFB4A2", marginBottom: "8px" }}>{error}</p>}
        <Boton tono="si" grande ancho disabled={!valor.tema || guardando} onClick={guardar}>{guardando ? "Guardando…" : "Listo, volver al lobby"}</Boton>
      </>}>
      <ElegirActividad valor={valor} onCambio={setValor} />
    </Hoja>
  );
}

/* ═══════════ LA PARTIDA ═══════════ */

function TiraJugadores({ jugadores, modo }) {
  return (
    <div className="sal-tira" aria-label="Jugadores">
      {jugadores.map((j) => {
        const marca = modo === "pregunta" ? (j.respondio ? "si" : "no") : null;
        const acerto = modo === "resultados" ? j.acerto : null;
        return (
          <div key={j.id} className="sal-ficha-j" data-respondio={marca ?? undefined} title={j.apodo}>
            <Carita perfil={perfilDeTarjeta(j)} tamano={46} titulo={`Mascota de ${j.apodo}`} />
            {marca === "si" && <span className="sal-ok" style={{ background: VERDE }} aria-label="Ya respondió"><Check size={11} strokeWidth={3.4} color="#06202A" /></span>}
            {acerto === true && <span className="sal-ok" style={{ background: VERDE }} aria-label="Acertó"><Check size={11} strokeWidth={3.4} color="#06202A" /></span>}
            {acerto === false && <span className="sal-ok" style={{ background: FAE.coral }} aria-label="Falló"><Equis size={11} strokeWidth={3.4} color="#0B1626" /></span>}
            <small>{j.soy_yo ? "Tú" : j.apodo}</small>
          </div>
        );
      })}
    </div>
  );
}

function CuentaAtras({ falta, estado }) {
  const s = Math.ceil(falta / 1000);
  return createPortal(
    <div className="sal-velo" data-sal-cuenta-atras role="status" aria-live="assertive">
      <span className="sal-cejilla" style={{ fontSize: "13px" }}>{NOMBRE_MATERIA[estado.materia] ?? ""} · {estado.tema_titulo}</span>
      <span key={s} className="sal-numero">{s > 0 ? s : "¡YA!"}</span>
      <p className="sal-h1" style={{ fontSize: "20px" }}>{estado.indice === 0 ? "¡La partida empieza!" : `Pregunta ${estado.indice + 1}`}</p>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", maxWidth: "420px" }}>
        {estado.jugadores.map((j) => <Carita key={j.id} perfil={perfilDeTarjeta(j)} tamano={44} titulo={j.apodo} />)}
      </div>
    </div>,
    document.body,
  );
}

function Partida({ estado, hacer, refrescar, desfase, onSalir }) {
  const fase = estado.estado;
  const ahora = useReloj(true, 200);
  const falta = faltaParaAbrir(estado, desfase.current, ahora);
  const restante = restanteMs(estado, desfase.current, ahora);
  const faltaSig = faltaSiguiente(estado, desfase.current, ahora);
  const [elegida, setElegida] = useState(null);
  const [aviso, setAviso] = useState(null);
  const pedido = useRef(0);

  useEffect(() => { setElegida(estado.mi_respuesta?.opcion ?? null); setAviso(null); }, [estado.indice, estado.ronda]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Cuando falta poco para abrir, se vuelve a pedir el estado: así llega el enunciado justo a tiempo. */
  useEffect(() => {
    if (fase === "pregunta" && falta > 0) {
      const t = setTimeout(refrescar, falta + 60);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [fase, falta > 0, estado.indice, refrescar]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Avanzar solo: «resultados» al acabarse el tiempo, «siguiente» a los 7 s. Como mucho una vez por segundo. */
  useEffect(() => {
    const t = Date.now();
    if (t - pedido.current < 1100) return;
    if (fase === "pregunta" && falta <= 0 && restante <= 0) { pedido.current = t; hacer(avanzar(estado.sala_id, "resultados")); }
    else if (fase === "resultados" && faltaSig <= 0) { pedido.current = t; hacer(avanzar(estado.sala_id, "siguiente")); }
  }, [ahora]); // eslint-disable-line react-hooks/exhaustive-deps

  const elegir = async (opcion) => {
    if (elegida || fase !== "pregunta") return;
    setElegida(opcion);
    const { data, error } = await responder(estado.sala_id, estado.indice, opcion);
    if (error) { setElegida(null); setAviso(mensajeSala(error)); return; }
    if (!data?.aceptada) {
      if (data?.motivo !== "repetida") setElegida(null);
      if (data?.motivo === "tiempo" || data?.motivo === "cerrada") setAviso("Se acabó el tiempo de esta pregunta.");
    }
    /* Si fui el último en responder, esto cierra la pregunta para todos. */
    await hacer(avanzar(estado.sala_id, "resultados"));
  };

  const yo = estado.jugadores.find((j) => j.soy_yo);
  const cabecera = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
      <span className="sal-cejilla">Pregunta {estado.indice + 1} de {estado.total}</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "999px", background: "rgba(233,185,73,.14)", border: "1px solid rgba(233,185,73,.4)",
        fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "13px", color: "#FFE3A1", fontVariantNumeric: "tabular-nums" }} data-sal-mis-puntos>
        {miles(yo?.puntos ?? 0)} pts
      </span>
    </div>
  );

  if (fase === "pregunta") {
    if (falta > 0 || !estado.pregunta) return <CuentaAtras falta={falta} estado={estado} />;
    const faltan = estado.jugadores.filter((j) => !j.respondio && !j.demo).length - (elegida && !yo?.respondio ? 1 : 0);
    return (
      <section key={`p${estado.ronda}-${estado.indice}`} style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "760px", width: "100%", margin: "0 auto" }} data-sal-fase="pregunta">
        {cabecera}
        <TiraJugadores jugadores={estado.jugadores} modo="pregunta" />
        <Reloj restante={restante} duracion={estado.duracion_s} />
        <div className="vivo-entra"><Enunciado pregunta={estado.pregunta} /></div>
        {elegida ? (
          <div className="vivo-tarjeta vivo-pop" style={{ display: "flex", alignItems: "center", gap: "14px" }} data-sal-enviada>
            <span style={{ flex: "none", width: "46px", height: "46px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(111,134,255,.2)", border: "2px solid #8EA0FF" }}>
              <Check size={22} color="#D6DCFF" />
            </span>
            <div>
              <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "18px" }}>Respuesta enviada</p>
              <p className="vivo-nota">{faltan > 0 ? `Esperando a ${faltan} ${faltan === 1 ? "jugador" : "jugadores"}…` : "Ya casi: cerrando la pregunta…"}</p>
            </div>
          </div>
        ) : restante <= 0 ? (
          <div className="vivo-tarjeta vivo-pop" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Clock size={24} color={FAE.ambar} aria-hidden="true" />
            <p className="vivo-nota" style={{ color: FAE.text }}>Se acabó el tiempo de esta pregunta.</p>
          </div>
        ) : (
          <Opciones pregunta={estado.pregunta} alElegir={elegir} elegida={elegida} />
        )}
        {aviso && <p className="vivo-nota" role="alert" style={{ color: FAE.ambar }}>{aviso}</p>}
      </section>
    );
  }

  /* resultados */
  const mia = estado.mi_respuesta;
  const acerto = mia?.correcta === true;
  const lista = tabla(estado.jugadores);
  const parte = Math.max(0, Math.min(1, faltaSig / PAUSA_RESULTADOS_MS));
  const ultima = estado.indice + 1 >= estado.total;
  return (
    <section key={`r${estado.ronda}-${estado.indice}`} style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "760px", width: "100%", margin: "0 auto" }} data-sal-fase="resultados">
      {cabecera}
      <div className="vivo-tarjeta vivo-pop" style={{ display: "flex", alignItems: "center", gap: "14px",
        borderColor: !mia ? "rgba(248,249,250,.12)" : acerto ? FAE.teal : "rgba(231,111,81,0.55)", background: !mia ? undefined : acerto ? "rgba(42,157,143,0.14)" : "rgba(231,111,81,0.10)" }}
        data-sal-veredicto={!mia ? "sin" : acerto ? "bien" : "mal"}>
        <span style={{ flex: "none", width: "48px", height: "48px", borderRadius: "999px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: !mia ? "#1A2D49" : acerto ? FAE.teal : FAE.coral }}>
          {!mia ? <Clock size={24} color={FAE.text} aria-hidden="true" /> : acerto ? <Check size={26} color="#06202A" aria-hidden="true" /> : <Equis size={26} color="#0B1626" aria-hidden="true" />}
        </span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "21px" }}>
            {!mia ? "No alcanzaste a responder" : acerto ? `¡Correcto! +${miles(mia.puntos)}` : "Esta vez no"}
          </p>
          <p className="vivo-nota">Vas de {lista.find((j) => j.soy_yo)?.puesto ?? "–"}.º de {lista.length}</p>
        </div>
      </div>
      <Opciones pregunta={estado.pregunta} elegida={mia?.opcion ?? null} correcta={estado.correcta} />
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }} data-sal-tabla>
        {lista.slice(0, 5).map((j) => <FilaTabla key={j.id} j={j} />)}
        {lista.findIndex((j) => j.soy_yo) >= 5 && <FilaTabla j={lista.find((j) => j.soy_yo)} />}
      </div>
      <div className="sal-panel" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", padding: "12px 16px" }}>
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <p className="sal-nota" style={{ fontSize: "13px", marginBottom: "6px" }}>{ultima ? "Ahora viene el podio…" : "Siguiente pregunta en un momento…"}</p>
          <div className="sal-cuenta" aria-hidden="true"><span style={{ transform: `scaleX(${parte})` }} /></div>
        </div>
        {estado.soy_anfitrion && (
          <Boton tono="si" onClick={() => hacer(avanzar(estado.sala_id, "siguiente"))} etiqueta={ultima ? "Ver el podio" : "Siguiente pregunta"}>
            {ultima ? "Ver el podio" : "Siguiente"}
          </Boton>
        )}
      </div>
      <div style={{ textAlign: "center" }}>
        <button type="button" onClick={async () => { await hacer(salir(estado.sala_id)); onSalir(); }}
          style={{ all: "unset", cursor: "pointer", fontSize: "13px", color: "rgba(248,249,250,.55)", textDecoration: "underline", padding: "10px" }}>
          Salir de la partida
        </button>
      </div>
    </section>
  );
}

function FilaTabla({ j }) {
  return (
    <div className="sal-fila-t vivo-entra" data-yo={j.soy_yo ? "" : undefined}>
      <span className="sal-pos">{j.puesto}</span>
      <Carita perfil={perfilDeTarjeta(j)} tamano={34} titulo={j.apodo} />
      <span className="sal-nom">{j.soy_yo ? `${j.apodo} (tú)` : j.apodo}</span>
      {j.acerto === true && <Check size={16} color={VERDE} strokeWidth={3} aria-label="acertó" />}
      {j.acerto === false && <Equis size={16} color={FAE.coral} strokeWidth={3} aria-label="falló" />}
      <span className="sal-pts">{miles(j.puntos)}</span>
    </div>
  );
}

/* ═══════════ EL PODIO ═══════════ */

const MEDALLA = [
  { fondo: "linear-gradient(180deg, #FFE08A, #E9B949)", alto: 150 },
  { fondo: "linear-gradient(180deg, #E8EDF3, #B9C4D2)", alto: 112 },
  { fondo: "linear-gradient(180deg, #F0BE92, #C98A5A)", alto: 84 },
];

function Final({ estado, hacer, onSalir }) {
  const lista = tabla(estado.jugadores);
  const [hoja, setHoja] = useState(false);
  const yo = lista.find((j) => j.soy_yo);
  const orden = [lista[1], lista[0], lista[2]];
  const medalla = (j) => (j ? Math.min(2, j.puesto - 1) : 2);
  const gane = yo?.puesto === 1;
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "18px" }} data-sal-fase="final">
      <Confeti />
      <header style={{ textAlign: "center", position: "relative", zIndex: 4 }}>
        <span className="sal-cejilla">{estado.tema_titulo}</span>
        <h1 className="sal-h1" style={{ fontSize: "clamp(28px, 6vw, 42px)", marginTop: "4px" }}>{gane ? "¡Ganaste la partida!" : "¡Terminó la partida!"}</h1>
        {yo && <p className="sal-nota" style={{ marginTop: "6px" }} data-sal-mi-puesto>Quedaste de <b style={{ color: FAE.text }}>{yo.puesto}.º</b> con {miles(yo.puntos)} puntos · {yo.aciertos} de {estado.total} aciertos</p>}
      </header>
      <Arena style={{ minHeight: 0, paddingBottom: "0" }}>
        <div className="sal-podio" data-sal-podio>
          {orden.map((j, k) => j ? (
            <div key={j.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
              <div className="sal-cae" style={{ animationDelay: `${[400, 900, 150][k]}ms`, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", "--tono": tonoDe(perfilDeTarjeta(j)) }}>
                {j.puesto === 1 && <Crown size={30} color={ORO} fill={ORO} aria-hidden="true" style={{ marginBottom: "-6px", filter: "drop-shadow(0 2px 8px rgba(233,185,73,.9))" }} />}
                <Escenario perfil={perfilDeTarjeta(j)} tamano={118} animo={j.puesto === 1 ? "celebra" : "feliz"} foco={j.puesto === 1} titulo={`Mascota de ${j.apodo}`} />
                <span className="sal-placa" style={{ marginBottom: "8px" }} data-yo={j.soy_yo ? "" : undefined}><span>{j.apodo}</span></span>
              </div>
              <div className="sal-bloque sal-sube" style={{ width: "100%", height: `${MEDALLA[medalla(j)].alto}px`, background: MEDALLA[medalla(j)].fondo, animationDelay: `${[300, 700, 0][k]}ms` }}>
                <b>{j.puesto}</b>
                <small>{miles(j.puntos)} pts</small>
              </div>
            </div>
          ) : <div key={`v${k}`} />)}
        </div>
      </Arena>
      {lista.length > 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "560px", width: "100%", margin: "0 auto" }}>
          {lista.slice(3).map((j) => <FilaTabla key={j.id} j={{ ...j, acerto: null }} />)}
        </div>
      )}
      <div className="sal-barra" style={{ justifyContent: "center" }}>
        {estado.soy_anfitrion ? (
          <Boton tono="oro" grande className="sal-principal sal-brilla" onClick={() => setHoja(true)} etiqueta="Jugar otra partida" data-sal-otra>
            <Swords size={17} /> Otra partida con el mismo grupo
          </Boton>
        ) : (
          <p className="sal-nota" style={{ flex: "1 1 220px", textAlign: "center" }}>Quédate: si el anfitrión arma otra partida, vuelves al lobby solo.</p>
        )}
        <Boton tono="suave" grande onClick={async () => { await hacer(salir(estado.sala_id)); onSalir(); }} etiqueta="Salir de la sala"><LogOut size={16} /> <span className="sal-txt">Salir</span></Boton>
      </div>
      {hoja && <HojaActividad estado={estado} hacer={hacer} titulo="¿Qué juegan ahora?" onCerrar={() => setHoja(false)} />}
    </section>
  );
}
