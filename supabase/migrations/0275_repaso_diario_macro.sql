-- ---------------------------------------------------------------------------
-- 0275 · Publicada el 25-nov-2026 con el visto bueno de Mateo. Esperó en
-- supabase/macro2026-pendientes/ mientras el repaso estaba en vista previa.
--
-- EL REPASO DIARIO DE MACROECONOMÍA 2026 («la ronda del economista»)
--
-- Diseño de Gen (orquestador/conocimiento/macro-2026/disenos/repaso-diario.md).
-- El mismo motor de los repasos de 0033 y 0152, con un id NUEVO: el viejo
-- «repaso-diario» es lápida desde la 0258 y no se toca.
--
-- ADITIVA, Y NADA DE ESTO TOCA DATOS DE ESTUDIANTES:
--   1. Una fila nueva en el catálogo, con la clasificación de los otros dos
--      repasos (evaluativa, medio, 60 FP) y renovable a diario. El update solo
--      toca esa fila recién insertada.
--   2. repaso_historial() se reemplaza para que lea también el detalle del
--      repaso nuevo con la clave entera (rd-da-curva, rd-pc-real…). Para los
--      dos repasos que ya existen devuelve exactamente lo mismo que antes: la
--      única línea que cambia es la lista del case.
--   3. repaso_hecho_hoy_de(id) ya existe (0152) y sirve tal cual.
--
-- GUARDIAN: cambio de esquema a proposito
--
-- CÓMO COMPROBAR QUE PASÓ: la consulta del final devuelve una fila con
-- renovable_diario = true.
-- ---------------------------------------------------------------------------

insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('repaso-diario-macro', 'macroeconomia', 'repaso-diario-macro', 'evaluativa', 'medio', 60)
on conflict (activity_id) do nothing;

update public.actividad_catalogo set renovable_diario = true where activity_id in ('repaso-diario-macro');

create or replace function public.repaso_historial()
returns table (clave text, ultimo_en timestamptz, ultimo_ok boolean, veces integer)
language sql
stable
security invoker
set search_path = public
as $$
  with encuentros as (
    select case when d.activity_id in ('repaso-diario', 'repaso-diario-contabilidad', 'repaso-diario-macro') then d.item_id
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

select activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, renovable_diario
  from public.actividad_catalogo where activity_id = 'repaso-diario-macro';
