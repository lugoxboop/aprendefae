/*
 * ═══════════════════════════════════════════════════════════════════════════
 * POLÍTICA MONETARIA · DOS ACTIVIDADES NUEVAS (Gen y Levi; decisiones de Erwin).
 *
 *   ¿Por Cuál Arteria Entra?   Análisis    50 FP   después de «La Cadena de Transmisión»
 *   Las Dos Entradas           Aplicación  25 FP   después de «¿A Quién Le Pega la Tasa?»
 *
 * Textos TAL CUAL: la A es la entrega de Gen («el resto, sin cambios», Levi);
 * la B es la de Levi, que reemplaza la versión de tres elecciones. Los dos
 * ejemplos del tutorial son los aprobados por Levi, con sus dos ajustes.
 *
 * Nada aquí calcula ni guarda puntos: los bancos y sus textos, y las reglas
 * puras que eligen qué explicación sale.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ A · ¿POR CUÁL ARTERIA ENTRA? ═══════════ */

export const ARTERIA = {
  id: "por-cual-arteria-entra",
  nombre: "¿Por Cuál Arteria Entra?",
  regla: "Se llega a una arteria cuando alguien cambia cuánto gasta.",
  consigna: "Lee el eslabón. Toca la arteria a la que llega.",
  cierre: "La tasa no reparte parejo. Entra fuerte por la inversión, llega al consumo porque las familias tienen menos con qué gastar y toca las exportaciones netas por el tipo de cambio. En el modelo, al gasto público no lo toca.",
};

export const PASOS_ARTERIA = ["Lee qué pasa en el eslabón y a quién le pasa.", "Decide si alguien ya cambió cuánto gasta.", "Toca esa arteria, o toca que todavía no llega a ninguna."];

/* En este orden fijo: son las arterias del modelo, numeradas. */
export const OPCIONES_ARTERIA = [
  { id: "c", nombre: "Arteria 1 · Consumo (C)" },
  { id: "i", nombre: "Arteria 2 · Inversión (I)" },
  { id: "g", nombre: "Arteria 3 · Gasto público (Ḡ)" },
  { id: "xn", nombre: "Arteria 4 · Exportaciones netas (XN)" },
  { id: "ninguna", nombre: "Todavía no llega a ninguna" },
];

const ACIERTO_CONSUMO = "Llega al Consumo (C). Con el crédito más caro, la familia tiene menos con qué consumir.";

export const ESLABONES_ARTERIA = [
  { id: "fondos-mas-caros", texto: "Los bancos comerciales consiguen fondos más caros", respuesta: "ninguna", acierto: "Todavía no. Cambió un costo entre bancos, pero nadie ha cambiado aún cuánto gasta." },
  { id: "entran-capitales", texto: "Entran capitales extranjeros buscando mejores rendimientos", respuesta: "ninguna", acierto: "Todavía no. Entró plata al país, pero nadie ha cambiado aún cuánto gasta." },
  { id: "rendimientos-suben", texto: "Los rendimientos de CDT y cuentas de ahorro suben", respuesta: "ninguna", acierto: "Todavía no. Cambió lo que paga el ahorro, pero nadie ha cambiado aún cuánto gasta." },
  { id: "peso-se-fortalece", texto: "El peso se fortalece frente al dólar", respuesta: "ninguna", acierto: "Todavía no. Cambió un precio, pero nadie ha cambiado aún cuánto gasta." },
  /* Los dos de Consumo, por capacidad de gasto (el motivo del profesor de Mateo), con el mismo acierto (Levi). */
  { id: "credito-negado", texto: "A una familia le niegan el crédito de consumo que pensaba pedir.", respuesta: "c", acierto: ACIERTO_CONSUMO },
  { id: "electrodomesticos-a-cuotas", texto: "Las familias aplazan comprar electrodomésticos a cuotas", respuesta: "c", acierto: ACIERTO_CONSUMO },
  { id: "pospone-maquinaria", texto: "Una empresa pospone comprar maquinaria porque el crédito está más caro", respuesta: "i", acierto: "Llega a la Inversión (I). En el modelo es la entrada directa: I = Ī − b · i." },
  { id: "congela-obra", texto: "Un constructor congela una obra nueva hasta que baje el costo del crédito", respuesta: "i", acierto: "Llega a la Inversión (I), por la misma válvula b que multiplica y resta." },
  { id: "no-amplia-planta", texto: "Una fábrica deja de ampliar su planta este año", respuesta: "i", acierto: "Llega a la Inversión (I). Al subir i, la válvula b le resta a Ī." },
  { id: "mas-importados", texto: "Los hogares compran más productos importados", respuesta: "xn", acierto: "Llega a Exportaciones netas (XN). Comprar más afuera le resta caudal a esa arteria." },
  { id: "afuera-piden-menos", texto: "Los compradores de afuera piden menos productos nacionales", respuesta: "xn", acierto: "Llega a Exportaciones netas (XN). Vender menos afuera le resta caudal a esa arteria." },
];

