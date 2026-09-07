/*
 * Que las reglas de alerta se disparen cuando deben — y no cuando no.
 *
 * POR QUÉ EXISTE. Dos de las tres reglas llevaban desde el principio sin poder
 * dispararse nunca, y nada fallaba: los umbrales estaban escritos en 0–1
 * (`0.6`) y el dato llega en 0–100, porque fp_history.correct_pct se guarda
 * entre 0 y 100 y panel_estudiantes devuelve la media sin dividir. Comparar
 * 45 con 0,6 da siempre falso, así que el panel nunca marcó a nadie por bajo
 * desempeño y encima pintaba "4500%" donde debía decir "45%".
 *
 * Eso no se ve leyendo el código: se ve metiéndole un estudiante que SÍ debería
 * disparar la regla y comprobando que la dispara. Es lo que hace este archivo.
 *
 * Los umbrales seguirán moviéndose —están puestos para calibrarlos con datos
 * reales— así que las pruebas se escriben en función de UMBRALES y no de
 * números fijos: subir un umbral no debe romperlas, pero cambiar la ESCALA sí.
 */
import { alertasDe, promedioAciertos, avancePorTema, UMBRALES, NIVEL } from "../alertas.js";

let fallos = 0;
const filas = [];

const check = (regla, esperado, obtenido) => {
  const pasa = esperado === obtenido;
  if (!pasa) fallos++;
  filas.push({ regla, esperado, obtenido, resultado: pasa ? "PASA" : "FALLA" });
};

/* Un estudiante base sin nada que alertar: activo, con buen acierto y sin prisa. */
const base = {
  user_id: "u",
  nickname: "zzz",
  dias_inactivo: 0,
  fp_total: 100,
  fp_ciclo: 50,
  n_registros: 10,
  actividades: [],
  pct_evaluativa: 90,
  n_evaluativas: 5,
  pct_exploratoria: 95,
  n_exploratorias: 5,
  duracion_media_ms: 300000,
};

const tiene = (e, titulo) => alertasDe(e).some((a) => a.titulo.includes(titulo));

/* ── La escala, que es la raíz del problema ── */
check("los umbrales de acierto están en 0–100, no en 0–1",
  true, UMBRALES.pctEvaluativaBaja > 1 && UMBRALES.pctBajaParaPrisa > 1);

/* ── 🟡 Practica pero no aplica ── */
{
  /* Justo por debajo del umbral, con práctica exploratoria suficiente. */
  const flojo = {
    ...base,
    pct_evaluativa: UMBRALES.pctEvaluativaBaja - 15,
    n_evaluativas: 4,
    n_exploratorias: UMBRALES.exploratoriasParaPracticar + 1,
  };
  check("se dispara con acierto por debajo del umbral", true, tiene(flojo, "Practica"));

  /* Y el detalle no puede volver a multiplicar por 100. */
  const detalle = alertasDe(flojo).find((a) => a.titulo.includes("Practica"))?.detalle ?? "";
  check("el detalle dice el porcentaje sin inflarlo", true,
    detalle.startsWith(`${Math.round(UMBRALES.pctEvaluativaBaja - 15)}%`));

  /* Por encima del umbral no se dispara. */
  const bueno = { ...flojo, pct_evaluativa: UMBRALES.pctEvaluativaBaja + 15 };
  check("no se dispara con buen acierto", false, tiene(bueno, "Practica"));

  /* Sin práctica exploratoria tampoco: la regla habla de quien SÍ practica. */
  const sinPractica = { ...flojo, n_exploratorias: 0 };
  check("no se dispara sin practica exploratoria", false, tiene(sinPractica, "Practica"));
}

/* ── 🟢 Iba deprisa y fallando ── */
{
  const deprisa = {
    ...base,
    duracion_media_ms: UMBRALES.duracionRapidaMs - 10000,
    pct_evaluativa: UMBRALES.pctBajaParaPrisa - 20,
    pct_exploratoria: UMBRALES.pctBajaParaPrisa - 20,
  };
  check("se dispara con prisa Y poco acierto", true, tiene(deprisa, "rápidas"));

  /* El tiempo NUNCA dispara solo: rápido y acertando es dominio. */
  const rapidoYBueno = { ...deprisa, pct_evaluativa: 95, pct_exploratoria: 95 };
  check("no se dispara si va rapido pero acierta", false, tiene(rapidoYBueno, "rápidas"));

  /* Ni el poco acierto solo. */
  const lentoYFlojo = { ...deprisa, duracion_media_ms: UMBRALES.duracionRapidaMs + 60000 };
  check("no se dispara si falla pero sin prisa", false, tiene(lentoYFlojo, "rápidas"));
}

