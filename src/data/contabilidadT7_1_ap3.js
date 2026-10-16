/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · AP3 DE APRENDER — «Tres formas de ponerle precio a lo que quedó»
 * (B-1, pp. 209 y 215-221).
 *
 * Fuente: el RECORTE del lote 1 de Near, con las correcciones de Mello
 * encima (sus correcciones ganan):
 *   · paquetes/lote1-recortes-t71-v1.md, sección «t7-1-a3-tres-formas»
 *   · paquetes/mello-recortes-v1.md, «A3 «Tres formas de ponerle precio»»
 * Una prueba compara cada texto de aquí contra ellos, letra por letra.
 *
 * Las tres correcciones de Mello, aplicadas:
 *   1. el plegado de P6 ya no le inventa el porqué a PEPS («pero no dice por
 *      qué»). Trae «cuando» (la condición de la recomendación): por la regla
 *      de L no se pliega, y el componente lo deja a la vista (ver TresFormas)
 *   2. el acierto de P6 ya no nombra el impuesto de renta; su glosa va en la
 *      tarjeta UEPS de P7 («el que va sobre la utilidad»), y por eso el
 *      plegado de P6 ya no la lleva
 *   3. la tarjeta «En contra» de PEPS dice por qué la utilidad es «ficticia»
 * La opcional de P8 («cajas» → «unidades») NO se aplica.
 *
 * ACIERTOS C7 (encima de lo anterior; reemplaza 1 y 2): P6 sale del paquete
 * t7-1-a3-la-recomendacion-c7.md de Near con A3-1 y A3-2 de Mello
 * (auditoria-mello-a4-v5-y-a3-recomendacion.md, §2). Sin plegado en P6; el
 * impuesto de renta se nombra y se define en su acierto, y la tarjeta UEPS
 * de P7 dice «el impuesto sobre la utilidad».
 *
 * Los ids que siguen conservan su id. Nuevos: `la-refutacion` (sale de la
 * vieja pregunta `a-favor-y-en-contra`, que ahora son tarjetas) y la pregunta
 * de `la-recomendacion`. Sale `los-datos`: sus cifras pasan a la pila de P1.
 *
 * Los pies no vienen en el recorte: cada pantalla que sigue conserva el suyo;
 * `la-refutacion`, el de la página que cita (p. 217).
 *
 * UEPS va con el rótulo «UEPS (no válido bajo NIIF)», sin advertencias.
 * Nada muestra la renta del 33 %. Pieza de Aprender: cero FP.
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
  vendidas: VENDIDAS,
  quedan,
  promedio,
  peps: quedan * COMPRA.costo, // 125.000
  ueps: quedan * INICIO.costo, // 100.000
  ponderado: quedan * promedio, // 118.750
  /* El distractor de P4: el punto medio de los dos precios. */
  puntoMedio: (INICIO.costo + COMPRA.costo) / 2, // 22.500
};

const $ = (n) => `$${cifra(n)}`;

/* «Inventario final = 5 × $25.000 = $125.000»: la figura de cada acierto de P2 a P4. */
const inventarioFinal = (costo) => `Inventario final = ${quedan} × ${$(costo)} = ${$(quedan * costo)}`;

/* La tabla de P5 y del resumen: método · quedan · valen. */
const TABLA = {
  columnas: ["Método", "Quedan", "Valen"],
  filas: [
    { metodo: "PEPS", quedan: "5 de las compradas", valen: $(CIFRAS.peps) },
    { metodo: UEPS, quedan: "5 del inicio", valen: $(CIFRAS.ueps) },
    { metodo: "Promedio ponderado", quedan: "5 mezcladas", valen: $(CIFRAS.ponderado) },
  ],
};

/* La tercera opción de P2 y P3 (anexo del lote 2, con el texto del recorte). */
const DE_LOS_DOS = "De los dos, con un costo promedio";
const DE_LAS_COMPRADAS = `De las compradas, a ${$(COMPRA.costo)}`;
const DE_LAS_DEL_INICIO = `De las del inicio, a ${$(INICIO.costo)}`;

