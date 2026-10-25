import { DEBE, HABER } from "./contabilidad.js";
import { CONSIGNA_T2_NUEVAS, FICHAS_T2_NUEVAS } from "./contabilidadT2HacerNuevas.js";
/* El texto del botón de CampoCifra en estas piezas (COMPROBAR_B de b5/Devolucion.jsx). */
const COMPROBAR_B = "Comprobar";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» DE LAS TRES HACER NUEVAS DE T2 (Célula C, lote T2-2, #471).
 *
 * Mismo patrón que el bloque 3: la demo es el componente real en modoDemo con
 * un ejemplo que llega desde afuera (ids `demo-…`, que no están en ningún
 * banco), no se puede tocar y no guarda nada.
 *
 * La consigna de cada uno es el «Así se juega» de Near (delta T2-9), letra
 * por letra.
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION — muestra hasta el banco de Near (lote T2-2)
 * Solo pasos, alt y ejemplos: Near no los trae (ni en T2-2 ni en T2-9).
 * Lote T2-3: pasados de mes a año, como el banco.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const nombreDe = (id) => FICHAS_T2_NUEVAS.find((f) => f.id === id).nombre;

export const EJEMPLO_CUADRA = {
  id: "demo-cpv-horno", tipo: "completar", fuente: "demo",
  lineas: [
    { cuenta: "Maquinaria", lado: DEBE, monto: 3000000 },
    { cuenta: "Caja", lado: HABER, monto: 1000000 },
    { cuenta: "Cuentas por pagar", lado: HABER, monto: null },
  ],
  correcta: 2000000,
  distractores: [],
  porque: "Una cuenta en el debe y dos en el haber, y las dos columnas llegan a $3.000.000.",
};

const ASI_CUADRA = {
  actividadId: "cu-cuadra-por-valor",
  titulo: nombreDe("cu-cuadra-por-valor"),
  consigna: CONSIGNA_T2_NUEVAS["cu-cuadra-por-valor"],
  pasos: [
    "Mira las dos columnas: crecen con el valor, no con el número de líneas.",
    "Escribe la cifra que falta, di si cuadra o toca la línea que descuadra.",
    "Solo hay un intento por asiento.",
  ],
  alt: "en el asiento del horno de la panadería se escribe «$2.000.000» para Cuentas por pagar y las dos columnas llegan a la misma altura.",
  demo: { items: [EJEMPLO_CUADRA] },
  guion: {
    duracion: 6500,
    toques: [
      { ms: 1800, en: "input", escribe: "2.000.000" },
      { ms: 3800, texto: COMPROBAR_B },
    ],
  },
  cuadros: { gesto: 1 },
};

const CASO_DIARIO = {
  id: "demo-ddm-panaderia",
  empresa: "La panadería",
  asientos: [
    { fecha: "Mar 1", lineas: [{ cuenta: "Caja", lado: DEBE, monto: 500 }, { cuenta: "Aportes sociales", lado: HABER, monto: 500 }] },
    { fecha: "Mar 5", lineas: [{ cuenta: "Maquinaria", lado: DEBE, monto: 200 }, { cuenta: "Caja", lado: HABER, monto: 200 }] },
  ],
  items: [],
};
export const EJEMPLO_DIARIO = { id: "demo-ddm-1", tipo: "destino", renglon: 3, porque: "Los $200 salen de Caja: van a su haber.", caso: CASO_DIARIO };

const ASI_DIARIO = {
  actividadId: "cu-del-diario-al-mayor",
  titulo: nombreDe("cu-del-diario-al-mayor"),
  consigna: CONSIGNA_T2_NUEVAS["cu-del-diario-al-mayor"],
  pasos: [
    "Lee el renglón marcado en el diario.",
    "Toca la cuenta del mayor donde va. El lado se copia del diario.",
    "A veces es al revés: toca el renglón de la línea encendida.",
  ],
  alt: "el renglón «Mar 5 · Caja · Haber · $200» se lleva a la cuenta Caja del mayor, que ya tenía los $500 del 1 de marzo.",
  demo: { items: [EJEMPLO_DIARIO] },
  guion: {
    duracion: 6000,
    toques: [{ ms: 2500, en: '[data-cuenta-destino="Caja"]' }],
  },
  cuadros: { gesto: 1 },
};

export const EJEMPLO_CERO = [
  { id: "demo-lvc-ventas", nombre: "Ingresos por ventas", clase: "nominal", familia: "ingreso", saldo: 300, porque: "Es un ingreso: mide el año y vuelve a cero." },
  { id: "demo-lvc-caja", nombre: "Caja", clase: "real", familia: "activo", saldo: 600, porque: "Caja es lo que hay: sigue con su saldo." },
];

const ASI_CERO = {
  actividadId: "cu-las-que-vuelven-a-cero",
  titulo: nombreDe("cu-las-que-vuelven-a-cero"),
  consigna: CONSIGNA_T2_NUEVAS["cu-las-que-vuelven-a-cero"],
  pasos: [
    "Mira la cuenta marcada y su saldo del año.",
    "Elige si vuelve a cero en el cierre o pasa al año siguiente con su saldo.",
    "Las que vuelven a cero caen en Ganancias y pérdidas.",
  ],
  alt: "Ingresos por ventas, con $300 en 20X1, vuelve a cero en el cierre: cae en Ganancias y pérdidas y 20X2 empieza en $0.",
  demo: { items: EJEMPLO_CERO },
  guion: {
    duracion: 6000,
    toques: [{ ms: 2500, texto: "Vuelve a cero en el cierre" }],
  },
  cuadros: { gesto: 1 },
};

export const ASI_SE_JUEGA_T2_NUEVAS = {
  "cu-cuadra-por-valor": ASI_CUADRA,
  "cu-del-diario-al-mayor": ASI_DIARIO,
  "cu-las-que-vuelven-a-cero": ASI_CERO,
};
