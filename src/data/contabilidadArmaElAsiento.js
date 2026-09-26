/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A6 · ARMA EL ASIENTO — el contenido.
 *
 * Once transacciones del capítulo, seis por partida. De cada una se arma el
 * asiento completo: las dos cuentas, los dos lados y el valor.
 *
 * ═══════════ AQUÍ NO ESTÁ ESCRITO NINGÚN ASIENTO ═══════════
 *
 * Este archivo solo dice de qué transacción sale cada ítem. Las cuentas, los
 * lados y las cifras salen del asiento que ya tiene esa transacción en el
 * capítulo — el mismo que usan el mayor, el balance y el desafío.
 *
 * ═══════════ SALE EL ÍTEM DE LOS $1.000 ═══════════
 *
 * «Se inicia un negocio con dos socios y cada uno aporta $1.000» llevaba un
 * asiento de $2.000: el enunciado dice mil y el asiento dos mil, y aunque la
 * suma sea correcta —dos socios— la cifra que el estudiante lee no es la que
 * tiene que escribir. Queda fuera del banco. Los demás ids no se tocan.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SUBTEMA = "Asiento contable simple";
export const POR_PARTIDA = 6;

/* Cuatro decisiones por ítem: dos cuentas y el lado de cada una. */
export const DECISIONES_POR_ITEM = 4;

export const OBJETIVO = "Arma el asiento completo de una transacción: las dos cuentas, los dos lados y el valor.";

/*
 * Los once ítems. `suelta`, `caso` y `transaccion` dicen DÓNDE está escrita la
 * transacción; nada más.
 */
export const ITEMS = [
  { id: "cu6-02", suelta: "cu6-pagare" },
  { id: "cu6-03", suelta: "cu6-computador-contado" },
  { id: "cu6-04", caso: "caleja", transaccion: "cal-1" },
  { id: "cu6-05", caso: "caleja", transaccion: "cal-2" },
  { id: "cu6-06", caso: "caleja", transaccion: "cal-3" },
  { id: "cu6-07", caso: "caleja", transaccion: "cal-4" },
  { id: "cu6-08", caso: "caleja", transaccion: "cal-5" },
  { id: "cu6-09", caso: "caleja", transaccion: "cal-6" },
  { id: "cu6-10", caso: "lavado", transaccion: "ene-08" },
  { id: "cu6-11", caso: "lavado", transaccion: "ene-18" },
  { id: "cu6-12", caso: "lavado", transaccion: "ene-26" },
];

/* El que sale, que el panel docente todavía tiene que saber leer. */
export const ITEM_RETIRADO = { "cu6-01": "cu6-dos-socios" };

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS ANCLAJES
 *
 * Cada cuenta que SE MUEVE tiene una línea hacia las palabras del enunciado
 * que muestran su movimiento. Y la palabra clave es esa: el MOVIMIENTO, no el
 * objeto nombrado.
 *
 * ═══════════ LOS DOS CASOS QUE LO DEMUESTRAN ═══════════
 *
 * En «Cancelan $10.000 de la deuda por la compra del computador» la palabra
 * «computador» está escrita, y Equipo de computación NO se mueve: el
 * computador se compró antes, aquí solo se paga lo que se debía por él. Lo
 * mismo en «la deuda de la computadora». Que una cuenta aparezca nombrada en
 * el enunciado no basta — por eso la señal es la línea, y su AUSENCIA dice
 * tanto como su presencia.
 *
 * ═══════════ LOS TROZOS SON DEL ENUNCIADO QUE HAY EN EL REPO ═══════════
 *
 * La ficha escribe seis de estos anclajes con una variante un poco más larga
 * del enunciado —«una sociedad limitada», «por valor de $25.000», «en el
 * 50%»— que no es la que llevan las transacciones del capítulo en este repo,
 * y esas transacciones las comparten el mayor, el balance y el desafío: no se
 * reescriben por una actividad. Lo que va anotado aquí es el MISMO trozo, con
 * las palabras que el enunciado sí tiene. Hay una prueba que exige que cada
 * uno exista literalmente en su texto, así que ninguno puede quedarse colgado.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ANCLAJES = {
  "cu6-pagare": {
    "Caja": "recibe un préstamo de un banco por $500",
    "Documentos por pagar": "respaldado con pagaré",
  },
  "cu6-computador-contado": {
    "Equipo de computación": "compró un computador por $150",
    "Caja": "lo pagó de contado",
  },
  "cal-1": {
    "Caja": "cada uno aporta $100.000",
    "Aportes sociales": "Se constituye una sociedad con tres socios",
  },
  "cal-2": {
    "Equipo de computación": "un computador por $25.000",
    "Cuentas por pagar": "a crédito",
  },
  "cal-3": {
    "Maquinaria": "compra maquinaria por $50.000",
    "Obligaciones financieras": "con un préstamo bancario",
  },
  "cal-4": {
    /* Ojo: «computador» está en el texto y Equipo de computación NO ancla. */
    "Cuentas por pagar": "de la deuda por la compra del computador",
    "Caja": "Cancelan $10.000",
  },
  "cal-5": {
    "Local comercial": "aporta un local comercial por $100.000",
    "Aportes sociales": "Ingresa un nuevo socio",
  },
  "cal-6": {
    "Aportes sociales": "disminuye su aporte",
    "Caja": "le devuelven $50.000 en efectivo",
  },
  "ene-08": {
    "Equipo de computación": "Se compró una computadora por valor de $2.000",
    "Cuentas por pagar": "todo a crédito",
  },
  "ene-18": {
    /* Y aquí igual: «computadora» está escrita y esa cuenta no se mueve. */
    "Cuentas por pagar": "la deuda de la computadora",
    "Bancos": "con cheque",
  },
  "ene-26": {
    "Bancos": "en la cuenta corriente la suma de $800",
    /* Consignar describe el movimiento sin nombrar la caja directamente. */
    "Caja": "Se consignó",
  },
};

