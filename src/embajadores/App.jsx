import { useEffect, useMemo, useState } from "react";
import {
  House, Plus, ListChecks, Clock, Users, CircleCheck, CircleAlert, Pencil, Undo2, Download, LogOut,
  School, Megaphone, Camera, Sparkles, Footprints, Phone, Database, Search, X, Check, ChevronRight,
  Inbox, RotateCcw, Hourglass, Minus, Send, FileSpreadsheet, MessageSquareText, CheckCheck, ArrowRight,
} from "lucide-react";
import {
  MES, HOY, MESES_LARGOS, GRUPOS, ACTIVIDADES, AREAS, JEFAS, EMBAJADORES, TURNOS_INICIALES,
  HORAS_INICIO, HORAS_FIN, actividad, grupo, grupoDe, area, jefa, embajador,
  aMin, horasDeclaradas, horasQueCuentan, formatoHoras, formatoCorto, fechaLegible, resumen, hora12,
} from "./datos.js";

/*
 * Prototipo navegable de la plataforma de horas de embajadores.
 * Es una sola página con dos vistas (embajador y jefa) y datos de ejemplo
 * guardados en el navegador. No hay servidor ni Google real todavía: el botón
 * «Continuar con Google» simula la entrada.
 */

const ICONOS = { School, Megaphone, Camera, Sparkles, Footprints, Phone, Database, Search };
const ICONO_GRUPO = (id) => ICONOS[grupo(id)?.icono] || Sparkles;

const CLAVE = "eh7k-prototipo-v1";
const leer = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE)); } catch { return null; }
};
const guardar = (estado) => {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* sin almacenamiento: la demo sigue en memoria */ }
};

const ESTADOS = {
  pendiente: { nombre: "En revisión", icono: Hourglass },
  aprobado: { nombre: "Aprobado", icono: CircleCheck },
  ajustado: { nombre: "Ajustado", icono: Pencil },
  devuelto: { nombre: "Devuelto", icono: Undo2 },
};

/* ════════════════ Piezas pequeñas ════════════════ */

function Avatar({ persona, tam = 36, anillo = false }) {
  const iniciales = persona.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <span
      className={`eh-avatar${anillo ? " eh-avatar--anillo" : ""}`}
      style={{ "--c": persona.color, width: tam, height: tam, fontSize: tam * 0.38 }}
      aria-hidden="true"
    >
      {iniciales}
    </span>
  );
}

function Estado({ estado }) {
  const e = ESTADOS[estado];
  const Icono = e.icono;
  return (
    <span className={`eh-estado eh-estado--${estado}`}>
      <Icono size={13} strokeWidth={2.4} aria-hidden="true" />
      {e.nombre}
    </span>
  );
}

function Anillo({ aprobadas, pendientes, meta }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const pa = Math.min(aprobadas / meta, 1);
  const pp = Math.min((aprobadas + pendientes) / meta, 1);
  return (
    <div className="eh-anillo">
      <svg viewBox="0 0 128 128" role="img" aria-label={`${formatoCorto(aprobadas)} de ${meta} horas aprobadas`}>
        <defs>
          <pattern id="eh-rayas" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="var(--oro-suave)" />
            <rect width="3" height="6" fill="var(--oro)" />
          </pattern>
        </defs>
        <circle cx="64" cy="64" r={R} className="eh-anillo__pista" />
        <circle cx="64" cy="64" r={R} className="eh-anillo__pend" stroke="url(#eh-rayas)"
          strokeDasharray={`${pp * C} ${C}`} />
        <circle cx="64" cy="64" r={R} className="eh-anillo__aprob"
          strokeDasharray={`${pa * C} ${C}`} />
      </svg>
      <div className="eh-anillo__centro">
        <strong>{formatoCorto(aprobadas)}</strong>
        <span>de {meta} h</span>
      </div>
    </div>
  );
}

function Calendario({ turnos, alElegir, elegido }) {
  const { anio, mes } = MES;
  const primero = new Date(anio, mes, 1);
  const dias = new Date(anio, mes + 1, 0).getDate();
  const desfase = (primero.getDay() + 6) % 7; // lunes primero
  const porDia = {};
  for (const x of turnos) {
    const d = Number(x.fecha.slice(8));
    porDia[d] ??= { h: 0, pend: false };
    if (x.estado !== "devuelto") porDia[d].h += horasQueCuentan(x);
    if (x.estado === "pendiente" || x.estado === "devuelto") porDia[d].pend = true;
  }
  const hoy = Number(HOY.slice(8));
  const celdas = [];
  for (let i = 0; i < desfase; i++) celdas.push(<span key={`v${i}`} />);
  for (let d = 1; d <= dias; d++) {
    const info = porDia[d];
    const nivel = !info ? 0 : info.h >= 4 ? 3 : info.h >= 2.5 ? 2 : 1;
    const fecha = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    celdas.push(
      <button
        key={d}
        type="button"
        className={`eh-cal__dia eh-cal__dia--n${nivel}${d === hoy ? " es-hoy" : ""}${elegido === fecha ? " es-elegido" : ""}${d > hoy ? " es-futuro" : ""}`}
        onClick={() => info && alElegir(elegido === fecha ? null : fecha)}
        aria-label={`${d} de ${MESES_LARGOS[mes]}${info ? `, ${formatoHoras(info.h)}` : ", sin turnos"}`}
        disabled={!info}
      >
        {d}
        {info?.pend && <i className="eh-cal__punto" />}
      </button>,
    );
  }
  return (
    <div className="eh-cal">
      <div className="eh-cal__sem">{["L", "M", "M", "J", "V", "S", "D"].map((x, i) => <span key={i}>{x}</span>)}</div>
      <div className="eh-cal__rejilla">{celdas}</div>
      <div className="eh-cal__leyenda">
        <span>Menos</span>
        {[1, 2, 3].map((n) => <i key={n} className={`eh-cal__muestra eh-cal__dia--n${n}`} />)}
        <span>Más</span>
        <span className="eh-cal__sep" />
        <i className="eh-cal__punto eh-cal__punto--ley" /> <span>Por revisar</span>
      </div>
    </div>
  );
}

