/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EL GUARDIÁN DE LAS MIGRACIONES
 *
 * POR QUÉ EXISTE
 *
 * Hasta el 15 de octubre de 2026 las migraciones se corrían a mano: una
 * persona abría el editor SQL de Supabase, pegaba el archivo y miraba el
 * resultado. Eso puso una fila delante de cinco células. Una mañana había
 * doce migraciones esperando y cuatro células paradas.
 *
 * La tentación era repartir la llave de producción entre los cinco generales.
 * El problema de eso no es la confianza: es que quien escribe la migración
 * sería quien la aplica, y se pierde la única mirada que no es la del autor.
 *
 * Este archivo ES esa mirada, escrita una vez. Comprueba exactamente lo que se
 * comprobaba a mano, pero en cada propuesta de cambio, al instante, y sin
 * dormirse. Lo que no pasa por aquí no llega a la base.
 *
 * QUÉ COMPRUEBA, Y POR QUÉ CADA COSA
 *
 *   1. NADA DESTRUCTIVO. Una migración de una célula solo añade filas al
 *      catálogo. Si trae ALTER, DROP, TRUNCATE, DELETE, UPDATE, GRANT o
 *      REVOKE fuera de un comentario, se rechaza. El rango del coordinador
 *      (0150-0199) es el único que puede cambiar el esquema, y aun así tiene
 *      que decirlo con la marca explícita de la constante MARCA_ESQUEMA.
 *
 *   2. EL NÚMERO, DENTRO DE SU RANGO. Cada célula tiene el suyo. Un número
 *      fuera de rango significa que dos células van a chocar, y el choque se
 *      descubre cuando ya están las dos escritas.
 *
 *      NO se comprueba que el id de la actividad empiece por el prefijo de la
 *      célula, aunque suene razonable: sería falso. Las Células B y C también
 *      construyeron piezas de Macroeconomía, y sus migraciones insertan ids
 *      como «en-que-talla-va» desde sus propios rangos. Esa regla, al
 *      escribirla, rechazaba migraciones que llevan meses aplicadas y
 *      correctas. La comprobación 3 ya caza un id equivocado sin inventarse
 *      una regla que la realidad no cumple.
 *
 *   3. LA FILA DICE LO MISMO QUE LA APLICACIÓN. Esta es la que de verdad
 *      protege a un estudiante. Si la migración declara 25 FP y subjects.js
 *      declara 50, alguien va a cobrar lo que no es. Se comparan materia,
 *      tema, modalidad, dificultad y FP, uno por uno.
 *
 * QUÉ **NO** COMPRUEBA, para que nadie lo suponga:
 *
 *   · Que la actividad esté bien hecha. Eso son las pruebas.
 *   · Que el SQL sea válido. Eso lo hace la tarea de CI que aplica todas las
 *     migraciones sobre un Postgres limpio.
 *   · Que la migración ya esté aplicada en producción. Eso lo lleva la tabla
 *     public.migraciones_aplicadas, no este archivo.
 *
 * QUÉ MIRA, Y ESTO SE APRENDIÓ ESCRIBIÉNDOLO: solo los archivos que la
 * propuesta AÑADE, no la historia entera. La primera versión juzgaba las 80
 * migraciones del repositorio y rechazaba doce que llevaban meses aplicadas y
 * funcionando: filas de actividades que después se renombraron, upserts
 * legítimos, piezas de Macro construidas por células de Contabilidad. Un
 * revisor de propuestas juzga lo que la propuesta trae; la historia ya es
 * realidad y volver a juzgarla solo produce ruido que acaba ignorándose.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(RAIZ, "supabase", "migrations");

/* La marca que el coordinador escribe cuando una migración suya sí cambia el
   esquema a propósito. Se escribe entera, en una línea de comentario. */
export const MARCA_ESQUEMA = "GUARDIAN: cambio de esquema a proposito";

/* Los rangos, copiados del mapa de choques de nocturno.md. Si cambian allí,
   cambian aquí: son la misma decisión escrita dos veces, y la prueba
   guardian-migraciones.test.mjs comprueba que no se separen. */
