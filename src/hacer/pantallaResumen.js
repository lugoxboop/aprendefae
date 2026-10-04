/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PANTALLA DE RESUMEN AL CERRAR UNA ACTIVIDAD — reglas y textos.
 *
 * SOLO PRESENTACIÓN. Nada de aquí calcula ni guarda puntos, progreso ni
 * ranking: lee lo que la partida ya entregó (porcentaje y detalle), los
 * puntos y la repetición del MISMO aviso que pinta «+N FP» / «Ya completada»,
 * y el porcentaje que guardó el servidor. Si un número no está ahí, o no es
 * un número que se pueda enseñar, la pantalla no sale: sale el cierre de
 * siempre (ver la salvaguarda, más abajo).
 *
 * ═══════════ EL INTERRUPTOR, POR MATERIA: UNA LÍNEA CADA UNA ═══════════
 *
 * Apagado por defecto: una materia que no está aquí, o que está en `false`,
 * cierra exactamente como antes —el recuadro de resultado y el aviso de FP—.
 * Para apagar una materia, su línea pasa a `false`. Nada más.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const PANTALLA_RESUMEN = {
  contabilidad: true,
  macroeconomia: false,
};

/*
 * Las seis actividades con panel de cierre propio. No usan el recuadro
 * compartido, así que la pantalla no las toca, y su aviso de FP sigue saliendo
 * aunque su materia tenga el interruptor encendido.
 */
export const CON_PANEL_PROPIO = new Set([
  "memorama-corazon",
  "memorama-tesoro",
  "memorama-tesoreria",
  "memorama-banco-central",
  "comite-nova",
  "ciclo-completo",
]);

export const pantallaResumenEncendida = (materiaId) => PANTALLA_RESUMEN[materiaId] === true;

/** ¿Esta partida cierra con la pantalla de resumen? */
export const usaPantallaResumen = (materiaId, actividadId) =>
  pantallaResumenEncendida(materiaId) && !CON_PANEL_PROPIO.has(actividadId);

/*
 * ═══════════ «BIEN A LA PRIMERA», CONTADO COMO LO GUARDA EL SERVIDOR ═══════════
 *
 * X y N salen del detalle con el mismo filtro que registrar_fp aplica antes de
 * escribir fp_detalle: un ítem con id de texto no vacío y `ok` booleano, la
 * primera aparición de cada id, y como mucho 200. Así la pantalla cuenta las
 * mismas filas que quedaron guardadas, ni una más.
 */
export function conteoGuardado(detalle) {
  if (!Array.isArray(detalle)) return null;
  const vistos = new Set();
  let n = 0;
  let bien = 0;
  detalle.slice(0, 200).forEach((d) => {
    const item = typeof d?.item === "string" ? d.item.trim().slice(0, 120) : "";
    if (!item || typeof d.ok !== "boolean" || vistos.has(item)) return;
    vistos.add(item);
    n += 1;
    if (d.ok) bien += 1;
  });
  return n > 0 ? { bien, n } : null;
}

/* ═══════════ LA FRANJA ═══════════ */

export const FRANJA = { ALTA: "alta", MEDIA: "media", BAJA: "baja" };

/** Proporción 0..1 → franja. ≥80 % alta, 50–79 % media, <50 % baja. */
export function franjaDe(proporcion) {
  if (proporcion >= 0.8) return FRANJA.ALTA;
  if (proporcion >= 0.5) return FRANJA.MEDIA;
  return FRANJA.BAJA;
}

/* ═══════════ LOS TEXTOS DE LEVI, PALABRA POR PALABRA ═══════════ */

export const TITULO = {
  [FRANJA.ALTA]: "Esto ya lo manejas.",
  [FRANJA.MEDIA]: "Vas bien. Falta afinar algo.",
  [FRANJA.BAJA]: "Esto necesita otra vuelta.",
  exploratoria: "Recorrido terminado.",
  repeticion: "Repaso completado.",
};

/* El recuadro, cuando la actividad no trae texto de cierre propio. */
export const MENSAJE = {
  [FRANJA.ALTA]: "La mayoría te salió a la primera. Puedes seguir.",
  [FRANJA.MEDIA]: "La mitad o más te salió bien. Repetirla te ayuda a afinar.",
  [FRANJA.BAJA]: "Menos de la mitad te salió a la primera. Repetirla es la mejor forma de afianzarla.",
  exploratoria: "Aquí no se califica. Puedes volver cuando quieras.",
};

