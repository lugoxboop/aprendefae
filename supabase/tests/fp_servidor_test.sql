-- ---------------------------------------------------------------------------
-- Prueba del FP calculado en el servidor.
--
-- Lo que hay que demostrar es que un estudiante autenticado NO puede decidir
-- cuántos puntos se lleva, ni saltarse el tope de repetición, ni escribir el
-- historial por su cuenta. Y que la regla nueva se cumple: la primera vez paga,
-- las demás no.
--
-- SOBRE LOS ROLES, QUE ES LO QUE SE ROMPIÓ EN LOS TESTS ANTERIORES.
-- registrar_fp es security definer y saca el usuario de auth.uid(), que lee el
-- claim del JWT y no depende del rol. Así que basta con fijar el claim: no hace
-- falta cambiar de rol para llamarla, y ninguna tabla temporal acaba siendo de
-- otro dueño.
--
-- El único chequeo que sí necesita ser `authenticated` es el de la puerta de
-- atrás, y ese anota su resultado en un ajuste de transacción en vez de en una
-- tabla, precisamente para no volver a tropezar con lo mismo.
--
-- Usuario propio, materia real solo de lectura, y ROLLBACK al final.
--
-- CÓMO SE CORRE: pegar el archivo COMPLETO en el editor SQL de Supabase y
-- ejecutar sin seleccionar nada. La última consulta resume los chequeos.
-- ---------------------------------------------------------------------------

begin;

create temp table res(n int, paso text, esperado text, obtenido text, ok boolean) on commit drop;
create temp table ids(uid uuid) on commit drop;
create temp table pasos(etiqueta text, fp integer, rep integer) on commit drop;

insert into auth.users (id, email, encrypted_password, email_confirmed_at,
                        created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
                        aud, role)
values (gen_random_uuid(), 'zzz-fp@prueba.local', '', now(), now(), now(),
        '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated');

insert into ids(uid) select id from auth.users where email = 'zzz-fp@prueba.local';
insert into public.profiles(user_id, nickname) select uid, 'zzzfpprueba' from ids;

select set_config('request.jwt.claims',
                  json_build_object('sub', (select uid from ids), 'role', 'authenticated')::text,
                  true);

-- ── 1. La firma vieja ya no existe ─────────────────────────────────────────
-- Si siguiera ahí, el cliente podría seguir mandando su propio p_fp.
insert into res
select 1, 'la firma vieja que recibía p_fp ya no existe', '0',
  count(*)::text, count(*) = 0
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'registrar_fp'
  and pg_get_function_identity_arguments(p.oid) like '%integer, text, text%';

-- ── 2. No se puede insertar en el historial a mano ─────────────────────────
set local role authenticated;
do $puerta$
begin
  insert into public.fp_history (user_id, activity_id, subject_id, fp_awarded, difficulty, modality)
  values (auth.uid(), 'trampa', 'macroeconomia', 999999, 'experto', 'evaluativa');
  perform set_config('prueba.puerta', 'ABIERTA', true);
exception when others then
  perform set_config('prueba.puerta', 'rechazado', true);
end;
$puerta$;
reset role;

insert into res select 2, 'insertar en el historial a mano queda rechazado', 'rechazado',
  current_setting('prueba.puerta', true),
  current_setting('prueba.puerta', true) = 'rechazado';

-- ── 3 a 5. La regla nueva: la primera paga, las demás no ───────────────────
-- asedio-estrategico: dificil, base 50, evaluativa. Con 100% y tiempo de sobra
-- tiene que dar 50 exactos.
insert into pasos select 'primera', fp_awarded, repeat_index
  from public.registrar_fp('asedio-estrategico', 200000, 100);
insert into pasos select 'segunda', fp_awarded, repeat_index
  from public.registrar_fp('asedio-estrategico', 200000, 100);
insert into pasos select 'tercera', fp_awarded, repeat_index
  from public.registrar_fp('asedio-estrategico', 200000, 100);

insert into res select 3, 'primera vez con 100% paga la base completa', '50',
  (select fp::text from pasos where etiqueta = 'primera'),
  (select fp = 50 from pasos where etiqueta = 'primera');

insert into res select 4, 'repetir paga 0, sin escalón intermedio', '0',
  (select fp::text from pasos where etiqueta = 'segunda'),
  (select fp = 0 from pasos where etiqueta = 'segunda');

insert into res select 5, 'la repetición queda marcada en el historial', '1',
  (select rep::text from pasos where etiqueta = 'segunda'),
  (select rep = 1 from pasos where etiqueta = 'segunda');

insert into res select 6, 'la tercera tampoco paga', '0',
  (select fp::text from pasos where etiqueta = 'tercera'),
  (select fp = 0 from pasos where etiqueta = 'tercera');

-- ── 6. Los aciertos escalan, con piso del 50% ──────────────────────────────
-- radar-profundidad: medio, base 25. Con 0% de aciertos debe dar el piso: 13.
insert into pasos select 'piso', fp_awarded, repeat_index
  from public.registrar_fp('radar-profundidad', 200000, 0);

insert into res select 7, 'evaluativa con 0% cae al piso del 50%', '13',
  (select fp::text from pasos where etiqueta = 'piso'),
  (select fp = 13 from pasos where etiqueta = 'piso');

-- ── 7. La defensa de tiempo sigue en pie ───────────────────────────────────
-- expediente-rescate: dificil, base 50, mínimo 90 s. En 1 s y con 100%, al 60%: 30.
insert into pasos select 'rapido', fp_awarded, repeat_index
  from public.registrar_fp('expediente-rescate', 1000, 100);

insert into res select 8, 'terminar demasiado rápido recorta al 60%', '30',
  (select fp::text from pasos where etiqueta = 'rapido'),
  (select fp = 30 from pasos where etiqueta = 'rapido');

-- ── 8. Una actividad fuera del catálogo no paga nada ───────────────────────
do $inv$
begin
  perform public.registrar_fp('actividad-inventada', 200000, 100);
  perform set_config('prueba.inventada', 'PASÓ', true);
exception when others then
  perform set_config('prueba.inventada', 'rechazada', true);
end;
$inv$;

insert into res select 9, 'una actividad que no está en el catálogo se rechaza', 'rechazada',
  current_setting('prueba.inventada', true),
  current_setting('prueba.inventada', true) = 'rechazada';

-- ── 9. El total del perfil cuadra con el historial ─────────────────────────
insert into res select 10, 'points del perfil = suma del historial',
  (select coalesce(sum(fp_awarded), 0)::text from public.fp_history where user_id = (select uid from ids)),
  (select points::text from public.profiles where user_id = (select uid from ids)),
  (select p.points = (select coalesce(sum(h.fp_awarded), 0) from public.fp_history h where h.user_id = p.user_id)
     from public.profiles p where p.user_id = (select uid from ids));

-- ── 10. El catálogo del servidor tiene todas las actividades que dan FP ────
insert into res select 11, 'el catálogo del servidor no está vacío', '9 o más',
  (select count(*)::text from public.actividad_catalogo),
  (select count(*) >= 9 from public.actividad_catalogo);

-- ── Resumen. Única consulta que devuelve filas. ────────────────────────────
select
  n::text as n, paso, esperado, obtenido,
  case when ok then 'OK' else 'FALLA' end as estado
from res
union all
select
  'TOTAL',
  (select count(*) filter (where ok) || ' de ' || count(*) || ' en verde' from res),
  '', '',
  (select case when bool_and(ok) then 'TODO OK' else 'HAY FALLAS' end from res)
order by n;

rollback;
