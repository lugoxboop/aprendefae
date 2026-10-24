-- ---------------------------------------------------------------------------
-- 0152 — EL REPASO DIARIO DE CONTABILIDAD
--
-- Orden de Mateo del 23 de octubre de 2026. El mismo motor del Repaso de
-- Macroeconomía (0033), con su propio id: hacer uno no gasta el otro.
--
-- ADITIVA, Y NADA DE ESTO TOCA DATOS DE ESTUDIANTES:
--   1. Una fila nueva en el catálogo, con la misma clasificación que el de
--      Macro (evaluativa, medio, 60 FP) y renovable a diario. El update solo
--      toca esa fila recién insertada.
--   2. repaso_historial() se reemplaza para que lea el detalle de los DOS
--      repasos con la clave entera. Para el de Macro devuelve exactamente lo
--      mismo que antes: la única línea que cambia es la condición del case,
--      que ahora acepta también el id nuevo.
--   3. Una función NUEVA, repaso_hecho_hoy_de(id). La de 0033, sin argumentos,
--      se queda tal cual: el cliente del Repaso de Macro la sigue llamando.
--
-- GUARDIAN: cambio de esquema a proposito
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final devuelve una fila con
-- renovable_diario = true, y repaso_hecho_hoy_de('repaso-diario') da lo mismo
-- que repaso_hecho_hoy() para cualquier estudiante.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('repaso-diario-contabilidad', 'contabilidad', 'repaso-diario-contabilidad', 'evaluativa', 'medio', 60)
on conflict (activity_id) do nothing;

update public.actividad_catalogo set renovable_diario = true where activity_id in ('repaso-diario-contabilidad');

create or replace function public.repaso_historial()
returns table (clave text, ultimo_en timestamptz, ultimo_ok boolean, veces integer)
language sql
stable
security invoker
set search_path = public
as $$
  with encuentros as (
    select case when d.activity_id in ('repaso-diario', 'repaso-diario-contabilidad') then d.item_id
                else d.activity_id || ':' || d.item_id end as clave,
           d.created_at, d.acerto, d.id
      from public.fp_detalle d
     where d.user_id = auth.uid()
  )
  select distinct on (e.clave)
         e.clave, e.created_at, e.acerto,
         (count(*) over (partition by e.clave))::integer
    from encuentros e
   order by e.clave, e.created_at desc, e.id desc;
$$;

create or replace function public.repaso_hecho_hoy_de(p_activity_id text)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.fp_history h
     where h.user_id = auth.uid()
       and h.activity_id = p_activity_id
       and (h.created_at at time zone 'America/Bogota')::date = (now() at time zone 'America/Bogota')::date
  );
$$;

revoke all on function public.repaso_hecho_hoy_de(text) from public, anon;
grant execute on function public.repaso_hecho_hoy_de(text) to authenticated;

select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, renovable_diario
  from public.actividad_catalogo where activity_id = 'repaso-diario-contabilidad';
