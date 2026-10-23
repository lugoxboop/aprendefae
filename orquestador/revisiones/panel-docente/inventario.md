# Inventario del panel docente (estado en main, 23-oct-2026)

Lo escribe Baki (Célula D) para que Ukyo diseñe sobre lo que hay de verdad. No se
cambia nada en este PR. Las alturas se **midieron**: build de `main` servido en el
8099, Supabase falso, sesión fingida, fuentes de producción (Sora e Inter 5.3.0) y
un curso inventado y determinista. Se reproduce con
`node scripts/t4/panel-docente/inventario.mjs`, que deja las cifras en `medidas.json`
y las capturas en `capturas/`.

**El curso de prueba:** 28 estudiantes de Contabilidad. 22 están en «mi grupo» y 2
son cuentas de prueba. La cuenta docente tiene dos materias (Contabilidad y
Macroeconomía), igual que Mateo. Salen 8 alertas (3 urgentes y 5 de atención) y el
panel se abre con `#/docente/t4-entra-o-sale-de-caja`. Las alturas que dependen de
cuántos datos hay (alertas, temas, filas) se dan también **por unidad**, para
poder escalarlas a otro curso.

**Archivos:** `src/components/docente/` (8 componentes, 2.393 líneas) y
`src/docente/` (7 módulos: `datos.js`, `alertas.js`, `destacados.js`, `bandas.js`,
`exportar.js`, `etiquetasItem.js`, `useAccesoDocente.js`).

---

## (a) Qué se ve, de arriba abajo

`y` es la distancia en px desde el tope de la página y `alto` es el alto del bloque.
El pliegue queda en 667 px a 375 de ancho y en 768 px a 1366.

| # | Bloque (componente) | Qué muestra | y · alto a 375 | y · alto a 1366 |
|---|---|---|---|---|
| 1 | Barra superior (`Marco`, PanelDocente.jsx) | Logo, botón Volver, «Panel docente» y la pastilla de FP de la cabecera general | 20 · 38 | 23 · 38 |
| 2 | Título (PanelDocente.jsx) | Nombre de la materia y el botón «Exportar informe» (CSV) | 84 · 40 | 87 · 46 |
| 3 | Selector de materia (PanelDocente.jsx) | Una pastilla por materia, solo si hay más de una | 130 · 35 | 139 · 35 |
| 4 | Frase de cohorte (PanelDocente.jsx) | «Métricas y alertas sobre tu grupo: 22 de 26…» y el aviso de las cuentas de prueba (30 palabras) | 182 · 81 | 191 · 41 |
| 5 | **Cabecera resumen** (CabeceraResumen.jsx) | 3 tarjetas: ACTIVOS ESTE CICLO · ALERTAS PENDIENTES (urgentes, atención, informativas) · DESDE TU ÚLTIMA VISITA (FP nuevos, +N activos, temas con movimiento) | 287 · **354** | 256 · 121 |
| 6 | **Alertas** (BloqueAlertas.jsx) | **Una tarjeta por alerta, con el nombre del estudiante** y ordenadas por urgencia, más el desplegable «Qué no está midiendo este panel todavía (1)» | 667 · **1.110** (8 tarjetas de 127 px; desplegable cerrado de 19 px) | 403 · **827** (8 de 87 px) |
| 7 | Destacados (Destacados.jsx) | Hasta 3 tarjetas (Cabeza de la semana, Precisión sostenida, Constancia) y «Ver los N restantes» | 1.805 · 473 | 1.258 · 227 |
| 8 | Resumen del periodo (PanelDocente.jsx, `Kpi`) | 3 KPI: ACIERTO EVALUATIVAS · ACIERTO EXPLORATORIAS · EN RIESGO | 2.305 · 400 | 1.513 · 157 |
| 9 | Avance por tema (PanelDocente.jsx) | Una barra por tema: «N completo · M iniciado». **Salen los 10 temas**, incluidos T5, T6, T7 y el repaso, que se van a ocultar | 2.734 · 1.110 (filas de 84 px) | 1.699 · 797 (filas de 63 px) |
| 10 | **Rendimiento por actividad** (`select` + VistaRendimiento.jsx) | Ver la tabla de abajo | 3.872 · 2.405 | 2.524 · 1.873 |
| 11 | **Estudiantes activos** (PanelDocente.jsx + FilaEstudiante.jsx) | Buscador, «Solo mi grupo» y **una fila por estudiante** (28 filas, cuentas de prueba incluidas) | 6.305 · **4.269** (fila cerrada de 140 px) | 4.424 · 2.264 (fila de 69 px) |
| 11b | Detalle de un estudiante (DetalleEstudiante.jsx, se abre dentro de la fila) | La alerta más grave, 4 cifras (FP total, FP ciclo, acierto evaluativas, posición) y el historial por actividad | fila abierta de 501 (detalle de 362) | fila abierta de 317 (detalle de 249) |