/* Los errores de Gen, por tipo. */
export const ERRORES_ARTERIA = {
  A: "Ahí alguien sí cambió cuánto gasta. Mira en cuál de las cuatro arterias.",
  B: "Todavía no. Ahí cambió un precio, pero nadie ha cambiado cuánto gasta.",
  C: "Esa no es. La tasa de interés (i) entra por la válvula de elasticidad (b), y esa válvula está en la arteria de la inversión.",
  D: "Esa no es. El canal cambiario mueve el tipo de cambio (tc), y el tc es el vaso de las exportaciones netas.",
  G: "El gasto público (Ḡ) es autónomo en el modelo: ninguna decisión de tasa lo mueve. Esa arteria nunca es la respuesta.",
  /* Levi: era Consumo y tocó Inversión o Exportaciones netas. En lenguaje llano, a propósito: es el motivo del profesor. */
  E: "Esa no es. Con el crédito más caro, son las familias las que tienen menos con qué consumir. Eso llega al consumo (C).",
};

/*
 * El tipo de error de una respuesta equivocada. Todo fallo tiene texto: una
 * prueba recorre cada combinación de respuesta correcta y opción tocada.
 *   G  tocó Gasto público: nunca es la respuesta, sea cual sea el eslabón
 *   A  dijo «ninguna» y sí llegaba a una arteria
 *   B  eligió una arteria y todavía no llegaba
 *   C  era Inversión y eligió otra arteria
 *   D  era Exportaciones netas y eligió otra arteria
 *   E  era Consumo y eligió otra arteria
 */
export function tipoDeErrorArteria(item, elegida) {
  if (elegida === item.respuesta) return null;
  if (elegida === "g") return "G";
  if (elegida === "ninguna") return "A";
  if (item.respuesta === "ninguna") return "B";
  if (item.respuesta === "i") return "C";
  if (item.respuesta === "xn") return "D";
  if (item.respuesta === "c") return "E";
  return null;
}

/* El texto que sale después de responder: el acierto del eslabón, o el error de su tipo. */
export function retroArteria(item, elegida) {
  if (elegida === item.respuesta) return `✅ ${item.acierto}`;
  const tipo = tipoDeErrorArteria(item, elegida);
  return tipo ? `❌ ${ERRORES_ARTERIA[tipo]}` : null;
}

/* El ejemplo del tutorial, fuera del banco (Gen; aprobado por Levi). */
export const EJEMPLO_ARTERIA = {
  id: "ejemplo-hotel",
  texto: "Un hotel cancela la construcción de un ala nueva por el costo del crédito.",
  respuesta: "i",
  acierto: "Llega a la Inversión (I). El hotel cambió cuánto va a gastar en construir, y lo movió la tasa.",
};
export const ALT_TUTORIAL_ARTERIA = "Ejemplo: se lee el hecho del hotel y se toca la opción Arteria 2 · Inversión (I).";

/* ═══════════ B · LAS DOS ENTRADAS ═══════════ */

export const DOS_ENTRADAS = {
  id: "las-dos-entradas",
  nombre: "Las Dos Entradas",
  consigna: "Lee qué decide el Banco, el Gobierno o los dos, y toca la respuesta.",
  objetivo: "El Banco y el Gobierno empujan la misma demanda. Aquí ves si empujan para el mismo lado.",
  cierre: "El Banco y el Gobierno empujan la misma demanda. Pueden empujar juntos, o uno puede deshacer lo que hace el otro.",
};

export const PASOS_DOS_ENTRADAS = [
  "Lee lo que decide el Banco, el Gobierno o los dos.",
  "Elige una de las dos respuestas.",
];

export const DIRECCION = {
  pregunta: "¿Hacia dónde empuja la demanda?",
  opciones: [
    { id: "arriba", nombre: "Hacia arriba" },
    { id: "abajo", nombre: "Hacia abajo" },
  ],
};

export const SENTIDO = {
  pregunta: "¿Van igual o en contra?",
  opciones: [
    { id: "igual", nombre: "Van igual" },
    { id: "contra", nombre: "Van en contra" },
  ],
};

/*
 * Las decisiones, cada una con su explicación de dirección. Las seis de la
 * tabla D y las transferencias, que solo salen en S3.
 */
