import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H4 DE HACER — «¿Periódico o permanente?» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello y sus correcciones: «Retención en
 * la fuente por pagar» en el ítem 1 (regla 8), las dos tarjetas APILADAS, una
 * sobre otra (patrón 06 B), y «Lo sostienen: A1 y A2 de T7-2». Copia en
 * orquestador/conocimiento/paquetes/t7-2-h4-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0101, que corre Mateo.
 *
 * CINCO ACIERTOS POSIBLES, uno por ítem. Cada ítem muestra las dos versiones
 * de un mismo hecho, «Versión 1» y «Versión 2», en posición aleatoria; se toca
 * la del sistema que se pregunta. Un solo intento. Los ítems van en el orden
 * de la tabla, que alterna permanente y periódico. Sin cifras (regla 3: cada
 * ítem trae las dos versiones del mismo hecho, y ninguna cifra).
 *
 * Lo que la v1 no trae y se toma de la convención de H1 y H2: los botones
 * «Siguiente ítem» y «Ver mi resumen», y «Debe» y «Haber» como nombres de los
 * lados en los asientos sin cifras.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H4_ID = "t7-2-periodico-o-permanente";

export const PERIODICO = "periodico";
export const PERMANENTE = "permanente";

export const H4 = {
  id: H4_ID,
  nombre: "¿Periódico o permanente?",
  consigna: "Elige la versión que corresponde al sistema que se pregunta. Tienes un solo intento por pregunta.",
  enunciado: ["La misma empresa puede llevar su inventario con el sistema periódico o con el permanente. Cada pregunta te muestra las dos versiones de un mismo hecho."],
  pie: "Basado en el libro, pp. 209-214 y 233-236",
};

export const BOTON_H4 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };
/* Los nombres de las dos tarjetas, de la v1. */
export const VERSIONES = ["Versión 1", "Versión 2"];

export const SUBTEMAS_H4 = ["La compra", "La venta", "La cuenta Inventario", "El costo vendido", "El conteo"];

/* Una línea de asiento sin cifra: [cuenta, lado]. Un asiento es una lista de líneas; una versión, una lista de asientos o un texto. */
const linea = (cuenta, lado) => ({ cuenta, lado });
const COMPRA = (primera) => [[
  linea(primera, DEBE),
  linea("IVA por pagar", DEBE),
  /* Corrección de Near (regla 8): antes, «Retefuente por pagar». */
  linea("Retención en la fuente por pagar", HABER),
  linea("Cuentas por pagar – proveedores", HABER),
]];
const VENTA = [
  linea("Cuentas por cobrar – clientes", DEBE),
  linea("Anticipo fiscal", DEBE),
  linea("IVA por pagar", HABER),
  linea("Ingresos por ventas", HABER),
];

export const ITEMS_H4 = [
  {
    id: "la-compra", subtema: "La compra", sistema: PERMANENTE,
    pregunta: "¿Cuál es la compra en el sistema permanente?",
    versiones: { [PERIODICO]: { asientos: COMPRA("Compras") }, [PERMANENTE]: { asientos: COMPRA("Inventario de mercancías") } },
    acierto: "Así es. En el permanente, la compra va directo al debe de Inventario de mercancías.",
    error: "Esa usa la cuenta Compras, que es del periódico. En el permanente, la compra va al debe de Inventario de mercancías.",
  },
  {
    id: "la-venta", subtema: "La venta", sistema: PERIODICO,
    pregunta: "¿Cuál es la venta en el sistema periódico?",
    versiones: {
      [PERIODICO]: { asientos: [VENTA] },
      [PERMANENTE]: { asientos: [VENTA, [linea("Costo de mercancía vendida", DEBE), linea("Inventario de mercancías", HABER)]] },
    },
    acierto: "Así es. En el periódico, la venta lleva un solo asiento: el del precio de venta.",
    error: "Esa tiene un segundo asiento, por el costo de lo que salió. Ese asiento es del permanente.",
  },
  {
    id: "la-cuenta-inventario", subtema: "La cuenta Inventario", sistema: PERMANENTE,
    pregunta: "¿Cuál de las dos es del sistema permanente?",
    versiones: {
      [PERIODICO]: { texto: "Inventario de mercancías queda quieta durante el periodo. Al cierre cambia el valor del inicio por el del conteo." },
      [PERMANENTE]: { texto: "Inventario de mercancías sube con cada compra y baja con cada venta. Su saldo está al día en cualquier momento." },
    },
    acierto: "Así es. En el permanente, la cuenta se mueve con cada compra y cada venta.",
    error: "En el periódico, esa cuenta queda quieta hasta el cierre. En el permanente, sube con cada compra y baja con cada venta.",
  },
  {
    id: "el-costo-vendido", subtema: "El costo vendido", sistema: PERIODICO,
    pregunta: "¿Cuál de las dos es del sistema periódico?",
    versiones: {
      [PERIODICO]: { texto: "El costo de la mercancía vendida se halla al cierre. Se suman el inventario inicial y las compras, y se resta el final." },
      [PERMANENTE]: { texto: "El costo de la mercancía vendida se anota cada vez que se hace una venta." },
    },
    acierto: "Así es. En el periódico, este costo no se anota venta por venta: se halla al cierre.",
    error: "Anotarlo en cada venta es del permanente. En el periódico se halla al cierre, con el inventario inicial, las compras y el final.",
  },
  {
    id: "el-conteo", subtema: "El conteo", sistema: PERMANENTE,
    pregunta: "¿Cuál de las dos es del sistema permanente?",
    versiones: {
      [PERIODICO]: { texto: "El conteo físico da el inventario final del periodo. Sin él no hay costo de la mercancía vendida." },
      [PERMANENTE]: { texto: "El conteo físico se hace al menos una vez al año, para revisar que los registros estén bien." },
    },
    acierto: "Así es. En el permanente, el conteo ya no da la cifra: solo revisa que los registros estén bien.",
    error: "Ese conteo da la cifra del cierre, y eso es del periódico. En el permanente, el conteo solo revisa los registros.",
  },
];

/* El resumen del cierre, con la frase de H1 y H2: cuántos de los cinco al primer toque. */
export const resumenH4 = (bien, total) => `${bien} de ${total} al primer toque.`;
