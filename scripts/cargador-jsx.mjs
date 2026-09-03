/*
 * Permite que `node` importe archivos .jsx directamente.
 *
 * Node no reconoce la extensión .jsx y falla con ERR_UNKNOWN_FILE_EXTENSION
 * antes siquiera de leer el archivo. Vite resuelve esto al construir, pero las
 * pruebas corren fuera de Vite: este gancho hace la misma traducción para ellas.
 *
 * Usa el esbuild que Vite ya trae, así que no añade ninguna dependencia. Se
 * engancha con `node --import ./scripts/cargador-jsx.mjs`.
 */

import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";

registerHooks({
  load(url, context, nextLoad) {
    if (!url.endsWith(".jsx")) return nextLoad(url, context);

    /*
     * Se lee a mano en vez de delegar en nextLoad: es nextLoad quien rechaza la
     * extensión desconocida, así que llamarlo aquí reproduciría el error.
     */
    const fuente = readFileSync(fileURLToPath(url), "utf8");

    const { code } = transformSync(fuente, {
      loader: "jsx",
      format: "esm",
      /*
       * "automatic" importa el runtime de React por su cuenta. Con el clásico,
       * un archivo que usa JSX sin importar React explícitamente —lo normal en
       * este proyecto— reventaría al renderizar.
       */
      jsx: "automatic",
      sourcefile: url,
      sourcemap: "inline",
    });

    return { format: "module", shortCircuit: true, source: code };
  },
});
