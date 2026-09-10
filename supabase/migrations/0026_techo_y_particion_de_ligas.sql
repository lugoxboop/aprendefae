-- Ligas: la expansión completa. Techo de cuatro niveles, recuento guardado,
-- recálculo cada ciclo y la partición con las tres decisiones de Xeno.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. EL TECHO: CUATRO NIVELES, NUNCA UN QUINTO
--
-- Hay cuatro nombres —Emergente, Intermedio, Avanzado, Élite— y `ligas_para`
-- podía devolver 5 con 100 personas: por encima de ~80 el servidor habría
-- creado un nivel sin nombre.
--
-- Esto CONTRADICE a propósito una nota de la 0006, que decía que en el tramo
-- alto "manda el tamaño" (~20 por nivel). La decisión nueva es la contraria:
-- cuatro es el techo, y por encima los niveles se hacen más grandes. Con 160
-- activos son 40 por nivel, y el podio —el cupo del 15%, sección 7— es de 6.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- 2. EL RECUENTO SE GUARDA; YA NO SE DEDUCE DE max(liga)
--
-- Con max(liga) un nivel vacío no existe, y la partición puede dejarlos: si en
-- la semana del reparto nadie cae en Emergente, el sistema contaría dos niveles
-- y renombraría a todo el mundo. Y el límite de descenso `liga < v_ligas`
-- saldría del mismo número equivocado.
--
-- El número vive en `liga_ciclo`, lo escribe sembrar al cerrar cada ciclo, y lo
-- lee UNA función: `liga_niveles()`. Sembrar, entrar, el tablero y el contexto
-- la llaman a ella. Sin fila, cae a max(liga): el relleno de abajo deja una
-- fila en cada ciclo existente, así que en producción no pasa; queda como red
-- para las pruebas que insertan membresía a mano.
--
-- `liga_ciclo` guarda también cuántos ACTIVOS decidieron ese número. Es el [N]
-- del mensaje del reparto: sale del dato, no de un 20 escrito a mano.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- 3. RECALCULAR CADA CICLO, CON LOS ACTIVOS
--
-- Sembrar ya no hereda el número de la semana pasada, que es lo que lo dejó
-- congelado en uno. Cada cierre pregunta `ligas_para(activos)`.
--
-- ACTIVOS = quien tuvo FP en el ciclo que se cierra. No es una definición
-- nueva: es exactamente la del CTE `activos` que sembrar ya usaba para decidir
-- quién compite por moverse. El umbral cuenta a la misma gente que el mensaje
-- nombra.
--
-- LOS NIVELES NO ENCOGEN. Si los activos bajan del umbral —una semana de
-- vacaciones—, el número se sostiene. Encoger no está diseñado, y Xeno lo dejó
-- explícito: la 3→4 es la última transición. Sin esta regla, el grupo
-- parpadearía entre uno y tres niveles alrededor de los 20.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- 4. LA PARTICIÓN, CON LAS TRES DECISIONES DE XENO
--
-- `ligas_transicion` despacha según el salto:
--
--   DE 0 o 1 A k  →  `ligas_repartir`. Se ordena por FP DEL CICLO MÁS RECIENTE,
--                    no acumulados: el acumulado castiga a quien llegó tarde
--                    aunque venga fuerte. Se parte en k grupos por posición, y
--                    EMPATE EN EL BORDE: los dos al de arriba (rank(), el mismo
--                    criterio del ascenso semanal). Quien no tuvo actividad va
--                    al de abajo: su ciclo más reciente es cero.
--
--   DE 3 A 4      →  `ligas_abrir_elite`. Solo se subdivide Avanzado: la mitad
--                    con mejor ciclo pasa a Élite, empates hacia arriba. Nadie
--                    baja. Intermedio y Emergente cambian de NÚMERO (2→3, 3→4)
--                    pero no de nombre, que es lo que ven.
--
--   CUALQUIER OTRO →  false: se sostiene el número de la semana pasada.
--
-- UNA CONSECUENCIA DE "NADIE BAJA": la semana de la 3→4 no hay movimiento
-- semanal para nadie. Si hubiera, los últimos de cada nivel bajarían. Así
-- que esa semana quien habría subido de Intermedio a Avanzado tampoco sube.
--
-- Quién vivió cada reparto queda en `liga_reparto`, y es de ahí de donde el
-- cliente sabe a quién mostrarle cada mensaje: el del reparto a todos los
-- repartidos, el de Élite solo a quien estaba en Avanzado.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- 5. Y SEMBRAR NO SE FÍA DE LA PARTICIÓN
--
-- Después de cada siembra, `ligas_cerrar_ciclo` comprueba que no se perdió a
-- nadie y que nadie quedó por encima del número de niveles, y si algo no cuadra
-- LANZA. Mejor una semana sin ligas y un error con nombre que un reparto roto
-- en silencio.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- LA PRIMERA SIEMBRA DE UNA MATERIA TAMBIÉN CAMBIA
--
-- En la 0006, la primera siembra contaba a todos los que tenían historial y
-- repartía por FP ACUMULADOS. Ahora cuenta los activos de la semana anterior y,
-- si tocan varios niveles, pasa por la misma partición. Solo afecta a una
-- materia que se encienda por primera vez —Pensamiento Estratégico ya está
-- sembrada—, y es la decisión 1 de Xeno aplicada al único reparto que quedaba
-- con el criterio viejo.
--
-- Y LAS SECCIONES 6 Y 7 —el movimiento proporcional y el podio— están más
-- abajo, junto a las dos funciones que las implementan.
--
-- SÍ TOCA liga_resultados, de la 0008: su podio pasa a ser la zona de ascenso
-- para los ciclos jugados desde esta migración (sección 7).
--
-- LO QUE NO TOCA: la medalla de "semanas en la liga alta" de la 0008 sigue
-- calculando su total con max(m.liga). Solo lo usa para saber si había más de
-- un nivel cuando alguien estaba en la liga 1, y eso sale bien igual: si hay
-- alguien en la 1 y más de un nivel ocupado, hay alguien debajo.
--
-- Idempotente.
-- ---------------------------------------------------------------------------

