# Bitácora — Magno

> Léela al empezar cualquier chat, ANTES de hacer nada. Actualízala al cerrar un bloque de trabajo. Máximo ~60 líneas: lo viejo se condensa y lo histórico va a `orquestador/memoria/archivo/magno-AAAA-MM.md`. Hora real de Bogotá en cada entrada.

## Quién soy y mi alcance
- General de Planck, con la misma autonomía que Erwin. Logo verde.
- Mi misión específica me la da Mateo en el primer mensaje; mientras tanto no inicio trabajo por mi cuenta. Aún sin célula asignada.
- Lo crítico (irreversible) se escala a Miku; lo reversible lo decido yo y lo cuento en el resumen.
- Antes de abrir nada: primero `orquestador/INDICE.md`, luego el buscador del canon (regla k).

## En qué estoy ahora
- 2026-11-20 17:05 — Salas de entrenamiento + duelo 1 vs 1 (pedido de Mateo): lobby estilo juego con mascotas, el creador elige tema y arranca, partida de preguntas que avanza sola, podio. Migración 0172 (tablas entreno_*, aparte de la Clase en vivo). Los amigos de demostración juegan como bots en la sala de su dueño. PR #714 fusionado y desplegado ~17:50 con el visto bueno de Mateo.
- 2026-11-20 17:59 — Emotes en las salas (pedido de Mateo): botón Emotes en el lobby y el podio, bandeja con los 12 festejos que ya tiene la mascota (FESTEJOS de marionetas.js, nada dibujado nuevo), burbuja con el emoji 5 s, se ve en todos los celulares por la base. Los bots también hacen emotes. Migración 0173. Sonda scripts/entreno/emotes.mjs 21/21. Espera aprobación de Mateo para publicar.
- 2026-11-20 12:52 — Fondo vivo en 6 pantallas planas. Fusionado y desplegado (#712).
- 2026-11-20 10:00 — Amigos en el inicio: fila de mascotas, sugerencias, 11 amigos de demostración (0170). Fusionado y desplegado (#709).
- 2026-11-18 17:54 — Auditoría de navegación (pedida por Mateo): X del menú muerta, sin botón visible a Inicio en las materias, «Salir» de Clase en vivo tapado en celular, Tienda en blanco al entrar directo. Fusionado (#697).

## Decisiones tomadas y por qué
- 2026-11-18 — El nombre iba a ser «Levi», pero Levi ya es el paso de revisión del motor (Gen→Levi→Xeno) incrustado en el código; para evitar choques, el general se llama Magno.

## Pendientes
- 

## Lo que aprendí que no hay que repetir
- Los amigos de demostración NO son cuentas (tabla aparte): así no salen en ranking, ligas, panel docente ni búsqueda. Sembrar cuentas falsas en auth.users ensuciaría todo eso.
- Las migraciones no llevan begin/commit: el despliegue las aplica con psql -1.
- Para probar una pantalla con la base DE VERDAD sin Supabase: Postgres local con todas las migraciones y un puente que ejecuta cada rpc/<fn> del navegador como el usuario (scripts/entreno/partida.mjs). Prueba la lógica real, no respuestas inventadas.
- Las sondas de captura usan «reducir movimiento»: así NO se ven los fallos que solo existen con la animación puesta (la X tapada por la fila animada). Para probar toques, sonda con movimiento normal y elementFromPoint.
- 2026-11-21 — Regla p (evidencia visual): prohibido decir «listo/corregido» en animaciones, transiciones o arreglos visuales sin grabar video de la parte en la página real a 320 y 375 px (Playwright) y revisar cuadro por cuadro; la entrega incluye el video. Grabar el error antes y después del arreglo. Quien construye no aprueba: Ukyo u otro verificador ve el video sin el código y da PASA/NO PASA. Tras 2 intentos fallidos, cambiar de técnica y usar el modelo más potente. Si Mateo reporta algo mal tras un «listo», es falla grave: anotar causa y regla.
