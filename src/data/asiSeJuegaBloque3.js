import { T1_6, PRIMERO } from "./contabilidadTema1.js";
import { DEBE, HABER, ACTIVO } from "./contabilidad.js";
import { ACTIVIDADES } from "./contabilidadActividades.js";
import { CONSIGNA_TEMA2 } from "./contabilidadConsignas.js";
import { PATRON_A } from "./contabilidadDebitaOAcredita.js";
import { TEXTO_CONFIRMAR as CONFIRMAR_SIMPLE } from "./contabilidadArmaElAsiento.js";
import { TEXTO_CONFIRMAR as CONFIRMAR_COMPUESTO } from "./contabilidadAsientoCompuesto.js";
import { montar as montarDebita } from "../contabilidad/debitaOAcredita.js";
import { montarSuelta as montarCuentaSuelta } from "../contabilidad/saldoDeLaCuenta.js";
import { montarSuelto as montarAsientoSimple } from "../contabilidad/armaElAsiento.js";
import { montarSuelto as montarAsientoCompuesto, estanteDe } from "../contabilidad/asientoCompuesto.js";
import { MAS } from "../contabilidad/cuadroDinamicas.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * «ASÍ SE JUEGA» — BLOQUES 3, 4 Y 5: T1-6 y las siete del Tema 2.
 *
 * Los textos son los de Gen, palabra por palabra: consigna, pasos, ejemplo,
 * resolución y alt. El patrón es el de los bloques 1 y 2: la demo es el
 * componente real con un ejemplo que llega desde afuera, no se puede tocar y
 * no guarda nada. La pantalla le antepone «Ejemplo: » al alt, así que aquí
 * cada alt va sin esa palabra.
 *
 * Los ejemplos de la panadería no están en ningún banco (ids `demo-…`, y hay
 * una prueba que lo comprueba). El Cuadro de Dinámicas es la excepción: sus
 * seis filas son fijas, no admite un ejemplo de afuera, y su demo resuelve la
 * fila de Activos del cuadro de verdad. Lo dijo Gen y así queda.
 *
 * En los arrastres, la mano hace lo mismo que un toque en la partida: toca la
 * ficha (la toma) y toca el destino (la suelta). El componente acepta los dos
 * gestos, y así se ve de dónde a dónde va.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const nombreDe = (id) => ACTIVIDADES.find((a) => a.id === id).nombre;

/* ═══════════════════ T1-6 · ¿EN CUÁL ESTADO APARECE? ═══════════════════ */

export const EJEMPLO_T1_6 = {
  id: "demo-horno-industrial",
  nombre: "Horno industrial",
  informe: PRIMERO,
  seccion: ACTIVO,
  acierto: "✅ Va en el primer informe, en lo que tiene. El horno es de la panadería y le dura años.",
};

const ASI_T1_6 = {
  actividadId: T1_6.id,
  titulo: T1_6.nombre,
  consigna: T1_6.consigna,
  /* ── [ESCRITO POR CLAUDE — PENDIENTE DE FUTABA]: los pasos y el alt, al gesto de un toque (lote 4). ── */
  pasos: [
    "Lee la ficha de arriba.",
    "Toca dónde va: el informe y la parte, en un solo toque.",
    "Mira cómo sube la cuenta de ese destino.",
  ],
  alt: "la ficha «Horno industrial» cae en «Activo», en el estado de situación financiera, y su cuenta sube a 1.",
  demo: { items: [EJEMPLO_T1_6] },
  guion: {
    duracion: 6000,
    toques: [
      { ms: 2000, en: `[data-destino="${PRIMERO}-${ACTIVO}"]` },
    ],
  },
  cuadros: { gesto: 1 },
};

/* ═══════════════════ TEMA 2 · 1 — ¿IZQUIERDA O DERECHA? ═══════════════════ */

export const EJEMPLO_IZQUIERDA = {
  id: "demo-muebles-aumenta",
  /* Sin punto final, como los enunciados del banco («Caja aumenta»). */
  enunciado: "Muebles y enseres aumenta",
  cuenta: "Muebles y enseres",
  categoria: DEBE,
  valorFicha: 1000,
  acierto: "✅ Debe. Muebles y enseres es un activo, y los activos crecen por la izquierda.",
};

