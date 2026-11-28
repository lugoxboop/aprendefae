-- ---------------------------------------------------------------------------
-- Prueba de las cajas sorpresa (0178).
--
--   · sin saldo no se abre y no se cobra nada
--   · cada caja cobra su precio; un repetido devuelve lo de su rareza
--   · la Legendaria nunca suelta un Normal
--   · lo que sale queda en mascota_accesorios, sin duplicarse, y se puede poner
--   · el saldo cuadra con el historial (caja_apertura) y con el libro
--   · las probabilidades de cada caja suman 1000
--   · anon no puede abrir cajas; una caja inventada no existe
--
-- Termina en ROLLBACK.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
grant all on res to authenticated;
create temp table ids(uid uuid) on commit drop;
grant select on ids to authenticated;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
values (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'zzz-cajas@prueba.local', '', now(), now());
insert into ids(uid) select id from auth.users where email = 'zzz-cajas@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzcajas' from ids;

select set_config('request.jwt.claims',
  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text, true);

-- ── 1. Sin saldo no se abre ─────────────────────────────────────────────────
set local role authenticated;
do $$
begin
  perform public.caja_abrir('normal');
  insert into res values (1, 'sin saldo no se abre', 'error', 'se abrió', false);
exception when others then
  insert into res values (1, 'sin saldo no se abre', 'error', 'error', true);
end $$;
reset role;

insert into res
select 2, 'y no se cobró nada ni se guardó historial', '0 0',
  cristales_balance || ' ' || (select count(*) from public.caja_apertura where user_id = (select uid from ids)),
  cristales_balance = 0 and not exists (select 1 from public.caja_apertura where user_id = (select uid from ids))
from public.profiles where user_id = (select uid from ids);

-- ── 2. Cuarenta Legendarias seguidas ────────────────────────────────────────
update public.profiles set cristales_balance = 10000 where user_id = (select uid from ids);

set local role authenticated;
select public.caja_abrir('legendaria') from generate_series(1, 40);
reset role;

insert into res
select 3, 'la Legendaria nunca suelta un Normal', '0 normales',
  count(*) filter (where rareza = 'normal') || ' normales',
  count(*) filter (where rareza = 'normal') = 0
from public.caja_apertura where user_id = (select uid from ids);

insert into res
select 4, 'el saldo cuadra: 10000 − 40×180 + reembolsos', (10000 - 40 * 180 + sum(reembolso))::text,
  (select cristales_balance from public.profiles where user_id = (select uid from ids))::text,
  (select cristales_balance from public.profiles where user_id = (select uid from ids)) = 10000 - 40 * 180 + sum(reembolso)
from public.caja_apertura where user_id = (select uid from ids);

insert into res
select 5, 'cada repetido devuelve lo de su rareza; lo nuevo, 0', 'todo bien',
  case when bool_and(reembolso = case when repetido then public.caja_reembolso(rareza) else 0 end) then 'todo bien' else 'mal' end,
  bool_and(reembolso = case when repetido then public.caja_reembolso(rareza) else 0 end)
from public.caja_apertura where user_id = (select uid from ids);

insert into res
select 6, 'lo que salió está guardado, una sola vez cada uno', 'iguales',
  (select count(distinct cosmetico) from public.caja_apertura where user_id = (select uid from ids)) || ' vs ' ||
  cardinality(mascota_accesorios),
  cardinality(mascota_accesorios) = (select count(distinct cosmetico) from public.caja_apertura where user_id = (select uid from ids))
    and cardinality(mascota_accesorios) = (select count(distinct x) from unnest(mascota_accesorios) x)
from public.profiles where user_id = (select uid from ids);

insert into res
select 7, 'el libro de cristales tiene una fila por caja', '40',
  count(*)::text, count(*) = 40
from public.cristal_movimiento where user_id = (select uid from ids) and clave like 'caja-%';

insert into res
select 8, 'cada cosmético salió de la lista de su rareza', 'todos',
  case when bool_and(cosmetico = any (public.caja_cosmeticos(rareza))) then 'todos' else 'alguno no' end,
  bool_and(cosmetico = any (public.caja_cosmeticos(rareza)))
from public.caja_apertura where user_id = (select uid from ids);

-- ── 3. Lo ganado se puede poner ─────────────────────────────────────────────
set local role authenticated;
select public.mascota_accesorio_equipar(
  (select cosmetico from public.caja_apertura where user_id = (select uid from ids) order by id limit 1), true);
reset role;

insert into res
select 9, 'lo que salió de una caja se puede poner', 'puesto',
  case when (select cosmetico from public.caja_apertura where user_id = (select uid from ids) order by id limit 1) = any (mascota_puestos)
       then 'puesto' else 'no' end,
  (select cosmetico from public.caja_apertura where user_id = (select uid from ids) order by id limit 1) = any (mascota_puestos)
from public.profiles where user_id = (select uid from ids);

-- ── 4. Una Normal cobra 40 ──────────────────────────────────────────────────
update public.profiles set cristales_balance = 40, mascota_accesorios = '{}' where user_id = (select uid from ids);
set local role authenticated;
select public.caja_abrir('normal');
reset role;
insert into res
select 10, 'una Normal con 40 justos deja el saldo en 0 (si no es repetido)', '0',
  cristales_balance::text, cristales_balance = 0
from public.profiles where user_id = (select uid from ids);

-- ── 5. Lo que no existe y lo que no se puede ────────────────────────────────
update public.profiles set cristales_balance = 1000 where user_id = (select uid from ids);
set local role authenticated;
do $$
begin
  perform public.caja_abrir('dorada');
  insert into res values (11, 'una caja inventada no existe', 'error', 'se abrió', false);
exception when others then
  insert into res values (11, 'una caja inventada no existe', 'error', 'error', true);
end $$;
reset role;

insert into res
select 12, 'anon no puede abrir cajas', 'no',
  case when has_function_privilege('anon', 'public.caja_abrir(text)', 'execute') then 'sí' else 'no' end,
  not has_function_privilege('anon', 'public.caja_abrir(text)', 'execute');

insert into res
select 13, 'las probabilidades de cada caja suman 1000', '1000 1000 1000',
  string_agg(t::text, ' ' order by c),
  bool_and(t = 1000)
from (
  select c, sum(public.caja_probabilidad(c, r)) t
    from unnest(array['normal', 'rara', 'legendaria']) c, unnest(array['normal', 'raro', 'epico', 'legendario', 'elite']) r
   group by c
) s;

insert into res
select 14, 'los cosméticos de caja no se venden sueltos', 'sin precio',
  case when public.precio_accesorio('c_corona_oro') is null and public.precio_accesorio('aura_prisma') is null then 'sin precio' else 'con precio' end,
  public.precio_accesorio('c_corona_oro') is null and public.precio_accesorio('aura_prisma') is null;

select n::text as n, paso, esperado, obtenido, case when ok then 'OK' else 'FALLA' end as estado from res
union all
select 'TOTAL', (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res), '', '',
       (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
