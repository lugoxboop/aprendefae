# Panel docente v1 · especificación de rediseño (Ukyo, 23 oct 2026)

Para la Célula D (general Yujiro, constructor Baki, auditor Shibukawa). **Especificación, no código.** La vista cambia; **los datos y el esquema no** (P7, P8). Lo que necesita un dato inexistente va marcado **DATO NUEVO**.

Lector: **un profesor en un salón, con un minuto, no un analista.** Pregunta que el panel contesta en 3 segundos: *¿cómo va mi clase y a quién miro hoy?*

Orígenes de cifras: [fuente] ya existe en RPC/cliente · [calculado] sale de lo que ya llega · [supuesto] hay que medir.

---

## 1. Diagnóstico (lo que hay hoy)

| Hoy | Problema |
|---|---|
| Orden: cabecera de 3 tarjetas, alertas completas, destacados, lista de estudiantes con filas de 6 columnas, rendimiento por actividad al final (se baja con scroll) | La lista larga está en el camino de todo; lo que el profesor quiere (¿cómo va la clase?) queda enterrado |
| Alertas: lista completa, una barra de color por alerta, más `<details>` de reglas sin datos | Todas pesan igual; 12 alertas = 12 bloques |
| Cada fila: 6 datos (FP ciclo, FP total, evaluativa, última vez, nivel, botón) | Un salón de 40 = 240 cifras en pantalla |
| Notas de cohorte, cuentas de prueba, umbrales | Útiles para quien audita, ruido para quien enseña |
| Coral en «urgente» y bandas bajas | Contradice P6 (coral solo error de carga) |

## 2. Principio: tres capas, nunca la lista primero

1. **Primera pantalla = tres respuestas.** Cómo va la clase · a quién mirar · qué actividad salió peor.
2. **Un toque = el detalle de cada respuesta** (quién y por qué; la actividad completa).
3. **Vista aparte = «Mis estudiantes»** (lista completa, buscable) y **«Actividades»** (rendimiento de todas las generales).

Ejemplo de la vida real: es la hoja de resumen del tablero de un médico de guardia. Primero ves «cuántos pacientes, quién está grave, qué falló hoy»; el expediente completo de cada uno está a un toque, no pegado en la pared.

## 3. Primeros 3 segundos

### 3.1 Bloques (P4: ≤3 a 375, ≤5 a 1366)

| # | Bloque | Contenido | Cifras |
|---|---|---|---|
| **B1** | **Mi clase** | Selector de materia (si hay más de una) + UNA cifra grande: **avance de la clase** + 1 línea de apoyo: «N activos esta semana de M» | 2 |
| **B2** | **Necesitan atención** | Máx. **3 estudiantes** visibles: nombre (o apodo) + motivo en palabras + marca de riesgo (palabra + ícono). Pie: «Ver los N» (un toque) | 3 (los motivos son texto) |
| **B3** | **Actividad con peor resultado** | Nombre de la actividad + % de acierto medio + cuántos la terminaron. Pie: «Ver todas las actividades» | 2 |

**Total 375 px: 3 bloques, ≈ 7 → recortar a 6 cifras**: la línea de apoyo de B1 pasa a texto («12 activos de 31»). Se cuenta como una cifra «activos» y no se repite el total en otro lado. Resultado: avance (1) + activos (1) + atención 3 nombres sin números (0) + peor actividad % (1) + terminaron (1) = **4 cifras**, hasta 2 de holgura.

**1366 px: 3 bloques en fila** (B1 | B2 | B3) más, debajo y aún en pantalla, un **cuarto** bloque ligero **B4 «Desde tu última visita»** (una línea: «3 estudiantes nuevos con actividad, 2 actividades nuevas»). Máx. 5 bloques → quedan 4. Cifras ≤ 10: se usan ≈ 7.

