/*
 * Aviso de FP ganados.
 *
 * El motor calcula bien y escribe bien, pero hasta ahora no había forma de
 * enterarse sin abrir la base de datos. Esto es el canal por el que el
 * otorgamiento avisa a la interfaz.
 *
 * Vive junto al motor y no en un componente porque el aviso tiene que salir del
 * MISMO sitio que calcula: si cada actividad lo pintara por su cuenta, cada una
 * podría enseñar un número distinto del que se guardó — que es exactamente el
 * problema del "+10 pts" fijo que tenía DA-Learn antes de conectarse.
 *
 * Quien escucha es un único componente montado una vez. Las actividades no
 * saben que esto existe: solo llaman a registrarActividadCompletada.
 */

const suscriptores = new Set();

/** Avisa de un otorgamiento. Lo llama otorgarFP, nadie más. */
export function emitirFP(datos) {
  for (const fn of suscriptores) {
    try {
      fn(datos);
    } catch (e) {
      /* Un fallo pintando el aviso no puede tumbar el registro de FP. */
      console.error("[aprendeFAE] Aviso de FP:", e);
    }
  }
}

/** Se suscribe al aviso. Devuelve la función para darse de baja. */
export function escucharFP(fn) {
  suscriptores.add(fn);
  return () => suscriptores.delete(fn);
}

/**
 * Por qué el número es el que es.
 *
 * El estudiante ve "+2 FP" donde esperaba 50 y no entiende nada. El desglose ya
 * trae los factores que aplicó el motor; esto los traduce a una frase corta.
 * Sin esto, el aviso honesto parecería un error.
 */
export function motivoDelRecorte(desglose) {
  if (!desglose) return null;
  if (desglose.factorRepeticion === 0) return "Ya habías completado esta actividad varias veces";
  if (desglose.factorRepeticion < 1) return "Por repetir una actividad ya completada";
  if (desglose.demasiadoRapido) return "Por resolverla más rápido de lo esperado";
  if (desglose.factorRendimiento < 1) return "Según tu porcentaje de aciertos";
  return null;
}
