/*
 * ═══════════════════════════════════════════════════════════════════════════
 * T4 · A0 DE APRENDER — «El activo corriente» (Célula D). REDISEÑO DE ENGANCHE.
 *
 * Diseño: Hanayama, «El año en marcha» (celula-d/hanayama-a0-rediseno.md),
 * aprobado por Yujiro en su corte de calidad del 15 oct 2026. Textos: Katsumi
 * (celula-d/katsumi-texto-rediseno.md), aprobados tal cual. Copia en el canon:
 * orquestador/conocimiento/paquetes/d4-t4-a0-v3-rediseno.md. Una prueba
 * compara cada texto de aquí contra ella, letra por letra.
 *
 * Pasa la barra de enganche B1-B5 (canon: orquestador/conocimiento/
 * enganche.md): ocho pantallas, la figura en los primeros 280 px a 320, como
 * mucho 40 palabras antes de ella y 60 en toda la pantalla, y en seis de ocho
 * el estudiante arrastra o pasa el año y la figura responde.
 *
 * La figura: una pista de «hoy» a la raya del año. Cada activo es una fila;
 * cuando la mano del tiempo pasa por el mes en que ese activo se vuelve plata,
 * la fila se enciende con «plata». Lo que llega a la raya sin volverse plata
 * cruza al otro lado: «No es corriente». Los meses son posiciones de dibujo
 * (Hanayama, supuestas) y nunca se escriben en pantalla.
 *
 * Aprender: sin FP, sin catálogo y sin llamar al motor.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { BOTON } from "./contabilidadT4.js";

export const A0_ID = "t4-a0-el-activo-corriente";

/* La raya del año, en % del ancho de la pista (Hanayama §3.2). */
export const RAYA_A0 = 70;

/*
 * Los rótulos de la figura (Hanayama §1 y §3.1): renglones fijos, sin
 * abreviar. Las zonas, la pista y la marca de la fila.
 */
export const FIGURA_ANO = {
  zonaSi: ["Corriente"],
  zonaNo: ["No es", "corriente"],
  hoy: "hoy",
  unAno: "1 año",
  marca: { plata: "plata", consumio: "se consumió" },
  pasar: "Pasar el año",
  volver: "Volver a hoy",
  otraVez: "Otra vez",
  /* D7: el aviso de «Pasar el año» con filas sin marcar, neutro: no es una devolución (Katsumi, lote §5.3). */
  aviso: "Marca las tres filas primero.",
  pista: "El año",
  /* El texto alternativo de la figura y el nombre de cada casilla del juego para el lector (Katsumi, «Pendientes del #260»). */
  alt: "Una pista de hoy a un año. Cuando pasa el año, cada activo se marca al volverse plata o al consumirse; el que no, cruza la raya hacia «No es corriente».",
  casilla: { antes: "corriente, antes de la raya", despues: "no es corriente, después de la raya" },
  valorPista: (m) => `${m} de 12 meses`,
};

/*
 * La casilla elegida lleva la pastilla con palabra de MARCA (contabilidadT4.js):
 * «✓ Correcto» o «✗ No va aquí» (prompt maestro §4.2; Katsumi, lote del 16
 * oct: las palabras cortas de antes salen). Nunca «era»: nombraría la
 * respuesta.
 */

/*
 * Las filas. `mes`: cuándo se vuelve plata (null = nunca, cruza la raya).
 * `consume`: se gasta dentro del año en vez de volverse plata (Tema 2).
 * Rótulos literales del paquete, partidos en renglones fijos (Hanayama §3.1).
 */
export const FILAS_A0 = {
  mercancia: { id: "mercancia", texto: ["Mercancía"], glosa: ["se cobra este mes"], mes: 1 },
  edificioOficina: { id: "edificio", texto: ["Edificio de", "la oficina"], glosa: ["dura años"], mes: null },
  caja: { id: "caja", texto: ["Efectivo en caja"], glosa: [], mes: 0 },
  bancos: { id: "bancos", texto: ["Depósitos", "en bancos"], glosa: [], mes: 0 },
  inversiones: { id: "inversiones", texto: ["Inversiones", "a corto plazo"], glosa: ["menos de un año"], mes: 7 },
  cartera: { id: "cartera", texto: ["Cartera"], glosa: ["lo que deben los clientes"], mes: 2 },
  inventarios: { id: "inventarios", texto: ["Inventarios"], glosa: ["mercancía para vender"], mes: 4 },
  deuda: { id: "deuda", texto: ["Deuda de", "un cliente"], glosa: ["a tres años"], mes: null },
  unEdificio: { id: "un-edificio", texto: ["Un edificio"], glosa: [], mes: null },
  terreno: { id: "terreno", texto: ["Un terreno"], glosa: [], mes: null },
  maquina: { id: "maquina", texto: ["Una máquina"], glosa: [], mes: null },
  vehiculo: { id: "vehiculo", texto: ["Un vehículo"], glosa: [], mes: null },
  arriendo: { id: "arriendo", texto: ["Arriendo pagado", "por adelantado"], glosa: ["seis meses"], mes: 6, consume: true },
};
const F = FILAS_A0;

