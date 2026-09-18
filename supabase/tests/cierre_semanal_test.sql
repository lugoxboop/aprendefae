-- ---------------------------------------------------------------------------
-- Prueba del cierre semanal de ligas y del podio en Cristales (0036).
--
-- Dos escenarios en dos materias inventadas:
--
--   'zzz-cierre'  22 estudiantes, 3 niveles, TRES ciclos pendientes. Prueba la
--                 secuencia (uno por uno, no de un salto), el ciclo nulo, los
--                 podios en paralelo por nivel, la guarda de un solo cierre y
--                 que quien dispara el cierre no se perjudica.
--   'zzz-podio'   18 estudiantes en un solo nivel. Prueba el tamaño
--                 proporcional del podio (round(18 × 0,28) = 5) y los montos
--                 15 / 10 / 7 / 5 / 5, con el 4º y el 5º incluidos.
--
-- ═══════════ LO QUE ESTE ARCHIVO NO PUEDE PROBAR, Y CÓMO SE COMPENSA ════════
--
-- La carrera de verdad —dos sesiones cerrando el mismo ciclo en el mismo
-- milisegundo— necesita dos conexiones, y un archivo de psql tiene una. Así que
-- la guarda se prueba por sus tres piezas, que es lo que la hace cierta:
--
--   · la llave primaria de liga_cierre EXISTE (paso 10)
--   · una segunda fila del mismo (materia, ciclo) la rechaza la base con 23505,
--     que es exactamente lo que le pasa a la segunda transacción cuando la
--     primera confirma (paso 11)
--   · y si una segunda pasada llegara igual al pago —se le borra el marcador a
--     mano para forzarlo—, el libro de movimientos NO paga dos veces (paso 13)
--
-- Termina en ROLLBACK: no deja rastro.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
grant all on res to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- ESCENARIO A — 'zzz-cierre': tres ciclos pendientes, 22 estudiantes
-- ═══════════════════════════════════════════════════════════════════════════

create temp table a_ids(n integer, uid uuid) on commit drop;
grant select on a_ids to authenticated;
insert into a_ids(n, uid) select g, gen_random_uuid() from generate_series(1, 22) g;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
select uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'zzz-cierre-' || n || '@prueba.local', '', now(), now()
  from a_ids;
insert into public.profiles (user_id, nickname) select uid, 'zzzc' || lpad(n::text, 2, '0') from a_ids;

insert into public.actividad_catalogo (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base)
values ('zzz-cierre-act', 'zzz-cierre', 'zzz', 'exploratoria', 'facil', 10)
on conflict (activity_id) do nothing;

/* c0 = tres lunes atrás. Los ciclos c0, c0+7 y c0+14 quedarán pendientes. */
create temp table a_ciclos on commit drop as
select (public.ciclo_actual() - 21) as c0, (public.ciclo_actual() - 14) as c1,
       (public.ciclo_actual() - 7)  as c2, public.ciclo_actual() as hoy;

/* FP de la semana ANTERIOR a c0: es lo que hace que al sembrar c0 haya 22 activos → 3 niveles. */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'zzz-prev', 'zzz-cierre', n * 10, 'facil', 'exploratoria',
       ((select c0 from a_ciclos) - 3)::timestamp at time zone 'America/Bogota'
  from a_ids;

select public.ligas_sembrar_ciclo('zzz-cierre', (select c0 from a_ciclos));

/*
 * La semana c0: el estudiante n suma n × 10. La c1: al revés, (23 − n) × 10, para
 * que el cierre de una semana INTERMEDIA tenga a quién subir y a quién bajar.
 * La c2 se queda vacía a propósito: es el ciclo nulo.
 */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'zzz-sem-a', 'zzz-cierre', n * 10, 'facil', 'exploratoria',
       ((select c0 from a_ciclos) + 2)::timestamp at time zone 'America/Bogota'
  from a_ids;

insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'zzz-sem-b', 'zzz-cierre', (23 - n) * 10, 'facil', 'exploratoria',
       ((select c1 from a_ciclos) + 2)::timestamp at time zone 'America/Bogota'
  from a_ids;

