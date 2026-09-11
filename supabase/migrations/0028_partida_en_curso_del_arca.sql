-- 0028 — La partida en curso del Proyecto del Arca.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- QUÉ RESUELVE
--
-- El Arca es la actividad más larga del sitio —cuatro etapas, 360 FP— y la
-- que más jugó el piloto. Recargar a mitad de ella lo perdía todo.
--
-- ═══════════ LA REGLA QUE LA HACE SEGURA: SE GUARDA EL RESULTADO, NO LA POSICIÓN ═══
--
-- Se guarda al TERMINAR cada etapa, con su porcentaje ya sellado y su detalle
-- por ítem. Recargar a mitad de la etapa 3 devuelve al principio de la 3, con
-- la 1 y la 2 selladas. Recargar después de fallar la 2 devuelve con esa falla
-- intacta. Recargar deja de ser una estrategia porque deja de ser una ventaja.
--
-- Perder la etapa a medias es justo; perder la sesión entera no lo era.
--
-- ═══════════ SOLO EL ARCA, Y ES UNA DECISIÓN ═══════════
--
-- `guarda_progreso` en el catálogo, y solo el Arca lo tiene. Las actividades
-- con reloj se quedan fuera A PROPÓSITO: guardarlas le regalaría un reloj
-- nuevo a quien recarga. No es un olvido, y por eso el servidor lo hace
-- cumplir en vez de confiar en que el cliente no lo pida.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- LAS DOS COSAS FRÁGILES, GARANTIZADAS EN EL SERVIDOR Y NO EN EL CLIENTE
--
-- 1. ÍTEMS DUPLICADOS. Un ítem no puede entrar dos veces al diagnóstico en la
--    misma partida. El cliente ya guarda el detalle del Arca por índice de
--    etapa —rehacer la 3 reemplaza sus filas, no las añade—, pero eso es
--    disciplina del cliente. Aquí además:
--      · registrar_fp deja UNA fila por ítem: si el mismo item llega dos veces
--        en la misma partida, gana la PRIMERA aparición;
--      · y un índice único (fp_history_id, item_id) lo hace imposible por
--        esquema, venga de donde venga la escritura.
--    Los prefijos de etapa (et3:par:a-c) son lo que hace exacta la
--    sustitución: sin ellos, dos etapas podrían compartir un item.
--
--    POR QUÉ LA PRIMERA. Esta migración se paró la primera vez en su guarda:
--    había dos pares repetidos en producción, y no venían del Arca sino de
--    diagnostico-en-vivo —un titular ya cerrado aceptaba un toque más y se
--    cerraba OTRA VEZ—. La primera fila era el cierre de verdad (ok:false,
--    intentos:2); la segunda, un toque fantasma (ok:true, intentos:1), con los
--    dos campos falsos. Los duplicados que llegan aquí nacen de fallos así, y
--    en todos los vistos la primera aparición es la que siguió las reglas.
--    Rehacer una etapa del Arca, que es para lo que se pensó la regla contraria,
--    no llega nunca: el cliente reemplaza la etapa entera antes de mandarla.
--
-- 2. LA PARTIDA ZOMBI. El estudiante termina, recarga, retoma lo que quedó
--    guardado, termina otra vez: segunda llamada a registrar_fp. Paga 0 FP
--    —bien—, pero escribe OTRO juego completo de filas en fp_detalle, y ese
--    estudiante entra dos veces en el diagnóstico de la cohorte. Con 13
--    estudiantes, uno contado dos veces es un sesgo visible, no ruido.
--      · registrar_fp BORRA la partida en la MISMA transacción en que paga.
--        No depende de que el cliente llegue a borrarla: si la fila de FP
--        existe, la partida ya no.
--      · y partida_guardar rechaza cualquier guardado que CONTINÚE una
--        partida que ya no existe. El guardado de la etapa 4 que llega tarde
--        —después de que registrar_fp la cerró— no la resucita: la
--        continuación exige que siga viva con la misma `iniciada_en`.
--
-- ═══════════ LO QUE NO GARANTIZA ═══════════
--
-- Dos pestañas jugando la MISMA partida a la vez. La que termina primero
-- registra y cierra; la otra, si termina después, registra una repetición
-- (0 FP) con su propio detalle. Eso ya pasaba sin guardado —cualquiera puede
-- jugar el Arca dos veces en dos pestañas— y el guardado no lo empeora.
--
-- Cerrarlo del todo exigiría que registrar_fp recibiera la identidad de la
-- partida, o sea, cambiarle la firma. Es el camino que dejó dos firmas vivas
-- en la 0017 y seis actividades sin pagar FP. Se puede hacer bien —drop y
-- create en la misma migración, sin ventana con dos firmas—, pero es tocar la
-- función que paga todos los puntos del sitio para un caso que el guardado no
-- crea. No se hace aquí.
--
-- Idempotente.
-- ---------------------------------------------------------------------------

