/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SI LA PÁGINA SE VE, Y UN RELOJ QUE SE PARA CUANDO NO.
 *
 * El fallo que esto cierra, visto en la cuenta real de Mateo: la pestaña
 * estaba oculta al terminar la actividad. racha_momento() se consultó igual
 * —y el servidor marcó el día como visto—, la secuencia se montó, sus
 * setTimeout siguieron corriendo con la pestaña oculta y se cerró sola. El
 * momento del día se gastó sin que nadie lo viera.
 *
 * Dos piezas, las dos inyectables para poder probarlas sin navegador:
 *
 *   visibilidadDocumento   visible() y escuchar(fn) sobre document
 *   crearRelojPausable     setTimeout con pausa: al ocultarse la página guarda
 *                          lo que falta de cada espera y la retoma al volver
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const visibilidadDocumento = {
  visible: () => typeof document === "undefined" || document.visibilityState !== "hidden",
  escuchar: (fn) => {
    if (typeof document === "undefined") return () => {};
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  },
};

/**
 * @param {object} visibilidad  { visible(), escuchar(fn) → dejar }
 * @returns {{ programar(fn, ms): void, detener(): void, pausado(): boolean }}
 */
export function crearRelojPausable(visibilidad = visibilidadDocumento) {
  const esperas = new Set();
  let pausado = !visibilidad.visible();

  const arrancar = (e) => {
    e.inicio = Date.now();
    e.id = setTimeout(() => {
      esperas.delete(e);
      e.fn();
    }, e.resta);
  };

  const dejar = visibilidad.escuchar(() => {
    const visible = visibilidad.visible();
    if (!visible && !pausado) {
      pausado = true;
      for (const e of esperas) {
        clearTimeout(e.id);
        e.id = null;
        e.resta = Math.max(0, e.resta - (Date.now() - e.inicio));
      }
    } else if (visible && pausado) {
      pausado = false;
      for (const e of esperas) arrancar(e);
    }
  });

  return {
    programar(fn, ms) {
      const e = { fn, resta: ms, inicio: 0, id: null };
      esperas.add(e);
      if (!pausado) arrancar(e);
    },
    detener() {
      for (const e of esperas) clearTimeout(e.id);
      esperas.clear();
      dejar();
    },
    pausado: () => pausado,
  };
}
