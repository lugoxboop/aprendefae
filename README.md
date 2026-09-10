# AprendeFAE

Sitio educativo interactivo para estudiantes de la FAE. La pantalla de entrada ofrece dos materias; cada una lleva a sus temas.

- **Macroeconomía** → DA-Learn, simulador de Demanda Agregada: los 4 canales de gasto (Consumo, Inversión, Gasto Público, Exportaciones Netas) de la economía colombiana, con quizzes y ranking.
- **Pensamiento Estratégico** → placeholder "Próximamente" hasta que exista el contenido.

Construido con React + Vite. Gráficas con Recharts, íconos con lucide-react, utilidades de estilo con Tailwind CSS.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (incluye npm).

## Configuración de la cuenta (Supabase + Google)

Copia `.env.example` a `.env.local` y rellena las tres variables. Sin ellas el sitio funciona igual, solo que sin inicio de sesión: el control de cuenta no se muestra y nunca se pide entrar.

```bash
cp .env.example .env.local
```

**La migración es obligatoria y va primero.** Corre `supabase/migrations/0001_profiles.sql` en el SQL Editor de Supabase antes de intentar iniciar sesión: crea la tabla `profiles`, el índice único de apodo, las políticas RLS y la función `nickname_disponible`. Es idempotente.

Sin ella, entrar con Google funciona pero el perfil no se puede leer ni crear, y el estudiante queda atascado en el paso de apodo.

### Sistema de FP (fase 1)

El motor de cálculo vive en `src/fp/motor.js` como **función pura**: no toca red ni estado, así que sus reglas se verifican sin base de datos. `node src/fp/__tests__/motor.test.mjs` corre 24 chequeos sobre puntos base, escalado por aciertos con piso del 50%, defensa de tiempo y decaimiento por repetición.

El camino completo es: la actividad llama a `registrarActividadCompletada(clasificacion, contexto)` → el motor calcula → la función SQL `registrar_fp` inserta en `fp_history` y suma a `profiles.points` **en la misma transacción**. Ninguna actividad calcula puntos por su cuenta.

`fp_history` guarda `subject_id` desde el principio: sin él no se puede calcular un ranking por materia, y añadirlo después obligaría a rellenar el histórico.

**Los umbrales de tiempo mínimo (`TIEMPO_MINIMO_MS`) son provisionales.** Las reglas de FP fijan los puntos base pero no estos valores; están estimados proporcionalmente a la dificultad y agrupados en un solo sitio para poder ajustarlos.

Las mecánicas evaluativas calculan su desempeño como **porcentaje (0–100)** y lo pasan en `contexto.porcentajeAciertos`. La conversión a la proporción 0–1 que espera el motor ocurre en `registrarActividad.js`, una sola vez, para que ninguna mecánica pueda equivocarse de escala.

**DA-Learn también pasa por aquí.** El simulador de Demanda Agregada llevaba su propio
puntaje (10 puntos por respuesta, 50 por pregunta final) y un ranking contra compañeros
inventados. Los dos se eliminaron. Ahora el simulador llama al mismo camino central al
completarse —los 4 canales más la Ronda Final— y el ranking de la materia vive un nivel
arriba, en el índice de Macroeconomía: dentro de la actividad no hay ninguno.

DA-Learn se construyó antes que el resto del sitio, así que arrastraba piezas que dejaron
de tener sentido al quedar dentro de él: pedía un nombre propio al entrar (hoy el apodo se
elige una vez, al entrar con Google, y vale para todo), tenía su propio ranking, y su
fondo era plano. Las tres se alinearon: el apodo sale del perfil, el ranking se eliminó de
aquí, y el fondo es el mismo de curvas de oferta y demanda del índice de la materia.

Gen lo clasificó **Hacer · exploratoria · difícil**: 50 FP por terminarlo, sin escalar por
aciertos. Exploratoria y no evaluativa porque el quiz deja reintentar hasta acertar: un
porcentaje de aciertos final siempre daría 100 y mediría constancia, no desempeño. No es
una rebaja temporal, es la descripción de lo que la actividad hace.

