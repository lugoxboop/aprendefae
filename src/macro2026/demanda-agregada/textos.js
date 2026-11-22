/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · T1 DEMANDA AGREGADA — TODOS LOS TEXTOS DE LAS 12 PIEZAS
 *
 * Copiados LITERALES de la especificación de Gen
 * (orquestador/conocimiento/macro-2026/disenos/t1-demanda-agregada.md, §2).
 * Ninguna pieza escribe un texto de lectura, una consigna o una
 * retroalimentación fuera de este archivo: así la prueba de longitud
 * (≤ 20 palabras por pantalla de Aprender, ≤ 12 por consigna, ≤ 15 por retro)
 * mide lo mismo que ve el estudiante.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ─── Las pantallas de Aprender: el texto de lectura de cada P ─────────── */
export const APRENDER = {
  "da26-a1-carrito": [
    "Toda la economía hace un solo mercado. Lo que compra junta es la demanda agregada.",
    "Toca cada mano y mira qué echa al carrito.",
    "Lo que vendemos afuera suma. Lo que compramos afuera resta. Neto: X − M.",
    "Cuatro manos, un carrito. Si una echa menos, la demanda agregada baja.",
  ],
  "da26-a2-vaso-renta": [
    "Tu renta llega por un grifo: Y.",
    "El Gobierno añade gotas, las transferencias TR, y se lleva un tajo: T = tY.",
    "Lo que queda en el vaso es la renta disponible: Y + TR − T.",
    "De cada peso disponible gastas una fracción c: la propensión marginal a consumir.",
    "Con renta cero, igual comes: con préstamos, ahorros o ayudas. Eso es consumo autónomo, C̄.",
    "Todo junto: lo autónomo más lo inducido.",
  ],
  "da26-a3-columpio-tasa": [
    "Las empresas invierten en máquinas, plantas e inventarios. Casi siempre con crédito.",
    "Si el crédito sale más caro, se construye menos.",
    "b mide cuánto cae la inversión por cada punto de tasa. Brazo largo, golpe fuerte.",
    "Hay inversión que no mira la tasa: depende de expectativas. Es la inversión autónoma, Ī.",
  ],
  "da26-a4-no-miran-renta": [
    "El Gobierno decide su gasto, G. No depende de la renta: es autónomo.",
    "Puede gastar más de lo que recauda. La diferencia es déficit, y se cubre con deuda.",
    "El tipo de cambio es cuántos pesos cuesta un dólar.",
    "Si el dólar sube, lo nuestro sale barato afuera e importar sale caro.",
    "Si el dólar baja, el peso se aprecia: exportamos menos e importamos más.",
  ],
  "da26-a5-bisagra-ascensor": [
    "La demanda agregada crece con la renta. Esta recta lo muestra.",
    "La recta tiene dos perillas: dónde arranca y qué tan empinada sube.",
    "Ascensor: G, C̄, Ī, XN o la tasa i mueven la recta entera, paralela.",
    "Bisagra: c y t cambian la inclinación. La recta gira sobre su arranque.",
    "¿La tasa de interés gira la recta o la desplaza? Apuesta y muévela.",
    "La economía produce donde lo producido iguala lo demandado: Y = DA.",
  ],
  "da26-a6-eco-multiplicador": [
    "El Gobierno gasta 100 en una vía. ¿Cuánto sube la producción?",
    "Los obreros cobran y gastan una parte. Quien les vende cobra y gasta otra parte.",
    "Cada eco es más débil. Sumados, dan el multiplicador: 1 / [1 − c(1 − t)].",
    "Con c = 0,8 y t = 25 %, cada 100 de gasto se vuelven 250.",
    "No los confundas: la inclinación es c(1 − t). El multiplicador es otro número.",
    "Producción de equilibrio: Y₀ = multiplicador × (Ā − b·i).",
  ],
};

/* Las retroalimentaciones de las predicciones de Aprender. */
export const RETRO_A5_P5 = {
  gira: "No gira: i está en el arranque, Ā − b·i.",
  desplaza: "Eso: la tasa sube o baja la recta entera.",
};
export const RETRO_A6_P1 = {
  igual: "Falta contar lo que gastan los que cobran.",
  mas: "Eso. Mira por qué.",
  menos: "Al contrario: ese gasto se vuelve a gastar.",
};