### 3.2 Orden en el DOM = orden visual
B1 → B2 → B3 → (B4 solo ≥ 1024) → enlaces «Mis estudiantes», «Actividades». La lista de estudiantes **no está en la primera pantalla a 375** (P2); a 1366 puede asomar su encabezado debajo de B1–B3, nunca antes.

## 4. Cada bloque en detalle

### B1 · Mi clase — «¿cómo va?»
- **Cifra:** avance de la clase = **promedio de avance por tema de la `cohorte`** ya calculado por `porTema` / `avancePorTema` [calculado]. **Solo con los temas visibles al estudiante:** hoy el panel suma T5, T6, T7 y el repaso aunque se vayan a ocultar (inventario de Baki); se filtran con la misma lista que decida la otra célula. Mientras no exista esa lista, se usan los mismos temas que el panel muestra hoy (P7). Hoy es el mismo número que el panel muestra por tema; solo se **resume en uno** (media simple de los temas con al menos 1 actividad con FP). Eso mantiene P7: el script compara contra los porcentajes por tema actuales.
- **Apoyo:** «N activos esta semana de M». N = `conActividad` en el ciclo (hoy «activos este ciclo»), M = `cohorte` [fuente].
- **Opcional, sin dato nuevo:** una palabra de tendencia («Mejor que la semana pasada» / «Igual» / «Peor») con ícono, leída de `panel_tendencia` (existe desde la migración 0020 y el cliente nunca la llama). Va como texto, no como cifra (P5). Si Shibukawa mide que sobrepasa el presupuesto de carga, se quita.
- Un toque en el bloque despliega el **avance por tema** (hoy visible siempre) — sale de la primera pantalla.
- **Color:** cifra en #F8F9FA; barra de avance en teal (progreso). Nada más.

### B2 · Necesitan atención — «¿a quién miro?»
- Fuente: `alertasDelGrupo(cohorte)` [fuente]. **No se cambian umbrales** (siguen provisionales en `alertas.js`); solo cómo se muestran.
- **Orden:** nivel (urgente → atención) y dentro, última actividad más antigua primero.
- **Fila (tocable ≥ 44 px, 8 px de separación):** `[ícono de nivel] Nombre — motivo en ≤ 6 palabras`. Ejemplos de motivos: «No entra hace 2 semanas», «Falla casi todo lo evaluativo», «Responde muy rápido, acierta poco».
- **Riesgo con palabra e ícono, sin coral (P6):** escala de tres, mismas siluetas que `MarcaNivel` (▲ ◆ ●), la palabra al lado:
  - ▲ **Alto** — #F8F9FA sobre fondo de tarjeta, ícono y contorno en #F8F9FA (el peso lo da la forma, no el color)
  - ◆ **Medio** — ámbar #E9C46A (permitido: punto medio de escala de tres)
  - ● **Bajo** — teal #3FA69A (texto pequeño)
  - Así hay **un solo acento** (ámbar) más teal de progreso = 2 acentos (P6).
- **Tope visible 3.** «Ver los N» abre el panel completo de alertas (hoy `BloqueAlertas`), con los mismos `REGLAS_SIN_DATOS` colapsados al final.
- **Destacados** (hoy un bloque propio): pasan a **una línea al pie de B2** («2 van muy bien: ver») — no compiten con atención. Mismo cálculo (`destacados.js`, `precisionPct` 85).

