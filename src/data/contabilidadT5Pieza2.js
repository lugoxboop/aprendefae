/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 5 · PIEZA 2 DE APRENDER — «Los tres momentos de una inversión».
 *
 * Célula B. Todo el texto que lee el estudiante vive en ESTE archivo, guardado
 * entero en orquestador/conocimiento/paquetes/b5-t5-aprender2.md. Precedencia
 * (Sakuta, 14-oct, todo con PASA de Shoko):
 *   1. la versión que manda de Futaba: sus textos ganan;
 *   2. la guía de Mai, la más reciente primero: v2c > v2b > v2 > v1.
 * Las citas del libro van con «» y su página, como en la pieza 1.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LA PIEZA (lo que lee CuatroCapas: título, objetivo y capa 1) ═══════════ */

export const PIEZA_TRES_MOMENTOS = {
  id: "b5-t5-a2-los-tres-momentos-de-una-inversion",
  numero: 2,
  titulo: "Los tres momentos de una inversión",
  objetivo: "Vas a ver cómo se anotan la compra de un título, el interés que da y su venta.",
  nombres: [
    {
      termino: "Tres momentos",
      definicion: "Una inversión se anota en tres momentos: cuando se compra, cuando da su rendimiento y cuando se vende.",
      delLibro: "«La contabilización de los activos financieros contempla tres momentos diferentes: la compra, el rendimiento generado por la inversión y la venta.» (p. 193)",
    },
    {
      termino: "La compra",
      definicion: "La compra se anota por lo que se paga. Si hubo gastos para hacer la compra, también se suman. El ejemplo del libro no trae gastos de compra, y la cuenta se llama Inversiones – títulos.",
    },
    {
      termino: "El rendimiento",
      definicion: "Cuando llega un interés o un dividendo, se anota como un ingreso. En esta materia, el interés va a Ingresos por intereses. En el ejemplo, el interés se paga a trimestre vencido. Es decir, se paga al terminar cada trimestre, cada tres meses.",
    },
    {
      termino: "La venta",
      definicion: "Si se vende por más de lo que costó, la diferencia es una ganancia. Si se vende por menos, la diferencia es una pérdida. En el ejemplo del libro, la inversión se acredita por lo que costaron los títulos vendidos.",
    },
  ],
};

/* ═══════════ CAPA 2 · «MÍRELO FUNCIONAR» · Santa Pacha y sus títulos ═══════════ */

/*
 * Los rótulos de la escena (Mai v2 §4.2 y v2b): fragmentos literales de los
 * pasos o de la capa 3. Cada hecho trae su fecha, su tipo y lo que muestra
 * plegado.
 */
export const ESCENA_T5_A2 = {
  hechos: [
    { fecha: "1 de mayo", tipo: "Compra", plegado: "$2.000.000" },
    { fecha: "1 de agosto", tipo: "Interés", plegado: "$120.000" },
    { fecha: "1 de agosto", tipo: "Venta", plegado: "Ganancia de $225.000" },
    { fecha: "1 de noviembre", tipo: "Interés", plegado: "$30.000" },
    { fecha: "1 de noviembre", tipo: "Venta", plegado: "Pérdida de $31.250" },
  ],
  efectivo: "Efectivo de sobra",
  compra: "$2.000.000",
  titulos: "2.500 títulos a $800 cada uno",
  inversiones: "Inversiones – títulos",
  bancos: "Bancos",
  tasa: "Interés del 24 % al año, al terminar cada trimestre",
  primerInteres: "Llega el primer interés",
  cuenta1: ["2.000.000 × 0,24 × 3/12", "= $120.000"],
  interes1: "$120.000",
  caja: "Caja",
  ingresos: "Ingresos por intereses",
  vendidos: "Vende 1.875 títulos",
  precio1: "A $920 cada uno",
  recibe1: "Recibe $1.725.000",
  recibido1: "$1.725.000",
  sinInteres: "Los $920 no incluyen el interés",
  costo1: "Le costaron $1.500.000",
  costado1: "$1.500.000",
  ganancia: "Ingresos financieros – ganancia en venta de títulos",
  diferencia1: "$225.000 de diferencia",
  quedan: "625 títulos que quedan",
  cuenta2: ["500.000 × 0,24 × 3/12", "= $30.000"],
  interes2: "$30.000",
  precio2: "Los vende a $750 cada uno",
  recibe2: "Recibe $468.750",
  recibido2: "$468.750",
  costo2: "Le habían costado $500.000",
  costado2: "$500.000",
  perdida: "Gastos financieros – pérdida en venta de títulos",
  diferencia2: "$31.250 de diferencia",
  debita: "se debita",
  acredita: "se acredita",
};

