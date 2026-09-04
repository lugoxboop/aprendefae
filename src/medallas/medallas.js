import { supabase } from "../lib/supabase.js";
import { SUBJECTS, HACER, actividadesDeTipo } from "../data/subjects.js";

/*
 * Medallas del perfil.
 *
 * Casi todas las calcula la base al vuelo, sin tabla de "medallas ganadas": si
 * el criterio cambia, cambia la función y todo el mundo queda recalculado, en
 * vez de arrastrar filas otorgadas con una regla vieja.
 *
 * La excepción es "Materia completa", que se arma aquí porque depende de
 * cuántas actividades tiene cada materia, y eso vive en subjects.js. Copiar ese
 * catálogo a SQL sería tener dos verdades que se separan la primera vez que Gen
 * añada una actividad.
 */

export const RAREZAS = {
  "baja-media": { etiqueta: "Poco común", orden: 1 },
  media: { etiqueta: "Media", orden: 2 },
  alta: { etiqueta: "Alta", orden: 3 },
  "muy-alta": { etiqueta: "Muy alta", orden: 4 },
};

/*
 * "Materia completa" mide la mitad HACER. La mitad Aprender no se puede exigir
 * porque hoy no se registra en ninguna parte: las actividades de material no
 * otorgan FP y por tanto no dejan rastro en fp_history. Registrarlas es un
 * mecanismo nuevo —y una decisión de privacidad— que no se toma de paso aquí.
 * El título lo dice sin letra pequeña.
 */
function materiaCompleta(hechasPorMateria) {
  return Object.values(SUBJECTS).map((materia) => {
    const necesarias = materia.topics.flatMap((t) => actividadesDeTipo(t, HACER)).map((a) => a.id);
    const hechas = hechasPorMateria[materia.id] ?? new Set();
    const cuantas = necesarias.filter((id) => hechas.has(id)).length;

    return {
      codigo: `materia-completa-${materia.id}`,
      familia: "materia",
      titulo: `${materia.name} al día`,
      descripcion: `Completaste los ${necesarias.length} juegos que dan FP de ${materia.name}.`,
      rareza: "media",
      subject_id: materia.id,
      obtenida: necesarias.length > 0 && cuantas === necesarias.length,
      progreso: cuantas,
      meta: necesarias.length,
    };
  });
}

/** Todas las medallas del estudiante, ganadas y por ganar. */
export async function cargarMedallas() {
  if (!supabase) return { medallas: [], error: "sin-configuracion" };

  const [{ data: base, error: e1 }, { data: hechas, error: e2 }] = await Promise.all([
    supabase.rpc("medallas"),
    supabase.rpc("actividades_hechas"),
  ]);

  if (e1 || e2) {
    return { medallas: [], error: (e1 || e2).message };
  }

  const porMateria = {};
  for (const f of hechas ?? []) {
    (porMateria[f.subject_id] ??= new Set()).add(f.activity_id);
  }

  const todas = [...(base ?? []), ...materiaCompleta(porMateria)];

  /* Primero las ganadas, y dentro de cada grupo por rareza descendente. */
  todas.sort((a, b) => {
    if (a.obtenida !== b.obtenida) return a.obtenida ? -1 : 1;
    const ra = RAREZAS[b.rareza]?.orden ?? 0;
    const rb = RAREZAS[a.rareza]?.orden ?? 0;
    return ra - rb;
  });

  return { medallas: todas, error: null };
}