### B3 · Actividad con peor resultado — «¿qué enseñé que no cayó?»
- Contenido: nombre de la actividad (con el tema en gris), **acierto medio** (evaluativa) y «lo terminaron N».
- **Qué cuenta como «peor»:** menor `pct_medio` entre actividades **con al menos 5 terminaciones** (el mismo umbral de 5 que ya usa el diagnóstico por pregunta). Si ninguna llega a 5: «Aún no hay suficientes datos» + cuántas faltan.
- **⚠️ DATO NUEVO.** Hoy `panel_actividad(subject, activity_id)` devuelve una actividad por llamada; calcular la peor exige **58 llamadas en Macroeconomía, 59 en Contabilidad**. No es viable al abrir el panel. Dos salidas, a decidir por Yujiro/Erwin:
  1. **Recomendada:** una RPC de **solo lectura** `panel_peor_actividad(p_subject)` que devuelva `{activity_id, nombre?, pct_medio, n_terminaron}` agregando lo que `panel_actividad` ya calcula. Cero escrituras, cero tablas nuevas (P8 se mantiene: es una función nueva; **Shibukawa debe confirmar que P8 permite una migración de función de lectura** — la vara dice «cero archivos en migraciones», así que esto choca con P8; ver §9).
  2. **Sin tocar esquema:** cargar `panel_actividad` bajo demanda para las **6 actividades más terminadas** (el cliente ya conoce `e.actividades` por estudiante → conteo [calculado]) y elegir la peor entre esas. Honesto en pantalla: «Entre las 6 más hechas». Cubre el caso real (el profesor quiere saber dónde falla *la mayoría*) y no requiere esquema. Costo: 6 llamadas en paralelo tras el primer pintado; B3 muestra esqueleto.
- Un toque en B3 → detalle de esa actividad (hoy `VistaRendimiento`, sin cambios de cifras).

## 5. Qué queda a un clic (≤ 2 toques desde que carga, P3)

| Destino | Camino | Toques |
|---|---|---|
| Rendimiento de la actividad peor | B3 | 1 |
| Rendimiento de **cualquier** actividad general | «Actividades» → elegir | 2 |
| Los N con atención | «Ver los N» en B2 | 1 |
| Avance por tema | tocar B1 | 1 |
| Detalle de un estudiante | tocar su nombre en B2 | 1 |
| Lista completa | «Mis estudiantes» | 1 |

## 6. Vistas aparte (rutas del panel, mismo marco)

### 6.1 «Actividades»
Lista de actividades agrupadas por tema (hoy `actividadesMirables`: Hacer + desafío), cada fila con: nombre, **acierto medio**, **terminaron N de M** (2 cifras por fila, rótulo de columna fijo en encabezado). Orden por defecto: **peor primero** (así B3 y esta vista coinciden). Selector recordado en `fae.docente.actividad.${materia}` (ya existe). Al elegir una: la `VistaRendimiento` actual, con estas simplificaciones **solo de vista**:
- Las 4 tarjetas pasan a **2 arriba** (Acierto medio, Terminaron) y **2 detrás de «Más»** (Tiempo medio, FP medio). Siguen siendo las mismas cifras.
- «Distribución por bandas» y «Quién es quién» se unen: una barra de tres tramos con palabra (Alto / Medio / Bajo), y debajo la lista. Misma lógica `bandas.js` (corte 85 / 60).
- «Diagnóstico por pregunta» **primero**, por encima de la tabla de estudiantes (es lo que el profesor usa para corregir en clase).

### 6.2 «Mis estudiantes»
- La lista de hoy, pero con **filas de 2 datos**: nombre + **una cifra** (última vez) y la marca de nivel. El resto (FP ciclo, FP total, evaluativa, exploratoria, duración) vive en el **detalle** (`DetalleEstudiante`, a un toque).
- Búsqueda por nombre (filtrado en cliente, sobre `estudiantes` ya cargados; no es dato nuevo).
- **Orden por defecto:** atención primero, luego el resto por última vez.
- Paginación en el cliente: 25 filas y «Ver más».
- El botón «En mi grupo / Añadir» se queda **solo en el detalle**, no en cada fila (hoy son 40 botones).

## 7. Estados (P11)

