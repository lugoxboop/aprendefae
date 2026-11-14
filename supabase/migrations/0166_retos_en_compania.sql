-- ═══════════════════════════════════════════════════════════════════════════
-- 0166 — RETOS EN COMPAÑÍA (estudiar con un amigo)
--
-- GUARDIAN: cambio de esquema a proposito
--
-- Un estudiante reta a un amigo a una META COMPARTIDA: completar juntos cierto
-- número de actividades en 24 horas. Las actividades de LOS DOS suman, y cada
-- uno debe aportar al menos una (es «en compañía», no cargar al otro). Al
-- lograrlo, ambos ganan un bono de cristales.
--
-- Inspiración: Duolingo «Friends Quest» (meta conjunta, ventana corta, ambos
-- aportan, recompensa a los dos). Dos cambios a propósito:
--   · el reto se ELIGE (tú retas a un amigo), no es un emparejamiento al azar;
--   · el bono es en CRISTALES, no en FP. Los FP son la vara de las ligas y el
--     ranking; multiplicarlos distorsionaría la competencia de todos y abriría
--     la puerta a trampas. Los cristales son para gastar (accesorios), así que
--     estudiar en compañía paga y se nota en la mascota.
--
-- El progreso NO toca registrar_fp: se cuenta leyendo fp_history (una fila por
-- actividad) en la ventana del reto. Función crítica intacta.
--
-- Rango del coordinador (0150-0199). Aditivo e idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. La tabla ─────────────────────────────────────────────────────────────
create table if not exists public.retos (
  id           uuid primary key default gen_random_uuid(),
  iniciador    uuid not null references auth.users (id) on delete cascade,
  amigo        uuid not null references auth.users (id) on delete cascade,
  estado       text not null default 'invitado'
                 check (estado in ('invitado', 'activo', 'logrado', 'expirado', 'rechazado')),
  meta         integer not null default 6 check (meta >= 2),
  bono         integer not null default 25 check (bono >= 0),
  creada       timestamptz not null default now(),
  activa_desde timestamptz,
  vence        timestamptz,
  lograda      timestamptz,
  constraint retos_no_uno_mismo check (iniciador <> amigo)
);

comment on table public.retos is
'Retos en compañía (0166): meta compartida de actividades entre dos amigos en 24h. El progreso se cuenta desde fp_history; el bono se paga en cristales a ambos.';

create index if not exists retos_iniciador_idx on public.retos (iniciador, estado);
create index if not exists retos_amigo_idx     on public.retos (amigo, estado);

-- Un solo reto abierto (invitado o activo) por par, en cualquier dirección: no
-- se spamean invitaciones ni se corren dos a la vez entre los mismos dos.
create unique index if not exists retos_par_abierto_unico
  on public.retos (least(iniciador, amigo), greatest(iniciador, amigo))
  where estado in ('invitado', 'activo');

-- ── 2. Seguridad por filas: cada quien ve los suyos ─────────────────────────
alter table public.retos enable row level security;
alter table public.retos force row level security;

drop policy if exists "retos: ver los propios" on public.retos;
create policy "retos: ver los propios" on public.retos
  for select to authenticated
  using ((select auth.uid()) in (iniciador, amigo));

-- Nada de escribir directo: todo pasa por las funciones de abajo.
revoke insert, update, delete on public.retos from authenticated, anon;

-- ── 3. ¿Son amigos? (amistad aceptada en cualquier dirección) ───────────────
create or replace function public.son_amigos(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.amistades
     where estado = 'aceptada'
       and ((solicitante = p_a and receptor = p_b) or (solicitante = p_b and receptor = p_a))
  );
$$;

-- ── 4. Cuántas actividades hizo alguien dentro de la ventana del reto ────────
-- Lee fp_history. Si el reto aún no está activo (sin activa_desde), es 0.
create or replace function public.reto_avance(p_user uuid, p_desde timestamptz, p_hasta timestamptz)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_desde is null then 0
    else (
      select count(*)::integer
        from public.fp_history
       where user_id = p_user
         and created_at >= p_desde
         and created_at <  p_hasta
    )
  end;
$$;

-- ── 5. Crear un reto (invitar) ──────────────────────────────────────────────
create or replace function public.reto_crear(p_amigo uuid)
returns public.retos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_fila public.retos;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;
  if p_amigo = v_uid then
    raise exception 'No puedes retarte a ti mismo' using errcode = '22023';
  end if;
  if not public.son_amigos(v_uid, p_amigo) then
    raise exception 'Solo puedes retar a tus amigos' using errcode = '22023';
  end if;

  insert into public.retos (iniciador, amigo)
  values (v_uid, p_amigo)
  returning * into v_fila;
  return v_fila;
exception
  when unique_violation then
    raise exception 'Ya tienen un reto en curso' using errcode = '23505';
end;
$$;

-- ── 6. Responder a una invitación (solo el amigo) ───────────────────────────
create or replace function public.reto_responder(p_id uuid, p_aceptar boolean)
returns public.retos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_fila public.retos;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;

  update public.retos
     set estado       = case when p_aceptar then 'activo' else 'rechazado' end,
         activa_desde = case when p_aceptar then now() else activa_desde end,
         vence        = case when p_aceptar then now() + interval '24 hours' else vence end
   where id = p_id
     and amigo = v_uid
     and estado = 'invitado'
  returning * into v_fila;

  if v_fila.id is null then
    raise exception 'Ese reto ya no espera respuesta' using errcode = '22023';
  end if;
  return v_fila;
end;
$$;

