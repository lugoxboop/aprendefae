/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · T2 POLÍTICA ECONÓMICA — TODOS LOS TEXTOS, TAL CUAL
 *
 * Fuente única: orquestador/conocimiento/macro-2026/disenos/t2-politica-economica.md
 * (Gen, 22-nov) y el anexo de fichas/2-politica-economica.md (los 43
 * enunciados del taller). Ninguna pieza escribe un texto a mano: todo sale de
 * aquí, y la prueba t2-textos-y-bancos.test.mjs cuenta las palabras contra §4.
 *
 * La clave de clasificación es de Gen («criterio propio»): si el profesor tiene
 * otra, se cambia SOLO en CLAVE_H1 de este archivo.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─── Subtemas del tema ─── */
export const SUBTEMAS = {
  "pe-autorregulacion": "Autorregulación e intervención",
  "pe-problemas": "Problemas económicos",
  "pe-objetivos": "Objetivos de política",
  "pe-ramas": "Ramas de la política",
  "pe-da-ramas": "Las ramas en la demanda agregada",
  "pe-ambitos": "Los seis ámbitos de una política",
  "pe-taller": "Taller de grupos lógicos",
};

/* ─── Aprender: el texto exacto de cada pantalla (§2) ─── */
export const APRENDER = {
  "pe26-a1-mecanico": [
    /* «Se te vara el carro.» pasó a la franja de escena (ESCENAS, rediseño lote 2). */
    "¿Lo arreglas tú o llamas al mecánico?",
    "Arreglarlo tú es autorregulación. Llamar al mecánico es intervención externa.",
    "La economía igual: a veces el mercado se ajusta solo; a veces interviene el Estado.",
    "Cuando el mercado falla, el Estado interviene. Pero el Estado también puede fallar.",
  ],
  "pe26-a2-fiebre": [
    "La economía es un circuito: hogares, empresas, Estado y exterior se pasan dinero.",
    "Cuando el circuito enferma, aparecen problemas económicos. Toca cada virus.",
    "Hay más: desigualdad, mala asignación de recursos y daño ambiental.",
    "Los problemas económicos son el origen de la política económica.",
  ],
  "pe26-a3-problema-resuelto": [
    "Un objetivo es un problema escrito como si ya estuviera resuelto.",
    "Voltea cada problema y mira en qué objetivo se convierte.",
    "Cuatro problemas comparten un objetivo: estabilizar. Inflación, desempleo, déficit fiscal y déficit externo.",
  ],
  "pe26-a4-perillas": [
    "El Estado tiene cuatro ramas clásicas de política: fiscal, monetaria, cambiaria y comercial.",
    "Cada rama gira una perilla distinta de la demanda agregada.",
    "Gira las perillas y mira cómo cambia la producción, Y.",
    "La fiscal tiene una perilla extra: t también cambia el multiplicador.",
    "Además hay políticas sectoriales: agro, industria, mipymes, ciencia y competitividad.",
  ],
  "pe26-a5-escalera": [
    "Toda política sube seis peldaños: problema, objetivo, estrategia, instrumento, medida y meta.",
    "Problema: lo que está mal. Desempleo del 14 %.",
    "Objetivo: el problema resuelto, sin cifras. Reducir el desempleo.",
    "Estrategia: la rama elegida. Política fiscal.",
    "Instrumento: la herramienta de esa rama. Impuesto de renta a empresas.",
    "Medida: qué se hace con la herramienta. Bajarlo del 32 % al 28 %.",
    "Meta: el objetivo con cifra y plazo. Desempleo del 14 % al 12 % en doce meses.",
    "Los seis juntos forman un grupo lógico. Ordénalos en la escalera.",
    "Ojo: el objetivo no lleva número; la meta sí, y con plazo.",
  ],
};

/* §4: conteo de palabras que declara la especificación. */
export const CONTEO_APRENDER = {
  "pe26-a1-mecanico": [7, 10, 15, 13],
  "pe26-a2-fiebre": [13, 10, 10, 10],
  "pe26-a3-problema-resuelto": [12, 10, 13],
  "pe26-a4-perillas": [13, 10, 10, 11, 10],
  "pe26-a5-escalera": [12, 8, 9, 6, 11, 13, 16, 11, 12],
};

/* ─── A1 ─── */
export const A1 = {
  caja: "Autorregulación",
  grua: "Intervención externa",
  mercado: "Mercado",
  estado: "Estado",
  cadena: ["Mercado perfecto", "Fallos del mercado", "Política económica", "¿Fallos del Estado?"],
};

