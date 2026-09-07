import { useEffect, useMemo, useState } from "react";
import { FAE } from "../../theme.js";
import { SUBJECTS } from "../../data/subjects.js";
import Logo from "../Logo.jsx";
import { ChevronLeft } from "lucide-react";
import { accesoDocente, estudiantesDe, marcarEnGrupo } from "../../docente/datos.js";
import { alertasDelGrupo, avancePorTema, promedioAciertos } from "../../docente/alertas.js";
import { csvDelPanel, descargarCsv } from "../../docente/exportar.js";
import BloqueAlertas from "./BloqueAlertas.jsx";
import FilaEstudiante from "./FilaEstudiante.jsx";

/*
 * Panel docente.
 *
 * No es el tablero del estudiante con otro nombre encima: lo que le importa a
 * quien enseña es quién se está descolgando y qué hay que volver a explicar,
 * no cuántos puntos lleva cada quien.
 *
 * Dos poblaciones conviven a propósito. "Activos en la materia" es cualquiera
 * que haya entrado —explorar no pide permiso— y "mi grupo" es el curso real,
 * que el docente arma a mano. Las métricas agregadas y las alertas se calculan
 * sobre el grupo; si todavía no lo armó, sobre todos, y el panel lo dice.
 */

const seccion = { fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(248,249,250,0.55)", margin: "0 0 12px" };
const tarjeta = { padding: "14px 16px", borderRadius: "14px", background: "rgba(248,249,250,0.04)", border: "1px solid rgba(248,249,250,0.1)" };

function Kpi({ rotulo, valor, nota, color = FAE.text }) {
  return (
    <div style={tarjeta}>
      <p style={{ margin: "0 0 4px", fontSize: "11px", letterSpacing: "0.06em", color: "rgba(248,249,250,0.5)" }}>{rotulo}</p>
      <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "26px", fontWeight: 700, fontVariantNumeric: "tabular-nums", color }}>{valor}</p>
      {nota && <p style={{ margin: "4px 0 0", fontSize: "11.5px", lineHeight: 1.4, color: "rgba(248,249,250,0.5)" }}>{nota}</p>}
    </div>
  );
}

