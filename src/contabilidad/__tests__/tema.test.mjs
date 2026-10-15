import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { SUBJECTS, HACER, actividadesDeTipo, desafioDe } from "../../data/subjects.js";
import { ACTIVIDADES, DESAFIO, FP_DEL_TEMA } from "../../data/contabilidadActividades.js";
import { VISTAS, vistaDeTema } from "../../ruta.js";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL TEMA REGISTRADO CONTRA SU FICHA.
 *
 * subjects.js es el registro del sitio y contabilidadActividades.js es la
 * ficha del capítulo. Las dos listas dicen lo mismo y están escritas aparte
 * —la primera con la forma que pide la interfaz, la segunda con la del
 * capítulo—, así que pueden separarse en silencio. Esto lo impide.
 *
 * La prueba del catálogo del servidor (src/fp/__tests__/catalogo.test.mjs) ya
 * compara subjects.js contra las migraciones. Con esta, la cadena queda
 * cerrada: ficha → registro → servidor.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TEMA = SUBJECTS.contabilidad.topics.find((t) => t.id === "cuentas-debe-haber");
const JUEGOS = actividadesDeTipo(TEMA, HACER);

test("★ la materia tiene sus cinco temas, en el orden del libro", () => {
  /*
   * El orden del índice es el del libro, no el de la obra: «Introducción a la
   * contabilidad» es el capítulo 1 y se construyó DESPUÉS del capítulo 3, así
   * que es justo el orden que se rompería solo si alguien añade un tema al
   * final sin mirar.
   */
  const ids = SUBJECTS.contabilidad.topics.map((t) => t.id);
  /* El Tema 3, por ahora solo con su pieza 1 de Aprender, va después del 2. */
  /* El Tema 5 (Célula B) va después del 3. Catálogo: decide Erwin. */
  /* T7-1 (Célula C) va después del 5; el T4 y el T6 entran antes que él, en el orden del libro. */
  /* T7-2 (Célula C) va justo después de T7-1, y T7-3 justo después de T7-2. */
  /* T4 (Célula D) va entre el Tema 3 y el Tema 5: §5.1-5.2 antes de §5.3. */
  assert.deepEqual(ids, ["introduccion-contabilidad", "cuentas-debe-haber", "ingresos-gastos-y-caja", "efectivo-caja-menor-bancos", "activos-financieros", "cuentas-por-cobrar", "inventarios-periodico", "inventarios-permanente", "inventarios-descuentos-nic2"]);
  assert.ok(TEMA, "no está «cuentas-debe-haber»");
  assert.equal(TEMA.title, "Las cuentas, el debe y el haber");
});

test("★ el registro dice exactamente lo mismo que la ficha del capítulo", () => {
  assert.equal(JUEGOS.length, ACTIVIDADES.length, "no son las mismas en los dos sitios");
  for (const ficha of ACTIVIDADES) {
    const registrada = JUEGOS.find((a) => a.id === ficha.id);
    assert.ok(registrada, `${ficha.id}: está en la ficha y no en subjects.js`);
    assert.equal(registrada.nombre, ficha.nombre, `${ficha.id}: nombre`);
    assert.equal(registrada.clasificacion.dificultad, ficha.dificultad, `${ficha.id}: dificultad`);
    assert.equal(registrada.clasificacion.fpBase, ficha.fpBase, `${ficha.id}: FP base`);
  }
});

test("★ los FP del camino son los 260 de la ficha", () => {
  const suma = JUEGOS.reduce((s, a) => s + a.clasificacion.fpBase, 0);
  assert.equal(suma, FP_DEL_TEMA);
  /* Y el número escrito, para que la igualdad de arriba no sea circular. */
  assert.equal(suma, 260);
  /*
   * 2×10 + 2×25 + 2×50 + 1×90. Este tema deja de compartir la distribución de
   * los otros cuatro —eran 2-3-4-3 y 565— porque el rediseño lo bajó a siete
   * actividades. El desafío sigue valiendo 360 aparte.
   */
  const cuenta = (d) => JUEGOS.filter((a) => a.clasificacion.dificultad === d).length;
  assert.deepEqual([cuenta("facil"), cuenta("medio"), cuenta("dificil"), cuenta("experto")], [2, 2, 2, 1]);
});

test("★ el desafío está al lado del camino, no dentro", () => {
  const desafio = desafioDe(TEMA);
  assert.ok(desafio, "no está el desafío");
  assert.equal(desafio.id, DESAFIO.id);
  assert.equal(desafio.nombre, DESAFIO.nombre);
  assert.equal(desafio.clasificacion.etapas, DESAFIO.etapas);
  assert.equal(desafio.clasificacion.fpBase, DESAFIO.fpBase);
  /* Lo que de verdad importa: que NO cuente para «tema completo». */
  assert.ok(!JUEGOS.some((a) => a.id === DESAFIO.id),
    "el desafío entró en el camino: un desafío opcional que cuenta deja de ser opcional");
  /* La regla del Kit, tal como la aplica el servidor. */
  assert.equal(desafio.clasificacion.fpBase * Math.min(desafio.clasificacion.etapas, 4), 360);
});

