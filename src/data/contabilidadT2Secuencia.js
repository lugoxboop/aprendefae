/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T2 «LAS CUENTAS, EL DEBE Y EL HABER» EN SECUENCIA — los textos y la bandera.
 *
 * Lotes T2-7 y T2-8 (#471, L). Las cinco piezas de Aprender de T2 pasan de
 * CuatroCapas a SecuenciaAprender (#491, uso en #492). Aquí viven los DATOS:
 * la bandera, el alto de figura de cada pieza y los textos de cada pantalla.
 * Las figuras y el ensamblado están en src/components/mecanicas/libros/t2/
 * (secuenciaP1.jsx … secuenciaP5.jsx; la lista, en secuenciaT2.jsx).
 *
 * ═══════════ LA BANDERA ═══════════
 *
 * Hay estudiantes activos en T2: la página vieja (CuatroCapas con
 * PIEZAS_APRENDER) NO se borra. La secuencia entra AL LADO, detrás de esta
 * constante. APAGADA, la vista pinta exactamente lo de main (lo prueba
 * t2-secuencia.test.mjs). Encenderla —o volver a apagarla— es esta línea.
 * Encendida por L con #590 (la banda de #536), lote T2-13 (#471).
 *
 * ═══════════ DE DÓNDE SALE CADA TEXTO ═══════════
 *
 * Pantallas, tipos y titulares: Near, c-t2-7-near-delta.md (con la
 * numeración de Watari, c-t2-3-watari-figuras.md). Opciones, pistas,
 * devoluciones y frases de cierre: Near v2, c-t2-2-near-lote.md §2, con el
 * delta c-t2-3-near-delta.md y los cuatro pares nuevos de c-t2-7 §6. Frases
 * de consecuencia de una línea y altoFigura: Watari, c-t2-7-watari-figuras.md.
 * El delta T2-7 manda sobre los anteriores. Nada de lo aprobado se reescribe:
 * se reparte en pantallas. Los textos `textual: true` son del libro, letra
 * por letra. La prueba lo compara todo contra los paquetes.
 *
 * ═══════════ LA DEVOLUCIÓN, EN LA BANDA (#536, #590) ═══════════
 *
 * La consecuencia, la pastilla y la pista o el porqué miden de 104 a 130 px
 * (Watari T2-7): no caben en la figura, y Watari midió cada altoFigura SIN
 * ellas. Las pinta la cáscara en la banda bajo la figura, en el sitio del
 * apoyo, con <Veredicto />; la figura no pinta Veredicto propio. El control
 * tocado lleva ✓ o ✕, borde de 2 px y la palabra en su nombre accesible.
 * Cada Haz declara `devolucion: paraLaBanda(textos)` (secuenciaComun.jsx).
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ⚑ LA BANDERA. true = Aprender de T2 es la secuencia; false = la página vieja, igual que en main. */
export const T2_APRENDER_EN_SECUENCIA = true;

/* El tope de #513/#524: 206 a 320 y 253 a 375. */
export const TOPE_ALTO_FIGURA = { a320: 206, a375: 253 };

/* ───────────────── P1 · De qué está hecha una cuenta ───────────────── */

export const P1_ID = "cu-a1-anatomia-de-una-cuenta";

/* Watari T2-7: el estado más alto es P1·6 error2, 183 px a 320 y a 375. */
export const P1_ALTO_FIGURA = { a320: 183, a375: 183 };

export const P1_OBJETIVO = "Al terminar, sabrás leer una cuenta T: sus dos lados, sus movimientos y su saldo.";

export const P1_TEXTOS = {
  apertura: {
    titular: "Al terminar, sabrás leer una cuenta T.",
    apoyo: "Verás sus dos lados, sus movimientos y su saldo.",
  },
  lado: {
    titular: "¿De qué lado?",
    apoyo: "Esta es la cuenta Caja del ejemplo del libro. Entraron $1.000 y $500, y salieron $150. ¿De qué lado pondrías lo que entra?",
    opciones: ["Izquierda", "Derecha"],
    razon: "Toca un lado para seguir.",
  },
  cuenta: {
    titular: "Qué es una cuenta",
    textual: true,
    apoyo: "Cuenta: «un sistema de registro organizado, de los aumentos o disminuciones que sufre un concepto como consecuencia de las operaciones que realiza un negocio».",
  },
  debeHaber: {
    titular: "Debe y haber",
    apoyo: "La raya parte la cuenta en dos. El lado izquierdo se llama debe y el derecho, haber. Son nombres de lugar: no dicen si algo sube o baja.",
  },
  movimientos: {
    titular: "Movimientos",
    apoyo: "Suma cada lado por separado. En Caja, el debe suma $1.500 y el haber, $150. Cada suma es el movimiento de ese lado.",
  },
  saldo: {
    titular: "El saldo",
    apoyo: "El saldo es la diferencia entre los dos movimientos: $1.350. El último valor que anotaste fue al haber. ¿De qué lado va el saldo?",
    opciones: ["En el debe", "En el haber"],
    razon: "Elige el lado del saldo para seguir.",
    pista: "Pista: compara las dos sumas. ¿Cuál es más grande?",
    porque: "Seguiste el último valor. El saldo va del lado del movimiento mayor, y ese es el debe.",
    consecuencia: "Así quedaría del lado de $150.",
  },
  debeNoEsSubir: {
    titular: "Debe no es subir",
    apoyo: "El 18 de enero, Lavado de Autos Mateo le paga $250 a un proveedor. Lo anota en el debe de Cuentas por pagar. ¿La deuda sube o baja?",
    opciones: ["Sube", "Baja"],
    razon: "Elige si la deuda sube o baja.",
    pista: "Pista: después de pagar, ¿le debes más o menos al proveedor?",
    porque: "Leíste el debe como aumento. El debe es un lugar: en una deuda, lo que va al debe la baja.",
    consecuencia: "Así pagar subiría la deuda a $4.250.",
  },
  cierre: {
    titular: "¿Cuánto es el saldo y de qué lado va?",
    apoyo: "Una cuenta tiene $50 en el debe y $30 en el haber.",
    frase: "$20, en el debe. Es la diferencia entre los dos movimientos, y va del lado del más grande.",
    /* Mello T2-9 (S10): las cifras de la figura salen de aquí, no del componente. */
    cuenta: { debe: 50, haber: 30 },
    /* Lote B: el pie del cierre, de Near (c-t2-10-near-textos.md §1). */
    pie: "Basado en el libro, pp. 98-101.",
  },
};

/* ───────────────── P2 · Las dos familias de cuentas ───────────────── */

export const P2_ID = "cu-a2-dos-familias";
/*
 * L, T2-13 (#471, 25-oct): con la bandera encendida, P2·7 con fichas en error
 * mide 200 a 320 y 185 a 375; cada pieza pide el alto de su pantalla más alta
 * (regla de c-t2-7). Watari T2-7 medía 171/158.
 */
export const P2_ALTO_FIGURA = { a320: 200, a375: 185 };
export const P2_OBJETIVO = "Al terminar, sabrás decir si una cuenta es real o nominal con una sola pregunta.";

export const P2_TEXTOS = {
  apertura: {
    titular: "Al terminar, sabrás si una cuenta es real o nominal.",
    apoyo: "Te basta una sola pregunta.",
  },
  diaDespues: {
    titular: "El día después",
    apoyo: "Llega el cierre del año. ¿Cuál de estas dos cuentas sigue con su saldo al día siguiente: Caja o Ingresos por servicios?",
    razon: "Toca la cuenta que crees que sigue.",
  },
  reales: {
    titular: "Las reales",
    apoyo: "Las cuentas reales, o de balance, muestran lo que la empresa tiene, sus deudas y lo que es de los socios: activo, pasivo y patrimonio. Su saldo pasa de un año al otro.",
  },
  nominales: {
    titular: "Las nominales",
    apoyo: "Las cuentas nominales, o de resultados, nacen de lo que pasa en el periodo: ingresos, gastos y costos. Al cierre vuelven a cero. Por eso también se llaman transitorias.",
  },
  gastoOCosto: {
    titular: "¿Gasto o costo?",
    apoyo: "Vendes una mercancía. Lo que te costó esa mercancía, ¿es un gasto o un costo?",
    opciones: ["Es un gasto", "Es un costo"],
    razon: "Elige gasto o costo para seguir.",
    pista: "Pista: piensa si es lo que gastaste para vender o lo que valía lo vendido.",
    porque: "Lo tomaste por un gasto. El libro lo llama costo de ventas: es lo que costó lo que vendiste.",
    consecuencia: "Así sería un gasto de vender.",
  },
  tresNominales: {
    titular: "Tres nominales",
    textual: true,
    apoyo: "Toca cada tarjeta para ver un ejemplo del tema. Ingresos: «los valores que recibe una empresa por la venta de bienes o servicios». Gastos: «los desembolsos necesarios para generar los ingresos». Costos: «desembolsos capitalizables».",
    /* Los ejemplos de cada tarjeta, de la columna VE de Near v2 (P2·5). */
    tarjetas: [
      /* Near T2-8 (c-t2-8-near-textos.md): el ejemplo de Ingresos. */
      { nombre: "Ingresos", definicion: "los valores que recibe una empresa por la venta de bienes o servicios", ejemplo: "ingresos por servicios, como lavar un auto en Lavado de Autos Mateo" },
      { nombre: "Gastos", definicion: "los desembolsos necesarios para generar los ingresos", ejemplo: "salarios y arriendos" },
      { nombre: "Costos", definicion: "desembolsos capitalizables", ejemplo: "costo de ventas" },
    ],
  },
  seCierra: {
    titular: "¿Se cierra igual?",
    apoyo: "Gastos de operación se mueve casi todos los días. ¿Se cierra igual al final del año?",
    opciones: ["Sí, se cierra", "No, sigue abierta"],
    razon: "Elige si se cierra o no.",
    pista: "Pista: la familia no depende de cuánto se use la cuenta.",
    porque: "Pensaste que transitoria es la que se usa poco. Se cierra porque mide el año, no por su uso.",
    consecuencia: "Así 20X2 traería gastos de 20X1.",
  },
  unaPregunta: {
    titular: "Una sola pregunta",
    apoyo: "La pregunta que decide la familia es una sola: ¿el saldo sigue después del cierre? Si sigue, la cuenta es real. Si vuelve a cero, es nominal. Ordena estas seis.",
    razon: "Pon las seis cuentas en su cajón.",
    cajones: ["Sigue", "Vuelve a cero"],
    /* Near v2 P2·7, en ese orden; real = «Sigue». */
    cuentas: [
      { cuenta: "Bancos", real: true },
      { cuenta: "Maquinaria", real: true },
      { cuenta: "Obligaciones financieras", real: true },
      { cuenta: "Ingresos por servicios", real: false },
      { cuenta: "Gastos de administración y ventas", real: false },
      { cuenta: "Costo de ventas", real: false },
    ],
    pista: "Pista: pregúntate si el saldo sigue ahí el 1 de enero.",
    /* Near T2-7 §6: plantillas con {Cuenta}. */
    porqueReal: "{Cuenta} es real. Lo que muestra sigue ahí el 1 de enero, y su saldo pasa.",
    porqueNominal: "{Cuenta} mide el año que terminó. Es nominal y vuelve a cero en el cierre.",
    /* Watari T2-7: la frase es de Bancos; las otras cuentas no traen la suya. */
    consecuenciaBancos: "Así Bancos diría $0 el 1 de enero.",
  },
  cierre: {
    titular: "¿Por qué el primero es real y el segundo, nominal?",
    apoyo: "Salarios por pagar y el gasto en salarios hablan de lo mismo.",
    frase: "Salarios por pagar es una deuda: sigue ahí después del cierre. El gasto mide lo del periodo y vuelve a cero.",
    /* Lote B: el pie del cierre, de Near (c-t2-10-near-textos.md §1). */
    pie: "Basado en el libro.",
  },
};

/* ───────────────── P3 · El debe y el haber ───────────────── */

export const P3_ID = "cu-a5-debe-y-haber";
export const P3_ALTO_FIGURA = { a320: 180, a375: 173 };
export const P3_OBJETIVO = "Al terminar, sabrás por qué el mismo lado sube unas cuentas y baja otras.";

export const P3_TEXTOS = {
  apertura: {
    titular: "El mismo lado sube unas cuentas y baja otras.",
    apoyo: "Al terminar, sabrás por qué pasa eso.",
  },
  mismoLado: {
    titular: "Mismo lado, mismo monto",
    apoyo: "Caleja hace dos registros de $50.000, los dos en el debe: uno en Maquinaria y otro en Aportes sociales. ¿Las dos cuentas reaccionan igual?",
    opciones: ["Sí, igual", "No, distinto"],
    razon: "Elige una opción para seguir.",
  },
  efectos: {
    titular: "Efectos opuestos",
    apoyo: "Maquinaria pasa de $0 a $50.000. Aportes sociales baja de $400.000 a $350.000. El mismo monto y el mismo lado tienen efectos opuestos.",
  },
  dondeVive: {
    titular: "Dónde vive cada cuenta",
    /* Mello T2-9 (S2): sin su primera oración, «Cada cuenta crece por el lado en que vive dentro de la ecuación.», que ya dice el cierre. */
    apoyo: "El activo vive a la izquierda y crece por el debe. El pasivo y el patrimonio viven a la derecha y crecen por el haber.",
    razon: "Lleva cada cuenta a su casa.",
    pista: "Pista: mira de qué lado de la ecuación está cada cuenta.",
    porque: "Confundiste dónde vive con dónde se anota. El activo vive a la izquierda y el patrimonio, a la derecha.",
    /* Watari T2-7: la de Maquinaria puesta a la derecha. Aportes sociales a la izquierda no trae frase. */
    consecuenciaMaquinaria: "Así su debe de $50.000 la bajaría.",
  },
  trampa: {
    titular: "La trampa",
    apoyo: "Con un préstamo de $500, la Caja pasa de $1.000 a $1.500. ¿La empresa ganó $500?",
    opciones: ["Sí, ganó $500", "No, nació una deuda"],
    razon: "Elige si la empresa ganó o no.",
    pista: "Pista: mira qué más aparece cuando entra el préstamo.",
    /* Near T2-8: reemplaza la devolución de la v2, de 20 palabras. */
    porque: "Entrar plata no es ganar. Nace una deuda de $500, y los dos lados suben.",
    consecuencia: "Así habría un ingreso que nadie ganó.",
  },
  gastosIngresos: {
    titular: "Gastos e ingresos",
    apoyo: "Gastos e ingresos mueven el patrimonio. Un gasto lo baja, y por eso va al debe. Un ingreso lo sube, y va al haber. Suelta una ficha en cada uno.",
  },
  pruebaTu: {
    titular: "Prueba tú",
    apoyo: "Ahora prueba tú. Suelta fichas de $100, $500 y $1.000 en cualquier lado de estas cuatro cuentas y mira qué pasa con cada saldo.",
    fichas: [100, 500, 1000],
  },
  porQue: {
    titular: "¿Por qué Maquinaria subió y Aportes sociales bajó?",
    apoyo: "Los dos registros eran de $50.000 en el debe.",
    razon: "Elige una opción para seguir.",
    /* Near v2: «Porque Maquinaria vive a la derecha» / «…a la izquierda» / «…en el haber». La b es la buena. */
    opciones: ["Porque Maquinaria vive a la derecha", "Porque Maquinaria vive a la izquierda", "Porque Maquinaria vive en el haber"],
    correcta: 1,
    /* Near T2-8: la pista del primer error. */
    pista: "Pista: mira en qué lado de la ecuación vive Maquinaria.",
    /* El de «…vive en el haber»: dónde vive contra dónde se anota. */
    porque: "Confundiste dónde vive con dónde se anota. El activo vive a la izquierda.",
    /* Mello T2-9 (S6): el de «…vive a la derecha», que pone el activo con el pasivo y el patrimonio. */
    porqueDerecha: "Pusiste Maquinaria con el pasivo y el patrimonio. Es un activo y vive a la izquierda.",
  },
  cierre: {
    titular: "Cada cuenta crece por el lado en que vive",
    apoyo: "Maquinaria es activo y vive a la izquierda: crece por el debe. Aportes sociales es patrimonio: vive a la derecha y baja por el debe.",
    /* Lote B: el pie del cierre, de Near (c-t2-10-near-textos.md §1). */
    pie: "Basado en el libro, pp. 87, 89, 90, 93 y 113.",
  },
};

/* ───────────────── P4 · La partida doble y las dos reglas ───────────────── */

export const P4_ID = "cu-a3-partida-doble";
export const P4_ALTO_FIGURA = { a320: 181, a375: 178 };
export const P4_OBJETIVO = "Al terminar, sabrás por qué todo hecho se anota dos veces y qué tiene que ser igual.";

export const P4_TEXTOS = {
  apertura: {
    titular: "Todo hecho se anota dos veces.",
    apoyo: "Al terminar, sabrás por qué, y qué tiene que ser igual en cada asiento.",
  },
  unaLinea: {
    titular: "Una sola línea",
    apoyo: "Caleja compra un equipo a crédito, por $25.000. Si solo anotas el equipo, ¿los dos lados de la ecuación quedan iguales?",
    opciones: ["Sí, quedan iguales", "No, quedan distintos"],
    razon: "Elige una opción para seguir.",
  },
  partidaDoble: {
    titular: "Partida doble",
    textual: true,
    apoyo: "Mira la regla que da nombre a esta pieza: Partida doble: «cualquier transacción siempre se debe registrar dos veces, una vez en el debe de una cuenta y otra vez en el haber de otra cuenta».",
    /* Mello T2-9: el control dice qué pasa al tocarlo (antes repetía el titular). */
    control: "Aplicar la regla",
  },
  balanza: {
    titular: "La balanza",
    apoyo: "Activos = Pasivos + Patrimonio. El equipo sube el activo y la deuda con el proveedor sube el pasivo. Con los dos registros, la balanza vuelve a nivel.",
    razon: "Lleva Cuentas por pagar a su platillo.",
    pista: "Pista: la deuda con el proveedor es un pasivo.",
    porque: "Pusiste la deuda con el activo. Cuentas por pagar es pasivo, y va del otro lado de la balanza.",
    consecuencia: "Así sería $50.000 contra $0.",
  },
  primeraRegla: {
    titular: "Primera regla",
    apoyo: "Primera regla: activos, gastos y costos aumentan por el debe y disminuyen por el haber. Su saldo suele quedar en el debe.",
    familias: ["Activos", "Gastos", "Costos"],
  },
  segundaRegla: {
    titular: "Segunda regla",
    apoyo: "Segunda regla: pasivos, patrimonio e ingresos aumentan por el haber y disminuyen por el debe. Su saldo suele quedar en el haber. Lleva cada familia a su grupo.",
    razon: "Lleva las tres familias a su grupo.",
    familias: ["Pasivos", "Patrimonio", "Ingresos"],
    pista: "Pista: ¿de qué lado de la ecuación vive esa familia?",
    /* Near T2-7 §6: plantilla con {Familia}. */
    porque: "{Familia} vive a la derecha de la ecuación, así que crece por el haber.",
    /* Watari T2-7: la de Ingresos puesta con el debe. */
    consecuenciaIngresos: "Así una venta bajaría el patrimonio.",
  },
  unPago: {
    titular: "Un pago, dos bajas",
    apoyo: "El 30 de enero, Lavado paga $400 de la hipoteca: Hipoteca por pagar va al debe y Bancos, al haber. ¿Cuál de las dos baja?",
    opciones: ["Baja solo Bancos", "Baja solo la hipoteca", "Bajan las dos"],
    razon: "Elige cuál de las dos baja.",
    pista: "Pista: después de pagar, mira cuánto debes y cuánto tienes en el banco.",
    porqueSoloBancos: "Pensaste que el debe siempre suma. En un pasivo, el debe resta: la hipoteca también baja.",
    porqueSoloHipoteca: "Bancos es un activo y va al haber: también baja. Pagar deja menos deuda y menos plata.",
    /* Watari T2-7: la de «Baja solo Bancos». */
    consecuenciaSoloBancos: "Así la hipoteca subiría a $8.400.",
  },
  simpleCompuesto: {
    titular: "Simple o compuesto",
    apoyo: "Un asiento simple toca dos cuentas, y uno compuesto, más de dos. En los dos, la suma del debe tiene que ser igual a la del haber.",
    opciones: ["Simple", "Compuesto"],
  },
  descuadran: {
    titular: "¿Muchas cuentas descuadran?",
    apoyo: "El 4 de enero, Lavado anota tres cuentas: una en el debe y dos en el haber. ¿Tener más cuentas de un lado lo descuadra?",
    opciones: ["Sí, lo descuadra", "No lo descuadra"],
    razon: "Elige si lo descuadra o no.",
    pista: "Pista: suma cada lado antes de contar las cuentas.",
    porque: "Creíste que un asiento compuesto viene descuadrado. Cuadra si las sumas son iguales: $4.800 y $4.800.",
    consecuencia: "Así un lado sumaría más que el otro.",
  },
  cierre: {
    titular: "¿Tres cuentas cuadran igual que dos?",
    apoyo: "Porque lo que se iguala es la suma de cada lado, no el número de cuentas.",
    /* Lote B: el pie del cierre, de Near (c-t2-10-near-textos.md §1). */
    pie: "Basado en el libro, pp. 87 y 98-101.",
  },
};

/* ───────────────── P5 · Del diario al mayor ───────────────── */

export const P5_ID = "cu-a4-diario-y-mayor";
export const P5_ALTO_FIGURA = { a320: 197, a375: 197 };
export const P5_OBJETIVO = "Al terminar, sabrás anotar un hecho en el diario y pasarlo al mayor sin cambiar su lado.";

export const P5_TEXTOS = {
  apertura: {
    titular: "Del diario al mayor, sin cambiar el lado.",
    apoyo: "Al terminar, sabrás anotar un hecho en el diario y pasarlo al mayor.",
  },
  fechaOCuenta: {
    titular: "¿Por fecha o por cuenta?",
    apoyo: "Lavado de Autos Mateo anotó nueve hechos en enero. Quieres saber cuánto quedó en Bancos. ¿Qué te sirve más: verlos por fecha o agrupados por cuenta?",
    opciones: ["Verlos por fecha", "Verlos por cuenta"],
    razon: "Elige cómo verlos para seguir.",
  },
  diario: {
    titular: "El diario",
    apoyo: "El libro diario anota cada hecho en orden de fecha, apenas ocurre. Por eso se le llama libro de registro de asientos originales. Sus columnas son fecha, detalle, debe y haber.",
    columnas: ["Fecha", "Detalle", "Debe", "Haber"],
  },
  comoSeEscribe: {
    titular: "Cómo se escribe",
    apoyo: "En el detalle va primero la cuenta del debe. Debajo, un poco a la derecha, va la del haber, con una explicación corta.",
  },
  mayor: {
    titular: "El mayor",
    textual: true,
    apoyo: "Después del diario viene el mayor. Allí cada cuenta tiene su propia T y junta todo lo que le pasó en el mes. Libro mayor: «el más importante en cualquier contabilidad».",
    control: "Ver el mayor",
  },
  mayorizar: {
    titular: "Mayorizar",
    apoyo: "Mayorizar es pasar cada valor del diario a su cuenta del mayor: lo del debe al debe y lo del haber al haber. No se calcula nada nuevo.",
    razon: "Lleva las cuatro líneas a su T.",
    pista: "Pista: mira en qué columna del diario está el valor.",
    porque: "Cambiaste la columna. Mayorizar no elige el lado: lo copia tal cual del diario.",
  },
  dosPreguntas: {
    titular: "Dos preguntas",
    apoyo: "El diario responde qué pasó el 3 de enero. ¿Qué pregunta responde el mayor?",
    opciones: ["¿Qué pasó en cada fecha?", "¿Cómo quedó cada cuenta?"],
    razon: "Elige qué responde el mayor.",
    pista: "Pista: recuerda cómo agrupa el mayor los valores.",
    porque: "Le diste al mayor el orden del diario. El mayor ordena por cuenta, no por fecha.",
    consecuencia: "Así el mayor sería otro diario.",
  },
  cierre: {
    titular: "¿En qué libro se registra primero un hecho?",
    apoyo: "En el diario. Es el registro de los asientos originales, en orden de fecha. El mayor viene después y ordena esos datos por cuenta.",
    /* Lote B: el pie del cierre, de Near (c-t2-10-near-textos.md §1). */
    pie: "Basado en el libro, pp. 96 y 98-101.",
  },
};

/*
 * Lo que falta, con quién lo debe. La prueba lo nombra en rojo mientras esta
 * lista no esté vacía; cada entrada se borra cuando su texto llega.
 */
export const PENDIENTES_T2 = [];
