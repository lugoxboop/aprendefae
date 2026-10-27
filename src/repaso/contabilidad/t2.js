import { itemDeRepaso, subtemaFijo, retro } from "./forma.js";
import { nombreDeActividad } from "../../data/subjects.js";
import { SUBTEMA_FIJO } from "../../data/contabilidadT2Subtemas.js";
import { BALANCES, SECCIONES, evaluarUbicacion } from "../../contabilidad/armaElBalance.js";
import { FILAS_A_RESOLVER, SIGNOS, evaluarCelda } from "../../contabilidad/cuadroDinamicas.js";
import { COLUMNAS } from "../../data/contabilidadCuadro.js";

/*
 * EL REPASO DE CONTABILIDAD — T2 · cuentas-debe-haber (Las cuentas, el debe y el haber).
 *
 * DUEÑA: Célula C (general L). El coordinador no escribe aquí: este
 * archivo lo llena la célula con el etiquetado de su tema, siguiendo el
 * contrato de forma.js (fijo o regla, ni una copia de contenido).
 *
 * ═══════════ QUÉ ENTRA (lote T2-13 de L, #471) ═══════════
 *
 * Solo lo que en su juego ya es una elección de un toque y cuyas opciones no
 * son «Debe» ni «Haber» (por qué, en FUERA_T2):
 *
 *   cu-de-que-familia     cada cuenta de los dos balances → Activo, Pasivo o
 *                         Patrimonio. Banco: BALANCES (armaElBalance.js);
 *                         devolución: evaluarUbicacion, la misma del juego.
 *   cu-cuadro-dinamicas   cada fila que el juego pide resolver → el signo de
 *                         su casilla del debe (+ o −). Banco: FILAS_A_RESOLVER
 *                         (cuadroDinamicas.js); devolución: evaluarCelda.
 *
 * El itemId es el que cada juego manda a registrar_fp en su detalle
 * (`t.anotar(item.id…)` en ArmaElBalance.jsx y `t.anotar(fila.id…)` en
 * CuadroDeDinamicas.jsx): lo visto en el juego y en el Repaso es un solo
 * historial. El subtema es el [fijo] de la lista cerrada de Near (#482).
 */
const rotuloDe = (actividad) => nombreDeActividad(actividad).toUpperCase();
const subtemaDe = (actividad) => subtemaFijo(SUBTEMA_FIJO[actividad], actividad);

const deQueFamilia = BALANCES.flatMap((balance) => balance.cuentas.map((cuenta) =>
  itemDeRepaso("cu-de-que-familia", cuenta.id, {
    subtema: subtemaDe("cu-de-que-familia"),
    rotulo: rotuloDe("cu-de-que-familia"),
    enunciado: cuenta.cuenta,
    grande: true,
    opciones: SECCIONES.map((s) => ({ id: s.id, texto: s.nombre })),
    correcta: cuenta.seccion,
    devolucion: (elegida) => retro(evaluarUbicacion(cuenta, elegida).texto),
  })));

/* El rótulo es la columna del debe del cuadro, y sale en teal, que es el color del debe. */
const cuadroDinamicas = FILAS_A_RESOLVER.map((fila) =>
  itemDeRepaso("cu-cuadro-dinamicas", fila.id, {
    subtema: subtemaDe("cu-cuadro-dinamicas"),
    rotulo: COLUMNAS.debe,
    enunciado: fila.nombre,
    grande: true,
    opciones: SIGNOS.map((s) => ({ id: s, texto: s })),
    correcta: fila.debito,
    devolucion: (elegida) => retro(evaluarCelda(fila, elegida).texto),
  }));

export const ITEMS_T2 = [...deQueFamilia, ...cuadroDinamicas];

/*
 * Las actividades del tema que NO aportan al pool, cada una con su razón (por
 * ejemplo: sus ítems no son preguntas sueltas). La prueba exige que cada
 * actividad de Hacer del tema esté en uno de los dos lados.
 *
 * Las tres Hacer nuevas (cu-cuadra-por-valor, cu-del-diario-al-mayor,
 * cu-las-que-vuelven-a-cero) no están ni aquí ni allá: no están en el catálogo
 * y sus bancos llegan con #499.
 */
const OPCIONES_DEBE_HABER = "sus opciones son «Debe» y «Haber», y el Repaso pinta en teal la opción acertada (Opcion, juego.jsx): un «Haber» correcto saldría en teal, y el haber es ámbar en todo el sitio. Entra cuando el Repaso pueda pintar cada lado en su color";

export const FUERA_T2 = [
  { id: "cu-izquierda-o-derecha", razon: OPCIONES_DEBE_HABER },
  { id: "cu-debita-o-acredita", razon: OPCIONES_DEBE_HABER },
  { id: "cu-saldo-de-la-cuenta", razon: "sus ítems no son preguntas sueltas de opciones: la cifra del saldo se escribe y el lado se elige mirando la cuenta T con sus movimientos (y ese lado es «Debe» o «Haber», con el mismo problema de color)" },
  { id: "cu-arma-el-asiento", razon: "sus ítems no son preguntas sueltas de opciones: se nombran las dos cuentas y se pone cada valor en su lado" },
  { id: "cu-asiento-compuesto", razon: "sus ítems no son preguntas sueltas de opciones: se escogen las cuentas que se mueven, se ponen en su columna y se escribe cada valor" },
];
