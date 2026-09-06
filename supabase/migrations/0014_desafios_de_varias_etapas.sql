-- ---------------------------------------------------------------------------
-- 0014 — Desafíos de varias etapas: base × etapas, con tope en cuatro.
--
-- ADITIVA Y REPETIBLE. Añade una columna con valor por defecto, reescribe
-- registrar_fp sin cambiar su firma, y mete una fila nueva en el catálogo.
-- Correrla dos veces deja lo mismo que correrla una. Nada de lo que ya existe
-- cambia de comportamiento: con etapas = 1 —el defecto— la cuenta es idéntica
-- a la que hace la 0011 hoy.
--
-- QUÉ REGLA ENTRA, Y POR QUÉ NO ES UN PARCHE PARA UNA ACTIVIDAD. El Kit añadió
-- una regla general: un nodo de desafío compuesto por varias etapas vale sus
-- puntos base multiplicados por el número de etapas, hasta un máximo de cuatro.
-- Se implementa como columna del catálogo, no como un `if activity_id = ...`,
-- para que el próximo desafío sea una fila y no un cambio de código.
--
--   fp efectivo = fp_base × least(etapas, 4) × rendimiento × tiempo × repetición
--
-- EL TOPE. Sin él, la regla sería una forma de inflar puntos partiendo una
-- actividad en ocho pantallas. Cuatro es el máximo que fija el Kit y lo aplica
-- el servidor, no el cliente: aunque una fila declarara 9 etapas, se pagarían 4.
--
-- LO QUE EL SERVIDOR SIGUE SIN SABER: cómo se reparten los puntos entre las
-- etapas. Eso lo pondera la mecánica en el navegador y llega aquí ya combinado
-- en un solo porcentaje de aciertos, igual que en cualquier otra actividad. El
-- servidor solo necesita saber cuántas etapas son para fijar el techo.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. La columna. Por defecto 1, que es lo que son todas las de hoy.
-- ---------------------------------------------------------------------------
alter table public.actividad_catalogo
  add column if not exists etapas integer not null default 1
  check (etapas >= 1);

-- ---------------------------------------------------------------------------
-- 2. El desafío. Experto (base 90) × 4 etapas = 360 puntos.
-- ---------------------------------------------------------------------------
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base, etapas) values
  ('proyecto-arca', 'pensamiento-estrategico', 'modelo-iceberg', 'evaluativa', 'experto', 90, 4)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id,
  topic_id   = excluded.topic_id,
  modalidad  = excluded.modalidad,
  dificultad = excluded.dificultad,
  fp_base    = excluded.fp_base,
  etapas     = excluded.etapas;

-- ---------------------------------------------------------------------------
-- 3. registrar_fp, con la regla dentro.
--
-- Misma firma que la de la 0011: el cliente no cambia. Lo único que cambia es
-- que la base se multiplica por las etapas de la fila del catálogo.
-- ---------------------------------------------------------------------------
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
  v_base      integer;
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

    /*
     * LA REGLA NUEVA, y la única línea de cálculo que cambia respecto a la
     * 0011: la base se multiplica por las etapas del desafío. El tope se
     * aplica aquí y no en la fila, para que una fila mal escrita —o
     * manipulada— no pueda saltárselo.
     */
    v_base := v_cat.fp_base * least(coalesce(v_cat.etapas, 1), 4);

    v_fp := round(v_base * v_rend * v_tiempo);
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

revoke all on function public.registrar_fp(text, integer, numeric) from public, anon;
grant execute on function public.registrar_fp(text, integer, numeric) to authenticated;
