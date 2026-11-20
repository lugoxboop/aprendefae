-- GUARDIAN: cambio de esquema a proposito
/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0172 — SALAS DE ENTRENAMIENTO: UN LOBBY CON MASCOTAS Y UNA PARTIDA ENTRE AMIGOS
 *
 * Pedido de Mateo (20-nov-2026, Magno): «salas de entrenamiento» donde los
 * estudiantes entran con su mascota a un lobby, como antes de una partida de
 * Fortnite; el creador elige la actividad (un tema de Macro o de Contabilidad)
 * y arranca. Y retar a un amigo directamente: un DUELO es una sala de dos.
 *
 * ═══════════ POR QUÉ TABLAS PROPIAS Y NO LAS DE LA CLASE EN VIVO ═══════════
 *
 * La 0159 (Clase en vivo) ya resuelve lo difícil: preguntas de los bancos del
 * Repaso, la correcta guardada aparte, el servidor califica y mide el tiempo.
 * Aquí se copia ese diseño, no sus tablas, por tres razones:
 *   · en la clase el dueño NO juega y ve la correcta antes de tiempo (es el
 *     profesor); en la sala el creador juega como uno más y no debe verla;
 *   · la clase la abre solo un docente y la usan estudiantes reales hoy: no
 *     se toca ni una línea de ella;
 *   · la sala necesita lo que la clase no tiene: lobby con mascotas, «listo»,
 *     invitaciones a amigos, rondas (otra partida con la misma gente) y los
 *     amigos de DEMOSTRACIÓN (0170) jugando como bots.
 *
 * ═══════════ LA PARTIDA AVANZA SOLA ═══════════
 *
 * El creador también está jugando, así que nadie hace de profesor:
 *   · la pregunta se cierra cuando todos respondieron o se acabó el tiempo, y
 *     la cierra CUALQUIER jugador (su celular lo pide; el servidor comprueba);
 *   · tras 7 s de resultados, cualquiera pasa a la siguiente; el creador
 *     puede adelantarla.
 * Si el creador se va, la sala pasa al jugador más antiguo.
 *
 * ═══════════ LOS AMIGOS DE DEMOSTRACIÓN JUEGAN ═══════════
 *
 * Un amigo de amigos_demo (0170) puede sentarse en la sala de SU dueño. Sus
 * respuestas se sortean al abrir cada pregunta (acierta ~70 %, tarda entre 3 s
 * y el 80 % del tiempo) y solo se ven cuando su tiempo ya pasó. Así Mateo puede
 * enseñar y probar una partida completa sin otra cuenta. Un bot no cuenta para
 * «todos respondieron».
 *
 * ═══════════ LO QUE ESTA MIGRACIÓN NO TOCA ═══════════
 *
 * Ni FP, ni racha, ni cristales, ni ligas, ni la Clase en vivo. La sala tiene
 * sus propios puntos. Premiar una partida es una decisión de la economía del
 * sitio y va aparte. Rango del coordinador (0150-0199). Solo agrega.
 * ═══════════════════════════════════════════════════════════════════════════
 */

-- ── 1. Las tablas ───────────────────────────────────────────────────────────
create table if not exists public.entreno_salas (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null check (codigo ~ '^[0-9]{6}$'),
  anfitrion   uuid not null references auth.users (id) on delete cascade,
  nombre      text not null,
  materia     text not null,
  tema        text not null,
  tema_titulo text not null,
  estado      text not null default 'lobby'
              check (estado in ('lobby', 'pregunta', 'resultados', 'final', 'cerrada')),
  ronda       integer not null default 1,
  indice      integer not null default -1,
  total       integer not null check (total between 1 and 20),
  duracion_s  integer not null default 30 check (duracion_s between 10 and 60),
  inicio      timestamptz,
  fase_desde  timestamptz not null default now(),
  creada      timestamptz not null default now(),
  cerrada_en  timestamptz
);
create unique index if not exists entreno_salas_codigo_abierta on public.entreno_salas (codigo) where estado <> 'cerrada';
create index if not exists entreno_salas_anfitrion_idx on public.entreno_salas (anfitrion, creada desc);

create table if not exists public.entreno_preguntas (
  sala_id   uuid not null references public.entreno_salas (id) on delete cascade,
  ronda     integer not null,
  indice    integer not null,
  contenido jsonb not null,
  correcta  text not null,
  primary key (sala_id, ronda, indice)
);

/* Quién está en la sala: una cuenta, o un amigo de demostración del creador. */
create table if not exists public.entreno_jugadores (
  id       uuid primary key default gen_random_uuid(),
  sala_id  uuid not null references public.entreno_salas (id) on delete cascade,
  user_id  uuid references auth.users (id) on delete cascade,
  demo_id  uuid references public.amigos_demo (id) on delete cascade,
  listo    boolean not null default false,
  salio    boolean not null default false,
  unido_en timestamptz not null default now(),
  constraint entreno_jugador_uno_u_otro check ((user_id is null) <> (demo_id is null))
);
create unique index if not exists entreno_jugadores_cuenta on public.entreno_jugadores (sala_id, user_id) where user_id is not null;
create unique index if not exists entreno_jugadores_demo   on public.entreno_jugadores (sala_id, demo_id) where demo_id is not null;
create index if not exists entreno_jugadores_user_idx on public.entreno_jugadores (user_id) where user_id is not null;

