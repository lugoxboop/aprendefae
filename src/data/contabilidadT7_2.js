/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T7-2 · A1 DE APRENDER — «La cuenta que sí se mueve» (pp. 207-209, 212, 214
 * y 233-236).
 *
 * Fuente: EL RECORTE DEL LOTE 1 de Near (entrega 2,
 * orquestador/conocimiento/paquetes/lote1-entrega2-v1.md, sección
 * «t7-2-a1-la-cuenta-que-si-se-mueve»), con el cambio de la entrega 6 a la
 * línea 3 del resumen («contracción del inventario» pasa también al
 * resumen). Una prueba compara cada texto de aquí contra el paquete, letra
 * por letra, en los dos sentidos (correccionesMelloRecortesT72.mjs). Mello no
 * corrige esta pieza en su auditoría de la entrega 6.
 *
 * Cinco pantallas, tres con acción: abre con la lista del libro en un
 * almacén; la diferencia con el periódico se pregunta («¿cuándo se anota el
 * costo de lo vendido?»). Sin ninguna cifra (regla 3).
 *
 * EL «¿POR QUÉ?» de cada acierto va escrito aparte (`acierto.porque`). El de
 * `el-permanente` trae «cuando» («avisan cuando queda poca mercancía»): por
 * la regla de L no se pliega, va a la vista (`porqueALaVista`).
 *
 * Pieza de Aprender: cero FP, no entra al catálogo. Los textos del recorte se
 * ven enteros (`textosEnteros`): Near ya los midió.
 *
 * Lo que el recorte no trae y se conserva de lo publicado: los pies de cada
 * pantalla, los botones y las palabras de la interfaz.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const A1_ID = "t7-2-a1-la-cuenta-que-si-se-mueve";

export const BOTON = { empezar: "Empezar", seguir: "Seguir", confirmar: "Confirmar", probarOtra: "Probar otra" };

export const INTERFAZ = { correcto: "Correcto.", incorrecto: "Incorrecto.", debe: "Debe", haber: "Haber" };

export const DEBE = "debe";
export const HABER = "haber";

/*
 * [ESCRITO POR CLAUDE, NO POR LA FICHA] PENDIENTE_DE_REVISION: los rótulos
 * de la cuenta T del resumen. El paquete solo dice «Inventario de mercancías
 * como cuenta T: entradas al debe, salidas al haber».
 */
export const PENDIENTE_DE_REVISION = { entradas: "Entradas", salidas: "Salidas" };

const PIE_LISTA = "Basado en el libro, pp. 207-208";

/* P1 · los dos mensajes de error: uno por cada lado bueno. */
const ENTRA = "Entra mercancía: el activo aumenta y va al debe.";
const SALE = "Sale mercancía: el activo baja y va al haber.";

const PORTADA = {
  id: "portada",
  tipo: "portada",
  objetivo: "Vas a ver qué cambia cuando la empresa anota su mercancía cada vez que entra o sale.",
  boton: BOTON.empezar,
  pie: "Basado en el libro, pp. 207-209 y 233-234",
};

/* P1 · la lista del libro, en un almacén (regla 5b). Las líneas se barajan al entrar; la pista es una para las cinco. */
const LISTA = {
  id: "la-lista-del-libro",
  pista: "¿La mercancía entra a la bodega o sale de ella?",
  tipo: "lados",
  parrafos: ["Un almacén usa el sistema permanente. Anota la mercancía cada vez que entra o sale."],
  consigna: "¿A qué lado va Inventario de mercancías en cada caso?",
  lineas: [
    { id: "compra", texto: "Compra mercancía.", lado: DEBE, devolucion: ENTRA },
    { id: "devuelven-clientes", texto: "Un cliente le devuelve mercancía.", lado: DEBE, devolucion: ENTRA },
    { id: "vende", texto: "Vende mercancía.", lado: HABER, devolucion: SALE },
    { id: "devuelve-proveedores", texto: "Le devuelve mercancía al proveedor.", lado: HABER, devolucion: SALE },
    { id: "consumo", texto: "Usa mercancía para su propio consumo.", lado: HABER, devolucion: SALE },
  ],
  pie: PIE_LISTA,
  error: { pie: PIE_LISTA },
  acierto: {
    texto: "Así es: lo que entra va al debe, y lo que sale, al haber.",
    porque: "La lista del libro trae dos líneas más, del periódico: al cierre, el inventario final va al debe y el inicial al haber. Los sobrantes y los faltantes los verás en «Inventarios III».",
    pie: PIE_LISTA,
  },
};

