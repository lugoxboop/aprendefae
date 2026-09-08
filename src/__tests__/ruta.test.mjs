/*
 * La traducción entre el hash y la vista.
 *
 * POR QUÉ SE PRUEBA ESTO Y NO EL HOOK. `interpretar` y `serializar` son
 * funciones puras y son donde vive todo lo que puede salir mal: una vista que
 * no existe, un hash de OAuth confundido con una ruta, un modo inventado. El
 * hook es cuatro líneas de listeners que necesitan navegador; lo que decide si
 * un estudiante acaba en la portada o en su tema es esta traducción.
 *
 * EL CASO QUE MÁS IMPORTA es el del token de Google. Supabase vuelve del login
 * por redirección con #access_token=… en el hash, que es exactamente donde
 * vive la ruta. Si eso se interpretara como una vista, el sitio pintaría la
 * portada y —peor— reescribir el hash le habría borrado el token a Supabase
 * antes de que lo leyera, rompiendo el inicio de sesión sin ningún error.
 */
import { interpretar, serializar, VISTAS, MODOS, RUTA_INICIAL } from "../ruta.js";
import { SUBJECTS } from "../data/subjects.js";

let fallos = 0;
const filas = [];

const check = (caso, esperado, obtenido) => {
  const pasa = JSON.stringify(esperado) === JSON.stringify(obtenido);
  if (!pasa) fallos++;
  filas.push({ caso, esperado: JSON.stringify(esperado), obtenido: JSON.stringify(obtenido), resultado: pasa ? "PASA" : "FALLA" });
};

/* ── Lo que sí es una ruta ── */
check("#/modelo-iceberg", { vista: "modelo-iceberg", modo: null, extra: null }, interpretar("#/modelo-iceberg"));
check("#/modelo-iceberg/hacer", { vista: "modelo-iceberg", modo: "hacer", extra: null }, interpretar("#/modelo-iceberg/hacer"));
check("#/politica-economica/aprender", { vista: "politica-economica", modo: "aprender", extra: null }, interpretar("#/politica-economica/aprender"));
/*
 * Este caso comprobaba que "#/consumo" abría la subvista de DA-Learn. El
 * simulador se retiró entero y sus seis hashes salieron de VISTAS, así que
 * ahora comprueba lo contrario: un enlace guardado de aquella época cae en la
 * portada en vez de pintar una pantalla vacía. Si alguien vuelve a meter
 * "consumo" en la lista sin haber reconstruido la vista, esto lo dice.
 */
check("#/consumo (hash retirado de DA-Learn)", { vista: "home", modo: null, extra: null }, interpretar("#/consumo"));
check("barra sobrante al final", { vista: "docente", modo: null, extra: null }, interpretar("#/docente/"));

/* ── El tercer segmento ── */
/*
 * Las dos formas que existen hoy: con modo y sin modo. El extra es siempre el
 * primer segmento después de la vista que no sea un modo.
 */
check("#/docente/<actividad>", { vista: "docente", modo: null, extra: "proyecto-arca" }, interpretar("#/docente/proyecto-arca"));
check("#/tema/modo/<actividad>", { vista: "modelo-iceberg", modo: "hacer", extra: "proyecto-arca" }, interpretar("#/modelo-iceberg/hacer/proyecto-arca"));
check("serializar sin modo", "#/docente/proyecto-arca", serializar("docente", null, "proyecto-arca"));
check("serializar con modo", "#/modelo-iceberg/hacer/proyecto-arca", serializar("modelo-iceberg", "hacer", "proyecto-arca"));
check("serializar sin extra no cambia", "#/modelo-iceberg/hacer", serializar("modelo-iceberg", "hacer"));

/* ── Lo que NO es una ruta cae en la portada ── */
check("hash vacío", RUTA_INICIAL, interpretar(""));
check("sin hash (undefined)", RUTA_INICIAL, interpretar(undefined));
check("solo almohadilla", RUTA_INICIAL, interpretar("#"));
check("vista inventada", RUTA_INICIAL, interpretar("#/no-existe"));
check("hash que no empieza por barra", RUTA_INICIAL, interpretar("#modelo-iceberg"));

