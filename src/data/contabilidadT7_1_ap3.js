/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP3 DE APRENDER — «Tres formas de ponerle precio a lo que quedó»
 * (B-1, pp. 209 y 215-221).
 *
 * Fuente: cuatro capas de Near, aplicadas en este orden; si dos chocan,
 * manda la más nueva (regla de L):
 *   1. la v1                             paquetes/t7-1-ap3-v1.md
 *   2. los cambios de la v2 (P0-P9, las tres correcciones de Mello)
 *                                        paquetes/t7-1-ap3-v2-cambios.md
 *   3. la glosa de «impuesto de renta» en P7, con PASA de Mello
 *                                        paquetes/t7-1-ap3-glosa-renta.md
 *   4. los opcionales que aceptó Near: «cajas» pasa a «unidades»
 *                                        paquetes/t7-1-ap3-opcionales.md
 * Una prueba compara cada texto de aquí contra ellas, letra por letra.
 *
 * Decisiones de esta noche (protocolo nocturno, para que L las revise):
 *   · los aciertos de P4 y P5 van con el texto original de la v1. Su
 *     reemplazo solo valía «si tu medición confirma que no cumple», y Mello,
 *     al pasar la v2, no lo pidió
 *   · P6 y P7, sin «Figura de AP3» de Watari: la forma que la propia v2 le
 *     indica a Watari (P6, una tarjeta por método, sin quitar contenido; P7,
 *     tres tarjetas con «a favor» y «en contra»), con el patrón de la célula
 *
 * UEPS va con el rótulo «UEPS (no válido bajo NIIF)», sin advertencias.
 * Nada muestra la renta del 33 %. Pieza de Aprender: cero FP.
 *
 * Lo que no traen las capas y se toma de la convención de AP1, AP2 y A6: los
 * botones «Empezar», «Seguir», «Confirmar» y «Probar otra». Interfaz del
 * patrón: «Correcto.» e «Incorrecto.».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AP3_ID = "t7-1-a3-tres-formas";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto." };

export const UEPS = "UEPS (no válido bajo NIIF)";

export const cifra = (n) => n.toLocaleString("es-CO").replace(/,/g, ".");

/* ═══════════ LAS CIFRAS DE B-1 (se calculan, no se copian) ═══════════ */

const INICIO = { unidades: 10, costo: 20000 };
const COMPRA = { unidades: 30, costo: 25000 };
const VENDIDAS = 35;
const disponibles = INICIO.unidades + COMPRA.unidades; // 40
const quedan = disponibles - VENDIDAS; // 5
const costoDisponible = INICIO.unidades * INICIO.costo + COMPRA.unidades * COMPRA.costo; // 950.000
const promedio = costoDisponible / disponibles; // 23.750

export const CIFRAS = {
  inicial: INICIO.unidades * INICIO.costo, // 200.000
  compras: COMPRA.unidades * COMPRA.costo, // 750.000
  costoDisponible,
  disponibles,
  quedan,
  promedio,
  peps: quedan * COMPRA.costo, // 125.000
  ueps: quedan * INICIO.costo, // 100.000
  ponderado: quedan * promedio, // 118.750
  /* El distractor de P5: el punto medio de los dos precios (construcción de Near, registro 5c). */
  puntoMedio: (INICIO.costo + COMPRA.costo) / 2, // 22.500
};

const $ = (n) => `$${cifra(n)}`;

/* Las dos opciones de P3 y P4: las mismas, en orden aleatorio. */
const DE_LA_COMPRA = `De las 30 compradas en el periodo, a ${$(COMPRA.costo)}`;
const DEL_INICIO = `De las 10 del inicio, a ${$(INICIO.costo)}`;

/* ═══════════ LAS PANTALLAS, EN ORDEN ═══════════ */

const PORTADA = {
  id: "portada",
  tipo: "lectura",
  objetivo: "Al terminar, sabrás calcular el valor del inventario final con PEPS, UEPS y promedio ponderado. Y sabrás por qué cada método da una cifra distinta.",
  parrafos: [],
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 215-221",
};