/* P2 · el permanente, como pregunta. */
const PIE_PERMANENTE = "Basado en el libro, pp. 233-234 y 236";
const PERMANENTE = {
  id: "el-permanente",
  pista: "Piensa en qué cambia si la empresa anota su mercancía cada vez que sale.",
  tipo: "eleccion",
  parrafos: ["El costo de la mercancía vendida es lo que costaron las unidades que salieron con las ventas."],
  pregunta: "En el permanente, ¿cuándo se anota?",
  opciones: [
    { id: "cada-venta", texto: "En cada venta", correcta: true },
    { id: "al-cierre", texto: "Al cierre, con el conteo", correcta: false, devolucion: "Así es en el periódico. El permanente lo anota antes." },
    { id: "nunca", texto: "Nunca: solo se anota el precio", correcta: false, devolucion: "Sí se anota: el permanente lleva el costo de cada venta." },
  ],
  pie: PIE_PERMANENTE,
  error: { pie: PIE_PERMANENTE },
  acierto: {
    texto: "Así es: por eso Inventario de mercancías está al día todo el tiempo.",
    /* Regla de L: trae «cuando»; va a la vista. */
    porque: "Según el libro, lo usan los almacenes de cadena, con computadores y lectores en las cajas. Los registros avisan cuando queda poca mercancía. Y dan el inventario final sin hacer un conteo cada mes.",
    porqueALaVista: true,
    pie: PIE_PERMANENTE,
  },
};

/* P3 · el conteo en el permanente. */
const PIE_CONTEO = "Basado en el libro, pp. 233-234";
const CONTEO = {
  id: "el-conteo-en-el-permanente",
  pista: "En el permanente, el saldo ya está al día después de cada venta. ¿Qué le queda por hacer al conteo?",
  tipo: "eleccion",
  parrafos: [],
  pregunta: "En el permanente, ¿para qué sirve el conteo físico?",
  opciones: [
    { id: "verificar", texto: "Para verificar que los registros estén bien.", correcta: true },
    { id: "hallar", texto: "Para hallar el costo de lo vendido, como en el periódico.", correcta: false, devolucion: "En el permanente, el costo de lo vendido ya se anota en cada venta. El conteo no lo halla." },
    { id: "no-hace-falta", texto: "No hace falta: el sistema ya lo sabe todo.", correcta: false, devolucion: "El libro dice que el permanente no quita el conteo físico: se hace al menos una vez al año." },
  ],
  pie: PIE_CONTEO,
  error: { pie: PIE_CONTEO },
  acierto: {
    texto: "Así es: el conteo verifica los registros.",
    porque: "El conteo puede hallar diferencias por robo, daños o pérdidas. El libro las llama contracción del inventario.",
    pie: PIE_CONTEO,
  },
};

/* P4 · el resumen abre con la cuenta T (provisional para Watari): entradas al debe, salidas al haber. */
const RESUMEN = {
  id: "resumen",
  tipo: "resumen",
  cuentaT: { cuenta: "Inventario de mercancías", debe: PENDIENTE_DE_REVISION.entradas, haber: PENDIENTE_DE_REVISION.salidas },
  lista: [
    "En el permanente, Inventario de mercancías sube con lo que entra y baja con lo que sale.",
    "El costo de lo vendido se anota en cada venta, no al cierre.",
    /* La línea 3, con el cambio de la entrega 6. */
    "El conteo físico verifica los registros al menos una vez al año. Sus diferencias se llaman contracción del inventario.",
  ],
  siguiente: "Siguiente: «La venta en dos asientos».",
  pie: "Basado en el libro, pp. 207-208 y 233-236",
};

export const PIEZA_LA_CUENTA_QUE_SI_SE_MUEVE = {
  id: A1_ID,
  numero: 1,
  titulo: "La cuenta que sí se mueve",
  textosEnteros: true,
  pantallas: [PORTADA, LISTA, PERMANENTE, CONTEO, RESUMEN],
};