| Estado | B1 | B2 | B3 | Otros |
|---|---|---|---|---|
| **0 estudiantes** | «Aún no tienes estudiantes en esta materia» + una instrucción: «Comparte el código del curso para que se unan» (usar el literal ya existente de invitación si lo hay; si no, **NUEVO**) | Oculto | Oculto | «Mis estudiantes» y «Actividades» deshabilitados con «Disponible cuando haya estudiantes» |
| **1 estudiante** | Cifra de avance + «1 activo de 1» | Si hay alerta, 1 fila; si no, «Nadie necesita atención hoy» (ícono ● Bajo, teal) | «Aún no hay suficientes datos» hasta 5 terminaciones | Promedios no se llaman «de la clase» sino «de tu estudiante» |
| **Curso grande (≥ 60)** | Igual | Tope 3 + «Ver los N» (N puede ser 30; el botón no crece) | Igual | «Mis estudiantes» pagina; la RPC `panel_estudiantes` se llama una sola vez, sin cambio |
| **Error de carga** | Mensaje con coral (el único uso permitido, P6) + «Reintentar» | — | — | `explicarFallo` actual se conserva |
| **Cargando** | Esqueleto de 3 bloques (mismo alto, sin salto de layout) | | | |

## 8. Qué se quita de la primera pantalla (y adónde va)

| Se quita | Adónde |
|---|---|
| Lista de estudiantes | «Mis estudiantes» |
| Las 3 tarjetas de cabecera | B1 (avance + activos) y B4 (desde tu última visita) |
| Lista completa de alertas | «Ver los N» (B2) |
| Bloque Destacados | Línea al pie de B2 |
| Avance por tema siempre visible | Dentro de B1 al tocarlo |
| `REGLAS_SIN_DATOS` | Final del panel completo de alertas |
| Párrafo de cohorte / cuentas de prueba | Pie de «Mis estudiantes», en gris #A8B6C8 |
| Dos de cuatro tarjetas de rendimiento | Detrás de «Más» |
| Botón «En mi grupo» en cada fila | Detalle del estudiante |
| Barra superior (logo, Volver, píldora de FP) y «Exportar informe» | **Se quedan** en el encabezado (38 px); «Exportar informe» pasa a botón de ícono de 44×44 con nombre accesible, a 1 toque |
| «Resumen del periodo» (acierto evaluativas / exploratorias / EN RIESGO) | Acierto evaluativas queda como detalle de B1; exploratorias y EN RIESGO van dentro de «Ver los N» (EN RIESGO = el conteo de urgentes de B2, no se duplica) |

**No se quita ninguna cifra del sistema**: toda cifra de hoy existe a ≤ 2 toques. Eso es lo que sostiene P7.

## 9. Mapeo contra la Vara 1 y conflictos que le digo a Yujiro

| # | Cumple | Cómo |
|---|---|---|
| P1 | Sí | B1, B2, B3 en la primera pantalla a 375 y 1366 |
| P2 | Sí | Lista fuera de la primera pantalla |
| P3 | Sí | §5 |
| P4 | Sí | 3 bloques a 375, 4 a 1366 |
| P5 | Sí | ≈4–6 cifras a 375; ≈7 a 1366; rótulo de 1–2 palabras en cada una |
| P6 | **Con cambio** | Hoy el panel usa coral en «urgente»/«en riesgo»; este diseño lo reemplaza por palabra + forma + ámbar. `MarcaNivel` conserva sus siluetas; **solo cambia el color del nivel urgente** |
| P7 | Sí | Mismas cifras, mismas funciones (`alertas.js`, `bandas.js`, `avancePorTema`); solo se reordenan y resumen |
| P8 | **⚠️ Dos choques** (ver abajo) | |
| P9–P10 | Sí | ≥ 44 px, 8 px de separación, mín. 12 px, foco 2 px #F8F9FA, contraste 4,5:1 |
| P11 | Sí | §7 |