insert into res
select 0, 'antes de disparar: solo está sembrado el ciclo c0', '1 ciclo',
  (select count(distinct ciclo)::text || ' ciclo(s)' from public.liga_membresia where subject_id = 'zzz-cierre'),
  (select count(distinct ciclo) = 1 from public.liga_membresia where subject_id = 'zzz-cierre');

/* La foto de los niveles de c0 y c1, para comparar después del cierre. */
create temp table a_c0 on commit drop as
select user_id, liga from public.liga_membresia
 where subject_id = 'zzz-cierre' and ciclo = (select c0 from a_ciclos);

-- ── EL DISPARO: el primer FP después del corte, por el estudiante 1 ─────────
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid from a_ids where n = 1), 'role', 'authenticated')::text, true);

set local role authenticated;
select public.registrar_fp('zzz-cierre-act', 60000, null);
reset role;

-- ── 1. Los tres ciclos pendientes se cerraron, EN SECUENCIA ─────────────────
insert into res
select 1, 'se sembró cada lunes pendiente, uno por uno (c0, c1, c2 y hoy)', '4 ciclos',
  (select count(distinct ciclo)::text || ' ciclos: ' || string_agg(distinct ciclo::text, ' ')
     from public.liga_membresia where subject_id = 'zzz-cierre'),
  (select count(distinct ciclo) = 4 from public.liga_membresia where subject_id = 'zzz-cierre')
  and (select bool_and(existe) from (
        select exists (select 1 from public.liga_membresia
                        where subject_id = 'zzz-cierre' and ciclo = c) as existe
          from (select c0 as c from a_ciclos union all select c1 from a_ciclos
                union all select c2 from a_ciclos union all select hoy from a_ciclos) x
      ) y);

insert into res
select 2, 'hay un cierre registrado por ciclo cerrado, y ninguno del ciclo en curso', '3 cierres',
  (select count(*)::text || ' cierres' from public.liga_cierre where subject_id = 'zzz-cierre'),
  (select count(*) = 3 from public.liga_cierre where subject_id = 'zzz-cierre')
  and not exists (select 1 from public.liga_cierre
                   where subject_id = 'zzz-cierre' and ciclo = (select hoy from a_ciclos));

-- ── 2. El ascenso y el descenso de una semana INTERMEDIA ocurrieron ─────────
insert into res
select 3, 'cerrar c1 movió gente: alguien subió y alguien bajó en una semana intermedia', 'sube y baja',
  (select coalesce(sum(case when d < 0 then 1 else 0 end), 0) || ' subieron / ' ||
          coalesce(sum(case when d > 0 then 1 else 0 end), 0) || ' bajaron'
     from (select m2.liga - m1.liga as d
             from public.liga_membresia m1
             join public.liga_membresia m2
               on m2.subject_id = m1.subject_id and m2.user_id = m1.user_id
              and m2.ciclo = (select c2 from a_ciclos)
            where m1.subject_id = 'zzz-cierre' and m1.ciclo = (select c1 from a_ciclos)) z),
  (select count(*) filter (where d < 0) > 0 and count(*) filter (where d > 0) > 0
     from (select m2.liga - m1.liga as d
             from public.liga_membresia m1
             join public.liga_membresia m2
               on m2.subject_id = m1.subject_id and m2.user_id = m1.user_id
              and m2.ciclo = (select c2 from a_ciclos)
            where m1.subject_id = 'zzz-cierre' and m1.ciclo = (select c1 from a_ciclos)) z);

-- ── 3. El ciclo nulo: cerrado, sin resultados y sin Cristales ───────────────
insert into res
select 4, 'el ciclo en que nadie jugó cierra sin actividad, sin resultados y sin pagar', 'false 0 filas 0',
  (select con_actividad::text || ' ' ||
          (select count(*) from public.liga_resultado
            where subject_id = 'zzz-cierre' and ciclo = (select c2 from a_ciclos))::text || ' filas ' ||
          cristales_pagados::text
     from public.liga_cierre where subject_id = 'zzz-cierre' and ciclo = (select c2 from a_ciclos)),
  (select not con_actividad and cristales_pagados = 0
     from public.liga_cierre where subject_id = 'zzz-cierre' and ciclo = (select c2 from a_ciclos))
  and not exists (select 1 from public.liga_resultado
                   where subject_id = 'zzz-cierre' and ciclo = (select c2 from a_ciclos));

