# AprendeFAE

Sitio educativo interactivo para estudiantes de la FAE (aprendefae.com). Dos materias, cada una con sus temas; cada tema se parte en **Aprender** (material explicativo) y **Hacer** (juegos que otorgan FP). Encima de eso hay una capa de progreso —FP, rankings, ligas semanales, racha diaria, repaso espaciado, medallas, avatares y una tienda de Cristales— y un panel para los docentes.

- **Macroeconomía** → cuatro temas construidos: Demanda Agregada, Política Económica, Política Fiscal y Política Monetaria. Más El Repaso Diario, que es transversal.
- **Pensamiento Estratégico** → tres temas: Pensamiento Sistémico, Modelo del Iceberg (con el desafío "El Proyecto del Arca") y Fuerzas de Porter.

Construido con React + Vite. Gráficas con Recharts, 3D con Three.js, íconos con lucide-react, utilidades de estilo con Tailwind CSS. Backend en Supabase (Postgres + Auth de Google).

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (incluye npm). CI usa Node 24.
- Un proyecto de Supabase, si se quiere inicio de sesión, FP y rankings.

---

## Puesta en marcha desde cero

En este orden. Los pasos 3 y 4 son los que la mayoría se salta y los que dejan el sitio a medias.

```bash
git clone <el repo>
cd aprendefae
npm install
cp .env.example .env.local
npm run dev
```

1. **`.env.local` con las tres variables** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID`). Sin ellas el sitio arranca y se puede recorrer entero, pero **sin cuenta, sin FP, sin rankings y sin nada de la capa de progreso**: el control de cuenta no se muestra y nunca se pide entrar.
2. **Google como proveedor en Supabase** → Auth → Providers → Google, con el mismo client id que va en `VITE_GOOGLE_CLIENT_ID`.
3. **Correr las 37 migraciones, en orden.** Ver la sección siguiente. Es obligatorio y no sobra ninguna.
4. **Verificar** con `npm run verificar`, que aplica esas mismas migraciones sobre una base limpia y corre las pruebas SQL contra ella.
5. `npm run dev` → `http://localhost:5173`.

Opcional, y solo si hace falta panel docente: dar de alta la fila del profesor en la tabla `docentes` desde el panel de Supabase. No hay forma de auto-inscribirse.

---

## Las migraciones: todas, en orden, de la 0001 a la 0037

Viven en `supabase/migrations/` y **se corren a mano en el SQL Editor de Supabase**, una por una, en orden numérico ascendente. Hoy son **37 archivos, de `0001_profiles.sql` a `0037_avatar_en_ranking_y_liga.sql`**.

### El orden no es una convención: es una dependencia

Las migraciones no son 37 piezas independientes que se puedan aplicar sueltas. Muchas **reescriben o retiran lo que dejó una anterior**, así que saltarse una o cambiar el orden deja la base rota o, peor, incoherente sin error visible. Cuatro hechos comprobados de esa cadena:

- **`registrar_fp` se define en ocho migraciones distintas.** Nace en la 0003 y se reescribe en la 0007 (racha), la 0011 (el cálculo pasa al servidor), la 0014 (desafíos de varias etapas), la 0017 (detalle por ítem, cuarto parámetro), la 0028 (partida en curso), la 0033 (renovable a diario) y la 0036 (cierre de liga, Cristales de racha y contador de actividades). Cada una parte de la versión que dejó la anterior, así que la última no se puede aplicar sola.
- **Hay migraciones cuyo único trabajo es borrar lo de antes.** La 0011 añade la función nueva *al lado* de la vieja para no dejar a nadie sin FP durante el despliegue; la **0012** es la que retira la vieja. La **0018** retira la firma de tres argumentos que la 0017 dejó conviviendo con la de cuatro.

  **Saltarse la 0012 no da ningún error** —se comprobó aplicando las otras 36 sobre una base vacía— y deja **dos firmas vivas de `registrar_fp`**: exactamente el incidente que dejó a seis actividades sin pagar FP en producción, donde nada falló y lo notó un estudiante jugando. Es el mejor argumento de por qué el orden completo no es negociable: la base no se queja.
- **Empezar por la que no es revienta en seco.** Correr la 0002 sobre una base vacía falla con `function public.nickname_disponible(text) does not exist`, porque esa función la crea la 0001.
- **`ranking_fp` y `liga_tablero` se redefinen al final.** La 0037 hace `drop` + `create` sobre funciones que definieron la 0004 y la 0026, y vuelve a conceder los permisos que el `drop` se llevó — sin eso, quedarían ejecutables por `anon`. Por eso va después de las dos.

Cada archivo declara en su cabecera si es idempotente (casi todos lo son: se pueden correr dos veces sin daño) y **después de cuál va**. Lo idempotente permite repetir; no permite reordenar.

### Cómo comprobar que quedaron aplicadas

`npm run verificar` aplica los 37 archivos en orden sobre una base vacía y luego comprueba que las piezas centrales existan —doce tablas y veintinueve funciones, listadas en `.github/workflows/base.yml`—. CI hace lo mismo en cada push. Lo que **ninguno de los dos puede saber** es si alguien las pegó de verdad en el editor de Supabase: un despliegue de código sin su migración sale verde en Actions y roto en el sitio. Eso lo caza la sonda de postdespliegue (ver *Despliegue automático*).

### Qué trae cada tramo

| Migraciones | Qué montan |
|---|---|
| 0001–0002 | `profiles`, índice único de apodo, RLS y sus políticas, `nickname_disponible`, y el cierre de las RPC a visitantes anónimos |
| 0003–0004 | `fp_history` y `ranking_fp` (diario, semanal, semestre) |
| 0005 | Panel docente: nombre real, lista blanca `docentes`, funciones de grupo |
| 0006 | Ligas: `liga_membresia`, `liga_ciclo`, siembra y tablero |
| 0007, 0010 | Racha diaria y su animación una vez al día |
| 0008–0009 | Ánimo entre estudiantes, hechos para medallas, resumen de semestre |
| 0011–0012 | **El cálculo de FP pasa al servidor**, y se cierra la puerta vieja |
| 0013–0018 | Desafíos de varias etapas, detalle por ítem, altas de catálogo, cierre de la firma de tres |
| 0019–0021, 0023–0024 | El panel docente por estudiante, por actividad y por ítem |
| 0020 | Cuentas de prueba fuera de los agregados del panel |
| 0022, 0029–0031 | Los juegos de Demanda Agregada y Política Fiscal, los cuatro bloques llenos, y Política Monetaria |
| 0025–0027 | Contexto de liga, techo de cuatro niveles y partición |
| 0028 | Partida en curso de El Arca |
| 0032 | Un estudiante solo puede escribir su apodo y su nombre real |
| 0033 | El Repaso Diario |
| 0034 | El momento de racha (teseracto + calendario semanal) |
| 0035–0036 | Avatares, Cristales, y el cierre semanal de ligas con podio pagado |
| 0037 | El avatar viaja en las filas del ranking y de la liga |

---

## Cómo funciona el inicio de sesión

- **Nunca bloquea.** Se puede recorrer todo el sitio sin cuenta. El diálogo aparece solo al ganar un punto o al abrir el ranking, y cerrarlo no interrumpe nada.
- **Botón oficial de Google.** Lo dibuja la librería de Google (Identity Services) con `theme: filled_black` y `shape: pill`. No se recrea con CSS, porque eso incumple las normas de marca de Google. Si la librería no carga o falta `VITE_GOOGLE_CLIENT_ID`, se ofrece un enlace de texto que hace el mismo login por redirección — sin imitar el botón.
- **Primer ingreso.** Si no hay fila en `profiles`, el paso de apodo es obligatorio y no se puede cerrar. El apodo es lo único que se muestra en los rankings; el nombre real solo lo ve un docente autorizado.
- **Sesión persistente.** `persistSession` y `autoRefreshToken` mantienen la sesión entre visitas.
- **El hash de OAuth no es una ruta.** El login por redirección vuelve con el token en el hash (`#access_token=…`), que es donde también vive la ruta del sitio. Por eso `src/ruta.js` solo interpreta como ruta lo que empieza por `#/`, y deja lo demás intacto para que Supabase lea su token y lo limpie.