create table if not exists public.entreno_invitaciones (
  sala_id uuid not null references public.entreno_salas (id) on delete cascade,
  de      uuid not null references auth.users (id) on delete cascade,
  para    uuid not null references auth.users (id) on delete cascade,
  estado  text not null default 'pendiente' check (estado in ('pendiente', 'aceptada', 'rechazada')),
  creada  timestamptz not null default now(),
  primary key (sala_id, para)
);
create index if not exists entreno_invitaciones_para_idx on public.entreno_invitaciones (para, estado);

create table if not exists public.entreno_respuestas (
  sala_id    uuid not null references public.entreno_salas (id) on delete cascade,
  jugador_id uuid not null references public.entreno_jugadores (id) on delete cascade,
  ronda      integer not null,
  indice     integer not null,
  opcion     text not null,
  correcta   boolean not null,
  ms         integer not null,
  puntos     integer not null,
  creada     timestamptz not null default now(),
  primary key (sala_id, jugador_id, ronda, indice)
);

/* Códigos equivocados: sin esto, una cuenta probaría el millón uno por uno. */
create table if not exists public.entreno_intentos (
  user_id uuid not null references auth.users (id) on delete cascade,
  creado  timestamptz not null default now()
);
create index if not exists entreno_intentos_user_idx on public.entreno_intentos (user_id, creado desc);

alter table public.entreno_salas        enable row level security;
alter table public.entreno_preguntas    enable row level security;
alter table public.entreno_jugadores    enable row level security;
alter table public.entreno_invitaciones enable row level security;
alter table public.entreno_respuestas   enable row level security;
alter table public.entreno_intentos     enable row level security;
/* Sin políticas, a propósito: solo se entra por las funciones. */
revoke all on public.entreno_salas, public.entreno_preguntas, public.entreno_jugadores,
              public.entreno_invitaciones, public.entreno_respuestas, public.entreno_intentos
  from anon, authenticated;

comment on table public.entreno_salas is
'Salas de entrenamiento (0172): lobby con mascotas y partida de preguntas entre amigos. Puntos propios; no toca FP ni cristales.';

-- ── 2. Ayudas internas ──────────────────────────────────────────────────────
/* El jugador (de cuenta) que soy en una sala, si sigo adentro. */
create or replace function public.entreno_mi_jugador(p_sala uuid)
returns uuid
language sql security definer set search_path = public stable
as $$
  select j.id from public.entreno_jugadores j
   where j.sala_id = p_sala and j.user_id = auth.uid() and not j.salio;
$$;

/* Una sala vieja (más de 6 horas) cuenta como cerrada aunque nadie la cerrara. */
create or replace function public.entreno_fase(s public.entreno_salas)
returns text
language sql stable
as $$
  select case when s.estado <> 'cerrada' and s.creada < now() - interval '6 hours' then 'cerrada' else s.estado end;
$$;

create or replace function public.entreno_activos(p_sala uuid)
returns integer
language sql security definer set search_path = public stable
as $$
  select count(*)::integer from public.entreno_jugadores j where j.sala_id = p_sala and not j.salio;
$$;

/* Las preguntas llegan del sitio (bancos del Repaso): se validan como en la 0159. */
create or replace function public.entreno_validar_preguntas(p_preguntas jsonb)
returns integer
language plpgsql immutable
as $$
declare
  v_n integer; v_i integer; v_p jsonb; v_ids text[];
begin
  if jsonb_typeof(p_preguntas) is distinct from 'array' then raise exception 'Las preguntas tienen que llegar como lista' using errcode = '22023'; end if;
  v_n := jsonb_array_length(p_preguntas);
  if v_n < 1 or v_n > 20 then raise exception 'Entre 1 y 20 preguntas (llegaron %)', v_n using errcode = '22023'; end if;
  for v_i in 0 .. v_n - 1 loop
    v_p := p_preguntas -> v_i;
    if coalesce(btrim(v_p ->> 'enunciado'), '') = '' then raise exception 'La pregunta % no tiene enunciado', v_i + 1 using errcode = '22023'; end if;
    if jsonb_typeof(v_p -> 'opciones') is distinct from 'array' or jsonb_array_length(v_p -> 'opciones') not between 2 and 8 then
      raise exception 'La pregunta % necesita entre 2 y 8 opciones', v_i + 1 using errcode = '22023';
    end if;
    select array_agg(o ->> 'id') into v_ids from jsonb_array_elements(v_p -> 'opciones') o;
    if (select count(distinct x) from unnest(v_ids) x) <> array_length(v_ids, 1)
       or exists (select 1 from unnest(v_ids) x where coalesce(x, '') = '') then
      raise exception 'La pregunta % tiene opciones sin id o con el id repetido', v_i + 1 using errcode = '22023';
    end if;
    if not ((v_p ->> 'correcta') = any (v_ids)) then
      raise exception 'La correcta de la pregunta % no está entre sus opciones', v_i + 1 using errcode = '22023';
    end if;
  end loop;
  return v_n;
end;
$$;

