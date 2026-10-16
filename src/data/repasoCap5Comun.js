/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LO COMÚN DEL REPASO DEL CAPÍTULO 5 (Célula E): las palabras del feedback,
 * literales del estándar único de Hacer (PROMPT MAESTRO,
 * orquestador/conocimiento/prompts/disenadores-de-celula-v1.md, §4.2 y §4.3).
 * Mueren «Correcta», «Incorrecta», «Era esta», «Era este», «No es este
 * valor» y «No es este lado»: el feedback dice siempre una de tres palabras.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const FEEDBACK = {
  ok: "Correcto",
  mal: "No va aquí",
  revelada: "Iba aquí",
  /* Lo que dice el lector de pantalla en el error. */
  lectorMal: "Incorrecto.",
  comprobar: "Comprobar",
  verMiResumen: "Ver mi resumen",
};

/* Las tres palabras, iguales para la cuenta, el valor y el lado. */
const TRES = { ok: FEEDBACK.ok, mal: FEEDBACK.mal, revelada: FEEDBACK.revelada };
export const VEREDICTO = { cuenta: TRES, valor: TRES, lado: TRES };

/*
 * «El mes en dos cuentas» (paquete e5-mes-en-dos-cuentas): los rótulos fijos
 * de interfaz del panel común de r5-3 y r5-4.
 */
export const MES_COMUN = {
  marca: "EL MES EN DOS CUENTAS",
  leyenda: "Lo de este asiento",
  debe: "DEBE",
  haber: "HABER",
  sinDiferencia: "Sin diferencia",
};