const ASI_IZQUIERDA = {
  actividadId: "cu-izquierda-o-derecha",
  titulo: nombreDe("cu-izquierda-o-derecha"),
  consigna: CONSIGNA_TEMA2["cu-izquierda-o-derecha"],
  pasos: [
    "Lee si esa cuenta sube o baja.",
    "Arrastra la ficha al debe o al haber.",
    "El ▲ marca el lado por donde esa cuenta crece.",
  ],
  alt: "la ficha de $1.000 se lleva a la columna «← DEBE» de Muebles y enseres. Después sale el ▲ sobre el debe.",
  demo: { items: [EJEMPLO_IZQUIERDA] },
  guion: {
    duracion: 7000,
    toques: [
      { ms: 2000, en: `[data-ficha="${EJEMPLO_IZQUIERDA.valorFicha}"]` },
      { ms: 4000, en: `[data-destino="${DEBE}"]` },
    ],
  },
  cuadros: { gesto: 1 },
};

/* ═══════════════════ TEMA 2 · 2 — ¿DE QUÉ FAMILIA ES? ═══════════════════ */

export const EJEMPLO_FAMILIA = {
  id: "demo-maquinaria-familia",
  /* El nombre exacto del catálogo (Levi). */
  cuenta: "Maquinaria",
  valor: 3000000,
  seccion: ACTIVO,
  acierto: "✅ Activo. La maquinaria es algo que la panadería tiene.",
};

const ASI_FAMILIA = {
  actividadId: "cu-de-que-familia",
  titulo: nombreDe("cu-de-que-familia"),
  consigna: CONSIGNA_TEMA2["cu-de-que-familia"],
  pasos: [
    "Lee el nombre de la cuenta.",
    "Pregúntate: ¿la empresa la tiene, la debe o es lo que la empresa les reconoce a los socios?",
    "Arrastra la cuenta a esa familia.",
  ],
  alt: "la ficha «Maquinaria · $3.000.000» se arrastra a la sección «ACTIVO» del estado de situación financiera de la panadería.",
  demo: { items: [EJEMPLO_FAMILIA], empresa: "Panadería" },
  guion: {
    duracion: 7000,
    toques: [
      { ms: 2000, en: "[data-ficha]" },
      { ms: 4000, en: `[data-seccion="${ACTIVO}"]` },
    ],
  },
  cuadros: { gesto: 1 },
};

/* ═══════════════════ TEMA 2 · 3 — EL CUADRO DE DINÁMICAS ═══════════════════ */

/*
 * Sin ejemplo propio: las seis filas son fijas. La demo es la fila de Activos
 * del cuadro real. Al tocar «+» el signo se pone enseguida —así funciona la
 * actividad—, y la mano después señala las dos casillas.
 */
const ASI_CUADRO = {
  actividadId: "cu-cuadro-dinamicas",
  titulo: nombreDe("cu-cuadro-dinamicas"),
  consigna: CONSIGNA_TEMA2["cu-cuadro-dinamicas"],
  pasos: [
    "Piensa si esa familia crece por el debe o por el haber.",
    "Toca + o − y queda puesto en la casilla del debe.",
    "La casilla del haber se llena sola, con el signo contrario.",
  ],
  alt: "en la fila «Activos» se pone «+» en la casilla del DEBE, y la del HABER se llena sola con «−».",
  demo: {},
  guion: {
    duracion: 8000,
    toques: [
      { ms: 2000, en: `[data-ficha="${MAS}"]` },
      { ms: 4000, en: `[data-fila="${ACTIVO}"] [data-celda="${DEBE}"]`, senala: true },
      { ms: 5000, en: `[data-fila="${ACTIVO}"] [data-celda="${HABER}"]`, senala: true },
    ],
  },
  cuadros: { gesto: 1 },
};

/* ═══════════════════ TEMA 2 · 4 — ¿SE DEBITA O SE ACREDITA? ═══════════════════ */

