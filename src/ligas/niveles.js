/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS NIVELES DE LIGA: CUÁNTOS HAY, CÓMO SE LLAMAN Y QUÉ SE DICE CADA SEMANA.
 *
 * Este archivo es la ÚNICA fuente de las tres cosas. El nombre y el mensaje
 * salen del mismo recuento de niveles, calculado aquí una vez: dos sitios
 * decidiendo cuántos niveles hay es la forma de fallo que ya nos costó tres
 * incidentes —el ×100, las dos firmas vivas, la columna ambigua— y siempre
 * empieza igual, con dos lugares que sabían lo mismo hasta que dejaron de
 * saberlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * ═══════════ LOS UMBRALES, EN UN SOLO SITIO ═══════════
 *
 * Los mismos números que la función SQL ligas_para() de la migración 0006. No
 * se pueden compartir —SQL no lee JavaScript— así que están duplicados a la
 * fuerza, y por eso niveles.test.mjs LEE la migración y falla si los dos lados
 * dejan de coincidir. Es la misma disciplina que bandas.js con la 0021.
 *
 * Para moverlos: cambiar aquí, cambiar en una migración nueva, y la prueba
 * confirma que los dos cambiaron.
 */
export const UMBRALES_NIVEL = {
  /* Por debajo de esto, un solo nivel: partir un grupo pequeño deja ligas de
   * cuatro personas donde el podio es casi todo el mundo. */
  unoHasta: 20,
  /* Entre unoHasta y esto, tres niveles. */
  tresHasta: 60,
  /* Por encima, se mantiene ~este tamaño por nivel mientras quepa. */
  porNivel: 20,
};

/*
 * ═══════════ CUATRO ES EL TECHO. NUNCA HAY UN QUINTO NOMBRE ═══════════
 *
 * Si la adopción crece por encima de lo que cuatro niveles de ~25 personas
 * aguantan, los grupos se hacen MÁS GRANDES —hasta 35 o 40— en vez de aparecer
 * un nivel nuevo.
 *
 * Es deliberado y vale la pena entender por qué: un quinto nivel obligaría a
 * inventarle nombre, y el problema de nombrar se reabriría en cada salto de
 * tamaño. Con el techo puesto, la pregunta se responde una vez.
 */
export const MAX_NIVELES = 4;

/*
 * ═══════════ LOS NOMBRES, DE ABAJO ARRIBA ═══════════
 *
 * Se asignan SIEMPRE desde el nivel más bajo. Con tres niveles activos son
 * Emergente, Intermedio y Avanzado; Élite solo existe cuando hay cuatro. Al
 * revés —repartir desde arriba— dejaría a alguien en "Emergente" un día y en
 * "Intermedio" al siguiente sin haber cambiado nada, solo porque el grupo
 * creció.
 *
 * ═══════════ POR QUÉ "EMERGENTE" Y NO "BASE" ═══════════
 *
 * El kit de medallas tiene cuatro niveles —base, intermedio, avanzado, elite—
 * y tres de ellos se reutilizan aquí tal cual. EL MÁS BAJO NO, y la razón hay
 * que dejarla escrita porque la coincidencia invita a reutilizarlo:
 *
 *   En medallas, "Base" es un logro que CONSEGUISTE: la primera racha, el
 *   primer top 10. Es un suelo del que se sube.
 *
 *   En ligas, "Base" sería DÓNDE QUEDASTE respecto a compañeros que te conocen
 *   por el nombre. Es un suelo al que se cae.
 *
 * La misma palabra, el sentido contrario, y uno de los dos duele. "Emergente"
 * describe un momento, no un resultado — que es lo que una liga semanal es.
 */
export const NOMBRES_NIVEL = ["Emergente", "Intermedio", "Avanzado", "Élite"];

/*
 * A qué escalón del marco facetado corresponde cada nombre. Los tres que
 * comparten palabra con el kit de medallas comparten también su riqueza
 * visual; "Emergente" toma la del escalón más simple, que es el que le
 * corresponde por posición.
 */
export const RIQUEZA_NIVEL = {
  Emergente: "base",
  Intermedio: "intermedio",
  Avanzado: "avanzado",
  "Élite": "elite",
};

/**
 * Cuántos niveles para N estudiantes activos.
 *
 * Espeja ligas_para() de la 0006 con UNA diferencia deliberada: aquí hay techo.
 * La función SQL puede devolver cinco, seis o diez; esta nunca pasa de cuatro.
 * Mientras el servidor no tenga el mismo techo, un despliegue con más de ~80
 * activos produciría ligas sin nombre — está anotado como pendiente y la
 * prueba de coherencia lo marca.
 */