/* ─── Consignas de las Hacer ───────────────────────────────────────────── */
export const CONSIGNAS = {
  "da26-h1-llena-carrito": "Arrastra cada compra a la mano que la hace.",
  "da26-h2-arma-formula": "Arrastra cada pieza a su hueco en la fórmula.",
  "da26-h3-gira-o-sube": "Mueve la recta a donde crees que quedará.",
  "da26-h4-empresario": "Arma la cadena: toca cada flecha para subirla o bajarla.",
  "da26-h5-libreta": "Toca la línea que tiene el error.",
  "da26-h6-meta": "Mueve la palanca hasta que la producción llegue a la meta.",
};

/* ─── H1 · Llena el carrito (8 de 10) ──────────────────────────────────── */
/* `signo` solo para XN: +1 exportación (el bloque crece), −1 importación (se encoge). */
export const BANCO_H1 = [
  { id: "h1-1", ficha: "Una familia paga el mercado del mes", correcta: "C", retro: { I: "La comida no amplía la capacidad de producir: la gasta un hogar.", G: "Paga una familia, no el Estado.", XN: "Se compra y se consume dentro del país." }, subtemas: ["da-componentes"] },
  { id: "h1-2", ficha: "Una panadería compra un horno industrial", correcta: "I", retro: { C: "Lo compra una empresa para producir más: eso es inversión.", G: "Lo paga una empresa privada, no el Gobierno.", XN: "El horno se queda produciendo aquí." }, subtemas: ["da-componentes"] },
  { id: "h1-3", ficha: "El Gobierno construye un hospital en Tunja", correcta: "G", retro: { C: "Lo paga el Estado, no un hogar.", I: "En este modelo, I es inversión privada; esto lo paga el Gobierno.", XN: "Es una obra pública dentro del país." }, subtemas: ["da-componentes"] },
  { id: "h1-4", ficha: "Colombia vende café a Alemania", correcta: "XN", signo: 1, retro: { C: "Lo compra alguien de afuera: es una exportación.", I: "Nadie invierte aquí: un comprador extranjero compra café.", G: "No lo paga el Gobierno: lo compra el exterior." }, subtemas: ["da-componentes", "da-exportaciones-netas"] },
  { id: "h1-5", ficha: "Llegan carros importados de Corea", correcta: "XN", signo: -1, retro: { C: "Es una compra al exterior: importación, resta en X − M.", I: "Es una compra al exterior: va a XN, restando.", G: "No la hace el Estado: es importación y resta." }, subtemas: ["da-componentes", "da-exportaciones-netas"] },
  { id: "h1-6", ficha: "Una empresa amplía su bodega esperando vender más", correcta: "I", retro: { C: "La bodega sirve para producir y vender más: inversión.", G: "La paga la empresa, no el Estado.", XN: "Es una obra dentro del país." }, subtemas: ["da-componentes"] },
  { id: "h1-7", ficha: "El Gobierno paga los sueldos de los profesores públicos", correcta: "G", retro: { C: "El pago lo hace el Estado: es su gasto.", I: "No es una empresa ampliándose: es gasto del Gobierno.", XN: "Es un pago dentro del país." }, subtemas: ["da-componentes"] },
  { id: "h1-8", ficha: "Un hotel de Cartagena atiende turistas franceses", correcta: "XN", signo: 1, retro: { C: "Quien paga vive afuera: es exportación de servicios.", I: "El hotel no compra capital: vende un servicio al exterior.", G: "No interviene el Gobierno: pagan turistas extranjeros." }, subtemas: ["da-componentes", "da-exportaciones-netas"] },
  { id: "h1-9", ficha: "Un estudiante paga su plan de celular", correcta: "C", retro: { I: "Es gasto de un hogar, no de una empresa.", G: "Lo paga una persona, no el Estado.", XN: "Es un servicio comprado dentro del país." }, subtemas: ["da-componentes"] },
  { id: "h1-10", ficha: "Una constructora levanta una planta de cemento", correcta: "I", retro: { C: "Es capital para producir: inversión privada.", G: "Es privada: el Gobierno no la paga.", XN: "La planta se queda aquí." }, subtemas: ["da-componentes"] },
];
export const PARTIDA_H1 = 8;

