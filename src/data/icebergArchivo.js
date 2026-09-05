/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EN PAUSA, NO DESCARTADO — caso "la tienda de ropa en diciembre".
 *
 * Era el contenido de la mecánica "Constructor de arriba hacia abajo", que se
 * retiró al reorganizar el tema alrededor de la taxonomía de Bloom: su nivel
 * cognitivo lo cubren ahora la Cámara de Presión y el Radar de Profundidad.
 *
 * El texto se queda porque está escrito, revisado y clasificado nivel por
 * nivel, con sus trampas entre niveles ya calibradas. Borrarlo obligaría a
 * rehacer ese trabajo si el caso vuelve.
 *
 * Hoy no lo importa nadie. Eso es esperado: no es código muerto por descuido.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const EVENTO_ARCHIVADO = "Las ventas de la tienda bajan en diciembre, mientras el promedio del sector sube.";

/* Texto corto para las tarjetas del dibujo; el completo va en las preguntas. */
const NIVELES_DIAGRAMA = [
  { name: "Evento", lines: ["Las ventas bajan", "en diciembre"] },
  { name: "Patrón", lines: ["Baja cada diciembre", "desde hace 3 años"] },
  { name: "Estructura", lines: ["No ajusta inventario", "ni horarios de", "fin de año"] },
  { name: "Modelo mental", lines: ["Cree que no depende", "de la temporada"] },
];

export const NIVELES_ARCHIVADOS = [
  { name: "Evento", lines: ["Las ventas bajan", "en diciembre"] },
  { name: "Patrón", lines: ["Baja cada diciembre", "desde hace 3 años"] },
  { name: "Estructura", lines: ["No ajusta inventario", "ni horarios de", "fin de año"] },
  { name: "Modelo mental", lines: ["Cree que no depende", "de la temporada"] },
];

export const PREGUNTAS_ARCHIVADAS = [
  {
    nivel: "Patrón",
    enunciado: "¿Cuál de estas afirmaciones describe el PATRÓN detrás del evento?",
    opciones: [
      {
        id: "a", correcta: true,
        texto: "Cada diciembre, desde hace 3 años, las ventas de la tienda bajan mientras el sector sube",
        feedback: "✅ Exacto. Un patrón es algo que se repite — no pasó una vez, pasa siempre.",
      },
      {
        id: "b",
        texto: "La tienda no tiene un sistema de inventario que anticipe la temporada",
        feedback: "❌ Eso es lo que sostiene el problema por debajo (estructura), no lo que se repite (patrón).",
      },
      {
        id: "c",
        texto: "El dueño cree que en diciembre la gente solo compra regalos, no ropa para sí misma",
        feedback: "❌ Eso es una creencia de alguien (modelo mental), no algo que puedas contar repitiéndose (patrón).",
      },
      {
        id: "d",
        texto: "Este diciembre las ventas bajaron un 15%",
        feedback: "❌ Eso pasó una sola vez — un patrón necesita repetirse, no ser solo un hecho aislado.",
      },
    ],
  },
  {
    nivel: "Estructura",
    enunciado: "¿Cuál describe la ESTRUCTURA que sostiene ese patrón?",
    opciones: [
      {
        id: "a", correcta: true,
        texto: "La tienda no ajusta su inventario ni sus horarios para fin de año, a diferencia de otras tiendas del sector",
        feedback: "✅ Exacto. La estructura es lo que sostiene el problema por debajo — reglas, costumbres, o algo que falta.",
      },
      {
        id: "b",
        texto: "El mes pasado se agotó una talla y no la repusieron",
        feedback: "❌ Eso es un evento puntual, no parte del sistema que sostiene el problema.",
      },
      {
        id: "c",
        texto: "El dueño piensa que su clientela fija no cambia sus hábitos en diciembre",
        feedback: "❌ Eso es una creencia, no un proceso o recurso concreto.",
      },
      {
        id: "d",
        texto: "Cada año la tienda cierra dos horas antes en diciembre por baja afluencia percibida",
        feedback: "❌ Cerca, pero describe una conducta repetida (patrón), no la causa estructural detrás.",
      },
    ],
  },
  {
    nivel: "Modelo mental",
    enunciado: "¿Cuál es el MODELO MENTAL en la raíz de todo lo anterior?",
    opciones: [
      {
        id: "a", correcta: true,
        texto: "El dueño cree que su negocio no depende de la temporada, que sus clientes leales compran igual todo el año",
        feedback: "✅ Exacto. El modelo mental es la creencia de fondo — lo que alguien piensa que es cierto, aunque nadie lo diga en voz alta. Ahí está la raíz de todo lo demás.",
      },
      {
        id: "b",
        texto: "No existe un plan de marketing de temporada",
        feedback: "❌ Eso es una estructura (o su ausencia), no una creencia.",
      },
      {
        id: "c",
        texto: "Las ventas bajan todos los diciembres consecutivos",
        feedback: "❌ Eso es el patrón que ya identificaste, no la creencia que lo explica.",
      },
      {
        id: "d",
        texto: "Un cliente se quejó de que no había promociones navideñas",
        feedback: "❌ Eso es un evento aislado, no una creencia de fondo.",
      },
    ],
  },
];
