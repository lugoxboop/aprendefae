/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0176 — LO QUE ENCONTRÓ LA AUDITORÍA EXTERNA DEL 25-NOV (orden de Mateo)
 *
 * GUARDIAN: cambio de esquema a proposito
 *
 * Rango del coordinador (150-199). Seis cierres, cada uno en su bloque y con
 * el número del hallazgo del informe:
 *
 *   1. El cupo de Bruno tiene techo en el servidor            (hallazgo 2)
 *   2. Opinar con firma volvía a fallar: columna equivocada    (hallazgo 11)
 *   3. Buzón anónimo: tope por origen, no solo uno global      (hallazgo 9)
 *   4. Funciones internas que dejaban ver datos de otros       (hallazgo 7)
 *   5. La búsqueda de amigos ya no recorre todos los apodos    (hallazgo 7)
 *   6. Dos envíos simultáneos ya no pagan dos veces            (hallazgo 8)
 *
 * Ninguno borra ni cambia datos de estudiantes. Los bloques 2, 3, 5 y 6
 * parchean la definición VIVA de la función (pg_get_functiondef + replace),
 * como hizo la 0160: así no se pisa ningún cambio posterior a la migración
 * que la creó, y si la función cambió por debajo, la migración se detiene
 * en vez de adivinar.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════ 1. EL CUPO DE BRUNO TIENE TECHO EN EL SERVIDOR ═══════════
 *
 * asistente_consumir(p_limite) creía el límite que le mandaban. La función
 * del servidor (asistente) siempre manda el real, pero cualquier estudiante
 * podía llamarla directo con un límite de un millón y gastar, él solo, las
 * 1.500 preguntas diarias del sitio entero: Bruno quedaba apagado para todos.
 *
 * Ahora el límite que se usa es el MENOR entre el que llega y el techo que
 * vive en `ajustes` (clave asistente_cupo_maximo, 100 si no está). El techo es
 * holgado a propósito: el límite real lo sigue poniendo el secreto
 * ASISTENTE_LIMITE_DIARIO de la función, y este solo impide inventarse uno.
 * La firma no cambia, así que la función del servidor no necesita despliegue.
 */
insert into public.ajustes (clave, valor, nota)
values ('asistente_cupo_maximo', '100',
        'Techo del cupo diario de Bruno POR ESTUDIANTE, aunque la llamada pida más. El límite real es el secreto ASISTENTE_LIMITE_DIARIO; esto solo impide inventarse uno (auditoría 25-nov).')
on conflict (clave) do nothing;

