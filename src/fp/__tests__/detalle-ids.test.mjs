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
import { parejasDe } from "../../utils/orden.js";
import { FUERZAS, CASOS } from "../../data/asedio.js";
import { REFERENCIA, clave } from "../../components/mecanicas/MapaCausal.jsx";
import { CITAS_EXPEDIENTE, NIVELES, ORDEN_DECISIONES, MOMENTOS, BANCO_ARCA } from "../../data/arca.js";
import {
  TERMINOS_ECG, DEFINICIONES_ECG, FRAGMENTOS_ECG, REACCIONES, PASOS_TRANSFUSION,
  CASOS_BIOPSIA, CASOS_TRIAGE, CASOS_CIRUGIA, ALERTAS_MONITOR, COMPONENTES_MONITOR,
} from "../../data/demandaAgregadaHacer.js";
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

/* ═══════════ LOS SIETE JUEGOS DE DEMANDA AGREGADA ═══════════ */

/* ── electrocardiograma ── el término en la etapa 1, el fragmento en la 2 ── */
/*
 * Ocho ids `def:*` —uno por término, no por definición: las dos variantes son
 * paráfrasis de la misma pregunta y comparten fila a propósito— y seis
 * `frag:*`, de los que cada partida sortea cuatro.
 *
 * Los dos prefijos NO arreglan un choque presente: hoy ningún término se llama
 * como un fragmento. Están para que las dos etapas no puedan pisarse al crecer,
 * y para que la fila del panel diga sola de qué etapa era.
 */
unicos(
  "electrocardiograma",
  [
    ...TERMINOS_ECG.map((t) => `def:${t.id}`),
    ...FRAGMENTOS_ECG.map((x) => `frag:${x.id}`),
  ],
  TERMINOS_ECG.length + FRAGMENTOS_ECG.length
);

/* Cada definición apunta a un término que existe, y cada término tiene sus dos. */
{
  const huerfanas = DEFINICIONES_ECG.filter((d) => !TERMINOS_ECG.some((t) => t.id === d.termino));
  const sinPareja = TERMINOS_ECG.filter(
    (t) => DEFINICIONES_ECG.filter((d) => d.termino === t.id).length !== 2
  );
  const mal = huerfanas.length + sinPareja.length;
  if (mal) fallos++;
  filas.push({
    actividad: "electrocardiograma · parejas",
    esperado: "8 términos con 2 definiciones cada uno",
    obtenido: mal
      ? `huérfanas: ${huerfanas.map((d) => d.id).join(", ") || "ninguna"} · sin pareja: ${sinPareja.map((t) => t.id).join(", ") || "ninguno"}`
      : "las 16 emparejadas",
    resultado: mal ? "FALLA" : "PASA",
  });
}

/* ── termometro-reacciones ── el id de la ronda ── */
/*
 * Doce en el banco, seis por partida. Sin prefijo y sin necesidad: cada cambio
 * es su propia pregunta. Que "sube-y" y "baja-y" sean filas separadas es lo que
 * se quiere —subir y bajar la renta son dos preguntas distintas— y por eso el
 * id lleva la dirección dentro.
 */
unicos("termometro-reacciones", REACCIONES.map((x) => x.id), REACCIONES.length);

/*
 * Los ids de opción son los valores de `respuesta`: dos iguales en una ronda
 * harían imposible saber qué eligió el estudiante.
 */
{
  const malas = REACCIONES.filter((x) => {
    const ids = x.opciones.map((o) => o.id);
    return ids.length !== new Set(ids).size || !ids.includes(x.correcta);
  }).map((x) => x.id);
  if (malas.length) fallos++;
  filas.push({
    actividad: "termometro-reacciones · opciones",
    esperado: "ids únicos y la correcta entre ellos",
    obtenido: malas.length ? "MAL: " + malas.join(", ") : "las 12 rondas bien",
    resultado: malas.length ? "FALLA" : "PASA",
  });
}

/* ── banco-transfusiones ── el paso, prefijado por ronda ── */
unicos(
  "banco-transfusiones",
  ["r2", "r3"].flatMap((ronda) => PASOS_TRANSFUSION.map((p) => `${ronda}:${p.id}`)),
  PASOS_TRANSFUSION.length * 2
);

/*
 * Aquí el prefijo SÍ es lo único que separa dos preguntas: los cuatro pasos se
 * llaman igual en la ronda guiada y en la sola, y sin él el paso hecho con la
 * fórmula delante se sumaría con el hecho sin ella, que es justo la comparación
 * que esta actividad existe para poder hacer.
 */
{
  const sinPrefijo = ["r2", "r3"].flatMap(() => PASOS_TRANSFUSION.map((p) => p.id));
  const choca = sinPrefijo.length !== new Set(sinPrefijo).size;
  if (!choca) fallos++;
  filas.push({
    actividad: "banco-transfusiones (sin prefijo)",
    esperado: "hay choque, por eso lleva prefijo",
    obtenido: choca ? "choca, como se documenta" : "YA NO CHOCA: revisar el comentario",
    resultado: choca ? "PASA" : "FALLA",
  });
}

/* ── biopsia-economica ── un id por caso ── */
/*
 * Una sola fila por partida. Lleva el caso porque los dos enunciados son
 * distintos y el panel debe poder decir cuál se atraviesa, aunque la respuesta
 * correcta sea la misma en los dos.
 */
unicos("biopsia-economica", CASOS_BIOPSIA.map((c) => `biopsia:${c.id}`), CASOS_BIOPSIA.length);

