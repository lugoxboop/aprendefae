/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · PIEZA 1 DE APRENDER — «La cuenta que no se mueve».
 *
 * Fuente: el recorte del lote 1 de Near (Célula C), en
 * orquestador/conocimiento/paquetes/lote1-recortes-t71-v1.md, con las
 * correcciones obligatorias de Mello (mello-recortes-v1.md). Cuatro
 * pantallas: portada, dos preguntas y resumen. Pieza de Aprender: cero FP, no
 * entra al catálogo del servidor.
 *
 * Aquí solo hay datos. Los textos van letra por letra como en el recorte; una
 * prueba compara cada uno contra el paquete y la auditoría. Las cifras de
 * INFLESZ y las tablas de medida del paquete no se muestran. Los pies de
 * fuente no los trae el recorte: siguen los de la v5
 * (t7-1-pieza1-v5.md).
 *
 * Nombres de cuenta: la regla 8 de la decisión de corte. «Compras» por la
 * errata C7-10 (el asiento de la p. 212 dice «Cuentas de mercancías»).
 *
 * La figura y su mecánica las rediseña Watari (la bodega con deslizador);
 * mientras tanto la pieza usa los estados F4, F5 y F6 de «Dos columnas».
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AP1_ID = "t7-1-a1-la-cuenta-que-no-se-mueve";

/* Los botones de la pieza, textuales de la v5. */
export const BOTON = {
  empezar: "Empezar",
  seguir: "Seguir",
  confirmar: "Confirmar",
  probarOtra: "Probar otra",
};

/*
 * ═══════════ LA FIGURA · «DOS COLUMNAS DEL PERIODO» (Watari, v3) ═══════════
 *
 * Columnas: Inventario de mercancías y la cuenta que recibe la compra, que
 * empieza como «Otra cuenta» y desde el acierto de la compra se llama
 * «Compras». Filas: inicio, durante el periodo y cierre. La portada no
 * lleva figura; las dos preguntas y el resumen, una en cada estado: nueve
 * (F4c…F4a, F5c…F5a y F6). F1, F2 y F3 eran de las pantallas de lectura que
 * el recorte quitó; quedan aquí, con su texto alternativo, para el rediseño.
 *
 * Cada estado dice qué se dibuja y qué se señala, con la tabla de Watari:
 *   col2     null | "otra" | "compras"
 *   filas    las filas que se ven (F1 solo tiene «Inicio»)
 *   factura  la factura del 16 de abril, encima de la figura, sin anotar
 *   compra   la tarjeta «16 de abril · DEBE · 5.000.000» en la segunda columna
 *   otras    «Las demás compras del periodo», sin cifra, debajo de la compra
 *   conteo   el cierre de Inventario ya en tarjeta: «Al día con el conteo físico»
 *   pendiente  dónde va «Conteo físico» mientras no está en tarjeta:
 *            "inventario", bajo esa columna; "fila", en la fila «Cierre» sin
 *            quedar bajo ninguna columna. Desde la primera pregunta hasta
 *            el colocando de la del conteo va en la fila: la figura no
 *            puede dibujar la respuesta mientras pregunta (corrección de
 *            Mello). En los dos errores del conteo vuelve bajo Inventario,
 *            porque el mensaje ya lo explica.
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
   * Rótulo de la tarjeta de la factura (colocando y errores de la pregunta de la compra),
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

/*
 * El recorte del lote 1 de Near (lote1-recortes-t71-v1.md, sección
 * «t7-1-a1-la-cuenta-que-no-se-mueve»), con las cuatro correcciones
 * obligatorias de Mello (mello-recortes-v1.md, «A1»). Salen las pantallas
 * «Lo que ya sabes», «El conteo al final» y «La consecuencia»: la pieza abre
 * con La Reventa. Los pies de fuente no los trae el recorte: son los de la v5.
 *
 * Donde el recorte trae un «¿Por qué? (plegado)», va aparte en `porque`, junto
 * al texto visible, y la pieza lo pinta con <Plegable texto porque />.
 */

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Vas a ver a qué cuenta va la compra de mercancía cuando nadie lleva el inventario día a día.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 209 y 212",
  /* Sin figura: cualquier versión adelantaría una respuesta (Watari). */
  figura: null,
};

/*
 * Pantalla 1 · pregunta 1. «Compras» entra por pregunta: el estudiante la ve
 * primero aquí, como opción, y el acierto la explica.
 */
