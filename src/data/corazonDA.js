import { FAE } from "../theme.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL CORAZÓN DE LA ECONOMÍA — el modelo y los datos de las tres piezas.
 *
 * El modelo vivía dentro del componente de "Los grifos". Sale aquí porque
 * ahora lo comparten tres piezas: la interactiva, la de ritmo y la de casos.
 * Una sola aritmética, un solo sitio donde corregirla.
 *
 * FIDELIDAD A LAS FÓRMULAS DEL PROFESOR. Nada de esto se inventa:
 *
 *   T  = t × Y
 *   Yd = Y + TR − T                (renta disponible)
 *   C  = C̄ + c × Yd                (C̄ NO pasa por la válvula)
 *   I  = Ī − b × i
 *   G  = Ḡ
 *   DA = C + I + G + XN
 *
 * LO QUE SÍ ES UNA APROXIMACIÓN, Y SE DICE. El profesor no fija la forma de
 * f(tc), así que no se inventa una: se usa una curva suave que solo respeta la
 * dirección conocida —tipo de cambio más alto, más exportaciones netas— y la
 * interfaz la rotula como aproximación para que nadie la copie como fórmula.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const INICIAL = {
  autonomo: 800000,      // C̄
  Y: 5000000,            // Renta
  t: 0.06,               // Tasa impositiva
  TR: 500000,            // Transferencias
  c: 0.6,                // Propensión Marginal a Consumir
  inversionAut: 1500000, // Ī
  i: 8,                  // Tasa de interés, en puntos porcentuales
  b: 60000,              // Elasticidad interés de la inversión, en $ por punto
  G: 2000000,            // Ḡ
  tc: 4000,              // Tipo de cambio
};

export const TC_NEUTRO = 4200;

export function exportacionesNetas(tc) {
  return 600000 * Math.tanh((tc - TC_NEUTRO) / 700);
}

export function calcular(v) {
  const T = v.t * v.Y;
  const disponible = v.Y + v.TR - T;
  const consumoInducido = v.c * disponible;
  /*
   * Lo que NO pasa la válvula no desaparece: es ahorro, y la pieza lo dibuja
   * saliendo por un vaso lateral. Los estudiantes creen que se esfuma, y ese
   * malentendido es justo el que esta pieza existe para corregir.
   */
  const ahorro = disponible - consumoInducido;
  const C = v.autonomo + consumoInducido;

  const bi = v.b * v.i;
  const I = v.inversionAut - bi;

  const XN = exportacionesNetas(v.tc);

  return { T, disponible, consumoInducido, ahorro, C, bi, I, G: v.G, XN, DA: C + I + v.G + XN };
}

/*
 * Las cuatro arterias, con su tono.
 *
 * CUATRO TONOS DISTINTOS DEL KIT, ninguno inventado. Y el color nunca va solo:
 * cada banda de la cámara lleva su letra y su nombre escritos, porque la
 * cámara es la parte que carga la aritmética y no puede depender del tono.
 */
export const COMPONENTES = [
  { id: "C",  color: FAE.teal,  nombre: "Consumo",             glosa: "lo que gastan las familias" },
  { id: "I",  color: FAE.ambar, nombre: "Inversión",           glosa: "lo que ponen las empresas" },
  { id: "G",  color: FAE.coral, nombre: "Gasto público",       glosa: "lo que gasta el Estado" },
  { id: "XN", color: FAE.node,  nombre: "Exportaciones netas", glosa: "lo que vendemos afuera menos lo que compramos" },
];

