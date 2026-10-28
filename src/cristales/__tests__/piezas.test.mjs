import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  FORMAS_COMPRABLES, FORMAS_LIBRES, PALETAS_COMPRABLES, PALETAS_LIBRES, PRECIO_PIEZA,
  estadoDePieza, faltanParaPieza, piezaDesbloqueada, piezasDesbloqueadas, precioDePieza,
} from "../cristales.js";
import { FORMAS, PALETAS } from "../../avatar/generador.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS PIEZAS DE LA TIENDA — formas y paletas que se compran (0153).
 *
 * Lo que se guarda aquí, por orden de gravedad:
 *
 *   1. QUE NADIE PIERDA LO QUE YA ERA SUYO. Las cinco formas y las cuatro
 *      paletas originales eran libres antes del 28-oct. Si alguna acabara en
 *      la lista de comprables, a un estudiante le cobrarían por el avatar que
 *      ya lleva puesto. Eso no es monetizar, es quitárselo.
 *   2. QUE EL PRECIO QUE SE PINTA SEA EL QUE SE COBRA. El precio vive en este
 *      módulo y en SQL, porque SQL no lee JavaScript. Esta prueba lee la
 *      migración, igual que cristales.test.mjs hace con los niveles.
 *   3. QUE «TODAVÍA NO SÉ» NO SE PINTE COMO «YA ES TUYO». Un perfil leído
 *      antes de que corriera la migración no trae las columnas nuevas.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SQL = readFileSync(new URL("../../../supabase/migrations/0153_avatares_piezas_nuevas.sql", import.meta.url), "utf8");

test("★★★ ninguna forma ni paleta de las que ya eran libres está a la venta", () => {
  for (const f of FORMAS_LIBRES) {
    assert.ok(!FORMAS_COMPRABLES.includes(f), `«${f}» era de todos: cobrarla es quitársela a quien ya la tenía`);
    assert.equal(precioDePieza("forma", f), 0);
  }
  for (const p of PALETAS_LIBRES) {
    assert.ok(!PALETAS_COMPRABLES.includes(p), `«${p}» era de todos`);
    assert.equal(precioDePieza("paleta", p), 0);
  }
  /* Y entre libres y comprables está TODO el catálogo: ninguna pieza huérfana. */
  assert.deepEqual([...FORMAS_LIBRES, ...FORMAS_COMPRABLES].sort(), [...FORMAS].sort());
  assert.deepEqual([...PALETAS_LIBRES, ...PALETAS_COMPRABLES].sort(), [...PALETAS].sort());
});

test("★★★ el defecto de la migración son exactamente las piezas libres", () => {
  /*
   * Es lo que hace que quien ya tenía perfil amanezca con las suyas. Si el
   * defecto se quedara corto, el día que corra la migración un estudiante
   * entraría y su propia forma le saldría bloqueada.
   */
  assert.ok(
    SQL.includes(`default '{${FORMAS_LIBRES.join(",")}}'`),
    `el defecto de avatar_unlocked_shapes debería ser {${FORMAS_LIBRES.join(",")}}`,
  );
  assert.ok(
    SQL.includes(`default '{${PALETAS_LIBRES.join(",")}}'`),
    `el defecto de avatar_unlocked_palettes debería ser {${PALETAS_LIBRES.join(",")}}`,
  );
});

test("★★★ el precio que pinta el cliente es el que cobra la base", () => {
  for (const [tipo, tabla] of Object.entries(PRECIO_PIEZA)) {
    for (const [clave, precio] of Object.entries(tabla)) {
      const linea = new RegExp(`when '${clave}'\\s+then ${precio}\\b`);
      assert.match(SQL, linea, `la 0153 debería cobrar ${precio} por ${tipo} «${clave}»`);
    }
  }
  /* Y al revés: ningún precio en SQL que el cliente no conozca. */
  const enSql = [...SQL.matchAll(/when '([a-z]+)'\s+then (\d+)/g)].map(([, k, v]) => [k, Number(v)]);
  for (const [clave, precio] of enSql) {
    const mio = precioDePieza("forma", clave) || precioDePieza("paleta", clave);
    assert.equal(mio, precio, `la base cobra ${precio} por «${clave}» y el cliente pinta ${mio}`);
  }
});