-- ── 7. Cerrar un reto logrado y pagar el bono a los dos ─────────────────────
-- La puede llamar cualquiera de los dos. Idempotente: solo paga una vez, porque
-- exige estado 'activo' y lo deja en 'logrado' en la misma sentencia.
create or replace function public.reto_cerrar(p_id uuid)
returns public.retos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_r     public.retos;
  v_av_i  integer;
  v_av_a  integer;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;

  select * into v_r from public.retos
   where id = p_id and v_uid in (iniciador, amigo) and estado = 'activo'
   for update;
  if v_r.id is null then
    raise exception 'Ese reto no se puede cerrar' using errcode = '22023';
  end if;

  if now() >= v_r.vence then
    update public.retos set estado = 'expirado' where id = p_id;
    raise exception 'El reto ya venció' using errcode = '22023';
  end if;

  v_av_i := public.reto_avance(v_r.iniciador, v_r.activa_desde, v_r.vence);
  v_av_a := public.reto_avance(v_r.amigo,     v_r.activa_desde, v_r.vence);
  if v_av_i < 1 or v_av_a < 1 or (v_av_i + v_av_a) < v_r.meta then
    raise exception 'Todavía no completan la meta entre los dos' using errcode = '22023';
  end if;

  update public.retos
     set estado = 'logrado', lograda = now()
   where id = p_id and estado = 'activo'
  returning * into v_r;

  -- El bono, a los dos.
  update public.profiles
     set cristales_balance = cristales_balance + v_r.bono
   where user_id in (v_r.iniciador, v_r.amigo);

  insert into public.cristal_movimiento (user_id, clave, cristales, motivo)
  values (v_r.iniciador, 'reto-' || v_r.id, v_r.bono, 'Reto en compañía logrado'),
         (v_r.amigo,     'reto-' || v_r.id, v_r.bono, 'Reto en compañía logrado')
  on conflict (user_id, clave) do nothing;

  return v_r;
end;
$$;

-- ── 8. El estado de mis retos, con progreso y la mascota del otro ───────────
create or replace function public.retos_estado()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('activos', '[]'::jsonb, 'invitaciones', '[]'::jsonb, 'enviadas', '[]'::jsonb);
  end if;

  -- Marca como expirados, de paso, los activos cuya ventana ya pasó.
  update public.retos set estado = 'expirado'
   where estado = 'activo' and vence is not null and now() >= vence
     and v_uid in (iniciador, amigo);

  return jsonb_build_object(
    -- Activos en los que participo, con el progreso de cada quien.
    'activos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id,
        'meta', r.meta,
        'bono', r.bono,
        'vence', r.vence,
        'avance_mio', public.reto_avance(v_uid, r.activa_desde, r.vence),
        'avance_otro', public.reto_avance(case when r.iniciador = v_uid then r.amigo else r.iniciador end, r.activa_desde, r.vence),
        'otro', (select jsonb_build_object(
                    'apodo', p.nickname, 'user_id', p.user_id,
                    'mascota_especie', p.mascota_especie, 'mascota_nombre', p.mascota_nombre,
                    'mascota_paleta', p.mascota_paleta, 'mascota_ojos', p.mascota_ojos, 'mascota_puestos', p.mascota_puestos)
                  from public.profiles p
                  where p.user_id = case when r.iniciador = v_uid then r.amigo else r.iniciador end)
      ) order by r.vence)
      from public.retos r
      where r.estado = 'activo' and v_uid in (r.iniciador, r.amigo)
    ), '[]'::jsonb),
    -- Invitaciones que me llegaron (soy el amigo).
    'invitaciones', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'meta', r.meta, 'bono', r.bono,
        'otro', (select jsonb_build_object('apodo', p.nickname, 'user_id', p.user_id,
                    'mascota_especie', p.mascota_especie, 'mascota_nombre', p.mascota_nombre,
                    'mascota_paleta', p.mascota_paleta, 'mascota_ojos', p.mascota_ojos, 'mascota_puestos', p.mascota_puestos)
                  from public.profiles p where p.user_id = r.iniciador)
      ) order by r.creada desc)
      from public.retos r
      where r.estado = 'invitado' and r.amigo = v_uid
    ), '[]'::jsonb),
    -- Invitaciones que mandé y siguen esperando.
    'enviadas', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id, 'meta', r.meta, 'bono', r.bono,
        'otro', (select jsonb_build_object('apodo', p.nickname, 'user_id', p.user_id,
                    'mascota_especie', p.mascota_especie, 'mascota_nombre', p.mascota_nombre,
                    'mascota_paleta', p.mascota_paleta, 'mascota_ojos', p.mascota_ojos, 'mascota_puestos', p.mascota_puestos)
                  from public.profiles p where p.user_id = r.amigo)
      ) order by r.creada desc)
      from public.retos r
      where r.estado = 'invitado' and r.iniciador = v_uid
    ), '[]'::jsonb)
  );
end;
$$;

-- ── 9. Permisos ─────────────────────────────────────────────────────────────
revoke all on function public.son_amigos(uuid, uuid)                       from public, anon;
revoke all on function public.reto_avance(uuid, timestamptz, timestamptz)  from public, anon;
revoke all on function public.reto_crear(uuid)                             from public, anon;
revoke all on function public.reto_responder(uuid, boolean)               from public, anon;
revoke all on function public.reto_cerrar(uuid)                            from public, anon;
revoke all on function public.retos_estado()                               from public, anon;
grant execute on function public.reto_crear(uuid)             to authenticated;
grant execute on function public.reto_responder(uuid, boolean) to authenticated;
grant execute on function public.reto_cerrar(uuid)            to authenticated;
grant execute on function public.retos_estado()               to authenticated;
