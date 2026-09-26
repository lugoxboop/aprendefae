import { DEBE, HABER, tipoDeCuenta, ladoDe, efectoDe, CRECE_POR } from "../data/contabilidad.js";
import {
  ITEMS, POR_PARTIDA, VALOR_FICHA, PATRON_A, PATRON_B, PATRON_B_BIS,
  TEXTO_A, TEXTO_B, TEXTO_B_BIS,
} from "../data/contabilidadDebitaOAcredita.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * A4 · ¿SE DEBITA O SE ACREDITA? — la regla aplicada.
 *
 * El contenido dice qué le pasa a la cuenta; de qué lado se registra lo dice
 * `ladoDe`, que es el capítulo. Ni una respuesta transcrita.
 *
 * ═══════════ Y LA CONTRAPARTIDA VA AL OTRO LADO POR CONSTRUCCIÓN ═══════════
 *
 * Estos diez son asientos simples: dos cuentas, una a cada lado. Que la
 * contrapartida caiga enfrente no se declara en ninguna parte — es lo único
 * que puede pasar si el asiento ha de cuadrar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const contrario = (lado) => (lado === DEBE ? HABER : DEBE);

/** Un ítem montado: su lado correcto, el de la contrapartida y sus ▲. */
export function montar(item) {
  const tipo = tipoDeCuenta(item.cuenta);
  const tipoContra = tipoDeCuenta(item.contrapartida);
  if (!CRECE_POR[tipo]) throw new Error(`«${item.cuenta}» no está en el catálogo del capítulo`);
  if (!CRECE_POR[tipoContra]) throw new Error(`«${item.contrapartida}» no está en el catálogo del capítulo`);

  const lado = ladoDe(tipo, item.sube);
  return {
    ...item,
    tipo,
    tipoContra,
    lado,
    ladoContrapartida: contrario(lado),
    /* Por dónde crece cada una: es el ▲, y no se enseña hasta haber respondido. */
    creceP: CRECE_POR[tipo],
    creceContraP: CRECE_POR[tipoContra],
    /* «aumentando» / «disminuyendo», que el patrón B necesita escribir. */
    efecto: efectoDe(tipo, lado) === "aumenta" ? "aumentando" : "disminuyendo",
  };
}

export const ASIENTOS = ITEMS.map(montar);

export { POR_PARTIDA, VALOR_FICHA };

/*
 * La devolución. El acierto es la razón de ESE ítem; el error, el patrón que
 * la ficha le asignó, con los trozos de texto que hay que señalar.
 */
export function evaluar(asiento, puesto) {
  if (puesto === asiento.lado) {
    return { ok: true, texto: asiento.acierto, patron: null };
  }
  if (asiento.patron === PATRON_A) {
    return {
      ok: false,
      patron: PATRON_A,
      texto: TEXTO_A.replace("{cuenta}", asiento.cuenta),
      /* Lo que se resalta es la cuenta por la que SÍ se preguntó. */
      resaltarCuenta: asiento.cuenta,
      atenuarTransaccion: true,
    };
  }
  if (asiento.patron === PATRON_B) {
    return {
      ok: false,
      patron: PATRON_B,
      texto: TEXTO_B
        .replace("{cuenta}", asiento.cuenta)
        .replace("{sugiere}", asiento.sugiere)
        .replace("{efecto}", asiento.efecto),
      /* Las dos a la vez: la parte del nombre que engaña y la que no. */
      resaltarParte: asiento.parteEngañosa,
      resaltarPalabra: asiento.palabraDelEnunciado,
    };
  }
  if (asiento.patron === PATRON_B_BIS) {
    return {
      ok: false,
      patron: PATRON_B_BIS,
      texto: TEXTO_B_BIS,
      resaltarPalabra: asiento.palabraDelEnunciado,
    };
  }
  throw new Error(`el ítem «${asiento.id}» no tiene patrón de error`);
}

/* El reintento vale la mitad, como en el resto del tema. */
export const VALOR_SEGUNDO = 0.5;

export function puntuar(respuestas, cuantas = POR_PARTIDA) {
  if (!cuantas) return 0;
  const suma = respuestas.reduce((s, r) => {
    if (r.primeroOk) return s + 1;
    if (r.segundoOk) return s + VALOR_SEGUNDO;
    return s;
  }, 0);
  return (suma / cuantas) * 100;
}

export const pesoDeCadaItem = (cuantas = POR_PARTIDA) => (cuantas ? 100 / cuantas : 0);

/* Qué transacción era cada id, para el panel docente. */
export const transaccionDe = (id) => {
  const a = ASIENTOS.find((x) => x.id === id);
  return a ? `${a.enunciado} · ${a.cuenta}` : null;
};