**Acierto al primer intento.** Para que esa métrica exista el día que haga falta, cada
pregunta anota si se acertó *de una*, aparte del progreso normal. El reintentar hasta
acertar no cambió: es solo captura de dato. `QuizBlock` y `FinalQuizBlock` avisan del
primer intento; la guarda de "solo una vez por pregunta" vive en `App.jsx`, porque su
estado sobrevive a salir del canal y volver, y el del quiz no.

Ese porcentaje es el que viaja como `porcentajeAciertos` y queda en
`fp_history.correct_pct`. Al ser exploratoria el motor lo ignora para calcular FP, así que
no afecta a los puntos: se guarda para poder consultarlo después sin volver a tocar la
mecánica ni migrar el esquema.

**El cálculo ocurre en el navegador.** Un estudiante con conocimientos técnicos podría llamar a `registrar_fp` con un valor arbitrario. RLS impide tocar filas ajenas, pero no impide inflarse las propias. Conviene resolverlo antes de que los rankings sean públicos: la vía natural es mover el cálculo dentro de la función SQL, que ya recibe todas las entradas.

### Rankings de FP (fase 2)

Tres periodos —diario, semanal y de semestre— en dos emplazamientos: el ranking **por materia** vive en el índice de temas de cada materia, y el **general** en la página de perfil, a la que se llega desde el indicador de cuenta.

**Por qué el ranking es una función SQL y no una consulta del cliente.** Las políticas RLS de `fp_history` solo dejan ver las filas propias, así que un `select` desde el navegador jamás podría sumar los FP de los demás. `ranking_fp` corre como `security definer` para agregar sobre toda la tabla, pero devuelve únicamente apodo, FP y posición: nunca filas de historial ajenas, ni correos, ni nombres reales.

**Las ventanas de tiempo se calculan en horario de Bogotá, no en UTC.** Con UTC el ranking diario se reiniciaría a las 7 p.m. hora local. La semana va de lunes a domingo (`date_trunc('week')`).

La consulta se hace al entrar y al cambiar de pestaña; no hay suscripción en vivo.

### Verificar RLS

`supabase/tests/rls_profiles_test.sql` comprueba el aislamiento entre estudiantes. No necesita contraseñas ni iniciar sesión con Google: suplanta el JWT dentro de una transacción, que es como Postgres resuelve `auth.uid()`. Crea sus propios usuarios dentro de la transacción, así que se corre tal cual en el SQL Editor, y CI la corre en cada push.

Corre nueve chequeos —RLS encendida y forzada, cada estudiante ve solo su fila, no puede leer ni modificar la ajena, no puede crear filas a nombre de otro, y un visitante anónimo no ve nada— y termina en `ROLLBACK`, así que no deja rastro. Todos deben decir `PASA`.

Verificado contra el proyecto el 2026-09-01: los nueve pasan. A eso se suman cinco chequeos desde fuera, hechos con la anon key (los permisos de un visitante sin sesión): la tabla existe, un anónimo no lee ni escribe perfiles, `nickname_disponible` le está cerrada, y Google figura como proveedor activo.

**Cuidado con los privilegios por defecto de Supabase.** Conceden `EXECUTE` sobre las funciones nuevas del esquema `public` a `anon` y `authenticated`. Un `revoke ... from public` **no** elimina esa concesión a `anon`: hay que revocar a `anon` explícitamente, que es lo que hace la migración `0002`. Sin eso, `nickname_disponible` quedaba abierta y permitía enumerar apodos sin cuenta.

### Cómo funciona el inicio de sesión

- **Nunca bloquea.** Se puede recorrer todo el sitio sin cuenta. El diálogo aparece solo al ganar un punto o al abrir el ranking, y cerrarlo no interrumpe nada: el punto queda registrado en local igual.
- **Botón oficial de Google.** Lo dibuja la librería de Google (Identity Services) con `theme: filled_black` y `shape: pill`, que son las opciones permitidas que mejor calzan con el fondo navy. No se recrea con CSS, porque eso incumple las normas de marca de Google. Si la librería no carga o falta `VITE_GOOGLE_CLIENT_ID`, se ofrece un enlace de texto que hace el mismo login por redirección — sin imitar el botón.
- **Primer ingreso.** Si no hay fila en `profiles`, el paso de apodo es obligatorio y no se puede cerrar. El apodo es lo único que se muestra en los rankings; el nombre real de Google no se usa nunca.
- **Sesión persistente.** `persistSession` y `autoRefreshToken` mantienen la sesión entre visitas hasta que el estudiante cierre sesión o expire por inactividad.

