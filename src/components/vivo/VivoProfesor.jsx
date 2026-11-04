import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Users, Play, BarChart3, ArrowRight, Trophy, ClipboardList, X } from "lucide-react";
import { useAccesoDocente } from "../../docente/useAccesoDocente.js";
import { crearSala, avanzar, leerConteo, leerPodio, leerAsistencia, leerEstado, mensajeDeError, restanteMs } from "../../vivo/datos.js";
import { armarPreguntas, temasEnVivo, MATERIAS_EN_VIVO, CANTIDADES, DURACIONES } from "../../vivo/banco.js";
import { useSala, useReloj } from "../../vivo/useSala.js";
import { CSS_VIVO, V } from "../../vivo/estilo.js";
import { Enunciado, Opciones, Reloj, Podio, miles } from "./piezas.jsx";
import qrcode from "qrcode-generator";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA CLASE EN VIVO — EL TABLERO DEL PROFESOR (fase 1, encargo de Mateo, 4-nov)
 *
 * Es la pantalla que se proyecta. Todo lo que está aquí se lee desde el fondo
 * del salón: código enorme, pregunta grande, letras grandes en las opciones.
 *
 *   preparar → espera (código y quién va entrando) → pregunta (reloj y cuántos
 *   respondieron) → resultados (barras y la correcta) → … → podio → cerrar
 *
 * La pregunta se cierra sola cuando se acaba el tiempo o cuando ya respondieron
 * todos los que entraron. El botón está por si el profesor quiere cerrarla
 * antes.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CLAVE_SALA = "fae-vivo-sala";

const NOMBRE_MATERIA = { macroeconomia: "Macroeconomía", contabilidad: "Contabilidad" };

export default function VivoProfesor({ materiaInicial = null, onBack }) {
  const acceso = useAccesoDocente();
  const [salaInicial, setSalaInicialCruda] = useState(null);
  const [revisado, setRevisado] = useState(false);

  /*
   * Si el profesor recarga la página a mitad de clase, vuelve a su sala: el id
   * se guarda en esta pestaña al abrirla. Si ya se cerró, empieza de cero.
   */
  const setSalaInicial = (e) => {
    try { e ? sessionStorage.setItem(CLAVE_SALA, e.sala_id) : sessionStorage.removeItem(CLAVE_SALA); } catch { /* sin almacenamiento: no se reanuda */ }
    setSalaInicialCruda(e);
  };
  useEffect(() => {
    if (!acceso.esDocente || revisado) return;
    let id = null;
    try { id = sessionStorage.getItem(CLAVE_SALA); } catch { id = null; }
    if (!id) { setRevisado(true); return; }
    leerEstado(id).then(({ data }) => {
      if (data && data.soy_dueno && data.estado !== "cerrada") setSalaInicialCruda(data);
      setRevisado(true);
    });
  }, [acceso.esDocente, revisado]);

  if (acceso.pendiente || (acceso.esDocente && !revisado)) return <Marco onBack={onBack}><p className="vivo-nota">Cargando…</p></Marco>;
  if (!acceso.esDocente) {
    return (
      <Marco onBack={onBack}>
        <div className="vivo-tarjeta"><p className="vivo-nota">La clase en vivo se abre desde una cuenta de docente.</p></div>
      </Marco>
    );
  }
  if (!salaInicial) return <Preparar materiaInicial={materiaInicial} onBack={onBack} alCrear={setSalaInicial} />;
  return <Tablero inicial={salaInicial} onBack={() => { setSalaInicial(null); onBack?.(); }} />;
}

function Marco({ children, onBack, ancho = false }) {
  return (
    <div className="vivo" data-vivo="profesor">
      <style>{CSS_VIVO}</style>
      <div className="vivo-marco" style={ancho ? { maxWidth: "1280px" } : undefined}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", minHeight: "44px" }}>
          {onBack ? (
            <button type="button" className="vivo-boton vivo-boton--suave" onClick={onBack} style={{ minHeight: "44px", padding: "0 16px" }}>
              <ChevronLeft size={18} aria-hidden="true" /> Panel docente
            </button>
          ) : <span />}
        </div>
        {children}
      </div>
    </div>
  );
}

/* ═══════════ PREPARAR ═══════════ */

