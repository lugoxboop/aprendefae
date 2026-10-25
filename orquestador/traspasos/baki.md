# Traspaso · Baki, agente de código de la Célula D (24 oct 2026)

Lo escribo porque mi contexto pasó del 80 % con los slides de T4 recién destrabados. La sesión nueva arranca con la skill `celula-construccion`; aquí está lo propio de la célula.

## Hecho y fusionado

| PR | Qué |
|---|---|
| #472 | Inventario medido del panel docente (`orquestador/revisiones/panel-docente/inventario.md`) |
| #475 | Subtemas de los Hacer de T4 para el Repaso Diario (`src/data/contabilidadT4Subtemas.js`) |
| #498 | Panel docente v1: diseño de Ukyo, textos de Katsumi; P7 dio 0 diferencias en 885 y 1.245 cifras |
| #519 y #528 | Logitos de Contabilidad T1-T4 y el cajón con dos patas |
| #525 | Textos del lote 4 en el panel. A menos de 400 px, B2 muestra 2 filas |

**Herramientas que dejé:**
- `scripts/t4/panel-docente/`: `pagina.mjs` (abre el panel con Supabase falso y sesión fingida), `curso-falso.mjs` (escenarios cero, uno, normal y grande), `vara1.mjs`, `p7.mjs`, `verificacion-498*.mjs` y `capturas-textos.mjs`.
- `scripts/t4/logitos/medir-logitos.mjs`.

## #488, slides de T4 (rama `feat/conta-d4-slides-hilo`): construido, listo para auditoría (25 oct)

- T4 Aprender va sobre `SecuenciaAprender` (sin tocarlo), en `.t4-sec`. Lo común: `src/components/t4/slides/comun.jsx`. Cada pieza: `src/components/t4/slides/AN.jsx` + `src/data/contabilidadT4SlidesAN.js`. `PantallasT4` y los datos viejos siguen (no se borra nada).
- Prueba común `t4-slides.test.mjs` (forma, literalidad contra el hilo y los paquetes, B2, recorrido entero en los dos casos). `npm test`: 0 fallos.
- Sonda `scripts/t4/slides/medir-slides.mjs` (modelo, banda, B1, `bajoNav`; `--pieza`, `--caso`, `--capturas`). Medidas en `orquestador/revisiones/t4-slides/medidas-caso*.json`; capturas en `capturas/`.
- Abierto, para otros: #541 (Erwin: `faltasDePieza` sin Apertura y sin Cierre); #537 (prop `altoFigura`); a 320, bandas de 4-7 renglones y la banda bajo la navegación fija (lo ven Hanayama y Katsumi); `RAZON_HAZ` es texto de interfaz mío, a revisar por Katsumi.
- Auditoría de Shibukawa (25 oct): NO PASA con E2 a 320, A4 p1 y A1 p5. Hecho en la tanda siguiente: el ajuste de la banda en `comun.jsx` (`useBandaALaVista`), «Bancos es la plata…» a A4 p2, «Escenario simulado.» en A1 p5, «Decide para seguir.» y A5 p5 con la mecánica nueva de Katsumi (contrapartida entre tres cuentas). Medido: `bajoNav` 0 en las 144 filas, A4 p1 en 7 líneas, A7 ≤ 14 ms. Capturas en `capturas/auditoria/` (`scripts/t4/slides/capturas-auditoria.mjs`). Fuente de los textos nuevos: `auditoria-shibukawa.md`.
- Siguiente: que Yujiro fusione; nada más pendiente de mi lado.

**Cómo levantar cosas sin repetir errores:**
- **Build con Supabase falso:** `VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build`.
- **Servir el build:** `npx vite preview --port 8099 --strictPort`.
- **Fuentes de producción:** `bash scripts/t4/sonda-enganche/fuentes.sh`.
- **Banco de T4:** `scripts/t4/harness-t4/`, servido con `npx vite --config scripts/t4/sonda-enganche/vite-sonda.config.mjs --port 5291`.
- **Playwright en este entorno:** está en `/opt/node-tools/node_modules/playwright`. `scripts/contraste.mjs` importa de `/opt/npm-tools`, que aquí no existe.
- **Parar un servidor:** no uses `pkill -f "vite preview"`, porque mata también el shell que lo lanza; usa `fuser -k <puerto>/tcp`.
- **La prueba roja de `main`** («marca combinante», `scripts/canon.mjs` línea 46) ya no sale: `main` estaba verde en cb9a948.