export default function PanelDocente({ onBack }) {
  const [acceso, setAcceso] = useState(null);
  const [materia, setMateria] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [soloGrupo, setSoloGrupo] = useState(false);

  useEffect(() => {
    accesoDocente().then((a) => {
      setAcceso(a);
      if (a.materias.length > 0) setMateria(a.materias[0]);
      else setCargando(false);
    });
  }, []);

  useEffect(() => {
    if (!materia) return;
    setCargando(true);
    estudiantesDe(materia).then(({ estudiantes }) => {
      setEstudiantes(estudiantes);
      setCargando(false);
    });
  }, [materia]);

  const grupo = useMemo(() => estudiantes.filter((e) => e.en_mi_grupo), [estudiantes]);
  /* Sin grupo armado todavía, el panel habla de todos: es mejor que no hablar. */
  const cohorte = grupo.length > 0 ? grupo : estudiantes;
  const alertas = useMemo(() => alertasDelGrupo(cohorte), [cohorte]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return estudiantes
      .filter((e) => (soloGrupo ? e.en_mi_grupo : true))
      .filter((e) => !q || `${e.full_name ?? ""} ${e.nickname}`.toLowerCase().includes(q));
  }, [estudiantes, busqueda, soloGrupo]);

  const marcar = async (userId, incluir) => {
    /* Optimista: marcar a treinta estudiantes no puede costar treinta esperas. */
    setEstudiantes((prev) => prev.map((e) => (e.user_id === userId ? { ...e, en_mi_grupo: incluir } : e)));
    const { ok } = await marcarEnGrupo(materia, userId, incluir);
    if (!ok) setEstudiantes((prev) => prev.map((e) => (e.user_id === userId ? { ...e, en_mi_grupo: !incluir } : e)));
  };

  /* Agregados de la cohorte. Todos toleran una cohorte vacía. */
  const resumen = useMemo(() => {
    const n = cohorte.length;
    const conFp = cohorte.filter((e) => Number(e.fp_ciclo) > 0).length;
    const evals = cohorte.filter((e) => Number(e.n_evaluativas) > 0);
    const expls = cohorte.filter((e) => Number(e.n_exploratorias) > 0);
    const media = (arr, campo) =>
      arr.length === 0 ? null : arr.reduce((s, e) => s + Number(e[campo]), 0) / arr.length;
    return {
      n,
      activosCiclo: conFp,
      pctEval: media(evals, "pct_evaluativa"),
      pctExpl: media(expls, "pct_exploratoria"),
      nEval: evals.length,
      nExpl: expls.length,
    };
  }, [cohorte]);

  /* Avance por tema del conjunto: dónde se atasca el grupo, no solo cuánto lleva. */
  const porTema = useMemo(() => {
    if (!materia) return [];
    const acumulado = new Map();
    for (const e of cohorte) {
      for (const t of avancePorTema(materia, e.actividades ?? [])) {
        if (t.huerfana) continue;
        const prev = acumulado.get(t.id) ?? { titulo: t.titulo, total: t.total, iniciaron: 0, terminaron: 0 };
        if (t.hechas > 0) prev.iniciaron += 1;
        if (t.hechas >= t.total) prev.terminaron += 1;
        acumulado.set(t.id, prev);
      }
    }
    return [...acumulado.entries()].map(([id, v]) => ({ id, ...v }));
  }, [cohorte, materia]);

  /* ---------------- puertas de acceso ---------------- */

  if (acceso === null) {
    return <Marco onBack={onBack}><p style={{ color: "rgba(248,249,250,0.6)" }}>Comprobando acceso…</p></Marco>;
  }

  if (!acceso.esDocente) {
    return (
      <Marco onBack={onBack}>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: "22px", margin: "0 0 10px" }}>Panel docente</h1>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.65)", maxWidth: "52ch" }}>
          Esta cuenta no está autorizada. El acceso lo habilita el equipo de AprendeFAE
          correo por correo; no hay forma de solicitarlo desde aquí.
        </p>
      </Marco>
    );
  }

  if (acceso.materias.length === 0) {
    return (
      <Marco onBack={onBack}>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: "22px", margin: "0 0 10px" }}>Panel docente</h1>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "rgba(248,249,250,0.65)", maxWidth: "52ch" }}>
          Tu cuenta está autorizada pero todavía no tiene ninguna materia asignada.
        </p>
      </Marco>
    );
  }

  const nombreMateria = SUBJECTS[materia]?.name ?? materia;

  return (
    <Marco onBack={onBack}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "6px" }}>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
          {nombreMateria}
        </h1>
        <button
          type="button"
          onClick={() => descargarCsv(csvDelPanel(cohorte, materia), `aprendefae-${materia}-${new Date().toISOString().slice(0, 10)}.csv`)}
          disabled={cohorte.length === 0}
          style={{
            fontFamily: "Sora, sans-serif", fontSize: "13px", fontWeight: 600,
            padding: "9px 16px", borderRadius: "999px",
            cursor: cohorte.length === 0 ? "default" : "pointer",
            background: "transparent",
            border: `1px solid ${cohorte.length === 0 ? "rgba(248,249,250,0.15)" : "rgba(248,249,250,0.3)"}`,
            color: cohorte.length === 0 ? "rgba(248,249,250,0.35)" : FAE.text,
          }}
        >
          Exportar informe
        </button>
      </div>

      {acceso.materias.length > 1 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "18px", flexWrap: "wrap" }}>
          {acceso.materias.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMateria(m)}
              style={{
                fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
                padding: "7px 14px", borderRadius: "999px", cursor: "pointer",
                background: m === materia ? FAE.teal : "transparent",
                border: `1px solid ${m === materia ? FAE.teal : "rgba(248,249,250,0.22)"}`,
                color: m === materia ? FAE.bg : "rgba(248,249,250,0.7)",
              }}
            >
              {SUBJECTS[m]?.name ?? m}
            </button>
          ))}
        </div>
      )}

      <p style={{ fontSize: "13.5px", color: "rgba(248,249,250,0.55)", margin: "0 0 24px" }}>
        {grupo.length > 0
          ? `Métricas y alertas sobre tu grupo: ${grupo.length} de ${estudiantes.length} activos en la materia.`
          : `Todavía sin grupo armado — se muestran los ${estudiantes.length} estudiantes activos en la materia.`}
      </p>

      {cargando ? (
        <p style={{ color: "rgba(248,249,250,0.6)" }}>Cargando…</p>
      ) : estudiantes.length === 0 ? (
        /*
         * Periodo sin datos. No es un error ni una pantalla rota: al principio
         * del semestre esto es lo correcto, y decirlo así evita que parezca que
         * el panel no funciona.
         */
        <div style={{ ...tarjeta, maxWidth: "56ch" }}>
          <p style={{ margin: 0, fontSize: "14.5px", lineHeight: 1.6, color: "rgba(248,249,250,0.7)" }}>
            Todavía nadie ha registrado actividad en {nombreMateria}. En cuanto tus estudiantes
            empiecen a completar actividades, aparecerán aquí con su avance.
          </p>
        </div>
      ) : (
        <>
          <BloqueAlertas alertas={alertas} grupoVacio={grupo.length === 0} />

          <section style={{ marginBottom: "28px" }}>
            <h2 style={seccion}>RESUMEN DEL PERIODO</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
              <Kpi rotulo="ESTUDIANTES" valor={resumen.n} nota={`${resumen.activosCiclo} con actividad este ciclo`} />
              <Kpi
                rotulo="ACIERTO EVALUATIVAS"
                valor={resumen.pctEval === null ? "—" : `${Math.round(resumen.pctEval)}%`}
                nota={resumen.nEval === 0 ? "Nadie ha hecho evaluativas aún" : `${resumen.nEval} estudiantes · señal fiable de dominio`}
                color={FAE.text}
              />
              <Kpi
                rotulo="ACIERTO EXPLORATORIAS"
                valor={resumen.pctExpl === null ? "—" : `${Math.round(resumen.pctExpl)}%`}
                /* El aviso va pegado al número, no en una nota al pie que nadie lee. */
                nota={resumen.nExpl === 0 ? "Nadie ha hecho exploratorias aún" : "Se puede reintentar hasta acertar: tiende a 100% y no mide dominio"}
                color="rgba(248,249,250,0.72)"
              />
              <Kpi
                rotulo="EN RIESGO"
                valor={alertas.filter((a) => a.nivel === "urgente").length}
                nota="Tenían ritmo y llevan más de un ciclo sin entrar"
                color={FAE.coral}
              />
            </div>
          </section>

          <section style={{ marginBottom: "28px" }}>
            <h2 style={seccion}>AVANCE POR TEMA</h2>
            <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "-4px 0 12px", maxWidth: "62ch" }}>
              Cuenta solo las actividades que otorgan FP. El material teórico no deja registro,
              así que alguien que leyó la teoría sin jugar aparece como no iniciado.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {porTema.map((t) => (
                <div key={t.id} style={{ ...tarjeta, display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "14px", fontWeight: 600 }}>{t.titulo}</p>
                    <div style={{ height: "6px", borderRadius: "999px", background: "rgba(248,249,250,0.1)", overflow: "hidden" }}>
                      <div style={{ width: `${cohorte.length ? (t.terminaron / cohorte.length) * 100 : 0}%`, height: "100%", background: FAE.teal, borderRadius: "999px", transition: "width 300ms ease" }} />
                    </div>
                  </div>
                  <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "13px", fontVariantNumeric: "tabular-nums", color: "rgba(248,249,250,0.7)", whiteSpace: "nowrap" }}>
                    {t.terminaron} completo · {t.iniciaron} iniciado
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={seccion}>ESTUDIANTES ACTIVOS EN {nombreMateria.toUpperCase()}</h2>
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
              <input
                type="search"
                value={busqueda}
                onChange={(ev) => setBusqueda(ev.target.value)}
                placeholder="Buscar por nombre o apodo"
                style={{
                  flex: 1, minWidth: "220px", padding: "10px 14px", borderRadius: "10px",
                  background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.16)",
                  color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "14px", outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setSoloGrupo((v) => !v)}
                style={{
                  fontFamily: "Sora, sans-serif", fontSize: "12.5px", fontWeight: 600,
                  padding: "9px 16px", borderRadius: "10px", cursor: "pointer",
                  background: soloGrupo ? FAE.teal : "transparent",
                  border: `1px solid ${soloGrupo ? FAE.teal : "rgba(248,249,250,0.22)"}`,
                  color: soloGrupo ? FAE.bg : "rgba(248,249,250,0.7)",
                }}
              >
                Solo mi grupo
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {visibles.map((e) => (
                <FilaEstudiante key={e.user_id} e={e} subjectId={materia} onMarcar={marcar} />
              ))}
              {visibles.length === 0 && (
                <p style={{ fontSize: "14px", color: "rgba(248,249,250,0.55)" }}>Ningún estudiante coincide con esa búsqueda.</p>
              )}
            </div>
          </section>
        </>
      )}
    </Marco>
  );
}

function Marco({ children, onBack }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: FAE.bg, fontFamily: "Inter, sans-serif", color: FAE.text }}>
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "clamp(18px, 3vh, 30px) 24px 64px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "26px" }}>
          <Logo variant="symbol" size={26} theme="dark" />
          <span aria-hidden="true" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "999px", background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer" }}
          >
            <ChevronLeft size={20} color={FAE.text} />
          </button>
          <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
            Panel docente
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
