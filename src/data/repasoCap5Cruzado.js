import { pesos } from "./contabilidad.js";
import { barajar } from "../utils/barajar.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * REPASO DEL CAPÍTULO 5 · r5-1 «Repaso cruzado» (Célula E).
 *
 * El bloque C, ejercicios 3, 5, 6, 8, 9 y 10, pp. 264-266. Seis preguntas de
 * selección única, una por pantalla, que saltan de tema a propósito.
 *
 * Fuente de verdad: el paquete aprobado
 * orquestador/conocimiento/paquetes/e5-r5-1-v1.md (rama
 * feat/conta-e5-r5-1-paquete). Contenido de Miyata, diseño de Itagaki,
 * mecánica y FP de Kamogawa. Todo texto que lee el estudiante va aquí y va
 * LITERAL: si algo no encaja, se para y se reporta, no se reescribe.
 *
 * Las cifras de las pantallas 4 y 5 se guardan como números y su texto se
 * forma con ellos; la prueba calcula las claves desde los datos.
 *
 * Aquí vive también la lógica sin React (preparar, evaluar, puntuar, la
 * etiqueta del panel docente), como hacen los Hacer de T7 en su par de
 * archivos: la Célula E escribe solo en src/data/repasoCap5*.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ LA FICHA ═══════════ */

export const R5_1 = {
  id: "r5-1",
  nombre: "Repaso cruzado",
  /* Kamogawa: medio, 25 FP, evaluativa. FP = 25 × % de aciertos. */
  dificultad: "medio",
  fpBase: 25,
  modalidad: "evaluativa",
  objetivo: "Son seis preguntas del capítulo 5. Saltan de tema a propósito. Comprueba lo que sabes.",
};

/* Los textos de interfaz que da el paquete. */
export const INTERFAZ_R5_1 = {
  progreso: (n, total) => `PREGUNTA ${n} DE ${total}`,
  siguiente: "Siguiente",
  porTema: "POR TEMA",
  marcaDebe: "DEBE",
  marcaHaber: "HABER",
  vendidas: (u) => `Vendidas · ${u} u`,
  leyendaCajas: "Cada caja = 10 u",
  unidadesACosto: (u, c) => `${u} u a ${pesos(c)}`,
  nDeM: (n, m) => `${n} de ${m}`,
  /* v1.3 · autodiagnóstico (Kamogawa): la pista se pide y la cuenta se ve. */
  verPista: "Ver pista",
  marcaPista: "PISTA",
  noEntra: "no entra",
  marcaCuenta: "LA CUENTA",
  tenias: (u, total) => `Tenías ${u} u por ${pesos(total)}`,
  cadaUna: (total, u, promedio) => `Cada una: ${pesos(total)} ÷ ${u} = ${promedio}`,
  quedan: (u, promedio, valor) => `Quedan ${u} u × ${promedio} = ${pesos(valor)}`,
};

/*
 * Lo que el paquete no trae y la vista necesita: el aviso que oye el lector de
 * pantalla delante de la devolución (las mismas palabras que Retro de
 * corazon/juego.jsx).
 * [ESCRITO POR CLAUDE — PENDIENTE DE REVISIÓN]
 */
export const PENDIENTE_DE_REVISION_R5_1 = {
  lectorAcierto: "Correcto: ",
  lectorError: "Incorrecto: ",
};

/* 1 caja = 10 u (Itagaki, pantalla 5). */
export const UNIDADES_POR_CAJA = 10;

/* ═══════════ LOS TRES SUBTEMAS (etiqueta del panel docente y escena) ═══════════ */

export const SUBTEMAS = {
  inversiones: { id: "inversiones", nombre: "Inversiones", escena: "titulo-valor" },
  cartera: { id: "cartera", nombre: "Cartera", escena: "facturas" },
  inventarios: { id: "inventarios", nombre: "Inventarios", escena: "bodega" },
};
/* El orden de las filas del bloque «POR TEMA». */
export const ORDEN_SUBTEMAS = ["inversiones", "cartera", "inventarios"];