## Correr en local

```bash
npm install
npm run dev
```

Levanta un servidor de desarrollo con recarga en caliente en `http://localhost:5173`.

## Generar el build de producción

```bash
npm run build
```

Genera una carpeta `dist/` con HTML, CSS y JS estáticos, lista para subir a cualquier hosting (Netlify, Vercel, GitHub Pages, un servidor propio) apuntando el dominio `aprendefae.com` a esa carpeta.

Para previsualizar ese build localmente antes de desplegar:

```bash
npm run preview
```

## Verificar antes de subir

```bash
npm run verificar
```

Ejecuta aquí el workflow «Pruebas» de GitHub —las pruebas de JavaScript, el build, las migraciones aplicadas desde cero sobre una base vacía y todas las pruebas SQL— con los mismos pasos de `.github/workflows/base.yml`, sobre PGlite, un Postgres que corre dentro de Node. Tarda unos cuatro minutos y sale en rojo si algo falla. `npm run verificar -- base-de-datos` corre solo la parte de SQL.

**Es para antes de cada push, no en vez del CI.** El veredicto que manda es el de Actions. Aquí es PostgreSQL 18.3 y no 16, el `psql` es una emulación escrita para el proyecto y no hay runner de GitHub: algo puede pasar aquí y fallar allí. La lista de lo que no reproduce está en la cabecera de `scripts/verificar/verificar.mjs`.

Existe porque tres fallos llegaron a producción —un factor ×100, dos firmas vivas de `registrar_fp`, una columna ambigua— y la causa común fue SQL que nadie había ejecutado.

## Despliegue automático

`.github/workflows/deploy.yml` publica el sitio en Hostinger en cada push a
`main`: compila con `npm ci && npm run build` y sube `dist/` por FTP. También se
puede lanzar a mano desde la pestaña **Actions** de GitHub (*Run workflow*), sin
inventar un commit.

**La ruta de destino es `/domains/aprendefae.com/public_html/`, no
`/public_html/`.** aprendefae.com es un dominio adicional de la cuenta, así que
cuelga de `domains/`; `/public_html/` es la raíz del dominio principal. El
primer despliegue fue ahí y salió **en verde con el sitio sin cambiar**: FTP
crea la carpeta que le pidan y no tiene forma de saber que nadie la sirve. Por
eso el workflow imprime su destino en cada ejecución, en el paso *Destino de
este despliegue*.

Nadie sube archivos por el gestor de Hostinger. Lo que está en vivo es siempre
el build que sale de este repositorio, y por eso `dist/` sigue en `.gitignore`:
si se versionara, la versión publicada dependería de quién compiló de último en
su computador.

**Seis secretos del repositorio**, en *Settings → Secrets and variables →
Actions*:

| Secreto | Para qué |
|---|---|
| `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` | La conexión a Hostinger (puerto 21) |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID` | Las mismas tres de `.env.local` |

Las tres `VITE_*` no son opcionales aunque el build funcione sin ellas: Vite las
incrusta **dentro** del bundle al compilar, no las lee del servidor. Sin ellas
el sitio se publica sin inicio de sesión, sin ranking y sin FP.

La subida usa FTP simple, así que la contraseña viaja sin cifrar. Hostinger
admite FTPS explícito en el mismo puerto 21: cambiar `protocol: ftp` a
`protocol: ftps` en el workflow es toda la migración.

## Flujo de navegación

```
HomeScreen (entrada)
├── Macroeconomía  →  índice de temas
│                     └── Demanda Agregada → Dashboard DA-Learn
│                                                        → canales / Ronda Final
└── Pensamiento Estratégico  →  índice de temas
                                ├── Pensamiento Sistémico → comparador lineal / sistémico
                                ├── Modelo del Iceberg    → buceo por niveles + decisión comparada
                                └── Fuerzas de Porter     → radares comparados + termómetro por fuerza
