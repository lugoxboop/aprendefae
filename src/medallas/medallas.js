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
/*
 * ═══════ LAS QUE ENTRARON DESPUÉS (decisión de Mateo, 19-oct-2026) ═══════
 *
 * Esta medalla se deriva al leer, y eso tiene un filo: el día que se declara
 * una actividad nueva, el total sube y quien ya la tenía la pierde esa misma
 * noche, sin haber hecho nada. No es hipotético — se midió antes de agregar
 * las tres de Política Monetaria, y por eso esta lista existe.
 *
 * La regla decidida: quien ya la ganó la CONSERVA; quien todavía no, necesita
 * el total nuevo. Se puede cumplir sin guardar ni una fila y sin tocar ningún
 * dato de estudiantes, porque «ya la tenía» se deduce de lo que la base ya
 * sabe: haber completado todos los juegos que existían ANTES. Eso es
 * exactamente el total de hoy menos las que están aquí.
 *
 * QUIEN AGREGUE UNA ACTIVIDAD A UNA MATERIA CON ESTUDIANTES TIENE QUE
 * AÑADIRLA AQUÍ, con su fecha. Si no lo hace, le quita la medalla a quien se
 * la ganó, y se la quita en silencio. Los ids son únicos en toda la app, así
 * que una sola lista alcanza; para las materias sin añadidos esta lista está
 * vacía y el cálculo es, línea por línea, el de siempre.
 */
const AGREGADAS_DESPUES = new Set([
  /* 19-oct-2026 · los tres instrumentos de Política Monetaria (Célula A). */
  "la-tasa-que-muerde",
  "repo-o-definitiva",
  "el-freno-del-encaje",
]);

/*
 * ═══════ LAS QUE SALIERON (retiro de Macroeconomía, 22-nov-2026) ═══════
 *
 * El filo de arriba, al revés: el 22-nov-2026 Macroeconomía se retiró entera
 * para rehacerla desde cero (0258), y su total de hoy es cero. Con la regla de
 * arriba sola, «Macroeconomía al día» se le apagaría a todo el que la ganó.
 *
 * Misma regla, mismo método: quien la ganó la CONSERVA, y se deduce de lo que
 * la base ya sabe. Aquí están los juegos con los que se ganaba ANTES del
 * retiro —los 54 que había antes de los tres de arriba, que con estos daban
 * los 57—, y fp_history los sigue guardando: el retiro es blando y no borra
 * filas. Quien los tiene todos, la conserva.
 *
 * Cuando el Macro nuevo declare sus actividades, quien no la tenía necesitará
 * el total nuevo, como siempre.
 */
const GANADAS_ANTES_DEL_RETIRO = {
  macroeconomia: [
    /* Demanda Agregada */
    "memorama-corazon", "cual-componente", "electrocardiograma", "termometro-reacciones", "banco-transfusiones", "biopsia-economica",
    "triage-emergencias", "cirugia-reconstruccion", "sala-monitores", "quien-beneficia-auge", "explica-paciente", "sala-espera-llena",
    /* Política Económica */
    "memorama-tesoro", "que-rama-es", "diagnostico-en-vivo", "arma-grupo-logico", "quien-gana-quien-pierde", "corriente-titulares",
    "explica-la-politica", "tablero-decisiones", "simulador-de-crisis", "se-acerca-o-se-aleja", "expediente-gabinete", "consejo-ministros",
    /* Política Fiscal */
    "memorama-tesoreria", "cobra-gasta-o-pide", "clasificador-tesoro", "directos-indirectos", "flujo-de-caja", "agujero-fiscal",
    "expansiva-contractiva", "disena-presupuesto", "deficit-vs-deuda", "quien-afecta-ajuste", "explica-contribuyente", "comite-presupuesto",
    /* Política Monetaria */
    "memorama-banco-central", "quien-decide-esto", "en-que-talla-va", "volante-de-la-tasa", "caja-de-herramientas", "crea-o-cambia-de-manos",
    "a-quien-le-pega-la-tasa", "las-dos-entradas", "que-toco-el-banco", "cadena-de-transmision", "por-cual-arteria-entra",
    "explicaselo-a-un-deudor", "corriente-de-decisiones", "el-rezago", "la-escalera-del-encaje", "dilema-banquero-central",
    "duelo-de-instrumentos", "disena-respuesta-monetaria",
  ],
};

function materiaCompleta(hechasPorMateria) {
  return Object.values(SUBJECTS).map((materia) => {
    const necesarias = materia.topics.flatMap((t) => actividadesDeTipo(t, HACER)).map((a) => a.id);
    const hechas = hechasPorMateria[materia.id] ?? new Set();
    const cuantas = necesarias.filter((id) => hechas.has(id)).length;
    const completa = necesarias.length > 0 && cuantas === necesarias.length;

    /*
     * Las que había antes de los añadidos. Si el estudiante las tiene todas,
     * la medalla ya era suya y se queda, aunque hoy el total sea mayor.
     */
    const antes = necesarias.filter((id) => !AGREGADAS_DESPUES.has(id));
    const delRetiro = GANADAS_ANTES_DEL_RETIRO[materia.id] ?? [];
    const ganadaAntesDelRetiro = delRetiro.length > 0 && delRetiro.every((id) => hechas.has(id));
    const yaEraSuya = (antes.length > 0 && antes.every((id) => hechas.has(id))) || ganadaAntesDelRetiro;
    const nuevas = necesarias.length - antes.length;

    return {
      codigo: `materia-completa-${materia.id}`,
      familia: "materia",
      titulo: `${materia.name} al día`,
      /*
       * A quien la conserva no se le dice que completó 26, porque no es
       * verdad: se le dice con cuántas la ganó y cuántas entraron luego. La
       * medalla no se discute; la cifra tampoco se falsea.
       */
      descripcion: completa || !yaEraSuya
        ? `Completaste los ${necesarias.length} juegos que dan FP de ${materia.name}.`
        : ganadaAntesDelRetiro && !(antes.length > 0 && antes.every((id) => hechas.has(id)))
          ? `La ganaste con los ${delRetiro.length} juegos que daban FP de ${materia.name} antes de que se rehiciera.`
          : `La ganaste con los ${antes.length} juegos que daban FP de ${materia.name}. Después entraron ${nuevas} más.`,
      rareza: "media",
      subject_id: materia.id,
      obtenida: completa || yaEraSuya,
      /*
       * Mientras la materia retirada no tenga actividades nuevas, la barra
       * cuenta contra los juegos de antes del retiro: un «0 de 0» no le dice
       * nada a nadie, y menos a quien la ganó.
       */
      progreso: necesarias.length === 0 && delRetiro.length > 0 ? delRetiro.filter((id) => hechas.has(id)).length : cuantas,
      meta: necesarias.length === 0 && delRetiro.length > 0 ? delRetiro.length : necesarias.length,
    };
  });
}

/* Se exporta para la prueba: lo que hay que poder comprobar es la regla, no la consulta. */
export { materiaCompleta, AGREGADAS_DESPUES, GANADAS_ANTES_DEL_RETIRO };

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