/* Los 21 pasos y el cierre, cada uno con su pie de fuente (Futaba). */
export const PASOS_T5_A2 = [
  { texto: "El 1 de mayo, Santa Pacha tiene $2.000.000 de efectivo de sobra por un tiempo.", pie: "Libro, p. 194" },
  { texto: "Compra 2.500 títulos a $800 cada uno.", pie: "Libro, p. 194" },
  { texto: "Se debita Inversiones – títulos y se acredita Bancos, los dos por $2.000.000.", pie: "Libro, p. 194" },
  { texto: "Los títulos pagan un interés del 24 % al año, al terminar cada trimestre.", pie: "Libro, p. 194" },
  { texto: "El 1 de agosto llega el primer interés.", pie: "Libro, p. 194" },
  { texto: "Cálculo: 2.000.000 × 0,24 × 3/12 = $120.000.", pie: "Libro, p. 194" },
  { texto: "Entra a Caja, que se debita, y se acredita Ingresos por intereses.", pie: "Basado en el libro, p. 194" },
  { texto: "Ese mismo día vende 1.875 títulos, el 75 %.", pie: "Libro, p. 194" },
  { texto: "Los vende a $920 cada uno y recibe $1.725.000.", pie: "Libro, p. 194" },
  { texto: "Ese efectivo entra a Caja, que se debita.", pie: "Libro, pp. 194-195" },
  { texto: "Los $920 no incluyen el interés, que ya se anotó aparte.", pie: "Libro, p. 194" },
  { texto: "Esos títulos le costaron $1.500.000.", pie: "Libro, p. 194" },
  { texto: "Por ese valor se acredita Inversiones – títulos.", pie: "Libro, p. 195" },
  { texto: "Vendió por más de lo que le costaron: los $225.000 de diferencia van a Ingresos financieros – ganancia en venta de títulos, que se acredita.", pie: "Libro, p. 195" },
  { texto: "El 1 de noviembre llega el interés de los 625 títulos que quedan.", pie: "Libro, p. 195" },
  { texto: "Cálculo: 500.000 × 0,24 × 3/12 = $30.000.", pie: "Libro, p. 195" },
  { texto: "Entra a Caja, que se debita, y se acredita Ingresos por intereses.", pie: "Basado en el libro, p. 195" },
  { texto: "Ese día los vende a $750 cada uno.", pie: "Libro, p. 195" },
  { texto: "Recibe $468.750, pero le habían costado $500.000.", pie: "Libro, p. 195" },
  { texto: "El efectivo entra a Caja, que se debita, y por el costo se acredita Inversiones – títulos.", pie: "Libro, p. 195" },
  { texto: "Vendió por menos: los $31.250 de diferencia van a Gastos financieros – pérdida en venta de títulos, que se debita.", pie: "Basado en el libro, p. 195" },
];
export const CIERRE_T5_A2 = {
  texto: "Se compró una vez, dio interés dos veces y se vendió en dos partes: una con ganancia y otra con pérdida.",
  pie: "Basado en el libro, pp. 194-195",
};

/* ═══════════ CAPA 3 · «AHORA PRUEBE USTED» · las dos ventas ═══════════ */

export const CONSIGNA_CAPA_3_T5_A2 = "Toca cada venta y compara lo que se recibió con lo que costó.";