```

Son tres niveles: inicio → materia → tema. Todo el estado vive en `App.jsx` mediante un único `view`; no hay router porque el sitio es de una sola página.

### /privacidad

La política de privacidad es la única URL real del proyecto, porque tiene que enviarse a la verificación de Google OAuth. No es una vista del SPA: se compila como **entrada estática aparte** (`privacidad/index.html` → `dist/privacidad/index.html`) para que la ruta responda en cualquier hosting sin reglas de reescritura.

Como algunos hosts responden a `/privacidad` (sin barra final) con el index del SPA, `main.jsx` reconoce esa ruta y monta la misma página. Con eso la URL muestra la política tanto si el host sirve el archivo estático como si cae al SPA.

El texto de la política es literal y no debe reescribirse al editar el componente.

### Logo y regreso

El logo aparece arriba a la izquierda en todas las páginas y **siempre lleva al inicio**. Resuelve su destino desde `NavigationContext` (`src/navigation.js`), así que ningún sitio donde se usa tiene que pasarle un `onClick`.

| Página | Variante | Convive con botón de volver |
|---|---|---|
| Inicio | `full` (símbolo + wordmark) | — |
| Índice de materia | `symbol` | No: el logo **sustituye** al antiguo botón de volver |
| Página de tema (DA-Learn, Sistémico, Iceberg) | `symbol` | Sí: son dos acciones distintas, separadas por un divisor |

En las páginas de tema, el botón de volver conserva su comportamiento: sube **un** nivel, al índice de esa materia. El logo sale al inicio. Así entrar a un tema nunca es un callejón sin salida y las dos salidas no se confunden.

El favicon usa el corte del símbolo optimizado para 16 px (trazo 3, nodos base 3.8, vértice 4.1) sobre fondo navy, para que se lea igual en pestañas claras y oscuras. Se sirve como SVG con PNG de respaldo desde `public/`.

## Rendimiento de carga

La pantalla de entrada es lo primero que ve el estudiante, así que se carga de forma estática y **no descarga nada de DA-Learn**. Todas las vistas de DA-Learn usan `React.lazy` y llegan bajo demanda:

| Momento | Se descarga |
|---|---|
| Abrir el sitio | Solo el chunk de entrada (~160 kB / 53 kB gzip) |
| Índice de Macroeconomía | Índice + curvas de oferta/demanda (~5 kB) |
| Índice de Pensamiento Estratégico | Índice + Three.js y la escena (~552 kB / 143 kB gzip) |
| Entrar a Demanda Agregada | Dashboard, TopBar y el fondo de curvas (~32 kB) |
| Abrir un tema con gráfica (DA-Learn o Fuerzas de Porter) | Núcleo de Recharts (~360 kB / 101 kB gzip), una sola vez |

Las dos dependencias pesadas —Recharts y Three.js— viven en chunks separados y ninguna entra en la carga inicial. Three.js solo se descarga si el estudiante abre Pensamiento Estratégico; quien vaya directo a Macroeconomía nunca lo pide.

**Nota sobre Fuerzas de Porter.** Sus dos radares usan `RadarChart` de Recharts, que ya era dependencia del proyecto. El costo es que abrir ese tema descarga el núcleo de Recharts (101 kB gzip) para dibujar dos polígonos de cinco puntos. Si ese peso llega a importar, los radares son sustituibles por SVG a mano en `PorterView.jsx` sin tocar el resto: los datos ya están normalizados a una escala 1–5 en `CASE_PAIRS`.

El estado de progreso vive en `App.jsx`, fuera del límite de carga diferida, de modo que salir de DA-Learn y volver a entrar no pierde los puntos.

## Fondos animados

Cada nivel del sitio tiene su propio fondo, y los tres siguen la misma estrategia: animación ligera, tope de fotogramas y una salida estática para hardware limitado.

| Página | Fondo | Fallback estático |
|---|---|---|
| Inicio | Colibrí libando entre flores, en canvas 2D | Un fotograma con el colibrí ya en la flor |
| Índice de Macroeconomía | Curvas de oferta y demanda que derivan y se cruzan, con destello coral en el equilibrio | Un fotograma con el equilibrio ya encendido |
| Índice de Pensamiento Estratégico | Escena Three.js: partida en curso, cámara en órbita lenta, pieza en juego resaltada en teal | Imagen JPEG (`src/assets/chess-fallback.jpg`) |

La lógica compartida está en `src/utils/device.js`.

### Niveles de calidad de la escena 3D

`detectQualityTier()` decide entre tres niveles. Se evalúan **en este orden** y gana el primero que se cumpla:

| Nivel | Condición que lo dispara | Qué se renderiza |
|---|---|---|
| `static` | `prefers-reduced-motion`, **o** sin WebGL, **o** `hardwareConcurrency <= 4`, **o** `deviceMemory < 4` | Imagen fija. No se inicializa WebGL ni se construye geometría. |
| `mobile` | `innerWidth < 700` (y no ser `static`) | Escena completa, `pixelRatio` tope 1.5, sin antialias, sombras 512 px, tope 30 fps. |
| `full` | Todo lo demás | Escena completa, `pixelRatio` tope 2, antialias, sombras 1024 px, fps libre. |

Es decir: la capacidad del equipo decide entre `static` y "escena viva", y el **ancho de pantalla** decide entre `mobile` y `full`. Son dos ejes distintos.

**Limitación conocida de estos umbrales.** No hay detección real de GPU: `hardwareConcurrency` mide núcleos de CPU y `deviceMemory` mide RAM, y esta última solo existe en navegadores Chromium (en Safari y Firefox es `undefined` y cae al valor por defecto). En la práctica **muchos iPhone reportan `hardwareConcurrency = 4`**, así que hoy caerían en `static` aunque su GPU mueva la escena de sobra. Antes de mover el umbral conviene medir en dispositivos reales con el medidor de abajo.

### Medir rendimiento en un equipo real

Abrir cualquier página con `?perf=1` (por ejemplo `https://aprendefae.com/?perf=1`) y entrar a Pensamiento Estratégico. Aparece abajo a la izquierda un recuadro con el nivel activo, los fps actuales, el **mínimo** observado, el punto del bucle y la razón exacta por la que se eligió ese nivel. El medidor no se monta si no está el parámetro.