-- ── Qué actividades guardan partida ─────────────────────────────────────────
alter table public.actividad_catalogo
  add column if not exists guarda_progreso boolean not null default false;

comment on column public.actividad_catalogo.guarda_progreso is
'Si la actividad guarda la partida en curso entre recargas (0028). Solo el Proyecto del Arca. Las actividades con reloj no deben tenerlo: guardarlas le daría un reloj nuevo a quien recarga.';

update public.actividad_catalogo set guarda_progreso = true where activity_id = 'proyecto-arca';

-- ── La tabla ────────────────────────────────────────────────────────────────
/*
 * Una fila por estudiante y actividad: una partida a medias, no un historial.
 *
 * `iniciada_en` la pone el SERVIDOR en el primer guardado, y es la identidad
 * de la partida: cada guardado que continúa la partida la trae de vuelta, y
 * si ya no coincide —porque se registró, o porque se empezó de nuevo— se
 * rechaza. `actualizado_en` es lo que el cliente enseña: "guardado hace 12
 * minutos".
 *
 * El estado es del cliente y el servidor no lo interpreta, salvo para dos
 * cosas baratas: que sea un objeto y que no pase de 64 KB. La partida entera
 * del Arca, con su detalle, cabe en unos pocos KB.
 */
create table if not exists public.partida_en_curso (
  user_id        uuid        not null references auth.users (id) on delete cascade,
  activity_id    text        not null references public.actividad_catalogo (activity_id) on delete cascade,
  estado         jsonb       not null check (jsonb_typeof(estado) = 'object'),
  iniciada_en    timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  primary key (user_id, activity_id),
  check (octet_length(estado::text) <= 65536)
);

alter table public.partida_en_curso enable row level security;
alter table public.partida_en_curso force row level security;

/*
 * RLS PROPIA: cada estudiante lee y borra SOLO la suya. Escribir, solo por
 * partida_guardar: el insert y el update se le quitan al cliente, porque la
 * regla de "no resucitar una partida cerrada" vive en esa función y un insert
 * directo se la saltaría.
 */
drop policy if exists "partida propia: leer" on public.partida_en_curso;
create policy "partida propia: leer" on public.partida_en_curso
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "partida propia: borrar" on public.partida_en_curso;
create policy "partida propia: borrar" on public.partida_en_curso
  for delete to authenticated using (user_id = auth.uid());

revoke all on public.partida_en_curso from anon;
revoke insert, update on public.partida_en_curso from authenticated;

-- ── Guardar ─────────────────────────────────────────────────────────────────
/*
 * p_iniciada_en null  → PARTIDA NUEVA. Reemplaza cualquier guardado anterior
 *                       de esta actividad y devuelve su `iniciada_en`.
 * p_iniciada_en dada  → CONTINUACIÓN. Solo si la partida sigue viva y es la
 *                       misma. Si no: 55000, y el cliente deja de guardar.
 */
create or replace function public.partida_guardar(
  p_activity_id text,
  p_estado      jsonb,
  p_iniciada_en timestamptz default null
)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_guarda boolean;
  v_inicio timestamptz;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para guardar la partida' using errcode = '42501';
  end if;

  select c.guarda_progreso into v_guarda
    from public.actividad_catalogo c
   where c.activity_id = p_activity_id;

  if not coalesce(v_guarda, false) then
    raise exception 'La actividad % no guarda partidas', p_activity_id using errcode = '22023';
  end if;

  if p_estado is null or jsonb_typeof(p_estado) <> 'object' then
    raise exception 'El estado de la partida tiene que ser un objeto' using errcode = '22023';
  end if;

  if octet_length(p_estado::text) > 65536 then
    raise exception 'El estado de la partida pasa de 64 KB' using errcode = '22023';
  end if;

  if p_iniciada_en is null then
    insert into public.partida_en_curso as pc (user_id, activity_id, estado, iniciada_en, actualizado_en)
    /*
     * clock_timestamp() y no now(): now() es la hora de INICIO de la
     * transacción, y dos partidas nuevas en la misma transacción compartirían
     * identidad. Con esta, cada partida tiene la suya aunque ocurran juntas.
     */
    values (v_uid, p_activity_id, p_estado, clock_timestamp(), clock_timestamp())
    on conflict (user_id, activity_id) do update
       set estado         = excluded.estado,
           iniciada_en    = excluded.iniciada_en,
           actualizado_en = excluded.actualizado_en
    returning pc.iniciada_en into v_inicio;
    return v_inicio;
  end if;

  update public.partida_en_curso pc
     set estado = p_estado,
         actualizado_en = clock_timestamp()
   where pc.user_id = v_uid
     and pc.activity_id = p_activity_id
     and pc.iniciada_en = p_iniciada_en
  returning pc.iniciada_en into v_inicio;

  if v_inicio is null then
    raise exception 'La partida ya no existe: se registró o se empezó de nuevo'
      using errcode = '55000',
            hint = 'Es lo que impide que un guardado que llega tarde resucite una partida ya pagada.';
  end if;

  return v_inicio;