/* Guarda las preguntas de una ronda: solo lo que se pinta (nada que identifique el ítem del banco). */
create or replace function public.entreno_guardar_preguntas(p_sala uuid, p_ronda integer, p_preguntas jsonb)
returns void
language sql security definer set search_path = public volatile
as $$
  insert into public.entreno_preguntas (sala_id, ronda, indice, contenido, correcta)
  select p_sala, p_ronda, (e.ord - 1)::integer,
         jsonb_strip_nulls(jsonb_build_object(
           'enunciado', e.p -> 'enunciado', 'pregunta', e.p -> 'pregunta', 'rotulo', e.p -> 'rotulo',
           'subtema', e.p -> 'subtema', 'detalle', e.p -> 'detalle',
           'opciones', (select jsonb_agg(jsonb_build_object('id', o -> 'id', 'texto', o -> 'texto') order by k)
                          from jsonb_array_elements(e.p -> 'opciones') with ordinality as x(o, k)))),
         e.p ->> 'correcta'
    from jsonb_array_elements(p_preguntas) with ordinality as e(p, ord);
$$;

/* Los bots sortean su respuesta al abrir la pregunta. Se ve cuando pasa su tiempo. */
create or replace function public.entreno_respuestas_demo(p_sala uuid)
returns void
language plpgsql security definer set search_path = public volatile
as $$
declare
  s public.entreno_salas; v_preg public.entreno_preguntas; j record;
  v_ok boolean; v_ms integer; v_op text;
begin
  select * into s from public.entreno_salas where id = p_sala;
  select * into v_preg from public.entreno_preguntas q where q.sala_id = p_sala and q.ronda = s.ronda and q.indice = s.indice;
  if v_preg.sala_id is null then return; end if;
  for j in select id from public.entreno_jugadores where sala_id = p_sala and demo_id is not null and not salio loop
    v_ok := random() < 0.7;
    v_ms := (3000 + floor(random() * greatest(1000, s.duracion_s * 800 - 3000)))::integer;
    if v_ok then v_op := v_preg.correcta;
    else
      select o ->> 'id' into v_op from jsonb_array_elements(v_preg.contenido -> 'opciones') o
       where o ->> 'id' <> v_preg.correcta order by random() limit 1;
    end if;
    insert into public.entreno_respuestas (sala_id, jugador_id, ronda, indice, opcion, correcta, ms, puntos)
    values (p_sala, j.id, s.ronda, s.indice, v_op, v_ok, v_ms,
            case when v_ok then 700 + round(300 * (1 - v_ms::numeric / (s.duracion_s * 1000)))::integer else 0 end)
    on conflict do nothing;
  end loop;
end;
$$;

-- ── 3. El estado de la sala, de un viaje ────────────────────────────────────
/*
 * Lo ve quien está adentro, y también quien tiene una invitación pendiente
 * (para asomarse al lobby antes de entrar). La correcta solo sale cuando la
 * pregunta ya se cerró: el creador NO tiene privilegio, juega como uno más.
 * Los puntos de cada uno cuentan hasta la última pregunta cerrada.
 */
create or replace function public.entreno_estado(p_sala uuid)
returns jsonb
language plpgsql security definer set search_path = public stable
as $$
declare
  s        public.entreno_salas;
  v_uid    uuid := auth.uid();
  v_yo     uuid;
  v_fase   text;
  v_tope   integer;
  v_trans  integer := 0;
  v_preg   public.entreno_preguntas;
  v_mia    public.entreno_respuestas;
  v_ver    boolean;
  v_jug    jsonb;
  v_inv    jsonb;
