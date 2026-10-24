import { USUARIOS } from "./contabilidadIntro.js";
import { FOTO, PELICULA, COMPARAR } from "./contabilidadPiezas234.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * TEMA 1 · LOS DOS HACER NUEVOS (lote 5): H1 «¿Un día, un año o dos fotos?»
 * y H2 «¿Quién pregunta esto?». Ids nuevos: entran al catálogo solo
 * agregando.
 *
 * Bancos de Futaba (fichas/b-t1-bancos-h1-h2-y-sin-emoji.md), con sus
 * correcciones del 24-oct (lotes A y B: h1-04, h1-07, la pista de la foto,
 * los mazos, los porqués de las parejas, la segunda vuelta de H2 y la
 * devolución de «Administradores») y las de Shoko (h1-09; revisiones/
 * b-t1-lote-b-p2-forma-shoko.md). Forma de Mai (fichas/b-t1-hacer-p2-mai.md,
 * con fichas/b-t1-p2-ajustes-shoko-mai.md §1 y §5).
 *
 * Sin emoji y sin abrir con el veredicto: eso lo dicen la pastilla y el
 * mensaje de la pieza.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════ H1 · ¿UN DÍA, UN AÑO O DOS FOTOS? ═══════════════════ */

export const H1 = {
  id: "t1-un-dia-o-un-ano",
  nombre: "¿Un día, un año o dos fotos?",
  /* ── [ESCRITO POR CLAUDE — PENDIENTE DE FUTABA] ── El subtema que titula el marco. */
  subtema: "Qué tiempo mira cada estado financiero",
  /* ── [DECISIÓN DE KAEDE, REVERSIBLE — LA CONFIRMA SAKUTA] ── */
  dificultad: "medio",
  fpBase: 25,
  porPartida: 5,
  objetivo: "Decide qué informe responde cada pregunta: un día, un año o el cambio entre dos días.",
  consigna: "Lee la pregunta de cada persona. Toca el informe que la responde.",
};

/* Los tres rótulos, fijos para todas las preguntas (Shoko; ajustes de Mai §5). */
export const RESPUESTAS_H1 = [
  { id: FOTO, texto: "Una foto" },
  { id: PELICULA, texto: "La película: todo el año" },
  { id: COMPARAR, texto: "Comparar las dos fotos" },
];

/*
 * `quien` es uno de los ocho usuarios (contabilidadIntro.js). `foto` ya no
 * rotula el botón: dice CUÁL marco se enciende al responder (enero o
 * diciembre), y solo lo llevan las que se responden con una foto.
 */
