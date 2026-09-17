import { visibilidadDocumento } from "./visibilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CUÁNDO SALE EL MOMENTO DE RACHA.
 *
 * Las tres reglas —una vez al día, solo si la racha avanzó, solo con sesión—
 * las decide y las sella el servidor en racha_momento() (migración 0034), en
 * una sola llamada que además deja marcado que ya se vio. Aquí solo se decide
 * CUÁNDO PREGUNTAR:
 *
 *   · al abrir la sesión (cubre recargar después de jugar) Y cada vez que el
 *     servidor confirma FP (cubre el caso normal). Las preguntas de más no
 *     cuestan nada: el servidor dice «no» a todas menos a la primera del día
 *     en que la racha subió.
 *
 *   · NUNCA CON LA PÁGINA OCULTA. Preguntar ES gastar el momento del día: el
 *     servidor lo marca como visto en la misma llamada. Con la pestaña oculta
 *     —el estudiante cambió de pestaña o bloqueó el teléfono al terminar— la
 *     pregunta queda pendiente y se hace al volver a verse. Así lo vio Mateo
 *     en su cuenta: el día quedó marcado y nadie vio el teseracto.
 *
 * Tras un FP se espera a que termine el cierre de la actividad
 * (RecompensaCierre dura hasta 3,2 s en Experto): el teseracto es el único
 * protagonista de su momento.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ESPERA_TRAS_FP_MS = 3800;

/**
 * @param {object}   p
 * @param {Function} p.pedir         () → Promise<{mostrar, desde, hasta, semana, hoy} | null>
 * @param {Function} p.escucharFP    (fn) → dejarDeEscuchar
 * @param {Function} p.alMostrar     (momento) → void
 * @param {number}   [p.esperaMs]
 * @param {object}   [p.visibilidad] { visible(), escuchar(fn) → dejar }
 * @returns {{ sesion(activa: boolean): void, detener(): void }}
 */
export function crearDisparador({ pedir, escucharFP, alMostrar, esperaMs = ESPERA_TRAS_FP_MS, visibilidad = visibilidadDocumento }) {
  let activa = false;
  let vivo = true;
  let enCurso = false;
  let pendiente = false;
  const relojes = new Set();

  const preguntar = async () => {
    if (!vivo || !activa || enCurso) return;
    /* Oculta: no se gasta el momento. Se pregunta al volver a verse. */
    if (!visibilidad.visible()) {
      pendiente = true;
      return;
    }
    pendiente = false;
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

  const dejarDeEscucharFP = escucharFP(() => {
    if (!activa) return;
    const reloj = setTimeout(() => { relojes.delete(reloj); preguntar(); }, esperaMs);
    relojes.add(reloj);
  });

  const dejarDeEscucharVisibilidad = visibilidad.escuchar(() => {
    if (pendiente && visibilidad.visible()) preguntar();
  });

  return {
    sesion(nueva) {
      const antes = activa;
      activa = Boolean(nueva);
      if (activa && !antes) preguntar();
      if (!activa) {
        pendiente = false;
        for (const r of relojes) clearTimeout(r);
        relojes.clear();
      }
    },
    detener() {
      vivo = false;
      pendiente = false;
      for (const r of relojes) clearTimeout(r);
      relojes.clear();
      dejarDeEscucharFP();
      dejarDeEscucharVisibilidad();
    },
  };
}