/* ─── H4 · Lo que oyó el empresario (5 de 7) ───────────────────────────── */
export const BANCO_H4 = [
  { id: "h4-1", titular: "«El Banco de la República baja la tasa de interés.»", eslabones: [["Tasa i", -1], ["Inversión", 1], ["DA", 1]], retro: ["El titular dice que la tasa baja.", "Crédito más barato, más inversión.", "Más inversión suma a la DA."], subtemas: ["da-inversion", "da-caso-empresario"] },
  { id: "h4-2", titular: "«Reforma tributaria: sube el impuesto de renta a familias.»", eslabones: [["Impuestos", 1], ["Consumo", -1], ["DA", -1]], retro: ["La reforma sube el impuesto.", "Más impuesto, menos renta disponible para consumir.", "Menos consumo resta a la DA."], subtemas: ["da-consumo", "da-caso-empresario"] },
  { id: "h4-3", titular: "«Por el déficit, el Gobierno recorta el gasto social.»", eslabones: [["Gasto público", -1], ["DA", -1], ["Producción Y₀", -1]], retro: ["Recortar es gastar menos.", "G suma directo a la DA.", "Con menos DA, las empresas producen menos."], subtemas: ["da-gasto-publico", "da-caso-empresario"] },
  { id: "h4-4", titular: "«El dólar baja: el peso se aprecia.»", eslabones: [["Tipo de cambio", -1], ["Exportaciones netas", -1], ["DA", -1]], retro: ["Si el dólar baja, el tipo de cambio baja.", "Peso fuerte: exportamos menos, importamos más.", "Menos XN resta a la DA."], subtemas: ["da-exportaciones-netas", "da-caso-empresario"] },
  { id: "h4-5", titular: "«Crece la incertidumbre política en el país.»", eslabones: [["Inversión autónoma", -1], ["DA", -1], ["Producción Y₀", -1]], retro: ["Con incertidumbre, las empresas frenan proyectos.", "Menos inversión resta a la DA.", "Menos DA, menos producción."], subtemas: ["da-inversion", "da-caso-empresario"] },
  { id: "h4-6", titular: "«Las familias ahorran menos de cada peso extra.»", eslabones: [["Propensión a consumir c", 1], ["Consumo", 1], ["DA", 1]], retro: ["Si s baja, c sube: s = 1 − c.", "Más c, más consumo por peso.", "Más consumo suma a la DA."], subtemas: ["da-consumo", "da-caso-empresario"] },
  { id: "h4-7", titular: "«El Gobierno reduce los subsidios a las familias.»", eslabones: [["Transferencias TR", -1], ["Consumo", -1], ["DA", -1]], retro: ["Subsidio menor es transferencia menor.", "Menos TR, menos renta disponible para consumir.", "Menos consumo resta a la DA."], subtemas: ["da-consumo", "da-caso-empresario"] },
];
export const PARTIDA_H4 = 5;

/* ─── H3 · ¿Gira o sube? (6 de 8) ──────────────────────────────────────── */
/*
 * `cambio`: lo que el suceso le hace al modelo común, para animar la recta
 * real. Las magnitudes NO las da la especificación (solo tipo y sentido); son
 * de ilustración y se anotan en construccion-t1.md.
 */
export const BANCO_H3 = [
  { id: "h3-1", suceso: "El Gobierno aumenta el gasto en vías.", tipo: "desplaza", sentido: 1, cambio: { G: 320 }, retro: { tipo: "G es autónomo: mueve el arranque, no la inclinación.", sentido: "Más gasto suma a la DA: la recta sube." }, subtemas: ["da-grafica", "da-gasto-publico"] },
  { id: "h3-2", suceso: "El Banco de la República sube la tasa de interés.", tipo: "desplaza", sentido: -1, cambio: { i: 14 }, retro: { tipo: "La tasa está en el arranque, Ā − b·i: desplaza.", sentido: "Tasa más alta, menos inversión: la recta baja." }, subtemas: ["da-grafica", "da-inversion"] },
  { id: "h3-3", suceso: "Las familias consumen más de cada peso extra.", tipo: "gira", sentido: 1, cambio: { c: 0.95 }, retro: { tipo: "c cambia cuánto responde la DA a la renta: gira.", sentido: "Más consumo por peso: la recta se empina." }, subtemas: ["da-grafica", "da-consumo"] },
  { id: "h3-4", suceso: "Sube la tasa del impuesto de renta, t.", tipo: "gira", sentido: -1, cambio: { t: 0.45 }, retro: { tipo: "t está en la inclinación, c(1 − t): gira.", sentido: "Más impuesto, menos renta disponible: se aplana." }, subtemas: ["da-grafica", "da-consumo"] },
  { id: "h3-5", suceso: "Crece la incertidumbre y cae la inversión autónoma.", tipo: "desplaza", sentido: -1, cambio: { Ibar: 80 }, retro: { tipo: "Ī es autónoma: desplaza la recta entera.", sentido: "Menos inversión, menos DA: baja." }, subtemas: ["da-grafica", "da-inversion"] },
  { id: "h3-6", suceso: "El dólar sube y crecen las exportaciones netas.", tipo: "desplaza", sentido: 1, cambio: { XN: 170 }, retro: { tipo: "XN no depende de la renta: desplaza.", sentido: "Más exportaciones netas, más DA: sube." }, subtemas: ["da-grafica", "da-exportaciones-netas"] },
  { id: "h3-7", suceso: "Las familias ahorran una fracción mayor de cada peso.", tipo: "gira", sentido: -1, cambio: { c: 0.65 }, retro: { tipo: "Ahorrar más es bajar c: cambia la inclinación.", sentido: "Si s sube, c baja: la recta se aplana." }, subtemas: ["da-grafica", "da-consumo"] },
  { id: "h3-8", suceso: "El Gobierno reduce los subsidios a familias.", tipo: "desplaza", sentido: -1, cambio: { TR: -100 }, retro: { tipo: "TR entra en el arranque, vía c·TR: desplaza.", sentido: "Menos subsidios, menos consumo: baja." }, subtemas: ["da-grafica", "da-consumo"] },
];
export const PARTIDA_H3 = 6;