export const PREGUNTAS_H1 = [
  { id: "h1-01", quien: "acreedores", texto: "Le vendí a crédito. ¿Cuánto me seguía debiendo la empresa el 31 de diciembre?", respuesta: FOTO, foto: "diciembre",
    acierto: "Es lo que debía un día exacto, el 31 de diciembre. Eso lo muestra la foto de ese día." },
  { id: "h1-02", quien: "propietarios", texto: "¿Cuánto ganó o perdió la empresa durante el año?", respuesta: PELICULA, foto: null,
    acierto: "Ganar o perder se mide en todo un periodo. La película muestra la utilidad o la pérdida del año." },
  { id: "h1-03", quien: "empleados", texto: "¿Cuánto gastó la empresa durante todo el año?", respuesta: PELICULA, foto: null,
    acierto: "Lo que gastó se fue sumando mes a mes. Eso lo cuenta la película, no una foto de un día." },
  /* Lote A de Futaba (Shoko). */
  { id: "h1-04", quien: "estado", texto: "¿Cuánto vendió la empresa entre el 1 de enero y el 31 de diciembre?", respuesta: PELICULA, foto: null,
    acierto: "Hay dos fechas, pero no se compara nada: se suma lo que vendió entre ellas. Eso lo cuenta la película." },
  { id: "h1-05", quien: "administradores", texto: "¿Con qué plata y qué cosas arrancó la empresa el 1 de enero?", respuesta: FOTO, foto: "enero",
    acierto: "Es cómo estaba un día exacto, al comenzar el año. Eso lo muestra la foto del 1 de enero." },
  { id: "h1-06", quien: "inversionistas", texto: "¿Cuánto bajaron las deudas de la empresa entre enero y diciembre?", respuesta: COMPARAR, foto: null,
    acierto: "Te preguntan cuánto cambió de una fecha a otra. Para eso pones la foto de enero al lado de la de diciembre." },
  /* Lote A de Futaba (Shoko): la foto pasa a diciembre. */
  { id: "h1-07", quien: "acreedores", texto: "¿Cuánto le quedó debiendo la empresa al banco al cerrar el año?", respuesta: FOTO, foto: "diciembre",
    acierto: "Es lo que debía el día en que cerró el año. Eso lo muestra la foto del 31 de diciembre." },
  { id: "h1-08", quien: "asociaciones", texto: "¿Cuánto vendió esta empresa en el año? La quiero sumar a las de su sector.", respuesta: PELICULA, foto: null,
    acierto: "Lo que vendió se fue juntando durante todo el año. Eso lo cuenta la película." },
  /* La de Shoko (58 caracteres; Mai pedía ≤ 70). El acierto no cambia. */
  { id: "h1-09", quien: "clientes", texto: "¿La empresa terminó el año con más cosas que al empezarlo?", respuesta: COMPARAR, foto: null,
    acierto: "Es un cambio entre dos fechas. Lo ves al comparar la foto del 1 de enero con la del 31 de diciembre." },
  { id: "h1-10", quien: "clientes", texto: "¿Cuánta mercancía tenía la empresa el 31 de diciembre?", respuesta: FOTO, foto: "diciembre",
    acierto: "Es lo que tenía un día exacto. Eso lo muestra la foto del 31 de diciembre." },
];

/* Dos mazos de 5 (Shoko): 2 de la foto, 2 de la película y 1 de comparar en cada uno. */
export const MAZOS_H1 = {
  A: ["h1-01", "h1-05", "h1-02", "h1-04", "h1-06"],
  B: ["h1-07", "h1-10", "h1-03", "h1-08", "h1-09"],
};

/* La pista del 1.er error, según la correcta. Con un intento (C2) no sale: queda para el Repaso. */
export const PISTA_H1 = {
  [FOTO]: "¿La pregunta habla de cómo estaba algo un solo día?",
  [PELICULA]: "¿La pregunta habla de un día o de algo que pasó a lo largo del año?",
  [COMPARAR]: "¿Te preguntan cómo estaba algo, o cuánto cambió de una fecha a otra?",
};

/* Rótulos de la línea del año (P2 de Mai, §10: textos nuevos para Shoko). */
export const LINEA_H1 = { foto: "foto", enero: "1 de enero", diciembre: "31 de diciembre" };

/*
 * El texto alternativo de la línea, que dice qué está encendido (P2 de Mai,
 * §5-9: la de las dos fotos es suya; las otras tres siguen su forma).
 */
export const ALT_H1 = {
  /* ── [ESCRITO POR CLAUDE — PENDIENTE DE FUTABA] ── las cuatro que no son la de Mai. */
  reposo: "Una línea del año, del 1 de enero al 31 de diciembre, con una foto en cada punta.",
  enero: "Está encendida la foto del 1 de enero.",
  diciembre: "Está encendida la foto del 31 de diciembre.",
  pelicula: "Está encendida la película: todo el año.",
  comparar: "Están encendidas las dos fotos, la del 1 de enero y la del 31 de diciembre.",
};

/* ═══════════════════ H2 · ¿QUIÉN PREGUNTA ESTO? ═══════════════════ */

