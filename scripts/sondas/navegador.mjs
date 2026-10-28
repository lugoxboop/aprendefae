/*
 * El Chromium de las sondas, en cualquier máquina.
 *
 * Las sondas nacieron en el contenedor de los agentes, donde Playwright vive
 * en /opt y el navegador en /opt/pw-browsers. En GitHub Actions no existe
 * nada de eso: allí se instala `playwright` y su Chromium en el paso del
 * flujo. Esto prueba en orden: PLAYWRIGHT_MODULE, el paquete `playwright` del
 * proyecto y el del contenedor; y usa el ejecutable del contenedor solo si
 * existe. Así la misma sonda corre a mano y en CI (#581, Levi: «la sonda
 * tiene que correr en CI, no a mano»).
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const RUTAS = [process.env.PLAYWRIGHT_MODULE, "playwright", "/opt/npm-tools/node_modules/playwright-core/index.js"].filter(Boolean);
let pw = null;
for (const ruta of RUTAS) {
  try { pw = await import(ruta); break; } catch { /* la siguiente */ }
}
if (!pw) throw new Error(`No encontré Playwright en: ${RUTAS.join(", ")}`);
const base = (pw.default ?? pw).chromium;
const EJECUTABLE = "/opt/pw-browsers/chromium";

export const chromium = {
  launch: (opciones = {}) => {
    const { executablePath, ...resto } = opciones;
    const ruta = executablePath && existsSync(executablePath) ? executablePath : (existsSync(EJECUTABLE) ? EJECUTABLE : undefined);
    return base.launch(ruta ? { ...resto, executablePath: ruta } : resto);
  },
};

/*
 * ═══════════ LAS TIPOGRAFÍAS, O LA SONDA MIDE OTRA COSA ═══════════
 *
 * `global.css` pide Sora e Inter a Google Fonts. En CI la red está abierta y
 * cargan; en el contenedor de los agentes, Google Fonts está bloqueado y el
 * navegador cae a la tipografía de respaldo. Y una tipografía distinta es una
 * maqueta distinta: anchos, cortes de línea y, por tanto, qué queda debajo de
 * la ficha de FP. Medir sin ellas y comparar contra una línea base medida con
 * ellas es comparar dos cosas.
 *
 * Pasó de verdad: a 320 px la misma sonda daba 0 en el contenedor y rojo en
 * CI para el mismo commit, y el culpable era esto, no el arreglo.
 *
 * Si está la caché de `scripts/t4/sonda-enganche/.sonda-fuentes` (la llena
 * `fuentes.sh` y no se sube al repo), se sirven de ahí, que es lo que ya hace
 * la sonda de T4. Si no está, se piden a Google como siempre — pero entonces
 * la sonda tiene que DECIRLO, y por eso se exporta el dato en vez de
 * esconderlo: un cero medido con la tipografía de respaldo no es el mismo
 * cero.
 */
const FUENTES = process.env.SONDA_FUENTES ?? resolve(import.meta.dirname, "../t4/sonda-enganche/.sonda-fuentes");
const PESOS = [["Sora", [300, 400, 600, 700, 800]], ["Inter", [400, 500, 600, 700]]];

export const hayFuentesLocales = existsSync(`${FUENTES}/fontsource-inter-5.3.0`)
  && existsSync(`${FUENTES}/fontsource-sora-5.3.0`);

export const comoSeMidieronLasFuentes = hayFuentesLocales
  ? "Sora e Inter de la caché local (@fontsource 5.3.0), como en CI"
  : "TIPOGRAFÍA DE RESPALDO: sin la caché de .sonda-fuentes y sin Google Fonts, la maqueta NO es la de CI";

/*
 * Devuelve lo que hay que responder a una petición de tipografía, o null si la
 * petición no es de tipografía. Se llama desde el route de cada sonda, antes
 * de lo demás.
 */
export function fuenteLocal(url) {
  if (!hayFuentesLocales) return null;
  if (url.includes("/__f/")) {
    const [familia, peso] = url.split("/__f/")[1].split("/");
    const carpeta = familia === "Sora" ? "fontsource-sora-5.3.0" : "fontsource-inter-5.3.0";
    const archivo = `${FUENTES}/${carpeta}/package/files/${familia.toLowerCase()}-latin-${peso.split(".")[0]}-normal.woff2`;
    if (!existsSync(archivo)) return null;
    return { contentType: "font/woff2", body: readFileSync(archivo) };
  }
  if (url.includes("fonts.googleapis.com")) {
    let css = "";
    for (const [familia, pesos] of PESOS) {
      for (const peso of pesos) {
        css += `@font-face{font-family:'${familia}';font-style:normal;font-weight:${peso};`
          + `font-display:swap;src:url(/__f/${familia}/${peso}.woff2) format('woff2');}\n`;
      }
    }
    return { contentType: "text/css", body: css };
  }
  return null;
}