function Semanas({ turnos }) {
  const semanas = [
    { n: "1–9", d: 1, h: 9 }, { n: "10–16", d: 10, h: 16 }, { n: "17–23", d: 17, h: 23 }, { n: "24–30", d: 24, h: 30 },
  ].map((s) => {
    const dentro = turnos.filter((x) => { const d = Number(x.fecha.slice(8)); return d >= s.d && d <= s.h && x.estado !== "devuelto"; });
    return {
      ...s,
      aprob: dentro.filter((x) => x.estado !== "pendiente").reduce((a, x) => a + horasQueCuentan(x), 0),
      pend: dentro.filter((x) => x.estado === "pendiente").reduce((a, x) => a + horasQueCuentan(x), 0),
    };
  });
  const max = Math.max(12, ...semanas.map((s) => s.aprob + s.pend));
  return (
    <div className="eh-barras" role="img" aria-label="Horas por semana">
      {semanas.map((s) => (
        <div key={s.n} className="eh-barras__col">
          <span className="eh-barras__valor">{formatoCorto(s.aprob + s.pend)}</span>
          <div className="eh-barras__pista">
            <div className="eh-barras__pend" style={{ height: `${((s.aprob + s.pend) / max) * 100}%` }} />
            <div className="eh-barras__aprob" style={{ height: `${(s.aprob / max) * 100}%` }} />
          </div>
          <span className="eh-barras__nombre">{s.n}</span>
        </div>
      ))}
    </div>
  );
}

function TarjetaTurno({ turno, alCorregir, compacta = false }) {
  const act = actividad(turno.actividad);
  const g = grupoDe(turno.actividad);
  const Icono = ICONO_GRUPO(g.id);
  const declaradas = horasDeclaradas(turno);
  return (
    <article className={`eh-turno eh-turno--${turno.estado}`} style={{ "--g": g.color }}>
      <div className="eh-turno__icono"><Icono size={18} strokeWidth={2.2} aria-hidden="true" /></div>
      <div className="eh-turno__cuerpo">
        <div className="eh-turno__fila">
          <span className="eh-turno__fecha">{fechaLegible(turno.fecha)} · {hora12(turno.inicio)} – {hora12(turno.fin)}</span>
          <Estado estado={turno.estado} />
        </div>
        <h4 className="eh-turno__titulo">{act.nombre}</h4>
        {!compacta && <p className="eh-turno__desc">{turno.descripcion}</p>}
        <div className="eh-turno__pie">
          <span className="eh-turno__horas">
            {turno.estado === "ajustado" ? (
              <><s>{formatoHoras(declaradas)}</s> <ArrowRight size={12} aria-hidden="true" /> <b>{formatoHoras(turno.horasAjustadas)}</b></>
            ) : <b>{formatoHoras(declaradas)}</b>}
          </span>
          {turno.companeros.length > 0 && (
            <span className="eh-turno__con" title={turno.companeros.map((id) => embajador(id).nombre).join(", ")}>
              <span className="eh-pila">{turno.companeros.map((id) => <Avatar key={id} persona={embajador(id)} tam={22} />)}</span>
              con {turno.companeros.map((id) => embajador(id).corto).join(", ")}
            </span>
          )}
        </div>
        {turno.nota && (
          <div className="eh-turno__nota">
            <Avatar persona={jefa(turno.jefaId)} tam={22} />
            <p><b>{jefa(turno.jefaId).corto}:</b> {turno.nota}</p>
          </div>
        )}
        {turno.estado === "devuelto" && alCorregir && (
          <button type="button" className="eh-btn eh-btn--oro eh-btn--peq" onClick={() => alCorregir(turno)}>
            <Pencil size={15} aria-hidden="true" /> Corregir y reenviar
          </button>
        )}
      </div>
    </article>
  );
}

/* ════════════════ Entrada ════════════════ */

function Entrada({ alEntrar }) {
  const [rol, setRol] = useState("embajador");
  const [cargando, setCargando] = useState(false);
  const entrar = () => {
    setCargando(true);
    setTimeout(() => alEntrar(rol), 650);
  };
  return (
    <main className="eh-entrada">
      <div className="eh-entrada__fondo" aria-hidden="true">
        <span className="eh-entrada__circulo eh-entrada__circulo--1" />
        <span className="eh-entrada__circulo eh-entrada__circulo--2" />
        <span className="eh-entrada__reloj"><Clock size={220} strokeWidth={0.7} /></span>
      </div>
      <section className="eh-entrada__tarjeta">
        <span className="eh-sello">Prototipo · datos de ejemplo</span>
        <h1 className="eh-entrada__titulo">Tus horas de<br /><em>embajador</em>, claras.</h1>
        <p className="eh-entrada__texto">
          Registra cada turno en segundos, mira cuánto llevas en el mes y entérate de cuándo te lo aprueban.
        </p>
        <div className="eh-segmento" role="radiogroup" aria-label="Entrar como">
          {[["embajador", "Soy embajador"], ["jefa", "Soy coordinadora"]].map(([v, t]) => (
            <button key={v} type="button" role="radio" aria-checked={rol === v}
              className={rol === v ? "es-activo" : ""} onClick={() => setRol(v)}>{t}</button>
          ))}
        </div>
        <button type="button" className="eh-google" onClick={entrar} disabled={cargando}>
          <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          {cargando ? "Entrando…" : "Continuar con Google"}
        </button>
        <p className="eh-entrada__nota">
          En esta demo el botón no pide tu cuenta: entra con un usuario de ejemplo.
        </p>
      </section>
    </main>
  );
}

