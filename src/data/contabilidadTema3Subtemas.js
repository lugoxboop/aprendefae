import { ACT1_T3, HECHOS_ACT1_T3 } from "./contabilidadTema3Act1.js";
import { ACT2_T3, ITEMS_ACT2 } from "./contabilidadTema3Act2.js";
import { ACT3_T3, PARES_ACT3 } from "./contabilidadTema3Act3.js";
import { ACT4_T3, ITEMS_ACT4 } from "./contabilidadTema3Act4.js";
import { ACT5_T3, ITEMS_ACT5 } from "./contabilidadTema3Act5.js";
import { ACT6_T3, ITEMS_ACT6 } from "./contabilidadTema3Act6.js";
import { ACT7_T3, CASOS_ACT7 } from "./contabilidadTema3Act7.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LOS SUBTEMAS DE T3 «INGRESOS, GASTOS Y CAJA» PARA EL REPASO DIARIO
 * (Célula E, issue #469) — ANDAMIO, SIN CABLEAR.
 *
 * Mismo formato que src/repaso/subtemas.js (Macro): [fijo] o [regla]. El
 * cableado al Repaso es de Erwin; aquí solo está, para cada una de las 7
 * Hacer de T3:
 *
 *   · la UNIDAD DE HISTORIAL: el `item` que la actividad manda al detalle
 *     (useTanda de piezas.jsx, `anotar(item, …)`). La clave del Repaso es
 *     `${actividad}:${item}`, igual que en items.js;
 *   · el CAMPO DEL BANCO que sirve para [regla], con sus valores sacados del
 *     banco (no escritos a mano: si el banco cambia, la prueba lo dice);
 *   · el nombre de cada subtema: `null` hasta que lleguen los de Miyata.
 *
 * No copia contenido: lee los bancos de las actividades.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Las 7 Hacer de T3: su banco, la unidad de historial y el campo de la regla. */
export const INVENTARIO_T3 = [
  {
    actividad: ACT1_T3.id, banco: HECHOS_ACT1_T3, item: (x) => x.id, campo: "grupo",
    unidad: "el hecho (h.id); con segunda decisión, `respuestas: { grupo, segunda }`",
  },
  {
    actividad: ACT2_T3.id, banco: ITEMS_ACT2, item: (x) => x.id, campo: "queda",
    unidad: "el ítem (item.id), con `respuestas: { dia, segunda }`",
  },
  {
    actividad: ACT3_T3.id, banco: PARES_ACT3, item: (x) => x.id, campo: "id",
    unidad: "el par (par.id, sin prefijo t3: «maquina», «arriendo»…); no hay campo de clase: la regla va por el par",
  },
  { actividad: ACT4_T3.id, banco: ITEMS_ACT4, item: (x) => x.id, campo: "clase", unidad: "el ítem (it.id)" },
  { actividad: ACT5_T3.id, banco: ITEMS_ACT5, item: (x) => x.id, campo: "clase", unidad: "el ítem (it.id)" },
  { actividad: ACT6_T3.id, banco: ITEMS_ACT6, item: (x) => x.id, campo: "tipo", unidad: "el ítem (item.id)" },
  {
    actividad: ACT7_T3.id, banco: CASOS_ACT7.flatMap((c) => [1, 2, 3].map((parte) => ({ ...c, parte }))), item: (x) => `${x.id}:${x.parte}`, campo: "parte",
    unidad: "cada parte del caso (`${caso.id}:${parte}`): 1 asiento de ingresos, 2 de gastos, 3 el saldo",
  },
];

/* Las claves de historial de una actividad, en el formato del Repaso. */
export const clavesDe = (actividad) => {
  const a = INVENTARIO_T3.find((x) => x.actividad === actividad);
  return a ? a.banco.map((x) => `${actividad}:${a.item(x)}`) : [];
};

/* Los valores distintos del campo de la regla, leídos del banco. */
export const valoresDeRegla = (actividad) => {
  const a = INVENTARIO_T3.find((x) => x.actividad === actividad);
  return a ? [...new Set(a.banco.map((x) => x[a.campo]))] : [];
};

/* [fijo] — vacío hasta que Miyata diga si alguna actividad lleva un solo subtema. */
export const SUBTEMA_FIJO_T3 = {};

/*
 * [regla] — del dato del banco al subtema, escrito a mano como en Macro. Los
 * nombres van en `null` hasta que Miyata los entregue; las claves son los
 * valores del campo de cada banco, y una prueba comprueba que sean
 * exactamente esos (ni falta ni sobra uno).
 */
export const SUBTEMA_REGLA_T3 = {
  /* ¿Ingreso o cobro?: el grupo correcto del hecho. */
  "t3-ingreso-o-cobro": { "mismo-dia": null, despues: null, "sin-ingreso": null },
  /* ¿Cuándo se causa?: qué queda el día en que se causa. */
  "t3-cuando-se-causa": { "por-cobrar": null, "por-pagar": null, nada: null },
  /* El mismo hecho, dos empresas: el par (acumulado: máquina y equipos; diferido: arriendo y servicio). */
  "t3-mismo-hecho": { maquina: null, arriendo: null, equipos: null, servicio: null },
  /* Arma el ajuste acumulado: gasto o ingreso por causar. */
  "t3-ajuste-acumulado": { gasto: null, ingreso: null },
  /* Arma el ajuste diferido: pago o cobro anticipado. */
  "t3-ajuste-diferido": { pago: null, cobro: null },
  /* ¿Qué le toca a este periodo?: pago o cobro. */
  "t3-que-le-toca": { pago: null, cobro: null },
  /* El cierre completo: la parte (1 ingresos, 2 gastos, 3 saldo). */
  "t3-cierre-completo": { 1: null, 2: null, 3: null },
};

/* Lo que falta nombrar: [actividad, valor]. Vacío = listo para cablear. */
export const subtemasPendientesT3 = () =>
  Object.entries(SUBTEMA_REGLA_T3).flatMap(([act, regla]) => Object.entries(regla).filter(([, n]) => !n).map(([v]) => [act, v]));