test("el tema tiene ruta propia y se llega a ella desde el índice", () => {
  assert.ok(VISTAS.has("cuentas-debe-haber"));
  assert.equal(vistaDeTema("cuentas-debe-haber"), "cuentas-debe-haber");
});

/* ─────────── lo construido, contra lo declarado ─────────── */

/*
 * La vista se lee como texto en vez de importarse: importarla arrastraría
 * React, el proveedor de sesión y media interfaz para comprobar una lista de
 * cinco cadenas. Es el mismo trato que la prueba del catálogo le da a los
 * archivos .sql.
 */
const VISTA = readFileSync("src/components/CuentasDebeHaberView.jsx", "utf8");
const JUEGOS_DE_LA_VISTA = [...VISTA.matchAll(/\{ id: "([a-z0-9-]+)", Mecanica:/g)].map((m) => m[1]);

/*
 * El desafío no entra por la lista de JUEGOS —va al lado del camino, en su
 * propia rama— así que se reconoce por su componente. Sin esto, quitarle la
 * marca `pendiente` sin montarlo dejaría un nodo que se abre en blanco, que es
 * justo lo que esta prueba existe para impedir.
 */
const DESAFIO_MONTADO = /<ElCicloCompleto\b/.test(VISTA);
const CONSTRUIDAS = [...JUEGOS_DE_LA_VISTA, ...(DESAFIO_MONTADO ? [DESAFIO.id] : [])];

test("★ lo que la vista construye es EXACTAMENTE lo que el tema no marca pendiente", () => {
  /*
   * Las dos listas tienen que decir lo mismo, y no por orden sino por
   * contenido. Si se separan pasa una de dos cosas, las dos malas: un nodo del
   * camino que se abre en blanco, o una actividad jugable a la que el panel
   * docente no le sabe poner nombre porque la prueba de cobertura la estaba
   * dejando pasar por pendiente.
   */
  const jugables = [...JUEGOS, desafioDe(TEMA)].filter((a) => a && !a.pendiente).map((a) => a.id);
  assert.deepEqual([...CONSTRUIDAS].sort(), [...jugables].sort());
});

test("★ ninguna actividad pendiente llega al camino", () => {
  /*
   * Es lo que hace segura la exención de la prueba del panel docente: una
   * actividad marcada pendiente no la puede abrir nadie, así que no puede
   * emitir un ítem que el profesor no sepa leer.
   */
  const desafio = desafioDe(TEMA);
  const todas = [...JUEGOS, ...(desafio ? [desafio] : [])];
  const pendientes = todas.filter((a) => a.pendiente);
  for (const a of pendientes) {
    assert.ok(!CONSTRUIDAS.includes(a.id), `${a.id}: está marcada pendiente y la vista la dibuja`);
  }
  /*
   * El número no se escribe: cada actividad del tema está construida o
   * pendiente, y nunca las dos ni ninguna. Escribirlo obligaría a subirlo a
   * mano en cada bloque de trabajo, que es justo la clase de cuenta que se
   * olvida de actualizar.
   */
  assert.equal(CONSTRUIDAS.length + pendientes.length, todas.length);
  assert.equal(todas.length, 8, "siete juegos y el desafío");
});

test("★ «tema completo» pide las siete, y el desafío no cuenta", () => {
  /*
   * Mientras el tema se construía, esta prueba vigilaba lo contrario: que
   * nadie recortara la lista a lo que ya se podía jugar, porque entonces
   * alguien se ganaría la medalla de tema completo con la mitad de los juegos
   * y al entrar el resto se la quitaríamos. Ya están las siete, así que lo
   * que queda por vigilar es el otro extremo: que las siete sigan siendo
   * jugables y que el desafío NO se cuele en la cuenta.
   *
   * Un desafío opcional que cuenta para la medalla deja de ser opcional, y
   * esa es la regla del Kit — la misma del Comité de NOVA.
   */
  assert.equal(JUEGOS.length, 7);
  assert.deepEqual(JUEGOS.filter((a) => a.pendiente), [], "una de las siete volvió a quedar pendiente");
  assert.equal(JUEGOS_DE_LA_VISTA.length, 7, "la vista no dibuja las siete");
  assert.ok(DESAFIO_MONTADO, "la vista no monta el desafío");

  const desafio = desafioDe(TEMA);
  assert.ok(desafio, "el tema perdió su desafío");
  assert.ok(!JUEGOS.some((a) => a.id === desafio.id), "el desafío se coló en «tema completo»");
});
