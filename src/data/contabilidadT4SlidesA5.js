/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A5 «San Calixto» COMO SLIDES (Célula D).
 *
 * Contenido: la tabla de A5 del hilo de Katsumi, el «Texto literal de las
 * pantallas que llevaban «…»» y el porqué del segundo error del lote 4, en
 * orquestador/revisiones/t4-slides/hilo-katsumi.md. Los aciertos, errores,
 * rótulos y cifras son los ya aprobados de A5 (contabilidadT4A5.js, paquete
 * d4-t4-a5-v3-rediseno.md). Forma: diseno-hanayama.md §3, A5.
 *
 * Lo que una pantalla dice, por lugar (como en A0):
 *   titular   arriba (en la 1, el objetivo D2 de la pieza; en los Haz sin
 *             pregunta corta, la «Idea» de la tabla de Hanayama)
 *   antes     la banda antes de responder
 *   acierto   la banda al acertar (si el hilo no da texto, solo la pastilla)
 *   errores   la banda tras un error, por opción elegida
 *   porque    la banda tras el segundo error (C2, lote 4)
 *   cierre    en el Cierre: la frase y el pie (A5 es la última de T4: sin «Siguiente: «X».»)
 *
 * D8: el caso B cambia cifras, fecha y personas (DATOS_A5[2]). Los porqués del
 * lote 4 de A5 no llevan cifras ni personas, así que la plantilla deja el
 * mismo texto en los dos casos.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { A5_ID, DATOS_A5, PIEZA_SAN_CALIXTO, PASO_MAYOR_MS, ESPERA_NOTA_MS } from "./contabilidadT4A5.js";

export { A5_ID, PASO_MAYOR_MS, ESPERA_NOTA_MS };

const P1 = Object.fromEntries(PIEZA_SAN_CALIXTO.pantallas.map((p) => [p.id, p]));
const PB = Object.fromEntries(PIEZA_SAN_CALIXTO.casoB.pantallas.map((p) => [p.id, p]));

/* Lote 4: el porqué del segundo error. La plantilla cambia las cifras y la persona del caso 1 por las del caso B (en A5 no hay ninguna). */
const PORQUE_A5 = {
  saldo: "Ninguno todavía. Al extracto le falta lo que la empresa anotó, y a los libros, las notas del banco.",
  banco: "Los cheques sin cobrar van a Menos, porque el banco aún no los paga. La consignación sin abonar va a Más.",
  empresa: "Las notas crédito van a Más, porque el banco abonó. Las notas débito van a Menos, porque el banco cobró.",
  asienta: "No se asienta. La empresa lo anotó al girarlo, y asentarlo otra vez lo dejaría doble en sus libros.",
  /* Katsumi (#488, condición d): A5 p5 cambia de mecánica y su porqué reemplaza el del lote 4. */
  asientos: "La otra cuenta dice por qué se movió la plata: un cobro, un ingreso o un gasto.",
};
export const plantillaPorqueB = (texto, cambios = {}) =>
  Object.entries(cambios).reduce((t, [de, a]) => t.split(de).join(a), texto);

function slides(caso) {
  const D = DATOS_A5[caso];
  const F = D.F;
  const P = caso === 1 ? P1 : PB;
  /* Caso B: las cifras y la persona del caso 1, cambiadas por las del B (lote 4). Los porqués de A5 no tienen ninguna. */
  const cambios = {};
  const porque = (k) => plantillaPorqueB(PORQUE_A5[k], cambios);
  return {
    D,
    saldo: {
      titular: PIEZA_SAN_CALIXTO.objetivo,
      antes: [P["dos-saldos"].caso, P["dos-saldos"].rotuloPregunta],
      opciones: P["dos-saldos"].opciones.map((id) => ({ id, texto: F.opcionesSaldo[id] })),
      correcta: P["dos-saldos"].correcta,
      acierto: [P["dos-saldos"].acierto],
      errores: P["dos-saldos"].errores,
      porque: porque("saldo"),
      difieren: F.difieren(String(D.DIFERENCIA_INICIAL).replace(/\B(?=(\d{3})+(?!\d))/g, ".")),
      alt: P["dos-saldos"].alt,
    },
    banco: {
      titular: "Al banco le falta lo que la empresa anotó",
      antes: P["lado-del-banco"].antes,
      porque: porque("banco"),
      alt: P["lado-del-banco"].alt,
    },
    empresa: {
      titular: "A la empresa le faltan las notas",
      antes: P["lado-de-la-empresa"].antes,
      porque: porque("empresa"),
      alt: P["lado-de-la-empresa"].alt,
    },
    asienta: {
      titular: "¿Y este cheque?",
      antes: ["Lo que importa es dejar Bancos en su valor verdadero: la empresa solo asienta lo que le falta."],
      opciones: P["que-se-asienta"].opciones.map((id) => ({ id, texto: F.chips[id] })),
      correcta: P["que-se-asienta"].correcta,
      acierto: [P["que-se-asienta"].acierto],
      errores: P["que-se-asienta"].errores,
      porque: porque("asienta"),
      etiqueta: F.asienta,
      alt: P["que-se-asienta"].alt,
    },
    /* Katsumi (#488): Bancos ya está en su lado; cada nota se lleva a su contrapartida entre tres cuentas. */
    asientos: {
      titular: "¿Con qué otra cuenta se asienta cada nota?",
      antes: ["Bancos ya está en su lado."],
      error: "Esa cuenta es de otra nota. ¿Por qué se movió esta plata?",
      porque: porque("asientos"),
      alt: P["los-asientos"].alt,
    },
    mayor: {
      titular: P["el-mayor"].antes[0],
      cierre: P["el-mayor"].cierre,
      /* Hanayama pide «pp. 189-191»; esa cadena no está en ninguna fuente aprobada, así que va el pie aprobado de esta pantalla. */
      pie: P["el-mayor"].pie,
      alt: P["el-mayor"].alt,
    },
  };
}

export const SLIDES_A5 = { 1: slides(1), 2: slides(2) };

/* Para el informe: en A5 el caso B cambia estas personas (en las tarjetas y en las líneas de las notas, que vienen de los datos viejos). */
export const PERSONAS_B_A5 = {
  "Lorena Guerra": "Marcela Ruiz", "Steffany Herrera": "Diego Peña", "Angélica Garrido": "Sara Mejía", "Laura García": "Iván Rojas",
  "Efraín Martínez": "Hernán Castro", "Humberto Gómez": "Pilar Vega",
};
