/*
 * Que los item_id de cada actividad instrumentada sean únicos DENTRO de ella.
 *
 * POR QUÉ ES UNA PRUEBA Y NO UNA REVISIÓN A OJO. fp_detalle no lo impone: no
 * hay unique, ni puede haberlo —una actividad repetida vuelve a escribir los
 * mismos ítems, y eso es correcto—. La unicidad es responsabilidad del cliente
 * que los emite, y romperla no falla: dos preguntas distintas se suman en la
 * misma fila y el panel docente miente en silencio.
 *
 * El caso real era de «¿Quién gana, quién pierde?» (Macroeconomía): el
 * personaje `bonos` existía en dos rondas y eran personas distintas. Sin el
 * prefijo de ronda, el panel habría mezclado dos preguntas en una fila. Hoy lo
 * mismo lo guarda el prefijo de caso de asedio-estrategico, más abajo.
 *
 * DESDE EL 22-NOV-2026 solo quedan aquí las de Pensamiento Estratégico. Las de
 * Macroeconomía (Política Económica, Demanda Agregada, Política Fiscal y
 * Política Monetaria) salieron con la materia, que se rehace desde cero
 * (0258): sus bancos ya no existen y no hay nada que comprobar. El Macro nuevo
 * añade aquí las suyas.
 *
 * Aquí se listan los ids que CADA mecánica emite, derivados de los mismos datos
 * que usa el componente. Si un componente cambia su esquema de ids sin
 * actualizar esto, lo que falla es el otro extremo: el recuento total.
 */
import { parejasDe } from "../../utils/orden.js";
import { FUERZAS, CASOS } from "../../data/asedio.js";
import { REFERENCIA, clave } from "../../components/mecanicas/MapaCausal.jsx";
import { CITAS_EXPEDIENTE, NIVELES, ORDEN_DECISIONES, MOMENTOS, BANCO_ARCA } from "../../data/arca.js";
import {
  BLIPS_RADAR, ANILLOS, DEFINICIONES, OPCIONES_RESCATE,
  BANCO_ARQUITECTO, RANURAS, FRAGMENTOS_TRANSMISION, CORRIENTE,
  ORDEN_TRIBUNAL, CRITERIOS_TRIBUNAL,
} from "../../data/icebergActividades.js";

let fallos = 0;
const filas = [];

const unicos = (actividad, ids, esperados) => {
  const vistos = new Set();
  const repetidos = [...new Set(ids.filter((x) => vistos.size === vistos.add(x).size))];
  const ok = repetidos.length === 0 && ids.length === esperados;
  if (!ok) fallos++;
  filas.push({
    actividad,
    esperado: `${esperados} ids, ninguno repetido`,
    obtenido: `${ids.length} ids, ${repetidos.length ? "REPETIDOS: " + repetidos.join(", ") : "ninguno repetido"}`,
    resultado: ok ? "PASA" : "FALLA",
  });
};

/* ── radar-profundidad ── el blip, sin prefijo ── */
/*
 * Siete señales con id propio (r-evento … r-trampa-3), un solo caso, sin
 * rondas: no hay nada que prefijar. Se registran las siete, trampas incluidas.
 */
unicos("radar-profundidad", BLIPS_RADAR.map((b) => b.id), BLIPS_RADAR.length);

/* Los anillos son los valores de `respuesta`: si dos se llamaran igual, no se
 * podría saber dónde puso la señal. */
unicos("radar-profundidad · anillos", [...ANILLOS], ANILLOS.length);

/* ── camara-presion ── el término preguntado ── */
/*
 * DEFINICIONES no tiene campo id: la cadena del término ES el identificador, y
 * es con la que compara el componente. Los dos modos se registran como
 * actividades distintas (camara-presion / camara-presion-experto), así que sus
 * filas ya viven separadas por activity_id.
 */
unicos("camara-presion", DEFINICIONES.map((d) => d.termino), DEFINICIONES.length);

/* ── expediente-rescate ── una sola decisión ── */
/*
 * Una fila por partida: el diagnóstico. El id es fijo, y lo que varía es
 * `respuesta` —cuál de las cuatro opciones eligió—, así que lo que hay que
 * vigilar es que esas cuatro no repitan id.
 */
unicos("expediente-rescate · opciones", OPCIONES_RESCATE.map((o) => o.id), OPCIONES_RESCATE.length);

/* ── arquitecto-profundidades ── la ranura, sin prefijo ── */
/*
 * Un solo caso, tres ranuras con nombre distinto: no hay nada que prefijar.
 * Las quince piezas son los valores de `respuesta`.
 */
unicos("arquitecto-profundidades", [...RANURAS], RANURAS.length);
unicos("arquitecto-profundidades · piezas", BANCO_ARQUITECTO.map((p) => p.id), BANCO_ARQUITECTO.length);

/* ── transmision-superficie ── el fragmento enviado ── */
unicos("transmision-superficie", FRAGMENTOS_TRANSMISION.map((f) => f.id), FRAGMENTOS_TRANSMISION.length);