/*
 * ═══════════════ LOS CASOS DEL ESTETOSCOPIO ═══════════════
 *
 * Cuatro casos reales, cada uno con su cifra y su fuente EN PANTALLA. Las
 * cuatro cifras se verificaron contra sus fuentes antes de escribirlas, y dos
 * atribuciones salieron mal del encargo original:
 *
 *   · El tonelaje de flores NO es del DANE: lo publica el ICA, que es quien
 *     certifica los envíos. Asocolflores aporta el 13% de crecimiento.
 *   · La cifra del presupuesto necesitaba su decreto, que es el 1621 del 31 de
 *     diciembre de 2024.
 *
 * `pesos` es cuánto pesa cada componente en la cámara de ese caso. No son
 * cifras de la economía colombiana: son una ilustración de QUÉ COMPONENTE
 * domina, y la interfaz lo dice para que nadie los lea como datos.
 */
export const CASOS_ESTETOSCOPIO = [
  {
    id: "renta-ciudadana",
    titulo: "Renta Ciudadana llega a los hogares",
    caso: "El gobierno entrega Renta Ciudadana a cientos de miles de hogares vulnerables.",
    componente: "C",
    via: "Transferencias (TR)",
    diagnostico:
      "El dinero entra como Transferencias, sube la renta disponible y de ahí pasa a Consumo por la válvula c. No es gasto público que compre cosas: es plata que llega a las familias y son ellas las que deciden gastarla.",
    cifra: "770.000 familias · $320.000 millones",
    detalle: "Sexto ciclo de pagos, del 3 al 15 de diciembre de 2025.",
    fuente: "Prosperidad Social (DPS)",
    pesos: { C: 62, I: 14, G: 16, XN: 8 },
  },
  {
    id: "ied-cae",
    titulo: "La inversión extranjera se retira",
    caso: "La inversión extranjera en Colombia cae por tercer año consecutivo.",
    componente: "I",
    via: "Inversión (I)",
    /*
     * ESTE CASO ES UNA CAÍDA, Y ES DELIBERADO. Es el dato más reciente y
     * enseña que un componente no solo sube. Convertirlo en un ejemplo
     * positivo sería más cómodo y menos cierto.
     */
    diagnostico:
      "Aquí la arteria de Inversión se estrecha, no se ensancha. Un componente de la Demanda Agregada también puede caer, y cuando cae arrastra a la DA con él. Es el mismo mecanismo, en la otra dirección.",
    cifra: "US$11.469 millones en 2025 · −16,1%",
    detalle: "Frente a US$13.684 millones en 2024. Acumula −33,2% desde 2022.",
    fuente: "Banco de la República, balanza de pagos",
    pesos: { C: 46, I: 12, G: 26, XN: 16 },
  },
  {
    id: "vias-transporte",
    titulo: "Presupuesto para vías y transporte",
    caso: "El gobierno destina parte del presupuesto nacional a vías y transporte público.",
    componente: "G",
    via: "Gasto público (Ḡ)",
    diagnostico:
      "El Estado compra obra y servicio directamente: eso es Gasto público, no Transferencias. La diferencia está en quién decide el gasto — aquí lo decide el Estado, no la familia que recibe.",
    cifra: "$2,3 billones",
    detalle: "Una sola partida para transporte público e infraestructura vial, PGN 2025 (Decreto 1621 de 2024).",
    fuente: "Presupuesto General de la Nación 2025",
    pesos: { C: 44, I: 18, G: 30, XN: 8 },
  },
  {
    id: "flores-san-valentin",
    titulo: "Las flores cruzan la frontera",
    caso: "Las flores colombianas llegan a Estados Unidos justo antes de San Valentín.",
    componente: "XN",
    via: "Exportaciones netas (XN)",
    diagnostico:
      "Lo que se vende afuera entra en XN. Cuenta lo que exportamos MENOS lo que importamos, así que un buen mes de flores empuja el componente hacia arriba, pero no es todo lo que hay dentro.",
    cifra: "Más de 65.000 toneladas · +13%",
    detalle: "Temporada de San Valentín de 2025. Unos 900 millones de tallos, el 92% por vía aérea.",
    fuente: "ICA · Asocolflores",
    pesos: { C: 42, I: 18, G: 18, XN: 22 },
  },
];
