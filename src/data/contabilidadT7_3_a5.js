import { BOTON, DEBE, HABER } from "./contabilidadT7_3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A5 DE APRENDER — «Sobrantes y faltantes» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-a5-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Los ejemplos I-1 e I-2 del libro (p. 255), resueltos: A5 es su dueña y
 * ninguna pieza de Hacer pide sus cifras. Más las dos líneas de la lista de
 * las pp. 207-208 que la regla 5b manda aquí. «Inventario de mercancía» del
 * libro va en plural (regla 8). Sin cifras construidas.
 *
 * La ficha es la de la regla 10b para I-1 e I-2: quién · saldo en libros ·
 * valor del conteo · fecha · sistema; esos son sus rótulos.
 *
 * Lo que la v1 no trae y se toma de A1 de T7-3: los botones y mensajes, y el
 * pie de cada pantalla, con las páginas de la columna «Fuente» (el de cada
 * asiento, «Basado en el libro, p. 255», sí lo da la v1).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A5_ID = "t7-3-sobrantes-y-faltantes";

/* I-1 e I-2 (p. 255). */
export const I_LIBRO = { libros: 465_000, conteoSobra: 495_000, sobrante: 30_000, conteoFalta: 430_000, faltante: 35_000 };
const C = I_LIBRO;
/*
 * Patrón T7-3 (Watari): el conteo en renglones, siempre el mayor arriba (la
 * diferencia nunca sale negativa, y su nombre dice qué pasó). Rótulos y
 * títulos de Watari, revisados por Near.
 * Los usa también H5.
 */
export const ROTULOS_A5 = {
  conteo: "Conteo físico", libros: "Saldo en libros", sobrante: "Sobrante", faltante: "Faltante",
  ejemplo: "Ejemplo del libro · 31 de diciembre", otroConteo: "El mismo ejemplo, otro conteo",
};
/* Sobrante: conteo − libros. Faltante: libros − conteo. */
export const cuentaDeConteo = (titulo, libros, conteo) => {
  const R = ROTULOS_A5;
  const sobra = conteo > libros;
  const [mayor, menor] = sobra ? [[R.conteo, conteo], [R.libros, libros]] : [[R.libros, libros], [R.conteo, conteo]];
  return {
    tipo: "renglones", titulo,
    filas: [{ rot: mayor[0], v: mayor[1] }, { op: "−", rot: menor[0], v: menor[1] }, { op: "=", rot: sobra ? R.sobrante : R.faltante, v: mayor[1] - menor[1], res: true }],
  };
};

const INV = "Inventario de mercancías";
const CMV = "Costo de mercancía vendida";

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás qué es un sobrante y qué es un faltante, y cómo se registra cada uno.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 254-255",
};

