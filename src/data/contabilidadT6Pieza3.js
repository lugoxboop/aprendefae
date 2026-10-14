/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 6 · PIEZA 3 DE APRENDER — «La provisión, de un año al siguiente».
 *
 * Célula B. Todo el texto que lee el estudiante vive en ESTE archivo, guardado
 * entero en orquestador/conocimiento/paquetes/b5-t6-aprender3.md. Precedencia
 * (Sakuta, todo con PASA de Shoko): la versión que manda de Futaba, corregida;
 * el diseño, la guía v1 de Mai con su anexo v1b («$180.000» en la anotación
 * de Clientes del paso 10). Las citas del libro van con «» y su página.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LA PIEZA (lo que lee CuatroCapas: título, objetivo y capa 1) ═══════════ */

export const PIEZA_LA_PROVISION = {
  id: "b5-t6-a3-la-provision-de-un-ano-al-siguiente",
  numero: 3,
  titulo: "La provisión, de un año al siguiente",
  objetivo: "Vas a ver cómo se crea la provisión, cómo se castiga una deuda contra ella y cómo se ajusta al año siguiente.",
  nombres: [
    {
      termino: "Provisión para deudas incobrables",
      definicion: "Es una cuenta donde la empresa anota, al cierre, lo que calcula que no va a cobrar de lo que le deben sus clientes. Se crea con un asiento. Se debita Gasto provisiones – cuentas incobrables y se acredita Provisión para deudas incobrables. Ojo: la provisión sube cuando se acredita y baja cuando se debita. Es al revés de Cuentas por cobrar – clientes, porque se resta de ella.",
    },
    {
      termino: "Valor neto",
      definicion: "La provisión se resta de Cuentas por cobrar – clientes en el estado de situación financiera. Lo que queda es el valor neto. Así la empresa ve cuánto espera recuperar de verdad.",
      delLibro: "La provisión no mueve Caja ni Bancos. No es plata aparte: es un valor que se resta de lo que deben los clientes.",
      rotuloDelLibro: "Nota",
    },
    {
      termino: "El gasto",
      definicion: "El gasto de la provisión baja la utilidad del año en que se crea. Se ve en el estado de resultados.",
    },
    {
      termino: "Castigar contra la provisión",
      definicion: "Cuando una deuda se da por perdida, se debita la provisión y se acredita Cuentas por cobrar – clientes. El gasto no se toca, porque ya se anotó al crear la provisión.",
      delLibro: "«Una vez establecida la provisión, el saldo de la cuenta se va reduciendo en la medida en que se vayan castigando cuentas que se consideren incobrables.» (p. 202)",
    },
    {
      termino: "Subestimada y sobrestimada",
      definicion: "A veces lo que se castiga es más de lo que se había provisionado. Entonces la provisión quedó subestimada, es decir, se quedó corta. Esa diferencia se suma a la provisión del año siguiente. Si quedó sobrestimada, es decir, se pasó, se hace lo contrario: la diferencia se resta.",
    },
  ],
};

/* ═══════════ CAPA 2 · «MÍRELO FUNCIONAR» · El Torito Currambero ═══════════ */

/*
 * Los rótulos de la escena (guía v1 §4 y v1b): fragmentos literales de los
 * pasos, de las cajas de la capa 3 («Marzo del año siguiente») o del cierre
 * («Se crea», «Se usa», «Se corrige»).
 */
export const ESCENA_T6_A3 = {
  momentos: [
    { fecha: "31 de diciembre de 2007", tipo: "Se crea" },
    { fecha: "Marzo del año siguiente", tipo: "Se usa" },
    { fecha: "31 de diciembre del año siguiente", tipo: "Se corrige" },
  ],
  deben: "Lo que le deben sus clientes",
  saldoClientes: "$2.655.000",
  parte: "Una parte no la va a recuperar: $148.800",
  provision1: "$148.800",
  utilidad: "Ese gasto baja la utilidad del año",
  estado: "En el estado de situación financiera",
  menos: "− $148.800",
  neto: "El valor neto",
  valorNeto: "$2.506.200",
  perdida: "Da por perdida la deuda de Pablo Moncayo",
  castigo: "$180.000",
  aNombre: "A nombre de Pablo Moncayo",
  subestimada: "Quedó subestimada en $31.200",
  analisis: "Hace otra vez el análisis",
  pide: "Pide una provisión de $153.400",
  suman: "Se le suman los $31.200 que faltaron",
  ajuste: "$184.600",
  queda: "La provisión queda con $153.400",
  gasto: "Gasto provisiones – cuentas incobrables",
  provision: "Provisión para deudas incobrables",
  clientes: "Cuentas por cobrar – clientes",
  debita: "se debita",
  acredita: "se acredita",
};

