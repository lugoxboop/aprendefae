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

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * BARAJADO REPRODUCIBLE: el mismo sorteo para la misma semilla.
 *
 * Existe por el Repaso Diario. Su selección se calcula DOS VECES —una para
 * decir «Hoy entran: …» en el banner y otra al empezar la partida— y con un
 * barajado al azar las dos tiradas podían no coincidir: el banner prometía
 * unos temas y salían otros. Un aviso que miente es peor que no darlo.
 *
 * Con la semilla del día, las dos tiradas son la misma por construcción. No
 * hace falta guardar la selección en ningún sitio, sobrevive a recargar, y
 * reabrir el banner no vuelve a sortear: la mezcla del día es la del día.
 *
 * ESTO NO DEBILITA EL BARAJADO DE LAS OPCIONES DE UNA PREGUNTA, que sigue
 * usando `barajar` al azar — ahí la gracia es justo que no se pueda memorizar
 * la posición. Son dos cosas distintas y por eso son dos funciones.
 *
 * El generador es un xorshift32 sembrado con un hash de la cadena. No es
 * criptografía ni pretende serlo: lo único que se le pide es repartir parejo y
 * dar siempre lo mismo para la misma semilla.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Hash de 32 bits de una cadena (FNV-1a). Estable entre navegadores y sesiones. */
export function hash32(texto) {
  let h = 0x811c9dc5;
  const s = String(texto);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    /* h *= 16777619, en aritmética de 32 bits sin desbordar por el camino. */
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Un generador reproducible en [0, 1). xorshift32. */
export function generador(semilla) {
  let x = hash32(semilla) || 0x9e3779b9; // el cero se atasca en xorshift
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;  x >>>= 0;
    return x / 4294967296;
  };
}

/**
 * Un barajador con la forma de `barajar` —recibe una lista, devuelve otra— pero
 * reproducible: la misma semilla da siempre la misma salida.
 *
 * El generador se crea UNA VEZ por barajador, así que dos llamadas seguidas no
 * devuelven lo mismo. Eso es lo que hace falta: `seleccionarRepaso` lo llama
 * tres veces con propósitos distintos, y si las tres dieran el mismo orden el
 * sorteo quedaría sesgado.
 */
export function barajadorDe(semilla) {
  const azar = generador(semilla);
  return (xs) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(azar() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
}