/* ─── H5 · La libreta de la analista (4 de 6) ──────────────────────────── */
export const BANCO_H5 = [
  { id: "h5-1", subtemas: ["da-multiplicador"], correccion: "Inclinación c(1 − t); multiplicador 1 / [1 − c(1 − t)].", lineas: [
    { id: "a", texto: "Si c sube, el multiplicador sube.", retro: "Correcta: más c, denominador menor, multiplicador mayor." },
    { id: "b", texto: "La inclinación de la DA es c(1 − t).", retro: "Correcta: es lo que sube la DA por cada peso de Y." },
    { id: "c", texto: "El multiplicador y la inclinación son el mismo número.", falsa: true },
    { id: "d", texto: "Más t, menor multiplicador.", retro: "Correcta: los impuestos debilitan cada eco." },
  ] },
  { id: "h5-2", subtemas: ["da-grafica"], correccion: "Subir la tasa desplaza la DA hacia abajo.", lineas: [
    { id: "a", texto: "Más gasto público desplaza la DA hacia arriba.", retro: "Correcta: G es autónomo y sube el arranque." },
    { id: "b", texto: "Subir la tasa de interés gira la DA.", falsa: true },
    { id: "c", texto: "Si t sube, la DA se aplana.", retro: "Correcta: menos renta disponible por cada peso." },
    { id: "d", texto: "Un cambio en c gira la recta.", retro: "Correcta: c está en la inclinación." },
  ] },
  { id: "h5-3", subtemas: ["da-exportaciones-netas"], correccion: "Con el peso apreciado, exportar rinde menos: X baja.", lineas: [
    { id: "a", texto: "El tipo de cambio es pesos por dólar.", retro: "Correcta: así se define en clase." },
    { id: "b", texto: "Si el tipo de cambio baja, el peso se aprecia.", retro: "Correcta: con menos pesos compras un dólar." },
    { id: "c", texto: "Con el peso apreciado, las exportaciones suben.", falsa: true },
    { id: "d", texto: "XN = X − M.", retro: "Correcta: ventas al exterior menos compras al exterior." },
  ] },
  { id: "h5-4", subtemas: ["da-consumo"], correccion: "Si s baja, c sube: la DA sube.", lineas: [
    { id: "a", texto: "El consumo autónomo existe aunque la renta sea cero.", retro: "Correcta: se financia con préstamos, ahorros o ayudas." },
    { id: "b", texto: "Renta disponible = Y + TR − T.", retro: "Correcta: renta más transferencias menos impuestos." },
    { id: "c", texto: "Si la propensión a ahorrar baja, la DA baja.", falsa: true },
    { id: "d", texto: "T = tY.", retro: "Correcta: el impuesto es una tasa sobre la renta." },
  ] },
  { id: "h5-5", subtemas: ["da-inversion"], correccion: "Con b grande, cada punto de tasa mueve mucho la inversión.", lineas: [
    { id: "a", texto: "I = Ī − b·i.", retro: "Correcta: autónoma menos el efecto de la tasa." },
    { id: "b", texto: "La incertidumbre reduce la inversión autónoma.", retro: "Correcta: Ī recoge las expectativas." },
    { id: "c", texto: "Con b grande, la tasa casi no mueve la inversión.", falsa: true },
    { id: "d", texto: "Si la tasa sube, la inversión baja.", retro: "Correcta: el crédito sale más caro." },
  ] },
  { id: "h5-6", subtemas: ["da-gasto-publico"], correccion: "Un subsidio es TR: entra por la renta disponible.", lineas: [
    { id: "a", texto: "G no depende de la renta en el modelo.", retro: "Correcta: lo decide el Gobierno; es autónomo." },
    { id: "b", texto: "El Gobierno puede gastar más de lo que recauda.", retro: "Correcta: la diferencia es déficit, cubierto con deuda." },
    { id: "c", texto: "Un subsidio a familias es parte de G.", falsa: true },
    { id: "d", texto: "Recortar G baja la DA.", retro: "Correcta: G suma directo a la DA." },
  ] },
];
export const PARTIDA_H5 = 4;

