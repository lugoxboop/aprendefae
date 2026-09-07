/*
 * Que los item_id de cada actividad instrumentada sean únicos DENTRO de ella.
 *
 * POR QUÉ ES UNA PRUEBA Y NO UNA REVISIÓN A OJO. fp_detalle no lo impone: no
 * hay unique, ni puede haberlo —una actividad repetida vuelve a escribir los
 * mismos ítems, y eso es correcto—. La unicidad es responsabilidad del cliente
 * que los emite, y romperla no falla: dos preguntas distintas se suman en la
 * misma fila y el panel docente miente en silencio.
 *
 * El caso real: en "¿Quién gana, quién pierde?" el personaje `bonos` existe en
 * la ronda de la tasa y en la del gasto, y son personas distintas. Sin el
 * prefijo de ronda, el panel diría que "bonos" se falla la mitad de las veces
 * mezclando dos preguntas que no tienen nada que ver.
 *
 * SI FALLARA DE VERDAD: quitar el prefijo `${r.id}:` de QuienGanaQuienPierde
 * deja 15 ids para 16 clasificaciones y esta prueba lo dice con el id repetido.
 * Comprobado quitándolo a propósito antes de darla por buena.
 *
 * Aquí se listan los ids que CADA mecánica emite, derivados de los mismos datos
 * que usa el componente. Si un componente cambia su esquema de ids sin
 * actualizar esto, lo que falla es el otro extremo: el recuento total.
 */
import {
  RONDAS_GANADORES, ESCENARIOS_EXPLICA, CASOS_CRISIS, RANURAS_CRISIS, BANCO_CORRIENTE,
} from "../../data/juegosPolitica2.js";
import { CASILLAS, CASOS_CADENA } from "../../data/juegosPolitica.js";
import { QUIZZES } from "../../data/quizzes.js";
import { parejasDe } from "../../utils/orden.js";
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

/* ── quien-gana-quien-pierde ── 4 clasificaciones + 1 etapa 2, por ronda ── */
unicos(
  "quien-gana-quien-pierde",
  RONDAS_GANADORES.flatMap((r) => [
    ...r.personajes.map((p) => `${r.id}:${p.id}`),
    `${r.id}:directo`,
  ]),
  RONDAS_GANADORES.reduce((n, r) => n + r.personajes.length + 1, 0)
);

/*
 * Y la prueba de que el prefijo hace falta: sin él, hay choque. Si algún día
 * los nombres dejaran de chocar, esto avisa de que el prefijo ya no está
 * defendiendo nada — no de que esté mal, pero sí de que el comentario miente.
 */
{
  const sinPrefijo = RONDAS_GANADORES.flatMap((r) => r.personajes.map((p) => p.id));
  const choca = sinPrefijo.length !== new Set(sinPrefijo).size;
  if (!choca) fallos++;
  filas.push({
    actividad: "quien-gana-quien-pierde (sin prefijo)",
    esperado: "hay choque, por eso lleva prefijo",
    obtenido: choca ? "choca, como se documenta" : "YA NO CHOCA: revisar el comentario",
    resultado: choca ? "PASA" : "FALLA",
  });
}

/* ── arma-grupo-logico ── una casilla por hueco, prefijada por caso ── */
/*
 * Solo se juega UN caso por partida, así que una partida emite 6 ids. Se
 * comprueban los 12 posibles juntos porque el riesgo es justo ese: que la
 * Meta del acero y la Meta de la inflación acaben en la misma fila.
 */
unicos(
  "arma-grupo-logico",
  CASOS_CADENA.flatMap((c) => CASILLAS.map((k) => `${c.id}:${k.id}`)),
  CASOS_CADENA.length * CASILLAS.length
);

{
  const sinPrefijo = CASOS_CADENA.flatMap(() => CASILLAS.map((k) => k.id));
  const choca = sinPrefijo.length !== new Set(sinPrefijo).size;
  if (!choca) fallos++;
  filas.push({
    actividad: "arma-grupo-logico (sin prefijo)",
    esperado: "hay choque, por eso lleva prefijo",
    obtenido: choca ? "choca, como se documenta" : "YA NO CHOCA: revisar el comentario",
    resultado: choca ? "PASA" : "FALLA",
  });
}

/*
 * Y los enunciados, que sí vienen prefijados de origen (a-* e i-*): si alguien
 * añadiera un caso nuevo reusando ids, `respuesta` mezclaría enunciados de
 * casos distintos y nadie lo notaría.
 */
unicos(
  "arma-grupo-logico · enunciados",
  CASOS_CADENA.flatMap((c) => c.enunciados.map((e) => e.id)),
  CASOS_CADENA.reduce((n, c) => n + c.enunciados.length, 0)
);

