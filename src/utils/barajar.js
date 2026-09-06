/*
 * Barajado, en un solo sitio.
 *
 * POR QUÉ IMPORTA MÁS DE LO QUE PARECE. Si las opciones salen siempre en el
 * mismo orden, el estudiante deja de clasificar contenido y empieza a
 * memorizar posiciones: "la tercera es la buena". Es el mismo reconocimiento
 * disfrazado que evita el modo experto de la cámara, solo que aplicado al sitio
 * en vez de a la respuesta.
 *
 * Estaba copiado en dos mecánicas y faltaba en otras tres. Vive aquí para que
 * añadirlo a una nueva sea importar, no volver a escribirlo.
 */

/* Fisher-Yates sobre una copia: el arreglo original no se toca. */
export function barajar(xs) {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/*
 * Baraja garantizando que no salga el MISMO orden que la vez anterior. Con
 * cuatro elementos hay una posibilidad entre veinticuatro de repetir, que en
 * una actividad que se reintenta varias veces se nota.
 *
 * `clave` saca una identidad estable de cada elemento para poder comparar dos
 * ordenaciones; por defecto sirve el propio elemento.
 */
export function barajarDistinto(xs, anterior, clave = (x) => x) {
  if (xs.length < 2) return [...xs];

  const huella = (lista) => lista.map(clave).join("|");
  const antes = anterior ? huella(anterior) : null;

  /* Con pocos elementos el reintento converge enseguida; el tope es por si acaso. */
  for (let intento = 0; intento < 12; intento++) {
    const candidato = barajar(xs);
    if (huella(candidato) !== antes) return candidato;
  }

  /* Salida de emergencia: rotar garantiza un orden distinto sin bucle infinito. */
  const a = barajar(xs);
  return [...a.slice(1), a[0]];
}
