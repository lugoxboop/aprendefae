-- GUARDIAN: cambio de esquema a proposito
-- ---------------------------------------------------------------------------
-- 0170 — Los amigos en la portada: la fila de círculos y las sugerencias.
--
-- Pedido de Mateo (20-nov-2026, Magno): debajo del titular de la portada, una
-- fila de círculos con la mascota de cada amigo, «Añadir amigos» y «Ver todo».
-- Quien todavía no tiene amigos ve en esa misma fila SUGERENCIAS deslizables,
-- cada una con «Enviar solicitud». En cuanto tiene el primer amigo, la fila
-- pasa a mostrar sus amigos y las sugerencias se van.
--
-- TRES COSAS, LAS TRES SOLO AGREGAN:
--
--   1. amigos_demo — amigos de DEMOSTRACIÓN para una cuenta concreta. No son
--      cuentas: no hay fila en auth.users ni en profiles, así que NO salen en
--      el ranking, en las ligas, en el panel docente, en la búsqueda de
--      apodos ni en las sugerencias de nadie. Solo los ve su dueño, en su
--      propia fila de la portada. Sirven para enseñar el producto con la fila
--      llena y para probarla.
--
--   2. Se siembran 11 para la cuenta de Mateo (lugox173@gmail.com), por
--      correo y no por uuid, como en la 0020. Idempotente: on conflict.
--
--   3. amigos_inicio() — un viaje con lo que pinta la portada:
--        { amigos: [...], total: n, sugerencias: [...] }
--      Los amigos son los de verdad (amistades aceptadas, igual que en
--      amigos_estado de la 0164) más los de demostración del que pregunta.
--      Las sugerencias solo se calculan si no tiene ninguno.
--
-- LO QUE NO SE TOCA: amistades, profiles, amigos_estado, amistad_solicitar.
-- Pedir amistad desde una sugerencia usa amistad_solicitar(apodo) de la 0164,
-- que ya cruza la solicitud si el otro te había pedido a ti.
--
-- CÓMO SE DESHACE (no hace falta para nada de estudiantes; es solo lo nuevo):
--   drop function if exists public.amigos_inicio();
--   drop table if exists public.amigos_demo;
-- ---------------------------------------------------------------------------


-- ── 1. Los amigos de demostración ───────────────────────────────────────────
create table if not exists public.amigos_demo (
  id              uuid primary key default gen_random_uuid(),
  dueno           uuid not null references auth.users (id) on delete cascade,
  apodo           text not null,
  mascota_especie text not null,
  mascota_paleta  text not null default 'natural',
  mascota_ojos    text not null default 'natural',
  mascota_nombre  text,
  mascota_puestos text[] not null default '{}',
  racha           integer not null default 0,
  orden           integer not null default 0,
  creada          timestamptz not null default now(),
  constraint amigos_demo_par_unico unique (dueno, apodo)
);

comment on table public.amigos_demo is
  'Amigos de DEMOSTRACIÓN (no son cuentas). Solo los ve su dueño en la portada. 0170.';

alter table public.amigos_demo enable row level security;

drop policy if exists amigos_demo_ver_los_propios on public.amigos_demo;
create policy amigos_demo_ver_los_propios on public.amigos_demo
  for select
  using ((select auth.uid()) = dueno);

-- ── 2. Los 11 de Mateo ──────────────────────────────────────────────────────
insert into public.amigos_demo
  (dueno, apodo, mascota_especie, mascota_paleta, mascota_ojos, mascota_nombre, mascota_puestos, racha, orden)
select u.id, d.apodo, d.especie, d.paleta, d.ojos, d.nombre, d.puestos, d.racha, d.orden
  from auth.users u
 cross join (values
   ('valen.conta',   'gato',    'gris',      'verde',  'Mishi',   array['gafas']::text[],   12,  1),
   ('Sebas_FAE',     'perro',   'canela',    'natural','Toby',    array['gorro']::text[],    7,  2),
   ('laurita.macro', 'conejo',  'arena',     'azul',   'Copito',  array['mono']::text[],    21,  3),
   ('JuanchoDebe',   'zorro',   'jengibre',  'ambar',  'Rayo',    array['bufanda']::text[],  4,  4),
   ('caro_haber',    'hamster', 'natural',   'miel',   'Nube',    '{}'::text[],              9,  5),
   ('nico.balance',  'huron',   'chocolate', 'natural','Pancho',  array['gafas']::text[],    2,  6),
   ('majo_liquidez', 'gato',    'negro',     'ambar',  'Luna',    array['mono']::text[],    15,  7),
   ('DaniPIB',       'perro',   'arena',     'azul',   'Max',     array['bigote']::text[],   0,  8),
   ('santi.activo',  'zorro',   'natural',   'verde',  'Kiwi',    '{}'::text[],              5,  9),
   ('isa_cuentas',   'conejo',  'chocolate', 'miel',   'Galleta', array['bufanda']::text[], 30, 10),
   ('pipe.IVA',      'hamster', 'canela',    'gris',   'Bolita',  array['gorro']::text[],    3, 11)
 ) as d(apodo, especie, paleta, ojos, nombre, puestos, racha, orden)
 where lower(u.email) = 'lugox173@gmail.com'
