/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-1 · PIEZA 1 DE APRENDER — «La cuenta que no se mueve», RENOVADA (v6).
 *
 * Fuente: la «Pieza 1» del Patrón de enganche C de Watari, v6
 * (orquestador/conocimiento/paquetes/patron-enganche-c-v6.html), con las
 * correcciones de Mello que la v6 ya trae (auditoria-mello-n6-n7-v2-y-
 * enganche-v5.md, sección 4, y auditoria-mello-enganche-v6-y-t7-3-
 * aciertos.md, sección 1). La A1-N2 de Mello (cajas de más si el deslizador
 * va rápido) no toca ningún texto: va en el componente.
 *
 * La bodega se vacía con las ventas y se llena con la compra mientras
 * Inventario de mercancías no se mueve, con un deslizador del día hasta el
 * cierre. Seis pantallas. Pieza de Aprender: cero FP, no entra al catálogo
 * del servidor.
 *
 * Aquí solo hay datos. Cifras y textos van letra por letra como en el código
 * de referencia de la v6; una prueba los compara contra ese código, que
 * ejecuta. Las funciones `listo` de la v6 van como datos: `listo` dice qué
 * tiene que haber pasado para que «Seguir» se active.
 *
 * PENDIENTE PARA NEAR (marca solo aquí, nunca en pantalla):
 *   · los textos son de muestra de Watari [ESCRITO POR CLAUDE — PENDIENTE DE
 *     REVISIÓN en la v6], salvo los que la v6 da por de Mello: el mensaje de
 *     la venta, el texto de la pantalla 6, «En la bodega: sin contar», el
 *     conteo sin total y las dos retros del valor. Near los reescribe dentro
 *     de su presupuesto (40 palabras la pantalla; 15 los mensajes, 17 las
 *     pistas)
 *   · las cifras son de muestra y pasan por el registro 5c. La compra de
 *     $5.000.000 y el 16 de abril vienen de la pieza de antes; lo demás es
 *     construido. UN SOLO COSTO UNITARIO para todas las cajas: la figura
 *     saca primero las que llegaron últimas, y con dos costos eso sería un
 *     flujo UEPS que aquí no se enseña (Mello, punto 7). No se cambia.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const AP1_ID = "t7-1-a1-la-cuenta-que-no-se-mueve";

/* ═══════════ LAS CIFRAS (de muestra; registro 5c pendiente) ═══════════ */

/* Costo por caja: el mismo para todas (ver arriba). */
export const PRECIO = 500000;
/* Cajas el 1 de abril. */
export const INICIO = 8;
/* El mes de La Reventa. */
export const EVENTOS = [
  { dia: 9, tipo: "venta", cajas: 3 },
  { dia: 16, tipo: "compra", cajas: 10 },
  { dia: 22, tipo: "venta", cajas: 6 },
  { dia: 28, tipo: "venta", cajas: 4 },
];
export const CIERRE = 30;
/* Cajas al cierre: 8 − 3 + 10 − 6 − 4. */
export const FINAL = 5;

/* Las cajas que hay en la bodega el día d, por id: las del inicio (i0…) y las de la compra (c0…). Salen primero las que llegaron últimas. */
export function cajasEn(d) {
  const ids = [];
  for (let i = 0; i < INICIO; i++) ids.push(`i${i}`);
  for (const e of EVENTOS) {
    if (e.dia > d) break;
    if (e.tipo === "compra") for (let i = 0; i < e.cajas; i++) ids.push(`c${i}`);
    else ids.splice(ids.length - e.cajas, e.cajas);
  }
  return ids;
}

/* Pesos con punto de miles, como en la v6: 4000000 → «4.000.000». */
export const pesos = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/* ═══════════ EL LIBRO ═══════════ */

export const CUENTAS = [
  { id: "inventario", nombre: "Inventario de mercancías" },
  { id: "compras", nombre: "Compras" },
  { id: "gastos", nombre: "Gastos de administración y ventas" },
];

/* Las dos preguntas que se responden tocando una cuenta. «pista» es el segundo peldaño de la escalera. */
export const TOQUE = {
  compra: {
    correcta: "compras",
    bien: "✓ Compras. La compra no va a su cuenta de activo: se aparta de la norma.",
    pista: "Es en Compras: la compra no va a su cuenta de activo, se aparta de la norma.",
    mal: {
      inventario: "No va aquí: en el periódico, Inventario de mercancías no se mueve hasta el cierre.",
      gastos: "No va aquí: se compró para volver a venderla, no es un gasto.",
    },
  },
  cierre: {
    correcta: "inventario",
    bien: "",
    pista: "Es en Inventario de mercancías: el conteo la pone al día.",
    mal: {
      compras: "Compras guarda lo comprado en el mes. Lo que quedó va a otra cuenta.",
      gastos: "Gastos no guarda mercancía. Lo que quedó va a otra cuenta.",
    },
  },
};

