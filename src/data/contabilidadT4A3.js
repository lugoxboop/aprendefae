/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A3 DE APRENDER — «El arqueo» (Célula D). REDISEÑO DE ENGANCHE.
 *
 * Diseño: Hanayama, «el sobre con la regla del fondo» (celula-d/hanayama-a3-
 * rediseno.md), aprobado por Yujiro en su corte de calidad del 15 oct 2026:
 * A3 usa la regla de H4 (src/components/t4/Regla.jsx), con el mismo
 * significado. Textos: Katsumi (celula-d/katsumi-texto-a2-a5.md), aprobados
 * tal cual. Copia en el canon: orquestador/conocimiento/paquetes/
 * d4-t4-a3-v4-rediseno.md. Una prueba compara cada texto de aquí contra ella.
 *
 * Diez pantallas (la pila tenía once); en ocho el estudiante mueve la figura:
 * cuenta la caja, mueve la plata de la caja, decide qué muestra el arqueo, el
 * cheque del sobrante, su cuenta, el cheque del faltante, su cuenta y cambia
 * de camino.
 *
 * Cifras (pp. 182-186). El fondo y lo gastado son de A2. Los dos efectivos
 * contados son del libro. Todo lo demás SE CALCULA:
 *   · sobrante de caja menor: 478.100 + 24.000 = 502.100; 502.100 − 500.000
 *     = 2.100; el cheque, 478.100 − 2.100 = 476.000
 *   · faltante de caja menor: 478.100 + 15.200 = 493.300; 500.000 − 493.300
 *     = 6.700; el cheque, 478.100 + 6.700 = 484.800
 *   · distractores CONSTRUIDOS: 480.200 (suma la diferencia en vez de
 *     restarla) y 471.400 (la resta en vez de sumarla)
 *   · el control de P1, de 14.900 a 28.900 de a 100: SUPUESTO de Hanayama
 *     (21.900 ± 7.000), para que la aguja no salga de la regla
 * Erratas: D4-2 (31 de mayo), D4-3 («operacionales»), D4-8 (Cuentas por
 * cobrar – empleados al debe).
 *
 * Aprender: sin FP, sin catálogo y sin llamar al motor.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { BOTON, DEBE, HABER } from "./contabilidadT4.js";
import { FONDO, GASTADO, QUEDA } from "./contabilidadT4A2.js";

export const A3_ID = "t4-a3-el-arqueo";

/* ═══════════ LAS CIFRAS ═══════════ */

/* Los dos efectivos contados: datos de la p. 185. */
export const EFECTIVO_SOBRANTE = 24_000;
export const EFECTIVO_FALTANTE = 15_200;

/* Se calculan, no se transcriben. */
export const SUMA_SOBRANTE = GASTADO + EFECTIVO_SOBRANTE;
export const SOBRANTE = SUMA_SOBRANTE - FONDO;
export const CHEQUE_SOBRANTE = GASTADO - SOBRANTE;
export const SUMA_FALTANTE = GASTADO + EFECTIVO_FALTANTE;
export const FALTANTE = FONDO - SUMA_FALTANTE;
export const CHEQUE_FALTANTE = GASTADO + FALTANTE;
/* Los distractores, construidos (Hanayama): uno suma la diferencia, el otro la resta. */
export const CHEQUE_CON_DIFERENCIA = GASTADO + SOBRANTE;
export const CHEQUE_SIN_FALTANTE = GASTADO - FALTANTE;

/* P1 · SUPUESTO: el control de la plata en la caja. */
export const CONTROL_A3 = { min: QUEDA - 7_000, max: QUEDA + 7_000, paso: 100, inicio: QUEDA };

/* Las opciones de las tres preguntas de cifra o de zona, en el orden de Hanayama. */
export const ZONAS_A3 = ["falta", "cuadra", "sobra"];
export const OPCIONES_CHEQUE_SOBRANTE = [GASTADO, CHEQUE_SOBRANTE, CHEQUE_CON_DIFERENCIA];
export const OPCIONES_CHEQUE_FALTANTE = [GASTADO, CHEQUE_SIN_FALTANTE, CHEQUE_FALTANTE];

/* ═══════════ LAS CUENTAS DEL ASIENTO ═══════════ */