/* ─── A2: los virus (ficha ≤ 12 palabras + cifra «dato de clase») ─── */
export const DATO_DE_CLASE = "dato de clase";
export const VIRUS = [
  { id: "inflacion", nombre: "Inflación", donde: "bienes", descripcion: "Suben los precios en general.", cifra: "6 %" },
  { id: "desempleo", nombre: "Desempleo", donde: "hogares", descripcion: "Gente que busca trabajo y no lo encuentra.", cifra: "8,1 %" },
  { id: "recesion", nombre: "Recesión", donde: "factores", descripcion: "Caen la producción, el ingreso y el empleo.", cifra: "crecimiento 2,6 % (fin de 2025)" },
  { id: "deficitFiscal", nombre: "Déficit fiscal", donde: "estado", descripcion: "El Estado gasta más de lo que recauda.", cifra: null },
  { id: "deficitExterno", nombre: "Déficit externo", donde: "exterior", descripcion: "Importamos más de lo que exportamos.", cifra: "US$ 8.198,7 millones" },
];
export const FUERA_DEL_CIRCUITO = [
  { id: "desigualdad", nombre: "Desigualdad", descripcion: "Mucho ingreso en pocas manos. Se mide con el Gini.", cifra: "Gini 0,54" },
  { id: "asignacion", nombre: "Mala asignación de recursos", descripcion: "Acceso excesivo a unos bienes; otros excluyen a muchos.", cifra: null },
  { id: "ambiental", nombre: "Daño ambiental", descripcion: "Producir o consumir contamina el ambiente.", cifra: null },
];
export const CIRCUITO = [
  { id: "hogares", nombre: "Hogares" },
  { id: "bienes", nombre: "Mercado de bienes" },
  { id: "empresas", nombre: "Empresas" },
  { id: "factores", nombre: "Mercado de factores" },
  { id: "estado", nombre: "Estado" },
  { id: "exterior", nombre: "Exterior" },
];
export const A2 = { verCircular: "Ver circular", maletin: "Política económica" };

/* ─── A3: problema → objetivo ─── */
export const A3 = {
  p1: { icono: "desempleo", problema: "Desempleo", objetivo: "Reducir el desempleo" },
  p2: [
    { icono: "inflacion", problema: "Inflación, desempleo, déficits", objetivo: "Estabilizar la economía" },
    { icono: "desigualdad", problema: "Desigualdad", objetivo: "Redistribuir la renta" },
    { icono: "asignacion", problema: "Mala asignación", objetivo: "Asignar bien los recursos" },
    { icono: "crecimiento", problema: "Poco crecimiento", objetivo: "Crecimiento económico" },
    { icono: "ambiental", problema: "Daño ambiental", objetivo: "Sostenibilidad ambiental" },
  ],
  p3: { de: [
    { icono: "inflacion", nombre: "Inflación" },
    { icono: "desempleo", nombre: "Desempleo" },
    { icono: "deficitFiscal", nombre: "Déficit fiscal" },
    { icono: "deficitExterno", nombre: "Déficit externo" },
  ], a: "Estabilización" },
};

/* ─── A4: las ramas y sus herramientas; los sectores ─── */
export const HERRAMIENTAS = {
  fiscal: ["Impuestos", "Gasto público", "Subsidios"],
  monetaria: ["Emisión", "Crédito", "Tasas de interés"],
  cambiaria: ["Precio del dólar", "Intervención del mercado"],
  comercial: ["Aranceles", "Subsidios", "Inversión extranjera"],
};
export const SECTORES = [
  { id: "agro", nombre: "Agro" },
  { id: "industria", nombre: "Industria" },
  { id: "mipymes", nombre: "Mipymes" },
  { id: "ciencia", nombre: "Ciencia y tecnología" },
  { id: "competitividad", nombre: "Competitividad" },
];
export const A4 = { multiplicador: "× multiplicador" };

/* ─── A5: el ejemplo del profesor (d. 18), una tarjeta por peldaño ─── */
export const A5_EJEMPLO = {
  problema: "Desempleo del 14 %",
  objetivo: "Reducir el desempleo",
  estrategia: "Política fiscal",
  instrumento: "Impuesto de renta a empresas",
  medida: "Bajarlo del 32 % al 28 %",
  meta: "Desempleo del 14 % al 12 % en doce meses",
};
export const A5_P9 = {
  objetivo: "Reducir el desempleo",
  meta: ["Del ", { subrayado: "14 % al 12 %" }, " en ", { subrayado: "doce meses" }],
};

