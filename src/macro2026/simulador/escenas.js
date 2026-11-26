/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MACRO 2026 · SIMULADORES CON IA — lo que el SITIO sabe de cada escenario.
 *
 * El prompt de la compañera NO está aquí: vive en el servidor
 * (supabase/functions/simulador/escenarios/), y el sitio solo manda el id.
 * Aquí está lo que se ve: la oficina, quién te recibe, tu papel, la
 * capacitación (texto fijo, sin gastar IA) y un archivo de expedientes por si
 * la IA no responde.
 *
 * Reglas de texto (REGLA MAESTRA): contexto ≤ 30 palabras, rol ≤ 15,
 * consigna ≤ 12, cada globo de capacitación ≤ 20. Las mide
 * __tests__/simulador.test.mjs.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { VIRUS, FUERA_DEL_CIRCUITO } from "../politica-economica/textos.js";

export const AVISO_IA = "Esta actividad tiene inteligencia artificial aplicada";

/* Los ocho problemas de la fuente, con el nombre y la frase de la Aprender. */
export const PROBLEMAS_PE = [...VIRUS, ...FUERA_DEL_CIRCUITO].map(({ id, nombre, descripcion }) => ({ id, nombre, descripcion }));
export const nombreProblema = (id) => PROBLEMAS_PE.find((p) => p.id === id)?.nombre ?? id;

export const SIMULADORES = {
  "pe26-a2-fiebre": {
    id: "pe26-a2-fiebre",
    titulo: "Pulso: la firma que diagnostica economías",
    firma: "PULSO",
    lema: "Diagnóstico económico",
    fondo: "/macro2026/fondos/despacho.webp",
    companera: { mascota: "analista", nombre: "Olga, analista sénior", poses: { capacitacion: "libreta", caso: "lupa", veredicto: "grafica" } },
    rol: "Tú: analista junior de Pulso",
    rondas: 3,
    /* La capacitación: la compañera te explica la oficina antes del primer caso. */
    capacitacion: [
      "Soy Olga, la del video. En Pulso diagnosticamos economías como un médico a un paciente: por sus síntomas.",
      "Tú eres nuestro analista junior. Cada expediente es un país: lees tres datos y nombras sus virus.",
      "Los virus son los ocho problemas económicos. Unos atacan el circuito; otros, cómo se reparte.",
      "Soy tu compañera con inteligencia artificial. Pregúntame lo que quieras, escribiendo o con el micrófono.",
    ],
    empezar: "Traer el primer expediente",
    consigna: (pais) => `¿Qué virus tiene ${pais}? Marca uno o varios.`,
    preguntaRazon: "¿Por qué? (opcional)",
    placeholder: "Pregúntale algo…",
    sugerenciasIniciales: ["¿Recesión y desempleo son lo mismo?", "¿Qué es el Gini?"],
    /* Si la IA no responde, la oficina sigue abierta con estos expedientes. */
    archivo: [
      {
        pais: "Valdoria", titular: "Las vitrinas cambian de precio cada semana", quien: "una tendera de Valdoria",
        testigo: "Con la plata del mercado de enero hoy compro la mitad.",
        sintomas: [
          { dato: "Precio de la canasta familiar", antes: "+3 % al año", ahora: "+14 % al año", tendencia: "sube" },
          { dato: "Arriendo promedio", antes: "$1,1 millones", ahora: "$1,4 millones", tendencia: "sube" },
          { dato: "Pasaje de bus", antes: "$3.200", ahora: "$3.900", tendencia: "sube" },
        ],
        problemas: ["inflacion"],
      },
      {
        pais: "Ostrania", titular: "Las fábricas apagan máquinas y el Estado pide prestado", quien: "un tornero de Ostrania",
        testigo: "Mandé veinte hojas de vida este mes y nadie me ha llamado.",
        sintomas: [
          { dato: "Personas que buscan trabajo sin hallarlo", antes: "7 de cada 100", ahora: "15 de cada 100", tendencia: "sube" },
          { dato: "Recaudo frente a gasto del Estado", antes: "100 contra 101", ahora: "100 contra 128", tendencia: "sube" },
          { dato: "Fábricas que cerraron este año", antes: "40", ahora: "310", tendencia: "sube" },
        ],
        problemas: ["desempleo", "deficitFiscal"],
      },
      {
        pais: "Belmira", titular: "Sube el café, pero la economía crece rápido", quien: "un cafetero de Belmira",
        testigo: "El café está carísimo por la helada, lo demás sigue igual.",
        sintomas: [
          { dato: "Precio del café", antes: "$9.000 la libra", ahora: "$16.000 la libra", tendencia: "sube" },
          { dato: "Precio del resto de la canasta", antes: "+3 % al año", ahora: "+3 % al año", tendencia: "igual" },
          { dato: "Del ingreso total, lo que se lleva el 1 % más rico", antes: "20 %", ahora: "41 %", tendencia: "sube" },
        ],
        problemas: ["desigualdad"],
      },
    ],
  },
};

export const simuladorDe = (id) => SIMULADORES[id] ?? null;

/* Retroalimentación sin IA (archivo): una frase por problema, de la fuente. */
export function explicacionLocal(caso, { estado, faltan, sobran }) {
  const reales = caso.problemas.map(nombreProblema).join(" y ");
  if (estado === "acierto") return `Exacto: ${reales}. Los tres datos de ${caso.pais} apuntan ahí.`;
  const partes = [`El diagnóstico de ${caso.pais} era ${reales}.`];
  if (faltan.length) partes.push(`Te faltó ${faltan.map(nombreProblema).join(" y ")}: ${PROBLEMAS_PE.find((p) => p.id === faltan[0])?.descripcion ?? ""}`);
  if (sobran.length) partes.push(`${sobran.map(nombreProblema).join(" y ")} no aparece en los datos.`);
  return partes.join(" ");
}

export function veredictoLocal(reales, elegidos) {
  const r = new Set(reales);
  const e = new Set(elegidos);
  const bien = [...e].filter((x) => r.has(x));
  const faltan = [...r].filter((x) => !e.has(x));
  const sobran = [...e].filter((x) => !r.has(x));
  return { estado: !faltan.length && !sobran.length ? "acierto" : bien.length ? "parcial" : "fallo", faltan, sobran };
}