/* ════════════════ Embajador: inicio ════════════════ */

function InicioEmbajador({ yo, turnos, irARegistrar, irATurnos, alCorregir }) {
  const mios = turnos.filter((x) => x.embajadorId === yo.id);
  const r = resumen(turnos, yo.id);
  const [dia, setDia] = useState(null);
  const faltan = Math.max(0, yo.asignadas - r.aprobadas - r.pendientes);
  const devueltos = mios.filter((x) => x.estado === "devuelto");
  const delDia = dia ? mios.filter((x) => x.fecha === dia) : [];
  const recientes = [...mios].sort((a, b) => (b.fecha + b.inicio).localeCompare(a.fecha + a.inicio)).slice(0, 3);

  return (
    <div className="eh-pagina">
      <header className="eh-saludo">
        <p className="eh-saludo__mes">{MESES_LARGOS[MES.mes]} {MES.anio}</p>
        <h2>Hola, {yo.corto}</h2>
      </header>

      {devueltos.length > 0 && (
        <button type="button" className="eh-aviso" onClick={() => alCorregir(devueltos[0])}>
          <CircleAlert size={20} aria-hidden="true" />
          <span><b>{devueltos.length === 1 ? "Te devolvieron un turno." : `Te devolvieron ${devueltos.length} turnos.`}</b> {jefa(devueltos[0].jefaId).corto} pide un detalle antes de aprobarlo.</span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      )}

      <section className="eh-heroe">
        <Anillo aprobadas={r.aprobadas} pendientes={r.pendientes} meta={yo.asignadas} />
        <div className="eh-heroe__datos">
          <div className="eh-dato eh-dato--aprob"><span>Aprobadas</span><strong>{formatoHoras(r.aprobadas)}</strong></div>
          <div className="eh-dato eh-dato--pend"><span>En revisión</span><strong>{formatoHoras(r.pendientes)}</strong></div>
          <div className="eh-dato"><span>Te faltan</span><strong>{formatoHoras(faltan)}</strong></div>
        </div>
        <p className="eh-heroe__pie">
          Si te aprueban lo que está en revisión, llegas a <b>{formatoCorto(r.aprobadas + r.pendientes)} de {yo.asignadas} h</b>. Quedan 6 días del mes.
        </p>
      </section>

      <div className="eh-dos">
        <section className="eh-panel">
          <div className="eh-panel__cab"><h3>Tu mes, día por día</h3></div>
          <Calendario turnos={mios} alElegir={setDia} elegido={dia} />
          {dia && (
            <div className="eh-dia">
              <p className="eh-dia__titulo">{fechaLegible(dia)}</p>
              {delDia.map((x) => <TarjetaTurno key={x.id} turno={x} compacta />)}
            </div>
          )}
        </section>
        <section className="eh-panel">
          <div className="eh-panel__cab"><h3>Horas por semana</h3></div>
          <Semanas turnos={mios} />
          <div className="eh-leyenda">
            <span><i className="eh-leyenda__aprob" /> Aprobadas</span>
            <span><i className="eh-leyenda__pend" /> En revisión</span>
          </div>
        </section>
      </div>

      <section className="eh-panel">
        <div className="eh-panel__cab">
          <h3>Últimos turnos</h3>
          <button type="button" className="eh-enlace" onClick={irATurnos}>Ver todos <ChevronRight size={16} aria-hidden="true" /></button>
        </div>
        <div className="eh-lista">
          {recientes.map((x) => <TarjetaTurno key={x.id} turno={x} alCorregir={alCorregir} />)}
        </div>
      </section>

      <button type="button" className="eh-btn eh-btn--grande eh-solo-escritorio" onClick={irARegistrar}>
        <Plus size={20} aria-hidden="true" /> Registrar un turno
      </button>
    </div>
  );
}

/* ════════════════ Embajador: mis turnos ════════════════ */

function MisTurnos({ yo, turnos, alCorregir }) {
  const [filtro, setFiltro] = useState("todos");
  const mios = turnos.filter((x) => x.embajadorId === yo.id)
    .sort((a, b) => (b.fecha + b.inicio).localeCompare(a.fecha + a.inicio));
  const cuenta = (e) => mios.filter((x) => (e === "aprobado" ? ["aprobado", "ajustado"].includes(x.estado) : x.estado === e)).length;
  const filtros = [
    ["todos", "Todos", mios.length],
    ["pendiente", "En revisión", cuenta("pendiente")],
    ["aprobado", "Aprobados", cuenta("aprobado")],
    ["devuelto", "Devueltos", cuenta("devuelto")],
  ];
  const vistos = mios.filter((x) => filtro === "todos" || (filtro === "aprobado" ? ["aprobado", "ajustado"].includes(x.estado) : x.estado === filtro));
  return (
    <div className="eh-pagina">
      <header className="eh-saludo">
        <p className="eh-saludo__mes">{MESES_LARGOS[MES.mes]} {MES.anio}</p>
        <h2>Mis turnos</h2>
      </header>
      <div className="eh-chips eh-chips--desliza" role="tablist">
        {filtros.map(([v, t, n]) => (
          <button key={v} type="button" role="tab" aria-selected={filtro === v}
            className={`eh-chip${filtro === v ? " es-activo" : ""}`} onClick={() => setFiltro(v)}>
            {t} <span className="eh-chip__n">{n}</span>
          </button>
        ))}
      </div>
      <div className="eh-lista">
        {vistos.map((x) => <TarjetaTurno key={x.id} turno={x} alCorregir={alCorregir} />)}
        {!vistos.length && <p className="eh-vacio">No hay turnos en este grupo.</p>}
      </div>
    </div>
  );
}