begin
  if v_uid is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select * into s from public.entreno_salas where id = p_sala;
  if not found then raise exception 'La sala no existe' using errcode = 'P0002'; end if;
  v_yo := public.entreno_mi_jugador(p_sala);
  if v_yo is null and not exists (
       select 1 from public.entreno_invitaciones i where i.sala_id = p_sala and i.para = v_uid and i.estado <> 'rechazada') then
    raise exception 'No estás en esta sala' using errcode = '42501';
  end if;

  v_fase := public.entreno_fase(s);
  v_tope := case when v_fase = 'pregunta' then s.indice - 1 else s.indice end;
  if s.inicio is not null then v_trans := floor(extract(epoch from (now() - s.inicio)) * 1000)::integer; end if;
  v_ver := v_fase in ('resultados', 'final');

  if v_fase in ('pregunta', 'resultados') and now() >= s.inicio then
    select * into v_preg from public.entreno_preguntas q where q.sala_id = p_sala and q.ronda = s.ronda and q.indice = s.indice;
  end if;
  if v_yo is not null then
    select * into v_mia from public.entreno_respuestas r
     where r.sala_id = p_sala and r.jugador_id = v_yo and r.ronda = s.ronda and r.indice = s.indice;
  end if;

  select coalesce(jsonb_agg(t.j order by t.orden), '[]'::jsonb) into v_jug
    from (
      select j.unido_en as orden, jsonb_build_object(
        'id', j.id,
        'demo', j.demo_id is not null,
        'soy_yo', j.id = v_yo,
        'anfitrion', j.user_id = s.anfitrion,
        'listo', j.listo or j.demo_id is not null or j.user_id = s.anfitrion,
        'apodo', coalesce(nullif(btrim(coalesce(p.nickname, d.apodo)), ''), 'Estudiante'),
        'mascota_especie', coalesce(p.mascota_especie, d.mascota_especie),
        'mascota_paleta', coalesce(p.mascota_paleta, d.mascota_paleta),
        'mascota_ojos', coalesce(p.mascota_ojos, d.mascota_ojos),
        'mascota_nombre', coalesce(p.mascota_nombre, d.mascota_nombre),
        'mascota_puestos', coalesce(p.mascota_puestos, d.mascota_puestos, '{}'::text[]),
        'respondio', v_fase = 'pregunta' and exists (
           select 1 from public.entreno_respuestas r
            where r.sala_id = p_sala and r.jugador_id = j.id and r.ronda = s.ronda and r.indice = s.indice and r.ms <= v_trans),
        'acerto', case when v_ver then (select r.correcta from public.entreno_respuestas r
            where r.sala_id = p_sala and r.jugador_id = j.id and r.ronda = s.ronda and r.indice = s.indice) end,
        'puntos', (select coalesce(sum(r.puntos), 0) from public.entreno_respuestas r
            where r.sala_id = p_sala and r.jugador_id = j.id and r.ronda = s.ronda and r.indice <= v_tope),
        'aciertos', (select count(*) from public.entreno_respuestas r
            where r.sala_id = p_sala and r.jugador_id = j.id and r.ronda = s.ronda and r.indice <= v_tope and r.correcta)
      ) as j
        from public.entreno_jugadores j
        left join public.profiles p on p.user_id = j.user_id
        left join public.amigos_demo d on d.id = j.demo_id
       where j.sala_id = p_sala and not j.salio
    ) t;

  /* Los invitados que aún no entran: en el lobby son los puestos «esperando…». */
  select coalesce(jsonb_agg(jsonb_build_object(
           'user_id', i.para,
           'apodo', coalesce(nullif(btrim(p.nickname), ''), 'Estudiante'),
           'mascota_especie', p.mascota_especie, 'mascota_paleta', p.mascota_paleta,
           'mascota_ojos', p.mascota_ojos, 'mascota_puestos', coalesce(p.mascota_puestos, '{}'::text[])
         ) order by i.creada), '[]'::jsonb) into v_inv
    from public.entreno_invitaciones i
    left join public.profiles p on p.user_id = i.para
   where i.sala_id = p_sala and i.estado = 'pendiente'
     and not exists (select 1 from public.entreno_jugadores j where j.sala_id = p_sala and j.user_id = i.para and not j.salio);

  return jsonb_build_object(
    'sala_id', s.id, 'codigo', s.codigo, 'nombre', s.nombre,
    'materia', s.materia, 'tema', s.tema, 'tema_titulo', s.tema_titulo,
    'estado', v_fase, 'ronda', s.ronda, 'indice', s.indice, 'total', s.total,
    'duracion_s', s.duracion_s, 'inicio', s.inicio, 'fase_desde', s.fase_desde, 'ahora', now(),
    'soy_anfitrion', s.anfitrion = v_uid,
    'dentro', v_yo is not null,
    'jugadores', v_jug,
    'invitados', v_inv,
    'pregunta', case when v_preg.sala_id is null then null else v_preg.contenido end,
    'correcta', case when v_preg.sala_id is not null and v_ver then v_preg.correcta end,
    'mi_respuesta', case when v_mia.sala_id is null then null else jsonb_build_object(
      'opcion', v_mia.opcion,
      'correcta', case when v_ver then v_mia.correcta end,
      'puntos', case when v_ver then v_mia.puntos end) end
  );
end;
$$;

-- ── 4. Crear la sala (con su actividad, sus invitados y sus bots) ───────────
/*
 * p_invitar: cuentas a invitar; solo cuentan las que son tus amigos (0164).
 * p_demos:   amigos de demostración TUYOS (0170) que entran ya sentados.
 * Cierra cualquier otra sala abierta tuya: se organiza una a la vez.
 */
create or replace function public.entreno_crear(
  p_nombre text, p_materia text, p_tema text, p_tema_titulo text, p_duracion integer,
  p_preguntas jsonb, p_invitar uuid[] default '{}', p_demos uuid[] default '{}'
)
returns jsonb
language plpgsql security definer set search_path = public volatile
as $$
declare
  v_uid uuid := auth.uid();
  v_n integer; v_codigo text; v_sala uuid; v_intento integer := 0; v_apodo text;
begin
  if v_uid is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  if (select count(*) from public.entreno_salas where anfitrion = v_uid and creada > now() - interval '1 hour') >= 20 then
    raise exception 'Creaste demasiadas salas seguidas. Espera un momento.' using errcode = '54000';
  end if;
  v_n := public.entreno_validar_preguntas(p_preguntas);

  update public.entreno_salas set estado = 'cerrada', cerrada_en = now() where anfitrion = v_uid and estado <> 'cerrada';

  loop
    v_intento := v_intento + 1;
    v_codigo := lpad((floor(random() * 1000000))::integer::text, 6, '0');
    exit when not exists (select 1 from public.entreno_salas where codigo = v_codigo and estado <> 'cerrada');
    if v_intento > 50 then raise exception 'No se encontró un código libre' using errcode = '55000'; end if;
  end loop;

  select nullif(btrim(nickname), '') into v_apodo from public.profiles where user_id = v_uid;
  insert into public.entreno_salas (codigo, anfitrion, nombre, materia, tema, tema_titulo, total, duracion_s)
  values (v_codigo, v_uid,
          left(coalesce(nullif(btrim(p_nombre), ''), 'Sala de ' || coalesce(v_apodo, 'entrenamiento')), 60),
          left(coalesce(p_materia, ''), 60), left(coalesce(p_tema, ''), 80),
          left(coalesce(nullif(btrim(p_tema_titulo), ''), p_tema, ''), 120), v_n,
          least(60, greatest(10, coalesce(p_duracion, 30))))
  returning id into v_sala;

  perform public.entreno_guardar_preguntas(v_sala, 1, p_preguntas);
  insert into public.entreno_jugadores (sala_id, user_id, listo) values (v_sala, v_uid, true);
  perform public.entreno_invitar(v_sala, p_invitar, p_demos);
  return public.entreno_estado(v_sala);
