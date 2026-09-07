/*
 * Que los cortes de banda del cliente y los de la migración 0021 sean el mismo
 * número.
 *
 * POR QUÉ EXISTE. Los dos cortes se importan de sus módulos en el cliente
 * —UMBRALES_DESTACADO.precisionPct y UMBRALES.pctEvaluativaBaja— pero
 * panel_actividad los tiene escritos a mano, porque una función de Postgres no
 * puede leer un módulo de JavaScript.
 *
 * Ese es el punto exacto por donde esto se rompe EN SILENCIO: alguien sube el
 * listón de Destacados, el panel y la vista cambian, y la distribución que
 * calcula el servidor sigue con el número viejo. Nadie ve un error; ve dos
 * pantallas que no cuadran y no sabe cuál creer.
 *
 * Esta prueba LEE LA MIGRACIÓN y compara. Es fea —una prueba de JavaScript
 * abriendo un .sql— y es la única forma de tener una sola verdad cuando el
 * lenguaje impide compartirla.
 */
import { readFileSync } from "node:fs";
import { CORTE_ALTO, CORTE_BAJO, BANDAS, bandaDe } from "../bandas.js";

let fallos = 0;
const filas = [];
const check = (caso, esperado, obtenido) => {
  const pasa = esperado === obtenido;
  if (!pasa) fallos++;
  filas.push({ caso, esperado, obtenido, resultado: pasa ? "PASA" : "FALLA" });
};

/* ── Los dos lados dicen el mismo número ── */
{
  const sql = readFileSync("supabase/migrations/0021_panel_por_actividad.sql", "utf8");
  const leer = (nombre) => {
    const m = sql.match(new RegExp(`${nombre}\\s+constant\\s+numeric\\s*:=\\s*(\\d+)`));
    return m ? Number(m[1]) : null;
  };
  check("el corte alto del SQL es el del cliente", CORTE_ALTO, leer("c_alto"));
  check("el corte bajo del SQL es el del cliente", CORTE_BAJO, leer("c_bajo"));
}

/* ── Y son los que el proyecto ya usaba, no unos nuevos ── */
check("el corte alto es el listón de Destacados", 85, CORTE_ALTO);
check("el corte bajo es el de la alerta ámbar", 60, CORTE_BAJO);

/* ── La clasificación, en los bordes ── */
check("justo en el corte alto sube a alta", "alta", bandaDe(CORTE_ALTO));
check("uno por debajo del alto es media", "media", bandaDe(CORTE_ALTO - 1));
check("justo en el corte bajo es media", "media", bandaDe(CORTE_BAJO));
check("uno por debajo del bajo es baja", "baja", bandaDe(CORTE_BAJO - 1));
check("el 100 es alta", "alta", bandaDe(100));
check("el 0 es baja", "baja", bandaDe(0));
check("sin porcentaje no hay banda", null, bandaDe(null));
check("un valor raro tampoco", null, bandaDe("no es un número"));

/* ── Las bandas no dejan huecos ni se solapan ── */
{
  const cubiertos = [];
  for (let p = 0; p <= 100; p++) cubiertos.push(bandaDe(p));
  check("los 101 valores caen en alguna banda", 0, cubiertos.filter((b) => b === null).length);
  check("hay exactamente tres bandas distintas", 3, new Set(cubiertos).size);
}

/* ── Cada banda dice su nombre, no solo su color ── */
check("las tres bandas tienen nombre y rango escritos", true,
  BANDAS.every((b) => typeof b.nombre === "string" && b.nombre.length > 0
                   && typeof b.detalle === "string" && b.detalle.length > 0));

console.table(filas);
console.log(fallos === 0
  ? `\nLos cortes coinciden en los dos lados (${filas.length} chequeos).`
  : `\n${fallos} FALLAN.`);
if (fallos > 0) process.exit(1);
