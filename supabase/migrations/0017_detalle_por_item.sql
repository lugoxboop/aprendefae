-- ---------------------------------------------------------------------------
-- 0017 — Detalle por ítem: qué pregunta falló cada estudiante.
--
-- ADITIVA. Crea una tabla nueva, reescribe registrar_fp añadiéndole un cuarto
-- parámetro CON DEFAULT, y añade una función de tendencia. No toca fp_history,
-- ni profiles, ni ninguna fila existente. Correrla dos veces deja lo mismo.
--
-- ═══════════ QUÉ PROBLEMA RESUELVE ═══════════
--
-- Hoy fp_history guarda un solo número por actividad: correct_pct. Eso dice
-- CUÁNTO acertó alguien y no dice NADA de qué falló. El panel docente puede
-- avisar de que un estudiante va al 40%, pero no de que confunde Medida con
-- Meta, que es lo único que un profesor puede llevar a clase.
--
-- Y hay dos reglas de alerta ya escritas y desactivadas en src/docente/alertas.js
-- esperando exactamente este dato. Esta migración habilita una de las dos.
--
-- ═══════════ POR QUÉ TABLA Y NO UNA COLUMNA jsonb ═══════════
--
-- La pregunta cara es de cohorte: "de todos los estudiantes, qué ítem falla
-- más". Con una tabla es un group by sobre una columna indexada; con jsonb en
-- fp_history habría que desenrollar el JSON de cada fila en cada consulta.
--
-- Además fp_history es la tabla más caliente del sitio —la leen el ranking, las
-- ligas, las medallas y el resumen— y engordarla con un blob que ninguna de
-- ellas usa penaliza a todas.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. La tabla.
-- ---------------------------------------------------------------------------
create table if not exists public.fp_detalle (
  id             bigint generated always as identity primary key,

  /*
   * Vínculo EXACTO con la fila que lo produjo. No vale el triple
   * actividad/usuario/timestamp: un estudiante puede tener varias filas de
   * fp_history para la misma actividad —cada repetición deja una— y el triple
   * no las distingue sin depender de la precisión del reloj.
   */
  fp_history_id  bigint not null references public.fp_history(id) on delete cascade,

  /*
   * Desnormalizados desde fp_history a propósito: son lo que hace que las dos
   * consultas objetivo sean de UNA SOLA TABLA. Sin ellos, la de cohorte
   * necesitaría un join a fp_history por cada fila. El riesgo de deriva está
   * acotado porque hay un único camino de escritura —registrar_fp— y copia los
   * dos de la fila que acaba de crear.
   */
  user_id        uuid not null references auth.users(id) on delete cascade,
  activity_id    text not null,

  /*
   * Identifica el ítem DENTRO de su actividad. Una sola columna de texto: cada
   * actividad ya tiene ids estables en su archivo de datos.
   *
   * LA UNICIDAD ES RESPONSABILIDAD DEL EMISOR, y hay un caso real que lo
   * exige: en "quien-gana-quien-pierde" el personaje `bonos` existe en la
   * ronda `tasa` Y en la ronda `gasto` —quince ids para dieciséis posiciones—
   * así que ese componente antepone la ronda: `tasa:bonos`. No se añade una
   * columna `contexto` porque solo una de las seis actividades la necesitaría
   * y quedaría nula en las otras cinco.
   */
  item_id        text not null,

  /* Acertó AL PRIMER INTENTO, que es la convención de todo el tema. */
  acerto         boolean not null,

  /*
   * SIN restricción de rango, y es deliberado. Un check aquí sería una trampa:
   * un solo ítem fuera de rango tumbaría el insert entero, el manejador se lo
   * tragaría y se perdería el detalle de TODA la partida. En
   * "corriente-titulares", donde las cartas rebotan a la cinta, veintiún
   * intentos no es descabellado. El valor se sujeta al escribir, no se rechaza.
   */
  intentos       smallint not null default 1,

  /*
   * QUÉ eligió cuando falló. Es la columna que más vale de la tabla: permite
   * responder "confunden Rivalidad con Nuevos entrantes", que es accionable,
   * en vez de "el ítem 3 falla mucho", que no lo es.
   *
   * Guarda el ID de lo elegido, nunca el texto de interfaz: así sobrevive a
   * los cambios de copy, que en este proyecto son frecuentes.
   *
   * Nullable a propósito: cubre "se le fue sin contestar", que es información
   * distinta de haber elegido mal.
   */
  respuesta      text,

  /* Posición dentro de la partida. Deja ver si los fallos se concentran al final. */
  orden          smallint,

  created_at     timestamptz not null default now()
);

