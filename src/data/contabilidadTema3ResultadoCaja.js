/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 3 · «DEL RESULTADO A LA CAJA» (t3-del-resultado-a-la-caja) — el
 * contenido.
 *
 * Paquete orquestador/conocimiento/paquetes/e3-t3-del-resultado-a-la-caja-v4.md,
 * con el PASA de diseño de Takamura. Mandan, en este orden: sus condiciones
 * A1 a A8 (§0), los textos de Miyata (§2 a §6) y la forma de Itagaki (§7 a
 * §10). Todo el texto va literal; lo único mío son los `monto` y `utilidad`
 * numéricos, que son las cifras que el propio paquete escribe, y los ids.
 *
 * Se parte de la utilidad del mes y cada ficha va a «Suma», «Resta» o «No
 * mueve la caja». Al comprobar, el puente lleva de la utilidad a la caja al
 * cierre. Dos versiones, A y B, que se alternan por intento (A1): impares A,
 * pares B. Cada partida juega un solo caso.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const ACT_RESULTADO_CAJA = {
  id: "t3-del-resultado-a-la-caja",
  nombre: "Del resultado a la caja",
  dificultad: "dificil",
  fpBase: 50,
  /* §3. */
  consigna: "Parte de la utilidad del mes. Pon cada ficha donde va y halla la caja al cierre.",
};

/* §3: los pasos de «Así se juega». */
export const PASOS_RESULTADO_CAJA = [
  "Mira la utilidad del mes. La caja empezó en cero.",
  "Por cada ficha, pregúntate si hace que la caja tenga más o menos plata que la utilidad.",
  "Ponla en Suma, en Resta o en No mueve la caja.",
];
export const CIERRE_RESULTADO_CAJA = "La utilidad mide lo que se ganó. La caja mide la plata. Las fichas explican la distancia entre las dos.";

/* Las tres elecciones de cada ficha (§2), en el orden de los botones. */
export const SUMA = "suma";
export const RESTA = "resta";
export const NO_MUEVE = "no";
export const ELECCIONES = [
  { id: SUMA, rotulo: "Suma", signo: 1 },
  { id: RESTA, rotulo: "Resta", signo: -1 },
  { id: NO_MUEVE, rotulo: "No mueve la caja", signo: 0 },
];
export const rotuloDe = (id) => ELECCIONES.find((e) => e.id === id)?.rotulo ?? "";
export const signoDe = (id) => ELECCIONES.find((e) => e.id === id)?.signo ?? 0;

/* §3 y §0 (A4, A6, A8): los textos comunes. */
export const VARIOS_ERRORES = "Y hay más fichas por revisar.";
export const ROTULO_CAJA_CIERRE = "Caja al cierre";
export const LEYENDA_PUNTEADO = "Punteado: así quedaba con tus respuestas";
/* Kamogawa, #557: en caja negativa no hay punteado; la frase va pegada a la cifra. */
export const LEYENDA_NEGATIVA = "Con tus respuestas, la caja daba";
/* Kamogawa, #557: la ficha que no mueve la caja, si el estudiante la sumó o la restó. */
export const TU_RESPUESTA = "(tu respuesta)";
/*
 * A6 (Kamogawa, #557): el número de fichas mal puestas va en palabras. En A
 * la caja solo cuadra con dos mal; en B, con tres o con cuatro (son las únicas
 * combinaciones; lo comprueba la prueba recorriendo las 3^6).
 */
const EN_PALABRAS = { 2: "dos", 3: "tres", 4: "cuatro", 5: "cinco", 6: "seis" };
export const errorCuadraConErrores = (n) =>
  `Llegaste a la caja correcta, pero con ${EN_PALABRAS[n] ?? String(n)} fichas mal puestas: sus errores se cancelaron.`;
export const ERROR_CUADRA_CON_ERRORES = errorCuadraConErrores(2);

/* Textos fijos de interfaz (Itagaki, §7 y §8; A1). */
export const INTERFAZ_RESULTADO_CAJA = {
  paso: (n, total) => `Paso ${n} de ${total}`,
  comprobar: "Comprobar",
  verMiResumen: "Ver mi resumen",
  correcto: "Correcto",
  /* §7: el nombre accesible del renglón decidido. */
  cambiar: (cuenta, elegido) => `Cambiar ${cuenta}: ${elegido}`,
  /* §10: el nombre del puente. */
  puente: (utilidad, caja, x) => `De ${utilidad} a la caja ${caja}; con tus respuestas daba ${x}`,
};

const ficha = (id, nombre, monto, va, error) => ({ id, nombre, monto, va, error });