function Preparar({ materiaInicial, onBack, alCrear }) {
  const [materia, setMateria] = useState(MATERIAS_EN_VIVO.includes(materiaInicial) ? materiaInicial : "contabilidad");
  const temas = useMemo(() => temasEnVivo(materia), [materia]);
  const [tema, setTema] = useState(null);
  const [cantidad, setCantidad] = useState(8);
  const [duracion, setDuracion] = useState(30);
  const [abriendo, setAbriendo] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { setTema(temas[0]?.id ?? null); }, [temas]);
  const elegido = temas.find((t) => t.id === tema);

  const abrir = async () => {
    if (!elegido) return;
    setAbriendo(true); setError(null);
    const preguntas = armarPreguntas(materia, elegido.id, cantidad);
    const { data, error: e } = await crearSala({ materia, tema: elegido.id, titulo: elegido.titulo, duracion, preguntas });
    setAbriendo(false);
    if (e) { setError(mensajeDeError(e)); return; }
    alCrear(data);
  };

  return (
    <Marco onBack={onBack}>
      <header className="vivo-entra" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <span className="vivo-cejilla">Clase en vivo</span>
        <h1 className="vivo-titulo" style={{ fontSize: "clamp(28px, 4.4vw, 42px)" }}>Pon a toda la clase a responder a la vez</h1>
        <p className="vivo-nota" style={{ maxWidth: "62ch" }}>
          Elige el tema de hoy y abre la sala. Tus estudiantes entran desde el celular con un código, responden la misma pregunta contra el reloj y ven cuántos eligieron cada opción. Entrar a la sala cuenta como asistencia.
        </p>
      </header>

      <section className="vivo-tarjeta vivo-entra-2" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <span className="vivo-cejilla" style={{ color: V.dato }}>Materia</span>
          <div className="vivo-chips">
            {MATERIAS_EN_VIVO.map((m) => (
              <button key={m} type="button" className="vivo-chip" aria-pressed={materia === m} onClick={() => setMateria(m)}>{NOMBRE_MATERIA[m]}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <span className="vivo-cejilla" style={{ color: V.dato }}>Tema</span>
          <div className="vivo-temas">
            {temas.map((t) => (
              <button key={t.id} type="button" className="vivo-tema" aria-pressed={tema === t.id} onClick={() => setTema(t.id)} data-vivo-tema={t.id}>
                <b>{t.titulo}</b>
                <span>{t.disponibles} preguntas en el banco</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "22px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span className="vivo-cejilla" style={{ color: V.dato }}>Preguntas</span>
            <div className="vivo-chips">
              {CANTIDADES.map((n) => (
                <button key={n} type="button" className="vivo-chip" aria-pressed={cantidad === n} onClick={() => setCantidad(n)}>{n}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <span className="vivo-cejilla" style={{ color: V.dato }}>Tiempo por pregunta</span>
            <div className="vivo-chips">
              {DURACIONES.map((s) => (
                <button key={s} type="button" className="vivo-chip" aria-pressed={duracion === s} onClick={() => setDuracion(s)}>{s} s</button>
              ))}
            </div>
          </div>
        </div>
        {elegido && elegido.disponibles < cantidad && (
          <p className="vivo-nota" style={{ color: V.ambar }}>Este tema tiene {elegido.disponibles} preguntas en el banco: la clase tendrá esas.</p>
        )}
        {error && <p className="vivo-nota" role="alert" style={{ color: V.coral }}>{error}</p>}
        <div>
          <button type="button" className="vivo-boton" onClick={abrir} disabled={!elegido || abriendo} data-vivo-abrir>
            <Play size={18} aria-hidden="true" /> {abriendo ? "Abriendo la sala…" : "Abrir la sala"}
          </button>
        </div>
      </section>
    </Marco>
  );
}

/* ═══════════ EL TABLERO ═══════════ */

function Tablero({ inicial, onBack }) {
  const { estado, aplicar, avisar, desfase } = useSala(inicial.sala_id, { inicial });
  const [conteo, setConteo] = useState(null);
  const [podio, setPodio] = useState(null);
  const [lista, setLista] = useState([]);
  const [verAsistencia, setVerAsistencia] = useState(false);
  const [error, setError] = useState(null);
  const moviendo = useRef(false);
  const fase = estado?.estado;
  const ahora = useReloj(fase === "pregunta", 200);
  const restante = restanteMs(estado, desfase.current, ahora);

  const mover = async (accion) => {
    if (moviendo.current) return;
    moviendo.current = true;
    const { data, error: e } = await avanzar(inicial.sala_id, accion);
    moviendo.current = false;
    if (e) { setError(mensajeDeError(e)); return; }
    setError(null);
    setConteo(null);
    aplicar(data);
    avisar();
  };

  /* Quién va entrando (en la espera) y la asistencia (al final). */
  useEffect(() => {
    if (fase !== "espera" && fase !== "final") return undefined;
    let vivo = true;
    const leer = () => leerAsistencia(inicial.sala_id).then(({ data }) => { if (vivo && data) setLista(data); });
    leer();
    const t = fase === "espera" ? setInterval(leer, 2500) : null;
    return () => { vivo = false; if (t) clearInterval(t); };
  }, [fase, inicial.sala_id]);

  /* Cuántos respondieron, mientras corre la pregunta y al cerrarla. */
  useEffect(() => {
    if (fase !== "pregunta" && fase !== "resultados") return undefined;
    let vivo = true;
    const leer = () => leerConteo(inicial.sala_id).then(({ data }) => { if (vivo && data) setConteo(data); });
    leer();
    const t = fase === "pregunta" ? setInterval(leer, 1500) : null;
    return () => { vivo = false; if (t) clearInterval(t); };
  }, [fase, estado?.indice, inicial.sala_id]);

  /* La pregunta se cierra sola: se acabó el tiempo, o ya respondieron todos. */
  const todos = conteo && conteo.indice === estado?.indice && conteo.participantes > 0 && conteo.respondieron >= conteo.participantes;
  useEffect(() => {
    if (fase !== "pregunta") return;
    if (restante <= 0 || todos) mover("resultados");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, restante <= 0, todos]);

  useEffect(() => {
    if (fase !== "final") return;
    leerPodio(inicial.sala_id, 5).then(({ data }) => data && setPodio(data));
  }, [fase, inicial.sala_id]);

  if (!estado) return <Marco onBack={onBack}><p className="vivo-nota">Cargando…</p></Marco>;

  const ultima = estado.indice + 1 >= estado.total;
  const codigo = `${estado.codigo.slice(0, 3)} ${estado.codigo.slice(3)}`;

  return (
    <Marco onBack={fase === "cerrada" ? onBack : null} ancho>
      {/* La franja de arriba: tema, código pequeño (para quien llega tarde) y cuántos hay adentro. */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
          <span className="vivo-cejilla">Clase en vivo · {estado.titulo}</span>
          {fase === "pregunta" || fase === "resultados" ? (
            <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "18px" }}>Pregunta {estado.indice + 1} de {estado.total}</span>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          {fase !== "espera" && fase !== "cerrada" && (
            <span style={{ color: V.apoyo, fontSize: "14px" }}>Código <b className="vivo-codigo" style={{ fontSize: "18px", color: V.texto }}>{codigo}</b></span>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: V.apoyo, fontSize: "14px" }} data-vivo-participantes>
            <Users size={16} aria-hidden="true" /> {estado.participantes}
          </span>
        </div>
      </div>

      {error && <p className="vivo-nota" role="alert" style={{ color: V.coral }}>{error}</p>}

      {fase === "espera" && (
        <section style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "22px", padding: "18px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(20px, 5vw, 56px)", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
              <p className="vivo-nota vivo-entra" style={{ fontSize: "clamp(16px, 2vw, 22px)", color: V.apoyo }}>
                Escanea el código o entra a <b style={{ color: V.texto }}>aprendefae.com/#/vivo</b>
              </p>
          <div className="vivo-codigo vivo-pop" data-vivo-codigo style={{ fontSize: "clamp(46px, 13vw, 150px)", color: V.texto }}>{codigo}</div>
            </div>
            <CodigoQR texto={`https://aprendefae.com/#/vivo/${estado.codigo}`} />
          </div>
          <p className="vivo-nota vivo-entra-2" style={{ fontSize: "18px" }}>
            {estado.participantes === 0 ? "Esperando a que entre el primero…" : `${estado.participantes} ${estado.participantes === 1 ? "estudiante adentro" : "estudiantes adentro"}`}
          </p>
          {lista.length > 0 && (
            <div className="vivo-chips" style={{ justifyContent: "center", maxWidth: "900px" }} aria-label="Quiénes entraron">
              {lista.map((p) => (
                <span key={p.apodo + p.unido_en} className="vivo-pop" style={{ padding: "8px 14px", borderRadius: "999px", background: V.panel2, border: `1px solid ${V.linea}`, fontSize: "15px", fontWeight: 600 }}>{p.apodo}</span>
              ))}
            </div>
          )}
          <button type="button" className="vivo-boton" onClick={() => mover("siguiente")} disabled={estado.participantes === 0} data-vivo-empezar
            style={{ minHeight: "56px", padding: "0 32px", fontSize: "17px" }}>
            <Play size={20} aria-hidden="true" /> Empezar
          </button>
        </section>
      )}

      {(fase === "pregunta" || fase === "resultados") && estado.pregunta && (
        <section key={estado.indice} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {fase === "pregunta" && <Reloj restante={restante} duracion={estado.duracion_s} />}
          <div className="vivo-entra"><Enunciado pregunta={estado.pregunta} grande /></div>
          <Opciones pregunta={estado.pregunta} grande
            correcta={fase === "resultados" ? estado.correcta : null}
            conteo={fase === "resultados" ? (conteo?.por_opcion ?? {}) : null} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ color: V.apoyo, fontSize: "16px" }} data-vivo-respondieron>
              {fase === "pregunta"
                ? `${conteo?.respondieron ?? 0} de ${estado.participantes} respondieron`
                : resumenResultados(conteo, estado)}
            </span>
            {fase === "pregunta" ? (
              <button type="button" className="vivo-boton vivo-boton--suave" onClick={() => mover("resultados")} data-vivo-cerrar-pregunta>
                <BarChart3 size={18} aria-hidden="true" /> Ver resultados
              </button>
            ) : (
              <button type="button" className="vivo-boton" onClick={() => mover("siguiente")} data-vivo-siguiente>
                {ultima ? <><Trophy size={18} aria-hidden="true" /> Ver el podio</> : <>Siguiente pregunta <ArrowRight size={18} aria-hidden="true" /></>}
              </button>
            )}
          </div>
        </section>
      )}

      {fase === "final" && (
        <section style={{ display: "flex", flexDirection: "column", gap: "22px", alignItems: "center" }}>
          <h2 className="vivo-titulo vivo-entra" style={{ fontSize: "clamp(28px, 4vw, 44px)", textAlign: "center" }}>El podio de hoy</h2>
          <Podio lista={podio?.podio ?? []} />
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" className="vivo-boton vivo-boton--suave" onClick={() => setVerAsistencia((v) => !v)} aria-expanded={verAsistencia} data-vivo-ver-asistencia>
              <ClipboardList size={18} aria-hidden="true" /> {verAsistencia ? "Ocultar asistencia" : `Asistencia (${lista.length})`}
            </button>
            <button type="button" className="vivo-boton" onClick={() => mover("cerrar")} data-vivo-terminar>
              <X size={18} aria-hidden="true" /> Terminar la clase
            </button>
          </div>
          {verAsistencia && <Asistencia lista={lista} total={estado.total} />}
        </section>
      )}

      {fase === "cerrada" && (
        <section className="vivo-tarjeta vivo-entra" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <h2 className="vivo-titulo" style={{ fontSize: "24px" }}>La clase terminó</h2>
          <p className="vivo-nota">Entraron {lista.length} estudiantes. Esta es la asistencia con lo que acertó cada uno.</p>
          <Asistencia lista={lista} total={estado.total} />
          <div><button type="button" className="vivo-boton" onClick={onBack}>Volver al panel</button></div>
        </section>
      )}
    </Marco>
  );
}

/* El QR del tablero: lleva a la sala con el código puesto. Fondo blanco, que es lo que leen las cámaras. */
function CodigoQR({ texto }) {
  const { lado, camino } = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(texto);
    qr.make();
    const n = qr.getModuleCount();
    let d = "";
    for (let f = 0; f < n; f++) for (let c = 0; c < n; c++) if (qr.isDark(f, c)) d += `M${c} ${f}h1v1h-1z`;
    return { lado: n, camino: d };
  }, [texto]);
  return (
    <div className="vivo-pop" style={{ background: "#FFFFFF", padding: "14px", borderRadius: "18px", lineHeight: 0 }} data-vivo-qr>
      <svg viewBox={`0 0 ${lado} ${lado}`} width="200" height="200" role="img" aria-label="Código QR para entrar a la clase" shapeRendering="crispEdges"
        style={{ width: "clamp(150px, 18vw, 220px)", height: "auto", display: "block" }}>
        <path d={camino} fill="#0B1626" />
      </svg>
    </div>
  );
}

function resumenResultados(conteo, estado) {
  if (!conteo?.por_opcion) return "";
  const total = Object.values(conteo.por_opcion).reduce((a, b) => a + b, 0);
  if (!total) return "Nadie respondió esta pregunta.";
  const aciertos = conteo.por_opcion[estado.correcta] ?? 0;
  return `Acertó el ${Math.round((aciertos / total) * 100)} % (${aciertos} de ${total})`;
}

function Asistencia({ lista, total }) {
  return (
    <div style={{ width: "100%", overflowX: "auto" }} data-vivo-asistencia>
      <table className="vivo-tabla">
        <thead><tr><th>Estudiante</th><th>Entró</th><th>Aciertos</th><th>Puntos</th></tr></thead>
        <tbody>
          {lista.map((p) => (
            <tr key={p.apodo + p.unido_en}>
              <td>{p.apodo}</td>
              <td>{new Date(p.unido_en).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })}</td>
              <td>{p.aciertos} de {total}</td>
              <td>{miles(p.puntos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