/* Los 19 pasos y el cierre, cada uno con su pie de fuente (Futaba). */
export const PASOS_T6_A3 = [
  { texto: "El 31 de diciembre de 2007, El Torito Currambero revisa lo que le deben sus clientes: $2.655.000.", pie: "Basado en el libro, p. 200" },
  { texto: "Calcula que una parte no la va a recuperar: $148.800.", pie: "Basado en el libro, p. 202" },
  { texto: "Se debita Gasto provisiones – cuentas incobrables por $148.800.", pie: "Libro, p. 202" },
  { texto: "Y se acredita Provisión para deudas incobrables, por el mismo valor.", pie: "Libro, p. 202" },
  { texto: "Ese gasto baja la utilidad del año.", pie: "Libro, p. 202" },
  { texto: "En el estado de situación financiera, la provisión se resta de Cuentas por cobrar – clientes.", pie: "Libro, p. 202" },
  { texto: "Cálculo: $2.655.000 − $148.800 = $2.506.200, el valor neto.", pie: "Libro, p. 202" },
  { texto: "En marzo del año siguiente, la empresa da por perdida la deuda de Pablo Moncayo.", pie: "Basado en el libro, p. 202" },
  { texto: "Se debita Provisión para deudas incobrables por $180.000.", pie: "Libro, p. 202" },
  { texto: "Y se acredita Cuentas por cobrar – clientes, a nombre de Pablo Moncayo.", pie: "Basado en el libro, p. 202" },
  { texto: "No se anota ningún gasto: ese ya se anotó en diciembre.", pie: "Basado en el libro, p. 202" },
  { texto: "La provisión era de $148.800, y lo castigado fue $180.000.", pie: "Libro, p. 202" },
  { texto: "La provisión quedó subestimada en $31.200.", pie: "Libro, p. 202" },
  { texto: "El 31 de diciembre del año siguiente, la empresa hace otra vez el análisis.", pie: "Libro, p. 203" },
  { texto: "Esta vez pide una provisión de $153.400.", pie: "Libro, p. 203" },
  { texto: "A esa cifra se le suman los $31.200 que faltaron.", pie: "Libro, p. 203" },
  { texto: "Se debita Gasto provisiones – cuentas incobrables por $184.600.", pie: "Basado en el libro, p. 203" },
  { texto: "Y se acredita Provisión para deudas incobrables, por el mismo valor.", pie: "Libro, p. 203" },
  { texto: "Al final, la provisión queda con $153.400: justo lo que pidió el análisis.", pie: "Libro, p. 203" },
];
export const CIERRE_T6_A3 = {
  texto: "La provisión se crea al cierre, se usa al castigar y se corrige al año siguiente.",
  pie: "Basado en el libro, pp. 200-203",
};

/* ═══════════ CAPA 3 · «AHORA PRUEBE USTED» · la cuenta T en tres momentos ═══════════ */

export const CONSIGNA_CAPA_3_T6_A3 = "Toca cada momento y mira cómo cambia el saldo de la provisión.";

/*
 * Los tres momentos, en orden (se abren en orden: guía v1 §5.1). Cada uno
 * deja en la T su movimiento (columna y monto) y el saldo que queda: normal
 * bajo HABER, o en contra bajo DEBE.
 */
export const MOMENTOS_T6_A3 = [
  {
    id: "diciembre-2007",
    nombre: "31 de diciembre de 2007",
    revela: "Sube $148.800, porque se crea la provisión. El saldo queda en $148.800.",
    pie: "Libro, pp. 202-203",
    lado: "haber",
    monto: "$148.800",
    saldo: { texto: "El saldo queda en $148.800", enContra: false },
  },
  {
    id: "marzo",
    nombre: "Marzo del año siguiente",
    revela: "Baja $180.000, porque se castiga la deuda de Pablo Moncayo. Como solo tenía $148.800, le faltan $31.200.",
    pie: "Basado en el libro, pp. 202-203",
    lado: "debe",
    monto: "$180.000",
    saldo: { texto: "Le faltan $31.200", enContra: true },
  },
  {
    id: "diciembre-siguiente",
    nombre: "31 de diciembre del año siguiente",
    revela: "Sube $184.600: los $153.400 del análisis más los $31.200 que faltaron. El saldo queda en $153.400.",
    pie: "Libro, p. 203",
    lado: "haber",
    monto: "$184.600",
    saldo: { texto: "El saldo queda en $153.400", enContra: false },
  },
];
/* La T: su nombre y las palabras publicadas de sus columnas (ElCierreCompleto). */
export const CUENTA_T_T6_A3 = { nombre: "Provisión para deudas incobrables", debe: "DEBE", haber: "HABER" };
export const FINAL_CAPA_3_T6_A3 = {
  texto: "El saldo final es igual a lo que pidió el análisis. Por eso se sumaron los $31.200: para cubrir lo que faltó.",
  pie: "Basado en el libro, p. 203",
};

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

export const PREGUNTA_FINAL_T6_A3 = "En marzo, ¿por qué El Torito no anota un gasto al castigar la deuda de Pablo Moncayo?";
/* En el orden de Futaba; UnaFrase las baraja una vez al cargar. */
export const OPCIONES_FINAL_T6_A3 = [
  {
    id: "b5-t6-a3-diciembre",
    texto: "Porque el gasto se anotó en diciembre, al crear la provisión.",
    correcta: true,
    feedback: "Correcto. El gasto se anotó el 31 de diciembre, cuando se creó la provisión. En marzo se debita la provisión.",
  },
  {
    id: "b5-t6-a3-cobrar",
    texto: "Porque la deuda de Pablo Moncayo todavía se puede cobrar.",
    correcta: false,
    feedback: "No es esa. La empresa la considera irrecuperable, y por eso la castiga.",
  },
  {
    id: "b5-t6-a3-caja",
    texto: "Porque castigar una deuda solo mueve Caja y Cuentas por cobrar – clientes.",
    correcta: false,
    feedback: "No es esa. Al castigar no entra plata. Se debita la provisión y se acredita Cuentas por cobrar – clientes.",
  },
  {
    id: "b5-t6-a3-pierden",
    texto: "Porque los $31.200 que faltaron se pierden sin anotarse.",
    correcta: false,
    feedback: "No es esa. Los $31.200 no se pierden: se suman a la provisión del año siguiente, que por eso es de $184.600.",
  },
];
