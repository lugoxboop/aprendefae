/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · PIEZA 1 DE APRENDER — «La cuenta que no se mueve».
 *
 * Fuente: el paquete de Near en su versión 5, con PASA de Mello (Célula C).
 * Los metadatos que no cambiaron desde la v3 (cifras, erratas, términos) salen
 * de la v3. Pieza de Aprender: cero FP, no entra al catálogo del servidor.
 *
 * Aquí solo hay datos. Los textos van letra por letra como en la v5; una
 * prueba compara cada uno contra el paquete aprobado, que vive en
 * orquestador/conocimiento/paquetes/t7-1-pieza1-v5.md.
 *
 * Lo que la v5 marca como interno no se muestra: los subtítulos «(interno:
 * …)», las citas de página entre paréntesis, «[construcción]» y «cambia en
 * v4/v5». Lo que el estudiante ve de la fuente es el pie de cada pantalla y
 * estado.
 *
 * Nombres de cuenta: la regla 8 de la decisión de corte. «Compras» por la
 * errata C7-10 (el asiento de la p. 212 dice «Cuentas de mercancías»).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AP1_ID = "t7-1-a1-la-cuenta-que-no-se-mueve";

/* Los cuatro botones de la pieza, textuales de la v5. */
export const BOTON = {
  empezar: "Empezar",
  seguir: "Seguir",
  verElCaso: "Ver el caso",
  confirmar: "Confirmar",
  probarOtra: "Probar otra",
};

/*
 * ═══════════ LA FIGURA · «DOS COLUMNAS DEL PERIODO» (Watari, v3) ═══════════
 *
 * Columnas: Inventario de mercancías y la cuenta que recibe la compra, que
 * empieza como «Otra cuenta» y desde el acierto de la pantalla 4 se llama
 * «Compras». Filas: inicio, durante el periodo y cierre. La pantalla 0 no
 * lleva figura; de la 1 a la 6, una en cada estado: doce.
 *
 * Cada estado dice qué se dibuja y qué se señala, con la tabla de Watari:
 *   col2     null | "otra" | "compras"
 *   filas    las filas que se ven (la pantalla 1 solo tiene «Inicio»)
 *   factura  la factura del 16 de abril, encima de la figura, sin anotar
 *   compra   la tarjeta «16 de abril · DEBE · 5.000.000» en la segunda columna
 *   otras    «Las demás compras del periodo», sin cifra, debajo de la compra
 *   conteo   el cierre de Inventario ya en tarjeta: «Al día con el conteo físico»
 *   pendiente  dónde va «Conteo físico» mientras no está en tarjeta:
 *            "inventario", bajo esa columna; "fila", en la fila «Cierre» sin
 *            quedar bajo ninguna columna. Desde la pantalla 3 hasta el
 *            colocando de la 5 va en la fila: la figura no puede dibujar la
 *            respuesta mientras pregunta (corrección de Mello). En los dos
 *            errores de la 5 vuelve bajo Inventario, porque el mensaje ya lo
 *            explica.
 *   foco     lo que se señala (blanco y negrita; nada más cambia)
 *   aparece  lo que entra con el fundido de 120 ms, solo en su pantalla
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Los textos que se ven dentro de la figura, de Near y de Watari. */
export const FIGURA_TEXTOS = {
  inventario: "Inventario de mercancías",
  otraCuenta: "Otra cuenta",
  compras: "Compras",
  momento: "Momento",
  inicio: "Inicio",
  durante: "Durante el periodo",
  cierre: "Cierre",
  valorInicio: "Valor del inicio del periodo",
  noSeMueve: "No se mueve hasta el cierre",
  conteoPendiente: "Conteo físico",
  conteoAlDia: "Al día con el conteo físico",
  fecha: "16 de abril",
  debe: "Debe",
  /* Sin «$», como todas las cifras de la célula dentro de una figura (Watari). */
  monto: "5.000.000",
  demasCompras: "Las demás compras del periodo",
  /*
   * Rótulo de la tarjeta de la factura (colocando y errores de la pantalla 4),
   * texto de interfaz de la v3.1 de Watari.
   * [REVISADO POR NEAR]: opcional de Mello, escrito por L; Near lo confirmó
   * tal cual.
   */
  rotuloFactura: "La compra",
};