**Página entera: 10.638 px a 375 (16 pantallas) y 6.752 px a 1366 (8,8 pantallas).**

**Lo que se ve de entrada:** a 375, los bloques 1 a 5 (el bloque 5 llena el resto de
la pantalla). A 1366, del 1 al 5 y el comienzo de las alertas.

**Lo que dice Mateo, medido.** La «lista larga de estudiantes» que se ve primero es
el bloque **Alertas**. Está en la segunda pantalla del teléfono y en la primera del
escritorio, y es una lista de nombres, una tarjeta por alerta: con 8 alertas mide
1.110 px a 375, casi dos pantallas. Después vienen otras dos listas largas:
Avance por tema (10 filas, 4 de ellas de temas que se van a ocultar) y la lista
de estudiantes (28 filas, 4.269 px). Para llegar a «cómo les fue en las
actividades» (bloque 10) hay que bajar 3.872 px a 375 (5,8 pantallas) y 2.524 px a
1366.

### Dentro de Rendimiento por actividad (bloque 10), en el orden en que se ve

| Parte | Qué muestra | Empieza en y (375 / 1366) |
|---|---|---|
| Selector de actividad | `select` agrupado por tema, solo con las actividades de Hacer (con desafío) | 3.872 / 2.524 (inicio del bloque) |
| Cabecera de la actividad | Nombre, «tema · materia · dificultad · evaluativa/exploratoria» y el enlace al tema | — |
| Tarjetas | LA TERMINARON (N de tu grupo) · ACIERTO MEDIO (con su banda) · TIEMPO MEDIO · FP MEDIO | 4.147 / 2.766 |
| Distribución por bandas | 3 barras: Alto (≥85 %), Medio (60–84 %), Bajo (<60 %) | 4.599 / 2.890 |
| Quién es quién | Una fila por estudiante del grupo, de menor a mayor acierto: nombre, ×intentos, % con su banda y FP | 4.812 / 3.084 |
| Diagnóstico por pregunta | Una fila por ítem: enunciado (`etiquetasItem.js`), «Se equivocan sobre todo con «…»», «N de M fallaron» y una tira de color si falla mucho | 5.651 / 3.903 |

Ojo: en pantalla, «Quién es quién» va **antes** que el diagnóstico por pregunta.

### Capturas (`capturas/`, datos falsos, 1×)

| Archivo | Qué es |
|---|---|
| `01-de-entrada-375x667.png` · `01-de-entrada-1366x768.png` | La ventana al abrir: lo que se ve sin desplazarse |
| `02-panel-completo-375x667.png` · `02-panel-completo-1366x768.png` | La página entera |
| `03-rendimiento-375x667.png` · `03-rendimiento-1366x768.png` | Solo el bloque 10 |
| `04-detalle-estudiante-375x667.png` · `04-detalle-estudiante-1366x768.png` | Una fila de estudiante abierta |

---

## (b) De dónde sale cada cifra

Todo llega por funciones RPC de Supabase con `security definer`. Cada una comprueba
`es_docente()` y `materias_docente()` y responde con el error 42501 si no hay
permiso. Desde el navegador no se lee ninguna tabla directamente. Las tablas de
origen son `fp_history` (una fila por actividad terminada), `fp_detalle` (una fila
por ítem respondido), `profiles`, `docente_grupo` y `docentes`. Abajo se nombra solo
la última migración que define cada función.

