/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CUÁNDO SALE EL MOMENTO DE RACHA.
 *
 * Las tres reglas —una vez al día, solo si la racha avanzó, solo con sesión—
 * las decide y las sella el servidor en racha_momento() (migración 0034), en
 * una sola llamada que además deja marcado que ya se vio. Aquí solo se decide
 * CUÁNDO PREGUNTAR, que es justo lo que estaba mal en la versión anterior:
 *
 *   ANTES  se preguntaba una vez, al abrir la sesión. Pero la racha avanza en
 *          registrar_fp, al terminar la primera actividad del día, y eso pasa
 *          DESPUÉS de abrir la sesión. Al entrar la respuesta era siempre «no
 *          toca» y nadie volvía a preguntar: solo salía si el estudiante
 *          recargaba el sitio el mismo día después de jugar.
 *
 *   AHORA  se pregunta al abrir la sesión (cubre recargar después de jugar) Y
 *          cada vez que el servidor confirma FP (cubre el caso normal). Las
 *          preguntas de más no cuestan nada: el servidor dice «no» a todas
 *          menos a la primera del día en que la racha subió.
 *
 * Tras un FP se espera a que termine el cierre de la actividad
 * (RecompensaCierre dura hasta 3,2 s en Experto): el teseracto es el único
 * protagonista de su momento.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ESPERA_TRAS_FP_MS = 3800;

/**
 * @param {object}   p
 * @param {Function} p.pedir       () → Promise<{mostrar, desde, hasta, semana, hoy} | null>
 * @param {Function} p.escucharFP  (fn) → dejarDeEscuchar
 * @param {Function} p.alMostrar   (momento) → void
 * @param {number}   [p.esperaMs]
 * @returns {{ sesion(activa: boolean): void, detener(): void }}
 */
export function crearDisparador({ pedir, escucharFP, alMostrar, esperaMs = ESPERA_TRAS_FP_MS }) {
  let activa = false;
  let vivo = true;
  let enCurso = false;
  const relojes = new Set();

  const preguntar = async () => {
    if (!vivo || !activa || enCurso) return;
    enCurso = true;
    try {
      const r = await pedir();
      if (vivo && activa && r?.mostrar) alMostrar(r);
    } catch {
      /* Una animación que no sale no puede romper nada más. */
    } finally {
      enCurso = false;
    }
  };

  const dejarDeEscuchar = escucharFP(() => {
    if (!activa) return;
    const reloj = setTimeout(() => { relojes.delete(reloj); preguntar(); }, esperaMs);
    relojes.add(reloj);
  });

  return {
    sesion(nueva) {
      const antes = activa;
      activa = Boolean(nueva);
      if (activa && !antes) preguntar();
      if (!activa) { for (const r of relojes) clearTimeout(r); relojes.clear(); }
    },
    detener() {
      vivo = false;
      for (const r of relojes) clearTimeout(r);
      relojes.clear();
      dejarDeEscuchar();
    },
  };
}