/* Pregunta por la contrapartida del ítem del banco (Inventario): la confusión más común. */
export const EJEMPLO_DEBITA = montarDebita({
  id: "demo-harina-cuentas-por-pagar",
  enunciado: "La panadería compra harina a crédito por $500.000.",
  cuenta: "Cuentas por pagar",
  sube: true,
  contrapartida: "Inventario",
  acierto: "✅ Se acredita. La deuda con el proveedor nace, y los pasivos crecen por el haber.",
  patron: PATRON_A,
  /* La ficha vale lo que dice el enunciado. */
  valorFicha: 500000,
});

const ASI_DEBITA = {
  actividadId: "cu-debita-o-acredita",
  titulo: nombreDe("cu-debita-o-acredita"),
  consigna: CONSIGNA_TEMA2["cu-debita-o-acredita"],
  pasos: [
    "Lee la transacción completa.",
    "Mira por qué cuenta te preguntan.",
    "Arrastra la ficha: al debe es debitar, al haber es acreditar.",
  ],
  alt: "la ficha de $500.000 se lleva a la columna «HABER» de Cuentas por pagar. Después sale la cuenta Inventario con su ficha en el «DEBE» y un arco entre las dos.",
  demo: { items: [EJEMPLO_DEBITA] },
  guion: {
    duracion: 8000,
    toques: [
      { ms: 2000, en: `[data-ficha="${EJEMPLO_DEBITA.valorFicha}"]` },
      { ms: 4000, en: `[data-destino="${HABER}"]` },
    ],
  },
  cuadros: { gesto: 1 },
};

/* ═══════════════════ TEMA 2 · 5 — EL SALDO DE LA CUENTA ═══════════════════ */

export const EJEMPLO_SALDO = montarCuentaSuelta({
  id: "demo-caja-panaderia",
  cuenta: "Caja",
  empresa: "La panadería",
  debitos: [{ valor: 800000 }, { valor: 200000 }],
  creditos: [{ valor: 300000 }],
});

const ASI_SALDO = {
  actividadId: "cu-saldo-de-la-cuenta",
  titulo: nombreDe("cu-saldo-de-la-cuenta"),
  consigna: CONSIGNA_TEMA2["cu-saldo-de-la-cuenta"],
  pasos: [
    "Suma cada columna de la cuenta por separado.",
    "Escribe el saldo: la diferencia entre las dos sumas.",
    "Toca el lado de la columna que sumó más.",
  ],
  alt: "en la cuenta Caja de la panadería se escribe «$700.000» y se toca «Debe». Queda el saldo del lado del debe.",
  demo: { items: [EJEMPLO_SALDO] },
  guion: {
    duracion: 7500,
    toques: [
      { ms: 2000, en: "input", escribe: "700.000" },
      { ms: 4000, texto: "Debe" },
      { ms: 5000, texto: "Responder" },
    ],
  },
  cuadros: { gesto: 1 },
};

/* ═══════════════════ TEMA 2 · 6 — ARMA EL ASIENTO ═══════════════════ */

export const EJEMPLO_ASIENTO_SIMPLE = {
  a: montarAsientoSimple({
    id: "demo-horno-en-efectivo",
    texto: "La panadería compró un horno de $3.000.000 y lo pagó en efectivo.",
    asiento: { debe: [["Maquinaria", 3000000]], haber: [["Caja", 3000000]] },
    anclajes: { "Maquinaria": "un horno", "Caja": "en efectivo" },
  }),
  /* Los seis nombres de Gen, en su orden. */
  banco: ["Maquinaria", "Caja", "Bancos", "Cuentas por pagar", "Aportes sociales", "Muebles y enseres"],
};