/* ── explica-la-politica ── el fragmento elegido, sin prefijo ── */
/*
 * Aquí NO hay prefijo, y es correcto: los ids ya nacen separados por escenario
 * (ta* y ar*). Esta comprobación existe para que un escenario nuevo que reusara
 * ids no pase inadvertido — sería el mismo fallo silencioso, sin el aviso.
 */
unicos(
  "explica-la-politica",
  ESCENARIOS_EXPLICA.flatMap((e) => e.fragmentos.map((f) => f.id)),
  ESCENARIOS_EXPLICA.reduce((n, e) => n + e.fragmentos.length, 0)
);

/* ── simulador-de-crisis ── una ranura por hueco, prefijada por caso ── */
/*
 * El caso más grave del prefijo: la Estrategia de la sequía es "política
 * comercial" y la de la corrida bancaria es "política monetaria" — respuestas
 * contrarias bajo el mismo nombre de ranura.
 */
unicos(
  "simulador-de-crisis",
  CASOS_CRISIS.flatMap((c) => RANURAS_CRISIS.map((r) => `${c.id}:${r}`)),
  CASOS_CRISIS.length * RANURAS_CRISIS.length
);

{
  const sinPrefijo = CASOS_CRISIS.flatMap(() => RANURAS_CRISIS);
  const choca = sinPrefijo.length !== new Set(sinPrefijo).size;
  if (!choca) fallos++;
  filas.push({
    actividad: "simulador-de-crisis (sin prefijo)",
    esperado: "hay choque, por eso lleva prefijo",
    obtenido: choca ? "choca, como se documenta" : "YA NO CHOCA: revisar el comentario",
    resultado: choca ? "PASA" : "FALLA",
  });
}

unicos(
  "simulador-de-crisis · piezas",
  CASOS_CRISIS.flatMap((c) => c.piezas.map((p) => p.id)),
  CASOS_CRISIS.reduce((n, c) => n + c.piezas.length, 0)
);

/* ── corriente-titulares ── el enunciado, banco global sin prefijo ── */
/*
 * Un solo banco, sin rondas ni casos: los 29 ids ya son distintos entre sí y
 * cada tanda sortea 18. No hay nada que prefijar, pero sí que vigilar, porque
 * el banco es el que más crece: añadir un enunciado con un id ya usado sumaría
 * dos preguntas en la misma fila sin que nada fallara.
 */
unicos(
  "corriente-titulares",
  BANCO_CORRIENTE.map((x) => x.id),
  BANCO_CORRIENTE.length
);

/* ── simulador-da ── la pregunta, prefijada por canal ── */
/*
 * Los cuatro canales tienen cinco preguntas cada uno indexadas 0..4: sin el
 * prefijo de canal, la pregunta 0 de consumo y la 0 de inversión —que no
 * tienen nada que ver— caerían en la misma fila.
 */
{
  const canales = ["consumo", "inversion", "gasto", "xn"];
  unicos(
    "simulador-da",
    [
      ...canales.flatMap((c) => QUIZZES[c].map((_, i) => `${c}:${i}`)),
      "final:finalQ1",
      "final:finalQ2",
    ],
    canales.reduce((n, c) => n + QUIZZES[c].length, 0) + 2
  );

  const sinPrefijo = [
    ...canales.flatMap((c) => QUIZZES[c].map((_, i) => String(i))),
    "finalQ1", "finalQ2",
  ];
  const choca = sinPrefijo.length !== new Set(sinPrefijo).size;
  if (!choca) fallos++;
  filas.push({
    actividad: "simulador-da (sin prefijo)",
    esperado: "hay choque, por eso lleva prefijo",
    obtenido: choca ? "choca, como se documenta" : "YA NO CHOCA: revisar el comentario",
    resultado: choca ? "PASA" : "FALLA",
  });

  /* Y que los ids de opción sean únicos dentro de cada pregunta: son `respuesta`. */
  const malas = [];
  for (const c of canales) {
    QUIZZES[c].forEach((q, i) => {
      const ids = q.options.map((o) => o.id);
      if (ids.length !== new Set(ids).size) malas.push(`${c}:${i}`);
    });
  }
  for (const k of ["finalQ1", "finalQ2"]) {
    const ids = QUIZZES[k].options.map((o) => o.id);
    if (ids.length !== new Set(ids).size) malas.push(`final:${k}`);
  }
  if (malas.length) fallos++;
  filas.push({
    actividad: "simulador-da · opciones",
    esperado: "ninguna pregunta repite id de opción",
    obtenido: malas.length ? "REPITEN: " + malas.join(", ") : "ninguna repite",
    resultado: malas.length ? "FALLA" : "PASA",
  });
}

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

console.table(filas);
console.log(fallos === 0
  ? `\nTodos los ids son únicos dentro de su actividad (${filas.length} chequeos).`
  : `\n${fallos} FALLAN.`);
if (fallos > 0) process.exit(1);