/* ── 🔴 Inactividad ── */
{
  const perdido = {
    ...base,
    dias_inactivo: UMBRALES.ciclosInactividad * UMBRALES.diasPorCiclo + 3,
    n_registros: UMBRALES.registrosParaSerRegular + 1,
  };
  check("se dispara tras un ciclo entero sin actividad", true, tiene(perdido, "Sin actividad"));
  check("y es de nivel urgente", NIVEL.URGENTE,
    alertasDe(perdido).find((a) => a.titulo.includes("Sin actividad"))?.nivel);

  /* Quien asomó una vez y no volvió no es "abandono": es arranque. */
  const asomo = { ...perdido, n_registros: 1 };
  check("no se dispara con un solo registro previo", false, tiene(asomo, "Sin actividad"));
}

/*
 * ── DOS CASOS EN VALORES ABSOLUTOS ──
 *
 * Los de arriba están escritos en función de UMBRALES para que mover un umbral
 * no los rompa. Pero eso los hace inmunes al cambio de ESCALA, que es justo el
 * fallo que hubo: con el umbral en 0,6 y un caso de "umbral menos 15" sale
 * −14,4, que también es menor que 0,6, así que la regla seguía disparando y la
 * prueba seguía verde. Comprobado revirtiendo el umbral a 0,6: solo caía el
 * chequeo meta.
 *
 * Estos dos van con números fijos y realistas —45% y 40% de acierto— y son los
 * que sí caen si alguien vuelve a poner los umbrales en 0–1.
 */
{
  const flojoReal = {
    ...base,
    pct_evaluativa: 45,
    n_evaluativas: 4,
    n_exploratorias: 3,
  };
  check("un 45% de acierto dispara la ambar (escala 0-100)", true, tiene(flojoReal, "Practica"));

  const deprisaReal = {
    ...base,
    duracion_media_ms: 40000,
    pct_evaluativa: 40,
    pct_exploratoria: 40,
  };
  check("un 40% con 40s de media dispara la verde", true, tiene(deprisaReal, "rápidas"));
}

/* ── El estudiante sano no genera ninguna alerta ── */
check("un estudiante al dia y acertando no genera alertas", 0, alertasDe(base).length);

/* ── promedioAciertos conserva la escala ── */
check("promedioAciertos devuelve 0–100, no 0–1", true,
  promedioAciertos({ pct_evaluativa: 80, n_evaluativas: 1, pct_exploratoria: 60, n_exploratorias: 1 }) === 70);

/*
 * ── EL AVANCE POR TEMA CUENTA LOS DESAFÍOS ──
 *
 * El Arca era invisible aquí: actividadesDeTipo() la excluye —para que no
 * salga como nodo numerado del camino— pero mapaActividadTema sí la contiene,
 * así que tampoco caía en la rama de huérfanas. Ni contada ni mostrada.
 * Resultado en el panel real: "0 de 3 temas iniciados" con cientos de FP.
 *
 * Este caso es el que lo caza, y va con el id literal a propósito: escribirlo
 * en función de desafioDe() lo haría inmune al fallo que vino a vigilar.
 */
{
  const soloArca = avancePorTema("pensamiento-estrategico", ["proyecto-arca"]);
  check("jugar solo el desafio cuenta como tema iniciado", 1,
    soloArca.filter((t) => t.hechas > 0).length);

  /* Y el desafío suma al total del tema: el Iceberg tiene 7 + el Arca. */
  const iceberg = avancePorTema("pensamiento-estrategico", []).find((t) => t.id === "modelo-iceberg");
  check("el total del Iceberg incluye el desafio", 8, iceberg.total);

  /* Sin nada hecho sigue siendo cero: el arreglo no infla el numerador. */
  check("sin actividad, ningun tema iniciado", 0,
    avancePorTema("pensamiento-estrategico", []).filter((t) => t.hechas > 0).length);

  /* Los bonos de racha siguen saliendo como huérfanas, que es lo correcto. */
  const conRacha = avancePorTema("pensamiento-estrategico", ["racha-2"]);
  check("un bono de racha entra como huerfana", true,
    conRacha.some((t) => t.huerfana && t.id === "racha-2"));
}

console.table(filas);
console.log(fallos === 0
  ? `\nLas reglas de alerta se disparan cuando deben (${filas.length} chequeos).`
  : `\n${fallos} FALLAN.`);
if (fallos > 0) process.exit(1);