const ASI_ASIENTO_SIMPLE = {
  actividadId: "cu-arma-el-asiento",
  titulo: nombreDe("cu-arma-el-asiento"),
  consigna: CONSIGNA_TEMA2["cu-arma-el-asiento"],
  pasos: [
    "Lee la transacción y busca las dos cuentas.",
    "Toca un nombre y después la cuenta donde va.",
    "Toca el valor y después el lado de su cuenta.",
  ],
  alt: "se toca «Maquinaria» y después la primera cuenta, y «Caja» y después la segunda. Se toca cada valor y después su lado: el «DEBE» de Maquinaria y el «HABER» de Caja. Al confirmar se traza el arco.",
  demo: { items: [EJEMPLO_ASIENTO_SIMPLE] },
  guion: {
    duracion: 9000,
    toques: [
      { ms: 1500, en: '[data-ficha="Maquinaria"]' },
      { ms: 2300, en: '[data-destino="nombre:0"]' },
      { ms: 3000, en: '[data-ficha="Caja"]' },
      { ms: 3800, en: '[data-destino="nombre:1"]' },
      { ms: 4500, en: '[data-ficha-valor="0"] button' },
      { ms: 5300, en: `[data-destino="0:${DEBE}"]` },
      { ms: 6000, en: '[data-ficha-valor="1"] button' },
      { ms: 6800, en: `[data-destino="1:${HABER}"]` },
      { ms: 7500, texto: CONFIRMAR_SIMPLE },
    ],
  },
  cuadros: { gesto: 2 },
};

/* ═══════════════════ TEMA 2 · 7 — EL ASIENTO COMPUESTO ═══════════════════ */

const ASIENTO_COMPUESTO = montarAsientoCompuesto({
  id: "demo-horno-mitad-credito",
  texto: "La panadería compró un horno de $3.000.000. Pagó $1.000.000 en efectivo y el resto a crédito.",
  asiento: { debe: [["Maquinaria", 3000000]], haber: [["Caja", 1000000], ["Cuentas por pagar", 2000000]] },
  anclajes: { "Maquinaria": "un horno", "Caja": "en efectivo", "Cuentas por pagar": "a crédito" },
  acierto: "✅ Tres cuentas, y lo que cuadra son los totales: $3.000.000 al debe contra $3.000.000 al haber. Un activo entra; se paga una parte y se debe el resto.",
});

export const EJEMPLO_ASIENTO_COMPUESTO = {
  a: ASIENTO_COMPUESTO,
  /* El estante de siempre (las del asiento y señuelos), en orden alfabético: fijo y sin delatar nada. */
  estante: estanteDe(ASIENTO_COMPUESTO).sort((x, y) => x.localeCompare(y, "es")),
};

const ASI_ASIENTO_COMPUESTO = {
  actividadId: "cu-asiento-compuesto",
  titulo: nombreDe("cu-asiento-compuesto"),
  consigna: CONSIGNA_TEMA2["cu-asiento-compuesto"],
  pasos: [
    "Lee la transacción y cuenta cuántas cuentas se mueven.",
    "Saca cada cuenta al debe o al haber y escribe su valor.",
    "Revisa que los totales den igual: solo hay un intento.",
  ],
  alt: "se sacan «Maquinaria» al debe con $3.000.000, y «Caja» con $1.000.000 y «Cuentas por pagar» con $2.000.000 al haber. La diferencia llega a cero.",
  demo: { items: [EJEMPLO_ASIENTO_COMPUESTO] },
  guion: {
    duracion: 9500,
    toques: [
      { ms: 1500, en: `[data-sacar="Maquinaria:${DEBE}"]` },
      { ms: 2200, en: '[data-en-mesa="Maquinaria"] input', escribe: "3.000.000" },
      { ms: 3500, en: `[data-sacar="Caja:${HABER}"]` },
      { ms: 4200, en: '[data-en-mesa="Caja"] input', escribe: "1.000.000" },
      { ms: 5500, en: `[data-sacar="Cuentas por pagar:${HABER}"]` },
      { ms: 6200, en: '[data-en-mesa="Cuentas por pagar"] input', escribe: "2.000.000" },
      { ms: 7300, en: "[data-conector]", senala: true },
      { ms: 8000, texto: CONFIRMAR_COMPUESTO },
    ],
  },
  cuadros: { gesto: 2 },
};

/** Por id de actividad. */
export const ASI_SE_JUEGA_BLOQUE3 = Object.fromEntries(
  [ASI_T1_6, ASI_IZQUIERDA, ASI_FAMILIA, ASI_CUADRO, ASI_DEBITA, ASI_SALDO, ASI_ASIENTO_SIMPLE, ASI_ASIENTO_COMPUESTO]
    .map((a) => [a.actividadId, a]),
);