/* ─── Los 43 enunciados del taller (anexo de la ficha 2) ─── */
export const ENUNCIADOS = {
  1: "Incrementar la inversión privada",
  2: "Política comercial",
  3: "Se espera que el tipo de cambio baje de COP 5.000 a COP 4.200 por dólar",
  4: "Tasa de interés",
  5: "Frenar la devaluación del tipo de cambio",
  6: "Se dispararon los precios en Colombia y crecieron al 12 % en 2024",
  7: "Aumentar las exportaciones de Colombia en un 15 % en dos años",
  8: "Reducción de impuestos directos a las empresas",
  9: "El Banco de la República comprará 300 millones de dólares en el mercado cambiario",
  10: "Aumentar la inversión privada en 8 % en los próximos 18 meses",
  11: "Política fiscal",
  12: "Se espera que el tipo de cambio suba de COP 3.500 a COP 3.900 por dólar en una semana",
  13: "Impuestos",
  14: "El peso se ha fortalecido frente al dólar en 7 % en los últimos 4 meses",
  15: "Reducción del gasto del Gobierno en 5 billones de pesos",
  16: "Promover la devaluación del tipo de cambio",
  17: "Subir los aranceles al acero del 10 % al 20 %",
  18: "Política monetaria",
  19: "Reducir el déficit fiscal en 1 punto del PIB para fin de año",
  20: "Subsidios",
  21: "La inflación bajará del 12 % al 11 % para finales de año",
  22: "Intervención del mercado cambiario",
  23: "Aplicar subsidios a la producción exportable de aguacate",
  24: "El peso se ha devaluado en 15 % en los últimos 4 meses",
  25: "Reducción del desempleo del 23 % al 20 % en un año",
  26: "Déficit comercial",
  27: "El Banco de la República subirá la tasa de interés de referencia del 7 % al 10 % en los próximos seis meses",
  28: "Las importaciones de acero de China están inundando el mercado nacional",
  29: "El Banco de la República venderá 300 millones de dólares en el mercado cambiario",
  30: "Incrementar las exportaciones del país",
  31: "Controlar las importaciones de China a Colombia",
  32: "Política monetaria",
  33: "Aranceles",
  34: "Desempleo del 23 %",
  35: "Gasto público",
  36: "Reducción de la inversión privada en 12 % en el último año",
  37: "Reducir el déficit fiscal",
  38: "Reducir la tasa de interés de referencia del 10 % al 8 %",
  39: "Reducir el desempleo",
  40: "Controlar la inflación",
  41: "Política cambiaria",
  42: "El déficit fiscal ha crecido en 3 puntos del PIB en los cinco últimos años",
  43: "Reducir las importaciones de acero en un 20 % en tres meses",
};

/* ─── Consignas de las Hacer (≤ 12 palabras) ─── */
export const CONSIGNAS = {
  "pe26-h3-cables": "Conecta cada instrumento con la rama que lo usa.",
  "pe26-h1-seis-cajones": "Arrastra cada enunciado a su peldaño.",
  "pe26-h2-grupo-logico": "Completa la escalera: elige la tarjeta de cada peldaño.",
  "pe26-h4-expediente": "Toca el peldaño que no encaja.",
  "pe26-h5-dos-fiebres": "Eres el Banco de la República. ¿Qué haces con la tasa?",
};
export const CONTEO_CONSIGNAS = { "pe26-h1-seis-cajones": 6, "pe26-h2-grupo-logico": 9, "pe26-h3-cables": 9, "pe26-h4-expediente": 6 };