| Cifra en pantalla | Función JS (`src/docente/`) | RPC → tabla.columna |
|---|---|---|
| ¿Es docente? ¿De qué materias? (puerta y pastillas) | `accesoDocente` (datos.js) a través de `useAccesoDocente` | `es_docente()`, `materias_docente()` → `docentes` (0005) |
| Lista de estudiantes y **todas** las cifras por persona | `estudiantesDe` (datos.js) | `panel_estudiantes` (0020) → `fp_history` agregado por `user_id` + `profiles.nickname/full_name/es_prueba` + `docente_grupo` |
| Frase de cohorte (22 de 26; cuentas de prueba) | cálculo en PanelDocente.jsx (`cohorte`, `conActividad`, `nPrueba`) | `panel_estudiantes.en_mi_grupo`, `.es_prueba` |
| ACTIVOS ESTE CICLO | CabeceraResumen.jsx | `panel_resumen.estudiantes_activos` (0020); sin la RPC, el número de la cohorte con `fp_ciclo > 0` |
| ALERTAS PENDIENTES y su desglose | `alertasDelGrupo` (alertas.js), calculado en el cliente | `panel_estudiantes`: `n_registros`, `dias_inactivo`, `pct_evaluativa`, `n_evaluativas`, `n_exploratorias`, `duracion_media_ms`, `pct_exploratoria` |
| DESDE TU ÚLTIMA VISITA (FP nuevos, +N activos, temas) | `resumenDe` (datos.js) | `panel_resumen.desde/fp_nuevos/estudiantes_movidos/actividades_nuevas` → `docentes.ultima_visita` + `fp_history`. **Esta llamada escribe:** adelanta `docentes.ultima_visita` si la anterior tiene más de 30 min |
| Cada alerta (urgente, atención, informativa) | `alertasDe` (alertas.js), con umbrales en `UMBRALES` | urgente: `n_registros ≥ 2` y `dias_inactivo > 7`; atención: `pct_evaluativa < 60` con `n_exploratorias ≥ 2`; informativa: `duracion_media_ms < 90 s` y un acierto global < 60 % |
| Destacados | `destacadosDe`, `detalleMotivo` (destacados.js) | `panel_estudiantes.fp_ciclo` (cabeza, top 3), `pct_evaluativa_14d` ≥ 85 con `n_evaluativas_14d` ≥ 4 (precisión), `dias_activos_14d` ≥ 3 (constancia) |
| ACIERTO EVALUATIVAS / EXPLORATORIAS del periodo | media en PanelDocente.jsx (`resumen`) | media de `panel_estudiantes.pct_evaluativa` / `.pct_exploratoria` (cada uno ya es un `avg(fp_history.correct_pct)` por modalidad) |
| EN RIESGO | conteo de alertas urgentes | lo mismo que la alerta urgente |
| Avance por tema | `avancePorTema` (alertas.js) + `subjects.js` | `panel_estudiantes.actividades` (= `array_agg(distinct fp_history.activity_id)`), contrastado con las actividades de Hacer de cada tema |
| Rendimiento: LA TERMINARON, ACIERTO MEDIO, bandas, TIEMPO, FP MEDIO | `actividadDe` (datos.js), `BANDAS`/`bandaDe` (bandas.js) | `panel_actividad` (0024): `completaron`, `en_grupo`, `grupo_total`, `intentos`, `pct_medio`, `banda_alta/media/baja`, `duracion_media_ms`, `fp_medio`, `modality`, `difficulty`, `intentos_con_detalle`, `detalle_desde` → `fp_history`, `fp_detalle`, `docente_grupo` |
| Quién es quién | `grupoDeActividad` (datos.js) | `panel_grupo_actividad` (0024): `mejor_pct`, `fp_total`, `intentos` → `fp_history` + `docente_grupo` |
| Diagnóstico por pregunta | `itemsDe` (datos.js) + `etiquetaDeItem` (etiquetasItem.js) | `panel_items` (0023): `veces`, `fallos`, `pct_fallo`, `respuesta_top`, `respuesta_top_veces` → `fp_detalle.acerto/.respuesta`; no cuenta cuentas de prueba |
| Fila de estudiante: temas iniciados, FP CICLO, FP TOTAL, EVALUATIVA, ÚLTIMA VEZ | FilaEstudiante.jsx (`avancePorTema`, `alertasDe`) | `panel_estudiantes.actividades/fp_ciclo/fp_total/pct_evaluativa/n_evaluativas/dias_inactivo` |
| Detalle: POSICIÓN | PanelDocente.jsx (`posiciones`, orden por `fp_total` dentro de la cohorte) | `panel_estudiantes.fp_total` |
| Detalle: historial por actividad | `historialDe` (datos.js) | `panel_historial` (0019): `activity_id`, `intentos`, `mejor_pct`, `mejor_fp`, `ultimo_intento` → `fp_history` (sin bonos de racha) |
| Exportar informe (CSV, 15 columnas) | `csvDelPanel` (exportar.js) | `panel_estudiantes` + `alertasDe` |
| Añadir / En mi grupo | `marcarEnGrupo` (datos.js) | `grupo_marcar` (0005) → **escribe** en `docente_grupo` |

Con el curso de prueba, el panel pidió estas RPC: `es_docente`, `materias_docente`,
`panel_estudiantes`, `panel_resumen`, `panel_actividad`, `panel_items`,
`panel_grupo_actividad`, `panel_historial` y `racha_momento` (esta última es de la
cabecera general, no del panel).

---

## (c) Qué datos ya existen y hoy no se muestran, y qué no existe

