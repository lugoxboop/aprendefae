import { BOTON, DEBE, HABER } from "./contabilidadT7_3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A5 DE APRENDER — «Sobrantes y faltantes» (Célula C).
 *
 * Fuente: el RECORTE del lote 1 de Near (entrega 3,
 * orquestador/conocimiento/paquetes/lote1-recortes-t73-v1.md), con las
 * correcciones de Mello: la línea nueva del resumen («Estos ajustes son del
 * sistema permanente.», mello-recortes-v1.md) y, llegada por L, la pista de
 * P1. Cuatro pantallas: el sobrante y el faltante con las dos barras de
 * libros contra conteo, y el resumen. La respuesta regalada de P3 (el
 * faltante «al haber») se corrigió: la regla va en el acierto.
 *
 * Los ejemplos I-1 e I-2 del libro (p. 255). «Inventario de mercancía» del
 * libro va en plural (regla 8). Sin cifras construidas.
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
 * Los usa también H5. Las barras del recorte (libros contra conteo) usan
 * los mismos rótulos.
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
const R = ROTULOS_A5;

/*
 * Las dos barras: saldo en libros y conteo físico (Patrón T7-3). Toda la
 * pieza usa una sola escala, la del conteo mayor: el saldo en libros mide
 * lo mismo en cada pantalla, y el conteo crece o se acorta.
 */
const ESCALA = C.conteoSobra;
export const barrasDeConteo = (titulo, libros, conteo) => ({
  tipo: "barras", titulo, escala: ESCALA,
  barras: [{ rot: R.libros, v: libros }, { rot: R.conteo, v: conteo }],
});

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Vas a ver qué pasa cuando el conteo y los libros no coinciden.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 254-255",
};

/*
 * Aciertos C7: P1 sale de t7-3-tres-aciertos-c7.md (Near), que Mello pasa sin
 * correcciones (auditoria-mello-enganche-v6-y-t7-3-aciertos.md, §2.3). Las
 * dos condiciones del libro van a la vista: la de la ley arriba («al menos…
 * a más tardar…») y la del permanente en el acierto («solo»). Sin plegado.
 * La «Opcional» de Mello (devolver «Baja el costo…») NO se aplica.
 */
const SOBRANTE = {
  id: "sobrante",
  /* Pista de Mello (mello-pistas-distractores-v1.md): gana sobre la del recorte. */
  pista: "El sobrante no es todo lo que hay en la bodega. ¿Qué parte de lo contado es?",
  tipo: "eleccion",
  parrafos: ["La ley pide un inventario físico al menos una vez al año, a más tardar el 31 de diciembre."],
  figuras: [barrasDeConteo(R.ejemplo, C.libros, C.conteoSobra)],
  pregunta: "El conteo da más. ¿Cuánto sobra?",
  /* «error · $465.000 o $495.000»: el mismo texto para las dos. */
  opciones: [
    { id: "sobrante", texto: "$30.000", correcta: true },
    { id: "libros", texto: "$465.000", devolucion: "El sobrante es solo lo que el conteo da de más." },
    { id: "conteo", texto: "$495.000", devolucion: "El sobrante es solo lo que el conteo da de más." },
  ],
  acierto: {
    texto: "Así es: $495.000 − $465.000 = $30.000. Estos ajustes solo se dan en el sistema permanente.",
    asientos: [{ fecha: null, lineas: [{ cuenta: INV, lado: DEBE, monto: C.sobrante }, { cuenta: CMV, lado: HABER, monto: C.sobrante }] }],
    pie: "Basado en el libro, pp. 254-255",
  },
  error: { pie: "Basado en el libro, p. 255" },
  pie: "Basado en el libro, p. 255",
};

const FALTANTE = {
  id: "faltante",
  pista: "Si falta mercancía, el inventario de los libros tiene que bajar. ¿De qué lado baja un activo?",
  tipo: "eleccion",
  /* Las mismas dos barras, con el conteo más corto. */
  figuras: [barrasDeConteo(R.otroConteo, C.libros, C.conteoFalta)],
  tras: ["Ahora el conteo da menos: falta mercancía."],
  pregunta: "En el ajuste por faltante, ¿a qué lado va Inventario de mercancías?",
  opciones: [
    { id: "debe", texto: "Debe", devolucion: "Falta mercancía en la bodega, así que el activo baja." },
    { id: "haber", texto: "Haber", correcta: true },
    { id: "no-se-mueve", texto: "No se mueve: solo cambia el costo", devolucion: "Si solo cambiara el costo, los libros seguirían con mercancía que ya no está en la bodega." },
  ],
  acierto: {
    texto: "Así es: va al haber, y Costo de mercancía vendida, al debe.",
    porque: "El faltante sube el costo de la mercancía vendida. Así encaja con la lista del libro: los sobrantes van al debe de Inventario de mercancías, y los faltantes, al haber.",
    asientos: [{ fecha: null, lineas: [{ cuenta: CMV, lado: DEBE, monto: C.faltante }, { cuenta: INV, lado: HABER, monto: C.faltante }] }],
    pie: "Basado en el libro, pp. 207-208 y 255",
  },
  error: { pie: "Basado en el libro, p. 255" },
  pie: "Basado en el libro, p. 255",
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  /* «Conteo mayor: sobrante · Conteo menor: faltante»: un par de barras para cada uno. */
  figuras: [
    barrasDeConteo("Conteo mayor: sobrante", C.libros, C.conteoSobra),
    barrasDeConteo("Conteo menor: faltante", C.libros, C.conteoFalta),
  ],
  tras: [
    "Si el conteo da más que los libros, hay un sobrante, y baja el costo de la mercancía vendida.",
    "Si da menos, hay un faltante, y ese costo sube.",
    /* Mello: la línea que el resumen había perdido. */
    "Estos ajustes son del sistema permanente.",
  ],
  siguiente: "Siguiente: cómo se prepara una empresa antes de las pérdidas.",
  pie: "Basado en el libro, p. 255",
};

export const PIEZA_SOBRANTES_Y_FALTANTES = {
  id: A5_ID,
  numero: 5,
  titulo: "Sobrantes y faltantes",
  /* Recorte del lote 1: los textos se ven enteros (los midió Near); el «¿Por qué?» va aparte. */
  textosEnteros: true,
  pantallas: [PORTADA, SOBRANTE, FALTANTE, RESUMEN],
};