/* ═══════════ LAS CUENTAS DE LAS PANTALLAS 2 Y 6 (grafía publicada) ═══════════ */

const GASTO = "Gasto provisiones – cuentas incobrables";
const PROVISION = "Provisión para deudas incobrables";
const CLIENTES = "Cuentas por cobrar – clientes";
const INVENTARIO = "Inventario de mercancías";
const GYP = "Ganancias y pérdidas";
const CMV = "Costo de mercancía vendida";

const asiento = (debe, haber) => ({ debe, haber });

/* ═══════════ LOS DATOS DE LAS PANTALLAS 4 Y 5 ═══════════ */

/* Pantalla 4: en el orden del estado de resultados (Itagaki, confirmado por Kamogawa). */
/*
 * `signo` dice cómo entra cada dato al costo (v1.3): «+» suma, «−» resta y
 * null no entra. Solo se ve después de responder; antes, apartarlos
 * regalaría la respuesta. La prueba saca 3.400 de aquí.
 */
const DATOS_C8 = [
  { id: "ventas", etiqueta: "Ventas", valor: 11400, signo: null },
  { id: "devoluciones-ventas", etiqueta: "Devoluciones de ventas", valor: 1000, signo: null },
  { id: "inventario-inicial", etiqueta: "Inventario inicial", valor: 500, signo: "+" },
  { id: "compras", etiqueta: "Compras", valor: 4000, signo: "+" },
  { id: "devoluciones-compras", etiqueta: "Devoluciones de compras", valor: 300, signo: "−" },
  { id: "inventario-final", etiqueta: "Inventario final", valor: 800, signo: "−" },
];

/* Pantalla 5: el inventario inicial primero, como ocurre en el tiempo (Miyata). */
const LOTES_C9 = [
  { marca: "Lote 1 · Al inicio", unidades: 70, costo: 18 },
  { marca: "Lote 2 · Primera compra", unidades: 100, costo: 20 },
  { marca: "Lote 3 · Segunda compra", unidades: 80, costo: 25 },
];
const VENDIDAS_C9 = 225;

/* ═══════════ LAS SEIS PANTALLAS, EN EL ORDEN DEL LIBRO ═══════════ */

/*
 * El id de cada opción lleva la letra del libro (a-d), que es también el
 * orden en que el paquete las lista. En pantalla se barajan en cada intento.
 * `forma` dice cómo se pinta la opción: texto, asiento (pantallas 2 y 6),
 * fila de tres celdas (pantalla 3) o cifra (pantallas 4 y 5).
 */
