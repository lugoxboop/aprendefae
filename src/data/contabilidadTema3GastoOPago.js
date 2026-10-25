/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · «¿GASTO O PAGO?» (t3-gasto-o-pago) — el contenido.
 *
 * Paquete orquestador/conocimiento/paquetes/e3-t3-gasto-o-pago-v3.md, con el
 * PASA de diseño de Takamura. Mandan, en este orden: sus condiciones C1 a C6,
 * los textos de Miyata (§2 a §5) y la forma de Itagaki (§6 a §9). Todo el
 * texto va literal; nada es mío salvo el `monto` numérico de cada hecho, que
 * es la cifra que el propio hecho dice.
 *
 * Cada hecho cae en una de cuatro casillas según dos preguntas: ¿hubo gasto?
 * (la fila) y ¿salió plata? (la columna). Dos versiones, A y B, que se
 * alternan por intento (C5): impares A, pares B.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACT_GASTO_O_PAGO = {
  id: "t3-gasto-o-pago",
  nombre: "¿Gasto o pago?",
  dificultad: "medio",
  fpBase: 25,
  /* §1: seis hechos por partida, de un banco de ocho por versión. */
  porPartida: 6,
  /* C1. */
  consigna: "Lee el hecho. Toca la casilla que dice si hubo gasto y si salió plata.",
};

/* §2, con C1 aplicado al paso 3. */
export const PASOS_GASTO_O_PAGO = [
  "Pregúntate si la empresa ya consumió algo para poder vender.",
  "Pregúntate si ese día salió plata de la caja.",
  "Toca la casilla donde caen tus dos respuestas.",
];
export const CIERRE_GASTO_O_PAGO = "Gastar es consumir; pagar es sacar plata. Unas veces pasan el mismo día y otras no.";

/* Los cuatro tipos (§3). Cada uno es una casilla: [hubo gasto, salió plata]. */
export const GS = "gasto-salida";
export const G = "gasto";
export const S = "salida";
export const NN = "ninguno";
export const TIPOS = {
  [GS]: { gasto: true, salida: true },
  [G]: { gasto: true, salida: false },
  [S]: { gasto: false, salida: true },
  [NN]: { gasto: false, salida: false },
};
export const tipoDe = (gasto, salida) => Object.keys(TIPOS).find((k) => TIPOS[k].gasto === gasto && TIPOS[k].salida === salida);

/* §6 y C2: los rótulos de la matriz. «Gastos» y «Salió» son literales ya publicados. */
export const ROTULO_GASTO = "Gastos";
export const ROTULO_SIN_GASTO = "Sin gasto";
export const ROTULO_SALIDA = "Salió";
export const ROTULO_SIN_SALIDA = "No salió";

/*
 * Las casillas en el orden en que se pintan (§6): arriba «Gastos» con «No
 * salió» y «Salió»; abajo «Sin gasto» con «No salió» y «Salió». El nombre
 * accesible de cada botón son sus dos rótulos (§8).
 */
export const CASILLAS = [
  { id: G, fila: ROTULO_GASTO, columna: ROTULO_SIN_SALIDA },
  { id: GS, fila: ROTULO_GASTO, columna: ROTULO_SALIDA },
  { id: NN, fila: ROTULO_SIN_GASTO, columna: ROTULO_SIN_SALIDA },
  { id: S, fila: ROTULO_SIN_GASTO, columna: ROTULO_SALIDA },
];
export const nombreDeCasilla = (c) => `${c.fila} y ${c.columna}`;

/* Textos fijos de interfaz (Itagaki, §2). */
export const INTERFAZ_GASTO_O_PAGO = {
  contador: (n, total) => `Hecho ${n} de ${total}`,
  siguiente: "Siguiente hecho",
  verMiResumen: "Ver mi resumen",
  /* C3: una sola leyenda a todo el ancho, encima de los contadores. */
  leyendaPunteada: "Punteado: así quedaba con tu toque",
  /* §8: lo que anuncia el aria-live. */
  anuncio: (gastos, salio) => `Gastos: ${gastos}. Salió: ${salio}.`,
};

/* Los motivos de «no hubo gasto» (porQue), que eligen la variante de ERROR_B. */
export const TIENE = "tiene";
export const DEUDA = "deuda";
export const PRESTAMO = "prestamo";

const hecho = (id, texto, tipo, monto, porQue, acierto) => ({ id, texto, tipo, monto, porQue, acierto });

/* §3 · Versión A · Peluquería Doña Inés, mayo. */
export const EMPRESA_A = "Peluquería Doña Inés";
export const BANCO_A = [
  hecho("t3gp-a1", "Escenario simulado. Le pagó a la asistente $450.000 por su trabajo de mayo.", GS, 450000, null,
    "La asistente ya trabajó y se le pagó. Hubo gasto y salió plata."),
  hecho("t3gp-a2", "Escenario simulado. Pagó $180.000 de la luz de mayo.", GS, 180000, null,
    "Ya usó la luz del mes y la pagó. Hubo gasto y salió plata el mismo día."),
  hecho("t3gp-a3", "Escenario simulado. Usó y pagó $150.000 de champú y tintes en mayo.", GS, 150000, null,
    "El champú y los tintes se usaron con los clientes. Hay gasto y hay salida."),
  hecho("t3gp-a4", "Escenario simulado. Le hicieron un arreglo en mayo. Lo paga en junio: $200.000.", G, 200000, null,
    "El arreglo ya se hizo: hay gasto. La plata sale en junio."),
  hecho("t3gp-a5", "Escenario simulado. Usó el internet de mayo. Lo paga en junio: $160.000.", G, 160000, null,
    "Ya usó el internet del mes: hay gasto. La factura se paga después."),
  hecho("t3gp-a6", "Escenario simulado. Compró y pagó un secador de $500.000.", S, 500000, TIENE,
    "Salió plata, pero el secador sigue en el salón. Todavía lo tiene."),
  hecho("t3gp-a7", "Escenario simulado. Pagó en mayo los $220.000 de la luz que usó en abril.", S, 220000, DEUDA,
    "Salió plata, pero esa luz se usó en abril. En mayo solo paga la deuda."),
  hecho("t3gp-a8", "Escenario simulado. Compró a crédito $350.000 de champú que va a vender.", NN, 350000, TIENE,
    "No salió plata y el champú sigue en el estante. Por ahora solo nació una deuda."),
];

