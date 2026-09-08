/*
 * Los nombres de nivel y el mensaje semanal.
 *
 * ═══════════ POR QUÉ ESTA PRUEBA LEE UNA MIGRACIÓN ═══════════
 *
 * Los umbrales 20 y 60 viven en dos sitios que no se pueden compartir: la
 * función SQL `ligas_para()` de la 0006 reparte de verdad, y `nivelesPara()` en
 * JavaScript decide qué nombre y qué mensaje enseñar. SQL no importa
 * JavaScript, así que la duplicación es forzosa.
 *
 * Lo que no es forzoso es que se separen en silencio. Esta prueba ABRE el
 * archivo de la migración y compara los números: el día que alguien mueva el 20
 * en un lado y no en el otro, sale rojo aquí y no un lunes en producción con
 * gente repartida en tres niveles y la interfaz llamándolos de dos maneras. Es
 * la misma disciplina que bandas.js con la 0021.
 *
 * ═══════════ Y DOCUMENTA UNA DIVERGENCIA QUE HOY EXISTE ═══════════
 *
 * El techo de cuatro niveles está en JavaScript y NO en el servidor: la 0006
 * puede devolver 5 para 100 activos. Con la adopción de hoy —un solo nivel— no
 * cambia nada, pero es una diferencia real y el chequeo 7 la fija por escrito.
 * Cuando el servidor tenga su techo, ese chequeo falla, y fallar es lo correcto:
 * obliga a venir aquí y borrar la nota en vez de dejarla mintiendo.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  UMBRALES_NIVEL,
  MAX_NIVELES,
  NOMBRES_NIVEL,
  RIQUEZA_NIVEL,
  FASE,
  nivelesPara,
  nombreDeNivel,
  faseDe,
  mensajeSemanal,
} from "./niveles.js";
import { LADOS, ETIQUETA_NIVEL } from "../components/shared/Medalla.jsx";

let fallos = 0;
const filas = [];

const check = (caso, esperado, obtenido) => {
  const pasa = JSON.stringify(esperado) === JSON.stringify(obtenido);
  if (!pasa) fallos++;
  filas.push({
    caso,
    esperado: JSON.stringify(esperado),
    obtenido: JSON.stringify(obtenido),
    resultado: pasa ? "PASA" : "FALLA",
  });
};

/* ───────────── 1. Los umbrales, contra la migración que reparte ───────────── */
{
  const sql = readFileSync(
    fileURLToPath(new URL("../../supabase/migrations/0006_ligas.sql", import.meta.url)),
    "utf8",
  );

  /*
   * El cuerpo de ligas_para(), no el archivo entero: buscar "20" suelto daría
   * positivos de cualquier comentario o de otra función.
   */
  const cuerpo = sql.slice(sql.indexOf("function public.ligas_para"));
  const corte = cuerpo.slice(0, cuerpo.indexOf("$$;"));

  const menoresQue = [...corte.matchAll(/n\s*<\s*(\d+)/g)].map((m) => Number(m[1]));
  check("los cortes de ligas_para son los de UMBRALES_NIVEL", [20, 60], menoresQue);
  check(
    "y son los mismos que usa el cliente",
    [UMBRALES_NIVEL.unoHasta, UMBRALES_NIVEL.tresHasta],
    menoresQue,
  );

  const porNivel = Number((corte.match(/n::numeric\s*\/\s*(\d+)/) ?? [])[1]);
  check("el tamaño por nivel también coincide", UMBRALES_NIVEL.porNivel, porNivel);
}

/* ───────────── 2. Cuántos niveles, y el techo ───────────── */
check("por debajo de 20 hay un solo nivel", [1, 1, 1], [nivelesPara(1), nivelesPara(5), nivelesPara(19)]);
check("de 20 a 59 hay tres", [3, 3], [nivelesPara(20), nivelesPara(59)]);
check("desde 60 hay cuatro", [4, 4], [nivelesPara(60), nivelesPara(79)]);
check(
  "y nunca un quinto, por muchos que sean",
  [4, 4, 4],
  [nivelesPara(100), nivelesPara(400), nivelesPara(10000)],
);
check("cuatro es el techo declarado", 4, MAX_NIVELES);
check("hay exactamente cuatro nombres", 4, NOMBRES_NIVEL.length);

/* Basura de entrada: un nivel, nunca una excepción ni un NaN. */
check(
  "entradas imposibles caen en un solo nivel",
  [1, 1, 1, 1],
  [nivelesPara(0), nivelesPara(-3), nivelesPara(null), nivelesPara("hola")],
);

