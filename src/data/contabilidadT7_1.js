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
 * La figura todavía no está: la entrega Watari con sus capturas, medidas y
 * textos alternativos. Mientras tanto la pieza deja un hueco marcado y no
 * inventa ninguna. La v5 no dice en qué pantalla va, así que el hueco va en
 * la portada hasta que el paquete de diseño lo diga.
 */
export const FIGURA_PENDIENTE = "Figura pendiente: la entrega Watari.";

/* ═══════════ LAS PANTALLAS, EN ORDEN ═══════════ */

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás en qué cuenta se anota la compra de mercancía en el sistema periódico. Y sabrás por qué Inventario de mercancías no se mueve hasta el cierre.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 209 y 212",
  figura: true,
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
};

/*
 * Pantalla 4 · pregunta 1. «Compras» entra por pregunta: el estudiante la ve
 * primero aquí, como opción, y el acierto la explica.
 */
const PREGUNTA_COMPRA = {
  id: "pregunta-compra",
  tipo: "pregunta",
  enunciado: "El 16 de abril, La Reventa Ltda. le compra mercancía a un proveedor por $5.000.000, a crédito. La empresa usa el sistema de inventario periódico.",
  /*
   * Los cinco datos, con las palabras de la v5. La v3 los escribía en tabla y
   * con mayúscula inicial («Un proveedor», «A crédito»); la v5, que es la
   * aprobada, los escribe en minúscula. Se sigue la v5.
   */
  ficha: [
    { dato: "Quién recibe", texto: "La Reventa Ltda. recibe la mercancía" },
    { dato: "Quién entrega", texto: "un proveedor" },
    { dato: "Monto", texto: "$5.000.000 por la mercancía" },
    { dato: "Tipo", texto: "a crédito" },
    { dato: "Clase de hecho", texto: "compra de mercancía para volver a venderla" },
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
  error: { boton: BOTON.probarOtra, pie: "Basado en el libro, pp. 209, 210 y 212" },
  acierto: {
    texto: "Así es. En el sistema periódico, la compra de mercancía se anota en el debe de Compras, por su costo: $5.000.000. Inventario de mercancías no se toca. Como la compra no va al debe de su cuenta de activo, el libro dice que este registro se aparta de la norma.",
    /* La línea que aparece, en sus tres partes. Se lee «16 de abril · Compras · Debe $5.000.000». */
    linea: { fecha: "16 de abril", cuenta: "Compras", lado: "Debe", monto: "$5.000.000" },
    nota: "La otra parte del asiento, lo que se le debe al proveedor, la armamos en «La factura completa».",
    boton: BOTON.seguir,
    pie: "Basado en el libro, pp. 210 y 212",
  },
};

/* Pantalla 5 · pregunta 2. La v5 no trae ficha ni ayuda en esta pantalla. */
const PREGUNTA_CONTEO = {
  id: "pregunta-conteo",
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
    "Siguiente: la factura completa de esta compra.",
  ],
  boton: null,
  pie: "Basado en el libro, pp. 209 y 212",
};

/* ═══════════ LA PIEZA ═══════════ */

export const PIEZA_LA_CUENTA_QUE_NO_SE_MUEVE = {
  id: AP1_ID,
  numero: 1,
  titulo: "La cuenta que no se mueve",
  pantallas: [PORTADA, LO_QUE_YA_SABES, EL_CONTEO_AL_FINAL, LA_CONSECUENCIA, PREGUNTA_COMPRA, PREGUNTA_CONTEO, RESUMEN],
};
