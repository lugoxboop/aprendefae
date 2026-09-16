-- ═══════════════════════════════════════════════════════════════════════════
-- 0033 — EL REPASO DIARIO
--
-- Cuatro cosas, y ninguna toca una fila existente de fp_history ni de fp_detalle:
--
--   1. La marca «renovable a diario» en el catálogo (B2d), apagada para todas.
--   2. La fila del Repaso Diario: evaluativa, medio, base 60, y la marca puesta.
--      Medio fija solo el tiempo mínimo (45 s); la base de 60 es la del Repaso,
--      no la de Medio. No pertenece a ningún tema del camino: su topic_id es
--      el suyo propio.
--   3. registrar_fp, derivada de la 0028 —la última que la define— con UN
--      cambio: el conteo de veces previas. Para una actividad renovable a
--      diario cuenta solo las de HOY en Bogotá; para las demás, igual que
--      siempre. Misma firma: create or replace no crea otra. La racha, el
--      detalle y el cálculo de FP quedan byte a byte iguales, así que el Repaso
--      alimenta la racha sin código propio.
--   4. Dos lecturas para el cliente del Repaso: el historial por ítem y si ya
--      se hizo hoy. Invocadoras, no definer: corren como el estudiante, con la
--      RLS de fp_detalle y fp_history detrás del where user_id = auth.uid().
--
-- ═══════════ LA CLAVE DEL HISTORIAL ═══════════
--
-- Un ítem se identifica igual se haya visto donde se haya visto:
--
--     en su actividad    activity_id || ':' || item_id   ('sala-monitores:hospital')
--     en el Repaso       item_id, que ya ES esa clave        (activity_id = 'repaso-diario')
--
-- El Repaso guarda su detalle con la clave entera como item_id justamente para
-- que las dos filas caigan en el mismo historial sin tabla nueva.
--
-- Va DESPUÉS de la 0032. Idempotente: se puede correr dos veces.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. La marca ─────────────────────────────────────────────────────────────
alter table public.actividad_catalogo
  add column if not exists renovable_diario boolean not null default false;

comment on column public.actividad_catalogo.renovable_diario is
'Si la actividad se renueva cada día en Bogotá (0033): la primera vez de cada día paga y las siguientes del mismo día no. Solo el Repaso Diario. registrar_fp no cambia nada más por ella.';

-- ── 2. El Repaso Diario en el catálogo ─────────────────────────────────────
insert into public.actividad_catalogo
  (activity_id, subject_id, topic_id, modalidad, dificultad, fp_base) values
  ('repaso-diario', 'macroeconomia', 'repaso-diario', 'evaluativa', 'medio', 60)
on conflict (activity_id) do update set
  subject_id = excluded.subject_id, topic_id = excluded.topic_id, modalidad = excluded.modalidad,
  dificultad = excluded.dificultad, fp_base = excluded.fp_base;

update public.actividad_catalogo set renovable_diario = true where activity_id in ('repaso-diario');

