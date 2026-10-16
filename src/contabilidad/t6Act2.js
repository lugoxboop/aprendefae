import { formatearCifra } from "./elCierreCompleto.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * b5-t6-a2 · LAS PREGUNTAS DE CIFRA ESCRITA (lote 6b, la fusión de a5 en a2).
 *
 * Futaba: vale con o sin «$» y con o sin puntos de miles; una cifra negativa
 * va a la devolución general. Un intento por pregunta.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const MENOS = /^\s*[-−]/;

/* Lo que se ve en el campo mientras se escribe: los puntos de miles, y el signo menos si lo puso. */
export function formatearRespuesta(texto) {
  const cifra = formatearCifra(texto);
  return MENOS.test(String(texto ?? "")) ? `-${cifra}` : cifra;
}

/* La cifra escrita, o null si no hay ningún dígito. «$31.200», «31200» y «31.200» valen lo mismo. */
export function leerRespuesta(texto) {
  const t = String(texto ?? "");
  const digitos = t.replace(/\D/g, "");
  if (digitos === "") return null;
  return MENOS.test(t) ? -Number(digitos) : Number(digitos);
}

/* { ok, error, texto, valor, correcta }: `error` es la clave de la respuesta nombrada, o «general». */
export function evaluarPregunta(pregunta, texto) {
  const valor = leerRespuesta(texto);
  if (valor === pregunta.correcta) return { ok: true, error: null, texto: null, valor, correcta: pregunta.correcta };
  const nombrada = valor !== null && valor >= 0 ? pregunta.errores.find((e) => e.valor === valor) : null;
  return {
    ok: false, error: nombrada ? nombrada.clave : "general", texto: nombrada ? nombrada.texto : pregunta.general,
    valor, correcta: pregunta.correcta,
  };
}