/* ─── H3 · Conecta los cables ─── */
export const PARTIDA_H3 = 8;
export const BANCO_H3 = [
  { id: "impuestos", nombre: "Impuestos", rama: "fiscal", retro: {
    monetaria: "Los impuestos son finanzas públicas, no moneda.",
    cambiaria: "No fijan el precio del dólar: son ingresos del Estado.",
    comercial: "Son impuestos internos; los del comercio exterior son aranceles." } },
  { id: "gasto", nombre: "Gasto público", rama: "fiscal", retro: {
    monetaria: "Gastar es decisión del Gobierno, no del banco central.",
    cambiaria: "No mueve el dólar directamente: es gasto del Estado.",
    comercial: "Es gasto interno del Gobierno, no comercio exterior." } },
  { id: "deuda", nombre: "Deuda pública", rama: "fiscal", retro: {
    monetaria: "La deuda financia al Gobierno: es fiscal.",
    cambiaria: "Endeudarse es financiar el gasto público, no fijar el dólar.",
    comercial: "No regula exportaciones ni importaciones: financia al Estado." } },
  { id: "tasa", nombre: "Tasa de interés de referencia", rama: "monetaria", retro: {
    fiscal: "La fija el Banco de la República, no el Gobierno.",
    cambiaria: "Afecta al dólar, pero es herramienta monetaria.",
    comercial: "No es un arancel: es el precio del crédito." } },
  { id: "oma", nombre: "Operaciones de mercado abierto", rama: "monetaria", retro: {
    fiscal: "Las hace el banco central para mover el dinero.",
    cambiaria: "Compran y venden títulos, no dólares.",
    comercial: "No tocan el comercio exterior: ajustan la liquidez." } },
  { id: "encaje", nombre: "Encaje bancario", rama: "monetaria", retro: {
    fiscal: "Es la reserva que exige el banco central a los bancos.",
    cambiaria: "No es un precio del dólar: limita el crédito.",
    comercial: "No regula importaciones: regula cuánto prestan los bancos." } },
  { id: "regimen", nombre: "Régimen cambiario", rama: "cambiaria", retro: {
    fiscal: "Define cómo se fija el dólar, no impuestos.",
    monetaria: "Es la regla del precio del dólar: cambiaria.",
    comercial: "No es un arancel: es la regla del tipo de cambio." } },
  { id: "intervencion", nombre: "Intervención del mercado cambiario", rama: "cambiaria", retro: {
    fiscal: "Comprar o vender dólares no es gasto público.",
    monetaria: "Se interviene el mercado de dólares: rama cambiaria.",
    comercial: "No grava importaciones: mueve el precio del dólar." } },
  { id: "aranceles", nombre: "Aranceles", rama: "comercial", retro: {
    fiscal: "Recaudan, pero su fin es regular importaciones: comercial.",
    monetaria: "No es una tasa de interés: grava lo importado.",
    cambiaria: "No fijan el dólar: encarecen un producto importado." } },
].map((x) => ({ ...x, subtemas: ["pe-ramas", "pe-da-ramas"] }));

/* ─── H1 · Seis peldaños ─── */
export const PARTIDA_H1_POR_PELDANO = 2;
/* Números del anexo; el 32 no entra (repite el 18). */
export const CLAVE_H1 = {
  problema: [6, 14, 24, 26, 28, 34, 36, 42],
  objetivo: [1, 5, 16, 30, 31, 37, 39, 40],
  estrategia: [2, 11, 18, 41],
  instrumento: [4, 13, 20, 22, 33, 35],
  medida: [8, 9, 15, 17, 23, 27, 29, 38],
  meta: [3, 7, 10, 12, 19, 21, 25, 43],
};
/* Retro por par: RETRO_H1[verdadero][donde lo puso]. */
export const RETRO_H1 = {
  problema: {
    objetivo: "Describe algo que ya pasa; un objetivo dice lo que se quiere.",
    estrategia: "No nombra una rama: describe lo que está mal.",
    instrumento: "No es una herramienta: es una situación que preocupa.",
    medida: "Nadie actúa aquí: cuenta lo que está pasando.",
    meta: "La cifra es la situación actual, no lo que se quiere lograr.",
  },
  objetivo: {
    problema: "Habla de lo que se quiere lograr, no de lo que está mal.",
    estrategia: "No nombra una rama: dice qué se quiere lograr.",
    instrumento: "No es una herramienta: es un propósito.",
    medida: "No dice qué se hace con una herramienta: dice el propósito.",
    meta: "No trae cifra ni plazo: es objetivo, no meta.",
  },
  estrategia: {
    problema: "Nombra una rama de política, no algo que está mal.",
    objetivo: "Es la rama elegida, no el propósito.",
    instrumento: "Es la rama completa; los instrumentos son sus herramientas.",
    medida: "No hay acción concreta: solo el nombre de la rama.",
    meta: "No trae cifra: es el nombre de una rama.",
  },
  instrumento: {
    problema: "Es una herramienta, no una situación.",
    objetivo: "Es la herramienta, no el propósito.",
    estrategia: "Es una herramienta dentro de una rama, no la rama.",
    medida: "Falta el verbo: la medida dice qué se hace con ella.",
    meta: "No hay cifra ni plazo: es solo la herramienta.",
  },
  medida: {
    problema: "Describe una acción de la autoridad, no algo que está mal.",
    objetivo: "Dice qué se hace con una herramienta, no el propósito.",
    estrategia: "Es una acción concreta, no el nombre de una rama.",
    instrumento: "Tiene verbo y dirección: usa la herramienta, es medida.",
    meta: "La cifra es de la herramienta, no del resultado buscado.",
  },
  meta: {
    problema: "Dice adónde se quiere llegar, no solo cómo está.",
    objetivo: "Tiene cifra y plazo: eso la vuelve meta.",
    estrategia: "Es un resultado con cifra, no una rama.",
    instrumento: "Es un resultado cuantificado, no una herramienta.",
    medida: "La cifra es del resultado, no de la herramienta usada.",
  },
};
export const BANCO_H1 = Object.entries(CLAVE_H1).flatMap(([peldano, nums]) =>
  nums.map((n) => ({ id: `e${n}`, numero: n, texto: ENUNCIADOS[n], correcta: peldano, subtemas: ["pe-ambitos", "pe-taller"] })));

