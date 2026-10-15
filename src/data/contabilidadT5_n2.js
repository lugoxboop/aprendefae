/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T5 · N2 DE APRENDER — «Cómo se cuidan las inversiones» (p. 193). Célula C.
 *
 * Fuente: la tanda 1 v1.1 de Near (N1, N2 y N3), ajustada a la decisión T5
 * v1.1 de L y a la auditoría de Mello. Copia en
 * orquestador/conocimiento/paquetes/t5-tanda1-v1.1.md; una prueba compara
 * cada texto de aquí contra ella, letra por letra.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Ocho pantallas (P0 a P7),
 * sin figura y sin cifras: las cuatro acciones de control de la p. 193, una
 * por pantalla, y una práctica de opción. Molde: A7 de T7-1, y su mismo
 * componente (t7/ControlInterno.jsx, que recibe la pieza).
 *
 * Construcción de Near, marcada en la tanda (se dice aquí, no en pantalla):
 * la unión entre riesgos y controles de P1, la glosa de «en tránsito» de P4
 * y los dos casos de ejemplo (el CDT de la caja fuerte y los bonos pagados el
 * viernes). HUECO de P5: el libro solo nombra los fondos fiduciarios; por la
 * v1.1 no se les inventa contenido, y la pantalla lo dice.
 *
 * Errata C5-b: el libro escribe «Verificar las activos financieros». La pieza
 * dice «verificar cada inversión» y no copia la errata.
 *
 * Lo que la tanda no trae y se toma de la convención de A7 de T7-1: el botón
 * «Seguir» de P2 a P5 y de los aciertos, «Confirmar» y «Probar otra», y la
 * interfaz «Correcto.» e «Incorrecto.». La tanda da el pie solo en P0 y P7:
 * las demás pantallas van sin pie.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const N2_ID = "t5-a1-cuidar-las-inversiones";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

const PIE = "Basado en el libro, p. 193";

/* P0 · Portada. */
const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás qué revisiones pide el libro para cuidar las inversiones.",
  boton: BOTON.empezar,
  pie: PIE,
};

/* P1 · Por qué revisar. El primer párrafo es construcción de Near: el libro no nombra estos riesgos. */
const POR_QUE = {
  id: "por-que-revisar",
  tipo: "lectura",
  parrafos: [
    "Una inversión es un documento que vale dinero. Si nadie lo revisa, se puede perder, vencer sin que nadie lo cobre, o quedar mal registrado.",
    "Para un buen control de las inversiones, el libro pide cuatro acciones. Míralas una por una.",
  ],
  boton: BOTON.seguir,
  pie: null,
};

/* P2 · Verificar. El segundo párrafo es un caso de ejemplo construido. */
const VERIFICAR = {
  id: "verificar",
  tipo: "lectura",
  parrafos: [
    "La primera es verificar cada inversión. Se revisa qué documento la respalda, la fecha de compra o de venta, el precio, quién emitió el documento, cuándo vence y su número de serie.",
    "Por ejemplo, alguien saca un CDT de la caja fuerte. Compara sus datos con los registros: quién lo emitió, la fecha, el precio, cuándo vence y el número.",
  ],
  boton: BOTON.seguir,
  pie: null,
};

/* P3 · Examinar. */
const EXAMINAR = {
  id: "examinar",
  tipo: "lectura",
  parrafos: [
    "La segunda es examinar los movimientos de compra y venta de inversiones. Cada vez que la empresa compra o vende un título, alguien revisa esa operación.",
  ],
  boton: BOTON.seguir,
  pie: null,
};

/* P4 · Confirmar. La glosa de «en tránsito» y el caso son construcción: el libro no la define. */
const CONFIRMAR = {
  id: "confirmar",
  tipo: "lectura",
  parrafos: [
    "La tercera es confirmar las operaciones en tránsito. Son las que ya empezaron y todavía no terminan.",
    "Por ejemplo, la empresa pagó unos bonos el viernes, pero el documento aún no le ha llegado. Alguien confirma que esa compra sí está en curso.",
  ],
  boton: BOTON.seguir,
  pie: null,
};

/* P5 · Comprobar. HUECO: el libro solo da el nombre; no se le inventa contenido (v1.1). */
const COMPROBAR = {
  id: "comprobar",
  tipo: "lectura",
  parrafos: [
    "La cuarta es comprobar que existan los fondos fiduciarios, cuando la inversión los pida.",
    "El libro solo nombra esta acción. No explica qué es un fondo fiduciario.",
  ],
  boton: BOTON.seguir,
  pie: null,
};

/* P6 · Práctica. Caso construido; opciones en orden aleatorio. */
const PRACTICA = {
  id: "practica",
  tipo: "eleccion",
  parrafos: [],
  pregunta: "La empresa guarda un CDT, pero nadie sabe cuándo vence. ¿Qué acción del libro falta?",
  opciones: [
    { id: "verificar", texto: "Verificar la inversión.", correcta: true },
    {
      id: "examinar",
      texto: "Examinar las compras y las ventas.",
      correcta: false,
      devolucion: "Examinar revisa las compras y las ventas, no los datos del documento. El vencimiento se revisa al verificar la inversión.",
    },
    {
      id: "confirmar",
      texto: "Confirmar las operaciones en tránsito.",
      correcta: false,
      devolucion: "Confirmar es para lo que está en tránsito. La fecha en que vence es un dato del documento: eso se verifica.",
    },
  ],
  pie: null,
  error: { pie: null },
  acierto: { texto: "Así es. Al verificar la inversión se revisa, entre otras cosas, cuándo vence.", pie: null },
};

/* P7 · Resumen, sin botón. Los cuatro puntos van como párrafos, en el orden de la tanda. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  parrafos: [
    "Verificar: revisar los datos de cada documento. Por ejemplo, quién lo emitió, su precio y cuándo vence.",
    "Examinar: revisar cada compra y cada venta de inversiones.",
    "Confirmar: revisar que lo que ya empezó siga en curso.",
    "Comprobar: ver que exista el fondo fiduciario, si la inversión lo pide.",
  ],
  boton: null,
  siguiente: "Siguiente: «¿Qué revisión falta?».",
  pie: PIE,
};

export const PIEZA_CUIDAR_LAS_INVERSIONES = {
  id: N2_ID,
  titulo: "Cómo se cuidan las inversiones",
  pantallas: [PORTADA, POR_QUE, VERIFICAR, EXAMINAR, CONFIRMAR, COMPROBAR, PRACTICA, RESUMEN],
};
