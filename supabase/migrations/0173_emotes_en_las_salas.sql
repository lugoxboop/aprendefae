-- GUARDIAN: cambio de esquema a proposito
/*
 * ═══════════════════════════════════════════════════════════════════════════
 * 0173 — EMOTES EN LAS SALAS DE ENTRENAMIENTO
 *
 * Pedido de Mateo (20-nov-2026, Magno): mientras se espera en el lobby, cada
 * estudiante puede hacer un emote con su mascota, como en Fortnite, y los
 * demás lo ven. Los emotes son los doce festejos que ya bailan las mascotas
 * (FESTEJOS en src/mascota/marionetas.js: colita, baila, canta, saltitos,
 * saluda, celebra, karaoke, campeon, graduado, fiesta, globo, porra). No se
 * dibuja nada nuevo.
 *
 * Qué agrega (solo agrega):
 *   · dos columnas en entreno_jugadores: el emote y cuándo empezó;
 *   · entreno_emote(sala, emote): lo pone; uno por segundo como mucho;
 *   · los amigos de demostración hacen emotes solos de vez en cuando
 *     (sorteo estable por ventana de 6 s: no se guarda nada);
 *   · entreno_estado devuelve el emote vigente (5 s) de cada jugador.
 *
 * No toca FP, cristales, ni la Clase en vivo. Rango del coordinador.
 * ═══════════════════════════════════════════════════════════════════════════
 */

alter table public.entreno_jugadores add column if not exists emote text;
alter table public.entreno_jugadores add column if not exists emote_en timestamptz;

create or replace function public.entreno_emotes()
returns text[]
language sql immutable
as $$ select array['colita','baila','canta','saltitos','saluda','celebra','karaoke','campeon','graduado','fiesta','globo','porra'] $$;

/* El emote de un bot en esta ventana de 6 s: uno de cada tres bots, más o menos, está haciendo algo. */
create or replace function public.entreno_emote_demo(p_jugador uuid)
returns text
language sql stable
as $$
  select case when abs(hashtext(p_jugador::text || floor(extract(epoch from now()) / 6)::text)) % 3 = 0
    then (public.entreno_emotes())[1 + abs(hashtext(floor(extract(epoch from now()) / 6)::text || p_jugador::text)) % 12] end;
$$;

create or replace function public.entreno_emote(p_sala uuid, p_emote text)
returns jsonb
language plpgsql security definer set search_path = public volatile
as $$
begin
  if auth.uid() is null then raise exception 'Sin sesión' using errcode = '28000'; end if;
  if not (p_emote = any (public.entreno_emotes())) then raise exception 'Emote desconocido' using errcode = '22023'; end if;
  update public.entreno_jugadores set emote = p_emote, emote_en = now()
   where sala_id = p_sala and user_id = auth.uid() and not salio
     and (emote_en is null or emote_en < now() - interval '1 second');
  if not found and public.entreno_mi_jugador(p_sala) is null then
    raise exception 'No estás en esta sala' using errcode = '42501';
  end if;
  return public.entreno_estado(p_sala);
end;
$$;

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
            where r.sala_id = p_sala and r.jugador_id = j.id and r.ronda = s.ronda and r.indice <= v_tope and r.correcta),
        /* 0173: el emote que está haciendo ahora (5 s), y cuándo empezó, para reiniciar la animación. */
        'emote', case
          when j.demo_id is null then case when j.emote_en > now() - interval '5 seconds' then j.emote end
          when v_fase in ('lobby', 'final') then public.entreno_emote_demo(j.id) end,
        'emote_en', case
          when j.demo_id is null then case when j.emote_en > now() - interval '5 seconds' then j.emote_en end
          when v_fase in ('lobby', 'final') and public.entreno_emote_demo(j.id) is not null
            then to_timestamp(floor(extract(epoch from now()) / 6) * 6) end
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

revoke all on function public.entreno_emote(uuid, text) from public, anon;
grant execute on function public.entreno_emote(uuid, text) to authenticated;
revoke all on function public.entreno_emote_demo(uuid) from public, anon, authenticated;
revoke all on function public.entreno_estado(uuid) from public, anon;
grant execute on function public.entreno_estado(uuid) to authenticated;

/*
 * Para deshacer (solo lo nuevo): volver a aplicar entreno_estado de la 0172 y
 *   drop function if exists public.entreno_emote(uuid, text), public.entreno_emote_demo(uuid), public.entreno_emotes();
 *   alter table public.entreno_jugadores drop column if exists emote, drop column if exists emote_en;
 */