end;
$$;

/* Invitar a más amigos (y sentar bots) mientras la sala está en el lobby. Máximo 12 en la sala. */
create or replace function public.entreno_invitar(p_sala uuid, p_invitar uuid[] default '{}', p_demos uuid[] default '{}')
returns jsonb
language plpgsql security definer set search_path = public volatile
as $$
declare
  s public.entreno_salas; v_uid uuid := auth.uid(); x uuid;
begin
  if v_uid is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select * into s from public.entreno_salas where id = p_sala for update;
  if not found or s.anfitrion <> v_uid then raise exception 'Solo quien creó la sala invita' using errcode = '42501'; end if;
  if public.entreno_fase(s) <> 'lobby' then raise exception 'Solo se invita en el lobby' using errcode = '55000'; end if;

  foreach x in array coalesce(p_invitar, '{}') loop
    exit when (select count(*) from public.entreno_invitaciones where sala_id = p_sala and estado = 'pendiente') + public.entreno_activos(p_sala) >= 12;
    if x <> v_uid and public.son_amigos(v_uid, x) then
      insert into public.entreno_invitaciones (sala_id, de, para) values (p_sala, v_uid, x)
      on conflict (sala_id, para) do update set estado = 'pendiente', creada = now()
        where public.entreno_invitaciones.estado = 'rechazada';
    end if;
  end loop;

  foreach x in array coalesce(p_demos, '{}') loop
    exit when public.entreno_activos(p_sala) >= 12;
    if exists (select 1 from public.amigos_demo d where d.id = x and d.dueno = v_uid) then
      insert into public.entreno_jugadores (sala_id, demo_id, listo) values (p_sala, x, true)
      on conflict (sala_id, demo_id) where demo_id is not null do update set salio = false;
    end if;
  end loop;
  return public.entreno_estado(p_sala);
end;
$$;

-- ── 5. Entrar, responder a una invitación, estar listo, salir ───────────────
create or replace function public.entreno_sentar(p_sala uuid)
returns void
language plpgsql security definer set search_path = public volatile
as $$
declare s public.entreno_salas;
begin
  select * into s from public.entreno_salas where id = p_sala for update;
  if exists (select 1 from public.entreno_jugadores j where j.sala_id = p_sala and j.user_id = auth.uid() and not j.salio) then return; end if;
  if public.entreno_fase(s) <> 'lobby' then raise exception 'La partida ya empezó' using errcode = '55000'; end if;
  if public.entreno_activos(p_sala) >= 12 then raise exception 'La sala está llena' using errcode = '55000'; end if;
  insert into public.entreno_jugadores (sala_id, user_id) values (p_sala, auth.uid())
  on conflict (sala_id, user_id) where user_id is not null do update set salio = false, listo = false, unido_en = now();
  update public.entreno_invitaciones set estado = 'aceptada' where sala_id = p_sala and para = auth.uid();
end;
$$;

/* Entrar desde una invitación. */
create or replace function public.entreno_entrar(p_sala uuid)
returns jsonb
language plpgsql security definer set search_path = public volatile
as $$
begin
  if auth.uid() is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  if not exists (select 1 from public.entreno_invitaciones i where i.sala_id = p_sala and i.para = auth.uid())
     and not exists (select 1 from public.entreno_jugadores j where j.sala_id = p_sala and j.user_id = auth.uid()) then
    raise exception 'No tienes invitación a esta sala' using errcode = '42501';
  end if;
  perform public.entreno_sentar(p_sala);
  return public.entreno_estado(p_sala);
end;
$$;

/* Entrar con el código que te pasaron. Un código que no existe llega como dato (así se anota el intento). */
create or replace function public.entreno_unirse(p_codigo text)
returns jsonb
language plpgsql security definer set search_path = public volatile
as $$
declare v_uid uuid := auth.uid(); v_sala uuid;
begin
  if v_uid is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  if (select count(*) from public.entreno_intentos i where i.user_id = v_uid and i.creado > now() - interval '10 minutes') >= 10 then
    raise exception 'Demasiados códigos equivocados. Espera unos minutos.' using errcode = '54000';
  end if;
  select id into v_sala from public.entreno_salas
   where codigo = regexp_replace(coalesce(p_codigo, ''), '\D', '', 'g')
     and estado <> 'cerrada' and creada > now() - interval '6 hours'
   order by creada desc limit 1;
  if v_sala is null then
    insert into public.entreno_intentos (user_id) values (v_uid);
    return jsonb_build_object('error', 'codigo');
  end if;
  perform public.entreno_sentar(v_sala);
  return public.entreno_estado(v_sala);