export const H2 = {
  id: "t1-quien-pregunta-esto",
  nombre: "¿Quién pregunta esto?",
  subtema: "Usuarios de la información contable",
  /* ── [DECISIÓN DE KAEDE, REVERSIBLE — LA CONFIRMA SAKUTA] ── Nivel Medio (Shoko). */
  dificultad: "medio",
  fpBase: 25,
  porPartida: 8,
  objetivo: "Lee para qué usa el informe cada persona y di quién es.",
  consigna: "Lee para qué usa alguien el informe. Elige quién es.",
  rotuloMesa: "Los ocho lectores",
};

/* Los ocho asientos, en el orden de los usuarios y siempre en el mismo lugar: si cambiaran, la posición sería una pista. */
export const ASIENTOS_H2 = USUARIOS.map((u) => ({ id: u.id, nombre: u.nombre, pregunta: u.pregunta }));

/*
 * Las ocho fichas. `opciones`: las cuatro activas, la correcta primero y la
 * que más se le parece segunda (de ahí sale el porqué de la pareja). El
 * propósito es la cita del libro (pp. 11-12) y se toma de los usuarios: un
 * solo sitio.
 */
const ficha = (id, correcta, opciones, pista, acierto) => ({
  id, correcta, opciones, pista, acierto,
  proposito: USUARIOS.find((u) => u.id === correcta).proposito,
});
export const FICHAS_H2 = [
  ficha("h2-01", "propietarios", ["propietarios", "inversionistas", "administradores", "asociaciones"],
    "Fíjate en quién le confió su capital a la administración. ¿Quién lo puso?",
    "Los dueños pusieron el capital y se lo confiaron a la administración. Quieren saber cuánto les rinde."),
  ficha("h2-02", "administradores", ["administradores", "propietarios", "empleados", "estado"],
    "¿Quién planea, controla y toma las decisiones de la empresa?",
    "Los administradores usan el informe para planear, controlar y decidir. Y para ver si lo hacen bien."),
  ficha("h2-03", "empleados", ["empleados", "administradores", "acreedores", "clientes"],
    "¿Quién les hace peticiones laborales a los empleadores?",
    "Los empleados quieren saber cómo está la empresa antes de pedirle algo a quien los contrató."),
  ficha("h2-04", "acreedores", ["acreedores", "clientes", "inversionistas", "propietarios"],
    "Responder por sus obligaciones es pagar lo que debe. ¿A quién le debe la empresa?",
    "Los acreedores y proveedores le prestaron o le vendieron a crédito. Quieren saber si les va a pagar."),
  ficha("h2-05", "clientes", ["clientes", "acreedores", "asociaciones", "empleados"],
    "¿Quién compara precios y busca otras opciones antes de comprar?",
    "Los clientes miran si la empresa les va a cumplir y comparan sus precios con los de otras."),
  /* La pista, del lote A de Futaba (Shoko). */
  ficha("h2-06", "inversionistas", ["inversionistas", "propietarios", "acreedores", "asociaciones"],
    "¿Esa plata ya está puesta en la empresa, o todavía se está pensando?",
    "Los inversionistas todavía no han puesto su plata. Miran si les conviene meterla: si es segura y deja ganancia."),
  ficha("h2-07", "asociaciones", ["asociaciones", "estado", "inversionistas", "clientes"],
    "¿Quién junta datos de muchas empresas de un mismo sector?",
    "Las asociaciones juntan los informes de muchas empresas. Con ellos sacan cifras de cada sector."),
  ficha("h2-08", "estado", ["estado", "asociaciones", "acreedores", "administradores"],
    "¿Quién cobra los impuestos y hace auditorías fiscales?",
    "El Estado usa el informe para saber cuánto cobrar de impuestos y para hacer sus controles."),
];

