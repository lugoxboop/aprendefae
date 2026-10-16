/*
 * Config de vite para levantar el build que mide la sonda, con una cacheDir PROPIA por proceso.
 * Dos vite sobre el mismo node_modules con la misma caché se pisan y la página sale en blanco
 * («Invalid hook call»). Se corre desde la raíz del build que se mide y usa su vite.config.js:
 *   npx vite --config scripts/b5/sonda-enganche/vite-sonda.config.mjs --port 5291 --strictPort
 * SONDA_VITE_CACHE=/ruta fija la caché a mano; si no, va a un directorio temporal por proceso.
 */
import { mergeConfig } from "vite";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const raiz = process.cwd();
const { default: base } = await import(pathToFileURL(join(raiz, "vite.config.js")).href);
export default mergeConfig(base, {
  root: raiz,
  cacheDir: process.env.SONDA_VITE_CACHE ?? join(tmpdir(), `vite-sonda-${process.pid}`),
});