end;
$$;

create or replace function public.entreno_rechazar(p_sala uuid)
returns jsonb
language sql security definer set search_path = public volatile
as $$
  update public.entreno_invitaciones set estado = 'rechazada' where sala_id = p_sala and para = auth.uid() and estado = 'pendiente';
  select jsonb_build_object('ok', true);
$$;

create or replace function public.entreno_listo(p_sala uuid, p_listo boolean)
returns jsonb
language plpgsql security definer set search_path = public volatile
as $$
begin
  update public.entreno_jugadores set listo = coalesce(p_listo, true)
   where sala_id = p_sala and user_id = auth.uid() and not salio;
  if not found then raise exception 'No estás en esta sala' using errcode = '42501'; end if;
  return public.entreno_estado(p_sala);
end;
$$;

/*
 * Salir. No se borra nada: se marca. Si sale el creador, la sala pasa al
 * jugador de cuenta más antiguo; si no queda ninguno, se cierra.
 */
create or replace function public.entreno_salir(p_sala uuid)
returns jsonb
language plpgsql security definer set search_path = public volatile
as $$
declare s public.entreno_salas; v_nuevo uuid;
begin
  if auth.uid() is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select * into s from public.entreno_salas where id = p_sala for update;
  if not found then return jsonb_build_object('ok', true); end if;
  update public.entreno_jugadores set salio = true where sala_id = p_sala and user_id = auth.uid();
  if s.anfitrion = auth.uid() and s.estado <> 'cerrada' then
    select j.user_id into v_nuevo from public.entreno_jugadores j
     where j.sala_id = p_sala and j.user_id is not null and not j.salio order by j.unido_en limit 1;
    if v_nuevo is null then
      update public.entreno_salas set estado = 'cerrada', cerrada_en = now() where id = p_sala;
    else
      update public.entreno_salas set anfitrion = v_nuevo where id = p_sala;
      /* Los bots eran amigos de demostración del creador que se fue: se van con él. */
      update public.entreno_jugadores set salio = true where sala_id = p_sala and demo_id is not null;
    end if;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- ── 6. Cambiar la actividad / otra partida con la misma gente ───────────────
/* Solo el creador, en el lobby o en el podio. Abre una ronda nueva: lo anterior se queda como estaba. */
create or replace function public.entreno_actividad(
  p_sala uuid, p_materia text, p_tema text, p_tema_titulo text, p_duracion integer, p_preguntas jsonb
)
returns jsonb
language plpgsql security definer set search_path = public volatile
as $$
declare s public.entreno_salas; v_n integer;
begin
  if auth.uid() is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select * into s from public.entreno_salas where id = p_sala for update;
  if not found or s.anfitrion <> auth.uid() then raise exception 'Solo quien creó la sala elige la actividad' using errcode = '42501'; end if;
  if public.entreno_fase(s) not in ('lobby', 'final') then raise exception 'La actividad se cambia en el lobby' using errcode = '55000'; end if;
  v_n := public.entreno_validar_preguntas(p_preguntas);
  update public.entreno_salas
     set ronda = s.ronda + 1, estado = 'lobby', indice = -1, inicio = null, fase_desde = now(), total = v_n,
         materia = left(coalesce(p_materia, s.materia), 60), tema = left(coalesce(p_tema, s.tema), 80),
         tema_titulo = left(coalesce(nullif(btrim(p_tema_titulo), ''), p_tema, s.tema_titulo), 120),
         duracion_s = least(60, greatest(10, coalesce(p_duracion, s.duracion_s)))
   where id = p_sala;
  perform public.entreno_guardar_preguntas(p_sala, s.ronda + 1, p_preguntas);
  update public.entreno_jugadores set listo = false where sala_id = p_sala and user_id is not null and user_id <> s.anfitrion;
  return public.entreno_estado(p_sala);
end;
$$;

-- ── 7. Responder ────────────────────────────────────────────────────────────
create or replace function public.entreno_responder(p_sala uuid, p_indice integer, p_opcion text)
returns jsonb
language plpgsql security definer set search_path = public volatile
as $$
declare
  s public.entreno_salas; v_yo uuid; v_preg public.entreno_preguntas; v_ms integer; v_ok boolean; v_pts integer; v_n integer;
