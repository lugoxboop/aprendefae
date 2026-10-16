/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL NOMBRE DE LAS ACTIVIDADES RETIRADAS.
 *
 * Retirar una actividad es dejar su fila en el servidor como lápida
 * (`retirada = true`) y quitarla del cliente. Lo que el FP ya ganado NO
 * pierde es su valor; lo que pierde es su NOMBRE, y eso se ve en un sitio
 * concreto: el panel docente.
 *
 * `alertas.js` recoge las actividades completadas que ya no están en el
 * catálogo para que el trabajo del estudiante no desaparezca del panel —eso
 * está bien pensado—, pero las pinta con el id crudo como título. Al profesor
 * le sale `t7-2-debe-o-haber` en vez de «¿Debe o haber?».
 *
 * Esta tabla es solo para eso: que una lápida siga teniendo nombre.
 *
 * ═══════════ CÓMO SE MANTIENE ═══════════
 *
 * Cuando retires una actividad, añade aquí su id y el nombre con el que la
 * vio el estudiante — el que tenía en `subjects.js` antes de salir, no uno
 * nuevo. El panel es un registro de lo que pasó, y el estudiante no jugó un
 * nombre distinto del que vio.
 *
 * NO HAY GUARDIA QUE TE OBLIGUE, y es a propósito: una prueba que fallara al
 * retirar algo bloquearía a la célula que retira por un asunto del panel
 * docente, que es de otro. Si se olvida, el panel enseña el id como enseñaba
 * antes — se pierde la mejora, no se rompe nada.
 *
 * Lo que sí hay es una prueba de que lo que está aquí SIGA retirado de
 * verdad: una entrada para algo que volvió al catálogo es basura que engaña.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const NOMBRE_DE_RETIRADA = {
  /* 0015 · retiro de la política monetaria. Cero filas en fp_history al
     retirarla, así que hoy no hay ningún estudiante a quien le salga. Entra
     igual: la tabla vale por las que vengan, y empezar vacía invita a no
     usarla. */
  "dashboard-economico": "El Tablero Económico",
  /* 0208 · corte de calidad de los Hacer de T4 (Célula D, 15 oct 2026). H2
     sale; H5 se funde en H4 «El arqueo de caja menor» y H6 en H7 «Concilia
     la cuenta». Los nombres son los que tenían en subjects.js antes de salir,
     y los mismos de sus paquetes (d4-t4-h2-v1, -h5-v1, -h6-v1). */
  "t4-el-control-que-se-saltaron": "El control que se saltaron",
  "t4-al-empleado-o-al-gasto": "¿Al empleado o al gasto?",
  "t4-quien-se-entero-primero": "¿Quién se enteró primero?",
};

/**
 * El nombre con el que el estudiante vio una actividad que ya no está en el
 * catálogo. Devuelve el id si no se conoce — sin inventar y sin romper.
 */
export const nombreDeRetirada = (id) => NOMBRE_DE_RETIRADA[id] ?? id;