Si en un teléfono real se ve caída de fps, ajustar en este orden (el primero es el de mayor impacto):

1. Desactivar sombras en la ruta móvil — `renderer.shadowMap.enabled = !narrow` en `ChessBackground.jsx`.
2. Bajar los segmentos de las piezas — el argumento de `buildPieceGeometries()`, hoy 12 en móvil y 18 en escritorio.
3. Frenar o pausar la órbita de cámara en móvil — el factor `0.052` en `placeCamera()`.

En la escena de ajedrez, el fallback es una imagen y no un fotograma renderizado: así un dispositivo de gama baja no llega a inicializar WebGL ni a construir la geometría. Las piezas se generan por código (`chessPieces.js`) con `LatheGeometry` —las piezas de ajedrez reales se tornean— y el caballo se extruye desde una silueta, para no cargar modelos 3D pesados.

## Estructura del proyecto

```
├── index.html              # HTML raíz del SPA, monta la app en #root
├── privacidad/index.html   # entrada estática de /privacidad (segunda entrada de Vite)
├── package.json            # dependencias y scripts (dev/build/preview)
├── vite.config.js          # configuración de Vite + plugin de React + Tailwind CSS
├── src/
│   ├── main.jsx             # entrada del SPA; también reconoce /privacidad si el host cae al index
│   ├── privacidad.jsx       # entrada de la página estática de privacidad
│   ├── App.jsx               # shell/router: decide qué vista mostrar y guarda el progreso de DA-Learn
│   ├── navigation.js          # contexto de navegación de sitio, para que el logo llegue al inicio solo
│   ├── theme.js               # paletas: FAE (marca del sitio) y COLORS (tema de DA-Learn)
│   ├── components/
│   │   │  # --- Nivel sitio: entrada e índices de materia ---
│   │   ├── HomeScreen.jsx      # ensambla fondo + Hero + las dos tarjetas de materia
│   │   ├── Hero.jsx            # titular rotativo (uno al azar por sesión) + subcopy
│   │   ├── SubjectCard.jsx     # tarjeta reutilizable + iconos MacroIcon / EstrategiaIcon
│   │   ├── TopicIndexView.jsx  # plantilla del índice de temas, compartida por las dos materias
│   │   ├── MacroTopicIndex.jsx # índice de Macroeconomía: su contenido y su fondo de curvas
│   │   ├── EstrategiaTopicIndex.jsx # índice de Pensamiento Estratégico: su contenido y la escena 3D
│   │   ├── Logo.jsx            # marca AprendeFAE; siempre clicable, siempre lleva al inicio
│   │   ├── PensamientoSistemicoView.jsx # tema: comparador "Cadena lineal vs Red sistémica"
│   │   ├── IcebergView.jsx     # tema: buceo por los 4 niveles + decisión con punta vs. iceberg
│   │   ├── PorterView.jsx      # tema: radares de dos industrias + termómetro de las 5 fuerzas
│   │   ├── PrivacidadView.jsx  # política de privacidad (texto literal, no reescribir)
│   │   ├── backgrounds/
│   │   │   ├── HummingbirdBackground.jsx # colibrí y flores del inicio
│   │   │   ├── SupplyDemandBackground.jsx # curvas de oferta y demanda
│   │   │   ├── ChessBackground.jsx        # escena Three.js del tablero en juego
│   │   │   └── chessPieces.js             # geometría de las piezas y texturas, generadas por código
│   │   │  # --- DA-Learn (tema: Demanda Agregada) ---
│   │   ├── Dashboard.jsx       # 4 tarjetas de canales y progreso
│   │   ├── ConsumoView.jsx     # vista del canal Consumo (fórmula, gráfica, canasta, faders, quiz)
│   │   ├── InversionView.jsx   # vista del canal Inversión (con la pila de billetes)
│   │   ├── GastoView.jsx       # vista del canal Gasto Público (con la carretera)
│   │   ├── XNView.jsx          # vista del canal Exportaciones Netas (con la balanza)
│   │   ├── FinalView.jsx       # Ronda Final (se desbloquea al completar los 4 canales)
│   │   ├── mecanicas/visuales/ # los cuatro dibujos que responden a los faders
│   │   └── shared/             # piezas de UI reutilizadas entre vistas
│   │       ├── FaeLogo.jsx         # marca AprendeFAE (barras + wordmark)
│   │       ├── BackgroundVeil.jsx  # velo radial sobre el fondo animado, para contraste del texto
│   │       ├── Footer.jsx          # pie mínimo del inicio: solo el enlace a /privacidad
│   │       ├── Fader.jsx           # slider con etiqueta y valor formateado
│   │       ├── BigNumberDisplay.jsx# número grande destacado (ej. total de consumo)
│   │       ├── ProgressBar.jsx     # barra de progreso general
│   │       ├── TopBar.jsx          # barra superior con botón volver y acceso al ranking
│   │       ├── ChannelCard.jsx     # tarjeta de canal en el Dashboard
│   │       ├── ChartBox.jsx        # contenedor con fondo para las gráficas de Recharts
│   │       ├── FormulaCard.jsx     # tarjeta con la fórmula económica y su leyenda
│   │       ├── FormulaTokens.jsx   # tokens tipográficos <V> (itálica) y <Overline> (línea superior)
│   │       ├── QuizBlock.jsx       # quiz secuencial de 5 preguntas usado en los 4 canales
│   │       ├── FinalQuizBlock.jsx  # quiz de una sola pregunta usado en la Ronda Final
│   │       └── NextBackRow.jsx     # par de botones "Volver" / "Siguiente tema"
│   ├── assets/
│   │   └── chess-fallback.jpg # imagen estática de la escena 3D, para gama baja o sin WebGL
│   ├── data/
│   │   ├── heroPhrases.js     # las 5 frases del titular de la entrada + su subcopy
│   │   ├── subjects.js        # qué materias y temas existen de verdad + el texto del estado vacío
│   │   └── quizzes.js         # banco de preguntas (QUIZZES) de DA-Learn
│   ├── utils/
│   │   ├── device.js          # detección de gama baja / reduced-motion / WebGL, común a los 3 fondos
│   │   └── formato.js         # formatCOP, el formato de pesos de DA-Learn
│   └── styles/
│       ├── global.css         # fuentes (Sora/Inter), slider, animaciones y Tailwind CSS
│       └── home.css           # lo que no se puede expresar inline: :hover/:active y los layouts por ancho de pantalla
└── README.md
```

