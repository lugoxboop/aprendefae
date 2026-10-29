import { promedioAciertos } from "./alertas.js";
import { CORTE_BAJO } from "./bandas.js";
import { contextoDeGrupo, FACTOR_LENTO, MINIMO_PARA_COMPARAR } from "./diagnosticos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ESFUERZO CONTRA RESULTADO — el único gráfico que dice algo que la lista no
 *
 * POR QUÉ ESTE Y NO UNA BARRA MÁS
 * Una lista ordenada por nota no distingue dos estudiantes que están en
 * problemas opuestos: el que le dedica horas y no entiende, y el que acierta
 * sin dedicar ninguna. Al primero no le sirve más práctica —le hace falta otra
 * explicación—; al segundo, más práctica tampoco, porque ya va demasiado
 * rápido para estar leyendo. Puestos en dos ejes, caen en esquinas distintas y
 * se ven de un vistazo. Es lo que hacen MindTap y Blackboard, y es lo único de
 * sus paneles por lo que los profesores reportan valor.
 *
 * LOS DOS ERRORES QUE NO REPETIMOS
 *
 *   · DATO QUE FALTA EN SILENCIO. La documentación de MindTap admite que los
 *     estudiantes que nunca entraron no aparecen en sus gráficos —justo los
 *     que más urge ver— y que a quien usa bloqueadores se le subcuenta el
 *     tiempo. Aquí los no medidos salen SIEMPRE, contados aparte y con su
 *     razón; «no medido» nunca se dibuja como un cero en el origen, porque
 *     un punto en el origen es una afirmación falsa sobre esa persona.
 *   · EL GRÁFICO COMO ÚNICA INTERFAZ. Anthology reconoce por escrito que el
 *     diagrama de Blackboard no funciona con lectores de pantalla; como el
 *     gráfico ES la interfaz, quien no puede leerlo pierde el panel entero.
 *     Por eso esta función devuelve filas, no coordenadas: el componente
 *     dibuja Y lista lo mismo, y la lista es la fuente.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * Los cuatro cuadrantes, con nombre de lo que le pasa a la persona y no de su
 * posición. «Arriba a la izquierda» no es un diagnóstico.
 *
 * Los cortes no se inventan: el del acierto es CORTE_BAJO, el mismo 60 que ya
 * separa teal de coral en cinco mecánicas; el del tiempo es la mediana de la
 * propia clase, porque «mucho tiempo» solo significa algo comparado con sus
 * compañeros en esta materia y no contra un número absoluto.
 */
export const CUADRANTES = {
  domina: { id: "domina", nombre: "Lo tiene", explica: "Acierta sin dedicarle más tiempo que la clase." },
  trabaja: { id: "trabaja", nombre: "Trabaja y le sale", explica: "Le dedica tiempo y le funciona." },
  atasco: { id: "atasco", nombre: "Le cuesta, no le falta esfuerzo", explica: "Dedica más tiempo que la clase y aun así falla. No necesita más práctica, necesita otra explicación." },
  prisa: { id: "prisa", nombre: "Va rápido y falla", explica: "Responde por debajo del tiempo de la clase y acierta poco: no está leyendo." },
};

/** En qué cuadrante cae alguien, dados su tiempo, su acierto y la mediana de la clase. */
export function cuadranteDe(ms, acierto, medianaMs) {
  if (ms === null || acierto === null || medianaMs === null) return null;
  const lento = ms >= medianaMs;
  const acierta = acierto >= CORTE_BAJO;
  if (acierta) return lento ? CUADRANTES.trabaja : CUADRANTES.domina;
  return lento ? CUADRANTES.atasco : CUADRANTES.prisa;
}

/** El nombre que se enseña de un estudiante, con el mismo criterio que el resto del panel. */
function nombreDe(e) {
  return e.full_name?.trim() || e.nickname?.trim() || "Sin nombre";
}

/**
 * Las filas del gráfico, las de la tabla y las que no se pueden dibujar.
 *
 * Devuelve:
 *   medidos    [{ user_id, nombre, ms, segundos, acierto, cuadrante }]
 *   noMedidos  [{ user_id, nombre, razon }]  — y la razón es distinta en cada caso
 *   medianaMs  la referencia del eje de tiempo, o null si el grupo es muy pequeño
 *   comparable si no lo es, el componente dibuja los puntos pero no los cuadrantes
 */
export function esfuerzoContraResultado(cohorte) {
  const { medianaMs, nMedidos } = contextoDeGrupo(cohorte);
  const medidos = [];
  const noMedidos = [];

  for (const e of cohorte) {
    const acierto = promedioAciertos(e);
    const bruto = e.duracion_media_ms === null || e.duracion_media_ms === undefined ? null : Number(e.duracion_media_ms);
    const ms = bruto !== null && Number.isFinite(bruto) && bruto > 0 ? bruto : null;

    /*
     * Las dos razones se separan porque piden cosas distintas del profesor:
     * a quien no ha hecho nada hay que buscarlo, y a quien solo ha hecho
     * exploratorias hay que ponerle algo que sí mida.
     */
    if (acierto === null || ms === null) {
      noMedidos.push({
        user_id: e.user_id,
        nombre: nombreDe(e),
        razon: Number(e.n_registros ?? 0) === 0 ? "Todavía no ha hecho ninguna actividad" : "Sin acierto o sin tiempo medidos",
      });
      continue;
    }

    medidos.push({
      user_id: e.user_id,
      nombre: nombreDe(e),
      ms,
      segundos: Math.round(ms / 1000),
      acierto,
      cuadrante: cuadranteDe(ms, acierto, medianaMs),
    });
  }

  return {
    medidos,
    noMedidos,
    medianaMs,
    comparable: nMedidos >= MINIMO_PARA_COMPARAR,
    factorLento: FACTOR_LENTO,
  };
}

/**
 * Cuántos hay en cada cuadrante, en el orden en que le importan al profesor:
 * primero los dos que piden algo, después los dos que no.
 */
export function porCuadrante(medidos) {
  const cuenta = new Map([
    [CUADRANTES.atasco.id, 0],
    [CUADRANTES.prisa.id, 0],
    [CUADRANTES.trabaja.id, 0],
    [CUADRANTES.domina.id, 0],
  ]);
  for (const m of medidos) if (m.cuadrante && cuenta.has(m.cuadrante.id)) cuenta.set(m.cuadrante.id, cuenta.get(m.cuadrante.id) + 1);
  return [CUADRANTES.atasco, CUADRANTES.prisa, CUADRANTES.trabaja, CUADRANTES.domina]
    .map((c) => ({ ...c, n: cuenta.get(c.id) }));
}

/** Los criterios de orden de la tabla que acompaña al gráfico. La tabla es la fuente. */
export const ORDENES = [
  { id: "acierto", texto: "Menos acierto", comparar: (a, b) => a.acierto - b.acierto || a.nombre.localeCompare(b.nombre, "es") },
  { id: "tiempo", texto: "Más tiempo", comparar: (a, b) => b.ms - a.ms || a.nombre.localeCompare(b.nombre, "es") },
  { id: "prisa", texto: "Menos tiempo", comparar: (a, b) => a.ms - b.ms || a.nombre.localeCompare(b.nombre, "es") },
  { id: "nombre", texto: "Nombre", comparar: (a, b) => a.nombre.localeCompare(b.nombre, "es") },
];

export function ordenar(medidos, ordenId) {
  const o = ORDENES.find((x) => x.id === ordenId) ?? ORDENES[0];
  return [...medidos].sort(o.comparar);
}