**Choques que Yujiro debe resolver (la vara es reversible, así que decido y aviso):**
1. **`panel_resumen` ESCRIBE** (avanza `docentes.ultima_visita`, ventana de 30 min). P8 pide «cero escrituras». El bloque B4 «Desde tu última visita» depende de ella. **Recomendación:** P8 debe leerse como «el rediseño no **agrega** escrituras»; la escritura ya existe y se conserva tal cual. Si Shibukawa lo lee estricto, B4 se quita en este PR y vuelve después con otra fuente. Decisión pedida a Yujiro.
2. **`marcarEnGrupo`** (botón «En mi grupo») es una escritura existente por acción explícita del profesor. Mismo criterio: se conserva, no es nueva, y se mueve al detalle.
3. **`panel_peor_actividad`** (B3, salida 1) sería una migración nueva de solo lectura y choca con «cero archivos en migraciones». Por eso la **salida 2 es la que arranca**; la 1 queda como mejora si Erwin y Shibukawa la aprueban.

## 10. Componentes (para los constructores)

| Componente | Reemplaza / reutiliza | Notas |
|---|---|---|
| `PanelDocente` | existente | Solo orquesta: encabezado + 3 bloques + rutas internas |
| `ResumenClase` (B1) | `CabeceraResumen` + parte de `porTema` | Cifra grande + apoyo + despliegue de temas |
| `AtencionAhora` (B2) | `BloqueAlertas` (modo compacto) + `Destacados` (1 línea) | Reutiliza `alertasDelGrupo`, `MarcaNivel` |
| `PeorActividad` (B3) | nuevo | Usa la salida 2 de §4 |
| `ListaActividades` | selector actual | Orden peor-primero |
| `VistaRendimiento` | existente | Reordenar secciones; 2+2 tarjetas |
| `ListaEstudiantes` | `TablaEstudiantes`/`FilaEstudiante` | Fila de 2 datos; búsqueda; paginación |
| `DetalleEstudiante` | existente | Recibe el botón de grupo |

Nada de lo anterior toca `datos.js`, `alertas.js`, `bandas.js` ni el esquema.

## 11. Anatomía y medidas

- Marco: maxWidth **1040** (el actual). Gutter 16 px a 375.
- **375 px:** una columna; B1 (alto ≈ 120), B2 (≈ 3 filas de 56 = 168 + encabezado + pie ≈ 240), B3 (≈ 120). Suma ≈ 480 + encabezado 56 = 536, cabe en 667 con 100 de margen.
- **1366 px:** rejilla `repeat(3, minmax(0,1fr))`, gap 16; B4 debajo.
- Fila tocable de B2: mín. alto 56, ancho completo; la flecha de «ver» no cuenta como objetivo separado.
- Tipografía: cifra grande Sora 36; títulos de bloque Sora 14; cuerpo Inter 14–15; nunca menos de 12.
- Tarjeta #1C2939; fondo #0E1B2E; borde 1 px rgba(248,249,250,.08).
- Movimiento: ninguno nuevo en bucle; entrada de bloques con la curva `cubic-bezier(.3,.9,.4,1)`, opacity + translateY 12 px, 280 ms, escalonado 0/80/160 ms; conteo animado de la cabecera actual (180 ms) solo en B1; todo con `prefers-reduced-motion` = sin movimiento.

## 12. Paradas de medición (no se decide sin medir)

| Parada | Qué medir | Quién |
|---|---|---|
| ⛔ P7 | Script que extrae cada cifra por estudiante y por actividad en el panel viejo y el nuevo, mismos datos | Baki + Shibukawa |
| ⛔ B3 salida 2 | Tiempo de carga de las 6 llamadas en paralelo (objetivo < 1,5 s tras primer pintado) | Baki |
| ⛔ [supuesto] «avance de la clase» | Contrastar la media simple de temas con lo que hoy se ve por tema; si difiere de la intuición del docente, ajustar el rótulo (no la fórmula) | Yujiro con Mateo |
| ⛔ 320 px | Sin scroll horizontal con nombres largos (truncado con elipsis + `title`) | Shibukawa |
| ⛔ Curso grande | Captura con el curso más grande real, solo lectura | Shibukawa |

## 13. Deuda y siguiente versión

