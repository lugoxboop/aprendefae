import { DEBE, HABER } from "./contabilidad.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · H5 DE HACER — «Flete y devolución» (Célula C).
 *
 * Fuente: la v1 de Near, con PASA de Mello y la tabla de correcciones de
 * Near: la empresa es Mangle (antes Ceiba) y el flete lo «asume» quien compra
 * o quien vende (antes «lo paga»). Copia en
 * orquestador/conocimiento/paquetes/t7-2-h5-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Hacer Medio, evaluativa, 25 FP: el motor compartido escala los FP con los
 * aciertos, con piso del 50 %. Migración 0102, que corre Mateo.
 *
 * SIETE ACIERTOS POSIBLES: los ítems 1 a 5 y las dos líneas del ítem 6. Un
 * solo intento por unidad, sin arrastre: las cifras son fijas. En el ítem 6
 * se elige el lado de cada línea y «Comprobar» las califica una vez; las
 * sumas aparecen después (patrón v3.2). Los ítems van en el orden de la
 * tabla, con su hecho arriba; las opciones y las líneas, barajadas.
 *
 * LAS CIFRAS no se escriben a mano: salen del flete, la devolución, el costo
 * devuelto y las tarifas (calcularH5). Una prueba las recalcula y las compara
 * con las de Near. Son construidas (registro 5c); ninguna es del periódico
 * (regla 3). Como en la p. 245, el flete no lleva IVA.
 *
 * Lo que la v1 no trae y se toma de la convención de H1 a H4: los botones
 * «Siguiente ítem» y «Ver mi resumen», «Comprobar», «Debe» y «Haber», y
 * «Hecho 1» a «Hecho 4» como encabezado de cada pregunta (la v1 los nombra
 * así).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const H5_ID = "t7-2-flete-y-devolucion";

export const FLETE_H5 = 380_000;
export const DEVOLUCION_H5 = 820_000;
export const COSTO_DEVUELTO_H5 = 490_000;
export const TARIFAS_H5 = { iva: 16, retencion: 3.5, transporte: 1 };

export function calcularH5(t = TARIFAS_H5) {
  const retTransporte = (FLETE_H5 * t.transporte) / 100;
  const iva = (DEVOLUCION_H5 * t.iva) / 100;
  const retencion = (DEVOLUCION_H5 * t.retencion) / 100;
  return {
    flete: FLETE_H5, retTransporte, pago: FLETE_H5 - retTransporte,
    devolucion: DEVOLUCION_H5, iva, retencion, baja: DEVOLUCION_H5 + iva - retencion,
    costo: COSTO_DEVUELTO_H5,
  };
}

export const CIFRAS_H5 = calcularH5();
const C = CIFRAS_H5;

export const H5 = {
  id: H5_ID,
  nombre: "Flete y devolución",
  consigna: "Tienes un solo intento por pregunta.",
  enunciado: [
    "La empresa Mangle usa el sistema de inventario permanente. Mira cuatro hechos de su mes.",
    "En este ejercicio, el IVA es del 16 %, la retención del 3,5 % y la retención por transporte del 1 %. Todas se calculan sobre el valor, sin el IVA.",
    /* «Después va la frase de tarifas literal»: la de A2. */
    "Las tarifas de este ejercicio son datos del libro. No las tomes como las tarifas de hoy.",
  ],
  pie: "Basado en el libro, pp. 245-247",
};

export const BOTON_H5 = { siguiente: "Siguiente ítem", verResumen: "Ver mi resumen" };

export const SUBTEMAS_H5 = ["Flete del comprador", "Flete del vendedor", "Devolución de compras", "Devolución de ventas"];

export const HECHOS_H5 = [
  "Mangle compra mercancía a crédito. El flete hasta su bodega vale $380.000 y lo asume Mangle, que lo paga en efectivo ese día.",
  "Mangle vende mercancía y asume el flete hasta la bodega del cliente.",
  "Mangle le devuelve al proveedor mercancía que llegó en mal estado. Valía $820.000, más el IVA.",
  "Un cliente le devuelve a Mangle mercancía que le compró. A Mangle le había costado $490.000.",
];

const INV_FLETES = "Inventario de mercancías (fletes)";
const GASTO_FLETES = "Gasto de venta – fletes";
const CMV = "Costo de mercancía vendida";
const INVENTARIO = "Inventario de mercancías";