export const PANTALLAS_R5_1 = [
  {
    id: "c3",
    ejercicio: "C.3",
    pagina: "p. 264",
    subtema: "inversiones",
    forma: "texto",
    enunciado: "Hay inversiones de renta fija que se compran con descuento. ¿Qué las define?",
    opciones: [
      { id: "c3-a", texto: "Pagan un interés fijo durante un periodo determinado.", retro: "Eso describe las inversiones con interés: pagan un porcentaje fijo cada periodo. Las de descuento ganan de otra forma. Compras por debajo y al vencer te pagan más." },
      { id: "c3-b", texto: "Lo que ganan depende de cómo le vaya a quien emite el título.", retro: "Eso no es renta fija. En renta fija, lo que ganas no depende de cómo le vaya a quien emite el título." },
      { id: "c3-c", correcta: true, texto: "Dan una renta por la diferencia entre el valor de compra y el valor de redención.", retro: "Exacto. Pagas menos de lo que te devolverán al vencer. Esa diferencia es tu ganancia." },
      { id: "c3-d", texto: "Dan una renta constante, que se pacta cuando se hace la inversión.", retro: "Es cierto, pero vale para toda la renta fija, no solo para las de descuento. La pregunta pide lo que las distingue." },
    ],
    pista: "Varias opciones son ciertas de alguna renta fija. Busca la que solo vale para las de descuento.",
  },
  {
    id: "c5",
    ejercicio: "C.5",
    pagina: "pp. 264-265",
    subtema: "cartera",
    forma: "asiento",
    enunciado: "La empresa usa el método de provisión. Un cliente no va a pagar y su deuda se castiga. ¿Cómo se registra ese castigo?",
    opciones: [
      { id: "c5-a", asiento: asiento(GASTO, CLIENTES), retro: "Así se castiga sin provisión. Con provisión, el gasto ya se registró antes, al cierre. Si lo registras otra vez, el gasto queda contado dos veces." },
      { id: "c5-b", asiento: asiento(GASTO, PROVISION), retro: "Este asiento crea la provisión al cierre del periodo. Es el paso de antes. Al castigar, la provisión ya existe y ahora se usa." },
      { id: "c5-c", correcta: true, asiento: asiento(PROVISION, CLIENTES), retro: "Bien. La provisión se creó para este momento. Ahora la usas contra la deuda: bajan la provisión y la cartera. El gasto no se toca." },
      { id: "c5-d", asiento: asiento(CLIENTES, GASTO), retro: "Va al revés: sube la cartera y baja el gasto. Castigar es sacar la deuda de la cartera. Por eso Cuentas por cobrar va al haber." },
    ],
    pista: "¿El gasto de esta deuda ya se registró antes? Si es así, no debe aparecer de nuevo.",
  },
  {
    id: "c6",
    ejercicio: "C.6",
    pagina: "p. 265",
    subtema: "inventarios",
    forma: "tabla",
    enunciado: "Los precios de compra han venido subiendo. Frente a los otros métodos, ¿qué muestra PEPS (primeras en entrar, primeras en salir)?",
    columnas: ["Inventario final", "Costo de mercancía vendida", "Utilidad"],
    opciones: [
      { id: "c6-a", celdas: ["Más bajo", "Más bajo", "Mayor"], retro: "El fallo está en el inventario. Con PEPS sale primero lo viejo, que es lo barato. Lo caro y reciente se queda en bodega, así que el inventario queda alto." },
      { id: "c6-b", celdas: ["Más alto", "Más alto", "Menor"], retro: "Inventario y costo no pueden subir juntos. Los dos se reparten la misma mercancía disponible. Lo que no queda en bodega pasó al costo: si uno sube, el otro baja." },
      { id: "c6-c", correcta: true, celdas: ["Más alto", "Más bajo", "Mayor"], retro: "Correcto. Sale primero lo barato: el costo de lo vendido baja y la utilidad sube. Lo caro queda en bodega: el inventario queda alto." },
      { id: "c6-d", celdas: ["Más bajo", "Más bajo", "Menor"], retro: "Aquí hay dos fallos. PEPS deja en bodega lo más caro, así que el inventario no queda bajo. Y si el costo baja, la utilidad sube, no baja." },
    ],
    pista: "Imagina una tienda que vende primero las latas viejas, que compró más baratas. ¿Qué latas quedan en el estante?",
  },
  {
    id: "c8",
    ejercicio: "C.8",
    pagina: "p. 265",
    subtema: "inventarios",
    forma: "cifra",
    enunciado: "Una empresa tiene estos datos del periodo. ¿Cuál es el Costo de mercancía vendida?",
    datos: DATOS_C8,
    opciones: [
      { id: "c8-a", correcta: true, valor: 3400, retro: "Bien. Lo que tú tenías para vender era $4.200. De eso, quedaron $800 en la bodega. Lo que sí vendiste costó $3.400. Las ventas no van aquí." },
      { id: "c8-b", valor: 2400, retro: "Restaste las devoluciones de ventas. Esas no tocan el costo: afectan las ventas. El costo solo usa inventarios, compras y devoluciones de compras." },
      { id: "c8-c", valor: 6400, retro: "Esa cifra es imposible. Lo más que pudiste vender es lo que tenías disponible: 500 + 4.000 − 300 = $4.200. Ningún costo de lo vendido pasa de ahí. Revisa si usaste las ventas: no entran al cálculo." },
      { id: "c8-d", valor: 6000, retro: "Esta cifra también pasa del disponible ($4.200), así que no puede ser. Revisa dos cosas. El inventario final se resta: es lo que no se vendió. Y las devoluciones de ventas no entran al costo." },
    ],
    pista: "Separa los datos en dos grupos: los de comprar y guardar, y los de vender. Solo un grupo sirve.",
  },
  {
    id: "c9",
    ejercicio: "C.9",
    pagina: "p. 266",
    subtema: "inventarios",
    forma: "cifra",
    enunciado: "Mira los datos del periodo. Usa el promedio ponderado. ¿Cuánto vale el inventario final?",
    lotes: LOTES_C9,
    vendidas: VENDIDAS_C9,
    opciones: [
      { id: "c9-a", valor: 625, retro: "Valoraste las 25 unidades con la última compra ($25). Eso es lo que daría PEPS. El promedio ponderado mezcla todos los costos." },
      { id: "c9-b", valor: 450, retro: "Valoraste las 25 unidades con el precio más viejo ($18). Eso es lo que daría UEPS. El promedio ponderado mezcla todos los costos." },
      { id: "c9-c", valor: 525, retro: "Usaste $21, el promedio simple de los tres precios. Pero no compraste la misma cantidad a cada precio. El ponderado pesa cada precio por sus unidades." },
      { id: "c9-d", correcta: true, valor: 526, retro: "Bien. Todo te costó $5.260. Eran 250 en total. Así, cada una vale $21,04. Te quedan 25. Y 25 por $21,04 da $526." },
    ],
    pista: "¿Cuántas unidades tuviste? ¿Y cuánto te costaron todas?",
  },
  {
    id: "c10",
    ejercicio: "C.10",
    pagina: "p. 266",
    subtema: "inventarios",
    forma: "asiento",
    enunciado: "La empresa usa inventario periódico. Al cierre hay que sacar de los libros el inventario inicial. ¿Con qué registro se hace?",
    opciones: [
      { id: "c10-a", asiento: asiento(INVENTARIO, GYP), retro: "Ese asiento pone en los libros el inventario final. Es el paso contrario. Si el inventario va al debe, sube, y aquí queremos sacarlo." },
      { id: "c10-b", asiento: asiento(INVENTARIO, CMV), retro: "Con el inventario en el debe, el inventario sube. Para sacarlo de los libros, va al haber." },
      { id: "c10-c", correcta: true, asiento: asiento(GYP, INVENTARIO), retro: "Correcto. El inventario inicial sale por el haber y pasa a Ganancias y pérdidas. Ahí entra como parte del costo del periodo." },
      { id: "c10-d", asiento: asiento(CMV, INVENTARIO), retro: "Vas bien con el haber: así sale el inventario. El fallo está en la otra cuenta. En el cierre que vimos, el inventario inicial va a Ganancias y pérdidas." },
    ],
    pista: "Para sacar un activo de los libros, ¿va al debe o al haber?",
  },
];