const EL_CONTEO = {
  id: "el-conteo",
  tipo: "lectura",
  parrafos: [
    "El inventario físico es el conteo de lo que de verdad hay en la bodega.",
    /* Atribuido al libro, sin afirmar la ley de hoy. */
    "El libro dice que, por normas de contabilidad y por ley, las empresas con inventarios deben hacer un inventario físico de todas sus existencias. Lo hacen por lo menos una vez al año, a más tardar el 31 de diciembre.",
    "Lo que da el conteo se valora con el método que usa la empresa. Después se compara con el saldo de los libros, en valores y en cantidades.",
    "Si el conteo y los libros no coinciden, se hace un ajuste: por sobrante o por faltante.",
    "El libro dice que estos ajustes solo se presentan en el sistema permanente. Ese es el sistema en el que la empresa anota todos los días su mercancía y el costo de lo que vende.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 210, 233 y 254-255",
};

const SOBRANTE = {
  id: "sobrante",
  pista: "El sobrante no es todo lo que hay en la bodega. ¿Qué parte de lo contado es?",
  tipo: "eleccion",
  parrafos: [
    "Hay un sobrante cuando el conteo da más que los libros.",
    "Para llevar a los libros el valor real, el sobrante va al debe de Inventario de mercancías y al haber de Costo de mercancía vendida.",
    "Así, el sobrante baja el costo de la mercancía vendida, que es lo que costó lo que se vendió.",
    "Mira el ejemplo del libro. Inventario de mercancías tiene en los libros un saldo de $465.000. El 31 de diciembre, el conteo da $495.000.",
  ],
  /* Regla 10b. El sistema sale de la p. 255. */
  ficha: [
    { dato: "Quién", texto: "Una empresa" },
    { dato: "Saldo en libros", texto: "$465.000" },
    { dato: "Valor del conteo", texto: "$495.000" },
    { dato: "Fecha", texto: "31 de diciembre" },
    { dato: "Sistema", texto: "Permanente" },
  ],
  pregunta: "¿Cuánto es el sobrante?",
  opciones: [
    { id: "sobrante", texto: "$30.000", correcta: true },
    { id: "libros", texto: "$465.000", devolucion: "El sobrante es lo que el conteo da de más: $495.000 − $465.000 = $30.000." },
    { id: "conteo", texto: "$495.000", devolucion: "El sobrante es lo que el conteo da de más: $495.000 − $465.000 = $30.000." },
  ],
  acierto: {
    texto: "Así es: $495.000 − $465.000 = $30.000. El conteo dio más que los libros.",
    /* La pantalla pregunta por el sobrante: la cuenta llega con el acierto. */
    figuras: [cuentaDeConteo(ROTULOS_A5.ejemplo, C.libros, C.conteoSobra)],
    asientos: [{ fecha: "31 de diciembre", lineas: [{ cuenta: INV, lado: DEBE, monto: C.sobrante }, { cuenta: CMV, lado: HABER, monto: C.sobrante }] }],
    pie: "Basado en el libro, p. 255",
  },
  error: { pie: "Basado en el libro, p. 255" },
  pie: "Basado en el libro, p. 255",
};

const FALTANTE = {
  id: "faltante",
  pista: "Si falta mercancía, el inventario de los libros tiene que bajar. ¿De qué lado baja un activo?",
  tipo: "eleccion",
  parrafos: [
    "Hay un faltante cuando el conteo da menos que los libros.",
    "Ahí es al revés: el faltante va al debe de Costo de mercancía vendida y al haber de Inventario de mercancías. El faltante sube el costo.",
    "En el mismo ejemplo, ahora el conteo da $430.000. Los libros siguen en $465.000. Hay un faltante de $35.000.",
  ],
  /* El texto ya da el faltante: la cuenta va con él. */
  figuras: [cuentaDeConteo(ROTULOS_A5.otroConteo, C.libros, C.conteoFalta)],
  pregunta: "En el ajuste por faltante, ¿a qué lado va Inventario de mercancías?",
  opciones: [
    { id: "debe", texto: "Debe", devolucion: "Falta mercancía en la bodega, así que el activo baja. Inventario de mercancías va al haber." },
    { id: "haber", texto: "Haber", correcta: true },
    /* Tercera opción: anexo del lote 2 (Near). */
    { id: "no-se-mueve", texto: "No se mueve: solo cambia el costo", devolucion: "Si solo cambiara el costo, los libros seguirían con mercancía que ya no está en la bodega." },
  ],
  acierto: {
    texto: "Así es. Falta mercancía, así que el activo baja: va al haber.",
    /* El libro escribe «Inventario de mercancía»: plural por la regla 8. */
    asientos: [{ fecha: "31 de diciembre", lineas: [{ cuenta: CMV, lado: DEBE, monto: C.faltante }, { cuenta: INV, lado: HABER, monto: C.faltante }] }],
    pie: "Basado en el libro, p. 255",
  },
  error: { pie: "Basado en el libro, p. 255" },
  pie: "Basado en el libro, p. 255",
};

const LA_LISTA = {
  id: "la-lista",
  tipo: "lectura",
  parrafos: ["Esto encaja con la lista del libro: los sobrantes se anotan en el debe de Inventario de mercancías, y los faltantes, en el haber."],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 207-208",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "Si el conteo da más que los libros, hay un sobrante. Baja el costo de la mercancía vendida.",
    "Si da menos, hay un faltante. Sube el costo de la mercancía vendida.",
    "Los dos ajustes se hacen en el sistema permanente.",
  ],
  siguiente: "Siguiente: cómo se prepara una empresa antes de las pérdidas.",
  pie: "Basado en el libro, p. 255",
};

export const PIEZA_SOBRANTES_Y_FALTANTES = {
  id: A5_ID,
  numero: 5,
  titulo: "Sobrantes y faltantes",
  pantallas: [PORTADA, EL_CONTEO, SOBRANTE, FALTANTE, LA_LISTA, RESUMEN],
};