## Notas de implementación

- **Titular rotativo.** `Hero.jsx` guarda el índice elegido en `sessionStorage`, así que no cambia al recargar dentro de la misma sesión, y usa `localStorage` para no repetir el titular de la sesión anterior. Si el almacenamiento falla, cae a un sorteo simple.
- **Fondo del inicio: el colibrí.** `HummingbirdBackground.jsx`, canvas 2D y cero dependencias. Sustituyó a la red de nodos, que era un port del export de Claude Design (sigue en el historial de git).

  Se descartó la ruta de vídeo justamente por ser la portada: un loop presentable son megas, y aquí es donde el peso más duele. El realismo se busca en el comportamiento, no en el detalle. **El ala no se anima batiendo**: un colibrí bate a 50 Hz y el ojo no ve un ala, ve un huso borroso, así que se dibuja el barrido con siluetas superpuestas de alfa bajo. Animar el batido a 30 fps daría un aleteo de dibujo animado. El vuelo estacionario usa dos senos de periodo distinto para que la posición no se repita de forma reconocible, y los traslados van por una Bézier con salida y entrada suaves.

  Las flores viven en la banda baja y los laterales, nunca en la franja del titular: medido, el contraste detrás del titular es de **19,9:1** en todo su ancho, muy por encima del 7:1 que pide WCAG AAA. Comparte los mismos umbrales de gama baja que el resto (`shouldRenderStatic`): en ese caso dibuja un fotograma y no pide `requestAnimationFrame` ni una vez.
