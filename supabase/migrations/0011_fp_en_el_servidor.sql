-- ---------------------------------------------------------------------------
-- 0011 — El FP se calcula en el servidor, y repetir ya no paga.
--
-- QUÉ ESTABA MAL. registrar_fp recibía el número de puntos ya hecho, en
-- `p_fp`, y lo guardaba con un `greatest(p_fp, 0)` como todo control. El
-- cálculo vivía en el navegador (src/fp/motor.js), igual que el tope
-- antirrepetición, y `p_repeat_index` también lo mandaba el cliente. Encima,
-- una política de RLS permitía insertar filas en fp_history directamente, sin
-- pasar siquiera por la función.
--
-- Con el ranking dando puntos de parcial, eso era una puerta abierta: desde la
-- consola del navegador, cualquier estudiante con sesión podía ponerse primero.
--
-- QUÉ CAMBIA, EN TRES PIEZAS QUE SOLO SIRVEN JUNTAS:
--
--   1. El catálogo de actividades vive aquí. Dificultad y puntos base dejan de
--      ser algo que el cliente afirma y pasan a ser algo que el servidor sabe.
--   2. registrar_fp calcula. Ya no recibe puntos, ni dificultad, ni modalidad,
--      ni número de repeticiones: los deduce.
--   3. Se cierra la escritura directa. La función queda como única vía.
--
-- Y de paso, la regla nueva de repetición: la primera vez paga completo, de la
-- segunda en adelante cero. Sin escalón intermedio. Nace ya obligatoria, no
-- como una sugerencia que el cliente puede ignorar.
--
-- LO QUE ESTO NO ARREGLA, Y HAY QUE SABERLO. El porcentaje de aciertos sigue
-- llegando del cliente, porque solo el navegador sabe cómo le fue al
-- estudiante. Lo que cambia es el tamaño del agujero: antes se podía pedir
-- cualquier número de puntos, tantas veces como se quisiera; ahora, como mucho,
-- el máximo honesto de esa actividad, UNA vez. El techo de un estudiante pasa a
-- ser la suma de los fp_base del catálogo, y eso es acotado y auditable.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. El catálogo, que es ahora la fuente de verdad del servidor.
--
-- Es una copia de lo que declara src/data/subjects.js. Sí, son dos sitios, y no
-- hay forma de evitarlo: el cliente necesita el catálogo para dibujar la
-- interfaz y el servidor para no creerse lo que le digan. Lo que sí se puede es
-- que no se separen en silencio, y de eso se encarga la prueba que acompaña a
-- esta migración.
-- ---------------------------------------------------------------------------
create table if not exists public.actividad_catalogo (
  activity_id text primary key,
  subject_id  text not null,
  topic_id    text not null,
  modalidad   text not null check (modalidad in ('exploratoria', 'evaluativa')),
  dificultad  text not null check (dificultad in ('facil', 'medio', 'dificil', 'experto')),
  fp_base     integer not null check (fp_base >= 0)
);

alter table public.actividad_catalogo enable row level security;
alter table public.actividad_catalogo force row level security;
-- Sin políticas: solo lo leen las funciones security definer.

