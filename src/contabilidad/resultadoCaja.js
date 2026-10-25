import {
  CASOS_RESULTADO_CAJA, CASO_A, CASO_B, ELECCIONES, signoDe, rotuloDe,
  VARIOS_ERRORES, errorCuadraConErrores, NO_MUEVE,
} from "../data/contabilidadTema3ResultadoCaja.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · «DEL RESULTADO A LA CAJA» — la caja de unas respuestas, la
 * evaluación, el puente y el puntaje (paquete e3-t3-del-resultado-a-la-caja-v4).
 *
 * ═══════════ LA EVALUACIÓN (§2) ═══════════
 *
 * Se califica la clasificación completa, ficha por ficha, con un intento.
 * El mensaje lleva, en este orden:
 *   · A6, si la caja de las respuestas es la correcta pero hay fichas mal
 *     puestas, con su número en palabras: «dos» en A; «tres» o «cuatro» en B
 *     (Kamogawa, #557);
 *   · los errores de las dos primeras fichas mal puestas, en el orden de las
 *     fichas;
 *   · «Y hay más fichas por revisar.», si hay más de dos.
 * Si todas están bien, solo el acierto del caso.
 *
 * ═══════════ EL PUENTE (§8.3) ═══════════
 *
 * Una cascada: la utilidad desde 0; cada ficha que mueve la caja, desde
 * donde iba (lo que suma, lleno; lo que resta, vacío); y la caja al cierre
 * desde 0. La escala es la utilidad más todos los montos sin signo: es lo
 * máximo que pueden dar unas respuestas, así que nada se sale.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const casoDe = (version) => CASOS_RESULTADO_CAJA[version] ?? CASO_A;

/* La caja que dan unas respuestas: { [fichaId]: eleccion }. Sin elección, no mueve. */
export function cajaDe(caso, respuestas) {
  return caso.fichas.reduce((s, f) => s + signoDe(respuestas[f.id]) * f.monto, caso.utilidad);
}

/* La caja correcta, la de las respuestas del paquete. */
export const cajaCorrecta = (caso) => cajaDe(caso, Object.fromEntries(caso.fichas.map((f) => [f.id, f.va])));

export function evaluarResultadoCaja(caso, respuestas) {
  const fichas = caso.fichas.map((f) => ({ id: f.id, ok: respuestas[f.id] === f.va, elegida: respuestas[f.id] ?? null, va: f.va }));
  const mal = caso.fichas.filter((f) => respuestas[f.id] !== f.va);
  const suya = cajaDe(caso, respuestas);
  const ok = mal.length === 0;
  const cuadra = !ok && suya === caso.caja;
  const textos = [];
  if (ok) textos.push(caso.acierto);
  else {
    if (cuadra) textos.push(errorCuadraConErrores(mal.length));
    for (const f of mal.slice(0, 2)) textos.push(f.error);
    if (mal.length > 2) textos.push(VARIOS_ERRORES);
  }
  return { ok, fichas, mal: mal.map((f) => f.id), suya, correcta: caso.caja, cuadra, textos };
}

/* Un acierto por ficha bien puesta. */
export function puntuarResultadoCaja(r, cuantas) {
  if (!cuantas) return 0;
  return (r.fichas.filter((f) => f.ok).length / cuantas) * 100;
}

/* §8.3: la escala del puente. A: 33.250; B: 13.300.000. */
export const escalaDe = (caso) => caso.fichas.reduce((s, f) => s + f.monto, caso.utilidad);

/*
 * Los renglones del puente, con la cascada correcta. Cada uno:
 * { id, nombre, signo, monto, desde, hasta, lleno }. Las fichas que no mueven
 * la caja no dibujan tramo. Si se pasan las respuestas y el estudiante sumó o
 * restó una de ellas, va en su lugar un renglón tenue, sin tramo:
 * { id, nombre, signo, monto, tenue: true } (Kamogawa, #557). Con eso se
 * sigue en pantalla la distancia entre la caja correcta y la suya.
 */
export function renglonesDelPuente(caso, rotuloCaja, respuestas = null) {
  const filas = [{ id: "utilidad", nombre: caso.rotuloUtilidad, signo: 1, monto: caso.utilidad, desde: 0, hasta: caso.utilidad, lleno: true }];
  let va = caso.utilidad;
  for (const f of caso.fichas) {
    const signo = signoDe(f.va);
    if (!signo) {
      const suyo = f.va === NO_MUEVE && respuestas ? signoDe(respuestas[f.id]) : 0;
      if (suyo) filas.push({ id: f.id, nombre: f.nombre, signo: suyo, monto: f.monto, tenue: true });
      continue;
    }
    const nuevo = va + signo * f.monto;
    filas.push({ id: f.id, nombre: f.nombre, signo, monto: f.monto, desde: Math.min(va, nuevo), hasta: Math.max(va, nuevo), lleno: signo > 0 });
    va = nuevo;
  }
  filas.push({ id: "caja", nombre: rotuloCaja, signo: 1, monto: va, desde: 0, hasta: va, lleno: true });
  return filas;
}

/*
 * Qué leyenda lleva el puente (Kamogawa, #557):
 *   · "punteado": falló y su caja es positiva o cero; hay punteado;
 *   · "negativa": su caja es negativa; no hay punteado, solo la frase con la cifra (A7);
 *   · null: todo bien, o cuadra con errores: no hay punteado ni cifra.
 */
export function leyendaDe(caso, suya) {
  if (suya === caso.caja) return null;
  return suya < 0 ? "negativa" : "punteado";
}

/* La cifra con el punto de miles del libro: «$14.650»; con signo, «+$15.000», «−$6.800». */
export const pesos = (n) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("es-CO").replace(/,/g, ".")}`;
export const conSigno = (signo, n) => `${signo < 0 ? "−" : "+"}$${Math.abs(Math.round(n)).toLocaleString("es-CO").replace(/,/g, ".")}`;

/* Para el panel docente: la ficha de un id, con su empresa. */
export const fichaDeItem = (id) => {
  for (const caso of [CASO_A, CASO_B]) {
    const f = caso.fichas.find((x) => x.id === id);
    if (f) return `${caso.empresa} · ${f.nombre}, ${pesos(f.monto)}`;
  }
  return null;
};

export { ELECCIONES, rotuloDe };