/* Completas, en renglones fijos (C5, D4-3): a 320 no caben en uno. */
export const GASTOS_GENERALES = "gastos-generales";
export const BANCOS = "bancos";
export const INGRESOS_SOBRANTE = "ino-sobrante";
export const CXC_EMPLEADOS = "cxc-empleados";
export const GASTOS_FALTANTE = "gno-faltante";
export const CUENTAS_A3 = {
  [GASTOS_GENERALES]: { id: GASTOS_GENERALES, renglones: ["Gastos", "generales"] },
  [BANCOS]: { id: BANCOS, renglones: ["Bancos"] },
  [INGRESOS_SOBRANTE]: { id: INGRESOS_SOBRANTE, renglones: ["Ingresos no", "operacionales", "– sobrante de", "caja menor"] },
  [CXC_EMPLEADOS]: { id: CXC_EMPLEADOS, renglones: ["Cuentas por", "cobrar", "– empleados"] },
  [GASTOS_FALTANTE]: { id: GASTOS_FALTANTE, renglones: ["Gastos no", "operacionales", "– faltante de", "caja menor"] },
};

/* ═══════════ LA FIGURA ═══════════ */

/*
 * Rótulos (Hanayama y Katsumi). La regla conserva los suyos («fondo»,
 * «suman», «falta», «sobra», «cada marca: 2.000»), los de H4. «Sobrante» y
 * «faltante» nunca a secas (C5): «sobra» y «falta» solo como verbos.
 */
export const FIGURA_A3 = {
  sobre: "LO QUE TIENE ROSA",
  soportes: "Soportes de gastos",
  caja: "En la caja",
  sinContar: "sin contar",
  contar: "Contar la caja",
  control: "Plata en la caja",
  zona: { cuadra: "Cuadra", sobra: "Sobrante de caja menor", falta: "Faltante de caja menor" },
  chips: { falta: "Falta", cuadra: "Cuadra", sobra: "Sobra" },
  aguja: "caja + tu cheque",
  asiento: "EL ASIENTO DEL REEMBOLSO",
  caminos: { cobra: "Cobrarle a Rosa", asume: "La empresa asume" },
  /* Para el lector de pantalla: el nombre del tablero (el del prototipo) y de los grupos de opciones (las preguntas de Katsumi). */
  tablero: "El asiento del reembolso",
  opcionesZona: "¿Qué muestra el arqueo?",
  opcionesCheque: "¿Por cuánto sale el reembolso?",
};

/* ═══════════ LAS PANTALLAS ═══════════ */

/*
 * `modo`: contar (P0), mover (P1), zona (P2), cheque (P3 y P5: `caja`,
 * `opciones` y `correcta`), ficha (P4 y P7: una ficha a una cuenta y un lado;
 * `cuentas`, `monto`, `va`, `base`), tramo (P6), caminos (P8) y quieta (P9).
 * `pregunta`: «Seguir» no aparece hasta el acierto (regla D7). En la ficha, el
 * error sale de la cuenta elegida y, si la cuenta es la buena, de `lado`.
 */