DO $migracion$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_functiondef('public.asistente_consumir(integer)'::regprocedure) INTO v_def;
  IF position('  v_tope  integer;' in v_def) = 0
     OR position('raise exception ''Límite de asistente inválido: %'', p_limite using errcode = ''22023'';
  end if;' in v_def) = 0 THEN
    RAISE EXCEPTION 'asistente_consumir cambió desde la 0160: revisar la 0176 a mano';
  END IF;
  v_def := replace(v_def, '  v_tope  integer;',
'  v_tope  integer;
  v_techo integer;');
  v_def := replace(v_def, 'raise exception ''Límite de asistente inválido: %'', p_limite using errcode = ''22023'';
  end if;',
'raise exception ''Límite de asistente inválido: %'', p_limite using errcode = ''22023'';
  end if;

  /* (0176) El límite no lo decide quien llama: se recorta al techo de ajustes. */
  select nullif(regexp_replace(a.valor, ''\D'', '''', ''g''), '''')::integer
    into v_techo from public.ajustes a where a.clave = ''asistente_cupo_maximo'';
  p_limite := least(p_limite, coalesce(v_techo, 100));');
  EXECUTE v_def;
END
$migracion$;

/* ═══════════ 2. OPINAR CON FIRMA: LA COLUMNA ES user_id ═══════════
 *
 * enviar_opinion buscaba el apodo con `where id = v_uid`, pero en profiles la
 * llave es user_id (0001). Postgres solo lo descubre al ejecutar esa línea,
 * así que toda opinión con la casilla de firmar terminaba en error y se
 * perdía; las anónimas, que son la mayoría, pasaban. Una palabra.
 */
DO $migracion$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO v_def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'enviar_opinion';
  IF position('select nickname into v_apodo from public.profiles where id = v_uid;' in v_def) = 0 THEN
    RAISE EXCEPTION 'enviar_opinion cambió: el apodo ya no se busca por id. Revisar la 0176 a mano';
  END IF;
  v_def := replace(v_def,
    'select nickname into v_apodo from public.profiles where id = v_uid;',
    'select nickname into v_apodo from public.profiles where user_id = v_uid;');
  EXECUTE v_def;
END
$migracion$;

/* ═══════════ 3. BUZÓN ANÓNIMO: TOPE POR ORIGEN ═══════════
 *
 * La 0160 puso 30 opiniones sin sesión por hora para TODO el sitio. Frenaba
 * el correo basura, pero cualquiera podía gastar las 30 en un minuto y
 * silenciar el buzón para los demás.
 *
 * Ahora cada origen de red tiene su propio tope (5 por hora) y el tope global
 * sube a 120 como último freno. El origen NO se guarda: se guarda una huella
 * (md5 de la dirección y el día), que sirve para contar y cambia cada día, y
 * las huellas de más de un día se borran solas en la misma función. Si la
 * petición no trae dirección (pruebas, editor SQL), queda solo el tope global.
 */
create table if not exists public.opiniones_anon_origen (
  huella text        not null,
  creado timestamptz not null default now()
);
create index if not exists opiniones_anon_origen_idx
  on public.opiniones_anon_origen (huella, creado);
alter table public.opiniones_anon_origen enable row level security;
alter table public.opiniones_anon_origen force row level security;
revoke all on public.opiniones_anon_origen from public, anon, authenticated;

create or replace function public.opinion_anon_permitida()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cab    json;
  v_ip     text;
  v_huella text;
begin
  /* El tope global, como último freno (era de 30; ver arriba). */
  if (select count(*) from public.opiniones o
       where o.user_id is null and o.creado > now() - interval '1 hour') >= 120 then
    return false;
  end if;

  begin
    v_cab := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    v_cab := null;
  end;
  v_ip := nullif(btrim(coalesce(
            v_cab ->> 'cf-connecting-ip',
            split_part(coalesce(v_cab ->> 'x-forwarded-for', ''), ',', 1),
            v_cab ->> 'x-real-ip', '')), '');
  if v_ip is null then
    return true;
  end if;

  v_huella := md5(v_ip || '|' || (now() at time zone 'America/Bogota')::date::text);
  delete from public.opiniones_anon_origen where creado < now() - interval '1 day';
  if (select count(*) from public.opiniones_anon_origen a
       where a.huella = v_huella and a.creado > now() - interval '1 hour') >= 5 then
    return false;
  end if;
  insert into public.opiniones_anon_origen (huella) values (v_huella);
  return true;
end;
$$;

revoke all on function public.opinion_anon_permitida() from public, anon, authenticated;

DO $migracion$
DECLARE
  v_def text;
  v_viejo text := '  if v_uid is null and (select count(*) from public.opiniones o
                         where o.user_id is null and o.creado > now() - interval ''1 hour'') >= 30 then';
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO v_def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'enviar_opinion';
  IF position(v_viejo in v_def) = 0 THEN
    RAISE EXCEPTION 'enviar_opinion cambió desde la 0160: el tope sin sesión no está. Revisar la 0176 a mano';
  END IF;
  v_def := replace(v_def, v_viejo,
'  /* (0176) Tope por origen y global: opinion_anon_permitida(). */
  if v_uid is null and not public.opinion_anon_permitida() then');
  EXECUTE v_def;
END
$migracion$;

/* ═══════════ 4. FUNCIONES INTERNAS, SOLO PARA USO INTERNO ═══════════
 *
 * Tres funciones que solo llaman otras funciones del servidor quedaron con
 * permiso para cualquier estudiante con sesión:
 *
 *   · liga_resultados   puntos e identificador de todos los de una liga
 *   · reto_avance       cuántas actividades hizo cualquiera, entre dos fechas
 *   · son_amigos        si dos personas cualesquiera son amigas
 *
 * Sus usuarios legítimos (medallas, logros, resumen_semestre, los retos, las
 * salas) son security definer: corren con el permiso del dueño, no con el del
 * estudiante, así que retirarles el permiso a los estudiantes no les cambia
 * nada. El sitio no las llama directo (buscado en src/).
 */
revoke execute on function public.liga_resultados(text, date) from public, anon, authenticated;
revoke execute on function public.reto_avance(uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke execute on function public.son_amigos(uuid, uuid) from public, anon, authenticated;

/* ═══════════ 5. BUSCAR AMIGOS SIN COMODINES ═══════════
 *
 * amigos_buscar pegaba el texto tal cual dentro de un ILIKE, así que «__»
 * (dos comodines) coincidía con todos los apodos y se podía recorrer la lista
 * entera de estudiantes, de ocho en ocho. Ahora %, _ y \ se buscan como
 * letras normales.
 */
DO $migracion$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_functiondef('public.amigos_buscar(text)'::regprocedure) INTO v_def;
  IF position('  v_q   text := btrim(coalesce(p_texto, ''''));' in v_def) = 0
     OR position('v_q || ''%''' in v_def) = 0 THEN
    RAISE EXCEPTION 'amigos_buscar cambió desde la 0167: revisar la 0176 a mano';
  END IF;
  v_def := replace(v_def, 'v_q || ''%''', 'v_e || ''%''');
  v_def := replace(v_def, '  v_q   text := btrim(coalesce(p_texto, ''''));',
'  v_q   text := btrim(coalesce(p_texto, ''''));
  /* (0176) El texto, con sus comodines neutralizados para el ILIKE. */
  v_e   text := replace(replace(replace(btrim(coalesce(p_texto, '''')), ''\'', ''\\''), ''%'', ''\%''), ''_'', ''\_'');');
  EXECUTE v_def;
END
$migracion$;

/* ═══════════ 6. DOS ENVÍOS A LA VEZ YA NO PAGAN DOS VECES ═══════════
 *
 * registrar_fp cuenta si la actividad ya se hizo y después inserta. Dos
 * envíos simultáneos de la misma actividad veían los dos «cero previas» y
 * cobraban los dos. Ahora, antes de contar, la función toma un cerrojo por
 * (estudiante, actividad) que dura lo que su transacción: el segundo envío
 * espera al primero, ve su fila y paga cero, como cualquier repetición.
 *
 * Se eligió el cerrojo y no una restricción única en fp_history porque esa
 * restricción fallaría al crearse si producción ya tiene algún duplicado, y
 * porque las actividades de renovación diaria sí tienen varias filas.
 */
/*
 * El ancla es de UNA línea y tolera espacios: el primer intento (multilínea)
 * falló en producción el 25-nov —«registrar_fp cambió desde la 0036»— porque
 * la función viva no tiene el mismo texto que el repositorio (hallazgo 5 del
 * informe: producción y repositorio pueden diferir; p. ej. saltos de línea
 * \r\n de cuando las migraciones se pegaban a mano en el editor de Supabase).
 * Si aun así no aparece, el bloque NO se aplica y lo dice en el registro del
 * despliegue, con el trozo de la función que sí encontró, en vez de tumbar
 * el despliegue de todas las células.
 */
DO $migracion$
DECLARE
  v_def   text;
  v_patron text := 'select\s+count\(\*\)\s+into\s+v_previas';
  v_n     integer;
BEGIN
  SELECT pg_get_functiondef('public.registrar_fp(text, integer, numeric, jsonb)'::regprocedure) INTO v_def;
  IF position('pg_advisory_xact_lock' in v_def) > 0 THEN
    RAISE NOTICE '0176 bloque 6: registrar_fp ya tenía el cerrojo; nada que hacer';
    RETURN;
  END IF;
  SELECT count(*) INTO v_n FROM regexp_matches(v_def, v_patron, 'gi');
  IF v_n <> 1 THEN
    RAISE NOTICE '0176 bloque 6: NO aplicado. El ancla aparece % veces. Alrededor de v_previas: %',
      v_n, replace(substr(v_def, greatest(1, position('into v_previas' in v_def) - 120), 400), chr(13), '\r');
    RETURN;
  END IF;
  v_def := regexp_replace(v_def, '(' || v_patron || ')',
    '/* (0176) Un envío a la vez por estudiante y actividad. */
  perform pg_advisory_xact_lock(hashtext(''registrar_fp''), hashtext(v_uid::text || ''|'' || p_activity_id));

  \1', 'i');
  EXECUTE v_def;
  RAISE NOTICE '0176 bloque 6: cerrojo aplicado en registrar_fp';
END
$migracion$;

/*
 * Para deshacer:
 *   1. asistente_consumir: volver a la versión de la 0160 (create or replace).
 *   2 y 3. enviar_opinion: volver a la de la 0156 y reaplicar el bloque 3 de la 0160.
 *      La tabla opiniones_anon_origen y opinion_anon_permitida() se pueden dejar.
 *   4. grant execute on function ... to authenticated (las tres).
 *   5. amigos_buscar: volver a la de la 0167.
 *   6. registrar_fp: volver a la de la 0036.
 */
