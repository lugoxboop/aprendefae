/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A1 DE APRENDER — «La cuenta que sí se mueve» (pp. 207-209, 212, 214
 * y 233-236).
 *
 * Fuente: la v1 de Near, con PASA de Mello. Copia en
 * orquestador/conocimiento/paquetes/t7-2-a1-v1.md; una prueba compara cada
 * texto de aquí contra ella, letra por letra.
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Siete pantallas, sin
 * figura y sin ninguna cifra (regla 3: T7-2 se entiende sola y no muestra
 * nada del periódico con números).
 *
 * Lo que la v1 no trae y se toma de la convención de T7-1 (AP1, AP4, A7): los
 * botones «Empezar», «Seguir», «Confirmar» y «Probar otra», y las palabras
 * «Correcto.», «Incorrecto.», «Debe» y «Haber» de la interfaz.
 *
 * Construcción de Near, marcada en la v1 (se dice aquí, no en pantalla): la
 * glosa de «costo de la mercancía vendida» (P2), «lectores en las cajas»
 * (P2), «para su propio consumo» (P3) y la lectura de cada línea como
 * entrada o salida (P3).
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A1_ID = "t7-2-a1-la-cuenta-que-si-se-mueve";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto.", debe: "Debe", haber: "Haber" };

export const DEBE = "debe";
export const HABER = "haber";

const PIE_LISTA = "Basado en el libro, pp. 207-208";

/* P3 · los dos mensajes de error: uno por cada lado bueno. */
const ENTRA = "Entra mercancía a la bodega, así que el activo aumenta. Un activo que aumenta va al debe.";
const SALE = "Sale mercancía de la bodega, así que el activo disminuye. Un activo que disminuye va al haber.";

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Al terminar, sabrás cuándo Inventario de mercancías va al debe y cuándo al haber. Y sabrás qué cambia en el sistema permanente.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 207-209 y 233-234",
};

/* P1 · el repaso del periódico, sin cifras y sin depender de T7-1. */
const REPASO = {
  id: "repaso-del-periodico",
  tipo: "lectura",
  parrafos: [
    "Primero, un repaso. En el sistema periódico, la empresa no anota su mercancía día a día. Las compras van a una cuenta llamada Compras, e Inventario de mercancías no se mueve hasta el cierre.",
    "Al vender, solo se anota cuánto se cobró. El costo de lo vendido se halla al cierre, con un conteo físico de la bodega.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 209, 212 y 214",
};

/* P2 · el permanente. La última línea es la refutación de la idea que trae el estudiante. */
const PERMANENTE = {
  id: "el-permanente",
  tipo: "lectura",
  parrafos: [
    "En el sistema permanente es distinto. La empresa anota todos los días su mercancía y el costo de lo que vende.",
    "El costo de la mercancía vendida es lo que costaron las unidades que salieron con las ventas. En el permanente se anota cada vez que hay una venta.",
    "El libro dice que grandes almacenes de cadena usan este sistema. Lo llevan con computadores y con lectores en las cajas.",
    "Los registros también avisan cuando queda poca mercancía. Así se sabe que hay que comprar más.",
    "Si la empresa prepara estados financieros cada mes, los registros ya muestran el inventario final. No hace falta un conteo cada mes.",
    "Por eso, en el permanente, la cuenta Inventario de mercancías sí se mueve. Sube cuando entra mercancía y baja cuando sale.",
  ],
  boton: BOTON.seguir,
  pie: "Basado en el libro, pp. 233-234 y 236",
};

/* P3 · la lista del libro (regla 5b). Las líneas se barajan al entrar. */
const LISTA = {
  id: "la-lista-del-libro",
  pista: "Pregúntate si la mercancía entra a la bodega o sale de ella. Inventario de mercancías es un activo.",
  tipo: "lados",
  consigna: "El libro da la lista de cuándo esta cuenta va al debe y cuándo va al haber. Toca Debe o Haber en cada línea.",
  lineas: [
    { id: "compra", texto: "El costo de la mercancía que la empresa compra.", lado: DEBE, devolucion: ENTRA },
    { id: "devuelven-clientes", texto: "El costo de la mercancía que le devuelven los clientes.", lado: DEBE, devolucion: ENTRA },
    { id: "vende", texto: "El costo de la mercancía que la empresa vende.", lado: HABER, devolucion: SALE },
    { id: "devuelve-proveedores", texto: "El costo de la mercancía que la empresa le devuelve a sus proveedores.", lado: HABER, devolucion: SALE },
    { id: "consumo", texto: "El valor de la mercancía que la empresa usa para su propio consumo.", lado: HABER, devolucion: SALE },
  ],
  pie: PIE_LISTA,
  error: { pie: PIE_LISTA },
  acierto: { texto: "Así es. Lo que entra a la bodega va al debe, y lo que sale va al haber.", pie: PIE_LISTA },
};

/* P4 · lo que falta de la lista: el cierre periódico, como repaso, y los sobrantes y faltantes, solo nombrados. */
const LO_QUE_FALTA = {
  id: "lo-que-falta-de-la-lista",
  tipo: "lectura",
  parrafos: [
    "La lista del libro trae dos líneas más del sistema periódico, que se usan al cierre.",
    "Al cierre, el inventario final se anota en el debe, y el inventario inicial se anota en el haber.",
    "Trae también los sobrantes y los faltantes que aparecen al hacer un conteo. Esos los verás en «Inventarios III».",
  ],
  boton: BOTON.seguir,
  pie: PIE_LISTA,
};

/* P5 · el conteo en el permanente. Fuera, «obsolescencia»: no está enseñada. */
const CONTEO = {
  id: "el-conteo-en-el-permanente",
  pista: "En el permanente, el saldo ya está al día después de cada venta. ¿Qué le queda por hacer al conteo?",
  tipo: "eleccion",
  parrafos: [],
  pregunta: "En el permanente, ¿para qué sirve el conteo físico?",
  opciones: [
    { id: "verificar", texto: "Para verificar que los registros estén bien.", correcta: true },
    {
      id: "hallar",
      texto: "Para hallar el costo de lo vendido, como en el periódico.",
      correcta: false,
      devolucion: "En el permanente, el costo de lo vendido ya se anota en cada venta. El conteo no lo halla: lo verifica.",
    },
    {
      id: "no-hace-falta",
      texto: "No hace falta: el sistema ya lo sabe todo.",
      correcta: false,
      devolucion: "El libro dice que el permanente no elimina la necesidad de hacer un conteo físico, al menos una vez al año.",
    },
  ],
  pie: "Basado en el libro, pp. 233-234",
  error: { pie: "Basado en el libro, pp. 233-234" },
  acierto: {
    texto: "Así es. El conteo verifica los registros. Las diferencias que encuentra, por robo, daños o pérdidas, se llaman contracción del inventario.",
    pie: "Basado en el libro, pp. 233-234",
  },
};

const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  lista: [
    "En el permanente, Inventario de mercancías se mueve todo el tiempo. Sube con lo que entra y baja con lo que sale.",
    "El costo de lo vendido se anota en cada venta, no al cierre.",
    "El conteo físico, al menos una vez al año, verifica que los registros estén bien.",
  ],
  siguiente: "Siguiente: «La venta en dos asientos».",
  pie: "Basado en el libro, pp. 207-208 y 233-236",
};

export const PIEZA_LA_CUENTA_QUE_SI_SE_MUEVE = {
  id: A1_ID,
  numero: 1,
  titulo: "La cuenta que sí se mueve",
  pantallas: [PORTADA, REPASO, PERMANENTE, LISTA, LO_QUE_FALTA, CONTEO, RESUMEN],
};