/* La segunda vuelta (D8; Futaba, lote B §6): los mismos ocho, con el propósito contado como un caso. */
export const CASOS_H2 = {
  "h2-01": "Hace cinco años puso plata en la empresa. Quiere ver si lo que puso le está dejando lo que esperaba.",
  "h2-02": "Tiene que decidir si la empresa abre otra sede. Antes quiere ver en qué va bien y en qué va mal.",
  "h2-03": "Va a pedir un aumento para él y sus compañeros. Primero quiere saber cómo le está yendo a la empresa.",
  "h2-04": "Le prestó plata a la empresa y el plazo vence pronto. Quiere ver si la empresa tiene con qué responder.",
  "h2-05": "Le compra a la empresa todos los meses. Quiere saber si lo podrá seguir atendiendo y si otra le vende más barato.",
  "h2-06": "Tiene unos ahorros y piensa comprar una parte de la empresa. Quiere saber si es seguro y si le dejaría ganancia.",
  "h2-07": "Cada año junta los números de las empresas de su gremio para mostrar cómo le va a todo el sector.",
  "h2-08": "Revisa si la empresa pagó lo que le tocaba de impuestos y si sus cuentas están en orden.",
};

/* La devolución según el asiento que se tocó, en las dos vueltas («Esta frase» / «Este caso»). */
export const DEVOLUCION_H2 = {
  1: {
    propietarios: "Los dueños ya pusieron su capital y miran cuánto les rinde. Esta frase habla de otra cosa.",
    /* Lote A de Futaba: sin «controlar», para que el medidor pase. */
    administradores: "Los administradores usan el informe para planear y decidir. Esta frase no habla de eso.",
    empleados: "Los empleados miran la empresa para sus peticiones laborales. Esta frase no habla de eso.",
    acreedores: "Los acreedores miran si la empresa les puede pagar lo que les debe. Esta frase pide otra cosa.",
    clientes: "Los clientes miran si la empresa les cumple y comparan precios. Esta frase pide otra cosa.",
    inversionistas: "Los inversionistas todavía no han puesto plata: miran si les conviene. Esta frase habla de otra cosa.",
    asociaciones: "Las asociaciones juntan datos de muchas empresas para sacar cifras del grupo. Esta frase mira a una sola.",
    estado: "El Estado lee el informe para cobrar impuestos y hacer controles. Esta frase no habla de impuestos.",
  },
  2: {
    propietarios: "Los dueños ya pusieron su capital y miran cuánto les rinde. Este caso habla de otra cosa.",
    administradores: "Los administradores usan el informe para planear y decidir. Este caso no habla de eso.",
    empleados: "Los empleados miran la empresa para sus peticiones laborales. Este caso no habla de eso.",
    acreedores: "Los acreedores miran si la empresa les puede pagar lo que les debe. Este caso pide otra cosa.",
    clientes: "Los clientes miran si la empresa les cumple y comparan precios. Este caso pide otra cosa.",
    inversionistas: "Los inversionistas todavía no han puesto plata: miran si les conviene. Este caso habla de otra cosa.",
    asociaciones: "Las asociaciones juntan datos de muchas empresas para sacar cifras del grupo. Este caso mira a una sola.",
    estado: "El Estado lee el informe para cobrar impuestos y hacer controles. Este caso no habla de impuestos.",
  },
};

/* El porqué de cada pareja que se confunde (Futaba, lote A §2). Vale en los dos sentidos. */
export const PAREJAS_H2 = [
  { par: ["propietarios", "inversionistas"], porque: "Los dos miran cuánto deja la plata puesta. Pero el dueño ya la puso, y el inversionista apenas piensa si ponerla." },
  { par: ["administradores", "propietarios"], porque: "Los dos miran cómo va la empresa. El dueño mira cuánto le rinde lo que puso; el administrador, cómo manejarla." },
  { par: ["empleados", "administradores"], porque: "Los dos están adentro. El empleado lee para saber qué puede pedir; el administrador, para planear y decidir." },
  { par: ["acreedores", "clientes"], porque: "Los dos miran si la empresa responde. El acreedor, si le paga lo que le debe; el cliente, si le cumple lo que compra." },
  { par: ["asociaciones", "estado"], porque: "Los dos miran desde afuera. La asociación saca cifras de todo el sector; el Estado cobra impuestos y controla." },
];

/* Alto reservado bajo la mesa para las preguntas de los dos lectores (Mai: 124; se mide en el PR). */
export const ALTO_PREGUNTAS_H2 = 124;
