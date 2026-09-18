-- ═══════════════════════════════════════════════════════════════════════════
-- 0036 — EL CIERRE SEMANAL DE LIGAS, CON RESULTADOS REGISTRADOS Y PODIO PAGADO
--
-- Lo que ya había (0006, 0026): cada lunes, la primera siembra del ciclo nuevo
-- calcula de paso quién sube y quién baja de la semana que acabó. Funciona, pero
-- NO DEJA RASTRO: la posición final de cada quien se recalcula al vuelo cada vez
-- que alguien la pide, y por eso no se podía pagar nada contra ella —un pago
-- contra un estado que se recalcula se paga dos veces el día que el cálculo
-- cambie, o cuando dos estudiantes lo disparen a la vez—.
--
-- Esta migración añade cuatro cosas:
--
--   1. liga_cierre       un cierre por liga y por ciclo, con la llave primaria
--                        como GUARDA: dos estudiantes que disparen el cierre en
--                        el mismo minuto no pueden pagar el mismo podio dos
--                        veces, y no porque el código lo mire antes, sino
--                        porque la base no deja entrar la segunda fila.
--   2. liga_resultado    la posición final de cada estudiante en el ciclo que
--                        se cerró, con si quedó en podio y cuántos Cristales le
--                        tocaron. Es CONTRA ESTA FILA que se paga, nunca contra
--                        un recálculo en caliente.
--   3. ligas_cerrar_semana  cierra los ciclos pendientes EN SECUENCIA —uno por
--                        uno, sin saltar al actual— para que el ascenso y el
--                        descenso de cada semana intermedia ocurran de verdad.
--   4. registrar_fp      derivada de la 0033 con TRES líneas más: el cierre
--                        antes de escribir la fila, los Cristales del hito de
--                        racha y el contador de actividades distintas.
--
-- ═══════════ SIN TAREA PROGRAMADA: DISPARO PEREZOSO ═══════════
--
-- No hay pg_cron ni nada con horario. El cierre lo dispara el primer evento de
-- FP que ocurra después del corte, en cualquier liga — el mismo patrón que la
-- siembra perezosa que el sitio ya usaba desde la 0006. El primero que llega en
-- la semana paga el cierre de la anterior, que cuesta una consulta sobre un
-- puñado de filas.
--
-- Y EL QUE DISPARA NO SE PERJUDICA: el cierre corre ANTES de escribir su fila de
-- FP, así que su actividad cuenta para el ciclo que empieza y no para el que se
-- acaba de cerrar. (La ventana del ciclo cerrado tampoco la incluiría; se hace
-- igual en ese orden para que siga siendo cierto si un día la ventana cambia.)
--
-- ═══════════ EL CORTE ES EL LUNES A LAS 00:00 DE BOGOTÁ ═══════════
--
-- No se reinventa aquí: es `ciclo_actual()` de la 0006 —date_trunc('week') sobre
-- la hora de Bogotá—, el mismo límite del ranking semanal y la misma zona del
-- corte diario del Repaso. Una sola regla de zona horaria para todo el sitio.
--
-- ═══════════ «PODIO» SIGNIFICA DOS COSAS, Y HAY QUE SABERLO ═══════════
--
-- En el tablero y en las medallas, desde la 0026, `en_podio` es la ZONA DE
-- ASCENSO: el 15% de los activos del nivel, mínimo 1 —quien subiría si la semana
-- terminara ahora—. Eso NO SE TOCA aquí.
--
-- El podio que paga Cristales es otro, y lo fija el diseño de esta tanda:
-- round(n × 0,28) del TAMAÑO DEL NIVEL, mínimo 2. Son dos cortes distintos a
-- propósito —subir de nivel y cobrar no tienen por qué ser lo mismo— y por eso
-- viven en funciones con nombres distintos: ligas_zona() el ascenso,
-- liga_podio_tamano() el pago. Quien cambie uno tiene que decidir a mano si
-- toca el otro.
--
-- Va DESPUÉS de la 0035, que crea los Cristales. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. liga_cierre: un cierre por liga y por ciclo ──────────────────────────
/*
 * LA LLAVE PRIMARIA ES LA GUARDA. No un `if not exists` antes de pagar: entre
 * ese `if` y el pago hay una ventana, y dos transacciones que la crucen a la vez
 * pagan las dos. Con la llave, la segunda transacción se queda esperando a que
 * la primera confirme y después su `on conflict do nothing` no inserta nada —y
 * la función se va sin pagar—. La garantía la da la base, no el orden en que
 * dos sesiones se entrelacen.
 *
 * `con_actividad` distingue el ciclo cerrado en que alguien jugó del ciclo nulo,
 * que cierra sin ascenso, sin descenso y sin un solo Cristal de podio.
 */