/* ─── H2 · Arma el grupo lógico ─── */
export const PARTIDA_H2 = 3;
const paso = (correcta, d1, r1, d2, r2) => ({ correcta, distractoras: [{ n: d1, retro: r1 }, { n: d2, retro: r2 }] });
export const BANCO_H2 = [
  { id: "g1", nombre: "Inflación", problema: 6, ramas: true, pasos: {
    objetivo: paso(40, 39, "El problema es de precios, no de empleo.", 16, "Devaluar no ataca la subida de precios."),
    estrategia: paso(18, 2, "La política comercial no controla los precios internos.", 41, "Se busca enfriar la demanda; eso lo hace la monetaria."),
    instrumento: paso(4, 33, "Los aranceles son comerciales, no monetarios.", 20, "Los subsidios no son herramienta monetaria."),
    medida: paso(27, 38, "Bajar la tasa calienta la demanda y sube precios.", 9, "Comprar dólares es cambiario, no la tasa."),
    meta: paso(21, 25, "La meta debe medir la inflación, no el desempleo.", 10, "La meta debe medir precios, no inversión."),
  } },
  { id: "g2", nombre: "Peso fortalecido", problema: 14, pasos: {
    objetivo: paso(16, 5, "El peso ya está fuerte: frenar la devaluación sobra.", 40, "El problema es el precio del dólar, no la inflación."),
    estrategia: paso(41, 11, "El precio del dólar se maneja con política cambiaria.", 2, "La comercial usa aranceles; aquí se mueve el dólar."),
    instrumento: paso(22, 4, "La tasa es monetaria; aquí se interviene el mercado cambiario.", 13, "Los impuestos son fiscales, no cambiarios."),
    medida: paso(9, 29, "Vender dólares los abarata más: el peso se fortalece aún más.", 17, "Subir aranceles es comercial, no cambiario."),
    meta: paso(12, 3, "Que el dólar baje es lo contrario de lo buscado.", 7, "La meta debe medir el tipo de cambio."),
  } },
  { id: "g3", nombre: "Peso devaluado", problema: 24, pasos: {
    objetivo: paso(5, 16, "El peso ya se devaluó: promoverlo lo empeora.", 37, "El problema es el dólar, no el déficit fiscal."),
    estrategia: paso(41, 18, "El mercado de dólares es terreno cambiario.", 2, "Los aranceles no frenan la devaluación directamente."),
    instrumento: paso(22, 33, "Los aranceles son comerciales; aquí se interviene el mercado cambiario.", 35, "El gasto público es fiscal, no cambiario."),
    medida: paso(29, 9, "Comprar dólares los encarece más: acelera la devaluación.", 8, "Bajar impuestos es fiscal, no cambiario."),
    meta: paso(3, 12, "Que el dólar suba es lo contrario de lo buscado.", 21, "La meta debe medir el tipo de cambio."),
  } },
  { id: "g4", nombre: "Inversión cae", problema: 36, ramas: true, pasos: {
    objetivo: paso(1, 40, "El problema es la inversión, no los precios.", 37, "El problema es la inversión, no el déficit."),
    estrategia: paso(18, 41, "La tasa de interés es monetaria, no cambiaria.", 2, "La comercial no abarata el crédito."),
    instrumento: paso(4, 22, "Intervenir el dólar no abarata el crédito.", 33, "Los aranceles no mueven el costo del crédito."),
    medida: paso(38, 27, "Subir la tasa encarece el crédito: frena la inversión.", 29, "Vender dólares es cambiario, no mueve la tasa."),
    meta: paso(10, 21, "La meta debe medir la inversión, no la inflación.", 19, "La meta debe medir la inversión, no el déficit."),
  } },
  { id: "g5", nombre: "Déficit fiscal", problema: 42, pasos: {
    objetivo: paso(37, 30, "El hueco es del Estado, no del comercio exterior.", 39, "El problema es el déficit, no el desempleo."),
    estrategia: paso(11, 18, "Las finanzas públicas son terreno fiscal.", 41, "El dólar no cierra el hueco del presupuesto."),
    instrumento: paso(35, 4, "La tasa es monetaria; el hueco se cierra con gasto o impuestos.", 22, "Intervenir el dólar no cierra el déficit."),
    medida: paso(15, 8, "Bajar impuestos reduce el recaudo: agranda el déficit.", 23, "Subsidiar es gastar más: agranda el déficit."),
    meta: paso(19, 10, "La meta debe medir el déficit, no la inversión.", 12, "La meta debe medir el déficit, no el dólar."),
  } },
  { id: "g6", nombre: "Acero chino", problema: 28, pasos: {
    objetivo: paso(31, 16, "Devaluar no apunta al acero chino en particular.", 40, "El problema es de importaciones, no de precios."),
    estrategia: paso(2, 18, "La tasa no frena un producto importado puntual.", 41, "El dólar afecta todas las importaciones, no solo el acero."),
    instrumento: paso(33, 4, "La tasa es monetaria; el acero se frena con aranceles.", 35, "El gasto público no frena importaciones."),
    medida: paso(17, 23, "Subsidiar aguacate no frena el acero chino.", 38, "Bajar la tasa es monetario, no comercial."),
    meta: paso(43, 7, "La meta debe medir importaciones de acero, no exportaciones.", 19, "La meta debe medir el acero, no el déficit."),
  } },
  { id: "g7", nombre: "Desempleo", problema: 34, pasos: {
    objetivo: paso(39, 5, "El problema es el empleo, no el dólar.", 31, "El problema es el empleo, no las importaciones."),
    estrategia: paso(11, 41, "El ejemplo de clase usa impuestos: estrategia fiscal.", 2, "La comercial no es la vía de este grupo."),
    instrumento: paso(13, 33, "Los aranceles son comerciales; aquí van los impuestos.", 22, "Intervenir el dólar es cambiario, no fiscal."),
    medida: paso(8, 17, "Subir aranceles es comercial, no fiscal.", 29, "Vender dólares es cambiario, no fiscal."),
    meta: paso(25, 21, "La meta debe medir el desempleo, no la inflación.", 3, "La meta debe medir el desempleo, no el dólar."),
  } },
].map((g) => ({ ...g, subtemas: g.ramas ? ["pe-ambitos", "pe-taller", "pe-ramas"] : ["pe-ambitos", "pe-taller"] }));
export const H2 = { bandera: "Grupo lógico" };

