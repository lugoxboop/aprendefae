import { T6_ACT2, REGLAS_T6_ACT2, PROVISION_2007_T6_ACT2, ALT_TUTORIAL_T6_ACT2, GASTO, PROVISION } from "./contabilidadT6Act2.js";
import { T6_ACT3, REGLAS_T6_ACT3, CASTIGO_T6_ACT3, ALT_TUTORIAL_T6_ACT3, CLIENTES } from "./contabilidadT6Act3.js";
import { T6_ACT1, REGLAS_T6_ACT1, FICHAS_T6_ACT1, CAJONES_T6_ACT1, CLIENTES as A_CLIENTES, ACREDITA } from "./contabilidadT6Act1.js";
import { T6_ACT4, REGLAS_T6_ACT4, EJEMPLO_T6_ACT4 } from "./contabilidadT6Act4.js";
import { T6_ACT5, REGLAS_T6_ACT5, CASILLAS_T6_ACT5 } from "./contabilidadT6Act5.js";
import { T6_ACT6, REGLAS_T6_ACT6, GRUPOS_T6_ACT6 } from "./contabilidadT6Act6.js";
import { pegarPorcentaje } from "../contabilidad/t6Pieza5.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» DEL TEMA 6 DE CONTABILIDAD (Célula B).
 *
 * El componente de siempre, sin cambios, como el cierre de T5. El tutorial
 * de cada mesa es su ejemplo resuelto, fuera de las partes y sin diario: la
 * mano arma el asiento, lo confirma y queda la explicación de Futaba en
 * cuatro líneas.
 *   · b5-t6-a2: la provisión del 31 de diciembre de 2007 (p. 202).
 *   · b5-t6-a3: el castigo de marzo (p. 204), punto de partida de los casos.
 *
 * El texto alternativo es el de Futaba sin «Ejemplo resuelto.», porque el
 * componente compartido ya antepone «Ejemplo:».
 *
 * b5-t6-a1 (auditoría integral de Shoko, 15-oct): como b5-t5-a1, el patrón
 * de T1-6, para que sus tres reglas aprobadas se vean. La ficha de la demo
 * es una del banco (el pago del cliente) con su acierto aprobado, y abre los
 * dos niveles. El texto alternativo se arma con los rótulos de los botones.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const guion = (debe, haber, cifra) => ({
  duracion: 12000,
  toques: [
    { ms: 1500, en: `[data-sacar="${debe}:debe"]` },
    { ms: 2700, en: `[data-campo-cifra="${debe}"]`, escribe: cifra },
    { ms: 4800, en: `[data-sacar="${haber}:haber"]` },
    { ms: 6000, en: `[data-campo-cifra="${haber}"]`, escribe: cifra },
    { ms: 8100, en: '[data-confirmar-parte="1"]' },
  ],
});

const ASI_PROVISION = {
  actividadId: T6_ACT2.id,
  titulo: T6_ACT2.nombre,
  consigna: T6_ACT2.consigna,
  pasos: REGLAS_T6_ACT2,
  alt: ALT_TUTORIAL_T6_ACT2.replace(/^Ejemplo resuelto\. /, ""),
  demo: { items: [PROVISION_2007_T6_ACT2] },
  guion: guion(GASTO, PROVISION, "148800"),
  cuadros: { gesto: 4 },
};

const ASI_DEUDA_QUE_VUELVE = {
  actividadId: T6_ACT3.id,
  titulo: T6_ACT3.nombre,
  consigna: T6_ACT3.consigna,
  pasos: REGLAS_T6_ACT3,
  alt: ALT_TUTORIAL_T6_ACT3.replace(/^Ejemplo resuelto\. /, ""),
  demo: { items: [CASTIGO_T6_ACT3] },
  guion: guion(PROVISION, CLIENTES, "180000"),
  cuadros: { gesto: 4 },
};

/* b5-t6-a1: la ficha del pago, Clientes que se acredita. Lote 6a: la mano toca su cajón, que la coloca. */
export const DEMO_T6_ACT1 = FICHAS_T6_ACT1.find((f) => f.id === "pago");
const CAJON_DEMO_T6 = CAJONES_T6_ACT1.find((k) => k.cuenta === A_CLIENTES && k.lado === ACREDITA);
const ASI_CLIENTES_O_OTRA = {
  actividadId: T6_ACT1.id,
  titulo: T6_ACT1.nombre,
  consigna: T6_ACT1.consigna,
  pasos: REGLAS_T6_ACT1,
  /* PARA SHOKO: la misma frase de antes con un solo destino. */
  alt: `la ficha «${DEMO_T6_ACT1.texto}» va en «${CAJON_DEMO_T6.rotulo}».`,
  demo: { items: [DEMO_T6_ACT1] },
  guion: { duracion: 7500, toques: [{ ms: 2500, en: `[data-cajon="${A_CLIENTES}/${ACREDITA}"]` }] },
  cuadros: { gesto: 1 },
};

