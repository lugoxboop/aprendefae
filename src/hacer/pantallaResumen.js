/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA PANTALLA DE RESUMEN AL CERRAR UNA ACTIVIDAD — reglas y textos.
 *
 * SOLO PRESENTACIÓN. Nada de aquí calcula ni guarda puntos, progreso ni
 * ranking: lee lo que la partida ya entregó (porcentaje y detalle) y lo que el
 * servidor ya devolvió al registrarla (la fila de fp_history). Si un número no
 * está en esos dos sitios, la pantalla no lo enseña.
 *
 * ═══════════ EL INTERRUPTOR, POR MATERIA ═══════════
 *
 * Apagado por defecto: una materia que no está aquí, o que está en `false`,
 * cierra exactamente como antes —el recuadro de resultado y el aviso de FP—.
 * Macroeconomía tiene estudiantes reales y queda apagada a propósito.
 * Encenderla es cambiar su línea aquí y nada más.
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
 * ═══════════ QUÉ ENSEÑA LA PANTALLA, DECIDIDO EN UN SOLO SITIO ═══════════
 *
 * Entra: la clasificación de la actividad (modalidad), el porcentaje y el
 * detalle que la partida entregó, y la fila que devolvió registrar_fp. Sale
 * todo lo que la pantalla pinta. Es una función pura para poder probarla sin
 * montar nada.
 *
 * Los FP son los de la fila guardada (`fp_awarded`) y la repetición es la que
 * contó el servidor (`repeat_index`). Sin fila —sin cuenta, o si la escritura
 * falló— no se ganó nada: la pantalla dice 0.
 */
export function resumenDe({ clasificacion, pct, detalle, registro }) {
  const exploratoria = clasificacion?.modalidad === "exploratoria";
  const repeticion = (registro?.repeat_index ?? 0) > 0;
  const fp = repeticion ? 0 : Math.max(0, Number(registro?.fp_awarded ?? 0) || 0);
  const conteo = conteoGuardado(detalle);
  /* Sin detalle (El tablero de decisiones), el porcentaje que quedó guardado. */
  const porcentaje = Math.round(
    typeof registro?.correct_pct === "number" ? registro.correct_pct : Number(pct) || 0,
  );
  const franja = franjaDe(conteo ? conteo.bien / conteo.n : porcentaje / 100);

  const titulo = repeticion ? TITULO.repeticion : exploratoria ? TITULO.exploratoria : TITULO[franja];
  const mensaje = exploratoria ? MENSAJE.exploratoria : MENSAJE[franja];

  const sufijo = repeticion ? ", sin puntos nuevos" : "";
  let lector;
  if (exploratoria) lector = `Recorrido terminado, ${fp} puntos ganados${sufijo}.`;
  else if (conteo) lector = `Resultado: ${conteo.bien} de ${conteo.n} bien a la primera, ${fp} puntos ganados${sufijo}.`;
  else lector = `Resultado: ${porcentaje} %, ${fp} puntos ganados${sufijo}.`;

  const figura = nivelDeFigura({ exploratoria, repeticion, fp, conteo, porcentaje });

  return { exploratoria, repeticion, fp, conteo, porcentaje, franja, titulo, mensaje, lector, figura };
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