export const RANGOS = [
  { desde: 1, hasta: 69, duenio: "histórico (antes de las células)" },
  { desde: 70, hasta: 89, duenio: "Célula B" },
  { desde: 90, hasta: 149, duenio: "Célula C" },
  { desde: 150, hasta: 199, duenio: "coordinador" },
  { desde: 200, hasta: 249, duenio: "Célula D" },
  { desde: 250, hasta: 299, duenio: "Célula E" },
];

const DESTRUCTIVOS = /\b(alter|drop|truncate|delete|update|grant|revoke)\b/i;

/*
 * `on conflict (x) do update set ...` NO es destructivo: es la forma
 * idempotente de un insert, y la usan varias migraciones del catálogo para
 * poder correrse dos veces sin cambiar nada. Se quita antes de buscar verbos
 * destructivos, porque si no el guardián rechazaría la forma más segura de
 * escribir una migración, que es justo lo contrario de lo que debe hacer.
 */
function sinUpsert(sql) {
  return sql.replace(/on\s+conflict\s*(\([^)]*\))?\s*do\s+update\s+set[\s\S]*?(?=;)/gi, " ");
}

/* Quita comentarios de línea y de bloque. Un ALTER dentro de un comentario que
   explica cómo deshacer la migración es correcto y no debe rechazarse: el
   archivo 0100 lo lleva, y el guardián tiene que dejarlo pasar. */
export function sinComentarios(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split("\n")
    .map((l) => l.replace(/--.*$/, ""))
    .join("\n");
}

export function numeroDe(archivo) {
  const m = /^(\d{4})_/.exec(archivo);
  return m ? Number(m[1]) : null;
}

export function rangoDe(numero) {
  return RANGOS.find((r) => numero >= r.desde && numero <= r.hasta) ?? null;
}

/* Saca las filas de catálogo que inserta una migración. Devuelve [] si no
   inserta ninguna, que es legítimo: una migración de esquema no inserta. */
export function filasDeCatalogo(sql) {
  const limpio = sinComentarios(sql);
  if (!/insert\s+into\s+(public\.)?actividad_catalogo/i.test(limpio)) return [];
  const filas = [];
  const re = /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
  let m;
  while ((m = re.exec(limpio)) !== null) {
    filas.push({
      activity_id: m[1], subject_id: m[2], topic_id: m[3],
      modalidad: m[4], dificultad: m[5], fp_base: Number(m[6]), etapas: Number(m[7]),
    });
  }
  return filas;
}

/* El catálogo tal como lo declara la aplicación. */
export function catalogoDelCliente(SUBJECTS) {
  const por = new Map();
  for (const [materia, m] of Object.entries(SUBJECTS)) {
    for (const t of m.topics ?? []) {
      for (const a of t.actividades ?? []) {
        const c = a.clasificacion;
        if (!c || typeof c.fpBase !== "number") continue;
        por.set(a.id, {
          activity_id: a.id, subject_id: materia, topic_id: t.id,
          modalidad: c.modalidad, dificultad: c.dificultad, fp_base: c.fpBase,
        });
      }
    }
  }
  return por;
}

/*
 * La comprobación, pura: recibe los archivos ya leídos y el catálogo del
 * cliente, y devuelve la lista de reproches. Pura a propósito, para que la
 * prueba pueda darle casos inventados sin tocar el disco.
 */
