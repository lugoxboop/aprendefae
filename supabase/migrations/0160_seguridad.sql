/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0160 — LO QUE ENCONTRÓ LA AUDITORÍA DE SEGURIDAD (11-nov, orden de Mateo)
 *
 * GUARDIAN: cambio de esquema a proposito
 *
 * Rango del coordinador (150-199). Cuatro cierres, cada uno en su bloque:
 *
 *   1. Profesor solo con correo CONFIRMADO (punto 3 del informe)
 *   2. Tope diario total de Bruno para todo el sitio (punto 4)
 *   3. Tope a las opiniones sin sesión (punto 5)
 *   4. Registros de FP sospechosos, marcados para el profesor (punto 1)
 *
 * Ninguno borra ni cambia datos de estudiantes. El 4 solo AGREGA una marca a
 * las filas nuevas de fp_history: no quita FP a nadie. Decidir qué hacer con un
 * registro sospechoso es del profesor, que conoce a su estudiante.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ 1. PROFESOR SOLO CON CORREO CONFIRMADO ═══════════
 *
 * es_docente() miraba solo el correo que trae la sesión. El sitio entra con
 * Google, que confirma el correo; pero Supabase también acepta registros con
 * correo y contraseña por su cuenta, y si alguna vez quedan sin confirmación,
 * cualquiera podría registrarse con el correo de un profesor y ver nombres y
 * desempeño de sus estudiantes. Ahora además el correo de la cuenta tiene que
 * estar confirmado y ser el mismo de la lista de docentes.
 */
create or replace function public.es_docente()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.docentes d
      join auth.users u on u.id = auth.uid()
     where lower(d.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
       and lower(u.email) = lower(d.email)
       and u.email_confirmed_at is not null
       and d.activo
  );
$$;

/* ═══════════ 2. TOPE DIARIO TOTAL DE BRUNO ═══════════
 *
 * Cada cuenta tiene su cupo diario, pero no había techo para el sitio entero:
 * muchas cuentas multiplicaban el gasto de la API. El tope vive en `ajustes`
 * (clave asistente_tope_global) para poder moverlo sin migración; si no está,
 * vale 1500 preguntas al día. Al pasarlo, Bruno responde como cuando se acaba
 * el cupo propio, y vuelve al día siguiente.
 */
insert into public.ajustes (clave, valor, nota)
values ('asistente_tope_global', '1500',
        'Preguntas a Bruno por día (Bogotá) para TODO el sitio. Freno de gasto (auditoría 11-nov). Se cambia aquí, sin migración.')
on conflict (clave) do nothing;

