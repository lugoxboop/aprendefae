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

## Abierto: #488, slides de T4 (rama `feat/conta-d4-slides-hilo`, en borrador)

**Estado de la rama:** igual a `main` más dos parches de borrador en `orquestador/revisiones/t4-slides/borradores/`:
- `a1-hilo-v1.patch`: A1 con «cobra» como pantalla 1, sobre el diseño viejo de `PantallasT4`.
- `a0-hilo-v1.patch`: un A0 anterior al lote 2.

Sirven de referencia para datos y pruebas (paquete v7, plan de la sonda), no para aplicarlos tal cual. CI en verde: las pruebas de T4 dan 410/410.

**Decisión de Yujiro (24 oct): la figura va con 206 px y no se rehacen los modelos.** La reserva se sube desde el contenedor de T4 sin tocar `src/components/secuencia/`:
```css
@media (max-width: 759px) { .t4-sec .fae-sec-raiz { --fae-sec-alto-figura: 206px; } }
```
- **Medido** con `SecuenciaAprender` de `main` (4c6cfe5) y una figura de prueba: da 206 a 320, a 375 y a 800.
- **El `max-width: 759px` lo añadí después y no está medido.** Sin él, a 800 px también pisaba los 320 que el contenedor reserva desde 760. Medir que a 800 quede en 320.
- Cuando Erwin saque la prop oficial `altoFigura` (issue de Yujiro), se cambia el CSS por la prop.

**Paradas del §7 de Hanayama:**

| # | Parada | Estado |
|---|---|---|
| 1 | Cabecera de la vista + bloque de navegación | **Hecha**: 136 + 56 = 192 a 320 (tope 192); 138 + 56 a 375 |
| 2 | Cada modelo ≤ 206 a 320 y 375 | Pendiente |
| 3 | Asiento compacto de A1 ≤ 52 px con la cuenta más larga del caso B | Pendiente |
| 4 | «$1.274.200» en Inter 13/600 tabular dentro de 72 px | Pendiente |
| 5 | Renglón de 56 de las libretas de A4 p4 y p5 | Pendiente |
| 6 | La devolución más larga en la banda de 66 a 258 px | Pendiente |
| 7 | A1 p6 ≤ 206 | Pendiente |

**Qué falta, en orden:**
1. **Montar T4 Aprender sobre `SecuenciaAprender`.** El contenedor está en `src/components/secuencia/` y su forma de pieza en `secuencia.js`, con `faltasDePieza(pieza)` para validar. Va dentro de `ContabilidadT4View.jsx`, envuelto en `.t4-sec`, con el CSS de arriba.
   - Hoy las piezas de Aprender se pintan con `PantallasT4`, en el mismo archivo. No se borra: se deja de usar pieza por pieza.
2. **Las seis piezas según `diseno-hanayama.md` §2-§3:**
   - el contenido del hilo de Katsumi (`hilo-katsumi.md`), con el lote 2 sustituyendo A0, A2 p2 y A4 p1;
   - el texto literal de las pantallas con «…»;
   - el lote 4: los porqué de C2, la razón de «Pagar» en A1 p3, y A4 sin Cierre. El porqué de A2 p6 está medido: 24 palabras, INFLESZ 93,6.
   - Figuras compactas y reglas: figura fija de 206; banda de 66 con un solo dueño; veredicto en el control, con borde e ícono de lucide; sin `LineaMarcas` ni «Iba aquí»; C2 con la pista al primer error y el estado correcto al segundo.
3. **Datos y pruebas.** Las pruebas de T4 comparan cada texto contra un paquete en `orquestador/conocimiento/paquetes/` (`d4-t4-aN-vX-*.md`, que se lee con `t4-rediseno-canon.mjs`). Cada pieza nueva lleva un paquete vN-hilo y se ajustan `t4-aN-*.test.mjs`, `t4-d7`, `t4-lector-ph8`, `t4-guardia-enganche` y `scripts/t4/sonda-enganche/enganche_planes*.json`.
   - En el borrador de A1 se vio que B1 y B2 de la guardia cuentan las palabras como en el diseño viejo. Con la banda y el titular de `SecuenciaAprender` hay que revisar qué cuenta la guardia.
4. **Medidas y PR.** Medir con la sonda (`--tema=t4`), la guardia y `medir-t4.mjs`. En el PR van, por pantalla: palabras, líneas a 320 y alto de la figura (Vara 2 de Shibukawa). También las capturas reducidas de la pantalla 1 de cada pieza a 320×568 y 375×667. Después, sacar el #488 de borrador.

**Cómo levantar cosas sin repetir errores:**
- **Build con Supabase falso:** `VITE_SUPABASE_URL=http://fake.supabase.test VITE_SUPABASE_ANON_KEY=anon-falsa npx vite build`.
- **Servir el build:** `npx vite preview --port 8099 --strictPort`.
- **Fuentes de producción:** `bash scripts/t4/sonda-enganche/fuentes.sh`.
- **Banco de T4:** `scripts/t4/harness-t4/`, servido con `npx vite --config scripts/t4/sonda-enganche/vite-sonda.config.mjs --port 5291`.
- **Playwright en este entorno:** está en `/opt/node-tools/node_modules/playwright`. `scripts/contraste.mjs` importa de `/opt/npm-tools`, que aquí no existe.
- **Parar un servidor:** no uses `pkill -f "vite preview"`, porque mata también el shell que lo lanza; usa `fuser -k <puerto>/tcp`.
- **La prueba roja de `main`** («marca combinante», `scripts/canon.mjs` línea 46) ya no sale: `main` estaba verde en cb9a948.