---

## FP: el puntaje académico

El camino es: la actividad llama a `registrarActividadCompletada(clasificacion, contexto)` → se manda **lo que pasó** (qué actividad, cuánto tardó, qué porcentaje acertó) → la función SQL `registrar_fp` **calcula los puntos con su propio catálogo**, inserta en `fp_history` y suma a `profiles.points` en la misma transacción.

**El cálculo está en el servidor desde la migración 0011.** Antes vivía en el navegador y el número que salía era el que la base guardaba sin comprobar: con el ranking dando puntos de parcial, eso era una puerta abierta. Hoy el cliente no decide nada, ni siquiera cuántas veces se ha completado antes una actividad — eso también lo cuenta el servidor.

`src/fp/motor.js` **ya no calcula nada en producción**: se conserva como la referencia legible de las reglas, y la prueba de la migración compara las dos implementaciones para que no se separen en silencio. Si se cambia una regla, se cambian las dos.

Las reglas, tal como están hoy:

| Dificultad | FP base |
|---|---|
| Fácil | 10 |
| Medio | 25 |
| Difícil | 50 |
| Experto | 90 |

- **Modalidad.** `exploratoria` paga la base por terminar; `evaluativa` escala por aciertos con piso del 50%.
- **Desafíos de varias etapas.** Base × número de etapas, con tope en cuatro. Es regla general, no una excepción escrita para El Arca. Cómo se reparte entre etapas no lo decide el motor: la mecánica pondera y entrega un solo porcentaje ya combinado.
- **Defensa de tiempo.** Por debajo de un mínimo por dificultad se recorta. Los umbrales (`TIEMPO_MINIMO_MS`) **siguen siendo provisionales** y están agrupados en un solo sitio para poder ajustarlos.
- **Repetición: la primera vez paga completo, las demás no pagan nada.** No hay escalón intermedio. Volver a jugar sigue permitido —no se restringe— simplemente deja de dar puntos desde la segunda vez. La excepción es la marca `renovable_diario`, hoy solo del Repaso Diario: cuenta solo las veces de **hoy** en Bogotá, así que mañana vuelve a pagar completo.
- **FP nunca se resta, nunca se gasta, nunca baja.** Es una invariante del sistema, escrita tanto en `src/cristales/cristales.js` como en la migración 0035.

Las mecánicas calculan su desempeño como **porcentaje (0–100)** y lo pasan en `contexto.porcentajeAciertos`. La conversión a la proporción 0–1 ocurre en `registrarActividad.js`, **una sola vez**, para que ninguna mecánica pueda equivocarse de escala. `fp_history` guarda `subject_id` desde el principio; `fp_detalle` guarda qué ítem se falló.

Una actividad de tipo **Aprender** sale por la primera guarda y nunca llega al motor: el material no otorga FP, nunca.

---

## Rankings de FP

Tres periodos —diario, semanal y de semestre— en dos emplazamientos: el ranking **por materia** vive en el índice de temas de cada materia, y el **general** en la página de perfil.

**Por qué es una función SQL y no una consulta del cliente.** Las políticas RLS de `fp_history` solo dejan ver las filas propias, así que un `select` desde el navegador jamás podría sumar los FP de los demás. `ranking_fp` corre como `security definer` para agregar sobre toda la tabla, pero devuelve únicamente apodo, FP, posición y —desde la 0037— la combinación de avatar: nunca filas de historial ajenas, ni correos, ni nombres reales.

**Las ventanas de tiempo se calculan en horario de Bogotá, no en UTC.** Con UTC el ranking diario se reiniciaría a las 7 p.m. hora local. La semana va de lunes a domingo (`date_trunc('week')`), y es el mismo corte que usan las ligas y el Repaso: una sola regla de zona horaria para todo el sitio.

La consulta se hace al entrar y al cambiar de pestaña; no hay suscripción en vivo.

---

## Ligas

Capa competitiva **encima** de los rankings: aquellos ordenan a toda la materia, esto reparte a la gente en grupos parecidos para que competir tenga sentido cuando el grupo crece.

**Encendidas solo donde ya circulan FP de verdad.** `MATERIAS_CON_LIGAS` en `src/ligas/ligas.js` es hoy `["pensamiento-estrategico"]`. Añadir una materia es meter su id en esa lista.

### Niveles

Cuántos hay lo decide el número de activos, y **cuatro es el techo**: si la adopción crece, los grupos se hacen más grandes en vez de aparecer un quinto nivel.

| Activos | Niveles | Nombres (siempre asignados de abajo arriba) |
|---|---|---|
| < 20 | 1 | sin nombre: un solo nivel no tiene arriba ni abajo |
| 20 – 59 | 3 | Emergente · Intermedio · Avanzado |
| 60 o más | 4 | Emergente · Intermedio · Avanzado · Élite |

Asignar siempre desde abajo es lo que hace que abrir Élite no le cambie el nombre a nadie: le cambia su número de liga, no la palabra que ve.

Los umbrales están **a la vez** en `src/ligas/niveles.js` y en la función SQL `ligas_para()` de la 0026, porque SQL no lee JavaScript. `niveles.test.mjs` lee la migración y falla si los dos lados dejan de coincidir.

### El ciclo semanal y su cierre

- El ciclo corta el **lunes a las 00:00 de Bogotá** (`ciclo_actual()`, migración 0006).
- **No hay tarea programada.** Ni `pg_cron` ni nada con horario: el cierre lo dispara, de forma perezosa, el primer evento de FP que ocurra después del corte. El que dispara no se perjudica — el cierre corre *antes* de escribir su fila, así que su actividad cuenta para el ciclo que empieza.
- La 0036 añadió `liga_cierre` (un cierre por liga y ciclo, con la clave primaria como guarda: dos estudiantes que disparen a la vez no pueden pagar el mismo podio dos veces, y no porque el código lo mire antes, sino porque la base no deja entrar la segunda fila) y `liga_resultado` (la posición final de cada quien, guardada). **Se paga contra esa fila, nunca contra un recálculo en caliente.**
- `ligas_cerrar_semana` cierra los ciclos pendientes **en secuencia**, uno por uno, para que el ascenso y el descenso de cada semana intermedia ocurran de verdad.
- El **podio** es proporcional al tamaño de la liga, con suelo de dos: `max(2, round(n × 0,28))`. Paga Cristales: 15 / 10 / 7 al 1º, 2º y 3º, y 5 del cuarto puesto en adelante.

El tablero (`liga_tablero`) devuelve el podio y la fila de quien pregunta; la posición exacta de quien no sale en el podio solo llega a su dueño. Desde la 0037, cada fila trae también el avatar puesto (24 px en el podio).

---

## Racha diaria

`profiles.streak` sube con cualquier actividad que otorgue FP. Los hitos que pagan bono son **3, 7, 14 y 30 días** (los valores, en la migración 0007; los Cristales de cada hito, en la 0035).

**La caducidad se resuelve al leer, no con una tarea nocturna.** `rachaVigente()` vale la guardada si la última actividad fue hoy o ayer; si pasó un día completo en blanco, es 0. No hay nada que ejecutar y nada que pueda fallar mientras nadie mira, y el resultado es el mismo. El récord no caduca: es historia.

### El momento de racha: el teseracto

Una vez al día, y solo si la racha avanzó, aparece a pantalla completa un **teseracto** (hipercubo 4D en Three.js) que revela aristas conforme sube la racha, junto a un calendario de la semana.

