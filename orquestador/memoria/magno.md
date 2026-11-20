# Bitácora — Magno

> Léela al empezar cualquier chat, ANTES de hacer nada. Actualízala al cerrar un bloque de trabajo. Máximo ~60 líneas: lo viejo se condensa y lo histórico va a `orquestador/memoria/archivo/magno-AAAA-MM.md`. Hora real de Bogotá en cada entrada.

## Quién soy y mi alcance
- General de Planck, con la misma autonomía que Erwin. Logo verde.
- Mi misión específica me la da Mateo en el primer mensaje; mientras tanto no inicio trabajo por mi cuenta. Aún sin célula asignada.
- Lo crítico (irreversible) se escala a Miku; lo reversible lo decido yo y lo cuento en el resumen.
- Antes de abrir nada: primero `orquestador/INDICE.md`, luego el buscador del canon (regla k).

## En qué estoy ahora
- 2026-11-20 12:52 — Fondo vivo (malla del inicio) en las 6 pantallas que lo tenían plano: Perfil (y avatar), Panel docente, Qué es, Clase en vivo (estudiante y profesor). Sonda scripts/navegacion/fondos.mjs. Rama claude/project-thread-ypbvcc; espera aprobación de Mateo para fusionar.
- 2026-11-20 10:00 — Amigos en el inicio (pedido de Mateo): fila de círculos con mascotas entre el titular y las materias; sin amigos, sugerencias con «Añadir»; ficha del otro con «Enviar solicitud». Migración 0170 (tabla amigos_demo, 11 de demostración para Lugox173, función amigos_inicio). Fusionado y desplegado (#709) el 2026-11-20 ~10:10.
- 2026-11-18 17:54 — Auditoría de navegación (pedida por Mateo): X del menú muerta, sin botón visible a Inicio en las materias, «Salir» de Clase en vivo tapado en celular, Tienda en blanco al entrar directo. Fusionado (#697).

## Decisiones tomadas y por qué
- 2026-11-18 — El nombre iba a ser «Levi», pero Levi ya es el paso de revisión del motor (Gen→Levi→Xeno) incrustado en el código; para evitar choques, el general se llama Magno.

## Pendientes
- 

## Lo que aprendí que no hay que repetir
- Los amigos de demostración NO son cuentas (tabla aparte): así no salen en ranking, ligas, panel docente ni búsqueda. Sembrar cuentas falsas en auth.users ensuciaría todo eso.
- Las migraciones no llevan begin/commit: el despliegue las aplica con psql -1.
- Las sondas de captura usan «reducir movimiento»: así NO se ven los fallos que solo existen con la animación puesta (la X tapada por la fila animada). Para probar toques, sonda con movimiento normal y elementFromPoint.
