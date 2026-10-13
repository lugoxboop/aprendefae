/*
 * ═══════════════════════════════════════════════════════════════════════════
 * INFLESZ — LA LEGIBILIDAD DE UN TEXTO, CALCULADA SIEMPRE IGUAL.
 *
 * El canon (orquestador/conocimiento/kit.md, dimensión D13) pide INFLESZ ≥ 65
 * en todo texto de 10 palabras o más. Es la escala de Szigriszt-Pazos, y no
 * otra (ni Barrio-Cantalejo ni Fernández-Huerta). No se cambia sin Levi.
 *
 *   INFLESZ = 206,835 − 62,3 × (sílabas / palabras) − (palabras / frases)
 *
 * ═══════════ LA CONVENCIÓN DE LAS CIFRAS — NO SE CAMBIA SIN LEVI ═══════════
 *
 * Cada cifra cuenta como UNA palabra de TRES sílabas, sea cual sea su largo.
 * El signo de pesos, el porcentaje y los separadores (punto de miles, coma
 * decimal) van pegados a la cifra y no la parten:
 *
 *   «$1.800.000»  → 1 palabra, 3 sílabas
 *   «$2.500»      → 1 palabra, 3 sílabas
 *   «5,35%»       → 1 palabra, 3 sílabas
 *
 * Es la convención con la que Gen midió todos los números aprobados. Si
 * alguien la cambia, los números de antes y los de después dejan de ser
 * comparables: el umbral de 65 deja de significar lo mismo.
 *
 * ═══════════ EL RESTO DE LAS REGLAS ═══════════
 *
 * PALABRA. Una secuencia de letras (con tildes, ñ, ü y letras con macrón como
 * «Ḡ»), o una cifra. Los signos de puntuación, paréntesis y comillas separan
 * palabras pero no son palabras.
 *
 * SÍLABA. Se cuentan los núcleos vocálicos. Dos vocales seguidas son un solo
 * núcleo (diptongo, triptongo) salvo que haya hiato: dos fuertes juntas (a, e,
 * o, y sus tildadas) o una débil con tilde (í, ú) junto a otra vocal. La «y»
 * cuenta como vocal cuando no va seguida de vocal («rey», «y»). Una palabra
 * sin ninguna vocal —una sigla o una variable como «tc» o «b»— cuenta una
 * sílaba.
 *
 * FRASE. Termina en punto, signo de cierre de interrogación o de exclamación.
 * El punto de miles de una cifra no cierra frase. Los dos puntos y el punto y
 * coma tampoco. Un texto sin punto final cuenta como una frase.
 *
 * ═══════════ PENDIENTE DE LEVI: «Ḡ» ═══════════
 *
 * Aquí «Ḡ» cuenta como cualquier variable de una letra («T», «i», «b»): una
 * palabra, una sílaba. Los números aprobados de tres textos de Macro que la
 * llevan salieron SIN contarla (72,2, 68,9 y 92,0 en vez de 74,7, 71,2 y 92,9);
 * los otros 40 textos de referencia coinciden exactos. Ningún veredicto cambia,
 * pero la regla la decide Levi. Si decide no contarla, se cambia aquí y en la
 * prueba que la fija.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const UMBRAL = 65;
export const PALABRAS_MINIMAS = 10;
export const SILABAS_POR_CIFRA = 3;

const LETRA = "a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\\u00C0-\\u024F\\u1E00-\\u1EFF";
/* Una cifra: signo opcional, dígitos con separadores internos, porcentaje opcional. */
const CIFRA = "\\$?\\d+(?:[.,]\\d+)*%?";
const TOKEN = new RegExp(`${CIFRA}|[${LETRA}]+`, "gu");

const FUERTES = new Set([..."aeoáéó"]);
const DEBILES_TILDADAS = new Set([..."íú"]);
const VOCALES = new Set([..."aeiouáéíóúü"]);

const esCifra = (t) => /\d/.test(t);

/* Quita marcas que no cambian la vocal (por ejemplo, el macrón de «Ḡ»). */
const base = (letra) => {
  const sinMarca = letra.normalize("NFD").replace(/[̄̅]/g, "").normalize("NFC");
  return sinMarca.toLowerCase();
};

/** Las sílabas de una palabra (no de una cifra). */
export function silabasDePalabra(palabra) {
  const letras = [...palabra].map(base);
  let nucleos = 0;
  let anterior = null; /* la vocal anterior, si la letra anterior era vocal */
  for (let k = 0; k < letras.length; k++) {
    let l = letras[k];
    /* «y» es vocal solo si no la sigue otra vocal: «rey», «muy», «y». */
    if (l === "y") {
      const siguiente = letras[k + 1];
      l = siguiente && VOCALES.has(siguiente) ? "consonante" : "i";
    }
    if (!VOCALES.has(l)) { anterior = null; continue; }
    if (anterior === null) {
      nucleos += 1;
    } else {
      const hiato = (FUERTES.has(anterior) && FUERTES.has(l)) || DEBILES_TILDADAS.has(anterior) || DEBILES_TILDADAS.has(l);
      if (hiato) nucleos += 1;
    }
    anterior = l;
  }
  return Math.max(1, nucleos);
}

/** Las palabras de un texto, con sus sílabas. */
export function palabrasDe(texto) {
  return (String(texto).match(TOKEN) ?? []).map((t) => ({
    texto: t,
    cifra: esCifra(t),
    silabas: esCifra(t) ? SILABAS_POR_CIFRA : silabasDePalabra(t),
  }));
}

/** Las frases: terminan en . ? ! (un punto dentro de una cifra no cuenta). */
export function frasesDe(texto) {
  const sinCifras = String(texto).replace(new RegExp(CIFRA, "gu"), "0");
  const trozos = sinCifras.split(/[.?!…]+/u).filter((t) => (t.match(TOKEN) ?? []).length > 0);
  return Math.max(1, trozos.length);
}

/**
 * El INFLESZ de un texto, con todo lo que lo explica.
 * `valor` va con un decimal, como se reporta; `exacto`, sin redondear.
 * `silabasPorCifra` existe solo para que las pruebas demuestren que la
 * convención importa: nadie mide con otro valor.
 */
export function inflesz(texto, { silabasPorCifra = SILABAS_POR_CIFRA } = {}) {
  const palabras = palabrasDe(texto).map((x) => (x.cifra ? { ...x, silabas: silabasPorCifra } : x));
  const p = palabras.length;
  if (p === 0) return { palabras: 0, silabas: 0, frases: 0, exacto: null, valor: null, aplica: false, cumple: null };
  const s = palabras.reduce((n, x) => n + x.silabas, 0);
  const f = frasesDe(texto);
  const exacto = 206.835 - 62.3 * (s / p) - p / f;
  const valor = Math.round(exacto * 10) / 10;
  const aplica = p >= PALABRAS_MINIMAS;
  return { palabras: p, silabas: s, frases: f, exacto, valor, aplica, cumple: aplica ? valor >= UMBRAL : null };
}
