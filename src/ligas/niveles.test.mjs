/*
 * Los nombres de nivel y el mensaje semanal.
 *
 * ═══════════ POR QUÉ ESTA PRUEBA LEE UNA MIGRACIÓN ═══════════
 *
 * Los umbrales 20 y 60 y el techo de cuatro viven en dos sitios que no se
 * pueden compartir: la función SQL `ligas_para()` del servidor reparte de
 * verdad, y `nivelesPara()` en JavaScript decide qué nombre y qué mensaje
 * enseñar. SQL no importa JavaScript, así que la duplicación es forzosa.
 *
 * Lo que no es forzoso es que se separen en silencio. Esta prueba ABRE la
 * migración y compara los números: el día que alguien mueva el 20 en un lado y
 * no en el otro, sale rojo aquí y no un lunes en producción.
 *
 * ═══════════ Y LEE LA ÚLTIMA MIGRACIÓN, NO LA 0006 ═══════════
 *
 * `ligas_para` se redefinió en la 0026 para ponerle el techo. Una prueba que
 * leyera la 0006 a fuego seguiría comparando contra la versión vieja aunque
 * alguien moviera el 20 en una migración nueva. Busca el ÚLTIMO archivo que
 * define la función, que es el que manda en una base aplicada en orden.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  UMBRALES_NIVEL,
  MAX_NIVELES,
  NOMBRES_NIVEL,
  RIQUEZA_NIVEL,
  TRANSICION,
  TIPO_MENSAJE,
  TEXTO_BASE,
  TEXTO_ELITE,
  nivelesPara,
  nombreDeNivel,
  posicionDesdeAbajo,
  textoReparto,
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

/* La última migración, en orden de aplicación, que contiene `aguja`. */
const DIR_MIGRACIONES = fileURLToPath(new URL("../../supabase/migrations/", import.meta.url));
const ultimaQueContiene = (aguja) =>
  readdirSync(DIR_MIGRACIONES)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .filter((f) => readFileSync(DIR_MIGRACIONES + f, "utf8").includes(aguja))
    .pop() ?? null;