/*
 * Las ocho pantallas (Hanayama §2, textos de Katsumi). `figura: "ano"` en
 * todas. `pregunta`: la pantalla pregunta, y «Seguir» no aparece hasta el
 * acierto (regla D7 del canon, decisión de Yujiro sobre el §2.4 de Hanayama). `modo`: "pista" (se arrastra o se pasa el año), "juego" (P3: se
 * marca cada fila y la raya decide) o "quieta" (la figura en el mes 12, sin
 * acción).
 */
export const PANTALLAS_A0 = [
  {
    id: "la-prueba", figura: "ano", modo: "pista",
    /* Lote B, capa 1 (Hanayama §2.1; Katsumi v2): la pieza abre con la figura; el rótulo va sobre la pista y la definición aparece con el primer arrastre. */
    rotuloAccion: "Arrastra el año",
    despuesConAccion: [{ texto: "Un activo es corriente si se vuelve plata antes de un año." }],
    filas: [F.mercancia, F.edificioOficina],
    pie: "Basado en el libro, pp. 177-178",
  },
  {
    id: "el-efectivo", figura: "ano", modo: "pista",
    antes: ["El libro empieza por el efectivo, en caja y en bancos. Pasa el año."],
    filas: [F.caja, F.bancos],
    despues: ["Nada cambia: ya era plata. Por eso va primero."],
    pie: "Basado en el libro, pp. 178-179",
  },
  {
    id: "los-otros-tres", figura: "ano", modo: "pista",
    antes: ["El libro nombra otros tres. ¿Se vuelven plata antes de la raya?"],
    filas: [F.inversiones, F.cartera, F.inventarios],
    pie: "Basado en el libro, p. 178",
  },
  {
    id: "cual-cruza", figura: "ano", modo: "juego", pregunta: true,
    antes: ["Marca cada fila."],
    filas: [F.mercancia, F.deuda, F.edificioOficina],
    /* Acierto: «Correcto.» y nada más (Katsumi). Error: ✗ y el texto; no nombra la respuesta. */
    acierto: "",
    error: "¿Qué se volvió plata?",
    /* D6 (Katsumi, lote del Kit): si la deuda va del lado corriente, su error propio; con varios errores, gana este. */
    errorFila: { fila: "deuda", lado: "antes", texto: "Que te deban no basta: cuenta cuándo pagan." },
    pie: "Basado en el libro, p. 178",
  },
  {
    id: "los-fijos", figura: "ano", modo: "pista",
    antes: ["El libro nombra los activos fijos. La empresa los usa por años para trabajar, no para venderlos."],
    filas: [F.unEdificio, F.terreno, F.maquina, F.vehiculo],
    despues: ["Van en el activo no corriente."],
    pie: "Basado en el libro, pp. 178-179",
  },
  {
    id: "se-consume", figura: "ano", modo: "pista",
    antes: ["El Tema 2 añade un caso: también es corriente lo que se consume dentro del año. Pasa el año."],
    filas: [F.arriendo],
    pie: "Basado en el Tema 2 y en el libro, p. 178",
  },
  {
    id: "por-que-importan", figura: "ano", modo: "quieta",
    antes: ["Con lo corriente se pagan deudas."],
    filas: [F.caja, F.edificioOficina],
    /* Lote B, capa 4: la frase de cierre, pegada a la figura quieta en el mes 12, desde que se llega (Katsumi, versión final). */
    cierre: "Corriente: se vuelve plata o se consume antes de un año. Los fijos ayudan a producirla.",
    cierreAl: "llegar",
    siguiente: "Siguiente: «La caja».",
    pie: "Basado en el libro, pp. 178-179",
  },
];

/* Qué es una fila en el mes m: «plata» o «consumio» desde su mes; «despues» si llegó a la raya sin volverse plata. */
export function estadoFilaA0(fila, mes) {
  if (fila.mes != null && mes >= fila.mes) return fila.consume ? "consumio" : "plata";
  if (mes >= 12) return "despues";
  return "espera";
}

/* El juego (P3): la casilla correcta de una fila es «antes» si se vuelve plata (o se consume) dentro del año. */
export const ladoCorrectoA0 = (fila) => (fila.mes != null ? "antes" : "despues");
export const juegoBienA0 = (filas, elecciones) => filas.every((f) => elecciones[f.id] === ladoCorrectoA0(f));

/* `numero` 0: va delante de A1 (número 1) en PIEZAS_T4. */
export const PIEZA_EL_ACTIVO_CORRIENTE = {
  id: A0_ID,
  numero: 0,
  titulo: "El activo corriente",
  /* D2 (Shibukawa; Yujiro): el objetivo de la pieza, una línea fija bajo el título en la P0 (Katsumi). */
  objetivo: "Separar activos corrientes de activos fijos.",
  boton: BOTON.seguir,
  pantallas: PANTALLAS_A0,
};
