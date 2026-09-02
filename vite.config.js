import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    rollupOptions: {
      /*
       * Dos entradas. /privacidad se compila como documento estático propio
       * (dist/privacidad/index.html) en vez de ser una ruta del SPA: así la URL
       * responde en cualquier hosting sin reglas de reescritura, que es lo que
       * necesita el revisor de Google OAuth.
       */
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        privacidad: resolve(import.meta.dirname, "privacidad/index.html"),
      },
    },
  },
});
