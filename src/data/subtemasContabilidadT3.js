import { ACT1_T3, HECHOS_ACT1_T3 } from "./contabilidadTema3Act1.js";
import { ACT_GASTO_O_PAGO, BANCO_A as BANCO_GP_A, BANCO_B as BANCO_GP_B } from "./contabilidadTema3GastoOPago.js";
import { ACT2_T3, ITEMS_ACT2 } from "./contabilidadTema3Act2.js";
import { ACT3_T3, PARES_ACT3 } from "./contabilidadTema3Act3.js";
import { ACT4_T3, ITEMS_ACT4 } from "./contabilidadTema3Act4.js";
import { ACT5_T3, ITEMS_ACT5 } from "./contabilidadTema3Act5.js";
import { ACT6_T3, ITEMS_ACT6 } from "./contabilidadTema3Act6.js";
import { ACT7_T3, CASOS_ACT7 } from "./contabilidadTema3Act7.js";
import { ACT_RESULTADO_CAJA, CASO_A as CASO_RC_A, CASO_B as CASO_RC_B } from "./contabilidadTema3ResultadoCaja.js";

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
 *   · el subtema de cada una, con los nombres de Miyata: seis [fijo] y una
 *     [regla] (El mismo hecho, por escenario).
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
    actividad: ACT_GASTO_O_PAGO.id, banco: [...BANCO_GP_A, ...BANCO_GP_B], item: (x) => x.id, campo: "tipo",
    unidad: "el hecho (h.id), de la versión A o la B; la respuesta es la casilla tocada",
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
  {
    actividad: ACT_RESULTADO_CAJA.id, banco: [...CASO_RC_A.fichas, ...CASO_RC_B.fichas], item: (x) => x.id, campo: "va",
    unidad: "la ficha (f.id), de la versión A o la B; la respuesta es su elección (suma, resta o no)",
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

/*
 * Los nombres de Miyata (paquete e3-t3-miyata-v1, sección C; Kamogawa en
 * #469). Dos condiciones de Kamogawa:
 *   · «Impuesto y utilidad neta» no se publica en el Repaso hasta que exista
 *     su pieza (Takamura): no está aquí;
 *   · los dos Hacer nuevos (t3-gasto-o-pago → «Gasto y pago»,
 *     t3-del-resultado-a-la-caja → «Resultado y caja») no se declaran hasta
 *     que se construyan. Los dos ya están: «¿Gasto o pago?» (#506) y «Del
 *     resultado a la caja» (#555).
 */
const INGRESO_Y_COBRO = "Ingreso y cobro";
const CAUSACION = "Causación";
const AJUSTE_ACUMULADO = "Ajuste acumulado";
const AJUSTE_DIFERIDO = "Ajuste diferido";
const REPARTO = "Reparto por periodos";
const CIERRE = "Cierre del periodo";
/* Ya construida (#506): su subtema [fijo] del paquete e3-t3-gasto-o-pago-v3, §1. */
const GASTO_Y_PAGO = "Gasto y pago";
/* Ya construida: su subtema [fijo] del paquete e3-t3-del-resultado-a-la-caja-v4, §1. */
const RESULTADO_Y_CAJA = "Resultado y caja";

/* [fijo] — toda la actividad tiene un mismo subtema. */
export const SUBTEMA_FIJO_T3 = {
  "t3-ingreso-o-cobro": INGRESO_Y_COBRO,
  "t3-gasto-o-pago": GASTO_Y_PAGO,
  "t3-cuando-se-causa": CAUSACION,
  "t3-ajuste-acumulado": AJUSTE_ACUMULADO,
  "t3-ajuste-diferido": AJUSTE_DIFERIDO,
  "t3-que-le-toca": REPARTO,
  "t3-del-resultado-a-la-caja": RESULTADO_Y_CAJA,
  "t3-cierre-completo": CIERRE,
};

/*
 * [regla] — del dato del banco al subtema. El mismo hecho, dos empresas va
 * por escenario, y el banco no trae un campo de clase: el escenario es el id
 * del par (`par.id`, que es también su `item` en el detalle). Los cuatro
 * pares caen en uno de los dos escenarios de Miyata; ninguno quedó sin casa.
 */
export const SUBTEMA_REGLA_T3 = {
  "t3-mismo-hecho": { maquina: AJUSTE_ACUMULADO, equipos: AJUSTE_ACUMULADO, arriendo: AJUSTE_DIFERIDO, servicio: AJUSTE_DIFERIDO },
};

/** El subtema de un ítem de T3 por su clave de historial, o lanza: un subtema vacío no puede pasar en silencio. */
export function subtemaDeT3(actividad, item) {
  const fijo = SUBTEMA_FIJO_T3[actividad];
  if (fijo) return fijo;
  const nombre = SUBTEMA_REGLA_T3[actividad]?.[item];
  if (!nombre) throw new Error(`Sin subtema: ${actividad} · ${item}`);
  return nombre;
}