const PREGUNTA_COMPRA = {
  id: "pregunta-compra",
  /* Pista nueva de Mello, posterior a su auditoría (llegó por el coordinador): gana sobre la del recorte. */
  pista: "En el periódico, ¿qué cuenta junta en el periodo la mercancía que se trae para vender?",
  tipo: "pregunta",
  /* El caso, un párrafo por texto del recorte. La primera frase, corregida por Mello (A1 · 2): el periódico no deja de mirar, deja de anotar. */
  enunciado: [
    "La Reventa usa el sistema periódico. No anota su mercancía a diario: la revisa al final.",
    "El 16 de abril compra mercancía por $5.000.000, a crédito.",
  ],
  pregunta: "¿A qué cuenta va al debe?",
  opciones: [
    {
      id: "inventario",
      texto: "Inventario de mercancías",
      correcta: false,
      /* Mello (A1 · 1): la del recorte decía que la regla del debe no vale en el periódico. */
      devolucion: "Sí va al debe, pero no de esa cuenta: en el periódico se queda quieta hasta el cierre.",
      porque: "Al vender, nadie anota lo que costó la mercancía que salió. Por eso Inventario de mercancías no puede estar al día, y se queda quieta hasta el cierre.",
    },
    { id: "compras", texto: "Compras", correcta: true },
    {
      id: "gastos",
      texto: "Gastos de administración y ventas",
      correcta: false,
      devolucion: "Esta mercancía no es un gasto. Se compró para volver a venderla.",
    },
  ],
  pie: "Basado en el libro, p. 211",
  /* La figura de cada estado; la del error depende de la cuenta elegida. */
  figura: { colocando: "F4c", error: { inventario: "F4ei", gastos: "F4eg" }, acierto: "F4a" },
  error: { boton: BOTON.probarOtra, pie: "Basado en el libro, pp. 209, 210 y 212" },
  acierto: {
    texto: "Así es: va al debe de Compras. Inventario de mercancías no se toca.",
    porque: "Como la compra no va al debe de su cuenta de activo, el libro dice que este registro se aparta de la norma. La otra parte del asiento la armas en «La factura completa».",
    /*
     * Lo que la figura muestra al acertar: «16 de abril · Compras · Debe ·
     * $5.000.000». No se pinta aparte: es la tarjeta de la compra en la
     * figura, repartida (Watari), con la cuenta en el encabezado de la columna
     * y el monto sin «$».
     */
    linea: { fecha: "16 de abril", cuenta: "Compras", lado: "Debe", monto: "$5.000.000" },
    boton: BOTON.seguir,
    pie: "Basado en el libro, pp. 210 y 212",
  },
};

/* Pantalla 2 · pregunta 2. */
const PREGUNTA_CONTEO = {
  id: "pregunta-conteo",
  /* Pista nueva de Mello, posterior a su auditoría (llegó por el coordinador): gana sobre la del recorte. */
  pista: "El conteo dice cuánto vale lo que quedó en la bodega. ¿Qué cuenta debería mostrar ese valor?",
  tipo: "pregunta",
  /* Mello (A1 · 4): vuelve «conteo físico», que usan A3, A4, H1 y el rótulo de la figura. */
  enunciado: ["Llega el último día del periodo. La Reventa hace el conteo físico de lo que quedó en la bodega."],
  pregunta: "¿Qué cuenta se pone al día con ese conteo?",
  opciones: [
    { id: "inventario", texto: "Inventario de mercancías", correcta: true },
    {
      id: "compras",
      texto: "Compras",
      correcta: false,
      devolucion: "Compras recoge lo que se compró en el periodo, no lo que quedó.",
    },
    {
      id: "ninguna",
      texto: "Ninguna: el conteo no se registra",
      correcta: false,
      devolucion: "Sí se registra. Sin el conteo, la cuenta seguiría con el valor del inicio.",
    },
  ],
  pie: "Basado en el libro, p. 209",
  figura: { colocando: "F5c", error: { compras: "F5ec", ninguna: "F5en" }, acierto: "F5a" },
  error: { boton: BOTON.probarOtra, pie: "Basado en el libro, pp. 209, 210, 212 y 214" },
  acierto: {
    /* Mello (A1 · 3): el del recorte daba 62,9 de INFLESZ. Lo del estado de situación financiera pasa al plegado, delante del de Near. */
    texto: "Exacto: con el conteo, Inventario de mercancías se pone al día. Esa cifra es la que va al cierre.",
    porque: "Esa cifra es la que aparece en el estado de situación financiera. Cómo se le pone precio a lo que quedó lo verás en «Tres formas de ponerle precio a lo que quedó».",
    linea: null,
    boton: BOTON.seguir,
    pie: "Libro, p. 209",
  },
};

/* Pantalla 3 · resumen. Sin botón: es la última. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "En el periódico, las compras van a Compras.",
    "Inventario de mercancías se queda quieta durante el periodo.",
    "Al cierre, el conteo la pone al día.",
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
  pantallas: [PORTADA, PREGUNTA_COMPRA, PREGUNTA_CONTEO, RESUMEN],
};
