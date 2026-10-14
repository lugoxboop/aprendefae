/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · H3 DE HACER — «¿Cuánto vale lo que sobró?» (Célula C).
 *
 * Fuente: la v1 de Near y su corrección 2, las dos con PASA de Mello (tanda
 * corregida). Manda la más nueva: los dos errores del ítem 1 ya no nombran el
 * método al que corresponde la cifra («ese es el valor con UEPS», «con el
 * promedio»), porque regalaban los ítems 2 y 4. Copias en
 * orquestador/conocimiento/paquetes/t7-1-h3-v1.md y t7-1-h3-cambios.md; una
 * prueba compara cada texto de aquí contra ellas.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos (5 posibles), con piso del 50 %. Va al catálogo del servidor
 * (migración 0093, que corre Mateo).
 *
 * Un solo problema, resuelto con los tres métodos: cinco ítems, un solo
 * intento por ítem (patrón v3.2). Los ítems van en el orden de la tabla; las
 * opciones de cada uno, en orden aleatorio.
 *
 * LAS CIFRAS no se escriben a mano: salen de las dos capas del inventario y
 * de las unidades vendidas (CAPAS_H3, VENDIDAS_H3) con los tres métodos
 * (calcularH3). Una prueba las recalcula y las compara con las de Near; el
 * script de L (verifica_cifras_t7_1) dio lo mismo.
 *
 * NOTA DE MELLO: 154.000 (PEPS) y 147.500 (promedio) coinciden con un
 * ejercicio del banco común (pp. 268-269). Hoy no regalan nada, porque ese
 * ejercicio no está publicado en el sitio. Si algún día se publica, hay que
 * volver a mirar estas dos cifras.
 *
 * Lo que la v1 no trae y se toma de la convención de H1, H2 y el Tema 3: los
 * botones «Siguiente ítem» y «Ver mi resumen».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H3_ID = "t7-1-cuanto-vale-lo-que-sobro";

export const H3 = {
  id: H3_ID,
  nombre: "¿Cuánto vale lo que sobró?",
  /* La v1: «Etiqueta». */
  etiqueta: "¿Cuánto vale lo que sobró? · Inventarios I",
  entrada: "Papelería El Sol usa el sistema de inventario periódico. Estos son sus datos del mes.",
  consigna: "Calcula cuánto valen las 10 cajas que quedaron, con cada método. Tienes un solo intento por pregunta.",
  pie: "Basado en el libro, pp. 215-221",
};

/* Los datos del mes. Las cifras de la ficha salen de aquí. */
export const CAPAS_H3 = [
  { id: "inicio", cajas: 20, costo: 12_800 },
  { id: "compra", cajas: 60, costo: 15_400 },
];
export const VENDIDAS_H3 = 70;

const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const quedan = CAPAS_H3.reduce((s, c) => s + c.cajas, 0) - VENDIDAS_H3;

/* La ficha de valoración (regla 10, versión periódico), fila por fila como la tabla de la v1. */
export const FICHA_H3 = [
  ["Quién", "Papelería El Sol"],
  ["Qué tenía al inicio", `${CAPAS_H3[0].cajas} cajas a $${miles(CAPAS_H3[0].costo)} cada una`],
  ["Qué compró en el mes", `${CAPAS_H3[1].cajas} cajas a $${miles(CAPAS_H3[1].costo)} cada una`],
  ["Qué vendió", `${VENDIDAS_H3} cajas`],
  ["Qué quedó según el conteo físico", `${quedan} cajas`],
];

/*
 * Los tres métodos, en periódico: el inventario final son las cajas que
 * quedan según el conteo, valoradas con el método.
 *   PEPS      salen primero las del inicio: quedan las últimas compradas
 *   UEPS      salen primero las últimas: quedan las del inicio
 *   promedio  el costo de todo entre todas las cajas, por las que quedan
 */
export function calcularH3(capas = CAPAS_H3, vendidas = VENDIDAS_H3) {
  const disponibles = capas.reduce((s, c) => s + c.cajas, 0);
  const costoTotal = capas.reduce((s, c) => s + c.cajas * c.costo, 0);
  const q = disponibles - vendidas;
  const valorar = (orden) => {
    let falta = q;
    let valor = 0;
    for (const c of orden) {
      const toma = Math.min(falta, c.cajas);
      valor += toma * c.costo;
      falta -= toma;
    }
    return valor;
  };
  const promedio = costoTotal / disponibles;
  return {
    disponibles, costoTotal, quedan: q,
    peps: valorar([...capas].reverse()),
    ueps: valorar(capas),
    promedio,
    finalPromedio: q * promedio,
  };
}

