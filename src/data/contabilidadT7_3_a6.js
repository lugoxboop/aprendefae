import { BOTON, DEBE, HABER } from "./contabilidadT7_3.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · A6 DE APRENDER — «La provisión para inventarios» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-a6-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * El ejemplo I-3 del libro (p. 256), resuelto: A6 es su dueña. Lo que dice
 * el libro de las normas fiscales va atribuido a él, sin afirmar vigencia.
 * C7-18: las cuentas van con los nombres de la regla 8 (Gasto provisiones –
 * inventarios, Provisión para inventarios). No se muestra el saldo que queda
 * en la provisión: el libro no lo calcula.
 *
 * La ficha es la variante de la regla 10b para I-3: quién · provisión
 * estimada · pérdida real · fecha · sistema; el sistema es HUECO, y la v1 da
 * su texto: «Sistema: el libro no lo dice.» (en la ficha, con mayúscula
 * inicial, como los demás datos).
 *
 * Lo que la v1 no trae y se toma de A1 de T7-3: los botones y mensajes, y el
 * pie de cada pantalla (todo sale de la p. 256; el de cada asiento lo da la
 * v1).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A6_ID = "t7-3-provision-inventarios";

export const I3_LIBRO = { provision: 520_000, perdida: 230_000 };
const C = I3_LIBRO;
const PIE = "Basado en el libro, p. 256";
const GASTO = "Gasto provisiones – inventarios";
const PROV = "Provisión para inventarios";
const INV = "Inventario de mercancías";

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás qué es una provisión para inventarios, y qué pasa cuando llega la pérdida.",
  boton: BOTON.empezar,
  pie: PIE,
};

const QUE_ES = {
  id: "que-es",
  tipo: "lectura",
  parrafos: [
    "El libro habla de las normas fiscales. Dice que, según ellas, las empresas pueden estimar provisiones para las pérdidas de su inventario.",
    "Una provisión es un valor que la empresa estima, antes de que pasen, para las pérdidas que espera en su inventario.",
    "La pérdida que se estima se carga como gasto del periodo. Va al debe de Gasto provisiones – inventarios, y al haber de Provisión para inventarios.",
    "Después puede llegar una pérdida real, por ejemplo un faltante. Lo perdido va al debe de Provisión para inventarios y al haber de Inventario de mercancías.",
  ],
  boton: BOTON.seguir,
  pie: PIE,
};

const EJEMPLO = {
  id: "ejemplo",
  tipo: "lectura",
  parrafos: ["Mira el ejemplo del libro. Una empresa estima una provisión de $520.000. Al cierre, el 31 de diciembre, el conteo muestra un faltante de $230.000."],
  ficha: [
    { dato: "Quién", texto: "Una empresa" },
    { dato: "Provisión estimada", texto: "$520.000" },
    { dato: "Pérdida real", texto: "$230.000" },
    { dato: "Fecha", texto: "31 de diciembre" },
    { dato: "Sistema", texto: "El libro no lo dice." },
  ],
  /* C7-18: nombres de la regla 8. */
  asientos: [{ fecha: "31 de diciembre", lineas: [{ cuenta: GASTO, lado: DEBE, monto: C.provision }, { cuenta: PROV, lado: HABER, monto: C.provision }] }],
  boton: BOTON.seguir,
  pie: PIE,
};

const LA_PERDIDA = {
  id: "la-perdida",
  tipo: "eleccion",
  pregunta: "Llega la pérdida real de $230.000. ¿Qué cuenta va al debe?",
  opciones: [
    { id: "provision", texto: PROV, correcta: true },
    { id: "gasto", texto: GASTO, devolucion: "La pérdida real se carga a la provisión que se había estimado. Por eso, la que va al debe es Provisión para inventarios." },
    { id: "inventario", texto: INV, devolucion: "Falta mercancía, así que Inventario de mercancías baja: va al haber. La que va al debe es Provisión para inventarios." },
  ],
  acierto: {
    texto: "Así es. La pérdida real se carga a la provisión: Provisión para inventarios va al debe.",
    asientos: [{ fecha: "31 de diciembre", lineas: [{ cuenta: PROV, lado: DEBE, monto: C.perdida }, { cuenta: INV, lado: HABER, monto: C.perdida }] }],
    despues: ["Así, la pérdida real baja la provisión y baja el inventario."],
    pie: PIE,
  },
  error: { pie: PIE },
  pie: PIE,
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "Primero se estima la provisión. Lo que se estima es un gasto del periodo.",
    "Cuando llega la pérdida real, se carga a la provisión, y el inventario baja.",
  ],
  siguiente: "Siguiente: practica con un conteo y una provisión.",
  pie: PIE,
};

export const PIEZA_LA_PROVISION = {
  id: A6_ID,
  numero: 6,
  titulo: "La provisión para inventarios",
  pantallas: [PORTADA, QUE_ES, EJEMPLO, LA_PERDIDA, RESUMEN],
};