/* ════════════════ Embajador: registrar ════════════════ */

function Registrar({ yo, turnos, corrigiendo, alEnviar, alCerrar }) {
  const base = corrigiendo || {
    fecha: HOY, inicio: "08:00", fin: "10:00", actividad: null, area: "pregrado",
    descripcion: "", companeros: [], jefaId: null,
  };
  const [f, setF] = useState(base);
  const [grupoAbierto, setGrupoAbierto] = useState(corrigiendo ? actividad(corrigiendo.actividad).grupo : null);
  const [busca, setBusca] = useState("");
  const [intento, setIntento] = useState(false);
  const pon = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const minutos = aMin(f.fin) - aMin(f.inicio);
  const cruce = turnos.find((x) => x.embajadorId === yo.id && x.id !== corrigiendo?.id && x.fecha === f.fecha
    && aMin(x.inicio) < aMin(f.fin) && aMin(f.inicio) < aMin(x.fin));
  const recientes = [...new Set(turnos.filter((x) => x.embajadorId === yo.id).map((x) => x.actividad))].slice(0, 4);
  const encontradas = busca.trim()
    ? ACTIVIDADES.filter((a) => a.nombre.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
      .includes(busca.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")))
    : null;

  const errores = {
    horas: minutos <= 0 ? "La hora de fin debe ser después de la de inicio." : null,
    actividad: !f.actividad ? "Elige qué actividad hiciste." : null,
    descripcion: f.descripcion.trim().length < 20 ? "Cuéntalo en al menos una frase (20 letras)." : null,
    jefaId: !f.jefaId ? "Elige quién autoriza el turno." : null,
  };
  const valido = !Object.values(errores).some(Boolean);
  const enviar = (e) => {
    e.preventDefault();
    setIntento(true);
    if (valido) alEnviar(f);
  };

  const fechas = [
    [HOY, "Hoy"], ["2026-11-23", "Ayer"], ["2026-11-22", fechaLegible("2026-11-22")], ["2026-11-21", fechaLegible("2026-11-21")],
  ];

  return (
    <div className="eh-hoja" role="dialog" aria-modal="true" aria-labelledby="eh-reg-titulo">
      <div className="eh-hoja__velo" onClick={alCerrar} />
      <form className="eh-hoja__panel" onSubmit={enviar} noValidate>
        <header className="eh-hoja__cab">
          <h2 id="eh-reg-titulo">{corrigiendo ? "Corregir turno" : "Registrar turno"}</h2>
          <button type="button" className="eh-icono-btn" onClick={alCerrar} aria-label="Cerrar"><X size={20} /></button>
        </header>
        <div className="eh-hoja__cuerpo">
          {corrigiendo?.nota && (
            <div className="eh-turno__nota eh-turno__nota--grande">
              <Avatar persona={jefa(corrigiendo.jefaId)} tam={28} />
              <p><b>{jefa(corrigiendo.jefaId).corto} pidió:</b> {corrigiendo.nota}</p>
            </div>
          )}

          <fieldset className="eh-paso">
            <legend><span className="eh-paso__n">1</span> ¿Cuándo?</legend>
            <div className="eh-chips">
              {fechas.map(([v, t]) => (
                <button key={v} type="button" className={`eh-chip${f.fecha === v ? " es-activo" : ""}`} onClick={() => pon("fecha", v)}>{t}</button>
              ))}
              <label className="eh-chip eh-chip--fecha">
                <span className="eh-oculto">Otra fecha</span>
                <input type="date" value={f.fecha} min="2026-11-01" max={HOY} onChange={(e) => e.target.value && pon("fecha", e.target.value)} />
              </label>
            </div>
            <div className="eh-horas">
              <label className="eh-campo">
                <span>Empezaste</span>
                <select value={f.inicio} onChange={(e) => pon("inicio", e.target.value)}>
                  {HORAS_INICIO.map((h) => <option key={h} value={h}>{hora12(h)}</option>)}
                </select>
              </label>
              <span className="eh-horas__flecha" aria-hidden="true"><ArrowRight size={18} /></span>
              <label className="eh-campo">
                <span>Terminaste</span>
                <select value={f.fin} onChange={(e) => pon("fin", e.target.value)}>
                  {HORAS_FIN.map((h) => <option key={h} value={h}>{hora12(h)}</option>)}
                </select>
              </label>
            </div>
            <p className={`eh-duracion${minutos <= 0 ? " es-error" : ""}`} aria-live="polite">
              <Clock size={16} aria-hidden="true" />
              {minutos > 0 ? <>Este turno suma <b>{formatoHoras(minutos / 60)}</b></> : errores.horas}
            </p>
            {cruce && minutos > 0 && (
              <p className="eh-alerta"><CircleAlert size={16} aria-hidden="true" /> Se cruza con tu turno de {hora12(cruce.inicio)} a {hora12(cruce.fin)} ese mismo día.</p>
            )}
          </fieldset>

          <fieldset className="eh-paso">
            <legend><span className="eh-paso__n">2</span> ¿Qué hiciste?</legend>
            <label className="eh-buscador">
              <Search size={17} aria-hidden="true" />
              <span className="eh-oculto">Buscar actividad</span>
              <input type="search" placeholder="Busca: feria, llamadas, colegio…" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </label>
            {encontradas ? (
              <div className="eh-actividades">
                {encontradas.map((a) => <OpcionActividad key={a.id} a={a} f={f} pon={pon} />)}
                {!encontradas.length && <p className="eh-vacio">Nada con «{busca}». Prueba otra palabra.</p>}
              </div>
            ) : (
              <>
                {!corrigiendo && recientes.length > 0 && (
                  <>
                    <p className="eh-sub">Las que más usas</p>
                    <div className="eh-actividades">
                      {recientes.map((id) => <OpcionActividad key={id} a={actividad(id)} f={f} pon={pon} />)}
                    </div>
                  </>
                )}
                <p className="eh-sub">Todas, por tipo</p>
                <div className="eh-grupos">
                  {GRUPOS.map((g) => {
                    const Icono = ICONO_GRUPO(g.id);
                    const n = ACTIVIDADES.filter((a) => a.grupo === g.id).length;
                    const tieneElegida = actividad(f.actividad)?.grupo === g.id;
                    return (
                      <button key={g.id} type="button" style={{ "--g": g.color }}
                        className={`eh-grupo${grupoAbierto === g.id ? " es-abierto" : ""}${tieneElegida ? " tiene-elegida" : ""}`}
                        onClick={() => setGrupoAbierto(grupoAbierto === g.id ? null : g.id)} aria-expanded={grupoAbierto === g.id}>
                        <Icono size={20} aria-hidden="true" />
                        <span>{g.nombre}</span>
                        <small>{n}</small>
                      </button>
                    );
                  })}
                </div>
                {grupoAbierto && (
                  <div className="eh-actividades eh-actividades--grupo">
                    {ACTIVIDADES.filter((a) => a.grupo === grupoAbierto).map((a) => <OpcionActividad key={a.id} a={a} f={f} pon={pon} />)}
                  </div>
                )}
              </>
            )}
            {intento && errores.actividad && <p className="eh-error">{errores.actividad}</p>}

            <p className="eh-sub">Área responsable</p>
            <div className="eh-chips">
              {AREAS.map((a) => (
                <button key={a.id} type="button" className={`eh-chip${f.area === a.id ? " es-activo" : ""}`} onClick={() => pon("area", a.id)}>{a.nombre}</button>
              ))}
            </div>
            <p className="eh-centro"><FileSpreadsheet size={15} aria-hidden="true" /> Centro de costos: <b>{area(f.area).centro}</b> <small>(lo pone la plataforma)</small></p>
          </fieldset>

          <fieldset className="eh-paso">
            <legend><span className="eh-paso__n">3</span> Cuéntalo en una frase</legend>
            <label className="eh-campo eh-campo--texto">
              <span className="eh-oculto">Qué hiciste</span>
              <textarea rows={3} value={f.descripcion} maxLength={280}
                placeholder="Ej.: Recorrido con 25 estudiantes de grado 11 del Colegio San Bartolomé."
                onChange={(e) => pon("descripcion", e.target.value)} />
              <small className="eh-contador">{f.descripcion.length}/280</small>
            </label>
            {intento && errores.descripcion && <p className="eh-error">{errores.descripcion}</p>}
          </fieldset>

          <fieldset className="eh-paso">
            <legend><span className="eh-paso__n">4</span> ¿Con quién trabajaste?</legend>
            <div className="eh-personas">
              {EMBAJADORES.filter((p) => p.id !== yo.id).map((p) => {
                const on = f.companeros.includes(p.id);
                return (
                  <button key={p.id} type="button" className={`eh-persona${on ? " es-activo" : ""}`} aria-pressed={on}
                    onClick={() => pon("companeros", on ? f.companeros.filter((x) => x !== p.id) : [...f.companeros, p.id])}>
                    <span className="eh-persona__foto"><Avatar persona={p} tam={44} />{on && <i><Check size={12} strokeWidth={3} /></i>}</span>
                    <span>{p.corto}</span>
                  </button>
                );
              })}
            </div>
            <p className="eh-ayuda">Opcional. Si trabajaste solo, déjalo así.</p>
          </fieldset>

          <fieldset className="eh-paso">
            <legend><span className="eh-paso__n">5</span> ¿Quién autoriza?</legend>
            <div className="eh-personas">
              {JEFAS.map((p) => {
                const on = f.jefaId === p.id;
                return (
                  <button key={p.id} type="button" className={`eh-persona${on ? " es-activo" : ""}`} aria-pressed={on} onClick={() => pon("jefaId", p.id)}>
                    <span className="eh-persona__foto"><Avatar persona={p} tam={44} />{on && <i><Check size={12} strokeWidth={3} /></i>}</span>
                    <span>{p.corto}</span>
                  </button>
                );
              })}
            </div>
            {intento && errores.jefaId && <p className="eh-error">{errores.jefaId}</p>}
          </fieldset>
        </div>
        <footer className="eh-hoja__pie">
          <div className="eh-hoja__resumen">
            <b>{minutos > 0 ? formatoHoras(minutos / 60) : "—"}</b>
            <span>{fechaLegible(f.fecha)}{f.actividad ? ` · ${actividad(f.actividad).nombre}` : ""}</span>
          </div>
          <button type="submit" className="eh-btn">
            <Send size={17} aria-hidden="true" /> {corrigiendo ? "Reenviar" : "Enviar a revisión"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function OpcionActividad({ a, f, pon }) {
  const on = f.actividad === a.id;
  const g = grupo(a.grupo);
  return (
    <button type="button" className={`eh-actividad${on ? " es-activo" : ""}`} style={{ "--g": g.color }} aria-pressed={on}
      onClick={() => pon("actividad", a.id)}>
      <i aria-hidden="true" />
      <span>{a.nombre}</span>
      {on && <Check size={16} strokeWidth={3} aria-hidden="true" />}
    </button>
  );
}

/* ════════════════ Coordinadora: bandeja ════════════════ */

function Bandeja({ yo, turnos, alDecidir }) {
  const [alcance, setAlcance] = useState("mios");
  const [marcados, setMarcados] = useState([]);
  const [abierto, setAbierto] = useState(null); // { id, modo: 'ajustar' | 'devolver' }
  const pendientes = turnos.filter((x) => x.estado === "pendiente" && (alcance === "todos" || x.jefaId === yo.id))
    .sort((a, b) => (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio));
  const decididos = turnos.filter((x) => x.decididoAhora && x.revisor === yo.id);
  const horasPend = pendientes.reduce((a, x) => a + horasDeclaradas(x), 0);
  const todosMarcados = pendientes.length > 0 && pendientes.every((x) => marcados.includes(x.id));

  const aprobarMarcados = () => {
    alDecidir(marcados.map((id) => ({ id, estado: "aprobado" })));
    setMarcados([]);
  };

  return (
    <div className="eh-pagina">
      <header className="eh-saludo">
        <p className="eh-saludo__mes">Bandeja de revisión</p>
        <h2>Hola, {yo.corto}</h2>
      </header>
      <section className="eh-resumen-jefa">
        <div><strong>{pendientes.length}</strong><span>turnos por revisar</span></div>
        <div><strong>{formatoCorto(horasPend)}</strong><span>horas en juego</span></div>
        <div><strong>{decididos.length}</strong><span>revisados hoy</span></div>
      </section>

      <div className="eh-barra-acciones">
        <div className="eh-segmento eh-segmento--peq" role="radiogroup" aria-label="Qué turnos ver">
          {[["mios", "Me los pidieron a mí"], ["todos", "Todo el equipo"]].map(([v, t]) => (
            <button key={v} type="button" role="radio" aria-checked={alcance === v} className={alcance === v ? "es-activo" : ""}
              onClick={() => { setAlcance(v); setMarcados([]); }}>{t}</button>
          ))}
        </div>
        {pendientes.length > 0 && (
          <label className="eh-marcar-todo">
            <input type="checkbox" checked={todosMarcados} onChange={() => setMarcados(todosMarcados ? [] : pendientes.map((x) => x.id))} />
            Marcar todos
          </label>
        )}
      </div>

      <div className="eh-lista">
        {pendientes.map((x) => {
          const p = embajador(x.embajadorId);
          const act = actividad(x.actividad);
          const g = grupo(act.grupo);
          const Icono = ICONO_GRUPO(g.id);
          const marcado = marcados.includes(x.id);
          return (
            <article key={x.id} className={`eh-revision${marcado ? " es-marcado" : ""}`} style={{ "--g": g.color }}>
              <label className="eh-revision__check">
                <input type="checkbox" checked={marcado} onChange={() => setMarcados(marcado ? marcados.filter((m) => m !== x.id) : [...marcados, x.id])} />
                <span className="eh-oculto">Marcar turno de {p.nombre}</span>
              </label>
              <div className="eh-revision__cab">
                <Avatar persona={p} tam={40} />
                <div>
                  <b>{p.nombre}</b>
                  <span>{fechaLegible(x.fecha)} · {hora12(x.inicio)} – {hora12(x.fin)}</span>
                </div>
                <span className="eh-revision__horas">{formatoHoras(horasDeclaradas(x))}</span>
              </div>
              <div className="eh-revision__act"><Icono size={15} aria-hidden="true" /> {act.nombre}</div>
              <p className="eh-revision__desc">{x.descripcion}</p>
              <div className="eh-revision__meta">
                <span>{area(x.area).nombre}</span>
                {x.companeros.length > 0 && <span>Con {x.companeros.map((id) => embajador(id).corto).join(", ")}</span>}
                {alcance === "todos" && <span>Lo autoriza {jefa(x.jefaId).corto}</span>}
              </div>
              {abierto?.id === x.id ? (
                <Decision turno={x} modo={abierto.modo} alCancelar={() => setAbierto(null)}
                  alConfirmar={(d) => { alDecidir([{ id: x.id, ...d }]); setAbierto(null); }} />
              ) : (
                <div className="eh-revision__botones">
                  <button type="button" className="eh-btn eh-btn--peq" onClick={() => alDecidir([{ id: x.id, estado: "aprobado" }])}>
                    <Check size={16} aria-hidden="true" /> Aprobar
                  </button>
                  <button type="button" className="eh-btn eh-btn--peq eh-btn--suave" onClick={() => setAbierto({ id: x.id, modo: "ajustar" })}>
                    <Pencil size={15} aria-hidden="true" /> Ajustar horas
                  </button>
                  <button type="button" className="eh-btn eh-btn--peq eh-btn--fantasma" onClick={() => setAbierto({ id: x.id, modo: "devolver" })}>
                    <Undo2 size={15} aria-hidden="true" /> Devolver
                  </button>
                </div>
              )}
            </article>
          );
        })}
        {!pendientes.length && (
          <div className="eh-celebra">
            <CheckCheck size={40} aria-hidden="true" />
            <b>Bandeja al día</b>
            <span>No hay turnos esperando tu revisión.</span>
          </div>
        )}
      </div>

      {marcados.length > 0 && (
        <div className="eh-flotante">
          <span>{marcados.length} marcados</span>
          <button type="button" className="eh-btn" onClick={aprobarMarcados}><CheckCheck size={17} aria-hidden="true" /> Aprobar {marcados.length}</button>
        </div>
      )}
    </div>
  );
}

function Decision({ turno, modo, alCancelar, alConfirmar }) {
  const declaradas = horasDeclaradas(turno);
  const [horas, setHoras] = useState(declaradas);
  const [nota, setNota] = useState("");
  const listo = modo === "devolver" ? nota.trim().length >= 5 : horas !== declaradas && nota.trim().length >= 5;
  return (
    <div className="eh-decision">
      {modo === "ajustar" && (
        <div className="eh-ajuste">
          <button type="button" className="eh-icono-btn" onClick={() => setHoras(Math.max(0.25, horas - 0.25))} aria-label="Quitar 15 minutos"><Minus size={18} /></button>
          <div className="eh-ajuste__valor"><s>{formatoHoras(declaradas)}</s><b>{formatoHoras(horas)}</b></div>
          <button type="button" className="eh-icono-btn" onClick={() => setHoras(horas + 0.25)} aria-label="Sumar 15 minutos"><Plus size={18} /></button>
        </div>
      )}
      <label className="eh-campo eh-campo--texto">
        <span>{modo === "devolver" ? "¿Qué le falta? Se lo enviamos" : "Motivo del ajuste (lo verá el embajador)"}</span>
        <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)}
          placeholder={modo === "devolver" ? "Ej.: Falta decir cuántos estudiantes asistieron." : "Ej.: El evento terminó a las 11:30."} />
      </label>
      <div className="eh-revision__botones">
        <button type="button" className="eh-btn eh-btn--peq" disabled={!listo}
          onClick={() => alConfirmar(modo === "devolver" ? { estado: "devuelto", nota } : { estado: "ajustado", horasAjustadas: horas, nota })}>
          {modo === "devolver" ? <><Undo2 size={15} aria-hidden="true" /> Devolver</> : <><Check size={15} aria-hidden="true" /> Guardar ajuste</>}
        </button>
        <button type="button" className="eh-btn eh-btn--peq eh-btn--fantasma" onClick={alCancelar}>Cancelar</button>
      </div>
    </div>
  );
}

/* ════════════════ Coordinadora: equipo ════════════════ */

function Equipo({ turnos }) {
  const [abierto, setAbierto] = useState(null);
  const filas = EMBAJADORES.map((p) => ({ p, r: resumen(turnos, p.id) }))
    .sort((a, b) => b.r.aprobadas / b.p.asignadas - a.r.aprobadas / a.p.asignadas);
  const total = filas.reduce((a, f) => a + f.r.aprobadas, 0);
  const meta = EMBAJADORES.reduce((a, p) => a + p.asignadas, 0);

  const descargar = () => {
    const col = ["Embajador", "Área", "Actividad", "Fecha", "Autorizado por", "Hora de inicio", "Hora de fin", "Centro de costos", "Horas", "Estado", "Qué hizo", "Con quién"];
    const filasCsv = [...turnos].sort((a, b) => a.fecha.localeCompare(b.fecha)).map((x) => [
      embajador(x.embajadorId).nombre, area(x.area).nombre, actividad(x.actividad).nombre, x.fecha, jefa(x.jefaId).nombre,
      hora12(x.inicio), hora12(x.fin), area(x.area).centro, formatoCorto(horasQueCuentan(x)), ESTADOS[x.estado].nombre,
      x.descripcion, x.companeros.map((id) => embajador(id).nombre).join(", "),
    ]);
    const csv = [col, ...filasCsv].map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = "horas-embajadores-noviembre-2026.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="eh-pagina">
      <header className="eh-saludo">
        <p className="eh-saludo__mes">{MESES_LARGOS[MES.mes]} {MES.anio}</p>
        <h2>El equipo</h2>
      </header>
      <section className="eh-heroe eh-heroe--equipo">
        <div>
          <p className="eh-sub">Horas aprobadas del equipo</p>
          <p className="eh-gran-cifra">{formatoCorto(total)} <small>de {meta} h</small></p>
          <div className="eh-progreso"><i style={{ width: `${(total / meta) * 100}%` }} /></div>
        </div>
        <button type="button" className="eh-btn eh-btn--oro" onClick={descargar}>
          <Download size={17} aria-hidden="true" /> Descargar el mes (Excel)
        </button>
      </section>
      <div className="eh-lista">
        {filas.map(({ p, r }) => {
          const pa = Math.min(r.aprobadas / p.asignadas, 1) * 100;
          const pp = Math.min((r.aprobadas + r.pendientes) / p.asignadas, 1) * 100;
          const abiertoAqui = abierto === p.id;
          return (
            <article key={p.id} className="eh-miembro">
              <button type="button" className="eh-miembro__cab" onClick={() => setAbierto(abiertoAqui ? null : p.id)} aria-expanded={abiertoAqui}>
                <Avatar persona={p} tam={42} />
                <div className="eh-miembro__info">
                  <b>{p.nombre}</b>
                  <span>{p.programa}</span>
                  <div className="eh-progreso eh-progreso--doble">
                    <i className="eh-progreso__pend" style={{ width: `${pp}%` }} />
                    <i style={{ width: `${pa}%` }} />
                  </div>
                </div>
                <div className="eh-miembro__cifra">
                  <b>{formatoCorto(r.aprobadas)}<small>/{p.asignadas}</small></b>
                  {r.pendientes > 0 && <span>+{formatoCorto(r.pendientes)} en revisión</span>}
                </div>
                <ChevronRight size={18} className={`eh-miembro__flecha${abiertoAqui ? " es-abierto" : ""}`} aria-hidden="true" />
              </button>
              {abiertoAqui && (
                <div className="eh-lista eh-miembro__turnos">
                  {turnos.filter((x) => x.embajadorId === p.id).sort((a, b) => b.fecha.localeCompare(a.fecha))
                    .map((x) => <TarjetaTurno key={x.id} turno={x} compacta />)}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════ La aplicación ════════════════ */

export default function App() {
  const guardado = useMemo(leer, []);
  const [sesion, setSesion] = useState(guardado?.sesion || null);
  const [turnos, setTurnos] = useState(guardado?.turnos || TURNOS_INICIALES);
  const [vista, setVista] = useState("inicio");
  const [registrando, setRegistrando] = useState(null); // null | {} | turno a corregir
  const [aviso, setAviso] = useState(null);

  useEffect(() => { guardar({ sesion, turnos }); }, [sesion, turnos]);
  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(null), 3200);
    return () => clearTimeout(t);
  }, [aviso]);
  useEffect(() => { window.scrollTo(0, 0); }, [vista, sesion?.rol]);

  if (!sesion) {
    return <Entrada alEntrar={(rol) => { setSesion({ rol, id: rol === "jefa" ? "j1" : "e1" }); setVista(rol === "jefa" ? "bandeja" : "inicio"); }} />;
  }

  const esJefa = sesion.rol === "jefa";
  const yo = esJefa ? jefa(sesion.id) : embajador(sesion.id);
  const pendientesJefa = turnos.filter((x) => x.estado === "pendiente" && x.jefaId === yo.id).length;

  const enviarTurno = (f) => {
    if (registrando?.id) {
      setTurnos((ts) => ts.map((x) => (x.id === registrando.id ? { ...x, ...f, estado: "pendiente", nota: undefined } : x)));
      setAviso({ texto: `Reenviado a ${jefa(f.jefaId).corto}. Te avisamos cuando lo revise.` });
    } else {
      setTurnos((ts) => [...ts, { ...f, id: `n${Date.now()}`, embajadorId: yo.id, estado: "pendiente" }]);
      setAviso({ texto: `Listo: ${formatoHoras((aMin(f.fin) - aMin(f.inicio)) / 60)} enviadas a ${jefa(f.jefaId).corto}.` });
    }
    setRegistrando(null);
    setVista("turnos");
  };

  const decidir = (lista) => {
    setTurnos((ts) => ts.map((x) => {
      const d = lista.find((l) => l.id === x.id);
      return d ? { ...x, ...d, revisor: yo.id, decididoAhora: true } : x;
    }));
    const e = lista[0].estado;
    setAviso({ texto: lista.length > 1 ? `${lista.length} turnos aprobados.` : e === "aprobado" ? "Turno aprobado." : e === "ajustado" ? "Horas ajustadas; el embajador verá tu nota." : "Turno devuelto con tu nota." });
  };

  const reiniciar = () => {
    setTurnos(TURNOS_INICIALES);
    setSesion(null);
    setVista("inicio");
  };
  const cambiarRol = () => {
    const rol = esJefa ? "embajador" : "jefa";
    setSesion({ rol, id: rol === "jefa" ? "j1" : "e1" });
    setVista(rol === "jefa" ? "bandeja" : "inicio");
  };

  const pestanas = esJefa
    ? [["bandeja", "Por revisar", Inbox, pendientesJefa], ["equipo", "Equipo", Users]]
    : [["inicio", "Inicio", House], ["registrar", "Registrar", Plus], ["turnos", "Mis turnos", ListChecks]];

  const irA = (v) => (v === "registrar" ? setRegistrando({}) : setVista(v));

  return (
    <div className={`eh-app${esJefa ? " eh-app--jefa" : ""}`}>
      <aside className="eh-lateral">
        <div className="eh-marca">
          <span className="eh-marca__logo"><Clock size={20} strokeWidth={2.4} /></span>
          <span>Horas<b>Embajadores</b></span>
        </div>
        <nav className="eh-nav" aria-label="Secciones">
          {pestanas.map(([v, t, Icono, n]) => (
            <button key={v} type="button" onClick={() => irA(v)}
              className={`eh-nav__item${v === "registrar" ? " eh-nav__item--accion" : ""}${vista === v ? " es-activo" : ""}`}
              aria-current={vista === v ? "page" : undefined}>
              <span className="eh-nav__icono"><Icono size={v === "registrar" ? 24 : 21} strokeWidth={2.2} aria-hidden="true" />{n > 0 && <i className="eh-nav__n">{n}</i>}</span>
              <span className="eh-nav__texto">{t}</span>
            </button>
          ))}
        </nav>
        <div className="eh-lateral__pie">
          <div className="eh-yo"><Avatar persona={yo} tam={36} anillo /><div><b>{yo.nombre}</b><span>{esJefa ? "Coordinadora" : "Embajador"}</span></div></div>
        </div>
      </aside>

      <div className="eh-principal">
        <div className="eh-tira">
          <span className="eh-tira__sello"><MessageSquareText size={14} aria-hidden="true" /> Prototipo con datos de ejemplo</span>
          <div className="eh-tira__acciones">
            <button type="button" className="eh-enlace" onClick={cambiarRol}><RotateCcw size={14} aria-hidden="true" /> Ver como {esJefa ? "embajador" : "coordinadora"}</button>
            <button type="button" className="eh-enlace" onClick={reiniciar}><LogOut size={14} aria-hidden="true" /> Salir y reiniciar</button>
          </div>
        </div>
        {vista === "inicio" && !esJefa && <InicioEmbajador yo={yo} turnos={turnos} irARegistrar={() => setRegistrando({})} irATurnos={() => setVista("turnos")} alCorregir={setRegistrando} />}
        {vista === "turnos" && !esJefa && <MisTurnos yo={yo} turnos={turnos} alCorregir={setRegistrando} />}
        {vista === "bandeja" && esJefa && <Bandeja yo={yo} turnos={turnos} alDecidir={decidir} />}
        {vista === "equipo" && esJefa && <Equipo turnos={turnos} />}
      </div>

      {registrando && (
        <Registrar yo={yo} turnos={turnos} corrigiendo={registrando.id ? registrando : null}
          alEnviar={enviarTurno} alCerrar={() => setRegistrando(null)} />
      )}
      {aviso && <div className="eh-toast" role="status"><CircleCheck size={18} aria-hidden="true" /> {aviso.texto}</div>}
    </div>
  );
}