/* La pregunta del valor, en el orden de la v6: el inicial, el del conteo y el inicial más las compras. */
export const VALORES = [INICIO * PRECIO, FINAL * PRECIO, (INICIO + 10) * PRECIO];
export const VALOR = {
  correcta: FINAL * PRECIO,
  /* Mello (punto 6): los dos textos de error, tal cual. */
  pista: `Es $${pesos(FINAL * PRECIO)}: el valor de lo que dice el conteo.`,
  mal: {
    [INICIO * PRECIO]: "Ese es el valor del inicio. Al cierre, la cuenta toma el valor del conteo.",
    [(INICIO + 10) * PRECIO]: "Eso es el inicio más las compras. Pero en el mes también se vendió.",
  },
};

/* ═══════════ LOS TEXTOS DE LA FIGURA Y DE LA INTERFAZ (v6, tal cual) ═══════════ */

export const TEXTOS = {
  /* «Pantalla 1 de 6»: {n} y {total}. */
  marca: "Pantalla {n} de {total}",
  /* El rótulo del día: «9 de abril»; el 30, «30 de abril · cierre». */
  fecha: "{d} de abril",
  fechaCierre: "30 de abril · cierre",
  bodega: "Bodega",
  /* C7 de Mello: la bodega va «sin contar» todo el mes; el número sale con el conteo y solo el día 30. */
  sinContar: ["En la bodega: ", "sin contar"],
  /* E8 de Mello: el conteo da cajas y costo por caja, nunca el total que se califica. {n} y {precio}. */
  conteo: ["Conteo físico: ", "{n} cajas · ${precio} cada una"],
  saldo: "Saldo en el libro: ",
  /* Las fechas cortas de las líneas del libro. */
  movInicio: "1 abr",
  movCompra: "16 abr",
  movCierre: "30 abr",
  /* La compra que espera el día 16. */
  tarjeta: { fecha: "16 abr · Compra", toca: "Toca una cuenta" },
  /* C7 de Mello: la venta lleva el porqué de que la cuenta no se mueva. */
  venta: "Salió mercancía. Se anota lo cobrado, no lo que costó: Inventario de mercancías no cambia.",
  /* {n}: las cajas que llegaron. */
  llegaron: "Llegaron {n} cajas.",
  noVaAqui: "No va aquí",
  noEsEste: "No es este",
  bien: "✓",
  contar: "Contar la bodega",
  preguntaValor: "¿Con qué valor queda Inventario de mercancías?",
  bienCierre: "El conteo puso al día la cuenta: sale el inicial y entra el final.",
  seguir: "Seguir",
};

/* ═══════════ LAS PANTALLAS, EN ORDEN (v6) ═══════════ */

/*
 * min y max: el tramo del día que deja mover el deslizador en esa pantalla.
 * listo: lo que habilita el botón. `true`, siempre; `{ visto: n }`, haber
 * llegado al día n; `{ compraAnotada: true }` y `{ cierreOk: true }`, haber
 * acertado esa pregunta.
 */
export const PANTALLAS = [
  { id: "p0", presupuesto: 40, texto: "Al terminar, sabrás por qué en el periódico la cuenta Inventario de mercancías no se mueve en el mes, aunque la bodega se vacíe y se llene.", min: 1, max: 1, listo: true, boton: "Empezar" },
  { id: "p1", presupuesto: 40, texto: "Arriba, la bodega de La Reventa. Abajo, su libro. Arrastra el día y mira qué pasa cuando vende.", min: 1, max: 15, listo: { visto: 9 } },
  { id: "p2", presupuesto: 40, texto: "Recuerda: un activo que aumenta va al debe de su cuenta. El 16 de abril, La Reventa compra 10 cajas por $5.000.000. Toca la cuenta donde se anota la compra.", min: 1, max: 16, listo: { compraAnotada: true } },
  { id: "p3", presupuesto: 40, texto: "Sigue el mes. Arrastra hasta el 29 y compara las cajas de la bodega con lo que dice el libro.", min: 1, max: 29, listo: { visto: 28 } },
  { id: "p4", presupuesto: 40, texto: "Llega el cierre. Cuenta lo que quedó en la bodega y toca la cuenta que se pone al día.", min: CIERRE, max: CIERRE, listo: { cierreOk: true } },
  /* Mello (punto 4): el texto de la pantalla 6, tal cual. */
  { id: "p5", presupuesto: 40, texto: "En el periódico, la empresa no anota día a día el costo de lo que vende. Las compras van a Compras e Inventario de mercancías no se mueve. Al cierre, el conteo lo pone al día.", min: 1, max: CIERRE, listo: true, boton: "Siguiente pieza" },
];

/* ═══════════ LA PIEZA ═══════════ */

export const PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE = {
  id: AP1_ID,
  numero: 1,
  titulo: "La cuenta que no se mueve",
  pantallas: PANTALLAS,
};

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LA FIGURA DE ANTES, SIN USO DESDE LA v6.
 *
 * La pieza de antes (el recorte del lote 1) dibujaba «Dos columnas del
 * periodo» con FiguraDosColumnas.jsx. La v6 la cambia por la bodega y el
 * libro, y nadie la monta ya; el componente se queda (lo importa el banco de
 * medida, scripts/t7/harness, para su sonda) y estos son sus datos.
 * ═══════════════════════════════════════════════════════════════════════════
 */

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

