-- ===========================================================================
-- EL CUPO DEL ASISTENTE (migración 0040)
--
-- Lo que se comprueba es lo que protege la factura: que sin sesión no se pueda
-- llamar, que el límite se cumpla de verdad, que pasado el límite el contador
-- NO siga subiendo, y que el estudiante no pueda tocar su propio contador.
--
-- Crea sus usuarios dentro de la transacción y termina en ROLLBACK: se corre
-- tal cual en el SQL Editor y no deja rastro. Todos deben decir PASA.
-- ===========================================================================

begin;

create temporary table ids (label text primary key, uid uuid default gen_random_uuid());
insert into ids (label) values ('ana'), ('bruno');

insert into auth.users (id, email)
select uid, label || '@zzz-asistente.test' from ids;

insert into public.profiles (user_id, nickname)
select uid, 'zzz' || label from ids;

create temporary table res (
  n integer, chequeo text, esperado text, obtenido text, pasa boolean
);

/* Ana, con sesión. */
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid from ids where label = 'ana'), 'role', 'authenticated')::text, true);

-- ── 1. El contador arranca en cero ─────────────────────────────────────────
insert into res
select 1, 'sin haber usado nada, el contador de hoy es 0', '0',
  public.asistente_uso_hoy()::text, public.asistente_uso_hoy() = 0;

-- ── 2. Consumir cuenta, y deja pasar mientras haya cupo ────────────────────
do $$
declare v record; v_ok boolean := true; v_txt text := '';
begin
  for i in 1..3 loop
    select * into v from public.asistente_consumir(3);
    v_txt := v_txt || v.permitido::text || '/' || v.usadas::text || ' ';
    if not v.permitido or v.usadas <> i then v_ok := false; end if;
  end loop;
  insert into res values (2, 'con límite 3, las tres primeras pasan y cuentan 1,2,3',
    'true/1 true/2 true/3', btrim(v_txt), v_ok);
end $$;

-- ── 3. La cuarta se rechaza ────────────────────────────────────────────────
do $$
declare v record;
begin
  select * into v from public.asistente_consumir(3);
  insert into res values (3, 'la cuarta invocación se rechaza',
    'false/3/3', v.permitido::text || '/' || v.usadas::text || '/' || v.limite::text,
    v.permitido = false and v.usadas = 3 and v.limite = 3);
end $$;

-- ── 4. Y NO sigue subiendo el contador ─────────────────────────────────────
/*
 * Importa más de lo que parece: si el rechazo incrementara igual, un
 * estudiante que insistiera se quedaría fuera para siempre aunque mañana le
 * subieran el límite, porque el contador del día ya estaría inflado.
 */
insert into res
select 4, 'un rechazo no incrementa el contador', '3',
  public.asistente_uso_hoy()::text, public.asistente_uso_hoy() = 3;

-- ── 5. Subir el límite reabre el cupo, sin migrar nada ─────────────────────
do $$
declare v record;
begin
  select * into v from public.asistente_consumir(5);
  insert into res values (5, 'con el límite en 5, vuelve a pasar (el número es un parámetro)',
    'true/4', v.permitido::text || '/' || v.usadas::text, v.permitido and v.usadas = 4);
end $$;

-- ── 6. Consultar no consume ────────────────────────────────────────────────
do $$
declare v_antes integer; v_despues integer;
begin
  v_antes := public.asistente_uso_hoy();
  perform public.asistente_uso_hoy();
  v_despues := public.asistente_uso_hoy();
  insert into res values (6, 'preguntar cuánto llevas no gasta una', v_antes::text, v_despues::text,
    v_antes = v_despues);
end $$;

-- ── 7. El contador es por estudiante ───────────────────────────────────────
select set_config('request.jwt.claims',
  json_build_object('sub', (select uid from ids where label = 'bruno'), 'role', 'authenticated')::text, true);

