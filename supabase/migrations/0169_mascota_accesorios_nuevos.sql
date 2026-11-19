-- ═══════════════════════════════════════════════════════════════════════════
-- 0169 — VEINTE ACCESORIOS NUEVOS PARA LA MASCOTA
--
-- GUARDIAN: cambio de esquema a proposito
--
-- La tienda pasa de cinco accesorios a veinticinco. Los nuevos están
-- ilustrados como piezas de las marionetas (public/mascotas/accesorios/) y se
-- ubican sobre cada especie en src/mascota/accesorios-marioneta.js.
--
-- Esto solo AMPLÍA la lista de precios: los cinco de la 0165 (gorro, gafas,
-- bufanda, moño, bigote) conservan su clave y su precio, así que lo que cada
-- estudiante ya compró o lleva puesto sigue igual. No se toca ninguna columna
-- ni ninguna fila; comprar y equipar (0165) ya sirven para cualquier clave
-- que tenga precio. Los precios están también en src/cristales/cristales.js
-- (PRECIO_ACCESORIO) y cristales.test.mjs lee este archivo.
--
-- Rango del coordinador (0150-0199). Aditivo e idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.precio_accesorio(p_clave text)
returns integer
language sql
immutable
set search_path = public
as $$
  select case p_clave
    -- los cinco de la 0165, sin cambios
    when 'gorro'     then 60
    when 'gafas'     then 40
    when 'bufanda'   then 45
    when 'mono'      then 50
    when 'bigote'    then 35
    -- los veinte nuevos
    when 'gorra'     then 50
    when 'corona'    then 55
    when 'audifonos' then 70
    when 'vaquero'   then 75
    when 'pirata'    then 80
    when 'birrete'   then 85
    when 'mago'      then 90
    when 'casco'     then 150
    when 'gafas_sol' then 50
    when 'parche'    then 45
    when 'antifaz'   then 55
    when 'collar'    then 40
    when 'corbatin'  then 35
    when 'corbata'   then 50
    when 'medalla'   then 100
    when 'traje'     then 120
    when 'mochila'   then 65
    when 'capa'      then 110
    when 'alas'      then 130
    when 'jetpack'   then 150
    else null
  end;
$$;

revoke all on function public.precio_accesorio(text) from public, anon;
grant execute on function public.precio_accesorio(text) to authenticated;
