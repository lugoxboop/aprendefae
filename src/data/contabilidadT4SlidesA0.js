/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A0 «El activo corriente» COMO SLIDES (Célula D).
 *
 * Contenido: el lote 2 del hilo de Katsumi (A0 en 4 pantallas) y el porqué
 * del segundo error del lote 4, en orquestador/revisiones/t4-slides/
 * hilo-katsumi.md. Forma: diseno-hanayama.md §3, A0. Los textos van letra
 * por letra; la prueba t4-slides los busca en el hilo o en el paquete
 * aprobado de A0 (d4-t4-a0-v3-rediseno.md).
 *
 * Lo que una pantalla dice, por lugar:
 *   titular   la idea arriba (en la 1, el objetivo D2 de la pieza: §16 b)
 *   antes     la banda antes de responder (la pregunta, si no va arriba)
 *   acierto   la banda al resolver la pantalla bien
 *   errores   la banda tras un error, por opción elegida
 *   porque    la banda tras el segundo error (C2, lote 4)
 *   cierre    en el Cierre: la frase, «Siguiente: «X».» y el pie
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { A0_ID, FILAS_A0, FILAS_A0_B, PIEZA_EL_ACTIVO_CORRIENTE } from "./contabilidadT4A0.js";

export { A0_ID };

/* La raya de la columna del año, en % (§3, A0: 95 px antes y 47 después a 320). */
export const RAYA_SLIDES_A0 = 65;

/* Lote 2 de Katsumi: el efectivo como una sola fila, y «por anticipado», el término fijado. */
export const FILAS_SLIDES_A0 = {
  ...FILAS_A0,
  efectivo: { id: "efectivo", texto: ["Efectivo en caja", "y bancos"], glosa: [], mes: 0 },
  arriendo: { ...FILAS_A0.arriendo, texto: ["Arriendo pagado", "por anticipado"] },
};
const F = FILAS_SLIDES_A0;

export const CABECERA_A0 = { si: ["Corriente"], no: ["No es", "corriente"] };

export const OPCIONES_ARRIENDO = [
  { id: "plata", texto: "Se vuelve plata" },
  { id: "consume", texto: "Se consume" },
  { id: "igual", texto: "Sigue igual" },
];

const comun = {
  cruza: {
    titular: PIEZA_EL_ACTIVO_CORRIENTE.objetivo,
    antes: ["¿Qué se vuelve plata antes de un año? Marca cada fila."],
    acierto: [
      "Un activo es corriente si se vuelve plata antes de un año.",
      "Los fijos, como el edificio, se usan por años para trabajar: van en el activo no corriente.",
    ],
    error: "¿Qué se volvió plata?",
    errorDeuda: "Te deben, sí. ¿Pero cuándo pagan?",
    porque: "Corriente es lo que se vuelve plata antes de la raya. Lo que tarda años en pagarse, o dura años, cruza.",
  },
  primero: {
    titular: "¿Cuál está más cerca de ser plata?",
    antes: ["Cuatro activos corrientes."],
    filas: [F.efectivo, F.inversiones, F.cartera, F.inventarios],
    correcta: "efectivo",
    acierto: ["El libro empieza por el efectivo, en caja y en bancos: ya era plata. Por eso va primero."],
    errores: {
      inversiones: "Una inversión todavía hay que venderla para tener la plata.",
      cartera: "La cartera es plata que todavía te deben los clientes.",
      inventarios: "La mercancía primero se vende y después se cobra.",
    },
    porque: "El efectivo, en caja y en bancos, ya es plata. Los otros tres todavía tienen que venderse o cobrarse.",
  },
  consume: {
    titular: "¿Qué le pasa antes de la raya?",
    antes: ["Arriendo pagado por anticipado, seis meses."],
    fila: F.arriendo,
    correcta: "consume",
    acierto: ["El Tema 2 añade un caso: también es corriente lo que se consume dentro del año."],
    errores: {
      plata: "Nadie te devuelve ese arriendo: lo vas usando mes a mes.",
      igual: "Cada mes que pasa, ya usaste una parte de ese arriendo.",
    },
    porque: "Se consume. El arriendo no vuelve como plata: la empresa lo va usando mes a mes, y en seis meses se acaba.",
  },
  separar: {
    titular: "Con lo corriente se pagan deudas.",
    filas: [F.caja, F.edificioOficina],
    cierre: "Corriente: se vuelve plata o se consume antes de un año. Los fijos ayudan a producirla.",
    siguiente: "Siguiente: «La caja».",
    pie: "Basado en el libro, pp. 178-179",
  },
};

/*
 * D8: el caso B cambia solo las filas de la pantalla 1 (lote nocturno de
 * Katsumi: repuestos, pagaré y camión), con el error propio en el pagaré.
 */
export const SLIDES_A0 = {
  1: { ...comun, cruza: { ...comun.cruza, filas: [F.mercancia, F.deuda, F.edificioOficina], deuda: "deuda" } },
  2: { ...comun, cruza: { ...comun.cruza, filas: [FILAS_A0_B.repuestos, FILAS_A0_B.pagare, FILAS_A0_B.camion], deuda: "pagare" } },
};

/* Lado correcto de una fila en la pantalla 1: antes de la raya si se vuelve plata dentro del año. */
export const ladoA0 = (fila) => (fila.mes != null ? "antes" : "despues");
