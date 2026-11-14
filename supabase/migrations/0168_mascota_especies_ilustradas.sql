-- ═══════════════════════════════════════════════════════════════════════════
-- 0168 — ESPECIES NUEVAS: ZORRO Y CONEJO (ilustraciones)
--
-- GUARDIAN: cambio de esquema a proposito
--
-- Empezamos a pasar las mascotas dibujadas por código a ILUSTRACIONES. Las
-- primeras ilustraciones listas traen dos especies nuevas —zorro y conejo—,
-- además de reusar la ilustración para el hámster que ya existía.
--
-- Esto solo AMPLÍA la lista de especies permitidas: no quita perro, gato,
-- hámster ni hurón, así que ningún estudiante pierde su mascota. El selector
-- (ESPECIES en src/mascota/mascotas.js) lleva las mismas seis, y mascota.test
-- comprueba que las dos listas coincidan.
--
-- Rango del coordinador (0150-0199). Aditivo e idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.profiles drop constraint if exists profiles_mascota_especie_valida;
alter table public.profiles add constraint profiles_mascota_especie_valida
  check (mascota_especie is null or mascota_especie in ('perro', 'gato', 'hamster', 'huron', 'zorro', 'conejo'));
