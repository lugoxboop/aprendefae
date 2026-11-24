/*
 * Datos de ejemplo del prototipo de horas de embajadores.
 *
 * Todo es inventado: nombres, turnos y notas. No hay base de datos todavía;
 * el estado vive en el navegador de quien prueba (localStorage) y se puede
 * reiniciar desde el menú. Cuando el prototipo se apruebe, este archivo es el
 * molde de las tablas: embajadores, jefas y turnos.
 */

export const MES = { anio: 2026, mes: 10 }; // noviembre (0 = enero)
/* Horas del Forms: inicio 5:30 a. m.–7:00 p. m., fin 6:30 a. m.–8:00 p. m., de 15 en 15. */
const rango=(d,h)=>{const r=[];for(let m=d;m<=h;m+=15)r.push(`${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`);return r;};
export const HORAS_INICIO = rango(330, 1140);
export const HORAS_FIN = rango(390, 1200);
export const hora12 = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); const s = h >= 12 ? "p. m." : "a. m."; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${s}`; };
export const HOY = "2026-11-24";

/*
 * El catálogo sale del Forms «Actividades Promotores» (leído el 24-nov-2026):
 * sus 40 actividades venían en una sola lista plana. Aquí van agrupadas por
 * familia para encontrarlas rápido; los nombres son los mismos del Forms.
 */
export const GRUPOS = [
  { id: "colegios", nombre: "Colegios", icono: "School", color: "#2F6B4F" },
  { id: "ferias", nombre: "Ferias", icono: "Megaphone", color: "#B7791F" },
  { id: "visitas", nombre: "Visitas y charlas", icono: "Footprints", color: "#2C6E9B" },
  { id: "llamadas", nombre: "Llamadas", icono: "Phone", color: "#8A4FA3" },
  { id: "eventos", nombre: "Eventos y logística", icono: "Sparkles", color: "#B4532D" },
  { id: "datos", nombre: "Bases de datos", icono: "Database", color: "#4B5D73" },
  { id: "investigacion", nombre: "Investigación", icono: "Search", color: "#0E7C7B" },
  { id: "contenido", nombre: "Contenido", icono: "Camera", color: "#C2416B" },
];

const A = (grupo, nombre) => ({ id: nombre.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), grupo, nombre });

export const ACTIVIDADES = [
  A("colegios", "Actividad externadista colegios - Bogotá"),
  A("colegios", "Actividad externadista colegios fuera de Bogotá"),
  A("colegios", "Visita de colegio UEC - Campus"),
  A("colegios", "Agendamiento de Colegios"),
  A("colegios", "Triángulo Vocacional"),
  A("colegios", "Ingreso a clase"),
  A("ferias", "Feria del libro o Expo-Estudiante"),
  A("ferias", "Feria grupo de Universidades - Bogotá"),
  A("ferias", "Feria pregrado Bogotá"),
  A("ferias", "Feria pregrado fuera de Bogotá"),
  A("ferias", "Feria posgrados en Bogotá"),
  A("ferias", "Feria posgrados fuera de Bogotá"),
  A("visitas", "Visitas guiadas a la Universidad y asesoría"),
  A("visitas", "Recorridos posgrados"),
  A("visitas", "Charlas virtuales"),
  A("visitas", "Simulacro de entrevista"),
  A("llamadas", "Llamadas admitidos pregrado"),
  A("llamadas", "Llamadas a colegios"),
  A("llamadas", "Llamadas confirmación de datos"),
  A("llamadas", "Llamadas de seguimiento aspirantes"),
  A("llamadas", "Llamadas entrevistas virtuales"),
  A("llamadas", "Llamadas investigación de mercados"),
  A("llamadas", "Llamadas y/o Logística Bienvenida de padres"),
  A("llamadas", "Llamadas reserva de cupo"),
  A("eventos", "Día Universitario Externadista"),
  A("eventos", "Logística Día Universitario Externadista"),
  A("eventos", "Apoyo a cargo de Promoción en eventos Facultades"),
  A("eventos", "Eventos o actividades a cargo de Facultades u otras dependencias"),
  A("eventos", "Logística proceso de admisiones pregrado - posgrados"),
  A("eventos", "Logística semana de inducción"),
  A("eventos", "Apoyo Bienestar Universitario"),
  A("eventos", "Organización material oficina"),
  A("datos", "Digitar y/o clasificar base de datos"),
  A("datos", "Envío bases de datos"),
  A("datos", "Creación bases de datos"),
  A("investigacion", "Benchmarking"),
  A("investigacion", "Trascripciones"),
  A("investigacion", "Realización de entrevistas"),
  A("investigacion", "Categorización y análisis de estudios"),
  A("contenido", "Creación de Contenido y/o Redes - Promoción"),
];

export const actividad = (id) => ACTIVIDADES.find((x) => x.id === id);
export const grupo = (id) => GRUPOS.find((x) => x.id === id);
export const grupoDe = (actividadId) => grupo(actividad(actividadId)?.grupo);

/* Las seis áreas del Forms, con un centro de costos sugerido (inventado). */
export const AREAS = [
  { id: "promocion", nombre: "Promoción universitaria", centro: "1501 · Promoción institucional" },
  { id: "investigacion", nombre: "Investigación de mercado", centro: "1601 · Investigación de mercados" },
  { id: "posgrados", nombre: "Posgrados · Promoción", centro: "1801 · Promoción posgrados" },
  { id: "pregrado", nombre: "Pregrado · Promoción", centro: "1201 · Promoción pregrado" },
  { id: "facultad", nombre: "Facultad", centro: "2103 · Apoyo a facultades" },
  { id: "otras", nombre: "Otras", centro: "9701 · Otros" },
];
export const area = (id) => AREAS.find((x) => x.id === id);

/* Quienes autorizan (en el Forms, «Autorizado por»): nombres inventados. */
export const JEFAS = [
  { id: "j1", nombre: "Laura Méndez", corto: "Laura", color: "#7A4E9E" },
  { id: "j2", nombre: "Catalina Ríos", corto: "Catalina", color: "#B4552D" },
  { id: "j3", nombre: "Diana Torres", corto: "Diana", color: "#2D6FB4" },
  { id: "j4", nombre: "Natalia Prieto", corto: "Natalia", color: "#0E7C7B" },
  { id: "j5", nombre: "Andrés Gómez", corto: "Andrés", color: "#9B6B12" },
];
export const jefa = (id) => JEFAS.find((x) => x.id === id);

export const EMBAJADORES = [
  { id: "e1", nombre: "Mateo Lugo", corto: "Mateo", programa: "Finanzas y Comercio Internacional", asignadas: 40, color: "#1F7A55" },
  { id: "e2", nombre: "Valentina Ospina", corto: "Valentina", programa: "Derecho", asignadas: 40, color: "#C27C0E" },
  { id: "e3", nombre: "Santiago Pardo", corto: "Santiago", programa: "Economía", asignadas: 32, color: "#2D6FB4" },
  { id: "e4", nombre: "Isabella Cárdenas", corto: "Isabella", programa: "Comunicación Social", asignadas: 40, color: "#B4402D" },
  { id: "e5", nombre: "Juan José Rincón", corto: "Juanjo", programa: "Administración de Empresas", asignadas: 24, color: "#6B4FB4" },
  { id: "e6", nombre: "Mariana Vélez", corto: "Mariana", programa: "Gobierno y Relaciones Internacionales", asignadas: 32, color: "#0E8A8A" },
];
export const embajador = (id) => EMBAJADORES.find((x) => x.id === id);

const ID = (nombre) => ACTIVIDADES.find((x) => x.nombre.startsWith(nombre)).id;
let n = 0;
const t = (embajadorId, fecha, inicio, fin, act, areaId, descripcion, companeros, jefaId, estado, extra = {}) => ({
  id: `t${++n}`,
  embajadorId, fecha, inicio, fin, actividad: ID(act), area: areaId, descripcion, companeros, jefaId, estado,
  ...extra,
});

export const TURNOS_INICIALES = [
  // Mateo
  t("e1", "2026-11-03", "08:00", "11:00", "Visitas guiadas", "pregrado", "Recorrido con 25 estudiantes del Colegio San Bartolomé: biblioteca, plazoleta y edificio de Finanzas.", ["e2"], "j1", "aprobado"),
  t("e1", "2026-11-05", "14:00", "17:30", "Actividad externadista colegios - Bogotá", "pregrado", "Charla vocacional en el Colegio Agustiniano Norte con dos cursos de grado 11.", ["e3", "e6"], "j3", "aprobado"),
  t("e1", "2026-11-07", "09:00", "13:00", "Feria del libro", "promocion", "Stand en Expoestudiante (Corferias). Entregamos 120 folletos y resolvimos dudas de becas.", ["e2", "e4"], "j2", "ajustado",
    { horasAjustadas: 3.5, nota: "El stand cerró a las 12:30, ajusté a 3 h 30 min." }),
  t("e1", "2026-11-10", "10:00", "12:00", "Llamadas de seguimiento", "pregrado", "45 llamadas a aspirantes de Finanzas que no terminaron la inscripción.", [], "j1", "aprobado"),
  t("e1", "2026-11-12", "13:00", "16:00", "Logística proceso de admisiones", "pregrado", "Recepción de aspirantes a entrevistas y guía a los salones.", ["e5"], "j1", "aprobado"),
  t("e1", "2026-11-14", "08:30", "12:30", "Logística Día Universitario", "promocion", "Registro de asistentes del Día Universitario y guía por el campus.", ["e2", "e3", "e4"], "j2", "aprobado"),
  t("e1", "2026-11-18", "15:00", "17:00", "Creación de Contenido", "promocion", "Grabación de un reel «Un día como embajador» para Instagram.", ["e4"], "j4", "aprobado"),
  t("e1", "2026-11-19", "09:00", "12:00", "Actividad externadista colegios - Bogotá", "pregrado", "Visita al Gimnasio Moderno.", ["e6"], "j3", "devuelto",
    { nota: "Falta decir con qué grado trabajaron y cuántos estudiantes asistieron." }),
  t("e1", "2026-11-21", "08:00", "11:30", "Visitas guiadas", "pregrado", "Recorrido para padres de familia, grupo de 18 personas.", ["e5"], "j1", "pendiente"),
  t("e1", "2026-11-24", "10:00", "12:00", "Charlas virtuales", "pregrado", "Charla virtual para colegios de Boyacá sobre becas y financiación.", ["e3"], "j3", "pendiente"),
  // Valentina
  t("e2", "2026-11-03", "08:00", "11:00", "Visitas guiadas", "pregrado", "Recorrido con el Colegio San Bartolomé.", ["e1"], "j1", "aprobado"),
  t("e2", "2026-11-07", "09:00", "13:00", "Feria del libro", "promocion", "Stand en Expoestudiante.", ["e1", "e4"], "j2", "aprobado"),
  t("e2", "2026-11-14", "08:30", "12:30", "Logística Día Universitario", "promocion", "Registro de asistentes del Día Universitario.", ["e1", "e3"], "j2", "aprobado"),
  t("e2", "2026-11-20", "14:00", "18:00", "Llamadas reserva", "pregrado", "Llamadas a admitidos para recordar la reserva de cupo. 60 contactos.", [], "j1", "pendiente"),
  t("e2", "2026-11-22", "09:00", "12:00", "Creación de Contenido", "promocion", "Fotos para la campaña de admisiones 2027-1.", ["e4"], "j4", "pendiente"),
  // Santiago
  t("e3", "2026-11-05", "14:00", "17:30", "Actividad externadista colegios - Bogotá", "pregrado", "Charla en el Colegio Agustiniano Norte.", ["e1", "e6"], "j3", "aprobado"),
  t("e3", "2026-11-14", "08:30", "12:30", "Logística Día Universitario", "promocion", "Guía de salones en el Día Universitario.", ["e1", "e2"], "j2", "aprobado"),
  t("e3", "2026-11-24", "10:00", "12:00", "Charlas virtuales", "pregrado", "Charla virtual para colegios de Boyacá.", ["e1"], "j3", "pendiente"),
  t("e3", "2026-11-23", "15:00", "19:00", "Eventos o actividades", "facultad", "Apoyo en la ceremonia de grados de posgrado.", [], "j5", "pendiente"),
  // Isabella
  t("e4", "2026-11-07", "09:00", "13:00", "Feria del libro", "promocion", "Stand en Expoestudiante.", ["e1", "e2"], "j2", "aprobado"),
  t("e4", "2026-11-14", "08:30", "12:30", "Logística Día Universitario", "promocion", "Fotografía del Día Universitario.", ["e1"], "j2", "aprobado"),
  t("e4", "2026-11-18", "15:00", "17:00", "Creación de Contenido", "promocion", "Reel «Un día como embajador».", ["e1"], "j4", "aprobado"),
  t("e4", "2026-11-22", "09:00", "12:00", "Creación de Contenido", "promocion", "Fotos para la campaña 2027-1.", ["e2"], "j4", "pendiente"),
  // Juanjo
  t("e5", "2026-11-12", "13:00", "16:00", "Logística proceso de admisiones", "pregrado", "Recepción de aspirantes a entrevistas.", ["e1"], "j1", "aprobado"),
  t("e5", "2026-11-21", "08:00", "11:30", "Visitas guiadas", "pregrado", "Recorrido para padres de familia.", ["e1"], "j1", "pendiente"),
  t("e5", "2026-11-16", "09:00", "11:00", "Benchmarking", "investigacion", "Comparación de becas de 6 universidades de Bogotá.", [], "j4", "pendiente"),
  // Mariana
  t("e6", "2026-11-05", "14:00", "17:30", "Actividad externadista colegios - Bogotá", "pregrado", "Charla en el Colegio Agustiniano Norte.", ["e1", "e3"], "j3", "aprobado"),
  t("e6", "2026-11-19", "09:00", "12:00", "Actividad externadista colegios - Bogotá", "pregrado", "Visita al Gimnasio Moderno, grado 10, 32 estudiantes.", ["e1"], "j3", "aprobado"),
  t("e6", "2026-11-17", "10:00", "13:00", "Organización material", "otras", "Inventario y organización de material POP para diciembre.", [], "j1", "pendiente"),
];

/* ───── Cálculos ───── */

export const aMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Horas declaradas por el embajador (fin − inicio). */
export const horasDeclaradas = (turno) => Math.max(0, aMin(turno.fin) - aMin(turno.inicio)) / 60;

/** Horas que cuentan: las ajustadas por la jefa si las hay. */
export const horasQueCuentan = (turno) =>
  turno.estado === "ajustado" ? turno.horasAjustadas : horasDeclaradas(turno);

export const formatoHoras = (h) => {
  const horas = Math.floor(h);
  const min = Math.round((h - horas) * 60);
  if (!min) return `${horas} h`;
  if (!horas) return `${min} min`;
  return `${horas} h ${min} min`;
};

export const formatoCorto = (h) => (Number.isInteger(h) ? `${h}` : h.toFixed(1).replace(".", ","));

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export const fechaLegible = (iso) => {
  const d = new Date(`${iso}T12:00:00`);
  const s = `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
  return s[0].toUpperCase() + s.slice(1);
};

export const resumen = (turnos, embajadorId) => {
  const mios = turnos.filter((x) => x.embajadorId === embajadorId);
  const sum = (estados) => mios.filter((x) => estados.includes(x.estado)).reduce((a, x) => a + horasQueCuentan(x), 0);
  return {
    aprobadas: sum(["aprobado", "ajustado"]),
    pendientes: sum(["pendiente"]),
    devueltas: mios.filter((x) => x.estado === "devuelto").length,
    turnos: mios.length,
  };
};
