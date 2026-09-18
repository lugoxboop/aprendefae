-- ---------------------------------------------------------------------------
-- Prueba del avatar en ranking_fp y liga_tablero (0037).
--
--   · cada fila trae la forma, la paleta y el nivel de ESE estudiante
--   · las filas son las mismas de antes: top 10 + la propia; podio + la propia
--   · NO salen los niveles comprados ni el saldo de Cristales
--   · anon sigue sin poder ejecutarlas (el drop se llevó los grants)
--
-- Materia inventada 'zzz-avr' y ROLLBACK al final.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
grant all on res to authenticated;

create temp table ids(n integer, uid uuid) on commit drop;
grant select on ids to authenticated;
insert into ids(n, uid) select g, gen_random_uuid() from generate_series(1, 12) g;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
select uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'zzz-avr-' || n || '@prueba.local', '', now(), now()
  from ids;

/* Cada uno con una combinación distinta, recorriendo formas, paletas y niveles. */
insert into public.profiles (user_id, nickname, avatar_shape, avatar_palette, avatar_level, avatar_unlocked_levels)
select uid, 'zzzavr' || lpad(n::text, 2, '0'),
       (array['decaedro', 'prisma', 'nucleo', 'red', 'cuna'])[1 + n % 5],
       (array['nocturno', 'marea', 'brasa', 'aurora'])[1 + n % 4],
       1 + n % 4,
       array[1, 2, 3, 4]
  from ids;
update public.profiles set cristales_balance = 777 where user_id in (select uid from ids);

/* La semana pasada, para que la liga se siembre; y esta, para el ranking y el podio. */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'zzz-avr-prev', 'zzz-avr', 50, 'facil', 'exploratoria',
       (public.ciclo_actual() - 3)::timestamp at time zone 'America/Bogota'
  from ids;
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'zzz-avr-sem', 'zzz-avr', case when n = 12 then 1 else n * 10 end, 'facil', 'exploratoria', now()
  from ids;

select public.ligas_sembrar('zzz-avr');

/* Pregunta el 12, que va último esta semana y en el semestre. */
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid from ids where n = 12), 'role', 'authenticated')::text, true);

set local role authenticated;
create temp table rk on commit drop as select * from public.ranking_fp('zzz-avr', 'semanal');
create temp table lt on commit drop as select * from public.liga_tablero('zzz-avr');
reset role;

-- ── ranking_fp ─────────────────────────────────────────────────────────────
insert into res
select 1, 'el ranking trae las mismas filas de antes: top 10 + la propia', '11 filas, 1 propia',
  (select count(*) || ' filas, ' || count(*) filter (where es_tuyo) || ' propia' from rk),
  (select count(*) = 11 and count(*) filter (where es_tuyo) = 1 and count(*) filter (where posicion <= 10) = 10 from rk);

insert into res
select 2, 'cada fila del ranking trae el avatar de ESE estudiante', '11 de 11',
  (select count(*) filter (where p.avatar_shape = r.avatar_shape and p.avatar_palette = r.avatar_palette
                            and p.avatar_level = r.avatar_level) || ' de ' || count(*)
     from rk r join public.profiles p on p.nickname = r.nickname),
  (select bool_and(p.avatar_shape = r.avatar_shape and p.avatar_palette = r.avatar_palette
                   and p.avatar_level = r.avatar_level) and count(*) = 11
     from rk r join public.profiles p on p.nickname = r.nickname);

insert into res
select 3, 'y no todos iguales: las combinaciones de verdad, no un valor por defecto', 'varias',
  (select count(distinct (avatar_shape, avatar_palette, avatar_level))::text || ' distintas' from rk),
  (select count(distinct (avatar_shape, avatar_palette, avatar_level)) >= 8 from rk);

-- ── liga_tablero ───────────────────────────────────────────────────────────
insert into res
select 4, 'el tablero de liga trae el avatar de cada fila del podio y de la propia', 'todas cuadran',
  (select count(*) filter (where p.avatar_shape = l.avatar_shape and p.avatar_palette = l.avatar_palette
                            and p.avatar_level = l.avatar_level) || ' de ' || count(*)
     from lt l join public.profiles p on p.nickname = l.nickname),
  (select count(*) > 1 and bool_and(p.avatar_shape = l.avatar_shape and p.avatar_palette = l.avatar_palette
                                    and p.avatar_level = l.avatar_level)
     from lt l join public.profiles p on p.nickname = l.nickname);

insert into res
select 5, 'el tablero sigue devolviendo solo el podio y la fila propia', 'podio + tú',
  (select count(*) filter (where en_podio) || ' en podio, ' || count(*) filter (where not en_podio) || ' fuera' from lt),
  (select bool_and(en_podio or es_tuyo) and count(*) filter (where es_tuyo) = 1 from lt);

-- ── lo que NO se expone ─────────────────────────────────────────────────────
insert into res
select 6, 'ranking_fp devuelve exactamente sus 7 columnas: ni niveles comprados ni Cristales', 'las 7',
  (select string_agg(a.attname, ' ' order by a.attnum) from pg_attribute a
    where a.attrelid = 'rk'::regclass and a.attnum > 0 and not a.attisdropped),
  (select array_agg(a.attname::text order by a.attnum) from pg_attribute a
    where a.attrelid = 'rk'::regclass and a.attnum > 0 and not a.attisdropped)
    = array['posicion', 'nickname', 'fp', 'es_tuyo', 'avatar_shape', 'avatar_palette', 'avatar_level'];

insert into res
select 7, 'liga_tablero no devuelve niveles comprados ni Cristales', 'ninguna',
  coalesce((select string_agg(a.attname, ' ') from pg_attribute a
             where a.attrelid = 'lt'::regclass and a.attnum > 0
               and a.attname in ('avatar_unlocked_levels', 'cristales_balance', 'user_id')), 'ninguna'),
  not exists (select 1 from pg_attribute a
               where a.attrelid = 'lt'::regclass and a.attnum > 0
                 and a.attname in ('avatar_unlocked_levels', 'cristales_balance', 'user_id'));

-- ── permisos tras el drop ──────────────────────────────────────────────────
insert into res
select 8, 'anon no ejecuta ninguna de las dos; authenticated sí', 'anon no / auth sí',
  case when has_function_privilege('anon', 'public.ranking_fp(text,text)', 'execute')
         or has_function_privilege('anon', 'public.liga_tablero(text)', 'execute') then 'anon sí' else 'anon no' end
  || ' / ' ||
  case when has_function_privilege('authenticated', 'public.ranking_fp(text,text)', 'execute')
        and has_function_privilege('authenticated', 'public.liga_tablero(text)', 'execute') then 'auth sí' else 'auth no' end,
  not has_function_privilege('anon', 'public.ranking_fp(text,text)', 'execute')
    and not has_function_privilege('anon', 'public.liga_tablero(text)', 'execute')
    and has_function_privilege('authenticated', 'public.ranking_fp(text,text)', 'execute')
    and has_function_privilege('authenticated', 'public.liga_tablero(text)', 'execute');

insert into res
select 9, 'sigue habiendo UNA sola firma de cada función', '1 y 1',
  (select count(*) from pg_proc where proname = 'ranking_fp') || ' y ' ||
  (select count(*) from pg_proc where proname = 'liga_tablero'),
  (select count(*) = 1 from pg_proc where proname = 'ranking_fp')
    and (select count(*) = 1 from pg_proc where proname = 'liga_tablero');

select n::text as n, paso, esperado, obtenido, case when ok then 'OK' else 'FALLA' end as estado from res
union all
select 'TOTAL', (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res), '', '',
       (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
