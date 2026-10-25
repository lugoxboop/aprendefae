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
import { existsSync } from "node:fs";

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