insert into res
select 5, 'y en un ciclo nulo nadie sube ni baja', 'mismos niveles',
  (select count(*)::text || ' movidos' from public.liga_membresia m1
     join public.liga_membresia m2 on m2.subject_id = m1.subject_id and m2.user_id = m1.user_id
      and m2.ciclo = (select hoy from a_ciclos)
    where m1.subject_id = 'zzz-cierre' and m1.ciclo = (select c2 from a_ciclos) and m1.liga <> m2.liga),
  not exists (select 1 from public.liga_membresia m1
                join public.liga_membresia m2 on m2.subject_id = m1.subject_id and m2.user_id = m1.user_id
                 and m2.ciclo = (select hoy from a_ciclos)
               where m1.subject_id = 'zzz-cierre' and m1.ciclo = (select c2 from a_ciclos)
                 and m1.liga <> m2.liga);

-- ── 4. Cada nivel tiene su propio podio, en paralelo ───────────────────────
insert into res
select 6, 'los 3 niveles de c0 pagaron su propio podio, cada uno del tamaño de su liga', '3 niveles',
  (select string_agg(liga || ': ' || en_podio || ' de ' || tam, ' | ' order by liga) from (
     select liga, count(*) filter (where en_podio) as en_podio,
            max(tam_liga) as tam, max(public.liga_podio_tamano(tam_liga)) as debe
       from public.liga_resultado
      where subject_id = 'zzz-cierre' and ciclo = (select c0 from a_ciclos)
      group by liga) x),
  (select count(*) = 3 and bool_and(en_podio = debe) from (
     select liga, count(*) filter (where en_podio) as en_podio,
            max(public.liga_podio_tamano(tam_liga)) as debe
       from public.liga_resultado
      where subject_id = 'zzz-cierre' and ciclo = (select c0 from a_ciclos)
      group by liga) x);

insert into res
select 7, 'el pago apuntado en el cierre es la suma de los Cristales de las filas de resultado', 'cuadra',
  (select lc.cristales_pagados || ' = ' ||
          (select coalesce(sum(lr.cristales), 0) from public.liga_resultado lr
            where lr.subject_id = lc.subject_id and lr.ciclo = lc.ciclo)
     from public.liga_cierre lc
    where lc.subject_id = 'zzz-cierre' and lc.ciclo = (select c0 from a_ciclos)),
  (select lc.cristales_pagados = (select coalesce(sum(lr.cristales), 0) from public.liga_resultado lr
                                   where lr.subject_id = lc.subject_id and lr.ciclo = lc.ciclo)
     from public.liga_cierre lc
    where lc.subject_id = 'zzz-cierre' and lc.ciclo = (select c0 from a_ciclos));

insert into res
select 8, 'a cada estudiante del podio le llegó al libro lo que dice su fila de resultado', 'todos cuadran',
  (select count(*)::text || ' pagos' from public.cristal_movimiento
    where clave = 'podio-zzz-cierre-' || (select c0 from a_ciclos)),
  (select bool_and(cm.cristales = lr.cristales) and count(*) = (
            select count(*) from public.liga_resultado
             where subject_id = 'zzz-cierre' and ciclo = (select c0 from a_ciclos) and cristales > 0)
     from public.liga_resultado lr
     join public.cristal_movimiento cm
       on cm.user_id = lr.user_id and cm.clave = 'podio-zzz-cierre-' || lr.ciclo
    where lr.subject_id = 'zzz-cierre' and lr.ciclo = (select c0 from a_ciclos) and lr.cristales > 0);

-- ── 5. Quien dispara el cierre no se perjudica ──────────────────────────────
/*
 * Su actividad de hoy NO puede haber entrado en el ciclo que se cerró: su FP
 * registrado en c0 es el de esa semana y nada más (10, de 'zzz-sem-a'). Y sí
 * está en la membresía del ciclo nuevo, que es donde su actividad cuenta.
 */
