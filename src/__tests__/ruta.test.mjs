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
import { interpretar, serializar, VISTAS, RUTA_INICIAL } from "../ruta.js";

let fallos = 0;
const filas = [];

const check = (caso, esperado, obtenido) => {
  const pasa = JSON.stringify(esperado) === JSON.stringify(obtenido);
  if (!pasa) fallos++;
  filas.push({ caso, esperado: JSON.stringify(esperado), obtenido: JSON.stringify(obtenido), resultado: pasa ? "PASA" : "FALLA" });
};

/* ── Lo que sí es una ruta ── */
check("#/modelo-iceberg", { vista: "modelo-iceberg", modo: null }, interpretar("#/modelo-iceberg"));
check("#/modelo-iceberg/hacer", { vista: "modelo-iceberg", modo: "hacer" }, interpretar("#/modelo-iceberg/hacer"));
check("#/politica-economica/aprender", { vista: "politica-economica", modo: "aprender" }, interpretar("#/politica-economica/aprender"));
/*
 * Este caso comprobaba que "#/consumo" abría la subvista de DA-Learn. El
 * simulador se retiró entero y sus seis hashes salieron de VISTAS, así que
 * ahora comprueba lo contrario: un enlace guardado de aquella época cae en la
 * portada en vez de pintar una pantalla vacía. Si alguien vuelve a meter
 * "consumo" en la lista sin haber reconstruido la vista, esto lo dice.
 */
check("#/consumo (hash retirado de DA-Learn)", { vista: "home", modo: null }, interpretar("#/consumo"));
check("barra sobrante al final", { vista: "docente", modo: null }, interpretar("#/docente/"));

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
check("modo inventado, vista buena", { vista: "modelo-iceberg", modo: null }, interpretar("#/modelo-iceberg/inventado"));

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
}

console.table(filas);
console.log(fallos === 0
  ? `\nLa ruta traduce bien en los ${filas.length} casos.`
  : `\n${fallos} FALLAN.`);
if (fallos > 0) process.exit(1);