create table if not exists public.liga_cierre (
  subject_id        text        not null,
  ciclo             date        not null,
  cerrado_en        timestamptz not null default now(),
  con_actividad     boolean     not null default false,
  cristales_pagados integer     not null default 0,
  primary key (subject_id, ciclo)
);

alter table public.liga_cierre enable row level security;
alter table public.liga_cierre force row level security;
/* Sin políticas: como liga_membresia, solo la tocan las funciones de abajo. */

-- ── 2. liga_resultado: la posición final, guardada ──────────────────────────
/*
 * Una fila por estudiante y ciclo cerrado. Existe para dos cosas:
 *
 *   · pagar el podio UNA VEZ, contra un número que ya no se mueve
 *   · poder responder «¿cómo quedé la semana del 14?» sin recalcular una semana
 *     con los FP de hoy, que ya no son los de entonces
 *
 * Solo se escriben filas de ciclos CON actividad: registrar las posiciones de
 * una semana en que nadie jugó sería guardar un empate a cero de todo el grupo.
 */
create table if not exists public.liga_resultado (
  subject_id text    not null,
  ciclo      date    not null,
  user_id    uuid    not null references auth.users (id) on delete cascade,
  liga       integer not null,
  posicion   integer not null,
  fp         bigint  not null,
  tam_liga   integer not null,
  en_podio   boolean not null,
  cristales  integer not null default 0,
  primary key (subject_id, ciclo, user_id)
);

create index if not exists liga_resultado_ciclo_idx
  on public.liga_resultado (subject_id, ciclo, liga, posicion);

alter table public.liga_resultado enable row level security;
alter table public.liga_resultado force row level security;

-- ── 3. El tamaño del podio y lo que paga cada puesto ────────────────────────
/*
 * EL PODIO ES PROPORCIONAL, NO FIJO EN 5.
 *
 *   tamaño = round(n × 0,28), con mínimo 2
 *
 * Con un podio fijo de cinco, un grupo de siete tendría a casi todos en el
 * podio y el premio no diría nada; uno de veinticinco dejaría fuera a gente que
 * tuvo una semana excelente. El mínimo de 2 es el suelo de abajo: en un grupo
 * de tres, un podio de uno convierte el premio en lotería.
 *
 *   liga de  7 → 2        liga de 17 → 5        liga de 25 → 7
 *
 * Los mismos números que tamanoPodio() de src/cristales/cristales.js.
 */
create or replace function public.liga_podio_tamano(p_tam bigint)
returns integer
language sql
immutable
as $$
  select case
    when p_tam is null or p_tam < 1 then 0
    else greatest(2, round(p_tam * 0.28))::integer
  end;
$$;

/*
 * Lo que paga cada puesto del podio: 15, 10, 7 y 5 del cuarto en adelante,
 * tenga el podio cuatro puestos o siete.
 *
 * LOS MONTOS SON IGUALES EN TODOS LOS NIVELES. Un primero en Emergente cobra lo
 * mismo que un primero en Élite, y no es un olvido: escalar el premio por nivel
 * reintroduciría la jerarquía de estatus que las ligas existen justamente para
 * evitar —competir entre pares cercanos, no por un puesto en una tabla global—.
 *
 * Los mismos números que CRISTALES_PODIO de src/cristales/cristales.js.
 */
create or replace function public.liga_cristales_puesto(p_posicion bigint)
returns integer
language sql
immutable
as $$
  select case
    when p_posicion is null or p_posicion < 1 then 0
    when p_posicion = 1 then 15
    when p_posicion = 2 then 10
    when p_posicion = 3 then 7
    else 5
  end;
