/*
 * El Chromium de los bancos de medida de la Célula B, con la barra de
 * desplazamiento A LA VISTA (Sakuta, 15-oct).
 *
 * Playwright arranca Chromium con --hide-scrollbars, y así la página tiene los
 * 320 px enteros. El Chromium de escritorio reserva 15 px para la barra: a
 * 320, la columna del sitio es 15 px más estrecha que la del banco. De ahí
 * salían las dos diferencias: en la capa 3 de T6 · A1, la fila «Sube · Baja ·
 * No cambia» medía 228 en el banco y 213 en aprendefae.com (botones de 73×44
 * frente a 68×58, con «No cambia» partido); en el eje de b5-t6-a6, 8,78 px
 * entre rótulos en el banco y 5,5 en el sitio. Con la barra a la vista, el
 * banco da 213 y 68×58, lo mismo que el sitio.
 *
 * Se mide el caso más estrecho: en un teléfono la barra flota y no quita
 * ancho. Con OCULTAR_BARRA=1 se mide sin ella.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? "/opt/node-tools/node_modules/playwright");

export const abrirNavegador = () => chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  ...(process.env.OCULTAR_BARRA ? {} : { ignoreDefaultArgs: ["--hide-scrollbars"] }),
});