export const ITEMS_H5 = [
  {
    id: "flete-del-comprador", tipo: "eleccion", hecho: 0, subtema: "Flete del comprador",
    pregunta: "¿A qué cuenta va el flete?",
    correcta: INV_FLETES,
    acierto: "Así es. El flete que asume quien compra es parte del costo del inventario.",
    distractores: [
      { valor: GASTO_FLETES, retro: "Aquí el flete lo asume quien compra. Es parte del costo de tener la mercancía lista para vender: va a Inventario de mercancías." },
      { valor: CMV, retro: "Esa mercancía aún no se ha vendido. El flete se suma a su costo, en Inventario de mercancías." },
    ],
  },
  {
    id: "pago-a-la-transportadora", tipo: "eleccion", cifra: true, hecho: 0, subtema: "Flete del comprador",
    pregunta: "¿Cuánto le paga Mangle a la transportadora?",
    correcta: C.pago,
    acierto: "Así es: $380.000 − $3.800 = $376.200.",
    distractores: [
      /* La retención del 3,5 % en vez de la del transporte. */
      { valor: C.flete - (C.flete * TARIFAS_H5.retencion) / 100, retro: "Usaste otra tarifa. La del transporte es del 1 %: $3.800, y se resta del flete." },
      { valor: C.flete + C.retTransporte, retro: "La retención se resta, porque Mangle se la descuenta a la transportadora." },
    ],
  },
  {
    id: "flete-del-vendedor", tipo: "eleccion", hecho: 1, subtema: "Flete del vendedor",
    pregunta: "¿A qué cuenta va este flete?",
    correcta: GASTO_FLETES,
    acierto: "Así es. Cuando el flete lo asume quien vende, es un gasto de ventas.",
    distractores: [
      { valor: INV_FLETES, retro: "Este flete lo asume quien vende, y la mercancía ya salió. Es un gasto de ventas: va a Gasto de venta – fletes." },
      { valor: CMV, retro: "El costo de la mercancía vendida es lo que costó lo que salió. El flete del envío es un gasto de ventas." },
    ],
  },
  {
    id: "devolucion-de-compras", tipo: "eleccion", hecho: 2, subtema: "Devolución de compras",
    pregunta: "¿Qué cuenta va al haber por el valor de la mercancía devuelta?",
    correcta: INVENTARIO,
    acierto: "Así es. La devolución reversa la compra: Inventario de mercancías va al haber.",
    distractores: [
      { valor: "Devoluciones de compras", retro: "En el permanente no hay cuenta Compras. Por eso tampoco se usa Devoluciones de compras. Lo que va al haber es Inventario de mercancías." },
      { valor: "Compras", retro: "En el permanente, la compra entró a Inventario de mercancías. La devolución la saca de ahí: va al haber." },
    ],
  },
  {
    id: "baja-con-el-proveedor", tipo: "eleccion", cifra: true, hecho: 2, subtema: "Devolución de compras",
    pregunta: "¿Cuánto baja lo que Mangle le debe al proveedor?",
    correcta: C.baja,
    acierto: "Así es: $820.000 + $131.200 − $28.700 = $922.500.",
    distractores: [
      { valor: C.devolucion + C.iva, retro: "Falta restar la retención. El IVA es $131.200 y la retención, $28.700." },
      { valor: C.devolucion + C.iva + C.retencion, retro: "La retención se resta, porque Mangle ya la había descontado." },
    ],
  },
  {
    id: "devolucion-de-ventas", tipo: "asiento", hecho: 3, subtema: "Devolución de ventas",
    pregunta: "La devolución lleva dos asientos. El primero reversa la venta en Devoluciones de ventas, que resta de Ingresos por ventas. Ubica cada línea del segundo: Debe o Haber.",
    lineas: [
      { id: "inventario", cuenta: INVENTARIO, valor: C.costo, lado: DEBE, retro: "La mercancía vuelve a la bodega, así que el activo aumenta: va al debe." },
      { id: "costo", cuenta: CMV, valor: C.costo, lado: HABER, retro: "Este asiento reversa el del costo de la venta. Costo de mercancía vendida baja: va al haber." },
    ],
  },
];

/* El encabezado de cada pregunta: el hecho al que pertenece. */
export const encabezadoDeHecho = (k) => `Hecho ${k + 1}`;

/* El resumen del cierre, con la frase de H1 a H4: cuántos de los siete al primer toque. */
export const resumenH5 = (bien, total) => `${bien} de ${total} al primer toque.`;