export const DECISIONES = {
  "banco-baja": { texto: "El Banco baja la tasa de intervención.", direccion: "arriba", explicacion: "Bajar la tasa abarata el crédito: empuja hacia arriba." },
  "banco-sube": { texto: "El Banco sube la tasa de intervención.", direccion: "abajo", explicacion: "Subir la tasa encarece el crédito: empuja hacia abajo." },
  "gobierno-mas-gasto": { texto: "El Gobierno aumenta el gasto en infraestructura.", direccion: "arriba", explicacion: "Más gasto del Gobierno empuja la demanda hacia arriba." },
  "gobierno-recorta-gasto": { texto: "El Gobierno recorta el gasto.", direccion: "abajo", explicacion: "Menos gasto del Gobierno empuja la demanda hacia abajo." },
  "gobierno-baja-impuestos": { texto: "El Gobierno baja los impuestos.", direccion: "arriba", explicacion: "Con menos impuestos, las familias tienen más para gastar. Eso empuja la demanda hacia arriba." },
  "gobierno-sube-impuestos": { texto: "El Gobierno sube los impuestos.", direccion: "abajo", explicacion: "Con más impuestos, las familias tienen menos para gastar. Eso empuja la demanda hacia abajo." },
  "gobierno-mas-transferencias": { direccion: "arriba", explicacion: "Con más transferencias, las familias tienen más para gastar. Eso empuja la demanda hacia arriba." },
};

const D = (id, decision) => ({ id, tipo: "direccion", texto: DECISIONES[decision].texto, correcta: DECISIONES[decision].direccion, decisiones: [decision] });
const S = (id, texto, banco, gobierno, correcta) => ({ id, tipo: "sentido", texto, correcta, decisiones: [banco, gobierno] });

export const PREGUNTAS_DOS_ENTRADAS = [
  D("d1", "banco-baja"),
  D("d2", "banco-sube"),
  D("d3", "gobierno-mas-gasto"),
  D("d4", "gobierno-recorta-gasto"),
  D("d5", "gobierno-baja-impuestos"),
  D("d6", "gobierno-sube-impuestos"),
  S("s1", "El Banco baja la tasa de intervención y el Gobierno aumenta el gasto en infraestructura.", "banco-baja", "gobierno-mas-gasto", "igual"),
  S("s2", "El Banco sube la tasa de intervención y el Gobierno sube los impuestos.", "banco-sube", "gobierno-sube-impuestos", "igual"),
  S("s3", "El Banco sube la tasa de intervención y el Gobierno aumenta las transferencias.", "banco-sube", "gobierno-mas-transferencias", "contra"),
  S("s4", "El Banco baja la tasa de intervención y el Gobierno recorta el gasto.", "banco-baja", "gobierno-recorta-gasto", "contra"),
  S("s5", "El Banco baja la tasa de intervención y el Gobierno baja los impuestos.", "banco-baja", "gobierno-baja-impuestos", "igual"),
  S("s6", "El Banco sube la tasa de intervención y el Gobierno baja los impuestos.", "banco-sube", "gobierno-baja-impuestos", "contra"),
];

export const EXPLICACION_SENTIDO = {
  igual: "Van igual: las dos empujan la demanda para el mismo lado.",
  contra: "Van en contra: una empuja hacia arriba y la otra hacia abajo. El modelo no dice cuál pesa más.",
  fallo: "Mira hacia dónde empuja cada una. Si es el mismo lado, van igual; si no, van en contra.",
};

export const preguntaDe = (p) => (p.tipo === "direccion" ? DIRECCION : SENTIDO);

/*
 * Lo que sale después de responder (Levi):
 *   D            la explicación de esa decisión
 *   S acierto    la línea de su sentido, y debajo las explicaciones de las dos decisiones
 *   S fallo      «Mira hacia dónde empuja cada una…», y debajo las mismas dos
 * Una pregunta del tutorial trae su propia resolución, aprobada por Levi.
 */
export function retroDosEntradas(p, elegida) {
  const ok = elegida === p.correcta;
  const marca = ok ? "✅" : "❌";
  if (p.resolucion) return { linea: `${marca} ${p.resolucion}`, debajo: [] };
  const explicaciones = p.decisiones.map((d) => DECISIONES[d].explicacion);
  if (p.tipo === "direccion") return { linea: `${marca} ${explicaciones[0]}`, debajo: [] };
  return { linea: `${marca} ${ok ? EXPLICACION_SENTIDO[p.correcta] : EXPLICACION_SENTIDO.fallo}`, debajo: explicaciones };
}

/* El ejemplo del tutorial, fuera del banco (aprobado por Levi). */
export const EJEMPLO_DOS_ENTRADAS = {
  id: "ejemplo-obras",
  tipo: "sentido",
  texto: "El Banco sube la tasa de intervención y el Gobierno aumenta el gasto en obras.",
  correcta: "contra",
  decisiones: [],
  resolucion: "El Banco empuja hacia abajo y el Gobierno hacia arriba. Van en contra, así que una le quita fuerza a la otra.",
};
export const ALT_TUTORIAL_DOS_ENTRADAS = "Ejemplo: se lee el caso y se toca \"Van en contra\".";
