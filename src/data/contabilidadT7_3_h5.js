import { DEBE, HABER, pesos } from "./contabilidad.js";
import { cuentaDeConteo } from "./contabilidadT7_3_a5.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-3 · H5 DE HACER — «Ajuste por conteo» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-3-h5-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0107, que corre Mateo.
 *
 * ONCE ACIERTOS POSIBLES en tres casos: el sobrante de Olmo (ítems 1 a 4),
 * su faltante de otro año (5 y 6) y la provisión de Pino, otra empresa (7 y
 * 8). Un solo intento por unidad. Los dos casos de pérdida van en empresas
 * distintas para no obligar a escoger sin fuente entre la p. 255 y la p. 256
 * (Near).
 *
 * PENDIENTE DE DECISIÓN DE L: el sistema de la ficha de Pino. Va la
 * propuesta de Near, «el libro no lo dice para la provisión», como en A6; la
 * otra opción es «permanente» como construcción marcada. Es una sola
 * constante: SISTEMA_PINO.
 *
 * LAS CIFRAS son las de Near (registro 5c); una prueba recalcula el sobrante
 * y el faltante, y compara todas con el registro.
 *
 * Lo que la v1 no trae y se toma de los Hacer de T7-3: los botones, «Caso 1»
 * a «Caso 3» como encabezado de cada pregunta (la v1 los nombra así, sin la
 * palabra que daría la respuesta del ítem 1), los rótulos de la ficha de la
 * regla 10b (los de A5 y A6), y el orden de las opciones: fijo en los ítems
 * 1 y 4 («Sobrante» · «Faltante», «Sube» · «Baja» · «No cambia»), barajado
 * en los demás.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H5_ID = "t7-3-ajuste-por-conteo";

/* PENDIENTE DE DECISIÓN DE L (regla 4 frente a la regla 10b): la propuesta de Near. */
export const SISTEMA_PINO = "El libro no lo dice para la provisión";

export const OLMO_1 = { libros: 612_000, conteo: 648_000 };
export const OLMO_2 = { libros: 738_000, conteo: 694_000 };
export const PINO = { provision: 460_000, perdida: 185_000 };
const SOBRANTE = OLMO_1.conteo - OLMO_1.libros;
const FALTANTE = OLMO_2.libros - OLMO_2.conteo;

export const H5 = {
  id: H5_ID,
  nombre: "Ajuste por conteo",
  consigna: "Registra cada ajuste. Tienes un solo intento por pregunta.",
  enunciado: ["La empresa Olmo usa el sistema permanente. Al cierre del año, el 31 de diciembre, hace su conteo físico."],
  pie: "Basado en el libro, pp. 254-256",
};

/*
 * Patrón T7-3 (Watari): la cuenta del conteo de Olmo en renglones, DESPUÉS
 * de su ítem (2: el sobrante; 5: el faltante), y solo mientras dura su caso.
 * El caso de Pino no lleva cuenta: solo asiento. Títulos de Watari, por
 * confirmar con Near.
 */
export const FIGURAS_H5 = [
  { ...cuentaDeConteo("Olmo · 31 de diciembre", OLMO_1.libros, OLMO_1.conteo), desde: 2, hasta: 4 },
  { ...cuentaDeConteo("Olmo · otro año", OLMO_2.libros, OLMO_2.conteo), desde: 5, hasta: 6 },
];

export const BOTON_H5 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

const fichaOlmo = (c) => [
  ["Quién", "Olmo"], ["Saldo en libros", pesos(c.libros)], ["Valor del conteo", pesos(c.conteo)],
  ["Fecha", "31 de diciembre"], ["Sistema", "Permanente"],
];

export const CASOS_H5 = [
  { encabezado: "Caso 1", textos: ["En los libros, Inventario de mercancías tiene un saldo de $612.000. El conteo da $648.000."], ficha: fichaOlmo(OLMO_1) },
  { encabezado: "Caso 2", textos: ["Otro año, los libros de Olmo dicen $738.000 y el conteo da $694.000."], ficha: fichaOlmo(OLMO_2) },
  {
    encabezado: "Caso 3",
    textos: [
      "Pino es otra empresa. Estima que va a perder $460.000 de su inventario, y hace una provisión por ese valor.",
      "Al cierre, Pino tiene una pérdida real de $185.000 por un faltante.",
    ],
    ficha: [["Quién", "Pino"], ["Provisión estimada", "$460.000"], ["Pérdida real", "$185.000"], ["Fecha", "31 de diciembre"], ["Sistema", SISTEMA_PINO]],
  },
];

const INV = "Inventario de mercancías";
const CMV = "Costo de mercancía vendida";
const GASTO = "Gasto provisiones – inventarios";
const PROV = "Provisión para inventarios";

