/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A7 · EL ASIENTO COMPUESTO — el contenido.
 *
 * Cinco asientos que afectan a más de dos cuentas. Se sortean tres.
 *
 * ═══════════ AQUÍ NO ESTÁ ESCRITO NINGÚN ASIENTO ═══════════
 *
 * Como en A6: este archivo dice de qué transacción sale cada ítem, y las
 * cuentas, los lados y las cifras salen del asiento que esa transacción ya
 * tiene en el capítulo.
 *
 * ═══════════ EL SORTEO NO PUEDE SER LIBRE ═══════════
 *
 * Dos de los cinco —el edificio con su terreno y el socio que aporta un carro
 * y efectivo— son los únicos donde entran DOS COSAS DISTINTAS POR EL MISMO
 * LADO. Son los únicos, por tanto, donde el estudiante puede cometer la
 * segunda confusión del objetivo: fundir dos activos en una sola cuenta. Un
 * sorteo libre de tres sobre cinco puede dejar fuera los dos, y entonces esa
 * confusión no es producible en ese intento. Va estratificado.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const SUBTEMA = "Asiento compuesto";
export const POR_PARTIDA = 3;

export const OBJETIVO = "Arma asientos que afectan más de dos cuentas — y comprueba que lo que cuadra son los totales, no las parejas.";

/*
 * Los cinco. `conDosPorLado` marca los que hacen producible la confusión de
 * fundir dos cuentas, y es lo que el sorteo estratificado usa para garantizar
 * que al menos uno entre. No se declara a ojo: hay una prueba que lo compara
 * contra los asientos de verdad.
 */
export const ITEMS = [
  { id: "cu10-01", caso: "lavado", transaccion: "ene-03", conDosPorLado: true },
  { id: "cu10-02", caso: "lavado", transaccion: "ene-04", conDosPorLado: false },
  { id: "cu10-03", caso: "lavado", transaccion: "ene-12", conDosPorLado: false },
  { id: "cu10-04", suelta: "cu10-computador-mitad", conDosPorLado: false },
  { id: "cu10-05", suelta: "cu10-socio-vehiculo", conDosPorLado: true },
];

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS ANCLAJES
 *
 * ── [LA SELECCIÓN ES DE CLAUDE — PENDIENTE DE REVISIÓN DE PEDAGOGÍA] ──
 *
 * La ficha pide los anclajes para esta actividad —«suben los anclajes de cada
 * T al enunciado; las que no participan quedan sueltas»— y describe con qué
 * los ve el estudiante, pero no da la tabla, como sí la da para la Actividad
 * 6. Lo que va aquí son TROZOS LITERALES del enunciado: no hay ni una palabra
 * escrita por mí, solo el recorte. Pero qué trozo muestra el movimiento de
 * cada cuenta es una decisión de contenido, y esa es de Gen.
 *
 * Sin anclajes, la señal del error más importante de esta actividad —una T con
 * DOS líneas, que es lo que significa haber fundido dos cuentas— no existiría.
 * Por eso van puestos y marcados, en vez de quedarse sin poner.
 *
 * Hay una prueba que exige que cada trozo esté literalmente en su enunciado y
 * que dos trozos del mismo ítem no se pisen.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ANCLAJES = {
  "ene-03": {
    "Construcciones y edificaciones": "un edificio",
    "Terrenos": "El valor del terreno se estimó en $4.000",
    "Bancos": "se canceló $2.000 de contado, con cheque",
    "Hipoteca por pagar": "el resto con una hipoteca a cinco años",
  },
  "ene-04": {
    "Flota y equipo de transporte": "Se compró un camión de reparto por valor de $4.800",
    "Bancos": "$800 de contado, pagado con cheque",
    "Letras por pagar": "por el saldo se firmaron letras",
  },
  "ene-12": {
    "Muebles y enseres": "Se compraron muebles y enseres por valor de $2.500",
    "Bancos": "Se canceló de contado, con cheque, la suma de $500",
    "Cuentas por pagar": "el saldo a crédito a 90 días",
  },
  "cu10-computador-mitad": {
    "Equipo de computación": "compran un computador por $1.500.000",
    "Caja": "pagan el 50% de contado",
    "Cuentas por pagar": "el saldo a crédito",
  },
  "cu10-socio-vehiculo": {
    "Flota y equipo de transporte": "un vehículo valorado en $2.000.000",
    "Caja": "$1.000.000 en efectivo",
    "Aportes sociales": "Aceptan en el negocio a un nuevo socio",
  },
};