insert into res
select 9, 'el FP de hoy del que disparó el cierre NO cuenta en el ciclo cerrado, y sí está en el nuevo', '10 y sí',
  (select lr.fp::text from public.liga_resultado lr
    where lr.subject_id = 'zzz-cierre' and lr.ciclo = (select c0 from a_ciclos)
      and lr.user_id = (select uid from a_ids where n = 1))
  || ' / ' ||
  (case when exists (select 1 from public.liga_membresia
                      where subject_id = 'zzz-cierre' and ciclo = (select hoy from a_ciclos)
                        and user_id = (select uid from a_ids where n = 1)) then 'sí' else 'no' end),
  (select lr.fp = 10 from public.liga_resultado lr
    where lr.subject_id = 'zzz-cierre' and lr.ciclo = (select c0 from a_ciclos)
      and lr.user_id = (select uid from a_ids where n = 1))
  and exists (select 1 from public.liga_membresia
               where subject_id = 'zzz-cierre' and ciclo = (select hoy from a_ciclos)
                 and user_id = (select uid from a_ids where n = 1));

-- ── 6. La guarda de un solo cierre por liga y por ciclo ────────────────────
insert into res
select 10, 'liga_cierre tiene llave primaria sobre (materia, ciclo): la guarda es de la base', 'sí',
  (select case when count(*) = 1 then 'sí' else 'no' end
     from pg_constraint c
    where c.conrelid = 'public.liga_cierre'::regclass and c.contype = 'p'
      and (select array_agg(a.attname::text order by a.attname)
             from pg_attribute a
            where a.attrelid = c.conrelid and a.attnum = any (c.conkey)) = array['ciclo', 'subject_id']),
  (select count(*) = 1
     from pg_constraint c
    where c.conrelid = 'public.liga_cierre'::regclass and c.contype = 'p'
      and (select array_agg(a.attname::text order by a.attname)
             from pg_attribute a
            where a.attrelid = c.conrelid and a.attnum = any (c.conkey)) = array['ciclo', 'subject_id']);

do $$
begin
  begin
    insert into public.liga_cierre (subject_id, ciclo, con_actividad)
    values ('zzz-cierre', (select c0 from a_ciclos), true);
    perform set_config('zzz.dos_cierres', 'entró', true);
  exception when others then
    perform set_config('zzz.dos_cierres', sqlstate, true);
  end;
end;
$$;

insert into res
select 11, 'un segundo cierre del mismo ciclo lo rechaza la base (lo mismo que le pasa a la 2ª transacción)', '23505',
  current_setting('zzz.dos_cierres'), current_setting('zzz.dos_cierres') = '23505';

create temp table a_saldos on commit drop as
select user_id, cristales_balance from public.profiles
 where user_id in (select uid from a_ids);

select public.ligas_cerrar_resultados('zzz-cierre', (select c0 from a_ciclos)) as segunda_pasada;

insert into res
select 12, 'volver a cerrar el mismo ciclo no paga nada: el marcador ya estaba', 'sin cambios',
  (select count(*)::text || ' saldos movidos' from public.profiles p join a_saldos s on s.user_id = p.user_id
    where p.cristales_balance <> s.cristales_balance),
  not exists (select 1 from public.profiles p join a_saldos s on s.user_id = p.user_id
               where p.cristales_balance <> s.cristales_balance);

/*
 * Y la segunda línea de defensa: si a una segunda pasada le faltara el marcador
 * —el peor entrelazado posible, dos transacciones que ya calcularon y van a
 * pagar— el libro de movimientos lo para igual.
 */
delete from public.liga_cierre where subject_id = 'zzz-cierre' and ciclo = (select c0 from a_ciclos);
select public.ligas_cerrar_resultados('zzz-cierre', (select c0 from a_ciclos)) as sin_marcador;