/* ───────────── 3. El reparto de nombres es de abajo arriba ───────────── */
check("con dos niveles: 2 es Emergente y 1 es Intermedio", ["Emergente", "Intermedio"], [
  nombreDeNivel(2, 2),
  nombreDeNivel(1, 2),
]);
check("con tres: Emergente, Intermedio, Avanzado", ["Emergente", "Intermedio", "Avanzado"], [
  nombreDeNivel(3, 3),
  nombreDeNivel(2, 3),
  nombreDeNivel(1, 3),
]);
check("con cuatro aparece Élite arriba, y solo entonces", ["Emergente", "Intermedio", "Avanzado", "Élite"], [
  nombreDeNivel(4, 4),
  nombreDeNivel(3, 4),
  nombreDeNivel(2, 4),
  nombreDeNivel(1, 4),
]);
check("Élite no existe mientras haya tres niveles", true, !NOMBRES_NIVEL.slice(0, 3).includes("Élite"));

/*
 * El que de verdad importa del reparto de abajo arriba: quien está en la liga
 * de más abajo se llama igual tenga el grupo tres niveles o cuatro. Repartiendo
 * desde arriba, el mismo estudiante cambiaría de nombre sin haber hecho nada,
 * solo porque llegaron compañeros nuevos.
 */
check(
  "el de más abajo es Emergente con tres niveles y con cuatro",
  ["Emergente", "Emergente"],
  [nombreDeNivel(3, 3), nombreDeNivel(4, 4)],
);

/* Fuera de rango: null, no un nombre inventado. */
check(
  "una liga fuera de rango no tiene nombre",
  [null, null, null],
  [nombreDeNivel(5, 4), nombreDeNivel(0, 3), nombreDeNivel(2, null)],
);

/* ───────────── 4. Un solo nivel: NO hay nombre ───────────── */
check("con un nivel no hay nombre", [null, null], [nombreDeNivel(1, 1), nombreDeNivel(1, 0)]);
{
  const m = mensajeSemanal({ liga: 1, totalNiveles: 1, ciclosConNiveles: 0 });
  check("con un nivel el título es el genérico", "Tu grupo esta semana", m.titulo);
  check("con un nivel no hay sobretítulo ni insignia", [null, null], [m.rotulo, m.nombre]);
  check("y aun así hay mensaje", true, typeof m.base === "string" && m.base.length > 0);
}

/* ───────────── 5. "Base" no se reutiliza, y es la decisión ───────────── */
check("el kit de medallas sí tiene Base", "Base", ETIQUETA_NIVEL.base);
check("las ligas no la usan nunca", false, NOMBRES_NIVEL.includes("Base"));
check("el nivel más bajo de liga es Emergente", "Emergente", NOMBRES_NIVEL[0]);
/* Los otros tres sí comparten palabra con el kit, y eso es intencional. */
check(
  "los tres de arriba sí coinciden con el kit",
  ["Intermedio", "Avanzado", "Élite"],
  [ETIQUETA_NIVEL.intermedio, ETIQUETA_NIVEL.avanzado, ETIQUETA_NIVEL.elite],
);

/* ───────────── 6. La insignia puede dibujar los cuatro ───────────── */
check(
  "cada nombre tiene riqueza visual asignada",
  [],
  NOMBRES_NIVEL.filter((n) => !RIQUEZA_NIVEL[n]),
);
check(
  "y esa riqueza existe en el marco de las medallas",
  [],
  NOMBRES_NIVEL.filter((n) => LADOS[RIQUEZA_NIVEL[n]] === undefined),
);
check(
  "más nivel, más caras",
  true,
  NOMBRES_NIVEL.every((n, i) => i === 0 || LADOS[RIQUEZA_NIVEL[n]] > LADOS[RIQUEZA_NIVEL[NOMBRES_NIVEL[i - 1]]]),
);

/* ───────────── 7. La divergencia con el servidor, por escrito ───────────── */
{
  /*
   * `ligas_para(100)` devuelve 5 en SQL —lo afirma ligas_test.sql— y 4 aquí.
   * Este chequeo fija esa diferencia. Cuando el servidor gane su techo, falla
   * y hay que venir a borrarlo junto con esta nota.
   */
  const sql = readFileSync(
    fileURLToPath(new URL("../../supabase/tests/ligas_test.sql", import.meta.url)),
    "utf8",
  );
  check(
    "el servidor sigue sin techo (su prueba afirma 100 → 5 niveles)",
    true,
    /ligas_para\(100\)\s*=\s*5/.test(sql),
  );
  check("y el cliente sí lo tiene", 4, nivelesPara(100));
}

/* ───────────── 8. Las fases se deducen del dato, sin bandera ───────────── */
check("un nivel es la fase sin niveles", FASE.SIN_NIVELES, faseDe({ totalNiveles: 1, ciclosConNiveles: 0 }));
check("cero niveles también", FASE.SIN_NIVELES, faseDe({ totalNiveles: 0, ciclosConNiveles: 0 }));
check("el primer ciclo con varios es el estreno", FASE.ESTRENO, faseDe({ totalNiveles: 3, ciclosConNiveles: 1 }));
check("el segundo es el primer cierre", FASE.PRIMER_CIERRE, faseDe({ totalNiveles: 3, ciclosConNiveles: 2 }));
check("del tercero en adelante, normal", [FASE.NORMAL, FASE.NORMAL], [
  faseDe({ totalNiveles: 3, ciclosConNiveles: 3 }),
  faseDe({ totalNiveles: 4, ciclosConNiveles: 40 }),
]);