/* ─── H2 · Arma la fórmula (3 etapas, 10 huecos) ───────────────────────── */
/*
 * Cada hueco dice qué fichas acepta. En la etapa 2 los huecos 2 y 3 aceptan b
 * e i en cualquier orden (producto conmutativo): el que se llene primero
 * fija cuál le queda al otro. `retro` es la de la FICHA mal puesta; `retroPrimero`
 * es la de b o i cuando caen en el primer hueco de la etapa 2.
 */
export const FICHAS_H2 = {
  Cbar: { simbolo: "C̄", nombre: "consumo autónomo" },
  c: { simbolo: "c", nombre: "propensión a consumir" },
  TR: { simbolo: "TR", nombre: "transferencias" },
  T: { simbolo: "T", nombre: "impuestos" },
  i: { simbolo: "i", nombre: "tasa de interés" },
  G: { simbolo: "G", nombre: "gasto público" },
  Ibar: { simbolo: "Ī", nombre: "inversión autónoma" },
  b: { simbolo: "b", nombre: "sensibilidad a la tasa" },
  t: { simbolo: "t", nombre: "tasa de impuesto" },
  Abar: { simbolo: "Ā", nombre: "gasto autónomo" },
  Y: { simbolo: "Y", nombre: "renta, producción" },
};

export const ETAPAS_H2 = [
  {
    id: "consumo", nombre: "Consumo", subtemas: ["da-consumo"],
    fichas: ["Cbar", "c", "TR", "T", "i", "G"],
    /* C = [ ] + [ ]( Y + [ ] − [ ] ) */
    huecos: [{ id: "k1", acepta: ["Cbar"] }, { id: "k2", acepta: ["c"] }, { id: "k3", acepta: ["TR"] }, { id: "k4", acepta: ["T"] }],
    retro: {
      Cbar: "C̄ va sola, al inicio: no depende de la renta.",
      c: "c multiplica la renta disponible: va antes del paréntesis.",
      TR: "Las transferencias suman a la renta: dentro, con +.",
      T: "Los impuestos restan a la renta: dentro, con −.",
      i: "En este modelo, la tasa mueve la inversión, no el consumo.",
      G: "G es del Gobierno; no está dentro del consumo.",
    },
  },
  {
    id: "inversion", nombre: "Inversión", subtemas: ["da-inversion"],
    fichas: ["Ibar", "b", "i", "c", "t"],
    /* I = [ ] − [ ] · [ ] */
    huecos: [{ id: "k1", acepta: ["Ibar"] }, { id: "k2", acepta: ["b", "i"], par: "k3" }, { id: "k3", acepta: ["b", "i"], par: "k2" }],
    retro: {
      Ibar: "Ī va primero: la inversión que no depende de la tasa.",
      b: "Lo que resta es b por la tasa, no va primero.",
      i: "Lo que resta es b por la tasa, no va primero.",
      c: "c es del consumo, no de la inversión.",
      t: "t es de los impuestos, no de la inversión.",
    },
  },
  {
    id: "equilibrio", nombre: "Equilibrio", subtemas: ["da-multiplicador"],
    fichas: ["c", "t", "Abar", "G", "Y"],
    /* Y₀ = 1 / (1 − [ ](1 − [ ])) · ( [ ] − b·i ) */
    huecos: [{ id: "k1", acepta: ["c"] }, { id: "k2", acepta: ["t"] }, { id: "k3", acepta: ["Abar"] }],
    retro: {
      c: "c va en el denominador, multiplicando a (1 − t).",
      t: "t va dentro de (1 − t): lo que queda tras impuestos.",
      Abar: "Ā, el gasto autónomo, va en el segundo paréntesis.",
      G: "G ya está dentro de Ā; no va suelta.",
      Y: "Y es lo que estás calculando; no va al otro lado.",
    },
  },
];

/* ─── Los subtemas válidos (ids de la ficha 1) ─────────────────────────── */
export const SUBTEMAS = [
  "da-componentes", "da-consumo", "da-inversion", "da-gasto-publico", "da-exportaciones-netas",
  "da-ecuacion-completa", "da-multiplicador", "da-grafica", "da-caso-empresario",
];