create or replace function public.asistente_consumir(p_limite integer)
returns table(permitido boolean, usadas integer, limite integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_dia   date := (now() at time zone 'America/Bogota')::date;
  v_tras  integer;
  v_tope  integer;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para usar el asistente' using errcode = '42501';
  end if;
  if p_limite is null or p_limite < 0 then
    raise exception 'Límite de asistente inválido: %', p_limite using errcode = '22023';
  end if;

  /* El techo del sitio, antes del cupo propio. */
  select coalesce(nullif(regexp_replace(a.valor, '\D', '', 'g'), '')::integer, 1500)
    into v_tope from public.ajustes a where a.clave = 'asistente_tope_global';
  v_tope := coalesce(v_tope, 1500);
  if (select coalesce(sum(u.invocaciones), 0) from public.asistente_uso u where u.dia = v_dia) >= v_tope then
    return query
      select false, coalesce((select u.invocaciones from public.asistente_uso u where u.user_id = v_uid and u.dia = v_dia), 0), p_limite;
    return;
  end if;

  insert into public.asistente_uso (user_id, dia, invocaciones)
  values (v_uid, v_dia, 1)
      on conflict (user_id, dia) do update
         set invocaciones = public.asistente_uso.invocaciones + 1
       where public.asistente_uso.invocaciones < p_limite
  returning public.asistente_uso.invocaciones into v_tras;
  if v_tras is not null then
    return query select true, v_tras, p_limite;
  end if;
  return query
    select false, coalesce(u.invocaciones, 0), p_limite
      from public.asistente_uso u
     where u.user_id = v_uid and u.dia = v_dia;
end;
$$;

/* ═══════════ 3. TOPE A LAS OPINIONES SIN SESIÓN ═══════════
 *
 * Las opiniones de quien tiene sesión ya tenían tope diario. Las de quien no
 * tiene sesión, no: un programa podía llenar el panel del profesor con miles
 * de mensajes. Ahora: como mucho 30 opiniones sin sesión por hora en todo el
 * sitio, y su texto hasta 600 caracteres. El resto de la función, igual.
 */
DO $migracion$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO v_def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'enviar_opinion';
  IF v_def IS NULL THEN
    RAISE EXCEPTION 'enviar_opinion no existe: la 0160 se escribió contra la 0156';
  END IF;
  IF position('if v_uid is not null then' in v_def) = 0 OR position('v_texto := left(v_texto, 2000);' in v_def) = 0 THEN
    RAISE EXCEPTION 'enviar_opinion cambió desde la 0156: revisar la 0160 a mano';
  END IF;
  v_def := replace(v_def, 'v_texto := left(v_texto, 2000);',
    'v_texto := left(v_texto, case when v_uid is null then 600 else 2000 end);');
  v_def := replace(v_def, '  if v_uid is not null then',
'  /* (0160) Sin sesión: tope total por hora para el sitio entero. */
  if v_uid is null and (select count(*) from public.opiniones o
                         where o.user_id is null and o.creado > now() - interval ''1 hour'') >= 30 then
    return false;
  end if;
  if v_uid is not null then');
  EXECUTE v_def;
END
$migracion$;

/* ═══════════ 4. REGISTROS DE FP SOSPECHOSOS ═══════════
 *
 * El porcentaje de aciertos lo manda el navegador, y las respuestas viajan en
 * el sitio: quien sepa programar puede registrar 100 % sin jugar. El arreglo
 * de raíz es que el servidor califique (proyecto aparte). Mientras tanto, cada
 * fila nueva se mira al entrar y se marca si tiene la forma de una trampa:
 *
 *   · rafaga     más de 12 actividades registradas en 10 minutos
 *   · imposible  evaluativa al 100 % en menos del 30 % del tiempo mínimo
 *
 * No se marca la falta de duración: hay piezas del sitio que no la mandan, y
 * marcarlas pondría bajo sospecha a estudiantes honestos.
 *
 * Solo se marca. Los FP se pagan igual: un falso positivo no le cuesta nada a
 * un estudiante honesto, y el profesor ve la marca en su panel.
 */
alter table public.fp_history add column if not exists sospecha text;

create or replace function public.fp_marcar_sospecha()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recientes integer;
begin
  if new.activity_id like 'racha-%' or coalesce(new.modality, '') = 'racha' then
    return new;
  end if;
  select count(*) into v_recientes
    from public.fp_history h
   where h.user_id = new.user_id
     and h.created_at > now() - interval '10 minutes'
     and h.activity_id not like 'racha-%';
  if v_recientes >= 12 then
    new.sospecha := 'rafaga';
  elsif new.modality = 'evaluativa' and coalesce(new.correct_pct, 0) >= 100
        and new.duration_ms < 0.3 * public.fp_tiempo_minimo_ms(new.difficulty) then
    new.sospecha := 'imposible';
  end if;
  return new;
exception when others then
  /* La marca nunca puede costarle el registro a nadie. */
  return new;
end;
$$;

drop trigger if exists fp_marcar_sospecha on public.fp_history;
create trigger fp_marcar_sospecha
  before insert on public.fp_history
  for each row execute function public.fp_marcar_sospecha();

revoke all on function public.fp_marcar_sospecha() from public, anon, authenticated;

/* Para el panel: quién tiene registros marcados en la materia, de mayor a menor. */
create or replace function public.panel_sospechas(p_subject text)
returns table(user_id uuid, nickname text, full_name text, marcados integer, rafaga integer, imposible integer, ultimo timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.es_docente() then
    raise exception 'Panel docente: no autorizado' using errcode = '42501';
  end if;
  if not (p_subject = any (public.materias_docente())) then
    raise exception 'Panel docente: materia no autorizada' using errcode = '42501';
  end if;
  return query
    select h.user_id, p.nickname, p.full_name,
           count(*)::integer,
           count(*) filter (where h.sospecha = 'rafaga')::integer,
           count(*) filter (where h.sospecha = 'imposible')::integer,
           max(h.created_at)
      from public.fp_history h
      left join public.profiles p on p.user_id = h.user_id
     where h.subject_id = p_subject and h.sospecha is not null
       and coalesce(p.es_prueba, false) = false
     group by h.user_id, p.nickname, p.full_name
     order by count(*) desc, max(h.created_at) desc
     limit 50;
end;
$$;

revoke all on function public.panel_sospechas(text) from public, anon;
grant execute on function public.panel_sospechas(text) to authenticated;

/*
 * Para deshacer:
 *   drop function if exists public.panel_sospechas(text);
 *   drop trigger if exists fp_marcar_sospecha on public.fp_history;
 *   drop function if exists public.fp_marcar_sospecha();
 *   (la columna fp_history.sospecha se puede dejar: no estorba)
 *   es_docente, asistente_consumir y enviar_opinion: volver a sus versiones de
 *   la 0019/0040/0156 con create or replace.
 */
