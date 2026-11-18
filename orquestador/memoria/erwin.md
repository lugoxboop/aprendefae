# Bitácora — Erwin

> Léela al empezar cualquier chat, ANTES de hacer nada. Actualízala al cerrar un bloque de trabajo. Máximo ~60 líneas: lo viejo se condensa y lo histórico va a `orquestador/memoria/archivo/erwin-AAAA-MM.md`. Hora real de Bogotá en cada entrada.

## Quién soy y mi alcance
- General — Célula A y lo compartido (componentes comunes y datos de estudiantes).
- Manda la Célula A y lo compartido: componentes comunes, choques entre células y datos de estudiantes. Destraba generales. No hace el trabajo de los generales.
- Antes de abrir nada: primero `orquestador/INDICE.md`, luego el buscador del canon (regla k).

## En qué estoy ahora
- 2026-11-18 17:42 — Mascotas animadas (pedido de Mateo): las 6 especies pasan a marionetas de piezas de Gemini (`src/mascota/marionetas.js`, piezas en `public/mascotas/`), 5 ánimos y 7 pelajes. Perfil en «tranquila», el resto quieto; hasta 64 px se encuadra el busto. Pendiente: accesorios y color de ojos sobre las marionetas, y conectar los ánimos a racha/respuestas.
- 2026-11-18 13:17 — Rediseño del ranking (pedido de Mateo): podio para el top 3 con la mascota a 96 px, filas en ficha con la mascota a 48, tu fila en teal con «Tú», esqueleto de carga. Componente compartido (por materia y general). Capturas en `orquestador/revisiones/ranking-rediseno/`; banco en `scripts/ranking/capturas/`.
- 2026-11-18 08:57 — Rediseño del banner del Repaso Diario (pedido de Mateo): medalla con anillo hacia el próximo bono de racha, costo visible cerrado (ítems y FP), expansión con pastillas de temas, fichas y un botón grande. PR abierto; capturas en `orquestador/revisiones/repaso-diario/`.

## Decisiones tomadas y por qué
- 2026-11-18 — Mascotas: «natural» pinta el arte tal cual; las otras paletas tiñen solo el pelaje (capa en grises _p + filtro feComponentTransfer con la rampa de la especie). El CSS va como texto JS (`marioneta-estilo.js`) porque el cargador de pruebas no importa .css.
- 2026-11-18 — Podio del ranking: es forma, no iconografía (sin trofeos ni coronas, kit). 1.º ámbar, 2.º node (plata de la marca), 3.º teal. Tamaños nuevos en TAMANOS: `podio` 96 y `fila` 48; `ranking` 36 se queda para la figura vieja.
- 2026-11-18 — El banner del Repaso enseña «qué está en juego» (próximo bono 3/7/14/30) porque las rachas retienen por miedo a perder (estudio Mobbin, Duolingo). La llama cerrada sigue quieta; el coral del CSS solo en el brillo del fuego.

## Pendientes
- 

## Lo que aprendí que no hay que repetir
- 2026-11-15 — Regla m del protocolo (ingeniería de contexto): lo pesado a un subagente que devuelve ~15 líneas, texto y no capturas, un tema por chat, el modelo justo (Haiku lo mecánico), índice→buscador→archivo, comandos recortados, solo las herramientas en uso, memoria en caché para lo automático. Línea base de tokens por tarea tomada 15-nov; comparar en una semana.