export const PANTALLAS_A3 = [
  {
    id: "contar", modo: "contar",
    antes: ["En un arqueo, los soportes más lo que hay en la caja tienen que dar el fondo."],
    alt: "El sobre con 478.100 en soportes y la caja sin contar. Al contar, hay 21.900, y la aguja de la suma cae justo en la marca del fondo.",
    pie: "Basado en el libro, pp. 182 y 184",
  },
  {
    id: "cuando-no-cuadra", modo: "mover",
    antes: ["Mueve la plata de la caja. Si la suma pasa del fondo, sobra; si no llega, falta."],
    alt: "Un control cambia la plata de la caja. La aguja de la suma se mueve, y debajo se lee si cuadra o si hay un sobrante o un faltante de caja menor, y de cuánto.",
    pie: "Basado en el libro, pp. 183-185",
  },
  {
    id: "el-sobrante", modo: "zona", pregunta: true, caja: EFECTIVO_SOBRANTE, correcta: "sobra",
    antes: ["En la caja hay $24.000. ¿Qué muestra el arqueo?"],
    acierto: "Se pasa por $2.100: un sobrante de caja menor.",
    errores: {
      falta: "Haz la suma: ¿pasa del fondo o se queda corta?",
      cuadra: "Para cuadrar, tendría que dar justo $500.000. Suma los dos.",
    },
    alt: "El sobre con 478.100 en soportes y 24.000 en la caja. Con el acierto, aparece en la regla la aguja de la suma.",
    pie: "Basado en el libro, p. 185",
  },
  {
    id: "el-cheque", modo: "cheque", pregunta: true, caja: EFECTIVO_SOBRANTE, opciones: OPCIONES_CHEQUE_SOBRANTE, correcta: CHEQUE_SOBRANTE,
    antes: ["¿Por cuánto sale el reembolso?"],
    acierto: "Los $2.100 de más ya están en la caja.",
    errores: {
      [GASTADO]: "Así sería si cuadrara. Aquí sobra plata en la caja.",
      [CHEQUE_CON_DIFERENCIA]: "Eso le suma la diferencia: el fondo quedaría pasado.",
    },
    alt: "La aguja de caja más cheque cae donde dice el cheque que eliges. Solo el cheque correcto la deja en la marca del fondo.",
    pie: "Basado en el libro, p. 185",
  },
  {
    id: "el-asiento", modo: "ficha", pregunta: true,
    cuentas: [GASTOS_GENERALES, BANCOS, INGRESOS_SOBRANTE], monto: SOBRANTE,
    va: { id: INGRESOS_SOBRANTE, lado: HABER },
    base: { [GASTOS_GENERALES]: { [DEBE]: GASTADO }, [BANCOS]: { [HABER]: CHEQUE_SOBRANTE } },
    antes: ["¿A qué cuenta y a qué lado van los $2.100?"],
    acierto: "Es un ingreso que no viene del negocio: es no operacional.",
    errores: {
      [GASTOS_GENERALES]: "Gastos generales ya tiene los $478.100 completos.",
      [BANCOS]: "Bancos ya tiene el cheque entero: $476.000.",
      lado: "Un ingreso no sube por ese lado.",
    },
    alt: "El asiento del reembolso, con Gastos generales al debe y Bancos al haber. Los 2.100 se ponen en una cuenta y un lado.",
    pie: "Basado en el libro, pp. 183 y 185",
  },
  {
    id: "el-faltante", modo: "cheque", pregunta: true, caja: EFECTIVO_FALTANTE, opciones: OPCIONES_CHEQUE_FALTANTE, correcta: CHEQUE_FALTANTE,
    antes: ["Con $15.200 en caja, ¿por cuánto sale?"],
    acierto: "Repone lo gastado y los $6.700 que faltan.",
    errores: {
      [GASTADO]: "Con eso, el fondo se queda corto.",
      [CHEQUE_SIN_FALTANTE]: "Restaste lo que falta; el cheque lo repone.",
    },
    alt: "Con 15.200 en la caja, la suma queda a la izquierda del fondo. Solo el cheque correcto deja la aguja de caja más cheque en la marca.",
    pie: "Basado en el libro, pp. 185-186",
  },
  {
    id: "dos-caminos", modo: "tramo",
    antes: ["Faltan $6.700. Si el faltante de caja menor es representativo, lo usual es cobrárselo a Rosa; si no, la empresa lo asume como gasto."],
    despues: ["El libro no dice desde qué cifra: lo decide la empresa."],
    alt: "La regla con el tramo de 6.700 que falta, a la izquierda de la marca del fondo.",
    pie: "Basado en el libro, p. 183",
  },
  {
    id: "camino-1", modo: "ficha", pregunta: true,
    cuentas: [CXC_EMPLEADOS, GASTOS_FALTANTE, INGRESOS_SOBRANTE], monto: FALTANTE,
    va: { id: CXC_EMPLEADOS, lado: DEBE },
    base: {},
    antes: ["Sus Servicios decide cobrarle los $6.700 a Rosa."],
    acierto: "Rosa le queda debiendo $6.700 a la empresa.",
    errores: {
      [GASTOS_FALTANTE]: "Esa es para cuando la empresa asume la pérdida.",
      [INGRESOS_SOBRANTE]: "Esa es para cuando sobra plata.",
      lado: "Una cuenta por cobrar no sube por ese lado.",
    },
    alt: "Los 6.700 que faltan se ponen en una de tres cuentas, al debe o al haber.",
    pie: "Basado en el libro, p. 186",
  },
  {
    id: "camino-2", modo: "caminos",
    antes: ["¿Y si la empresa asume la pérdida? Cambia de camino y mira qué cambia en el asiento."],
    alt: "El asiento entero, con los dos caminos. Al cambiar de camino, solo cambia la cuenta de los 6.700.",
    pie: "Basado en el libro, p. 186",
  },
  {
    id: "resumen", modo: "quieta",
    resumen: [
      "Soportes más caja deben dar el fondo.",
      "Si sobra plata, el reembolso es menor que lo gastado; si falta, mayor.",
      "Lo que falta se cobra al encargado o lo asume la empresa.",
    ],
    siguiente: "Siguiente: «Bancos y notas del banco».",
    alt: "La regla del fondo, sin agujas.",
    pie: "Basado en el libro, pp. 182-186",
  },
];

export const PIEZA_EL_ARQUEO = {
  id: A3_ID,
  numero: 3,
  titulo: "El arqueo",
  boton: BOTON.seguir,
  pantallas: PANTALLAS_A3,
};