/* §4 · Versión A · San Calixto, enero (cifras de P5). */
export const CASO_A = {
  version: "A",
  empresa: "San Calixto",
  texto: "San Calixto abrió el 2 de enero. Este es su primer mes.",
  rotuloUtilidad: "Utilidad antes del impuesto",
  utilidad: 3950,
  caja: 14650,
  pie: "Basado en el libro, pp. 121-128 y 140",
  fichas: [
    ficha("t3rc-a1", "Aporte en plata", 15000, SUMA,
      "Los socios metieron plata a la caja, y un aporte no es ingreso. Por eso la caja tiene más que la utilidad."),
    ficha("t3rc-a2", "Equipo aportado", 5000, NO_MUEVE,
      "El equipo entró a la empresa, pero no es plata. La caja no lo ve."),
    ficha("t3rc-a3", "Cuentas por cobrar – clientes", 6800, RESTA,
      "Esas facturas ya cuentan en la utilidad, pero la plata no ha llegado. La caja tiene menos por eso."),
    ficha("t3rc-a4", "Alquiler por pagar", 2500, SUMA,
      "Ese gasto ya bajó la utilidad, pero la plata no ha salido. La caja tiene más por eso."),
  ],
  acierto: "Los $3.950 de utilidad, más el aporte y lo que se debe, menos lo que falta cobrar, dan los $14.650 de la caja.",
};

/*
 * §5 · Versión B · Estudio Foco, marzo. Escenario simulado.
 * Los datos de control (ingresos, cobros, gastos, impuesto) NO van en
 * pantalla (A5): las fichas bastan para resolver. Quedan en la prueba.
 */
export const CASO_B = {
  version: "B",
  empresa: "Estudio Foco",
  texto: "Escenario simulado. Estudio Foco abrió en marzo. Este es su primer mes.",
  rotuloUtilidad: "Utilidad del ejercicio",
  utilidad: 1541000,
  caja: 6800000,
  pie: null,
  fichas: [
    ficha("t3rc-b1", "Aporte en plata", 5000000, SUMA,
      "Los socios metieron plata a la caja este mes, y un aporte no es ingreso. La caja tiene más por eso."),
    ficha("t3rc-b2", "Préstamo recibido", 2000000, SUMA,
      "El banco metió plata a la caja, y un préstamo no es ingreso. La caja tiene más por eso."),
    ficha("t3rc-b3", "Arriendo abril–junio, por anticipado", 600000, RESTA,
      "Salió plata por un arriendo que aún no se usa. No bajó la utilidad, pero sí la caja."),
    ficha("t3rc-b4", "Cuentas por cobrar – clientes", 1900000, RESTA,
      "Esas facturas ya cuentan en la utilidad, pero la plata no ha llegado. La caja tiene menos por eso."),
    ficha("t3rc-b5", "Impuesto de renta por pagar", 759000, SUMA,
      "Ese impuesto ya bajó la utilidad, pero todavía no se paga. La caja tiene más por eso."),
    ficha("t3rc-b6", "Equipo comprado a crédito", 1500000, NO_MUEVE,
      "Ese equipo no movió la caja ni la utilidad: todavía no se paga y no es gasto."),
  ],
  acierto: "Escenario simulado. Los $1.541.000 de utilidad, más el impuesto que se debe, el aporte y el préstamo, menos el anticipo y lo que falta cobrar, dan los $6.800.000 de la caja.",
};

/* §5, A5: los datos de control de B. Solo para la prueba; nunca se pintan. */
export const CONTROL_B = { ingresos: 6400000, cobrado: 4500000, gastos: 4100000, antesDeImpuesto: 2300000, impuesto: 759000 };

export const CASOS_RESULTADO_CAJA = { A: CASO_A, B: CASO_B };

/*
 * §6 · El tutorial EJEMPLO_RESULTADO_CAJA (no se califica). Una sola ficha;
 * su «error» es la resolución, que la demo muestra al poner la ficha.
 */
export const EJEMPLO_RESULTADO_CAJA = {
  version: "demo",
  /* §6: «Una panadería, escenario simulado.»; el hecho, literal. */
  empresa: "Una panadería, escenario simulado",
  texto: "Ganó $300.000 este mes. Aún le deben $100.000.",
  rotuloUtilidad: "Utilidad del mes",
  utilidad: 300000,
  caja: 200000,
  pie: null,
  fichas: [ficha("demo-panaderia-caja", "Cuentas por cobrar – clientes", 100000, RESTA, null)],
  acierto: "La utilidad fue $300.000, pero $100.000 no han llegado. La caja subió solo $200.000.",
};

/* Para el lector de pantalla: qué hay en la zona de juego (descriptivo, mío). */
export const ALT_RESULTADO_CAJA = "Arriba, la empresa y su utilidad del mes. Debajo, una ficha por paso con tres botones: Suma, Resta y No mueve la caja. Las fichas ya puestas quedan en una lista, y se pueden cambiar antes de comprobar.";
export const ALT_TUTORIAL_RESULTADO_CAJA = "Ejemplo: la panadería ganó $300.000 y aún le deben $100.000. La ficha de cuentas por cobrar va en Resta: la caja subió solo $200.000.";