- **32 aristas, 30 días.** `aristasReveladas(día) = round(día × 32 / 30)`, con tope en 32. Si cambian los hitos, se cambia una constante y todo lo demás se recalcula.
- Se revelan **en tres fases**: el cubo exterior entero (1–12), el interior entero (13–24) y las ocho conexiones entre ambos (25–32) — que son las que hacen que se lea como teseracto y no como dos cubos sueltos, y llegan al final.
- Completado el día 30, la figura gana "riqueza" —más brillo en vértices y aristas, giro más amplio— durante otros 30 días.
- **Las tres reglas —una vez al día, solo si la racha avanzó, solo con sesión— las sella el servidor** en `racha_momento()` (0034): decide, marca como visto y devuelve la semana en una sola llamada.
- **Nunca se pregunta con la pestaña oculta.** Preguntar *es* gastar el momento del día, porque el servidor lo marca en la misma llamada. Si el estudiante cambió de pestaña o bloqueó el teléfono al terminar, la pregunta queda pendiente y se hace al volver a verse. (Pasó de verdad: el día quedó marcado y nadie vio el teseracto.)
- Tras un FP se espera a que termine el cierre de la actividad: el teseracto es el único protagonista de su momento.
- Three.js **entra con `lazy`**: no se descarga hasta el día en que el momento se muestra.

---

## El Repaso Diario

Una actividad **transversal**: da FP pero no pertenece al camino de ningún tema, así que ningún camino ni bloque la pinta y las medallas de "materia completa" no la cuentan. Se entra desde su banner en el índice de Macroeconomía.

- **Renovable a diario.** Paga la primera vez de cada día de Bogotá; las siguientes del mismo día, no.
- **Diez ítems**, sorteados de un pool que se arma **leyendo los bancos de las actividades de origen**. No hay ni una copia de contenido: si Gen corrige un texto en el banco, el Repaso lo enseña corregido sin tocar nada más.
- **El pool sale de cuatro temas de Macro**: Política Económica, Demanda Agregada, Política Fiscal y Política Monetaria (`MATERIAS_DEL_POOL`). Dónde aparece la entrada y qué alimenta el pool se deciden en sitios distintos, a propósito.
- **Desbloqueo:** 3 actividades completadas y un pool de al menos 10 ítems.

El sorteo va por prioridad, con cupos, y lo que un cupo no llena pasa al siguiente:

| Prioridad | Criterio | Cupo |
|---|---|---|
| 1. Fallados | último resultado mal | 4, el más viejo primero |
| 2. Olvidándose | último bien, hace 7 días o más | 3, el más viejo primero |
| 3. Frescos | último bien, hace menos de 7 días | 3, el más viejo primero |
| 4. Sin ver | ítems del pool que nunca salieron | al azar |
| 5. Repetir | lo visto que quedó fuera | el más viejo primero |

Hay un **tope por materia** (4; 5 con exactamente dos materias completadas; ninguno con una sola) para que un repaso no sea monotemático. Si con el tope no se llega a diez y el pool tiene más, un último paso lo ignora y lo deja dicho en el resultado. **El orden de presentación es aleatorio**: la prioridad decide *qué* sale, nunca en qué orden.

**La clave de historial** es `actividad:item_id`, con el mismo `item_id` que la actividad de origen manda a `fp_detalle`. Así un ítem visto en su actividad y el mismo ítem visto en el Repaso son un solo historial, sin tabla nueva. Se sortea **por clave y no por ítem**: en el Electrocardiograma una clave son dos lecturas del mismo término, y de esa unidad sale una sola.

**El banner** (`src/components/repaso/BannerRepaso.jsx`) es la entrada: una franja de ancho completo sobre la rejilla de temas del índice de Macroeconomía, fuera de la rejilla —no es un tema y no tiene forma de tema—. Enseña el estado **sin entrar**: pendiente, ya hecho hoy, o bloqueado. Al tocarlo **se expande donde está**, con el mismo patrón que la tarjeta partida de Aprender/Hacer, y no navega: dentro están los temas que entran hoy, cuántos ítems, cuántos FP y el botón de empezar.

Los temas que anuncia son **los mismos que saldrán** en la partida, porque el barajado va sembrado con el estudiante y el día de Bogotá (`vistaPreviaDelDia` en `src/repaso/seleccion.js`): la previa y la partida sortean dos veces y coinciden. Sin eso el banner prometería unos temas y saldrían otros.

---

## Avatares, Cristales y Tienda

### El avatar

Generador **paramétrico**: **5 formas × 4 paletas × 4 niveles = 80 combinaciones**, todas calculadas, ninguna dibujada a mano. Portado tal cual del kit de diseño (`src/avatar/generador.js`); quien quiera cambiar el aspecto cambia el kit y se vuelve a portar.

- Formas: Decaedro, Prisma, Núcleo, Red, Cuña.
- Paletas: Nocturno, Marea, Brasa, Aurora. *(Hay una quinta, `comparacion`, que es el gris de las miniaturas de la pestaña "Forma" y **nunca** es elegible: allí se compara geometría, y pintarlas con la paleta puesta haría que se eligiera por color.)*
- Niveles: I Línea · II Nodos · III Facetado · IV Brillo. El I es de todos desde el primer día y no se compra.
- **Por debajo de 40 px se retira el adorno fino** (los dos anillos del halo y las cuerdas internas): a 36 px en el ranking y 24 px en el podio no se leen y se convierten en una sombra sucia. El nivel sigue siendo el que es.

El avatar se guarda **en cada toque** del selector, sin botón de guardar. Las columnas no se abren por `grant`: `avatar_level` solo es válido si ese nivel está comprado, y un grant por columna no sabe comprobar nada —concede o no concede—. Se escriben solo por `avatar_elegir()` y `comprar_nivel_avatar()`.

### Los Cristales

La **segunda moneda, y la única que se gasta**.

| | FP | Cristales |
|---|---|---|
| Qué es | puntaje académico | moneda |
| Para qué | ranking, ligas, bono de nota | comprar en la Tienda |
| Se gasta | **nunca** | sí, y solo ahí |

**No hay conversión entre los dos, en ninguna dirección.** No es que falte: es que no debe existir. Un tipo de cambio convertiría el puntaje académico en poder de compra y la Tienda en una razón para farmear FP.

Cómo se ganan (la tabla está siempre a la vista en la Tienda: un precio sin forma de conseguir el dinero es una pared):

| Fuente | Cristales |
|---|---|
| Racha de 3 / 7 / 14 / 30 días | 5 / 10 / 20 / 50 |
| Cada 5 actividades **distintas** | 20 (repetir una que ya hiciste no cuenta) |
| Podio semanal de liga | 15 / 10 / 7, y 5 del 4º en adelante |

Qué cuesta: nivel II **60**, nivel III **150**, nivel IV **300**.

Los precios están a la vez en `src/cristales/cristales.js` (para pintar la Tienda) y en la 0035 (para cobrar de verdad). `cristales.test.mjs` lee la migración y falla si se separan. **Quien manda es la base**: el saldo se descuenta en la misma sentencia que comprueba que alcanza, así que dos toques seguidos no pueden dejarlo en negativo ni cobrar dos veces.

**Las medallas no pagan Cristales hoy**, y no es un olvido: no existe ningún momento en el servidor en que se otorgue una medalla —se derivan al leer— así que no hay dónde enganchar el pago. Por eso no aparecen en la tabla de fuentes.

---

## Medallas, resumen de semestre y ánimo

- **24 medallas** (`src/data/medallas.js`). Casi todas se calculan al vuelo desde `logros()`, sin tabla de "medallas ganadas": si el criterio cambia, todo el mundo queda recalculado en vez de arrastrar filas otorgadas con una regla vieja. La excepción es "Materia completa", que se arma en el cliente porque depende de cuántas actividades tiene cada materia, y eso vive en `subjects.js`. Algunas están marcadas `"pendiente"`: tienen diseño pero **no** condición definida, salen en el perfil atenuadas y no se ganan. No se les inventa una regla.
- **"Materia completa" mide solo la mitad Hacer**, y el título lo dice sin letra pequeña: la mitad Aprender no se puede exigir porque hoy no deja rastro en ninguna parte.
- **Resumen de semestre.** FP del semestre, temas completados **siempre por materia** (un "4 temas" sin desglose no dice si fueron cuatro de una o dos y dos), racha máxima del semestre y posición de liga del último ciclo **cerrado**. Con actividad nula no hay tarjeta.
- **Ánimo.** Reacción ligera entre estudiantes, uno por apodo y por ciclo semanal. **Se dirige por apodo, nunca por id** —el cliente jamás conoce el `user_id` de otra persona— y **quién lo dio no se sabe**: la función de lectura no devuelve emisores, así que no hay forma de averiguarlo ni inspeccionando la red. El límite semanal lo impone la clave primaria de la tabla, no el cliente: aunque alguien llame la RPC a mano, la segunda vez no entra.

