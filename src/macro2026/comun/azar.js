/*
 * Sorteo y orden aleatorio de las Hacer (D8). `rng` se inyecta para que las
 * pruebas puedan fijar la semilla; en la pieza es Math.random.
 */

/** Generador con semilla (mulberry32), solo para pruebas y videos. */
export function conSemilla(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates sobre una copia. */
export function barajar(lista, rng = Math.random) {
  const a = [...lista];
  for (let k = a.length - 1; k > 0; k -= 1) {
    const j = Math.floor(rng() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
}

/** n elementos distintos del banco, en orden aleatorio. */
export const sortear = (banco, n, rng = Math.random) => barajar(banco, rng).slice(0, n);

/*
 * Para el video de evidencia y las sondas: `?semilla=N` en la URL fija el azar
 * de la vista previa. Sin el parámetro, Math.random.
 */
export function azarDeLaPagina() {
  try {
    const m = /[?&]semilla=(\d+)/.exec(window.location.search + window.location.hash);
    if (m) return conSemilla(Number(m[1]));
  } catch { /* sin ventana: pruebas */ }
  return Math.random;
}
