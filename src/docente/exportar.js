import { promedioAciertos, alertasDe } from "./alertas.js";
import { SUBJECTS } from "../data/subjects.js";

/*
 * Exportar el informe del periodo a CSV.
 *
 * CSV y no PDF a propósito: el informe de KPI del kit comercial se arma en una
 * hoja de cálculo, y un CSV entra ahí de una. Un PDF habría que volver a
 * teclearlo.
 *
 * Se exporta lo que el docente está viendo —su grupo, su materia, su periodo—,
 * no toda la base: el archivo tiene que poder explicarse solo.
 */

const COLUMNAS = [
  "Nombre",
  "Apodo",
  "En mi grupo",
  "FP total",
  "FP del ciclo",
  "Última actividad",
  "Días inactivo",
  "Actividades distintas",
  "% evaluativas",
  "N evaluativas",
  "% exploratorias",
  "N exploratorias",
  "% global",
  "Duración media (s)",
  "Alertas",
];

/* Comillas dobles y separador de campo: lo mínimo para que Excel no lo rompa. */
function celda(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const pct = (v) => (v === null || v === undefined ? "" : Math.round(Number(v) * 100));
const fecha = (v) => (v ? new Date(v).toISOString().slice(0, 10) : "");

export function csvDelPanel(estudiantes, subjectId) {
  const filas = estudiantes.map((e) => [
    e.full_name ?? "",
    e.nickname,
    e.en_mi_grupo ? "sí" : "no",
    e.fp_total,
    e.fp_ciclo,
    fecha(e.ultima_actividad),
    e.dias_inactivo,
    (e.actividades ?? []).length,
    pct(e.pct_evaluativa),
    e.n_evaluativas,
    pct(e.pct_exploratoria),
    e.n_exploratorias,
    pct(promedioAciertos(e)),
    e.duracion_media_ms === null ? "" : Math.round(Number(e.duracion_media_ms) / 1000),
    alertasDe(e).map((a) => a.titulo).join(" · "),
  ]);

  const encabezado = [
    `# AprendeFAE — ${SUBJECTS[subjectId]?.name ?? subjectId}`,
    `# Generado el ${new Date().toLocaleDateString("es-CO")}`,
    `# ${estudiantes.length} estudiantes en el informe`,
  ];

  return [
    ...encabezado,
    COLUMNAS.map(celda).join(";"),
    ...filas.map((f) => f.map(celda).join(";")),
  ].join("\n");
}

/** Descarga el CSV. El BOM es lo que hace que Excel respete las tildes. */
export function descargarCsv(texto, nombre) {
  const blob = new Blob(["﻿" + texto], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