insert into public.actividad_catalogo (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('simulador-da', 'macroeconomia', 'demanda-agregada', 'exploratoria', 'dificil', 50),
  ('dashboard-economico', 'macroeconomia', 'politica-economica', 'evaluativa', 'experto', 90),
  ('constructor-mapa-causal', 'pensamiento-estrategico', 'pensamiento-sistemico', 'evaluativa', 'dificil', 50),
  ('camara-presion', 'pensamiento-estrategico', 'modelo-iceberg', 'evaluativa', 'medio', 25),
  -- El modo experto de la cámara es otra entrada, no una dificultad que el
  -- cliente declare: pedir memoria en vez de reconocimiento es otra actividad.
  ('camara-presion-experto', 'pensamiento-estrategico', 'modelo-iceberg', 'evaluativa', 'dificil', 50),
  ('radar-profundidad', 'pensamiento-estrategico', 'modelo-iceberg', 'evaluativa', 'medio', 25),
  ('expediente-rescate', 'pensamiento-estrategico', 'modelo-iceberg', 'evaluativa', 'dificil', 50),
  ('arquitecto-profundidades', 'pensamiento-estrategico', 'modelo-iceberg', 'evaluativa', 'experto', 90),
  ('asedio-estrategico', 'pensamiento-estrategico', 'fuerzas-porter', 'evaluativa', 'dificil', 50)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base;

-- ---------------------------------------------------------------------------
-- 2. Los umbrales de tiempo, también del servidor.
--
-- Terminar por debajo del mínimo esperado recorta al 60%. Los valores son los
-- mismos que tenía el motor del cliente, y siguen siendo provisionales: las
-- reglas de FP fijan los puntos base pero no estos umbrales.
-- ---------------------------------------------------------------------------
create or replace function public.fp_tiempo_minimo_ms(p_dificultad text)
returns integer
language sql
immutable
as $$
  select case p_dificultad
    when 'facil'   then 20000
    when 'medio'   then 45000
    when 'dificil' then 90000
    when 'experto' then 150000
    else 0
  end;
$$;

-- ---------------------------------------------------------------------------
-- 3. registrar_fp, ahora calculando.
--
-- La firma vieja se elimina, no se deja al lado: si siguiera existiendo, el
-- cliente podría seguir llamándola con su propio p_fp y todo esto no serviría
-- de nada.
--
-- Pasa a ser security definer porque ahora es la ÚNICA vía de escritura: la
-- política que permitía insertar a mano se retira más abajo, así que la función
-- necesita permisos propios. El user_id sigue saliendo de auth.uid(), nunca de
-- un parámetro, así que nadie puede escribir en nombre de otro.
-- ---------------------------------------------------------------------------
drop function if exists public.registrar_fp(text, text, integer, text, text, integer, numeric, integer);

create or replace function public.registrar_fp(
  p_activity_id text,
  p_duration_ms integer default null,
  p_correct_pct numeric default null
)
returns public.fp_history
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_cat       public.actividad_catalogo;
  v_previas   integer;
  v_rend      numeric;
  v_tiempo    numeric;
  v_fp        integer;
  v_fila      public.fp_history;
  v_hoy       date;
  v_ultimo    date;
  v_racha     integer;
  v_bono      integer;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para registrar FP' using errcode = '42501';
  end if;

  select * into v_cat from public.actividad_catalogo where activity_id = p_activity_id;
  if v_cat.activity_id is null then
    /* Una actividad que no está en el catálogo no puede pagar nada. */
    raise exception 'Actividad desconocida: %', p_activity_id using errcode = '22023';
  end if;

  /* Cuántas veces la completó ya. Lo cuenta el servidor, no se pregunta. */
  select count(*) into v_previas
    from public.fp_history
   where user_id = v_uid and activity_id = p_activity_id;

  if v_previas > 0 then
    /*
     * REGLA NUEVA: repetir no paga. Ni un escalón intermedio ni un 20%.
     * Se puede repetir cuanto se quiera para repasar —eso no se toca— pero
     * los puntos se dan una sola vez.
     */
    v_fp := 0;
  else
    /* Rendimiento: la exploratoria paga por terminar; la evaluativa escala
       con los aciertos, con piso del 50%. */
    if v_cat.modalidad = 'evaluativa' then
      v_rend := greatest(0.5, least(1, coalesce(p_correct_pct, 0) / 100.0));
    else
      v_rend := 1;
    end if;

    /* Defensa de tiempo: por debajo del mínimo esperado, al 60%. */
    if p_duration_ms is not null
       and p_duration_ms < public.fp_tiempo_minimo_ms(v_cat.dificultad) then
      v_tiempo := 0.6;
    else
      v_tiempo := 1;
    end if;

    v_fp := round(v_cat.fp_base * v_rend * v_tiempo);
  end if;

  insert into public.fp_history (
    user_id, activity_id, subject_id, fp_awarded,
    difficulty, modality, duration_ms, correct_pct, repeat_index
  )
  values (
    v_uid, p_activity_id, v_cat.subject_id, v_fp,
    v_cat.dificultad, v_cat.modalidad, p_duration_ms,
    least(100, greatest(0, coalesce(p_correct_pct, 0))), v_previas
  )
  returning * into v_fila;

  /* --------------------------- la racha, igual que antes --------------------------- */
  v_hoy := (now() at time zone 'America/Bogota')::date;

  select last_activity_day, streak into v_ultimo, v_racha
    from public.profiles where user_id = v_uid;

  if v_ultimo = v_hoy then
    v_racha := coalesce(v_racha, 0);
    v_bono  := 0;
  elsif v_ultimo = v_hoy - 1 then
    v_racha := coalesce(v_racha, 0) + 1;
    v_bono  := public.bono_racha(v_racha);
  else
    v_racha := 1;
    v_bono  := public.bono_racha(1);
  end if;

  update public.profiles
     set points            = points + v_fp + coalesce(v_bono, 0),
         streak            = v_racha,
         best_streak       = greatest(best_streak, v_racha),
         last_activity_day = v_hoy
   where user_id = v_uid;

  if coalesce(v_bono, 0) > 0 then
    insert into public.fp_history (
      user_id, activity_id, subject_id, fp_awarded, difficulty, modality, repeat_index
    )
    values (
      v_uid, 'racha-' || v_racha, v_cat.subject_id, v_bono, 'bono', 'racha', 0
    );
  end if;

  return v_fila;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Se cierra la puerta de atrás.
--
-- Esta política dejaba a cualquier estudiante autenticado insertar filas de
-- historial a mano, con el FP que quisiera, sin pasar por la función. Cerrar
-- solo el cálculo y dejarla abierta no habría servido de nada.
--
-- La lectura del historial propio se mantiene: el perfil y las medallas la
-- necesitan, y leer lo suyo no permite falsear nada.
-- ---------------------------------------------------------------------------
drop policy if exists "historial propio: registrar" on public.fp_history;
revoke insert, update, delete on public.fp_history from authenticated;

revoke all on function public.registrar_fp(text, integer, numeric) from public, anon;
grant execute on function public.registrar_fp(text, integer, numeric) to authenticated;
revoke all on function public.fp_tiempo_minimo_ms(text) from public, anon;
grant execute on function public.fp_tiempo_minimo_ms(text) to authenticated;
