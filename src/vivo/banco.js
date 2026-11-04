import { REPASOS } from "../repaso/repasos.js";
import { ID_REPASO, ID_REPASO_CONTABILIDAD } from "../repaso/repaso.js";
import { SUBJECTS } from "../data/subjects.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * DE DÓNDE SALEN LAS PREGUNTAS DE LA CLASE EN VIVO
 *
 * De los mismos bancos del Repaso Diario: ítems de un toque, con su enunciado,
 * sus opciones y su correcta, armados leyendo el banco de cada actividad. No
 * hay una sola copia de contenido aquí. Si alguien corrige un texto en su
 * banco, la clase en vivo lo pregunta corregido.
 *
 * Es la diferencia con los diez competidores del análisis: allá el profesor
 * escribe sus preguntas; aquí elige el tema y arranca.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const REPASO_DE_MATERIA = { macroeconomia: ID_REPASO, contabilidad: ID_REPASO_CONTABILIDAD };

export const MATERIAS_EN_VIVO = Object.keys(REPASO_DE_MATERIA);

export const CANTIDADES = [5, 8, 10];
export const DURACIONES = [20, 30, 45];

const tituloDeTema = (materia, tema) => SUBJECTS[materia]?.topics?.find((t) => t.id === tema)?.title ?? tema;

/** Los temas de una materia que tienen preguntas, con cuántas hay. */
export function temasEnVivo(materia) {
  const repaso = REPASOS[REPASO_DE_MATERIA[materia]];
  if (!repaso) return [];
  return repaso.temas
    .map((tema) => ({ id: tema, titulo: tituloDeTema(materia, tema), disponibles: unidades(repaso.pool.filter((x) => x.materia === tema)).length }))
    .filter((t) => t.disponibles > 0);
}

/* Las variantes de un mismo ítem comparten clave: cuenta una sola. */
function unidades(items) {
  const vistos = new Map();
  for (const x of items) if (!vistos.has(x.clave)) vistos.set(x.clave, x);
  return [...vistos.values()];
}

function barajar(lista, azar) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Un ítem del banco, en la forma que guarda la sala: sin funciones y sin nada que no se pinte. */
export function aPregunta(item, azar = Math.random) {
  const opciones = (item.barajarOpciones ? barajar(item.opciones, azar) : item.opciones).map((o) => ({ id: String(o.id), texto: String(o.texto) }));
  const p = { clave: item.clave, enunciado: String(item.enunciado), opciones, correcta: String(item.correcta) };
  if (item.pregunta) p.pregunta = String(item.pregunta);
  if (item.rotulo) p.rotulo = String(item.rotulo);
  if (item.subtema) p.subtema = String(item.subtema);
  if (item.detalle?.texto) p.detalle = { rotulo: String(item.detalle.rotulo ?? ""), texto: String(item.detalle.texto) };
  return p;
}

/**
 * Las preguntas de una clase: `cantidad` ítems distintos del tema, al azar.
 * Se prefieren los de hasta 6 opciones —en un celular, 8 botones apretados son
 * un tablero, no una pregunta— y solo se completan con los de 8 si no alcanzan.
 */
export function armarPreguntas(materia, tema, cantidad, azar = Math.random) {
  const repaso = REPASOS[REPASO_DE_MATERIA[materia]];
  if (!repaso) return [];
  const todos = barajar(unidades(repaso.pool.filter((x) => x.materia === tema)), azar);
  const cortos = todos.filter((x) => x.opciones.length <= 6);
  const largos = todos.filter((x) => x.opciones.length > 6);
  return [...cortos, ...largos].slice(0, cantidad).map((x) => aPregunta(x, azar));
}

export { tituloDeTema };