/* Los textos de la figura que todavía esperan confirmación. La figura los marca con data-revision. */
export const FIGURA_PENDIENTES_DE_REVISION = [];

const TRES_FILAS = ["inicio", "durante", "cierre"];

export const FIGURA = {
  F1: { col2: null, filas: ["inicio"], foco: [] },
  F2: { col2: null, filas: TRES_FILAS, foco: ["inv-durante"], pendiente: "inventario" },
  F3: { col2: "otra", filas: TRES_FILAS, foco: ["inv-durante"], pendiente: "fila" },
  F4c: { col2: "otra", filas: TRES_FILAS, factura: true, foco: ["fila-durante"], pendiente: "fila" },
  F4ei: { col2: "otra", filas: TRES_FILAS, factura: true, foco: ["fila-durante", "inv-durante"], pendiente: "fila" },
  F4eg: { col2: "otra", filas: TRES_FILAS, factura: true, foco: ["fila-durante"], pendiente: "fila" },
  F4a: { col2: "compras", filas: TRES_FILAS, compra: true, otras: true, foco: ["fila-durante", "compra"], aparece: "compra", pendiente: "fila" },
  F5c: { col2: "compras", filas: TRES_FILAS, compra: true, otras: true, foco: ["fila-cierre"], pendiente: "fila" },
  F5ec: { col2: "compras", filas: TRES_FILAS, compra: true, otras: true, foco: ["fila-cierre", "inv-cierre"], pendiente: "inventario" },
  F5en: { col2: "compras", filas: TRES_FILAS, compra: true, otras: true, foco: ["fila-cierre", "inv-cierre"], pendiente: "inventario" },
  F5a: { col2: "compras", filas: TRES_FILAS, compra: true, otras: true, conteo: true, foco: ["fila-cierre", "conteo"], aparece: "conteo" },
  F6: { col2: "compras", filas: TRES_FILAS, compra: true, otras: true, conteo: true, foco: [] },
};

/* Los doce textos alternativos de Near (v2: #2 y #6 corregidos por Mello), uno por estado, tal cual. Van en un figcaption oculto. */
export const FIGURA_ALT = {
  F1: "Una columna con la cuenta Inventario de mercancías. Muestra el valor que tenía al inicio del periodo.",
  F2: "La misma columna de Inventario de mercancías. Mientras la tienda vende, la cuenta sigue mostrando el valor del inicio.",
  F3: "Dos columnas. Inventario de mercancías sigue con el valor del inicio del periodo. Al lado aparece otra cuenta, todavía sin nombre y sin valores.",
  F4c: "Inventario de mercancías sigue con el valor del inicio del periodo. Al lado, la otra cuenta espera la compra del 16 de abril.",
  F4ei: "La compra no entra en Inventario de mercancías. Esa cuenta sigue con el valor del inicio del periodo.",
  F4eg: "La compra no va a un gasto. La otra cuenta sigue esperando la compra del 16 de abril.",
  F4a: "La otra cuenta ahora se llama Compras. Tiene una línea: 16 de abril, debe, $5.000.000. Debajo hay una línea sin cifra para las demás compras del periodo. Inventario de mercancías sigue igual.",
  F5c: "Es el último día del periodo. Compras tiene la compra del 16 de abril y las demás. Inventario de mercancías sigue con el valor del inicio.",
  F5ec: "Compras guarda lo que se compró en el periodo. Lo que quedó en la bodega no va ahí.",
  F5en: "Sin el conteo, Inventario de mercancías no cambia. Seguiría con el valor del inicio del periodo.",
  F5a: "Con el conteo físico, Inventario de mercancías se pone al día con el valor del inventario final. Compras no cambia.",
  F6: "Durante el periodo, las compras van a Compras e Inventario de mercancías no se mueve. Al cierre, el conteo lo pone al día.",
};

/* ═══════════ LAS PANTALLAS, EN ORDEN ═══════════ */

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás en qué cuenta se anota la compra de mercancía en el sistema periódico. Y sabrás por qué Inventario de mercancías no se mueve hasta el cierre.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 209 y 212",
  /* Sin figura: cualquier versión adelantaría una respuesta (Watari). */
  figura: null,
};

