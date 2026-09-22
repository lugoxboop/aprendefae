import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LAS CABECERAS DE CACHÉ, VIGILADAS DESDE AQUÍ.
 *
 * El problema que resuelve public/.htaccess no avisa cuando vuelve: el sitio
 * funciona, el despliegue sale en verde y lo único que pasa es que algunos
 * estudiantes siguen con la versión de la semana pasada. Ya ocurrió una vez y
 * se descubrió comparando a mano el nombre del bundle que pedía el navegador
 * con el que servía el servidor.
 *
 * Así que el archivo no se queda solo, y las tres barreras miran cosas
 * distintas a propósito:
 *
 *   · ESTA prueba, que el contenido del .htaccess sea el correcto.
 *   · El paso «Comprobar que el build salió completo», que llegue al build.
 *   · La sonda de postdespliegue, que llegue AL SERVIDOR — lo único que
 *     demuestra que el FTP subió un archivo que empieza por punto.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const HTACCESS = readFileSync("public/.htaccess", "utf8");
const DEPLOY = readFileSync(".github/workflows/deploy.yml", "utf8");

/*
 * Solo las directivas: el archivo explica en sus comentarios por qué NO toca
 * la caché de los bundles, y para eso cita el max-age que ya pone Hostinger.
 * Buscar en el texto entero convertía esa explicación en un fallo.
 */
const DIRECTIVAS = HTACCESS.split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .join("\n");

/* El cuerpo de la sonda de caché, sin el de la sonda de FP que va detrás. */
const SONDA = DEPLOY.slice(
  DEPLOY.indexOf("Sonda — el index.html llega con Cache-Control"),
  DEPLOY.indexOf("Sonda — registrar_fp"),
);

test("los .html revalidan en cada visita: sin eso el navegador se inventa cuánto durarlos", () => {
  assert.match(DIRECTIVAS, /<FilesMatch "\\\.html\$">/);
  assert.match(DIRECTIVAS, /Header set Cache-Control "no-cache, must-revalidate"/);
});

test("NO se toca la caché de los archivos con hash, que es correcta como está", () => {
  /*
   * assets/main-19A3utOu.js lleva su hash en el nombre: ese nombre nunca
   * cambia de contenido, así que guardarlo mucho tiempo es correcto y es lo que
   * ya hace Hostinger. Si alguien mete aquí una regla que los toque, lo más
   * probable es que los deje sin caché y ponga el sitio lento sin enterarse.
   *
   * SE CUENTAN LOS BLOQUES, y no se busca «.js» en el texto. Buscar la cadena
   * no servía: un <FilesMatch "\.(js|css)$"> escrito tal cual no contiene
   * «.js$» por ningún lado —lo que hay es «(js|css)$»—, así que la regla se
   * podía colar con la prueba en verde. Contar dice la verdad: hay una regla,
   * y es la de los .html.
   */
  const bloques = DIRECTIVAS.match(/<FilesMatch [^>]*>/g) ?? [];
  assert.equal(bloques.length, 1, `hay ${bloques.length} reglas; solo debería estar la de los .html`);
  assert.match(bloques[0], /\\\.html\$/, "la única regla ya no es la de los .html");
  assert.ok(
    !/\b(js|css|woff2?|png|svg|jpe?g|gif|webp|avif)\b/i.test(DIRECTIVAS),
    "el .htaccess nombra tipos de archivo estáticos",
  );
  assert.ok(!/max-age/.test(DIRECTIVAS), "el .htaccess está fijando max-age a algo");
  assert.ok(!/ExpiresDefault|ExpiresByType/.test(DIRECTIVAS), "entró mod_expires sin que nadie lo pidiera");
});