/* ───────────── 9. Nunca silencio, nunca direccional ───────────── */
{
  /*
   * El chequeo de fondo de toda la tarea: se recorren TODAS las combinaciones
   * de nivel, fase y movimiento —incluidas las que hoy no pueden pasar— y se
   * exige que ninguna se quede sin mensaje base. Un caso sin cubrir no daría
   * error: dejaría un hueco donde debía ir una frase.
   */
  const sinBase = [];
  const conCapaBajando = [];
  const sinPosicionable = [];

  for (const totalNiveles of [1, 2, 3, 4]) {
    for (const liga of [1, 2, 3, 4]) {
      if (liga > totalNiveles) continue;
      for (const ciclosConNiveles of [0, 1, 2, 3, 9]) {
        for (const ligaAnterior of [null, 1, 2, 3, 4]) {
          const m = mensajeSemanal({ liga, totalNiveles, ciclosConNiveles, ligaAnterior });
          const etiqueta = `n${totalNiveles} l${liga} c${ciclosConNiveles} a${ligaAnterior}`;

          if (typeof m.base !== "string" || m.base.length === 0) sinBase.push(etiqueta);
          /* Bajar es que el número de liga suba: 1 es la de arriba. */
          if (ligaAnterior !== null && liga > ligaAnterior && m.ascenso) conCapaBajando.push(etiqueta);
          if (typeof m.titulo !== "string" || m.titulo.length === 0) sinPosicionable.push(etiqueta);
        }
      }
    }
  }

  check("ninguna combinación se queda sin mensaje base", [], sinBase);
  check("ninguna combinación en la que se baja lleva capa extra", [], conCapaBajando);
  check("ninguna combinación se queda sin título", [], sinPosicionable);
}

/* La capa de ascenso, en los tres casos que la deciden. */
{
  const sube = mensajeSemanal({ liga: 1, totalNiveles: 3, ciclosConNiveles: 5, ligaAnterior: 2 });
  const baja = mensajeSemanal({ liga: 3, totalNiveles: 3, ciclosConNiveles: 5, ligaAnterior: 2 });
  const igual = mensajeSemanal({ liga: 2, totalNiveles: 3, ciclosConNiveles: 5, ligaAnterior: 2 });

  check("subir añade la capa y nombra el nivel nuevo", "Subiste a Avanzado esta semana.", sube.ascenso);
  check("bajar no añade nada", null, baja.ascenso);
  check("quedarse igual tampoco", null, igual.ascenso);
  check(
    "los tres reciben exactamente el mismo mensaje base",
    true,
    baja.base === sube.base && igual.base === sube.base,
  );
  check("y los tres llevan el nombre de su nivel", ["Avanzado", "Emergente", "Intermedio"], [
    sube.titulo,
    baja.titulo,
    igual.titulo,
  ]);
}

/* Sin nivel anterior —quien acaba de entrar— no hay ascenso que anunciar. */
check(
  "recién llegado: sin capa",
  null,
  mensajeSemanal({ liga: 2, totalNiveles: 3, ciclosConNiveles: 5, ligaAnterior: null }).ascenso,
);

/* ───────────── 10. El estreno y el día ocho hablan distinto ───────────── */
{
  const estreno = mensajeSemanal({ liga: 2, totalNiveles: 3, ciclosConNiveles: 1 });
  const diaOcho = mensajeSemanal({ liga: 3, totalNiveles: 3, ciclosConNiveles: 2 });
  const normal = mensajeSemanal({ liga: 3, totalNiveles: 3, ciclosConNiveles: 3 });

  check("los tres textos son distintos entre sí", 3, new Set([estreno.base, diaOcho.base, normal.base]).size);

  /*
   * El día ocho es el único ciclo en que aparece "Emergente" por primera vez, y
   * su mensaje va para TODOS, no solo para quien bajó: si dependiera del
   * movimiento, la frase misma señalaría al último de la lista.
   */
  const arriba = mensajeSemanal({ liga: 1, totalNiveles: 3, ciclosConNiveles: 2, ligaAnterior: 2 });
  const abajo = mensajeSemanal({ liga: 3, totalNiveles: 3, ciclosConNiveles: 2, ligaAnterior: 2 });
  check("el día ocho todos leen el mismo texto", true, arriba.base === abajo.base);
  check("y ese día nadie lleva capa de ascenso", [null, null], [arriba.ascenso, abajo.ascenso]);
}

console.table(filas);
console.log(
  fallos === 0
    ? `\nLos niveles y los mensajes cuadran en los ${filas.length} casos.`
    : `\n${fallos} FALLAN.`,
);
if (fallos > 0) process.exit(1);
