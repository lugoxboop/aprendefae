import { test } from "node:test";
import assert from "node:assert/strict";
import { esPrimerIngreso } from "../AuthProvider.jsx";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL DIÁLOGO DE CUENTA NO ASOMA AL ENTRAR.
 *
 * El fallo, reportado por Mateo el 27-oct: «siempre que entro a la página
 * aparece como por un cuarto de segundo la ventanita de inicio de sesión».
 *
 * La causa no era el diálogo, era esta regla. La sesión llega del
 * almacenamiento del navegador al instante y el perfil llega del servidor
 * después; en ese hueco había un repintado con sesión puesta y perfil en
 * null, que es la forma exacta de «primer ingreso». El diálogo hacía bien su
 * trabajo: le estaban diciendo que alguien con cuenta no tenía cuenta.
 *
 * Lo que se guarda aquí es que «todavía no sé» nunca se pinte como «no
 * tienes cuenta».
 * ═══════════════════════════════════════════════════════════════════════════
 */

const SESION = { user: { id: "u1" } };
const PERFIL = { user_id: "u1", apodo: "mateo" };

test("★★★ mientras se lee el perfil NO se pide apodo (el parpadeo del 27-oct)", () => {
  /* Primera carga: sesión guardada ya leída, perfil todavía en vuelo. */
  assert.equal(
    esPrimerIngreso({ session: SESION, perfil: null, errorPerfil: null, cargando: true, leyendoPerfil: true }),
    false,
    "al abrir el sitio con sesión guardada",
  );
  /* Y el segundo hueco: un onAuthStateChange posterior, con cargando ya en false. */
  assert.equal(
    esPrimerIngreso({ session: SESION, perfil: null, errorPerfil: null, cargando: false, leyendoPerfil: true }),
    false,
    "y en cada cambio de sesión posterior, que es el hueco que `cargando` no cubría",
  );
});

test("★★★ terminada la lectura, un estudiante nuevo SÍ elige apodo", () => {
  assert.equal(
    esPrimerIngreso({ session: SESION, perfil: null, errorPerfil: null, cargando: false, leyendoPerfil: false }),
    true,
    "la lectura funcionó y devolvió vacío: es primer ingreso de verdad",
  );
});

test("★★★ quien ya tiene perfil no vuelve a elegir apodo", () => {
  assert.equal(
    esPrimerIngreso({ session: SESION, perfil: PERFIL, errorPerfil: null, cargando: false, leyendoPerfil: false }),
    false,
  );
});

test("★★★ si la lectura falló tampoco se pide: no es lo mismo que no tener perfil", () => {
  /*
   * Confundirlos mandaría a un estudiante con cuenta a elegir apodo otra vez,
   * y el insert chocaría contra su propia fila.
   */
  assert.equal(
    esPrimerIngreso({ session: SESION, perfil: null, errorPerfil: "red caída", cargando: false, leyendoPerfil: false }),
    false,
  );
});

test("★★★ sin sesión no se pide nada: entrar no pide registro", () => {
  for (const cargando of [true, false]) {
    for (const leyendoPerfil of [true, false]) {
      assert.equal(
        esPrimerIngreso({ session: null, perfil: null, errorPerfil: null, cargando, leyendoPerfil }),
        false,
      );
    }
  }
});