/* P1 · El problema. */
const EL_PROBLEMA = {
  id: "el-problema",
  tipo: "lectura",
  parrafos: [
    "Al cierre, el conteo físico dice cuántas unidades quedaron. Pero no dice cuánto vale cada una. Si se compraron a precios distintos, ¿qué precio se les pone?",
    "El libro da tres métodos para eso: PEPS, UEPS y promedio ponderado. Cada empresa escoge el que le sirva más.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 209 y 215",
};

/* P2 · Los datos. La ficha adaptada de Near: B-1 no es una transacción. */
const LOS_DATOS = {
  id: "los-datos",
  tipo: "lectura",
  parrafos: ["Un negocio tiene estos datos al final de un periodo. Usa el sistema de inventario periódico."],
  ficha: [
    { dato: "Quién", texto: "Un negocio (el libro no le da nombre)" },
    { dato: "Qué tenía al inicio (inventario inicial)", texto: `10 unidades a ${$(INICIO.costo)} cada una: ${$(CIFRAS.inicial)}` },
    { dato: "Qué compró en el periodo", texto: `30 unidades a ${$(COMPRA.costo)} cada una: ${$(CIFRAS.compras)}` },
    { dato: "Qué vendió", texto: `${VENDIDAS} unidades` },
    { dato: "Qué quedó, según el conteo físico", texto: `${quedan} unidades` },
  ],
  calculos: [`Unidades disponibles = 10 + 30 = ${disponibles}`],
  cierre: "Se vendieron 35 de las 40 unidades, así que en la bodega quedan 5. ¿Qué precio les ponemos?",
  boton: "Ver PEPS",
  pie: "Basado en el libro, pp. 219-220",
};

/* P3 · PEPS. La línea del flujo de costos es de la v2, con «unidades» (opcionales). */
const PEPS = {
  id: "peps",
  tipo: "eleccion",
  encabezado: "Método PEPS",
  parrafos: [
    "PEPS quiere decir: primeras en entrar, primeras en salir. El método supone que lo primero que se compró es lo primero que se vende.",
    "El libro aclara que no importa el orden real en que salen las unidades. El método sigue el orden de los costos.",
  ],
  pregunta: "Con PEPS, ¿de qué grupo son las 5 unidades que quedaron?",
  opciones: [
    { id: "compradas", texto: DE_LA_COMPRA, correcta: true },
    {
      id: "inicio",
      texto: DEL_INICIO,
      correcta: false,
      devolucion: "Las 10 del inicio fueron las primeras en entrar, así que con PEPS son las primeras en salir. Se vendieron todas. Las que quedan son de la última compra.",
    },
  ],
  pie: "Basado en el libro, pp. 215 y 219",
  error: { pie: "Basado en el libro, p. 219" },
  acierto: {
    texto: "Así es. Primero se venden las 10 del inicio y luego 25 de las compradas. Quedan 5 de las compradas, a $25.000 cada una.",
    calculos: [`Inventario final (PEPS) = 5 × ${$(COMPRA.costo)} = ${$(CIFRAS.peps)}`],
    pie: "Basado en el libro, p. 219",
  },
};

/* P4 · UEPS, con su rótulo. El acierto, el original de la v1. */
const UEPS_P = {
  id: "ueps",
  tipo: "eleccion",
  encabezado: `Método ${UEPS}`,
  parrafos: [
    "UEPS quiere decir: últimas en entrar, primeras en salir. El método supone que lo último que se compró es lo primero que se vende.",
    "Aquí tampoco importa qué unidades salen de verdad. Importa el orden de los costos.",
  ],
  pregunta: "Con UEPS, ¿de qué grupo son las 5 unidades que quedaron?",
  opciones: [
    { id: "inicio", texto: DEL_INICIO, correcta: true },
    {
      id: "compradas",
      texto: DE_LA_COMPRA,
      correcta: false,
      devolucion: "Con UEPS salen primero las últimas que entraron: las 30 compradas. Se vendieron todas, y además 5 de las del inicio. Las que quedan son del inicio.",
    },
  ],
  pie: "Basado en el libro, pp. 216 y 220",
  error: { pie: "Basado en el libro, p. 220" },
  acierto: {
    texto: "Así es. Se venden las 30 compradas y 5 de las 10 del inicio. Quedan 5 del inicio, a $20.000 cada una.",
    /* C7-3: el libro rotula este cálculo «(método PEPS)»; aquí va «(UEPS)». */
    calculos: [`Inventario final (UEPS) = 5 × ${$(INICIO.costo)} = ${$(CIFRAS.ueps)}`],
    pie: "Basado en el libro, p. 220",
  },
};

/* P5 · Promedio ponderado. El acierto, el original de la v1. */
const PROMEDIO = {
  id: "promedio-ponderado",
  tipo: "eleccion",
  encabezado: "Método del costo promedio ponderado",
  parrafos: [
    "El promedio ponderado no elige un grupo. Junta todo lo disponible y le da a cada unidad el mismo costo: el costo unitario promedio.",
    "Las unidades disponibles son las del inicio más las compradas. Para hallar el costo promedio, se toma el costo de todas ellas y se divide entre cuántas son.",
  ],
  calculos: [`Costo de las unidades disponibles = ${$(CIFRAS.inicial)} + ${$(CIFRAS.compras)} = ${$(costoDisponible)}`, `Unidades disponibles = ${disponibles}`],
  pregunta: "¿Cuál es el costo unitario promedio?",
  opciones: [
    { id: "ponderado", texto: $(promedio), correcta: true },
    {
      id: "punto-medio",
      texto: $(CIFRAS.puntoMedio),
      correcta: false,
      devolucion: "$22.500 es el punto medio entre $20.000 y $25.000. Pero hay 30 unidades a $25.000 y solo 10 a $20.000. Por eso se divide el costo de todo entre todas las unidades.",
    },
    {
      id: "ultima-compra",
      texto: $(COMPRA.costo),
      correcta: false,
      devolucion: "Ese es el precio de la última compra. El promedio junta las 10 unidades del inicio y las 30 compradas.",
    },
  ],
  pie: "Basado en el libro, pp. 218 y 220",
  error: { pie: "Basado en el libro, pp. 218 y 220" },
  acierto: {
    texto: "Así es. Cada unidad queda con el mismo costo. Las 5 que quedan valen 5 × $23.750 = $118.750.",
    calculos: [`${$(costoDisponible)} ÷ ${disponibles} = ${$(promedio)} por unidad`, `Inventario final (promedio ponderado) = 5 × ${$(promedio)} = ${$(CIFRAS.ponderado)}`],
    pie: "Basado en el libro, p. 220",
  },
};

/* P6 · Lado a lado. Las cuatro columnas de la v1, una tarjeta por método (v2, nota para Watari). */
const LADO_A_LADO = {
  id: "lado-a-lado",
  tipo: "eleccion",
  parrafos: [],
  metodos: {
    columnas: ["Qué unidades quedan", "Costo de cada una", "Inventario final"],
    filas: [
      { metodo: "PEPS", valores: ["5 de las compradas", $(COMPRA.costo), $(CIFRAS.peps)] },
      { metodo: UEPS, valores: ["5 del inicio", $(INICIO.costo), $(CIFRAS.ueps)] },
      { metodo: "Promedio ponderado", valores: ["5, todas mezcladas", $(promedio), $(CIFRAS.ponderado)] },
    ],
  },
  pregunta: "¿Por qué PEPS da el valor más alto en este ejemplo?",
  opciones: [
    { id: "reciente", texto: "Porque las 5 que quedan son de la compra más reciente, que costó más.", correcta: true },
    {
      id: "siempre",
      texto: "Porque PEPS siempre da el valor más alto.",
      correcta: false,
      devolucion: "No siempre. Aquí da el valor más alto porque el precio subió de $20.000 a $25.000. El libro explica que, cuando los precios suben, PEPS deja el inventario con los precios de compra recientes.",
    },
    {
      id: "mas-unidades",
      texto: "Porque con PEPS quedan más unidades.",
      correcta: false,
      devolucion: "Con los tres métodos quedan las mismas 5 unidades. Lo que cambia es el precio que se le pone a cada una.",
    },
  ],
  pie: "Basado en el libro, pp. 219-221",
  error: { pie: "Basado en el libro, pp. 215 y 219-220" },
  acierto: {
    texto: "Exacto. Las 5 unidades son las mismas con los tres métodos. Cambia el precio: PEPS usa el más reciente, UEPS el más antiguo y el promedio queda en medio.",
    calculos: [],
    pie: "Basado en el libro, pp. 215, 216 y 221",
  },
};

/*
 * P7 · A favor y en contra (nueva en la v2). Tras la línea de «lo vendido»,
 * la glosa de «impuesto de renta» (capa 3, PASA de Mello). El pie de
 * colocando es el de la glosa, que manda sobre el de la v2.
 */
const A_FAVOR_Y_EN_CONTRA = {
  id: "a-favor-y-en-contra",
  tipo: "eleccion",
  encabezado: "Lo que el libro dice a favor y en contra",
  parrafos: [
    "En estas líneas, lo vendido es lo que costaron las unidades que salieron.",
    "El impuesto de renta es el impuesto que se calcula sobre la utilidad.",
  ],
  tarjetas: {
    rotulos: { aFavor: "A favor", enContra: "En contra" },
    metodos: [
      {
        metodo: "PEPS",
        aFavor: "El inventario final queda con los últimos costos de compra, muy cerca de los costos actuales.",
        enContra: "Si los precios suben, lo vendido queda con costos antiguos frente a ventas actuales. La utilidad sale mayor, pero el libro la llama ficticia.",
      },
      {
        metodo: UEPS,
        aFavor: "Lo vendido queda con los costos más recientes. Si los precios suben, la utilidad baja y el impuesto de renta también.",
        enContra: "El inventario final queda con costos antiguos, no actualizados.",
      },
      {
        metodo: "Promedio ponderado",
        aFavor: "Si los precios no cambian de forma brusca, limita las distorsiones, porque le da a cada unidad el mismo costo.",
        enContra: "El inventario sigue con parte de los costos antiguos. Eso puede alejarlo de los precios de hoy.",
      },
    ],
  },
  pregunta: "Alguien dice: «UEPS no tiene sentido, porque la tienda vende primero lo que llegó primero». ¿Qué responde el libro?",
  opciones: [
    { id: "orden-de-costos", texto: "Que UEPS sigue el orden de los costos, no el de las mercancías.", correcta: true },
    {
      id: "debe-vender",
      texto: "Que con UEPS la tienda debe vender primero lo último que llegó.",
      correcta: false,
      devolucion: "El libro dice lo contrario: los métodos no tienen que coincidir con la forma en que se manejan las mercancías.",
    },
    {
      id: "tiene-razon",
      texto: "Que tiene razón, y por eso UEPS no sirve.",
      correcta: false,
      devolucion: "El libro reconoce que muchos creen eso, pero responde que UEPS no se basa en el orden de las mercancías, sino en el de los precios.",
    },
  ],
  pie: "Basado en el libro, pp. 214-218",
  error: { pie: "Basado en el libro, p. 217" },
  acierto: {
    texto: "Exacto. El libro dice que UEPS no se basa en el orden de los artículos, sino en el de sus costos. Y que el método no tiene que coincidir con el manejo físico.",
    calculos: [],
    pie: "Basado en el libro, p. 217",
  },
};

/* P8 · La recomendación del libro (nueva en la v2). Usa «impuesto de renta» sin repetir la glosa. */
const LA_RECOMENDACION = {
  id: "la-recomendacion",
  tipo: "eleccion",
  encabezado: "La recomendación del libro",
  parrafos: [
    "Según el libro, cada empresa escoge el método que más le sirva. Pero el libro añade una recomendación.",
    "Recomienda escoger PEPS en épocas de deflación, y UEPS en épocas de inflación.",
    /* La segunda frase es construcción de Near, marcada («deflación»): Mello la aceptó con tres condiciones. */
    "Una época de inflación es, como dice el libro, una época de alza en los precios. En la deflación pasa lo contrario: los precios bajan.",
    "El porqué de UEPS lo da el libro: si los precios suben, lo vendido queda con los costos más recientes, que son más altos. Así baja la utilidad, y también el impuesto de renta.",
  ],
  pregunta: "Según el libro, ¿por qué conviene UEPS cuando los precios suben?",
  opciones: [
    { id: "menos-impuesto", texto: "Porque lo vendido queda más caro, la utilidad baja y el impuesto también.", correcta: true },
    {
      id: "costos-recientes",
      texto: "Porque deja el inventario final con los costos más recientes.",
      correcta: false,
      devolucion: "Ese es PEPS. Con UEPS, el inventario final queda con los costos más antiguos.",
    },
    {
      id: "mas-unidades",
      texto: "Porque con UEPS se venden más unidades.",
      correcta: false,
      devolucion: "Las unidades vendidas son las mismas con cualquier método. Lo que cambia es el costo que se les pone.",
    },
  ],
  pie: "Basado en el libro, pp. 215 y 217",
  error: { pie: "Basado en el libro, pp. 215-217 y 219-221" },
  acierto: {
    texto: "Exacto. Así lo explica el libro: con precios en alza, UEPS da más costo, menos utilidad y menos impuesto de renta.",
    calculos: [],
    pie: "Basado en el libro, pp. 215 y 217",
  },
};

/* P9 · Resumen: las cuatro de la v1 y las dos de la v2 (la primera, con «unidades»). Sin botón. */
const RESUMEN = {
  id: "resumen",
  tipo: "lectura",
  parrafos: [
    "Con PEPS, lo que queda lleva los precios de las últimas compras.",
    "Con UEPS, lo que queda lleva los precios más antiguos.",
    "Con el promedio ponderado, todo lo disponible se junta en un solo costo por unidad.",
    "Las unidades que quedan son las mismas. Lo que cambia es el precio.",
    "Los métodos siguen el orden de los costos, no el de las unidades que salen.",
    "El libro recomienda PEPS en épocas de deflación y UEPS en épocas de inflación.",
  ],
  siguiente: "Siguiente: «El cierre en periódico».",
  boton: null,
  pie: "Basado en el libro, pp. 215-221",
};

export const PIEZA_TRES_FORMAS = {
  id: AP3_ID,
  numero: 3,
  titulo: "Tres formas de ponerle precio a lo que quedó",
  pantallas: [PORTADA, EL_PROBLEMA, LOS_DATOS, PEPS, UEPS_P, PROMEDIO, LADO_A_LADO, A_FAVOR_Y_EN_CONTRA, LA_RECOMENDACION, RESUMEN],
};
