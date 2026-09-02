-- Perfiles de estudiante para AprendeFAE.
-- Idempotente: se puede correr sobre un proyecto donde la tabla ya exista.

create table if not exists public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  nickname   text not null,
  points     integer not null default 0,
  streak     integer not null default 0,
  created_at timestamptz not null default now()
);

-- El apodo es lo que se muestra en los rankings, así que no puede repetirse.
-- Índice único sin distinguir mayúsculas: "Camila" y "camila" son el mismo apodo.
create unique index if not exists profiles_nickname_unique
  on public.profiles (lower(nickname));

-- Longitud razonable, sin espacios sobrantes.
alter table public.profiles drop constraint if exists profiles_nickname_len;
alter table public.profiles add constraint profiles_nickname_len
  check (char_length(btrim(nickname)) between 3 and 20);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Sin políticas, RLS bloquea todo. Cada política se acota a auth.uid(), así que
-- un estudiante solo alcanza su propia fila. No hay política de DELETE a
-- propósito: el borrado de cuenta se atiende por el correo de contacto de la
-- política de privacidad, no desde el cliente.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
-- Ni siquiera el dueño de la tabla se salta las políticas.
alter table public.profiles force row level security;

drop policy if exists "perfil propio: leer" on public.profiles;
create policy "perfil propio: leer"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "perfil propio: crear" on public.profiles;
create policy "perfil propio: crear"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "perfil propio: actualizar" on public.profiles;
create policy "perfil propio: actualizar"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Comprobar si un apodo está libre.
--
-- Hace falta porque las políticas de arriba impiden leer las filas de otros:
-- un select desde el cliente nunca podría detectar el choque. La función corre
-- con security definer y devuelve solo un booleano, así que no filtra ningún
-- dato ajeno. El unique index de arriba sigue siendo la garantía real ante
-- dos registros simultáneos.
-- ---------------------------------------------------------------------------
create or replace function public.nickname_disponible(candidato text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from public.profiles where lower(nickname) = lower(btrim(candidato))
  );
$$;

-- Se revoca a PUBLIC y además a anon: Supabase concede EXECUTE a anon por
-- privilegios por defecto, y revocar a PUBLIC no elimina esa concesión. Sin
-- esta segunda línea, un visitante sin sesión podría enumerar apodos.
revoke all on function public.nickname_disponible(text) from public;
revoke all on function public.nickname_disponible(text) from anon;
grant execute on function public.nickname_disponible(text) to authenticated;
