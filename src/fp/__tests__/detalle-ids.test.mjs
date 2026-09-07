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
import { RONDAS_GANADORES } from "../../data/juegosPolitica2.js";

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

console.table(filas);
console.log(fallos === 0
  ? `\nTodos los ids son únicos dentro de su actividad (${filas.length} chequeos).`
  : `\n${fallos} FALLAN.`);
if (fallos > 0) process.exit(1);
