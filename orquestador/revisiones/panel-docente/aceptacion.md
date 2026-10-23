# Varas de aceptación · Célula D (Shibukawa, 23 oct 2026)

Se fijan antes de construir, para que nadie construya sin saber cómo se le va a juzgar. El nivel sigue siendo el mínimo de las dimensiones, nunca el promedio.

## Vara 1 · Panel docente

Se mide en captura a 375×667 y 1366×768, con datos reales en modo de solo lectura.

| # | Comprobación | Cómo se mide | Umbral |
|---|---|---|---|
| P1 | Lo relevante, arriba y sin bajar | Captura sin scroll en ambos anchos | Sin scroll se ven: (a) el avance de la clase en una cifra, (b) quiénes necesitan atención (nombre y motivo) y (c) la actividad con peor desempeño. Si falta una, FALLA |
| P2 | La lista de estudiantes no va primero | Orden de bloques en el DOM y en la captura | A 375 px la lista completa no aparece en la primera pantalla. A 1366 px puede asomar, pero debajo de P1 |
| P3 | El rendimiento por actividades generales sigue al alcance | Contar toques desde que carga el panel | Máximo 2 toques, sin escribir nada y sin salir del panel |
| P4 | Ruido: bloques | Contar tarjetas o secciones distintas en la primera pantalla | 375 px: ≤ 3. 1366 px: ≤ 5 |
| P5 | Ruido: cifras | Contar números visibles en la primera pantalla | 375 px: ≤ 6. 1366 px: ≤ 10. Ninguna cifra sin un rótulo de una o dos palabras |
| P6 | Ruido: colores | Leer por píxel los colores que tienen rol | Solo los de la paleta y máximo 2 colores de acento en la primera pantalla. Coral solo para error de carga, nunca para «estudiante en riesgo». El nivel de riesgo va con palabra e ícono; el ámbar solo como punto medio de una escala de tres |
| P7 | Las cifras no cambian | Con el mismo conjunto de datos, panel viejo contra nuevo; un script extrae cada cifra por estudiante y por actividad | 100 % de coincidencia. Una sola diferencia es FALLA y bloquea la fusión |
| P8 | Los datos y el esquema no se tocan | Diff del PR, más las peticiones de red durante una sesión completa | Cero archivos en migraciones o en el esquema. El rediseño no AGREGA escrituras: las dos que ya existen (`panel_resumen`, que avanza `docentes.ultima_visita`, y `marcarEnGrupo`, por acción explícita del profesor) se conservan tal cual, y cualquier otra insert, update, delete o rpc de escritura es FALLA. Suite en verde. (Ajuste de Yujiro, 23 oct, tras el §9 de Ukyo en `panel-docente-v1.md`) |
| P9 | Tamaño de toque | Medir la caja de cada elemento interactivo | ≥ 44×44 px |
| P10 | Contraste y tamaño de letra | Por píxel, contra el fondo real de cada superficie | Texto ≥ 4,5:1 y lo que no es texto ≥ 3:1. Nada por debajo de 12 px. Sin scroll horizontal a 320 ni a 375 px |
| P11 | Estados límite | Captura con 0 estudiantes, con 1 y con el curso más grande | Ninguno rompe P1 a P10. El estado vacío dice qué hacer |

## Vara 2 · Aprender tipo presentación (T4, A0 a A5)

| # | Comprobación | Cómo se mide | Umbral |
|---|---|---|---|
| A1 | Muro de texto por pantalla | Palabras visibles en cada pantalla (sin contar botones) y líneas a 320 px | ≤ 60 palabras y ≤ 8 líneas a 320 px. Pasarse en cualquiera de las dos ya es muro |
| A2 | Primera decisión (D4) | Captura de la pantalla 1 | La primera decisión ocurre en la pantalla 1, antes de 60 palabras |
| A3 | Pantallas pasivas seguidas | Marcar cada pantalla como «acción» o «lectura» | Nunca dos pantallas de lectura seguidas, y al menos el 60 % de las pantallas lleva acción |
| A4 | «Seguir» | Jugar la pieza | En las pantallas con acción aparece solo tras el acierto. En las de lectura vale como avance, con el límite de A3 |
| A5 | Una idea por pantalla e hilo lógico | Leer en orden el título o la idea de cada pantalla | Cada pantalla tiene una idea que se dice en una frase y usa lo que dejó la anterior. Si una pantalla se puede quitar sin romper el hilo, FALLA |
| A6 | D4 Medio y Avanzado | Contar decisiones distintas con la regla estricta de Miku (17 oct) | Medio: ≥ 2 decisiones distintas. La misma pregunta sobre otro caso no cuenta |
| A7 | D6 | Provocar cada error | Respuesta en menos de 500 ms. Medio: explica el porqué. Avanzado: ≥ 2 mensajes ligados a errores distintos |
| A8 | D9 | Captura y transición entre pantallas | El cambio de pantalla no cuenta como animación: un elemento propio tiene que moverse o cambiar por la acción del estudiante. Nunca queda en HUECO |
| A9 | Resto del Kit (D1, D2, D3, D5, D7, D8) | El Kit literal, aplicado a la secuencia entera | Objetivo en una oración en la pantalla 1 (D2 Básico). El nivel de la pieza es el mínimo de las 9 dimensiones |
| A10 | Legibilidad | `npm run inflesz` por pantalla, con las seis frases de control antes | ≥ 65 en todo texto de 10 palabras o más |
| A11 | Lo publicado | Diff contra el paquete desplegado | Solo se agrega. No se borra ni cambia contenido aprobado ni ids `t4-`, y el progreso de los estudiantes sigue apuntando a ids que existen |

## Falla automática (NO PASA, sin más análisis)

- **Panel:** se rompe P7 o P8, o la lista de estudiantes aparece como primer bloque.
- **Aprender:** la pantalla 1 no tiene decisión, hay dos pantallas de lectura seguidas, alguna pantalla pasa de 60 palabras, alguna dimensión queda en HUECO, o un id está borrado o renombrado.

**Riesgo.** El formato de presentación empuja por sí solo hacia «lectura + Seguir» en diapositivas, que es el «libro digital» que Mateo ya rechazó. A1 a A3 existen para frenarlo. Si una pieza solo cumple partiéndose en pantallas de lectura, se reconstruye (Kit §6); no se reparte en más pantallas.