/* Cerradas, cada una muestra su nombre y dos cifras: lo recibido y lo que costaron. */
export const VENTAS_T5_A2 = [
  {
    id: "venta-agosto",
    nombre: "Venta del 1 de agosto",
    cifras: ["Recibió $1.725.000", "Costaron $1.500.000"],
    revela: "Recibió más de lo que costaron: ganancia de $225.000. Inversiones – títulos se acredita por el costo, no por lo recibido.",
    pie: "Libro, pp. 194-195",
  },
  {
    id: "venta-noviembre",
    nombre: "Venta del 1 de noviembre",
    cifras: ["Recibió $468.750", "Costaron $500.000"],
    revela: "Recibió menos de lo que costaron: pérdida de $31.250. Inversiones – títulos también se acredita por el costo.",
    pie: "Libro, p. 195",
  },
];
export const FINAL_CAPA_3_T5_A2 = {
  texto: "En las dos ventas, la inversión se acredita por lo que costó. Lo que cambia es la diferencia: una vez es ganancia y otra vez es pérdida.",
  pie: "Basado en el libro, pp. 194-195",
};

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

export const PREGUNTA_FINAL_T5_A2 = "En la venta de agosto, ¿por cuánto se acredita Inversiones – títulos?";
/* En el orden de Futaba; UnaFrase las baraja una vez al cargar. */
export const OPCIONES_FINAL_T5_A2 = [
  {
    id: "b5-t5-a2-costo",
    texto: "Por $1.500.000, el costo de los 1.875 vendidos.",
    correcta: true,
    feedback: "Correcto. En el ejemplo, el libro acredita Inversiones – títulos por el costo: 1.875 títulos a $800. Lo que se recibió de más es la ganancia.",
  },
  {
    id: "b5-t5-a2-recibido",
    texto: "Por $1.725.000, lo que se recibió por la venta.",
    correcta: false,
    feedback: "No es esa. Los $1.725.000 entran a Caja. La inversión se acredita por lo que costó, y la diferencia va a la ganancia.",
  },
  {
    id: "b5-t5-a2-ganancia",
    texto: "Por $225.000, la ganancia que dejó la venta.",
    correcta: false,
    feedback: "No es esa. Los $225.000 son la ganancia y van a su propia cuenta. La inversión se acredita por lo que costaron esos títulos.",
  },
  {
    id: "b5-t5-a2-toda",
    texto: "Por $2.000.000, lo que costó toda la inversión.",
    correcta: false,
    feedback: "No es esa. Ese día solo se vendió el 75 %. Se acredita lo que costaron esos 1.875 títulos, no toda la inversión.",
  },
];

/* ═══════════ CAPA 2 LARGA: LOS PASOS QUE SE JUNTAN Y LA PARADA (hoja 7 de Mai, entrega 3 de Futaba) ═══════════ */

/*
 * De 21 pasos a 14 (Mai §1): las fusiones de Futaba menos 4 + 5, que no
 * cumple la regla 1 (en el estado del paso 5, la tasa del paso 4 ya no se
 * ve). Cada paso nuevo dice los textos de sus pasos seguidos, sin cambiar una
 * palabra. Los pies, los de Futaba; los pasos 3 y 4 conservan el suyo.
 */
export const FUSION_T5_A2 = {
  grupos: [[1, 2], [3], [4], [5], [6, 7], [8, 9], [10, 11], [12, 13], [14], [15], [16, 17], [18, 19], [20], [21]],
  pies: [
    "Libro, p. 194", "Libro, p. 194", "Libro, p. 194", "Libro, p. 194", "Basado en el libro, p. 194", "Libro, p. 194", "Libro, pp. 194-195",
    "Libro, pp. 194-195", "Libro, p. 195", "Libro, p. 195", "Basado en el libro, p. 195", "Libro, p. 195", "Libro, p. 195", "Basado en el libro, p. 195",
  ],
};
/* La predicción entre los pasos 10 y 11 (la que Futaba llamó «entre 9 y 10»). `antes`: el paso que viene. */
export const PARADA_T5_A2 = {
  antes: 11,
  pregunta: "Ya solo quedan 625 títulos. ¿Sobre qué valor se calcula el interés de noviembre?",
  opciones: [{ id: "dos-millones", texto: "$2.000.000" }, { id: "costo", texto: "$1.500.000" }, { id: "quedan", texto: "$500.000" }],
  correcta: "quedan",
  falla: {
    "dos-millones": "Ya no hay 2.500 títulos: quedan 625. Son 625 × $800 = $500.000.",
    costo: "Eso costaron los títulos que vendió. El interés se paga sobre los que quedan: 625 × $800 = $500.000.",
  },
  pie: "Libro, p. 195",
  resaltados: ["quedan"],
};
