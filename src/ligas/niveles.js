/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS NIVELES DE LIGA: CUÁNTOS HAY, CÓMO SE LLAMAN Y QUÉ SE DICE CADA SEMANA.
 *
 * Este archivo es la ÚNICA fuente de las tres cosas en el cliente. El nombre y
 * el mensaje salen de una sola llamada a mensajeSemanal(), con el recuento de
 * niveles que da el servidor —liga_niveles(), también única allí—. Dos sitios
 * decidiendo cuántos niveles hay es la forma de fallo que ya nos costó tres
 * incidentes, y siempre empieza igual: dos lugares que sabían lo mismo hasta
 * que dejaron de saberlo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/*
 * ═══════════ LOS UMBRALES, EN UN SOLO SITIO ═══════════
 *
 * Los mismos números que la función SQL ligas_para(), en la ÚLTIMA migración
 * que la define —hoy la 0026—. No se pueden compartir —SQL no lee JavaScript—
 * así que están duplicados a la fuerza, y por eso niveles.test.mjs busca esa
 * migración, la LEE, y falla si los dos lados dejan de coincidir.
 */
export const UMBRALES_NIVEL = {
  /* Por debajo de esto, un solo nivel: partir un grupo pequeño deja ligas de
   * cuatro personas donde el podio es casi todo el mundo. */
  unoHasta: 20,
  /* Entre unoHasta y esto, tres niveles. Desde aquí, MAX_NIVELES. */
  tresHasta: 60,
  /*
   * Aquí había `porNivel: 20`, para mantener ~20 por nivel en el tramo alto.
   * Con el techo de cuatro ya no calculaba nada: por encima de 60 la respuesta
   * es siempre cuatro. Se quitó de los dos lados en la 0026.
   */
};

/*
 * ═══════════ CUATRO ES EL TECHO. NUNCA HAY UN QUINTO NOMBRE ═══════════
 *
 * Si la adopción crece por encima de lo que cuatro niveles aguantan, los
 * grupos se hacen MÁS GRANDES —hasta 35 o 40— en vez de aparecer un nivel
 * nuevo. Un quinto obligaría a inventarle nombre, y la pregunta de nombrar se
 * reabriría en cada salto de tamaño. Con el techo, se responde una vez.
 */
export const MAX_NIVELES = 4;

/*
 * ═══════════ LOS NOMBRES, DE ABAJO ARRIBA ═══════════
 *
 * Se asignan SIEMPRE desde el nivel más bajo. Con tres niveles son Emergente,
 * Intermedio y Avanzado; Élite solo existe cuando hay cuatro. Así, abrir Élite
 * no le cambia el nombre a nadie de Intermedio ni de Emergente: cambia su
 * número de liga, no la palabra que ven.
 *
 * ═══════════ POR QUÉ "EMERGENTE" Y NO "BASE" ═══════════
 *
 * El kit de medallas tiene cuatro niveles —base, intermedio, avanzado, elite—
 * y tres se reutilizan aquí tal cual. EL MÁS BAJO NO:
 *
 *   En medallas, "Base" es un logro que CONSEGUISTE: un suelo del que se sube.
 *   En ligas, "Base" sería DÓNDE QUEDASTE respecto a compañeros que te conocen
 *   por el nombre: un suelo al que se cae.
 *
 * La misma palabra, el sentido contrario, y uno de los dos duele. "Emergente"
 * describe un momento, no un resultado — que es lo que una liga semanal es.
 */
export const NOMBRES_NIVEL = ["Emergente", "Intermedio", "Avanzado", "Élite"];

/*
 * A qué escalón del marco facetado corresponde cada nombre. Los tres que
 * comparten palabra con el kit de medallas comparten también su riqueza
 * visual; "Emergente" toma la del escalón más simple.
 */
export const RIQUEZA_NIVEL = {
  Emergente: "base",
  Intermedio: "intermedio",
  Avanzado: "avanzado",
  "Élite": "elite",
};

/** Cuántos niveles para N activos. Espeja ligas_para() del servidor, techo incluido. */
export function nivelesPara(nActivos) {
  const n = Number(nActivos);
  if (!Number.isFinite(n) || n <= 0) return 1;
  if (n < UMBRALES_NIVEL.unoHasta) return 1;
  if (n < UMBRALES_NIVEL.tresHasta) return 3;
  return MAX_NIVELES;
}

/*
 * Cuántos escalones hay por debajo de la liga `liga` cuando hay `total`: 0 es
 * Emergente, 3 es Élite. Es el índice del nombre, y es lo que hay que comparar
 * para saber si alguien subió — no el número de liga, que cambia sin moverse
 * nadie cuando se abre Élite.
 */
export function posicionDesdeAbajo(liga, total) {
  const l = Number(liga);
  const t = Number(total);
  if (!Number.isFinite(l) || !Number.isFinite(t) || l < 1 || l > t) return null;
  return t - l;
}

