/*
 * Casos de "Asedio Estratégico — Defiende tu Margen".
 *
 * Los perfiles los fija la pedagogía, no el código: aquí solo se transcriben.
 * Cada uno suma exactamente 10, que es el total de puntos que el estudiante
 * reparte, y el orden de las fuerzas es siempre el mismo para que el pentágono
 * no se reordene entre rondas.
 *
 * La ronda 3 es la que sostiene todo el ejercicio: el poder está en el
 * comprador, no en la competencia. Es la que rompe el reflejo de "la rivalidad
 * siempre manda", así que si alguna vez hay que recortar rondas, esa se queda.
 */

/* Orden fijo: es el que se dibuja alrededor del núcleo, empezando arriba. */
export const FUERZAS = [
  { id: "rivalidad", nombre: "Rivalidad entre competidores", corto: "Rivalidad" },
  { id: "entrantes", nombre: "Amenaza de nuevos entrantes", corto: "Nuevos entrantes" },
  { id: "compradores", nombre: "Poder de negociación de compradores", corto: "Compradores" },
  { id: "sustitutos", nombre: "Amenaza de sustitutos", corto: "Sustitutos" },
  { id: "proveedores", nombre: "Poder de negociación de proveedores", corto: "Proveedores" },
];

export const PUNTOS_TOTALES = 10;

export const CASOS = [
  {
    id: "comida-rapida",
    titulo: "Comida rápida en un centro comercial",
    texto:
      "Cadena de comida rápida independiente en un centro comercial de Bogotá, mercado saturado, poca diferenciación de marca.",
    ideal: { rivalidad: 3, entrantes: 2, compradores: 2, sustitutos: 2, proveedores: 1 },
    porque: {
      rivalidad: "Mercado saturado, muchas alternativas casi idénticas.",
      entrantes: "Barreras de entrada bajas: cualquiera puede abrir un local similar.",
      compradores: "El cliente cambia de local sin ningún costo.",
      sustitutos: "Domicilios, cocinar en casa, otras cadenas.",
      proveedores: "Insumos genéricos, muchos proveedores disponibles.",
    },
  },
  {
    id: "aerolinea",
    titulo: "Aerolínea con ruta exclusiva",
    texto: "Aerolínea nacional que es la única con vuelo directo en una ruta específica.",
    ideal: { rivalidad: 1, entrantes: 1, compradores: 2, sustitutos: 2, proveedores: 4 },
    porque: {
      rivalidad: "Poca competencia directa en esa ruta específica.",
      entrantes: "Barreras altísimas: aviones, licencias, slots aeroportuarios.",
      compradores: "Poca alternativa directa en esa ruta.",
      sustitutos: "Bus o carro en trayectos cortos, casi nulo en trayectos largos.",
      proveedores: "Pocos fabricantes de aviones (Boeing/Airbus) y sindicatos de pilotos con poder real.",
    },
  },
  {
    id: "software-minero",
    titulo: "Software para un nicho minero",
    texto:
      "Fabricante local de software especializado para un nicho muy específico de la industria minera colombiana.",
    ideal: { rivalidad: 1, entrantes: 1, compradores: 5, sustitutos: 2, proveedores: 1 },
    porque: {
      rivalidad: "Pocos competidores en un nicho tan específico.",
      entrantes: "Conocimiento técnico muy especializado y relaciones ya construidas.",
      compradores: "Pocas empresas mineras grandes en Colombia: cada cliente es un porcentaje enorme de los ingresos.",
      sustitutos: "Software especializado, difícil de reemplazar con algo genérico.",
      proveedores: "Desarrollo interno, no depende de proveedores críticos.",
    },
  },
];

export const CIERRE =
  "Así se ve pensar en Porter de verdad: no hay una fuerza que domine siempre. En el caso 3 viste que ni siquiera fue la competencia — fue el comprador quien tenía el poder real. Leer el caso siempre gana sobre aplicar una fórmula memorizada.";

/**
 * Puntuación de una ronda, en porcentaje.
 *
 *   10 − (suma de diferencias absolutas) / 2
 *
 * Acertar exacto da 0 de diferencia y por tanto 100. El reparto más lejano
 * posible entre dos asignaciones que suman 10 da 20 de diferencia, y por tanto
 * 0. Queda acotado entre 0 y 100 sin necesidad de recortar.
 */
export function puntajeRonda(asignacion, ideal) {
  const dif = FUERZAS.reduce((s, f) => s + Math.abs((asignacion[f.id] ?? 0) - ideal[f.id]), 0);
  return { pct: Math.max(0, Math.min(100, (10 - dif / 2) * 10)), diferencia: dif };
}