export const ROTULO_BIEN = "Bien a la primera:";
export const ROTULO_PUNTOS = "Puntos ganados:";
export const ROTULO_RESULTADO = "Resultado:";
export const NOTA_REPETICION = "Estos puntos ya los tenías de antes.";
export const BOTON_VOLVER = "Volver al camino";
export const BOTON_REPETIR = "Repetir";
export const NOTA_REPETIR = "Repetir no suma puntos nuevos.";

/*
 * ═══════════ EL FORMATO DE CADA ACTIVIDAD ═══════════
 *
 *   x-de-n        «Bien a la primera: X de N». Cada fila del detalle es una
 *                 pregunta contestada una vez.
 *   porcentaje    «Resultado: P %». Las filas no son preguntas sueltas
 *                 (frases elegidas, filtros, casillas con castigo por
 *                 señuelos, un orden) o no hay detalle: X de N diría otra
 *                 cosa que el resultado.
 *   solo-puntos   solo la cifra de puntos (exploratorias).
 *   panel-propio  la actividad tiene su propio cierre; no cambia.
 *
 * Macroeconomía, fijo y actividad por actividad: las 49. Hay una prueba que
 * recorre subjects.js y falla si alguna queda sin formato.
 */
export const FORMATO = {
  X_DE_N: "x-de-n",
  PORCENTAJE: "porcentaje",
  SOLO_PUNTOS: "solo-puntos",
  PANEL_PROPIO: "panel-propio",
};

const X = FORMATO.X_DE_N;
const P = FORMATO.PORCENTAJE;
const PANEL = FORMATO.PANEL_PROPIO;

export const FORMATO_MACRO = {
  /* Demanda agregada */
  "memorama-corazon": PANEL,
  "cual-componente": X,
  "electrocardiograma": X,
  "termometro-reacciones": X,
  "banco-transfusiones": X,
  "biopsia-economica": X,
  "triage-emergencias": X,
  "cirugia-reconstruccion": P,
  "sala-monitores": X,
  "quien-beneficia-auge": X,
  "explica-paciente": P,
  "sala-espera-llena": P,
  /* Política económica */
  "memorama-tesoro": PANEL,
  "que-rama-es": X,
  /* Levi: su resultado es el porcentaje guardado (las dos etapas), no X de N. */
  "diagnostico-en-vivo": P,
  "arma-grupo-logico": P,
  "quien-gana-quien-pierde": X,
  "corriente-titulares": X,
  "explica-la-politica": P,
  "tablero-decisiones": P,
  "simulador-de-crisis": P,
  "se-acerca-o-se-aleja": X,
  "expediente-gabinete": X,
  "consejo-ministros": X,
  /* Política fiscal */
  "memorama-tesoreria": PANEL,
  "cobra-gasta-o-pide": X,
  "clasificador-tesoro": X,
  "directos-indirectos": X,
  "flujo-de-caja": X,
  "agujero-fiscal": X,
  "expansiva-contractiva": X,
  "disena-presupuesto": P,
  "deficit-vs-deuda": X,
  "quien-afecta-ajuste": X,
  "explica-contribuyente": P,
  "comite-presupuesto": P,
  "comite-nova": PANEL,
  /* Política monetaria */
  "memorama-banco-central": PANEL,
  "quien-decide-esto": X,
  "volante-de-la-tasa": X,
  "caja-de-herramientas": X,
  "a-quien-le-pega-la-tasa": X,
  "cadena-de-transmision": P,
  "explicaselo-a-un-deudor": P,
  "corriente-de-decisiones": X,
  "el-rezago": P,
  "dilema-banquero-central": X,
  "duelo-de-instrumentos": X,
  "disena-respuesta-monetaria": P,
};

/**
 * El formato de una actividad. Fuera de Macroeconomía (Contabilidad) se
 * deduce como hasta ahora: exploratoria → solo puntos; si no, X de N.
 */