on conflict (dueno, apodo) do nothing;

-- ── 3. Lo que pinta la portada ──────────────────────────────────────────────
/*
 * SUGERENCIAS: cuentas reales con apodo, que no son el que pregunta, que no
 * están marcadas como de prueba (0020) y con las que no hay amistad aceptada.
 * Primero las que se movieron más reciente (last_activity_day, 0007), 15 como
 * mucho. Cada una dice si ya le enviaste solicitud (`enviada`) o si ella te la
 * envió a ti (`te_pidio`), para que el botón diga lo que de verdad pasa.
 *
 * Expone lo mismo que amigos_buscar (0167) —apodo y mascota—, y nada más.
 */
create or replace function public.amigos_inicio()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_uid   uuid := auth.uid();
  v_reales jsonb;
  v_demo   jsonb;
  v_amigos jsonb;
  v_total  integer;
  v_sug    jsonb := '[]'::jsonb;
begin
  if v_uid is null then
    return jsonb_build_object('amigos', '[]'::jsonb, 'total', 0, 'sugerencias', '[]'::jsonb);
  end if;

  select coalesce(jsonb_agg(t.tarjeta order by lower(t.tarjeta->>'apodo')), '[]'::jsonb)
    into v_reales
    from (
      select jsonb_build_object(
               'amistad_id', a.id,
               'user_id', p.user_id,
               'apodo', p.nickname,
               'mascota_especie', p.mascota_especie,
               'mascota_paleta', p.mascota_paleta,
               'mascota_ojos', p.mascota_ojos,
               'mascota_nombre', p.mascota_nombre,
               'mascota_puestos', p.mascota_puestos,
               'racha', p.streak,
               'demo', false
             ) as tarjeta
        from public.amistades a
        join public.profiles p
          on p.user_id = case when a.solicitante = v_uid then a.receptor else a.solicitante end
       where a.estado = 'aceptada'
         and v_uid in (a.solicitante, a.receptor)
    ) t;

  select coalesce(jsonb_agg(jsonb_build_object(
           'amistad_id', null,
           'user_id', null,
           'demo_id', d.id,
           'apodo', d.apodo,
           'mascota_especie', d.mascota_especie,
           'mascota_paleta', d.mascota_paleta,
           'mascota_ojos', d.mascota_ojos,
           'mascota_nombre', d.mascota_nombre,
           'mascota_puestos', d.mascota_puestos,
           'racha', d.racha,
           'demo', true
         ) order by d.orden, lower(d.apodo)), '[]'::jsonb)
    into v_demo
    from public.amigos_demo d
   where d.dueno = v_uid;

  v_amigos := v_reales || v_demo;
  v_total := jsonb_array_length(v_amigos);

  if v_total = 0 then
    select coalesce(jsonb_agg(s.tarjeta order by s.orden_actividad desc nulls last, lower(s.tarjeta->>'apodo')), '[]'::jsonb)
      into v_sug
      from (
        select p.last_activity_day as orden_actividad,
               jsonb_build_object(
                 'user_id', p.user_id,
                 'apodo', p.nickname,
                 'mascota_especie', p.mascota_especie,
                 'mascota_paleta', p.mascota_paleta,
                 'mascota_ojos', p.mascota_ojos,
                 'mascota_nombre', p.mascota_nombre,
                 'mascota_puestos', p.mascota_puestos,
                 'racha', p.streak,
                 'enviada', exists (
                   select 1 from public.amistades a
                    where a.estado = 'pendiente' and a.solicitante = v_uid and a.receptor = p.user_id),
                 'te_pidio', exists (
                   select 1 from public.amistades a
                    where a.estado = 'pendiente' and a.solicitante = p.user_id and a.receptor = v_uid)
               ) as tarjeta
          from public.profiles p
         where p.user_id <> v_uid
           and p.nickname is not null
           and not p.es_prueba
           and not exists (
             select 1 from public.amistades a
              where a.estado = 'aceptada'
                and ((a.solicitante = v_uid and a.receptor = p.user_id)
                  or (a.solicitante = p.user_id and a.receptor = v_uid)))
         order by p.last_activity_day desc nulls last, lower(p.nickname)
         limit 15
      ) s;
  end if;

  return jsonb_build_object('amigos', v_amigos, 'total', v_total, 'sugerencias', v_sug);
end;
$$;

revoke all on function public.amigos_inicio() from public, anon;
grant execute on function public.amigos_inicio() to authenticated;


-- COMPROBACIÓN (en el editor SQL, después de aplicar): debe devolver 11.
--   select count(*) from public.amigos_demo d join auth.users u on u.id = d.dueno
--    where lower(u.email) = 'lugox173@gmail.com';
