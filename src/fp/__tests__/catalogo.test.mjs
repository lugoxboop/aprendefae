import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { SUBJECTS, HACER } from "../../data/subjects.js";

/*
 * El catálogo de actividades vive en DOS sitios y no hay forma de evitarlo: el
 * cliente lo necesita para dibujar la interfaz y el servidor para no creerse lo
 * que le digan. Lo que sí se puede evitar es que se separen en silencio.
 *
 * Esto compara lo que declara subjects.js contra lo que las migraciones meten
 * en actividad_catalogo. Corre en `npm test`, así que la separación se detecta
 * al desarrollar y no cuando un estudiante cobra los puntos de otra dificultad.
 *
 * Si falla porque se añadió una actividad: hay que añadirla también a la base,
 * con una migración NUEVA que haga el insert. No basta con editar la 0011, que
 * ya está aplicada: editar un archivo ya corrido no cambia la base, solo hace
 * que el archivo mienta.
 *
 * SE LEEN TODAS LAS MIGRACIONES, no solo la que sembró el catálogo. Antes esto
 * apuntaba a la 0011 sola, y la primera actividad añadida después habría hecho
 * fallar la prueba aunque su migración estuviera bien escrita.
 *
 * LAS ACTIVIDADES RETIRADAS SE LEEN TAMBIÉN, desde la 0015. Retirar una es
 * dejar su fila en el servidor como lápida y quitarla del cliente, así que sin
 * esto la lápida se vería exactamente igual que una deriva y la prueba la
 * marcaría. Se leen de los `update ... set retirada = true`, y una retirada
 * queda exenta SOLO del tercer chequeo —el de sobrantes—; si el cliente la
 * sigue ofreciendo, los otros dos la miran como a cualquier otra.
 *
 * LO QUE ESTA LECTURA NO CUBRE: un `delete from actividad_catalogo` en alguna
 * migración pasaría desapercibido, porque solo se leen los insert. Hoy no hay
 * ninguno, y la política del proyecto es retirar en blando en vez de borrar;
 * si eso cambia, hay que enseñárselo a esta función en vez de confiar en que
 * se acuerde alguien.
 */

const CARPETA = "supabase/migrations";

/*
 * Una tupla del insert: (id, materia, tema, modalidad, dificultad, fp_base) y,
 * desde la 0014, unas etapas opcionales al final. Las filas viejas no la traen
 * y valen 1, que es el valor por defecto de la columna.
 */
const FILA = /\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'(exploratoria|evaluativa)',\s*'(facil|medio|dificil|experto)',\s*(\d+)\s*(?:,\s*(\d+)\s*)?\)/g;

/*
 * Las filas que las migraciones meten en actividad_catalogo, en el orden en que
 * se aplican: una migración posterior puede reescribir una fila anterior con su
 * `on conflict do update`, así que gana la última.
 *
 * Solo se miran los tramos que van de un `insert into ... actividad_catalogo`
 * al `;` que lo cierra. Barrer el archivo entero haría que cualquier otro insert
 * de seis columnas con la forma parecida se colara en el catálogo.
 */
function catalogoDelServidor() {
  const salida = new Map();
  const archivos = readdirSync(CARPETA).filter((f) => f.endsWith(".sql")).sort();

  for (const archivo of archivos) {
    const sql = readFileSync(join(CARPETA, archivo), "utf8");
    const inserts = [...sql.matchAll(/insert\s+into\s+(?:public\.)?actividad_catalogo\b/gi)];

    for (const ins of inserts) {
      const fin = sql.indexOf(";", ins.index);
      const bloque = sql.slice(ins.index, fin === -1 ? undefined : fin);
      for (const m of bloque.matchAll(FILA)) {
        salida.set(m[1], {
          subject: m[2], topic: m[3], modalidad: m[4], dificultad: m[5], fpBase: Number(m[6]),
          etapas: m[7] ? Number(m[7]) : 1,
          archivo,
        });
      }
    }
  }
  return salida;
}

/*
 * Los ids que alguna migración marcó como retirados.
 *
 * Se leen de la forma `update ... set retirada = true where activity_id in
 * (...)`, que es como la 0015 escribe la lápida —con `in` incluso para un solo
 * id, justamente para que esto tenga una sola forma que leer.
 */