export function nivelesPara(nActivos) {
  const n = Number(nActivos);
  if (!Number.isFinite(n) || n <= 0) return 1;
  if (n < UMBRALES_NIVEL.unoHasta) return 1;
  if (n < UMBRALES_NIVEL.tresHasta) return 3;
  return Math.min(MAX_NIVELES, Math.max(4, Math.ceil(n / UMBRALES_NIVEL.porNivel)));
}

/**
 * El nombre del nivel `liga` (1 = el de arriba, como en la base) cuando hay
 * `total` niveles activos.
 *
 * DEVUELVE null CON UN SOLO NIVEL, y no es un caso borde olvidado: es la
 * decisión. Un nombre implica algo con qué compararse, y con un solo grupo no
 * lo hay. Quien llama tiene que tratar el null como "aquí no va nombre", no
 * como "algo falló".
 */
export function nombreDeNivel(liga, total) {
  const t = Number(total);
  const l = Number(liga);
  if (!Number.isFinite(t) || !Number.isFinite(l)) return null;
  if (t <= 1) return null;
  if (l < 1 || l > t) return null;

  const usados = NOMBRES_NIVEL.slice(0, Math.min(t, MAX_NIVELES));
  /* liga 1 es la de arriba; los nombres se reparten desde abajo. */
  const desdeAbajo = t - l;
  return usados[desdeAbajo] ?? null;
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MENSAJE SEMANAL
 *
 * ═══════════ NUNCA SILENCIO, NUNCA DIRECCIONAL ═══════════
 *
 * El hallazgo que ordena todo esto: EL NOMBRE YA ANUNCIA EL DESCENSO. Quien
 * leyó "Avanzado" la semana pasada y hoy lee "Intermedio" sabe perfectamente
 * qué pasó, diga el sistema lo que diga.
 *
 * Así que la respuesta no es callar cuando alguien baja. Es que SIEMPRE hay
 * mensaje, y lo que cambia es cuánto dice:
 *
 *   · base       todas las semanas, para todos. Habla del grupo actual y de
 *                qué hacer, nunca de comparar.
 *   · ascenso    encima del base, una línea que lo reconoce y una flecha.
 *   · descenso   el base entero, sin capa extra. El sistema no declara
 *                "bajaste", pero tampoco hace como si no hubiera pasado nada.
 *
 * Y la posición exacta se enseña SIEMPRE. Evitar que el sistema declare un
 * fracaso no es lo mismo que esconder información real, y confundir las dos
 * cosas convierte el cuidado en opacidad.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * En qué momento de la vida de las ligas estamos. Se deduce del dato —cuántos
 * ciclos llevan ya con más de un nivel— y no de una bandera que alguien tenga
 * que acordarse de encender.
 *
 *   "sin-niveles"  un solo grupo. Hoy.
 *   "estreno"      el primer ciclo con varios niveles: todos entraron juntos.
 *   "primer-cierre" el segundo. Es el lunes en que se reordena por primera vez.
 *   "normal"       de ahí en adelante.
 */
export const FASE = {
  SIN_NIVELES: "sin-niveles",
  ESTRENO: "estreno",
  PRIMER_CIERRE: "primer-cierre",
  NORMAL: "normal",
};

export function faseDe({ totalNiveles, ciclosConNiveles }) {
  if (Number(totalNiveles) <= 1) return FASE.SIN_NIVELES;
  const c = Number(ciclosConNiveles);
  if (c <= 1) return FASE.ESTRENO;
  if (c === 2) return FASE.PRIMER_CIERRE;
  return FASE.NORMAL;
}

/**
 * Qué se le dice a este estudiante esta semana.
 *
 * Devuelve { titulo, base, ascenso } — `ascenso` es null salvo que haya subido.
 * `titulo` es lo que va en la cabecera: el nombre del nivel, o el texto
 * genérico cuando no hay nombre que dar.
 */
/**
 * Qué se le dice a este estudiante esta semana.
 *
 * Devuelve:
 *   nombre    el del nivel, o null cuando hay un solo nivel.
 *   rotulo    el sobretítulo pequeño. Solo cuando hay nombre: una palabra
 *             como "Emergente" no puede aparecer sola sin decir de qué es.
 *   titulo    lo que va en la cabecera grande.
 *   base      la línea de siempre. NUNCA null: esa es la regla entera.
 *   ascenso   la capa extra, y solo hacia arriba. null el resto de semanas.
 */
export function mensajeSemanal({ liga, totalNiveles, ciclosConNiveles, ligaAnterior = null }) {
  const nombre = nombreDeNivel(liga, totalNiveles);
  const fase = faseDe({ totalNiveles, ciclosConNiveles });

  if (fase === FASE.SIN_NIVELES) {
    /*
     * HOY. Un solo grupo, así que no hay nombre que dar y el texto es el
     * genérico. La frase es la que ya estaba: explica el mecanismo sin
     * prometer una jerarquía que todavía no existe.
     */
    return {
      nombre: null,
      rotulo: null,
      titulo: "Tu grupo esta semana",
      base: "Se reparte cada semana según los FP del ciclo.",
      ascenso: null,
      fase,
    };
  }

  const comun = { nombre, rotulo: "TU GRUPO ESTA SEMANA", titulo: nombre, fase };

  if (fase === FASE.ESTRENO) {
    /*
     * El día que los nombres se encienden. Todos entran al mismo nivel a la
     * vez, así que el mensaje habla de la comunidad y no de la persona: nadie
     * amanece abajo sin haber hecho nada distinto.
     */
    return {
      ...comun,
      base: "Ya son suficientes para competir por grupos. Todos empiezan aquí esta semana.",
      ascenso: null,
    };
  }

  if (fase === FASE.PRIMER_CIERRE) {
    /*
     * EL DÍA OCHO. Ver la nota larga al final del archivo: este texto va para
     * TODOS, no solo para quien bajó, y por eso no señala a nadie.
     */
    return {
      ...comun,
      base:
        "Primera semana con grupos repartidos. Se reordenan cada lunes según los FP: " +
        "subir y bajar es el ritmo normal, no un resultado.",
      ascenso: null,
    };
  }

  /*
   * ═══════════ POR QUÉ NO HAY CAPA DE DESCENSO ═══════════
   *
   * Porque el nombre ya lo dijo. Quien leyó "Avanzado" el lunes pasado y hoy
   * lee "Intermedio" no necesita que además se lo anuncien; añadir la línea
   * solo agrega la voz del sistema a un hecho que la persona ya vio.
   *
   * Y no es silencio: recibe el mismo mensaje base que todo el mundo, y su
   * puesto exacto sigue a la vista más abajo. Lo que no hay es una frase que
   * exista únicamente para quien bajó — una frase así se delata sola.
   */
  const subio =
    ligaAnterior !== null && ligaAnterior !== undefined && Number(liga) < Number(ligaAnterior);

  return {
    ...comun,
    base: "Se reordena cada lunes según los FP que sumes.",
    ascenso: subio ? `Subiste a ${nombre} esta semana.` : null,
  };
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL DÍA OCHO, Y POR QUÉ SE RESUELVE CON MENSAJE Y NO CON EXCEPCIÓN
 *
 * El encargo diseñó el día uno —todos entran a Intermedio, mensaje de
 * bienvenida— y dejó abierto el día ocho: el lunes siguiente se reordena, el
 * último baja a "Emergente", y esa palabra aparece por primera vez siete días
 * después de que a todos se les dijera que empezaban iguales.
 *
 * Se consideraron las tres salidas:
 *
 *   1. NO DESCENDER EL PRIMER CICLO. Descartada, y no por blanda: no funciona.
 *      En el estreno TODOS están en Intermedio y los otros dos niveles están
 *      vacíos. Si solo se sube, Emergente sigue vacío y la estructura no se
 *      forma; la palabra no desaparece, aparece una semana más tarde y ya sin
 *      el "acabamos de empezar" que la explicaba. Se aplaza el problema a un
 *      momento con MENOS contexto, no se resuelve.
 *
 *   2. NADA ESPECIAL. Descartada: es el primer uso de la palabra y no hay
 *      todavía ninguna experiencia de "esto se mueve cada lunes" que la
 *      amortigüe. El mensaje semanal normal —"sigue completando actividades
 *      para mantenerte aquí"— leído desde el último puesto una semana después
 *      de "empiezas igual que todos" se lee como un cambio de trato.
 *
 *   3. UN MENSAJE PROPIO ESE CICLO. Es la elegida.
 *
 * Y la parte que la hace funcionar: EL MENSAJE VA PARA TODOS, no solo para
 * quien bajó. Un texto de consuelo que solo ve el último anuncia por sí mismo
 * que es el último — el mismo error que el sistema evita al no declarar
 * descensos. Dicho a todo el grupo, explica el mecanismo sin señalar a nadie.
 *
 * Dura exactamente un ciclo. Al tercero, el mensaje normal.
 * ═══════════════════════════════════════════════════════════════════════════
 */