test("★★★ un perfil nuevo tiene las libres y ninguna de pago", () => {
  const nuevo = { cristales_balance: 0 };
  assert.deepEqual(piezasDesbloqueadas(nuevo, "forma").sort(), [...FORMAS_LIBRES].sort());
  assert.deepEqual(piezasDesbloqueadas(nuevo, "paleta").sort(), [...PALETAS_LIBRES].sort());
  for (const f of FORMAS_COMPRABLES) assert.equal(piezaDesbloqueada(nuevo, "forma", f), false);
});

test("★★★ un perfil viejo, sin las columnas nuevas, conserva las suyas", () => {
  /*
   * La fila leída antes de que corriera la migración no trae
   * avatar_unlocked_shapes. Si eso se leyera como «no tiene ninguna», el
   * estudiante entraría y su propio avatar le saldría bloqueado.
   */
  const viejo = { cristales_balance: 10, avatar_shape: "cuna", avatar_palette: "brasa" };
  assert.equal(piezaDesbloqueada(viejo, "forma", "cuna"), true);
  assert.equal(piezaDesbloqueada(viejo, "paleta", "brasa"), true);
  assert.equal(piezaDesbloqueada(viejo, "forma", "astro"), false, "pero no le regala las de pago");
});

test("★★★ comprada, alcanzable y falta dicen lo que parece que dicen", () => {
  const con = (saldo, formas = []) => ({ cristales_balance: saldo, avatar_unlocked_shapes: [...FORMAS_LIBRES, ...formas] });
  assert.equal(estadoDePieza(con(0), "forma", "vertice"), "falta");
  assert.equal(faltanParaPieza(con(0), "forma", "vertice"), 30);
  assert.equal(estadoDePieza(con(29), "forma", "vertice"), "falta");
  assert.equal(faltanParaPieza(con(29), "forma", "vertice"), 1, "falta uno, y se dice el número");
  assert.equal(estadoDePieza(con(30), "forma", "vertice"), "alcanzable");
  assert.equal(estadoDePieza(con(0, ["vertice"]), "forma", "vertice"), "comprado", "comprada sigue siéndolo con saldo 0");
  assert.equal(faltanParaPieza(con(0, ["vertice"]), "forma", "vertice"), 0);
});

test("★★★ los precios son alcanzables en un semestre, no un escaparate", () => {
  /*
   * No es una regla de estilo: una Tienda cuyo catálogo entero cuesta más de
   * lo que nadie puede juntar es una lista de cosas que no puedes tener, que
   * es justo lo que el encabezado de TiendaView dice que no queremos.
   */
  const total = Object.values(PRECIO_PIEZA).flatMap((t) => Object.values(t)).reduce((a, b) => a + b, 0);
  assert.ok(total <= 400, `el catálogo de piezas suma ${total} Cristales`);
  const masBarata = Math.min(...Object.values(PRECIO_PIEZA).flatMap((t) => Object.values(t)));
  assert.ok(masBarata <= 45, `la pieza más barata cuesta ${masBarata}: la primera compra tiene que llegar pronto`);
});

test("★★★ la base vuelve a comprobar la propiedad: el cliente no es la puerta", () => {
  assert.match(SQL, /La forma % no está desbloqueada/, "avatar_elegir rechaza una forma que no es suya");
  assert.match(SQL, /La paleta % no está desbloqueada/, "y una paleta que no es suya");
  /* Y la compra descuenta y comprueba en la MISMA sentencia: dos toques no cobran dos veces. */
  assert.match(SQL, /cristales_balance\s*=\s*cristales_balance - v_precio/);
  assert.match(SQL, /and cristales_balance >= v_precio/);
  assert.match(SQL, /and not \(p_clave = any \(avatar_unlocked_shapes\)\)/);
  /* El cliente no puede escribir la columna por su cuenta. */
  assert.match(SQL, /revoke all on function public\.comprar_pieza_avatar\(text, text\) from public, anon;/);
});
