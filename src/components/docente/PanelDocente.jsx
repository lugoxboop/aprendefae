import { useEffect, useMemo, useRef, useState } from "react";
import { FAE } from "../../theme.js";
import { SUBJECTS, HACER, actividadesDeTipo, desafioDe, ubicacionDeActividad } from "../../data/subjects.js";
import Logo from "../Logo.jsx";
import { ChevronLeft, Download } from "lucide-react";
import { actividadDe, estudiantesDe, marcarEnGrupo, resumenDe } from "../../docente/datos.js";
import { useAccesoDocente } from "../../docente/useAccesoDocente.js";
import { alertasDelGrupo, avancePorTema, NIVEL } from "../../docente/alertas.js";
import { avanceDeClase, cifrasDeActividad, masHechas, necesitanAtencion, peorActividad } from "../../docente/panelV1.js";
import { destacadosDe } from "../../docente/destacados.js";
import { csvDelPanel, descargarCsv } from "../../docente/exportar.js";
import BloqueAlertas from "./BloqueAlertas.jsx";
import Destacados from "./Destacados.jsx";
import ResumenClase, { DesdeTuVisita, SelectorMateria } from "./ResumenClase.jsx";
import AtencionAhora from "./AtencionAhora.jsx";
import PeorActividad from "./PeorActividad.jsx";
import ListaEstudiantes from "./ListaEstudiantes.jsx";
import ListaActividades from "./ListaActividades.jsx";
import VistaEstudiante from "./VistaEstudiante.jsx";
import { CSS_V1, V1, tarjetaV1, notaV1, volverV1 } from "./estiloV1.js";

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
 *
 * ═══════════ PANEL v1 (Ukyo, prompts/panel-docente-v1.md; Célula D) ═══════════
 *
 * La primera pantalla son tres respuestas: cómo va la clase (B1), a quién
 * mirar (B2) y qué actividad salió peor (B3); desde 1024 px, una línea más con
 * lo que cambió desde la última visita (B4). Lo demás está a uno o dos toques,
 * en vistas aparte dentro del mismo marco: las alertas completas, «Mis
 * estudiantes», el detalle de cada uno y «Actividades». Las cifras son las de
 * antes, de las mismas funciones; solo cambian de sitio (P7). El rediseño no
 * agrega escrituras: panel_resumen y grupo_marcar siguen como estaban (P8).
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
  /* Si panel_estudiantes falla: el único sitio con coral (P6), con «Reintentar». */
  const [errorCarga, setErrorCarga] = useState(null);
  const [intento, setIntento] = useState(0);
  /* Qué vista del panel: inicio · atencion · estudiantes · estudiante · actividades. */
  const [vista, setVista] = useState({ tipo: "inicio" });
  const [temasAbiertos, setTemasAbiertos] = useState(false);
  /* panel_actividad por actividad, pedido bajo demanda (B3 y «Actividades»). */
  const [cifrasAct, setCifrasAct] = useState({});
  /* Del servidor, para el delta de la cabecera. No confundir con `resumen`,
   * que es el agregado de la cohorte y se calcula abajo. */
  const [resumenVisita, setResumenVisita] = useState(null);

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
    setErrorCarga(null);
    setCifrasAct({});
    setVista((v) => (v.tipo === "actividades" ? v : { tipo: "inicio" }));
    estudiantesDe(materia).then(({ estudiantes, error }) => {
      setEstudiantes(estudiantes);
      setErrorCarga(error);
      setCargando(false);
    });
    /*
     * El resumen va aparte y no bloquea la lista: si panel_resumen no existe
     * todavía —cliente desplegado antes que la migración 0019— esto se queda en
     * null y la cabecera pinta lo que sabe calcular sola.
     */
    resumenDe(materia).then(({ resumen }) => setResumenVisita(resumen));
  }, [materia, intento]);

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
   * Panel v1: llegar con una actividad en la URL abre su rendimiento, en la
   * vista «Actividades», una sola vez. Antes bajaba hasta la sección; ahora la
   * sección es una vista aparte. Con un hash escrito a mano, o de otra
   * materia, no se prometió nada: el panel abre por el resumen.
   */
  const yaAbrio = useRef(false);
  useEffect(() => {
    if (!actividadInicial || actividadElegida !== actividadInicial || yaAbrio.current) return;
    yaAbrio.current = true;
    setVista({ tipo: "actividades", actividad: actividadInicial });
  }, [actividadInicial, actividadElegida]);

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
        const prev = acumulado.get(t.id) ?? { titulo: t.titulo, total: t.total, iniciaron: 0, terminaron: 0, hechas: 0 };
        /* Panel v1: las hechas de toda la cohorte, para «Actividades hechas» en B1. */
        prev.hechas += t.hechas;
        if (t.hechas > 0) prev.iniciaron += 1;
        if (t.hechas >= t.total) prev.terminaron += 1;
        acumulado.set(t.id, prev);
      }
    }
    return [...acumulado.entries()].map(([id, v]) => ({ id, ...v }));
  }, [cohorte, materia]);

  /* ═══════════ PANEL v1: lo que resume la primera pantalla ═══════════ */

  /* B1: los activos de la semana, igual que la tarjeta de antes (el del servidor si llegó; si no, el de la cohorte). */
  const activos = Number(resumenVisita?.estudiantes_activos ?? cohorte.filter((e) => Number(e.fp_ciclo) > 0).length);
  const avance = useMemo(() => avanceDeClase(porTema, cohorte.length, materia), [porTema, cohorte.length, materia]);
  /* B2: una fila por estudiante con alerta, la más grave. */
  const atencion = useMemo(() => necesitanAtencion(cohorte), [cohorte]);
  const urgentes = alertas.filter((a) => a.nivel === NIVEL.URGENTE).length;

  /* B3 y «Actividades»: las cifras de panel_actividad, con su materia en la clave (un cambio de materia no mezcla respuestas). */
  const filasActividades = useMemo(
    () => actividadesMirables.map((a, orden) => ({ ...a, orden, cifras: cifrasDeActividad(cifrasAct[`${materia}:${a.id}`]) })),
    [actividadesMirables, cifrasAct, materia]
  );
  const seis = useMemo(() => masHechas(cohorte, actividadesMirables).map((a) => a.id), [cohorte, actividadesMirables]);
  const pedidas = useRef(new Set());
  const pedir = (ids) => {
    const nuevas = ids.filter((id) => !pedidas.current.has(`${materia}:${id}`));
    nuevas.forEach((id) => pedidas.current.add(`${materia}:${id}`));
    const m = materia;
    return Promise.all(nuevas.map((id) => actividadDe(m, id).then(({ actividad }) => {
      setCifrasAct((c) => ({ ...c, [`${m}:${id}`]: actividad ?? { completaron: 0 } }));
    })));
  };
  useEffect(() => { pedidas.current = new Set(); }, [materia]);
  /*
   * ⛔ Ukyo §12: las 6 llamadas de B3 van en paralelo DESPUÉS del primer
   * pintado, y se mide cuánto tardan (objetivo < 1,5 s). La medida queda en
   * data-ms-peor del bloque y en performance, para la sonda.
   */
  const [msPeor, setMsPeor] = useState(null);
  useEffect(() => {
    if (cargando || errorCarga || !materia) return;
    setMsPeor(null);
    if (seis.length === 0) { setMsPeor(0); return; }
    const t0 = performance.now();
    let vivo = true;
    pedir(seis).then(() => { if (vivo) setMsPeor(Math.round(performance.now() - t0)); });
    return () => { vivo = false; };
  }, [cargando, errorCarga, materia, seis.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  const estadoPeor = useMemo(() => {
    const entre = filasActividades.filter((f) => seis.includes(f.id));
    const cargandoPeor = entre.some((f) => !f.cifras);
    return { cargando: cargandoPeor, nMirables: actividadesMirables.length, ...peorActividad(entre) };
  }, [filasActividades, seis, actividadesMirables.length]);
  /* «Actividades» pide el resto al entrar: de seis en seis, para no lanzar sesenta llamadas a la vez. */
  const [cargandoTodas, setCargandoTodas] = useState(false);
  useEffect(() => {
    if (vista.tipo !== "actividades" || !materia) return;
    let vivo = true;
    setCargandoTodas(true);
    (async () => {
      const ids = actividadesMirables.map((a) => a.id);
      for (let i = 0; i < ids.length && vivo; i += 6) await pedir(ids.slice(i, i + 6));
      if (vivo) setCargandoTodas(false);
    })();
    return () => { vivo = false; };
  }, [vista.tipo, materia, actividadesMirables]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Cambiar de vista vuelve arriba: cada vista empieza por su título. */
  const ir = (v) => {
    setVista(v);
    try { window.scrollTo({ top: 0, behavior: "auto" }); } catch { /* jsdom */ }
  };
  const temaDe = (actividadId) => {
    const t = SUBJECTS[materia]?.topics?.find((x) => (x.actividades ?? []).some((a) => a.id === actividadId));
    return t?.title ?? null;
  };

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
  const sinEstudiantes = !cargando && !errorCarga && estudiantes.length === 0;
  const singular = cohorte.length === 1;
  const notaCohorte = `${grupo.length > 0
    ? `Métricas y alertas sobre tu grupo: ${cohorte.length} de ${conActividad} estudiantes con actividad en la materia.`
    : `Todavía sin grupo armado — las métricas hablan de los ${conActividad} estudiantes con actividad en la materia.`}${
    nPrueba === 0 ? "" : nPrueba === 1
      ? " Hay 1 cuenta de prueba en la lista; no entra en promedios, alertas ni destacados."
      : ` Hay ${nPrueba} cuentas de prueba en la lista; no entran en promedios, alertas ni destacados.`}`;
  const estudianteAbierto = vista.tipo === "estudiante" ? estudiantes.find((e) => e.user_id === vista.id) : null;

  let cuerpo;
  if (cargando) {
    /* Ukyo §7: esqueleto de los tres bloques, del mismo alto, sin salto. */
    cuerpo = (
      <div className="pd1-rejilla" aria-busy="true" aria-label="Cargando…" data-cargando>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ ...tarjetaV1, height: "180px" }}>
            <div className="pd1-esqueleto" style={{ height: "16px", width: "50%" }} />
            <div className="pd1-esqueleto" style={{ height: "40px", width: "35%", marginTop: "14px" }} />
            <div className="pd1-esqueleto" style={{ height: "14px", width: "70%", marginTop: "14px" }} />
          </div>
        ))}
      </div>
    );
  } else if (errorCarga) {
    cuerpo = (
      <div style={{ ...tarjetaV1, maxWidth: "62ch" }} role="alert" data-error-carga>
        <p style={{ margin: "0 0 6px", fontFamily: "Sora, sans-serif", fontSize: "15px", fontWeight: 600, color: FAE.coral }}>
          No se pudo cargar tu clase
        </p>
        <p style={notaV1}>Revisa tu conexión y vuelve a intentarlo.</p>
        <button type="button" style={{ ...volverV1, marginTop: "12px", marginBottom: 0 }} onClick={() => setIntento((n) => n + 1)} data-reintentar>
          Reintentar
        </button>
      </div>
    );
  } else if (vista.tipo === "atencion") {
    cuerpo = (
      <section data-vista="atencion">
        <button type="button" style={volverV1} onClick={() => ir({ tipo: "inicio" })} data-volver>‹ Volver al resumen</button>
        <BloqueAlertas alertas={alertas} grupoVacio={grupo.length === 0} />
        <Destacados estudiantes={cohorte} />
        {/* Ukyo §8: lo que quedaba del «Resumen del periodo» que no está en B1. */}
        <section style={{ ...tarjetaV1, marginBottom: "28px" }} data-resumen-periodo>
          <p style={{ margin: "0 0 4px", fontSize: "12px", letterSpacing: "0.06em", color: V1.texto2 }}>ACIERTO EXPLORATORIAS</p>
          <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "26px", fontWeight: 700, color: "rgba(248,249,250,0.8)" }} data-cifra="acierto-exploratorias">
            {resumen.pctExpl === null ? "—" : `${Math.round(resumen.pctExpl)}%`}
          </p>
          <p style={{ ...notaV1, marginTop: "4px" }}>
            {resumen.nExpl === 0 ? "Nadie ha hecho exploratorias aún" : "Se puede reintentar hasta acertar: tiende a 100% y no mide dominio"}
          </p>
          <p style={{ margin: "14px 0 4px", fontSize: "12px", letterSpacing: "0.06em", color: V1.texto2 }}>EN RIESGO</p>
          <p style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: "26px", fontWeight: 700, color: FAE.text }} data-cifra="en-riesgo">{urgentes}</p>
          <p style={{ ...notaV1, marginTop: "4px" }}>Tenían ritmo y llevan más de un ciclo sin entrar (riesgo alto)</p>
        </section>
      </section>
    );
  } else if (vista.tipo === "estudiantes") {
    cuerpo = (
      <ListaEstudiantes
        estudiantes={estudiantes}
        atencion={atencion}
        notaCohorte={notaCohorte}
        onAbrir={(id) => ir({ tipo: "estudiante", id, desde: "estudiantes" })}
        onVolver={() => ir({ tipo: "inicio" })}
      />
    );
  } else if (vista.tipo === "estudiante") {
    const desde = vista.desde ?? "inicio";
    cuerpo = (
      <VistaEstudiante
        e={estudianteAbierto}
        subjectId={materia}
        posicion={estudianteAbierto ? posiciones.get(estudianteAbierto.user_id) : null}
        onMarcar={marcar}
        textoVolver={desde === "estudiantes" ? "Mis estudiantes" : "Volver al resumen"}
        onVolver={() => ir({ tipo: desde })}
      />
    );
  } else if (vista.tipo === "actividades") {
    cuerpo = (
      <ListaActividades
        filas={filasActividades}
        cargando={cargandoTodas}
        elegida={acceso.materias.includes(materia) ? vista.actividad ?? null : null}
        subjectId={materia}
        nombreMateria={nombreMateria}
        onElegir={(id) => { if (id) elegirActividad(id); ir({ tipo: "actividades", actividad: id }); }}
        onVolver={() => ir({ tipo: "inicio" })}
      />
    );
  } else {
    cuerpo = (
      <>
        {sinEstudiantes ? (
          /*
           * Ukyo §7, 0 estudiantes, con el texto de Katsumi. No hay «código de
           * curso» (decisión de Yujiro: esa función no existe). Las vistas
           * aparte, apagadas con su razón.
           */
          <section style={{ ...tarjetaV1, maxWidth: "62ch" }} data-bloque="b1" data-vacio>
            <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.6, color: FAE.text }}>
              Aún no hay nada que mostrar. Cuando tu clase haga su primera actividad, la verás aquí.
            </p>
          </section>
        ) : (
          <div className="pd1-rejilla">
            <ResumenClase
              avance={avance}
              activos={activos}
              nCohorte={cohorte.length}
              singular={singular}
              porTema={porTema}
              pctEval={resumen.pctEval}
              nEval={resumen.nEval}
              abierto={temasAbiertos}
              onAlternar={() => setTemasAbiertos((v) => !v)}
            />
            <AtencionAhora
              atencion={atencion}
              nDestacados={destacados.length}
              singular={singular}
              onVerTodos={() => ir({ tipo: "atencion" })}
              onAbrir={(id) => ir({ tipo: "estudiante", id, desde: "inicio" })}
            />
            <div data-ms-peor={msPeor ?? undefined} style={{ minWidth: 0, display: "grid" }}>
              <PeorActividad
                estado={estadoPeor}
                singular={singular}
                onAbrir={(id) => { elegirActividad(id); ir({ tipo: "actividades", actividad: id }); }}
                onVerTodas={() => ir({ tipo: "actividades", actividad: null })}
              />
            </div>
          </div>
        )}
        {!sinEstudiantes && <DesdeTuVisita resumen={resumenVisita} temaDe={temaDe} />}
        <nav aria-label="Vistas del panel" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
          {[
            { id: "estudiantes", texto: "Mis estudiantes", ir: () => ir({ tipo: "estudiantes" }) },
            { id: "actividades", texto: "Actividades", ir: () => ir({ tipo: "actividades", actividad: null }) },
          ].map((x) => (
            <button key={x.id} type="button" onClick={x.ir} disabled={sinEstudiantes} data-ir={x.id} style={{ ...volverV1, marginBottom: 0, opacity: sinEstudiantes ? 0.55 : 1, cursor: sinEstudiantes ? "default" : "pointer" }}>
              {x.texto}
            </button>
          ))}
        </nav>
        {sinEstudiantes && <p style={{ ...notaV1, marginTop: "8px" }} data-razon-apagado>Se abre cuando alguien haga su primera actividad.</p>}
      </>
    );
  }

  return (
    <Marco onBack={onBack}>
      <div className="pd1">
        <style>{CSS_V1}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
          {/*
            * Con más de una materia, las pastillas hacen de título (la elegida es
            * la materia) y el h1 queda para el lector: así el resumen cabe entero
            * en 667 px (P1). Con una sola, el nombre a la vista.
            */}
          <h1
            className="pd1-nombre"
            style={acceso.materias.length > 1 && vista.tipo === "inicio"
              ? { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", margin: 0 }
              : { fontFamily: "Sora, sans-serif", fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}
          >
            {nombreMateria}
          </h1>
          {vista.tipo === "inicio" && (
            <SelectorMateria materias={acceso.materias} materia={materia} nombreDe={(m) => SUBJECTS[m]?.name ?? m} onMateria={setMateria} />
          )}
          {/* Ukyo §8: «Exportar informe», botón de ícono de 44 × 44 con su nombre para el lector. */}
          <button
            type="button"
            aria-label="Exportar informe"
            title="Exportar informe"
            data-exportar
            onClick={() => descargarCsv(csvDelPanel(cohorte, materia), `aprendefae-${materia}-${new Date().toISOString().slice(0, 10)}.csv`)}
            disabled={cohorte.length === 0}
            style={{
              flexShrink: 0, width: "44px", height: "44px", display: "inline-flex", alignItems: "center", justifyContent: "center",
              borderRadius: "999px", background: "transparent", cursor: cohorte.length === 0 ? "default" : "pointer",
              border: `1px solid ${cohorte.length === 0 ? "rgba(248,249,250,0.15)" : "rgba(248,249,250,0.3)"}`,
              opacity: cohorte.length === 0 ? 0.5 : 1,
            }}
          >
            <Download size={18} color={FAE.text} aria-hidden="true" />
          </button>
        </div>
        {cuerpo}
      </div>
    </Marco>
  );
}

function Marco({ children, onBack }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: FAE.bg, fontFamily: "Inter, sans-serif", color: FAE.text }}>
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "12px clamp(16px, 4vw, 24px) 64px" }}>
        {/*
          * La pastilla de FP (AccountControl, de Erwin) flota arriba a la
          * derecha. Esta barra le deja su hueco y el título se recorta con
          * elipsis en vez de pasar por debajo (Shibukawa, #498: a menos de
          * 360 px la tapaba).
          */}
        <style>{`.pd1-barra { padding-right: 112px; } @media (min-width: 720px) { .pd1-barra { padding-right: 0; } }`}</style>
        <div className="pd1-barra" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", minWidth: 0 }}>
          <Logo variant="symbol" size={26} theme="dark" />
          <span aria-hidden="true" style={{ width: "1px", height: "22px", backgroundColor: "rgba(248,249,250,0.16)", margin: "0 4px" }} />
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", padding: 0, borderRadius: "999px", background: "rgba(248,249,250,0.06)", border: "1px solid rgba(248,249,250,0.14)", cursor: "pointer" }}
          >
            <ChevronLeft size={20} color={FAE.text} />
          </button>
          <h2 className="pd1-nombre" style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.2, minWidth: 0 }}>
            Panel docente
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
