import { CALEJA, LAVADO_DE_AUTOS } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A5 · EL SALDO DE LA CUENTA — el contenido.
 *
 * Nueve cuentas reales de los dos casos del capítulo más la del ejemplo. Se
 * sortean seis, y de cada una se preguntan dos cosas a la vez: cuánto es el
 * saldo y de qué lado va.
 *
 * ═══════════ AQUÍ NO HAY NI UN MOVIMIENTO ESCRITO ═══════════
 *
 * Este archivo solo dice de qué mayor sacar cada cuenta. Los débitos, los
 * créditos y el saldo salen de mayorizar los asientos del caso — los mismos
 * que usan «Arma el Balance», el desafío y las demás. Transcribir aquí «5.000
 * y 800 al debe» permitiría que esta actividad y el balance enseñaran dos
 * cuentas distintas con el mismo nombre.
 *
 * ═══════════ TRES CUENTAS SE LLAMAN «CAJA» ═══════════
 *
 * La del ejemplo del capítulo, la de Caleja y la del lavado de autos, con
 * movimientos distintos las tres. En pantalla la T dice CAJA y debajo, más
 * pequeña, de qué empresa es. Sin eso serían tres preguntas escritas igual
 * con tres respuestas distintas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SUBTEMA = "Cálculo del saldo";
export const POR_PARTIDA = 6;

export const OBJETIVO = "Calcula el saldo de una cuenta y colócalo del lado correcto — el que quedó en pie.";

/* De quién es cada mayor. La del capítulo no es de ninguna empresa. */
export const EMPRESA_DEL_CASO = {
  capitulo: "Ejemplo del capítulo",
  caleja: CALEJA.empresa,
  lavado: LAVADO_DE_AUTOS.empresa,
};

/*
 * Los nueve ítems. Los ids se conservan: estas mismas cuentas ya las jugaron
 * estudiantes con esta misma pregunta, y renumerar haría que el panel docente
 * enseñara una cuenta que nadie contestó. El de Cuentas por pagar de Caleja es
 * nuevo y entra como cu5-11; los dos que salen —Letras por pagar del lavado y
 * Equipo de computación de Caleja— dejan sus números sin reutilizar.
 */
export const ITEMS = [
  { id: "cu5-10", caso: "capitulo", cuenta: "Caja" },
  { id: "cu5-07", caso: "caleja", cuenta: "Caja" },
  { id: "cu5-08", caso: "caleja", cuenta: "Aportes sociales" },
  { id: "cu5-11", caso: "caleja", cuenta: "Cuentas por pagar" },
  { id: "cu5-01", caso: "lavado", cuenta: "Bancos" },
  { id: "cu5-02", caso: "lavado", cuenta: "Caja" },
  { id: "cu5-03", caso: "lavado", cuenta: "Cuentas por pagar" },
  { id: "cu5-04", caso: "lavado", cuenta: "Hipoteca por pagar" },
  { id: "cu5-06", caso: "lavado", cuenta: "Acciones" },
];

/* Los que salen del banco pero cuyas respuestas siguen en el servidor. */
export const ITEMS_RETIRADOS = {
  "cu5-05": { caso: "lavado", cuenta: "Letras por pagar" },
  "cu5-09": { caso: "caleja", cuenta: "Equipo de computación" },
};

/*
 * ═══════════ LAS DOS DEVOLUCIONES DE ACIERTO ═══════════
 *
 * Con huecos, porque las cifras son las de ESA cuenta. Escribir nueve
 * versiones a mano invitaría a que una llevara el número de otra.
 */
/* Los de Levi. Si el saldo queda en el haber, la resta va en el orden inverso. */
export const ACIERTO_SALDO = "✅ {saldo}. Suma del debe {debito} menos suma del haber {credito}.";
export const ACIERTO_SALDO_HABER = "✅ {saldo}. Suma del haber {credito} menos suma del debe {debito}.";
export const ACIERTO_LADO = "✅ {Lado}. El saldo va del lado que sumó más.";

/*
 * El caso en que un lado está vacío (Acciones) ya no tiene acierto propio:
 * Levi pidió la misma resta para todos los ítems («… menos suma del debe $0»).
 */

/*
 * ═══════════ LOS CUATRO ERRORES ═══════════
 *
 * A  sumó los dos lados en vez de restarlos
 * B  puso el saldo del lado del movimiento menor
 * C  restó al revés, o escribió una cifra negativa
 * D  una cifra que no responde a ninguno de los tres
 *
 * Los tres primeros son de Gen y venían con esta actividad desde antes. El
 * cuarto no existe en ninguna parte.
 */
export const ERROR_A = "❌ El saldo es una resta, no una suma. Sume cada lado por separado y reste el menor del mayor.";
export const ERROR_B_CIFRA_BIEN = "❌ La cifra está bien. El lado no: el saldo va donde estuvo el movimiento mayor, que aquí fue el {movimiento}.";
export const ERROR_B = "❌ Es al revés. Si por la izquierda pasaron {debito} y por la derecha {credito}, lo que sobra queda del lado que pesó más.";
export const ERROR_C = "❌ Reste siempre el menor del mayor — el saldo nunca es negativo. Lo que indica de qué naturaleza es, es el lado donde queda, no un signo.";

/*
 * ── [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN] ──
 *
 * El caso D. La ficha describe lo que se VE —los dos totales resaltados y la
 * operación escrita debajo sin el resultado— pero no da texto, y los tres
 * textos de Gen hablan de errores concretos que aquí no ocurrieron: decirle
 * «no sume» a quien no sumó sería mentirle sobre lo que hizo.
 *
 * Lo que hay puesto no diagnostica nada, a propósito: devuelve la operación
 * que hay que hacer, que es justo lo que la escena de este caso enseña.
 */
export const ERROR_D = "❌ Esa cifra no sale de estos movimientos. Mire los dos totales y haga la resta: el saldo es lo que queda del lado que pesó más.";

/*
 * NOTA PARA GEN — el tratamiento cambia de una devolución a otra: los tres
 * textos anteriores tratan de usted («Sume», «Reste») y los de la ficha nueva
 * tratan de tú («Mira», «fíjate»). En las otras seis actividades del tema el
 * tuteo es el único que aparece. No lo cambio por cuenta propia porque el
 * texto académico es de Gen, pero queda dicho: el estudiante ve los dos.
 */

/* Rótulos de la interfaz. */
export const PREGUNTA_CIFRA = "¿CUÁNTO ES EL SALDO?";
export const PREGUNTA_LADO = "¿DE QUÉ LADO VA?";
