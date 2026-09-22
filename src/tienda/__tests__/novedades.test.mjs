import { test } from "node:test";
import assert from "node:assert/strict";
import { alcanzablesAhora, hayNovedad, claveDe } from "../novedades.js";
import { PRECIO_NIVEL } from "../../cristales/cristales.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL PUNTO ÁMBAR DE LA TIENDA.
 *
 * La regla de Xeno es corta —sale cuando hay algo sin comprar que ya se puede
 * pagar, y se apaga al entrar— pero tiene cuatro esquinas que se contradicen
 * entre sí si se implementa con una fecha o con el saldo. Cada una tiene aquí
 * su caso.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Un perfil con el saldo y los niveles que se digan. El I siempre es de todos. */
const perfil = (cristales, comprados = [1]) => ({
  cristales_balance: cristales,
  avatar_unlocked_levels: comprados,
});

test("alcanzable es lo que no tiene y ya puede pagar, no lo que le gustaría", () => {
  assert.deepEqual(alcanzablesAhora(perfil(0)), [], "sin Cristales no alcanza nada");
  assert.deepEqual(alcanzablesAhora(perfil(PRECIO_NIVEL[2] - 1)), [], "uno por debajo del precio, todavía no");
  assert.deepEqual(alcanzablesAhora(perfil(PRECIO_NIVEL[2])), [2], "justo el precio sí alcanza");
  assert.deepEqual(alcanzablesAhora(perfil(PRECIO_NIVEL[3])), [2, 3]);
  assert.deepEqual(alcanzablesAhora(perfil(PRECIO_NIVEL[4])), [2, 3, 4]);
});

test("lo ya comprado no vuelve a ser novedad, por mucho saldo que tenga", () => {
  assert.deepEqual(alcanzablesAhora(perfil(PRECIO_NIVEL[4], [1, 2, 3, 4])), []);
  assert.deepEqual(alcanzablesAhora(perfil(PRECIO_NIVEL[3], [1, 2])), [3]);
});

test("sin nada que pagar no hay punto, haya entrado o no", () => {
  assert.equal(hayNovedad([], null), false);
  assert.equal(hayNovedad([], [2, 3]), false);
});

/*
 * Las cuatro esquinas, en el orden en que le pasan a un estudiante de verdad.
 * Son la razón de guardar un CONJUNTO y no una fecha ni un saldo.
 */
test("el recorrido completo: junta, entra, vuelve a juntar, compra", () => {
  /* 1. Junta para el II y todavía no ha entrado nunca: punto. */
  assert.equal(hayNovedad([2], null), true, "nunca entró y ya puede pagar algo");

  /* 2. Entra y no compra nada. Lo que vio queda visto: sin punto. */
  assert.equal(hayNovedad([2], [2]), false, "ya lo vio; repetirle el aviso es ruido");

  /* 3. Sigue jugando y junta para el III: hay algo que NO había visto. */
  assert.equal(hayNovedad([2, 3], [2]), true, "el III es nuevo");

  /* 4. Entra, compra el III. El II sigue alcanzable, pero ya lo había visto. */
  assert.equal(hayNovedad([2], [2, 3]), false, "el II no es novedad por haber comprado el III");
});

test("una fecha de última visita no habría servido, y por eso no se usa", () => {
  /*
   * Con «ya entró alguna vez» como única memoria, este caso —el más
   * importante, juntar para el nivel IV— se quedaría sin aviso para siempre.
   */
  const yaEntroAlgunaVez = [2];
  assert.equal(hayNovedad([2, 3, 4], yaEntroAlgunaVez), true);
});

test("la clave es por cuenta: dos estudiantes en el mismo navegador no se pisan", () => {
  assert.notEqual(claveDe("uid-de-ana"), claveDe("uid-de-bruno"));
  assert.match(claveDe("uid-de-ana"), /uid-de-ana$/);
  /* Sin id no se lanza: se guarda aparte y no contamina la cuenta de nadie. */
  assert.equal(claveDe(null), claveDe(undefined));
});

test("una memoria ilegible se trata como «nunca entró», que es el lado seguro", () => {
  /*
   * En una ventana privada localStorage lanza. Avisar de más es ruido; avisar
   * de menos es esconder la Tienda, y eso es peor.
   */
  assert.equal(hayNovedad([2], null), true);
  assert.equal(hayNovedad([2], "no soy una lista"), true);
  assert.equal(hayNovedad([2], undefined), true);
});
