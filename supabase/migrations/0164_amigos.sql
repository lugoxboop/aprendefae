-- ═══════════════════════════════════════════════════════════════════════════
-- 0164 — AMIGOS (solicitud mutua)
--
-- GUARDIAN: cambio de esquema a proposito
--
-- Los estudiantes se agregan por apodo (nickname) y la amistad se confirma de
-- los dos lados: uno la pide, el otro la acepta. Con esto se arma la «barra de
-- amigos» y, más adelante, los retos y las salas entre amigos.
--
-- Una sola tabla, `amistades`, con una fila por relación: quién la pidió, quién
-- la recibe y en qué estado está (pendiente / aceptada). El rechazo borra la
-- fila (no deja constancia). La escritura va SOLO por funciones security
-- definer; la fila se LEE directo (RLS) solo por sus dos participantes.
--
-- Rango del coordinador (0150-0199): crea tabla y toca RLS. Aditivo: no toca
-- nada de lo que ya hay. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. La tabla ─────────────────────────────────────────────────────────────
create table if not exists public.amistades (
  id          uuid primary key default gen_random_uuid(),
  solicitante uuid not null references auth.users (id) on delete cascade,
  receptor    uuid not null references auth.users (id) on delete cascade,
  estado      text not null default 'pendiente',
  creada      timestamptz not null default now(),
  resuelta    timestamptz,
  constraint amistades_estado_valido check (estado in ('pendiente', 'aceptada')),
  constraint amistades_no_uno_mismo check (solicitante <> receptor),
  constraint amistades_par_unico unique (solicitante, receptor)
);

-- Para buscar rápido «mis solicitudes recibidas» y «mis amigos».
create index if not exists amistades_receptor_idx on public.amistades (receptor, estado);
create index if not exists amistades_solicitante_idx on public.amistades (solicitante, estado);

-- ── 2. RLS: cada quien ve solo las filas en las que participa ───────────────
alter table public.amistades enable row level security;

drop policy if exists amistades_ver_las_propias on public.amistades;
create policy amistades_ver_las_propias on public.amistades
  for select
  using ((select auth.uid()) in (solicitante, receptor));

-- Sin políticas de insert/update/delete: todo cambio pasa por las funciones.

-- ── 3. Pedir amistad por apodo ──────────────────────────────────────────────
/*
 * Resuelve el apodo a un usuario y crea la solicitud. Atajos sensatos:
 *   · si ya son amigos → error amable;
 *   · si el otro ya me había pedido a mí → la acepto de una vez (nos cruzamos);
 *   · si yo ya la había pedido → aviso de que está pendiente.
 * No expone la lista de apodos: solo responde por el apodo exacto que le pasen.
 */
create or replace function public.amistad_solicitar(p_apodo text)
returns public.amistades
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_otro  uuid;
  v_fila  public.amistades;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;

  select user_id into v_otro
    from public.profiles
   where lower(nickname) = lower(btrim(p_apodo));

  if v_otro is null then
    raise exception 'No hay nadie con el apodo «%»', p_apodo using errcode = 'no_data_found';
  end if;
  if v_otro = v_uid then
    raise exception 'No puedes agregarte a ti mismo' using errcode = '22023';
  end if;

  -- ¿Ya existe algo entre los dos, en cualquier dirección?
  select * into v_fila
    from public.amistades
   where (solicitante = v_uid and receptor = v_otro)
      or (solicitante = v_otro and receptor = v_uid)
   limit 1;

  if found then
    if v_fila.estado = 'aceptada' then
      raise exception 'Ya son amigos' using errcode = '23505';
    elsif v_fila.receptor = v_uid then
      -- El otro ya me había pedido: nos cruzamos, la acepto.
      update public.amistades
         set estado = 'aceptada', resuelta = now()
       where id = v_fila.id
      returning * into v_fila;
      return v_fila;
    else
      raise exception 'Ya le enviaste una solicitud' using errcode = '23505';
    end if;
  end if;

  insert into public.amistades (solicitante, receptor)
  values (v_uid, v_otro)
  returning * into v_fila;
  return v_fila;
end;
$$;

-- ── 4. Responder una solicitud recibida (aceptar o rechazar) ────────────────
/*
 * Solo el receptor responde. Aceptar la marca aceptada; rechazar la borra (no
 * deja rastro, y se puede volver a pedir luego).
 */
create or replace function public.amistad_responder(p_id uuid, p_aceptar boolean)
returns public.amistades
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_fila public.amistades;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;

  select * into v_fila
    from public.amistades
   where id = p_id and receptor = v_uid and estado = 'pendiente';

  if not found then
    raise exception 'No hay una solicitud tuya por responder con ese id' using errcode = 'no_data_found';
  end if;

  if p_aceptar then
    update public.amistades
       set estado = 'aceptada', resuelta = now()
     where id = p_id
    returning * into v_fila;
    return v_fila;
  else
    delete from public.amistades where id = p_id;
    return null;
  end if;
end;
$$;

-- ── 5. Quitar amistad o cancelar una solicitud enviada ──────────────────────
/*
 * Cualquiera de los dos participantes borra la fila: desamigar si estaba
 * aceptada, o cancelar si era una solicitud que yo había enviado.
 */
create or replace function public.amistad_eliminar(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Se requiere sesión' using errcode = '42501';
  end if;

  delete from public.amistades
   where id = p_id and v_uid in (solicitante, receptor);
end;
$$;

-- ── 6. Mi estado de amigos: aceptados + solicitudes, con su mascota ─────────
/*
 * Un solo viaje: devuelve un json con tres listas, cada amigo/solicitante con
 * lo justo para pintarlo (apodo y su mascota). El cliente no necesita más.
 *   { amigos: [...], recibidas: [...], enviadas: [...] }
 */
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

-- ── 7. Permisos: solo usuarios con sesión ───────────────────────────────────
revoke all on function public.amistad_solicitar(text)        from public, anon;
revoke all on function public.amistad_responder(uuid, boolean) from public, anon;
revoke all on function public.amistad_eliminar(uuid)         from public, anon;
revoke all on function public.amigos_estado()                from public, anon;
grant execute on function public.amistad_solicitar(text)        to authenticated;
grant execute on function public.amistad_responder(uuid, boolean) to authenticated;
grant execute on function public.amistad_eliminar(uuid)         to authenticated;
grant execute on function public.amigos_estado()                to authenticated;
