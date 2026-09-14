import { useEffect, useMemo, useRef, useState } from "react";
import { FAE } from "../../theme.js";
import { SUBJECTS, HACER, actividadesDeTipo, desafioDe, ubicacionDeActividad } from "../../data/subjects.js";
import Logo from "../Logo.jsx";
import { ChevronLeft } from "lucide-react";
import { estudiantesDe, marcarEnGrupo, resumenDe } from "../../docente/datos.js";
import { useAccesoDocente } from "../../docente/useAccesoDocente.js";
import { alertasDelGrupo, avancePorTema, promedioAciertos } from "../../docente/alertas.js";
import { destacadosDe } from "../../docente/destacados.js";
import { csvDelPanel, descargarCsv } from "../../docente/exportar.js";
import BloqueAlertas from "./BloqueAlertas.jsx";
import CabeceraResumen from "./CabeceraResumen.jsx";
import Destacados from "./Destacados.jsx";
import FilaEstudiante from "./FilaEstudiante.jsx";
import VistaRendimiento from "./VistaRendimiento.jsx";

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

/*
 * `actividadInicial` llega del tercer segmento del hash: #/docente/proyecto-arca.
 * Es lo que hace que el enlace desde una actividad caiga en ella y no en el
 * selector vacío.
 *
 * NO SE VALIDA AQUÍ QUE SEA UNA ACTIVIDAD: se comprueba contra la lista de la
 * materia y, si no está, se ignora. Un hash escrito a mano no puede dejar el
 * panel en un estado que no sepa pintar.
 */