/**
 * El nombre del nivel `liga` (1 = el de arriba, como en la base) cuando hay
 * `total` niveles.
 *
 * DEVUELVE null CON UN SOLO NIVEL, y no es un caso borde olvidado: es la
 * decisión. Un nombre implica algo con qué compararse, y con un solo grupo no
 * lo hay.
 */
export function nombreDeNivel(liga, total) {
  const t = Number(total);
  if (!Number.isFinite(t) || t <= 1) return null;
  const pos = posicionDesdeAbajo(liga, t);
  if (pos === null) return null;
  return NOMBRES_NIVEL.slice(0, Math.min(t, MAX_NIVELES))[pos] ?? null;
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL MENSAJE SEMANAL
 *
 * ═══════════ NUNCA SILENCIO, NUNCA DIRECCIONAL ═══════════
 *
 * EL NOMBRE YA ANUNCIA EL DESCENSO. Quien leyó "Avanzado" la semana pasada y
 * hoy lee "Intermedio" sabe qué pasó, diga el sistema lo que diga. Así que
 * siempre hay mensaje, y lo que cambia es cuánto dice:
 *
 *   subió          el mensaje de siempre, más una línea que lo reconoce.
 *   bajó           el mensaje de siempre, entero, sin capa extra.
 *   se mantuvo     el mensaje de siempre.
 *   CAMBIÓ DE NIVEL SIN SUBIR NI BAJAR — el cuarto caso, y el nuevo. Es la
 *                  semana en que el grupo se reparte por primera vez: nadie se
 *                  movió, pero todos quedaron en un nivel con nombre. Lleva su
 *                  propio texto, el mismo para todos salvo el corchete.
 *
 * Y la apertura de Élite, que no es un cuarto caso para todos: solo para quien
 * estaba en Avanzado. Intermedio y Emergente no se enteran de nada distinto.
 *
 * La posición exacta ("#14 de 17") se enseña SIEMPRE, en el tablero. Evitar
 * que el sistema declare un fracaso no es lo mismo que esconder información.
 *
 * ═══════════ LAS TRANSICIONES LAS DICE EL SERVIDOR ═══════════
 *
 * Quién vivió un reparto o la apertura de Élite está en liga_reparto, y llega
 * como `transicion`. No se deduce aquí comparando niveles: un estudiante que
 * entra a mitad de la semana del reparto también ve tres niveles donde antes
 * había uno, y no fue repartido — entró por el medio. Si viera "quedaste en X
 * según tu ciclo más reciente", el texto le mentiría.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const TRANSICION = { REPARTO: "reparto", ELITE: "elite" };

export const TIPO_MENSAJE = {
  SIN_NIVELES: "sin-niveles",
  REPARTO: "reparto",
  ELITE: "elite",
  NORMAL: "normal",
};

export const TEXTO_SIN_NIVELES = "Se reparte cada semana según los FP del ciclo.";
export const TEXTO_BASE = "Se reordena cada lunes según los FP que sumes.";

/*
 * EL CUARTO CASO, texto de Xeno. Con UN cambio respecto a su borrador: él
 * escribió "Ya son 20 estudiantes activos", con el número literal. Aquí [N] sale
 * del dato —los activos que decidieron el reparto, guardados en liga_ciclo—,
 * porque si el cruce ocurre con 23, o si el umbral se mueve, "20" mentiría. Las
 * dos apariciones son el mismo valor.
 */
export function textoReparto({ activos, nombre }) {
  return (
    `Ya son ${activos} estudiantes activos en tu materia — momento de organizarse ` +
    `en grupos más chicos para competir entre pares más cercanos, no entre ${activos} ` +
    `personas a la vez. Esta semana quedaste en ${nombre} según tu ciclo más reciente. ` +
    `No subiste ni bajaste — es la primera vez que hay grupos distintos aquí, y cada ` +
    `quien entró según cómo le fue la última semana. Desde la próxima, el ascenso y ` +
    `descenso funcionan como ya los conoces.`
  );
}

/* La apertura de Élite, texto de Xeno. Solo lo lee quien estaba en Avanzado. */
export const TEXTO_ELITE =
  "La comunidad de esta materia creció lo suficiente para abrir un nuevo nivel: Élite. " +
  "Quienes tuvieron el mejor ciclo dentro de Avanzado esta semana pasan a Élite. " +
  "Si no fue tu caso, sigues en Avanzado — desde la próxima semana, subir y bajar de " +
  "Élite funciona como cualquier otro nivel.";

const esConteo = (v) => Number.isInteger(v) && v > 0;

/**
 * Qué se le dice a este estudiante esta semana.
 *
 * Devuelve:
 *   tipo      TIPO_MENSAJE: sin-niveles, reparto, elite o normal.
 *   nombre    el del nivel, o null cuando hay un solo nivel.
 *   rotulo    el sobretítulo pequeño. Solo cuando hay nombre: una palabra
 *             como "Emergente" no puede aparecer sola sin decir de qué es.
 *   titulo    lo que va en la cabecera grande.
 *   base      el texto de la semana. NUNCA vacío: esa es la regla entera.
 *   ascenso   la capa extra, y solo hacia arriba y en semanas normales.
 */
export function mensajeSemanal({
  liga,
  totalNiveles,
  ligaAnterior = null,
  nivelesAnterior = null,
  transicion = null,
  activosReparto = null,
}) {
  const total = Number(totalNiveles);
  const nombre = nombreDeNivel(liga, total);

  if (!(total > 1) || !nombre) {
    /*
     * HOY. Un solo grupo, así que no hay nombre que dar y el texto es el
     * genérico: explica el mecanismo sin prometer una jerarquía que no existe.
     */
    return {
      tipo: TIPO_MENSAJE.SIN_NIVELES,
      nombre: null,
      rotulo: null,
      titulo: "Tu grupo esta semana",
      base: TEXTO_SIN_NIVELES,
      ascenso: null,
    };
  }

  const comun = { nombre, rotulo: "TU GRUPO ESTA SEMANA", titulo: nombre };

  if (transicion === TRANSICION.REPARTO) {
    /*
     * Sin un conteo válido no se escribe el texto: un "Ya son null
     * estudiantes" o un número inventado serían peores que el mensaje normal.
     * El servidor siempre lo guarda en un reparto; esto es la red.
     */
    if (esConteo(activosReparto)) {
      return {
        ...comun,
        tipo: TIPO_MENSAJE.REPARTO,
        base: textoReparto({ activos: activosReparto, nombre }),
        ascenso: null,
      };
    }
  }

  if (transicion === TRANSICION.ELITE) {
    return { ...comun, tipo: TIPO_MENSAJE.ELITE, base: TEXTO_ELITE, ascenso: null };
  }

  /*
   * ═══════════ SUBIR SE MIDE DESDE ABAJO, NO POR NÚMERO ═══════════
   *
   * La semana que se abre Élite, Intermedio pasa de la liga 2 a la 3 sin
   * moverse. Comparando números parecería que bajó; comparando la posición
   * desde abajo —el índice del nombre— sigue igual, que es lo cierto.
   *
   * Sin niveles_anterior —un servidor todavía en la 0025— se supone que la
   * semana pasada había los mismos niveles que hoy, que es lo que se hacía
   * antes de la 0026.
   *
   * ═══════════ Y NO HAY CAPA DE DESCENSO ═══════════
   *
   * Porque el nombre ya lo dijo. Quien bajó recibe el mismo mensaje base que
   * todo el mundo, y su puesto exacto sigue a la vista. Lo que no hay es una
   * frase que exista únicamente para quien bajó: una frase así se delata sola.
   */
  const totalAntes = nivelesAnterior === null || nivelesAnterior === undefined ? total : Number(nivelesAnterior);
  const ahora = posicionDesdeAbajo(liga, total);
  const antes = totalAntes > 1 ? posicionDesdeAbajo(ligaAnterior, totalAntes) : null;
  const subio = ahora !== null && antes !== null && ahora > antes;

  return {
    ...comun,
    tipo: TIPO_MENSAJE.NORMAL,
    base: TEXTO_BASE,
    ascenso: subio ? `Subiste a ${nombre} esta semana.` : null,
  };
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL DÍA OCHO, Y POR QUÉ YA NO LLEVA MENSAJE PROPIO
 *
 * La primera versión de este archivo tenía una fase "primer cierre" con texto
 * propio para el lunes ocho. Existía por una premisa del diseño de entonces: el
 * día del estreno TODOS entraban a Intermedio, y una semana después, en la
 * primera reordenación, la palabra "Emergente" aparecía por primera vez. Ese
 * lunes necesitaba una explicación, dicha a todos para no señalar a nadie.
 *
 * La partición de Xeno cambió la premisa. Ya no hay un estreno con todos
 * iguales: el grupo se reparte el primer día por el ciclo más reciente, y
 * "Emergente" aparece ESE día, con el texto del cuarto caso explicándolo. Ese
 * mismo texto termina diciendo que desde la semana siguiente el ascenso y
 * descenso funcionan como siempre.
 *
 * Así que el mensaje del día ocho perdió su razón de ser, y la primera frase
 * —"Primera semana con grupos repartidos"— habría pasado a ser falsa: la
 * primera semana repartida es la del reparto. Se quitó. El lunes ocho es un
 * lunes normal, que es lo que el propio texto del reparto promete.
 * ═══════════════════════════════════════════════════════════════════════════
 */
