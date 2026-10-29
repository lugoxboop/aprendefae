import { UMBRALES } from "./alertas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LO QUE CADA PROFESOR DECIDE: sus umbrales y qué alertas no le aplican
 *
 * DOS IDEAS PRESTADAS, LAS DOS BARATAS
 *
 *   · DE BLACKBOARD, el umbral que pone el profesor. Su panel deja fijar los
 *     tres cortes —acierto por debajo de X, días sin entrar por encima de N— y
 *     marca a quien los cruza. Lo que compra no es precisión, es confianza: un
 *     umbral que el profesor eligió es un umbral en el que cree, y una alerta
 *     en la que cree es una alerta sobre la que actúa.
 *
 *   · DE MOODLE, el «no aplica». Ante cada alerta, el docente puede aceptarla
 *     o marcarla como no aplicable. Es el único de los veinte competidores
 *     donde el profesor CORRIGE al sistema en vez de solo consumirlo, y mata
 *     de raíz la desconfianza de quien piensa «este estudiante está bien, la
 *     máquina se equivoca». En Moodle ese voto reentrena el modelo; aquí
 *     todavía no hay modelo que reentrenar, así que hace lo que sí podemos
 *     honrar: silencia esa alerta para ese estudiante y lo dice.
 *
 * POR QUÉ EN EL NAVEGADOR Y NO EN LA BASE
 * Son preferencias de UNA persona sobre SU pantalla, no datos de estudiantes.
 * Guardarlas en Supabase pediría tabla, política de acceso y migración —y las
 * migraciones las corre Mateo a mano—, para algo que no tiene por qué
 * sobrevivir a un cambio de computador. El día que haga falta que lo haga, se
 * mueve; la forma de este módulo no cambia.
 *
 * Y SE CAE CON GRACIA. En modo privado, con el almacenamiento bloqueado o con
 * la clave corrompida a mano, leer devuelve los valores de siempre y guardar
 * no hace nada. Nunca una pantalla rota por una preferencia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CLAVE = "fae.docente.preferencias.v1";

/*
 * Los límites de cada umbral. No son decoración: sin ellos, un cero en «días
 * sin entrar» pondría en rojo a la clase entera y el profesor concluiría que
 * el panel está roto, que es exactamente lo que estamos intentando evitar.
 */
export const AJUSTABLES = [
  {
    id: "diasInactividad",
    texto: "Días sin entrar para avisarme",
    min: 2,
    max: 30,
    porDefecto: UMBRALES.ciclosInactividad * UMBRALES.diasPorCiclo,
    sufijo: "días",
  },
  {
    id: "pctEvaluativaBaja",
    texto: "Acierto por debajo del cual conviene mirar",
    min: 30,
    max: 90,
    porDefecto: UMBRALES.pctEvaluativaBaja,
    sufijo: "%",
  },
];

export const POR_DEFECTO = Object.freeze({
  diasInactividad: UMBRALES.ciclosInactividad * UMBRALES.diasPorCiclo,
  pctEvaluativaBaja: UMBRALES.pctEvaluativaBaja,
  silenciados: [],
});

function entero(valor, { min, max, porDefecto }) {
  const n = Math.round(Number(valor));
  if (!Number.isFinite(n)) return porDefecto;
  return Math.min(max, Math.max(min, n));
}

/*
 * Todo lo que entra se sanea. El contenido de localStorage es texto que
 * cualquiera puede editar desde la consola del navegador, así que se trata
 * como lo que es: una entrada del exterior, no un objeto de confianza.
 */
function sanear(crudo) {
  const base = { ...POR_DEFECTO };
  if (!crudo || typeof crudo !== "object") return base;
  for (const a of AJUSTABLES) if (a.id in crudo) base[a.id] = entero(crudo[a.id], a);
  base.silenciados = Array.isArray(crudo.silenciados)
    ? crudo.silenciados.filter((s) => typeof s === "string" && s.includes("|")).slice(0, 500)
    : [];
  return base;
}

function leerTodo() {
  try {
    const crudo = globalThis.localStorage?.getItem(CLAVE);
    return crudo ? JSON.parse(crudo) : {};
  } catch {
    return {};
  }
}

function escribirTodo(todo) {
  try {
    globalThis.localStorage?.setItem(CLAVE, JSON.stringify(todo));
    return true;
  } catch {
    /* Modo privado, cuota llena o almacenamiento bloqueado: el panel sigue
     * funcionando con los valores de esta sesión y nadie ve un error. */
    return false;
  }
}

/** Las preferencias de una materia, siempre completas y siempre dentro de rango. */
export function preferenciasDe(materia) {
  return sanear(leerTodo()[materia]);
}

/** Guarda y devuelve lo que quedó guardado, saneado. */
export function guardarPreferencias(materia, parciales) {
  const todo = leerTodo();
  const nuevas = sanear({ ...preferenciasDe(materia), ...parciales });
  todo[materia] = nuevas;
  escribirTodo(todo);
  return nuevas;
}

/** La clave con la que se recuerda un «no aplica». Una sola forma, en un solo sitio. */
export const claveSilencio = (userId, diagnosticoId) => `${userId}|${diagnosticoId}`;

/** Marca o desmarca «no aplica» y devuelve las preferencias resultantes. */
export function alternarSilencio(materia, userId, diagnosticoId) {
  const prefs = preferenciasDe(materia);
  const clave = claveSilencio(userId, diagnosticoId);
  const silenciados = prefs.silenciados.includes(clave)
    ? prefs.silenciados.filter((s) => s !== clave)
    : [...prefs.silenciados, clave];
  return guardarPreferencias(materia, { silenciados });
}

/**
 * Los umbrales que debe usar el cálculo, con los del profesor encima de los
 * de la casa. Se devuelve el objeto entero y no solo lo cambiado para que
 * quien calcula no tenga que saber cuáles son ajustables.
 */
export function umbralesCon(prefs) {
  return {
    ...UMBRALES,
    pctEvaluativaBaja: prefs.pctEvaluativaBaja,
    pctBajaParaPrisa: prefs.pctEvaluativaBaja,
    diasInactividad: prefs.diasInactividad,
  };
}