/* ═══════════ LA LÓGICA, SIN REACT ═══════════ */

export const TOTAL_R5_1 = PANTALLAS_R5_1.length;

/* El rótulo de la fila final de la pantalla 4: la cuenta que se pidió. */
export const RESULTADO_C8 = CMV;

/* Pesos con dos decimales y coma: 21,04 → «$21,04». */
export function pesosConCentavos(valor) {
  const centavos = Math.round(valor * 100);
  return `${pesos(Math.trunc(centavos / 100))},${String(centavos % 100).padStart(2, "0")}`;
}

/* La cuenta de la pantalla 4, desde los signos de los datos. */
export function cuentaDeC8(pantalla) {
  return pantalla.datos.reduce((t, d) => t + (d.signo === "+" ? d.valor : d.signo === "−" ? -d.valor : 0), 0);
}

/* La cuenta de la pantalla 5, desde los lotes: lo que se tuvo, el promedio y lo que queda. */
export function cuentaDeC9(pantalla) {
  const unidades = pantalla.lotes.reduce((t, l) => t + l.unidades, 0);
  const total = pantalla.lotes.reduce((t, l) => t + l.unidades * l.costo, 0);
  const quedan = unidades - pantalla.vendidas;
  const promedio = total / unidades;
  return { unidades, total, promedio, quedan, valor: Math.round(quedan * promedio) };
}