/* ─── H4 · El peldaño que no encaja ─── */
export const PARTIDA_H4 = 4;
/* Cada peldaño: número del anexo (o texto suelto) y su retro si es coherente. */
export const BANCO_H4 = [
  { id: "e1", errado: "medida", sube: 27, explicacion: "Bajar la tasa calienta la demanda y empuja los precios arriba.", peldanos: {
    problema: { n: 6, retro: "Los precios disparados son el problema." },
    objetivo: { n: 40, retro: "Controlar la inflación es el problema resuelto." },
    estrategia: { n: 18, retro: "La tasa es de la política monetaria." },
    instrumento: { n: 4, retro: "Con la tasa se enfría la demanda." },
    medida: { n: 38 },
    meta: { n: 21, retro: "Tiene cifra y plazo: es la meta." },
  } },
  { id: "e2", errado: "instrumento", sube: 35, explicacion: "La tasa es monetaria; recortar gasto usa el gasto público.", peldanos: {
    problema: { n: 42, retro: "Un déficit que crece es lo que está mal." },
    objetivo: { n: 37, retro: "Reducirlo es el problema resuelto." },
    estrategia: { n: 11, retro: "Las finanzas públicas son terreno fiscal." },
    instrumento: { n: 4 },
    medida: { n: 15, retro: "Recortar gasto cierra el hueco." },
    meta: { n: 19, retro: "Un punto del PIB a fin de año: cifra y plazo." },
  } },
  { id: "e3", errado: "medida", sube: 29, explicacion: "Comprar dólares los encarece más; para frenar, hay que venderlos.", peldanos: {
    problema: { n: 24, retro: "El peso perdió valor: ese es el problema." },
    objetivo: { n: 5, retro: "Frenarla es el problema resuelto." },
    estrategia: { n: 41, retro: "El precio del dólar es terreno cambiario." },
    instrumento: { n: 22, retro: "Intervenir el mercado es la herramienta." },
    medida: { n: 9 },
    meta: { n: 3, retro: "El dólar bajando con cifra: es la meta." },
  } },
  { id: "e4", errado: "meta", sube: 43, explicacion: "Sin cifra ni plazo es objetivo, no meta.", peldanos: {
    problema: { n: 28, retro: "El acero chino inundando es el problema." },
    objetivo: { n: 31, retro: "Controlarlas es el problema resuelto." },
    estrategia: { n: 2, retro: "Aranceles y comercio exterior: política comercial." },
    instrumento: { n: 33, retro: "El arancel es la herramienta." },
    medida: { n: 17, retro: "Subirlo con cifra es la medida." },
    meta: { texto: "Reducir las importaciones de acero" },
  } },
  { id: "e5", errado: "estrategia", sube: 11, explicacion: "La tasa es un instrumento; la estrategia es la rama: política fiscal.", peldanos: {
    problema: { n: 34, retro: "Desempleo del 23 % es lo que está mal." },
    objetivo: { n: 39, retro: "Reducirlo es el problema resuelto." },
    estrategia: { n: 4 },
    instrumento: { n: 13, retro: "Los impuestos son la herramienta fiscal." },
    medida: { n: 8, retro: "Bajarlos a empresas es la acción." },
    meta: { n: 25, retro: "Del 23 % al 20 % en un año." },
  } },
].map((e) => ({ ...e, subtemas: ["pe-ambitos", "pe-taller"] }));
export const textoPeldanoH4 = (p) => p.texto ?? ENUNCIADOS[p.n];