### Existen y el panel no los enseña (Ukyo puede pedirlos sin tocar datos ni esquema)

| Dato | Dónde está | Qué permitiría |
|---|---|---|
| **Tendencia semanal**: estudiantes activos, actividades y acierto evaluativo medio por semana, hasta 52 semanas | RPC `panel_tendencia(p_subject, p_semanas)` (0020). **Existe y el cliente nunca la llama** | «¿El grupo va mejor o peor que la semana pasada?» en una sola línea |
| Total de estudiantes según el servidor | `panel_resumen.estudiantes_total` | — (hoy se cuenta en el cliente) |
| Primera actividad de cada estudiante | `panel_estudiantes.primera_actividad` | Antigüedad y quién llegó tarde |
| Acierto exploratorio por estudiante | `panel_estudiantes.pct_exploratoria`, `n_exploratorias` | Hoy solo sale en el CSV y en el texto de una alerta |
| Duración media por estudiante | `panel_estudiantes.duracion_media_ms` | Solo sale en el CSV y en la alerta de prisa |
| Qué actividades hizo cada estudiante (lista) | `panel_estudiantes.actividades` | Hoy solo se cuenta («N de M temas iniciados») |
| Precisión y días activos de los últimos 14 días, por estudiante | `pct_evaluativa_14d`, `n_evaluativas_14d`, `dias_activos_14d` | Hoy solo deciden Destacados; no se ven en la fila |
| Del historial: modalidad, dificultad, FP acumulado y primer intento por actividad | `panel_historial.modality/difficulty/fp_total/primer_intento` | Hoy se ve solo el mejor %, los intentos y la fecha del último |
| Última vez en esa actividad | `panel_grupo_actividad.ultimo` | Quién no ha vuelto a intentarla |
| **Acierto por subtema** (agregado en el cliente) | `panel_items` por ítem + el mapa ítem → subtema (`src/repaso/subtemas.js`; T4 en `src/data/contabilidadT4Subtemas.js`, PR hermano de este) | «Qué hay que volver a explicar», agrupado por idea y no por pregunta |
| Rendimiento de todas las actividades a la vez | `panel_actividad` es por actividad: el cliente puede pedirla N veces | Un tablero de actividades sin el `select` (cuesta N llamadas; mejor medirlo antes) |

### Existen en la base pero ninguna RPC del panel los devuelve (piden un issue a Erwin)

Exponerlos supone una función SQL nueva. Añadir una función no altera tablas, pero
es una migración, y lo compartido no lo decide la célula.

- Reintentos dentro de un ítem: `fp_detalle.intentos`. `panel_items` solo cuenta si acertó o no.
- Orden y hora de cada respuesta: `fp_detalle.orden`, `fp_detalle.created_at`.
- Repetición de la actividad: `fp_history.repeat_index`.
- Racha y último día activo: `profiles.best_streak`, `profiles.last_activity_day`.
- Ligas y podio: `liga_*`. Ánimos entre estudiantes: `animo`.
- Partida a medias: `partida_en_curso`, que **solo existe para el Arca**.

### No existe (no se captura en ningún lado)

- **Progreso en Aprender.** La teoría no deja fila. Quien la leyó entera y no jugó aparece como «no iniciado». El panel ya lo avisa en Avance por tema.
- **Empezar y abandonar una actividad.** `registrar_fp` solo se llama al terminar. Ya está declarado en `REGLAS_SIN_DATOS` de alertas.js.
- Tiempo por ítem (solo hay duración por actividad).
- Notas del docente, alertas marcadas como «atendidas» o contacto con el estudiante.
- Varios grupos por docente y materia: hay un solo `docente_grupo` por docente y materia.

---

## Notas para el diseño (hechos medidos, no propuestas)

- Las alturas de Alertas, Avance por tema y Estudiantes crecen con el curso. A 375,
  cada alerta suma 127 px, cada tema 84 px y cada estudiante 140 px. Con 40
  estudiantes y 12 alertas, la página rondaría los 12.800 px a 375 (es una cuenta
  con esas cifras, no una medida).
- Avance por tema enseñará T5, T6, T7 y el repaso aunque se oculten al estudiante:
  sale de `SUBJECTS.contabilidad.topics`, no de lo que ve el estudiante. Habrá que
  filtrarlo en la vista cuando la otra célula decida cómo se ocultan.
- La paleta del panel usa teal para «bien», «en mi grupo», «destacado» y para la
  banda Alta. En Contabilidad, teal es DEBE (B4). Se anota por si el panel nuevo vive
  junto a piezas de Contabilidad; no se tocó.
- Con estos datos, la consola no dio ningún error (`errores: []` en las dos medidas).