/* El texto de una opción, como lo lee quien no ve la pantalla. */
export function textoDeOpcion(pantalla, opcion) {
  if (opcion.asiento) return `${INTERFAZ_R5_1.marcaDebe} · ${opcion.asiento.debe}. ${INTERFAZ_R5_1.marcaHaber} · ${opcion.asiento.haber}`;
  if (opcion.celdas) return pantalla.columnas.map((c, k) => `${c}: ${opcion.celdas[k]}`).join(" · ");
  if (opcion.valor !== undefined) return pesos(opcion.valor);
  return opcion.texto;
}

export const claveDe = (pantalla) => pantalla.opciones.find((o) => o.correcta);

/*
 * Las seis pantallas en su orden fijo, cada una con sus opciones barajadas.
 * `anterior` es la tanda de antes (o nada en el primer intento): el orden de
 * cada pantalla sale distinto del que tuvo la vez anterior, y en el primer
 * intento distinto del orden del libro. Así la clave nunca vuelve al mismo
 * sitio por costumbre.
 *
 * `barajador` es `barajar` (al azar) en la partida; la prueba le pasa uno con
 * semilla fija (`barajadorDe`), para que sea reproducible (v1.1, Takamura).
 * Es la misma idea de `barajarDistinto`, con el barajador inyectado.
 */
function distinto(xs, antes, barajador) {
  const huella = (lista) => lista.map((o) => o.id).join("|");
  for (let intento = 0; intento < 12; intento++) {
    const c = barajador(xs);
    if (huella(c) !== huella(antes)) return c;
  }
  /* Salida de emergencia: rotar garantiza un orden distinto. */
  return [...antes.slice(1), antes[0]];
}

export function prepararR5_1(anterior = null, barajador = barajar) {
  return PANTALLAS_R5_1.map((p) => {
    const antes = anterior?.find((x) => x.id === p.id)?.opciones ?? p.opciones;
    return { ...p, opciones: distinto(p.opciones, antes, barajador) };
  });
}

export function evaluarR5_1(pantalla, opcionId) {
  const elegida = pantalla.opciones.find((o) => o.id === opcionId) ?? null;
  const clave = claveDe(pantalla);
  return { ok: Boolean(elegida?.correcta), elegida: elegida?.id ?? null, correcta: clave.id, texto: elegida?.retro ?? null };
}

/* Evaluativa: aciertos / 6 × 100; el motor escala los 25 FP. */
export const puntuarR5_1 = (aciertos, total = TOTAL_R5_1) => (total ? (aciertos / total) * 100 : 0);

/* Las filas del bloque «POR TEMA»: un punto por pregunta, en orden. */
export function porTema(resultados) {
  return ORDEN_SUBTEMAS.map((s) => {
    const puntos = PANTALLAS_R5_1.filter((p) => p.subtema === s).map((p) => ({ id: p.id, ok: Boolean(resultados[p.id]) }));
    return { ...SUBTEMAS[s], puntos, bien: puntos.filter((x) => x.ok).length, total: puntos.length };
  });
}

/* El panel docente: cada pantalla por su subtema y su enunciado. */
export function unidadDeR5_1(id) {
  const p = PANTALLAS_R5_1.find((x) => x.id === String(id));
  return p ? `${SUBTEMAS[p.subtema].nombre} · ${p.enunciado}` : null;
}