-- ── Guardia ─────────────────────────────────────────────────────────────────
/*
 * Si ya hay algún ciclo con más de cuatro niveles, el techo nuevo no sabe qué
 * nombre darle, y el relleno de abajo chocaría contra el check de liga_ciclo
 * con un error menos claro que este. Se comprueba en vez de suponerlo.
 */
do $guardia$
begin
  if exists (
    select 1
      from public.liga_membresia m
     group by m.subject_id, m.ciclo
    having max(m.liga) > 4
  ) then
    raise exception using
      message = 'La 0026 no se aplica: hay ciclos con más de 4 niveles en liga_membresia.',
      hint    = 'El techo nuevo no sabe qué nombre darles. Hay que decidir qué hacer con esos ciclos antes de migrar.';
  end if;
end
$guardia$;

-- ── ligas_para: el techo ────────────────────────────────────────────────────
/*
 * Cuántos niveles para N activos.
 *
 *   < 20   uno: partir un grupo pequeño deja ligas de cuatro personas, donde
 *          el podio es casi todo el mundo y no significa nada.
 *   20-59  tres.
 *   >= 60  cuatro, y nunca más.
 *
 * Los números son los mismos que UMBRALES_NIVEL y MAX_NIVELES de
 * src/ligas/niveles.js, y niveles.test.mjs lee ESTE archivo —el último que
 * define la función— para comprobarlo.
 */
create or replace function public.ligas_para(n integer)
returns integer
language sql
immutable
as $$
  select case
    when n < 20 then 1
    when n < 60 then 3
    else 4
  end;
$$;

-- ── liga_ciclo: el recuento guardado ────────────────────────────────────────
/*
 * Cuántos niveles tiene cada materia en cada ciclo, y cuántos activos lo
 * decidieron. Lo escribe `ligas_cerrar_ciclo` y lo lee `liga_niveles`.
 *
 * El 4 del check es el mismo techo de ligas_para; niveles.test.mjs comprueba
 * que los dos coincidan con MAX_NIVELES.
 */
create table if not exists public.liga_ciclo (
  subject_id  text    not null,
  ciclo       date    not null,
  niveles     integer not null check (niveles between 1 and 4),
  activos     integer check (activos >= 0),
  primary key (subject_id, ciclo)
);

alter table public.liga_ciclo enable row level security;
alter table public.liga_ciclo force row level security;
-- Sin políticas: igual que liga_membresia, solo la tocan las funciones.

/*
 * Relleno de los ciclos que ya existen. Hasta hoy nunca hubo niveles vacíos
 * —no había forma de crearlos—, así que para el pasado max(liga) sí es el
 * número correcto. `activos` queda null: no se sabe con qué cuenta se
 * decidieron, y un número inventado sería peor que ninguno.
 */
insert into public.liga_ciclo (subject_id, ciclo, niveles)
select m.subject_id, m.ciclo, max(m.liga)
  from public.liga_membresia m
 group by m.subject_id, m.ciclo
on conflict (subject_id, ciclo) do nothing;

-- ── liga_reparto: quién vivió cada transición ───────────────────────────────
/*
 * Una fila por persona afectada por una transición, en el ciclo en que pasó.
 *
 *   reparto   de uno (o cero) a varios niveles. Todos los repartidos.
 *   elite     de tres a cuatro. SOLO quien estaba en Avanzado: los que suben
 *             a Élite y los que se quedan. Intermedio y Emergente no tienen
 *             fila, y por eso no ven el mensaje.
 *
 * Es lo que decide qué mensaje ve cada quien esa semana. Un estudiante que
 * entra a mitad de la semana del reparto no tiene fila: no fue repartido, entró
 * por el medio, y el texto "quedaste en X según tu ciclo más reciente" le
 * mentiría.
 */