---

## Panel docente

Es la primera vez que un usuario del sitio puede ver datos de **otro** usuario, y la puerta se abre estrecha:

1. La autorización es una **lista blanca** (`docentes`) que se administra a mano desde Supabase. No hay forma de auto-inscribirse. Es una tabla y no una constante en el código para que dar acceso a un profesor no exija un despliegue.
2. **Nadie lee las tablas directamente**: todo pasa por funciones que comprueban la lista antes de devolver una sola fila. Sin autorización, Postgres responde con error de permisos (42501), no con datos.
3. Un docente autorizado ve el progreso y el nombre real, **nunca el correo**. La columna `materias` acota qué puede ver cada quien.

En el cliente, **el defecto ante cualquier fallo es "no es docente"**: sin sesión, con la llamada rota o con la red caída, siempre lo cerrado. Un enlace que no aparece no le rompe el día a nadie; uno que aparece de más enseña que existe una pantalla que no debería. La respuesta se guarda por sesión y solo se vuelve a preguntar si cambia la cuenta.

Qué muestra: resumen de cabecera con el delta desde la última visita, censo por estudiante con alertas, **vista por actividad** (cómo le fue al grupo en *esa* actividad, con bandas de desempeño), detalle por ítem, destacados y exportación a CSV. Se entra desde el atajo de la cabecera, desde el perfil, o desde el enlace "ver el rendimiento del grupo" de cada actividad — que lleva `#/docente/<actividad>` y abre el panel con ella puesta.

**Las cuentas de prueba se excluyen de los agregados** (migración 0020), y se excluyen **en el servidor**: si se filtrara en el cliente, cada consumidor nuevo tendría que acordarse y el primero que se olvidara volvería a contaminar los promedios sin que nada fallara. La fila sigue apareciendo en el censo, marcada — si desapareciera, un docente que sabe que alguien jugó y no lo encuentra concluye que el panel está roto.

**Los umbrales de alertas son provisionales.** Viven juntos y en el cliente (`src/docente/alertas.js`) precisamente para que calibrarlos sea cambiar un número y no migrar la base. Los cortes de banda se **importan** de donde ya estaban decididos en vez de copiarse; el lado SQL no puede importarlos, y por eso una prueba lee la migración 0021 y falla si los números de los dos lados se separan.

---

## El contenido: qué existe de verdad

`src/data/subjects.js` es la **única fuente de verdad** de qué existe. Si algo no está ahí, no se muestra. Añadir una actividad es agregarla a esa lista con su clasificación: no hay que tocar componentes.

| Materia | Tema | Aprender | Hacer | Desafío |
|---|---|---|---|---|
| Macroeconomía | Demanda Agregada | 3 | 12 | — |
| | Política Económica | 3 | 12 | — |
| | Política Fiscal | 1 | 12 | — |
| | Política Monetaria | 3 | 12 | — |
| Pensamiento Estratégico | Pensamiento Sistémico | 1 | 1 | — |
| | Modelo del Iceberg | 1 | 7 | El Proyecto del Arca |
| | Fuerzas de Porter | 2 | 1 | — |

Más **El Repaso Diario**, transversal, que no pertenece a ningún tema.

**La clasificación la define Gen (pedagogía), no el código.** Aquí solo se transcribe, y la interfaz la refleja sola. Una actividad sin `clasificacion` es una que todavía no se ha clasificado: no lleva insignia y no se conecta a FP. Es un estado válido y deliberado, no un olvido — por eso se representa con la ausencia del dato y no con un caso especial en el código.

### Aprender y Hacer

La tarjeta de tema **se parte en dos al tocarla**, sin navegar: el título se desvanece y en su lugar entran "Aprender" y "Hacer", que ya sí llevan a la vista filtrada. Es una tarjeta en otro estado, no un diálogo encima: no hay velo ni salto de posición, y el resto de la rejilla no se mueve. Una opción sin actividades de ese tipo se muestra igual, deshabilitada: un tema a medio construir se ve a medio construir.

### El camino de "Hacer"

La mitad Hacer se dibuja como un camino serpenteante partido en **cuatro bloques de dificultad**, siempre en este orden:

| Bloque | Dificultad |
|---|---|
| Cimientos | Fácil |
| Aplicación | Medio |
| Análisis | Difícil |
| Maestría | Experto |

No hay una lista de qué actividad va en qué bloque: **el bloque sale de la dificultad** que la actividad ya trae en el catálogo. Un bloque vacío no se pinta —ni título, ni separador, ni hueco—, y eso sigue siendo la regla para cualquier tema que no los llene: un bloque vacío no es un fallo. Hoy los cuatro temas de Macroeconomía los llenan con la misma distribución —**2 Fácil, 3 Medio, 4 Difícil y 3 Experto**— desde la 0030 (los tres primeros) y la 0031 (Política Monetaria).

**Ningún nodo se bloquea, nunca.** La inspiración visual es Duolingo, pero eso no se copia: el camino ordena y sugiere un recorrido, no lo impone. Se puede saltar del nodo 2 al 9 sin fricción. Que un nodo esté sin hacer cambia cómo se ve, jamás si se puede pulsar.

**Ni una medida del camino es fija**: separación, radio, grosor y amplitud del serpenteo salen todos del número de nodos, con topes por arriba y por abajo, para que se vea intencionado con uno o con quince.

**Los rótulos van en HTML, no dentro del SVG.** El SVG escala con el ancho y el texto escalaba con él: medido a 375 px, los nombres caían a 7,4 px y subir el tamaño no arreglaba nada. Ahora el SVG dibuja solo lo que puede escalar —línea, círculos, números— y los rótulos son HTML con píxeles de verdad colocados encima. **El texto nunca baja de 12 px a ningún ancho**; si no cabe, parte la línea en vez de encogerse.

**Los desafíos no forman parte del recorrido.** No se numeran en el camino, no cuentan para "tema completo" ni para las medallas de materia, y no suman en el contador de la tarjeta partida. Si contaran, un desafío opcional se volvería requisito para cerrar el tema.

### El cierre de una actividad

Al terminar, la celebración es proporcional a la dificultad: Fácil un destello, Medio una ráfaga corta de partículas, Difícil la silueta de la insignia empezando a asomar, Experto la insignia revelada entera y un efecto breve a pantalla completa. Es la insignia del juego de medallas, con el icono de la propia actividad, no una celebración paralela. **No atrapa a nadie**: es una capa sin eventos de puntero, no toma el foco y se va sola, así que se puede tocar "Jugar otra vez" mientras suena. Con "reducir movimiento" no se anima nada: se ve el estado final el mismo rato.

### Una presentación para proyectar

`src/components/presentacion/` es la excepción al resto del sitio: no la usa un estudiante con el teléfono, la proyecta un profesor y la avanza mientras habla. Los tamaños van en **vh y no en px**, porque lo que decide si se lee desde la sexta fila es qué fracción del alto de la **imagen** ocupa una letra. El suelo es 3 vh (unos 32 px a 1080p); el suelo del resto del sitio sería un 1 % de la imagen y no se leería desde la mitad del aula. Y si no cabe, encoge: con un mando no se puede desplazar. Hoy la usa la clase de Política Fiscal.

---

## Verificar antes de subir

```bash
npm run verificar
```

Ejecuta aquí el workflow «Pruebas» de GitHub —las pruebas de JavaScript (hoy **390**), el build, **las 37 migraciones aplicadas desde cero sobre una base vacía** y todas las pruebas SQL— con los mismos pasos de `.github/workflows/base.yml`, sobre PGlite, un Postgres que corre dentro de Node. Tarda unos cuatro minutos y sale en rojo si algo falla.

Solo la parte de SQL:

```bash
npm run verificar -- base-de-datos
```

**Es para antes de cada push, no en vez del CI.** El veredicto que manda es el de Actions. Aquí es PostgreSQL 18.3 y no 16, el `psql` es una emulación escrita para el proyecto y no hay runner de GitHub (`npm ci` no se ejecuta, así que un lockfile roto pasa aquí y falla allí). La lista completa está en la cabecera de `scripts/verificar/verificar.mjs`.