/*
 * ═══════════ LAS CUATRO PALABRAS QUE DECIDEN ENTRE CAJA Y BANCOS ═══════════
 *
 * El capítulo lleva las dos cuentas por separado, y el enunciado dice cuál es
 * — cuando lo dice. Estas cuatro son las únicas señales.
 */
export const PALABRAS_DE_CAJA = ["de contado", "en efectivo"];
export const PALABRAS_DE_BANCOS = ["con cheque", "se consignó"];

/*
 * ═══════════ LAS TRES CONFUSIONES ═══════════
 *
 * Textuales de la ficha. El orden en que se atienden cuando se cumple más de
 * una lo pone la mecánica, no este archivo.
 */
export const ERROR_LADOS_INVERTIDOS = "❌ El asiento cuadra —mismo valor a cada lado— pero las dos cuentas se movieron al revés. Mira el ▲ de cada una: los dos están del lado contrario al que pusiste la ficha. El ▲ marca por dónde crece esa cuenta; si la transacción la hace crecer, la ficha va ahí; si la hace decrecer, va enfrente.";

export const ERROR_CUENTA_AJENA = "❌ {cuenta} no se mueve en esta transacción: por eso no tiene línea hacia el enunciado. Que aparezca nombrada ahí no basta — lo que importa es si algo entra o sale de ella. Vuelve a las dos preguntas del libro: ¿qué está recibiendo el negocio, y qué entregó o en qué se comprometió a cambio?";

/* Se añade al anterior cuando la cuenta suelta es el computador ya comprado. */
export const COLETILLA_COMPUTADOR = "La computadora se compró antes; aquí solo se está pagando lo que se debía por ella.";

/* Y esta, cuando la cuenta suelta es una de las dos que el capítulo separa. */
export const COLETILLA_CAJA_BANCOS = "Y ojo con estas dos: si la transacción dice «con cheque» o «se consignó», es Bancos. Si dice «de contado» o «en efectivo», es Caja. El capítulo las lleva por separado.";

export const ERROR_MISMO_LADO = "❌ Las dos fichas quedaron del mismo lado. Un asiento no puede anotar dos veces en el debe y nada en el haber: la partida doble pide exactamente una vez en el debe de una cuenta y otra vez en el haber de otra.";

/*
 * ── [ESCRITO POR CLAUDE, NO POR LA FICHA — PENDIENTE DE REVISIÓN] ──
 *
 * La ficha no trae texto de acierto para esta actividad. El asiento correcto
 * se enseña con las tres señales —el arco cerrado, los ▲ y las dos líneas al
 * enunciado—, que son datos y no una frase inventada; esto solo lo nombra.
 */
export const ACIERTO = "✅ Asiento correcto: las dos cuentas se mueven, cada una del lado que le toca, y los totales coinciden.";

/* Rótulos de la interfaz. */
export const ROTULO_TRANSACCION = "LA TRANSACCIÓN";
export const ROTULO_BANCO = "LAS CUENTAS";
export const ROTULO_FICHAS = "AHORA PON CADA VALOR EN SU LADO";
export const TEXTO_CONFIRMAR = "Confirmar asiento";