/*
 * ═══════════ LAS DEVOLUCIONES DE ACIERTO ═══════════
 *
 * Textuales de la ficha para los ítems 1, 2 y 5. Los otros dos no traen texto
 * propio y usan el general, que también es de Gen y venía con la actividad.
 */
export const ACIERTO_POR_ITEM = {
  "cu10-01": "✅ Cuatro cuentas, y lo que cuadra son los totales: 10.000 al debe contra 10.000 al haber. El edificio y el terreno son dos activos distintos — el enunciado te da el valor del terreno a propósito para que los separes. Y fíjate en los colectores: ninguna cuenta del debe coincide con ninguna del haber. No hay parejas.",
  "cu10-02": "✅ Tres cuentas. Un activo entra y dos cosas lo pagan: parte en cheque, parte en letras. Por eso hacía falta una cuenta más de la que parecía.",
  "cu10-05": "✅ Tres cuentas. El socio aportó dos cosas —un vehículo y efectivo— y las dos entran por el debe, contra un solo aporte de patrimonio.",
};

export const ACIERTO_GENERAL = "✅ Correcto. El debe suma {total} y el haber {total} — cuadra. Note que {cuentas} cuentas no rompen la partida doble: lo que cuadra son los totales.";

/*
 * ═══════════ LAS CUATRO CONFUSIONES ═══════════
 *
 * Textuales de la ficha. La prioridad cuando se cumple más de una está en la
 * lógica: C > B > A > D.
 */
export const ERROR_C_POR_ITEM = {
  "cu10-01": "❌ Esa cuenta tiene dos líneas hacia el enunciado: está reclamando dos cosas a la vez. El edificio y el terreno son dos cuentas distintas, y el enunciado te da el valor del terreno aparte justamente por eso — si fueran una sola, ese dato sobraría.",
  "cu10-05": "❌ Esa cuenta vale 3.000.000, que es exactamente el vehículo más el efectivo. Pero son dos activos distintos los que entran: un carro y dinero. El aporte del socio sí es uno solo —3.000.000 de patrimonio— pero llega en dos formas, y cada forma va a su propia cuenta.",
};

export const ERROR_B = "❌ {cuenta} no aparece en esta transacción: es la única sin línea hacia el enunciado.";

export const ERROR_A = "❌ El conector no cierra, y mira la diferencia al pie: es justo lo que falta por registrar. Fíjate en cómo se pagó — cuando una compra se paga de dos formas distintas, cada forma necesita su propia cuenta.";

export const ERROR_D = "❌ Debe {debe}, haber {haber}. Las cuentas son las correctas; lo que falla es la aritmética. En un asiento compuesto lo que tiene que cuadrar son los totales, no el número de cuentas de cada lado.";

/* Rótulos de la interfaz. */
export const ROTULO_TRANSACCION = "LA TRANSACCIÓN";
export const ROTULO_ESTANTE = "EL ESTANTE DE CUENTAS";
export const COLECTOR = { debe: "TOTAL DEBE", haber: "TOTAL HABER" };
export const TEXTO_CONFIRMAR = "Confirmar asiento";
/* La línea fija junto al botón de confirmar, en la actividad real (Levi). */
export const AVISO_UN_INTENTO = "Solo tienes un intento: revisa que los totales den igual antes de confirmar.";
export const TEXTO_DIFERENCIA = "Diferencia";