Existe porque tres fallos llegaron a producción —un factor ×100, dos firmas vivas de `registrar_fp`, una columna ambigua— y la causa común fue **SQL que nadie había ejecutado**.

### Qué no cubre ninguno de los dos

Escrito aquí porque, si no se escribe, alguien va a suponer que sí:

1. **Nada del cliente.** Ni React, ni el enrutador, ni que una vista pinte lo que dice. Las pruebas de JavaScript miran lógica pura y datos.
2. **Nada de PostgREST.** La resolución de firmas, la caché de esquema y el mapeo de errores a HTTP son suyos. Eso lo mira la sonda de postdespliegue.
3. **Nada de la autenticación real.** Ni Google, ni la verificación de firmas del JWT, ni la redirección. Ver `supabase/ci/00_auth_de_mentira.sql`.
4. **No sabe si la migración se aplicó en producción.** Comprueba que la secuencia de archivos reconstruya la base; que alguien la haya pegado en el editor de Supabase es otra cosa.
5. **No mide rendimiento.** Una consulta que tarde diez segundos pasa igual.

### Verificar RLS

`supabase/tests/rls_profiles_test.sql` comprueba el aislamiento entre estudiantes. No necesita contraseñas ni iniciar sesión con Google: suplanta el JWT dentro de una transacción, que es como Postgres resuelve `auth.uid()`. Crea sus propios usuarios dentro de la transacción, así que se corre tal cual en el SQL Editor, y CI la corre en cada push.

Corre **diecisiete chequeos** (numerados 0 a 16): RLS encendida y forzada, cada estudiante ve solo su fila, no puede leer ni modificar la ajena, no puede crear filas a nombre de otro, no puede tomar el apodo de otro, **no puede subirse FP ni racha ni crear su perfil con FP** —el cierre por columna de la 0032— y un visitante anónimo no ve nada. Termina en `ROLLBACK`, así que no deja rastro. Todos deben decir `PASA`.

Verificado contra el proyecto el 2026-09-01, cuando eran nueve. A eso se suman cinco chequeos desde fuera, hechos con la anon key (los permisos de un visitante sin sesión): la tabla existe, un anónimo no lee ni escribe perfiles, `nickname_disponible` le está cerrada, y Google figura como proveedor activo.

**Cuidado con los privilegios por defecto de Supabase.** Conceden `EXECUTE` sobre las funciones nuevas del esquema `public` a `anon` y `authenticated`. Un `revoke ... from public` **no** elimina esa concesión a `anon`: hay que revocar a `anon` explícitamente, que es lo que hace la 0002 — y lo que la 0037 tiene que volver a hacer, porque un `drop` + `create` devuelve la función a su estado por defecto.

Las demás pruebas SQL viven en `supabase/tests/` (22 archivos en total) y cubren ligas, cierre semanal, Cristales, el avatar en el ranking, racha, repaso, detalle por ítem y el panel docente. **CI corre 20 y excluye dos a propósito**, no con un filtro silencioso:

- `destacados_hoy.sql` no es una prueba: cuenta cuántos estudiantes califican hoy para cada señal. No afirma nada.
- `cuentas_prueba_test.sql` afirma que una cuenta concreta quedó marcada por la 0020, y eso solo es cierto **en producción**. Ablandarla para que aquí dijera "no aplica" la dejaría de detectar el día que allí se desmarque — que es el único sitio donde importa. Se corre a mano contra Supabase.

Cómo se decide que una prueba falla: los archivos no devuelven código de salida, imprimen una tabla y un veredicto. Basta una de tres condiciones para el rojo — que `psql` salga con código distinto de cero, que la salida traiga `FALLA`/`FALLO`, o que **no traiga ningún veredicto**. La tercera es la que evita el verde por accidente: un archivo que se corta a la mitad no imprime `FALLA`.

---

## Despliegue automático

`.github/workflows/deploy.yml` publica el sitio en Hostinger en cada push a `main`: compila con `npm ci && npm run build` y sube `dist/` por FTP. También se puede lanzar a mano desde **Actions** (*Run workflow*), sin inventar un commit.

**La ruta de destino es `/domains/aprendefae.com/public_html/`, no `/public_html/`.** aprendefae.com es un dominio adicional de la cuenta, así que cuelga de `domains/`. El primer despliegue fue a la raíz equivocada y salió **en verde con el sitio sin cambiar**: FTP crea la carpeta que le pidan y no tiene forma de saber que nadie la sirve. Por eso el workflow imprime su destino en cada ejecución.

Nadie sube archivos por el gestor de Hostinger. Lo que está en vivo es siempre el build que sale de este repositorio, y por eso `dist/` sigue en `.gitignore`: si se versionara, la versión publicada dependería de quién compiló de último en su computador.

**Seis secretos del repositorio**, en *Settings → Secrets and variables → Actions*:

| Secreto | Para qué |
|---|---|
| `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` | La conexión a Hostinger (puerto 21) |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID` | Las mismas tres de `.env.local` |

Las tres `VITE_*` no son opcionales aunque el build funcione sin ellas: Vite las incrusta **dentro** del bundle al compilar, no las lee del servidor. Sin ellas el sitio se publica sin inicio de sesión, sin ranking y sin FP.

La subida usa FTP simple, así que la contraseña viaja sin cifrar. Hostinger admite FTPS explícito en el mismo puerto 21: cambiar `protocol: ftp` a `protocol: ftps` en el workflow es toda la migración.

### La sonda de postdespliegue

Después de subir, el workflow comprueba que **`registrar_fp` resuelva a una sola firma**. Existe por un incidente real: con dos firmas vivas, PostgREST devolvía `PGRST203` sin ejecutar nada y los estudiantes veían su porcentaje sin recibir FP. Nada falló —ni el build, ni el despliegue, ni el sitio—; se descubrió porque alguien lo notó jugando.

| Respuesta | Qué significa |
|---|---|
| `PGRST203` | dos firmas vivas. **Rojo**: quien la llame así no obtiene nada |
| `PGRST202` | no encuentra la función. **Rojo**: o se revirtió una migración, o **se subió código sin correr su migración** |
| `42501` | resolvió una sola y paró en la guarda de permisos. **Alcanzable**, que no es lo mismo que correcta: el cuerpo no se ejecutó |
| cualquier otra | desconocido, y desconocido no es OK. **Rojo** |

Va **después** de la subida a propósito: una base rota no es motivo para no publicar el frontend, porque la versión anterior tampoco funcionaría; lo que hace falta es que la ejecución quede en rojo y se vea. No puede escribir nada: va sin `Authorization`, así que el rol es `anon`.

**Correrla a mano después de aplicar una migración que toque una función** (Actions → Desplegar a producción → Run workflow). Ese es exactamente el momento en que se rompió, y el único que no cubría nada.

---

## Flujo de navegación

```
HomeScreen  (#/)
│
├── Macroeconomía  (#/macroeconomia)
│   ├── Demanda Agregada       Aprender → #/grifos-da     Hacer → #/camino-da
│   ├── Política Económica     #/politica-economica/{aprender|hacer}
│   ├── Política Fiscal        #/politica-fiscal/{aprender|hacer}
│   ├── Política Monetaria     #/politica-monetaria/{aprender|hacer}
│   └── El Repaso Diario       #/repaso-diario        (transversal, desde su banner)
│
└── Pensamiento Estratégico  (#/pensamiento-estrategico)
    ├── Pensamiento Sistémico  #/pensamiento-sistemico/{aprender|hacer}
    ├── Modelo del Iceberg     #/modelo-iceberg/{aprender|hacer}[/<actividad>]
    └── Fuerzas de Porter      #/fuerzas-porter/{aprender|hacer}

Nivel sitio (desde la cabecera, en cualquier página):
    #/perfil      perfil, ranking general, medallas, resumen, avatar
    #/tienda      Cristales y niveles de avatar
    #/docente     panel docente (solo autorizados)   ·   #/docente/<actividad>
```

Son tres niveles: inicio → materia → tema, más las vistas de nivel sitio. **Demanda Agregada es la única excepción de nombre**: su vista depende de la mitad (`#/grifos-da` para Aprender, `#/camino-da` para Hacer). Esa excepción vive en `vistaDeTema()` y en un solo sitio, porque el enlace de vuelta del panel necesita la misma respuesta y dos copias de una excepción se separan en la primera edición.

### El enrutador vive en el hash, a propósito

`src/ruta.js`. **La razón no es la elegancia, es el despliegue**: el sitio sube por FTP como archivos estáticos, y con `history.pushState` alguien que recargue en `/modelo-iceberg` se come un 404 salvo que el servidor reescriba a `index.html` — una reescritura que no se puede probar antes de que la sufra un estudiante. **El hash no puede dar 404 nunca**: el servidor solo ve `/`. Y el botón atrás funciona igual, porque cada navegación empuja su entrada de historial.

Antes la vista vivía en un `useState` suelto: recargar devolvía a la portada desde cualquier punto y el botón atrás **sacaba del sitio**, porque no había ni una entrada de historial que retroceder.

`VISTAS` es una **lista blanca**: un hash escrito a mano con basura —o el de una versión vieja del sitio— cae en la portada en vez de pintar una pantalla vacía. Ahí caen los hashes del antiguo simulador DA-Learn.

El tercer segmento (`extra`) es un dato opaco que la vista de destino interpreta: hoy lo usan el panel docente (abre con esa actividad puesta) y los caminos (vuelven con ese nodo resaltado). **No se valida en el enrutador**, y es deliberado: una vista desconocida deja la pantalla en blanco, un `extra` desconocido no rompe nada. Como el modo es opcional, `extra` ocupa la segunda o la tercera posición según haya modo o no — por eso ninguna actividad puede llamarse `aprender` ni `hacer`, y hay una prueba que lo comprueba.

### Qué ya no existe: DA-Learn

El simulador de Demanda Agregada —dashboard, los cuatro canales, la Ronda Final— **se retiró entero**, junto con su fila del catálogo del servidor (migración 0022). Lo sustituyen dos cosas que ya existían: "El corazón de la economía" en la mitad Aprender, que hereda su modelo de exploración con diales, y los doce juegos del camino de Hacer. Con él se fue el último estado de actividad que vivía en `App.jsx`: hoy ninguna mecánica guarda su avance ahí — cada una lo lleva dentro y entrega el resultado a la vista de su tema.

### /privacidad

La política de privacidad es la única URL real del proyecto, porque tiene que enviarse a la verificación de Google OAuth. No es una vista del SPA: se compila como **entrada estática aparte** (`privacidad/index.html` → `dist/privacidad/index.html`) para que la ruta responda en cualquier hosting sin reglas de reescritura. Como algunos hosts responden a `/privacidad` (sin barra final) con el index del SPA, `main.jsx` reconoce esa ruta y monta la misma página.

**El texto de la política es literal y no debe reescribirse al editar el componente.**

### Logo y regreso

El logo aparece arriba a la izquierda en todas las páginas y **siempre lleva al inicio**. Resuelve su destino desde `NavigationContext` (`src/navigation.js`), así que ningún sitio donde se usa tiene que pasarle un `onClick`.

| Página | Variante | Convive con botón de volver |
|---|---|---|
| Inicio | `full` (símbolo + wordmark), 30 px | — |
| Índice de materia | `symbol`, 28 px | No: el logo **sustituye** al botón de volver |
| Página de tema, perfil, tienda, repaso, panel docente | `symbol`, 26 px | Sí: son dos acciones distintas, separadas por un divisor |

En las páginas de tema, el botón de volver sube **un** nivel, al índice de esa materia. El logo sale al inicio. Así entrar a un tema nunca es un callejón sin salida y las dos salidas no se confunden. El perfil, la tienda y el panel vuelven **a donde estaba el estudiante**, no siempre al inicio.

El favicon usa el corte del símbolo optimizado para 16 px (trazo 3, nodos base 3.8, vértice 4.1) sobre fondo navy, para que se lea igual en pestañas claras y oscuras. Se sirve como SVG con PNG de respaldo desde `public/`.

---

## Rendimiento de carga

Medido con `npm run build` sobre el HEAD actual. La portada se carga de forma estática; todo lo demás llega bajo demanda con `React.lazy`.

| Momento | Se descarga (sin comprimir / gzip) |
|---|---|
| Abrir el sitio | Entrada + núcleo compartido: **440 kB / 130 kB** |
| Índice de Macroeconomía | Plantilla de índice (23 kB) + curvas de oferta y demanda (2,7 kB) |
| Índice de Pensamiento Estratégico | Plantilla + escena de ajedrez (13 kB) + **Three.js, 553 kB / 140 kB** |
| Índice de Contabilidad | Plantilla + el libro mayor: **7,6 kB / 3,7 kB** (fondo 4,6 + módulo compartido 3,0), sin Three.js |
| Camino de un tema de Macro | 27–86 kB según el tema, más su banco de datos |
| Modelo del Iceberg | 110 kB / 27 kB |
| Fuerzas de Porter | **390 kB / 109 kB** — incluye el núcleo de Recharts |
| El momento de racha (teseracto) | 22 kB + **Three.js**, el día que se muestra |
| Panel docente | 59 kB / 17 kB |
| Perfil | 31 kB / 9 kB ·  Tienda: 6 kB / 2 kB |

Las dos dependencias pesadas —Recharts y Three.js— **no entran en la carga inicial**.

- **Recharts** hoy tiene **un solo consumidor**: `PorterView.jsx`, que dibuja dos radares de cinco puntos. Si ese peso llega a importar, los radares son sustituibles por SVG a mano sin tocar el resto: los datos ya están normalizados a una escala 1–5 en `CASE_PAIRS`.
- **Three.js** tiene **dos**: la escena de ajedrez del índice de Pensamiento Estratégico y el teseracto del momento de racha. Es decir, ya **no** es cierto que quien vaya solo a Macroeconomía nunca lo descargue: lo pedirá el día que su racha avance.

### Qué se cachea y qué no

Los archivos de `assets/` llevan **un hash en el nombre** (`main-19A3utOu.js`) que cambia con cada build. Un nombre nunca cambia de contenido, así que guardarlos mucho tiempo es correcto: Hostinger los sirve con `max-age=604800` (una semana) y no hay nada que tocar ahí.

**Los `.html` son el caso contrario, y necesitaron un arreglo.** Hostinger los servía **sin ninguna cabecera `Cache-Control`**, y cuando falta, el navegador no se queda sin caché: aplica una **caché heurística**, una fracción del tiempo transcurrido desde `Last-Modified`. Se inventa cuánto guardarlo, y ese número crece solo a medida que pasan los días desde el último despliegue.

Eso tiene una consecuencia concreta: el `index.html` es quien nombra el bundle. Con un index viejo guardado, el navegador pide el bundle viejo — y lo pide con éxito, porque sigue en el servidor. **El despliegue sale en verde, el sitio funciona, y el estudiante está usando el de la semana pasada.** Pasó de verdad: un navegador pedía `main-B1CbYu6c.js` mientras el servidor servía `main-D-0S14Zr.js`.

`public/.htaccess` pone `no-cache, must-revalidate` en los dos `.html` (el del sitio y el de `/privacidad/`). `no-cache` **no** significa «no lo guardes»: significa «guárdalo, pero pregunta antes de usarlo». El navegador manda su ETag y recibe un `304 Not Modified` de unos cientos de bytes mientras no haya despliegue nuevo.

Tres cosas lo sostienen, y miran sitios distintos a propósito, porque este fallo no avisa cuando vuelve:

| Barrera | Qué comprueba |
|---|---|
| `src/__tests__/despliegue.test.mjs` | que el `.htaccess` diga lo que tiene que decir, y que no se meta con los bundles |
| Paso «Comprobar que el build salió completo» | que el archivo llegue a `dist/` |
| Sonda «el index.html llega con Cache-Control» | que llegue **al servidor**, midiendo la cabecera contra el sitio en vivo |

La tercera es la que importa: el archivo empieza por punto, y que el build lo genere no demuestra que el FTP lo suba.

Todo el `.htaccess` va dentro de `<IfModule mod_headers.c>`. Una directiva que el servidor no entienda **no se ignora: devuelve HTTP 500 para el dominio entero**. Envuelto así, el peor caso es que no haga nada.

---

## Fondos animados

Cada nivel del sitio tiene su fondo, y los que animan traen su salida para hardware limitado.

| Página | Fondo | Fallback estático |
|---|---|---|
| Inicio | **Degradado en malla**: manchas muy desenfocadas que se cruzan despacio sobre el navy | No lo necesita: ver abajo |
| Índice de Macroeconomía | Curvas de oferta y demanda que derivan y se cruzan, con destello coral en el equilibrio | Un fotograma con el equilibrio ya encendido |
| Índice de Pensamiento Estratégico | Escena Three.js: partida en curso, cámara en órbita lenta, pieza en juego resaltada en teal | Imagen JPEG (`src/assets/chess-fallback.jpg`) |
| Índice de Contabilidad | **El libro mayor como red**: cuentas T derivando en tres planos y, cada 3-5 s, un asiento que las une | Un fotograma quieto, con sus asientos a la vista |
| Dentro de un tema | El fondo de su materia, **más atenuado** (`FondoMateria.jsx`) | el mismo de la materia |

La lógica compartida de detección está en `src/utils/device.js`.

### El fondo de Contabilidad: el libro mayor como red

Cuentas T derivando en tres planos de profundidad y, cada tres a cinco segundos, un **asiento**: un arco entre dos de ellas y el mismo monto anotado dos veces, al debe de una —teal— y al haber de la otra —ámbar—. La partida doble en movimiento, sin una palabra de texto.

Cuatro capas, de atrás hacia delante: columnas de cifras ilegibles a propósito (8 % de opacidad, el suelo del rango), las cuentas T, los arcos y los montos.

**La escena no vive en el componente.** Cuántas cuentas hay, que no formen cuadrícula, cada cuánto entra un asiento, cuántos arcos pueden convivir y cuánto dura un monto los decide `src/contabilidad/libroMayor.js`, que es una función pura y avanza con un `dt`. Eso permite correr **tres minutos de fondo en una prueba** y medir lo que pasó, en vez de mirar un canvas y confiar. Es también lo que hace que la miniatura de la tarjeta de resumen salga de los mismos módulos que el fondo animado, y no sea un dibujo aparte que se separaría en la primera edición.

Reglas que la prueba vigila, y que no son decoración:

- **Un asiento, un monto, dos anotaciones.** Nunca uno solo, nunca dos distintos, nunca una cuenta contra sí misma.
- **Sin signos.** El debe no es positivo ni el haber negativo, y escribirlo con + y − enseñaría mal justo la idea que el fondo existe para insinuar.
- **Coral no aparece.** Significa error en todo el sitio, y un asiento contable no lo es.

**Cifras tabulares en canvas.** El canvas **no puede** activar `font-variant-numeric`: el atajo `ctx.font` no admite variantes numéricas y no hay forma de encender la característica `tnum` de la fuente. Poner esa propiedad en el estilo del lienzo no haría nada. Así que se implementa el efecto: cada carácter se dibuja en una celda del ancho del «0», de modo que las columnas alinean como en un libro de verdad.

En el teléfono **no hay interacción táctil**: el fondo corre su ciclo solo y el dedo es para navegar el contenido. En escritorio, acercar el cursor a una cuenta ilumina los asientos suyos que sigan en pantalla.

---|---|---|
| `static` | `prefers-reduced-motion`, **o** sin WebGL, **o** `hardwareConcurrency <= 4`, **o** `deviceMemory < 4` | Imagen fija. No se inicializa WebGL ni se construye geometría. |
| `mobile` | `innerWidth < 700` (y no ser `static`) | Escena completa, `pixelRatio` tope 1.5, sin antialias, sombras 512 px, tope 30 fps |
| `full` | Todo lo demás | Escena completa, `pixelRatio` tope 2, antialias, sombras 1024 px, fps libre |

La capacidad del equipo decide entre `static` y escena viva; el **ancho de pantalla** decide entre `mobile` y `full`. Son dos ejes distintos.

**Limitación conocida de estos umbrales.** No hay detección real de GPU: `hardwareConcurrency` mide núcleos de CPU y `deviceMemory` mide RAM, y esta última solo existe en navegadores Chromium. En la práctica **muchos iPhone reportan `hardwareConcurrency = 4`**, así que hoy caerían en `static` aunque su GPU mueva la escena de sobra. Antes de mover el umbral conviene medir en dispositivos reales con el medidor de abajo.

### Medir rendimiento en un equipo real

Abrir cualquier página con `?perf=1` (por ejemplo `https://aprendefae.com/?perf=1`) y entrar a Pensamiento Estratégico. Aparece abajo a la izquierda un recuadro con el nivel activo, los fps actuales, el **mínimo** observado, el punto del bucle y la razón exacta por la que se eligió ese nivel. No se monta si no está el parámetro.

Si en un teléfono real se ve caída de fps, ajustar en este orden (el primero es el de mayor impacto):

1. Desactivar sombras en la ruta móvil — `renderer.shadowMap.enabled = !narrow` en `ChessBackground.jsx`.
2. Bajar los segmentos de las piezas — el argumento de `buildPieceGeometries()`, hoy 12 en móvil y 18 en escritorio.
3. Frenar o pausar la órbita de cámara en móvil — el factor `0.052` en `placeCamera()`.

En la escena de ajedrez el fallback es una imagen y no un fotograma renderizado: así un dispositivo de gama baja no llega a inicializar WebGL ni a construir la geometría. Las piezas se generan por código (`chessPieces.js`) con `LatheGeometry` —las piezas de ajedrez reales se tornean— y el caballo se extruye desde una silueta, para no cargar modelos 3D pesados.

---

## Diseño: las reglas que no se relajan

- **Coral (`#E76F51`) significa error**, en todo el sitio y sin excepción. La única salvedad son las **figuras de avatar** (paletas Brasa y Aurora), donde es parte del kit aprobado y no un estado.
- **Suelo tipográfico: 12 px** para todo lo que se lee —texto de contenido, rótulos de un diagrama, nombres de nodos—, medido a 375 px de ventana; 10,5 px es el suelo absoluto para etiquetas. La presentación de clase tiene su propia escala, en vh. Nada de esto se aplica solo: es la regla, escrita en `theme.js`.
- **El color nunca va solo.** Cada banda de desempeño lleva su nombre escrito y su rango en números; cada chip de estado del Repaso, su palabra al lado del color.
- **Se verifica a 375 px.** Los estudiantes entran desde el teléfono. `ANCHO_ESTRECHO = 560` es el ancho donde el sitio pasa a su forma de teléfono, y es **un solo número** para el control de cuenta y para el camino: ajustar uno sin el otro dejaría un tramo de anchos donde uno ya es de móvil y el otro todavía no.
- **Las duplicaciones entre JavaScript y SQL se prueban, no se confían.** Umbrales de liga, precios de Cristales y cortes de banda están a la fuerza en los dos lados; en los tres casos hay una prueba que **lee la migración** y falla si se separan. Es la única forma de tener una sola verdad cuando el lenguaje impide compartirla.

---

## Estructura del proyecto

```
├── index.html                 # HTML raíz del SPA, monta la app en #root
├── privacidad/index.html      # entrada estática de /privacidad (segunda entrada de Vite)
├── package.json               # dependencias y scripts (dev/build/preview/test/verificar)
├── vite.config.js             # Vite + plugin de React + Tailwind CSS
├── .github/workflows/
│   ├── base.yml               # Pruebas: JS + build + las 37 migraciones + SQL, en cada push
│   └── deploy.yml             # Compilar, subir por FTP y la sonda de postdespliegue
├── scripts/
│   ├── verificar/             # npm run verificar: base.yml ejecutado aquí, sobre PGlite
│   ├── cargador-jsx.mjs       # permite importar .jsx desde las pruebas de Node
│   ├── medir-faciles.mjs
│   └── barrido-dashboard.mjs
├── supabase/
│   ├── migrations/            # 0001 … 0037. EN ORDEN. Ver la sección de migraciones.
│   ├── tests/                 # 22 pruebas SQL (RLS, ligas, cierre, cristales, repaso…)
│   ├── ci/00_auth_de_mentira.sql   # decorado de auth para poder correr SQL en CI
│   └── limpiezas/             # arreglos puntuales de datos, con fecha en el nombre
├── public/
│   ├── favicon.svg / -32.png / -180.png
│   └── casos/                 # PDF del caso de El Arca
└── src/
    ├── main.jsx               # entrada del SPA; reconoce /privacidad si el host cae al index
    ├── privacidad.jsx         # entrada de la página estática de privacidad
    ├── App.jsx                # shell: una rama por vista, todas con React.lazy
    ├── ruta.js                # enrutador de hash: VISTAS, modo, extra, useRuta
    ├── navigation.js          # contexto de navegación de sitio (el logo llega al inicio solo)
    ├── theme.js               # paleta FAE, ANCHO_ESTRECHO y el suelo tipográfico
    │
    ├── auth/                  # AuthProvider y la edición de perfil
    ├── lib/supabase.js        # el cliente, o null si faltan las variables de entorno
    │
    ├── fp/                    # motor.js (referencia legible), otorgarFP, registrarActividad,
    │                          #   racha.js (caducidad al leer), aviso.js (canal de FP)
    ├── ligas/                 # ligas.js (acceso) y niveles.js (umbrales, nombres, mensaje)
    ├── racha/                 # teseracto.js (geometría), disparador.js, datos.js, visibilidad.js
    ├── repaso/                # repaso.js (reglas), seleccion.js (el sorteo), items.js (el pool),
    │                          #   subtemas.js, datos.js
    ├── cristales/             # precios, fuentes, saldo, compra y guardado del avatar
    ├── avatar/generador.js    # generador paramétrico: 5 formas × 4 paletas × 4 niveles
    ├── medallas/              # de hechos a medallas, y las que se derivan del catálogo
    ├── resumen/               # resumen de semestre
    ├── social/animo.js        # la reacción entre estudiantes: por apodo y anónima
    ├── docente/               # acceso, datos, alertas, bandas, destacados, exportar a CSV
    ├── hacer/                 # bloques.js (los 4 bloques del camino), completadas.js
    ├── arca/                  # partida y puntuación del desafío de varias etapas
    │
    ├── data/                  # LA FUENTE DE VERDAD del contenido
    │   ├── subjects.js        #   materias, temas, actividades y su clasificación
    │   ├── medallas.js        #   las 24 medallas
    │   ├── politicaEconomica.js · demandaAgregadaHacer.js · politicaFiscal.js
    │   ├── politicaMonetaria.js · cimientos.js · bloquesAvanzados.js · juegosPolitica*.js
    │   ├── iceberg*.js · arca.js · asedio.js · tableroDecisiones.js · corazonDA.js
    │   └── heroPhrases.js
    │
    ├── components/
    │   ├── HomeScreen.jsx · Hero.jsx · SubjectCard.jsx · Logo.jsx
    │   ├── TopicIndexView.jsx      # plantilla de índice, compartida por las tres materias
    │   ├── MacroTopicIndex.jsx · EstrategiaTopicIndex.jsx
    │   ├── TopicSplitCard.jsx      # la tarjeta que se parte en Aprender / Hacer
    │   ├── <Tema>View.jsx          # una por tema: PoliticaEconomica, PoliticaFiscal,
    │   │                           #   PoliticaMonetaria, Iceberg, PensamientoSistemico,
    │   │                           #   Porter, DemandaAgregadaAprender / DemandaAgregadaHacer
    │   ├── PerfilView.jsx · PrivacidadView.jsx
    │   ├── auth/                   # control de cuenta, diálogo, botón de Google, paso de apodo
    │   ├── avatar/Avatar.jsx       # dibuja lo que calcula el generador
    │   ├── tienda/TiendaView.jsx
    │   ├── ranking/RankingFP.jsx   # con el avatar a 36 px
    │   ├── ligas/                  # LigaBoard (avatar a 24 px), cabecera, insignia
    │   ├── racha/                  # MomentoRacha + Teseracto (Three.js, lazy)
    │   ├── repaso/                 # BannerRepaso (la entrada), RepasoView, PartidaRepaso
    │   ├── perfil/                 # medallas, resumen, editar, selector de avatar
    │   ├── docente/                # PanelDocente y sus seis piezas
    │   ├── presentacion/           # la vista para proyectar en clase
    │   ├── social/BotonAnimo.jsx
    │   ├── backgrounds/            # MeshGradient (inicio), SupplyDemand (macro),
    │   │                           #   Chess + chessPieces (estrategia)
    │   ├── mecanicas/              # LOS JUEGOS, agrupados por tema
    │   │   ├── corazon/            #   Demanda Agregada — el quirófano
    │   │   ├── salaDeControl/      #   Política Económica — la sala de control
    │   │   ├── tesoreria/          #   Política Fiscal — la bóveda (+ clase/, para proyectar)
    │   │   ├── maquinas/           #   Política Monetaria — la sala de máquinas
    │   │   ├── bloques/            #   mecánicas compartidas entre varios temas
    │   │   ├── arca/               #   el desafío de cuatro etapas
    │   │   └── visuales/           #   las figuras que responden a los faders
    │   └── shared/                 # CaminoHacer, RecompensaCierre, Medalla, iconos de actividad,
    │                               #   previas/, AvisoFP, FondoMateria, BackgroundVeil, Footer
    ├── utils/                 # device · barajar · orden (crédito parcial) · enPantalla · formato
    └── styles/                # global.css (fuentes, Tailwind, animaciones) y home.css
```

Las pruebas viven junto a lo que prueban, en carpetas `__tests__/` o como `*.test.mjs` al lado del módulo. Son **390** y se corren con `npm test`.

---

## Notas de implementación

- **El catálogo manda.** `src/data/subjects.js` decide qué existe. Los bloques del camino salen de la dificultad declarada, las insignias del tipo, y las opciones de la tarjeta partida de si hay actividades de ese tipo. Conectar una actividad nueva es clasificarla y llamar a `registrarActividadCompletada()` al terminar.
- **Nada bloquea a nadie.** Ni el login, ni los nodos del camino, ni los bloques de dificultad. Lo único que exige algo es el Repaso Diario (3 actividades completadas), y lo dice con su mensaje.
- **El camino sabe cuándo se completó algo sin recargar.** `useCompletadas()` escucha dos fuentes —`onAuthStateChange` y el canal de FP— en vez de preguntar una sola vez al montar. Antes, terminar una actividad dejaba el nodo gris hasta la siguiente carga de la página, y un invitado que iniciaba sesión a mitad de camino seguía viendo cero. Se añade el id que viene en el aviso y no el que la actividad creía estar completando: nunca se pinta en verde algo que la base no tenga.
- **Titular rotativo.** `Hero.jsx` guarda el índice elegido en `sessionStorage`, así que no cambia al recargar dentro de la misma sesión, y usa `localStorage` para no repetir el titular de la sesión anterior. Si el almacenamiento falla, cae a un sorteo simple.
- **Estilos.** El diseño se traslada como estilos inline (igual que el export del kit) más `home.css` para los estados `:hover`/`:active` y los layouts por ancho de pantalla, que no se pueden expresar inline.
- **Tailwind.** Queda de los prototipos originales, donde venía preconfigurado por el entorno de artifacts. El proyecto incluye Tailwind CSS v4 vía `@tailwindcss/vite`.
- **El barajado vive en un solo sitio** (`utils/barajar.js`). Si las opciones salen siempre en el mismo orden, el estudiante deja de clasificar contenido y empieza a memorizar posiciones: "la tercera es la buena".
- **El crédito parcial de las ordenaciones se cuenta por parejas**, no por posición exacta (`utils/orden.js`): confundir el segundo con el tercero no puede costar lo mismo que poner el último primero.
- **Las piezas animadas se pausan fuera de pantalla** (`utils/enPantalla.js`): tres mecánicas animadas en un mismo tema son baratas por separado y caras las tres a la vez.