- Los umbrales de alertas siguen provisionales. Cuando Mateo/Yujiro los fijen, B2 mejora sin cambio de diseño.
- «Peor actividad» podría ser «actividad con más variación»; decidir tras ver uso real.
- B4 depende de la decisión sobre `panel_resumen`.
- Inventario de Baki (`feat/conta-d4-panel-inventario`): cuando llegue a main lo cruzo contra §8 para confirmar que no se quita nada que alguien use. Si aparece algo, se agrega aquí sin tocar la jerarquía.

## 14. Orden de construcción sugerido

1. `ResumenClase` + `AtencionAhora` + esqueleto (todo con datos ya existentes).
2. `ListaEstudiantes` en ruta aparte y detalle con el botón de grupo.
3. `ListaActividades` + reordenar `VistaRendimiento`.
4. `PeorActividad` (salida 2).
5. Pasada P1–P11 con capturas a 375 y 1366 y los tres estados.

## 15. Cruce con el inventario de Baki (#472, 23 oct)

Lo medido cambia tres cosas de mi lectura; el resto de la jerarquía queda igual.

1. **La «lista larga de estudiantes» que ve Mateo primero es el bloque Alertas**, no la lista de estudiantes: una tarjeta de 127 px por alerta a 375 px (8 alertas = 1.110 px, casi dos pantallas), a partir de y = 667. B2 con tope de 3 filas de 56 px (≈ 170 px) lo resuelve de raíz. La lista de estudiantes (28 filas, 4.269 px) igual sale de la primera pantalla.
2. **Llegar a «cómo les fue en las actividades» cuesta hoy 3.872 px a 375 (5,8 pantallas)** y 2.524 a 1366. Con §5 son 2 toques, sin desplazamiento.
3. **Página entera:** 10.638 px a 375 y 6.752 a 1366. Meta de la primera vista nueva: el panel de entrada cabe en una pantalla (≈ 540 px a 375), y cada vista aparte crece solo con su lista.

Cruce de bloques del inventario contra §8 (nada queda sin casa):

| Inventario | Dónde queda |
|---|---|
| 1 Barra superior · 2 Título · 3 Selector de materia | Encabezado (selector dentro de B1) |
| 4 Frase de cohorte | Pie de «Mis estudiantes» |
| 5 Cabecera resumen (3 tarjetas) | B1 (activos, avance) · B2 (alertas) · B4 (desde tu última visita) |
| 6 Alertas | B2 (3 filas) → «Ver los N» |
| 7 Destacados | Línea al pie de B2 → misma pantalla de «Ver los N» |
| 8 Resumen del periodo | §8, última fila |
| 9 Avance por tema | Dentro de B1, solo temas visibles |
| 10 Rendimiento por actividad | «Actividades» + B3 |
| 11 / 11b Estudiantes y detalle | «Mis estudiantes» y detalle |

**Datos que ya existen y uso (sin tocar esquema):** `panel_tendencia` (palabra de tendencia en B1) y `panel_estudiantes.actividades` (conteo de las 6 más hechas para B3). **No uso, pero quedan anotados para la v2:** acierto por subtema (`panel_items` + `subtemas.js`: «qué hay que volver a explicar») y `panel_grupo_actividad.ultimo` (quién no volvió a intentar la actividad).

**Teal:** el inventario señala que el panel usa teal para «bien» y en Contabilidad el teal es DEBE. Decisión mía (reversible): el panel es una herramienta del profesor, no una pieza de Contabilidad, y no muestra debe ni haber; teal = progreso y bien en todo el panel. Si Shibukawa lo lee de otro modo, el cambio es solo de color.

**Decisiones de Yujiro (23 oct, 11:06) incorporadas:** P8 = «el rediseño no AGREGA escrituras», `panel_resumen` y `marcarEnGrupo` se quedan y **B4 entra**; B3 arranca con la salida 2 («Entre las 6 más hechas»); P6 resuelto con palabra + forma, sin coral; el rótulo de «avance de la clase» lo decide Shibukawa con la captura (se cambia el rótulo, no la fórmula).