export function formatoDe(actividadId, clasificacion = null) {
  if (CON_PANEL_PROPIO.has(actividadId)) return FORMATO.PANEL_PROPIO;
  if (FORMATO_MACRO[actividadId]) return FORMATO_MACRO[actividadId];
  return clasificacion?.modalidad === "exploratoria" ? FORMATO.SOLO_PUNTOS : FORMATO.X_DE_N;
}

/*
 * ═══════════ LA SALVAGUARDA: ANTE LA DUDA, EL CIERRE DE SIEMPRE ═══════════
 *
 * La pantalla solo sale si TODO lo que va a enseñar es un número válido. Si
 * no, la actividad cierra exactamente como antes: su recuadro de resultado y
 * el aviso de FP. Cae al cierre de siempre si:
 *
 *   · el estudiante no tiene cuenta
 *   · no llegó el aviso de FP, o sus puntos no son un número, o son negativos,
 *     o la marca de repetición no es un sí/no, o dice repetida con puntos
 *   · X de N: N = 0 (sin filas), X > N, o X o N no son enteros ≥ 0
 *   · Resultado: P %: la P no es confiable (ver porcentajeConfiable)
 *   · la actividad es de panel propio
 */
const esNumero = (v) => typeof v === "number" && Number.isFinite(v);

/** Las dos cifras de «X de N», por separado: así se prueban también los casos que el conteo no produce. */
export function cifrasValidas(x, n) {
  return Number.isInteger(x) && Number.isInteger(n) && x >= 0 && n > 0 && x <= n;
}

/*
 * ═══════════ «RESULTADO: P %»: SOLO UNA P CONFIABLE ═══════════
 *
 * La P que se enseña es la que el servidor guardó PARA ESTA PARTIDA, y llega
 * en el aviso de FP (`pctGuardado`), como los puntos: así el aviso y la
 * pantalla deciden con el mismo dato. Cuenta solo si:
 *
 *   · es un número entre 1 y 100 —una P de 0 nunca se enseña como
 *     resultado, ni la primera vez ni en la repetición—
 *   · y coincide, redondeada, con la que entregó la partida.
 *
 * Si no, no hay P confiable: la partida cae al cierre de siempre, sin línea
 * de resultado. Es el caso visto en Macro: un Diagnóstico en vivo repetido
 * con 90 % cuya pantalla llegó a mostrar 0 %.
 */
export const P_MINIMA = 1;

export function porcentajeConfiable({ aviso, pct }) {
  const p = aviso?.pctGuardado;
  if (!esNumero(p) || p < P_MINIMA || p > 100) return null;
  if (!esNumero(pct) || Math.round(p) !== Math.round(pct)) return null;
  return p;
}

export function avisoValido(aviso) {
  if (!aviso || !esNumero(aviso.fp) || aviso.fp < 0) return false;
  if (typeof aviso.repetida !== "boolean") return false;
  if (aviso.repetida && aviso.fp > 0) return false;
  return true;
}

/** Lo que se puede comprobar ANTES de registrar: la cuenta, el formato y las cifras. */
export function partidaValida({ formato, detalle, pct, registro = null, conCuenta }) {
  if (!conCuenta) return { valida: false, motivo: "sin-cuenta" };
  if (formato === FORMATO.PANEL_PROPIO || !Object.values(FORMATO).includes(formato)) return { valida: false, motivo: "formato" };
  if (formato === FORMATO.X_DE_N) {
    const c = conteoGuardado(detalle);
    if (!c) return { valida: false, motivo: "n-cero" };
    if (!cifrasValidas(c.bien, c.n)) return { valida: false, motivo: "cifras" };
  }
  if (formato === FORMATO.PORCENTAJE) {
    /* Antes de registrar ya se sabe si la partida trae una P que se pueda enseñar. */
    if (!esNumero(pct) || pct < P_MINIMA || pct > 100) return { valida: false, motivo: "porcentaje" };
  }
  return { valida: true, motivo: null };
}

/** La decisión completa, con el aviso de FP ya en la mano. */
export function decidir(partida) {
  const previa = partidaValida(partida);
  if (!previa.valida) return previa;
  if (!avisoValido(partida.aviso)) return { valida: false, motivo: "aviso" };
  if (partida.formato === FORMATO.PORCENTAJE && porcentajeConfiable(partida) === null) {
    return { valida: false, motivo: "porcentaje-no-confiable" };
  }
  return { valida: true, motivo: null };
}