insert into res
select 13, 'sin marcador, el libro de movimientos sigue impidiendo el doble pago', 'sin cambios',
  (select count(*)::text || ' saldos movidos' from public.profiles p join a_saldos s on s.user_id = p.user_id
    where p.cristales_balance <> s.cristales_balance),
  not exists (select 1 from public.profiles p join a_saldos s on s.user_id = p.user_id
               where p.cristales_balance <> s.cristales_balance);

-- ═══════════════════════════════════════════════════════════════════════════
-- ESCENARIO B — 'zzz-podio': 18 en un nivel, podio de 5 y los cuatro montos
-- ═══════════════════════════════════════════════════════════════════════════

create temp table b_ids(n integer, uid uuid) on commit drop;
insert into b_ids(n, uid) select g, gen_random_uuid() from generate_series(1, 18) g;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
select uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
       'zzz-podio-' || n || '@prueba.local', '', now(), now()
  from b_ids;
insert into public.profiles (user_id, nickname) select uid, 'zzzp' || lpad(n::text, 2, '0') from b_ids;

create temp table b_ciclo on commit drop as select (public.ciclo_actual() - 7) as cb;

insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'zzz-prev-b', 'zzz-podio', 50, 'facil', 'exploratoria',
       ((select cb from b_ciclo) - 3)::timestamp at time zone 'America/Bogota'
  from b_ids;

select public.ligas_sembrar_ciclo('zzz-podio', (select cb from b_ciclo));

/* La semana que se va a cerrar: el estudiante n suma n × 10, sin empates. */
insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality, created_at)
select uid, 'zzz-sem-b1', 'zzz-podio', n * 10, 'facil', 'exploratoria',
       ((select cb from b_ciclo) + 2)::timestamp at time zone 'America/Bogota'
  from b_ids;

select public.ligas_sembrar('zzz-podio');

insert into res
select 14, '18 en un solo nivel → podio de 5 (round(18 × 0,28))', '1 nivel, 5 en podio',
  (select max(liga) || ' nivel(es), ' || count(*) filter (where en_podio) || ' en podio'
     from public.liga_resultado where subject_id = 'zzz-podio' and ciclo = (select cb from b_ciclo)),
  (select max(liga) = 1 and count(*) filter (where en_podio) = 5 and count(*) = 18
     from public.liga_resultado where subject_id = 'zzz-podio' and ciclo = (select cb from b_ciclo));

insert into res
select 15, 'los montos por puesto: 15 / 10 / 7 / 5 / 5 y nada del sexto en adelante', '15 10 7 5 5 0',
  (select string_agg(cristales::text, ' ' order by posicion) from public.liga_resultado
    where subject_id = 'zzz-podio' and ciclo = (select cb from b_ciclo) and posicion <= 6),
  (select string_agg(cristales::text, ' ' order by posicion) = '15 10 7 5 5 0'
     from public.liga_resultado
    where subject_id = 'zzz-podio' and ciclo = (select cb from b_ciclo) and posicion <= 6);

insert into res
select 16, 'el primer puesto es el que más FP hizo esa semana, y cobró 15', 'el 18 con 15',
  (select 'el ' || b.n || ' con ' || lr.cristales from public.liga_resultado lr join b_ids b on b.uid = lr.user_id
    where lr.subject_id = 'zzz-podio' and lr.ciclo = (select cb from b_ciclo) and lr.posicion = 1),
  (select b.n = 18 and lr.cristales = 15 and lr.fp = 180
     from public.liga_resultado lr join b_ids b on b.uid = lr.user_id
    where lr.subject_id = 'zzz-podio' and lr.ciclo = (select cb from b_ciclo) and lr.posicion = 1);

insert into res
select 17, 'el podio de esa semana pagó 42 Cristales en total', '42',
  (select cristales_pagados::text from public.liga_cierre
    where subject_id = 'zzz-podio' and ciclo = (select cb from b_ciclo)),
  (select cristales_pagados = 42 and con_actividad from public.liga_cierre
    where subject_id = 'zzz-podio' and ciclo = (select cb from b_ciclo));