test("todo va dentro de <IfModule>: un .htaccess que el servidor no entienda tumba el sitio entero", () => {
  /*
   * No es una precaución teórica: una directiva desconocida en un .htaccess no
   * se ignora, devuelve HTTP 500 para TODO el dominio. Envuelto en <IfModule>,
   * el peor caso es que no haga nada.
   */
  const abre = DIRECTIVAS.indexOf("<IfModule mod_headers.c>");
  const cierra = DIRECTIVAS.indexOf("</IfModule>");
  assert.ok(abre === 0, "el <IfModule> no abre el archivo");
  assert.ok(cierra > abre, "no hay bloque <IfModule mod_headers.c>");
  assert.equal(DIRECTIVAS.slice(cierra + "</IfModule>".length).trim(), "", "hay directivas después del </IfModule>");
});

test("el despliegue para si el build no trae el .htaccess", () => {
  /*
   * Anclada al principio de la línea: `true || test -f dist/.htaccess` también
   * contiene la cadena, y desactiva la comprobación dejando la prueba verde.
   */
  assert.match(
    DEPLOY,
    /^\s*test -f dist\/\.htaccess \|\|/m,
    "la comprobación existe pero no es lo primero de su línea",
  );
});

test("la sonda en vivo mira la portada Y los bundles, y puede fallar en las dos", () => {
  assert.ok(SONDA.length > 0, "no está la sonda de caché");
  assert.match(SONDA, /no-cache/);
  assert.match(SONDA, /\/assets\/main-/, "la sonda no vigila la caché de los bundles");
  assert.match(SONDA, /max-age/, "la sonda no comprueba que los bundles sigan cacheados");
  assert.match(SONDA, /exit \$fallo/, "la sonda no devuelve su resultado");
});

test("y CADA rama de la sonda que dice ROJO marca fallo: si no, siempre saldría verde", () => {
  /*
   * Comprobar que `fallo=1` aparece en algún sitio no bastaba. Quitándolo de la
   * rama «la portada no trae Cache-Control» —justo el caso que esta sonda
   * existe para cazar— seguía apareciendo en las otras ramas y la prueba
   * pasaba. Así que se mira rama por rama: desde cada `echo "ROJO` hasta donde
   * termina su bloque, tiene que haber un fallo=1.
   */
  const lineas = SONDA.split(/\r?\n/);
  const rojas = [];
  lineas.forEach((linea, i) => {
    if (!/echo "ROJO/.test(linea)) return;
    let marca = false;
    for (let j = i + 1; j < lineas.length; j += 1) {
      const l = lineas[j];
      if (/fallo=1/.test(l)) { marca = true; break; }
      /* Fin del bloque: otro caso, el cierre del case, o un else/fi. */
      if (/;;|\besac\b|\belse\b|\bfi\b|echo "OK/.test(l)) break;
    }
    rojas.push({ linea: linea.trim().slice(0, 60), marca });
  });

  assert.ok(rojas.length >= 4, `la sonda solo tiene ${rojas.length} ramas de fallo; esperaba cuatro`);
  for (const r of rojas) {
    assert.ok(r.marca, `una rama dice ROJO y no marca fallo: ${r.linea}`);
  }
});

test("el .htaccess no cae en las exclusiones del FTP", () => {
  /*
   * El paso de subida excluye `**\/.git*`. `.htaccess` empieza por punto pero
   * no por `.git`, así que no casa — y conviene que una prueba lo diga, porque
   * la diferencia entre `.git*` y `.*` es un carácter y el fallo sería mudo.
   */
  const exclusiones = DEPLOY.slice(DEPLOY.indexOf("exclude: |"), DEPLOY.indexOf("Sonda —"));
  const patrones = exclusiones
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("**/"));
  assert.ok(patrones.length >= 3, "no se leyeron las exclusiones del FTP");
  for (const patron of patrones) {
    const cuerpo = patron.replace(/^\*\*\//, "");
    assert.ok(
      !new RegExp(`^${cuerpo.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(".htaccess"),
      `la exclusión «${patron}» se llevaría por delante el .htaccess`,
    );
  }
});
