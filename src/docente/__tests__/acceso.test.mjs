import test from "node:test";
import assert from "node:assert/strict";

import { accesoDocente } from "../datos.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL DEFECTO DE accesoDocente() ANTE CUALQUIER FALLO ES "NO ES DOCENTE".
 *
 * Esta función decide si se PINTA el panel. El servidor no depende de ella
 * —cada función SQL comprueba es_docente() y la materia por su cuenta y
 * responde 42501— así que fallar aquí no filtra datos. Lo que filtraría es lo
 * contrario: que un error de red o una respuesta rara se leyeran como «sí,
 * adelante» y se le enseñara la estructura del panel a quien no debe verla.
 *
 * ═══════════ POR QUÉ ESTO ES UNA PROPIEDAD Y NO TRES CASOS ═══════════
 *
 * Los caminos de fallo no son tres, son el producto de cuatro decisiones
 * independientes: hay cliente o no, hay sesión o no, la llamada responde o
 * revienta, y lo que devuelve es verdadero, falso, nulo o basura. Escribir a
 * mano los casos que a uno se le ocurren deja fuera justo el que nadie previó.
 *
 * Aquí se generan TODAS las combinaciones y se afirma una sola cosa: el
 * resultado es abierto EXACTAMENTE cuando hay sesión y es_docente devuelve algo
 * verdadero, sin error y sin excepción. En cualquier otro caso, cerrado.
 *
 * ═══════════ COMPROBADO QUE FALLA ═══════════
 *
 * Se verificó a mano quitando el try/catch de accesoDocente: los ocho casos que
 * lanzan dejan de devolver lo cerrado y la prueba los marca. Y cambiando
 * `if (error || !es)` por `if (error)` caen los que devuelven false o null.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const CERRADO = { esDocente: false, materias: [] };

/* Un cliente de mentira armado a la carta. */
function clienteFalso({ sesion, esDocenteRpc, errorRpc, lanza, materias }) {
  return {
    auth: {
      getSession: async () => {
        if (lanza === "sesion") throw new Error("red caída al pedir la sesión");
        return { data: sesion ? { session: { user: { id: "u1" } } } : {} };
      },
    },
    rpc: async (nombre) => {
      if (lanza === "rpc") throw new Error("red caída en la llamada");
      if (nombre === "es_docente") return { data: esDocenteRpc, error: errorRpc ?? null };
      return { data: materias, error: null };
    },
  };
}

const SESION = [true, false];
const RESPUESTAS = [
  { etiqueta: "true", valor: true },
  { etiqueta: "false", valor: false },
  { etiqueta: "null", valor: null },
  { etiqueta: "undefined", valor: undefined },
  /* Una respuesta con forma inesperada: verdadera pero no booleana. */
  { etiqueta: "objeto vacío", valor: {} },
  { etiqueta: "cadena vacía", valor: "" },
  { etiqueta: "cero", valor: 0 },
];
const ERRORES = [null, { message: "PGRST202: función no encontrada" }, { message: "42501: no autorizado" }];
const LANZA = [null, "sesion", "rpc"];

test("sin cliente configurado no hay acceso", async () => {
  assert.deepEqual(await accesoDocente(null), CERRADO);
  assert.deepEqual(await accesoDocente(undefined ?? null), CERRADO);
});

test("ninguna combinación de fallo abre el panel", async () => {
  const abiertosIndebidos = [];
  let combinaciones = 0;

  for (const sesion of SESION) {
    for (const resp of RESPUESTAS) {
      for (const errorRpc of ERRORES) {
        for (const lanza of LANZA) {
          combinaciones++;
          const r = await accesoDocente(
            clienteFalso({ sesion, esDocenteRpc: resp.valor, errorRpc, lanza, materias: ["macroeconomia"] })
          );

          /* Lo abierto solo es legítimo con las cuatro condiciones a la vez. */
          const deberiaAbrir = sesion && !errorRpc && !lanza && Boolean(resp.valor);

          if (!deberiaAbrir) {
            assert.deepEqual(
              r,
              CERRADO,
              `abrió con sesión=${sesion} es_docente=${resp.etiqueta} error=${errorRpc?.message ?? "ninguno"} lanza=${lanza ?? "no"}`
            );
          } else if (r.esDocente !== true) {
            abiertosIndebidos.push(`debería abrir y no abrió: es_docente=${resp.etiqueta}`);
          }
        }
      }
    }
  }

  assert.deepEqual(abiertosIndebidos, []);
  /* Que la prueba recorra de verdad lo que dice recorrer. */
  assert.equal(combinaciones, SESION.length * RESPUESTAS.length * ERRORES.length * LANZA.length);
  assert.equal(combinaciones, 126);
});

test("el camino feliz sí abre, y con sus materias", async () => {
  const r = await accesoDocente(
    clienteFalso({ sesion: true, esDocenteRpc: true, errorRpc: null, lanza: null, materias: ["macroeconomia"] })
  );
  assert.deepEqual(r, { esDocente: true, materias: ["macroeconomia"] });
});

/*
 * Y si la lista de materias llega rota, se abre el panel pero SIN materias: el
 * componente ya trata ese caso ("autorizado pero sin materia asignada"). Un
 * `materias` que no sea array reventaría más adelante con un .map, así que se
 * normaliza aquí.
 */
test("una lista de materias rota no se propaga", async () => {
  for (const basura of [null, undefined, "macroeconomia", 42, {}]) {
    const r = await accesoDocente(
      clienteFalso({ sesion: true, esDocenteRpc: true, errorRpc: null, lanza: null, materias: basura })
    );
    assert.deepEqual(r, { esDocente: true, materias: [] }, `no normalizó ${JSON.stringify(basura)}`);
  }
});