function retiradasDelServidor() {
  const salida = new Set();
  const archivos = readdirSync(CARPETA).filter((f) => f.endsWith(".sql")).sort();

  for (const archivo of archivos) {
    const sql = readFileSync(join(CARPETA, archivo), "utf8");
    const updates = sql.matchAll(
      /update\s+(?:public\.)?actividad_catalogo\s+set\s+retirada\s*=\s*true\s+where\s+activity_id\s+in\s*\(([^)]*)\)/gi
    );
    for (const u of updates) {
      for (const id of u[1].matchAll(/'([^']+)'/g)) salida.add(id[1]);
    }
  }
  return salida;
}

/* Lo que declara el catálogo del cliente. */
function catalogoDelCliente() {
  const salida = new Map();
  for (const materia of Object.values(SUBJECTS))
    for (const tema of materia.topics)
      for (const act of tema.actividades ?? []) {
        const c = act.clasificacion;
        if (c?.tipo !== HACER) continue;
        salida.set(act.id, {
          subject: materia.id, topic: tema.id,
          modalidad: c.modalidad, dificultad: c.dificultad, fpBase: c.fpBase,
          etapas: c.etapas ?? 1,
        });
      }
  return salida;
}

test("toda actividad que da FP está en el catálogo del servidor", () => {
  const cliente = catalogoDelCliente();
  const servidor = catalogoDelServidor();
  const faltan = [...cliente.keys()].filter((id) => !servidor.has(id));
  assert.deepEqual(faltan, [], `sin entrada en la migración: ${faltan.join(", ")}`);
});

test("dificultad y puntos base coinciden entre cliente y servidor", () => {
  const cliente = catalogoDelCliente();
  const servidor = catalogoDelServidor();
  const distintas = [];

  for (const [id, c] of cliente) {
    const s = servidor.get(id);
    if (!s) continue;
    /*
     * `etapas` entra en la comparación desde la 0014. Si el cliente dijera 4 y
     * el servidor 1, el desafío pagaría 90 en vez de 360 y nada más fallaría:
     * es exactamente el tipo de deriva silenciosa que esta prueba existe para
     * cazar.
     */
    for (const campo of ["subject", "topic", "modalidad", "dificultad", "fpBase", "etapas"]) {
      if (c[campo] !== s[campo]) {
        distintas.push(`${id}.${campo}: cliente=${c[campo]} servidor=${s[campo]}`);
      }
    }
  }

  assert.deepEqual(distintas, [], `el catálogo se separó:\n  ${distintas.join("\n  ")}`);
});

test("el servidor no paga por actividades que el cliente no ofrece", () => {
  const cliente = catalogoDelCliente();
  const servidor = catalogoDelServidor();
  const retiradas = retiradasDelServidor();
  /*
   * camara-presion-experto es la excepción conocida: es un modo de una
   * actividad, no una entrada propia del catálogo del cliente. Cualquier otra
   * sobrante sería una actividad que la base paga y que ya no existe.
   *
   * Las RETIRADAS quedan exentas de este chequeo y solo de este: su fila
   * existe a propósito sin que el cliente la ofrezca, que es justo lo que
   * significa retirarla. La prueba sigue haciendo su trabajo con todo lo
   * demás — una actividad que desaparezca del cliente SIN marcarse retirada
   * se sigue cazando aquí.
   */
  const conocidas = new Set(["camara-presion-experto"]);
  const sobran = [...servidor.keys()].filter(
    (id) => !cliente.has(id) && !conocidas.has(id) && !retiradas.has(id)
  );
  assert.deepEqual(sobran, [], `el servidor pagaría por: ${sobran.join(", ")}`);
});

test("una actividad retirada no la sigue ofreciendo el cliente", () => {
  /*
   * El reverso del chequeo de arriba, y hace falta: la exención de las
   * retiradas abre la puerta a marcar una por error y dejarla puesta en la
   * interfaz. Entonces el estudiante la vería, la jugaría y cobraría por una
   * actividad que en el servidor consta como retirada, sin que nada avisara.
   */
  const cliente = catalogoDelCliente();
  const retiradas = retiradasDelServidor();
  const puestas = [...retiradas].filter((id) => cliente.has(id));
  assert.deepEqual(puestas, [], `retiradas que el cliente todavía ofrece: ${puestas.join(", ")}`);
});