/*
 * ═══════════ LOS HACER NUEVOS (b5-t6-a4 a b5-t6-a6) ═══════════
 *
 * Cada «Así se juega» lleva las tres reglas aprobadas y un ejemplo resuelto.
 * Los ejemplos se arman SOLO con textos que ya existen: el tutorial de Futaba,
 * los nombres de los grupos y las cifras de la propia historia. La hoja corta
 * de Mai puede cambiarlos.
 *   · a4: el hecho del tutorial, fuera del banco; la mano toca el gasto.
 *   · a5: el punto de partida de 2007; la mano toca el saldo de la provisión
 *     ($148.800), entre dos cifras de la misma historia.
 *   · a6: la deuda de nueve meses del tutorial; la mano toca su grupo.
 * (b5-t6-a7 se retiró en el lote 4, y con él su «Así se juega».)
 */
const unToque = (en) => ({ duracion: 7500, toques: [{ ms: 2500, en }] });

const ASI_QUE_SE_DEBITA = {
  actividadId: T6_ACT4.id,
  titulo: T6_ACT4.nombre,
  consigna: T6_ACT4.consigna,
  pasos: REGLAS_T6_ACT4,
  alt: `${EJEMPLO_T6_ACT4.texto} ${EJEMPLO_T6_ACT4.acierto}`,
  demo: { items: [EJEMPLO_T6_ACT4] },
  guion: unToque(`[data-opcion="${EJEMPLO_T6_ACT4.respuesta}"]`),
  cuadros: { gesto: 1 },
};

/* a5: la casilla del tutorial; sus tres cifras son de la misma historia (pp. 200-202). */
const cifrasDe = (t) => [...t.matchAll(/\$(\d{1,3}(?:\.\d{3})*)/g)].map((m) => Number(m[1].replace(/\./g, "")));
const [DEBEN_2007, , SALDO_2007] = cifrasDe(T6_ACT5.partida);
export const EJEMPLO_T6_ACT5 = {
  id: "b5-t6-a5-tutorial",
  enunciado: T6_ACT5.partida.slice(0, T6_ACT5.partida.indexOf(" Al crear")),
  opciones: [{ valor: SALDO_2007, tipo: null }, { valor: DEBEN_2007, tipo: "T1" }, { valor: CASILLAS_T6_ACT5[0].opciones[0].valor, tipo: "T2" }],
  resolucion: T6_ACT5.partida.slice(T6_ACT5.partida.indexOf("Al crear")),
};
const ASI_CUENTA_DE_LA_PROVISION = {
  actividadId: T6_ACT5.id,
  titulo: T6_ACT5.nombre,
  consigna: T6_ACT5.consigna,
  pasos: REGLAS_T6_ACT5,
  alt: T6_ACT5.partida,
  demo: { items: [EJEMPLO_T6_ACT5] },
  guion: unToque(`[data-opcion="${SALDO_2007}"]`),
  cuadros: { gesto: 1 },
};

/* a6: la deuda de nueve meses del tutorial; las opciones, los cuatro grupos. */
const GRUPO_TUTORIAL = GRUPOS_T6_ACT6.find((g) => g.id === "g3").nombre;
export const EJEMPLO_T6_ACT6 = {
  id: "b5-t6-a6-tutorial",
  enunciado: T6_ACT6.partida.slice(0, T6_ACT6.partida.indexOf(":")),
  opciones: GRUPOS_T6_ACT6.map((g) => ({ texto: g.nombre, tipo: g.nombre === GRUPO_TUTORIAL ? null : "G0" })),
  resolucion: pegarPorcentaje(T6_ACT6.partida),
};
const ASI_PROVISION_POR_EDADES = {
  actividadId: T6_ACT6.id,
  titulo: T6_ACT6.nombre,
  consigna: T6_ACT6.consigna,
  pasos: REGLAS_T6_ACT6,
  alt: T6_ACT6.partida,
  demo: { items: [EJEMPLO_T6_ACT6] },
  guion: unToque(`[data-opcion="${GRUPO_TUTORIAL}"]`),
  cuadros: { gesto: 1 },
};

export const ASI_SE_JUEGA_TEMA6 = {
  [ASI_PROVISION.actividadId]: ASI_PROVISION,
  [ASI_DEUDA_QUE_VUELVE.actividadId]: ASI_DEUDA_QUE_VUELVE,
  [ASI_CLIENTES_O_OTRA.actividadId]: ASI_CLIENTES_O_OTRA,
  [ASI_QUE_SE_DEBITA.actividadId]: ASI_QUE_SE_DEBITA,
  [ASI_CUENTA_DE_LA_PROVISION.actividadId]: ASI_CUENTA_DE_LA_PROVISION,
  [ASI_PROVISION_POR_EDADES.actividadId]: ASI_PROVISION_POR_EDADES,
};