export default function PanelDocente({ actividadInicial = null, onBack }) {
  /* La respuesta que comparten la cabecera, el perfil y esto: una llamada, no una por pantalla. */
  const acceso = useAccesoDocente();
  const [materia, setMateria] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [soloGrupo, setSoloGrupo] = useState(false);
  /* Del servidor, para el delta de la cabecera. No confundir con `resumen`,
   * que es el agregado de la cohorte y se calcula abajo. */
  const [resumenVisita, setResumenVisita] = useState(null);
  /*
   * Qué fila tiene el detalle abierto. UNA SOLA, y vive aquí y no en cada fila:
   * si cada una guardara su propio estado, abrir la segunda no cerraría la
   * primera y el panel se llenaría de detalles abiertos.
   */
  const [filaAbierta, setFilaAbierta] = useState(null);

  /*
   * ═══════════ QUÉ ACTIVIDAD SE ESTÁ MIRANDO ═══════════
   *
   * Se recuerda en localStorage y NO en la URL, a propósito. La URL de este
   * sitio es navegación —qué vista estás viendo— y no estado de un control
   * dentro de una vista; meter aquí un parámetro obligaría a que el enrutador
   * conociera el catálogo de actividades del panel.
   *
   * Es una comodidad por navegador, no un dato: si localStorage falla —modo
   * privado, sitio con almacenamiento bloqueado— se cae a la primera actividad
   * de la materia y no pasa nada. Por eso todo va envuelto en try/catch y por
   * eso se lee dentro de un inicializador perezoso, que corre una sola vez.
   */
  const [actividadElegida, setActividadElegida] = useState(null);

  useEffect(() => {
    if (acceso.pendiente) return;
    if (acceso.materias.length === 0) { setCargando(false); return; }
    /*
     * Si se llega con una actividad en la URL, se abre en SU materia. Sin
     * esto, un enlace desde el Arca —que vive en Pensamiento Estratégico—
     * aterrizaría en la primera materia del docente y la preselección
     * fallaría en silencio, que es peor que no tener el enlace.
     */
    const suya = ubicacionDeActividad(actividadInicial)?.materiaId;
    setMateria(suya && acceso.materias.includes(suya) ? suya : acceso.materias[0]);
  }, [acceso, actividadInicial]);

  useEffect(() => {
    if (!materia) return;
    setCargando(true);
    setFilaAbierta(null);
    estudiantesDe(materia).then(({ estudiantes }) => {
      setEstudiantes(estudiantes);
      setCargando(false);
    });
    /*
     * El resumen va aparte y no bloquea la lista: si panel_resumen no existe
     * todavía —cliente desplegado antes que la migración 0019— esto se queda en
     * null y la cabecera pinta lo que sabe calcular sola.
     */
    resumenDe(materia).then(({ resumen }) => setResumenVisita(resumen));
  }, [materia]);

  const grupo = useMemo(() => estudiantes.filter((e) => e.en_mi_grupo), [estudiantes]);

  /*
   * ═══════════ LA COHORTE: DE QUIÉN HABLAN TODAS LAS MÉTRICAS ═══════════
   *
   * Sin grupo armado todavía, el panel habla de todos: es mejor que no hablar.
   *
   * Y SIN LAS CUENTAS DE PRUEBA. Esta es la ÚNICA línea del cliente donde se
   * filtran, y por eso está aquí y no repartida: de `cohorte` cuelgan el
   * resumen del periodo, las alertas, Destacados, el avance por tema, las
   * posiciones y el CSV. Filtrar en cada uno significaría que el próximo que
   * se añada tiene que acordarse, y el primero que se olvide contamina los
   * promedios sin que nada falle.
   *
   * Las que agrega el SERVIDOR —panel_resumen y panel_tendencia— las excluyen
   * en su propio SQL. panel_estudiantes no: es un censo, una fila por persona,
   * y esa fila se queda para que la marca se pueda auditar desde la interfaz.
   * De ahí que `estudiantes` las contenga y `cohorte` no.
   */
  const cohorte = useMemo(() => {
    const base = grupo.length > 0 ? grupo : estudiantes;
    return base.filter((e) => !e.es_prueba);
  }, [grupo, estudiantes]);

  const nPrueba = useMemo(() => estudiantes.filter((e) => e.es_prueba).length, [estudiantes]);

  /*
   * ═══════════ TRES POBLACIONES, Y CADA NÚMERO DICE CUÁL ES LA SUYA ═══════════
   *
   *   estudiantes    todo lo que devuelve el censo, cuentas de prueba incluidas.
   *                  Es lo que se LISTA, y nunca un denominador de métricas.
   *   conActividad   los reales con algún FP en la materia.
   *   cohorte        de quién hablan las métricas: el grupo si lo hay, y si no
   *                  todos los reales.
   *
   * Antes se mezclaban dos de ellas con la misma etiqueta —"13 de 15 activos en
   * la materia" arriba y "de 13 con actividad en la materia" dos líneas abajo—
   * y un docente no tenía forma de saber por qué el mismo concepto daba dos
   * números. Ahora cada uno dice qué cuenta, y el 15 desaparece: incluía la
   * cuenta de prueba, que ya no entra en ninguna métrica.
   */
  const conActividad = useMemo(() => estudiantes.filter((e) => !e.es_prueba).length, [estudiantes]);
  const etiquetaCohorte = grupo.length > 0 ? "en tu grupo" : "con actividad en la materia";
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
  /*
   * Ya no calcula el tamaño de la cohorte ni cuántos están activos: esas dos
   * cifras viven ahora en la cabecera, que es donde se leen primero. Dejarlas
   * aquí sin usar sería una segunda fuente esperando a que alguien la pinte y
   * vuelva a duplicar el número.
   */
  const resumen = useMemo(() => {
    const evals = cohorte.filter((e) => Number(e.n_evaluativas) > 0);
    const expls = cohorte.filter((e) => Number(e.n_exploratorias) > 0);
    const media = (arr, campo) =>
      arr.length === 0 ? null : arr.reduce((s, e) => s + Number(e[campo]), 0) / arr.length;
    return {
      pctEval: media(evals, "pct_evaluativa"),
      pctExpl: media(expls, "pct_exploratoria"),
      nEval: evals.length,
      nExpl: expls.length,
    };
  }, [cohorte]);

  /*
   * Destacados sobre la COHORTE, no sobre todos: si el docente filtró a su
   * grupo, los destacados son los de su grupo. Lo contrario sería la única
   * parte del panel que ignora el filtro.
   */
  const destacados = useMemo(() => destacadosDe(cohorte), [cohorte]);
  const idsDestacados = useMemo(
    () => new Set(destacados.map((d) => d.estudiante.user_id)),
    [destacados]
  );

  /* Posición por FP total dentro de la cohorte, para el detalle de cada fila. */
  const posiciones = useMemo(() => {
    const orden = [...cohorte].sort((a, b) => Number(b.fp_total) - Number(a.fp_total));
    return new Map(orden.map((e, i) => [e.user_id, i + 1]));
  }, [cohorte]);

  /*
   * Las actividades que PUEDEN tener datos: las de "Hacer" de esta materia,
   * con su desafío. Las de "Aprender" no otorgan FP, no dejan fila en
   * fp_history y por tanto no tienen nada que enseñar aquí; listarlas sería
   * ofrecer siete pantallas que solo pueden decir "sin datos".
   *
   * Se incluye el desafío porque actividadesDeTipo() lo excluye a propósito
   * —vive al lado del camino, no dentro— pero sí otorga FP y sí tiene
   * historial. El Arca es justamente eso, y es la primera que Mateo va a abrir.
   */
  const actividadesMirables = useMemo(() => {
    const s = SUBJECTS[materia];
    if (!s) return [];
    const salida = [];
    for (const t of s.topics ?? []) {
      const desafio = desafioDe(t);
      for (const a of [...actividadesDeTipo(t, HACER), ...(desafio ? [desafio] : [])]) {
        salida.push({ id: a.id, nombre: a.nombre, tema: t.title, sinItems: a.sinItems === true });
      }
    }
    return salida;
  }, [materia]);

  /*
   * Qué actividad se abre, por orden de prioridad:
   *
   *   1. La que venga en la URL, si es de esta materia. Es una intención
   *      explícita —alguien pulsó un enlace— y gana sobre cualquier memoria.
   *   2. La última que se miró en ESTA materia.
   *   3. La primera de la lista.
   */
  useEffect(() => {
    if (!materia || actividadesMirables.length === 0) return;
    const dePar = actividadesMirables.some((a) => a.id === actividadInicial);
    if (dePar) { setActividadElegida(actividadInicial); return; }

    let recordada = null;
    try {
      recordada = window.localStorage.getItem(`fae.docente.actividad.${materia}`);
    } catch {
      /* Almacenamiento bloqueado: se sigue sin recordar nada. */
    }
    const existe = actividadesMirables.some((a) => a.id === recordada);
    setActividadElegida(existe ? recordada : actividadesMirables[0].id);
  }, [materia, actividadesMirables, actividadInicial]);

  /*
   * Y se baja hasta la sección, una sola vez. Llegar de un enlace y aterrizar
   * arriba del todo obligaría a buscar a mano lo que el enlace prometía enseñar.
   * Solo pasa cuando se llegó con actividad en la URL: abrir el panel a mano
   * sigue empezando por el resumen, que es lo primero que un docente quiere ver.
   */
  const yaBajo = useRef(false);
  useEffect(() => {
    /*
     * Solo si la actividad de la URL EXISTE y quedó puesta. Con un hash escrito
     * a mano —o con una actividad de otra materia— no se prometió nada, así que
     * tampoco se mueve la página: el panel abre por arriba, como siempre.
     */
    if (!actividadInicial || actividadElegida !== actividadInicial) return;
    if (yaBajo.current || cargando) return;
    const seccion = document.getElementById("rendimiento-por-actividad");
    if (!seccion) return;
    yaBajo.current = true;
    /*
     * INSTANTÁNEO, NO SUAVE. El desplazamiento suave lo dibuja el navegador
     * cuadro a cuadro, y una pestaña que no está al frente no produce cuadros:
     * el panel abierto en segundo plano se quedaba arriba del todo y el enlace
     * no cumplía lo que promete. Se comprobó que requestAnimationFrame no llega
     * a dispararse en ese estado.
     *
     * Un salto tampoco desorienta aquí: no es el usuario quien se mueve por la
     * página, es un enlace que dijo a dónde iba.
     */
    seccion.scrollIntoView({ behavior: "auto", block: "start" });
  }, [actividadInicial, cargando, actividadElegida]);

  const elegirActividad = (id) => {
    setActividadElegida(id);
    try {
      window.localStorage.setItem(`fae.docente.actividad.${materia}`, id);
    } catch {
      /* Que no se recuerde no puede impedir que se mire. */
    }
  };

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

  if (acceso.pendiente) {
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
          ? `Métricas y alertas sobre tu grupo: ${cohorte.length} de ${conActividad} estudiantes con actividad en la materia.`
          : `Todavía sin grupo armado — las métricas hablan de los ${conActividad} estudiantes con actividad en la materia.`}
        {nPrueba > 0 && (
          /*
           * Se dice en voz alta y no se deja adivinar: un docente que ve una
           * fila más de las que suman los promedios tiene que poder leer por
           * qué sin abrir nada.
           */
          <>
            {" "}
            <span style={{ color: "rgba(248,249,250,0.42)" }}>
              {nPrueba === 1
                ? "Hay 1 cuenta de prueba en la lista; no entra en promedios, alertas ni destacados."
                : `Hay ${nPrueba} cuentas de prueba en la lista; no entran en promedios, alertas ni destacados.`}
            </span>
          </>
        )}
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
          <CabeceraResumen
            cohorte={cohorte}
            etiquetaCohorte={etiquetaCohorte}
            alertas={alertas}
            resumen={resumenVisita}
            temaDe={(actividadId) => {
              /* El tema al que pertenece una actividad, para la frase del delta. */
              const t = SUBJECTS[materia]?.topics?.find((x) =>
                (x.actividades ?? []).some((a) => a.id === actividadId)
              );
              return t?.title ?? null;
            }}
          />

          <BloqueAlertas alertas={alertas} grupoVacio={grupo.length === 0} />

          <Destacados estudiantes={cohorte} />

          <section style={{ marginBottom: "28px" }}>
            <h2 style={seccion}>RESUMEN DEL PERIODO</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
              {/*
                * LA TARJETA "ESTUDIANTES" SE FUE ARRIBA. Decía exactamente el
                * mismo número que la primera tarjeta de la cabecera, a media
                * pantalla de distancia y sin nada que las distinguiera. La de
                * la cabecera se queda porque va primero, es lo primero que se
                * lee y lleva su denominador escrito al lado.
                *
                * Las tres que quedan aquí no se repiten en ningún otro sitio.
                */}
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

          {/*
            * ÍTEM 4 — El rendimiento por actividad, que era el hueco honesto.
            *
            * Aquí había una tarjeta diciendo que el diagnóstico por pregunta
            * llegaría cuando fp_detalle acumulara recorrido. Ya llegó, y con él
            * las otras cifras de la misma pregunta: finalización, distribución,
            * tiempo y FP de UNA actividad concreta.
            *
            * ═══════════ LA CONDICIÓN ES POR MATERIA, NO SOLO POR SER DOCENTE ═══════════
            *
            * Que la cuenta sea docente no basta: hay que estar autorizado en
            * ESTA materia. El servidor lo comprueba en las dos funciones con su
            * propio 42501 y no se fía del cliente; esto de aquí es para que la
            * interfaz no ofrezca lo que el servidor va a rechazar.
            */}
          {acceso.materias.includes(materia) && actividadesMirables.length > 0 && (
            <section id="rendimiento-por-actividad" style={{ marginBottom: "28px", scrollMarginTop: "16px" }}>
              <h2 style={seccion}>RENDIMIENTO POR ACTIVIDAD</h2>
              <p style={{ fontSize: "12.5px", color: "rgba(248,249,250,0.5)", margin: "-4px 0 12px", maxWidth: "62ch" }}>
                Solo las actividades que otorgan FP: las de material teórico no dejan registro y no
                tendrían nada que enseñar aquí.
              </p>

              {/*
                * El selector va con aria-label y no con una etiqueta oculta:
                * el panel no tiene ninguna clase de "solo lectores de pantalla"
                * y meter una hoja de estilos entera para una línea sería peor
                * que usar el atributo que existe justo para esto.
                */}
              <div style={{ marginBottom: "16px" }}>
                <select
                  aria-label="Actividad que se está mirando"
                  value={actividadElegida ?? ""}
                  onChange={(ev) => elegirActividad(ev.target.value)}
                  style={{
                    width: "100%", maxWidth: "420px", padding: "10px 14px", borderRadius: "10px",
                    background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.16)",
                    color: FAE.text, fontFamily: "Inter, sans-serif", fontSize: "14px", outline: "none",
                    /*
                     * LA LISTA DESPLEGADA LA PINTA EL SISTEMA, NO ESTA HOJA.
                     *
                     * El cuadro cerrado tomaba estos colores, pero al abrirlo el
                     * navegador dibujaba el menú con el tema CLARO del sistema:
                     * fondo blanco y encima el texto casi invisible que hereda de
                     * aquí. Ilegible en un sitio oscuro.
                     *
                     * `color-scheme` es lo único que el sistema escucha para
                     * decidir con qué tema pinta sus propios controles. No es
                     * decoración: sin él, el color del texto de las opciones y el
                     * fondo que les pone el sistema los eligen dos capas
                     * distintas y nadie garantiza que contrasten.
                     *
                     * Los `option` llevan además su color explícito porque
                     * Windows y Linux ignoran color-scheme en el menú abierto de
                     * un select y usan los del elemento.
                     */
                    colorScheme: "dark",
                  }}
                >
                  {[...new Set(actividadesMirables.map((a) => a.tema))].map((tema) => (
                    <optgroup key={tema} label={tema} style={{ background: FAE.bg, color: "rgba(248,249,250,0.6)" }}>
                      {actividadesMirables
                        .filter((a) => a.tema === tema)
                        .map((a) => (
                          <option
                            key={a.id}
                            value={a.id}
                            style={{ background: FAE.bg, color: FAE.text }}
                          >
                            {a.nombre}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/*
                * SE BUSCA ANTES DE MONTAR, Y ESTO NO ES DEFENSA GRATUITA.
                *
                * Al cambiar de materia, `materia` y `actividadesMirables` se
                * actualizan en el mismo repintado pero `actividadElegida`
                * todavía trae la actividad de la materia ANTERIOR: el efecto que
                * la corrige corre después. En ese hueco el find() devolvía
                * undefined y la vista reventaba con "Cannot read properties of
                * undefined (reading 'id')", tumbando el panel entero.
                *
                * Salió al probar con las dos materias de Mateo. Sin el guardia,
                * el primer clic en el selector de materia lo dejaba en blanco.
                */}
              {(() => {
                const actual = actividadesMirables.find((a) => a.id === actividadElegida);
                if (!actual) return null;
                return (
                  <VistaRendimiento
                    key={`${materia}:${actual.id}`}
                    subjectId={materia}
                    nombreMateria={nombreMateria}
                    actividad={actual}
                  />
                );
              })()}
            </section>
          )}

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
                <FilaEstudiante
                  key={e.user_id}
                  e={e}
                  subjectId={materia}
                  onMarcar={marcar}
                  abierta={filaAbierta === e.user_id}
                  onAlternar={setFilaAbierta}
                  destacado={idsDestacados.has(e.user_id)}
                  posicion={posiciones.get(e.user_id)}
                />
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
