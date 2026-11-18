# Bitácora — Miku

> Léela al empezar cualquier chat, ANTES de hacer nada. Actualízala al cerrar un bloque de trabajo. Máximo ~60 líneas: lo viejo se condensa y lo histórico va a `orquestador/memoria/archivo/miku-AAAA-MM.md`. Hora real de Bogotá en cada entrada.

## Quién soy y mi alcance
- General de generales (por encima de las 5 células).
- Coordina las cinco células y revisa a cada general; las órdenes de Mateo para todas las células llegan por ella; lleva a Mateo lo crítico y lo bloqueado.
- Antes de abrir nada: primero `orquestador/INDICE.md`, luego el buscador del canon (regla k).

## En qué estoy ahora
- 2026-11-18 10:12 — Panel docente con la estética de la barra lateral (#681): iconos en pastilla de color en cada bloque, tarjetas con brillo y sombra, «Ver más a fondo» como opciones del menú con entrada en fila, fondo con brillo. Sin tocar el botón flotante «Panel docente» (otro hilo). Sonda `scripts/t4/panel-docente/capturas-estetica.mjs`.
- 2026-11-18 — La barra lateral de la cuenta (#681) ya está fusionada.
- (fusionado 18-nov) 2026-11-15 14:39 — Menú de cuenta rehecho como barra lateral desde la izquierda (iconos, cifras FP/Cristales/racha, animada); cuenta a la izquierda y logo a la derecha en todas las cabeceras. PR abierto, esperando revisión de Mateo. Capturas en `revisiones/sidebar-cuenta/`; sonda en `scripts/cuenta/capturas-sidebar.mjs`.
- 2026-11-14 20:48 — Montando la memoria de los agentes: creado INDICE.md, reglas k y l del protocolo, y bitácora semilla de los 27 agentes. Falta Graphify (pri. 2), complementos (pri. 3), la decisión de Mateo sobre proyectos de Claude (punto 5) y la verificación.

## Decisiones tomadas y por qué
- 2026-11-14 — La bitácora se siembra con identidad y alcance; cada agente llena el resto. No se borra nada del canon: lo obsoleto se marca en el índice.

## Pendientes
- 

## Lo que aprendí que no hay que repetir
- Para ver la app con sesión sin Supabase: build con `VITE_SUPABASE_URL=http://fake.supabase.test`, sesión fingida en localStorage `aprendefae-auth` y rutas falsas (patrón de `scripts/t4/panel-docente/pagina.mjs` y `scripts/cuenta/`).
- 2026-11-15 — Regla m del protocolo (ingeniería de contexto): lo pesado a un subagente que devuelve ~15 líneas, texto y no capturas, un tema por chat, el modelo justo (Haiku lo mecánico), índice→buscador→archivo, comandos recortados, solo las herramientas en uso, memoria en caché para lo automático. Línea base de tokens por tarea tomada 15-nov; comparar en una semana.