do $$
declare v record;
begin
  select * into v from public.asistente_consumir(3);
  insert into res values (7, 'otro estudiante arranca con su propio contador',
    'true/1', v.permitido::text || '/' || v.usadas::text, v.permitido and v.usadas = 1);
end $$;

-- ── 8. Un límite inválido se rechaza, no se interpreta ─────────────────────
do $$
declare v_estado text;
begin
  begin
    perform public.asistente_consumir(-1);
    insert into res values (8, 'un límite negativo se rechaza', 'rechazado (22023)', 'PERMITIDO', false);
  exception when others then
    v_estado := sqlstate;
    insert into res values (8, 'un límite negativo se rechaza', 'rechazado (22023)',
      'rechazado (' || v_estado || ')', v_estado = '22023');
  end;
end $$;

do $$
declare v_estado text;
begin
  begin
    perform public.asistente_consumir(null);
    insert into res values (9, 'un límite nulo se rechaza (no es «sin límite»)', 'rechazado (22023)', 'PERMITIDO', false);
  exception when others then
    v_estado := sqlstate;
    insert into res values (9, 'un límite nulo se rechaza (no es «sin límite»)', 'rechazado (22023)',
      'rechazado (' || v_estado || ')', v_estado = '22023');
  end;
end $$;

-- ── 10. Sin sesión, la función no atiende ──────────────────────────────────
select set_config('request.jwt.claims', '', true);

do $$
declare v_estado text;
begin
  begin
    perform public.asistente_consumir(10);
    insert into res values (10, 'sin sesión, asistente_consumir rechaza', 'rechazado (42501)', 'PERMITIDO', false);
  exception when others then
    v_estado := sqlstate;
    insert into res values (10, 'sin sesión, asistente_consumir rechaza', 'rechazado (42501)',
      'rechazado (' || v_estado || ')', v_estado = '42501');
  end;
end $$;

-- ── 11. anon no puede ni ejecutarla ────────────────────────────────────────
insert into res
select 11, 'anon NO tiene execute sobre asistente_consumir', 'false',
  has_function_privilege('anon', 'public.asistente_consumir(integer)', 'execute')::text,
  has_function_privilege('anon', 'public.asistente_consumir(integer)', 'execute') = false;

insert into res
select 12, 'authenticated SÍ tiene execute', 'true',
  has_function_privilege('authenticated', 'public.asistente_consumir(integer)', 'execute')::text,
  has_function_privilege('authenticated', 'public.asistente_consumir(integer)', 'execute') = true;

-- ── 13. Nadie llega a la tabla del contador desde el cliente ───────────────
insert into res
select 13, 'ni anon ni authenticated pueden leer la tabla del contador', 'false / false',
  has_table_privilege('anon', 'public.asistente_uso', 'select')::text || ' / ' ||
  has_table_privilege('authenticated', 'public.asistente_uso', 'select')::text,
  not has_table_privilege('anon', 'public.asistente_uso', 'select')
  and not has_table_privilege('authenticated', 'public.asistente_uso', 'select');

insert into res
select 14, 'ni escribirla', 'false / false',
  has_table_privilege('anon', 'public.asistente_uso', 'update')::text || ' / ' ||
  has_table_privilege('authenticated', 'public.asistente_uso', 'update')::text,
  not has_table_privilege('anon', 'public.asistente_uso', 'update')
  and not has_table_privilege('authenticated', 'public.asistente_uso', 'update');

insert into res
select 15, 'RLS encendida y forzada en el contador', 'true / true',
  c.relrowsecurity::text || ' / ' || c.relforcerowsecurity::text,
  c.relrowsecurity and c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'asistente_uso';

-- ── Resultado ──────────────────────────────────────────────────────────────
select
  n, chequeo, esperado, obtenido,
  case when pasa then 'PASA' else 'FALLA' end as resultado
from res order by n;

select
  count(*) filter (where pasa) || ' de ' || count(*) || ' en verde' as total,
  case when bool_and(pasa) then 'TODO OK' else 'HAY FALLAS' end as veredicto
from res;

rollback;