/*
 * ═══════════ QUIÉN PINTA EL AVISO DE FP ═══════════
 *
 * El aviso sale en el mismo instante en que el servidor responde, antes de
 * que la pantalla sepa nada. Por eso la vista anuncia aquí la partida antes
 * de registrarla, y AvisoFP pregunta: «¿esta partida la cierra la pantalla?».
 * La respuesta usa la MISMA decisión que la pantalla, con el mismo aviso: o
 * sale la pantalla, o sale el aviso de siempre. Nunca los dos, nunca ninguno.
 */
const enCurso = new Map();

export function anunciarPartida(actividadId, partida) {
  enCurso.set(actividadId, partida);
  return () => { if (enCurso.get(actividadId) === partida) enCurso.delete(actividadId); };
}

export function pantallaTomaElAviso(aviso) {
  const partida = enCurso.get(aviso?.actividadId);
  return Boolean(partida) && decidir({ ...partida, aviso }).valida;
}

/*
 * ═══════════ QUÉ ENSEÑA LA PANTALLA, DECIDIDO EN UN SOLO SITIO ═══════════
 *
 * Entra la partida ya validada. Los puntos son los del aviso de FP (el mismo
 * valor que «+N FP») y la repetición, su marca («Ya completada»). Es una
 * función pura para poder probarla sin montar nada.
 */
export function resumenDe({ clasificacion, formato = null, pct, detalle, registro, aviso }) {
  const f = formato ?? formatoDe(null, clasificacion);
  const exploratoria = f === FORMATO.SOLO_PUNTOS || clasificacion?.modalidad === "exploratoria";
  const repeticion = aviso?.repetida === true;
  const fp = aviso?.fp ?? 0;
  const conteo = f === FORMATO.X_DE_N ? conteoGuardado(detalle) : null;
  const porcentaje = Math.round(porcentajeConfiable({ aviso, pct }) ?? 0);
  const franja = franjaDe(conteo ? conteo.bien / conteo.n : porcentaje / 100);

  const titulo = repeticion ? TITULO.repeticion : exploratoria ? TITULO.exploratoria : TITULO[franja];
  const mensaje = exploratoria ? MENSAJE.exploratoria : MENSAJE[franja];

  const sufijo = repeticion ? ", sin puntos nuevos" : "";
  let lector;
  if (exploratoria) lector = `Recorrido terminado, ${fp} puntos ganados${sufijo}.`;
  else if (conteo) lector = `Resultado: ${conteo.bien} de ${conteo.n} bien a la primera, ${fp} puntos ganados${sufijo}.`;
  else lector = `Resultado: ${porcentaje} %, ${fp} puntos ganados${sufijo}.`;

  /* Cuando el resultado ya lo enseña el cierre propio: solo los puntos. */
  const lectorSoloPuntos = `${fp} puntos ganados${sufijo}.`;

  const figura = nivelDeFigura({ exploratoria, repeticion, fp, conteo, porcentaje });

  return { formato: f, exploratoria, repeticion, fp, conteo, porcentaje, franja, titulo, mensaje, lector, lectorSoloPuntos, figura };
}

/*
 * ═══════════ LA FIGURA FACETADA: QUÉ NIVEL TOCA ═══════════
 *
 * Las reglas de Levi:
 *
 *   rico     perfecto (X = N) y primera vez con puntos: marco rico y un pulso
 *   sobrio   cualquier otra primera vez con puntos —también las exploratorias
 *            y las de menos del 50 %—: menos facetas y sin pulso
 *   null     repetición sin puntos nuevos: sin figura
 *
 * «Con puntos» es literal: sin FP ganados en esta partida (sin cuenta, o si
 * la escritura falló) tampoco hay figura. Sin detalle, «perfecto» es el 100 %.
 */
export const FIGURA = { RICA: "rica", SOBRIA: "sobria" };

export function nivelDeFigura({ exploratoria = false, repeticion, fp, conteo, porcentaje }) {
  if (repeticion || !(fp > 0)) return null;
  if (exploratoria) return FIGURA.SOBRIA;
  const perfecto = conteo ? conteo.n > 0 && conteo.bien === conteo.n : porcentaje >= 100;
  return perfecto ? FIGURA.RICA : FIGURA.SOBRIA;
}