/* ───────────── 1. Umbrales y techo, contra la migración que manda ───────────── */
{
  const DEFINE = "create or replace function public.ligas_para(";
  const archivo = ultimaQueContiene(DEFINE);
  check("hay una migración que define ligas_para", true, archivo !== null);

  const sql = archivo ? readFileSync(DIR_MIGRACIONES + archivo, "utf8") : "";

  /*
   * El cuerpo de ligas_para(), no el archivo entero: buscar "20" suelto daría
   * positivos de cualquier comentario o de otra función.
   */
  const cuerpo = sql.slice(sql.indexOf(DEFINE));
  const corte = cuerpo.slice(0, cuerpo.indexOf("$$;"));

  const menoresQue = [...corte.matchAll(/n\s*<\s*(\d+)/g)].map((m) => Number(m[1]));
  check("los cortes de ligas_para son 20 y 60", [20, 60], menoresQue);
  check(
    "y son los mismos que usa el cliente",
    [UMBRALES_NIVEL.unoHasta, UMBRALES_NIVEL.tresHasta],
    menoresQue,
  );

  const techoServidor = Number((corte.match(/else\s+(\d+)/) ?? [])[1]);
  check("el techo de ligas_para es MAX_NIVELES", MAX_NIVELES, techoServidor);

  /* El check de liga_ciclo lleva el techo escrito otra vez: tercer sitio. */
  const conTabla = ultimaQueContiene("create table if not exists public.liga_ciclo");
  const sqlTabla = conTabla ? readFileSync(DIR_MIGRACIONES + conTabla, "utf8") : "";
  const techoTabla = Number((sqlTabla.match(/niveles\s+integer\s+not null\s+check\s*\(\s*niveles\s+between\s+1\s+and\s+(\d+)/) ?? [])[1]);
  check("y el check de liga_ciclo también", MAX_NIVELES, techoTabla);
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
/*
 * Lo que hace posible abrir Élite sin renombrar a nadie: Intermedio es la 2 de
 * tres y la 3 de cuatro, y se llama igual en los dos.
 */
check(
  "abrir Élite no le cambia el nombre a Intermedio ni a Emergente",
  ["Intermedio", "Intermedio", "Emergente", "Emergente"],
  [nombreDeNivel(2, 3), nombreDeNivel(3, 4), nombreDeNivel(3, 3), nombreDeNivel(4, 4)],
);
check(
  "una liga fuera de rango no tiene nombre",
  [null, null, null],
  [nombreDeNivel(5, 4), nombreDeNivel(0, 3), nombreDeNivel(2, null)],
);

/* ───────────── 4. Un solo nivel: NO hay nombre ───────────── */
check("con un nivel no hay nombre", [null, null], [nombreDeNivel(1, 1), nombreDeNivel(1, 0)]);
{
  const m = mensajeSemanal({ liga: 1, totalNiveles: 1 });
  check("con un nivel el título es el genérico", "Tu grupo esta semana", m.titulo);
  check("con un nivel no hay sobretítulo ni insignia", [null, null], [m.rotulo, m.nombre]);
  check("y aun así hay mensaje", true, typeof m.base === "string" && m.base.length > 0);
  /* Aunque el servidor dijera "reparto": sin niveles no hay texto de reparto. */
  check(
    "un reparto con un solo nivel no enseña el texto del reparto",
    TIPO_MENSAJE.SIN_NIVELES,
    mensajeSemanal({ liga: 1, totalNiveles: 1, transicion: "reparto", activosReparto: 20 }).tipo,
  );
}

/* ───────────── 5. "Base" no se reutiliza, y es la decisión ───────────── */
check("el kit de medallas sí tiene Base", "Base", ETIQUETA_NIVEL.base);
check("las ligas no la usan nunca", false, NOMBRES_NIVEL.includes("Base"));
check("el nivel más bajo de liga es Emergente", "Emergente", NOMBRES_NIVEL[0]);
check(
  "los tres de arriba sí coinciden con el kit",
  ["Intermedio", "Avanzado", "Élite"],
  [ETIQUETA_NIVEL.intermedio, ETIQUETA_NIVEL.avanzado, ETIQUETA_NIVEL.elite],
);

/* ───────────── 6. La insignia puede dibujar los cuatro ───────────── */
check("cada nombre tiene riqueza visual asignada", [], NOMBRES_NIVEL.filter((n) => !RIQUEZA_NIVEL[n]));
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

/* ───────────── 7. El techo, también en la prueba SQL ───────────── */
{
  const sql = readFileSync(
    fileURLToPath(new URL("../../supabase/tests/ligas_test.sql", import.meta.url)),
    "utf8",
  );
  check("ligas_test.sql exige 4 niveles para 100 personas", true, /ligas_para\(100\)\s*=\s*4\b/.test(sql));
  check("y ya no afirma un quinto nivel en ninguna parte", false, /ligas_para\(\d+\)\s*=\s*5\b/.test(sql));
  check("el cliente, lo mismo", 4, nivelesPara(100));
}

/* ───────────── 8. El cuarto caso: el reparto ───────────── */
{
  const r = mensajeSemanal({ liga: 3, totalNiveles: 3, ligaAnterior: 1, nivelesAnterior: 1, transicion: "reparto", activosReparto: 23 });
  check("el reparto es su propio tipo de mensaje", TIPO_MENSAJE.REPARTO, r.tipo);
  check("nombra el nivel en el corchete", true, r.base.includes("quedaste en Emergente según tu ciclo más reciente"));
  check(
    "[N] sale del dato y aparece dos veces con el mismo valor",
    [true, true, 2],
    [r.base.includes("Ya son 23 estudiantes activos"), r.base.includes("no entre 23 personas a la vez"), r.base.split("23").length - 1],
  );

  /*
   * EL CAMBIO AL TEXTO DE XENO. Él escribió "Ya son 20". Con otro N el
   * mensaje tiene que decir otro número, y ningún 20 puede quedar escrito.
   */
  const conOtro = textoReparto({ activos: 37, nombre: "Intermedio" });
  check("con 37 activos dice 37, y ningún 20", [true, false], [conOtro.includes("Ya son 37"), conOtro.includes("20")]);
  /*
   * Sobre el CÓDIGO de la plantilla, no sobre el archivo: el comentario que
   * explica el cambio cita el "20" de Xeno a propósito, y buscar en el archivo
   * entero confundía la cita con el texto. Y más estricto que buscar "20": la
   * plantilla no puede tener NINGÚN dígito escrito a mano.
   */
  check("la plantilla del reparto no tiene ningún número escrito a mano", false, /\d/.test(textoReparto.toString()));

  /* El mismo texto para todos: lo único que cambia es el corchete. */
  const abajo = textoReparto({ activos: 23, nombre: "Emergente" });
  const arriba = textoReparto({ activos: 23, nombre: "Avanzado" });
  check(
    "Emergente y Avanzado leen el mismo texto salvo el nivel",
    abajo.replace("Emergente", "[nivel]"),
    arriba.replace("Avanzado", "[nivel]"),
  );

  /* Sin conteo válido no se inventa un número: mensaje normal. */
  const sinN = mensajeSemanal({ liga: 2, totalNiveles: 3, transicion: "reparto", activosReparto: null });
  check("un reparto sin N cae al mensaje normal, sin número", [TIPO_MENSAJE.NORMAL, TEXTO_BASE], [sinN.tipo, sinN.base]);
  check(
    "ni con N raros",
    [TIPO_MENSAJE.NORMAL, TIPO_MENSAJE.NORMAL, TIPO_MENSAJE.NORMAL],
    [0, -4, 2.5].map((n) => mensajeSemanal({ liga: 2, totalNiveles: 3, transicion: "reparto", activosReparto: n }).tipo),
  );

  /* La primera siembra de una materia grande reparte directo a cuatro. */
  const cuatro = mensajeSemanal({ liga: 1, totalNiveles: 4, transicion: "reparto", activosReparto: 64 });
  check("un reparto a cuatro niveles también funciona, con Élite", true, cuatro.base.includes("quedaste en Élite"));
  check("y en el reparto nadie ve la capa de ascenso", null, r.ascenso);
}

/* ───────────── 9. La apertura de Élite: solo Avanzado ───────────── */
{
  const subio = mensajeSemanal({ liga: 1, totalNiveles: 4, ligaAnterior: 1, nivelesAnterior: 3, transicion: "elite" });
  const quedo = mensajeSemanal({ liga: 2, totalNiveles: 4, ligaAnterior: 1, nivelesAnterior: 3, transicion: "elite" });
  check("quien pasa a Élite lee el texto de Élite", [TIPO_MENSAJE.ELITE, TEXTO_ELITE], [subio.tipo, subio.base]);
  check("quien sigue en Avanzado lee el mismo texto", [TIPO_MENSAJE.ELITE, TEXTO_ELITE], [quedo.tipo, quedo.base]);
  check("sus niveles se llaman Élite y Avanzado", ["Élite", "Avanzado"], [subio.titulo, quedo.titulo]);
  check("y ninguno lleva capa de ascenso: el texto ya lo dice", [null, null], [subio.ascenso, quedo.ascenso]);

  /*
   * Intermedio y Emergente, la misma semana: sin fila de transición, cambian
   * de número (2→3, 3→4) pero no de nombre. Comparando números parecería que
   * bajaron; comparando desde abajo, siguen igual. Semana normal, sin capa.
   */
  const inter = mensajeSemanal({ liga: 3, totalNiveles: 4, ligaAnterior: 2, nivelesAnterior: 3 });
  const emerg = mensajeSemanal({ liga: 4, totalNiveles: 4, ligaAnterior: 3, nivelesAnterior: 3 });
  check(
    "Intermedio y Emergente no se enteran: semana normal, mismo nombre, sin capa",
    [TIPO_MENSAJE.NORMAL, "Intermedio", null, TIPO_MENSAJE.NORMAL, "Emergente", null],
    [inter.tipo, inter.titulo, inter.ascenso, emerg.tipo, emerg.titulo, emerg.ascenso],
  );
  check("TEXTO_ELITE no se le muestra a nadie sin transición elite", false, [inter.base, emerg.base].includes(TEXTO_ELITE));
}

/* ───────────── 10. Subir se mide desde abajo, no por número ───────────── */
{
  check("posición desde abajo: Emergente es 0, Élite es 3", [0, 3, 1, 1], [
    posicionDesdeAbajo(4, 4),
    posicionDesdeAbajo(1, 4),
    posicionDesdeAbajo(2, 3),
    posicionDesdeAbajo(3, 4),
  ]);

  /* La semana siguiente a la apertura: todo en cuatro niveles. */
  check(
    "de Avanzado a Élite, la semana después",
    "Subiste a Élite esta semana.",
    mensajeSemanal({ liga: 1, totalNiveles: 4, ligaAnterior: 2, nivelesAnterior: 4 }).ascenso,
  );
  check(
    "de Intermedio a Avanzado",
    "Subiste a Avanzado esta semana.",
    mensajeSemanal({ liga: 2, totalNiveles: 4, ligaAnterior: 3, nivelesAnterior: 4 }).ascenso,
  );

  /*
   * No alcanzable hoy —la renumeración solo pasa la semana de Élite, que no
   * tiene movimiento—, pero fija que la comparación es por nombre: Emergente
   * de tres (liga 3) a Intermedio de cuatro (liga 3) es subir aunque el
   * número no cambie; Avanzado de cuatro (liga 2) a Avanzado de tres (liga 1)
   * no lo es aunque el número baje.
   */
  check(
    "mismo número, nombre más alto: subió",
    "Subiste a Intermedio esta semana.",
    mensajeSemanal({ liga: 3, totalNiveles: 4, ligaAnterior: 3, nivelesAnterior: 3 }).ascenso,
  );
  check(
    "número más bajo, mismo nombre: no subió",
    null,
    mensajeSemanal({ liga: 1, totalNiveles: 3, ligaAnterior: 2, nivelesAnterior: 4 }).ascenso,
  );

  /* Un servidor todavía en la 0025 no manda niveles_anterior: se compara como antes. */
  check(
    "sin niveles_anterior se supone el mismo número de niveles",
    ["Subiste a Avanzado esta semana.", null],
    [
      mensajeSemanal({ liga: 1, totalNiveles: 3, ligaAnterior: 2 }).ascenso,
      mensajeSemanal({ liga: 3, totalNiveles: 3, ligaAnterior: 2 }).ascenso,
    ],
  );
}

/* ───────────── 11. Nunca silencio, nunca direccional ───────────── */
{
  /*
   * Se recorren TODAS las combinaciones —incluidas las que hoy no pueden
   * pasar— y se exige que ninguna se quede sin mensaje base, que ninguna en la
   * que se baja lleve capa extra, y que la capa de ascenso no aparezca nunca
   * en una semana de transición.
   */
  const sinBase = [];
  const conCapaBajando = [];
  const capaEnTransicion = [];

  for (const totalNiveles of [1, 3, 4]) {
    for (const liga of [1, 2, 3, 4]) {
      if (liga > totalNiveles) continue;
      for (const nivelesAnterior of [null, 1, 3, 4]) {
        for (const ligaAnterior of [null, 1, 2, 3, 4]) {
          for (const transicion of [null, TRANSICION.REPARTO, TRANSICION.ELITE]) {
            for (const activosReparto of [null, 23]) {
              const m = mensajeSemanal({ liga, totalNiveles, ligaAnterior, nivelesAnterior, transicion, activosReparto });
              const e = `n${totalNiveles} l${liga} na${nivelesAnterior} a${ligaAnterior} t${transicion} N${activosReparto}`;

              if (typeof m.base !== "string" || m.base.length === 0) sinBase.push(e);

              const ahora = posicionDesdeAbajo(liga, totalNiveles);
              const antes = posicionDesdeAbajo(ligaAnterior, nivelesAnterior ?? totalNiveles);
              if (ahora !== null && antes !== null && ahora < antes && m.ascenso) conCapaBajando.push(e);
              if ((m.tipo === TIPO_MENSAJE.REPARTO || m.tipo === TIPO_MENSAJE.ELITE) && m.ascenso) capaEnTransicion.push(e);
            }
          }
        }
      }
    }
  }

  check("ninguna combinación se queda sin mensaje base", [], sinBase);
  check("ninguna combinación en la que se baja lleva capa extra", [], conCapaBajando);
  check("ninguna semana de transición lleva capa de ascenso", [], capaEnTransicion);
}

/* Las tres semanas normales que deciden la capa. */
{
  const sube = mensajeSemanal({ liga: 1, totalNiveles: 3, ligaAnterior: 2, nivelesAnterior: 3 });
  const baja = mensajeSemanal({ liga: 3, totalNiveles: 3, ligaAnterior: 2, nivelesAnterior: 3 });
  const igual = mensajeSemanal({ liga: 2, totalNiveles: 3, ligaAnterior: 2, nivelesAnterior: 3 });

  check("subir añade la capa y nombra el nivel nuevo", "Subiste a Avanzado esta semana.", sube.ascenso);
  check("bajar no añade nada", null, baja.ascenso);
  check("quedarse igual tampoco", null, igual.ascenso);
  check("los tres reciben exactamente el mismo mensaje base", true, baja.base === sube.base && igual.base === sube.base);
  check("recién llegado: sin capa", null, mensajeSemanal({ liga: 2, totalNiveles: 3, ligaAnterior: null }).ascenso);
}

console.table(filas);
console.log(
  fallos === 0
    ? `\nLos niveles y los mensajes cuadran en los ${filas.length} casos.`
    : `\n${fallos} FALLAN.`,
);
if (fallos > 0) process.exit(1);