-- ── Las dos fórmulas, sueltas ──────────────────────────────────────────────
insert into res
select 18, 'tamaño del podio = round(n × 0,28) con mínimo 2', '2 2 2 2 3 5 7 8',
  (select string_agg(public.liga_podio_tamano(t)::text, ' ' order by t)
     from (values (1::bigint), (3), (7), (8), (10), (17), (25), (30)) v(t)),
  public.liga_podio_tamano(1) = 2 and public.liga_podio_tamano(3) = 2
    and public.liga_podio_tamano(7) = 2 and public.liga_podio_tamano(8) = 2
    and public.liga_podio_tamano(10) = 3 and public.liga_podio_tamano(17) = 5
    and public.liga_podio_tamano(25) = 7 and public.liga_podio_tamano(30) = 8
    and public.liga_podio_tamano(0) = 0 and public.liga_podio_tamano(null) = 0;

insert into res
select 19, 'lo que paga cada puesto: 15, 10, 7 y 5 del cuarto en adelante', '15 10 7 5 5 5',
  (select string_agg(public.liga_cristales_puesto(p)::text, ' ' order by p)
     from (values (1::bigint), (2), (3), (4), (5), (9)) v(p)),
  public.liga_cristales_puesto(1) = 15 and public.liga_cristales_puesto(2) = 10
    and public.liga_cristales_puesto(3) = 7 and public.liga_cristales_puesto(4) = 5
    and public.liga_cristales_puesto(9) = 5 and public.liga_cristales_puesto(0) = 0;

insert into res
select 20, 'el podio de Cristales NO es la zona de ascenso: son dos cortes distintos', 'distintos',
  'podio(17)=' || public.liga_podio_tamano(17) || ' zona(17)=' || public.ligas_cupo(17),
  public.liga_podio_tamano(17) <> public.ligas_cupo(17)
    and public.liga_podio_tamano(7) <> public.ligas_cupo(7);

-- ── Nadie más que el servidor cierra la semana ─────────────────────────────
insert into res
select 21, 'ni anon ni authenticated pueden cerrar la semana a mano', 'ninguno',
  coalesce((select string_agg(v.rol, ', ') from (values ('anon'), ('authenticated')) v(rol)
             where has_function_privilege(v.rol, 'public.ligas_cerrar_semana(text)', 'execute')
                or has_function_privilege(v.rol, 'public.ligas_cerrar_resultados(text,date)', 'execute')), 'ninguno'),
  not has_function_privilege('anon', 'public.ligas_cerrar_semana(text)', 'execute')
    and not has_function_privilege('authenticated', 'public.ligas_cerrar_semana(text)', 'execute')
    and not has_function_privilege('authenticated', 'public.ligas_cerrar_resultados(text,date)', 'execute')
    and not has_function_privilege('authenticated', 'public.ligas_sembrar_ciclo(text,date)', 'execute');

-- ── El orden dentro de registrar_fp ───────────────────────────────────────
/*
 * Que el FP de hoy no entre en el ciclo cerrado ya lo garantiza la ventana de
 * fechas, así que un cierre puesto después del insert pasaría el paso 9 igual.
 * Lo que fija el requisito es el ORDEN, y el orden se lee en el cuerpo de la
 * función: el cierre corre antes de que exista la fila.
 */
insert into res
select 22, 'en registrar_fp el cierre de la semana va ANTES de escribir la fila de FP', 'antes',
  case when position('ligas_cerrar_semana' in p.prosrc) = 0 then 'no lo llama'
       when position('ligas_cerrar_semana' in p.prosrc) < position('insert into public.fp_history' in p.prosrc)
       then 'antes' else 'después' end,
  position('ligas_cerrar_semana' in p.prosrc) > 0
    and position('insert into public.fp_history' in p.prosrc) > 0
    and position('ligas_cerrar_semana' in p.prosrc) < position('insert into public.fp_history' in p.prosrc)
from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
where ns.nspname = 'public' and p.proname = 'registrar_fp';

select n::text as n, paso, esperado, obtenido, case when ok then 'OK' else 'FALLA' end as estado from res
union all
select 'TOTAL', (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res), '', '',
       (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