$$;

-- ── 4. Cerrar un ciclo: registrar y pagar ───────────────────────────────────
/*
 * Cierra UN ciclo de UNA materia: guarda las posiciones finales de cada nivel y
 * paga el podio en Cristales. Idempotente por la llave de liga_cierre y, una
 * segunda vez, por la clave del libro de movimientos.
 *
 * CADA NIVEL TIENE SU PROPIO PODIO, EN PARALELO. No solo el más alto: partition
 * by liga en el rank y en el recuento. Si hay un solo nivel activo, funciona
 * igual —es el caso de hoy— y si mañana hay cuatro, son cuatro podios.
 *
 * EL CICLO NULO NO PAGA. Si nadie de la materia registró FP en ese ciclo, queda
 * el marcador con con_actividad = false y no se escribe ni una fila de
 * resultado: no se paga el podio de una semana en la que nadie jugó. Que nadie
 * suba ni baje ya lo garantizaba la siembra, que solo mueve a los activos.
 */
create or replace function public.ligas_cerrar_resultados(p_subject text, p_ciclo date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_filas   integer;
  v_activos integer;
  v_pagado  integer := 0;
  r         record;
begin
  /* LA GUARDA. Ver la nota de liga_cierre: la primera fila gana, la segunda no entra. */
  insert into public.liga_cierre (subject_id, ciclo, con_actividad, cristales_pagados)
  values (p_subject, p_ciclo, false, 0)
  on conflict (subject_id, ciclo) do nothing;

  get diagnostics v_filas = row_count;
  if v_filas = 0 then
    /* Ya lo cerró otro. No es un error: es la garantía de un solo cierre. */
    return 0;
  end if;

  select count(*) into v_activos
    from (
      select m.user_id
        from public.liga_membresia m
        join public.fp_history h
          on h.user_id = m.user_id
         and h.subject_id = p_subject
         and h.created_at >= p_ciclo::timestamp at time zone 'America/Bogota'
         and h.created_at <  (p_ciclo + 7)::timestamp at time zone 'America/Bogota'
       where m.subject_id = p_subject and m.ciclo = p_ciclo
       group by m.user_id
      having sum(h.fp_awarded) > 0
    ) x;

  if v_activos = 0 then
    /* Ciclo nulo: cerrado, sin resultados y sin Cristales. */
    return 0;
  end if;

  insert into public.liga_resultado (subject_id, ciclo, user_id, liga, posicion, fp, tam_liga, en_podio, cristales)
  with fp_ciclo as (
    select
      m.user_id,
      m.liga,
      coalesce((
        select sum(h.fp_awarded)
          from public.fp_history h
         where h.user_id = m.user_id
           and h.subject_id = p_subject
           and h.created_at >= p_ciclo::timestamp at time zone 'America/Bogota'
           and h.created_at <  (p_ciclo + 7)::timestamp at time zone 'America/Bogota'
      ), 0)::bigint as fp
    from public.liga_membresia m
    where m.subject_id = p_subject and m.ciclo = p_ciclo
  ),
  clasificada as (
    select
      f.user_id,
      f.liga,
      f.fp,
      /* rank(): dos empatados comparten puesto y cobran los dos lo mismo. */
      rank() over (partition by f.liga order by f.fp desc) as posicion,
      count(*) over (partition by f.liga)                  as tam_liga
    from fp_ciclo f
  ),
  con_podio as (
    select
      c.*,
      /*
       * El puesto entra en el podio por posición Y por haber jugado. Un grupo
       * de tres donde solo uno sumó FP tiene un podio de 2 por la fórmula, y el
       * segundo puesto sería alguien con cero: cobrar por una semana en la que
       * no se hizo nada es la misma cosa que el ciclo nulo, en pequeño.
       */
      (c.posicion <= public.liga_podio_tamano(c.tam_liga) and c.fp > 0) as en_podio
    from clasificada c
  )
  select
    p_subject, p_ciclo, c.user_id, c.liga, c.posicion::integer, c.fp, c.tam_liga::integer,
    c.en_podio,
    case when c.en_podio then public.liga_cristales_puesto(c.posicion) else 0 end
  from con_podio c
  on conflict (subject_id, ciclo, user_id) do nothing;

  /*
   * EL PAGO SE HACE CONTRA LA FILA GUARDADA, no contra el cálculo de arriba.
   * Es la diferencia entre «te pago lo que dice el resultado cerrado» y «te pago
   * lo que me da la cuenta ahora»: lo segundo cambia de respuesta si alguien
   * registra FP con fecha vieja, si la fórmula del podio se ajusta o si esta
   * función se ejecuta dos veces.
   */
  for r in
    select lr.user_id, lr.posicion, lr.cristales
      from public.liga_resultado lr
     where lr.subject_id = p_subject and lr.ciclo = p_ciclo and lr.cristales > 0
  loop
    v_pagado := v_pagado + public.cristales_dar(
      r.user_id,
      'podio-' || p_subject || '-' || p_ciclo,
      r.cristales,
      'Puesto ' || r.posicion || ' del podio semanal'
    );
  end loop;

  update public.liga_cierre
     set con_actividad = true, cristales_pagados = v_pagado
   where subject_id = p_subject and ciclo = p_ciclo;

  return v_pagado;
end;
$$;

-- ── 5. ligas_sembrar_ciclo: la siembra de la 0026, con el ciclo por parámetro ─
/*
 * DERIVADA DE LA 0026, con UN cambio y nada más: `v_ciclo` sale del parámetro en
 * vez de `ciclo_actual()`. Todo lo demás —la primera siembra, la partición, el
 * recuento de activos, la zona de ascenso, el registro con ligas_cerrar_ciclo—
 * queda byte a byte igual, y por eso las pruebas de ligas que ya existían siguen
 * valiendo sin tocarse.
 *
 * Hace falta porque cerrar los ciclos pendientes en secuencia es sembrar cada
 * lunes intermedio, uno por uno, y la función de la 0026 solo sabía sembrar HOY.
 */

create or replace function public.ligas_sembrar_ciclo(p_subject text, p_ciclo date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ciclo    date := p_ciclo;   -- (0036) el ÚNICO cambio respecto a la 0026
  v_anterior date;
  v_n        integer;
  v_ligas    integer;
  v_objetivo integer;
  v_activos  integer;
begin
  /* Ya sembrado: nada que hacer. */
  if exists (select 1 from public.liga_membresia where subject_id = p_subject and ciclo = v_ciclo) then
    return;
  end if;

  /*
   * Un ciclo que se siembra de cero no tiene reparto hasta que la partición
   * lo escriba. Si quedó alguna fila de un intento anterior —las pruebas
   * borran la membresía y vuelven a sembrar—, se va, para que el mensaje
   * del reparto no le salga a quien no fue repartido.
   */
  delete from public.liga_reparto r
   where r.subject_id = p_subject and r.ciclo = v_ciclo;

  select max(ciclo) into v_anterior
    from public.liga_membresia
   where subject_id = p_subject and ciclo < v_ciclo;

  if v_anterior is null then
    /*
     * Primera vez en esta materia. Entran todos los que tienen historial en
     * ella. Con un solo nivel, todos al 1. Con varios, la partición: por FP
     * del ciclo más reciente, no acumulados —así lo decía la 0006, y es
     * justo lo que la decisión 1 de Xeno cambió—.
     */
    select count(distinct user_id) into v_n from public.fp_history where subject_id = p_subject;
    if v_n = 0 then return; end if;

    /*
     * Los niveles salen de los ACTIVOS de la semana anterior, no de todo el
     * historial: la misma definición que el cierre semanal.
     */
    select count(*) into v_activos
      from (
        select h.user_id
          from public.fp_history h
         where h.subject_id = p_subject
           and h.created_at >= (v_ciclo - 7)::timestamp at time zone 'America/Bogota'
           and h.created_at <  v_ciclo::timestamp at time zone 'America/Bogota'
         group by h.user_id
        having sum(h.fp_awarded) > 0
      ) x;
    v_ligas := public.ligas_para(v_activos);

    /*
     * Si tocan varios niveles, la partición reparte por FP del ciclo más
     * reciente. Anidado a propósito: SQL no promete el orden en que evalúa un
     * `and`, y la transición no puede llegar a ejecutarse con un solo nivel.
     */
    if v_ligas > 1 then
      if public.ligas_transicion(p_subject, null, v_ciclo, 0, v_ligas) then
        perform public.ligas_cerrar_ciclo(p_subject, v_ciclo, v_ligas, v_n, v_activos);
        return;
      end if;
    end if;

    insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
    select
      p_subject,
      v_ciclo,
      t.user_id,
      least(v_ligas, 1 + ((row_number() over (order by t.fp desc, t.user_id)) - 1) * v_ligas / v_n)
    from (
      select user_id, sum(fp_awarded) as fp
        from public.fp_history
       where subject_id = p_subject
       group by user_id
    ) t;

    perform public.ligas_cerrar_ciclo(p_subject, v_ciclo, v_ligas, v_n, v_activos);
    return;
  end if;

  /* Cierre del ciclo anterior. */
  select count(*) into v_n
    from public.liga_membresia m
   where m.subject_id = p_subject and m.ciclo = v_anterior;

  /*
   * Los niveles de la semana pasada, del recuento guardado. Antes salían del
   * nivel más alto ocupado, que no ve los niveles vacíos.
   */
  v_ligas := public.liga_niveles(p_subject, v_anterior);

  /*
   * RECALCULAR en vez de heredar. Activos = quien tuvo FP en el ciclo que se
   * cierra: exactamente el CTE `activos` del movimiento de abajo.
   */
  select count(*) into v_activos
    from (
      select m.user_id
        from public.liga_membresia m
        join public.fp_history h
          on h.user_id = m.user_id
         and h.subject_id = p_subject
         and h.created_at >= v_anterior::timestamp at time zone 'America/Bogota'
         and h.created_at <  v_ciclo::timestamp at time zone 'America/Bogota'
       where m.subject_id = p_subject and m.ciclo = v_anterior
       group by m.user_id
      having sum(h.fp_awarded) > 0
    ) x;
  v_objetivo := public.ligas_para(v_activos);

  /*
   * Si el número de niveles tiene que cambiar, lo decide la partición. Si
   * dice false —encoger, o un salto que no existe—, se sigue con los niveles
   * de la semana pasada y el movimiento de abajo corre como siempre.
   *
   * O la partición siembra el ciclo entero, o no toca nada. Nunca las dos a
   * medias.
   */
  if v_objetivo <> v_ligas then
    if public.ligas_transicion(p_subject, v_anterior, v_ciclo, v_ligas, v_objetivo) then
      perform public.ligas_cerrar_ciclo(p_subject, v_ciclo, v_objetivo, v_n, v_activos);
      return;
    end if;
  end if;

  insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
  with fp_anterior as (
    select
      m.user_id,
      m.liga,
      coalesce((
        select sum(h.fp_awarded)
          from public.fp_history h
         where h.user_id = m.user_id
           and h.subject_id = p_subject
           and h.created_at >= v_anterior::timestamp at time zone 'America/Bogota'
           and h.created_at <  v_ciclo::timestamp at time zone 'America/Bogota'
      ), 0) as fp
    from public.liga_membresia m
    where m.subject_id = p_subject and m.ciclo = v_anterior
  ),
  /* Solo compiten por moverse quienes tuvieron actividad. Ver nota de arriba. */
  activos as (
    select
      f.*,
      rank() over (partition by f.liga order by f.fp desc) as puesto_arriba,
      rank() over (partition by f.liga order by f.fp asc)  as puesto_abajo,
      count(*) over (partition by f.liga)                  as activos_nivel
    from fp_anterior f
    where f.fp > 0
  ),
  /*
   * ANTES: subían los 3 primeros y bajaban los 3 últimos, fuera cual fuera el
   * tamaño del nivel. AHORA: la zona de ligas_zona(), el 15% de los activos
   * del nivel con mínimo 1 —ver las secciones 6 y 7 de esta migración—. Es
   * la misma función que decide el podio del tablero: quien sube el lunes es
   * exactamente quien estaba en el podio el domingo por la noche.
   */
  zonas as (
    select a.user_id, public.ligas_zona(a.puesto_arriba, a.puesto_abajo, a.activos_nivel) as zona
      from activos a
  )
  select
    p_subject,
    v_ciclo,
    f.user_id,
    case
      when z.zona = 'sube' and f.liga > 1 then f.liga - 1
      when z.zona = 'baja' and f.liga < v_ligas then f.liga + 1
      else f.liga
    end
  from fp_anterior f
  left join zonas z on z.user_id = f.user_id;

  perform public.ligas_cerrar_ciclo(p_subject, v_ciclo, v_ligas, v_n, v_activos);
end;
$$;



-- ── 6. ligas_cerrar_semana: los ciclos pendientes, uno por uno ──────────────
/*
 * Lo que corre en el primer evento de FP después del corte.
 *
 * ═══════════ EN SECUENCIA, NO SALTANDO AL ACTUAL ═══════════
 *
 * Si una liga pasa tres semanas sin actividad, se cierran los tres ciclos
 * pendientes en orden: cerrar el 1, sembrar el 8, cerrar el 8, sembrar el 15…
 * Saltar directo a hoy desde el último ciclo sembrado —lo que hacía la 0026, y
 * era razonable cuando el cierre no registraba nada— se salta también el
 * ascenso y el descenso de cada semana intermedia: alguien que ganó su nivel la
 * semana del 8 no subiría nunca, porque esa semana no se cerró jamás.
 *
 * ═══════════ NO SIEMBRA MATERIAS QUE NO TIENEN LIGA ═══════════
 *
 * Si la materia no tiene ni un ciclo sembrado, esta función NO HACE NADA. Es
 * deliberado: la llama registrar_fp, que corre para TODAS las materias, y
 * sembrar aquí abriría ligas en materias donde no están encendidas —hoy
 * Macroeconomía, cuya evaluación final todavía no paga FP de verdad—. Abrir la
 * liga sigue siendo trabajo de liga_entrar, que el cliente llama solo donde toca.
 */
create or replace function public.ligas_cerrar_semana(p_subject text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ciclo  date := public.ciclo_actual();
  v_ultimo date;
  v_paso   date;
begin
  select max(m.ciclo) into v_ultimo
    from public.liga_membresia m
   where m.subject_id = p_subject;

  /* Sin ligas en esta materia: nada que cerrar. Ver la nota de arriba. */
  if v_ultimo is null then return; end if;

  /* Ya sembrado este ciclo: el cierre de la semana pasada ya se hizo. */
  if v_ultimo >= v_ciclo then return; end if;

  v_paso := v_ultimo;
  while v_paso < v_ciclo loop
    /*
     * Primero se cierra el ciclo que acabó —resultados y podio— y después se
     * siembra el siguiente, que es el que lee esos mismos FP para decidir quién
     * sube. El orden importa poco para el cálculo (ninguno de los dos cambia los
     * FP) y mucho para leerlo: cerrar es lo que pasó, sembrar es lo que empieza.
     */
    perform public.ligas_cerrar_resultados(p_subject, v_paso);
    perform public.ligas_sembrar_ciclo(p_subject, v_paso + 7);
    v_paso := v_paso + 7;
  end loop;
end;
$$;

-- ── 7. ligas_sembrar: misma firma, ahora cierra lo pendiente ─────────────────
/*
 * La que ya llamaban liga_entrar y el tablero. Conserva firma y contrato —«deja
 * el ciclo actual sembrado»— y añade el cierre en secuencia de lo pendiente.
 *
 * Las dos líneas no son redundantes: la primera cierra y siembra los lunes
 * pendientes cuando la materia YA tiene liga; la segunda es la primera siembra
 * de una materia que todavía no la tiene (y no hace nada si ya está sembrada).
 */
create or replace function public.ligas_sembrar(p_subject text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ligas_cerrar_semana(p_subject);
  perform public.ligas_sembrar_ciclo(p_subject, public.ciclo_actual());
end;
$$;

-- ── 8. registrar_fp: el cierre antes, y los Cristales después ────────────────
/*
 * DERIVADA DE LA 0033 —la última que la define— con TRES añadidos y ni un cambio
 * en lo demás. El cálculo de FP, la racha, el bono, el detalle y el borrado de la
 * partida en curso quedan byte a byte iguales.
 *
 *   1. ANTES de escribir la fila: ligas_cerrar_semana de su materia. Así, el
 *      estudiante que dispara el cierre no se perjudica —su actividad cuenta
 *      para el ciclo que empieza— y el cierre ocurre sin tarea programada.
 *
 *   2. Junto al bono de racha: los Cristales del hito, con la MISMA condición y
 *      en el MISMO instante. No se vuelve a detectar nada: si paga bono, paga
 *      Cristales.
 *
 *   3. Después de la fila: el contador de actividades DISTINTAS, que paga 20
 *      cada 5. Va después porque la actividad de esta llamada tiene que contar.
 *
 * Misma firma: create or replace no crea una segunda —el incidente de las dos
 * firmas vivas de registrar_fp costó seis actividades sin pagar FP—.
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

  /*
   * ═══════════ (0036) AÑADIDO 1: EL CIERRE SEMANAL, ANTES DE ESCRIBIR ═══════════
   *
   * El cierre de la liga de esta materia corre aquí, antes de que exista la fila
   * de FP de esta llamada. Así:
   *
   *   · el que dispara el cierre NO SE PERJUDICA: su actividad cuenta para el
   *     ciclo que empieza, no para el que se acaba de cerrar
   *   · no hace falta ninguna tarea programada: el primer FP después del lunes
   *     paga el cierre de la semana anterior
   *
   * No hace nada en materias sin liga, y nada tampoco si el ciclo ya está
   * sembrado, que es el caso de todas las llamadas del día salvo la primera.
   */
  perform public.ligas_cerrar_semana(v_cat.subject_id);

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

    /*
     * ═══════════ (0036) AÑADIDO 2: LOS CRISTALES DEL HITO ═══════════
     *
     * Dentro del mismo if que paga el bono de FP: misma condición, mismo
     * instante, sin volver a detectar nada. Si un día los hitos cambian, cambian
     * los dos a la vez porque los dos cuelgan de bono_racha().
     */
    perform public.cristales_por_racha(v_uid, v_racha);
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

  /*
   * ═══════════ (0036) AÑADIDO 3: EL CONTADOR DE ACTIVIDADES DISTINTAS ═══════════
   *
   * 20 Cristales cada 5 actividades distintas. Va al final, cuando la fila de
   * esta llamada ya está escrita: si fuera antes, la actividad que el estudiante
   * acaba de terminar no contaría hasta la siguiente.
   *
   * Las repeticiones no mueven el contador y las filas de bono no son
   * actividades; las dos reglas viven en cristales_por_actividades().
   */
  perform public.cristales_por_actividades(v_uid);

  return v_fila;
end;
$$;



-- ── 9. Permisos ─────────────────────────────────────────────────────────────
/*
 * Las cuatro nuevas de liga son internas: las llaman registrar_fp y
 * ligas_sembrar, que ya son security definer. Ningún estudiante tiene por qué
 * poder decir «cierra la semana» —y menos «cierra la semana otra vez»—.
 *
 * El revoke a anon y authenticated va explícito: en Supabase los privilegios por
 * defecto les conceden ejecución al crear la función.
 */
revoke all on function public.liga_podio_tamano(bigint) from public, anon, authenticated;
revoke all on function public.liga_cristales_puesto(bigint) from public, anon, authenticated;
revoke all on function public.ligas_cerrar_resultados(text, date) from public, anon, authenticated;
revoke all on function public.ligas_sembrar_ciclo(text, date) from public, anon, authenticated;
revoke all on function public.ligas_cerrar_semana(text) from public, anon, authenticated;

/* Las dos que ya existían conservan sus grants con create or replace; se reemiten. */
revoke all on function public.ligas_sembrar(text) from public, anon;
grant execute on function public.ligas_sembrar(text) to authenticated;
revoke all on function public.registrar_fp(text, integer, numeric, jsonb) from public, anon;
grant execute on function public.registrar_fp(text, integer, numeric, jsonb) to authenticated;