-- ── 3. registrar_fp: previas del día para lo renovable ─────────────────────
create or replace function public.registrar_fp(
  p_activity_id text,
  p_duration_ms integer default null,
  p_correct_pct numeric default null,
  /*
   * NUEVO Y OPCIONAL. Con default null, la llamada de tres argumentos que
   * hay hoy en producción sigue funcionando sin tocar el cliente: no hay
   * ventana de despliegue, que es el problema que obligó a partir la 0011.
   */
  p_detalle     jsonb   default null
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
  v_entrada   integer;   -- elementos que mandó el cliente
  v_escritas  integer;   -- filas de detalle que entraron de verdad
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
  /*
   * (0033) RENOVABLE A DIARIO. Para una actividad con renovable_diario, «ya
   * la completó» significa «ya la completó HOY», en el día de Bogotá: la
   * primera de cada día paga, la segunda del mismo día no. Para todas las
   * demás la condición es la de siempre, sin ningún cambio: el coalesce deja
   * el «not renovable» en verdadero y el filtro de fecha no se mira.
   */
  select count(*) into v_previas
    from public.fp_history
   where user_id = v_uid and activity_id = p_activity_id
     and (not coalesce(v_cat.renovable_diario, false)
          or (created_at at time zone 'America/Bogota')::date = (now() at time zone 'America/Bogota')::date);

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

  /*
   * ═══════════ (0028) LA PARTIDA EN CURSO SE CIERRA AQUÍ ═══════════
   *
   * En la misma transacción que acaba de escribir la fila de FP. Si esta
   * función devuelve bien, la partida guardada ya no existe, llegue o no el
   * cliente a borrarla. Es lo que impide la partida zombi: terminar, recargar,
   * retomar lo guardado y registrar otra vez, con un segundo juego de filas
   * en fp_detalle y el mismo estudiante contado dos veces en la cohorte.
   *
   * Para cualquier actividad sin partida guardada no borra nada.
   */
  delete from public.partida_en_curso pc
   where pc.user_id = v_uid and pc.activity_id = p_activity_id;

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

  /*
   * ═══════════ EL DETALLE NUNCA PUEDE COSTARLE LOS PUNTOS A NADIE ═══════════
   *
   * Va en su propio bloque con manejador. Si el jsonb viene mal formado, si un
   * componente manda basura o si algún día alguien añade una restricción que
   * este cliente no conoce, se pierde el DIAGNÓSTICO y nada más: la fila de
   * fp_history ya está escrita, y un bloque begin/exception solo revierte su
   * propia subtransacción.
   *
   * Los puntos son el producto; el detalle es instrumentación.
   *
   * NADA SE RECHAZA POR ESTAR FUERA DE RANGO. Los valores del cliente se
   * SUJETAN, no se validan: una restricción que falla aquí no protegería nada,
   * tumbaría el lote entero y el manejador se lo tragaría. La protección se
   * convertiría en el fallo.
   *
   * SE FILTRA LO ESTRUCTURALMENTE INSERVIBLE —sin item, sin ok booleano— en
   * vez de dejar que reviente el insert completo: item_id y acerto son not
   * null, así que un solo elemento incompleto se llevaría por delante los
   * sesenta y uno buenos.
   */
  if p_detalle is not null and jsonb_typeof(p_detalle) = 'array' then
    begin
      v_entrada := jsonb_array_length(p_detalle);

      insert into public.fp_detalle
        (fp_history_id, user_id, activity_id, item_id, acerto, intentos, respuesta, orden)
      select v_fila.id,
             v_uid,
             p_activity_id,
             left(btrim(d ->> 'item'), 120),
             (d ->> 'ok')::boolean,
             least(greatest(
               case when jsonb_typeof(d -> 'intentos') = 'number'
                    then (d ->> 'intentos')::int else 1 end, 1), 99)::smallint,
             left(d ->> 'respuesta', 120),
             case when jsonb_typeof(d -> 'orden') = 'number'
                  then least(greatest((d ->> 'orden')::int, 0), 999)::smallint end
        from (
          /*
           * (0028) UN ÍTEM, UNA FILA. Si el mismo item llega dos veces en la
           * misma partida, gana la PRIMERA aparición: los duplicados vistos
           * nacen de fallos de la actividad —un titular que se cerraba dos
           * veces— y la primera es la que siguió las reglas. Ver la cabecera.
           * El índice único (fp_history_id, item_id) lo exige por esquema;
           * esto hace que el insert no choque contra él, así que un duplicado
           * nunca le cuesta los puntos a nadie.
           */
          select e.d, e.n,
                 row_number() over (
                   partition by left(btrim(e.d ->> 'item'), 120)
                   order by e.n asc
                 ) as vez
            from jsonb_array_elements(p_detalle) with ordinality as e(d, n)
           where jsonb_typeof(e.d -> 'item') = 'string'
             and nullif(btrim(e.d ->> 'item'), '') is not null
             and jsonb_typeof(e.d -> 'ok') = 'boolean'
             and e.n <= 200
        ) t
       where t.vez = 1;

      get diagnostics v_escritas = row_count;

      /*
       * El recorte y el descarte NO son silenciosos. Si un componente empieza
       * a mandar elementos que no se pueden usar, esto lo dice en el log en
       * vez de dejar que el diagnóstico se vacíe durante semanas sin señal.
       */
      if v_escritas < v_entrada then
        raise warning 'fp_detalle: de % elementos entraron % en % (recorte, elementos inservibles o ítems repetidos)',
          v_entrada, v_escritas, p_activity_id;
      end if;

    exception when others then
      /*
       * raise warning NO aborta: solo RAISE EXCEPTION lo hace. La
       * subtransacción de este bloque ya se revirtió sola al entrar aquí, y la
       * transacción exterior —con la fila de fp_history dentro— sigue viva.
       * El paso 4 de detalle_test.sql lo comprueba mandando basura a propósito.
       */
      raise warning 'fp_detalle: la escritura falló en % (%): %',
        p_activity_id, sqlstate, sqlerrm;
    end;
  end if;

  return v_fila;
end;
$$;

revoke all on function public.registrar_fp(text, integer, numeric, jsonb) from public, anon;
grant execute on function public.registrar_fp(text, integer, numeric, jsonb) to authenticated;

-- ── 4. Las lecturas del Repaso ─────────────────────────────────────────────
/*
 * Una fila por clave: cuándo fue el último encuentro, cómo salió y cuántas
 * veces se ha visto, sumando la actividad de origen y el Repaso (B3).
 *
 * El desempate por id va porque todas las filas de una misma partida comparten
 * created_at —now() es la hora de la transacción—; entre ellas, gana la última
 * escrita.
 */
create or replace function public.repaso_historial()
returns table (clave text, ultimo_en timestamptz, ultimo_ok boolean, veces integer)
language sql
stable
security invoker
set search_path = public
as $$
  with encuentros as (
    select case when d.activity_id = 'repaso-diario' then d.item_id
                else d.activity_id || ':' || d.item_id end as clave,
           d.created_at, d.acerto, d.id
      from public.fp_detalle d
     where d.user_id = auth.uid()
  )
  select distinct on (e.clave)
         e.clave, e.created_at, e.acerto,
         (count(*) over (partition by e.clave))::integer
    from encuentros e
   order by e.clave, e.created_at desc, e.id desc;
$$;

/* Si el estudiante ya hizo el Repaso hoy, en el día de Bogotá. La misma cuenta que usa registrar_fp. */
create or replace function public.repaso_hecho_hoy()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.fp_history h
     where h.user_id = auth.uid()
       and h.activity_id = 'repaso-diario'
       and (h.created_at at time zone 'America/Bogota')::date = (now() at time zone 'America/Bogota')::date
  );
$$;

revoke all on function public.repaso_historial() from public, anon;
revoke all on function public.repaso_hecho_hoy() from public, anon;
grant execute on function public.repaso_historial() to authenticated;
grant execute on function public.repaso_hecho_hoy() to authenticated;