/* ═══════════ LAS PANTALLAS, EN ORDEN (P0 a P9) ═══════════ */

const PORTADA = {
  id: "portada",
  tipo: "lectura",
  objetivo: "Vas a ponerle precio a lo que quedó en la bodega de tres formas, y a ver por qué dan cifras distintas.",
  parrafos: [],
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 215-221",
};

/* P1 · El problema. La figura va primero: la pila de 40 unidades, en el orden en que entraron; salen 35 y quedan 5, sin precio. */
const EL_PROBLEMA = {
  id: "el-problema",
  tipo: "lectura",
  pila: {
    grupos: [
      { id: "inicio", rotulo: `Inicio: ${INICIO.unidades} unidades a ${$(INICIO.costo)}`, unidades: INICIO.unidades },
      { id: "compras", rotulo: `Compras: ${COMPRA.unidades} unidades a ${$(COMPRA.costo)}`, unidades: COMPRA.unidades },
    ],
    salen: VENDIDAS,
    quedan,
  },
  parrafos: [
    "Mira lo que tenía un negocio. Vendió 35 y le quedan 5.",
    "El conteo no dice qué precio tienen. El libro da tres métodos para ponérselo.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 209 y 215",
};

/* P2 · PEPS. */
const PEPS = {
  id: "peps",
  pista: "Con PEPS salen primero las primeras que entraron. ¿Cuáles se quedan?",
  tipo: "eleccion",
  encabezado: "Método PEPS",
  parrafos: ["PEPS: primeras en entrar, primeras en salir. Lo primero que se compró es lo primero que se vende."],
  pregunta: "¿De qué grupo son las 5?",
  opciones: [
    { id: "compradas", texto: DE_LAS_COMPRADAS, correcta: true },
    { id: "inicio", texto: DE_LAS_DEL_INICIO, correcta: false, devolucion: "Las del inicio fueron las primeras en entrar: salieron primero." },
    { id: "promedio", texto: DE_LOS_DOS, correcta: false, devolucion: "Eso es el promedio ponderado. PEPS no mezcla." },
  ],
  pie: "Basado en el libro, pp. 215 y 219",
  error: { pie: "Basado en el libro, p. 219" },
  acierto: {
    texto: "De las 35 que se venden, primero salen las 10 del inicio y luego 25 compradas. Quedan 5 compradas.",
    calculos: [inventarioFinal(COMPRA.costo)],
    pie: "Basado en el libro, p. 219",
  },
};

/* P3 · UEPS, con su rótulo. */
const UEPS_P = {
  id: "ueps",
  pista: "Con UEPS salen primero las últimas que entraron. ¿Cuáles se quedan?",
  tipo: "eleccion",
  encabezado: `Método ${UEPS}`,
  parrafos: ["UEPS: últimas en entrar, primeras en salir. Lo último que se compró es lo primero que se vende."],
  pregunta: "¿De qué grupo son las 5?",
  opciones: [
    { id: "inicio", texto: DE_LAS_DEL_INICIO, correcta: true },
    { id: "compradas", texto: DE_LAS_COMPRADAS, correcta: false, devolucion: "Las compradas fueron las últimas en entrar: salieron primero." },
    { id: "promedio", texto: DE_LOS_DOS, correcta: false, devolucion: "Eso es el promedio ponderado. UEPS no mezcla." },
  ],
  pie: "Basado en el libro, pp. 216 y 220",
  error: { pie: "Basado en el libro, p. 220" },
  acierto: {
    texto: "De las 35 que se venden, primero salen las 30 compradas y luego 5 del inicio. Quedan 5 del inicio.",
    calculos: [inventarioFinal(INICIO.costo)],
    pie: "Basado en el libro, p. 220",
  },
};

/* P4 · Promedio ponderado. */
const PROMEDIO = {
  id: "promedio-ponderado",
  pista: "No es el punto medio entre los dos precios. Cada precio pesa según las unidades compradas a ese precio.",
  tipo: "eleccion",
  encabezado: "Promedio ponderado",
  parrafos: [`Este método no elige un grupo. Junta las ${disponibles} unidades, que costaron ${$(costoDisponible)}, y le da a cada una el mismo costo.`],
  pregunta: "¿Cuál es el costo de cada unidad?",
  opciones: [
    { id: "ponderado", texto: $(promedio), correcta: true },
    { id: "punto-medio", texto: $(CIFRAS.puntoMedio), correcta: false, devolucion: "Ese es el punto medio entre $20.000 y $25.000. Pero hay más unidades a $25.000 que a $20.000." },
    { id: "ultima-compra", texto: $(COMPRA.costo), correcta: false, devolucion: "Ese es el precio de la última compra. El promedio junta las 40 unidades." },
  ],
  pie: "Basado en el libro, pp. 218 y 220",
  error: { pie: "Basado en el libro, pp. 218 y 220" },
  acierto: {
    texto: `Así es: ${$(costoDisponible)} ÷ ${disponibles} = ${$(promedio)}.`,
    calculos: [inventarioFinal(promedio)],
    pie: "Basado en el libro, p. 220",
  },
};

/* P5 · Lado a lado. La tabla es la figura de la pantalla. */
const LADO_A_LADO = {
  id: "lado-a-lado",
  pista: "¿De qué compra son las 5 que quedan con PEPS, y cuánto costó?",
  tipo: "eleccion",
  parrafos: [],
  figura: TABLA,
  pregunta: "¿Por qué PEPS da el valor más alto aquí?",
  opciones: [
    { id: "reciente", texto: "Son de la compra más cara.", correcta: true },
    { id: "siempre", texto: "PEPS siempre da más.", correcta: false, devolucion: "No siempre: aquí el precio subió de $20.000 a $25.000." },
    { id: "mas-unidades", texto: "Con PEPS quedan más.", correcta: false, devolucion: "Con los tres quedan las mismas 5 unidades." },
  ],
  pie: "Basado en el libro, pp. 219-221",
  error: { pie: "Basado en el libro, pp. 215 y 219-220" },
  acierto: {
    texto: "Exacto: son las mismas 5 unidades, con otro precio.",
    calculos: [],
    pie: "Basado en el libro, pp. 215, 216 y 221",
  },
};

/*
 * P6 · La recomendación: una inferencia sobre los $950.000, antes de leer el
 * porqué. Aciertos C7 (paquetes/t7-1-a3-la-recomendacion-c7.md, de Near, con
 * A3-1 y A3-2 de Mello, auditoria-mello-a4-v5-y-a3-recomendacion.md §2): la
 * pregunta va por precios que bajan (correcta: PEPS), y las dos condiciones
 * del libro van a la vista en el acierto, sin plegado (C7). El acierto
 * nombra y define el impuesto de renta, que AP4 usa (A3-2). La opcional de
 * Mello («Según el libro, cada empresa escoge…») NO se aplica.
 */
const LA_RECOMENDACION = {
  id: "la-recomendacion",
  pista: `Si los precios bajan, ¿qué método deja en lo que queda los precios más bajos? Los ${$(costoDisponible)} no cambian.`,
  tipo: "eleccion",
  parrafos: [`Lo que queda y lo vendido se reparten ${$(costoDisponible)}.`],
  pregunta: "Si los precios bajan, ¿con qué método lo vendido queda más caro?",
  opciones: [
    { id: "peps", texto: "PEPS", correcta: true },
    { id: "ueps", texto: UEPS, correcta: false, devolucion: "Con UEPS, lo vendido lleva los precios más recientes, que ahora son los más bajos." },
    { id: "promedio", texto: "Promedio ponderado", correcta: false, devolucion: "El promedio queda en medio. Busca el método que le deja a lo vendido los precios más altos." },
  ],
  pie: "Basado en el libro, pp. 215 y 217",
  error: { pie: "Basado en el libro, pp. 215-217 y 219-221" },
  acierto: {
    /* Todo a la vista: sin `porque`. */
    texto: "Exacto: menos utilidad y menos impuesto de renta, que se calcula sobre ella. Por eso el libro recomienda PEPS en deflación, cuando los precios bajan, y UEPS en inflación, cuando suben.",
    calculos: [],
    pie: "Basado en el libro, pp. 215 y 217",
  },
};

/* P7 · A favor y en contra: tres tarjetas cerradas; se abre una a la vez. */
const A_FAVOR_Y_EN_CONTRA = {
  id: "a-favor-y-en-contra",
  tipo: "tarjetas",
  parrafos: ["Toca cada método para ver qué dice el libro a favor y en contra."],
  tarjetas: {
    rotulos: { aFavor: "A favor", enContra: "En contra" },
    metodos: [
      {
        id: "peps",
        metodo: "PEPS",
        aFavor: "Lo que queda lleva los costos más recientes.",
        /* Corrección 3 de Mello: por qué el libro la llama ficticia. */
        enContra: "Si los precios suben, lo vendido lleva costos antiguos frente a ventas de hoy. La utilidad sale mayor, y el libro la llama ficticia.",
      },
      {
        id: "ueps",
        metodo: UEPS,
        /* Aciertos C7 · A3-2 de Mello: acepta el cambio de Near. «Impuesto de renta» ya se define en el acierto de P6. */
        aFavor: "Si los precios suben, lo vendido sale más caro y el impuesto sobre la utilidad baja.",
        enContra: "Lo que queda lleva costos antiguos.",
      },
      {
        id: "promedio",
        metodo: "Promedio ponderado",
        aFavor: "Si los precios no cambian de golpe, limita las distorsiones.",
        enContra: "Lo que queda guarda parte de los costos antiguos.",
      },
    ],
  },
  /* «Seguir» se activa cuando se han abierto las tres. */
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 214-218",
};

/* P8 · La refutación (sale de la vieja pregunta de a-favor-y-en-contra). */
const LA_REFUTACION = {
  id: "la-refutacion",
  pista: "Piensa si estos métodos dicen cómo sale la mercancía de la bodega o solo cómo se le pone precio.",
  tipo: "eleccion",
  parrafos: [],
  pregunta: "Alguien dice: «UEPS no tiene sentido: la tienda vende primero lo que llegó primero». ¿Qué le responde el libro?",
  opciones: [
    { id: "orden-de-costos", texto: "Que UEPS sigue el orden de los costos.", correcta: true },
    { id: "debe-vender", texto: "Que la tienda debe vender lo último primero.", correcta: false, devolucion: "El libro dice lo contrario: el método no tiene que seguir el manejo de la mercancía." },
    { id: "tiene-razon", texto: "Que tiene razón.", correcta: false, devolucion: "El libro reconoce que muchos lo creen, y aun así defiende el método." },
  ],
  pie: "Basado en el libro, p. 217",
  error: { pie: "Basado en el libro, p. 217" },
  acierto: {
    texto: "Exacto: el método no tiene que seguir el orden de las cajas.",
    calculos: [],
    pie: "Basado en el libro, p. 217",
  },
};

/* P9 · Resumen: la tabla de P5, sin la pregunta. Sin botón. */
const RESUMEN = {
  id: "resumen",
  tipo: "lectura",
  parrafos: ["Las mismas 5 unidades, con tres precios distintos."],
  figura: TABLA,
  despues: [
    "PEPS deja lo más reciente y UEPS, lo más antiguo. El promedio queda en medio.",
    "El libro recomienda UEPS cuando los precios suben y PEPS cuando bajan.",
  ],
  siguiente: "Siguiente: «El cierre en periódico».",
  boton: null,
  pie: "Basado en el libro, pp. 215-221",
};

export const PIEZA_TRES_FORMAS = {
  id: AP3_ID,
  numero: 3,
  titulo: "Tres formas de ponerle precio a lo que quedó",
  pantallas: [PORTADA, EL_PROBLEMA, PEPS, UEPS_P, PROMEDIO, LADO_A_LADO, LA_RECOMENDACION, A_FAVOR_Y_EN_CONTRA, LA_REFUTACION, RESUMEN],
};