/* Cohorte: qué ítem falla más, y contra qué se confunde. */
create index if not exists fp_detalle_cohorte_idx    on public.fp_detalle (activity_id, item_id);
/* Panel: este estudiante en esta actividad. Cuelga de la fila agrupada. */
create index if not exists fp_detalle_estudiante_idx on public.fp_detalle (user_id, activity_id);
/* El detalle de una partida concreta. */
create index if not exists fp_detalle_historia_idx   on public.fp_detalle (fp_history_id);

-- ---------------------------------------------------------------------------
-- 2. RLS. Mismo cierre que la 0012 le hizo a fp_history.
-- ---------------------------------------------------------------------------
alter table public.fp_detalle enable row level security;
alter table public.fp_detalle force row level security;

/*
 * El estudiante ve lo suyo. Hoy ninguna pantalla lo usa, pero es su dato:
 * negárselo sería la excepción y no la norma —profiles y fp_history ya
 * funcionan así— y abrirlo después es más difícil que dejarlo abierto ahora.
 */
drop policy if exists "detalle propio: leer" on public.fp_detalle;
create policy "detalle propio: leer"
  on public.fp_detalle for select
  to authenticated
  using ((select auth.uid()) = user_id);

/*
 * Sin política de escritura: la ÚNICA vía es registrar_fp, que es security
 * definer. Un cliente no puede inventarse su propio diagnóstico.
 */
revoke insert, update, delete on public.fp_detalle from authenticated, anon;

-- ---------------------------------------------------------------------------
-- 3. registrar_fp, con el canal de detalle dentro.
--
-- Derivada de la 0014 con un script, no reescrita a mano: son tres cambios
-- declarados y siete comprobaciones de que nada más se movió.
-- ---------------------------------------------------------------------------
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
        from jsonb_array_elements(p_detalle) with ordinality as t(d, n)
       where jsonb_typeof(d -> 'item') = 'string'
         and nullif(btrim(d ->> 'item'), '') is not null
         and jsonb_typeof(d -> 'ok') = 'boolean'
         and n <= 200;

      get diagnostics v_escritas = row_count;

      /*
       * El recorte y el descarte NO son silenciosos. Si un componente empieza
       * a mandar elementos que no se pueden usar, esto lo dice en el log en
       * vez de dejar que el diagnóstico se vacíe durante semanas sin señal.
       */
      if v_escritas < v_entrada then
        raise warning 'fp_detalle: de % elementos entraron % en % (recorte o elementos inservibles)',
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

-- ---------------------------------------------------------------------------
-- 4. Tendencia semanal, sin tabla de instantáneas.
--
-- El histórico ya está en fp_history.created_at: no hace falta capturar nada
-- nuevo para reconstruir semanas pasadas, así que no se crea una tabla de
-- fotos que habría que mantener y que solo repetiría lo que ya se sabe.
--
-- USA EL MISMO LUNES QUE LAS LIGAS. ciclo_actual() (migración 0006) corta la
-- semana con date_trunc en horario de Bogotá; inventar otro límite aquí daría
-- semanas desalineadas entre el panel y el ranking, y nadie entendería por qué
-- no cuadran.
--
-- Las dos guardas son las de panel_estudiantes, que es el modelo de seguridad
-- que ya está verificado en producción.
-- ---------------------------------------------------------------------------
create or replace function public.panel_tendencia(
  p_subject text,
  p_semanas integer default 8
)
returns table (
  ciclo               date,
  estudiantes_activos bigint,
  actividades         bigint,
  pct_medio           numeric
)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.es_docente() then
    raise exception 'Panel docente: no autorizado' using errcode = '42501';
  end if;
  if not (p_subject = any (public.materias_docente())) then
    raise exception 'Panel docente: materia no autorizada' using errcode = '42501';
  end if;

  return query
  select (date_trunc('week', h.created_at at time zone 'America/Bogota'))::date,
         count(distinct h.user_id),
         count(*),
         round(avg(h.correct_pct) filter (where h.modality = 'evaluativa'), 1)
    from public.fp_history h
   where h.subject_id = p_subject
     /* Los bonos de racha no son actividades: inflarían el conteo. */
     and h.activity_id not like 'racha-%'
     and h.created_at >= now() - (greatest(1, least(52, p_semanas)) || ' weeks')::interval
   group by 1
   order by 1;
end;
$$;

revoke all on function public.panel_tendencia(text, integer) from public, anon;
grant execute on function public.panel_tendencia(text, integer) to authenticated;