create table if not exists public.liga_reparto (
  subject_id    text    not null,
  ciclo         date    not null,
  user_id       uuid    not null references auth.users (id) on delete cascade,
  tipo          text    not null check (tipo in ('reparto', 'elite')),
  liga_antes    integer,
  liga_despues  integer not null,
  primary key (subject_id, ciclo, user_id)
);

alter table public.liga_reparto enable row level security;
alter table public.liga_reparto force row level security;

-- ── liga_niveles: la única respuesta a "cuántos niveles hay" ────────────────
/*
 * La llaman sembrar, entrar, el tablero y el contexto. Si alguna vez hace falta
 * el número de niveles en otro sitio del servidor, sale de aquí.
 *
 * Invocador, no definer: solo la llaman funciones que ya son security definer,
 * y los clientes no tienen permiso de ejecutarla.
 */
create or replace function public.liga_niveles(p_subject text, p_ciclo date)
returns integer
language sql
stable
set search_path = public
as $$
  select coalesce(
    (select lc.niveles
       from public.liga_ciclo lc
      where lc.subject_id = p_subject and lc.ciclo = p_ciclo),
    (select max(m.liga)
       from public.liga_membresia m
      where m.subject_id = p_subject and m.ciclo = p_ciclo),
    0
  );
$$;

-- ── ligas_cerrar_ciclo: comprobar y registrar ───────────────────────────────
/*
 * El último paso de todos los caminos de sembrar.
 *
 *   · que no se perdió a nadie: al menos p_minimo filas. La membresía se
 *     arrastra entera cada lunes, así que un ciclo con menos gente que el
 *     anterior es un reparto roto, no un grupo que encogió.
 *   · que nadie quedó por encima del número de niveles.
 *
 * Si cuadra, guarda el número de niveles y los activos que lo decidieron.
 */