{
  const malas = CASOS_BIOPSIA.filter((c) => {
    const ids = c.opciones.map((o) => o.id);
    return ids.length !== new Set(ids).size || !ids.includes(c.correcta);
  }).map((c) => c.id);
  if (malas.length) fallos++;
  filas.push({
    actividad: "biopsia-economica · opciones",
    esperado: "ids únicos y la correcta entre ellos",
    obtenido: malas.length ? "MAL: " + malas.join(", ") : "los dos casos bien",
    resultado: malas.length ? "FALLA" : "PASA",
  });
}

/* ── triage-emergencias ── el duelo, prefijado por caso ── */
/*
 * Seis: tres duelos por cada uno de los dos casos. HOY NO CHOCARÍAN sin el
 * prefijo, y por eso aquí no hay chequeo de choque que fingir: los seis nombres
 * salieron distintos por cómo cayeron las parejas. El prefijo está porque las
 * medidas A, B y C significan cosas contrarias en cada caso y con tres letras
 * solo hay tres parejas posibles: un tercer caso repetiría una.
 */
unicos(
  "triage-emergencias",
  CASOS_TRIAGE.flatMap((c) => c.duelos.map((d) => `${c.id}:${d.id}`)),
  CASOS_TRIAGE.reduce((n, c) => n + c.duelos.length, 0)
);

/*
 * El ganador de cada duelo tiene que ser uno de los dos que compiten, y los tres
 * duelos tienen que estar de acuerdo con el ranking declarado del caso. Un
 * duelo que contradijera el orden enseñaría un ciclo.
 */
{
  const mal = [];
  for (const c of CASOS_TRIAGE) {
    for (const d of c.duelos) {
      if (!d.par.includes(d.gana)) mal.push(`${c.id}:${d.id} gana quien no juega`);
      const [x, y] = d.par;
      const mejor = c.ranking.indexOf(x) < c.ranking.indexOf(y) ? x : y;
      if (mejor !== d.gana) mal.push(`${c.id}:${d.id} contradice el ranking`);
    }
  }
  if (mal.length) fallos++;
  filas.push({
    actividad: "triage-emergencias · coherencia",
    esperado: "cada duelo lo gana quien va antes en el ranking",
    obtenido: mal.length ? mal.join(" · ") : "los seis de acuerdo con su ranking",
    resultado: mal.length ? "FALLA" : "PASA",
  });
}

/* ── cirugia-reconstruccion ── la casilla, prefijada por caso ── */
unicos(
  "cirugia-reconstruccion",
  CASOS_CIRUGIA.flatMap((c) => [`${c.id}:primero`, `${c.id}:segundo`]),
  CASOS_CIRUGIA.length * 2
);

/*
 * Aquí el prefijo es obligatorio: las dos casillas se llaman igual en los dos
 * casos, y "primer orden" es XN en la helada y Ḡ en el puente.
 */
{
  const sinPrefijo = CASOS_CIRUGIA.flatMap(() => ["primero", "segundo"]);
  const choca = sinPrefijo.length !== new Set(sinPrefijo).size;
  if (!choca) fallos++;
  filas.push({
    actividad: "cirugia-reconstruccion (sin prefijo)",
    esperado: "hay choque, por eso lleva prefijo",
    obtenido: choca ? "choca, como se documenta" : "YA NO CHOCA: revisar el comentario",
    resultado: choca ? "PASA" : "FALLA",
  });
}

/* Cada caso tiene exactamente un primero, un segundo y tres señuelos. */
{
  const mal = CASOS_CIRUGIA.filter((c) => {
    const n = (papel) => c.opciones.filter((o) => o.papel === papel).length;
    return n("primero") !== 1 || n("segundo") !== 1 || n("senuelo") !== 3;
  }).map((c) => c.id);
  if (mal.length) fallos++;
  filas.push({
    actividad: "cirugia-reconstruccion · reparto",
    esperado: "1 primero, 1 segundo y 3 señuelos por caso",
    obtenido: mal.length ? "MAL: " + mal.join(", ") : "los dos casos bien repartidos",
    resultado: mal.length ? "FALLA" : "PASA",
  });
}

/* ── sala-monitores ── el id de la alerta ── */
/*
 * Veinticuatro en el banco, doce por partida. Sin prefijo y sin necesidad: no
 * hay dos contextos donde la misma alerta signifique cosas distintas, que es la
 * única razón por la que otras actividades lo llevan.
 */
unicos("sala-monitores", ALERTAS_MONITOR.map((a) => a.id), ALERTAS_MONITOR.length);

/* Seis alertas por componente, y ninguna apuntando a un componente inventado. */
{
  const desbalance = COMPONENTES_MONITOR
    .map((c) => [c.id, ALERTAS_MONITOR.filter((a) => a.componente === c.id).length])
    .filter(([, n]) => n !== 6);
  const huerfanas = ALERTAS_MONITOR.filter(
    (a) => !COMPONENTES_MONITOR.some((c) => c.id === a.componente)
  );
  const roto = desbalance.length + huerfanas.length;
  if (roto) fallos++;
  filas.push({
    actividad: "sala-monitores · reparto",
    esperado: "6 alertas por componente, ninguna huérfana",
    obtenido: roto
      ? `desbalance: ${desbalance.map(([c, n]) => `${c}=${n}`).join(", ") || "ninguno"} · huérfanas: ${huerfanas.map((a) => a.id).join(", ") || "ninguna"}`
      : "24 repartidas de seis en seis",
    resultado: roto ? "FALLA" : "PASA",
  });
}

console.table(filas);
console.log(fallos === 0
  ? `\nTodos los ids son únicos dentro de su actividad (${filas.length} chequeos).`
  : `\n${fallos} FALLAN.`);
if (fallos > 0) process.exit(1);