export const ITEMS_H5 = [
  {
    id: "sobrante-o-faltante", tipo: "eleccion", caso: 0, opcionesV1: ["Sobrante", "Faltante"],
    pregunta: "¿Hay un sobrante o un faltante?",
    correcta: "Sobrante",
    acierto: "Así es. El conteo da más que los libros: hay un sobrante.",
    distractores: [{ valor: "Faltante", retro: "El conteo da más que los libros. Cuando eso pasa, hay un sobrante." }],
  },
  {
    id: "el-sobrante", tipo: "eleccion", caso: 0, pesos: true,
    pregunta: "¿De cuánto es el sobrante?",
    correcta: SOBRANTE,
    acierto: "Así es: $648.000 − $612.000 = $36.000.",
    distractores: [
      { valor: OLMO_1.conteo, retro: "Ese es el valor del conteo. El sobrante es lo que el conteo da de más que los libros." },
      { valor: OLMO_1.conteo + OLMO_1.libros, retro: "Sumaste los dos valores. El sobrante es la diferencia: $648.000 − $612.000." },
    ],
  },
  {
    id: "ajuste-sobrante", tipo: "asiento", caso: 0,
    pregunta: "Ubica cada línea del ajuste por sobrante: Debe o Haber.",
    lineas: [
      { id: "inventario", cuenta: INV, valor: SOBRANTE, lado: DEBE, retro: "Aparece mercancía que los libros no tenían, así que el activo aumenta: va al debe." },
      { id: "costo", cuenta: CMV, valor: SOBRANTE, lado: HABER, retro: "El sobrante baja el costo de la mercancía vendida: va al haber." },
    ],
  },
  {
    id: "que-pasa-con-el-costo", tipo: "eleccion", caso: 0, opcionesV1: ["Sube", "Baja", "No cambia"],
    pregunta: "Con este ajuste, ¿qué pasa con el costo de la mercancía vendida?",
    correcta: "Baja",
    acierto: "Así es. El sobrante va al haber del costo, así que el costo baja.",
    /* Una sola retroalimentación de error, para «Sube» y «No cambia». */
    distractores: ["Sube", "No cambia"].map((valor) => ({ valor, retro: "El sobrante va al haber de Costo de mercancía vendida. Por eso el costo baja." })),
  },
  {
    id: "el-faltante", tipo: "eleccion", caso: 1, pesos: true,
    pregunta: "¿De cuánto es el faltante?",
    correcta: FALTANTE,
    acierto: "Así es: $738.000 − $694.000 = $44.000. El conteo da menos que los libros.",
    distractores: [
      { valor: OLMO_2.conteo, retro: "Ese es el valor del conteo. El faltante es lo que el conteo da de menos que los libros." },
      { valor: OLMO_2.libros + OLMO_2.conteo, retro: "Sumaste los dos valores. El faltante es la diferencia: $738.000 − $694.000." },
    ],
  },
  {
    id: "ajuste-faltante", tipo: "asiento", caso: 1,
    pregunta: "Ubica cada línea del ajuste por faltante: Debe o Haber.",
    lineas: [
      { id: "costo", cuenta: CMV, valor: FALTANTE, lado: DEBE, retro: "El faltante sube el costo de la mercancía vendida: va al debe." },
      { id: "inventario", cuenta: INV, valor: FALTANTE, lado: HABER, retro: "Falta mercancía en la bodega, así que el activo baja: va al haber." },
    ],
  },
  {
    id: "estimar-provision", tipo: "eleccion", caso: 2,
    pregunta: "Al estimar la provisión, ¿qué cuenta va al debe?",
    correcta: GASTO,
    acierto: "Así es. La pérdida estimada es un gasto del periodo: va al debe de Gasto provisiones – inventarios.",
    /* «Los dos errores»: el mismo texto. */
    distractores: [PROV, INV].map((valor) => ({ valor, retro: "La pérdida que se estima se carga como gasto. Va al debe de Gasto provisiones – inventarios." })),
  },
  {
    id: "perdida-real", tipo: "asiento", caso: 2,
    pregunta: "Ubica cada línea del asiento de la pérdida real: Debe o Haber.",
    lineas: [
      { id: "provision", cuenta: PROV, valor: PINO.perdida, lado: DEBE, retro: "La pérdida real se carga a la provisión que se había estimado: va al debe." },
      { id: "inventario", cuenta: INV, valor: PINO.perdida, lado: HABER, retro: "Falta mercancía, así que el activo baja: va al haber." },
    ],
  },
];

/* El resumen del cierre, con la frase de los Hacer de la célula. */
export const resumenH5 = (bien, total) => `${bien} de ${total} al primer toque.`;