/* §3 · Versión B · Taller La Cadena, abril. */
export const EMPRESA_B = "Taller La Cadena";
export const BANCO_B = [
  hecho("t3gp-b1", "Escenario simulado. Le pagó $600.000 al ayudante por abril.", GS, 600000, null,
    "El ayudante ya trabajó y se le pagó. Hubo gasto y salió plata."),
  hecho("t3gp-b2", "Escenario simulado. Pagó $250.000 de la luz de abril.", GS, 250000, null,
    "Ya usó la luz del mes y la pagó. Hubo gasto y salió plata el mismo día."),
  hecho("t3gp-b3", "Escenario simulado. Usó $150.000 de grasa y cinta, que pagó ese día.", GS, 150000, null,
    "La grasa y la cinta se usaron en las reparaciones. Hay gasto y hay salida."),
  hecho("t3gp-b4", "Escenario simulado. Usó un compresor en abril. Lo paga en mayo: $300.000.", G, 300000, null,
    "Ya consumió el compresor: hay gasto. La plata sale en mayo."),
  hecho("t3gp-b5", "Escenario simulado. Pagó de contado $600.000 de repuestos que va a vender.", S, 600000, TIENE,
    "Salió plata, pero los repuestos siguen en el estante. Todavía no es gasto."),
  hecho("t3gp-b6", "Escenario simulado. Pagó en abril los $190.000 del agua que usó en marzo.", S, 190000, DEUDA,
    "Salió plata, pero esa agua se usó en marzo. En abril solo paga la deuda."),
  hecho("t3gp-b7", "Escenario simulado. Le pagó al banco $500.000 de la deuda, sin intereses.", S, 500000, PRESTAMO,
    "Salió plata, pero no consumió nada. Solo bajó lo que le debe al banco."),
  hecho("t3gp-b8", "Escenario simulado. Compró a crédito $400.000 de repuestos que va a vender.", NN, 400000, TIENE,
    "No salió plata y los repuestos siguen en el estante. Solo nació una deuda."),
];

export const VERSIONES_GASTO_O_PAGO = {
  A: { version: "A", empresa: EMPRESA_A, banco: BANCO_A },
  B: { version: "B", empresa: EMPRESA_B, banco: BANCO_B },
};

/*
 * §4 · Los errores de Miyata (mandan por C4). A lo sumo uno por pregunta, y se
 * muestran en ese orden: primero el de gasto (A o B), después el de plata (C o D).
 */
export const ERRORES_GASTO_O_PAGO = {
  /* Había gasto y no lo marcó: la variante va por el tipo. */
  A: {
    [G]: "Sí hubo gasto: la empresa ya consumió algo para vender. Que la plata no haya salido no lo borra.",
    [GS]: "Sí hubo gasto: lo que pagó ya se consumió. Pagar y consumir pasaron el mismo día.",
  },
  /* Marcó gasto donde no hubo: la variante va por el porQue. */
  B: {
    [TIENE]: "Aquí no hubo gasto. Lo que compró todavía lo tiene: no lo ha consumido.",
    [DEUDA]: "Aquí no hubo gasto. Pagó una deuda: el gasto se anotó cuando se consumió.",
    [PRESTAMO]: "Aquí no hubo gasto. Devolver un préstamo no es consumir: solo baja lo que se debe.",
  },
  /* Marcó salida sin plata: la variante va por el tipo. */
  C: {
    [G]: "No ha salido plata. La empresa consumió y quedó debiendo: la caja se mueve después.",
    [NN]: "No ha salido plata: la compra fue a crédito. Por ahora solo nació una deuda.",
  },
  /* Había salida y no la marcó. */
  D: "Sí salió plata: el hecho dice que pagó.",
};

/* §5 · El tutorial. Fuera de los bancos; tipo G. */
export const EJEMPLO_GASTO_O_PAGO = {
  id: "demo-panaderia-gasto",
  empresa: "Una panadería",
  texto: "Escenario simulado. Ya usó la harina del mes. La paga el otro mes: $300.000.",
  tipo: G,
  monto: 300000,
  porQue: null,
  acierto: "La harina ya se usó: hay gasto. La plata sale el otro mes, así que hoy no hubo salida.",
};

/* Las palabras de la pastilla, las de todo Contabilidad (§2). */
export const MARCA_GASTO_O_PAGO = { bien: "Correcto", mal: "No va aquí", era: "Iba aquí" };

/* Para el lector de pantalla: qué hay en la zona de juego (descriptivo, mío). */
export const ALT_GASTO_O_PAGO = "Una ficha con un hecho y una matriz de cuatro casillas: arriba, con gasto; abajo, sin gasto; a la izquierda no salió plata y a la derecha salió. Debajo, dos contadores: Gastos y Salió.";
export const ALT_TUTORIAL_GASTO_O_PAGO = "Ejemplo: la panadería ya usó la harina y la paga el otro mes. Se toca la casilla de Gastos y No salió, y solo se mueve el contador de Gastos.";