export function revisar(archivos, catalogoCliente) {
  const reproches = [];
  for (const { nombre, sql } of archivos) {
    const numero = numeroDe(nombre);
    if (numero === null) {
      reproches.push(`${nombre}: el nombre no empieza por cuatro dígitos y un guion bajo.`);
      continue;
    }
    const rango = rangoDe(numero);
    if (!rango) {
      reproches.push(`${nombre}: el número ${numero} no cae en ningún rango reservado. Mira el mapa de choques en nocturno.md.`);
      continue;
    }

    const limpio = sinUpsert(sinComentarios(sql));
    const destructivo = DESTRUCTIVOS.exec(limpio);
    if (destructivo) {
      const permitido = rango.duenio === "coordinador" && sql.includes(MARCA_ESQUEMA);
      if (!permitido) {
        reproches.push(
          `${nombre}: trae «${destructivo[0]}» fuera de un comentario, y es del rango de ${rango.duenio}. ` +
          `Una migración de célula solo añade filas. Si de verdad tiene que cambiar el esquema, la escribe el coordinador en su rango y lo dice con la marca «${MARCA_ESQUEMA}».`
        );
      }
    }

    for (const fila of filasDeCatalogo(sql)) {
      const esperada = catalogoCliente.get(fila.activity_id);
      if (!esperada) {
        reproches.push(
          `${nombre}: inserta «${fila.activity_id}», que la aplicación no declara en subjects.js. ` +
          `Una fila sin actividad no hace daño, pero casi siempre significa un id mal escrito.`
        );
        continue;
      }
      for (const campo of ["subject_id", "topic_id", "modalidad", "dificultad", "fp_base"]) {
        if (String(fila[campo]) !== String(esperada[campo])) {
          reproches.push(
            `${nombre}: «${fila.activity_id}» dice ${campo}=${fila[campo]} y la aplicación declara ${esperada[campo]}. ` +
            `Si entra así, un estudiante cobra lo que no es.`
          );
        }
      }
    }
  }
  return reproches;
}

export function leerMigraciones() {
  const nombres = readdirSync(DIR).filter((n) => n.endsWith(".sql")).sort();
  return nombres.map((nombre) => ({ nombre, sql: readFileSync(join(DIR, nombre), "utf8") }));
}

/* ─── Como programa ─────────────────────────────────────────────────────── */
/*
 * Uso:
 *   node --import ./scripts/cargador-jsx.mjs scripts/guardian-migraciones.mjs [base]
 *
 * `base` es la referencia contra la que se compara, normalmente `origin/main`.
 * Sin ella, revisa TODAS las migraciones, que sirve para una auditoría a mano
 * pero no para una propuesta: la historia ya es realidad.
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const { SUBJECTS } = await import("../src/data/subjects.js");
  const base = process.argv[2];
  let archivos;

  if (base) {
    const { execFileSync } = await import("node:child_process");
    const salida = execFileSync("git", ["diff", "--name-only", "--diff-filter=AM", `${base}...HEAD`, "--", "supabase/migrations"], { cwd: RAIZ, encoding: "utf8" });
    const nombres = salida.split("\n").map((l) => l.trim()).filter(Boolean).map((r) => r.split("/").pop());
    archivos = nombres.map((nombre) => ({ nombre, sql: readFileSync(join(DIR, nombre), "utf8") }));
    if (archivos.length === 0) {
      console.log(`El guardián no encontró migraciones nuevas respecto a ${base}. Nada que revisar.`);
      process.exit(0);
    }
    console.log(`El guardián revisa ${archivos.length} migración(es) nueva(s) respecto a ${base}:`);
    for (const a of archivos) console.log("  · " + a.nombre);
  } else {
    archivos = leerMigraciones();
    /* La guarda del propio guardián, solo en el modo de auditoría completa: si
       no encuentra migraciones, falla en vez de aprobar. Un revisor que no
       revisó nada no aprueba. En el modo de propuesta no aplica, porque ahí
       «ninguna migración nueva» es un resultado legítimo y frecuente. */
    if (archivos.length < 50) {
      console.error(`El guardián solo encontró ${archivos.length} migraciones en ${DIR}. Son demasiadas pocas: algo va mal con la lectura, y no voy a dar por buena una revisión vacía.`);
      process.exit(1);
    }
  }

  const reproches = revisar(archivos, catalogoDelCliente(SUBJECTS));
  if (reproches.length) {
    console.error(`\nEl guardián rechaza ${reproches.length} cosa(s):\n`);
    for (const r of reproches) console.error("  · " + r);
    console.error("");
    process.exit(1);
  }
  console.log(`Sin reproches.`);
}
