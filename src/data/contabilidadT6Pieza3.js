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
  /*
   * B2 · un término por pantalla (Futaba, 15-oct): seis pantallas. El
   * «Ojo» de la provisión (sube al acreditarse) sale a su propia pantalla,
   * «Al revés de Clientes».
   */
  nombres: [
    {
      termino: "Provisión para cuentas incobrables",
      definicion: "Es una cuenta donde la empresa anota, al cierre, lo que calcula que no va a cobrar de lo que le deben sus clientes. Se crea con un asiento: se debita Gasto provisiones – cuentas incobrables y se acredita Provisión para cuentas incobrables.",
      delLibro: "El libro la llama “Provisión para deudas incobrables”.",
      rotuloDelLibro: "Nota",
    },
    {
      termino: "Al revés de Clientes",
      definicion: "Ojo: la provisión sube cuando se acredita y baja cuando se debita. Es al revés de Cuentas por cobrar – clientes, porque se resta de ella.",
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
      definicion: "Cuando una deuda se da por perdida, se debita la provisión y se acredita Cuentas por cobrar – clientes. El gasto no se toca: ya se anotó al crear la provisión.",
      delLibro: "«Una vez establecida la provisión, el saldo de la cuenta se va reduciendo…» (p. 202)",
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
  provision: "Provisión para cuentas incobrables",
  clientes: "Cuentas por cobrar – clientes",
  debita: "se debita",
  acredita: "se acredita",
};

/* Los 19 pasos y el cierre, cada uno con su pie de fuente (Futaba). */
export const PASOS_T6_A3 = [
  { texto: "El 31 de diciembre de 2007, El Torito Currambero revisa lo que le deben sus clientes: $2.655.000.", pie: "Basado en el libro, p. 200" },
  { texto: "Calcula que una parte no la va a recuperar: $148.800.", pie: "Basado en el libro, p. 202" },
  { texto: "Se debita Gasto provisiones – cuentas incobrables por $148.800.", pie: "Libro, p. 202" },
  { texto: "Y se acredita Provisión para cuentas incobrables, por el mismo valor.", pie: "Libro, p. 202" },
  { texto: "Ese gasto baja la utilidad del año.", pie: "Libro, p. 202" },
  { texto: "En el estado de situación financiera, la provisión se resta de Cuentas por cobrar – clientes.", pie: "Libro, p. 202" },
  { texto: "Cálculo: $2.655.000 − $148.800 = $2.506.200, el valor neto.", pie: "Libro, p. 202" },
  { texto: "En marzo del año siguiente, la empresa da por perdida la deuda de Pablo Moncayo.", pie: "Basado en el libro, p. 202" },
  { texto: "Se debita Provisión para cuentas incobrables por $180.000.", pie: "Libro, p. 202" },
  { texto: "Y se acredita Cuentas por cobrar – clientes, a nombre de Pablo Moncayo.", pie: "Basado en el libro, p. 202" },
  { texto: "No se anota ningún gasto: ese ya se anotó en diciembre.", pie: "Basado en el libro, p. 202" },
  { texto: "La provisión era de $148.800, y lo castigado fue $180.000.", pie: "Libro, p. 202" },
  { texto: "La provisión quedó subestimada en $31.200.", pie: "Libro, p. 202" },
  { texto: "El 31 de diciembre del año siguiente, la empresa hace otra vez el análisis.", pie: "Libro, p. 203" },
  { texto: "Esta vez pide una provisión de $153.400.", pie: "Libro, p. 203" },
  { texto: "A esa cifra se le suman los $31.200 que faltaron.", pie: "Libro, p. 203" },
  { texto: "Se debita Gasto provisiones – cuentas incobrables por $184.600.", pie: "Basado en el libro, p. 203" },
  { texto: "Y se acredita Provisión para cuentas incobrables, por el mismo valor.", pie: "Libro, p. 203" },
  { texto: "Al final, la provisión queda con $153.400: justo lo que pidió el análisis.", pie: "Libro, p. 203" },
];
export const CIERRE_T6_A3 = {
  texto: "La provisión se crea al cierre, se usa al castigar y se corrige al año siguiente.",
  pie: "Basado en el libro, pp. 200-203",
};

/* ═══════════ CAPA 3 · «AHORA PRUEBE USTED» · la cuenta T en tres momentos ═══════════ */

/* Consigna y las tres decisiones, una por momento: entrega 2 de Futaba. Pistas, la tercera opción de 2007 y la pregunta nueva de diciembre: lote C2 · C1 · C7 (C2 y C1-8). */
export const CONSIGNA_CAPA_3_T6_A3 = "Toca cada momento y decide qué le pasa a la provisión. Después, mira cómo queda la T.";

/*
 * Los tres momentos, en orden (se abren en orden: guía v1 §5.1). Cada uno
 * deja en la T su movimiento (columna y monto) y el saldo que queda: normal
 * bajo HABER, o en contra bajo DEBE.
 * B5 de Futaba: la caja se llama por lo que pasa (`caja`: «Se crea», «Se
 * usa», «Se corrige»); la fecha (`nombre`) queda solo en las filas de la T.
 */
export const MOMENTOS_T6_A3 = [
  {
    id: "diciembre-2007",
    caja: "Se crea",
    nombre: "31 de diciembre de 2007",
    revela: "Sube $148.800, porque se crea la provisión. El saldo queda en $148.800.",
    pie: "Libro, pp. 202-203",
    lado: "haber",
    monto: "$148.800",
    saldo: { texto: "El saldo queda en $148.800", enContra: false },
    pregunta: "¿En qué columna de la T se anota la provisión que se crea?",
    opciones: [{ id: "debe", texto: "Debe" }, { id: "haber", texto: "Haber" }, { id: "ninguna", texto: "En ninguna: es solo un cálculo" }],
    correcta: "haber",
    falla: {
      debe: "La provisión sube por el Haber.",
      ninguna: "Es un cálculo, pero se anota con un asiento: la provisión sube por el Haber.",
    },
    pista: "Mira el asiento que la crea: el gasto va al Debe. ¿Y la provisión?",
  },
  {
    id: "marzo",
    caja: "Se usa",
    nombre: "Marzo del año siguiente",
    revela: "Baja $180.000, porque se castiga la deuda de Pablo Moncayo. Como solo tenía $148.800, le faltan $31.200.",
    pie: "Basado en el libro, pp. 202-203",
    lado: "debe",
    monto: "$180.000",
    saldo: { texto: "Le faltan $31.200", enContra: true },
    pregunta: "¿Qué le pasa al saldo?",
    opciones: [{ id: "cero", texto: "Queda en $0" }, { id: "faltan", texto: "Le faltan $31.200" }, { id: "sigue", texto: "Sigue en $148.800" }],
    correcta: "faltan",
    falla: {
      cero: "No queda en cero: el castigo es más grande que la provisión.",
      sigue: "El castigo se debita a la provisión, así que el saldo baja.",
    },
    pista: "Compara lo que había en la provisión con lo que se castigó. ¿Cuál es mayor?",
  },
  {
    id: "diciembre-siguiente",
    caja: "Se corrige",
    nombre: "31 de diciembre del año siguiente",
    revela: "Sube $184.600: los $153.400 del análisis más los $31.200 que faltaron. El saldo queda en $153.400.",
    pie: "Libro, p. 203",
    lado: "haber",
    monto: "$184.600",
    saldo: { texto: "El saldo queda en $153.400", enContra: false },
    pregunta: "¿El registro es mayor, menor o igual a lo que pide el análisis?",
    opciones: [{ id: "mayor", texto: "Mayor" }, { id: "igual", texto: "Igual" }, { id: "menor", texto: "Menor" }],
    correcta: "mayor",
    falla: {
      igual: "$153.400 es el saldo que debe quedar. Para llegar ahí, también hay que cubrir lo que faltó en marzo.",
      menor: "Lo que faltó en marzo se suma, no se resta.",
    },
    pista: "Mira de qué saldo parte la T antes de este registro.",
  },
];
/* La T: su nombre y las palabras publicadas de sus columnas (ElCierreCompleto). */
export const CUENTA_T_T6_A3 = { nombre: "Provisión para cuentas incobrables", debe: "DEBE", haber: "HABER" };
export const FINAL_CAPA_3_T6_A3 = {
  texto: "El saldo final es igual a lo que pidió el análisis. Por eso se sumaron los $31.200: para cubrir lo que faltó.",
  pie: "Basado en el libro, p. 203",
};

/* ═══════════ CAPA 4 · «EN UNA FRASE» (UnaFrase, sin cambios) ═══════════ */

/*
 * C1-9 de Futaba (lote C2 · C1 · C7, PASA de Shoko): el caso contrario al del
 * ejemplo, con su pie (lo pinta la escena de la pieza, bajo UnaFrase).
 * En el orden de Futaba; UnaFrase las baraja una vez al cargar.
 */
export const PREGUNTA_FINAL_T6_A3 = "Si en marzo el castigo hubiera sido menor que la provisión, ¿qué se haría en diciembre?";
export const OPCIONES_FINAL_T6_A3 = [
  {
    id: "b5-t6-a3-resta",
    texto: "Lo que sobró se resta de lo que pide el análisis.",
    correcta: true,
    feedback: "Correcto. Si la provisión quedó sobrestimada, se hace lo contrario que en el ejemplo: lo que sobró se resta de la provisión que pide el análisis.",
  },
  {
    id: "b5-t6-a3-suma",
    texto: "Lo que sobró se suma a lo que pide el análisis.",
    correcta: false,
    feedback: "No es esa. Lo que faltó se suma. Si sobró, se hace lo contrario: se resta.",
  },
  {
    id: "b5-t6-a3-solo-analisis",
    texto: "Se registra solo lo que pide el análisis.",
    correcta: false,
    feedback: "No es esa. Lo que sobró sigue en la provisión. Por eso se descuenta del registro del año.",
  },
  {
    id: "b5-t6-a3-caja",
    texto: "Lo que sobró sale de la provisión y entra a Caja.",
    correcta: false,
    feedback: "No es esa. La provisión no es plata: no sale ni entra nada de Caja.",
  },
];
export const PIE_FINAL_T6_A3 = "Basado en el libro, p. 203";

/* ═══════════ CAPA 2 LARGA: LOS PASOS QUE SE JUNTAN Y LA PARADA (hoja 7 de Mai, entrega 3 de Futaba) ═══════════ */

/*
 * De 19 pasos a 15 (Mai §1): las fusiones de Futaba menos tres. 6 + 7 pasa de
 * 4 renglones a 320 (regla 2, medido por Mai). 1 + 2 y 9 + 10 también, al
 * ancho del sitio (5 renglones a 320 con la barra de desplazamiento,
 * scripts/b5/navegador.mjs; Mai midió sin ella): subían el bloque 21,69 en
 * toda la pieza. Los pies, los de Futaba; los pasos que no se juntan
 * conservan el suyo. La vuelta atrás del paso 11 de antes es ahora el 10.
 */
export const FUSION_T6_A3 = {
  grupos: [[1], [2], [3, 4], [5], [6], [7], [8], [9], [10], [11], [12, 13], [14, 15], [16], [17, 18], [19]],
  pies: [
    "Basado en el libro, p. 200", "Basado en el libro, p. 202", "Libro, p. 202", "Libro, p. 202", "Libro, p. 202", "Libro, p. 202",
    "Basado en el libro, p. 202", "Libro, p. 202", "Basado en el libro, p. 202", "Basado en el libro, p. 202", "Libro, p. 202",
    "Libro, p. 203", "Libro, p. 203", "Basado en el libro, p. 203", "Libro, p. 203",
  ],
};
/* La predicción después del paso 10 de antes y antes del 11 (la que Futaba llamó «entre 6 y 7»; Mai, «entre 7 y 8»): hoy, entre el 9 y el 10. */
export const PARADA_T6_A3 = {
  antes: 10,
  pregunta: "Al castigar la deuda, ¿se anota otra vez el gasto?",
  opciones: [{ id: "si", texto: "Sí" }, { id: "no", texto: "No" }, { id: "si-parte", texto: "Sí, por la parte que la provisión no cubre" }],
  correcta: "no",
  falla: {
    si: "El gasto se anotó en diciembre. Ahora solo se usa la provisión.",
    "si-parte": "No: el gasto ya se anotó al crear la provisión, aunque esta se quede corta.",
  },
  pista: "Recuerda en qué momento del ejemplo se anotó el gasto de la provisión.",
  pie: "Basado en el libro, p. 202",
  resaltados: ["provision2", "clientes2"],
  /* La predicción escrita en la escena (Mai, enganche §2a); la de «Sí, por la parte…», de la auditoría de Shoko. */
  etiquetas: { si: "Otra vez en marzo", "si-parte": "En marzo, solo lo que faltó", no: "Solo en diciembre" },
};

/* ═══════════ LOTE 7 · EL TANQUE (P2 de Mai, 16-oct, con las decisiones de Sakuta) ═══════════ */

/*
 * Los rótulos del modelo, las pistas de los gestos y los nombres accesibles
 * (§10 de Mai: suyos, nuevos, PARA SHOKO). Las cifras y las fechas son las de
 * los pasos de Futaba. «Queda en» y «Le faltan» van delante de su cifra; el
 * nombre del tanque, delante de «: {saldo}».
 */
export const TANQUE_T6_A3 = {
  saldo: "Saldo",
  quedaEn: "Queda en",
  leFaltan: "Le faltan",
  leFaltanLector: "le faltan",
  analisis: "Análisis",
  noLaVa: "No la va a recuperar",
  valorNeto: "Valor neto",
  provisionMenos: "Provisión −",
  cero: "0",
  pesosCero: "$0",
  sueltaAqui: "Suéltalo aquí",
  tocaBarra: "Toca la barra para restar",
  subeNivel: "Sube el nivel hasta la línea",
  nombreTanque: "Saldo de la provisión",
  nombreBarra: "Restar la provisión de Cuentas por cobrar – clientes",
  nombreAsa: "Nivel de la provisión",
  pablo: "Pablo Moncayo",
  /* La capa 3 sobre el tanque (§3.3): el contador «Momento n de 3» y el botón de avance. */
  momento: "Momento",
  siguienteMomento: "Siguiente momento",
  faltante: "$31.200",
  pide: "$153.400",
};
