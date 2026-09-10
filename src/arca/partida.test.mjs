/*
 * La partida en curso del Arca: lo que se guarda, lo que se retoma y cómo se
 * numera lo que se registra.
 *
 * Lo que de verdad protege al diagnóstico —un ítem por fila, la partida cerrada
 * al registrar— lo garantiza el servidor y lo prueba partida_en_curso_test.sql.
 * Esto prueba la mitad del cliente: que no guarda lo que no está sellado, que
 * no retoma estados sin sentido y que una etapa reabierta empieza vacía.
 */
import {
  ETAPAS_ARCA,
  VERSION_ESTADO,
  estadoParaGuardar,
  estadoRetomable,
  filasDelDesafio,
  haceCuanto,
} from "./partida.js";

let fallos = 0;
const filas = [];
const check = (caso, esperado, obtenido) => {
  const pasa = JSON.stringify(esperado) === JSON.stringify(obtenido);
  if (!pasa) fallos++;
  filas.push({ caso, esperado: JSON.stringify(esperado), obtenido: JSON.stringify(obtenido), resultado: pasa ? "PASA" : "FALLA" });
};

/* ───────────── lo que se guarda ───────────── */
{
  const e = estadoParaGuardar({
    resultados: [80, 40, null, NaN],
    detallePorEtapa: [[{ item: "e1", ok: true }], [{ item: "estructura", ok: false }], null, "basura"],
    jugadoMs: 300000.7,
  });
  check("guarda la versión y cuatro posiciones", [VERSION_ESTADO, 4, 4], [e.version, e.resultados.length, e.detalle.length]);
  check("lo no sellado —y lo que no es número— va como null", [80, 40, null, null], e.resultados);
  check("el detalle que no es lista va como null", [true, true, false, false], e.detalle.map(Array.isArray));
  check("el tiempo jugado se redondea y nunca es negativo", [300001, 0],
    [e.jugadoMs, estadoParaGuardar({ resultados: [], detallePorEtapa: [], jugadoMs: -5 }).jugadoMs]);
}

/* ───────────── lo que se retoma ───────────── */
{
  const guardado = {
    version: 1,
    resultados: [80, 40, null, null],
    detalle: [[{ item: "e1", ok: true }], [{ item: "estructura", ok: false }], [{ item: "par:a-c", ok: false }], null],
    jugadoMs: 300000,
  };
  const r = estadoRetomable(guardado);
  check("dos etapas selladas: se retoma en la tercera", 2, r.siguiente);
  check("las selladas vuelven intactas, con la falla de la 2 incluida", [80, 40, null, null], r.resultados);
  /*
   * EL QUE MÁS IMPORTA DEL CLIENTE. Si el estado trae detalle para la etapa 3
   * —porque alguien lo guardó a medias, o por un error—, al retomar esa
   * posición tiene que empezar VACÍA. Si no, rehacer la 3 añadiría sus ítems a
   * los viejos.
   */
  check("RETOMAR · la etapa reabierta empieza vacía aunque el estado trajera detalle", null, r.detalle[2]);
  check("el tiempo jugado se conserva para seguir sumando", 300000, r.jugadoMs);

  check("cuatro selladas: se retoma en el balance, que es donde se registra", 4,
    estadoRetomable({ ...guardado, resultados: [80, 40, 70, 90] }).siguiente);
}

/* Estados que no se ofrecen para continuar. */
check("sin nada sellado no hay partida que retomar", null, estadoRetomable({ version: 1, resultados: [null, null, null, null] }));
check("etapas selladas con hueco: no es una partida posible", null, estadoRetomable({ version: 1, resultados: [80, null, 70, null] }));
check("un porcentaje fuera de rango: no", null, estadoRetomable({ version: 1, resultados: [140, null, null, null] }));
check("otra versión del estado: no", null, estadoRetomable({ version: 2, resultados: [80, null, null, null] }));
check("tres resultados en vez de cuatro: no", null, estadoRetomable({ version: 1, resultados: [80, 40, null] }));
check("nada, o algo que no es un objeto: no", [null, null, null],
  [estadoRetomable(null), estadoRetomable("partida"), estadoRetomable([1, 2])]);

/* ───────────── lo que se registra ───────────── */
{
  const detalle = [
    [{ item: "e1", ok: true }, { item: "e2", ok: false }],
    [{ item: "estructura", ok: true }],
    [{ item: "par:a-c", ok: true }],
    [{ item: "momento", ok: true }],
  ];
  const f = filasDelDesafio(detalle);
  check("cada ítem lleva el prefijo de su etapa", ["et1:e1", "et1:e2", "et2:estructura", "et3:par:a-c", "et4:momento"], f.map((x) => x.item));
  check("el orden corre seguido sobre las cuatro etapas", [1, 2, 3, 4, 5], f.map((x) => x.orden));

  /* Rehacer la etapa 3 reemplaza su posición: su ítem sale una vez, el último. */
  const rehecho = [...detalle];
  rehecho[2] = [{ item: "par:a-c", ok: false }];
  rehecho[2] = [{ item: "par:a-c", ok: true }];
  const g = filasDelDesafio(rehecho);
  check("RETOMAR · una etapa rehecha aporta sus ítems una sola vez", 1, g.filter((x) => x.item === "et3:par:a-c").length);
  check("ningún ítem se repite en toda la partida", g.length, new Set(g.map((x) => x.item)).size);
}

/* ───────────── cuándo se guardó ───────────── */
check("hace menos de un minuto", "hace un momento", haceCuanto(30_000));
check("minutos", ["hace 1 minuto", "hace 12 minutos"], [haceCuanto(60_000), haceCuanto(12 * 60_000)]);
check("horas", ["hace 1 hora", "hace 3 horas"], [haceCuanto(60 * 60_000), haceCuanto(3 * 60 * 60_000)]);
check("días: continuar algo de hace tres días no puede sorprender", "hace 3 días", haceCuanto(3 * 24 * 60 * 60_000));
check("un valor raro no rompe el texto", "hace un momento", haceCuanto(NaN));

check("son cuatro etapas", 4, ETAPAS_ARCA);

console.table(filas);
console.log(fallos === 0 ? `\nLa partida del Arca cuadra en los ${filas.length} casos.` : `\n${fallos} FALLAN.`);
if (fallos > 0) process.exit(1);