/* ─── H5 · Un paciente, dos fiebres ─── */
export const MEDIDORES_H5 = [
  { id: "P", nombre: "Precios" },
  { id: "Y", nombre: "Producción" },
  { id: "D", nombre: "Déficit fiscal" },
];
export const INICIO_H5 = { P: 4, Y: 2, D: 3 };
export const ENTRADA_H5 = "Precios altos y la inversión cayendo. Tú decides el tratamiento.";
export const PASOS_H5 = [
  {
    id: "tasa", quien: "monetaria",
    consigna: "Eres el Banco de la República. ¿Qué haces con la tasa?",
    subtemas: ["pe-ramas"],
    opciones: [
      { id: "subir", texto: "Subir la tasa", efecto: { P: -1, Y: -1 }, narracion: "Los precios se calman, pero las grúas se detienen." },
      { id: "bajar", texto: "Bajar la tasa", efecto: { P: 1, Y: 1 }, narracion: "Las grúas vuelven, pero el termómetro de precios sube." },
      { id: "igual", texto: "Dejarla igual", efecto: {}, narracion: "Ni frío ni calor: los dos problemas siguen." },
    ],
  },
  {
    id: "gasto", quien: "fiscal",
    consigna: "Eres el Gobierno. ¿Qué haces con el gasto público?",
    subtemas: ["pe-ramas"],
    opciones: [
      { id: "subir", texto: "Subirlo", efecto: { Y: 1, P: 1, D: 1 }, narracion: "Más demanda: más producción, más precios y más déficit." },
      { id: "recortar", texto: "Recortarlo", efecto: { Y: -1, P: -1, D: -1 }, narracion: "Menos demanda: se calman los precios y el déficit, cae la producción." },
      { id: "igual", texto: "Dejarlo igual", efecto: {}, narracion: "El Gobierno no mueve su perilla." },
    ],
  },
];
/* Los nueve finales: [paso 1, paso 2] → medidores finales y lectura. */
export const FINALES_H5 = {
  "subir+subir": { P: 4, Y: 2, D: 4, lectura: "Una rama frena y otra acelera: se anulan y crece el déficit." },
  "subir+recortar": { P: 2, Y: 1, D: 2, lectura: "Precios a raya y menos déficit, pero la producción toca fondo." },
  "subir+igual": { P: 3, Y: 1, D: 3, lectura: "Precios más calmados, producción más débil." },
  "bajar+subir": { P: 5, Y: 4, D: 4, lectura: "Producción arriba, pero precios y déficit al máximo." },
  "bajar+recortar": { P: 4, Y: 2, D: 2, lectura: "Se compensan: todo vuelve al inicio, con menos déficit." },
  "bajar+igual": { P: 5, Y: 3, D: 3, lectura: "La producción mejora a costa de más inflación." },
  "igual+subir": { P: 5, Y: 3, D: 4, lectura: "Más producción, pero más precios y más déficit." },
  "igual+recortar": { P: 3, Y: 1, D: 2, lectura: "Menos precios y déficit, pero menos producción." },
  "igual+igual": { P: 4, Y: 2, D: 3, lectura: "Sin tratamiento, la fiebre y la caída siguen ahí." },
};
export const CIERRE_H5 = "Ningún remedio sale gratis. Por eso las políticas se coordinan.";
export const OTRO_H5 = "Probar otro tratamiento";
export const SUBTEMAS_CIERRE_H5 = ["pe-da-ramas", "pe-objetivos"];

