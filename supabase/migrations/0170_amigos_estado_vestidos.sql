-- ═══════════════════════════════════════════════════════════════════════════
-- 0170 — AMIGOS CON SU MASCOTA VESTIDA, Y QUIÉN ESTUDIÓ HOY
--
-- GUARDIAN: cambio de esquema a proposito
--
-- La pantalla de Amigos se rehízo (20-nov) con la mascota de cada amigo en
-- grande, como en un juego. Pero amigos_estado() (0164) se escribió antes de
-- los accesorios (0165) y no traía lo que cada quien lleva PUESTO: los amigos
-- salían «desnudos» aunque en la tienda se hubieran vestido. Los retos (0166)
-- y la búsqueda (0167) sí lo traen; esto iguala la lista de amigos.
--
-- Agrega tres datos a cada tarjeta, solo para amigos y solicitudes:
--   · mascota_puestos — los accesorios que lleva puestos;
--   · racha           — su racha VIGENTE (0 si ya se le cortó);
--   · estudio_hoy     — si ya hizo algo hoy (hora de Bogotá), el «en línea»
--                       de esta casa: un punto verde en su tarjeta.
-- Nunca el nombre real ni el correo.
--
-- Solo reemplaza una función de lectura (stable), con la misma firma: los
-- permisos de 0164 se conservan. Aditiva: las claves de antes siguen igual.
-- Para deshacerla, volver a correr la sección 6 de 0164.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.amigos_estado()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  with mias as (
    select a.*,
           case when a.solicitante = auth.uid() then a.receptor else a.solicitante end as otro
      from public.amistades a
     where auth.uid() in (a.solicitante, a.receptor)
  ),
  enriquecida as (
    select m.*,
           jsonb_build_object(
             'amistad_id', m.id,
             'apodo', p.nickname,
             'mascota_especie', p.mascota_especie,
             'mascota_nombre', p.mascota_nombre,
             'mascota_paleta', p.mascota_paleta,
             'mascota_ojos', p.mascota_ojos,
             'mascota_puestos', p.mascota_puestos,
             'racha', case
                        when p.last_activity_day >= (now() at time zone 'America/Bogota')::date - 1
                        then coalesce(p.streak, 0) else 0 end,
             'estudio_hoy', coalesce(p.last_activity_day = (now() at time zone 'America/Bogota')::date, false),
             'user_id', p.user_id
           ) as tarjeta
      from mias m
      join public.profiles p on p.user_id = m.otro
  )
  select jsonb_build_object(
    'amigos',    coalesce((select jsonb_agg(tarjeta order by tarjeta->>'apodo') from enriquecida where estado = 'aceptada'), '[]'::jsonb),
    'recibidas', coalesce((select jsonb_agg(tarjeta order by creada desc)       from enriquecida where estado = 'pendiente' and receptor = auth.uid()), '[]'::jsonb),
    'enviadas',  coalesce((select jsonb_agg(tarjeta order by creada desc)       from enriquecida where estado = 'pendiente' and solicitante = auth.uid()), '[]'::jsonb)
  );
$$;