/* ── corriente-cruzada ── la frase ── */
/*
 * Dieciséis frases de cuatro casos intercalados, con id propio cada una
 * (c-t*, c-c*, c-b*, c-f*): el prefijo de caso ya viene de origen.
 */
unicos("corriente-cruzada", CORRIENTE.map((c) => c.id), CORRIENTE.length);

/* ── tribunal-profundidad ── la pareja, mas el criterio ── */
/*
 * Tres hipótesis dan tres parejas, y el criterio es un ítem más. El prefijo
 * `par:` existe para que ninguna pareja pueda llamarse igual que `criterio`.
 */
unicos(
  "tribunal-profundidad",
  [...parejasDe(ORDEN_TRIBUNAL).map(([a, b]) => `par:${a}-${b}`), "criterio"],
  parejasDe(ORDEN_TRIBUNAL).length + 1
);
unicos("tribunal-profundidad · criterios", CRITERIOS_TRIBUNAL.map((c) => c.id), CRITERIOS_TRIBUNAL.length);

/* ── proyecto-arca ── cuatro etapas, prefijadas por etapa ── */
/*
 * EL PREFIJO NO ES OBLIGATORIO HOY —los ids de las cuatro etapas no coinciden
 * entre sí— y este paso lo dice tal cual en vez de fingir un choque. Se queda
 * porque son cuatro juegos dentro de una actividad: sin él, añadir un ítem a
 * una etapa puede colisionar en silencio con otra, que es el fallo que ya
 * apareció tres veces en este tema.
 */
{
  const ids = [
    ...CITAS_EXPEDIENTE.map((c) => `et1:${c.id}`),
    ...NIVELES.map((n) => `et2:${n}`),
    ...parejasDe(ORDEN_DECISIONES).map(([a, b]) => `et3:par:${a}-${b}`),
    "et4:momento",
  ];
  unicos("proyecto-arca", ids, CITAS_EXPEDIENTE.length + NIVELES.length + parejasDe(ORDEN_DECISIONES).length + 1);

  /* Y la comprobación de que el prefijo defiende algo de verdad. */
  const sinPrefijo = [
    ...CITAS_EXPEDIENTE.map((c) => c.id),
    ...NIVELES,
    ...parejasDe(ORDEN_DECISIONES).map(([a, b]) => `par:${a}-${b}`),
    "momento",
  ];
  const choca = sinPrefijo.length !== new Set(sinPrefijo).size;
  filas.push({
    actividad: "proyecto-arca (sin prefijo)",
    esperado: "hay choque, por eso lleva prefijo",
    obtenido: choca ? "choca, como se documenta" : "no choca hoy, pero el prefijo se queda",
    resultado: "PASA",
  });
}

/* Los valores de `respuesta`: piezas de la etapa 2 y momentos de la 4. */
unicos("proyecto-arca · piezas", BANCO_ARCA.map((p) => p.id), BANCO_ARCA.length);
unicos("proyecto-arca · momentos", MOMENTOS.map((m) => m.id), MOMENTOS.length);

/* ── constructor-mapa-causal ── la flecha, en dos clases ── */
/*
 * Doce ids fijos `ref:*` —las flechas del mapa de referencia— más los
 * `extra:*` que dependen de lo que invente cada estudiante. El prefijo separa
 * las dos clases: sin él, una flecha inventada que algún día entrara en la
 * referencia se sumaría con su propia versión anterior.
 */
unicos(
  "constructor-mapa-causal",
  REFERENCIA.map((c) => `ref:${clave(c.de, c.a)}`),
  REFERENCIA.length
);

/* ── asedio-estrategico ── la fuerza dentro de su caso ── */
/*
 * Las cinco fuerzas se llaman igual en los tres casos pero el reparto ideal es
 * distinto en cada uno, así que sin el prefijo de caso el panel promediaría
 * tres preguntas con tres respuestas correctas distintas.
 */
unicos(
  "asedio-estrategico",
  CASOS.flatMap((c) => FUERZAS.map((f) => `${c.id}:${f.id}`)),
  CASOS.length * FUERZAS.length
);

{
  const sinPrefijo = CASOS.flatMap(() => FUERZAS.map((f) => f.id));
  const choca = sinPrefijo.length !== new Set(sinPrefijo).size;
  if (!choca) fallos++;
  filas.push({
    actividad: "asedio-estrategico (sin prefijo)",
    esperado: "hay choque, por eso lleva prefijo",
    obtenido: choca ? "choca, como se documenta" : "YA NO CHOCA: revisar el comentario",
    resultado: choca ? "PASA" : "FALLA",
  });
}

console.table(filas);
console.log(fallos === 0
  ? `\nTodos los ids son únicos dentro de su actividad (${filas.length} chequeos).`
  : `\n${fallos} FALLAN.`);
if (fallos > 0) process.exit(1);