/* ─── Escenas (rediseño con la lista de 5, spec de Gen 24-nov §2, T2) ───
 * La franja de arriba de cada pieza: tema despacho, hora, lado, mascota,
 * TU PAPEL (≤ 15 palabras) y contexto (≤ 30). En las Hacer, `porRonda` da el
 * mini contexto de la escena compacta (≤ 12): `todas` = el mismo en cada
 * ronda; `etiqueta` + `texto` = la etiqueta fija y el campo de la ronda.
 * escenas.test.mjs lo mide. Solo presentación: no toca ids ni puntajes. */
const despacho = (hora, lado, mascota, rol, contexto, porRonda = null) => ({ tema: "despacho", hora, lado, ...mascota, rol, contexto, porRonda });
/* H5: el Banco de la República lleva el timón (fiebre 1, la tasa) y el Gobierno el grifo (fiebre 2, el gasto). */
export const POSES_H5 = { tasa: "timon", gasto: "grifo" };
export const ESCENAS = {
  "pe26-a1-mecanico": despacho("dia", "izq", { mascota: { id: "profesor", pose: "pregunta" } },
    "Imagina que eres el mecánico de la economía de un país.",
    "Se te vara el carro."),
  "pe26-a2-fiebre": despacho("manana", "der", { mascota: { id: "analista", pose: "lupa" } },
    "Te contratan como médico de la economía: detecta la fiebre.",
    "Hogares, empresas, Estado y exterior se pasan dinero todo el día. A veces el circuito se enferma."),
  "pe26-a3-problema-resuelto": despacho("tarde", "izq", { mascota: { id: "familia", pose: "mercado" } },
    "Eres el asesor del DNP que redacta los objetivos del plan.",
    "El país tiene un problema: los precios suben demasiado. El plan debe decir a dónde quiere llegar."),
  "pe26-a4-perillas": despacho("noche", "der", { mascota: { id: "autoridad-economica", pose: "timon" } },
    "Te sientas frente al tablero de control del Estado.",
    "La economía necesita un ajuste. El Estado tiene cuatro perillas y cada una la maneja un equipo distinto."),
  /* La escalera conserva su panda (Escalera.jsx, personaje en el peldaño). */
  "pe26-a5-escalera": despacho("dia", "der", { mascota: { id: "profesor", pose: "pizarra" } },
    "Eres el asesor que arma, paso a paso, una política para el Gobierno.",
    "El Gobierno quiere bajar la inflación. Antes de actuar, el plan tiene que subir seis peldaños."),
  "pe26-h1-seis-cajones": despacho("manana", "izq", { mascota: { id: "analista", pose: "libreta" } },
    "Te contratan en el DNP para ordenar el plan contra la inflación.",
    "Te llegaron las notas sueltas del plan. Cada una va en un peldaño de la escalera.",
    { todas: "Nota suelta del plan:" }),
  /* No la autoridad: el panda ya sube por la escalera de la pieza. */
  "pe26-h2-grupo-logico": despacho("tarde", "der", { mascota: { id: "empresario", pose: "explica" } },
    "Eres el asesor que completa la política antes de presentarla al ministro.",
    "A la escalera le faltan tarjetas. El ministro la revisa en una hora.",
    { etiqueta: "Tema de la reunión:", texto: "grupo" }),
  "pe26-h3-cables": despacho("noche", "izq", { mascota: { id: "exportadora-flores", pose: "avion" } },
    "Eres el técnico que conecta cada herramienta con el equipo que la usa.",
    "El Estado tiene muchas herramientas, pero cada una la maneja una sola rama de política.",
    { todas: "Herramienta sin conectar:" }),
  "pe26-h4-expediente": despacho("dia", "izq", { mascota: { id: "inversionista", pose: "ladrillo" } },
    "Te contratan como auditor de políticas del Gobierno.",
    "Llegó el expediente de una política. Alguien coló un peldaño que no pertenece a esta escalera.",
    { todas: "Expediente nuevo:" }),
  "pe26-h5-dos-fiebres": despacho("tarde", "izq", { mascota: { id: "autoridad-economica", pose: POSES_H5.tasa } },
    "Primero eres el Banco de la República; después, el Gobierno.",
    ENTRADA_H5,
    { texto: "lectura" }),
};