begin
  if auth.uid() is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select * into s from public.entreno_salas where id = p_sala for share;
  if not found then raise exception 'La sala no existe' using errcode = 'P0002'; end if;
  v_yo := public.entreno_mi_jugador(p_sala);
  if v_yo is null then raise exception 'No estás en esta sala' using errcode = '42501'; end if;
  if public.entreno_fase(s) <> 'pregunta' or s.indice <> p_indice or now() < s.inicio then
    return jsonb_build_object('aceptada', false, 'motivo', 'cerrada');
  end if;
  v_ms := floor(extract(epoch from (now() - s.inicio)) * 1000)::integer;
  if v_ms > (s.duracion_s + 2) * 1000 then return jsonb_build_object('aceptada', false, 'motivo', 'tiempo'); end if;
  select * into v_preg from public.entreno_preguntas q where q.sala_id = p_sala and q.ronda = s.ronda and q.indice = p_indice;
  if not exists (select 1 from jsonb_array_elements(v_preg.contenido -> 'opciones') o where o ->> 'id' = p_opcion) then
    return jsonb_build_object('aceptada', false, 'motivo', 'opcion');
  end if;
  v_ok := p_opcion = v_preg.correcta;
  v_ms := greatest(0, least(v_ms, s.duracion_s * 1000));
  v_pts := case when v_ok then 700 + round(300 * (1 - v_ms::numeric / (s.duracion_s * 1000)))::integer else 0 end;
  insert into public.entreno_respuestas (sala_id, jugador_id, ronda, indice, opcion, correcta, ms, puntos)
  values (p_sala, v_yo, s.ronda, p_indice, p_opcion, v_ok, v_ms, v_pts)
  on conflict do nothing;
  get diagnostics v_n = row_count;
  return jsonb_build_object('aceptada', v_n = 1, 'motivo', case when v_n = 1 then null else 'repetida' end);
end;
$$;

-- ── 8. Mover la partida ─────────────────────────────────────────────────────
/*
 *   empezar     el creador, desde el lobby, con al menos 2 en la sala.
 *               La primera pregunta abre 4 s después: la cuenta atrás.
 *   resultados  cualquiera adentro, cuando todos (de cuenta) respondieron o
 *               se acabó el tiempo. Antes de eso no hace nada.
 *   siguiente   el creador desde resultados; los demás, pasados 7 s.
 *   cerrar      el creador.
 */
create or replace function public.entreno_avanzar(p_sala uuid, p_accion text)
returns jsonb
language plpgsql security definer set search_path = public volatile
as $$
declare
  s public.entreno_salas; v_uid uuid := auth.uid(); v_host boolean; v_fase text; v_faltan integer;
begin
  if v_uid is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  select * into s from public.entreno_salas where id = p_sala for update;
  if not found then raise exception 'La sala no existe' using errcode = 'P0002'; end if;
  v_host := s.anfitrion = v_uid;
  if not v_host and public.entreno_mi_jugador(p_sala) is null then raise exception 'No estás en esta sala' using errcode = '42501'; end if;
  v_fase := public.entreno_fase(s);
  if v_fase = 'cerrada' then return public.entreno_estado(p_sala); end if;

  if p_accion = 'empezar' then
    if not v_host then raise exception 'Solo quien creó la sala la empieza' using errcode = '42501'; end if;
    if v_fase <> 'lobby' then return public.entreno_estado(p_sala); end if;
    if public.entreno_activos(p_sala) < 2 then raise exception 'Hace falta al menos otro jugador' using errcode = '55000'; end if;
    update public.entreno_salas set estado = 'pregunta', indice = 0, inicio = now() + interval '4 seconds', fase_desde = now() where id = p_sala;
    perform public.entreno_respuestas_demo(p_sala);

  elsif p_accion = 'resultados' then
    if v_fase = 'pregunta' and now() >= s.inicio then
      select count(*) into v_faltan from public.entreno_jugadores j
       where j.sala_id = p_sala and j.user_id is not null and not j.salio
         and not exists (select 1 from public.entreno_respuestas r
                          where r.sala_id = p_sala and r.jugador_id = j.id and r.ronda = s.ronda and r.indice = s.indice);
      if v_faltan = 0 or now() >= s.inicio + make_interval(secs => s.duracion_s + 1) then
        update public.entreno_salas set estado = 'resultados', fase_desde = now() where id = p_sala;
      end if;
    end if;

  elsif p_accion = 'siguiente' then
    if v_fase = 'resultados' and (v_host or now() >= s.fase_desde + interval '7 seconds') then
      if s.indice + 1 >= s.total then
        update public.entreno_salas set estado = 'final', fase_desde = now() where id = p_sala;
      else
        update public.entreno_salas set estado = 'pregunta', indice = s.indice + 1, inicio = now() + interval '1 second', fase_desde = now() where id = p_sala;
        perform public.entreno_respuestas_demo(p_sala);
      end if;
    end if;

  elsif p_accion = 'cerrar' then
    if not v_host then raise exception 'Solo quien creó la sala la cierra' using errcode = '42501'; end if;
    update public.entreno_salas set estado = 'cerrada', cerrada_en = now() where id = p_sala;
  else
    raise exception 'Acción desconocida: %', p_accion using errcode = '22023';
  end if;
  return public.entreno_estado(p_sala);
end;
$$;