create or replace function public.ligas_cerrar_ciclo(
  p_subject text,
  p_ciclo   date,
  p_niveles integer,
  p_minimo  integer,
  p_activos integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_filas integer;
  v_max   integer;
begin
  select count(*), max(m.liga) into v_filas, v_max
    from public.liga_membresia m
   where m.subject_id = p_subject and m.ciclo = p_ciclo;

  if v_filas < p_minimo then
    raise exception using
      message = format('Liga %s: el ciclo %s quedó con %s personas y debía tener al menos %s.',
                       p_subject, p_ciclo, v_filas, p_minimo),
      hint    = 'Alguien se perdió al repartir. Si acaba de cambiar la partición, el fallo está ahí.';
  end if;

  if v_max > p_niveles then
    raise exception using
      message = format('Liga %s: hay alguien en el nivel %s, pero el ciclo %s tiene %s niveles.',
                       p_subject, v_max, p_ciclo, p_niveles),
      hint    = 'El reparto colocó gente fuera de rango.';
  end if;

  insert into public.liga_ciclo (subject_id, ciclo, niveles, activos)
  values (p_subject, p_ciclo, p_niveles, p_activos)
  /*
   * Upsert y no insert: ligas_test.sql borra la membresía del ciclo actual y
   * vuelve a sembrar para probar los empates, y la fila de aquí sobrevive a
   * ese borrado.
   */
  on conflict (subject_id, ciclo) do update
     set niveles = excluded.niveles,
         activos = excluded.activos;
end;
$$;

-- ── ligas_repartir: de uno (o cero) a k niveles ─────────────────────────────
/*
 * DECISIÓN 1 DE XENO. Se ordena por FP del ciclo más reciente, no acumulados.
 * Una semana es muestra chica y alguien puede quedar mal ubicado; no se
 * compensa con una regla más compleja, porque el ascenso y descenso normal lo
 * corrige en uno o dos ciclos.
 *
 * CÓMO SE PARTE. Los activos se ordenan con rank() y se cortan en k tramos
 * iguales por posición: grupo = 1 + (puesto - 1) * k / activos. Con rank(),
 * dos empatados comparten puesto y por tanto grupo, y el grupo que les toca es
 * el del puesto más alto: EMPATE EN EL BORDE, LOS DOS ARRIBA, aunque
 * desbalancee el tamaño esa vez.
 *
 * QUIEN NO TUVO ACTIVIDAD va al grupo de abajo. Su ciclo más reciente es cero,
 * que es lo que el orden ya diría; se pone a mano para que no cuente en el
 * tamaño de los tramos. Si contara, con muchos inactivos empatados en cero el
 * empate "hacia arriba" los podría subir en bloque a Intermedio y dejar
 * Emergente vacío.
 *
 * p_anterior null = primera siembra de la materia: los candidatos son todos
 * los que tienen historial en ella, y el ciclo más reciente es la semana
 * anterior a p_ciclo.
 */
create or replace function public.ligas_repartir(
  p_subject  text,
  p_anterior date,
  p_ciclo    date,
  p_niveles  integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_desde date := coalesce(p_anterior, p_ciclo - 7);
begin
  with candidatos as (
    select m.user_id, m.liga as liga_antes
      from public.liga_membresia m
     where p_anterior is not null
       and m.subject_id = p_subject
       and m.ciclo = p_anterior
    union all
    select distinct h.user_id, null::integer
      from public.fp_history h
     where p_anterior is null
       and h.subject_id = p_subject
  ),
  con_fp as (
    select
      c.user_id,
      c.liga_antes,
      coalesce((
        select sum(h.fp_awarded)
          from public.fp_history h
         where h.user_id = c.user_id
           and h.subject_id = p_subject
           and h.created_at >= v_desde::timestamp at time zone 'America/Bogota'
           and h.created_at <  p_ciclo::timestamp at time zone 'America/Bogota'
      ), 0) as fp
    from candidatos c
  ),
  ordenados as (
    select
      f.user_id,
      rank() over (order by f.fp desc) as puesto,
      count(*) over () as n_activos
    from con_fp f
    where f.fp > 0
  ),
  colocados as (
    select
      f.user_id,
      f.liga_antes,
      (case
         when o.user_id is null then p_niveles
         else least(p_niveles, 1 + ((o.puesto - 1) * p_niveles) / o.n_activos)
       end)::integer as nivel
    from con_fp f
    left join ordenados o on o.user_id = f.user_id
  ),
  alta as (
    insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
    select p_subject, p_ciclo, c.user_id, c.nivel
      from colocados c
    returning user_id
  )
  insert into public.liga_reparto (subject_id, ciclo, user_id, tipo, liga_antes, liga_despues)
  select p_subject, p_ciclo, c.user_id, 'reparto', c.liga_antes, c.nivel
    from colocados c;
end;
$$;

-- ── ligas_abrir_elite: de tres a cuatro niveles ─────────────────────────────
/*
 * DECISIÓN 3 DE XENO. Solo se subdivide Avanzado —la liga 1 de tres— en "sube
 * a Élite" y "sigue en Avanzado". Nadie baja. Intermedio y Emergente pasan de
 * la 2 y la 3 a la 3 y la 4: cambia el número, no el nombre.
 *
 * Quien estaba en Avanzado sin actividad se queda en Avanzado: no tuvo "el
 * mejor ciclo". Los empates en el corte suben los dos, como en todo reparto.
 */
create or replace function public.ligas_abrir_elite(
  p_subject  text,
  p_anterior date,
  p_ciclo    date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  /*
   * ═════════════════ DECISIÓN, NO DATO ═════════════════
   *
   * QUÉ PARTE DE AVANZADO SUBE A ÉLITE AL ABRIRLA.
   *
   * Xeno decidió QUE se subdivide Avanzado y QUE nadie baja. NO dio la
   * proporción. La mitad la eligió quien escribió esta migración, leyendo
   * "subdividir el grupo" como partirlo en dos. No viene de ningún documento
   * de diseño ni es un número heredado, y cuestionarla es legítimo: se cambia
   * aquí y en ningún otro sitio.
   *
   * Lo que sí se sabe de ella: redondea hacia abajo y nunca deja Élite vacía
   * si hay alguien activo en Avanzado (mínimo uno).
   */
  c_parte_a_elite constant numeric := 0.5;
begin
  with miembros as (
    select
      m.user_id,
      m.liga as liga_antes,
      coalesce((
        select sum(h.fp_awarded)
          from public.fp_history h
         where h.user_id = m.user_id
           and h.subject_id = p_subject
           and h.created_at >= p_anterior::timestamp at time zone 'America/Bogota'
           and h.created_at <  p_ciclo::timestamp at time zone 'America/Bogota'
      ), 0) as fp
    from public.liga_membresia m
    where m.subject_id = p_subject and m.ciclo = p_anterior
  ),
  avanzado as (
    select
      a.user_id,
      rank() over (order by a.fp desc) as puesto,
      count(*) over () as n_activos
    from miembros a
    where a.liga_antes = 1 and a.fp > 0
  ),
  colocados as (
    select
      mm.user_id,
      mm.liga_antes,
      (case
         when av.user_id is not null
              and av.puesto <= greatest(1, floor(av.n_activos * c_parte_a_elite)) then 1
         else mm.liga_antes + 1
       end)::integer as nivel
    from miembros mm
    left join avanzado av on av.user_id = mm.user_id
  ),
  alta as (
    insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
    select p_subject, p_ciclo, c.user_id, c.nivel
      from colocados c
    returning user_id
  )
  insert into public.liga_reparto (subject_id, ciclo, user_id, tipo, liga_antes, liga_despues)
  select p_subject, p_ciclo, c.user_id, 'elite', c.liga_antes, c.nivel
    from colocados c
   where c.liga_antes = 1;
end;
$$;

-- ── ligas_transicion: el despacho ───────────────────────────────────────────
/*
 * La llama sembrar cuando el número de niveles pedido no es el de la semana
 * pasada. true = sembró el ciclo entero; false = no toca nada y sembrar sigue
 * por el camino normal con los niveles de antes.
 */
create or replace function public.ligas_transicion(
  p_subject  text,
  p_anterior date,
  p_ciclo    date,
  p_de       integer,
  p_a        integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  /* Encoger no está diseñado. Se sostiene el número de la semana pasada. */
  if p_a <= p_de then return false; end if;

  /* Un solo nivel no se reparte. */
  if p_a <= 1 then return false; end if;

  /* De uno —o de ninguno, en la primera siembra— a varios. */
  if p_de <= 1 then
    perform public.ligas_repartir(p_subject, p_anterior, p_ciclo, p_a);
    return true;
  end if;

  /* De tres a cuatro: se abre Élite. */
  if p_de = 3 and p_a = 4 then
    perform public.ligas_abrir_elite(p_subject, p_anterior, p_ciclo);
    return true;
  end if;

  /* Nada más existe: ligas_para solo da 1, 3 o 4. */
  return false;
end;
$$;

-- ── El movimiento proporcional y el podio ───────────────────────────────────
/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 6. CUÁNTOS SE MUEVEN: EL 15% DEL NIVEL, NO TRES FIJOS
 *
 * La 0006 subía a los 3 primeros y bajaba a los 3 últimos de cada nivel, fuera
 * cual fuera su tamaño. Con los grupos de ~7 que deja el primer reparto eso era
 * mover 6 de 7 cada semana: en 40 semanas simuladas, el 60% de los activos
 * cambiaba de nivel cada lunes y más de la mitad volvía al anterior la semana
 * siguiente. No se leía como competencia sino como tómbola, y los primeros en
 * vivirlo iban a ser justo los del grupo de 7.
 *
 * AHORA el cupo por dirección es el 15% de los ACTIVOS del nivel:
 *
 *   REDONDEO AL MÁS CERCANO. 7 → 1,05 → 1; 17 → 2,55 → 3. Es el único que
 *   cumple las dos cosas pedidas: que un grupo de 7 mueva 1 y que uno de 17
 *   siga moviendo 3, como antes. Hacia abajo, 17 movería 2; hacia arriba, 7
 *   movería 2. Los ,5 van hacia arriba: 10 → 2.
 *
 *   MÍNIMO 1. Con el 15% a secas, un nivel de 3 activos movería 0 (0,45
 *   redondea a 0), y un nivel donde nunca sube nadie se congela: quien merece
 *   subir se queda atascado para siempre. Uno por dirección es el movimiento
 *   más pequeño que mantiene la escalera abierta.
 *
 *   NADIE ESTÁ A LA VEZ ARRIBA Y ABAJO. Si alguien cae dentro del cupo por los
 *   dos lados —el único activo del nivel, o todos empatados— no se mueve: en
 *   su nivel no hubo con quién distinguirlo. Con la regla de la 0006 un nivel
 *   entero empatado subía completo, y el único activo del nivel de arriba
 *   bajaba por ser a la vez el mejor y el peor.
 *
 *   EMPATES EN EL BORDE: LOS DOS. rank(), el criterio de Xeno. Con cupo 1 un
 *   empate en el primer puesto sube a dos, que en relativo es más que con cupo
 *   3; pero ya no puede pasar lo de antes, un triple empate en el tercer puesto
 *   de un grupo de 7 subiendo a cinco.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 7. EL PODIO ES LA ZONA DE ASCENSO
 *
 * El podio era el 28% del nivel —2 nombres en un grupo de 7— y subían 3 con la
 * regla vieja o 1 con la nueva. Podio y ascenso decían cosas distintas, y con
 * el 15% el podio prometía más de lo que cumplía: salir en él ya no era subir.
 *
 * Ahora los dos salen de `ligas_zona`. El podio del tablero es exactamente
 * quien subiría si la semana terminara en ese momento, y el cierre del lunes
 * sube exactamente a quien estaba ahí. En el nivel de arriba, donde no se
 * sube, el podio es la misma zona: los que lideran.
 *
 * Consecuencias que conviene tener a la vista:
 *   · el podio es más chico: 3 nombres con 17 activos (eran 5), 1 con 7 (eran
 *     2). Las medallas de podio cuestan más.
 *   · el lunes por la mañana, antes de que nadie sume FP, el podio está vacío.
 *     Con el 28% salía la liga ENTERA: todos a cero, todos empatados en el
 *     puesto 1, todos dentro del corte.
 *
 * ═══════════ LAS MEDALLAS NO SE RECALCULAN HACIA ATRÁS ═══════════
 *
 * Las medallas de podio se calculan al vuelo desde liga_resultados (0008), sin
 * tabla de medallas ganadas. Cambiar el podio ahí para todos los ciclos habría
 * QUITADO medallas ya ganadas a quien estuvo en el podio del 28% y no lo está
 * en el de la zona. Así que cada ciclo se cuenta con la regla con que se jugó:
 * los anteriores a 'podio_proporcional_desde' con el 28%, los demás con la
 * zona. La fecha se fija al aplicar esta migración y no se mueve si se vuelve
 * a correr.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* Cuántos se mueven por dirección en un nivel con p_activos activos. */
create or replace function public.ligas_cupo(p_activos bigint)
returns integer
language sql
immutable
as $$
  select case
    when p_activos is null or p_activos < 1 then 0
    else greatest(1, round(p_activos * 0.15))::integer
  end;
$$;

/*
 * En qué zona está alguien dentro de su nivel: 'sube', 'baja' o null.
 *
 *   p_arriba   su puesto contando desde el mejor (rank: los empatados comparten)
 *   p_abajo    su puesto contando desde el peor
 *   p_activos  cuántos activos tiene el nivel
 *
 * La usan el cierre semanal (quién se mueve), el tablero (quién sale en el
 * podio) y liga_resultados (el podio de las medallas). Un solo sitio.
 */
create or replace function public.ligas_zona(p_arriba bigint, p_abajo bigint, p_activos bigint)
returns text
language sql
immutable
as $$
  select case
    when p_arriba is null or p_abajo is null then null
    when p_arriba <= public.ligas_cupo(p_activos) and p_abajo > public.ligas_cupo(p_activos) then 'sube'
    when p_abajo <= public.ligas_cupo(p_activos) and p_arriba > public.ligas_cupo(p_activos) then 'baja'
  end;
$$;

/* Desde qué ciclo el podio es la zona. Ver arriba: no se recalcula hacia atrás. */
insert into public.ajustes (clave, valor, nota)
values (
  'podio_proporcional_desde',
  public.ciclo_actual()::text,
  'Primer ciclo cuyo podio es la zona de ascenso (0026). Los anteriores se cuentan con el 28%.'
)
on conflict (clave) do nothing;

-- ── ligas_sembrar: recalcula por activos, la partición decide los cambios ────

/*
 * Derivada de la 0006. Cambios, todos declarados y contados por el script:
 *   · declara v_objetivo y v_activos
 *   · limpia filas de reparto viejas del ciclo que va a sembrar
 *   · primera siembra: niveles por activos; si son varios, la partición
 *   · cierre: niveles de la semana pasada del recuento guardado
 *   · cierre: objetivo por activos; si cambia, la partición
 *   · movimiento: la zona proporcional en vez de 3 fijos
 *   · los cuatro finales registran con ligas_cerrar_ciclo
 * La ventana de FP de la semana que se cierra queda byte a byte igual.
 */
create or replace function public.ligas_sembrar(p_subject text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ciclo    date := public.ciclo_actual();
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

-- ── liga_entrar: entra por el medio del recuento guardado ───────────────────

/* Derivada de la 0006. Un solo cambio: de dónde sale v_ligas. */
create or replace function public.liga_entrar(p_subject text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_ciclo date := public.ciclo_actual();
  v_ligas integer;
begin
  if v_uid is null then return; end if;

  perform public.ligas_sembrar(p_subject);

  if exists (
    select 1 from public.liga_membresia
     where subject_id = p_subject and ciclo = v_ciclo and user_id = v_uid
  ) then
    return;
  end if;

  /*
   * Del recuento guardado. Si un nivel está vacío, el nivel más alto ocupado
   * da un número menor y el "medio" cae un escalón demasiado arriba.
   */
  v_ligas := public.liga_niveles(p_subject, v_ciclo);

  /* Sin ligas todavía en este ciclo: es el primero, y su liga es la única. */
  if v_ligas = 0 then v_ligas := 1; end if;

  insert into public.liga_membresia (subject_id, ciclo, user_id, liga)
  values (p_subject, v_ciclo, v_uid, ((v_ligas + 1) / 2))
  on conflict do nothing;
end;
$$;

-- ── liga_tablero: recuento guardado y podio = zona de ascenso ───────────────

/* Derivada de la 0006. Dos cambios: de dónde sale v_total, y el podio es la zona. */
create or replace function public.liga_tablero(p_subject text)
returns table (
  liga          integer,
  total_ligas   integer,
  tam_liga      integer,
  corte_podio   integer,
  posicion      bigint,
  nickname      text,
  fp            bigint,
  es_tuyo       boolean,
  en_podio      boolean
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_uid   uuid := auth.uid();
  v_ciclo date := public.ciclo_actual();
  v_liga  integer;
  v_tam   integer;
  v_total integer;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para ver tu liga' using errcode = '42501';
  end if;

  select m.liga into v_liga
    from public.liga_membresia m
   where m.subject_id = p_subject and m.ciclo = v_ciclo and m.user_id = v_uid;

  /* Sin membresía todavía: aún no ha ganado FP en la materia este ciclo. */
  if v_liga is null then return; end if;

  select count(*), max(m2.liga) into v_tam, v_total
    from public.liga_membresia m2
   where m2.subject_id = p_subject and m2.ciclo = v_ciclo and m2.liga = v_liga;

  /* Del recuento guardado: la misma respuesta que da liga_contexto. */
  v_total := public.liga_niveles(p_subject, v_ciclo);

  /*
   * EL PODIO YA NO ES EL 28% DE LA LIGA. Es la zona de ascenso: quien subiría
   * si la semana terminara ahora, con ligas_zona(), la misma función del
   * cierre semanal. corte_podio pasa a ser el cupo del nivel. Ver las
   * secciones 6 y 7 de la 0026.
   */

  return query
  with tabla as (
    select
      m.user_id,
      coalesce((
        select sum(h.fp_awarded)
          from public.fp_history h
         where h.user_id = m.user_id
           and h.subject_id = p_subject
           and h.created_at >= v_ciclo::timestamp at time zone 'America/Bogota'
      ), 0)::bigint as fp
    from public.liga_membresia m
    where m.subject_id = p_subject and m.ciclo = v_ciclo and m.liga = v_liga
  ),
  clasificada as (
    select
      t.user_id,
      t.fp,
      rank() over (order by t.fp desc) as posicion
    from tabla t
  ),
  /*
   * Empate justo en el borde del podio: se amplía el podio esa semana en vez de
   * romper el empate por detrás. Misma transparencia que en el borde de ascenso.
   * rank() ya da el mismo número a los empatados, así que basta con incluir a
   * todos los que compartan el puesto de corte.
   */
  zonas as (
    select
      t.user_id,
      public.ligas_zona(
        rank() over (order by t.fp desc),
        rank() over (order by t.fp asc),
        count(*) over ()
      ) as zona
    from tabla t
    where t.fp > 0
  ),
  con_podio as (
    select c.*, coalesce(z.zona = 'sube', false) as en_podio
      from clasificada c
      left join zonas z on z.user_id = c.user_id
  )
  select
    v_liga, v_total, v_tam,
    (select public.ligas_cupo(count(*)) from tabla t2 where t2.fp > 0),
    c.posicion, p.nickname, c.fp,
    (c.user_id = v_uid) as es_tuyo,
    c.en_podio
  from con_podio c
  join public.profiles p on p.user_id = c.user_id
  where c.en_podio or c.user_id = v_uid
  order by c.posicion;
end;
$$;

-- ── liga_resultados: el podio de las medallas, con fecha de corte ───────────

/*
 * Derivada de la 0008. Un solo cambio: en_podio. Desde la fecha de corte es la
 * zona de ascenso; antes, el 28% con el que se jugaron esos ciclos.
 */
create or replace function public.liga_resultados(p_subject text, p_ciclo date)
returns table (user_id uuid, liga integer, posicion bigint, fp bigint, en_podio boolean, tam_liga integer)
language sql
security definer
set search_path = public
stable
as $$
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
  tam as (
    select liga, count(*)::integer as n from fp_ciclo group by liga
  ),
  clasificada as (
    select
      f.user_id, f.liga, f.fp,
      rank() over (partition by f.liga order by f.fp desc) as posicion,
      t.n as tam_liga
    from fp_ciclo f
    join tam t on t.liga = f.liga
  ),
  zonas as (
    select
      f.user_id,
      public.ligas_zona(
        rank() over (partition by f.liga order by f.fp desc),
        rank() over (partition by f.liga order by f.fp asc),
        count(*) over (partition by f.liga)
      ) as zona
    from fp_ciclo f
    where f.fp > 0
  )
  select
    c.user_id, c.liga, c.posicion, c.fp,
    (case
       /*
        * Cada ciclo con la regla con que se jugó. Los anteriores a la 0026
        * con el 28%: recalcularlos con la zona le quitaría a alguien una
        * medalla de podio que ya tiene. Sin el ajuste, todo con el 28%:
        * es la opción que nunca quita nada.
        */
       when p_ciclo < public.ajuste_fecha('podio_proporcional_desde', '9999-12-31'::date)
         then c.posicion <= greatest(1, ceil(c.tam_liga::numeric * 0.28)::integer)
       else coalesce(z.zona = 'sube', false)
     end) as en_podio,
    c.tam_liga
  from clasificada c
  left join zonas z on z.user_id = c.user_id;
$$;

-- ── liga_contexto: tres columnas más, y por eso drop + create ───────────────
/*
 * AÑADE, sobre la 0025:
 *
 *   niveles_anterior  cuántos niveles había en el ciclo de liga_anterior. Hace
 *                     falta para saber si alguien SUBIÓ cuando cambia la
 *                     numeración: en la semana de Élite, Intermedio pasa de la
 *                     liga 2 a la 3 sin moverse. Comparar números diría "bajó";
 *                     comparar la posición desde abajo dice "igual".
 *   transicion        'reparto', 'elite' o null: si quien pregunta vivió una
 *                     transición este ciclo. Sale de liga_reparto.
 *   activos_reparto   el [N] del mensaje del reparto: los activos que
 *                     decidieron los niveles de este ciclo. Solo cuando
 *                     transicion = 'reparto'.
 *
 * DROP + CREATE porque create or replace no puede cambiar el tipo de retorno.
 * Y el drop SE LLEVA LOS GRANTS: la función renace ejecutable por `public`,
 * que en Supabase incluye a `anon`. Los permisos de abajo lo revocan, y
 * ligas_crecimiento_test.sql comprueba que anon no puede ejecutarla y
 * authenticated sí.
 *
 * Las tres columnas de la 0025 siguen, con el mismo nombre y significado:
 * liga_contexto_test.sql las lee por nombre y sigue valiendo.
 *
 * TODAS LAS REFERENCIAS CUALIFICADAS. Las columnas del returns table son
 * variables en ámbito, y `activos` —columna de liga_ciclo— está a una letra de
 * convertirse en el próximo 42702.
 */
drop function if exists public.liga_contexto(text);

create function public.liga_contexto(p_subject text)
returns table (
  total_ligas        integer,
  ciclos_con_niveles integer,
  liga_anterior      integer,
  niveles_anterior   integer,
  transicion         text,
  activos_reparto    integer
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_uid       uuid := auth.uid();
  v_ciclo     date := public.ciclo_actual();
  v_liga_ant  integer;
  v_ciclo_ant date;
begin
  if v_uid is null then
    raise exception 'Se requiere sesión para ver tu liga' using errcode = '42501';
  end if;

  /*
   * El ciclo anterior más reciente EN QUE ESTUVO, no "hace siete días": quien
   * se saltó una semana no tiene fila la semana pasada.
   */
  select m2.liga, m2.ciclo into v_liga_ant, v_ciclo_ant
    from public.liga_membresia m2
   where m2.subject_id = p_subject
     and m2.user_id = v_uid
     and m2.ciclo < v_ciclo
   order by m2.ciclo desc
   limit 1;

  return query
  with por_ciclo as (
    select m.ciclo as c, public.liga_niveles(p_subject, m.ciclo) as niveles
      from public.liga_membresia m
     where m.subject_id = p_subject
     group by m.ciclo
  ),
  mio as (
    select r.tipo
      from public.liga_reparto r
     where r.subject_id = p_subject
       and r.ciclo = v_ciclo
       and r.user_id = v_uid
  )
  select
    coalesce((select pc.niveles from por_ciclo pc where pc.c = v_ciclo), 0)::integer,
    (select count(*) from por_ciclo pc where pc.niveles > 1 and pc.c <= v_ciclo)::integer,
    v_liga_ant,
    (case when v_ciclo_ant is null then null
          else public.liga_niveles(p_subject, v_ciclo_ant) end)::integer,
    (select mi.tipo from mio mi),
    (case when (select mi.tipo from mio mi) = 'reparto'
          then (select lc.activos
                  from public.liga_ciclo lc
                 where lc.subject_id = p_subject and lc.ciclo = v_ciclo)
     end)::integer;
end;
$$;

-- ── Permisos ────────────────────────────────────────────────────────────────
/*
 * Las siete internas, fuera del alcance de TODOS los roles de cliente,
 * incluido `authenticated`. Solo las llaman funciones security definer, que
 * corren como su dueño; ningún estudiante tiene por qué poder decir "reparte
 * esta materia".
 *
 * El revoke a `anon` y `authenticated` va explícito, no basta con `public`: en
 * Supabase los privilegios por defecto dan ejecución a esos roles al crear.
 */
revoke all on function public.liga_niveles(text, date) from public, anon, authenticated;
revoke all on function public.ligas_cerrar_ciclo(text, date, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.ligas_repartir(text, date, date, integer) from public, anon, authenticated;
revoke all on function public.ligas_abrir_elite(text, date, date) from public, anon, authenticated;
revoke all on function public.ligas_transicion(text, date, date, integer, integer) from public, anon, authenticated;
revoke all on function public.ligas_cupo(bigint) from public, anon, authenticated;
revoke all on function public.ligas_zona(bigint, bigint, bigint) from public, anon, authenticated;

/*
 * liga_contexto se recreó con drop: SIN ESTO QUEDARÍA ABIERTA A anon. Las
 * demás conservan sus grants con create or replace; se reemiten por costumbre.
 */
revoke all on function public.liga_contexto(text) from public, anon;
grant execute on function public.liga_contexto(text) to authenticated;

revoke all on function public.ligas_para(integer) from public, anon;
revoke all on function public.ligas_sembrar(text) from public, anon;
revoke all on function public.liga_entrar(text) from public, anon;
revoke all on function public.liga_tablero(text) from public, anon;
revoke all on function public.liga_resultados(text, date) from public, anon;
grant execute on function public.ligas_para(integer) to authenticated;
grant execute on function public.ligas_sembrar(text) to authenticated;
grant execute on function public.liga_entrar(text) to authenticated;
grant execute on function public.liga_tablero(text) to authenticated;
grant execute on function public.liga_resultados(text, date) to authenticated;
