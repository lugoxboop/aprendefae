# Bitácora — Magno

> Léela al empezar cualquier chat, ANTES de hacer nada. Actualízala al cerrar un bloque de trabajo. Máximo ~60 líneas: lo viejo se condensa y lo histórico va a `orquestador/memoria/archivo/magno-AAAA-MM.md`. Hora real de Bogotá en cada entrada.

## Quién soy y mi alcance
- General de Planck, con la misma autonomía que Erwin. Logo verde.
- Mi misión específica me la da Mateo en el primer mensaje; mientras tanto no inicio trabajo por mi cuenta. Aún sin célula asignada.
- Lo crítico (irreversible) se escala a Miku; lo reversible lo decido yo y lo cuento en el resumen.
- Antes de abrir nada: primero `orquestador/INDICE.md`, luego el buscador del canon (regla k).

## En qué estoy ahora
- 2026-11-27 12:18 — Gestión de Proyectos (PMBOK V6), pedido de Mateo: esqueleto de la materia (fundamentos caps. 1-2 + 5 grupos de procesos, 49 procesos con sus documentos) y espacios vacíos para las piezas de Jane y Gen, en src/gestion-proyectos/. Oculta: solo #/gestion-proyectos, fuera de subjects.js y de la portada (una prueba lo vigila). Plan y contrato común en orquestador/conocimiento/gestion-proyectos/plan.md. Falta el syllabus y la guía V6 (pedidos a Mateo). PR abierto.
- 2026-11-25 12:53 — Racha con la mascota (pedido de Mateo): el momento de racha ya no es el teseracto del piloto; sale la mascota del estudiante feliz delante de una llama redonda viva, el número sube de ayer a hoy y la semana va en llamitas. La llama pequeña (ficha de cuenta y Repaso) también pasa a redonda. Conteo y disparo intactos. Video 320/375 + verificador: PASA. PR abierto, espera visto bueno de Mateo.
- 2026-11-20 17:05 — Salas de entrenamiento + duelo 1 vs 1 (pedido de Mateo): lobby estilo juego con mascotas, el creador elige tema y arranca, partida de preguntas que avanza sola, podio. Migración 0172 (tablas entreno_*, aparte de la Clase en vivo). Los amigos de demostración juegan como bots en la sala de su dueño. PR #714 fusionado y desplegado ~17:50 con el visto bueno de Mateo.
- 2026-11-20 17:59 — Emotes en las salas: 12 festejos de la mascota en lobby y podio. Migración 0173. Fusionado (#716) con aprobación de Mateo.
- 2026-11-20 12:52 — Fondo vivo en 6 pantallas planas. Fusionado y desplegado (#712).
- 2026-11-20 10:00 — Amigos en el inicio: fila de mascotas, sugerencias, 11 amigos de demostración (0170). Fusionado y desplegado (#709).
- 2026-11-18 17:54 — Auditoría de navegación (pedida por Mateo): X del menú muerta, sin botón visible a Inicio en las materias, «Salir» de Clase en vivo tapado en celular, Tienda en blanco al entrar directo. Fusionado (#697).

## Decisiones tomadas y por qué
- 2026-11-18 — El nombre iba a ser «Levi», pero Levi ya es el paso de revisión del motor (Gen→Levi→Xeno) incrustado en el código; para evitar choques, el general se llama Magno.

## Pendientes
- Gestión de Proyectos: con el syllabus, ajustar nombre exacto, módulos y subtemas en estructura.js.

## Lo que aprendí que no hay que repetir
- 2026-11-27 — Una materia nueva NO va a subjects.js hasta publicarse: medallas.js, el panel docente y el banner de Repaso recorren todas las materias de SUBJECTS, así que solo estar ahí ya la hace visible.
- 2026-11-25 — Banco de video de un componente: página Vite en scripts/<tema>/capturas/ que monta el componente real; grabar con Playwright, recortar el calentamiento con ffmpeg y sacar hojas de contacto a 8 fps para el verificador. Una transición CSS puesta desde el primer cuadro anima la medida inicial (el bloque «bajaba» al abrir): ponerla solo cuando hace falta.
- Los amigos de demostración NO son cuentas (tabla aparte): así no salen en ranking, ligas, panel docente ni búsqueda. Sembrar cuentas falsas en auth.users ensuciaría todo eso.
- Las migraciones no llevan begin/commit: el despliegue las aplica con psql -1.
- Para probar una pantalla con la base DE VERDAD sin Supabase: Postgres local con todas las migraciones y un puente que ejecuta cada rpc/<fn> del navegador como el usuario (scripts/entreno/partida.mjs). Prueba la lógica real, no respuestas inventadas.
- Las sondas de captura usan «reducir movimiento»: así NO se ven los fallos que solo existen con la animación puesta (la X tapada por la fila animada). Para probar toques, sonda con movimiento normal y elementFromPoint.
- 2026-11-21 — Regla p (evidencia visual): prohibido decir «listo/corregido» en animaciones, transiciones o arreglos visuales sin grabar video de la parte en la página real a 320 y 375 px (Playwright) y revisar cuadro por cuadro; la entrega incluye el video. Grabar el error antes y después del arreglo. Quien construye no aprueba: Ukyo u otro verificador ve el video sin el código y da PASA/NO PASA. Tras 2 intentos fallidos, cambiar de técnica y usar el modelo más potente. Si Mateo reporta algo mal tras un «listo», es falla grave: anotar causa y regla.