-- ── 9. Mis salas: invitaciones que me esperan y la sala donde estoy ─────────
create or replace function public.entreno_mis_salas()
returns jsonb
language plpgsql security definer set search_path = public stable
as $$
declare v_uid uuid := auth.uid(); v_inv jsonb; v_act jsonb;
begin
  if v_uid is null then return jsonb_build_object('invitaciones', '[]'::jsonb, 'actual', null); end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'sala_id', s.id, 'nombre', s.nombre, 'tema_titulo', s.tema_titulo, 'materia', s.materia,
           'total', s.total, 'estado', s.estado, 'jugadores', public.entreno_activos(s.id),
           'de', jsonb_build_object('apodo', coalesce(nullif(btrim(p.nickname), ''), 'Un amigo'),
                   'mascota_especie', p.mascota_especie, 'mascota_paleta', p.mascota_paleta,
                   'mascota_ojos', p.mascota_ojos, 'mascota_puestos', coalesce(p.mascota_puestos, '{}'::text[])),
           'duelo', public.entreno_activos(s.id) + (select count(*) from public.entreno_invitaciones i2 where i2.sala_id = s.id and i2.estado = 'pendiente') <= 2
         ) order by i.creada desc), '[]'::jsonb) into v_inv
    from public.entreno_invitaciones i
    join public.entreno_salas s on s.id = i.sala_id
    left join public.profiles p on p.user_id = s.anfitrion
   where i.para = v_uid and i.estado = 'pendiente'
     and s.estado = 'lobby' and s.creada > now() - interval '6 hours'
     and not exists (select 1 from public.entreno_jugadores j where j.sala_id = s.id and j.user_id = v_uid and not j.salio);

  select jsonb_build_object('sala_id', s.id, 'nombre', s.nombre, 'estado', s.estado, 'tema_titulo', s.tema_titulo,
                            'soy_anfitrion', s.anfitrion = v_uid, 'jugadores', public.entreno_activos(s.id)) into v_act
    from public.entreno_jugadores j join public.entreno_salas s on s.id = j.sala_id
   where j.user_id = v_uid and not j.salio and s.estado <> 'cerrada' and s.creada > now() - interval '6 hours'
   order by s.creada desc limit 1;

  return jsonb_build_object('invitaciones', v_inv, 'actual', v_act);
end;
$$;

-- ── 10. Permisos ────────────────────────────────────────────────────────────
revoke all on function public.entreno_mi_jugador(uuid) from public, anon, authenticated;
revoke all on function public.entreno_activos(uuid) from public, anon, authenticated;
revoke all on function public.entreno_guardar_preguntas(uuid, integer, jsonb) from public, anon, authenticated;
revoke all on function public.entreno_respuestas_demo(uuid) from public, anon, authenticated;
revoke all on function public.entreno_sentar(uuid) from public, anon, authenticated;

revoke all on function public.entreno_estado(uuid) from public, anon;
revoke all on function public.entreno_crear(text, text, text, text, integer, jsonb, uuid[], uuid[]) from public, anon;
revoke all on function public.entreno_invitar(uuid, uuid[], uuid[]) from public, anon;
revoke all on function public.entreno_entrar(uuid) from public, anon;
revoke all on function public.entreno_unirse(text) from public, anon;
revoke all on function public.entreno_rechazar(uuid) from public, anon;
revoke all on function public.entreno_listo(uuid, boolean) from public, anon;
revoke all on function public.entreno_salir(uuid) from public, anon;
revoke all on function public.entreno_actividad(uuid, text, text, text, integer, jsonb) from public, anon;
revoke all on function public.entreno_responder(uuid, integer, text) from public, anon;
revoke all on function public.entreno_avanzar(uuid, text) from public, anon;
revoke all on function public.entreno_mis_salas() from public, anon;

grant execute on function public.entreno_estado(uuid) to authenticated;
grant execute on function public.entreno_crear(text, text, text, text, integer, jsonb, uuid[], uuid[]) to authenticated;
grant execute on function public.entreno_invitar(uuid, uuid[], uuid[]) to authenticated;
grant execute on function public.entreno_entrar(uuid) to authenticated;
grant execute on function public.entreno_unirse(text) to authenticated;
grant execute on function public.entreno_rechazar(uuid) to authenticated;
grant execute on function public.entreno_listo(uuid, boolean) to authenticated;
grant execute on function public.entreno_salir(uuid) to authenticated;
grant execute on function public.entreno_actividad(uuid, text, text, text, integer, jsonb) to authenticated;
grant execute on function public.entreno_responder(uuid, integer, text) to authenticated;
grant execute on function public.entreno_avanzar(uuid, text) to authenticated;
grant execute on function public.entreno_mis_salas() to authenticated;

/*
 * Para deshacer (solo lo nuevo; no toca nada de estudiantes ni de la 0159):
 *   drop function if exists public.entreno_mis_salas(), public.entreno_avanzar(uuid, text),
 *     public.entreno_responder(uuid, integer, text), public.entreno_actividad(uuid, text, text, text, integer, jsonb),
 *     public.entreno_salir(uuid), public.entreno_listo(uuid, boolean), public.entreno_rechazar(uuid),
 *     public.entreno_unirse(text), public.entreno_entrar(uuid), public.entreno_sentar(uuid),
 *     public.entreno_invitar(uuid, uuid[], uuid[]), public.entreno_crear(text, text, text, text, integer, jsonb, uuid[], uuid[]),
 *     public.entreno_estado(uuid), public.entreno_respuestas_demo(uuid), public.entreno_guardar_preguntas(uuid, integer, jsonb),
 *     public.entreno_validar_preguntas(jsonb), public.entreno_activos(uuid), public.entreno_fase(public.entreno_salas),
 *     public.entreno_mi_jugador(uuid);
 *   drop table if exists public.entreno_intentos, public.entreno_respuestas, public.entreno_invitaciones,
 *     public.entreno_jugadores, public.entreno_preguntas, public.entreno_salas;
 */