export const CIFRAS_H3 = calcularH3();
const C = CIFRAS_H3;
const puntoMedio = (CAPAS_H3[0].costo + CAPAS_H3[1].costo) / 2;

export const BOTON_H3 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

export const METODOS_H3 = [
  { valor: "peps", texto: "PEPS" },
  { valor: "ueps", texto: "UEPS" },
  { valor: "promedio", texto: "Promedio ponderado" },
];

const RETRO_ITEM5 = "Aquí el precio subió de $12.800 a $15.400. Con PEPS, las cajas que quedan llevan el precio más reciente, que es el más alto.";

/*
 * Los cinco ítems. Cada uno trae su respuesta, su acierto y dos distractores
 * con su retroalimentación. `encabezado` es el rótulo del método que abre el
 * ítem, cuando la v1 lo trae (ítems 1 a 3).
 */
export const ITEMS_H3 = [
  {
    id: "peps", subtema: "PEPS", encabezado: "Método PEPS",
    pregunta: "Con PEPS, ¿cuánto vale el inventario final?",
    correcta: C.peps,
    acierto: "Así es. Primero salen las 20 del inicio y luego 50 de las compradas. Quedan 10 de las compradas: 10 × $15.400 = $154.000.",
    distractores: [
      /* Corrección 2 (PASA de Mello): ya no nombra el método de la cifra. */
      { valor: C.ueps, retro: "Pusiste a las 10 cajas el precio equivocado. Con PEPS salen primero las del inicio, así que quedan 10 de las compradas." },
      { valor: C.finalPromedio, retro: "Ese no es el precio de las cajas que quedan con PEPS. Con PEPS quedan 10 de las compradas, a $15.400 cada una." },
    ],
  },
  {
    id: "ueps", subtema: "UEPS", encabezado: "Método UEPS (no válido bajo NIIF)",
    pregunta: "Con UEPS, ¿cuánto vale el inventario final?",
    correcta: C.ueps,
    acierto: "Así es. Primero salen las 60 compradas y luego 10 de las del inicio. Quedan 10 del inicio: 10 × $12.800 = $128.000.",
    distractores: [
      { valor: C.peps, retro: "Ese es el valor con PEPS. Con UEPS salen primero las últimas que entraron, así que quedan 10 de las del inicio, a $12.800." },
      { valor: CAPAS_H3[0].cajas * CAPAS_H3[0].costo, retro: "Ese es el valor de las 20 cajas del inicio. Solo quedan 10." },
    ],
  },
  {
    id: "costo-promedio", subtema: "Promedio ponderado", encabezado: "Método del costo promedio ponderado",
    pregunta: "¿Cuál es el costo unitario promedio?",
    correcta: C.promedio,
    acierto: "Así es. Las 80 cajas cuestan $1.180.000 en total. Cada una sale a $14.750.",
    distractores: [
      { valor: puntoMedio, retro: "Ese es el punto medio entre $12.800 y $15.400. Pero hay 60 cajas a $15.400 y solo 20 a $12.800. Hay que dividir el costo de todo entre todas las cajas." },
      { valor: CAPAS_H3[1].costo, retro: "Ese es el precio de la última compra. El promedio junta las 20 cajas del inicio y las 60 compradas." },
    ],
  },
  {
    id: "final-promedio", subtema: "Promedio ponderado", encabezado: null,
    pregunta: "Con el promedio ponderado, ¿cuánto vale el inventario final?",
    correcta: C.finalPromedio,
    acierto: "Así es: 10 × $14.750 = $147.500.",
    distractores: [
      { valor: C.quedan * puntoMedio, retro: "Usaste el punto medio de los dos precios. Con el promedio ponderado son 10 cajas a $14.750." },
      { valor: C.costoTotal, retro: "Ese es el costo de todas las cajas disponibles. Solo quedan 10." },
    ],
  },
  {
    id: "mas-alto", subtema: "Comparar métodos", encabezado: null,
    pregunta: "¿Qué método da el inventario final más alto en este caso?",
    /* La respuesta vale solo para este caso (precios al alza, p. 215): no afirma que PEPS dé siempre el más alto. */
    correcta: "peps",
    opcionesTexto: METODOS_H3,
    acierto: "Así es. El precio subió de $12.800 a $15.400. Con PEPS, las cajas que quedan llevan el precio más reciente, que es el más alto.",
    distractores: [
      { valor: "ueps", retro: RETRO_ITEM5 },
      { valor: "promedio", retro: RETRO_ITEM5 },
    ],
  },
];

/* El resumen del cierre, con la frase de H1 y H2. */
export const resumenH3 = (bien, total) => `${bien} de ${total} al primer toque.`;