/*
 * EL TOKEN DE GOOGLE. Va con el hash literal que devuelve Supabase, no con uno
 * inventado en función de nada: si algún día se escribiera como
 * `interpretar('#' + algo)` dejaría de vigilar lo que vino a vigilar.
 */
check(
  "el token de OAuth no es una ruta",
  RUTA_INICIAL,
  interpretar("#access_token=eyJhbGciOiJIUzI1NiIs&expires_in=3600&refresh_token=abc&token_type=bearer")
);
check("y el error de OAuth tampoco", RUTA_INICIAL, interpretar("#error=access_denied&error_description=denegado"));

/* ── Un modo inventado se ignora, pero la vista se respeta ── */
/*
 * Lo que antes era un modo inventado ahora es un `extra`: el segundo segmento
 * que no está en MODOS se entrega tal cual a la vista, que lo comprueba o lo
 * ignora. Sigue sin ser un modo, que es lo que este caso vigilaba.
 */
check("segundo segmento que no es modo -> extra", { vista: "modelo-iceberg", modo: null, extra: "inventado" }, interpretar("#/modelo-iceberg/inventado"));

/* ── Ida y vuelta: serializar e interpretar tienen que cerrar el círculo ── */
{
  const casos = [
    ["home", null],
    ["modelo-iceberg", null],
    ["modelo-iceberg", "hacer"],
    ["politica-economica", "aprender"],
    ["perfil", null],
  ];
  const rotos = casos.filter(([v, m]) => {
    const r = interpretar(serializar(v, m));
    return r.vista !== v || r.modo !== m;
  });
  check("ida y vuelta de todas las combinaciones", [], rotos);
}

/* La portada no lleva hash: la barra queda limpia en la pantalla de entrada. */
check("la portada serializa a vacío", "", serializar("home", null));

/*
 * Y TODAS las vistas que declara la lista blanca tienen que sobrevivir el ciclo.
 * Esto es lo que caza que alguien añada una vista a App.jsx y se olvide de
 * VISTAS: la ruta la mandaría a la portada en silencio.
 */
{
  const rotas = [...VISTAS].filter((v) => interpretar(serializar(v, null)).vista !== v);
  check(`las ${VISTAS.size} vistas sobreviven el ciclo`, [], rotas);

  /*
   * Y sobreviven llevando un extra encima. Se prueba con las vistas que hoy lo
   * usan, en sus dos formas.
   */
  const conExtra = [["docente", null], ["modelo-iceberg", "hacer"], ["camino-da", "hacer"]]
    .filter(([v]) => VISTAS.has(v))
    .filter(([v, m]) => {
      const r = interpretar(serializar(v, m, "una-actividad"));
      return r.vista !== v || r.modo !== m || r.extra !== "una-actividad";
    });
  check("el extra sobrevive el ciclo", [], conExtra);
}

/*
 * ═══════════ NINGÚN id DE ACTIVIDAD PUEDE LLAMARSE COMO UN MODO ═══════════
 *
 * El extra ocupa la segunda posición del hash cuando no hay modo, y se
 * distingue de un modo porque MODOS es un conjunto cerrado. Si algún día
 * existiera una actividad con id "hacer", "#/docente/hacer" se leería como
 * modo y el panel no recibiría nada.
 *
 * Es de esos fallos que no revientan: la URL se ve bien, el panel abre, y
 * simplemente ignora la actividad. Por eso se comprueba en vez de confiar.
 */
{
  const chocan = [];
  for (const materia of Object.values(SUBJECTS)) {
    for (const tema of materia.topics ?? []) {
      for (const a of tema.actividades ?? []) {
        if (MODOS.has(a.id)) chocan.push(`${materia.id} · ${a.id}`);
      }
    }
  }
  check("ningún id de actividad se llama como un modo", [], chocan);
}

console.table(filas);
console.log(fallos === 0
  ? `\nLa ruta traduce bien en los ${filas.length} casos.`
  : `\n${fallos} FALLAN.`);
if (fallos > 0) process.exit(1);