end;
$$;

-- ── Leer y borrar: con RLS, como el estudiante ──────────────────────────────
/*
 * Invocadoras, no definer: corren con los permisos del estudiante, así que
 * además del `where user_id = auth.uid()` las ampara la RLS propia. Dos
 * barreras para lo mismo, y la segunda no depende de que alguien recuerde
 * escribir la primera.
 */
create or replace function public.partida_leer(p_activity_id text)
returns table (estado jsonb, iniciada_en timestamptz, actualizado_en timestamptz)
language sql
stable
security invoker
set search_path = public
as $$
  select pc.estado, pc.iniciada_en, pc.actualizado_en
    from public.partida_en_curso pc
   where pc.user_id = auth.uid()
     and pc.activity_id = p_activity_id;
$$;

create or replace function public.partida_borrar(p_activity_id text)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.partida_en_curso pc
   where pc.user_id = auth.uid()
     and pc.activity_id = p_activity_id;
$$;

-- ── Un ítem, una fila por partida: la garantía de esquema ───────────────────
/*
 * Si en producción ya hubiera pares repetidos, el índice no se podría crear y
 * el error de Postgres no diría cuáles. Esto lo comprueba antes y lo dice.
 */
do $guardia$
declare v_dup integer;
begin
  select count(*) into v_dup
    from (
      select 1
        from public.fp_detalle d
       group by d.fp_history_id, d.item_id
      having count(*) > 1
    ) x;

  if v_dup > 0 then
    raise exception using
      message = format('La 0028 no se aplica: hay %s pares (partida, ítem) repetidos en fp_detalle.', v_dup),
      hint    = 'Para verlos: select fp_history_id, item_id, count(*) from fp_detalle group by 1, 2 having count(*) > 1. Hay que decidir cuál conservar antes de migrar.';
  end if;
end
$guardia$;

create unique index if not exists fp_detalle_un_item_por_partida
  on public.fp_detalle (fp_history_id, item_id);

-- ── registrar_fp: cierra la partida y deja un ítem por fila ─────────────────
/*
 * Derivada de la 0017 —la última que la define; la 0018 solo retiró la firma
 * de tres—. MISMA FIRMA, así que create or replace no crea otra y no puede
 * repetirse lo de las dos firmas vivas. Tres cambios, contados por el script:
 *   · borra la partida en curso en la misma transacción en que paga
 *   · deduplica el detalle por ítem, gana la primera aparición
 *   · el aviso de recorte nombra también los repetidos
 * El cálculo de FP queda byte a byte igual.
 */
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

-- ── Permisos ────────────────────────────────────────────────────────────────
/*
 * Las tres de la partida, nuevas: nacen ejecutables por anon en Supabase y se
 * cierran aquí. registrar_fp conserva los suyos con create or replace; se
 * reemiten por costumbre.
 */
revoke all on function public.partida_guardar(text, jsonb, timestamptz) from public, anon;
revoke all on function public.partida_leer(text) from public, anon;
revoke all on function public.partida_borrar(text) from public, anon;
grant execute on function public.partida_guardar(text, jsonb, timestamptz) to authenticated;
grant execute on function public.partida_leer(text) to authenticated;
grant execute on function public.partida_borrar(text) to authenticated;

revoke all on function public.registrar_fp(text, integer, numeric, jsonb) from public, anon;
grant execute on function public.registrar_fp(text, integer, numeric, jsonb) to authenticated;