/* Pantalla 1 (interno: Lo que ya sabes). */
const LO_QUE_YA_SABES = {
  id: "lo-que-ya-sabes",
  tipo: "lectura",
  parrafos: [
    "En el Tema 2 viste una regla: cuando un activo aumenta, se anota en el debe de su cuenta. Si la empresa compra un escritorio para la oficina, ese activo crece y se anota en el debe.",
    "La mercancía que una tienda compra para volver a venderla también es un activo. Se llama inventario de mercancías.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 207 y 212",
  figura: "F1",
};

/* Pantalla 2 (interno: El conteo al final). */
const EL_CONTEO_AL_FINAL = {
  id: "el-conteo-al-final",
  tipo: "lectura",
  parrafos: [
    "Piensa en una ferretería. Vende tornillos todo el día y nadie anota cuántos quedan después de cada venta. Al final del periodo, alguien recorre los estantes y anota cuánto hay.",
    "Así funciona el sistema de inventario periódico. La empresa no lleva un registro de su mercancía día a día. Al final del periodo hace un conteo físico.",
    "El libro lo recomienda para farmacias, ferreterías y tiendas.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 209 y 210",
  figura: "F2",
};

/* Pantalla 3 (interno: La consecuencia). */
const LA_CONSECUENCIA = {
  id: "la-consecuencia",
  tipo: "lectura",
  parrafos: [
    "Cuando la empresa vende, solo anota cuánto cobró. Nadie anota cuánto costó la mercancía que salió. Por eso Inventario de mercancías no puede estar al día durante el periodo: no se mueve hasta el cierre.",
    "Ojo: la compra sí va al debe, como en el Tema 2. Pero no va al debe de su cuenta de activo, Inventario de mercancías, sino al de otra cuenta. Por eso el libro dice que este registro se aparta de la norma para registrar los activos. ¿Cuál es esa otra cuenta? Míralo con un caso.",
  ],
  boton: BOTON.verElCaso,
  pie: "Basado en el libro, pp. 209 y 212",
  figura: "F3",
};

/*
 * Pantalla 4 · pregunta 1. «Compras» entra por pregunta: el estudiante la ve
 * primero aquí, como opción, y el acierto la explica.
 */
const PREGUNTA_COMPRA = {
  id: "pregunta-compra",
  pista: "En el periódico, ¿qué cuenta junta en el periodo la mercancía que se trae para vender?",
  tipo: "pregunta",
  enunciado: "El 16 de abril, La Reventa Ltda. le compra mercancía a un proveedor por $5.000.000, a crédito. La empresa usa el sistema de inventario periódico.",
  /*
   * Los cinco datos, de la tabla de la v3, con mayúscula inicial. La ficha no
   * cambió desde la v3, que es su fuente; la v5 la escribió en línea y quedó en
   * minúscula (decisión de L, corrección de Mello).
   */
  ficha: [
    { dato: "Quién recibe", texto: "La Reventa Ltda. recibe la mercancía" },
    { dato: "Quién entrega", texto: "Un proveedor" },
    { dato: "Monto", texto: "$5.000.000 por la mercancía" },
    { dato: "Tipo", texto: "A crédito" },
    { dato: "Clase de hecho", texto: "Compra de mercancía para volver a venderla" },
  ],
  pregunta: "¿En qué cuenta se anota en el debe el costo de la mercancía, $5.000.000?",
  ayuda: "Toca una cuenta y confirma.",
  opciones: [
    {
      id: "inventario",
      texto: "Inventario de mercancías",
      correcta: false,
      devolucion: "Así sería si la cuenta se pusiera al día con cada compra y cada venta. En el sistema periódico, el costo de cada venta no se anota, así que esa cuenta no se mueve hasta el cierre. La compra sí va al debe, pero de otra cuenta: Compras. Como no va al debe de su cuenta de activo, el libro dice que se aparta de la norma.",
    },
    { id: "compras", texto: "Compras", correcta: true },
    {
      id: "gastos",
      texto: "Gastos de administración y ventas",
      correcta: false,
      devolucion: "Esta mercancía no es un gasto de la operación: se compró para volver a venderla. Esas compras se anotan en la cuenta Compras.",
    },
  ],
  pie: "Basado en el libro, p. 211",
  /* La figura de cada estado; la del error depende de la cuenta elegida. */
  figura: { colocando: "F4c", error: { inventario: "F4ei", gastos: "F4eg" }, acierto: "F4a" },
  error: { boton: BOTON.probarOtra, pie: "Basado en el libro, pp. 209, 210 y 212" },
  acierto: {
    texto: "Así es. En el sistema periódico, la compra de mercancía se anota en el debe de Compras, por su costo: $5.000.000. Inventario de mercancías no se toca. Como la compra no va al debe de su cuenta de activo, el libro dice que este registro se aparta de la norma.",
    /*
     * La línea que aparece, en sus tres partes. Se lee «16 de abril · Compras
     * · Debe $5.000.000». No se pinta aparte: es la tarjeta de la compra en la
     * figura, repartida (Watari), con la cuenta en el encabezado de la columna
     * y el monto sin «$».
     */
    linea: { fecha: "16 de abril", cuenta: "Compras", lado: "Debe", monto: "$5.000.000" },
    nota: "La otra parte del asiento, lo que se le debe al proveedor, la armamos en «La factura completa».",
    boton: BOTON.seguir,
    pie: "Basado en el libro, pp. 210 y 212",
  },
};

/* Pantalla 5 · pregunta 2. La v5 no trae ficha ni ayuda en esta pantalla. */
const PREGUNTA_CONTEO = {
  id: "pregunta-conteo",
  pista: "El conteo dice cuánto vale lo que quedó en la bodega. ¿Qué cuenta debería mostrar ese valor?",
  tipo: "pregunta",
  enunciado: null,
  ficha: null,
  pregunta: "Llega el último día del periodo. La Reventa hace el conteo físico de la mercancía que quedó en su bodega. ¿Qué cuenta se pone al día con ese conteo?",
  ayuda: null,
  opciones: [
    { id: "inventario", texto: "Inventario de mercancías", correcta: true },
    {
      id: "compras",
      texto: "Compras",
      correcta: false,
      devolucion: "Compras recoge lo que se compró durante el periodo, no lo que quedó en la bodega. Lo que quedó se lleva a Inventario de mercancías, al cierre.",
    },
    {
      id: "ninguna",
      texto: "Ninguna: el conteo no se registra",
      correcta: false,
      devolucion: "Sí se registra: es el único momento en que Inventario de mercancías se pone al día. Sin el conteo, la cuenta seguiría mostrando el valor del inicio del periodo.",
    },
  ],
  pie: "Basado en el libro, p. 209",
  figura: { colocando: "F5c", error: { compras: "F5ec", ninguna: "F5en" }, acierto: "F5a" },
  error: { boton: BOTON.probarOtra, pie: "Basado en el libro, pp. 209, 210, 212 y 214" },
  acierto: {
    texto: "Exacto. Al cierre, el conteo físico da el valor del inventario final, y con esa cifra se pone al día Inventario de mercancías. Esa es la cifra que aparece en el estado de situación financiera.",
    linea: null,
    nota: "Cómo se le pone precio a ese conteo lo verás en «Tres formas de ponerle precio a lo que quedó».",
    boton: BOTON.seguir,
    pie: "Libro, p. 209",
  },
};

/* Pantalla 6 · resumen. La v5 no le pone botón: es la última. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "En el sistema periódico, la mercancía no se anota día a día. Se revisa al final, con un conteo físico.",
    "Mientras tanto, las compras van a Compras. Inventario de mercancías no se mueve.",
    "Al cierre, el conteo pone al día Inventario de mercancías.",
  ],
  /* La figura va bajo las líneas del resumen, y la remisión debajo de la figura (Watari). */
  siguiente: "Siguiente: la factura completa de esta compra.",
  boton: null,
  pie: "Basado en el libro, pp. 209 y 212",
  figura: "F6",
};

/* ═══════════ LA PIEZA ═══════════ */

export const PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE = {
  id: AP1_ID,
  numero: 1,
  titulo: "La cuenta que no se mueve",
  pantallas: [PORTADA, LO_QUE_YA_SABES, EL_CONTEO_AL_FINAL, LA_CONSECUENCIA, PREGUNTA_COMPRA, PREGUNTA_CONTEO, RESUMEN],
};