- **Estilos.** El diseño se traslada como estilos inline (igual que el export) más `home.css` para los estados `:hover`/`:active`, que no se pueden expresar inline. Cada tarjeta pasa su color de acento por las variables CSS `--fae-card-hover-bg` y `--fae-card-hover-border`.
- **Los faders de DA-Learn tienen un dibujo, no solo una cifra.** "$3.120.000" no significa nada a los 19 años. Cada canal trae una figura que responde al valor en tiempo real y en los dos sentidos: una canasta que se llena y se vacía (Consumo), una pila de billetes que sube y baja (Inversión), una carretera que se pavimenta y se despavimenta (Gasto), y una balanza de dos platos que se inclina hacia lo que Colombia vende o compra afuera (Exportaciones netas). Viven en `components/mecanicas/visuales/`, uno por archivo. Las tres primeras funcionan igual por dentro: cada elemento tiene sitio fijo y solo cambia si está encendido, así que deshacer es el mismo cálculo al revés y no necesita lógica aparte. La balanza no la necesita siquiera: inclinarse a los dos lados es lo que hace una balanza.
- **Los dos icebergs comparten el mismo arreglo de layout.** El corte del iceberg es alto y se comía la pantalla: había que hacer scroll para ver el dibujo o el control, nunca los dos. Se resuelve limitando el alto del SVG desde `home.css` (`.ice-grafico`), no encogiendo el dibujo en el componente. El buceo (`.ice-buceo`) lo apila con su fila de botones; el constructor (`.ice-constructor`) va con una tarjeta de pregunta mucho más alta, así que en pantalla ancha se reparten en dos columnas y en angosta el dibujo queda fijo arriba mientras la pregunta pasa por debajo. Al terminar la mecánica no hay pregunta y el dibujo recupera el ancho completo.
- **Tailwind.** DA-Learn usa clases utilitarias de Tailwind, que en el prototipo original venían preconfiguradas por el entorno de artifacts. Por eso el proyecto incluye Tailwind CSS v4 vía `@tailwindcss/vite`.
