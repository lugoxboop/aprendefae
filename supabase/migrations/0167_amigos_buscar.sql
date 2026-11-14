-- ═══════════════════════════════════════════════════════════════════════════
-- 0167 — BUSCAR AMIGOS POR APODO (con sugerencias mientras se escribe)
--
-- GUARDIAN: cambio de esquema a proposito
--
-- Para agregar a alguien había que saber su apodo EXACTO. Esto permite buscar:
-- al escribir unas letras, la base devuelve los apodos que empiezan por eso (y
-- luego los que lo contienen), para mostrarlos como sugerencias.
--
-- Qué devuelve y qué NO: solo el apodo y la mascota —lo que ya se ve de cada
-- quien en el ranking—. Nunca el nombre real ni el correo. Deja fuera a uno
-- mismo y a quienes YA son amigos (a esos no hay que volver a buscarlos).
--
-- Función de solo lectura (stable). Rango del coordinador. Aditiva.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.amigos_buscar(p_texto text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_q   text := btrim(coalesce(p_texto, ''));
begin
  -- Con menos de dos letras no se sugiere nada: media base no es una sugerencia.
  if v_uid is null or char_length(v_q) < 2 then
    return '[]'::jsonb;
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
             'apodo', t.apodo, 'user_id', t.user_id,
             'mascota_especie', t.mascota_especie, 'mascota_nombre', t.mascota_nombre,
             'mascota_paleta', t.mascota_paleta, 'mascota_ojos', t.mascota_ojos,
             'mascota_puestos', t.mascota_puestos
           ) order by t.orden, lower(t.apodo))
    from (
      select
        p.nickname as apodo,
        p.user_id  as user_id,
        p.mascota_especie, p.mascota_nombre, p.mascota_paleta, p.mascota_ojos, p.mascota_puestos,
        -- Primero los que EMPIEZAN por el texto; después los que lo contienen.
        case when p.nickname ilike v_q || '%' then 0 else 1 end as orden
      from public.profiles p
      where p.user_id <> v_uid
        and p.nickname is not null
        and p.nickname ilike '%' || v_q || '%'
        -- Fuera los que ya son amigos aceptados (en cualquier dirección).
        and not exists (
          select 1 from public.amistades a
           where a.estado = 'aceptada'
             and ((a.solicitante = v_uid and a.receptor = p.user_id)
               or (a.solicitante = p.user_id and a.receptor = v_uid))
        )
      order by (case when p.nickname ilike v_q || '%' then 0 else 1 end), lower(p.nickname)
      limit 8
    ) t
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.amigos_buscar(text) from public, anon;
grant execute on function public.amigos_buscar(text) to authenticated;
